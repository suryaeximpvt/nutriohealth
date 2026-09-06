import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface WeeklyInsight {
  status: string;
  headline: string;
  trend: string;
  goal_alignment: string;
  protein: string;
  meal_consistency: string;
  achievement: string;
  focus: string;
  strategy: string;
}

export interface WeeklySummary {
  week_start: string;
  avg_calories: number | null;
  calorie_target: number | null;
  avg_protein: number | null;
  protein_target: number | null;
  days_logged: number | null;
  meals_logged: number | null;
  workouts_logged: number | null;
  weight_change_kg: number | null;
  status: string | null;
  insight: WeeklyInsight | null;
}

const iso = (d: Date) => d.toISOString().split("T")[0];

const currentWeekStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return iso(d);
};

export const useWeeklyInsight = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return null;
    }
    const { data } = await supabase
      .from("weekly_nutrition_summary")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", currentWeekStart())
      .maybeSingle();
    setSummary((data as unknown as WeeklySummary) ?? null);
    setLoading(false);
    return (data as unknown as WeeklySummary) ?? null;
  }, [user]);

  const generate = useCallback(async () => {
    if (!user) return;
    setGenerating(true);
    const { data, error } = await supabase.functions.invoke("weekly-insight");
    setGenerating(false);
    if (error) {
      console.error("weekly-insight error", error);
      return;
    }
    if (data?.summary) setSummary(data.summary as WeeklySummary);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSummary().then((existing) => {
      if (!cancelled && !existing && user) generate();
    });
    return () => {
      cancelled = true;
    };
  }, [fetchSummary, generate, user]);

  return { summary, loading, generating, generate, refresh: fetchSummary };
};
