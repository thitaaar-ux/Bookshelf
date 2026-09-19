import React, { useState } from 'react';
import { X, Award, Flame, Zap, Shield, Crown, Sparkles, CheckCircle2, Lock, Palette } from 'lucide-react';
import { Badge, Book } from '../types';

interface GamificationBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
  streakCount: number;
  books: Book[];
  currentTheme: string;
  onSelectTheme: (themeId: string) => void;
}

export const GamificationBadgesModal: React.FC<GamificationBadgesModalProps> = ({
  isOpen,
  onClose,
  badges,
  streakCount,
  books,
  currentTheme,
  onSelectTheme
}) => {
  const [activeTab, setActiveTab] = useState<'badges' | 'stats' | 'rewards'>('badges');

  if (!isOpen) return null;

  const completedCount = books.filter(b => b.status === 'completed').length;
  const totalPages = books.reduce((sum, b) => sum + (b.currentPage || 0), 0);
  const clearanceRate = books.length > 0 ? Math.round((completedCount / books.length) * 100) : 0;

  const themes = [
    {
      id: 'theme-obsidian',
      name: 'Obsidian Noir (Default)',
      description: 'คุมโทนดำมิดไนท์ เรียบหรู ตัดเส้นสายคมกริบ',
      accentColor: '#ffffff',
      isUnlocked: true,
      unlockRequirement: 'เริ่มต้นใช้งาน'
    },
    {
      id: 'theme-emerald',
      name: 'Emerald Cyber Tech',
      description: 'เส้นสายสีเขียวมรกต สไตล์ไฮเทค LINE Developer',
      accentColor: '#10b981',
      isUnlocked: clearanceRate >= 30,
      unlockRequirement: 'ทลายกองดองเกิน 30%'
    },
    {
      id: 'theme-amber',
      name: 'Obsidian Gold Luxury',
      description: 'สัมผัสความหรูหราด้วยแสงเงาทองคำแชมเปญ',
      accentColor: '#f59e0b',
      isUnlocked: clearanceRate >= 50,
      unlockRequirement: 'ทลายกองดองเกิน 50%'
    },
    {
      id: 'theme-platinum',
      name: 'Cyber Platinum Glow',
      description: 'สีเงินแพลตินัมสะท้อนแสง สำหรับผู้พิชิตกองดอง 100%',
      accentColor: '#e0e7ff',
      isUnlocked: clearanceRate === 100,
      unlockRequirement: 'ทลายกองดอง 100% ครบทุกเล่ม'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#fdfcf8] border-2 border-[#1c1c1c] shadow-[8px_8px_0px_#1c1c1c] w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header - Variation 3 */}
        <div className="px-6 py-4 bg-[#f4f2ea] border-b-2 border-[#1c1c1c] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#1c1c1c] flex items-center justify-center text-white shadow-sm">
              <Award className="w-4 h-4 text-[#ff4d00]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="meta text-[#ff4d00] font-bold">● TELEMETRY</span>
                <span className="meta text-[#1c1c1c]/40">•</span>
                <span className="meta text-[#1c1c1c]">BADGES & ANALYTICS</span>
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight text-[#1c1c1c]">
                Gamification & System Analytics
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="nav-pills hidden sm:flex items-center bg-white p-1 rounded-full border border-[#e8e6df] text-xs">
              <button
                onClick={() => setActiveTab('badges')}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${activeTab === 'badges' ? 'bg-[#1c1c1c] text-white font-bold' : 'text-[#1c1c1c]/60 hover:text-[#1c1c1c]'}`}
              >
                🏅 เหรียญตรา
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${activeTab === 'stats' ? 'bg-[#1c1c1c] text-white font-bold' : 'text-[#1c1c1c]/60 hover:text-[#1c1c1c]'}`}
              >
                📊 สถิติรายเดือน
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${activeTab === 'rewards' ? 'bg-[#1c1c1c] text-white font-bold' : 'text-[#1c1c1c]/60 hover:text-[#1c1c1c]'}`}
              >
                🎨 ปลดล็อกธีม UI
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

        {/* Tab 1: Badges */}
        {activeTab === 'badges' && (
          <div className="p-6 overflow-y-auto space-y-5 bg-[#fdfcf8] flex-1">
            {/* Streak banner */}
            <div className="p-4 bg-[#f4f2ea] border border-[#1c1c1c] shadow-[2px_2px_0px_#1c1c1c] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#1c1c1c] flex items-center justify-center text-[#ff4d00]">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-black font-mono text-[#1c1c1c]">{streakCount} วันต่อเนื่อง</span>
                    <span className="meta text-[10px] px-2 py-0.5 bg-[#ff4d00] text-white font-bold">
                      HOT STREAK
                    </span>
                  </div>
                  <p className="text-xs text-[#1c1c1c]/70 mt-0.5 font-medium">
                    อ่านอีก 23 วันเพื่อปลดล็อกเหรียญ "Habit Immortal 30 วัน"
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="meta text-xs text-[#1c1c1c]/60">ปลดล็อกแล้ว</div>
                <div className="text-base font-mono font-black text-[#1c1c1c]">
                  {badges.filter(b => b.unlocked).length} / {badges.length} เหรียญ
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 border transition flex items-start space-x-3 ${
                    b.unlocked
                      ? 'bg-white border-[#1c1c1c] shadow-[2px_2px_0px_#1c1c1c]'
                      : 'bg-[#f4f2ea] border-[#e8e6df] opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 flex items-center justify-center shrink-0 border ${
                    b.unlocked ? 'bg-[#1c1c1c] text-[#ff4d00] border-[#1c1c1c]' : 'bg-[#e8e6df] text-[#1c1c1c]/40 border-[#1c1c1c]/20'
                  }`}>
                    {b.unlocked ? <Crown className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-[#1c1c1c] truncate">{b.nameTh}</h4>
                      {b.unlocked ? (
                        <span className="meta text-[10px] font-bold text-[#ff4d00] flex items-center space-x-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ปลดล็อกแล้ว</span>
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-[#1c1c1c]/50">
                          {b.currentCount} / {b.requiredCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#1c1c1c]/70 mt-1 leading-snug font-medium">
                      {b.description}
                    </p>
                    {b.unlockedAt && (
                      <span className="meta text-[9px] text-[#1c1c1c]/50 mt-1 block">
                        ปลดล็อกเมื่อ {b.unlockedAt}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Monthly Stats */}
        {activeTab === 'stats' && (
          <div className="p-6 overflow-y-auto space-y-5 bg-[#fdfcf8] flex-1 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-white border border-[#1c1c1c] shadow-[2px_2px_0px_#1c1c1c]">
                <span className="meta text-[#1c1c1c]/60 font-bold">หน้าที่อ่านสะสมทั้งหมด</span>
                <div className="text-2xl font-black font-mono text-[#1c1c1c] mt-1">
                  {totalPages.toLocaleString()}
                </div>
                <span className="meta text-[10px] text-[#ff4d00] font-bold">+60 หน้าในสัปดาห์นี้</span>
              </div>

              <div className="p-4 bg-white border border-[#1c1c1c] shadow-[2px_2px_0px_#1c1c1c]">
                <span className="meta text-[#1c1c1c]/60 font-bold">หนังสือที่อ่านจบแล้ว</span>
                <div className="text-2xl font-black font-mono text-[#1c1c1c] mt-1">
                  {completedCount} เล่ม
                </div>
                <span className="meta text-[10px] text-[#1c1c1c]/60 font-medium">จากกองดอง {books.length} เล่ม</span>
              </div>

              <div className="p-4 bg-white border border-[#1c1c1c] shadow-[2px_2px_0px_#1c1c1c]">
                <span className="meta text-[#1c1c1c]/60 font-bold">ความเร็วเฉลี่ย</span>
                <div className="text-2xl font-black font-mono text-[#1c1c1c] mt-1">
                  21.5
                </div>
                <span className="meta text-[10px] text-[#1c1c1c]/60 font-medium">หน้า / วัน</span>
              </div>
            </div>

            {/* Reading Velocity chart mockup */}
            <div className="p-5 bg-white border border-[#1c1c1c] shadow-[3px_3px_0px_#1c1c1c]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e8e6df]">
                <div>
                  <span className="meta text-[#ff4d00] font-bold">VELOCITY METRICS</span>
                  <h4 className="font-extrabold text-sm text-[#1c1c1c]">ประวัติการอ่านย้อนหลัง 7 วัน</h4>
                </div>
                <span className="font-mono text-xs text-[#1c1c1c]">เป้าหมาย 20 หน้า/วัน</span>
              </div>
              <div className="flex items-end justify-between h-32 pt-4 px-2">
                {[
                  { day: 'จ.', pages: 20 },
                  { day: 'อ.', pages: 25 },
                  { day: 'พ.', pages: 15 },
                  { day: 'พฤ.', pages: 20 },
                  { day: 'ศ.', pages: 30 },
                  { day: 'ส.', pages: 10 },
                  { day: 'อา.', pages: 25 }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center space-y-1.5 flex-1">
                    <span className="text-[9px] font-mono font-bold text-[#1c1c1c]">{item.pages}p</span>
                    <div className="w-6 bg-[#f4f2ea] border border-[#1c1c1c] overflow-hidden flex flex-col justify-end h-20">
                      <div
                        className="bg-[#1c1c1c] w-full transition-all"
                        style={{ height: `${(item.pages / 30) * 100}%` }}
                      />
                    </div>
                    <span className="meta text-[10px] text-[#1c1c1c] font-bold">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Reward Themes */}
        {activeTab === 'rewards' && (
          <div className="p-6 overflow-y-auto space-y-4 bg-[#fdfcf8] flex-1">
            <div>
              <span className="meta text-[#ff4d00] font-bold">PALETTE & TYPOGRAPHY</span>
              <h4 className="text-base font-black uppercase text-[#1c1c1c]">
                Editorial & Brutalist Themes
              </h4>
              <p className="text-xs text-[#1c1c1c]/70 mt-0.5 font-medium">
                ปลดล็อกรูปลักษณ์อินเทอร์เฟซพรีเมียมเมื่ออัตราทลายกองดองสูงขึ้น
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((theme) => {
                const isCurrent = currentTheme === theme.id;
                return (
                  <div
                    key={theme.id}
                    className={`p-4 border transition flex flex-col justify-between ${
                      theme.isUnlocked
                        ? isCurrent
                          ? 'bg-white border-2 border-[#1c1c1c] shadow-[4px_4px_0px_#1c1c1c]'
                          : 'bg-[#f4f2ea] border border-[#1c1c1c] hover:bg-white'
                        : 'bg-[#e8e6df]/40 border border-[#1c1c1c]/20 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3.5 h-3.5 border border-[#1c1c1c]"
                            style={{ backgroundColor: theme.accentColor }}
                          />
                          <span className="text-xs font-black uppercase text-[#1c1c1c]">{theme.name}</span>
                        </div>
                        {theme.isUnlocked ? (
                          isCurrent ? (
                            <span className="meta text-[10px] px-2 py-0.5 bg-[#1c1c1c] text-white font-bold">
                              กำลังใช้งาน
                            </span>
                          ) : (
                            <button
                              onClick={() => onSelectTheme(theme.id)}
                              className="meta text-[10px] px-2 py-0.5 bg-white border border-[#1c1c1c] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-white transition cursor-pointer"
                            >
                              เลือกใช้ธีมนี้
                            </button>
                          )
                        ) : (
                          <span className="meta text-[10px] text-[#1c1c1c]/50 flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>{theme.unlockRequirement}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#1c1c1c]/70 font-medium">{theme.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#e8e6df] meta text-[10px] text-[#1c1c1c]/60 flex items-center justify-between">
                      <span>เงื่อนไข: {theme.unlockRequirement}</span>
                      <span className="font-mono font-bold text-[#1c1c1c]">{theme.isUnlocked ? 'READY' : 'LOCKED'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
