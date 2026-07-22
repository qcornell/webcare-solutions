# Hero Readability and Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the WebCare hero so its copy reads cleanly, its primary action is unmistakable, and its mobile layout is more compact without changing the living particle-and-shield identity.

**Architecture:** Keep the existing single-file site architecture. Extend the Playwright hero check in `_qa/check.cjs` before each behavior change, then modify only the hero/navigation markup and CSS in `index.html`; the Three.js scene, form behavior, and section architecture remain unchanged.

**Tech Stack:** Semantic HTML, CSS custom properties and responsive media queries, vanilla JavaScript, Playwright, Three.js r128, GSAP 3.12.5.

## Global Constraints

- Keep the existing ink, magenta, violet, and soft-white palette; add only hero supporting text `#D7CEDF`.
- Keep Space Grotesk for display text and Inter for body and utility text.
- Keep the headline exactly: “Most websites get launched. Ours get cared for.”
- Keep the particle field, mesh landscape, shield formation, underline, and local positioning.
- Normalize primary-action copy to “Start your website” only in the header, hero, mobile menu, desktop sticky CTA, and mobile sticky bar.
- Keep the real phone number `(979) 595-6330` and do not add testimonials, ratings, customer counts, or performance claims.
- Preserve keyboard focus, reduced-motion behavior, WebGL fallback behavior, and tap targets of at least 52 pixels.
- Preserve zero horizontal overflow at 390, 768, and 1440 pixels.

---

## File Structure

- Modify `_qa/check.cjs`: add semantic and responsive hero assertions and capture a mobile hero screenshot.
- Modify `index.html`: refine hero CTA markup, copy, scrim, supporting-text contrast, and the 560-pixel responsive layout.
- No new production files, dependencies, JavaScript behavior, images, or fonts.

### Task 1: Establish the hero action hierarchy and consistent copy

**Files:**
- Modify: `_qa/check.cjs:197-218`
- Modify: `index.html:207-223`
- Modify: `index.html:479-525`
- Modify: `index.html:1011-1027`
- Test: `_qa/check.cjs`

**Interfaces:**
- Consumes: existing `.hero`, `.hero-cta`, `#nav`, `#mmenu`, `#stickycta`, and `#mbar` selectors.
- Produces: `.hero-check` for the secondary site-check link, factual `.hero-note` copy, and “Start your website” labels on the four conversion surfaces.

- [ ] **Step 1: Add the failing semantic assertions to the hero check**

Inside the existing `hero` loop, immediately after `loadPage(...)`, add:

```js
      const state = await page.evaluate(() => {
        const primary = document.querySelector(".hero-cta .btn-p");
        const phone = document.querySelector('.hero-cta a[href^="tel:"]');
        const siteCheck = document.querySelector('.hero a[href="#site-check"]');
        const note = document.querySelector(".hero-note");
        const surfaceLabels = Array.from(
          document.querySelectorAll(
            '#nav a[href="#contact"], #mmenu a[href="#contact"], #stickycta a[href="#contact"], #mbar a[href="#contact"]',
          ),
          (el) => el.textContent.trim(),
        );
        return {
          primaryText: primary && primary.textContent.trim(),
          phoneText: phone && phone.textContent.trim(),
          siteCheckText: siteCheck && siteCheck.textContent.trim(),
          siteCheckIsButton: !!(siteCheck && siteCheck.classList.contains("btn")),
          siteCheckInsideActions: !!(siteCheck && siteCheck.closest(".hero-cta")),
          noteText: note && note.textContent.trim(),
          surfaceLabels,
        };
      });
      const semanticOk =
        state.primaryText === "Start your website" &&
        state.phoneText === "Call (979) 595-6330" &&
        state.siteCheckText === "Free 60-second website check" &&
        !state.siteCheckIsButton &&
        !state.siteCheckInsideActions &&
        state.noteText === "Custom-built · Monthly care · Local support." &&
        state.surfaceLabels.length === 5 &&
        state.surfaceLabels.every((label) => label === "Start your website");
      console.log(`${n}: hero semantics=${semanticOk} ${JSON.stringify(state)}`);
      if (!semanticOk) {
        process.exitCode = 1;
      }
```

- [ ] **Step 2: Run the hero check and verify the new assertions fail**

Run: `node _qa/check.cjs hero`

