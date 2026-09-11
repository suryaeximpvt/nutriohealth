import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildUserContext, clientFor, contextPrompt, corsHeaders } from "../_shared/userContext.ts";

// Conversational brain for "Tell Nutrio".
// Takes the whole spoken/typed conversation so far plus the working draft,
// and returns a natural reply, the detected intent and an updated draft.
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

    const body = await req.json();
    const turns = Array.isArray(body?.turns) ? body.turns.slice(-12) : [];
    const draft = body?.draft ?? null;
    if (!turns.length) return json({ error: "Tell Nutrio what happened." }, 400);

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI is not configured right now." }, 500);

    const ctx = await buildUserContext(supabase, user.id);

    const system = `You are Nutrio, a warm British nutrition companion having a SPOKEN conversation.
The user is talking to you out loud, so keep every reply to one or two short, natural sentences.

${contextPrompt(ctx)}

WHAT YOU DO
Work out what the user is doing:
- log_meal: they described food they ate (one or many items)
- skip_meal: they said they skipped or missed a meal
- log_activity: they described exercise or a walk
- question: they asked you something (answer it yourself, using what you know about them)
- correction: they are fixing something they said before
- smalltalk: anything else

CONVERSATION RULES
- Understand natural timing ("this morning" = breakfast, "last night" = dinner, "earlier" = use the current time ${ctx.hour}:00).
- Keep context across turns: "them", "it", "with that" refer to what was said earlier. Always carry earlier food items forward into the draft.
- If something important is missing (what kind of sandwich, which meal it was), ask ONE short friendly question and set status "need_more".
- Once you have enough, summarise it back naturally and ask to log it: status "confirm".
- If the user agrees ("yes", "yep", "go on", "that's right"), status "done".
- If the user is only asking a question, status "done" and put your full answer in reply.
- Never sound robotic. Never say "database", "logged successfully", "input". Say things like "Got it — I've added that to your lunch."
- British English. Never judge them. Nutrition numbers are rough estimates.

DRAFT
Always return the FULL draft, merging everything said so far (do not drop earlier items).
Estimate rough UK-portion nutrition for each food item.

Return ONLY JSON, no markdown:
{"intent":"log_meal|skip_meal|log_activity|question|correction|smalltalk",
 "reply":"short spoken-style sentence",
 "status":"need_more|confirm|done",
 "draft":{"meal_type":"breakfast|lunch|dinner|snack","portion_size":"small|medium|large","summary":"eggs, toast and a coffee","confidence":0.0-1.0,"items":[{"name":"Scrambled eggs","portion_size":"medium","calories":220,"protein":18,"carbs":2,"fat":16,"fibre":0}]},
 "activity":{"name":"Walk","minutes":45}|null}

Set "draft" to null when the turn is not about food. Set "activity" to null unless the intent is log_activity.`;

    const messages = [
      { role: "system", content: system },
      ...(draft
        ? [{ role: "system", content: `Current draft so far: ${JSON.stringify(draft).slice(0, 1500)}` }]
        : []),
      ...turns
        .filter((t: { role?: string; content?: string }) => t?.role && typeof t.content === "string")
        .map((t: { role: string; content: string }) => ({
          role: t.role === "assistant" ? "assistant" : "user",
          content: t.content.slice(0, 800),
        })),
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
    });

    if (!res.ok) {
      if (res.status === 429) return json({ error: "Nutrio is busy — try again in a moment." }, 429);
      if (res.status === 402) return json({ error: "AI credits have run out." }, 402);
      console.error("gateway error", res.status, await res.text());
      return json({ error: "Nutrio couldn't answer just now." }, 502);
    }

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return json({ error: "Nutrio couldn't quite follow that — try again." }, 502);

    const parsed = JSON.parse(match[0]);

    if (parsed.intent === "question") {
      const lastUser = [...turns].reverse().find((t: { role?: string }) => t.role === "user");
      await supabase.from("ask_nutrio_interactions").insert({
        user_id: user.id,
        question: String(lastUser?.content ?? "").slice(0, 500),
        location_context: null,
        intent: "voice",
        context_snapshot: {
          goal: ctx.profile?.goal ?? null,
          mode: ctx.mode?.mode_key ?? null,
          today_totals: ctx.today_totals,
        },
        response: String(parsed.reply ?? ""),
      });
    }

    return json({
      intent: parsed.intent ?? "smalltalk",
      reply: parsed.reply ?? "Okay.",
      status: parsed.status ?? "need_more",
      draft: parsed.draft ? { ...parsed.draft, estimated: true } : null,
      activity: parsed.activity ?? null,
    });
  } catch (e) {
    console.error("tell-nutrio", e);
    return json({ error: "Something went wrong." }, 500);
  }
});
