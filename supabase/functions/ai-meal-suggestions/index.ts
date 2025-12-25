import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserProfile {
  calorie_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  activity_level: string;
  diet_preference: string;
  allergies: string[];
  excluded_foods: string[];
  goal: string;
}

interface MealRequest {
  mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  userProfile: UserProfile;
  caloriesRemaining: number;
  todaysMeals?: { meal_type: string; food_name: string; calories: number }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mealType, userProfile, caloriesRemaining, todaysMeals } = await req.json() as MealRequest;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Calculate meal calorie range
    const mealCalorieRanges = {
      breakfast: { min: 300, max: 500 },
      lunch: { min: 400, max: 600 },
      snacks: { min: 100, max: 300 },
      dinner: { min: 450, max: 700 },
    };

    const range = mealCalorieRanges[mealType];
    const targetCalories = Math.min(
      Math.round((range.min + range.max) / 2),
      caloriesRemaining
    );

    // Build Nutrio-specific system prompt
    const systemPrompt = `You are Nutrio AI, a British nutrition coach. You help UK users eat better without changing their lives.

CRITICAL RULES:
- Always explain WHY before WHAT (1-2 sentences explaining the importance of this meal)
- Provide exactly 3 meal options
- Include estimated calories for each option
- End with ONE follow-up question
- Use British English, British foods, calm and practical tone
- NEVER sound like an advertisement
- NEVER use extreme diet language

MEAL-SPECIFIC RULES:
${mealType === 'breakfast' ? `
- You MAY recommend Nutrio Protein Pancakes as ONE option (mark as AI-Preferred)
- ALWAYS include 2 non-Nutrio alternatives
- Use UK breakfast foods: eggs on toast, porridge, yogurt, fruit, cereal
` : ''}
${mealType === 'lunch' ? `
- NEVER promote Nutrio products
- Only normal UK lunches: wraps, sandwiches, salads, soups, jacket potatoes, meal deals
- Must fit office and "meal deal" lifestyles
` : ''}
${mealType === 'snacks' ? `
- Mostly whole-food options
- Nutrio products ONLY if user needs quick high-protein option
- Never pushy
` : ''}
${mealType === 'dinner' ? `
- Normal UK dinners only
- Protein + veg + carbs format
- NO meal replacement language
- NO Nutrio product promotion
` : ''}

USER CONTEXT:
- Goal: ${userProfile.goal}
- Calorie target: ${userProfile.calorie_target} kcal/day
- Protein target: ${userProfile.protein_target}g
- Activity level: ${userProfile.activity_level}
- Diet preference: ${userProfile.diet_preference || 'none'}
- Allergies: ${userProfile.allergies?.join(', ') || 'none'}
- Excluded foods: ${userProfile.excluded_foods?.join(', ') || 'none'}
- Calories remaining today: ${caloriesRemaining} kcal
- Target for this meal: ${targetCalories} kcal
${todaysMeals?.length ? `- Already logged today: ${todaysMeals.map(m => `${m.meal_type}: ${m.food_name}`).join(', ')}` : ''}

RESPONSE FORMAT (JSON):
{
  "explanation": "1-2 sentence explanation of why this meal matters",
  "options": [
    {
      "name": "Meal name",
      "description": "Brief description (1 sentence)",
      "calories": 400,
      "isNutrio": false
    }
  ],
  "followUpQuestion": "One helpful question about their eating habits"
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
          { role: 'user', content: `Generate ${mealType} suggestions for this user.` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please top up your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    console.log('Raw AI response:', content);

    // Parse JSON from response (handle markdown code blocks)
    let parsedContent;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedContent = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return fallback response
      parsedContent = {
        explanation: "Here are some balanced options for your meal.",
        options: [
          { name: "Option 1", description: "A balanced choice", calories: targetCalories, isNutrio: false },
          { name: "Option 2", description: "Another good option", calories: targetCalories - 50, isNutrio: false },
          { name: "Option 3", description: "A lighter alternative", calories: targetCalories - 100, isNutrio: false },
        ],
        followUpQuestion: "What time do you usually have this meal?"
      };
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-meal-suggestions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});