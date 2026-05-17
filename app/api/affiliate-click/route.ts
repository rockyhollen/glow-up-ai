// app/api/affiliate-click/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/affiliate-click
// Records every "Shop Now" click for analytics
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      customerId,
      productId,
      recommendationId,
      brand,
      category,
      tier,
      section,
      sessionId,
    } = body

    // 1. Log the click
    const { error: clickError } = await supabaseAdmin
      .from('affiliate_clicks')
      .insert({
        customer_id: customerId || null,
        product_id: productId || null,
        recommendation_id: recommendationId || null,
        session_id: sessionId || null,
        brand,
        category,
        tier,
        section,
        user_agent: req.headers.get('user-agent'),
        referrer: req.headers.get('referer'),
      })

    if (clickError) console.error('affiliate_click insert error:', clickError)

    // 2. Mark recommendation as clicked
    if (recommendationId) {
      await supabaseAdmin
        .from('recommendations')
        .update({ was_clicked: true, clicked_at: new Date().toISOString() })
        .eq('id', recommendationId)
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('affiliate-click route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
