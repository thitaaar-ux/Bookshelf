import React, { useState, useEffect } from 'react';
import { 
  Settings, ShieldCheck, CheckCircle2, AlertTriangle, 
  RefreshCw, Database, Terminal, Cpu, Sparkles, 
  ExternalLink, Key, Zap 
} from 'lucide-react';

interface AdminSettingsTabProps {
  onResetData?: () => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({ onResetData }) => {
  const [healthData, setHealthData] = useState<{
    status: string;
    service: string;
    time: string;
    lineConfigured: boolean;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [testAiResponse, setTestAiResponse] = useState<string | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      } else {
        setHealthData({
          status: 'degraded',
          service: 'Express API (Mock Mode)',
          time: new Date().toISOString(),
          lineConfigured: false,
        });
      }
    } catch {
      setHealthData({
        status: 'local_mode',
        service: 'Client Side Only',
        time: new Date().toISOString(),
        lineConfigured: false,
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const testGeminiAi = async () => {
    setIsTestingAi(true);
    setTestAiResponse(null);
    try {
      const res = await fetch('/api/chat/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Admin Ping: ทดสอบการเชื่อมต่อโมเดล AI สำเร็จหรือไม่?',
          history: []
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTestAiResponse(data.reply || 'เชื่อมต่อ Gemini AI สำเร็จสมบูรณ์!');
      } else {
        setTestAiResponse('ตอบกลับจาก Heuristic Rule-based (ยังไม่ได้ตั้งค่า GEMINI_API_KEY หรือ Rate limit)');
      }
    } catch (e: any) {
      setTestAiResponse('เชื่อมต่อ API Server ไม่สำเร็จ: ' + e?.message);
    } finally {
      setIsTestingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Settings className="w-4 h-4 text-sky-400" />
          <span>การตั้งค่าระบบ &amp; ตรวจสุขภาพ API (System Configuration)</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          ตรวจสอบ Environment Variables, การเชื่อมต่อ Express Backend และสถานะ LINE / AI Services
        </p>
      </div>

      {/* Grid: Health Check & Environment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend Server Health */}
        <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>สถานะเซิร์ฟเวอร์ Express API</span>
            </h3>
            <button
              onClick={checkHealth}
              disabled={isChecking}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
              title="ตรวจสอบอีกครั้ง"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-400">Endpoint Health:</span>
              <span className="font-mono text-emerald-400 flex items-center space-x-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{healthData?.status === 'ok' ? 'HEALTHY (HTTP 200)' : healthData?.status || 'CHECKING...'}</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-400">Service Name:</span>
              <span className="font-mono text-neutral-200">{healthData?.service || 'Tsundoku Killer API'}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-400">LINE SDK Credentials:</span>
              <span className={`font-mono text-xs font-semibold ${healthData?.lineConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                {healthData?.lineConfigured ? 'Configured (พร้อมยิงจริง)' : 'Not Configured (ใช้ Simulator Mode)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-neutral-400">Runtime &amp; Port:</span>
              <span className="font-mono text-neutral-200">Bun / Node.js • Port 3000</span>
            </div>
          </div>
        </div>

        {/* Environment Keys Matrix */}
        <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Key className="w-4 h-4 text-sky-400" />
              <span>ความปลอดภัย &amp; Environment Variables</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
              .env / .env.example
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="flex justify-between items-center font-mono">
                <span className="text-sky-400 font-semibold">GEMINI_API_KEY</span>
                <span className="text-[10px] text-neutral-400">Google Gen AI SDK</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                ใช้ขับเคลื่อน Tsundoku Concierge แชทบอทผู้ช่วยทลายกองดอง
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="flex justify-between items-center font-mono">
                <span className="text-emerald-400 font-semibold">LINE_CHANNEL_ACCESS_TOKEN</span>
                <span className="text-[10px] text-neutral-400">LINE Messaging API</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                สำหรับส่งข้อความ Push และ Quick Reply ไปยังบัญชีผู้ใช้งาน
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="flex justify-between items-center font-mono">
                <span className="text-emerald-400 font-semibold">LINE_CHANNEL_SECRET</span>
                <span className="text-[10px] text-neutral-400">HMAC-SHA256</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                สำหรับตรวจสอบความถูกต้องของ Webhook Signature ป้องกันการปลอมแปลง
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive AI Connectivity Test */}
      <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>ทดสอบเชื่อมต่อ Google Gemini AI</span>
            </h3>
            <p className="text-xs text-neutral-400">
              ทดสอบส่งคำสั่งไปยัง Endpoint `/api/chat/concierge` เพื่อยืนยันการตอบกลับ
            </p>
          </div>

          <button
            onClick={testGeminiAi}
            disabled={isTestingAi}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${isTestingAi ? 'animate-spin' : ''}`} />
            <span>{isTestingAi ? 'กำลังประมวลผล...' : 'ทดสอบส่งข้อความ'}</span>
          </button>
        </div>

        {testAiResponse && (
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
            <span className="text-neutral-400 font-mono text-[11px] block mb-1">ผลการตอบกลับจาก AI:</span>
            <p className="text-neutral-200 leading-relaxed whitespace-pre-line font-mono">{testAiResponse}</p>
          </div>
        )}
      </div>

      {/* Database & Local Cache Management */}
      <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">สำรองข้อมูล &amp; รีเซ็ตระบบ (Data Management)</h4>
            <p className="text-[11px] text-neutral-400">
              ข้อมูลปัจจุบันถูกบันทึกใน Client-side Storage และพร้อมซิงก์เข้าสู่ Supabase/PostgreSQL
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const data = {
                books: JSON.parse(localStorage.getItem('tsundoku_books') || '[]'),
                schedule: JSON.parse(localStorage.getItem('tsundoku_schedule') || '{}'),
                logs: JSON.parse(localStorage.getItem('tsundoku_logs') || '[]'),
                exportDate: new Date().toISOString()
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `tsundoku_backup_${Date.now()}.json`;
              a.click();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition cursor-pointer"
          >
            Export Backup JSON
          </button>
        </div>
      </div>
    </div>
  );
};
