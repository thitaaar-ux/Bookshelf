import React, { useState } from 'react';
import { Book, BookStatus } from '../types';
import { 
  Plus, Search, CheckCircle2, Bookmark, BookOpen, Clock, 
  Trash2, ExternalLink, Calendar, Bell, ChevronRight, X, Sparkles, LayoutList, LayoutGrid
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Book Form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newTotalPages, setNewTotalPages] = useState(300);
  const [newCurrentPage, setNewCurrentPage] = useState(0);
  const [newCategory, setNewCategory] = useState('Self Development');
  const [newTargetPages, setNewTargetPages] = useState(20);
  const [newStatus, setNewStatus] = useState<BookStatus>('backlog');
  const [newCoverUrl, setNewCoverUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80');

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
      coverUrl: newCoverUrl
    });

    // Reset and close
    setNewTitle('');
    setNewAuthor('');
    setIsAddModalOpen(false);
  };

  const handlePageQuickAdd = (book: Book, pages: number) => {
    const nextCurrentPage = Math.min(book.totalPages, book.currentPage + pages);
    const isNowFinished = nextCurrentPage >= book.totalPages;

    if (isNowFinished && book.status !== 'completed') {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    onQuickLogPages(book, pages);
  };

  const coverPresets = [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80'
  ];

  return (
    <div className="w-full space-y-8">
      
      {/* Editorial Header Section Divider */}
      <div className="flex items-center justify-between border-b-2 border-[#1c1c1c] pb-3">
        <div className="flex items-center space-x-3">
          <span className="meta text-[#1c1c1c] font-black tracking-widest text-xs sm:text-sm">
            CURRENT LIBRARY // CATALOG ARCHIVE
          </span>
          <span className="meta text-[#ff4d00] font-bold">
            [{filteredBooks.length} VOLUMES]
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#1c1c1c] text-[#fdfcf8]'
                : 'text-[#1c1c1c]/50 hover:text-[#1c1c1c]'
            }`}
            title="Variation 3 Editorial List View"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded text-xs transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#1c1c1c] text-[#fdfcf8]'
                : 'text-[#1c1c1c]/50 hover:text-[#1c1c1c]'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Bar: Filters, Search & Add Action */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Nav Pills Style Filter Tabs */}
        <div className="nav-pills flex items-center gap-1 bg-[#f4f2ea] p-1 rounded-full border border-[#e8e6df] overflow-x-auto">
          <button
            id="tab-reading"
            onClick={() => setFilter('reading')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
              filter === 'reading'
                ? 'bg-white text-[#1c1c1c] shadow-sm'
                : 'text-[#1c1c1c]/60 hover:text-[#1c1c1c]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#1c1c1c]" />
            <span>กำลังอ่าน</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-[#f4f2ea] text-[#1c1c1c]">
              {books.filter(b => b.status === 'reading').length}
            </span>
          </button>

          <button
            id="tab-backlog"
            onClick={() => setFilter('backlog')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
              filter === 'backlog'
                ? 'bg-white text-[#1c1c1c] shadow-sm'
                : 'text-[#1c1c1c]/60 hover:text-[#1c1c1c]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-[#ff4d00]" />
            <span>กองดอง (TSUNDOKU)</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-[#f4f2ea] text-[#1c1c1c]">
              {books.filter(b => b.status === 'backlog').length}
            </span>
          </button>

          <button
            id="tab-completed"
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
              filter === 'completed'
                ? 'bg-white text-[#1c1c1c] shadow-sm'
                : 'text-[#1c1c1c]/60 hover:text-[#1c1c1c]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1c1c1c]" />
            <span>อ่านจบแล้ว</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-[#f4f2ea] text-[#1c1c1c]">
              {books.filter(b => b.status === 'completed').length}
            </span>
          </button>

          <button
            id="tab-all"
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-[#1c1c1c] shadow-sm'
                : 'text-[#1c1c1c]/60 hover:text-[#1c1c1c]'
            }`}
          >
            ทั้งหมด ({books.length})
          </button>
        </div>

        {/* Search & Add Book Button */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1c1c1c]/40" />
            <input
              id="search-books-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อหนังสือ / ผู้แต่ง..."
              className="w-full pl-9 pr-3 py-2 bg-[#f4f2ea] border border-[#e8e6df] focus:border-[#1c1c1c] focus:bg-white text-xs text-[#1c1c1c] placeholder-[#1c1c1c]/40 font-mono transition outline-none"
            />
          </div>

          <button
            id="open-add-book-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1c1c1c] text-[#fdfcf8] hover:bg-[#ff4d00] border-none px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition shadow-sm whitespace-nowrap flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มหนังสือใหม่</span>
          </button>
        </div>

      </div>

      {/* Book Catalog Display */}
      {filteredBooks.length === 0 ? (
        <div className="p-16 text-center bg-[#f4f2ea] border border-[#e8e6df]">
          <div className="w-12 h-12 border border-[#1c1c1c] flex items-center justify-center text-[#1c1c1c] mx-auto mb-3">
            <Bookmark className="w-6 h-6 text-[#1c1c1c]" />
          </div>
          <h3 className="text-base font-extrabold uppercase tracking-tight text-[#1c1c1c]">
            ไม่พบหนังสือในหมวดนี้
          </h3>
          <p className="text-xs text-[#1c1c1c]/60 mt-1 max-w-sm mx-auto font-medium">
            ลองปรับตัวกรอง หรือกดปุ่ม "+ เพิ่มหนังสือใหม่" เพื่อบันทึกหนังสือที่คุณต้องการเริ่มอ่าน
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* Variation 3 Editorial List (.book-card-alt) */
        <div className="divide-y divide-[#e8e6df] border-t border-b border-[#e8e6df]">
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
              <article
                key={book.id}
                id={`book-card-${book.id}`}
                className={`py-8 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center transition-all ${
                  isActive ? 'bg-[#fdfcf8]' : 'hover:bg-[#f4f2ea]/40'
                }`}
              >
                {/* Book Cover */}
                <div className="relative shrink-0">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-28 sm:w-36 h-40 sm:h-52 object-cover bg-[#f4f2ea] border border-[#1c1c1c] shadow-[4px_4px_0px_#1c1c1c]"
                    referrerPolicy="no-referrer"
                  />
                  {isActive && (
                    <div className="absolute -top-2.5 -left-2.5 px-2 py-0.5 bg-[#ff4d00] text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm flex items-center space-x-1">
                      <Bell className="w-2.5 h-2.5" />
                      <span>LINE TARGET</span>
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="flex-1 min-w-0 space-y-3 w-full">
                  
                  {/* Meta tag & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="meta text-[#1c1c1c]/70 font-semibold">
                        {book.category}
                      </span>
                      <span className="meta text-[#1c1c1c]/30">•</span>
                      <span className="meta text-[#1c1c1c]/70">
                        {book.author}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {book.status === 'reading' && (
                        <span className="meta px-2 py-0.5 bg-[#f4f2ea] border border-[#1c1c1c] text-[#1c1c1c] font-bold">
                          ● กำลังอ่าน
                        </span>
                      )}
                      {book.status === 'backlog' && (
                        <span className="meta px-2 py-0.5 bg-white border border-[#ff4d00] text-[#ff4d00] font-bold">
                          ■ กองดอง
                        </span>
                      )}
                      {book.status === 'completed' && (
                        <span className="meta px-2 py-0.5 bg-[#1c1c1c] text-[#fdfcf8] font-bold">
                          ✓ อ่านจบแล้ว
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-[#1c1c1c] leading-tight">
                    {book.title}
                  </h3>

                  {/* Editorial Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div className="border-l-2 border-[#1c1c1c] pl-2.5">
                      <span className="meta block text-[10px]">Progress</span>
                      <span className="font-mono font-bold text-sm text-[#1c1c1c]">
                        {book.currentPage} / {book.totalPages} Pgs
                      </span>
                    </div>
                    <div className="border-l-2 border-[#1c1c1c] pl-2.5">
                      <span className="meta block text-[10px]">Clearance</span>
                      <span className="font-mono font-bold text-sm text-[#ff4d00]">
                        {progress}%
                      </span>
                    </div>
                    <div className="border-l-2 border-[#1c1c1c] pl-2.5">
                      <span className="meta block text-[10px]">Remaining</span>
                      <span className="font-mono font-bold text-sm text-[#1c1c1c]">
                        {pagesRemaining} Pgs
                      </span>
                    </div>
                    <div className="border-l-2 border-[#1c1c1c] pl-2.5">
                      <span className="meta block text-[10px]">Pace / ETA</span>
                      <span className="font-mono font-bold text-sm text-[#1c1c1c]">
                        {isCompleted ? 'Finished' : `~${daysRemaining} Days`}
                      </span>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="pt-2">
                    <div className="w-full bg-[#f4f2ea] h-2 border border-[#1c1c1c] overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isActive ? 'bg-[#ff4d00]' : 'bg-[#1c1c1c]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Card Controls (.controls) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                    
                    {/* Page Quick Increments */}
                    {!isCompleted ? (
                      <div className="flex items-center space-x-1.5">
                        <span className="meta text-[#1c1c1c]/60 font-semibold mr-1">
                          +Quick Log:
                        </span>
                        <button
                          onClick={() => handlePageQuickAdd(book, 5)}
                          className="px-3 py-1 bg-[#f4f2ea] hover:bg-[#1c1c1c] hover:text-[#fdfcf8] text-[#1c1c1c] text-xs font-mono font-bold border border-[#e8e6df] transition cursor-pointer"
                          title="อ่านเพิ่ม 5 หน้า"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handlePageQuickAdd(book, 10)}
                          className="px-3 py-1 bg-[#f4f2ea] hover:bg-[#1c1c1c] hover:text-[#fdfcf8] text-[#1c1c1c] text-xs font-mono font-bold border border-[#e8e6df] transition cursor-pointer"
                          title="อ่านเพิ่ม 10 หน้า"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handlePageQuickAdd(book, 20)}
                          className="px-3 py-1 bg-[#f4f2ea] hover:bg-[#1c1c1c] hover:text-[#fdfcf8] text-[#1c1c1c] text-xs font-mono font-bold border border-[#e8e6df] transition cursor-pointer"
                          title="อ่านเพิ่ม 20 หน้า"
                        >
                          +20
                        </button>
                      </div>
                    ) : (
                      <span className="meta text-[#1c1c1c] font-bold">
                        ★ COMPLETED &bull; ARCHIVED
                      </span>
                    )}

                    {/* Status Alterations & Actions */}
                    <div className="flex items-center space-x-2">
                      {book.status === 'backlog' && (
                        <button
                          onClick={() => {
                            onUpdateBook({ ...book, status: 'reading', startedAt: new Date().toISOString().split('T')[0] });
                            onSetActiveBook(book.id);
                          }}
                          className="bg-[#1c1c1c] hover:bg-[#ff4d00] text-[#fdfcf8] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                        >
                          เริ่มอ่านเล่มนี้
                        </button>
                      )}

                      {book.status === 'reading' && !isCompleted && (
                        <button
                          onClick={() => {
                            onUpdateBook({ ...book, status: 'completed', currentPage: book.totalPages, completedAt: new Date().toISOString().split('T')[0] });
                            confetti({ particleCount: 80, spread: 70 });
                          }}
                          className="border border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#fdfcf8] text-[#1c1c1c] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                        >
                          ทำเครื่องหมายจบแล้ว
                        </button>
                      )}

                      {!isActive && (
                        <button
                          onClick={() => onSetActiveBook(book.id)}
                          className="border border-[#e8e6df] hover:border-[#1c1c1c] text-[#1c1c1c] px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                          title="ผูกเป็นเล่มหลักที่จะเตือนใน LINE"
                        >
                          ผูกเตือน LINE
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteBook(book.id)}
                        className="p-2 text-[#1c1c1c]/40 hover:text-red-600 transition cursor-pointer"
                        title="ลบหนังสือออกจากคลัง"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Alternative Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className={`bg-white border border-[#1c1c1c] p-5 flex flex-col justify-between transition-all ${
                  isActive ? 'shadow-[5px_5px_0px_#1c1c1c]' : 'shadow-[3px_3px_0px_#e8e6df] hover:shadow-[4px_4px_0px_#1c1c1c]'
                }`}
              >
                <div>
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-20 h-28 object-cover bg-[#f4f2ea] border border-[#1c1c1c] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="meta text-[#1c1c1c]/60 block truncate">{book.category}</span>
                      <h4 className="font-extrabold text-base text-[#1c1c1c] leading-tight line-clamp-2">
                        {book.title}
                      </h4>
                      <p className="text-xs text-[#1c1c1c]/60 truncate">{book.author}</p>
                      <div className="pt-1">
                        {isActive && (
                          <span className="meta text-[#ff4d00] font-bold">● LINE TARGET</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#1c1c1c]/60">{book.currentPage}/{book.totalPages} pgs</span>
                      <span className="font-bold text-[#1c1c1c]">{progress}%</span>
                    </div>
                    <div className="w-full bg-[#f4f2ea] h-1.5 border border-[#1c1c1c]">
                      <div className="bg-[#1c1c1c] h-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#e8e6df] flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePageQuickAdd(book, 10)}
                      className="px-2 py-1 bg-[#f4f2ea] hover:bg-[#1c1c1c] hover:text-white border border-[#e8e6df] text-xs font-mono font-bold"
                    >
                      +10
                    </button>
                    {!isActive && (
                      <button
                        onClick={() => onSetActiveBook(book.id)}
                        className="px-2 py-1 text-[10px] font-bold border border-[#1c1c1c]"
                      >
                        LINE
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteBook(book.id)}
                    className="text-[#1c1c1c]/40 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Book Modal - Styled in Variation 3 Aesthetic */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#fdfcf8] border-2 border-[#1c1c1c] shadow-[8px_8px_0px_#1c1c1c] w-full max-w-lg p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#1c1c1c] mb-6">
              <div>
                <span className="meta text-[#ff4d00] font-bold">CATALOG // NEW RECORD</span>
                <h3 className="text-xl sm:text-2xl font-black text-[#1c1c1c] tracking-tight uppercase mt-0.5">
                  เพิ่มหนังสือใหม่เข้าคลัง
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 border border-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-[#fdfcf8] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-4">
              <div>
                <label className="meta block text-[#1c1c1c] font-bold mb-1">ชื่อหนังสือ (TITLE) *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น Atomic Habits หรือ Deep Work"
                  className="w-full px-3.5 py-2 bg-white border border-[#1c1c1c] text-sm text-[#1c1c1c] focus:outline-none focus:ring-2 focus:ring-[#ff4d00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="meta block text-[#1c1c1c] font-bold mb-1">ผู้แต่ง / AUTHOR</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="เช่น James Clear"
                    className="w-full px-3.5 py-2 bg-white border border-[#1c1c1c] text-sm text-[#1c1c1c] focus:outline-none focus:ring-2 focus:ring-[#ff4d00]"
                  />
                </div>
                <div>
                  <label className="meta block text-[#1c1c1c] font-bold mb-1">หมวดหมู่ / CATEGORY</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#1c1c1c] text-sm text-[#1c1c1c] focus:outline-none focus:ring-2 focus:ring-[#ff4d00]"
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
                  <label className="meta block text-[#1c1c1c] font-bold mb-1">หน้าทั้งหมด</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newTotalPages}
                    onChange={(e) => setNewTotalPages(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#1c1c1c] text-sm font-mono text-[#1c1c1c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="meta block text-[#1c1c1c] font-bold mb-1">อ่านถึงหน้า</label>
                  <input
                    type="number"
                    min="0"
                    max={newTotalPages}
                    value={newCurrentPage}
                    onChange={(e) => setNewCurrentPage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#1c1c1c] text-sm font-mono text-[#1c1c1c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="meta block text-[#1c1c1c] font-bold mb-1">เป้า (หน้า/วัน)</label>
                  <input
                    type="number"
                    min="1"
                    value={newTargetPages}
                    onChange={(e) => setNewTargetPages(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#1c1c1c] text-sm font-mono text-[#1c1c1c] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="meta block text-[#1c1c1c] font-bold mb-1">สถานะเริ่มต้น (STATUS)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('backlog')}
                    className={`py-2 px-3 border text-xs font-bold uppercase transition text-center cursor-pointer ${
                      newStatus === 'backlog'
                        ? 'bg-[#1c1c1c] text-[#fdfcf8] border-[#1c1c1c]'
                        : 'bg-white text-[#1c1c1c] border-[#e8e6df]'
                    }`}
                  >
                    📦 เข้ากองดอง (Tsundoku)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('reading')}
                    className={`py-2 px-3 border text-xs font-bold uppercase transition text-center cursor-pointer ${
                      newStatus === 'reading'
                        ? 'bg-[#ff4d00] text-white border-[#ff4d00]'
                        : 'bg-white text-[#1c1c1c] border-[#e8e6df]'
                    }`}
                  >
                    📖 เริ่มอ่านทันที (Reading)
                  </button>
                </div>
              </div>

              {/* Cover selection */}
              <div>
                <label className="meta block text-[#1c1c1c] font-bold mb-1">
                  รูปหน้าปก (COVER PRESETS / URL)
                </label>
                <div className="flex items-center space-x-2 mb-2 overflow-x-auto pb-1">
                  {coverPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewCoverUrl(preset)}
                      className={`w-12 h-16 border overflow-hidden shrink-0 transition cursor-pointer ${
                        newCoverUrl === preset 
                          ? 'border-2 border-[#ff4d00] scale-105 shadow-sm' 
                          : 'border-[#1c1c1c]/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt="preset" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={newCoverUrl}
                  onChange={(e) => setNewCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-1.5 bg-white border border-[#1c1c1c] text-xs font-mono text-[#1c1c1c] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t-2 border-[#1c1c1c] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#1c1c1c] text-xs font-bold uppercase hover:bg-[#f4f2ea] transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-[#1c1c1c] hover:bg-[#ff4d00] text-[#fdfcf8] px-6 py-2 text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                >
                  บันทึกหนังสือเข้าคลัง
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
