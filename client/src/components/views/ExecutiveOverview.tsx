import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Users, Wallet, FileText, Smartphone } from "lucide-react";

const masterData = [
  { month: "Apr", collected: 85, loss: 12, benchmark: 80 },
  { month: "May", collected: 82, loss: 15, benchmark: 78 },
  { month: "Jun", collected: 78, loss: 18, benchmark: 75 },
  { month: "Jul", collected: 75, loss: 25, benchmark: 72 },
  { month: "Aug", collected: 70, loss: 40, benchmark: 68 },
  { month: "Sep", collected: 65, loss: 45, benchmark: 65 },
  { month: "Oct", collected: 68, loss: 35, benchmark: 70 },
  { month: "Nov", collected: 60, loss: 50, benchmark: 68 },
];

const defaulterTypes = [
  { name: 'Habitual Defaulters', value: 45, color: 'var(--color-warning)' },
  { name: 'First-Time Late', value: 35, color: '#93C5FD' }, // Light blue
  { name: 'Concession Beneficiaries', value: 20, color: 'var(--color-primary)' }
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Financial Vital Signs</h2>
          <p className="text-muted-foreground mt-1">Advanced real-time performance tracking.</p>
        </div>
      </div>

      {/* Top Tier: Smart Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Fee Collection", value: "₹12.4Cr", sub: "↑ 2% Above Benchmark", color: "text-success", icon: Wallet },
          { label: "Active Defaulter Rate", value: "14.2%", sub: "Target: <10%", color: "text-warning", icon: AlertCircle },
          { label: "Revenue Lost (TCs)", value: "₹45.2L", sub: "12% Increase YoY", color: "text-warning", icon: FileText },
          { label: "Digital Adoption", value: "34%", sub: "↑ 5% this month", color: "text-info-foreground", icon: Smartphone },
        ].map((card, i) => (
          <Card key={i} className="bento-card overflow-hidden relative border-none ring-1 ring-slate-100">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <card.icon className={`h-5 w-5 ${card.color.replace('text-', 'text-opacity-80 text-')}`} />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-1">{card.value}</h3>
              <p className={`text-xs font-semibold ${card.color}`}>{card.sub}</p>
            </div>
            {/* Minimalist Sparkline Placeholder */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 to-transparent opacity-50"></div>
          </Card>
        ))}
      </div>

      {/* Middle Tier: Asymmetrical Bento Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Master Chart - 2/3 Width */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bento-card border-none ring-1 ring-slate-100">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-bold text-primary">Master Collection vs. Leakage</h3>
                <p className="text-sm text-muted-foreground">Comprehensive academic year trajectory</p>
              </div>
              <div className="flex gap-3">
                <div className="pill-legend"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Collected</div>
                <div className="pill-legend"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Loss</div>
              </div>
            </div>
            
            <div className="h-[400px] w-full relative">
              <div className="absolute top-0 right-0 z-20 bg-amber-50 border border-amber-100 p-3 rounded-lg max-w-[200px] shadow-sm">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Insight</p>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  Default spikes align with Q2 seasonal burdens. Action: Trigger early incentive discounts in Q1.
                </p>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={masterData} margin={{ top: 20, right: 0, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="collected" fill="#93C5FD" radius={[6, 6, 0, 0]} barSize={40} />
                  <Line type="monotone" dataKey="loss" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Side - 1/3 Width */}
        <div className="space-y-6">
          <Card className="bento-card border-none ring-1 ring-slate-100 h-[240px]">
            <h4 className="text-sm font-bold text-primary mb-4">Habitual Defaulter Analysis</h4>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={defaulterTypes}
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={8}
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
            <div className="flex justify-center gap-4 mt-2">
               {defaulterTypes.map((t, i) => (
                 <div key={i} className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                   <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: t.color}}></div>
                   {t.name.split(' ')[0]}
                 </div>
               ))}
            </div>
          </Card>

          <Card className="bento-card border-none ring-1 ring-slate-100 h-[240px]">
            <h4 className="text-sm font-bold text-primary mb-4">Top Defaulter Demographics</h4>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographicData} layout="vertical" margin={{ left: -20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="occupation" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600}} width={100} />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 4, 4, 0]} 
                    barSize={12}
                  >
                    {demographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.highlight ? 'var(--color-warning)' : 'var(--color-primary)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center italic">Highlighted segments require targeted outreach.</p>
          </Card>
        </div>
      </div>

      {/* Bottom Tier: Deep-Dive Multiples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bento-card border-none ring-1 ring-slate-100 col-span-1 md:col-span-2">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-primary">The Concession Tracker</h3>
              <div className="flex gap-3">
                <div className="pill-legend"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Standard</div>
                <div className="pill-legend"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Unplanned</div>
              </div>
           </div>
           <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={concessionHistory}>
                  <defs>
                    <linearGradient id="colorStd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#93C5FD" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUnp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="standard" stroke="#93C5FD" fillOpacity={1} fill="url(#colorStd)" />
                  <Area type="monotone" dataKey="unplanned" stroke="#f97316" fillOpacity={1} fill="url(#colorUnp)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </Card>

        <Card className="bento-card border-none ring-1 ring-slate-100">
          <h3 className="text-lg font-bold text-primary mb-4">Location Risk Zones</h3>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({length: 25}).map((_, i) => (
              <div 
                key={i} 
                className={`aspect-square rounded-full transition-transform hover:scale-125 cursor-help ${
                  i % 7 === 0 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-emerald-500'
                }`}
                title={i % 7 === 0 ? "Pending Dues" : "Cleared"}
              ></div>
            ))}
          </div>
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Risk Exposure</span>
              <span className="text-orange-500 font-bold">Medium</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-orange-500 w-[40%]"></div>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">Neighborhood grids highlight clusters of pending dues for immediate logistic planning.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
