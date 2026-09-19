import React, { useState } from 'react';
import { Book } from '../../types';
import { 
  BookOpen, Search, Plus, Trash2, Edit3, 
  CheckCircle2, Sparkles, Filter, ExternalLink 
} from 'lucide-react';

interface AdminBooksTabProps {
  books: Book[];
  onAddBook: (newBook: Omit<Book, 'id' | 'addedAt'>) => void;
  onDeleteBook: (id: string) => void;
  onUpdateBook: (updatedBook: Book) => void;
}

export const AdminBooksTab: React.FC<AdminBooksTabProps> = ({
  books,
  onAddBook,
  onDeleteBook,
  onUpdateBook,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'reading' | 'backlog' | 'completed'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New book form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newTotalPages, setNewTotalPages] = useState(250);
  const [newCategory, setNewCategory] = useState('จิตวิทยา & พัฒนาตนเอง');
  const [newCoverUrl, setNewCoverUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80');

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.category.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && b.status === statusFilter;
  });

  const handleSubmitNewBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddBook({
      title: newTitle,
      author: newAuthor || 'ไม่ระบุผู้แต่ง',
      totalPages: Number(newTotalPages),
      currentPage: 0,
      coverUrl: newCoverUrl,
      status: 'backlog',
      category: newCategory,
      targetPagesPerDay: 20,
      targetFinishDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'เพิ่มโดย Admin จากระบบ Backoffice',
    });

    setNewTitle('');
    setNewAuthor('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>คลังหนังสือ Master Catalog (Tsundoku Inventory)</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-neutral-800 text-neutral-300">
              {filteredBooks.length} เล่ม
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            จัดการแคตตาล็อกหนังสือทั้งหมด เพิ่มหนังสือแนะนำให้ผู้อ่าน และตรวจสอบอัตราความสำเร็จ
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, หมวดหมู่..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 w-52"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center p-0.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
            {(['all', 'reading', 'backlog', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg transition capitalize ${
                  statusFilter === st ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'
                }`}
              >
                {st === 'all' ? 'ทั้งหมด' : st === 'reading' ? 'กำลังอ่าน' : st === 'backlog' ? 'กองดอง' : 'จบแล้ว'}
              </button>
            ))}
          </div>

          {/* Add Book Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มหนังสือใหม่</span>
          </button>
        </div>
      </div>

      {/* Books Table */}
      <div className="overflow-hidden rounded-2xl bg-neutral-900/70 border border-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 font-medium">
              <tr>
                <th className="py-3 px-4">หนังสือ &amp; ผู้แต่ง</th>
                <th className="py-3 px-4">หมวดหมู่</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4">ความคืบหน้า</th>
                <th className="py-3 px-4">เป้าหมาย/วัน</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredBooks.map((book) => {
                const percent = Math.round((book.currentPage / book.totalPages) * 100);
                return (
                  <tr key={book.id} className="hover:bg-neutral-850/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={book.coverUrl} 
                          alt={book.title} 
                          className="w-10 h-14 object-cover rounded-md border border-neutral-700 shadow-sm flex-shrink-0"
                        />
                        <div>
                          <h4 className="font-semibold text-white max-w-[240px] truncate">{book.title}</h4>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{book.author}</p>
                          <span className="font-mono text-[10px] text-neutral-500">
                            {book.currentPage} จาก {book.totalPages} หน้า
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[11px]">
                        {book.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {book.status === 'reading' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] bg-sky-950/60 text-sky-400 border border-sky-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                          <span>กำลังอ่าน</span>
                        </span>
                      )}
                      {book.status === 'backlog' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800/60">
                          <span>กองดองรอทลาย</span>
                        </span>
                      )}
                      {book.status === 'completed' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>ทลายสำเร็จแล้ว</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 w-36">
                      <div className="flex justify-between text-[11px] font-mono text-neutral-300 mb-1">
                        <span>{percent}%</span>
                        <span className="text-neutral-500">{book.currentPage}/{book.totalPages}</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-sky-500 rounded-full" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-neutral-300">
                      {book.targetPagesPerDay || 20} หน้า/วัน
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            const newPages = prompt(`ระบุจำนวนหน้าที่อ่านแล้วของ "${book.title}":`, String(book.currentPage));
                            if (newPages !== null && !isNaN(Number(newPages))) {
                              const p = Math.min(book.totalPages, Math.max(0, Number(newPages)));
                              onUpdateBook({
                                ...book,
                                currentPage: p,
                                status: p >= book.totalPages ? 'completed' : p > 0 ? 'reading' : 'backlog'
                              });
                            }
                          }}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                          title="แก้ไขความคืบหน้า"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteBook(book.id)}
                          className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-900/40 transition"
                          title="ลบหนังสือ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Book Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-md p-6 relative">
            <h3 className="text-base font-bold text-white mb-1">เพิ่มหนังสือเข้า Master Catalog</h3>
            <p className="text-xs text-neutral-400 mb-4">หนังสือนี้จะถูกนำเข้าสู่ระบบคลังกองดอง</p>

            <form onSubmit={handleSubmitNewBook} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">ชื่อหนังสือ (Title) *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น Atomic Habits, Clean Code..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-medium">ผู้แต่ง (Author)</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="เช่น James Clear"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-medium">จำนวนหน้าทั้งหมด (Pages)</label>
                  <input
                    type="number"
                    min="1"
                    value={newTotalPages}
                    onChange={(e) => setNewTotalPages(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-medium">หมวดหมู่ (Category)</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="จิตวิทยา & พัฒนาตนเอง">จิตวิทยา & พัฒนาตนเอง</option>
                  <option value="เทคโนโลยี & ซอฟต์แวร์">เทคโนโลยี & ซอฟต์แวร์</option>
                  <option value="ธุรกิจ & การลงทุน">ธุรกิจ & การลงทุน</option>
                  <option value="วรรณกรรม & เรื่องสั้น">วรรณกรรม & เรื่องสั้น</option>
                  <option value="ปรัชญา & ความคิด">ปรัชญา & ความคิด</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-medium">URL ภาพหน้าปก (Cover Image URL)</label>
                <input
                  type="url"
                  value={newCoverUrl}
                  onChange={(e) => setNewCoverUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition"
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
