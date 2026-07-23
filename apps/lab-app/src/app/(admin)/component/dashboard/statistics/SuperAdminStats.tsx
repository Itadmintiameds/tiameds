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
  getTotalAdmins,
  getTotalDeskRoles,
  getTotalLabsCount,
  getTotalTechnicians,
} from "../../../../../../services/statisticsService";
import {
  DetailedBilling,
  EarningsByCategoryData,
  LabPerformanceRow,
  RevenueByLabRow,
  TestCategoryRow,
  TopReferringDoctor,
} from "@/types/statisticsData";

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

  // State for all metrics
  // First 4 KPIs: org-wide counts owned by the current super admin, unaffected
  // by the date or lab filters (the backend endpoints backing them take no such params).
  const [totalLabs, setTotalLabs] = useState<number>(0);
  const [totalAdmins, setTotalAdmins] = useState<number>(0);
  const [totalTechnicians, setTotalTechnicians] = useState<number>(0);
  const [totalDeskRoles, setTotalDeskRoles] = useState<number>(0);

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

  const [labPerformance, setLabPerformance] = useState<LabPerformanceRow[]>([]);
  const [topDoctors, setTopDoctors] = useState<TopReferringDoctor[]>([]);

  // Packages Summary card
  const [packageSummary, setPackageSummary] = useState<DetailedBilling["packageSummary"]>(emptyPackageSummary);
  const [packages, setPackages] = useState<DetailedBilling["packages"]>([]);

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
    }
  }, [globalCustomRange, globalFilter]);

  // Every section below hits the same consolidated endpoint, scoped to whichever
  // lab is currently selected ("all" omits labId so the backend aggregates every lab).
  const fetchStats = useCallback(
    (startDate?: string, endDate?: string) =>
      getAllStats(selectedLabId === "all" ? undefined : selectedLabId, startDate, endDate),
    [selectedLabId]
  );

  // Fetch function
  const fetchAllData = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      // 1. Org-wide KPIs, unaffected by date or lab filters
      const [labsResult, adminsResult, techniciansResult, deskRolesResult] = await Promise.allSettled([
        getTotalLabsCount(),
        getTotalAdmins(),
        getTotalTechnicians(),
        getTotalDeskRoles(),
      ]);

      if (labsResult.status === "fulfilled") setTotalLabs(labsResult.value.totalLabs);
      if (adminsResult.status === "fulfilled") setTotalAdmins(adminsResult.value.totalAdmins);
      if (techniciansResult.status === "fulfilled") setTotalTechnicians(techniciansResult.value.totalTechnicians);
      if (deskRolesResult.status === "fulfilled") setTotalDeskRoles(deskRolesResult.value.totalDeskRoles);

      // 2. Remaining KPIs + Billing Summary card, scoped by the GLOBAL filter + selected lab
      const globalRange = getDateRange(globalFilter, globalCustomRange);
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

      // 3. Revenue trend with its OWN filter. The header total comes from the full-range
      // call; each chart bar comes from re-querying getAllStats for just that bucket's
      // range, same bucketing scheme (day/week/month, by filter type) as before.
      const revenueRange = getDateRange(revenueFilter, revenueCustomRange);
      if (revenueRange.startDate && revenueRange.endDate) {
        try {
          const revenueTotalStats = await fetchStats(revenueRange.startDate, revenueRange.endDate);
          setRevenueTrendTotal(revenueTotalStats.revenueTrend?.totalRevenue || 0);
        } catch (error) {
          console.error("Error fetching revenue section total:", error);
          setRevenueTrendTotal(0);
        }

        const buckets = getRevenueBuckets(revenueFilter, revenueCustomRange);
        try {
          const bucketResults = await Promise.all(
            buckets.map(async (bucket) => {
              try {
                const bucketStats = await fetchStats(bucket.start, bucket.end);
                return { label: bucket.label, revenue: bucketStats.revenueTrend?.totalRevenue || 0 };
              } catch (error) {
                console.error(`Error fetching revenue bucket ${bucket.label}:`, error);
                return { label: bucket.label, revenue: 0 };
              }
            })
          );
          setRevenueChartData(bucketResults);
        } catch (error) {
          console.error("Error fetching revenue chart data:", error);
          setRevenueChartData([]);
        }
      } else {
        setRevenueTrendTotal(0);
        setRevenueChartData([]);
      }

      // 4. Revenue by lab (top 5) with its OWN filter
      const topLabsRange = getDateRange(topLabsFilter, topLabsCustomRange);
      try {
        const topLabsStats = await fetchStats(topLabsRange.startDate, topLabsRange.endDate);
        setRevenueByLab((topLabsStats.revenueByLab || []).slice(0, 5));
      } catch (error) {
        console.error("Error fetching revenue by lab:", error);
        setRevenueByLab([]);
      }

      // 5. Packages summary with its OWN filter
      const packagesRange = getDateRange(packagesFilter, packagesCustomRange);
      try {
        const packagesStats = await fetchStats(packagesRange.startDate, packagesRange.endDate);
        setPackageSummary(packagesStats.detailedBilling?.packageSummary || emptyPackageSummary);
        setPackages(packagesStats.detailedBilling?.packages || []);
      } catch (error) {
        console.error("Error fetching packages:", error);
        setPackageSummary(emptyPackageSummary);
        setPackages([]);
      }

      // 6. Tests by category with the section's OWN filter
      const categoryRange = getDateRange(categoryFilter, categoryCustomRange);
      try {
        const categoryStats = await fetchStats(categoryRange.startDate, categoryRange.endDate);
        setTestCategories(categoryStats.detailedBilling?.testCategories || []);
        setTestCategoriesSummary(categoryStats.detailedBilling?.testsSummary || emptyTestsSummary);
      } catch (error) {
        console.error("Error fetching tests by category:", error);
        setTestCategories([]);
        setTestCategoriesSummary(emptyTestsSummary);
      }

      // Earnings by category (same filter) - backs the "Revenue by Test" drilldown table
      try {
        const earningsResult = await fetchStats(categoryRange.startDate, categoryRange.endDate);
        const earnings = earningsResult.earningsByCategory || { summary: { totalCategories: 0, totalTests: 0, totalRevenue: 0, totalDue: 0 }, categories: [] };
        setEarningsData(earnings);

        // Default selected category to the one with the highest test count
        if (earnings.categories && earnings.categories.length > 0) {
          const sorted = [...earnings.categories].sort((a, b) => (b.totalTests || 0) - (a.totalTests || 0));
          setSelectedCategory(sorted[0].category);
        }
      } catch (error) {
        console.error("Error fetching earnings by category:", error);
        setEarningsData({ summary: { totalCategories: 0, totalTests: 0, totalRevenue: 0, totalDue: 0 }, categories: [] });
      }

      // 7. Lab performance with its OWN filter
      const performanceRange = getDateRange(performanceFilter, performanceCustomRange);
      try {
        const performanceStats = await fetchStats(performanceRange.startDate, performanceRange.endDate);
        setLabPerformance((performanceStats.labPerformance || []).slice(0, 6));
      } catch (error) {
        console.error("Error fetching lab performance:", error);
        setLabPerformance([]);
      }

      // 8. Top doctors with its OWN filter
      const doctorsRange = getDateRange(doctorsFilter, doctorsCustomRange);
      try {
        const doctorsStats = await fetchStats(doctorsRange.startDate, doctorsRange.endDate);
        setTopDoctors((doctorsStats.topReferringDoctors || []).slice(0, 5));
      } catch (error) {
        console.error("Error fetching top doctors:", error);
        setTopDoctors([]);
      }

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

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

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
      positive: item.growthPct !== null && item.growthPct !== undefined ? item.growthPct >= 0 : true,
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
      value: loading ? "..." : String(totalAdmins),
      color: "text-secondary-700",
      icon: HiOutlineUserGroup,
    },
    {
      id: 3,
      title: "Total Desk Users",
      value: loading ? "..." : String(totalDeskRoles),
      color: "text-secondary-700",
      icon: HiOutlineUsers,
    },
    {
      id: 4,
      title: "Total Technicians",
      value: loading ? "..." : String(totalTechnicians),
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
              {selectedLabName ? `Revenue Trend "${selectedLabName}"` : "Revenue Trend (Top 5 Labs)"}
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
              false
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
              false
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
    </div>
  );
};

