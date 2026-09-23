import { NextResponse } from 'next/server';
import { hydrateLineConfig } from '@/src/lib/serverState';

export async function GET() {
  const lineConfig = await hydrateLineConfig();
  const token = lineConfig.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({
      configured: false,
      message: 'กรุณาตั้งค่า LINE_CHANNEL_ACCESS_TOKEN ในหน้า /backoffice ก่อนใช้งาน Rich Menu API',
    });
  }

  try {
    const res = await fetch('https://api.line.me/v2/bot/richmenu/list', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return NextResponse.json({ configured: true, richmenus: data.richmenus || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const lineConfig = await hydrateLineConfig();
  const token = lineConfig.channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Missing LINE token' }, { status: 400 });
  }

  try {
    const richMenuPayload = {
      size: { width: 2500, height: 1686 },
      selected: true,
      name: 'Tsundoku Main Rich Menu',
      chatBarText: '📚 เมนูทลายกองดอง',
      areas: [
        {
          bounds: { x: 0, y: 0, width: 833, height: 1686 },
          action: {
            type: 'uri',
            label: 'เปิด LIFF บันทึกการอ่าน',
            uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://studio.notaloan.site'}/liff`,
          },
        },
        {
          bounds: { x: 834, y: 0, width: 833, height: 1686 },
          action: {
            type: 'message',
            label: 'สถานะกองดอง',
            text: 'สถานะกองดอง',
          },
        },
        {
          bounds: { x: 1667, y: 0, width: 833, height: 1686 },
          action: {
            type: 'postback',
            label: 'เริ่มอ่านหนังสือ',
            data: JSON.stringify({ action: 'start_reading', targetPages: 20 }),
          },
        },
      ],
    };

    const res = await fetch('https://api.line.me/v2/bot/richmenu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(richMenuPayload),
    });

    const data = await res.json();
    return NextResponse.json({ success: true, richMenuId: data.richMenuId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
