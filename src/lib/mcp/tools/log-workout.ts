import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "log_workout",
  title: "Log a workout",
  description: "Record a completed workout for the signed-in user.",
  inputSchema: {
    exercise_name: z.string().trim().min(1).describe("Name of the exercise or session."),
    exercise_type: z
      .enum(["strength", "core", "endurance", "yoga", "other"])
      .describe("Category of the workout."),
    duration_minutes: z.number().int().positive().describe("Duration in minutes."),
    calories_burned: z.number().nonnegative().optional().describe("Estimated calories burned."),
    intensity: z.enum(["low", "moderate", "high"]).optional().describe("Perceived intensity."),
    notes: z.string().trim().optional().describe("Optional notes about the session."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("workout_logs")
      .insert({
        user_id: ctx.getUserId(),
        exercise_name: input.exercise_name,
        exercise_type: input.exercise_type,
        duration_minutes: input.duration_minutes,
        calories_burned: input.calories_burned ?? 0,
        intensity: input.intensity ?? "moderate",
        notes: input.notes ?? null,
        logged_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Logged ${input.exercise_name} for ${input.duration_minutes} minutes.` }],
      structuredContent: { entry: data },
    };
  },
});
