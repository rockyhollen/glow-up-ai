import { NextRequest } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { createGlowReport } from '@/lib/openai';

const schema = z.object({
  sessionId: z.string().nullable().optional(),
  name: z.string().min(1),
  age: z.string().min(1),
  goal: z.string().min(1),
  lifestyle: z.string().optional().default(''),
  stylePreference: z.string().optional().default(''),
  images: z.array(z.string().startsWith('data:image')).min(1).max(5)
});

async function verifyPayment(sessionId?: string | null) {
  if (process.env.PAYMENT_REQUIRED !== 'true') return true;
  if (!sessionId) return false;
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY missing');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session.payment_status === 'paid';
}

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const paid = await verifyPayment(body.sessionId);
    if (!paid) return Response.json({ error: 'Payment verification failed.' }, { status: 402 });

    const report = await createGlowReport(body);
    return Response.json({ report });
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: err.message || 'Failed to generate report.' }, { status: 500 });
  }
}
