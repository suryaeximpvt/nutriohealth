import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AISuggestion {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  emoji: string;
  nutrioProduct?: string | null;
}

export interface DailySuggestions {
  breakfast: AISuggestion | null;
  lunch: AISuggestion | null;
  snacks: AISuggestion | null;
  dinner: AISuggestion | null;
}

interface UserContext {
  calorieTarget: number;
  caloriesRemaining: number;
  proteinTarget: number;
  proteinConsumed: number;
  carbsTarget: number;
  carbsConsumed: number;
  fatTarget: number;
  fatConsumed: number;
  activityLevel: string;
  dietPreference: string;
  culturalPreference: 'indian' | 'uk' | 'mixed';
  allergies: string[];
  excludedFoods: string[];
  goal: string;
  previousMeals: { meal_type: string; food_name: string; calories: number }[];
  timeOfDay: string;
  steps?: number;
}

export const useDailyAISuggestions = () => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<DailySuggestions>({
    breakfast: null,
    lunch: null,
    snacks: null,
    dinner: null,
  });
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour < 10) return 'morning';
    if (hour < 14) return 'midday';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const fetchDailySuggestions = useCallback(async (context: Omit<UserContext, 'timeOfDay'>) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-daily-suggestions', {
        body: {
          ...context,
          timeOfDay: getTimeOfDay(),
        },
      });

      if (error) {
        console.error('Error fetching AI suggestions:', error);
        setSuggestions(getFallbackSuggestions(context.culturalPreference, context));
        return;
      }

      if (data?.error) {
        console.error('AI error:', data.error);
        setSuggestions(getFallbackSuggestions(context.culturalPreference, context));
        return;
      }

      setSuggestions({
        breakfast: data.breakfast || null,
        lunch: data.lunch || null,
        snacks: data.snacks || null,
        dinner: data.dinner || null,
      });
      setLastFetched(new Date().toISOString());
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      setSuggestions(getFallbackSuggestions(context.culturalPreference, context));
    } finally {
      setLoading(false);
    }
  }, []);

  const regenerateMeal = useCallback(async (
    mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner',
    context: Omit<UserContext, 'timeOfDay'>
  ) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-daily-suggestions', {
        body: {
          ...context,
          timeOfDay: getTimeOfDay(),
          regenerateMeal: mealType,
        },
      });

      if (error || data?.error) {
        console.error('Error regenerating meal:', error || data?.error);
        return;
      }

      if (data[mealType]) {
        setSuggestions(prev => ({
          ...prev,
          [mealType]: data[mealType],
        }));
      }
    } catch (err) {
      console.error('Failed to regenerate meal:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    suggestions,
    lastFetched,
    fetchDailySuggestions,
    regenerateMeal,
  };
};

