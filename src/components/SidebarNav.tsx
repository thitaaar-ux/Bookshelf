'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  TrendingUp, 
  MessageSquare, 
  Settings,
  Menu,
  X
} from 'lucide-react';

interface SidebarNavProps {
  activeTab: 'dashboard' | 'library' | 'charts';
  setActiveTab: (tab: 'dashboard' | 'library' | 'charts') => void;
  onOpenLineSimulator: () => void;
  onOpenScheduler: () => void;
  onOpenAddBook?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenLineSimulator,
  onOpenScheduler,
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
          <nav className="nav-links">
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
              id="nav-item-sync-bot"
              onClick={onOpenLineSimulator}
              className="nav-item"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>บอท LINE</span>
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

        {/* Bottom Bot Status Indicator */}
        <div className="pt-6 border-t border-[#121212]/10 space-y-2">
          <div 
            onClick={onOpenLineSimulator}
            className="cursor-pointer group flex items-center justify-between"
            title="คลิกเพื่อเปิด LINE bot simulator"
          >
            <div className="label m-0 flex items-center gap-2 text-[#121212]/70 group-hover:text-[#121212]">
              <span className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse inline-block" />
              <span className="font-mono">สถานะบอท: ออนไลน์</span>
            </div>
            <span className="text-[10px] font-mono text-[#ff4d00] underline opacity-80 group-hover:opacity-100">ทดสอบ</span>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation Header */}
      <header className="md:hidden sticky top-0 z-40 bg-[#f8f7f4] border-b-2 border-[#121212] px-6 py-4 flex items-center justify-between">
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="brand text-base cursor-pointer tracking-tight"
        >
          I&apos;M YOUR BUNNARAK
        </div>

        <div className="flex items-center gap-3">
          <div className="label m-0 text-[10px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse inline-block" />
            <span>ออนไลน์</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-[#121212] bg-[#f8f7f4] cursor-pointer"
            aria-label="เปิดเมนูการนำทาง"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[61px] z-40 bg-[#f8f7f4] border-b-2 border-[#121212] p-6 shadow-xl space-y-2">
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
              onOpenLineSimulator();
              setMobileMenuOpen(false);
            }}
            className="nav-item"
          >
            <MessageSquare className="w-4 h-4" />
            <span>บอท LINE</span>
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
        </div>
      )}
    </>
  );
};
