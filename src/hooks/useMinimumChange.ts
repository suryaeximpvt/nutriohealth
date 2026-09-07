import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface FrictionItem {
  friction_type: string;
  score: number;
  level: string;
  evidence: Record<string, unknown> | null;
}

export interface MinimumChange {
  title: string;
  action: string;
  because: string;
  effort?: string;
  target_meal?: string;
  friction_addressed?: string;
}

/** The friction map plus the single smallest realistic change Nutrio suggests. */
export const useMinimumChange = () => {
  const { user } = useAuth();
  const [friction, setFriction] = useState<FrictionItem[]>([]);
  const [change, setChange] = useState<MinimumChange | null>(null);
  const [recommendationId, setRecommendationId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);

  const compute = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.functions.invoke("minimum-change-engine");
    setFriction((data?.friction ?? []) as FrictionItem[]);
    setChange((data?.change ?? null) as MinimumChange | null);
    setRecommendationId(data?.recommendationId ?? null);
    setAnswered(false);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [{ data: f }, { data: r }] = await Promise.all([
        supabase.from("food_friction").select("*").eq("user_id", user.id),
        supabase
          .from("recommendation_outcomes")
          .select("id,recommendation_content,tried")
          .eq("user_id", user.id)
          .eq("recommendation_type", "minimum_change")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      setFriction((f ?? []) as FrictionItem[]);
      if (r?.recommendation_content) {
        setChange(r.recommendation_content as unknown as MinimumChange);
        setRecommendationId(r.id);
        setAnswered(Boolean(r.tried));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const respond = useCallback(
    async (tried: "yes" | "no", failureReason?: string) => {
      setAnswered(true);
      if (!recommendationId) return;
      await supabase
        .from("recommendation_outcomes")
        .update({
          tried,
          successful: tried === "yes",
          failure_reason: failureReason ?? null,
          answered_at: new Date().toISOString(),
        })
        .eq("id", recommendationId);
    },
    [recommendationId],
  );

  return { friction, change, loading, compute, respond, answered };
};
