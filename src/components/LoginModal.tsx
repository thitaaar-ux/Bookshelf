'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  LogIn, 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  LogOut,
  BookOpen
} from 'lucide-react';
import { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'line' | 'email'>('line');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [customLineId, setCustomLineId] = useState('U9330ea2a3097a7e8ea7b81a9eeb82088');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleLineLogin = (overrideLineId?: string, overrideName?: string) => {
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const lineId = overrideLineId || customLineId || `U${Math.random().toString(36).substring(2, 12)}`;
      const displayName = overrideName || (name.trim() || 'คุณนักอ่าน LINE (Bunnarak)');

      const profile: UserProfile = {
        id: `user-${Date.now()}`,
        name: displayName,
        lineUserId: lineId,
        role: 'member',
        streakDays: 7,
        joinedAt: new Date().toISOString().substring(0, 10),
        pictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      };

      onLogin(profile);
      setIsLoading(false);
      onClose();
    }, 400);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const isAdmin = email.toLowerCase().includes('admin');
      const profile: UserProfile = {
        id: `user-${Date.now()}`,
        name: name.trim() || email.split('@')[0],
        email: email.trim(),
        role: isAdmin ? 'admin' : 'member',
        streakDays: 5,
        joinedAt: new Date().toISOString().substring(0, 10),
        pictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      };

      onLogin(profile);
      setIsLoading(false);
      onClose();
    }, 400);
  };

  const handleQuickDemoLogin = (type: 'reader' | 'admin') => {
    setIsLoading(true);
    setTimeout(() => {
      if (type === 'admin') {
        onLogin({
          id: 'admin-01',
          name: 'ผู้ดูแลระบบ (Admin Bunnarak)',
          email: 'admin@bunnarak.app',
          lineUserId: 'U9330ea2a3097a7e8ea7b81a9eeb82088',
          role: 'admin',
          streakDays: 24,
          joinedAt: '2026-01-15',
          pictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        });
      } else {
        onLogin({
          id: 'reader-demo',
          name: 'นักทลายกองดอง (Reader)',
          email: 'reader@example.com',
          lineUserId: 'U9330ea2a3097a7e8ea7b81a9eeb82088',
          role: 'pro',
          streakDays: 14,
          joinedAt: '2026-03-01',
          pictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        });
      }
      setIsLoading(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="relative w-full max-w-md bg-[#f8f7f4] border-2 border-[#121212] shadow-[8px_8px_0_#121212] overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#121212] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-[#ff4d00] text-white flex items-center justify-center font-bold">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-[#121212]">
                {currentUser ? 'โปรไฟล์ผู้ใช้งาน' : 'เข้าสู่ระบบ Bunnarak'}
              </h2>
              <p className="text-[10px] font-mono text-neutral-500">
                {currentUser ? 'จัดการบัญชีและบันทึกการอ่าน' : 'เชื่อมต่อเพื่อบันทึกและซิงค์ข้อมูลการอ่าน'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-[#121212] hover:bg-[#121212] hover:text-white transition cursor-pointer"
            aria-label="ปิดหน้าต่างเข้าสู่ระบบ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If user is already logged in */}
        {currentUser ? (
          <div className="p-6 space-y-6">
            <div className="p-4 bg-white border-2 border-[#121212] flex items-center gap-4 shadow-[4px_4px_0_#121212]">
              {currentUser.pictureUrl ? (
                <img
                  src={currentUser.pictureUrl}
                  alt={currentUser.name}
                  className="w-14 h-14 border border-[#121212] object-cover"
                />
              ) : (
                <div className="w-14 h-14 bg-[#121212] text-white flex items-center justify-center font-bold text-lg">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm truncate text-[#121212]">{currentUser.name}</h3>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                    currentUser.role === 'admin' 
                      ? 'bg-purple-100 text-purple-900 border-purple-800 font-bold' 
                      : 'bg-emerald-100 text-emerald-900 border-emerald-800'
                  }`}>
                    {currentUser.role === 'admin' ? 'ADMIN' : 'MEMBER'}
                  </span>
                </div>
                {currentUser.email && (
                  <p className="text-xs font-mono text-neutral-600 truncate">{currentUser.email}</p>
                )}
                {currentUser.lineUserId && (
                  <p className="text-[10px] font-mono text-emerald-700 truncate">
                    LINE: {currentUser.lineUserId}
                  </p>
                )}
                <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                  🔥 ต่อเนื่อง {currentUser.streakDays} วัน • สมัครเมื่อ {currentUser.joinedAt}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {currentUser.role === 'admin' && (
                <a
                  href="/backoffice"
                  className="w-full py-2.5 px-4 bg-[#121212] text-[#f8f7f4] font-bold text-xs uppercase flex items-center justify-center gap-2 border-2 border-[#121212] shadow-[3px_3px_0_#ff4d00] hover:translate-x-0.5 hover:translate-y-0.5 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#ff4d00]" />
                  <span>เข้าสู่ระบบหลังบ้าน (Admin Backoffice)</span>
                </a>
              )}

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-white text-rose-600 font-bold text-xs uppercase flex items-center justify-center gap-2 border-2 border-rose-600 shadow-[3px_3px_0_rose-600] hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login Form with Tabs */
          <div className="p-6">
            {/* Tab switchers */}
            <div className="grid grid-cols-2 gap-2 mb-6 border-b-2 border-[#121212] pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('line')}
                className={`py-2 px-3 text-xs font-bold font-mono transition cursor-pointer border-2 border-[#121212] flex items-center justify-center gap-2 ${
                  activeTab === 'line'
                    ? 'bg-[#06c755] text-white shadow-[3px_3px_0_#121212]'
                    : 'bg-white text-[#121212] hover:bg-neutral-100'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                <span>LINE Login</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className={`py-2 px-3 text-xs font-bold font-mono transition cursor-pointer border-2 border-[#121212] flex items-center justify-center gap-2 ${
                  activeTab === 'email'
                    ? 'bg-[#121212] text-[#f8f7f4] shadow-[3px_3px_0_#ff4d00]'
                    : 'bg-white text-[#121212] hover:bg-neutral-100'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>อีเมล / บัญชี</span>
              </button>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-400 text-rose-700 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            {/* Tab 1: LINE Authentication */}
            {activeTab === 'line' && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-neutral-800 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#06c755]" />
                    <span>เข้าสู่ระบบด้วย LINE สะดวกและรวดเร็ว</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    ซิงค์ข้อมูลกองดองและการแจ้งเตือนการอ่านกับบอท <strong className="text-emerald-800">Bunnarak</strong> ได้ทันที
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-700 uppercase mb-1">
                    ชื่อที่ต้องการแสดง (Display Name)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น คุณนักอ่าน (Bunnarak Reader)"
                    className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-700 uppercase mb-1">
                    LINE User ID (บัญชีผู้ใช้)
                  </label>
                  <input
                    type="text"
                    value={customLineId}
                    onChange={(e) => setCustomLineId(e.target.value)}
                    placeholder="U..."
                    className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs font-mono focus:outline-none"
                  />
                  <p className="text-[10px] font-mono text-neutral-500 mt-1">
                    ค่าเริ่มต้นจะใช้ LINE User ID จากการตั้งค่าระบบ
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleLineLogin()}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#06c755] hover:bg-[#05b34c] text-white font-bold text-xs uppercase flex items-center justify-center gap-2 border-2 border-[#121212] shadow-[4px_4px_0_#121212] active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
                >
                  <span className="w-3 h-3 rounded-full bg-white inline-block"></span>
                  <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย LINE'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tab 2: Email Authentication */}
            {activeTab === 'email' && (
              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                {isRegisterMode && (
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-neutral-700 uppercase mb-1">
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ชื่อของคุณ"
                      className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs font-mono focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-700 uppercase mb-1">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="reader@bunnarak.app"
                    className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs font-mono focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-700 uppercase mb-1">
                    รหัสผ่าน
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs font-mono focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#121212] text-[#f8f7f4] font-bold text-xs uppercase flex items-center justify-center gap-2 border-2 border-[#121212] shadow-[4px_4px_0_#ff4d00] hover:translate-x-0.5 hover:translate-y-0.5 transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'กำลังประมวลผล...' : isRegisterMode ? 'สร้างบัญชีผู้ใช้' : 'เข้าสู่ระบบ'}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(!isRegisterMode)}
                    className="text-[11px] font-mono text-neutral-600 underline hover:text-[#121212] cursor-pointer"
                  >
                    {isRegisterMode ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}
                  </button>
                </div>
              </form>
            )}

            {/* Quick Demo Login Presets */}
            <div className="mt-6 pt-4 border-t-2 border-[#121212]">
              <span className="block text-[10px] font-mono uppercase text-neutral-500 font-bold mb-2">
                ⚡ ทดสอบเข้าสู่ระบบแบบด่วน (1-Click Login):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('reader')}
                  className="py-1.5 px-2 bg-white border border-[#121212] text-[11px] font-mono text-left hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0_#121212]"
                >
                  <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">นักอ่านทั่วไป</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  className="py-1.5 px-2 bg-white border border-[#121212] text-[11px] font-mono text-left hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0_#121212]"
                >
                  <ShieldCheck className="w-3 h-3 text-purple-600 shrink-0" />
                  <span className="truncate">แอดมิน (Admin)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