export default SuperAdminStats;





























// code dated 23.07.2026........................



/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import dayjs from "dayjs";

// import {
//   Building2,
//   ClipboardCheck,
//   ArrowUp,
//   ArrowDown,
//   Eye,
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
//   getLabPerformance,
//   getPendingSamples,
//   getReportsGenerated,
//   getRevenueByLab,
//   getTestsByCategory,
//   getTopReferringDoctors,
//   getTotalAdmins,
//   getTotalDeskRoles,
//   getTotalLabsCount,
//   getTotalTechnicians,
//   getTotalTests,
//   getPackagesSummary,
//   getEarningsByCategory,
// } from "../../../../../../services/statisticsService";

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
// // x-axis, one per filter type. Each bucket's start/end is fed straight into
// // getEarningsByCategory (the same API backing the "Total Revenue" KPI/header) so the
// // chart bars and the header total are always computed the same way.
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

// // Shapes mirror getEarningsByCategory's return type in statisticsService.ts;
// // fields are optional since state starts out as an empty/partial object before the fetch resolves.
// interface EarningsTestRow {
//   testId?: number;
//   testName?: string;
//   testCode?: string;
//   price?: number;
//   orderedCount?: number;
//   totalEarnings?: number;
//   paidAmount?: number;
//   dueAmount?: number;
// }

