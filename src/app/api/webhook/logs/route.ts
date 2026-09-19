import { NextResponse } from 'next/server';
import { webhookLogs } from '@/src/lib/serverState';

export async function GET() {
  return NextResponse.json({ logs: webhookLogs.slice(-20) });
}
