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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Gamification & System Analytics</h3>
              <p className="text-xs text-neutral-400">เหรียญตราความสำเร็จ, สถิติการอ่าน และธีมปลดล็อก</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs">
              <button
                onClick={() => setActiveTab('badges')}
                className={`px-3 py-1 rounded-md transition ${activeTab === 'badges' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
              >
                🏅 เหรียญตรา
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3 py-1 rounded-md transition ${activeTab === 'stats' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
              >
                📊 สถิติรายเดือน
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`px-3 py-1 rounded-md transition ${activeTab === 'rewards' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
              >
                🎨 ปลดล็อกธีม UI
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Badges */}
        {activeTab === 'badges' && (
          <div className="p-6 overflow-y-auto space-y-5 bg-neutral-950/60 flex-1">
            {/* Streak banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold font-mono text-white">{streakCount} วันต่อเนื่อง</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                      HOT STREAK
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    อ่านอีก 23 วันเพื่อปลดล็อกเหรียญ "Habit Immortal 30 วัน"
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-xs text-neutral-400">ปลดล็อกแล้ว</div>
                <div className="text-base font-mono font-bold text-white">
                  {badges.filter(b => b.unlocked).length} / {badges.length} เหรียญ
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-xl border transition flex items-start space-x-3 ${
                    b.unlocked
                      ? 'bg-neutral-900/90 border-neutral-700 shadow-sm'
                      : 'bg-neutral-950/40 border-neutral-800/80 opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    b.unlocked ? 'bg-neutral-800 border border-neutral-600 text-amber-400' : 'bg-neutral-900 text-neutral-600'
                  }`}>
                    {b.unlocked ? <Crown className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{b.nameTh}</h4>
                      {b.unlocked ? (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ปลดล็อกแล้ว</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-500">
                          {b.currentCount} / {b.requiredCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                      {b.description}
                    </p>
                    {b.unlockedAt && (
                      <span className="text-[9px] font-mono text-neutral-500 mt-1 block">
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
          <div className="p-6 overflow-y-auto space-y-5 bg-neutral-950/60 flex-1 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400">หน้าที่อ่านสะสมทั้งหมด</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {totalPages.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-400">+60 หน้าในสัปดาห์นี้</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400">หนังสือที่อ่านจบแล้ว</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {completedCount} เล่ม
                </div>
                <span className="text-[10px] text-neutral-400">จากกองดอง {books.length} เล่ม</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-400">ความเร็วเฉลี่ย</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  21.5
                </div>
                <span className="text-[10px] text-neutral-400">หน้า/วัน</span>
              </div>
            </div>

            {/* Reading Velocity chart mockup */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-white">ประวัติการอ่านย้อนหลัง 7 วัน</span>
                <span className="text-[10px] font-mono text-neutral-400">เป้าหมาย 20 หน้า/วัน</span>
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
                    <span className="text-[9px] font-mono text-neutral-400">{item.pages}p</span>
                    <div className="w-6 bg-neutral-800 rounded-t overflow-hidden flex flex-col justify-end h-20">
                      <div
                        className="bg-neutral-100 rounded-t w-full transition-all"
                        style={{ height: `${(item.pages / 30) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Reward Themes */}
        {activeTab === 'rewards' && (
          <div className="p-6 overflow-y-auto space-y-4 bg-neutral-950/60 flex-1">
            <div>
              <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400">
                Luxury Theme Unlocker
              </h4>
              <p className="text-sm font-bold text-white mt-0.5">
                ปลดล็อกรูปลักษณ์อินเทอร์เฟซพรีเมียมเมื่ออัตราทลายกองดองสูงขึ้น
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((theme) => {
                const isCurrent = currentTheme === theme.id;
                return (
                  <div
                    key={theme.id}
                    className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                      theme.isUnlocked
                        ? isCurrent
                          ? 'bg-neutral-900 border-white ring-1 ring-white'
                          : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                        : 'bg-neutral-950/40 border-neutral-800/60 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3 h-3 rounded-full border border-black"
                            style={{ backgroundColor: theme.accentColor }}
                          />
                          <span className="text-xs font-bold text-white">{theme.name}</span>
                        </div>
                        {theme.isUnlocked ? (
                          isCurrent ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-neutral-950 font-bold">
                              กำลังใช้งาน
                            </span>
                          ) : (
                            <button
                              onClick={() => onSelectTheme(theme.id)}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                            >
                              เลือกใช้ธีมนี้
                            </button>
                          )
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-500 flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>{theme.unlockRequirement}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400">{theme.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-500 flex items-center justify-between">
                      <span>เงื่อนไข: {theme.unlockRequirement}</span>
                      <span className="font-mono">{theme.isUnlocked ? 'READY' : 'LOCKED'}</span>
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
