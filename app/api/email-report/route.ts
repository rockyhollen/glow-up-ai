import { Resend } from 'resend';

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: 'RESEND_API_KEY missing.' }, { status: 500 });
  }
  const { email, reportText } = await req.json();
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'Glow-Up AI <reports@example.com>',
    to: email,
    subject: 'Your Glow-Up Blueprint',
    text: reportText
  });
  return Response.json({ ok: true });
}
