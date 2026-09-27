import { NextResponse } from 'next/server';
import { subscriptions, stripeConfig } from '@/src/lib/serverState';
import { queryPostgres } from '@/src/lib/postgres';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'U9330ea2a3097a7e8ea7b81a9eeb82088';

  let sub: any = null;
  try {
    const rows = await queryPostgres<any>('SELECT * FROM subscriptions WHERE user_id = $1 LIMIT 1;', [userId]);
    if (rows && rows[0]) {
      const r = rows[0];
      sub = {
        id: r.id,
        userId: r.user_id,
        userEmail: r.user_email,
        planName: r.plan_name,
        status: r.status,
        trialEndsAt: r.trial_ends_at ? new Date(r.trial_ends_at).toISOString() : '',
        currentPeriodEnd: r.current_period_end ? new Date(r.current_period_end).toISOString() : '',
        stripeCustomerId: r.stripe_customer_id,
        stripeSubscriptionId: r.stripe_subscription_id,
      };
    }
  } catch {}

  if (!sub) {
    sub = subscriptions.find(s => s.userId === userId);
  }

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
