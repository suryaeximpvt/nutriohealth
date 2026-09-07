import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are Nutrio's food photo analyst for a UK audience.
Look at the photo and describe what the person most likely ate.

Return ONLY JSON in this exact shape:
{
  "meal_type": "breakfast" | "lunch" | "dinner" | "snack",
  "portion_size": "small" | "medium" | "large",
  "ingredients": ["short ingredient names"],
  "items": [
    {
      "name": "specific dish or food name",
      "portion_size": "small" | "medium" | "large",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fibre": number
    }
  ],
  "confidence": number between 0 and 1
}

Rules:
- Split visibly distinct foods into separate items (e.g. curry, rice, salad).
- Use UK portion conventions and everyday UK/multicultural foods.
- All values are rough estimates, never medical or exact.
- If no food is visible, return {"items": [], "confidence": 0}.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image, mealTypeHint, timeOfDay } = await req.json();
    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({ error: "An image is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyse this food photo. Local time of day: ${timeOfDay ?? "unknown"}. Suggested meal type: ${mealTypeHint ?? "unknown"}.`,
              },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("AI gateway error", res.status, text);
      if (res.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests right now. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (res.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits are exhausted for this workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${res.status}`);
    }

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";

    let parsed: Record<string, unknown>;
    try {
      const match = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      parsed = JSON.parse((match ? match[1] : content).trim());
    } catch (_e) {
      console.error("Could not parse AI output", content);
      return new Response(JSON.stringify({ analysis: null, error: "Could not read the photo" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ analysis: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-food-snap error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
