# August 2026 Website Special Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reactivate July's website-plan promotion as an August special that expires August 31, 2026 at 11:59:59 PM Central Time.

**Architecture:** Keep the current single-page promotion markup and `promo-over` expiration behavior. Extend the existing Playwright QA harness with a fixed browser clock so one check can verify both the active August state and the expired September state without depending on the real date.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js CommonJS, Playwright Chromium.

## Global Constraints

- WebCare Select design is $100 instead of $200 during the promotion.
- WebCare Gold and WebCare Ultra waive the $200 design fee during the promotion.
- Every plan retains its existing one-year price lock.
- The promotion ends August 31, 2026 at 11:59:59 PM Central Time (`2026-09-01T04:59:59Z`).
- Do not change plan prices, Stripe checkout links, calls to action, or visual styling.
- After expiration, hide the banner and countdown and show the standard $200 design price through the existing `promo-over` rules.

---

### Task 1: Reactivate and verify the August promotion

**Files:**
- Modify: `_qa/check.cjs:8-30, 33-end`
- Modify: `index.html:521-524, 1157-1161`
- Verify: `docs/superpowers/specs/2026-08-05-august-special-design.md`

**Interfaces:**
- Consumes: the existing `loadPage(options)` Playwright helper and the page's `promo-over` class behavior.
- Produces: `loadPage({ now })`, where `now` is an optional ISO timestamp used as the browser's fixed current time; a `promo` QA command; August promotion copy and deadline in `index.html`.

- [x] **Step 1: Add the failing August promotion check**

Extend `loadPage` to accept `now` and install a fixed browser clock before navigation:

```js
async function loadPage({
  width = 1440,
  height = 900,
  reduce = false,
  noFx = false,
  now = null,
} = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  if (now) {
    await page.addInitScript((fixedNow) => {
      const NativeDate = Date;
      window.Date = class extends NativeDate {
        constructor(...args) {
          super(...(args.length ? args : [fixedNow]));
        }
        static now() {
          return fixedNow;
        }
      };
    }, Date.parse(now));
  }
  if (reduce) await page.emulateMedia({ reducedMotion: "reduce" });
  if (noFx) {
    await page.addInitScript(() => {
      Object.defineProperty(HTMLCanvasElement.prototype, "getContext", { value: () => null });
    });
  }
  await page.setViewportSize({ width, height });
  await page.goto(ROOT, { waitUntil: "networkidle" });
  await page.waitForTimeout(450);
  return { browser, page, errors };
}
```

Add this entry to `checks`:

```js
promo: async () => {
  const activeLoad = await loadPage({ now: "2026-08-15T17:00:00Z" });
  const active = await activeLoad.page.evaluate(() => ({
    expired: document.documentElement.classList.contains("promo-over"),
    banner: document.querySelector(".promo-bar").textContent.replace(/\s+/g, " ").trim(),
    bannerDisplay: getComputedStyle(document.querySelector(".promo-bar")).display,
    clockDisplay: getComputedStyle(document.querySelector(".deal-bar")).display,
    discounts: Array.from(document.querySelectorAll(".design-row .now"), (el) => el.textContent.trim()),
  }));
  await activeLoad.browser.close();

  const expiredLoad = await loadPage({ now: "2026-09-01T05:00:00Z" });
  const expired = await expiredLoad.page.evaluate(() => ({
    expired: document.documentElement.classList.contains("promo-over"),
    bannerDisplay: getComputedStyle(document.querySelector(".promo-bar")).display,
    clockDisplay: getComputedStyle(document.querySelector(".deal-bar")).display,
    promoPricesHidden: Array.from(
      document.querySelectorAll(".design-row .now"),
      (el) => getComputedStyle(el).display === "none",
    ).every(Boolean),
    standardPrices: Array.from(document.querySelectorAll(".design-row .was"), (el) => ({
      text: el.textContent.trim(),
      decoration: getComputedStyle(el).textDecorationLine,
    })),
  }));
  await expiredLoad.browser.close();

  const activeOk =
    !active.expired &&
    active.bannerDisplay !== "none" &&
    active.clockDisplay !== "none" &&
    /August special/i.test(active.banner) &&
    /ends August 31/i.test(active.banner) &&
    active.discounts.join("|") === "$100|FREE|FREE" &&
    activeLoad.errors.length === 0;
  const expiredOk =
    expired.expired &&
    expired.bannerDisplay === "none" &&
    expired.clockDisplay === "none" &&
    expired.promoPricesHidden &&
    expired.standardPrices.every((price) => price.text === "$200" && price.decoration === "none") &&
    expiredLoad.errors.length === 0;

  console.log("August promotion active:", activeOk, active);
  console.log("August promotion expired:", expiredOk, expired);
  if (!activeOk || !expiredOk) process.exitCode = 1;
},
```

- [x] **Step 2: Run the new check and verify it fails for the expired July campaign**

Run:

```powershell
node _qa/check.cjs promo
```

Expected: FAIL because the August 15 browser state has `promo-over`, and the banner still says `July 31` rather than `August special` and `August 31`.

- [x] **Step 3: Make the minimal August campaign update**

In both repeated banner sequences in `index.html`, replace the campaign copy with:

```html
<span>🎁 August special — <b>FREE $200 design</b> with Gold &amp; Ultra</span><span>⏳ $100 off design on Select — ends August 31</span><span>🔒 1-year price lock on every plan</span>
```

Update the countdown comment and deadline:

```js
/* August-special countdown — real deadline (Aug 31, 11:59:59pm Central). When it passes,
   promo UI hides itself and standard $200 design pricing shows. */
(function(){
  var END=new Date('2026-09-01T04:59:59Z');
```

- [x] **Step 4: Run the promotion check and verify both time states pass**

Run:

```powershell
node _qa/check.cjs promo
```

Expected: PASS with `August promotion active: true` and `August promotion expired: true`.

- [x] **Step 5: Run the existing browser regression checks**

Run:

```powershell
node _qa/check.cjs noerrors
node _qa/check.cjs hero
```

Expected: both desktop and mobile report zero errors and zero overflow; all hero semantic, layout, and tap-target checks pass.

- [x] **Step 6: Inspect the final diff and commit the campaign update**

Run:

```powershell
git diff --check
git diff -- index.html _qa/check.cjs docs/superpowers/plans/2026-08-05-august-special.md
git add index.html _qa/check.cjs docs/superpowers/plans/2026-08-05-august-special.md
git commit -m "feat: rerun website special for August"
```

Expected: the diff contains only the fixed-clock QA coverage, August promotion copy, August deadline, and this plan; the commit succeeds.
