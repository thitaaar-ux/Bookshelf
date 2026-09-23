import { NextResponse } from 'next/server';
import { getLineConfigFromDb, saveLineConfigToDb, getAllAppSettingsFromDb } from '@/src/lib/db';

export async function GET() {
  const currentConfig = await getLineConfigFromDb();
  const dbRows = await getAllAppSettingsFromDb();

  return NextResponse.json({
    hasToken: Boolean(currentConfig.channelAccessToken),
    hasSecret: Boolean(currentConfig.channelSecret),
    botName: currentConfig.botName || 'Bunnarak',
    botBasicId: currentConfig.botBasicId || '@869uobem',
    channelId: currentConfig.channelId || '2011678531',
    channelAccessToken: currentConfig.channelAccessToken || '',
    channelSecret: currentConfig.channelSecret || '',
    targetUserId: currentConfig.targetUserId || 'U9330ea2a3097a7e8ea7b81a9eeb82088',
    enabled: currentConfig.enabled,
    reminderDaysAhead: currentConfig.reminderDaysAhead,
    storageType: 'PostgreSQL Database (Table: app_settings)',
    dbFile: 'postgresql://.../bookshelf',
    dbRows: dbRows
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
      reminderDaysAhead 
    } = body;

    const updates: any = {};
    if (botName !== undefined) updates.botName = botName.trim();
    if (botBasicId !== undefined) updates.botBasicId = botBasicId.trim();
    if (channelId !== undefined) updates.channelId = channelId.trim();
    if (channelAccessToken !== undefined && channelAccessToken.trim()) {
      updates.channelAccessToken = channelAccessToken.trim();
    }
    if (channelSecret !== undefined && channelSecret.trim()) {
      updates.channelSecret = channelSecret.trim();
    }
    if (targetUserId !== undefined) updates.targetUserId = targetUserId.trim();
    if (enabled !== undefined) updates.enabled = Boolean(enabled);
    if (reminderDaysAhead !== undefined) updates.reminderDaysAhead = Number(reminderDaysAhead);

    const savedConfig = await saveLineConfigToDb(updates);

    return NextResponse.json({ 
      success: true, 
      message: 'บันทึกลง PostgreSQL Database (Table: app_settings) สำเร็จแล้ว',
      config: savedConfig
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 400 });
  }
}
