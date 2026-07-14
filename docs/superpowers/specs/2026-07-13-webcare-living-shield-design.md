# WebCare Solutions — "The Living Shield" redesign

**Date:** 2026-07-13
**Author:** Claude (this session)
**Status:** Design — pending user review
**Target file:** `09-website-projects/webcare-solutions/index.html` (single-file, CDN libs) + `assets/favicon-*`
**Builds on:** Fable's "Signal Garden" flagship (`BUILD-NOTES.md`), escalating its signature rather than replacing it.
**Scope decision (user, this session):** Keep single-file + Fable's best bones; reimagine the hero into a 3D showpiece; apply the full atmosphere doctrine page-wide; rework the path to signup. Wow priority = **spectacle + craft** (3D hero + atmosphere/motion). Conversion ships as part of the path-to-signup rework.

---

## 1. Context & goals

WebCare Solutions is the studio's own buyer-facing flagship (webcare.solutions, Bryan–College Station TX → Houston). Fable shipped it at ~8/10: a three.js r128 particle-mesh hero whose particles assemble into the shield+check on scroll, full atmosphere tokens, 6 masked motif placements, reduced-motion + WebGL fallback, a 3-field contact form, honest placeholder testimonials. Single `index.html` (~85 KB) + 3 webp thumbs (~118 KB) ≈ 200 KB excluding CDN.

**Goals**
1. **Outdo Fable** — a clearly higher tier of 3D spectacle and craft, not a lateral move.
2. **Fix the favicon** — the current pointed-top "kite" with an ink-colored check reads wrong at small sizes; ship a brand-correct, legible mark.
3. **Drive signups** — fix the silent lead loss and the trust-destroying empty proof.

**Non-goals (deferred, §12)** — migrate off three.js r128; GPGPU particles; real GLB sourcing (we use procedural geometry instead); SEEDANCE ambient video; new portfolio lanes; city landing pages.

---

## 2. Locked decisions (this session)

| Decision | Choice |
|---|---|
| Favicon | **B — Bold** (sturdy flat-arched shield, heavy white check, cleanest at 16px) |
| Hero tier | **Max — "Crystallize"** (bloom + cursor-reactive particles + procedural 3D chrome shield + one pinned cinema beat) |
| Atmosphere + motion craft (§7) | Ship all |
| Conversion rework (§8) | Ship all |
| Contact form delivery | **Netlify Forms** (zero-JS native fallback + AJAX success state) |

---

## 3. Concept — "The Living Shield"

Fable's hero concept is "a living thing under a steady shield": a particle field that assembles into the mark on scroll. The redesign keeps that soul and escalates it one tier:

- **Alive** — particles repel and brighten around the visitor's cursor (the hero copy "This field is alive — move your pointer" becomes literally true).
- **Luminous** — a real bloom pass makes the additive magenta field glow, crescendoing as the shield forms.
- **Crystallizes** — at the scroll crescendo, a solid magenta-chrome 3D shield crystallizes at the center while particles orbit the formed mark.

Same signature, a tier more craft. Everything else on the page whispers; this is the one moment. The 3D shield is **procedural geometry built in code from the exact shield outline already in the file** — no external GLB, no GLTFLoader (saves ~96 KB and all asset risk).

---

## 4. Design-system deltas (tokens)

