import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MealOption {
  name: string;
  description: string;
  calories: number;
  isNutrio?: boolean;
}

interface AIResponse {
  explanation: string;
  options: MealOption[];
  followUpQuestion: string;
}

interface UserProfile {
  calorie_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  activity_level: string;
  diet_preference: string;
  allergies: string[] | null;
  excluded_foods: string[] | null;
  goal: string;
}

export const useAIMeals = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);

  const getMealSuggestions = async (
    mealType: "breakfast" | "lunch" | "snacks" | "dinner",
    userProfile: UserProfile | null,
    caloriesRemaining: number,
    todaysMeals?: { meal_type: string; food_name: string; calories: number }[]
  ) => {
    setLoading(true);
    setResponse(null);

    try {
      const profile = userProfile || {
        calorie_target: 2000,
        protein_target: 120,
        carbs_target: 250,
        fat_target: 65,
        activity_level: "moderate",
        diet_preference: "none",
        allergies: [],
        excluded_foods: [],
        goal: "maintain",
      };

      const { data, error } = await supabase.functions.invoke("ai-meal-suggestions", {
        body: {
          mealType,
          userProfile: profile,
          caloriesRemaining,
          todaysMeals,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResponse(data as AIResponse);
      return data as AIResponse;
    } catch (error: any) {
      console.error("AI meal suggestions error:", error);
      
      if (error.message?.includes("Rate limit")) {
        toast.error("Please wait a moment before requesting more suggestions.");
      } else if (error.message?.includes("credits")) {
        toast.error("AI features temporarily unavailable. Try again later.");
      } else {
        toast.error("Couldn't get suggestions. Using default options.");
      }

      // Return fallback suggestions
      const fallback: AIResponse = {
        explanation: "Here are some balanced options for your meal.",
        options: getFallbackOptions(mealType),
        followUpQuestion: "What time do you usually have this meal?",
      };
      setResponse(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  return { loading, response, getMealSuggestions };
};

function getFallbackOptions(mealType: string): MealOption[] {
  const fallbacks: Record<string, MealOption[]> = {
    breakfast: [
      { name: "Porridge with berries", description: "Warming and filling start to the day.", calories: 320, isNutrio: false },
      { name: "Scrambled eggs on toast", description: "Classic protein-rich breakfast.", calories: 380, isNutrio: false },
      { name: "Greek yogurt with granola", description: "Quick and nutritious option.", calories: 280, isNutrio: false },
    ],
    lunch: [
      { name: "Tuna jacket potato", description: "Filling British classic.", calories: 450, isNutrio: false },
      { name: "Chicken salad wrap", description: "Light but satisfying.", calories: 420, isNutrio: false },
      { name: "Soup and sandwich", description: "Warming combo for a busy day.", calories: 480, isNutrio: false },
    ],
    snacks: [
      { name: "Apple with almond butter", description: "Fibre and healthy fats.", calories: 200, isNutrio: false },
      { name: "Greek yogurt pot", description: "High protein, low sugar.", calories: 120, isNutrio: false },
      { name: "Handful of nuts", description: "Energy-boosting snack.", calories: 180, isNutrio: false },
    ],
    dinner: [
      { name: "Grilled salmon with veg", description: "Omega-3 rich and satisfying.", calories: 520, isNutrio: false },
      { name: "Chicken stir-fry", description: "Quick, colourful and balanced.", calories: 480, isNutrio: false },
      { name: "Shepherd's pie (lighter)", description: "Comfort food made healthier.", calories: 450, isNutrio: false },
    ],
  };

  return fallbacks[mealType] || fallbacks.dinner;
}