import { NextResponse } from 'next/server';
import { lineConfig, stripeConfig } from '@/src/lib/serverState';
import { getDbStatus } from '@/src/lib/db';

export async function GET() {
  const dbStatus = await getDbStatus();

  const lineConfigured = Boolean(
    (lineConfig?.channelSecret || process.env.LINE_CHANNEL_SECRET) &&
    (lineConfig?.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN)
  );

  const stripeConfigured = Boolean(
    stripeConfig?.secretKey || process.env.STRIPE_SECRET_KEY
  );

  return NextResponse.json({
    status: 'ok',
    framework: 'Next.js 16+ App Router',
    service: 'Tsundoku Killer API',
    time: new Date().toISOString(),
    lineConfigured,
    stripeConfigured,
    database: {
      activeDriver: dbStatus.activeDriver,
      postgresConnected: dbStatus.postgres.connected,
      postgresHost: `${dbStatus.postgres.host}:${dbStatus.postgres.port}/${dbStatus.postgres.database}`,
      sqliteRowCount: dbStatus.sqlite.rowCount,
    },
    subscriptionPlan: {
      trialDays: stripeConfig?.trialDays || 3,
      priceThb: stripeConfig?.priceAmountThb || 39,
    },
  });
}
