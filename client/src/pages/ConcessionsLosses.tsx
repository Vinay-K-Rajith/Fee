import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ComposedChart, Area, AreaChart,
  PieChart, Pie, Cell, Line, BarChart, ReferenceLine,
} from 'recharts';
import { useDashboard, formatCurrency, formatPercentage } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Calendar, Coins, Percent, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BRAND_INDIGO, BRAND_GREEN, STATUS, CHART_COLORS, GRID_COLOR, tickStyle } from '@/theme';
import { SmartTooltip, CustomBarLabel } from '@/components/charts/chartUtils';


export function ConcessionsLosses() {
  const [yearFilter, setYearFilter] = useState('2025-26');
  const { data: dashboard, isLoading, error } = useDashboard(yearFilter);

  if (isLoading) {
    return (
      <div className="space-y-8 p-8 animate-in fade-in duration-500">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
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

  const { yearlyPerformance, monthlyPerformance, concessionAnalysis, benchmarks, kpi, previousKpi } = dashboard;

  const calculateYoy = (current: number, previous: number | undefined) => {
    if (!previous) return null;
    if (previous === 0) return current > 0 ? 100 : 0;
    const diff = current - previous;
    return (diff / previous) * 100;
  };

  // Split actual vs forecast for YoY concession chart
  let lastActualIdx = -1;
  yearlyPerformance.forEach((y: any, i: number) => { if (!y.isForecast) lastActualIdx = i; });

  const concessionChartData = yearlyPerformance.map((d: any, i: number) => ({
    year: d.year,
    actualConcession: !d.isForecast ? d.totalConcession : null,
    projectedConcession: (d.isForecast || i === lastActualIdx) ? d.totalConcession : null,
    isForecast: d.isForecast,
  }));

  return (
    <div className="min-h-screen bg-transparent space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Concessions & Revenue Loss</h1>
          <p className="text-sm text-[#64748B] mt-1">Tracking financial leaks through concessions, waivers, and dropouts.</p>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            label: 'Total Concessions', 
            value: formatCurrency(concessionAnalysis.totalConcession, true), 
            icon: <Coins className="w-5 h-5" />, 
            bg: 'bg-orange-50', 
            iconColor: 'text-orange-500',
            yoy: calculateYoy(concessionAnalysis.totalConcession, previousKpi?.totalConcession),
            tooltipTitle: 'Total Concessions Value',
            tooltipData: [
              { label: 'Amount Given', value: formatCurrency(concessionAnalysis.totalConcession) },
              { label: 'Total Expected', value: formatCurrency(kpi.totalExpected) }
            ]
          },
          { 
            label: 'Concession Rate', 
            value: formatPercentage(concessionAnalysis.concessionRate), 
            icon: <Percent className="w-5 h-5" />, 
            bg: 'bg-blue-50', 
            iconColor: 'text-blue-500',
            yoy: calculateYoy(concessionAnalysis.concessionRate, previousKpi?.concessionRate),
            tooltipTitle: 'Concession Rate Impact',
            tooltipData: [
              { label: 'Current Rate', value: formatPercentage(concessionAnalysis.concessionRate) },
              { label: 'Benchmark', value: `${benchmarks.concessionRateBenchmark}%` }
            ]
          },
          { 
            label: 'Avg / Student', 
            value: concessionAnalysis.studentsWithConcession > 0 ? formatCurrency(concessionAnalysis.avgConcessionPerStudent) : '₹0', 
            icon: <FileText className="w-5 h-5" />, 
            bg: 'bg-emerald-50', 
            iconColor: 'text-emerald-500',
            yoy: previousKpi && previousKpi.totalConcession ? calculateYoy(concessionAnalysis.avgConcessionPerStudent, (previousKpi.totalConcession / previousKpi.totalStudents)) : null,
            tooltipTitle: 'Per Student Average',
            tooltipData: [
              { label: 'Total Receiving', value: concessionAnalysis.studentsWithConcession },
              { label: 'Avg Concession', value: formatCurrency(concessionAnalysis.avgConcessionPerStudent) }
            ]
          },
        ].map((s: any) => (
          <TooltipProvider key={s.label}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bento-card cursor-help">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#64748B] text-[11px] uppercase font-semibold tracking-[0.1em] mb-2">{s.label}</p>
                      <p className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">{s.value}</p>
                      {s.yoy !== null && s.yoy !== undefined && (
                        <div className="flex items-center gap-1.5 text-xs mt-2">
                          <span className={`font-medium flex items-center ${s.yoy >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {s.yoy >= 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
                            {Math.abs(s.yoy).toFixed(1)}% Annual Growth
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-xl shrink-0 ${s.bg} ${s.iconColor}`}>{s.icon}</div>
                  </div>
                </Card>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Annual Growth Concessions — Actual vs Projected */}
        <Card className="bento-card">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Annual Growth Concessions</h3>
            <p className="text-xs text-slate-500">
              Solid = actual data · Dashed amber = linear regression projection (not real data).
              Benchmark: cap concessions at {benchmarks.concessionRateBenchmark}% of total collection.
            </p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={concessionChartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <defs>
                  <linearGradient id="actualConGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_INDIGO} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={BRAND_INDIGO} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="year" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={tickStyle} tickFormatter={(v) => formatCurrency(v, true)} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<SmartTooltip />} />
                {/* Actual — solid indigo area */}
                <Area connectNulls type="monotone" dataKey="actualConcession" name="Actual Concessions" stroke={BRAND_INDIGO} strokeWidth={2.5} fill="url(#actualConGrad)" dot={{ r: 4, fill: BRAND_INDIGO }} />
                {/* Projected — dashed amber line, no fill */}
                <Line connectNulls type="monotone" dataKey="projectedConcession" name="Projected (Forecast)" stroke={STATUS.warning} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4, fill: '#fff', stroke: STATUS.warning, strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 rounded" style={{ background: BRAND_INDIGO }} /><span className="text-[11px] text-slate-500">Actual</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 rounded" style={{ borderTop: `2px dashed ${STATUS.warning}` }} /><span className="text-[11px] text-slate-500">Projected</span></div>
          </div>
        </Card>

        {/* Month-on-Month Concessions */}
        <Card className="bento-card">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Month-on-Month Concessions</h3>
            <p className="text-xs text-slate-500">Concessions approved each month. Target: stay within 2% of monthly collection.</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPerformance} margin={{ top: 20, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={tickStyle} tickFormatter={(v) => formatCurrency(v, true)} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<SmartTooltip />} />
                <Bar dataKey="concessionGiven" name="Concessions Given" fill={STATUS.warning} radius={[6, 6, 0, 0]} barSize={24} label={<CustomBarLabel name="Concessions Given" />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Concession Type Breakdown */}
        <Card className="bento-card lg:col-span-2">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Concession Beneficiaries by Type</h3>
            <p className="text-xs text-slate-500">Concession types and the default rate among beneficiaries. Target: &lt;10% default rate.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Donut */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={concessionAnalysis.concessionTypeWise}
                    dataKey="studentCount"
                    nameKey="concessionType"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={60}
                    paddingAngle={2}
                    label={({ concessionType, percent }) => `${concessionType}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {concessionAnalysis.concessionTypeWise.map((_: any, index: number) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(v: any, name: string) => [v, name]}
                    contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '8px 12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Type list */}
            <div className="flex flex-col justify-center space-y-3">
              {concessionAnalysis.concessionTypeWise.map((type: any, idx: number) => (
                <div key={type.concessionType} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{type.concessionType}</p>
                      <p className="text-xs text-slate-500">{type.studentCount} students · {formatCurrency(type.totalAmount, true)}</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={type.defaulterRate > 10 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}
                  >
                    {formatPercentage(type.defaulterRate)} defaults
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
