import axios from 'axios';
import {
    TotalAdmins,
    TotalTechnicians,
    TotalDeskRoles,
    TotalTests,
    TotalRevenue,
    ReportsGenerated,
    PendingSamples,
    TotalPatients,
    AvgTat,
    MyLabsCount,
    TestsByCategoryData,
    RevenueTrendData,
    RevenueByLab,
    PatientTestSummary,
    LabPerformance,
    TopReferringDoctor,
    DashboardKpis,
} from '@/types/adminStatsData';

/**
 * AdminStatsController on the backend requires a Bearer Authorization
 * header rather than the httpOnly accessToken cookie every other endpoint
 * uses (same as SuperAdminStatsController). The browser can't read that
 * cookie to build the header itself, so these calls go through a same-origin
 * Next.js route handler (src/app/api/admin-stats/[...path]/route.ts) that
 * reads the cookie server-side and proxies to the backend with the header
 * attached. See services/statisticsService.ts for the superadmin equivalent.
 */
const adminStatsApi = axios.create({
    baseURL: '/api/admin-stats',
});

const extractErrorMessage = (url: string, error: unknown, fallback: string): string => {
    if (error instanceof Error) {
        const axiosError = error as {
            response?: {
                status?: number;
                data?: { message?: string; error?: string };
                statusText?: string;
            };
            request?: unknown;
            message?: string;
        };

        console.error(`adminStatService: ${url} failed`, {
            status: axiosError.response?.status,
            statusText: axiosError.response?.statusText,
            data: axiosError.response?.data,
            message: axiosError.message,
        });

        const responseData = axiosError.response?.data as { message?: string; error?: string } | undefined;
        if (responseData?.message) {
            return responseData.message;
        }
        if (responseData?.error) {
            return responseData.error;
        }
        if (axiosError.response?.statusText) {
            return `${axiosError.response.statusText} (${axiosError.response.status})`;
        }
        return axiosError.message || fallback;
    }
    return fallback;
}

const buildUrlWithDates = (baseUrl: string, startDate?: string, endDate?: string): string => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

type Envelope<T> = { data: T; message: string; status: string };

async function get<T>(url: string, fallbackMessage: string): Promise<T> {
    try {
        const response = await adminStatsApi.get<Envelope<T>>(url);
        return response.data.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(url, error, fallbackMessage));
    }
}

/**
 * Get the count of labs the current admin user belongs to.
 * The only endpoint on AdminStatsController not scoped by {labId}.
 */
export const getMyLabsCount = async (): Promise<MyLabsCount> =>
    get<MyLabsCount>('/my-labs/count', 'An error occurred while fetching lab count.');

export const getTotalAdmins = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<TotalAdmins> =>
    get<TotalAdmins>(
        buildUrlWithDates(`/${labId}/total-admins`, startDate, endDate),
        'An error occurred while fetching total admins.'
    );

export const getTotalTechnicians = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<TotalTechnicians> =>
    get<TotalTechnicians>(
        buildUrlWithDates(`/${labId}/total-technicians`, startDate, endDate),
        'An error occurred while fetching total technicians.'
    );

export const getTotalDeskRoles = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<TotalDeskRoles> =>
    get<TotalDeskRoles>(
        buildUrlWithDates(`/${labId}/total-deskroles`, startDate, endDate),
        'An error occurred while fetching total desk roles.'
    );

export const getTotalTests = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<TotalTests> =>
    get<TotalTests>(
        buildUrlWithDates(`/${labId}/total-tests`, startDate, endDate),
        'An error occurred while fetching total tests.'
    );

export const getTotalRevenue = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<TotalRevenue> =>
    get<TotalRevenue>(
        buildUrlWithDates(`/${labId}/total-revenue`, startDate, endDate),
        'An error occurred while fetching total revenue.'
    );

export const getReportsGenerated = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<ReportsGenerated> =>
    get<ReportsGenerated>(
        buildUrlWithDates(`/${labId}/reports-generated`, startDate, endDate),
        'An error occurred while fetching reports generated.'
    );

export const getPendingSamples = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<PendingSamples> =>
    get<PendingSamples>(
        buildUrlWithDates(`/${labId}/pending-samples`, startDate, endDate),
        'An error occurred while fetching pending samples.'
    );

export const getTotalPatients = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<TotalPatients> =>
    get<TotalPatients>(
        buildUrlWithDates(`/${labId}/total-patients`, startDate, endDate),
        'An error occurred while fetching total patients.'
    );

export const getAvgTat = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<AvgTat> =>
    get<AvgTat>(
        buildUrlWithDates(`/${labId}/avg-tat`, startDate, endDate),
        'An error occurred while fetching average TAT.'
    );

/**
 * Tests by category, scoped to this lab. Unlike the superadmin equivalent,
 * the backend projection here only carries category + testCount - no
 * revenue/discount/paid/due/cash/upi/card breakdown is available per category.
 */
export const getTestsByCategory = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<TestsByCategoryData> =>
    get<TestsByCategoryData>(
        buildUrlWithDates(`/${labId}/tests-by-category`, startDate, endDate),
        'An error occurred while fetching tests by category.'
    );

export const getRevenueTrend = async (
    labId: number | string,
    startDate: string,
    endDate: string
): Promise<RevenueTrendData> =>
    get<RevenueTrendData>(
        buildUrlWithDates(`/${labId}/revenue-trend`, startDate, endDate),
        'An error occurred while fetching revenue trend.'
    );

/**
 * This lab's own revenue figure (singular), not a multi-lab ranking -
 * there is only one lab in scope for an admin dashboard.
 */
export const getRevenueByLab = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<RevenueByLab | null> =>
    get<RevenueByLab | null>(
        buildUrlWithDates(`/${labId}/revenue-by-lab`, startDate, endDate),
        'An error occurred while fetching revenue for this lab.'
    );

export const getPatientTestSummary = async (
    labId: number | string,
    patientId: number | string,
    startDate?: string,
    endDate?: string
): Promise<PatientTestSummary> =>
    get<PatientTestSummary>(
        buildUrlWithDates(`/${labId}/patient/${patientId}/test-summary`, startDate, endDate),
        'An error occurred while fetching patient test summary.'
    );

/**
 * This lab's own performance row (singular), not a ranked table of many labs.
 */
export const getLabPerformance = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<LabPerformance> =>
    get<LabPerformance>(
        buildUrlWithDates(`/${labId}/lab-performance`, startDate, endDate),
        'An error occurred while fetching lab performance.'
    );

export const getTopReferringDoctors = async (
    labId: number | string,
    startDate?: string,
    endDate?: string,
    limit: number = 10
): Promise<TopReferringDoctor[]> => {
    const baseUrl = `/${labId}/top-referring-doctors`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', limit.toString());
    const url = `${baseUrl}?${params.toString()}`;

    return get<TopReferringDoctor[]>(url, 'An error occurred while fetching top referring doctors.');
};

/**
 * 7-day-vs-previous-7-day KPI snapshot with trend direction, not currently
 * wired into AdminStats.tsx but available for a future trend-arrow row.
 */
export const getDashboardKpis = async (labId: number | string): Promise<DashboardKpis> =>
    get<DashboardKpis>(`/${labId}/dashboard-kpis`, 'An error occurred while fetching dashboard KPIs.');
