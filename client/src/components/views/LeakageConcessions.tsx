import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { TrendingDown, AlertCircle, Gift, FileX, Users } from "lucide-react";
import { useDashboard, formatCurrency, formatPercentage } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";

export function LeakageConcessions() {
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-source-sans">
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-[400px] rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Error loading leakage analysis</p>
      </div>
    );
  }

  const { revenueWaterfall, classWiseAnalysis, concessionAnalysis, tcDropoutAnalysis, kpi, benchmarks } = dashboard;

  // Prepare waterfall data
  const waterfallData = [
    { name: 'Expected', value: Math.round(revenueWaterfall.expectedRevenue / 100000), fill: '#10B981' },
    { name: 'TC Loss', value: -Math.round(revenueWaterfall.tcLoss / 100000), fill: '#ef4444' },
    { name: 'Concession', value: -Math.round(revenueWaterfall.concessionLoss / 100000), fill: '#F59E0B' },
    { name: 'Pending', value: -Math.round(revenueWaterfall.pendingBalance / 100000), fill: '#3B82F6' },
    { name: 'Realized', value: Math.round(revenueWaterfall.realizedRevenue / 100000), fill: '#1E293B' },
  ];

  // Prepare class-wise radar data - show only top 8 classes for clarity
  const sortedClassWise = [...classWiseAnalysis].sort((a, b) => b.collectionRate - a.collectionRate);
  const radarData = sortedClassWise
    .slice(0, 8)
    .map(c => ({
      grade: c.className.split('-')[0].substring(0, 5),
      collection: Math.round(c.collectionRate),
    }));

  // Concession category distribution
  const concessionCategories = concessionAnalysis.byCategory.map((cat, idx) => ({
    name: cat.category,
    value: cat.studentCount,
    amount: cat.amount,
    color: ['#F59E0B', '#3B82F6', '#10B981', '#1E293B', '#ef4444'][idx % 5]
  }));

  // TC/Dropout by class
  const tcByClass = tcDropoutAnalysis.byClass.slice(0, 6).map(c => ({
    name: c.className.split('-')[0],
    tcCount: c.tcCount,
    loss: Math.round(c.revenueLoss / 100000),
    color: c.revenueLoss > 100000 ? '#ef4444' : '#F59E0B'
  }));

  // Total revenue lost
  const totalRevenueLost = revenueWaterfall.tcLoss + revenueWaterfall.concessionLoss + revenueWaterfall.pendingBalance;

  // Find lowest collection classes
  const lowestCollectionClasses = [...classWiseAnalysis]
    .sort((a, b) => a.collectionRate - b.collectionRate)
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-source-sans">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B] tracking-tight font-roboto">Leakage & Concessions</h2>
          <p className="text-sm font-semibold text-[#64748B] mt-1 font-open-sans">Identifying revenue erosion & operational friction.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-open-sans">Total Revenue Lost</p>
          <p className="text-xl font-black text-[#ef4444] flex items-center justify-end font-roboto">
            <TrendingDown className="h-4 w-4 mr-1" />
            {formatCurrency(totalRevenueLost, true)}
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <FileX className="h-5 w-5 text-[#ef4444]" />
            </div>
            <h3 className="text-sm font-black text-[#1E293B] font-roboto">TC/Dropout Loss</h3>
          </div>
          <div className="text-2xl font-black text-[#ef4444] mb-1 font-roboto">{formatCurrency(tcDropoutAnalysis.revenueLoss, true)}</div>
          <p className="text-[11px] font-bold text-slate-400 font-open-sans">{tcDropoutAnalysis.totalTcDropouts} students withdrawn</p>
        </Card>

        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Gift className="h-5 w-5 text-[#F59E0B]" />
            </div>
            <h3 className="text-sm font-black text-[#1E293B] font-roboto">Concession Given</h3>
          </div>
          <div className="text-2xl font-black text-[#F59E0B] mb-1 font-roboto">{formatCurrency(concessionAnalysis.totalConcessionGiven, true)}</div>
          <p className="text-[11px] font-bold text-slate-400 font-open-sans">{concessionAnalysis.studentsWithConcession} beneficiaries</p>
        </Card>

        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-[#3B82F6]" />
            </div>
            <h3 className="text-sm font-black text-[#1E293B] font-roboto">Retention Rate</h3>
          </div>
          <div className="text-2xl font-black text-[#3B82F6] mb-1 font-roboto">{formatPercentage(tcDropoutAnalysis.retentionRate)}</div>
          <p className="text-[11px] font-bold text-slate-400 font-open-sans">Target: {benchmarks.retentionRateBenchmark}%</p>
        </Card>

        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-[#1E293B]" />
            </div>
            <h3 className="text-sm font-black text-[#1E293B] font-roboto">Concession Defaulters</h3>
          </div>
          <div className="text-2xl font-black text-[#1E293B] mb-1 font-roboto">{formatPercentage(concessionAnalysis.concessionDefaulterRate)}</div>
          <p className="text-[11px] font-bold text-slate-400 font-open-sans">{concessionAnalysis.concessionDefaulters} students</p>
        </Card>
      </div>

      <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
        <h3 className="text-lg font-black text-[#1E293B] mb-8 font-roboto">Revenue Waterfall Analysis</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1E293B', fontSize: 11, fontWeight: 900 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 800 }} tickFormatter={(v) => `₹${Math.abs(v)}L`} />
              <Tooltip
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                formatter={(value: number) => [`₹${Math.abs(value)}L`, value < 0 ? 'Loss' : 'Revenue']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                {waterfallData.map((entry, index) => (
                  <Cell key={`${entry.name}-${entry.value}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <h3 className="text-lg font-black text-[#1E293B] mb-8 font-roboto">Class-wise Collection Performance</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={radarData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="grade" type="category" axisLine={false} tickLine={false} tick={{ fill: '#1E293B', fontSize: 11, fontWeight: 700 }} width={60} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                  formatter={(value: number) => [`${value}%`, 'Collection Rate']}
                />
                <Bar dataKey="collection" radius={[0, 4, 4, 0]} barSize={20}>
                  {radarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.collection < 50 ? '#ef4444' : entry.collection < 75 ? '#F59E0B' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 bg-[#FFFBEB] p-4 rounded-xl border border-amber-100 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-black text-amber-900 mb-2 font-open-sans">
                Critical Attention Areas
              </p>
              <p className="text-xs text-amber-900 font-bold font-open-sans">
                {lowestCollectionClasses.map(c => c.className.split('-')[0]).join(', ')} showing below-benchmark collection.
                Action: Implement strict TC clearance, increase parent engagement, consider fee payment plans.
              </p>
            </div>
          </div>
        </Card>

        <Card className="bento-card border-none flex flex-col justify-between" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div>
            <h3 className="text-lg font-black text-[#1E293B] mb-2 font-roboto">Payment Mode Split</h3>
            <p className="text-xs font-bold text-[#64748B] mb-10 font-open-sans">Digital vs. Traditional methods</p>

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
            </div>
          </div>

          <div className="mt-12 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="text-xs font-black text-[#3B82F6] uppercase tracking-widest mb-1 font-open-sans">Efficiency Target</h4>
            <p className="text-xs text-blue-900 font-bold leading-relaxed font-open-sans">
              Target {benchmarks.digitalAdoptionBenchmark}% digital adoption to reduce overhead.
              Current gap: {benchmarks.digitalAdoptionBenchmark - kpi.digitalAdoption}%.
            </p>
          </div>
        </Card>
      </div>

      {/* Concession Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <h3 className="text-lg font-black text-[#1E293B] mb-8 font-roboto">Concession by Category</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={concessionCategories}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {concessionCategories.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string, props: any) => [
                  `${value} students (${formatCurrency(props.payload.amount, true)})`,
                  props.payload.name
                ]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {concessionCategories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5 text-[10px] font-black text-[#64748B] font-open-sans">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                {cat.name}
              </div>
            ))}
          </div>
        </Card>

        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <h3 className="text-lg font-black text-[#1E293B] mb-8 font-roboto">TC Loss by Class</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tcByClass} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 800 }} tickFormatter={(v) => `₹${v}L`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#1E293B', fontSize: 11, fontWeight: 900 }} width={60} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                  formatter={(value: number, name: string, props: any) => [
                    `₹${value}L (${props.payload.tcCount} TCs)`,
                    'Revenue Loss'
                  ]}
                />
                <Bar dataKey="loss" radius={[0, 4, 4, 0]} barSize={20}>
                  {tcByClass.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
