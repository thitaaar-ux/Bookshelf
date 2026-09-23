import { NextResponse } from 'next/server';
import { 
  testPostgresConnection, 
  initPostgresSchema, 
  resetPostgresPool, 
  queryPostgres, 
  getPostgresConfig 
} from '@/src/lib/postgres';
import { getDbStatus, getAllAppSettingsFromDb } from '@/src/lib/db';
import { INITIAL_BOOKS } from '@/src/data/initialData';

export async function GET() {
  try {
    const status = await getDbStatus();
    const config = getPostgresConfig();

    return NextResponse.json({
      status: 'ok',
      activeDriver: status.activeDriver,
      postgres: status.postgres,
      sqlite: status.sqlite,
      config: {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === 'reconnect' || action === 'test') {
      await resetPostgresPool();
      const testResult = await testPostgresConnection();
      return NextResponse.json({
        success: testResult.connected,
        postgres: testResult,
      });
    }

    if (action === 'init_schema') {
      const initResult = await initPostgresSchema();
      return NextResponse.json(initResult);
    }

    if (action === 'seed') {
      // Seed books into PostgreSQL if tables exist and are empty
      try {
        const existing = await queryPostgres('SELECT COUNT(*) as count FROM books;');
        const count = parseInt(existing[0]?.count || '0', 10);
        if (count === 0) {
          for (const b of INITIAL_BOOKS) {
            await queryPostgres(`
              INSERT INTO books (id, title, author, total_pages, current_page, status, category, target_pages_per_day, target_finish_date, cover_emoji, cover_url, notes, started_at, completed_at, added_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
              ON CONFLICT (id) DO NOTHING;
            `, [
              b.id, b.title, b.author, b.totalPages, b.currentPage, b.status,
              b.category, b.targetPagesPerDay, b.targetFinishDate, b.coverEmoji,
              b.coverUrl, b.notes || '', b.startedAt || null, b.completedAt || null, b.addedAt || null
            ]);
          }
          return NextResponse.json({ success: true, message: `ซี้ดข้อมูล ${INITIAL_BOOKS.length} เล่มลง PostgreSQL สำเร็จ` });
        } else {
          return NextResponse.json({ success: true, message: `มีข้อมูลหนังสืออยู่ใน PostgreSQL แล้ว (${count} เล่ม)` });
        }
      } catch (err: any) {
        return NextResponse.json({ success: false, message: err?.message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
