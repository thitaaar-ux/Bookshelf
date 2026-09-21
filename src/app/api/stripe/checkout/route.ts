import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripeConfig, saveSubscription, addWebhookLog } from '@/src/lib/serverState';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId = 'U9330ea2a3097a7e8ea7b81a9eeb82088', userEmail = 'bunnarak.reader@line.me', origin: clientOrigin } = body;

    const reqOrigin = clientOrigin || req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const secretKey = stripeConfig.secretKey || process.env.STRIPE_SECRET_KEY;

    // Real Stripe Mode
    if (secretKey && !secretKey.startsWith('mock_')) {
      const stripe = new Stripe(secretKey);

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: 'thb',
              product_data: {
                name: 'Tsundoku Pro (รายเดือน)',
                description: 'สิทธิ์การใช้งานพรีเมียม: ทดลองใช้ฟรี 3 วันแรก จากนั้น 39 บาท/เดือน (ยกเลิกได้ตลอดเวลา)',
              },
              unit_amount: (stripeConfig.priceAmountThb || 39) * 100, // 3900 satangs
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days: stripeConfig.trialDays || 3,
          metadata: {
            userId,
          },
        },
        metadata: {
          userId,
        },
        success_url: `${reqOrigin}/subscription?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${reqOrigin}/subscription?status=canceled`,
      });

      return NextResponse.json({
        url: session.url,
        sessionId: session.id,
        mode: 'stripe_real',
      });
    }

    // Interactive Demo / Simulated Checkout Mode (Works without API key)
    const trialDays = stripeConfig.trialDays || 3;
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
    const currentPeriodEnd = new Date(now.getTime() + (trialDays + 30) * 24 * 60 * 60 * 1000);
    const simSubId = 'sub_sim_' + Date.now();

    saveSubscription({
      id: simSubId,
      userId,
      userEmail,
      planName: `Tsundoku Pro (${trialDays} วันแรกฟรี จากนั้น ${stripeConfig.priceAmountThb || 39} บ./เดือน)`,
      status: 'trialing',
      trialEndsAt: trialEndsAt.toISOString(),
      currentPeriodEnd: currentPeriodEnd.toISOString(),
      stripeCustomerId: 'cus_sim_' + Math.random().toString(36).substring(2, 8),
      stripeSubscriptionId: simSubId,
      createdAt: now.toISOString(),
    });

    addWebhookLog({
      id: 'stripe-sim-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('th-TH'),
      source: 'real_line_webhook',
      eventType: 'customer.subscription.created (Trial Sim)',
      userId,
      payload: {
        amountThb: stripeConfig.priceAmountThb || 39,
        trialDays,
        trialEndsAt: trialEndsAt.toLocaleDateString('th-TH'),
        status: 'trialing',
      },
      botReply: `เริ่มทดลองใช้งานฟรี ${trialDays} วันสำเร็จ! หลังจากนั้น 39 บาท/เดือน`,
    });

    return NextResponse.json({
      url: `${reqOrigin}/subscription?status=success&simulated=true&sub_id=${simSubId}`,
      sessionId: 'sim_session_' + Date.now(),
      mode: 'simulated_trial',
      message: `เริ่มทดลองใช้ฟรี ${trialDays} วันสำเร็จ (โหมดจำลอง - พร้อมใช้งานเมื่อกรอก STRIPE_SECRET_KEY)`,
    });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create checkout session' }, { status: 500 });
  }
}
