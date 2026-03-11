import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, ReferenceLine,
  Area, AreaChart, Legend,
} from 'recharts';
import { useDashboard, formatCurrency, formatPercentage } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, AlertCircle, Calendar, BarChart3 } from 'lucide-react';
import { BRAND_INDIGO, BRAND_GREEN, STATUS, CHART_COLORS, GRID_COLOR, tickStyle } from '@/theme';
import { SmartTooltip } from '@/components/charts/chartUtils';


export function CollectionPerformance() {
  const { data: dashboard, isLoading, error } = useDashboard();
  const [yearFilter, setYearFilter] = useState<string>('2025-26');

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

  const { kpi, benchmarks, yearlyPerformance, monthlyPerformance } = dashboard;

  // Year-filtered views
  const specificYearData = yearlyPerformance.find((y: any) => y.year === yearFilter);
  const displayRate = specificYearData ? specificYearData.collectionRate : kpi.collectionRate;
  const isGood = displayRate >= benchmarks.collectionRateBenchmark;

  // Monthly data is already filtered server-side — no scale needed
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

  // Instalment-wise data from monthly aggregated by install period (APR, AUG, DEC → Q1/Q2/Q3)
  const instGroups = [
    { name: 'Apr Instalment', months: ['Apr', 'May'] },
    { name: 'Aug Instalment', months: ['Aug', 'Sep'] },
    { name: 'Dec Instalment', months: ['Dec', 'Jan'] },
  ];
  const instalmentData = instGroups.map(g => {
    const rows = displayMonthly.filter((m: any) => g.months.includes(m.month));
    const expected = rows.reduce((s: number, r: any) => s + r.totalExpected, 0);
    const collected = rows.reduce((s: number, r: any) => s + r.totalCollected, 0);
    return { name: g.name, expected, collected, rate: expected > 0 ? (collected / expected) * 100 : 0 };
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
              { label: 'Collection Rate', value: `${displayRate.toFixed(1)}%`, color: isGood ? BRAND_GREEN : STATUS.warning },
              { label: 'Total Collected', value: formatCurrency(specificYearData?.totalCollected ?? kpi.totalFeeCollection, true), color: BRAND_INDIGO },
              { label: 'Outstanding', value: formatCurrency(specificYearData?.totalBalance ?? kpi.totalBalance, true), color: STATUS.danger },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-xl px-5 py-4 text-center border border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
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
              <AreaChart data={displayMonthly} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <defs>
                  <linearGradient id="colIndigoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND_INDIGO} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={BRAND_INDIGO} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={tickStyle} tickFormatter={(v) => formatCurrency(v, true)} axisLine={false} tickLine={false} />
                <Tooltip content={<SmartTooltip />} />
                <Area type="monotone" dataKey="totalCollected" name="Collected" stroke={BRAND_INDIGO} strokeWidth={2.5} fillOpacity={1} fill="url(#colIndigoGrad)" dot={{ r: 3, fill: BRAND_INDIGO }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 2. Installment-wise Collection */}
        <Card className="bento-card">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Instalment-wise Collection Rate</h3>
            <p className="text-xs text-slate-500">Collection performance per instalment cycle (Apr / Aug / Dec).</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={instalmentData} layout="vertical" margin={{ top: 10, right: 50, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={GRID_COLOR} />
                <XAxis type="number" tick={tickStyle} tickFormatter={(v) => formatCurrency(v, true)} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ ...tickStyle, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip content={<SmartTooltip />} />
                <Bar dataKey="expected" name="Scheduled" fill="#E2E8F0" radius={[0, 4, 4, 0]} barSize={18} />
                <Bar dataKey="collected" name="Collected" fill={BRAND_INDIGO} radius={[0, 4, 4, 0]} barSize={18} />
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
                <Tooltip content={<SmartTooltip />} />
                <ReferenceLine yAxisId="rate" y={benchmarks.collectionRateBenchmark} stroke={STATUS.warning} strokeDasharray="4 4" label={{ value: `${benchmarks.collectionRateBenchmark}% target`, fill: STATUS.warning, fontSize: 10, position: 'insideTopLeft' }} />
                <Bar yAxisId="amt" dataKey="totalCollected" name="Collected" fill={BRAND_INDIGO} radius={[4, 4, 0, 0]} barSize={36} />
                <Bar yAxisId="amt" dataKey="totalBalance" name="Outstanding" fill={`${STATUS.danger}60`} radius={[4, 4, 0, 0]} barSize={36} />
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
                <Tooltip content={<SmartTooltip />} />
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
      </div>
    </div>
  );
}
