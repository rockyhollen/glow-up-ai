// app/api/generate/route.ts
// ─────────────────────────────────────────────────────────────
// AI Report Generation
// Reads customer profile from Supabase, calls OpenAI,
// saves report back to DB, triggers product matching
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase'
import { matchProductsForCustomer, saveRecommendations, extractArchetypeSlug } from '@/lib/product-matching'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const SYSTEM_PROMPT = `You are an elite men's appearance consultant with expertise in:
- Face shape analysis and feature optimization
- Hair styling, barbering, and product science
- Skincare for men (actives, routines, DIY alternatives)
- Men's fashion and wardrobe building
- Grooming and personal presence

You give brutally honest, hyper-specific, actionable advice.
You never give generic advice — every recommendation is tailored to the specific profile provided.
You always provide budget tiers: DIY/free, budget ($5-20), mid ($20-60), premium ($60+).
You speak like a knowledgeable friend, not a corporate wellness brand.

ALWAYS respond with valid JSON only. No markdown, no preamble, no explanation outside the JSON.`

function buildUserPrompt(customer: any): string {
  return `Generate a complete glow-up blueprint for this client:

PROFILE:
- Goal: ${customer.goal || 'confidence'}
- Age range: ${customer.age_range || '25-34'}
- Budget: ${customer.budget || 'mid'}
- Daily maintenance time: ${customer.maintenance || 'moderate'}
- Style preference: ${customer.style_pref || 'clean'}
- Specific concerns: ${(customer.concerns || []).join(', ') || 'none'}

Return a JSON object with this exact structure:
{
  "archetype_summary": {
    "type": "3-4 word archetype label (e.g. Structured, masculine, composed)",
    "summary": "2 sentence description of their current opportunity and potential",
    "top_3_wins": ["win1", "win2", "win3"]
  },
  "hair_plan": {
    "barber_script": "Exact script to hand barber — guard numbers, lengths, techniques",
    "style_direction": "Brief description",
    "products": {
      "diy": "DIY alternative",
      "budget": "Budget product pick under $20",
      "mid": "Mid-tier product $20-50",
      "premium": "Premium product $50+"
    },
    "maintenance_routine": "Daily routine in 2-3 steps"
  },
  "beard_plan": {
    "recommendation": "Grow/trim/shave recommendation with reason",
    "ideal_length": "Specific length in mm",
    "neckline": "Exact neckline placement instructions",
    "maintenance": "How often and how to maintain"
  },
  "skin_plan": {
    "skin_assessment": "Brief assessment based on age and goals",
    "routine": {
      "daily": ["step1", "step2", "step3"],
      "weekly": ["step1", "step2"]
    },
    "products": {
      "diy": "DIY recipe or free option",
      "budget": "Budget product under $15",
      "mid": "Mid product $15-35",
      "premium": "Premium product $35+"
    }
  },
  "style_system": {
    "archetype_direction": "One sentence on overall style direction",
    "core_items": ["item1", "item2", "item3", "item4", "item5"],
    "colors": ["color1", "color2", "color3"],
    "fit_rules": ["rule1", "rule2", "rule3"],
    "outfits": {
      "casual": ["piece1", "piece2", "piece3"],
      "smart_casual": ["piece1", "piece2", "piece3"],
      "dating": ["piece1", "piece2", "piece3"]
    }
  },
  "execution_plan": {
    "week_1": ["action1", "action2", "action3"],
    "week_2": ["action1", "action2"],
    "week_3_4": ["action1", "action2"],
    "month_2_3": ["action1", "action2"]
  },
  "presence_notes": "2-3 sentences on posture, expression, and vibe cues"
}`
}

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json()

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 })
    }

    // 1. Fetch customer
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // 2. Return cached report if exists
    if (customer.ai_report) {
      return NextResponse.json({ report: customer.ai_report, cached: true })
    }

    // 3. Generate with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(customer) },
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

    // 4. Save report + archetype to customer
    const archetypeSlug = extractArchetypeSlug(report.archetype_summary?.type || '')
    await supabaseAdmin
      .from('customers')
      .update({
        ai_report: report,
        archetype: report.archetype_summary?.type || null,
        archetype_slug: archetypeSlug,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId)

    // 5. Run product matching + save recommendations
    const matchResult = await matchProductsForCustomer({
      customerId,
      archetype: report.archetype_summary?.type || '',
      archetypeSlug,
      goal: customer.goal || 'confidence',
      budget: customer.budget || 'mid',
      stylePref: customer.style_pref || 'clean',
      concerns: customer.concerns || [],
      aiReport: report,
    })

    await saveRecommendations(customerId, matchResult)

    return NextResponse.json({ report, cached: false })

  } catch (err: any) {
    console.error('generate error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
