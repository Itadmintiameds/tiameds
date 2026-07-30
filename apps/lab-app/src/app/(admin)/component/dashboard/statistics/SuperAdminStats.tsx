/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dayjs from "dayjs";

import {
  Building2,
  ClipboardCheck,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import {
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { HiOutlineBanknotes, HiOutlineUserGroup, HiOutlineUsers } from "react-icons/hi2";
import { PiDna, PiFlaskLight, PiGraduationCapThin } from "react-icons/pi";

// Import services
import { useLabs } from "@/context/LabContext";
import {
  getAllStats,
  getGridReport,
} from "../../../../../../services/statisticsService";
import {
  DetailedBilling,
  EarningsByCategoryData,
  GridReportResponse,
  GridReportRow,
  LabPerformanceRow,
  RevenueByLabRow,
  RoleLabWiseTotal,
  TestCategoryRow,
  TopReferringDoctor,
} from "@/types/statisticsData";
import {
  downloadCSV,
  formatAmount as formatCsvAmount,
  formatDate as formatCsvDate,
  generateCSVFilename,
} from "@/utils/csvUtils";

type DateFilterType = "currentFY" | "week" | "month" | "year" | "custom";

interface DateRange {
  startDate: string;
  endDate: string;
}

// Helper: Get financial year start and end
const getFinancialYear = (date: dayjs.Dayjs): { start: string; end: string } => {
  const year = date.year();
  if (date.month() >= 3) {
    return {
      start: `${year}-04-01`,
      end: `${year + 1}-03-31`,
    };
  } else {
    return {
      start: `${year - 1}-04-01`,
      end: `${year}-03-31`,
    };
  }
};

// Helper: Get short FY label (e.g., "26-27")
const getShortFYLabel = (date: dayjs.Dayjs): string => {
  const fy = getFinancialYear(date);
  const startYear = fy.start.split('-')[0].slice(-2);
  const endYear = fy.end.split('-')[0].slice(-2);
  return `${startYear}-${endYear}`;
};

// Helper: Get date range based on filter
const getDateRange = (filter: DateFilterType, customRange?: DateRange): { startDate?: string; endDate?: string } => {
  const now = dayjs();

  switch (filter) {
    case "currentFY": {
      const fy = getFinancialYear(now);
      return {
        startDate: fy.start,
        endDate: now.format("YYYY-MM-DD"),
      };
    }
    case "week": {
      const startOfWeek = now.startOf('week');
      return {
        startDate: startOfWeek.format("YYYY-MM-DD"),
        endDate: now.format("YYYY-MM-DD"),
      };
    }
    case "month": {
      return {
        startDate: now.startOf("month").format("YYYY-MM-DD"),
        endDate: now.format("YYYY-MM-DD"),
      };
    }
    case "year": {
      return {
        startDate: `${now.year()}-01-01`,
        endDate: now.format("YYYY-MM-DD"),
      };
    }
    case "custom":
      if (customRange?.startDate && customRange?.endDate) {
        const endDate = dayjs(customRange.endDate);
        const today = dayjs();
        const validEndDate = endDate.isAfter(today) ? today : endDate;
        return {
          startDate: customRange.startDate,
          endDate: validEndDate.format("YYYY-MM-DD"),
        };
      }
      return { startDate: undefined, endDate: undefined };
    default:
      return { startDate: undefined, endDate: undefined };
  }
};

// Helper: ordinal suffix (1st, 2nd, 3rd, 4th...)
const getOrdinalSuffix = (num: number): string => {
  if (num === 1) return "st";
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
};

// Helper: date-labeled buckets (label + start/end as YYYY-MM-DD) for the revenue chart's
// x-axis, one per filter type. Each bucket's start/end is fed into getAllStats so the
// chart bars break the section's date range into per-day/week/month segments, the same
// way the global/section filter dropdowns have always driven this chart.
const getRevenueBuckets = (
  filter: DateFilterType,
  customRange: DateRange
): { label: string; start: string; end: string }[] => {
  const buckets: { label: string; start: dayjs.Dayjs; end: dayjs.Dayjs }[] = [];

  switch (filter) {
    case "currentFY": {
      const fyStart = dayjs(getFinancialYear(dayjs()).start);
      const today = dayjs();
      let current = fyStart.startOf('month');
      while (current.isBefore(today) || current.isSame(today, 'month')) {
        buckets.push({ label: current.format("MMM"), start: current.startOf('month'), end: current.endOf('month') });
        current = current.add(1, 'month');
      }
      break;
    }
    case "week": {
      const today = dayjs();
      const startOfWeek = today.startOf('week');
      let current = startOfWeek.clone();
      while (current.isBefore(today) || current.isSame(today, 'day')) {
        buckets.push({ label: current.format("ddd"), start: current.startOf('day'), end: current.endOf('day') });
        current = current.add(1, 'day');
      }
      break;
    }
    case "month": {
      const today = dayjs();
      const startOfMonthWeek = today.startOf('month').startOf('week');
      const startOfCurrentWeek = today.startOf('week');
      const totalWeeks = startOfCurrentWeek.diff(startOfMonthWeek, 'week') + 1;
      for (let i = 0; i < totalWeeks; i++) {
        const weekStart = startOfMonthWeek.add(i * 7, 'day');
        buckets.push({
          label: `${i + 1}${getOrdinalSuffix(i + 1)} Week`,
          start: weekStart.startOf('day'),
          end: weekStart.add(6, 'day').endOf('day'),
        });
      }
      break;
    }
    case "year": {
      const today = dayjs();
      let current = dayjs().startOf('year');
      while (current.isBefore(today) || current.isSame(today, 'month')) {
        buckets.push({ label: current.format("MMM"), start: current.startOf('month'), end: current.endOf('month') });
        current = current.add(1, 'month');
      }
      break;
    }
    case "custom": {
      if (customRange.startDate && customRange.endDate) {
        const start = dayjs(customRange.startDate);
        const end = dayjs(customRange.endDate);
        const diffDays = end.diff(start, 'days');

        if (diffDays <= 7) {
          for (let i = 0; i <= diffDays; i++) {
            const day = start.add(i, 'days');
            buckets.push({ label: day.format("DD MMM"), start: day.startOf('day'), end: day.endOf('day') });
          }
        } else if (diffDays <= 31) {
          for (let i = 0; i <= diffDays; i += 3) {
            const segStart = start.add(i, 'days');
            const segEndCandidate = segStart.add(2, 'days');
            const segEnd = segEndCandidate.isAfter(end) ? end : segEndCandidate;
            buckets.push({ label: segStart.format("DD MMM"), start: segStart.startOf('day'), end: segEnd.endOf('day') });
          }
          if (buckets.length > 0) {
            buckets[buckets.length - 1].end = end.endOf('day');
          }
        } else {
          let current = start.startOf('month');
          while (current.isBefore(end) || current.isSame(end, 'month')) {
            const bucketStart = current.isBefore(start) ? start : current;
            const monthEnd = current.endOf('month');
            const bucketEnd = monthEnd.isAfter(end) ? end : monthEnd;
            buckets.push({ label: current.format("MMM YY"), start: bucketStart.startOf('day'), end: bucketEnd.endOf('day') });
            current = current.add(1, 'month');
          }
        }
      }
      break;
    }
    default:
      break;
  }

  return buckets.map((b) => ({
    label: b.label,
    start: b.start.format("YYYY-MM-DD"),
    end: b.end.format("YYYY-MM-DD"),
  }));
};

// Role-count KPIs (totalAdmins/totalTechnicians/totalDeskRoles) come back as a plain
// number when the request is scoped to one lab, or as { total, labWise } when
// aggregating across every lab - see AllStatsKpis / RoleLabWiseTotal.
const extractRoleCount = (value: number | RoleLabWiseTotal | undefined | null): number => {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  return value.total ?? 0;
};

// Visit Status color coding for the Billing Grid Report table: completed -> success,
// cancelled -> warning, pending -> danger. Backend values are uppercase (e.g. "CANCELLED")
// but this normalizes case defensively.
const getVisitStatusColorClass = (status?: string): string => {
  switch ((status || "").toUpperCase()) {
    case "COMPLETED":
      return "text-success-500";
    case "CANCELLED":
      return "text-warning-500";
    case "PENDING":
      return "text-danger-500";
    default:
      return "text-pneutral-900";
  }
};

// Builds the CSV for the Billing Grid Report table/export - one row per visit/billing record.
const buildGridReportCsv = (rows: GridReportRow[]): string => {
  const headers = [
    "SI No.",
    "Visit Code",
    "Patient Name",
    "Patient Phone",
    "Doctor Name",
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

  const csvRows = rows.map((row, index) =>
    [
      index + 1,
      row.visitCode,
      row.patientName,
      row.patientPhone,
      row.doctorName || "N/A",
      row.visitType,
      row.visitStatus,
      row.billingCode,
      formatCsvDate(row.billingDate),
      row.paymentStatus,
      row.paymentMethod,
      formatCsvAmount(row.totalAmount),
      formatCsvAmount(row.discount),
      formatCsvAmount(row.netAmount),
      formatCsvAmount(row.paidAmount),
      formatCsvAmount(row.dueAmount),
      row.labName,
    ]
      .map((field) => `"${String(field ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );

  return [headers.join(","), ...csvRows].join("\n");
};

// Format currency
const formatCurrency = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount}`;
};

// Revenue axis unit tiers (Indian numbering: K -> L -> Cr)
const REVENUE_AXIS_UNITS = [
  { limit: 100000, divisor: 1000, suffix: "K" },
  { limit: 10000000, divisor: 100000, suffix: "L" },
  { limit: Infinity, divisor: 10000000, suffix: "Cr" },
];

// Builds a "nice" 0..max axis (6 ticks) that scales with the data:
// 0-10K in 2K steps, 10K-50K in 10K steps, then 1L/10L/1Cr/10Cr steps and so on.
const getRevenueAxisConfig = (maxValue: number) => {
  const safeMax = Math.max(maxValue, 0);
  let step = 2000;
  while (step * 5 < safeMax) {
    step = step < 10000 ? 10000 : step * 10;
  }
  const domainMax = step * 5;
  const ticks = Array.from({ length: 6 }, (_, i) => i * step);
  const unit =
    REVENUE_AXIS_UNITS.find((u) => domainMax < u.limit) ||
    REVENUE_AXIS_UNITS[REVENUE_AXIS_UNITS.length - 1];

  const formatTick = (value: number): string => {
    const scaled = Math.round((value / unit.divisor) * 10) / 10;
    return `${scaled}${unit.suffix}`;
  };

  return { domainMax, ticks, formatTick };
};

// Color constants for charts
const CATEGORY_COLORS = ["#4F6BED", "#55D400", "#8B5CF6", "#FDBA12", "#F75A5A", "#4C0FAE", "#6D28D9", "#38B000"];
const PACKAGE_COLORS = ["#4F6BED", "#55D400", "#8B5CF6", "#FDBA12", "#F75A5A", "#4C0FAE"];

// Billing Grid Report shows every row with no pagination in the UI, but the backend
// endpoint itself is still paginated - this is the page size used internally to pull
// every page and stitch them into one full row list.
const GRID_FETCH_PAGE_SIZE = 200;

// Defaults for the nested pieces of DetailedBilling before the first fetch resolves.
const emptyPaymentMode = { cash: 0, upi: 0, card: 0 };
const emptyBillingSummary: DetailedBilling["summary"] = {
  totalBillings: 0,
  grossBilled: 0,
  totalDiscount: 0,
  totalGst: 0,
  netBilled: 0,
  totalPaid: 0,
  totalDue: 0,
  paymentMode: emptyPaymentMode,
};
const emptyTestsSummary: DetailedBilling["testsSummary"] = {
  totalCategories: 0,
  totalTests: 0,
  grossBilled: 0,
  discount: 0,
  paid: 0,
  due: 0,
  paymentMode: emptyPaymentMode,
};
const emptyPackageSummary: DetailedBilling["packageSummary"] = {
  totalPackages: 0,
  totalVisits: 0,
  grossBilled: 0,
  discount: 0,
  paid: 0,
  due: 0,
  paymentMode: emptyPaymentMode,
};

const SuperAdminStats = () => {
  const { labs } = useLabs();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ========== LAB FILTER ==========
  // "all" = cumulative view across every lab the super admin owns; otherwise
  // every section below is scoped to that single lab via the labId query param.
  const [selectedLabId, setSelectedLabId] = useState<number | "all">("all");
  const selectedLabName = useMemo(
    () => (selectedLabId === "all" ? null : labs.find((lab) => lab.id === selectedLabId)?.name ?? null),
    [selectedLabId, labs]
  );

  // ========== UNIVERSAL DATE FILTER (Global) ==========
  const [globalFilter, setGlobalFilter] = useState<DateFilterType>("currentFY");
  const [globalCustomRange, setGlobalCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  // ========== INDIVIDUAL SECTION FILTERS ==========
  const [revenueFilter, setRevenueFilter] = useState<DateFilterType>("currentFY");
  const [revenueCustomRange, setRevenueCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  const [topLabsFilter, setTopLabsFilter] = useState<DateFilterType>("currentFY");
  const [topLabsCustomRange, setTopLabsCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  const [categoryFilter, setCategoryFilter] = useState<DateFilterType>("currentFY");
  const [categoryCustomRange, setCategoryCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  const [packagesFilter, setPackagesFilter] = useState<DateFilterType>("currentFY");
  const [packagesCustomRange, setPackagesCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  const [performanceFilter, setPerformanceFilter] = useState<DateFilterType>("currentFY");
  const [performanceCustomRange, setPerformanceCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  const [doctorsFilter, setDoctorsFilter] = useState<DateFilterType>("currentFY");
  const [doctorsCustomRange, setDoctorsCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  const [gridFilter, setGridFilter] = useState<DateFilterType>("currentFY");
  const [gridCustomRange, setGridCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  // State for all metrics
  // Total Labs: org-wide count owned by the current super admin, unaffected by
  // the date or lab filters (the backend endpoint backing it takes no such params).
  const [totalLabs, setTotalLabs] = useState<number>(0);

  // Admins/technicians/desk roles: scoped to the selected lab (or all labs), but
  // deliberately NOT re-fetched when the date filter changes - see the dedicated
  // effect below that calls getAllStats without startDate/endDate.
  const [totalAdmins, setTotalAdmins] = useState<number>(0);
  const [totalTechnicians, setTotalTechnicians] = useState<number>(0);
  const [totalDeskRoles, setTotalDeskRoles] = useState<number>(0);
  const [roleKpisLoading, setRoleKpisLoading] = useState<boolean>(true);

  // Remaining KPIs come from getAllStats().kpis, scoped by the global filter + selected lab.
  const [totalTests, setTotalTests] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [reportsGenerated, setReportsGenerated] = useState<number>(0);
  const [pendingSamples, setPendingSamples] = useState<number>(0);

  // Billing Summary card - independent of the test-category/package sections,
  // sourced from detailedBilling.summary on the global-filtered call.
  const [billingSummary, setBillingSummary] = useState<DetailedBilling["summary"]>(emptyBillingSummary);

  // Test by Category pie chart
  const [testCategories, setTestCategories] = useState<TestCategoryRow[]>([]);
  const [testCategoriesSummary, setTestCategoriesSummary] = useState<DetailedBilling["testsSummary"]>(emptyTestsSummary);

  // Revenue by Test - per-test drilldown table with a category filter dropdown
  const [earningsData, setEarningsData] = useState<EarningsByCategoryData>({
    summary: { totalCategories: 0, totalTests: 0, totalRevenue: 0, totalDue: 0 },
    categories: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Revenue Trend (All Labs) card - trend is pre-bucketed by day from the backend.
  const [revenueTrendTotal, setRevenueTrendTotal] = useState<number>(0);
  const [revenueChartData, setRevenueChartData] = useState<Array<{ label: string; revenue: number }>>([]);

  // Revenue Trend (Top 5 Labs) card
  const [revenueByLab, setRevenueByLab] = useState<RevenueByLabRow[]>([]);
  const [totalLabsForRevenue, setTotalLabsForRevenue] = useState<number>(0);

  const [labPerformance, setLabPerformance] = useState<LabPerformanceRow[]>([]);
  const [topDoctors, setTopDoctors] = useState<TopReferringDoctor[]>([]);

  // Packages Summary card
  const [packageSummary, setPackageSummary] = useState<DetailedBilling["packageSummary"]>(emptyPackageSummary);
  const [packages, setPackages] = useState<DetailedBilling["packages"]>([]);

  // Billing Grid Report table - shows every row (no pagination), own filter, CSV export
  const emptyGridData: GridReportResponse = { page: 0, size: 0, totalRecords: 0, totalPages: 0, rows: [] };
  const [gridData, setGridData] = useState<GridReportResponse>(emptyGridData);
  const [gridLoading, setGridLoading] = useState<boolean>(true);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Sync individual filters with global filter when global changes
  useEffect(() => {
    setRevenueFilter(globalFilter);
    setTopLabsFilter(globalFilter);
    setCategoryFilter(globalFilter);
    setPackagesFilter(globalFilter);
    setPerformanceFilter(globalFilter);
    setDoctorsFilter(globalFilter);
    setGridFilter(globalFilter);
  }, [globalFilter]);

  // Sync custom ranges when global custom range changes
  useEffect(() => {
    if (globalFilter === "custom") {
      setRevenueCustomRange(globalCustomRange);
      setTopLabsCustomRange(globalCustomRange);
      setCategoryCustomRange(globalCustomRange);
      setPackagesCustomRange(globalCustomRange);
      setPerformanceCustomRange(globalCustomRange);
      setDoctorsCustomRange(globalCustomRange);
      setGridCustomRange(globalCustomRange);
    }
  }, [globalCustomRange, globalFilter]);

  // Every section below hits the same consolidated endpoint, scoped to whichever
  // lab is currently selected ("all" omits labId so the backend aggregates every lab).
  const fetchStats = useCallback(
    (startDate?: string, endDate?: string) =>
      getAllStats(selectedLabId === "all" ? undefined : selectedLabId, startDate, endDate),
    [selectedLabId]
  );

  // Total Labs / Admins / Technicians / Desk Roles KPIs: re-fetched only when the
  // selected lab changes, deliberately independent of every date filter (global or
  // per-section) - always calls getAllStats with no startDate/endDate. totalLabs comes
  // back as 1 when a specific lab is selected (backend scopes it), or the full count
  // owned by the super admin when "All Labs" is selected.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setRoleKpisLoading(true);
      try {
        const stats = await fetchStats(undefined, undefined);
        if (cancelled) return;
        setTotalLabs(stats.kpis?.totalLabs || 0);
        setTotalAdmins(extractRoleCount(stats.kpis?.totalAdmins));
        setTotalTechnicians(extractRoleCount(stats.kpis?.totalTechnicians));
        setTotalDeskRoles(extractRoleCount(stats.kpis?.totalDeskRoles));
      } catch (error) {
        console.error("Error fetching role KPIs:", error);
        if (!cancelled) {
          setTotalLabs(0);
          setTotalAdmins(0);
          setTotalTechnicians(0);
          setTotalDeskRoles(0);
        }
      } finally {
        if (!cancelled) setRoleKpisLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchStats]);

  // Fetch function
  // Every section hits the same consolidated getAllStats endpoint but with its own date
  // range, and none of the sections depend on another section's result - so they're all
  // fired together via Promise.allSettled instead of one after another. This also drops
  // the old duplicate call for "earnings by category": it used the exact same date range
  // as "tests by category", so a single fetchStats call now backs both.
  const fetchAllData = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const globalRange = getDateRange(globalFilter, globalCustomRange);
      const revenueRange = getDateRange(revenueFilter, revenueCustomRange);
      const topLabsRange = getDateRange(topLabsFilter, topLabsCustomRange);
      const packagesRange = getDateRange(packagesFilter, packagesCustomRange);
      const categoryRange = getDateRange(categoryFilter, categoryCustomRange);
      const performanceRange = getDateRange(performanceFilter, performanceCustomRange);
      const doctorsRange = getDateRange(doctorsFilter, doctorsCustomRange);

      await Promise.allSettled([
        // 1. Remaining KPIs + Billing Summary card, scoped by the GLOBAL filter + selected lab
        (async () => {
          try {
            const globalStats = await fetchStats(globalRange.startDate, globalRange.endDate);
            setTotalTests(globalStats.kpis?.totalTests || 0);
            setTotalRevenue(globalStats.kpis?.totalRevenue || 0);
            setReportsGenerated(globalStats.kpis?.reportsGenerated || 0);
            setPendingSamples(globalStats.kpis?.pendingSamples || 0);
            setBillingSummary(globalStats.detailedBilling?.summary || emptyBillingSummary);
          } catch (error) {
            console.error("Error fetching global stats:", error);
            setTotalTests(0);
            setTotalRevenue(0);
            setReportsGenerated(0);
            setPendingSamples(0);
            setBillingSummary(emptyBillingSummary);
          }
        })(),

        // 2. Revenue trend with its OWN filter. The header total comes from the full-range
        // call; each chart bar comes from re-querying getAllStats for just that bucket's
        // range, same bucketing scheme (day/week/month, by filter type) as before. The
        // total and the per-bucket fetches are independent, so they run together too.
        (async () => {
          if (revenueRange.startDate && revenueRange.endDate) {
            const buckets = getRevenueBuckets(revenueFilter, revenueCustomRange);
            const [totalSettled, bucketsSettled] = await Promise.allSettled([
              fetchStats(revenueRange.startDate, revenueRange.endDate),
              Promise.all(
                buckets.map(async (bucket) => {
                  try {
                    const bucketStats = await fetchStats(bucket.start, bucket.end);
                    return { label: bucket.label, revenue: bucketStats.revenueTrend?.totalRevenue || 0 };
                  } catch (error) {
                    console.error(`Error fetching revenue bucket ${bucket.label}:`, error);
                    return { label: bucket.label, revenue: 0 };
                  }
                })
              ),
            ]);

            if (totalSettled.status === "fulfilled") {
              setRevenueTrendTotal(totalSettled.value.revenueTrend?.totalRevenue || 0);
            } else {
              console.error("Error fetching revenue section total:", totalSettled.reason);
              setRevenueTrendTotal(0);
            }

            if (bucketsSettled.status === "fulfilled") {
              setRevenueChartData(bucketsSettled.value);
            } else {
              console.error("Error fetching revenue chart data:", bucketsSettled.reason);
              setRevenueChartData([]);
            }
          } else {
            setRevenueTrendTotal(0);
            setRevenueChartData([]);
          }
        })(),

        // 3. Revenue by lab (top 5) with its OWN filter
        (async () => {
          try {
            const topLabsStats = await fetchStats(topLabsRange.startDate, topLabsRange.endDate);
            const allLabsRevenue = topLabsStats.revenueByLab || [];
            setTotalLabsForRevenue(allLabsRevenue.length);
            setRevenueByLab(allLabsRevenue.slice(0, 5));
          } catch (error) {
            console.error("Error fetching revenue by lab:", error);
            setTotalLabsForRevenue(0);
            setRevenueByLab([]);
          }
        })(),

        // 4. Packages summary with its OWN filter
        (async () => {
          try {
            const packagesStats = await fetchStats(packagesRange.startDate, packagesRange.endDate);
            setPackageSummary(packagesStats.detailedBilling?.packageSummary || emptyPackageSummary);
            setPackages(packagesStats.detailedBilling?.packages || []);
          } catch (error) {
            console.error("Error fetching packages:", error);
            setPackageSummary(emptyPackageSummary);
            setPackages([]);
          }
        })(),

        // 5. Tests by category + earnings by category with the section's OWN filter -
        // both come off the same getAllStats response since they share categoryRange.
        (async () => {
          try {
            const categoryStats = await fetchStats(categoryRange.startDate, categoryRange.endDate);
            setTestCategories(categoryStats.detailedBilling?.testCategories || []);
            setTestCategoriesSummary(categoryStats.detailedBilling?.testsSummary || emptyTestsSummary);

            const earnings = categoryStats.earningsByCategory || { summary: { totalCategories: 0, totalTests: 0, totalRevenue: 0, totalDue: 0 }, categories: [] };
            setEarningsData(earnings);

            // Default selected category to the one with the highest test count
            if (earnings.categories && earnings.categories.length > 0) {
              const sorted = [...earnings.categories].sort((a, b) => (b.totalTests || 0) - (a.totalTests || 0));
              setSelectedCategory(sorted[0].category);
            }
          } catch (error) {
            console.error("Error fetching tests/earnings by category:", error);
            setTestCategories([]);
            setTestCategoriesSummary(emptyTestsSummary);
            setEarningsData({ summary: { totalCategories: 0, totalTests: 0, totalRevenue: 0, totalDue: 0 }, categories: [] });
          }
        })(),

        // 6. Lab performance with its OWN filter
        (async () => {
          try {
            const performanceStats = await fetchStats(performanceRange.startDate, performanceRange.endDate);
            setLabPerformance((performanceStats.labPerformance || []).slice(0, 6));
          } catch (error) {
            console.error("Error fetching lab performance:", error);
            setLabPerformance([]);
          }
        })(),

        // 7. Top doctors with its OWN filter
        (async () => {
          try {
            const doctorsStats = await fetchStats(doctorsRange.startDate, doctorsRange.endDate);
            setTopDoctors((doctorsStats.topReferringDoctors || []).slice(0, 5));
          } catch (error) {
            console.error("Error fetching top doctors:", error);
            setTopDoctors([]);
          }
        })(),
      ]);

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, [
    fetchStats,
    globalFilter, globalCustomRange,
    revenueFilter, revenueCustomRange,
    topLabsFilter, topLabsCustomRange,
    categoryFilter, categoryCustomRange,
    packagesFilter, packagesCustomRange,
    performanceFilter, performanceCustomRange,
    doctorsFilter, doctorsCustomRange,
  ]);

  // Initial load + reload whenever the lab filter changes (fetchStats depends on selectedLabId)
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Billing Grid Report: the UI shows every matching row with no pagination, so this
  // pulls every page from the (paginated) backend endpoint and stitches them into one
  // full row list. `silent` mirrors fetchAllData's silent refresh - used by the 30s
  // auto-refresh below so the table doesn't flash back to a "Loading..." state.
  const fetchGridData = useCallback(
    async (silent = false) => {
      if (!silent) setGridLoading(true);
      try {
        const range = getDateRange(gridFilter, gridCustomRange);
        const labIdParam = selectedLabId === "all" ? undefined : selectedLabId;

        const firstPage = await getGridReport(labIdParam, range.startDate, range.endDate, 0, GRID_FETCH_PAGE_SIZE);
        let allRows: GridReportRow[] = [...firstPage.rows];

        if (firstPage.totalPages > 1) {
          const remainingPages = await Promise.all(
            Array.from({ length: firstPage.totalPages - 1 }, (_, i) =>
              getGridReport(labIdParam, range.startDate, range.endDate, i + 1, GRID_FETCH_PAGE_SIZE)
            )
          );
          remainingPages.forEach((p) => {
            allRows = allRows.concat(p.rows);
          });
        }

        setGridData({
          page: 0,
          size: allRows.length,
          totalRecords: firstPage.totalRecords,
          totalPages: 1,
          rows: allRows,
        });
      } catch (error) {
        console.error("Error fetching billing grid report:", error);
        if (!silent) setGridData({ page: 0, size: 0, totalRecords: 0, totalPages: 0, rows: [] });
      } finally {
        if (!silent) setGridLoading(false);
      }
    },
    [selectedLabId, gridFilter, gridCustomRange]
  );

  // Initial load + reload whenever the lab or the section's own date filter changes.
  useEffect(() => {
    fetchGridData();
  }, [fetchGridData]);

  // Auto-refresh every 30 seconds - keeps the Billing Grid Report in sync with every
  // other stats section on this dashboard.
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData(true);
      fetchGridData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData, fetchGridData]);

  // The grid table already holds the full filtered result set (no pagination), so the
  // CSV export just converts what's already loaded - no extra fetch needed.
  const handleDownloadGridCsv = () => {
    if (gridData.rows.length === 0) return;
    const csv = buildGridReportCsv(gridData.rows);
    downloadCSV(csv, generateCSVFilename("billing-grid-report"));
  };

  // Format data for category pie chart
  const getCategoryChartData = () => {
    if (!testCategories || testCategories.length === 0) {
      return [];
    }
    return testCategories
      .filter((item) => (item.testCount || 0) > 0)
      .map((item, index) => ({
        name: item.category || "Unknown",
        value: item.testCount || 0,
        testCount: item.testCount || 0,
        revenue: item.revenue || 0,
        discount: item.discount || 0,
        paidRevenue: item.paidRevenue || 0,
        dueRevenue: item.dueRevenue || 0,
        cashRevenue: item.cashRevenue || 0,
        upiRevenue: item.upiRevenue || 0,
        cardRevenue: item.cardRevenue || 0,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }));
  };

  // Format packages data for pie chart
  const getPackagesChartData = () => {
    if (!packages || packages.length === 0) {
      return [];
    }
    return packages
      .filter((item) => (item.visitCount || 0) > 0)
      .map((item, index) => ({
        name: item.packageName || "Unknown",
        value: item.visitCount || 0,
        visitCount: item.visitCount || 0,
        revenue: item.revenue || 0,
        discount: item.discount || 0,
        paidRevenue: item.paidRevenue || 0,
        dueRevenue: item.dueRevenue || 0,
        cashRevenue: item.cashRevenue || 0,
        upiRevenue: item.upiRevenue || 0,
        cardRevenue: item.cardRevenue || 0,
        packageCode: item.packageCode || "",
        packageId: item.packageId || 0,
        color: PACKAGE_COLORS[index % PACKAGE_COLORS.length],
      }));
  };

  // Billing Summary alerts pie - total billed amount is netBilled (gross minus discount/gst)
  const getAlertsData = () => {
    return [
      {
        name: "Total Billed Amount",
        value: billingSummary.netBilled || 0,
        color: "#FDBA12",
        amount: billingSummary.netBilled || 0,
      },
      {
        name: "Paid Amount",
        value: billingSummary.totalPaid || 0,
        color: "#38B000",
        amount: billingSummary.totalPaid || 0,
      },
      {
        name: "Due Amount",
        value: billingSummary.totalDue || 0,
        color: "#F75A5A",
        amount: billingSummary.totalDue || 0,
      },
    ];
  };

  // Get earnings-by-category tests for the selected category (or all, flattened)
  const getEarningsForCategory = () => {
    if (!earningsData.categories || earningsData.categories.length === 0) {
      return { tests: [], categoryName: "" };
    }

    if (selectedCategory === "all") {
      const allTests: Array<EarningsByCategoryData["categories"][number]["tests"][number] & { category: string }> = [];
      earningsData.categories.forEach((cat) => {
        if (cat.tests && cat.tests.length > 0) {
          cat.tests.forEach((test) => {
            allTests.push({ ...test, category: cat.category });
          });
        }
      });
      allTests.sort((a, b) => (b.grossEarnings || 0) - (a.grossEarnings || 0));
      return { tests: allTests, categoryName: "All Categories" };
    }

    const categoryData = earningsData.categories.find((cat) => cat.category === selectedCategory);
    if (!categoryData) {
      return { tests: [], categoryName: "" };
    }
    const sortedTests = [...(categoryData.tests || [])].sort(
      (a, b) => (b.grossEarnings || 0) - (a.grossEarnings || 0)
    );
    return { tests: sortedTests, categoryName: categoryData.category };
  };

  // Get all unique categories for the dropdown
  const getCategoriesForDropdown = () => {
    if (!earningsData.categories || earningsData.categories.length === 0) {
      return [];
    }
    return earningsData.categories.map((cat) => cat.category);
  };

  // Format lab performance data
  const getFormattedLabPerformance = () => {
    if (labPerformance.length === 0) {
      return [
        {
          id: "01",
          lab: "Lab Name",
          revenue: "₹0.00",
          tests: "00",
          patients: "00",
          pending: "00",
          tat: "0.0 hrs",
          reports: "00",
          growth: "00%",
          positive: true,
        },
      ];
    }
    return labPerformance.map((item, index) => ({
      id: String(index + 1).padStart(2, "0"),
      lab: item.labName || "Unknown Lab",
      revenue: formatCurrency(item.revenue || 0),
      tests: (item.tests || 0).toLocaleString(),
      patients: (item.patients || 0).toLocaleString(),
      pending: (item.pendingSamples || 0).toLocaleString(),
      tat: `${item.avgTatHours?.toFixed(1) || 0} hrs`,
      reports: (item.reportsGenerated || 0).toLocaleString(),
      growth: item.growthPct !== null && item.growthPct !== undefined
        ? `${item.growthPct > 0 ? "+" : ""}${item.growthPct.toFixed(1)}%`
        : "0%",
      // Only flag as a decline (red, down arrow) once the drop exceeds 0.5% —
      // smaller dips are noise and shouldn't read as alarming.
      positive: item.growthPct !== null && item.growthPct !== undefined ? item.growthPct >= -0.5 : true,
    }));
  };

  // Format doctors data
  const getFormattedDoctors = () => {
    if (topDoctors.length === 0) {
      return [
        {
          id: 1,
          srNo: "01",
          doctorName: "Dr.",
          revenue: "₹0.00",
        },
      ];
    }
    return topDoctors.map((item, index) => ({
      id: index + 1,
      srNo: String(index + 1).padStart(2, "0"),
      doctorName: item.doctorName || "Unknown Doctor",
      revenue: formatCurrency(item.revenue || 0),
    }));
  };

  // Stats data (KPIs)
  const stats = [
    {
      id: 1,
      title: "Total Labs",
      value: loading ? "..." : String(totalLabs),
      color: "text-secondary-700",
      icon: Building2,
    },
    {
      id: 2,
      title: "Total Admins",
      value: roleKpisLoading ? "..." : String(totalAdmins),
      color: "text-secondary-700",
      icon: HiOutlineUserGroup,
    },
    {
      id: 3,
      title: "Total Desk Users",
      value: roleKpisLoading ? "..." : String(totalDeskRoles),
      color: "text-secondary-700",
      icon: HiOutlineUsers,
    },
    {
      id: 4,
      title: "Total Technicians",
      value: roleKpisLoading ? "..." : String(totalTechnicians),
      color: "text-secondary-700",
      icon: PiGraduationCapThin,
    },
    {
      id: 5,
      title: "Total Tests",
      value: loading ? "..." : String(totalTests),
      color: "text-secondary-700",
      icon: PiFlaskLight,
    },
    {
      id: 6,
      title: "Pending Samples",
      value: loading ? "..." : String(pendingSamples),
      color: "text-secondary-700",
      icon: PiDna,
    },
    {
      id: 7,
      title: "Reports Generated",
      value: loading ? "..." : String(reportsGenerated),
      color: "text-secondary-700",
      icon: ClipboardCheck,
    },
    {
      id: 8,
      title: "Total Revenue",
      value: loading ? "..." : formatCurrency(totalRevenue),
      color: "text-secondary-700",
      icon: HiOutlineBanknotes,
    }
  ];

  const categoryChartData = getCategoryChartData();
  const packagesChartData = getPackagesChartData();
  const alertsData = getAlertsData();
  const tableData = getFormattedLabPerformance();
  const doctorsData = getFormattedDoctors();
  const earnings = getEarningsForCategory();
  const categoryOptions = getCategoriesForDropdown();
  const sortedTests = [...earnings.tests].sort((a, b) =>
    sortOrder === "desc" ? (b.grossEarnings || 0) - (a.grossEarnings || 0) : (a.grossEarnings || 0) - (b.grossEarnings || 0)
  );

  // Top labs data (revenue kept in raw currency units; formatted for display via getRevenueAxisConfig)
  const topLabs = revenueByLab.map((lab) => ({
    name: lab.labName || "Unknown Lab",
    revenue: lab.revenue || 0,
  }));

  const revenueAxisConfig = getRevenueAxisConfig(
    Math.max(0, ...revenueChartData.map((d: { revenue: number }) => d.revenue || 0))
  );
  const topLabsAxisConfig = getRevenueAxisConfig(
    Math.max(0, ...topLabs.map((lab) => lab.revenue))
  );

  // Helper to render filter dropdown
  const renderFilterDropdown = (
    currentFilter: DateFilterType,
    onFilterChange: (filter: DateFilterType) => void,
    customRange: DateRange,
    onCustomRangeChange: (range: DateRange) => void,
    isGlobal: boolean = false,
    stackCustomRange: boolean = false
  ) => {
    const filterOptions: { value: DateFilterType; label: string }[] = [
      { value: "currentFY", label: `Current FY: ${getShortFYLabel(dayjs())}` },
      { value: "week", label: "This Week" },
      { value: "month", label: "This Month" },
      { value: "year", label: "This Year" },
      { value: "custom", label: "Custom Date" },
    ];

    const maxDate = dayjs().format("YYYY-MM-DD");

    const dateInputClassName = `rounded-lg border border-pneutral-100 bg-base-white px-3 py-2 text-p3 text-pneutral-900 shadow-xsm focus:outline-none focus:ring-2 focus:ring-secondary-500 ${
      stackCustomRange ? "w-35" : ""
    }`;

    return (
      <div className={`flex gap-2 ${stackCustomRange ? "flex-col items-end" : "items-center"}`}>
        <select
          value={currentFilter}
          onChange={(e) => onFilterChange(e.target.value as DateFilterType)}
          className={`rounded-lg border border-pneutral-100 bg-pneutral-100 px-4 py-2 text-p3 font-medium text-pneutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 ${
            isGlobal ? "min-w-[180px]" : ""
          }`}
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {currentFilter === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customRange.startDate}
              max={maxDate}
              onChange={(e) =>
                onCustomRangeChange({
                  ...customRange,
                  startDate: e.target.value,
                })
              }
              className={dateInputClassName}
            />
            <span className="text-p3 text-pneutral-500">to</span>
            <input
              type="date"
              value={customRange.endDate}
              max={maxDate}
              onChange={(e) =>
                onCustomRangeChange({
                  ...customRange,
                  endDate: e.target.value,
                })
              }
              className={dateInputClassName}
            />
          </div>
        )}
      </div>
    );
  };

  // Helper to render the lab filter dropdown (All Labs + every lab under this super admin)
  const renderLabFilterDropdown = () => (
    <select
      value={selectedLabId}
      onChange={(e) => setSelectedLabId(e.target.value === "all" ? "all" : Number(e.target.value))}
      className="min-w-40 rounded-lg border border-pneutral-100 bg-pneutral-100 px-4 py-2 text-p3 font-medium text-pneutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500"
    >
      <option value="all">All Labs</option>
      {labs.map((lab) => (
        <option key={lab.id} value={lab.id}>
          {lab.name}
        </option>
      ))}
    </select>
  );

  // Custom tooltip for category pie chart
  const CategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-pneutral-100 bg-base-white p-4 shadow-lg min-w-[200px]">
          <p className="text-p3 font-semibold text-pneutral-900 mb-2">{data.name}</p>
          <div className="space-y-1 text-p3 text-pneutral-600">
            <p>Tests: <span className="font-semibold text-pneutral-900">{data.testCount.toLocaleString()}</span></p>
            <p>Revenue: <span className="font-semibold text-pneutral-900">₹{data.revenue.toLocaleString()}</span></p>
            <p>Discount: <span className="font-semibold text-pneutral-900">₹{data.discount.toLocaleString()}</span></p>
            <p>Paid: <span className="font-semibold text-pneutral-900">₹{data.paidRevenue.toLocaleString()}</span></p>
            <p>Due: <span className="font-semibold text-pneutral-900">₹{data.dueRevenue.toLocaleString()}</span></p>
            <p>Cash: <span className="font-semibold text-pneutral-900">₹{data.cashRevenue.toLocaleString()}</span></p>
            <p>UPI: <span className="font-semibold text-pneutral-900">₹{data.upiRevenue.toLocaleString()}</span></p>
            <p>Card: <span className="font-semibold text-pneutral-900">₹{data.cardRevenue.toLocaleString()}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for packages pie chart
  const PackageTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-pneutral-100 bg-base-white p-4 shadow-lg min-w-[200px]">
          <p className="text-p3 font-semibold text-pneutral-900 mb-2">{data.name}</p>
          <div className="space-y-1 text-p3 text-pneutral-600">
            <p>Revenue: <span className="font-semibold text-pneutral-900">₹{data.revenue.toLocaleString()}</span></p>
            <p>Discount: <span className="font-semibold text-pneutral-900">₹{data.discount.toLocaleString()}</span></p>
            <p>Paid: <span className="font-semibold text-pneutral-900">₹{data.paidRevenue.toLocaleString()}</span></p>
            <p>Due: <span className="font-semibold text-pneutral-900">₹{data.dueRevenue.toLocaleString()}</span></p>
            <p>Cash: <span className="font-semibold text-pneutral-900">₹{data.cashRevenue.toLocaleString()}</span></p>
            <p>UPI: <span className="font-semibold text-pneutral-900">₹{data.upiRevenue.toLocaleString()}</span></p>
            <p>Card: <span className="font-semibold text-pneutral-900">₹{data.cardRevenue.toLocaleString()}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for alerts pie chart
  const AlertTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-pneutral-100 bg-base-white p-4 shadow-lg">
          <p className="text-p3 font-semibold text-pneutral-900">{data.name}</p>
          <p className="text-p3 text-pneutral-600">
            Amount: <span className="font-semibold text-pneutral-900">₹{data.amount.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle sort toggle
  const toggleSort = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  return (
    <div className="space-y-4 bg-secondary-50 px-2">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-h3 font-heading font-bold text-pneutral-900">
              Cumulative Analytics
            </h1>
            <span className="rounded-full bg-secondary-100 px-4 py-1 text-label-l3 font-semibold text-secondary-700">
              Level 1: ALL Labs Overview
            </span>
            {refreshing && (
              <span className="text-xs text-pneutral-400 animate-pulse">Refreshing...</span>
            )}
            {lastUpdated && (
              <span className="text-xs text-pneutral-400 ml-2">
                Updated: {dayjs(lastUpdated).format("hh:mm:ss A")}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            {renderLabFilterDropdown()}
          </div>
          <div className="flex items-center gap-2">
            {renderFilterDropdown(
              globalFilter,
              setGlobalFilter,
              globalCustomRange,
              setGlobalCustomRange,
              true
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2 xl:grid-cols-8">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="rounded-lg border border-pneutral-100 bg-base-white p-2 shadow-xsm"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-50">
                  <Icon className={item.color} size={18} />
                </div>
                <div>
                  <h4 className=" min-h-[40px] text-p3 font-semibold text-pneutral-600">
                    {item.title}
                  </h4>
                  <h2 className=" text-h6 font-bold text-pneutral-900">{item.value}</h2>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
                {selectedLabName ? `Revenue Trend "${selectedLabName}"` : "Revenue Trend (All Labs)"}
              </h2>
              <p className="mt-1 text-p3 font-semibold text-pneutral-900">
                Total Revenue
                <span className="ml-1 font-semibold text-pneutral-900">
                  {formatCurrency(revenueTrendTotal)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {renderFilterDropdown(
                revenueFilter,
                setRevenueFilter,
                revenueCustomRange,
                setRevenueCustomRange,
                false
              )}
            </div>
          </div>
          <div className="h-[200px]">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B550FA" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#B550FA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#EAEAE9" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 14, fill: "#969793" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 14, fill: "#969793" }}
                    domain={[0, revenueAxisConfig.domainMax]}
                    ticks={revenueAxisConfig.ticks}
                    tickFormatter={revenueAxisConfig.formatTick}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, "Revenue"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#B550FA"
                    strokeWidth={3}
                    fill="url(#purpleGradient)"
                    dot={{ r: 4, fill: "#fff", stroke: "#B550FA", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-p3 text-pneutral-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Revenue Trend Top Labs */}
        <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
              {selectedLabName
                ? `Revenue Trend "${selectedLabName}"`
                : totalLabsForRevenue > 5
                  ? "Revenue Trend (Top 5 Labs)"
                  : "Revenue Trend Lab Wise"}
            </h2>
            <div className="flex items-center gap-3">
              {renderFilterDropdown(
                topLabsFilter,
                setTopLabsFilter,
                topLabsCustomRange,
                setTopLabsCustomRange,
                false
              )}
            </div>
          </div>
          <div className="space-y-4">
            {topLabs.length > 0 ? (
              topLabs.map((lab, index) => (
                <div key={index} className="grid grid-cols-[1.2fr_2.5fr_64px] items-center gap-5">
                  <p className="truncate text-p3 font-medium text-pneutral-900">{lab.name}</p>
                  <div className="relative h-4 overflow-hidden rounded-full bg-secondary-100">
                    <div
                      className="h-full rounded-full bg-secondary-700 transition-all duration-500"
                      style={{
                        width: `${Math.min((lab.revenue / topLabsAxisConfig.domainMax) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="w-16 text-right text-p3 font-semibold text-pneutral-900">
                    {topLabsAxisConfig.formatTick(lab.revenue)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-pneutral-500">No data available</div>
            )}
          </div>
        <div className="grid grid-cols-[1.2fr_2.5fr_64px] gap-5 mt-5">
  <div />

 <div className="relative h-6">
  {topLabsAxisConfig.ticks.map((tick, index) => (
    <span
      key={tick}
      className="absolute -translate-x-1/2 text-p3 text-pneutral-900"
      style={{
        left: `${(index / (topLabsAxisConfig.ticks.length - 1)) * 100}%`,
      }}
    >
      {topLabsAxisConfig.formatTick(tick)}
    </span>
  ))}
</div>

  <div />
</div>
        </div>
      </div>

      {/* Top Cards - Test by Category with table */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Test By Category - Pie Chart */}
        <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-p4 font-heading font-semibold text-pneutral-900">Test by Category</h2>
            {renderFilterDropdown(
              categoryFilter,
              setCategoryFilter,
              categoryCustomRange,
              setCategoryCustomRange,
              false
            )}
          </div>
          <div className="flex items-center justify-between">
            {categoryChartData.length > 0 ? (
              <>
                <div className="h-[270px] w-[270px]">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        dataKey="value"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={0}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {categoryChartData.map((item, index) => (
                          <Cell key={index} fill={item.color} />
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="47%"
                        textAnchor="middle"
                        className="fill-pneutral-900 text-label-l3 font-medium"
                      >
                        Total
                      </text>
                      <text
                        x="50%"
                        y="57%"
                        textAnchor="middle"
                        className="fill-pneutral-900 text-h4 font-medium"
                      >
                        {(testCategoriesSummary.totalTests || 0).toLocaleString()}
                      </text>
                      <Tooltip content={<CategoryTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {categoryChartData.map((item) => (
                    <div key={item.name} className="flex w-44 items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                        <span className="text-p3 text-pneutral-700">{item.name}</span>
                      </div>
                      <span className="text-p3 font-medium text-pneutral-600">{item.testCount}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full py-8 text-center text-pneutral-500">
                No test data available
              </div>
            )}
          </div>
        </div>

        {/* Revenue by Test - Table */}
        <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
              Revenue by Test
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-pneutral-100 bg-pneutral-100 px-4 py-2 text-p3 font-medium text-pneutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500"
              >
                <option value="all">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            {sortedTests.length > 0 ? (
              <table className="min-w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-pneutral-100 bg-pneutral-50">
                    <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">SI No.</th>
                    <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">Test Name</th>
                    <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">Paid</th>
                    <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">Due</th>
                    <th
                      className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900 cursor-pointer hover:text-secondary-700 flex items-center justify-end gap-1"
                      onClick={toggleSort}
                    >
                      Total Amount
                      {sortOrder === "desc" ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronUp size={16} />
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTests.map((test, index) => (
                    <tr key={test.testId || index} className="border-b border-pneutral-100 transition hover:bg-pneutral-50">
                      <td className="px-4 py-2 text-p3 text-pneutral-900">{index + 1}</td>
                      <td className="px-4 py-2 text-p3 font-medium text-pneutral-900">
                        {test.testName || "Unknown"}
                      </td>
                      <td className="px-4 py-2 text-p3 text-right text-pneutral-900">
                        ₹{test.revenue?.toLocaleString() || "0"}
                      </td>
                      <td className="px-4 py-2 text-p3 text-right text-pneutral-900">
                        ₹{test.dueAmount?.toLocaleString() || "0"}
                      </td>
                      <td className="px-4 py-2 text-p3 text-right font-semibold text-pneutral-900">
                        ₹{test.grossEarnings?.toLocaleString() || "0"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="w-full py-8 text-center text-pneutral-500">
                No test data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Stats - 33:33:34 Layout */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Packages Summary - 33% */}
        <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
              Packages Summary
            </h2>
            {renderFilterDropdown(
              packagesFilter,
              setPackagesFilter,
              packagesCustomRange,
              setPackagesCustomRange,
              false,
              true
            )}
          </div>
          <div className="flex items-center justify-between">
            {packagesChartData.length > 0 ? (
              <>
                <div className="h-[200px] w-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={packagesChartData}
                        dataKey="value"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={0}
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {packagesChartData.map((item, index) => (
                          <Cell key={index} fill={item.color} />
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="47%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-pneutral-900 text-xs font-medium"
                      >
                        Total
                      </text>
                      <text
                        x="50%"
                        y="57%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-pneutral-900 text-sm font-semibold"
                      >
                        ₹{(packageSummary.grossBilled || 0).toLocaleString()}
                      </text>
                      <Tooltip content={<PackageTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 flex-1 ml-2">
                  {packagesChartData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                        <span className="text-p3 text-pneutral-700 truncate max-w-[100px]">{item.name}</span>
                      </div>
                      <span className="text-p3 font-medium text-pneutral-600">{item.visitCount}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full py-8 text-center text-pneutral-500">
                No package data available
              </div>
            )}
          </div>
        </div>

        {/* Billing Summary - 33% */}
        <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
          <div className="px-2 pt-2">
            <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
              Billing Summary
            </h2>
          </div>
          <div className="flex items-center justify-between px-2 pb-2">
            {alertsData.some(item => item.value > 0) ? (
              <>
                <div className="h-[180px] w-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={alertsData}
                        dataKey="value"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={0}
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {alertsData.map((item, index) => (
                          <Cell key={index} fill={item.color} />
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="47%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-pneutral-900 text-xs font-medium"
                      >
                        Total
                      </text>
                      <text
                        x="50%"
                        y="57%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-pneutral-900 text-sm font-semibold"
                      >
                        ₹{(billingSummary.netBilled || 0).toLocaleString()}
                      </text>
                      <Tooltip content={<AlertTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 flex-1 ml-2">
                  {alertsData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-p3 font-medium text-pneutral-700">{item.name}</span>
                      </div>
                      <span className="text-p3 font-semibold text-pneutral-600">
                        ₹{item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full py-8 text-center text-pneutral-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Top Referring Doctors - 34% */}
        <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
          <div className="flex items-center justify-between px-2 pt-1">
            <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
              Top Referring Doctors
            </h2>
            {renderFilterDropdown(
              doctorsFilter,
              setDoctorsFilter,
              doctorsCustomRange,
              setDoctorsCustomRange,
              false,
              true
            )}
          </div>
          <div className="mt-2 overflow-x-auto max-h-[220px] overflow-y-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-y border-pneutral-100 bg-pneutral-50">
                  <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">SI No.</th>
                  <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">Doctor Name</th>
                  <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">Revenue(₹)</th>
                </tr>
              </thead>
              <tbody>
                {doctorsData.map((doctor) => (
                  <tr key={doctor.id} className="border-b border-pneutral-100 transition hover:bg-pneutral-50">
                    <td className="px-4 py-2 text-p3 text-pneutral-900">{doctor.srNo}</td>
                    <td className="px-4 py-2 text-p3 font-medium text-pneutral-900">{doctor.doctorName}</td>
                    <td className="px-4 py-2 text-p3 text-right font-medium text-pneutral-900">{doctor.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lab Performance Summary */}
      <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
            Lab Performance Summary
          </h2>
          {renderFilterDropdown(
            performanceFilter,
            setPerformanceFilter,
            performanceCustomRange,
            setPerformanceCustomRange,
            false
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-0">
            <thead>
              <tr className="border-b border-pneutral-100 bg-pneutral-50">
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">SI No.</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Lab Name</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Revenue</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Tests</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Patients</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Pending Samples</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Avg TAT</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Reports Generated</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Growth (Revenue)</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item) => (
                <tr key={item.id} className="border-b border-pneutral-100 transition hover:bg-pneutral-50">
                  <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{item.id}</td>
                  <td className="border-b border-pneutral-100 px-4 py-2 font-medium text-pneutral-900">{item.lab}</td>
                  <td className="border-b border-pneutral-100 px-4 py-2 font-medium text-pneutral-900">{item.revenue}</td>
                  <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{item.tests}</td>
                  <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{item.patients}</td>
                  <td className="border-b border-pneutral-100 px-4 py-2 font-medium text-danger-600">{item.pending}</td>
                  <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{item.tat}</td>
                  <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{item.reports}</td>
                  <td className="border-b border-pneutral-100 px-4 py-2">
                    <div
                      className={`flex items-center gap-2 font-medium ${
                        item.positive ? "text-success-600" : "text-warning-500"
                      }`}
                    >
                      {item.positive ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                      {item.growth}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing Grid Report */}
      <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
            Billing Report
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadGridCsv}
              disabled={gridLoading || gridData.rows.length === 0}
              className="rounded-lg border border-success-500 bg-[#55D400] px-4 py-2 text-p3 font-medium text-pneutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Download as CSV
            </button>
            {renderFilterDropdown(
              gridFilter,
              setGridFilter,
              gridCustomRange,
              setGridCustomRange,
              false
            )}
          </div>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="min-w-full border-separate border-spacing-y-0">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-pneutral-100 bg-pneutral-50">
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">SI No.</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Visit Code</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Patient Name</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Phone</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Doctor</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Visit Type</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Visit Status</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Billing Code</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Billing Date</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Payment Status</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Payment Method</th>
                <th className="px-4 py-4 text-right text-label-l3 font-semibold text-pneutral-900">Total Amount</th>
                <th className="px-4 py-4 text-right text-label-l3 font-semibold text-pneutral-900">Discount</th>
                <th className="px-4 py-4 text-right text-label-l3 font-semibold text-pneutral-900">Net Amount</th>
                <th className="px-4 py-4 text-right text-label-l3 font-semibold text-pneutral-900">Paid</th>
                <th className="px-4 py-4 text-right text-label-l3 font-semibold text-pneutral-900">Due</th>
                <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Lab Name</th>
              </tr>
            </thead>
            <tbody>
              {gridLoading ? (
                <tr>
                  <td colSpan={17} className="px-4 py-8 text-center text-pneutral-500">
                    Loading...
                  </td>
                </tr>
              ) : gridData.rows.length > 0 ? (
                gridData.rows.map((row, index) => (
                  <tr key={row.billingId ?? index} className="border-b border-pneutral-100 transition hover:bg-pneutral-50">
                    <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">
                      {index + 1}
                    </td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.visitCode}</td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.patientName}</td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.patientPhone}</td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.doctorName || "N/A"}</td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.visitType}</td>
                    <td className={`border-b border-pneutral-100 px-4 py-2 text-p3 font-medium ${getVisitStatusColorClass(row.visitStatus)}`}>
                      {row.visitStatus}
                    </td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.billingCode}</td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.billingDate}</td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.paymentStatus}</td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.paymentMethod}</td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-right text-p3 text-pneutral-900">
                      ₹{(row.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-right text-p3 text-pneutral-900">
                      ₹{(row.discount || 0).toLocaleString()}
                    </td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-right text-p3 text-pneutral-900">
                      ₹{(row.netAmount || 0).toLocaleString()}
                    </td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-right font-medium text-pneutral-900">
                      ₹{(row.paidAmount || 0).toLocaleString()}
                    </td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-right font-medium text-danger-600">
                      ₹{(row.dueAmount || 0).toLocaleString()}
                    </td>
                    <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.labName}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={17} className="px-4 py-8 text-center text-pneutral-500">
                    No billing records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 px-1">
          <p className="text-p3 text-pneutral-500">
            {gridData.totalRecords > 0 ? `${gridData.totalRecords} records` : "0 records"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminStats;






















// code dated 28.07.2026....................

// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState, useEffect, useCallback, useMemo } from "react";
// import dayjs from "dayjs";

// import {
//   Building2,
//   ClipboardCheck,
//   ArrowUp,
//   ArrowDown,
//   ChevronUp,
//   ChevronDown,
// } from "lucide-react";

// import {
//   CartesianGrid,
//   ResponsiveContainer,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Area,
//   AreaChart,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import { HiOutlineBanknotes, HiOutlineUserGroup, HiOutlineUsers } from "react-icons/hi2";
// import { PiDna, PiFlaskLight, PiGraduationCapThin } from "react-icons/pi";

// // Import services
// import { useLabs } from "@/context/LabContext";
// import {
//   getAllStats,
//   getGridReport,
// } from "../../../../../../services/statisticsService";
// import {
//   DetailedBilling,
//   EarningsByCategoryData,
//   GridReportResponse,
//   GridReportRow,
//   LabPerformanceRow,
//   RevenueByLabRow,
//   RoleLabWiseTotal,
//   TestCategoryRow,
//   TopReferringDoctor,
// } from "@/types/statisticsData";
// import {
//   downloadCSV,
//   formatAmount as formatCsvAmount,
//   formatDate as formatCsvDate,
//   generateCSVFilename,
// } from "@/utils/csvUtils";

// type DateFilterType = "currentFY" | "week" | "month" | "year" | "custom";

// interface DateRange {
//   startDate: string;
//   endDate: string;
// }

// // Helper: Get financial year start and end
// const getFinancialYear = (date: dayjs.Dayjs): { start: string; end: string } => {
//   const year = date.year();
//   if (date.month() >= 3) {
//     return {
//       start: `${year}-04-01`,
//       end: `${year + 1}-03-31`,
//     };
//   } else {
//     return {
//       start: `${year - 1}-04-01`,
//       end: `${year}-03-31`,
//     };
//   }
// };

// // Helper: Get short FY label (e.g., "26-27")
// const getShortFYLabel = (date: dayjs.Dayjs): string => {
//   const fy = getFinancialYear(date);
//   const startYear = fy.start.split('-')[0].slice(-2);
//   const endYear = fy.end.split('-')[0].slice(-2);
//   return `${startYear}-${endYear}`;
// };

// // Helper: Get date range based on filter
// const getDateRange = (filter: DateFilterType, customRange?: DateRange): { startDate?: string; endDate?: string } => {
//   const now = dayjs();

//   switch (filter) {
//     case "currentFY": {
//       const fy = getFinancialYear(now);
//       return {
//         startDate: fy.start,
//         endDate: now.format("YYYY-MM-DD"),
//       };
//     }
//     case "week": {
//       const startOfWeek = now.startOf('week');
//       return {
//         startDate: startOfWeek.format("YYYY-MM-DD"),
//         endDate: now.format("YYYY-MM-DD"),
//       };
//     }
//     case "month": {
//       return {
//         startDate: now.startOf("month").format("YYYY-MM-DD"),
//         endDate: now.format("YYYY-MM-DD"),
//       };
//     }
//     case "year": {
//       return {
//         startDate: `${now.year()}-01-01`,
//         endDate: now.format("YYYY-MM-DD"),
//       };
//     }
//     case "custom":
//       if (customRange?.startDate && customRange?.endDate) {
//         const endDate = dayjs(customRange.endDate);
//         const today = dayjs();
//         const validEndDate = endDate.isAfter(today) ? today : endDate;
//         return {
//           startDate: customRange.startDate,
//           endDate: validEndDate.format("YYYY-MM-DD"),
//         };
//       }
//       return { startDate: undefined, endDate: undefined };
//     default:
//       return { startDate: undefined, endDate: undefined };
//   }
// };

// // Helper: ordinal suffix (1st, 2nd, 3rd, 4th...)
// const getOrdinalSuffix = (num: number): string => {
//   if (num === 1) return "st";
//   if (num === 2) return "nd";
//   if (num === 3) return "rd";
//   return "th";
// };

// // Helper: date-labeled buckets (label + start/end as YYYY-MM-DD) for the revenue chart's
// // x-axis, one per filter type. Each bucket's start/end is fed into getAllStats so the
// // chart bars break the section's date range into per-day/week/month segments, the same
// // way the global/section filter dropdowns have always driven this chart.
// const getRevenueBuckets = (
//   filter: DateFilterType,
//   customRange: DateRange
// ): { label: string; start: string; end: string }[] => {
//   const buckets: { label: string; start: dayjs.Dayjs; end: dayjs.Dayjs }[] = [];

//   switch (filter) {
//     case "currentFY": {
//       const fyStart = dayjs(getFinancialYear(dayjs()).start);
//       const today = dayjs();
//       let current = fyStart.startOf('month');
//       while (current.isBefore(today) || current.isSame(today, 'month')) {
//         buckets.push({ label: current.format("MMM"), start: current.startOf('month'), end: current.endOf('month') });
//         current = current.add(1, 'month');
//       }
//       break;
//     }
//     case "week": {
//       const today = dayjs();
//       const startOfWeek = today.startOf('week');
//       let current = startOfWeek.clone();
//       while (current.isBefore(today) || current.isSame(today, 'day')) {
//         buckets.push({ label: current.format("ddd"), start: current.startOf('day'), end: current.endOf('day') });
//         current = current.add(1, 'day');
//       }
//       break;
//     }
//     case "month": {
//       const today = dayjs();
//       const startOfMonthWeek = today.startOf('month').startOf('week');
//       const startOfCurrentWeek = today.startOf('week');
//       const totalWeeks = startOfCurrentWeek.diff(startOfMonthWeek, 'week') + 1;
//       for (let i = 0; i < totalWeeks; i++) {
//         const weekStart = startOfMonthWeek.add(i * 7, 'day');
//         buckets.push({
//           label: `${i + 1}${getOrdinalSuffix(i + 1)} Week`,
//           start: weekStart.startOf('day'),
//           end: weekStart.add(6, 'day').endOf('day'),
//         });
//       }
//       break;
//     }
//     case "year": {
//       const today = dayjs();
//       let current = dayjs().startOf('year');
//       while (current.isBefore(today) || current.isSame(today, 'month')) {
//         buckets.push({ label: current.format("MMM"), start: current.startOf('month'), end: current.endOf('month') });
//         current = current.add(1, 'month');
//       }
//       break;
//     }
//     case "custom": {
//       if (customRange.startDate && customRange.endDate) {
//         const start = dayjs(customRange.startDate);
//         const end = dayjs(customRange.endDate);
//         const diffDays = end.diff(start, 'days');

//         if (diffDays <= 7) {
//           for (let i = 0; i <= diffDays; i++) {
//             const day = start.add(i, 'days');
//             buckets.push({ label: day.format("DD MMM"), start: day.startOf('day'), end: day.endOf('day') });
//           }
//         } else if (diffDays <= 31) {
//           for (let i = 0; i <= diffDays; i += 3) {
//             const segStart = start.add(i, 'days');
//             const segEndCandidate = segStart.add(2, 'days');
//             const segEnd = segEndCandidate.isAfter(end) ? end : segEndCandidate;
//             buckets.push({ label: segStart.format("DD MMM"), start: segStart.startOf('day'), end: segEnd.endOf('day') });
//           }
//           if (buckets.length > 0) {
//             buckets[buckets.length - 1].end = end.endOf('day');
//           }
//         } else {
//           let current = start.startOf('month');
//           while (current.isBefore(end) || current.isSame(end, 'month')) {
//             const bucketStart = current.isBefore(start) ? start : current;
//             const monthEnd = current.endOf('month');
//             const bucketEnd = monthEnd.isAfter(end) ? end : monthEnd;
//             buckets.push({ label: current.format("MMM YY"), start: bucketStart.startOf('day'), end: bucketEnd.endOf('day') });
//             current = current.add(1, 'month');
//           }
//         }
//       }
//       break;
//     }
//     default:
//       break;
//   }

//   return buckets.map((b) => ({
//     label: b.label,
//     start: b.start.format("YYYY-MM-DD"),
//     end: b.end.format("YYYY-MM-DD"),
//   }));
// };

// // Role-count KPIs (totalAdmins/totalTechnicians/totalDeskRoles) come back as a plain
// // number when the request is scoped to one lab, or as { total, labWise } when
// // aggregating across every lab - see AllStatsKpis / RoleLabWiseTotal.
// const extractRoleCount = (value: number | RoleLabWiseTotal | undefined | null): number => {
//   if (value == null) return 0;
//   if (typeof value === "number") return value;
//   return value.total ?? 0;
// };

// // Visit Status color coding for the Billing Grid Report table: completed -> success,
// // cancelled -> warning, pending -> danger. Backend values are uppercase (e.g. "CANCELLED")
// // but this normalizes case defensively.
// const getVisitStatusColorClass = (status?: string): string => {
//   switch ((status || "").toUpperCase()) {
//     case "COMPLETED":
//       return "text-success-500";
//     case "CANCELLED":
//       return "text-warning-500";
//     case "PENDING":
//       return "text-danger-500";
//     default:
//       return "text-pneutral-900";
//   }
// };

// // Builds the CSV for the Billing Grid Report table/export - one row per visit/billing record.
// const buildGridReportCsv = (rows: GridReportRow[]): string => {
//   const headers = [
//     "SI No.",
//     "Visit Code",
//     "Patient Name",
//     "Patient Phone",
//     "Doctor Name",
//     "Visit Type",
//     "Visit Status",
//     "Billing Code",
//     "Billing Date",
//     "Payment Status",
//     "Payment Method",
//     "Total Amount",
//     "Discount",
//     "Net Amount",
//     "Paid Amount",
//     "Due Amount",
//     "Lab Name",
//   ];

//   const csvRows = rows.map((row, index) =>
//     [
//       index + 1,
//       row.visitCode,
//       row.patientName,
//       row.patientPhone,
//       row.doctorName || "N/A",
//       row.visitType,
//       row.visitStatus,
//       row.billingCode,
//       formatCsvDate(row.billingDate),
//       row.paymentStatus,
//       row.paymentMethod,
//       formatCsvAmount(row.totalAmount),
//       formatCsvAmount(row.discount),
//       formatCsvAmount(row.netAmount),
//       formatCsvAmount(row.paidAmount),
//       formatCsvAmount(row.dueAmount),
//       row.labName,
//     ]
//       .map((field) => `"${String(field ?? "").replace(/"/g, '""')}"`)
//       .join(",")
//   );

//   return [headers.join(","), ...csvRows].join("\n");
// };

// // Format currency
// const formatCurrency = (amount: number): string => {
//   if (amount >= 100000) {
//     return `₹${(amount / 100000).toFixed(1)}L`;
//   }
//   if (amount >= 1000) {
//     return `₹${(amount / 1000).toFixed(1)}K`;
//   }
//   return `₹${amount}`;
// };

// // Revenue axis unit tiers (Indian numbering: K -> L -> Cr)
// const REVENUE_AXIS_UNITS = [
//   { limit: 100000, divisor: 1000, suffix: "K" },
//   { limit: 10000000, divisor: 100000, suffix: "L" },
//   { limit: Infinity, divisor: 10000000, suffix: "Cr" },
// ];

// // Builds a "nice" 0..max axis (6 ticks) that scales with the data:
// // 0-10K in 2K steps, 10K-50K in 10K steps, then 1L/10L/1Cr/10Cr steps and so on.
// const getRevenueAxisConfig = (maxValue: number) => {
//   const safeMax = Math.max(maxValue, 0);
//   let step = 2000;
//   while (step * 5 < safeMax) {
//     step = step < 10000 ? 10000 : step * 10;
//   }
//   const domainMax = step * 5;
//   const ticks = Array.from({ length: 6 }, (_, i) => i * step);
//   const unit =
//     REVENUE_AXIS_UNITS.find((u) => domainMax < u.limit) ||
//     REVENUE_AXIS_UNITS[REVENUE_AXIS_UNITS.length - 1];

//   const formatTick = (value: number): string => {
//     const scaled = Math.round((value / unit.divisor) * 10) / 10;
//     return `${scaled}${unit.suffix}`;
//   };

//   return { domainMax, ticks, formatTick };
// };

// // Color constants for charts
// const CATEGORY_COLORS = ["#4F6BED", "#55D400", "#8B5CF6", "#FDBA12", "#F75A5A", "#4C0FAE", "#6D28D9", "#38B000"];
// const PACKAGE_COLORS = ["#4F6BED", "#55D400", "#8B5CF6", "#FDBA12", "#F75A5A", "#4C0FAE"];

// // Billing Grid Report shows every row with no pagination in the UI, but the backend
// // endpoint itself is still paginated - this is the page size used internally to pull
// // every page and stitch them into one full row list.
// const GRID_FETCH_PAGE_SIZE = 200;

// // Defaults for the nested pieces of DetailedBilling before the first fetch resolves.
// const emptyPaymentMode = { cash: 0, upi: 0, card: 0 };
// const emptyBillingSummary: DetailedBilling["summary"] = {
//   totalBillings: 0,
//   grossBilled: 0,
//   totalDiscount: 0,
//   totalGst: 0,
//   netBilled: 0,
//   totalPaid: 0,
//   totalDue: 0,
//   paymentMode: emptyPaymentMode,
// };
// const emptyTestsSummary: DetailedBilling["testsSummary"] = {
//   totalCategories: 0,
//   totalTests: 0,
//   grossBilled: 0,
//   discount: 0,
//   paid: 0,
//   due: 0,
//   paymentMode: emptyPaymentMode,
// };
// const emptyPackageSummary: DetailedBilling["packageSummary"] = {
//   totalPackages: 0,
//   totalVisits: 0,
//   grossBilled: 0,
//   discount: 0,
//   paid: 0,
//   due: 0,
//   paymentMode: emptyPaymentMode,
// };

// const SuperAdminStats = () => {
//   const { labs } = useLabs();

//   // Loading states
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // ========== LAB FILTER ==========
//   // "all" = cumulative view across every lab the super admin owns; otherwise
//   // every section below is scoped to that single lab via the labId query param.
//   const [selectedLabId, setSelectedLabId] = useState<number | "all">("all");
//   const selectedLabName = useMemo(
//     () => (selectedLabId === "all" ? null : labs.find((lab) => lab.id === selectedLabId)?.name ?? null),
//     [selectedLabId, labs]
//   );

//   // ========== UNIVERSAL DATE FILTER (Global) ==========
//   const [globalFilter, setGlobalFilter] = useState<DateFilterType>("currentFY");
//   const [globalCustomRange, setGlobalCustomRange] = useState<DateRange>({
//     startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
//     endDate: dayjs().format("YYYY-MM-DD"),
//   });

//   // ========== INDIVIDUAL SECTION FILTERS ==========
//   const [revenueFilter, setRevenueFilter] = useState<DateFilterType>("currentFY");
//   const [revenueCustomRange, setRevenueCustomRange] = useState<DateRange>({
//     startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
//     endDate: dayjs().format("YYYY-MM-DD"),
//   });

//   const [topLabsFilter, setTopLabsFilter] = useState<DateFilterType>("currentFY");
//   const [topLabsCustomRange, setTopLabsCustomRange] = useState<DateRange>({
//     startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
//     endDate: dayjs().format("YYYY-MM-DD"),
//   });

//   const [categoryFilter, setCategoryFilter] = useState<DateFilterType>("currentFY");
//   const [categoryCustomRange, setCategoryCustomRange] = useState<DateRange>({
//     startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
//     endDate: dayjs().format("YYYY-MM-DD"),
//   });

//   const [packagesFilter, setPackagesFilter] = useState<DateFilterType>("currentFY");
//   const [packagesCustomRange, setPackagesCustomRange] = useState<DateRange>({
//     startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
//     endDate: dayjs().format("YYYY-MM-DD"),
//   });

//   const [performanceFilter, setPerformanceFilter] = useState<DateFilterType>("currentFY");
//   const [performanceCustomRange, setPerformanceCustomRange] = useState<DateRange>({
//     startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
//     endDate: dayjs().format("YYYY-MM-DD"),
//   });

//   const [doctorsFilter, setDoctorsFilter] = useState<DateFilterType>("currentFY");
//   const [doctorsCustomRange, setDoctorsCustomRange] = useState<DateRange>({
//     startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
//     endDate: dayjs().format("YYYY-MM-DD"),
//   });

//   const [gridFilter, setGridFilter] = useState<DateFilterType>("currentFY");
//   const [gridCustomRange, setGridCustomRange] = useState<DateRange>({
//     startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
//     endDate: dayjs().format("YYYY-MM-DD"),
//   });

//   // State for all metrics
//   // Total Labs: org-wide count owned by the current super admin, unaffected by
//   // the date or lab filters (the backend endpoint backing it takes no such params).
//   const [totalLabs, setTotalLabs] = useState<number>(0);

//   // Admins/technicians/desk roles: scoped to the selected lab (or all labs), but
//   // deliberately NOT re-fetched when the date filter changes - see the dedicated
//   // effect below that calls getAllStats without startDate/endDate.
//   const [totalAdmins, setTotalAdmins] = useState<number>(0);
//   const [totalTechnicians, setTotalTechnicians] = useState<number>(0);
//   const [totalDeskRoles, setTotalDeskRoles] = useState<number>(0);
//   const [roleKpisLoading, setRoleKpisLoading] = useState<boolean>(true);

//   // Remaining KPIs come from getAllStats().kpis, scoped by the global filter + selected lab.
//   const [totalTests, setTotalTests] = useState<number>(0);
//   const [totalRevenue, setTotalRevenue] = useState<number>(0);
//   const [reportsGenerated, setReportsGenerated] = useState<number>(0);
//   const [pendingSamples, setPendingSamples] = useState<number>(0);

//   // Billing Summary card - independent of the test-category/package sections,
//   // sourced from detailedBilling.summary on the global-filtered call.
//   const [billingSummary, setBillingSummary] = useState<DetailedBilling["summary"]>(emptyBillingSummary);

//   // Test by Category pie chart
//   const [testCategories, setTestCategories] = useState<TestCategoryRow[]>([]);
//   const [testCategoriesSummary, setTestCategoriesSummary] = useState<DetailedBilling["testsSummary"]>(emptyTestsSummary);

//   // Revenue by Test - per-test drilldown table with a category filter dropdown
//   const [earningsData, setEarningsData] = useState<EarningsByCategoryData>({
//     summary: { totalCategories: 0, totalTests: 0, totalRevenue: 0, totalDue: 0 },
//     categories: [],
//   });
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");

//   // Revenue Trend (All Labs) card - trend is pre-bucketed by day from the backend.
//   const [revenueTrendTotal, setRevenueTrendTotal] = useState<number>(0);
//   const [revenueChartData, setRevenueChartData] = useState<Array<{ label: string; revenue: number }>>([]);

//   // Revenue Trend (Top 5 Labs) card
//   const [revenueByLab, setRevenueByLab] = useState<RevenueByLabRow[]>([]);

//   const [labPerformance, setLabPerformance] = useState<LabPerformanceRow[]>([]);
//   const [topDoctors, setTopDoctors] = useState<TopReferringDoctor[]>([]);

//   // Packages Summary card
//   const [packageSummary, setPackageSummary] = useState<DetailedBilling["packageSummary"]>(emptyPackageSummary);
//   const [packages, setPackages] = useState<DetailedBilling["packages"]>([]);

//   // Billing Grid Report table - shows every row (no pagination), own filter, CSV export
//   const emptyGridData: GridReportResponse = { page: 0, size: 0, totalRecords: 0, totalPages: 0, rows: [] };
//   const [gridData, setGridData] = useState<GridReportResponse>(emptyGridData);
//   const [gridLoading, setGridLoading] = useState<boolean>(true);

//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

//   // Sync individual filters with global filter when global changes
//   useEffect(() => {
//     setRevenueFilter(globalFilter);
//     setTopLabsFilter(globalFilter);
//     setCategoryFilter(globalFilter);
//     setPackagesFilter(globalFilter);
//     setPerformanceFilter(globalFilter);
//     setDoctorsFilter(globalFilter);
//     setGridFilter(globalFilter);
//   }, [globalFilter]);

//   // Sync custom ranges when global custom range changes
//   useEffect(() => {
//     if (globalFilter === "custom") {
//       setRevenueCustomRange(globalCustomRange);
//       setTopLabsCustomRange(globalCustomRange);
//       setCategoryCustomRange(globalCustomRange);
//       setPackagesCustomRange(globalCustomRange);
//       setPerformanceCustomRange(globalCustomRange);
//       setDoctorsCustomRange(globalCustomRange);
//       setGridCustomRange(globalCustomRange);
//     }
//   }, [globalCustomRange, globalFilter]);

//   // Every section below hits the same consolidated endpoint, scoped to whichever
//   // lab is currently selected ("all" omits labId so the backend aggregates every lab).
//   const fetchStats = useCallback(
//     (startDate?: string, endDate?: string) =>
//       getAllStats(selectedLabId === "all" ? undefined : selectedLabId, startDate, endDate),
//     [selectedLabId]
//   );

//   // Total Labs / Admins / Technicians / Desk Roles KPIs: re-fetched only when the
//   // selected lab changes, deliberately independent of every date filter (global or
//   // per-section) - always calls getAllStats with no startDate/endDate. totalLabs comes
//   // back as 1 when a specific lab is selected (backend scopes it), or the full count
//   // owned by the super admin when "All Labs" is selected.
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       setRoleKpisLoading(true);
//       try {
//         const stats = await fetchStats(undefined, undefined);
//         if (cancelled) return;
//         setTotalLabs(stats.kpis?.totalLabs || 0);
//         setTotalAdmins(extractRoleCount(stats.kpis?.totalAdmins));
//         setTotalTechnicians(extractRoleCount(stats.kpis?.totalTechnicians));
//         setTotalDeskRoles(extractRoleCount(stats.kpis?.totalDeskRoles));
//       } catch (error) {
//         console.error("Error fetching role KPIs:", error);
//         if (!cancelled) {
//           setTotalLabs(0);
//           setTotalAdmins(0);
//           setTotalTechnicians(0);
//           setTotalDeskRoles(0);
//         }
//       } finally {
//         if (!cancelled) setRoleKpisLoading(false);
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [fetchStats]);

//   // Fetch function
//   const fetchAllData = useCallback(async (silent = false) => {
//     if (!silent) {
//       setLoading(true);
//     } else {
//       setRefreshing(true);
//     }

//     try {
//       // 1. Remaining KPIs + Billing Summary card, scoped by the GLOBAL filter + selected lab
//       const globalRange = getDateRange(globalFilter, globalCustomRange);
//       try {
//         const globalStats = await fetchStats(globalRange.startDate, globalRange.endDate);
//         setTotalTests(globalStats.kpis?.totalTests || 0);
//         setTotalRevenue(globalStats.kpis?.totalRevenue || 0);
//         setReportsGenerated(globalStats.kpis?.reportsGenerated || 0);
//         setPendingSamples(globalStats.kpis?.pendingSamples || 0);
//         setBillingSummary(globalStats.detailedBilling?.summary || emptyBillingSummary);
//       } catch (error) {
//         console.error("Error fetching global stats:", error);
//         setTotalTests(0);
//         setTotalRevenue(0);
//         setReportsGenerated(0);
//         setPendingSamples(0);
//         setBillingSummary(emptyBillingSummary);
//       }

//       // 3. Revenue trend with its OWN filter. The header total comes from the full-range
//       // call; each chart bar comes from re-querying getAllStats for just that bucket's
//       // range, same bucketing scheme (day/week/month, by filter type) as before.
//       const revenueRange = getDateRange(revenueFilter, revenueCustomRange);
//       if (revenueRange.startDate && revenueRange.endDate) {
//         try {
//           const revenueTotalStats = await fetchStats(revenueRange.startDate, revenueRange.endDate);
//           setRevenueTrendTotal(revenueTotalStats.revenueTrend?.totalRevenue || 0);
//         } catch (error) {
//           console.error("Error fetching revenue section total:", error);
//           setRevenueTrendTotal(0);
//         }

//         const buckets = getRevenueBuckets(revenueFilter, revenueCustomRange);
//         try {
//           const bucketResults = await Promise.all(
//             buckets.map(async (bucket) => {
//               try {
//                 const bucketStats = await fetchStats(bucket.start, bucket.end);
//                 return { label: bucket.label, revenue: bucketStats.revenueTrend?.totalRevenue || 0 };
//               } catch (error) {
//                 console.error(`Error fetching revenue bucket ${bucket.label}:`, error);
//                 return { label: bucket.label, revenue: 0 };
//               }
//             })
//           );
//           setRevenueChartData(bucketResults);
//         } catch (error) {
//           console.error("Error fetching revenue chart data:", error);
//           setRevenueChartData([]);
//         }
//       } else {
//         setRevenueTrendTotal(0);
//         setRevenueChartData([]);
//       }

//       // 4. Revenue by lab (top 5) with its OWN filter
//       const topLabsRange = getDateRange(topLabsFilter, topLabsCustomRange);
//       try {
//         const topLabsStats = await fetchStats(topLabsRange.startDate, topLabsRange.endDate);
//         setRevenueByLab((topLabsStats.revenueByLab || []).slice(0, 5));
//       } catch (error) {
//         console.error("Error fetching revenue by lab:", error);
//         setRevenueByLab([]);
//       }

//       // 5. Packages summary with its OWN filter
//       const packagesRange = getDateRange(packagesFilter, packagesCustomRange);
//       try {
//         const packagesStats = await fetchStats(packagesRange.startDate, packagesRange.endDate);
//         setPackageSummary(packagesStats.detailedBilling?.packageSummary || emptyPackageSummary);
//         setPackages(packagesStats.detailedBilling?.packages || []);
//       } catch (error) {
//         console.error("Error fetching packages:", error);
//         setPackageSummary(emptyPackageSummary);
//         setPackages([]);
//       }

//       // 6. Tests by category with the section's OWN filter
//       const categoryRange = getDateRange(categoryFilter, categoryCustomRange);
//       try {
//         const categoryStats = await fetchStats(categoryRange.startDate, categoryRange.endDate);
//         setTestCategories(categoryStats.detailedBilling?.testCategories || []);
//         setTestCategoriesSummary(categoryStats.detailedBilling?.testsSummary || emptyTestsSummary);
//       } catch (error) {
//         console.error("Error fetching tests by category:", error);
//         setTestCategories([]);
//         setTestCategoriesSummary(emptyTestsSummary);
//       }

//       // Earnings by category (same filter) - backs the "Revenue by Test" drilldown table
//       try {
//         const earningsResult = await fetchStats(categoryRange.startDate, categoryRange.endDate);
//         const earnings = earningsResult.earningsByCategory || { summary: { totalCategories: 0, totalTests: 0, totalRevenue: 0, totalDue: 0 }, categories: [] };
//         setEarningsData(earnings);

//         // Default selected category to the one with the highest test count
//         if (earnings.categories && earnings.categories.length > 0) {
//           const sorted = [...earnings.categories].sort((a, b) => (b.totalTests || 0) - (a.totalTests || 0));
//           setSelectedCategory(sorted[0].category);
//         }
//       } catch (error) {
//         console.error("Error fetching earnings by category:", error);
//         setEarningsData({ summary: { totalCategories: 0, totalTests: 0, totalRevenue: 0, totalDue: 0 }, categories: [] });
//       }

//       // 7. Lab performance with its OWN filter
//       const performanceRange = getDateRange(performanceFilter, performanceCustomRange);
//       try {
//         const performanceStats = await fetchStats(performanceRange.startDate, performanceRange.endDate);
//         setLabPerformance((performanceStats.labPerformance || []).slice(0, 6));
//       } catch (error) {
//         console.error("Error fetching lab performance:", error);
//         setLabPerformance([]);
//       }

//       // 8. Top doctors with its OWN filter
//       const doctorsRange = getDateRange(doctorsFilter, doctorsCustomRange);
//       try {
//         const doctorsStats = await fetchStats(doctorsRange.startDate, doctorsRange.endDate);
//         setTopDoctors((doctorsStats.topReferringDoctors || []).slice(0, 5));
//       } catch (error) {
//         console.error("Error fetching top doctors:", error);
//         setTopDoctors([]);
//       }

//       setLastUpdated(new Date());
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       if (!silent) {
//         setLoading(false);
//       } else {
//         setRefreshing(false);
//       }
//     }
//   }, [
//     fetchStats,
//     globalFilter, globalCustomRange,
//     revenueFilter, revenueCustomRange,
//     topLabsFilter, topLabsCustomRange,
//     categoryFilter, categoryCustomRange,
//     packagesFilter, packagesCustomRange,
//     performanceFilter, performanceCustomRange,
//     doctorsFilter, doctorsCustomRange,
//   ]);

//   // Initial load + reload whenever the lab filter changes (fetchStats depends on selectedLabId)
//   useEffect(() => {
//     fetchAllData();
//   }, [fetchAllData]);

//   // Billing Grid Report: the UI shows every matching row with no pagination, so this
//   // pulls every page from the (paginated) backend endpoint and stitches them into one
//   // full row list. `silent` mirrors fetchAllData's silent refresh - used by the 30s
//   // auto-refresh below so the table doesn't flash back to a "Loading..." state.
//   const fetchGridData = useCallback(
//     async (silent = false) => {
//       if (!silent) setGridLoading(true);
//       try {
//         const range = getDateRange(gridFilter, gridCustomRange);
//         const labIdParam = selectedLabId === "all" ? undefined : selectedLabId;

//         const firstPage = await getGridReport(labIdParam, range.startDate, range.endDate, 0, GRID_FETCH_PAGE_SIZE);
//         let allRows: GridReportRow[] = [...firstPage.rows];

//         if (firstPage.totalPages > 1) {
//           const remainingPages = await Promise.all(
//             Array.from({ length: firstPage.totalPages - 1 }, (_, i) =>
//               getGridReport(labIdParam, range.startDate, range.endDate, i + 1, GRID_FETCH_PAGE_SIZE)
//             )
//           );
//           remainingPages.forEach((p) => {
//             allRows = allRows.concat(p.rows);
//           });
//         }

//         setGridData({
//           page: 0,
//           size: allRows.length,
//           totalRecords: firstPage.totalRecords,
//           totalPages: 1,
//           rows: allRows,
//         });
//       } catch (error) {
//         console.error("Error fetching billing grid report:", error);
//         if (!silent) setGridData({ page: 0, size: 0, totalRecords: 0, totalPages: 0, rows: [] });
//       } finally {
//         if (!silent) setGridLoading(false);
//       }
//     },
//     [selectedLabId, gridFilter, gridCustomRange]
//   );

//   // Initial load + reload whenever the lab or the section's own date filter changes.
//   useEffect(() => {
//     fetchGridData();
//   }, [fetchGridData]);

//   // Auto-refresh every 30 seconds - keeps the Billing Grid Report in sync with every
//   // other stats section on this dashboard.
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchAllData(true);
//       fetchGridData(true);
//     }, 30000);
//     return () => clearInterval(interval);
//   }, [fetchAllData, fetchGridData]);

//   // The grid table already holds the full filtered result set (no pagination), so the
//   // CSV export just converts what's already loaded - no extra fetch needed.
//   const handleDownloadGridCsv = () => {
//     if (gridData.rows.length === 0) return;
//     const csv = buildGridReportCsv(gridData.rows);
//     downloadCSV(csv, generateCSVFilename("billing-grid-report"));
//   };

//   // Format data for category pie chart
//   const getCategoryChartData = () => {
//     if (!testCategories || testCategories.length === 0) {
//       return [];
//     }
//     return testCategories
//       .filter((item) => (item.testCount || 0) > 0)
//       .map((item, index) => ({
//         name: item.category || "Unknown",
//         value: item.testCount || 0,
//         testCount: item.testCount || 0,
//         revenue: item.revenue || 0,
//         discount: item.discount || 0,
//         paidRevenue: item.paidRevenue || 0,
//         dueRevenue: item.dueRevenue || 0,
//         cashRevenue: item.cashRevenue || 0,
//         upiRevenue: item.upiRevenue || 0,
//         cardRevenue: item.cardRevenue || 0,
//         color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
//       }));
//   };

//   // Format packages data for pie chart
//   const getPackagesChartData = () => {
//     if (!packages || packages.length === 0) {
//       return [];
//     }
//     return packages
//       .filter((item) => (item.visitCount || 0) > 0)
//       .map((item, index) => ({
//         name: item.packageName || "Unknown",
//         value: item.visitCount || 0,
//         visitCount: item.visitCount || 0,
//         revenue: item.revenue || 0,
//         discount: item.discount || 0,
//         paidRevenue: item.paidRevenue || 0,
//         dueRevenue: item.dueRevenue || 0,
//         cashRevenue: item.cashRevenue || 0,
//         upiRevenue: item.upiRevenue || 0,
//         cardRevenue: item.cardRevenue || 0,
//         packageCode: item.packageCode || "",
//         packageId: item.packageId || 0,
//         color: PACKAGE_COLORS[index % PACKAGE_COLORS.length],
//       }));
//   };

//   // Billing Summary alerts pie - total billed amount is netBilled (gross minus discount/gst)
//   const getAlertsData = () => {
//     return [
//       {
//         name: "Total Billed Amount",
//         value: billingSummary.netBilled || 0,
//         color: "#FDBA12",
//         amount: billingSummary.netBilled || 0,
//       },
//       {
//         name: "Paid Amount",
//         value: billingSummary.totalPaid || 0,
//         color: "#38B000",
//         amount: billingSummary.totalPaid || 0,
//       },
//       {
//         name: "Due Amount",
//         value: billingSummary.totalDue || 0,
//         color: "#F75A5A",
//         amount: billingSummary.totalDue || 0,
//       },
//     ];
//   };

//   // Get earnings-by-category tests for the selected category (or all, flattened)
//   const getEarningsForCategory = () => {
//     if (!earningsData.categories || earningsData.categories.length === 0) {
//       return { tests: [], categoryName: "" };
//     }

//     if (selectedCategory === "all") {
//       const allTests: Array<EarningsByCategoryData["categories"][number]["tests"][number] & { category: string }> = [];
//       earningsData.categories.forEach((cat) => {
//         if (cat.tests && cat.tests.length > 0) {
//           cat.tests.forEach((test) => {
//             allTests.push({ ...test, category: cat.category });
//           });
//         }
//       });
//       allTests.sort((a, b) => (b.grossEarnings || 0) - (a.grossEarnings || 0));
//       return { tests: allTests, categoryName: "All Categories" };
//     }

//     const categoryData = earningsData.categories.find((cat) => cat.category === selectedCategory);
//     if (!categoryData) {
//       return { tests: [], categoryName: "" };
//     }
//     const sortedTests = [...(categoryData.tests || [])].sort(
//       (a, b) => (b.grossEarnings || 0) - (a.grossEarnings || 0)
//     );
//     return { tests: sortedTests, categoryName: categoryData.category };
//   };

//   // Get all unique categories for the dropdown
//   const getCategoriesForDropdown = () => {
//     if (!earningsData.categories || earningsData.categories.length === 0) {
//       return [];
//     }
//     return earningsData.categories.map((cat) => cat.category);
//   };

//   // Format lab performance data
//   const getFormattedLabPerformance = () => {
//     if (labPerformance.length === 0) {
//       return [
//         {
//           id: "01",
//           lab: "Lab Name",
//           revenue: "₹0.00",
//           tests: "00",
//           patients: "00",
//           pending: "00",
//           tat: "0.0 hrs",
//           reports: "00",
//           growth: "00%",
//           positive: true,
//         },
//       ];
//     }
//     return labPerformance.map((item, index) => ({
//       id: String(index + 1).padStart(2, "0"),
//       lab: item.labName || "Unknown Lab",
//       revenue: formatCurrency(item.revenue || 0),
//       tests: (item.tests || 0).toLocaleString(),
//       patients: (item.patients || 0).toLocaleString(),
//       pending: (item.pendingSamples || 0).toLocaleString(),
//       tat: `${item.avgTatHours?.toFixed(1) || 0} hrs`,
//       reports: (item.reportsGenerated || 0).toLocaleString(),
//       growth: item.growthPct !== null && item.growthPct !== undefined
//         ? `${item.growthPct > 0 ? "+" : ""}${item.growthPct.toFixed(1)}%`
//         : "0%",
//       positive: item.growthPct !== null && item.growthPct !== undefined ? item.growthPct >= 0 : true,
//     }));
//   };

//   // Format doctors data
//   const getFormattedDoctors = () => {
//     if (topDoctors.length === 0) {
//       return [
//         {
//           id: 1,
//           srNo: "01",
//           doctorName: "Dr.",
//           revenue: "₹0.00",
//         },
//       ];
//     }
//     return topDoctors.map((item, index) => ({
//       id: index + 1,
//       srNo: String(index + 1).padStart(2, "0"),
//       doctorName: item.doctorName || "Unknown Doctor",
//       revenue: formatCurrency(item.revenue || 0),
//     }));
//   };

//   // Stats data (KPIs)
//   const stats = [
//     {
//       id: 1,
//       title: "Total Labs",
//       value: loading ? "..." : String(totalLabs),
//       color: "text-secondary-700",
//       icon: Building2,
//     },
//     {
//       id: 2,
//       title: "Total Admins",
//       value: roleKpisLoading ? "..." : String(totalAdmins),
//       color: "text-secondary-700",
//       icon: HiOutlineUserGroup,
//     },
//     {
//       id: 3,
//       title: "Total Desk Users",
//       value: roleKpisLoading ? "..." : String(totalDeskRoles),
//       color: "text-secondary-700",
//       icon: HiOutlineUsers,
//     },
//     {
//       id: 4,
//       title: "Total Technicians",
//       value: roleKpisLoading ? "..." : String(totalTechnicians),
//       color: "text-secondary-700",
//       icon: PiGraduationCapThin,
//     },
//     {
//       id: 5,
//       title: "Total Tests",
//       value: loading ? "..." : String(totalTests),
//       color: "text-secondary-700",
//       icon: PiFlaskLight,
//     },
//     {
//       id: 6,
//       title: "Pending Samples",
//       value: loading ? "..." : String(pendingSamples),
//       color: "text-secondary-700",
//       icon: PiDna,
//     },
//     {
//       id: 7,
//       title: "Reports Generated",
//       value: loading ? "..." : String(reportsGenerated),
//       color: "text-secondary-700",
//       icon: ClipboardCheck,
//     },
//     {
//       id: 8,
//       title: "Total Revenue",
//       value: loading ? "..." : formatCurrency(totalRevenue),
//       color: "text-secondary-700",
//       icon: HiOutlineBanknotes,
//     }
//   ];

//   const categoryChartData = getCategoryChartData();
//   const packagesChartData = getPackagesChartData();
//   const alertsData = getAlertsData();
//   const tableData = getFormattedLabPerformance();
//   const doctorsData = getFormattedDoctors();
//   const earnings = getEarningsForCategory();
//   const categoryOptions = getCategoriesForDropdown();
//   const sortedTests = [...earnings.tests].sort((a, b) =>
//     sortOrder === "desc" ? (b.grossEarnings || 0) - (a.grossEarnings || 0) : (a.grossEarnings || 0) - (b.grossEarnings || 0)
//   );

//   // Top labs data (revenue kept in raw currency units; formatted for display via getRevenueAxisConfig)
//   const topLabs = revenueByLab.map((lab) => ({
//     name: lab.labName || "Unknown Lab",
//     revenue: lab.revenue || 0,
//   }));

//   const revenueAxisConfig = getRevenueAxisConfig(
//     Math.max(0, ...revenueChartData.map((d: { revenue: number }) => d.revenue || 0))
//   );
//   const topLabsAxisConfig = getRevenueAxisConfig(
//     Math.max(0, ...topLabs.map((lab) => lab.revenue))
//   );

//   // Helper to render filter dropdown
//   const renderFilterDropdown = (
//     currentFilter: DateFilterType,
//     onFilterChange: (filter: DateFilterType) => void,
//     customRange: DateRange,
//     onCustomRangeChange: (range: DateRange) => void,
//     isGlobal: boolean = false
//   ) => {
//     const filterOptions: { value: DateFilterType; label: string }[] = [
//       { value: "currentFY", label: `Current FY: ${getShortFYLabel(dayjs())}` },
//       { value: "week", label: "This Week" },
//       { value: "month", label: "This Month" },
//       { value: "year", label: "This Year" },
//       { value: "custom", label: "Custom Date" },
//     ];

//     const maxDate = dayjs().format("YYYY-MM-DD");

//     return (
//       <div className="flex items-center gap-2">
//         <select
//           value={currentFilter}
//           onChange={(e) => onFilterChange(e.target.value as DateFilterType)}
//           className={`rounded-lg border border-pneutral-100 bg-pneutral-100 px-4 py-2 text-p3 font-medium text-pneutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 ${
//             isGlobal ? "min-w-[180px]" : ""
//           }`}
//         >
//           {filterOptions.map((option) => (
//             <option key={option.value} value={option.value}>
//               {option.label}
//             </option>
//           ))}
//         </select>
//         {currentFilter === "custom" && (
//           <div className="flex items-center gap-2">
//             <input
//               type="date"
//               value={customRange.startDate}
//               max={maxDate}
//               onChange={(e) =>
//                 onCustomRangeChange({
//                   ...customRange,
//                   startDate: e.target.value,
//                 })
//               }
//               className="rounded-lg border border-pneutral-100 bg-base-white px-3 py-2 text-p3 text-pneutral-900 shadow-xsm focus:outline-none focus:ring-2 focus:ring-secondary-500"
//             />
//             <span className="text-p3 text-pneutral-500">to</span>
//             <input
//               type="date"
//               value={customRange.endDate}
//               max={maxDate}
//               onChange={(e) =>
//                 onCustomRangeChange({
//                   ...customRange,
//                   endDate: e.target.value,
//                 })
//               }
//               className="rounded-lg border border-pneutral-100 bg-base-white px-3 py-2 text-p3 text-pneutral-900 shadow-xsm focus:outline-none focus:ring-2 focus:ring-secondary-500"
//             />
//           </div>
//         )}
//       </div>
//     );
//   };

//   // Helper to render the lab filter dropdown (All Labs + every lab under this super admin)
//   const renderLabFilterDropdown = () => (
//     <select
//       value={selectedLabId}
//       onChange={(e) => setSelectedLabId(e.target.value === "all" ? "all" : Number(e.target.value))}
//       className="min-w-40 rounded-lg border border-pneutral-100 bg-pneutral-100 px-4 py-2 text-p3 font-medium text-pneutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500"
//     >
//       <option value="all">All Labs</option>
//       {labs.map((lab) => (
//         <option key={lab.id} value={lab.id}>
//           {lab.name}
//         </option>
//       ))}
//     </select>
//   );

//   // Custom tooltip for category pie chart
//   const CategoryTooltip = ({ active, payload }: any) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="rounded-lg border border-pneutral-100 bg-base-white p-4 shadow-lg min-w-[200px]">
//           <p className="text-p3 font-semibold text-pneutral-900 mb-2">{data.name}</p>
//           <div className="space-y-1 text-p3 text-pneutral-600">
//             <p>Tests: <span className="font-semibold text-pneutral-900">{data.testCount.toLocaleString()}</span></p>
//             <p>Revenue: <span className="font-semibold text-pneutral-900">₹{data.revenue.toLocaleString()}</span></p>
//             <p>Discount: <span className="font-semibold text-pneutral-900">₹{data.discount.toLocaleString()}</span></p>
//             <p>Paid: <span className="font-semibold text-pneutral-900">₹{data.paidRevenue.toLocaleString()}</span></p>
//             <p>Due: <span className="font-semibold text-pneutral-900">₹{data.dueRevenue.toLocaleString()}</span></p>
//             <p>Cash: <span className="font-semibold text-pneutral-900">₹{data.cashRevenue.toLocaleString()}</span></p>
//             <p>UPI: <span className="font-semibold text-pneutral-900">₹{data.upiRevenue.toLocaleString()}</span></p>
//             <p>Card: <span className="font-semibold text-pneutral-900">₹{data.cardRevenue.toLocaleString()}</span></p>
//           </div>
//         </div>
//       );
//     }
//     return null;
//   };

//   // Custom tooltip for packages pie chart
//   const PackageTooltip = ({ active, payload }: any) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="rounded-lg border border-pneutral-100 bg-base-white p-4 shadow-lg min-w-[200px]">
//           <p className="text-p3 font-semibold text-pneutral-900 mb-2">{data.name}</p>
//           <div className="space-y-1 text-p3 text-pneutral-600">
//             <p>Revenue: <span className="font-semibold text-pneutral-900">₹{data.revenue.toLocaleString()}</span></p>
//             <p>Discount: <span className="font-semibold text-pneutral-900">₹{data.discount.toLocaleString()}</span></p>
//             <p>Paid: <span className="font-semibold text-pneutral-900">₹{data.paidRevenue.toLocaleString()}</span></p>
//             <p>Due: <span className="font-semibold text-pneutral-900">₹{data.dueRevenue.toLocaleString()}</span></p>
//             <p>Cash: <span className="font-semibold text-pneutral-900">₹{data.cashRevenue.toLocaleString()}</span></p>
//             <p>UPI: <span className="font-semibold text-pneutral-900">₹{data.upiRevenue.toLocaleString()}</span></p>
//             <p>Card: <span className="font-semibold text-pneutral-900">₹{data.cardRevenue.toLocaleString()}</span></p>
//           </div>
//         </div>
//       );
//     }
//     return null;
//   };

//   // Custom tooltip for alerts pie chart
//   const AlertTooltip = ({ active, payload }: any) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="rounded-lg border border-pneutral-100 bg-base-white p-4 shadow-lg">
//           <p className="text-p3 font-semibold text-pneutral-900">{data.name}</p>
//           <p className="text-p3 text-pneutral-600">
//             Amount: <span className="font-semibold text-pneutral-900">₹{data.amount.toLocaleString()}</span>
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   // Handle sort toggle
//   const toggleSort = () => {
//     setSortOrder(sortOrder === "desc" ? "asc" : "desc");
//   };

//   return (
//     <div className="space-y-4 bg-secondary-50 px-2">
//       {/* Header */}
//       <div className="flex flex-wrap items-start justify-between gap-5">
//         <div>
//           <div className="flex items-center gap-3">
//             <h1 className="text-h3 font-heading font-bold text-pneutral-900">
//               Cumulative Analytics
//             </h1>
//             <span className="rounded-full bg-secondary-100 px-4 py-1 text-label-l3 font-semibold text-secondary-700">
//               Level 1: ALL Labs Overview
//             </span>
//             {refreshing && (
//               <span className="text-xs text-pneutral-400 animate-pulse">Refreshing...</span>
//             )}
//             {lastUpdated && (
//               <span className="text-xs text-pneutral-400 ml-2">
//                 Updated: {dayjs(lastUpdated).format("hh:mm:ss A")}
//               </span>
//             )}
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <div className="flex items-center gap-2">
//             {renderLabFilterDropdown()}
//           </div>
//           <div className="flex items-center gap-2">
//             {renderFilterDropdown(
//               globalFilter,
//               setGlobalFilter,
//               globalCustomRange,
//               setGlobalCustomRange,
//               true
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 gap-1 md:grid-cols-2 xl:grid-cols-8">
//         {stats.map((item) => {
//           const Icon = item.icon;
//           return (
//             <div
//               key={item.id}
//               className="rounded-lg border border-pneutral-100 bg-base-white p-2 shadow-xsm"
//             >
//               <div className="flex items-center gap-5">
//                 <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-50">
//                   <Icon className={item.color} size={18} />
//                 </div>
//                 <div>
//                   <h4 className=" min-h-[40px] text-p3 font-semibold text-pneutral-600">
//                     {item.title}
//                   </h4>
//                   <h2 className=" text-h6 font-bold text-pneutral-900">{item.value}</h2>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
//         {/* Revenue Trend */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="mb-6 flex items-center justify-between">
//             <div>
//               <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//                 {selectedLabName ? `Revenue Trend "${selectedLabName}"` : "Revenue Trend (All Labs)"}
//               </h2>
//               <p className="mt-1 text-p3 font-semibold text-pneutral-900">
//                 Total Revenue
//                 <span className="ml-1 font-semibold text-pneutral-900">
//                   {formatCurrency(revenueTrendTotal)}
//                 </span>
//               </p>
//             </div>
//             <div className="flex items-center gap-2">
//               {renderFilterDropdown(
//                 revenueFilter,
//                 setRevenueFilter,
//                 revenueCustomRange,
//                 setRevenueCustomRange,
//                 false
//               )}
//             </div>
//           </div>
//           <div className="h-[200px]">
//             {revenueChartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={revenueChartData}>
//                   <defs>
//                     <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#B550FA" stopOpacity={0.45} />
//                       <stop offset="95%" stopColor="#B550FA" stopOpacity={0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#EAEAE9" />
//                   <XAxis
//                     dataKey="label"
//                     tickLine={false}
//                     axisLine={false}
//                     tick={{ fontSize: 14, fill: "#969793" }}
//                   />
//                   <YAxis
//                     tickLine={false}
//                     axisLine={false}
//                     tick={{ fontSize: 14, fill: "#969793" }}
//                     domain={[0, revenueAxisConfig.domainMax]}
//                     ticks={revenueAxisConfig.ticks}
//                     tickFormatter={revenueAxisConfig.formatTick}
//                   />
//                   <Tooltip
//                     contentStyle={{
//                       borderRadius: 12,
//                       border: "none",
//                       boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
//                     }}
//                     formatter={(value: any) => [`₹${value.toLocaleString()}`, "Revenue"]}
//                     labelFormatter={(label) => `Date: ${label}`}
//                   />
//                   <Area
//                     type="monotone"
//                     dataKey="revenue"
//                     stroke="#B550FA"
//                     strokeWidth={3}
//                     fill="url(#purpleGradient)"
//                     dot={{ r: 4, fill: "#fff", stroke: "#B550FA", strokeWidth: 2 }}
//                     activeDot={{ r: 6 }}
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex h-full w-full items-center justify-center text-p3 text-pneutral-500">
//                 No data available
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Revenue Trend Top Labs */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="mb-8 flex items-center justify-between">
//             <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//               {selectedLabName ? `Revenue Trend "${selectedLabName}"` : "Revenue Trend (Top 5 Labs)"}
//             </h2>
//             <div className="flex items-center gap-3">
//               {renderFilterDropdown(
//                 topLabsFilter,
//                 setTopLabsFilter,
//                 topLabsCustomRange,
//                 setTopLabsCustomRange,
//                 false
//               )}
//             </div>
//           </div>
//           <div className="space-y-4">
//             {topLabs.length > 0 ? (
//               topLabs.map((lab, index) => (
//                 <div key={index} className="grid grid-cols-[1.2fr_2.5fr_64px] items-center gap-5">
//                   <p className="truncate text-p3 font-medium text-pneutral-900">{lab.name}</p>
//                   <div className="relative h-4 overflow-hidden rounded-full bg-secondary-100">
//                     <div
//                       className="h-full rounded-full bg-secondary-700 transition-all duration-500"
//                       style={{
//                         width: `${Math.min((lab.revenue / topLabsAxisConfig.domainMax) * 100, 100)}%`,
//                       }}
//                     />
//                   </div>
//                   <p className="w-16 text-right text-p3 font-semibold text-pneutral-900">
//                     {topLabsAxisConfig.formatTick(lab.revenue)}
//                   </p>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-8 text-pneutral-500">No data available</div>
//             )}
//           </div>
//         <div className="grid grid-cols-[1.2fr_2.5fr_64px] gap-5 mt-5">
//   <div />

//  <div className="relative h-6">
//   {topLabsAxisConfig.ticks.map((tick, index) => (
//     <span
//       key={tick}
//       className="absolute -translate-x-1/2 text-p3 text-pneutral-900"
//       style={{
//         left: `${(index / (topLabsAxisConfig.ticks.length - 1)) * 100}%`,
//       }}
//     >
//       {topLabsAxisConfig.formatTick(tick)}
//     </span>
//   ))}
// </div>

//   <div />
// </div>
//         </div>
//       </div>

//       {/* Top Cards - Test by Category with table */}
//       <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
//         {/* Test By Category - Pie Chart */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="flex items-center justify-between mb-1">
//             <h2 className="text-p4 font-heading font-semibold text-pneutral-900">Test by Category</h2>
//             {renderFilterDropdown(
//               categoryFilter,
//               setCategoryFilter,
//               categoryCustomRange,
//               setCategoryCustomRange,
//               false
//             )}
//           </div>
//           <div className="flex items-center justify-between">
//             {categoryChartData.length > 0 ? (
//               <>
//                 <div className="h-[270px] w-[270px]">
//                   <ResponsiveContainer>
//                     <PieChart>
//                       <Pie
//                         data={categoryChartData}
//                         dataKey="value"
//                         innerRadius={70}
//                         outerRadius={120}
//                         paddingAngle={0}
//                       >
//                         {categoryChartData.map((item, index) => (
//                           <Cell key={index} fill={item.color} />
//                         ))}
//                       </Pie>
//                       <text
//                         x="50%"
//                         y="47%"
//                         textAnchor="middle"
//                         className="fill-pneutral-900 text-label-l3 font-medium"
//                       >
//                         Total
//                       </text>
//                       <text
//                         x="50%"
//                         y="57%"
//                         textAnchor="middle"
//                         className="fill-pneutral-900 text-h4 font-medium"
//                       >
//                         {(testCategoriesSummary.totalTests || 0).toLocaleString()}
//                       </text>
//                       <Tooltip content={<CategoryTooltip />} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//                 <div className="space-y-4">
//                   {categoryChartData.map((item) => (
//                     <div key={item.name} className="flex w-44 items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
//                         <span className="text-p3 text-pneutral-700">{item.name}</span>
//                       </div>
//                       <span className="text-p3 font-medium text-pneutral-600">{item.testCount}</span>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             ) : (
//               <div className="w-full py-8 text-center text-pneutral-500">
//                 No test data available
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Revenue by Test - Table */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//               Revenue by Test
//             </h2>
//             <div className="flex items-center gap-2">
//               <select
//                 value={selectedCategory}
//                 onChange={(e) => setSelectedCategory(e.target.value)}
//                 className="rounded-lg border border-pneutral-100 bg-pneutral-100 px-4 py-2 text-p3 font-medium text-pneutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-500"
//               >
//                 <option value="all">All Categories</option>
//                 {categoryOptions.map((cat) => (
//                   <option key={cat} value={cat}>
//                     {cat}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//           <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
//             {sortedTests.length > 0 ? (
//               <table className="min-w-full">
//                 <thead className="sticky top-0 bg-white z-10">
//                   <tr className="border-b border-pneutral-100 bg-pneutral-50">
//                     <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">SI No.</th>
//                     <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">Test Name</th>
//                     <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">Paid</th>
//                     <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">Due</th>
//                     <th
//                       className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900 cursor-pointer hover:text-secondary-700 flex items-center justify-end gap-1"
//                       onClick={toggleSort}
//                     >
//                       Total Amount
//                       {sortOrder === "desc" ? (
//                         <ChevronDown size={16} />
//                       ) : (
//                         <ChevronUp size={16} />
//                       )}
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {sortedTests.map((test, index) => (
//                     <tr key={test.testId || index} className="border-b border-pneutral-100 transition hover:bg-pneutral-50">
//                       <td className="px-4 py-2 text-p3 text-pneutral-900">{index + 1}</td>
//                       <td className="px-4 py-2 text-p3 font-medium text-pneutral-900">
//                         {test.testName || "Unknown"}
//                       </td>
//                       <td className="px-4 py-2 text-p3 text-right text-pneutral-900">
//                         ₹{test.revenue?.toLocaleString() || "0"}
//                       </td>
//                       <td className="px-4 py-2 text-p3 text-right text-pneutral-900">
//                         ₹{test.dueAmount?.toLocaleString() || "0"}
//                       </td>
//                       <td className="px-4 py-2 text-p3 text-right font-semibold text-pneutral-900">
//                         ₹{test.grossEarnings?.toLocaleString() || "0"}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : (
//               <div className="w-full py-8 text-center text-pneutral-500">
//                 No test data available
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Bottom Stats - 33:33:34 Layout */}
//       <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
//         {/* Packages Summary - 33% */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="flex items-center justify-between mb-1">
//             <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//               Packages Summary
//             </h2>
//             {renderFilterDropdown(
//               packagesFilter,
//               setPackagesFilter,
//               packagesCustomRange,
//               setPackagesCustomRange,
//               false
//             )}
//           </div>
//           <div className="flex items-center justify-between">
//             {packagesChartData.length > 0 ? (
//               <>
//                 <div className="h-[200px] w-[200px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={packagesChartData}
//                         dataKey="value"
//                         innerRadius={55}
//                         outerRadius={90}
//                         paddingAngle={0}
//                         stroke="none"
//                       >
//                         {packagesChartData.map((item, index) => (
//                           <Cell key={index} fill={item.color} />
//                         ))}
//                       </Pie>
//                       <text
//                         x="50%"
//                         y="47%"
//                         textAnchor="middle"
//                         dominantBaseline="middle"
//                         className="fill-pneutral-900 text-xs font-medium"
//                       >
//                         Total
//                       </text>
//                       <text
//                         x="50%"
//                         y="57%"
//                         textAnchor="middle"
//                         dominantBaseline="middle"
//                         className="fill-pneutral-900 text-sm font-semibold"
//                       >
//                         ₹{(packageSummary.grossBilled || 0).toLocaleString()}
//                       </text>
//                       <Tooltip content={<PackageTooltip />} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//                 <div className="space-y-3 flex-1 ml-2">
//                   {packagesChartData.map((item) => (
//                     <div key={item.name} className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
//                         <span className="text-p3 text-pneutral-700 truncate max-w-[100px]">{item.name}</span>
//                       </div>
//                       <span className="text-p3 font-medium text-pneutral-600">{item.visitCount}</span>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             ) : (
//               <div className="w-full py-8 text-center text-pneutral-500">
//                 No package data available
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Billing Summary - 33% */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="px-2 pt-2">
//             <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//               Billing Summary
//             </h2>
//           </div>
//           <div className="flex items-center justify-between px-2 pb-2">
//             {alertsData.some(item => item.value > 0) ? (
//               <>
//                 <div className="h-[180px] w-[180px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={alertsData}
//                         dataKey="value"
//                         innerRadius={50}
//                         outerRadius={80}
//                         paddingAngle={0}
//                         stroke="none"
//                       >
//                         {alertsData.map((item, index) => (
//                           <Cell key={index} fill={item.color} />
//                         ))}
//                       </Pie>
//                       <text
//                         x="50%"
//                         y="47%"
//                         textAnchor="middle"
//                         dominantBaseline="middle"
//                         className="fill-pneutral-900 text-xs font-medium"
//                       >
//                         Total
//                       </text>
//                       <text
//                         x="50%"
//                         y="57%"
//                         textAnchor="middle"
//                         dominantBaseline="middle"
//                         className="fill-pneutral-900 text-sm font-semibold"
//                       >
//                         ₹{(billingSummary.netBilled || 0).toLocaleString()}
//                       </text>
//                       <Tooltip content={<AlertTooltip />} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//                 <div className="space-y-3 flex-1 ml-2">
//                   {alertsData.map((item) => (
//                     <div key={item.name} className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <span className="h-3.5 w-3.5 rounded-full" style={{ background: item.color }} />
//                         <span className="text-p3 font-medium text-pneutral-700">{item.name}</span>
//                       </div>
//                       <span className="text-p3 font-semibold text-pneutral-600">
//                         ₹{item.amount.toLocaleString()}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             ) : (
//               <div className="w-full py-8 text-center text-pneutral-500">
//                 No data available
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Top Referring Doctors - 34% */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="flex items-center justify-between px-2 pt-1">
//             <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//               Top Referring Doctors
//             </h2>
//             {renderFilterDropdown(
//               doctorsFilter,
//               setDoctorsFilter,
//               doctorsCustomRange,
//               setDoctorsCustomRange,
//               false
//             )}
//           </div>
//           <div className="mt-2 overflow-x-auto max-h-[220px] overflow-y-auto">
//             <table className="min-w-full">
//               <thead className="sticky top-0 bg-white z-10">
//                 <tr className="border-y border-pneutral-100 bg-pneutral-50">
//                   <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">SI No.</th>
//                   <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">Doctor Name</th>
//                   <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">Revenue(₹)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {doctorsData.map((doctor) => (
//                   <tr key={doctor.id} className="border-b border-pneutral-100 transition hover:bg-pneutral-50">
//                     <td className="px-4 py-2 text-p3 text-pneutral-900">{doctor.srNo}</td>
//                     <td className="px-4 py-2 text-p3 font-medium text-pneutral-900">{doctor.doctorName}</td>
//                     <td className="px-4 py-2 text-p3 text-right font-medium text-pneutral-900">{doctor.revenue}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Lab Performance Summary */}
//       <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//         <div className="flex items-center justify-between mb-1">
//           <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//             Lab Performance Summary
//           </h2>
//           {renderFilterDropdown(
//             performanceFilter,
//             setPerformanceFilter,
//             performanceCustomRange,
//             setPerformanceCustomRange,
//             false
//           )}
//         </div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full border-separate border-spacing-y-0">
//             <thead>
//               <tr className="border-b border-pneutral-100 bg-pneutral-50">
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">SI No.</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Lab Name</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Revenue</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Tests</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Patients</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Pending Samples</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Avg TAT</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Reports Generated</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Growth (Revenue)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {tableData.map((item) => (
//                 <tr key={item.id} className="border-b border-pneutral-100 transition hover:bg-pneutral-50">
//                   <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{item.id}</td>
//                   <td className="border-b border-pneutral-100 px-4 py-2 font-medium text-pneutral-900">{item.lab}</td>
//                   <td className="border-b border-pneutral-100 px-4 py-2 font-medium text-pneutral-900">{item.revenue}</td>
//                   <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{item.tests}</td>
//                   <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{item.patients}</td>
//                   <td className="border-b border-pneutral-100 px-4 py-2 font-medium text-danger-600">{item.pending}</td>
//                   <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{item.tat}</td>
//                   <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{item.reports}</td>
//                   <td className="border-b border-pneutral-100 px-4 py-2">
//                     <div
//                       className={`flex items-center gap-2 font-medium ${
//                         item.positive ? "text-success-600" : "text-warning-500"
//                       }`}
//                     >
//                       {item.positive ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
//                       {item.growth}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Billing Grid Report */}
//       <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//         <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
//           <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//             Billing Report
//           </h2>
//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               onClick={handleDownloadGridCsv}
//               disabled={gridLoading || gridData.rows.length === 0}
//               className="rounded-lg border border-success-500 bg-[#55D400] px-4 py-2 text-p3 font-medium text-pneutral-50 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               Download as CSV
//             </button>
//             {renderFilterDropdown(
//               gridFilter,
//               setGridFilter,
//               gridCustomRange,
//               setGridCustomRange,
//               false
//             )}
//           </div>
//         </div>
//         <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
//           <table className="min-w-full border-separate border-spacing-y-0">
//             <thead className="sticky top-0 bg-white z-10">
//               <tr className="border-b border-pneutral-100 bg-pneutral-50">
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">SI No.</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Visit Code</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Patient Name</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Phone</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Doctor</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Visit Type</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Visit Status</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Billing Code</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Billing Date</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Payment Status</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Payment Method</th>
//                 <th className="px-4 py-4 text-right text-label-l3 font-semibold text-pneutral-900">Total Amount</th>
//                 <th className="px-4 py-4 text-right text-label-l3 font-semibold text-pneutral-900">Discount</th>
//                 <th className="px-4 py-4 text-right text-label-l3 font-semibold text-pneutral-900">Net Amount</th>
//                 <th className="px-4 py-4 text-right text-label-l3 font-semibold text-pneutral-900">Paid</th>
//                 <th className="px-4 py-4 text-right text-label-l3 font-semibold text-pneutral-900">Due</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Lab Name</th>
//               </tr>
//             </thead>
//             <tbody>
//               {gridLoading ? (
//                 <tr>
//                   <td colSpan={17} className="px-4 py-8 text-center text-pneutral-500">
//                     Loading...
//                   </td>
//                 </tr>
//               ) : gridData.rows.length > 0 ? (
//                 gridData.rows.map((row, index) => (
//                   <tr key={row.billingId ?? index} className="border-b border-pneutral-100 transition hover:bg-pneutral-50">
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">
//                       {index + 1}
//                     </td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.visitCode}</td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.patientName}</td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.patientPhone}</td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.doctorName || "N/A"}</td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.visitType}</td>
//                     <td className={`border-b border-pneutral-100 px-4 py-2 text-p3 font-medium ${getVisitStatusColorClass(row.visitStatus)}`}>
//                       {row.visitStatus}
//                     </td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.billingCode}</td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.billingDate}</td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.paymentStatus}</td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.paymentMethod}</td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-right text-p3 text-pneutral-900">
//                       ₹{(row.totalAmount || 0).toLocaleString()}
//                     </td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-right text-p3 text-pneutral-900">
//                       ₹{(row.discount || 0).toLocaleString()}
//                     </td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-right text-p3 text-pneutral-900">
//                       ₹{(row.netAmount || 0).toLocaleString()}
//                     </td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-right font-medium text-pneutral-900">
//                       ₹{(row.paidAmount || 0).toLocaleString()}
//                     </td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-right font-medium text-danger-600">
//                       ₹{(row.dueAmount || 0).toLocaleString()}
//                     </td>
//                     <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{row.labName}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={17} className="px-4 py-8 text-center text-pneutral-500">
//                     No billing records found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//         <div className="mt-3 px-1">
//           <p className="text-p3 text-pneutral-500">
//             {gridData.totalRecords > 0 ? `${gridData.totalRecords} records` : "0 records"}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SuperAdminStats;