import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { image_base64, meal_type, enrollment_id, photo_url, cooking_method, used_oil_butter, is_restaurant } = await req.json();

    if (!image_base64 && !photo_url) {
      return new Response(JSON.stringify({ error: "Image required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If we have additional context (cooking method etc), do a refined analysis
    const contextPrompt = cooking_method || used_oil_butter !== undefined || is_restaurant !== undefined
      ? `\nAdditional context:
- Cooking method: ${cooking_method || "unknown"}
- Used oil/butter: ${used_oil_butter !== undefined ? (used_oil_butter ? "yes" : "no") : "unknown"}
- Restaurant or homemade: ${is_restaurant !== undefined ? (is_restaurant ? "restaurant" : "homemade") : "unknown"}
Please adjust your calorie/macro estimates based on this context.`
      : "";

    const systemPrompt = `You are a strict nutrition analyst for a weight loss accountability program.
Analyze the food image and provide precise nutritional estimates.
Be conservative with estimates - when uncertain, estimate higher calories.
${contextPrompt}

Respond ONLY with a JSON object (no markdown):
{
  "food_items": [{"name": "item name", "estimated_grams": 100}],
  "total_calories": 500,
  "protein_g": 30,
  "carbs_g": 50,
  "fat_g": 15,
  "fibre_g": 5,
  "portion_size": "medium",
  "confidence": "high|medium|low",
  "notes": "brief notes about the meal",
  "follow_up_questions": ["How was this cooked?", "Was oil or butter used?"]
}`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    if (image_base64) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Analyze this meal photo for nutritional content:" },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image_base64}` } },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: `Analyze the meal at this URL: ${photo_url}`,
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      analysis = null;
    }

    if (!analysis) {
      return new Response(JSON.stringify({ error: "Failed to parse AI analysis", raw: content }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If we have enrollment_id, save to meal_photos
    if (enrollment_id && photo_url) {
      const { error: insertError } = await supabase.from("meal_photos").insert({
        user_id: user.id,
        enrollment_id,
        meal_type: meal_type || "snacks",
        photo_url,
        ai_food_items: analysis.food_items,
        ai_calories: analysis.total_calories,
        ai_protein: analysis.protein_g,
        ai_carbs: analysis.carbs_g,
        ai_fat: analysis.fat_g,
        ai_fibre: analysis.fibre_g,
        ai_portion_size: analysis.portion_size,
        cooking_method: cooking_method || null,
        used_oil_butter: used_oil_butter ?? null,
        is_restaurant: is_restaurant ?? null,
        user_confirmed: !!(cooking_method),
      });

      if (insertError) {
        console.error("Insert error:", insertError);
      }
    }

    return new Response(JSON.stringify({ analysis }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Meal analyze error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
