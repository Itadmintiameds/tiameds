import { FaTools } from 'react-icons/fa';
import StatisticsMain from './StatisticsMain';

const AdminStats = () => {
    return (
        <div>
            <div className="mx-4 md:mx-6 mt-4 flex items-start gap-3 rounded-xl border border-warning-500 bg-warning-50 px-4 py-3">
                <FaTools className="mt-0.5 shrink-0 text-[#2a78d6] w-4 h-4" />
                <p className="text-sm text-warning-600">
                    <span className="font-semibold ">A redesigned analytics experience for admins is in progress.</span>{' '}
                    You&apos;re viewing the current dashboard in the meantime.
                </p>
            </div>
            <StatisticsMain />
        </div>
    );
};

export default AdminStats;
















// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import dayjs from "dayjs";

// import {
//   ClipboardCheck,
//   ArrowUp,
//   ArrowDown,
//   ChevronUp,
//   ChevronDown,
//   Users,
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

// // Import context + services
// import { useLabs } from "@/context/LabContext";
// import {
//   getLabPerformance,
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
// } from "../../../../../../services/adminStatService";
// import { LabPerformance, TopReferringDoctor } from "@/types/adminStatsData";

// type DateFilterType = "currentFY" | "week" | "month" | "year" | "custom";

// interface DateRange {
//   startDate: string;
//   endDate: string;
// }

// // ─────────────────────────────────────────────────────────────────────────
// // This screen mirrors SuperAdminStats.tsx (see that file for the "all labs"
// // version) but every metric is scoped to the admin's currentLab via
// // adminStatService.ts / AdminStatsController (backend: /lab-admin/stats/**).
// //
// // AdminStatsController does not (yet) expose lab-scoped equivalents of:
// //   - packages-summary
// //   - earnings-by-category (per-test revenue/paid/due breakdown)
// // and its tests-by-category only returns { category, testCount } - no
// // revenue/discount/paid/due/cash/upi/card split like the superadmin one.
// // Sections backed by those gaps use static placeholder data below and are
// // marked "STATIC PLACEHOLDER" - swap them for real service calls once the
// // corresponding backend endpoints exist.
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

// // ── STATIC PLACEHOLDER DATA ────────────────────────────────────────────────
// // No backend endpoint yet for these at admin/lab scope. Replace with real
// // adminStatService calls once AdminStatsController grows the matching routes.

// const STATIC_TOP_CATEGORIES: Array<{ name: string; revenue: number }> = [
//   { name: "Biochemistry", revenue: 185000 },
//   { name: "Hematology", revenue: 142000 },
//   { name: "Microbiology", revenue: 98000 },
//   { name: "Radiology", revenue: 76000 },
//   { name: "Pathology", revenue: 54000 },
// ];

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

// const STATIC_PACKAGES_DATA: PackagesData = {
//   summary: {
//     totalPackages: 4,
//     totalVisits: 210,
//     totalRevenue: 315000,
//     totalDiscount: 18500,
//     totalPaid: 268000,
//     totalDue: 47000,
//     totalCash: 120000,
//     totalUpi: 98000,
//     totalCard: 50000,
//   },
//   packages: [
//     { packageId: 1, packageName: "Full Body Checkup", packageCode: "FBC01", revenue: 140000, discount: 8000, visitCount: 82, paidRevenue: 118000, dueRevenue: 22000, cashRevenue: 55000, upiRevenue: 42000, cardRevenue: 21000 },
//     { packageId: 2, packageName: "Diabetes Panel", packageCode: "DIA02", revenue: 78000, discount: 4000, visitCount: 54, paidRevenue: 70000, dueRevenue: 8000, cashRevenue: 30000, upiRevenue: 28000, cardRevenue: 12000 },
//     { packageId: 3, packageName: "Cardiac Screening", packageCode: "CAR03", revenue: 62000, discount: 3500, visitCount: 41, paidRevenue: 52000, dueRevenue: 10000, cashRevenue: 20000, upiRevenue: 18000, cardRevenue: 14000 },
//     { packageId: 4, packageName: "Women's Wellness", packageCode: "WOM04", revenue: 35000, discount: 3000, visitCount: 33, paidRevenue: 28000, dueRevenue: 7000, cashRevenue: 15000, upiRevenue: 10000, cardRevenue: 3000 },
//   ],
// };

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

