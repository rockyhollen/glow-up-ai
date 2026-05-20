// app/api/checkout/route.ts
// ─────────────────────────────────────────────────────────────
// Updated Stripe checkout — accepts customerId from quiz flow
// Creates Stripe session and passes customerId in metadata
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { customerId, email } = body

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://glowupmen.com'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Personal Glow-Up Blueprint',
              description: 'Personalized AI appearance report with barber script, skin routine, wardrobe, and PDF.',
              images: [`${baseUrl}/og-image.png`],
            },
            unit_amount: 1900, // $19.00
          },
          quantity: 1,
        },
      ],
      metadata: {
        customerId: customerId || '',
        source: 'quiz_flow',
      },
      success_url: `${baseUrl}/report?session_id={CHECKOUT_SESSION_ID}&customer_id=${customerId || ''}`,
      cancel_url: `${baseUrl}/quiz?cancelled=true`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })

  } catch (err: any) {
    console.error('checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET — original redirect flow (keeps old button working)
export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://glowupmen.com'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Personal Glow-Up Blueprint',
              description: 'Personalized AI appearance report — barber script, skin routine, wardrobe, PDF.',
            },
            unit_amount: 1900,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/report?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?cancelled=true`,
    })

    return NextResponse.redirect(session.url!)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
