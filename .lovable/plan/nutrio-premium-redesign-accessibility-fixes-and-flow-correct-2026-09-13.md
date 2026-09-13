# Nutrio: premium redesign, accessibility fixes and flow corrections

One combined plan replacing the earlier one. Visual and interaction layer only — no changes to backend logic, data, AI rules or content rules.

## 1. Accessibility and correctness fixes
- Darken the green and orange brand tones until white button text is comfortably readable, in both light and dark appearance.
- Move small coloured labels, eyebrows and badges to neutral text; strengthen card and field edges so they are visible.
- Enlarge the water plus/minus controls to a comfortable 44px tap size.
- Keep the photo action as the single main action, remove the duplicate "Add food" link, and standardise wording to "Log a photo", "Search or log manually", "Log with Tell Nutrio", "Log this meal".
- Replace "One photo is enough for Nutrio to start learning" with "One photo is enough to get started".
- Give the macro bars one consistent colour approach instead of mixed raw values.

## 2. Calm, neutral visual system
- Mostly white surfaces, strong near-black headlines, grey secondary text.
- Brand green reserved for two or three focal points per screen: the calorie ring, the single main button, and a calculated highlight such as a recommended option or target.
- Every other icon background, badge and label becomes neutral grey or charcoal.
- Strict type sizes (12, 14, 16, 20, 24, 32) and a 4px spacing rhythm across screens.

## 3. Onboarding rebuilt around reusable pieces
- One shared choice row: white card, light border, rounded corners, grey circular icon, label with optional grey subtext, and a filling circular selector on the right.
- Shared pill segmented toggle for unit choices.
- Height entered with a vertical wheel picker; weight with a horizontal ruler picker and a large live number above it.
- A pace step with three icons above a slider, the recommended option and calculated results highlighted, and results shown in a soft grey card.
- Thin rounded progress bar at the top with a small circular back button, replacing step-counter text.
- Continue buttons look flat and inactive until a valid answer exists, then become solid and confident.

## 4. Confidence and summary screens
- One or two non-interactive screens with a bold headline, a soft grey card containing a simple projected-progress chart built from the person's own goal and pace, a short grey caption, and an always-enabled Continue.
- A final summary before entering the app: confirmation badge, headline with their real goal and target date, a projection card, and a "Your daily recommendation" card showing their calculated calorie target and protein/carbs/fat, each editable, ending with a single strong start button.
- No fabricated ratings, user counts or reviews. That screen is intentionally skipped until real data exists.
- Health connection step presented as a friendly illustrated diagram rather than a system dialog screenshot.

## 5. Motion and feel
- Press feedback on every button and tappable card, with a quick settle.
- Spring-based entrances instead of flat fades.
- Calorie ring visibly fills from zero on load.
- Meal icons switch from emoji to the app's existing icon family.
- Shaped loading placeholders for the ring, macro bars and meal cards.
- Hero shows the person's own most recent food photo when one exists, otherwise a clean branded graphic — never an unrelated stock meal.

## 6. Four reported problems
- Smallest realistic change: fix its loading, empty and answered states so it reliably shows a suggestion or a clear explanation instead of appearing broken.
- Tell Nutrio: opens and begins listening on its own, with tapping only needed to interrupt.
- AI suggested meals: replace emoji-led visuals with realistic food imagery.
- Today's mode: asked first when the app opens, still respecting an already active mode.

## Verification
- Check all 26 listed items, light and dark contrast, mobile and desktop layout, loading states, reduced motion, and that capture, logging, recommendations and premium behaviour are unchanged.
- Report each item as done or explicitly skipped with the reason.

## Technical notes
- React, Tailwind tokens, shadcn primitives and Framer Motion only.
- New shared presentation components for choice rows, segmented toggles, pickers, charts and skeletons.
- Existing hooks and edge functions are reused as-is; only presentation and local UI state change.
