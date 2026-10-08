import type {
  BillingSummary,
  EarningsTestRow,
  PackageRow,
  RevenueByLabRow,
  TestCategoryRow,
  TopReferringDoctor,
} from "@/types/statisticsData";
import { formatAmount } from "@/utils/csvUtils";

// CSV builders for the SuperAdminStats dashboard cards. Each card already holds
// its data for its own date filter (and the selected lab), so these build the
// file client-side from that state - amounts are raw numbers (no ₹/K/L) so the
// sheet can be summed/sorted.

const toCsvLine = (fields: unknown[]): string =>
  fields.map((field) => `"${String(field ?? "").replace(/"/g, '""')}"`).join(",");

export const buildCsv = (headers: string[], rows: unknown[][]): string =>
  [toCsvLine(headers), ...rows.map(toCsvLine)].join("\n");

export const amt = (value: number | null | undefined): string => formatAmount(Number(value) || 0);

// Filename-safe label for which lab(s) an export covers: the lab's name when one
// lab is selected, "all-labs" otherwise. Also used server-side to sanitize the
// label the export routes receive, so it's safe inside Content-Disposition.
export const toExportLabLabel = (labName?: string | null): string =>
  (labName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "all-labs";

// File name for the server-streamed exports: <prefix>-<lab|all-labs>-DD-MM-YYYY-to-DD-MM-YYYY.csv.
// "/" can't appear in a file name, so the dates use "-". Dates arrive as YYYY-MM-DD query params
// (untrusted), so anything that doesn't match is dropped and the range is omitted.
export const buildExportFilename = (
  prefix: string,
  labLabel: string | null | undefined,
  startDate?: string | null,
  endDate?: string | null
): string => {
  const toDmy = (value?: string | null): string | null => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
    return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
  };
  const from = toDmy(startDate);
  const to = toDmy(endDate);
  const range = from && to ? `-${from}-to-${to}` : "";
  return `${prefix}-${toExportLabLabel(labLabel)}${range}.csv`;
};

// Revenue Trend - one row per chart bucket (day/week/month depending on the filter).
export const buildRevenueTrendCsv = (
  points: Array<{ label: string; revenue: number }>,
  totalRevenue: number
): string =>
  buildCsv(
    ["Period", "Revenue"],
    [...points.map((p) => [p.label, amt(p.revenue)]), ["Total", amt(totalRevenue)]]
  );

// Puts a title line (plus a blank line) above a CSV body.
export const withCsvHeading = (heading: string, csv: string): string =>
  `${toCsvLine([heading])}

${csv}`;

// Revenue Trend lab-wise - every lab, not just the top 5 drawn on the card.
export const buildRevenueByLabCsv = (rows: RevenueByLabRow[]): string =>
  buildCsv(
    ["SI No.", "Lab Name", "Revenue", "Discount", "Package Revenue"],
    rows.map((row, index) => [
      index + 1,
      row.labName || "Unknown Lab",
      amt(row.revenue),
      amt(row.discount),
      amt(row.packageRevenue),
    ])
  );

export const buildTestsByCategoryCsv = (rows: TestCategoryRow[]): string =>
  buildCsv(
    ["SI No.", "Category", "Test Count", "Revenue", "Discount", "Paid", "Due", "Cash", "UPI", "Card"],
    rows.map((row, index) => [
      index + 1,
      row.category || "Unknown",
      row.testCount || 0,
      amt(row.revenue),
      amt(row.discount),
      amt(row.paidRevenue),
      amt(row.dueRevenue),
      amt(row.cashRevenue),
      amt(row.upiRevenue),
      amt(row.cardRevenue),
    ])
  );

// Revenue by Test - rows in the card's current category selection and sort order.
export const buildRevenueByTestCsv = (
  rows: Array<EarningsTestRow & { category?: string }>,
  category: string
): string =>
  buildCsv(
    ["SI No.", "Test Name", "Test Code", "Category", "Count", "Price", "Paid", "Due", "Total Amount"],
    rows.map((row, index) => [
      index + 1,
      row.testName || "Unknown",
      row.testCode,
      row.category || category,
      row.orderedCount || 0,
      amt(row.price),
      amt(row.revenue),
      amt(row.dueAmount),
      amt(row.grossEarnings),
    ])
  );

