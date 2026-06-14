import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { ChatCompletionContentPart } from 'openai/resources/chat/completions'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const GLOW_UP_SYSTEM_PROMPT = `You are an elite men's appearance consultant. Give brutally honest, hyper-specific, actionable advice. Always respond with valid JSON only. No markdown, no preamble.`

function buildMessageContent(customer: any): ChatCompletionContentPart[] {
  const userContent: ChatCompletionContentPart[] = [
    {
      type: 'text',
      text: JSON.stringify({
        client: {
          goal: customer.goal || 'confidence',
          age_range: customer.age_range || '25-34',
          budget: customer.budget || 'mid',
          maintenance: customer.maintenance || 'moderate',
          style_pref: customer.style_pref || 'clean',
          concerns: (customer.concerns || []).join(', ') || 'none specified',
        },
        instruction: 'Analyze the attached images and intake info to generate the complete Glow-Up Blueprint JSON.',
      }),
    },
  ]

  // Add photos as image_url blocks with detail optimization
  if (customer.photo_urls && Array.isArray(customer.photo_urls)) {
    for (const photoUrl of customer.photo_urls.slice(0, 2)) {
      if (typeof photoUrl === 'string' && photoUrl.trim()) {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: photoUrl,
            detail: 'low',
          },
        } as ChatCompletionContentPart)
      }
    }
  }

  return userContent
}

function extractJson(text: string): Record<string, any> {
  if (!text || typeof text !== 'string') {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    // Attempt to extract JSON from text if parsing fails
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        console.warn('Failed to extract JSON from response text')
        return {}
      }
    }
    return {}
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json()

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 })
    }

    // Fetch customer
    const { data: customers, error: fetchError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .limit(1)

    if (fetchError) {
      console.error('Customer fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customer = customers[0]

    // Return cached report if exists
    if (customer.ai_report) {
      return NextResponse.json({ report: customer.ai_report, cached: true })
    }

    // Build message content with proper types
    const userContent = buildMessageContent(customer)

    // Generate report using Chat Completions API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: GLOW_UP_SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.35,
      max_tokens: 4000,
    })

    // Extract and validate response
    const text = response.choices[0]?.message?.content || ''
    const report = extractJson(text)

    // Validate report has content before saving
    if (!report || Object.keys(report).length === 0) {
      console.warn('Empty report generated for customer:', customerId)
      return NextResponse.json(
        { error: 'Failed to generate valid report' },
        { status: 500 }
      )
    }

    // Save report to database
    const { error: updateError } = await supabaseAdmin
      .from('customers')
      .update({
        ai_report: report,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId)

    if (updateError) {
      console.error('Failed to save report:', updateError)
      return NextResponse.json(
        { error: 'Failed to save report' },
        { status: 500 }
      )
    }

    return NextResponse.json({ report, cached: false })

  } catch (err: any) {
    console.error('generate route error:', err)
    const errorMessage = err?.message || 'Failed to generate report'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
