// types/adminStatsData.ts
//
// Response shapes for AdminStatsController (backend: /lab-admin/stats/**),
// the lab-scoped counterpart to SuperAdminStatsController (see statisticsData.ts).
// Every endpoint here is scoped to a single {labId}, so shapes that are arrays
// of "top N labs" at the superadmin level collapse to a single object here.

export interface TotalAdmins {
    totalAdmins: number;
}

export interface TotalTechnicians {
    totalTechnicians: number;
}

export interface TotalDeskRoles {
    totalDeskRoles: number;
}

export interface TotalTests {
    totalTests: number;
}

export interface TotalRevenue {
    totalRevenue: number;
}

export interface ReportsGenerated {
    reportsGenerated: number;
}

export interface PendingSamples {
    pendingSamples: number;
}

export interface TotalPatients {
    totalPatients: number;
}

export interface AvgTat {
    avgTatHours: number;
}

export interface MyLabsCount {
    totalLabs: number;
}

// AdminStatsController's tests-by-category only exposes counts (it calls
// visitTestResultRepository.getPatientTestsByCategoryByLabId, a plainer
// projection than the revenue-enriched one SuperAdminStatsController uses) -
// no revenue/discount/paid/due/cash/upi/card breakdown is available here.
export interface TestsByCategoryRow {
    category: string;
    testCount: number;
}

export interface TestsByCategoryData {
    total: number;
    categories: TestsByCategoryRow[];
}

export interface RevenueTrendPoint {
    date: string;
    revenue: number;
}

export interface RevenueTrendData {
    totalRevenue: number;
    trend: RevenueTrendPoint[];
}

// Singular - this lab's revenue only, not a multi-lab list.
export interface RevenueByLab {
    labId: number;
    labName: string;
    revenue: number;
}

export interface PatientTestSummary {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    partiallyCompleted: number;
}

// Singular - this lab's performance row, not a ranked table of many labs.
export interface LabPerformance {
    labId: number;
    labName: string;
    revenue: number;
    tests: number;
    patients: number;
    pendingSamples: number;
    avgTatHours: number;
    reportsGenerated: number;
    growthPct: number | null;
}

export interface TopReferringDoctor {
    doctorId: number;
    doctorName: string;
    referralCount: number;
    revenue: number;
}

export interface DashboardKpi {
    value: number;
    vsLastWeekPct: number;
    direction: 'up' | 'down';
}

export interface DashboardTatKpi {
    value: number;
    vsLastWeekHours: number;
    direction: 'up' | 'down';
}

export interface DashboardKpis {
    totalRevenue: DashboardKpi;
    totalTests: DashboardKpi;
    totalPatients: DashboardKpi;
    pendingSamples: DashboardKpi;
    reportsGenerated: DashboardKpi;
    avgTatHours: DashboardTatKpi;
    activeAdmins: { value: number };
    deskUsers: { value: number };
    technicians: { value: number };
}