// interface EarningsCategoryRow {
//   category: string;
//   totalTests?: number;
//   totalEarnings?: number;
//   paidAmount?: number;
//   dueAmount?: number;
//   tests?: EarningsTestRow[];
// }

// interface EarningsData {
//   summary: {
//     totalCategories?: number;
//     totalTests?: number;
//     totalEarnings?: number;
//     totalPaid?: number;
//     totalDue?: number;
//   };
//   categories: EarningsCategoryRow[];
// }

// // Shape mirrors getPackagesSummary's return type in statisticsService.ts.
// interface PackagesData {
//   summary: {
//     totalPackages?: number;
//     totalVisits?: number;
//     totalRevenue?: number;
//     totalDiscount?: number;
//     totalPaid?: number;
//     totalDue?: number;
//     totalCash?: number;
//     totalUpi?: number;
//     totalCard?: number;
//   };
//   packages: Array<{
//     packageId?: number;
//     packageName?: string;
//     packageCode?: string;
//     revenue?: number;
//     discount?: number;
//     visitCount?: number;
//     paidRevenue?: number;
//     dueRevenue?: number;
//     cashRevenue?: number;
//     upiRevenue?: number;
//     cardRevenue?: number;
//   }>;
// }

// const SuperAdminStats = () => {
//   useLabs();

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

