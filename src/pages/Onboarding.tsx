import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Loader2, X, Check } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { usePersonalisation } from "@/hooks/usePersonalisation";
import { useAuth } from "@/hooks/useAuth";
import { NutrioLogo } from "@/components/NutrioLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ONBOARDING_STEPS,
  CULTURE_FOODS,
  FREQUENCY_OPTIONS,
  type StepField,
  type Option,
} from "@/lib/onboardingConfig";

type Values = Record<string, any>;

const FREQ_TO_COUNT: Record<string, number> = {
  daily: 7,
  "5_per_week": 5,
  "3_per_week": 3,
  weekly: 1,
};

const GOAL_TO_PROFILE: Record<string, string> = {
  lose_weight: "fat_loss",
  maintain_weight: "maintenance",
  gain_muscle: "muscle_gain",
  lose_weight_gain_muscle: "muscle_gain",
  eat_healthier: "maintenance",
  increase_protein: "muscle_gain",
  improve_energy: "endurance",
  improve_routine: "maintenance",
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProfile } = useUserData();
  const { savePersonalisation, saveRoutine, replaceNonNegotiables } = usePersonalisation();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Values>({
    goal_importance: 3,
    protein_confidence: 3,
    wants_protein_help: true,
    notifications_enabled: true,
    support_style: "regular",
    insight_frequency: "weekly",
    meals_eaten: ["breakfast", "lunch", "dinner"],
    timing_variability: "sometimes",
    nn_frequency: {} as Record<string, string>,
  });

  const current = ONBOARDING_STEPS[step];
  const total = ONBOARDING_STEPS.length;

  const set = (key: string, value: any) => setValues((v) => ({ ...v, [key]: value }));

  const toggleMulti = (key: string, value: string, max?: number) => {
    const list: string[] = values[key] ?? [];
    if (list.includes(value)) {
      set(key, list.filter((v) => v !== value));
    } else {
      if (max && list.length >= max) return;
      set(key, [...list, value]);
    }
  };

  // Comfort foods depend on the cultures chosen earlier
  const comfortOptions: Option[] = useMemo(() => {
    const cultures: string[] = values.food_cultures ?? [];
    const picked = cultures.length > 0 ? cultures : ["other"];
    const seen = new Set<string>();
    const out: Option[] = [];
    picked.forEach((c) => {
      (CULTURE_FOODS[c] ?? []).forEach((o) => {
        if (!seen.has(o.value)) {
          seen.add(o.value);
          out.push(o);
        }
      });
    });
    return out.length > 0 ? out : CULTURE_FOODS.other;
  }, [values.food_cultures]);

  const canProceed = () =>
    (current.required ?? []).every((k) => {
      const v = values[k];
      return Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== "";
    });

  const handleNext = () => {
    if (step < total - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleComplete();
    }
  };

  const handleBack = () => step > 0 && setStep(step - 1);

  const calculateTargets = () => {
    const w = parseFloat(values.weight_kg) || 70;
    const h = parseFloat(values.height_cm) || 170;
    const ageMap: Record<string, number> = { "18-24": 21, "25-34": 30, "35-44": 40, "45-54": 50, "55-64": 60, "65+": 68 };
    const a = ageMap[values.age_range] ?? 32;
    const bmr =
      values.gender === "male" ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    let tdee = bmr * (multipliers[values.activity_level] ?? 1.55);
    const goal = values.primary_goal;
    if (goal === "lose_weight") tdee -= 500;
    if (goal === "lose_weight_gain_muscle") tdee -= 250;
    if (goal === "gain_muscle") tdee += 300;
    if (goal === "improve_energy") tdee += 150;

    const calorieTarget = Math.round(tdee);
    const proteinTarget = Math.round(w * (goal === "gain_muscle" || goal === "increase_protein" || goal === "lose_weight_gain_muscle" ? 2 : 1.6));
    const fatTarget = Math.round((calorieTarget * 0.25) / 9);
    const carbsTarget = Math.round((calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4);
    return { calorieTarget, proteinTarget, carbsTarget, fatTarget, age: a };
  };

  const handleComplete = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    setSaving(true);
    const t = calculateTargets();

    const profileResult = await updateProfile({
      full_name: values.display_name || undefined,
      goal: GOAL_TO_PROFILE[values.primary_goal] ?? "maintenance",
      gender: values.gender || undefined,
      age: t.age,
      height_cm: parseInt(values.height_cm) || undefined,
      weight_kg: parseFloat(values.weight_kg) || undefined,
      activity_level: values.activity_level || "moderate",
      excluded_foods: (values.avoided_foods ?? []).length > 0 ? values.avoided_foods : null,
      allergies: (values.disliked_foods ?? []).length > 0 ? values.disliked_foods : null,
      calorie_target: t.calorieTarget,
      protein_target: t.proteinTarget,
      carbs_target: t.carbsTarget,
      fat_target: t.fatTarget,
    });

    const personalResult = await savePersonalisation({
      display_name: values.display_name || null,
      age_range: values.age_range || null,
      gender: values.gender || null,
      residence_country: values.residence_country || null,
      food_cultures: values.food_cultures ?? [],
      comfort_foods: values.comfort_foods ?? [],
      favourite_foods: values.favourite_foods ?? [],
      disliked_foods: values.disliked_foods ?? [],
      avoided_foods: values.avoided_foods ?? [],
      cultural_food_frequency: values.cultural_food_frequency || null,
      primary_goal: values.primary_goal || null,
      goal_importance: values.goal_importance ?? 3,
      success_definition: values.success_definition ?? [],
      goal_weight_kg: values.goal_weight_kg ? parseFloat(values.goal_weight_kg) : null,
      workout_frequency: values.workout_frequency || null,
      workout_types: values.workout_types ?? [],
      workout_time: values.workout_time || null,
      cooking_frequency: values.cooking_frequency || null,
      cooking_time: values.cooking_time || null,
      eating_location: Array.isArray(values.eating_location)
        ? values.eating_location.join(", ") || null
        : values.eating_location || null,
      eating_out_frequency: values.eating_out_frequency || null,
      protein_sources: values.protein_sources ?? [],
      protein_confidence: values.protein_confidence ?? 3,
      wants_protein_help: !!values.wants_protein_help,
      challenges: values.challenges ?? [],
      off_routine_times: values.off_routine_times ?? [],
      support_style: values.support_style || "regular",
      insight_frequency: values.insight_frequency || "weekly",
      onboarding_completed: true,
    });

    await saveRoutine({
      wake_time: values.wake_time || null,
      sleep_time: values.sleep_time || null,
      breakfast_time: values.breakfast_time || null,
      lunch_time: values.lunch_time || null,
      dinner_time: values.dinner_time || null,
      workout_time: values.workout_time || null,
      meals_eaten: values.meals_eaten ?? ["breakfast", "lunch", "dinner"],
      timing_variability: values.timing_variability || "sometimes",
    });

    const chosen: string[] = values.non_negotiables ?? [];
    await replaceNonNegotiables(
      chosen.map((label) => {
        const freq = values.nn_frequency?.[label] ?? "daily";
        return {
          label,
          frequency_type: freq,
          target_count: FREQ_TO_COUNT[freq] ?? 7,
          category: label === "Exercise" ? "activity" : label === "Water goal" ? "hydration" : "food",
        };
      })
    );

    await supabase.from("notification_preferences").upsert(
      {
        user_id: user.id,
        enabled: !!values.notifications_enabled,
        intensity: values.support_style || "regular",
        max_per_day: values.support_style === "gentle" ? 3 : values.support_style === "strong" ? 8 : 6,
      } as never,
      { onConflict: "user_id" }
    );

    setSaving(false);

    if (profileResult.error || personalResult.error) {
      toast.error("We couldn't save everything. Please try again.");
      return;
    }
    toast.success(`Welcome${values.display_name ? `, ${values.display_name}` : ""}! Nutrio is set up for you.`);
    navigate("/");
  };

  const renderField = (field: StepField) => {
    switch (field.kind) {
      case "text":
        return (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              value={values[field.key] ?? ""}
              placeholder={field.placeholder}
              onChange={(e) => set(field.key, e.target.value)}
              className="text-base h-14 rounded-xl bg-card shadow-card border-border/70"
            />
          </div>
        );
      case "number":
        return (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={values[field.key] ?? ""}
              placeholder={field.placeholder}
              onChange={(e) => set(field.key, e.target.value)}
              className="text-base h-14 rounded-xl bg-card shadow-card border-border/70"
            />
          </div>
        );
      case "time":
        return (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              type="time"
              value={values[field.key] ?? ""}
              onChange={(e) => set(field.key, e.target.value)}
              className="text-base h-14 rounded-xl bg-card shadow-card border-border/70"
            />
          </div>
        );
      case "toggle":
        return (
          <div key={field.key} className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-card">
            <div className="pr-4">
              <p className="font-semibold text-foreground">{field.label}</p>
              {field.desc && <p className="text-sm text-muted-foreground">{field.desc}</p>}
            </div>
            <Switch checked={!!values[field.key]} onCheckedChange={(c) => set(field.key, c)} />
          </div>
        );
      case "scale":
        return (
          <div key={field.key} className="space-y-3">
            <Label>{field.label}</Label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set(field.key, n)}
                  className={`h-12 rounded-xl border-2 font-semibold transition-all ${
                    values[field.key] === n
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{field.minLabel}</span>
              <span>{field.maxLabel}</span>
            </div>
          </div>
        );
      case "tags": {
        const list: string[] = values[field.key] ?? [];
        return (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              placeholder={field.placeholder}
              className="text-base h-12 rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val && !list.includes(val)) set(field.key, [...list, val]);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
            {list.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {list.map((tag) => (
                  <Badge key={tag} variant="secondary" className="pl-3 pr-1 py-1.5 rounded-full text-sm">
                    {tag}
                    <button
                      type="button"
                      onClick={() => set(field.key, list.filter((t) => t !== tag))}
                      className="ml-1 rounded-full p-0.5 hover:bg-background/60"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      }
      case "single":
      case "multi": {
        const options =
          field.kind === "multi" && field.key === "comfort_foods" ? comfortOptions : field.options;
        const isMulti = field.kind === "multi";
        const selected: string[] = isMulti ? values[field.key] ?? [] : [];
        const cols = field.columns ?? 1;
        return (
          <div key={field.key} className="space-y-3">
            {field.label && <Label>{field.label}</Label>}
            <div className={`grid gap-2 ${cols === 3 ? "grid-cols-3" : cols === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
              {options.map((option) => {
                const active = isMulti ? selected.includes(option.value) : values[field.key] === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      isMulti
                        ? toggleMulti(field.key, option.value, (field as any).max)
                        : set(field.key, option.value)
                    }
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                      active ? "border-primary bg-primary/10 shadow-elevated" : "border-border/70 bg-card shadow-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {option.emoji && <span className="text-xl">{option.emoji}</span>}
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm leading-tight">{option.label}</p>
                        {option.desc && <p className="text-xs text-muted-foreground mt-0.5">{option.desc}</p>}
                      </div>
                    </div>
                    {active && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
            {isMulti && (field as any).max && (
              <p className="text-xs text-muted-foreground">Choose up to {(field as any).max}</p>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  const selectedNonNegotiables: string[] = values.non_negotiables ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/60">
        <div className="container max-w-lg mx-auto px-4 pt-3 pb-3">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={handleBack} disabled={step === 0} aria-label="Go back" className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center disabled:opacity-0">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <NutrioLogo className="h-9 w-auto" />
            <span className="w-10 text-right text-xs font-semibold text-muted-foreground">{step + 1}/{total}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{ width: `${((step + 1) / total) * 100}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 container max-w-lg mx-auto px-4 pt-5 pb-28 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="flex-1 flex flex-col"
          >
            {/* Question-specific illustration */}
            <div className="relative rounded-2xl bg-primary/5 border border-border/60 overflow-hidden mb-6 aspect-[16/9] shadow-soft">
              <img
                src={current.image}
                alt={current.imageAlt}
                width={768}
                height={512}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {current.section}
            </p>
            <h1 className="text-3xl font-bold text-foreground mt-1 leading-tight">{current.title}</h1>
            {current.subtitle && <p className="text-muted-foreground mt-1.5">{current.subtitle}</p>}

            <div className="space-y-6 mt-7">
              {current.fields.map(renderField)}

              {/* Frequency picker for each chosen non-negotiable */}
              {current.id === "non_negotiables" && selectedNonNegotiables.length > 0 && (
                <div className="space-y-3">
                  <Label>How often would you like each one?</Label>
                  {selectedNonNegotiables.map((label) => (
                    <div key={label} className="rounded-2xl border border-border p-3">
                      <p className="font-semibold text-foreground text-sm mb-2">{label}</p>
                      <div className="grid grid-cols-4 gap-2">
                        {FREQUENCY_OPTIONS.map((f) => {
                          const active = (values.nn_frequency?.[label] ?? "daily") === f.value;
                          return (
                            <button
                              key={f.value}
                              type="button"
                              onClick={() =>
                                set("nn_frequency", { ...(values.nn_frequency ?? {}), [label]: f.value })
                              }
                              className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                                active
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground"
                              }`}
                            >
                              {f.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-md">
          <div className="container max-w-lg mx-auto px-4 py-3 flex gap-3">
          {current.optional && step < total - 1 && (
            <Button variant="ghost" onClick={handleNext} className="h-12 rounded-xl px-4 text-muted-foreground">
              Skip
            </Button>
          )}
          <Button onClick={handleNext} disabled={!canProceed() || saving} className="flex-[2] h-12 rounded-xl shadow-card">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up…
              </>
            ) : step === total - 1 ? (
              "Finish setup"
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
