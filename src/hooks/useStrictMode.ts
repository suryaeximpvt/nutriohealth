import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ComplianceStatus {
  enrolled: boolean;
  enrollment?: any;
  today?: {
    mealsLogged: string[];
    workoutCompleted: boolean;
    weightLogged: boolean;
    mealPhotos: any[];
    workoutProofs: any[];
    weightProofs: any[];
  };
  week?: {
    excusesUsed: number;
    excusesRemaining: number;
    cheatMealsUsed: number;
    cheatMealsRemaining: number;
    excuses: any[];
    cheatMeals: any[];
  };
  limits?: {
    maxExcusesPerWeek: number;
    maxCheatMealsPerWeek: number;
  };
}

export interface MealAnalysis {
  food_items: { name: string; estimated_grams: number }[];
  total_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fibre_g: number;
  portion_size: string;
  confidence: string;
  notes: string;
  follow_up_questions: string[];
}

export const useStrictMode = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<ComplianceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const callCompliance = useCallback(
    async (action: string, params: Record<string, any> = {}) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("strict-mode-compliance", {
        body: { action, ...params },
      });

      if (error) throw error;
      return data;
    },
    [user]
  );

  const fetchStatus = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await callCompliance("get_status");
      setStatus(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch strict mode status:", err);
    } finally {
      setLoading(false);
    }
  }, [user, callCompliance]);

  const enroll = useCallback(
    async (targetWeightKg?: number, targetDate?: string) => {
      const data = await callCompliance("enroll", {
        target_weight_kg: targetWeightKg,
        target_date: targetDate,
      });
      await fetchStatus();
      return data;
    },
    [callCompliance, fetchStatus]
  );

  const logExcuse = useCallback(
    async (excuseType: "emergency" | "busy_work", missedMealType?: string, note?: string) => {
      const data = await callCompliance("log_excuse", {
        excuse_type: excuseType,
        missed_meal_type: missedMealType,
        note,
      });
      await fetchStatus();
      return data;
    },
    [callCompliance, fetchStatus]
  );

  const logCheatMeal = useCallback(
    async (mealType?: string, note?: string) => {
      const data = await callCompliance("log_cheat_meal", {
        meal_type: mealType,
        note,
      });
      await fetchStatus();
      return data;
    },
    [callCompliance, fetchStatus]
  );

  const checkDailyCompliance = useCallback(async () => {
    return await callCompliance("check_daily_compliance");
  }, [callCompliance]);

  const triggerFailure = useCallback(
    async (reason: string, details?: any) => {
      const data = await callCompliance("trigger_failure", { reason, details });
      await fetchStatus();
      return data;
    },
    [callCompliance, fetchStatus]
  );

  // Upload photo to storage and return URL
  const uploadPhoto = useCallback(
    async (file: File, type: "meal" | "workout" | "weight") => {
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${type}/${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("strict-mode-photos")
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("strict-mode-photos")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    },
    [user]
  );

  // Analyze meal photo with AI
  const analyzeMealPhoto = useCallback(
    async (
      file: File,
      mealType: string,
      enrollmentId: string,
      context?: { cooking_method?: string; used_oil_butter?: boolean; is_restaurant?: boolean }
    ): Promise<MealAnalysis> => {
      setAnalyzing(true);
      try {
        // Upload photo first
        const photoUrl = await uploadPhoto(file, "meal");

        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
        });
        reader.readAsDataURL(file);
        const imageBase64 = await base64Promise;

        const { data, error } = await supabase.functions.invoke("strict-mode-meal-analyze", {
          body: {
            image_base64: imageBase64,
            meal_type: mealType,
            enrollment_id: enrollmentId,
            photo_url: photoUrl,
            ...context,
          },
        });

        if (error) throw error;
        await fetchStatus();
        return data.analysis;
      } finally {
        setAnalyzing(false);
      }
    },
    [uploadPhoto, fetchStatus]
  );

  // Upload workout proof
  const uploadWorkoutProof = useCallback(
    async (file: File, caloriesBurned?: number, durationMinutes?: number, workoutType?: string) => {
      if (!user || !status?.enrollment) throw new Error("Not enrolled");

      const photoUrl = await uploadPhoto(file, "workout");

      const { error } = await supabase.from("workout_proofs").insert({
        user_id: user.id,
        enrollment_id: status.enrollment.id,
        photo_url: photoUrl,
        calories_burned: caloriesBurned,
        duration_minutes: durationMinutes,
        workout_type: workoutType,
      });

      if (error) throw error;
      await fetchStatus();
    },
    [user, status, uploadPhoto, fetchStatus]
  );

  // Upload weight proof
  const uploadWeightProof = useCallback(
    async (file: File, weightKg?: number) => {
      if (!user || !status?.enrollment) throw new Error("Not enrolled");

      const photoUrl = await uploadPhoto(file, "weight");

      const { error } = await supabase.from("weight_proofs").insert({
        user_id: user.id,
        enrollment_id: status.enrollment.id,
        photo_url: photoUrl,
        weight_kg: weightKg,
      });

      if (error) throw error;
      await fetchStatus();
    },
    [user, status, uploadPhoto, fetchStatus]
  );

  return {
    status,
    loading,
    analyzing,
    fetchStatus,
    enroll,
    logExcuse,
    logCheatMeal,
    checkDailyCompliance,
    triggerFailure,
    uploadPhoto,
    analyzeMealPhoto,
    uploadWorkoutProof,
    uploadWeightProof,
  };
};
