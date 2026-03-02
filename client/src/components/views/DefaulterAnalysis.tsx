import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { AlertTriangle, TrendingDown, Users, Clock } from "lucide-react";

const heatmapData = [
  { day: 'Mon', count: 45 },
  { day: 'Tue', count: 52 },
  { day: 'Wed', count: 38 },
  { day: 'Thu', count: 65 },
  { day: 'Fri', count: 48 },
  { day: 'Sat', count: 20 },
  { day: 'Sun', count: 15 },
];

const gradeWiseData = [
  { grade: 'Grade 10', value: 85, color: '#F59E0B' },
  { grade: 'Grade 9', value: 72, color: '#3B82F6' },
  { grade: 'Grade 8', value: 64, color: '#1E293B' },
  { grade: 'Grade 7', value: 58, color: '#10B981' },
];

export function DefaulterAnalysis() {
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
          <div className="text-3xl font-black text-[#1E293B] mb-1 font-roboto">124</div>
          <p className="text-[11px] font-bold text-slate-400 font-open-sans">Students with {'>'} 3 months pending</p>
          <div className="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#F59E0B] w-[65%] transition-all duration-1000"></div>
          </div>
        </Card>

        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 text-[#3B82F6]" />
            </div>
            <h3 className="text-sm font-black text-[#1E293B] font-roboto">Avg. Delay Days</h3>
          </div>
          <div className="text-3xl font-black text-[#1E293B] mb-1 font-roboto">22 Days</div>
          <p className="text-[11px] font-bold text-slate-400 font-open-sans">↑ 4 days from last month</p>
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
            <h3 className="text-sm font-black text-[#1E293B] font-roboto">Repeated Offenders</h3>
          </div>
          <div className="text-3xl font-black text-[#1E293B] mb-1 font-roboto">42%</div>
          <p className="text-[11px] font-bold text-slate-400 font-open-sans">Behavioral pattern identified</p>
          <div className="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#1E293B] w-[42%] transition-all duration-1000"></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-[#1E293B] font-roboto">Defaulter Heatmap</h3>
              <p className="text-xs font-bold text-[#64748B] font-open-sans">Peak delinquency days</p>
            </div>
            <div className="pill-legend font-open-sans">Weekly Cycle</div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatmapData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11, fontWeight: 800}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11, fontWeight: 800}} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {heatmapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.count > 50 ? '#F59E0B' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bento-card border-none" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-[#1E293B] font-roboto">Grade-wise Delinquency</h3>
              <p className="text-xs font-bold text-[#64748B] font-open-sans">Risk distribution by level</p>
            </div>
            <div className="pill-legend font-open-sans">Academic Split</div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeWiseData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" hide />
                <YAxis dataKey="grade" type="category" axisLine={false} tickLine={false} tick={{fill: '#1E293B', fontSize: 11, fontWeight: 900}} width={80} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {gradeWiseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
