import React from 'react';
import { BookOpen, Flame, Bell, ArrowRight, Sparkles, Check, CheckCircle2, Clock } from 'lucide-react';
import { Book, UserSchedule } from '../types';

interface TsundokuHeroProps {
  books: Book[];
  schedule: UserSchedule;
  onOpenLineSimulator: () => void;
  onOpenConcierge: () => void;
  onQuickLog: () => void;
}

export const TsundokuHero: React.FC<TsundokuHeroProps> = ({
  books,
  schedule,
  onOpenLineSimulator,
  onOpenConcierge,
  onQuickLog
}) => {
  const readingBooks = books.filter(b => b.status === 'reading');
  const backlogBooks = books.filter(b => b.status === 'backlog');
  const completedBooks = books.filter(b => b.status === 'completed');

  const totalBooks = books.length;
  const clearanceRate = totalBooks > 0 ? Math.round((completedBooks.length / totalBooks) * 100) : 0;
  
  const totalPagesRead = books.reduce((sum, b) => sum + (b.currentPage || 0), 0);
  const totalBookPages = books.reduce((sum, b) => sum + (b.totalPages || 0), 0);
  const overallPageProgress = totalBookPages > 0 ? Math.round((totalPagesRead / totalBookPages) * 100) : 0;

  const activeBook = books.find(b => b.id === schedule.activeBookId) || readingBooks[0] || books[0];

  return (
    <div className="w-full">
      {/* 1. Hero Banner - Variation 3 Layout */}
      <section className="bg-[#f4f2ea] border-b border-[#e8e6df] px-4 sm:px-8 lg:px-12 py-8 sm:py-14">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column (Headline & Context) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center space-x-2">
              <span className="meta text-[#ff4d00] font-bold">● PROTOCOL ACTIVE</span>
              <span className="meta text-[#1c1c1c]/40">•</span>
              <span className="meta text-[#1c1c1c]/70">LINE SCHEDULE SYNC</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.88] tracking-[-0.05em] text-[#1c1c1c]">
              Taming the <span className="serif lowercase text-[#1c1c1c]">unread</span>.
            </h1>

            <p className="text-sm sm:text-base text-[#1c1c1c]/75 max-w-xl leading-relaxed font-normal pt-1">
              ยินดีต้อนรับกลับ คุณทลายกองดองสำเร็จไปแล้ว <strong className="text-[#1c1c1c] font-bold">{clearanceRate}%</strong> ({completedBooks.length} จาก {totalBooks} เล่ม) คืนนี้เวลา <span className="font-mono font-bold text-[#1c1c1c]">{schedule.reminderTime} น.</span> ระบบจะส่งสัญญาณกระตุ้นการอ่านเล่ม <span className="font-bold underline decoration-[#ff4d00] underline-offset-4 decoration-2">"{activeBook?.title || 'หนังสือเป้าหมาย'}"</span> ({schedule.targetPagesPerDay} หน้า) ผ่าน LINE Webhook
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-test-line-alert-btn"
                onClick={onOpenLineSimulator}
                className="bg-[#1c1c1c] text-[#fdfcf8] hover:bg-[#ff4d00] px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center space-x-2 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-[#fdfcf8]" />
                <span>จำลองข้อความ LINE PUSH</span>
              </button>

              <button
                id="hero-concierge-chat-btn"
                onClick={onOpenConcierge}
                className="bg-transparent text-[#1c1c1c] border border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#fdfcf8] px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>ปรึกษา AI CONCIERGE</span>
              </button>

              <button
                id="hero-quick-log-btn"
                onClick={onQuickLog}
                className="bg-white text-[#1c1c1c] border border-[#e8e6df] hover:border-[#1c1c1c] px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm"
              >
                + บันทึกหน้าอ่านด่วน
              </button>
            </div>
          </div>

          {/* Right Column (Editorial Stat List) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-none border border-[#1c1c1c] shadow-[4px_4px_0px_#1c1c1c]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1c1c1c]">
              <span className="meta text-[#1c1c1c] font-bold">SYSTEM METRICS // PROTOCOL INDEX</span>
              <span className="meta text-[#ff4d00] font-bold">LIVE SYNC</span>
            </div>

            <ul className="divide-y divide-[#e8e6df] text-xs sm:text-sm">
              <li className="flex justify-between items-center py-3">
                <span className="meta text-[#1c1c1c]/70">Backlog Index (กองดอง)</span>
                <span className="font-mono font-bold text-[#1c1c1c] text-base">
                  {String(backlogBooks.length).padStart(2, '0')} Books
                </span>
              </li>

              <li className="flex justify-between items-center py-3">
                <span className="meta text-[#1c1c1c]/70">Current Streak</span>
                <span className="font-mono font-extrabold text-[#ff4d00] text-base flex items-center space-x-1">
                  <span>🔥</span>
                  <span>07 Days</span>
                </span>
              </li>

              <li className="flex justify-between items-center py-3">
                <span className="meta text-[#1c1c1c]/70">Global Clearance Rate</span>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#1c1c1c] text-base">
                    {clearanceRate}%
                  </span>
                  <span className="meta block text-[10px] text-[#1c1c1c]/50">
                    {totalPagesRead.toLocaleString()} / {totalBookPages.toLocaleString()} Pgs
                  </span>
                </div>
              </li>

              <li className="flex justify-between items-center py-3">
                <span className="meta text-[#1c1c1c]/70">Notification Status</span>
                <span className="font-mono font-bold text-[#1c1c1c] px-2 py-0.5 bg-[#f4f2ea] border border-[#e8e6df] text-xs">
                  {schedule.lineConnected ? 'Live Sync @ ' + schedule.reminderTime : 'Disconnected'}
                </span>
              </li>

              <li className="flex justify-between items-center py-3">
                <span className="meta text-[#1c1c1c]/70">Active Target Book</span>
                <span className="font-semibold text-[#1c1c1c] text-xs truncate max-w-[180px]" title={activeBook?.title}>
                  {activeBook?.title || 'None'}
                </span>
              </li>
            </ul>

            {/* Overall Progress Bar */}
            <div className="mt-4 pt-3 border-t border-[#e8e6df] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="meta text-[#1c1c1c]">Total Pages Conquered</span>
                <span className="font-mono font-bold text-[#1c1c1c]">{overallPageProgress}%</span>
              </div>
              <div className="w-full bg-[#f4f2ea] h-2 border border-[#1c1c1c] overflow-hidden">
                <div 
                  className="bg-[#1c1c1c] h-full transition-all duration-700 ease-out"
                  style={{ width: `${overallPageProgress}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Variation 3 Concierge Speech Bubble Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-10">
        <div className="relative bg-[#1c1c1c] text-[#fdfcf8] p-6 sm:p-8 rounded-3xl shadow-xl">
          {/* Triangular Tail pointing down */}
          <div 
            className="absolute -bottom-2.5 left-12 w-0 h-0 
              border-l-[10px] border-l-transparent 
              border-r-[10px] border-r-transparent 
              border-t-[10px] border-t-[#1c1c1c]" 
          />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-2">
                <span className="meta text-white/50 tracking-wider">
                  [CONCIERGE SUGGESTION &bull; VIRTUAL BUTLER]
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#ff4d00] text-white font-bold">
                  RECOMMENDED ACTION
                </span>
              </div>

              <p className="text-base sm:text-xl font-medium text-[#fdfcf8] leading-relaxed">
                "{activeBook?.title || 'หนังสือของคุณ'}" remains your primary focus. Reading just <strong className="text-[#ff4d00] font-bold">{schedule.targetPagesPerDay} pages</strong> tonight will keep your 7-day streak alive. Shall we log your progress?
              </p>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0 w-full md:w-auto">
              <button
                onClick={onQuickLog}
                className="flex-1 md:flex-none bg-[#ff4d00] hover:bg-[#e04400] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
              >
                + บันทึก {schedule.targetPagesPerDay} หน้าทันที
              </button>
              <button
                onClick={onOpenConcierge}
                className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                คุยกับ Concierge
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
