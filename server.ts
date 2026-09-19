import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const PORT = 3000;

// Initialize Gemini SDK lazily / gracefully
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// In-memory event log for webhook debugging and simulator
interface WebhookLogItem {
  id: string;
  timestamp: string;
  source: 'real_line_webhook' | 'simulator';
  eventType: string;
  userId: string;
  payload: any;
  botReply: string;
  quickReplyAction?: string;
}

const webhookLogs: WebhookLogItem[] = [];

async function startServer() {
  const app = express();

  // Capture raw body for LINE signature verification
  app.use(express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString();
    }
  }));
  app.use(express.urlencoded({ extended: true }));

  // 1. Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Tsundoku Killer API',
      time: new Date().toISOString(),
      lineConfigured: Boolean(process.env.LINE_CHANNEL_SECRET && process.env.LINE_CHANNEL_ACCESS_TOKEN)
    });
  });

  // 2. Fetch recent webhook logs
  app.get('/api/webhook/logs', (_req, res) => {
    res.json({ logs: webhookLogs.slice(-20) });
  });

  // 3. Helper to process LINE events (shared between real webhook and interactive simulator)
  function processLineEvent(event: any, source: 'real_line_webhook' | 'simulator') {
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
        botReply = `สวัสดีครับคุณผู้ใช้! ผมคือ Tsundoku Concierge ผู้ช่วยทลายกองดองของคุณ 📚\n\nพิมพ์ "สถานะ" เพื่อดูภาพรวม หรือกดปุ่มด้านล่างเพื่อเริ่มอ่านได้เลยครับ`;
      }
    } else if (event.type === 'follow') {
      botReply = `ยินดีต้อนรับสู่ Tsundoku Killer ครับ! 🎉\nผมจะช่วยคุณเปลี่ยน "กองดองที่ซื้อมาสะสม" ให้กลายเป็น "ความรู้ที่ได้อ่านจริง" แบบเป็นมิตรและไม่กดดัน`;
    }

    const logEntry: WebhookLogItem = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toLocaleTimeString('th-TH'),
      source,
      eventType: event.type,
      userId,
      payload: event,
      botReply,
      quickReplyAction
    };

    webhookLogs.push(logEntry);
    if (webhookLogs.length > 50) webhookLogs.shift();

    return { logEntry, botReply };
  }

  // 4. Real LINE Webhook endpoint
  app.post('/api/webhook/line', async (req, res) => {
    const signature = req.headers['x-line-signature'] as string;
    const channelSecret = process.env.LINE_CHANNEL_SECRET;

    // Verify signature if channelSecret is configured
    if (channelSecret && signature) {
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);
      const computedHash = crypto
        .createHmac('SHA256', channelSecret)
        .update(rawBody)
        .digest('base64');

      if (computedHash !== signature) {
        console.warn('LINE Signature mismatch');
        return res.status(403).json({ error: 'Invalid x-line-signature' });
      }
    }

    const events = req.body.events || [];
    for (const event of events) {
      const { botReply } = processLineEvent(event, 'real_line_webhook');

      // If LINE_CHANNEL_ACCESS_TOKEN is provided and there's a replyToken, send real LINE reply
      const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
      if (accessToken && event.replyToken && botReply) {
        try {
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              replyToken: event.replyToken,
              messages: [{ type: 'text', text: botReply }]
            })
          });
        } catch (err) {
          console.error('Failed to reply to LINE API:', err);
        }
      }
    }

    res.status(200).send('OK');
  });

  // 5. Interactive Simulator endpoint (for in-browser live testing of LINE Webhook actions)
  app.post('/api/simulate/line-event', (req, res) => {
    const { event } = req.body;
    if (!event) {
      return res.status(400).json({ error: 'Missing event payload' });
    }

    const result = processLineEvent(event, 'simulator');
    res.json({
      success: true,
      botReply: result.botReply,
      log: result.logEntry
    });
  });

  // 6. Concierge AI Chat endpoint (Conversational Onboarding & Status Tracking)
  app.post('/api/concierge/chat', async (req, res) => {
    const { message, history, userContext } = req.body;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const systemInstruction = `คุณคือ "Tsundoku Concierge" ผู้ช่วยส่วนตัวระดับพรีเมียม (Virtual Assistant) สำหรับแอปพลิเคชัน Tsundoku Killer (ระบบทลายกองดองหนังสือ)
บุคลิกภาพ:
- สุภาพ นุ่มนวล ดูมืออาชีพ ไฮเทค และให้กำลังใจเชิงบวก (No pressure, no guilt)
- พูดจาไพเราะ มีระดับ (Concierge / Luxury Service) สไตล์ไฮเอนด์
- หน้าที่:
  1. ชวนผู้ใช้ตั้งเป้าหมายการอ่านแบบสนทนาสั้นๆ (เช่น แนะนำให้อ่านวันละ 15-20 หน้า, ถามเวลาที่สะดวก)
  2. หากผู้ใช้อ่านตามเป้า จะชื่นชมอย่างจริงใจ
  3. หากผู้ใช้ห่างหาย จะติดตามแบบสุภาพ กระชับ ไม่ตำหนิ
  4. ช่วยเลือกหนังสือจากกองดองมาเริ่มอ่าน`;

        const prompt = `บริบทผู้ใช้ปัจจุบัน:
- กำลังอ่าน: ${userContext?.readingCount || 2} เล่ม
- กองดองคงเหลือ: ${userContext?.backlogCount || 2} เล่ม
- ทลายสำเร็จแล้ว: ${userContext?.completedCount || 2} เล่ม
- Streak ปัจจุบัน: ${userContext?.currentStreak || 7} วัน
- เป้าหมายปัจจุบัน: ${userContext?.targetPagesPerDay || 20} หน้า/วัน

ประวัติการสนทนา:
${(history || []).slice(-4).map((h: any) => `${h.sender === 'user' ? 'ผู้ใช้' : 'Concierge'}: ${h.text}`).join('\n')}

ข้อความล่าสุดจากผู้ใช้: "${message}"

ตอบกลับเป็นภาษาไทยที่กระชับ สุภาพ ให้พลังบวก ไม่เกิน 3 ย่อหน้า:`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction
          }
        });

        const replyText = response.text || 'ยินดีที่ได้ช่วยเหลือคุณในการทลายกองดองครับ';
        return res.json({ reply: replyText });
      } catch (err: any) {
        console.warn('Gemini call failed, using heuristic response:', err?.message);
      }
    }

    // Heuristic fallback response when API key is not present or rate limited
    let fallbackReply = '';
    const lower = (message || '').toLowerCase();
    if (lower.includes('สวัสดี') || lower.includes('เริ่ม') || lower.includes('goal')) {
      fallbackReply = 'สวัสดีครับ ผม Tsundoku Concierge ยินดีที่ได้รับใช้ครับ 📚\n\nสัปดาห์นี้มีหนังสือเล่มไหนในกองดองที่คุณอยากเริ่มต้นเป็นพิเศษไหมครับ? ผมแนะนำให้เริ่มที่วันละ 15-20 หน้าในเวลา 20:00 น. เพื่อสร้าง Habit Stacking ที่ยั่งยืนครับ';
    } else if (lower.includes('เหนื่อย') || lower.includes('พัก') || lower.includes('ไม่ว่าง')) {
      fallbackReply = 'เข้าใจเป็นอย่างดีครับ การอ่านหนังสือควรเป็นความรื่นรมย์ ไม่ใช่ภาระ วันนี้พักผ่อนให้สบายใจนะครับ เมื่อไหร่ที่พร้อม Concierge สแตนด์บายรอรับใช้เสมอครับ ☕';
    } else if (lower.includes('อ่านจบ') || lower.includes('หน้า') || lower.includes('สำเร็จ')) {
      fallbackReply = 'สุดยอดมากครับ! 🎉 ทุกหน้าที่คุณอ่านผ่านไปคือก้าวสำคัญในการทลายกองดอง ขอแสดงความยินดีกับ Streak ที่เติบโตอย่างมั่นคงครับ';
    } else {
      fallbackReply = `รับทราบครับ! ผมได้บันทึกข้อมูลไว้เรียบร้อยแล้ว เป้าหมายการอ่านของคุณอยู่ในสายตาของ Concierge เสมอ มีอะไรให้ดูแลเพิ่มเติม แจ้งได้ทันทีครับ ✨`;
    }

    res.json({ reply: fallbackReply });
  });

  // Vite middleware / production static file serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tsundoku Killer Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