//   // State for all metrics
//   const [totalLabs, setTotalLabs] = useState<number>(0);
//   const [totalAdmins, setTotalAdmins] = useState<number>(0);
//   const [totalTechnicians, setTotalTechnicians] = useState<number>(0);
//   const [totalDeskRoles, setTotalDeskRoles] = useState<number>(0);
//   const [totalTests, setTotalTests] = useState<number>(0);
//   const [totalRevenue, setTotalRevenue] = useState<number>(0);
//   const [reportsGenerated, setReportsGenerated] = useState<number>(0);
//   const [pendingSamples, setPendingSamples] = useState<number>(0);
//   const [testsByCategory, setTestsByCategory] = useState<Array<any>>([]);
//   const [categorySummary, setCategorySummary] = useState<any>({});
//   // Total shown in the "Revenue Trend (All Labs)" card header — same paid-revenue
//   // calculation as the "Total Revenue" KPI tile (getEarningsByCategory summary.totalPaid),
//   // but scoped to this card's own filter instead of the global/category filter.
//   const [revenueSectionTotalPaid, setRevenueSectionTotalPaid] = useState<number>(0);
//   // Chart bars — each bucket's revenue comes from the same getEarningsByCategory API as
//   // revenueSectionTotalPaid above, so the bars always sum to match the header total.
//   const [revenueChartData, setRevenueChartData] = useState<Array<{ label: string; revenue: number }>>([]);
//   const [revenueByLab, setRevenueByLab] = useState<Array<{ labId: number; labName: string; revenue: number }>>([]);
//   const [labPerformance, setLabPerformance] = useState<any[]>([]);
//   const [topDoctors, setTopDoctors] = useState<any[]>([]);
//   const [packagesData, setPackagesData] = useState<PackagesData>({ summary: {}, packages: [] });
//   const [earningsData, setEarningsData] = useState<EarningsData>({ summary: {}, categories: [] });
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
//     }
//   }, [globalCustomRange, globalFilter]);

//   // Fetch function
// // Fetch function
// const fetchAllData = useCallback(async (silent = false) => {
//   if (!silent) {
//     setLoading(true);
//   } else {
//     setRefreshing(true);
//   }

//   try {
//     // 1. Fetch KPIs WITHOUT date filters (all-time)
//     const [labsResult, adminsResult, techniciansResult, deskRolesResult] = await Promise.allSettled([
//       getTotalLabsCount(),
//       getTotalAdmins(),
//       getTotalTechnicians(),
//       getTotalDeskRoles(),
//     ]);

//     if (labsResult.status === "fulfilled") setTotalLabs(labsResult.value.totalLabs);
//     if (adminsResult.status === "fulfilled") setTotalAdmins(adminsResult.value.totalAdmins);
//     if (techniciansResult.status === "fulfilled") setTotalTechnicians(techniciansResult.value.totalTechnicians);
//     if (deskRolesResult.status === "fulfilled") setTotalDeskRoles(deskRolesResult.value.totalDeskRoles);

//     // 2. Fetch data with GLOBAL date filter for main KPIs (excluding totalRevenue)
//     const globalRange = getDateRange(globalFilter, globalCustomRange);
//     const [testsResult, reportsResult, pendingResult] = await Promise.allSettled([
//       getTotalTests(globalRange.startDate, globalRange.endDate),
//       getReportsGenerated(globalRange.startDate, globalRange.endDate),
//       getPendingSamples(globalRange.startDate, globalRange.endDate),
//     ]);

//     if (testsResult.status === "fulfilled") setTotalTests(testsResult.value.totalTests);
//     if (reportsResult.status === "fulfilled") setReportsGenerated(reportsResult.value.reportsGenerated);
//     if (pendingResult.status === "fulfilled") setPendingSamples(pendingResult.value.pendingSamples);

//     // 3. Fetch revenue trend with its OWN filter — both the header total and each
//     // chart bucket come from getEarningsByCategory (same API as the "Total Revenue"
//     // KPI tile) so the bars always sum to match the header total.
//     const revenueRange = getDateRange(revenueFilter, revenueCustomRange);
//     if (revenueRange.startDate && revenueRange.endDate) {
//       try {
//         const revenueEarningsResult = await getEarningsByCategory(revenueRange.startDate, revenueRange.endDate);
//         setRevenueSectionTotalPaid(revenueEarningsResult?.summary?.totalPaid || 0);
//       } catch (error) {
//         console.error("Error fetching revenue section total:", error);
//         setRevenueSectionTotalPaid(0);
//       }

