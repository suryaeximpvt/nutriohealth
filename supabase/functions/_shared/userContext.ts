// Central adaptive personalisation context builder for Nutrio.
// Rule-based + data-driven. No machine learning model is involved.
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const iso = (d: Date) => d.toISOString().split("T")[0];

export const clientFor = (req: Request): SupabaseClient =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });

type Row = Record<string, unknown>;

export interface UserContext {
  today: string;
  hour: number;
  profile: Row;
  personal: Row;
  routine: Row;
  mode: { mode_key: string; ends_on: string; answers?: Row } | null;
  nonNegotiables: { id: string; label: string; target_count: number }[];
  nonNegotiableStatus: string;
  targets: { calories: number; protein: number };
  today_totals: { calories: number; protein: number; remaining: number; glasses: number; meals: string };
  week: {
    avgCalories: number;
    avgProtein: number;
    daysLogged: number;
    workouts: number;
    prevAvgCalories: number;
    prevDaysLogged: number;
    calorieTrend: string;
  };
  behaviour: BehaviourProfile;
  ranking: { boost: string[]; avoid: string[] };
  weightTrend: string;
  lastWeeklyStatus: string;
}

export interface BehaviourProfile {
  recommendation_acceptance_rate: number;
  recommendation_follow_rate: number;
  meal_logging_consistency: number;
  protein_target_consistency: number;
  calorie_target_consistency: number;
  routine_consistency: number;
  preferred_recommendation_type: string | null;
  preferred_food_types: string[];
  rejected_food_types: string[];
  common_rejection_reasons: string[];
  lifestyle_mode_usage: Record<string, number>;
  weekly_behaviour: Record<string, unknown>;
}

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) / 100 : 0);
const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]).join(", ") : "");
const topN = (counts: Record<string, number>, n: number) =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);

