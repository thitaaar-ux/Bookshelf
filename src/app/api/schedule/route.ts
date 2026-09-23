import { NextRequest, NextResponse } from 'next/server';
import { getSchedule, updateSchedule } from '@/lib/serverDb';

export async function GET() {
  try {
    const schedule = getSchedule();
    return NextResponse.json({
      success: true,
      schedule,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateSchedule(body || {});
    return NextResponse.json({
      success: true,
      message: 'อัปเดตตารางเวลาการอ่านในฐานข้อมูลเซิร์ฟเวอร์เรียบร้อยแล้ว',
      schedule: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update schedule' },
      { status: 500 }
    );
  }
}
