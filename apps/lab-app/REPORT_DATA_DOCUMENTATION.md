# Report Components Data Documentation

This document describes the data structures and inputs for each report component in the Detail Reports page.

## Table of Contents
1. [AmountReceivedTable](#amountreceivedtable)
2. [BillReport](#billreport)
3. [DayClosingSummary](#dayclosingsummary)
4. [ReceiptsSummary](#receiptssummary)
5. [Common Data Structures](#common-data-structures)

---

## AmountReceivedTable

### Component Location
`src/app/(admin)/component/common/AmountReceivedTable.tsx`

### Props Interface
```typescript
interface AmountReceivedTableProps {
  data?: AmountReceivedData[];           // Transformed table data
  title?: string;                        // Optional title
  showTitle?: boolean;                   // Whether to show title
  className?: string;                     // Additional CSS classes
  rawApiData?: PatientApiResponse[];      // Raw API response data
  selectedDate?: string;                 // Single date filter (YYYY-MM-DD)
  startDate?: string;                    // Start date for range (YYYY-MM-DD)
  endDate?: string;                      // End date for range (YYYY-MM-DD)
}
```

### Data Flow
1. **Input**: `PatientApiResponse[]` (raw API data)
2. **Transformation**: Uses `transformApiDataToTableFormat()` function
3. **Output**: `AmountReceivedData[]` (table-ready data)

### Input Data Structure: PatientApiResponse
```typescript
interface PatientApiResponse {
  id: number;
  firstName: string;
  phone: string;
  city: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  visit: {
    visitId: number;
    visitDate: string;
    visitType: string;
    visitStatus: string;
    visitDescription: string;
    doctorId: number | null;
    testIds: number[];
    packageIds: number[];
    billing: {
      billingId: number;
      totalAmount: number;
      paymentStatus: string;
      paymentMethod: string;
      paymentDate: string;
      discount: number;
      netAmount: number;
      discountReason: string;
      createdBy: string;
      billingTime: string;
      billingDate: string;
      updatedBy: string;
      createdAt: string;
      updatedAt: string;
      received_amount: number;
      due_amount: number;
      transactions: BillingTransaction[];
    };
    createdBy: string;
    updatedBy: string | null;
    visitCancellationReason: string;
    visitCancellationDate: string | null;
    visitCancellationBy: string;
    visitCancellationTime: string | null;
    testResult: unknown[];
    listofeachtestdiscount: unknown[];
  };
  createdBy: string;
  updatedBy: string | null;
}
```

### Output Data Structure: AmountReceivedData
```typescript
interface AmountReceivedData {
  id: string;                    // Unique ID: `${visitId}-${transactionId}`
  slNo: number;                  // Serial number
  receiptNo: string;              // Billing ID as string
  receiptDate: string;           // Transaction payment_date
  patientName: string;            // Patient firstName
  billNo: string;                // Billing ID as string
  billType: string;              // Payment method (lowercase)
  type: string;                  // Visit type (OP/IP)
  paymentType: string;           // Transaction payment_method
  paymentAmount: number;          // Transaction received_amount
  billedDate: string;            // Billing billingDate
  totalAmount: number;           // Billing totalAmount
  discount: number;               // Billing discount
  due: number;                    // Minimum due amount
  received: number;               // Transaction received_amount
  netReceived: number;            // received - refund
  receivedBy: string;             // Transaction createdBy
  refund?: number;                // Transaction refund_amount (if > 0)
}
```

### Key Transformations
- **One row per transaction**: Each transaction in `billing.transactions[]` becomes a separate table row
- **Due calculation**: Uses minimum due amount across all transactions for a visit
- **Net received**: Calculated as `received_amount - refund_amount` per transaction
- **Date filtering**: Filters transactions by `payment_date` matching the selected date/range

### Summary Calculations
- **Discount**: Sum of billing discounts (filtered by billing date matching selected date/range)
- **Due**: Sum of minimum due amounts per unique visit
- **Received**: Sum of all transaction `received_amount` values
- **Net Received**: Sum of `received_amount - refund_amount` from all transactions
- **Payment Methods**: Breakdown by Cash, Card, UPI from transaction `payment_method` field

---

## BillReport

### Component Location
`src/app/(admin)/component/common/BillReport.tsx`

### Props Interface
```typescript
interface BillReportProps {
  data: PatientData[];            // Patient data array
  rawApiData: PatientData[];     // Same as data (for calculations)
  startDate?: string;             // Start date for range (YYYY-MM-DD)
  endDate?: string;               // End date for range (YYYY-MM-DD)
  selectedDate?: string;          // Single date filter (YYYY-MM-DD)
}
```

### Data Flow
1. **Input**: `PatientData[]` (from API via conversion functions)
2. **Internal Processing**: Transforms data to `BillSummaryData`
3. **Display**: Shows summary cards, lab tests breakdown, and doctors analysis

### Input Data Structure: PatientData
```typescript
interface PatientData {
  id: number;
  firstName: string;
  phone: string;
  city: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  createdBy: string;
  updatedBy: string | null;
  doctorName?: string;
  visit: {
    visitId: number;
    visitDate: string;
    visitType: string;
    visitStatus: string;
    visitDescription: string;
    doctorId: number | null;
    testNames?: string[];          // Additional field
    testIds: number[];
    packageIds: number[];
    packageNames: string[];        // Additional field
    createdBy: string;
    updatedBy: string | null;
    visitCancellationReason: string;
    visitCancellationDate: string;
    visitCancellationBy: string;
    visitCancellationTime: string | null;
    doctorName?: string;
    billing: {
      billingId: number;
      totalAmount: number;
      paymentStatus: string;
      paymentMethod: string;
      paymentDate: string;
      discount: number;
      netAmount: number;
      discountReason: string;
      createdBy: string;
      updatedBy: string;
      billingTime: string;
      billingDate: string;
      createdAt: string;
      updatedAt: string;
      received_amount: number;
      due_amount: number;
      transactions: Transaction[];
    };
    testResult: Array<{
      id: number;
      testId: number;
      testName: string;
      category: string;
      reportStatus: string;
      createdBy: string;
      updatedBy: string;
      createdAt: string;
      updatedAt: string;
      filled: boolean;
    }>;
    listofeachtestdiscount: Array<{
      discountAmount: number;
      discountPercent: number;
      finalPrice: number;
      testName: string;
      category: string;
      createdBy: string;
      updatedBy: string;
      id: number;
    }>;
  };
}
```

### Internal Data Structure: BillSummaryData
```typescript
interface BillSummaryData {
  total: number;                  // Sum of totalAmount (deduplicated by visitId)
  totalDiscount: number;          // Sum of discounts (filtered by billing date)
  netAmount: number;              // total - totalDiscount
  netReceived: number;            // Sum of received_amount - refund_amount
  refundAmount: number;            // Sum of all refund_amount
  totalWriteOff: number;          // Hardcoded to 0
  labTests: LabTest[];            // Grouped by category
  doctors: Doctor[];               // Grouped by doctor name
}

interface LabTest {
  category: string;
  tests: {
    name: string;
    amount: number;                // From listofeachtestdiscount.finalPrice
    count: number;
  }[];
  total: {
    amount: number;
    count: number;
  };
}

interface Doctor {
  name: string;
  count: number;                   // Number of tests
  amount: number;                  // Sum of finalPrice from listofeachtestdiscount
}
```

### Key Calculations
- **Total Amount**: Sum of `billing.totalAmount` per unique `visitId` (filtered by billing date)
- **Discount**: Sum of `billing.discount` only for bills where `billingDate` matches selected date/range
- **Lab Tests**: Grouped by `testResult.category`, uses `listofeachtestdiscount.finalPrice` for amounts
- **Doctors**: Grouped by `doctorName` (from patient or visit level), calculates total from `listofeachtestdiscount.finalPrice`
- **Net Received**: Sum of `billing.received_amount - refund_amount` from all transactions
- **Refund**: Sum of all `transaction.refund_amount` values

### Date Filtering Logic
- **Lab Tests**: Only includes tests from visits where `billing.billingDate` matches selected date/range
- **Total/Discount**: Only includes bills where `billing.billingDate` matches selected date/range
- **Doctors**: Independent of date filtering (shows all doctors)

---

## DayClosingSummary

### Component Location
`src/app/(admin)/component/common/DayClosingSummary.tsx`

### Props Interface
```typescript
interface DayClosingSummaryProps {
  labName?: string;               // Lab name for display
  dateRange?: string;              // Formatted date range string
  startDate?: string;               // Start date for range (YYYY-MM-DD)
  endDate?: string;                 // End date for range (YYYY-MM-DD)
  receiptsData?: ReceiptsData;     // Optional receipts data (currently not used)
  // ... other optional props for manual data injection
}
```

### Data Flow
1. **Input**: `startDate` and `endDate` props
2. **API Call**: Fetches data using `getDatewiseTransactionDetails(labId, startDate, endDate)`
3. **Internal Processing**: Calculates all metrics from API response
4. **Display**: Shows multiple sections with calculated data

### API Response Structure: TransactionData
```typescript
interface TransactionData {
  id: number;
  firstName: string;
  lastName?: string;
  phone: string;
  city: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  createdBy: string;
  updatedBy: string | null;
  doctorName?: string;
  doctor?: {
    name: string;
  };
  visit: {
    visitId: number;
    visitDate: string;
    visitType: string;
    visitStatus: string;
    visitDescription: string;
    doctorId: number | null;
    testNames?: string[];
    testIds: number[];
    packageIds: number[];
    packageNames: string[];
    createdBy: string;
    updatedBy: string | null;
    visitCancellationReason: string;
    visitCancellationDate: string;
    visitCancellationBy: string;
    visitCancellationTime: string | null;
    doctorName?: string;
    billing: {
      billingId: number;
      totalAmount: number;
      paymentStatus: string;
      paymentMethod: string;
      paymentDate: string;
      discount: number;
      netAmount: number;
      discountReason: string;
      createdBy: string;
      updatedBy: string;
      billingTime: string;
      billingDate: string;
      createdAt: string;
      updatedAt: string;
      received_amount: number;
      due_amount: number;
      transactions: BillingTransaction[];
    };
    testResult: Array<{
      id: number;
      testId: number;
      testName: string;
      category: string;
      reportStatus: string;
      createdBy: string;
      updatedBy: string;
      createdAt: string;
      updatedAt: string;
      filled: boolean;
    }>;
    listofeachtestdiscount: Array<{
      discountAmount: number;
      discountPercent: number;
      finalPrice: number;
      testName: string;
      category: string;
      createdBy: string;
      updatedBy: string;
      id: number;
    }>;
  };
  patientCreatedBy: string;
  patientUpdatedBy: string | null;
}
```

### Calculated Data Structures

#### BillCountData
```typescript
interface BillCountData {
  totalBills: number;              // Unique visitIds from filtered bills
  cashBills: number;               // Bills with received_amount > 0 and billingDate matches
  creditBills: number;                // Hardcoded to 0
}
```

#### AmountBilledData
```typescript
interface AmountBilledData {
  totalSales: number;              // Sum of totalAmount (deduplicated by visitId)
  discount: number;                // Sum of discounts
  netSales: number;                // Sum of netAmount
  cashBills: number;                // Sum of received amounts (current + previous)
  creditBills: number;              // Hardcoded to 0.0
  totalWriteOff: number;            // Hardcoded to 0
}
```

#### BillDueAmountData
```typescript
interface BillDueAmountData {
  totalBillDue: number;             // Sum of minimum due amounts
  cashBillDue: number;              // Due for cash bills
  creditBillDue: number;            // Due for credit bills
  excessReceived: number;           // Sum of max(0, received - netAmount)
}
```

#### ModeOfPaymentData
```typescript
interface ModeOfPaymentData {
  receiptForCurrentBills: {        // From selected date visits
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  receiptForPastBills: {            // From past date visits
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  otherReceipt: {                   // Hardcoded to 0
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  advanceReceipt: {                // Hardcoded to 0
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  totalReceipt: {                  // Sum of all receipts
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  refund: {                        // From all transactions
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  otherPayments: {                  // Hardcoded to 0
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  totalPayment: {                  // Sum of payments
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
  netAmount: {                     // totalReceipt - totalPayment
    cash: number;
    card: number;
    cheque: number;
    imps: number;
    wallet: number;
    total: number;
  };
}
```

#### BillDetail
```typescript
interface BillDetail {
  slNo: number;
  billNo: string;                  // billingId as string
  billName: string;                 // Patient name
  regLabNo: string;                 // Lab ID
  refCenter: string;                // Doctor name
  billedAt: string;                  // Formatted billingDate
  visitType: string;
  type: string;                      // Payment method
  amount: number;                    // totalAmount (only for first transaction)
  discount: number;                  // discount (only for first transaction)
  netAmount: number;                 // netAmount (only for first transaction)
  refund: number;                   // transaction.refund_amount
  writeoff: number;                 // Hardcoded to 0
  received: number;                  // transaction.received_amount
  advance: number;                   // Hardcoded to 0
  due: number;                       // Minimum due amount
}
```

### Key Calculations
- **Bill Count**: Filters by `billing.billingDate` matching date range, counts unique `visitId`
- **Amount Billed**: Uses `billing.billingDate` to filter, deduplicates by `visitId`
- **Bill Due**: Uses `visit.visitDate` to filter, calculates minimum due per visit
- **Mode of Payment**: 
  - Current bills: `visit.visitDate === selectedDate`
  - Past bills: `visit.visitDate !== selectedDate`
- **Current Bill Details**: One row per transaction, filtered by `visit.visitDate === selectedDate`
- **Past Bill Details**: One row per unique visit, filtered by `visit.visitDate !== selectedDate`

---

## ReceiptsSummary

### Component Location
`src/app/(admin)/component/common/ReceiptsSummary.tsx`

### Props Interface
```typescript
interface ReceiptsSummaryProps {
  startDate?: string;               // Start date for range (YYYY-MM-DD)
  endDate?: string;                 // End date for range (YYYY-MM-DD)
  onPrint?: () => void;             // Optional print handler
  onExportCSV?: () => void;        // Optional CSV export handler
}
```

### Data Flow
1. **Input**: `startDate` and `endDate` props
2. **API Call**: Fetches data using `getDatewiseTransactionDetails(labId, startDate, endDate)`
3. **Internal Processing**: Calculates receipt summary and mode of payment data
4. **Display**: Shows financial summary cards and payment methods table

### API Response Structure: TransactionData
Same as `DayClosingSummary` - uses the same `TransactionData` interface.

### Calculated Data Structures

#### ReceiptSummaryData
```typescript
interface ReceiptSummaryData {
  totalSales: number;               // Sum of totalAmount (deduplicated by visitId)
  totalDiscount: number;           // Sum of discounts
  netAmount: number;                // Sum of netAmount
  cashSales: number;                // Sum of netAmount for visits with received_amount > 0
  creditSales: number;             // Hardcoded to 0
  due: number;                      // Sum of minimum due amounts
  excessReceived: number;           // max(0, totalReceipts - netAmount)
  refund: number;                   // Sum of all refund_amount
  totalReceipts: number;            // Sum of all received_amount
  netReceipts: number;              // totalReceipts - refund
}
```

#### ModeOfPaymentData
Same structure as `DayClosingSummary.ModeOfPaymentData`, but with simplified structure (only cash, card, upi):
```typescript
interface ModeOfPaymentData {
  receiptForCurrentBills: {         // billingDate === filteredDate
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  receiptForPastBills: {            // billingDate !== filteredDate, transactionDate === filteredDate
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  advanceReceipt: {                 // Hardcoded to 0
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  otherReceipt: {                    // Hardcoded to 0
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  totalReceipt: {                   // Sum of all receipts
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  refund: {                         // From all transactions
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  otherPayments: {                  // Hardcoded to 0
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  totalPayment: {                   // Sum of payments
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
  netAmount: {                      // totalReceipt - totalPayment
    cash: number;
    card: number;
    upi: number;
    total: number;
  };
}
```

### Key Calculations
- **Total Sales**: Sum of `billing.totalAmount` (deduplicated by `visitId`)
- **Cash Sales**: Sum of `billing.netAmount` for visits with any `received_amount > 0`
- **Due**: Minimum due amount per visit (same logic as other components)
- **Total Receipts**: Sum of all `transaction.received_amount`
- **Net Receipts**: `totalReceipts - refund`
- **Mode of Payment**:
  - Current bills: `billing.billingDate === filteredDate`
  - Past bills: `billing.billingDate !== filteredDate` AND `transaction.created_at.split('T')[0] === filteredDate`

---

## Common Data Structures

### BillingTransaction
Used across all components:
```typescript
interface BillingTransaction {
  id: number;
  createdBy: string;
  billing_id: number;
  payment_method: string;          // "cash", "card", "upi", etc.
  upi_id: string | null;
  upi_amount: number;
  card_amount: number;
  cash_amount: number;
  received_amount: number;
  refund_amount: number;
  due_amount: number;
  payment_date: string;             // YYYY-MM-DD format
  remarks: string;
  created_at: string;               // ISO timestamp
}
```

### Date Format
All date strings use `YYYY-MM-DD` format (e.g., "2025-01-15")

### API Endpoint
All components that fetch data use:
```typescript
getDatewiseTransactionDetails(labId: number, startDate: string, endDate: string)
```

### Common Calculation Patterns

1. **Deduplication by Visit ID**: Many calculations deduplicate by `visit.visitId` to avoid counting the same visit multiple times
2. **Minimum Due Calculation**: For due amounts, components find the minimum `due_amount` across all transactions for a visit
3. **Date Filtering**: 
   - `billing.billingDate` is used for filtering bills created on a specific date
   - `visit.visitDate` is used for filtering visits on a specific date
   - `transaction.payment_date` or `transaction.created_at` is used for filtering transactions
4. **Payment Method Parsing**: Payment methods are parsed from `transaction.payment_method` string using `.toLowerCase().includes()` checks

---

## Data Flow Summary

### AmountReceivedTable
```
API Response (PatientApiResponse[])
  ↓
transformApiDataToTableFormat()
  ↓
AmountReceivedData[] (displayed in table)
```

### BillReport
```
API Response (Patient[])
  ↓
convertPatientToApiResponse()
  ↓
PatientData[]
  ↓
transformApiData() (internal)
  ↓
BillSummaryData (displayed in cards and tables)
```

### DayClosingSummary
```
startDate, endDate props
  ↓
getDatewiseTransactionDetails() API call
  ↓
TransactionData[]
  ↓
calculateBillCounts(), calculateAmountBilled(), etc.
  ↓
Various calculated data structures (displayed in sections)
```

### ReceiptsSummary
```
startDate, endDate props
  ↓
getDatewiseTransactionDetails() API call
  ↓
TransactionData[]
  ↓
calculateReceiptSummary(), calculateModeOfPayment()
  ↓
ReceiptSummaryData, ModeOfPaymentData (displayed in cards and table)
```

---

## Notes

1. **Date Range Handling**: All components support both single date (`selectedDate`) and date range (`startDate`, `endDate`) filtering
2. **Empty States**: All components handle cases where no data is available
3. **Loading States**: Components that fetch data internally show loading indicators
4. **Error Handling**: Components handle API errors gracefully
5. **Currency Formatting**: All amounts are formatted using `formatCurrency()` or `formatAmount()` utilities
6. **Hardcoded Values**: Some fields like `creditBills`, `totalWriteOff`, `advanceReceipt`, `otherReceipt`, `otherPayments` are hardcoded to 0 as they are not available in the current API response

