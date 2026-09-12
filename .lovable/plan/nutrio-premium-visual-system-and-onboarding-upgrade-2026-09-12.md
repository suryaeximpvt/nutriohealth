# Nutrio premium visual system and onboarding upgrade

## Goal
Bring the existing Nutrio app to a polished consumer-app standard using the supplied Cal AI patterns as an execution benchmark, while retaining Nutrio’s identity and every existing behavior.

## Build

### 1. Accessibility foundation
- Darken primary green and accent orange in light and dark themes until white button text reaches WCAG AA contrast.
- Strengthen border and input contrast against page surfaces.
- Move small teal/orange labels, eyebrows, badges, and helper text to neutral foreground roles; reserve Nutrio green for high-emphasis elements.
- Increase water controls and other primary icon controls to 44×44px with accessible names.

### 2. Restrained Nutrio visual system
- Use predominantly white/off-white surfaces, near-black headings, gray secondary text, and visible neutral borders.
- Reserve Nutrio green for the primary CTA, calorie ring, selected/recommended states, and a small number of calculated values.
- Standardise the app to 12/14/16/20/24/32px typography and a 4px spacing rhythm, correcting shared primitives and visible screens first so the rules propagate consistently.
- Keep Outfit headings, DM Sans body text, existing shadows, and Nutrio brand identity.

### 3. Reusable interaction system
- Add a 120–150ms press response around 0.96 scale to shared buttons, links, icon controls, and tappable cards, including immediate acknowledgment for icon buttons.
- Replace mechanical dashboard/onboarding entrances with spring motion around stiffness 300 and damping 30.
- Respect reduced-motion preferences.

### 4. Onboarding rebuilt from reusable patterns
- Add one reusable single-choice row: neutral bordered surface, 44–48px icon circle, label/subtext, and right-side radio indicator.
- Apply it consistently to all applicable single-choice steps such as goal, activity, diet, sex, and experience while preserving current questions and stored values.
- Make required-step Continue buttons visibly disabled until valid; keep optional and informational steps available according to current onboarding rules.
- Replace step-count text with a thin rounded progress bar and a 44px circular back control.
- Add a reusable segmented unit control.
- Present height as a vertical wheel picker with a highlighted center row and ft/in–cm switching.
- Present weight as a horizontal ruler picker with center indicator, live large value, and lb–kg switching.
- Present goal pace as a three-position visual slider with a personalised result card; only the recommended/calculated result receives accent colour.
- Add one or two non-interactive trust screens using calculated user inputs and simple accessible progress charts, never fabricated ratings, reviews, or user counts.
- If the existing health connection is shown during onboarding, use an original neutral data-flow illustration rather than a permission screenshot.
- Add a final personalised summary with goal/target timing, projected trajectory, daily calorie target, macro cards, edit affordances, and final “Let’s get started” CTA; all values come from existing user inputs/calculations.

### 5. Home dashboard cleanup
- Keep “Log a photo” as the single primary action.
- Retain two secondary actions as “Search or log manually” and “Log with Tell Nutrio”; retain “Log this meal” inside empty diary cards and remove the duplicate header link.
- Change the supporting copy to “One photo is enough to get started.”
- Replace the unrelated stock meal with the user’s latest available food capture; otherwise render a neutral branded camera graphic.
- Replace meal emoji with consistent Lucide icons and neutral icon treatments.
- Animate the calorie ring from zero to its live value over about one second.
- Refactor macro bars to semantic named variants rather than raw colour strings.
- Add shaped pulse-soft skeletons for the calorie ring, macro bars, and four meal cards while dashboard data loads.

### 6. Verification and numbered self-check
- Verify each of the 26 requested items in source and rendered preview.
- Check authentication, onboarding, Home, Diet, Ask Nutrio, Workout, Shop, Profile, Settings, and dialogs for typography, spacing, palette discipline, and press feedback without changing their behavior.
- Test mobile and desktop layouts, light and dark themes, contrast ratios, conditional onboarding controls, pickers, charts, loading placeholders, ring animation, capture actions, and horizontal overflow.
- Confirm build/runtime diagnostics remain clean and report every item as complete or explicitly blocked.

## Scope guardrails
- Frontend presentation and interaction changes only.
- No backend logic, database schema, edge functions, AI recommendation rules, authentication behavior, or project-knowledge/content-rule changes.
- No fabricated testimonials, ratings, adoption figures, results, or placeholder health claims.
