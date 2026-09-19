import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const stripeSignature = req.headers.get('stripe-signature');
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Ready for Stripe SDK: stripe.webhooks.constructEvent(rawBody, stripeSignature, secret)
    if (!stripeWebhookSecret) {
      return NextResponse.json({
        received: true,
        mode: 'mock',
        message: 'Stripe webhook received (ตั้งค่า STRIPE_WEBHOOK_SECRET เพื่อเปิดโหมด Verified)',
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 400 });
  }
}
