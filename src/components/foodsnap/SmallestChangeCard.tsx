import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Check, X, ChevronDown } from "lucide-react";
import { FrictionItem, MinimumChange } from "@/hooks/useMinimumChange";

const NOT_REALISTIC_REASONS = [
  { value: "no_time", label: "No time" },
  { value: "dont_like", label: "Don't like it" },
  { value: "too_expensive", label: "Too expensive" },
  { value: "not_available", label: "Can't get it easily" },
  { value: "other", label: "Something else" },
];

const FRICTION_LABELS: Record<string, string> = {
  eating_away_from_home: "Eating out or on the go",
  time_pressure: "Busy or rushed days",
  skipping_breakfast: "Mornings without breakfast",
  late_eating: "Late dinners",
  low_protein_meals: "Lighter protein meals",
  logging_gaps: "Meals Nutrio hasn't seen",
};

interface Props {
  friction: FrictionItem[];
  change: MinimumChange | null;
  loading?: boolean;
  answered?: boolean;
  onRefresh: () => void;
  onRespond: (tried: "yes" | "no", reason?: string) => void;
  delay?: number;
}

export const SmallestChangeCard = ({
  friction,
  change,
  loading,
  answered,
  onRefresh,
  onRespond,
  delay = 0,
}: Props) => {
  const [showWhy, setShowWhy] = useState(false);
  const [askReason, setAskReason] = useState(false);

  const top = [...friction].sort((a, b) => b.score - a.score).filter((f) => f.score >= 25).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-4 shadow-card"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm">Your smallest realistic change</h3>
            <p className="text-xs text-muted-foreground">Based on what you actually ate</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          aria-label="Get a new suggestion"
          className="p-2 rounded-lg hover:bg-accent/20 text-muted-foreground"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {!change ? (
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Looking at your week…"
            : "Snap a few more meals and Nutrio will suggest one tiny change that fits your real life."}
        </p>
      ) : (
        <>
          <p className="font-heading font-semibold text-base mb-1">{change.title}</p>
          <p className="text-sm text-muted-foreground mb-3">{change.action}</p>

          <button
            onClick={() => setShowWhy((v) => !v)}
            className="flex items-center gap-1 text-xs text-primary font-medium mb-3"
          >
            Why Nutrio suggests this
            <ChevronDown className={`w-3 h-3 transition-transform ${showWhy ? "rotate-180" : ""}`} />
          </button>
          {showWhy && (
            <p className="text-xs text-muted-foreground bg-accent/20 rounded-xl p-3 mb-3">
              {change.because} Nutrition figures are estimates.
            </p>
          )}

          {answered ? (
            <p className="text-xs text-muted-foreground">Thanks — Nutrio will remember that.</p>
          ) : askReason ? (
            <div className="flex flex-wrap gap-2">
              {NOT_REALISTIC_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => onRespond("no", r.value)}
                  className="px-3 py-1.5 rounded-full text-xs bg-accent/20 hover:bg-accent/40"
                >
                  {r.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onRespond("yes")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
              >
                <Check className="w-4 h-4" /> I'll try this
              </button>
              <button
                onClick={() => setAskReason(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-accent/20 text-sm font-medium"
              >
                <X className="w-4 h-4" /> Not realistic
              </button>
            </div>
          )}
        </>
      )}

      {top.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">What gets in the way</p>
          <div className="space-y-2">
            {top.map((f) => (
              <div key={f.friction_type}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{FRICTION_LABELS[f.friction_type] ?? f.friction_type}</span>
                  <span className="text-muted-foreground">{f.score}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-accent/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-nutrio-amber"
                    style={{ width: `${Math.min(100, f.score)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
