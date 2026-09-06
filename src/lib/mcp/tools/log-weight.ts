import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser, todayISO } from "../supabase";

export default defineTool({
  name: "log_weight",
  title: "Log body weight",
  description: "Record the signed-in user's body weight for a given day.",
  inputSchema: {
    weight_kg: z.number().positive().max(500).describe("Body weight in kilograms."),
    recorded_on: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Date of the reading in YYYY-MM-DD format. Defaults to today."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ weight_kg, recorded_on }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("weight_history")
      .insert({ user_id: ctx.getUserId(), weight_kg, recorded_on: recorded_on ?? todayISO() })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Logged ${weight_kg} kg.` }],
      structuredContent: { entry: data },
    };
  },
});
