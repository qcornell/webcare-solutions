# WebCare Solutions — "The Living Shield" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Escalate Fable's "Signal Garden" flagship into "The Living Shield" — a cursor-reactive, blooming, crystallizing 3D hero; full L0–L5 atmosphere + motion craft page-wide; a reworked conversion path (Netlify-wired form, real proof, lead magnet); and a brand-correct favicon — without leaving the single-file + three.js r128 + CDN architecture.

**Architecture:** All changes land in one `index.html` (existing FX IIFE preserved and extended) plus new favicon assets and a dev-only playwright QA harness. The hero upgrades are strictly additive and gated to `!light && !reduce`; mobile/reduced-motion keep Fable's static fallback. The 3D shield is procedural `ExtrudeGeometry` (no GLB, no GLTFLoader). Post-processing comes from jsDelivr's three@0.128 UMD addons (drop-in `<script>` tags, no build step).

**Tech Stack:** HTML/CSS/vanilla JS · three.js r128 (global build) + jsDelivr `examples/js` UMD addons (EffectComposer, RenderPass, ShaderPass, UnrealBloomPass, GammaCorrectionShader, CopyShader, LuminosityHighPassShader, MaskPass) · GSAP 3.12.5 + ScrollTrigger · Google Fonts (Space Grotesk + Inter) · Netlify Forms · playwright (dev QA) · Node for asset rendering.

## Global Constraints

- **Single-file:** the production site stays one `index.html` + `assets/`. No build step, no bundler, no framework.
- **three.js pinned at r128** (global `THREE`). Do NOT migrate to importmap/ESM in this plan. Addons must come from `https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/...` (cdnjs r128 has only `build/three.min.js`).
- **No GLTFLoader / no GLB.** The 3D shield is procedural geometry.
- **Payload budget:** HTML < 250 KB; page transfer excl. CDN < 600 KB; target Lighthouse ≥ 95.
- **Guardrails (never regress):** DPR cap 2 (composer ≤ 1.5); particle tiers by `width<760 || deviceMemory<4 || hardwareConcurrency<4`; rAF paused via IntersectionObserver + visibilitychange; full WebGL feature-detect + try/catch → `.no-fx` static fallback; `prefers-reduced-motion` → fallback + no scrubs/crystallize + instant reveals; deferred boot after `load`+60ms; **zero console errors** at 390/768/1440.
- **Honesty:** any unverified metric, price, capacity number, or testimonial must carry an HTML `<!-- SLOT: verify -->` comment and read as honest, never invented. No fake scarcity or unearned trust badges.
- **AA contrast** on all new/changed text; small text alpha ≥ .75.
- **Brand facts (verbatim, do not invent):** WebCare Solutions · webcare.solutions · (979) 595-6330 · Bryan–College Station, TX (serves Houston) · magenta `#F0288F` / ink `#0D0A14` / paper `#FBF8FB` · shield-with-white-check.
- **Branch:** create `webcare-living-shield` off `main` before the first commit (Task 1). Commit after every task.

## Verification approach (TDD for a visual site)

Traditional unit tests don't fit a three.js/CSS site. Each task's "test" is a **runnable playwright check** in `_qa/check.cjs` (created Task 1): load the page at a viewport, drive the behavior, assert an outcome, screenshot, and assert **zero console errors / no overflow**. Write/extend the check before the change where it makes sense (red), implement (green), screenshot to confirm visually, commit. This is the domain-honest analog of write-failing-test → implement → pass.

Run a check with: `node _qa/check.cjs <name>` from the project folder. Playwright + chromium are already available at `/c/moltbot/node_modules/playwright`.

## File Structure

- `index.html` — production site. Modified throughout. Sections of interest (current line ranges, will shift as edits land): head/favicon `:1-21`, tokens `:52-76`, atmosphere classes `:103-116`, hero markup `:429-440` (incl. TRIPO3D/SEEDANCE slots), FX JS `:967-1229`, contact form `:792-813` + JS `:955-964`, testimonials `:744-769`, portfolio `:534-617`, difference `:618-664`, process `:666-698`.
- `assets/favicon.svg`, `apple-touch-icon.png`, `favicon-32.png`, `favicon-16.png`, `icon-512.png` — new favicon set.
- `_qa/check.cjs` + `_qa/_shots/` — dev-only QA harness + screenshots (gitignored from production; keep in repo as dev artifacts).
- `_render-icons.cjs` — dev script that renders the SVG to PNG sizes.
- `BUILD-NOTES.md` — append QA log + retro at the end.

---

## Phase 0 — Setup & baseline

### Task 1: QA harness, branch, baseline captures

**Files:**
- Create: `_qa/check.cjs`, `_qa/package.json`, `.gitignore` (if absent)
- Modify: none yet

**Interfaces:**
- Produces: `node _qa/check.cjs <name>` runner; `_qa/_shots/baseline-*.png` references; a `loadPage(opts)` helper later tasks reuse (viewport, reducedMotion, noFx flags; returns `{page, errors}` where `errors` collects console errors).

- [ ] **Step 1: Create branch**

```bash
cd "C:/moltbot/websites/church-website-studio/09-website-projects/webcare-solutions"
git checkout -b webcare-living-shield
```
Expected: `Switched to a new branch 'webcare-living-shield'`.

- [ ] **Step 2: Write `_qa/package.json`**

```json
{ "name": "webcare-qa", "private": true, "type": "commonjs" }
```

- [ ] **Step 3: Write the harness `_qa/check.cjs`** (loads `/c/moltbot/node_modules/playwright`; provides `loadPage` + named checks)