// const STATIC_EARNINGS_DATA: EarningsData = {
//   summary: {
//     totalCategories: 3,
//     totalTests: 6,
//     totalEarnings: 245000,
//     totalPaid: 198000,
//     totalDue: 47000,
//   },
//   categories: [
//     {
//       category: "Biochemistry",
//       totalTests: 3,
//       totalEarnings: 120000,
//       paidAmount: 98000,
//       dueAmount: 22000,
//       tests: [
//         { testId: 1, testName: "Lipid Profile", testCode: "LIP01", price: 800, orderedCount: 60, totalEarnings: 48000, paidAmount: 40000, dueAmount: 8000 },
//         { testId: 2, testName: "Liver Function Test", testCode: "LFT02", price: 700, orderedCount: 55, totalEarnings: 38500, paidAmount: 31000, dueAmount: 7500 },
//         { testId: 3, testName: "Kidney Function Test", testCode: "KFT03", price: 650, orderedCount: 52, totalEarnings: 33500, paidAmount: 27000, dueAmount: 6500 },
//       ],
//     },
//     {
//       category: "Hematology",
//       totalTests: 2,
//       totalEarnings: 85000,
//       paidAmount: 70000,
//       dueAmount: 15000,
//       tests: [
//         { testId: 4, testName: "Complete Blood Count", testCode: "CBC04", price: 350, orderedCount: 140, totalEarnings: 49000, paidAmount: 40000, dueAmount: 9000 },
//         { testId: 5, testName: "ESR", testCode: "ESR05", price: 200, orderedCount: 180, totalEarnings: 36000, paidAmount: 30000, dueAmount: 6000 },
//       ],
//     },
//     {
//       category: "Microbiology",
//       totalTests: 1,
//       totalEarnings: 40000,
//       paidAmount: 30000,
//       dueAmount: 10000,
//       tests: [
//         { testId: 6, testName: "Urine Culture", testCode: "URC06", price: 500, orderedCount: 80, totalEarnings: 40000, paidAmount: 30000, dueAmount: 10000 },
//       ],
//     },
//   ],
// };
// // ────────────────────────────────────────────────────────────────────────────

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

//   // Static-placeholder section filters (kept so the UI/UX is ready to wire up
//   // the moment the backend endpoints land - see STATIC PLACEHOLDER DATA above).
//   const [topCategoriesFilter, setTopCategoriesFilter] = useState<DateFilterType>("currentFY");
//   const [topCategoriesCustomRange, setTopCategoriesCustomRange] = useState<DateRange>({
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
//   const [totalAdmins, setTotalAdmins] = useState<number>(0);
//   const [totalTechnicians, setTotalTechnicians] = useState<number>(0);
//   const [totalDeskRoles, setTotalDeskRoles] = useState<number>(0);
//   const [totalPatients, setTotalPatients] = useState<number>(0);
//   const [totalTests, setTotalTests] = useState<number>(0);
//   const [totalRevenue, setTotalRevenue] = useState<number>(0);
//   const [reportsGenerated, setReportsGenerated] = useState<number>(0);
//   const [pendingSamples, setPendingSamples] = useState<number>(0);
//   const [testsByCategory, setTestsByCategory] = useState<Array<{ category: string; testCount: number }>>([]);
//   const [categoryTotal, setCategoryTotal] = useState<number>(0);
//   const [revenueTrend, setRevenueTrend] = useState<Array<{ date: string; revenue: number }>>([]);
//   const [labPerformance, setLabPerformance] = useState<LabPerformance | null>(null);
//   const [topDoctors, setTopDoctors] = useState<TopReferringDoctor[]>([]);
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

//   // Sections still backed by static placeholder data (see STATIC PLACEHOLDER
//   // DATA above) - not touched by fetchAllData until their endpoints exist.
//   const packagesData = STATIC_PACKAGES_DATA;
//   const earningsData = STATIC_EARNINGS_DATA;

