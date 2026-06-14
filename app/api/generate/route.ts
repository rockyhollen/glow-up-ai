import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json()

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 })
    }

    // Fetch customer directly
    const { data: customers, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .limit(1)

    if (error) {
      console.error('Customer fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customer = customers[0]

    // Return cached report if exists
    if (customer.ai_report) {
      return NextResponse.json({ report: customer.ai_report, cached: true })
    }

    // Generate report with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an elite men's appearance consultant. Give brutally honest, hyper-specific, actionable advice. Always respond with valid JSON only. No markdown, no preamble.`
        },
        {
          role: 'user',
          content: `Generate a complete personalized glow-up blueprint for this client:

PROFILE:
- Goal: ${customer.goal || 'confidence'}
- Age: ${customer.age_range || '25-34'}
- Budget: ${customer.budget || 'mid'}
- Daily time: ${customer.maintenance || 'moderate'}
- Style: ${customer.style_pref || 'clean'}
- Concerns: ${(customer.concerns || []).join(', ') || 'none'}

Return this exact JSON:
{
  "archetype_summary": {
    "type": "3-4 word archetype label",
    "summary": "2 sentence description",
    "top_3_wins": ["win1", "win2", "win3"]
  },
  "hair_plan": {
    "barber_script": "Exact script with guard numbers and lengths",
    "product_type": "Describe ideal product characteristics",
    "diy_option": "Free or DIY alternative",
    "maintenance_routine": "Daily steps"
  },
  "beard_plan": {
    "recommendation": "grow/trim/clean shave with reason",
    "ideal_length_mm": "specific mm",
    "neckline_guide": "Exact neckline instructions",
    "maintenance_frequency": "How often"
  },
  "skin_plan": {
    "assessment": "Brief honest assessment",
    "morning_routine": ["step1", "step2", "step3"],
    "evening_routine": ["step1", "step2"],
    "ingredient_targets": ["ingredient1", "ingredient2"],
    "diy_option": "Free DIY recipe"
  },
  "style_system": {
    "archetype_direction": "One sentence direction",
    "fit_rules": ["rule1", "rule2", "rule3"],
    "core_colors": ["color1", "color2", "color3"],
    "outfit_formulas": {
      "casual": "Specific formula",
      "dating": "Specific formula",
      "professional": "Specific formula"
    },
    "shopping_priority": ["first", "second", "third"]
  },
  "execution_plan": {
    "this_week": ["action1", "action2", "action3"],
    "week_2": ["action1", "action2"],
    "month_1": ["action1", "action2"]
  },
  "presence_notes": "2-3 sentences on posture and presence"
}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const raw = completion.choices[0]?.message?.content || '{}'
    let report: any = {}

    try {
      report = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) report = JSON.parse(match[0])
    }

    // Save report to customer
    await supabaseAdmin
      .from('customers')
      .update({
        ai_report: report,
        archetype: report.archetype_summary?.type || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId)

    return NextResponse.json({ report, cached: false })

  } catch (err: any) {
    console.error('generate error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}