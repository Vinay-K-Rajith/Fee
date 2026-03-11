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
  Area
} from "recharts";
import { Wallet, AlertCircle, FileText, Smartphone } from "lucide-react";
import { useDashboard, formatCurrency, formatPercentage } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";

export function ExecutiveOverview() {
  const { data: dashboard, isLoading, error } = useDashboard();

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
                    cursor={{fill: '#F8FAFC'}}
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
                   <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: t.color}}></div>
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

      {/* Bottom Tier: Location Risk Assessment */}
      <Card className="bento-card border-none shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-lg font-black text-[#1E293B] font-roboto">Geographic Risk Heatmap</h3>
            <p className="text-xs font-bold text-[#64748B] font-open-sans">Location-wise defaulter concentration for targeted intervention</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-6 gap-3">
              {locations.map((loc) => {
                const getRiskColor = (rate: number): string => {
                  if (rate > 20) return 'bg-[#ef4444]';
                  if (rate > 15) return 'bg-[#F59E0B]';
                  return 'bg-[#10B981]';
                };
                const riskColor = getRiskColor(loc.defaulterRate);
                return (
                  <div 
                    key={loc.location} 
                    className={`aspect-square rounded-full transition-all hover:scale-125 cursor-help shadow-md ${riskColor}`}
                    title={`${loc.location}: ${Math.round(loc.defaulterRate)}% default rate (${loc.defaulterCount} students)`}
                  ></div>
                );
              })}
            </div>
            <div className="flex justify-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
                <span className="text-xs font-bold text-[#1E293B] font-open-sans">&gt;20% (Critical)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#F59E0B]"></div>
                <span className="text-xs font-bold text-[#1E293B] font-open-sans">15-20% (High)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#10B981]"></div>
                <span className="text-xs font-bold text-[#1E293B] font-open-sans">&lt;15% (Good)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-xl border border-red-100">
              <p className="text-[10px] font-black text-[#F59E0B] uppercase tracking-widest mb-2 font-open-sans">Risk Summary</p>
              <p className="text-sm font-black text-[#1E293B] mb-1 font-roboto">
                {locations.filter(l => l.defaulterRate > 15).length} of {locations.length} areas
              </p>
              <p className="text-xs font-bold text-[#64748B] leading-relaxed font-open-sans">
                Areas with elevated default rates. Implement targeted fee recovery campaigns and parent engagement programs.
              </p>
            </div>
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
              <p className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest mb-2 font-open-sans">Action</p>
              <ul className="text-xs font-bold text-[#1E293B] space-y-1 font-open-sans">
                <li>→ Prioritize high-risk zones</li>
                <li>→ Increase collection frequency</li>
                <li>→ Community engagement drive</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
