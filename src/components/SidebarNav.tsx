'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  TrendingUp, 
  Settings,
  Menu,
  X,
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
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      {/* Mobile Top Navigation Header */}
      <header className="md:hidden sticky top-0 z-40 bg-[#f8f7f4] border-b-2 border-[#121212] px-4 py-3 flex items-center justify-between">
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="brand text-sm cursor-pointer tracking-tight"
        >
          I&apos;M YOUR BUNNARAK
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#121212] text-xs font-mono font-bold cursor-pointer"
              title="ดูโปรไฟล์"
            >
              {currentUser.pictureUrl ? (
                <img
                  src={currentUser.pictureUrl}
                  alt={currentUser.name}
                  className="w-4 h-4 object-cover"
                />
              ) : (
                <User className="w-3 h-3" />
              )}
              <span className="max-w-[70px] truncate">{currentUser.name}</span>
            </button>
          ) : (
            <button
              id="mobile-btn-login"
              type="button"
              onClick={onOpenLogin}
              className="py-1 px-2.5 bg-[#121212] text-white text-[11px] font-bold font-mono border border-[#121212] flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="w-3 h-3 text-[#ff4d00]" />
              <span>เข้าสู่ระบบ</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 border border-[#121212] bg-[#f8f7f4] cursor-pointer"
            aria-label="เปิดเมนูการนำทาง"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[53px] z-40 bg-[#f8f7f4] border-b-2 border-[#121212] p-5 shadow-xl space-y-2">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>ภาพรวม</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('library');
              setMobileMenuOpen(false);
            }}
            className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>คลังหนังสือ</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('charts');
              setMobileMenuOpen(false);
            }}
            className={`nav-item ${activeTab === 'charts' ? 'active' : ''}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>ความเร็วการอ่าน</span>
          </button>

          <button
            onClick={() => {
              onOpenScheduler();
              setMobileMenuOpen(false);
            }}
            className="nav-item"
          >
            <Settings className="w-4 h-4" />
            <span>ตั้งเวลาเตือน</span>
          </button>

          <div className="pt-3 mt-2 border-t-2 border-[#121212]">
            {currentUser ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onOpenLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full p-2.5 bg-white border-2 border-[#121212] flex items-center justify-between text-left text-xs font-mono font-bold"
                >
                  <span>บัญชี: {currentUser.name}</span>
                  <span className="text-[10px] text-neutral-500">ดูโปรไฟล์</span>
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 bg-rose-50 text-rose-700 border border-rose-300 text-xs font-mono font-bold"
                  >
                    ออกจากระบบ
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 bg-[#121212] text-white border-2 border-[#121212] flex items-center justify-center gap-2 text-xs font-bold font-mono shadow-[3px_3px_0_#ff4d00]"
              >
                <LogIn className="w-3.5 h-3.5 text-[#ff4d00]" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
