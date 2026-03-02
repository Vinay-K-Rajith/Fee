import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Cell
} from "recharts";
import { TrendingDown, AlertCircle } from "lucide-react";

// Waterfall chart mock data
const waterfallData = [
  { name: 'Expected Total', value: 15800000, fill: 'var(--color-success)', isTotal: true },
  { name: 'Dropouts/TCs', value: -4500000, fill: 'var(--color-destructive)' },
  { name: 'Fee Concessions', value: -2800000, fill: '#f59e0b' },
  { name: 'Transport Defaults', value: -1200000, fill: '#f97316' },
  { name: 'Realized Revenue', value: 7300000, fill: 'var(--color-primary)', isTotal: true },
];

// Helper to format currency
const formatCurrency = (value: number) => {
  return `₹${Math.abs(value) / 100000}L`;
};

// Radar chart mock data
const radarData = [
  { grade: 'Grade 1', collection: 90, fullMark: 100 },
  { grade: 'Grade 2', collection: 88, fullMark: 100 },
  { grade: 'Grade 3', collection: 85, fullMark: 100 },
  { grade: 'Grade 4', collection: 82, fullMark: 100 },
  { grade: 'Grade 5', collection: 78, fullMark: 100 },
  { grade: 'Grade 6', collection: 65, fullMark: 100 }, // Weak spot
  { grade: 'Grade 7', collection: 70, fullMark: 100 },
  { grade: 'Grade 8', collection: 62, fullMark: 100 }, // Weak spot
  { grade: 'Grade 9', collection: 80, fullMark: 100 },
  { grade: 'Grade 10', collection: 85, fullMark: 100 },
  { grade: 'Grade 11', collection: 92, fullMark: 100 },
  { grade: 'Grade 12', collection: 95, fullMark: 100 },
];

export function LeakageConcessions() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-primary">Revenue Leakage & Operations Analysis</h2>
        <p className="text-muted-foreground mt-1">Identifying areas where money is slipping through the cracks.</p>
      </div>

      {/* Waterfall Chart */}
      <Card className="floating-card overflow-hidden border-0">
        <div className="p-6 pb-2 border-b border-border bg-white flex justify-between items-end">
          <div>
            <h3 className="text-lg font-bold text-primary">Revenue Waterfall Analysis</h3>
            <p className="text-sm text-muted-foreground">Tracking deductions from expected to realized revenue</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Revenue Lost</p>
            <p className="text-xl font-bold text-destructive flex items-center justify-end">
              <TrendingDown className="h-5 w-5 mr-1" />
              ₹85.0L
            </p>
          </div>
        </div>
        <CardContent className="p-6 bg-white">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={waterfallData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#0F172A', fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={formatCurrency}
                  tick={{ fill: '#64748B' }} 
                />
                <RechartsTooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#000" 
                  radius={[4, 4, 0, 0]}
                  barSize={60}
                >
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card className="floating-card overflow-hidden border-0">
          <div className="p-6 pb-2 border-b border-border bg-white">
            <h3 className="text-lg font-bold text-primary">Class-wise Collection Analysis</h3>
          </div>
          <CardContent className="p-6 bg-white">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="grade" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Collection %"
                    dataKey="collection"
                    stroke="var(--color-accent)"
                    fill="var(--color-accent)"
                    fillOpacity={0.4}
                  />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 bg-secondary p-4 rounded-lg flex items-start gap-3 border border-border/50">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-primary">Insight & Action</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Lower fee collection visually obvious in Grade 6 and Grade 8. Recommend implementing "No-TC Without Clearance" policy specifically targeted here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modes */}
        <Card className="floating-card overflow-hidden border-0 flex flex-col">
          <div className="p-6 pb-2 border-b border-border bg-white">
            <h3 className="text-lg font-bold text-primary">Payment Mode Split</h3>
            <p className="text-sm text-muted-foreground">Digital vs Traditional payment methods</p>
          </div>
          <CardContent className="p-6 bg-white flex-1 flex flex-col justify-center space-y-8">
            
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="font-semibold text-primary flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  Digital Payments (UPI/Cards)
                </span>
                <span className="font-bold text-xl text-primary">34%</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: '34%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="font-semibold text-slate-600 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                  Cash / Cheque
                </span>
                <span className="font-bold text-xl text-slate-600">66%</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: '66%' }}></div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100">
              <div className="flex items-center gap-4 bg-accent/5 p-4 rounded-xl border border-accent/20">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <span className="font-bold text-accent text-lg">Goal</span>
                </div>
                <div>
                  <h4 className="font-semibold text-primary">Benchmark Target: 75% Digital</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Push digital payments to reduce administrative delays and high reliance on manual processing.
                  </p>
                </div>
              </div>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
