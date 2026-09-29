'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  TrendingUp, 
  Settings,
  LogIn,
  User,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarNavProps {
  activeTab: 'dashboard' | 'library' | 'charts';
  setActiveTab: (tab: 'dashboard' | 'library' | 'charts') => void;
  onOpenScheduler: () => void;
  onOpenAddBook?: () => void;
  currentUser?: UserProfile | null;
  onOpenLogin: () => void;
  onLogout?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenScheduler,
  onOpenAddBook,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  return (
    <>
      {/* Desktop Fixed Aside Navigation - Variation 2 */}
      <aside 
        id="desktop-sidebar-nav"
        className="hidden md:flex w-[280px] shrink-0 border-r-2 border-[#121212] bg-[#f8f7f4] h-screen p-8 flex-col justify-between select-none fixed top-0 left-0 z-30 overflow-y-auto"
        style={{ height: '100vh', borderRight: '2px solid #121212' }}
      >
        <div>
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="brand cursor-pointer select-none leading-none mb-8"
            title="I'm your Bunnarak Home"
          >
            I&apos;M YOUR<br />BUNNARAK
          </div>

          {/* Navigation Links */}
          <nav className="nav-links space-y-1">
            <button
              id="nav-item-overview"
              onClick={() => setActiveTab('dashboard')}
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>ภาพรวม</span>
            </button>

            <button
              id="nav-item-archive"
              onClick={() => setActiveTab('library')}
              className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>คลังหนังสือ</span>
            </button>

            <button
              id="nav-item-velocity"
              onClick={() => setActiveTab('charts')}
              className={`nav-item ${activeTab === 'charts' ? 'active' : ''}`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>ความเร็วการอ่าน</span>
            </button>

            <button
              id="nav-item-cadence"
              onClick={onOpenScheduler}
              className="nav-item"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>ตั้งเวลาเตือน</span>
            </button>
          </nav>
        </div>

        {/* User Account / Login & Status Section */}
        <div className="pt-6 border-t-2 border-[#121212] space-y-3">
          {currentUser ? (
            <div className="p-3 bg-white border-2 border-[#121212] shadow-[3px_3px_0_#121212] space-y-2">
              <div 
                onClick={onOpenLogin}
                className="flex items-center gap-2.5 cursor-pointer group"
                title="คลิกเพื่อดูโปรไฟล์"
              >
                {currentUser.pictureUrl ? (
                  <img
                    src={currentUser.pictureUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 border border-[#121212] object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 bg-[#121212] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs truncate group-hover:text-[#ff4d00] transition">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 truncate">
                    {currentUser.role === 'admin' ? '🛡️ ผู้ดูแลระบบ' : '📚 สมาชิกนักอ่าน'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-neutral-200 text-[10px] font-mono">
                <button
                  onClick={onOpenLogin}
                  className="text-neutral-600 hover:text-[#121212] underline cursor-pointer"
                >
                  โปรไฟล์
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-2.5 h-2.5" />
                    <span>ออกจากระบบ</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              id="sidebar-btn-login"
              type="button"
              onClick={onOpenLogin}
              className="w-full py-2.5 px-3 bg-[#121212] hover:bg-neutral-800 text-[#f8f7f4] border-2 border-[#121212] shadow-[3px_3px_0_#ff4d00] flex items-center justify-center gap-2 text-xs font-bold uppercase transition cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              <LogIn className="w-3.5 h-3.5 text-[#ff4d00]" />
              <span>เข้าสู่ระบบ</span>
            </button>
          )}

          {/* Bot & System Status Indicator */}
          <div className="flex items-center justify-between px-1">
            <div className="label m-0 flex items-center gap-2 text-[#121212]/70 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="font-mono">LINE Bot: ออนไลน์</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Fixed Bottom Navigation Bar - Ergonomic Touch Control */}
      <nav 
        id="mobile-bottom-nav" 
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#f8f7f4] border-t-2 border-[#121212] px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      >
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-none transition ${
            activeTab === 'dashboard'
              ? 'bg-[#121212] text-[#f8f7f4] font-bold'
              : 'text-[#121212] hover:bg-[#121212]/5'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-mono leading-none tracking-tight">ภาพรวม</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-none transition ${
            activeTab === 'library'
              ? 'bg-[#121212] text-[#f8f7f4] font-bold'
              : 'text-[#121212] hover:bg-[#121212]/5'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-mono leading-none tracking-tight">คลังหนังสือ</span>
        </button>

        <button
          onClick={onOpenScheduler}
          className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-none text-[#121212] hover:bg-[#121212]/5 transition"
        >
          <Settings className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] font-mono leading-none tracking-tight">ตั้งเตือน</span>
        </button>
      </nav>
    </>
  );
};
