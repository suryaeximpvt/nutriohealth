import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "log_water",
  title: "Log water intake",
  description: "Record glasses of water for the signed-in user.",
  inputSchema: {
    glasses: z.number().int().min(1).max(30).describe("Number of glasses of water to add."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ glasses }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("water_logs")
      .insert({ user_id: ctx.getUserId(), glasses, logged_at: new Date().toISOString() })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Logged ${glasses} glass(es) of water.` }],
      structuredContent: { entry: data },
    };
  },
});
