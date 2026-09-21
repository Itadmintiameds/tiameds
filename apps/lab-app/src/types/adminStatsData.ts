// types/adminStatsData.ts
//
// Response shapes for AdminStatsController (backend: /lab-admin/stats/**)

// Response shape for CategoryStatsRollupAdminController
// (backend: POST /lab-admin/stats/category-rollup/backfill)
export interface CategoryRollupBackfillResult {
    labId: number | null;
    startDate: string;
    endDate: string;
    dayRowsProcessed: number;
}

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

// Tests by category
export interface TestsByCategoryRow {
    category: string;
    count: number;
    percentage: number;
}

export interface TestsByCategoryData {
    total: number;
    categories: TestsByCategoryRow[];
}

// Top Ordered Tests
export interface TopOrderedTest {
    testName: string;
    testCode: string;
    orderedCount: number;
}

// Revenue Trend
export interface RevenueTrendPoint {
    date: string;
    revenue: number;
}

export interface RevenueTrendData {
    totalRevenue: number;
    trend: RevenueTrendPoint[];
}

// Revenue by Lab
export interface RevenueByLab {
    labId: number;
    labName: string;
    revenue: number;
}

// Patient Test Summary
export interface PatientTestSummary {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    partiallyCompleted: number;
}

// Lab Performance
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

// Top Referring Doctors
export interface TopReferringDoctor {
    doctorId: number;
    doctorName: string;
    speciality?: string;
    patientCount: number;
    revenue: number;
    labCount?: number;
}

// Technician Performance
export interface TechnicianPerformance {
    technicianId: number;
    technicianName: string;
    samplesProcessed: number;
    reportsEntered: number;
    avgTatHours: number;
}

// Dashboard KPIs
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

// Sample Workflow Funnel
export interface SampleWorkflowFunnel {
    samplesRegistered: {
        count: number;
        percentage: number;
    };
    samplesCollected: {
        count: number;
        percentage: number;
    };
    resultsEntered: {
        count: number;
        percentage: number;
    };
    reportsGenerated: {
        count: number;
        percentage: number;
    };
    reportsDelivered: {
        count: number;
        percentage: number;
    };
}

// Revenue by Collection Method
export interface RevenueByCollectionMethodItem {
    method: string;
    revenue: number;
    percentage: number;
}

export interface RevenueByCollectionMethod {
    total: number;
    methods: RevenueByCollectionMethodItem[];
}

// Age & Gender Distribution
export interface GenderDistribution {
    gender: string;
    count: number;
    percentage: number;
}

export interface AgeGroupDistribution {
    ageGroup: string;
    count: number;
    percentage: number;
}

export interface AgeGenderDistribution {
    totalPatients: number;
    gender: GenderDistribution[];
    ageGroups: AgeGroupDistribution[];
}

// Billing Grid Report (one row per visit/billing record)
export interface GridReportRow {
    paymentStatus: string;
    discount: number;
    dueAmount: number;
    netAmount: number;
    paymentMethod: string;
    totalAmount: number;
    paidAmount: number;
    labId: number;
    labName: string;
    createdAt: string;
    visitCode: string;
    visitDate: string;
    visitId: number;
    patientCode: string;
    patientId: number;
    visitType: string;
    visitStatus: string;
    patientName: string;
    billingCode: string;
    billingId: number;
    billingDate: string;
    patientPhone: string;
    doctorName: string;
}

export interface GridReportResponse {
    page: number;
    size: number;
    totalRecords: number;
    totalPages: number;
    rows: GridReportRow[];
}

export interface PackagePerformance {
    packageId: number;
    packageName: string;
    packageCode?: string;
    visitCount: number;
    revenue: number;
    discount: number;
    paidRevenue: number;
    dueRevenue: number;
    cashRevenue: number;
    upiRevenue: number;
    cardRevenue: number;
}