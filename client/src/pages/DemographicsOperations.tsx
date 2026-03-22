import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, PieChart, Pie, Cell,
  BarChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useDashboard, formatCurrency, formatPercentage } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar, CreditCard, Wallet, Banknote,
  AlertCircle, Clock, CheckCircle2, RefreshCcw, TrendingUp, TrendingDown,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BRAND_INDIGO, BRAND_GREEN, STATUS, CHART_COLORS, GRID_COLOR, tickStyle } from '@/theme';
import { SmartTooltip, CustomBarLabel } from '@/components/charts/chartUtils';

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
  const classWiseData = defaulterAnalysis.classWise.slice(0, 14);
  const occupationPieData = defaulterAnalysis.occupationWise.slice(0, 6);

  // Radar: value in lakhs per payment mode (single metric, clean spider)
  const radarData = paymentModeAnalysis.map((m: any) => ({
    mode: m.paymentMode === 'Bank Transfer' ? 'Bank Tfr' : m.paymentMode,
    'Collection (₹L)': parseFloat((m.totalAmount / 100000).toFixed(2)),
  }));

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
            yoy: calculateYoy(totalTrans, previousKpi ? (previousKpi.paymentModes ? Object.values(previousKpi.paymentModes).reduce((a:any,b:any) => a+b, 0) : 0) : undefined)
          },
          {
            label: 'Digital Adoption',
            value: formatPercentage(digitalAdoptionRate),
            sub: `Target: ${benchmarks.digitalAdoptionTarget}%`,
            icon: <Banknote className="w-5 h-5" />,
            iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500',
            accent: BRAND_GREEN,
            yoy: calculateYoy(digitalAdoptionRate, previousKpi?.digitalAdoption)
          },
          {
            label: 'Avg Transaction Value',
            value: formatCurrency(avgTransaction),
            sub: `across ${totalTrans.toLocaleString('en-IN')} payments`,
            icon: <Wallet className="w-5 h-5" />,
            iconBg: 'bg-violet-50', iconColor: 'text-violet-500',
            accent: '#7C3AED',
            yoy: previousKpi ? calculateYoy(avgTransaction, avgTransaction * (1 - (previousKpi.totalFeeCollection / kpi.totalFeeCollection))) : null
          },
        ].map(s => (
          <Card key={s.label} className="bento-card">
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
                      {Math.abs(s.yoy).toFixed(1)}% YoY
                    </span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-xl shrink-0 ${s.iconBg} ${s.iconColor}`}>{s.icon}</div>
            </div>
          </Card>
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
                  <Tooltip contentStyle={WHITE_TIP} />
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
                <Tooltip contentStyle={WHITE_TIP} />
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

        <Card className="bento-card lg:col-span-6">
          <div className="mb-5">
            <h3 className="text-[15px] font-semibold text-slate-800">Class-wise Outstanding Balances</h3>
            <p className="text-xs text-slate-400 mt-0.5">Unpaid balances (bars) and defaulter count (line) per class.</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={classWiseData} margin={{ top: 10, right: 36, bottom: 28, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="className" tick={tickStyle} axisLine={false} tickLine={false} angle={-40} textAnchor="end" height={60} />
                <YAxis yAxisId="amt" tick={tickStyle} tickFormatter={(v) => formatCurrency(v, true)} axisLine={false} tickLine={false} width={60} />
                <YAxis yAxisId="cnt" orientation="right" tick={tickStyle} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<SmartTooltip />} />
                <Bar yAxisId="amt" dataKey="totalBalance" name="Outstanding Balance" fill={BRAND_INDIGO} radius={[4, 4, 0, 0]} barSize={16} fillOpacity={0.85} />
                <Line yAxisId="cnt" type="monotone" dataKey="defaulterCount" name="# Defaulters" stroke={STATUS.danger} strokeWidth={2} dot={{ r: 3, fill: STATUS.danger }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-5 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: BRAND_INDIGO }} /><span className="text-[11px] text-slate-500">Outstanding Balance</span></div>
            <div className="flex items-center gap-1.5"><div className="w-5 h-0.5" style={{ background: STATUS.danger }} /><span className="text-[11px] text-slate-500"># Defaulters</span></div>
          </div>
        </Card>

        <Card className="bento-card lg:col-span-5">
          <div className="mb-5">
            <h3 className="text-[15px] font-semibold text-slate-800">Payment Delay Buckets</h3>
            <p className="text-xs text-slate-400 mt-0.5">How many days after due date fees are settled.</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.extendedAnalysis.delayTimeBuckets} margin={{ top: 20, right: 10, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={WHITE_TIP} />
                <Bar dataKey="count" name="Transactions" radius={[7, 7, 0, 0]} barSize={40} label={<CustomBarLabel name="Transactions" />}>
                  {dashboard.extendedAnalysis.delayTimeBuckets.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
