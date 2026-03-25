import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useDashboard, formatCurrency, formatPercentage } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { DefaulterLocationMap } from '@/components/views/DefaulterLocationMap';
import { Target, Wallet, AlertCircle, TrendingUp, TrendingDown, Sparkles, Lightbulb, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DashboardHome() {
  const { data: dashboard, isLoading, error } = useDashboard('2025-26');

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

  const { kpi, previousKpi, benchmarks, yearlyPerformance } = dashboard;

  const calculateYoy = (current: number, previous: number | undefined) => {
    if (!previous) return null;
    if (previous === 0) return current > 0 ? 100 : 0;
    const diff = current - previous;
    return (diff / previous) * 100;
  };

  const kpiCards = [
    {
      title: 'Total Revenue Collected',
      value: formatCurrency(kpi.totalFeeCollection, true),
      yoy: calculateYoy(kpi.totalFeeCollection, previousKpi?.totalFeeCollection),
      trendLabel: 'Yearly Trend',
      benchmark: `${formatPercentage(kpi.collectionRate)} collection rate`,
      target: `Industry benchmark: ${benchmarks.collectionRateBenchmark}%`,
      status: kpi.collectionRate >= benchmarks.collectionRateBenchmark ? 'good' : 'alert',
      icon: Wallet,
      tooltipTitle: 'Revenue Insights',
      tooltipData: [
        { label: 'Amount Collected', value: formatCurrency(kpi.totalFeeCollection) },
        { label: 'Pending Dues', value: formatCurrency(Math.max(0, (kpi.totalFeeCollection / (kpi.collectionRate/100)) - kpi.totalFeeCollection)) }
      ]
    },
    {
      title: 'Unpaid Accounts',
      value: kpi.activeDefaultersCount.toLocaleString('en-IN'),
      yoy: calculateYoy(kpi.activeDefaultersCount, previousKpi?.activeDefaultersCount),
      trendLabel: 'Annual Change',
      benchmark: `${formatPercentage(kpi.defaulterRate)} default rate`,
      target: `Target: <${benchmarks.defaulterRateBenchmark}%`,
      status: kpi.defaulterRate <= benchmarks.defaulterRateBenchmark ? 'good' : 'alert',
      icon: AlertCircle,
      tooltipTitle: 'Defaulter Breakdown',
      tooltipData: [
        { label: 'Total Enrolled', value: Math.round(kpi.activeDefaultersCount / (kpi.defaulterRate/100)).toLocaleString('en-IN') },
        { label: 'Active Unpaid', value: kpi.activeDefaultersCount.toLocaleString('en-IN') }
      ]
    },
    {
      title: 'Digital Payment Usage',
      value: `${kpi.digitalAdoption.toFixed(1)}%`,
      yoy: calculateYoy(kpi.digitalAdoption, previousKpi?.digitalAdoption),
      trendLabel: 'from last year',
      benchmark: `Digital share of payments`,
      target: `Target: ${benchmarks.digitalAdoptionTarget}%`,
      status: kpi.digitalAdoption >= benchmarks.digitalAdoptionTarget ? 'good' : 'alert',
      icon: TrendingUp,
      tooltipTitle: 'Payment Methods',
      tooltipData: [
        { label: 'Digital', value: `${kpi.digitalAdoption.toFixed(1)}%` },
        { label: 'Cash/Cheque', value: `${(100 - kpi.digitalAdoption).toFixed(1)}%` }
      ]
    },
  ];

  // Status system
  const statusStyle = (s: string) => ({
    color:  s === 'good' ? '#059669' : '#D97706',           // emerald-600 / amber-600
    bg:     s === 'good' ? 'bg-emerald-50' : 'bg-amber-50',
    border: s === 'good' ? 'border-emerald-200' : 'border-amber-200',
    bar:    s === 'good' ? 'bg-emerald-500' : 'bg-amber-500',
    dot:    s === 'good' ? 'text-emerald-600' : 'text-amber-600',
  });

  return (
    <div className="min-h-screen bg-transparent space-y-6 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Fee analytics overview · <span className="font-medium text-slate-700">FY 2025–26</span>
            </p>
          </div>
          <Badge variant="outline" className="text-xs bg-white border-slate-200 text-slate-600 flex items-center gap-1.5 py-1.5 px-3">
            <Target className="w-3 h-3" />
            Industry Benchmark: {benchmarks.collectionRateBenchmark}%
          </Badge>
        </div>

        {/* KEY PERFORMANCE INDICATORS */}
        <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              const st = statusStyle(card.status);

              return (
                <Tooltip key={card.title} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Card
                      className={`border ${st.border} shadow-sm hover:shadow-md transition-all duration-200 bg-white relative overflow-hidden rounded-xl group cursor-help`}
                    >
                      {/* 3px left accent stripe */}
                      <div className={`absolute top-0 left-0 h-full w-[3px] ${st.bar}`} />

                      <div className="pl-8 pr-6 py-5">
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-400">
                            {card.title}
                          </p>
                          <Info className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-end justify-between gap-2">
                          <div>
                            <p className="text-[2rem] font-bold leading-none text-slate-900 tabular-nums">
                              {card.value}
                            </p>
                            {card.yoy !== null && card.yoy !== undefined && (
                              <div className="mt-2 flex items-center gap-1.5">
                                <span className={`text-[12px] font-medium flex items-center ${card.yoy >= 0 ? (card.title === 'Unpaid Accounts' ? 'text-rose-600' : 'text-emerald-600') : (card.title === 'Unpaid Accounts' ? 'text-emerald-600' : 'text-rose-600')}`}>
                                  {card.yoy >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                  {card.yoy >= 0 ? 'Up' : 'Down'} {Math.abs(card.yoy).toFixed(1)}% {card.trendLabel}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className={`p-2.5 rounded-lg ${st.bg} border ${st.border} shrink-0 mb-0.5`}>
                            <Icon className="w-5 h-5" style={{ color: st.color }} strokeWidth={1.8} />
                          </div>
                        </div>
                        <div className="mt-3.5 flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${st.bar}`} />
                          <span className="text-[13px] text-slate-600 font-medium">{card.benchmark}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5">{card.target}</p>
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="w-56 p-3 bg-slate-900 border-slate-800 shadow-xl" sideOffset={8}>
                    <p className="text-xs font-semibold text-white mb-2 pb-2 border-b border-slate-700/50">
                      {card.tooltipTitle}
                    </p>
                    <div className="space-y-2">
                      {card.tooltipData.map((data, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">{data.label}</span>
                          <span className="text-slate-100 font-medium">{data.value}</span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Map Section - 60% */}
        <Card className="bento-card lg:col-span-3">
          <div className="mb-6">
            <h3 className="text-[15px] font-semibold text-slate-800 flex items-center gap-2">
              Defaulter Hotspot Map
            </h3>
            <p className="text-[13px] text-slate-500 mt-1">
              Geographic concentration of defaulters — focus on zones with elevated default rates.
            </p>
          </div>
          <DefaulterLocationMap />
        </Card>

        {/* AI Insights Section - 40% */}
        <Card className="bg-white border border-slate-200 p-0 rounded-xl lg:col-span-2 relative overflow-hidden flex flex-col" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)' }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.05)_0%,_transparent_60%)] pointer-events-none" />
          
          <div className="p-6 flex flex-col h-full">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                AI Insights
              </h3>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-medium px-2 py-0.5">
                FY 2025–26
              </Badge>
            </div>
            
            <div className="space-y-3 flex-1">
              {[
                { text: `Collection rate of ${formatPercentage(kpi.collectionRate)} is ${kpi.collectionRate >= benchmarks.collectionRateBenchmark ? 'above' : 'below'} the ${benchmarks.collectionRateBenchmark}% industry benchmark — strong fee recovery.`, delay: 0.1 },
                  { text: `${kpi.activeDefaultersCount} active defaulters represent ${formatPercentage(kpi.defaulterRate)} of enrolled students. Targeted outreach to hotspot areas can reduce this further.`, delay: 0.25 },
                { text: `Digital adoption at ${kpi.digitalAdoption.toFixed(1)}% — consider UPI reminders and auto-debit mandates to push adoption past the ${benchmarks.digitalAdoptionTarget}% target.`, delay: 0.4 }
              ].map((insight, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: insight.delay, ease: 'easeOut' }}
                  className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-start gap-3 hover:bg-emerald-50 transition-colors"
                >
                  <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-700 leading-relaxed">
                    {insight.text}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Insights derived from actual collection data
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
