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
//   Users,
//   Clock,
//   Monitor,
//   FlaskConical,
//   UserRound,
//   Clock3,
//   FileText,
//   AlertTriangle,
//   AlertCircle,
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
// import {
//   HiOutlineBanknotes,
//   HiOutlineUserGroup,
//   HiOutlineUsers,
// } from "react-icons/hi2";
// import { PiDna, PiFlaskLight, PiGraduationCapThin } from "react-icons/pi";

// // Import context + services
// import { useLabs } from "@/context/LabContext";
// import {
//   getAvgTat,
//   getDashboardKpis,
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
//   getTechnicianPerformance,
// } from "../../../../../../services/adminStatService";
// import {
//   DashboardKpi,
//   DashboardKpis,
//   LabPerformance,
//   TopReferringDoctor,
//   TechnicianPerformance as TechnicianPerformanceType,
// } from "@/types/adminStatsData";

// type DateFilterType = "currentFY" | "week" | "month" | "year" | "custom";

// interface DateRange {
//   startDate: string;
//   endDate: string;
// }

// // ─────────────────────────────────────────────────────────────────────────
// // Helper Functions (same as SuperAdminStats)
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

// // Revenue axis unit tiers (Indian numbering: K -> L -> Cr)
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

// // Helper: ordinal suffix (1st, 2nd, 3rd, 4th...)
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

// const GENDER_COLORS = ["#3B82F6", "#8B5CF6", "#10B981"];

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
//     Array<{ category: string; testCount: number }>
//   >([]);
//   const [categoryTotal, setCategoryTotal] = useState<number>(0);
//   const [revenueTrend, setRevenueTrend] = useState<
//     Array<{ date: string; revenue: number }>
//   >([]);
//   const [topDoctors, setTopDoctors] = useState<TopReferringDoctor[]>([]);
//   const [technicianPerformance, setTechnicianPerformance] = useState<
//     TechnicianPerformanceType[]
//   >([]);
//   const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

//   // Age & Gender data (mock for now - can be replaced with real API)
//   const [genderData] = useState([
//     { name: "Male", value: 52, color: "#3B82F6" },
//     { name: "Female", value: 38, color: "#8B5CF6" },
//     { name: "Other", value: 10, color: "#10B981" },
//   ]);

//   const [ageData] = useState([
//     { label: "0-18", value: 8 },
//     { label: "19-35", value: 32 },
//     { label: "36-50", value: 38 },
//     { label: "51-65", value: 17 },
//     { label: "65+", value: 5 },
//   ]);

//   const [alerts] = useState([
//     {
//       icon: "red" as const,
//       text: "5 reports delayed > 4 hrs",
//     },
//     {
//       icon: "yellow" as const,
//       text: "12 samples pending collection",
//     },
//     {
//       icon: "orange" as const,
//       text: "2 critical reports awaiting review",
//     },
//   ]);

//   // Sample Funnel Data
//   const funnelData = [
//     {
//       label: "Samples Registered",
//       value: "1620",
//       percent: "100%",
//       color: "#4F11B8",
//     },
//     {
//       label: "Samples Collected",
//       value: "1450",
//       percent: "95.4%",
//       color: "#FDBA12",
//     },
//     {
//       label: "Results Entered",
//       value: "1320",
//       percent: "86.8%",
//       color: "#5470F5",
//     },
//     {
//       label: "Reports Generated",
//       value: "1280",
//       percent: "84.2%",
//       color: "#EF5A5A",
//     },
//     {
//       label: "Reports Delivered",
//       value: "1210",
//       percent: "79.6%",
//       color: "#52C41A",
//     },
//   ];

//   // ========== SYNC FILTERS ==========
//   useEffect(() => {
//     setRevenueFilter(globalFilter);
//     setCategoryFilter(globalFilter);
//     setTechnicianFilter(globalFilter);
//     setDoctorsFilter(globalFilter);
//   }, [globalFilter]);

//   useEffect(() => {
//     if (globalFilter === "custom") {
//       setRevenueCustomRange(globalCustomRange);
//       setCategoryCustomRange(globalCustomRange);
//       setTechnicianCustomRange(globalCustomRange);
//       setDoctorsCustomRange(globalCustomRange);
//     }
//   }, [globalCustomRange, globalFilter]);

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

//         // 5. Fetch technician performance with its OWN filter
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

