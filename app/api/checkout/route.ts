import Stripe from 'stripe';

export async function GET() {
  if (process.env.PAYMENT_REQUIRED !== 'true') {
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/upload`);
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return Response.json({ error: 'Stripe environment variables are missing.' }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${appUrl}/upload?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/`,
    allow_promotion_codes: true,
    metadata: { product: 'glow-up-blueprint' }
  });

  return Response.redirect(session.url!);
}
