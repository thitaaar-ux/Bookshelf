import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    framework: 'Next.js 15+ App Router',
    service: 'Tsundoku Killer API',
    time: new Date().toISOString(),
    lineConfigured: Boolean(process.env.LINE_CHANNEL_SECRET && process.env.LINE_CHANNEL_ACCESS_TOKEN),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
  });
}