export async function buildUserContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserContext> {
  const now = new Date();
  const today = iso(now);
  const d7 = iso(new Date(now.getTime() - 6 * 86400000));
  const d14 = iso(new Date(now.getTime() - 13 * 86400000));
  const d30 = new Date(now.getTime() - 29 * 86400000).toISOString();
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/London" }).format(now),
  );

  const [
    profileRes, personalRes, routineRes, foodRes, todayFoodRes, workoutRes, waterRes,
    modeRes, modeHistRes, nnRes, nnProgRes, eventsRes, feedbackRes, summaryRes, weightRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("user_personalisation").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("routine_schedule").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("food_logs").select("calories,protein,logged_at,meal_type,food_name").eq("user_id", userId).gte("logged_at", d14),
    supabase.from("food_logs").select("calories,protein,meal_type,food_name").eq("user_id", userId).eq("logged_at", today),
    supabase.from("workout_logs").select("logged_at,exercise_type").eq("user_id", userId).gte("logged_at", d7),
    supabase.from("water_logs").select("glasses").eq("user_id", userId).eq("logged_at", today),
    supabase.from("lifestyle_modes").select("mode_key,answers,ends_on").eq("user_id", userId).eq("status", "active").lte("starts_on", today).gte("ends_on", today).limit(1),
    supabase.from("lifestyle_modes").select("mode_key").eq("user_id", userId).limit(50),
    supabase.from("non_negotiables").select("id,label,target_count").eq("user_id", userId).eq("active", true),
    supabase.from("non_negotiable_progress").select("non_negotiable_id").eq("user_id", userId).gte("completed_on", d7),
    supabase.from("recommendation_events").select("recommendation_type,recommendation_content,event_type,meal_type,event_timestamp").eq("user_id", userId).gte("event_timestamp", d30).order("event_timestamp", { ascending: false }).limit(500),
    supabase.from("recommendation_feedback").select("rating,rejection_reason,recommendation_type,recommendation_content,meal_type").eq("user_id", userId).order("created_at", { ascending: false }).limit(100),
    supabase.from("weekly_nutrition_summary").select("status,insight").eq("user_id", userId).order("week_start", { ascending: false }).limit(1),
    supabase.from("weight_history").select("weight_kg,recorded_on").eq("user_id", userId).order("recorded_on", { ascending: false }).limit(10),
  ]);

  const profile = (profileRes.data ?? {}) as Row;
  const personal = (personalRes.data ?? {}) as Row;
  const routine = (routineRes.data ?? {}) as Row;
  const foods = (foodRes.data ?? []) as Row[];
  const todayFoods = (todayFoodRes.data ?? []) as Row[];
  const workouts = (workoutRes.data ?? []) as Row[];
  const water = (waterRes.data ?? []) as { glasses: number }[];
  const mode = ((modeRes.data ?? [])[0] as UserContext["mode"]) ?? null;
  const modeHist = (modeHistRes.data ?? []) as { mode_key: string }[];
  const nns = (nnRes.data ?? []) as { id: string; label: string; target_count: number }[];
  const nnProg = (nnProgRes.data ?? []) as { non_negotiable_id: string }[];
  const events = (eventsRes.data ?? []) as Row[];
  const feedback = (feedbackRes.data ?? []) as Row[];
  const weights = (weightRes.data ?? []) as { weight_kg: number; recorded_on: string }[];
  const lastSummary = (summaryRes.data ?? [])[0] as { status?: string; insight?: Record<string, string> } | undefined;

  const calories = Number(profile.calorie_target) || 2000;
  const protein = Number(profile.protein_target) || 120;
  const eaten = todayFoods.reduce((s, f) => s + (Number(f.calories) || 0), 0);
  const proteinToday = todayFoods.reduce((s, f) => s + (Number(f.protein) || 0), 0);
  const glasses = water.reduce((s, w) => s + (Number(w.glasses) || 0), 0);

  // ---- week vs previous week
  const byDay: Record<string, { cal: number; pro: number }> = {};
  for (const f of foods) {
    const k = String(f.logged_at);
    byDay[k] = byDay[k] ?? { cal: 0, pro: 0 };
    byDay[k].cal += Number(f.calories) || 0;
    byDay[k].pro += Number(f.protein) || 0;
  }
  const recentDays = Object.keys(byDay).filter((d) => d >= d7);
  const prevDays = Object.keys(byDay).filter((d) => d < d7);
  const avg = (days: string[], key: "cal" | "pro") =>
    days.length ? Math.round(days.reduce((s, d) => s + byDay[d][key], 0) / days.length) : 0;
  const avgCalories = avg(recentDays, "cal");
  const avgProtein = avg(recentDays, "pro");
  const prevAvgCalories = avg(prevDays, "cal");
  const calorieTrend =
    !prevAvgCalories || !avgCalories
      ? "not enough data"
      : avgCalories > prevAvgCalories * 1.05
        ? "rising"
        : avgCalories < prevAvgCalories * 0.95
          ? "falling"
          : "steady";

  // ---- behaviour scoring (rule based)
  const evOf = (t: string) => events.filter((e) => e.event_type === t).length;
  const shown = evOf("shown");
  const accepted = evOf("accepted");
  const followed = evOf("followed");
  const partial = evOf("partially_followed");
  const acceptance = pct(accepted + followed, shown);
  const followRate = pct(followed + partial * 0.5, accepted + followed + partial || shown);

  const daysOnTarget = (key: "cal" | "pro", target: number) =>
    recentDays.filter((d) => byDay[d][key] >= target * 0.85 && byDay[d][key] <= target * 1.15).length;

  const mealsPerDay: Record<string, Set<string>> = {};
  for (const f of foods) {
    const k = String(f.logged_at);
    mealsPerDay[k] = mealsPerDay[k] ?? new Set();
    mealsPerDay[k].add(String(f.meal_type));
  }

  const likedCounts: Record<string, number> = {};
  const rejectedCounts: Record<string, number> = {};
  const reasonCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};

  const contentLabel = (c: unknown) => {
    const o = (c ?? {}) as Row;
    return String(o.title ?? o.food_name ?? o.name ?? "").slice(0, 60);
  };

  for (const e of events) {
    const label = contentLabel(e.recommendation_content);
    if (["accepted", "followed"].includes(String(e.event_type))) {
      if (label) likedCounts[label] = (likedCounts[label] ?? 0) + 1;
      typeCounts[String(e.recommendation_type)] = (typeCounts[String(e.recommendation_type)] ?? 0) + 1;
    }
    if (["dismissed", "not_followed"].includes(String(e.event_type)) && label) {
      rejectedCounts[label] = (rejectedCounts[label] ?? 0) + 1;
    }
  }
  for (const f of feedback) {
    if (f.rejection_reason) reasonCounts[String(f.rejection_reason)] = (reasonCounts[String(f.rejection_reason)] ?? 0) + 1;
    const label = contentLabel(f.recommendation_content);
    if (!label) continue;
    if (f.rating === "helpful") likedCounts[label] = (likedCounts[label] ?? 0) + 2;
    if (f.rating === "not_helpful") rejectedCounts[label] = (rejectedCounts[label] ?? 0) + 2;
  }

  const modeUsage: Record<string, number> = {};
  for (const m of modeHist) modeUsage[m.mode_key] = (modeUsage[m.mode_key] ?? 0) + 1;

  const behaviour: BehaviourProfile = {
    recommendation_acceptance_rate: acceptance,
    recommendation_follow_rate: followRate,
    meal_logging_consistency: pct(recentDays.length, 7),
    protein_target_consistency: pct(daysOnTarget("pro", protein), 7),
    calorie_target_consistency: pct(daysOnTarget("cal", calories), 7),
    routine_consistency: pct(
      recentDays.filter((d) => (mealsPerDay[d]?.size ?? 0) >= 3).length,
      7,
    ),
    preferred_recommendation_type: topN(typeCounts, 1)[0] ?? null,
    preferred_food_types: topN(likedCounts, 5),
    rejected_food_types: topN(rejectedCounts, 5),
    common_rejection_reasons: topN(reasonCounts, 3),
    lifestyle_mode_usage: modeUsage,
    weekly_behaviour: weeklyBehaviour(foods, events, mealsPerDay, recentDays),
  };

  const weightTrend =
    weights.length >= 2
      ? `${(weights[0].weight_kg - weights[weights.length - 1].weight_kg).toFixed(1)} kg since ${weights[weights.length - 1].recorded_on}`
      : "not enough weigh-ins";

  return {
    today,
    hour,
    profile,
    personal,
    routine,
    mode,
    nonNegotiables: nns,
    nonNegotiableStatus: nns
      .map((n) => `${n.label} ${nnProg.filter((p) => p.non_negotiable_id === n.id).length}/${n.target_count}`)
      .join(", "),
    targets: { calories, protein },
    today_totals: {
      calories: Math.round(eaten),
      protein: Math.round(proteinToday),
      remaining: Math.max(0, Math.round(calories - eaten)),
      glasses,
      meals: [...new Set(todayFoods.map((f) => String(f.meal_type)))].join(", ") || "none yet",
    },
    week: {
      avgCalories,
      avgProtein,
      daysLogged: recentDays.length,
      workouts: workouts.length,
      prevAvgCalories,
      prevDaysLogged: prevDays.length,
      calorieTrend,
    },
    behaviour,
    ranking: {
      boost: [
        ...behaviour.preferred_food_types,
        ...(Array.isArray(personal.favourite_foods) ? (personal.favourite_foods as string[]) : []),
        ...(Array.isArray(personal.food_cultures) ? (personal.food_cultures as string[]) : []),
      ].filter(Boolean).slice(0, 10),
      avoid: [
        ...behaviour.rejected_food_types,
        ...(Array.isArray(personal.disliked_foods) ? (personal.disliked_foods as string[]) : []),
        ...(Array.isArray(personal.avoided_foods) ? (personal.avoided_foods as string[]) : []),
        ...(Array.isArray(profile.allergies) ? (profile.allergies as string[]) : []),
      ].filter(Boolean).slice(0, 12),
    },
    weightTrend,
    lastWeeklyStatus: `${lastSummary?.status ?? "n/a"} — ${lastSummary?.insight?.focus ?? ""}`,
  };
}

