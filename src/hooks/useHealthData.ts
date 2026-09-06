import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type HealthProvider = "apple_health" | "whoop";

export interface HealthConnection {
  id: string;
  provider: HealthProvider;
  connected: boolean;
  last_synced_at: string | null;
}

export interface HealthMetric {
  id: string;
  source: string;
  metric_date: string;
  steps: number | null;
  active_calories: number | null;
  resting_heart_rate: number | null;
  hrv_ms: number | null;
  sleep_hours: number | null;
  recovery_score: number | null;
  strain: number | null;
}

export type MetricInput = Partial<
  Pick<
    HealthMetric,
    | "steps"
    | "active_calories"
    | "resting_heart_rate"
    | "hrv_ms"
    | "sleep_hours"
    | "recovery_score"
    | "strain"
  >
>;

const today = () => new Date().toISOString().split("T")[0];

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

export const useHealthData = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<HealthConnection[]>([]);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const [c, m] = await Promise.all([
      supabase.from("health_connections").select("*").eq("user_id", user.id),
      supabase
        .from("health_metrics")
        .select("*")
        .eq("user_id", user.id)
        .gte("metric_date", daysAgo(6))
        .order("metric_date", { ascending: false }),
    ]);
    setConnections((c.data as unknown as HealthConnection[]) ?? []);
    setMetrics((m.data as unknown as HealthMetric[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchAll();
  }, [fetchAll]);

  const isConnected = (provider: HealthProvider) =>
    connections.some((c) => c.provider === provider && c.connected);

  const lastSynced = (provider: HealthProvider) =>
    connections.find((c) => c.provider === provider)?.last_synced_at ?? null;

  const setConnected = async (provider: HealthProvider, connected: boolean) => {
    if (!user) return { error: "Not authenticated" };
    const { error } = await supabase.from("health_connections").upsert(
      {
        user_id: user.id,
        provider,
        connected,
        last_synced_at: connected ? new Date().toISOString() : null,
      } as never,
      { onConflict: "user_id,provider" }
    );
    if (error) return { error: error.message };
    await fetchAll();
    return { error: null };
  };

  const saveMetrics = async (
    source: HealthProvider,
    values: MetricInput,
    date = today()
  ) => {
    if (!user) return { error: "Not authenticated" };
    const { error } = await supabase.from("health_metrics").upsert(
      {
        user_id: user.id,
        source,
        metric_date: date,
        ...values,
      } as never,
      { onConflict: "user_id,source,metric_date" }
    );
    if (error) return { error: error.message };
    await supabase
      .from("health_connections")
      .update({ last_synced_at: new Date().toISOString() } as never)
      .eq("user_id", user.id)
      .eq("provider", source);
    await fetchAll();
    return { error: null };
  };

  const todayFor = (provider: HealthProvider) =>
    metrics.find((m) => m.source === provider && m.metric_date === today()) ?? null;

  const weekFor = (provider: HealthProvider) =>
    metrics.filter((m) => m.source === provider).slice().reverse();

  return {
    connections,
    metrics,
    loading,
    isConnected,
    lastSynced,
    setConnected,
    saveMetrics,
    todayFor,
    weekFor,
    refresh: fetchAll,
  };
};