Expected: exit code `1`; the log reports `hero semantics=false` because the site-check anchor still has the `btn` class, remains inside `.hero-cta`, the trust note uses the old copy, and conversion surfaces still say “Start a project.”

- [ ] **Step 3: Change the hero CTA markup and approved copy**

Replace the current `.hero-cta` and `.hero-note` block with:

```html
    <div class="hero-cta">
      <a class="btn btn-p mag" href="#contact">Start your website<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
      <a class="btn btn-g mag" href="tel:+19795956330"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 2.5h2.6l1.2 3-1.7 1.3a10 10 0 0 0 4.1 4.1l1.3-1.7 3 1.2v2.6a1 1 0 0 1-1.1 1A12.4 12.4 0 0 1 2 3.6a1 1 0 0 1 1-1.1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>Call (979) 595-6330</a>
    </div>
    <a class="hero-check" href="#site-check">Free 60-second website check<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
    <p class="hero-note">Custom-built · Monthly care · Local support.</p>
```

Change the current `.hero-note` CSS rules to:

```css
.hero-check{display:inline-flex;align-items:center;gap:8px;margin-top:18px;color:var(--accent-soft);font:600 .92rem/1.4 var(--body);text-decoration-line:underline;text-decoration-color:rgba(255,124,194,.38);text-decoration-thickness:1px;text-underline-offset:5px;transition:color .25s,text-decoration-color .25s}
.hero-check svg{flex:none;transition:transform .3s ease}
.hero-check:hover{color:#FFD0E8;text-decoration-color:currentColor}
.hero-check:hover svg,.hero-check:focus-visible svg{transform:translateX(3px)}
.hero-note{margin-top:18px;font-size:.84rem;color:var(--t-light-mut);opacity:.9}
```

Change the visible link text to `Start your website` at these existing surfaces:

```html
<a class="btn btn-p mag" href="#contact">Start your website</a>
<li><a class="mlink" href="#contact">Start your website</a></li>
<a class="btn btn-p" href="#contact">Start your website</a>
<a class="btn btn-p mag" href="#contact">Start your website</a>
<a class="btn btn-p" href="#contact">Start your website</a>
```

These five elements correspond, in order, to `#nav`, the `#mmenu` list item, the `#mmenu` button, `#stickycta`, and `#mbar`. Do not change the deeper About, package, contact, or footer wording in this task.

- [ ] **Step 4: Run the hero check and verify semantic assertions pass**

Run: `node _qa/check.cjs hero`

Expected: exit code `0`; both viewports report `hero semantics=true`, with zero page errors.

- [ ] **Step 5: Commit the action hierarchy**

```powershell
git add _qa/check.cjs index.html
git commit -m "refine hero action hierarchy"
```

### Task 2: Protect readability and compact the mobile hero

**Files:**
- Modify: `_qa/check.cjs:197-236`
- Modify: `index.html:207-229`
- Test: `_qa/check.cjs`

**Interfaces:**
- Consumes: the `.hero-check` markup and normalized conversion labels from Task 1.
- Produces: geometry assertions for desktop and mobile plus a 560-pixel hero layout with full-width mobile buttons and a stronger asymmetric scrim.

- [ ] **Step 1: Add failing responsive geometry assertions**

Add the tablet viewport to the existing `hero` viewport list so the loop begins:

```js
    for (const [w, h, n] of [
      [1440, 900, "desk"],
      [768, 1024, "tab"],
      [390, 844, "mob"],
    ]) {
```

Add this helper and `geometry` object at the start of the existing `page.evaluate(...)` callback from Task 1, after the four hero elements are selected:

```js
        const copy = document.querySelector(".hero-copy");
        const eye = document.querySelector(".hero-eye");
        const box = (el) => {
          const r = el.getBoundingClientRect();
          return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
        };
        const geometry = {
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          documentWidth: document.documentElement.scrollWidth,
          copy: box(copy),
          eye: box(eye),
          primary: box(primary),
          phone: box(phone),
        };
```

Add `geometry` to the returned state object. Immediately after the semantic assertion block, add:

