import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { testPostgresConnection, queryPostgres, PostgresConnectionStatus, getPostgresConfig } from './postgres';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'tsundoku.db');

export interface DbLineConfig {
  botName: string;
  botBasicId: string;
  channelId: string;
  channelAccessToken: string;
  channelSecret: string;
  targetUserId: string;
  enabled: boolean;
  reminderDaysAhead: number;
}

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    dbInstance = new DatabaseSync(DB_FILE);

    // Concurrency optimizations for Next.js multi-workers
    dbInstance.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 5000;

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS webhook_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT,
        source TEXT,
        event_type TEXT,
        user_id TEXT,
        payload TEXT,
        bot_reply TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Seed default settings if empty
    initDefaultSettings(dbInstance);
  }

  return dbInstance;
}

function initDefaultSettings(db: DatabaseSync) {
  const defaults: Record<string, string> = {
    'line_bot_name': process.env.LINE_BOT_NAME || 'Bunnarak',
    'line_bot_id': process.env.LINE_BOT_ID || '@869uobem',
    'line_channel_id': process.env.LINE_CHANNEL_ID || '2011678531',
    'line_channel_secret': process.env.LINE_CHANNEL_SECRET || '',
    'line_channel_access_token': process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    'line_target_user_id': process.env.LINE_TARGET_USER_ID || 'U9330ea2a3097a7e8ea7b81a9eeb82088',
    'line_enabled': 'true',
    'line_reminder_days_ahead': '1',
    'postgres_host': process.env.POSTGRES_HOST || '210.246.215.195',
    'postgres_port': process.env.POSTGRES_PORT || '5433',
    'postgres_db': process.env.POSTGRES_DB || 'bookshelf',
    'postgres_user': process.env.POSTGRES_USER || 'bookshelf_app',
  };

  const insertStmt = db.prepare(`
    INSERT INTO app_settings (key, value, updated_at) 
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);

  for (const [k, v] of Object.entries(defaults)) {
    insertStmt.run(k, v);
  }
}

/**
 * ดึงค่า setting ตัวเดียวจาก Database Table app_settings (SQLite)
 */
export function getSettingFromDb(key: string, defaultValue: string = ''): string {
  try {
    const db = getDatabase();
    const query = db.prepare('SELECT value FROM app_settings WHERE key = ?');
    const row = query.get(key) as { value: string } | undefined;
    return row ? row.value : defaultValue;
  } catch (err) {
    console.error(`Error querying ${key} from DB:`, err);
    return defaultValue;
  }
}

async function getSettingFromPostgres(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const rows = await queryPostgres<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = $1 LIMIT 1',
      [key],
    );
    return rows[0]?.value ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * บันทึกหรืออัปเดต setting ลง Database Table app_settings (UPSERT)
 * ซิงค์ทั้ง SQLite และพยายามเขียนลง PostgreSQL
 */
export async function setSettingInDb(key: string, value: string): Promise<void> {
  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO app_settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = datetime('now')
    `);
    stmt.run(key, value);

    await queryPostgres(`
      INSERT INTO app_settings (key, value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `, [key, value]);
  } catch (err) {
    console.error(`Error saving ${key} to DB:`, err);
  }
}

/**
 * ดึงการตั้งค่า LINE ทั้งหมดจาก Database
 */
