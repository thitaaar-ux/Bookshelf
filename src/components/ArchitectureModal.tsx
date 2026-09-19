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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#fdfcf8] border-2 border-[#1c1c1c] shadow-[8px_8px_0px_#1c1c1c] w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
        
        {/* Top Header - Variation 3 */}
        <div className="px-6 py-4 bg-[#f4f2ea] border-b-2 border-[#1c1c1c] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#1c1c1c] flex items-center justify-center text-white shadow-sm">
              <Cpu className="w-4 h-4 text-[#ff4d00]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="meta text-[#ff4d00] font-bold">● SPECIFICATIONS</span>
                <span className="meta text-[#1c1c1c]/40">•</span>
                <span className="meta text-[#1c1c1c]">SOLO DEV READY</span>
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight text-[#1c1c1c]">
                System Architecture & Tech Specs
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sub Tabs */}
            <div className="nav-pills hidden md:flex items-center bg-white p-1 rounded-full border border-[#e8e6df] text-xs">
              <button
                onClick={() => setSubTab('stack')}
                className={`px-3 py-1.5 rounded-full transition flex items-center space-x-1.5 cursor-pointer ${
                  subTab === 'stack' ? 'bg-[#1c1c1c] text-white font-bold' : 'text-[#1c1c1c]/60 hover:text-[#1c1c1c]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#ff4d00]" />
                <span>1. Tech Stack</span>
              </button>
              <button
                onClick={() => setSubTab('database')}
                className={`px-3 py-1.5 rounded-full transition flex items-center space-x-1.5 cursor-pointer ${
                  subTab === 'database' ? 'bg-[#1c1c1c] text-white font-bold' : 'text-[#1c1c1c]/60 hover:text-[#1c1c1c]'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-[#ff4d00]" />
                <span>2. Database Schema</span>
              </button>
              <button
                onClick={() => setSubTab('backend')}
                className={`px-3 py-1.5 rounded-full transition flex items-center space-x-1.5 cursor-pointer ${
                  subTab === 'backend' ? 'bg-[#1c1c1c] text-white font-bold' : 'text-[#1c1c1c]/60 hover:text-[#1c1c1c]'
                }`}
              >
                <Server className="w-3.5 h-3.5 text-[#ff4d00]" />
                <span>3. Backend Webhook</span>
              </button>
              <button
                onClick={() => setSubTab('frontend')}
                className={`px-3 py-1.5 rounded-full transition flex items-center space-x-1.5 cursor-pointer ${
                  subTab === 'frontend' ? 'bg-[#1c1c1c] text-white font-bold' : 'text-[#1c1c1c]/60 hover:text-[#1c1c1c]'
                }`}
              >
                <Layout className="w-3.5 h-3.5 text-[#ff4d00]" />
                <span>4. Frontend Design</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 border border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#fdfcf8] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex items-center bg-[#f4f2ea] p-2 border-b border-[#1c1c1c] overflow-x-auto text-xs space-x-1">
          <button
            onClick={() => setSubTab('stack')}
            className={`px-3 py-1 rounded shrink-0 ${subTab === 'stack' ? 'bg-[#1c1c1c] text-white font-bold' : 'text-[#1c1c1c]/70'}`}
          >
            1. Tech Stack
          </button>
          <button
            onClick={() => setSubTab('database')}
            className={`px-3 py-1 rounded shrink-0 ${subTab === 'database' ? 'bg-[#1c1c1c] text-white font-bold' : 'text-[#1c1c1c]/70'}`}
          >
            2. Database
          </button>
          <button
            onClick={() => setSubTab('backend')}
            className={`px-3 py-1 rounded shrink-0 ${subTab === 'backend' ? 'bg-[#1c1c1c] text-white font-bold' : 'text-[#1c1c1c]/70'}`}
          >
            3. Backend Webhook
          </button>
          <button
            onClick={() => setSubTab('frontend')}
            className={`px-3 py-1 rounded shrink-0 ${subTab === 'frontend' ? 'bg-[#1c1c1c] text-white font-bold' : 'text-[#1c1c1c]/70'}`}
          >
            4. Frontend UI
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#fdfcf8] space-y-6">
          
          {/* TAB 1: TECH STACK RECOMMENDATIONS */}
          {subTab === 'stack' && (
            <div className="space-y-5">
              <div>
                <span className="meta text-[#ff4d00] font-bold">1.0 TECH STACK SPECIFICATION</span>
                <h4 className="text-base font-black uppercase text-[#1c1c1c]">
                  สถาปัตยกรรมสำหรับ Solo Developer (Zero DevOps & Fast Iteration)
                </h4>
                <p className="text-xs text-[#1c1c1c]/70 mt-1 leading-relaxed font-medium">
                  หลักการสำคัญของการพัฒนาคนเดียวคือ <strong>"Zero DevOps, Low Maintenance, Maximum Speed, and Zero-Cost Free Tier"</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {ARCHITECTURE_DOCUMENTATION.techStackRecommendation.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white border border-[#1c1c1c] shadow-[2px_2px_0px_#1c1c1c]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="meta text-[10px] px-2 py-0.5 bg-[#f4f2ea] border border-[#1c1c1c] text-[#1c1c1c] font-bold">
                          {item.layer}
                        </span>
                        <h5 className="text-sm font-black uppercase text-[#1c1c1c]">{item.technology}</h5>
                      </div>
                      <span className="meta text-[10px] text-[#ff4d00] font-bold">SOLO OPTIMIZED</span>
                    </div>
                    <p className="text-xs text-[#1c1c1c]/80 leading-relaxed mb-2 font-medium">
                      {item.whyChosen}
                    </p>
                    <div className="p-2.5 bg-[#f4f2ea] border border-[#e8e6df] text-[11px] text-[#1c1c1c] flex items-start space-x-2">
                      <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#ff4d00]" />
                      <span><strong>จุดเด่นสำหรับคนเดียว:</strong> {item.soloDevAdvantage}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Architecture Data Flow Diagram */}
              <div className="p-5 bg-white border border-[#1c1c1c] shadow-[3px_3px_0px_#1c1c1c] space-y-3">
                <span className="meta text-[#ff4d00] font-bold">DATA PIPELINE FLOW</span>
                <h5 className="text-xs font-black uppercase text-[#1c1c1c]">
                  Data Flow Diagram (สถาปัตยกรรมการไหลของข้อมูล)
                </h5>
                <div className="p-4 bg-[#1c1c1c] text-xs font-mono text-[#fdfcf8] space-y-2 leading-relaxed overflow-x-auto">
                  <div>[User ใน LINE] ──(กด Quick Reply "📖 เริ่มอ่านเลย!")──&gt;</div>
                  <div>  └─&gt; [LINE Platform] ──(HTTPS POST Webhook with HMAC-SHA256)──&gt;</div>
                  <div>        └─&gt; [Node.js Express / Cloud Run API] ──&gt;</div>
                  <div>              ├─ 1. ตรวจสอบ Signature `x-line-signature`</div>
                  <div>              ├─ 2. บันทึก Session เข้า Table `reading_logs` ใน Database</div>
                  <div>              ├─ 3. คำนวณ Streak + 1 และอัตราทลายกองดอง (Tsundoku %)</div>
                  <div>              └─ 4. ยิง LINE Reply API: "เริ่มจับเวลาแล้ว ขอให้มีความสุขกับการอ่าน! ✨"</div>
                  <div className="pt-2 text-white/50">
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
                  <span className="meta text-[#ff4d00] font-bold">2.0 RELATIONAL & NOSQL SCHEMAS</span>
                  <h4 className="text-base font-black uppercase text-[#1c1c1c]">
                    Database Schema (PostgreSQL Supabase & Firestore)
                  </h4>
                  <p className="text-xs text-[#1c1c1c]/70 mt-1 font-medium">
                    ออกแบบพร้อม RLS, Trigger อัปเดต Streak อัตโนมัติ, และ Index O(1) รองรับ LINE Webhook
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(ARCHITECTURE_DOCUMENTATION.supabaseSqlSchema, 'sql')}
                  className="px-3 py-1.5 bg-[#1c1c1c] text-[#fdfcf8] text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer hover:bg-[#ff4d00]"
                >
                  {copiedSection === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'sql' ? 'คัดลอก SQL แล้ว!' : 'คัดลอก SQL Schema'}</span>
                </button>
              </div>

              {/* Supabase PostgreSQL Script */}
              <div className="space-y-2">
                <span className="meta text-xs text-[#1c1c1c] font-bold block">
                  A. Supabase / PostgreSQL DDL Script:
                </span>
                <pre className="p-4 bg-[#1c1c1c] text-[#fdfcf8] text-xs font-mono overflow-x-auto leading-relaxed max-h-96 border border-[#1c1c1c]">
                  {ARCHITECTURE_DOCUMENTATION.supabaseSqlSchema}
                </pre>
              </div>

              {/* Firebase Firestore Model */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="meta text-xs text-[#1c1c1c] font-bold block">
                    B. ทางเลือก NoSQL: Firebase Firestore Document Collections:
                  </span>
                  <button
                    onClick={() => handleCopy(ARCHITECTURE_DOCUMENTATION.firebaseJsonSchema, 'firebase')}
                    className="px-3 py-1 bg-white border border-[#1c1c1c] text-[#1c1c1c] text-xs font-bold flex items-center space-x-1 hover:bg-[#1c1c1c] hover:text-white transition cursor-pointer"
                  >
                    {copiedSection === 'firebase' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'firebase' ? 'คัดลอกแล้ว' : 'คัดลอก JSON'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-[#1c1c1c] text-[#fdfcf8] text-xs font-mono overflow-x-auto leading-relaxed border border-[#1c1c1c]">
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
                  <span className="meta text-[#ff4d00] font-bold">3.0 LINE MESSAGING API INTEGRATION</span>
                  <h4 className="text-base font-black uppercase text-[#1c1c1c]">
                    โค้ด Backend (Node.js) เชื่อมต่อ LINE Webhook & Quick Reply
                  </h4>
                  <p className="text-xs text-[#1c1c1c]/70 mt-1 font-medium">
                    รองรับ HMAC-SHA256 Signature Verification, Router สำหรับ Postback Quick Reply และคำนวณ Streak
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(ARCHITECTURE_DOCUMENTATION.nodeJsWebhookCode, 'node')}
                  className="px-3 py-1.5 bg-[#1c1c1c] text-[#fdfcf8] text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer hover:bg-[#ff4d00]"
                >
                  {copiedSection === 'node' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'node' ? 'คัดลอกโค้ด Node.js แล้ว!' : 'คัดลอกโค้ด Webhook'}</span>
                </button>
              </div>

              <div className="p-4 bg-white border border-[#1c1c1c] shadow-[2px_2px_0px_#1c1c1c] text-xs text-[#1c1c1c] space-y-1">
                <div className="font-black uppercase flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[#ff4d00]" />
                  <span>ฟีเจอร์สำคัญในโค้ดชุดนี้:</span>
                </div>
                <ul className="list-disc list-inside text-[#1c1c1c]/70 space-y-0.5 pl-2 text-[11px] font-medium">
                  <li>ตรวจ Signature แบบ Raw Body ป้องกัน Replay Attack จากบุคคลภายนอก</li>
                  <li>สร้าง Quick Reply Message 4 ตัวเลือก: <code>[เริ่มอ่านเลย!]</code>, <code>[ขอเลื่อน 30 นาที]</code>, <code>[วันนี้ขอพัก]</code>, <code>[บันทึก 15 หน้า]</code></li>
                  <li>แยกแยะ Event ประเภท Postback เพื่ออัปเดตสถานะ Database ทันที</li>
                </ul>
              </div>

              <pre className="p-4 bg-[#1c1c1c] text-[#fdfcf8] text-xs font-mono overflow-x-auto leading-relaxed max-h-[500px] border border-[#1c1c1c]">
                {ARCHITECTURE_DOCUMENTATION.nodeJsWebhookCode}
              </pre>
            </div>
          )}

          {/* TAB 4: FRONTEND DESIGN & MOBILE-FIRST DIRECTION */}
          {subTab === 'frontend' && (
            <div className="space-y-5 text-xs text-[#1c1c1c]">
              <div>
                <span className="meta text-[#ff4d00] font-bold">4.0 INTERFACE SPECIFICATION</span>
                <h4 className="text-base font-black uppercase text-[#1c1c1c]">
                  ทิศทางการออกแบบ Frontend UI/UX (Variation 3: Editorial & Brutalist)
                </h4>
                <p className="text-xs text-[#1c1c1c]/70 mt-1 font-medium">
                  เน้นความคมชัดของฟอนต์ Serif สลับกับ Monospace บนโทนสีงาช้าง ขอบดำสนิท และสำเนียงสีส้มบริสุทธิ์
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#1c1c1c] shadow-[2px_2px_0px_#1c1c1c] space-y-2">
                  <h5 className="font-black uppercase text-[#1c1c1c] text-sm">🎨 Color Palette & Contrast</h5>
                  <p className="text-[#1c1c1c]/70 leading-relaxed text-[11px] font-medium">
                    - พื้นหลังหลัก: <code>#fdfcf8</code> (Ivory Paper) ตัดกับขอบดำ <code>#1c1c1c</code><br/>
                    - ไฮไลต์สำเนียง: <code>#ff4d00</code> (Safety International Orange)<br/>
                    - Typography: Serif Italic สำหรับหัวข้อ, Monospace สำหรับสถิติและรหัส
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#1c1c1c] shadow-[2px_2px_0px_#1c1c1c] space-y-2">
                  <h5 className="font-black uppercase text-[#1c1c1c] text-sm">📱 Mobile-First & Zero Friction</h5>
                  <p className="text-[#1c1c1c]/70 leading-relaxed text-[11px] font-medium">
                    - Touch Targets กว้างกว่า 44px สำหรับกดบนมือถือได้สะดวก<br/>
                    - Quick Log Buttons (+5, +10, +20 หน้า) บันทึกความคืบหน้าได้ใน 1 คลิก<br/>
                    - Interactive LINE Simulator สำหรับทดสอบ Quick Reply เสมือนจริง
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#1c1c1c] shadow-[2px_2px_0px_#1c1c1c] space-y-2">
                  <h5 className="font-black uppercase text-[#1c1c1c] text-sm">🎩 The System Concierge Persona</h5>
                  <p className="text-[#1c1c1c]/70 leading-relaxed text-[11px] font-medium">
                    - บุคลิกภาพ: Virtual Reading Butler สุภาพ ให้กำลังใจเชิงบวก ไม่ตำหนิ<br/>
                    - Onboarding: ใช้การคุยถาม-ตอบสั้นๆ แนะนำเวลาอ่านที่เหมาะสม<br/>
                    - Check-in: สะกิดอย่างประณีตเมื่อไม่แตะหนังสือเกิน 3 วัน
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#1c1c1c] shadow-[2px_2px_0px_#1c1c1c] space-y-2">
                  <h5 className="font-black uppercase text-[#1c1c1c] text-sm">🏆 Gamification Engine</h5>
                  <p className="text-[#1c1c1c]/70 leading-relaxed text-[11px] font-medium">
                    - Tsundoku Clearance Meter แสดง % การเคลียร์กองดองแบบเรียลไทม์<br/>
                    - Digital Badges ปลดล็อกตามพฤติกรรม (Streak, จำนวนหน้า, ความเร็ว)<br/>
                    - Reward Themes: ปลดล็อกรูปลักษณ์อินเทอร์เฟซเมื่ออัตราทลายกองดองสูงขึ้น
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer - Variation 3 */}
        <div className="px-6 py-3 bg-[#f4f2ea] border-t-2 border-[#1c1c1c] flex items-center justify-between text-xs text-[#1c1c1c]">
          <span className="meta text-[#1c1c1c]/70">TSUNDOKU KILLER ARCHITECTURE SPECIFICATION v2.5</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1c1c1c] text-[#fdfcf8] font-black uppercase text-xs hover:bg-[#ff4d00] transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
