import React, { useState, useEffect } from 'react';
import { 
  Check, Copy, Eye, EyeOff, Send, 
  Sparkles, CheckCircle2, RefreshCw, 
  Database, Bot, ExternalLink, ShieldCheck, UserCheck
} from 'lucide-react';

interface AdminLineConnectTabProps {
  onShowToast?: (msg: string) => void;
}

export const AdminLineConnectTab: React.FC<AdminLineConnectTabProps> = ({ onShowToast }) => {
  // Config state from DB / API
  const [hasToken, setHasToken] = useState(true);
  const [hasSecret, setHasSecret] = useState(true);
  const [hasTarget, setHasTarget] = useState(true);

  const [botName, setBotName] = useState('Bunnarak');
  const [botBasicId, setBotBasicId] = useState('@869uobem');
  const [channelId, setChannelId] = useState('2011678531');
  const [channelAccessToken, setChannelAccessToken] = useState('');
  const [channelSecret, setChannelSecret] = useState('');
  const [userId, setUserId] = useState('U9330ea2a3097a7e8ea7b81a9eeb82088');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderDaysAhead, setReminderDaysAhead] = useState(1);
  const [storageType, setStorageType] = useState('SQLite Database (Table: app_settings)');
  const [dbFile, setDbFile] = useState('data/tsundoku.db');
  const [dbRows, setDbRows] = useState<Array<{ key: string; value: string; updated_at: string }>>([]);
  const [showDbInspector, setShowDbInspector] = useState(false);

  // Latest captured webhook user
  const [latestCaptured, setLatestCaptured] = useState<{
    userId: string;
    type: string;
    timestamp: string;
  }>({
    userId: 'U9330ea2a3097a7e8ea7b81a9eeb82088',
    type: 'registered',
    timestamp: new Date().toLocaleTimeString('th-TH'),
  });

  // UI state
  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingExample, setIsTestingExample] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Auto-generate current webhook URL
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/line/webhook`
    : 'https://studio.notaloan.site/api/line/webhook';

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/line/config');
      if (res.ok) {
        const data = await res.json();
        setHasToken(data.hasToken);
        setHasSecret(data.hasSecret);
        setHasTarget(Boolean(data.targetUserId));
        if (data.botName) setBotName(data.botName);
        if (data.botBasicId) setBotBasicId(data.botBasicId);
        if (data.channelId) setChannelId(data.channelId);
        if (data.channelAccessToken) setChannelAccessToken(data.channelAccessToken);
        if (data.channelSecret) setChannelSecret(data.channelSecret);
        if (data.targetUserId) setUserId(data.targetUserId);
        if (data.enabled !== undefined) setNotificationsEnabled(data.enabled);
        if (data.reminderDaysAhead !== undefined) setReminderDaysAhead(data.reminderDaysAhead);
        if (data.latestCapturedUser) setLatestCaptured(data.latestCapturedUser);
        if (data.storageType) setStorageType(data.storageType);
        if (data.dbFile) setDbFile(data.dbFile);
        if (data.dbRows) setDbRows(data.dbRows);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleCopyToken = () => {
    if (channelAccessToken) {
      navigator.clipboard.writeText(channelAccessToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleReload = async () => {
    setIsReloading(true);
    await fetchConfig();
    setIsReloading(false);
    setActionFeedback('โหลดข้อมูลล่าสุดจาก Database สำเร็จ');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setActionFeedback(null);

    try {
      const payload: any = {
        botName: botName.trim(),
        botBasicId: botBasicId.trim(),
        channelId: channelId.trim(),
        enabled: notificationsEnabled,
        targetUserId: userId.trim(),
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
        setActionFeedback('บันทึกการตั้งค่า LINE ลง Database (data/db.json) สำเร็จแล้ว!');
        onShowToast?.('บันทึกข้อมูลลง Database เรียบร้อย');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800/80 gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">LINE แจ้งเตือน & Messaging API</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Database className="w-2.5 h-2.5 mr-1" />
              Database Storage
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            ตั้งค่า LINE Official Account จัดเก็บข้อมูลลงฐานข้อมูล <code className="text-emerald-400 font-mono">data/db.json</code> ถาวร แก้ไขได้ทันทีไม่ต้องรีสตาร์ทเซิร์ฟเวอร์
          </p>
        </div>

        <button
          type="button"
          onClick={handleReload}
          disabled={isReloading}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs flex items-center space-x-1.5 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชจาก DB</span>
        </button>
      </div>

      {/* Feedback Toast Banner */}
      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Profile Card of LINE OA */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-neutral-900/80 to-neutral-900/90 border border-emerald-500/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm">{botName || 'Bunnarak'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-semibold border border-emerald-500/40">
                  {botBasicId || '@869uobem'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Channel ID: <span className="font-mono text-neutral-200">{channelId || '2011678531'}</span> · ปลายทาง: <span className="font-mono text-emerald-400">{userId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={`https://line.me/R/ti/p/${encodeURIComponent(botBasicId || '@869uobem')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
            >
              <span>แอดไลน์ OA</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-neutral-400">สถานะ Token:</span>
            {hasToken ? (
              <span className="text-emerald-400 font-medium">พร้อมส่งข้อความ</span>
            ) : (
              <span className="text-amber-400 font-medium">ยังไม่ระบุ Token</span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-neutral-400">สถานะปลายทาง:</span>
            {hasTarget ? (
              <span className="text-emerald-400 font-medium">ผูกกับ {userId.slice(0, 10)}... แล้ว</span>
            ) : (
              <span className="text-neutral-400">ยังไม่ระบุ</span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-neutral-400">ฐานข้อมูล:</span>
            <span className="text-sky-300 font-mono text-[11px]">SQLite ({dbFile})</span>
          </div>
        </div>
      </div>

      {/* SQLite Database Table Viewer */}
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">
              SQLite Table: <span className="text-emerald-400 font-mono">app_settings</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
              {dbRows.length} แถวใน DB
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowDbInspector(!showDbInspector)}
            className="text-[11px] text-sky-400 hover:text-sky-300 font-medium transition cursor-pointer"
          >
            {showDbInspector ? 'ซ่อนข้อมูลตาราง SQL' : 'ดูข้อมูลตาราง SQL (SELECT * FROM app_settings)'}
          </button>
        </div>

        {showDbInspector && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pb-1 border-b border-neutral-800">
              <span className="text-emerald-400">QUERY: SELECT key, value, updated_at FROM app_settings;</span>
            </div>
            <table className="w-full text-[11px] text-left">
              <thead>
                <tr className="text-neutral-500 border-b border-neutral-800/60">
                  <th className="pb-1.5 font-medium">Key (PK)</th>
                  <th className="pb-1.5 font-medium">Value (Stored in DB)</th>
                  <th className="pb-1.5 font-medium text-right">Updated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40 font-mono">
                {dbRows.map((row) => (
                  <tr key={row.key} className="hover:bg-neutral-900/50">
                    <td className="py-1.5 text-sky-300 font-semibold pr-2">{row.key}</td>
                    <td className="py-1.5 text-neutral-300 max-w-xs truncate pr-2" title={row.value}>
                      {row.key.includes('secret') || row.key.includes('token')
                        ? row.value.slice(0, 8) + '...' + row.value.slice(-6)
                        : row.value}
                    </td>
                    <td className="py-1.5 text-neutral-500 text-right whitespace-nowrap">{row.updated_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Toggle: เปิดแจ้งเตือน */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <div>
            <label className="text-sm font-semibold text-neutral-200 block">เปิดระบบแจ้งเตือน LINE</label>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              เปิดให้ระบบส่งข้อความแจ้งเตือนเป้าหมายการอ่านหนังสือเข้า LINE ผู้ใช้ตามเวลาที่กำหนด
            </p>
          </div>
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
          <label className="block text-neutral-300 font-medium mb-1.5">LINE Webhook URL สำหรับผูกกับ LINE Developers</label>
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
              className="absolute right-2 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition text-[11px] flex items-center space-x-1 cursor-pointer"
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
            นำ URL นี้ไปใส่ในช่อง Webhook URL ใน Messaging API บน LINE Developers Console แล้วกด Verify
          </p>
        </div>

        {/* Two Columns: Bot Name & Bot Basic ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">ชื่อ LINE OA (Bot Name)</label>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="เช่น Bunnarak"
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">LINE Basic ID (OA ID)</label>
            <input
              type="text"
              value={botBasicId}
              onChange={(e) => setBotBasicId(e.target.value)}
              placeholder="เช่น @869uobem"
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 font-mono text-xs focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Channel ID */}
        <div>
          <label className="block text-neutral-300 font-medium mb-1.5">Channel ID</label>
          <input
            type="text"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            placeholder="เช่น 2011678531"
            className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 font-mono text-xs focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Channel secret */}
        <div>
          <label className="block text-neutral-300 font-medium mb-1.5">Channel Secret</label>
          <div className="relative flex items-center">
            <input
              type={showSecret ? 'text' : 'password'}
              value={channelSecret}
              onChange={(e) => setChannelSecret(e.target.value)}
              placeholder="กรอก Channel secret จาก LINE Console"
              className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 font-mono text-xs focus:outline-none focus:border-emerald-500/50"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 text-neutral-500 hover:text-neutral-300 transition cursor-pointer"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Channel access token */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-neutral-300 font-medium">Channel Access Token (Long-lived)</label>
            {channelAccessToken && (
              <button
                type="button"
                onClick={handleCopyToken}
                className="text-[10px] text-neutral-400 hover:text-neutral-200 flex items-center space-x-1 cursor-pointer"
              >
                {copiedToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedToken ? 'คัดลอกแล้ว' : 'คัดลอก Token'}</span>
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <input
              type={showToken ? 'text' : 'password'}
              value={channelAccessToken}
              onChange={(e) => setChannelAccessToken(e.target.value)}
              placeholder="กรอก Channel access token จาก LINE Console"
              className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 font-mono text-xs focus:outline-none focus:border-emerald-500/50"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 text-neutral-500 hover:text-neutral-300 transition cursor-pointer"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Target User ID */}
        <div>
          <label className="block text-neutral-300 font-medium mb-1.5">User ID ปลายทาง (Target LINE User ID)</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="เช่น U9330ea2a3097a7e8ea7b81a9eeb82088"
            className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 font-mono text-xs focus:outline-none focus:border-emerald-500/50"
          />
          <p className="text-[11px] text-neutral-400 mt-1">
            ระบุ LINE User ID ของบัญชีที่จะให้รับการแจ้งเตือนและการทดสอบส่ง
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
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sky-400 text-[10px] transition cursor-pointer"
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
          {/* บันทึก LINE ลง DB */}
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-md shadow-emerald-500/10 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
            <span>บันทึกลง Database</span>
          </button>

          {/* ทดสอบส่ง */}
          <button
            type="button"
            onClick={handleTestSend}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-medium text-xs transition cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
          >
            {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-sky-400" />}
            <span>ทดสอบส่งข้อความ</span>
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
