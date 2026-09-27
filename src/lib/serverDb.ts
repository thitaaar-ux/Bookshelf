import fs from 'fs';
import path from 'path';
import { Book, ReadingLog, UserSchedule, BookStatus } from '@/types';
import { INITIAL_BOOKS, INITIAL_READING_LOGS, INITIAL_SCHEDULE } from '@/data/initialData';
import { queryPostgres, getPostgresPool } from './postgres';

export interface ServerDatabase {
  version: number;
  lastUpdated: string;
  books: Book[];
  readingLogs: ReadingLog[];
  schedule: UserSchedule;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
export const DEFAULT_USER_ID = 'a0000000-0000-0000-0000-000000000001';

// Global cache for local fallback
declare global {
  var __tsundokuDbCache: ServerDatabase | undefined;
}

function getInitialDatabase(): ServerDatabase {
  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    books: [],
    readingLogs: [],
    schedule: INITIAL_SCHEDULE,
  };
}

export function getServerDatabase(): ServerDatabase {
  if (globalThis.__tsundokuDbCache) {
    return globalThis.__tsundokuDbCache;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed: ServerDatabase = JSON.parse(content);
      if (parsed && Array.isArray(parsed.books)) {
        globalThis.__tsundokuDbCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read database file, initializing fresh database:', err);
  }

  const freshDb = getInitialDatabase();
  saveServerDatabase(freshDb);
  return freshDb;
}

export function saveServerDatabase(db: ServerDatabase): void {
  db.lastUpdated = new Date().toISOString();
  globalThis.__tsundokuDbCache = db;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to persist database to disk:', err);
  }
}

function mapPgBookToBook(row: any): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author || 'ไม่ระบุผู้แต่ง',
    totalPages: Number(row.total_pages) || 0,
    currentPage: Number(row.current_page) || 0,
    coverEmoji: '📚',
    coverUrl: row.cover_url || '',
    status: (row.status || 'backlog') as BookStatus,
    category: row.category || 'General',
    targetPagesPerDay: Number(row.target_pages_per_day) || 20,
    targetFinishDate: row.target_finish_date ? new Date(row.target_finish_date).toISOString().split('T')[0] : '',
    startedAt: row.started_at ? new Date(row.started_at).toISOString().split('T')[0] : undefined,
    completedAt: row.completed_at ? new Date(row.completed_at).toISOString().split('T')[0] : undefined,
    addedAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    notes: row.notes || '',
  };
}

function mapPgLogToReadingLog(row: any): ReadingLog {
  return {
    id: row.id,
    bookId: row.book_id,
    bookTitle: row.book_title || 'หนังสือ',
    pagesRead: Number(row.pages_read) || 0,
    fromPage: Number(row.from_page) || 0,
    toPage: Number(row.to_page) || 0,
    timestamp: row.created_at ? new Date(row.created_at).toISOString().replace('T', ' ').substring(0, 16) : new Date().toISOString(),
    source: (row.source || 'web_manual') as any,
    note: row.note || '',
  };
}

// ---------------------------------------------------------------------------
// Book Operations (Primary: PostgreSQL, Fallback: Local JSON)
// ---------------------------------------------------------------------------

export async function getBooks(): Promise<Book[]> {
  try {
    const rows = await queryPostgres<any>('SELECT * FROM books ORDER BY created_at ASC;');
    return rows.map(mapPgBookToBook);
  } catch (err: any) {
    console.warn('⚠️ PostgreSQL query failed, using local database fallback:', err.message);
  }

  const db = getServerDatabase();
  return db.books;
}

