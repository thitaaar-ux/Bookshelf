'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Book, UserSchedule, ReadingLog } from '../../types';
import { INITIAL_BOOKS, INITIAL_SCHEDULE, INITIAL_READING_LOGS } from '../../data/initialData';
import { AdminLayout } from './AdminLayout';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminLineConnectTab } from './AdminLineConnectTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminBooksTab } from './AdminBooksTab';
import { AdminBroadcastTab } from './AdminBroadcastTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { AdminStripeTab } from './AdminStripeTab';

interface BackofficeProps {
  books?: Book[];
  schedule?: UserSchedule;
  readingLogs?: ReadingLog[];
  onAddBook?: (newBook: Omit<Book, 'id' | 'addedAt'>) => void;
  onDeleteBook?: (id: string) => void;
  onUpdateBook?: (updatedBook: Book) => void;
  onReturnToReader?: () => void;
}

export const Backoffice: React.FC<BackofficeProps> = ({
  books: initialBooks,
  schedule: initialSchedule,
  readingLogs: initialLogs,
  onAddBook: parentAddBook,
  onDeleteBook: parentDeleteBook,
  onUpdateBook: parentUpdateBook,
  onReturnToReader,
}) => {
  const router = useRouter();

  // Internal state fallback if used directly in app/backoffice/page.tsx
  const [localBooks, setLocalBooks] = useState<Book[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tsundoku_books');
      return saved ? JSON.parse(saved) : INITIAL_BOOKS;
    }
    return INITIAL_BOOKS;
  });

  const [localSchedule, setLocalSchedule] = useState<UserSchedule>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tsundoku_schedule');
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULE;
    }
    return INITIAL_SCHEDULE;
  });

  const [localLogs, setLocalLogs] = useState<ReadingLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tsundoku_logs');
      return saved ? JSON.parse(saved) : INITIAL_READING_LOGS;
    }
    return INITIAL_READING_LOGS;
  });

  const books = initialBooks || localBooks;
  const schedule = initialSchedule || localSchedule;
  const readingLogs = initialLogs || localLogs;

  const handleAddBook = (newBookData: Omit<Book, 'id' | 'addedAt'>) => {
    if (parentAddBook) {
      parentAddBook(newBookData);
    } else {
      const newBook: Book = {
        ...newBookData,
        id: 'book-' + Date.now(),
        addedAt: new Date().toISOString().split('T')[0]
      };
      const updated = [newBook, ...localBooks];
      setLocalBooks(updated);
      localStorage.setItem('tsundoku_books', JSON.stringify(updated));
    }
  };

  const handleDeleteBook = (id: string) => {
    if (parentDeleteBook) {
      parentDeleteBook(id);
    } else {
      if (confirm('ต้องการลบหนังสือเล่มนี้ใช่หรือไม่?')) {
        const updated = localBooks.filter(b => b.id !== id);
        setLocalBooks(updated);
        localStorage.setItem('tsundoku_books', JSON.stringify(updated));
      }
    }
  };

  const handleUpdateBook = (updatedBook: Book) => {
    if (parentUpdateBook) {
      parentUpdateBook(updatedBook);
    } else {
      const updated = localBooks.map(b => b.id === updatedBook.id ? updatedBook : b);
      setLocalBooks(updated);
      localStorage.setItem('tsundoku_books', JSON.stringify(updated));
    }
  };

  const handleReturn = onReturnToReader || (() => router.push('/'));
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<{
    status: string;
    service: string;
    lineConfigured: boolean;
  } | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setServerStatus(data);
      })
      .catch(() => {
        setServerStatus({ status: 'offline', service: 'Local Mode', lineConfigured: false });
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTriggerTestNotification = (userDisplayName: string, bookTitle: string) => {
    showToast(`🔔 ส่งการแจ้งเตือนสะกิดอ่าน "${bookTitle}" ถึง ${userDisplayName} เรียบร้อยแล้ว`);
  };

  return (
    <AdminLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      onReturnToReader={handleReturn}
    >
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-neutral-900 border border-emerald-500/50 rounded-2xl shadow-2xl text-xs text-white flex items-center space-x-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {currentTab === 'overview' && (
        <AdminOverviewTab
          books={books}
          schedule={schedule}
          readingLogs={readingLogs}
          onNavigateTab={setCurrentTab}
          serverStatus={serverStatus}
        />
      )}

      {currentTab === 'line_connect' && (
        <AdminLineConnectTab onShowToast={showToast} />
      )}

      {currentTab === 'stripe' && (
        <AdminStripeTab onShowToast={showToast} />
      )}

      {currentTab === 'users' && (
        <AdminUsersTab
          schedule={schedule}
          books={books}
          onTriggerTestNotification={handleTriggerTestNotification}
        />
      )}

      {currentTab === 'books' && (
        <AdminBooksTab
          books={books}
          onAddBook={handleAddBook}
          onDeleteBook={handleDeleteBook}
          onUpdateBook={handleUpdateBook}
        />
      )}

      {currentTab === 'broadcast' && (
        <AdminBroadcastTab />
      )}

      {currentTab === 'settings' && (
        <AdminSettingsTab />
      )}
    </AdminLayout>
  );
};
