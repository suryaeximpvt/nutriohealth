# Tell Nutrio — conversational voice agent

Upgrade the existing Tell Nutrio flow into a continuous spoken conversation while preserving photo capture, normal food logging, goals, lifestyle modes, non-negotiables, recommendations, and existing user data.

## Current implementation audit

- Speech-to-text already records complete WAV audio securely and sends it to the existing authenticated transcription function.
- Voice activity detection already measures the microphone level and stops after a short silence, with a manual stop fallback.
- The Tell Nutrio function already receives recent turns and a working draft, so basic session memory exists.
- The current experience stops at text replies. There is no text-to-speech, speaker lifecycle, mute handling, interruption protection, or automatic listening handoff after audio playback.
- The current agent draft represents one meal, so a spoken daily recap cannot reliably save several meals as separate estimated captures.
- Quick Daily Recap is currently a separate three-field form and is always visible instead of being offered only when the later-day conditions are met.
- Incomplete draft items can surface misleading `~0 kcal` values.

## Build

### 1. Secure Nutrio speech output

Add an authenticated `nutrio-speech` backend function using Lovable AI text-to-speech with the default natural Nutrio voice. It will stream raw speech audio from the server so the API key never reaches the phone.

Handle gateway failures by status: show the real user-facing message, never retry terminal failures, and use bounded delayed retry only for rate limits or temporary upstream errors.

### 2. Browser audio playback and controls

Add a focused speech hook that:

- reads the streamed audio response and schedules playback through the device speaker;
- reports `loading`, `speaking`, `muted`, and playback completion states;
- supports mute/unmute and stop;
- resumes audio only after the user's initial tap, respecting mobile autoplay rules;
- cleans up audio, microphone, and network work when Tell Nutrio closes.

Text remains visible for accessibility and silent use.

### 3. True conversation loop

Refactor the session controller into a single turn coordinator:

```text
ready → listening → transcribing → thinking → speaking → listening
                                      ↓
                                  confirming
                                      ↓
                              saving → success
```

Each Nutrio reply will be spoken before the microphone reopens. The microphone will never listen while Nutrio is speaking, preventing Nutrio from transcribing its own voice. Manual microphone, stop, mute, text mode, Yes, Edit, and close controls remain fallbacks.

Guard asynchronous turns with stable refs and cancellation so closing, switching to text, or rapidly tapping cannot create duplicate transcription, speech, or saves.

### 4. Agent decisions and session memory

Extend the existing Tell Nutrio agent response to return structured pending actions rather than only one food draft. Supported actions remain in one conversation:

- one meal or several foods;
- multi-meal daily recap;
- skipped meal;
- activity;
- nutrition/eating-out question;
- correction or clarification.

The full current session history and accumulated draft actions will be sent on every turn. The agent asks one brief natural follow-up at a time, confirms before writing data, and does not request information already supplied.

Use existing personalised context for goals, today's meals, lifestyle mode, non-negotiables, preferences, and recommendations. Questions stay inside Tell Nutrio.

### 5. Safe action completion

Only confirmed actions are saved:

- normal spoken meals use the existing voice capture path;
- daily recap meals are saved separately with capture method `recap` and `estimated: true`;
- skipped meals use the existing meal-status path;
- activity uses the existing workout log;
- questions continue to be recorded in Ask Nutrio interactions.

Save all actions from a recap and surface any partial failure instead of claiming the whole recap succeeded.

### 6. Conversational interface

Replace the form-like sheet with a full-height mobile conversation surface using the existing Nutrio design system:

- central voice orb/waveform for ready, listening, thinking, speaking, confirmation, and success;
- clear short state caption;
- compact transcript labelled “You” and “Nutrio”;
- speaker mute, keyboard, manual microphone/stop, and close controls;
- Yes and Edit remain available only as optional confirmation shortcuts.

Do not show nutrition cards while the conversation is gathering details. After confirmation, show a compact saved summary. Hide zero or incomplete nutrition values; use “Nutrition estimate pending” before confirmation and “Estimated” for approximate completed values.

### 7. Quick Daily Recap inside Tell Nutrio

Replace the separate recap form with a gentle Tell Nutrio prompt only when:

- fewer than two meals are captured today;
- it is later in the day;
- no recap capture has been completed today.

Opening it starts Tell Nutrio in recap mode. Nutrio speaks the recap greeting, listens for multiple meals in one answer, confirms the interpreted day, then saves each meal as an estimated recap capture. The standard Tell Nutrio entry remains neutral and can still recognise a recap naturally.

### 8. Verification

- Test the speech function with a real Nutrio sentence and confirm audible output.
- Verify tap once → speak → silence stop → transcription → spoken reply → automatic listening.
- Verify mute and text mode, manual stop, close during every active state, denied microphone permission, and transcription/TTS errors.
- Verify a multi-turn meal correction, multiple foods, skipped meal, activity, personalised question, and a multi-meal recap.
- Confirm no save occurs before approval, no duplicate saves occur, recap captures are estimated, and no `0 kcal` estimate appears.
- Check the mobile viewport and a desktop viewport, then review build, runtime, console, and network errors.

## Technical details

- Keep current WAV recording and transcription architecture; improve its lifecycle rather than replacing it.
- Add one server-only speech function calling `POST /v1/audio/speech` with `openai/gpt-4o-mini-tts`, SSE audio, and PCM playback.
- Keep session history in memory for the current Tell Nutrio interaction only; do not add permanent chat threads.
- Extend the current structured agent contract with an array of meal drafts/actions while retaining compatibility with existing single-draft responses during rollout.
- No external provider account or new API key is required; speech uses the existing Lovable AI setup.
