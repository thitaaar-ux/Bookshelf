import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { lineConfig, addWebhookLog, WebhookLogItem } from '@/lib/serverState';

function processLineEvent(event: any): { logEntry: WebhookLogItem; botReply: string } {
  const userId = event.source?.userId || 'U_guest_preview';
  let botReply = '';
  let quickReplyAction = '';

  if (event.type === 'postback') {
    let data: any = {};
    try {
      data = typeof event.postback.data === 'string' ? JSON.parse(event.postback.data) : event.postback.data;
    } catch {
      data = { raw: event.postback.data };
    }

    quickReplyAction = data.action || 'postback_clicked';

    if (data.action === 'start_reading') {
      botReply = `📖 ยอดเยี่ยมมากครับ! ระบบเริ่มบันทึก Session อ่านหนังสือ "${data.book || 'หนังสือที่คุณเลือก'}" ให้แล้ว\n\nเป้าหมายวันนี้: ${data.targetPages || 20} หน้า ขอให้สนุกกับการเดินทางในโลกตัวอักษรครับ ✨`;
    } else if (data.action === 'snooze') {
      botReply = `⏱️ รับทราบครับ! ระบบเลื่อนการแจ้งเตือนออกไป ${data.minutes || 30} นาที\nแล้วพบกันใหม่ครับ ☕`;
    } else if (data.action === 'rest_today') {
      botReply = `🛋️ เข้าใจเลยครับ การพักผ่อนที่ดีช่วยฟื้นฟูสมองได้ดีที่สุด วันนี้พักผ่อนให้สบาย แล้วพรุ่งนี้มาลุยทลายกองดองต่อด้วยกันครับ 🌙`;
    } else if (data.action === 'quick_log') {
      botReply = `🎉 บันทึกสำเร็จ! อ่านเพิ่มอีก ${data.pages || 15} หน้าในเล่ม "${data.book || 'หนังสือ'}"\nStreak วันนี้ถูกต่ออายุเรียบร้อยแล้ว 🔥`;
    } else {
      botReply = `รับทราบ Action: ${JSON.stringify(data)}`;
    }
  } else if (event.type === 'message' && event.message?.type === 'text') {
    const text = event.message.text.trim().toLowerCase();
    if (text.includes('ดอง') || text.includes('สถานะ') || text.includes('status')) {
      botReply = `📊 รายงานสถานะกองดองปัจจุบัน:\n• กำลังอ่าน: 2 เล่ม\n• กองดองรออ่าน: 2 เล่ม\n• ทลายสำเร็จแล้ว: 2 เล่ม\n• อัตราทลายกองดอง: 50.0%\n\nพิมพ์ "อ่าน" หรือกดปุ่ม Quick Reply ด้านล่างเพื่อเริ่มได้เลยครับ`;
    } else if (text.includes('เป้าหมาย') || text.includes('goal')) {
      botReply = `🎯 เป้าหมายประจำวัน: 20 หน้า/วัน\nวันแจ้งเตือน: จันทร์, พุธ, ศุกร์, อาทิตย์ เวลา 20:00 น.\nStreak ต่อเนื่อง: 🔥 7 วัน`;
    } else {
      botReply = `สวัสดีครับคุณผู้ใช้! ผมคือ Tsundoku Concierge ผู้ช่วยทลายกองดองของคุณ 📚\n\nพิมพ์ "สถานะ" เพื่อดูภาพรวม หรือเปิด LIFF App ผ่าน Rich Menu ด้านล่างเพื่อเริ่มอ่านได้เลยครับ`;
    }
  } else if (event.type === 'follow') {
    botReply = `ยินดีต้อนรับสู่ Tsundoku Killer ครับ! 🎉\nผมจะช่วยคุณเปลี่ยน "กองดองที่ซื้อมาสะสม" ให้กลายเป็น "ความรู้ที่ได้อ่านจริง" แบบเป็นมิตรและไม่กดดัน`;
  }

  const logEntry: WebhookLogItem = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toLocaleTimeString('th-TH'),
    source: 'real_line_webhook',
    eventType: event.type,
    userId,
    payload: event,
    botReply,
    quickReplyAction,
  };

  addWebhookLog(logEntry);
  return { logEntry, botReply };
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-line-signature');
    const channelSecret = lineConfig.channelSecret || process.env.LINE_CHANNEL_SECRET;

    // Verify HMAC-SHA256 signature if configured
    if (channelSecret && signature) {
      const computedHash = crypto
        .createHmac('SHA256', channelSecret)
        .update(rawBody)
        .digest('base64');

      if (computedHash !== signature) {
        return NextResponse.json({ error: 'Invalid x-line-signature' }, { status: 403 });
      }
    }

    const body = JSON.parse(rawBody || '{}');
    const events = body.events || [];

    for (const event of events) {
      if (event.source?.userId) {
        lineConfig.latestCapturedUser = {
          userId: event.source.userId,
          type: event.type || 'message',
          timestamp: new Date().toLocaleTimeString('th-TH'),
        };
      }

      const { botReply } = processLineEvent(event);

      const accessToken = lineConfig.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;
      if (accessToken && event.replyToken && botReply) {
        try {
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              replyToken: event.replyToken,
              messages: [{ type: 'text', text: botReply }],
            }),
          });
        } catch (err) {
          console.error('LINE Reply API call error:', err);
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
