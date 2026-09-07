import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Capture {
  meal_type: string;
  capture_date: string;
  capture_time: string | null;
  captured_at: string;
  day_of_week: number | null;
  food_name: string | null;
  calories: number | null;
  protein: number | null;
  fibre: number | null;
  location_context: string | null;
  day_context: string | null;
  confirmed_foods: unknown;
  user_edited: boolean | null;
}

interface Missed {
  meal_type: string;
  event_date: string;
  outcome: string;
  reason: string | null;
}

const MAIN_MEALS = ["breakfast", "lunch", "dinner"];
const WINDOW_DAYS = 14;

const pct = (a: number, b: number) => (b <= 0 ? 0 : Math.round((a / b) * 100));

const minutesOf = (t: string | null, iso: string) => {
  if (t) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  }
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
};

const hhmm = (mins: number) => {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const spread = (values: number[]) => {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);
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

    const [{ data: capRows }, { data: missRows }] = await Promise.all([
      supabase
        .from("food_captures")
        .select(
          "meal_type,capture_date,capture_time,captured_at,day_of_week,food_name,calories,protein,fibre,location_context,day_context,confirmed_foods,user_edited",
        )
        .eq("user_id", user.id)
        .gte("capture_date", since)
        .order("captured_at", { ascending: true }),
      supabase
        .from("missed_meal_events")
        .select("meal_type,event_date,outcome,reason")
        .eq("user_id", user.id)
        .gte("event_date", since),
    ]);

    const captures = (capRows ?? []) as Capture[];
    const missed = (missRows ?? []) as Missed[];

    // ---- Food Reality Score: how complete a picture Nutrio has ----
    const daysSeen = new Set(captures.map((c) => c.capture_date));
    const firstDate = captures.length ? captures[0].capture_date : null;
    const daysTracked = firstDate
      ? Math.min(
          WINDOW_DAYS,
          Math.floor((Date.now() - new Date(firstDate).getTime()) / 86400000) + 1,
        )
      : 0;

    const mealScore = (meal: string) => {
      if (daysTracked === 0) return 0;
      const captured = new Set(
        captures.filter((c) => c.meal_type === meal).map((c) => c.capture_date),
      ).size;
      const declared = missed.filter(
        (m) => m.meal_type === meal && (m.outcome === "skipped" || m.outcome === "ate_not_snapped"),
      ).length;
      return Math.min(100, pct(captured + declared * 0.6, daysTracked));
    };

    const breakfast = mealScore("breakfast");
    const lunch = mealScore("lunch");
    const dinner = mealScore("dinner");
    const snackDays = new Set(
      captures.filter((c) => c.meal_type === "snack").map((c) => c.capture_date),
    ).size;
    const snack = daysTracked ? Math.min(100, pct(snackDays, daysTracked)) : 0;

    const isWeekend = (d: string) => [0, 6].includes(new Date(d).getDay());
    const weekendDays = [...daysSeen].filter(isWeekend).length;
    const weekdayDays = daysSeen.size - weekendDays;
    const totalWeekend = Math.max(1, Math.round((daysTracked / 7) * 2));
    const totalWeekday = Math.max(1, daysTracked - totalWeekend);

    const overall = Math.round((breakfast + lunch + dinner) / 3);

    const score = {
      user_id: user.id,
      overall_score: overall,
      breakfast_score: breakfast,
      lunch_score: lunch,
      dinner_score: dinner,
      snack_score: snack,
      weekday_score: Math.min(100, pct(weekdayDays, totalWeekday)),
      weekend_score: Math.min(100, pct(weekendDays, totalWeekend)),
      window_days: WINDOW_DAYS,
      computed_at: new Date().toISOString(),
    };

    await supabase.from("food_reality_scores").upsert(score, { onConflict: "user_id" });

    // ---- Patterns ----
    const patterns: {
      pattern_type: string;
      pattern_key: string;
      label: string;
      detail: string;
      confidence: number;
      payload: Record<string, unknown>;
    }[] = [];

    // Meal timing patterns
    for (const meal of [...MAIN_MEALS, "snack"]) {
      const rows = captures.filter((c) => c.meal_type === meal);
      if (rows.length < 3) continue;
      const mins = rows.map((c) => minutesOf(c.capture_time, c.captured_at));
      const avg = mins.reduce((a, b) => a + b, 0) / mins.length;
      const sd = spread(mins);
      patterns.push({
        pattern_type: "timing",
        pattern_key: `timing_${meal}`,
        label: `You usually eat ${meal} around ${hhmm(avg)}`,
        detail:
          sd > 90
            ? "Your timing moves around a lot day to day."
            : "Your timing is fairly consistent.",
        confidence: Math.min(1, rows.length / 10),
        payload: { meal, average_minutes: Math.round(avg), variability_minutes: Math.round(sd), samples: rows.length },
      });
    }

    // Repeated foods
    const foodCounts: Record<string, number> = {};
    captures.forEach((c) => {
      const items = Array.isArray(c.confirmed_foods) ? (c.confirmed_foods as { name?: string }[]) : [];
      const names = items.length ? items.map((i) => i.name ?? "") : [c.food_name ?? ""];
      names
        .map((n) => n.trim().toLowerCase())
        .filter(Boolean)
        .forEach((n) => {
          foodCounts[n] = (foodCounts[n] ?? 0) + 1;
        });
    });
    const repeats = Object.entries(foodCounts)
      .filter(([, n]) => n >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    if (repeats.length) {
      patterns.push({
        pattern_type: "repetition",
        pattern_key: "repeat_foods",
        label: `${repeats[0][0]} shows up most often in your week`,
        detail: `Your most repeated foods: ${repeats.map(([n, c]) => `${n} (${c}×)`).join(", ")}.`,
        confidence: Math.min(1, captures.length / 20),
        payload: { repeats },
      });
    }

    // Weekend vs weekday eating
    const weekendCaps = captures.filter((c) => isWeekend(c.capture_date));
    const weekdayCaps = captures.filter((c) => !isWeekend(c.capture_date));
    const avgCals = (rows: Capture[]) => {
      const days = new Set(rows.map((r) => r.capture_date)).size;
      if (!days) return 0;
      return Math.round(rows.reduce((s, r) => s + (r.calories ?? 0), 0) / days);
    };
    if (weekendCaps.length >= 2 && weekdayCaps.length >= 3) {
      const we = avgCals(weekendCaps);
      const wd = avgCals(weekdayCaps);
      if (wd > 0 && Math.abs(we - wd) / wd >= 0.15) {
        patterns.push({
          pattern_type: "weekly_rhythm",
          pattern_key: "weekend_vs_weekday",
          label:
            we > wd
              ? "Weekends look noticeably bigger than weekdays"
              : "Weekends look lighter than your weekdays",
          detail: `Around ${we} kcal a day at weekends versus ${wd} kcal on weekdays (estimates).`,
          confidence: 0.6,
          payload: { weekend_avg: we, weekday_avg: wd },
        });
      }
    }

    // Eating location
    const locCounts: Record<string, number> = {};
    captures.forEach((c) => {
      if (c.location_context) locCounts[c.location_context] = (locCounts[c.location_context] ?? 0) + 1;
    });
    const away = Object.entries(locCounts)
      .filter(([k]) => k !== "home")
      .reduce((s, [, n]) => s + n, 0);
    if (captures.length >= 5 && away > 0) {
      patterns.push({
        pattern_type: "context",
        pattern_key: "eating_location",
        label: `${pct(away, captures.length)}% of your meals happen away from home`,
        detail: Object.entries(locCounts)
          .map(([k, n]) => `${k.replace(/_/g, " ")}: ${n}`)
          .join(", "),
        confidence: Math.min(1, captures.length / 15),
        payload: { locations: locCounts },
      });
    }

    // Late eating
    const lateNights = captures.filter(
      (c) => minutesOf(c.capture_time, c.captured_at) >= 21 * 60,
    ).length;
    if (lateNights >= 3) {
      patterns.push({
        pattern_type: "timing",
        pattern_key: "late_eating",
        label: `You ate after 9pm on ${lateNights} occasions`,
        detail: "Late eating often follows a light or missed earlier meal.",
        confidence: 0.6,
        payload: { late_count: lateNights },
      });
    }

    // Missing meals
    const missedByMeal: Record<string, number> = {};
    missed
      .filter((m) => m.outcome === "skipped")
      .forEach((m) => {
        missedByMeal[m.meal_type] = (missedByMeal[m.meal_type] ?? 0) + 1;
      });
    const topMissed = Object.entries(missedByMeal).sort((a, b) => b[1] - a[1])[0];
    if (topMissed && topMissed[1] >= 2) {
      patterns.push({
        pattern_type: "missing_meal",
        pattern_key: `missing_${topMissed[0]}`,
        label: `${topMissed[0][0].toUpperCase()}${topMissed[0].slice(1)} gets skipped most`,
        detail: `Skipped ${topMissed[1]} times in the last ${WINDOW_DAYS} days.`,
        confidence: 0.7,
        payload: { meal: topMissed[0], count: topMissed[1] },
      });
    }

    // Protein spread
    const proteinDays = [...daysSeen].map((d) =>
      captures.filter((c) => c.capture_date === d).reduce((s, c) => s + Number(c.protein ?? 0), 0),
    );
    if (proteinDays.length >= 4) {
      const avgP = Math.round(proteinDays.reduce((a, b) => a + b, 0) / proteinDays.length);
      patterns.push({
        pattern_type: "nutrition",
        pattern_key: "protein_average",
        label: `Around ${avgP}g protein on the days you capture`,
        detail:
          captures.filter((c) => c.meal_type === "breakfast" && Number(c.protein ?? 0) >= 15).length <
          proteinDays.length / 2
            ? "Most of your protein arrives later in the day."
            : "Your protein is spread reasonably across the day.",
        confidence: 0.6,
        payload: { average_protein: avgP },
      });
    }

    if (patterns.length) {
      await supabase.from("food_behaviour_patterns").delete().eq("user_id", user.id);
      await supabase.from("food_behaviour_patterns").insert(
        patterns.map((p) => ({ ...p, user_id: user.id, computed_at: new Date().toISOString() })),
      );
    }

    // ---- Tracking behaviour profile (how they track, not what they eat) ----
    const editRate = captures.length
      ? pct(captures.filter((c) => c.user_edited).length, captures.length)
      : 0;

    const tracking = {
      days_tracked: daysTracked,
      days_with_capture: daysSeen.size,
      captures: captures.length,
      edit_rate: editRate,
      most_captured_meal:
        [...MAIN_MEALS, "snack"]
          .map((m) => [m, captures.filter((c) => c.meal_type === m).length] as const)
          .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
      least_captured_meal:
        [...MAIN_MEALS]
          .map((m) => [m, captures.filter((c) => c.meal_type === m).length] as const)
          .sort((a, b) => a[1] - b[1])[0]?.[0] ?? null,
    };

    return new Response(
      JSON.stringify({ score, patterns, tracking }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("food-behaviour-engine", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
