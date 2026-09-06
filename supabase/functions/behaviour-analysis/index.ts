import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildUserContext, clientFor, corsHeaders } from "../_shared/userContext.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = clientFor(req);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ctx = await buildUserContext(supabase, user.id);
    const b = ctx.behaviour;

    const { error } = await supabase.from("user_behaviour_profile").upsert(
      {
        user_id: user.id,
        recommendation_acceptance_rate: b.recommendation_acceptance_rate,
        recommendation_follow_rate: b.recommendation_follow_rate,
        meal_logging_consistency: b.meal_logging_consistency,
        protein_target_consistency: b.protein_target_consistency,
        calorie_target_consistency: b.calorie_target_consistency,
        routine_consistency: b.routine_consistency,
        preferred_recommendation_type: b.preferred_recommendation_type,
        preferred_food_types: b.preferred_food_types,
        rejected_food_types: b.rejected_food_types,
        common_rejection_reasons: b.common_rejection_reasons,
        lifestyle_mode_usage: b.lifestyle_mode_usage,
        weekly_behaviour: b.weekly_behaviour,
        computed_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) console.error("behaviour upsert", error.message);

    return new Response(
      JSON.stringify({
        behaviour: b,
        context: {
          today: ctx.today_totals,
          targets: ctx.targets,
          week: ctx.week,
          mode: ctx.mode?.mode_key ?? null,
          ranking: ctx.ranking,
          nonNegotiables: ctx.nonNegotiableStatus,
          weightTrend: ctx.weightTrend,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("behaviour-analysis error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
