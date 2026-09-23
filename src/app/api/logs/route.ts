import { NextRequest, NextResponse } from 'next/server';
import { getReadingLogs, addReadingLog } from '@/lib/serverDb';

export async function GET() {
  try {
    const logs = getReadingLogs();
    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.bookTitle || typeof body.pagesRead !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Valid log data (bookTitle, pagesRead) is required' },
        { status: 400 }
      );
    }

    const createdLog = addReadingLog(body);
    return NextResponse.json(
      {
        success: true,
        message: 'บันทึกประวัติการอ่านลงในฐานข้อมูลเซิร์ฟเวอร์เรียบร้อยแล้ว',
        log: createdLog,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save log' },
      { status: 500 }
    );
  }
}