```js
const path = require('path');
const { chromium } = require(path.resolve('C:/moltbot/node_modules/playwright'));
const ROOT = 'file://' + path.resolve(__dirname, '..', 'index.html');
const SHOTS = path.resolve(__dirname, '_shots');

async function loadPage({ width = 1440, height = 900, reduce = false, noFx = false } = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  // emulate reduced motion + disable WebGL before load
  if (reduce) await ctx.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(noFx ? `
    Object.defineProperty(HTMLCanvasElement.prototype,'getContext',{value:()=>null});
  ` : '');
  await page.setViewportSize({ width, height });
  await page.goto(ROOT, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400); // deferred boot +60ms + frame
  return { browser, page, errors };
}

const checks = {
  baseline: async () => {
    for (const [w, h, name] of [[1440, 900, 'desk'], [390, 844, 'mob'], [768, 1024, 'tab']]) {
      const { browser, page, errors } = await loadPage({ width: w, height: h });
      await page.screenshot({ path: `${SHOTS}/baseline-${name}.png`, fullPage: true });
      console.log(`baseline ${name}: ${errors.length} errors`);
      if (errors.length) console.log(errors.join('\n'));
      await browser.close();
    }
  },
  noerrors: async () => {
    for (const [w, h, name] of [[1440, 900, 'desk'], [390, 844, 'mob']]) {
      const { browser, page, errors } = await loadPage({ width: w, height: h });
      await page.mouse.wheel(0, 4000); await page.waitForTimeout(300);
      await page.mouse.wheel(0, 8000); await page.waitForTimeout(300);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      console.log(`${name}: errors=${errors.length} overflow=${overflow}`);
      if (errors.length) { console.log(errors.join('\n')); process.exitCode = 1; }
      await browser.close();
    }
  },
  // later tasks append: favicon, form, hero, reduce, nofx, atmosphere, ...
};

(async () => {
  const name = process.argv[2];
  if (!checks[name]) { console.log('available:', Object.keys(checks).join(', ')); process.exit(1); }
  require('fs').mkdirSync(SHOTS, { recursive: true });
  await checks[name]();
})().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 4: Run baseline + noerrors (red/green baseline)**

Run: `node _qa/check.cjs baseline` then `node _qa/check.cjs noerrors`
Expected: `_qa/_shots/baseline-desk.png` etc. created; `errors=0 overflow=0` (Fable's build is clean — if non-zero, stop and report; do not proceed on a dirty baseline).

- [ ] **Step 5: Add `.gitignore`** (if absent) ignoring `_qa/_shots/` only:

```
_qa/_shots/
```

- [ ] **Step 6: Commit**

```bash
git add _qa/ .gitignore
git commit -m "chore(webcare): add playwright QA harness + baseline"
```

---

## Phase 1 — Quick wins (visible, low-risk)

### Task 2: Favicon B + head block

**Files:**
- Create: `assets/favicon.svg`, `_render-icons.cjs`, `assets/apple-touch-icon.png`, `assets/favicon-32.png`, `assets/favicon-16.png`, `assets/icon-512.png`
- Modify: `index.html:9` (favicon link) + `:15` (OG image note)

**Interfaces:**
- Produces: a multi-size favicon set; `_qa/check.cjs favicon` check asserting the SVG link + PNG fallbacks exist.

- [ ] **Step 1: Add `favicon` check (red)** — append to `checks` in `_qa/check.cjs`:

```js
favicon: async () => {
  const { browser, page } = await loadPage({ width: 1440, height: 200 });
  const icons = await page.$$eval('link[rel~="icon"], link[rel="apple-touch-icon"]', els =>
    els.map(e => ({ rel: e.rel, href: e.href, sizes: e.sizes + '' })));
  console.log(JSON.stringify(icons, null, 2));
  const ok = icons.some(i => i.href.endsWith('favicon.svg'))
          && icons.some(i => i.sizes === '32x32')
          && icons.some(i => i.rel.includes('apple-touch-icon'));
  console.log('favicon set ok:', ok);
  if (!ok) process.exitCode = 1;
  await browser.close();
},
```
Run `node _qa/check.cjs favicon` → expect FAIL (no svg link yet).

- [ ] **Step 2: Create `assets/favicon.svg`** (Variant B — flat-arched heater, heavy white check):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M8 12 C8 7 12 6 16 6 L48 6 C52 6 56 7 56 12 L56 30 C56 44 47 54 32 59 C17 54 8 44 8 30 Z" fill="#FF0288" stroke="#C01068" stroke-width="1.2"/>
  <path d="M19 33 L28.5 42 L47 21" fill="none" stroke="#ffffff" stroke-width="7.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

- [ ] **Step 3: Write `_render-icons.cjs`** (renders the SVG to PNG sizes via playwright):

```js
const path = require('path');
const fs = require('fs');
const { chromium } = require(path.resolve('C:/moltbot/node_modules/playwright'));
const dir = path.resolve(__dirname, 'assets');
const svg = fs.readFileSync(path.join(dir, 'favicon.svg'), 'utf8');
const SIZES = { 'favicon-32.png': 32, 'favicon-16.png': 16, 'apple-touch-icon.png': 180, 'icon-512.png': 512 };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 600, height: 600 } });
  const page = await ctx.newPage();
  await page.setContent(`<style>html,body{margin:0;background:transparent}</style>`);
  for (const [file, px] of Object.entries(SIZES)) {
    await page.setContent(`<style>html,body{margin:0;background:transparent}img{display:block}</style><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${px}" height="${px}">`);
    await page.waitForTimeout(80);
    await page.locator('img').screenshot({ path: path.join(dir, file), omitBackground: true });
    console.log('wrote', file);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
```
Run: `node _render-icons.cjs` → writes the 4 PNGs into `assets/`.

- [ ] **Step 4: Replace the favicon `<link>` at `index.html:9`**

Old (single data-URI link) → new block:
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/favicon-32.png" sizes="32x32" />
<link rel="icon" href="/favicon-16.png" sizes="16x16" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```
(Place the SVG/PNGs at the **web root** for `/favicon.svg` to resolve — but since this is the project folder served as root, copy/symlink is not needed; if served from a subpath, use relative `assets/favicon.svg` instead. **Use `assets/` paths to be safe:** `href="assets/favicon.svg"` etc.) → final uses `assets/` prefix.

- [ ] **Step 5: Mark the OG image slot** at `index.html:15` (leave lov_hero.webp but make the SLOT explicit): change comment to `<!-- SLOT: replace with a branded 1200x630 WebCare OG render -->` (already there; verify).

- [ ] **Step 6: Run favicon check (green)**

Run: `node _qa/check.cjs favicon` → expect `favicon set ok: true`.

- [ ] **Step 7: Commit**

```bash
git add assets/favicon.svg assets/*.png index.html _render-icons.cjs _qa/check.cjs
git commit -m "feat(webcare): ship favicon B (sturdy shield, white check) + icon set"
```

---

### Task 3: Wire the contact form (Netlify Forms)

**Files:**
- Modify: `index.html` form markup (`~792-807`) + submit JS (`~955-964`)

**Interfaces:**
- Produces: a form that POSTs to Netlify (AJAX success state locally, real delivery on deploy); `_qa/check.cjs form` asserts Netlify attrs + success state on submit.

- [ ] **Step 1: Add `form` check (red)** — append:

```js
form: async () => {
  const { browser, page } = await loadPage({ width: 1440, height: 900 });
  await page.evaluate(() => document.getElementById('contact').scrollIntoView());
  const has = await page.evaluate(() => {
    const f = document.getElementById('cform');
    return {
      netlify: f && f.getAttribute('data-netlify') === 'true',
      name: f && f.getAttribute('name') === 'webcare-contact',
      formNameInput: !!f && !!f.querySelector('input[name="form-name"]'),
      honeypot: !!f && !!f.querySelector('input[name="bot-field"]'),
    };
  });
  console.log(JSON.stringify(has));
  // drive the AJAX success path
  await page.fill('#cform [name="name"]', 'Jane Rivera');
  await page.fill('#cform [name="contact"]', 'jane@example.com');
  await page.fill('#cform textarea', 'Need a site for our bakery');
  await page.click('#cform button[type="submit"]');
  await page.waitForTimeout(500);
  const done = await page.evaluate(() => {
    const h = document.querySelector('#form-done h3, #form-done .dtitle');
    return h ? h.textContent.trim() : null;
  });
  console.log('success heading:', done);
  const ok = has.netlify && has.name && has.formNameInput && has.honeypot && /Jane/.test(done || '');
  console.log('form ok:', ok);
  if (!ok) process.exitCode = 1;
  await browser.close();
},
```
Run → expect FAIL.

- [ ] **Step 2: Update form markup** — change the `<form id="cform" ...>` opening tag to:

```html
<form id="cform" name="webcare-contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" novalidate>
  <input type="hidden" name="form-name" value="webcare-contact" />
  <p hidden aria-hidden="true"><label>Don't fill this out: <input name="bot-field" /></label></p>
```
Keep the existing 3 fields (`name`, `contact`, textarea) and submit button. **Add `id="f-name"` to the name input** (if not present) so the success-personalization JS can read it. Keep the existing `#form-panel` ↔ `#form-done` swap markup.

- [ ] **Step 3: Rewrite the submit handler** (replace the existing `~955-964` block) to POST via fetch then swap:

```js
cform.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!cform.checkValidity()) { cform.reportValidity(); return; }
  const btn = cform.querySelector('button[type=submit]');
  btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…';
  try {
    const body = new URLSearchParams(new FormData(cform));
    const res = await fetch(cform.action || location.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) throw new Error('status ' + res.status);
    const first = (document.getElementById('f-name') || {}).value?.trim?.().split(/\s+/)[0] || '';
    const h = document.querySelector('#form-done .dtitle') || document.querySelector('#form-done h3');
    if (h) h.textContent = first ? `Got it — thank you, ${first}.` : 'Got it — thank you.';
    document.getElementById('form-panel').hidden = true;
    const done = document.getElementById('form-done');
    done.hidden = false; done.classList.add('pop');
    done.focus && done.focus({ preventScroll: true });
  } catch (err) {
    btn.disabled = false; btn.textContent = btn.dataset.label || 'Send it our way';
    const note = cform.querySelector('.ferr') || (() => {
      const n = document.createElement('p'); n.className = 'ferr'; n.style.color = 'var(--accent)';
      cform.appendChild(n); return n;
    })();
    note.textContent = 'Something went wrong sending — please call (979) 595-6330, or try again.';
  }
});
```
Note: ensure `#form-done` has `hidden` by default (add `hidden` attribute in markup if absent) and a focusable element/tabbindex. Add CSS `.ferr{margin-top:8px;font-size:.92rem}` near the form styles.

- [ ] **Step 4: Run form check (green)**

Run: `node _qa/check.cjs form` → expect `form ok: true` (local fetch to `file://` resolves 200-ish or throws gracefully; if `file://` POST throws, the catch path shows the error note — if so, mock fetch in the check by injecting `window.fetch = async () => ({ ok: true })` via `page.addInitScript` before goto. Add that to the check for local reliability.)

- [ ] **Step 5: Commit**

```bash
git add index.html _qa/check.cjs
git commit -m "fix(webcare): wire contact form to Netlify + personalized success (was 100% lead loss)"
```

---

### Task 4: L0 tint fixes + 8px radius + motif opacity + measure

**Files:**
- Modify: `index.html` tokens (`:68`), button radius (`~128`), service cards/chips/chart/carelog/testimonials backgrounds (`~227,271,273,304,320`), motif classes (`~110-115`), hero-sub measure (`~202`).

- [ ] **Step 1: Token + radius** — `--r-lg:22px` → `24px`; button `border-radius:14px` → `16px` (find in `.btn` rule, `~128`).

- [ ] **Step 2: L0 — replace pure `#fff`** with warm paper tints. Concretely: in the service-card `.ico` background `rgba(240,40,143,.09)` stays, but any `background:#fff` on `.svc`/`.chart-card`/`.carelog`/`.chip` → `#FCFAFC` (light) and testimonials `rgba(255,255,255,.6)` → `rgba(252,250,252,.92)`. (Grep `#fff` and `rgba(255,255,255` in the `<style>` and replace the structural ones — not text colors.)

Run: `grep -n "#fff\|rgba(255,255,255" index.html` to enumerate, then edit each structural occurrence.

- [ ] **Step 3: Motif opacity** — `.mot-shield-r{…opacity:.05…}` → `.07`; `.mot-check-tl{…opacity:.05…}` → `.065`.

- [ ] **Step 4: Measure** — hero-sub `max-width:52ch` → `64ch` (`~202`).

- [ ] **Step 5: Verify** — `node _qa/check.cjs noerrors` (zero errors, no overflow) + eyeball `_qa/check.cjs baseline` regenerated shots for warmth (cards no longer pure white). Add a quick `tints` check:

```js
tints: async () => {
  const { browser, page } = await loadPage({ width: 1440, height: 900 });
  const pure = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('*').forEach(el => {
      const bg = getComputedStyle(el).backgroundColor;
      if (bg === 'rgb(255, 255, 255)') out.push((el.className||el.tagName)+' :: '+bg);
    });
    return out.slice(0, 20);
  });
  console.log('pure-white elements:', pure.length, pure);
  await browser.close();
},
```
Expect: 0 structural pure-white elements (text selection / nothing visible). If any remain, fix.

- [ ] **Step 6: Commit**

```bash
git add index.html _qa/check.cjs
git commit -m "style(webcare): L0 warm tints, 8px radii, motif opacity, measure"
```

---

## Phase 2 — Conversion content

### Task 5: Replace empty testimonials → case studies + founder card

**Files:**
- Modify: `index.html` testimonials section (`~744-769`).

- [ ] **Step 1: Add `proof` check (red):**

```js
proof: async () => {
  const { browser, page } = await loadPage({ width: 1440, height: 900 });
  await page.evaluate(() => document.getElementById('words').scrollIntoView());
  const txt = await page.locator('#words').innerText();
  const hasReserved = /reserved|awaiting a real client/i.test(txt);
  const hasCase = /LOV|seedframes|DeedSlice/i.test(txt);
  console.log({ hasReserved, hasCase });
  if (hasReserved || !hasCase) process.exitCode = 1;
  await browser.close();
},
```
Run → FAIL (still says "reserved").

- [ ] **Step 2: Rewrite the `#words` section.** Replace the H2/lede and the placeholder cards. New structure (keep the section wrapper + classes, swap inner):

Heading: `Real builds, really shipped.` · Lede: `We don't publish invented praise. These are live sites — and the results we can stand behind. References on request.`

Three case-study cards (each: client, vertical chip, 1–2 honest metrics with `<!-- SLOT: verify -->` until confirmed), plus one founder card. Example card markup (mirror the existing `.tst` card classes):

```html
<article class="tst cs">
  <span class="cs-vt">Church · LOV COGIC</span>
  <p class="cs-line">Online giving live in week one; sermons stream from the homepage.</p>
  <ul class="cs-mtr">
    <li><b>Live</b> · lov-cogic.com</li><!-- SLOT: verify metrics with client -->
    <li><b>+</b> giving sign-ups tracked from launch</li><!-- SLOT: verify -->
  </ul>
  <a class="pf-link" href="https://lov-cogic.com" target="_blank" rel="noopener">Visit the live site</a>
</article>
```
Repeat for seedframes (cinematic/creative) and DeedSlice (fintech clarity). Founder card: name, role, one honest line ("I'm the builder who answers the phone."), CTA → #contact. Add minimal CSS for `.cs`, `.cs-vt`, `.cs-line`, `.cs-mtr` reusing existing spacing/tints.

- [ ] **Step 3: Run proof check (green)** + screenshot the section.

- [ ] **Step 4: Commit**

```bash
git add index.html _qa/check.cjs
git commit -m "feat(webcare): replace empty testimonials with results-led case studies + founder card"
```

---

### Task 6: Portfolio → outcomes

**Files:**
- Modify: `index.html` portfolio cards (`~546-613`).

- [ ] **Step 1:** For each of the 3 LIVE cards (LOV COGIC, seedframes, DeedSlice), add a one-line outcome metric with `<!-- SLOT: verify -->`. Append inside the card body, e.g.:

```html
<p class="pf-out"><b>Outcome:</b> first-time visitors can give + plan a visit in two taps.<!-- SLOT: verify metric --></p>
```
Add `.pf-out{font-size:.9rem;color:var(--t-light-mut);margin-top:8px}` near portfolio styles. Leave the 3 demo cards as "concept outcome" lines (e.g., "designed for one-tap giving").

- [ ] **Step 2:** Verify `node _qa/check.cjs noerrors`; screenshot portfolio.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(webcare): portfolio cards lead with outcomes (SLOT metrics to verify)"
```

---

### Task 7: Lead magnet band + secondary hero CTA

**Files:**
- Modify: `index.html` hero CTAs (`~450-453`) + insert a new band after `#difference` (`~664`).

- [ ] **Step 1:** Hero — add a third CTA (ghost) between the two existing:

```html
<a class="btn btn-g2" href="#site-check">Free 60-second site check</a>
```
Style `.btn-g2` as a subtle ghost (border `--line-d`, text `--t-light`) sized like `.btn-g`.

- [ ] **Step 2:** Insert a new section `#site-check` after the Difference section:

```html
<section id="site-check" class="sec light alt">
  <div class="wrap sc-row">
    <div class="sc-copy">
      <span class="eye">Free, no form-filling</span>
      <h2>Not sure your site is working? Get a 60-second health check.</h2>
      <p>We'll run speed, SEO, mobile and security checks and email you a plain-English score — no sales call required.</p>
    </div>
    <form class="sc-form" name="site-check" method="POST" data-netlify="true" netlify-honeypot="bot-field" novalidate>
      <input type="hidden" name="form-name" value="site-check" />
      <p hidden aria-hidden="true"><label>Don't fill: <input name="bot-field" /></label></p>
      <input class="sc-input" name="url" type="text" placeholder="Your website URL" required aria-label="Your website URL" />
      <input class="sc-input" name="email" type="email" placeholder="Where should we send the score?" required aria-label="Email for the report" />
      <button class="btn btn-p" type="submit">Run my free check</button>
      <span class="fmicro">No spam. One email, your score, our contact if you want help.</span>
    </form>
  </div>
</section>
```
Add JS: a second submit handler bound to `.sc-form` using the same fetch pattern as Task 3 (swap to a `.sc-done` success note on send). Factor the submit logic into a reusable `wireNetlifyForm(form, onDone)` helper and call it for both `#cform` and `.sc-form`.

- [ ] **Step 3:** Add `.sc-row` (grid), `.sc-input` styles.

- [ ] **Step 4:** Verify `node _qa/check.cjs noerrors`; click the hero CTA → scrolls to `#site-check`; submit the form → success note.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(webcare): lead magnet — free 60-second site check band + hero CTA"
```

---

### Task 8: Response-time proof + booking + desktop sticky CTA + dead-funnel CTAs

**Files:**
- Modify: `index.html` contact bigtel area (`~782-783`), nav (`~408-409`), after-Difference (`~664`, but it now precedes the new band — place the CTA at the end of `#difference`), after-Process (`~696`), and add a desktop sticky bar before `</body>`.

- [ ] **Step 1:** Replace vague "reply within one business day" with **"Replies in under 4 business hours, on average."** Add a **"Book a 15-min call"** link (Cal.com/Calendly placeholder): `https://cal.com/webcare` `<!-- SLOT: set real booking link -->`.

- [ ] **Step 2:** Add the booking link to the nav next to the phone, and to the contact column.

- [ ] **Step 3:** Dead-funnel CTAs: at the end of `#difference` add `<a class="btn btn-p" href="#contact">See what care looks like for your site</a>`; at the end of `#process` add `<a class="btn btn-g" href="#contact">Book a free 20-minute Scout call</a>` (wrap each in a `.sec-cta` centered container with margin).

- [ ] **Step 4:** Desktop sticky CTA bar (hidden ≤ 860px, appears after hero via IntersectionObserver on `#trust`):

```html
<aside class="stickycta" id="stickycta" hidden>
  <div class="wrap sc-row">
    <strong>Ready when you are.</strong>
    <span class="sc-actions">
      <a class="btn btn-p mag" href="#contact">Start a project</a>
      <a class="btn btn-g" href="tel:+19795956330">Call (979) 595-6330</a>
    </span>
  </div>
</aside>
```
CSS: fixed bottom, full width, `backdrop-filter:blur(12px)`, `background:rgba(13,10,20,.82)`, z-index above content, `@media(max-width:860px){.stickycta{display:none!important}}` (mobile has its own `.mbar`). JS: `new IntersectionObserver(([e])=> stickycta.hidden = !e.isIntersecting, {rootMargin:'-60% 0px'} ).observe(document.getElementById('trust'))` — show once hero/trust scrolled past. (Gate by `!reduce`.)

- [ ] **Step 5:** Verify `node _qa/check.cjs noerrors`; scroll to confirm sticky bar appears after hero on desktop, hidden on mobile.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat(webcare): booking + response proof + desktop sticky CTA + dead-funnel CTAs"
```

---

### Task 9: Value anchor + services outcomes copy + capacity signal + trust badges

**Files:**
- Modify: `index.html` WebCare Plan microcopy (`~527`), services tags (`~493-516`), trust strip (`~461-479`), footer.

- [ ] **Step 1:** Value anchor — replace `Quoted for your exact needs — no games.` with: `New sites typically start around $X — every quote is itemized, no surprises.` `<!-- SLOT: set real starting price -->`.

- [ ] **Step 2:** Services copy → outcomes. Rewrite the 4 service tags from features to outcomes:
  - Church → "Turn first-time visitors into members."
  - Business/e-com → "Get found by Houston buyers ready to buy."
  - Hosting/maintenance → "Stop losing leads to a slow, broken site."
  - SEO/Ads → "Show up when locals search for what you do."

- [ ] **Step 3:** Capacity signal — on the Plan card add `<span class="cap">2 onboarding slots open this month</span>` `<!-- SLOT: keep current/truthful -->`. Style `.cap` as a small accent chip.

- [ ] **Step 4:** Trust badges — add a slim logo/badge row in the trust strip + footer, marked **add-when-earned**: `Google Partner (Ads)`, `WordPress`, `WooCommerce`, `BBB` — each as a muted text/badge with `<!-- SLOT: add real badge art only when genuinely earned -->`. Render as text chips now (no fake logos).

- [ ] **Step 5:** Verify `node _qa/check.cjs noerrors`; screenshot services + plan.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat(webcare): value anchor, outcomes copy, capacity signal, trust-badge row"
```

---

## Phase 3 — Atmosphere + motion craft

### Task 10: D-01 mesh (process) + L-03 mottle (care-log) + D-05 vignette (contact) + anchor glows + feathered bridge

**Files:**
- Modify: `index.html` tokens (add `--mottle`), atmosphere classes, section markup for process/contact/about, glow coordinates.

- [ ] **Step 1:** Add `--mottle` tile to `:root` (large-scale turbulence; lift verbatim from `06-visual-inspiration/background-depth-lab.html:32`):

```css
--mottle:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23m)'/%3E%3C/svg%3E");
```

- [ ] **Step 2:** D-01 mesh on `#process` — add a new atmosphere layer `<div class="atm mesh-d" aria-hidden="true"></div>` inside `#process` and the class:

```css
.mesh-d{background:radial-gradient(42% 50% at 18% 22%,rgba(122,108,245,.45),transparent 65%),radial-gradient(38% 44% at 82% 26%,rgba(240,40,143,.30),transparent 68%),radial-gradient(52% 58% at 72% 88%,rgba(168,14,99,.50),transparent 70%),radial-gradient(62% 60% at 28% 92%,rgba(19,15,30,.55),transparent 75%);mix-blend-mode:screen;opacity:.9}
```

- [ ] **Step 3:** L-03 mottle on the care-log/about — add `<div class="atm mottle" aria-hidden="true"></div>` inside `#about`:

```css
.mottle{background-image:var(--mottle);background-size:500px 500px;opacity:.09;mix-blend-mode:multiply}
```

- [ ] **Step 4:** D-05 vignette on `#contact` — add `<div class="atm vin-warm" aria-hidden="true"></div><div class="atm vin-edge" aria-hidden="true"></div>`:

```css
.vin-warm{background:radial-gradient(48% 42% at 50% 40%,rgba(255,124,194,.10),transparent 60%)}
.vin-edge{background:radial-gradient(130% 105% at 50% 45%,transparent 48%,rgba(10,4,12,.62) 100%)}
```
Bump the contact grain `.grain-d` opacity to `.22` locally (add a `#contact .grain-d{opacity:.22}` override).

- [ ] **Step 5:** Anchor glows — reposition the portfolio `.glow` (currently `top:-140px`) to sit behind the "Our work" heading block (e.g. `top:40px;left:50%;transform:translateX(-50%)`); reposition the contact `.glow` (`right:-100px;top:40px`) to center behind `.fpanel` (`right:auto;left:50%;top:55%;transform:translate(-50%,-50%)`). Adjust sizes so they read as lighting the content.

- [ ] **Step 6:** Feathered bridge — add ONE at the process(dark)→about(light) seam: `<div class="r-feather" aria-hidden="true"></div>` at the top of `#about`:

```css
.r-feather{position:absolute;left:0;right:0;top:-120px;height:120px;background:linear-gradient(to top,var(--ink),transparent);pointer-events:none;z-index:1}
```

- [ ] **Step 7: Verify** — add `atmosphere` check: assert each new `.atm` layer exists with opacity in range and `pointer-events:none`; run `toggle` mental check by screenshotting with/without (strip `.atm` via `page.evaluate` removing the class). `node _qa/check.cjs noerrors`.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "style(webcare): L0-L5 atmosphere — mesh/mottle/vignette, anchored glows, feathered bridge"
```

---

### Task 11: Resolve two-signature/two-light + CTA nudge + per-card accent + Plan furniture + stat row + personalized success + fallback fix

**Files:**
- Modify: `index.html` hero underline + blobs (`~184-185, 199-201`), `.btn` CSS, `.svc` rules, Plan banner, difference section, success JS (already in Task 3), no-fx fallback (`~186-188`).

- [ ] **Step 1:** Two-signature — make the hero underline draw near-instant: in the `hl-stroke` draw animation/CSS, change duration to `.2s` (or remove the dash animation, keep the path visible). Confirm the particle shield is the unambiguous moment.

- [ ] **Step 2:** Two-light — make `hb2` (violet bottom-left hero blob) subordinate: reduce its opacity ~40% and scale ~0.8 so `hb1` (magenta top-right) is the single dominant light matching the page.

- [ ] **Step 3:** CTA arrow-nudge — add to `.btn` CSS:

```css
.btn svg{transition:transform .45s cubic-bezier(.2,.7,.2,1)}
.btn:hover svg,.btn:focus-visible svg{transform:translateX(3px)}
```

- [ ] **Step 4:** Per-card `--acc` — add after the `.svc` rule:

```css
.svc:nth-of-type(1){--acc:240,40,143}      /* church — magenta */
.svc:nth-of-type(2){--acc:122,108,245}     /* business/e-com — violet */
.svc:nth-of-type(3){--acc:168,14,99}       /* hosting — deep magenta */
.svc:nth-of-type(4){--acc:255,124,194}     /* SEO — soft magenta */
.svc .ico{background:rgba(var(--acc),.10)}
.svc .tag{border-color:rgba(var(--acc),.35)}
.svc:hover{border-color:rgba(var(--acc),.55)}
```
(Adjust selectors to match the real `.svc`/`.ico`/`.tag` classes.)

- [ ] **Step 5:** Plan banner furniture — add floating `.fchip` + `.orbit` + `.godrays` behind `.plan-shield`; gild the Plan `<h3>` with the hero gradient (reuse the `.l2` pink gradient as `background-clip:text`). Keep opacity low so the shield stays the focus.

- [ ] **Step 6:** Stat row — add a 3-stat proof row under the chart in `#difference`:

```html
<div class="stats">
  <div class="stat"><b>12</b><span>months of care, every build</span></div>
  <div class="stat"><b>0</b><span>stale plugins, ever</span></div>
  <div class="stat"><b>&lt;1 day</b><span>typical edit turnaround</span></div>
</div>
```
Add `.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:28px}` + `.stat b{font-family:var(--disp);font-size:clamp(2rem,4vw,2.8rem);color:var(--accent-deep)}` + `.stat span{display:block;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;color:var(--t-dark-mut)}`.

- [ ] **Step 7:** Fallback fix — in the no-WebGL hero, drop `.fb-mesh` (keep only `.fb-shield`) so the reduced-motion/no-JS path doesn't show two patterned fields. (Either remove the `.fb-mesh` element or set `.no-fx .fb-mesh{display:none}`.)

- [ ] **Step 8:** Verify — `node _qa/check.cjs noerrors`; `node _qa/check.cjs reduce` and `nofx` (add these checks: load with reduce/noFx flags, screenshot, assert zero errors + fallback hero visible).

- [ ] **Step 9: Commit**

```bash
git add index.html
git commit -m "style(webcare): one signature, one light, CTA nudge, per-card accents, plan furniture, stat proof, fallback fix"
```

---

## Phase 4 — Hero spectacle ("Crystallize", staged)

> Every task here is gated to `!light && !reduce` inside the FX IIFE. After each, verify desktop (full tier), then `reduce` and `nf x` and mobile (`light`) still render the existing fallback with zero errors.

### Task 12: Bloom (UnrealBloomPass)

**Files:**
- Modify: `index.html` CDN tags (`~861-863`) + FX init (`~998-1010`) + frame loop (`~1178`).

- [ ] **Step 1:** Add addon `<script defer>` tags after the three.js tag, from jsDelivr r128, in order: `CopyShader.js`, `LuminosityHighPassShader.js`, `EffectComposer.js`, `MaskPass.js`, `RenderPass.js`, `ShaderPass.js`, `UnrealBloomPass.js`, `GammaCorrectionShader.js`. (Each URL: `https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/<path>.js`.)

- [ ] **Step 2:** After `renderer` creation, if `!light && !reduce && THREE.EffectComposer`:

```js
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const composer = new THREE.EffectComposer(renderer);
composer.setPixelRatio(Math.min(dpr, 1.5));
composer.setSize(innerWidth, innerHeight);
composer.addPass(new THREE.RenderPass(scene, cam));
const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.7, 0.4, 0.6);
composer.addPass(bloom);
composer.addPass(new THREE.ShaderPass(THREE.GammaCorrectionShader));
st.composer = composer; st.bloom = bloom;
```

- [ ] **Step 3:** Frame loop — replace `renderer.render(scene,cam)` with:

```js
if (st.composer) { st.bloom.strength = 0.3 + st.form * 0.7; st.composer.render(); }
else renderer.render(scene, cam);
```

- [ ] **Step 4:** Resize handler — add `if (st.composer) { st.composer.setSize(innerWidth, innerHeight); }`.

- [ ] **Step 5: Verify** — add `hero` check: desktop load, assert `canvas#gl` present + no errors; screenshot idle + scroll to ~50% + ~90% (capture `hero-idle/mid/full`). Run `reduce` + `nofx` + mobile → all clean.

- [ ] **Step 6: Commit**

```bash
git add index.html _qa/check.cjs
git commit -m "feat(webcare): UnrealBloomPass glow crescendo on the particle hero (desktop tier)"
```

---

### Task 13: Cursor-reactive particle shader

**Files:**
- Modify: `index.html` FX — shield `PointsMaterial` setup (`~1093`), pointer handling (`~1117-1133, 1171-1175`), uniforms.

- [ ] **Step 1:** Add uniforms on the shield points material via `onBeforeCompile`:

```js
const su = { uMouse: { value: new THREE.Vector2(0, 0) }, uTime: { value: 0 }, uRadius: { value: 0.42 }, uBoost: { value: 1.0 } };
sMat.onBeforeCompile = (shader) => {
  Object.assign(shader.uniforms, su);
  shader.vertexShader = 'uniform vec2 uMouse; uniform float uTime; uniform float uRadius;\n' + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `#include <begin_vertex>
     vec2 _mp = uMouse * vec2(${(innerWidth/innerHeight).toFixed(3)}, 1.0);
     float _d = distance(position.xy, _mp * 3.0);
     float _f = smoothstep(uRadius, 0.0, _d);
     transformed.xy += normalize(position.xy - _mp * 3.0 + vec2(0.0001)) * _f * 0.35;`
  );
};
st.su = su;
```
(Repel in XY, approximate screen→world via NDC scaled by aspect. `_mp*3.0` maps NDC into the shield's local span — tune in QA.)

- [ ] **Step 2:** Brighten on hover — also inject into the `gl_PointSize`/color via a small multiplier, OR simpler: bump the whole material `color` slightly and add a second additive "halo" sprite at the cursor position that follows `uMouse` (a cheap, reliable glow that doesn't need per-particle color injection). Implement the halo sprite as the primary safe path:

```js
const haloTex = makeGlowSprite(); // reuse the existing radial-gradient CanvasTexture helper
const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: 0xff7cc2, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false }));
halo.scale.set(2.2,2.2,1); shield.add(halo);
```
Update each frame: `halo.position.set(su.uMouse.value.x*3.0*asp, su.uMouse.value.y*3.0, 0.2); halo.material.opacity += ((mx||my?0.5:0) - halo.material.opacity)*0.1;`

- [ ] **Step 3:** Wire pointer → `su.uMouse` eased (reuse the existing `cmx/cmy` ease; set `su.uMouse.value.set(cmx*1.0, cmy*1.0)` and `su.uTime.value = tAcc`).

- [ ] **Step 4: Verify** — extend `hero` check: `await page.mouse.move(...)` over the canvas, screenshot, assert halo opacity rises + no errors. If repel looks wrong in QA, **fallback:** set `uBoost=0` (repel off, halo-only) — still satisfies "this field is alive."

- [ ] **Step 5: Commit**

```bash
git add index.html _qa/check.cjs
git commit -m "feat(webcare): cursor-reactive particles + cursor halo glow (hero is alive)"
```

---

### Task 14: Procedural 3D chrome shield (crystallize)

**Files:**
- Modify: `index.html` FX — after shield group creation (`~1094-1107`).

- [ ] **Step 1:** Build a `THREE.Shape` from the shield cubic-Bezier `segs[]` (already defined `~1059-1063`):

```js
const shp = new THREE.Shape();
segs.forEach((s, i) => { const P = cubic(s, i===0?0:1); i===0 ? shp.moveTo(P[0], P[1]) : shp.bezierCurveTo(s[0],s[1],s[2],s[3],P[0],P[1]); });
```
(If `cubic(P,t)` returns endpoints rather than control pts, adapt: walk each segment `t∈[0,1]` and `lineTo` sampled points — simpler and robust. Prefer the sampled-`lineTo` approach to avoid control-point confusion.)

- [ ] **Step 2:** Extrude + center:

```js
const geo = new THREE.ExtrudeGeometry(shp, { depth:0.25, bevelEnabled:true, bevelThickness:0.08, bevelSize:0.08, bevelSegments:3, steps:1 });
geo.center();
```

- [ ] **Step 3:** Chrome material — custom ShaderMaterial (Fresnel rim + gradient env + emissive core):

```js
const chromeMat = new THREE.ShaderMaterial({
  transparent:true, depthWrite:false,
  uniforms:{ uTime:{value:0}, uForm:{value:0}, uColorA:{value:new THREE.Color(0xff74b7)}, uColorB:{value:new THREE.Color(0x7a6cf5)}, uRim:{value:new THREE.Color(0xffffff)} },
  vertexShader:`varying vec3 vN; varying vec3 vV;
    void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader:`varying vec3 vN; varying vec3 vV; uniform vec3 uColorA,uColorB,uRim; uniform float uForm;
    void main(){ float fr = pow(1.0 - max(dot(vN,vV),0.0), 2.5); vec3 base = mix(uColorA,uColorB, fr); vec3 col = mix(base, uRim, fr*0.8) + uColorA*0.25*uForm; gl_FragColor = vec4(col, 1.0); }`
});
const shield3D = new THREE.Mesh(geo, chromeMat); shield3D.scale.setScalar(0.0001); shield.add(shield3D);
st.shield3D = shield3D; st.chromeMat = chromeMat;
```
(Fallback if shader misbehaves: `new THREE.MeshStandardMaterial({color:0xc01068, metalness:0.92, roughness:0.16, emissive:0x3a0520, transparent:true})`.)

- [ ] **Step 4:** Animate crystallize in the frame loop:

```js
const cf = st.form; // 0..1
st.shield3D.scale.setScalar(0.0001 + cf*cf*2.5);            // ease-in grow
st.shield3D.rotation.y = Math.sin(t*0.16)*0.05 + cf*0.4;    // settle
st.chromeMat.uniforms.uForm.value = cf;
st.chromeMat.uniforms.uTime.value = tAcc;
// dim particles as the solid mark reads:
sMat.opacity = (1 - Math.max(0, cf-0.7)*1.2);               // fade inner particles past 0.7
```

- [ ] **Step 5:** Gate — wrap shield3D creation/animation in `if(!light && !reduce)`. Reduced-motion: instantiate shield3D at full scale with no per-frame changes.

- [ ] **Step 6: Verify** — `hero` check screenshots idle/mid/full: at full formation the chrome shield is visible, particles dimmed, no errors. `reduce`/`nofx`/mobile clean.

- [ ] **Step 7: Commit**

```bash
git add index.html _qa/check.cjs
git commit -m "feat(webcare): procedural chrome shield crystallizes at full formation (Max tier)"
```

---

### Task 15: Pinned scroll-cinema beat (CLS-gated)

**Files:**
- Modify: `index.html` FX — `initScroll` (`~1200-1227`), only when `hasGSAP && !reduce && !light`.

- [ ] **Step 1:** Add the pin (behind a constant flag `PIN = true`):

```js
if (PIN) {
  ScrollTrigger.create({
    trigger: '#top', start: 'top top', end: '+=55%', pin: true, scrub: 0.8,
    onUpdate: (self) => {
      const p = self.progress;
      st.pinP = p;
      st.form = 0.26 + p*0.74;            // drive formation 0.26→1.0 across the pin
      if (st.bloom) st.bloom.strength = 0.3 + st.form*0.7;
    },
    onLeaveBack: () => { st.form = 0.26; }
  });
}
```
Keep the existing (non-pin) scroll scrub intact for the `light`/`reduce`/fallback path; the pin only replaces the formation driver on full-tier desktop.

- [ ] **Step 2: CLS/lifecycle verify** — add `cls` check: load desktop, capture `performance.getEntriesByType('layout-shift')` after a full scroll-up/scroll-down; assert **cumulative CLS < 0.05** and zero console errors. Also assert scrolling back up fully resets the hero (no stuck pin residue).

```js
cls: async () => {
  const { browser, page, errors } = await loadPage({ width: 1440, height: 900 });
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  for (let y = 0; y <= 1600; y += 200) { await page.mouse.wheel(0, 200); await page.waitForTimeout(120); }
  for (let y = 0; y <= 1600; y += 200) { await page.mouse.wheel(0, -200); await page.waitForTimeout(120); }
  const cls = await page.evaluate(() => {
    const e = performance.getEntriesByType('layout-shift');
    return e.reduce((s, x) => s + (x.hadRecentInput ? 0 : x.value), 0);
  });
  console.log('CLS', cls.toFixed(4), 'errors', errors.length);
  if (cls > 0.05 || errors.length) process.exitCode = 1;
  await browser.close();
},
```

- [ ] **Step 3: Decision gate** — if CLS ≥ 0.05 OR any error, set `PIN = false`, commit as scrub-only (the crescendo still works unpinned), and note in BUILD-NOTES. Do not ship a pin that shifts layout.

- [ ] **Step 4: Commit**

```bash
git add index.html _qa/check.cjs
git commit -m "feat(webcare): pinned scroll-cinema crescendo (CLS-verified) / scrub-only fallback"
```

---

## Final — docs & QA log

### Task 16: BUILD-NOTES update + full QA pass

**Files:**
- Modify: `BUILD-NOTES.md` (append), run all checks.

- [ ] **Step 1:** Run the full QA suite: `node _qa/check.cjs <each>`. All must pass: `noerrors`, `favicon`, `form`, `proof`, `tints`, `hero`, `reduce`, `nofx`, `atmosphere`, `cls`.

- [ ] **Step 2:** Append to `BUILD-NOTES.md` a new section: "Living Shield upgrade (2026-07-13)" — concept delta, the Max-tier hero (bloom/cursor/crystallize/pin), atmosphere upgrades, conversion rework (Netlify wired, case studies, lead magnet, booking, sticky CTA), the favicon B change, all `SLOT: verify` items listed for the owner, the QA log (viewports, errors=0, CLS), and a retro (3 lessons). Note `PIN` final state (on/off).

- [ ] **Step 3:** Final lineup: open the live `index.html` next to klientboost.com and mightycitizen.com — confirm it reads a tier above and the 5-second test passes (a stranger knows what WebCare does + how to start).

- [ ] **Step 4: Commit**

```bash
git add BUILD-NOTES.md index.html
git commit -m "docs(webcare): Living Shield BUILD-NOTES + final QA pass"
```

---

## Definition of Done

- Favicon B shipped (svg + 16/32/180/512) and reads on light + dark tabs at 16px.
- Hero (desktop, full-tier): particle field is cursor-reactive, blooms with formation, and crystallizes a chrome shield; pinned beat ships only if CLS < 0.05.
- Mobile + reduced-motion + no-WebGL keep Fable's static fallback; zero console errors at 390/768/1440; CLS < 0.05.
- Contact form + site-check form POST to Netlify (real delivery on deploy); success state personalized.
- Empty testimonials replaced with results-led case studies (+ SLOT metrics); portfolio shows outcomes; lead magnet + booking + desktop sticky CTA + dead-funnel CTAs + value anchor + capacity signal live.
- L0–L5 atmosphere applied (tints, mesh, mottle, vignette, anchored glows, feathered bridge); one signature + one light; CTA nudge + per-card accents + Plan furniture + stat row.
- All unverified numbers marked `SLOT: verify`; BUILD-NOTES updated with QA log + retro.
