'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  Flame, 
  BookOpen, 
  ArrowUpRight,
  Table as TableIcon,
  Search,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { Book, ReadingLog, UserSchedule } from '../types';

interface ReadingProgressChartProps {
  logs: ReadingLog[];
  books: Book[];
  schedule: UserSchedule;
}

type ModeType = 'chart' | 'table';
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
  logs = [],
  books = [],
  schedule
}) => {
  const [mode, setMode] = useState<ModeType>('chart');
  const [viewType, setChartViewType] = useState<ChartViewType>('daily');
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>('all');
  const [tableSearchTerm, setTableSearchTerm] = useState<string>('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate 30 days continuous data ending at today (or latest log date)
  const chartData = useMemo(() => {
    const days: DayDataPoint[] = [];
    const now = new Date();

    // Check if logs exist and have later dates (e.g., demo year 2026)
    let referenceDate = now;
    if (logs && logs.length > 0) {
      const dates = logs
        .map(l => {
          if (!l.timestamp) return NaN;
          const cleanTs = l.timestamp.includes('T') ? l.timestamp : l.timestamp.replace(' ', 'T');
          const t = new Date(cleanTs).getTime();
          return isNaN(t) ? NaN : t;
        })
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
      ? (logs || []) 
      : (logs || []).filter(l => l.bookId === selectedBookFilter);

    // Map logs by YYYY-MM-DD safely
    const logsByDate = new Map<string, ReadingLog[]>();
    activeLogs.forEach(log => {
      try {
        if (!log.timestamp) return;
        const cleanStr = log.timestamp.substring(0, 10);
        if (!logsByDate.has(cleanStr)) {
          logsByDate.set(cleanStr, []);
        }
        logsByDate.get(cleanStr)!.push(log);
      } catch {
        // ignore parsing errors
      }
    });

    const thaiDayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
    const thaiMonthNames = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    let runningTotal = 0;
    const target = schedule?.targetPagesPerDay || 20;

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
          pages: item.pagesRead || 0
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
        target,
        isGoalMet: dayPages >= target,
        booksRead: booksBreakdown
      });
    }

    return days;
  }, [logs, books, schedule?.targetPagesPerDay, selectedBookFilter]);

  // Aggregate 30-day KPI statistics
  const stats = useMemo(() => {
    const target = schedule?.targetPagesPerDay || 20;
    const totalPages = chartData.reduce((acc, d) => acc + d.pages, 0);
    const activeDays = chartData.filter(d => d.pages > 0).length;
    const goalMetDays = chartData.filter(d => d.pages >= target).length;
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
  }, [chartData, schedule?.targetPagesPerDay]);

  // Filtered table rows (sorted latest day first for easy review)
  const tableRows = useMemo(() => {
    const reversed = [...chartData].reverse();
    if (!tableSearchTerm.trim()) return reversed;
    const term = tableSearchTerm.toLowerCase();
    return reversed.filter(d => 
      d.displayDate.toLowerCase().includes(term) ||
      d.dateKey.includes(term) ||
      d.dayOfWeek.toLowerCase().includes(term) ||
      d.booksRead.some(b => b.title.toLowerCase().includes(term))
    );
  }, [chartData, tableSearchTerm]);

  // SVG Geometry Calculations
  const svgWidth = 860;
  const svgHeight = 280;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartPlotWidth = svgWidth - paddingLeft - paddingRight;
  const chartPlotHeight = svgHeight - paddingTop - paddingBottom;

  // Max value calculation for Y-Axis scale
  const maxValDaily = useMemo(() => {
    const maxPage = Math.max(...chartData.map(d => d.pages), schedule?.targetPagesPerDay || 20);
    return Math.ceil((maxPage + 5) / 10) * 10;
  }, [chartData, schedule?.targetPagesPerDay]);

  const maxValCumulative = useMemo(() => {
    const maxPage = Math.max(...chartData.map(d => d.cumulativePages), 50);
    return Math.ceil((maxPage + 20) / 50) * 50;
  }, [chartData]);

  const currentMaxY = viewType === 'daily' ? maxValDaily : maxValCumulative;

  // Target Y Coordinate for Daily view
  const targetY = useMemo(() => {
    if (viewType !== 'daily' || currentMaxY <= 0) return null;
    const target = schedule?.targetPagesPerDay || 20;
    const ratio = target / currentMaxY;
    return paddingTop + chartPlotHeight * (1 - ratio);
  }, [viewType, currentMaxY, schedule?.targetPagesPerDay, chartPlotHeight]);

  // Coordinates for each day point in SVG
  const points = useMemo(() => {
    const count = chartData.length;
    const step = chartPlotWidth / count;
    return chartData.map((d, index) => {
      const cx = paddingLeft + (index + 0.5) * step;
      const barX = paddingLeft + index * step + step * 0.15;
      const barWidth = Math.max(step * 0.7, 8);

      const val = viewType === 'daily' ? d.pages : d.cumulativePages;
      const ratio = currentMaxY > 0 ? Math.min(val / currentMaxY, 1) : 0;
      const cy = paddingTop + chartPlotHeight * (1 - ratio);
      const barHeight = Math.max(chartPlotHeight * ratio, 2);

      return {
        ...d,
        index,
        cx,
        cy,
        barX,
        barWidth,
        barY: cy,
        barHeight
      };
    });
  }, [chartData, viewType, currentMaxY, chartPlotWidth, chartPlotHeight]);

  // SVG Path for Cumulative Area & Trend Line
  const splinePath = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].cx},${points[0].cy}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.cx + curr.cx) / 2;
      d += ` C ${midX},${prev.cy} ${midX},${curr.cy} ${curr.cx},${curr.cy}`;
    }
    return d;
  }, [points]);

  const areaFillPath = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = paddingTop + chartPlotHeight;
    const first = points[0];
    const last = points[points.length - 1];
    return `${splinePath} L ${last.cx},${bottomY} L ${first.cx},${bottomY} Z`;
  }, [splinePath, points, chartPlotHeight]);

  // Currently active or hovered day
  const activeDay = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <section 
      id="reading-progress-chart-section" 
      aria-label="30-Day Reading Progress Visualization"
      className="rounded-2xl bg-neutral-900/95 border border-neutral-800 p-5 sm:p-6 shadow-xl relative overflow-hidden"
    >
      {/* Background subtle glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-neutral-800/80 relative z-10">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/70 border border-emerald-600/40 flex items-center justify-center text-emerald-400 shadow-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 id="chart-section-title" className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <span>ข้อมูลกราฟการอ่าน (Reading Analytics & 30-Day Velocity)</span>
                <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/40 text-emerald-400">
                  30 วันล่าสุด
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                วิเคราะห์พฤติกรรมการอ่าน หน้าสะสม และอัตราการบรรลุเป้าหมายรายวัน
              </p>
            </div>
          </div>
        </div>

        {/* View toggles & filters */}
        <div className="flex flex-wrap items-center gap-2">
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

          {/* Primary View Mode: Chart vs Table */}
          <div className="inline-flex rounded-xl bg-neutral-950 p-1 border border-neutral-800 text-xs">
            <button
              id="chart-mode-btn"
              type="button"
              onClick={() => setMode('chart')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                mode === 'chart'
                  ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>แผนภูมิ (Chart)</span>
            </button>
            <button
              id="table-mode-btn"
              type="button"
              onClick={() => setMode('table')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                mode === 'table'
                  ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>ตารางข้อมูล (Table)</span>
            </button>
          </div>

          {/* If in chart mode: Daily vs Cumulative */}
          {mode === 'chart' && (
            <div className="inline-flex rounded-xl bg-neutral-950 p-1 border border-neutral-800 text-xs">
              <button
                id="chart-toggle-daily-btn"
                type="button"
                onClick={() => setChartViewType('daily')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  viewType === 'daily'
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>รายวัน</span>
              </button>
              <button
                id="chart-toggle-cumulative-btn"
                type="button"
                onClick={() => setChartViewType('cumulative')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  viewType === 'cumulative'
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span>สะสม 30 วัน</span>
              </button>
            </div>
          )}
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
            เป้าหมายตั้งไว้ <span className="font-mono text-neutral-200">{schedule?.targetPagesPerDay || 20}</span> หน้า/วัน
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

      {/* Main Display: Interactive Vector SVG Chart OR Table */}
      {mode === 'chart' ? (
        <div className="relative z-10 space-y-4">
          {/* Active Hover / Inspect Card */}
          {activeDay && (
            <div 
              id="chart-active-day-badge"
              className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-white font-semibold">
                  {activeDay.displayDate} ({activeDay.dayOfWeek})
                </span>
                <span className="text-neutral-400 font-mono">
                  อ่าน: <strong className="text-emerald-400 text-sm font-bold font-mono">+{activeDay.pages}</strong> หน้า
                </span>
                <span className="text-neutral-400 font-mono hidden sm:inline">
                  | สะสม 30 วัน: <strong className="text-neutral-200">{activeDay.cumulativePages}</strong> หน้า
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {activeDay.pages >= activeDay.target ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-medium text-[11px] flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ทะลุเป้าหมาย ({activeDay.target} หน้า)</span>
                  </span>
                ) : activeDay.pages > 0 ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-600/40 text-amber-300 text-[11px]">
                    ขาดอีก {activeDay.target - activeDay.pages} หน้า
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-neutral-850 text-neutral-400 text-[11px]">
                    พักอ่าน (Rest Day)
                  </span>
                )}

                {activeDay.booksRead.length > 0 && (
                  <span className="hidden md:inline-flex items-center space-x-1 text-neutral-300 text-[11px] bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                    <span>{activeDay.booksRead[0].emoji}</span>
                    <span className="truncate max-w-[140px]">{activeDay.booksRead[0].title}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* SVG Visual Canvas */}
          <div 
            id="chart-svg-container"
            className="w-full bg-neutral-950/90 border border-neutral-800/90 rounded-xl p-2 sm:p-4 overflow-hidden relative select-none"
          >
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible"
              style={{ minHeight: '220px', maxHeight: '340px' }}
            >
              <defs>
                {/* Bar Gradient Active */}
                <linearGradient id="barGradEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                </linearGradient>

                {/* Bar Gradient Selected / Hover */}
                <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6ee7b7" stopOpacity={1} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.95} />
                </linearGradient>

                {/* Cumulative Area Gradient */}
                <linearGradient id="areaGradCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="85%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              {/* Y-Axis Grid Lines & Labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingTop + chartPlotHeight * (1 - ratio);
                const value = Math.round(currentMaxY * ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#262626"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 4}
                      fill="#737373"
                      fontSize={10}
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* Daily Target Reference Line (Only in Daily view) */}
              {viewType === 'daily' && targetY !== null && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={targetY}
                    x2={svgWidth - paddingRight}
                    y2={targetY}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    opacity={0.85}
                  />
                  <rect
                    x={svgWidth - paddingRight - 115}
                    y={targetY - 18}
                    width={115}
                    height={16}
                    rx={4}
                    fill="#064e3b"
                    opacity={0.9}
                  />
                  <text
                    x={svgWidth - paddingRight - 8}
                    y={targetY - 6}
                    fill="#34d399"
                    fontSize={10}
                    fontFamily="monospace"
                    textAnchor="end"
                    fontWeight="bold"
                  >
                    เป้า: {schedule?.targetPagesPerDay || 20} หน้า
                  </text>
                </g>
              )}

              {/* Cumulative View Area Curve */}
              {viewType === 'cumulative' && (
                <g>
                  <path
                    d={areaFillPath}
                    fill="url(#areaGradCumulative)"
                  />
                  <path
                    d={splinePath}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth={2.5}
                  />
                </g>
              )}

              {/* Daily View: Bars & Spline */}
              {viewType === 'daily' && (
                <g>
                  {/* Daily Page Bars */}
                  {points.map((p, idx) => {
                    const isHovered = hoveredIndex === idx;
                    const isGoal = p.pages >= p.target;
                    const hasRead = p.pages > 0;
                    return (
                      <g 
                        key={p.dateKey}
                        className="cursor-pointer transition-transform"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onClick={() => setHoveredIndex(idx)}
                      >
                        {/* Hit Area */}
                        <rect
                          x={p.cx - p.barWidth}
                          y={paddingTop}
                          width={p.barWidth * 2}
                          height={chartPlotHeight}
                          fill="transparent"
                        />
                        {/* Bar */}
                        <rect
                          x={p.barX}
                          y={p.barY}
                          width={p.barWidth}
                          height={p.barHeight}
                          rx={3}
                          fill={
                            isHovered
                              ? 'url(#barGradHover)'
                              : hasRead
                                ? 'url(#barGradEmerald)'
                                : '#262626'
                          }
                          opacity={isHovered ? 1 : hasRead ? 0.9 : 0.4}
                        />
                        {/* Goal Met Indicator Dot */}
                        {isGoal && (
                          <circle
                            cx={p.barX + p.barWidth / 2}
                            cy={p.barY - 5}
                            r={2.5}
                            fill="#34d399"
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* Trend Spline */}
                  <path
                    d={splinePath}
                    fill="none"
                    stroke="#a7f3d0"
                    strokeWidth={1.5}
                    opacity={0.4}
                    strokeDasharray="2 2"
                  />
                </g>
              )}

              {/* Interactive Points on Cumulative Curve */}
              {viewType === 'cumulative' && points.map((p, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <circle
                    key={p.dateKey}
                    cx={p.cx}
                    cy={p.cy}
                    r={isHovered ? 5 : 2.5}
                    fill={isHovered ? '#10b981' : '#34d399'}
                    stroke="#000"
                    strokeWidth={isHovered ? 2 : 1}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onClick={() => setHoveredIndex(idx)}
                  />
                );
              })}

              {/* X-Axis Dates */}
              {points.map((p, idx) => {
                // Show date label every 3 days to avoid crowding
                const showLabel = idx === 0 || idx === points.length - 1 || idx % 3 === 0;
                if (!showLabel) return null;
                const isHovered = hoveredIndex === idx;
                return (
                  <text
                    key={p.dateKey}
                    x={p.cx}
                    y={svgHeight - 12}
                    fill={isHovered ? '#34d399' : '#737373'}
                    fontSize={10}
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                  >
                    {p.displayDate}
                  </text>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 font-mono">
            <span className="flex items-center space-x-1">
              <Info className="w-3.5 h-3.5 text-neutral-400" />
              <span>คลิกหรือแตะแท่งกราฟเพื่อดูรายละเอียดการอ่านแต่ละวัน</span>
            </span>
            <span className="text-emerald-400 font-medium">30 วันต่อเนื่อง</span>
          </div>
        </div>
      ) : (
        /* Data Table View: ตารางข้อมูลกราฟการอ่าน 30 วัน */
        <div id="chart-data-table-view" className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-white">ตารางข้อมูลการอ่าน 30 วันล่าสุด</span>
              <span className="text-[11px] font-mono text-neutral-400">({tableRows.length} รายการ)</span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="ค้นหาวันที่หรือชื่อหนังสือ..."
                value={tableSearchTerm}
                onChange={(e) => setTableSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-800 max-h-80 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-neutral-950/90 text-neutral-400 font-medium uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-3">วันที่ (Date)</th>
                  <th className="py-2.5 px-3">หน้าที่อ่าน</th>
                  <th className="py-2.5 px-3">สะสม 30 วัน</th>
                  <th className="py-2.5 px-3">เป้าหมาย & สถานะ</th>
                  <th className="py-2.5 px-3">หนังสือที่อ่าน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {tableRows.map((row) => (
                  <tr key={row.dateKey} className="hover:bg-neutral-850/40 transition font-mono">
                    <td className="py-2.5 px-3 text-white flex items-center space-x-1.5 font-sans">
                      <span className="font-medium">{row.displayDate}</span>
                      <span className="text-[11px] text-neutral-400">({row.dayOfWeek})</span>
                    </td>
                    <td className="py-2.5 px-3">
                      {row.pages > 0 ? (
                        <span className="font-bold text-emerald-400">+{row.pages} หน้า</span>
                      ) : (
                        <span className="text-neutral-500">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-300">
                      {row.cumulativePages} หน้า
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {row.pages >= row.target ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-medium">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>ผ่านเป้า ({row.target})</span>
                        </span>
                      ) : row.pages > 0 ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/40 text-amber-300 text-[10px]">
                          <span>ขาด {row.target - row.pages} หน้า</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-neutral-850 text-neutral-500 text-[10px]">
                          <span>พักอ่าน</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {row.booksRead.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {row.booksRead.map((b, idx) => (
                            <span key={idx} className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 text-[11px]">
                              <span>{b.emoji}</span>
                              <span className="truncate max-w-[150px]">{b.title}</span>
                              <span className="text-emerald-400 font-mono text-[10px]">({b.pages} น.)</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-neutral-500 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Info & Legend */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-neutral-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
            <span className="text-neutral-300">หน้าที่อ่านรายวัน</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-400 inline-block"></span>
            <span className="text-neutral-300">เป้าหมายประจำวัน ({schedule?.targetPagesPerDay || 20} หน้า)</span>
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
