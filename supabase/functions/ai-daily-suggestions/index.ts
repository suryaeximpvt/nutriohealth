import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserContext {
  calorieTarget: number;
  caloriesRemaining: number;
  proteinTarget: number;
  proteinConsumed: number;
  carbsTarget: number;
  carbsConsumed: number;
  fatTarget: number;
  fatConsumed: number;
  activityLevel: string;
  dietPreference: string;
  culturalPreference: 'indian' | 'uk' | 'mixed';
  allergies: string[];
  excludedFoods: string[];
  goal: string;
  previousMeals: { meal_type: string; food_name: string; calories: number }[];
  timeOfDay: string;
  steps?: number;
  regenerateMeal?: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
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

    // Calculate nutritional gaps
    const proteinGap = context.proteinTarget - context.proteinConsumed;
    const carbsGap = context.carbsTarget - context.carbsConsumed;
    const fatGap = context.fatTarget - context.fatConsumed;
    
    // Determine meal priorities based on gaps
    const priorities: string[] = [];
    if (proteinGap > 20) priorities.push('high-protein meals');
    if (context.caloriesRemaining < 500) priorities.push('lighter, lower-calorie options');
    if (context.caloriesRemaining > 1500) priorities.push('satisfying, nutrient-dense meals');
    if (context.activityLevel === 'very_active' || (context.steps && context.steps > 10000)) {
      priorities.push('higher carb options for energy');
    }
    if (context.activityLevel === 'sedentary' || (context.steps && context.steps < 3000)) {
      priorities.push('lower carb, higher protein options');
    }

    const cultureGuide = context.culturalPreference === 'indian' 
      ? 'Focus on Indian cuisine: dal, roti, paneer, chicken tikka, biryani, dosa, idli, curries, paratha. Use familiar Indian spices and cooking styles.'
      : context.culturalPreference === 'uk'
      ? 'Focus on British cuisine: roasts, pies, fish & chips (healthier versions), jacket potatoes, full English (healthy), sandwiches, salads, soups.'
      : 'Mix of Indian and British options to give variety.';

    const mealsToGenerate = context.regenerateMeal 
      ? [context.regenerateMeal]
      : ['breakfast', 'lunch', 'snacks', 'dinner'];

    const previousMealsText = context.previousMeals.length > 0
      ? `\nAlready eaten today:\n${context.previousMeals.map(m => `- ${m.food_name} (${m.calories} kcal) for ${m.meal_type}`).join('\n')}`
      : '\nNo meals logged yet today.';

    const systemPrompt = `You are Nutrio AI, an intelligent nutrition coach for the UK market. Generate personalized meal suggestions with MULTIPLE OPTIONS per meal.

USER CONTEXT:
- Daily calorie goal: ${context.calorieTarget} kcal
- Calories remaining: ${context.caloriesRemaining} kcal
- Protein gap: ${proteinGap}g remaining (target: ${context.proteinTarget}g)
- Carbs gap: ${carbsGap}g remaining
- Fat gap: ${fatGap}g remaining
- Activity level: ${context.activityLevel}
- Steps today: ${context.steps || 'Unknown'}
- Diet preference: ${context.dietPreference || 'none'}
- Goal: ${context.goal}
- Allergies: ${context.allergies?.join(', ') || 'none'}
- Excluded foods: ${context.excludedFoods?.join(', ') || 'none'}
- Time of day: ${context.timeOfDay}
${previousMealsText}

CULTURAL PREFERENCE: ${context.culturalPreference}
${cultureGuide}

NUTRITIONAL PRIORITIES: ${priorities.length > 0 ? priorities.join(', ') : 'balanced nutrition'}

CRITICAL REQUIREMENT - MULTIPLE OPTIONS:
For EACH meal, generate 3-4 options where:
- The "primary" option is the TOP AI recommendation (NO Nutrio product for primary)
- The "alternatives" array contains 2-3 other options
- EXACTLY ONE option (either primary or in alternatives) MAY include a Nutrio product
- All other options must be WHOLE FOOD meals only

NUTRIO PRODUCT RULES:
1. Maximum ONE Nutrio product option per meal
2. Nutrio option should NOT be the primary/default recommendation
3. Mark Nutrio options clearly with the "nutrioProduct" field
4. Nutrio products are SUPPORTIVE, not the main focus
5. Include Nutrio option only for BREAKFAST and SNACKS, never for lunch/dinner

Available Nutrio products (for breakfast/snacks alternatives only):
BREAKFAST: "Nutrio Protein Pancake Mix", "Nutrio Breakfast Smoothie", "Nutrio Overnight Oats Cup"
SNACKS: "Nutrio Protein Bar", "Nutrio Nut Mix", "Nutrio Shake Sachet"

IMPORTANT RULES:
1. Each meal MUST fit within the remaining calorie budget distributed appropriately
2. Prioritize protein if gap is significant (${proteinGap}g needed)
3. Primary option should always be a whole-food meal
4. Make meals practical and home-cookable
5. Avoid foods already eaten today
6. Respect allergies and excluded foods strictly

CALORIE DISTRIBUTION:
- Breakfast: ~25% of daily target (${Math.round(context.calorieTarget * 0.25)} kcal)
- Lunch: ~30% of daily target (${Math.round(context.calorieTarget * 0.30)} kcal)
- Snacks: ~15% of daily target (${Math.round(context.calorieTarget * 0.15)} kcal)
- Dinner: ~30% of daily target (${Math.round(context.calorieTarget * 0.30)} kcal)

RESPONSE FORMAT (strict JSON, no markdown):
{
  "breakfast": {
    "primary": {
      "name": "Whole food meal name",
      "description": "Why this is perfect for you",
      "nutrioProduct": null,
      "calories": 400,
      "protein": 25,
      "carbs": 45,
      "fat": 15,
      "prepTime": "15 min",
      "emoji": "🍳"
    },
    "alternatives": [
      {
        "name": "Alternative whole food meal",
        "description": "Why this is a good option",
        "nutrioProduct": null,
        "calories": 380,
        "protein": 22,
        "carbs": 40,
        "fat": 14,
        "prepTime": "10 min",
        "emoji": "🥣"
      },
      {
        "name": "AI alternative using Nutrio Protein Pancake Mix",
        "description": "Quick protein boost with Nutrio Protein Pancake Mix",
        "nutrioProduct": "Nutrio Protein Pancake Mix",
        "calories": 420,
        "protein": 28,
        "carbs": 42,
        "fat": 12,
        "prepTime": "12 min",
        "emoji": "🥞"
      }
    ]
  },
  "lunch": {
    "primary": {
      "name": "Whole food lunch",
      "description": "Nutritious midday meal",
      "nutrioProduct": null,
      "calories": 550,
      "protein": 35,
      "carbs": 55,
      "fat": 18,
      "prepTime": "25 min",
      "emoji": "🥗"
    },
    "alternatives": [
      {
        "name": "Alternative lunch option",
        "description": "Another great choice",
        "nutrioProduct": null,
        "calories": 520,
        "protein": 32,
        "carbs": 50,
        "fat": 16,
        "prepTime": "20 min",
        "emoji": "🍲"
      }
    ]
  },
  "snacks": {
    "primary": {
      "name": "Whole food snack",
      "description": "Healthy snacking option",
      "nutrioProduct": null,
      "calories": 180,
      "protein": 12,
      "carbs": 20,
      "fat": 6,
      "prepTime": "5 min",
      "emoji": "🍎"
    },
    "alternatives": [
      {
        "name": "Another healthy snack",
        "description": "Quick energy boost",
        "nutrioProduct": null,
        "calories": 160,
        "protein": 8,
        "carbs": 18,
        "fat": 5,
        "prepTime": "2 min",
        "emoji": "🥜"
      },
      {
        "name": "AI alternative using Nutrio Protein Bar",
        "description": "Convenient protein with Nutrio Protein Bar",
        "nutrioProduct": "Nutrio Protein Bar",
        "calories": 180,
        "protein": 15,
        "carbs": 18,
        "fat": 7,
        "prepTime": "0 min",
        "emoji": "🍫"
      }
    ]
  },
  "dinner": {
    "primary": {
      "name": "Whole food dinner",
      "description": "Satisfying evening meal",
      "nutrioProduct": null,
      "calories": 600,
      "protein": 40,
      "carbs": 50,
      "fat": 20,
      "prepTime": "35 min",
      "emoji": "🍽️"
    },
    "alternatives": [
      {
        "name": "Alternative dinner",
        "description": "Lighter option",
        "nutrioProduct": null,
        "calories": 550,
        "protein": 38,
        "carbs": 45,
        "fat": 18,
        "prepTime": "30 min",
        "emoji": "🥘"
      }
    ]
  }
}

Only include the meals requested: ${mealsToGenerate.join(', ')}`;

    console.log('Generating daily suggestions with context:', {
      caloriesRemaining: context.caloriesRemaining,
      proteinGap,
      activityLevel: context.activityLevel,
      culturalPreference: context.culturalPreference,
      mealsToGenerate,
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
          { role: 'user', content: `Generate multiple meal options for ${mealsToGenerate.join(', ')} based on my current nutritional state. Remember: primary option should be whole food, with Nutrio product as ONE alternative option only for breakfast/snacks.` }
        ],
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
    console.error('Error in ai-daily-suggestions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
