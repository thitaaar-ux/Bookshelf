import { NextResponse } from 'next/server';
import { lineConfig } from '@/src/lib/serverState';

export async function GET() {
  return NextResponse.json({
    hasToken: Boolean(lineConfig.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN),
    hasSecret: Boolean(lineConfig.channelSecret || process.env.LINE_CHANNEL_SECRET),
    targetUserId: lineConfig.targetUserId,
    enabled: lineConfig.enabled,
    reminderDaysAhead: lineConfig.reminderDaysAhead,
    latestCapturedUser: lineConfig.latestCapturedUser,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { channelAccessToken, channelSecret, targetUserId, enabled, reminderDaysAhead } = body;

    if (channelAccessToken) {
      lineConfig.channelAccessToken = channelAccessToken;
      process.env.LINE_CHANNEL_ACCESS_TOKEN = channelAccessToken;
    }
    if (channelSecret) {
      lineConfig.channelSecret = channelSecret;
      process.env.LINE_CHANNEL_SECRET = channelSecret;
    }
    if (targetUserId !== undefined) lineConfig.targetUserId = targetUserId;
    if (enabled !== undefined) lineConfig.enabled = enabled;
    if (reminderDaysAhead !== undefined) lineConfig.reminderDaysAhead = Number(reminderDaysAhead);

    return NextResponse.json({ success: true, message: 'บันทึกการตั้งค่า LINE สำเร็จ' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 400 });
  }
}