Palette and type are unchanged (they're strong). Targeted fixes only:

- **Radii → 8px rhythm:** `--r-lg: 22px → 24px`; button radius `14px → 16px`. Scale becomes 8/12/16/24.
- **Motif opacity floor:** `mot-shield-r` `.05 → .07`, `mot-check-tl` `.05 → .065` on light sections so the studio signature passes the toggle test (currently sits at the bottom of the 3–8% band and reads as invisible).
- **Measure:** hero-sub `max-width: 52ch → ~64ch` (doctrine prefers 60–75ch for long-form).
- **Violet `--cool #7A6CF5`** stays **atmosphere-only** — codify in a code comment that it must never become a UI accent (keeps the 2-color + one-accent rule).

---

## 5. Favicon spec (Decision: B)

**Primary SVG favicon** (square 64 viewBox, flat-arched heater shield, heavy white check):

```
viewBox 0 0 64 64
shield: M8 12 C8 7 12 6 16 6 L48 6 C52 6 56 7 56 12 L56 30 C56 44 47 54 32 59 C17 54 8 44 8 30 Z
fill #FF0288, stroke #C01068 (1.2)
check: M19 33 L28.5 42 L47 21, stroke #fff, width 7.6, round caps/joins
```

(Exact SVG already rendered + verified in `favicon-options.html` / `favicon-lab.png`.)

**Full icon set to ship** (generated from the SVG via a headless render at 2× DPR):
- `favicon.svg` — primary (adaptive: optional `@media (prefers-color-scheme)` later; B already reads on both).
- `apple-touch-icon.png` 180×180.
- `favicon-32.png`, `favicon-16.png` — legacy tab fallback.
- `icon-512.png` (maskable, padded ~10% safe-area) — PWA/home-screen.

**`<head>` block:** `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` + `<link rel="icon" href="/favicon-32.png" sizes="32x32">` + `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` + `<link rel="icon" href="/favicon-16.png" sizes="16x16">` + existing `theme-color` (keep `#0D0A14`, or bump to `#0D0A14` — unchanged). Update the **OG image** slot (line 15, currently a client's hero `lov_hero.webp`) → a branded 1200×630 render of the shield+check + tagline (generated; SLOT until rendered).

**Asset location:** `assets/` (alongside existing webp). Generated PNGs via the same playwright render used for the lab.

---

## 6. Hero — "Crystallize" tier (the signature)

Builds on the existing FX IIFE (`index.html` FX block ~lines 967–1229). All three layers are **additive to Fable's scene**, gated to `!light && !reduce` (mobile + reduced-motion keep the current particle hero + static fallback). Enabler confirmed by research: **jsDelivr serves the full three.js r128 `examples/js` UMD addon set** (cdnjs only hosts `build/three.min.js` for r128) — so we add modern post-processing without leaving r128 or adding a build step.

### 6.1 CDN addons (add after `three.min.js`, before GSAP)
From `https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/...`, in dependency order:
`CopyShader.js`, `LuminosityHighPassShader.js`, `EffectComposer.js`, `MaskPass.js`, `RenderPass.js`, `ShaderPass.js`, `UnrealBloomPass.js`, `GammaCorrectionShader.js`.
(~8 KB gzip total, excluded from page payload.) **Do NOT load GLTFLoader** — the 3D shield is procedural.

### 6.2 Bloom (UnrealBloomPass)
- `composer = new THREE.EffectComposer(renderer); composer.setPixelRatio(Math.min(dpr,1.5))`.
- Pass chain: `RenderPass(scene,cam)` → `UnrealBloomPass(Vec2(w,h), strength=0.7, radius=0.4, threshold=0.6)` → `ShaderPass(GammaCorrectionShader)` (r128 has no `OutputPass`; GammaCorrection is the tail pass that fixes the composer's washed/dark color).
- `renderer.toneMapping = THREE.ACESFilmicToneMapping` before composer.
- Frame loop: replace `renderer.render(scene,cam)` (line ~1178) with `composer.render()`.
- **Crescendo:** `bloom.strength = 0.3 + st.form*0.7` — glow grows with shield assembly.
- Gate: `!light && !reduce`. On `light`/`reduce`, keep direct `renderer.render`.
- Resize: `composer.setSize(w,h)` alongside the existing debounced resize.

### 6.3 Cursor-reactive particle shader
- Normalize pointer to NDC, ease into a `vec2 uMouse` uniform on the **shield** `PointsMaterial` (via `onBeforeCompile` — preserves Fable's additive material) plus `float uTime`.
- Vertex shader injection: project particle screen pos, compute `dist` to `uMouse`; within `uRadius`, **repel** in XY by `force*(1-dist/uRadius)` and **boost** point size ×1.8 + push color toward white — leaving a glowing comet trail as the cursor sweeps.
- Pointer is eased (reuse `cmx/cmy` ease pattern, line ~1171) so the field feels viscous, not jumpy.
- Keep the existing camera parallax (don't remove); the shader is additive interaction on top.
- **Fallback:** if space-mapping looks wrong in QA, degrade to "brighten only, no repel" (still satisfies the copy) — the repel is the risk, the brighten is the safe core.

### 6.4 Procedural 3D chrome shield (the "crystallize")
- Build a `THREE.Shape` from the **same cubic-Bezier shield outline** already in the file (`segs[]`, lines ~1059–1063) — brand-exact silhouette.
- `new THREE.ExtrudeGeometry(shape, {depth:0.25, bevelEnabled:true, bevelThickness:0.08, bevelSize:0.08, bevelSegments:3})`, centered & oriented to match the particle shield's plane.
- **Material:** custom `ShaderMaterial` — Fresnel rim (magenta → violet thin-film) + a procedural gradient "env" reflection (no external texture) + emissive magenta core so bloom lights the edges. (Fallback if a custom shader proves finicky: `MeshStandardMaterial{metalness:0.92, roughness:0.16, color:#C01068, emissive:#3a0520}` — still reads as chrome under bloom.)
- Add as a child of the existing `shield` group (inherits position/scale/responsive `layout()`).
- **Animation:** `shield3D.scale 0→1` and material `opacity 0→1` eased on `st.form → 1`; slow y-rotate `sin(t*0.16)*0.05` (mirror the existing shield yaw). As it crystallizes, dim the particle shield's alpha slightly (×0.6) so the solid mark reads, and nudge particles within an inner radius to an **orbit** ring around the solid shield.
- Gate: `!light && !reduce`. Reduced-motion: render the solid shield statically assembled (no scale-in).

### 6.5 One pinned scroll-cinema beat (CLS-gated)
- `ScrollTrigger.create({trigger:'#top', start:'top top', end:'+=55%', pin:true, scrub:0.8, onUpdate})` driving `st.form` target + `bloom.strength` through the crescendo (scatter → assemble → crystallize → glow peak), then release into the trust strip.
- **Risk-managed:** pinning can cause CLS; BUILD-NOTES deliberately avoided it. Implement behind a flag, **verify CLS = 0 and no layout shift** at 390/768/1440. **If any regression, revert to the existing scrub-only camera path** (the crescendo still works unpinned — pin only adds the held beat). This is the single riskiest piece; stage it last.

### 6.6 Resolve the signature clash (doctrine: ONE signature)
- The hero currently runs **two** signature moments: the particle assembly **and** the hand-drawn underline stroke on "Ours get looked after." Make the underline draw near-instant / drop its dash animation so the crystallizing shield is unambiguously *the* moment.
- The hero has **two competing light sources** (`hb1` magenta top-right, `hb2` violet bottom-left). Make `hb2` a subordinate fill (lower opacity / smaller) so the dominant light is top-right, matching every wash on the page.

### 6.7 Guardrails preserved
DPR cap 2 (composer ≤1.5) · particle tiers by width/deviceMemory/cores · rAF paused via IntersectionObserver + visibilitychange (dt-accumulated clock) · full WebGL feature-detect + try/catch → `.no-fx` static fallback · `prefers-reduced-motion` → fallback + no scrubs/crystallize + instant reveals · deferred boot after `load`+60ms · zero console errors. LCP stays the text headline (canvas boots after load).

---

## 7. Atmosphere + motion craft (page-wide)

All free (pure CSS, ~0 KB), lifted from the studio's L0–L5 doctrine. Exact targets from research:

- **L0 — kill pure `#fff`:** service cards (line ~227), chips (~271), chart-card (~273), care-log (~304), testimonials `rgba(255,255,255,.6)` (~320) → warm paper tints (`#FCFAFC` / `#FAF6FA`) or, on dark sections, tinted `--ink-2`.
- **D-01 — deepen the flat dark sections:** replace/augment `wash-d` in the **process** section with the full 4-radial mesh (violet `.45`, magenta `.30`, deep-magenta `.50`, ink `.55`) + grain. (One section first; the lab's stated #1 fix: "dark sections should be its deepest, currently its flattest.")
- **L-03 — paper mottle** behind the **care-log/about** prose (large-scale turbulence tile, ≤9% multiply under existing grain — the care-log is a printed artifact, on-concept). Lift `--mottle` data-URI from `background-depth-lab.html`.
- **D-05 — cinematic vignette** on **contact**: `.vin-warm` (magenta-soft center, recentered on the form) + `.vin-edge` (darkened edges) + grain `.22` overlay — frames the form like a candle-lit desk; "sheltering edges" = guardianship.
- **Anchor the floating glows** to content: portfolio glow (top:-140px → behind the "Our work" heading block), contact glow (right:-100px → behind the `.fpanel` form). Glows light real elements, never float.
- **L5 — one feathered bridge** at a dark→light seam (portfolio→difference or process→about): `.r-feather` gradient melt, soft contrast to the angular clip-path cuts. One per page.
- **Fallback fix:** the no-WebGL hero shows **both** `.fb-mesh` and `.fb-shield` (two patterned fields in one viewport — a house-rule violation). Keep only `.fb-shield` (the concept motif); drop or re-mask `.fb-mesh` to the opposite corner.

**Motion + elements:**
- **CTA arrow-nudge** (B-02): `.btn:hover svg{transform:translateX(3px)}` + `transition` — missing today, cheap high-impact (hits every CTA: hero, nav, Plan, contact, pf-links).
- **Per-card `--acc`:** `.svc:nth-of-type(1..4){--acc:…}` → Church `--accent`, Business/e-com `--cool`, Hosting `--accent-deep`, SEO `--accent-soft`; re-tint `.ico` bg, `.tag` border, hover border in lockstep.
- **WebCare Plan banner:** add C-07 furniture (floating `.fchip` + slow `.orbit` ring + blurred `.godrays` conic) recolored behind the existing `.plan-shield`; gild the "The WebCare Plan" h3 with the hero gradient.
- **Stat-proof row** under the Difference chart (C-08): 3 large numerals — e.g. `12 / months of care`, `0 / stale plugins`, `<1 day / edit turnaround`. Converts the chart's story into proof.
- **Personalized form success:** JS reads `f-name`, swaps heading → "Got it — thank you, **{first}**." (box already has `role=status` / `aria-live`).
- **Icon family (optional consistency pass):** adopt the studio's 30-icon set (24px, stroke 1.7, `currentColor`) for utility spots — phone, mail, map-pin, shield-check — to unify the currently ad-hoc SVG sizes. Keep the bespoke service-card icons (they're more specific).

---

## 8. Conversion rework (path to signup)

### 8.1 🔴 Wire the form — Netlify Forms (highest impact)
Currently the submit handler (`preventDefault` + `checkValidity` + swap to `#form-done`, lines ~957–964) **sends nothing** — 100% lead loss.
- Markup: `<form id="cform" name="webcare-contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" novalidate>`; add hidden `<input type="hidden" name="form-name" value="webcare-contact">` and honeypot `<p hidden aria-hidden="true"><label>Leave blank <input name="bot-field"></label></p>`.
- JS: keep `preventDefault` + `checkValidity`; `fetch(location.href, {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams(new FormData(form))})`; on `ok` → swap to personalized `#form-done`; on fail → inline error + keep field values. **Native submit still works if JS is disabled** (Netlify handles it server-side on deploy).
- **Note:** Netlify only receives on deploy to Netlify; locally the fetch resolves to the static page (200) and the success state shows — fine for the demo, real delivery on deploy. Documented in BUILD-NOTES.

### 8.2 Kill the empty testimonials (#words)
Placeholder "This space is reserved / Awaiting a real client" social proof **actively reduces trust** (worse than none). Replace with:
- **3 results-based mini case-study tiles** for the live sites (LOV COGIC, seedframes, DeedSlice) — each Challenge→Approach→Result with 1–2 honest metrics. **Metrics marked `SLOT: verify`** until confirmed with clients (no invented numbers).
- **1 founder credibility card** (who you are, years building sites, local).
- Reframe copy: "References on request — here's what we've shipped."

### 8.3 Add a second, low-friction path (lead magnet)
A **"Free 60-second site health check"** (speed + SEO + mobile + security score, delivered by email) for the ~80% not ready to "Start a project."
- Secondary hero CTA (alongside Start a project / Call).
- A dedicated band between **Difference** and **Process**.
- Capture: an **email-only field** on the band's own small Netlify form (`name="site-check"`, same AJAX pattern as 8.1). The main contact form (8.1) additionally gains a project-type chip set including "Free site audit" so either path can route to the same follow-up. One follow-up workflow, two entry points.

### 8.4 Portfolio → outcomes
Each live card (LOV COGIC, seedframes, DeedSlice) gets 1–2 real metrics (e.g. "online giving live week 1," "load 4.1s→1.2s," "#1 for 'Bryan church' in 6 weeks"). Metrics marked `SLOT: verify`.

### 8.5 Response-time proof + booking
Replace the vague "reply within one business day" with a measurable claim — **"Replies in under 4 business hours, on average"** — and add a **"Book a 15-min call"** Cal.com/Calendly link (placeholder URL) next to click-to-call, in the contact section and nav.

### 8.6 Desktop sticky CTA + dead-funnel CTAs
- Add a slim **desktop** sticky CTA bar (Start a project + Call) appearing after the hero (mobile already has one).
- Add a CTA after the **Difference** chart (ends abruptly) and after **Process** step 4 — catch visitors at peak persuasion.

### 8.7 Value anchor for "no public prices"
Replace "Quoted for your exact needs — no games" (line ~527) with an anchor + reassurance: **"New sites typically start at $X — every quote is itemized"** (X marked to fill) or a compact "What's included" mini-tier. Pre-qualifies leads; reduces the "too expensive, won't call" bounce.

### 8.8 Services copy: features → outcomes
Rewrite the 4 service tags from features ("Online giving built in") to client outcomes ("Turn first-time visitors into members," "Get found by Houston customers ready to buy," "Recover leads your slow site is losing").

### 8.9 Honest capacity signal + trust badges
- **Capacity:** "2 onboarding slots open this month" on the Plan card / contact — **must be kept current/truthful** (mark SLOT; fake scarcity backfires).
- **Trust badges:** Google Partner (Ads), WordPress/WooCommerce — **only if genuinely earned**; placeholder row marked "add when earned." Place in trust strip + footer.

---

## 9. Performance & guardrails (budget)

- **Payload:** HTML stays well under ~250 KB (was 85 KB; additions are CSS/JS, modest). CDN libs excluded. No GLTFLoader (−96 KB). Bloom addons ~8 KB gzip CDN. New favicon PNGs are tiny. **Target: page transfer excl. CDN < 600 KB; Lighthouse ≥ 95.**
- **Gates:** every 3D upgrade (bloom, cursor shader, crystallize, pin) gated to `!light && !reduce`. Composer pixelRatio ≤ 1.5.
- **Reduced-motion / no-WebGL:** static fallback hero (shield motif + ghost shield + grain), instant reveals, no scrubs, no crystallize animation.
- **AA contrast:** verify the new paper tints and bump any small text alpha < .75 to ≥ .75.

---

## 10. QA plan

- **Render** at 390×844 (mobile), 768, 1440×900 via the available playwright chromium — scroll-through, fx + reduced-motion + no-fx in each.
- **Toggle test:** strip `.atm` layers — layered must be visibly richer, not the first thing you notice.
- **Lineup test:** vs 2 reference agency sites (klientboost.com, mightycitizen.com) — does it read a tier above?
- **Form test:** markup parses; AJAX success state fires locally; document that delivery needs Netlify deploy.
- **Bloom/cursor/crystallize:** screenshots at idle, mid-scroll, full formation; verify zero console errors.
- **CLS check** specifically around the pinned beat; revert to scrub-only if > 0.
- Update `BUILD-NOTES.md` with a QA log + retro (per studio convention).

---

## 11. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Pinned beat causes CLS | CLS-verified; fallback to scrub-only crescendo |
| Cursor shader space-mapping looks off | Degrade to "brighten only, no repel" |
| Procedural chrome looks flat w/o envMap | Fresnel rim + bloom compensate; fallback `MeshStandardMaterial` high-metalness |
| Netlify only delivers on deploy | Document; local AJAX degrades to success state for demo |
| Honesty (metrics/testimonials/capacity) | All unverified values marked `SLOT: verify`; no invented proof |

---

## 12. Out of scope (deferred)

GPGPU particle rewrite · migrate to three.js importmap (0.169+) / native iridescence · real GLB sourcing (procedural shield used instead) · SEEDANCE ambient video · additional portfolio lanes (Quiet Cathedral / City Plant) · dedicated Bryan/College Station/Houston landing pages · Google Business Profile setup (owner action) · OG image final render (SLOT).

---

## 13. File map

- `index.html` — all code changes (head/favicon, tokens, hero FX additions, atmosphere classes, motion, conversion markup + JS).
- `assets/favicon.svg`, `apple-touch-icon.png` (180), `favicon-32.png`, `favicon-16.png`, `icon-512.png`, `og-image` (SLOT) — new.
- `favicon-options.html` + `favicon-lab.png` + `_shot-favicon.cjs` — design exploration artifacts (keep as record, or clean up at handoff).
- `BUILD-NOTES.md` — append QA log + retro.
