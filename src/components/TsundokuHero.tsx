import React from 'react';
import { BookOpen, Flame, CheckCircle2, Bookmark, Bell, ShieldCheck, TrendingUp } from 'lucide-react';
import { Book, UserSchedule } from '../types';

interface TsundokuHeroProps {
  books: Book[];
  schedule: UserSchedule;
  onOpenLineSimulator: () => void;
  onQuickLog: () => void;
  onViewCharts?: () => void;
}

export const TsundokuHero: React.FC<TsundokuHeroProps> = ({
  books,
  schedule,
  onOpenLineSimulator,
  onQuickLog,
  onViewCharts
}) => {
  const readingBooks = books.filter(b => b.status === 'reading');
  const backlogBooks = books.filter(b => b.status === 'backlog');
  const completedBooks = books.filter(b => b.status === 'completed');

  const totalBooks = books.length;
  // Clearance rate: completed / total
  const clearanceRate = totalBooks > 0 ? Math.round((completedBooks.length / totalBooks) * 100) : 0;
  
  const totalPagesRead = books.reduce((sum, b) => sum + (b.currentPage || 0), 0);
  const totalBookPages = books.reduce((sum, b) => sum + (b.totalPages || 0), 0);
  const overallPageProgress = totalBookPages > 0 ? Math.round((totalPagesRead / totalBookPages) * 100) : 0;

  const activeBook = books.find(b => b.id === schedule.activeBookId) || readingBooks[0] || books[0];

  return (
    <section className="relative overflow-hidden pt-6 pb-4 border-b border-neutral-800">
      {/* Subtle architectural background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Core HUD Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Main Tsundoku Clearance Gauge Card (5 cols) */}
          <div className="md:col-span-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xs uppercase tracking-widest font-mono text-neutral-400">
                    Tsundoku Clearance Status
                  </h2>
                  <p className="text-lg font-bold text-white tracking-tight">
                    อัตราการทลายกองดองรวม
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {completedBooks.length} / {totalBooks} เล่ม
                </span>
              </div>

              {/* Progress Visual Display */}
              <div className="flex items-center space-x-5 py-2">
                {/* Gauge Circle */}
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#262626"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    {/* Active progress */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#e5e5e5"
                      strokeWidth="10"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * clearanceRate) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black font-mono text-white tracking-tight">
                      {clearanceRate}%
                    </span>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium">
                      CLEARED
                    </span>
                  </div>
                </div>

                {/* Progress Details */}
                <div className="space-y-2 flex-1">
                  <div className="text-xs text-neutral-300 leading-relaxed">
                    คุณอ่านจบไปแล้ว <strong className="text-white font-semibold">{completedBooks.length} เล่ม</strong> จากทั้งหมด {totalBooks} เล่ม
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden border border-neutral-700/50">
                    <div
                      className="bg-neutral-100 h-full rounded-full transition-all duration-700"
                      style={{ width: `${clearanceRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span>กองดองเหลือ {backlogBooks.length} เล่ม</span>
                    <span>{overallPageProgress}% ของหน้าทั้งหมด</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro badges at bottom */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" />
                <span>Anti-Tsundoku Protocol Active</span>
              </div>
              <span className="font-mono text-[11px] text-neutral-500">LINE SYNC: ON</span>
            </div>
          </div>

          {/* Stat Pillars (7 cols) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* 1. กำลังอ่าน (Reading) */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between hover:border-neutral-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-neutral-400">กำลังอ่าน</span>
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              </div>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {readingBooks.length}
                </div>
                <div className="text-[11px] text-neutral-400">เล่มปัจจุบัน</div>
              </div>
              <div className="text-[10px] text-neutral-500 truncate">
                เป้า {schedule.targetPagesPerDay} หน้า/วัน
              </div>
            </div>

            {/* 2. กองดองคงเหลือ (Tsundoku Backlog) */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between hover:border-neutral-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-neutral-400">กองดอง</span>
                <Bookmark className="w-3.5 h-3.5 text-neutral-500" />
              </div>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-black font-mono text-neutral-200">
                  {backlogBooks.length}
                </div>
                <div className="text-[11px] text-neutral-400">เล่มที่รออ่าน</div>
              </div>
              <div className="text-[10px] text-neutral-500">
                พร้อมเริ่มเมื่อไหร่บอกได้
              </div>
            </div>

            {/* 3. อ่านจบแล้ว (Completed) */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between hover:border-neutral-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-neutral-400">อ่านจบแล้ว</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {completedBooks.length}
                </div>
                <div className="text-[11px] text-neutral-400">ทลายสำเร็จ</div>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">
                +1 เล่มเดือนนี้
              </div>
            </div>

            {/* 4. Reading Streak */}
            <div 
              onClick={onViewCharts}
              className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-lg transition cursor-pointer group"
              title="คลิกเพื่อดูกราฟวิเคราะห์การอ่าน 30 วัน"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-neutral-400">Streak</span>
                <Flame className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
              </div>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 flex items-center space-x-1">
                  <span>7</span>
                  <span className="text-sm text-neutral-400 font-normal">วัน</span>
                </div>
                <div className="text-[11px] text-neutral-400">ความต่อเนื่อง</div>
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>ดูกราฟการอ่าน 30 วัน</span>
              </div>
            </div>

            {/* Bottom summary bar spanning across full 4 columns on mobile/tablet */}
            <div className="col-span-2 sm:col-span-4 bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-3 text-xs">
                <div className="text-neutral-400">
                  สะสมทั้งหมด: <span className="text-white font-mono font-bold">{totalPagesRead.toLocaleString()}</span> / {totalBookPages.toLocaleString()} หน้า
                </div>
                <span className="text-neutral-600 hidden sm:inline">•</span>
                <div className="text-neutral-400 hidden sm:inline">
                  แจ้งเตือน LINE: <span className="text-neutral-200 font-medium">จันทร์, พุธ, ศุกร์, อาทิตย์</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {onViewCharts && (
                  <button
                    id="hero-view-charts-btn"
                    onClick={onViewCharts}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1 transition cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>ข้อมูลกราฟการอ่าน</span>
                  </button>
                )}
                <button
                  id="hero-test-line-alert-btn"
                  onClick={onOpenLineSimulator}
                  className="text-xs text-neutral-300 hover:text-white font-medium flex items-center space-x-1 transition cursor-pointer"
                >
                  <Bell className="w-3 h-3 text-emerald-400" />
                  <span>ทดสอบ LINE</span>
                </button>
                <button
                  id="hero-quick-log-btn"
                  onClick={onQuickLog}
                  className="text-xs text-neutral-200 hover:text-white font-medium underline underline-offset-4 decoration-neutral-600 hover:decoration-white transition cursor-pointer"
                >
                  + บันทึกหน้าอ่าน
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
