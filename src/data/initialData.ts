import { Book, Badge, UserSchedule, ReadingLog } from '../types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'Atomic Habits (เพราะชีวิตดีได้กว่าที่เป็น)',
    author: 'James Clear',
    totalPages: 320,
    currentPage: 184,
    coverEmoji: '⚡',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    status: 'reading',
    category: 'Self Development',
    targetPagesPerDay: 20,
    targetFinishDate: '2026-10-05',
    startedAt: '2026-09-10',
    addedAt: '2026-09-01',
    notes: 'เน้นเรื่อง 1% better every day และ Habit Stacking'
  },
  {
    id: 'book-2',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    totalPages: 499,
    currentPage: 85,
    coverEmoji: '🧠',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    status: 'reading',
    category: 'Psychology',
    targetPagesPerDay: 15,
    targetFinishDate: '2026-10-25',
    startedAt: '2026-09-14',
    addedAt: '2026-08-20',
    notes: 'System 1 vs System 2'
  },
  {
    id: 'book-3',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    totalPages: 616,
    currentPage: 0,
    coverEmoji: '💻',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80',
    status: 'backlog',
    category: 'Technology',
    targetPagesPerDay: 15,
    targetFinishDate: '2026-11-15',
    addedAt: '2026-07-15',
    notes: 'ซื้อมาดองนาน 2 เดือนแล้ว ต้องเริ่มอ่านบทแรก'
  },
  {
    id: 'book-4',
    title: 'Deep Work: Rules for Focused Success',
    author: 'Cal Newport',
    totalPages: 304,
    currentPage: 0,
    coverEmoji: '🎯',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    status: 'backlog',
    category: 'Productivity',
    targetPagesPerDay: 20,
    targetFinishDate: '2026-10-30',
    addedAt: '2026-08-10',
    notes: 'ตั้งใจจะอ่านควบคู่กับการจัดเวลา Focus Mode'
  },
  {
    id: 'book-5',
    title: 'Show Your Work!',
    author: 'Austin Kleon',
    totalPages: 224,
    currentPage: 224,
    coverEmoji: '🎨',
    coverUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
    status: 'completed',
    category: 'Creativity',
    targetPagesPerDay: 30,
    targetFinishDate: '2026-09-15',
    startedAt: '2026-09-02',
    completedAt: '2026-09-12',
    addedAt: '2026-08-28',
    notes: 'อ่านจบแล้ว สร้างแรงบันดาลใจในการเขียนบล็อกมาก'
  },
  {
    id: 'book-6',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    totalPages: 256,
    currentPage: 256,
    coverEmoji: '💰',
    coverUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80',
    status: 'completed',
    category: 'Finance',
    targetPagesPerDay: 25,
    targetFinishDate: '2026-08-30',
    startedAt: '2026-08-15',
    completedAt: '2026-08-29',
    addedAt: '2026-08-01',
    notes: 'บทเรียนเรื่องอิสรภาพทางการเงิน'
  }
];

export const INITIAL_SCHEDULE: UserSchedule = {
  reminderDays: ['mon', 'wed', 'fri', 'sun'],
  reminderTime: '20:00',
  targetPagesPerDay: 20,
  snoozeDurationMinutes: 30,
  lineConnected: true,
  lineUserId: 'U91a82fbc789e02341bcae5102',
  lineDisplayName: 'Korn_Dev',
  activeBookId: 'book-1'
};

