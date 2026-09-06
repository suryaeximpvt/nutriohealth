import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  RefreshCw,
  Loader2,
  X,
  ThumbsUp,
  ThumbsDown,
  UtensilsCrossed,
  Droplets,
  Activity,
  Heart,
  CheckCircle2,
} from "lucide-react";
import {
  usePersonalisedRecommendations,
  type Recommendation,
} from "@/hooks/usePersonalisedRecommendations";
import { toast } from "sonner";

const KIND_META: Record<string, { icon: typeof Sparkles; tint: string }> = {
  meal: { icon: UtensilsCrossed, tint: "bg-primary/10 text-primary" },
  hydration: { icon: Droplets, tint: "bg-nutrio-blue/10 text-nutrio-blue" },
  movement: { icon: Activity, tint: "bg-nutrio-orange/10 text-nutrio-orange" },
  habit: { icon: CheckCircle2, tint: "bg-nutrio-amber/10 text-nutrio-amber" },
  mindset: { icon: Heart, tint: "bg-accent/20 text-foreground" },
};

export const RecommendationsCard = ({ delay = 0 }: { delay?: number }) => {
  const { recommendations, loading, generating, error, generate, dismiss, sendFeedback } =
    usePersonalisedRecommendations();
  const [rated, setRated] = useState<Record<string, string>>({});

  const rate = async (rec: Recommendation, sentiment: "positive" | "negative") => {
    setRated((prev) => ({ ...prev, [rec.id]: sentiment }));
    await sendFeedback(rec, sentiment);
    toast.success(
      sentiment === "positive" ? "Noted — more like this." : "Thanks — Nutrio will adjust.",
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-heading font-semibold text-foreground leading-tight">For you today</p>
            <p className="text-xs text-muted-foreground">Based on your goal, habits and today so far</p>
          </div>
        </div>
        <button
          onClick={() => void generate()}
          disabled={generating}
          aria-label="Refresh recommendations"
          className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
      </div>

      {error && <p className="text-sm text-destructive mb-2">{error}</p>}

      {(loading || generating) && recommendations.length === 0 && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !generating && recommendations.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          Log a meal or two and Nutrio will start tailoring today's guidance to you.
        </p>
      )}

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {recommendations.map((rec) => {
            const meta = KIND_META[rec.kind] ?? KIND_META.mindset;
            const Icon = meta.icon;
            return (
              <motion.div
                key={rec.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-border bg-background p-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.tint}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{rec.title}</p>
                    {rec.body && <p className="text-sm text-muted-foreground mt-0.5">{rec.body}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => void rate(rec, "positive")}
                        disabled={!!rated[rec.id]}
                        aria-label="Helpful"
                        className={`text-muted-foreground hover:text-primary disabled:opacity-40 ${
                          rated[rec.id] === "positive" ? "text-primary" : ""
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => void rate(rec, "negative")}
                        disabled={!!rated[rec.id]}
                        aria-label="Not helpful"
                        className={`text-muted-foreground hover:text-foreground disabled:opacity-40 ${
                          rated[rec.id] === "negative" ? "text-foreground" : ""
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => void dismiss(rec.id)}
                    aria-label="Dismiss"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
