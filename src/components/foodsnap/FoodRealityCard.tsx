import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import type { BehaviourPattern, RealityScore } from "@/hooks/useFoodBehaviour";

interface Props {
  score: RealityScore | null;
  patterns: BehaviourPattern[];
  delay?: number;
}

const bandLabel = (n: number) =>
  n >= 80 ? "Clear picture" : n >= 55 ? "Good picture" : n >= 30 ? "Partial picture" : "Just getting started";

const bandCopy = (n: number) =>
  n >= 80
    ? "Nutrio can see your real week, so suggestions are grounded in what you actually eat."
    : n >= 55
      ? "A few more snaps and Nutrio will see your full week."
      : n >= 30
        ? "Some meals are still invisible to Nutrio. Snapping those makes advice far more useful."
        : "Snap a few meals and Nutrio will start showing you your real patterns.";

const Row = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-3">
    <span className="w-20 text-xs text-muted-foreground capitalize">{label}</span>
    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6 }}
        className="h-full rounded-full bg-primary"
      />
    </div>
    <span className="w-9 text-right text-xs text-muted-foreground">{value}%</span>
  </div>
);

export const FoodRealityCard = ({ score, patterns, delay = 0 }: Props) => {
  const [open, setOpen] = useState(false);
  if (!score) return null;

  const n = score.overall_score;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl border border-border p-4 shadow-card"
      aria-label="Food reality score"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading font-semibold text-foreground">How well Nutrio knows your week</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Based on the last {score.window_days} days — this is about how much Nutrio can see, not a
            judgement of your eating.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-primary leading-none">{n}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">{bandLabel(n)}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-3">{bandCopy(n)}</p>

      <div className="space-y-2 mt-4">
        <Row label="Breakfast" value={score.breakfast_score} />
        <Row label="Lunch" value={score.lunch_score} />
        <Row label="Dinner" value={score.dinner_score} />
        <Row label="Snacks" value={score.snack_score} />
      </div>

      {patterns.length > 0 && (
        <>
          <button
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-between mt-4 pt-3 border-t border-border"
            aria-expanded={open}
          >
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              What Nutrio has noticed ({patterns.length})
            </span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <ul className="mt-3 space-y-3">
              {patterns.map((p) => (
                <li key={p.pattern_key} className="rounded-xl bg-accent/20 p-3">
                  <p className="text-sm font-medium text-foreground">{p.label}</p>
                  {p.detail && <p className="text-xs text-muted-foreground mt-1">{p.detail}</p>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </motion.section>
  );
};
