import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { clientFor, corsHeaders } from "../_shared/userContext.ts";

// Turns a spoken/typed sentence like "I had a chicken wrap and a side salad"
// into rough meal items. Nutrition is always an ESTIMATE.
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
    if (!userData?.user) return json({ error: "Not authenticated" }, 401);

    const { text, mealType } = await req.json();
    if (typeof text !== "string" || text.trim().length < 2) {
      return json({ error: "Please describe what you ate." }, 400);
    }

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI is not configured right now." }, 500);

    const prompt = `A user described a meal in their own words. Break it into individual food items with ROUGH nutrition estimates for typical UK portions.

Description: "${text.slice(0, 500)}"
${mealType ? `They said this was their ${mealType}.` : ""}

Return ONLY JSON:
{"meal_type":"breakfast|lunch|dinner|snack","portion_size":"small|medium|large","summary":"a short natural sentence e.g. 'a chicken wrap and side salad'","confidence":0.0-1.0,"items":[{"name":"Chicken wrap","portion_size":"medium","calories":420,"protein":28,"carbs":45,"fat":14,"fibre":4}]}

Rules: British English. Use sensible everyday portions. Never return zero items — if unsure, make a reasonable single-item estimate.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You estimate nutrition from short meal descriptions. Reply with JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return json({ error: "Nutrio is busy — try again in a moment." }, 429);
      if (res.status === 402) return json({ error: "AI credits have run out." }, 402);
      console.error("gateway error", res.status, await res.text());
      return json({ error: "Nutrio couldn't read that just now." }, 502);
    }

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return json({ error: "Nutrio couldn't read that just now." }, 502);

    const parsed = JSON.parse(match[0]);
    return json({ ...parsed, estimated: true });
  } catch (e) {
    console.error("parse-meal-text", e);
    return json({ error: "Something went wrong reading that." }, 500);
  }
});
