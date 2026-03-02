import { Card } from "@/components/ui/card";
import { 
  BarChart,
  Bar, 
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

const masterData = [
  { month: "Apr", collected: 85, loss: 12 },
  { month: "May", collected: 82, loss: 15 },
  { month: "Jun", collected: 78, loss: 18 },
  { month: "Jul", collected: 75, loss: 25 },
  { month: "Aug", collected: 70, loss: 40 },
  { month: "Sep", collected: 65, loss: 45 },
  { month: "Oct", collected: 68, loss: 35 },
  { month: "Nov", collected: 60, loss: 50 },
];

const sparklinePositive = [
  { v: 40 }, { v: 42 }, { v: 45 }, { v: 43 }, { v: 48 }, { v: 52 }, { v: 55 }
];

const sparklineNegative = [
  { v: 60 }, { v: 58 }, { v: 55 }, { v: 52 }, { v: 54 }, { v: 50 }, { v: 45 }
];

const defaulterTypes = [
  { name: 'Habitual Defaulters', value: 45, color: '#F59E0B' },
  { name: 'First-Time Late', value: 35, color: '#3B82F6' },
  { name: 'Concession Beneficiaries', value: 20, color: '#1E293B' }
];

const demographicData = [
  { occupation: "Business Owners", value: 65, highlight: true },
  { occupation: "Daily Wage", value: 45, highlight: false },
  { occupation: "Salaried", value: 25, highlight: false },
];

const concessionHistory = [
  { year: '2020', standard: 400, unplanned: 100 },
  { year: '2021', standard: 450, unplanned: 150 },
  { year: '2022', standard: 380, unplanned: 250 },
  { year: '2023', standard: 420, unplanned: 300 },
  { year: '2024', standard: 440, unplanned: 420 },
];

export function ExecutiveOverview() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-source-sans">
      <div>
        <h2 className="text-2xl font-black text-[#1E293B] tracking-tight font-roboto">Financial Vital Signs</h2>
        <p className="text-sm font-bold text-[#64748B] mt-1 font-open-sans">Real-time performance analytics engine.</p>
      </div>

      {/* Top Tier: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Fee Collection", value: "₹12.4Cr", trend: "↑ 2% Above Benchmark", color: "text-[#10B981]", bgColor: "bg-emerald-50", iconColor: "text-emerald-600", icon: Wallet, spark: sparklinePositive, sparkColor: "#10B981" },
          { label: "Active Defaulter Rate", value: "14.2%", trend: "Target: <10%", color: "text-[#F59E0B]", bgColor: "bg-orange-50", iconColor: "text-orange-600", icon: AlertCircle, spark: sparklineNegative, sparkColor: "#F59E0B" },
          { label: "Revenue Lost (TCs)", value: "₹45.2L", trend: "12% Increase YoY", color: "text-[#F59E0B]", bgColor: "bg-orange-50", iconColor: "text-orange-600", icon: FileText, spark: sparklineNegative, sparkColor: "#F59E0B" },
          { label: "Digital Adoption", value: "34%", trend: "↑ 5% this month", color: "text-[#3B82F6]", bgColor: "bg-blue-50", iconColor: "text-blue-600", icon: Smartphone, spark: sparklinePositive, sparkColor: "#10B981" },
        ].map((card, i) => (
          <Card key={i} className="bento-card relative overflow-hidden group flex flex-col justify-between border-none shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
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

      {/* Middle Tier: Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bento-card h-full border-none shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="text-lg font-black text-[#1E293B] font-roboto">Master Collection vs. Leakage</h3>
                <p className="text-xs font-bold text-[#64748B] font-open-sans">Monthly trajectory analysis</p>
              </div>
              <div className="flex gap-2">
                <div className="pill-legend font-open-sans"><div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></div> Collected</div>
                <div className="pill-legend font-open-sans"><div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div> Loss</div>
              </div>
            </div>
            
            <div className="h-[380px] w-full relative">
              <div className="absolute top-2 right-2 z-10 bg-[#EFF6FF] border border-blue-100 p-4 rounded-xl max-w-[220px] shadow-sm animate-in fade-in zoom-in duration-700">
                <p className="text-[10px] font-black text-[#3B82F6] uppercase tracking-widest mb-1 font-open-sans">Insight Box</p>
                <p className="text-xs text-[#1E293B] font-bold leading-relaxed font-open-sans">
                  Default spikes align with Q2 seasonal burdens. Action: Trigger early incentive discounts in Q1.
                </p>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={masterData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 800 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 800 }} />
                  <Tooltip 
                    cursor={{fill: '#F8FAFC'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                  />
                  <Bar dataKey="collected" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
                  <Line type="monotone" dataKey="loss" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bento-card h-[250px] border-none shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
            <h4 className="text-xs font-black text-[#64748B] uppercase tracking-widest mb-6 font-open-sans">Habitual Defaulters</h4>
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
                    {defaulterTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
               {defaulterTypes.map((t, i) => (
                 <div key={i} className="flex items-center gap-1.5 text-[10px] font-black text-[#64748B] font-open-sans">
                   <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: t.color}}></div>
                   {t.name.split(' ')[0]}
                 </div>
               ))}
            </div>
          </Card>

          <Card className="bento-card h-[250px] border-none shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
            <h4 className="text-xs font-black text-[#64748B] uppercase tracking-widest mb-6 font-open-sans">Top Demographics</h4>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographicData} layout="vertical" margin={{ left: -10, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="occupation" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#334155'}} width={90} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={10}>
                    {demographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.highlight ? '#F59E0B' : '#334155'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 text-center font-black font-open-sans">Business segment requires immediate attention.</p>
          </Card>
        </div>
      </div>

      {/* Bottom Tier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
        <Card className="bento-card md:col-span-2 border-none shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-[#1E293B] font-roboto">The Concession Tracker</h3>
              <div className="flex gap-2">
                <div className="pill-legend font-open-sans"><div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></div> Standard</div>
                <div className="pill-legend font-open-sans"><div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div> Unplanned</div>
              </div>
           </div>
           <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={concessionHistory} margin={{ left: -20 }}>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11, fontWeight: 800}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                  <Area type="monotone" dataKey="standard" stroke="#3B82F6" strokeWidth={2} fill="#3B82F6" fillOpacity={0.05} />
                  <Area type="monotone" dataKey="unplanned" stroke="#F59E0B" strokeWidth={2} fill="#F59E0B" fillOpacity={0.05} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </Card>

        <Card className="bento-card border-none shadow-md" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-widest mb-6 font-roboto">Location Risk Zones</h3>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({length: 25}).map((_, i) => (
              <div 
                key={i} 
                className={`aspect-square rounded-full transition-all hover:scale-125 cursor-help ${
                  i % 7 === 0 ? 'bg-[#F59E0B] shadow-lg shadow-orange-100' : 'bg-[#10B981] shadow-lg shadow-emerald-50'
                }`}
              ></div>
            ))}
          </div>
          <div className="mt-10 space-y-4">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider font-open-sans">
              <span className="text-slate-500">Risk Exposure</span>
              <span className="text-[#F59E0B]">Medium High</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-[#F59E0B] w-[42%] transition-all duration-1000"></div>
            </div>
            <p className="text-[10px] text-slate-400 font-black leading-relaxed font-open-sans">
              Geometric dot-density identifies localized financial clusters for targeted logistics planning.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
