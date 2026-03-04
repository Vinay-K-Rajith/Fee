// ========================================
// API Response Types (matching backend)
// ========================================

// KPI Summary
export interface KPISummary {
  totalFeeCollection: number;
  totalExpected: number;
  collectionRate: number;
  totalDefaulters: number;
  defaulterRate: number;
  totalConcession: number;
  concessionRate: number;
  totalTcDropoutLoss: number;
  tcDropoutCount: number;
  digitalAdoption: number;
  totalStudents: number;
  activeStudents: number;
  totalBalance: number;
  totalLateFee: number;
}

// Benchmark Data
export interface BenchmarkData {
  collectionRateBenchmark: number;
  defaulterRateBenchmark: number;
  concessionRateBenchmark: number;
  retentionRateBenchmark: number;
  digitalAdoptionBenchmark: number;
  quarterlyCollectionBenchmark: number;
}

// Year-on-Year Performance
export interface YearlyPerformance {
  year: string;
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  defaulterCount: number;
  defaulterRate: number;
  tcDropoutLoss: number;
  concessionGiven: number;
}

// Month-on-Month Performance
export interface MonthlyPerformance {
  month: string;
  monthNum: number;
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  cumulativeCollection: number;
  defaulterCount: number;
  newDefaulters: number;
  tcDropouts: number;
  concessionGiven: number;
}

// Defaulter Analysis
export interface OccupationDefaulter {
  occupation: string;
  defaulterCount: number;
  totalStudents: number;
  defaulterRate: number;
  totalBalance: number;
  avgInstallmentsPaid?: number;
}

export interface LocationDefaulter {
  location: string;
  defaulterCount: number;
  totalStudents: number;
  defaulterRate: number;
  totalBalance: number;
}

export interface SalarySlabDefaulter {
  salarySlab: string;
  defaulterCount: number;
  totalStudents: number;
  defaulterRate: number;
  totalBalance: number;
}

export interface ClassDefaulter {
  className: string;
  defaulterCount: number;
  totalStudents: number;
  defaulterRate: number;
  totalBalance: number;
  collectionRate: number;
}

export interface DefaulterAnalysis {
  totalDefaulters: number;
  habitualDefaulters: number;
  firstTimeDefaulters: number;
  concessionBeneficiaryDefaulters: number;
  criticalDelinquency: number;
  avgDelayDays: number;
  occupationWise: OccupationDefaulter[];
  locationWise: LocationDefaulter[];
  salarySlabWise: SalarySlabDefaulter[];
  classWise: ClassDefaulter[];
}

// Concession Analysis
export interface ConcessionCategory {
  category: string;
  amount: number;
  studentCount: number;
  percentage: number;
}

export interface MonthlyConcession {
  month: string;
  standard: number;
  unplanned: number;
  total: number;
}

export interface ConcessionAnalysis {
  totalConcessionGiven: number;
  concessionRate: number;
  studentsWithConcession: number;
  concessionDefaulters: number;
  concessionDefaulterRate: number;
  byCategory: ConcessionCategory[];
  monthlyTrend: MonthlyConcession[];
}

// TC/Dropout Analysis
export interface MonthlyTcDropout {
  month: string;
  tcCount: number;
  dropoutCount: number;
  revenueLoss: number;
}

export interface ClassTcDropout {
  className: string;
  tcCount: number;
  dropoutCount: number;
  revenueLoss: number;
}

export interface TcDropoutAnalysis {
  totalTcDropouts: number;
  revenueLoss: number;
  monthlyTrend: MonthlyTcDropout[];
  byClass: ClassTcDropout[];
  retentionRate: number;
}

// Class-wise Analysis
export interface ClassWiseAnalysis {
  className: string;
  totalStudents: number;
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  defaulterCount: number;
  concessionAmount: number;
  tcDropouts: number;
}

// Instalment Analysis
export interface InstalmentAnalysis {
  installmentName: string;
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  defaulterCount: number;
}

// Revenue Waterfall
export interface RevenueWaterfall {
  expectedRevenue: number;
  tcLoss: number;
  dropoutLoss: number;
  concessionLoss: number;
  pendingBalance: number;
  realizedRevenue: number;
}

// Fee Pay Masters
export interface FeePayMaster {
  occupation: string;
  location: string;
  salarySlab: string;
  studentCount: number;
  totalPaid: number;
  avgPaymentDays: number;
  reliabilityScore: number;
}

// Action Recommendations
export interface ActionRecommendation {
  id: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  implementation: string[];
}

// Student Summary
export interface StudentSummary {
  srNo: string;
  admissionNo: string;
  name: string;
  className: string;
  fatherName: string;
  dueAmount: number;
  conAmount: number;
  paidAmount: number;
  balanceAmount: number;
}

// Full Dashboard Data
export interface DashboardData {
  kpi: KPISummary;
  benchmarks: BenchmarkData;
  monthlyPerformance: MonthlyPerformance[];
  yearlyPerformance: YearlyPerformance[];
  defaulterAnalysis: DefaulterAnalysis;
  concessionAnalysis: ConcessionAnalysis;
  tcDropoutAnalysis: TcDropoutAnalysis;
  classWiseAnalysis: ClassWiseAnalysis[];
  installmentAnalysis: InstalmentAnalysis[];
  revenueWaterfall: RevenueWaterfall;
  recommendations: ActionRecommendation[];
}
