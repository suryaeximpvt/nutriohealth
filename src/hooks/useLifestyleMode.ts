import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LifestyleMode {
  id: string;
  mode_key: string;
  answers: Record<string, string> | null;
  starts_on: string;
  ends_on: string;
  status: string;
}

const iso = (d: Date) => d.toISOString().split("T")[0];

export const useLifestyleMode = () => {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<LifestyleMode | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActive = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const today = iso(new Date());
    const { data } = await supabase
      .from("lifestyle_modes")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .lte("starts_on", today)
      .gte("ends_on", today)
      .order("created_at", { ascending: false })
      .limit(1);
    setActiveMode((data?.[0] as unknown as LifestyleMode) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchActive();
  }, [fetchActive]);

  const startMode = async (
    modeKey: string,
    answers: Record<string, string>,
    startsOn: string,
    endsOn: string
  ) => {
    if (!user) return { error: "Not authenticated" };
    await supabase
      .from("lifestyle_modes")
      .update({ status: "ended" })
      .eq("user_id", user.id)
      .eq("status", "active");
    const { error } = await supabase.from("lifestyle_modes").insert({
      user_id: user.id,
      mode_key: modeKey,
      answers,
      starts_on: startsOn,
      ends_on: endsOn,
      status: "active",
    } as never);
    if (error) return { error: error.message };
    await fetchActive();
    return { error: null };
  };

  const endMode = async () => {
    if (!user || !activeMode) return { error: null };
    await supabase.from("lifestyle_modes").update({ status: "ended" }).eq("id", activeMode.id);
    await fetchActive();
    return { error: null };
  };

  return { activeMode, loading, startMode, endMode, refresh: fetchActive };
};
