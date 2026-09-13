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
  logging_gaps: "Meals Vellyn hasn't seen",
};

interface Props {
  friction: FrictionItem[];
  change: MinimumChange | null;
  loading?: boolean;
  error?: string | null;
  needsMoreData?: boolean;
  answered?: boolean;
  onRefresh: () => void;
  onRespond: (tried: "yes" | "no", reason?: string) => void;
  delay?: number;
}

export const SmallestChangeCard = ({
  friction,
  change,
  loading,
  error,
  needsMoreData,
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
      transition={{ type: "spring", stiffness: 300, damping: 30, delay }}
      className="bg-card border border-border rounded-2xl p-4 shadow-card"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-foreground" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm">Your smallest realistic change</h3>
            <p className="text-xs text-muted-foreground">Based on what you actually ate</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          aria-label="Get a new suggestion"
          className="press p-2 rounded-lg text-muted-foreground disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2" aria-live="polite">
          <div className="skeleton-block h-4 w-2/3" />
          <div className="skeleton-block h-4 w-full" />
          <div className="skeleton-block h-10 w-full" />
          <p className="text-xs text-muted-foreground">Looking at your week…</p>
        </div>
      ) : error ? (
        <div>
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <button
            onClick={onRefresh}
            className="press rounded-xl bg-muted px-4 py-2 text-sm font-semibold text-foreground"
          >
            Try again
          </button>
        </div>
      ) : !change ? (
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            {needsMoreData
              ? "Vellyn needs a few more meals before it can suggest something that really fits your week."
              : "Log a couple of meals and Vellyn will suggest one tiny change that fits your real life."}
          </p>
          <button
            onClick={onRefresh}
            className="press rounded-xl bg-muted px-4 py-2 text-sm font-semibold text-foreground"
          >
            Check again
          </button>
        </div>
      ) : (
        <>
          <p className="font-heading font-semibold text-base mb-1">{change.title}</p>
          <p className="text-sm text-muted-foreground mb-3">{change.action}</p>

          <button
            onClick={() => setShowWhy((v) => !v)}
            className="press flex items-center gap-1 text-xs text-foreground font-semibold mb-3"
          >
            Why Vellyn suggests this
            <ChevronDown className={`w-3 h-3 transition-transform ${showWhy ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {showWhy && (
            <p className="text-xs text-muted-foreground bg-muted rounded-xl p-3 mb-3">
              {change.because} Nutrition figures are estimates.
            </p>
          )}

          {answered ? (
            <p className="text-xs text-muted-foreground">Thanks — Vellyn will remember that.</p>
          ) : askReason ? (
            <div className="flex flex-wrap gap-2">
              {NOT_REALISTIC_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => onRespond("no", r.value)}
                  className="press px-3 py-2 rounded-full text-xs font-semibold bg-muted text-foreground"
                >
                  {r.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onRespond("yes")}
                className="press flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
              >
                <Check className="w-4 h-4" aria-hidden="true" /> I&rsquo;ll try this
              </button>
              <button
                onClick={() => setAskReason(true)}
                className="press flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-muted text-sm font-semibold text-foreground"
              >
                <X className="w-4 h-4" aria-hidden="true" /> Not realistic
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
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-foreground/60"
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