```js
      const g = state.geometry;
      const insideViewport =
        g.documentWidth === g.viewportWidth &&
        g.copy.left >= 0 &&
        g.copy.right <= g.viewportWidth &&
        g.eye.left >= 0 &&
        g.eye.right <= g.viewportWidth;
      const layoutOk = n === "mob"
        ? g.primary.height >= 52 &&
          g.phone.height >= 52 &&
          g.primary.width >= g.copy.width - 2 &&
          g.phone.width >= g.copy.width - 2 &&
          g.phone.top >= g.primary.bottom &&
          g.copy.bottom <= g.viewportHeight - 24
        : Math.abs(g.primary.top - g.phone.top) <= 2 &&
          g.phone.left > g.primary.right;
      console.log(`${n}: hero layout=${insideViewport && layoutOk} ${JSON.stringify(g)}`);
      if (!insideViewport || !layoutOk) {
        process.exitCode = 1;
      }
```

Inside the existing screenshot condition, add a mobile branch after the desktop block:

```js
      } else if (n === "mob") {
        await page.screenshot({ path: `${SHOTS}/hero-mobile.png` });
```

- [ ] **Step 2: Run the hero check and verify the mobile geometry fails**

Run: `node _qa/check.cjs hero`

Expected: exit code `1`; desktop remains in one row, while mobile reports `hero layout=false` because its primary and phone actions are not full-width and the content is taller than the approved compact layout.

- [ ] **Step 3: Strengthen the copy scrim and supporting-text contrast**

Replace the current `.hero-scrim` and `.hero-sub` rules with:

```css
.hero-scrim{position:absolute;inset:0;z-index:2;background:linear-gradient(90deg,rgba(13,10,20,.92) 0%,rgba(13,10,20,.82) 36%,rgba(13,10,20,.38) 64%,rgba(13,10,20,.08) 84%),radial-gradient(64% 80% at 24% 52%,rgba(13,10,20,.72),transparent 72%);pointer-events:none}
.hero-sub{font-size:var(--fs-600);line-height:1.62;color:#D7CEDF;max-width:52ch;margin-bottom:34px}
```

Keep `.hero-sub b` unchanged.

- [ ] **Step 4: Add the compact 560-pixel hero layout**

Insert this media query immediately before the Trust Strip section:

```css
@media (max-width:560px){
  .hero{align-items:flex-start}
  .hero-scrim{background:linear-gradient(180deg,rgba(13,10,20,.88) 0%,rgba(13,10,20,.70) 48%,rgba(13,10,20,.91) 100%)}
  .hero-in{padding-top:112px;padding-bottom:68px}
  .hero-copy{max-width:100%}
  .hero-eye{max-width:100%;font-size:.7rem;line-height:1.45;letter-spacing:.14em;margin-bottom:20px;padding:8px 14px 8px 10px}
  .hero h1{font-size:clamp(2.12rem,9.5vw,2.45rem);line-height:1.06;margin-bottom:20px}
  .hero-sub{font-size:1.06rem;line-height:1.58;max-width:31ch;margin-bottom:28px}
  .hero-cta{display:grid;grid-template-columns:1fr;gap:10px;width:100%}
  .hero-cta .btn{width:100%;min-height:54px;padding:16px 18px}
  .hero-check{margin-top:16px}
  .hero-note{margin-top:16px;font-size:.78rem;letter-spacing:.01em}
  .scroll-cue{display:none}
}
```

Do not change the particle, dust, shield, or Three.js code. The strengthened scrim is the only atmosphere adjustment in this pass.

- [ ] **Step 5: Run the hero and regression checks**

Run each command separately:

```powershell
node _qa/check.cjs hero
node _qa/check.cjs noerrors
node _qa/check.cjs reduce
node _qa/check.cjs nofx
```

Expected: every command exits `0`; desktop, tablet, and mobile report hero semantics and layout as `true`; `noerrors` reports zero errors and zero overflow; reduced-motion and no-WebGL modes report zero errors.

- [ ] **Step 6: Review the fresh desktop and mobile screenshots**

Inspect:

```text
_qa/_shots/hero-idle.png
_qa/_shots/hero-formed.png
_qa/_shots/hero-mobile.png
```

Confirm that the headline remains the dominant element, particles remain visible away from the copy, the supporting paragraph is legible, the site-check link reads as tertiary, mobile buttons are full-width, and all hero content fits within the 390×844 viewport.

- [ ] **Step 7: Run final static checks and commit**

Run:

```powershell
git diff --check
git status --short
```

Expected: `git diff --check` has no output; only `_qa/check.cjs` and `index.html` are modified before the commit.

Commit:

```powershell
git add _qa/check.cjs index.html
git commit -m "improve hero readability and mobile flow"
```
