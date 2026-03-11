// ========================================
// API Response Types (matching new backend)
// ========================================

// KPI Summary
export interface KPISummary {
  totalFeeCollection: number;
  totalExpected: number;
  totalConcession: number;
  netExpected: number;
  collectionRate: number;
  totalBalance: number;
  totalDefaulters: number;
  defaulterRate: number;
  totalStudents: number;
  activeStudents: number;
  digitalAdoption: number;
  concessionRate: number;
  paymentModes: Record<string, number>;
}

// Benchmark Data
export interface BenchmarkData {
  collectionRateBenchmark: number;
  defaulterRateBenchmark: number;
  concessionRateBenchmark: number;
  digitalAdoptionTarget: number;
  industryAvgCollectionRate: number;
  industryAvgDefaulterRate: number;
}

// Year-on-Year Performance
export interface YearlyPerformance {
  year: string;
  totalExpected: number;
  totalCollected: number;
  totalConcession: number;
  totalBalance: number;
  collectionRate: number;
  studentCount: number;
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
}

export interface LocationDefaulter {
  location: string;
  defaulterCount: number;
  totalStudents: number;
  defaulterRate: number;
  totalBalance: number;
}

export interface ClassDefaulter {
  className: string;
  defaulterCount: number;
  totalBalance: number;
  avgBalance: number;
}

export interface DefaulterListItem {
  admissionNo: string;
  name: string;
  className: string;
  fatherName: string;
  balance: number;
}

export interface DefaulterAnalysis {
  totalDefaulters: number;
  totalBalance: number;
  occupationWise: OccupationDefaulter[];
  locationWise: LocationDefaulter[];
  classWise: ClassDefaulter[];
  defaulterList: DefaulterListItem[];
}

// Concession Analysis
export interface ConcessionTypeWise {
  concessionType: string;
  studentCount: number;
  totalAmount: number;
  defaulterCount: number;
  defaulterRate: number;
}

export interface ConcessionAnalysis {
  totalConcession: number;
  studentsWithConcession: number;
  concessionRate: number;
  concessionTypeWise: ConcessionTypeWise[];
  avgConcessionPerStudent: number;
}

// Payment Mode Analysis
export interface PaymentModeData {
  paymentMode: string;
  transactionCount: number;
  totalAmount: number;
  avgTransactionSize: number;
}

// Admission Type Analysis
export interface AdmissionTypeData {
  admissionType: string;
  studentCount: number;
  totalCollected: number;
  defaulterCount: number;
  defaulterRate: number;
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

// Extended Analysis
export interface ExtendedAnalysis {
  outstandingPercent: number;
  totalLateFee: number;
  monthlyLateFees: { month: string; amount: number }[];
  chequeBounces: number;
  reAdmissions: number;
  delayTimeBuckets: { id: string; label: string; count: number }[];
}

// Full Dashboard Data
export interface DashboardData {
  kpi: KPISummary;
  benchmarks: BenchmarkData;
  monthlyPerformance: MonthlyPerformance[];
  yearlyPerformance: YearlyPerformance[];
  defaulterAnalysis: DefaulterAnalysis;
  concessionAnalysis: ConcessionAnalysis;
  paymentModeAnalysis: PaymentModeData[];
  admissionTypeAnalysis: AdmissionTypeData[];
  extendedAnalysis: ExtendedAnalysis;
}
