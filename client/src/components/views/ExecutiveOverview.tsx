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
  ComposedChart
} from "recharts";
import { TrendingUp, AlertCircle, ArrowDownRight, ArrowUpRight } from "lucide-react";

const collectionData = [
  { month: "Apr", actual: 85, benchmark: 90, amount: 1250000 },
  { month: "May", actual: 82, benchmark: 88, amount: 1150000 },
  { month: "Jun", actual: 78, benchmark: 85, amount: 950000 },
  { month: "Jul", actual: 75, benchmark: 82, amount: 850000 },
  { month: "Aug", actual: 70, benchmark: 80, amount: 750000 },
  { month: "Sep", actual: 65, benchmark: 75, amount: 650000 },
  { month: "Oct", actual: 68, benchmark: 78, amount: 700000 },
  { month: "Nov", actual: 60, benchmark: 75, amount: 550000 },
];

export function ExecutiveOverview() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-primary">Executive Overview</h2>
        <p className="text-muted-foreground mt-1">At a glance pulse on the school's financial health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI Card 1 */}
        <Card className="floating-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Overall Collection Rate</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-primary">78%</h3>
              <div className="flex flex-col items-end">
                <span className="flex items-center text-sm font-medium text-destructive">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  Target: 85%
                </span>
                <span className="text-xs text-muted-foreground">Regional Benchmark</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Card 2 */}
        <Card className="floating-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue (YTD)</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-primary">₹12.4Cr</h3>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-muted-foreground">
                  vs ₹15.8Cr Pending
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden">
              <div className="bg-accent h-full rounded-full" style={{ width: '44%' }}></div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Card 3 */}
        <Card className="floating-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Dropout/TC Revenue Loss</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-destructive">₹45.2L</h3>
              <div className="flex flex-col items-end">
                <span className="flex items-center text-sm font-medium text-destructive">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12% YoY
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Card 4 */}
        <Card className="floating-card">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Active Defaulters</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-primary">428</h3>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-muted-foreground">
                  Students
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="floating-card overflow-hidden border-0">
        <div className="p-6 pb-2 border-b border-border bg-white">
          <h3 className="text-lg font-bold text-primary">Year & Month Collection Trends</h3>
          <p className="text-sm text-muted-foreground">Comparing actual collections vs regional benchmarks</p>
        </div>
        <CardContent className="p-6 bg-white">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={collectionData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  yAxisId="left" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value}%`, 
                    name === 'actual' ? 'Actual Collection' : 'Regional Benchmark'
                  ]}
                  labelStyle={{ color: '#0F172A', fontWeight: 'bold', marginBottom: '8px' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-sm font-medium text-slate-700 mr-4">{value === 'actual' ? 'School Actual' : 'Regional Benchmark'}</span>}
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="actual" 
                  name="actual" 
                  fill="var(--color-primary)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="benchmark" 
                  name="benchmark" 
                  stroke="var(--color-accent)" 
                  strokeWidth={3}
                  dot={{ r: 6, fill: "var(--color-accent)", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 bg-secondary p-4 rounded-lg flex items-start gap-3 border border-border/50">
            <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-primary">Insight & Action</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Your school's total fee collection is lower than the benchmark of similar schools in the region. There is a noticeable drop starting in September. Recommend implementing early payment incentives before the second quarter drop-off.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
