'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target, 
  CheckCircle2, 
  Layers, 
  Flame, 
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import { Book, ReadingLog, UserSchedule } from '../types';

interface ReadingProgressChartProps {
  logs: ReadingLog[];
  books: Book[];
  schedule: UserSchedule;
}

type ChartViewType = 'daily' | 'cumulative';

interface DayDataPoint {
  dateKey: string; // YYYY-MM-DD
  displayDate: string; // e.g. 18 ก.ย.
  dayOfWeek: string; // จ., อ., ...
  pages: number;
  cumulativePages: number;
  target: number;
  isGoalMet: boolean;
  booksRead: { title: string; emoji: string; pages: number }[];
}

export const ReadingProgressChart: React.FC<ReadingProgressChartProps> = ({
  logs,
  books,
  schedule
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [viewType, setChartViewType] = useState<ChartViewType>('daily');
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>('all');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate 30 days data ending at today (or latest log date)
  const chartData = useMemo(() => {
    const days: DayDataPoint[] = [];
    const now = new Date();
    
    // Check if logs exist and have later dates (e.g., demo year 2026)
    let referenceDate = now;
    if (logs.length > 0) {
      const dates = logs
        .map(l => new Date(l.timestamp).getTime())
        .filter(t => !isNaN(t));
      if (dates.length > 0) {
        const maxLogTime = Math.max(...dates);
        if (maxLogTime > now.getTime()) {
          referenceDate = new Date(maxLogTime);
        }
      }
    }

    // Filter logs if a specific book is selected
    const activeLogs = selectedBookFilter === 'all' 
      ? logs 
      : logs.filter(l => l.bookId === selectedBookFilter);

    // Map logs by YYYY-MM-DD
    const logsByDate = new Map<string, ReadingLog[]>();
    activeLogs.forEach(log => {
      try {
        const dateStr = log.timestamp.substring(0, 10);
        if (!logsByDate.has(dateStr)) {
          logsByDate.set(dateStr, []);
        }
        logsByDate.get(dateStr)!.push(log);
      } catch {
        // ignore invalid dates
      }
    });

    const thaiDayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    const thaiMonthNames = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    let runningTotal = 0;

    // Build the 30-day continuous series (from 29 days ago to referenceDate)
    for (let i = 29; i >= 0; i--) {
      const d = new Date(referenceDate);
      d.setDate(referenceDate.getDate() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      const dayLogs = logsByDate.get(dateKey) || [];
      const dayPages = dayLogs.reduce((sum, item) => sum + (Number(item.pagesRead) || 0), 0);
      
      runningTotal += dayPages;

      const booksBreakdown: { title: string; emoji: string; pages: number }[] = [];
      dayLogs.forEach(item => {
        const b = books.find(x => x.id === item.bookId);
        booksBreakdown.push({
          title: item.bookTitle || b?.title || 'หนังสือ',
          emoji: b?.coverEmoji || '📖',
          pages: item.pagesRead
        });
      });

      const dayDisplay = `${d.getDate()} ${thaiMonthNames[d.getMonth()]}`;
      const dayOfWeekStr = thaiDayNames[d.getDay()];

      days.push({
        dateKey,
        displayDate: dayDisplay,
        dayOfWeek: dayOfWeekStr,
        pages: dayPages,
        cumulativePages: runningTotal,
        target: schedule.targetPagesPerDay,
        isGoalMet: dayPages >= schedule.targetPagesPerDay,
        booksRead: booksBreakdown
      });
    }

    return days;
  }, [logs, books, schedule.targetPagesPerDay, selectedBookFilter]);

  // Aggregate 30-day KPI statistics
  const stats = useMemo(() => {
    const totalPages = chartData.reduce((acc, d) => acc + d.pages, 0);
    const activeDays = chartData.filter(d => d.pages > 0).length;
    const goalMetDays = chartData.filter(d => d.pages >= schedule.targetPagesPerDay).length;
    const dailyAverage = (totalPages / 30).toFixed(1);
    const bestDay = chartData.reduce((max, d) => d.pages > max.pages ? d : max, chartData[0] || { pages: 0, displayDate: '-' });

    return {
      totalPages,
      activeDays,
      goalMetDays,
      dailyAverage,
      bestDayPages: bestDay?.pages || 0,
      bestDayDate: bestDay?.displayDate || '-',
      consistencyRate: Math.round((activeDays / 30) * 100)
    };
  }, [chartData, schedule.targetPagesPerDay]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DayDataPoint = payload[0].payload;
      return (
        <div 
          id={`chart-tooltip-${data.dateKey}`}
          className="bg-neutral-900/95 border border-neutral-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-md min-w-[200px] text-xs text-neutral-200 pointer-events-none z-50"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
            <span className="font-semibold text-white flex items-center space-x-1">
              <span>{data.displayDate}</span>
              <span className="text-neutral-400 font-normal font-mono text-[11px]">({data.dayOfWeek})</span>
            </span>
            {data.pages >= data.target ? (
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-600/50 text-emerald-300 text-[10px] font-medium flex items-center space-x-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>ทะลุเป้า</span>
              </span>
            ) : data.pages > 0 ? (
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px] font-medium">
                อ่านแล้ว
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-neutral-850 text-neutral-500 text-[10px]">
                พักอ่าน
              </span>
            )}
          </div>

          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-neutral-300">
              <span className="text-neutral-400">จำนวนที่อ่าน:</span>
              <span className="text-base font-bold text-white">{data.pages} หน้า</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>เป้าหมายรายวัน:</span>
              <span>{data.target} หน้า</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>สะสม 30 วัน:</span>
              <span className="text-neutral-200">{data.cumulativePages} หน้า</span>
            </div>
          </div>

          {data.booksRead.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-neutral-800/80 space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-sans font-medium">
                เล่มที่อ่านวันนี้
              </div>
              {data.booksRead.map((b, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] text-neutral-200">
                  <span className="truncate max-w-[130px] flex items-center space-x-1">
                    <span>{b.emoji}</span>
                    <span className="truncate">{b.title}</span>
                  </span>
                  <span className="font-mono text-emerald-400 shrink-0 font-medium">+{b.pages} หน้า</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <section 
      id="reading-progress-chart-section" 
      aria-label="30-Day Reading Progress Visualization"
      className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5 sm:p-6 shadow-xl relative overflow-hidden"
    >
      {/* Background subtle glow effect */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-800/80 relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 id="chart-section-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                สถิติการอ่าน 30 วันล่าสุด (30-Day Reading Velocity)
              </h2>
              <p className="text-xs text-neutral-400">
                วิเคราะห์พฤติกรรมการอ่านและหน้าสะสมเพื่อทลายกองดองตามเป้าหมายรายวัน
              </p>
            </div>
          </div>
        </div>

        {/* View toggles & book filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Book filter selector */}
          <div className="flex items-center space-x-1.5 bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300">
            <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
            <select
              id="chart-book-filter-select"
              value={selectedBookFilter}
              onChange={(e) => setSelectedBookFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-neutral-900 text-white">ทุกเล่ม (All Books)</option>
              {books.map(b => (
                <option key={b.id} value={b.id} className="bg-neutral-900 text-white">
                  {b.coverEmoji || '📖'} {b.title}
                </option>
              ))}
            </select>
          </div>

          {/* Mode toggle (Daily Bar vs Cumulative Area) */}
          <div className="inline-flex rounded-xl bg-neutral-950 p-1 border border-neutral-800 text-xs">
            <button
              id="chart-toggle-daily-btn"
              type="button"
              onClick={() => setChartViewType('daily')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                viewType === 'daily'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>รายวัน (Daily)</span>
            </button>
            <button
              id="chart-toggle-cumulative-btn"
              type="button"
              onClick={() => setChartViewType('cumulative')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                viewType === 'cumulative'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>สะสม 30 วัน</span>
            </button>
          </div>
        </div>
      </div>

      {/* 30-Day Metrics Bento Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-5 relative z-10">
        {/* Metric 1: Total Pages */}
        <div id="chart-metric-total" className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>อ่านสะสม 30 วัน</span>
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-white">{stats.totalPages}</span>
            <span className="text-xs text-neutral-400 font-sans">หน้า</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 flex items-center space-x-1">
            <span className="text-emerald-400 font-medium">~{(stats.totalPages / 250).toFixed(1)} เล่ม</span>
            <span>(ขนาดมาตรฐาน)</span>
          </p>
        </div>

        {/* Metric 2: Daily Average */}
        <div id="chart-metric-average" className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>เฉลี่ยรายวัน</span>
            <Target className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-white">{stats.dailyAverage}</span>
            <span className="text-xs text-neutral-400 font-sans">หน้า/วัน</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            เป้าหมายตั้งไว้ <span className="font-mono text-neutral-200">{schedule.targetPagesPerDay}</span> หน้า/วัน
          </p>
        </div>

        {/* Metric 3: Best Day */}
        <div id="chart-metric-best-day" className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>อ่านมากสุดใน 1 วัน</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-white">{stats.bestDayPages}</span>
            <span className="text-xs text-neutral-400 font-sans">หน้า</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 truncate">
            วันที่ <span className="text-neutral-200 font-medium">{stats.bestDayDate}</span>
          </p>
        </div>

        {/* Metric 4: Active Reading Days */}
        <div id="chart-metric-consistency" className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>ความสม่ำเสมอ (30 วัน)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-white">{stats.consistencyRate}%</span>
            <span className="text-xs text-neutral-400 font-sans">({stats.activeDays}/30 วัน)</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            ทะลุเป้าหมาย <span className="text-emerald-400 font-semibold font-mono">{stats.goalMetDays}</span> วัน
          </p>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div id="recharts-visual-wrapper" className="w-full h-72 sm:h-80 pt-2 relative z-10">
        {!isMounted ? (
          <div className="w-full h-full flex items-center justify-center text-neutral-500 font-mono text-xs">
            กำลังโหลดข้อมูลกราฟการอ่าน...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {viewType === 'daily' ? (
              <ComposedChart
                data={chartData}
                margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
              >
                <defs>
                  {/* Bar Gradient: Active vs Normal */}
                  <linearGradient id="barGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6ee7b7" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.9} />
                  </linearGradient>
                </defs>

                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#262626" 
                  vertical={false} 
                />

                <XAxis 
                  dataKey="displayDate" 
                  stroke="#737373" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#404040' }}
                  interval="preserveStartEnd"
                />

                <YAxis 
                  stroke="#737373" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Goal Target Reference Line */}
                <ReferenceLine 
                  y={schedule.targetPagesPerDay} 
                  stroke="#10b981" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5}
                  label={{
                    value: `เป้าหมาย: ${schedule.targetPagesPerDay} หน้า`,
                    fill: '#34d399',
                    fontSize: 10,
                    position: 'insideTopRight'
                  }}
                />

                {/* Daily Pages Bar */}
                <Bar 
                  dataKey="pages" 
                  name="จำนวนหน้าที่อ่าน"
                  fill="url(#barGradientPrimary)" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />

                {/* Trend Spline */}
                <Line 
                  type="monotone" 
                  dataKey="pages" 
                  stroke="#a7f3d0" 
                  strokeWidth={1}
                  dot={false}
                  opacity={0.4}
                />
              </ComposedChart>
            ) : (
              <AreaChart
                data={chartData}
                margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="areaCumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="85%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#262626" 
                  vertical={false} 
                />

                <XAxis 
                  dataKey="displayDate" 
                  stroke="#737373" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#404040' }}
                  interval="preserveStartEnd"
                />

                <YAxis 
                  stroke="#737373" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area 
                  type="monotone" 
                  dataKey="cumulativePages" 
                  name="หน้าสะสม"
                  stroke="#34d399" 
                  strokeWidth={2.5}
                  fill="url(#areaCumulativeGradient)" 
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Info & Legend */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-neutral-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
            <span className="text-neutral-300">หน้าที่อ่านรายวัน</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-400 inline-block"></span>
            <span className="text-neutral-300">เป้าหมายประจำวัน ({schedule.targetPagesPerDay} หน้า)</span>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-neutral-400 font-mono">
          <span>อัปเดตแบบเรียลไทม์เมื่อบันทึกผ่าน Web หรือ LINE</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
        </div>
      </div>
    </section>
  );
};