export async function addBook(bookData: Omit<Book, 'id' | 'addedAt'> & { id?: string; addedAt?: string }): Promise<Book> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const bookId = bookData.id && isUuid.test(bookData.id) ? bookData.id : crypto.randomUUID();
  const userId = DEFAULT_USER_ID;

  const title = bookData.title.trim();
  const author = bookData.author ? bookData.author.trim() : 'ไม่ระบุผู้แต่ง';
  const totalPages = Math.max(1, Number(bookData.totalPages) || 100);
  const currentPage = Math.max(0, Math.min(totalPages, Number(bookData.currentPage) || 0));
  const status = bookData.status || (currentPage > 0 ? 'reading' : 'backlog');
  const category = bookData.category || 'General';
  const targetPagesPerDay = Number(bookData.targetPagesPerDay) || 20;
  const targetFinishDate = bookData.targetFinishDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const coverUrl = bookData.coverUrl || '';
  const notes = bookData.notes || '';

  try {
    const res = await queryPostgres<any>(`
      INSERT INTO books (
        id, user_id, title, author, total_pages, current_page, status,
        category, target_pages_per_day, target_finish_date, cover_url, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `, [
      bookId, userId, title, author, totalPages, currentPage,
      status, category, targetPagesPerDay, targetFinishDate,
      coverUrl, notes
    ]);

    if (res && res[0]) {
      const created = mapPgBookToBook(res[0]);
      // Sync local cache
      const db = getServerDatabase();
      db.books.unshift(created);
      saveServerDatabase(db);
      return created;
    }
  } catch (err: any) {
    console.warn('⚠️ PostgreSQL insert failed, saving to local database fallback:', err.message);
  }

  // Fallback to local
  const db = getServerDatabase();
  const fallbackBook: Book = {
    id: bookId,
    title,
    author,
    totalPages,
    currentPage,
    coverEmoji: bookData.coverEmoji || '📚',
    coverUrl,
    status,
    category,
    targetPagesPerDay,
    targetFinishDate,
    startedAt: currentPage > 0 ? new Date().toISOString().split('T')[0] : undefined,
    addedAt: new Date().toISOString(),
    notes,
  };
  db.books.unshift(fallbackBook);
  saveServerDatabase(db);
  return fallbackBook;
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
  try {
    const currentRows = await queryPostgres<any>('SELECT * FROM books WHERE id = $1;', [id]);
    if (currentRows && currentRows.length > 0) {
      const current = currentRows[0];
      const newCurrentPage = updates.currentPage !== undefined ? Number(updates.currentPage) : current.current_page;
      const newTotalPages = updates.totalPages !== undefined ? Number(updates.totalPages) : current.total_pages;

      let newStatus = updates.status || current.status;
      let completedAt = current.completed_at;
      let startedAt = current.started_at;

      if (newCurrentPage >= newTotalPages && newTotalPages > 0) {
        newStatus = 'completed';
        if (!completedAt) completedAt = new Date().toISOString();
      } else if (newCurrentPage > 0 && newStatus === 'backlog') {
        newStatus = 'reading';
        if (!startedAt) startedAt = new Date().toISOString();
      }

      const res = await queryPostgres<any>(`
        UPDATE books SET
          title = COALESCE($2, title),
          author = COALESCE($3, author),
          total_pages = COALESCE($4, total_pages),
          current_page = COALESCE($5, current_page),
          status = COALESCE($6::book_status_enum, status),
          category = COALESCE($7, category),
          target_pages_per_day = COALESCE($8, target_pages_per_day),
          target_finish_date = COALESCE($9, target_finish_date),
          cover_url = COALESCE($10, cover_url),
          notes = COALESCE($11, notes),
          started_at = COALESCE($12, started_at),
          completed_at = COALESCE($13, completed_at),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *;
      `, [
        id,
        updates.title ?? null,
        updates.author ?? null,
        updates.totalPages !== undefined ? newTotalPages : null,
        updates.currentPage !== undefined ? newCurrentPage : null,
        newStatus ?? null,
        updates.category ?? null,
        updates.targetPagesPerDay !== undefined ? Number(updates.targetPagesPerDay) : null,
        updates.targetFinishDate ?? null,
        updates.coverUrl ?? null,
        updates.notes ?? null,
        startedAt ?? null,
        completedAt ?? null,
      ]);

      if (res && res[0]) {
        const mapped = mapPgBookToBook(res[0]);
        // Sync local cache
        const db = getServerDatabase();
        const idx = db.books.findIndex((b) => b.id === id);
        if (idx !== -1) db.books[idx] = mapped;
        saveServerDatabase(db);
        return mapped;
      }
    }
  } catch (err: any) {
    console.warn('⚠️ PostgreSQL update failed, attempting local database fallback:', err.message);
  }

  // Local fallback
  const db = getServerDatabase();
  const index = db.books.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const current = db.books[index];
  const updated: Book = { ...current, ...updates, id: current.id };
  db.books[index] = updated;
  saveServerDatabase(db);
  return updated;
}

