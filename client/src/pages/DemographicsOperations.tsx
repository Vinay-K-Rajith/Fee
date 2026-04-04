import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ComposedChart, PieChart, Pie, Cell,
  BarChart, Line, LabelList,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend
} from 'recharts';
import { useDashboard, formatCurrency, formatPercentage } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Calendar, CreditCard, Wallet, Banknote,
  AlertCircle, Clock, CheckCircle2, RefreshCcw, TrendingUp, TrendingDown,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BRAND_INDIGO, BRAND_GREEN, STATUS, CHART_COLORS, GRID_COLOR, tickStyle } from '@/theme';
import { SmartTooltip, CustomBarLabel, CustomAreaLabel } from '@/components/charts/chartUtils';

const WHITE_TIP = {
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: 8,
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  padding: '10px 14px',
  fontSize: 12,
};

export function DemographicsOperations() {
  const [yearFilter, setYearFilter] = useState('2025-26');
  const { data: dashboard, isLoading, error } = useDashboard(yearFilter);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Error loading dashboard data</p>
      </div>
    );
  }

  const { paymentModeAnalysis, defaulterAnalysis, benchmarks, kpi, previousKpi } = dashboard;

  const calculateYoy = (current: number, previous: number | undefined) => {
    if (!previous) return null;
    if (previous === 0) return current > 0 ? 100 : 0;
    const diff = current - previous;
    return (diff / previous) * 100;
  };

  const digitalModes = ['Online', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking'];
  const totalTrans = paymentModeAnalysis.reduce((s: number, m: any) => s + m.transactionCount, 0);
  const digitalTrans = paymentModeAnalysis
    .filter((m: any) => digitalModes.includes(m.paymentMode))
    .reduce((s: number, m: any) => s + m.transactionCount, 0);
  const digitalAdoptionRate = totalTrans > 0 ? (digitalTrans / totalTrans) * 100 : 0;
  const totalAmount = paymentModeAnalysis.reduce((s: number, m: any) => s + m.totalAmount, 0);
  const avgTransaction = totalTrans > 0 ? totalAmount / totalTrans : 0;
  
  // Sort classes properly: NUR/KG first, then 1-12 with sections (A, B, etc)
  const sortClassWise = (data: any[]) => {
    const classOrder = ['NUR', 'KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    return [...data].sort((a, b) => {
      const aPrefix = a.className.match(/^[A-Z]+|\d+/)?.[0] || '';
      const bPrefix = b.className.match(/^[A-Z]+|\d+/)?.[0] || '';
      const aIdx = classOrder.indexOf(aPrefix);
      const bIdx = classOrder.indexOf(bPrefix);
      if (aIdx !== bIdx) return aIdx - bIdx;
      return a.className.localeCompare(b.className);
    });
  };
  
  const classWiseData = sortClassWise(defaulterAnalysis.classWise);
  const occupationPieData = defaulterAnalysis.occupationWise.slice(0, 6);

  // Radar: value in lakhs per payment mode (single metric, clean spider)
  const radarData = paymentModeAnalysis.map((m: any) => ({
    mode: m.paymentMode === 'Bank Transfer' ? 'Bank Tfr' : m.paymentMode,
    'Collection (₹L)': parseFloat((m.totalAmount / 100000).toFixed(2)),
  }));

  const flattenedDelayBuckets = dashboard.extendedAnalysis.delayTimeBuckets.map(bucket => {
      const obj: any = { label: bucket.label, Total: bucket.count };
      if (bucket.breakdown) {
         bucket.breakdown.forEach(b => {
             obj[b.mode] = b.count;
         });
      }
      return obj;
  });

  const umSet = new Set<string>();
  dashboard.extendedAnalysis.delayTimeBuckets.forEach(b => {
     if(b.breakdown) {
         b.breakdown.forEach(br => umSet.add(br.mode));
       }
  });
  const uniqueModes = Array.from(umSet);

  return (
    <div className="space-y-7 animate-in fade-in duration-500 pb-12">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Operations & Demographics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Payment behavior, channel mix, and class-level analytics.</p>
        </div>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-[160px] bg-white border-slate-200 text-sm">
            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2023-24">2023-24</SelectItem>
            <SelectItem value="2024-25">2024-25</SelectItem>
            <SelectItem value="2025-26">2025-26</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Row 1: Primary KPIs (3 wide cards) ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            label: 'Total Transactions',
            value: totalTrans.toLocaleString('en-IN'),
            sub: `${formatCurrency(totalAmount, true)} collected`,
            icon: <CreditCard className="w-5 h-5" />,
            iconBg: 'bg-blue-50', iconColor: 'text-blue-500',
            accent: '#3B82F6',
            yoy: calculateYoy(totalTrans, previousKpi ? (previousKpi.paymentModes ? Object.values(previousKpi.paymentModes).reduce((a:any,b:any) => a+b, 0) : 0) : undefined),
            tooltipTitle: 'Transaction Insights',
            tooltipData: [
              { label: 'Total Volume', value: totalTrans.toLocaleString('en-IN') },
              { label: 'Total Value', value: formatCurrency(totalAmount) }
            ]
          },
          {
            label: 'Digital Adoption',
            value: formatPercentage(digitalAdoptionRate),
            sub: `Target: ${benchmarks.digitalAdoptionTarget}%`,
            icon: <Banknote className="w-5 h-5" />,
            iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500',
            accent: BRAND_GREEN,
            yoy: calculateYoy(digitalAdoptionRate, previousKpi?.digitalAdoption),
            tooltipTitle: 'Digital Shift',
            tooltipData: [
              { label: 'Digital %', value: formatPercentage(digitalAdoptionRate) },
              { label: 'Digital Trans.', value: digitalTrans.toLocaleString() }
            ]
          },
          {
            label: 'Avg Transaction Value',
            value: formatCurrency(avgTransaction),
            sub: `across ${totalTrans.toLocaleString('en-IN')} payments`,
            icon: <Wallet className="w-5 h-5" />,
            iconBg: 'bg-violet-50', iconColor: 'text-violet-500',
            accent: '#7C3AED',
            yoy: previousKpi ? calculateYoy(avgTransaction, (previousKpi.totalFeeCollection || 0) / (Object.values(previousKpi.paymentModes || {}).reduce((a:any,b:any) => a+b, 0) || 1)) : null,
            tooltipTitle: 'Transaction Value',
            tooltipData: [
              { label: 'Avg Value', value: formatCurrency(avgTransaction) },
              { label: 'Collections', value: formatCurrency(totalAmount, true) }
            ]
          },
        ].map((s: any) => (
          <TooltipProvider key={s.label}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bento-card cursor-help">
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: s.accent }} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] uppercase font-semibold tracking-[0.08em] text-slate-400 mb-1">{s.label}</p>
                      <p className="text-[22px] font-semibold tracking-tight text-slate-900 leading-none mb-1">{s.value}</p>
                      <p className="text-[11px] text-slate-400">{s.sub}</p>
                      {s.yoy !== null && s.yoy !== undefined && (
                        <div className="flex items-center gap-1 text-[10px] mt-2">
                          <span className={`font-medium flex items-center ${s.yoy >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {s.yoy >= 0 ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                            {s.yoy >= 0 ? 'Up' : 'Down'} {Math.abs(s.yoy).toFixed(1)}% from last year
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-xl shrink-0 ${s.iconBg} ${s.iconColor}`}>{s.icon}</div>
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

      {/* ── Row 2: Secondary mini-stats (4 compact cards) ───────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Outstanding', value: formatPercentage(dashboard.extendedAnalysis.outstandingPercent), icon: <AlertCircle className="w-4 h-4" />, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Late Fees', value: formatCurrency(dashboard.extendedAnalysis.totalLateFee, true), icon: <Clock className="w-4 h-4" />, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Cheque Bounces', value: dashboard.extendedAnalysis.chequeBounces.toLocaleString(), icon: <RefreshCcw className="w-4 h-4" />, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Re-Admissions', value: dashboard.extendedAnalysis.reAdmissions.toLocaleString(), icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map(s => (
          <Card key={s.label} className="bento-card !p-5">
            <div className={`inline-flex p-2 rounded-lg ${s.bg} ${s.color} mb-3`}>{s.icon}</div>
            <p className="text-xl font-semibold tracking-tight text-slate-900 leading-none mb-1.5">{s.value}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* ── Row 3: Payment Radar (60%) + Occupation Donut (40%) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Payment Mode Spider — 3 col (60%) */}
        <Card className="bento-card lg:col-span-3">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-800">Payment Channel Mix</h3>
              <p className="text-xs text-slate-400 mt-0.5">Fee collection value (₹ Lakhs) per payment channel.</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-semibold">
              <TrendingUp className="w-3 h-3" />
              {formatPercentage(digitalAdoptionRate)} digital
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 items-center">
            {/* Spider — wider */}
            <div className="col-span-3 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis
                    dataKey="mode"
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#334155', fontFamily: '"Inter", sans-serif' }}
                  />
                  <PolarRadiusAxis
                    angle={60}
                    tick={{ fontSize: 9, fill: '#94A3B8' }}
                    axisLine={false}
                    tickCount={4}
                  />
                  <Radar
                    name="Collection (₹L)"
                    dataKey="Collection (₹L)"
                    stroke={BRAND_INDIGO}
                    fill={BRAND_INDIGO}
                    fillOpacity={0.2}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: BRAND_INDIGO, strokeWidth: 0 }}
                  />
                  <RechartsTooltip contentStyle={WHITE_TIP} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend — narrower */}
            <div className="col-span-2 flex flex-col gap-3 pl-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Channels</p>
              {paymentModeAnalysis.map((mode: any, idx: number) => {
                const pct = totalAmount > 0 ? (mode.totalAmount / totalAmount) * 100 : 0;
                return (
                  <div key={mode.paymentMode} className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-[12px] font-medium text-slate-700 truncate">{mode.paymentMode}</span>
                        <span className="text-[11px] font-semibold text-slate-900 shrink-0 ml-1">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatCurrency(mode.totalAmount, true)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Defaulters by Occupation Donut — 2 col (40%) */}
        <Card className="bento-card lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-[15px] font-semibold text-slate-800">Defaulters by Occupation</h3>
            <p className="text-xs text-slate-400 mt-0.5">Top 6 parent occupations by outstanding count.</p>
          </div>

          {/* Donut */}
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupationPieData}
                  dataKey="defaulterCount"
                  nameKey="occupation"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={48}
                  paddingAngle={3}
                >
                  {occupationPieData.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={WHITE_TIP} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Compact list */}
          <div className="mt-4 space-y-2">
            {occupationPieData.map((occ: any, idx: number) => (
              <div key={occ.occupation} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                  <span className="text-[12px] text-slate-600 truncate">{occ.occupation}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[12px] font-semibold text-slate-900">{occ.defaulterCount}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full">{occ.defaulterRate.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Row 4: Class-wise (55%) + Delay buckets (45%) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-6">

        <Card className="bento-card lg:col-span-6 flex flex-col">
          <div className="mb-5">
            <h3 className="text-[15px] font-semibold text-slate-800">Class-wise Outstanding Balances</h3>
            <p className="text-xs text-slate-400 mt-0.5">Unpaid balances (bars) and defaulter count (line) per class.</p>
          </div>
          <div className="flex-1 min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={classWiseData} margin={{ top: 10, right: 40, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="className" tick={{ fontSize: 8, fontWeight: 500, fill: '#64748B' }} axisLine={false} tickLine={false} angle={-90} textAnchor="end" height={120} interval={0} />
                <YAxis yAxisId="amt" tick={tickStyle} tickFormatter={(v) => formatCurrency(v, true)} axisLine={false} tickLine={false} width={60} />
                <YAxis yAxisId="cnt" orientation="right" type="number" ticks={[0, 2, 4, 6, 8]} domain={[0, 8]} tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={20} />
                <RechartsTooltip content={<SmartTooltip />} />
                <Bar yAxisId="amt" dataKey="totalBalance" name="Outstanding Balance" fill={BRAND_INDIGO} radius={[4, 4, 0, 0]} barSize={14} fillOpacity={0.85} />
                <Line yAxisId="cnt" type="monotone" dataKey="defaulterCount" name="# Defaulters" stroke={STATUS.danger} strokeWidth={2} dot={{ r: 3, fill: STATUS.danger }}>
                  <LabelList dataKey="defaulterCount" position="top" content={<CustomAreaLabel name="Defaulters" />} />
                </Line>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {/* Legend & Stats */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: BRAND_INDIGO }} /><span className="text-[9px] text-slate-500">Outstanding Balance</span></div>
              <div className="flex items-center gap-1.5"><div className="w-5 h-0.5" style={{ background: STATUS.danger }} /><span className="text-[9px] text-slate-500"># Defaulters</span></div>
            </div>
            {/* Quick Stats to use empty space at the bottom */}
            <div className="flex gap-4">
              {(() => {
                const highestAmount = [...classWiseData].sort((a, b) => b.totalBalance - a.totalBalance)[0];
                const highestCount = [...classWiseData].sort((a, b) => b.defaulterCount - a.defaulterCount)[0];
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-slate-400">Highest Due:</p>
                      <p className="text-[11px] font-semibold text-slate-700">{highestAmount?.className} <span className="text-indigo-600">({formatCurrency(highestAmount?.totalBalance || 0, true)})</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-slate-400">Most Defaulters:</p>
                      <p className="text-[11px] font-semibold text-slate-700">{highestCount?.className} <span className="text-red-500">({highestCount?.defaulterCount || 0})</span></p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </Card>

        <Card className="bento-card lg:col-span-5">
          <div className="mb-5">
            <h3 className="text-[15px] font-semibold text-slate-800">Payment Delay Buckets</h3>
            <p className="text-xs text-slate-400 mt-0.5">How many days after due date fees are settled.</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flattenedDelayBuckets} margin={{ top: 30, right: 10, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const total = payload[0].payload.Total || 1;
                      return (
                        <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-3 text-sm text-slate-100">
                          <p className="font-semibold border-b border-slate-700 pb-2 mb-2">{label} <span className="text-slate-400 font-normal ml-2">(Total: {payload[0].payload.Total})</span></p>
                          <div className="space-y-1.5">
                            {payload.map((entry: any, index: number) => {
                              const percent = ((entry.value / total) * 100).toFixed(1);
                              return (
                                <div key={index} className="flex justify-between items-center gap-6">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: entry.color }} />
                                    <span className="text-slate-300">{entry.name}</span>
                                  </div>
                                  <div className="font-medium text-right flex items-center gap-2">
                                    <span>{entry.value}</span>
                                    <span className="text-slate-500 text-[10px] w-8 text-right bg-slate-800 px-1 py-0.5 rounded">{percent}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                {uniqueModes.map((mode, idx) => {
                  const isLast = idx === uniqueModes.length - 1;
                  return (
                    <Bar key={mode} dataKey={mode} stackId="a" name={mode} fill={CHART_COLORS[idx % CHART_COLORS.length]} radius={isLast ? [4,4,0,0] : [0,0,0,0]} barSize={40}>
                      {isLast && <LabelList dataKey="Total" position="top" style={{ fontSize: '11px', fontWeight: 600, fill: '#475569' }} />}
                    </Bar>
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
