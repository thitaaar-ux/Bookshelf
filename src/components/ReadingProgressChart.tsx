'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Table as TableIcon,
  Search,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  ChevronsUpDown
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
  displayDate: string; // e.g. 18 Sep
  dayOfWeek: string;
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

  // Generate continuous 30-day data
  const chartData = useMemo(() => {
    const days: DayDataPoint[] = [];
    const now = new Date();

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

    const activeLogs = selectedBookFilter === 'all' 
      ? (logs || []) 
      : (logs || []).filter(l => l.bookId === selectedBookFilter);

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
        // ignore
      }
    });

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const monthNames = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
    ];

    let runningTotal = 0;
    const target = schedule?.targetPagesPerDay || 20;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(referenceDate);
      d.setDate(referenceDate.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLogs = logsByDate.get(dateKey) || [];

      const pages = dayLogs.reduce((acc, l) => acc + (Number(l.pagesRead) || 0), 0);
      runningTotal += pages;

      const booksRead = dayLogs.map(l => {
        const b = books.find(item => item.id === l.bookId);
        return {
          title: l.bookTitle || b?.title || 'Unknown Volume',
          emoji: b?.coverEmoji || '📖',
          pages: l.pagesRead
        };
      });

      days.push({
        dateKey,
        displayDate: `${d.getDate()} ${monthNames[d.getMonth()]}`,
        dayOfWeek: dayNames[d.getDay()],
        pages,
        cumulativePages: runningTotal,
        target,
        isGoalMet: pages >= target,
        booksRead
      });
    }

    return days;
  }, [logs, books, schedule, selectedBookFilter]);

  // Aggregate stats
  const totalPagesInPeriod = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.pages, 0);
  }, [chartData]);

  const averageDailyPages = useMemo(() => {
    return Math.round((totalPagesInPeriod / 30) * 10) / 10;
  }, [totalPagesInPeriod]);

  const maxDailyPages = useMemo(() => {
    return Math.max(...chartData.map(d => d.pages), 1);
  }, [chartData]);

  const maxCumulative = useMemo(() => {
    return Math.max(...chartData.map(d => d.cumulativePages), 1);
  }, [chartData]);

  // SVG dimensions
  const svgWidth = 900;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartPlotWidth = svgWidth - paddingLeft - paddingRight;
  const chartPlotHeight = svgHeight - paddingTop - paddingBottom;

  const currentMaxY = viewType === 'daily' 
    ? Math.max(maxDailyPages * 1.15, (schedule?.targetPagesPerDay || 20) * 1.25)
    : maxCumulative * 1.1;

  // Compute Coordinates for plotting
  const points = useMemo(() => {
    return chartData.map((d, index) => {
      const val = viewType === 'daily' ? d.pages : d.cumulativePages;
      const x = paddingLeft + (index / (chartData.length - 1)) * chartPlotWidth;
      const ratio = currentMaxY > 0 ? val / currentMaxY : 0;
      const y = paddingTop + chartPlotHeight - ratio * chartPlotHeight;
      return {
        ...d,
        cx: x,
        cy: y,
        val
      };
    });
  }, [chartData, viewType, currentMaxY, chartPlotWidth, chartPlotHeight]);

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

  return (
    <div id="reading-velocity-section" className="space-y-6">
      
      {/* Header and Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4 pb-1">
        <div>
          <span className="label">สถิติการอ่านย้อนหลัง 30 วัน</span>
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#121212] tracking-tight">
            ความเร็วและแนวโน้มการอ่าน
          </h3>
        </div>

        {/* Controls: Full Width on Mobile / Balanced on Desktop */}
        <div className="w-full lg:w-[440px] flex flex-col gap-2">
          {/* 1. ปุ่ม ทุกเล่มในคลัง */}
          <div className="relative w-full flex items-center border-2 border-[#121212] bg-[#f8f7f4] px-3 py-2 text-xs shadow-[2px_2px_0_#121212]">
            <BookOpen className="w-4 h-4 shrink-0 text-[#121212] mr-2" />
            <select
              value={selectedBookFilter}
              onChange={(e) => setSelectedBookFilter(e.target.value)}
              className="w-full bg-transparent text-xs text-[#121212] focus:outline-none cursor-pointer font-mono font-bold uppercase appearance-none pr-6 truncate"
            >
              <option value="all">ทุกเล่มในคลัง</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
            <ChevronsUpDown className="w-3.5 h-3.5 text-[#121212] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 shrink-0" />
          </div>

          {/* 2. 2 ปุ่มล่าง: ประวัติการอ่านย้อนหลัง และ รายวัน / ยอดสะสม */}
          <div className="w-full flex items-center gap-2">
            {/* ปุ่ม ประวัติการอ่านย้อนหลัง */}
            <button
              type="button"
              onClick={() => setMode(mode === 'table' ? 'chart' : 'table')}
              className={`flex-1 py-1.5 px-2 text-center font-mono uppercase font-bold text-[11px] sm:text-xs cursor-pointer transition border-2 border-[#121212] shadow-[2px_2px_0_#121212] flex items-center justify-center gap-1.5 whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5 ${
                mode === 'table' 
                  ? 'bg-[#121212] text-[#f8f7f4]' 
                  : 'bg-[#f8f7f4] text-[#121212] hover:bg-[#121212]/10'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 shrink-0" />
              <span>ประวัติการอ่านย้อนหลัง</span>
            </button>

            {/* ปุ่มกลุ่ม รายวัน / ยอดสะสม */}
            <div className="flex flex-1 border-2 border-[#121212] bg-[#f8f7f4] text-xs shadow-[2px_2px_0_#121212]">
              <button
                type="button"
                onClick={() => {
                  setMode('chart');
                  setChartViewType('daily');
                }}
                className={`flex-1 py-1.5 px-1 sm:px-2 text-center font-mono uppercase font-bold cursor-pointer transition ${
                  mode === 'chart' && viewType === 'daily' 
                    ? 'bg-[#121212] text-[#f8f7f4]' 
                    : 'text-[#121212] hover:bg-[#121212]/10'
                }`}
              >
                รายวัน
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('chart');
                  setChartViewType('cumulative');
                }}
                className={`flex-1 py-1.5 px-1 sm:px-2 text-center font-mono uppercase font-bold cursor-pointer transition border-l-2 border-[#121212] ${
                  mode === 'chart' && viewType === 'cumulative' 
                    ? 'bg-[#121212] text-[#f8f7f4]' 
                    : 'text-[#121212] hover:bg-[#121212]/10'
                }`}
              >
                ยอดสะสม
              </button>
            </div>
          </div>
        </div>
      </div>

      {mode === 'chart' ? (
        <div>
          {/* Main Visual SVG Container - Snug fit brutalist card */}
          <div 
            className="w-full border-2 border-[#121212] bg-[#ffffff] p-2.5 sm:p-4 relative select-none shadow-[4px_4px_0_#121212] sm:shadow-[6px_6px_0_#121212]"
          >
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-auto block"
            >
              <defs>
                <linearGradient id="brutalist-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ff4d00" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingTop + chartPlotHeight - ratio * chartPlotHeight;
                const valueLabel = Math.round(ratio * currentMaxY);
                return (
                  <g key={ratio}>
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={svgWidth - paddingRight} 
                      y2={y} 
                      stroke="#121212" 
                      strokeWidth="1" 
                      strokeOpacity="0.1" 
                      strokeDasharray="3 3"
                    />
                    <text 
                      x={paddingLeft - 8} 
                      y={y + 3} 
                      textAnchor="end" 
                      className="font-mono text-[9px] fill-[#121212]/50"
                    >
                      {valueLabel}
                    </text>
                  </g>
                );
              })}

              {/* Target Line for Daily View */}
              {viewType === 'daily' && schedule?.targetPagesPerDay && (
                <g>
                  {(() => {
                    const targetY = paddingTop + chartPlotHeight - ((schedule.targetPagesPerDay / currentMaxY) * chartPlotHeight);
                    return (
                      <>
                        <line 
                          x1={paddingLeft} 
                          y1={targetY} 
                          x2={svgWidth - paddingRight} 
                          y2={targetY} 
                          stroke="#ff4d00" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 4" 
                        />
                        <text 
                          x={svgWidth - paddingRight} 
                          y={targetY - 5} 
                          textAnchor="end" 
                          className="font-mono text-[9px] font-bold fill-[#ff4d00]"
                        >
                          TARGET {schedule.targetPagesPerDay}P
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}

              {/* Area Fill */}
              {areaFillPath && (
                <path 
                  d={areaFillPath} 
                  fill="url(#brutalist-chart-gradient)" 
                />
              )}

              {/* Spline Path */}
              {splinePath && (
                <path 
                  d={splinePath} 
                  fill="none" 
                  stroke="#121212" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Data Points */}
              {points.map((pt, i) => {
                const isHovered = hoveredIndex === i;
                return (
                  <g 
                    key={pt.dateKey} 
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <circle 
                      cx={pt.cx} 
                      cy={pt.cy} 
                      r={isHovered ? 6 : 3.5} 
                      fill={isHovered ? "#ff4d00" : "#ffffff"} 
                      stroke="#121212" 
                      strokeWidth="2" 
                      className="transition-all duration-150"
                    />

                    {/* Interactive invisible hit box */}
                    <rect 
                      x={pt.cx - 10} 
                      y={paddingTop} 
                      width={20} 
                      height={chartPlotHeight} 
                      fill="transparent" 
                    />

                    {/* X-axis date labels */}
                    {i % 4 === 0 && (
                      <text 
                        x={pt.cx} 
                        y={svgHeight - 10} 
                        textAnchor="middle" 
                        className="font-mono text-[9px] fill-[#121212]/60"
                      >
                        {pt.displayDate}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      ) : (
        /* Logs Table View */
        <div className="border-2 border-[#121212] bg-[#ffffff] shadow-[8px_8px_0_#121212] overflow-x-auto">
          <div className="p-4 border-b-2 border-[#121212] flex items-center justify-between bg-[#f8f7f4]">
            <span className="font-mono text-xs uppercase font-bold">ประวัติบันทึกการอ่านทั้งหมด</span>
            <div className="relative">
              <input 
                type="text"
                placeholder="ค้นหาชื่อหนังสือ..."
                value={tableSearchTerm}
                onChange={(e) => setTableSearchTerm(e.target.value)}
                className="px-3 py-1 bg-white border border-[#121212] font-mono text-xs focus:outline-none"
              />
            </div>
          </div>
          <table className="archive-table mt-0">
            <thead>
              <tr className="bg-[#121212]/5">
                <th>วันและเวลา</th>
                <th>ชื่อหนังสือ</th>
                <th>จำนวนหน้า</th>
                <th>ช่วงหน้าที่อ่าน</th>
                <th>ช่องทาง</th>
              </tr>
            </thead>
            <tbody>
              {logs
                .filter(l => !tableSearchTerm || l.bookTitle.toLowerCase().includes(tableSearchTerm.toLowerCase()))
                .slice(0, 15)
                .map(log => (
                  <tr key={log.id}>
                    <td className="font-mono text-xs">{log.timestamp}</td>
                    <td className="font-semibold">{log.bookTitle}</td>
                    <td className="font-number text-xs font-bold text-[#ff4d00] tabular-nums">+{log.pagesRead} หน้า</td>
                    <td className="font-number text-xs text-neutral-600 tabular-nums">น. {log.fromPage} → น. {log.toPage}</td>
                    <td><span className="badge">{log.source}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary 2-cell Brutalist Strip - Single Row */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <div className="border-2 border-[#121212] bg-white p-3 sm:p-4 shadow-[2px_2px_0_#121212] sm:shadow-[3px_3px_0_#121212]">
          <span className="label text-[10px] sm:text-[11px] mb-1 block truncate">ยอดอ่านรวม 30 วัน</span>
          <div className="font-number text-xl sm:text-2xl md:text-3xl font-extrabold text-[#121212] tabular-nums leading-tight">
            {totalPagesInPeriod} <span className="text-xs font-sans font-medium text-neutral-500">หน้า</span>
          </div>
        </div>
        <div className="border-2 border-[#121212] bg-white p-3 sm:p-4 shadow-[2px_2px_0_#121212] sm:shadow-[3px_3px_0_#121212]">
          <span className="label text-[10px] sm:text-[11px] mb-1 block truncate">ค่าเฉลี่ยรายวัน</span>
          <div className="font-number text-xl sm:text-2xl md:text-3xl font-extrabold text-[#121212] tabular-nums leading-tight">
            {averageDailyPages} <span className="text-xs font-sans font-medium text-neutral-500">หน้า/วัน</span>
          </div>
        </div>
      </div>

    </div>
  );
};
