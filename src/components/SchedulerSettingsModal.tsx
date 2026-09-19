import React, { useState } from 'react';
import { X, Calendar, Clock, Bell, Check, ShieldCheck, Smartphone, Target } from 'lucide-react';
import { UserSchedule, Book } from '../types';

interface SchedulerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: UserSchedule;
  books: Book[];
  onSaveSchedule: (newSchedule: UserSchedule) => void;
}

export const SchedulerSettingsModal: React.FC<SchedulerSettingsModalProps> = ({
  isOpen,
  onClose,
  schedule,
  books,
  onSaveSchedule
}) => {
  const [reminderDays, setReminderDays] = useState<UserSchedule['reminderDays']>(schedule.reminderDays);
  const [reminderTime, setReminderTime] = useState(schedule.reminderTime);
  const [targetPages, setTargetPages] = useState(schedule.targetPagesPerDay);
  const [snoozeMinutes, setSnoozeMinutes] = useState(schedule.snoozeDurationMinutes);
  const [activeBookId, setActiveBookId] = useState(schedule.activeBookId);
  const [lineConnected, setLineConnected] = useState(schedule.lineConnected);
  const [displayName, setDisplayName] = useState(schedule.lineDisplayName);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const daysList: { id: UserSchedule['reminderDays'][number]; label: string; short: string }[] = [
    { id: 'mon', label: 'จันทร์', short: 'Mon' },
    { id: 'tue', label: 'อังคาร', short: 'Tue' },
    { id: 'wed', label: 'พุธ', short: 'Wed' },
    { id: 'thu', label: 'พฤหัสฯ', short: 'Thu' },
    { id: 'fri', label: 'ศุกร์', short: 'Fri' },
    { id: 'sat', label: 'เสาร์', short: 'Sat' },
    { id: 'sun', label: 'อาทิตย์', short: 'Sun' }
  ];

  const toggleDay = (dayId: UserSchedule['reminderDays'][number]) => {
    if (reminderDays.includes(dayId)) {
      if (reminderDays.length > 1) {
        setReminderDays(reminderDays.filter(d => d !== dayId));
      }
    } else {
      setReminderDays([...reminderDays, dayId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSchedule({
      ...schedule,
      reminderDays,
      reminderTime,
      targetPagesPerDay: Number(targetPages),
      snoozeDurationMinutes: Number(snoozeMinutes),
      activeBookId,
      lineConnected,
      lineDisplayName: displayName
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#fdfcf8] border-2 border-[#1c1c1c] shadow-[8px_8px_0px_#1c1c1c] w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header - Variation 3 */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#1c1c1c] mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#1c1c1c] flex items-center justify-center text-white shadow-sm">
              <Calendar className="w-4 h-4 text-[#ff4d00]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="meta text-[#ff4d00] font-bold">● PROTOCOL CRON</span>
                <span className="meta text-[#1c1c1c]/40">•</span>
                <span className="meta text-[#1c1c1c]">LINE SCHEDULER</span>
              </div>
              <h3 className="text-base font-black uppercase tracking-tight text-[#1c1c1c]">
                Smart Scheduler & Binding
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

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          
          {/* LINE Binding Section */}
          <div className="p-4 bg-[#f4f2ea] border border-[#1c1c1c] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-[#1c1c1c]" />
                <span className="meta font-extrabold text-[#1c1c1c]">LINE ACCOUNT BINDING</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                lineConnected 
                  ? 'bg-white text-[#1c1c1c] border-[#1c1c1c]' 
                  : 'bg-[#e8e6df] text-[#1c1c1c]/60 border-[#1c1c1c]/20'
              }`}>
                {lineConnected ? '● CONNECTED' : '○ DISCONNECTED'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="meta block text-[#1c1c1c] font-bold mb-1">LINE Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#1c1c1c] text-[#1c1c1c] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#ff4d00]"
                />
              </div>
              <div>
                <label className="meta block text-[#1c1c1c] font-bold mb-1">LINE User ID (Stub)</label>
                <input
                  type="text"
                  readOnly
                  value={schedule.lineUserId}
                  className="w-full px-3 py-1.5 bg-[#e8e6df] border border-[#1c1c1c]/30 text-[#1c1c1c]/70 font-mono text-[11px] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#1c1c1c]/70 font-medium">อนุญาตให้ส่ง Push Notifications ผ่าน LINE</span>
              <button
                type="button"
                onClick={() => setLineConnected(!lineConnected)}
                className={`w-10 h-5 border border-[#1c1c1c] transition relative cursor-pointer ${lineConnected ? 'bg-[#1c1c1c]' : 'bg-[#e8e6df]'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white absolute top-0.5 transition ${lineConnected ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Target Book */}
          <div>
            <label className="meta block font-bold text-[#1c1c1c] mb-1.5">
              หนังสือเล่มหลักที่ผูกกับระบบแจ้งเตือน (ACTIVE BOOK)
            </label>
            <select
              value={activeBookId}
              onChange={(e) => setActiveBookId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#1c1c1c] text-[#1c1c1c] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#ff4d00]"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.currentPage}/{b.totalPages} หน้า) - {b.status}
                </option>
              ))}
            </select>
          </div>

          {/* Days selector */}
          <div>
            <label className="meta block font-bold text-[#1c1c1c] mb-2">
              เลือกวันแจ้งเตือนประจำสัปดาห์ (REMINDER DAYS)
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {daysList.map((day) => {
                const isSelected = reminderDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`py-2 text-center transition cursor-pointer border ${
                      isSelected
                        ? 'bg-[#1c1c1c] text-[#fdfcf8] border-[#1c1c1c] font-bold shadow-xs'
                        : 'bg-[#f4f2ea] text-[#1c1c1c]/80 border-[#e8e6df] hover:border-[#1c1c1c]'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-mono">{day.short}</div>
                    <div className="text-[11px] mt-0.5">{day.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time & Daily Page Target */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="meta block font-bold text-[#1c1c1c] mb-1">
                เวลาส่งแจ้งเตือนใน LINE
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#1c1c1c]/60" />
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#1c1c1c] text-[#1c1c1c] font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]"
                />
              </div>
            </div>

            <div>
              <label className="meta block font-bold text-[#1c1c1c] mb-1">
                เป้าหมายการอ่าน (หน้า/วัน)
              </label>
              <div className="relative">
                <Target className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#1c1c1c]/60" />
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={targetPages}
                  onChange={(e) => setTargetPages(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#1c1c1c] text-[#1c1c1c] font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#ff4d00]"
                />
              </div>
            </div>
          </div>

          {/* Snooze duration */}
          <div>
            <label className="meta block font-bold text-[#1c1c1c] mb-2">
              ระยะเวลาเลื่อนการแจ้งเตือน (SNOOZE INTERVAL)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSnoozeMinutes(mins)}
                  className={`py-2 border text-center font-mono text-xs transition cursor-pointer ${
                    snoozeMinutes === mins
                      ? 'bg-[#1c1c1c] text-[#fdfcf8] border-[#1c1c1c] font-bold'
                      : 'bg-[#f4f2ea] border-[#e8e6df] text-[#1c1c1c]/80 hover:border-[#1c1c1c]'
                  }`}
                >
                  {mins} นาที
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="pt-4 border-t-2 border-[#1c1c1c] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#1c1c1c] text-xs font-bold uppercase hover:bg-[#f4f2ea] transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1c1c1c] hover:bg-[#ff4d00] text-[#fdfcf8] font-bold uppercase text-xs tracking-wider transition shadow-sm flex items-center space-x-2 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>บันทึกสำเร็จ!</span>
                </>
              ) : (
                <span>บันทึกการตั้งค่า</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