//         // 6. Fetch top doctors with its OWN filter
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
//       technicianFilter,
//       technicianCustomRange,
//       doctorsFilter,
//       doctorsCustomRange,
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
//       .filter((item) => (item.testCount || 0) > 0)
//       .map((item, index) => ({
//         name: item.category || "Unknown",
//         value: item.testCount || 0,
//         testCount: item.testCount || 0,
//         color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
//       }));
//   };

//   // Get top order tests (top 5 by test count)
//   const getTopOrderTests = () => {
//     if (!testsByCategory || testsByCategory.length === 0) {
//       return [];
//     }
//     return testsByCategory
//       .sort((a, b) => (b.testCount || 0) - (a.testCount || 0))
//       .slice(0, 5)
//       .map((item) => ({
//         name: item.category || "Unknown",
//         value: item.testCount || 0,
//       }));
//   };

//   // Format doctors data
//   const getFormattedDoctors = () => {
//     if (topDoctors.length === 0) {
//       return [
//         {
//           id: 1,
//           srNo: "01",
//           doctorName: "Dr. Smith",
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

//   const revenueAxisConfig = getRevenueAxisConfig(
//     Math.max(0, ...revenueChartData.map((d) => d.revenue || 0))
//   );

//   const topOrderAxisConfig = getRevenueAxisConfig(
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
//               className="rounded-xl border border-[#E8E8E8] bg-white p-5 shadow-xsm"
//             >
//               <div className="flex items-start gap-4">
//                 <div
//                   className={`flex h-11 w-11 items-center justify-center rounded-full ${item.iconBg}`}
//                 >
//                   <Icon className={`h-5 w-5 ${item.iconColor}`} />
//                 </div>
//                 <div>
//                   <h4 className="text-[13px] font-medium text-gray-700">
//                     {item.title}
//                   </h4>
//                   <h2 className="mt-1 text-[34px] font-semibold leading-none text-gray-900">
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
//         <div className="grid flex-[2] grid-cols-1 gap-4 md:grid-cols-2">
//           {bottomKpiCards.map((item) => {
//             const Icon = item.icon;
//             return (
//               <div
//                 key={item.title}
//                 className="rounded-xl border border-[#E8E8E8] bg-white p-5 shadow-xsm"
//               >
//                 <div className="flex items-start gap-4">
//                   <div
//                     className={`flex h-11 w-11 items-center justify-center rounded-full ${item.iconBg}`}
//                   >
//                     <Icon className={`h-5 w-5 ${item.iconColor}`} />
//                   </div>
//                   <div>
//                     <h4 className="text-[13px] font-medium text-gray-700">
//                       {item.title}
//                     </h4>
//                     <h2 className="mt-1 text-[34px] font-semibold leading-none text-gray-900">
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
//               className="flex min-h-[150px] flex-col items-center justify-center rounded-xl border border-[#E8E8E8] bg-white shadow-xsm"
//             >
//               <h4 className="text-[13px] font-medium text-gray-700">
//                 {item.title}
//               </h4>
//               <h2 className="mt-5 text-[38px] font-semibold text-gray-900">
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
//           <h2 className="text-p4 font-heading font-semibold text-pneutral-900 mb-4">
//             Sample Workflow Funnel
//           </h2>
//           <div className="flex flex-col lg:flex-row items-center justify-between">
//             {/* Funnel SVG */}
//             <div className="flex justify-center w-full lg:w-[42%]">
//               <svg width="230" height="300" viewBox="0 0 230 300">
//                 {/* Purple */}
//                 <polygon
//                   points="30,0 200,0 182,78 48,78"
//                   fill="#4F11B8"
//                 />
//                 {/* Yellow */}
//                 <polygon
//                   points="45,86 185,86 168,165 62,165"
//                   fill="#FDBA12"
//                 />
//                 {/* Blue */}
//                 <polygon
//                   points="65,173 165,173 160,192 70,192"
//                   fill="#5470F5"
//                 />
//                 {/* Red */}
//                 <polygon
//                   points="70,200 160,200 150,245 80,245"
//                   fill="#EF5A5A"
//                 />
//                 {/* Green */}
//                 <polygon
//                   points="82,255 148,255 140,300 90,300"
//                   fill="#52C41A"
//                 />
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
//                     #
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
//                     #
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

//       {/* ===== AGE & GENDER DISTRIBUTION + ALERTS ===== */}
//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
//         {/* Age & Gender Distribution */}
//         <div className="rounded-xl border border-pneutral-100 bg-white p-6 shadow-xsm">
//           <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//             Age & Gender Distribution
//           </h2>

