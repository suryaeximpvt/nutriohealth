import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface RealityScore {
  overall_score: number;
  breakfast_score: number;
  lunch_score: number;
  dinner_score: number;
  snack_score: number;
  weekday_score: number;
  weekend_score: number;
  window_days: number;
}

export interface BehaviourPattern {
  pattern_type: string;
  pattern_key: string;
  label: string;
  detail: string | null;
  confidence: number | null;
  payload: Record<string, unknown> | null;
}

export interface TrackingProfile {
  days_tracked: number;
  days_with_capture: number;
  captures: number;
  edit_rate: number;
  most_captured_meal: string | null;
  least_captured_meal: string | null;
}

/** Computes and reads the picture Nutrio has of what the user actually eats. */
export const useFoodBehaviour = (auto = true) => {
  const { user } = useAuth();
  const [score, setScore] = useState<RealityScore | null>(null);
  const [patterns, setPatterns] = useState<BehaviourPattern[]>([]);
  const [tracking, setTracking] = useState<TrackingProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const analyse = useCallback(async () => {
    if (!user) return;
    try {
      // Make sure we send a valid, non-expired token (refreshes it if needed).
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const { data, error } = await supabase.functions.invoke("food-behaviour-engine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) return;
      if (data?.score) setScore(data.score as RealityScore);
      if (data?.patterns) setPatterns(data.patterns as BehaviourPattern[]);
      if (data?.tracking) setTracking(data.tracking as TrackingProfile);
    } catch {
      // Non-fatal: the dashboard keeps showing the last stored insights.
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from("food_reality_scores").select("*").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("food_behaviour_patterns")
          .select("*")
          .eq("user_id", user.id)
          .order("confidence", { ascending: false }),
      ]);
      if (cancelled) return;
      if (s) setScore(s as unknown as RealityScore);
      if (p) setPatterns(p as unknown as BehaviourPattern[]);
      setLoading(false);
      if (auto) void analyse();
    })();
    return () => {
      cancelled = true;
    };
  }, [user, auto, analyse]);

  return { score, patterns, tracking, loading, analyse };
};
