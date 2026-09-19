import React, { useState } from 'react';
import { 
  X, Cpu, Database, Server, Layout, Copy, Check, 
  ExternalLink, Layers, Shield, Zap, Sparkles 
} from 'lucide-react';
import { ARCHITECTURE_DOCUMENTATION } from '../data/initialData';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [subTab, setSubTab] = useState<'stack' | 'database' | 'backend' | 'frontend'>('stack');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white shadow">
              <Cpu className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">System Architecture & Technical Specifications</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                  SOLO DEV READY
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                สถาปัตยกรรมระบบ, โครงสร้าง Database Schema, โค้ด Backend Webhook, และแนวทาง UI/UX
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sub Tabs */}
            <div className="hidden md:flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setSubTab('stack')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                  subTab === 'stack' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Tech Stack</span>
              </button>
              <button
                onClick={() => setSubTab('database')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                  subTab === 'database' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Database Schema</span>
              </button>
              <button
                onClick={() => setSubTab('backend')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                  subTab === 'backend' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5 text-sky-400" />
                <span>3. Backend LINE Webhook</span>
              </button>
              <button
                onClick={() => setSubTab('frontend')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                  subTab === 'frontend' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5 text-indigo-400" />
                <span>4. Frontend Design</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex items-center bg-neutral-950 p-2 border-b border-neutral-800 overflow-x-auto text-xs space-x-1">
          <button
            onClick={() => setSubTab('stack')}
            className={`px-3 py-1 rounded-lg shrink-0 ${subTab === 'stack' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
          >
            1. Tech Stack
          </button>
          <button
            onClick={() => setSubTab('database')}
            className={`px-3 py-1 rounded-lg shrink-0 ${subTab === 'database' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
          >
            2. Database
          </button>
          <button
            onClick={() => setSubTab('backend')}
            className={`px-3 py-1 rounded-lg shrink-0 ${subTab === 'backend' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
          >
            3. Backend Webhook
          </button>
          <button
            onClick={() => setSubTab('frontend')}
            className={`px-3 py-1 rounded-lg shrink-0 ${subTab === 'frontend' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
          >
            4. Frontend UI
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-neutral-950/70 space-y-6">
          
          {/* TAB 1: TECH STACK RECOMMENDATIONS */}
          {subTab === 'stack' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-base font-bold text-white">
                  1. แนะนำ Tech Stack สำหรับการพัฒนาคนเดียว (Solo Developer Rationale)
                </h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  หลักการสำคัญของการพัฒนาคนเดียวคือ <strong>"Zero DevOps, Low Maintenance, Maximum Speed, and Zero-Cost Free Tier"</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {ARCHITECTURE_DOCUMENTATION.techStackRecommendation.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          {item.layer}
                        </span>
                        <h5 className="text-sm font-bold text-white">{item.technology}</h5>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">SOLO OPTIMIZED</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed mb-2">
                      {item.whyChosen}
                    </p>
                    <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 text-[11px] text-amber-300/90 flex items-start space-x-2">
                      <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span><strong>จุดเด่นสำหรับคนเดียว:</strong> {item.soloDevAdvantage}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Architecture Data Flow Diagram */}
              <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <h5 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Data Flow Diagram (สถาปัตยกรรมการไหลของข้อมูล)
                </h5>
                <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 space-y-2 leading-relaxed overflow-x-auto">
                  <div>[User ใน LINE] ──(กด Quick Reply "📖 เริ่มอ่านเลย!")──&gt;</div>
                  <div>  └─&gt; [LINE Platform] ──(HTTPS POST Webhook with HMAC-SHA256)──&gt;</div>
                  <div>        └─&gt; [Node.js Express / Cloud Run API] ──&gt;</div>
                  <div>              ├─ 1. ตรวจสอบ Signature `x-line-signature`</div>
                  <div>              ├─ 2. บันทึก Session เข้า Table `reading_logs` ใน Database</div>
                  <div>              ├─ 3. คำนวณ Streak + 1 และอัตราทลายกองดอง (Tsundoku %)</div>
                  <div>              └─ 4. ยิง LINE Reply API: "เริ่มจับเวลาแล้ว ขอให้มีความสุขกับการอ่าน! ✨"</div>
                  <div className="pt-2 text-neutral-500">
                    [Cron Scheduler (20:00)] ──(Push Notification)──&gt; [LINE Messaging API] ──&gt; [User Smartphone]
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATABASE SCHEMA */}
          {subTab === 'database' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">
                    2. โครงสร้าง Database Schema (PostgreSQL Supabase & Firebase Firestore)
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    ออกแบบพร้อม RLS, Trigger อัปเดต Streak อัตโนมัติ, และ Index O(1) รองรับ LINE Webhook
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(ARCHITECTURE_DOCUMENTATION.supabaseSqlSchema, 'sql')}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center space-x-1.5 transition"
                >
                  {copiedSection === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'sql' ? 'คัดลอก SQL แล้ว!' : 'คัดลอก SQL Schema'}</span>
                </button>
              </div>

              {/* Supabase PostgreSQL Script */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-emerald-400 font-semibold block">
                  A. Supabase / PostgreSQL DDL Script:
                </span>
                <pre className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed max-h-96">
                  {ARCHITECTURE_DOCUMENTATION.supabaseSqlSchema}
                </pre>
              </div>

              {/* Firebase Firestore Model */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-400 font-semibold block">
                    B. ทางเลือก NoSQL: Firebase Firestore Document Collections:
                  </span>
                  <button
                    onClick={() => handleCopy(ARCHITECTURE_DOCUMENTATION.firebaseJsonSchema, 'firebase')}
                    className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center space-x-1"
                  >
                    {copiedSection === 'firebase' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'firebase' ? 'คัดลอกแล้ว' : 'คัดลอก JSON'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed">
                  {ARCHITECTURE_DOCUMENTATION.firebaseJsonSchema}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: BACKEND NODE.JS LINE WEBHOOK */}
          {subTab === 'backend' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">
                    3. โค้ด Backend (Node.js) สำหรับเชื่อมต่อ LINE Webhook & Quick Reply
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    รองรับ HMAC-SHA256 Signature Verification, Router สำหรับ Postback Quick Reply และคำนวณ Streak
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(ARCHITECTURE_DOCUMENTATION.nodeJsWebhookCode, 'node')}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs flex items-center space-x-1.5 transition"
                >
                  {copiedSection === 'node' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'node' ? 'คัดลอกโค้ด Node.js แล้ว!' : 'คัดลอกโค้ด Webhook'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 space-y-1">
                <div className="font-semibold text-white flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>ฟีเจอร์สำคัญในโค้ดชุดนี้:</span>
                </div>
                <ul className="list-disc list-inside text-neutral-400 space-y-0.5 pl-2 text-[11px]">
                  <li>ตรวจ Signature แบบ Raw Body ป้องกัน Replay Attack จากบุคคลภายนอก</li>
                  <li>สร้าง Quick Reply Message 4 ตัวเลือก: <code>[เริ่มอ่านเลย!]</code>, <code>[ขอเลื่อน 30 นาที]</code>, <code>[วันนี้ขอพัก]</code>, <code>[บันทึก 15 หน้า]</code></li>
                  <li>แยกแยะ Event ประเภท Postback เพื่ออัปเดตสถานะ Database ทันที</li>
                </ul>
              </div>

              <pre className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed max-h-[500px]">
                {ARCHITECTURE_DOCUMENTATION.nodeJsWebhookCode}
              </pre>
            </div>
          )}

          {/* TAB 4: FRONTEND DESIGN & MOBILE-FIRST DIRECTION */}
          {subTab === 'frontend' && (
            <div className="space-y-5 text-xs text-neutral-300">
              <div>
                <h4 className="text-base font-bold text-white">
                  4. ทิศทางการออกแบบ Frontend UI/UX (Premium & Hi-Tech Monochrome)
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  ดีไซน์เน้นความเรียบหรู คมชัด สไตล์ Cyber-Minimalist เพื่อขับเน้นหน้าปกหนังสือให้โดดเด่นที่สุด
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <h5 className="font-bold text-white text-sm">🎨 Color Palette & Contrast</h5>
                  <p className="text-neutral-400 leading-relaxed text-[11px]">
                    - พื้นหลังหลัก: <code>#0a0a0a</code> (Obsidian Black) ตัดกับเส้นกรอบ <code>#262626</code><br/>
                    - Typography: สีขาวบริสุทธิ์ <code>#ffffff</code> สลับกับ Neutral Gray สำหรับ Subtext<br/>
                    - Status Dots: เขียวมรกตสำหรับอ่านจบ, ฟ้าสำหรับกำลังอ่าน, อำพันสำหรับ Streak
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <h5 className="font-bold text-white text-sm">📱 Mobile-First & Zero Friction</h5>
                  <p className="text-neutral-400 leading-relaxed text-[11px]">
                    - Touch Targets กว้างกว่า 44px สำหรับกดบนมือถือได้สะดวก<br/>
                    - Quick Log Buttons (+5, +10, +20 หน้า) บันทึกความคืบหน้าได้ใน 1 แท็ป<br/>
                    - Responsive Bottom Sheets สำหรับตั้งค่าเวลาแจ้งเตือน
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <h5 className="font-bold text-white text-sm">🎩 The System Concierge Persona</h5>
                  <p className="text-neutral-400 leading-relaxed text-[11px]">
                    - บุคลิกภาพ: Virtual Butler ชั้นนำ สุภาพ ให้กำลังใจเชิงบวก ไม่ตำหนิ<br/>
                    - Onboarding: ใช้การคุยถาม-ตอบสั้นๆ แทนแบบฟอร์มยาวเหยียด<br/>
                    - Check-in: วิเคราะห์ว่าหากไม่แตะหนังสือเกิน 3 วันจะสะกิดเบาๆ
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <h5 className="font-bold text-white text-sm">🏆 Gamification Engine</h5>
                  <p className="text-neutral-400 leading-relaxed text-[11px]">
                    - Tsundoku Clearance Gauge แสดง % การเคลียร์กองดองแบบเรียลไทม์<br/>
                    - Digital Badges ปลดล็อกตามพฤติกรรม (Streak, จำนวนหน้า, ความเร็ว)<br/>
                    - Reward System: ปลดล็อกธีม UI เมื่อ % การอ่านถึงเป้า
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>TSUNDOKU KILLER ARCHITECTURE SPECIFICATION v2.5</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
