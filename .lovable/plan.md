# Tell Nutrio — hands-free conversation

Turn Tell Nutrio from "record, stop, confirm" into a Siri-style conversation: tap once, speak, Nutrio notices you've stopped, replies in words, and asks anything it still needs.

## How it will feel

1. Tap the microphone — big animated circle, "Listening… tell me what happened."
2. Speak naturally. The circle pulses with your voice.
3. Stop talking. After about 1.5 seconds of quiet, Nutrio stops on its own (a Stop button stays there if you'd rather tap).
4. "Nutrio is thinking…"
5. Nutrio replies in a sentence: "Got it — scrambled eggs and toast for breakfast. Shall I log that?"
6. Answer by voice or by tapping Yes / Edit / Cancel. Nutrio keeps listening automatically for your reply.
7. "Done — added to your breakfast." with the items and rough calories shown.

If something is missing, Nutrio just asks: "What kind of sandwich?", "Was that lunch or dinner?" — and remembers what you already said in that conversation.

## What Nutrio will understand

- One or several foods in a sentence ("porridge with berries and a coffee")
- Natural timing ("this morning", "last night", "earlier")
- A skipped meal ("I didn't have lunch")
- Activity ("I went for a 45 minute walk")
- Corrections ("no, it was chicken not tuna")
- Questions ("what should I eat for dinner?") — answered right there in the same conversation, no screen change

## Technical approach

**Voice activity detection (frontend)**
Extend `src/hooks/useVoiceInput.ts` with an auto-stop mode: track RMS energy per audio frame, arm after first speech is detected, then fire `onEndOfSpeech` after ~1500 ms below an adaptive noise-floor threshold (plus a 1.5 s minimum and 30 s maximum). Keep the existing WAV encode + `transcribe-audio` upload path unchanged. Manual stop remains available.

**Conversation brain (new edge function `tell-nutrio`)**
Authenticated, uses `LOVABLE_API_KEY` via the Lovable AI Gateway. Input: full turn history + a working "draft" object. Output (strict JSON):

```
{ intent: log_meal | skip_meal | log_activity | question | correction | smalltalk,
  reply: "conversational sentence",
  status: need_more | confirm | done,
  draft: { meal_type, items[{name,portion_size,calories,protein,carbs,fat,fibre}], summary, confidence },
  activity: { name, minutes } | null }
```

System prompt carries the user context from `_shared/userContext.ts` (goal, today's totals, preferences) so `question` intents are answered as well as Ask Nutrio does, and logs to `ask_nutrio_interactions` when the intent is a question.

**Session hook `src/hooks/useTellNutrio.ts`**
Owns the state machine (`idle → listening → thinking → speaking → confirming → saving → done`), turn history, draft merging across turns, and auto-restart of listening after each Nutrio reply. Saving reuses `useQuickCapture.save` for meals; skipped meals and activity write through the existing capture/health paths.

**UI**
Rewrite `QuickCaptureSheet`'s voice-only mode as `src/components/capture/TellNutrioConversation.tsx`: animated listening orb driven by the live level, transcript bubbles for both sides, state captions, Yes / Edit / Cancel buttons, and a keyboard toggle so any turn can be typed instead of spoken. Existing typed capture flow stays as-is. Entry points (`/?action=tell`, home card, Ask Nutrio mic) point at the new component.

**Nutrio speaking aloud**: replies are shown as text; spoken audio is not included in this change (can be added later with text-to-speech).

## Not changing

Photo snap, food history, dashboard cards, Ask Nutrio screen, database schema, branding.
