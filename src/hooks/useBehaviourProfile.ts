import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface BehaviourProfile {
  recommendation_acceptance_rate: number;
  recommendation_follow_rate: number;
  meal_logging_consistency: number;
  protein_target_consistency: number;
  calorie_target_consistency: number;
  routine_consistency: number;
  preferred_recommendation_type: string | null;
  preferred_food_types: string[];
  rejected_food_types: string[];
  common_rejection_reasons: string[];
  lifestyle_mode_usage: Record<string, number>;
  weekly_behaviour: Record<string, unknown>;
}

export interface BehaviourContext {
  today: Record<string, number | string>;
  targets: { calories: number; protein: number };
  week: Record<string, number | string>;
  mode: string | null;
  ranking: { boost: string[]; avoid: string[] };
  nonNegotiables: string;
  weightTrend: string;
}

export const useBehaviourProfile = (autoAnalyse = false) => {
  const { user } = useAuth();
  const [behaviour, setBehaviour] = useState<BehaviourProfile | null>(null);
  const [context, setContext] = useState<BehaviourContext | null>(null);
  const [loading, setLoading] = useState(true);

  const analyse = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.functions.invoke("behaviour-analysis");
    if (data?.behaviour) setBehaviour(data.behaviour as BehaviourProfile);
    if (data?.context) setContext(data.context as BehaviourContext);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_behaviour_profile")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) {
        if (data) setBehaviour(data as unknown as BehaviourProfile);
        setLoading(false);
      }
      if (!cancelled && (autoAnalyse || !data)) void analyse();
    })();
    return () => {
      cancelled = true;
    };
  }, [user, analyse, autoAnalyse]);

  return { behaviour, context, loading, analyse };
};
