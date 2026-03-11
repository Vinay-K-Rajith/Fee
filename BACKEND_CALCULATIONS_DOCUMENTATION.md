# Backend Calculations Documentation
## Fee Insights Dashboard - Complete Calculation Reference

**Version:** 1.0  
**Last Updated:** March 6, 2026

---

## Table of Contents
1. [Data Sources](#data-sources)
2. [KPI Summary Calculations](#kpi-summary-calculations)
3. [Performance Analysis Calculations](#performance-analysis-calculations)
4. [Defaulter Analysis Calculations](#defaulter-analysis-calculations)
5. [Concession Analysis Calculations](#concession-analysis-calculations)
6. [TC/Dropout Analysis Calculations](#tcdropout-analysis-calculations)
7. [Class-wise Analysis Calculations](#class-wise-analysis-calculations)
8. [Installment Analysis Calculations](#installment-analysis-calculations)
9. [Revenue Waterfall Calculations](#revenue-waterfall-calculations)
10. [Fee Pay Masters Calculations](#fee-pay-masters-calculations)
11. [Benchmarks](#benchmarks)
12. [Action Recommendations](#action-recommendations)

---

## Data Sources

### FeeCollection.xlsx (Primary Data Source)
Contains detailed transaction-level fee collection records with 28 columns:

| Column | Field | Description |
|--------|-------|-------------|
| 0 | srNo | Serial number |
| 1 | admissionNo | Unique student identifier |
| 2 | studentName | Student's full name |
| 3 | className | Class/grade |
| 4 | installmentName | Installment identifier |
| 5-12 | Fee Components | Late fee, readmission, excess, security, application, one-time, annual, extra-curricular |
| 13 | occupation | Parent's occupation |
| 14 | salarySlab | Parent's salary range |
| 15 | location | Geographic location |
| 16 | concessionPercent | Concession percentage (e.g., "10%") |
| 17 | totalStructure | Total fee structure amount |
| 18-22 | Concession Components | Concessions on security, application, one-time, annual, extra-curricular |
| 23 | totalConcession | Total concession amount |
| 24 | totalExpected | Expected fee amount (structure - concession) |
| 25 | paidTcDropout | Amount paid by TC/dropout students |
| 26 | paidActive | Amount paid by active students |
| 27 | balance | Pending balance (expected - paid) |
| 28 | paymentDate | Excel serial date of payment |

### StudentWisexlsx.xlsx (Summary Data Source)
Contains consolidated student-level summary with 9 columns:

| Column | Field | Description |
|--------|-------|-------------|
| 0 | srNo | Serial number |
| 1 | admissionNo | Unique student identifier |
| 2 | name | Student name |
| 3 | className | Class/grade |
| 4 | fatherName | Father's name |
| 5 | dueAmount | Total amount due |
| 6 | conAmount | Total concession received |
| 7 | paidAmount | Total amount paid |
| 8 | balanceAmount | Outstanding balance |

---

## KPI Summary Calculations

**Endpoint:** `GET /api/kpi/summary`

### Metrics Calculated:

#### 1. Total Fee Collection
```typescript
totalFeeCollection = SUM(students.paidAmount)
```
- **Source:** StudentWisexlsx.xlsx
- **Logic:** Sum of all payments made by all students
- **Type:** Currency (₹)

#### 2. Total Expected Revenue
```typescript
totalExpected = SUM(students.dueAmount)
```
- **Source:** StudentWisexlsx.xlsx
- **Logic:** Sum of all due amounts (fee structure minus concessions)
- **Type:** Currency (₹)

#### 3. Collection Rate
```typescript
collectionRate = (totalPaid / (totalExpected - totalConcession)) × 100
```
- **Formula Breakdown:**
  - Numerator: Total amount collected
  - Denominator: Expected amount after concessions
- **Type:** Percentage (%)
- **Example:** If expected = ₹100L, concession = ₹10L, paid = ₹72L
  - Rate = (72 / (100-10)) × 100 = 80%

#### 4. Total Defaulters Count
```typescript
totalDefaulters = COUNT(students WHERE balanceAmount > 0)
```
- **Logic:** Students with any pending balance
- **Type:** Integer count

#### 5. Defaulter Rate
```typescript
defaulterRate = (totalDefaulters / totalStudents) × 100
```
- **Type:** Percentage (%)
- **Example:** 250 defaulters / 1000 students = 25%

#### 6. Total Concession Amount
```typescript
totalConcession = SUM(students.conAmount)
```
- **Type:** Currency (₹)

#### 7. Concession Rate
```typescript
concessionRate = (totalConcession / totalExpected) × 100
```
- **Logic:** Percentage of expected revenue given as concessions
- **Type:** Percentage (%)

#### 8. TC/Dropout Loss
```typescript
tcDropoutLoss = SUM(feeData.balance WHERE paidTcDropout > 0)
```
- **Logic:** Total uncollected balance from students who got TC or dropped out
- **Type:** Currency (₹)

#### 9. TC/Dropout Count
```typescript
tcDropoutCount = COUNT(DISTINCT(admissionNo) WHERE paidTcDropout > 0)
```
- **Logic:** Unique students who paid at least some amount and then got TC/dropped
- **Type:** Integer count

#### 10. Digital Adoption
```typescript
digitalAdoption = 34 // Hardcoded placeholder
```
- **Note:** This is currently a placeholder value
- **Future Enhancement:** Should be calculated from actual payment mode data
- **Type:** Percentage (%)

#### 11. Active Students
```typescript
activeStudents = totalStudents - tcDropoutCount
```
- **Type:** Integer count

#### 12. Total Balance
```typescript
totalBalance = SUM(students.balanceAmount)
```
- **Type:** Currency (₹)

---

## Performance Analysis Calculations

### Monthly Performance
**Endpoint:** `GET /api/performance/monthly`

Returns month-wise breakdown for academic year (Apr-Mar).

#### Monthly Distribution Factors
```typescript
monthlyFactors = [
  0.12, // April (12% of annual collection)
  0.10, // May (10%)
  0.08, // June (8%)
  0.08, // July (8%)
  0.07, // August (7%)
  0.07, // September (7%)
  0.09, // October (9%)
  0.08, // November (8%)
  0.08, // December (8%)
  0.09, // January (9%)
  0.08, // February (8%)
  0.06  // March (6%)
]
```

#### Month-wise Metrics:

1. **Total Expected (Monthly)**
```typescript
monthExpected = totalExpected × monthlyFactor × 1.2
```
- Multiplied by 1.2 to account for installment structure

2. **Total Collected (Monthly)**
```typescript
monthCollected = totalFeeCollection × monthlyFactor
```

3. **Collection Rate (Monthly)**
```typescript
monthCollectionRate = 75 + random(0, 15)
```
- **Note:** Currently simulated with random variation
- **Range:** 75% to 90%

4. **Cumulative Collection**
```typescript
cumulativeCollection = SUM(monthCollected[0] to monthCollected[current])
```

5. **Defaulter Count (Monthly)**
```typescript
monthDefaulters = totalDefaulters × (1 - monthlyFactor × 8) + random(0, 50)
```

6. **New Defaulters (Monthly)**
```typescript
newDefaulters = random(0, 30)
```
- **Note:** Currently simulated

7. **TC/Dropouts (Monthly)**
```typescript
monthTcDropouts = random(0, 5)
```
- **Note:** Currently simulated

8. **Concession Given (Monthly)**
```typescript
monthConcession = totalConcession × monthlyFactor
```

### Yearly Performance
**Endpoint:** `GET /api/performance/yearly`

Returns year-over-year comparison for 4 academic years.

#### Growth Factors
```typescript
years = ['2021-22', '2022-23', '2023-24', '2024-25']
growthFactors = [0.75, 0.85, 0.95, 1.00]
```

#### Yearly Metrics:

1. **Total Expected (Yearly)**
```typescript
yearExpected = currentTotalExpected × growthFactor
```

2. **Total Collected (Yearly)**
```typescript
yearCollected = currentTotalCollected × growthFactor × (0.9 + random(0, 0.1))
```

3. **Collection Rate (Yearly)**
```typescript
yearCollectionRate = 78 + (yearIndex × 1.5) + random(0, 2)
```
- Showing progressive improvement over years

4. **Defaulter Count (Yearly)**
```typescript
yearDefaulters = currentDefaulters × (1.3 - yearIndex × 0.1)
```
- Showing improvement trend (reduction in defaulters)

5. **Defaulter Rate (Yearly)**
```typescript
yearDefaulterRate = currentDefaulterRate × (1.2 - yearIndex × 0.05)
```

6. **TC/Dropout Loss (Yearly)**
```typescript
yearTcLoss = currentTcLoss × growthFactor
```

7. **Concession Given (Yearly)**
```typescript
yearConcession = currentConcession × growthFactor
```

---

## Defaulter Analysis Calculations

**Endpoint:** `GET /api/defaulters/analysis`

### Core Defaulter Identification
```typescript
defaulterAdmissions = SET(students WHERE balanceAmount > 0)
```

### Overall Metrics:

#### 1. Total Defaulters
```typescript
totalDefaulters = COUNT(students WHERE balanceAmount > 0)
```

#### 2. Habitual Defaulters
Students with multiple pending installments:
```typescript
// Count pending installments per student
FOR EACH student:
  pendingInstallments = COUNT(feeRecords WHERE admissionNo = student.id AND balance > 0)
  IF pendingInstallments > 1:
    habitualDefaulters++
```

#### 3. First-Time Defaulters
```typescript
firstTimeDefaulters = totalDefaulters - habitualDefaulters
```

#### 4. Concession Beneficiary Defaulters
```typescript
concessionDefaulters = COUNT(students WHERE conAmount > 0 AND balanceAmount > 0)
```

#### 5. Critical Delinquency
Students with >3 months pending (estimated):
```typescript
criticalDelinquency = FLOOR(totalDefaulters × 0.15)
```

#### 6. Average Delay Days
```typescript
avgDelayDays = 22 // Placeholder - requires actual payment date tracking
```

### Occupation-wise Defaulters
**Endpoint:** `GET /api/defaulters/occupation`

#### Algorithm:
```typescript
FOR EACH unique student:
  occupation = student.occupation || 'Unknown'
  
  occupationMap[occupation].total++
  
  IF student.admissionNo IN defaulterAdmissions:
    occupationMap[occupation].defaulters++
    occupationMap[occupation].balance += student.balanceAmount
```

#### Metrics per Occupation:
```typescript
{
  occupation: string,
  defaulterCount: number,
  totalStudents: number,
  defaulterRate: (defaulters / totalStudents) × 100,
  totalBalance: sum of all balances for this occupation
}
```
- **Sorted by:** Defaulter rate (descending)

### Location-wise Defaulters
**Endpoint:** `GET /api/defaulters/location`

#### Location Extraction:
```typescript
locationArea = location.split(' ')[0] // Extract first word (area name)
```

#### Algorithm:
```typescript
FOR EACH unique student:
  area = location.split(' ')[0] || 'Unknown'
  
  locationMap[area].total++
  
  IF student.admissionNo IN defaulterAdmissions:
    locationMap[area].defaulters++
    locationMap[area].balance += student.balanceAmount
```

#### Metrics per Location:
```typescript
{
  location: string,
  defaulterCount: number,
  totalStudents: number,
  defaulterRate: (defaulters / totalStudents) × 100,
  totalBalance: sum of all balances for this location
}
```
- **Sorted by:** Defaulter rate (descending)

### Salary Slab-wise Defaulters
**Endpoint:** `GET /api/defaulters/salary-slab`

#### Algorithm:
```typescript
FOR EACH unique student:
  salarySlab = student.salarySlab || 'Unknown'
  
  salaryMap[salarySlab].total++
  
  IF student.admissionNo IN defaulterAdmissions:
    salaryMap[salarySlab].defaulters++
    salaryMap[salarySlab].balance += student.balanceAmount
```

#### Metrics per Salary Slab:
```typescript
{
  salarySlab: string,
  defaulterCount: number,
  totalStudents: number,
  defaulterRate: (defaulters / totalStudents) × 100,
  totalBalance: sum of all balances for this slab
}
```
- **Sorted by:** Defaulter rate (descending)

### Class-wise Defaulters
**Endpoint:** `GET /api/defaulters/class`

#### Algorithm:
```typescript
FOR EACH unique student:
  className = student.className || 'Unknown'
  
  classMap[className].total++
  classMap[className].paid += student.paidActive
  classMap[className].expected += student.totalExpected
  
  IF student.admissionNo IN defaulterAdmissions:
    classMap[className].defaulters++
    classMap[className].balance += student.balanceAmount
```

#### Metrics per Class:
```typescript
{
  className: string,
  defaulterCount: number,
  totalStudents: number,
  defaulterRate: (defaulters / totalStudents) × 100,
  totalBalance: sum of all balances,
  collectionRate: (paid / expected) × 100
}
```
- **Sorted by:** Defaulter rate (descending)

---

## Concession Analysis Calculations

**Endpoint:** `GET /api/concessions/analysis`

### Overall Concession Metrics:

#### 1. Total Concession Given
```typescript
totalConcessionGiven = SUM(students.conAmount)
```

#### 2. Concession Rate
```typescript
concessionRate = (totalConcession / totalExpected) × 100
```
- **Interpretation:** Percentage of expected revenue waived as concessions

#### 3. Students with Concession
```typescript
studentsWithConcession = COUNT(students WHERE conAmount > 0)
```

#### 4. Concession Defaulters
```typescript
concessionDefaulters = COUNT(students WHERE conAmount > 0 AND balanceAmount > 0)
```

#### 5. Concession Defaulter Rate
```typescript
concessionDefaulterRate = (concessionDefaulters / studentsWithConcession) × 100
```
- **Critical Metric:** Shows if concession beneficiaries are paying their dues

### Concession by Category

#### Algorithm:
```typescript
FOR EACH unique student:
  category = student.concessionPercent // e.g., "10%", "25%", "50%"
  
  IF category != "0%":
    concessionCategories[category].count++
    concessionCategories[category].amount += student.totalConcession
```

#### Metrics per Category:
```typescript
{
  category: string (e.g., "10%", "25%"),
  amount: total concession amount,
  studentCount: number of students,
  percentage: (categoryAmount / totalConcession) × 100
}
```
- **Sorted by:** Amount (descending)
- **Filters out:** "0%" category

### Monthly Concession Trend

#### Distribution:
```typescript
months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

FOR EACH month:
  monthFactor = 0.08 + random(0, 0.04) // 8-12% per month
  
  monthStandard = totalConcession × monthFactor × 0.7   // 70% standard concessions
  monthUnplanned = totalConcession × monthFactor × 0.3  // 30% unplanned concessions
  monthTotal = monthStandard + monthUnplanned
```

#### Breakdown:
- **Standard Concessions:** Pre-approved merit/need-based (70%)
- **Unplanned Concessions:** Ad-hoc waivers (30%)

---

## TC/Dropout Analysis Calculations

**Endpoint:** `GET /api/tc-dropout/analysis`

### TC/Dropout Identification:
```typescript
tcDropouts = feeRecords WHERE paidTcDropout > 0
uniqueTcStudents = DISTINCT(tcDropouts.admissionNo)
```

### Overall TC/Dropout Metrics:

#### 1. Total TC/Dropouts
```typescript
totalTcDropouts = COUNT(uniqueTcStudents)
```

#### 2. Revenue Loss
```typescript
revenueLoss = SUM(balance WHERE paidTcDropout > 0)
```
- **Logic:** Total uncollected amount from students who left

#### 3. Retention Rate
```typescript
retentionRate = ((totalStudents - uniqueTcStudents) / totalStudents) × 100
```

### TC/Dropout by Class

#### Algorithm:
```typescript
FOR EACH tcDropoutRecord:
  className = record.className || 'Unknown'
  
  classMap[className].tcCount++
  classMap[className].revenueLoss += record.balance
```

#### Metrics per Class:
```typescript
{
  className: string,
  tcCount: number of TC students,
  dropoutCount: number of dropout students,
  revenueLoss: total uncollected amount
}
```
- **Sorted by:** Revenue loss (descending)

### Monthly TC/Dropout Trend

Currently simulated:
```typescript
FOR EACH month:
  monthTcCount = random(0, 5)
  monthDropoutCount = random(0, 2)
  monthRevenueLoss = (totalRevenueLoss / 12) × (0.5 + random(0, 1))
```
- **Note:** Requires actual date-based tracking for accurate monthly data

---

## Class-wise Analysis Calculations

**Endpoint:** `GET /api/class-wise/analysis`

### Aggregation by Class:

#### Algorithm:
```typescript
FOR EACH student IN studentSummaryData:
  className = student.className || 'Unknown'
  
  classMap[className].totalStudents++
  classMap[className].totalExpected += student.dueAmount
  classMap[className].totalCollected += student.paidAmount
  classMap[className].concessionAmount += student.conAmount
  
  IF student.balanceAmount > 0:
    classMap[className].defaulterCount++
```

#### Add TC/Dropout Data:
```typescript
FOR EACH tcRecord WHERE paidTcDropout > 0:
  className = tcRecord.className || 'Unknown'
  classMap[className].tcDropouts++
```

### Metrics per Class:
```typescript
{
  className: string,
  totalStudents: number,
  totalExpected: sum of due amounts,
  totalCollected: sum of paid amounts,
  collectionRate: (totalCollected / totalExpected) × 100,
  defaulterCount: students with balance > 0,
  concessionAmount: total concession for class,
  tcDropouts: number of TC/dropout students
}
```
- **Sorted by:** Class name (alphabetical)

---

## Installment Analysis Calculations

**Endpoint:** `GET /api/installments/analysis`

### Aggregation by Installment:

#### Algorithm:
```typescript
FOR EACH feeRecord IN feeCollectionData:
  installmentName = record.installmentName || 'Unknown'
  
  installmentMap[installmentName].totalExpected += record.totalExpected
  installmentMap[installmentName].totalCollected += record.paidActive
  
  IF record.balance > 0:
    installmentMap[installmentName].defaulterCount++
```

### Metrics per Installment:
```typescript
{
  installmentName: string,
  totalExpected: sum of expected amounts,
  totalCollected: sum of collected amounts,
  collectionRate: (totalCollected / totalExpected) × 100,
  defaulterCount: records with pending balance
}
```

---

## Revenue Waterfall Calculations

**Endpoint:** `GET /api/revenue/waterfall`

Shows step-by-step revenue realization from expected to actual.

### Waterfall Components:

```typescript
{
  expectedRevenue: totalExpected,                    // Starting point
  tcLoss: -tcDropoutRevenueLoss,                     // Subtract TC losses
  dropoutLoss: -(tcDropoutRevenueLoss × 0.3),        // 30% of TC loss attributed to dropouts
  concessionLoss: -totalConcession,                  // Subtract concessions
  pendingBalance: -totalBalance,                     // Outstanding balance
  realizedRevenue: totalFeeCollection                // Final collected amount
}
```

### Flow Visualization:
```
Expected Revenue
    ↓ (minus TC Loss)
    ↓ (minus Dropout Loss)
    ↓ (minus Concessions)
    ↓ (minus Pending Balance)
Realized Revenue
```

### Verification:
```typescript
expectedRevenue - tcLoss - dropoutLoss - concessionLoss - pendingBalance ≈ realizedRevenue
```

---

## Fee Pay Masters Calculations

**Endpoint:** `GET /api/fee-pay-masters`

Identifies reliable payer profiles based on occupation, location, and salary.

### Reliable Payer Criteria:
```typescript
reliablePayer = balance === 0 AND paidActive > 0
```

### Grouping Logic:
```typescript
FOR EACH uniqueStudent WHERE balance === 0 AND paidActive > 0:
  groupKey = occupation + "|" + locationArea + "|" + salarySlab
  
  groups[groupKey].students.push(student)
  groups[groupKey].occupation = occupation
  groups[groupKey].location = locationArea
  groups[groupKey].salarySlab = salarySlab
```

### Metrics per Group:
```typescript
{
  occupation: string,
  location: string,
  salarySlab: string,
  studentCount: number of students in group,
  totalPaid: sum of all payments by group,
  avgPaymentDays: 15 + random(0, 10),  // Simulated, needs actual data
  reliabilityScore: 85 + random(0, 15)  // Simulated, needs actual data
}
```

### Filtering & Sorting:
```typescript
// Filter: Only groups with 3+ students
payMasters = groups.filter(g => g.studentCount >= 3)

// Sort: By reliability score (descending)
payMasters.sort((a, b) => b.reliabilityScore - a.reliabilityScore)

// Limit: Top 20
payMasters = payMasters.slice(0, 20)
```

---

## Benchmarks

**Endpoint:** `GET /api/benchmarks`

Industry-standard benchmarks for comparison.

### Benchmark Values:
```typescript
{
  collectionRateBenchmark: 90,      // Target: 90% collection rate
  defaulterRateBenchmark: 10,       // Target: <10% defaulters
  concessionRateBenchmark: 5,       // Target: <5% concessions
  retentionRateBenchmark: 95,       // Target: 95% retention
  digitalAdoptionBenchmark: 75,     // Target: 75% digital payments
  quarterlyCollectionBenchmark: 45  // Target: 45% per quarter
}
```

---

## Action Recommendations

**Endpoint:** `GET /api/recommendations`

AI-driven or rule-based recommendations based on KPI analysis.

### Recommendation Categories:
1. Collection Strategy
2. Defaulter Management
3. Risk Segmentation
4. Geographic Targeting
5. Concession Management
6. Digital Transformation
7. Communication
8. Revenue Growth

### Recommendation Generation Logic:

#### 1. Collection Rate Below Benchmark
```typescript
IF collectionRate < benchmarkCollectionRate:
  RECOMMEND: "Strengthen Digital Payment Systems"
  PRIORITY: high
  IMPACT: Potential improvement = (benchmark - current) × totalExpected
```

#### 2. Defaulter Rate Above Benchmark
```typescript
IF defaulterRate > benchmarkDefaulterRate:
  RECOMMEND: "Reduce Fee Defaulters"
  PRIORITY: high
  TARGET: Reduce by (currentRate - benchmarkRate) × totalStudents students
```

#### 3. High-Risk Occupations
```typescript
highRiskOccupations = occupations WHERE defaulterRate > 20%

IF highRiskOccupations.length > 0:
  RECOMMEND: "Occupation-wise Payment Plans"
  PRIORITY: medium
  FOCUS: Top 3 high-risk occupations
```

#### 4. High-Risk Locations
```typescript
highRiskLocations = locations WHERE defaulterRate > 15%

IF highRiskLocations.length > 0:
  RECOMMEND: "Location-wise Outreach"
  PRIORITY: medium
  FOCUS: Top 3 high-risk locations
```

#### 5. Concession Defaulters
```typescript
IF concessionDefaulterRate > 10%:
  RECOMMEND: "Review Concession Policy"
  PRIORITY: medium
  ISSUE: Beneficiaries not meeting payment obligations
```

#### 6. Low Digital Adoption
```typescript
IF digitalAdoption < benchmarkDigitalAdoption:
  RECOMMEND: "Increase Digital Adoption"
  PRIORITY: medium
  IMPACT: Reduce admin workload by 40%
```

#### 7. Communication Automation (Always Recommended)
```typescript
RECOMMEND: "Automate Fee Reminders"
PRIORITY: high
IMPACT: Improve on-time payments by 20-25%
```

#### 8. Revenue Diversification (Always Recommended)
```typescript
RECOMMEND: "Diversify Revenue Streams"
PRIORITY: low
IMPACT: Generate 5-10% additional revenue
```

### Recommendation Structure:
```typescript
{
  id: string,
  category: string,
  priority: 'high' | 'medium' | 'low',
  title: string,
  description: string,
  impact: string,
  implementation: string[] // Array of actionable steps
}
```

---

## Additional Endpoints

### Dashboard Aggregate
**Endpoint:** `GET /api/dashboard`

Returns all analytics in a single API call:
```typescript
{
  kpi: getKPISummary(),
  benchmarks: getBenchmarks(),
  monthlyPerformance: getMonthlyPerformance(),
  yearlyPerformance: getYearlyPerformance(),
  defaulterAnalysis: getDefaulterAnalysis(),
  concessionAnalysis: getConcessionAnalysis(),
  tcDropoutAnalysis: getTcDropoutAnalysis(),
  classWiseAnalysis: getClassWiseAnalysis(),
  installmentAnalysis: getInstallmentAnalysis(),
  revenueWaterfall: getRevenueWaterfall(),
  recommendations: getActionRecommendations()
}
```

### Geocoding
**Endpoint:** `GET /api/geocode?location={location}`

Proxies Nominatim API to convert location names to coordinates:
```typescript
REQUEST: https://nominatim.openstreetmap.org/search
PARAMS: format=json, q={location}, India, limit=1

RESPONSE:
{
  lat: number,
  lng: number
}
```

### AI Chat
**Endpoint:** `POST /api/ai/chat`

Uses Google Gemini AI for natural language queries:

#### Request Body:
```typescript
{
  prompt: string,      // User's question
  context?: string     // Optional context
}
```

#### Enriched Context:
```typescript
enrichedContext = context + "\n\n" + 
  "STUDENT DATA DIRECTORY:\n" + 
  JSON.stringify(allStudentsData)
```

#### Response:
```typescript
{
  text: string  // AI-generated response
}
```

---

## Data Processing Notes

### Unique Student Extraction
```typescript
getUniqueStudents():
  // For fee collection data, get latest record per student
  FOR EACH record:
    existing = studentMap.get(admissionNo)
    IF !existing OR record.srNo > existing.srNo:
      studentMap.set(admissionNo, record)
  
  RETURN studentMap
```

### Data Consistency Rules

1. **Defaulter Identification:** Always use StudentSummary.balanceAmount > 0
2. **Balance Amounts:** Always use StudentSummary.balanceAmount for aggregations
3. **Unique Students:** Use Map with admissionNo as key
4. **TC/Dropout:** Identified by paidTcDropout > 0 in FeeCollection data

### Simulation Notes

Some metrics are currently simulated due to data limitations:

- **Monthly payment patterns:** Distributed using predefined factors
- **Historical yearly data:** Generated using growth factors
- **Average payment delay days:** Fixed placeholder value
- **Digital adoption rate:** Fixed placeholder value
- **Reliability scores:** Randomized within realistic range
- **Monthly TC/dropout counts:** Randomized within typical range

### Future Enhancements

To make calculations more accurate:

1. **Payment Date Tracking:** Implement proper date-based analysis
2. **Payment Mode Data:** Track cash/digital payments for accurate digital adoption
3. **Historical Data:** Store actual monthly/yearly data instead of simulation
4. **Reliability Metrics:** Calculate based on actual payment history
5. **Predictive Analytics:** Use ML models for defaulter prediction
6. **Real-time Updates:** Implement incremental calculations instead of full recalculation

---

## File Locations

- **Main Router:** `server/routes.ts`
- **Data Loader & Calculations:** `server/dataLoader.ts`
- **AI Service:** `server/services/ai.service.ts`
- **Data Files:**
  - `FeeCollection.xlsx` (root directory)
  - `StudentWisexlsx.xlsx` (root directory)

---

## Technical Stack

- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **Excel Parsing:** XLSX library
- **AI Model:** Google Gemini Flash Lite
- **Data Structures:** Maps for aggregation, Arrays for sorting

---

**End of Documentation**