function weeklyBehaviour(
  foods: Row[],
  events: Row[],
  mealsPerDay: Record<string, Set<string>>,
  recentDays: string[],
) {
  const mealCounts: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
  for (const f of foods) {
    const m = String(f.meal_type);
    if (m in mealCounts) mealCounts[m] += 1;
  }
  const sorted = Object.entries(mealCounts).sort((a, b) => b[1] - a[1]);
  const weekend = recentDays.filter((d) => [0, 6].includes(new Date(d).getDay()));
  const weekday = recentDays.filter((d) => ![0, 6].includes(new Date(d).getDay()));
  const density = (days: string[]) =>
    days.length ? Math.round((days.reduce((s, d) => s + (mealsPerDay[d]?.size ?? 0), 0) / days.length) * 10) / 10 : 0;

  const rejectedTypes: Record<string, number> = {};
  for (const e of events) {
    if (["dismissed", "not_followed"].includes(String(e.event_type))) {
      const t = String(e.recommendation_type);
      rejectedTypes[t] = (rejectedTypes[t] ?? 0) + 1;
    }
  }

  return {
    most_consistent_meal: sorted[0]?.[0] ?? null,
    least_consistent_meal: sorted[sorted.length - 1]?.[0] ?? null,
    most_skipped_meal: sorted.filter(([, v]) => v === 0).map(([k]) => k)[0] ?? sorted[sorted.length - 1]?.[0] ?? null,
    most_rejected_recommendation_type: topN(rejectedTypes, 1)[0] ?? null,
    weekday_meal_density: density(weekday),
    weekend_meal_density: density(weekend),
    weekday_vs_weekend:
      density(weekend) < density(weekday) ? "weekends are weaker" : density(weekend) > density(weekday) ? "weekends are stronger" : "similar",
  };
}

