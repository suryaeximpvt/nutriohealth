import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getDailySummary from "./tools/get-daily-summary";
import getProgress from "./tools/get-progress";
import logFood from "./tools/log-food";
import logWater from "./tools/log-water";
import logWorkout from "./tools/log-workout";
import logWeight from "./tools/log-weight";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "nutrio-your-uk-nutrition-coach",
  title: "Nutrio: Your UK Nutrition Coach",
  version: "0.1.0",
  instructions:
    "Tools for Nutrio, a UK nutrition and fitness coach app. Use `get_daily_summary` for today's calories, macros, water and workouts against the user's targets, `get_progress` for weight and calorie trends, and the `log_*` tools to record food, water, workouts and body weight for the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getDailySummary, getProgress, logFood, logWater, logWorkout, logWeight],
});
