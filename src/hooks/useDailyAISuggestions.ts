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

export interface MealOptions {
  primary: AISuggestion;
  alternatives: AISuggestion[];
}

export interface DailySuggestions {
  breakfast: MealOptions | null;
  lunch: MealOptions | null;
  snacks: MealOptions | null;
  dinner: MealOptions | null;
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

// Fallback suggestions with multiple options
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
        primary: {
          name: isLowProtein ? "Masala Omelette with Paratha" : "Poha with Vegetables",
          description: isLowProtein 
            ? "High protein eggs with spices and whole wheat paratha"
            : "Light flattened rice with peanuts and vegetables",
          nutrioProduct: null,
          calories: Math.min(caloriesPerMeal, 420),
          protein: isLowProtein ? 28 : 12,
          carbs: 35,
          fat: 18,
          prepTime: "15 min",
          emoji: "🍳",
        },
        alternatives: [
          {
            name: "Idli Sambar",
            description: "Steamed rice cakes with lentil soup",
            nutrioProduct: null,
            calories: Math.min(caloriesPerMeal, 350),
            protein: 14,
            carbs: 55,
            fat: 8,
            prepTime: "20 min",
            emoji: "🥣",
          },
          {
            name: "AI alternative using Nutrio Protein Pancake Mix",
            description: "Quick protein boost with Nutrio Protein Pancake Mix topped with banana",
            nutrioProduct: "Nutrio Protein Pancake Mix",
            calories: Math.min(caloriesPerMeal, 400),
            protein: 25,
            carbs: 40,
            fat: 12,
            prepTime: "12 min",
            emoji: "🥞",
          },
        ],
      },
      lunch: {
        primary: {
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
        alternatives: [
          {
            name: "Rajma Chawal",
            description: "Kidney beans curry with steamed rice - comfort food with protein",
            nutrioProduct: null,
            calories: Math.min(caloriesPerMeal, 520),
            protein: 18,
            carbs: 65,
            fat: 14,
            prepTime: "30 min",
            emoji: "🫘",
          },
          {
            name: "Paneer Bhurji with Chapati",
            description: "Scrambled cottage cheese with whole wheat flatbread",
            nutrioProduct: null,
            calories: Math.min(caloriesPerMeal, 480),
            protein: 26,
            carbs: 42,
            fat: 22,
            prepTime: "20 min",
            emoji: "🧀",
          },
        ],
      },
      snacks: {
        primary: {
          name: "Greek Yogurt with Almonds",
          description: "High protein yogurt with healthy fats from almonds",
          nutrioProduct: null,
          calories: Math.min(caloriesPerMeal, 180),
          protein: 15,
          carbs: 12,
          fat: 8,
          prepTime: "2 min",
          emoji: "🥛",
        },
        alternatives: [
          {
            name: "Roasted Chana",
            description: "Crunchy roasted chickpeas - traditional protein snack",
            nutrioProduct: null,
            calories: Math.min(caloriesPerMeal, 150),
            protein: 10,
            carbs: 18,
            fat: 5,
            prepTime: "0 min",
            emoji: "🫛",
          },
          {
            name: "AI alternative using Nutrio Protein Bar",
            description: "Quick protein with Nutrio Protein Bar - great on-the-go",
            nutrioProduct: "Nutrio Protein Bar",
            calories: 180,
            protein: 15,
            carbs: 18,
            fat: 7,
            prepTime: "0 min",
            emoji: "🍫",
          },
        ],
      },
      dinner: {
        primary: {
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
        alternatives: [
          {
            name: "Egg Curry with Rice",
            description: "Protein-rich eggs in spiced gravy",
            nutrioProduct: null,
            calories: Math.min(caloriesPerMeal, 450),
            protein: 22,
            carbs: 48,
            fat: 18,
            prepTime: "25 min",
            emoji: "🥚",
          },
          {
            name: "Mixed Dal with Jeera Rice",
            description: "Protein-packed mixed lentils with cumin rice",
            nutrioProduct: null,
            calories: Math.min(caloriesPerMeal, 420),
            protein: 18,
            carbs: 58,
            fat: 12,
            prepTime: "30 min",
            emoji: "🍚",
          },
        ],
      },
    };
  }

  // UK / Mixed fallback
  return {
    breakfast: {
      primary: {
        name: isLowProtein ? "Scrambled Eggs on Toast" : "Overnight Oats with Berries",
        description: isLowProtein
          ? "Classic high-protein breakfast with whole grain toast"
          : "Fiber-rich oats with antioxidant berries",
        nutrioProduct: null,
        calories: Math.min(caloriesPerMeal, 380),
        protein: isLowProtein ? 25 : 12,
        carbs: 32,
        fat: 14,
        prepTime: "10 min",
        emoji: "🍳",
      },
      alternatives: [
        {
          name: "Avocado Toast with Poached Egg",
          description: "Healthy fats with protein - trendy and nutritious",
          nutrioProduct: null,
          calories: Math.min(caloriesPerMeal, 420),
          protein: 18,
          carbs: 28,
          fat: 24,
          prepTime: "12 min",
          emoji: "🥑",
        },
        {
          name: "AI alternative using Nutrio Overnight Oats Cup",
          description: "Convenient high-protein breakfast with Nutrio Overnight Oats Cup",
          nutrioProduct: "Nutrio Overnight Oats Cup",
          calories: 310,
          protein: 20,
          carbs: 38,
          fat: 10,
          prepTime: "0 min",
          emoji: "🥣",
        },
      ],
    },
    lunch: {
      primary: {
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
      alternatives: [
        {
          name: "Tuna Mayo Sandwich",
          description: "Classic British lunch with omega-3 rich tuna",
          nutrioProduct: null,
          calories: Math.min(caloriesPerMeal, 450),
          protein: 28,
          carbs: 38,
          fat: 18,
          prepTime: "10 min",
          emoji: "🥪",
        },
        {
          name: "Chicken & Vegetable Soup with Bread",
          description: "Warming and filling with lean protein",
          nutrioProduct: null,
          calories: Math.min(caloriesPerMeal, 380),
          protein: 24,
          carbs: 35,
          fat: 12,
          prepTime: "20 min",
          emoji: "🍲",
        },
      ],
    },
    snacks: {
      primary: {
        name: "Apple with Peanut Butter",
        description: "Perfect combo of fiber and protein for sustained energy",
        nutrioProduct: null,
        calories: Math.min(caloriesPerMeal, 200),
        protein: 7,
        carbs: 25,
        fat: 10,
        prepTime: "2 min",
        emoji: "🍎",
      },
      alternatives: [
        {
          name: "Cottage Cheese with Cucumber",
          description: "High protein, low calorie refreshing snack",
          nutrioProduct: null,
          calories: Math.min(caloriesPerMeal, 120),
          protein: 14,
          carbs: 6,
          fat: 4,
          prepTime: "3 min",
          emoji: "🥒",
        },
        {
          name: "AI alternative using Nutrio Shake Sachet",
          description: "Quick protein shake with Nutrio Shake Sachet - mix and go",
          nutrioProduct: "Nutrio Shake Sachet",
          calories: 150,
          protein: 20,
          carbs: 12,
          fat: 3,
          prepTime: "1 min",
          emoji: "🥤",
        },
      ],
    },
    dinner: {
      primary: {
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
      alternatives: [
        {
          name: "Shepherd's Pie (Healthy Version)",
          description: "Lean mince with sweet potato mash - comfort food made healthy",
          nutrioProduct: null,
          calories: Math.min(caloriesPerMeal, 520),
          protein: 32,
          carbs: 45,
          fat: 18,
          prepTime: "45 min",
          emoji: "🥧",
        },
        {
          name: "Grilled Chicken with Mashed Potatoes",
          description: "Classic British dinner with lean protein",
          nutrioProduct: null,
          calories: Math.min(caloriesPerMeal, 480),
          protein: 38,
          carbs: 38,
          fat: 14,
          prepTime: "30 min",
          emoji: "🍗",
        },
      ],
    },
  };
}
