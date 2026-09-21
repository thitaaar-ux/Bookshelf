import React, { useState } from 'react';
import { Book, BookStatus } from '../types';
import { 
  Plus, Search, CheckCircle2, Bookmark, BookOpen, Clock, 
  Trash2, ExternalLink, Calendar, Bell, ChevronRight, X, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookManagementProps {
  books: Book[];
  activeBookId: string;
  onUpdateBook: (book: Book) => void;
  onAddBook: (newBook: Omit<Book, 'id' | 'addedAt'>) => void;
  onDeleteBook: (id: string) => void;
  onSetActiveBook: (id: string) => void;
  onQuickLogPages: (book: Book, pagesAdded: number) => void;
}

export const BookManagement: React.FC<BookManagementProps> = ({
  books,
  activeBookId,
  onUpdateBook,
  onAddBook,
  onDeleteBook,
  onSetActiveBook,
  onQuickLogPages
}) => {
  const [filter, setFilter] = useState<BookStatus | 'all'>('reading');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Book Form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newTotalPages, setNewTotalPages] = useState(300);
  const [newCurrentPage, setNewCurrentPage] = useState(0);
  const [newCategory, setNewCategory] = useState('Self Development');
  const [newTargetPages, setNewTargetPages] = useState(20);
  const [newStatus, setNewStatus] = useState<BookStatus>('backlog');
  const [newCoverEmoji, setNewCoverEmoji] = useState('📖');

  const bookEmojiPresets = ['📖', '📚', '📕', '📗', '📘', '📙', '📓', '📔', '⚡', '🧠', '💡', '🎯', '🚀', '☕'];

  // Filtered books
  const filteredBooks = books.filter(b => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddBook({
      title: newTitle.trim(),
      author: newAuthor.trim() || 'นิรนาม',
      totalPages: Number(newTotalPages) || 100,
      currentPage: Number(newCurrentPage) || 0,
      category: newCategory,
      targetPagesPerDay: Number(newTargetPages) || 20,
      targetFinishDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: newStatus,
      coverEmoji: newCoverEmoji,
      coverUrl: ''
    });

    // Reset and close
    setNewTitle('');
    setNewAuthor('');
    setNewCoverEmoji('📖');
    setIsAddModalOpen(false);
  };

  const handlePageQuickAdd = (book: Book, pages: number) => {
    const nextCurrentPage = Math.min(book.totalPages, book.currentPage + pages);
    const isNowFinished = nextCurrentPage >= book.totalPages;

    if (isNowFinished && book.status !== 'completed') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    onQuickLogPages(book, pages);
  };

  return (
    <div className="space-y-6">
      
      {/* Control Bar: Filters, Search & Add Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800 overflow-x-auto">
          <button
            id="tab-reading"
            onClick={() => setFilter('reading')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
              filter === 'reading'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>กำลังอ่าน</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-950 font-mono text-neutral-300">
              {books.filter(b => b.status === 'reading').length}
            </span>
          </button>

          <button
            id="tab-backlog"
            onClick={() => setFilter('backlog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
              filter === 'backlog'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-neutral-400" />
            <span>กองดอง (Tsundoku)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-950 font-mono text-neutral-300">
              {books.filter(b => b.status === 'backlog').length}
            </span>
          </button>

          <button
            id="tab-completed"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
              filter === 'completed'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>อ่านจบแล้ว</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-950 font-mono text-neutral-300">
              {books.filter(b => b.status === 'completed').length}
            </span>
          </button>

          <button
            id="tab-all"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              filter === 'all'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ทั้งหมด ({books.length})
          </button>
        </div>

        {/* Search & Add Button */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              id="search-books-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อหนังสือ / ผู้แต่ง..."
              className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition"
            />
          </div>

          <button
            id="open-add-book-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-neutral-950 rounded-xl text-xs font-semibold tracking-wide transition shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มหนังสือใหม่</span>
          </button>
        </div>

      </div>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="p-12 text-center bg-neutral-900/40 rounded-2xl border border-dashed border-neutral-800">
          <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-400 mx-auto mb-3">
            <Bookmark className="w-6 h-6 text-neutral-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">ไม่พบหนังสือในหมวดหมู่นี้</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            ลองปรับตัวกรอง หรือกดปุ่ม "เพิ่มหนังสือใหม่" เพื่อบันทึกหนังสือที่คุณต้องการเริ่มอ่าน
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const progress = book.totalPages > 0 
              ? Math.min(100, Math.round((book.currentPage / book.totalPages) * 100))
              : 0;
            const isCompleted = book.status === 'completed' || book.currentPage >= book.totalPages;
            const isActive = book.id === activeBookId;
            const pagesRemaining = Math.max(0, book.totalPages - book.currentPage);
            const daysRemaining = book.targetPagesPerDay > 0 
              ? Math.ceil(pagesRemaining / book.targetPagesPerDay) 
              : 0;

            return (
              <div
                key={book.id}
                id={`book-card-${book.id}`}
                className={`group bg-neutral-900/90 border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                  isActive
                    ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                )}

                <div>
                  {/* Top metadata */}
                  <div className="flex items-start space-x-3.5">
                    {/* Book Emoji Avatar */}
                    <div className="relative w-16 h-22 sm:w-18 sm:h-24 rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-900 shrink-0 border border-neutral-700/60 shadow-md flex items-center justify-center group-hover:scale-[1.02] transition">
                      <span className="text-3xl sm:text-4xl select-none" role="img" aria-label="Book emoji">
                        {book.coverEmoji || '📖'}
                      </span>
                      {isActive && (
                        <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-950/95 border border-emerald-500/80 text-[9px] font-mono text-emerald-300 font-semibold flex items-center space-x-0.5 shadow-sm">
                          <Bell className="w-2.5 h-2.5" />
                          <span>LINE</span>
                        </div>
                      )}
                    </div>

                    {/* Book Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 truncate">
                          {book.category}
                        </span>
                        <div className="flex items-center space-x-1 shrink-0">
                          {book.status === 'reading' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-950 text-sky-400 border border-sky-800">
                              กำลังอ่าน
                            </span>
                          )}
                          {book.status === 'backlog' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700">
                              กองดอง
                            </span>
                          )}
                          {book.status === 'completed' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                              อ่านจบแล้ว
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1 line-clamp-2 leading-snug">
                        {book.title}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5 truncate">
                        {book.author}
                      </p>

                      {/* Remaining Pages & ETA */}
                      <div className="mt-2 text-[11px] text-neutral-400 flex items-center space-x-2">
                        <span>เหลืออีก <strong className="text-neutral-200">{pagesRemaining}</strong> หน้า</span>
                        {daysRemaining > 0 && !isCompleted && (
                          <>
                            <span className="text-neutral-600">•</span>
                            <span className="text-neutral-400">~{daysRemaining} วันจบ</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Tracker Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-neutral-300">
                        {book.currentPage} <span className="text-neutral-500">/ {book.totalPages} หน้า</span>
                      </span>
                      <span className="font-mono font-bold text-white">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden border border-neutral-700/60">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-400' : 'bg-neutral-100'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-neutral-800 space-y-2.5">
                  
                  {/* Quick page add buttons (if not completed) */}
                  {!isCompleted && (
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] uppercase font-mono text-neutral-500 mr-1">
                        +อ่านต่อ:
                      </span>
                      <button
                        onClick={() => handlePageQuickAdd(book, 5)}
                        className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg font-mono transition"
                        title="อ่านเพิ่ม 5 หน้า"
                      >
                        +5
                      </button>
                      <button
                        onClick={() => handlePageQuickAdd(book, 10)}
                        className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg font-mono transition"
                        title="อ่านเพิ่ม 10 หน้า"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => handlePageQuickAdd(book, 20)}
                        className="flex-1 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg font-mono transition"
                        title="อ่านเพิ่ม 20 หน้า"
                      >
                        +20
                      </button>
                    </div>
                  )}

                  {/* Secondary control buttons */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    {/* Switch status */}
                    <div className="flex items-center space-x-1">
                      {book.status === 'backlog' && (
                        <button
                          onClick={() => {
                            onUpdateBook({ ...book, status: 'reading', startedAt: new Date().toISOString().split('T')[0] });
                            onSetActiveBook(book.id);
                          }}
                          className="px-2 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-800 text-sky-300 rounded-md text-[11px] transition"
                        >
                          เริ่มอ่านเล่มนี้
                        </button>
                      )}

                      {book.status === 'reading' && !isCompleted && (
                        <button
                          onClick={() => {
                            onUpdateBook({ ...book, status: 'completed', currentPage: book.totalPages, completedAt: new Date().toISOString().split('T')[0] });
                            confetti({ particleCount: 70, spread: 60 });
                          }}
                          className="px-2 py-1 bg-neutral-800 hover:bg-emerald-950 hover:text-emerald-300 border border-neutral-700 text-neutral-300 rounded-md text-[11px] transition"
                        >
                          ทำเครื่องหมายจบแล้ว
                        </button>
                      )}

                      {!isActive && book.status === 'reading' && (
                        <button
                          onClick={() => onSetActiveBook(book.id)}
                          className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-md text-[11px] transition"
                          title="ตั้งเป็นเล่มหลักเพื่อรับแจ้งเตือนใน LINE"
                        >
                          ผูกเตือน LINE
                        </button>
                      )}
                    </div>

                    {/* Delete action */}
                    <button
                      onClick={() => onDeleteBook(book.id)}
                      className="p-1 text-neutral-500 hover:text-red-400 transition"
                      title="ลบหนังสือ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add New Book Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
              <div>
                <h3 className="text-base font-bold text-white">เพิ่มหนังสือใหม่เข้าคลัง</h3>
                <p className="text-xs text-neutral-400">บันทึกเล่มที่คุณซื้อมาดอง หรือกำลังเตรียมพร้อมอ่าน</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">ชื่อหนังสือ *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น Atomic Habits หรือ Deep Work"
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-600 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">ผู้แต่ง / สำนักพิมพ์</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="เช่น James Clear"
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">หมวดหมู่</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-neutral-600 transition"
                  >
                    <option value="Self Development">Self Development</option>
                    <option value="Technology">Technology</option>
                    <option value="Business & Finance">Business & Finance</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Fiction & Literature">Fiction & Literature</option>
                    <option value="Philosophy">Philosophy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">จำนวนหน้าทั้งหมด</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newTotalPages}
                    onChange={(e) => setNewTotalPages(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-neutral-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">อ่านถึงหน้าปัจจุบัน</label>
                  <input
                    type="number"
                    min="0"
                    max={newTotalPages}
                    value={newCurrentPage}
                    onChange={(e) => setNewCurrentPage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-neutral-600 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">เป้าหมาย (หน้า/วัน)</label>
                  <input
                    type="number"
                    min="1"
                    value={newTargetPages}
                    onChange={(e) => setNewTargetPages(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-neutral-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">สถานะเริ่มต้น</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('backlog')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition text-center ${
                      newStatus === 'backlog'
                        ? 'bg-neutral-800 border-neutral-600 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    📦 เข้ากองดอง (Tsundoku)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('reading')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition text-center ${
                      newStatus === 'reading'
                        ? 'bg-sky-950 border-sky-600 text-sky-200'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    📖 เริ่มอ่านทันที (Reading)
                  </button>
                </div>
              </div>

              {/* Emoji selection */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  เลือกอิโมจิประจำเล่ม (Book Emoji) *
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {bookEmojiPresets.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewCoverEmoji(emoji)}
                      className={`h-10 rounded-xl border text-xl flex items-center justify-center transition cursor-pointer ${
                        newCoverEmoji === emoji
                          ? 'bg-neutral-800 border-white scale-105 shadow-md'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                      }`}
                    >
                      <span>{emoji}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white text-neutral-950 font-semibold text-xs hover:bg-neutral-200 transition shadow-sm"
                >
                  บันทึกหนังสือ
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
