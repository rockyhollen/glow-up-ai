// app/api/customers/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/customers
// Called when customer completes questionnaire.
// Creates customer record, returns ID for the rest of the flow.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { extractArchetypeSlug } from '@/lib/product-matching'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      email,
      goal,
      ageRange,
      budget,
      maintenance,
      stylePref,
      concerns,
      sessionId,
      utmSource,
      utmCampaign,
    } = body

    // Upsert by email so repeat visitors don't create duplicates
    const { data, error } = await supabaseAdmin
      .from('customers')
      .upsert(
        {
          name,
          email: email?.toLowerCase() || null,
          goal,
          age_range: ageRange,
          budget,
          maintenance,
          style_pref: stylePref,
          concerns: concerns || [],
          session_id: sessionId,
          utm_source: utmSource,
          utm_campaign: utmCampaign,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'email',
          ignoreDuplicates: false,
        }
      )
      .select('id, email, name, goal, budget')
      .single()

    if (error) {
      console.error('customer upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, customer: data })

  } catch (err: any) {
    console.error('customers route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/customers — update after AI report is generated
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId, photoUrls, archetype, aiReport } = body

    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 })
    }

    const updates: any = { updated_at: new Date().toISOString() }
    if (photoUrls) updates.photo_urls = photoUrls
    if (archetype) {
      updates.archetype = archetype
      updates.archetype_slug = extractArchetypeSlug(archetype)
    }
    if (aiReport) updates.ai_report = aiReport

    const { error } = await supabaseAdmin
      .from('customers')
      .update(updates)
      .eq('id', customerId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
