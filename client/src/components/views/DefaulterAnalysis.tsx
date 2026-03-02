import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { AlertCircle } from "lucide-react";

// Heatmap mock data
const heatmapData = [
  { zone: "North Zone", Apr: 12, May: 15, Jun: 18, Jul: 25, Aug: 40, Sep: 45 },
  { zone: "South Zone", Apr: 8, May: 10, Jun: 12, Jul: 15, Aug: 20, Sep: 22 },
  { zone: "East Zone", Apr: 20, May: 25, Jun: 30, Jul: 45, Aug: 60, Sep: 65 },
  { zone: "West Zone", Apr: 5, May: 8, Jun: 10, Jul: 12, Aug: 15, Sep: 18 },
  { zone: "Central", Apr: 2, May: 4, Jun: 5, Jul: 8, Aug: 10, Sep: 12 },
];

const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

// Concession overlap data
const concessionData = [
  { name: 'Standard Defaulters', value: 310 },
  { name: 'Concession Beneficiary Defaulters', value: 118 }
];

const COLORS = ['var(--color-primary)', 'var(--color-accent)'];

// Demographic data
const demographicData = [
  { occupation: "Salaried", "< 5 LPA": 10, "5-10 LPA": 15, "10-20 LPA": 5, "> 20 LPA": 2 },
  { occupation: "Business Owner", "< 5 LPA": 40, "5-10 LPA": 35, "10-20 LPA": 25, "> 20 LPA": 15 },
  { occupation: "Daily Wage", "< 5 LPA": 85, "5-10 LPA": 10, "10-20 LPA": 0, "> 20 LPA": 0 },
];

// Helper for heatmap colors based on value
const getHeatmapColor = (value: number) => {
  if (value < 10) return "bg-accent/10 text-accent-foreground/60";
  if (value < 20) return "bg-accent/30 text-primary";
  if (value < 40) return "bg-accent/60 text-primary";
  if (value < 60) return "bg-primary/80 text-white";
  return "bg-primary text-white";
};

export function DefaulterAnalysis() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-primary">Defaulter Deep-Dive & Demographics</h2>
        <p className="text-muted-foreground mt-1">Analyzing the complex behavioral data behind non-payments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <Card className="floating-card lg:col-span-2 overflow-hidden border-0">
          <div className="p-6 pb-4 border-b border-border bg-white">
            <h3 className="text-lg font-bold text-primary">Defaulter Heatmap (Month & Location)</h3>
            <p className="text-sm text-muted-foreground">Identifying seasonal financial burdens in specific areas</p>
          </div>
          <CardContent className="p-6 bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left font-semibold text-slate-500 p-3 bg-slate-50 rounded-tl-lg">Zone / Location</th>
                  {months.map(month => (
                    <th key={month} className="font-semibold text-slate-500 p-3 bg-slate-50">{month}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row, i) => (
                  <tr key={row.zone} className="border-t border-slate-100">
                    <td className="p-3 font-medium text-primary">{row.zone}</td>
                    {months.map(month => {
                      const val = row[month as keyof typeof row] as number;
                      return (
                        <td key={`${row.zone}-${month}`} className="p-1">
                          <div className={`w-full h-10 flex items-center justify-center rounded-md font-medium transition-all hover:scale-105 cursor-pointer ${getHeatmapColor(val)}`}>
                            {val}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
              <span className="font-medium">Legend:</span>
              <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-accent/10"></div> Low</div>
              <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-accent/40"></div> Medium</div>
              <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-primary/80"></div> High</div>
              <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-primary"></div> Critical</div>
            </div>
            
            <div className="mt-4 bg-secondary p-4 rounded-lg flex items-start gap-3 border border-border/50">
              <AlertCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-primary">Insight</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  East Zone shows consistent high default rates peaking in Q2. Recommend targeted outreach campaigns for this specific location.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doughnut Chart */}
        <Card className="floating-card overflow-hidden border-0 flex flex-col">
          <div className="p-6 pb-2 border-b border-border bg-white">
            <h3 className="text-lg font-bold text-primary">Concession vs. Defaulter Overlap</h3>
          </div>
          <CardContent className="p-6 bg-white flex-1 flex flex-col justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={concessionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {concessionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-medium text-slate-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-auto text-center mt-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">27%</span> of defaulters are already receiving financial concessions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographic Chart */}
      <Card className="floating-card overflow-hidden border-0">
        <div className="p-6 pb-2 border-b border-border bg-white">
          <h3 className="text-lg font-bold text-primary">Demographic Breakdown (Occupation & Income)</h3>
          <p className="text-sm text-muted-foreground">Number of defaulters segmented by parent occupation and income slab</p>
        </div>
        <CardContent className="p-6 bg-white flex flex-col md:flex-row gap-6 items-center">
          <div className="h-[350px] w-full md:w-2/3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={demographicData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="occupation" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <RechartsTooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="< 5 LPA" stackId="a" fill="#0F172A" radius={[0, 0, 4, 4]} />
                <Bar dataKey="5-10 LPA" stackId="a" fill="#1E293B" />
                <Bar dataKey="10-20 LPA" stackId="a" fill="#2DD4BF" />
                <Bar dataKey="> 20 LPA" stackId="a" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full md:w-1/3 bg-secondary p-6 rounded-xl border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-6 w-6 text-primary" />
              <h4 className="text-base font-semibold text-primary">Strategic Insight</h4>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">
              Salaried professionals yield highly stable collections regardless of income bracket.
            </p>
            <p className="text-slate-700 leading-relaxed font-medium">
              Action: <span className="font-normal">Focus heavy automated reminders and follow-ups specifically on Business Owners and Daily Wage segments.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