//   // Sync individual filters with global filter when global changes
//   useEffect(() => {
//     setRevenueFilter(globalFilter);
//     setTopCategoriesFilter(globalFilter);
//     setCategoryFilter(globalFilter);
//     setPackagesFilter(globalFilter);
//     setPerformanceFilter(globalFilter);
//     setDoctorsFilter(globalFilter);
//   }, [globalFilter]);

//   // Sync custom ranges when global custom range changes
//   useEffect(() => {
//     if (globalFilter === "custom") {
//       setRevenueCustomRange(globalCustomRange);
//       setTopCategoriesCustomRange(globalCustomRange);
//       setCategoryCustomRange(globalCustomRange);
//       setPackagesCustomRange(globalCustomRange);
//       setPerformanceCustomRange(globalCustomRange);
//       setDoctorsCustomRange(globalCustomRange);
//     }
//   }, [globalCustomRange, globalFilter]);

//   // Fetch function
//   const fetchAllData = useCallback(async (silent = false) => {
//     if (!labId) return;

//     if (!silent) {
//       setLoading(true);
//     } else {
//       setRefreshing(true);
//     }

//     try {
//       // 1. Fetch KPIs WITHOUT date filters (all-time)
//       const [adminsResult, techniciansResult, deskRolesResult] = await Promise.allSettled([
//         getTotalAdmins(labId),
//         getTotalTechnicians(labId),
//         getTotalDeskRoles(labId),
//       ]);

//       if (adminsResult.status === "fulfilled") setTotalAdmins(adminsResult.value.totalAdmins);
//       if (techniciansResult.status === "fulfilled") setTotalTechnicians(techniciansResult.value.totalTechnicians);
//       if (deskRolesResult.status === "fulfilled") setTotalDeskRoles(deskRolesResult.value.totalDeskRoles);

//       // 2. Fetch data with GLOBAL date filter for main KPIs
//       const globalRange = getDateRange(globalFilter, globalCustomRange);
//       const [testsResult, reportsResult, pendingResult, patientsResult, revenueResult] = await Promise.allSettled([
//         getTotalTests(labId, globalRange.startDate, globalRange.endDate),
//         getReportsGenerated(labId, globalRange.startDate, globalRange.endDate),
//         getPendingSamples(labId, globalRange.startDate, globalRange.endDate),
//         getTotalPatients(labId, globalRange.startDate, globalRange.endDate),
//         getTotalRevenue(labId, globalRange.startDate, globalRange.endDate),
//       ]);

//       if (testsResult.status === "fulfilled") setTotalTests(testsResult.value.totalTests);
//       if (reportsResult.status === "fulfilled") setReportsGenerated(reportsResult.value.reportsGenerated);
//       if (pendingResult.status === "fulfilled") setPendingSamples(pendingResult.value.pendingSamples);
//       if (patientsResult.status === "fulfilled") setTotalPatients(patientsResult.value.totalPatients);
//       if (revenueResult.status === "fulfilled") setTotalRevenue(revenueResult.value.totalRevenue);

//       // 3. Fetch revenue trend with its OWN filter
//       const revenueRange = getDateRange(revenueFilter, revenueCustomRange);
//       if (revenueRange.startDate && revenueRange.endDate) {
//         try {
//           const trendResult = await getRevenueTrend(labId, revenueRange.startDate, revenueRange.endDate);
//           setRevenueTrend(trendResult.trend || []);
//         } catch (error) {
//           console.error("Error fetching revenue trend:", error);
//           setRevenueTrend([]);
//         }
//       } else {
//         setRevenueTrend([]);
//       }

//       // 4. Fetch tests by category with the section's OWN filter
//       const categoryRange = getDateRange(categoryFilter, categoryCustomRange);
//       try {
//         const categoryResult = await getTestsByCategory(labId, categoryRange.startDate, categoryRange.endDate);
//         setTestsByCategory(categoryResult.categories || []);
//         setCategoryTotal(categoryResult.total || 0);
//       } catch (error) {
//         console.error("Error fetching tests by category:", error);
//         setTestsByCategory([]);
//         setCategoryTotal(0);
//       }

