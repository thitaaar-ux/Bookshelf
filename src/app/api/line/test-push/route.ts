import { NextResponse } from 'next/server';
import { addWebhookLog } from '@/src/lib/serverState';
import { getLineConfigFromDb } from '@/src/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, isExample } = body;
    const dbLineConfig = await getLineConfigFromDb();
    const targetId = userId || dbLineConfig.targetUserId;
    const token = dbLineConfig.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;

    const pushText = isExample
      ? '📖 [ตัวอย่างแจ้งเตือน Tsundoku]\nคืนนี้เวลา 20:00 น. คุณมีนัดอ่านเล่ม "Atomic Habits" อีก 20 หน้า\nทลายกองดองต่อเนื่อง Streak 🔥 7 วันแล้ว สู้ๆ ครับ!'
      : '✅ [Tsundoku Bot Test]\nระบบเชื่อมต่อ LINE Messaging Webhook สำเร็จสมบูรณ์ พร้อมส่งการแจ้งเตือนทลายกองดองครับ! ✨';

    let sentReal = false;
    if (token && targetId && !targetId.startsWith('U_guest')) {
      try {
        const resp = await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            to: targetId,
            messages: [{ type: 'text', text: pushText }]
          })
        });
        sentReal = resp.ok;
      } catch (err) {
        console.warn('Real push failed:', err);
      }
    }

    addWebhookLog({
      id: 'push-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('th-TH'),
      source: 'real_line_webhook',
      eventType: isExample ? 'example_push' : 'test_push',
      userId: targetId || 'Unknown',
      payload: { message: pushText, sentReal },
      botReply: pushText
    });

    return NextResponse.json({
      success: true,
      sentReal,
      targetId,
      message: sentReal
        ? `ส่งข้อความจริงเข้า LINE บัญชี ${targetId} สำเร็จแล้ว`
        : `จำลองการส่งข้อความถึง ${targetId} สำเร็จเรียบร้อย`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