//       const buckets = getRevenueBuckets(revenueFilter, revenueCustomRange);
//       try {
//         const bucketResults = await Promise.all(
//           buckets.map(async (bucket) => {
//             try {
//               const bucketResult = await getEarningsByCategory(bucket.start, bucket.end);
//               return { label: bucket.label, revenue: bucketResult?.summary?.totalPaid || 0 };
//             } catch (error) {
//               console.error(`Error fetching revenue bucket ${bucket.label}:`, error);
//               return { label: bucket.label, revenue: 0 };
//             }
//           })
//         );
//         setRevenueChartData(bucketResults);
//       } catch (error) {
//         console.error("Error fetching revenue chart data:", error);
//         setRevenueChartData([]);
//       }
//     } else {
//       setRevenueSectionTotalPaid(0);
//       setRevenueChartData([]);
//     }

//     // 4. Fetch revenue by lab (top 5) with its OWN filter
//     const topLabsRange = getDateRange(topLabsFilter, topLabsCustomRange);
//     try {
//       const revenueByLabResult = await getRevenueByLab(topLabsRange.startDate, topLabsRange.endDate);
//       setRevenueByLab((revenueByLabResult || []).slice(0, 5));
//     } catch (error) {
//       console.error("Error fetching revenue by lab:", error);
//       setRevenueByLab([]);
//     }

//     // 5. Fetch packages with its OWN filter
//     // In the fetchAllData function, update the packages section:

// // 5. Fetch packages with its OWN filter
// const packagesRange = getDateRange(packagesFilter, packagesCustomRange);
// try {
//   // Only call API if we have valid dates
//   if (packagesRange.startDate && packagesRange.endDate) {
//     const packagesResult = await getPackagesSummary(
//       packagesRange.startDate,
//       packagesRange.endDate
//     );
//     setPackagesData(packagesResult || { summary: {}, packages: [] });
//   } else {
//     // If no dates, fetch all-time data
//     const packagesResult = await getPackagesSummary();
//     setPackagesData(packagesResult || { summary: {}, packages: [] });
//   }
// } catch (error) {
//   console.error("Error fetching packages:", error);
//   setPackagesData({ summary: {}, packages: [] });
// }

//     // 6. Fetch tests-by-category and earnings-by-category with the section's OWN filter
//     const earningsRange = getDateRange(categoryFilter, categoryCustomRange);
    
//     // Fetch tests by category
//     try {
//       const categoryResult = await getTestsByCategory(earningsRange.startDate, earningsRange.endDate);
//       setTestsByCategory(categoryResult.categories || []);
//       setCategorySummary(categoryResult.summary || {});
//     } catch (error) {
//       console.error("Error fetching tests by category:", error);
//       setTestsByCategory([]);
//       setCategorySummary({});
//     }

//     // Fetch earnings by category - THIS WILL ALSO PROVIDE totalRevenue
//     try {
//       const earningsResult = await getEarningsByCategory(earningsRange.startDate, earningsRange.endDate);
//       setEarningsData(earningsResult || { summary: {}, categories: [] });
      
//       // Set totalRevenue from earnings summary totalPaid
//       if (earningsResult.summary) {
//         setTotalRevenue(earningsResult.summary.totalPaid || 0);
//       }
      
//       // Set default selected category to the one with highest test count
//       if (earningsResult.categories && earningsResult.categories.length > 0) {
//         const sorted = [...earningsResult.categories].sort((a, b) => b.totalTests - a.totalTests);
//         setSelectedCategory(sorted[0].category);
//       }
//     } catch (error) {
//       console.error("Error fetching earnings by category:", error);
//       setEarningsData({ summary: {}, categories: [] });
//     }

//     // 7. Fetch lab performance with its OWN filter
//     const performanceRange = getDateRange(performanceFilter, performanceCustomRange);
//     try {
//       const performanceResult = await getLabPerformance(
//         performanceRange.startDate,
//         performanceRange.endDate,
//         6
//       );
//       setLabPerformance(performanceResult || []);
//     } catch (error) {
//       console.error("Error fetching lab performance:", error);
//       setLabPerformance([]);
//     }

