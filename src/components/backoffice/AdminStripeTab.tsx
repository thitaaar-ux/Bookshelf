'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Key, Copy, Check, Eye, EyeOff, 
  ShieldCheck, RefreshCw, Sparkles, Users, DollarSign, 
  Calendar, CheckCircle2, AlertCircle, ExternalLink, Zap
} from 'lucide-react';

interface AdminStripeTabProps {
  onShowToast?: (msg: string) => void;
}

export const AdminStripeTab: React.FC<AdminStripeTabProps> = ({ onShowToast }) => {
  const [stats, setStats] = useState({
    totalSubscribers: 2,
    activeSubscribersCount: 1,
    trialingCount: 1,
    estimatedMonthlyRevenueThb: 39,
  });

  const [priceAmountThb, setPriceAmountThb] = useState(39);
  const [trialDays, setTrialDays] = useState(3);
  const [hasSecret, setHasSecret] = useState(false);
  const [hasPublishable, setHasPublishable] = useState(false);
  const [hasWebhookSecret, setHasWebhookSecret] = useState(false);

  const [secretKey, setSecretKey] = useState('');
  const [publishableKey, setPublishableKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  const [showSecret, setShowSecret] = useState(false);
  const [showPublishable, setShowPublishable] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const [subscribersList, setSubscribersList] = useState<any[]>([]);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/stripe/webhook`
    : 'https://studio.notaloan.site/api/stripe/webhook';

  const loadData = () => {
    fetch('/api/stripe/config')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setHasSecret(data.hasSecret);
          setHasPublishable(data.hasPublishable);
          setHasWebhookSecret(data.hasWebhookSecret);
          if (data.priceAmountThb) setPriceAmountThb(data.priceAmountThb);
          if (data.trialDays) setTrialDays(data.trialDays);
          if (data.stats) setStats(data.stats);
          if (data.subscriptionsList) setSubscribersList(data.subscriptionsList);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
    onShowToast?.('คัดลอก Stripe Webhook URL เรียบร้อย');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const payload: any = {
        priceAmountThb: Number(priceAmountThb),
        trialDays: Number(trialDays),
      };
      if (secretKey.trim()) payload.secretKey = secretKey.trim();
      if (publishableKey.trim()) payload.publishableKey = publishableKey.trim();
      if (webhookSecret.trim()) payload.webhookSecret = webhookSecret.trim();

      const res = await fetch('/api/stripe/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFeedback('บันทึกการตั้งค่า Stripe สำเร็จเรียบร้อย');
        onShowToast?.('บันทึกการตั้งค่า Stripe สำเร็จ');
        setSecretKey('');
        setPublishableKey('');
        setWebhookSecret('');
        loadData();
      } else {
        setFeedback('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch {
      setFeedback('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <span>ระบบสมาชิก &amp; จัดการบิล Stripe (Subscription &amp; Billing)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            ตั้งค่าโมเดลทดลองใช้ฟรี {trialDays} วันแรก หลังจากนั้น {priceAmountThb} บาท/เดือน พร้อมจัดการกุญแจ Stripe API
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {hasSecret ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>STRIPE LIVE/TEST MODE</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>SIMULATED DEMO MODE</span>
            </span>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>สมาชิก Pro ทั้งหมด</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalSubscribers} คน</p>
          <p className="text-[10px] text-neutral-500">รวมผู้ทดลองใช้และ Active</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>ทดลองใช้ฟรี 3 วัน (Trial)</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300">{stats.trialingCount} คน</p>
          <p className="text-[10px] text-amber-400/80 font-mono">0 บาท วันนี้ &rarr; รอตัดเงินวันที่ 4</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>สมาชิกชำระเงิน (Active)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{stats.activeSubscribersCount} คน</p>
          <p className="text-[10px] text-neutral-500">ตัดรอบบิลเรียบร้อย</p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>ประมาณการรายได้ MRR</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">฿{stats.estimatedMonthlyRevenueThb}</p>
          <p className="text-[10px] text-neutral-500">คำนวณจาก ฿{priceAmountThb}/เดือน/คน</p>
        </div>
      </div>

      {/* Grid: Config Form & Webhook Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Stripe Configuration Form */}
        <div className="p-5 rounded-3xl bg-neutral-900/70 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>การตั้งค่าแพ็กเกจ &amp; Stripe API Keys</span>
            </h3>
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            
            {/* Pricing Config */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  ราคาต่อเดือน (บาท)
                </label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={priceAmountThb}
                  onChange={(e) => setPriceAmountThb(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  จำนวนวันทดลองฟรี (วัน)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={trialDays}
                  onChange={(e) => setTrialDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Secret Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-neutral-300 font-semibold">
                  Stripe Secret Key (sk_test_... หรือ sk_live_...)
                </label>
                <span className={`text-[10px] font-mono ${hasSecret ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  {hasSecret ? '✓ ติดตั้งแล้ว' : 'ยังไม่ได้ระบุ'}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder={hasSecret ? '••••••••••••••••••••••••••••••••' : 'sk_test_51...'}
                  className="w-full px-3 py-2 pr-10 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white"
                >
                  {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Publishable Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-neutral-300 font-semibold">
                  Stripe Publishable Key (pk_test_... หรือ pk_live_...)
                </label>
                <span className={`text-[10px] font-mono ${hasPublishable ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  {hasPublishable ? '✓ ติดตั้งแล้ว' : 'ยังไม่ได้ระบุ'}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPublishable ? 'text' : 'password'}
                  value={publishableKey}
                  onChange={(e) => setPublishableKey(e.target.value)}
                  placeholder={hasPublishable ? '••••••••••••••••••••••••••••••••' : 'pk_test_51...'}
                  className="w-full px-3 py-2 pr-10 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPublishable(!showPublishable)}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white"
                >
                  {showPublishable ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Webhook Secret */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-neutral-300 font-semibold">
                  Stripe Webhook Secret (whsec_...)
                </label>
                <span className={`text-[10px] font-mono ${hasWebhookSecret ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  {hasWebhookSecret ? '✓ ติดตั้งแล้ว' : 'ยังไม่ได้ระบุ'}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showWebhookSecret ? 'text' : 'password'}
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder={hasWebhookSecret ? '••••••••••••••••••••••••••••••••' : 'whsec_...'}
                  className="w-full px-3 py-2 pr-10 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white"
                >
                  {showWebhookSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {feedback && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า Stripe'}</span>
            </button>
          </form>
        </div>

        {/* Webhook & Setup Instructions */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-neutral-900/70 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Stripe Webhook URL สำหรับเชื่อมต่อ Dashboard</span>
            </h3>

            <p className="text-xs text-neutral-400 leading-relaxed">
              นำ URL ด้านล่างไปกรอกใน <strong>Stripe Dashboard &rarr; Developers &rarr; Webhooks</strong> เพื่อให้ระบบทราบสถานะเมื่อผู้ใช้ชำระเงินหรือเริ่มต้นทดลองใช้ฟรีสำเร็จ
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-300 font-mono text-xs select-all focus:outline-none"
              />
              <button
                onClick={handleCopyWebhook}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-neutral-800 space-y-2 text-xs">
              <h4 className="font-bold text-neutral-300">Events สำคัญที่ระบบรองรับอัตโนมัติ:</h4>
              <ul className="space-y-1 font-mono text-[11px] text-neutral-400">
                <li className="flex items-center space-x-1.5 text-emerald-400">
                  <Check className="w-3 h-3" />
                  <span>checkout.session.completed (เริ่มใช้ฟรี 3 วัน)</span>
                </li>
                <li className="flex items-center space-x-1.5 text-emerald-400">
                  <Check className="w-3 h-3" />
                  <span>customer.subscription.created / updated (Active)</span>
                </li>
                <li className="flex items-center space-x-1.5 text-emerald-400">
                  <Check className="w-3 h-3" />
                  <span>customer.subscription.deleted (ยกเลิก)</span>
                </li>
                <li className="flex items-center space-x-1.5 text-emerald-400">
                  <Check className="w-3 h-3" />
                  <span>invoice.payment_succeeded (ตัดเงิน 39 บาทสำเร็จ)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* Subscribers Table */}
      <div className="p-5 rounded-3xl bg-neutral-900/70 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-sky-400" />
            <span>รายชื่อสมาชิกและสถานะการต่ออายุ (Subscribers List)</span>
          </h3>
          <span className="text-xs font-mono text-neutral-500">
            {subscribersList.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-3 font-semibold">User ID / Email</th>
                <th className="pb-3 font-semibold">แพ็กเกจ</th>
                <th className="pb-3 font-semibold">สถานะ</th>
                <th className="pb-3 font-semibold">สิ้นสุดช่วงทดลองใช้ฟรี</th>
                <th className="pb-3 font-semibold">วันตัดรอบบิล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {subscribersList.map((sub) => (
                <tr key={sub.id} className="hover:bg-neutral-800/30">
                  <td className="py-3">
                    <p className="font-bold text-white font-mono">{sub.userId}</p>
                    <p className="text-[11px] text-neutral-400">{sub.userEmail || '-'}</p>
                  </td>
                  <td className="py-3 text-neutral-300">
                    {sub.planName}
                  </td>
                  <td className="py-3">
                    {sub.status === 'trialing' ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                        ทดลองฟรี 3 วัน (Trial)
                      </span>
                    ) : sub.status === 'active' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                        Active (39 บ./ด.)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-[10px]">
                        {sub.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 font-mono text-neutral-400">
                    {sub.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString('th-TH') : '-'}
                  </td>
                  <td className="py-3 font-mono text-neutral-400">
                    {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('th-TH') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
