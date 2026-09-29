'use client';

import React, { useState, useEffect } from 'react';
import { Book, ReadingLog, UserSchedule, UserProfile } from '../types';
import { 
  INITIAL_BOOKS, INITIAL_SCHEDULE, INITIAL_READING_LOGS 
} from '../data/initialData';
import { SidebarNav } from './SidebarNav';
import { BookManagement } from './BookManagement';
import { ReadingProgressChart } from './ReadingProgressChart';
import { SchedulerSettingsModal } from './SchedulerSettingsModal';
import { LoginModal } from './LoginModal';
import { 
  TrendingUp, 
  BookOpen, 
  Flame, 
  Calendar, 
  Plus, 
  Sparkles, 
  MessageSquare, 
  Check, 
  ChevronRight, 
  ArrowUpRight, 
  Clock, 
  X, 
  Target, 
  Layers, 
  Award, 
  Edit3, 
  Database, 
  Image as ImageIcon,
  LogIn,
  User,
  ShieldCheck,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { AddBookModal } from './AddBookModal';

export default function ReaderDashboard() {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [logs, setLogs] = useState<ReadingLog[]>(INITIAL_READING_LOGS);
  const [schedule, setSchedule] = useState<UserSchedule>(INITIAL_SCHEDULE);
  const [activeBookId, setActiveBookId] = useState<string>('book-1');

  // Navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'charts'>('dashboard');

  // Modals state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isQuickLogModalOpen, setIsQuickLogModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('tsundoku_user', JSON.stringify(user));
    } catch {}
    setToastMessage(`ยินดีต้อนรับ ${user.name}! เข้าสู่ระบบเรียบร้อย`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('tsundoku_user');
    } catch {}
    setToastMessage('ออกจากระบบเรียบร้อยแล้ว');
  };

  // Manual Quick Log Form
  const [pagesToLog, setPagesToLog] = useState(15);
  const [selectedBookForLog, setSelectedBookForLog] = useState('book-1');
  const [serverDbStatus, setServerDbStatus] = useState<{
    connected: boolean;
    storageEngine: string;
    totalBooks: number;
    lastUpdated?: string;
  }>({
    connected: true,
    storageEngine: 'Server File Database (JSON)',
    totalBooks: INITIAL_BOOKS.length,
  });

  // Load state from Server Database API on mount with localStorage fallback
  useEffect(() => {
    // 1. Initial local load for instant paint
    try {
      const savedUser = localStorage.getItem('tsundoku_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedBooks = localStorage.getItem('tsundoku_books');
      if (savedBooks) setBooks(JSON.parse(savedBooks));

      const savedLogs = localStorage.getItem('tsundoku_logs');
      if (savedLogs) setLogs(JSON.parse(savedLogs));

      const savedSchedule = localStorage.getItem('tsundoku_schedule');
      if (savedSchedule) setSchedule(JSON.parse(savedSchedule));

      const savedActiveBookId = localStorage.getItem('tsundoku_active_book_id');
      if (savedActiveBookId) setActiveBookId(savedActiveBookId);
    } catch {
      // Local fallback
    }

    // 2. Fetch authoritative data from Server Database
    const fetchServerData = async () => {
      try {
        const [booksRes, logsRes, scheduleRes, statusRes] = await Promise.allSettled([
          fetch('/api/books').then(r => r.json()),
          fetch('/api/logs').then(r => r.json()),
          fetch('/api/schedule').then(r => r.json()),
          fetch('/api/db/status').then(r => r.json()),
        ]);

        if (booksRes.status === 'fulfilled' && booksRes.value?.success && Array.isArray(booksRes.value.books)) {
          setBooks(booksRes.value.books);
          try {
            localStorage.setItem('tsundoku_books', JSON.stringify(booksRes.value.books));
          } catch {}
        }

        if (logsRes.status === 'fulfilled' && logsRes.value?.success && Array.isArray(logsRes.value.logs)) {
          setLogs(logsRes.value.logs);
          try {
            localStorage.setItem('tsundoku_logs', JSON.stringify(logsRes.value.logs));
          } catch {}
        }

        if (scheduleRes.status === 'fulfilled' && scheduleRes.value?.success && scheduleRes.value.schedule) {
          setSchedule(scheduleRes.value.schedule);
          try {
            localStorage.setItem('tsundoku_schedule', JSON.stringify(scheduleRes.value.schedule));
          } catch {}
        }

        if (statusRes.status === 'fulfilled' && statusRes.value?.success && statusRes.value.stats) {
          setServerDbStatus({
            connected: true,
            storageEngine: statusRes.value.stats.engine || 'Server File Database (JSON)',
            totalBooks: statusRes.value.stats.totalBooks,
            lastUpdated: statusRes.value.stats.lastUpdated,
          });
        }
      } catch (err) {
        console.warn('Server Database sync notice:', err);
      }
    };

    fetchServerData();
  }, []);

  // Save changes to localStorage and Server Database
  const saveBooks = (newBooks: Book[]) => {
    setBooks(newBooks);
    try {
      localStorage.setItem('tsundoku_books', JSON.stringify(newBooks));
    } catch {}
  };

  const saveLogs = (newLogs: ReadingLog[]) => {
    setLogs(newLogs);
    try {
      localStorage.setItem('tsundoku_logs', JSON.stringify(newLogs));
    } catch {}
  };

  const saveSchedule = async (newSchedule: UserSchedule) => {
    setSchedule(newSchedule);
    try {
      localStorage.setItem('tsundoku_schedule', JSON.stringify(newSchedule));
      await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
      });
    } catch {}
  };

  const handleSetActiveBook = (id: string) => {
    setActiveBookId(id);
    setSelectedBookForLog(id);
    try {
      localStorage.setItem('tsundoku_active_book_id', id);
    } catch {}
  };

  const handleUpdateBook = async (updated: Book) => {
    const next = books.map(b => b.id === updated.id ? updated : b);
    saveBooks(next);
    setToastMessage(`อัปเดตข้อมูล "${updated.title}" ในฐานข้อมูลเรียบร้อย!`);

    // Persist to Server Database
    try {
      await fetch('/api/books', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to update book on server database:', err);
    }
  };

  const handleAddBook = async (newBookData: Omit<Book, 'id' | 'addedAt'>) => {
    const tempId = `book-${Date.now()}`;
    const newBook: Book = {
      ...newBookData,
      id: tempId,
      addedAt: new Date().toISOString()
    };
    
    // Optimistic UI update
    const next = [newBook, ...books];
    saveBooks(next);
    handleSetActiveBook(newBook.id);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setToastMessage(`เพิ่มหนังสือ "${newBook.title}" ลงฐานข้อมูลเซิร์ฟเวอร์เรียบร้อยแล้ว! 📚`);

    // Persist directly to Server Database API
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook),
      });
      const data = await res.json();
      if (data.success && data.book) {
        // Update with server confirmed entity
        setBooks(prev => prev.map(b => b.id === tempId ? data.book : b));
        setServerDbStatus(prev => ({
          ...prev,
          connected: true,
          totalBooks: prev.totalBooks + 1,
        }));
      }
    } catch (err) {
      console.error('Failed to save book to server database:', err);
    }
  };

  const handleDeleteBook = async (id: string) => {
    const next = books.filter(b => b.id !== id);
    saveBooks(next);
    if (activeBookId === id && next.length > 0) {
      handleSetActiveBook(next[0].id);
    }
    setToastMessage('ลบหนังสือออกจากฐานข้อมูลเรียบร้อยแล้ว');

    // Delete from Server Database
    try {
      await fetch(`/api/books?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      setServerDbStatus(prev => ({
        ...prev,
        totalBooks: Math.max(0, prev.totalBooks - 1),
      }));
    } catch (err) {
      console.error('Failed to delete book from server database:', err);
    }
  };

  const handleQuickLogPages = async (book: Book, pagesAdded: number) => {
    const nextPage = Math.min(book.totalPages, book.currentPage + pagesAdded);
    const isCompleted = nextPage >= book.totalPages;

    const updatedBook: Book = {
      ...book,
      currentPage: nextPage,
      status: isCompleted ? 'completed' : book.status,
      completedAt: isCompleted ? new Date().toISOString().split('T')[0] : book.completedAt
    };

    handleUpdateBook(updatedBook);

    const now = new Date();
    const newLog: ReadingLog = {
      id: `log-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      pagesRead: pagesAdded,
      fromPage: book.currentPage,
      toPage: nextPage,
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
      source: 'web_manual'
    };

    saveLogs([newLog, ...logs]);

    // Persist log to Server Database API
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
    } catch (err) {
      console.error('Failed to save log to server database:', err);
    }
  };

  // Active Objective Book
  const activeBook = books.find(b => b.id === activeBookId) || books[0];

  // Calculated Telemetry
  const totalBooks = books.length;
  const completedBooks = books.filter(b => b.status === 'completed').length;
  const totalPagesRead = books.reduce((acc, b) => acc + (b.currentPage || 0), 0);
  const activeProgress = activeBook && activeBook.totalPages > 0 
    ? Math.min(100, Math.round((activeBook.currentPage / activeBook.totalPages) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#121212] selection:bg-[#ff4d00] selection:text-white md:grid md:grid-cols-[280px_1fr]">
      
      {/* 1. Variation 2 Sidebar Navigation (280px left aside) */}
      <SidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScheduler={() => setIsSchedulerOpen(true)}
        onOpenAddBook={() => {
          setEditingBook(null);
          setIsAddBookModalOpen(true);
        }}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Area with blueprint-grid background */}
      <main className="md:col-start-2 min-h-screen md:h-screen md:overflow-y-auto p-3.5 sm:p-8 lg:p-14 pb-28 md:pb-14 blueprint-grid">

        {/* Tab 1: Primary Overview / Variation 2 Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 sm:space-y-10">
            
            {/* Hero Section - Mobile optimized header */}
            <section id="hero-section" className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pb-1">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-white border border-[#121212] shadow-[2px_2px_0_#121212]">
                    <Database className="w-3 h-3 text-emerald-600" />
                    <span>Server Database: {serverDbStatus.connected ? `ออนไลน์ (${books.length} เล่ม)` : 'กำลังเชื่อมต่อ...'}</span>
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[0.92] mt-1">
                  I&apos;m your <span style={{ color: 'var(--accent)' }}>Bunnarak</span>
                </h1>
              </div>
              <div className="shrink-0 flex items-center gap-2 sm:gap-3">
                {currentUser ? (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="btn py-2 px-3 text-xs flex items-center gap-2 shadow-[3px_3px_0_#121212] font-mono cursor-pointer bg-white border-2 border-[#121212] hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 transition"
                    title="คลิกเพื่อจัดการโปรไฟล์"
                  >
                    {currentUser.pictureUrl ? (
                      <img src={currentUser.pictureUrl} alt={currentUser.name} className="w-4 h-4 object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span className="font-bold">{currentUser.name}</span>
                  </button>
                ) : (
                  <button
                    id="hero-login-button"
                    type="button"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="btn py-2 px-3 text-xs flex items-center gap-1.5 shadow-[3px_3px_0_#121212] font-mono font-bold cursor-pointer bg-white hover:bg-neutral-100 border-2 border-[#121212] active:translate-x-0.5 active:translate-y-0.5 transition"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#ff4d00]" />
                    <span>เข้าสู่ระบบ</span>
                  </button>
                )}

                <button
                  id="hero-add-book-btn"
                  type="button"
                  onClick={() => {
                    setEditingBook(null);
                    setIsAddBookModalOpen(true);
                  }}
                  className="btn btn-primary py-2 px-3.5 sm:px-4 text-xs flex items-center gap-1.5 shadow-[3px_3px_0_#121212] hover:shadow-[5px_5px_0_#121212] active:translate-x-0.5 active:translate-y-0.5 font-bold cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มหนังสือ</span>
                </button>
              </div>
            </section>

            {/* Stats Grid - High Legibility Numbers with Cards */}
            <section id="stats-grid-section" className="stats-grid">
              <div className="stat-card-mobile">
                <div className="flex items-center gap-1.5 label m-0 mb-1 text-[10px] sm:text-[11px] text-neutral-600">
                  <Flame className="w-3.5 h-3.5 text-[#ff4d00]" />
                  <span>ความต่อเนื่อง</span>
                </div>
                <div className="stat-value font-number font-extrabold text-2xl sm:text-3xl text-[#121212] tabular-nums">
                  7 <span className="text-xs sm:text-sm font-sans font-medium text-neutral-500">วัน</span>
                </div>
              </div>

              <div className="stat-card-mobile">
                <div className="flex items-center gap-1.5 label m-0 mb-1 text-[10px] sm:text-[11px] text-neutral-600">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>ความเร็ว</span>
                </div>
                <div className="stat-value font-number font-extrabold text-2xl sm:text-3xl text-[#121212] tabular-nums">
                  17.4 <span className="text-xs sm:text-sm font-sans font-medium text-neutral-500">หน้า/วัน</span>
                </div>
              </div>

              <div className="stat-card-mobile">
                <div className="flex items-center gap-1.5 label m-0 mb-1 text-[10px] sm:text-[11px] text-neutral-600">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>คุณอ่านจบไปแล้ว</span>
                </div>
                <div className="stat-value font-number font-extrabold text-2xl sm:text-3xl text-[#121212] tabular-nums">
                  {completedBooks} <span className="text-sm font-sans font-normal text-neutral-400">/</span> {totalBooks} <span className="text-xs sm:text-sm font-sans font-medium text-neutral-500">เล่ม</span>
                </div>
              </div>

              <div className="stat-card-mobile">
                <div className="flex items-center gap-1.5 label m-0 mb-1 text-[10px] sm:text-[11px] text-neutral-600">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>คุณอ่านไปแล้วทั้งหมด</span>
                </div>
                <div className="stat-value font-number font-extrabold text-2xl sm:text-3xl text-[#121212] tabular-nums">
                  {totalPagesRead.toLocaleString()} <span className="text-xs sm:text-sm font-sans font-medium text-neutral-500">หน้า</span>
                </div>
              </div>
            </section>

            {/* Active Book Box - Book on Left, Details on Right, Equal Action Buttons */}
            {activeBook && (
              <section id="active-book-focus-box" className="bg-[#ffffff] border-2 border-[#121212] p-3.5 sm:p-6 shadow-[5px_5px_0_#121212] sm:shadow-[8px_8px_0_#121212]">
                <div className="space-y-3.5 sm:space-y-4">
                  {/* Top: Book on the Left, Book Details on the Right */}
                  <div className="flex flex-row gap-3 sm:gap-5 items-start">
                    {/* Left: Book Cover Image */}
                    <div className="shrink-0">
                      <img 
                        src={activeBook.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"} 
                        alt={activeBook.title} 
                        className="w-20 sm:w-28 md:w-32 aspect-[3/4] object-cover border-2 border-[#121212] shadow-[3px_3px_0_#121212]"
                      />
                    </div>

                    {/* Right: Book Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="badge py-0.5 px-1.5 text-[10px] bg-[#121212]/5">
                          {activeBook.category}
                        </span>
                      </div>

                      <h2 className="font-display text-base sm:text-2xl font-bold tracking-tight text-[#121212] mt-0.5 leading-snug line-clamp-2">
                        {activeBook.title}
                      </h2>
                      <div className="text-xs font-mono text-[#121212]/70 mt-1 truncate">
                        โดย {activeBook.author}
                      </div>
                    </div>
                  </div>

                  {/* แถบหลอดพลัง (Long Energy Progress Bar) - จัดเรียงสวยงามเต็มความกว้าง */}
                  <div className="p-3 bg-[#f8f7f4] border-2 border-[#121212] shadow-[2px_2px_0_#121212]">
                    <div className="flex justify-between items-baseline mb-1.5 text-xs">
                      <span className="font-mono text-neutral-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse shrink-0" />
                        <span>อ่านไปแล้ว: <strong className="font-number font-bold text-[#121212] text-sm">{activeBook.currentPage} / {activeBook.totalPages} หน้า</strong></span>
                      </span>
                      <span className="font-number font-extrabold text-[#8B0000] text-sm sm:text-base tabular-nums">
                        {activeProgress}%
                      </span>
                    </div>
                    {/* หลอดพลังขนาดยาวขึ้นและมีเอฟเฟกต์สีเด่นชัด */}
                    <div className="w-full h-3.5 sm:h-4 bg-white border-2 border-[#121212] p-[1px] overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.08)]">
                      <div 
                        className="h-full bg-gradient-to-r from-[#8B0000] via-[#c41e3a] to-[#ff4d00] transition-all duration-300 relative"
                        style={{ width: `${activeProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%)] bg-[length:12px_12px] opacity-40" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-mono text-neutral-500 mt-1">
                      <span>เป้าหมาย: <strong className="font-number font-bold text-[#121212]">{activeBook.targetPagesPerDay || 20}</strong> หน้า/วัน</span>
                      <span>เหลือ {Math.max(0, activeBook.totalPages - activeBook.currentPage)} หน้า</span>
                    </div>
                  </div>

                  {/* Quick Log Buttons - Large and Easy to Tap */}
                  <div className="pt-0.5">
                    <div className="label text-[10px] sm:text-[11px] mb-1.5">บันทึกการอ่านด่วน (เพิ่มหน้า)</div>
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      {[5, 10, 20].map((inc) => (
                        <button 
                          key={inc}
                          onClick={() => {
                            handleQuickLogPages(activeBook, inc);
                            confetti({ particleCount: 25, spread: 40 });
                          }}
                          className="py-2 px-1 text-center font-number font-bold text-xs bg-white hover:bg-neutral-100 border-2 border-[#121212] shadow-[2px_2px_0_#121212] active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer" 
                        >
                          +{inc} หน้า
                        </button>
                      ))}
                      <button 
                        onClick={() => {
                          setSelectedBookForLog(activeBook.id);
                          setIsQuickLogModalOpen(true);
                        }}
                        className="py-2 px-1 text-center font-mono font-bold text-xs bg-[#121212] text-white hover:bg-neutral-800 border-2 border-[#121212] shadow-[2px_2px_0_#ff4d00] active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer" 
                      >
                        ระบุเอง
                      </button>
                    </div>
                  </div>

                  {/* Bottom Action Buttons: Equal Size with 'อ่านจบ' */}
                  <div className="pt-2 sm:pt-3 border-t border-[#121212]/15 grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => {
                        handleUpdateBook({
                          ...activeBook,
                          currentPage: activeBook.totalPages,
                          status: 'completed',
                          completedAt: new Date().toISOString().split('T')[0]
                        });
                        confetti({ particleCount: 70, spread: 60 });
                      }}
                      className="btn btn-primary py-2.5 px-3 text-xs sm:text-sm font-bold shadow-[2px_2px_0_#121212] flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>อ่านจบ</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingBook(activeBook);
                        setIsAddBookModalOpen(true);
                      }}
                      className="btn py-2.5 px-3 text-xs sm:text-sm font-bold bg-white text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0_#121212] hover:bg-neutral-50 flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
                      title="แก้ไขข้อมูลหรือเปลี่ยนรูปภาพหน้าปก"
                    >
                      <Edit3 className="w-4 h-4 shrink-0" />
                      <span>แก้ไข</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Collection List Section - Dual View: Mobile Cards vs Desktop Table */}
            <section id="collection-list-section" className="space-y-3 sm:space-y-4">
              <div>
                <span className="label m-0 text-xs sm:text-sm">รายการหนังสือในคลัง ({books.length})</span>
              </div>

              {/* Mobile View: Clean, Stacked Touch Cards (Display First 3 Books) */}
              <div className="block md:hidden space-y-2.5">
                {books.slice(0, 3).map((book) => {
                  const prog = Math.round((book.currentPage / (book.totalPages || 1)) * 100);
                  const isCurrent = book.id === activeBookId;
                  return (
                    <div 
                      key={book.id} 
                      className="bg-white border-2 border-[#121212] p-3 shadow-[3px_3px_0_#121212] space-y-2"
                    >
                      <div className="flex items-start gap-3">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-12 h-16 aspect-[3/4] object-cover border border-[#121212] shrink-0 shadow-[2px_2px_0_#121212]"
                          />
                        ) : (
                          <div className="w-12 h-16 aspect-[3/4] border border-[#121212] bg-[#f8f7f4] flex items-center justify-center text-base shrink-0 shadow-[2px_2px_0_#121212]">
                            {book.coverEmoji || '📖'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-[#121212] truncate">
                            {book.title}
                          </div>
                          <div className="text-[11px] font-mono text-neutral-500 truncate mt-0.5">
                            {book.category} • โดย {book.author}
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between items-center text-[11px] font-mono">
                              <span className="font-number font-bold text-[#121212]">{prog}%</span>
                              <span className="font-number text-neutral-500">({book.currentPage}/{book.totalPages} หน้า)</span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-200 border border-[#121212]/30 overflow-hidden">
                              <div className="h-full bg-[#8B0000] transition-all" style={{ width: `${prog}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                        {isCurrent ? (
                          <span className="text-[11px] font-mono font-bold text-[#ff4d00] flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#ff4d00]" />
                            <span>กำลังอ่านเล่มนี้</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setActiveBookId(book.id)}
                            className="text-[11px] font-mono font-bold px-2.5 py-1 border border-[#121212] bg-white hover:bg-[#121212] hover:text-white transition shadow-[2px_2px_0_#121212]"
                          >
                            เลือกอ่านเล่มนี้
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingBook(book);
                            setIsAddBookModalOpen(true);
                          }}
                          className="p-1 px-2 border border-[#121212] text-xs font-mono flex items-center gap-1 bg-white hover:bg-neutral-100"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>แก้ไข</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View: Full Data Table (Display First 3 Books) */}
              <div className="hidden md:block overflow-x-auto border-2 border-[#121212] bg-[#ffffff] shadow-[8px_8px_0_#121212]">
                <table className="archive-table mt-0">
                  <thead>
                    <tr className="bg-[#121212]/5">
                      <th>รูป / ข้อมูลหนังสือ</th>
                      <th>ความคืบหน้า</th>
                      <th className="text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.slice(0, 3).map((book) => {
                      const prog = Math.round((book.currentPage / (book.totalPages || 1)) * 100);
                      const isCurrent = book.id === activeBookId;
                      return (
                        <tr key={book.id} className={isCurrent ? 'bg-[#ff4d00]/5' : ''}>
                          <td style={{ fontWeight: 600 }}>
                            <div className="flex items-center gap-3">
                              {book.coverUrl ? (
                                <img
                                  src={book.coverUrl}
                                  alt={book.title}
                                  className="w-10 h-[50px] aspect-[4/5] object-cover border border-[#121212] shrink-0 shadow-[2px_2px_0_#121212]"
                                />
                              ) : (
                                <div className="w-10 h-[50px] aspect-[4/5] border border-[#121212] bg-[#f8f7f4] flex items-center justify-center text-sm shrink-0 shadow-[2px_2px_0_#121212]">
                                  {book.coverEmoji || '📖'}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-1.5">
                                  {isCurrent && <span className="w-2 h-2 rounded-full bg-[#ff4d00]" />}
                                  <span className="font-bold text-sm text-[#121212]">{book.title}</span>
                                </div>
                                <div className="text-[11px] font-mono text-[#121212]/65 flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="badge py-0 px-1 text-[9px] bg-[#121212]/5">{book.category}</span>
                                  <span className="opacity-40">•</span>
                                  <span>โดย {book.author}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 font-number">
                                <span className="font-bold text-sm">{prog}%</span>
                                <span className="opacity-60 text-xs font-mono">({book.currentPage}/{book.totalPages} หน้า)</span>
                              </div>
                              <div className="w-28 h-1.5 bg-[#121212]/10 border border-[#121212]/30 overflow-hidden">
                                <div className="h-full bg-[#8B0000] transition-all" style={{ width: `${prog}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isCurrent && (
                                <button
                                  onClick={() => setActiveBookId(book.id)}
                                  className="text-[10px] font-mono px-2 py-1 border border-[#121212] hover:bg-[#121212] hover:text-white transition"
                                >
                                  เลือกอ่าน
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingBook(book);
                                  setIsAddBookModalOpen(true);
                                }}
                                className="p-1 border border-[#121212] text-[#121212]/70 hover:bg-[#121212] hover:text-white transition"
                                title="แก้ไขข้อมูล / เปลี่ยนรูปภาพ"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Show more button when more than 3 books */}
              {books.length > 3 && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setActiveTab('library')}
                    className="w-full sm:w-auto py-2.5 px-5 bg-white hover:bg-[#121212] hover:text-white border-2 border-[#121212] shadow-[3px_3px_0_#121212] text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 mx-auto"
                  >
                    <span>จัดการหนังสือทั้งหมด ({books.length} เล่ม)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </section>

            {/* Embedded Velocity Telemetry Chart */}
            <section id="embedded-velocity-section" className="pt-6">
              <ReadingProgressChart
                logs={logs}
                books={books}
                schedule={schedule}
              />
            </section>

            {/* Bottom LINE Webhook Telemetry Card */}
            <section id="line-sync-telemetry-section" className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 pt-2 sm:pt-4">
              <div className="lg:col-span-6 bg-white border-2 border-[#121212] p-4 sm:p-6 lg:p-8 space-y-4 shadow-[4px_4px_0_#121212] sm:shadow-[8px_8px_0_#121212]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d00] animate-pulse" />
                    <h3 className="font-display text-lg sm:text-xl font-bold text-[#121212]">เชื่อมต่อ LINE สำหรับแจ้งเตือน</h3>
                  </div>
                  <span className="badge">
                    ออนไลน์
                  </span>
                </div>

                <div className="p-3.5 bg-[#f8f7f4] border-2 border-[#121212] space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-[#121212]/70">
                    <span>เวลาแจ้งเตือน:</span>
                    <span className="text-[#121212] font-number font-bold text-sm">{schedule.reminderTime} น.</span>
                  </div>
                  <div className="flex justify-between items-center text-[#121212]/70">
                    <span>เป้าหมายรายวัน:</span>
                    <span className="text-[#121212] font-number font-bold text-sm">{schedule.targetPagesPerDay} หน้า / คืน</span>
                  </div>
                  <div className="flex justify-between items-center text-[#121212]/70">
                    <span>ชื่อผู้ใช้ LINE:</span>
                    <span className="text-[#121212] font-bold">{schedule.lineDisplayName || 'นักอ่าน'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 pt-1">
                  {!currentUser ? (
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="btn btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-[2px_2px_0_#121212] font-bold cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#22c55e]" />
                      <span>เชื่อมต่อ LINE</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsSchedulerOpen(true)}
                      className="btn btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-[2px_2px_0_#121212] font-bold cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#22c55e]" />
                      <span>เชื่อมต่อ LINE</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsSchedulerOpen(true)}
                    className="btn text-xs py-2.5 px-3 sm:px-4 bg-white border-2 border-[#121212] shadow-[2px_2px_0_#121212] font-bold cursor-pointer hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 transition"
                  >
                    ตั้งค่า
                  </button>
                </div>
              </div>

              {/* Latest Reading Telemetry Logs */}
              <div className="lg:col-span-6 bg-white border-2 border-[#121212] p-4 sm:p-6 lg:p-8 space-y-4 shadow-[4px_4px_0_#121212] sm:shadow-[8px_8px_0_#121212]">
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#121212]">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#121212]">ประวัติการอ่านล่าสุด</h3>
                  <span className="label m-0 text-[11px]">5 รายการล่าสุด</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {logs.slice(0, 5).map((log) => (
                    <div 
                      key={log.id}
                      className="p-2.5 sm:p-3 bg-[#f8f7f4] border border-[#121212] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                        <span className="font-number font-bold text-[#ff4d00] text-sm tabular-nums shrink-0">+{log.pagesRead} หน้า</span>
                        <div className="min-w-0">
                          <div className="font-semibold truncate text-xs">{log.bookTitle}</div>
                          <div className="text-[10px] font-mono text-[#121212]/50 truncate">{log.timestamp}</div>
                        </div>
                      </div>
                      <span className="badge shrink-0 text-[10px]">
                        ถึงหน้า <strong className="font-number font-bold">{log.toPage}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>
        )}

        {/* Tab 2: Curated Library View */}
        {activeTab === 'library' && (
          <div className="space-y-8">
            <div className="pb-4 border-b-2 border-[#121212]">
              <span className="label">คลังหนังสือถาวร</span>
              <h2 className="font-display text-4xl font-extrabold text-[#121212] mt-1">
                คลังหนังสือและเป้าหมายการอ่าน
              </h2>
              <p className="text-[#121212]/70 text-sm mt-1 max-w-xl font-mono">
                จัดการกองหนังสือทั้งรูปเล่มและอีบุ๊ก ติดตามความคืบหน้า กำหนดเป้าหมาย และเลือกเล่มเข้าสู่เป้าหมายหลัก
              </p>
            </div>

            <BookManagement
              books={books}
              activeBookId={activeBookId}
              onUpdateBook={handleUpdateBook}
              onAddBook={handleAddBook}
              onDeleteBook={handleDeleteBook}
              onSetActiveBook={handleSetActiveBook}
              onQuickLogPages={handleQuickLogPages}
              onOpenAddBook={() => {
                setEditingBook(null);
                setIsAddBookModalOpen(true);
              }}
              onEditBook={(b) => {
                setEditingBook(b);
                setIsAddBookModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 3: Detailed Chrono Velocity */}
        {activeTab === 'charts' && (
          <div className="space-y-8">
            <div className="pb-4 border-b-2 border-[#121212]">
              <span className="label">ระบบวิเคราะห์ข้อมูล</span>
              <h2 className="font-display text-4xl font-extrabold text-[#121212] mt-1">
                ความเร็วและแนวโน้มการอ่าน
              </h2>
              <p className="text-[#121212]/70 text-sm mt-1 max-w-xl font-mono">
                สรุปสถิติการอ่านสะสม 30 วัน อัตราการบรรลุเป้าหมาย และความเร็วการอ่านของแต่ละเล่ม
              </p>
            </div>

            <ReadingProgressChart
              logs={logs}
              books={books}
              schedule={schedule}
            />
          </div>
        )}

      </main>

      {/* Quick Manual Log Modal - Brutalist Dialog */}
      <AnimatePresence>
        {isQuickLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#f8f7f4] border-2 border-[#121212] w-full max-w-md p-6 relative shadow-[12px_12px_0_#121212]"
            >
              <div className="flex items-center justify-between pb-3 mb-5 border-b-2 border-[#121212]">
                <div>
                  <span className="label m-0">บันทึกการอ่าน</span>
                  <h3 className="font-display text-2xl font-extrabold text-[#121212] mt-0.5">
                    บันทึกหน้าที่อ่านเพิ่ม
                  </h3>
                </div>
                <button
                  onClick={() => setIsQuickLogModalOpen(false)}
                  className="p-1 border border-[#121212] bg-white hover:bg-black hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block font-bold uppercase mb-1">เลือกหนังสือเป้าหมาย</label>
                  <select
                    value={selectedBookForLog}
                    onChange={(e) => setSelectedBookForLog(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs font-mono focus:outline-none cursor-pointer"
                  >
                    {books.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.currentPage}/{b.totalPages} หน้า)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">เพิ่มจำนวนหน้าด่วน</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 15, 20, 30].map(pages => (
                      <button
                        key={pages}
                        type="button"
                        onClick={() => setPagesToLog(pages)}
                        className={`py-2 border-2 border-[#121212] font-mono font-bold transition cursor-pointer ${
                          pagesToLog === pages
                            ? 'bg-[#121212] text-[#f8f7f4]'
                            : 'bg-white text-[#121212] hover:bg-[#121212]/10'
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
                    value={pagesToLog || ''}
                    onChange={(e) => setPagesToLog(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full mt-3 px-3 py-2 bg-white border-2 border-[#121212] font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-[#121212] flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsQuickLogModalOpen(false)}
                  className="btn text-xs py-2 px-4"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    const targetBook = books.find(b => b.id === selectedBookForLog) || books[0];
                    if (targetBook) {
                      handleQuickLogPages(targetBook, pagesToLog);
                      confetti({ particleCount: 50, spread: 60 });
                    }
                    setIsQuickLogModalOpen(false);
                  }}
                  className="btn btn-primary text-xs py-2 px-4"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <SchedulerSettingsModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        schedule={schedule}
        books={books}
        onSaveSchedule={saveSchedule}
      />

      {/* Add / Edit Book Modal with Image Upload */}
      <AddBookModal
        isOpen={isAddBookModalOpen}
        onClose={() => {
          setIsAddBookModalOpen(false);
          setEditingBook(null);
        }}
        onAddBook={handleAddBook}
        editingBook={editingBook}
        onUpdateBook={handleUpdateBook}
      />

      {/* Floating Success Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            id="app-toast-message"
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            className="fixed top-5 right-5 z-[120] bg-[#121212] text-[#f8f7f4] border-2 border-[#ff4d00] px-4 py-3 shadow-[6px_6px_0_#ff4d00] flex items-center gap-3 font-mono text-xs max-w-md"
          >
            <div className="w-6 h-6 rounded-none bg-[#ff4d00] text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold flex-1">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
