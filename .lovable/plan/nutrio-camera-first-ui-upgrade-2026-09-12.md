# Nutrio Camera-First UI Upgrade

## Build
- Refine login and signup around the Nutrio tagline and coach positioning, retaining the current sign-in behavior.
- Restyle onboarding as a fast mobile quiz with a persistent progress header, consistent image framing, larger tactile choices, and fixed navigation.
- Recompose Home so camera capture leads, followed by the calorie ring, compact macro progress, meal diary slots, water/weight tiles, and existing adaptive cards below.
- Convert meal suggestions into horizontally swipeable, image-led cards with concise rationale and lightweight follow-up controls.

## Interaction and accessibility
- Preserve all existing capture, logging, delete, premium, recommendation, and navigation actions.
- Add purposeful entrance, ring, and progress animations with reduced-motion support.
- Keep touch targets, labels, empty states, and text sizing suitable for mobile.

## Technical details
- Reuse the existing green/teal and orange semantic tokens, Outfit/DM Sans typography, shadows, imagery, and component library.
- Limit changes to presentation components and styling; no database, backend, function, recommendation, or content-rule changes.
- Verify the signed-out flow and authenticated mobile dashboard in the preview, plus current build diagnostics.
