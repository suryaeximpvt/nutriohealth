import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MEAL_TYPES, MISS_REASONS, type MealType } from "@/lib/foodSnap";
import type { FoodCapture } from "@/hooks/useFoodCaptures";

interface Props {
  captures: FoodCapture[];
  onSnap: (meal: MealType) => void;
}

/** Windows after which a usual meal is considered "not seen yet". */
const WINDOW: Record<Exclude<MealType, "snack">, number> = {
  breakfast: 11,
  lunch: 15,
  dinner: 21,
};

const iso = (d: Date) => d.toISOString().split("T")[0];

export const MissedMealPrompt = ({ captures, onSnap }: Props) => {
  const { user } = useAuth();
  const [answered, setAnswered] = useState<string[]>([]);
  const [askReason, setAskReason] = useState<MealType | null>(null);
  const [dismissed, setDismissed] = useState(false);

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

  const missing = useMemo(() => {
    const hour = new Date().getHours();
    const today = iso(new Date());
    return (Object.keys(WINDOW) as (keyof typeof WINDOW)[]).find((m) => {
      if (hour < WINDOW[m]) return false;
      if (answered.includes(m)) return false;
      return !captures.some((c) => c.capture_date === today && c.meal_type === m);
    }) as MealType | undefined;
  }, [captures, answered]);

  if (!missing || dismissed) return null;

  const meal = MEAL_TYPES.find((m) => m.value === missing)!;

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
    setAskReason(null);
  };

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

        {askReason ? (
          <>
            <p className="font-medium text-foreground text-sm mb-3">What stopped you from snapping?</p>
            <div className="flex flex-wrap gap-2">
              {MISS_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => record("ate_not_snapped", r.value)}
                  className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="font-medium text-foreground text-sm pr-6">
              We haven't seen your usual {meal.label.toLowerCase()} today. Did you eat something?
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => { void record("ate_snapped"); onSnap(missing); }}
                className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs"
              >
                📸 Yes, upload food
              </button>
              <button
                onClick={() => setAskReason(missing)}
                className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground"
              >
                🍽 Yes, I forgot to snap it
              </button>
              <button
                onClick={() => record("skipped")}
                className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground"
              >
                ❌ I skipped {meal.label.toLowerCase()}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
