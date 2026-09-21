import { NextResponse } from 'next/server';
import { subscriptions, stripeConfig } from '@/src/lib/serverState';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'U9330ea2a3097a7e8ea7b81a9eeb82088';

  const sub = subscriptions.find(s => s.userId === userId);

  if (!sub) {
    return NextResponse.json({
      hasSubscription: false,
      status: 'none',
      planName: 'Free Tier',
      trialDays: stripeConfig.trialDays || 3,
      priceAmountThb: stripeConfig.priceAmountThb || 39,
    });
  }

  const now = new Date();
  const trialEnd = new Date(sub.trialEndsAt);
  const isTrialActive = sub.status === 'trialing' && trialEnd > now;
  const trialDaysLeft = isTrialActive
    ? Math.max(1, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return NextResponse.json({
    hasSubscription: true,
    status: sub.status,
    isTrialActive,
    trialDaysLeft,
    planName: sub.planName,
    trialEndsAt: sub.trialEndsAt,
    currentPeriodEnd: sub.currentPeriodEnd,
    priceAmountThb: stripeConfig.priceAmountThb || 39,
  });
}
