import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Meh, Check } from "lucide-react";
import {
  REJECTION_REASONS,
  type RecRating,
  type TrackPayload,
} from "@/hooks/useRecommendationTracking";

interface Props {
  payload: TrackPayload;
  onRate: (rating: RecRating, reason?: string | null) => void | Promise<void>;
  compact?: boolean;
}

/** "Was this helpful?" with a follow-up reason when it wasn't. */
export const RecommendationFeedback = ({ payload, onRate, compact }: Props) => {
  const [rating, setRating] = useState<RecRating | null>(null);
  const [askReason, setAskReason] = useState(false);
  const [done, setDone] = useState(false);

  const choose = async (r: RecRating) => {
    setRating(r);
    if (r === "not_helpful") {
      setAskReason(true);
      return;
    }
    await onRate(r);
    setDone(true);
  };

  const chooseReason = async (reason: string) => {
    await onRate("not_helpful", reason);
    setAskReason(false);
    setDone(true);
  };

  if (done) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
        <Check className="w-3.5 h-3.5 text-primary" /> Thanks — Nutrio will adjust what it suggests.
      </p>
    );
  }

  const btn = (active: boolean) =>
    `flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
      active
        ? "border-primary bg-primary/10 text-primary"
        : "border-border text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="mt-2" data-rec-id={payload.recommendationId ?? undefined}>
      {!askReason && (
        <div className="flex items-center gap-2 flex-wrap">
          {!compact && <span className="text-xs text-muted-foreground">Was this helpful?</span>}
          <button onClick={() => void choose("helpful")} className={btn(rating === "helpful")} aria-label="Helpful">
            <ThumbsUp className="w-3.5 h-3.5" /> Helpful
          </button>
          <button onClick={() => void choose("okay")} className={btn(rating === "okay")} aria-label="Okay">
            <Meh className="w-3.5 h-3.5" /> Okay
          </button>
          <button
            onClick={() => void choose("not_helpful")}
            className={btn(rating === "not_helpful")}
            aria-label="Not helpful"
          >
            <ThumbsDown className="w-3.5 h-3.5" /> Not helpful
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {askReason && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <p className="text-xs text-muted-foreground mb-1.5">Why wasn't it right?</p>
            <div className="flex flex-wrap gap-1.5">
              {REJECTION_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => void chooseReason(r.value)}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
