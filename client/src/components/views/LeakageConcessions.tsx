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
  Cell
} from "recharts";
import { TrendingDown, AlertCircle } from "lucide-react";

const waterfallData = [
  { name: 'Expected', value: 158, fill: '#10B981' },
  { name: 'TC Loss', value: -45, fill: '#ef4444' },
  { name: 'Concession', value: -28, fill: '#F59E0B' },
  { name: 'Transport', value: -12, fill: '#F59E0B' },
  { name: 'Realized', value: 73, fill: '#1E293B' },
];

const radarData = [
  { grade: 'G1', collection: 90 },
  { grade: 'G2', collection: 88 },
  { grade: 'G3', collection: 85 },
  { grade: 'G4', collection: 82 },
  { grade: 'G5', collection: 78 },
  { grade: 'G6', collection: 65 },
  { grade: 'G7', collection: 70 },
  { grade: 'G8', collection: 62 },
  { grade: 'G9', collection: 80 },
  { grade: 'G10', collection: 85 },
];

export function LeakageConcessions() {
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
            ₹85.0L
          </p>
        </div>
      </div>

      <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
        <h3 className="text-lg font-black text-[#1E293B] mb-8 font-roboto">Revenue Waterfall Analysis</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#1E293B', fontSize: 11, fontWeight: 900}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11, fontWeight: 800}} tickFormatter={(v) => `₹${v}L`} />
              <Tooltip 
                cursor={{fill: '#F8FAFC'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <h3 className="text-lg font-black text-[#1E293B] mb-8 font-roboto">Class-wise Collection Radar</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="grade" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 900 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Collection %"
                  dataKey="collection"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 bg-[#FFFBEB] p-4 rounded-xl border border-amber-100 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-900 font-bold leading-relaxed font-open-sans">
              Critical collection dips identified in Grades 6 and 8. Recommended action: Implement strict TC clearance protocols.
            </p>
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
                  <span className="text-xl font-black text-[#10B981] font-roboto">34%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] w-[34%] transition-all duration-1000"></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-[#1E293B] uppercase tracking-wider font-open-sans">Cash / Cheque</span>
                  <span className="text-xl font-black text-slate-400 font-roboto">66%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 w-[66%] transition-all duration-1000"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="text-xs font-black text-[#3B82F6] uppercase tracking-widest mb-1 font-open-sans">Efficiency Target</h4>
            <p className="text-xs text-blue-900 font-bold leading-relaxed font-open-sans">
              Target 75% digital adoption to reduce overhead. Trigger incentivized digital payment campaigns in Q3.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