export async function getLineConfigFromDb(): Promise<DbLineConfig> {
  const [
    botName,
    botBasicId,
    channelId,
    channelAccessToken,
    channelSecret,
    targetUserId,
    enabled,
    reminderDaysAhead,
  ] = await Promise.all([
    getSettingFromPostgres('line_bot_name', getSettingFromDb('line_bot_name', process.env.LINE_BOT_NAME || 'Bunnarak')),
    getSettingFromPostgres('line_bot_id', getSettingFromDb('line_bot_id', process.env.LINE_BOT_ID || '@869uobem')),
    getSettingFromPostgres('line_channel_id', getSettingFromDb('line_channel_id', process.env.LINE_CHANNEL_ID || '2011678531')),
    getSettingFromPostgres('line_channel_access_token', getSettingFromDb('line_channel_access_token', process.env.LINE_CHANNEL_ACCESS_TOKEN || '')),
    getSettingFromPostgres('line_channel_secret', getSettingFromDb('line_channel_secret', process.env.LINE_CHANNEL_SECRET || '')),
    getSettingFromPostgres('line_target_user_id', getSettingFromDb('line_target_user_id', process.env.LINE_TARGET_USER_ID || 'U9330ea2a3097a7e8ea7b81a9eeb82088')),
    getSettingFromPostgres('line_enabled', getSettingFromDb('line_enabled', 'true')),
    getSettingFromPostgres('line_reminder_days_ahead', getSettingFromDb('line_reminder_days_ahead', '1')),
  ]);

  return {
    botName,
    botBasicId,
    channelId,
    channelAccessToken,
    channelSecret,
    targetUserId,
    enabled: enabled === 'true',
    reminderDaysAhead: Number(reminderDaysAhead) || 1,
  };
}

/**
 * บันทึกการตั้งค่า LINE ทั้งหมดลง Database
 */
export async function saveLineConfigToDb(config: Partial<DbLineConfig>): Promise<DbLineConfig> {
  const writes: Promise<void>[] = [];
  if (config.botName !== undefined) writes.push(setSettingInDb('line_bot_name', config.botName));
  if (config.botBasicId !== undefined) writes.push(setSettingInDb('line_bot_id', config.botBasicId));
  if (config.channelId !== undefined) writes.push(setSettingInDb('line_channel_id', config.channelId));
  if (config.channelAccessToken !== undefined) writes.push(setSettingInDb('line_channel_access_token', config.channelAccessToken));
  if (config.channelSecret !== undefined) writes.push(setSettingInDb('line_channel_secret', config.channelSecret));
  if (config.targetUserId !== undefined) writes.push(setSettingInDb('line_target_user_id', config.targetUserId));
  if (config.enabled !== undefined) writes.push(setSettingInDb('line_enabled', String(config.enabled)));
  if (config.reminderDaysAhead !== undefined) writes.push(setSettingInDb('line_reminder_days_ahead', String(config.reminderDaysAhead)));

  await Promise.all(writes);
  return getLineConfigFromDb();
}

/**
 * ดึงรายการ row ทั้งหมดใน app_settings เพื่อแสดงในหน้า Debug / Backoffice
 */
export async function getAllAppSettingsFromDb(): Promise<Array<{ key: string; value: string; updated_at: string }>> {
  try {
    const pgRows = await queryPostgres<{ key: string; value: string; updated_at: string }>(
      'SELECT key, value, updated_at::text FROM app_settings ORDER BY key ASC'
    );
    if (pgRows && pgRows.length > 0) {
      return pgRows;
    }
  } catch {}

  try {
    const db = getDatabase();
    const query = db.prepare('SELECT key, value, updated_at FROM app_settings ORDER BY key ASC');
    return query.all() as Array<{ key: string; value: string; updated_at: string }>;
  } catch (err) {
    console.error('Error querying all settings from DB:', err);
    return [];
  }
}

/**
 * Real-time overall Database Status including PostgreSQL & SQLite
 */
export async function getDbStatus(): Promise<{
  activeDriver: 'PostgreSQL' | 'SQLite (Local Fallback)';
  postgres: PostgresConnectionStatus;
  sqlite: {
    filePath: string;
    exists: boolean;
    rowCount: number;
  };
}> {
  const pgStatus = await testPostgresConnection();
  const db = getDatabase();
  let rowCount = 0;
  try {
    const countRes = db.prepare('SELECT COUNT(*) as count FROM app_settings').get() as { count: number };
    rowCount = countRes?.count || 0;
  } catch {}

  return {
    activeDriver: pgStatus.connected ? 'PostgreSQL' : 'SQLite (Local Fallback)',
    postgres: pgStatus,
    sqlite: {
      filePath: DB_FILE,
      exists: fs.existsSync(DB_FILE),
      rowCount,
    },
  };
}
