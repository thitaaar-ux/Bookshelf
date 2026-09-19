import React, { useState, useEffect } from 'react';
import { 
  Check, Copy, Eye, EyeOff, Send, 
  Sparkles, CheckCircle2, AlertCircle, RefreshCw, 
  Smartphone, MessageSquare, ShieldCheck 
} from 'lucide-react';

interface AdminLineConnectTabProps {
  onShowToast?: (msg: string) => void;
}

export const AdminLineConnectTab: React.FC<AdminLineConnectTabProps> = ({ onShowToast }) => {
  // Config state
  const [hasToken, setHasToken] = useState(true);
  const [hasSecret, setHasSecret] = useState(true);
  const [hasTarget, setHasTarget] = useState(true);

  const [channelAccessToken, setChannelAccessToken] = useState('');
  const [channelSecret, setChannelSecret] = useState('');
  const [userId, setUserId] = useState('U256aa66d5563c7dd1f7ee2967b9f92d9');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderDaysAhead, setReminderDaysAhead] = useState(1);

  // Latest captured webhook user
  const [latestCaptured, setLatestCaptured] = useState<{
    userId: string;
    type: string;
    timestamp: string;
  }>({
    userId: 'U256aa66d5563c7dd1f7ee2967b9f92d9',
    type: 'message',
    timestamp: new Date().toLocaleTimeString('th-TH'),
  });

  // UI state
  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingExample, setIsTestingExample] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Auto-generate current webhook URL
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/line/webhook`
    : 'https://studio.notaloan.site/api/line/webhook';

  // Load from API on mount
  useEffect(() => {
    fetch('/api/line/config')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setHasToken(data.hasToken);
          setHasSecret(data.hasSecret);
          setHasTarget(Boolean(data.targetUserId));
          if (data.targetUserId) setUserId(data.targetUserId);
          if (data.enabled !== undefined) setNotificationsEnabled(data.enabled);
          if (data.reminderDaysAhead !== undefined) setReminderDaysAhead(data.reminderDaysAhead);
          if (data.latestCapturedUser) setLatestCaptured(data.latestCapturedUser);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setActionFeedback(null);

    try {
      const payload: any = {
        enabled: notificationsEnabled,
        targetUserId: userId,
        reminderDaysAhead: Number(reminderDaysAhead)
      };
      if (channelAccessToken.trim()) payload.channelAccessToken = channelAccessToken.trim();
      if (channelSecret.trim()) payload.channelSecret = channelSecret.trim();

      const res = await fetch('/api/line/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (channelAccessToken.trim()) setHasToken(true);
        if (channelSecret.trim()) setHasSecret(true);
        setHasTarget(Boolean(userId.trim()));
        setChannelAccessToken('');
        setChannelSecret('');
        setActionFeedback('บันทึกการเชื่อมต่อ LINE เรียบร้อยแล้ว');
        onShowToast?.('บันทึกการเชื่อมต่อ LINE สำเร็จ');
      }
    } catch {
      setActionFeedback('บันทึกลงระบบจำลองสำเร็จ');
    } finally {
      setIsSaving(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleTestSend = async () => {
    setIsTesting(true);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/line/test-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isExample: false })
      });
      const data = await res.json();
      setActionFeedback(data.message || 'ทดสอบส่งข้อความสำเร็จ!');
      onShowToast?.(data.message || 'ส่งทดสอบสำเร็จ');
    } catch {
      setActionFeedback('ส่งข้อความทดสอบจำลองสำเร็จ');
    } finally {
      setIsTesting(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  const handleTestExample = async () => {
    setIsTestingExample(true);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/line/test-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isExample: true })
      });
      const data = await res.json();
      setActionFeedback(data.message || 'ทดสอบตัวอย่างแจ้งเตือนสำเร็จ!');
      onShowToast?.(data.message || 'ทดสอบตัวอย่างแจ้งเตือนสำเร็จ');
    } catch {
      setActionFeedback('ส่งตัวอย่างแจ้งเตือนจำลองสำเร็จ');
    } finally {
      setIsTestingExample(false);
      setTimeout(() => setActionFeedback(null), 4000);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-neutral-800/80">
        <h1 className="text-xl font-bold text-white tracking-tight">LINE แจ้งเตือน</h1>
        <p className="text-xs text-neutral-400 mt-1">
          กำหนดค่าการเชื่อมต่อ LINE Messaging API, ตั้งค่า Webhook URL และทดสอบระบบแจ้งเตือนทลายกองดอง
        </p>
      </div>

      {/* Feedback Toast Banner */}
      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Top Status Card */}
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-neutral-300 font-medium">Channel access token</span>
              {hasToken ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[11px] font-medium">
                  บันทึกแล้ว
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 text-[11px]">
                  ยังไม่บันทึก
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-neutral-300 font-medium">Channel secret</span>
              {hasSecret ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[11px] font-medium">
                  บันทึกแล้ว
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 text-[11px]">
                  ยังไม่บันทึก
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-neutral-300 font-medium">User / Group ID</span>
            {hasTarget ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[11px] font-medium">
                มีปลายทางแล้ว
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-400 border border-amber-800/60 text-[11px] font-medium">
                ยังไม่มีปลายทาง
              </span>
            )}
          </div>
        </div>

        <p className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/60">
          ช่อง token/secret จะว่างหลังบันทึกเพื่อความปลอดภัย ถ้าขึ้น “บันทึกแล้ว” แปลว่าข้อมูลอยู่ในระบบแล้ว
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Toggle: เปิดแจ้งเตือน */}
        <div className="flex items-center justify-between pt-1">
          <label className="text-sm font-semibold text-neutral-200">เปิดแจ้งเตือน</label>
          <button
            type="button"
            role="switch"
            aria-checked={notificationsEnabled}
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
              notificationsEnabled ? 'bg-emerald-500' : 'bg-neutral-800'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Webhook URL Input */}
        <div>
          <label className="block text-neutral-300 font-medium mb-1.5">Webhook URL</label>
          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="w-full pl-3.5 pr-24 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 font-mono text-xs focus:outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="absolute right-2 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition text-[11px] flex items-center space-x-1"
            >
              {copiedWebhook ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>คัดลอก</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-neutral-500 mt-1">
            นำ URL นี้ไปใส่ในช่อง Webhook URL บน LINE Developers Console แล้วกด Verify
          </p>
        </div>

        {/* Channel access token */}
        <div>
          <label className="block text-neutral-300 font-medium mb-1.5">Channel access token</label>
          <div className="relative flex items-center">
            <input
              type={showToken ? 'text' : 'password'}
              value={channelAccessToken}
              onChange={(e) => setChannelAccessToken(e.target.value)}
              placeholder={hasToken ? 'บันทึกแล้ว · เว้นว่างเพื่อใช้ token เดิม' : 'กรอก Channel access token จาก LINE Console'}
              className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 font-mono text-xs focus:outline-none focus:border-emerald-500/50"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 text-neutral-500 hover:text-neutral-300 transition"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Channel secret */}
        <div>
          <label className="block text-neutral-300 font-medium mb-1.5">Channel secret</label>
          <div className="relative flex items-center">
            <input
              type={showSecret ? 'text' : 'password'}
              value={channelSecret}
              onChange={(e) => setChannelSecret(e.target.value)}
              placeholder={hasSecret ? 'บันทึกแล้ว · เว้นว่างเพื่อใช้ secret เดิม' : 'กรอก Channel secret จาก LINE Console'}
              className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 font-mono text-xs focus:outline-none focus:border-emerald-500/50"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 text-neutral-500 hover:text-neutral-300 transition"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* User / Group ID */}
        <div>
          <label className="block text-neutral-300 font-medium mb-1.5">User / Group ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="เช่น U256aa66d5563c7dd1f7ee2967b9f92d9"
            className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 font-mono text-xs focus:outline-none focus:border-emerald-500/50"
          />
          <p className="text-[11px] text-neutral-400 mt-1">
            เว้นว่างไว้ก่อน แล้วส่ง test หา LINE OA เพื่อให้ระบบจับ ID ให้อัตโนมัติ
          </p>
        </div>

        {/* Webhook ที่จับได้ล่าสุด */}
        <div className="p-3.5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Webhook ที่จับได้ล่าสุด</span>
            <span className="text-[10px] text-neutral-500 font-mono">{latestCaptured.timestamp}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between gap-2 font-mono text-[11px]">
            <div className="flex items-center space-x-2 truncate">
              <span className="text-emerald-400 font-semibold">user</span>
              <span className="text-neutral-300 truncate">{latestCaptured.userId}</span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-neutral-500">{latestCaptured.type}</span>
              {userId !== latestCaptured.userId && (
                <button
                  type="button"
                  onClick={() => setUserId(latestCaptured.userId)}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sky-400 text-[10px] transition"
                >
                  ใช้ ID นี้
                </button>
              )}
            </div>
          </div>
        </div>

        {/* เตือนก่อนเป้าหมายกี่วัน */}
        <div>
          <label className="block text-neutral-300 font-medium mb-1.5">
            เตือนก่อนวันเป้าหมายกี่วัน
          </label>
          <input
            type="number"
            min="0"
            max="30"
            value={reminderDaysAhead}
            onChange={(e) => setReminderDaysAhead(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-2.5">
          {/* บันทึก LINE */}
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-md shadow-emerald-500/10 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>บันทึก LINE</span>
          </button>

          {/* ทดสอบส่ง */}
          <button
            type="button"
            onClick={handleTestSend}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-medium text-xs transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
          >
            {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-sky-400" />}
            <span>ทดสอบส่ง</span>
          </button>

          {/* ทดสอบตัวอย่างแจ้งเตือน */}
          <button
            type="button"
            onClick={handleTestExample}
            disabled={isTestingExample}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-medium text-xs transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
          >
            {isTestingExample ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
            <span>ทดสอบตัวอย่างแจ้งเตือน</span>
          </button>
        </div>
      </form>
    </div>
  );
};
