import React from 'react';
import { BookOpen, Bell, Award, Cpu, Sparkles, Calendar, Zap, MessageSquare } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'library' | 'architecture';
  setActiveTab: (tab: 'dashboard' | 'library' | 'architecture') => void;
  onOpenLineSimulator: () => void;
  onOpenConcierge: () => void;
  onOpenScheduler: () => void;
  onOpenBadges: () => void;
  lineConnected: boolean;
  clearanceRate: number;
  streakCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenLineSimulator,
  onOpenConcierge,
  onOpenScheduler,
  onOpenBadges,
  lineConnected,
  clearanceRate,
  streakCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#fdfcf8]/95 backdrop-blur-md border-b-2 border-[#1c1c1c] px-4 sm:px-8 lg:px-12 py-3.5 sm:py-4 transition-all">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Brand & Protocol Indicator */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div>
            <div className="flex items-center space-x-2">
              <span className="meta text-[#ff4d00] flex items-center space-x-1 font-bold">
                <span className="inline-block w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse" />
                <span>Protocol Active</span>
              </span>
              <span className="meta text-[#1c1c1c]/40 hidden sm:inline">•</span>
              <span className="meta text-[#1c1c1c]/60 hidden sm:inline">LINE Webhook v2.5</span>
            </div>
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="text-xl sm:text-2xl font-black tracking-tight text-[#1c1c1c] cursor-pointer hover:opacity-85 transition leading-none mt-0.5"
            >
              TSUNDOKU KILLER
            </div>
          </div>

          {/* Mobile quick simulator trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenLineSimulator}
              className="bg-[#1c1c1c] hover:bg-[#ff4d00] text-[#fdfcf8] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition"
            >
              LINE
            </button>
            <button
              onClick={onOpenConcierge}
              className="border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#fdfcf8] px-2.5 py-1.5 text-[11px] font-bold transition"
            >
              AI
            </button>
          </div>
        </div>

        {/* Center: Nav Pills */}
        <nav className="nav-pills flex items-center gap-1 bg-[#f4f2ea] p-1 rounded-full border border-[#e8e6df] overflow-x-auto max-w-full">
          <button
            id="nav-btn-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white text-[#1c1c1c] shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                : 'text-[#1c1c1c]/65 hover:text-[#1c1c1c]'
            }`}
          >
            DASHBOARD
          </button>
          <button
            id="nav-btn-library"
            onClick={() => setActiveTab('library')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'library'
                ? 'bg-white text-[#1c1c1c] shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                : 'text-[#1c1c1c]/65 hover:text-[#1c1c1c]'
            }`}
          >
            LIBRARY / BACKLOG
          </button>
          <button
            id="nav-btn-architecture"
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-white text-[#1c1c1c] shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                : 'text-[#1c1c1c]/65 hover:text-[#1c1c1c]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#1c1c1c]" />
            <span>ARCHITECTURE</span>
          </button>
        </nav>

        {/* Right: Actions & Badges */}
        <div className="hidden md:flex items-center space-x-2.5">
          {/* Streak indicator */}
          <button
            onClick={onOpenBadges}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-[#f4f2ea] border border-[#e8e6df] hover:border-[#1c1c1c] text-xs font-bold text-[#1c1c1c] transition"
            title="สถิติ Streak และเหรียญตรา"
          >
            <span className="text-[#ff4d00]">🔥</span>
            <span className="font-mono text-[#ff4d00] font-bold">{String(streakCount).padStart(2, '0')} DAYS</span>
          </button>

          {/* Scheduler Button */}
          <button
            onClick={onOpenScheduler}
            className="p-2 rounded-full border border-[#e8e6df] bg-[#f4f2ea] hover:border-[#1c1c1c] text-[#1c1c1c] transition cursor-pointer"
            title="ตั้งเวลาแจ้งเตือน Smart Scheduler"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* Badges / Stats Button */}
          <button
            onClick={onOpenBadges}
            className="p-2 rounded-full border border-[#e8e6df] bg-[#f4f2ea] hover:border-[#1c1c1c] text-[#1c1c1c] transition cursor-pointer"
            title="Gamification Badges"
          >
            <Award className="w-4 h-4" />
          </button>

          {/* SIMULATE LINE Button */}
          <button
            id="header-btn-line"
            onClick={onOpenLineSimulator}
            className="bg-[#1c1c1c] text-[#fdfcf8] hover:bg-[#ff4d00] border-none px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 shadow-sm flex items-center space-x-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d00] animate-ping" />
            <span>SIMULATE LINE</span>
          </button>

          {/* AI CONCIERGE Button */}
          <button
            id="header-btn-concierge"
            onClick={onOpenConcierge}
            className="bg-transparent text-[#1c1c1c] border border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#fdfcf8] px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI CONCIERGE</span>
          </button>
        </div>

      </div>
    </header>
  );
};