const MODE_GUIDANCE: Record<string, string> = {
  travelling:
    "TRAVELLING: prioritise portable foods, shop/airport/restaurant picks, simple calorie strategies and easy protein. Never suggest complicated home cooking.",
  busy_work:
    "BUSY WORK: prioritise fast meals, minimal prep, batch/meal-prep and convenience options. Keep steps to a minimum.",
  social:
    "SOCIAL: prioritise flexible calorie strategy, balancing across the day and restaurant-friendly choices. Never suggest extreme restriction or guilt.",
  workout_focus: "WORKOUT FOCUS: prioritise protein timing, pre/post-training fuel and recovery hydration.",
  reset: "RESET: prioritise simple repeatable meals and consistency over perfection.",
  low_energy: "LOW ENERGY: prioritise gentle easy foods, fluids and rest. Keep asks tiny.",
  fasting: "FASTING: work around the eating window, suhoor/iftar balance and hydration between meals.",
  home_routine: "HOME ROUTINE: home-cooked and batch-cooking ideas fit well.",
  eating_out: "EATING OUT: menu-friendly choices, portion guidance and balance across the day.",
};

export function contextPrompt(ctx: UserContext): string {
  const p = ctx.personal;
  const b = ctx.behaviour;
  const weeklyAdaptation =
    ctx.week.calorieTrend === "rising" || ctx.week.avgCalories > ctx.targets.calories * 1.1
      ? "Calories have been consistently high. Do NOT suggest extreme restriction. Suggest small adjustments, meal balancing, higher protein, higher fibre, lower calorie density and better consistency."
      : "Keep momentum with small, achievable adjustments.";

  return `TIME: ${ctx.hour}:00 (UK), date ${ctx.today}

USER
- Name: ${p.display_name ?? ctx.profile.full_name ?? "there"}
- Goal: ${p.primary_goal ?? ctx.profile.goal ?? "maintenance"} (importance ${p.goal_importance ?? "n/a"}/5)
- Cultures: ${arr(p.food_cultures) || "not set"} | Favourites: ${arr(p.favourite_foods) || "not set"}
- Dislikes: ${arr(p.disliked_foods) || "none"} | Avoids: ${arr(p.avoided_foods) || "none"}
- Diet: ${ctx.profile.diet_preference ?? "none"} | Allergies: ${arr(ctx.profile.allergies) || "none"}
- Cooking: ${p.cooking_frequency ?? "n/a"}, time ${p.cooking_time ?? "n/a"}; eats out ${p.eating_out_frequency ?? "n/a"}
- Protein sources: ${arr(p.protein_sources) || "not set"} | Challenges: ${arr(p.challenges) || "none"}
- Support style: ${p.support_style ?? "balanced"}

ROUTINE
- Wake ${ctx.routine.wake_time ?? "n/a"}, sleep ${ctx.routine.sleep_time ?? "n/a"}
- Meals: breakfast ${ctx.routine.breakfast_time ?? "n/a"}, lunch ${ctx.routine.lunch_time ?? "n/a"}, dinner ${ctx.routine.dinner_time ?? "n/a"}
- Workout ${ctx.routine.workout_time ?? "n/a"} | Timing variability: ${ctx.routine.timing_variability ?? "n/a"}

TODAY
- ${ctx.today_totals.calories} kcal of ${ctx.targets.calories} (${ctx.today_totals.remaining} remaining), protein ${ctx.today_totals.protein}g of ${ctx.targets.protein}g
- Meals logged: ${ctx.today_totals.meals} | Water ${ctx.today_totals.glasses}/8
- Lifestyle mode: ${ctx.mode?.mode_key ?? "none"}${ctx.mode ? ` (until ${ctx.mode.ends_on})` : ""}
${ctx.mode ? MODE_GUIDANCE[ctx.mode.mode_key] ?? "" : ""}

TRENDS
- Last 7 days: ${ctx.week.avgCalories} kcal / ${ctx.week.avgProtein}g protein across ${ctx.week.daysLogged} days; workouts ${ctx.week.workouts}
- Previous week average: ${ctx.week.prevAvgCalories} kcal (trend ${ctx.week.calorieTrend})
- Weight: ${ctx.weightTrend} | Last weekly status: ${ctx.lastWeeklyStatus}
- Non-negotiables: ${ctx.nonNegotiableStatus || "none set"}
- WEEKLY ADAPTATION RULE: ${weeklyAdaptation}

BEHAVIOUR (from this user's own past actions — adapt, do not repeat mistakes)
- Acceptance rate ${Math.round(b.recommendation_acceptance_rate * 100)}%, follow rate ${Math.round(b.recommendation_follow_rate * 100)}%
- Logging consistency ${Math.round(b.meal_logging_consistency * 100)}%, protein ${Math.round(b.protein_target_consistency * 100)}%, calories ${Math.round(b.calorie_target_consistency * 100)}%, routine ${Math.round(b.routine_consistency * 100)}%
- Preferred recommendation type: ${b.preferred_recommendation_type ?? "unknown"}
- Weekly behaviour: ${JSON.stringify(b.weekly_behaviour)}
- Common rejection reasons: ${b.common_rejection_reasons.join(", ") || "none yet"}

RANKING RULES
- RANK UP anything close to: ${ctx.ranking.boost.join(", ") || "their stated preferences"}
- RANK DOWN or exclude: ${ctx.ranking.avoid.join(", ") || "nothing yet"}
- If "Didn't have time" or "Too difficult" appear in rejection reasons, keep prep under 10 minutes.
- If "Too expensive" appears, use budget UK supermarket staples.
- If "Didn't fit my culture" appears, lean harder into their stated food cultures.`;
}
