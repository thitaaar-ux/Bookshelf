'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  BookOpen, Crown, Check, Shield, Sparkles, 
  Bell, Flame, ArrowLeft, ArrowRight, Loader2, 
  HelpCircle, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get('status');
  const isSimulated = searchParams.get('simulated');
  const sessionId = searchParams.get('session_id');

  const [isLoading, setIsLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<{
    priceAmountThb: number;
    trialDays: number;
  }>({
    priceAmountThb: 39,
    trialDays: 3,
  });

  useEffect(() => {
    fetch('/api/stripe/config')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setActivePlan({
            priceAmountThb: data.priceAmountThb || 39,
            trialDays: data.trialDays || 3,
          });
        }
      })
      .catch(() => {});

    if (status === 'success') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [status]);

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'U9330ea2a3097a7e8ea7b81a9eeb82088',
          userEmail: 'bunnarak.reader@line.me',
          origin: window.location.origin,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'ไม่สามารถเปิดหน้าชำระเงินได้');
        setIsLoading(false);
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Top Nav */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-8">
        <Link 
          href="/"
          className="flex items-center space-x-2 text-xs text-neutral-400 hover:text-white transition font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าหลัก TSUNDOKU</span>
        </Link>
        <Link
          href="/backoffice"
          className="text-xs text-neutral-500 hover:text-neutral-300 font-mono"
        >
          Admin Backoffice
        </Link>
      </div>

      <div className="max-w-3xl mx-auto w-full space-y-10">

        {/* Success / Canceled Banner */}
        {status === 'success' && (
          <div className="p-5 rounded-3xl bg-emerald-950/60 border border-emerald-500/50 shadow-2xl space-y-2 animate-fadeIn">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>เริ่มต้นสิทธิ์ Tsundoku Pro สำเร็จเรียบร้อย!</span>
            </div>
            <p className="text-xs text-emerald-200">
              คุณได้รับสิทธิ์ทดลองใช้ฟรี {activePlan.trialDays} วันแรก ระบบจะเริ่มคิดค่าบริการ ฿{activePlan.priceAmountThb}/เดือน ในรอบถัดไป คุณสามารถยกเลิกได้ตลอดเวลา
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition"
              >
                <span>เริ่มอ่านหนังสือกันเลย</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === 'canceled' && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 flex items-center space-x-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>การทำรายการถูกยกเลิก คุณยังคงสามารถทดลองเริ่มต้นสิทธิ์ฟรี 3 วันได้ทุกเมื่อ</span>
          </div>
        )}

        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>TSUNDOKU PRO SUBSCRIPTION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            เปลี่ยนกองดองเป็นความรู้ <br />
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              ทดลองใช้ฟรี {activePlan.trialDays} วันแรก
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            เข้าถึงฟีเจอร์พรีเมียมเต็มรูปแบบ หลังจากนั้นเพียง <span className="font-bold text-white">฿{activePlan.priceAmountThb} / เดือน</span> (เฉลี่ยวันละ 1.30 บาท) ไม่มีสัญญาผูกมัด ยกเลิกได้ทุกเวลา
          </p>
        </div>

        {/* Pricing Card */}
        <div className="relative rounded-3xl bg-neutral-900 border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-8 overflow-hidden">
          
          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-neutral-950 text-[10px] font-black uppercase px-6 py-1 tracking-wider rounded-bl-2xl">
            คุ้มค่าที่สุด
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <span>Tsundoku Pro Monthly</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                ผู้ช่วยอ่านหนังสือส่วนตัว &bull; LINE Integration &bull; AI Concierge
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="flex items-baseline space-x-1 sm:justify-end">
                <span className="text-4xl font-black text-white">฿{activePlan.priceAmountThb}</span>
                <span className="text-xs text-neutral-400">/ เดือน</span>
              </div>
              <span className="text-xs font-bold text-amber-400">
                ทดลองฟรี {activePlan.trialDays} วันแรก (0 บาท วันนี้)
              </span>
            </div>
          </div>

          {/* Features Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-white">AI Concierge วิเคราะห์เนื้อหาไม่จำกัด</p>
                <p className="text-[11px] text-neutral-400">สรุปใจความสำคัญ ตั้งคำถามทบทวนความจำ และแนะนำหนังสือเล่มถัดไป</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-white">LINE Smart Push Notification</p>
                <p className="text-[11px] text-neutral-400">แจ้งเตือนสะกิดตามตารางเวลาของคุณ พร้อมปุ่ม Quick Reply สลับเวลาได้</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-white">LINE LIFF Mobile Reader App</p>
                <p className="text-[11px] text-neutral-400">เปิดแอปใน LINE บนมือถือได้ทันที ไม่ต้องโหลดแอพเพิ่ม</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-white">วิเคราะห์ความเร็วการอ่าน &amp; Streak System</p>
                <p className="text-[11px] text-neutral-400">ติดตามสถิติหน้าต่อวัน และรับเหรียญตรา Gamification Badges</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-3 pt-2">
            <button
              id="subscription-page-cta"
              type="button"
              onClick={handleStartTrial}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-sm sm:text-base transition cursor-pointer flex items-center justify-center space-x-2 shadow-xl shadow-amber-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>กำลังเชื่อมต่อไปยัง Stripe Checkout...</span>
                </>
              ) : (
                <>
                  <span>เริ่มทดลองใช้ฟรี {activePlan.trialDays} วัน (หลังจากนั้น ฿{activePlan.priceAmountThb}/เดือน)</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-4 text-xs text-neutral-400 font-mono">
              <span className="flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>ชำระเงินปลอดภัยผ่าน Stripe</span>
              </span>
              <span>&bull;</span>
              <span>ยกเลิกได้ทุกเมื่อ</span>
            </div>
          </div>

        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 text-center">
            คำถามที่พบบ่อย (Frequently Asked Questions)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1">
              <h4 className="font-bold text-white">ช่วงทดลองใช้ฟรี 3 วัน คิดเงินทันทีไหม?</h4>
              <p className="text-neutral-400">
                ไม่คิดเงินครับ! ใน 3 วันแรกคุณสามารถใช้งานฟีเจอร์พรีเมียมได้ฟรี 100% และระบบจะเริ่มตัดเงิน 39 บาทในวันที่ 4
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1">
              <h4 className="font-bold text-white">สามารถยกเลิกก่อนครบ 3 วันได้หรือไม่?</h4>
              <p className="text-neutral-400">
                ยกเลิกได้ตลอดเวลาครับ หากยกเลิกก่อนครบ 3 วัน จะไม่มีการเรียกเก็บเงินใดๆ ทั้งสิ้น
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1">
              <h4 className="font-bold text-white">รองรับช่องทางชำระเงินใดบ้าง?</h4>
              <p className="text-neutral-400">
                รองรับบัตรเครดิต/เดบิต (Visa, Mastercard, JCB) และพร้อมเพย์ (PromptPay) ผ่านระบบ Stripe
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1">
              <h4 className="font-bold text-white">ใช้งานกับบัญชี LINE ได้อย่างไร?</h4>
              <p className="text-neutral-400">
                หลังจากสมัครสมาชิก สิทธิ์ Pro จะถูกผูกกับ LINE User ID ของคุณโดยอัตโนมัติ เพื่อรับการแจ้งเตือนและการคุยกับ AI ผ่าน LINE
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-neutral-600 pt-12 font-mono">
        TSUNDOKU KILLER &bull; STRIPE BILLING INFRASTRUCTURE &bull; 2026
      </footer>

    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 text-xs">กำลังโหลด...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
}
