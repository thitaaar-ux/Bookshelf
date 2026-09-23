import fs from 'fs';
import path from 'path';
import { Book, ReadingLog, UserSchedule } from '@/types';
import { INITIAL_BOOKS, INITIAL_READING_LOGS, INITIAL_SCHEDULE } from '@/data/initialData';

export interface ServerDatabase {
  version: number;
  lastUpdated: string;
  books: Book[];
  readingLogs: ReadingLog[];
  schedule: UserSchedule;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Global cache to prevent redundant disk reads in serverless/Node environment
declare global {
  var __tsundokuDbCache: ServerDatabase | undefined;
}

function getInitialDatabase(): ServerDatabase {
  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    books: INITIAL_BOOKS,
    readingLogs: INITIAL_READING_LOGS,
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

  // If file doesn't exist or is corrupted, seed fresh initial DB and write to disk
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

    // Atomic write using a temp file
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to persist database to disk:', err);
  }
}

// Book Operations
export function getBooks(): Book[] {
  const db = getServerDatabase();
  return db.books;
}

export function addBook(bookData: Omit<Book, 'id' | 'addedAt'> & { id?: string; addedAt?: string }): Book {
  const db = getServerDatabase();
  const newBook: Book = {
    id: bookData.id || `book-${Date.now()}`,
    title: bookData.title.trim(),
    author: bookData.author ? bookData.author.trim() : 'ไม่ระบุผู้แต่ง',
    totalPages: Number(bookData.totalPages) || 100,
    currentPage: Number(bookData.currentPage) || 0,
    coverEmoji: bookData.coverEmoji || '📚',
    coverUrl: bookData.coverUrl || '',
    status: bookData.status || (Number(bookData.currentPage) > 0 ? 'reading' : 'backlog'),
    category: bookData.category || 'General',
    targetPagesPerDay: Number(bookData.targetPagesPerDay) || 20,
    targetFinishDate: bookData.targetFinishDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    startedAt: bookData.startedAt || (Number(bookData.currentPage) > 0 ? new Date().toISOString().split('T')[0] : undefined),
    completedAt: bookData.completedAt,
    addedAt: bookData.addedAt || new Date().toISOString(),
    notes: bookData.notes || '',
  };

  db.books.unshift(newBook);
  saveServerDatabase(db);
  return newBook;
}

export function updateBook(id: string, updates: Partial<Book>): Book | null {
  const db = getServerDatabase();
  const index = db.books.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const current = db.books[index];
  const updated: Book = {
    ...current,
    ...updates,
    id: current.id, // prevent id overwrite
  };

  // Auto update status if completed
  if (updated.currentPage >= updated.totalPages && updated.totalPages > 0) {
    updated.status = 'completed';
    if (!updated.completedAt) {
      updated.completedAt = new Date().toISOString().split('T')[0];
    }
  } else if (updated.currentPage > 0 && updated.status === 'backlog') {
    updated.status = 'reading';
    if (!updated.startedAt) {
      updated.startedAt = new Date().toISOString().split('T')[0];
    }
  }

  db.books[index] = updated;
  saveServerDatabase(db);
  return updated;
}

export function deleteBook(id: string): boolean {
  const db = getServerDatabase();
  const prevCount = db.books.length;
  db.books = db.books.filter((b) => b.id !== id);
  if (db.books.length !== prevCount) {
    saveServerDatabase(db);
    return true;
  }
  return false;
}

// Reading Log Operations
export function getReadingLogs(): ReadingLog[] {
  const db = getServerDatabase();
  return db.readingLogs;
}

export function addReadingLog(logData: Omit<ReadingLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): ReadingLog {
  const db = getServerDatabase();
  const newLog: ReadingLog = {
    id: logData.id || `log-${Date.now()}`,
    bookId: logData.bookId,
    bookTitle: logData.bookTitle,
    pagesRead: Number(logData.pagesRead) || 1,
    fromPage: Number(logData.fromPage) || 0,
    toPage: Number(logData.toPage) || 0,
    timestamp: logData.timestamp || new Date().toISOString(),
    source: logData.source || 'web_manual',
    note: logData.note || '',
  };

  db.readingLogs.unshift(newLog);
  saveServerDatabase(db);
  return newLog;
}

// User Schedule Operations
export function getSchedule(): UserSchedule {
  const db = getServerDatabase();
  return db.schedule;
}

export function updateSchedule(updates: Partial<UserSchedule>): UserSchedule {
  const db = getServerDatabase();
  db.schedule = {
    ...db.schedule,
    ...updates,
  };
  saveServerDatabase(db);
  return db.schedule;
}

// DB Telemetry & Stats
export function getDbStats() {
  const db = getServerDatabase();
  let fileSizeKB = 0;
  let existsOnDisk = false;

  try {
    if (fs.existsSync(DB_FILE)) {
      const stats = fs.statSync(DB_FILE);
      fileSizeKB = Math.round((stats.size / 1024) * 10) / 10;
      existsOnDisk = true;
    }
  } catch {}

  return {
    engine: 'Server File-Backed JSON Database',
    storagePath: './data/database.json',
    existsOnDisk,
    fileSizeKB,
    totalBooks: db.books.length,
    totalLogs: db.readingLogs.length,
    lastUpdated: db.lastUpdated,
    version: db.version,
  };
}
