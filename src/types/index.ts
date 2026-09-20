export type BookStatus = 'reading' | 'backlog' | 'completed';

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  coverEmoji?: string;
  coverUrl?: string;
  status: BookStatus;
  category: string;
  targetPagesPerDay: number;
  targetFinishDate: string;
  startedAt?: string;
  completedAt?: string;
  addedAt: string;
  notes?: string;
}

export interface UserSchedule {
  reminderDays: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  reminderTime: string; // e.g. "20:00"
  targetPagesPerDay: number;
  snoozeDurationMinutes: number;
  lineConnected: boolean;
  lineUserId: string;
  lineDisplayName: string;
  activeBookId: string;
}

export interface ReadingLog {
  id: string;
  bookId: string;
  bookTitle: string;
  pagesRead: number;
  fromPage: number;
  toPage: number;
  timestamp: string;
  source: 'line_quick_reply' | 'web_manual' | 'concierge';
  note?: string;
}

export interface Badge {
  id: string;
  name: string;
  nameTh: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'streak' | 'volume' | 'clearance' | 'speed';
  requiredCount: number;
  currentCount: number;
}

export interface LineChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickReplies?: {
    label: string;
    action: string;
    data: string;
    icon?: string;
  }[];
  flexData?: {
    title: string;
    subtitle: string;
    progress: number;
    pagesInfo: string;
    eta: string;
  };
}

export interface TechStackItem {
  layer: string;
  technology: string;
  whyChosen: string;
  soloDevAdvantage: string;
}
