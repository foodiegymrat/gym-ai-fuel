import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { ingredients, cookingTime } = await req.json();
    
    if (!ingredients || !cookingTime) {
      throw new Error('Ingredients and cooking time are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating recipe with ingredients:', ingredients, 'and cooking time:', cookingTime);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a professional chef and recipe creator. Create detailed, easy-to-follow recipes with high protein content suitable for fitness goals.'
          },
          {
            role: 'user',
            content: `Create a detailed high-protein recipe using these ingredients: ${ingredients}. The recipe should take approximately ${cookingTime} minutes to prepare and cook. Return ONLY valid JSON in this exact format: {"title": "Recipe Name", "description": "Brief description", "servings": number, "difficulty": "Easy/Medium/Hard", "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity"], "instructions": ["step 1", "step 2", ...], "nutrition": {"calories": "X kcal", "protein": "X g", "carbs": "X g", "fats": "X g"}, "tips": ["tip 1", "tip 2"]}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_recipe',
              description: 'Generate a detailed high-protein recipe with cooking instructions',
              parameters: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  servings: { type: 'number' },
                  difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
                  ingredients: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  instructions: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  nutrition: {
                    type: 'object',
                    properties: {
                      calories: { type: 'string' },
                      protein: { type: 'string' },
                      carbs: { type: 'string' },
                      fats: { type: 'string' }
                    },
                    required: ['calories', 'protein', 'carbs', 'fats'],
                    additionalProperties: false
                  },
                  tips: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                },
                required: ['title', 'description', 'servings', 'difficulty', 'ingredients', 'instructions', 'nutrition', 'tips'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_recipe' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function.arguments) {
      throw new Error('No valid recipe returned');
    }

    const recipe = JSON.parse(toolCall.function.arguments);
    console.log('Recipe generated:', recipe.title);

    return new Response(
      JSON.stringify(recipe),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating recipe:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