//     // 8. Fetch top doctors with its OWN filter
//     const doctorsRange = getDateRange(doctorsFilter, doctorsCustomRange);
//     try {
//       const doctorsResult = await getTopReferringDoctors(
//         doctorsRange.startDate,
//         doctorsRange.endDate,
//         5
//       );
//       setTopDoctors(doctorsResult || []);
//     } catch (error) {
//       console.error("Error fetching top doctors:", error);
//       setTopDoctors([]);
//     }

//     setLastUpdated(new Date());
//   } catch (error) {
//     console.error("Error fetching dashboard data:", error);
//     if (!silent) {
//       // toast.error("Failed to fetch dashboard data");
//     }
//   } finally {
//     if (!silent) {
//       setLoading(false);
//     } else {
//       setRefreshing(false);
//     }
//   }
// }, [globalFilter, globalCustomRange, revenueFilter, revenueCustomRange, topLabsFilter, topLabsCustomRange, categoryFilter, categoryCustomRange, packagesFilter, packagesCustomRange, performanceFilter, performanceCustomRange, doctorsFilter, doctorsCustomRange]);
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

//   // Format data for category pie chart
//   const getCategoryChartData = () => {
//     if (!testsByCategory || testsByCategory.length === 0) {
//       return [];
//     }
//     return testsByCategory
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
//     if (!packagesData.packages || packagesData.packages.length === 0) {
//       return [];
//     }
//     return packagesData.packages
//       .filter((item: any) => (item.visitCount || 0) > 0)
//       .map((item: any, index: number) => ({
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

//   // Format alerts data from the earnings-by-category summary (total bill/paid/due)
//   const getAlertsData = () => {
//     const summary = earningsData.summary || {};
//     return [
//       {
//         name: "Total Billed Amount",
//         value: summary.totalEarnings || 0,
//         color: "#FDBA12",
//         amount: summary.totalEarnings || 0,
//       },
//       {
//         name: "Paid Amount",
//         value: summary.totalPaid || 0,
//         color: "#38B000",
//         amount: summary.totalPaid || 0,
//       },
//       {
//         name: "Due Amount",
//         value: summary.totalDue || 0,
//         color: "#F75A5A",
//         amount: summary.totalDue || 0,
//       },
//     ];
//   };

//   // Format lab performance data
//   const getFormattedLabPerformance = () => {
//     if (labPerformance.length === 0) {
//       return [
//         {
//           id: "01",
//           lab: "Bangalore Central Lab",
//           revenue: "₹42,30,000",
//           tests: "18,360",
//           patients: "6,246",
//           pending: "621",
//           tat: "4.5 hrs",
//           reports: "15,111",
//           growth: "12.6%",
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

//   // Format doctors data - removed Labs and Patients columns
//   const getFormattedDoctors = () => {
//     if (topDoctors.length === 0) {
//       return [
//         {
//           id: 1,
//           srNo: "01",
//           doctorName: "Dr. Smith",
//           revenue: "₹42,30,000",
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

//   // Get earnings data for selected category
//   const getEarningsForCategory = () => {
//     if (!earningsData.categories || earningsData.categories.length === 0) {
//       return { tests: [], categoryName: "" };
//     }
    
//     let categoryData;
//     if (selectedCategory === "all") {
//       // Show all tests across all categories, sorted by totalEarnings
//       const allTests: any[] = [];
//       earningsData.categories.forEach((cat: any) => {
//         if (cat.tests && cat.tests.length > 0) {
//           cat.tests.forEach((test: any) => {
//             allTests.push({
//               ...test,
//               category: cat.category,
//             });
//           });
//         }
//       });
//       // Sort by totalEarnings (descending)
//       allTests.sort((a, b) => b.totalEarnings - a.totalEarnings);
//       return { tests: allTests, categoryName: "All Categories" };
//     } else {
//       categoryData = earningsData.categories.find(
//         (cat: any) => cat.category === selectedCategory
//       );
//       if (!categoryData) {
//         return { tests: [], categoryName: "" };
//       }
//       // Sort tests by totalEarnings (descending)
//       const sortedTests = [...(categoryData.tests || [])].sort(
//         (a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0)
//       );
//       return { tests: sortedTests, categoryName: categoryData.category };
//     }
//   };

