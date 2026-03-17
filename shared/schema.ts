import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========================================
// Database Schema
// ========================================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Students Table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  admissionNo: varchar("admission_no").notNull().unique(),
  name: text("name").notNull(),
  className: text("class_name").notNull(),
  fatherName: text("father_name"),
  occupation: text("occupation"),
  salarySlab: text("salary_slab"),
  location: text("location"),
  concessionPercent: text("concession_percent"),
  status: text("status").default("active"), // active, tc, dropout
  createdAt: timestamp("created_at").defaultNow(),
});

// Fee Collection Records
export const feeCollections = pgTable("fee_collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id),
  admissionNo: varchar("admission_no").notNull(),
  installmentName: text("installment_name").notNull(),
  
  // Fee Structure Components
  lateFee: real("late_fee").default(0),
  readmissionFee: real("readmission_fee").default(0),
  excessAmount: real("excess_amount").default(0),
  securityFee: real("security_fee").default(0),
  applicationFee: real("application_fee").default(0),
  oneTimeFee: real("one_time_fee").default(0),
  annualFee: real("annual_fee").default(0),
  extraCurricularFee: real("extra_curricular_fee").default(0),
  
  // Totals
  totalStructure: real("total_structure").default(0),
  
  // Concession Details
  concessionSecurityFee: real("concession_security_fee").default(0),
  concessionApplicationFee: real("concession_application_fee").default(0),
  concessionOneTimeFee: real("concession_one_time_fee").default(0),
  concessionAnnualFee: real("concession_annual_fee").default(0),
  concessionExtraCurricular: real("concession_extra_curricular").default(0),
  totalConcession: real("total_concession").default(0),
  
  // Expected & Paid
  totalExpected: real("total_expected").default(0),
  paidTcDropout: real("paid_tc_dropout").default(0),
  paidActive: real("paid_active").default(0),
  balance: real("balance").default(0),
  
  // Payment Date
  paymentDate: date("payment_date"),
  
  // Academic Year & Month
  academicYear: text("academic_year"),
  month: integer("month"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Student Summary (from StudentWise Excel)
export const studentSummary = pgTable("student_summary", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  admissionNo: varchar("admission_no").notNull().unique(),
  name: text("name").notNull(),
  className: text("class_name").notNull(),
  fatherName: text("father_name"),
  dueAmount: real("due_amount").default(0),
  conAmount: real("con_amount").default(0),
  paidAmount: real("paid_amount").default(0),
  balanceAmount: real("balance_amount").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ========================================
// Insert Schemas
// ========================================

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertFeeCollectionSchema = createInsertSchema(feeCollections).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSummarySchema = createInsertSchema(studentSummary).omit({
  id: true,
  createdAt: true,
});

// ========================================
// Types
// ========================================

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

export type InsertFeeCollection = z.infer<typeof insertFeeCollectionSchema>;
export type FeeCollection = typeof feeCollections.$inferSelect;

export type InsertStudentSummary = z.infer<typeof insertStudentSummarySchema>;
export type StudentSummary = typeof studentSummary.$inferSelect;

// ========================================
// API Response Types
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

export interface PaymentHabit {
  admissionNo: string;
  name: string;
  className: string;
  totalLateFeePaid: number;
  timesLate: number;
  totalPaid: number;
  totalDefaulterBalance: number;
}

// Defaulter Analysis
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
  riskAnalysis?: PaymentHabit[];
  goodBehaviors?: PaymentHabit[];
}

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

// Concession Analysis
export interface ConcessionAnalysis {
  totalConcessionGiven: number;
  concessionRate: number;
  studentsWithConcession: number;
  concessionDefaulters: number;
  concessionDefaulterRate: number;
  byCategory: ConcessionCategory[];
  monthlyTrend: MonthlyConcession[];
}

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

// TC/Dropout Analysis
export interface TcDropoutAnalysis {
  totalTcDropouts: number;
  revenueLoss: number;
  monthlyTrend: MonthlyTcDropout[];
  byClass: ClassTcDropout[];
  retentionRate: number;
}

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

// Instalment Analysis
export interface InstalmentAnalysis {
  installmentName: string;
  totalExpected: number;
  totalCollected: number;
  collectionRate: number;
  defaulterCount: number;
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

// Revenue Waterfall
export interface RevenueWaterfall {
  expectedRevenue: number;
  tcLoss: number;
  dropoutLoss: number;
  concessionLoss: number;
  pendingBalance: number;
  realizedRevenue: number;
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
