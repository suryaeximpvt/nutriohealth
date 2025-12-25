import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, history } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Nutrio AI, a friendly and knowledgeable nutrition and fitness coach. You provide personalized advice based on the user's goals and current progress.

User Context:
- Goal: ${context.goal?.replace("_", " ") || "general health"}
- Daily Calorie Target: ${context.calorieTarget} kcal
- Calories Consumed Today: ${context.caloriesConsumed} kcal
- Calories Remaining: ${context.caloriesRemaining} kcal
- Protein Target: ${context.proteinTarget}g
- Protein Consumed: ${Math.round(context.proteinConsumed)}g
- Activity Level: ${context.activityLevel}
- Diet Preference: ${context.dietPreference || "no restrictions"}
- Allergies: ${context.allergies?.length > 0 ? context.allergies.join(", ") : "none"}

Guidelines:
1. Be encouraging and supportive
2. Give specific, actionable advice
3. Consider the user's remaining calories and macros when suggesting foods
4. Respect dietary preferences and allergies
5. Keep responses concise but helpful (2-3 paragraphs max)
6. Use emojis sparingly to keep it friendly
7. Suggest global foods, not limited to any region
8. If asked about exercises, provide beginner-friendly options`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          response: "I'm getting too many requests right now. Please try again in a moment! 🙏" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          response: "AI services are temporarily unavailable. Please try again later." 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(JSON.stringify({ 
      response: "I'm having trouble connecting right now. Please try again in a moment." 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
