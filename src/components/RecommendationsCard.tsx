import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  RefreshCw,
  Loader2,
  X,
  UtensilsCrossed,
  Droplets,
  Activity,
  Heart,
  CheckCircle2,
  Check,
  CircleSlash,
} from "lucide-react";
import {
  usePersonalisedRecommendations,
  type Recommendation,
} from "@/hooks/usePersonalisedRecommendations";
import {
  useRecommendationTracking,
  type RecRating,
  type TrackPayload,
} from "@/hooks/useRecommendationTracking";
import { RecommendationFeedback } from "@/components/RecommendationFeedback";
import { toast } from "sonner";

const KIND_META: Record<string, { icon: typeof Sparkles; tint: string }> = {
  meal: { icon: UtensilsCrossed, tint: "bg-primary/10 text-primary" },
  hydration: { icon: Droplets, tint: "bg-nutrio-blue/10 text-nutrio-blue" },
  movement: { icon: Activity, tint: "bg-nutrio-orange/10 text-nutrio-orange" },
  habit: { icon: CheckCircle2, tint: "bg-nutrio-amber/10 text-nutrio-amber" },
  mindset: { icon: Heart, tint: "bg-accent/20 text-foreground" },
};

const payloadFor = (rec: Recommendation): TrackPayload => ({
  recommendationId: rec.id,
  recommendationType: rec.kind,
  content: { title: rec.title, body: rec.body },
});

export const RecommendationsCard = ({ delay = 0 }: { delay?: number }) => {
  const { recommendations, loading, generating, error, generate, dismiss, sendFeedback } =
    usePersonalisedRecommendations();
  const { track, trackShown, submitFeedback } = useRecommendationTracking();
  const [openId, setOpenId] = useState<string | null>(null);
  const [actioned, setActioned] = useState<Record<string, string>>({});

  useEffect(() => {
    recommendations.forEach((rec) => trackShown(payloadFor(rec)));
  }, [recommendations, trackShown]);

  const open = (rec: Recommendation) => {
    const next = openId === rec.id ? null : rec.id;
    setOpenId(next);
    if (next) void track("opened", payloadFor(rec));
  };

  const markFollowed = async (rec: Recommendation, kind: "followed" | "partially_followed" | "not_followed") => {
    setActioned((prev) => ({ ...prev, [rec.id]: kind }));
    await track(kind === "not_followed" ? "not_followed" : "accepted", payloadFor(rec));
    if (kind !== "not_followed") await track(kind, payloadFor(rec));
    toast.success(
      kind === "followed"
        ? "Logged — Nutrio will suggest more like this."
        : kind === "partially_followed"
          ? "Noted, part of the way there."
          : "Noted — Nutrio will change tack.",
    );
  };

  const rate = async (rec: Recommendation, rating: RecRating, reason?: string | null) => {
    await submitFeedback(payloadFor(rec), rating, reason ?? null);
    await sendFeedback(rec, rating === "not_helpful" ? "negative" : "positive");
  };

  const removeRec = async (rec: Recommendation) => {
    await track("dismissed", payloadFor(rec));
    await dismiss(rec.id);
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
            <p className="text-xs text-muted-foreground">Adapted to your goal, habits and what you've told us</p>
          </div>
        </div>
        <button
          onClick={() => void generate()}
          disabled={generating}
          aria-label="Refresh recommendations"
          className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
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
            const isOpen = openId === rec.id;
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
                    <button onClick={() => open(rec)} className="text-left w-full">
                      <p className="font-semibold text-sm text-foreground">{rec.title}</p>
                      {rec.body && <p className="text-sm text-muted-foreground mt-0.5">{rec.body}</p>}
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          {!actioned[rec.id] ? (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <button
                                onClick={() => void markFollowed(rec, "followed")}
                                className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                              >
                                <Check className="w-3.5 h-3.5" /> I did this
                              </button>
                              <button
                                onClick={() => void markFollowed(rec, "partially_followed")}
                                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                              >
                                Partly
                              </button>
                              <button
                                onClick={() => void markFollowed(rec, "not_followed")}
                                className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                              >
                                <CircleSlash className="w-3.5 h-3.5" /> Didn't do it
                              </button>
                            </div>
                          ) : (
                            <RecommendationFeedback payload={payloadFor(rec)} onRate={(r, reason) => rate(rec, r, reason)} />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button
                    onClick={() => void removeRec(rec)}
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
