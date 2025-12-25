import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MealSuggestion {
  name: string;
  description: string;
  calories: number;
  protein: number;
  prepTime: string;
  emoji: string;
}

interface CategorySuggestions {
  bestForYou: MealSuggestion[];
  highProtein: MealSuggestion[];
  quickMeals: MealSuggestion[];
  budgetFriendly: MealSuggestion[];
}

type GoalFilter = "balanced" | "highProtein" | "lightClean" | "quickMeals" | "comfortFood";
type CuisinePreference = "global" | "indian" | "british" | "mediterranean" | "asian" | "middleEastern" | "continental" | "mixed";

interface UserContext {
  caloriesRemaining: number;
  proteinGap: number;
  activityLevel: string;
  dietPreference: string;
  goalFilter: GoalFilter;
  cuisinePreference: CuisinePreference;
  allergies: string[];
  excludedFoods: string[];
  goal: string;
}

export const useAIDietSuggestions = () => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CategorySuggestions | null>(null);

  const getSuggestions = async (context: UserContext) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-diet-suggestions", {
        body: context,
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setSuggestions(data as CategorySuggestions);
      return data as CategorySuggestions;
    } catch (error: any) {
      console.error("AI diet suggestions error:", error);
      
      if (error.message?.includes("Rate limit")) {
        toast.error("Please wait a moment before refreshing suggestions.");
      } else {
        toast.error("Couldn't get suggestions. Showing defaults.");
      }

      // Fallback suggestions
      const fallback = getFallbackSuggestions(context.goalFilter);
      setSuggestions(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  return { loading, suggestions, getSuggestions };
};

function getFallbackSuggestions(goalFilter: GoalFilter): CategorySuggestions {
  const baseOptions: CategorySuggestions = {
    bestForYou: [
      { name: "Grilled Chicken Salad", description: "Lean protein with fresh greens", calories: 350, protein: 35, prepTime: "15 min", emoji: "🥗" },
      { name: "Salmon with Vegetables", description: "Omega-3 rich fish with roasted veg", calories: 420, protein: 32, prepTime: "25 min", emoji: "🐟" },
      { name: "Quinoa Buddha Bowl", description: "Balanced plant-based meal", calories: 380, protein: 14, prepTime: "20 min", emoji: "🥙" },
    ],
    highProtein: [
      { name: "Steak & Eggs", description: "Classic high-protein meal", calories: 450, protein: 45, prepTime: "20 min", emoji: "🥩" },
      { name: "Greek Yogurt Bowl", description: "With nuts and seeds", calories: 250, protein: 20, prepTime: "5 min", emoji: "🥣" },
      { name: "Chicken Breast & Rice", description: "Lean protein with complex carbs", calories: 400, protein: 40, prepTime: "25 min", emoji: "🍗" },
    ],
    quickMeals: [
      { name: "Scrambled Eggs on Toast", description: "Quick and filling", calories: 320, protein: 18, prepTime: "10 min", emoji: "🍳" },
      { name: "Tuna Sandwich", description: "Simple protein boost", calories: 350, protein: 25, prepTime: "10 min", emoji: "🥪" },
      { name: "Avocado Toast", description: "Healthy fats and fiber", calories: 280, protein: 8, prepTime: "5 min", emoji: "🥑" },
    ],
    budgetFriendly: [
      { name: "Bean Chili", description: "Hearty and nutritious", calories: 340, protein: 18, prepTime: "25 min", emoji: "🍲" },
      { name: "Omelette", description: "Eggs with vegetables", calories: 250, protein: 16, prepTime: "10 min", emoji: "🍳" },
      { name: "Lentil Soup", description: "Affordable plant protein", calories: 280, protein: 14, prepTime: "30 min", emoji: "🥣" },
    ],
  };

  // Adjust suggestions based on goal filter
  if (goalFilter === "lightClean") {
    baseOptions.bestForYou = [
      { name: "Garden Salad with Grilled Chicken", description: "Light, clean, and protein-rich", calories: 280, protein: 30, prepTime: "15 min", emoji: "🥗" },
      { name: "Steamed Fish with Vegetables", description: "Clean eating at its best", calories: 250, protein: 28, prepTime: "20 min", emoji: "🐟" },
      { name: "Vegetable Soup", description: "Light and nourishing", calories: 150, protein: 6, prepTime: "25 min", emoji: "🥣" },
    ];
  } else if (goalFilter === "comfortFood") {
    baseOptions.bestForYou = [
      { name: "Shepherd's Pie", description: "Classic comfort food made healthier", calories: 450, protein: 25, prepTime: "45 min", emoji: "🥧" },
      { name: "Chicken & Vegetable Stew", description: "Warming and satisfying", calories: 380, protein: 28, prepTime: "40 min", emoji: "🍲" },
      { name: "Baked Pasta", description: "Comforting carbs with protein", calories: 420, protein: 20, prepTime: "35 min", emoji: "🍝" },
    ];
  }

  return baseOptions;
}
