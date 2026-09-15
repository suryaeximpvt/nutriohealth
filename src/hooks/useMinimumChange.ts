import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useHealthConsent } from "./useConsent";

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

/** The friction map plus the single smallest realistic change Vellyn suggests. */
export const useMinimumChange = () => {
  const { user } = useAuth();
  // Friction and smallest-change analysis uses health-adjacent data.
  const { healthConsentGranted } = useHealthConsent();
  const [friction, setFriction] = useState<FrictionItem[]>([]);
  const [change, setChange] = useState<MinimumChange | null>(null);
  const [recommendationId, setRecommendationId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsMoreData, setNeedsMoreData] = useState(false);
  const autoRan = useRef(false);

  const compute = useCallback(async () => {
    if (!user || !healthConsentGranted) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("minimum-change-engine");
      if (invokeError) {
        setError("Vellyn couldn't work that out just now. Try again in a moment.");
        return;
      }
      const next = (data?.change ?? null) as MinimumChange | null;
      setFriction((data?.friction ?? []) as FrictionItem[]);
      setChange(next);
      setRecommendationId(data?.recommendationId ?? null);
      setNeedsMoreData(!next);
      setAnswered(false);
    } catch {
      setError("Vellyn couldn't work that out just now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, [user, healthConsentGranted]);

  useEffect(() => {
    if (!user || !healthConsentGranted) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
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
        setLoading(false);
        return;
      }
      // Nothing stored yet: work one out straight away rather than sitting empty.
      if (!autoRan.current) {
        autoRan.current = true;
        await compute();
        return;
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, compute]);

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

  return { friction, change, loading, error, needsMoreData, compute, respond, answered };
};
