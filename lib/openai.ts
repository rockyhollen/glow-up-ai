import OpenAI from 'openai';
import { GLOW_UP_SYSTEM_PROMPT } from './prompts';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try { return JSON.parse(trimmed); } catch {}
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Model did not return JSON.');
  return JSON.parse(match[0]);
}

export async function createGlowReport(input: {
  name: string;
  age: string;
  goal: string;
  lifestyle: string;
  stylePreference: string;
  images: string[];
}) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing.');

  const content: any[] = [
    {
      type: 'input_text',
      text: JSON.stringify({
        client: {
          name: input.name,
          age: input.age,
          goal: input.goal,
          lifestyle: input.lifestyle,
          stylePreference: input.stylePreference
        },
        instruction: 'Analyze the attached images and generate the complete Glow-Up Blueprint JSON.'
      })
    },
    ...input.images.map((image) => ({ type: 'input_image', image_url: image }))
  ];

  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-4.1',
    input: [
      { role: 'system', content: GLOW_UP_SYSTEM_PROMPT },
      { role: 'user', content }
    ],
    temperature: 0.35
  } as any);

  const text = (response as any).output_text || '';
  return extractJson(text);
}