//       // 5. Fetch lab performance (this lab only) with its OWN filter
//       const performanceRange = getDateRange(performanceFilter, performanceCustomRange);
//       try {
//         const performanceResult = await getLabPerformance(labId, performanceRange.startDate, performanceRange.endDate);
//         setLabPerformance(performanceResult || null);
//       } catch (error) {
//         console.error("Error fetching lab performance:", error);
//         setLabPerformance(null);
//       }

//       // 6. Fetch top doctors with its OWN filter
//       const doctorsRange = getDateRange(doctorsFilter, doctorsCustomRange);
//       try {
//         const doctorsResult = await getTopReferringDoctors(labId, doctorsRange.startDate, doctorsRange.endDate, 5);
//         setTopDoctors(doctorsResult || []);
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
//   }, [labId, globalFilter, globalCustomRange, revenueFilter, revenueCustomRange, categoryFilter, categoryCustomRange, performanceFilter, performanceCustomRange, doctorsFilter, doctorsCustomRange]);

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

//   // Helper function for ordinal suffixes
//   const getOrdinalSuffix = (num: number): string => {
//     if (num === 1) return "st";
//     if (num === 2) return "nd";
//     if (num === 3) return "rd";
//     return "th";
//   };

//   // Format data for revenue chart with dynamic X-axis labels
//   const formatRevenueData = () => {
//     if (revenueTrend.length === 0) {
//       return [
//         { label: "Jun", revenue: 5000 },
//         { label: "Jul", revenue: 15000 },
//         { label: "Aug", revenue: 14500 },
//         { label: "Sep", revenue: 9000 },
//         { label: "Oct", revenue: 6000 },
//         { label: "Nov", revenue: 12000 },
//         { label: "Dec", revenue: 5000 },
//         { label: "Jan", revenue: 10000 },
//       ];
//     }

//     const currentFilter = revenueFilter;
//     const sortedData = [...revenueTrend].sort((a, b) =>
//       dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
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
//           buckets.push({ label: current.format("MMM"), start: current.startOf('month'), end: current.endOf('month') });
//           current = current.add(1, 'month');
//         }
//         break;
//       }
//       case "week": {
//         const today = dayjs();
//         const startOfWeek = today.startOf('week');
//         let current = startOfWeek.clone();
//         while (current.isBefore(today) || current.isSame(today, 'day')) {
//           buckets.push({ label: current.format("ddd"), start: current.startOf('day'), end: current.endOf('day') });
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
//           buckets.push({ label: current.format("MMM"), start: current.startOf('month'), end: current.endOf('month') });
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
//               buckets.push({ label: day.format("DD MMM"), start: day.startOf('day'), end: day.endOf('day') });
//             }
//           } else if (diffDays <= 31) {
//             for (let i = 0; i <= diffDays; i += 3) {
//               const segStart = start.add(i, 'days');
//               const segEndCandidate = segStart.add(2, 'days');
//               const segEnd = segEndCandidate.isAfter(end) ? end : segEndCandidate;
//               buckets.push({ label: segStart.format("DD MMM"), start: segStart.startOf('day'), end: segEnd.endOf('day') });
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
//               buckets.push({ label: current.format("MMM YY"), start: bucketStart.startOf('day'), end: bucketEnd.endOf('day') });
//               current = current.add(1, 'month');
//             }
//           }
//         } else {
//           buckets = sortedData.map((item) => {
//             const d = dayjs(item.date);
//             return { label: d.format("DD MMM"), start: d.startOf('day'), end: d.endOf('day') };
//           });
//         }
//         break;
//       }
//       default: {
//         buckets = sortedData.map((item) => {
//           const d = dayjs(item.date);
//           return { label: d.format("DD MMM"), start: d.startOf('day'), end: d.endOf('day') };
//         });
//       }
//     }

//     return buckets.map((bucket) => ({
//       label: bucket.label,
//       revenue: sumRevenueInRange(bucket.start, bucket.end),
//     }));
//   };

//   // Format data for category pie chart (counts only - see module header note)
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
//         color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
//       }));
//   };

