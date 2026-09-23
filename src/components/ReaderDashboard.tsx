'use client';

import React, { useState, useEffect } from 'react';
import { Book, ReadingLog, UserSchedule } from '../types';
import { 
  INITIAL_BOOKS, INITIAL_SCHEDULE, INITIAL_READING_LOGS 
} from '../data/initialData';
import { SidebarNav } from './SidebarNav';
import { BookManagement } from './BookManagement';
import { ReadingProgressChart } from './ReadingProgressChart';
import { LineSimulatorModal } from './LineSimulatorModal';
import { SchedulerSettingsModal } from './SchedulerSettingsModal';
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
  Image as ImageIcon
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
  const [isLineSimOpen, setIsLineSimOpen] = useState(false);
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
        onOpenLineSimulator={() => setIsLineSimOpen(true)}
        onOpenScheduler={() => setIsSchedulerOpen(true)}
        onOpenAddBook={() => {
          setEditingBook(null);
          setIsAddBookModalOpen(true);
        }}
      />

      {/* 2. Main Content Area with blueprint-grid background */}
      <main className="md:col-start-2 h-screen overflow-y-auto p-6 sm:p-10 lg:p-16 blueprint-grid">

        {/* Tab 1: Primary Overview / Variation 2 Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            
            {/* Variation 2 Hero Section */}
            <section id="hero-section" className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="label m-0 text-xs text-[#ff4d00] font-bold">ระบบติดตามการอ่านกองดอง</span>
                  <span className="text-neutral-400 hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-white border border-[#121212] shadow-[2px_2px_0_#121212]">
                    <Database className="w-3 h-3 text-emerald-600" />
                    <span>Server Database: {serverDbStatus.connected ? `ออนไลน์ (${books.length} เล่ม)` : 'กำลังเชื่อมต่อ...'}</span>
                  </span>
                </div>
                <h1 className="font-display text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold tracking-tight leading-[0.88] mt-1">
                  I&apos;m your <span style={{ color: 'var(--accent)' }}>Bunnarak</span>
                </h1>
              </div>
              <div className="shrink-0">
                <button
                  id="hero-add-book-btn"
                  type="button"
                  onClick={() => {
                    setEditingBook(null);
                    setIsAddBookModalOpen(true);
                  }}
                  className="btn btn-primary py-2.5 px-4 text-xs flex items-center gap-2 shadow-[4px_4px_0_#121212] hover:shadow-[6px_6px_0_#121212] active:translate-x-0.5 active:translate-y-0.5 font-bold cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มหนังสือ</span>
                </button>
              </div>
            </section>

            {/* Variation 2 Stats Grid */}
            <section id="stats-grid-section" className="stats-grid">
              <div>
                <span className="label">ความต่อเนื่อง</span>
                <div className="stat-value">
                  7 <span className="text-base font-sans font-normal opacity-60">วัน</span>
                </div>
              </div>
              <div>
                <span className="label">ความเร็ว</span>
                <div className="stat-value">
                  17.4 <span className="text-base font-sans font-normal opacity-60">หน้า/วัน</span>
                </div>
              </div>
              <div>
                <span className="label">อ่านจบแล้ว</span>
                <div className="stat-value">
                  {completedBooks} / {totalBooks}
                </div>
              </div>
              <div>
                <span className="label">รวมหน้าที่อ่าน</span>
                <div className="stat-value">
                  {totalPagesRead.toLocaleString()} <span className="text-base font-sans font-normal opacity-60">หน้า</span>
                </div>
              </div>
            </section>

            {/* Variation 2 Active Book Box */}
            {activeBook && (
              <section id="active-book-focus-box" className="active-book-box">
                <img 
                  src={activeBook.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"} 
                  alt={activeBook.title} 
                  className="book-img"
                />
                <div className="flex flex-col justify-between">
                  <div>
                    <span className="badge">เล่มที่กำลังอ่าน</span>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', margin: '0.5rem 0 0.25rem', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
                      {activeBook.title}
                    </h2>
                    <div style={{ opacity: 0.75, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }} className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="badge py-0.5 px-1.5 text-[10px] bg-[#121212]/5">{activeBook.category}</span>
                      <span className="opacity-40">•</span>
                      <span>โดย {activeBook.author}</span>
                    </div>

                    <div className="progress-container">
                      <div className="label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>ความคืบหน้า: {activeBook.currentPage}/{activeBook.totalPages} หน้า</span>
                        <span className="text-[#8B0000] font-bold">{activeProgress}% สำเร็จ</span>
                      </div>
                      <div className="progress-bar border border-[#121212]">
                        <div 
                          className="progress-fill bg-[#8B0000]" 
                          style={{ width: `${activeProgress}%`, backgroundColor: '#8B0000' }}
                        />
                      </div>
                    </div>

                    <div className="label" style={{ marginTop: '0.5rem' }}>บันทึกการอ่านด่วน</div>
                    <div className="btn-group" style={{ marginTop: '0.5rem', gap: '0.5rem' }}>
                      {[5, 10, 20].map((inc) => (
                        <button 
                          key={inc}
                          onClick={() => {
                            handleQuickLogPages(activeBook, inc);
                            confetti({ particleCount: 25, spread: 40 });
                          }}
                          className="btn" 
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.65rem' }}
                        >
                          +{inc} หน้า
                        </button>
                      ))}
                      <button 
                        onClick={() => {
                          setSelectedBookForLog(activeBook.id);
                          setIsQuickLogModalOpen(true);
                        }}
                        className="btn btn-primary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.65rem' }}
                      >
                        ระบุเอง
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 mt-4 border-t border-[#121212]/10 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingBook(activeBook);
                        setIsAddBookModalOpen(true);
                      }}
                      className="btn text-[11px] py-1.5 px-3 flex items-center gap-1.5"
                      title="แก้ไขข้อมูลหรือเปลี่ยนรูปภาพหน้าปก"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>แก้ไข / เปลี่ยนรูป</span>
                    </button>
                    <button
                      onClick={() => setIsLineSimOpen(true)}
                      className="btn text-[11px] py-1.5 px-3"
                    >
                      ส่งแจ้งเตือน LINE
                    </button>
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
                      className="btn text-[11px] py-1.5 px-3"
                    >
                      อ่านจบเล่มนี้แล้ว
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Variation 2 Collection List Table */}
            <section id="collection-list-section" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="label m-0">รายการหนังสือในคลัง</span>
                <button
                  onClick={() => setActiveTab('library')}
                  className="font-mono text-xs uppercase tracking-wider underline hover:text-[#ff4d00] transition cursor-pointer"
                >
                  จัดการหนังสือทั้งหมด ({books.length}) →
                </button>
              </div>

              <div className="overflow-x-auto border-2 border-[#121212] bg-[#ffffff] shadow-[8px_8px_0_#121212]">
                <table className="archive-table mt-0">
                  <thead>
                    <tr className="bg-[#121212]/5">
                      <th>รูป / ข้อมูลหนังสือ</th>
                      <th>สถานะ</th>
                      <th>ความคืบหน้า</th>
                      <th className="text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => {
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
                            <span className="badge">
                              {book.status === 'reading' ? 'กำลังอ่าน' : book.status === 'completed' ? 'อ่านจบแล้ว' : 'กองดอง'}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{prog}%</span>
                                <span className="opacity-50 text-[11px]">({book.currentPage}/{book.totalPages} หน้า)</span>
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
            <section id="line-sync-telemetry-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
              <div className="lg:col-span-6 bg-white border-2 border-[#121212] p-6 sm:p-8 space-y-4 shadow-[8px_8px_0_#121212]">
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#121212]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d00] animate-pulse" />
                    <h3 className="font-display text-xl font-bold text-[#121212]">เชื่อมต่อ LINE สำหรับแจ้งเตือน</h3>
                  </div>
                  <span className="badge">
                    ออนไลน์
                  </span>
                </div>

                <p className="text-xs font-mono text-[#121212]/70 leading-relaxed">
                  ระบบแจ้งเตือนทุกคืนเวลา {schedule.reminderTime} น. พร้อมปุ่มตอบกลับด่วน (Quick Reply) แบบ 1 วินาที
                </p>

                <div className="p-4 bg-[#f8f7f4] border-2 border-[#121212] space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#121212]/60">
                    <span>เวลาแจ้งเตือน:</span>
                    <span className="text-[#121212] font-bold">{schedule.reminderTime} น.</span>
                  </div>
                  <div className="flex justify-between text-[#121212]/60">
                    <span>เป้าหมายรายวัน:</span>
                    <span className="text-[#121212] font-bold">{schedule.targetPagesPerDay} หน้า / คืน</span>
                  </div>
                  <div className="flex justify-between text-[#121212]/60">
                    <span>ชื่อผู้ใช้ LINE:</span>
                    <span className="text-[#121212] font-bold">{schedule.lineDisplayName || 'นักอ่าน'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsLineSimOpen(true)}
                    className="btn btn-primary flex-1 text-xs py-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>เปิดหน้าต่างจำลอง LINE</span>
                  </button>
                  <button
                    onClick={() => setIsSchedulerOpen(true)}
                    className="btn text-xs py-2 px-4"
                  >
                    ตั้งค่าเวลา
                  </button>
                </div>
              </div>

              {/* Latest Reading Telemetry Logs */}
              <div className="lg:col-span-6 bg-white border-2 border-[#121212] p-6 sm:p-8 space-y-4 shadow-[8px_8px_0_#121212]">
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#121212]">
                  <h3 className="font-display text-xl font-bold text-[#121212]">ประวัติการอ่านล่าสุด</h3>
                  <span className="label m-0">5 รายการล่าสุด</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {logs.slice(0, 5).map((log) => (
                    <div 
                      key={log.id}
                      className="p-3 bg-[#f8f7f4] border border-[#121212] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[#ff4d00]">+{log.pagesRead} หน้า</span>
                        <div>
                          <div className="font-semibold line-clamp-1">{log.bookTitle}</div>
                          <div className="text-[10px] font-mono text-[#121212]/50">{log.timestamp}</div>
                        </div>
                      </div>
                      <span className="badge">ถึงหน้า {log.toPage}</span>
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
      <LineSimulatorModal
        isOpen={isLineSimOpen}
        onClose={() => setIsLineSimOpen(false)}
        schedule={schedule}
        activeBook={activeBook}
        onQuickLogPages={handleQuickLogPages}
        onUpdateSchedule={saveSchedule}
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
