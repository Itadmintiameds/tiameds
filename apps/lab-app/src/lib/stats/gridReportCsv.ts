import type { GridReportRow } from "@/types/statisticsData";
import { formatAmount, formatDate } from "@/utils/csvUtils";

// Shared by the Billing Report table (SuperAdminStats.tsx) and the streaming CSV
// export route (api/superadmin-stats/grid-export), so both stay in sync.

// Backend sends a visit's tests as one comma-separated string ("CBC, Lipid Profile").
export const splitTestNames = (testNames?: string | null): string[] =>
  (testNames || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

export const GRID_REPORT_CSV_HEADERS = [
  "SI No.",
  "Visit Code",
  "Patient Name",
  "Patient Phone",
  "Doctor Name",
  "Test Names",
  "Visit Type",
  "Visit Status",
  "Billing Code",
  "Billing Date",
  "Payment Status",
  "Payment Method",
  "Total Amount",
  "Discount",
  "Net Amount",
  "Paid Amount",
  "Due Amount",
  "Lab Name",
];

const toCsvLine = (fields: unknown[]): string =>
  fields.map((field) => `"${String(field ?? "").replace(/"/g, '""')}"`).join(",");

export const gridReportCsvHeaderLine =(): string => toCsvLine(GRID_REPORT_CSV_HEADERS);

// serialNo is 1-based across the whole export, not per page.
export const gridReportRowToCsvLine = (row: GridReportRow, serialNo: number): string =>
  toCsvLine([
    serialNo,
    row.visitCode,
    row.patientName,
    row.patientPhone,
    row.doctorName || "N/A",
    splitTestNames(row.testNames).join(", "),
    row.visitType,
    row.visitStatus,
    row.billingCode,
    formatDate(row.billingDate),
    row.paymentStatus,
    row.paymentMethod,
    formatAmount(row.totalAmount),
    formatAmount(row.discount),
    formatAmount(row.netAmount),
    formatAmount(row.paidAmount),
    formatAmount(row.dueAmount),
    row.labName,
  ]);
