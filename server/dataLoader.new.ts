import XLSX from 'xlsx';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// Data Types
// ========================================

export interface StudentSummaryRecord {
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

export interface CollectionRecord {
  year: string;
  receiptDate: any;
  receiptNo: number;
  admNo: number;
  studentName: string;
  fatherOccupation: string;
  locality: string;
  classSection: string;
  installment: string;
  totalStructuredAmount: number;
  concessionPercent: number;
  concessionType: string;
  totalPayableAmount: number;
  dueDate: string;
  receiptMode: string;
  admissionType: string;
  totalPaid: number;
  totalConcession: number;
  defaulterTotal: number;
  lateFee: number;
  [key: string]: any; // For year-specific fields
}

// ========================================
// Data Loader Class
// ========================================

class DataLoader {
  private collection2023Data: CollectionRecord[] = [];
  private collection2024Data: CollectionRecord[] = [];
  private collection2025Data: CollectionRecord[] = [];
  private studentSummaryData: StudentSummaryRecord[] = [];
  private isLoaded = false;

  async loadData(): Promise<void> {
    if (this.isLoaded) return;

    try {
      // Load 2023-24 Collection (Detailed Structure)
      const path2023 = path.join(__dirname, '..', 'StudentCollection23.xlsx');
      if (fs.existsSync(path2023)) {
        const buffer2023 = fs.readFileSync(path2023);
        const workbook2023 = XLSX.read(buffer2023);
        const sheet2023 = workbook2023.Sheets['2023-24'];
        const rawData2023: any[] = XLSX.utils.sheet_to_json(sheet2023, { defval: 0 });
        
        // Skip header rows and map data
        this.collection2023Data = rawData2023.slice(1).map((row: any) => {
          const receiptDate = row['Student Details'];
          const receiptNo = row['__EMPTY'];
          const admNo = row['__EMPTY_1'];
          const studentName = row['__EMPTY_2'];
          const fatherOccupation = row['__EMPTY_3'];
          const locality = row['__EMPTY_4'];
          const classSection = row['__EMPTY_5'];
          const installment = row['Installment Details'];
          const totalStructuredAmount = row['__EMPTY_6'] || 0;
          const concessionPercent = row['__EMPTY_7'] || 0;
          const concessionType = row['__EMPTY_8'] || 'NA';
          const totalPayableAmount = row['__EMPTY_9'] || 0;
          const dueDate = row['__EMPTY_10'];
          const receiptMode = row['Collection Details'];
          const admissionType = row['__EMPTY_11'];
          const totalPaid = row['__EMPTY_24'] || 0;
          const totalConcession = row['__EMPTY_31'] || 0;
          const defaulterTotal = row['__EMPTY_38'] || 0;
          const lateFee = row['__EMPTY_13'] || 0;

          return {
            year: '2023-24',
            receiptDate,
            receiptNo,
            admNo,
            studentName,
            fatherOccupation,
            locality,
            classSection,
            installment,
            totalStructuredAmount,
            concessionPercent,
            concessionType,
            totalPayableAmount,
            dueDate,
            receiptMode,
            admissionType,
            totalPaid,
            totalConcession,
            defaulterTotal,
            lateFee,
            tuitionFees: row['__EMPTY_15'] || 0,
            gamesSportsActivites: row['__EMPTY_16'] || 0,
            developmentFund: row['__EMPTY_17'] || 0,
            computerFees: row['__EMPTY_18'] || 0,
            annualFees: row['__EMPTY_19'] || 0,
            labFees: row['__EMPTY_20'] || 0,
            admissionFee: row['__EMPTY_21'] || 0,
            smartClassFees: row['__EMPTY_22'] || 0,
          };
        }).filter(r => r.admNo && r.installment && r.installment !== 'Installment');
        
        console.log(`Loaded ${this.collection2023Data.length} records from 2023-24`);
      }

      // Load 2024-25 Collection (Simplified Structure)
      const path2024 = path.join(__dirname, '..', 'StudentCollection24.xlsx');
      if (fs.existsSync(path2024)) {
        const buffer2024 = fs.readFileSync(path2024);
        const workbook2024 = XLSX.read(buffer2024);
        const sheet2024 = workbook2024.Sheets['2024-25'];
        const rawData2024: any[] = XLSX.utils.sheet_to_json(sheet2024, { defval: 0 });
        
        this.collection2024Data = rawData2024.slice(1).map((row: any) => ({
          year: '2024-25',
          receiptDate: row['Student Details'],
          receiptNo: row['__EMPTY'],
          admNo: row['__EMPTY_1'],
          studentName: row['__EMPTY_2'],
          fatherOccupation: row['__EMPTY_3'],
          locality: row['__EMPTY_4'],
          classSection: row['__EMPTY_5'],
          installment: row['Installment Details'],
          totalStructuredAmount: row['__EMPTY_6'] || 0,
          concessionPercent: row['__EMPTY_7'] || 0,
          concessionType: row['__EMPTY_8'] || 'NA',
          totalPayableAmount: row['__EMPTY_9'] || 0,
          dueDate: row['__EMPTY_10'],
          receiptMode: row['Collection Details'],
          admissionType: row['__EMPTY_11'],
          totalPaid: row['__EMPTY_20'] || 0,
          totalConcession: row['__EMPTY_21'] || 0,
          defaulterTotal: row['__EMPTY_23'] || 0,
          lateFee: row['__EMPTY_14'] || 0,
          schoolFees: row['__EMPTY_18'] || 0,
          admissionFee: row['__EMPTY_19'] || 0,
          discountAmount: row['__EMPTY_12'] || 0,
        })).filter(r => r.admNo && r.installment && r.installment !== 'Installment');
        
        console.log(`Loaded ${this.collection2024Data.length} records from 2024-25`);
      }

      // Load 2025-26 Collection (Simplified + Bus Fee)
      const path2025 = path.join(__dirname, '..', 'StudentCollection25.xlsx');
      if (fs.existsSync(path2025)) {
        const buffer2025 = fs.readFileSync(path2025);
        const workbook2025 = XLSX.read(buffer2025);
        const sheet2025 = workbook2025.Sheets['2025-26'];
        const rawData2025: any[] = XLSX.utils.sheet_to_json(sheet2025, { defval: 0 });
        
        this.collection2025Data = rawData2025.slice(1).map((row: any) => ({
          year: '2025-26',
          receiptDate: row['Student Details'],
          receiptNo: row['__EMPTY'],
          admNo: row['__EMPTY_1'],
          studentName: row['__EMPTY_2'],
          fatherOccupation: row['__EMPTY_3'],
          locality: row['__EMPTY_4'],
          classSection: row['__EMPTY_5'],
          installment: row['Installment Details'],
          totalStructuredAmount: row['__EMPTY_6'] || 0,
          concessionPercent: row['__EMPTY_7'] || 0,
          concessionType: row['__EMPTY_8'] || 'NA',
          totalPayableAmount: row['__EMPTY_9'] || 0,
          dueDate: row['__EMPTY_10'],
          receiptMode: row['Collection Details'],
          admissionType: row['__EMPTY_11'],
          totalPaid: row['__EMPTY_20'] || 0,
          totalConcession: row['__EMPTY_22'] || 0,
          defaulterTotal: row['__EMPTY_25'] || 0,
          lateFee: row['__EMPTY_14'] || 0,
          schoolFees: row['__EMPTY_18'] || 0,
          admissionFee: row['__EMPTY_19'] || 0,
          busFee: row['__EMPTY_16'] || 0,
          discountAmount: row['__EMPTY_12'] || 0,
        })).filter(r => r.admNo && r.installment && r.installment !== 'Installment');
        
        console.log(`Loaded ${this.collection2025Data.length} records from 2025-26`);
      }

      // Load Student Summary data
      const studentWisePath = path.join(__dirname, '..', 'StudentWisexlsx.xlsx');
      if (fs.existsSync(studentWisePath)) {
        const studentBuffer = fs.readFileSync(studentWisePath);
        const studentWorkbook = XLSX.read(studentBuffer);
        const studentSheet = studentWorkbook.Sheets['Sheet1'];
        const studentRawData = XLSX.utils.sheet_to_json(studentSheet, { header: 1 });

        this.studentSummaryData = studentRawData.slice(1).map((row: any) => ({
          srNo: String(row[0] || ''),
          admissionNo: String(row[1] || ''),
          name: row[2] || '',
          className: row[3] || '',
          fatherName: row[4] || '',
          dueAmount: Number(row[5]) || 0,
          conAmount: Number(row[6]) || 0,
          paidAmount: Number(row[7]) || 0,
          balanceAmount: Number(row[8]) || 0,
        })).filter(r => r.admissionNo);
        
        console.log(`Loaded ${this.studentSummaryData.length} student summary records`);
      }

      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  // ========================================
  // Data Access Methods
  // ========================================

  getAllCollectionData(): CollectionRecord[] {
    return [...this.collection2023Data, ...this.collection2024Data, ...this.collection2025Data];
  }

  getCollection2023Data(): CollectionRecord[] {
    return this.collection2023Data;
  }

  getCollection2024Data(): CollectionRecord[] {
    return this.collection2024Data;
  }

  getCollection2025Data(): CollectionRecord[] {
    return this.collection2025Data;
  }

  getStudentSummaryData(): StudentSummaryRecord[] {
    return this.studentSummaryData;
  }

  // ========================================
  // KPI Calculations
  // ========================================

  getKPISummary() {
    const students = this.studentSummaryData;
    const allCollections = this.getAllCollectionData();

    const totalStudents = students.length;
    const totalExpected = students.reduce((sum, s) => sum + s.dueAmount, 0);
    const totalConcession = students.reduce((sum, s) => sum + s.conAmount, 0);
    const totalPaid = students.reduce((sum, s) => sum + s.paidAmount, 0);
    const totalBalance = students.reduce((sum, s) => sum + s.balanceAmount, 0);

    const defaulters = students.filter(s => s.balanceAmount > 0);

    // Calculate digital adoption rate from payment modes
    const paymentModes = allCollections.reduce((acc, record) => {
      const mode = record.receiptMode || 'Unknown';
      acc[mode] = (acc[mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalPayments = Object.values(paymentModes).reduce((sum, count) => sum + count, 0);
    const digitalPayments = (paymentModes['Online'] || 0) + (paymentModes['UPI'] || 0) + (paymentModes['Bank Transfer'] || 0);
    const digitalAdoption = totalPayments > 0 ? (digitalPayments / totalPayments) * 100 : 0;

    // Calculate collection efficiency
    const netExpected = totalExpected - totalConcession;
    const collectionRate = netExpected > 0 ? (totalPaid / netExpected) * 100 : 0;

    return {
      totalFeeCollection: totalPaid,
      totalExpected: totalExpected,
      totalConcession: totalConcession,
      netExpected: netExpected,
      collectionRate: collectionRate,
      totalBalance: totalBalance,
      totalDefaulters: defaulters.length,
      defaulterRate: totalStudents > 0 ? (defaulters.length / totalStudents) * 100 : 0,
      totalStudents: totalStudents,
      activeStudents: totalStudents,
      digitalAdoption: digitalAdoption,
      concessionRate: totalExpected > 0 ? (totalConcession / totalExpected) * 100 : 0,
      paymentModes: paymentModes,
    };
  }

  // ========================================
  // Performance Analysis
  // ========================================

  getYearlyPerformance() {
    const result = [
      {
        year: '2023-24',
        totalExpected: this.collection2023Data.reduce((sum, r) => sum + r.totalStructuredAmount, 0),
        totalCollected: this.collection2023Data.reduce((sum, r) => sum + r.totalPaid, 0),
        totalConcession: this.collection2023Data.reduce((sum, r) => sum + r.totalConcession, 0),
        totalBalance: this.collection2023Data.reduce((sum, r) => sum + r.defaulterTotal, 0),
        collectionRate: 0,
        studentCount: new Set(this.collection2023Data.map(r => r.admNo)).size,
      },
      {
        year: '2024-25',
        totalExpected: this.collection2024Data.reduce((sum, r) => sum + r.totalStructuredAmount, 0),
        totalCollected: this.collection2024Data.reduce((sum, r) => sum + r.totalPaid, 0),
        totalConcession: this.collection2024Data.reduce((sum, r) => sum + r.totalConcession, 0),
        totalBalance: this.collection2024Data.reduce((sum, r) => sum + r.defaulterTotal, 0),
        collectionRate: 0,
        studentCount: new Set(this.collection2024Data.map(r => r.admNo)).size,
      },
      {
        year: '2025-26',
        totalExpected: this.collection2025Data.reduce((sum, r) => sum + r.totalStructuredAmount, 0),
        totalCollected: this.collection2025Data.reduce((sum, r) => sum + r.totalPaid, 0),
        totalConcession: this.collection2025Data.reduce((sum, r) => sum + r.totalConcession, 0),
        totalBalance: this.collection2025Data.reduce((sum, r) => sum + r.defaulterTotal, 0),
        collectionRate: 0,
        studentCount: new Set(this.collection2025Data.map(r => r.admNo)).size,
      },
    ];

    // Calculate collection rates
    result.forEach(year => {
      const netExpected = year.totalExpected - year.totalConcession;
      year.collectionRate = netExpected > 0 ? (year.totalCollected / netExpected) * 100 : 0;
    });

    return result;
  }

  getMonthlyPerformance() {
    const monthMap = {
      'APR': 'Apr', 'MAY': 'May', 'JUN': 'Jun', 'JUL': 'Jul',
      'AUG': 'Aug', 'SEP': 'Sep', 'OCT': 'Oct', 'NOV': 'Nov',
      'DEC': 'Dec', 'JAN': 'Jan', 'FEB': 'Feb', 'MAR': 'Mar'
    };

    const monthlyData = new Map<string, {
      month: string;
      totalExpected: number;
      totalCollected: number;
      totalConcession: number;
      defaulterCount: number;
      newDefaulters: number;
      concessionGiven: number;
      records: number;
    }>();

    // Initialize months
    Object.values(monthMap).forEach(month => {
      monthlyData.set(month, {
        month,
        totalExpected: 0,
        totalCollected: 0,
        totalConcession: 0,
        defaulterCount: 0,
        newDefaulters: 0,
        concessionGiven: 0,
        records: 0,
      });
    });

    // Aggregate data from all years
    const allCollections = this.getAllCollectionData();
    allCollections.forEach(record => {
      const monthKey = record.installment.toUpperCase();
      const month = monthMap[monthKey as keyof typeof monthMap];
      if (month && monthlyData.has(month)) {
        const data = monthlyData.get(month)!;
        data.totalExpected += record.totalStructuredAmount;
        data.totalCollected += record.totalPaid;
        data.totalConcession += record.totalConcession;
        if (record.defaulterTotal > 0) {
          data.defaulterCount++;
        }
        if (record.concessionType !== 'NA' && record.totalConcession > 0) {
          data.concessionGiven += record.totalConcession;
        }
        data.records++;
      }
    });

    let cumulativeCollection = 0;
    return Array.from(monthlyData.values()).map((data, idx) => {
      cumulativeCollection += data.totalCollected;
      const netExpected = data.totalExpected - data.totalConcession;
      const collectionRate = netExpected > 0 ? (data.totalCollected / netExpected) * 100 : 0;

      return {
        month: data.month,
        monthNum: idx + 1,
        totalExpected: data.totalExpected,
        totalCollected: data.totalCollected,
        collectionRate: collectionRate,
        cumulativeCollection: cumulativeCollection,
        defaulterCount: data.defaulterCount,
        newDefaulters: Math.max(0, data.defaulterCount - (idx > 0 ? 10 : 0)),
        tcDropouts: 0,
        concessionGiven: data.concessionGiven,
      };
    });
  }

  // ========================================
  // Defaulter Analysis
  // ========================================

  getDefaulterAnalysis() {
    const students = this.studentSummaryData;
    const allCollections = this.getAllCollectionData();
    
    const defaulters = students.filter(s => s.balanceAmount > 0);
    const defaulterAdmissions = new Set(defaulters.map(d => String(d.admissionNo)));

    // Occupation-wise analysis
    const occupationMap = new Map<string, {
      total: number;
      defaulters: number;
      balance: number;
    }>();

    allCollections.forEach(record => {
      const admNo = String(record.admNo);
      const occupation = record.fatherOccupation || 'Unknown';
      
      if (!occupationMap.has(occupation)) {
        occupationMap.set(occupation, { total: 0, defaulters: 0, balance: 0 });
      }
      
      const data = occupationMap.get(occupation)!;
      // Count unique students
      if (!Array.from(occupationMap.entries()).some(([_, d]) => 
        allCollections.some(r => String(r.admNo) === admNo && r.fatherOccupation === occupation)
      )) {
        data.total++;
      }
      
      if (defaulterAdmissions.has(admNo)) {
        const student = students.find(s => String(s.admissionNo) === admNo);
        if (student) {
          data.balance = student.balanceAmount;
          data.defaulters++;
        }
      }
    });

    const occupationWise = Array.from(occupationMap.entries())
      .map(([occupation, data]) => ({
        occupation,
        defaulterCount: data.defaulters,
        totalStudents: data.total,
        defaulterRate: data.total > 0 ? (data.defaulters / data.total) * 100 : 0,
        totalBalance: data.balance,
      }))
      .filter(o => o.totalStudents > 0)
      .sort((a, b) => b.defaulterRate - a.defaulterRate)
      .slice(0, 15);

    // Location-wise analysis
    const locationMap = new Map<string, {
      total: number;
      defaulters: number;
      balance: number;
    }>();

    allCollections.forEach(record => {
      const admNo = String(record.admNo);
      const location = record.locality || 'Unknown';
      
      if (!locationMap.has(location)) {
        locationMap.set(location, { total: 0, defaulters: 0, balance: 0 });
      }
      
      if (defaulterAdmissions.has(admNo)) {
        const student = students.find(s => String(s.admissionNo) === admNo);
        if (student) {
          const data = locationMap.get(location)!;
          data.defaulters++;
          data.balance += student.balanceAmount;
        }
      }
    });

    const locationWise = Array.from(locationMap.entries())
      .map(([location, data]) => ({
        location,
        defaulterCount: data.defaulters,
        totalStudents: data.total,
        defaulterRate: data.total > 0 ? (data.defaulters / data.total) * 100 : 0,
        totalBalance: data.balance,
      }))
      .filter(l => l.defaulterCount > 0)
      .sort((a, b) => b.defaulterCount - a.defaulterCount)
      .slice(0, 20);

    // Class-wise analysis
    const classMap = new Map<string, {
      defaulters: number;
      balance: number;
    }>();

    students.forEach(student => {
      if (student.balanceAmount > 0) {
        const className = student.className || 'Unknown';
        if (!classMap.has(className)) {
          classMap.set(className, { defaulters: 0, balance: 0 });
        }
        const data = classMap.get(className)!;
        data.defaulters++;
        data.balance += student.balanceAmount;
      }
    });

    const classWise = Array.from(classMap.entries())
      .map(([className, data]) => ({
        className,
        defaulterCount: data.defaulters,
        totalBalance: data.balance,
        avgBalance: data.defaulters > 0 ? data.balance / data.defaulters : 0,
      }))
      .sort((a, b) => b.defaulterCount - a.defaulterCount);

    return {
      totalDefaulters: defaulters.length,
      totalBalance: defaulters.reduce((sum, d) => sum + d.balanceAmount, 0),
      occupationWise,
      locationWise,
      classWise,
      defaulterList: defaulters.slice(0, 100).map(d => ({
        admissionNo: d.admissionNo,
        name: d.name,
        className: d.className,
        fatherName: d.fatherName,
        balance: d.balanceAmount,
      })),
    };
  }

  // ========================================
  // Concession Analysis
  // ========================================

  getConcessionAnalysis() {
    const students = this.studentSummaryData;
    const allCollections = this.getAllCollectionData();

    const studentsWithConcession = students.filter(s => s.conAmount > 0);
    const totalConcession = students.reduce((sum, s) => sum + s.conAmount, 0);

    // Concession type distribution
    const concessionTypes = new Map<string, {
      count: number;
      amount: number;
      defaulters: number;
    }>();

    allCollections.forEach(record => {
      const type = record.concessionType || 'NA';
      if (type !== 'NA' && record.totalConcession > 0) {
        if (!concessionTypes.has(type)) {
          concessionTypes.set(type, { count: 0, amount: 0, defaulters: 0 });
        }
        const data = concessionTypes.get(type)!;
        data.count++;
        data.amount += record.totalConcession;
        if (record.defaulterTotal > 0) {
          data.defaulters++;
        }
      }
    });

    const concessionTypeWise = Array.from(concessionTypes.entries())
      .map(([type, data]) => ({
        concessionType: type,
        studentCount: data.count,
        totalAmount: data.amount,
        defaulterCount: data.defaulters,
        defaulterRate: data.count > 0 ? (data.defaulters / data.count) * 100 : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      totalConcession,
      studentsWithConcession: studentsWithConcession.length,
      concessionRate: students.length > 0 ? (studentsWithConcession.length / students.length) * 100 : 0,
      concessionTypeWise,
      avgConcessionPerStudent: studentsWithConcession.length > 0 ? totalConcession / studentsWithConcession.length : 0,
    };
  }

  // ========================================
  // Benchmarks
  // ========================================

  getBenchmarks() {
    return {
      collectionRateBenchmark: 85,
      defaulterRateBenchmark: 15,
      concessionRateBenchmark: 10,
      digitalAdoptionTarget: 60,
      industryAvgCollectionRate: 82,
      industryAvgDefaulterRate: 18,
    };
  }

  // ========================================
  // Payment Mode Analysis
  // ========================================

  getPaymentModeAnalysis() {
    const allCollections = this.getAllCollectionData();
    
    const paymentModes = new Map<string, {
      count: number;
      amount: number;
    }>();

    allCollections.forEach(record => {
      const mode = record.receiptMode || 'Unknown';
      if (!paymentModes.has(mode)) {
        paymentModes.set(mode, { count: 0, amount: 0 });
      }
      const data = paymentModes.get(mode)!;
      data.count++;
      data.amount += record.totalPaid;
    });

    return Array.from(paymentModes.entries())
      .map(([mode, data]) => ({
        paymentMode: mode,
        transactionCount: data.count,
        totalAmount: data.amount,
        avgTransactionSize: data.count > 0 ? data.amount / data.count : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }

  // ========================================
  // Admission Type Analysis
  // ========================================

  getAdmissionTypeAnalysis() {
    const allCollections = this.getAllCollectionData();
    
    const admissionTypes = new Map<string, {
      count: number;
      collected: number;
      defaulters: number;
    }>();

    const processedStudents = new Set<string>();

    allCollections.forEach(record => {
      const type = record.admissionType || 'Unknown';
      const admNo = String(record.admNo);
      
      if (!admissionTypes.has(type)) {
        admissionTypes.set(type, { count: 0, collected: 0, defaulters: 0 });
      }
      
      const data = admissionTypes.get(type)!;
      
      if (!processedStudents.has(`${type}-${admNo}`)) {
        data.count++;
        processedStudents.add(`${type}-${admNo}`);
      }
      
      data.collected += record.totalPaid;
      
      if (record.defaulterTotal > 0) {
        data.defaulters++;
      }
    });

    return Array.from(admissionTypes.entries())
      .map(([type, data]) => ({
        admissionType: type,
        studentCount: data.count,
        totalCollected: data.collected,
        defaulterCount: data.defaulters,
        defaulterRate: data.count > 0 ? (data.defaulters / data.count) * 100 : 0,
      }));
  }
}

export const dataLoader = new DataLoader();
