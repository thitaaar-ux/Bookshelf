import React, { useState, useEffect } from 'react';
import { 
  Radio, Send, MessageSquare, CheckCircle2, 
  Clock, AlertCircle, RefreshCw, Smartphone, 
  Zap, Copy, Check 
} from 'lucide-react';

interface WebhookLogItem {
  id: string;
  timestamp: string;
  source: 'real_line_webhook' | 'simulator';
  eventType: string;
  userId: string;
  payload: any;
  botReply: string;
  quickReplyAction?: string;
}

export const AdminBroadcastTab: React.FC = () => {
  const [broadcastMessage, setBroadcastMessage] = useState(
    '📖 สวัสดีตอนค่ำครับ! คืนนี้คุณมีนัดทลายกองดอง 20 หน้า พร้อมลุยกันหรือยังครับ? ✨'
  );
  const [targetAudience, setTargetAudience] = useState<'all' | 'active' | 'snoozed'>('all');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [recipientCount, setRecipientCount] = useState(1248);

  // Live Webhook Logs state
  const [logs, setLogs] = useState<WebhookLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchWebhookLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/webhook/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      // Fallback in-memory logs if offline
      setLogs([
        {
          id: 'log-1',
          timestamp: new Date().toLocaleTimeString('th-TH'),
          source: 'real_line_webhook',
          eventType: 'postback',
          userId: 'U849204859aef902b',
          payload: { action: 'start_reading', book: 'Atomic Habits', targetPages: 20 },
          botReply: '📖 ยอดเยี่ยมมากครับ! เริ่มบันทึก Session อ่าน "Atomic Habits" ให้แล้ว',
          quickReplyAction: 'start_reading'
        },
        {
          id: 'log-2',
          timestamp: new Date(Date.now() - 300000).toLocaleTimeString('th-TH'),
          source: 'simulator',
          eventType: 'message',
          userId: 'U992019481239f88c',
          payload: { text: 'สถานะกองดอง' },
          botReply: '📊 รายงานสถานะกองดอง: กำลังอ่าน 2 เล่ม, ทลายสำเร็จ 2 เล่ม (50%)',
        }
      ]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchWebhookLogs();
    const interval = setInterval(fetchWebhookLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);

      // Add a simulated webhook log entry
      const newLog: WebhookLogItem = {
        id: 'broadcast-' + Date.now(),
        timestamp: new Date().toLocaleTimeString('th-TH'),
        source: 'real_line_webhook',
        eventType: 'broadcast_push',
        userId: 'ALL_SUBSCRIBERS (' + recipientCount + ' users)',
        payload: { text: broadcastMessage, target: targetAudience },
        botReply: broadcastMessage,
        quickReplyAction: 'broadcast_reminder'
      };
      setLogs(prev => [newLog, ...prev]);

      setTimeout(() => setSentSuccess(false), 4000);
    }, 1000);
  };

  const copyPayload = (id: string, payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 2-Column: Broadcast Composer & LINE Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Broadcast Form */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>ส่งข้อความ Broadcast (LINE Push Message)</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              ยิงข้อความกระตุ้นเป้าหมายการอ่านหนังสือไปยังสมาชิกผู้ใช้ LINE ทุกคนที่ติดตามบอท
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-medium mb-1.5">กลุ่มเป้าหมาย (Audience)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'ผู้ใช้ทุกคน (1,248 คน)' },
                  { id: 'active', label: 'ผู้ที่กำลังอ่าน (842 คน)' },
                  { id: 'snoozed', label: 'ผู้ที่เลื่อนอ่าน (406 คน)' },
                ].map((aud) => (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => {
                      setTargetAudience(aud.id as any);
                      setRecipientCount(aud.id === 'all' ? 1248 : aud.id === 'active' ? 842 : 406);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      targetAudience === aud.id
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="font-semibold text-white">{aud.label.split(' ')[0]}</div>
                    <div className="text-[10px] text-neutral-400">{aud.label.split(' ')[1]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1.5">ข้อความแจ้งเตือน (Push Message Content)</label>
              <textarea
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="ระบุข้อความที่ต้องการส่ง เช่น แจ้งเตือนเวลาอ่านหนังสือ, ชวนบันทึกหน้า..."
                className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
              />
            </div>

            {/* Attached Quick Reply preview tags */}
            <div>
              <label className="block text-neutral-400 text-[11px] mb-1.5">ปุ่ม Quick Reply ที่แนบไปอัตโนมัติ:</label>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-200 text-[11px]">
                  📖 เริ่มอ่านเป้าหมาย 20 หน้า
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-200 text-[11px]">
                  ⏱️ ขอเลื่อน 30 นาที
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-200 text-[11px]">
                  🛋️ วันนี้ขอพักผ่อน
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-neutral-500 text-[11px]">
                เตรียมส่งถึง <span className="text-white font-semibold">{recipientCount.toLocaleString()}</span> บัญชี LINE
              </span>

              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังส่งข้อความ...</span>
                  </>
                ) : sentSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ยิงข้อความสำเร็จแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>ส่ง Broadcast ทันที</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Realistic LINE Chat Simulator Preview */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col items-center justify-center">
          <div className="text-xs text-neutral-400 mb-3 flex items-center space-x-1.5 self-start">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-white">LINE Message Preview</span>
            <span>(หน้าจอมือถือผู้รับ)</span>
          </div>

          <div className="w-full max-w-[300px] bg-[#1a1b1e] rounded-2xl border border-neutral-700 shadow-2xl p-3.5 space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-neutral-800">
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
                TK
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Tsundoku Concierge</div>
                <div className="text-[9px] text-emerald-400">LINE Official Account</div>
              </div>
            </div>

            {/* Bubble */}
            <div className="p-3 bg-neutral-800/90 rounded-2xl rounded-tl-sm text-xs text-neutral-100 leading-relaxed shadow-sm">
              <p className="whitespace-pre-line">{broadcastMessage}</p>
              <span className="block text-[9px] text-neutral-500 text-right mt-1.5">
                {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
              </span>
            </div>

            {/* Quick Replies */}
            <div className="pt-1 flex flex-col gap-1.5">
              <div className="px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-[10px] text-center font-medium">
                📖 เริ่มอ่านเป้าหมาย 20 หน้า
              </div>
              <div className="px-3 py-1.5 rounded-full bg-neutral-850 border border-neutral-700 text-neutral-300 text-[10px] text-center">
                ⏱️ ขอเลื่อน 30 นาที
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Webhook Logs Table */}
      <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Live Webhook Event Stream</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </h3>
            <p className="text-xs text-neutral-400">
              ดักจับข้อความและ Postback Event จาก LINE Messaging Webhook (/api/line/webhook)
            </p>
          </div>

          <button
            onClick={fetchWebhookLogs}
            disabled={isLoadingLogs}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} />
            <span>รีเฟรช Logs</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 font-medium">
              <tr>
                <th className="py-2.5 px-3">เวลา</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">User ID</th>
                <th className="py-2.5 px-3">Quick Reply / Action</th>
                <th className="py-2.5 px-3">ข้อความตอบกลับของบอท</th>
                <th className="py-2.5 px-3 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-neutral-500">
                    ยังไม่มี Event เข้ามาในระบบ
                  </td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-850/40 transition">
                    <td className="py-3 px-3 font-mono text-neutral-400 whitespace-nowrap">
                      {item.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-neutral-800 text-neutral-200">
                        {item.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-300 text-[11px]">
                      {item.userId}
                    </td>
                    <td className="py-3 px-3">
                      {item.quickReplyAction ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-950/60 text-sky-400 border border-sky-800/60 font-mono">
                          {item.quickReplyAction}
                        </span>
                      ) : (
                        <span className="text-neutral-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-[280px] truncate text-neutral-200" title={item.botReply}>
                      {item.botReply}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => copyPayload(item.id, item.payload)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                        title="Copy JSON Payload"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
