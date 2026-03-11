import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';
import {
  Wallet,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Target,
  Award,
} from 'lucide-react';
import { useDashboard, formatCurrency, formatPercentage } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DefaulterLocationMap } from '@/components/views/DefaulterLocationMap';
import { DefaultersTable } from '@/components/views/DefaultersTable';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COLORS = {
  primary: '#0EA5E9',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  neutral: '#64748B',
  light: '#F8FAFC',
};

export function ProfessionalDashboard() {
  const { data: dashboard, isLoading, error } = useDashboard();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [occupationFilter, setOccupationFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  if (isLoading) {
    return (
      <div className="space-y-8 p-8 animate-in fade-in duration-500">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
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

  const { kpi, benchmarks, monthlyPerformance, yearlyPerformance, defaulterAnalysis, concessionAnalysis, paymentModeAnalysis } = dashboard;

  // ========================================
  // INSIGHT 15: OVERALL FEE COLLECTION PERFORMANCE (KPI Cards)
  // ========================================
  const kpiCards = [
    {
      title: 'Total Collection',
      value: formatCurrency(kpi.totalFeeCollection, true),
      benchmark: `${formatPercentage(kpi.collectionRate)} collection rate`,
      target: `Target: ${benchmarks.collectionRateBenchmark}%`,
      status: kpi.collectionRate >= benchmarks.collectionRateBenchmark ? 'good' : 'alert',
      icon: Wallet,
      insight: '15',
    },
    {
      title: 'Active Defaulters',
      value: kpi.totalDefaulters.toString(),
      benchmark: `${formatPercentage(kpi.defaulterRate)} of students`,
      target: `Target: <${benchmarks.defaulterRateBenchmark}%`,
      status: kpi.defaulterRate <= benchmarks.defaulterRateBenchmark ? 'good' : 'alert',
      icon: AlertCircle,
      insight: '3',
    },
    {
      title: 'Outstanding Balance',
      value: formatCurrency(kpi.totalBalance, true),
      benchmark: `₹${(kpi.totalBalance / 100000).toFixed(1)}L to recover`,
      target: 'Recovery Priority',
      status: 'neutral',
      icon: DollarSign,
      insight: '15',
    },
    {
      title: 'Digital Adoption',
      value: `${kpi.digitalAdoption.toFixed(1)}%`,
      benchmark: `${Object.entries(kpi.paymentModes).filter(([mode]) => mode !== 'Cash').reduce((sum, [, count]) => sum + count, 0)} digital transactions`,
      target: `Target: ${benchmarks.digitalAdoptionTarget}%`,
      status: kpi.digitalAdoption >= benchmarks.digitalAdoptionTarget ? 'good' : 'alert',
      icon: TrendingUp,
      insight: '17',
    },
  ];

  return (
    <div className="min-h-screen bg-white space-y-6 p-8 animate-in fade-in duration-500">
      {/* ========================================
          HEADER & KPI OVERVIEW (NO FILTERS)
          ======================================== */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A]">Fee Management Analytics Dashboard</h1>
            <p className="text-sm text-[#64748B] mt-2">
              Comprehensive insights across {kpi.totalStudents.toLocaleString()} students • {yearlyPerformance.length} years of data
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              Industry Benchmark: {benchmarks.collectionRateBenchmark}%
            </Badge>
          </div>
        </div>

        {/* KEY PERFORMANCE INDICATORS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            let statusColor = COLORS.neutral;
            if (card.status === 'good') statusColor = COLORS.success;
            else if (card.status === 'alert') statusColor = COLORS.warning;
            
            let bgColor = 'bg-slate-50';
            if (card.status === 'good') bgColor = 'bg-emerald-50';
            else if (card.status === 'alert') bgColor = 'bg-orange-50';

            return (
              <Card
                key={card.title}
                className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all p-6 relative overflow-hidden"
              >
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-[10px] font-bold bg-slate-100">
                    Insight #{card.insight}
                  </Badge>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-[#64748B] text-xs uppercase font-bold tracking-wider mb-2">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold text-[#0F172A] mb-1">{card.value}</p>
                    <p className="text-xs text-[#64748B] font-medium">{card.benchmark}</p>
                    <p className="text-xs text-[#94A3B8] font-medium mt-0.5">{card.target}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${bgColor} ml-3`}>
                    <Icon className={`w-6 h-6`} style={{ color: statusColor }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ========================================
          MAIN ANALYTICS TABS (WITH FILTERS)
          ======================================== */}
      <div>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-100 p-1 rounded-lg mb-6 border border-slate-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="collections">Collection Performance</TabsTrigger>
            <TabsTrigger value="defaulters">Defaulter Analytics</TabsTrigger>
            <TabsTrigger value="concessions">Concessions & Losses</TabsTrigger>
            <TabsTrigger value="demographics">Demographics & Operations</TabsTrigger>
          </TabsList>

          {/* ========================================
              TAB 1: OVERVIEW (Executive Summary)
              ======================================== */}
          <TabsContent value="overview" className="space-y-6">
            {/* Insight #21: Year-over-Year Forecasting */}
            <Card className="border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    Year-over-Year Financial Forecasting
                  </h3>
                  <p className="text-sm text-[#64748B] mt-1">
                    Collection trends and performance projections across academic years
                  </p>
                </div>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={yearlyPerformance} margin={{ top: 10, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748B' }} />
                    <YAxis
                      yAxisId="amount"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(val) => formatCurrency(val, true)}
                    />
                    <YAxis
                      yAxisId="rate"
                      orientation="right"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(val) => `${val.toFixed(1)}%`}
                      domain={[95, 100]}
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => {
                        if (name === 'Collection Rate') return `${value.toFixed(2)}%`;
                        return formatCurrency(value);
                      }}
                    />
                    <ReferenceLine yAxisId="rate" y={benchmarks.collectionRateBenchmark} stroke={COLORS.warning} strokeDasharray="3 3" label="Benchmark" />
                    <Bar yAxisId="amount" dataKey="totalCollected" name="Collected" fill={COLORS.success} radius={[8, 8, 0, 0]} />
                    <Bar yAxisId="amount" dataKey="totalBalance" name="Outstanding" fill={COLORS.danger} radius={[8, 8, 0, 0]} />
                    <Line yAxisId="rate" type="monotone" dataKey="collectionRate" name="Collection Rate" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 5 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-[#64748B]">Best Year</p>
                    <p className="text-2xl font-bold text-[#0F172A]">
                      {yearlyPerformance.reduce((best, y) => (y.collectionRate > best.collectionRate ? y : best), yearlyPerformance[0]).year}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#64748B]">
                  {formatPercentage(Math.max(...yearlyPerformance.map((y) => y.collectionRate)))} collection rate
                </p>
              </Card>

              <Card className="border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-[#64748B]">Total Students</p>
                    <p className="text-2xl font-bold text-[#0F172A]">
                      {yearlyPerformance.reduce((sum, y) => sum + y.studentCount, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#64748B]">
                  Across {yearlyPerformance.length} academic years
                </p>
              </Card>

              <Card className="border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-[#64748B]">Avg Annual Collection</p>
                    <p className="text-2xl font-bold text-[#0F172A]">
                      {formatCurrency(
                        yearlyPerformance.reduce((sum, y) => sum + y.totalCollected, 0) / yearlyPerformance.length,
                        true
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#64748B]">
                  Per academic year average
                </p>
              </Card>
            </div>
          </TabsContent>

          {/* ========================================
              TAB 2: COLLECTION PERFORMANCE
              ======================================== */}
          <TabsContent value="collections" className="space-y-6">
            {/* FILTERS */}
            <Card className="border border-slate-200 shadow-sm p-4 bg-slate-50">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#64748B]" />
                  <span className="text-sm font-bold text-[#64748B]">Filters:</span>
                </div>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {yearlyPerformance.map((y) => (
                      <SelectItem key={y.year} value={y.year}>
                        {y.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Insight #1: Year-on-Year Fee Collection Performance */}
            <Card className="border border-slate-200 shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  Year-on-Year Fee Collection Performance
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  Annual collection trends with benchmarks
                </p>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={yearlyPerformance} margin={{ top: 10, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748B' }} />
                    <YAxis
                      yAxisId="amount"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(val) => formatCurrency(val, true)}
                    />
                    <YAxis
                      yAxisId="rate"
                      orientation="right"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(val) => `${val.toFixed(1)}%`}
                      domain={[98, 100]}
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => {
                        if (name.includes('Rate')) return `${value.toFixed(2)}%`;
                        return formatCurrency(value);
                      }}
                    />
                    <ReferenceLine yAxisId="rate" y={benchmarks.collectionRateBenchmark} stroke={COLORS.warning} strokeDasharray="5 5" label={{ value: 'Benchmark', position: 'right', fontSize: 11 }} />
                    <Bar yAxisId="amount" dataKey="totalExpected" name="Expected" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
                    <Bar yAxisId="amount" dataKey="totalCollected" name="Collected" fill={COLORS.success} radius={[6, 6, 0, 0]} />
                    <Line yAxisId="rate" type="monotone" dataKey="collectionRate" name="Collection Rate" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 6, fill: COLORS.primary }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Insight #2: Month-on-Month Fee Collection Performance */}
            <Card className="border border-slate-200 shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  Month-on-Month Fee Collection Performance
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  Monthly collection trends and cumulative performance
                </p>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyPerformance} margin={{ top: 10, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} angle={-45} textAnchor="end" height={80} />
                    <YAxis
                      yAxisId="amount"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(val) => formatCurrency(val, true)}
                    />
                    <YAxis
                      yAxisId="rate"
                      orientation="right"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(val) => `${val.toFixed(0)}%`}
                      domain={[95, 100]}
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => {
                        if (name === 'Collection Rate') return `${value.toFixed(2)}%`;
                        return formatCurrency(value);
                      }}
                    />
                    <Bar yAxisId="amount" dataKey="totalCollected" name="Monthly Collected" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                    <Line yAxisId="amount" type="monotone" dataKey="cumulativeCollection" name="Cumulative" stroke={COLORS.success} strokeWidth={2} dot={{ r: 4 }} />
                    <Line yAxisId="rate" type="monotone" dataKey="collectionRate" name="Collection Rate" stroke={COLORS.warning} strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Insight #17: Late Fee & Payment Mode Optimization */}
            <Card className="border border-slate-200 shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  Late Fee & Payment Mode Optimization
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  Payment channel distribution and transaction patterns
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentModeAnalysis}
                        dataKey="transactionCount"
                        nameKey="paymentMode"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.paymentMode}: ${entry.transactionCount}`}
                      >
                        {paymentModeAnalysis.map((mode, index) => (
                          <Cell key={`payment-${mode.paymentMode}`} fill={[COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.neutral][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => value.toLocaleString()} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[#0F172A]">Payment Mode Details</h4>
                  {paymentModeAnalysis.map((mode, idx) => (
                    <div key={mode.paymentMode} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{
                            backgroundColor: [COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.neutral][idx % 5],
                          }}
                        />
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">{mode.paymentMode}</p>
                          <p className="text-xs text-[#64748B]">{mode.transactionCount.toLocaleString()} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#0F172A]">{formatCurrency(mode.totalAmount, true)}</p>
                        <p className="text-xs text-[#64748B]">Avg: {formatCurrency(mode.avgTransactionSize, true)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ========================================
              TAB 3: DEFAULTER ANALYTICS
              ======================================== */}
          <TabsContent value="defaulters" className="space-y-6">
            {/* FILTERS */}
            <Card className="border border-slate-200 shadow-sm p-4 bg-slate-50">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#64748B]" />
                  <span className="text-sm font-bold text-[#64748B]">Filters:</span>
                </div>
                <Select value={occupationFilter} onValueChange={setOccupationFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by Occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Occupations</SelectItem>
                    {defaulterAnalysis.occupationWise.slice(0, 10).map((occ) => (
                      <SelectItem key={occ.occupation} value={occ.occupation}>
                        {occ.occupation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {defaulterAnalysis.locationWise.slice(0, 10).map((loc) => (
                      <SelectItem key={loc.location} value={loc.location}>
                        {loc.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Insight #3 & #4: Year/Month Defaulter Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-slate-200 shadow-sm p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    Year-on-Year Defaulters
                  </h3>
                  <p className="text-sm text-[#64748B] mt-1">Annual defaulter growth trends</p>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={yearlyPerformance} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Area type="monotone" dataKey="totalBalance" name="Outstanding Balance" fill={COLORS.danger} fillOpacity={0.6} stroke={COLORS.danger} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="border border-slate-200 shadow-sm p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    Month-on-Month Defaulters
                  </h3>
                  <p className="text-sm text-[#64748B] mt-1">Monthly defaulter count tracking</p>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyPerformance} margin={{ top: 10, right: 20, bottom: 60, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                      <Tooltip />
                      <Bar dataKey="defaulterCount" name="Total Defaulters" fill={COLORS.warning} radius={[6, 6, 0, 0]} />
                      <Line type="monotone" dataKey="newDefaulters" name="New Defaulters" stroke={COLORS.danger} strokeWidth={2} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Insight #11: Occupation-wise Fee Defaulters */}
            <Card className="border border-slate-200 shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  Occupation-wise Fee Defaulters
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  Defaulter distribution by parental occupation
                </p>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={defaulterAnalysis.occupationWise.slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 10, right: 30, bottom: 10, left: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis type="category" dataKey="occupation" tick={{ fontSize: 11, fill: '#64748B' }} width={110} />
                    <Tooltip
                      formatter={(value: any, name: string) => {
                        if (name === 'Defaulter Rate') return `${value.toFixed(2)}%`;
                        if (name === 'Total Balance') return formatCurrency(value);
                        return value;
                      }}
                    />
                    <Bar dataKey="defaulterCount" name="Defaulters" fill={COLORS.danger} radius={[0, 6, 6, 0]} />
                    <Bar dataKey="totalBalance" name="Total Balance" fill={COLORS.warning} radius={[0, 6, 6, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Insight #12: Location-wise Fee Defaulters */}
            <Card className="border border-slate-200 shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  Location-wise Fee Defaulters (Geographic Heat Map)
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  Defaulter concentration across {defaulterAnalysis.locationWise.length} locations
                </p>
              </div>
              <DefaulterLocationMap />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-xs uppercase font-bold text-[#64748B] mb-1">Critical Risk</p>
                  <p className="text-2xl font-bold text-red-600">
                    {defaulterAnalysis.locationWise.filter((l) => l.defaulterRate > 15).length}
                  </p>
                  <p className="text-xs text-[#64748B]">Locations &gt;15% default rate</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-xs uppercase font-bold text-[#64748B] mb-1">Medium Risk</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {defaulterAnalysis.locationWise.filter((l) => l.defaulterRate >= 5 && l.defaulterRate <= 15).length}
                  </p>
                  <p className="text-xs text-[#64748B]">Locations 5-15% range</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <p className="text-xs uppercase font-bold text-[#64748B] mb-1">Low Risk</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {defaulterAnalysis.locationWise.filter((l) => l.defaulterRate < 5).length}
                  </p>
                  <p className="text-xs text-[#64748B]">Locations &lt;5% default rate</p>
                </div>
              </div>
            </Card>

            {/* Insight #19: Class-wise Analysis */}
            <Card className="border border-slate-200 shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  Class-wise Defaulter Analysis
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  Defaulters segmented by class/grade level
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Class</TableHead>
                      <TableHead className="font-bold text-right">Defaulters</TableHead>
                      <TableHead className="font-bold text-right">Total Balance</TableHead>
                      <TableHead className="font-bold text-right">Avg Balance</TableHead>
                      <TableHead className="font-bold text-right">Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defaulterAnalysis.classWise.slice(0, 15).map((cls) => {
                      let riskVariant: 'destructive' | 'default' | 'secondary' = 'secondary';
                      let riskLabel = 'Low';
                      
                      if (cls.avgBalance > 50000) {
                        riskVariant = 'destructive';
                        riskLabel = 'High';
                      } else if (cls.avgBalance > 30000) {
                        riskVariant = 'default';
                        riskLabel = 'Medium';
                      }
                      
                      return (
                        <TableRow key={cls.className}>
                          <TableCell className="font-medium">{cls.className}</TableCell>
                          <TableCell className="text-right">{cls.defaulterCount}</TableCell>
                          <TableCell className="text-right">{formatCurrency(cls.totalBalance)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(cls.avgBalance)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={riskVariant}>
                              {riskLabel}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Defaulter List Table */}
            <Card className="border border-slate-200 shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0F172A]">Active Defaulter List</h3>
                <p className="text-sm text-[#64748B] mt-1">
                  Complete list of {defaulterAnalysis.defaulterList.length} defaulters requiring immediate attention
                </p>
              </div>
              <DefaultersTable />
            </Card>
          </TabsContent>

          {/* ========================================
              TAB 4: CONCESSIONS & LOSSES
              ======================================== */}
          <TabsContent value="concessions" className="space-y-6">
            {/* Insight #7 & #8: Concession Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-slate-200 shadow-sm p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    Concession Loss Year-on-Year
                  </h3>
                  <p className="text-sm text-[#64748B] mt-1">Annual concession trends</p>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={yearlyPerformance} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => formatCurrency(val, true)} />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Area type="monotone" dataKey="totalConcession" name="Total Concession" fill={COLORS.warning} fillOpacity={0.6} stroke={COLORS.warning} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="border border-slate-200 shadow-sm p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    Concession Loss Month-on-Month
                  </h3>
                  <p className="text-sm text-[#64748B] mt-1">Monthly concession patterns</p>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyPerformance} margin={{ top: 10, right: 20, bottom: 60, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => formatCurrency(val, true)} />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Area type="monotone" dataKey="concessionGiven" name="Concession Given" fill={COLORS.primary} fillOpacity={0.6} stroke={COLORS.primary} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Insight #9: Concession Beneficiaries who are Defaulters */}
            <Card className="border border-slate-200 shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  Concession Beneficiaries who are Defaulters
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  Analysis of defaulters with concession benefits
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={concessionAnalysis.concessionTypeWise}
                        dataKey="defaulterCount"
                        nameKey="concessionType"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label={(entry) => `${entry.concessionType}: ${entry.defaulterCount}`}
                      >
                        {concessionAnalysis.concessionTypeWise.map((type, index) => (
                          <Cell key={`concession-${type.concessionType}`} fill={[COLORS.danger, COLORS.warning, COLORS.primary, COLORS.neutral, COLORS.success][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[#0F172A]">Concession Type Breakdown</h4>
                  {concessionAnalysis.concessionTypeWise.map((type, idx) => (
                    <div key={type.concessionType} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{
                              backgroundColor: [COLORS.danger, COLORS.warning, COLORS.primary, COLORS.neutral, COLORS.success][idx % 5],
                            }}
                          />
                          <p className="text-sm font-bold text-[#0F172A]">{type.concessionType}</p>
                        </div>
                        <Badge variant={type.defaulterRate > 15 ? 'destructive' : 'secondary'}>
                          {formatPercentage(type.defaulterRate)} default rate
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-[#64748B]">
                        <div>
                          <p>Students: {type.studentCount}</p>
                          <p>Defaulters: {type.defaulterCount}</p>
                        </div>
                        <div className="text-right">
                          <p>Amount: {formatCurrency(type.totalAmount, true)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Insight #5 & #6: TC/Dropout Loss */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-slate-200 shadow-sm p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                    TC/Dropout Loss Tracking
                  </h3>
                  <p className="text-sm text-[#64748B] mt-1">Impact of withdrawals on collection</p>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyPerformance} margin={{ top: 10, right: 20, bottom: 60, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="tcDropouts" name="TC/Dropouts" fill={COLORS.danger} fillOpacity={0.6} stroke={COLORS.danger} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="border border-slate-200 shadow-sm p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-[#64748B] uppercase">Summary Statistics</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-xs text-[#64748B] mb-1">Total TC/Dropouts</p>
                    <p className="text-3xl font-bold text-red-600">
                      {monthlyPerformance.reduce((sum, m) => sum + m.tcDropouts, 0)}
                    </p>
                    <p className="text-xs text-[#64748B] mt-1">Across all months</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-xs text-[#64748B] mb-1">Peak Month</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {monthlyPerformance.reduce((max, m) => (m.tcDropouts > max.tcDropouts ? m : max), monthlyPerformance[0]).month}
                    </p>
                    <p className="text-xs text-[#64748B] mt-1">
                      {monthlyPerformance.reduce((max, m) => (m.tcDropouts > max.tcDropouts ? m : max), monthlyPerformance[0]).tcDropouts} dropouts
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-[#64748B] mb-1">Avg per Month</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(monthlyPerformance.reduce((sum, m) => sum + m.tcDropouts, 0) / monthlyPerformance.length).toFixed(1)}
                    </p>
                    <p className="text-xs text-[#64748B] mt-1">Student withdrawals</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* ========================================
              TAB 5: DEMOGRAPHICS & OPERATIONS
              ======================================== */}
          <TabsContent value="demographics" className="space-y-6">
            {/* Insight #13 & #20: Parental Demographics */}
            <Card className="border border-slate-200 shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  Parental Demographic Insights
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  Occupation-wise student distribution and defaults
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Occupation</TableHead>
                      <TableHead className="font-bold text-right">Total Students</TableHead>
                      <TableHead className="font-bold text-right">Defaulters</TableHead>
                      <TableHead className="font-bold text-right">Default Rate</TableHead>
                      <TableHead className="font-bold text-right">Outstanding</TableHead>
                      <TableHead className="font-bold text-right">Risk Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defaulterAnalysis.occupationWise.slice(0, 15).map((occ) => {
                      let riskVariant: 'destructive' | 'default' | 'secondary' = 'secondary';
                      let riskLabel = 'Low';
                      
                      if (occ.defaulterRate > 15) {
                        riskVariant = 'destructive';
                        riskLabel = 'High';
                      } else if (occ.defaulterRate > 10) {
                        riskVariant = 'default';
                        riskLabel = 'Medium';
                      }
                      
                      return (
                        <TableRow key={occ.occupation}>
                          <TableCell className="font-medium">{occ.occupation}</TableCell>
                          <TableCell className="text-right">{occ.totalStudents}</TableCell>
                          <TableCell className="text-right">{occ.defaulterCount}</TableCell>
                          <TableCell className="text-right">{formatPercentage(occ.defaulterRate)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(occ.totalBalance, true)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={riskVariant}>
                              {riskLabel}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Insight #17: Payment Mode Optimization (Duplicate from Collections tab - consolidated view) */}
            <Card className="border border-slate-200 shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  Payment Mode Performance
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  Transaction efficiency by payment channel
                </p>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={paymentModeAnalysis} margin={{ top: 10, right: 30, bottom: 80, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="paymentMode" tick={{ fontSize: 11, fill: '#64748B' }} angle={-45} textAnchor="end" height={80} />
                    <YAxis
                      yAxisId="count"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      label={{ value: 'Transactions', angle: -90, position: 'insideLeft', fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="amount"
                      orientation="right"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      label={{ value: 'Amount (₹)', angle: 90, position: 'insideRight', fontSize: 11 }}
                      tickFormatter={(val) => formatCurrency(val, true)}
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => {
                        if (name.includes('Amount')) return formatCurrency(value);
                        return value.toLocaleString();
                      }}
                    />
                    <Bar yAxisId="count" dataKey="transactionCount" name="Transaction Count" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                    <Line yAxisId="amount" type="monotone" dataKey="totalAmount" name="Total Amount" stroke={COLORS.success} strokeWidth={3} dot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Action Recommendations */}
            <Card className="border border-slate-200 shadow-sm p-6 bg-gradient-to-br from-blue-50 to-slate-50">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  10 Actionable Strategies
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  Recommended actions based on comprehensive data analysis
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Focus on High-Risk Locations', desc: 'Target locations with >15% default rate for intervention programs' },
                  { title: 'Digital Payment Incentives', desc: `Increase digital adoption from ${kpi.digitalAdoption.toFixed(1)}% to ${benchmarks.digitalAdoptionTarget}% target` },
                  { title: 'Occupation-Based Outreach', desc: 'Customize collection strategies for high-risk occupation groups' },
                  { title: 'Concession Monitoring', desc: 'Review concession beneficiaries with defaulter status for eligibility' },
                  { title: 'Early Warning System', desc: 'Implement predictive alerts for new defaulters based on historical patterns' },
                  { title: 'Class-Level Interventions', desc: 'Deploy targeted programs for classes with highest avg outstanding balance' },
                  { title: 'TC/Dropout Prevention', desc: 'Reduce monthly dropout rate through retention initiatives' },
                  { title: 'Payment Mode Optimization', desc: 'Promote UPI/Online methods to reduce cash handling costs' },
                  { title: 'Monthly Performance Reviews', desc: 'Track month-on-month trends to identify seasonal patterns' },
                  { title: 'Benchmark Achievement Plan', desc: `Close gap to ${benchmarks.collectionRateBenchmark}% industry benchmark` },
                ].map((action, idx) => (
                  <div key={`action-${action.title}`} className="p-4 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-black text-sm flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A] mb-1">{action.title}</p>
                        <p className="text-xs text-[#64748B]">{action.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
