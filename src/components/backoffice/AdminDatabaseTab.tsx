import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, CheckCircle2, AlertCircle, 
  Copy, Check, ShieldCheck, Terminal, Server, 
  ExternalLink, Layers, ArrowRight, Play, Eye, EyeOff
} from 'lucide-react';

interface AdminDatabaseTabProps {
  onShowToast?: (msg: string) => void;
}

export const AdminDatabaseTab: React.FC<AdminDatabaseTabProps> = ({ onShowToast }) => {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [copiedHba, setCopiedHba] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/db/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      });
      const data = await res.json();
      await fetchStatus();

      if (data.postgres?.connected) {
        setActionFeedback('🎉 เชื่อมต่อกับ PostgreSQL สำเร็จสมบูรณ์!');
        onShowToast?.('เชื่อมต่อกับ PostgreSQL สำเร็จ!');
      } else if (data.postgres?.isPgHbaError) {
        setActionFeedback(`⚠️ เซิร์ฟเวอร์ PostgreSQL ได้รับการเชื่อมต่อแล้ว แต่ต้องอนุญาต Client IP: ${data.postgres.clientIp} ใน pg_hba.conf`);
      } else {
        setActionFeedback(`เกิดข้อผิดพลาด: ${data.postgres?.error || 'ไม่สามารถเชื่อมต่อได้'}`);
      }
    } catch {
      setActionFeedback('ไม่สามารถส่งคำขอทดสอบไปยังเซิร์ฟเวอร์ได้');
    } finally {
      setIsTesting(false);
    }
  };

  const handleInitSchema = async () => {
    setIsMigrating(true);
    try {
      const res = await fetch('/api/db/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init_schema' }),
      });
      const data = await res.json();
      setActionFeedback(data.message || (data.success ? 'สร้างตารางเรียบร้อย' : 'สร้างตารางไม่สำเร็จ'));
      await fetchStatus();
    } catch {
      setActionFeedback('เกิดข้อผิดพลาดในการรัน migration');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/db/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const data = await res.json();
      setActionFeedback(data.message || (data.success ? 'ซี้ดข้อมูลเรียบร้อย' : 'ซี้ดข้อมูลไม่สำเร็จ'));
      await fetchStatus();
    } catch {
      setActionFeedback('เกิดข้อผิดพลาดในการซี้ดข้อมูล');
    } finally {
      setIsSeeding(false);
    }
  };

  const pg = status?.postgres;
  const clientIp = pg?.clientIp || '34.34.244.10';
  const hbaSnippet = `host    ${status?.config?.database || 'bookshelf'}    ${status?.config?.user || 'bookshelf_app'}    ${clientIp}/32    md5`;
  const hbaAllSnippet = `host    all    all    0.0.0.0/0    md5`;

  const rawUrl = 'postgresql://bookshelf_app:9i3rehIpjV3udEzwhtnUKHK4PtQD3qiK@210.246.215.195:5433/bookshelf';
  const maskedUrl = showPassword
    ? rawUrl
    : 'postgresql://bookshelf_app:••••••••••••••••••••••••••••••••@210.246.215.195:5433/bookshelf';

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">การเชื่อมต่อฐานข้อมูล (Database Management)</h1>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              pg?.connected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              <Database className="w-2.5 h-2.5 mr-1" />
              {status?.activeDriver || 'SQLite (Local Fallback)'}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            เชื่อมต่อกับ PostgreSQL เซิร์ฟเวอร์ภายนอก (<code className="text-sky-400 font-mono">210.246.215.195:5433/bookshelf</code>) พร้อมระบบสำรองอัตโนมัติ SQLite แบบไร้รอยต่อ
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestConnection}
          disabled={isTesting}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 text-xs font-bold flex items-center space-x-2 transition cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
        </button>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-200 flex items-start space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{actionFeedback}</p>
        </div>
      )}

      {/* Top Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {/* PostgreSQL Card */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-medium">สถานะ PostgreSQL</span>
            <Server className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${pg?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="font-bold text-white text-sm">
              {pg?.connected ? 'เชื่อมต่อสำเร็จ' : pg?.isPgHbaError ? 'รอตั้งค่า pg_hba.conf' : 'รอการเชื่อมต่อ'}
            </span>
          </div>
          <p className="text-[11px] font-mono text-neutral-400 truncate">
            {status?.config?.host || '210.246.215.195'}:{status?.config?.port || '5433'}
          </p>
        </div>

        {/* Latency or Egress IP */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-medium">Client Egress IP</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-bold text-white font-mono text-sm">{clientIp}</p>
          <p className="text-[10px] text-neutral-500">IP ขาออกของ Cloud Run สำหรับอนุญาตเข้าถึง DB</p>
        </div>

        {/* Local Storage Card */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-medium">Local SQLite Fallback</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-bold text-emerald-400 text-sm">ทำงานปกติ 100%</p>
          <p className="text-[11px] text-neutral-400 font-mono">
            {status?.sqlite?.rowCount || 0} แถว (data/tsundoku.db)
          </p>
        </div>
      </div>

      {/* Connection Parameter Details */}
      <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Server className="w-4 h-4 text-sky-400" />
          <span>พารามิเตอร์การเชื่อมต่อ PostgreSQL (Current Configuration)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 text-[10px] block">HOST &amp; PORT</span>
            <span className="text-sky-300 font-bold">{status?.config?.host || '210.246.215.195'}:{status?.config?.port || '5433'}</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 text-[10px] block">DATABASE &amp; USER</span>
            <span className="text-emerald-300 font-bold">{status?.config?.database || 'bookshelf'} / {status?.config?.user || 'bookshelf_app'}</span>
          </div>
        </div>

        {/* Connection string input */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <label className="text-neutral-300 font-medium">DATABASE_URL</label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center space-x-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(rawUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                  onShowToast?.('คัดลอก DATABASE_URL แล้ว');
                }}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
              </button>
            </div>
          </div>
          <input
            type="text"
            readOnly
            value={maskedUrl}
            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sky-300 font-mono text-xs select-all focus:outline-none"
          />
        </div>
      </div>

      {/* Whitelist / pg_hba.conf Troubleshooting Guide */}
      {(!pg?.connected || pg?.isPgHbaError) && (
        <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-500/40 space-y-4 text-xs">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-300 text-sm">
                วิธีอนุญาตการเชื่อมต่อบนเซิร์ฟเวอร์ PostgreSQL (Allowing pg_hba.conf)
              </h4>
              <p className="text-neutral-300 leading-relaxed">
                เซิร์ฟเวอร์ PostgreSQL ตอบสนองที่พอร์ต 5433 แล้ว! แต่ <code className="text-amber-300 font-mono">pg_hba.conf</code> บนเครื่องยังไม่อนุญาตให้ IP <code className="text-sky-300 font-bold font-mono">{clientIp}</code> เชื่อมต่อเข้ามา
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>เพิ่มบรรทัดนี้ในไฟล์ <code className="text-sky-300">/etc/postgresql/&lt;version&gt;/main/pg_hba.conf</code></span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(hbaSnippet);
                  setCopiedHba(true);
                  setTimeout(() => setCopiedHba(false), 2000);
                  onShowToast?.('คัดลอกคำสั่งสำหรับ pg_hba.conf แล้ว');
                }}
                className="text-sky-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer"
              >
                {copiedHba ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHba ? 'คัดลอกแล้ว' : 'คัดลอกคำสั่ง'}</span>
              </button>
            </div>

            <div className="font-mono text-emerald-400 bg-neutral-900/90 p-3 rounded-xl select-all border border-neutral-800">
              # อนุญาตเฉพาะ Cloud Run Applet:<br />
              {hbaSnippet}
              <br /><br />
              # หรืออนุญาตทุก Client IP (แนะนำหาก IP มีการหมุนเวียน):<br />
              {hbaAllSnippet}
            </div>

            <div className="text-[11px] text-neutral-400 space-y-1 pt-1 border-t border-neutral-800">
              <p className="font-bold text-neutral-300">ขั้นตอนการบันทึกและรีโหลดบนเซิร์ฟเวอร์:</p>
              <ol className="list-decimal list-inside space-y-1 font-mono text-[10px] text-neutral-400">
                <li>เปิดไฟล์: <span className="text-sky-300">sudo nano /etc/postgresql/*/main/pg_hba.conf</span></li>
                <li>วางบรรทัดด้านบนลงในไฟล์ แล้วกด <span className="text-neutral-200">Ctrl + O &rarr; Enter &rarr; Ctrl + X</span></li>
                <li>รีโหลดคอนฟิก: <span className="text-emerald-400">sudo systemctl reload postgresql</span></li>
                <li>กลับมากดปุ่ม <strong>"ทดสอบการเชื่อมต่อ"</strong> ด้านบนนี้ได้ทันที!</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Schema Migration & Database Tools */}
      <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>เครื่องมือจัดการฐานข้อมูล PostgreSQL (Database Actions)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
            <h4 className="font-bold text-white text-xs">1. สร้างตารางทั้งหมด (Schema Migration)</h4>
            <p className="text-[11px] text-neutral-400">
              สร้างตาราง <code className="text-sky-300">app_settings</code>, <code className="text-sky-300">books</code>, <code className="text-sky-300">reading_logs</code>, <code className="text-sky-300">webhook_logs</code> บน PostgreSQL
            </p>
            <button
              type="button"
              onClick={handleInitSchema}
              disabled={isMigrating}
              className="mt-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3 h-3 text-sky-400" />
              <span>{isMigrating ? 'กำลังสร้างตาราง...' : 'รัน Migration สร้างตาราง'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
            <h4 className="font-bold text-white text-xs">2. ซี้ดข้อมูลหนังสือเริ่มต้น (Seed Data)</h4>
            <p className="text-[11px] text-neutral-400">
              คัดลอกข้อมูลหนังสือตัวอย่าง 6 เล่ม (Atomic Habits, Thinking Fast &amp; Slow ฯลฯ) เข้าสู่ PostgreSQL
            </p>
            <button
              type="button"
              onClick={handleSeedData}
              disabled={isSeeding}
              className="mt-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>{isSeeding ? 'กำลังซี้ดข้อมูล...' : 'ซี้ดข้อมูลหนังสือ 6 เล่ม'}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
