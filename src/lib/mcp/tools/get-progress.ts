import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_progress",
  title: "Get recent progress",
  description:
    "Get the signed-in user's goal profile, recent weight history and recent daily calorie totals over a number of days.",
  inputSchema: {
    days: z.number().int().min(1).max(90).optional().describe("How many days back to look. Defaults to 14."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const window = days ?? 14;
    const since = new Date(Date.now() - window * 86400000);
    const sinceISO = since.toISOString();
    const sinceDay = sinceISO.slice(0, 10);
    const supabase = supabaseForUser(ctx);

    const [profileRes, weightRes, foodRes] = await Promise.all([
      supabase.from("profiles").select("*").maybeSingle(),
      supabase
        .from("weight_history")
        .select("recorded_on, weight_kg")
        .gte("recorded_on", sinceDay)
        .order("recorded_on", { ascending: true }),
      supabase.from("food_logs").select("logged_at, calories, protein").gte("logged_at", sinceISO),
    ]);

    const error = profileRes.error ?? weightRes.error ?? foodRes.error;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const byDay: Record<string, { calories: number; protein: number }> = {};
    for (const row of foodRes.data ?? []) {
      const day = String(row.logged_at).slice(0, 10);
      byDay[day] ??= { calories: 0, protein: 0 };
      byDay[day].calories += Number(row.calories) || 0;
      byDay[day].protein += Number(row.protein) || 0;
    }

    const daily = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, calories: Math.round(v.calories), protein_g: Math.round(v.protein) }));

    const result = {
      window_days: window,
      profile: profileRes.data ?? null,
      weight_history: weightRes.data ?? [],
      daily_calories: daily,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
