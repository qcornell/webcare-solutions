# WebCare Hero Readability and Conversion Refinement

**Date:** 2026-07-22  
**Status:** Approved direction, based on the screenshot critique and the user's instruction to improve it

## Subject, audience, and job

WebCare Solutions is a Bryan–College Station web design and monthly-care studio serving churches and local businesses. The hero has one job: make the care-based difference immediately understandable and guide a qualified visitor toward starting a website conversation without hiding the phone or free site-check alternatives.

## Existing strengths to preserve

- Keep the dark ink, magenta, violet, and soft-white palette already defined in `index.html`.
- Keep Space Grotesk for display text and Inter for body and utility text.
- Keep the headline: “Most websites get launched. Ours get cared for.”
- Keep the living particle field, mesh landscape, shield formation, magenta underline, and local positioning.
- Keep the current desktop left alignment, mobile menu, keyboard focus treatment, reduced-motion fallback, and WebGL fallback.

## Approaches considered

1. **Light readability patch:** strengthen the scrim and body-copy contrast only. This is low risk but leaves three equal-looking hero actions and an oversized mobile composition.
2. **Conversion-focused refinement — selected:** strengthen readability, establish one primary action, demote the free site check to a text action, and tune mobile spacing and type while preserving the visual signature.
3. **Warmer audience rebrand:** add human photography and soften the visual system. This could feel more familiar to churches and local businesses but would dilute the distinctive living-field concept and exceeds the requested refinement.

## Design system

No new palette or typeface is introduced. The refinement derives from the existing tokens:

- **Ink:** `#0D0A14`
- **Raised ink:** `#130F1E`
- **Magenta:** `#F0288F`
- **Soft magenta:** `#FF7CC2`
- **Primary light text:** `#F2ECF7`
- **Refined supporting light text:** `#D7CEDF`, used only in the hero for stronger separation from the particle field
- **Display:** Space Grotesk, 700 for the hero headline
- **Body and utility:** Inter, 400–600

## Layout and hierarchy

Desktop retains the current left-anchored composition and shield space on the right:

```text
+------------------------------------------------------------------+
| logo                  navigation               Start your website |
|                                                                  |
| [ Web design + monthly care · Bryan–College Station, TX ]        |
| Most websites get launched.                  living particle      |
| Ours get cared for.                          shield field          |
| Supporting sentence with stronger contrast                       |
| [ Start your website → ]  [ Call (979) 595-6330 ]                 |
| Free 60-second website check →                                   |
| Custom-built · Monthly care · Local support                       |
+------------------------------------------------------------------+
```

Mobile becomes intentionally compact rather than a scaled-down desktop stack:

```text
+--------------------------------+
| WebCare                  menu   |
|                                |
| [ Web design + monthly care ·  |
|   Bryan–College Station, TX ]  |
| Most websites get launched.    |
| Ours get cared for.             |
| Supporting sentence            |
| [ Start your website → ]        |
| [ Call (979) 595-6330 ]         |
| Free website check →            |
| custom · cared for · local      |
+--------------------------------+
```

The mobile headline is reduced by roughly 10–12 percent, the supporting copy uses a shorter readable measure, and vertical gaps are tightened so the primary action arrives sooner. Both button targets remain at least 52 pixels tall.

## Signature and atmosphere

The particle-to-shield transformation remains the single signature element. A stronger, asymmetric scrim protects the copy while keeping the field visible toward the right on desktop and beneath the lower half on mobile. The violet and magenta atmospheric blobs remain subdued. No additional decoration, photography, badge, or animation is added.

On the mobile/light graphics tier, the existing reduced particle count remains. Shield and dust opacity are reduced slightly behind the copy if the strengthened scrim alone does not produce a quiet enough reading area in the rendered screenshot.

## Copy and actions

- Normalize the primary action label to **“Start your website”** in the header, hero, mobile menu, and sticky call-to-action surfaces.
- Keep **“Call (979) 595-6330”** as the secondary hero action.
- Change **“Free 60-second website check”** from a third ghost button into a quieter inline text action placed below the button row.
- Change the current audience note to the factual trust line **“Custom-built · Monthly care · Local support.”** This avoids repeating “churches and local businesses,” which already appears in the supporting sentence.
- Do not add testimonials, ratings, customer counts, or performance claims.

## Responsive behavior

- At widths of 560 pixels and below, reduce the headline size, eyebrow letter spacing, and hero vertical spacing.
- Keep the eyebrow intentionally two lines when needed; it must not overflow horizontally.
- Stack the primary and phone actions full-width on mobile, followed by the inline site-check link.
- Preserve the desktop action row at wider widths.
- The hero must have no horizontal overflow at 390, 768, or 1440 pixels.

## Accessibility and motion

- Preserve the existing visible focus states and semantic anchor labels.
- Supporting copy and actionable text must remain readily legible over both the animated field and static fallback.
- The inline site-check action must have a visible hover and keyboard-focus treatment.
- Preserve `prefers-reduced-motion`, WebGL failure fallback, and the existing minimum tap targets.
- Decorative particle, underline, and scrim layers remain hidden from assistive technology.

## Verification

The existing `_qa/check.cjs` hero check will be extended before production markup changes. It will verify:

- one hero primary action labeled “Start your website”;
- one phone action with the real number;
- the site-check action is present but is not styled as a button;
- the trust line uses the approved factual copy;
- mobile primary and phone actions are stacked and at least 52 pixels tall;
- the eyebrow and hero content stay within the 390-pixel viewport;
- desktop actions remain in a row;
- zero page errors and no horizontal overflow;
- reduced-motion and no-WebGL modes still load without errors.

Fresh desktop and mobile hero screenshots will be reviewed after the automated checks. The pass is complete when the copy reads cleanly before the particles, the primary action is unmistakable, and the visual identity still feels like the same WebCare site.
