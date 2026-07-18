import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { 
  DollarSign, 
  Clock, 
  Flame, 
  Utensils, 
  Car, 
  Cpu, 
  HeartPulse, 
  Check, 
  Square, 
  CheckSquare, 
  TrendingUp, 
  Calendar,
  Layers,
  ArrowUpRight,
  Trash2,
  Plus
} from 'lucide-react';
import { Transaction, CategoryData, CalendarBlock } from '../types';

interface DesktopDashboardProps {
  expenses: number;
  focusHours: number;
  streak: number;
  transactions: Transaction[];
  categories: CategoryData[];
  calendarBlocks: CalendarBlock[];
  onToggleCalendarBlock: (id: string) => void;
  onAddCalendarBlock?: (title: string, category: string, durationMin: number) => void;
  onDeleteTransaction?: (id: string) => void;
  glowLevel: 'off' | 'medium' | 'hyper';
  soundEnabled: boolean;
  onSimulateExpense: (category: string, amount: number) => void;
}

export const DesktopDashboard: React.FC<DesktopDashboardProps> = ({
  expenses,
  focusHours,
  streak,
  transactions,
  categories,
  calendarBlocks,
  onToggleCalendarBlock,
  onAddCalendarBlock,
  onDeleteTransaction,
  glowLevel,
  soundEnabled,
  onSimulateExpense
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'history'>('analytics');
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; amount: number; x: number; y: number } | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('work');
  const [newTaskDuration, setNewTaskDuration] = useState('60');

  // 1. Calculate dynamic trend values for SVG Graph
  // We compute daily spend totals for the last 7 days based on transactions.
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Base daily spending values to make the line look full and organic
  const baseSpending: Record<string, number> = {
    'Mon': 45.00,
    'Tue': 82.50,
    'Wed': 35.00,
    'Thu': 120.00,
    'Fri': 65.00,
    'Sat': 41.00,
    'Sun': 40.00
  };

  // Add user-registered transactions from the current session
  transactions.forEach((t) => {
    // Distribute into the current days based on timestamp
    const dayName = daysOfWeek[t.timestamp.getDay() === 0 ? 6 : t.timestamp.getDay() - 1];
    baseSpending[dayName] = (baseSpending[dayName] || 0) + t.amount;
  });

  const maxSpend = Math.max(...Object.values(baseSpending), 150);
  
  // SVG coordinates calculation for trend graph
  const svgWidth = 500;
  const svgHeight = 160;
  const padding = { top: 20, right: 30, bottom: 25, left: 40 };
  
  const graphPoints = daysOfWeek.map((day, idx) => {
    const x = padding.left + (idx * (svgWidth - padding.left - padding.right) / (daysOfWeek.length - 1));
    const val = baseSpending[day];
    // invert Y for SVG
    const y = svgHeight - padding.bottom - ((val / maxSpend) * (svgHeight - padding.top - padding.bottom));
    return { day, amount: val, x, y };
  });

  // SVG path generation
  const linePath = graphPoints.reduce((acc, p, idx) => {
    return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
  }, '');

  const areaPath = linePath + 
    `L ${graphPoints[graphPoints.length - 1].x} ${svgHeight - padding.bottom} ` +
    `L ${graphPoints[0].x} ${svgHeight - padding.bottom} Z`;

  // 2. Compute Donut Chart Angles
  const totalCategoryAmount = categories.reduce((sum, c) => sum + c.amount, 0);
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  
  let accumulatedPercent = 0;

  // Icon mapping helper
  const getIcon = (iconName: string, color: string) => {
    const props = { className: `w-4 h-4`, style: { color } };
    switch (iconName) {
      case 'Utensils': return <Utensils {...props} />;
      case 'Car': return <Car {...props} />;
      case 'Cpu': return <Cpu {...props} />;
      case 'HeartPulse': return <HeartPulse {...props} />;
      default: return <DollarSign {...props} />;
    }
  };

  // Glow shadow styling based on settings
  const glowStyle = {
    off: {},
    medium: { boxShadow: '0 0 15px rgba(0, 242, 254, 0.25)', border: '1px solid rgba(0, 242, 254, 0.35)' },
    hyper: { boxShadow: '0 0 25px rgba(0, 242, 254, 0.6)', border: '1px solid rgba(0, 242, 254, 0.7)' }
  }[glowLevel];

  // Data for Recharts Pie
  const pieData = categories.filter(c => c.amount > 0).map(c => ({
    name: c.name,
    value: c.amount,
    color: c.color
  }));

  return (
    <div 
      id="desktop-browser-frame"
      className="glass-panel w-full rounded-2xl overflow-hidden shadow-glass border border-white/5 flex flex-col h-full text-white"
      style={glowLevel !== 'off' ? glowStyle : {}}
    >
      {/* Chrome Window Header */}
      <div className="bg-[#05070c]/90 px-4 py-3 flex items-center justify-between border-b border-white/5 select-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        
        {/* URL Bar */}
        <div className="bg-white/5 px-4 py-1 rounded-md text-[11px] font-mono text-[#00f2fe]/70 border border-white/5 tracking-wider w-1/2 text-center flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe]/90 animate-pulse" />
          personal-os.io/secure-node
        </div>

        {/* Network State indicator */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
          <span className="text-[#00f2fe]">●</span> LOCALHOST_3000
        </div>
      </div>

      {/* Sub-nav banner */}
      <div className="bg-[#0a0e17]/40 px-6 py-3 border-b border-white/5 flex justify-between items-center text-xs">
        <div className="flex items-center gap-4">
          <span className="font-display font-medium text-white tracking-wide">DESKTOP SYSTEM VIEW</span>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2 text-gray-400">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-2.5 py-1 rounded transition-all font-mono text-[11px] ${activeTab === 'analytics' ? 'bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/30' : 'hover:text-white'}`}
            >
              METRICS
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-2.5 py-1 rounded transition-all font-mono text-[11px] ${activeTab === 'history' ? 'bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/30' : 'hover:text-white'}`}
            >
              LOGS ({transactions.length})
            </button>
          </div>
        </div>
        <div className="font-mono text-[10px] text-gray-400">
          STABLE_BUILD_2026 // TIME: 09:03
        </div>
      </div>

      {/* Main OS Interior Desktop Area */}
      <div className="p-6 flex-1 flex flex-col gap-5 overflow-y-auto cyber-grid">
        
        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          
          {/* Card 1: Expenses */}
          <motion.div 
            layoutId="kpi-expenses"
            className="glass-panel p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#00f2fe]/30 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00f2fe]/5 rounded-full blur-2xl group-hover:bg-[#00f2fe]/10 transition-all duration-500" />
            <div className="flex justify-between items-start">
              <span className="text-gray-400 text-xs font-medium tracking-wide">EXPENSES / WEEK</span>
              <div className="w-8 h-8 rounded-lg bg-[#00f2fe]/10 flex items-center justify-center text-[#00f2fe]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <motion.span 
                key={expenses}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-2xl font-display font-semibold tracking-tight text-white block"
              >
                ${expenses.toFixed(2)}
              </motion.span>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-mono">
                <TrendingUp className="w-3 h-3" />
                <span>+4.2% VS LAST WK</span>
              </div>
            </div>
            
            {/* Tiny sparkline SVG */}
            <div className="h-6 w-full mt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path 
                  d="M0,15 Q15,5 30,12 T60,4 T90,14 L100,10" 
                  fill="none" 
                  stroke="#00f2fe" 
                  strokeWidth="1.5" 
                  className="opacity-70"
                />
              </svg>
            </div>
          </motion.div>

          {/* Card 2: Focus Hours */}
          <motion.div 
            className="glass-panel p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#00f2fe]/30 transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#a855f7]/5 rounded-full blur-2xl" />
            <div className="flex justify-between items-start">
              <span className="text-gray-400 text-xs font-medium tracking-wide">FOCUS ENERGY</span>
              <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="my-2">
              <span className="text-2xl font-display font-semibold tracking-tight text-white block">
                {focusHours.toFixed(1)}h
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#00f2fe] font-mono">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f2fe] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00f2fe]"></span>
                </span>
                <span>ACTIVE STREAM_NODE</span>
              </div>
            </div>
            
            {/* Spark bars */}
            <div className="flex items-end gap-1 h-6 w-full mt-1">
              {[40, 60, 30, 80, 50, 90, 75, 45, 60].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-gradient-to-t from-[#a855f7]/40 to-[#00f2fe]/80 rounded-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </motion.div>

          {/* Card 3: Productivity Streak */}
          <motion.div 
            className="glass-panel p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-[#00f2fe]/30 transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#ef4444]/5 rounded-full blur-2xl" />
            <div className="flex justify-between items-start">
              <span className="text-gray-400 text-xs font-medium tracking-wide">FLOW STREAK</span>
              <div className="w-8 h-8 rounded-lg bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444]">
                <Flame className="w-4 h-4 animate-pulse" />
              </div>
            </div>
            <div className="my-2">
              <span className="text-2xl font-display font-semibold tracking-tight text-white block">
                {streak} Days
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-400 font-mono">
                <span>🔥 TOP 4% OF USERS</span>
              </div>
            </div>
            
            {/* Mini matrix grid */}
            <div className="grid grid-cols-7 gap-1 h-6 w-full mt-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`rounded-sm border border-white/5 ${i < streak ? 'bg-gradient-to-br from-amber-500/80 to-[#ef4444]/80 shadow-[0_0_5px_rgba(239,68,68,0.2)]' : 'bg-white/5'}`}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {activeTab === 'analytics' ? (
          <>
            {/* Row 2: Graph & Donut Side-By-Side */}
            <div className="grid grid-cols-12 gap-4 flex-1 min-h-[220px]">
              
              {/* Left Column: Glowing Spline Graph (Expenses Trends) */}
              <div className="col-span-8 glass-panel p-4 rounded-xl flex flex-col justify-between">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xs font-semibold tracking-wide text-gray-300">DAILY TREND ANALYSIS</span>
                    <span className="text-[10px] bg-[#00f2fe]/10 text-[#00f2fe] px-1.5 py-0.5 rounded font-mono">ROBUST_VIEW</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00f2fe]" /> Spend</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/20" /> Grid baseline</span>
                  </div>
                </div>

                {/* SVG Graph View */}
                <div className="relative flex-1 min-h-[150px] w-full">
                  <svg 
                    className="w-full h-full" 
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#00f2fe" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#00f2fe" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Guideline Grids */}
                    {[0.25, 0.5, 0.75, 1.0].map((pct, i) => {
                      const yPos = padding.top + (i * (svgHeight - padding.top - padding.bottom) / 3);
                      return (
                        <g key={i}>
                          <line 
                            x1={padding.left} 
                            y1={yPos} 
                            x2={svgWidth - padding.right} 
                            y2={yPos} 
                            stroke="rgba(0, 242, 254, 0.05)" 
                            strokeDasharray="2,3" 
                          />
                          <text 
                            x={padding.left - 8} 
                            y={yPos + 3} 
                            fill="rgba(255,255,255,0.3)" 
                            fontSize="8" 
                            fontFamily="monospace"
                            textAnchor="end"
                          >
                            ${Math.round(maxSpend * (1 - (yPos - padding.top)/(svgHeight - padding.top - padding.bottom)))}
                          </text>
                        </g>
                      );
                    })}

                    {/* Vertical Days Grids */}
                    {graphPoints.map((p, i) => (
                      <line 
                        key={i}
                        x1={p.x} 
                        y1={padding.top} 
                        x2={p.x} 
                        y2={svgHeight - padding.bottom} 
                        stroke="rgba(0, 242, 254, 0.03)" 
                      />
                    ))}

                    {/* Shaded Glowing Area Under Spline */}
                    <path 
                      d={areaPath} 
                      fill="url(#areaGlow)" 
                    />

                    {/* Spline Glowing Line */}
                    <path 
                      d={linePath} 
                      fill="none" 
                      stroke="url(#lineGlow)" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />

                    {/* Interactive Plot Nodes */}
                    {graphPoints.map((p, i) => {
                      const isHovered = hoveredPoint?.day === p.day;
                      return (
                        <g key={i}>
                          {/* Outer pulse circle on hover */}
                          {isHovered && (
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r="10" 
                              fill="rgba(0, 242, 254, 0.15)" 
                              className="animate-ping"
                            />
                          )}
                          
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r={isHovered ? "6" : "3.5"} 
                            fill={isHovered ? "#00f2fe" : "#05070c"}
                            stroke="#00f2fe"
                            strokeWidth="2"
                            className="cursor-pointer transition-all duration-150"
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredPoint({ 
                                day: p.day, 
                                amount: p.amount, 
                                x: p.x, 
                                y: p.y - 12
                              });
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Absolute Tooltip over Graph */}
                  <AnimatePresence>
                    {hoveredPoint && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bg-brand-black/90 text-white text-[10px] font-mono py-1 px-2 rounded border border-brand-cyan/40 shadow-neon-cyan select-none pointer-events-none"
                        style={{ 
                          left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                          top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                          transform: 'translate(-50%, -100%)'
                        }}
                      >
                        <span className="text-[#00f2fe]">{hoveredPoint.day}</span>: ${hoveredPoint.amount.toFixed(2)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between items-center px-8 text-[10px] font-mono text-gray-500 mt-1">
                  {daysOfWeek.map((day, i) => (
                    <span key={i} className="w-8 text-center hover:text-[#00f2fe] transition-all cursor-default">
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Donut Category Chart */}
              <div className="col-span-4 glass-panel p-4 rounded-xl flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-display text-xs font-semibold tracking-wide text-gray-300">ALLOCATION</span>
                  <span className="text-[10px] font-mono text-gray-400">SENS_VAL</span>
                </div>

                {/* Interactive Donut Render */}
                <div className="relative flex justify-center items-center h-[110px] my-1">
                  <svg className="w-[100px] h-[100px] transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r={radius} 
                      fill="none" 
                      stroke="rgba(255,255,255,0.03)" 
                      strokeWidth="8"
                    />
                    
                    {categories.map((c, i) => {
                      const percentage = totalCategoryAmount > 0 ? c.amount / totalCategoryAmount : 0.25;
                      const strokeDash = percentage * circumference;
                      const strokeOffset = circumference - (accumulatedPercent * circumference);
                      accumulatedPercent += percentage;

                      const isHovered = hoveredSlice === c.name;

                      return (
                        <circle 
                          key={i}
                          cx="50" 
                          cy="50" 
                          r={radius} 
                          fill="none" 
                          stroke={c.color} 
                          strokeWidth={isHovered ? "11" : "8"}
                          strokeDasharray={`${strokeDash} ${circumference}`}
                          strokeDashoffset={strokeOffset}
                          strokeLinecap="round"
                          className="transition-all duration-300 cursor-pointer"
                          style={{ filter: isHovered ? 'drop-shadow(0 0 4px rgba(0, 242, 254, 0.4))' : 'none' }}
                          onMouseEnter={() => setHoveredSlice(c.name)}
                          onMouseLeave={() => setHoveredSlice(null)}
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Central balance display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">TOTAL</span>
                    <span className="text-sm font-display font-bold text-white tracking-tight">
                      ${totalCategoryAmount.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Mini Categories Legend */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  {categories.map((c, i) => {
                    const percentage = totalCategoryAmount > 0 ? (c.amount / totalCategoryAmount) * 100 : 0;
                    return (
                      <div 
                        key={i} 
                        className={`flex items-center gap-1 p-1 rounded transition-all cursor-pointer ${hoveredSlice === c.name ? 'bg-white/5 border border-white/10' : 'border border-transparent'}`}
                        onMouseEnter={() => setHoveredSlice(c.name)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-400 font-medium truncate leading-tight uppercase text-[9px] tracking-wide">{c.name}</p>
                          <p className="font-mono text-white text-[9px]">{percentage.toFixed(0)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 3: Calendar Block Schedule Widget */}
            <div className="glass-panel p-4 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#00f2fe]" />
                  <span className="font-display text-xs font-semibold tracking-wide text-gray-300">CALENDAR-BLOCKING NODE</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 uppercase">CLICK TASK TO FOCUS & REGISTER TIME</span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {calendarBlocks.map((block) => {
                  const categoryColors = {
                    work: { bg: 'rgba(0, 242, 254, 0.04)', border: 'rgba(0, 242, 254, 0.2)', text: '#00f2fe' },
                    personal: { bg: 'rgba(168, 85, 247, 0.04)', border: 'rgba(168, 85, 247, 0.2)', text: '#a855f7' },
                    health: { bg: 'rgba(16, 185, 129, 0.04)', border: 'rgba(16, 185, 129, 0.2)', text: '#10b981' },
                    admin: { bg: 'rgba(244, 63, 94, 0.04)', border: 'rgba(244, 63, 94, 0.2)', text: '#f43f5e' }
                  }[block.category];

                  return (
                    <motion.div
                      key={block.id}
                      onClick={() => onToggleCalendarBlock(block.id)}
                      whileTap={{ scale: 0.98 }}
                      className="p-3 rounded-lg border cursor-pointer relative overflow-hidden group select-none transition-all duration-300 hover:scale-[1.01]"
                      style={{ 
                        backgroundColor: block.completed ? 'rgba(255, 255, 255, 0.01)' : categoryColors.bg,
                        borderColor: block.completed ? 'rgba(255, 255, 255, 0.05)' : categoryColors.border
                      }}
                    >
                      {/* Interactive focus check icon */}
                      <div className="absolute top-2 right-2">
                        {block.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-600 group-hover:text-[#00f2fe] transition-colors" />
                        )}
                      </div>

                      <div className="pr-4">
                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">
                          {block.time} ({block.durationMin}M)
                        </span>
                        <h4 className={`text-[11px] font-display font-medium mt-1 tracking-wide leading-tight ${block.completed ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                          {block.title}
                        </h4>
                        
                        {!block.completed && (
                          <div className="flex items-center gap-1 mt-1 text-[9px] font-mono" style={{ color: categoryColors.text }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: categoryColors.text }} />
                            <span>READY FOR FLOW (+{(block.durationMin/60).toFixed(1)}h)</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Add Task Form */}
              {onAddCalendarBlock && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="New block title..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[10px] font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#00f2fe]/50"
                    />
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="w-[70px] bg-white/5 border border-white/10 rounded px-1 py-1.5 text-[10px] font-mono text-gray-300 focus:outline-none focus:border-[#00f2fe]/50 appearance-none"
                    >
                      <option value="work">WORK</option>
                      <option value="personal">PERS</option>
                      <option value="health">HLTH</option>
                      <option value="admin">ADMN</option>
                    </select>
                    <input 
                      type="number"
                      placeholder="Min"
                      value={newTaskDuration}
                      onChange={(e) => setNewTaskDuration(e.target.value)}
                      className="w-[50px] bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[10px] font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#00f2fe]/50"
                    />
                    <button
                      onClick={() => {
                        if (newTaskTitle.trim() && parseInt(newTaskDuration) > 0) {
                          onAddCalendarBlock(newTaskTitle, newTaskCategory, parseInt(newTaskDuration));
                          setNewTaskTitle('');
                        }
                      }}
                      disabled={!newTaskTitle.trim()}
                      className="bg-[#00f2fe]/10 text-[#00f2fe] border border-[#00f2fe]/20 hover:bg-[#00f2fe]/20 px-2 py-1.5 rounded flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Logs Tab View */
          <div className="glass-panel p-4 rounded-xl flex-1 flex flex-col justify-between overflow-hidden min-h-[350px]">
            <div className="flex justify-between items-center mb-3">
              <span className="font-display text-xs font-semibold tracking-wide text-gray-300">REAL-TIME SYSTEM EXTRUDER LOGS</span>
              <span className="text-[9px] font-mono text-gray-500">TRANSACTIONS_NODE_DB_COUNT: {transactions.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 mb-2">
              <AnimatePresence initial={false}>
                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 font-mono text-xs gap-2 py-10">
                    <Layers className="w-8 h-8 opacity-40 animate-pulse text-[#00f2fe]" />
                    <span>No dynamic transactions registered yet.</span>
                    <span>Submit from the Mobile Tracker!</span>
                  </div>
                ) : (
                  [...transactions].reverse().map((t, idx) => {
                    const catObj = categories.find(c => c.name.toLowerCase() === t.category.toLowerCase());
                    return (
                      <motion.div 
                        key={t.id}
                        initial={{ opacity: 0, x: -10, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        exit={{ opacity: 0, x: 10, height: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="p-2.5 rounded bg-[#05070c]/60 border border-white/5 flex justify-between items-center text-xs font-mono group hover:border-[#00f2fe]/30"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-white/5 text-gray-400">
                            {catObj ? getIcon(catObj.iconName, catObj.color) : <DollarSign className="w-3 h-3" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-200 font-medium">{t.description || 'Quick Transaction'}</span>
                              <span className="text-[9px] bg-white/5 px-1 rounded text-gray-500 uppercase">{t.category}</span>
                            </div>
                            <span className="text-[9px] text-gray-600">ID: {t.id.slice(0, 8)} • {t.timestamp.toLocaleTimeString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-right">
                          <span className="text-[#00f2fe] font-semibold mr-1">${t.amount.toFixed(2)}</span>
                          {onDeleteTransaction && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onDeleteTransaction(t.id); }}
                              className="p-1 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <ArrowUpRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#00f2fe] transition-colors" />
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
            
            {/* Recharts Pie Chart Integration */}
            {pieData.length > 0 && (
              <div className="h-[140px] border-t border-white/5 pt-2 mb-2 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          style={{ filter: `drop-shadow(0 0 5px ${entry.color}40)` }} 
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(5, 7, 12, 0.9)', 
                        borderColor: 'rgba(0, 242, 254, 0.3)', 
                        borderRadius: '6px', 
                        fontSize: '10px', 
                        fontFamily: 'monospace',
                        boxShadow: '0 0 10px rgba(0, 242, 254, 0.2)'
                      }}
                      itemStyle={{ color: '#fff', textTransform: 'uppercase' }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'TOTAL']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-2 right-2 text-[8px] text-gray-500 font-mono">DISTRIBUIÇÃO</div>
              </div>
            )}
            
            {/* Quick inject simulator inside logs */}
            <div className="border-t border-white/5 pt-3 mt-1 flex items-center justify-between text-[11px]">
              <span className="text-gray-500 font-mono">DEBUG SEED ENGINE:</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => onSimulateExpense('tech', 89.99)}
                  className="px-2 py-1 rounded bg-[#a855f7]/10 hover:bg-[#a855f7]/20 border border-[#a855f7]/30 text-[#a855f7] font-mono text-[10px] transition-all"
                >
                  + $90 Tech
                </button>
                <button 
                  onClick={() => onSimulateExpense('food', 14.50)}
                  className="px-2 py-1 rounded bg-[#00f2fe]/10 hover:bg-[#00f2fe]/20 border border-[#00f2fe]/30 text-[#00f2fe] font-mono text-[10px] transition-all"
                >
                  + $14.50 Food
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
