import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, userContext, history } = body;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const systemInstruction = `คุณคือ "Tsundoku Concierge" ผู้ช่วยส่วนตัวระดับพรีเมียม (Virtual Assistant) สำหรับแอปพลิเคชัน Tsundoku Killer (ระบบทลายกองดองหนังสือ)
บุคลิกภาพ:
- สุภาพ นุ่มนวล ดูมืออาชีพ ไฮเทค และให้กำลังใจเชิงบวก (No pressure, no guilt)
- พูดจาไพเราะ มีระดับ (Concierge / Luxury Service) สไตล์ไฮเอนด์
- หน้าที่:
  1. ชวนผู้ใช้ตั้งเป้าหมายการอ่านแบบสนทนาสั้นๆ
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
            systemInstruction,
          },
        });

        const replyText = response.text || 'ยินดีที่ได้ช่วยเหลือคุณในการทลายกองดองครับ';
        return NextResponse.json({ reply: replyText });
      } catch (err: any) {
        console.warn('Gemini call failed, using heuristic fallback:', err?.message);
      }
    }

    // Heuristic fallback response
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

    return NextResponse.json({ reply: fallbackReply });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
