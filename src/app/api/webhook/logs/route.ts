import { NextResponse } from 'next/server';
import { webhookLogs } from '@/lib/serverState';
import { queryPostgres } from '@/src/lib/postgres';

export async function GET() {
  try {
    const rows = await queryPostgres<any>('SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 50;');
    return NextResponse.json({ logs: rows });
  } catch {
    return NextResponse.json({ logs: webhookLogs.slice(-20) });
  }
}
