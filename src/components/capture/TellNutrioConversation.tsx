import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, X, Keyboard, Check, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTellNutrio } from "@/hooks/useTellNutrio";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

/**
 * Siri-style Tell Nutrio: tap once, speak naturally, Nutrio detects the end of
 * speech on its own, replies conversationally and completes the action.
 */
export const TellNutrioConversation = ({ open, onClose, onSaved }: Props) => {
  const { turns, state, setState, error, setError, draft, send, confirm, reset } = useTellNutrio();
  const { recording, transcribing, level, speechDetected, start, stop, cancel } = useVoiceInput();
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const busyRef = useRef(false);
  const savedRef = useRef(false);

  const finishTurn = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setState("thinking");
    const { text, error: voiceError } = await stop();
    busyRef.current = false;
    if (voiceError) {
      setError(voiceError);
      setState("idle");
      return;
    }
    if (!text?.trim()) {
      setError("Nutrio didn't catch that — try again.");
      setState("idle");
      return;
    }
    await send(text);
  }, [stop, send, setState, setError]);

  const finishRef = useRef(finishTurn);
  finishRef.current = finishTurn;

  const listen = useCallback(async () => {
    setError(null);
    setState("listening");
    const { error: micError } = await start({
      autoStop: true,
      silenceMs: 1600,
      onEndOfSpeech: () => void finishRef.current(),
    });
    if (micError) {
      setError(micError);
      setState("idle");
    }
  }, [start, setState, setError]);

  // Open straight into listening, like a voice assistant.
  useEffect(() => {
    if (!open) return;
    reset();
    savedRef.current = false;
    setTyping(false);
    setTyped("");
    void listen();
    return () => cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the conversation going: listen again after Nutrio has spoken.
  useEffect(() => {
    if (!open || typing) return;
    if ((state === "speaking" || state === "confirming") && !recording && !transcribing) {
      const t = setTimeout(() => void listen(), 600);
      return () => clearTimeout(t);
    }
  }, [state, open, typing, recording, transcribing, listen]);

  useEffect(() => {
    if (state === "done" && !savedRef.current) {
      savedRef.current = true;
      cancel();
      onSaved?.();
    }
  }, [state, cancel, onSaved]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, state]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (!open) return null;

  const close = () => {
    cancel();
    onClose();
  };

  const sendTyped = async () => {
    const value = typed.trim();
    if (!value) return;
    setTyped("");
    cancel();
    await send(value);
  };

  const caption =
    state === "listening"
      ? speechDetected
        ? "I'm listening…"
        : "Listening… speak naturally"
      : state === "thinking"
        ? "Got it — thinking…"
        : state === "saving"
          ? "Saving that for you…"
          : state === "done"
            ? "Done."
            : "Tap the microphone and tell me what happened";

  const totalCals = Math.round(
    (draft?.items ?? []).reduce((s, i) => s + (Number(i.calories) || 0), 0),
  );

  const scale = recording ? 1 + Math.min(level, 0.6) * 0.6 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm">
      <button type="button" aria-label="Close Tell Nutrio" onClick={close} className="absolute inset-0 cursor-default" />
      <div className="relative z-10 w-full max-w-lg bg-card rounded-t-3xl p-5 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg text-foreground">Tell Nutrio</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setTyping((v) => !v);
                cancel();
                setState("idle");
              }}
              aria-label={typing ? "Use the microphone" : "Type instead"}
              className="p-2 rounded-full text-muted-foreground hover:bg-muted"
            >
              {typing ? <Mic className="w-5 h-5" /> : <Keyboard className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="p-2 -mr-2 rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-[80px]">
          {turns.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Say things like “I had scrambled eggs and toast this morning”, “I skipped lunch”, or “what should I have
              for dinner?”
            </p>
          )}
          {turns.map((t, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                t.role === "user"
                  ? "ml-auto bg-primary/10 text-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {t.content}
            </div>
          ))}
          {state === "thinking" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 animate-pulse" /> Nutrio is thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Draft summary */}
        {draft?.items?.length ? (
          <div className="space-y-1.5 mb-4">
            {draft.items.map((i, idx) => (
              <div key={idx} className="flex items-center justify-between bg-muted/50 rounded-xl px-3 py-2">
                <span className="text-sm text-foreground">{i.name}</span>
                <span className="text-xs text-muted-foreground">~{Math.round(Number(i.calories) || 0)} kcal</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Roughly {totalCals} kcal — an estimate, not exact.</p>
          </div>
        ) : null}

        {/* Controls */}
        {state === "done" ? (
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>
            <p className="text-sm text-muted-foreground">Added to your day.</p>
            <Button size="lg" className="w-full" onClick={close}>
              Close
            </Button>
          </div>
        ) : typing ? (
          <div className="flex gap-2 pb-2">
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void sendTyped()}
              placeholder="Type what you'd say…"
              aria-label="Type your message to Nutrio"
            />
            <Button size="icon" aria-label="Send" disabled={!typed.trim()} onClick={() => void sendTyped()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 pb-2">
            <button
              type="button"
              onClick={() => (recording ? void finishTurn() : void listen())}
              disabled={transcribing || state === "thinking" || state === "saving"}
              aria-label={recording ? "Stop listening" : "Start listening"}
              style={{ transform: `scale(${scale})` }}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-transform duration-100 ${
                recording ? "bg-primary text-primary-foreground shadow-lg" : "bg-primary/10 text-primary"
              }`}
            >
              {transcribing || state === "thinking" || state === "saving" ? (
                <Loader2 className="w-9 h-9 animate-spin" />
              ) : recording ? (
                <Square className="w-8 h-8" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
            <p className="text-sm text-muted-foreground text-center">{caption}</p>

            {state === "confirming" && (
              <div className="flex gap-2 w-full">
                <Button variant="outline" size="lg" onClick={close}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    cancel();
                    setTyping(true);
                  }}
                >
                  Edit
                </Button>
                <Button size="lg" className="flex-1" onClick={() => void confirm()}>
                  Yes, log it
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
