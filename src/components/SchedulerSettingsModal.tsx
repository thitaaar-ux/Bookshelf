'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Bell, Check, ShieldCheck, Smartphone, Target } from 'lucide-react';
import { UserSchedule, Book } from '../types';
import { motion, AnimatePresence } from 'motion/react';

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
    { id: 'mon', label: 'จันทร์', short: 'จ' },
    { id: 'tue', label: 'อังคาร', short: 'อ' },
    { id: 'wed', label: 'พุธ', short: 'พ' },
    { id: 'thu', label: 'พฤหัส', short: 'พฤ' },
    { id: 'fri', label: 'ศุกร์', short: 'ศ' },
    { id: 'sat', label: 'เสาร์', short: 'ส' },
    { id: 'sun', label: 'อาทิตย์', short: 'อา' }
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
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#f8f7f4] border-2 border-[#121212] w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto shadow-[12px_12px_0_#121212]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#121212] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-[#121212] bg-white flex items-center justify-center text-[#121212]">
              <Calendar className="w-4 h-4 text-[#ff4d00]" />
            </div>
            <div>
              <span className="label m-0">ตารางและการแจ้งเตือน</span>
              <h3 className="font-display text-2xl font-extrabold text-[#121212]">ตั้งเวลาแจ้งเตือนอัจฉริยะ</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 border border-[#121212] bg-white hover:bg-black hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
          
          {/* LINE Account Linkage */}
          <div className="p-4 bg-white border-2 border-[#121212] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#ff4d00]" />
                <span className="font-bold uppercase">การเชื่อมต่อบัญชี LINE</span>
              </div>
              <span className={`badge ${lineConnected ? 'bg-[#ff4d00] text-white' : 'bg-transparent text-[#121212]'}`}>
                {lineConnected ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase mb-1">ชื่อผู้ใช้ LINE</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-[#121212] font-mono text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold uppercase mb-1">รหัสผู้ใช้ (User ID)</label>
                <input
                  type="text"
                  readOnly
                  value={schedule.lineUserId}
                  className="w-full px-3 py-1.5 bg-[#f8f7f4] border border-[#121212] font-mono text-[11px] opacity-60 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] opacity-70">ส่งการแจ้งเตือนผ่าน LINE Webhook</span>
              <button
                type="button"
                onClick={() => setLineConnected(!lineConnected)}
                className={`px-3 py-1 text-[10px] font-bold border-2 border-[#121212] uppercase transition ${
                  lineConnected ? 'bg-[#121212] text-[#f8f7f4]' : 'bg-white text-[#121212]'
                }`}
              >
                {lineConnected ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </button>
            </div>
          </div>

          {/* Target Book */}
          <div>
            <label className="block font-bold uppercase mb-1">
              หนังสือเป้าหมายหลัก (Active Focus)
            </label>
            <select
              value={activeBookId}
              onChange={(e) => setActiveBookId(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs font-mono focus:outline-none cursor-pointer"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} (หน้า {b.currentPage}/{b.totalPages})
                </option>
              ))}
            </select>
          </div>

          {/* Days selector */}
          <div>
            <label className="block font-bold uppercase mb-1">
              วันที่ต้องการแจ้งเตือน (Reminder Cadence)
            </label>
            <div className="grid grid-cols-7 gap-1">
              {daysList.map((d) => {
                const isSelected = reminderDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`py-2 border-2 border-[#121212] font-bold text-center transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#121212] text-[#f8f7f4]'
                        : 'bg-white text-[#121212] hover:bg-[#121212]/10'
                    }`}
                  >
                    <div className="text-[10px] truncate">{d.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time & Target Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase mb-1">
                เวลาแจ้งเตือน (รูปแบบ 24 ชม.)
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold uppercase mb-1">
                เป้าหมายการอ่าน (หน้า/วัน)
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={targetPages}
                onChange={(e) => setTargetPages(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Snooze duration */}
          <div>
            <label className="block font-bold uppercase mb-1">
              ระยะเวลาการเลื่อนเตือน (Snooze Interval)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSnoozeMinutes(mins)}
                  className={`py-1.5 border-2 border-[#121212] text-xs font-mono font-bold transition cursor-pointer ${
                    snoozeMinutes === mins
                      ? 'bg-[#121212] text-[#f8f7f4]'
                      : 'bg-white text-[#121212] hover:bg-[#121212]/10'
                  }`}
                >
                  {mins} นาที
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t-2 border-[#121212] flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-green-700 font-bold">✓ บันทึกการตั้งค่าเรียบร้อยแล้ว</span>
            ) : (
              <span className="opacity-50 text-[10px]">การเปลี่ยนแปลงมีผลทันที</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn px-4 py-2 text-xs"
              >
                ปิด
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 text-xs"
              >
                บันทึกการตั้งเวลา
              </button>
            </div>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
