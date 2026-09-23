import { NextResponse } from 'next/server';
import { lineConfig, updateLineConfig } from '@/src/lib/serverState';
import { getAllAppSettingsFromDb, getDbStatus } from '@/src/lib/db';

export async function GET() {
  const dbStatus = await getDbStatus();
  const dbRows = getAllAppSettingsFromDb();

  return NextResponse.json({
    hasToken: Boolean(lineConfig?.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN),
    hasSecret: Boolean(lineConfig?.channelSecret || process.env.LINE_CHANNEL_SECRET),
    botName: lineConfig?.botName || process.env.LINE_BOT_NAME || 'Bunnarak',
    botBasicId: lineConfig?.botBasicId || process.env.LINE_BOT_ID || '@869uobem',
    channelId: lineConfig?.channelId || process.env.LINE_CHANNEL_ID || '2011678531',
    channelAccessToken: lineConfig?.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: lineConfig?.channelSecret || process.env.LINE_CHANNEL_SECRET || '',
    targetUserId: lineConfig?.targetUserId || process.env.LINE_TARGET_USER_ID || 'U9330ea2a3097a7e8ea7b81a9eeb82088',
    enabled: lineConfig?.enabled ?? true,
    reminderDaysAhead: lineConfig?.reminderDaysAhead ?? 1,
    latestCapturedUser: lineConfig?.latestCapturedUser,
    storageType: dbStatus.activeDriver,
    dbFile: 'data/tsundoku.db',
    dbRows,
    postgresStatus: dbStatus.postgres,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      botName,
      botBasicId,
      channelId,
      channelAccessToken,
      channelSecret,
      targetUserId,
      enabled,
      reminderDaysAhead,
    } = body;

    const updates: any = {};
    if (botName !== undefined) {
      updates.botName = botName.trim();
      process.env.LINE_BOT_NAME = botName.trim();
    }
    if (botBasicId !== undefined) {
      updates.botBasicId = botBasicId.trim();
      process.env.LINE_BOT_ID = botBasicId.trim();
    }
    if (channelId !== undefined) {
      updates.channelId = channelId.trim();
      process.env.LINE_CHANNEL_ID = channelId.trim();
    }
    if (channelAccessToken !== undefined) {
      updates.channelAccessToken = channelAccessToken.trim();
      process.env.LINE_CHANNEL_ACCESS_TOKEN = channelAccessToken.trim();
    }
    if (channelSecret !== undefined) {
      updates.channelSecret = channelSecret.trim();
      process.env.LINE_CHANNEL_SECRET = channelSecret.trim();
    }
    if (targetUserId !== undefined) {
      updates.targetUserId = targetUserId.trim();
      process.env.LINE_TARGET_USER_ID = targetUserId.trim();
    }
    if (enabled !== undefined) updates.enabled = Boolean(enabled);
    if (reminderDaysAhead !== undefined) updates.reminderDaysAhead = Number(reminderDaysAhead);

    const saved = updateLineConfig(updates);

    return NextResponse.json({
      success: true,
      message: 'บันทึกการตั้งค่า LINE ลงฐานข้อมูลสำเร็จ',
      config: saved,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 400 });
  }
}
