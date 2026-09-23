'use client';

import React, { useState } from 'react';
import { Book, BookStatus } from '../types';
import { 
  Plus, Search, Bookmark, BookOpen, 
  Trash2, X, Check, ArrowUpRight, Sparkles, ChevronRight, Edit3, Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { AddBookModal } from './AddBookModal';

interface BookManagementProps {
  books: Book[];
  activeBookId: string;
  onUpdateBook: (book: Book) => void;
  onAddBook: (newBook: Omit<Book, 'id' | 'addedAt'>) => void;
  onDeleteBook: (id: string) => void;
  onSetActiveBook: (id: string) => void;
  onQuickLogPages: (book: Book, pagesAdded: number) => void;
  onOpenAddBook?: () => void;
  onEditBook?: (book: Book) => void;
}

export const BookManagement: React.FC<BookManagementProps> = ({
  books,
  activeBookId,
  onUpdateBook,
  onAddBook,
  onDeleteBook,
  onSetActiveBook,
  onQuickLogPages,
  onOpenAddBook,
  onEditBook
}) => {
  const [filter, setFilter] = useState<BookStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Filtered books
  const filteredBooks = books.filter(b => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handlePageQuickAdd = (book: Book, pages: number) => {
    const nextCurrentPage = Math.min(book.totalPages, book.currentPage + pages);
    const isNowFinished = nextCurrentPage >= book.totalPages;

    if (isNowFinished && book.status !== 'completed') {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    onQuickLogPages(book, pages);
  };

  return (
    <div className="space-y-8">
      
      {/* Control Bar: Brutalist Filters, Search & Action Buttons */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-2 border-b-2 border-[#121212]">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center border-2 border-[#121212] bg-[#f8f7f4] self-start overflow-x-auto max-w-full">
          <button
            id="tab-reading"
            onClick={() => setFilter('reading')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'reading'
                ? 'bg-[#121212] text-[#f8f7f4]'
                : 'text-[#121212] hover:bg-[#121212]/10'
            }`}
          >
            <span>กำลังอ่าน</span>
            <span>({books.filter(b => b.status === 'reading').length})</span>
          </button>

          <button
            id="tab-backlog"
            onClick={() => setFilter('backlog')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition cursor-pointer whitespace-nowrap border-l-2 border-[#121212] flex items-center gap-1.5 ${
              filter === 'backlog'
                ? 'bg-[#121212] text-[#f8f7f4]'
                : 'text-[#121212] hover:bg-[#121212]/10'
            }`}
          >
            <span>กองดอง</span>
            <span>({books.filter(b => b.status === 'backlog').length})</span>
          </button>

          <button
            id="tab-completed"
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition cursor-pointer whitespace-nowrap border-l-2 border-[#121212] flex items-center gap-1.5 ${
              filter === 'completed'
                ? 'bg-[#121212] text-[#f8f7f4]'
                : 'text-[#121212] hover:bg-[#121212]/10'
            }`}
          >
            <span>อ่านจบแล้ว</span>
            <span>({books.filter(b => b.status === 'completed').length})</span>
          </button>

          <button
            id="tab-all"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase transition cursor-pointer whitespace-nowrap border-l-2 border-[#121212] ${
              filter === 'all'
                ? 'bg-[#121212] text-[#f8f7f4]'
                : 'text-[#121212] hover:bg-[#121212]/10'
            }`}
          >
            <span>ทั้งหมด ({books.length})</span>
          </button>
        </div>

        {/* Search & Add Action */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#121212]/50" />
            <input
              id="search-books-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง..."
              className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#121212] text-xs text-[#121212] font-mono focus:outline-none"
            />
          </div>

          <button
            id="open-add-book-btn"
            onClick={() => {
              if (onOpenAddBook) {
                onOpenAddBook();
              } else {
                setEditingBook(null);
                setIsAddModalOpen(true);
              }
            }}
            className="btn btn-primary py-2 px-4 text-xs whitespace-nowrap flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มหนังสือ</span>
          </button>
        </div>

      </div>

      {/* Book Grid - Brutalist Editorial Gallery */}
      {filteredBooks.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-[#121212]/30 bg-white shadow-[4px_4px_0_#121212]">
          <Bookmark className="w-8 h-8 text-[#121212]/40 mx-auto mb-3" />
          <h3 className="font-display text-xl font-bold text-[#121212]">ไม่พบหนังสือที่ค้นหา</h3>
          <p className="text-xs font-mono text-[#121212]/60 mt-1 mb-4">
            ไม่มีรายการหนังสือในหมวดนี้ คุณสามารถเพิ่มหนังสือเล่มใหม่เพื่อเริ่มต้นติดตามได้
          </p>
          <button
            type="button"
            onClick={() => {
              if (onOpenAddBook) {
                onOpenAddBook();
              } else {
                setEditingBook(null);
                setIsAddModalOpen(true);
              }
            }}
            className="btn btn-primary py-2.5 px-4 text-xs inline-flex items-center gap-1.5 shadow-[3px_3px_0_#121212] font-bold cursor-pointer transition active:translate-x-0.5 active:translate-y-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มหนังสือใหม่</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooks.map((book) => {
            const progress = book.totalPages > 0 
              ? Math.min(100, Math.round((book.currentPage / book.totalPages) * 100))
              : 0;
            const isCompleted = book.status === 'completed' || book.currentPage >= book.totalPages;
            const isActive = book.id === activeBookId;
            const pagesRemaining = Math.max(0, book.totalPages - book.currentPage);

            return (
              <div
                key={book.id}
                id={`book-card-${book.id}`}
                className={`bg-white border-2 border-[#121212] p-5 flex flex-col justify-between relative transition-all ${
                  isActive
                    ? 'shadow-[10px_10px_0_#ff4d00]'
                    : 'shadow-[6px_6px_0_#121212] hover:shadow-[10px_10px_0_#121212]'
                }`}
              >
                {/* Active Indicator Badge */}
                {isActive && (
                  <div className="absolute top-4 right-4 z-10 px-2.5 py-1 bg-[#ff4d00] text-white font-mono text-[9px] font-bold tracking-wider uppercase border border-[#121212]">
                    เล่มเป้าหมายหลัก
                  </div>
                )}

                <div>
                  {/* Book Cover */}
                  <div className="relative w-full aspect-[16/10] bg-[#e5e5e5] border-2 border-[#121212] mb-4 overflow-hidden">
                    {book.coverUrl ? (
                      <img 
                        src={book.coverUrl} 
                        alt={book.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4 text-center font-display font-bold text-2xl text-[#121212]/30">
                        {book.title}
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2">
                      <span className="badge bg-white">
                        {book.category}
                      </span>
                    </div>
                  </div>

                  {/* Title & Author / Category */}
                  <h4 className="font-display text-xl font-bold text-[#121212] leading-tight line-clamp-2">
                    {book.title}
                  </h4>
                  <div className="flex items-center gap-2 font-mono text-xs text-[#121212]/70 mt-1 flex-wrap">
                    <span className="badge py-0.5 px-1.5 text-[10px] bg-[#121212]/5">{book.category}</span>
                    <span className="opacity-40">•</span>
                    <span>โดย {book.author}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-container my-3">
                    <div className="label flex justify-between items-center mb-1">
                      <span>{book.currentPage} / {book.totalPages} หน้า</span>
                      <span className="text-[#8B0000] font-bold">{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%`, backgroundColor: '#8B0000' }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-[#121212]/60 flex justify-between py-1">
                    <span>เป้าหมาย: {book.targetPagesPerDay || 20} หน้า/วัน</span>
                    <span>เหลือ {pagesRemaining} หน้า</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-3 border-t-2 border-[#121212]/10 space-y-3">
                  {/* Quick increment buttons */}
                  {!isCompleted && (
                    <div className="flex items-center gap-1.5">
                      {[5, 10, 20].map(inc => (
                        <button
                          key={inc}
                          onClick={() => handlePageQuickAdd(book, inc)}
                          className="flex-1 py-1 bg-[#f8f7f4] border border-[#121212] text-[10px] font-mono font-bold hover:bg-[#121212] hover:text-[#f8f7f4] transition cursor-pointer"
                        >
                          +{inc} หน้า
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {isActive ? (
                      <span className="text-xs font-mono font-bold text-[#ff4d00]">กำลังอ่านเล่มนี้</span>
                    ) : (
                      <button
                        onClick={() => onSetActiveBook(book.id)}
                        className="text-xs font-mono font-bold uppercase underline hover:text-[#ff4d00] cursor-pointer"
                      >
                        เลือกเป็นเป้าหมาย
                      </button>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const nextStatus: BookStatus = 
                            book.status === 'reading' ? 'completed' :
                            book.status === 'backlog' ? 'reading' : 'backlog';
                          onUpdateBook({ ...book, status: nextStatus });
                        }}
                        className="text-[10px] font-mono px-2 py-1 border border-[#121212] hover:bg-[#121212]/10 transition"
                      >
                        {book.status === 'reading' ? 'กำลังอ่าน' : book.status === 'completed' ? 'อ่านจบแล้ว' : 'กองดอง'}
                      </button>

                      <button
                        onClick={() => {
                          if (onEditBook) {
                            onEditBook(book);
                          } else {
                            setEditingBook(book);
                            setIsAddModalOpen(true);
                          }
                        }}
                        className="p-1 border border-[#121212] text-[#121212]/70 hover:text-white hover:bg-[#121212] transition"
                        title="แก้ไขข้อมูล / เปลี่ยนรูปภาพหนังสือ"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onDeleteBook(book.id)}
                        className="p-1 border border-[#121212] text-[#121212]/40 hover:text-white hover:bg-red-600 transition"
                        title="ลบหนังสือ"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Fallback Add / Edit Book Modal if not provided by parent */}
      {!onOpenAddBook && (
        <AddBookModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingBook(null);
          }}
          onAddBook={(newBook) => {
            onAddBook(newBook);
            setFilter('all');
          }}
          editingBook={editingBook}
          onUpdateBook={onUpdateBook}
        />
      )}

    </div>
  );
};
