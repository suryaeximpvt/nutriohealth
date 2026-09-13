import { motion } from "framer-motion";
import {
  Apple,
  Camera,
  ChevronRight,
  Droplets,
  Mic,
  Minus,
  Moon,
  Plus,
  Salad,
  Scale,
  Search,
  Sunrise,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ProgressRing";
import { MacroBar } from "@/components/MacroBar";

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
  /** The person's own most recent food photo, when one exists. */
  heroPhotoUrl?: string | null;
  loading?: boolean;
  onSnap: () => void;
  onVoice: () => void;
  onManual: (meal?: MealType) => void;
  onOpenIntake: () => void;
  onAddWater: () => void;
  onRemoveWater: () => void;
}

const MEALS: { type: MealType; label: string; icon: LucideIcon }[] = [
  { type: "breakfast", label: "Breakfast", icon: Sunrise },
  { type: "lunch", label: "Lunch", icon: Salad },
  { type: "snacks", label: "Snacks", icon: Apple },
  { type: "dinner", label: "Dinner", icon: Moon },
];

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const DashboardSkeleton = () => (
  <div className="space-y-4">
    <div className="skeleton-block aspect-[16/10] w-full" />
    <div className="skeleton-block h-12 w-full" />
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="skeleton-block mx-auto h-44 w-44 rounded-full" />
      <div className="mt-5 grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton-block h-8" />
        ))}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton-block h-36" />
      ))}
    </div>
  </div>
);

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
  heroPhotoUrl,
  loading = false,
  onSnap,
  onVoice,
  onManual,
  onOpenIntake,
  onAddWater,
  onRemoveWater,
}: CameraFirstDashboardProps) => {
  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-4">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-elevated"
      >
        {heroPhotoUrl ? (
          <img
            src={heroPhotoUrl}
            alt="Your most recent food photo"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="brand-surface absolute inset-0">
            <span className="absolute right-6 top-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-card/70 text-foreground">
              <Camera className="h-7 w-7" aria-hidden="true" />
            </span>
          </div>
        )}
        <div className="capture-scrim absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h1 className="text-2xl font-bold text-white">Snap what you ate</h1>
          <p className="mt-1 max-w-xs text-sm text-white/90">One photo is enough to get started.</p>
          <Button
            onClick={onSnap}
            className="press mt-4 h-12 rounded-xl px-5 shadow-elevated"
          >
            <Camera className="h-5 w-5" aria-hidden="true" />
            Log a photo
          </Button>
        </div>
      </motion.section>

      {/* One quiet secondary row — the photo action above stays the single primary action. */}
      <div className="flex items-center rounded-2xl border border-border bg-card p-1 shadow-card">
        <button
          onClick={() => onManual()}
          className="press flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-foreground"
        >
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> Search or log manually
        </button>
        <span className="h-6 w-px bg-border" aria-hidden="true" />
        <button
          onClick={onVoice}
          className="press flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-foreground"
        >
          <Mic className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> Log with Tell Nutrio
        </button>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.08 }}
        className="rounded-2xl border border-border bg-card p-5 shadow-elevated"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today</p>
            <h2 className="text-xl font-bold text-foreground">Daily energy</h2>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
            {caloriesConsumed} eaten
          </span>
        </div>
        <button onClick={onOpenIntake} className="press mx-auto block" aria-label="Open today's calorie details">
          <ProgressRing progress={calorieProgress} size={172} strokeWidth={13}>
            <div className="text-center">
              <p className="text-[32px] font-bold leading-none text-foreground">{caloriesRemaining}</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">kcal left</p>
              <p className="mt-1 text-xs text-muted-foreground">of {calorieTarget}</p>
            </div>
          </ProgressRing>
        </button>
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
          <MacroBar label="Protein" current={Math.round(protein)} target={proteinTarget} tone="primary" />
          <MacroBar label="Carbs" current={Math.round(carbs)} target={carbsTarget} tone="strong" />
          <MacroBar label="Fat" current={Math.round(fat)} target={fatTarget} tone="medium" />
          <MacroBar label="Fibre" current={Math.round(fibre)} target={fibreTarget} tone="soft" />
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.12 }}>
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Diary</p>
          <h2 className="text-xl font-bold text-foreground">Today&rsquo;s meals</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {MEALS.map((meal, index) => {
            const items = meals[meal.type] ?? [];
            const total = items.reduce((sum, food) => sum + food.calories, 0);
            const Icon = meal.icon;
            return (
              <motion.button
                key={meal.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.16 + index * 0.04 }}
                onClick={() => onManual(meal.type)}
                className="press min-h-36 rounded-2xl border border-border bg-card p-4 text-left shadow-card"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-foreground">{meal.label}</h3>
                {items.length ? (
                  <>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {items.map((item) => item.food_name).join(", ")}
                    </p>
                    <p className="mt-2 text-sm font-bold text-foreground">{total} kcal</p>
                  </>
                ) : (
                  <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Log this meal
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      <div className="grid grid-cols-2 gap-3">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
              <Droplets className="h-4 w-4 text-foreground" aria-hidden="true" />
            </span>
            <div className="flex gap-1">
              <button
                onClick={onRemoveWater}
                aria-label="Remove a glass of water"
                className="press flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                onClick={onAddWater}
                aria-label="Add a glass of water"
                className="press flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Water</p>
          <p className="text-xl font-bold text-foreground">
            {waterGlasses} <span className="text-xs font-medium text-muted-foreground">glasses</span>
          </p>
        </section>
        <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
            <Scale className="h-4 w-4 text-foreground" aria-hidden="true" />
          </span>
          <p className="mt-3 text-xs text-muted-foreground">Weight</p>
          <p className="text-xl font-bold text-foreground">
            {weight ?? "—"}{" "}
            <span className="text-xs font-medium text-muted-foreground">{weight ? "kg" : "Add weight"}</span>
          </p>
        </section>
      </div>
    </div>
  );
};
