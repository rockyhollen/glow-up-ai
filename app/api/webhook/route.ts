// app/api/webhook/route.ts
// ─────────────────────────────────────────────────────────────
// Stripe webhook — handles payment success
// Marks order as paid, unlocks report, triggers recommendations
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── Handle payment success ────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const customerId = session.metadata?.customerId
    const customerEmail = session.customer_details?.email

    // 1. Create/update order record
    await supabaseAdmin.from('orders').upsert({
      stripe_session_id: session.id,
      stripe_payment_id: session.payment_intent as string,
      customer_id: customerId || null,
      amount_cents: session.amount_total || 1900,
      currency: session.currency || 'usd',
      status: 'paid',
    })

    // 2. Mark customer as paid
    if (customerId) {
      await supabaseAdmin
        .from('customers')
        .update({
          has_paid: true,
          paid_at: new Date().toISOString(),
        })
        .eq('id', customerId)
    } else if (customerEmail) {
      // Try to find by email if no customerId in metadata
      await supabaseAdmin
        .from('customers')
        .update({
          has_paid: true,
          paid_at: new Date().toISOString(),
        })
        .eq('email', customerEmail.toLowerCase())
    }

    console.log(`✅ Payment confirmed for customer ${customerId || customerEmail}`)
  }

  // ── Handle refunds ────────────────────────────────────────
  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    await supabaseAdmin
      .from('orders')
      .update({ status: 'refunded' })
      .eq('stripe_payment_id', charge.payment_intent as string)
  }

  return NextResponse.json({ received: true })
}