export const INITIAL_READING_LOGS: ReadingLog[] = [
  {
    id: 'log-30',
    bookId: 'book-1',
    bookTitle: 'Atomic Habits',
    pagesRead: 20,
    fromPage: 164,
    toPage: 184,
    timestamp: '2026-09-20 20:10',
    source: 'line_quick_reply',
    note: 'อ่านช่วงค่ำตามเวลาแจ้งเตือน LINE'
  },
  {
    id: 'log-29',
    bookId: 'book-1',
    bookTitle: 'Atomic Habits',
    pagesRead: 25,
    fromPage: 139,
    toPage: 164,
    timestamp: '2026-09-19 20:45',
    source: 'web_manual',
    note: 'อ่านบทที่ 4 เรื่อง Habit Loop'
  },
  {
    id: 'log-28',
    bookId: 'book-1',
    bookTitle: 'Atomic Habits',
    pagesRead: 20,
    fromPage: 119,
    toPage: 139,
    timestamp: '2026-09-18 20:15',
    source: 'line_quick_reply',
    note: 'ผ่านปุ่ม Quick Reply: เริ่มอ่านเลย!'
  },
  {
    id: 'log-27',
    bookId: 'book-1',
    bookTitle: 'Atomic Habits',
    pagesRead: 24,
    fromPage: 95,
    toPage: 119,
    timestamp: '2026-09-17 20:30',
    source: 'web_manual',
    note: 'อ่านช่วงค่ำ'
  },
  {
    id: 'log-26',
    bookId: 'book-2',
    bookTitle: 'Thinking, Fast and Slow',
    pagesRead: 15,
    fromPage: 70,
    toPage: 85,
    timestamp: '2026-09-16 21:00',
    source: 'line_quick_reply',
    note: 'ผ่าน LINE แจ้งเตือน'
  },
  {
    id: 'log-25',
    bookId: 'book-2',
    bookTitle: 'Thinking, Fast and Slow',
    pagesRead: 20,
    fromPage: 50,
    toPage: 70,
    timestamp: '2026-09-15 20:20',
    source: 'web_manual',
    note: 'System 1 & System 2 concepts'
  },
  {
    id: 'log-24',
    bookId: 'book-2',
    bookTitle: 'Thinking, Fast and Slow',
    pagesRead: 20,
    fromPage: 30,
    toPage: 50,
    timestamp: '2026-09-14 20:15',
    source: 'line_quick_reply',
    note: 'แจ้งเตือนวันจันทร์'
  },
  {
    id: 'log-23',
    bookId: 'book-2',
    bookTitle: 'Thinking, Fast and Slow',
    pagesRead: 15,
    fromPage: 15,
    toPage: 30,
    timestamp: '2026-09-13 21:30',
    source: 'web_manual',
    note: 'อ่านวันอาทิตย์'
  },
  {
    id: 'log-22',
    bookId: 'book-2',
    bookTitle: 'Thinking, Fast and Slow',
    pagesRead: 15,
    fromPage: 0,
    toPage: 15,
    timestamp: '2026-09-12 16:00',
    source: 'web_manual',
    note: 'เริ่มอ่านเล่มใหม่'
  },
  {
    id: 'log-21',
    bookId: 'book-1',
    bookTitle: 'Atomic Habits',
    pagesRead: 20,
    fromPage: 75,
    toPage: 95,
    timestamp: '2026-09-11 20:00',
    source: 'line_quick_reply',
    note: 'ทำเป้าสำเร็จ'
  },
  {
    id: 'log-20',
    bookId: 'book-1',
    bookTitle: 'Atomic Habits',
    pagesRead: 25,
    fromPage: 50,
    toPage: 75,
    timestamp: '2026-09-10 20:30',
    source: 'web_manual',
    note: 'กฎข้อที่ 2: ทำให้น่าดึงดูดใจ'
  },
  {
    id: 'log-19',
    bookId: 'book-1',
    bookTitle: 'Atomic Habits',
    pagesRead: 25,
    fromPage: 25,
    toPage: 50,
    timestamp: '2026-09-09 20:05',
    source: 'line_quick_reply',
    note: 'อ่านตามเป้าหมาย'
  },
  {
    id: 'log-18',
    bookId: 'book-1',
    bookTitle: 'Atomic Habits',
    pagesRead: 25,
    fromPage: 0,
    toPage: 25,
    timestamp: '2026-09-07 20:15',
    source: 'web_manual',
    note: 'เริ่มต้นบทนำและพลังแห่งการเปลี่ยนแปลง 1%'
  },
  {
    id: 'log-17',
    bookId: 'book-5',
    bookTitle: 'Steal Like an Artist',
    pagesRead: 24,
    fromPage: 200,
    toPage: 224,
    timestamp: '2026-09-05 21:00',
    source: 'line_quick_reply',
    note: '🎉 อ่านจบเล่มแล้ว!'
  },
  {
    id: 'log-16',
    bookId: 'book-5',
    bookTitle: 'Steal Like an Artist',
    pagesRead: 30,
    fromPage: 170,
    toPage: 200,
    timestamp: '2026-09-04 20:30',
    source: 'web_manual',
    note: 'ไอเดียงานสร้างสรรค์'
  },
  {
    id: 'log-15',
    bookId: 'book-5',
    bookTitle: 'Steal Like an Artist',
    pagesRead: 25,
    fromPage: 145,
    toPage: 170,
    timestamp: '2026-09-03 20:10',
    source: 'line_quick_reply',
    note: 'อ่านต่อเนื่อง'
  },
  {
    id: 'log-14',
    bookId: 'book-5',
    bookTitle: 'Steal Like an Artist',
    pagesRead: 25,
    fromPage: 120,
    toPage: 145,
    timestamp: '2026-09-02 20:15',
    source: 'web_manual',
    note: 'อ่านสะสม'
  },
  {
    id: 'log-13',
    bookId: 'book-5',
    bookTitle: 'Steal Like an Artist',
    pagesRead: 20,
    fromPage: 100,
    toPage: 120,
    timestamp: '2026-08-31 20:20',
    source: 'line_quick_reply',
    note: 'ทำเป้าประจำวัน'
  },
  {
    id: 'log-12',
    bookId: 'book-6',
    bookTitle: 'The Psychology of Money',
    pagesRead: 26,
    fromPage: 230,
    toPage: 256,
    timestamp: '2026-08-29 21:30',
    source: 'line_quick_reply',
    note: '🎉 อ่านจบเล่ม The Psychology of Money'
  },
  {
    id: 'log-11',
    bookId: 'book-6',
    bookTitle: 'The Psychology of Money',
    pagesRead: 25,
    fromPage: 205,
    toPage: 230,
    timestamp: '2026-08-28 20:15',
    source: 'web_manual',
    note: 'บทสรุปเรื่องอิสรภาพทางการเงิน'
  },
  {
    id: 'log-10',
    bookId: 'book-6',
    bookTitle: 'The Psychology of Money',
    pagesRead: 20,
    fromPage: 185,
    toPage: 205,
    timestamp: '2026-08-26 20:05',
    source: 'line_quick_reply',
    note: 'อ่านผ่านการเตือน'
  },
  {
    id: 'log-9',
    bookId: 'book-6',
    bookTitle: 'The Psychology of Money',
    pagesRead: 25,
    fromPage: 160,
    toPage: 185,
    timestamp: '2026-08-25 20:30',
    source: 'web_manual',
    note: 'บทเรื่องความมั่งคั่งคือสิ่งที่คุณมองไม่เห็น'
  },
  {
    id: 'log-8',
    bookId: 'book-6',
    bookTitle: 'The Psychology of Money',
    pagesRead: 20,
    fromPage: 140,
    toPage: 160,
    timestamp: '2026-08-23 20:00',
    source: 'line_quick_reply',
    note: 'อ่านวันอาทิตย์'
  },
  {
    id: 'log-7',
    bookId: 'book-6',
    bookTitle: 'The Psychology of Money',
    pagesRead: 25,
    fromPage: 115,
    toPage: 140,
    timestamp: '2026-08-22 19:45',
    source: 'web_manual',
    note: 'อ่านต่อเนื่อง 25 หน้า'
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-slayer',
    name: 'Tsundoku Slayer',
    nameTh: 'ผู้ทลายกองดอง',
    description: 'อ่านหนังสือที่เคยดองไว้จนจบครบ 2 เล่ม',
    icon: 'Sword',
    unlocked: true,
    unlockedAt: '2026-09-12',
    category: 'clearance',
    requiredCount: 2,
    currentCount: 2
  },
  {
    id: 'badge-streak-7',
    name: '7-Day Flow',
    nameTh: 'อ่านต่อเนื่อง 7 วัน',
    description: 'รักษา Streak อ่านหนังสือติดต่อกัน 7 วันไม่มีสะดุด',
    icon: 'Flame',
    unlocked: true,
    unlockedAt: '2026-09-18',
    category: 'streak',
    requiredCount: 7,
    currentCount: 7
  },
  {
    id: 'badge-century',
    name: '100 Pages Club',
    nameTh: 'เซนจูเรียน 100 หน้า',
    description: 'อ่านสะสมรวมเกิน 100 หน้าในสัปดาห์เดียว',
    icon: 'Zap',
    unlocked: true,
    unlockedAt: '2026-09-15',
    category: 'volume',
    requiredCount: 100,
    currentCount: 145
  },
  {
    id: 'badge-quick-replier',
    name: 'LINE Reflex Master',
    nameTh: 'สายฟ้าแลบ LINE Reply',
    description: 'กดเริ่มอ่านจาก LINE Quick Reply ทันทีภายใน 5 นาที 5 ครั้ง',
    icon: 'MessageSquareCheck',
    unlocked: false,
    category: 'speed',
    requiredCount: 5,
    currentCount: 3
  },
  {
    id: 'badge-streak-30',
    name: 'Habit Immortal',
    nameTh: 'นักอ่านเหนือกาลเวลา 30 วัน',
    description: 'พิชิต Streak 30 วันอย่างต่อเนื่อง',
    icon: 'Crown',
    unlocked: false,
    category: 'streak',
    requiredCount: 30,
    currentCount: 7
  },
  {
    id: 'badge-tsundoku-master',
    name: 'Zero Backlog Master',
    nameTh: 'เทพเจ้าคลีนชั้นหนังสือ',
    description: 'ทลายกองดองจนเหลือ 0 เล่ม (% Clearance 100%)',
    icon: 'Sparkles',
    unlocked: false,
    category: 'clearance',
    requiredCount: 100,
    currentCount: 50
  }
];