// Fallback suggestions based on context - includes Nutrio products for breakfast/snacks
function getFallbackSuggestions(
  preference: 'indian' | 'uk' | 'mixed',
  context: Omit<UserContext, 'timeOfDay'>
): DailySuggestions {
  const proteinGap = context.proteinTarget - context.proteinConsumed;
  const isLowProtein = proteinGap > 30;
  const caloriesPerMeal = Math.round(context.caloriesRemaining / 4);

  if (preference === 'indian') {
    return {
      breakfast: {
        name: isLowProtein ? "Nutrio Protein Pancakes with Banana" : "Nutrio Breakfast Smoothie Bowl",
        description: isLowProtein 
          ? "High protein start with Nutrio Protein Pancake Mix topped with fresh banana slices"
          : "Nutrio Breakfast Smoothie blended thick with seasonal fruits and nuts",
        nutrioProduct: isLowProtein ? "Nutrio Protein Pancake Mix" : "Nutrio Breakfast Smoothie",
        calories: Math.min(caloriesPerMeal, 450),
        protein: isLowProtein ? 28 : 22,
        carbs: 45,
        fat: 12,
        prepTime: "15 min",
        emoji: "🥞",
      },
      lunch: {
        name: isLowProtein ? "Chicken Curry with Brown Rice" : "Dal Tadka with Roti",
        description: isLowProtein
          ? "Lean protein with aromatic spices and fiber-rich brown rice"
          : "Comforting lentils tempered with spices, served with whole wheat roti",
        nutrioProduct: null,
        calories: Math.min(caloriesPerMeal, 550),
        protein: isLowProtein ? 38 : 18,
        carbs: 55,
        fat: 18,
        prepTime: "35 min",
        emoji: "🍛",
      },
      snacks: {
        name: isLowProtein ? "Nutrio Protein Bar with Masala Chai" : "Nutrio Nut Mix with Fresh Fruit",
        description: isLowProtein
          ? "Quick protein boost with a Nutrio Protein Bar paired with spiced tea"
          : "Nutrio Nut Mix for healthy fats and protein with fresh seasonal fruit",
        nutrioProduct: isLowProtein ? "Nutrio Protein Bar" : "Nutrio Nut Mix",
        calories: Math.min(caloriesPerMeal, 200),
        protein: isLowProtein ? 15 : 10,
        carbs: 18,
        fat: 8,
        prepTime: "2 min",
        emoji: "🍫",
      },
      dinner: {
        name: isLowProtein ? "Grilled Fish with Sabzi" : "Vegetable Khichdi",
        description: isLowProtein
          ? "Omega-rich fish with sautéed vegetables"
          : "Light one-pot meal with rice and lentils",
        nutrioProduct: null,
        calories: Math.min(caloriesPerMeal, 480),
        protein: isLowProtein ? 35 : 15,
        carbs: 35,
        fat: 16,
        prepTime: "30 min",
        emoji: "🐟",
      },
    };
  }

  // UK / Mixed fallback
  return {
    breakfast: {
      name: isLowProtein ? "Nutrio Protein Pancakes with Berries" : "Nutrio Overnight Oats Cup",
      description: isLowProtein
        ? "Fluffy Nutrio Protein Pancake Mix stacked with fresh berries for a high-protein start"
        : "Ready-to-eat Nutrio Overnight Oats Cup with creamy texture and natural sweetness",
      nutrioProduct: isLowProtein ? "Nutrio Protein Pancake Mix" : "Nutrio Overnight Oats Cup",
      calories: Math.min(caloriesPerMeal, 420),
      protein: isLowProtein ? 25 : 20,
      carbs: 35,
      fat: 12,
      prepTime: "10 min",
      emoji: "🥞",
    },
    lunch: {
      name: isLowProtein ? "Grilled Chicken Salad" : "Jacket Potato with Beans",
      description: isLowProtein
        ? "Lean chicken breast with mixed greens and light dressing"
        : "Fluffy baked potato with protein-rich baked beans",
      nutrioProduct: null,
      calories: Math.min(caloriesPerMeal, 520),
      protein: isLowProtein ? 42 : 18,
      carbs: 28,
      fat: 16,
      prepTime: "25 min",
      emoji: "🥗",
    },
    snacks: {
      name: isLowProtein ? "Nutrio Protein Bar" : "Nutrio Shake Sachet with Apple",
      description: isLowProtein
        ? "Grab a Nutrio Protein Bar for quick protein on-the-go"
        : "Mix a Nutrio Shake Sachet with water and enjoy with a crisp apple",
      nutrioProduct: isLowProtein ? "Nutrio Protein Bar" : "Nutrio Shake Sachet",
      calories: Math.min(caloriesPerMeal, 180),
      protein: isLowProtein ? 15 : 20,
      carbs: 15,
      fat: 6,
      prepTime: "2 min",
      emoji: "🍫",
    },
    dinner: {
      name: isLowProtein ? "Salmon with Roasted Vegetables" : "Vegetable Stir-Fry with Quinoa",
      description: isLowProtein
        ? "Omega-3 rich salmon with seasonal roasted veg"
        : "Colorful vegetables with protein-packed quinoa",
      nutrioProduct: null,
      calories: Math.min(caloriesPerMeal, 550),
      protein: isLowProtein ? 38 : 16,
      carbs: 32,
      fat: 22,
      prepTime: "35 min",
      emoji: "🍽️",
    },
  };
}