//   // Get all unique categories for dropdown
//   const getCategoriesForDropdown = () => {
//     if (!earningsData.categories || earningsData.categories.length === 0) {
//       return [];
//     }
//     return earningsData.categories.map((cat: any) => cat.category);
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
//       value: loading ? "..." : String(totalAdmins),
//       color: "text-secondary-700",
//       icon: HiOutlineUserGroup,
//     },
//     {
//       id: 3,
//       title: "Total Desk Users",
//       value: loading ? "..." : String(totalDeskRoles),
//       color: "text-secondary-700",
//       icon: HiOutlineUsers,
//     },
//     {
//       id: 4,
//       title: "Total Technicians",
//       value: loading ? "..." : String(totalTechnicians),
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

//   // Get sorted tests based on sort order
//   const getSortedTests = () => {
//     const tests = [...earnings.tests];
//     if (sortOrder === "desc") {
//       tests.sort((a, b) => b.totalEarnings - a.totalEarnings);
//     } else {
//       tests.sort((a, b) => a.totalEarnings - b.totalEarnings);
//     }
//     return tests;
//   };

//   const sortedTests = getSortedTests();

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
//             {renderFilterDropdown(
//               globalFilter,
//               setGlobalFilter,
//               globalCustomRange,
//               setGlobalCustomRange,
//               true
//             )}
//           </div>
//           {/* <button className="flex items-center gap-2 rounded-lg border border-pneutral-100 bg-base-white px-6 py-3 shadow-xsm">
//             <Filter size={18} className="text-pneutral-900" />
//             <span className="text-p3 text-pneutral-900">Filters</span>
//           </button> */}
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
//                 Revenue Trend (All Labs)
//               </h2>
//               <p className="mt-1 text-p3 font-semibold text-pneutral-900">
//                 Total Revenue
//                 <span className="ml-1 font-semibold text-pneutral-900">
//                   {formatCurrency(revenueSectionTotalPaid)}
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
//               Revenue Trend (Top 5 Labs) 
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
//                         {(categorySummary.totalTests || 0).toLocaleString()}
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
//                     <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">#</th>
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
//                         ₹{test.paidAmount?.toLocaleString() || "0"}
//                       </td>
//                       <td className="px-4 py-2 text-p3 text-right text-pneutral-900">
//                         ₹{test.dueAmount?.toLocaleString() || "0"}
//                       </td>
//                       <td className="px-4 py-2 text-p3 text-right font-semibold text-pneutral-900">
//                         ₹{test.totalEarnings?.toLocaleString() || "0"}
//                       </td>
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
//                         ₹{(packagesData.summary?.totalRevenue || 0).toLocaleString()}
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

//         {/* Alerts & Insights - 33% */}
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
//                         ₹{(earningsData.summary?.totalEarnings || 0).toLocaleString()}
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
//                   <th className="px-4 py-2 text-left text-label-l3 font-semibold text-pneutral-900">#</th>
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
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">#</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Lab Name</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Revenue</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Tests</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Patients</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Pending Samples</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Avg TAT</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Reports Generated</th>
//                 <th className="px-4 py-4 text-left text-label-l3 font-semibold text-pneutral-900">Growth (Revenue)</th>
//                 <th className="px-4 py-4 text-center text-label-l3 font-semibold text-pneutral-900">Actions</th>
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
//                   <td className="border-b border-pneutral-100 px-4 py-2 text-center">
//                     <button className="rounded-full p-2 transition hover:bg-primary-50">
//                       <Eye size={20} className="text-pneutral-500 hover:text-primary-600" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SuperAdminStats;