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
  const [activeTab, setActiveTab] = useState<'line' | 'google' | 'email'>('line');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [customLineId, setCustomLineId] = useState('U9330ea2a3097a7e8ea7b81a9eeb82088');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/google');
      const data = await res.json();

      if (data.configured && data.url) {
        // Redirect to live Google OAuth consent screen
        window.location.href = data.url;
        return;
      }

      // If GOOGLE_CLIENT_ID is not yet filled in .env.local, use ready fallback
      const loginRes = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleEmail.trim() || 'reader.google@example.com',
          name: name.trim() || 'คุณนักอ่าน Google',
          demo: true,
        }),
      });
      const loginData = await loginRes.json();
      if (loginData.success && loginData.user) {
        onLogin(loginData.user);
        setIsLoading(false);
        onClose();
      } else {
        setErrorMessage(loginData.error || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ Google');
      setIsLoading(false);
    }
  };

  const handleLineLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/line');
      const data = await res.json();

      if (data.configured && data.url) {
        // Redirect to live LINE OAuth
        window.location.href = data.url;
        return;
      }

      // Fallback fast login
      const loginRes = await fetch('/api/auth/line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'คุณนักอ่าน LINE (Bunnarak)',
          lineId: customLineId || 'U9330ea2a3097a7e8ea7b81a9eeb82088',
        }),
      });
      const loginData = await loginRes.json();
      if (loginData.success && loginData.user) {
        onLogin(loginData.user);
        setIsLoading(false);
        onClose();
      } else {
        setErrorMessage(loginData.error || 'เข้าสู่ระบบด้วย LINE ไม่สำเร็จ');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ LINE');
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    if (password.trim().length < 6) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          name: name.trim(),
          isRegister: isRegisterMode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการตรวจสอบบัญชี');
        setIsLoading(false);
        return;
      }

      // User session with 14 days expiration
      const userWithExpiry = {
        ...data.user,
        token: data.token,
        expiresAt: data.expiresAt,
      };

      onLogin(userWithExpiry);
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (type: 'reader' | 'admin' | 'google') => {
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
      } else if (type === 'google') {
        onLogin({
          id: 'google-demo',
          name: 'Google Reader (ทดสอบ)',
          email: 'reader.google@example.com',
          role: 'member',
          streakDays: 12,
          joinedAt: '2026-03-10',
          pictureUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
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
        className="relative w-full max-w-md bg-[#f8f7f4] border-2 border-[#121212] shadow-[6px_6px_0_#121212] sm:shadow-[8px_8px_0_#121212] max-h-[92vh] overflow-y-auto"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-[#121212] bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-[#ff4d00] text-white flex items-center justify-center font-bold shrink-0">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-tight text-[#121212]">
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
            <div className="grid grid-cols-3 gap-1.5 mb-6 border-b-2 border-[#121212] pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('line')}
                className={`py-2 px-2 text-xs font-bold font-mono transition cursor-pointer border-2 border-[#121212] flex items-center justify-center gap-1.5 ${
                  activeTab === 'line'
                    ? 'bg-[#06c755] text-white shadow-[3px_3px_0_#121212]'
                    : 'bg-white text-[#121212] hover:bg-neutral-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white shrink-0"></span>
                <span className="truncate">LINE</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('google')}
                className={`py-2 px-2 text-xs font-bold font-mono transition cursor-pointer border-2 border-[#121212] flex items-center justify-center gap-1.5 ${
                  activeTab === 'google'
                    ? 'bg-white text-[#121212] shadow-[3px_3px_0_#4285F4] border-[#4285F4]'
                    : 'bg-white text-[#121212] hover:bg-neutral-100'
                }`}
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="truncate">Google</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className={`py-2 px-2 text-xs font-bold font-mono transition cursor-pointer border-2 border-[#121212] flex items-center justify-center gap-1.5 ${
                  activeTab === 'email'
                    ? 'bg-[#121212] text-[#f8f7f4] shadow-[3px_3px_0_#ff4d00]'
                    : 'bg-white text-[#121212] hover:bg-neutral-100'
                }`}
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">อีเมล</span>
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
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-neutral-800 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-[#06c755] shrink-0" />
                    <span>เข้าสู่ระบบด้วยบัญชี LINE</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    คลิกเพื่อซิงค์ข้อมูลกองดองและการแจ้งเตือนกับบอท <strong className="text-emerald-800">Bunnarak</strong> สะดวกรวดเร็ว
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleLineLogin()}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-[#06c755] hover:bg-[#05b34c] text-white font-bold text-xs uppercase flex items-center justify-center gap-2.5 border-2 border-[#121212] shadow-[4px_4px_0_#121212] active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
                >
                  <span className="w-3 h-3 rounded-full bg-white inline-block"></span>
                  <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย LINE'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tab 2: Google Authentication */}
            {activeTab === 'google' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-blue-50 border border-blue-200 text-neutral-800 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-blue-900">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>เข้าสู่ระบบด้วย Google Account</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    คลิกปุ่มด้านล่างเพื่อเลือกบัญชี Google และเข้าใช้งานได้ทันที ไม่ต้องกรอกข้อมูลใดๆ
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-white hover:bg-neutral-50 text-[#121212] font-bold text-xs uppercase flex items-center justify-center gap-2.5 border-2 border-[#121212] shadow-[4px_4px_0_#121212] active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isLoading ? 'กำลังเชื่อมต่อ Google...' : 'เข้าสู่ระบบด้วย Google'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tab 3: Email Authentication */}
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
              <div className="grid grid-cols-3 gap-2">
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
                  onClick={() => handleQuickDemoLogin('google')}
                  className="py-1.5 px-2 bg-white border border-[#121212] text-[11px] font-mono text-left hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0_#121212]"
                >
                  <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="truncate">Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  className="py-1.5 px-2 bg-white border border-[#121212] text-[11px] font-mono text-left hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0_#121212]"
                >
                  <ShieldCheck className="w-3 h-3 text-purple-600 shrink-0" />
                  <span className="truncate">แอดมิน</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
