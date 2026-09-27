import { Pool } from 'pg';
import type { PoolConfig } from 'pg';

export interface PostgresConnectionStatus {
  connected: boolean;
  host: string;
  port: number;
  database: string;
  user: string;
  latencyMs?: number;
  version?: string;
  tables?: string[];
  clientIp?: string;
  error?: string;
  isPgHbaError?: boolean;
  suggestedFix?: string;
  checkedAt: string;
}

let poolInstance: Pool | null = null;

export function getPostgresConfig(): {
  connectionString: string;
  host: string;
  port: number;
  database: string;
  user: string;
} {
  const host = process.env.POSTGRES_HOST || '210.246.215.195';
  const port = Number(process.env.POSTGRES_PORT) || 5433;
  const database = process.env.POSTGRES_DB || 'bookshelf';
  const user = process.env.POSTGRES_USER || 'bookshelf_app';
  const password = process.env.POSTGRES_PASSWORD;
  const connectionString =
    process.env.DATABASE_URL ||
    (password ? `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}` : '');

  if (!connectionString) {
    throw new Error('DATABASE_URL or POSTGRES_PASSWORD is required for PostgreSQL');
  }

  return { connectionString, host, port, database, user };
}

export function getPostgresPool(): Pool {
  if (!poolInstance) {
    const config = getPostgresConfig();
    const poolConfig: PoolConfig = {
      connectionString: config.connectionString,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      max: 5,
    };

    poolInstance = new Pool(poolConfig);

    poolInstance.on('error', (err) => {
      console.warn('⚠️ Unexpected error on idle PostgreSQL client:', err.message);
    });
  }

  return poolInstance;
}

/**
 * Reset connection pool (e.g. after config change or retry)
 */
export async function resetPostgresPool(): Promise<void> {
  if (poolInstance) {
    try {
      await poolInstance.end();
    } catch {
      // Ignore cleanup error
    }
    poolInstance = null;
  }
}

/**
 * Test PostgreSQL connectivity and capture diagnostics (including client IP from pg_hba errors)
 */
