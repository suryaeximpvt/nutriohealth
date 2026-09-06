import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const iso = (d: Date) => d.toISOString().split("T")[0];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Week window: Monday -> today
    const now = new Date();
    const dayIdx = (now.getDay() + 6) % 7;
    const weekStartDate = new Date(now);
    weekStartDate.setDate(now.getDate() - dayIdx);
    const weekStart = iso(weekStartDate);
    const sevenDaysAgo = iso(new Date(now.getTime() - 6 * 86400000));

    const [profileRes, foodRes, workoutRes, weightRes, nnRes, nnProgRes, modeRes, personalRes] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("food_logs").select("*").eq("user_id", user.id).gte("logged_at", sevenDaysAgo),
        supabase.from("workout_logs").select("*").eq("user_id", user.id).gte("logged_at", sevenDaysAgo),
        supabase.from("weight_history").select("*").eq("user_id", user.id).order("recorded_on", { ascending: false }).limit(10),
        supabase.from("non_negotiables").select("*").eq("user_id", user.id).eq("active", true),
        supabase.from("non_negotiable_progress").select("*").eq("user_id", user.id).gte("completed_on", sevenDaysAgo),
        supabase.from("lifestyle_modes").select("*").eq("user_id", user.id).eq("status", "active").lte("starts_on", iso(now)).gte("ends_on", iso(now)).limit(1),
        supabase.from("user_personalisation").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

    const profile = profileRes.data as Record<string, unknown> | null;
    const foods = (foodRes.data ?? []) as Record<string, number | string>[];
    const workouts = (workoutRes.data ?? []) as Record<string, unknown>[];
    const weights = (weightRes.data ?? []) as { weight_kg: number; recorded_on: string }[];
    const nonNegotiables = (nnRes.data ?? []) as { id: string; label: string; target_count: number }[];
    const nnProgress = (nnProgRes.data ?? []) as { non_negotiable_id: string }[];
    const activeMode = (modeRes.data ?? [])[0] as { mode_key: string } | undefined;
    const personal = personalRes.data as Record<string, unknown> | null;

    const byDay: Record<string, { cal: number; protein: number; meals: number }> = {};
    for (const f of foods) {
      const d = String(f.logged_at);
      byDay[d] ??= { cal: 0, protein: 0, meals: 0 };
      byDay[d].cal += Number(f.calories) || 0;
      byDay[d].protein += Number(f.protein) || 0;
      byDay[d].meals += 1;
    }
    const days = Object.keys(byDay);
    const daysLogged = days.length;
    const totalCalories = Math.round(days.reduce((s, d) => s + byDay[d].cal, 0));
    const avgCalories = daysLogged ? Math.round(totalCalories / daysLogged) : 0;
    const avgProtein = daysLogged
      ? Math.round(days.reduce((s, d) => s + byDay[d].protein, 0) / daysLogged)
      : 0;
    const mealsLogged = foods.length;
    const calorieTarget = Number(profile?.calorie_target) || 2000;
    const proteinTarget = Number(profile?.protein_target) || 120;

    let weightChange: number | null = null;
    if (weights.length >= 2) {
      weightChange = Number((weights[0].weight_kg - weights[weights.length - 1].weight_kg).toFixed(1));
    }

    const nnSummary = nonNegotiables.map((n) => ({
      label: n.label,
      done: nnProgress.filter((p) => p.non_negotiable_id === n.id).length,
      target: n.target_count,
    }));

    // Status heuristic
    const diffPct = ((avgCalories - calorieTarget) / calorieTarget) * 100;
    let status = "green";
    if (activeMode && ["low_energy", "travelling", "social"].includes(activeMode.mode_key)) {
      status = "blue";
    } else if (daysLogged <= 2) {
      status = "orange";
    } else if (Math.abs(diffPct) <= 8) {
      status = "green";
    } else if (Math.abs(diffPct) <= 20) {
      status = "yellow";
    } else {
      status = "orange";
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const prompt = `Generate this week's Nutrio Insight for a user.

Data (last 7 days):
- Days logged: ${daysLogged}/7, meals logged: ${mealsLogged}
- Average calories: ${avgCalories} vs target ${calorieTarget}
- Average protein: ${avgProtein}g vs target ${proteinTarget}g
- Workouts logged: ${workouts.length}
- Weight change: ${weightChange === null ? "not tracked" : weightChange + " kg"}
- Goal: ${profile?.goal ?? "maintenance"}
- Active lifestyle mode: ${activeMode?.mode_key ?? "none"}
- Support style: ${personal?.support_style ?? "regular"}
- Non-negotiables: ${nnSummary.map((n) => `${n.label} ${n.done}/${n.target}`).join(", ") || "none set"}
- Computed status: ${status}

Rules:
- Never say the user "ate too much" or shame them. No starvation, no aggressive restriction, no medical advice.
- Use language like Maintain, Balance, Adjust, Refocus, Recover, Stay consistent.
- British English. Warm, calm, practical, specific to the numbers above.

Return ONLY JSON:
{"status":"green|yellow|orange|blue","headline":"short title","trend":"1 sentence on the calorie trend","goal_alignment":"1 sentence","protein":"1 sentence","meal_consistency":"1 sentence","achievement":"1 sentence naming a real win","focus":"one improvement focus for next week","strategy":"one practical strategy"}`;

    let insight: Record<string, string> = {
      status,
      headline: "Your week at a glance",
      trend: `You averaged ${avgCalories} kcal against a ${calorieTarget} kcal target.`,
      goal_alignment: "Keep going — consistency matters more than any single day.",
      protein: `Protein averaged ${avgProtein}g of your ${proteinTarget}g target.`,
      meal_consistency: `You logged on ${daysLogged} of the last 7 days.`,
      achievement: mealsLogged > 0 ? `You logged ${mealsLogged} meals this week.` : "You're here, and that counts.",
      focus: "Log one more meal a day next week.",
      strategy: "Pick two simple go-to meals you can repeat on busy days.",
    };

    if (LOVABLE_API_KEY) {
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are Nutrio's nutrition analyst. Reply with valid JSON only." },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (aiRes.ok) {
        const json = await aiRes.json();
        const text: string = json.choices?.[0]?.message?.content ?? "";
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            insight = { ...insight, ...JSON.parse(match[0]) };
          } catch (_e) {
            // keep fallback
          }
        }
      } else {
        console.error("AI gateway error", aiRes.status, await aiRes.text());
      }
    }

    const payload = {
      user_id: user.id,
      week_start: weekStart,
      total_calories: totalCalories,
      avg_calories: avgCalories,
      calorie_target: calorieTarget,
      avg_protein: avgProtein,
      protein_target: proteinTarget,
      days_logged: daysLogged,
      meals_logged: mealsLogged,
      workouts_logged: workouts.length,
      weight_change_kg: weightChange,
      status: insight.status ?? status,
      insight,
    };

    const { error: upsertError } = await supabase
      .from("weekly_nutrition_summary")
      .upsert(payload, { onConflict: "user_id,week_start" });
    if (upsertError) console.error("upsert error", upsertError.message);

    return new Response(JSON.stringify({ summary: payload }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weekly-insight error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
