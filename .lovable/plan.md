# Nutrio premium interaction and accessibility pass

## Goal
Keep every feature and rule intact while removing the remaining accessibility failures and making the existing interface feel coherent, tactile, and native.

## Implementation

### 1. Accessible design foundation
- Darken the light and dark primary/accent tokens until white button text meets WCAG AA, and strengthen border/input contrast.
- Neutralise small labels, badges, helper text, and secondary icons so brand colour is reserved for the main action and calorie progress.
- Preserve the existing Nutrio green/teal, orange, Outfit, and DM Sans identity.

### 2. Shared interaction system
- Add a reusable 120–150ms press response to shared buttons, links, icon controls, and tappable cards, with reduced-motion support.
- Replace mechanical dashboard entrances with spring transitions around stiffness 300 and damping 30.
- Ensure icon controls have accessible names and at least 44px primary tap targets.

### 3. Home dashboard cleanup
- Keep the photo action primary, retain the two secondary logging choices, remove the duplicate meal-grid header action, and standardise all copy around “Log”.
- Replace the stock meal with the user’s latest capture where available; otherwise show a neutral branded camera treatment.
- Replace meal emoji with Lucide icons and reduce decorative colour.
- Make the calorie ring visibly draw from zero, use semantic macro colour variants, enlarge water controls, and add shaped loading skeletons for energy, macros, and meal cards.

### 4. Consistency audit
- Normalise visible route and shared-component typography to 12/14/16/20/24/32px only.
- Remove non-4px arbitrary spacing values and align controls/cards to the 4px spacing rhythm.
- Prioritise shared primitives so the system applies consistently across authentication, onboarding, Home, Diet, Ask Nutrio, Workout, Shop, Profile, Settings, and dialogs without changing behavior.

### 5. Verification
- Check all 18 requested items against source and rendered mobile/desktop screens.
- Test light/dark contrast, loading placeholders, ring animation, press feedback, capture actions, no horizontal overflow, and reduced-motion behavior.
- Confirm diagnostics remain clean and report each numbered item as complete or explicitly blocked.

## Technical details
- Frontend-only changes in React/Tailwind/Framer Motion and existing shared components.
- No backend, database, edge function, AI rule, recommendation rule, or project-knowledge changes.
- User photo display will use only existing capture data already available to the Home screen; no new persistence or API behavior will be introduced.
