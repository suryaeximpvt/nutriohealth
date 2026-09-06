import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildUserContext, clientFor, contextPrompt, corsHeaders } from "../_shared/userContext.ts";

interface Rec {
  kind: string;
  title: string;
  body: string;
}

const KINDS = ["meal", "habit", "hydration", "movement", "mindset"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    const today = ctx.today;
    const { remaining, glasses } = ctx.today_totals;

    const prompt = `Create today's personalised Nutrio recommendations.

${contextPrompt(ctx)}

RULES
- Produce 3 recommendations, each a different kind from: ${KINDS.join(", ")}.
- Apply the RANKING RULES and WEEKLY ADAPTATION RULE above before choosing anything.
- Be specific to the numbers, the time of day, their routine, culture and preferences. Never generic advice.
- Never shame, never restrict aggressively, never give medical advice.
- British English. Warm, direct, practical. Body max 2 short sentences.

Return ONLY JSON:
{"recommendations":[{"kind":"meal","title":"short actionable title","body":"1-2 sentences"}]}`;

    const nnStatus = ctx.nonNegotiableStatus;
    const fallback: Rec[] = [
      {
        kind: "meal",
        title: remaining > 0 ? `About ${remaining} kcal left today` : "You've met today's calories",
        body:
          remaining > 0
            ? "A balanced plate with a solid protein source will round the day off nicely."
            : "Nice work — keep the evening light and stay hydrated.",
      },
      {
        kind: "hydration",
        title: glasses < 8 ? `${8 - glasses} glasses of water to go` : "Hydration sorted",
        body: glasses < 8 ? "Keep a glass within reach and sip through the next hour." : "You've hit your water goal today.",
      },
      {
        kind: "habit",
        title: ctx.nonNegotiables.length ? "Tick off a non-negotiable" : "Log one more meal today",
        body: ctx.nonNegotiables.length
          ? `Your habits this week: ${nnStatus}.`
          : "The more you log, the sharper Nutrio's suggestions get.",
      },
    ];

    let recs: Rec[] = fallback;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (LOVABLE_API_KEY) {
      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are Nutrio's adaptive personalisation engine. Reply with valid JSON only." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (aiRes.status === 429 || aiRes.status === 402) {
        return new Response(
          JSON.stringify({
            error: aiRes.status === 429 ? "Nutrio AI is busy right now, please try again shortly." : "AI credits are exhausted for this workspace.",
          }),
          { status: aiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (aiRes.ok) {
        const json = await aiRes.json();
        const text: string = json.choices?.[0]?.message?.content ?? "";
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed.recommendations) && parsed.recommendations.length) {
              recs = parsed.recommendations
                .filter((r: Rec) => r?.title && r?.body)
                .slice(0, 3)
                .map((r: Rec) => ({ kind: KINDS.includes(r.kind) ? r.kind : "habit", title: r.title, body: r.body }));
            }
          } catch (_e) {
            // keep fallback
          }
        }
      } else {
        console.error("AI gateway error", aiRes.status, await aiRes.text());
      }
    }

    // Replace today's recommendations
    await supabase.from("personalised_recommendations").delete().eq("user_id", user.id).eq("valid_for", today);

    const rows = recs.map((r) => ({
      user_id: user.id,
      kind: r.kind,
      title: r.title,
      body: r.body,
      payload: {
        remaining,
        glasses,
        mode: ctx.mode?.mode_key ?? null,
        ranking_boost: ctx.ranking.boost,
        ranking_avoid: ctx.ranking.avoid,
        acceptance_rate: ctx.behaviour.recommendation_acceptance_rate,
      },
      valid_for: today,
      dismissed: false,
    }));

    const { data: inserted, error } = await supabase
      .from("personalised_recommendations")
      .insert(rows)
      .select();
    if (error) console.error("insert error", error.message);

    // Keep the stored behaviour profile fresh for the debug view.
    await supabase.from("user_behaviour_profile").upsert(
      {
        user_id: user.id,
        ...ctx.behaviour,
        computed_at: new Date().toISOString(),
      } as never,
      { onConflict: "user_id" },
    );

    return new Response(JSON.stringify({ recommendations: inserted ?? rows }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("personalised-recommendations error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
