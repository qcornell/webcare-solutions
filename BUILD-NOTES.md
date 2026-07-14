# WebCare Solutions — Flagship Studio Site · BUILD NOTES

**Build:** `09-website-projects/webcare-solutions/index.html` (single file + `assets/`)
**Client facts (verified, no inventions):** WebCare Solutions · webcare.solutions · (979) 595-6330 · Bryan–College Station, TX (serves Houston) · magenta/black/white, shield-with-check mark · Services: church community websites (online giving), business sites & e-commerce, hosting + WordPress maintenance, SEO & digital marketing (Google Ads/PPC), the monthly WebCare Plan. No public prices → CTAs are "Start a project" / call. No testimonials yet → labeled reserved slots.

## Concept sentence
**"Most websites get launched. Ours get looked after."** — a living site under a steady shield. The name is the strategy: build premium, then care monthly. Every design decision derives from *living thing + guardianship*: a breathing particle-mesh that assembles into the shield as you scroll (chaos → cared-for order), care-log artifacts, monthly tick marks, the process step that "never ends."

## Three directions considered
1. **The Signal Garden** (chosen) — the site as a living organism: deep-ink space, magenta/violet particle-mesh landscape, the shield mark grown out of particles; light "greenhouse" sections for services/about. Elevates the wave language of their current template into a real system.
2. **The Watchhouse** — monumental brand-first guardianship: giant shield geometry, Swiss editorial grid, heavier black, slab confidence. Strong but static — doesn't demonstrate motion craft, and "care" reads as security only.
3. **The Studio Ledger** — print-shop warmth: paper-white dominant, magenta ink stamps, care-log/checklist motifs everywhere, receipts of monthly work. Charming, but under-flexes the 3D ceiling the flagship must prove.

**Choice rationale:** Signal Garden carries the concept (living thing) AND the craft flex (three.js signature), while folding in the best of #2 (the particle shield moment) and #3 (the care-log card in About). This is the studio's own buyer-facing proof of ceiling.

## Design system
- **Palette:** ink `#0D0A14` (violet-cast near-black, never pure), paper `#FBF8FB`/`#F4EDF3`, magenta ramp — lead `#F0288F` (5.08:1 on ink), soft `#FF7CC2` (8.4:1 on ink, small text), deep `#A80E63` (~7:1 on paper, small text) — support violet `#7A6CF5` (atmosphere only).
- **Type:** Space Grotesk (display 500–700) + Inter (body 400–600). NOT Fraunces (church-brand face). Fluid clamp() scale, 8px rhythm.
- **Motif family (house rule — ONE family, stroke 1.1, 3–8%, always masked):** shield-outline tile + node-and-line mesh tile + tiny check-tick grid = the "cared-for network" world. **Six placements:** services (shield, ink, right mask) · portfolio (mesh, white, bottom-left) · difference (check grid, top-left) · process (shield, white, right) · about (mesh, ink, left) · footer (check grid, white, bottom-right). Hero fallback carries the mesh + ghost shield. Never two patterned fields in one viewport.
- **Edges:** hero feather-melt into trust strip; angled clip-path cuts (rise-to-right) on portfolio + contact. No scallops.
- **Micro-interactions:** magnetic CTAs (≤6px), underline draws (nav, links, big phone), portfolio card lift + JS tilt ≤3°, form focus glow, LIVE badge pulse.
- **Rhythm:** dark hero/trust → light services → dark portfolio → light difference → dark process → light about/words → dark contact/footer. The page breathes.

## The 3D signature (three.js r128 + GSAP ScrollTrigger, cdnjs only)
- **Scene:** particle-mesh landscape (Points + LineSegments sharing ONE position buffer — one CPU wave update animates both), ~9.9k verts desktop / ~2.4k mobile; 760/400-particle shield that lerps from scatter → shield+check targets (sampled from bezier outline + check polyline); soft round sprite texture (no square points); anchored glow sprite; 240 dust motes; FogExp2 depth.
- **Direction:** mouse parallax eases the camera; scroll over the hero scrubs camera push/tilt AND assembles the shield (form = max(idle-hint 0.26, smoothstep of scroll)). Two more scroll systems deeper: process rail fills + steps light sequentially (scrub), portfolio thumbs parallax ±5.5% (composited via `scale` property so hover zoom still works). No pinning, no scroll-hijack.
- **Guardrails implemented:** DPR capped at 2 · particle tiers by width/deviceMemory/cores · rAF paused via IntersectionObserver + visibilitychange (dt-accumulated clock, no jump on resume) · full WebGL feature-detect + try/catch → `.no-fx` static fallback (aurora blobs + mesh motif + ghost shield SVG + grain — genuinely beautiful, verified by screenshot) · `prefers-reduced-motion` → fallback + no scrubs + instant reveals (verified: `class="js reduce no-fx"`, zero errors) · all Three/GSAP init deferred until after `load` + 60ms · zero console errors across all runs.

