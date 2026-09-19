import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, Check, ArrowRight, User, BookOpen } from 'lucide-react';
import { Book, UserSchedule } from '../types';

interface ConciergeChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  schedule: UserSchedule;
  onApplyGoalRecommendation: (pages: number, time: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'concierge' | 'user';
  text: string;
  timestamp: string;
  actionableGoal?: {
    pages: number;
    time: string;
  };
}

export const ConciergeChatModal: React.FC<ConciergeChatModalProps> = ({
  isOpen,
  onClose,
  books,
  schedule,
  onApplyGoalRecommendation
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'concierge',
      text: 'สวัสดีครับคุณผู้ใช้ ผมคือ "Tsundoku Concierge" ผู้ช่วยส่วนตัวของคุณครับ 🎩\n\nแทนที่จะต้องกรอกแบบฟอร์มยาวๆ เรามาคุยกันสั้นๆ สัก 2-3 ประโยคเพื่อวางแผนทลายกองดองที่สบายตัวที่สุดกันครับ\n\nตอนนี้มีหนังสือเล่มไหนที่คุณหยิบขึ้นมาบ่อยที่สุด หรืออยากพิชิตให้จบเป็นเล่มแรกครับ?',
      timestamp: 'เมื่อสักครู่'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const quickPrompts = [
    'อยากเริ่มอ่านวันละ 15 หน้า ช่วง 21:00 น.',
    'มีกองดอง 2 เล่ม ควรจัดคิวยังไงดี?',
    'วันนี้ยุ่งมาก กลัวอ่านไม่ทันเป้า',
    'ช่วยวิเคราะห์ความคืบหน้าของฉันหน่อย'
  ];

  const handleSend = async (userTextToSend?: string) => {
    const text = (userTextToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!userTextToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/concierge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          userContext: {
            readingCount: books.filter(b => b.status === 'reading').length,
            backlogCount: books.filter(b => b.status === 'backlog').length,
            completedCount: books.filter(b => b.status === 'completed').length,
            currentStreak: 7,
            targetPagesPerDay: schedule.targetPagesPerDay
          }
        })
      });

      const data = await response.json();
      const reply = data.reply || 'รับทราบครับคุณผู้ใช้ ผมพร้อมดูแลการอ่านของคุณเสมอครับ';

      // Check if user set a goal (e.g. 15 or 20 pages)
      let actionableGoal = undefined;
      const pageMatch = text.match(/(\d+)\s*หน้า/);
      const timeMatch = text.match(/(\d{1,2}[:.]\d{2})/);
      if (pageMatch) {
        actionableGoal = {
          pages: parseInt(pageMatch[1], 10),
          time: timeMatch ? timeMatch[1].replace('.', ':') : '20:00'
        };
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'concierge',
          text: reply,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          actionableGoal
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'concierge',
          text: 'ยินดีรับฟังครับ! ทุกเป้าหมายเริ่มต้นจากก้าวเล็กๆ อ่านวันละ 15 หน้า สัปดาห์ละ 100 หน้า เพียง 1 เดือนคุณจะทลายหนังสือได้มากกว่า 1-2 เล่มอย่างแน่นอนครับ ✨',
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#fdfcf8] border-2 border-[#1c1c1c] shadow-[8px_8px_0px_#1c1c1c] w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header - Variation 3 */}
        <div className="px-5 py-4 bg-[#f4f2ea] border-b-2 border-[#1c1c1c] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#1c1c1c] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4 text-[#ff4d00]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="meta text-[#ff4d00] font-bold">● BUTLER CONSULTANT</span>
                <span className="meta text-[#1c1c1c]/40">•</span>
                <span className="meta text-[#1c1c1c]">AI CONCIERGE</span>
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight text-[#1c1c1c]">
                The Reading Concierge
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#fdfcf8] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#fdfcf8]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start space-x-2.5 max-w-[88%]">
                {msg.sender === 'concierge' && (
                  <div className="w-7 h-7 bg-[#1c1c1c] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4 text-[#ff4d00]" />
                  </div>
                )}

                <div
                  className={`p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-[#1c1c1c] text-[#fdfcf8] font-medium'
                      : 'bg-[#f4f2ea] text-[#1c1c1c] border border-[#e8e6df]'
                  }`}
                >
                  {msg.text}

                  {/* Goal proposal card inside message */}
                  {msg.actionableGoal && (
                    <div className="mt-3 p-3 bg-white border border-[#1c1c1c] shadow-[2px_2px_0px_#1c1c1c] text-xs space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-[#e8e6df]">
                        <span className="meta text-[#ff4d00] font-bold">
                          🎯 GOAL RECOGNITION
                        </span>
                        <span className="font-mono text-xs text-[#1c1c1c]">
                          {msg.actionableGoal.time} น.
                        </span>
                      </div>
                      <p className="text-[#1c1c1c] font-medium">
                        อ่านวันละ <strong className="text-[#ff4d00] font-bold">{msg.actionableGoal.pages} หน้า</strong> เวลา {msg.actionableGoal.time} น.
                      </p>
                      <button
                        onClick={() => {
                          onApplyGoalRecommendation(msg.actionableGoal!.pages, msg.actionableGoal!.time);
                          alert(`ตั้งค่าเป้าหมายวันละ ${msg.actionableGoal!.pages} หน้า เรียบร้อยแล้ว!`);
                        }}
                        className="w-full py-1.5 px-3 bg-[#1c1c1c] hover:bg-[#ff4d00] text-white font-bold uppercase text-[11px] flex items-center justify-center space-x-1.5 transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>ปรับใช้เป้าหมายนี้กับระบบแจ้งเตือน LINE</span>
                      </button>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 bg-[#f4f2ea] border border-[#1c1c1c] flex items-center justify-center text-[#1c1c1c] shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
              <span className="meta text-[10px] text-[#1c1c1c]/40 font-mono mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-[#1c1c1c]/60 p-2">
              <div className="w-2 h-2 rounded-full bg-[#ff4d00] animate-pulse"></div>
              <span className="font-mono meta">Concierge กำลังวิเคราะห์...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2.5 bg-[#f4f2ea] border-t border-[#e8e6df] flex items-center space-x-2 overflow-x-auto">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 rounded-full bg-white hover:bg-[#1c1c1c] hover:text-white text-[#1c1c1c] text-[11px] whitespace-nowrap border border-[#e8e6df] transition cursor-pointer font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-[#f4f2ea] border-t-2 border-[#1c1c1c] flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์บอกความตั้งใจ เช่น 'อยากอ่าน 20 หน้าตอนสองทุ่ม'..."
            className="flex-1 px-4 py-2 bg-white border border-[#1c1c1c] text-xs sm:text-sm text-[#1c1c1c] focus:outline-none focus:ring-2 focus:ring-[#ff4d00] transition"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-2 bg-[#1c1c1c] hover:bg-[#ff4d00] disabled:opacity-40 text-[#fdfcf8] font-bold uppercase text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <span>ส่ง</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
