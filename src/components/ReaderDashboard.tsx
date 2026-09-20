'use client';

import React, { useState, useEffect } from 'react';
import { 
  INITIAL_BOOKS, 
  INITIAL_SCHEDULE, 
  INITIAL_READING_LOGS 
} from '../data/initialData';
import { Book, UserSchedule, ReadingLog } from '../types';
import { Header } from './Header';
import { TsundokuHero } from './TsundokuHero';
import { BookManagement } from './BookManagement';
import { ReadingProgressChart } from './ReadingProgressChart';
import { LineSimulatorModal } from './LineSimulatorModal';
import { SchedulerSettingsModal } from './SchedulerSettingsModal';
import { ArchitectureModal } from './ArchitectureModal';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, Plus, Bell, Calendar, 
  CheckCircle2, Flame, ArrowRight, ShieldCheck, Cpu 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReaderDashboard() {
  const router = useRouter();

  // Load state with fallback to initial data
  const [books, setBooks] = useState<Book[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tsundoku_books');
      return saved ? JSON.parse(saved) : INITIAL_BOOKS;
    }
    return INITIAL_BOOKS;
  });

  const [schedule, setSchedule] = useState<UserSchedule>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tsundoku_schedule');
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
    }
    return INITIAL_SCHEDULE;
  });

  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tsundoku_logs');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length >= 10) {
            return parsed;
          }
        } catch {
          // ignore error
        }
      }
      return INITIAL_READING_LOGS;
    }
    return INITIAL_READING_LOGS;
  });

  const [currentTheme, setCurrentTheme] = useState('theme-obsidian');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'architecture'>('dashboard');

  // Modals state
  const [isLineSimulatorOpen, setIsLineSimulatorOpen] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isQuickLogModalOpen, setIsQuickLogModalOpen] = useState(false);

  // Quick Log Form state
  const [selectedBookForLog, setSelectedBookForLog] = useState<string>(schedule.activeBookId || books[0]?.id || '');
  const [pagesToLog, setPagesToLog] = useState<number>(schedule.targetPagesPerDay || 20);

  // Persistence
  useEffect(() => {
    localStorage.setItem('tsundoku_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('tsundoku_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('tsundoku_logs', JSON.stringify(readingLogs));
  }, [readingLogs]);

  // Derived metrics
  const completedBooks = books.filter(b => b.status === 'completed');
  const clearanceRate = books.length > 0 
    ? Math.round((completedBooks.length / books.length) * 100) 
    : 0;
  
  const activeBook = books.find(b => b.id === schedule.activeBookId) || books.find(b => b.status === 'reading') || books[0];

  // Handlers
  const handleUpdateBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
  };

  const handleAddBook = (newBookData: Omit<Book, 'id' | 'addedAt'>) => {
    const newBook: Book = {
      ...newBookData,
      id: 'book-' + Date.now(),
      addedAt: new Date().toISOString().split('T')[0]
    };
    setBooks(prev => [newBook, ...prev]);
  };

  const handleDeleteBook = (id: string) => {
    if (confirm('คุณต้องการลบหนังสือเล่มนี้ออกจากระบบใช่หรือไม่?')) {
      setBooks(prev => prev.filter(b => b.id !== id));
      if (schedule.activeBookId === id) {
        const remaining = books.filter(b => b.id !== id);
        if (remaining.length > 0) {
          setSchedule(prev => ({ ...prev, activeBookId: remaining[0].id }));
        }
      }
    }
  };

  const handleSetActiveBook = (id: string) => {
    setSchedule(prev => ({ ...prev, activeBookId: id }));
  };

  const handleQuickLogPages = (book: Book, pagesAdded: number) => {
    const fromPage = book.currentPage;
    const toPage = Math.min(book.totalPages, book.currentPage + pagesAdded);
    const isCompleted = toPage >= book.totalPages;

    // Update book
    const updatedBook: Book = {
      ...book,
      currentPage: toPage,
      status: isCompleted ? 'completed' : book.status === 'backlog' ? 'reading' : book.status,
      completedAt: isCompleted ? new Date().toISOString().split('T')[0] : book.completedAt
    };
    handleUpdateBook(updatedBook);

    // Create log entry
    const newLog: ReadingLog = {
      id: 'log-' + Date.now(),
      bookId: book.id,
      bookTitle: book.title,
      pagesRead: pagesAdded,
      fromPage,
      toPage,
      timestamp: new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      source: 'web_manual'
    };
    setReadingLogs(prev => [newLog, ...prev]);
  };

  return (
    <div className={`min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans ${currentTheme}`}>
      
      {/* 1. Global Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'architecture') {
            setIsArchitectureOpen(true);
          }
        }}
        onOpenLineSimulator={() => setIsLineSimulatorOpen(true)}
        onOpenScheduler={() => setIsSchedulerOpen(true)}
        onOpenBackoffice={() => router.push('/backoffice')}
        lineConnected={schedule.lineConnected}
        clearanceRate={clearanceRate}
        streakCount={7}
      />

      {/* 2. Main Tsundoku Clearance Hero Section */}
      <TsundokuHero
        books={books}
        schedule={schedule}
        onOpenLineSimulator={() => setIsLineSimulatorOpen(true)}
        onQuickLog={() => setIsQuickLogModalOpen(true)}
      />

      {/* 3. Core Workspace & Library */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Section title & Quick guide */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-neutral-800/80 mb-6 gap-3">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>คลังหนังสือ &amp; กองดอง (Tsundoku Library)</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-400">
                {books.length} เล่มในระบบ
              </span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              จัดการความคืบหน้าแบบเรียลไทม์ เชื่อมโยงสถานะไปยัง LINE Messaging Webhook
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="main-open-architecture-btn"
              onClick={() => setIsArchitectureOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-medium text-neutral-200 transition cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>ดูสเปกสถาปัตยกรรม &amp; DB</span>
            </button>
            <button
              id="main-open-line-sim-btn"
              onClick={() => setIsLineSimulatorOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/40 border border-emerald-600/40 text-xs font-medium text-emerald-300 transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>ทดสอบ LINE Webhook</span>
            </button>
          </div>
        </div>

        {/* Book Management Component */}
        <BookManagement
          books={books}
          activeBookId={schedule.activeBookId}
          onUpdateBook={handleUpdateBook}
          onAddBook={handleAddBook}
          onDeleteBook={handleDeleteBook}
          onSetActiveBook={handleSetActiveBook}
          onQuickLogPages={handleQuickLogPages}
        />

        {/* 30-Day Reading Velocity Chart (Recharts) */}
        <div className="mt-12">
          <ReadingProgressChart
            logs={readingLogs}
            books={books}
            schedule={schedule}
          />
        </div>

        {/* Reading History & Quick Analytics Feed */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">บันทึกการอ่านล่าสุด (Recent Reading Logs)</h3>
              <p className="text-xs text-neutral-400">ประวัติการอ่านที่บันทึกผ่าน Web และ LINE Quick Reply</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {readingLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-neutral-400 text-[11px] mb-1">
                    <span className="font-mono">{log.timestamp}</span>
                    <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-[10px] font-mono text-neutral-300">
                      {log.source === 'line_quick_reply' ? 'LINE API' : 'Web Manual'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white truncate">{log.bookTitle}</h4>
                  <p className="text-neutral-400 mt-1">
                    อ่านหน้า {log.fromPage} → {log.toPage} (<strong className="text-emerald-400">+{log.pagesRead} หน้า</strong>)
                  </p>
                </div>
                {log.note && (
                  <div className="text-[10px] text-neutral-500 mt-2 italic truncate">
                    {log.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-6 mt-12 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            <span className="font-bold text-neutral-300">TSUNDOKU</span>
            <span>//</span>
            <span>LINE MESSAGING API INTEGRATION</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <p className="text-neutral-500">
              ออกแบบสำหรับนักพัฒนาเดี่ยว (Solo Dev) ด้วย Node.js Webhook
            </p>
            <Link
              href="/backoffice"
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-sky-500/50 text-sky-400 font-mono transition cursor-pointer flex items-center space-x-1"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>/backoffice</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* --- ALL MODALS --- */}

      {/* 1. LINE Simulator Modal */}
      <LineSimulatorModal
        isOpen={isLineSimulatorOpen}
        onClose={() => setIsLineSimulatorOpen(false)}
        schedule={schedule}
        activeBook={activeBook}
        onQuickLogPages={handleQuickLogPages}
        onUpdateSchedule={(newSched) => setSchedule(newSched)}
      />

      {/* 2. Scheduler Settings Modal */}
      <SchedulerSettingsModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        schedule={schedule}
        books={books}
        onSaveSchedule={(newSched) => setSchedule(newSched)}
      />

      {/* 3. System Architecture & Technical Specifications Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => {
          setIsArchitectureOpen(false);
          setActiveTab('dashboard');
        }}
      />

      {/* 4. Quick Manual Log Modal */}
      {isQuickLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md p-6 relative">
            <h3 className="text-sm font-bold text-white mb-1">บันทึกจำนวนหน้าที่อ่าน (Quick Log)</h3>
            <p className="text-xs text-neutral-400 mb-4">เลือกหนังสือและระบุจำนวนหน้าที่คุณอ่านเสร็จ</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">เลือกหนังสือ</label>
                <select
                  value={selectedBookForLog}
                  onChange={(e) => setSelectedBookForLog(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none"
                >
                  {books.filter(b => b.status !== 'completed').map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} (อ่านแล้ว {b.currentPage}/{b.totalPages} หน้า)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-medium">จำนวนหน้าที่อ่านเพิ่ม</label>
                <div className="flex items-center space-x-2">
                  {[10, 15, 20, 30].map(pages => (
                    <button
                      key={pages}
                      type="button"
                      onClick={() => setPagesToLog(pages)}
                      className={`flex-1 py-1.5 rounded-lg border font-mono transition ${
                        pagesToLog === pages
                          ? 'bg-neutral-100 text-neutral-950 font-bold border-white'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800'
                      }`}
                    >
                      +{pages}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={pagesToLog}
                  onChange={(e) => setPagesToLog(Number(e.target.value))}
                  className="w-full mt-2 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-end space-x-2 text-xs">
              <button
                onClick={() => setIsQuickLogModalOpen(false)}
                className="px-3 py-1.5 text-neutral-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  const targetBook = books.find(b => b.id === selectedBookForLog);
                  if (targetBook) {
                    handleQuickLogPages(targetBook, pagesToLog);
                    confetti({ particleCount: 50, spread: 60 });
                  }
                  setIsQuickLogModalOpen(false);
                }}
                className="px-4 py-2 bg-white text-neutral-950 font-semibold rounded-xl hover:bg-neutral-200 transition"
              >
                บันทึกความคืบหน้า
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
