import React, { useState } from 'react';
import { UserSchedule, Book } from '../../types';
import { 
  Users, Search, Bell, Flame, BookOpen, 
  CheckCircle2, Clock, Send, ShieldCheck, 
  ExternalLink, UserCheck, MessageSquare 
} from 'lucide-react';

interface AdminUsersTabProps {
  schedule: UserSchedule;
  books: Book[];
  onTriggerTestNotification: (userDisplayName: string, bookTitle: string) => void;
}

interface MockUser {
  id: string;
  lineUserId: string;
  displayName: string;
  avatarBg: string;
  activeBookTitle: string;
  currentPage: number;
  totalPages: number;
  streak: number;
  reminderTime: string;
  status: 'active' | 'snoozed' | 'idle';
  lastActive: string;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  schedule,
  books,
  onTriggerTestNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'snoozed'>('all');
  const [notificationSentUser, setNotificationSentUser] = useState<string | null>(null);

  // Active book from store
  const activeBook = books.find(b => b.id === schedule.activeBookId) || books[0];

  // User list with the real user + realistic LINE subscriber entries
  const usersList: MockUser[] = [
    {
      id: 'usr-current',
      lineUserId: schedule.lineUserId || 'U849204859aef902b',
      displayName: schedule.lineDisplayName || 'ผู้อ่านปัจจุบัน (Current User)',
      avatarBg: 'bg-emerald-600',
      activeBookTitle: activeBook?.title || 'Atomic Habits',
      currentPage: activeBook?.currentPage || 184,
      totalPages: activeBook?.totalPages || 320,
      streak: 7,
      reminderTime: schedule.reminderTime || '20:00',
      status: schedule.lineConnected ? 'active' : 'idle',
      lastActive: 'เมื่อสักครู่',
    },
    {
      id: 'usr-02',
      lineUserId: 'U992019481239f88c',
      displayName: 'Kittisak Bookslover',
      avatarBg: 'bg-sky-600',
      activeBookTitle: 'Thinking, Fast and Slow',
      currentPage: 85,
      totalPages: 499,
      streak: 12,
      reminderTime: '21:30',
      status: 'active',
      lastActive: '12 นาทีที่แล้ว',
    },
    {
      id: 'usr-03',
      lineUserId: 'U118274028347da31',
      displayName: 'Praewphailin N.',
      avatarBg: 'bg-purple-600',
      activeBookTitle: 'จิตวิทยาว่าด้วยเงิน (Psychology of Money)',
      currentPage: 140,
      totalPages: 240,
      streak: 3,
      reminderTime: '20:00',
      status: 'snoozed',
      lastActive: '3 ชั่วโมงที่แล้ว',
    },
    {
      id: 'usr-04',
      lineUserId: 'U559281726354b01e',
      displayName: 'Thanaphat Dev',
      avatarBg: 'bg-amber-600',
      activeBookTitle: 'Clean Code: A Handbook',
      currentPage: 310,
      totalPages: 464,
      streak: 18,
      reminderTime: '19:00',
      status: 'active',
      lastActive: 'เมื่อวานนี้',
    },
    {
      id: 'usr-05',
      lineUserId: 'U773829104829cc19',
      displayName: 'Siriporn Bookworm',
      avatarBg: 'bg-rose-600',
      activeBookTitle: 'The Courage to be Disliked',
      currentPage: 45,
      totalPages: 280,
      streak: 1,
      reminderTime: '22:00',
      status: 'idle',
      lastActive: '3 วันที่แล้ว',
    },
  ];

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.lineUserId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.activeBookTitle.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && u.status === filterStatus;
  });

  const handleSendReminder = (user: MockUser) => {
    onTriggerTestNotification(user.displayName, user.activeBookTitle);
    setNotificationSentUser(user.id);
    setTimeout(() => setNotificationSentUser(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>สมาชิก &amp; ผู้ใช้งาน LINE Bot</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-neutral-800 text-neutral-300">
              {filteredUsers.length} รายการ
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            ตรวจสอบรายชื่อผู้ใช้ที่เชื่อมต่อ Webhook, สถานะเป้าหมายการอ่าน และส่งการแจ้งเตือนสะกิดรายบุคคล
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, User ID, ชื่อหนังสือ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 w-56"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center p-0.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg transition ${filterStatus === 'all' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'}`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-2.5 py-1 rounded-lg transition ${filterStatus === 'active' ? 'bg-neutral-800 text-emerald-400 font-medium' : 'text-neutral-400'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('snoozed')}
              className={`px-2.5 py-1 rounded-lg transition ${filterStatus === 'snoozed' ? 'bg-neutral-800 text-amber-400 font-medium' : 'text-neutral-400'}`}
            >
              Snoozed
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl bg-neutral-900/70 border border-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 font-medium">
              <tr>
                <th className="py-3 px-4">สมาชิก LINE</th>
                <th className="py-3 px-4">หนังสือที่กำลังอ่าน</th>
                <th className="py-3 px-4">ความคืบหน้า</th>
                <th className="py-3 px-4">Streak</th>
                <th className="py-3 px-4">เวลาแจ้งเตือน</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">ดำเนินการ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredUsers.map((user) => {
                const progress = Math.round((user.currentPage / user.totalPages) * 100);
                const isSent = notificationSentUser === user.id;

                return (
                  <tr key={user.id} className="hover:bg-neutral-850/40 transition">
                    {/* User Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full ${user.avatarBg} text-white font-bold flex items-center justify-center text-xs shadow-sm`}>
                          {user.displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center space-x-1.5">
                            <span>{user.displayName}</span>
                            {user.id === 'usr-current' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                                คุณ
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-[10px] text-neutral-500 mt-0.5">
                            {user.lineUserId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Book */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 text-neutral-200">
                        <BookOpen className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                        <span className="font-medium truncate max-w-[180px]">{user.activeBookTitle}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {user.currentPage} / {user.totalPages} หน้า
                      </span>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3.5 px-4 w-36">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono text-neutral-300">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1 text-amber-400 font-mono font-semibold">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{user.streak} วัน</span>
                      </div>
                    </td>

                    {/* Reminder */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1 text-neutral-300 font-mono">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        <span>{user.reminderTime} น.</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {user.status === 'active' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>เปิดรับแจ้งเตือน</span>
                        </span>
                      )}
                      {user.status === 'snoozed' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800/60 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          <span>เลื่อนชั่วคราว</span>
                        </span>
                      )}
                      {user.status === 'idle' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] bg-neutral-800 text-neutral-400 font-medium">
                          <span>ยังไม่ตอบรับ</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleSendReminder(user)}
                        disabled={isSent}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                          isSent 
                            ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-600'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                        }`}
                      >
                        {isSent ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>สะกิดแล้ว!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3 text-sky-400" />
                            <span>สะกิดอ่าน (Push)</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-neutral-950/40 border-t border-neutral-800 text-xs text-neutral-500 flex items-center justify-between">
          <span>แสดง {filteredUsers.length} จาก {usersList.length} ผู้ใช้ในระบบจำลอง</span>
          <span className="font-mono text-[11px]">Webhook Endpoint: /api/line/webhook</span>
        </div>
      </div>
    </div>
  );
};
