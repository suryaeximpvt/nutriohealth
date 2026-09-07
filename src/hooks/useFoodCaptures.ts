import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { MealType, PortionSize, SnapItem } from "@/lib/foodSnap";

export interface FoodCapture {
  id: string;
  photo_path: string | null;
  meal_type: string;
  captured_at: string;
  capture_date: string;
  food_name: string | null;
  portion_size: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fibre: number | null;
  location_context: string | null;
  day_context: string | null;
  user_edited: boolean;
  detected_foods: unknown;
  confirmed_foods: unknown;
}

const iso = (d: Date) => d.toISOString().split("T")[0];

export interface SaveCaptureInput {
  file: Blob | null;
  mealType: MealType;
  portionSize: PortionSize;
  items: SnapItem[];
  detected: unknown;
  locationContext: string | null;
  dayContext: string | null;
  edited: boolean;
  confidence: number | null;
  source: "camera" | "upload" | "recent";
}

export const useFoodCaptures = (days = 14) => {
  const { user } = useAuth();
  const [captures, setCaptures] = useState<FoodCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCaptures([]);
      setLoading(false);
      return;
    }
    const since = new Date();
    since.setDate(since.getDate() - days);
    const { data } = await supabase
      .from("food_captures")
      .select("*")
      .eq("user_id", user.id)
      .gte("capture_date", iso(since))
      .order("captured_at", { ascending: false });
    setCaptures((data ?? []) as unknown as FoodCapture[]);
    setLoading(false);
  }, [user, days]);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  const saveCapture = useCallback(
    async (input: SaveCaptureInput) => {
      if (!user) return { error: "Not signed in" };
      setSaving(true);
      try {
        let photoPath: string | null = null;
        if (input.file) {
          const path = `${user.id}/${crypto.randomUUID()}.jpg`;
          const { error: upErr } = await supabase.storage
            .from("food-photos")
            .upload(path, input.file, { contentType: "image/jpeg", upsert: false });
          if (upErr) console.error("photo upload", upErr.message);
          else photoPath = path;
        }

        const kept = input.items;
        const total = (k: keyof SnapItem) =>
          kept.reduce((s, i) => s + Number(i[k] ?? 0), 0);

        const now = new Date();
        const { data: capture, error } = await supabase
          .from("food_captures")
          .insert({
            user_id: user.id,
            photo_path: photoPath,
            meal_type: input.mealType,
            captured_at: now.toISOString(),
            capture_date: iso(now),
            capture_time: now.toTimeString().slice(0, 8),
            day_of_week: now.getDay(),
            food_name: kept.map((i) => i.name).join(", ") || null,
            detected_foods: (input.detected ?? []) as never,
            confirmed_foods: kept as never,
            portion_size: input.portionSize,
            calories: Math.round(total("calories")),
            protein: Math.round(total("protein") * 10) / 10,
            carbs: Math.round(total("carbs") * 10) / 10,
            fat: Math.round(total("fat") * 10) / 10,
            fibre: Math.round(total("fibre") * 10) / 10,
            location_context: input.locationContext,
            day_context: input.dayContext,
            ai_confidence: input.confidence,
            user_confirmed: true,
            user_edited: input.edited,
            source: input.source,
          })
          .select()
          .single();

        if (error || !capture) return { error: error?.message ?? "Could not save" };

        if (kept.length) {
          await supabase.from("food_capture_items").insert(
            kept.map((i) => ({
              user_id: user.id,
              capture_id: capture.id,
              food_name: i.name,
              portion_size: i.portion_size,
              calories: Math.round(i.calories),
              protein: i.protein,
              carbs: i.carbs,
              fat: i.fat,
              fibre: i.fibre,
              origin: i.origin,
              edited_by_user: i.edited,
            })),
          );

          // Keep the existing daily totals in sync
          await supabase.from("food_logs").insert(
            kept.map((i) => ({
              user_id: user.id,
              meal_type: input.mealType === "snack" ? "snacks" : input.mealType,
              food_name: i.name,
              calories: Math.round(i.calories),
              protein: i.protein,
              carbs: i.carbs,
              fat: i.fat,
              fibre: i.fibre,
              quantity: 1,
              logged_at: iso(now),
            })),
          );
        }

        await refresh();
        return { error: null, id: capture.id as string };
      } finally {
        setSaving(false);
      }
    },
    [user, refresh],
  );

  const deleteCapture = useCallback(
    async (capture: FoodCapture) => {
      if (!user) return;
      if (capture.photo_path) {
        await supabase.storage.from("food-photos").remove([capture.photo_path]);
      }
      await supabase.from("food_captures").delete().eq("id", capture.id);
      await refresh();
    },
    [user, refresh],
  );

  const getPhotoUrl = useCallback(async (path: string | null) => {
    if (!path) return null;
    const { data } = await supabase.storage.from("food-photos").createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  }, []);

  const todays = captures.filter((c) => c.capture_date === iso(new Date()));

  return { captures, todays, loading, saving, saveCapture, deleteCapture, getPhotoUrl, refresh };
};
