import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildUserContext, clientFor, contextPrompt, corsHeaders } from "../_shared/userContext.ts";

const LOCATIONS: Record<string, string> = {
  home: "at home",
  restaurant: "at a restaurant",
  supermarket: "in a supermarket",
  office: "at the office",
  travelling: "travelling",
  social: "at a social event",
};

const INTENTS: Record<string, string> = {
  eat: "wants to know what to eat",
  avoid: "wants to know what to avoid",
  choose: "wants help choosing between options",
  alternative: "wants a realistic alternative",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabase = clientFor(req);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Not authenticated" }, 401);

    const { question, location, intent, history } = await req.json();
    if (typeof question !== "string" || !question.trim()) {
      return json({ error: "Ask Nutrio a question first." }, 400);
    }

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI is not configured right now." }, 500);

    const ctx = await buildUserContext(supabase, user.id);

    const situation = [
      location ? `They are ${LOCATIONS[location] ?? location}.` : "",
      intent ? `They ${INTENTS[intent] ?? intent}.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const system = `You are Nutrio — a personal nutrition companion, not a generic chatbot and not a calorie police.

${contextPrompt(ctx)}

HOW TO ANSWER
- Start by grounding the answer in what you actually know about them today (goal, what they've eaten, calories left, lifestyle mode, non-negotiables, routine).
- Give 2-3 realistic options that fit where they are right now. Never one "perfect diet" answer.
- Respect their dietary preferences, dislikes and allergies without repeating them back as a list.
- British English. Warm, direct, practical, never judgemental, never guilt-inducing.
- Keep it short: a sentence of context, then the options as short bullets, then one closing line.
- General nutrition guidance only. No medical claims, diagnosis or treatment advice.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          ...(Array.isArray(history) ? history.slice(-8) : []),
          { role: "user", content: `${situation}\n\n${question}`.trim() },
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return json({ error: "Nutrio is busy — try again in a moment." }, 429);
      if (res.status === 402) return json({ error: "AI credits have run out." }, 402);
      console.error("gateway error", res.status, await res.text());
      return json({ error: "Nutrio couldn't answer just now." }, 502);
    }

    const data = await res.json();
    const answer: string = data.choices?.[0]?.message?.content ?? "";
    if (!answer) return json({ error: "Nutrio couldn't answer just now." }, 502);

    const { data: saved } = await supabase
      .from("ask_nutrio_interactions")
      .insert({
        user_id: user.id,
        question,
        location_context: location ?? null,
        intent: intent ?? null,
        context_snapshot: {
          goal: ctx.profile?.goal ?? null,
          mode: ctx.mode?.mode_key ?? null,
          today_totals: ctx.today_totals,
          targets: ctx.targets,
        },
        response: answer,
      })
      .select("id")
      .maybeSingle();

    return json({ response: answer, interactionId: saved?.id ?? null });
  } catch (e) {
    console.error("ask-nutrio", e);
    return json({ error: "Something went wrong." }, 500);
  }
});
