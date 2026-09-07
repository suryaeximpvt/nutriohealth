import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WINDOW_DAYS = 14;
const MAIN_MEALS = ["breakfast", "lunch", "dinner"];

interface Capture {
  meal_type: string;
  capture_date: string;
  capture_time: string | null;
  captured_at: string;
  food_name: string | null;
  calories: number | null;
  protein: number | null;
  fibre: number | null;
  location_context: string | null;
  day_context: string | null;
  confirmed_foods: unknown;
}

interface Missed {
  meal_type: string;
  event_date: string;
  outcome: string;
  reason: string | null;
}

const level = (score: number) => (score >= 66 ? "high" : score >= 33 ? "medium" : "low");
const pct = (a: number, b: number) => (b <= 0 ? 0 : Math.round((a / b) * 100));

const minutesOf = (t: string | null, iso: string) => {
  if (t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  }
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const since = new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString().split("T")[0];

    const [{ data: capRows }, { data: missRows }, { data: patternRows }, { data: pastRows }] =
      await Promise.all([
        supabase
          .from("food_captures")
          .select(
            "meal_type,capture_date,capture_time,captured_at,food_name,calories,protein,fibre,location_context,day_context,confirmed_foods",
          )
          .eq("user_id", user.id)
          .gte("capture_date", since)
          .order("captured_at", { ascending: true }),
        supabase
          .from("missed_meal_events")
          .select("meal_type,event_date,outcome,reason")
          .eq("user_id", user.id)
          .gte("event_date", since),
        supabase
          .from("food_behaviour_patterns")
          .select("pattern_type,pattern_key,label,detail,payload")
          .eq("user_id", user.id),
        supabase
          .from("recommendation_outcomes")
          .select("recommendation_content,tried,successful,failure_reason,created_at")
          .eq("user_id", user.id)
          .eq("recommendation_type", "minimum_change")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

    const captures = (capRows ?? []) as Capture[];
    const missed = (missRows ?? []) as Missed[];
    const patterns = patternRows ?? [];
    const past = pastRows ?? [];

    if (captures.length < 3) {
      return new Response(
        JSON.stringify({
          friction: [],
          change: null,
          reason: "not_enough_data",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ---------- Friction map (deterministic) ----------
    const daysSeen = new Set(captures.map((c) => c.capture_date)).size;

    const away = captures.filter(
      (c) => c.location_context && c.location_context !== "home",
    ).length;
    const timePoor = captures.filter((c) =>
      ["busy", "rushed", "work", "late_shift"].includes(String(c.day_context ?? "")),
    ).length;

    const breakfastDays = new Set(
      captures.filter((c) => c.meal_type === "breakfast").map((c) => c.capture_date),
    ).size;
    const skippedBreakfast = missed.filter(
      (m) => m.meal_type === "breakfast" && m.outcome === "skipped",
    ).length;

    const lateNights = captures.filter(
      (c) => c.meal_type === "dinner" && minutesOf(c.capture_time, c.captured_at) >= 21 * 60,
    ).length;
    const dinnerDays = new Set(
      captures.filter((c) => c.meal_type === "dinner").map((c) => c.capture_date),
    ).size;

    const proteinVals = captures.map((c) => Number(c.protein ?? 0)).filter((v) => v > 0);
    const avgProtein = proteinVals.length
      ? proteinVals.reduce((a, b) => a + b, 0) / proteinVals.length
      : 0;

    const mainMealsPossible = daysSeen * MAIN_MEALS.length;
    const mainMealsCaptured = captures.filter((c) => MAIN_MEALS.includes(c.meal_type)).length;

    const friction = [
      {
        friction_type: "eating_away_from_home",
        score: pct(away, captures.length),
        evidence: { away, total: captures.length },
      },
      {
        friction_type: "time_pressure",
        score: pct(timePoor, captures.length),
        evidence: { busy_meals: timePoor, total: captures.length },
      },
      {
        friction_type: "skipping_breakfast",
        score: pct(daysSeen - breakfastDays + skippedBreakfast * 0, Math.max(daysSeen, 1)),
        evidence: { days: daysSeen, breakfast_days: breakfastDays, declared_skips: skippedBreakfast },
      },
      {
        friction_type: "late_eating",
        score: pct(lateNights, Math.max(dinnerDays, 1)),
        evidence: { late_dinners: lateNights, dinner_days: dinnerDays },
      },
      {
        friction_type: "low_protein_meals",
        score: avgProtein > 0 ? Math.max(0, Math.min(100, Math.round((25 - avgProtein) * 5))) : 0,
        evidence: { avg_protein_per_meal: Math.round(avgProtein) },
      },
      {
        friction_type: "logging_gaps",
        score: 100 - pct(mainMealsCaptured, Math.max(mainMealsPossible, 1)),
        evidence: { captured: mainMealsCaptured, expected: mainMealsPossible },
      },
    ].map((f) => ({
      user_id: user.id,
      friction_type: f.friction_type,
      score: Math.max(0, Math.min(100, f.score)),
      level: level(Math.max(0, Math.min(100, f.score))),
      evidence: f.evidence,
      computed_at: new Date().toISOString(),
    }));

    await supabase.from("food_friction").upsert(friction, { onConflict: "user_id,friction_type" });

    // ---------- Smallest realistic change (AI, grounded in real behaviour) ----------
    const topFriction = [...friction].sort((a, b) => b.score - a.score).slice(0, 3);
    const rejected = past
      .filter((p) => p.tried === "no" || p.successful === false)
      .map((p) => ({
        change: (p.recommendation_content as Record<string, unknown> | null)?.title,
        why_not: p.failure_reason,
      }));

    const prompt = {
      window_days: WINDOW_DAYS,
      days_with_food_photos: daysSeen,
      meals_captured: captures.length,
      recent_foods: captures
        .slice(-20)
        .map((c) => c.food_name)
        .filter(Boolean),
      patterns: patterns.map((p) => ({ key: p.pattern_key, label: p.label, detail: p.detail })),
      friction: topFriction.map((f) => ({ type: f.friction_type, level: f.level, score: f.score })),
      previously_rejected: rejected,
      avg_protein_per_meal: Math.round(avgProtein),
    };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are Nutrio's behaviour coach for UK users. You never prescribe a diet plan. " +
              "Based ONLY on what this person actually ate and the friction in their real life, suggest ONE smallest realistic change. " +
              "It must fit their existing habits, take under 5 minutes, use foods they already eat or can buy in any UK supermarket, and never ask them to skip or replace a whole meal. " +
              "Never repeat a change they already rejected. Tone: neutral, supportive, never shaming. Nutrition numbers are estimates. " +
              'Reply as JSON only: {"title": string (max 8 words), "action": string (one sentence, concrete), "because": string (one sentence citing what you observed in their food photos), "effort": "tiny"|"small", "target_meal": "breakfast"|"lunch"|"dinner"|"snack"|"anytime", "friction_addressed": string}',
          },
          { role: "user", content: JSON.stringify(prompt) },
        ],
      }),
    });

    if (aiRes.status === 429 || aiRes.status === 402) {
      return new Response(
        JSON.stringify({ friction, change: null, reason: "ai_unavailable" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiJson = await aiRes.json();
    const raw: string = aiJson?.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    let change: Record<string, unknown> | null = null;
    try {
      change = JSON.parse(match ? match[1] : raw);
    } catch {
      change = null;
    }

    let recommendationId: string | null = null;
    if (change) {
      const { data: inserted } = await supabase
        .from("recommendation_outcomes")
        .insert({
          user_id: user.id,
          recommendation_type: "minimum_change",
          recommendation_content: change,
          context: { friction: topFriction, days_with_food_photos: daysSeen },
          viewed: true,
          asked_at: new Date().toISOString(),
        })
        .select("id")
        .maybeSingle();
      recommendationId = inserted?.id ?? null;
    }

    return new Response(JSON.stringify({ friction, change, recommendationId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
