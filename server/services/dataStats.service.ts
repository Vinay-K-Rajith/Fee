import type { StudentSummaryRecord, CollectionRecord } from "../dataLoader.js";

export interface DataStatistics {
  summary: {
    totalStudents: number;
    totalDueAmount: number;
    totalPaidAmount: number;
    totalConcessionAmount: number;
    totalBalanceAmount: number;
    defaultersCount: number;
    averageBalance: number;
    classDistribution: Record<string, number>;
    topDefaulters: Array<{ name: string; admissionNo: string; balance: number }>;
  };
  collections: {
    totalRecords: number;
    totalCollectionsAmount: number;
    yearsAvailable: string[];
    installmentTypes: string[];
    collectionModes: Record<string, number>;
    concessionTypes: Record<string, number>;
    totalConcessions: number;
    averageLateFee: number;
  };
}

export function computeDataStatistics(
  summaryData: StudentSummaryRecord[],
  collectionsData: CollectionRecord[]
): DataStatistics {
  // Summary statistics - work directly with arrays
  const totalStudents = summaryData.length;
  const totalDueAmount = summaryData.reduce((sum, r) => sum + (r.dueAmount || 0), 0);
  const totalPaidAmount = summaryData.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
  const totalConcessionAmount = summaryData.reduce((sum, r) => sum + (r.conAmount || 0), 0);
  const totalBalanceAmount = summaryData.reduce((sum, r) => sum + (r.balanceAmount || 0), 0);
  const defaultersCount = summaryData.filter((r) => r.balanceAmount > 0).length;
  const averageBalance = totalBalanceAmount / totalStudents;

  // Class distribution
  const classMap = new Map<string, number>();
  summaryData.forEach((r) => {
    classMap.set(r.className, (classMap.get(r.className) || 0) + 1);
  });
  const classDistribution = Object.fromEntries(classMap);

  // Top defaulters
  const topDefaulters = summaryData
    .filter((r) => r.balanceAmount > 0)
    .sort((a, b) => b.balanceAmount - a.balanceAmount)
    .slice(0, 10)
    .map((d) => ({
      name: d.name,
      admissionNo: d.admissionNo,
      balance: d.balanceAmount,
    }));

  // Collections statistics
  const totalCollectionsAmount = collectionsData.reduce((sum, r) => sum + (r.totalPaid || 0), 0);
  const yearsSet = new Set(collectionsData.map((r) => r.year));
  const yearsAvailable = Array.from(yearsSet) as string[];
  const installmentsSet = new Set(collectionsData.map((r) => r.installment));
  const installmentTypes = Array.from(installmentsSet) as string[];

  // Collection modes
  const modeMap = new Map<string, number>();
  collectionsData.forEach((r) => {
    const mode = r.receiptMode || "Unknown";
    modeMap.set(mode, (modeMap.get(mode) || 0) + 1);
  });
  const collectionModes = Object.fromEntries(modeMap);

  // Concession types
  const concessionMap = new Map<string, number>();
  collectionsData.forEach((r) => {
    const type = r.concessionType || "None";
    concessionMap.set(type, (concessionMap.get(type) || 0) + 1);
  });
  const concessionTypes = Object.fromEntries(concessionMap);

  const totalConcessions = collectionsData.reduce((sum, r) => sum + (r.totalConcession || 0), 0);
  const avgLateFee = collectionsData.reduce((sum, r) => sum + (r.lateFee || 0), 0) / collectionsData.length;

  return {
    summary: {
      totalStudents,
      totalDueAmount,
      totalPaidAmount,
      totalConcessionAmount,
      totalBalanceAmount,
      defaultersCount,
      averageBalance,
      classDistribution,
      topDefaulters,
    },
    collections: {
      totalRecords: collectionsData.length,
      totalCollectionsAmount,
      yearsAvailable,
      installmentTypes,
      collectionModes,
      concessionTypes,
      totalConcessions,
      averageLateFee: avgLateFee,
    },
  };
}
