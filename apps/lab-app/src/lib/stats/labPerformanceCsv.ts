import type { LabPerformanceRow } from "@/types/statisticsData";
import { formatAmount } from "@/utils/csvUtils";

// Lab Performance Summary CSV - same columns as the table in SuperAdminStats.tsx,
// but with raw numbers (no ₹/K/L formatting) so the sheet can be summed/sorted.

const LAB_PERFORMANCE_CSV_HEADERS = [
  "SI No.",
  "Lab Name",
  "Revenue",
  "Tests",
  "Patients",
  "Pending Samples",
  "Avg TAT (hrs)",
  "Reports Generated",
  "Growth (Revenue) %",
];

const toCsvLine = (fields: unknown[]): string =>
  fields.map((field) => `"${String(field ?? "").replace(/"/g, '""')}"`).join(",");

export const buildLabPerformanceCsv = (rows: LabPerformanceRow[]): string =>
  [
    toCsvLine(LAB_PERFORMANCE_CSV_HEADERS),
    ...rows.map((row, index) =>
      toCsvLine([
        index + 1,
        row.labName || "Unknown Lab",
        formatAmount(row.revenue || 0),
        row.tests || 0,
        row.patients || 0,
        row.pendingSamples || 0,
        (row.avgTatHours || 0).toFixed(1),
        row.reportsGenerated || 0,
        row.growthPct == null ? "N/A" : row.growthPct.toFixed(1),
      ])
    ),
  ].join("\n");
