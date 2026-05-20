import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PROFILE } from '@/lib/profile';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const foodTool: Anthropic.Tool = {
  name: 'confirm_food_log',
  description: 'Call this when the user has confirmed the food entry is correct and you have all the nutritional details',
  input_schema: {
    type: 'object',
    properties: {
      description: { type: 'string', description: 'Food description with serving size' },
      mealType: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
      calories: { type: 'number', description: 'Total calories' },
      protein: { type: 'number', description: 'Protein in grams' },
      carbs: { type: 'number', description: 'Carbohydrates in grams' },
      fat: { type: 'number', description: 'Fat in grams' },
      fiber: { type: 'number', description: 'Fiber in grams' },
      sugar: { type: 'number', description: 'Sugar in grams' },
      sodium: { type: 'number', description: 'Sodium in milligrams' },
    },
    required: ['description', 'mealType', 'calories', 'protein', 'carbs', 'fat'],
  },
};

const exerciseTool: Anthropic.Tool = {
  name: 'confirm_exercise_log',
  description: 'Call this when the user has confirmed the exercise entry and you have estimated the calories burned',
  input_schema: {
    type: 'object',
    properties: {
      description: { type: 'string', description: 'Exercise description' },
      caloriesBurned: { type: 'number', description: 'Estimated calories burned' },
      durationMins: { type: 'number', description: 'Duration in minutes' },
    },
    required: ['description', 'caloriesBurned'],
  },
};

const weightTool: Anthropic.Tool = {
  name: 'confirm_weight_log',
  description: 'Call this when the user provides their weight to log',
  input_schema: {
    type: 'object',
    properties: {
      weight: { type: 'number', description: 'Weight in pounds' },
    },
    required: ['weight'],
  },
};

function getSystemPrompt(intent: string, context?: string): string {
  const age = PROFILE.getAge();
  const today = context ?? new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (intent === 'food') {
    return `You are a nutrition tracking assistant. The user will tell you what they ate. Your job is to estimate nutritional information accurately.

User profile: Height 5'10" (177.8cm), DOB 2002-12-01, Age: ${age}
Today: ${today}

When the user describes food:
1. Identify the food and typical serving size
2. Look up or estimate: calories, protein (g), carbs (g), fat (g), fiber (g), sugar (g), sodium (mg)
3. Present a clear summary and ask if that's right
4. Once they confirm, call the confirm_food_log tool
5. Ask what meal type (breakfast/lunch/dinner/snack) if not obvious from context

Be concise. Use your training knowledge for nutritional data — it's quite accurate for common foods and restaurant items.`;
  }

  if (intent === 'exercise') {
    return `You are a fitness tracking assistant. The user will describe their exercise. Your job is to estimate calories burned based on their profile.

User profile: Height 5'10" (177.8cm), DOB 2002-12-01, Age: ${age}, Male
Today: ${today}

When the user describes exercise:
1. Identify the exercise type and duration
2. Estimate calories burned using MET values based on the user's profile
3. Present your estimate and ask if it looks right
4. Once they confirm, call the confirm_exercise_log tool

Be concise and conversational. Ask for duration if not provided.`;
  }

  if (intent === 'weight') {
    return `You are a weight tracking assistant. The user wants to log their weight.

User profile: Height 5'10" (177.8cm), DOB 2002-12-01, Age: ${age}
Today: ${today}

When the user provides their weight:
1. Confirm the weight in pounds (ask if they said kg or stone)
2. Call the confirm_weight_log tool immediately once you have the weight in lbs
3. Optionally comment on their BMI or progress if you have context

Be concise and supportive.`;
  }

  return `You are a health and nutrition assistant helping the user track their diet, exercise, and weight. Today is ${today}.`;
}

function getToolsForIntent(intent: string): Anthropic.Tool[] {
  if (intent === 'food') return [foodTool];
  if (intent === 'exercise') return [exerciseTool];
  if (intent === 'weight') return [weightTool];
  return [foodTool, exerciseTool, weightTool];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, intent = 'food', context } = body as {
      messages: Anthropic.MessageParam[];
      intent: 'food' | 'exercise' | 'weight';
      context?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    const systemPrompt = getSystemPrompt(intent, context);
    const tools = getToolsForIntent(intent);

    // First API call
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    });

    // Check if Claude wants to use a tool
    const toolUseBlock = response.content.find((b) => b.type === 'tool_use') as Anthropic.ToolUseBlock | undefined;
    const textBlock = response.content.find((b) => b.type === 'text') as Anthropic.TextBlock | undefined;

    if (toolUseBlock) {
      const toolInput = toolUseBlock.input as Record<string, unknown>;
      const toolName = toolUseBlock.name;

      if (toolName === 'confirm_food_log') {
        // Send tool result back to get final confirmation message
        const updatedMessages: Anthropic.MessageParam[] = [
          ...messages,
          { role: 'assistant', content: response.content },
          {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: toolUseBlock.id,
                content: 'Food entry ready to save.',
              },
            ],
          },
        ];

        const finalResponse = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          system: systemPrompt,
          tools,
          messages: updatedMessages,
        });

        const finalText = finalResponse.content.find((b) => b.type === 'text') as Anthropic.TextBlock | undefined;

        return NextResponse.json({
          message: finalText?.text ?? 'Ready to log your food!',
          pending: {
            type: 'food',
            data: {
              description: toolInput.description as string,
              mealType: toolInput.mealType as string,
              calories: toolInput.calories as number,
              protein: toolInput.protein as number,
              carbs: toolInput.carbs as number,
              fat: toolInput.fat as number,
              fiber: toolInput.fiber as number | undefined,
              sugar: toolInput.sugar as number | undefined,
              sodium: toolInput.sodium as number | undefined,
            },
          },
        });
      }

      if (toolName === 'confirm_exercise_log') {
        const updatedMessages: Anthropic.MessageParam[] = [
          ...messages,
          { role: 'assistant', content: response.content },
          {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: toolUseBlock.id,
                content: 'Exercise entry ready to save.',
              },
            ],
          },
        ];

        const finalResponse = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          system: systemPrompt,
          tools,
          messages: updatedMessages,
        });

        const finalText = finalResponse.content.find((b) => b.type === 'text') as Anthropic.TextBlock | undefined;

        return NextResponse.json({
          message: finalText?.text ?? 'Ready to log your exercise!',
          pending: {
            type: 'exercise',
            data: {
              description: toolInput.description as string,
              caloriesBurned: toolInput.caloriesBurned as number,
              durationMins: toolInput.durationMins as number | undefined,
            },
          },
        });
      }

      if (toolName === 'confirm_weight_log') {
        const updatedMessages: Anthropic.MessageParam[] = [
          ...messages,
          { role: 'assistant', content: response.content },
          {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: toolUseBlock.id,
                content: 'Weight entry ready to save.',
              },
            ],
          },
        ];

        const finalResponse = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          system: systemPrompt,
          tools,
          messages: updatedMessages,
        });

        const finalText = finalResponse.content.find((b) => b.type === 'text') as Anthropic.TextBlock | undefined;

        return NextResponse.json({
          message: finalText?.text ?? 'Ready to log your weight!',
          pending: {
            type: 'weight',
            data: {
              weight: toolInput.weight as number,
            },
          },
        });
      }
    }

    // No tool use — just a conversational response
    return NextResponse.json({
      message: textBlock?.text ?? 'I didn\'t quite catch that. Could you try again?',
    });
  } catch (error) {
    console.error('POST /api/chat error:', error);
    return NextResponse.json({ error: 'Chat request failed' }, { status: 500 });
  }
}
