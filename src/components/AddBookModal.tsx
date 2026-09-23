'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Book, BookStatus } from '../types';
import { 
  X, UploadCloud, Image as ImageIcon, Link as LinkIcon, 
  Check, Trash2, BookOpen, AlertCircle, Sparkles, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBook: (newBook: Omit<Book, 'id' | 'addedAt'>) => void;
  editingBook?: Book | null;
  onUpdateBook?: (book: Book) => void;
}

export const COVER_PRESETS = [
  { label: 'พัฒนาตนเอง', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' },
  { label: 'จิตวิทยา', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80' },
  { label: 'เทคโนโลยี', url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80' },
  { label: 'การทำงาน', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80' },
  { label: 'ไอเดียสร้างสรรค์', url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80' },
  { label: 'การเงินการลงทุน', url: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80' }
];

export const SAMPLE_BOOKS = [
  { 
    title: 'Atomic Habits', 
    author: 'James Clear', 
    totalPages: '320', 
    currentPage: '45',
    targetPages: '20',
    category: 'พัฒนาตนเอง', 
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' 
  },
  { 
    title: 'จิตวิทยาสายดาร์ก', 
    author: 'Dr. Hiro', 
    totalPages: '280', 
    currentPage: '0',
    targetPages: '15',
    category: 'จิตวิทยา', 
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80' 
  },
  { 
    title: 'Deep Work', 
    author: 'Cal Newport', 
    totalPages: '304', 
    currentPage: '60',
    targetPages: '20',
    category: 'พัฒนาตนเอง', 
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80' 
  },
  { 
    title: 'The Psychology of Money', 
    author: 'Morgan Housel', 
    totalPages: '256', 
    currentPage: '0',
    targetPages: '15',
    category: 'ธุรกิจและการเงิน', 
    coverUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80' 
  }
];

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  onAddBook,
  editingBook,
  onUpdateBook
}) => {
  // String states for seamless typing and deleting in text/numeric inputs
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('320');
  const [currentPage, setCurrentPage] = useState('0');
  const [category, setCategory] = useState('พัฒนาตนเอง');
  const [targetPages, setTargetPages] = useState('20');
  const [status, setStatus] = useState<BookStatus>('reading');
  const [coverUrl, setCoverUrl] = useState('');

  // Image handling
  const [imageError, setImageError] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [titleError, setTitleError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync state when editingBook changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (editingBook) {
      setTitle(editingBook.title || '');
      setAuthor(editingBook.author || '');
      setTotalPages(String(editingBook.totalPages || 320));
      setCurrentPage(String(editingBook.currentPage || 0));
      setCategory(editingBook.category || 'พัฒนาตนเอง');
      setTargetPages(String(editingBook.targetPagesPerDay || 20));
      setStatus(editingBook.status || 'reading');
      setCoverUrl(editingBook.coverUrl || '');
    } else {
      setTitle('');
      setAuthor('');
      setTotalPages('320');
      setCurrentPage('0');
      setCategory('พัฒนาตนเอง');
      setTargetPages('20');
      setStatus('reading');
      setCoverUrl(COVER_PRESETS[0].url);
    }
    setTitleError('');
    setImageError('');

    // Focus title input on open
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
  }, [editingBook, isOpen]);

  // Handle client-side image file reading and compression
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WebP)');
      return;
    }

    setImageError('');
    setIsProcessingImage(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCoverUrl(compressedDataUrl);
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setImageError('ไม่สามารถโหลดรูปภาพนี้ได้');
        setIsProcessingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setImageError('เกิดข้อผิดพลาดในการอ่านไฟล์');
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleApplySample = (sample: typeof SAMPLE_BOOKS[0]) => {
    setTitle(sample.title);
    setAuthor(sample.author);
    setTotalPages(sample.totalPages);
    setCurrentPage(sample.currentPage);
    setTargetPages(sample.targetPages);
    setCategory(sample.category);
    setCoverUrl(sample.coverUrl);
    setTitleError('');
    setImageError('');
  };

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setTitleError('กรุณากรอกชื่อหนังสือ (จำเป็นต้องระบุ)');
      titleInputRef.current?.focus();
      titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const cleanAuthor = author.trim() || 'ไม่ระบุผู้แต่ง';
    const parsedTotal = Math.max(1, parseInt(totalPages, 10) || 1);
    const parsedCurrent = Math.min(parsedTotal, Math.max(0, parseInt(currentPage, 10) || 0));
    const parsedTarget = Math.max(1, parseInt(targetPages, 10) || 15);
    const finalCover = coverUrl.trim() || COVER_PRESETS[0].url;

    if (editingBook && onUpdateBook) {
      onUpdateBook({
        ...editingBook,
        title: cleanTitle,
        author: cleanAuthor,
        totalPages: parsedTotal,
        currentPage: parsedCurrent,
        category,
        targetPagesPerDay: parsedTarget,
        status,
        coverUrl: finalCover
      });
    } else {
      onAddBook({
        title: cleanTitle,
        author: cleanAuthor,
        totalPages: parsedTotal,
        currentPage: parsedCurrent,
        category,
        targetPagesPerDay: parsedTarget,
        targetFinishDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status,
        coverEmoji: '📖',
        coverUrl: finalCover
      });
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="add-book-modal-backdrop" 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#121212]/80 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            id="add-book-modal-container"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            className="bg-[#f8f7f4] border-2 border-[#121212] w-full max-w-2xl my-auto relative shadow-[12px_12px_0_#121212] flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between p-4 sm:p-5 border-b-2 border-[#121212] bg-[#ffffff]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 border-2 border-[#121212] bg-[#ff4d00] text-white flex items-center justify-center shrink-0 shadow-[2px_2px_0_#121212]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="label m-0 text-[10px] text-[#ff4d00] font-bold">
                    {editingBook ? 'แก้ไขข้อมูล' : 'เพิ่มหนังสือใหม่'}
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#121212]">
                    {editingBook ? 'แก้ไขข้อมูลหนังสือ' : 'เพิ่มหนังสือเข้าคลังอ่าน'}
                  </h3>
                </div>
              </div>
              <button
                id="close-add-book-modal-btn"
                type="button"
                onClick={onClose}
                className="p-1.5 border-2 border-[#121212] bg-white hover:bg-[#121212] hover:text-white transition cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form with Scrollable Body and Sticky Footer */}
            <form noValidate onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden m-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {/* Quick Sample Presets (For fast 1-click testing & filling) */}
                {!editingBook && (
                  <div className="p-3 bg-white border-2 border-[#121212] shadow-[3px_3px_0_#121212]">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#ff4d00]" />
                      <span className="text-[11px] font-mono font-bold text-[#121212]">
                        กดเพื่อเลือกตัวอย่างหนังสือ (กรอกข้อมูลอัตโนมัติ 1-Click):
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_BOOKS.map((s) => (
                        <button
                          key={s.title}
                          type="button"
                          onClick={() => handleApplySample(s)}
                          className="text-[11px] font-mono font-medium px-2.5 py-1 bg-[#f8f7f4] border border-[#121212] hover:bg-[#ff4d00] hover:text-white transition cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{s.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 1: Book Details */}
                <div className="space-y-4">
                  {/* Title Input */}
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase mb-1 text-[#121212]">
                      ชื่อหนังสือ <span className="text-[#ff4d00]">*</span>
                    </label>
                    <input
                      ref={titleInputRef}
                      id="book-title-input"
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (titleError) setTitleError('');
                      }}
                      placeholder="เช่น Atomic Habits, จิตวิทยาสายดาร์ก, Deep Work..."
                      className={`w-full px-3 py-2.5 bg-white border-2 text-sm text-[#121212] font-sans focus:outline-none transition ${
                        titleError ? 'border-red-600 bg-red-50/20' : 'border-[#121212] focus:border-[#ff4d00]'
                      }`}
                    />
                  {titleError && (
                    <div className="flex items-center gap-1 text-red-600 font-mono text-[11px] mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{titleError}</span>
                    </div>
                  )}
                </div>

                {/* Author & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase mb-1 text-[#121212]">
                      ผู้แต่ง / นักเขียน
                    </label>
                    <input
                      id="book-author-input"
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="เช่น James Clear, ดร. ฮิโระ"
                      className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs text-[#121212] font-mono focus:outline-none focus:border-[#ff4d00]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase mb-1 text-[#121212]">
                      หมวดหมู่
                    </label>
                    <select
                      id="book-category-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs text-[#121212] font-mono focus:outline-none focus:border-[#ff4d00] cursor-pointer"
                    >
                      <option value="พัฒนาตนเอง">พัฒนาตนเอง (Self Development)</option>
                      <option value="จิตวิทยา">จิตวิทยา (Psychology)</option>
                      <option value="ธุรกิจและการเงิน">ธุรกิจและการเงิน (Business & Finance)</option>
                      <option value="เทคโนโลยีและวิศวกรรม">เทคโนโลยีและวิศวกรรม (Tech & Engineering)</option>
                      <option value="ปรัชญาและประวัติศาสตร์">ปรัชญาและประวัติศาสตร์ (Philosophy & History)</option>
                      <option value="วรรณกรรมและนิยาย">วรรณกรรมและนิยาย (Fiction & Lit)</option>
                      <option value="วิทยาศาสตร์">วิทยาศาสตร์ (Science)</option>
                      <option value="ทั่วไป">ทั่วไป (General)</option>
                    </select>
                  </div>
                </div>

                {/* Numbers Grid: Total Pages, Current Page, Daily Target */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-mono text-xs font-bold uppercase mb-1 text-[#121212]">
                      จำนวนหน้าทั้งหมด
                    </label>
                    <input
                      id="book-total-pages-input"
                      type="text"
                      inputMode="numeric"
                      value={totalPages}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setTotalPages(val);
                      }}
                      placeholder="320"
                      className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs text-[#121212] font-mono focus:outline-none focus:border-[#ff4d00]"
                    />
                    <span className="text-[10px] font-mono text-[#121212]/50 block mt-0.5">
                      หน้าทั้งหมดของเล่ม
                    </span>
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-bold uppercase mb-1 text-[#121212]">
                      อ่านถึงหน้าปัจจุบัน
                    </label>
                    <input
                      id="book-current-page-input"
                      type="text"
                      inputMode="numeric"
                      value={currentPage}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setCurrentPage(val);
                      }}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs text-[#121212] font-mono focus:outline-none focus:border-[#ff4d00]"
                    />
                    <span className="text-[10px] font-mono text-[#121212]/50 block mt-0.5">
                      หน้าที่อ่านถึงตอนนี้
                    </span>
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-bold uppercase mb-1 text-[#121212]">
                      เป้าหมาย (หน้า/วัน)
                    </label>
                    <input
                      id="book-target-daily-pages-input"
                      type="text"
                      inputMode="numeric"
                      value={targetPages}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setTargetPages(val);
                      }}
                      placeholder="20"
                      className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs text-[#121212] font-mono focus:outline-none focus:border-[#ff4d00]"
                    />
                    <span className="text-[10px] font-mono text-[#121212]/50 block mt-0.5">
                      จำนวนที่ตั้งใจอ่านต่อวัน
                    </span>
                  </div>
                </div>

                {/* Status Switcher */}
                <div>
                  <label className="block font-mono text-xs font-bold uppercase mb-1 text-[#121212]">
                    สถานะของหนังสือ
                  </label>
                  <div className="grid grid-cols-3 border-2 border-[#121212] bg-white">
                    {([
                      { id: 'reading', label: 'กำลังอ่าน' },
                      { id: 'backlog', label: 'กองดอง' },
                      { id: 'completed', label: 'อ่านจบแล้ว' }
                    ] as const).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatus(st.id)}
                        className={`py-2 text-xs font-mono font-bold uppercase text-center cursor-pointer transition ${
                          status === st.id
                            ? 'bg-[#121212] text-[#f8f7f4]'
                            : 'bg-white text-[#121212] hover:bg-[#121212]/10'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 2: Book Cover Image (URL Input + File Upload + Presets) */}
              <div className="border-t-2 border-[#121212] pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="label m-0 text-[10px] text-[#ff4d00] font-bold">ภาพหน้าปกหนังสือ</span>
                    <h4 className="font-display font-bold text-base text-[#121212]">
                      ใส่รูปภาพหน้าปกหนังสือ
                    </h4>
                  </div>
                  {coverUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setCoverUrl('');
                        setImageError('');
                      }}
                      className="text-xs font-mono text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบรูปภาพ</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-4 items-start">
                  {/* Visual Cover Preview */}
                  <div className="border-2 border-[#121212] bg-[#e5e5e5] aspect-[3/4] relative overflow-hidden flex flex-col items-center justify-center shadow-[4px_4px_0_#121212]">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt="พรีวิวหน้าปกหนังสือ"
                        className="w-full h-full object-cover"
                        onError={() => {
                          setImageError('ไม่สามารถโหลดรูปภาพจาก URL นี้ได้ กรุณาตรวจสอบลิงก์');
                        }}
                      />
                    ) : (
                      <div className="p-3 text-center">
                        <ImageIcon className="w-8 h-8 mx-auto text-[#121212]/40 mb-1" />
                        <span className="text-[10px] font-mono text-[#121212]/50 block">ไม่มีรูปภาพ</span>
                      </div>
                    )}
                    {coverUrl && (
                      <span className="absolute bottom-1 right-1 bg-[#121212] text-white text-[9px] font-mono px-1.5 py-0.5">
                        แสดงผล
                      </span>
                    )}
                  </div>

                  {/* Image Inputs Stack */}
                  <div className="space-y-3">
                    {/* Method A: Direct Image URL Input */}
                    <div>
                      <label className="block font-mono text-xs font-bold uppercase mb-1 text-[#121212] flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-[#ff4d00]" />
                        <span>วางลิงก์รูปภาพ (Image URL)</span>
                      </label>
                      <input
                        id="book-cover-url-input"
                        type="text"
                        value={coverUrl.startsWith('data:') ? '' : coverUrl}
                        onChange={(e) => {
                          setCoverUrl(e.target.value);
                          setImageError('');
                        }}
                        placeholder="https://images.unsplash.com/... หรือ URL รูปภาพ"
                        className="w-full px-3 py-2 bg-white border-2 border-[#121212] text-xs font-mono text-[#121212] focus:outline-none focus:border-[#ff4d00]"
                      />
                      <p className="text-[11px] font-mono text-[#121212]/60 mt-0.5">
                        พิมพ์หรือวางลิงก์จากเน็ต (รูปจะแสดงพรีวิวทันที)
                      </p>
                    </div>

                    {/* Method B: File Upload Button & Drag-Drop */}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed p-3 text-center cursor-pointer transition flex items-center justify-center gap-2 ${
                          isDragging
                            ? 'border-[#ff4d00] bg-[#ff4d00]/10'
                            : 'border-[#121212] bg-white hover:bg-[#f8f7f4]'
                        }`}
                      >
                        <UploadCloud className="w-4 h-4 text-[#ff4d00]" />
                        <span className="text-xs font-mono font-bold text-[#121212]">
                          คลิกเพื่อเลือกไฟล์รูปจากเครื่อง หรือลากรูปมาวาง
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-[#121212]/50 mt-1">
                        รองรับ JPG, PNG, WebP (บีบอัดและแปลงเป็น Data URL อัตโนมัติ)
                      </p>
                      {isProcessingImage && (
                        <p className="text-xs font-mono text-[#ff4d00] mt-1 font-bold animate-pulse">
                          กำลังประมวลผลและบีบอัดภาพ...
                        </p>
                      )}
                      {imageError && (
                        <p className="text-xs font-mono text-red-600 font-bold mt-1">{imageError}</p>
                      )}
                    </div>

                    {/* Method C: Preset Cover Thumbnails */}
                    <div>
                      <span className="block font-mono text-[11px] font-bold text-[#121212] mb-1">
                        หรือเลือกภาพปกตัวอย่างสำเร็จรูป:
                      </span>
                      <div className="grid grid-cols-6 gap-1.5">
                        {COVER_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setCoverUrl(preset.url);
                              setImageError('');
                            }}
                            className={`aspect-[3/4] border-2 relative overflow-hidden transition cursor-pointer ${
                              coverUrl === preset.url
                                ? 'border-[#ff4d00] ring-2 ring-[#ff4d00] scale-105 z-10'
                                : 'border-[#121212] opacity-80 hover:opacity-100'
                            }`}
                            title={preset.label}
                          >
                            <img
                              src={preset.url}
                              alt={preset.label}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

              {/* Form Action Buttons - Pinned Sticky Footer */}
              <div className="shrink-0 p-4 sm:px-6 bg-white border-t-2 border-[#121212] flex items-center justify-between z-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary px-4 py-2.5 text-xs font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <div className="flex items-center gap-3">
                  {titleError && (
                    <span className="text-red-600 font-mono text-xs font-bold hidden sm:inline-flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {titleError}
                    </span>
                  )}
                  <button
                    id="submit-book-btn"
                    type="submit"
                    onClick={(e) => handleSubmit(e)}
                    className="btn btn-primary px-6 py-2.5 text-xs flex items-center gap-2 shadow-[4px_4px_0_#121212] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer font-bold transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingBook ? 'บันทึกการแก้ไข' : 'เพิ่มหนังสือเข้าคลัง'}</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