export async function deleteBook(id: string): Promise<boolean> {
  try {
    const res = await queryPostgres<any>('DELETE FROM books WHERE id = $1 RETURNING id;', [id]);
    if (res && res.length > 0) {
      const db = getServerDatabase();
      db.books = db.books.filter((b) => b.id !== id);
      saveServerDatabase(db);
      return true;
    }
  } catch (err: any) {
    console.warn('⚠️ PostgreSQL delete failed, attempting local database fallback:', err.message);
  }

  const db = getServerDatabase();
  const prevCount = db.books.length;
  db.books = db.books.filter((b) => b.id !== id);
  if (db.books.length !== prevCount) {
    saveServerDatabase(db);
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Reading Log Operations (Primary: PostgreSQL, Fallback: Local JSON)
// ---------------------------------------------------------------------------

export async function getReadingLogs(): Promise<ReadingLog[]> {
  try {
    const rows = await queryPostgres<any>(`
      SELECT r.*, b.title as book_title
      FROM reading_logs r
      LEFT JOIN books b ON r.book_id = b.id
      ORDER BY r.created_at DESC;
    `);
    return rows.map(mapPgLogToReadingLog);
  } catch (err: any) {
    console.warn('⚠️ PostgreSQL reading logs query failed, using local database fallback:', err.message);
  }

  const db = getServerDatabase();
  return db.readingLogs;
}

export async function addReadingLog(logData: Omit<ReadingLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<ReadingLog> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const logId = logData.id && isUuid.test(logData.id) ? logData.id : crypto.randomUUID();
  const userId = DEFAULT_USER_ID;

  // Ensure bookId is a UUID or find matching book
  let targetBookId = logData.bookId;
  if (!isUuid.test(targetBookId)) {
    try {
      const bRes = await queryPostgres<any>('SELECT id FROM books WHERE title = $1 LIMIT 1;', [logData.bookTitle]);
      if (bRes && bRes[0]) {
        targetBookId = bRes[0].id;
      } else {
        // Fallback to first book in DB
        const anyBook = await queryPostgres<any>('SELECT id FROM books LIMIT 1;');
        if (anyBook && anyBook[0]) targetBookId = anyBook[0].id;
      }
    } catch {}
  }

  try {
    const res = await queryPostgres<any>(`
      INSERT INTO reading_logs (
        id, user_id, book_id, pages_read, from_page, to_page, source, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `, [
      logId,
      userId,
      targetBookId,
      Number(logData.pagesRead) || 1,
      Number(logData.fromPage) || 0,
      Number(logData.toPage) || 0,
      logData.source || 'web_manual',
      new Date().toISOString()
    ]);

    if (res && res[0]) {
      const created = mapPgLogToReadingLog({ ...res[0], book_title: logData.bookTitle });
      // Also sync to local database
      const db = getServerDatabase();
      db.readingLogs.unshift(created);
      saveServerDatabase(db);
      return created;
    }
  } catch (err: any) {
    console.warn('⚠️ PostgreSQL insert log failed, saving to local fallback:', err.message);
  }

  // Fallback to local
  const db = getServerDatabase();
  const fallbackLog: ReadingLog = {
    id: logId,
    bookId: targetBookId,
    bookTitle: logData.bookTitle,
    pagesRead: Number(logData.pagesRead) || 1,
    fromPage: Number(logData.fromPage) || 0,
    toPage: Number(logData.toPage) || 0,
    timestamp: logData.timestamp || new Date().toISOString(),
    source: logData.source || 'web_manual',
    note: logData.note || '',
  };
  db.readingLogs.unshift(fallbackLog);
  saveServerDatabase(db);
  return fallbackLog;
}

// ---------------------------------------------------------------------------
// Schedule Operations (Primary: PostgreSQL users table, Fallback: Local JSON)
// ---------------------------------------------------------------------------

export async function getSchedule(): Promise<UserSchedule> {
  try {
    const userRes = await queryPostgres<any>('SELECT * FROM users WHERE id = $1 LIMIT 1;', [DEFAULT_USER_ID]);
    if (userRes && userRes[0]) {
      const u = userRes[0];
      return {
        reminderDays: u.reminder_days || ['mon', 'wed', 'fri', 'sun'],
        reminderTime: u.reminder_time ? u.reminder_time.substring(0, 5) : '20:00',
        targetPagesPerDay: u.daily_goal_pages || 20,
        snoozeDurationMinutes: u.snooze_minutes || 30,
        lineConnected: Boolean(u.line_connected),
        lineUserId: u.line_user_id || 'U9330ea2a3097a7e8ea7b81a9eeb82088',
        lineDisplayName: u.display_name || 'Bunnarak',
        activeBookId: '',
      };
    }
  } catch (err: any) {
    console.warn('⚠️ PostgreSQL getSchedule failed, using local database fallback:', err.message);
  }

  const db = getServerDatabase();
  return db.schedule;
}

export async function updateSchedule(updates: Partial<UserSchedule>): Promise<UserSchedule> {
  try {
    const res = await queryPostgres<any>(`
      UPDATE users SET
        reminder_days = COALESCE($2, reminder_days),
        reminder_time = COALESCE($3, reminder_time),
        daily_goal_pages = COALESCE($4, daily_goal_pages),
        snooze_minutes = COALESCE($5, snooze_minutes),
        line_connected = COALESCE($6, line_connected),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `, [
      DEFAULT_USER_ID,
      updates.reminderDays ?? null,
      updates.reminderTime ? `${updates.reminderTime}:00` : null,
      updates.targetPagesPerDay !== undefined ? Number(updates.targetPagesPerDay) : null,
      updates.snoozeDurationMinutes !== undefined ? Number(updates.snoozeDurationMinutes) : null,
      updates.lineConnected !== undefined ? Boolean(updates.lineConnected) : null,
    ]);

    if (res && res[0]) {
      const u = res[0];
      const updated: UserSchedule = {
        reminderDays: u.reminder_days || ['mon', 'wed', 'fri', 'sun'],
        reminderTime: u.reminder_time ? u.reminder_time.substring(0, 5) : '20:00',
        targetPagesPerDay: u.daily_goal_pages || 20,
        snoozeDurationMinutes: u.snooze_minutes || 30,
        lineConnected: Boolean(u.line_connected),
        lineUserId: u.line_user_id || 'U9330ea2a3097a7e8ea7b81a9eeb82088',
        lineDisplayName: u.display_name || 'Bunnarak',
        activeBookId: updates.activeBookId || 'b0000000-0000-0000-0000-000000000001',
      };
      // Sync local cache
      const db = getServerDatabase();
      db.schedule = { ...db.schedule, ...updated };
      saveServerDatabase(db);
      return updated;
    }
  } catch (err: any) {
    console.warn('⚠️ PostgreSQL updateSchedule failed, using local database fallback:', err.message);
  }

  const db = getServerDatabase();
  db.schedule = { ...db.schedule, ...updates };
  saveServerDatabase(db);
  return db.schedule;
}

// ---------------------------------------------------------------------------
// DB Telemetry & Stats
// ---------------------------------------------------------------------------

export async function getDbStats() {
  try {
    const bookCount = await queryPostgres<any>('SELECT COUNT(*) as count FROM books;');
    const logCount = await queryPostgres<any>('SELECT COUNT(*) as count FROM reading_logs;');
    return {
      engine: 'PostgreSQL (Cloud Database)',
      host: '210.246.215.195:5433/bookshelf',
      totalBooks: parseInt(bookCount[0]?.count || '0', 10),
      totalLogs: parseInt(logCount[0]?.count || '0', 10),
      lastUpdated: new Date().toISOString(),
      status: 'online',
    };
  } catch {
    const db = getServerDatabase();
    return {
      engine: 'Local SQLite/JSON Fallback',
      totalBooks: db.books.length,
      totalLogs: db.readingLogs.length,
      lastUpdated: db.lastUpdated,
      status: 'fallback',
    };
  }
}
