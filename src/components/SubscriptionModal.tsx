'use client';

import React, { useState } from 'react';
import { 
  X, Check, Sparkles, Crown, Shield, 
  Flame, Bell, BookOpen, ArrowRight, Loader2, 
  HelpCircle, Zap, Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userEmail?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  userId = 'U9330ea2a3097a7e8ea7b81a9eeb82088',
  userEmail = 'bunnarak.reader@line.me',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartTrial = async () => {
    setIsLoading(true);
    setSuccessNotice(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userEmail,
          origin: window.location.origin,
        }),
      });

      const data = await res.json();

      if (data.url) {
        if (data.mode === 'stripe_real') {
          // Redirect to real Stripe Hosted Checkout
          window.location.href = data.url;
        } else {
          // Interactive Demo simulation mode
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
          setSuccessNotice('🎉 เริ่มต้นสิทธิ์ทดลองใช้ฟรี 3 วันสำเร็จเรียบร้อย! ระบบจะเริ่มคิดค่าบริการ 39 บาท/เดือน หลังครบ 3 วัน');
          setTimeout(() => {
            setIsLoading(false);
          }, 1500);
        }
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Stripe');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ชำระเงินได้');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-6 text-neutral-100 overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Badges */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>TSUNDOKU PRO PLAN</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            ทลายกองดองให้จบเล่ม <br />
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              ทดลองใช้ฟรี 3 วันแรก
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
            หลังจากช่วงทดลองใช้ เพียง <span className="font-bold text-white">39 บาท/เดือน</span> (เฉลี่ยวันละ 1.30 บาท) ยกเลิกได้ตลอดเวลา ไม่มีข้อผูกมัด
          </p>
        </div>

        {/* Pricing Highlight Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/30 to-neutral-950 border border-amber-500/30 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">แพ็กเกจรายเดือน</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ฟรี 3 วันแรก
              </span>
            </div>
            <p className="text-xs text-neutral-400">เริ่มคิดค่าบริการในวันที่ 4</p>
          </div>
          <div className="text-right">
            <div className="flex items-baseline justify-end space-x-1">
              <span className="text-3xl font-black text-white">฿39</span>
              <span className="text-xs text-neutral-400">/ เดือน</span>
            </div>
            <p className="text-[10px] text-amber-400/90 font-mono">0 บาท วันนี้</p>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            สิทธิพิเศษระดับ Tsundoku Pro:
          </h4>
          <div className="grid grid-cols-1 gap-2.5 text-xs">
            <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-white">AI Reading Concierge ไม่จำกัด</p>
                <p className="text-[11px] text-neutral-400">สนทนา สรุปสาระสำคัญ และถามตอบข้อคิดจากหนังสือได้ทุกเล่ม</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-white">LINE Smart Push &amp; Quick Reply</p>
                <p className="text-[11px] text-neutral-400">แจ้งเตือนสะกิดตามตาราง พร้อมปุ่มกดเริ่มอ่านหรือเลื่อนเวลาใน LINE</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-white">วิเคราะห์ความคืบหน้า &amp; ปลดล็อก Badge พิเศษ</p>
                <p className="text-[11px] text-neutral-400">คำนวณวันจบเล่มล่วงหน้า และเก็บประวัติ Streak ต่อเนื่อง</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Notice if activated in demo mode */}
        {successNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 flex items-start space-x-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{successNotice}</p>
          </div>
        )}

        {/* CTA Button */}
        <div className="space-y-2.5 pt-1">
          <button
            id="modal-btn-start-trial"
            type="button"
            onClick={handleStartTrial}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-sm transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 shadow-xl shadow-amber-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                <span>กำลังเตรียมระบบชำระเงิน Stripe...</span>
              </>
            ) : (
              <>
                <span>เริ่มทดลองใช้ฟรี 3 วัน (จากนั้น 39 บ./เดือน)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center space-x-4 text-[10px] text-neutral-400 font-mono">
            <span className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Stripe 256-bit Encrypted</span>
            </span>
            <span>&bull;</span>
            <span>ยกเลิกได้ตลอดเวลา</span>
            <span>&bull;</span>
            <span>ไม่มีค่าธรรมเนียมแอบแฝง</span>
          </div>
        </div>

      </div>
    </div>
  );
};
