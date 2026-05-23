// app/api/create-payment/route.ts
// ─────────────────────────────────────────────────────────────
// Pay-what-you-want tip jar
// Creates a Stripe checkout session for any amount
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(req: NextRequest) {
  try {
    const { amount, customerId, email } = await req.json()

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Minimum tip is $1' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://glowupmen.com'
    const amountCents = Math.round(amount * 100)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'GlowUp Blueprint Tip',
              description: 'Thanks for supporting free tools for men 🙏',
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        customerId: customerId || '',
        type: 'tip',
        amount: amount.toString(),
      },
      success_url: `${baseUrl}/report?customer_id=${customerId}&tipped=true`,
      cancel_url: `${baseUrl}/report?customer_id=${customerId}`,
    })

    // Log the tip attempt
    if (customerId) {
      await supabaseAdmin
        .from('orders')
        .insert({
          customer_id: customerId,
          stripe_session_id: session.id,
          amount_cents: amountCents,
          status: 'pending',
          product_type: 'tip',
        })
        .select()
    }

    return NextResponse.json({ url: session.url })

  } catch (err: any) {
    console.error('create-payment error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
