import OpenAI from 'openai'
import { ChatCompletionContentPart } from 'openai/resources/chat/completions'
import { GLOW_UP_SYSTEM_PROMPT } from './prompts'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/**
 * Robust JSON extraction from AI response text
 * Handles malformed responses with fallback parsing
 */
function extractJson(text: string): Record<string, unknown> {
  if (!text || typeof text !== 'string') {
    console.warn('extractJson: received empty or non-string input')
    return {}
  }

  const trimmed = text.trim()

  // Attempt 1: Direct parse
  try {
    return JSON.parse(trimmed)
  } catch (e) {
    console.warn('extractJson: direct parse failed, attempting regex extraction')
  }

  // Attempt 2: Extract JSON block using regex
  try {
    const match = trimmed.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('extractJson: no JSON block found in response')
      return {}
    }
    return JSON.parse(match[0])
  } catch (e) {
    console.error('extractJson: failed to parse extracted JSON block', e)
    return {}
  }
}

/**
 * Build typed message content for Chat Completions API
 * Properly constructs text and image_url blocks with OpenAI types
 */
function buildMessageContent(input: {
  name: string
  age: string
  goal: string
  lifestyle: string
  stylePreference: string
  images: string[]
}): ChatCompletionContentPart[] {
  const content: ChatCompletionContentPart[] = [
    {
      type: 'text',
      text: JSON.stringify({
        client: {
          name: input.name,
          age: input.age,
          goal: input.goal,
          lifestyle: input.lifestyle,
          stylePreference: input.stylePreference,
        },
        instruction: 'Analyze the attached images and generate the complete Glow-Up Blueprint JSON.',
      }),
    },
  ]

  // Add up to 4 images with optimized detail levels
  if (Array.isArray(input.images)) {
    for (const imageUrl of input.images.slice(0, 4)) {
      if (typeof imageUrl === 'string' && imageUrl.trim()) {
        content.push({
          type: 'image_url',
          image_url: {
            url: imageUrl,
            detail: 'low', // Reduces token usage while maintaining quality
          },
        } as ChatCompletionContentPart)
      }
    }
  }

  return content
}

/**
 * Generate a Glow-Up report from customer profile and images
 * Uses Chat Completions API with proper typing and error handling
 */
export async function createGlowReport(input: {
  name: string
  age: string
  goal: string
  lifestyle: string
  stylePreference: string
  images: string[]
}): Promise<Record<string, unknown>> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  if (!input.name || !input.age || !input.goal) {
    throw new Error('Missing required fields: name, age, goal')
  }

  if (!Array.isArray(input.images) || input.images.length === 0) {
    throw new Error('At least one image is required')
  }

  try {
    const messageContent = buildMessageContent(input)

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: GLOW_UP_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: messageContent,
        },
      ],
      temperature: 0.35,
      max_tokens: 4000,
    })

    // Extract response content
    const responseText = response.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No content in OpenAI response')
    }

    // Parse JSON with fallback handling
    const report = extractJson(responseText)

    // Validate report structure
    if (!report || Object.keys(report).length === 0) {
      throw new Error('Failed to extract valid JSON from response')
    }

    // Validate required fields
    if (!report.archetype_summary || !report.hair_plan || !report.skin_plan) {
      console.warn('createGlowReport: report missing expected sections', {
        hasArchetype: !!report.archetype_summary,
        hasHair: !!report.hair_plan,
        hasSkin: !!report.skin_plan,
      })
    }

    return report
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate Glow-Up report: ${error.message}`)
    }
    throw error
  }
}
