import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

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
    'line_bot_name': 'Bunnarak',
    'line_bot_id': '@869uobem',
    'line_channel_id': '2011678531',
    'line_channel_secret': 'fa2f8174939f149782b226a3c75719f7',
    'line_channel_access_token': '2bsUpUTzOZkHO7RQudYPiaOmgYR/qZz2huW0nsR8wrdzVRfi0AXGsDkv5LREzf7g6VA12tugSFEktoCvQfIn3I3apipaB7rY0CeMWDkRe9WMy1jXXzkEy28UJ8Pb98GsmEqq6wH6ZDdFm1Bxb5yFwAdB04t89/1O/w1cDnyilFU=',
    'line_target_user_id': 'U9330ea2a3097a7e8ea7b81a9eeb82088',
    'line_enabled': 'true',
    'line_reminder_days_ahead': '1'
  };

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO app_settings (key, value, updated_at) 
    VALUES (?, ?, datetime('now'))
  `);

  for (const [k, v] of Object.entries(defaults)) {
    insertStmt.run(k, v);
  }
}

/**
 * ดึงค่า setting ตัวเดียวจาก Database Table app_settings
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

/**
 * บันทึกหรืออัปเดต setting ลง Database Table app_settings (UPSERT)
 */
export function setSettingInDb(key: string, value: string): void {
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
  } catch (err) {
    console.error(`Error saving ${key} to DB:`, err);
  }
}

/**
 * ดึงการตั้งค่า LINE ทั้งหมดจาก Database
 */
export function getLineConfigFromDb(): DbLineConfig {
  return {
    botName: getSettingFromDb('line_bot_name', 'Bunnarak'),
    botBasicId: getSettingFromDb('line_bot_id', '@869uobem'),
    channelId: getSettingFromDb('line_channel_id', '2011678531'),
    channelAccessToken: getSettingFromDb('line_channel_access_token', ''),
    channelSecret: getSettingFromDb('line_channel_secret', ''),
    targetUserId: getSettingFromDb('line_target_user_id', 'U9330ea2a3097a7e8ea7b81a9eeb82088'),
    enabled: getSettingFromDb('line_enabled', 'true') === 'true',
    reminderDaysAhead: Number(getSettingFromDb('line_reminder_days_ahead', '1')) || 1,
  };
}

/**
 * บันทึกการตั้งค่า LINE ทั้งหมดลง Database
 */
export function saveLineConfigToDb(config: Partial<DbLineConfig>): DbLineConfig {
  if (config.botName !== undefined) setSettingInDb('line_bot_name', config.botName);
  if (config.botBasicId !== undefined) setSettingInDb('line_bot_id', config.botBasicId);
  if (config.channelId !== undefined) setSettingInDb('line_channel_id', config.channelId);
  if (config.channelAccessToken !== undefined) setSettingInDb('line_channel_access_token', config.channelAccessToken);
  if (config.channelSecret !== undefined) setSettingInDb('line_channel_secret', config.channelSecret);
  if (config.targetUserId !== undefined) setSettingInDb('line_target_user_id', config.targetUserId);
  if (config.enabled !== undefined) setSettingInDb('line_enabled', String(config.enabled));
  if (config.reminderDaysAhead !== undefined) setSettingInDb('line_reminder_days_ahead', String(config.reminderDaysAhead));

  return getLineConfigFromDb();
}

/**
 * ดึงรายการ row ทั้งหมดใน app_settings เพื่อแสดงในหน้า Debug / Backoffice
 */
export function getAllAppSettingsFromDb(): Array<{ key: string; value: string; updated_at: string }> {
  try {
    const db = getDatabase();
    const query = db.prepare('SELECT key, value, updated_at FROM app_settings ORDER BY key ASC');
    return query.all() as Array<{ key: string; value: string; updated_at: string }>;
  } catch (err) {
    console.error('Error querying all settings from DB:', err);
    return [];
  }
}
