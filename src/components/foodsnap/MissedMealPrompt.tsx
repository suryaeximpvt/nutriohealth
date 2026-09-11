import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MEAL_TYPES, MISS_REASONS, type MealType } from "@/lib/foodSnap";
import type { FoodCapture } from "@/hooks/useFoodCaptures";
import { useMealTiming } from "@/hooks/useMealTiming";
import { useCapturePreference } from "@/hooks/useCapturePreference";
import { CAPTURE_METHODS, type CaptureMethod } from "@/lib/capture";

interface Props {
  captures: FoodCapture[];
  onSnap: (meal: MealType) => void;
  onQuickCapture?: (meal: MealType, voice: boolean) => void;
}

const iso = (d: Date) => d.toISOString().split("T")[0];

/**
 * Conversational, timing-aware nudge. It asks what happened rather than
 * telling the user to complete a task, and offers the easiest capture method
 * for this particular person first.
 */
export const MissedMealPrompt = ({ captures, onSnap, onQuickCapture }: Props) => {
  const { user } = useAuth();
  const { overdueMeals, formatTime } = useMealTiming(captures);
  const { orderedMethods, markOffered, avoidsPhotos } = useCapturePreference();
  const [answered, setAnswered] = useState<string[]>([]);
  const [step, setStep] = useState<"ask" | "methods" | "reason">("ask");
  const [dismissed, setDismissed] = useState(false);
  const [promptId, setPromptId] = useState<string | null>(null);

  const missing = overdueMeals.find((m) => !answered.includes(m)) as MealType | undefined;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("missed_meal_events")
        .select("meal_type")
        .eq("user_id", user.id)
        .eq("event_date", iso(new Date()));
      setAnswered(((data ?? []) as { meal_type: string }[]).map((r) => r.meal_type));
    })();
  }, [user]);

  // Log that Nutrio asked, and which methods it offered.
  useEffect(() => {
    if (!user || !missing || promptId) return;
    const methods = orderedMethods(avoidsPhotos ? ["voice", "text"] : ["voice", "text", "photo"]);
    (async () => {
      const { data } = await supabase
        .from("capture_prompts")
        .insert({
          user_id: user.id,
          prompt_type: "missed_meal",
          meal_type: missing,
          prompt_date: iso(new Date()),
          offered_methods: methods,
        } as never)
        .select("id")
        .maybeSingle();
      setPromptId((data as { id?: string } | null)?.id ?? null);
      methods.forEach((m) => void markOffered(m));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, missing]);

  if (!missing || dismissed) return null;

  const meal = MEAL_TYPES.find((m) => m.value === missing)!;
  const methods = orderedMethods(avoidsPhotos ? ["voice", "text"] : ["voice", "text", "photo"]);

  const savePrompt = async (response: string, methodUsed?: CaptureMethod) => {
    if (!user || !promptId) return;
    await supabase
      .from("capture_prompts")
      .update({
        response,
        method_used: methodUsed ?? null,
        responded_at: new Date().toISOString(),
      } as never)
      .eq("id", promptId);
  };

  const record = async (outcome: string, reason?: string) => {
    if (!user) return;
    await supabase.from("missed_meal_events").upsert(
      {
        user_id: user.id,
        meal_type: missing,
        event_date: iso(new Date()),
        outcome,
        reason: reason ?? null,
        responded_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id,meal_type,event_date" },
    );
    setAnswered((a) => [...a, missing]);
  };

  const chooseMethod = async (method: CaptureMethod) => {
    await savePrompt("ate", method);
    await record("ate_snapped");
    if (method === "photo") onSnap(missing);
    else onQuickCapture?.(missing, method === "voice");
  };

  const chip = "rounded-full border px-3 py-2 text-xs text-muted-foreground hover:border-primary";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-primary/30 rounded-2xl p-4 relative"
      >
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="absolute right-3 top-3 text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        {step === "reason" && (
          <>
            <p className="font-medium text-foreground text-sm mb-3">What got in the way?</p>
            <div className="flex flex-wrap gap-2">
              {MISS_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={async () => {
                    await savePrompt("ate_not_captured");
                    await record("ate_not_snapped", r.value);
                    setStep("ask");
                  }}
                  className={chip}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === "methods" && (
          <>
            <p className="font-medium text-foreground text-sm mb-1">Tell me what you had</p>
            <p className="text-xs text-muted-foreground mb-3">Whichever is easiest right now.</p>
            <div className="flex flex-wrap gap-2">
              {methods.map((m) => {
                const info = CAPTURE_METHODS.find((c) => c.value === m)!;
                return (
                  <button key={m} onClick={() => chooseMethod(m)} className={chip}>
                    {info.emoji} {info.label}
                  </button>
                );
              })}
              <button
                onClick={() => setStep("reason")}
                className={chip}
              >
                Not now
              </button>
            </div>
          </>
        )}

        {step === "ask" && (
          <>
            <p className="font-medium text-foreground text-sm pr-6">
              You normally have {meal.label.toLowerCase()} around {formatTime(missing as "breakfast" | "lunch" | "dinner")}. Did you eat?
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => setStep("methods")}
                className="rounded-full bg-primary text-primary-foreground px-3 py-2 text-xs"
              >
                Yes, I ate
              </button>
              <button
                onClick={async () => {
                  await savePrompt("skipped");
                  await record("skipped");
                }}
                className={chip}
              >
                No, I skipped
              </button>
              <button
                onClick={async () => {
                  await savePrompt("not_yet");
                  setDismissed(true);
                }}
                className={chip}
              >
                Not yet
              </button>
              <button
                onClick={async () => {
                  await savePrompt("later");
                  setDismissed(true);
                }}
                className={chip}
              >
                I'll tell you later
              </button>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
