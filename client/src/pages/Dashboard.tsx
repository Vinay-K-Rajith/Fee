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
} from "lucide-react";
import { ExecutiveOverview } from "@/components/views/ExecutiveOverview";
import { DefaulterAnalysis } from "@/components/views/DefaulterAnalysis";
import { LeakageConcessions } from "@/components/views/LeakageConcessions";
import { AIInsights } from "@/components/views/AIInsights";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard, formatCurrency, formatPercentage } from "@/hooks/use-api";

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

  const { kpi, benchmarks, defaulterAnalysis, tcDropoutAnalysis, concessionAnalysis, monthlyPerformance, yearlyPerformance } = dashboard;

  // Calculate defaulter rate percentage
  const defaulterRatePercent = (defaulterAnalysis.totalDefaulters / kpi.totalStudents) * 100;

  // Quick Stats Cards - All 22 Insights Summary
  const quickStats = [
    {
      id: "collection",
      title: "Overall Collection Rate",
      value: formatPercentage(kpi.collectionRate),
      benchmark: `Target: ${formatPercentage(benchmarks.collectionRateBenchmark)}`,
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      trend: kpi.collectionRate >= benchmarks.collectionRateBenchmark ? "up" : "down",
      insight: "Insight #1, #2, #15"
    },
    {
      id: "defaulters",
      title: "Total Defaulters",
      value: defaulterAnalysis.totalDefaulters,
      benchmark: `${formatPercentage(defaulterRatePercent)} rate`,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-50",
      trend: defaulterRatePercent < benchmarks.defaulterRateBenchmark ? "down" : "up",
      insight: "Insight #3, #4, #10, #11, #12, #13"
    },
    {
      id: "habitual",
      title: "Habitual Defaulters",
      value: defaulterAnalysis.habitualDefaulters,
      benchmark: `${defaulterAnalysis.habitualDefaulters} repeat cases`,
      icon: Users,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      trend: "alert",
      insight: "Insight #10"
    },
    {
      id: "tcloss",
      title: "TC/Dropout Loss",
      value: formatCurrency(tcDropoutAnalysis.revenueLoss, true),
      benchmark: `${tcDropoutAnalysis.totalTcDropouts} students`,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: "down",
      insight: "Insight #5, #6, #22"
    },
    {
      id: "concession",
      title: "Concession Loss",
      value: formatCurrency(concessionAnalysis.totalConcessionGiven, true),
      benchmark: `${formatPercentage(concessionAnalysis.concessionRate)}% of collection`,
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      trend: concessionAnalysis.concessionRate < benchmarks.concessionRateBenchmark ? "good" : "alert",
      insight: "Insight #7, #8, #9"
    },
    {
      id: "concdefault",
      title: "Concession Defaulters",
      value: concessionAnalysis.concessionDefaulters,
      benchmark: `${formatPercentage(concessionAnalysis.concessionDefaulterRate)}% rate`,
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      trend: "alert",
      insight: "Insight #9"
    },
    {
      id: "digital",
      title: "Digital Adoption",
      value: `${kpi.digitalAdoption}%`,
      benchmark: `Target: ${benchmarks.digitalAdoptionBenchmark}%`,
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      trend: kpi.digitalAdoption < benchmarks.digitalAdoptionBenchmark ? "up" : "good",
      insight: "Insight #17"
    },
    {
      id: "retention",
      title: "Retention Rate",
      value: formatPercentage(tcDropoutAnalysis.retentionRate),
      benchmark: `Target: ${formatPercentage(benchmarks.retentionRateBenchmark)}`,
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-50",
      trend: tcDropoutAnalysis.retentionRate >= benchmarks.retentionRateBenchmark ? "good" : "down",
      insight: "Insight #5, #22"
    },
  ];

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-[#1E293B] font-roboto">Fee Collection Analytics</h1>
          <p className="text-sm font-bold text-[#64748B] mt-2 font-open-sans">
            Comprehensive insights covering 22 benchmarks & 10 action categories
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest font-open-sans">Total Students</p>
          <p className="text-3xl font-black text-[#1E293B] font-roboto">{kpi.totalStudents.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Stats Grid - All 22 Insights Summary */}
      <div>
        <h2 className="text-lg font-black text-[#1E293B] mb-6 font-roboto">Key Performance Indicators (22 Insights)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.id} className="bento-card border-none overflow-hidden hover:shadow-lg transition-all" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    {stat.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {stat.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                  </div>
                  <p className="text-xs font-bold text-slate-500 font-open-sans uppercase tracking-wide">{stat.title}</p>
                  <p className={`text-2xl font-black mt-1 font-roboto ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs font-bold text-slate-400 mt-2 font-open-sans">{stat.benchmark}</p>
                  <p className="text-[10px] font-black text-blue-500 mt-2 font-open-sans">{stat.insight}</p>
                </div>
              </Card>
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
          <PerformanceTrends monthlyPerformance={monthlyPerformance} yearlyPerformance={yearlyPerformance} kpi={kpi} digitalAdoptionBenchmark={benchmarks.digitalAdoptionBenchmark} />
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
        <p className="text-sm font-semibold text-[#64748B] mt-1 font-open-sans">Year-on-Year and Month-on-Month analysis covering Insights #1, #2, #3, #4, #5, #6, #16, #21</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <h3 className="text-lg font-black text-[#1E293B] mb-4 font-roboto">Year-on-Year Trends</h3>
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
                    <p className="text-slate-500 font-bold">Defaulters</p>
                    <p className="font-black text-red-500">{year.defaulterCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-bold">TC Loss</p>
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
        <h3 className="text-lg font-black text-[#1E293B] mb-4 font-roboto">Financial Forecasting Insights (Insight #21)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-xs font-bold text-emerald-700 font-open-sans uppercase tracking-wide">Predictable Growth</p>
            <p className="text-2xl font-black text-emerald-600 mt-2 font-roboto">+12-15%</p>
            <p className="text-xs font-bold text-emerald-600 mt-1 font-open-sans">Annual growth target</p>
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
