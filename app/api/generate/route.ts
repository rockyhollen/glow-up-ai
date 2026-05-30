import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import OpenAI from 'openai'
import { GLOW_UP_SYSTEM_PROMPT } from '@/lib/prompts'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function extractJson(text: string): unknown {
  const trimmed = text.trim()
  try { return JSON.parse(trimmed) } catch {}
  const match = trimmed.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Model did not return JSON.')
  return JSON.parse(match[0])
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId } = body

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 })
    }

    const { data: customer, error: fetchError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (fetchError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    if (customer.ai_report) {
      return NextResponse.json({ report: customer.ai_report })
    }

    if (!customer.photo_urls?.length) {
      return NextResponse.json(
        { error: 'At least one photo is required to generate your blueprint.' },
        { status: 400 }
      )
    }

    const clientInfo = {
      name: customer.name || customer.email?.split('@')[0] || 'Client',
      age: customer.age_range || 'unknown',
      goal: customer.goal || 'general confidence',
      lifestyle: customer.maintenance || 'moderate',
      stylePreference: customer.style_pref || 'clean',
      budget: customer.budget || 'mid',
      concerns: (customer.concerns || []).join(', ') || 'none specified',
    }

    const contentParts: any[] = [
      {
        type: 'input_text',
        text: JSON.stringify({
          client: clientInfo,
          instruction: 'Analyze the attached images and intake info to generate the complete Glow-Up Blueprint JSON.',
        }),
      },
    ]

    for (const url of customer.photo_urls.slice(0, 4)) {
      contentParts.push({ type: 'input_image', image_url: url })
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1',
      input: [
        { role: 'system', content: GLOW_UP_SYSTEM_PROMPT },
        { role: 'user', content: contentParts },
      ],
      temperature: 0.35,
    } as any)

    const text = (response as any).output_text || ''
    const report = extractJson(text)

    await supabaseAdmin
      .from('customers')
      .update({ ai_report: report, updated_at: new Date().toISOString() })
      .eq('id', customerId)

    return NextResponse.json({ report })

  } catch (err: any) {
    console.error('generate route error:', err)
    return NextResponse.json({ error: err.message || 'Failed to generate report.' }, { status: 500 })
  }
}
