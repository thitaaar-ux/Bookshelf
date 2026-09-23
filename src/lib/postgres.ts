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
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://bookshelf_app:9i3rehIpjV3udEzwhtnUKHK4PtQD3qiK@210.246.215.195:5433/bookshelf';

  const host = process.env.POSTGRES_HOST || '210.246.215.195';
  const port = Number(process.env.POSTGRES_PORT) || 5433;
  const database = process.env.POSTGRES_DB || 'bookshelf';
  const user = process.env.POSTGRES_USER || 'bookshelf_app';

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
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS books (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          author TEXT,
          total_pages INT NOT NULL DEFAULT 0,
          current_page INT NOT NULL DEFAULT 0,
          status TEXT DEFAULT 'backlog',
          category TEXT DEFAULT 'General',
          target_pages_per_day INT DEFAULT 20,
          target_finish_date TEXT,
          cover_emoji TEXT DEFAULT '📚',
          cover_url TEXT,
          notes TEXT,
          started_at TEXT,
          completed_at TEXT,
          added_at TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS reading_logs (
          id TEXT PRIMARY KEY,
          book_id TEXT,
          book_title TEXT,
          pages_read INT NOT NULL,
          from_page INT NOT NULL,
          to_page INT NOT NULL,
          timestamp TEXT,
          source TEXT DEFAULT 'web_manual',
          note TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS webhook_logs (
          id TEXT PRIMARY KEY,
          timestamp TEXT,
          source TEXT,
          event_type TEXT,
          user_id TEXT,
          payload TEXT,
          bot_reply TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      return { success: true, message: 'สร้างตาราง PostgreSQL สำเร็จเรียบร้อย' };
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