//   // Format packages data for pie chart (STATIC PLACEHOLDER)
//   const getPackagesChartData = () => {
//     if (!packagesData.packages || packagesData.packages.length === 0) {
//       return [];
//     }
//     return packagesData.packages
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

//   // Format alerts data from the earnings summary (STATIC PLACEHOLDER)
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

//   // Format this lab's performance into the same row shape SuperAdminStats uses
//   const getFormattedLabPerformance = () => {
//     if (!labPerformance) {
//       return {
//         id: "01",
//         lab: currentLab?.name || "This Lab",
//         revenue: "₹0",
//         tests: "0",
//         patients: "0",
//         pending: "0",
//         tat: "0 hrs",
//         reports: "0",
//         growth: "0%",
//         positive: true,
//       };
//     }
//     return {
//       id: "01",
//       lab: labPerformance.labName || currentLab?.name || "This Lab",
//       revenue: formatCurrency(labPerformance.revenue || 0),
//       tests: (labPerformance.tests || 0).toLocaleString(),
//       patients: (labPerformance.patients || 0).toLocaleString(),
//       pending: (labPerformance.pendingSamples || 0).toLocaleString(),
//       tat: `${labPerformance.avgTatHours?.toFixed(1) || 0} hrs`,
//       reports: (labPerformance.reportsGenerated || 0).toLocaleString(),
//       growth: labPerformance.growthPct !== null && labPerformance.growthPct !== undefined
//         ? `${labPerformance.growthPct > 0 ? "+" : ""}${labPerformance.growthPct.toFixed(1)}%`
//         : "0%",
//       positive: labPerformance.growthPct !== null && labPerformance.growthPct !== undefined ? labPerformance.growthPct >= 0 : true,
//     };
//   };

//   // Format doctors data
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

//   // Get earnings data for selected category (STATIC PLACEHOLDER)
//   const getEarningsForCategory = () => {
//     if (!earningsData.categories || earningsData.categories.length === 0) {
//       return { tests: [] as EarningsTestRow[], categoryName: "" };
//     }

//     const allTests: EarningsTestRow[] = [];
//     earningsData.categories.forEach((cat) => {
//       if (cat.tests && cat.tests.length > 0) {
//         cat.tests.forEach((test) => {
//           allTests.push({ ...test });
//         });
//       }
//     });
//     allTests.sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0));
//     return { tests: allTests, categoryName: "All Categories" };
//   };

//   // Stats data (KPIs)
//   const stats = [
//     {
//       id: 1,
//       title: "Total Patients",
//       value: loading ? "..." : String(totalPatients),
//       color: "text-secondary-700",
//       icon: Users,
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

//   const revenueChartData = formatRevenueData();
//   const categoryChartData = getCategoryChartData();
//   const packagesChartData = getPackagesChartData();
//   const alertsData = getAlertsData();
//   const performanceRow = getFormattedLabPerformance();
//   const doctorsData = getFormattedDoctors();
//   const earnings = getEarningsForCategory();

//   const revenueAxisConfig = getRevenueAxisConfig(
//     Math.max(0, ...revenueChartData.map((d: { revenue: number }) => d.revenue || 0))
//   );
//   const topCategoriesAxisConfig = getRevenueAxisConfig(
//     Math.max(0, ...STATIC_TOP_CATEGORIES.map((c) => c.revenue))
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

//   // Custom tooltip for category pie chart (counts only - no revenue split at admin scope)
//   const CategoryTooltip = ({ active, payload }: any) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;
//       return (
//         <div className="rounded-lg border border-pneutral-100 bg-base-white p-4 shadow-lg min-w-[180px]">
//           <p className="text-p3 font-semibold text-pneutral-900 mb-2">{data.name}</p>
//           <div className="space-y-1 text-p3 text-pneutral-600">
//             <p>Tests: <span className="font-semibold text-pneutral-900">{data.testCount.toLocaleString()}</span></p>
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
//       tests.sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0));
//     } else {
//       tests.sort((a, b) => (a.totalEarnings || 0) - (b.totalEarnings || 0));
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
//               Lab Analytics
//             </h1>
//             <span className="rounded-full bg-secondary-100 px-4 py-1 text-label-l3 font-semibold text-secondary-700">
//               {currentLab?.name || "This Lab"} Overview
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
//                 Revenue Trend
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