## Sections
Sticky nav (inline SVG shield+check, 5 items + CTA, full-screen mobile menu w/ focus management) · 3D hero (positioning line, sub, Start a project + call CTAs, live-field hint) · trust strip (purpose-built / local & reachable / build+care one roof) · services (4 cards + featured WebCare Plan banner w/ shield watermark) · portfolio ("Real builds, really cared for": LOV COGIC badged LIVE → lov-cogic.com; Faith Temple + Kingdom Kidz badged Studio demo) · WebCare Difference (12-month cared-for vs abandoned SVG chart, line-draw on view, monthly care dots) · process (Scout → Concept → Build → Care, scroll-lit, "repeats monthly" tag) · about (Aggieland, faith-friendly + care-log card) · testimonials (honest reserved slots) · contact (3-field form, warm success state, big phone) · footer (real facts + JSON-LD ProfessionalService). Head: title/meta/OG/theme-color/favicon (shield data-URI). Upgrade slots comment-marked: TRIPO3D (GLB shield), SEEDANCE (bg video), OG render, testimonial + portfolio card slots.

## Differentiation from prior builds
Faith Temple (warm gospel heritage, Fraunces, arches), Kingdom Kidz (playful daycare), LOV (church, garden/light) — this is the studio's own voice: tech-organic ink space, grotesque display, node/shield geometry. No overlap in palette, type, motif family, or motion signature.

## QA log
- CDN preflight: three.js r128, GSAP 3.12.5, ScrollTrigger, Google Fonts — all reachable (HTTP 200).
- Render runs (playwright-core + @sparticuz/chromium, swiftshader WebGL, 1440×900 + 390×844, scroll-through):
  - **Run 2:** `js fx` both viewports, zero errors, no overflow — but critique found: "looked after." INVISIBLE (nested span inside `background-clip:text` parent), hero block centered instead of left-anchored, hard square particles, services shield motif at full opacity (missing `.05`), live-hint clipped. All fixed (headline restructured to single gradient element; `.hero-copy` wrap; round sprite texture + tighter scatter/dust; motif opacity).
  - **Run 3:** exposed a sandbox mount quirk (stale size metadata truncated the staged copy mid-script → HTML parser silently dropped the unclosed script). Silver lining: captured the static fallback hero — verified beautiful. Repaired staging by appending the exact tail; both inline scripts Node-syntax-checked OK. (Source file on disk was always complete.)
  - **Run 4 (final):** `js fx` both viewports, **zero page errors, zero overflow**. Captures: webcare_hero / webcare_scroll1 (portfolio) / webcare_light (services) / webcare_mobile → outputs/.
  - **Run 5:** process scroll-lighting + contact captured (steps 01–02 lit, rail mid-fill — scrub confirmed live under swiftshader).
  - **Run 6/7:** reduced-motion → `js reduce no-fx`, canvas hidden, zero errors; form success state swaps + focuses correctly (webcare_success.png).
- Payload (excl. CDN libs): HTML 82.7 KB + 3 webp thumbs 117.8 KB ≈ **200 KB** — well under 600 KB. No localStorage. AA contrast verified by computed ratios above.

## Handoff placeholders
Testimonial slots (2) · OG image (currently lov_hero.webp — replace with branded 1200×630) · form backend (currently inline success state — wire to email/endpoint) · TRIPO3D/SEEDANCE upgrade slots.

## Retro (promote to studio system)
1. `background-clip:text` clips ONLY the element's own text — nested inline elements go invisible. Keep gradient text single-element.
2. GSAP transform parallax + CSS hover zoom must live on different properties (`transform` vs `scale`).
3. Every motif class needs its own opacity — a missing `.05` turns whisper into wallpaper. Add "motif opacity audit" to the shipping checklist.
4. Sandbox mounts can serve stale SIZE metadata (truncated reads) while content pages are fresh — verify staged copies by tail + script syntax-check before rendering.

## Ship pass (2026-07-14) — Task 11 completed, launch blockers cleared

