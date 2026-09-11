import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { FoodCapture } from "./useFoodCaptures";
import type { MealType } from "@/lib/foodSnap";

type Meal = Exclude<MealType, "snack">;

const FALLBACK: Record<Meal, number> = { breakfast: 8.5, lunch: 13, dinner: 19 };
/** How long after their usual time Nutrio waits before asking. */
const GRACE_HOURS = 1.5;

const toHours = (t: string | null | undefined) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  return h + (m || 0) / 60;
};

/**
 * Learns roughly when this person eats each meal, from their own history
 * (captures first, routine schedule as a backup).
 */
export const useMealTiming = (captures: FoodCapture[]) => {
  const { user } = useAuth();
  const [routine, setRoutine] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("routine_schedule")
        .select("breakfast_time,lunch_time,dinner_time")
        .eq("user_id", user.id)
        .maybeSingle();
      setRoutine((data ?? {}) as Record<string, string | null>);
    })();
  }, [user]);

  const usualTimes = useMemo(() => {
    const out = {} as Record<Meal, number>;
    (Object.keys(FALLBACK) as Meal[]).forEach((meal) => {
      const hours = captures
        .filter((c) => c.meal_type === meal)
        .map((c) => {
          const d = new Date(c.captured_at);
          return d.getHours() + d.getMinutes() / 60;
        });
      if (hours.length >= 3) {
        const sorted = [...hours].sort((a, b) => a - b);
        out[meal] = sorted[Math.floor(sorted.length / 2)];
      } else {
        out[meal] = toHours(routine[`${meal}_time`]) ?? FALLBACK[meal];
      }
    });
    return out;
  }, [captures, routine]);

  /** Meals whose usual time has passed today with nothing logged. */
  const overdueMeals = useMemo(() => {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    const today = now.toISOString().split("T")[0];
    return (Object.keys(usualTimes) as Meal[]).filter((meal) => {
      if (hour < usualTimes[meal] + GRACE_HOURS) return false;
      return !captures.some((c) => c.capture_date === today && c.meal_type === meal);
    });
  }, [usualTimes, captures]);

  const formatTime = (meal: Meal) => {
    const v = usualTimes[meal];
    const h = Math.floor(v);
    const m = Math.round((v - h) * 60);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
  };

  return { usualTimes, overdueMeals, formatTime };
};
