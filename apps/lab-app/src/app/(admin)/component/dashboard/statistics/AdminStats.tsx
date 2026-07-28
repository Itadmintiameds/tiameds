/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import {
  ArrowUp,
  ArrowDown,
  Users,
  Monitor,
  FlaskConical,
  UserRound,
  Clock3,
  FileText,
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
import { useLabs } from "@/context/LabContext";
import {
  getAvgTat,
  getDashboardKpis,
  getPendingSamples,
  getReportsGenerated,
  getRevenueTrend,
  getTestsByCategory,
  getTopReferringDoctors,
  getTotalAdmins,
  getTotalDeskRoles,
  getTotalPatients,
  getTotalTechnicians,
  getTotalTests,
  getTotalRevenue,
  getSampleWorkflowFunnel,
  getTechnicianPerformance,
  getTopOrderedTests,
  getRevenueByCollectionMethod,
  getAgeGenderDistribution,
  getGridReport,
} from "../../../../../../services/adminStatService";
import {
  DashboardKpi,
  DashboardKpis,
  TopReferringDoctor,
  TechnicianPerformance as TechnicianPerformanceType,
  TopOrderedTest,
  RevenueByCollectionMethod as RevenueByCollectionMethodType,
  AgeGenderDistribution as AgeGenderDistributionType,
  GridReportResponse,
  GridReportRow,
} from "@/types/adminStatsData";
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
const getDateRange = (
  filter: DateFilterType,
  customRange?: DateRange
): { startDate?: string; endDate?: string } => {
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

// Format currency for display with ₹ symbol and Lakh/Crore
const formatCurrencyFull = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹ ${(amount / 100000).toFixed(2)} L`;
  }
  if (amount >= 1000) {
    return `₹ ${(amount / 1000).toFixed(2)} K`;
  }
  return `₹ ${amount.toFixed(2)}`;
};

// Revenue axis unit tiers
const REVENUE_AXIS_UNITS = [
  { limit: 100000, divisor: 1000, suffix: "K" },
  { limit: 10000000, divisor: 100000, suffix: "L" },
  { limit: Infinity, divisor: 10000000, suffix: "Cr" },
];

// Builds a "nice" 0..max axis (6 ticks) that scales with the data
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

// Count axis unit tiers (plain counts, e.g. "Top Order Test")
const COUNT_AXIS_UNITS = [
  { limit: 1000, divisor: 1, suffix: "" },
  { limit: Infinity, divisor: 1000, suffix: "k" },
];

// Builds a "nice" 0..max axis (6 ticks) for small counts: 0,100,200...500,
// then scales up to 1k,2k,3k... as values grow.
const getCountAxisConfig = (maxValue: number) => {
  const safeMax = Math.max(maxValue, 0);
  let step = 100;
  while (step * 5 < safeMax) {
    step = step * 10;
  }
  const domainMax = step * 5;
  const ticks = Array.from({ length: 6 }, (_, i) => i * step);
  const unit =
    COUNT_AXIS_UNITS.find((u) => domainMax < u.limit) ||
    COUNT_AXIS_UNITS[COUNT_AXIS_UNITS.length - 1];

  const formatTick = (value: number): string => {
    if (unit.divisor === 1) return `${value}`;
    const scaled = Math.round((value / unit.divisor) * 10) / 10;
    return `${scaled}${unit.suffix}`;
  };

  return { domainMax, ticks, formatTick };
};

// Helper: ordinal suffix
const getOrdinalSuffix = (num: number): string => {
  if (num === 1) return "st";
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
};

// Visit Status color coding for the Billing Report table: completed -> success,
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

// Builds the CSV for the Billing Report table/export - one row per visit/billing record.
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

// Billing Report table shows every row with no pagination in the UI, but the backend
// endpoint itself is still paginated - this is the page size used internally to pull
// every page and stitch them into one full row list.
const GRID_FETCH_PAGE_SIZE = 200;

// Color constants for charts
const CATEGORY_COLORS = [
  "#4F6BED",
  "#55D400",
  "#8B5CF6",
  "#FDBA12",
  "#F75A5A",
  "#4C0FAE",
  "#6D28D9",
  "#38B000",
];

const COLLECTION_COLORS = ["#6C63FF", "#008000", "#6BD3A7", "#FF5A5F"];

// ─────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────

const AdminStats = () => {
  const { currentLab } = useLabs();
  const labId = currentLab?.id;

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const [categoryFilter, setCategoryFilter] = useState<DateFilterType>("currentFY");
  const [categoryCustomRange, setCategoryCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  const [funnelFilter, setFunnelFilter] = useState<DateFilterType>("currentFY");
  const [funnelCustomRange, setFunnelCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  const [technicianFilter, setTechnicianFilter] = useState<DateFilterType>("currentFY");
  const [technicianCustomRange, setTechnicianCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  const [doctorsFilter, setDoctorsFilter] = useState<DateFilterType>("currentFY");
  const [doctorsCustomRange, setDoctorsCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  const [collectionFilter, setCollectionFilter] = useState<DateFilterType>("currentFY");
  const [collectionCustomRange, setCollectionCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  const [ageGenderFilter, setAgeGenderFilter] = useState<DateFilterType>("currentFY");
  const [ageGenderCustomRange, setAgeGenderCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  const [gridFilter, setGridFilter] = useState<DateFilterType>("currentFY");
  const [gridCustomRange, setGridCustomRange] = useState<DateRange>({
    startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
    endDate: dayjs().format("YYYY-MM-DD"),
  });

  // ========== STATE FOR ALL METRICS ==========
  // KPI Cards
  const [totalAdmins, setTotalAdmins] = useState<number>(0);
  const [totalTechnicians, setTotalTechnicians] = useState<number>(0);
  const [totalDeskRoles, setTotalDeskRoles] = useState<number>(0);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [totalTests, setTotalTests] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [reportsGenerated, setReportsGenerated] = useState<number>(0);
  const [pendingSamples, setPendingSamples] = useState<number>(0);
  const [avgTat, setAvgTat] = useState<number>(0);
  const [dashboardKpis, setDashboardKpis] = useState<DashboardKpis | null>(null);

  // Charts & Tables
  const [testsByCategory, setTestsByCategory] = useState<
    Array<{ category: string; count: number; percentage: number }>
  >([]);
  const [categoryTotal, setCategoryTotal] = useState<number>(0);
  const [revenueTrend, setRevenueTrend] = useState<
    Array<{ date: string; revenue: number }>
  >([]);
  const [topDoctors, setTopDoctors] = useState<TopReferringDoctor[]>([]);
  const [technicianPerformance, setTechnicianPerformance] = useState<
    TechnicianPerformanceType[]
  >([]);
  const [topOrderedTests, setTopOrderedTests] = useState<TopOrderedTest[]>([]);
  const [revenueByCollection, setRevenueByCollection] = useState<RevenueByCollectionMethodType | null>(null);
  const [ageGenderData, setAgeGenderData] = useState<AgeGenderDistributionType | null>(null);

  // Funnel Data (from API)
  const [funnelData, setFunnelData] = useState<
    Array<{ label: string; value: string; percent: string; color: string }>
  >([
    { label: "Samples Registered", value: "0", percent: "0%", color: "#4F11B8" },
    { label: "Samples Collected", value: "0", percent: "0%", color: "#FDBA12" },
    { label: "Results Entered", value: "0", percent: "0%", color: "#5470F5" },
    { label: "Reports Generated", value: "0", percent: "0%", color: "#EF5A5A" },
    // { label: "Reports Delivered", value: "0", percent: "0%", color: "#52C41A" },
  ]);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Billing Report table - shows every row (no pagination), own filter, CSV export
  const emptyGridData: GridReportResponse = { page: 0, size: 0, totalRecords: 0, totalPages: 0, rows: [] };
  const [gridData, setGridData] = useState<GridReportResponse>(emptyGridData);
  const [gridLoading, setGridLoading] = useState<boolean>(true);

  // ========== SYNC FILTERS ==========
  useEffect(() => {
    setRevenueFilter(globalFilter);
    setCategoryFilter(globalFilter);
    setFunnelFilter(globalFilter);
    setTechnicianFilter(globalFilter);
    setDoctorsFilter(globalFilter);
    setCollectionFilter(globalFilter);
    setAgeGenderFilter(globalFilter);
    setGridFilter(globalFilter);
  }, [globalFilter]);

  useEffect(() => {
    if (globalFilter === "custom") {
      setRevenueCustomRange(globalCustomRange);
      setCategoryCustomRange(globalCustomRange);
      setFunnelCustomRange(globalCustomRange);
      setTechnicianCustomRange(globalCustomRange);
      setDoctorsCustomRange(globalCustomRange);
      setCollectionCustomRange(globalCustomRange);
      setAgeGenderCustomRange(globalCustomRange);
      setGridCustomRange(globalCustomRange);
    }
  }, [globalCustomRange, globalFilter]);

  // ========== FETCH FUNNEL DATA ==========
  const fetchFunnelData = useCallback(
    async () => {
      if (!labId) return;

      try {
        const funnelRange = getDateRange(funnelFilter, funnelCustomRange);
        
        const funnelResult = await getSampleWorkflowFunnel(
          labId,
          funnelRange.startDate,
          funnelRange.endDate
        );

        setFunnelData([
          {
            label: "Samples Registered",
            value: funnelResult.samplesRegistered.count.toLocaleString(),
            percent: `${funnelResult.samplesRegistered.percentage}%`,
            color: "#4F11B8",
          },
          {
            label: "Samples Collected",
            value: funnelResult.samplesCollected.count.toLocaleString(),
            percent: `${funnelResult.samplesCollected.percentage}%`,
            color: "#FDBA12",
          },
          {
            label: "Results Entered",
            value: funnelResult.resultsEntered.count.toLocaleString(),
            percent: `${funnelResult.resultsEntered.percentage}%`,
            color: "#5470F5",
          },
          {
            label: "Reports Generated",
            value: funnelResult.reportsGenerated.count.toLocaleString(),
            percent: `${funnelResult.reportsGenerated.percentage}%`,
            color: "#EF5A5A",
          },
        ]);
      } catch (error) {
        console.error("Error fetching funnel data:", error);
      }
    },
    [labId, funnelFilter, funnelCustomRange]
  );

  // ========== FETCH FUNCTION ==========
  const fetchAllData = useCallback(
    async (silent = false) => {
      if (!labId) return;

      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        // 1. Fetch KPIs WITHOUT date filters (all-time)
        const [
          adminsResult,
          techniciansResult,
          deskRolesResult,
          dashboardKpisResult,
        ] = await Promise.allSettled([
          getTotalAdmins(labId),
          getTotalTechnicians(labId),
          getTotalDeskRoles(labId),
          getDashboardKpis(labId),
        ]);

        if (adminsResult.status === "fulfilled")
          setTotalAdmins(adminsResult.value.totalAdmins);
        if (techniciansResult.status === "fulfilled")
          setTotalTechnicians(techniciansResult.value.totalTechnicians);
        if (deskRolesResult.status === "fulfilled")
          setTotalDeskRoles(deskRolesResult.value.totalDeskRoles);
        if (dashboardKpisResult.status === "fulfilled")
          setDashboardKpis(dashboardKpisResult.value);

        // 2. Fetch data with GLOBAL date filter for main KPIs
        const globalRange = getDateRange(globalFilter, globalCustomRange);
        const [
          testsResult,
          reportsResult,
          pendingResult,
          patientsResult,
          revenueResult,
          avgTatResult,
        ] = await Promise.allSettled([
          getTotalTests(labId, globalRange.startDate, globalRange.endDate),
          getReportsGenerated(labId, globalRange.startDate, globalRange.endDate),
          getPendingSamples(labId, globalRange.startDate, globalRange.endDate),
          getTotalPatients(labId, globalRange.startDate, globalRange.endDate),
          getTotalRevenue(labId, globalRange.startDate, globalRange.endDate),
          getAvgTat(labId, globalRange.startDate, globalRange.endDate),
        ]);

        if (testsResult.status === "fulfilled")
          setTotalTests(testsResult.value.totalTests);
        if (reportsResult.status === "fulfilled")
          setReportsGenerated(reportsResult.value.reportsGenerated);
        if (pendingResult.status === "fulfilled")
          setPendingSamples(pendingResult.value.pendingSamples);
        if (patientsResult.status === "fulfilled")
          setTotalPatients(patientsResult.value.totalPatients);
        if (revenueResult.status === "fulfilled")
          setTotalRevenue(revenueResult.value.totalRevenue);
        if (avgTatResult.status === "fulfilled")
          setAvgTat(avgTatResult.value.avgTatHours);

        // 3. Fetch revenue trend with its OWN filter
        const revenueRange = getDateRange(revenueFilter, revenueCustomRange);
        if (revenueRange.startDate && revenueRange.endDate) {
          try {
            const trendResult = await getRevenueTrend(
              labId,
              revenueRange.startDate,
              revenueRange.endDate
            );
            setRevenueTrend(trendResult.trend || []);
          } catch (error) {
            console.error("Error fetching revenue trend:", error);
            setRevenueTrend([]);
          }
        } else {
          setRevenueTrend([]);
        }

        // 4. Fetch tests by category with the section's OWN filter
        const categoryRange = getDateRange(categoryFilter, categoryCustomRange);
        try {
          const categoryResult = await getTestsByCategory(
            labId,
            categoryRange.startDate,
            categoryRange.endDate
          );
          setTestsByCategory(categoryResult.categories || []);
          setCategoryTotal(categoryResult.total || 0);
        } catch (error) {
          console.error("Error fetching tests by category:", error);
          setTestsByCategory([]);
          setCategoryTotal(0);
        }

        // 5. Fetch top ordered tests with the category filter
        try {
          const topTests = await getTopOrderedTests(
            labId,
            categoryRange.startDate,
            categoryRange.endDate,
            5
          );
          setTopOrderedTests(topTests || []);
        } catch (error) {
          console.error("Error fetching top ordered tests:", error);
          setTopOrderedTests([]);
        }

        // 6. Fetch technician performance with its OWN filter
        const technicianRange = getDateRange(
          technicianFilter,
          technicianCustomRange
        );
        try {
          const techResult = await getTechnicianPerformance(
            labId,
            technicianRange.startDate,
            technicianRange.endDate
          );
          setTechnicianPerformance(techResult || []);
        } catch (error) {
          console.error("Error fetching technician performance:", error);
          setTechnicianPerformance([]);
        }

        // 7. Fetch top doctors with its OWN filter
        const doctorsRange = getDateRange(doctorsFilter, doctorsCustomRange);
        try {
          const doctorsResult = await getTopReferringDoctors(
            labId,
            doctorsRange.startDate,
            doctorsRange.endDate,
            5
          );
          setTopDoctors(doctorsResult || []);
        } catch (error) {
          console.error("Error fetching top doctors:", error);
          setTopDoctors([]);
        }

        // 8. Fetch revenue by collection method
        const collectionRange = getDateRange(collectionFilter, collectionCustomRange);
        try {
          const collectionResult = await getRevenueByCollectionMethod(
            labId,
            collectionRange.startDate,
            collectionRange.endDate
          );
          setRevenueByCollection(collectionResult);
        } catch (error) {
          console.error("Error fetching revenue by collection:", error);
          setRevenueByCollection(null);
        }

        // 9. Fetch age & gender distribution
        const ageGenderRange = getDateRange(ageGenderFilter, ageGenderCustomRange);
        try {
          const ageGenderResult = await getAgeGenderDistribution(
            labId,
            ageGenderRange.startDate,
            ageGenderRange.endDate
          );
          setAgeGenderData(ageGenderResult);
        } catch (error) {
          console.error("Error fetching age & gender:", error);
          setAgeGenderData(null);
        }

        // 10. Fetch funnel data
        await fetchFunnelData();

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
    },
    [
      labId,
      globalFilter,
      globalCustomRange,
      revenueFilter,
      revenueCustomRange,
      categoryFilter,
      categoryCustomRange,
      funnelFilter,
      funnelCustomRange,
      technicianFilter,
      technicianCustomRange,
      doctorsFilter,
      doctorsCustomRange,
      collectionFilter,
      collectionCustomRange,
      ageGenderFilter,
      ageGenderCustomRange,
      fetchFunnelData,
    ]
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const fetchGridData = useCallback(
    async (silent = false) => {
      if (!labId) return;
      if (!silent) setGridLoading(true);
      try {
        const range = getDateRange(gridFilter, gridCustomRange);

        const firstPage = await getGridReport(labId, range.startDate, range.endDate, 0, GRID_FETCH_PAGE_SIZE);
        let allRows: GridReportRow[] = [...firstPage.rows];

        if (firstPage.totalPages > 1) {
          const remainingPages = await Promise.all(
            Array.from({ length: firstPage.totalPages - 1 }, (_, i) =>
              getGridReport(labId, range.startDate, range.endDate, i + 1, GRID_FETCH_PAGE_SIZE)
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
    [labId, gridFilter, gridCustomRange]
  );

  // Initial load + reload whenever the lab or the section's own date filter changes.
  useEffect(() => {
    fetchGridData();
  }, [fetchGridData]);

  // Auto-refresh every 30 seconds
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
    downloadCSV(csv, generateCSVFilename("billing-report"));
  };

  // ========== DATA FORMATTING FUNCTIONS ==========

  // Format revenue data with dynamic X-axis labels
  const formatRevenueData = () => {
    if (revenueTrend.length === 0) {
      return [
        { label: "Jun", revenue: 0 },
        { label: "Jul", revenue: 0 },
        { label: "Aug", revenue: 0 },
        { label: "Sep", revenue: 0 },
        { label: "Oct", revenue: 0 },
        { label: "Nov", revenue: 0 },
        { label: "Dec", revenue: 0 },
        { label: "Jan", revenue: 0 },
      ];
    }

    const currentFilter = revenueFilter;
    const sortedData = [...revenueTrend].sort(
      (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
    );

    const sumRevenueInRange = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
      const rangeStart = start.startOf('day');
      const rangeEnd = end.endOf('day');
      return sortedData
        .filter((item) => {
          const d = dayjs(item.date);
          return !d.isBefore(rangeStart) && !d.isAfter(rangeEnd);
        })
        .reduce((sum, item) => sum + (item.revenue || 0), 0);
    };

    let buckets: { label: string; start: dayjs.Dayjs; end: dayjs.Dayjs }[] = [];

    switch (currentFilter) {
      case "currentFY": {
        const fyStart = dayjs(getFinancialYear(dayjs()).start);
        const today = dayjs();
        let current = fyStart.startOf('month');
        while (current.isBefore(today) || current.isSame(today, 'month')) {
          buckets.push({
            label: current.format("MMM"),
            start: current.startOf('month'),
            end: current.endOf('month'),
          });
          current = current.add(1, 'month');
        }
        break;
      }
      case "week": {
        const today = dayjs();
        const startOfWeek = today.startOf('week');
        let current = startOfWeek.clone();
        while (current.isBefore(today) || current.isSame(today, 'day')) {
          buckets.push({
            label: current.format("ddd"),
            start: current.startOf('day'),
            end: current.endOf('day'),
          });
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
          buckets.push({
            label: current.format("MMM"),
            start: current.startOf('month'),
            end: current.endOf('month'),
          });
          current = current.add(1, 'month');
        }
        break;
      }
      case "custom": {
        if (revenueCustomRange.startDate && revenueCustomRange.endDate) {
          const start = dayjs(revenueCustomRange.startDate);
          const end = dayjs(revenueCustomRange.endDate);
          const diffDays = end.diff(start, 'days');

          if (diffDays <= 7) {
            for (let i = 0; i <= diffDays; i++) {
              const day = start.add(i, 'days');
              buckets.push({
                label: day.format("DD MMM"),
                start: day.startOf('day'),
                end: day.endOf('day'),
              });
            }
          } else if (diffDays <= 31) {
            for (let i = 0; i <= diffDays; i += 3) {
              const segStart = start.add(i, 'days');
              const segEndCandidate = segStart.add(2, 'days');
              const segEnd = segEndCandidate.isAfter(end) ? end : segEndCandidate;
              buckets.push({
                label: segStart.format("DD MMM"),
                start: segStart.startOf('day'),
                end: segEnd.endOf('day'),
              });
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
              buckets.push({
                label: current.format("MMM YY"),
                start: bucketStart.startOf('day'),
                end: bucketEnd.endOf('day'),
              });
              current = current.add(1, 'month');
            }
          }
        } else {
          buckets = sortedData.map((item) => {
            const d = dayjs(item.date);
            return {
              label: d.format("DD MMM"),
              start: d.startOf('day'),
              end: d.endOf('day'),
            };
          });
        }
        break;
      }
      default: {
        buckets = sortedData.map((item) => {
          const d = dayjs(item.date);
          return {
            label: d.format("DD MMM"),
            start: d.startOf('day'),
            end: d.endOf('day'),
          };
        });
      }
    }

    return buckets.map((bucket) => ({
      label: bucket.label,
      revenue: sumRevenueInRange(bucket.start, bucket.end),
    }));
  };

  // Format data for category pie chart
  const getCategoryChartData = () => {
    if (!testsByCategory || testsByCategory.length === 0) {
      return [];
    }
    return testsByCategory
      .filter((item) => (item.count || 0) > 0)
      .map((item, index) => ({
        name: item.category || "Unknown",
        value: item.count || 0,
        testCount: item.count || 0,
        percentage: item.percentage || 0,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }));
  };

  // Get top order tests - using orderedCount from API
  const getTopOrderTests = () => {
    if (!topOrderedTests || topOrderedTests.length === 0) {
      return [];
    }
    return topOrderedTests.map((item) => ({
      name: item.testName || "Unknown",
      value: item.orderedCount || 0,
    }));
  };

  // Format doctors data
  const getFormattedDoctors = () => {
    if (topDoctors.length === 0) {
      return [
        {
          id: 1,
          srNo: "01",
          doctorName: "No data available",
          patients: 0,
          revenue: "₹0",
        },
      ];
    }
    return topDoctors.map((item, index) => ({
      id: index + 1,
      srNo: String(index + 1).padStart(2, "0"),
      doctorName: item.doctorName || "Unknown Doctor",
      patients: item.patientCount || 0,
      revenue: formatCurrency(item.revenue || 0),
    }));
  };

  // Format technician performance data
  const getFormattedTechnicians = () => {
    if (technicianPerformance.length === 0) {
      return [
        {
          id: 1,
          srNo: "01",
          name: "No data available",
          samplesProcessed: 0,
          reportsEntered: 0,
          avgTat: "0 hrs",
        },
      ];
    }
    return technicianPerformance.map((item, index) => ({
      id: index + 1,
      srNo: String(index + 1).padStart(2, "0"),
      name: item.technicianName || "Unknown",
      samplesProcessed: item.samplesProcessed || 0,
      reportsEntered: item.reportsEntered || 0,
      avgTat: `${item.avgTatHours?.toFixed(1) || 0} hrs`,
    }));
  };

  // Format revenue by collection method data
  const getCollectionChartData = () => {
    if (!revenueByCollection || !revenueByCollection.methods || revenueByCollection.methods.length === 0) {
      return [];
    }
    return revenueByCollection.methods.map((item, index) => ({
      name: item.method,
      value: item.percentage,
      amount: formatCurrencyFull(item.revenue),
      revenue: item.revenue,
      color: COLLECTION_COLORS[index % COLLECTION_COLORS.length],
    }));
  };

  // Format age & gender data
  const getGenderData = () => {
    if (!ageGenderData || !ageGenderData.gender || ageGenderData.gender.length === 0) {
      return [
        { name: "Male", value: 0, color: "#5B7CFA" },
        { name: "Female", value: 0, color: "#7C3AED" },
      ];
    }
    const colors = ["#5B7CFA", "#7C3AED", "#10B981"];
    return ageGenderData.gender.map((item, index) => ({
      name: item.gender || "Unknown",
      value: item.percentage || 0,
      color: colors[index % colors.length],
    }));
  };

  // Short gender label for the legend (F / M / O)
  const getGenderLabel = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower === "female") return "F";
    if (lower === "male") return "M";
    return "O";
  };

  const getAgeData = () => {
    if (!ageGenderData || !ageGenderData.ageGroups || ageGenderData.ageGroups.length === 0) {
      return [
        { age: "0 - 18", value: 0 },
        { age: "19 - 35", value: 0 },
        { age: "36 - 50", value: 0 },
        { age: "51 - 65", value: 0 },
        { age: "65+", value: 0 },
      ];
    }
    return ageGenderData.ageGroups.map((item) => ({
      age: item.ageGroup || "Unknown",
      value: item.percentage || 0,
    }));
  };

  // Turns a DashboardKpi into a trend badge
  const getTrend = (kpi: DashboardKpi | undefined) => {
    if (!kpi) return undefined;
    const pct = kpi.vsLastWeekPct;
    return {
      direction: kpi.direction,
      label: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs last wk`,
    };
  };

  const avgTatTrend = dashboardKpis
    ? {
        direction: dashboardKpis.avgTatHours.direction,
        label: `${dashboardKpis.avgTatHours.vsLastWeekHours >= 0 ? "+" : ""}${dashboardKpis.avgTatHours.vsLastWeekHours.toFixed(1)}h vs last wk`,
      }
    : undefined;

  // ========== KPI CARDS DATA ==========

  // Top row KPIs (4 cards)
  const topKpiCards = [
    {
      title: "Total Revenue",
      value: loading ? "..." : formatCurrency(totalRevenue),
      icon: Monitor,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: getTrend(dashboardKpis?.totalRevenue),
    },
    {
      title: "Total Tests",
      value: loading ? "..." : String(totalTests),
      icon: FlaskConical,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      trend: getTrend(dashboardKpis?.totalTests),
    },
    {
      title: "Total Patients",
      value: loading ? "..." : String(totalPatients),
      icon: UserRound,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: getTrend(dashboardKpis?.totalPatients),
    },
    {
      title: "Pending Samples",
      value: loading ? "..." : String(pendingSamples),
      icon: Clock3,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      trend: getTrend(dashboardKpis?.pendingSamples),
    },
  ];

  // Bottom row KPIs (2 large + 3 small)
  const bottomKpiCards = [
    {
      title: "Reports Generated",
      value: loading ? "..." : String(reportsGenerated),
      icon: FileText,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: getTrend(dashboardKpis?.reportsGenerated),
    },
    {
      title: "Avg TAT",
      value: loading ? "..." : `${avgTat.toFixed(1)} hrs`,
      icon: Users,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      trend: avgTatTrend,
    },
  ];

  const miniKpiCards = [
    {
      title: "Active admins",
      value: loading ? "..." : String(totalAdmins),
    },
    {
      title: "Technicians",
      value: loading ? "..." : String(totalTechnicians),
    },
    {
      title: "Desk Users",
      value: loading ? "..." : String(totalDeskRoles),
    },
  ];

  // ========== CHART DATA ==========
  const revenueChartData = formatRevenueData();
  const categoryChartData = getCategoryChartData();
  const topOrderTests = getTopOrderTests();
  const doctorsData = getFormattedDoctors();
  const techniciansData = getFormattedTechnicians();
  const collectionChartData = getCollectionChartData();
  const genderData = getGenderData();
  const ageData = getAgeData();

  const revenueAxisConfig = getRevenueAxisConfig(
    Math.max(0, ...revenueChartData.map((d) => d.revenue || 0))
  );

  const topOrderAxisConfig = getCountAxisConfig(
    Math.max(0, ...topOrderTests.map((item) => item.value))
  );

  // Age data max value for bar chart
  const ageMaxValue = Math.max(0, ...ageData.map((item) => item.value));

  // ========== FILTER RENDER HELPER ==========
  const renderFilterDropdown = (
    currentFilter: DateFilterType,
    onFilterChange: (filter: DateFilterType) => void,
    customRange: DateRange,
    onCustomRangeChange: (range: DateRange) => void,
    isGlobal: boolean = false
  ) => {
    const filterOptions: { value: DateFilterType; label: string }[] = [
      { value: "currentFY", label: `Current FY: ${getShortFYLabel(dayjs())}` },
      { value: "week", label: "This Week" },
      { value: "month", label: "This Month" },
      { value: "year", label: "This Year" },
      { value: "custom", label: "Custom Date" },
    ];

    const maxDate = dayjs().format("YYYY-MM-DD");

    return (
      <div className="flex items-center gap-2">
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
              className="rounded-lg border border-pneutral-100 bg-base-white px-3 py-2 text-p3 text-pneutral-900 shadow-xsm focus:outline-none focus:ring-2 focus:ring-secondary-500"
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
              className="rounded-lg border border-pneutral-100 bg-base-white px-3 py-2 text-p3 text-pneutral-900 shadow-xsm focus:outline-none focus:ring-2 focus:ring-secondary-500"
            />
          </div>
        )}
      </div>
    );
  };

  // ========== TOOLTIP COMPONENTS ==========
  const CategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-pneutral-100 bg-base-white p-4 shadow-lg min-w-[180px]">
          <p className="text-p3 font-semibold text-pneutral-900 mb-2">
            {data.name}
          </p>
          <div className="space-y-1 text-p3 text-pneutral-600">
            <p>
              Tests:{" "}
              <span className="font-semibold text-pneutral-900">
                {data.testCount.toLocaleString()}
              </span>
            </p>
            <p>
              Percentage:{" "}
              <span className="font-semibold text-pneutral-900">
                {data.percentage}%
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const GenderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-pneutral-100 bg-base-white p-4 shadow-lg">
          <p className="text-p3 font-semibold text-pneutral-900">{data.name}</p>
          <p className="text-p3 text-pneutral-600">
            Percentage:{" "}
            <span className="font-semibold text-pneutral-900">
              {data.value}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CollectionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-pneutral-100 bg-base-white p-4 shadow-lg">
          <p className="text-p3 font-semibold text-pneutral-900">{data.name}</p>
          <p className="text-p3 text-pneutral-600">
            Percentage:{" "}
            <span className="font-semibold text-pneutral-900">
              {data.value}%
            </span>
          </p>
          <p className="text-p3 text-pneutral-600">
            Amount:{" "}
            <span className="font-semibold text-pneutral-900">
              {data.amount}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-4 bg-secondary-50 px-2">
      {/* ===== HEADER ===== */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-h3 font-heading font-bold text-pneutral-900">
              Lab Analytics
            </h1>
            <span className="rounded-full bg-secondary-100 px-4 py-1 text-label-l3 font-semibold text-secondary-700">
              {currentLab?.name || "This Lab"} Overview
            </span>
            {refreshing && (
              <span className="text-xs text-pneutral-400 animate-pulse">
                Refreshing...
              </span>
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

      {/* ===== TOP ROW KPI CARDS (4) ===== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {topKpiCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-xl border border-pneutral-100 bg-white px-5 py-3 shadow-xsm"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${item.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
                <div>
                  <h4 className="text-p2 font-medium text-pneutral-700">
                    {item.title}
                  </h4>
                  <h2 className="mt-1 text-h4 font-semibold leading-none text-pneutral-900">
                    {item.value}
                  </h2>
                  {item.trend && (
                    <div
                      className={`mt-2 flex items-center gap-1 text-[11px] ${
                        item.trend.direction === "up"
                          ? "text-success-600"
                          : "text-danger-600"
                      }`}
                    >
                      {item.trend.direction === "up" ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )}
                      <span>{item.trend.label}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== BOTTOM ROW KPI CARDS ===== */}
      <div className="flex flex-col gap-4 xl:flex-row">
        {/* Large Cards (2) */}
        <div className="grid flex-[2] grid-cols-1 gap-4 md:grid-cols-2 w-full max-w-[610px]">
          {bottomKpiCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-[#E8E8E8] bg-white px-5 py-3 shadow-xsm"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${item.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="text-p2 font-medium text-pneutral-700">
                      {item.title}
                    </h4>
                    <h2 className="mt-1 text-h4 font-semibold leading-none text-pneutral-900">
                      {item.value}
                    </h2>
                    {item.trend && (
                      <div
                        className={`mt-2 flex items-center gap-1 text-[11px] ${
                          item.trend.direction === "up"
                            ? "text-success-600"
                            : "text-danger-600"
                        }`}
                      >
                        {item.trend.direction === "up" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )}
                        <span>{item.trend.label}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Small Cards (3) */}
        <div className="grid flex-1 grid-cols-3 gap-4">
          {miniKpiCards.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center justify-center rounded-xl border border-[#E8E8E8] bg-white shadow-xsm"
            >
              <h4 className="text-p2 font-medium text-pneutral-700">
                {item.title}
              </h4>
              <h2 className="mt-1 text-h4 font-semibold text-pneutral-900">
                {item.value}
              </h2>
            </div>
          ))}
        </div>
      </div>

      {/* ===== DAILY REVENUE TREND + SAMPLE WORKFLOW FUNNEL ===== */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Daily Revenue Trend - Left */}
        <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
                Daily Revenue Trend
              </h2>
              <p className="mt-1 text-p3 font-semibold text-pneutral-900">
                Total Revenue
                <span className="ml-1 font-semibold text-pneutral-900">
                  {formatCurrency(totalRevenue)}
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
          </div>
        </div>

        {/* Sample Workflow Funnel - Right */}
        <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
              Sample Workflow Funnel
            </h2>
            {renderFilterDropdown(
              funnelFilter,
              setFunnelFilter,
              funnelCustomRange,
              setFunnelCustomRange,
              false
            )}
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-between">
            {/* Funnel SVG - Dynamic heights based on percentages */}
            <div className="flex justify-center w-full lg:w-[42%]">
              <svg width="230" height="300" viewBox="0 0 230 300">
                {/* Fixed funnel shape (equal segment heights) — only the
                    labels/values/percentages next to it are data-driven. */}
                {(() => {
                  const gap = 8;
                  const totalGap = gap * (funnelData.length - 1);
                  const segmentHeight = (280 - totalGap) / funnelData.length;

                  // Colors for each funnel section
                  const colors = ["#4F11B8", "#FDBA12", "#5470F5", "#EF5A5A"];
                  // One extra "tip" width so the last section tapers like the rest
                  // instead of ending in a flat-bottomed rectangle.
                  const widths = [170, 130, 90, 60, 30];

                  return funnelData.map((_, index) => {
                    const y = index * (segmentHeight + gap);
                    const width = widths[index] || 30;
                    const x = (230 - width) / 2;
                    const nextWidth = widths[index + 1] || 30;
                    const nextX = (230 - nextWidth) / 2;

                    // All sections taper into the next section's width,
                    // including the last one, so the funnel narrows consistently.
                    return (
                      <polygon
                        key={index}
                        points={`${x},${y} ${x + width},${y} ${nextX + nextWidth},${y + segmentHeight} ${nextX},${y + segmentHeight}`}
                        fill={colors[index]}
                      />
                    );
                  });
                })()}
              </svg>
            </div>

            {/* Right Side - Data Labels */}
            <div className="w-full lg:w-[55%] space-y-11">
              {funnelData.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[1fr_70px_60px] items-center"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3.5 w-3.5 rounded-full shadow-md"
                      style={{
                        background: item.color,
                        boxShadow: "0 2px 8px rgba(0,0,0,.25)",
                      }}
                    />
                    <span className="text-[16px] text-[#555] font-medium">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-right text-[16px] text-[#555]">
                    {item.value}
                  </div>
                  <div className="text-right text-[16px] text-[#555]">
                    {item.percent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== TEST BY CATEGORY + TOP ORDER TEST ===== */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Test By Category - Pie Chart */}
        <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
              Test by Category
            </h2>
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
                        {categoryTotal.toLocaleString()}
                      </text>
                      <Tooltip content={<CategoryTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {categoryChartData.map((item) => (
                    <div
                      key={item.name}
                      className="flex w-44 items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ background: item.color }}
                        />
                        <span className="text-p3 text-pneutral-700">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-p3 font-medium text-pneutral-600">
                        {item.testCount}
                      </span>
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

        {/* Top Order Test */}
        <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
              Top Order Test
            </h2>
            {renderFilterDropdown(
              categoryFilter,
              setCategoryFilter,
              categoryCustomRange,
              setCategoryCustomRange,
              false
            )}
          </div>
          <div className="space-y-4">
            {topOrderTests.length > 0 ? (
              topOrderTests.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1.2fr_2.5fr_64px] items-center gap-5"
                >
                  <p className="truncate text-p3 font-medium text-pneutral-900">
                    {item.name}
                  </p>
                  <div className="relative h-4 overflow-hidden rounded-full bg-secondary-100">
                    <div
                      className="h-full rounded-full bg-secondary-700 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (item.value / topOrderAxisConfig.domainMax) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="w-16 text-right text-p3 font-semibold text-pneutral-900">
                    {item.value}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-pneutral-500">
                No data available
              </div>
            )}
          </div>
          <div className="grid grid-cols-[1.2fr_2.5fr_64px] gap-5 mt-5">
            <div />
            <div className="relative h-6">
              {topOrderAxisConfig.ticks.map((tick, index) => (
                <span
                  key={tick}
                  className="absolute -translate-x-1/2 text-p3 text-pneutral-900"
                  style={{
                    left: `${
                      (index / (topOrderAxisConfig.ticks.length - 1)) * 100
                    }%`,
                  }}
                >
                  {topOrderAxisConfig.formatTick(tick)}
                </span>
              ))}
            </div>
            <div />
          </div>
        </div>
      </div>

      {/* ===== REVENUE BY COLLECTION METHOD + AGE & GENDER DISTRIBUTION ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Revenue by Collection Method */}
        <div className="rounded-lg border border-pneutral-100 bg-white px-4 py-2 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-p4 font-semibold text-pneutral-900">
              Revenue by Collection Method
            </h2>
            {renderFilterDropdown(
              collectionFilter,
              setCollectionFilter,
              collectionCustomRange,
              setCollectionCustomRange,
              false
            )}
          </div>

          {collectionChartData.length > 0 ? (
            <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">
              {/* Donut Chart */}
              <div className="h-[280px] w-[280px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={collectionChartData}
                      dataKey="value"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={1}
                      stroke="none"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {collectionChartData.map((item, index) => (
                        <Cell key={index} fill={item.color} />
                      ))}
                    </Pie>
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-pneutral-900 text-2xl font-bold"
                    >
                      {formatCurrencyFull(revenueByCollection?.total || 0)}
                    </text>
                    <Tooltip content={<CollectionTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="w-full max-w-sm space-y-6">
                {collectionChartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-lg font-medium text-pneutral-700">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className="font-semibold text-pneutral-800">
                        {item.value}%
                      </span>
                      <span className="font-semibold text-pneutral-700">
                        ({item.amount})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-pneutral-500">
              No collection data available
            </div>
          )}
        </div>

        {/* Age & Gender Distribution */}
        <div className="rounded-lg border border-pneutral-100 bg-white px-4 py-2 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-p4 font-semibold text-pneutral-900">
              Age & Gender Distribution
            </h2>
            {renderFilterDropdown(
              ageGenderFilter,
              setAgeGenderFilter,
              ageGenderCustomRange,
              setAgeGenderCustomRange,
              false
            )}
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Gender Section */}
            <div>
              <h3 className="mb-5 text-p3 font-semibold text-pneutral-900">
                Gender
              </h3>

              <div className="flex flex-col items-center gap-4">
                {/* Donut */}
                <div className="h-52 w-52 flex-shrink-0">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={genderData}
                        dataKey="value"
                        innerRadius={45}
                        outerRadius={75}
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {genderData.map((item, index) => (
                          <Cell key={index} fill={item.color} />
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="47%"
                        textAnchor="middle"
                        className="fill-pneutral-500 text-label-l3 font-medium"
                      >
                        Total
                      </text>
                      <text
                        x="50%"
                        y="59%"
                        textAnchor="middle"
                        className="fill-pneutral-900 text-h4 font-semibold"
                      >
                        {(ageGenderData?.totalPatients ?? 0).toLocaleString()}
                      </text>
                      <Tooltip content={<GenderTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {genderData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 mb-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ background: item.color }}
                      />
                      <span className="text-p3 font-medium text-pneutral-700">
                        {getGenderLabel(item.name)}
                      </span>
                      <span className="text-p3 font-semibold text-pneutral-900">
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Age Group */}
            <div>
              <h3 className="mb-5 text-p3 font-semibold text-pneutral-900">
                Age Group
              </h3>

              <div className="space-y-5">
                {ageData.map((item) => (
                  <div key={item.age} className="flex items-center gap-5">
                    <span className="w-16 text-pneutral-700">
                      {item.age}
                    </span>

                    <div className="h-5 flex-1 rounded-full bg-blue-100">
                      <div
                        className="h-5 rounded-full bg-[#5B7CFA] transition-all duration-500"
                        style={{
                          width: `${Math.min((item.value / ageMaxValue) * 100, 100)}%`,
                        }}
                      />
                    </div>

                    <span className="w-10 text-right font-semibold text-pneutral-700">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TECHNICIAN PERFORMANCE + TOP REFERRING DOCTORS ===== */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Technician Performance */}
        <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
              Technician Performance
            </h2>
            {renderFilterDropdown(
              technicianFilter,
              setTechnicianFilter,
              technicianCustomRange,
              setTechnicianCustomRange,
              false
            )}
          </div>
          <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-y border-pneutral-100 bg-pneutral-50">
                  <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">
                    SI No.
                  </th>
                  <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">
                    Technician
                  </th>
                  <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">
                    Sample Processed
                  </th>
                  <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">
                    Reports Entered
                  </th>
                  <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">
                    Avg TAT
                  </th>
                </tr>
              </thead>
              <tbody>
                {techniciansData.map((tech) => (
                  <tr
                    key={tech.id}
                    className="border-b border-pneutral-100 transition hover:bg-pneutral-50"
                  >
                    <td className="px-4 py-2 text-p3 text-pneutral-900">
                      {tech.srNo}
                    </td>
                    <td className="px-4 py-2 text-p3 font-medium text-pneutral-900">
                      {tech.name}
                    </td>
                    <td className="px-4 py-2 text-p3 text-right text-pneutral-900">
                      {tech.samplesProcessed.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-p3 text-right text-pneutral-900">
                      {tech.reportsEntered.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-p3 text-right text-pneutral-900">
                      {tech.avgTat}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Referring Doctors */}
        <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
              Top Referring Doctors
            </h2>
            {renderFilterDropdown(
              doctorsFilter,
              setDoctorsFilter,
              doctorsCustomRange,
              setDoctorsCustomRange,
              false
            )}
          </div>
          <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-y border-pneutral-100 bg-pneutral-50">
                  <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">
                    SI NO.
                  </th>
                  <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">
                    Doctor Name
                  </th>
                  <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">
                    Patient
                  </th>
                  <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">
                    Revenue(₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {doctorsData.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="border-b border-pneutral-100 transition hover:bg-pneutral-50"
                  >
                    <td className="px-4 py-2 text-p3 text-pneutral-900">
                      {doctor.srNo}
                    </td>
                    <td className="px-4 py-2 text-p3 font-medium text-pneutral-900">
                      {doctor.doctorName}
                    </td>
                    <td className="px-4 py-2 text-p3 text-right text-pneutral-900">
                      {doctor.patients.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-p3 text-right font-medium text-pneutral-900">
                      {doctor.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== BILLING REPORT ===== */}
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

export default AdminStats;
































// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import dayjs from "dayjs";
// import {
//   ArrowUp,
//   ArrowDown,
//   Users,
//   Monitor,
//   FlaskConical,
//   UserRound,
//   Clock3,
//   FileText,
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

// // Import context + services
// import { useLabs } from "@/context/LabContext";
// import {
//   getAvgTat,
//   getDashboardKpis,
//   getPendingSamples,
//   getReportsGenerated,
//   getRevenueTrend,
//   getTestsByCategory,
//   getTopReferringDoctors,
//   getTotalAdmins,
//   getTotalDeskRoles,
//   getTotalPatients,
//   getTotalTechnicians,
//   getTotalTests,
//   getTotalRevenue,
//   getSampleWorkflowFunnel,
//   getTechnicianPerformance,
//   getTopOrderedTests,
//   getRevenueByCollectionMethod,
//   getAgeGenderDistribution,
// } from "../../../../../../services/adminStatService";
// import {
//   DashboardKpi,
//   DashboardKpis,
//   TopReferringDoctor,
//   TechnicianPerformance as TechnicianPerformanceType,
//   TopOrderedTest,
//   RevenueByCollectionMethod as RevenueByCollectionMethodType,
//   AgeGenderDistribution as AgeGenderDistributionType,
// } from "@/types/adminStatsData";

// type DateFilterType = "currentFY" | "week" | "month" | "year" | "custom";

// interface DateRange {
//   startDate: string;
//   endDate: string;
// }

// // ─────────────────────────────────────────────────────────────────────────
// // Helper Functions
// // ─────────────────────────────────────────────────────────────────────────

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
// const getDateRange = (
//   filter: DateFilterType,
//   customRange?: DateRange
// ): { startDate?: string; endDate?: string } => {
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

// // Format currency for display with ₹ symbol and Lakh/Crore
// const formatCurrencyFull = (amount: number): string => {
//   if (amount >= 10000000) {
//     return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
//   }
//   if (amount >= 100000) {
//     return `₹ ${(amount / 100000).toFixed(2)} L`;
//   }
//   if (amount >= 1000) {
//     return `₹ ${(amount / 1000).toFixed(2)} K`;
//   }
//   return `₹ ${amount.toFixed(2)}`;
// };

// // Revenue axis unit tiers
// const REVENUE_AXIS_UNITS = [
//   { limit: 100000, divisor: 1000, suffix: "K" },
//   { limit: 10000000, divisor: 100000, suffix: "L" },
//   { limit: Infinity, divisor: 10000000, suffix: "Cr" },
// ];

// // Builds a "nice" 0..max axis (6 ticks) that scales with the data
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

// // Count axis unit tiers (plain counts, e.g. "Top Order Test")
// const COUNT_AXIS_UNITS = [
//   { limit: 1000, divisor: 1, suffix: "" },
//   { limit: Infinity, divisor: 1000, suffix: "k" },
// ];

// // Builds a "nice" 0..max axis (6 ticks) for small counts: 0,100,200...500,
// // then scales up to 1k,2k,3k... as values grow.
// const getCountAxisConfig = (maxValue: number) => {
//   const safeMax = Math.max(maxValue, 0);
//   let step = 100;
//   while (step * 5 < safeMax) {
//     step = step * 10;
//   }
//   const domainMax = step * 5;
//   const ticks = Array.from({ length: 6 }, (_, i) => i * step);
//   const unit =
//     COUNT_AXIS_UNITS.find((u) => domainMax < u.limit) ||
//     COUNT_AXIS_UNITS[COUNT_AXIS_UNITS.length - 1];

//   const formatTick = (value: number): string => {
//     if (unit.divisor === 1) return `${value}`;
//     const scaled = Math.round((value / unit.divisor) * 10) / 10;
//     return `${scaled}${unit.suffix}`;
//   };

//   return { domainMax, ticks, formatTick };
// };

// // Helper: ordinal suffix
// const getOrdinalSuffix = (num: number): string => {
//   if (num === 1) return "st";
//   if (num === 2) return "nd";
//   if (num === 3) return "rd";
//   return "th";
// };

// // Color constants for charts
// const CATEGORY_COLORS = [
//   "#4F6BED",
//   "#55D400",
//   "#8B5CF6",
//   "#FDBA12",
//   "#F75A5A",
//   "#4C0FAE",
//   "#6D28D9",
//   "#38B000",
// ];

// const COLLECTION_COLORS = ["#6C63FF", "#008000", "#6BD3A7", "#FF5A5F"];

// // ─────────────────────────────────────────────────────────────────────────
// // Main Component
// // ─────────────────────────────────────────────────────────────────────────

// const AdminStats = () => {
//   const { currentLab } = useLabs();
//   const labId = currentLab?.id;

//   // Loading states
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

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

//   const [categoryFilter, setCategoryFilter] = useState<DateFilterType>("currentFY");
//   const [categoryCustomRange, setCategoryCustomRange] = useState<DateRange>({
//     startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
//     endDate: dayjs().format("YYYY-MM-DD"),
//   });

//   const [funnelFilter, setFunnelFilter] = useState<DateFilterType>("currentFY");
//   const [funnelCustomRange, setFunnelCustomRange] = useState<DateRange>({
//     startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
//     endDate: dayjs().format("YYYY-MM-DD"),
//   });

//   const [technicianFilter, setTechnicianFilter] = useState<DateFilterType>("currentFY");
//   const [technicianCustomRange, setTechnicianCustomRange] = useState<DateRange>({
//     startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
//     endDate: dayjs().format("YYYY-MM-DD"),
//   });

//   const [doctorsFilter, setDoctorsFilter] = useState<DateFilterType>("currentFY");
//   const [doctorsCustomRange, setDoctorsCustomRange] = useState<DateRange>({
//     startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
//     endDate: dayjs().format("YYYY-MM-DD"),
//   });

//   const [collectionFilter, setCollectionFilter] = useState<DateFilterType>("currentFY");
//   const [collectionCustomRange, setCollectionCustomRange] = useState<DateRange>({
//     startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
//     endDate: dayjs().format("YYYY-MM-DD"),
//   });

//   const [ageGenderFilter, setAgeGenderFilter] = useState<DateFilterType>("currentFY");
//   const [ageGenderCustomRange, setAgeGenderCustomRange] = useState<DateRange>({
//     startDate: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
//     endDate: dayjs().format("YYYY-MM-DD"),
//   });

//   // ========== STATE FOR ALL METRICS ==========
//   // KPI Cards
//   const [totalAdmins, setTotalAdmins] = useState<number>(0);
//   const [totalTechnicians, setTotalTechnicians] = useState<number>(0);
//   const [totalDeskRoles, setTotalDeskRoles] = useState<number>(0);
//   const [totalPatients, setTotalPatients] = useState<number>(0);
//   const [totalTests, setTotalTests] = useState<number>(0);
//   const [totalRevenue, setTotalRevenue] = useState<number>(0);
//   const [reportsGenerated, setReportsGenerated] = useState<number>(0);
//   const [pendingSamples, setPendingSamples] = useState<number>(0);
//   const [avgTat, setAvgTat] = useState<number>(0);
//   const [dashboardKpis, setDashboardKpis] = useState<DashboardKpis | null>(null);

//   // Charts & Tables
//   const [testsByCategory, setTestsByCategory] = useState<
//     Array<{ category: string; count: number; percentage: number }>
//   >([]);
//   const [categoryTotal, setCategoryTotal] = useState<number>(0);
//   const [revenueTrend, setRevenueTrend] = useState<
//     Array<{ date: string; revenue: number }>
//   >([]);
//   const [topDoctors, setTopDoctors] = useState<TopReferringDoctor[]>([]);
//   const [technicianPerformance, setTechnicianPerformance] = useState<
//     TechnicianPerformanceType[]
//   >([]);
//   const [topOrderedTests, setTopOrderedTests] = useState<TopOrderedTest[]>([]);
//   const [revenueByCollection, setRevenueByCollection] = useState<RevenueByCollectionMethodType | null>(null);
//   const [ageGenderData, setAgeGenderData] = useState<AgeGenderDistributionType | null>(null);

//   // Funnel Data (from API)
//   const [funnelData, setFunnelData] = useState<
//     Array<{ label: string; value: string; percent: string; color: string }>
//   >([
//     { label: "Samples Registered", value: "0", percent: "0%", color: "#4F11B8" },
//     { label: "Samples Collected", value: "0", percent: "0%", color: "#FDBA12" },
//     { label: "Results Entered", value: "0", percent: "0%", color: "#5470F5" },
//     { label: "Reports Generated", value: "0", percent: "0%", color: "#EF5A5A" },
//     // { label: "Reports Delivered", value: "0", percent: "0%", color: "#52C41A" },
//   ]);

//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

//   // ========== SYNC FILTERS ==========
//   useEffect(() => {
//     setRevenueFilter(globalFilter);
//     setCategoryFilter(globalFilter);
//     setFunnelFilter(globalFilter);
//     setTechnicianFilter(globalFilter);
//     setDoctorsFilter(globalFilter);
//     setCollectionFilter(globalFilter);
//     setAgeGenderFilter(globalFilter);
//   }, [globalFilter]);

//   useEffect(() => {
//     if (globalFilter === "custom") {
//       setRevenueCustomRange(globalCustomRange);
//       setCategoryCustomRange(globalCustomRange);
//       setFunnelCustomRange(globalCustomRange);
//       setTechnicianCustomRange(globalCustomRange);
//       setDoctorsCustomRange(globalCustomRange);
//       setCollectionCustomRange(globalCustomRange);
//       setAgeGenderCustomRange(globalCustomRange);
//     }
//   }, [globalCustomRange, globalFilter]);

//   // ========== FETCH FUNNEL DATA ==========
//   const fetchFunnelData = useCallback(
//     async () => {
//       if (!labId) return;

//       try {
//         const funnelRange = getDateRange(funnelFilter, funnelCustomRange);
        
//         const funnelResult = await getSampleWorkflowFunnel(
//           labId,
//           funnelRange.startDate,
//           funnelRange.endDate
//         );

//         setFunnelData([
//           {
//             label: "Samples Registered",
//             value: funnelResult.samplesRegistered.count.toLocaleString(),
//             percent: `${funnelResult.samplesRegistered.percentage}%`,
//             color: "#4F11B8",
//           },
//           {
//             label: "Samples Collected",
//             value: funnelResult.samplesCollected.count.toLocaleString(),
//             percent: `${funnelResult.samplesCollected.percentage}%`,
//             color: "#FDBA12",
//           },
//           {
//             label: "Results Entered",
//             value: funnelResult.resultsEntered.count.toLocaleString(),
//             percent: `${funnelResult.resultsEntered.percentage}%`,
//             color: "#5470F5",
//           },
//           {
//             label: "Reports Generated",
//             value: funnelResult.reportsGenerated.count.toLocaleString(),
//             percent: `${funnelResult.reportsGenerated.percentage}%`,
//             color: "#EF5A5A",
//           },
//           // {
//           //   label: "Reports Delivered",
//           //   value: funnelResult.reportsDelivered.count.toLocaleString(),
//           //   percent: `${funnelResult.reportsDelivered.percentage}%`,
//           //   color: "#52C41A",
//           // },
//         ]);
//       } catch (error) {
//         console.error("Error fetching funnel data:", error);
//       }
//     },
//     [labId, funnelFilter, funnelCustomRange]
//   );

//   // ========== FETCH FUNCTION ==========
//   const fetchAllData = useCallback(
//     async (silent = false) => {
//       if (!labId) return;

//       if (!silent) {
//         setLoading(true);
//       } else {
//         setRefreshing(true);
//       }

//       try {
//         // 1. Fetch KPIs WITHOUT date filters (all-time)
//         const [
//           adminsResult,
//           techniciansResult,
//           deskRolesResult,
//           dashboardKpisResult,
//         ] = await Promise.allSettled([
//           getTotalAdmins(labId),
//           getTotalTechnicians(labId),
//           getTotalDeskRoles(labId),
//           getDashboardKpis(labId),
//         ]);

//         if (adminsResult.status === "fulfilled")
//           setTotalAdmins(adminsResult.value.totalAdmins);
//         if (techniciansResult.status === "fulfilled")
//           setTotalTechnicians(techniciansResult.value.totalTechnicians);
//         if (deskRolesResult.status === "fulfilled")
//           setTotalDeskRoles(deskRolesResult.value.totalDeskRoles);
//         if (dashboardKpisResult.status === "fulfilled")
//           setDashboardKpis(dashboardKpisResult.value);

//         // 2. Fetch data with GLOBAL date filter for main KPIs
//         const globalRange = getDateRange(globalFilter, globalCustomRange);
//         const [
//           testsResult,
//           reportsResult,
//           pendingResult,
//           patientsResult,
//           revenueResult,
//           avgTatResult,
//         ] = await Promise.allSettled([
//           getTotalTests(labId, globalRange.startDate, globalRange.endDate),
//           getReportsGenerated(labId, globalRange.startDate, globalRange.endDate),
//           getPendingSamples(labId, globalRange.startDate, globalRange.endDate),
//           getTotalPatients(labId, globalRange.startDate, globalRange.endDate),
//           getTotalRevenue(labId, globalRange.startDate, globalRange.endDate),
//           getAvgTat(labId, globalRange.startDate, globalRange.endDate),
//         ]);

//         if (testsResult.status === "fulfilled")
//           setTotalTests(testsResult.value.totalTests);
//         if (reportsResult.status === "fulfilled")
//           setReportsGenerated(reportsResult.value.reportsGenerated);
//         if (pendingResult.status === "fulfilled")
//           setPendingSamples(pendingResult.value.pendingSamples);
//         if (patientsResult.status === "fulfilled")
//           setTotalPatients(patientsResult.value.totalPatients);
//         if (revenueResult.status === "fulfilled")
//           setTotalRevenue(revenueResult.value.totalRevenue);
//         if (avgTatResult.status === "fulfilled")
//           setAvgTat(avgTatResult.value.avgTatHours);

//         // 3. Fetch revenue trend with its OWN filter
//         const revenueRange = getDateRange(revenueFilter, revenueCustomRange);
//         if (revenueRange.startDate && revenueRange.endDate) {
//           try {
//             const trendResult = await getRevenueTrend(
//               labId,
//               revenueRange.startDate,
//               revenueRange.endDate
//             );
//             setRevenueTrend(trendResult.trend || []);
//           } catch (error) {
//             console.error("Error fetching revenue trend:", error);
//             setRevenueTrend([]);
//           }
//         } else {
//           setRevenueTrend([]);
//         }

//         // 4. Fetch tests by category with the section's OWN filter
//         const categoryRange = getDateRange(categoryFilter, categoryCustomRange);
//         try {
//           const categoryResult = await getTestsByCategory(
//             labId,
//             categoryRange.startDate,
//             categoryRange.endDate
//           );
//           setTestsByCategory(categoryResult.categories || []);
//           setCategoryTotal(categoryResult.total || 0);
//         } catch (error) {
//           console.error("Error fetching tests by category:", error);
//           setTestsByCategory([]);
//           setCategoryTotal(0);
//         }

//         // 5. Fetch top ordered tests with the category filter
//         try {
//           const topTests = await getTopOrderedTests(
//             labId,
//             categoryRange.startDate,
//             categoryRange.endDate,
//             5
//           );
//           setTopOrderedTests(topTests || []);
//         } catch (error) {
//           console.error("Error fetching top ordered tests:", error);
//           setTopOrderedTests([]);
//         }

//         // 6. Fetch technician performance with its OWN filter
//         const technicianRange = getDateRange(
//           technicianFilter,
//           technicianCustomRange
//         );
//         try {
//           const techResult = await getTechnicianPerformance(
//             labId,
//             technicianRange.startDate,
//             technicianRange.endDate
//           );
//           setTechnicianPerformance(techResult || []);
//         } catch (error) {
//           console.error("Error fetching technician performance:", error);
//           setTechnicianPerformance([]);
//         }

//         // 7. Fetch top doctors with its OWN filter
//         const doctorsRange = getDateRange(doctorsFilter, doctorsCustomRange);
//         try {
//           const doctorsResult = await getTopReferringDoctors(
//             labId,
//             doctorsRange.startDate,
//             doctorsRange.endDate,
//             5
//           );
//           setTopDoctors(doctorsResult || []);
//         } catch (error) {
//           console.error("Error fetching top doctors:", error);
//           setTopDoctors([]);
//         }

//         // 8. Fetch revenue by collection method
//         const collectionRange = getDateRange(collectionFilter, collectionCustomRange);
//         try {
//           const collectionResult = await getRevenueByCollectionMethod(
//             labId,
//             collectionRange.startDate,
//             collectionRange.endDate
//           );
//           setRevenueByCollection(collectionResult);
//         } catch (error) {
//           console.error("Error fetching revenue by collection:", error);
//           setRevenueByCollection(null);
//         }

//         // 9. Fetch age & gender distribution
//         const ageGenderRange = getDateRange(ageGenderFilter, ageGenderCustomRange);
//         try {
//           const ageGenderResult = await getAgeGenderDistribution(
//             labId,
//             ageGenderRange.startDate,
//             ageGenderRange.endDate
//           );
//           setAgeGenderData(ageGenderResult);
//         } catch (error) {
//           console.error("Error fetching age & gender:", error);
//           setAgeGenderData(null);
//         }

//         // 10. Fetch funnel data
//         await fetchFunnelData();

//         setLastUpdated(new Date());
//       } catch (error) {
//         console.error("Error fetching dashboard data:", error);
//       } finally {
//         if (!silent) {
//           setLoading(false);
//         } else {
//           setRefreshing(false);
//         }
//       }
//     },
//     [
//       labId,
//       globalFilter,
//       globalCustomRange,
//       revenueFilter,
//       revenueCustomRange,
//       categoryFilter,
//       categoryCustomRange,
//       funnelFilter,
//       funnelCustomRange,
//       technicianFilter,
//       technicianCustomRange,
//       doctorsFilter,
//       doctorsCustomRange,
//       collectionFilter,
//       collectionCustomRange,
//       ageGenderFilter,
//       ageGenderCustomRange,
//       fetchFunnelData,
//     ]
//   );

//   // Initial load
//   useEffect(() => {
//     fetchAllData();
//   }, [fetchAllData]);

//   // Auto-refresh every 30 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchAllData(true);
//     }, 30000);
//     return () => clearInterval(interval);
//   }, [fetchAllData]);

//   // ========== DATA FORMATTING FUNCTIONS ==========

//   // Format revenue data with dynamic X-axis labels
//   const formatRevenueData = () => {
//     if (revenueTrend.length === 0) {
//       return [
//         { label: "Jun", revenue: 0 },
//         { label: "Jul", revenue: 0 },
//         { label: "Aug", revenue: 0 },
//         { label: "Sep", revenue: 0 },
//         { label: "Oct", revenue: 0 },
//         { label: "Nov", revenue: 0 },
//         { label: "Dec", revenue: 0 },
//         { label: "Jan", revenue: 0 },
//       ];
//     }

//     const currentFilter = revenueFilter;
//     const sortedData = [...revenueTrend].sort(
//       (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
//     );

//     const sumRevenueInRange = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
//       const rangeStart = start.startOf('day');
//       const rangeEnd = end.endOf('day');
//       return sortedData
//         .filter((item) => {
//           const d = dayjs(item.date);
//           return !d.isBefore(rangeStart) && !d.isAfter(rangeEnd);
//         })
//         .reduce((sum, item) => sum + (item.revenue || 0), 0);
//     };

//     let buckets: { label: string; start: dayjs.Dayjs; end: dayjs.Dayjs }[] = [];

//     switch (currentFilter) {
//       case "currentFY": {
//         const fyStart = dayjs(getFinancialYear(dayjs()).start);
//         const today = dayjs();
//         let current = fyStart.startOf('month');
//         while (current.isBefore(today) || current.isSame(today, 'month')) {
//           buckets.push({
//             label: current.format("MMM"),
//             start: current.startOf('month'),
//             end: current.endOf('month'),
//           });
//           current = current.add(1, 'month');
//         }
//         break;
//       }
//       case "week": {
//         const today = dayjs();
//         const startOfWeek = today.startOf('week');
//         let current = startOfWeek.clone();
//         while (current.isBefore(today) || current.isSame(today, 'day')) {
//           buckets.push({
//             label: current.format("ddd"),
//             start: current.startOf('day'),
//             end: current.endOf('day'),
//           });
//           current = current.add(1, 'day');
//         }
//         break;
//       }
//       case "month": {
//         const today = dayjs();
//         const startOfMonthWeek = today.startOf('month').startOf('week');
//         const startOfCurrentWeek = today.startOf('week');
//         const totalWeeks = startOfCurrentWeek.diff(startOfMonthWeek, 'week') + 1;
//         for (let i = 0; i < totalWeeks; i++) {
//           const weekStart = startOfMonthWeek.add(i * 7, 'day');
//           buckets.push({
//             label: `${i + 1}${getOrdinalSuffix(i + 1)} Week`,
//             start: weekStart.startOf('day'),
//             end: weekStart.add(6, 'day').endOf('day'),
//           });
//         }
//         break;
//       }
//       case "year": {
//         const today = dayjs();
//         let current = dayjs().startOf('year');
//         while (current.isBefore(today) || current.isSame(today, 'month')) {
//           buckets.push({
//             label: current.format("MMM"),
//             start: current.startOf('month'),
//             end: current.endOf('month'),
//           });
//           current = current.add(1, 'month');
//         }
//         break;
//       }
//       case "custom": {
//         if (revenueCustomRange.startDate && revenueCustomRange.endDate) {
//           const start = dayjs(revenueCustomRange.startDate);
//           const end = dayjs(revenueCustomRange.endDate);
//           const diffDays = end.diff(start, 'days');

//           if (diffDays <= 7) {
//             for (let i = 0; i <= diffDays; i++) {
//               const day = start.add(i, 'days');
//               buckets.push({
//                 label: day.format("DD MMM"),
//                 start: day.startOf('day'),
//                 end: day.endOf('day'),
//               });
//             }
//           } else if (diffDays <= 31) {
//             for (let i = 0; i <= diffDays; i += 3) {
//               const segStart = start.add(i, 'days');
//               const segEndCandidate = segStart.add(2, 'days');
//               const segEnd = segEndCandidate.isAfter(end) ? end : segEndCandidate;
//               buckets.push({
//                 label: segStart.format("DD MMM"),
//                 start: segStart.startOf('day'),
//                 end: segEnd.endOf('day'),
//               });
//             }
//             if (buckets.length > 0) {
//               buckets[buckets.length - 1].end = end.endOf('day');
//             }
//           } else {
//             let current = start.startOf('month');
//             while (current.isBefore(end) || current.isSame(end, 'month')) {
//               const bucketStart = current.isBefore(start) ? start : current;
//               const monthEnd = current.endOf('month');
//               const bucketEnd = monthEnd.isAfter(end) ? end : monthEnd;
//               buckets.push({
//                 label: current.format("MMM YY"),
//                 start: bucketStart.startOf('day'),
//                 end: bucketEnd.endOf('day'),
//               });
//               current = current.add(1, 'month');
//             }
//           }
//         } else {
//           buckets = sortedData.map((item) => {
//             const d = dayjs(item.date);
//             return {
//               label: d.format("DD MMM"),
//               start: d.startOf('day'),
//               end: d.endOf('day'),
//             };
//           });
//         }
//         break;
//       }
//       default: {
//         buckets = sortedData.map((item) => {
//           const d = dayjs(item.date);
//           return {
//             label: d.format("DD MMM"),
//             start: d.startOf('day'),
//             end: d.endOf('day'),
//           };
//         });
//       }
//     }

//     return buckets.map((bucket) => ({
//       label: bucket.label,
//       revenue: sumRevenueInRange(bucket.start, bucket.end),
//     }));
//   };

//   // Format data for category pie chart
//   const getCategoryChartData = () => {
//     if (!testsByCategory || testsByCategory.length === 0) {
//       return [];
//     }
//     return testsByCategory
//       .filter((item) => (item.count || 0) > 0)
//       .map((item, index) => ({
//         name: item.category || "Unknown",
//         value: item.count || 0,
//         testCount: item.count || 0,
//         percentage: item.percentage || 0,
//         color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
//       }));
//   };

//   // Get top order tests - using orderedCount from API
//   const getTopOrderTests = () => {
//     if (!topOrderedTests || topOrderedTests.length === 0) {
//       return [];
//     }
//     return topOrderedTests.map((item) => ({
//       name: item.testName || "Unknown",
//       value: item.orderedCount || 0,
//     }));
//   };

//   // Format doctors data
//   const getFormattedDoctors = () => {
//     if (topDoctors.length === 0) {
//       return [
//         {
//           id: 1,
//           srNo: "01",
//           doctorName: "No data available",
//           patients: 0,
//           revenue: "₹0",
//         },
//       ];
//     }
//     return topDoctors.map((item, index) => ({
//       id: index + 1,
//       srNo: String(index + 1).padStart(2, "0"),
//       doctorName: item.doctorName || "Unknown Doctor",
//       patients: item.patientCount || 0,
//       revenue: formatCurrency(item.revenue || 0),
//     }));
//   };

//   // Format technician performance data
//   const getFormattedTechnicians = () => {
//     if (technicianPerformance.length === 0) {
//       return [
//         {
//           id: 1,
//           srNo: "01",
//           name: "No data available",
//           samplesProcessed: 0,
//           reportsEntered: 0,
//           avgTat: "0 hrs",
//         },
//       ];
//     }
//     return technicianPerformance.map((item, index) => ({
//       id: index + 1,
//       srNo: String(index + 1).padStart(2, "0"),
//       name: item.technicianName || "Unknown",
//       samplesProcessed: item.samplesProcessed || 0,
//       reportsEntered: item.reportsEntered || 0,
//       avgTat: `${item.avgTatHours?.toFixed(1) || 0} hrs`,
//     }));
//   };

//   // Format revenue by collection method data
//   const getCollectionChartData = () => {
//     if (!revenueByCollection || !revenueByCollection.methods || revenueByCollection.methods.length === 0) {
//       return [];
//     }
//     return revenueByCollection.methods.map((item, index) => ({
//       name: item.method,
//       value: item.percentage,
//       amount: formatCurrencyFull(item.revenue),
//       revenue: item.revenue,
//       color: COLLECTION_COLORS[index % COLLECTION_COLORS.length],
//     }));
//   };

//   // Format age & gender data
//   const getGenderData = () => {
//     if (!ageGenderData || !ageGenderData.gender || ageGenderData.gender.length === 0) {
//       return [
//         { name: "Male", value: 0, color: "#5B7CFA" },
//         { name: "Female", value: 0, color: "#7C3AED" },
//       ];
//     }
//     const colors = ["#5B7CFA", "#7C3AED", "#10B981"];
//     return ageGenderData.gender.map((item, index) => ({
//       name: item.gender || "Unknown",
//       value: item.percentage || 0,
//       color: colors[index % colors.length],
//     }));
//   };

//   // Short gender label for the legend (F / M / O)
//   const getGenderLabel = (name: string): string => {
//     const lower = name.toLowerCase();
//     if (lower === "female") return "F";
//     if (lower === "male") return "M";
//     return "O";
//   };

//   const getAgeData = () => {
//     if (!ageGenderData || !ageGenderData.ageGroups || ageGenderData.ageGroups.length === 0) {
//       return [
//         { age: "0 - 18", value: 0 },
//         { age: "19 - 35", value: 0 },
//         { age: "36 - 50", value: 0 },
//         { age: "51 - 65", value: 0 },
//         { age: "65+", value: 0 },
//       ];
//     }
//     return ageGenderData.ageGroups.map((item) => ({
//       age: item.ageGroup || "Unknown",
//       value: item.percentage || 0,
//     }));
//   };

//   // Turns a DashboardKpi into a trend badge
//   const getTrend = (kpi: DashboardKpi | undefined) => {
//     if (!kpi) return undefined;
//     const pct = kpi.vsLastWeekPct;
//     return {
//       direction: kpi.direction,
//       label: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs last wk`,
//     };
//   };

//   const avgTatTrend = dashboardKpis
//     ? {
//         direction: dashboardKpis.avgTatHours.direction,
//         label: `${dashboardKpis.avgTatHours.vsLastWeekHours >= 0 ? "+" : ""}${dashboardKpis.avgTatHours.vsLastWeekHours.toFixed(1)}h vs last wk`,
//       }
//     : undefined;

//   // ========== KPI CARDS DATA ==========

//   // Top row KPIs (4 cards)
//   const topKpiCards = [
//     {
//       title: "Total Revenue",
//       value: loading ? "..." : formatCurrency(totalRevenue),
//       icon: Monitor,
//       iconBg: "bg-purple-100",
//       iconColor: "text-purple-600",
//       trend: getTrend(dashboardKpis?.totalRevenue),
//     },
//     {
//       title: "Total Tests",
//       value: loading ? "..." : String(totalTests),
//       icon: FlaskConical,
//       iconBg: "bg-violet-100",
//       iconColor: "text-violet-600",
//       trend: getTrend(dashboardKpis?.totalTests),
//     },
//     {
//       title: "Total Patients",
//       value: loading ? "..." : String(totalPatients),
//       icon: UserRound,
//       iconBg: "bg-green-100",
//       iconColor: "text-green-600",
//       trend: getTrend(dashboardKpis?.totalPatients),
//     },
//     {
//       title: "Pending Samples",
//       value: loading ? "..." : String(pendingSamples),
//       icon: Clock3,
//       iconBg: "bg-yellow-100",
//       iconColor: "text-yellow-600",
//       trend: getTrend(dashboardKpis?.pendingSamples),
//     },
//   ];

//   // Bottom row KPIs (2 large + 3 small)
//   const bottomKpiCards = [
//     {
//       title: "Reports Generated",
//       value: loading ? "..." : String(reportsGenerated),
//       icon: FileText,
//       iconBg: "bg-purple-100",
//       iconColor: "text-purple-600",
//       trend: getTrend(dashboardKpis?.reportsGenerated),
//     },
//     {
//       title: "Avg TAT",
//       value: loading ? "..." : `${avgTat.toFixed(1)} hrs`,
//       icon: Users,
//       iconBg: "bg-violet-100",
//       iconColor: "text-violet-600",
//       trend: avgTatTrend,
//     },
//   ];

//   const miniKpiCards = [
//     {
//       title: "Active admins",
//       value: loading ? "..." : String(totalAdmins),
//     },
//     {
//       title: "Technicians",
//       value: loading ? "..." : String(totalTechnicians),
//     },
//     {
//       title: "Desk Users",
//       value: loading ? "..." : String(totalDeskRoles),
//     },
//   ];

//   // ========== CHART DATA ==========
//   const revenueChartData = formatRevenueData();
//   const categoryChartData = getCategoryChartData();
//   const topOrderTests = getTopOrderTests();
//   const doctorsData = getFormattedDoctors();
//   const techniciansData = getFormattedTechnicians();
//   const collectionChartData = getCollectionChartData();
//   const genderData = getGenderData();
//   const ageData = getAgeData();

//   const revenueAxisConfig = getRevenueAxisConfig(
//     Math.max(0, ...revenueChartData.map((d) => d.revenue || 0))
//   );

//   const topOrderAxisConfig = getCountAxisConfig(
//     Math.max(0, ...topOrderTests.map((item) => item.value))
//   );

//   // Age data max value for bar chart
//   const ageMaxValue = Math.max(0, ...ageData.map((item) => item.value));

//   // ========== FILTER RENDER HELPER ==========
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

//   // ========== TOOLTIP COMPONENTS ==========
//   const CategoryTooltip = ({ active, payload }: any) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="rounded-lg border border-pneutral-100 bg-base-white p-4 shadow-lg min-w-[180px]">
//           <p className="text-p3 font-semibold text-pneutral-900 mb-2">
//             {data.name}
//           </p>
//           <div className="space-y-1 text-p3 text-pneutral-600">
//             <p>
//               Tests:{" "}
//               <span className="font-semibold text-pneutral-900">
//                 {data.testCount.toLocaleString()}
//               </span>
//             </p>
//             <p>
//               Percentage:{" "}
//               <span className="font-semibold text-pneutral-900">
//                 {data.percentage}%
//               </span>
//             </p>
//           </div>
//         </div>
//       );
//     }
//     return null;
//   };

//   const GenderTooltip = ({ active, payload }: any) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="rounded-lg border border-pneutral-100 bg-base-white p-4 shadow-lg">
//           <p className="text-p3 font-semibold text-pneutral-900">{data.name}</p>
//           <p className="text-p3 text-pneutral-600">
//             Percentage:{" "}
//             <span className="font-semibold text-pneutral-900">
//               {data.value}%
//             </span>
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const CollectionTooltip = ({ active, payload }: any) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="rounded-lg border border-pneutral-100 bg-base-white p-4 shadow-lg">
//           <p className="text-p3 font-semibold text-pneutral-900">{data.name}</p>
//           <p className="text-p3 text-pneutral-600">
//             Percentage:{" "}
//             <span className="font-semibold text-pneutral-900">
//               {data.value}%
//             </span>
//           </p>
//           <p className="text-p3 text-pneutral-600">
//             Amount:{" "}
//             <span className="font-semibold text-pneutral-900">
//               {data.amount}
//             </span>
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   // ========== RENDER ==========
//   return (
//     <div className="space-y-4 bg-secondary-50 px-2">
//       {/* ===== HEADER ===== */}
//       <div className="flex flex-wrap items-start justify-between gap-5">
//         <div>
//           <div className="flex items-center gap-3">
//             <h1 className="text-h3 font-heading font-bold text-pneutral-900">
//               Lab Analytics
//             </h1>
//             <span className="rounded-full bg-secondary-100 px-4 py-1 text-label-l3 font-semibold text-secondary-700">
//               {currentLab?.name || "This Lab"} Overview
//             </span>
//             {refreshing && (
//               <span className="text-xs text-pneutral-400 animate-pulse">
//                 Refreshing...
//               </span>
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

//       {/* ===== TOP ROW KPI CARDS (4) ===== */}
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         {topKpiCards.map((item) => {
//           const Icon = item.icon;
//           return (
//             <div
//               key={item.title}
//               className="rounded-xl border border-pneutral-100 bg-white px-5 py-3 shadow-xsm"
//             >
//               <div className="flex items-start gap-4">
//                 <div
//                   className={`flex h-11 w-11 items-center justify-center rounded-full ${item.iconBg}`}
//                 >
//                   <Icon className={`h-5 w-5 ${item.iconColor}`} />
//                 </div>
//                 <div>
//                   <h4 className="text-p2 font-medium text-pneutral-700">
//                     {item.title}
//                   </h4>
//                   <h2 className="mt-1 text-h4 font-semibold leading-none text-pneutral-900">
//                     {item.value}
//                   </h2>
//                   {item.trend && (
//                     <div
//                       className={`mt-2 flex items-center gap-1 text-[11px] ${
//                         item.trend.direction === "up"
//                           ? "text-success-600"
//                           : "text-danger-600"
//                       }`}
//                     >
//                       {item.trend.direction === "up" ? (
//                         <ArrowUp size={12} />
//                       ) : (
//                         <ArrowDown size={12} />
//                       )}
//                       <span>{item.trend.label}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* ===== BOTTOM ROW KPI CARDS ===== */}
//       <div className="flex flex-col gap-4 xl:flex-row">
//         {/* Large Cards (2) */}
//         <div className="grid flex-[2] grid-cols-1 gap-4 md:grid-cols-2 w-full max-w-[610px]">
//           {bottomKpiCards.map((item) => {
//             const Icon = item.icon;
//             return (
//               <div
//                 key={item.title}
//                 className="rounded-xl border border-[#E8E8E8] bg-white px-5 py-3 shadow-xsm"
//               >
//                 <div className="flex items-start gap-4">
//                   <div
//                     className={`flex h-11 w-11 items-center justify-center rounded-full ${item.iconBg}`}
//                   >
//                     <Icon className={`h-5 w-5 ${item.iconColor}`} />
//                   </div>
//                   <div>
//                     <h4 className="text-p2 font-medium text-pneutral-700">
//                       {item.title}
//                     </h4>
//                     <h2 className="mt-1 text-h4 font-semibold leading-none text-pneutral-900">
//                       {item.value}
//                     </h2>
//                     {item.trend && (
//                       <div
//                         className={`mt-2 flex items-center gap-1 text-[11px] ${
//                           item.trend.direction === "up"
//                             ? "text-success-600"
//                             : "text-danger-600"
//                         }`}
//                       >
//                         {item.trend.direction === "up" ? (
//                           <ArrowUp size={12} />
//                         ) : (
//                           <ArrowDown size={12} />
//                         )}
//                         <span>{item.trend.label}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Small Cards (3) */}
//         <div className="grid flex-1 grid-cols-3 gap-4">
//           {miniKpiCards.map((item) => (
//             <div
//               key={item.title}
//               className="flex flex-col items-center justify-center rounded-xl border border-[#E8E8E8] bg-white shadow-xsm"
//             >
//               <h4 className="text-p2 font-medium text-pneutral-700">
//                 {item.title}
//               </h4>
//               <h2 className="mt-1 text-h4 font-semibold text-pneutral-900">
//                 {item.value}
//               </h2>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ===== DAILY REVENUE TREND + SAMPLE WORKFLOW FUNNEL ===== */}
//       <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
//         {/* Daily Revenue Trend - Left */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="mb-6 flex items-center justify-between">
//             <div>
//               <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//                 Daily Revenue Trend
//               </h2>
//               <p className="mt-1 text-p3 font-semibold text-pneutral-900">
//                 Total Revenue
//                 <span className="ml-1 font-semibold text-pneutral-900">
//                   {formatCurrency(totalRevenue)}
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
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={revenueChartData}>
//                 <defs>
//                   <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#B550FA" stopOpacity={0.45} />
//                     <stop offset="95%" stopColor="#B550FA" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#EAEAE9" />
//                 <XAxis
//                   dataKey="label"
//                   tickLine={false}
//                   axisLine={false}
//                   tick={{ fontSize: 14, fill: "#969793" }}
//                 />
//                 <YAxis
//                   tickLine={false}
//                   axisLine={false}
//                   tick={{ fontSize: 14, fill: "#969793" }}
//                   domain={[0, revenueAxisConfig.domainMax]}
//                   ticks={revenueAxisConfig.ticks}
//                   tickFormatter={revenueAxisConfig.formatTick}
//                 />
//                 <Tooltip
//                   contentStyle={{
//                     borderRadius: 12,
//                     border: "none",
//                     boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
//                   }}
//                   formatter={(value: any) => [`₹${value.toLocaleString()}`, "Revenue"]}
//                   labelFormatter={(label) => `Date: ${label}`}
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="revenue"
//                   stroke="#B550FA"
//                   strokeWidth={3}
//                   fill="url(#purpleGradient)"
//                   dot={{ r: 4, fill: "#fff", stroke: "#B550FA", strokeWidth: 2 }}
//                   activeDot={{ r: 6 }}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Sample Workflow Funnel - Right */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//               Sample Workflow Funnel
//             </h2>
//             {renderFilterDropdown(
//               funnelFilter,
//               setFunnelFilter,
//               funnelCustomRange,
//               setFunnelCustomRange,
//               false
//             )}
//           </div>
//           <div className="flex flex-col lg:flex-row items-center justify-between">
//             {/* Funnel SVG - Dynamic heights based on percentages */}
//             <div className="flex justify-center w-full lg:w-[42%]">
//               <svg width="230" height="300" viewBox="0 0 230 300">
//                 {/* Calculate dynamic heights based on percentages */}
//                 {(() => {
//                   const percentages = funnelData.map(d => parseFloat(d.percent));
//                   const maxPercent = Math.max(...percentages, 1);
//                   const baseHeight = 300;
                  
//                   // Calculate heights proportional to percentages
//                   const heights = percentages.map(p => (p / maxPercent) * baseHeight * 0.9);
                  
//                   // Calculate Y positions
//                   const yPositions = [0];
//                   for (let i = 1; i < heights.length; i++) {
//                     yPositions.push(yPositions[i-1] + heights[i-1] + 8);
//                   }

//                   // Scale to fit in 300px
//                   const totalHeight = yPositions[yPositions.length - 1] + heights[heights.length - 1];
//                   const scale = 280 / totalHeight;

//                   const scaledHeights = heights.map(h => h * scale);
//                   const scaledYPositions = yPositions.map(y => y * scale);

//                   // Colors for each funnel section
//                   const colors = ["#4F11B8", "#FDBA12", "#5470F5", "#EF5A5A"];
//                   // One extra "tip" width so the last section tapers like the rest
//                   // instead of ending in a flat-bottomed rectangle.
//                   const widths = [170, 130, 90, 60, 30];

//                   return scaledHeights.map((height, index) => {
//                     const y = scaledYPositions[index];
//                     const width = widths[index] || 30;
//                     const x = (230 - width) / 2;
//                     const nextWidth = widths[index + 1] || 30;
//                     const nextX = (230 - nextWidth) / 2;

//                     // All sections taper into the next section's width,
//                     // including the last one, so the funnel narrows consistently.
//                     return (
//                       <polygon
//                         key={index}
//                         points={`${x},${y} ${x + width},${y} ${nextX + nextWidth},${y + height} ${nextX},${y + height}`}
//                         fill={colors[index]}
//                       />
//                     );
//                   });
//                 })()}
//               </svg>
//             </div>

//             {/* Right Side - Data Labels */}
//             <div className="w-full lg:w-[55%] space-y-11">
//               {funnelData.map((item) => (
//                 <div
//                   key={item.label}
//                   className="grid grid-cols-[1fr_70px_60px] items-center"
//                 >
//                   <div className="flex items-center gap-3">
//                     <span
//                       className="h-3.5 w-3.5 rounded-full shadow-md"
//                       style={{
//                         background: item.color,
//                         boxShadow: "0 2px 8px rgba(0,0,0,.25)",
//                       }}
//                     />
//                     <span className="text-[16px] text-[#555] font-medium">
//                       {item.label}
//                     </span>
//                   </div>
//                   <div className="text-right text-[16px] text-[#555]">
//                     {item.value}
//                   </div>
//                   <div className="text-right text-[16px] text-[#555]">
//                     {item.percent}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ===== TEST BY CATEGORY + TOP ORDER TEST ===== */}
//       <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
//         {/* Test By Category - Pie Chart */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="flex items-center justify-between mb-1">
//             <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//               Test by Category
//             </h2>
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
//                         startAngle={90}
//                         endAngle={-270}
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
//                         {categoryTotal.toLocaleString()}
//                       </text>
//                       <Tooltip content={<CategoryTooltip />} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//                 <div className="space-y-4">
//                   {categoryChartData.map((item) => (
//                     <div
//                       key={item.name}
//                       className="flex w-44 items-center justify-between"
//                     >
//                       <div className="flex items-center gap-2">
//                         <span
//                           className="h-3 w-3 rounded-full"
//                           style={{ background: item.color }}
//                         />
//                         <span className="text-p3 text-pneutral-700">
//                           {item.name}
//                         </span>
//                       </div>
//                       <span className="text-p3 font-medium text-pneutral-600">
//                         {item.testCount}
//                       </span>
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

//         {/* Top Order Test */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="mb-4 flex items-center justify-between">
//             <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//               Top Order Test
//             </h2>
//             {renderFilterDropdown(
//               categoryFilter,
//               setCategoryFilter,
//               categoryCustomRange,
//               setCategoryCustomRange,
//               false
//             )}
//           </div>
//           <div className="space-y-4">
//             {topOrderTests.length > 0 ? (
//               topOrderTests.map((item, index) => (
//                 <div
//                   key={index}
//                   className="grid grid-cols-[1.2fr_2.5fr_64px] items-center gap-5"
//                 >
//                   <p className="truncate text-p3 font-medium text-pneutral-900">
//                     {item.name}
//                   </p>
//                   <div className="relative h-4 overflow-hidden rounded-full bg-secondary-100">
//                     <div
//                       className="h-full rounded-full bg-secondary-700 transition-all duration-500"
//                       style={{
//                         width: `${Math.min(
//                           (item.value / topOrderAxisConfig.domainMax) * 100,
//                           100
//                         )}%`,
//                       }}
//                     />
//                   </div>
//                   <p className="w-16 text-right text-p3 font-semibold text-pneutral-900">
//                     {item.value}
//                   </p>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-8 text-pneutral-500">
//                 No data available
//               </div>
//             )}
//           </div>
//           <div className="grid grid-cols-[1.2fr_2.5fr_64px] gap-5 mt-5">
//             <div />
//             <div className="relative h-6">
//               {topOrderAxisConfig.ticks.map((tick, index) => (
//                 <span
//                   key={tick}
//                   className="absolute -translate-x-1/2 text-p3 text-pneutral-900"
//                   style={{
//                     left: `${
//                       (index / (topOrderAxisConfig.ticks.length - 1)) * 100
//                     }%`,
//                   }}
//                 >
//                   {topOrderAxisConfig.formatTick(tick)}
//                 </span>
//               ))}
//             </div>
//             <div />
//           </div>
//         </div>
//       </div>

//       {/* ===== REVENUE BY COLLECTION METHOD + AGE & GENDER DISTRIBUTION ===== */}
//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
//         {/* Revenue by Collection Method */}
//         <div className="rounded-lg border border-pneutral-100 bg-white px-4 py-2 shadow-sm">
//           <div className="flex items-center justify-between mb-2">
//             <h2 className="text-p4 font-semibold text-pneutral-900">
//               Revenue by Collection Method
//             </h2>
//             {renderFilterDropdown(
//               collectionFilter,
//               setCollectionFilter,
//               collectionCustomRange,
//               setCollectionCustomRange,
//               false
//             )}
//           </div>

//           {collectionChartData.length > 0 ? (
//             <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">
//               {/* Donut Chart */}
//               <div className="h-[280px] w-[280px] flex-shrink-0">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={collectionChartData}
//                       dataKey="value"
//                       innerRadius={70}
//                       outerRadius={120}
//                       paddingAngle={1}
//                       stroke="none"
//                       startAngle={90}
//                       endAngle={-270}
//                     >
//                       {collectionChartData.map((item, index) => (
//                         <Cell key={index} fill={item.color} />
//                       ))}
//                     </Pie>
//                     <text
//                       x="50%"
//                       y="50%"
//                       textAnchor="middle"
//                       dominantBaseline="middle"
//                       className="fill-pneutral-900 text-2xl font-bold"
//                     >
//                       {formatCurrencyFull(revenueByCollection?.total || 0)}
//                     </text>
//                     <Tooltip content={<CollectionTooltip />} />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>

//               {/* Legend */}
//               <div className="w-full max-w-sm space-y-6">
//                 {collectionChartData.map((item) => (
//                   <div key={item.name} className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <span
//                         className="h-4 w-4 rounded-full"
//                         style={{ backgroundColor: item.color }}
//                       />
//                       <span className="text-lg font-medium text-pneutral-700">
//                         {item.name}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-8">
//                       <span className="font-semibold text-pneutral-800">
//                         {item.value}%
//                       </span>
//                       <span className="font-semibold text-pneutral-700">
//                         ({item.amount})
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div className="py-8 text-center text-pneutral-500">
//               No collection data available
//             </div>
//           )}
//         </div>

//         {/* Age & Gender Distribution */}
//         <div className="rounded-lg border border-pneutral-100 bg-white px-4 py-2 shadow-sm">
//           <div className="flex items-center justify-between mb-8">
//             <h2 className="text-p4 font-semibold text-pneutral-900">
//               Age & Gender Distribution
//             </h2>
//             {renderFilterDropdown(
//               ageGenderFilter,
//               setAgeGenderFilter,
//               ageGenderCustomRange,
//               setAgeGenderCustomRange,
//               false
//             )}
//           </div>

//           <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
//             {/* Gender Section */}
//             <div>
//               <h3 className="mb-5 text-p3 font-semibold text-pneutral-900">
//                 Gender
//               </h3>

//               <div className="flex flex-col items-center gap-4">
//                 {/* Donut */}
//                 <div className="h-52 w-52 flex-shrink-0">
//                   <ResponsiveContainer>
//                     <PieChart>
//                       <Pie
//                         data={genderData}
//                         dataKey="value"
//                         innerRadius={45}
//                         outerRadius={75}
//                         stroke="none"
//                         startAngle={90}
//                         endAngle={-270}
//                       >
//                         {genderData.map((item, index) => (
//                           <Cell key={index} fill={item.color} />
//                         ))}
//                       </Pie>
//                       <text
//                         x="50%"
//                         y="47%"
//                         textAnchor="middle"
//                         className="fill-pneutral-500 text-label-l3 font-medium"
//                       >
//                         Total
//                       </text>
//                       <text
//                         x="50%"
//                         y="59%"
//                         textAnchor="middle"
//                         className="fill-pneutral-900 text-h4 font-semibold"
//                       >
//                         {(ageGenderData?.totalPatients ?? 0).toLocaleString()}
//                       </text>
//                       <Tooltip content={<GenderTooltip />} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>

//                 {/* Legend */}
//                 <div className="flex flex-wrap items-center justify-center gap-2">
//                   {genderData.map((item) => (
//                     <div key={item.name} className="flex items-center gap-2 mb-2">
//                       <span
//                         className="h-3 w-3 rounded-full"
//                         style={{ background: item.color }}
//                       />
//                       <span className="text-p3 font-medium text-pneutral-700">
//                         {getGenderLabel(item.name)}
//                       </span>
//                       <span className="text-p3 font-semibold text-pneutral-900">
//                         {item.value}%
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Age Group */}
//             <div>
//               <h3 className="mb-5 text-p3 font-semibold text-pneutral-900">
//                 Age Group
//               </h3>

//               <div className="space-y-5">
//                 {ageData.map((item) => (
//                   <div key={item.age} className="flex items-center gap-5">
//                     <span className="w-16 text-pneutral-700">
//                       {item.age}
//                     </span>

//                     <div className="h-5 flex-1 rounded-full bg-blue-100">
//                       <div
//                         className="h-5 rounded-full bg-[#5B7CFA] transition-all duration-500"
//                         style={{
//                           width: `${Math.min((item.value / ageMaxValue) * 100, 100)}%`,
//                         }}
//                       />
//                     </div>

//                     <span className="w-10 text-right font-semibold text-pneutral-700">
//                       {item.value}%
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ===== TECHNICIAN PERFORMANCE + TOP REFERRING DOCTORS ===== */}
//       <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
//         {/* Technician Performance */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="flex items-center justify-between mb-1">
//             <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//               Technician Performance
//             </h2>
//             {renderFilterDropdown(
//               technicianFilter,
//               setTechnicianFilter,
//               technicianCustomRange,
//               setTechnicianCustomRange,
//               false
//             )}
//           </div>
//           <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
//             <table className="min-w-full">
//               <thead className="sticky top-0 bg-white z-10">
//                 <tr className="border-y border-pneutral-100 bg-pneutral-50">
//                   <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">
//                     SI No.
//                   </th>
//                   <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">
//                     Technician
//                   </th>
//                   <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">
//                     Sample Processed
//                   </th>
//                   <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">
//                     Reports Entered
//                   </th>
//                   <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">
//                     Avg TAT
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {techniciansData.map((tech) => (
//                   <tr
//                     key={tech.id}
//                     className="border-b border-pneutral-100 transition hover:bg-pneutral-50"
//                   >
//                     <td className="px-4 py-2 text-p3 text-pneutral-900">
//                       {tech.srNo}
//                     </td>
//                     <td className="px-4 py-2 text-p3 font-medium text-pneutral-900">
//                       {tech.name}
//                     </td>
//                     <td className="px-4 py-2 text-p3 text-right text-pneutral-900">
//                       {tech.samplesProcessed.toLocaleString()}
//                     </td>
//                     <td className="px-4 py-2 text-p3 text-right text-pneutral-900">
//                       {tech.reportsEntered.toLocaleString()}
//                     </td>
//                     <td className="px-4 py-2 text-p3 text-right text-pneutral-900">
//                       {tech.avgTat}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Top Referring Doctors */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="flex items-center justify-between mb-1">
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
//           <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
//             <table className="min-w-full">
//               <thead className="sticky top-0 bg-white z-10">
//                 <tr className="border-y border-pneutral-100 bg-pneutral-50">
//                   <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">
//                     SI NO.
//                   </th>
//                   <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">
//                     Doctor Name
//                   </th>
//                   <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">
//                     Patient
//                   </th>
//                   <th className="px-4 py-2 text-right text-label-l3 font-semibold text-pneutral-900">
//                     Revenue(₹)
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {doctorsData.map((doctor) => (
//                   <tr
//                     key={doctor.id}
//                     className="border-b border-pneutral-100 transition hover:bg-pneutral-50"
//                   >
//                     <td className="px-4 py-2 text-p3 text-pneutral-900">
//                       {doctor.srNo}
//                     </td>
//                     <td className="px-4 py-2 text-p3 font-medium text-pneutral-900">
//                       {doctor.doctorName}
//                     </td>
//                     <td className="px-4 py-2 text-p3 text-right text-pneutral-900">
//                       {doctor.patients.toLocaleString()}
//                     </td>
//                     <td className="px-4 py-2 text-p3 text-right font-medium text-pneutral-900">
//                       {doctor.revenue}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminStats;