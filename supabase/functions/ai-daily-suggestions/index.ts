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

    const systemPrompt = `You are Nutrio AI, an intelligent nutrition coach. Generate personalized meal suggestions that adapt to the user's current nutritional state.

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

Generate ONE optimal meal suggestion for each of these meals: ${mealsToGenerate.join(', ')}

IMPORTANT RULES:
1. Each meal MUST fit within the remaining calorie budget distributed appropriately
2. Prioritize protein if gap is significant (${proteinGap}g needed)
3. Suggest lighter meals if calories are running high
4. Suggest more substantial meals if user is very active
5. Avoid foods already eaten today
6. Respect allergies and excluded foods strictly
7. Make meals practical and home-cookable

CALORIE DISTRIBUTION:
- Breakfast: ~25% of daily target (${Math.round(context.calorieTarget * 0.25)} kcal)
- Lunch: ~30% of daily target (${Math.round(context.calorieTarget * 0.30)} kcal)
- Snacks: ~15% of daily target (${Math.round(context.calorieTarget * 0.15)} kcal)
- Dinner: ~30% of daily target (${Math.round(context.calorieTarget * 0.30)} kcal)

Adjust these if meals have already been eaten to distribute remaining calories appropriately.

RESPONSE FORMAT (strict JSON, no markdown):
{
  "breakfast": {
    "name": "Meal name",
    "description": "Why this meal is perfect for you right now (1-2 sentences)",
    "calories": 450,
    "protein": 25,
    "carbs": 45,
    "fat": 15,
    "prepTime": "20 min",
    "emoji": "🍳"
  },
  "lunch": {...},
  "snacks": {...},
  "dinner": {...}
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
          { role: 'user', content: `Generate the optimal meal suggestions for ${mealsToGenerate.join(', ')} based on my current nutritional state. Remember to explain WHY each meal is good for me.` }
        ],
        temperature: 0.7,
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
