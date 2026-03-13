import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    let result;
    switch (action) {
      case "get_status":
        result = await getComplianceStatus(supabase, user.id);
        break;
      case "log_excuse":
        result = await logExcuse(supabase, user.id, params);
        break;
      case "log_cheat_meal":
        result = await logCheatMeal(supabase, user.id, params);
        break;
      case "check_daily_compliance":
        result = await checkDailyCompliance(supabase, user.id);
        break;
      case "trigger_failure":
        result = await triggerFailure(supabase, user.id, params.reason, params.details);
        break;
      case "enroll":
        result = await enrollStrictMode(supabase, user.id, params);
        break;
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Compliance error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

async function getActiveEnrollment(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("strict_mode_enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function enrollStrictMode(supabase: any, userId: string, params: any) {
  // Check no active enrollment
  const existing = await getActiveEnrollment(supabase, userId);
  if (existing) {
    return { error: "Already enrolled in strict mode", enrollment: existing };
  }

  const { data, error } = await supabase
    .from("strict_mode_enrollments")
    .insert({
      user_id: userId,
      target_weight_kg: params.target_weight_kg || null,
      target_date: params.target_date || null,
    })
    .select()
    .single();

  if (error) throw error;
  return { enrollment: data };
}

async function getComplianceStatus(supabase: any, userId: string) {
  const enrollment = await getActiveEnrollment(supabase, userId);
  if (!enrollment) {
    return { enrolled: false };
  }

  const today = new Date().toISOString().split("T")[0];
  const weekStart = getWeekStart(new Date());

  // Get today's meal photos
  const { data: mealPhotos } = await supabase
    .from("meal_photos")
    .select("*")
    .eq("user_id", userId)
    .eq("enrollment_id", enrollment.id)
    .eq("logged_at", today);

  // Get today's workout proof
  const { data: workoutProof } = await supabase
    .from("workout_proofs")
    .select("*")
    .eq("user_id", userId)
    .eq("enrollment_id", enrollment.id)
    .eq("logged_at", today);

  // Get today's weight proof
  const { data: weightProof } = await supabase
    .from("weight_proofs")
    .select("*")
    .eq("user_id", userId)
    .eq("enrollment_id", enrollment.id)
    .eq("logged_at", today);

  // Get this week's excuses
  const { data: weekExcuses } = await supabase
    .from("excuse_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("enrollment_id", enrollment.id)
    .eq("week_start", weekStart);

  // Get this week's cheat meals
  const { data: weekCheatMeals } = await supabase
    .from("cheat_meal_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("enrollment_id", enrollment.id)
    .eq("week_start", weekStart);

  const excuseCount = weekExcuses?.length || 0;
  const cheatMealCount = weekCheatMeals?.length || 0;
  const mealsLogged = mealPhotos?.map((m: any) => m.meal_type) || [];

  return {
    enrolled: true,
    enrollment,
    today: {
      mealsLogged,
      workoutCompleted: (workoutProof?.length || 0) > 0,
      weightLogged: (weightProof?.length || 0) > 0,
      mealPhotos: mealPhotos || [],
      workoutProofs: workoutProof || [],
      weightProofs: weightProof || [],
    },
    week: {
      excusesUsed: excuseCount,
      excusesRemaining: Math.max(0, 4 - excuseCount),
      cheatMealsUsed: cheatMealCount,
      cheatMealsRemaining: Math.max(0, 1 - cheatMealCount),
      excuses: weekExcuses || [],
      cheatMeals: weekCheatMeals || [],
    },
    limits: {
      maxExcusesPerWeek: 4,
      maxCheatMealsPerWeek: 1,
    },
  };
}

async function logExcuse(supabase: any, userId: string, params: any) {
  const enrollment = await getActiveEnrollment(supabase, userId);
  if (!enrollment) throw new Error("Not enrolled in strict mode");

  const weekStart = getWeekStart(new Date());

  // Check weekly limit
  const { count } = await supabase
    .from("excuse_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("enrollment_id", enrollment.id)
    .eq("week_start", weekStart);

  if ((count || 0) >= 4) {
    // Trigger failure
    await triggerFailure(supabase, userId, "Exceeded emergency excuse limit (4 per week)", {
      excuses_this_week: count,
    });
    return { failed: true, reason: "Exceeded emergency excuse limit" };
  }

  const { data, error } = await supabase
    .from("excuse_logs")
    .insert({
      user_id: userId,
      enrollment_id: enrollment.id,
      excuse_type: params.excuse_type || "emergency",
      missed_meal_type: params.missed_meal_type,
      note: params.note,
      week_start: weekStart,
    })
    .select()
    .single();

  if (error) throw error;
  return { excuse: data, remaining: 4 - ((count || 0) + 1) };
}

async function logCheatMeal(supabase: any, userId: string, params: any) {
  const enrollment = await getActiveEnrollment(supabase, userId);
  if (!enrollment) throw new Error("Not enrolled in strict mode");

  const weekStart = getWeekStart(new Date());

  // Check weekly limit
  const { count } = await supabase
    .from("cheat_meal_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("enrollment_id", enrollment.id)
    .eq("week_start", weekStart);

  if ((count || 0) >= 1) {
    await triggerFailure(supabase, userId, "Exceeded cheat meal limit (1 per week)", {
      cheat_meals_this_week: (count || 0) + 1,
    });
    return { failed: true, reason: "Exceeded cheat meal limit" };
  }

  const { data, error } = await supabase
    .from("cheat_meal_logs")
    .insert({
      user_id: userId,
      enrollment_id: enrollment.id,
      meal_type: params.meal_type,
      note: params.note,
      week_start: weekStart,
    })
    .select()
    .single();

  if (error) throw error;
  return { cheatMeal: data, remaining: 0 };
}

async function checkDailyCompliance(supabase: any, userId: string) {
  const status = await getComplianceStatus(supabase, userId);
  if (!status.enrolled) return { compliant: true, enrolled: false };

  const issues: string[] = [];

  if (!status.today.workoutCompleted) {
    issues.push("No workout proof uploaded today");
  }
  if (!status.today.weightLogged) {
    issues.push("No weight proof uploaded today");
  }

  return {
    compliant: issues.length === 0,
    issues,
    status,
  };
}

async function triggerFailure(supabase: any, userId: string, reason: string, details: any = {}) {
  const enrollment = await getActiveEnrollment(supabase, userId);
  if (!enrollment) throw new Error("Not enrolled in strict mode");

  // Update enrollment status
  await supabase
    .from("strict_mode_enrollments")
    .update({ status: "failed", failed_at: new Date().toISOString() })
    .eq("id", enrollment.id);

  // Create failure record
  const { data, error } = await supabase
    .from("program_failures")
    .insert({
      user_id: userId,
      enrollment_id: enrollment.id,
      failure_reason: reason,
      failure_details: details,
    })
    .select()
    .single();

  if (error) throw error;
  return { failure: data };
}
