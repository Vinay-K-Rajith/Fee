import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Area, AreaChart, Line,
} from 'recharts';
import { useDashboard, formatCurrency, formatPercentage } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Users, TrendingDown, Calendar } from 'lucide-react';
import { DefaultersTable } from '@/components/views/DefaultersTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BRAND_INDIGO, BRAND_GREEN, STATUS, CHART_COLORS, GRID_COLOR, tickStyle } from '@/theme';
import { SmartTooltip } from '@/components/charts/chartUtils';


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

  const { yearlyPerformance, monthlyPerformance, defaulterAnalysis, benchmarks } = dashboard;
  const avgDebt = defaulterAnalysis.totalDefaulters > 0
    ? defaulterAnalysis.totalBalance / defaulterAnalysis.totalDefaulters
    : 0;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Defaulters', value: String(defaulterAnalysis.totalDefaulters), icon: <AlertTriangle className="w-5 h-5" />, bg: 'bg-red-50', color: 'text-red-500' },
          { label: 'Total Outstanding', value: formatCurrency(defaulterAnalysis.totalBalance, true), icon: <TrendingDown className="w-5 h-5" />, bg: 'bg-orange-50', color: 'text-orange-500' },
          { label: 'Avg Defaulter Debt', value: formatCurrency(avgDebt), icon: <Users className="w-5 h-5" />, bg: 'bg-slate-50', color: 'text-slate-500' },
        ].map(s => (
          <Card key={s.label} className="bento-card flex items-center justify-between">
            <div>
              <p className="text-[#64748B] text-[11px] uppercase font-semibold tracking-[0.1em] mb-2">{s.label}</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">{s.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>{s.icon}</div>
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
              <AreaChart data={yearlyPerformance.filter((y: any) => !y.isForecast)} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
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
                <Area type="monotone" dataKey="totalBalance" name="Outstanding Balance" stroke={STATUS.danger} strokeWidth={2.5} fillOpacity={1} fill="url(#balanceGrad)" dot={{ r: 4, fill: STATUS.danger }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Month-on-Month Defaulters */}
        <Card className="bento-card">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Month-on-Month Defaulter Count</h3>
            <p className="text-xs text-slate-500">Number of students with outstanding balances each month.</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyPerformance} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_COLOR} />
                <XAxis dataKey="month" tick={tickStyle} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<SmartTooltip />} />
                <Bar dataKey="defaulterCount" name="Defaulters" fill={`${STATUS.warning}CC`} radius={[4, 4, 0, 0]} barSize={22} />
                <Line type="monotone" dataKey="newDefaulters" name="Trend" stroke={STATUS.danger} strokeWidth={2} dot={{ r: 3, fill: STATUS.danger }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Occupation-wise Defaulters */}
        <Card className="bento-card lg:col-span-2">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Occupation-wise Defaulter Analysis</h3>
            <p className="text-xs text-slate-500">Top 10 parental occupations by defaulter count and outstanding balance.</p>
          </div>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={defaulterAnalysis.occupationWise.slice(0, 10)}
                layout="vertical"
                margin={{ top: 10, right: 40, bottom: 10, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={GRID_COLOR} />
                <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="occupation" tick={{ ...tickStyle, fontSize: 11, fontWeight: 500, fill: '#1E293B' }} width={130} axisLine={false} tickLine={false} />
                <Tooltip content={<SmartTooltip />} />
                <Bar dataKey="defaulterCount" name="Defaulter Count" fill={STATUS.danger} radius={[0, 4, 4, 0]} barSize={14} />
                <Bar dataKey="totalBalance" name="Outstanding Balance" fill={`${STATUS.warning}CC`} radius={[0, 4, 4, 0]} barSize={14} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Defaulters table */}
      <Card className="bento-card mt-8">
        <div className="mb-5 border-b border-slate-100 pb-4">
          <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Fee Defaulter Tracker</h3>
          <p className="text-xs text-slate-500">Individual student outstanding balances. Schools reduce repeat defaulters by 25% with structured follow-ups.</p>
        </div>
        <DefaultersTable />
      </Card>

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
