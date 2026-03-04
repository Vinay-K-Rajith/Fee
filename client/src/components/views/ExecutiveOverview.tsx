import { Card } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { Wallet, AlertCircle, FileText, Smartphone } from "lucide-react";
import { useDashboard, useFeePayMasters, formatCurrency, formatPercentage } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";

export function ExecutiveOverview() {
  const { data: dashboard, isLoading: dashLoading, error: dashError } = useDashboard();
  const { data: feePayMasters, isLoading: pmLoading, error: pmError } = useFeePayMasters();

  const isLoading = dashLoading || pmLoading;
  const error = dashError || pmError;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-source-sans">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[450px] rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="h-[250px] rounded-xl" />
            <Skeleton className="h-[250px] rounded-xl" />
          </div>
        </div>
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

  const { kpi, benchmarks, yearlyPerformance, defaulterAnalysis } = dashboard;

  // Prepare chart data

  const sparklinePositive = [
    { v: 40 }, { v: 42 }, { v: 45 }, { v: 43 }, { v: 48 }, { v: 52 }, { v: 55 }
  ];

  const sparklineNegative = [
    { v: 60 }, { v: 58 }, { v: 55 }, { v: 52 }, { v: 54 }, { v: 50 }, { v: 45 }
  ];

  // Calculate defaulter types distribution
  const defaulterTypes = [
    { name: 'Habitual Defaulters', value: defaulterAnalysis.habitualDefaulters, color: '#F59E0B' },
    { name: 'First-Time Late', value: defaulterAnalysis.firstTimeDefaulters, color: '#3B82F6' },
    { name: 'Concession Beneficiaries', value: defaulterAnalysis.concessionBeneficiaryDefaulters, color: '#1E293B' }
  ];

  // Top occupation defaulters (for future use if needed)

  // Yearly concession trend (for future use if needed)

  // Location risk data from actual data
  const locations = defaulterAnalysis.locationWise.slice(0, 25);

  // KPI Cards data
  const kpiCards = [
    {
      label: "Total Fee Collection",
      value: formatCurrency(kpi.totalFeeCollection, true),
      trend: kpi.collectionRate >= benchmarks.collectionRateBenchmark
        ? `↑ ${formatPercentage(kpi.collectionRate - benchmarks.collectionRateBenchmark)} Above Benchmark`
        : `↓ ${formatPercentage(benchmarks.collectionRateBenchmark - kpi.collectionRate)} Below Benchmark`,
      color: kpi.collectionRate >= benchmarks.collectionRateBenchmark ? "text-[#10B981]" : "text-[#F59E0B]",
      bgColor: kpi.collectionRate >= benchmarks.collectionRateBenchmark ? "bg-emerald-50" : "bg-orange-50",
      iconColor: kpi.collectionRate >= benchmarks.collectionRateBenchmark ? "text-emerald-600" : "text-orange-600",
      icon: Wallet,
      spark: sparklinePositive,
      sparkColor: "#10B981"
    },
    {
      label: "Active Defaulter Rate",
      value: formatPercentage(kpi.defaulterRate),
      trend: `Target: <${benchmarks.defaulterRateBenchmark}%`,
      color: kpi.defaulterRate <= benchmarks.defaulterRateBenchmark ? "text-[#10B981]" : "text-[#F59E0B]",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      icon: AlertCircle,
      spark: sparklineNegative,
      sparkColor: "#F59E0B"
    },
    {
      label: "Revenue Lost (TCs)",
      value: formatCurrency(kpi.totalTcDropoutLoss, true),
      trend: `${kpi.tcDropoutCount} students withdrawn`,
      color: "text-[#F59E0B]",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      icon: FileText,
      spark: sparklineNegative,
      sparkColor: "#F59E0B"
    },
    {
      label: "Digital Adoption",
      value: `${kpi.digitalAdoption}%`,
      trend: `Target: ${benchmarks.digitalAdoptionBenchmark}%`,
      color: kpi.digitalAdoption >= benchmarks.digitalAdoptionBenchmark ? "text-[#10B981]" : "text-[#3B82F6]",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      icon: Smartphone,
      spark: sparklinePositive,
      sparkColor: "#10B981"
    },
  ];
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-source-sans">
      <div>
        <h2 className="text-2xl font-black text-[#1E293B] tracking-tight font-roboto">Financial Vital Signs</h2>
        <p className="text-sm font-bold text-[#64748B] mt-1 font-open-sans">Real-time performance analytics engine.</p>
      </div>

      {/* Top Tier: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <Card key={card.label} className="bento-card relative overflow-hidden group flex flex-col justify-between border-none shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <span className="text-[13px] font-bold text-[#64748B] font-open-sans">{card.label}</span>
                <div className={`w-8 h-8 rounded-full ${card.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </div>
              <h3 className="text-[28px] font-black text-[#1E293B] leading-tight mb-0.5 font-roboto">{card.value}</h3>
              <p className={`text-[11px] font-black ${card.color} tracking-wide uppercase font-open-sans mb-4`}>{card.trend}</p>
            </div>

            <div className="h-8 w-full opacity-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={card.spark}>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={card.sparkColor}
                    strokeWidth={1.5}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ))}
      </div>

      {/* Middle Tier: Collection Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bento-card h-full border-none shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="text-lg font-black text-[#1E293B] font-roboto">Yearly Trend & Performance</h3>
                <p className="text-xs font-bold text-[#64748B] font-open-sans">Historical collection rate trajectory</p>
              </div>
            </div>

            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={yearlyPerformance} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 800 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 800 }} label={{ value: 'Collection Rate (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Collection Rate']}
                  />
                  <Line type="monotone" dataKey="collectionRate" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bento-card h-[250px] border-none shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
            <h4 className="text-xs font-black text-[#64748B] uppercase tracking-widest mb-6 font-open-sans">Defaulter Composition</h4>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={defaulterTypes}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {defaulterTypes.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
              {defaulterTypes.map((t) => (
                <div key={t.name} className="flex items-center gap-1.5 text-[10px] font-black text-[#64748B] font-open-sans">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }}></div>
                  {t.name.split(' ')[0]}
                </div>
              ))}
            </div>
          </Card>

          <Card className="bento-card border-none shadow-md p-4" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
            <h4 className="text-xs font-black text-[#64748B] uppercase tracking-widest mb-4 font-open-sans">Quick Insights</h4>
            <div className="space-y-3">
              <div className="text-[11px] font-bold text-[#1E293B] font-open-sans">
                <span className="text-[#F59E0B]">→</span> {defaulterAnalysis.habitualDefaulters} students in default pattern
              </div>
              <div className="text-[11px] font-bold text-[#1E293B] font-open-sans">
                <span className="text-[#3B82F6]">→</span> {defaulterAnalysis.locationWise.filter(l => l.defaulterRate > 15).length} critical zones need intervention
              </div>
              <div className="text-[11px] font-bold text-[#1E293B] font-open-sans">
                <span className="text-[#10B981]">→</span> Target collection rate: {benchmarks.collectionRateBenchmark}%
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Tier: Forecasting & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Late Fee & Payment Mode Optimization */}
        <Card className="bento-card border-none flex flex-col justify-between shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div>
            <h3 className="text-lg font-black text-[#1E293B] mb-2 font-roboto">Late Fee & Payment Mode Optimization</h3>
            <p className="text-xs font-bold text-[#64748B] mb-8 font-open-sans">Forecasting reliance on digital vs traditional channels</p>

            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-[#1E293B] uppercase tracking-wider font-open-sans">Digital (UPI/Cards)</span>
                  <span className="text-xl font-black text-[#10B981] font-roboto">{kpi.digitalAdoption}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] transition-all duration-1000" style={{ width: `${kpi.digitalAdoption}%` }}></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-[#1E293B] uppercase tracking-wider font-open-sans">Cash / Cheque</span>
                  <span className="text-xl font-black text-slate-400 font-roboto">{100 - kpi.digitalAdoption}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 transition-all duration-1000" style={{ width: `${100 - kpi.digitalAdoption}%` }}></div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-[#1E293B] uppercase tracking-wider font-open-sans">Late Fee Collected</span>
                  <span className="text-xl font-black text-[#F59E0B] font-roboto">{formatCurrency(kpi.totalLateFee, true)}</span>
                </div>
                <div className="text-xs font-bold text-[#64748B] font-open-sans">
                  Represents {kpi.totalFeeCollection > 0 ? formatPercentage((kpi.totalLateFee / kpi.totalFeeCollection) * 100) : '0%'} of total realized revenue
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 font-open-sans">Insight</h4>
              <p className="text-xs text-orange-900 font-bold leading-relaxed font-open-sans">
                Low late fee collection indicates weak enforcement. High reliance on cash/cheque payments causing administrative delays.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h4 className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest mb-1 font-open-sans">Benchmark</h4>
              <p className="text-xs text-blue-900 font-bold leading-relaxed font-open-sans">
                Best-performing schools collect {benchmarks.digitalAdoptionBenchmark}% of fees digitally. Late fee collections contribute 2-5% of total revenue.
              </p>
            </div>
          </div>
        </Card>

        {/* Installment Frequency by Occupation */}
        <Card className="bento-card border-none flex flex-col justify-between shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div>
            <h3 className="text-lg font-black text-[#1E293B] mb-2 font-roboto">Installment Frequency by Occupation</h3>
            <p className="text-xs font-bold text-[#64748B] mb-8 font-open-sans">Average number of installments paid per demographic</p>

            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defaulterAnalysis.occupationWise.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis dataKey="occupation" type="category" axisLine={false} tickLine={false} tick={{ fill: '#1E293B', fontSize: 11, fontWeight: 700 }} width={80} />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                    formatter={(value: number) => [`${value}`, 'Avg Installments']}
                  />
                  <Bar dataKey="avgInstallmentsPaid" radius={[0, 4, 4, 0]} barSize={16}>
                    {defaulterAnalysis.occupationWise.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#8B5CF6" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 font-open-sans">Insight</h4>
              <p className="text-xs text-orange-900 font-bold leading-relaxed font-open-sans">
                Specific occupations tend to pay in multiple smaller installments vs one-time lumpsums.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h4 className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest mb-1 font-open-sans">Benchmark</h4>
              <p className="text-xs text-blue-900 font-bold leading-relaxed font-open-sans">
                Customizing installment frequencies to occupation cash-cycles improves collection rates by up to 15%.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Fee Pay Masters */}
      <Card className="bento-card border-none shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-lg font-black text-[#1E293B] font-roboto">Fee Pay Masters by Occupation, Location & Demographics</h3>
            <p className="text-xs font-bold text-[#64748B] font-open-sans">Profiling our most reliable fee contributors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(feePayMasters || []).slice(0, 5)} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="occupation" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 800 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 800 }} tickFormatter={(v) => `₹${Math.round(v / 100000)}L`} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                  formatter={(value: number) => [`₹${(value / 100000).toFixed(1)}L`, 'Total Paid']}
                />
                <Bar dataKey="totalPaid" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4 mt-4 lg:mt-0 flex flex-col justify-center">
            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 font-open-sans">Insight</h4>
              <p className="text-sm text-emerald-900 font-bold leading-relaxed font-open-sans">
                Salaried professionals and high-income zones contribute to stable collections.
              </p>
            </div>
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
              <h4 className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest mb-1 font-open-sans">Benchmark</h4>
              <p className="text-sm text-blue-900 font-bold leading-relaxed font-open-sans">
                Best schools ensure {benchmarks.collectionRateBenchmark}% of fees come from reliable payers to maintain liquidity and forecasting accuracy.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
