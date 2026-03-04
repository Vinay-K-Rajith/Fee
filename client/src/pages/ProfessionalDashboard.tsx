import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  ReferenceLine,
} from 'recharts';
import {
  Wallet,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
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

export function ProfessionalDashboard() {
  const { data: dashboard, isLoading, error } = useDashboard();
  const [selectedTab, setSelectedTab] = useState('overview');

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

  const { kpi, benchmarks, monthlyPerformance, yearlyPerformance, defaulterAnalysis, concessionAnalysis } = dashboard;

  // ========================================
  // KPI CARDS
  // ========================================
  const kpiCards = [
    {
      title: 'Collection Rate',
      value: formatPercentage(kpi.collectionRate),
      benchmark: `Target: ${benchmarks.collectionRateBenchmark}%`,
      status: kpi.collectionRate >= benchmarks.collectionRateBenchmark ? 'good' : 'alert',
      icon: Wallet,
      color: kpi.collectionRate >= benchmarks.collectionRateBenchmark ? 'text-[#10B981]' : 'text-[#0EA5E9]',
      bgColor: kpi.collectionRate >= benchmarks.collectionRateBenchmark ? 'bg-[#ECFDF5]' : 'bg-[#F0F9FF]',
    },
    {
      title: 'Total Defaulters',
      value: kpi.totalDefaulters.toString(),
      benchmark: `${formatPercentage(kpi.defaulterRate)} of students`,
      status: kpi.defaulterRate <= benchmarks.defaulterRateBenchmark ? 'good' : 'alert',
      icon: AlertCircle,
      color: kpi.defaulterRate <= benchmarks.defaulterRateBenchmark ? 'text-[#10B981]' : 'text-[#0EA5E9]',
      bgColor: kpi.defaulterRate <= benchmarks.defaulterRateBenchmark ? 'bg-[#ECFDF5]' : 'bg-[#F0F9FF]',
    },
    {
      title: 'Outstanding Balance',
      value: formatCurrency(kpi.totalBalance, true),
      benchmark: `₹${(kpi.totalBalance / 100000).toFixed(1)}L to recover`,
      status: 'neutral',
      icon: DollarSign,
      color: 'text-[#0EA5E9]',
      bgColor: 'bg-[#F0F9FF]',
    },
    {
      title: 'Digital Adoption',
      value: `${kpi.digitalAdoption}%`,
      benchmark: `Target: ${benchmarks.digitalAdoptionBenchmark}%`,
      status: kpi.digitalAdoption >= benchmarks.digitalAdoptionBenchmark ? 'good' : 'alert',
      icon: TrendingUp,
      color: kpi.digitalAdoption >= benchmarks.digitalAdoptionBenchmark ? 'text-[#10B981]' : 'text-[#0EA5E9]',
      bgColor: kpi.digitalAdoption >= benchmarks.digitalAdoptionBenchmark ? 'bg-[#ECFDF5]' : 'bg-[#F0F9FF]',
    },
  ];

  // Prepare initial data structures
  const concessionByCategory = concessionAnalysis.byCategory || [];

  return (
    <div className="min-h-screen bg-white space-y-6 p-8 animate-in fade-in duration-500 font-source-sans">
      {/* ========================================
          KEY METRICS CARDS
          ======================================== */}
      <div>
        <h1 className="text-3xl font-black text-[#0F172A] mb-6">Fee Collection Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="border border-[#E0F2FE] bg-[#F8FAFC] shadow-sm hover:shadow-md transition-all p-6"
                style={{ boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[#64748B] text-xs uppercase font-black tracking-widest mb-2">
                      {card.title}
                    </p>
                    <p className="text-2xl font-black text-[#0F172A]">{card.value}</p>
                    <p className="text-xs text-[#64748B] mt-1 font-semibold">{card.benchmark}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
                {card.status === 'good' && (
                  <div className="border-t border-[#E0F2FE] pt-3 flex items-center gap-1 text-xs text-[#10B981] font-bold">
                    <TrendingUp className="w-3 h-3" />
                    On Track
                  </div>
                )}
                {card.status === 'alert' && (
                  <div className="border-t border-[#E0F2FE] pt-3 flex items-center gap-1 text-xs text-[#0EA5E9] font-bold">
                    <AlertCircle className="w-3 h-3" />
                    Needs Attention
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* ========================================
          MAIN CONTENT - TABS
          ======================================== */}
      <div>
        <h2 className="text-xl font-black text-[#0F172A] mb-4">Dashboard Insights</h2>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList
            className="grid w-full grid-cols-4 bg-[#F8FAFC] p-1 rounded-lg mb-6 border border-[#E0F2FE]"
            style={{
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <TabsTrigger value="overview">Geographic View</TabsTrigger>
            <TabsTrigger value="collections">Collection Trends</TabsTrigger>
            <TabsTrigger value="defaulters">Defaulter Analysis</TabsTrigger>
            <TabsTrigger value="financial">Financial Impact</TabsTrigger>
          </TabsList>

          {/* ========================================
            TAB 1: GEOGRAPHIC VIEW (MAP)
            ======================================== */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border border-[#E0F2FE] bg-[#F8FAFC] shadow-sm p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-black text-[#0F172A] uppercase tracking-widest">
                    Defaulter Location Heat Map
                  </h2>
                  <p className="text-sm text-[#64748B] mt-2">
                    Geographic distribution across {defaulterAnalysis.locationWise.length} locations
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-2">Risk Legend</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                      <span className="text-[#0F172A]">Critical {'>'}15%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#0EA5E9]"></div>
                      <span className="text-[#0F172A]">Medium 5-15%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                      <span className="text-[#0F172A]">Low {'<'}5%</span>
                    </div>
                  </div>
                </div>
              </div>
              <DefaulterLocationMap />
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-[#E0F2FE] bg-[#F8FAFC] shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">
                    High-Risk Zones
                  </h3>
                  <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                </div>
                <p className="text-3xl font-black text-[#F59E0B]">
                  {defaulterAnalysis.locationWise.filter((l) => l.defaulterRate > 15).length}
                </p>
                <p className="text-xs text-[#64748B] mt-2">Locations with default rate {'>'}15%</p>
              </Card>

              <Card className="border border-[#E0F2FE] bg-[#F8FAFC] shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">
                    Avg Default Rate
                  </h3>
                  <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-[#0EA5E9]" />
                  </div>
                </div>
                <p className="text-3xl font-black text-[#0EA5E9]">
                  {formatPercentage(
                    defaulterAnalysis.locationWise.reduce((sum, l) => sum + l.defaulterRate, 0) /
                    defaulterAnalysis.locationWise.length
                  )}
                </p>
                <p className="text-xs text-[#64748B] mt-2">Across all locations</p>
              </Card>

              <Card className="border border-[#E0F2FE] bg-[#F8FAFC] shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">
                    Total Outstanding
                  </h3>
                  <div className="w-8 h-8 rounded-lg bg-[#D1FAE5] flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#10B981]" />
                  </div>
                </div>
                <p className="text-3xl font-black text-[#10B981]">
                  {formatCurrency(
                    defaulterAnalysis.locationWise.reduce((sum, l) => sum + l.totalBalance, 0),
                    true
                  )}
                </p>
                <p className="text-xs text-[#64748B] mt-2">Recovery target</p>
              </Card>
            </div>
          </TabsContent>

          {/* ========================================
            TAB 2: COLLECTION TRENDS
            ======================================== */}
          <TabsContent value="collections" className="space-y-6">

            {/* Chart 1: Monthly Collected vs Expected with Rate line (dual axis) */}
            <Card className="border-none shadow-md p-6" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)', borderRadius: '14px' }}>
              <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
                <div>
                  <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-widest font-roboto">
                    Monthly Collection vs Expected
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">Bars = ₹ amount &nbsp;&middot;&nbsp; Line = collection rate %</p>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-bold text-[#64748B]">
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-[#10B981]" /> Collected</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-[#DBEAFE]" /> Expected</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-6 h-0.5 bg-[#F59E0B]" /> Rate %</span>
                </div>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyPerformance} margin={{ top: 10, right: 44, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B', fontWeight: 700 }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis
                      yAxisId="amount" orientation="left" axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748B', fontWeight: 700 }}
                      tickFormatter={(v: number) => formatCurrency(v, true)} width={68}
                    />
                    <YAxis
                      yAxisId="rate" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fill: '#F59E0B', fontWeight: 700 }}
                      tickFormatter={(v: number) => `${v}%`} width={40}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '12px 16px' }}
                      formatter={(value: number, name: string) =>
                        name === 'Collection Rate' ? [`${value.toFixed(1)}%`, name] : [formatCurrency(value, true), name]
                      }
                      labelStyle={{ fontWeight: 800, color: '#1E293B', marginBottom: 4 }}
                    />
                    <ReferenceLine yAxisId="rate" y={benchmarks.collectionRateBenchmark} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5}
                      label={{ value: `Target ${benchmarks.collectionRateBenchmark}%`, fill: '#EF4444', fontSize: 9, fontWeight: 700, position: 'insideTopRight' }} />
                    <Bar yAxisId="amount" dataKey="totalExpected" name="Expected" fill="#DBEAFE" radius={[5, 5, 0, 0]} maxBarSize={24} />
                    <Bar yAxisId="amount" dataKey="totalCollected" name="Collected" fill="#10B981" radius={[5, 5, 0, 0]} maxBarSize={24} />
                    <Line yAxisId="rate" type="monotone" dataKey="collectionRate" name="Collection Rate" stroke="#F59E0B" strokeWidth={2.5}
                      dot={{ r: 4, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 2: Yearly Collected vs Expected with Rate line (dual axis) */}
            <Card className="border-none shadow-md p-6" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)', borderRadius: '14px' }}>
              <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
                <div>
                  <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-widest font-roboto">
                    Year-on-Year Performance
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1">Collected vs Expected · Collection rate trend</p>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-bold text-[#64748B]">
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-[#3B82F6]" /> Collected</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-[#DBEAFE]" /> Expected</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-6 h-0.5 bg-[#10B981]" /> Rate %</span>
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={yearlyPerformance} margin={{ top: 10, right: 44, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748B', fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis
                      yAxisId="amount" orientation="left" axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fill: '#64748B', fontWeight: 700 }}
                      tickFormatter={(v: number) => formatCurrency(v, true)} width={68}
                    />
                    <YAxis
                      yAxisId="rate" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fill: '#10B981', fontWeight: 700 }}
                      tickFormatter={(v: number) => `${v}%`} width={40}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '12px 16px' }}
                      formatter={(value: number, name: string) =>
                        name === 'Collection Rate' ? [`${value.toFixed(1)}%`, name] : [formatCurrency(value, true), name]
                      }
                      labelStyle={{ fontWeight: 800, color: '#1E293B', marginBottom: 4 }}
                    />
                    <ReferenceLine yAxisId="rate" y={benchmarks.collectionRateBenchmark} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5}
                      label={{ value: `Target ${benchmarks.collectionRateBenchmark}%`, fill: '#EF4444', fontSize: 9, fontWeight: 700, position: 'insideTopRight' }} />
                    <Bar yAxisId="amount" dataKey="totalExpected" name="Expected" fill="#DBEAFE" radius={[7, 7, 0, 0]} maxBarSize={48} />
                    <Bar yAxisId="amount" dataKey="totalCollected" name="Collected" fill="#3B82F6" radius={[7, 7, 0, 0]} maxBarSize={48} />
                    <Line yAxisId="rate" type="monotone" dataKey="collectionRate" name="Collection Rate" stroke="#10B981" strokeWidth={3}
                      dot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              {/* Year summary strip */}
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                {yearlyPerformance.map((y) => (
                  <div key={y.year} className="text-center">
                    <p className="text-[10px] font-black uppercase text-[#64748B] tracking-widest">{y.year}</p>
                    <p className={`text-lg font-black mt-0.5 ${y.collectionRate >= benchmarks.collectionRateBenchmark ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                      {formatPercentage(y.collectionRate)}
                    </p>
                    <p className="text-[10px] font-semibold text-[#64748B]">{formatCurrency(y.totalCollected, true)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* ========================================
            TAB 3: DEFAULTER ANALYSIS
            ======================================== */}
          <TabsContent value="defaulters" className="space-y-6">
            <DefaultersTable />
          </TabsContent>

          {/* ========================================
            TAB 4: FINANCIAL IMPACT
            ======================================== */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Concession Analysis */}
              <Card className="border border-[#E0F2FE] bg-[#F8FAFC] shadow-sm p-6">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">
                    Concession Breakdown
                  </h3>
                </div>
                <p className="text-xs text-[#64748B] mb-4">Distribution across top 5 categories</p>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={concessionByCategory.slice(0, 5)}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        label={{ fontSize: 11, fill: '#0F172A' }}
                      >
                        {concessionByCategory.slice(0, 5).map((entry: any, index: number) => (
                          <Cell key={entry.category} fill={['#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'][index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value as number, true)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2 border-t border-[#E0F2FE] pt-4">
                  <p className="text-xs font-bold text-[#64748B] uppercase">Legend</p>
                  <div className="grid grid-cols-1 gap-2">
                    {['Primary', 'Secondary', 'Academic', 'Sports', 'Other'].map((label, idx) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'][idx] }}></div>
                        <span className="text-xs text-[#0F172A]">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Revenue Impact */}
              <Card className="border border-[#E0F2FE] bg-[#F8FAFC] shadow-sm p-6">
                <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-widest mb-4">
                  Revenue Loss Summary
                </h3>
                <div className="space-y-4">
                  <div className="rounded-lg bg-white border border-[#E0F2FE] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#0EA5E9]"></div>
                        <span className="text-sm text-[#0F172A] font-bold">Outstanding Balance</span>
                      </div>
                      <span className="text-lg font-black text-[#0EA5E9]">
                        {formatCurrency(kpi.totalBalance, true)}
                      </span>
                    </div>
                    <div className="w-full bg-[#E0F2FE] rounded-full h-2.5">
                      <div
                        className="bg-[#0EA5E9] h-2.5 rounded-full"
                        style={{ width: `${Math.min((kpi.totalBalance / kpi.totalExpected) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-[#64748B] mt-2">Amount pending from defaulters</p>
                  </div>

                  <div className="rounded-lg bg-white border border-[#E0F2FE] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                        <span className="text-sm text-[#0F172A] font-bold">Concession Loss</span>
                      </div>
                      <span className="text-lg font-black text-[#F59E0B]">
                        {formatCurrency(kpi.totalConcession, true)}
                      </span>
                    </div>
                    <div className="w-full bg-[#FEF3C7] rounded-full h-2.5">
                      <div
                        className="bg-[#F59E0B] h-2.5 rounded-full"
                        style={{ width: `${Math.min((kpi.totalConcession / kpi.totalExpected) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-[#64748B] mt-2">Waivers & special rates provided</p>
                  </div>

                  <div className="rounded-lg bg-white border border-[#E0F2FE] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#06B6D4]"></div>
                        <span className="text-sm text-[#0F172A] font-bold">TC/Dropout Loss</span>
                      </div>
                      <span className="text-lg font-black text-[#06B6D4]">
                        {formatCurrency(kpi.totalTcDropoutLoss, true)}
                      </span>
                    </div>
                    <div className="w-full bg-[#CFFAFE] rounded-full h-2.5">
                      <div
                        className="bg-[#06B6D4] h-2.5 rounded-full"
                        style={{ width: `${Math.min((kpi.totalTcDropoutLoss / kpi.totalExpected) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-[#64748B] mt-2">Transfer certificate & dropout impact</p>
                  </div>

                  <div className="bg-gradient-to-br from-[#F0F9FF] to-[#ECFDF5] rounded-lg p-4 mt-4 border border-[#E0F2FE]">
                    <p className="text-xs text-[#64748B] font-bold uppercase mb-2">💰 Total Revenue Impact</p>
                    <p className="text-3xl font-black text-[#0F172A]">
                      {formatCurrency(kpi.totalBalance + kpi.totalConcession + kpi.totalTcDropoutLoss, true)}
                    </p>
                    <p className="text-xs text-[#64748B] mt-2 font-semibold">
                      {formatPercentage((kpi.totalBalance + kpi.totalConcession + kpi.totalTcDropoutLoss) / kpi.totalExpected)} of expected revenue to recover or mitigate
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Concession Details Table */}
            <Card className="border border-[#E0F2FE] bg-[#F8FAFC] shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-widest mb-4">
                  Concession Category Details
                </h3>
                <p className="text-xs text-[#64748B] mb-4">Detailed breakdown of concession categories by student count and amount</p>
                <div className="overflow-x-auto rounded-lg border border-[#E0F2FE]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#E0F2FE] bg-[#F0F9FF]">
                        <TableHead className="text-[#0EA5E9] font-black text-xs uppercase">Category</TableHead>
                        <TableHead className="text-[#0EA5E9] font-black text-xs uppercase text-right">Amount</TableHead>
                        <TableHead className="text-[#0EA5E9] font-black text-xs uppercase text-right">Students</TableHead>
                        <TableHead className="text-[#0EA5E9] font-black text-xs uppercase text-right">% of Total</TableHead>
                        <TableHead className="text-[#0EA5E9] font-black text-xs uppercase">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {concessionByCategory.slice(0, 8).map((cat: any) => (
                        <TableRow key={cat.category} className="border-b border-[#E0F2FE]">
                          <TableCell className="py-4 font-semibold text-[#0F172A]">{cat.category}</TableCell>
                          <TableCell className="py-4 text-right font-bold text-[#0F172A]">
                            {formatCurrency(cat.amount, true)}
                          </TableCell>
                          <TableCell className="py-4 text-right text-[#64748B] font-semibold">
                            {cat.studentCount}
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <span className="font-bold text-[#F59E0B]">{formatPercentage(cat.percentage)}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant="outline" className="border-[#FEF3C7] bg-[#FFFBEB] text-[#F59E0B]">
                              Loss Impact
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
