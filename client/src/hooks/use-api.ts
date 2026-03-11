import { useQuery } from "@tanstack/react-query";
import type {
  DashboardData,
  KPISummary,
  BenchmarkData,
  MonthlyPerformance,
  YearlyPerformance,
  DefaulterAnalysis,
  ConcessionAnalysis,
  PaymentModeData,
  AdmissionTypeData,
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
export function useDashboard(yearFilter?: string) {
  return useQuery<DashboardData>({
    queryKey: ["dashboard", yearFilter],
    queryFn: () => fetchApi<DashboardData>(`/dashboard${yearFilter ? `?year=${yearFilter}` : ''}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// KPI Summary Hook
export function useKPISummary(yearFilter?: string) {
  return useQuery<KPISummary>({
    queryKey: ["kpi", "summary", yearFilter],
    queryFn: () => fetchApi<KPISummary>(`/kpi/summary${yearFilter ? `?year=${yearFilter}` : ''}`),
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
export function useDefaulterAnalysis(yearFilter?: string) {
  return useQuery<DefaulterAnalysis>({
    queryKey: ["defaulters", "analysis", yearFilter],
    queryFn: () => fetchApi<DefaulterAnalysis>(`/defaulters/analysis${yearFilter ? `?year=${yearFilter}` : ''}`),
    staleTime: 5 * 60 * 1000,
  });
}

// Concession Analysis Hook
export function useConcessionAnalysis(yearFilter?: string) {
  return useQuery<ConcessionAnalysis>({
    queryKey: ["concessions", "analysis", yearFilter],
    queryFn: () => fetchApi<ConcessionAnalysis>(`/concessions/analysis${yearFilter ? `?year=${yearFilter}` : ''}`),
    staleTime: 5 * 60 * 1000,
  });
}

// Payment Mode Analysis Hook
export function usePaymentModeAnalysis(yearFilter?: string) {
  return useQuery<PaymentModeData[]>({
    queryKey: ["payment-modes", "analysis", yearFilter],
    queryFn: () => fetchApi<PaymentModeData[]>(`/payment-modes/analysis${yearFilter ? `?year=${yearFilter}` : ''}`),
    staleTime: 5 * 60 * 1000,
  });
}

// Admission Type Analysis Hook
export function useAdmissionTypeAnalysis(yearFilter?: string) {
  return useQuery<AdmissionTypeData[]>({
    queryKey: ["admission-types", "analysis", yearFilter],
    queryFn: () => fetchApi<AdmissionTypeData[]>(`/admission-types/analysis${yearFilter ? `?year=${yearFilter}` : ''}`),
    staleTime: 5 * 60 * 1000,
  });
}

// Students Hook
export function useStudents() {
  return useQuery<StudentSummary[]>({
    queryKey: ["students"],
    queryFn: () => fetchApi<StudentSummary[]>("/students"),
    staleTime: 10 * 60 * 1000,
  });
}

// Utility function to format currency
export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 10000000) {
      return `₹${parseFloat((amount / 10000000).toFixed(2))}Cr`;
    } else if (amount >= 100000) {
      return `₹${parseFloat((amount / 100000).toFixed(2))}L`;
    } else if (amount >= 1000) {
      return `₹${parseFloat((amount / 1000).toFixed(1))}k`;
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
