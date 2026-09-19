import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, Radio, 
  Settings, ArrowLeft, ShieldCheck, Activity, 
  Menu, X, Sparkles, ExternalLink, ChevronRight, MessageSquare 
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onReturnToReader: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onReturnToReader,
  children
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'ภาพรวมระบบ (Overview)', icon: LayoutDashboard },
    { id: 'line_connect', label: 'LINE แจ้งเตือน (Connect)', icon: MessageSquare },
    { id: 'users', label: 'สมาชิก LINE (Users)', icon: Users },
    { id: 'books', label: 'คลังหนังสือ (Book Catalog)', icon: BookOpen },
    { id: 'broadcast', label: 'Broadcast & Webhook', icon: Radio },
    { id: 'settings', label: 'ตั้งค่า & API Health', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sky-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm uppercase tracking-wider text-white">
            TSUNDOKU <span className="text-sky-400 text-xs font-mono">ADMIN</span>
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 z-40 h-screen w-64 bg-neutral-900/95 backdrop-blur-md border-r border-neutral-800 flex flex-col justify-between p-4 transition-transform duration-200
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 px-2 pt-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black tracking-wider text-sm text-white">TSUNDOKU</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-sky-950 text-sky-400 border border-sky-800">
                  BACKOFFICE
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">Admin Control Center</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-neutral-800 text-white font-semibold shadow-sm border border-neutral-700/80'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Return to Reader App */}
        <div className="space-y-3 pt-4 border-t border-neutral-800">
          <button
            onClick={onReturnToReader}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/90 text-neutral-200 text-xs font-semibold transition border border-neutral-700 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่หน้าร้าน (Reader App)</span>
          </button>

          <div className="px-2 text-[10px] text-neutral-500 flex items-center justify-between font-mono">
            <span>v2.5 ADMIN CONSOLE</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>ONLINE</span>
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-neutral-800/80 px-6 flex items-center justify-between bg-neutral-950/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-neutral-500">Backoffice</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-white font-semibold capitalize">
              {navItems.find(i => i.id === currentTab)?.label.split(' ')[0] || currentTab}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Express API: <span className="font-mono text-emerald-400">Port 3000</span></span>
            </div>

            <button
              onClick={onReturnToReader}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs transition cursor-pointer flex items-center space-x-1.5"
            >
              <span>เปิดหน้าร้าน</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </button>
          </div>
        </header>

        {/* Body content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
