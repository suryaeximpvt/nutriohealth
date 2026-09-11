import { useEffect, useRef, useState } from "react";
import { Mic, Loader2, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MEAL_TYPES, guessMealType, type MealType } from "@/lib/foodSnap";
import type { CaptureMethod, ParsedMeal } from "@/lib/capture";
import { useQuickCapture } from "@/hooks/useQuickCapture";

interface Props {
  open: boolean;
  onClose: () => void;
  mealType?: MealType;
  startWithVoice?: boolean;
  onSaved?: () => void;
}

/** Voice / text meal capture: say it, confirm it, done. */
export const QuickCaptureSheet = ({ open, onClose, mealType, startWithVoice, onSaved }: Props) => {
  const { parse, save, parsing, saving } = useQuickCapture();
  const [text, setText] = useState("");
  const [meal, setMeal] = useState<MealType>(mealType ?? guessMealType());
  const [parsed, setParsed] = useState<ParsedMeal | null>(null);
  const [listening, setListening] = useState(false);
  const [method, setMethod] = useState<CaptureMethod>("text");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (open) {
      setText("");
      setParsed(null);
      setMeal(mealType ?? guessMealType());
      setMethod(startWithVoice ? "voice" : "text");
    }
  }, [open, mealType, startWithVoice]);

  if (!open) return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  const toggleVoice = () => {
    if (!SpeechRecognition) {
      toast.info("Voice input isn't supported on this device — type it instead.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-GB";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const said = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
      setText((t) => `${t} ${said}`.trim());
      setMethod("voice");
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
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
    onClose();
  };

  const totalCals = Math.round(
    (parsed?.items ?? []).reduce((s, i) => s + (Number(i.calories) || 0), 0),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-foreground">
            {parsed ? "Is that right?" : "Tell Nutrio what you ate"}
          </h2>
          <button onClick={onClose} aria-label="Close quick capture" className="text-muted-foreground">
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

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. I had a chicken wrap and a side salad"
              className="min-h-24 mb-3"
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant={listening ? "default" : "outline"}
                size="lg"
                onClick={toggleVoice}
                className="gap-2"
                aria-label="Speak what you ate"
              >
                <Mic className="w-5 h-5" />
                {listening ? "Listening…" : "Speak"}
              </Button>
              <Button size="lg" className="flex-1" disabled={!text.trim() || parsing} onClick={handleParse}>
                {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue"}
              </Button>
            </div>
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
