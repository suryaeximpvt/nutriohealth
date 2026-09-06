import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PantryMeal {
  name: string;
  description: string;
  usesIngredients: string[];
  missingItems: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  fitNote: string;
  emoji: string;
}

export interface PantryContext {
  ingredients: string[];
  caloriesRemaining: number;
  calorieTarget: number;
  proteinGap: number;
  dietPreference: string;
  cuisinePreference: string;
  allergies: string[];
  excludedFoods: string[];
  goal: string;
}

export const usePantrySuggestions = () => {
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<PantryMeal[] | null>(null);

  const getPantryMeals = async (context: PantryContext) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-pantry-suggestions", {
        body: context,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const result = (data?.meals ?? []) as PantryMeal[];
      setMeals(result);
      return result;
    } catch (error: any) {
      console.error("Pantry suggestions error:", error);
      toast.error(error.message?.includes("Rate limit")
        ? "Too many requests — please wait a moment."
        : "Couldn't get suggestions. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setMeals(null);

  return { loading, meals, getPantryMeals, reset };
};
