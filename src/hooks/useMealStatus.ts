import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type MealStatusValue =
  | "planned"
  | "reminder_sent"
  | "logged"
  | "skipped"
  | "delayed"
  | "not_applicable";

export interface MealStatusRow {
  id: string;
  meal_type: string;
  status: MealStatusValue;
  status_date: string;
  note: string | null;
}

const iso = (d: Date) => d.toISOString().split("T")[0];

export const useMealStatus = () => {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<Record<string, MealStatusValue>>({});
  const [loading, setLoading] = useState(true);

  const fetchToday = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("meal_status")
      .select("*")
      .eq("user_id", user.id)
      .eq("status_date", iso(new Date()));
    const map: Record<string, MealStatusValue> = {};
    ((data ?? []) as unknown as MealStatusRow[]).forEach((r) => {
      map[r.meal_type] = r.status;
    });
    setStatuses(map);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchToday();
  }, [fetchToday]);

  const setStatus = async (mealType: string, status: MealStatusValue, note?: string) => {
    if (!user) return { error: "Not signed in" };
    setStatuses((s) => ({ ...s, [mealType]: status }));
    const { error } = await supabase.from("meal_status").upsert(
      {
        user_id: user.id,
        meal_type: mealType,
        status,
        status_date: iso(new Date()),
        responded_at: new Date().toISOString(),
        note: note ?? null,
      } as never,
      { onConflict: "user_id,meal_type,status_date" }
    );
    if (error) return { error: error.message };
    await fetchToday();
    return { error: null };
  };

  return { statuses, loading, setStatus, refresh: fetchToday };
};
