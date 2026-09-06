import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface NonNegotiableItem {
  id: string;
  label: string;
  category: string | null;
  frequency_type: string;
  target_count: number;
}

export interface NonNegotiableWithProgress extends NonNegotiableItem {
  weekCount: number;
  doneToday: boolean;
}

const iso = (d: Date) => d.toISOString().split("T")[0];

const startOfWeek = () => {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Monday start
  d.setDate(d.getDate() - day);
  return iso(d);
};

export const useNonNegotiables = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<NonNegotiableWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const today = iso(new Date());
    const [nnRes, progRes] = await Promise.all([
      supabase
        .from("non_negotiables")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("created_at"),
      supabase
        .from("non_negotiable_progress")
        .select("*")
        .eq("user_id", user.id)
        .gte("completed_on", startOfWeek()),
    ]);
    const progress = progRes.data ?? [];
    const list = ((nnRes.data ?? []) as unknown as NonNegotiableItem[]).map((n) => ({
      ...n,
      weekCount: progress.filter((p: any) => p.non_negotiable_id === n.id).length,
      doneToday: progress.some(
        (p: any) => p.non_negotiable_id === n.id && p.completed_on === today
      ),
    }));
    setItems(list);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchAll();
  }, [fetchAll]);

  const toggleToday = async (item: NonNegotiableWithProgress) => {
    if (!user) return;
    const today = iso(new Date());
    if (item.doneToday) {
      await supabase
        .from("non_negotiable_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("non_negotiable_id", item.id)
        .eq("completed_on", today);
    } else {
      await supabase.from("non_negotiable_progress").insert({
        user_id: user.id,
        non_negotiable_id: item.id,
        completed_on: today,
      } as never);
    }
    await fetchAll();
  };

  return { items, loading, toggleToday, refresh: fetchAll };
};
