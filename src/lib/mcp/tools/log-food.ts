import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "log_food",
  title: "Log a food item",
  description: "Add a food item with its calories and macros to the signed-in user's diary.",
  inputSchema: {
    food_name: z.string().trim().min(1).describe("Name of the food or meal."),
    meal_type: z
      .enum(["breakfast", "lunch", "dinner", "snacks"])
      .describe("Which meal this food belongs to."),
    calories: z.number().nonnegative().describe("Calories (kcal)."),
    protein: z.number().nonnegative().optional().describe("Protein in grams."),
    carbs: z.number().nonnegative().optional().describe("Carbohydrates in grams."),
    fat: z.number().nonnegative().optional().describe("Fat in grams."),
    fibre: z.number().nonnegative().optional().describe("Fibre in grams."),
    quantity: z.number().positive().optional().describe("Portion quantity, defaults to 1."),
    unit: z.string().trim().optional().describe("Portion unit, e.g. g, ml, serving."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("food_logs")
      .insert({
        user_id: ctx.getUserId(),
        food_name: input.food_name,
        meal_type: input.meal_type,
        calories: input.calories,
        protein: input.protein ?? 0,
        carbs: input.carbs ?? 0,
        fat: input.fat ?? 0,
        fibre: input.fibre ?? 0,
        quantity: input.quantity ?? 1,
        unit: input.unit ?? "serving",
        logged_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Logged ${input.food_name} (${input.calories} kcal) to ${input.meal_type}.` }],
      structuredContent: { entry: data },
    };
  },
});
