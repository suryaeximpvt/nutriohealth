import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  calorie_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  fibre_target: number;
  activity_level: string;
  diet_preference: string;
  allergies: string[] | null;
  excluded_foods: string[] | null;
  weight_kg: number | null;
  height_cm: number | null;
  goal: string;
}

interface FoodLog {
  id: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  quantity: number;
  unit: string;
  logged_at: string;
}

interface DailySummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFibre: number;
  meals: {
    breakfast: FoodLog[];
    lunch: FoodLog[];
    snacks: FoodLog[];
    dinner: FoodLog[];
  };
}

export const useUserData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    if (data) {
      setProfile(data as Profile);
    }
  }, [user]);

  const fetchFoodLogs = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("logged_at", today)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching food logs:", error);
      return;
    }

    setFoodLogs((data || []) as FoodLog[]);
  }, [user, today]);

  const fetchWaterLogs = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("water_logs")
      .select("glasses")
      .eq("user_id", user.id)
      .eq("logged_at", today)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching water logs:", error);
      return;
    }

    setWaterGlasses(data?.glasses || 0);
  }, [user, today]);

  const logFood = async (
    mealType: string,
    food: {
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fibre: number;
      quantity: number;
    }
  ) => {
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase.from("food_logs").insert({
      user_id: user.id,
      meal_type: mealType.toLowerCase(),
      food_name: food.name,
      calories: Math.round(food.calories * food.quantity),
      protein: Math.round(food.protein * food.quantity * 100) / 100,
      carbs: Math.round(food.carbs * food.quantity * 100) / 100,
      fat: Math.round(food.fat * food.quantity * 100) / 100,
      fibre: Math.round(food.fibre * food.quantity * 100) / 100,
      quantity: food.quantity,
      logged_at: today,
    });

    if (error) {
      console.error("Error logging food:", error);
      return { error: error.message };
    }

    await fetchFoodLogs();
    return { error: null };
  };

  const deleteFood = async (id: string) => {
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase.from("food_logs").delete().eq("id", id);

    if (error) {
      console.error("Error deleting food:", error);
      return { error: error.message };
    }

    await fetchFoodLogs();
    return { error: null };
  };

  const updateWater = async (glasses: number) => {
    if (!user) return { error: "Not authenticated" };

    // Upsert water log for today
    const { error } = await supabase
      .from("water_logs")
      .upsert(
        { user_id: user.id, glasses, logged_at: today },
        { onConflict: "user_id,logged_at" }
      );

    if (error) {
      console.error("Error updating water:", error);
      return { error: error.message };
    }

    setWaterGlasses(glasses);
    return { error: null };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      return { error: error.message };
    }

    await fetchProfile();
    return { error: null };
  };

  // Calculate daily summary
  const dailySummary: DailySummary = {
    totalCalories: foodLogs.reduce((sum, log) => sum + log.calories, 0),
    totalProtein: foodLogs.reduce((sum, log) => sum + Number(log.protein), 0),
    totalCarbs: foodLogs.reduce((sum, log) => sum + Number(log.carbs), 0),
    totalFat: foodLogs.reduce((sum, log) => sum + Number(log.fat), 0),
    totalFibre: foodLogs.reduce((sum, log) => sum + Number(log.fibre), 0),
    meals: {
      breakfast: foodLogs.filter((log) => log.meal_type === "breakfast"),
      lunch: foodLogs.filter((log) => log.meal_type === "lunch"),
      snacks: foodLogs.filter((log) => log.meal_type === "snacks"),
      dinner: foodLogs.filter((log) => log.meal_type === "dinner"),
    },
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchProfile(), fetchFoodLogs(), fetchWaterLogs()]).finally(
        () => setLoading(false)
      );
    } else {
      setLoading(false);
    }
  }, [user, fetchProfile, fetchFoodLogs, fetchWaterLogs]);

  return {
    profile,
    foodLogs,
    waterGlasses,
    dailySummary,
    loading,
    logFood,
    deleteFood,
    updateWater,
    updateProfile,
    refreshData: () =>
      Promise.all([fetchProfile(), fetchFoodLogs(), fetchWaterLogs()]),
  };
};