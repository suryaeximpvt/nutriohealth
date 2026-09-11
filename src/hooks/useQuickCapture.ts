import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useFoodCaptures } from "./useFoodCaptures";
import { useCapturePreference } from "./useCapturePreference";
import { guessMealType, type MealType, type PortionSize, type SnapItem } from "@/lib/foodSnap";
import type { CaptureMethod, ParsedMeal } from "@/lib/capture";

const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Low-friction meal capture from a spoken or typed sentence. */
export const useQuickCapture = () => {
  const { user } = useAuth();
  const { saveCapture, refresh } = useFoodCaptures();
  const { markUsed } = useCapturePreference();
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  const parse = useCallback(
    async (text: string, mealType?: MealType): Promise<{ meal?: ParsedMeal; error?: string }> => {
      setParsing(true);
      try {
        const { data, error } = await supabase.functions.invoke("parse-meal-text", {
          body: { text, mealType },
        });
        if (error) return { error: "Nutrio couldn't read that just now." };
        if (data?.error) return { error: data.error as string };
        return { meal: data as ParsedMeal };
      } finally {
        setParsing(false);
      }
    },
    [],
  );

  const save = useCallback(
    async (meal: ParsedMeal, method: CaptureMethod, mealType?: MealType) => {
      if (!user) return { error: "Not signed in" };
      setSaving(true);
      try {
        const items: SnapItem[] = (meal.items ?? []).map((i, idx) => ({
          id: `${Date.now()}-${idx}`,
          name: i.name,
          portion_size: (i.portion_size ?? meal.portion_size ?? "medium") as PortionSize,
          calories: num(i.calories),
          protein: num(i.protein),
          carbs: num(i.carbs),
          fat: num(i.fat),
          fibre: num(i.fibre),
          origin: "ai",
          edited: false,
        }));

        const result = await saveCapture({
          file: null,
          mealType: (mealType ?? meal.meal_type ?? guessMealType()) as MealType,
          portionSize: (meal.portion_size ?? "medium") as PortionSize,
          items,
          detected: meal.items ?? [],
          locationContext: null,
          dayContext: null,
          edited: false,
          confidence: meal.confidence ?? null,
          source: "upload",
          captureMethod: method,
          estimated: true,
        });

        if (!result.error) {
          await markUsed(method);
          await refresh();
        }
        return result;
      } finally {
        setSaving(false);
      }
    },
    [user, saveCapture, markUsed, refresh],
  );

  return { parse, save, parsing, saving };
};
