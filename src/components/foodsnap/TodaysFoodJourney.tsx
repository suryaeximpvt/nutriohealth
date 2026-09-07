import { motion } from "framer-motion";
import { Camera, Check, Clock } from "lucide-react";
import { MEAL_TYPES, type MealType } from "@/lib/foodSnap";
import type { FoodCapture } from "@/hooks/useFoodCaptures";
import { guessMealType } from "@/lib/foodSnap";

interface Props {
  captures: FoodCapture[];
  onSnap: (meal: MealType) => void;
  delay?: number;
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });

export const TodaysFoodJourney = ({ captures, onSnap, delay = 0 }: Props) => {
  const expected = guessMealType();
  const order: MealType[] = ["breakfast", "lunch", "snack", "dinner"];
  const rank: Record<MealType, number> = { breakfast: 0, lunch: 1, snack: 2, dinner: 3 };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl p-5 shadow-card"
    >
      <h2 className="font-bold text-foreground mb-4">Today's food journey</h2>
      <div className="space-y-2">
        {order.map((m) => {
          const meta = MEAL_TYPES.find((x) => x.value === m)!;
          const mine = captures.filter((c) => c.meal_type === m);
          const captured = mine.length > 0;
          const due = !captured && rank[m] <= rank[expected];
          return (
            <button
              key={m}
              onClick={() => onSnap(m)}
              className="w-full flex items-center gap-3 rounded-xl border p-3 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="text-xl">{meta.emoji}</span>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{meta.label}</p>
                <p className="text-xs text-muted-foreground">
                  {captured
                    ? `Captured · ${fmtTime(mine[mine.length - 1].captured_at)}${mine.length > 1 ? ` · ${mine.length} snaps` : ""}`
                    : due
                      ? "Not captured yet"
                      : "—"}
                </p>
              </div>
              {captured ? (
                <Check className="w-5 h-5 text-primary" />
              ) : due ? (
                <span className="flex items-center gap-1 text-xs text-nutrio-amber">
                  <Clock className="w-4 h-4" />
                </span>
              ) : (
                <Camera className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          );
        })}
      </div>
    </motion.section>
  );
};
