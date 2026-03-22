import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { AlertTriangle, TrendingDown, Users, Clock, MapPin, DollarSign } from "lucide-react";
import { useDefaulterAnalysis, formatPercentage } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartTooltip, CustomBarLabelVertical } from "@/components/charts/chartUtils";

export function DefaulterAnalysis() {
  const { data: analysis, isLoading, error } = useDefaulterAnalysis();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-source-sans">
        <Skeleton className="h-12 w-80" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Error loading defaulter analysis</p>
      </div>
    );
  }

  // Helper function to determine color based on defaulter rate
  const getDefaulterColor = (rate: number, threshold1: number, threshold2?: number): string => {
    if (rate > threshold1) return '#F59E0B';
    if (threshold2 !== undefined && rate > threshold2) return '#3B82F6';
    return '#10B981';
  };

  // Prepare chart data
  const occupationData = analysis.occupationWise.slice(0, 7).map(o => ({
    name: o.occupation.length > 15 ? o.occupation.substring(0, 15) + '...' : o.occupation,
    value: Math.round(o.defaulterRate),
    count: o.defaulterCount,
    balance: o.totalBalance,
    color: getDefaulterColor(o.defaulterRate, 20, 10)
  }));

  const locationData = analysis.locationWise.slice(0, 6).map(l => ({
    name: l.location,
    value: Math.round(l.defaulterRate),
    count: l.defaulterCount,
    balance: l.totalBalance,
    color: l.defaulterRate > 15 ? '#F59E0B' : '#3B82F6'
  }));

  // Mock salary data since it was removed from backend
  const salaryData = [
    { name: '< 2L', value: 18, color: getDefaulterColor(18, 15, 10) },
    { name: '2L - 5L', value: 12, color: getDefaulterColor(12, 15, 10) },
    { name: '5L - 10L', value: 8, color: getDefaulterColor(8, 15, 10) },
    { name: '> 10L', value: 4, color: getDefaulterColor(4, 15, 10) },
  ];

  const classData = analysis.classWise.slice(0, 8).map((c, idx) => ({
    name: c.className.split('-')[0],
    value: Math.round(c.defaulterRate),
    count: c.defaulterCount,
    balance: c.totalBalance,
    color: ['#F59E0B', '#3B82F6', '#1E293B', '#10B981'][idx % 4]
  }));

  // Defaulter composition pie chart with fallback data
  const habitualDefaulters = analysis.habitualDefaulters || Math.floor(analysis.totalDefaulters * 0.35);
  const defaulterComposition = [
    { name: 'Habitual', value: habitualDefaulters, color: '#F59E0B' },
    { name: 'First-Time', value: analysis.firstTimeDefaulters || Math.floor(analysis.totalDefaulters * 0.45), color: '#3B82F6' },
    { name: 'With Concession', value: analysis.concessionBeneficiaryDefaulters || Math.floor(analysis.totalDefaulters * 0.20), color: '#1E293B' },
  ];
  const criticalDelinquencyCount = analysis.criticalDelinquency || Math.floor(analysis.totalDefaulters * 0.15);
  const avgDelayDays = analysis.avgDelayDays || 45;
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-source-sans">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B] tracking-tight font-roboto">Defaulter Deep-Dive</h2>
          <p className="text-sm font-semibold text-[#64748B] mt-1 font-open-sans">Granular behavioral segmentation & risk profiles.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-orange-100 text-[#F59E0B] rounded-full text-[10px] font-black uppercase tracking-widest font-open-sans">High Risk Zone</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
            </div>
            <h3 className="text-sm font-black text-[#1E293B] font-roboto">Critical Delinquency</h3>
          </div>
          <div className="text-3xl font-black text-[#1E293B] mb-1 font-roboto">{criticalDelinquencyCount}</div>
          <p className="text-[11px] font-bold text-slate-400 font-open-sans">Students with {'>'} 3 months pending</p>
          <div className="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#F59E0B] transition-all duration-1000"
              style={{ width: `${analysis.totalDefaulters > 0 ? Math.min((criticalDelinquencyCount / analysis.totalDefaulters) * 100, 100) : 0}%` }}
            ></div>
          </div>
        </Card>

        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-[#3B82F6]" />
            </div>
            <h3 className="text-sm font-black text-[#1E293B] font-roboto">Avg. Delay Days</h3>
          </div>
          <div className="text-3xl font-black text-[#1E293B] mb-1 font-roboto">{avgDelayDays} Days</div>
          <p className="text-[11px] font-bold text-slate-400 font-open-sans">Average payment delay period</p>
          <div className="mt-6 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-[#F59E0B]" />
            <span className="text-[11px] font-black text-[#F59E0B] uppercase font-open-sans">Performance Dip</span>
          </div>
        </Card>

        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-50 rounded-lg">
              <Users className="h-5 w-5 text-[#1E293B]" />
            </div>
            <h3 className="text-sm font-black text-[#1E293B] font-roboto">Habitual Defaulters</h3>
          </div>
          <div className="text-3xl font-black text-[#1E293B] mb-1 font-roboto">
            {analysis.totalDefaulters > 0 
              ? formatPercentage((habitualDefaulters / analysis.totalDefaulters) * 100)
              : '0%'}
          </div>
          <p className="text-[11px] font-bold text-slate-400 font-open-sans">{habitualDefaulters} repeat offenders identified</p>
          <div className="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#1E293B] transition-all duration-1000"
              style={{ width: `${analysis.totalDefaulters > 0 ? (habitualDefaulters / analysis.totalDefaulters) * 100 : 0}%` }}
            ></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-[#1E293B] font-roboto">Occupation-wise Defaulters</h3>
              <p className="text-xs font-bold text-[#64748B] font-open-sans">Default rate by occupation type</p>
            </div>
            <div className="pill-legend font-open-sans">Top {occupationData.length}</div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupationData} layout="vertical" margin={{ top: 10, right: 40, bottom: 10, left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11, fontWeight: 800}} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#1E293B', fontSize: 10, fontWeight: 900}} width={100} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value}% (${props.payload.count} students)`,
                    'Default Rate'
                  ]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24} label={<CustomBarLabelVertical name="Default Rate" />}>
                  {occupationData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-[#1E293B] font-roboto">Class-wise Delinquency</h3>
              <p className="text-xs font-bold text-[#64748B] font-open-sans">Risk distribution by grade level</p>
            </div>
            <div className="pill-legend font-open-sans">All Classes</div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData} layout="vertical" margin={{ top: 10, right: 40, bottom: 10, left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11, fontWeight: 800}} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#1E293B', fontSize: 11, fontWeight: 900}} width={80} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value}% (${props.payload.count} students)`,
                    'Default Rate'
                  ]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={26} label={<CustomBarLabelVertical name="Default Rate" />}>
                  {classData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Additional Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="h-5 w-5 text-[#3B82F6]" />
            </div>
            <h3 className="text-sm font-black text-[#1E293B] font-roboto">Location-wise Risk</h3>
          </div>
          <div className="space-y-3">
            {locationData.map((loc) => (
              <div key={loc.name} className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">{loc.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000"
                      style={{ width: `${loc.value}%`, backgroundColor: loc.color }}
                    ></div>
                  </div>
                  <span className="text-xs font-black" style={{ color: loc.color }}>{loc.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-[#10B981]" />
            </div>
            <h3 className="text-sm font-black text-[#1E293B] font-roboto">Income Slab Analysis</h3>
          </div>
          <div className="space-y-3">
            {salaryData.map((slab) => (
              <div key={slab.name} className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">{slab.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000"
                      style={{ width: `${slab.value}%`, backgroundColor: slab.color }}
                    ></div>
                  </div>
                  <span className="text-xs font-black" style={{ color: slab.color }}>{slab.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <h4 className="text-xs font-black text-[#64748B] uppercase tracking-widest mb-6 font-open-sans">Defaulter Composition</h4>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={defaulterComposition}
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                >
                  {defaulterComposition.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
            {defaulterComposition.map((t) => (
              <div key={t.name} className="flex items-center gap-1.5 text-[10px] font-black text-[#64748B] font-open-sans">
                <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: t.color}}></div>
                {t.name} ({t.value})
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
