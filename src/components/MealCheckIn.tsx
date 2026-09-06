import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useMealStatus, type MealStatusValue } from "@/hooks/useMealStatus";
import { usePersonalisation } from "@/hooks/usePersonalisation";

const MEALS: { key: string; label: string; emoji: string; timeKey: string }[] = [
  { key: "breakfast", label: "Breakfast", emoji: "🌅", timeKey: "breakfast_time" },
  { key: "lunch", label: "Lunch", emoji: "☀️", timeKey: "lunch_time" },
  { key: "snacks", label: "Snack", emoji: "🍎", timeKey: "" },
  { key: "dinner", label: "Dinner", emoji: "🌙", timeKey: "dinner_time" },
];

const CHOICES: { value: MealStatusValue; label: string }[] = [
  { value: "logged", label: "Ate it" },
  { value: "delayed", label: "Later" },
  { value: "skipped", label: "Skipped" },
  { value: "not_applicable", label: "Not today" },
];

const STATUS_LABEL: Record<string, string> = {
  logged: "Eaten",
  delayed: "Eating later",
  skipped: "Skipped",
  not_applicable: "Not today",
  planned: "Planned",
  reminder_sent: "Reminded",
};

const fmt = (t?: string | null) => (t ? t.slice(0, 5) : null);

export const MealCheckIn = ({
  delay = 0,
  loggedCounts,
}: {
  delay?: number;
  loggedCounts?: Record<string, number>;
}) => {
  const { statuses, setStatus } = useMealStatus();
  const { routine } = usePersonalisation();

  const mealsEaten = routine?.meals_eaten ?? ["breakfast", "lunch", "dinner", "snacks"];
  const visible = MEALS.filter((m) => mealsEaten.includes(m.key) || m.key === "snacks");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl p-5 shadow-card"
    >
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-foreground">Today's Meals</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        A quick check-in — nothing is assumed for you.
      </p>

      <div className="space-y-3">
        {visible.map((m) => {
          const time = m.timeKey ? fmt((routine as never as Record<string, string>)?.[m.timeKey]) : null;
          const hasLogged = (loggedCounts?.[m.key] ?? 0) > 0;
          const status = hasLogged ? "logged" : statuses[m.key];
          return (
            <div key={m.key} className="rounded-2xl border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{m.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{m.label}</p>
                    {time && <p className="text-xs text-muted-foreground">Usually around {time}</p>}
                  </div>
                </div>
                {status && (
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      status === "logged"
                        ? "bg-primary/10 text-primary"
                        : status === "delayed"
                        ? "bg-nutrio-amber/15 text-nutrio-amber"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                )}
              </div>
              {!hasLogged && (
                <div className="flex flex-wrap gap-2">
                  {CHOICES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setStatus(m.key, c.value)}
                      className={`px-3 h-8 rounded-lg border text-xs font-medium transition-all ${
                        statuses[m.key] === c.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
