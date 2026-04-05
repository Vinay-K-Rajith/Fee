import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ComposedChart, ReferenceLine,
  Area, AreaChart, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { useDashboard, formatCurrency, formatPercentage } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, AlertCircle, Calendar, BarChart3, Info, Clock, CheckCircle2 } from 'lucide-react';
import { BRAND_INDIGO, BRAND_GREEN, STATUS, CHART_COLORS, GRID_COLOR, tickStyle } from '@/theme';
import { SmartTooltip, CustomBarLabel, CustomBarLabelVertical, CustomAreaLabel } from '@/components/charts/chartUtils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';


export function CollectionPerformance() {
  const [yearFilter, setYearFilter] = useState<string>('2025-26');
  const { data: dashboard, isLoading, error } = useDashboard(yearFilter);

  if (isLoading) {
    return (
      <div className="space-y-8 p-8 animate-in fade-in duration-500">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500 text-lg">Error loading dashboard data</p>
      </div>
    );
  }

const { kpi, benchmarks, yearlyPerformance, monthlyPerformance, previousMonthlyPerformance, previousKpi, extendedAnalysis } = dashboard;
const { timelineStats, headwiseFees } = extendedAnalysis || {};

  // Calculate YoY percentage change
  const calculateYoy = (current: number, previous: number | undefined) => {
    if (!previous) return null;
    if (previous === 0) return current > 0 ? 100 : 0;
    const diff = current - previous;
    return (diff / previous) * 100;
  };

  // Year-filtered views
  const specificYearData = yearlyPerformance.find((y: any) => y.year === yearFilter);
  const displayRate = specificYearData ? specificYearData.collectionRate : kpi.collectionRate;
  const isGood = displayRate >= benchmarks.collectionRateBenchmark;

  // Monthly data is already filtered server-side — show the full 12-month FY timeline
  const displayMonthly = monthlyPerformance;

  // Actual vs Forecast split for YoY chart
  let lastActualIndex = -1;
  yearlyPerformance.forEach((y: any, i: number) => { if (!y.isForecast) lastActualIndex = i; });

  const forecastChartData = yearlyPerformance.map((d: any, index: number) => ({
    ...d,
    actualCollected: !d.isForecast ? d.totalCollected : null,
    forecastCollected: d.isForecast || index === lastActualIndex ? d.totalCollected : null,
    actualExpected: !d.isForecast ? d.totalExpected : null,
  }));

  // Build full 12-month installment data
  // Even if a month has 0 expected (not an installment month), it maintains the timeline grid
  const instalmentData = displayMonthly.map((m: any) => ({
    name: m.month,
    expected: m.totalExpected,
    collected: m.totalCollected,
    rate: m.totalExpected > 0 ? (m.totalCollected / m.totalExpected) * 100 : 0,
  }));

  // Build monthly comparison data (month vs previous year same month)
  const monthlyComparisonData = displayMonthly.map((m: any, idx: number) => {
    const prevMonth = previousMonthlyPerformance ? previousMonthlyPerformance.find((p: any) => p.month === m.month) : null;
    const prevCollected = prevMonth?.totalCollected || 0;
    const currentCollected = m.totalCollected || 0;
    const percentChange = prevCollected > 0 ? ((currentCollected - prevCollected) / prevCollected) * 100 : 0;
    
    return {
      month: m.month,
      current: currentCollected,
      previous: prevCollected,
      percentChange: percentChange,
      isPositive: percentChange >= 0,
    };
  });

  return (
    <div className="min-h-screen bg-transparent space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Collection Performance</h1>
          <p className="text-sm text-[#64748B] mt-1">Fee recovery trends — actual receipts by calendar month.</p>
        </div>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-[180px] bg-white border-slate-200">
            <Calendar className="w-4 h-4 mr-2 text-slate-500" />
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2023-24">2023-24</SelectItem>
            <SelectItem value="2024-25">2024-25</SelectItem>
            <SelectItem value="2025-26">2025-26</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Summary banner */}
      <Card className="bento-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-xl" style={{ background: BRAND_INDIGO }} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-800 mb-3">
              Collection Overview — <span style={{ color: BRAND_INDIGO }}>{yearFilter}</span>
            </h3>
            <div className="space-y-2">
              <div className="flex gap-2 items-start">
                {isGood
                  ? <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" style={{ color: BRAND_GREEN }} />
                  : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: STATUS.warning }} />}
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Benchmark:</span> Regional schools collect{' '}
                  <strong>{benchmarks.collectionRateBenchmark}%</strong>. Your rate is{' '}
                  <strong style={{ color: isGood ? BRAND_GREEN : STATUS.warning }}>{displayRate.toFixed(1)}%</strong>.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:flex md:gap-6">
            {[
              { 
                label: 'Collection Rate', 
                value: `${displayRate.toFixed(1)}%`, 
                color: isGood ? BRAND_GREEN : STATUS.warning,
                yoy: calculateYoy(displayRate, previousKpi?.collectionRate),
                tooltipTitle: 'Collection Performance',
                tooltipData: [
                  { label: 'Expected Revenue', value: formatCurrency(specificYearData?.totalExpected ?? kpi.totalExpected, true) },
                  { label: 'Regional Benchmark', value: `${benchmarks.collectionRateBenchmark}%` }
                ]
              },
              { 
                label: 'Total Collected', 
                value: formatCurrency(specificYearData?.totalCollected ?? kpi.totalFeeCollection, true), 
                color: BRAND_INDIGO,
                yoy: calculateYoy(specificYearData?.totalCollected ?? kpi.totalFeeCollection, previousKpi?.totalFeeCollection),
                tooltipTitle: 'Revenue Realized',
                tooltipData: [
                  { label: 'Total Received', value: formatCurrency(specificYearData?.totalCollected ?? kpi.totalFeeCollection) },
                  { label: 'Prev. Year', value: previousKpi ? formatCurrency(previousKpi.totalFeeCollection, true) : 'N/A' }
                ]
              },
              { 
                label: 'Outstanding', 
                value: formatCurrency(specificYearData?.totalBalance ?? kpi.totalBalance, true), 
                color: STATUS.danger,
                yoy: calculateYoy(specificYearData?.totalBalance ?? kpi.totalBalance, previousKpi?.totalBalance),
                tooltipTitle: 'Pending Balances',
                tooltipData: [
                  { label: 'Total Unpaid', value: formatCurrency(specificYearData?.totalBalance ?? kpi.totalBalance) },
                  { label: 'Defaulters Count', value: kpi.totalStudents ? dashboard.defaulterAnalysis?.activeDefaultersCount ?? 'N/A' : 'N/A' }
                ]
              },
              { 
                label: 'Bus Users', 
                value: dashboard.extendedAnalysis?.busUsersCount || '0', 
                color: '#EAB308',
                yoy: null,
                tooltipTitle: 'Transport Adoption',
                tooltipData: [
                  { label: 'Total Enrolled via Bus', value: dashboard.extendedAnalysis?.busUsersCount || '0' },
                ]
              },
            ].map((s: any) => (
              <TooltipProvider key={s.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-slate-50 rounded-xl px-5 py-4 text-center border border-slate-100 cursor-help">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                      <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                      {s.yoy !== null && s.yoy !== undefined && (
                        <div className="flex items-center justify-center gap-1 text-[10px] mt-2">
                          <span className={`font-medium flex items-center ${s.yoy >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {s.yoy >= 0 ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                            {s.yoy >= 0 ? 'Up' : 'Down'} {Math.abs(s.yoy).toFixed(1)}% from last year
                          </span>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="w-56 p-3 bg-slate-900 border-slate-800 shadow-xl" sideOffset={8}>
                    <p className="text-xs font-semibold text-white mb-2 pb-2 border-b border-slate-700/50">
                      {s.tooltipTitle}
                    </p>
                    <div className="space-y-2">
                      {s.tooltipData.map((data: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">{data.label}</span>
                          <span className="text-slate-100 font-medium">{data.value}</span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Monthly Collection by Receipt Date */}
        <Card className="bento-card">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Monthly Collection (by Receipt Date)</h3>
            <p className="text-xs text-slate-500">Fees actually received each calendar month, grouped by when payment was received.</p>
          </div>
          <div className="h-[280px] bg-white rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayMonthly} margin={{ top: 20, right: 10, bottom: 20, left: 0 }}>
                <defs>
                  <linearGradient id="colIndigoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_INDIGO} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={BRAND_INDIGO} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={tickStyle} tickFormatter={(v) => formatCurrency(v, true)} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<SmartTooltip />} />
                <Area type="monotone" dataKey="totalCollected" name="Collected" stroke={BRAND_INDIGO} strokeWidth={2.5} fillOpacity={1} fill="url(#colIndigoGrad)" dot={{ r: 4, fill: BRAND_INDIGO, stroke: '#fff', strokeWidth: 2 }} label={<CustomAreaLabel name="Collected" />} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 1b. Monthly Collection Comparison (Current vs Previous) */}
        <Card className="bento-card">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Monthly Instalment Comparison</h3>
              <p className="text-xs text-slate-500">Current year month vs previous year month collection — shows year-over-year changes.</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyComparisonData} margin={{ top: 20, right: 40, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} />
                <YAxis yAxisId="amt" tick={tickStyle} tickFormatter={(v) => formatCurrency(v, true)} axisLine={false} tickLine={false} />
                <YAxis yAxisId="pct" orientation="right" tick={tickStyle} tickFormatter={(v) => `${v.toFixed(0)}%`} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<SmartTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                  <Bar yAxisId="amt" dataKey="previous" name="Previous Year" fill="#CBD5E1" radius={[6, 6, 0, 0]} barSize={16} />
                  <Bar yAxisId="amt" dataKey="current" name="Current Year" fill={BRAND_INDIGO} radius={[6, 6, 0, 0]} barSize={16} />
                <Line yAxisId="pct" type="monotone" dataKey="percentChange" name="Change %" stroke={BRAND_GREEN} strokeWidth={2.5} dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return <circle cx={cx} cy={cy} r={4} fill={payload.isPositive ? BRAND_GREEN : STATUS.danger} stroke="#fff" strokeWidth={2} />;
                }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 2. Month-wise Fee Settlement */}
        <Card className="bento-card">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Month-wise Fee Settlement</h3>
            <p className="text-xs text-slate-500">Scheduled/Expected amounts mapped to actual realized collections per calendar month.</p>
          </div>
            <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={instalmentData} layout="vertical" margin={{ top: 10, right: 80, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={GRID_COLOR} />
                <XAxis type="number" tick={tickStyle} tickFormatter={(v) => formatCurrency(v, true)} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ ...tickStyle, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} width={44} />
                <RechartsTooltip content={<SmartTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                <Bar dataKey="expected" name="Expected/Scheduled" fill="#16A34A" radius={[0, 6, 6, 0]} barSize={16} label={<CustomBarLabelVertical name="Expected" />} />
                <Bar dataKey="collected" name="Actually Collected" fill={BRAND_INDIGO} radius={[0, 6, 6, 0]} barSize={16} label={<CustomBarLabelVertical name="Collected" />} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 3. Year-on-Year Performance */}
        <Card className="bento-card">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Year-on-Year Collection</h3>
            <p className="text-xs text-slate-500">Actual collection vs. expected per academic year. Benchmark: {benchmarks.collectionRateBenchmark}%.</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={yearlyPerformance.filter((y: any) => !y.isForecast)} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="year" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
                <YAxis yAxisId="amt" tick={tickStyle} tickFormatter={(v) => formatCurrency(v, true)} axisLine={false} tickLine={false} />
                <YAxis yAxisId="rate" orientation="right" tick={tickStyle} tickFormatter={(v) => `${v.toFixed(0)}%`} axisLine={false} tickLine={false} domain={[80, 105]} />
                <RechartsTooltip content={<SmartTooltip />} />
                <ReferenceLine yAxisId="rate" y={benchmarks.collectionRateBenchmark} stroke={STATUS.warning} strokeDasharray="4 4" label={{ value: `${benchmarks.collectionRateBenchmark}% target`, fill: STATUS.warning, fontSize: 10, position: 'insideTopLeft' }} />
                <Bar yAxisId="amt" dataKey="totalCollected" name="Collected" fill={BRAND_INDIGO} radius={[6, 6, 0, 0]} barSize={40} label={<CustomBarLabel name="Collected" />} />
                <Bar yAxisId="amt" dataKey="totalBalance" name="Outstanding" fill={`${STATUS.danger}60`} radius={[6, 6, 0, 0]} barSize={40} label={<CustomBarLabel name="Outstanding" />} />
                <Line yAxisId="rate" type="monotone" dataKey="collectionRate" name="Collection Rate %" stroke={BRAND_GREEN} strokeWidth={2.5} dot={{ r: 4, fill: BRAND_GREEN, strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 4. Forecasting — Actual vs Projected */}
        <Card className="bento-card">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Financial Forecasting</h3>
            <p className="text-xs text-slate-500">Solid = actual data · Dashed = linear regression projection for 2026-27 & 2027-28.</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastChartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_INDIGO} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={BRAND_INDIGO} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="year" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={tickStyle} tickFormatter={(v) => formatCurrency(v, true)} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<SmartTooltip />} />
                <Area connectNulls type="monotone" dataKey="actualCollected" name="Actual Collected" stroke={BRAND_INDIGO} strokeWidth={2.5} fill="url(#actualGrad)" dot={{ r: 4, fill: BRAND_INDIGO }} />
                <Line connectNulls type="monotone" dataKey="forecastCollected" name="Projected (Forecast)" stroke={BRAND_INDIGO} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4, fill: '#fff', stroke: BRAND_INDIGO, strokeWidth: 2 }} />
                <Line connectNulls type="monotone" dataKey="actualExpected" name="Expected" stroke={BRAND_GREEN} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 rounded" style={{ background: BRAND_INDIGO }} /><span className="text-[11px] text-slate-500">Actual</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 rounded" style={{ background: BRAND_INDIGO, opacity: 0.5, borderTop: '2px dashed', borderTopColor: BRAND_INDIGO }} /><span className="text-[11px] text-slate-500">Projected</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-0.5" style={{ background: BRAND_GREEN, opacity: 0.6, borderTop: '2px dashed', borderTopColor: BRAND_GREEN }} /><span className="text-[11px] text-slate-500">Expected</span></div>
          </div>
        </Card>

        {/* 5. Headwise Fee Distribution */}
        {headwiseFees && (
          <Card className="bento-card">
             <div className="mb-5 border-b border-slate-100 pb-4">
               <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Headwise Fee Realization</h3>
               <p className="text-xs text-slate-500">Distribution of collected revenue across different fee heads.</p>
             </div>
             <div className="flex gap-4 items-center">
                 <div className="h-[220px] w-1/2">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={[
                           { name: 'Tuition/School', value: headwiseFees.tuition },
                           { name: 'Bus Fee', value: headwiseFees.bus },
                           { name: 'Admission', value: headwiseFees.admission },
                           { name: 'Others', value: headwiseFees.others }
                         ].filter(d => d.value > 0)}
                         dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}
                       >
                         {CHART_COLORS.map((color, index) => <Cell key={index} fill={color} />)}
                       </Pie>
                       <RechartsTooltip formatter={(v: any) => formatCurrency(v, true)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
                 <div className="w-1/2 space-y-3">
                    {[
                      { name: 'Tuition/School Fees', value: headwiseFees.tuition, color: CHART_COLORS[0] },
                      { name: 'Bus Fees', value: headwiseFees.bus, color: CHART_COLORS[1] },
                      { name: 'Admissions', value: headwiseFees.admission, color: CHART_COLORS[2] },
                      { name: 'Other Dues', value: headwiseFees.others, color: CHART_COLORS[3] },
                    ].filter(d => d.value > 0).map(item => (
                       <div key={item.name} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                          <div className="flex gap-2 items-center">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                             <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-900">{formatCurrency(item.value, true)}</span>
                       </div>
                    ))}
                 </div>
             </div>
          </Card>
        )}
      </div>

      {/* Timeline & Late Fee Analytics moved to bottom */}
      {timelineStats && Array.isArray(timelineStats) && timelineStats.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Table spanning 2 cols */}
            <Card className="bento-card overflow-hidden lg:col-span-2">
              <div className="mb-5 border-b border-slate-100 pb-4">
                <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Installment-wise Payment Timeline</h3>
                <p className="text-xs text-slate-500">A detailed breakdown of payment behaviors mapping the speed of revenue per installment.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap table-fixed">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100/80">
                      <th className="px-5 py-3 font-semibold text-slate-500 uppercase text-[10px] tracking-widest bg-white w-1/4">Installment</th>
                      <th className="px-5 py-3 font-semibold text-slate-500 uppercase text-[10px] tracking-widest w-1/3">Payment Speed</th>
                      <th className="px-5 py-3 font-semibold text-slate-500 uppercase text-[10px] tracking-widest text-right w-1/5">Paid Before 15th</th>
                      <th className="px-5 py-3 font-semibold text-slate-500 uppercase text-[10px] tracking-widest text-right w-1/5">Paid After 15th</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {timelineStats.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-5 py-4 font-bold text-slate-800 border-r border-slate-50 bg-white group-hover:bg-transparent">{row.installment}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-slate-800 font-semibold text-[13px]">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500 border border-indigo-100 rounded-[3px] p-[1px] bg-indigo-50" /> {row.medianPaymentDate} <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-1">Median</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2 tracking-wide font-medium">
                            <Clock className="w-3 h-3 text-emerald-500" /> Last Settled: {row.lastPaymentDate}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-emerald-700 font-bold text-[13px] text-right">{formatCurrency(row.paidBefore15th, true)}</td>
                        <td className="px-5 py-4 text-rose-600 font-bold text-[13px] text-right">{formatCurrency(row.paidAfter15th, true)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Right Column Stats */}
            <div className="flex flex-col gap-6 w-full">
              {/* Late Fee Stats styled */}
              {dashboard.extendedAnalysis && (
                <Card className="flex flex-col p-6 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white shadow-xl shadow-slate-900/20 border-0 outline outline-1 outline-slate-700/50 relative overflow-hidden h-fit">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500 opacity-10 rounded-full blur-2xl" />
                  <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-slate-600 opacity-20 rounded-full blur-xl" />
                  
                  <div className="relative mb-8 mt-2">
                    <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.2em] opacity-90 drop-shadow-sm flex items-center justify-between">
                      <span>Penalty Realized</span>
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    </h3>
                    <div className="mt-3 text-5xl font-black text-white tracking-tighter drop-shadow-md">
                      {formatCurrency(dashboard.extendedAnalysis.totalLateFee, true)}
                    </div>
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center text-sm border-slate-700/50 bg-black/20 px-4 py-3.5 rounded-lg border border-white/5">
                      <span className="text-slate-300 font-medium">Levied Count</span>
                      <span className="font-bold text-white text-base">{dashboard.extendedAnalysis.lateFeeCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-slate-700/50 bg-black/20 px-4 py-3.5 rounded-lg border border-white/5">
                      <span className="text-slate-300 font-medium">Max Charge</span>
                      <span className="font-bold text-rose-400 text-base">₹{dashboard.extendedAnalysis.maxLateFee}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-slate-700/50 bg-black/20 px-4 py-3.5 rounded-lg border border-white/5">
                      <span className="text-slate-300 font-medium">Avg Delay Hit</span>
                      <span className="font-bold text-orange-400 text-base">₹{Math.floor(dashboard.extendedAnalysis.avgLateFee)}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Admission Fee Stats styled */}
              {dashboard.extendedAnalysis && (
                <Card className="flex flex-col p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl shadow-indigo-900/20 border-0 outline outline-1 outline-indigo-500/30 relative overflow-hidden h-fit">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500 opacity-20 rounded-full blur-2xl" />
                  <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-600 opacity-20 rounded-full blur-xl" />
                  
                  <div className="relative mb-8 mt-2">
                    <h3 className="text-[11px] font-bold text-indigo-200 uppercase tracking-[0.2em] opacity-90 drop-shadow-sm flex items-center justify-between">
                      <span>Admission Fees Realized</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </h3>
                    <div className="mt-3 text-5xl font-black text-white tracking-tighter drop-shadow-md">
                      {formatCurrency(dashboard.extendedAnalysis.headwiseFees?.admission || 0, true)}
                    </div>
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center text-sm border-slate-700/50 bg-black/20 px-4 py-3.5 rounded-lg border border-white/5">
                      <span className="text-indigo-200 font-medium">Total Admission Count</span>
                      <span className="font-bold text-white text-base">
                        {dashboard.admissionTypeAnalysis?.reduce((sum: number, a: any) => sum + (a.studentCount || 0), 0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-slate-700/50 bg-black/20 px-4 py-3.5 rounded-lg border border-white/5">
                      <span className="text-indigo-200 font-medium">New Enrolled</span>
                      <span className="font-bold text-white text-base">
                        {dashboard.admissionTypeAnalysis?.find((a: any) => String(a.admissionType).toUpperCase() === 'NEW')?.studentCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-slate-700/50 bg-black/20 px-4 py-3.5 rounded-lg border border-white/5">
                      <span className="text-indigo-200 font-medium">Old Enrolled (Readmission)</span>
                      <span className="font-bold text-white text-base">
                        {dashboard.admissionTypeAnalysis?.find((a: any) => String(a.admissionType).toUpperCase() === 'OLD')?.studentCount || 0}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
