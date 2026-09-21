import { NextResponse } from 'next/server';
import { stripeConfig, subscriptions } from '@/src/lib/serverState';

export async function GET() {
  const hasSecret = Boolean(stripeConfig.secretKey || process.env.STRIPE_SECRET_KEY);
  const hasPublishable = Boolean(stripeConfig.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const hasWebhookSecret = Boolean(stripeConfig.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET);

  const activeSubscribersCount = subscriptions.filter(s => s.status === 'active').length;
  const trialingCount = subscriptions.filter(s => s.status === 'trialing').length;
  const estimatedMonthlyRevenueThb = activeSubscribersCount * (stripeConfig.priceAmountThb || 39);

  return NextResponse.json({
    hasSecret,
    hasPublishable,
    hasWebhookSecret,
    priceAmountThb: stripeConfig.priceAmountThb || 39,
    trialDays: stripeConfig.trialDays || 3,
    subscriptionsList: subscriptions,
    stats: {
      totalSubscribers: subscriptions.length,
      activeSubscribersCount,
      trialingCount,
      estimatedMonthlyRevenueThb,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { secretKey, publishableKey, webhookSecret, priceAmountThb, trialDays } = body;

    if (secretKey !== undefined) {
      stripeConfig.secretKey = secretKey.trim();
      process.env.STRIPE_SECRET_KEY = secretKey.trim();
    }
    if (publishableKey !== undefined) {
      stripeConfig.publishableKey = publishableKey.trim();
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = publishableKey.trim();
    }
    if (webhookSecret !== undefined) {
      stripeConfig.webhookSecret = webhookSecret.trim();
      process.env.STRIPE_WEBHOOK_SECRET = webhookSecret.trim();
    }
    if (priceAmountThb !== undefined) {
      stripeConfig.priceAmountThb = Number(priceAmountThb) || 39;
    }
    if (trialDays !== undefined) {
      stripeConfig.trialDays = Number(trialDays) || 3;
    }

    return NextResponse.json({
      success: true,
      message: 'บันทึกการตั้งค่า Stripe สำเร็จเรียบร้อย',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 400 });
  }
}
