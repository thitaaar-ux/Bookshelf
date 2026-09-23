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
  Sparkles
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

  const daysGoalMet = useMemo(() => {
    return chartData.filter(d => d.isGoalMet).length;
  }, [chartData]);

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

  const activeDay = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div id="reading-velocity-section" className="space-y-6">
      
      {/* Header and Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b-2 border-[#121212]">
        <div>
          <span className="label">สถิติการอ่านย้อนหลัง 30 วัน</span>
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#121212] tracking-tight">
            ความเร็วและแนวโน้มการอ่าน
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Book Filter */}
          <div className="flex items-center gap-2 border-2 border-[#121212] bg-[#f8f7f4] px-3 py-1.5 text-xs">
            <BookOpen className="w-3.5 h-3.5" />
            <select
              value={selectedBookFilter}
              onChange={(e) => setSelectedBookFilter(e.target.value)}
              className="bg-transparent text-xs text-[#121212] focus:outline-none cursor-pointer font-mono uppercase"
            >
              <option value="all">ทุกเล่มในคลัง</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="flex border-2 border-[#121212] bg-[#f8f7f4] text-xs">
            <button
              onClick={() => setMode('chart')}
              className={`px-3 py-1.5 font-mono uppercase font-bold cursor-pointer transition ${
                mode === 'chart' 
                  ? 'bg-[#121212] text-[#f8f7f4]' 
                  : 'text-[#121212] hover:bg-[#121212]/10'
              }`}
            >
              กราฟ
            </button>
            <button
              onClick={() => setMode('table')}
              className={`px-3 py-1.5 font-mono uppercase font-bold cursor-pointer transition border-l-2 border-[#121212] ${
                mode === 'table' 
                  ? 'bg-[#121212] text-[#f8f7f4]' 
                  : 'text-[#121212] hover:bg-[#121212]/10'
              }`}
            >
              ตารางประวัติ
            </button>
          </div>

          {/* Daily vs Cumulative */}
          {mode === 'chart' && (
            <div className="flex border-2 border-[#121212] bg-[#f8f7f4] text-xs">
              <button
                onClick={() => setChartViewType('daily')}
                className={`px-3 py-1.5 font-mono uppercase font-bold cursor-pointer transition ${
                  viewType === 'daily' 
                    ? 'bg-[#121212] text-[#f8f7f4]' 
                    : 'text-[#121212] hover:bg-[#121212]/10'
                }`}
              >
                รายวัน
              </button>
              <button
                onClick={() => setChartViewType('cumulative')}
                className={`px-3 py-1.5 font-mono uppercase font-bold cursor-pointer transition border-l-2 border-[#121212] ${
                  viewType === 'cumulative' 
                    ? 'bg-[#121212] text-[#f8f7f4]' 
                    : 'text-[#121212] hover:bg-[#121212]/10'
                }`}
              >
                ยอดสะสม
              </button>
            </div>
          )}
        </div>
      </div>

      {mode === 'chart' ? (
        <div>
          {/* Main Visual SVG Container - Variation 2 Brutalist Paper Card */}
          <div 
            className="w-full border-2 border-[#121212] bg-[#ffffff] p-6 relative overflow-hidden select-none shadow-[8px_8px_0_#121212]"
            style={{ minHeight: '230px' }}
          >
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-auto block overflow-visible"
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

            {/* Hover details pill */}
            {activeDay && (
              <div className="mt-4 pt-4 border-t-2 border-[#121212] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="badge">{activeDay.dateKey}</span>
                  <span className="font-bold">{activeDay.dayOfWeek}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>หน้าที่อ่าน: <strong className="text-[#ff4d00]">{activeDay.pages} หน้า</strong></span>
                  <span>สะสมรวม: <strong>{activeDay.cumulativePages} หน้า</strong></span>
                  <span className={activeDay.isGoalMet ? 'text-green-700 font-bold' : 'text-[#121212]/50'}>
                    {activeDay.isGoalMet ? '✓ บรรลุเป้าหมาย' : 'ต่ำกว่าเป้าหมาย'}
                  </span>
                </div>
              </div>
            )}
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
                    <td className="font-mono text-xs font-bold text-[#ff4d00]">+{log.pagesRead} หน้า</td>
                    <td className="font-mono text-xs opacity-70">น. {log.fromPage} → น. {log.toPage}</td>
                    <td><span className="badge">{log.source}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary 3-cell Brutalist Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border-2 border-[#121212] bg-[#f8f7f4] p-4 shadow-[4px_4px_0_#121212]">
          <span className="label">ยอดอ่านรวม 30 วัน</span>
          <div className="font-display text-2xl font-extrabold text-[#121212]">{totalPagesInPeriod} <span className="text-xs font-mono font-normal">หน้า</span></div>
        </div>
        <div className="border-2 border-[#121212] bg-[#f8f7f4] p-4 shadow-[4px_4px_0_#121212]">
          <span className="label">ค่าเฉลี่ยรายวัน</span>
          <div className="font-display text-2xl font-extrabold text-[#121212]">{averageDailyPages} <span className="text-xs font-mono font-normal">หน้า/วัน</span></div>
        </div>
        <div className="border-2 border-[#121212] bg-[#f8f7f4] p-4 shadow-[4px_4px_0_#121212]">
          <span className="label">วันที่บรรลุเป้าหมาย</span>
          <div className="font-display text-2xl font-extrabold text-[#121212]">{daysGoalMet} <span className="text-xs font-mono font-normal">/ 30 วัน</span></div>
        </div>
      </div>

    </div>
  );
};
