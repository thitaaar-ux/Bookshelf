import React, { useState, useEffect } from 'react';
import { 
  INITIAL_BOOKS, 
  INITIAL_SCHEDULE, 
  INITIAL_BADGES, 
  INITIAL_READING_LOGS 
} from './data/initialData';
import { Book, UserSchedule, Badge, ReadingLog } from './types';
import { Header } from './components/Header';
import { TsundokuHero } from './components/TsundokuHero';
import { BookManagement } from './components/BookManagement';
import { LineSimulatorModal } from './components/LineSimulatorModal';
import { ConciergeChatModal } from './components/ConciergeChatModal';
import { SchedulerSettingsModal } from './components/SchedulerSettingsModal';
import { GamificationBadgesModal } from './components/GamificationBadgesModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { 
  BookOpen, Plus, Sparkles, Bell, Award, Calendar, 
  CheckCircle2, Flame, ArrowRight, ShieldCheck, Cpu, X 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Load state with fallback to initial data
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('tsundoku_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [schedule, setSchedule] = useState<UserSchedule>(() => {
    const saved = localStorage.getItem('tsundoku_schedule');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('tsundoku_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>(() => {
    const saved = localStorage.getItem('tsundoku_logs');
    return saved ? JSON.parse(saved) : INITIAL_READING_LOGS;
  });

  const [currentTheme, setCurrentTheme] = useState('theme-editorial');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'architecture'>('dashboard');

  // Modals state
  const [isLineSimulatorOpen, setIsLineSimulatorOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
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
    localStorage.setItem('tsundoku_badges', JSON.stringify(badges));
  }, [badges]);

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

    // Check badges
    const updatedTotalPages = books.reduce((sum, b) => sum + (b.id === book.id ? toPage : b.currentPage), 0);
    setBadges(prev => prev.map(badge => {
      if (badge.id === 'badge-century' && updatedTotalPages >= 100) {
        return { ...badge, unlocked: true, unlockedAt: new Date().toISOString().split('T')[0] };
      }
      if (badge.id === 'badge-slayer' && completedBooks.length + (isCompleted ? 1 : 0) >= 2) {
        return { ...badge, unlocked: true, unlockedAt: new Date().toISOString().split('T')[0] };
      }
      return badge;
    }));
  };

  const handleApplyGoalRecommendation = (pages: number, time: string) => {
    setSchedule(prev => ({
      ...prev,
      targetPagesPerDay: pages,
      reminderTime: time
    }));
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] text-[#1c1c1c] flex flex-col font-sans selection:bg-[#ff4d00] selection:text-white">
      
      {/* 1. Global Navigation Header (Variation 3) */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'architecture') {
            setIsArchitectureOpen(true);
          }
        }}
        onOpenLineSimulator={() => setIsLineSimulatorOpen(true)}
        onOpenConcierge={() => setIsConciergeOpen(true)}
        onOpenScheduler={() => setIsSchedulerOpen(true)}
        onOpenBadges={() => setIsBadgesOpen(true)}
        lineConnected={schedule.lineConnected}
        clearanceRate={clearanceRate}
        streakCount={7}
      />

      {/* 2. Main Tsundoku Clearance Hero Section (Variation 3 Headline & Stat List) */}
      <TsundokuHero
        books={books}
        schedule={schedule}
        onOpenLineSimulator={() => setIsLineSimulatorOpen(true)}
        onOpenConcierge={() => setIsConciergeOpen(true)}
        onQuickLog={() => setIsQuickLogModalOpen(true)}
      />

      {/* 3. Main Body Container (Variation 3 Layout: max-w-[1400px], generous padding) */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-14 space-y-12">
        
        {/* Book Management Component (Editorial List / Grid) */}
        <BookManagement
          books={books}
          activeBookId={schedule.activeBookId}
          onUpdateBook={handleUpdateBook}
          onAddBook={handleAddBook}
          onDeleteBook={handleDeleteBook}
          onSetActiveBook={handleSetActiveBook}
          onQuickLogPages={handleQuickLogPages}
        />

        {/* Reading History & Quick Analytics Feed */}
        <section className="pt-8 border-t-2 border-[#1c1c1c] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="meta text-[#ff4d00] font-bold">TELEMETRY // LOGS</span>
              <h3 className="text-xl sm:text-2xl font-black text-[#1c1c1c] tracking-tight uppercase mt-0.5">
                ประวัติการอ่านล่าสุด (Recent Logs)
              </h3>
              <p className="text-xs text-[#1c1c1c]/60">
                ซิงค์แบบสองทางระหว่าง Web Interface และ LINE Quick Reply Webhook
              </p>
            </div>
            <button
              onClick={() => setIsBadgesOpen(true)}
              className="meta text-[#1c1c1c] hover:text-[#ff4d00] font-bold underline underline-offset-4 cursor-pointer transition"
            >
              ดูสถิติและเหรียญตราทั้งหมด →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {readingLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="p-5 bg-white border border-[#1c1c1c] shadow-[3px_3px_0px_#1c1c1c] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5 pb-2 border-b border-[#e8e6df]">
                    <span className="font-mono text-[#1c1c1c]/60">{log.timestamp}</span>
                    <span className="meta font-bold text-[#ff4d00]">
                      {log.source === 'line_quick_reply' ? '● LINE API' : '○ WEB LOG'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#1c1c1c] truncate">
                    {log.bookTitle}
                  </h4>
                  <p className="text-xs text-[#1c1c1c]/70 mt-1 font-medium">
                    อ่านหน้า {log.fromPage} → {log.toPage} (<strong className="text-[#1c1c1c] font-mono">+{log.pagesRead} หน้า</strong>)
                  </p>
                </div>
                {log.note && (
                  <div className="meta text-[10px] text-[#1c1c1c]/50 italic truncate pt-1 border-t border-[#e8e6df]">
                    "{log.note}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 4. Editorial Footer (Variation 3) */}
      <footer className="border-t-2 border-[#1c1c1c] bg-[#fdfcf8] px-4 sm:px-8 lg:px-12 py-8 transition-colors">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          {/* Brand & Meta */}
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className="font-black text-sm uppercase tracking-wider text-[#1c1c1c]">
                TSUNDOKU KILLER
              </span>
              <span className="meta text-[#1c1c1c]/40">//</span>
              <span className="meta text-[#1c1c1c]/70 font-semibold">
                READING CONCIERGE PROTOCOL
              </span>
            </div>
            <p className="meta text-[#1c1c1c]/60">
              Autonomous LINE Messaging API Webhook &bull; Supabase PostgreSQL Engine &bull; Next.js 14
            </p>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="meta text-[#1c1c1c] hover:text-[#ff4d00] font-bold underline underline-offset-4 cursor-pointer"
            >
              [DATABASE SCHEMA & WEBHOOK SPECS]
            </button>
            <div className="flex items-center space-x-1.5 meta text-[#ff4d00] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse" />
              <span>LIVE SYSTEM V2.5 PRO</span>
            </div>
          </div>

        </div>
      </footer>

      {/* --- ALL MODALS (Styled with Variation 3 Aesthetic) --- */}

      {/* 1. LINE Simulator Modal */}
      <LineSimulatorModal
        isOpen={isLineSimulatorOpen}
        onClose={() => setIsLineSimulatorOpen(false)}
        schedule={schedule}
        activeBook={activeBook}
        onQuickLogPages={handleQuickLogPages}
        onUpdateSchedule={(newSched) => setSchedule(newSched)}
      />

      {/* 2. Concierge Chat Modal */}
      <ConciergeChatModal
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
        books={books}
        schedule={schedule}
        onApplyGoalRecommendation={handleApplyGoalRecommendation}
      />

      {/* 3. Scheduler Settings Modal */}
      <SchedulerSettingsModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        schedule={schedule}
        books={books}
        onSaveSchedule={(newSched) => setSchedule(newSched)}
      />

      {/* 4. Gamification & Badges Modal */}
      <GamificationBadgesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        badges={badges}
        streakCount={7}
        books={books}
        currentTheme={currentTheme}
        onSelectTheme={(themeId) => setCurrentTheme(themeId)}
      />

      {/* 5. System Architecture & Technical Specifications Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => {
          setIsArchitectureOpen(false);
          setActiveTab('dashboard');
        }}
      />

      {/* 6. Quick Manual Log Modal (Variation 3 Style) */}
      {isQuickLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#fdfcf8] border-2 border-[#1c1c1c] shadow-[8px_8px_0px_#1c1c1c] w-full max-w-md p-6 sm:p-8 relative">
            
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1c1c1c] mb-4">
              <div>
                <span className="meta text-[#ff4d00] font-bold">TELEMETRY // QUICK LOG</span>
                <h3 className="text-xl font-black text-[#1c1c1c] tracking-tight uppercase">
                  บันทึกหน้าอ่านด่วน
                </h3>
              </div>
              <button
                onClick={() => setIsQuickLogModalOpen(false)}
                className="p-1 border border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#fdfcf8] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#1c1c1c]/70 mb-4 font-medium">
              เลือกหนังสือและระบุจำนวนหน้าที่คุณอ่านเสร็จเพื่อบันทึกประวัติและต่อ Streak
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="meta block text-[#1c1c1c] font-bold mb-1">
                  เลือกหนังสือ (SELECT BOOK)
                </label>
                <select
                  value={selectedBookForLog}
                  onChange={(e) => setSelectedBookForLog(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#1c1c1c] text-[#1c1c1c] text-xs font-medium focus:outline-none"
                >
                  {books.filter(b => b.status !== 'completed').map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.currentPage}/{b.totalPages} หน้า)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="meta block text-[#1c1c1c] font-bold mb-1">
                  จำนวนหน้าที่อ่านเพิ่ม (PAGES READ)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[5, 10, 15, 20].map(pages => (
                    <button
                      key={pages}
                      type="button"
                      onClick={() => setPagesToLog(pages)}
                      className={`py-2 text-xs font-mono font-bold border transition cursor-pointer ${
                        pagesToLog === pages
                          ? 'bg-[#1c1c1c] text-[#fdfcf8] border-[#1c1c1c]'
                          : 'bg-[#f4f2ea] text-[#1c1c1c] border-[#e8e6df] hover:border-[#1c1c1c]'
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
                  className="w-full px-3 py-2 bg-white border border-[#1c1c1c] text-[#1c1c1c] font-mono text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-[#1c1c1c] flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsQuickLogModalOpen(false)}
                className="px-4 py-2 border border-[#1c1c1c] text-xs font-bold uppercase hover:bg-[#f4f2ea] transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  const targetBook = books.find(b => b.id === selectedBookForLog);
                  if (targetBook) {
                    handleQuickLogPages(targetBook, pagesToLog);
                    confetti({ particleCount: 70, spread: 60 });
                  }
                  setIsQuickLogModalOpen(false);
                }}
                className="bg-[#1c1c1c] hover:bg-[#ff4d00] text-[#fdfcf8] px-5 py-2 text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
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
