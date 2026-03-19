# Fee Insights Dashboard - Complete Calculations Reference
**Version:** 2.0  
**Last Updated:** March 19, 2026  
**Purpose:** Comprehensive technical guide for all calculations, data flows, and component rendering

---

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Data Loading & Sources](#data-loading--sources)
3. [Core KPI Calculations](#core-kpi-calculations)
4. [Performance Analysis](#performance-analysis)
5. [Defaulter Analysis](#defaulter-analysis)
6. [Concession Analysis](#concession-analysis)
7. [Payment Mode & Admission Analysis](#payment-mode--admission-analysis)
8. [Extended Metrics](#extended-metrics)
9. [Frontend Data Flow](#frontend-data-flow)
10. [Component Rendering Details](#component-rendering-details)
11. [Calculation Examples](#calculation-examples)

---

## System Architecture Overview

### Data Flow Diagram
```
Excel Files
  ↓
DataLoader (server/dataLoader.ts)
  ↓
Calculate Aggregates → DataStats Service
  ↓
API Endpoints (20+ routes)
  ↓
React Query Hooks (use-api.ts)
  ↓
Frontend Pages & Components
  ↓
Recharts Visualization
```

### Technology Stack
- **Backend:** Node.js + Express, XLSX parsing, Linear Regression
- **Frontend:** React 18, React Query (TanStack), Recharts, TypeScript
- **Data Format:** Excel (XLSX) → JSON → React Components
- **Caching:** React Query (5-minute cache for most data)

---

## Data Loading & Sources

### File Locations
| File | Purpose | Location |
|------|---------|----------|
| StudentCollection23.xlsx | 2023-24 transactions | Project root |
| StudentCollection24.xlsx | 2024-25 transactions | Project root |
| StudentCollection25.xlsx | 2025-26 transactions | Project root |
| StudentWise.xlsx | Student summary (optional) | Project root |

### Data Loading Process

**File:** `server/dataLoader.ts` → `DataLoader.loadData()`

```javascript
// Step 1: Load each year's Excel file
const buffer = fs.readFileSync(path.join(process.cwd(), 'StudentCollection23.xlsx'));
const workbook = XLSX.read(buffer);
const sheet = workbook.Sheets['2023-24'];
const rawData = XLSX.utils.sheet_to_json(sheet, { defval: 0 });

// Step 2: Map Excel columns to CollectionRecord interface
// Excel uses __EMPTY_0, __EMPTY_1, etc. for column headers
collection2023Data = rawData.slice(1).map((row) => ({
  year: '2023-24',
  receiptDate: row['Student Details'],      // Date payment received
  receiptNo: row['__EMPTY'],                 // Receipt number
  admNo: row['__EMPTY_1'],                   // Admission number
  studentName: row['__EMPTY_2'],             // Student name
  fatherOccupation: row['__EMPTY_3'],        // Father's occupation
  locality: row['__EMPTY_4'],                // Location
  classSection: row['__EMPTY_5'],            // Class/section
  installment: row['Installment Details'],   // Installment type
  totalStructuredAmount: row['__EMPTY_6'],   // Fee structure
  concessionPercent: row['__EMPTY_7'],       // % concession
  concessionType: row['__EMPTY_8'],          // Type of concession
  totalPayableAmount: row['__EMPTY_9'],      // After concession
  dueDate: row['__EMPTY_10'],                // Promised date
  receiptMode: row['Collection Details'],    // Payment mode
  admissionType: row['__EMPTY_11'],          // Admission type
  totalPaid: row['__EMPTY_20'],              // Amount paid
  totalConcession: row['__EMPTY_31'],        // Concession amount
  defaulterTotal: row['__EMPTY_38'],         // Outstanding balance
  lateFee: row['__EMPTY_13'],                // Late fee charged
  // ... additional fields for 2023-24 data
}));

// Step 3: Generate StudentSummaryRecord from collections
// Aggregate per student across all transactions
const studentMap = new Map();
allCollections.forEach(record => {
  const admNo = String(record.admNo);
  if (!existing) {
    studentMap.set(admNo, {
      admissionNo: admNo,
      name: record.studentName,
      className: record.classSection,
      dueAmount: record.totalStructuredAmount,
      conAmount: record.totalConcession,
      paidAmount: record.totalPaid,
      balanceAmount: record.defaulterTotal
    });
  } else {
    // Aggregate for same student
    existing.dueAmount += record.totalStructuredAmount;
    existing.conAmount += record.totalConcession;
    existing.paidAmount += record.totalPaid;
    existing.balanceAmount += record.defaulterTotal;
  }
});
```

### Data Filtering

**Method:** `getFilteredCollections(yearFilter?: string)`

```javascript
// If yearFilter provided (e.g., "2024-25")
if (!yearFilter || yearFilter === 'all') {
  return [...collection2023Data, ...collection2024Data, ...collection2025Data];
}
return allCollections.filter(c => c.year === yearFilter);
```

---

## Core KPI Calculations

**File:** `server/dataLoader.ts` → `getKPISummary(yearFilter?)`  
**Endpoint:** `GET /api/kpi/summary?year={year}`

### 1. Total Students
```
totalStudents = COUNT(students[])
```
- Count of unique admission numbers
- Aggregated from filtered collections
- **Type:** Integer

### 2. Total Expected Revenue
```
totalExpected = SUM(students[].dueAmount)
```
- Sum of fee structures for all students
- **Type:** Currency (₹)
- **Example:** 1000 students × ₹50,000 avg = ₹5 Crore

### 3. Total Concession Amount
```
totalConcession = SUM(students[].conAmount)
```
- Sum of concessions actually granted
- Percentage: `(totalConcession / totalExpected) × 100`
- **Type:** Currency (₹)

### 4. Total Paid Amount
```
totalPaid = SUM(students[].paidAmount)
```
- Sum of all payments received
- **Type:** Currency (₹)

### 5. Total Balance (Outstanding)
```
totalBalance = SUM(students[].balanceAmount)
```
- Sum of unpaid amounts
- **Type:** Currency (₹)

### 6. Collection Rate (Most Important KPI)
```
collectionRate = (totalPaid / (totalExpected - totalConcession)) × 100
```

**Breakdown:**
- **Numerator:** Total amount actually collected
- **Denominator:** Expected amount AFTER deducting concessions
- **Result:** Percentage of expected revenue collected

**Example:**
```
Expected: ₹100L
Concession: ₹10L
Paid: ₹72L
Net Expected: ₹100L - ₹10L = ₹90L
Collection Rate: (₹72L / ₹90L) × 100 = 80%
```

**Logic:** Why subtract concession from expected?
- Expected ₹100L but gave ₹10L concession
- School should only aim to collect ₹90L
- Collecting ₹72L is 80% of realistic target

### 7. Defaulter Count & Rate
```
defaulters = FILTER(students WHERE balanceAmount > 0)
totalDefaulters = COUNT(defaulters)
defaulterRate = (totalDefaulters / totalStudents) × 100
```

**Example:**
```
Total Students: 1000
Students with Balance > 0: 250
Defaulter Rate: (250 / 1000) × 100 = 25%
```

### 8. Digital Adoption Rate
```
digitalAdoption = (Online + UPI + Bank Transfer) / Total Payments × 100
```

**Calculation:**
```javascript
const paymentModes = {};
allCollections.forEach(r => {
  const mode = r.receiptMode; // "Online", "UPI", "Cash", etc.
  paymentModes[mode] = (paymentModes[mode] || 0) + 1;
});

const digitalPayments = 
  (paymentModes['Online'] || 0) + 
  (paymentModes['UPI'] || 0) + 
  (paymentModes['Bank Transfer'] || 0);

const totalPayments = Object.values(paymentModes).reduce((s, c) => s + c, 0);
const digitalAdoption = (digitalPayments / totalPayments) * 100;
```

**Benchmark:** 60% target (shift from cash to digital)

### 9. Concession Rate
```
concessionRate = (totalConcession / totalExpected) × 100
```
- Shows % of expected revenue given as concessions
- **Benchmark:** Should be <10%
- High rate = unsustainable concession policy

### 10. Return Value Format
```javascript
{
  totalFeeCollection: number,      // Total Paid
  totalExpected: number,            // Before concessions
  totalConcession: number,          // Total given
  netExpected: number,              // Expected - Concession
  collectionRate: number,           // Main KPI %
  totalBalance: number,             // Outstanding
  totalDefaulters: number,          // Count
  defaulterRate: number,            // %
  totalStudents: number,            // Total count
  activeStudents: number,           // Non-defaulters
  digitalAdoption: number,          // %
  concessionRate: number,           // %
  paymentModes: { mode: count, ... }, // Distribution
}
```

---

## Performance Analysis

### A. Yearly Performance (Year-on-Year)

**File:** `server/dataLoader.ts` → `getYearlyPerformance()`  
**Endpoint:** `GET /api/performance/yearly`

#### Actual Years (2023-24, 2024-25, 2025-26)

For each year:
```javascript
{
  year: '2023-24',
  
  // Basic aggregates
  totalExpected = SUM(records WHERE year='2023-24' → totalStructuredAmount),
  totalCollected = SUM(records WHERE year='2023-24' → totalPaid),
  totalConcession = SUM(records WHERE year='2023-24' → totalConcession),
  totalBalance = SUM(records WHERE year='2023-24' → defaulterTotal),
  
  // Metrics
  collectionRate = (totalCollected / (totalExpected - totalConcession)) × 100,
  studentCount = COUNT(DISTINCT admNo WHERE year='2023-24'),
  
  // Forecast flag
  isForecast: false,
}
```

**Example Calculation:**
```
2024-25 Data:
- Total Expected: ₹120L
- Total Collected: ₹96L
- Total Concession: ₹12L
- Collection Rate: (96 / (120-12)) × 100 = (96 / 108) × 100 = 88.9%
```

#### Forecast Years (2026-27, 2027-28)

**Method:** Linear Regression

```javascript
// Prepare data points for regression
const expectedData = [
  [0, 100L],  // 2023-24 expected
  [1, 110L],  // 2024-25 expected
  [2, 120L],  // 2025-26 expected
];

// Run linear regression
const expectedRegression = regression.linear(expectedData);
// Returns: y = mx + b formula

// Predict next 2 years
const forecast2026 = expectedRegression.predict(3); // [3, predictedValue]
const forecast2027 = expectedRegression.predict(4); // [4, predictedValue]

// Apply same regression to collected, concession, balance
```

**Example:**
```
Historical Trend:
2023-24: 100L expected, 80L collected (80% rate)
2024-25: 110L expected, 88L collected (80% rate)
2025-26: 120L expected, 96L collected (80% rate)

Regression calculates trend: +10L/year expected, +8L/year collected
Forecast:
2026-27: 130L expected, 104L collected (80% rate)
2027-28: 140L expected, 112L collected (80% rate)
```

### B. Monthly Performance (Academic Year: Apr-Mar)

**File:** `server/dataLoader.ts` → `getMonthlyPerformance(yearFilter?)`  
**Endpoint:** `GET /api/performance/monthly?year={year}`

#### Month Ordering
Indian Financial Year: April to March (12 months)
```
monthOrder = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar']
```

#### Key Distinction: Expected vs Collected

**Expected fees** are grouped by **installment schedule**
```
// Installment months in Excel
'APR' → 'Apr',   // April installment
'MAY' → 'May',   // May installment
etc.
```

**Collected fees** are grouped by **receipt date** (actual payment)
```
// Parse receiptDate from record
receiptDate = "15-06-2024" or Excel serial 45452
→ Extract month → 'Jun'
```

**Why different?** A student might pay June fees in July → counts in July collection

#### Monthly Calculation

```javascript
for each month ('Apr' to 'Mar') {
  // EXPECTED: from installment schedule
  monthExpected = SUM(
    records WHERE INSTALLMENT_MONTH = 'Apr'
    → totalStructuredAmount
  );
  
  monthConcession = SUM(
    records WHERE INSTALLMENT_MONTH = 'Apr'
    → totalConcession
  );
  
  // COLLECTED: from receipt date (actual money in)
  monthCollected = SUM(
    records WHERE RECEIPT_MONTH = 'Apr'
    → totalPaid
  );
  
  // METRICS
  monthMetrics = {
    month: 'Apr',
    totalExpected: monthExpected,
    totalCollected: monthCollected,
    collectionRate: (monthCollected / (monthExpected - monthConcession)) × 100,
    cumulativeCollection: running sum of collected,
    defaulterCount: COUNT(records WHERE INSTALLMENT_MONTH='Apr' AND defaulterTotal > 0),
    concessionGiven: SUM(totalConcession),
  };
}
```

**Example:**
```
April Month:
Expected (installment schedule): ₹12L
Concession (promised): ₹1.2L
Collected (actual receipts): ₹9.6L
Collection Rate: (9.6 / (12 - 1.2)) × 100 = (9.6 / 10.8) × 100 = 88.9%

Cumulative: 9.6L (running total from Apr)
May month cumulative: 9.6 + 8.8 = 18.4L
etc.
```

#### Cumulative Collection
```javascript
let cumulativeCollection = 0;
for each month {
  cumulativeCollection += monthCollected;
  monthData.cumulativeCollection = cumulativeCollection;
}
```

---

## Defaulter Analysis

**File:** `server/dataLoader.ts` → `getDefaulterAnalysis(yearFilter?)`  
**Endpoint:** `GET /api/defaulters/analysis?year={year}`

### Definition of Defaulter
```
defaulter = Student WHERE balanceAmount > 0
```
Any unpaid balance = active defaulter

### 1. Overall Defaulter Stats

```javascript
const defaulters = students.filter(s => s.balanceAmount > 0);

totalDefaulters = defaulters.length;
totalBalance = SUM(defaulters[].balanceAmount);
```

### 2. Occupation-wise Analysis

**Method:** Group by father's occupation

```javascript
const occupationMap = new Map();
const occupationStudents = new Map(); // Track unique students per occupation

allCollections.forEach(record => {
  const admNo = String(record.admNo);
  const occupation = record.fatherOccupation || 'Unknown';
  
  // Initialize maps
  if (!occupationMap.has(occupation)) {
    occupationMap.set(occupation, { total: 0, defaulters: 0, balance: 0 });
    occupationStudents.set(occupation, new Set());
  }
  
  const occupationSet = occupationStudents.get(occupation);
  
  // Count unique students
  if (!occupationSet.has(admNo)) {
    occupationSet.add(admNo);
    occupationMap.get(occupation).total++;
    
    // Check if this student is a defaulter
    if (defaulterAdmissions.has(admNo)) {
      const student = students.find(s => s.admissionNo === admNo);
      occupationMap.get(occupation).defaulters++;
      occupationMap.get(occupation).balance += student.balanceAmount;
    }
  }
});

// Calculate rates and sort
const occupationWise = Array.from(occupationMap.entries())
  .map(([occupation, data]) => ({
    occupation,
    defaulterCount: data.defaulters,
    totalStudents: data.total,
    defaulterRate: (data.defaulters / data.total) × 100,
    totalBalance: data.balance,
  }))
  .sort((a, b) => b.defaulterRate - a.defaulterRate)
  .slice(0, 15); // Top 15 occupations
```

**Example:**
```
Farmers: 500 students, 150 defaulters, ₹75L balance
→ Defaulter Rate: 30% (150/500)
→ Avg Per Defaulter: ₹50k (75L/150)

Businessmen: 300 students, 45 defaulters, ₹27L balance
→ Defaulter Rate: 15% (45/300)
→ Avg Per Defaulter: ₹60k (27L/45)
```

### 3. Location-wise Analysis

**Method:** Similar to occupation, group by locality

```javascript
const locationMap = new Map();
const locationStudents = new Map();

// [Same logic as occupation-wise]

const locationWise = Array.from(locationMap.entries())
  .map(([location, data]) => ({
    location,
    defaulterCount: data.defaulters,
    totalStudents: data.total,
    defaulterRate: (data.defaulters / data.total) × 100,
    totalBalance: data.balance,
  }))
  .filter(l => l.defaulterCount > 0)
  .sort((a, b) => b.defaulterCount - a.defaulterCount)
  .slice(0, 20); // Top 20 locations
```

### 4. Class-wise Analysis

```javascript
const classMap = new Map();

students.forEach(student => {
  if (student.balanceAmount > 0) {
    const className = student.className || 'Unknown';
    if (!classMap.has(className)) {
      classMap.set(className, { defaulters: 0, balance: 0 });
    }
    classMap.get(className).defaulters++;
    classMap.get(className).balance += student.balanceAmount;
  }
});

const classWise = Array.from(classMap.entries())
  .map(([className, data]) => ({
    className,
    defaulterCount: data.defaulters,
    totalBalance: data.balance,
    avgBalance: data.balance / data.defaulters,
  }))
  .sort((a, b) => b.defaulterCount - a.defaulterCount);
```

### 5. Payment Behavior Analysis (3-Year History)

**Purpose:** Identify habitually late payers vs first-time defaulters

```javascript
const habitMap = new Map();

// Look at ALL 3 years of data (ignore yearFilter for this)
allHistoricalData.forEach(record => {
  const admNo = String(record.admNo);
  
  if (!habitMap.has(admNo)) {
    habitMap.set(admNo, {
      admissionNo: admNo,
      name: record.studentName,
      className: record.classSection,
      totalLateFeePaid: 0,
      timesLate: 0,      // How many transactions had late fee
      totalPaid: 0,
      totalDefaulterBalance: 0,
    });
  }
  
  const habit = habitMap.get(admNo);
  
  if (record.lateFee > 0) {
    habit.totalLateFeePaid += record.lateFee;
    habit.timesLate += 1;  // COUNT of transactions with late fee
  }
  
  habit.totalPaid += record.totalPaid || 0;
});

// Risk Analysis: Heavy late payers
const riskAnalysis = Array.from(habitMap.values())
  .filter(h => h.timesLate > 0)
  .sort((a, b) => {
    if (b.timesLate !== a.timesLate) {
      return b.timesLate - a.timesLate;  // By frequency
    }
    return b.totalLateFeePaid - a.totalLateFeePaid;  // Then by amount
  })
  .slice(0, 10);  // Top 10 risky payers

// Good Behavior: Reliable payers
const goodBehaviors = Array.from(habitMap.values())
  .filter(h => 
    h.timesLate === 0 &&              // Never late
    h.totalDefaulterBalance === 0 &&  // No balance
    h.totalPaid > 0                   // But they paid
  )
  .sort((a, b) => b.totalPaid - a.totalPaid)
  .slice(0, 10);  // Top 10 best payers
```

---

## Concession Analysis

**File:** `server/dataLoader.ts` → `getConcessionAnalysis(yearFilter?)`  
**Endpoint:** `GET /api/concessions/analysis?year={year}`

### 1. Overall Concession Stats

```javascript
const studentsWithConcession = students.filter(s => s.conAmount > 0);

totalConcession = SUM(students[].conAmount);
count = studentsWithConcession.length;
concessionRate = (count / totalStudents) × 100;
avgConcessionPerStudent = totalConcession / count;
```

**Example:**
```
Total Students: 1000
Students with Concession: 150
Total Concession Amount: ₹15L
Concession Rate: 15%
Avg/Student: ₹1L
```

### 2. Concession Type Distribution

**Method:** Group by concession type

```javascript
const concessionTypes = new Map();

allCollections.forEach(record => {
  const type = record.concessionType || 'NA';
  
  // Only count actual concessions (not 'NA')
  if (type !== 'NA' && record.totalConcession > 0) {
    if (!concessionTypes.has(type)) {
      concessionTypes.set(type, { 
        count: 0, 
        amount: 0, 
        defaulters: 0 
      });
    }
    
    const data = concessionTypes.get(type);
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
    defaulterRate: (data.defaulters / data.count) × 100,
  }))
  .sort((a, b) => b.totalAmount - a.totalAmount);
```

**Example:**
```
Type: "EWS (Economically Weaker Section)"
- Student Count: 80
- Total Amount: ₹8L
- Defaulter Count: 20
- Defaulter Rate: 25%
→ Indicates: EWS students defaulting more often despite concession

Type: "Staff Child"
- Student Count: 20
- Total Amount: ₹2L
- Defaulter Count: 1
- Defaulter Rate: 5%
→ Indicates: Staff children are reliable
```

---

## Payment Mode & Admission Analysis

### A. Payment Mode Analysis

**File:** `server/dataLoader.ts` → `getPaymentModeAnalysis(yearFilter?)`  
**Endpoint:** `GET /api/payment-modes/analysis?year={year}`

```javascript
const paymentModes = new Map();

allCollections.forEach(record => {
  const mode = record.receiptMode || 'Unknown';
  
  if (!paymentModes.has(mode)) {
    paymentModes.set(mode, { count: 0, amount: 0 });
  }
  
  const data = paymentModes.get(mode);
  data.count++;
  data.amount += record.totalPaid;
});

return Array.from(paymentModes.entries())
  .map(([mode, data]) => ({
    paymentMode: mode,
    transactionCount: data.count,
    totalAmount: data.amount,
    avgTransactionSize: data.amount / data.count,
  }))
  .sort((a, b) => b.totalAmount - a.totalAmount);
```

**Example Output:**
```
Online: 450 transactions, ₹22.5L collected, ₹50k avg
UPI: 320 transactions, ₹16L collected, ₹50k avg
Cash: 280 transactions, ₹14L collected, ₹50k avg
Cheque: 150 transactions, ₹7.5L collected, ₹50k avg
→ Digital (Online+UPI): 770 / 1200 = 64% (Target: 60%)
```

### B. Admission Type Analysis

**File:** `server/dataLoader.ts` → `getAdmissionTypeAnalysis(yearFilter?)`  
**Endpoint:** `GET /api/admission-types/analysis?year={year}`

```javascript
const admissionTypes = new Map();
const processedStudents = new Set();

allCollections.forEach(record => {
  const type = record.admissionType || 'Unknown';
  const admNo = String(record.admNo);
  
  if (!admissionTypes.has(type)) {
    admissionTypes.set(type, { 
      count: 0,      // Unique students
      collected: 0,  // Total paid
      defaulters: 0  // Defaulting students
    });
  }
  
  const data = admissionTypes.get(type);
  
  // Count unique students (not per transaction)
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
    defaulterRate: (data.defaulters / data.count) × 100,
  }));
```

**Example:**
```
"Regular": 850 students, ₹42.5L collected, 127 defaulters (15% rate)
"Management": 100 students, ₹5.5L collected, 20 defaulters (20% rate)
"Bridge": 50 students, ₹2L collected, 3 defaulters (6% rate)
```

---

## Extended Metrics

**File:** `server/dataLoader.ts` → `getExtendedAnalysis(yearFilter?)`

### 1. Outstanding Percentage

```javascript
const totalExpected = students.reduce((sum, s) => sum + s.dueAmount, 0);
const totalBalance = students.reduce((sum, s) => sum + s.balanceAmount, 0);

outstandingPercent = (totalBalance / totalExpected) × 100;
```

**Meaning:** % of total expected fees that remains unpaid

**Example:**
```
Expected: ₹100L
Balance: ₹25L
Outstanding %: 25%
```

### 2. Total Late Fees

```javascript
totalLateFee = SUM(allCollections[].lateFee);
```

### 3. Monthly Late Fee Trends

```javascript
const monthlyLateFeesMap = new Map();
monthMap = { 'APR': 'Apr', 'MAY': 'May', ... };

allCollections.forEach(r => {
  const monthKey = r.installment?.toUpperCase();
  const month = monthMap[monthKey];
  
  if (month && r.lateFee > 0) {
    monthlyLateFeesMap.set(
      month, 
      (monthlyLateFeesMap.get(month) || 0) + r.lateFee
    );
  }
});

monthlyLateFees = Array.from(monthlyLateFeesMap.entries()).map(([month, amount]) => ({
  month,
  amount
}));
```

### 4. Cheque Bounces

```javascript
chequeBounces = COUNT(records WHERE chequeBounceAmount > 0);
```

### 5. Re-admissions

```javascript
reAdmissions = COUNT(records WHERE 
  concessionType includes 'readmission' OR
  receiptMode includes 'readmission' OR
  admissionType includes 'readmission' OR
  admissionType === 'old'
);
```

### 6. Delay Time Buckets (Mock)

```javascript
// Currently hardcoded percentages for demonstration
delayTimeBuckets = [
  { label: '< 1 Week', count: totalRecords * 0.45 },      // 45%
  { label: '1 - 2 Weeks', count: totalRecords * 0.30 },    // 30%
  { label: '2 - 4 Weeks', count: totalRecords * 0.15 },    // 15%
  { label: '> 1 Month', count: totalRecords * 0.10 },      // 10%
];
```

**Future Enhancement:** Calculate actual delay from receiptDate vs dueDate

---

## Benchmarks

**File:** `server/dataLoader.ts` → `getBenchmarks()`

```javascript
{
  collectionRateBenchmark: 85,           // Target collection %
  defaulterRateBenchmark: 15,            // Max defaulter %
  concessionRateBenchmark: 10,           // Max concession %
  digitalAdoptionTarget: 60,             // Digital payment target
  industryAvgCollectionRate: 82,         // Industry average
  industryAvgDefaulterRate: 18,          // Industry average
}
```

**How Benchmarks are Used:**
- Compare current metrics against targets
- Color-code performance (green if above, red if below)
- Trend indicators show if improving or deteriorating

---

## Frontend Data Flow

### API Layer Endpoints

**File:** `server/routes.ts`

| Endpoint | Parameters | Returns | Cache |
|----------|-----------|---------|-------|
| `/api/dashboard` | `?year={year}` | All data in one call | 5min |
| `/api/kpi/summary` | `?year={year}` | KPI metrics | 5min |
| `/api/performance/yearly` | None | 3Y + 2F data | 5min |
| `/api/performance/monthly` | `?year={year}` | 12-month breakdown | 5min |
| `/api/defaulters/analysis` | `?year={year}` | Comprehensive defaulter data | 5min |
| `/api/concessions/analysis` | `?year={year}` | Concession breakdown | 5min |
| `/api/payment-modes/analysis` | `?year={year}` | Payment method stats | 5min |
| `/api/admission-types/analysis` | `?year={year}` | Admission type breakdown | 5min |

### React Query Hooks

**File:** `client/src/hooks/use-api.ts`

```javascript
// Main hook - fetches all data in one call
export function useDashboard(yearFilter?: string) {
  return useQuery({
    queryKey: ["dashboard", yearFilter],
    queryFn: () => fetchApi(`/dashboard${yearFilter ? `?year=${yearFilter}` : ''}`),
    staleTime: 5 * 60 * 1000,  // 5 minutes
  });
}

// Returns: DashboardData object containing:
// {
//   kpi: KPISummary,
//   benchmarks: BenchmarkData,
//   monthlyPerformance: MonthlyPerformance[],
//   yearlyPerformance: YearlyPerformance[],
//   defaulterAnalysis: DefaulterAnalysis,
//   concessionAnalysis: ConcessionAnalysis,
//   paymentModeAnalysis: PaymentModeData[],
//   admissionTypeAnalysis: AdmissionTypeData[],
//   extendedAnalysis: ExtendedAnalysis,
// }
```

### Formatting Functions

```javascript
// Currency formatting (Indian numbering)
formatCurrency(₹5000000, true)  → "₹50L"
formatCurrency(₹12500000)       → "₹1,25,00,000"

// Percentage formatting
formatPercentage(85.5)          → "85.5%"
formatPercentage(85.5, 0)       → "85%" (no decimals)

// Trend analysis
getTrendIndicator(current, benchmark)
→ { trend: 'up'|'down'|'neutral', isPositive: bool, difference: number }

// Performance coloring
getPerformanceColor(85, 80)     → 'text-emerald-600' (good if >= benchmark)
```

---

## Component Rendering Details

### 1. Dashboard.tsx

**Purpose:** Executive summary with 8 quick stat cards  
**Data Hook:** `useDashboard()`  
**Main Renders:**

```
┌─────────────────────────────────────────────────────────┐
│ DASHBOARD HEADER                                        │
│ "Fee Collection Analytics"                              │
└─────────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ Card 1   │ Card 2   │ Card 3   │ Card 4   │  (Top Row)
│ KPI      │ KPI      │ KPI      │ KPI      │
├──────────┼──────────┼──────────┼──────────┤
│ Card 5   │ Card 6   │ Card 7   │ Card 8   │  (Bottom Row)
│ KPI      │ KPI      │ KPI      │ KPI      │
└──────────┴──────────┴──────────┴──────────┘

┌─────────────────────────────────────────────────────────┐
│ TABS: Overview | Defaulters | Concessions | AI Insights │
│ Executive Overview Component rendered                    │
└─────────────────────────────────────────────────────────┘
```

**Cards:**
1. Overall Collection Rate (`kpi.collectionRate` vs benchmark)
2. Total Defaulters (`defaulterAnalysis.totalDefaulters`)
3. Habitual Defaulters (from `defaulterAnalysis.riskAnalysis`)
4. TC/Dropout Loss (calculated from extended data)
5. Concession Loss (`concessionAnalysis.totalConcession`)
6. Concession Defaulters (from `concessionAnalysis.concessionTypeWise`)
7. Digital Adoption (`kpi.digitalAdoption`)
8. Retention Rate (1 - defaulterRate)

### 2. CollectionPerformance.tsx

**Purpose:** Revenue collection trends  
**Data Hook:** `useDashboard(yearFilter)`  
**Renders:**

```
Year Filter Selector: [2023-24 | 2024-25 | 2025-26]

KPI Banner:
  ┌────────────────────────────────────────────┐
  │ Collection Overview — 2025-26              │
  │ ✓ Rate: 89.5% vs Benchmark: 85%           │
  │                                            │
  │ Collections: 96L | Expected: 110L | Out: 14L
  └────────────────────────────────────────────┘

Charts (1/2 width each):
┌──────────────────────────────┬──────────────────────────────┐
│ Monthly Collection           │ Expected vs Collected        │
│ (Area Chart)                 │ (Composed: Bars + Lines)     │
│                              │                              │
│ Shows actual receipts        │ Budget vs Reality per month  │
│ by calendar month            │                              │
├──────────────────────────────┴──────────────────────────────┤
│ Installment-wise Performance (Bar Chart, 12 months FY)      │
│                                                              │
│ Shows collection rate % per installment schedule           │
└────────────────────────────────────────────────────────────┘

Full Width:
┌─────────────────────────────────────────────────────────────┐
│ Year-on-Year Collection with Forecast (Line + Forecast)     │
│                                                              │
│ 2023-24 ─ 2024-25 ─ 2025-26 ⋯ 2026-27* ⋯ 2027-28*         │
│ *Forecast using linear regression                           │
└─────────────────────────────────────────────────────────────┘
```

**Data Calculations Shown:**
- Monthly collection rate = `(collected / (expected - concession)) × 100`
- Cumulative collection running total
- Forecast trend line (linear regression)

### 3. DefaulterAnalytics.tsx

**Purpose:** Identify at-risk students  
**Data Hook:** `useDashboard(yearFilter)`  
**Renders:**

```
Year Filter: [2023-24 | 2024-25 | 2025-26]

KPI Cards (3 columns):
  ┌──────────────┬──────────────┬──────────────┐
  │ Active       │ Total        │ Avg Defaulter│
  │ Defaulters   │ Outstanding  │ Debt         │
  │              │              │              │
  │ 250          │ ₹25L         │ ₹1L          │
  └──────────────┴──────────────┴──────────────┘

Charts (1/2 width each):
┌──────────────────────────────┬──────────────────────────────┐
│ Year-on-Year Outstanding     │ Month-on-Month Defaulters    │
│ (Area Chart)                 │ (Bar + Trend Line)           │
│                              │                              │
│ Trend of unpaid balances     │ New defaulters vs existing   │
├──────────────────────────────┴──────────────────────────────┤
│ Occupation-wise Defaulter Analysis (Horizontal Bar Chart)   │
│                                                              │
│ Shows top 10 occupations by % defaulters                   │
│ With outstanding balance per occupation                    │
└─────────────────────────────────────────────────────────────┘
```

**Data Shown:**
- `defaulterAnalysis.totalDefaulters`
- `defaulterAnalysis.totalBalance`
- `defaulterAnalysis.occupationWise[].defaulterRate`
- `monthlyPerformance[].defaulterCount`

### 4. ConcessionsLosses.tsx

**Purpose:** Revenue leakage analysis  
**Data Hook:** `useDashboard()`  
**Renders:**

```
Section Title: "Leakage & Concessions"

┌─────────────────────────────────────────────────────────────┐
│ Revenue Waterfall                                           │
│                                                              │
│ Expected → [-TC Loss] → [-Concession] → [-Pending] → Realized
│ ₹100L     ₹15L        ₹10L           ₹15L          ₹60L
│                                                              │
│ (Stacked bar showing flow)                                  │
└─────────────────────────────────────────────────────────────┘

Charts (1/2 width each):
┌──────────────────────────────┬──────────────────────────────┐
│ Class-wise Collection Rate   │ Concession Distribution      │
│ (Radar Chart)                │ (Pie Chart)                  │
│                              │                              │
│ Multi-axis showing top 8     │ By type (EWS, Staff, etc)   │
│ classes compared             │                              │
├──────────────────────────────┴──────────────────────────────┤
│ TC/Dropout by Class (Bar Chart)                             │
│                                                              │
│ Revenue lost from TC & dropouts per class                  │
└─────────────────────────────────────────────────────────────┘
```

**Data Calculated:**
- Revenue Waterfall: Collections broken down by loss sources
- Class-wise analysis from `defaulterAnalysis`
- Concession distribution from `concessionAnalysis`

### 5. ExecutiveOverview.tsx

**Purpose:** High-level KPI dashboard  
**Data Hook:** `useDashboard()`  
**Renders:**

```
Section: "Financial Vital Signs"

4 KPI Cards in Grid:
┌──────────────────────────────────────────────────────────────┐
│ ☑ Total Fee Collection      │ ✗ Active Defaulter Rate      │
│   ₹60L                        │   25%                         │
│   ↑ 5% Above Benchmark        │   ↑ 10% Above Target          │
│                                                                │
│ ☑ Revenue Lost (TCs)        │ ✗ Digital Adoption           │
│   ₹15L                        │   64%                         │
│   📊 45 students withdrawn    │   ✓ Above Target: 60%         │
└──────────────────────────────────────────────────────────────┘

Line Charts (sparklines for each card):
- Positive trend: upward slope (green)
- Negative trend: downward slope (red)

Large Chart Section:
┌──────────────────────────────┬──────────────────────────────┐
│ YoY Performance (Line)        │ Defaulter Distribution (Pie) │
│                              │                              │
│ 2023 → 2024 → 2025           │ Habitual Defaulters          │
│                              │ First-Time Late              │
│ Shows trend of all metrics   │ Concession Beneficiaries     │
└──────────────────────────────┴──────────────────────────────┘

Location Risk Map:
  [Geographic visualization of defaulters by location]
```

### 6. LeakageConcessions.tsx

**Purpose:** In-depth concession & loss analysis  
**Data Hook:** `useDashboard()`  
**Similar layout to ConcessionsLosses.tsx**

---

## Calculation Examples

### Example 1: Monthly Collection Rate Calculation

**Scenario:**
```
Month: June

Fee Schedule (Promised):
├─ Tuition: ₹5L
├─ Games: ₹2L
└─ Extra-Curricular: ₹1L
Total Expected: ₹8L
Concession promised: 10% = ₹0.8L

Target net expected: ₹8L - ₹0.8L = ₹7.2L

Actual Receipts (received in June):
├─ From students who paid June installment: ₹6L
├─ From students paying late: ₹0.5L
└─ Other: ₹0.2L
Total Collected: ₹6.7L

Collection Rate = (6.7 / 7.2) × 100 = 93%
```

### Example 2: Occupation-wise Defaulter Analysis

**Data:**
```
Farmers (Admission Nos: 101, 102, 103, 104, 105):
- Transaction records: 500+ records from all 3 years
- Unique students: 100

Who paid fully: 60 students (no balance)
Who defaulted: 40 students (balance > 0)
Total outstanding: ₹20L

Calculation:
- Total Farmers: 100
- Defaulters: 40
- Defaulter Rate: (40 / 100) × 100 = 40%
- Avg per Defaulter: ₹20L / 40 = ₹5L

Output (sorted high to low):
1. Farmers: 40 defaulters, 40% rate, ₹20L total
2. Businessmen: 18 defaulters, 25% rate, ₹12L total
3. Laborers: 35 defaulters, 22% rate, ₹11L total
```

### Example 3: Payment Mode Digital Adoption

**Data from 1200 total transactions:**
```
Payment Modes:
- Online: 450 transactions
- UPI: 320 transactions
- Cash: 280 transactions
- Cheque: 150 transactions

Digital = Online + UPI + Bank Transfer
Total Digital: 450 + 320 = 770
Total Payments: 1200

Digital Adoption = (770 / 1200) × 100 = 64%

Against Target: 60%
Status: ✓ Exceeds target by 4%
```

### Example 4: Yearly Forecast Using Regression

**Historical Data:**
```
2023-24: Expected = 100L, Collected = 80L (Rate: 80%)
2024-25: Expected = 110L, Collected = 88L (Rate: 80%)
2025-26: Expected = 120L, Collected = 96L (Rate: 80%)

Linear Regression:
- Expected trend: +10L per year
- Collection trend: +8L per year

Forecast:
2026-27: Expected = 130L, Collected = 104L (Rate: 80%)
2027-28: Expected = 140L, Collected = 112L (Rate: 80%)

Confidence: Assumes continued linear trend
```

---

## Summary Table

| Metric | Formula | Source | Type | Benchmark |
|--------|---------|--------|------|-----------|
| Collection Rate | (Paid / (Expected - Concession)) × 100 | KPI | % | 85% |
| Defaulter Rate | (Defaulters / Total Students) × 100 | KPI | % | <15% |
| Concession Rate | (Concession / Expected) × 100 | KPI | % | <10% |
| Digital Adoption | (Online + UPI + Bank) / Total × 100 | KPI | % | 60% |
| Outstanding % | (Balance / Expected) × 100 | Extended | % | - |
| Occupational Rate | Per group defaulters / total × 100 | Defaulter | % | - |
| Payment Mode % | Mode Count / Total × 100 | Payment | % | - |
| Monthly Rate | Month collected / net expected × 100 | Performance | % | - |

---

## Key Takeaways for Team Presentation

1. **Collection Rate is the PRIMARY KPI** - Shows real effectiveness
2. **Defaulter Rate reveals problem students** - Target <15%
3. **Monthly breakdown shows seasonal patterns** - April peaks, March dips
4. **Occupation-wise identifies socioeconomic patterns** - Risk segmentation
5. **Payment modes track digital transformation** - Shift to online payments
6. **Forecast predicts next 2 years** - Linear regression trend
7. **Concession impact measured** - Who defaults despite subsidy
8. **3-year payment habits** - Identify chronic late payers vs reliable students
9. **Geographic analysis** - Location-based risk zones
10. **Class-wise collection** - Academic class performance patterns

---

**End of Document**
