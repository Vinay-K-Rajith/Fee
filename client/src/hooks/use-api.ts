import { useQuery } from "@tanstack/react-query";
import type {
  DashboardData,
  KPISummary,
  BenchmarkData,
  MonthlyPerformance,
  YearlyPerformance,
  DefaulterAnalysis,
  ConcessionAnalysis,
  TcDropoutAnalysis,
  ClassWiseAnalysis,
  InstalmentAnalysis,
  RevenueWaterfall,
  ActionRecommendation,
  FeePayMaster,
  StudentSummary,
} from "@/lib/types";

const API_BASE = "/api";

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

// Full Dashboard Hook (all data in one call)
export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => fetchApi<DashboardData>("/dashboard"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// KPI Summary Hook
export function useKPISummary() {
  return useQuery<KPISummary>({
    queryKey: ["kpi", "summary"],
    queryFn: () => fetchApi<KPISummary>("/kpi/summary"),
    staleTime: 5 * 60 * 1000,
  });
}

// Benchmarks Hook
export function useBenchmarks() {
  return useQuery<BenchmarkData>({
    queryKey: ["benchmarks"],
    queryFn: () => fetchApi<BenchmarkData>("/benchmarks"),
    staleTime: 30 * 60 * 1000, // 30 minutes (benchmarks change less often)
  });
}

// Monthly Performance Hook
export function useMonthlyPerformance() {
  return useQuery<MonthlyPerformance[]>({
    queryKey: ["performance", "monthly"],
    queryFn: () => fetchApi<MonthlyPerformance[]>("/performance/monthly"),
    staleTime: 5 * 60 * 1000,
  });
}

// Yearly Performance Hook
export function useYearlyPerformance() {
  return useQuery<YearlyPerformance[]>({
    queryKey: ["performance", "yearly"],
    queryFn: () => fetchApi<YearlyPerformance[]>("/performance/yearly"),
    staleTime: 5 * 60 * 1000,
  });
}

// Defaulter Analysis Hook
export function useDefaulterAnalysis() {
  return useQuery<DefaulterAnalysis>({
    queryKey: ["defaulters", "analysis"],
    queryFn: () => fetchApi<DefaulterAnalysis>("/defaulters/analysis"),
    staleTime: 5 * 60 * 1000,
  });
}

// Concession Analysis Hook
export function useConcessionAnalysis() {
  return useQuery<ConcessionAnalysis>({
    queryKey: ["concessions", "analysis"],
    queryFn: () => fetchApi<ConcessionAnalysis>("/concessions/analysis"),
    staleTime: 5 * 60 * 1000,
  });
}

// TC/Dropout Analysis Hook
export function useTcDropoutAnalysis() {
  return useQuery<TcDropoutAnalysis>({
    queryKey: ["tc-dropout", "analysis"],
    queryFn: () => fetchApi<TcDropoutAnalysis>("/tc-dropout/analysis"),
    staleTime: 5 * 60 * 1000,
  });
}

// Class-wise Analysis Hook
export function useClassWiseAnalysis() {
  return useQuery<ClassWiseAnalysis[]>({
    queryKey: ["class-wise", "analysis"],
    queryFn: () => fetchApi<ClassWiseAnalysis[]>("/class-wise/analysis"),
    staleTime: 5 * 60 * 1000,
  });
}

// Installment Analysis Hook
export function useInstallmentAnalysis() {
  return useQuery<InstalmentAnalysis[]>({
    queryKey: ["installments", "analysis"],
    queryFn: () => fetchApi<InstalmentAnalysis[]>("/installments/analysis"),
    staleTime: 5 * 60 * 1000,
  });
}

// Revenue Waterfall Hook
export function useRevenueWaterfall() {
  return useQuery<RevenueWaterfall>({
    queryKey: ["revenue", "waterfall"],
    queryFn: () => fetchApi<RevenueWaterfall>("/revenue/waterfall"),
    staleTime: 5 * 60 * 1000,
  });
}

// Fee Pay Masters Hook
export function useFeePayMasters() {
  return useQuery<FeePayMaster[]>({
    queryKey: ["fee-pay-masters"],
    queryFn: () => fetchApi<FeePayMaster[]>("/fee-pay-masters"),
    staleTime: 5 * 60 * 1000,
  });
}

// Recommendations Hook
export function useRecommendations() {
  return useQuery<ActionRecommendation[]>({
    queryKey: ["recommendations"],
    queryFn: () => fetchApi<ActionRecommendation[]>("/recommendations"),
    staleTime: 5 * 60 * 1000,
  });
}

// Students Hook
export function useStudents() {
  return useQuery<StudentSummary[]>({
    queryKey: ["students"],
    queryFn: () => fetchApi<StudentSummary[]>("/students"),
    staleTime: 5 * 60 * 1000,
  });
}

// Utility function to format currency
export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Utility function to format percentage
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Utility function to get trend indicator
export function getTrendIndicator(current: number, benchmark: number): {
  trend: 'up' | 'down' | 'neutral';
  isPositive: boolean;
  difference: number;
} {
  const difference = current - benchmark;
  if (Math.abs(difference) < 0.5) {
    return { trend: 'neutral', isPositive: true, difference };
  }
  return {
    trend: current > benchmark ? 'up' : 'down',
    isPositive: current >= benchmark,
    difference,
  };
}

// Utility function to get color based on value vs benchmark
export function getPerformanceColor(value: number, benchmark: number, inverse = false): string {
  const isGood = inverse ? value <= benchmark : value >= benchmark;
  if (isGood) return 'text-emerald-600';
  const diff = Math.abs(value - benchmark);
  if (diff > 10) return 'text-red-600';
  return 'text-amber-600';
}
