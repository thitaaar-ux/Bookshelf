import React from 'react';
import { BookOpen, Bell, MessageSquare, Calendar, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab?: 'dashboard' | 'library' | 'architecture';
  setActiveTab: (tab: 'dashboard' | 'library' | 'architecture') => void;
  onOpenLineSimulator: () => void;
  onOpenScheduler: () => void;
  onOpenBackoffice?: () => void;
  lineConnected: boolean;
  clearanceRate: number;
  streakCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenLineSimulator,
  onOpenScheduler,
  onOpenBackoffice,
  lineConnected,
  clearanceRate,
  streakCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white shadow-inner">
              <BookOpen className="w-5 h-5 text-neutral-100" />
            </div>
            <span className="font-extrabold tracking-wider text-base uppercase text-neutral-100 whitespace-nowrap">
              TSUNDOKU
            </span>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2">
            {/* Streak & Clearance Mini indicators */}
            <div
              id="header-streak-indicator"
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300"
              title="สถิติ Streak การอ่านต่อเนื่อง"
            >
              <span className="text-amber-400">🔥</span>
              <span className="font-mono font-semibold">{streakCount} วัน</span>
            </div>

            <button
              id="header-clearance-badge"
              onClick={() => setActiveTab('dashboard')}
              className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300"
            >
              <span className="text-neutral-400 text-[11px]">ทลายกองดอง:</span>
              <span className="font-mono font-bold text-white">{clearanceRate}%</span>
            </button>

            {/* LINE Bot Simulator trigger button */}
            <button
              id="header-btn-line"
              onClick={onOpenLineSimulator}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/30 text-xs font-medium transition cursor-pointer shadow-sm"
              title="เปิดจำลองการแจ้งเตือนและการตอบกลับ LINE Quick Reply"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">จำลอง LINE Bot</span>
              <span className="sm:hidden">LINE</span>
            </button>

            {/* Scheduler button */}
            <button
              id="header-btn-scheduler"
              onClick={onOpenScheduler}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 transition cursor-pointer"
              title="ตั้งเวลาและเป้าหมายแจ้งเตือน"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
