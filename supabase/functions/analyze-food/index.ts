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
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing food image with AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `You are an expert nutritionist and food analyst with extensive knowledge of international cuisines and their nutritional values. Your analysis must be:
- HIGHLY ACCURATE: Use USDA and international food databases as reference
- COMPREHENSIVE: Identify ALL food items visible, including small garnishes, condiments, and ingredients
- PRECISE: Provide exact portion sizes in standard measurements (grams, ounces, cups, pieces)
- DETAILED: Break down complex dishes into individual components
- CONTEXTUAL: Consider cooking methods (fried, baked, grilled) that affect caloric content
- SCIENTIFIC: Use verified nutritional data for your estimates`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Perform a THOROUGH nutritional analysis of this food image. Follow these steps:

1. IDENTIFY ALL FOOD ITEMS:
   - Main dishes, sides, and accompaniments
   - Small items like herbs, sauces, toppings, and garnishes
   - Hidden ingredients (oils, butter, seasonings)
   - Beverages if present

2. ESTIMATE PORTIONS ACCURATELY:
   - Use visual references (plate size, utensils) for scale
   - Provide measurements in common units (e.g., "150g", "1 medium piece", "2 tablespoons")
   - Consider density and weight of different foods

3. CALCULATE NUTRITIONAL VALUES:
   - Calories: Total energy content
   - Protein: In grams, with 1 decimal precision
   - Carbs: Total carbohydrates in grams, with 1 decimal precision
   - Fats: Total fats in grams, with 1 decimal precision
   - Fiber: Dietary fiber in grams, with 1 decimal precision

4. ACCOUNT FOR COOKING METHODS:
   - Added oils or butter in cooking
   - Breading or coating
   - Preparation style impact on nutrition

Provide highly accurate estimates based on standard food databases (USDA, international nutrition data). Be as precise as possible with portion sizes and nutritional values.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_food',
              description: 'Analyze food in an image and return nutritional information',
              parameters: {
                type: 'object',
                properties: {
                  foods: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        portion: { type: 'string' },
                        calories: { type: 'number' },
                        protein: { type: 'number' },
                        carbs: { type: 'number' },
                        fats: { type: 'number' },
                        fiber: { type: 'number' }
                      },
                      required: ['name', 'portion', 'calories', 'protein', 'carbs', 'fats', 'fiber'],
                      additionalProperties: false
                    }
                  },
                  total: {
                    type: 'object',
                    properties: {
                      calories: { type: 'number' },
                      protein: { type: 'number' },
                      carbs: { type: 'number' },
                      fats: { type: 'number' },
                      fiber: { type: 'number' }
                    },
                    required: ['calories', 'protein', 'carbs', 'fats', 'fiber'],
                    additionalProperties: false
                  }
                },
                required: ['foods', 'total'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'analyze_food' } }
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

    // Extract structured output from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function.arguments) {
      throw new Error('No valid food analysis returned');
    }

    const analysisResult = JSON.parse(toolCall.function.arguments);
    console.log('Food analysis result:', analysisResult);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing food:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