//           <div className="mt-8 flex flex-col lg:flex-row justify-between gap-10">
//             {/* Gender */}
//             <div className="w-full lg:w-[35%]">
//               <h4 className="mb-5 text-sm font-medium text-gray-600">
//                 Gender
//               </h4>
//               <div className="flex flex-col items-center gap-6">
//                 <div className="h-[180px] w-[180px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={genderData}
//                         dataKey="value"
//                         innerRadius={55}
//                         outerRadius={80}
//                         stroke="white"
//                         strokeWidth={5}
//                       >
//                         {genderData.map((entry, index) => (
//                           <Cell key={index} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <Tooltip content={<GenderTooltip />} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//                 <div className="flex flex-wrap justify-center gap-6">
//                   {genderData.map((item) => (
//                     <div key={item.name} className="flex items-center gap-2">
//                       <span
//                         className="h-3.5 w-3.5 rounded-full"
//                         style={{ backgroundColor: item.color }}
//                       />
//                       <div>
//                         <p className="text-xs text-gray-500">{item.name}</p>
//                         <p className="text-base font-semibold text-gray-900">
//                           {item.value}%
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Age Group - Horizontal Bar Chart */}
//             <div className="w-full lg:w-[60%]">
//               <h4 className="mb-5 text-sm font-medium text-gray-600">
//                 Age Group
//               </h4>
//               <div className="space-y-4">
//                 {ageData.map((item) => (
//                   <div key={item.label}>
//                     <div className="flex items-center justify-between mb-1">
//                       <span className="text-sm font-medium text-gray-700 min-w-[50px]">
//                         {item.label}
//                       </span>
//                       <span className="text-sm font-medium text-gray-700">
//                         {item.value}%
//                       </span>
//                     </div>
//                     <div className="relative h-3 overflow-hidden rounded-full bg-secondary-100">
//                       <div
//                         className="h-full rounded-full bg-secondary-700 transition-all duration-500"
//                         style={{
//                           width: `${Math.min((item.value / ageMaxValue) * 100, 100)}%`,
//                         }}
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recent Alerts */}
//         <div className="rounded-xl border border-pneutral-100 bg-white p-6 shadow-xsm">
//           <h2 className="text-p4 font-heading font-semibold text-pneutral-900">
//             Recent Alerts (This Lab)
//           </h2>

//           <div className="mt-8 divide-y divide-gray-200">
//             {alerts.map((alert, index) => (
//               <div
//                 key={index}
//                 className="flex items-center justify-between py-5"
//               >
//                 <div className="flex items-center gap-4">
//                   {alert.icon === "red" && (
//                     <AlertTriangle
//                       className="h-6 w-6 text-red-500"
//                       fill="#EF4444"
//                       strokeWidth={1.8}
//                     />
//                   )}
//                   {alert.icon === "yellow" && (
//                     <AlertTriangle
//                       className="h-6 w-6 text-yellow-500"
//                       fill="#F59E0B"
//                       strokeWidth={1.8}
//                     />
//                   )}
//                   {alert.icon === "orange" && (
//                     <AlertCircle
//                       className="h-6 w-6 text-orange-500"
//                       fill="#F97316"
//                       strokeWidth={1.8}
//                     />
//                   )}
//                   <span className="text-[15px] text-gray-700">
//                     {alert.text}
//                   </span>
//                 </div>
//                 <button className="font-medium text-[#5B3DF5] hover:underline">
//                   View
//                 </button>
//               </div>
//             ))}
//           </div>

//           <div className="mt-8 flex justify-center">
//             <button className="font-semibold text-[#5B3DF5] hover:underline">
//               View All Alerts
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminStats;










// import { FaTools } from 'react-icons/fa';
// import StatisticsMain from './StatisticsMain';

// const AdminStats = () => {
//     return (
//         <div>
//             <div className="mx-4 md:mx-6 mt-4 flex items-start gap-3 rounded-xl border border-warning-500 bg-warning-50 px-4 py-3">
//                 <FaTools className="mt-0.5 shrink-0 text-[#2a78d6] w-4 h-4" />
//                 <p className="text-sm text-warning-600">
//                     <span className="font-semibold ">A redesigned analytics experience for admins is in progress.</span>{' '}
//                     You&apos;re viewing the current dashboard in the meantime.
//                 </p>
//             </div>
//             <StatisticsMain />
//         </div>
//     );
// };

// export default AdminStats;