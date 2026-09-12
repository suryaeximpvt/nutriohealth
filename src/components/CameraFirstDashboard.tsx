import { motion } from "framer-motion";
import { Camera, Mic, Search, Plus, Minus, Droplets, Scale, ChevronRight, Coffee, Salad, Apple, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ProgressRing";
import { MacroBar } from "@/components/MacroBar";
import { Skeleton } from "@/components/ui/skeleton";

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
  loading?: boolean;
  latestPhotoUrl?: string | null;
  onSnap: () => void;
  onVoice: () => void;
  onManual: (meal?: MealType) => void;
  onOpenIntake: () => void;
  onAddWater: () => void;
  onRemoveWater: () => void;
}

const MEALS = [
  { type: "breakfast" as const, label: "Breakfast", icon: Coffee },
  { type: "lunch" as const, label: "Lunch", icon: Salad },
  { type: "snacks" as const, label: "Snacks", icon: Apple },
  { type: "dinner" as const, label: "Dinner", icon: Utensils },
];

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

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
  loading = false,
  latestPhotoUrl,
  onSnap,
  onVoice,
  onManual,
  onOpenIntake,
  onAddWater,
  onRemoveWater,
}: CameraFirstDashboardProps) => (
  <div className="space-y-4">
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-foreground shadow-elevated"
    >
      {latestPhotoUrl ? (
        <img src={latestPhotoUrl} alt="Your most recently logged meal" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-foreground">
          <div className="absolute right-5 top-5 flex h-20 w-20 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10">
            <Camera className="h-8 w-8 text-primary-foreground/80" aria-hidden="true" />
          </div>
        </div>
      )}
      {latestPhotoUrl && <div className="capture-scrim absolute inset-0" />}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-sm font-semibold text-primary-foreground/90">Your real food. Your better plan.</p>
        <h1 className="mt-1 text-2xl font-bold text-primary-foreground">Snap what you ate</h1>
        <p className="mt-1 max-w-xs text-sm text-primary-foreground/80">One photo is enough to get started.</p>
        <Button onClick={onSnap} className="mt-4 h-12 rounded-xl px-5 shadow-elevated">
          <Camera className="h-5 w-5" />
          Log a photo
        </Button>
      </div>
    </motion.section>

    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" onClick={() => onManual()} className="h-12 rounded-xl bg-card shadow-card">
        <Search className="h-4 w-4 text-muted-foreground" /> Search or log manually
      </Button>
      <Button variant="outline" onClick={onVoice} className="h-12 rounded-xl bg-card shadow-card">
        <Mic className="h-4 w-4 text-muted-foreground" /> Log with Tell Nutrio
      </Button>
    </div>

    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.08 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-card"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Today</p>
          <h2 className="text-lg font-bold text-foreground">Daily energy</h2>
        </div>
        {!loading && <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">{caloriesConsumed} eaten</span>}
      </div>
      {loading ? (
        <div aria-label="Loading daily energy">
          <Skeleton className="mx-auto h-44 w-44 rounded-full" />
          <div className="mt-5 grid grid-cols-2 gap-5">
            {[0, 1, 2, 3].map((item) => <div key={item} className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-2 w-full rounded-full" /></div>)}
          </div>
        </div>
      ) : (
        <>
          <button onClick={onOpenIntake} className="mx-auto block rounded-full" aria-label="Open today's calorie details">
            <ProgressRing progress={calorieProgress} size={172} strokeWidth={12}>
              <div className="text-center">
                <p className="text-4xl font-bold text-foreground">{caloriesRemaining}</p>
                <p className="text-sm font-medium text-muted-foreground">kcal left</p>
                <p className="mt-1 text-xs text-muted-foreground">of {calorieTarget}</p>
              </div>
            </ProgressRing>
          </button>
          <div className="mt-5 grid grid-cols-2 gap-5">
            <MacroBar label="Protein" current={Math.round(protein)} target={proteinTarget} tone="protein" />
            <MacroBar label="Carbs" current={Math.round(carbs)} target={carbsTarget} tone="carbs" />
            <MacroBar label="Fat" current={Math.round(fat)} target={fatTarget} tone="fat" />
            <MacroBar label="Fibre" current={Math.round(fibre)} target={fibreTarget} tone="fibre" />
          </div>
        </>
      )}
    </motion.section>

    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.14 }}>
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Diary</p>
        <h2 className="text-xl font-bold text-foreground">Today’s meals</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {loading ? [0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-36 rounded-2xl" />) : MEALS.map((meal, index) => {
          const items = meals[meal.type] ?? [];
          const total = items.reduce((sum, food) => sum + food.calories, 0);
          const MealIcon = meal.icon;
          return (
            <motion.button
              key={meal.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.18 + index * 0.04 }}
              onClick={() => onManual(meal.type)}
              className="min-h-36 rounded-2xl border border-border bg-card p-4 text-left shadow-card transition-[transform,box-shadow] duration-150 hover:shadow-elevated"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground"><MealIcon className="h-5 w-5" /></span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="mt-3 font-semibold text-foreground">{meal.label}</h3>
              {items.length ? (
                <>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{items.map((item) => item.food_name).join(", ")}</p>
                  <p className="mt-2 text-sm font-bold text-foreground">{total} kcal</p>
                </>
              ) : (
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-foreground"><Plus className="h-4 w-4" /> Log this meal</p>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.section>

    <div className="grid grid-cols-2 gap-3">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"><Droplets className="h-4 w-4 text-foreground" /></span>
          <div className="flex gap-1">
            <button onClick={onRemoveWater} aria-label="Remove a glass of water" className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card"><Minus className="h-4 w-4" /></button>
            <button onClick={onAddWater} aria-label="Add a glass of water" className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background"><Plus className="h-4 w-4" /></button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Water</p>
        <p className="text-lg font-bold text-foreground">{waterGlasses} <span className="text-xs font-medium text-muted-foreground">glasses</span></p>
      </section>
      <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"><Scale className="h-4 w-4 text-foreground" /></span>
        <p className="mt-3 text-xs text-muted-foreground">Weight</p>
        <p className="text-lg font-bold text-foreground">{weight ?? "—"} <span className="text-xs font-medium text-muted-foreground">{weight ? "kg" : "Add weight"}</span></p>
      </section>
    </div>
  </div>
);