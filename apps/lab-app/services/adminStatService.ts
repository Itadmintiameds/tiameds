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
    SampleWorkflowFunnel,
    RevenueByCollectionMethod,
    TopOrderedTest,
    AgeGenderDistribution,
    TechnicianPerformance,
    GridReportResponse,
    PackagePerformance,
} from '@/types/adminStatsData';

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
 * Tests by category, scoped to this lab. 
 * The backend projection here only carries category + testCount.
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
 * This lab's own revenue figure (singular), not a multi-lab ranking.
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
 * 7-day-vs-previous-7-day KPI snapshot with trend direction.
 */
export const getDashboardKpis = async (labId: number | string): Promise<DashboardKpis> =>
    get<DashboardKpis>(`/${labId}/dashboard-kpis`, 'An error occurred while fetching dashboard KPIs.');

/**
 * Get sample workflow funnel data.
 * This endpoint returns a structured funnel with counts and percentages.
 */
export const getSampleWorkflowFunnel = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<SampleWorkflowFunnel> =>
    get<SampleWorkflowFunnel>(
        buildUrlWithDates(`/${labId}/sample-workflow-funnel`, startDate, endDate),
        'An error occurred while fetching sample workflow funnel.'
    );


/**
 * Get technician performance data for a specific lab.
 */
export const getTechnicianPerformance = async (
    labId: number | string,
    startDate?: string,
    endDate?: string,
    limit: number = 10
): Promise<TechnicianPerformance[]> => {
    const baseUrl = `/${labId}/technician-performance`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', limit.toString());
    const url = `${baseUrl}?${params.toString()}`;

    return get<TechnicianPerformance[]>(url, 'An error occurred while fetching technician performance.');
};

/**
 * Get top ordered tests. `data` is the flat, already-sorted list of every
 * ordered test in the range (not just a top-N slice).
 */
export const getTopOrderedTests = async (
    labId: number | string,
    startDate?: string,
    endDate?: string,
    limit: number = 1000
): Promise<TopOrderedTest[]> => {
    const baseUrl = `/${labId}/top-ordered-tests`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', limit.toString());
    const url = `${baseUrl}?${params.toString()}`;

    const result = await get<TopOrderedTest[]>(
        url,
        'An error occurred while fetching top ordered tests.'
    );
    return result || [];
};

/**
 * Get revenue breakdown by collection method (UPI, Cash, Card, Credit).
 */
export const getRevenueByCollectionMethod = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<RevenueByCollectionMethod> =>
    get<RevenueByCollectionMethod>(
        buildUrlWithDates(`/${labId}/revenue-by-collection-method`, startDate, endDate),
        'An error occurred while fetching revenue by collection method.'
    );

/**
 * Get age & gender distribution.
 */
export const getAgeGenderDistribution = async (
    labId: number | string,
    startDate?: string,
    endDate?: string
): Promise<AgeGenderDistribution> =>
    get<AgeGenderDistribution>(
        buildUrlWithDates(`/${labId}/age-gender-distribution`, startDate, endDate),
        'An error occurred while fetching age & gender distribution.'
    );

/**
 * Get the paginated billing grid report (one row per visit/billing record) for this lab.
 */
export const getGridReport = async (
    labId: number | string,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 20
): Promise<GridReportResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('page', String(page));
    params.append('size', String(size));

    const url = `/${labId}/grid?${params.toString()}`;

    return get<GridReportResponse>(url, 'An error occurred while fetching the grid report.');
};

/**
 * Get package performance data (visit count/revenue breakdown per health package) for this lab.
 */
export const getPackagePerformance = async (
    labId: number | string,
    startDate?: string,
    endDate?: string,
    limit: number = 10
): Promise<PackagePerformance[]> => {
    const baseUrl = `/${labId}/package-performance`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', limit.toString());
    const url = `${baseUrl}?${params.toString()}`;

    const result = await get<PackagePerformance[]>(url, 'An error occurred while fetching package performance.');
    return result || [];
};