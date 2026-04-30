# Fee Receipts API Split (Production, POST-Only)

This document is inspired by the split design shared and mapped to the current Fee Insights codebase usage.
Scope is strictly non-AI and POST-only.

## 1) API Design Principle

- Only POST endpoints are allowed.
- Keep dashboard load fast by separating summary, monthly chart, installment timeline, and drill-down data.
- All responses must be deterministic and based on fee receipt records.

## 2) Proposed API Split (Based on Current Dashboard Needs)

### 2.1 `POST /api/feeReceipts/getSummary` (loads first)

Use for top KPI cards and quick stats.

Request:

```json
{
  "academicYear": "2025-26"
}
```

Response (aggregated):

```json
{
  "totalCollected": 0,
  "totalExpected": 0,
  "collectionRate": 0,
  "outstandingAmount": 0,
  "activeDefaultersCount": 0,
  "defaulterRate": 0,
  "digitalAdoption": 0,
  "totalConcession": 0,
  "concessionRate": 0,
  "busUsersCount": 0
}
```

### 2.2 `POST /api/feeReceipts/getMonthlyCollection`

Use for month-on-month collection chart (receipt date based).

Request:

```json
{
  "academicYear": "2025-26"
}
```

Response (max 12 rows, Apr-Mar):

```json
{
  "rows": [
    {
      "month": "Apr",
      "monthNum": 1,
      "totalExpected": 0,
      "totalCollected": 0,
      "collectionRate": 0,
      "cumulativeCollection": 0,
      "defaulterCount": 0,
      "latePaymentCount": 0,
      "concessionGiven": 0
    }
  ]
}
```

### 2.3 `POST /api/feeReceipts/getInstallmentTimeline`

Use for installment-wise payment behavior, penalties, and fee head summaries.

Request:

```json
{
  "academicYear": "2025-26"
}
```

Response:

```json
{
  "timelineStats": [
    {
      "installment": "APR",
      "medianPaymentDate": "2025-04-12",
      "lastPaymentDate": "2025-05-20",
      "paidBefore15th": 0,
      "paidAfter15th": 0
    }
  ],
  "delayTimeBuckets": [
    {
      "id": "1_week",
      "label": "< 1 Week",
      "count": 0,
      "breakdown": [
        { "mode": "Online", "count": 0 }
      ]
    }
  ],
  "totalLateFee": 0,
  "lateFeeCount": 0,
  "maxLateFee": 0,
  "avgLateFee": 0,
  "chequeBounces": 0,
  "reAdmissions": 0,
  "headwiseFees": {
    "tuition": 0,
    "bus": 0,
    "admission": 0,
    "others": 0
  }
}
```

### 2.4 `POST /api/feeReceipts/getDefaulterStats`

Use for defaulter count, outstanding trend, risk segmentation (not full student dump).

Request:

```json
{
  "academicYear": "2025-26"
}
```

Response (aggregated):

```json
{
  "totalDefaulters": 0,
  "activeDefaultersCount": 0,
  "totalBalance": 0,
  "occupationWise": [
    {
      "occupation": "Service",
      "defaulterCount": 0,
      "totalStudents": 0,
      "defaulterRate": 0,
      "totalBalance": 0
    }
  ],
  "locationWise": [
    {
      "location": "Hiran Magri",
      "defaulterCount": 0,
      "totalStudents": 0,
      "defaulterRate": 0,
      "totalBalance": 0
    }
  ],
  "classWise": [
    {
      "className": "10-A",
      "defaulterCount": 0,
      "totalBalance": 0,
      "avgBalance": 0
    }
  ]
}
```

### 2.5 `POST /api/feeReceipts/getReceiptDetails`

Use only on drill-down (table/details page), paginated and filterable.

Request:

```json
{
  "academicYear": "2025-26",
  "page": 1,
  "pageSize": 50,
  "filters": {
    "installment": "APR",
    "receiptMode": "Online",
    "admissionType": "New",
    "currentStatus": "Active",
    "search": "A10234"
  }
}
```

Response:

```json
{
  "page": 1,
  "pageSize": 50,
  "totalRecords": 0,
  "rows": [
    {
      "receiptDate": "2025-04-10",
      "receiptNo": "RCP-0001",
      "admissionNo": "A10234",
      "studentName": "Student Name",
      "fatherOccupation": "Service",
      "locality": "Hiran Magri",
      "classSection": "10-A",
      "installment": "APR",
      "totalStructuredAmount": 50000,
      "concessionPercent": 10,
      "concessionType": "Sibling",
      "totalPayableAmount": 45000,
      "dueDate": "2025-04-15",
      "receiptMode": "Online",
      "admissionType": "New",
      "discountAmount": 2000,
      "chequeBounceAmount": 0,
      "lateFee": 0,
      "readmissionFee": 0,
      "busFee": 3000,
      "excessAmount": 0,
      "schoolFees": 42000,
      "admissionFee": 3000,
      "totalPaid": 45000,
      "totalConcession": 5000,
      "totalFees": 50000,
      "currentStatus": "Active"
    }
  ]
}
```

## 3) Canonical Fee Attributes Required (Per Receipt Row)

1. `receiptDate`
2. `receiptNo`
3. `admissionNo`
4. `studentName`
5. `fatherOccupation`
6. `locality`
7. `classSection`
8. `installment`
9. `totalStructuredAmount`
10. `concessionPercent`
11. `concessionType`
12. `totalPayableAmount`
13. `dueDate`
14. `receiptMode`
15. `admissionType`
16. `discountAmount`
17. `chequeBounceAmount`
18. `lateFee`
19. `readmissionFee`
20. `busFee`
21. `excessAmount`
22. `schoolFees`
23. `admissionFee`
24. `totalPaid`
25. `totalConcession`
26. `totalFees`
27. `currentStatus`

## 4) Validation Rules

- Monetary fields must be numbers and `>= 0`.
- Send `0` for non-applicable values, not null.
- `concessionType = "NA"` when no concession exists.
- `installment` should be one of `APR..MAR`.
- `currentStatus` should be one of `Active|TC|Dropout`.
- Recommended formula: `totalPayableAmount = totalStructuredAmount - totalConcession`.

## 5) Request/Response Conventions (All POST APIs)

- Header: `Content-Type: application/json`
- Header: `Authorization: Bearer <token>`
- Response envelope:

```json
{
  "success": true,
  "requestId": "uuid",
  "data": {}
}
```

- Error envelope:

```json
{
  "success": false,
  "requestId": "uuid",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "academicYear is required"
  }
}
```

## 6) Why This Split Matches Current Codebase

- Current frontend consumes KPI, monthly/yearly trends, defaulter segments, installment timeline, and detailed receipt records separately.
- Existing monolithic dashboard payload can be decomposed into these POST endpoints without changing business logic.
- This split keeps first paint fast (`getSummary`) and loads heavy tables (`getReceiptDetails`) on demand.
