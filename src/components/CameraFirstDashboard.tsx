import { motion } from "framer-motion";
import { Camera, Mic, Search, Plus, Minus, Droplets, Scale, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ProgressRing";
import { MacroBar } from "@/components/MacroBar";
import authArt from "@/assets/auth-art.jpg";

type MealType = "breakfast" | "lunch" | "snacks" | "dinner";

interface FoodItem {
  id: string;
  food_name: string;
  calories: number;
}

interface CameraFirstDashboardProps {
  caloriesConsumed: number;
  caloriesRemaining: number;
  calorieTarget: number;
  calorieProgress: number;
  protein: number;
  proteinTarget: number;
  carbs: number;
  carbsTarget: number;
  fat: number;
  fatTarget: number;
  fibre: number;
  fibreTarget: number;
  meals: Record<MealType, FoodItem[]>;
  waterGlasses: number;
  weight?: number | null;
  onSnap: () => void;
  onVoice: () => void;
  onManual: (meal?: MealType) => void;
  onOpenIntake: () => void;
  onAddWater: () => void;
  onRemoveWater: () => void;
}

const MEALS: { type: MealType; label: string; emoji: string }[] = [
  { type: "breakfast", label: "Breakfast", emoji: "🥣" },
  { type: "lunch", label: "Lunch", emoji: "🥗" },
  { type: "snacks", label: "Snacks", emoji: "🍎" },
  { type: "dinner", label: "Dinner", emoji: "🍲" },
];

export const CameraFirstDashboard = ({
  caloriesConsumed,
  caloriesRemaining,
  calorieTarget,
  calorieProgress,
  protein,
  proteinTarget,
  carbs,
  carbsTarget,
  fat,
  fatTarget,
  fibre,
  fibreTarget,
  meals,
  waterGlasses,
  weight,
  onSnap,
  onVoice,
  onManual,
  onOpenIntake,
  onAddWater,
  onRemoveWater,
}: CameraFirstDashboardProps) => (
  <div className="space-y-4">
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-elevated"
    >
      <img src={authArt} alt="A colourful balanced meal ready to capture" className="absolute inset-0 h-full w-full object-cover" />
      <div className="capture-scrim absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-sm font-semibold text-primary-foreground/90">Your real food. Your better plan.</p>
        <h1 className="mt-1 text-2xl font-bold text-primary-foreground">Snap what you ate</h1>
        <p className="mt-1 max-w-xs text-sm text-primary-foreground/80">One photo is enough for Nutrio to start learning.</p>
        <Button onClick={onSnap} className="mt-4 h-12 rounded-xl bg-accent px-5 text-accent-foreground shadow-elevated hover:bg-accent/90">
          <Camera className="h-5 w-5" />
          Add photo to track
        </Button>
      </div>
    </motion.section>

    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" onClick={() => onManual()} className="h-12 rounded-xl bg-card shadow-card">
        <Search className="h-4 w-4 text-primary" /> Search or type
      </Button>
      <Button variant="outline" onClick={onVoice} className="h-12 rounded-xl bg-card shadow-card">
        <Mic className="h-4 w-4 text-primary" /> Tell Nutrio
      </Button>
    </div>

    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Today</p>
          <h2 className="text-lg font-bold text-foreground">Daily energy</h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{caloriesConsumed} eaten</span>
      </div>
      <button onClick={onOpenIntake} className="mx-auto block" aria-label="Open today's calorie details">
        <ProgressRing progress={calorieProgress} size={172} strokeWidth={13}>
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">{caloriesRemaining}</p>
            <p className="text-sm font-medium text-muted-foreground">kcal left</p>
            <p className="mt-1 text-xs text-primary">of {calorieTarget}</p>
          </div>
        </ProgressRing>
      </button>
      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4">
        <MacroBar label="Protein" current={Math.round(protein)} target={proteinTarget} color="hsl(var(--primary))" />
        <MacroBar label="Carbs" current={Math.round(carbs)} target={carbsTarget} color="hsl(var(--nutrio-orange))" />
        <MacroBar label="Fat" current={Math.round(fat)} target={fatTarget} color="hsl(var(--nutrio-yellow))" />
        <MacroBar label="Fibre" current={Math.round(fibre)} target={fibreTarget} color="hsl(var(--nutrio-purple))" />
      </div>
    </motion.section>

    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Diary</p>
          <h2 className="text-xl font-bold text-foreground">Today’s meals</h2>
        </div>
        <button onClick={onSnap} className="text-sm font-semibold text-primary">Add food</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {MEALS.map((meal, index) => {
          const items = meals[meal.type] ?? [];
          const total = items.reduce((sum, food) => sum + food.calories, 0);
          return (
            <motion.button
              key={meal.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + index * 0.04 }}
              onClick={() => onManual(meal.type)}
              className="min-h-36 rounded-2xl border border-border/60 bg-card p-4 text-left shadow-card transition-shadow hover:shadow-elevated"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-2xl">{meal.emoji}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="mt-3 font-semibold text-foreground">{meal.label}</h3>
              {items.length ? (
                <>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{items.map((item) => item.food_name).join(", ")}</p>
                  <p className="mt-2 text-sm font-bold text-foreground">{total} kcal</p>
                </>
              ) : (
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-primary"><Plus className="h-3.5 w-3.5" /> Log this meal</p>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.section>

    <div className="grid grid-cols-2 gap-3">
      <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
        <div className="flex items-center justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-nutrio-blue/10"><Droplets className="h-4 w-4 text-nutrio-blue" /></span>
          <div className="flex gap-1">
            <button onClick={onRemoveWater} aria-label="Remove a glass of water" className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"><Minus className="h-3.5 w-3.5" /></button>
            <button onClick={onAddWater} aria-label="Add a glass of water" className="flex h-8 w-8 items-center justify-center rounded-full bg-nutrio-blue text-primary-foreground"><Plus className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Water</p>
        <p className="text-lg font-bold text-foreground">{waterGlasses} <span className="text-xs font-medium text-muted-foreground">glasses</span></p>
      </section>
      <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10"><Scale className="h-4 w-4 text-accent" /></span>
        <p className="mt-3 text-xs text-muted-foreground">Weight</p>
        <p className="text-lg font-bold text-foreground">{weight ?? "—"} <span className="text-xs font-medium text-muted-foreground">{weight ? "kg" : "Add weight"}</span></p>
      </section>
    </div>
  </div>
);