export const buildPackagesSummaryCsv = (
  rows: Array<Omit<PackageRow, "packageCode"> & { packageCode?: string }>
): string =>
  buildCsv(
    ["SI No.", "Package Name", "Package Code", "Visits", "Revenue", "Discount", "Paid", "Due", "Cash", "UPI", "Card"],
    rows.map((row, index) => [
      index + 1,
      row.packageName || "Unknown",
      row.packageCode,
      row.visitCount || 0,
      amt(row.revenue),
      amt(row.discount),
      amt(row.paidRevenue),
      amt(row.dueRevenue),
      amt(row.cashRevenue),
      amt(row.upiRevenue),
      amt(row.cardRevenue),
    ])
  );

// Billing Summary is a single set of totals, so it's exported as Metric/Value rows.
export const buildBillingSummaryCsv = (summary: BillingSummary): string =>
  buildCsv(
    ["Metric", "Value"],
    [
      ["Total Billings", summary.totalBillings || 0],
      ["Gross Billed", amt(summary.grossBilled)],
      ["Discount", amt(summary.totalDiscount)],
      ["GST", amt(summary.totalGst)],
      ["Total Billed Amount (Net)", amt(summary.netBilled)],
      ["Paid Amount", amt(summary.totalPaid)],
      ["Due Amount", amt(summary.totalDue)],
      ["Cash", amt(summary.paymentMode?.cash)],
      ["UPI", amt(summary.paymentMode?.upi)],
      ["Card", amt(summary.paymentMode?.card)],
    ]
  );

// Top Referring Doctors - everything the API returned, not just the 5 shown.
export const buildTopDoctorsCsv = (rows: TopReferringDoctor[]): string =>
  buildCsv(
    ["SI No.", "Doctor Name", "Speciality", "Patients", "Total Tests", "Revenue"],
    rows.map((row, index) => [
      index + 1,
      row.doctorName || "Unknown Doctor",
      row.speciality,
      row.patientCount || 0,
      row.totalTests || 0,
      amt(row.revenue),
    ])
  );

// ---- AdminStats cards (single lab, so no lab column) ----

// Test by Category (admin) - count + share per category.
export const buildAdminTestsByCategoryCsv = (
  rows: Array<{ category: string; count: number; percentage: number }>
): string =>
  buildCsv(
    ["SI No.", "Category", "Test Count", "Percentage"],
    rows.map((row, index) => [index + 1, row.category || "Unknown", row.count || 0, row.percentage || 0])
  );

// Top Order Test - every test the API returned, not just the ones scrolled into view.
export const buildTopOrderedTestsCsv = (
  rows: Array<{ testName: string; testCode?: string; orderedCount: number }>
): string =>
  buildCsv(
    ["SI No.", "Test Name", "Test Code", "Ordered Count"],
    rows.map((row, index) => [index + 1, row.testName || "Unknown", row.testCode, row.orderedCount || 0])
  );

export const buildRevenueByCollectionCsv = (
  methods: Array<{ method: string; revenue: number; percentage: number }>,
  total: number
): string =>
  buildCsv(
    ["Collection Method", "Revenue", "Percentage"],
    [
      ...methods.map((m) => [m.method || "Unknown", amt(m.revenue), m.percentage || 0]),
      ["Total", amt(total), ""],
    ]
  );

// Age & Gender - one sheet with both breakdowns, told apart by the Type column.
export const buildAgeGenderCsv = (
  gender: Array<{ gender: string; count: number; percentage: number }>,
  ageGroups: Array<{ ageGroup: string; count: number; percentage: number }>
): string =>
  buildCsv(
    ["Type", "Group", "Patients", "Percentage"],
    [
      ...gender.map((g) => ["Gender", g.gender || "Unknown", g.count || 0, g.percentage || 0]),
      ...ageGroups.map((a) => ["Age Group", a.ageGroup || "Unknown", a.count || 0, a.percentage || 0]),
    ]
  );

export const buildTechnicianPerformanceCsv = (
  rows: Array<{ technicianName: string; samplesProcessed: number; reportsEntered: number; avgTatHours: number }>
): string =>
  buildCsv(
    ["SI No.", "Technician", "Samples Processed", "Reports Entered", "Avg TAT (hrs)"],
    rows.map((row, index) => [
      index + 1,
      row.technicianName || "Unknown",
      row.samplesProcessed || 0,
      row.reportsEntered || 0,
      (row.avgTatHours || 0).toFixed(1),
    ])
  );

export const buildAdminTopDoctorsCsv = (
  rows: Array<{ doctorName: string; speciality?: string; patientCount: number; revenue: number }>
): string =>
  buildCsv(
    ["SI No.", "Doctor Name", "Speciality", "Patients", "Revenue"],
    rows.map((row, index) => [
      index + 1,
      row.doctorName || "Unknown Doctor",
      row.speciality,
      row.patientCount || 0,
      amt(row.revenue),
    ])
  );
