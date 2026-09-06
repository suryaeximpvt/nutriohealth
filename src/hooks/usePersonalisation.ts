import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Personalisation {
  id: string;
  user_id: string;
  display_name: string | null;
  age_range: string | null;
  gender: string | null;
  country: string | null;
  residence_country: string | null;
  food_cultures: string[] | null;
  comfort_foods: string[] | null;
  favourite_foods: string[] | null;
  disliked_foods: string[] | null;
  avoided_foods: string[] | null;
  cultural_food_frequency: string | null;
  primary_goal: string | null;
  secondary_goal: string | null;
  goal_importance: number | null;
  success_definition: string[] | null;
  goal_weight_kg: number | null;
  workout_frequency: string | null;
  workout_types: string[] | null;
  workout_time: string | null;
  daily_steps: number | null;
  cooking_frequency: string | null;
  cooking_time: string | null;
  eating_location: string | null;
  eating_out_frequency: string | null;
  protein_sources: string[] | null;
  protein_confidence: number | null;
  wants_protein_help: boolean | null;
  challenges: string[] | null;
  off_routine_times: string[] | null;
  support_style: string | null;
  insight_frequency: string | null;
  onboarding_completed: boolean | null;
}

export interface RoutineSchedule {
  id: string;
  user_id: string;
  wake_time: string | null;
  sleep_time: string | null;
  breakfast_time: string | null;
  lunch_time: string | null;
  dinner_time: string | null;
  snack_times: string[] | null;
  workout_time: string | null;
  meals_eaten: string[] | null;
  timing_variability: string | null;
}

export interface NonNegotiable {
  id: string;
  label: string;
  category: string;
  frequency_type: string;
  target_count: number;
  active: boolean;
}

export const usePersonalisation = () => {
  const { user } = useAuth();
  const [personalisation, setPersonalisation] = useState<Personalisation | null>(null);
  const [routine, setRoutine] = useState<RoutineSchedule | null>(null);
  const [nonNegotiables, setNonNegotiables] = useState<NonNegotiable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const [p, r, n] = await Promise.all([
      supabase.from("user_personalisation").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("routine_schedule").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("non_negotiables").select("*").eq("user_id", user.id).eq("active", true).order("created_at"),
    ]);
    setPersonalisation((p.data as Personalisation) ?? null);
    setRoutine((r.data as RoutineSchedule) ?? null);
    setNonNegotiables((n.data as NonNegotiable[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchAll();
  }, [fetchAll]);

  const savePersonalisation = async (values: Partial<Personalisation>) => {
    if (!user) return { error: "Not authenticated" };
    const { error } = await supabase
      .from("user_personalisation")
      .upsert({ user_id: user.id, ...values } as never, { onConflict: "user_id" });
    if (error) return { error: error.message };
    await fetchAll();
    return { error: null };
  };

  const saveRoutine = async (values: Partial<RoutineSchedule>) => {
    if (!user) return { error: "Not authenticated" };
    const { error } = await supabase
      .from("routine_schedule")
      .upsert({ user_id: user.id, ...values } as never, { onConflict: "user_id" });
    if (error) return { error: error.message };
    await fetchAll();
    return { error: null };
  };

  const replaceNonNegotiables = async (
    items: { label: string; frequency_type: string; target_count: number; category?: string }[]
  ) => {
    if (!user) return { error: "Not authenticated" };
    await supabase.from("non_negotiables").update({ active: false }).eq("user_id", user.id);
    if (items.length > 0) {
      const { error } = await supabase.from("non_negotiables").insert(
        items.map((i) => ({
          user_id: user.id,
          label: i.label,
          category: i.category ?? "food",
          frequency_type: i.frequency_type,
          target_count: i.target_count,
          active: true,
        }))
      );
      if (error) return { error: error.message };
    }
    await fetchAll();
    return { error: null };
  };

  return {
    personalisation,
    routine,
    nonNegotiables,
    loading,
    savePersonalisation,
    saveRoutine,
    replaceNonNegotiables,
    refresh: fetchAll,
  };
};