//         {/* Top Categories by Revenue - STATIC PLACEHOLDER (no lab-scoped
//             earnings-by-category endpoint yet) */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="mb-8 flex items-center justify-between">
//             <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//               Top Categories by Revenue
//             </h2>
//             <div className="flex items-center gap-3">
//               {renderFilterDropdown(
//                 topCategoriesFilter,
//                 setTopCategoriesFilter,
//                 topCategoriesCustomRange,
//                 setTopCategoriesCustomRange,
//                 false
//               )}
//             </div>
//           </div>
//           <div className="space-y-4">
//             {STATIC_TOP_CATEGORIES.map((cat, index) => (
//               <div key={index} className="grid grid-cols-[1.2fr_2.5fr_64px] items-center gap-5">
//                 <p className="truncate text-p3 font-medium text-pneutral-900">{cat.name}</p>
//                 <div className="relative h-4 overflow-hidden rounded-full bg-secondary-100">
//                   <div
//                     className="h-full rounded-full bg-secondary-700 transition-all duration-500"
//                     style={{
//                       width: `${Math.min((cat.revenue / topCategoriesAxisConfig.domainMax) * 100, 100)}%`,
//                     }}
//                   />
//                 </div>
//                 <p className="w-16 text-right text-p3 font-semibold text-pneutral-900">
//                   {topCategoriesAxisConfig.formatTick(cat.revenue)}
//                 </p>
//               </div>
//             ))}
//           </div>
//           <div className="grid grid-cols-[1.2fr_2.5fr_64px] gap-5 mt-5">
//             <div />
//             <div className="relative h-6">
//               {topCategoriesAxisConfig.ticks.map((tick, index) => (
//                 <span
//                   key={tick}
//                   className="absolute -translate-x-1/2 text-p3 text-pneutral-900"
//                   style={{
//                     left: `${(index / (topCategoriesAxisConfig.ticks.length - 1)) * 100}%`,
//                   }}
//                 >
//                   {topCategoriesAxisConfig.formatTick(tick)}
//                 </span>
//               ))}
//             </div>
//             <div />
//           </div>
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
//                         {categoryTotal.toLocaleString()}
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

//         {/* Revenue by Test - Table - STATIC PLACEHOLDER (no lab-scoped
//             earnings-by-category endpoint yet) */}
//         <div className="rounded-lg border border-pneutral-100 bg-base-white px-4 py-2 shadow-xsm">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//               Revenue by Test
//             </h2>
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
//         {/* Packages Summary - STATIC PLACEHOLDER (no packages-summary
//             endpoint at admin scope yet) - 33% */}
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

//         {/* Billing Summary - STATIC PLACEHOLDER (no earnings-by-category
//             endpoint at admin scope yet) - 33% */}
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

//       {/* Lab Performance Summary - single row (this lab only) */}
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
//               </tr>
//             </thead>
//             <tbody>
//               <tr className="border-b border-pneutral-100 transition hover:bg-pneutral-50">
//                 <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{performanceRow.id}</td>
//                 <td className="border-b border-pneutral-100 px-4 py-2 font-medium text-pneutral-900">{performanceRow.lab}</td>
//                 <td className="border-b border-pneutral-100 px-4 py-2 font-medium text-pneutral-900">{performanceRow.revenue}</td>
//                 <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{performanceRow.tests}</td>
//                 <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{performanceRow.patients}</td>
//                 <td className="border-b border-pneutral-100 px-4 py-2 font-medium text-danger-600">{performanceRow.pending}</td>
//                 <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{performanceRow.tat}</td>
//                 <td className="border-b border-pneutral-100 px-4 py-2 text-p3 text-pneutral-900">{performanceRow.reports}</td>
//                 <td className="border-b border-pneutral-100 px-4 py-2">
//                   <div
//                     className={`flex items-center gap-2 font-medium ${
//                       performanceRow.positive ? "text-success-600" : "text-warning-500"
//                     }`}
//                   >
//                     {performanceRow.positive ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
//                     {performanceRow.growth}
//                   </div>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminStats;
