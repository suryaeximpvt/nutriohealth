import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Recommendation {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  valid_for: string;
  dismissed: boolean | null;
}

const today = () => new Date().toISOString().split("T")[0];

export const usePersonalisedRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!user) return;
    setGenerating(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("personalised-recommendations");
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      if (Array.isArray(data?.recommendations)) {
        setRecommendations(data.recommendations as Recommendation[]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not refresh your recommendations.");
    } finally {
      setGenerating(false);
    }
  }, [user]);

  const load = useCallback(async () => {
    if (!user) {
      setRecommendations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("personalised_recommendations")
      .select("id,kind,title,body,valid_for,dismissed")
      .eq("user_id", user.id)
      .eq("valid_for", today())
      .order("created_at", { ascending: true });

    const rows = (data ?? []) as Recommendation[];
    setRecommendations(rows);
    setLoading(false);
    if (rows.length === 0) void generate();
  }, [user, generate]);

  useEffect(() => {
    void load();
  }, [load]);

  const dismiss = useCallback(
    async (id: string) => {
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
      await supabase.from("personalised_recommendations").update({ dismissed: true }).eq("id", id);
    },
    [],
  );

  const sendFeedback = useCallback(
    async (rec: Recommendation, sentiment: "positive" | "negative") => {
      if (!user) return;
      await supabase.from("user_feedback").insert({
        user_id: user.id,
        context: `recommendation:${rec.kind}`,
        reference_id: rec.id,
        sentiment,
        message: rec.title,
      });
    },
    [user],
  );

  return {
    recommendations: recommendations.filter((r) => !r.dismissed),
    loading,
    generating,
    error,
    generate,
    dismiss,
    sendFeedback,
    refresh: load,
  };
};
