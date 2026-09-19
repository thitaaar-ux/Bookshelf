import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Bell, Smartphone, RefreshCw, CheckCircle2, 
  ExternalLink, Copy, Check, Terminal, Shield, Clock, Flame
} from 'lucide-react';
import { Book, UserSchedule, LineChatMessage } from '../types';
import confetti from 'canvas-confetti';

interface LineSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: UserSchedule;
  activeBook?: Book;
  onQuickLogPages: (book: Book, pages: number) => void;
  onUpdateSchedule: (schedule: UserSchedule) => void;
}

export const LineSimulatorModal: React.FC<LineSimulatorModalProps> = ({
  isOpen,
  onClose,
  schedule,
  activeBook,
  onQuickLogPages,
  onUpdateSchedule
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'webhook_inspector' | 'line_setup'>('simulator');
  const [copied, setCopied] = useState(false);
  const [inputText, setInputText] = useState('');
  const [lastWebhookPayload, setLastWebhookPayload] = useState<any>(null);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial chat state
  const [messages, setMessages] = useState<LineChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: `สวัสดีครับคุณ ${schedule.lineDisplayName || 'ผู้อ่าน'}! 📚\n\nยินดีต้อนรับสู่ Tsundoku Killer Bot ผมเชื่อมต่อกับระบบของคุณเรียบร้อยแล้ว\n\nเมื่อถึงเวลา ${schedule.reminderTime} น. ในวันแจ้งเตือน ผมจะส่งข้อความสะกิดพร้อม Quick Reply ให้คุณตอบกลับได้ใน 1 วินาทีครับ`,
      timestamp: '19:59'
    },
    {
      id: 'msg-2',
      sender: 'bot',
      text: `⏰ [แจ้งเตือนเวลาอ่านประจำวัน]\n\nถึงเวลาอ่านหนังสือแล้วครับ! 📖\nเล่มเป้าหมาย: "${activeBook?.title || 'Atomic Habits'}"\nเป้าหมายคืนนี้: ${schedule.targetPagesPerDay} หน้า (หน้า ${(activeBook?.currentPage || 184) + 1} - ${(activeBook?.currentPage || 184) + schedule.targetPagesPerDay})\nStreak ปัจจุบัน: 🔥 7 วันต่อเนื่อง\n\nพร้อมแล้วเลือก Action ได้เลยครับ:`,
      timestamp: '20:00',
      quickReplies: [
        { label: '📖 เริ่มอ่านเลย!', action: 'start_reading', data: 'start_reading' },
        { label: '⏱️ ขอเลื่อน 30 นาที', action: 'snooze', data: 'snooze' },
        { label: '🛋️ วันนี้ขอพัก', action: 'rest_today', data: 'rest_today' },
        { label: '⚡ บันทึก 15 หน้า', action: 'quick_log', data: 'quick_log' }
      ]
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';
  const webhookUrl = `${currentOrigin}/api/webhook/line`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendUserMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const userMsg: LineChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputText('');

    // Prepare simulated LINE event
    const simulatedEvent = {
      replyToken: 'nHuyWiB7yP5Zw52FIkcQobQuGDXCTA',
      type: 'message',
      mode: 'active',
      timestamp: Date.now(),
      source: {
        type: 'user',
        userId: schedule.lineUserId || 'U91a82fbc789e02341bcae5102'
      },
      message: {
        id: '325708',
        type: 'text',
        text: textToSend
      }
    };

    setLastWebhookPayload({
      destination: 'U_tsundoku_bot',
      events: [simulatedEvent]
    });

    try {
      const res = await fetch('/api/simulate/line-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: simulatedEvent })
      });
      const data = await res.json();
      
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: data.botReply || 'รับทราบครับผม!',
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            quickReplies: [
              { label: '📖 เริ่มอ่านเลย!', action: 'start_reading', data: 'start_reading' },
              { label: '⏱️ ขอเลื่อน 30 นาที', action: 'snooze', data: 'snooze' },
              { label: '🛋️ วันนี้ขอพัก', action: 'rest_today', data: 'rest_today' },
              { label: '⚡ บันทึก 15 หน้า', action: 'quick_log', data: 'quick_log' }
            ]
          }
        ]);
        if (data.log) {
          setWebhookLogs(prev => [data.log, ...prev]);
        }
      }, 500);
    } catch {
      // Fallback local reply
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: 'รับทราบข้อความครับ! ผมได้ตรวจสอบเป้าหมายการอ่านของคุณเรียบร้อยแล้ว ✨',
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 500);
    }
  };

  const handleQuickReplyAction = async (action: string, label: string) => {
    // 1. Append user's action message
    const userMsg: LineChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: label,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    // 2. Create simulated postback event
    const postbackPayload = {
      replyToken: 'postback_token_' + Date.now(),
      type: 'postback',
      source: {
        userId: schedule.lineUserId
      },
      postback: {
        data: JSON.stringify({
          action: action,
          book: activeBook?.title || 'Atomic Habits',
          targetPages: schedule.targetPagesPerDay,
          timestamp: Date.now()
        })
      }
    };

    setLastWebhookPayload({
      destination: 'U_tsundoku_bot',
      events: [postbackPayload]
    });

    // 3. Side effects in application state
    if (action === 'quick_log') {
      if (activeBook) {
        onQuickLogPages(activeBook, 15);
      }
      confetti({ particleCount: 50, spread: 60 });
    } else if (action === 'start_reading') {
      // User is reading
    } else if (action === 'snooze') {
      // Snooze timer
    }

    // 4. Send to server simulator endpoint
    try {
      const res = await fetch('/api/simulate/line-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: postbackPayload })
      });
      const data = await res.json();

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: data.botReply || 'บันทึกเรียบร้อยครับ!',
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            quickReplies: action === 'start_reading' ? [
              { label: '⚡ บันทึก 15 หน้า', action: 'quick_log', data: 'quick_log' },
              { label: '✅ อ่านเสร็จตามเป้าแล้ว', action: 'quick_log', data: 'quick_log' }
            ] : undefined
          }
        ]);
        if (data.log) {
          setWebhookLogs(prev => [data.log, ...prev]);
        }
      }, 400);
    } catch {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            text: 'รับทราบ Action เรียบร้อยครับ! ข้อมูลถูกอัปเดตลง Database แล้ว ✨',
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 400);
    }
  };

  const handleTriggerPushNotification = () => {
    const pushMsg: LineChatMessage = {
      id: 'push-' + Date.now(),
      sender: 'bot',
      text: `🔔 [Push Alert ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}]\n\nคุณ ${schedule.lineDisplayName} ครับ! ถึงเวลาทำภารกิจทลายกองดองแล้วครับ\n\nหนังสือ: "${activeBook?.title || 'Atomic Habits'}"\nเป้าหมาย: ${schedule.targetPagesPerDay} หน้า\n\nพร้อมลุยเลยไหมครับ? 📚`,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        { label: '📖 เริ่มอ่านเลย!', action: 'start_reading', data: 'start_reading' },
        { label: '⏱️ ขอเลื่อน 30 นาที', action: 'snooze', data: 'snooze' },
        { label: '🛋️ วันนี้ขอพัก', action: 'rest_today', data: 'rest_today' },
        { label: '⚡ บันทึก 15 หน้า', action: 'quick_log', data: 'quick_log' }
      ]
    };
    setMessages(prev => [...prev, pushMsg]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#06C755] flex items-center justify-center text-white font-bold text-sm shadow">
              LINE
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">LINE Messaging API Simulator</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  LIVE SIMULATION
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                จำลองการแจ้งเตือนและการตอบกลับด้วย Quick Reply แบบสองทาง (Interactive Webhook)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View switcher tabs */}
            <div className="hidden sm:flex items-center bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs">
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === 'simulator' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                📱 หน้าจอแชท LINE
              </button>
              <button
                onClick={() => setActiveTab('webhook_inspector')}
                className={`px-3 py-1 rounded-md transition flex items-center space-x-1 ${
                  activeTab === 'webhook_inspector' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3 h-3 text-sky-400" />
                <span>Payload & Logs</span>
              </button>
              <button
                onClick={() => setActiveTab('line_setup')}
                className={`px-3 py-1 rounded-md transition flex items-center space-x-1 ${
                  activeTab === 'line_setup' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>การต่อของจริง</span>
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

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Main Content Area */}
          {activeTab === 'simulator' && (
            <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
              
              {/* Left Column: Simulated Phone Interface */}
              <div className="flex-1 bg-neutral-950 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
                
                {/* Phone Mockup Frame */}
                <div className="w-full max-w-sm h-[580px] bg-[#1a1a1a] rounded-[36px] border-4 border-neutral-700 shadow-2xl flex flex-col overflow-hidden relative">
                  
                  {/* Phone Speaker Notch */}
                  <div className="w-28 h-4 bg-neutral-800 rounded-b-xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                    <div className="w-10 h-1 bg-neutral-600 rounded-full"></div>
                  </div>

                  {/* LINE App Header */}
                  <div className="bg-[#242424] px-4 pt-6 pb-3 border-b border-neutral-700/60 flex items-center justify-between text-white shrink-0">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs relative">
                        <span>TK</span>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#06C755] absolute -bottom-0.5 -right-0.5 border border-black"></div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold text-xs text-white">Tsundoku Concierge</span>
                          <span className="w-3 h-3 rounded-full bg-[#06C755] text-[8px] flex items-center justify-center text-white">✓</span>
                        </div>
                        <span className="text-[9px] text-emerald-400 font-mono">Official Account</span>
                      </div>
                    </div>

                    <button
                      onClick={handleTriggerPushNotification}
                      className="px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 flex items-center space-x-1 border border-neutral-700 transition"
                      title="ยิง Push Notification จำลอง"
                    >
                      <Bell className="w-3 h-3 text-amber-400" />
                      <span>ส่ง Push</span>
                    </button>
                  </div>

                  {/* LINE Chat Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#121212]">
                    <div className="text-center my-1">
                      <span className="text-[9px] font-mono bg-neutral-800/80 text-neutral-400 px-2 py-0.5 rounded-full">
                        วันนี้ {new Date().toLocaleDateString('th-TH')}
                      </span>
                    </div>

                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-end space-x-1.5 max-w-[85%]">
                          {msg.sender === 'user' && (
                            <span className="text-[9px] text-neutral-500 font-mono mb-0.5">
                              {msg.timestamp}
                            </span>
                          )}

                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-sm ${
                              msg.sender === 'user'
                                ? 'bg-[#06C755] text-black font-medium rounded-tr-none'
                                : 'bg-[#262626] text-white border border-neutral-700/60 rounded-tl-none'
                            }`}
                          >
                            {msg.text}
                          </div>

                          {msg.sender === 'bot' && (
                            <span className="text-[9px] text-neutral-500 font-mono mb-0.5">
                              {msg.timestamp}
                            </span>
                          )}
                        </div>

                        {/* LINE Quick Reply Pills inside chat */}
                        {msg.quickReplies && (
                          <div className="mt-2.5 w-full overflow-x-auto pb-1 flex items-center space-x-1.5">
                            {msg.quickReplies.map((qr, qIdx) => (
                              <button
                                key={qIdx}
                                onClick={() => handleQuickReplyAction(qr.action, qr.label)}
                                className="px-2.5 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-emerald-500/50 text-emerald-300 text-[11px] font-medium transition whitespace-nowrap shadow-sm active:scale-95 shrink-0 cursor-pointer"
                              >
                                {qr.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* LINE Quick Reply Action Tray (Sticky Bottom Bar) */}
                  <div className="bg-[#1e1e1e] p-2 border-t border-neutral-800 shrink-0">
                    <div className="flex items-center space-x-1 mb-1.5 overflow-x-auto pb-0.5">
                      <button
                        onClick={() => handleQuickReplyAction('start_reading', '📖 เริ่มอ่านเลย!')}
                        className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-full text-[10px] whitespace-nowrap transition cursor-pointer"
                      >
                        📖 เริ่มอ่านเลย!
                      </button>
                      <button
                        onClick={() => handleQuickReplyAction('snooze', '⏱️ ขอเลื่อน 30 นาที')}
                        className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-full text-[10px] whitespace-nowrap transition cursor-pointer"
                      >
                        ⏱️ ขอเลื่อน 30 นาที
                      </button>
                      <button
                        onClick={() => handleQuickReplyAction('rest_today', '🛋️ วันนี้ขอพัก')}
                        className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-full text-[10px] whitespace-nowrap transition cursor-pointer"
                      >
                        🛋️ วันนี้ขอพัก
                      </button>
                      <button
                        onClick={() => handleQuickReplyAction('quick_log', '⚡ บันทึก 15 หน้า')}
                        className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded-full text-[10px] whitespace-nowrap transition cursor-pointer"
                      >
                        ⚡ บันทึก 15 หน้า
                      </button>
                    </div>

                    {/* Chat input box */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendUserMessage();
                      }}
                      className="flex items-center space-x-1.5"
                    >
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="พิมพ์ข้อความคุยกับบอท (เช่น 'สถานะ')..."
                        className="flex-1 bg-neutral-900 border border-neutral-700 text-white rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="submit"
                        className="w-7 h-7 rounded-full bg-[#06C755] hover:bg-emerald-500 text-black flex items-center justify-center transition shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                </div>

              </div>

              {/* Right Column: Interaction Explanation & Live Sync Indicators */}
              <div className="w-full md:w-80 bg-neutral-900 p-5 border-t md:border-t-0 md:border-l border-neutral-800 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-mono text-neutral-400">
                      LINE Quick Reply Mechanism
                    </h4>
                    <p className="text-sm font-bold text-white mt-1">
                      ระบบลดแรงเสียดทาน (Zero Friction)
                    </p>
                  </div>

                  <div className="space-y-3 text-xs text-neutral-300">
                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                      <div className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                        <span>1. [📖 เริ่มอ่านเลย!]</span>
                      </div>
                      <p className="text-neutral-400 leading-relaxed text-[11px]">
                        ส่ง <code>action: start_reading</code> ไปยัง Webhook ระบบเริ่มนับเวลา และอัปเดตสถานะหนังสือเป็น In-Progress ทันที
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                      <div className="font-semibold text-amber-400 flex items-center space-x-1.5">
                        <span>2. [⏱️ ขอเลื่อน 30 นาที]</span>
                      </div>
                      <p className="text-neutral-400 leading-relaxed text-[11px]">
                        ส่ง <code>action: snooze</code> ระบบสร้าง Task ดีเลย์ 30 นาทีเพื่อเตือนใหม่อีกครั้งโดยไม่ขัดจังหวะผู้ใช้
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                      <div className="font-semibold text-sky-400 flex items-center space-x-1.5">
                        <span>3. [🛋️ วันนี้ขอพัก]</span>
                      </div>
                      <p className="text-neutral-400 leading-relaxed text-[11px]">
                        ส่ง <code>action: rest_today</code> บันทึกวันพักผ่อน (Rest Day) ระบบจะไม่หัก Streak และบอทจะให้กำลังใจอย่างสุภาพ
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                      <div className="font-semibold text-emerald-300 flex items-center space-x-1.5">
                        <span>4. [⚡ บันทึก 15 หน้า]</span>
                      </div>
                      <p className="text-neutral-400 leading-relaxed text-[11px]">
                        เพิ่มหน้าใน Database ทันที +15 หน้า บันทึกลงตาราง <code>reading_logs</code> และรันคำนวณ % กองดองใหม่
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800">
                  <button
                    onClick={() => setActiveTab('webhook_inspector')}
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-mono font-medium transition flex items-center justify-center space-x-1.5 border border-neutral-700"
                  >
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span>ดู Webhook Payload JSON</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Webhook Inspector Tab */}
          {activeTab === 'webhook_inspector' && (
            <div className="flex-1 p-5 overflow-y-auto bg-neutral-950 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">LINE Messaging API Webhook Inspector</h4>
                  <p className="text-xs text-neutral-400">ตรวจสอบโครงสร้าง JSON ที่ LINE ส่งมายัง Backend Endpoint</p>
                </div>
                <button
                  onClick={() => setActiveTab('simulator')}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  ← กลับหน้าจำลองแชท
                </button>
              </div>

              {/* Endpoint bar */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[11px] font-bold">
                    POST
                  </span>
                  <span className="font-mono text-xs text-neutral-200">
                    /api/webhook/line
                  </span>
                </div>
                <button
                  onClick={copyWebhookUrl}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center space-x-1 transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอก URL'}</span>
                </button>
              </div>

              {/* Payload code viewer */}
              <div>
                <span className="text-xs font-mono text-neutral-400 block mb-1">
                  ตัวอย่าง Payload ล่าสุด (Event Data):
                </span>
                <pre className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-200 overflow-x-auto leading-relaxed">
                  {JSON.stringify(lastWebhookPayload || {
                    destination: "U_tsundoku_bot_id",
                    events: [
                      {
                        replyToken: "0f3779f29b3b4520aa84b5d63141f50f",
                        type: "postback",
                        mode: "active",
                        timestamp: Date.now(),
                        source: {
                          type: "user",
                          userId: schedule.lineUserId || "U91a82fbc789e02341bcae5102"
                        },
                        postback: {
                          data: "{\"action\":\"start_reading\",\"book\":\"Atomic Habits\",\"timestamp\":1726747200000}"
                        }
                      }
                    ]
                  }, null, 2)}
                </pre>
              </div>

              {/* Event Logs */}
              <div>
                <h5 className="text-xs font-mono text-neutral-400 mb-2">ประวัติการรับ Event (Log Stream):</h5>
                {webhookLogs.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">ยังไม่มี Event ใหม่ ให้ลองกด Quick Reply ในหน้าจำลองแชท</p>
                ) : (
                  <div className="space-y-2">
                    {webhookLogs.map((log) => (
                      <div key={log.id} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 font-bold">{log.eventType}</span>
                          <span className="text-neutral-400">Action: {log.quickReplyAction || 'text'}</span>
                        </div>
                        <span className="text-neutral-500 text-[10px]">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* LINE Setup Guide Tab */}
          {activeTab === 'line_setup' && (
            <div className="flex-1 p-6 overflow-y-auto bg-neutral-950 space-y-6">
              <div>
                <h4 className="text-base font-bold text-white">ขั้นตอนเชื่อมต่อกับ LINE Official Account ของจริง</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  คู่มือสำหรับนักพัฒนาในการผูก Webhook URL และนำ Channel Token มาใช้งานใน Production
                </p>
              </div>

              <div className="space-y-4 text-xs text-neutral-300">
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center space-x-2 text-white font-semibold">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-xs">1</span>
                    <span>ตั้งค่า Webhook URL ใน LINE Developers Console</span>
                  </div>
                  <p className="text-neutral-400">
                    เข้าสู่ <a href="https://developers.line.biz" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">LINE Developers Console</a> &gt; Messaging API &gt; Webhook settings แล้ววาง URL นี้:
                  </p>
                  <div className="flex items-center space-x-2 p-2 rounded bg-neutral-950 border border-neutral-800 font-mono text-neutral-200">
                    <span className="flex-1 truncate">{webhookUrl}</span>
                    <button
                      onClick={copyWebhookUrl}
                      className="px-2 py-1 bg-neutral-800 text-white rounded text-[11px] hover:bg-neutral-700"
                    >
                      {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-400">
                    * สำคัญ: ต้องเปิดสวิตช์ "Use Webhook" ให้เป็น Enabled
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center space-x-2 text-white font-semibold">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-xs">2</span>
                    <span>ใส่ Channel Secrets ใน Environment Variables</span>
                  </div>
                  <p className="text-neutral-400">
                    คัดลอกค่าจาก LINE Console มาใส่ในไฟล์ <code>.env</code> หรือ Secret Settings:
                  </p>
                  <pre className="p-3 rounded bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-300">
                    LINE_CHANNEL_ID="your_channel_id"<br/>
                    LINE_CHANNEL_SECRET="your_channel_secret"<br/>
                    LINE_CHANNEL_ACCESS_TOKEN="your_channel_access_token"
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center space-x-2 text-white font-semibold">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-xs">3</span>
                    <span>ปิด Auto-Reply ใน LINE Official Account Manager</span>
                  </div>
                  <p className="text-neutral-400">
                    ไปที่ account.line.biz &gt; Settings &gt; Response settings &gt; ปิด "Auto-response messages" และเปิด "Webhook" เพื่อให้เซิร์ฟเวอร์ตอบกลับได้อย่างราบรื่น
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
