import { useEffect, useState } from "react";
import { Mic, Square, Loader2, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MEAL_TYPES, guessMealType, type MealType } from "@/lib/foodSnap";
import type { CaptureMethod, ParsedMeal } from "@/lib/capture";
import { useQuickCapture } from "@/hooks/useQuickCapture";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { TellNutrioConversation } from "./TellNutrioConversation";

interface Props {
  open: boolean;
  onClose: () => void;
  mealType?: MealType;
  startWithVoice?: boolean;
  /** Listening only — no typing, for the "Tell Nutrio" entry point. */
  voiceOnly?: boolean;
  onSaved?: () => void;
}

/** Voice / text meal capture: say it, confirm it, done. */
export const QuickCaptureSheet = ({ open, onClose, mealType, startWithVoice, voiceOnly, onSaved }: Props) => {
  const { parse, save, parsing, saving } = useQuickCapture();
  const { recording, transcribing, level, start, stop, cancel } = useVoiceInput();
  const [text, setText] = useState("");
  const [meal, setMeal] = useState<MealType>(mealType ?? guessMealType());
  const [parsed, setParsed] = useState<ParsedMeal | null>(null);
  const [method, setMethod] = useState<CaptureMethod>("text");

  useEffect(() => {
    if (open) {
      setText("");
      setParsed(null);
      setMeal(mealType ?? guessMealType());
      setMethod(startWithVoice ? "voice" : "text");
    }
  }, [open, mealType, startWithVoice]);

  if (!open) return null;

  // "Tell Nutrio" is now a hands-free conversation.
  if (voiceOnly) {
    return <TellNutrioConversation open={open} onClose={onClose} onSaved={onSaved} />;
  }


  const close = () => {
    cancel();
    onClose();
  };

  const toggleVoice = async () => {
    if (transcribing) return;
    if (recording) {
      const { text: said, error } = await stop();
      if (error) return toast.error(error);
      if (said) {
        setText((t) => `${t} ${said}`.trim());
        setMethod("voice");
      }
      return;
    }
    const { error } = await start();
    if (error) toast.error(error);
  };

  const handleParse = async () => {
    const { meal: result, error } = await parse(text, meal);
    if (error || !result) return toast.error(error ?? "Couldn't read that.");
    setParsed(result);
    if (result.meal_type) setMeal(result.meal_type);
  };

  const handleSave = async () => {
    if (!parsed) return;
    const { error } = await save(parsed, method, meal);
    if (error) return toast.error(error);
    toast.success("Saved — thanks for telling Nutrio.");
    onSaved?.();
    close();
  };

  const totalCals = Math.round(
    (parsed?.items ?? []).reduce((s, i) => s + (Number(i.calories) || 0), 0),
  );

  const micLabel = transcribing
    ? "Writing down what you said…"
    : recording
      ? "Listening… tap to stop when you're done"
      : "Tap the microphone and say what you ate";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close quick capture"
        onClick={close}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative z-10 w-full max-w-lg bg-card rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-foreground">
            {parsed ? "Is that right?" : "Tell Nutrio what you ate"}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="p-2 -mr-2 rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!parsed ? (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMeal(m.value)}
                  className={`rounded-full px-3 py-1.5 text-xs border ${
                    meal === m.value ? "border-primary text-primary bg-primary/10" : "text-muted-foreground"
                  }`}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>

            {voiceOnly ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={transcribing}
                  aria-label={recording ? "Stop listening" : "Start listening"}
                  style={recording ? { transform: `scale(${1 + Math.min(level, 0.5) * 0.5})` } : undefined}
                  className={`w-28 h-28 rounded-full flex items-center justify-center transition-transform ${
                    recording ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}
                >
                  {transcribing ? (
                    <Loader2 className="w-10 h-10 animate-spin" />
                  ) : recording ? (
                    <Square className="w-10 h-10" />
                  ) : (
                    <Mic className="w-12 h-12" />
                  )}
                </button>
                <p className="text-sm text-muted-foreground text-center">{micLabel}</p>
                {text && <p className="text-foreground text-center font-medium">“{text}”</p>}
                <Button
                  size="lg"
                  className="w-full"
                  disabled={!text.trim() || parsing || recording || transcribing}
                  onClick={handleParse}
                >
                  {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
                </Button>
              </div>
            ) : (
              <>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. I had a chicken wrap and a side salad"
                  className="min-h-24 mb-3"
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={recording ? "default" : "outline"}
                    size="lg"
                    onClick={toggleVoice}
                    disabled={transcribing}
                    className="gap-2"
                    aria-label="Speak what you ate"
                  >
                    {transcribing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : recording ? (
                      <Square className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                    {transcribing ? "One sec…" : recording ? "Stop" : "Speak"}
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1"
                    disabled={!text.trim() || parsing || recording || transcribing}
                    onClick={handleParse}
                  >
                    {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <p className="text-foreground mb-1">
              You had <span className="font-semibold">{parsed.summary ?? text}</span> for {meal}.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Roughly {totalCals} kcal — this is an estimate, not an exact measurement.
            </p>

            <div className="space-y-2 mb-4">
              {(parsed.items ?? []).map((i, idx) => (
                <div key={idx} className="flex items-center justify-between bg-muted/50 rounded-xl px-3 py-2">
                  <span className="text-sm text-foreground">{i.name}</span>
                  <span className="text-xs text-muted-foreground">~{Math.round(Number(i.calories) || 0)} kcal</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="gap-2" onClick={() => setParsed(null)}>
                <Pencil className="w-4 h-4" /> Edit
              </Button>
              <Button size="lg" className="flex-1" disabled={saving} onClick={handleSave}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, that's right"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
