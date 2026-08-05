# August 2026 Website Special

## Goal

Rerun July's website-plan promotion for August without changing plan prices, checkout links, or discount amounts.

## Campaign terms

- WebCare Select: $100 design fee instead of $200.
- WebCare Gold and WebCare Ultra: the $200 design fee is waived.
- Every plan keeps its existing one-year price lock.
- The promotion ends August 31, 2026 at 11:59:59 PM Central Time.

## Customer-facing changes

- Identify the promotion as the August special in the promotional banner.
- Replace the July 31 expiration copy with August 31.
- Restart the existing countdown so it reaches zero at the approved deadline.
- Keep the current plan cards, calls to action, Stripe checkout links, and visual styling unchanged.

## Expiration behavior

The existing `promo-over` behavior remains in place. After the deadline, the promotional banner and countdown are hidden, while each plan displays its standard $200 design price.

## Verification

- Add an automated check for the August promotion wording and deadline.
- Confirm the check fails before the site is updated and passes afterward.
- Run the existing page checks to catch browser errors and horizontal overflow.
- Confirm the countdown is active before the deadline and the standard pricing state appears after it.