export const ARCHITECTURE_DOCUMENTATION = {
  techStackRecommendation: [
    {
      layer: 'Frontend Framework',
      technology: 'Next.js 14+ (App Router) หรือ Vite + React + Tailwind CSS',
      whyChosen: 'Next.js ให้ทั้ง Server Side Rendering, SEO, และ API Routes ในโปรเจกต์เดียว หรือ Vite สำหรับ SPA คล่องตัวสูง พร้อม Tailwind สำหรับแต่ง UI Monochrome Hi-Tech ได้เร็วมากโดยไม่ต้องเขียน CSS แยก',
      soloDevAdvantage: 'Zero configuration, Typescript ปลอดภัย 100%, deploy ง่ายบน Vercel หรือ Cloud Run ภายใน 1 คลิก'
    },
    {
      layer: 'Database & Auth',
      technology: 'Supabase (PostgreSQL) หรือ Firebase (Firestore + Auth)',
      whyChosen: 'Supabase ให้ Realtime Subscription, Row Level Security (RLS), และ SQL ที่รองรับ Aggregation สถิติการอ่านซับซ้อน ส่วน Firebase เหมาะมากกับ Document NoSQL ที่ยืดหยุ่น',
      soloDevAdvantage: 'ไม่ต้องดูแล Linux Database Server เอง มี Dashboard จัดการข้อมูล และ Auth ในตัว'
    },
    {
      layer: 'LINE Integration',
      technology: '@line/bot-sdk + LINE Front-end Framework (LIFF)',
      whyChosen: 'ใช้ LINE Messaging API สำหรับส่ง Push Notification พร้อม Quick Reply และใช้ LIFF ให้ผู้ใช้กดลิงก์จาก LINE แล้วเปิด Web App เสมือนเป็น Native App โดย Auto-login ด้วย LINE ID',
      soloDevAdvantage: 'ผู้ใช้คนไทยคุ้นเคย LINE ไม่ต้องโหลดแอปเพิ่มจาก App Store/Play Store'
    },
    {
      layer: 'Cron & Job Scheduler',
      technology: 'Upstash QStash หรือ Google Cloud Tasks / Cloud Scheduler',
      whyChosen: 'จัดการเวลาแจ้งเตือนรายบุคคล (User-specific cron e.g., จันทร์-พุธ-ศุกร์ 20:00) และฟังก์ชัน Snooze เลื่อนเวลา 30 นาที ได้อย่างแม่นยำและ Serverless',
      soloDevAdvantage: 'ไม่ต้องเปิด Server รัน Node-cron ค้างไว้ตลอดเวลา ไม่เสียค่าใช้จ่ายช่วง Idle (Free-tier สบายๆ)'
    },
    {
      layer: 'AI Concierge',
      technology: 'Google Gemini 2.5 Flash / Interactions API',
      whyChosen: 'ความเร็วสูง (Low latency) ค่าใช้จ่ายคุ้มค่า เหมาะสำหรับทำ Persona Concierge สุภาพ นุ่มนวล วิเคราะห์นิสัยการอ่าน และแปลงบทสนทนาเป็น Goal Schema อัตโนมัติ',
      soloDevAdvantage: 'SDK ใช้งานง่าย โค้ดไม่กี่บรรทัดรองรับ JSON Schema Structured Outputs'
    }
  ],
  supabaseSqlSchema: `-- =========================================================================
-- TSUNDOKU KILLER DATABASE SCHEMA (PostgreSQL / Supabase)
-- ออกแบบมาเพื่อประสิทธิภาพสูง, รองรับ RLS (Row Level Security), และ Aggregation
-- =========================================================================

-- 1. ตาราง users: เก็บข้อมูลผู้ใช้และผูกกับ LINE Account
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    line_user_id TEXT UNIQUE, -- LINE User ID (เริ่มต้นด้วย U...)
    line_connected BOOLEAN DEFAULT FALSE,
    reminder_days TEXT[] DEFAULT ARRAY['mon', 'wed', 'fri'], -- วันที่ต้องการแจ้งเตือน
    reminder_time TIME DEFAULT '20:00:00', -- เวลาแจ้งเตือนประจำวัน (HH:MM:SS)
    snooze_minutes INT DEFAULT 30,
    daily_goal_pages INT DEFAULT 20,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_active_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index สำหรับค้นหาผู้ใช้จาก LINE Webhook ให้รวดเร็ว (O(1))
CREATE INDEX IF NOT EXISTS idx_users_line_user_id ON public.users(line_user_id);

-- 2. ตาราง books: จัดการข้อมูลหนังสือและสถานะกองดอง
CREATE TYPE book_status_enum AS ENUM ('backlog', 'reading', 'completed', 'dropped');

CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    cover_url TEXT,
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

CREATE INDEX IF NOT EXISTS idx_books_user_status ON public.books(user_id, status);

-- 3. ตาราง reading_logs: ประวัติการอ่านเพื่อคำนวณ Streak และสถิติ
CREATE TABLE IF NOT EXISTS public.reading_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    pages_read INT NOT NULL CHECK (pages_read > 0),
    from_page INT NOT NULL,
    to_page INT NOT NULL,
    source TEXT DEFAULT 'line_quick_reply', -- 'line_quick_reply', 'web_manual', 'concierge'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reading_logs_user_date ON public.reading_logs(user_id, created_at);

-- 4. ตาราง scheduled_notifications: จัดคิวข้อความแจ้งเตือนและการ Snooze
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'cancelled', 'snoozed'
    notification_type TEXT DEFAULT 'daily_reminder', -- 'daily_reminder', 'snooze_followup', 'gentle_nudge'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FUNCTION: อัปเดต Streak อัตโนมัติเมื่อมีการบันทึกการอ่าน
CREATE OR REPLACE FUNCTION public.handle_reading_streak()
RETURNS TRIGGER AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    v_last_active DATE;
    v_current_streak INT;
BEGIN
    SELECT last_active_date, current_streak 
    INTO v_last_active, v_current_streak 
    FROM public.users WHERE id = NEW.user_id;

    IF v_last_active IS NULL OR v_last_active < today_date - INTERVAL '1 day' THEN
        -- ขาดช่วงเกิน 1 วัน ให้เริ่มนับ 1 ใหม่
        UPDATE public.users 
        SET current_streak = 1, 
            last_active_date = today_date,
            longest_streak = GREATEST(longest_streak, 1)
        WHERE id = NEW.user_id;
    ELSIF v_last_active = today_date - INTERVAL '1 day' THEN
        -- อ่านต่อเนื่องจากเมื่อวาน +1
        UPDATE public.users 
        SET current_streak = current_streak + 1, 
            last_active_date = today_date,
            longest_streak = GREATEST(longest_streak, current_streak + 1)
        WHERE id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_on_reading_logged
AFTER INSERT ON public.reading_logs
FOR EACH ROW EXECUTE FUNCTION public.handle_reading_streak();
`,
  firebaseJsonSchema: `{
  "users": {
    "{userId}": {
      "displayName": "Korn_Dev",
      "email": "korn@example.com",
      "lineUserId": "U91a82fbc789e02341bcae5102",
      "lineConnected": true,
      "reminderSettings": {
        "days": ["mon", "wed", "fri", "sun"],
        "time": "20:00",
        "snoozeMinutes": 30
      },
      "stats": {
        "currentStreak": 7,
        "longestStreak": 14,
        "totalPagesRead": 645,
        "booksCompleted": 2,
        "tsundokuCount": 2,
        "clearanceRate": 50.0
      },
      "lastActiveDate": "2026-09-18"
    }
  },
  "books": {
    "{bookId}": {
      "userId": "{userId}",
      "title": "Atomic Habits",
      "author": "James Clear",
      "totalPages": 320,
      "currentPage": 184,
      "status": "reading", // "backlog" | "reading" | "completed"
      "targetPagesPerDay": 20,
      "targetFinishDate": "2026-10-05T00:00:00Z",
      "coverUrl": "https://...",
      "createdAt": "2026-09-01T10:00:00Z",
      "updatedAt": "2026-09-18T13:15:00Z"
    }
  },
  "reading_logs": {
    "{logId}": {
      "userId": "{userId}",
      "bookId": "{bookId}",
      "pagesRead": 20,
      "fromPage": 164,
      "toPage": 184,
      "source": "line_quick_reply", // "line_quick_reply" | "web_manual" | "concierge"
      "timestamp": "2026-09-18T13:15:00Z"
    }
  }
}`,
  nodeJsWebhookCode: `/**
 * LINE Messaging API Webhook Handler (Node.js / Express)
 * รองรับ:
 * 1. ตรวจสอบ HMAC-SHA256 Signature (ป้องกันการปลอมแปลง)
 * 2. ตอบกลับด้วย Quick Reply: [เริ่มอ่านเลย!], [ขอเลื่อน 30 นาที], [วันนี้ขอพัก]
 * 3. อัปเดต Database ทันทีเมื่อผู้ใช้กด Action
 */

import express from 'express';
import crypto from 'crypto';

const router = express.Router();

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

// Middleware ตรวจสอบ Signature ของ LINE
export function validateLineSignature(req: express.Request, res: express.Response, next: express.NextFunction) {
  const signature = req.headers['x-line-signature'] as string;
  if (!signature) {
    return res.status(401).json({ error: 'Missing x-line-signature' });
  }

  const rawBody = (req as any).rawBody || JSON.stringify(req.body);
  const hash = crypto
    .createHmac('SHA256', LINE_CHANNEL_SECRET)
    .update(rawBody)
    .digest('base64');

  if (hash !== signature) {
    return res.status(403).json({ error: 'Invalid LINE signature' });
  }

  next();
}

// ฟังก์ชันส่ง Reply Message พร้อม Quick Reply เข้า LINE
export async function replyWithQuickReplies(replyToken: string, text: string, bookTitle: string) {
  const payload = {
    replyToken: replyToken,
    messages: [
      {
        type: 'text',
        text: text,
        quickReply: {
          items: [
            {
              type: 'action',
              action: {
                type: 'postback',
                label: '📖 เริ่มอ่านเลย!',
                data: JSON.stringify({ action: 'start_reading', book: bookTitle, timestamp: Date.now() }),
                displayText: '📖 เริ่มอ่านเลย!'
              }
            },
            {
              type: 'action',
              action: {
                type: 'postback',
                label: '⏱️ ขอเลื่อน 30 นาที',
                data: JSON.stringify({ action: 'snooze', minutes: 30, book: bookTitle }),
                displayText: '⏱️ ขอเลื่อน 30 นาทีนะ'
              }
            },
            {
              type: 'action',
              action: {
                type: 'postback',
                label: '🛋️ วันนี้ขอพัก',
                data: JSON.stringify({ action: 'rest_today' }),
                displayText: '🛋️ วันนี้ขอพักผ่อนครับ'
              }
            },
            {
              type: 'action',
              action: {
                type: 'postback',
                label: '⚡ บันทึก 15 หน้า',
                data: JSON.stringify({ action: 'quick_log', pages: 15, book: bookTitle }),
                displayText: '⚡ อ่านเสร็จแล้ว 15 หน้า!'
              }
            }
          ]
        }
      }
    ]
  };

  return await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: \`Bearer \${LINE_CHANNEL_ACCESS_TOKEN}\`
    },
    body: JSON.stringify(payload)
  });
}

// Webhook Router
router.post('/webhook', validateLineSignature, async (req, res) => {
  const events = req.body.events || [];

  for (const event of events) {
    const userId = event.source?.userId;

    // 1. จัดการเมื่อผู้ใช้กด Quick Reply (Postback Event)
    if (event.type === 'postback') {
      const data = JSON.parse(event.postback.data || '{}');

      if (data.action === 'start_reading') {
        // บันทึกสถานะว่าผู้ใช้กำลังเข้าสู่ Reading Session
        await replyWithQuickReplies(
          event.replyToken,
          \`ยอดเยี่ยมมากครับ! ระบบเริ่มจับเวลาการอ่าน "\${data.book}" ให้คุณแล้ว\\n\\nเมื่ออ่านเสร็จ พิมพ์จำนวนหน้าที่อ่านจบ เช่น "อ่านจบหน้า 210" หรือกดบันทึกได้เลยครับ ✨\`,
          data.book
        );
      } else if (data.action === 'snooze') {
        // เลื่อนเวลาแจ้งเตือนออกไป 30 นาที (สร้าง Job ใน Cloud Tasks / QStash)
        await replyWithQuickReplies(
          event.replyToken,
          \`รับทราบครับ! Concierge จะกลับมาสะกิดอีกครั้งในอีก \${data.minutes} นาทีครับ ☕\`,
          data.book
        );
      } else if (data.action === 'rest_today') {
        // บันทึกวันพักผ่อน (Rest Day) ไม่หัก Streak
        await replyWithQuickReplies(
          event.replyToken,
          'เข้าใจเลยครับ การพักผ่อนที่ดีคือส่วนหนึ่งของความสำเร็จ พักผ่อนให้เต็มที่แล้วพรุ่งนี้มาลุยกันใหม่นะครับ! 🌙',
          ''
        );
      } else if (data.action === 'quick_log') {
        // อัปเดต Database: เพิ่มหน้า, บันทึก reading_logs, คำนวณ Streak
        await replyWithQuickReplies(
          event.replyToken,
          \`🎉 ยินดีด้วยครับ! บันทึก \${data.pages} หน้าเรียบร้อยแล้ว กองดองขยับเข้าใกล้เป้าหมายอีกก้าว!\\n\\nStreak ปัจจุบัน: 🔥 8 วันต่อเนื่อง\`,
          data.book
        );
      }
    }

    // 2. จัดการเมื่อผู้ใช้พิมพ์ข้อความปกติ
    if (event.type === 'message' && event.message.type === 'text') {
      const text = event.message.text.trim();
      if (text.includes('ดอง') || text.includes('สถานะ') || text.includes('สรุป')) {
        await replyWithQuickReplies(
          event.replyToken,
          '📊 สรุปสถานะกองดองของคุณ:\\n- กำลังอ่าน: 2 เล่ม\\n- กองดองคงเหลือ: 2 เล่ม\\n- ทลายสำเร็จ: 2 เล่ม (50%)\\n\\nอยากเริ่มอ่านเล่มไหนดีครับ?',
          'Atomic Habits'
        );
      }
    }
  }

  res.status(200).send('OK');
});

export default router;
`
};
