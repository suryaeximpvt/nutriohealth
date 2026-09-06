import { motion } from "framer-motion";
import { CheckCircle2, Circle, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNonNegotiables } from "@/hooks/useNonNegotiables";

export const NonNegotiablesCard = ({ delay = 0 }: { delay?: number }) => {
  const { items, loading, toggleToday } = useNonNegotiables();
  const navigate = useNavigate();

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl p-5 shadow-card"
    >
      <div className="flex items-center gap-2 mb-1">
        <Target className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-foreground">Your Non-Negotiables</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        The habits you told Nutrio you never want to miss.
      </p>

      {items.length === 0 ? (
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            You haven't set any yet. Add a few and Nutrio will keep track of them with you.
          </p>
          <Button variant="outline" className="w-full rounded-xl" onClick={() => navigate("/settings")}>
            Add non-negotiables
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const pct = Math.min(100, (item.weekCount / Math.max(1, item.target_count)) * 100);
            return (
              <button
                key={item.id}
                onClick={() => toggleToday(item)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-3">
                  {item.doneToday ? (
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {item.weekCount}/{item.target_count} this week
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted mt-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          <p className="text-xs text-muted-foreground pt-1">
            Tap one to mark it done today. Progress resets each Monday.
          </p>
        </div>
      )}
    </motion.div>
  );
};
