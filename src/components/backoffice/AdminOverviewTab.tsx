import React from 'react';
import { Book, UserSchedule, ReadingLog } from '../../types';
import { 
  Users, BookOpen, Flame, MessageSquare, 
  TrendingUp, CheckCircle2, Clock, Sparkles, 
  Radio, ArrowRight, Activity, ShieldCheck 
} from 'lucide-react';

interface AdminOverviewTabProps {
  books: Book[];
  schedule: UserSchedule;
  readingLogs: ReadingLog[];
  onNavigateTab: (tab: string) => void;
  serverStatus: { status: string; service: string; lineConfigured: boolean } | null;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  books,
  schedule,
  readingLogs,
  onNavigateTab,
  serverStatus
}) => {
  const completedBooks = books.filter(b => b.status === 'completed');
  const readingBooks = books.filter(b => b.status === 'reading');
  const backlogBooks = books.filter(b => b.status === 'backlog');

  const totalPagesInSystem = books.reduce((acc, b) => acc + b.totalPages, 0);
  const totalPagesRead = books.reduce((acc, b) => acc + b.currentPage, 0);
  const clearanceRate = books.length > 0 ? Math.round((completedBooks.length / books.length) * 100) : 0;

  const totalLogs = readingLogs.length;
  const recentLogs = readingLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-850 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white">ระบบ Tsundoku Backend พร้อมใช้งาน</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-900/40 text-emerald-400 border border-emerald-800/60">
                LIVE PRODUCTION
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              สถานะ API: {serverStatus ? 'ออนไลน์สมบูรณ์ (HTTP 200)' : 'กำลังเชื่อมต่อ Express API...'} • LINE Webhook: {serverStatus?.lineConfigured ? 'เชื่อมต่อแล้ว' : 'โหมดจำลอง (Simulator)'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigateTab('broadcast')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>ยิง Broadcast ด่วน</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Users */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">สมาชิก LINE ทั้งหมด</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black tracking-tight text-white">1,248</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +14%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 flex items-center justify-between">
            <span>เชื่อมต่อ LINE Webhook แล้ว</span>
            <span className="text-emerald-400 font-mono">98.2%</span>
          </div>
        </div>

        {/* Card 2: Books Clearance Rate */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">อัตราทลายกองดองรวม</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black tracking-tight text-white">{clearanceRate}%</span>
            <span className="text-xs text-neutral-400">({completedBooks.length}/{books.length} เล่ม)</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 flex items-center justify-between">
            <span>อ่านสะสมทั้งหมด</span>
            <span className="text-white font-mono">{totalPagesRead.toLocaleString()} / {totalPagesInSystem.toLocaleString()} หน้า</span>
          </div>
        </div>

        {/* Card 3: Reading Streak */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Streak สูงสุดระบบ</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black tracking-tight text-white">14 วัน</span>
            <span className="text-xs text-amber-400 font-medium">🔥 ต่อเนื่อง</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 flex items-center justify-between">
            <span>เป้าหมายวันนี้</span>
            <span className="text-neutral-300 font-mono">{schedule.targetPagesPerDay || 20} หน้า/วัน</span>
          </div>
        </div>

        {/* Card 4: Webhook & AI Assistant */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">LINE Quick Reply Events</span>
            <div className="w-8 h-8 rounded-lg bg-sky-950/40 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black tracking-tight text-white">{totalLogs * 12 + 142}</span>
            <span className="text-xs text-sky-400 font-medium">ครั้ง/เดือน</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 flex items-center justify-between">
            <span>ความเร็วตอบกลับบอท</span>
            <span className="text-emerald-400 font-mono">&lt; 180ms</span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Catalog Status & Recent Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Books Distribution Breakdown */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">สถานะคลังกองดอง (Tsundoku Status)</h3>
            <button
              onClick={() => onNavigateTab('books')}
              className="text-xs text-neutral-400 hover:text-white transition flex items-center space-x-1"
            >
              <span>ดูทั้งหมด</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {/* Reading */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-sky-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  <span>กำลังอ่าน (In Progress)</span>
                </span>
                <span className="font-mono text-white font-semibold">{readingBooks.length} เล่ม</span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-400 rounded-full" 
                  style={{ width: `${(readingBooks.length / (books.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Backlog */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>กองดองรออ่าน (Backlog)</span>
                </span>
                <span className="font-mono text-white font-semibold">{backlogBooks.length} เล่ม</span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full" 
                  style={{ width: `${(backlogBooks.length / (books.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Completed */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>ทลายสำเร็จแล้ว (Finished)</span>
                </span>
                <span className="font-mono text-white font-semibold">{completedBooks.length} เล่ม</span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full" 
                  style={{ width: `${(completedBooks.length / (books.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 text-xs text-neutral-400 space-y-2">
            <div className="flex justify-between">
              <span>หนังสือที่ระบบแนะนำ (Featured):</span>
              <span className="font-mono text-neutral-200">Atomic Habits</span>
            </div>
            <div className="flex justify-between">
              <span>เวลาสะกิดอ่านเฉลี่ย:</span>
              <span className="font-mono text-neutral-200">{schedule.reminderTime || '20:00'} น.</span>
            </div>
            <div className="flex justify-between">
              <span>LINE User เชื่อมต่อปัจจุบัน:</span>
              <span className="font-mono text-neutral-200">{schedule.lineDisplayName || 'ผู้อ่านสาธิต'}</span>
            </div>
          </div>
        </div>

        {/* Live System Activity Feed */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">บันทึกกิจกรรมล่าสุด (System Event Log)</h3>
              <p className="text-xs text-neutral-400">บันทึกการอ่านจาก Web App และการตอบกลับผ่าน LINE Quick Reply</p>
            </div>
            <button
              onClick={() => onNavigateTab('broadcast')}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-300 transition"
            >
              ดู Live Stream
            </button>
          </div>

          <div className="divide-y divide-neutral-800/80">
            {recentLogs.length === 0 ? (
              <p className="py-6 text-center text-xs text-neutral-500">ยังไม่มีบันทึกกิจกรรมการอ่านในระบบ</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-emerald-400 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">{log.bookTitle}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-neutral-800 text-neutral-400">
                          +{log.pagesRead} หน้า
                        </span>
                      </div>
                      <p className="text-neutral-400 text-[11px] mt-0.5">
                        อ่านถึงหน้า {log.toPage} • แหล่งที่มา: {log.source === 'line_quick_reply' ? '📱 LINE Quick Reply' : '💻 เว็บบันทึกตรง'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500 whitespace-nowrap">
                    {log.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-500">บันทึกสะสมทั้งหมด {readingLogs.length} รายการ</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Syncing with Local Database</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
