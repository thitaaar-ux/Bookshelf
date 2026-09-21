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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Smart Scheduler & LINE Binding</h3>
              <p className="text-xs text-neutral-400">กำหนดเป้าหมายการอ่านและวัน-เวลาแจ้งเตือน</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          
          {/* LINE Binding Section */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-[#06C755]" />
                <span className="font-semibold text-white">LINE Account Linkage</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                lineConnected ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-neutral-800 text-neutral-400'
              }`}>
                {lineConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">LINE Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white font-mono focus:outline-none focus:border-neutral-600"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">LINE User ID (Stub)</label>
                <input
                  type="text"
                  readOnly
                  value={schedule.lineUserId}
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 font-mono text-[11px] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-neutral-400">อนุญาตให้ส่ง Push Notifications ผ่าน LINE</span>
              <button
                type="button"
                onClick={() => setLineConnected(!lineConnected)}
                className={`w-10 h-5 rounded-full transition relative ${lineConnected ? 'bg-emerald-600' : 'bg-neutral-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition ${lineConnected ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Target Book */}
          <div>
            <label className="block font-medium text-neutral-300 mb-1.5">
              หนังสือเล่มหลักที่ผูกกับระบบแจ้งเตือน (Active Book)
            </label>
            <select
              value={activeBookId}
              onChange={(e) => setActiveBookId(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-neutral-600"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.coverEmoji || '📖'} {b.title} ({b.currentPage}/{b.totalPages} หน้า)
                </option>
              ))}
            </select>
          </div>

          {/* Days selector */}
          <div>
            <label className="block font-medium text-neutral-300 mb-2">
              เลือกวันแจ้งเตือนประจำสัปดาห์ (Reminder Days)
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {daysList.map((day) => {
                const isSelected = reminderDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`py-2 rounded-xl text-center font-medium transition cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-100 text-neutral-950 font-bold shadow-sm'
                        : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:border-neutral-700'
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-300 mb-1">
                เวลาส่งแจ้งเตือนใน LINE
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:border-neutral-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-300 mb-1">
                เป้าหมายการอ่าน (หน้า/วัน)
              </label>
              <div className="relative">
                <Target className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={targetPages}
                  onChange={(e) => setTargetPages(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-mono focus:outline-none focus:border-neutral-600"
                />
              </div>
            </div>
          </div>

          {/* Snooze duration */}
          <div>
            <label className="block font-medium text-neutral-300 mb-1.5">
              ระยะเวลาเลื่อนการแจ้งเตือน (Snooze Interval) เมื่อกดปุ่ม Quick Reply
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSnoozeMinutes(mins)}
                  className={`py-1.5 rounded-lg border text-center font-mono transition cursor-pointer ${
                    snoozeMinutes === mins
                      ? 'bg-neutral-800 border-neutral-600 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  {mins} นาที
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-white text-neutral-950 font-semibold hover:bg-neutral-200 transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
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