**Task 11 — all 7 steps now landed** (6 were in place; Step 5's furniture was the gap):
1. One signature — hero underline draw cut to `.35s`/`.2s` delay so the particle shield is the unambiguous moment. ✓
2. One light — `hb2` violet blob reduced to `.16` alpha / `opacity:.8` / 40vw; magenta `hb1` dominates. ✓
3. CTA arrow-nudge on `.btn:hover svg` / `:focus-visible`. ✓
4. Per-card `--acc` accents on the four `.svc` cards (magenta / violet / deep / soft). ✓
5. **Plan banner furniture (added this pass)** — `.plan-furn` layer behind the shield: `.godrays` conic sweep, double `.orbit` rings, three `.fchip` care-tokens (Updates / Backups / Edits). Hidden below 900px. Gilded `.plan h3` + hot-chip were already in. ✓
6. Stat row under the 12-month chart (12 / 0 / <1 day). ✓
7. Fallback fix — `.no-fx .fb-mesh{display:none}` so the no-WebGL hero shows one patterned field, not two. ✓

**Phase 4 (Crystallize hero)** — deliberately deferred. The existing three.js particle-mesh + shield-assembly hero ships as-is.

**Launch blockers found and fixed:**
- **`og:image` was `assets/lov_hero.webp`** — a *client's* (LOV COGIC) hero photo was the social card for the studio's own site, and as a relative path it wouldn't resolve for crawlers anyway. Replaced with a branded, generated `assets/og-image.jpg` (1200×630, ink field + magenta glow + mesh motif + real wordmark + phone). Absolute URL. Added `og:image:width/height/alt` + `twitter:image`.
- **`cal.com/webcare` was a live placeholder** on the "Book a 15-min call" CTA — a dead link in the contact section. Repointed to `tel:+19795956330` ("Prefer to talk it through? Call or text…").
- **No `canonical`** — added `https://webcare.solutions/`.
- Added `robots.txt`, `sitemap.xml`, branded `404.html`, `_headers` (immutable asset cache + nosniff/referrer/frame/permissions).

**Deploy — Netlify (not Cloudflare).** The build is committed to Netlify Forms (`data-netlify="true"`, hidden `form-name`, honeypot, real `fail()` path — no fake success). Cloudflare has no form backend; deploying there would silently break both `webcare-contact` and `site-check`. Domain is on Spaceship, which *does* permit nameserver changes, so Cloudflare was technically available — it's just the wrong target for this build.

`netlify.toml` publishes **`dist/`**, not the repo root: a copy step stages only `index.html 404.html robots.txt sitemap.xml _headers assets/`. Root-publishing would have served `BUILD-NOTES.md`, `docs/` (plans, specs, competitor notes) and `_qa/` publicly at webcare.solutions.

**After first deploy:** Netlify → Forms → set an email notification, or submissions accumulate in the dashboard unseen.

**Verified this pass:** tags balanced on both pages · all 11 local asset refs resolve · both inline scripts pass `node --check` · JSON-LD parses (`ProfessionalService`) · no unresolved `SLOT` in `<head>` · shipped payload **469 KB** excl. CDN libs (budget 600 KB).

**Still open:** testimonial slots (2, honestly labeled) · Phase 4 hero · `_qa/check.cjs` visual suite needs a run on the host (sandbox chromium lacks `libXdamage`).

## Phase 4 — "Crystallize" hero (2026-07-14)

The flagship's signature escalated one tier. Three strictly-additive layers, all gated to the desktop/high-memory tier (`!light && !reduce`); mobile and reduced-motion keep the existing particle hero + static fallback.

1. **Bloom** — `EffectComposer` + `UnrealBloomPass` (+ `GammaCorrectionShader` tail pass; r128 has no `OutputPass`) via jsDelivr's `three@0.128.0/examples/js` UMD addons. **No build step, no r128 migration, no GLTFLoader.** Bloom strength crescendos `0.3 → 1.0` with shield formation. Feature-detected (`typeof THREE.EffectComposer`); any addon-load failure falls back to the direct render.
2. **Cursor-reactive field** — shield particles repel from the pointer via an `onBeforeCompile` vertex-shader injection (uniforms `uMouse`/`uTime`/`uRadius`), plus a soft magenta halo `Sprite` that tracks the cursor. Makes the "this field is alive — move your pointer" copy literally true.
3. **Crystallizing chrome shield** — a solid 3D mark built with `ExtrudeGeometry` (beveled) from the **exact same cubic-Bezier outline** the particles form (`segs[]`), shaded with a custom Fresnel/iridescent `ShaderMaterial` (no external GLB, no model asset). It scales in (`form 0 → 1`) and rotates to settle as the field assembles; particles dim past 0.7 so the solid mark reads. Under bloom it glows.

**Deferred (optional):** the pinned scroll-cinema beat. The crystallize crescendo already plays on the existing scrub (assemble → bloom → crystallize as you scroll the hero). Pinning was the one piece avoided for CLS safety (it would also require bridging the `initScene` closure into `initScroll`); revisit only behind a CLS=0 gate.

**Verified (`_qa/check.cjs`, playwright chromium):** desktop `class="js fx"`, canvas live, **zero console errors** at idle / mid-formation / full crystallize; mobile `light` tier runs the particle hero (bloom + crystallize gated off); `prefers-reduced-motion` → `js reduce no-fx` static hero, zero errors; WebGL-disabled → `js no-fx` static hero, zero errors. Full suite green: `favicon`, `form`, `tints`, `proof`, `atmosphere`, `hero`, `reduce`, `nofx`, `noerrors` (desktop + mobile, zero overflow).

