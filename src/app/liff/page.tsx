'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Flame, ArrowLeft, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LiffPage() {
  const [liffProfile, setLiffProfile] = useState<{ displayName: string; userId: string; pictureUrl?: string } | null>(null);
  const [pagesRead, setPagesRead] = useState(20);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    // Check if running in real LINE LIFF or browser preview
    if (typeof window !== 'undefined' && (window as any).liff) {
      const liff = (window as any).liff;
      liff.init({ liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID || '1650000000-xxxxxxx' })
        .then(() => {
          if (liff.isLoggedIn()) {
            liff.getProfile().then((profile: any) => setLiffProfile(profile));
          }
        })
        .catch((err: any) => console.log('LIFF init fallback:', err));
    } else {
      // Mock LIFF user profile
      setLiffProfile({
        displayName: 'ผู้อ่านผ่าน LINE',
        userId: 'U256aa66d5563c7dd1f7ee2967b9f92d9',
      });
    }
  }, []);

  const handleQuickLog = () => {
    setIsLogged(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setIsLogged(false), 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-emerald-400">LINE LIFF APP</span>
          </div>
          <a href="/" className="text-xs text-neutral-400 hover:text-white flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>หน้าหลัก</span>
          </a>
        </div>

        {/* User Badge */}
        <div className="flex items-center space-x-3 p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
            {liffProfile?.displayName?.charAt(0) || 'L'}
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">{liffProfile?.displayName || 'LINE Reader'}</h3>
            <p className="text-[10px] font-mono text-neutral-500 truncate max-w-[190px]">
              {liffProfile?.userId || 'LIFF User Connected'}
            </p>
          </div>
        </div>

        {/* Current Active Book */}
        <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">กำลังอ่านคืนนี้</span>
            <span className="text-amber-400 flex items-center space-x-1 font-mono font-semibold">
              <Flame className="w-3.5 h-3.5" />
              <span>Streak 7 วัน</span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-950/60 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Atomic Habits (เพราะชีวิตดีได้กว่าที่เป็น)</h4>
              <p className="text-[10px] text-neutral-400">เป้าหมายประจำวัน: 20 หน้า</p>
            </div>
          </div>
        </div>

        {/* Quick Log Form */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-neutral-300">
            บันทึกหน้าที่อ่านสำเร็จวันนี้
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 30].map((pages) => (
              <button
                key={pages}
                type="button"
                onClick={() => setPagesRead(pages)}
                className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  pagesRead === pages
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                +{pages} หน้า
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleQuickLog}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10"
          >
            {isLogged ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกสำเร็จแล้ว!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>บันทึกผลการอ่าน ({pagesRead} หน้า)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
