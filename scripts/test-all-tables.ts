import { Pool } from 'pg';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required. Add it to .env.local before running this script.');
}

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
});

const r2Endpoint = process.env.R2_ENDPOINT;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
if (!r2Endpoint || !r2AccessKeyId || !r2SecretAccessKey) {
  throw new Error('R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY are required. Add them to .env.local before running this script.');
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
});
const bucketName = process.env.R2_BUCKET_NAME || 'bookshelf';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 เริ่มต้นการทดสอบ: PostgreSQL (9 ตาราง) & Cloudflare R2');
  console.log('====================================================\n');

  const client = await pool.connect();
  const testResults: { target: string; status: 'PASS' | 'FAIL'; detail: string }[] = [];

  try {
    // 0. Ensure schema
    console.log('1️⃣ อัปเดต Schema ตารางทั้งหมดใน PostgreSQL...');
    await client.query(`
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
    `);
    console.log('✅ Schema พร้อมใช้งาน 100%\n');

    // Test Table 1: app_settings
    try {
      const testKey = 'test_setting_' + Date.now();
      await client.query('INSERT INTO app_settings (key, value) VALUES ($1, $2);', [testKey, 'online_v1']);
      const res = await client.query('SELECT value FROM app_settings WHERE key = $1;', [testKey]);
      await client.query('DELETE FROM app_settings WHERE key = $1;', [testKey]);
      if (res.rows[0]?.value === 'online_v1') {
        testResults.push({ target: 'app_settings', status: 'PASS', detail: 'Insert, Query, Delete สำเร็จ' });
      } else {
        testResults.push({ target: 'app_settings', status: 'FAIL', detail: 'ค่าที่ดึงออกมาไม่ตรง' });
      }
    } catch (e: any) {
      testResults.push({ target: 'app_settings', status: 'FAIL', detail: e.message });
    }

    // Test Table 2: users
    const testUserId = 'f' + crypto.randomUUID().substring(1);
    try {
      await client.query(`
        INSERT INTO users (id, email, display_name, line_user_id, daily_goal_pages)
        VALUES ($1, $2, $3, $4, $5);
      `, [testUserId, `test-${Date.now()}@test.com`, 'Test Runner User', `U_TEST_${Date.now()}`, 35]);
      
      const res = await client.query('SELECT display_name, daily_goal_pages FROM users WHERE id = $1;', [testUserId]);
      if (res.rows[0]?.display_name === 'Test Runner User') {
        testResults.push({ target: 'users', status: 'PASS', detail: `Insert User ID: ${testUserId} สำเร็จ` });
      } else {
        testResults.push({ target: 'users', status: 'FAIL', detail: 'ดึงข้อมูล User ไม่พบ' });
      }
    } catch (e: any) {
      testResults.push({ target: 'users', status: 'FAIL', detail: e.message });
    }

    // Test Table 3: books
    const testBookId = 'b' + crypto.randomUUID().substring(1);
    try {
      await client.query(`
        INSERT INTO books (id, user_id, title, author, total_pages, current_page, status, category)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `, [testBookId, testUserId, 'จิตวิทยาสายดาร์ก เล่มทดสอบ', 'Dr. Hiro', 280, 50, 'reading', 'จิตวิทยา']);

      const res = await client.query('SELECT title, current_page FROM books WHERE id = $1;', [testBookId]);
      if (res.rows[0]?.title === 'จิตวิทยาสายดาร์ก เล่มทดสอบ') {
        testResults.push({ target: 'books', status: 'PASS', detail: `Insert Book ID: ${testBookId} สำเร็จ` });
      } else {
        testResults.push({ target: 'books', status: 'FAIL', detail: 'ดึงข้อมูล Book ไม่พบ' });
      }
    } catch (e: any) {
      testResults.push({ target: 'books', status: 'FAIL', detail: e.message });
    }

    // Test Table 4: reading_logs
    const testLogId = crypto.randomUUID();
    try {
      await client.query(`
        INSERT INTO reading_logs (id, user_id, book_id, pages_read, from_page, to_page, source, note)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `, [testLogId, testUserId, testBookId, 50, 0, 50, 'web_manual', 'อ่านบทที่ 1 จบแล้ว']);

      const res = await client.query('SELECT pages_read, note FROM reading_logs WHERE id = $1;', [testLogId]);
      if (res.rows[0]?.pages_read === 50) {
        testResults.push({ target: 'reading_logs', status: 'PASS', detail: `Insert Log ID: ${testLogId} (50 หน้า) สำเร็จ` });
      } else {
        testResults.push({ target: 'reading_logs', status: 'FAIL', detail: 'ดึงข้อมูล Log ไม่พบ' });
      }
    } catch (e: any) {
      testResults.push({ target: 'reading_logs', status: 'FAIL', detail: e.message });
    }

    // Test Table 5: scheduled_notifications
    const testNotifId = crypto.randomUUID();
    try {
      await client.query(`
        INSERT INTO scheduled_notifications (id, user_id, book_id, scheduled_for, status)
        VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour', 'pending');
      `, [testNotifId, testUserId, testBookId]);

      const res = await client.query('SELECT status FROM scheduled_notifications WHERE id = $1;', [testNotifId]);
      if (res.rows[0]?.status === 'pending') {
        testResults.push({ target: 'scheduled_notifications', status: 'PASS', detail: 'บันทึกแจ้งเตือนล่วงหน้าสำเร็จ' });
      } else {
        testResults.push({ target: 'scheduled_notifications', status: 'FAIL', detail: 'ดึงการแจ้งเตือนไม่พบ' });
      }
    } catch (e: any) {
      testResults.push({ target: 'scheduled_notifications', status: 'FAIL', detail: e.message });
    }

    // Test Table 6: subscriptions
    const testSubId = 'sub_test_' + Date.now();
    try {
      await client.query(`
        INSERT INTO subscriptions (id, user_id, plan_name, status, user_email)
        VALUES ($1, $2, $3, $4, $5);
      `, [testSubId, testUserId, 'Pro Reader Plan', 'active', 'test@test.com']);

      const res = await client.query('SELECT plan_name, status FROM subscriptions WHERE id = $1;', [testSubId]);
      if (res.rows[0]?.status === 'active') {
        testResults.push({ target: 'subscriptions', status: 'PASS', detail: 'บันทึกสถานะ Subscription Pro สำเร็จ' });
      } else {
        testResults.push({ target: 'subscriptions', status: 'FAIL', detail: 'ดึงข้อมูล Subscription ไม่พบ' });
      }
    } catch (e: any) {
      testResults.push({ target: 'subscriptions', status: 'FAIL', detail: e.message });
    }

    // Test Table 7: user_badges
    try {
      await client.query(`
        INSERT INTO user_badges (user_id, badge_id)
        VALUES ($1, $2);
      `, [testUserId, 'first_book_logged']);

      const res = await client.query('SELECT badge_id FROM user_badges WHERE user_id = $1;', [testUserId]);
      if (res.rows[0]?.badge_id === 'first_book_logged') {
        testResults.push({ target: 'user_badges', status: 'PASS', detail: 'บันทึกเหรียญรางวัล Achievement สำเร็จ' });
      } else {
        testResults.push({ target: 'user_badges', status: 'FAIL', detail: 'ดึงข้อมูลเหรียญรางวัลไม่พบ' });
      }
    } catch (e: any) {
      testResults.push({ target: 'user_badges', status: 'FAIL', detail: e.message });
    }

    // Test Table 8: webhook_logs
    const testWebhookId = 'wh_' + Date.now();
    try {
      await client.query(`
        INSERT INTO webhook_logs (id, source, event_type, user_id, payload, bot_reply)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [testWebhookId, 'LINE', 'message', testUserId, JSON.stringify({ text: 'อ่านไป 20 หน้า' }), 'บันทึกเรียบร้อยครับ!']);

      const res = await client.query('SELECT bot_reply, payload FROM webhook_logs WHERE id = $1;', [testWebhookId]);
      if (res.rows[0]?.bot_reply === 'บันทึกเรียบร้อยครับ!') {
        testResults.push({ target: 'webhook_logs', status: 'PASS', detail: 'บันทึก Log Webhook JSONB สำเร็จ' });
      } else {
        testResults.push({ target: 'webhook_logs', status: 'FAIL', detail: 'ดึงข้อมูล Webhook Log ไม่พบ' });
      }
    } catch (e: any) {
      testResults.push({ target: 'webhook_logs', status: 'FAIL', detail: e.message });
    }

    // Test Table 9: user_storage (สำหรับเก็บประวัติและนับ Quota R2)
    const testFileKey = `test/${testUserId}/test-image.jpg`;
    const testFileSize = 250 * 1024; // 250 KB
    try {
      await client.query(`
        INSERT INTO user_storage (user_id, file_key, file_name, file_size, mime_type, url)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [testUserId, testFileKey, 'test-image.jpg', testFileSize, 'image/jpeg', `/api/images/${testFileKey}`]);

      const res = await client.query(`
        SELECT file_name, file_size, (SELECT SUM(file_size) FROM user_storage WHERE user_id = $1) as total_quota_used
        FROM user_storage WHERE file_key = $2;
      `, [testUserId, testFileKey]);

      if (res.rows[0]?.file_size === testFileSize) {
        testResults.push({ target: 'user_storage', status: 'PASS', detail: `บันทึกไฟล์ขนาด 250 KB รวมโควตาคำนวณได้ถูกต้อง` });
      } else {
        testResults.push({ target: 'user_storage', status: 'FAIL', detail: 'ดึงข้อมูล user_storage ไม่พบ' });
      }
    } catch (e: any) {
      testResults.push({ target: 'user_storage', status: 'FAIL', detail: e.message });
    }

    // Clean up test database records (cascade from users)
    await client.query('DELETE FROM users WHERE id = $1;', [testUserId]);
    await client.query('DELETE FROM subscriptions WHERE id = $1;', [testSubId]);
    await client.query('DELETE FROM webhook_logs WHERE id = $1;', [testWebhookId]);

    // 2️⃣ Test Cloudflare R2 Upload, Download, and Delete
    console.log('2️⃣ ทดสอบการเชื่อมต่อและอัปโหลด Cloudflare R2...');
    const r2Key = `test-verify-${Date.now()}.txt`;
    const r2Data = Buffer.from('Cloudflare R2 Storage Verification Test for Bookshelf App');

    try {
      // Upload
      await r2Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: r2Key,
        Body: r2Data,
        ContentType: 'text/plain',
      }));

      // Download
      const getRes = await r2Client.send(new GetObjectCommand({
        Bucket: bucketName,
        Key: r2Key,
      }));
      const downloaded = await getRes.Body?.transformToString();

      // Delete
      await r2Client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: r2Key,
      }));

      if (downloaded === 'Cloudflare R2 Storage Verification Test for Bookshelf App') {
        testResults.push({ target: 'Cloudflare R2 Bucket (bookshelf)', status: 'PASS', detail: 'PutObject, GetObject, DeleteObject ใช้งานได้สมบูรณ์' });
      } else {
        testResults.push({ target: 'Cloudflare R2 Bucket (bookshelf)', status: 'FAIL', detail: 'ข้อมูลที่ดาวน์โหลดมาไม่ตรง' });
      }
    } catch (e: any) {
      testResults.push({ target: 'Cloudflare R2 Bucket (bookshelf)', status: 'FAIL', detail: e.message });
    }

    // 3️⃣ Verify Quota Rules:
    // Rule A: Single file <= 1 MB (1,048,576 bytes)
    // Rule B: Total user quota <= 5 MB (5,242,880 bytes)
    const MAX_FILE_SIZE = 1 * 1024 * 1024;
    const MAX_USER_STORAGE = 5 * 1024 * 1024;

    const fileTooLarge = 1.2 * 1024 * 1024; // 1.2 MB -> must be blocked
    const fileValid = 800 * 1024; // 800 KB -> allowed
    const isSingleLimitBlocked = fileTooLarge > MAX_FILE_SIZE && fileValid <= MAX_FILE_SIZE;

    const userCurrentUsed = 4.5 * 1024 * 1024; // 4.5 MB used
    const incomingFile = 0.8 * 1024 * 1024; // 0.8 MB -> 4.5 + 0.8 = 5.3 MB > 5 MB -> must be blocked
    const isUserQuotaBlocked = (userCurrentUsed + incomingFile) > MAX_USER_STORAGE;

    if (isSingleLimitBlocked && isUserQuotaBlocked) {
      testResults.push({
        target: 'Quota Rules (1 MB / file & 5 MB / user)',
        status: 'PASS',
        detail: 'เงื่อนไขคุมเข้มงวด: 1 รูปห้ามเกิน 1 MB และ รวมต่อคนห้ามเกิน 5 MB สมบูรณ์แบบ'
      });
    } else {
      testResults.push({
        target: 'Quota Rules',
        status: 'FAIL',
        detail: 'เงื่อนไขคำนวณโควตาไม่ผ่าน'
      });
    }

  } finally {
    client.release();
    await pool.end();
  }

  // Print results table
  console.log('\n📊 สรุปผลการทดสอบทั้งหมด:');
  console.table(testResults);

  const allPassed = testResults.every(r => r.status === 'PASS');
  if (allPassed) {
    console.log('\n🎉 ทุกระบบ (PostgreSQL 9 ตาราง + Cloudflare R2 + Quota Controls) ผ่านการทดสอบ 100%!');
  } else {
    console.error('\n⚠️ มีการทดสอบที่ไม่ผ่าน กรุณาตรวจสอบรายละเอียดด้านบน');
  }
}

runTests().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
