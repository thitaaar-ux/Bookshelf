import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'ออกจากระบบเรียบร้อย' });
  response.cookies.delete('session_token');
  return response;
}
