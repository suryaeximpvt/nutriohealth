import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const iso = (d: Date) => d.toISOString().split("T")[0];

interface Rec {
  kind: string;
  title: string;
  body: string;
}

const KINDS = ["meal", "habit", "hydration", "movement", "mindset"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const today = iso(now);
    const sevenDaysAgo = iso(new Date(now.getTime() - 6 * 86400000));
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/London" })
        .format(now),
    );

    const [profileRes, personalRes, foodRes, todayFoodRes, workoutRes, waterRes, modeRes, nnRes, nnProgRes, feedbackRes, summaryRes] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_personalisation").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("food_logs").select("calories,protein,logged_at,meal_type,food_name").eq("user_id", user.id).gte("logged_at", sevenDaysAgo),
        supabase.from("food_logs").select("calories,protein,meal_type,food_name").eq("user_id", user.id).eq("logged_at", today),
        supabase.from("workout_logs").select("logged_at,exercise_type").eq("user_id", user.id).gte("logged_at", sevenDaysAgo),
        supabase.from("water_logs").select("glasses").eq("user_id", user.id).eq("logged_at", today),
        supabase.from("lifestyle_modes").select("mode_key,answers,ends_on").eq("user_id", user.id).eq("status", "active").lte("starts_on", today).gte("ends_on", today).limit(1),
        supabase.from("non_negotiables").select("id,label,target_count,frequency_type").eq("user_id", user.id).eq("active", true),
        supabase.from("non_negotiable_progress").select("non_negotiable_id,completed_on").eq("user_id", user.id).gte("completed_on", sevenDaysAgo),
        supabase.from("user_feedback").select("context,sentiment,message").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("weekly_nutrition_summary").select("status,insight").eq("user_id", user.id).order("week_start", { ascending: false }).limit(1),
      ]);

    const profile = (profileRes.data ?? {}) as Record<string, unknown>;
    const personal = (personalRes.data ?? {}) as Record<string, unknown>;
    const foods = (foodRes.data ?? []) as Record<string, string | number>[];
    const todayFoods = (todayFoodRes.data ?? []) as Record<string, string | number>[];
    const workouts = (workoutRes.data ?? []) as Record<string, string>[];
    const water = (waterRes.data ?? []) as { glasses: number }[];
    const mode = (modeRes.data ?? [])[0] as { mode_key: string; ends_on: string } | undefined;
    const nns = (nnRes.data ?? []) as { id: string; label: string; target_count: number }[];
    const nnProg = (nnProgRes.data ?? []) as { non_negotiable_id: string }[];
    const feedback = (feedbackRes.data ?? []) as { context: string; sentiment: string; message: string }[];
    const lastSummary = (summaryRes.data ?? [])[0] as { status: string; insight: Record<string, string> } | undefined;

    const calorieTarget = Number(profile.calorie_target) || 2000;
    const proteinTarget = Number(profile.protein_target) || 120;
    const eatenToday = todayFoods.reduce((s, f) => s + (Number(f.calories) || 0), 0);
    const proteinToday = todayFoods.reduce((s, f) => s + (Number(f.protein) || 0), 0);
    const remaining = Math.max(0, Math.round(calorieTarget - eatenToday));
    const glasses = water.reduce((s, w) => s + (Number(w.glasses) || 0), 0);

    const dayKeys = new Set(foods.map((f) => String(f.logged_at)));
    const avgCalories = dayKeys.size
      ? Math.round(foods.reduce((s, f) => s + (Number(f.calories) || 0), 0) / dayKeys.size)
      : 0;
    const avgProtein = dayKeys.size
      ? Math.round(foods.reduce((s, f) => s + (Number(f.protein) || 0), 0) / dayKeys.size)
      : 0;

    const nnStatus = nns
      .map((n) => `${n.label} ${nnProg.filter((p) => p.non_negotiable_id === n.id).length}/${n.target_count}`)
      .join(", ");

    const mealsToday = [...new Set(todayFoods.map((f) => String(f.meal_type)))].join(", ") || "none yet";

    const arr = (v: unknown) => (Array.isArray(v) ? v.join(", ") : "");

    const prompt = `Create today's personalised Nutrio recommendations.

TIME: ${hour}:00 (UK), date ${today}

USER
- Name: ${personal.display_name ?? profile.full_name ?? "there"}
- Goal: ${personal.primary_goal ?? profile.goal ?? "maintenance"} (importance ${personal.goal_importance ?? "n/a"}/5)
- Cultures: ${arr(personal.food_cultures) || "not set"}
- Favourite foods: ${arr(personal.favourite_foods) || "not set"}
- Dislikes: ${arr(personal.disliked_foods) || "none"} | Avoids: ${arr(personal.avoided_foods) || "none"}
- Diet preference: ${profile.diet_preference ?? "none"} | Allergies: ${arr(profile.allergies) || "none"}
- Cooking: ${personal.cooking_frequency ?? "n/a"}, time ${personal.cooking_time ?? "n/a"}; eats out ${personal.eating_out_frequency ?? "n/a"}
- Protein sources: ${arr(personal.protein_sources) || "not set"}
- Challenges: ${arr(personal.challenges) || "none stated"}; off-routine times: ${arr(personal.off_routine_times) || "none"}
- Support style: ${personal.support_style ?? "balanced"}

TODAY
- Eaten: ${Math.round(eatenToday)} kcal of ${calorieTarget}; ${remaining} kcal remaining
- Protein: ${Math.round(proteinToday)}g of ${proteinTarget}g
- Meals logged so far: ${mealsToday}
- Water: ${glasses}/8 glasses
- Lifestyle mode: ${mode?.mode_key ?? "none"}${mode ? ` (until ${mode.ends_on})` : ""}

LAST 7 DAYS
- Average ${avgCalories} kcal, ${avgProtein}g protein across ${dayKeys.size} logged days
- Workouts: ${workouts.length}
- Non-negotiables: ${nnStatus || "none set"}
- Last weekly status: ${lastSummary?.status ?? "n/a"} — ${lastSummary?.insight?.focus ?? ""}

RECENT USER FEEDBACK (learn from it, do not repeat what they disliked)
${feedback.map((f) => `- ${f.context}: ${f.sentiment ?? ""} ${f.message ?? ""}`).join("\n") || "- none yet"}

RULES
- Produce 3 recommendations, each a different kind from: ${KINDS.join(", ")}.
- Be specific to the numbers, the time of day, and their food culture and preferences. Never generic advice.
- Never shame, never restrict aggressively, never give medical advice. No calorie cutting below target.
- If a lifestyle mode is active, adapt to it (travel, busy, social, low energy, fasting...).
- British English. Warm, direct, practical. Body max 2 short sentences.

Return ONLY JSON:
{"recommendations":[{"kind":"meal","title":"short actionable title","body":"1-2 sentences"}]}`;

    const fallback: Rec[] = [
      {
        kind: "meal",
        title: remaining > 0 ? `About ${remaining} kcal left today` : "You've met today's calories",
        body:
          remaining > 0
            ? "A balanced plate with a solid protein source will round the day off nicely."
            : "Nice work — keep the evening light and stay hydrated.",
      },
      {
        kind: "hydration",
        title: glasses < 8 ? `${8 - glasses} glasses of water to go` : "Hydration sorted",
        body: glasses < 8 ? "Keep a glass within reach and sip through the next hour." : "You've hit your water goal today.",
      },
      {
        kind: "habit",
        title: nns.length ? "Tick off a non-negotiable" : "Log one more meal today",
        body: nns.length
          ? `Your habits this week: ${nnStatus}.`
          : "The more you log, the sharper Nutrio's suggestions get.",
      },
    ];

    let recs: Rec[] = fallback;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (LOVABLE_API_KEY) {
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are Nutrio's personalisation engine. Reply with valid JSON only." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (aiRes.status === 429 || aiRes.status === 402) {
        return new Response(
          JSON.stringify({
            error: aiRes.status === 429 ? "Nutrio AI is busy right now, please try again shortly." : "AI credits are exhausted for this workspace.",
          }),
          { status: aiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (aiRes.ok) {
        const json = await aiRes.json();
        const text: string = json.choices?.[0]?.message?.content ?? "";
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed.recommendations) && parsed.recommendations.length) {
              recs = parsed.recommendations
                .filter((r: Rec) => r?.title && r?.body)
                .slice(0, 3)
                .map((r: Rec) => ({ kind: KINDS.includes(r.kind) ? r.kind : "habit", title: r.title, body: r.body }));
            }
          } catch (_e) {
            // keep fallback
          }
        }
      } else {
        console.error("AI gateway error", aiRes.status, await aiRes.text());
      }
    }

    // Replace today's recommendations
    await supabase.from("personalised_recommendations").delete().eq("user_id", user.id).eq("valid_for", today);

    const rows = recs.map((r) => ({
      user_id: user.id,
      kind: r.kind,
      title: r.title,
      body: r.body,
      payload: { remaining, glasses, mode: mode?.mode_key ?? null },
      valid_for: today,
      dismissed: false,
    }));

    const { data: inserted, error } = await supabase
      .from("personalised_recommendations")
      .insert(rows)
      .select();
    if (error) console.error("insert error", error.message);

    return new Response(JSON.stringify({ recommendations: inserted ?? rows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("personalised-recommendations error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
