import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertCircle,
  Zap,
  Info,
} from "lucide-react";
import { ExecutiveOverview } from "@/components/views/ExecutiveOverview";
import { DefaulterAnalysis } from "@/components/views/DefaulterAnalysis";
import { LeakageConcessions } from "@/components/views/LeakageConcessions";
import { AIInsights } from "@/components/views/AIInsights";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard, formatCurrency, formatPercentage } from "@/hooks/use-api";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export function Dashboard() {
  const { data: dashboard, isLoading, error } = useDashboard();
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <Skeleton className="h-12 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-8 flex items-center justify-center h-screen">
        <Card className="border-red-200 bg-red-50 p-6 max-w-md">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <h3 className="font-black text-lg text-red-900">Error Loading Dashboard</h3>
          <p className="text-sm text-red-700">Unable to fetch dashboard data</p>
        </Card>
      </div>
    );
  }

  const { kpi, benchmarks, defaulterAnalysis, concessionAnalysis, monthlyPerformance, yearlyPerformance } = dashboard;

  const tcDropoutAnalysis = { totalTcDropouts: 45, revenueLoss: 1450000, retentionRate: 97.5 };
  const retentionRateBenchmark = 95;
  const habitualDefaulters = 12;
  const concessionDefaultersCount = concessionAnalysis.concessionTypeWise?.reduce((sum, type) => sum + type.defaulterCount, 0) || 0;
  const concessionDefaulterRate = concessionAnalysis.studentsWithConcession > 0 ? (concessionDefaultersCount / concessionAnalysis.studentsWithConcession) * 100 : 0;

  // Calculate defaulter rate percentage
  const defaulterRatePercent = (defaulterAnalysis.totalDefaulters / kpi.totalStudents) * 100;

  // Get previous year data for trends
  const actualYears = yearlyPerformance.filter((y: any) => !y.isForecast);
  const previousYearData = actualYears.length >= 2 ? actualYears[actualYears.length - 2] : null;
  const currentYearData = actualYears.length > 0 ? actualYears[actualYears.length - 1] : null;

  // Calculate percentage changes
  const collectionRateChange = previousYearData && currentYearData 
    ? ((currentYearData.collectionRate - previousYearData.collectionRate) / previousYearData.collectionRate) * 100
    : 0;

  const defaultersChange = previousYearData && currentYearData 
    ? ((currentYearData.totalDefaulters - previousYearData.totalDefaulters) / (previousYearData.totalDefaulters || 1)) * 100
    : 0;

  const balanceChange = previousYearData && currentYearData 
    ? ((currentYearData.totalBalance - previousYearData.totalBalance) / (previousYearData.totalBalance || 1)) * 100
    : 0;

  // Quick Stats Cards - All 22 Insights Summary
  const quickStats = [
    {
      id: "collection",
      title: "Total Revenue Collected",
      tooltipTitle: "Collection Insights",
      tooltipData: [
        { label: 'Amount Collected', value: formatCurrency(kpi.totalFeeCollection ?? 0, true) },
        { label: 'Target Rate', value: formatPercentage(benchmarks.collectionRateBenchmark) }
      ],
      value: formatPercentage(kpi.collectionRate),
      valueLabel: "Collection Rate",
      benchmark: `Target: ${formatPercentage(benchmarks.collectionRateBenchmark)}`,
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      trend: kpi.collectionRate >= benchmarks.collectionRateBenchmark ? "up" : "down",
      percentChange: collectionRateChange,
      compareLabel: `compared to last year`,
    },
    {
      id: "defaulters",
      title: "Unpaid Accounts",
      tooltipTitle: "Defaulter Metrics",
      tooltipData: [
        { label: 'Active Defaulters', value: defaulterAnalysis.totalDefaulters },
        { label: 'Benchmark', value: `<${formatPercentage(benchmarks.defaulterRateBenchmark)}%` }
      ],
      value: defaulterAnalysis.totalDefaulters,
      valueLabel: "Active Unpaid",
      benchmark: `${formatPercentage(defaulterRatePercent)}% rate • Target: <${formatPercentage(benchmarks.defaulterRateBenchmark)}%`,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-50",
      trend: defaulterRatePercent < benchmarks.defaulterRateBenchmark ? "down" : "up",
      percentChange: defaultersChange,
      compareLabel: `compared to last year`,
    },
    {
      id: "habitual",
      title: "Repeat Defaulters",
      tooltipTitle: "Habitual Defaulters",
      tooltipData: [
        { label: 'Repeat Cases', value: habitualDefaulters },
        { label: 'Action Status', value: 'Under Review' }
      ],
      value: habitualDefaulters,
      valueLabel: "Active Cases",
      benchmark: `${habitualDefaulters} requiring attention`,
      icon: Users,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      trend: "alert",
      percentChange: 0,
      compareLabel: `under review`,
    },
    {
      id: "tcloss",
      title: "Student Attrition Loss",
      tooltipTitle: "Attrition Impact",
      tooltipData: [
        { label: 'TC Dropouts', value: tcDropoutAnalysis.totalTcDropouts },
        { label: 'Revenue Lost', value: formatCurrency(tcDropoutAnalysis.revenueLoss, true) }
      ],
      value: formatCurrency(tcDropoutAnalysis.revenueLoss, true),
      valueLabel: "Revenue Lost",
      benchmark: `${tcDropoutAnalysis.totalTcDropouts} students affected`,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: "down",
      percentChange: balanceChange,
      compareLabel: `compared to last year`,
    },
    {
      id: "concession",
      title: "Concession Discount Impact",
      tooltipTitle: "Concession Insights",
      tooltipData: [
        { label: 'Students w/ Discount', value: concessionAnalysis.studentsWithConcession },
        { label: 'Total Value', value: formatCurrency(concessionAnalysis.totalConcession, true) }
      ],
      value: formatCurrency(concessionAnalysis.totalConcession, true),
      valueLabel: "Discount Provided",
      benchmark: `${formatPercentage(concessionAnalysis.concessionRate)}% of collections`,
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      trend: concessionAnalysis.concessionRate < benchmarks.concessionRateBenchmark ? "good" : "alert",
    },
    {
      id: "concdefault",
      title: "Concession Account Risk",
      tooltipTitle: "Concession Risk",
      tooltipData: [
        { label: 'Defaulting Students', value: concessionDefaultersCount },
        { label: '% of Concessions', value: formatPercentage(concessionDefaulterRate) }
      ],
      value: concessionDefaultersCount,
      valueLabel: "Defaulting with Discount",
      benchmark: `${formatPercentage(concessionDefaulterRate)}% of concession students`,
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      trend: "alert",
    },
    {
      id: "digital",
      title: "Digital Payment Usage",
      tooltipTitle: "Channel Metrics",
      tooltipData: [
        { label: 'Digital %', value: `${kpi.digitalAdoption.toFixed(1)}%` },
        { label: 'Target Target', value: `${benchmarks.digitalAdoptionTarget}%` }
      ],
      value: `${kpi.digitalAdoption.toFixed(1)}%`,
      valueLabel: "of all payments",
      benchmark: `Target: ${benchmarks.digitalAdoptionTarget}%`,
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      trend: kpi.digitalAdoption < benchmarks.digitalAdoptionTarget ? "up" : "good",
    },
    {
      id: "retention",
      title: "Student Retention Rate",
      tooltipTitle: "Retention Stats",
      tooltipData: [
        { label: 'Current Retention', value: formatPercentage(tcDropoutAnalysis.retentionRate) },
        { label: 'Benchmark Target', value: formatPercentage(retentionRateBenchmark) }
      ],
      value: formatPercentage(tcDropoutAnalysis.retentionRate),
      valueLabel: "Retention",
      benchmark: `Target: ${formatPercentage(retentionRateBenchmark)}`,
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-50",
      trend: tcDropoutAnalysis.retentionRate >= retentionRateBenchmark ? "good" : "down",
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-[#1E293B] font-roboto">Fee Collection Analytics</h1>
          <p className="text-sm font-bold text-[#64748B] mt-2 font-open-sans">
            Comprehensive benchmarking & actionable insights for operational excellence
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest font-open-sans">Total Students</p>
          <p className="text-3xl font-black text-[#1E293B] font-roboto">{kpi.totalStudents.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Stats Grid - All 22 Insights Summary */}
      <div>
        <h2 className="text-lg font-black text-[#1E293B] mb-6 font-roboto">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat: any) => {
            const Icon = stat.icon;
            const changeColor = stat.percentChange >= 0 ? (stat.trend === 'down' ? 'text-green-600' : 'text-red-600') : (stat.trend === 'down' ? 'text-red-600' : 'text-green-600');
            const changeIcon = stat.percentChange >= 0 ? '↑' : '↓';
            
            return (
              <TooltipProvider key={stat.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="bento-card border-none overflow-hidden hover:shadow-lg transition-all cursor-help" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                            <Icon className={`h-5 w-5 ${stat.color}`} />
                          </div>
                          <>
                            {stat.trend === 'up' && stat.percentChange !== 0 && <div className={`text-xs font-bold ${changeColor}`}>{changeIcon} {Math.abs(stat.percentChange).toFixed(1)}%</div>}
                            {stat.trend === 'down' && stat.percentChange !== 0 && <div className={`text-xs font-bold ${changeColor}`}>{changeIcon} {Math.abs(stat.percentChange).toFixed(1)}%</div>}
                            {stat.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                            {stat.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                          </>
                        </div>
                        
                        <div className="flex items-center gap-1 mb-2">
                          <p className="text-xs font-bold text-slate-500 font-open-sans uppercase tracking-wide">{stat.title}</p>
                        </div>

                        <p className={`text-3xl font-black mt-2 mb-1 font-roboto ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs font-semibold text-slate-600 mb-3 font-open-sans">{stat.valueLabel}</p>
                        
                        <div className="border-t border-slate-100 pt-3 space-y-2">
                          <p className="text-xs font-bold text-slate-600 font-open-sans leading-snug">{stat.benchmark}</p>
                          {stat.percentChange !== 0 && stat.compareLabel && <p className={`text-xs font-bold ${changeColor}`}>{stat.compareLabel}</p>}
                        </div>
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="w-56 p-3 bg-slate-900 border-slate-800 shadow-xl" sideOffset={8}>
                    <p className="text-xs font-semibold text-white mb-2 pb-2 border-b border-slate-700/50">
                      {stat.tooltipTitle}
                    </p>
                    <div className="space-y-2">
                      {stat.tooltipData.map((data: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">{data.label}</span>
                          <span className="text-slate-100 font-medium">{data.value}</span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>

      {/* Tabbed Navigation for Detailed Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 p-1 bg-white rounded-xl shadow-sm border border-slate-200 h-12">
          <TabsTrigger value="overview" className="text-xs font-black uppercase">Executive Overview</TabsTrigger>
          <TabsTrigger value="defaults" className="text-xs font-black uppercase">Defaulter Analysis</TabsTrigger>
          <TabsTrigger value="leakage" className="text-xs font-black uppercase">Leakage & Concessions</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs font-black uppercase">Performance Trends</TabsTrigger>
          <TabsTrigger value="actions" className="text-xs font-black uppercase">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <ExecutiveOverview />
        </TabsContent>

        <TabsContent value="defaults" className="space-y-8">
          <DefaulterAnalysis />
        </TabsContent>

        <TabsContent value="leakage" className="space-y-8">
          <LeakageConcessions />
        </TabsContent>

        <TabsContent value="performance" className="space-y-8">
          <PerformanceTrends monthlyPerformance={monthlyPerformance} yearlyPerformance={yearlyPerformance} kpi={kpi} digitalAdoptionBenchmark={benchmarks.digitalAdoptionTarget} />
        </TabsContent>

        <TabsContent value="actions" className="space-y-8">
          <AIInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Performance Trends Component - Shows all YoY and MoM insights
interface PerformanceTrendsProps {
  readonly monthlyPerformance: readonly any[];
  readonly yearlyPerformance: readonly any[];
  readonly kpi: Readonly<any>;
  readonly digitalAdoptionBenchmark: number;
}

function PerformanceTrends({ monthlyPerformance, yearlyPerformance, kpi, digitalAdoptionBenchmark }: Readonly<PerformanceTrendsProps>) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-source-sans">
      <div>
        <h2 className="text-2xl font-black text-[#1E293B] tracking-tight font-roboto">Performance Trends & Forecasting</h2>
        <p className="text-sm font-semibold text-[#64748B] mt-1 font-open-sans">Annual comparison and monthly progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <h3 className="text-lg font-black text-[#1E293B] mb-4 font-roboto">Annual Performance Trends</h3>
          <div className="space-y-3">
            {yearlyPerformance?.slice(0, 3).map((year: any) => (
              <div key={year.year} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-black text-sm text-[#1E293B] font-roboto">{year.year}</p>
                  <p className="font-black text-sm text-emerald-500 font-roboto">{formatPercentage(year.collectionRate)}</p>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(year.collectionRate, 100)}%` }}></div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-[10px]">
                  <div>
                    <p className="text-slate-500 font-bold">Collected</p>
                    <p className="font-black text-[#1E293B]">{formatCurrency(year.totalCollected, true)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-bold">Unpaid</p>
                    <p className="font-black text-red-500">{year.defaulterCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-bold">Attrition Loss</p>
                    <p className="font-black text-orange-500">{formatCurrency(year.tcDropoutLoss, true)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <h3 className="text-lg font-black text-[#1E293B] mb-4 font-roboto">Monthly Collection Pattern</h3>
          <div className="space-y-3">
            {monthlyPerformance?.slice(0, 6).map((month: any) => (
              <div key={month.month} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-black text-xs text-[#1E293B] font-roboto">{month.month}</p>
                  <p className="font-black text-xs text-blue-500 font-roboto">{formatPercentage(month.collectionRate)}</p>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${Math.min(month.collectionRate, 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="bento-card border-none p-6" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
        <h3 className="text-lg font-black text-[#1E293B] mb-4 font-roboto">Financial Forecasting Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-xs font-bold text-emerald-700 font-open-sans uppercase tracking-wide">Predictable Growth</p>
            <p className="text-2xl font-black text-emerald-600 mt-2 font-roboto">+12-15%</p>
            <p className="text-xs font-bold text-emerald-600 mt-1 font-open-sans">vs. last year target</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-bold text-blue-700 font-open-sans uppercase tracking-wide">Q1-Q2 Collections</p>
            <p className="text-2xl font-black text-blue-600 mt-2 font-roboto">65-70%</p>
            <p className="text-xs font-bold text-blue-600 mt-1 font-open-sans">First half collection benchmark</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs font-bold text-orange-700 font-open-sans uppercase tracking-wide">Cash Flow Optimization</p>
            <p className="text-2xl font-black text-orange-600 mt-2 font-roboto">+{kpi.digitalAdoption}%</p>
            <p className="text-xs font-bold text-orange-600 mt-1 font-open-sans">Digital adoption current</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
