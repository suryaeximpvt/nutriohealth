import { motion } from "framer-motion";
import { LineChart, RefreshCw, Loader2, Trophy, Target, Lightbulb } from "lucide-react";
import { useWeeklyInsight } from "@/hooks/useWeeklyInsight";

const STATUS_META: Record<string, { label: string; classes: string; dot: string }> = {
  green: { label: "On Track", classes: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" },
  yellow: {
    label: "Slight Adjustment Recommended",
    classes: "bg-nutrio-amber/10 text-nutrio-amber border-nutrio-amber/20",
    dot: "bg-nutrio-amber",
  },
  orange: {
    label: "Refocus This Week",
    classes: "bg-nutrio-orange/10 text-nutrio-orange border-nutrio-orange/20",
    dot: "bg-nutrio-orange",
  },
  blue: {
    label: "Recovery and Balance Week",
    classes: "bg-nutrio-blue/10 text-nutrio-blue border-nutrio-blue/20",
    dot: "bg-nutrio-blue",
  },
};

export const WeeklyInsightCard = ({ delay = 0 }: { delay?: number }) => {
  const { summary, loading, generating, generate } = useWeeklyInsight();

  const insight = summary?.insight;
  const meta = STATUS_META[summary?.status ?? "green"] ?? STATUS_META.green;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LineChart className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-foreground">Weekly Nutrio Insight</h2>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="text-muted-foreground hover:text-foreground disabled:opacity-50"
          aria-label="Refresh weekly insight"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>

      {loading || (generating && !insight) ? (
        <div className="space-y-3">
          <div className="h-6 w-40 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-full rounded bg-muted animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        </div>
      ) : !insight ? (
        <p className="text-sm text-muted-foreground">
          Log a few meals this week and Nutrio will build your insight.
        </p>
      ) : (
        <div className="space-y-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${meta.classes}`}>
            <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
            {meta.label}
          </div>

          <p className="font-semibold text-foreground">{insight.headline}</p>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{summary?.avg_calories ?? 0}</p>
              <p className="text-[11px] text-muted-foreground">avg kcal</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{summary?.avg_protein ?? 0}g</p>
              <p className="text-[11px] text-muted-foreground">avg protein</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{summary?.days_logged ?? 0}/7</p>
              <p className="text-[11px] text-muted-foreground">days logged</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{insight.trend}</p>
            <p>{insight.goal_alignment}</p>
            <p>{insight.protein}</p>
            <p>{insight.meal_consistency}</p>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2 rounded-xl bg-primary/5 p-3">
              <Trophy className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{insight.achievement}</p>
            </div>
            <div className="flex gap-2 rounded-xl bg-muted/50 p-3">
              <Target className="w-4 h-4 text-nutrio-orange shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{insight.focus}</p>
            </div>
            <div className="flex gap-2 rounded-xl bg-muted/50 p-3">
              <Lightbulb className="w-4 h-4 text-nutrio-amber shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{insight.strategy}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
