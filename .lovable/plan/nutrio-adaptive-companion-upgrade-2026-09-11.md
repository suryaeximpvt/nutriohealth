# Nutrio: adaptive companion upgrade

Everything already in Nutrio stays as it is — onboarding, food snap, Lifestyle Mode, Non-Negotiables, check-ins, recommendations and the current look. The new work adds low-friction ways to tell Nutrio what happened, and a much smarter Ask Nutrio.

## Priority 1

**Ask Nutrio (upgraded)**
- The existing Ask AI screen becomes "Ask Nutrio", reachable from anywhere via a floating button above the bottom tabs.
- A quick-action area at the top: "Where are you?" (Home, Restaurant, Supermarket, Office, Travelling, Social event) then "What do you need help with?" (What should I eat / What should I avoid / Help me choose / Suggest an alternative).
- Answers use the user's goal, diet preferences, dislikes, Non-Negotiables, active Lifestyle Mode, routine and what has been eaten today, and always give 2-3 realistic options rather than one perfect answer. General nutrition guidance only, no medical claims.
- Every question, the context used and the answer are saved so Nutrio can learn from them.

**Quick meal capture (voice or text)**
- One big "Tell Nutrio" button: a microphone and a text box.
- Speech is captured in the browser where supported; where it isn't, the same screen works by typing, so voice can be switched on later with no redesign.
- Nutrio turns the sentence into meal items with rough nutrition, then shows: "You had a chicken wrap and side salad for lunch. Is that correct?" with Yes / Edit / Add more details.
- Nutrition is always labelled an estimate.

**Adaptive missed meal prompts (upgrade of the current prompt)**
- Instead of fixed hours, Nutrio learns each person's usual meal times from their own history and routine, and asks shortly after the window passes.
- Answers: Yes I ate / No I skipped / Not yet / I'll tell you later.
- "Yes I ate" offers Tell Nutrio, Type what I ate, or Upload a photo — never forces a photo.
- Wording is conversational and never guilt-based.

## Priority 2

**Quick Daily Recap** — a card on the home dashboard: "Didn't log your meals today? Tell Nutrio what you remember." Three short boxes for breakfast, lunch and dinner, one save, roughly 30 seconds.

**Friction feedback** — after repeated non-logging or ignored suggestions, Nutrio asks once (at most every few days): "What made tracking difficult today?" with the listed options, stored as friction data feeding existing behaviour analysis.

**Capture method tracking** — every capture records how it arrived (photo, voice, text, quick confirm, recap) plus whether nutrition was estimated.

## Priority 3

**One Photo Challenge** — a gentle optional card: "Just take one food photo today", progress 0/1, and a warm "One photo is enough for today" once done. No streaks, no pressure.

**Progressive capture** — Nutrio scores which method each person actually responds to over the last two weeks and puts that method first in prompts and on the dashboard, while keeping the others one tap away.

## Technical notes

- New tables: `capture_prompts` (prompt shown, response, method offered/used), `ask_nutrio_interactions` (question, context snapshot, response), `capture_preferences` (rolling per-method response rates), plus `capture_method` and `estimated` columns on `food_captures`. Friction reuses the existing `food_friction` table with new types. All owner-scoped RLS with grants.
- New edge functions: `parse-meal-text` (description → meal items + estimated nutrition) and `ask-nutrio` (context-rich answers, logs the interaction). `ai-chat` stays for the existing chat thread.
- New hooks: `useQuickCapture`, `useAskNutrio`, `useCapturePreference`, `useMealTiming`; new components under `src/components/capture/`.
- Existing components (`MissedMealPrompt`, `FoodSnapFlow`, `useFoodCaptures`) are extended, not replaced.
