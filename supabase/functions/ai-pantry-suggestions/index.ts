import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PantryContext {
  ingredients: string[];
  caloriesRemaining: number;
  calorieTarget: number;
  proteinGap: number;
  dietPreference: string;
  cuisinePreference: string;
  allergies: string[];
  excludedFoods: string[];
  goal: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const context: PantryContext = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!context.ingredients || context.ingredients.length === 0) {
      return new Response(JSON.stringify({ error: 'No ingredients provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are Nutrio AI. The user tells you which food items they already have at home. Suggest meals they can actually cook with those items.

AVAILABLE INGREDIENTS: ${context.ingredients.join(', ')}

USER CONTEXT:
- Daily calorie target: ${context.calorieTarget} kcal
- Calories remaining today: ${context.caloriesRemaining} kcal
- Protein gap: ${context.proteinGap}g
- Goal: ${context.goal}
- Diet preference: ${context.dietPreference}
- Cuisine bias (soft, never restrictive): ${context.cuisinePreference}
- Allergies (STRICT, never include): ${context.allergies.join(', ') || 'none'}
- Excluded foods (STRICT): ${context.excludedFoods.join(', ') || 'none'}

RULES:
- Every meal must be primarily built from the listed ingredients.
- You may assume basic staples: salt, pepper, common spices, oil, water.
- List any extra item that is NOT in the pantry under "missingItems" (keep it to 0-2 cheap items).
- Total calories per meal must fit within the calories remaining where possible.
- Respect diet preference and never break allergies/exclusions.
- Return 3 to 5 meals, ordered best-fit first.

Return ONLY valid JSON in this exact shape:
{
  "meals": [
    {
      "name": "Meal name",
      "description": "One short sentence on how to make it",
      "usesIngredients": ["ingredient", "ingredient"],
      "missingItems": [],
      "calories": 450,
      "protein": 32,
      "carbs": 40,
      "fat": 15,
      "prepTime": "15 min",
      "fitNote": "Why this fits today's targets",
      "emoji": "🍲"
    }
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'What can I cook with what I have right now?' },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content ?? '';

    let parsed;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      parsed = JSON.parse((jsonMatch ? jsonMatch[1] : content).trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, content);
      throw new Error('Failed to parse pantry suggestions');
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-pantry-suggestions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
