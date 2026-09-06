import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser, todayISO } from "../supabase";

export default defineTool({
  name: "get_daily_summary",
  title: "Get daily nutrition summary",
  description:
    "Get the signed-in user's calories, macros, water and workouts for a given day, compared with their targets.",
  inputSchema: {
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Day to summarise in YYYY-MM-DD format. Defaults to today."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ date }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const day = date ?? todayISO();
    const from = `${day}T00:00:00.000Z`;
    const to = `${day}T23:59:59.999Z`;
    const supabase = supabaseForUser(ctx);

    const [profileRes, foodRes, waterRes, workoutRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("calorie_target, protein_target, carbs_target, fat_target, fibre_target")
        .maybeSingle(),
      supabase
        .from("food_logs")
        .select("food_name, meal_type, calories, protein, carbs, fat, fibre")
        .gte("logged_at", from)
        .lte("logged_at", to),
      supabase.from("water_logs").select("glasses").gte("logged_at", from).lte("logged_at", to),
      supabase
        .from("workout_logs")
        .select("exercise_name, duration_minutes, calories_burned")
        .gte("logged_at", from)
        .lte("logged_at", to),
    ]);

    const error = profileRes.error ?? foodRes.error ?? waterRes.error ?? workoutRes.error;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const foods = foodRes.data ?? [];
    const sum = (key: "calories" | "protein" | "carbs" | "fat" | "fibre") =>
      Math.round(foods.reduce((total, row) => total + (Number(row[key]) || 0), 0));

    const summary = {
      date: day,
      totals: {
        calories: sum("calories"),
        protein_g: sum("protein"),
        carbs_g: sum("carbs"),
        fat_g: sum("fat"),
        fibre_g: sum("fibre"),
      },
      targets: profileRes.data ?? null,
      water_glasses: (waterRes.data ?? []).reduce((t, r) => t + (Number(r.glasses) || 0), 0),
      meals_logged: foods.length,
      foods,
      workouts: workoutRes.data ?? [],
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
