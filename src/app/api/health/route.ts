import { NextResponse } from 'next/server';
import { hydrateLineConfig, stripeConfig } from '@/src/lib/serverState';

export async function GET() {
  const lineConfig = await hydrateLineConfig();
  const lineConfigured = Boolean(
    (lineConfig.channelSecret || process.env.LINE_CHANNEL_SECRET) &&
    (lineConfig.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN)
  );

  const stripeConfigured = Boolean(
    stripeConfig.secretKey || process.env.STRIPE_SECRET_KEY
  );

  return NextResponse.json({
    status: 'ok',
    framework: 'Next.js 16+ App Router',
    service: 'Tsundoku Killer API',
    time: new Date().toISOString(),
    lineConfigured,
    stripeConfigured,
    subscriptionPlan: {
      trialDays: stripeConfig.trialDays || 3,
      priceThb: stripeConfig.priceAmountThb || 39,
    },
  });
}
