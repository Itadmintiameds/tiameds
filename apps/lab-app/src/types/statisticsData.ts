export interface PatientTestSummary {
    total: number;
    pending: number;
    cancelled: number;
    partiallyCompleted: number;
    completed: number;
}

export interface TotalLabsCount {
    totalLabs: number;
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

// ---- GET /lab-super-admin/stats/all ----

// Role-count KPIs (totalAdmins/totalTechnicians/totalDeskRoles) are shaped differently
// depending on whether `labId` was passed to the request: a plain number when scoped to
// one lab, or this richer per-lab breakdown when aggregating across every lab (see
// SuperAdminDashboardController#buildRoleLabWise on the backend).
export interface RoleLabWiseRow {
    labId: number;
    labName: string;
    count: number;
}

export interface RoleLabWiseTotal {
    total: number;
    labWise: RoleLabWiseRow[];
}

export interface AllStatsKpis {
    totalLabs: number;
    totalAdmins: number | RoleLabWiseTotal;
    totalTechnicians: number | RoleLabWiseTotal;
    totalDeskRoles: number | RoleLabWiseTotal;
    totalTests: number;
    totalRevenue: number;
    reportsGenerated: number;
    pendingSamples: number;
}

export interface LabWiseSummary {
    labId: number;
    labName: string;
    revenue: number;
    tests: number;
    patients: number;
    pendingSamples: number;
    reportsGenerated: number;
    avgTatHours: number;
}

export interface DashboardSummary {
    cumulative: {
        totalLabs: number;
        totalRevenue: number;
        totalTests: number;
        totalPatients: number;
        reportsGenerated: number;
        pendingSamples: number;
    };
    labWise: LabWiseSummary[];
}

export interface RevenueTrendPoint {
    date: string;
    revenue: number;
}

export interface RevenueTrendData {
    totalRevenue: number;
    trend: RevenueTrendPoint[];
}

export interface RevenueByLabRow {
    labId?: number;
    labName: string;
    revenue: number;
    discount: number;
    packageRevenue: number;
}

export interface TestCategoryRow {
    category: string;
    testCount: number;
    revenue: number;
    discount: number;
    paidRevenue: number;
    dueRevenue: number;
    cashRevenue: number;
    upiRevenue: number;
    cardRevenue: number;
}

export interface PaymentModeBreakdown {
    cash: number;
    upi: number;
    card: number;
}

export interface BillingSummary {
    totalBillings: number;
    grossBilled: number;
    totalDiscount: number;
    totalGst: number;
    netBilled: number;
    totalPaid: number;
    totalDue: number;
    paymentMode: PaymentModeBreakdown;
}

export interface TestsSummary {
    totalCategories: number;
    totalTests: number;
    grossBilled: number;
    discount: number;
    paid: number;
    due: number;
    paymentMode: PaymentModeBreakdown;
}

export interface PackageSummaryTotals {
    totalPackages: number;
    totalVisits: number;
    grossBilled: number;
    discount: number;
    paid: number;
    due: number;
    paymentMode: PaymentModeBreakdown;
}

export interface PackageRow {
    packageId: number;
    packageName: string;
    packageCode: string;
    revenue: number;
    discount: number;
    visitCount: number;
    paidRevenue: number;
    dueRevenue: number;
    cashRevenue: number;
    upiRevenue: number;
    cardRevenue: number;
}

export interface DetailedBilling {
    summary: BillingSummary;
    testsSummary: TestsSummary;
    testCategories: TestCategoryRow[];
    packageSummary: PackageSummaryTotals;
    packages: PackageRow[];
}

export interface EarningsTestRow {
    testId: number;
    testName: string;
    testCode: string;
    price: number;
    orderedCount: number;
    grossEarnings: number;
    // Named "revenue" by the backend, but it's actually the paid amount
    // (controller derives it from getPaidAmount()).
    revenue: number;
    dueAmount: number;
}

export interface EarningsCategoryRow {
    category: string;
    totalTests: number;
    revenue: number;
    dueAmount: number;
    tests: EarningsTestRow[];
}

export interface EarningsByCategoryData {
    summary: {
        totalCategories: number;
        totalTests: number;
        totalRevenue: number;
        totalDue: number;
    };
    categories: EarningsCategoryRow[];
}

export interface TopReferringDoctor {
    doctorId: number;
    doctorName: string;
    speciality: string;
    patientCount: number;
    labCount: number;
    revenue: number;
}

export interface LabPerformanceRow {
    rank: number;
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

// ---- GET /lab-super-admin/stats/grid ----

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

export interface AllStatsResponse {
    kpis: AllStatsKpis;
    dashboardSummary: DashboardSummary;
    revenueTrend: RevenueTrendData;
    revenueByLab: RevenueByLabRow[];
    detailedBilling: DetailedBilling;
    earningsByCategory: EarningsByCategoryData;
    topReferringDoctors: TopReferringDoctor[];
    labPerformance: LabPerformanceRow[];
}





// code dated 23.07.2026...
// export interface PatientTestSummary {
//     total: number;
//     pending: number;
//     cancelled: number;
//     partiallyCompleted: number;
//     completed: number;
// }

// export interface TotalLabsCount {
//     totalLabs: number;
// }

// export interface TotalAdmins {
//     totalAdmins: number;
// }

// export interface TotalTechnicians {
//     totalTechnicians: number;
// }

// export interface TotalDeskRoles {
//     totalDeskRoles: number;
// }