// app/api/recommendations/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/recommendations
// Called after AI report is generated.
// Takes customer ID + AI report, runs product matching,
// saves recommendations to DB, returns matched products.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  matchProductsForCustomer,
  saveRecommendations,
  extractArchetypeSlug,
  MatchingInput,
} from '@/lib/product-matching'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId, aiReport } = body

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 })
    }

    // 1. Fetch customer profile from DB
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // 2. Save AI report to customer record (if provided)
    if (aiReport) {
      await supabaseAdmin
        .from('customers')
        .update({
          ai_report: aiReport,
          archetype: aiReport.archetype_summary?.type || null,
          archetype_slug: extractArchetypeSlug(aiReport.archetype_summary?.type || ''),
        })
        .eq('id', customerId)
    }

    // 3. Build matching input from customer + AI report
    const archetypeSlug = extractArchetypeSlug(
      aiReport?.archetype_summary?.type || customer.archetype || ''
    )

    const matchingInput: MatchingInput = {
      customerId,
      archetype: aiReport?.archetype_summary?.type || customer.archetype || '',
      archetypeSlug,
      goal: customer.goal || 'confidence',
      budget: customer.budget || 'mid',
      stylePref: customer.style_pref || 'clean',
      concerns: customer.concerns || [],
      aiReport: aiReport || customer.ai_report,
    }

    // 4. Run the matching engine
    const matchResult = await matchProductsForCustomer(matchingInput)

    // 5. Save recommendations to DB (async — don't block response)
    saveRecommendations(customerId, matchResult).catch(console.error)

    // 6. Return matched products
    return NextResponse.json({
      success: true,
      customerId,
      archetypeSlug,
      recommendations: {
        tops: matchResult.tops.products,
        pants: matchResult.pants.products,
        jackets: matchResult.jackets.products,
        shoes: matchResult.shoes.products,
        grooming: matchResult.grooming.products,
      },
      bundles: matchResult.bundles,
    })

  } catch (err: any) {
    console.error('recommendations route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET /api/recommendations?customerId=xxx
// Returns previously saved recommendations for a customer
export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get('customerId')

  if (!customerId) {
    return NextResponse.json({ error: 'customerId required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('recommendations')
    .select(`
      *,
      product:affiliate_products(*)
    `)
    .eq('customer_id', customerId)
    .order('section')
    .order('position')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by section
  const grouped: Record<string, any[]> = {}
  data?.forEach((rec: any) => {
    if (!grouped[rec.section]) grouped[rec.section] = []
    if (rec.product) grouped[rec.section].push(rec.product)
  })

  return NextResponse.json({ recommendations: grouped })
}
