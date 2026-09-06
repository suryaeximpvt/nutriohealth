import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Camera, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMealStatus, type MealStatusValue } from "@/hooks/useMealStatus";
import { usePersonalisation } from "@/hooks/usePersonalisation";
import { useUserData } from "@/hooks/useUserData";

const PORTIONS: { label: string; desc: string; calories: number }[] = [
  { label: "Light", desc: "~300 kcal", calories: 300 },
  { label: "Normal", desc: "~500 kcal", calories: 500 },
  { label: "Large", desc: "~750 kcal", calories: 750 },
  { label: "Very large", desc: "~1000 kcal", calories: 1000 },
];

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
  onAddPhoto,
}: {
  delay?: number;
  loggedCounts?: Record<string, number>;
  onAddPhoto?: (mealType: "breakfast" | "lunch" | "snacks" | "dinner") => void;
}) => {
  const { statuses, setStatus } = useMealStatus();
  const { routine } = usePersonalisation();
  const { logFood } = useUserData();
  const [askingFor, setAskingFor] = useState<string | null>(null);
  const [customKcal, setCustomKcal] = useState("");
  const [savingMeal, setSavingMeal] = useState(false);

  const saveEstimate = async (mealKey: string, label: string, calories: number) => {
    setSavingMeal(true);
    const result = await logFood(mealKey, {
      name: `${label} portion (estimated)`,
      calories,
      protein: Math.round((calories * 0.2) / 4),
      carbs: Math.round((calories * 0.5) / 4),
      fat: Math.round((calories * 0.3) / 9),
      fibre: 3,
      quantity: 1,
    });
    setSavingMeal(false);
    if (result?.error) {
      toast.error("We couldn't save that. Please try again.");
      return;
    }
    await setStatus(mealKey, "logged", `${label} portion ~${calories} kcal`);
    setAskingFor(null);
    setCustomKcal("");
    toast.success("Thanks — added to today's total.");
  };

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
                      onClick={() => {
                        if (c.value === "logged") {
                          setAskingFor(m.key);
                          setCustomKcal("");
                          return;
                        }
                        setAskingFor(null);
                        setStatus(m.key, c.value);
                      }}
                      className={`px-3 h-8 rounded-lg border text-xs font-medium transition-all ${
                        (c.value === "logged" && askingFor === m.key) || statuses[m.key] === c.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}

              <AnimatePresence>
                {!hasLogged && askingFor === m.key && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-xl bg-muted/50 p-3 space-y-3">
                      <p className="text-xs font-semibold text-foreground">
                        Roughly how much was it? A quick estimate keeps your day accurate.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {PORTIONS.map((pOpt) => (
                          <button
                            key={pOpt.label}
                            disabled={savingMeal}
                            onClick={() => saveEstimate(m.key, pOpt.label, pOpt.calories)}
                            className="rounded-lg border border-border bg-card px-3 py-2 text-left hover:border-primary/50 transition-all disabled:opacity-60"
                          >
                            <p className="text-xs font-semibold text-foreground">{pOpt.label}</p>
                            <p className="text-[11px] text-muted-foreground">{pOpt.desc}</p>
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={customKcal}
                          onChange={(e) => setCustomKcal(e.target.value)}
                          placeholder="Exact kcal"
                          className="h-9 text-sm rounded-lg"
                        />
                        <Button
                          size="sm"
                          className="h-9 rounded-lg"
                          disabled={!customKcal || savingMeal}
                          onClick={() => saveEstimate(m.key, "Custom", parseInt(customKcal) || 0)}
                        >
                          {savingMeal ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                        </Button>
                      </div>
                      {onAddPhoto && (
                        <button
                          onClick={() =>
                            onAddPhoto(m.key as "breakfast" | "lunch" | "snacks" | "dinner")
                          }
                          className="flex items-center gap-2 text-xs font-semibold text-primary"
                        >
                          <Camera className="w-4 h-4" />
                          Add a photo instead — we'll work out the calories
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
