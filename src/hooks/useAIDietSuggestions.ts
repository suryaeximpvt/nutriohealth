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

interface UserContext {
  caloriesRemaining: number;
  proteinGap: number;
  activityLevel: string;
  dietPreference: string;
  culturalPreference: "indian" | "uk" | "mixed";
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
      const fallback = getFallbackSuggestions(context.culturalPreference);
      setSuggestions(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  return { loading, suggestions, getSuggestions };
};

function getFallbackSuggestions(culture: string): CategorySuggestions {
  const isIndian = culture === "indian";
  
  return {
    bestForYou: [
      isIndian
        ? { name: "Dal Tadka with Roti", description: "Protein-rich lentils with whole wheat bread", calories: 380, protein: 18, prepTime: "25 min", emoji: "🍛" }
        : { name: "Grilled Chicken Salad", description: "Lean protein with fresh greens", calories: 350, protein: 35, prepTime: "15 min", emoji: "🥗" },
      isIndian
        ? { name: "Paneer Bhurji", description: "Scrambled cottage cheese with spices", calories: 320, protein: 22, prepTime: "15 min", emoji: "🧀" }
        : { name: "Salmon with Vegetables", description: "Omega-3 rich fish with roasted veg", calories: 420, protein: 32, prepTime: "25 min", emoji: "🐟" },
    ],
    highProtein: [
      isIndian
        ? { name: "Chicken Tikka", description: "Grilled spiced chicken chunks", calories: 280, protein: 38, prepTime: "20 min", emoji: "🍗" }
        : { name: "Steak & Eggs", description: "Classic high-protein meal", calories: 450, protein: 45, prepTime: "20 min", emoji: "🥩" },
      { name: "Greek Yogurt Bowl", description: "With nuts and seeds", calories: 250, protein: 20, prepTime: "5 min", emoji: "🥣" },
    ],
    quickMeals: [
      { name: "Scrambled Eggs on Toast", description: "Quick and filling", calories: 320, protein: 18, prepTime: "10 min", emoji: "🍳" },
      isIndian
        ? { name: "Poha", description: "Flattened rice with peanuts", calories: 280, protein: 8, prepTime: "15 min", emoji: "🍚" }
        : { name: "Tuna Sandwich", description: "Simple protein boost", calories: 350, protein: 25, prepTime: "10 min", emoji: "🥪" },
    ],
    budgetFriendly: [
      isIndian
        ? { name: "Chole (Chickpea Curry)", description: "Affordable plant protein", calories: 320, protein: 15, prepTime: "30 min", emoji: "🫘" }
        : { name: "Bean Chili", description: "Hearty and nutritious", calories: 340, protein: 18, prepTime: "25 min", emoji: "🍲" },
      { name: "Omelette", description: "Eggs with vegetables", calories: 250, protein: 16, prepTime: "10 min", emoji: "🍳" },
    ],
  };
}
