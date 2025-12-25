import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserContext {
  caloriesRemaining: number;
  proteinGap: number;
  activityLevel: string;
  dietPreference: string;
  goalFilter: 'balanced' | 'highProtein' | 'lightClean' | 'quickMeals' | 'comfortFood';
  cuisinePreference: 'global' | 'indian' | 'british' | 'mediterranean' | 'asian' | 'middleEastern' | 'continental' | 'mixed';
  allergies: string[];
  excludedFoods: string[];
  goal: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const context: UserContext = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Goal filter instructions
    const goalInstructions: Record<string, string> = {
      balanced: 'Focus on well-rounded meals with balanced macros, moderate portions, and variety.',
      highProtein: 'Prioritize high-protein meals (minimum 30g protein per serving). Include lean meats, fish, eggs, legumes, dairy.',
      lightClean: 'Focus on light, clean eating. Emphasis on vegetables, lean proteins, whole grains. Lower calorie density.',
      quickMeals: 'Prioritize quick meals that can be prepared in under 15 minutes. Simple ingredients, minimal cooking.',
      comfortFood: 'Include comforting, satisfying meals. Can be heartier but still nutritious. Warming, filling options.',
    };

    // Cuisine preference as a soft bias
    const cuisineGuides: Record<string, string> = {
      global: 'Draw from diverse global cuisines. No specific regional focus.',
      indian: 'Gently bias towards Indian cuisine flavors and dishes when appropriate (dal, curry, roti, paneer, biryani). But prioritize nutrition goals over cuisine.',
      british: 'Gently bias towards British cuisine when appropriate (roasts, pies, jacket potatoes, fish). But prioritize nutrition goals over cuisine.',
      mediterranean: 'Gently bias towards Mediterranean cuisine (olive oil, fish, vegetables, grains, hummus). But prioritize nutrition goals over cuisine.',
      asian: 'Gently bias towards Asian cuisines (stir-fries, rice, noodles, tofu, soy-based). But prioritize nutrition goals over cuisine.',
      middleEastern: 'Gently bias towards Middle Eastern cuisine (falafel, hummus, kebabs, grains). But prioritize nutrition goals over cuisine.',
      continental: 'Gently bias towards Continental European cuisine (French, Italian, German influences). But prioritize nutrition goals over cuisine.',
      mixed: 'Mix different cuisines for variety. No single regional focus.',
    };

    const systemPrompt = `You are Nutrio AI, a nutrition-first assistant. Generate personalized meal suggestions.

USER CONTEXT:
- Calories remaining today: ${context.caloriesRemaining} kcal
- Protein gap: ${context.proteinGap}g needed
- Activity level: ${context.activityLevel}
- Diet preference: ${context.dietPreference || 'none'}
- Goal: ${context.goal}
- Allergies: ${context.allergies?.join(', ') || 'none'}
- Excluded foods: ${context.excludedFoods?.join(', ') || 'none'}

GOAL FILTER: ${context.goalFilter}
${goalInstructions[context.goalFilter] || goalInstructions.balanced}

CUISINE PREFERENCE (soft bias only): ${context.cuisinePreference}
${cuisineGuides[context.cuisinePreference] || cuisineGuides.global}

IMPORTANT: Nutrition goals ALWAYS take priority over cuisine preferences. The AI can override cuisine choice if required for the user's nutritional needs.

Generate 4 categories of meal suggestions. Each category should have 2-3 meals.
Meals should be practical, home-cookable, and match the user's context.

RESPONSE FORMAT (JSON):
{
  "bestForYou": [
    {
      "name": "Meal name",
      "description": "Brief description",
      "calories": 350,
      "protein": 25,
      "prepTime": "20 min",
      "emoji": "🍛"
    }
  ],
  "highProtein": [...],
  "quickMeals": [...],
  "budgetFriendly": [...]
}

Rules:
- "bestForYou": Personalized based on calories remaining, goals, and current filter
- "highProtein": Focus on protein gap, minimum 25g protein per meal
- "quickMeals": Under 15 minutes prep time
- "budgetFriendly": Use affordable ingredients
- All meals must respect allergies and excluded foods
- Use appropriate emojis for each meal
- Keep suggestions globally accessible and inclusive`;

    console.log('Generating diet suggestions with context:', {
      goalFilter: context.goalFilter,
      cuisinePreference: context.cuisinePreference,
      caloriesRemaining: context.caloriesRemaining,
      proteinGap: context.proteinGap,
    });

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
          { role: 'user', content: 'Generate personalized meal suggestions for me.' }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    console.log('Raw AI response:', content);

    // Parse JSON from response
    let parsedContent;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedContent = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse meal suggestions');
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-diet-suggestions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
