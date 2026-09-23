import { Pool } from 'pg';

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

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required for PostgreSQL storage');
  }
  return url;
}

export function getDatabase(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return pool;
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await getDatabase().query(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS webhook_logs (
          id TEXT PRIMARY KEY,
          timestamp TEXT,
          source TEXT,
          event_type TEXT,
          user_id TEXT,
          payload JSONB,
          bot_reply TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await initDefaultSettings();
    })();
  }
  return schemaReady;
}

function envDefault(key: string, fallback = ''): string {
  return process.env[key] || fallback;
}

async function initDefaultSettings() {
  const defaults: Record<string, string> = {
    line_bot_name: envDefault('LINE_BOT_NAME', 'Bunnarak'),
    line_bot_id: envDefault('LINE_BOT_ID', '@869uobem'),
    line_channel_id: envDefault('LINE_CHANNEL_ID', '2011678531'),
    line_channel_secret: envDefault('LINE_CHANNEL_SECRET'),
    line_channel_access_token: envDefault('LINE_CHANNEL_ACCESS_TOKEN'),
    line_target_user_id: envDefault('LINE_TARGET_USER_ID', 'U9330ea2a3097a7e8ea7b81a9eeb82088'),
    line_enabled: 'true',
    line_reminder_days_ahead: '1',
  };

  for (const [key, value] of Object.entries(defaults)) {
    await getDatabase().query(
      `
        INSERT INTO app_settings (key, value, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (key) DO NOTHING
      `,
      [key, value],
    );
  }
}

/**
 * ดึงค่า setting ตัวเดียวจาก PostgreSQL Table app_settings
 */
export async function getSettingFromDb(key: string, defaultValue = ''): Promise<string> {
  try {
    await ensureSchema();
    const result = await getDatabase().query<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = $1',
      [key],
    );
    return result.rows[0]?.value ?? defaultValue;
  } catch (err) {
    console.error(`Error querying ${key} from PostgreSQL:`, err);
    return defaultValue;
  }
}

/**
 * บันทึกหรืออัปเดต setting ลง PostgreSQL Table app_settings (UPSERT)
 */
export async function setSettingInDb(key: string, value: string): Promise<void> {
  try {
    await ensureSchema();
    await getDatabase().query(
      `
        INSERT INTO app_settings (key, value, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (key) DO UPDATE SET
          value = EXCLUDED.value,
          updated_at = NOW()
      `,
      [key, value],
    );
  } catch (err) {
    console.error(`Error saving ${key} to PostgreSQL:`, err);
  }
}

/**
 * ดึงการตั้งค่า LINE ทั้งหมดจาก PostgreSQL
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
    getSettingFromDb('line_bot_name', envDefault('LINE_BOT_NAME', 'Bunnarak')),
    getSettingFromDb('line_bot_id', envDefault('LINE_BOT_ID', '@869uobem')),
    getSettingFromDb('line_channel_id', envDefault('LINE_CHANNEL_ID', '2011678531')),
    getSettingFromDb('line_channel_access_token', envDefault('LINE_CHANNEL_ACCESS_TOKEN')),
    getSettingFromDb('line_channel_secret', envDefault('LINE_CHANNEL_SECRET')),
    getSettingFromDb('line_target_user_id', envDefault('LINE_TARGET_USER_ID', 'U9330ea2a3097a7e8ea7b81a9eeb82088')),
    getSettingFromDb('line_enabled', 'true'),
    getSettingFromDb('line_reminder_days_ahead', '1'),
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
 * บันทึกการตั้งค่า LINE ทั้งหมดลง PostgreSQL
 */
export async function saveLineConfigToDb(config: Partial<DbLineConfig>): Promise<DbLineConfig> {
  const updates: Array<Promise<void>> = [];
  if (config.botName !== undefined) updates.push(setSettingInDb('line_bot_name', config.botName));
  if (config.botBasicId !== undefined) updates.push(setSettingInDb('line_bot_id', config.botBasicId));
  if (config.channelId !== undefined) updates.push(setSettingInDb('line_channel_id', config.channelId));
  if (config.channelAccessToken !== undefined) updates.push(setSettingInDb('line_channel_access_token', config.channelAccessToken));
  if (config.channelSecret !== undefined) updates.push(setSettingInDb('line_channel_secret', config.channelSecret));
  if (config.targetUserId !== undefined) updates.push(setSettingInDb('line_target_user_id', config.targetUserId));
  if (config.enabled !== undefined) updates.push(setSettingInDb('line_enabled', String(config.enabled)));
  if (config.reminderDaysAhead !== undefined) updates.push(setSettingInDb('line_reminder_days_ahead', String(config.reminderDaysAhead)));

  await Promise.all(updates);
  return getLineConfigFromDb();
}

/**
 * ดึงรายการ row ทั้งหมดใน app_settings เพื่อแสดงในหน้า Debug / Backoffice
 */
export async function getAllAppSettingsFromDb(): Promise<Array<{ key: string; value: string; updated_at: string }>> {
  try {
    await ensureSchema();
    const result = await getDatabase().query<{ key: string; value: string; updated_at: Date }>(
      'SELECT key, value, updated_at FROM app_settings ORDER BY key ASC',
    );
    return result.rows.map((row) => ({
      key: row.key,
      value: row.value,
      updated_at: row.updated_at.toISOString(),
    }));
  } catch (err) {
    console.error('Error querying all settings from PostgreSQL:', err);
    return [];
  }
}
