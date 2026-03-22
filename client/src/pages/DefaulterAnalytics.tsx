import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Area, AreaChart, Line, Legend,
} from 'recharts';
import { useDashboard, formatCurrency, formatPercentage } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Users, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { DefaultersTable } from '@/components/views/DefaultersTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BRAND_INDIGO, BRAND_GREEN, STATUS, CHART_COLORS, GRID_COLOR, tickStyle } from '@/theme';
import { SmartTooltip, CustomBarLabel, CustomBarLabelVertical, CustomAreaLabel } from '@/components/charts/chartUtils';


export function DefaulterAnalytics() {
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

  const { yearlyPerformance, monthlyPerformance, defaulterAnalysis, benchmarks, kpi, previousKpi } = dashboard;
  
  const calculateYoy = (current: number, previous: number | undefined) => {
    if (!previous) return null;
    if (previous === 0) return current > 0 ? 100 : 0;
    const diff = current - previous;
    return (diff / previous) * 100;
  };

  const avgDebt = defaulterAnalysis.activeDefaultersCount > 0
        ? defaulterAnalysis.totalBalance / defaulterAnalysis.activeDefaultersCount
      : 0;

  // Build monthly comparison data (month vs previous month)
  const monthlyComparisonData = monthlyPerformance.map((m: any, idx: number) => {
    const prevMonth = idx > 0 ? monthlyPerformance[idx - 1] : null;
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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Defaulter Analytics</h1>
          <p className="text-sm text-[#64748B] mt-1">Identify trends, target interventions, and understand parent behavior.</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Active Defaulters', 
            value: String(defaulterAnalysis.activeDefaultersCount), 
            icon: <AlertTriangle className="w-5 h-5" />, 
            bg: 'bg-red-50', 
            color: 'text-red-500',
            yoy: calculateYoy(defaulterAnalysis.activeDefaultersCount, previousKpi?.activeDefaultersCount)
          },
          { 
            label: 'Historical Defaulters', 
            value: String(defaulterAnalysis.totalDefaulters), 
            icon: <Users className="w-5 h-5" />, 
            bg: 'bg-orange-50', 
            color: 'text-orange-500',
            yoy: calculateYoy(defaulterAnalysis.totalDefaulters, previousKpi?.totalDefaulters)
          },
          { 
            label: 'Total Defaulted Payments', 
            value: String(defaulterAnalysis.totalDefaultedPayments), 
            icon: <TrendingDown className="w-5 h-5" />, 
            bg: 'bg-slate-50', 
            color: 'text-slate-500',
            yoy: calculateYoy(defaulterAnalysis.totalDefaultedPayments, previousKpi?.totalDefaultedPayments)
          },
          { 
            label: 'Total Outstanding', 
            value: formatCurrency(defaulterAnalysis.totalBalance, false), 
            icon: <AlertTriangle className="w-5 h-5" />, 
            bg: 'bg-rose-50', 
            color: 'text-rose-600',
            yoy: calculateYoy(defaulterAnalysis.totalBalance, previousKpi?.totalBalance)
          },
        ].map(s => (
          <Card key={s.label} className="bento-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[#64748B] text-[11px] uppercase font-semibold tracking-[0.1em] mb-2">{s.label}</p>
                <p className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">{s.value}</p>
                {s.yoy !== null && s.yoy !== undefined && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className={`font-medium flex items-center ${s.yoy >= 0 ? (s.label.includes('Defaulter') ? 'text-rose-600' : 'text-emerald-600') : (s.label.includes('Defaulter') ? 'text-emerald-600' : 'text-rose-600')}`}>
                      {s.yoy >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {Math.abs(s.yoy).toFixed(1)}% YoY
                    </span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-xl shrink-0 ${s.bg} ${s.color}`}>{s.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* YoY Outstanding Balance */}
        <Card className="bento-card">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Year-on-Year Outstanding Balance</h3>
            <p className="text-xs text-slate-500">Cumulative unpaid balances per academic year. Benchmark: keep defaulter rate below {benchmarks.defaulterRateBenchmark}%.</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyPerformance.filter((y: any) => !y.isForecast)} margin={{ top: 20, right: 10, bottom: 20, left: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={STATUS.danger} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={STATUS.danger} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="year" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={tickStyle} tickFormatter={(v) => formatCurrency(v, true)} axisLine={false} tickLine={false} />
                <Tooltip content={<SmartTooltip />} />
                <Area type="monotone" dataKey="totalBalance" name="Outstanding Balance" stroke={STATUS.danger} strokeWidth={2.5} fillOpacity={1} fill="url(#balanceGrad)" dot={{ r: 5, fill: STATUS.danger, stroke: '#fff', strokeWidth: 2 }} label={<CustomAreaLabel name="Outstanding Balance" />} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Month-on-Month Total Defaulted Payments */}
        <Card className="bento-card">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Month-on-Month Late Payment Transactions</h3>
            <p className="text-xs text-slate-500">Count of individual payment transactions received after the due date each month.</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyPerformance} margin={{ top: 20, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<SmartTooltip />} />
                <Bar dataKey="latePaymentCount" name="Late Payments" fill={`${STATUS.warning}CC`} radius={[7, 7, 0, 0]} barSize={26} label={<CustomBarLabel name="Late Payments" />} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Current Year Top Defaulters & Location-wise Analysis - Adjacent Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Year Top Defaulters by Late Payments */}
        <Card className="bento-card flex flex-col">
          <div className="mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-[14px] font-semibold text-slate-800 mb-1">Current Year - Top Defaulters</h3>
            <p className="text-xs text-slate-500">Top students with highest late payment transactions requiring intervention.</p>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 sticky top-0 bg-slate-50">
                    <th className="py-2 px-3 font-semibold text-slate-800 text-xs">Rank</th>
                    <th className="py-2 px-3 font-semibold text-slate-800 text-xs">Name</th>
                    <th className="py-2 px-3 font-semibold text-slate-800 text-xs text-right">Late Txns</th>
                    <th className="py-2 px-3 font-semibold text-slate-800 text-xs text-right">Late Fees</th>
                  </tr>
                </thead>
                <tbody>
                  {defaulterAnalysis.currentYearTopDefaulters?.slice(0, 8).map((student: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="py-2 px-3 text-center font-bold text-red-600 bg-red-50 text-xs">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium text-slate-700 text-xs truncate">{student.name}</td>
                      <td className="py-2 px-3 text-right font-bold text-orange-600 text-xs">{student.timesLate}</td>
                      <td className="py-2 px-3 text-right text-slate-600 text-xs">{formatCurrency(student.totalLateFeePaid, true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* AI Recommendation - Elegant Section */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 rounded-xl p-5 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm">
                      <span className="text-xl">💡</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white mb-2">Strategic Recommendation</h4>
                    <p className="text-sm text-white/90 leading-relaxed mb-3">
                      Establish proactive parent communication protocols for repeat defaulters. Implement tiered intervention: SMS reminders 5 days before due date, email escalation after 10 days, and personalized follow-up for habitual offenders to prevent fee accumulation.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 text-xs font-semibold bg-white text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                        Launch Campaign
                      </button>
                      <button className="px-3 py-1.5 text-xs font-semibold bg-white/20 text-white border border-white/30 rounded-lg hover:bg-white/30 transition-colors">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Location-wise Defaulter Analysis */}
        <div>
          <div className="mb-3">
            <h3 className="text-[14px] font-semibold text-slate-800">Location-wise Defaulter Analysis</h3>
            <p className="text-xs text-slate-500 mt-1">Geographic performance and risk assessment.</p>
          </div>
          <DefaultersTable compact={false} maxItems={5} />
        </div>
      </div>

      {/* 3-Year Payment Habits Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <Card className="bento-card">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">High Risk Students</h3>
            <p className="text-xs text-slate-500">Top 10 students with consistent poor payment behaviors over 3 years.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 font-semibold text-slate-800">Student</th>
                  <th className="py-3 font-semibold text-slate-800">Class</th>
                  <th className="py-3 font-semibold text-slate-800 text-right">Times Late</th>
                  <th className="py-3 font-semibold text-slate-800 text-right">Late Fees</th>
                </tr>
              </thead>
              <tbody>
                {defaulterAnalysis.riskAnalysis?.map((student, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-700">{student.name}</td>
                    <td className="py-3 text-slate-600">{student.className}</td>
                    <td className="py-3 text-right text-red-600 font-medium">{student.timesLate}</td>
                    <td className="py-3 text-right text-slate-600">{formatCurrency(student.totalLateFeePaid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="bento-card">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Excellent Payers</h3>
            <p className="text-xs text-slate-500">Top 10 prompt students consistently paying fees on time for 3 years.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 font-semibold text-slate-800">Student</th>
                  <th className="py-3 font-semibold text-slate-800">Class</th>
                  <th className="py-3 font-semibold text-slate-800 text-right">Total Paid</th>
                  <th className="py-3 font-semibold text-slate-800 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {defaulterAnalysis.goodBehaviors?.map((student, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-700">{student.name}</td>
                    <td className="py-3 text-slate-600">{student.className}</td>
                    <td className="py-3 text-right text-slate-600">{formatCurrency(student.totalPaid)}</td>
                    <td className="py-3 text-right text-green-600 font-medium align-middle">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border-green-200">
                        Zero Defaulter
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
