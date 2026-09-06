import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { useSmartReminders, type SmartReminder } from "@/hooks/useSmartReminders";

const PRIORITY_STYLE: Record<string, string> = {
  high: "border-primary/30 bg-primary/5",
  medium: "border-nutrio-amber/30 bg-nutrio-amber/5",
  low: "border-border bg-muted/40",
};

export const NextActionCard = ({
  delay = 0,
  loggedCounts,
  waterGlasses,
}: {
  delay?: number;
  loggedCounts?: Record<string, number>;
  waterGlasses?: number;
}) => {
  const { reminders, acknowledge } = useSmartReminders({ loggedCounts, waterGlasses });

  if (reminders.length === 0) return null;

  const top: SmartReminder = reminders[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ delay }}
        className={`rounded-2xl border p-4 ${PRIORITY_STYLE[top.priority]}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">
              Next action
            </p>
            <p className="font-semibold text-foreground">{top.title}</p>
            <p className="text-sm text-muted-foreground">{top.body}</p>
            {reminders.length > 1 && (
              <p className="text-xs text-muted-foreground mt-2">
                {reminders.length - 1} more waiting — Nutrio keeps them to a minimum.
              </p>
            )}
          </div>
          <button
            onClick={() => acknowledge(top, false)}
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