export async function testPostgresConnection(): Promise<PostgresConnectionStatus> {
  const config = getPostgresConfig();
  const pool = getPostgresPool();
  const startTime = Date.now();

  try {
    const client = await pool.connect();
    try {
      const verRes = await client.query('SELECT version();');
      const latencyMs = Date.now() - startTime;
      const version = verRes.rows[0]?.version || 'PostgreSQL';

      // Get list of tables in public schema
      const tablesRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      const tables = tablesRes.rows.map((r: any) => r.table_name);

      return {
        connected: true,
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        latencyMs,
        version,
        tables,
        checkedAt: new Date().toISOString(),
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    const rawError = err?.message || String(err);
    let clientIp: string | undefined;
    let isPgHbaError = false;
    let suggestedFix: string | undefined;

    // Detect pg_hba.conf refusal: e.g. 'no pg_hba.conf entry for host "34.34.244.10", user "bookshelf_app", database "bookshelf"'
    const ipMatch = rawError.match(/no pg_hba\.conf entry for host "([^"]+)"/);
    if (ipMatch && ipMatch[1]) {
      clientIp = ipMatch[1];
      isPgHbaError = true;
      suggestedFix = `กรุณาเพิ่มบรรทัดนี้ในไฟล์ pg_hba.conf บนเซิร์ฟเวอร์ PostgreSQL (${config.host}):\n\n` +
        `host    ${config.database}    ${config.user}    ${clientIp}/32    md5\n` +
        `หรืออนุญาตทุก IP:\nhost    all    all    0.0.0.0/0    md5\n\n` +
        `จากนั้นรัน: sudo systemctl reload postgresql`;
    }

    return {
      connected: false,
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      error: rawError,
      clientIp,
      isPgHbaError,
      suggestedFix,
      checkedAt: new Date().toISOString(),
    };
  }
}

/**
 * Initialize core tables in PostgreSQL when connection is active
 */
export async function initPostgresSchema(): Promise<{ success: boolean; message: string }> {
  const pool = getPostgresPool();
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE EXTENSION IF NOT EXISTS pgcrypto;

        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE,
          display_name TEXT NOT NULL,
          avatar_url TEXT,
          line_user_id TEXT UNIQUE,
          line_connected BOOLEAN DEFAULT FALSE,
          reminder_days TEXT[] DEFAULT ARRAY['mon', 'wed', 'fri'],
          reminder_time TIME DEFAULT '20:00:00',
          snooze_minutes INT DEFAULT 30,
          daily_goal_pages INT DEFAULT 20,
          current_streak INT DEFAULT 0,
          longest_streak INT DEFAULT 0,
          last_active_date DATE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        DO $$ BEGIN
          CREATE TYPE book_status_enum AS ENUM ('backlog', 'reading', 'completed', 'dropped');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;

        CREATE TABLE IF NOT EXISTS books (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          author TEXT,
          cover_url TEXT,
          cover_emoji TEXT DEFAULT '📚',
          total_pages INT NOT NULL CHECK (total_pages > 0),
          current_page INT NOT NULL DEFAULT 0 CHECK (current_page >= 0),
          status book_status_enum DEFAULT 'backlog',
          category TEXT DEFAULT 'General',
          target_pages_per_day INT DEFAULT 20,
          target_finish_date DATE,
          started_at TIMESTAMPTZ,
          completed_at TIMESTAMPTZ,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT valid_page_progress CHECK (current_page <= total_pages)
        );

        CREATE TABLE IF NOT EXISTS reading_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
          pages_read INT NOT NULL CHECK (pages_read > 0),
          from_page INT NOT NULL,
          to_page INT NOT NULL,
          source TEXT DEFAULT 'line_quick_reply',
          note TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS scheduled_notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          book_id UUID REFERENCES books(id) ON DELETE SET NULL,
          scheduled_for TIMESTAMPTZ NOT NULL,
          status TEXT DEFAULT 'pending',
          notification_type TEXT DEFAULT 'daily_reminder',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS subscriptions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_email TEXT,
          plan_name TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'trialing',
          trial_ends_at TIMESTAMPTZ,
          current_period_end TIMESTAMPTZ,
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS user_badges (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          badge_id TEXT NOT NULL,
          unlocked_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, badge_id)
        );

        CREATE TABLE IF NOT EXISTS webhook_logs (
          id TEXT PRIMARY KEY,
          timestamp TEXT,
          source TEXT,
          event_type TEXT,
          user_id TEXT,
          payload JSONB,
          bot_reply TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS user_storage (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          file_key TEXT NOT NULL UNIQUE,
          file_name TEXT NOT NULL,
          file_size INT NOT NULL CHECK (file_size > 0),
          mime_type TEXT NOT NULL,
          url TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_books_user_status ON books(user_id, status);
        CREATE INDEX IF NOT EXISTS idx_reading_logs_user_date ON reading_logs(user_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_storage_user ON user_storage(user_id);

        INSERT INTO users (
          id, email, display_name, line_user_id, line_connected,
          reminder_days, reminder_time, snooze_minutes, daily_goal_pages
        )
        VALUES (
          'a0000000-0000-0000-0000-000000000001',
          'reader@bunnarak.site',
          'Bunnarak',
          NULL,
          FALSE,
          ARRAY['mon', 'wed', 'fri'],
          '20:00:00',
          30,
          20
        )
        ON CONFLICT (id) DO NOTHING;
      `);

      return { success: true, message: 'สร้างตาราง PostgreSQL ทั้ง 9 ตารางรองรับระบบและรูปภาพ 100% เรียบร้อย' };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to initialize schema' };
  }
}

/**
 * Execute a query on PostgreSQL
 */
export async function queryPostgres<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getPostgresPool();
  const res = await pool.query(text, params);
  return res.rows;
}
