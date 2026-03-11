import React from 'react';
import { Card } from '@/components/ui/card';
import { useDashboard, formatCurrency, formatPercentage } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import { DefaulterLocationMap } from '@/components/views/DefaulterLocationMap';
import { Target, Wallet, AlertCircle, TrendingUp, Sparkles, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

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

  const { kpi, benchmarks, yearlyPerformance } = dashboard;

  const kpiCards = [
    {
      title: 'Total Collection',
      value: formatCurrency(kpi.totalFeeCollection, true),
      benchmark: `${formatPercentage(kpi.collectionRate)} collection rate`,
      target: `Industry benchmark: ${benchmarks.collectionRateBenchmark}%`,
      status: kpi.collectionRate >= benchmarks.collectionRateBenchmark ? 'good' : 'alert',
      icon: Wallet,
    },
    {
      title: 'Active Defaulters',
      value: kpi.totalDefaulters.toLocaleString('en-IN'),
      benchmark: `${formatPercentage(kpi.defaulterRate)} default rate`,
      target: `Target: <${benchmarks.defaulterRateBenchmark}%`,
      status: kpi.defaulterRate <= benchmarks.defaulterRateBenchmark ? 'good' : 'alert',
      icon: AlertCircle,
    },
    {
      title: 'Digital Adoption',
      value: `${kpi.digitalAdoption.toFixed(1)}%`,
      benchmark: `of payments are digital`,
      target: `Target: ${benchmarks.digitalAdoptionTarget}%`,
      status: kpi.digitalAdoption >= benchmarks.digitalAdoptionTarget ? 'good' : 'alert',
      icon: TrendingUp,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            const st = statusStyle(card.status);

            return (
              <Card
                key={card.title}
                className={`border ${st.border} shadow-sm hover:shadow-md transition-all duration-200 bg-white relative overflow-hidden rounded-xl group`}
              >
                {/* 3px left accent stripe */}
                <div className={`absolute top-0 left-0 h-full w-[3px] ${st.bar}`} />

                <div className="pl-8 pr-6 py-5">
                  <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-400 mb-3">
                    {card.title}
                  </p>
                  <div className="flex items-end justify-between gap-2">
                    <p className="text-[2rem] font-bold leading-none text-slate-900 tabular-nums">
                      {card.value}
                    </p>
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
            );
          })}
        </div>
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
        <Card className="bg-[#0F172A] border border-slate-800 p-0 rounded-xl lg:col-span-2 relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.08)_0%,_transparent_60%)] pointer-events-none" />
          
          <div className="p-6 flex flex-col h-full">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                AI Insights
              </h3>
              <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/20 text-[11px] font-medium px-2 py-0.5">
                FY 2025–26
              </Badge>
            </div>
            
            <div className="space-y-3 flex-1">
              {[
                { text: `Collection rate of ${formatPercentage(kpi.collectionRate)} is ${kpi.collectionRate >= benchmarks.collectionRateBenchmark ? 'above' : 'below'} the ${benchmarks.collectionRateBenchmark}% industry benchmark — strong fee recovery.`, delay: 0.1 },
                { text: `${kpi.totalDefaulters} active defaulters represent ${formatPercentage(kpi.defaulterRate)} of enrolled students. Targeted outreach to hotspot areas can reduce this further.`, delay: 0.25 },
                { text: `Digital adoption at ${kpi.digitalAdoption.toFixed(1)}% — consider UPI reminders and auto-debit mandates to push adoption past the ${benchmarks.digitalAdoptionTarget}% target.`, delay: 0.4 }
              ].map((insight, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: insight.delay, ease: 'easeOut' }}
                  className="bg-white/5 border border-white/8 p-4 rounded-lg flex items-start gap-3 hover:bg-white/8 transition-colors"
                >
                  <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-300 leading-relaxed">
                    {insight.text}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/8">
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Insights derived from actual collection data
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
