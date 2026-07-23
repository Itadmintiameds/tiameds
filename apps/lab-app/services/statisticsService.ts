import axios from 'axios';
import {
    PatientTestSummary,
    TotalLabsCount,
    TotalAdmins,
    TotalTechnicians,
    TotalDeskRoles,
    AllStatsResponse,
} from '@/types/statisticsData';

const statsApi = axios.create({
    baseURL: '/api/superadmin-stats',
});

/**
 * Extract error message from API response
 */
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

        console.error(`statisticsService: ${url} failed`, {
            status: axiosError.response?.status,
            statusText: axiosError.response?.statusText,
            data: axiosError.response?.data,
            message: axiosError.message,
        });

        // Try to get error message from response
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

/**
 * Helper function to build URL with optional date parameters
 */
const buildUrlWithDates = (baseUrl: string, startDate?: string, endDate?: string): string => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Get total labs count with optional date filtering
 * @param startDate - Optional start date (YYYY-MM-DD)
 * @param endDate - Optional end date (YYYY-MM-DD)
 * @returns Promise with total labs count
 */
export const getTotalLabsCount = async (
    startDate?: string,
    endDate?: string
): Promise<TotalLabsCount> => {
    const baseUrl = `/my-labs/count`;
    const url = buildUrlWithDates(baseUrl, startDate, endDate);

    try {
        const response = await statsApi.get<{ data: TotalLabsCount; message: string; status: string }>(url);
        return response.data.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching total labs count.'));
    }
}

/**
 * Get total admins with optional date filtering
 * @param startDate - Optional start date (YYYY-MM-DD)
 * @param endDate - Optional end date (YYYY-MM-DD)
 * @returns Promise with total admins count
 */
export const getTotalAdmins = async (
    startDate?: string,
    endDate?: string
): Promise<TotalAdmins> => {
    const baseUrl = `/total-admins`;
    const url = buildUrlWithDates(baseUrl, startDate, endDate);

    try {
        const response = await statsApi.get<{ data: TotalAdmins; message: string; status: string }>(url);
        return response.data.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching total admins.'));
    }
}

/**
 * Get total technicians with optional date filtering
 * @param startDate - Optional start date (YYYY-MM-DD)
 * @param endDate - Optional end date (YYYY-MM-DD)
 * @returns Promise with total technicians count
 */
export const getTotalTechnicians = async (
    startDate?: string,
    endDate?: string
): Promise<TotalTechnicians> => {
    const baseUrl = `/total-technicians`;
    const url = buildUrlWithDates(baseUrl, startDate, endDate);

    try {
        const response = await statsApi.get<{ data: TotalTechnicians; message: string; status: string }>(url);
        return response.data.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching total technicians.'));
    }
}

/**
 * Get total desk roles with optional date filtering
 * @param startDate - Optional start date (YYYY-MM-DD)
 * @param endDate - Optional end date (YYYY-MM-DD)
 * @returns Promise with total desk roles count
 */
export const getTotalDeskRoles = async (
    startDate?: string,
    endDate?: string
): Promise<TotalDeskRoles> => {
    const baseUrl = `/total-deskroles`;
    const url = buildUrlWithDates(baseUrl, startDate, endDate);

    try {
        const response = await statsApi.get<{ data: TotalDeskRoles; message: string; status: string }>(url);
        return response.data.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching total desk roles.'));
    }
}

/**
 * Get patient test summary for a specific patient in a lab
 * @param labId - Lab ID
 * @param patientId - Patient ID
 * @param startDate - Optional start date (YYYY-MM-DD)
 * @param endDate - Optional end date (YYYY-MM-DD)
 * @returns Promise with patient test summary
 */
export const getPatientTestSummary = async (
    labId: number | string,
    patientId: number | string,
    startDate?: string,
    endDate?: string
): Promise<PatientTestSummary> => {
    const baseUrl = `/${labId}/patient/${patientId}/test-summary`;
    const url = buildUrlWithDates(baseUrl, startDate, endDate);

    try {
        const response = await statsApi.get<{ data: PatientTestSummary; message: string; status: string }>(url);
        return response.data.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching patient test summary.'));
    }
}

/**
 * Get the consolidated super-admin dashboard payload (KPIs, dashboard summary,
 * revenue trend, revenue by lab, detailed billing incl. test-category/package
 * breakdowns, top referring doctors, lab performance) in a single call.
 * @param labId - Optional lab ID to scope the response to a single lab (omit for all labs)
 * @param startDate - Optional start date (YYYY-MM-DD)
 * @param endDate - Optional end date (YYYY-MM-DD)
 * @returns Promise with the full stats payload
 */
export const getAllStats = async (
    labId?: number | string,
    startDate?: string,
    endDate?: string
): Promise<AllStatsResponse> => {
    const params = new URLSearchParams();
    if (labId !== undefined && labId !== null && labId !== '') params.append('labId', String(labId));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = queryString ? `/all?${queryString}` : '/all';

    try {
        const response = await statsApi.get<{ data: AllStatsResponse; message: string; status: string }>(url);
        return response.data.data;
    } catch (error: unknown) {
        throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching dashboard statistics.'));
    }
}





























// code dated 23.07.2026............
// import axios from 'axios';
// import {
//     PatientTestSummary,
//     TotalLabsCount,
//     TotalAdmins,
//     TotalTechnicians,
//     TotalDeskRoles,
// } from '@/types/statisticsData';

// /**
//  * SuperAdminStatsController on the backend requires a Bearer Authorization
//  * header rather than the httpOnly accessToken cookie every other endpoint
//  * uses. The browser can't read that cookie to build the header itself, so
//  * these calls go through a same-origin Next.js route handler
//  * (src/app/api/superadmin-stats/[...path]/route.ts) that reads the cookie
//  * server-side and proxies to the backend with the header attached.
//  */
// const statsApi = axios.create({
//     baseURL: '/api/superadmin-stats',
// });

// /**
//  * Extract error message from API response
//  */
// const extractErrorMessage = (url: string, error: unknown, fallback: string): string => {
//     if (error instanceof Error) {
//         const axiosError = error as {
//             response?: {
//                 status?: number;
//                 data?: { message?: string; error?: string };
//                 statusText?: string;
//             };
//             request?: unknown;
//             message?: string;
//         };

//         console.error(`statisticsService: ${url} failed`, {
//             status: axiosError.response?.status,
//             statusText: axiosError.response?.statusText,
//             data: axiosError.response?.data,
//             message: axiosError.message,
//         });

//         // Try to get error message from response
//         const responseData = axiosError.response?.data as { message?: string; error?: string } | undefined;
//         if (responseData?.message) {
//             return responseData.message;
//         }
//         if (responseData?.error) {
//             return responseData.error;
//         }
//         if (axiosError.response?.statusText) {
//             return `${axiosError.response.statusText} (${axiosError.response.status})`;
//         }
//         return axiosError.message || fallback;
//     }
//     return fallback;
// }

// /**
//  * Helper function to build URL with optional date parameters
//  */
// const buildUrlWithDates = (baseUrl: string, startDate?: string, endDate?: string): string => {
//     const params = new URLSearchParams();
//     if (startDate) params.append('startDate', startDate);
//     if (endDate) params.append('endDate', endDate);

//     const queryString = params.toString();
//     return queryString ? `${baseUrl}?${queryString}` : baseUrl;
// }

// /**
//  * Get total labs count with optional date filtering
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @returns Promise with total labs count
//  */
// export const getTotalLabsCount = async (
//     startDate?: string,
//     endDate?: string
// ): Promise<TotalLabsCount> => {
//     const baseUrl = `/my-labs/count`;
//     const url = buildUrlWithDates(baseUrl, startDate, endDate);

//     try {
//         const response = await statsApi.get<{ data: TotalLabsCount; message: string; status: string }>(url);
//         return response.data.data;
//     } catch (error: unknown) {
//         throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching total labs count.'));
//     }
// }

// /**
//  * Get total admins with optional date filtering
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @returns Promise with total admins count
//  */
// export const getTotalAdmins = async (
//     startDate?: string,
//     endDate?: string
// ): Promise<TotalAdmins> => {
//     const baseUrl = `/total-admins`;
//     const url = buildUrlWithDates(baseUrl, startDate, endDate);

//     try {
//         const response = await statsApi.get<{ data: TotalAdmins; message: string; status: string }>(url);
//         return response.data.data;
//     } catch (error: unknown) {
//         throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching total admins.'));
//     }
// }

// /**
//  * Get total technicians with optional date filtering
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @returns Promise with total technicians count
//  */
// export const getTotalTechnicians = async (
//     startDate?: string,
//     endDate?: string
// ): Promise<TotalTechnicians> => {
//     const baseUrl = `/total-technicians`;
//     const url = buildUrlWithDates(baseUrl, startDate, endDate);

//     try {
//         const response = await statsApi.get<{ data: TotalTechnicians; message: string; status: string }>(url);
//         return response.data.data;
//     } catch (error: unknown) {
//         throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching total technicians.'));
//     }
// }

// /**
//  * Get total desk roles with optional date filtering
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @returns Promise with total desk roles count
//  */
// export const getTotalDeskRoles = async (
//     startDate?: string,
//     endDate?: string
// ): Promise<TotalDeskRoles> => {
//     const baseUrl = `/total-deskroles`;
//     const url = buildUrlWithDates(baseUrl, startDate, endDate);

//     try {
//         const response = await statsApi.get<{ data: TotalDeskRoles; message: string; status: string }>(url);
//         return response.data.data;
//     } catch (error: unknown) {
//         throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching total desk roles.'));
//     }
// }

// /**
//  * Get patient test summary for a specific patient in a lab
//  * @param labId - Lab ID
//  * @param patientId - Patient ID
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @returns Promise with patient test summary
//  */
// export const getPatientTestSummary = async (
//     labId: number | string,
//     patientId: number | string,
//     startDate?: string,
//     endDate?: string
// ): Promise<PatientTestSummary> => {
//     const baseUrl = `/${labId}/patient/${patientId}/test-summary`;
//     const url = buildUrlWithDates(baseUrl, startDate, endDate);

//     try {
//         const response = await statsApi.get<{ data: PatientTestSummary; message: string; status: string }>(url);
//         return response.data.data;
//     } catch (error: unknown) {
//         throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching patient test summary.'));
//     }
// }

// /**
//  * Get total tests count with optional date filtering
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @returns Promise with total tests count
//  */
// export const getTotalTests = async (
//     startDate?: string,
//     endDate?: string
// ): Promise<{ totalTests: number }> => {
//     const baseUrl = `/total-tests`;
//     const url = buildUrlWithDates(baseUrl, startDate, endDate);

//     try {
//         const response = await statsApi.get<{ data: { totalTests: number }; message: string; status: string }>(url);
//         return response.data.data;
//     } catch (error: unknown) {
//         throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching total tests.'));
//     }
// }

// /**
//  * Get total revenue with optional date filtering
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @returns Promise with total revenue
//  */
// export const getTotalRevenue = async (
//     startDate?: string,
//     endDate?: string
// ): Promise<{ totalRevenue: number }> => {
//     const baseUrl = `/total-revenue`;
//     const url = buildUrlWithDates(baseUrl, startDate, endDate);

//     try {
//         const response = await statsApi.get<{ data: { totalRevenue: number }; message: string; status: string }>(url);
//         return response.data.data;
//     } catch (error: unknown) {
//         throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching total revenue.'));
//     }
// }

// /**
//  * Get reports generated count with optional date filtering
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @returns Promise with reports generated count
//  */
// export const getReportsGenerated = async (
//     startDate?: string,
//     endDate?: string
// ): Promise<{ reportsGenerated: number }> => {
//     const baseUrl = `/reports-generated`;
//     const url = buildUrlWithDates(baseUrl, startDate, endDate);

//     try {
//         const response = await statsApi.get<{ data: { reportsGenerated: number }; message: string; status: string }>(url);
//         return response.data.data;
//     } catch (error: unknown) {
//         throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching reports generated.'));
//     }
// }

// /**
//  * Get pending samples count with optional date filtering
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @returns Promise with pending samples count
//  */
// export const getPendingSamples = async (
//     startDate?: string,
//     endDate?: string
// ): Promise<{ pendingSamples: number }> => {
//     const baseUrl = `/pending-samples`;
//     const url = buildUrlWithDates(baseUrl, startDate, endDate);

//     try {
//         const response = await statsApi.get<{ data: { pendingSamples: number }; message: string; status: string }>(url);
//         return response.data.data;
//     } catch (error: unknown) {
//         throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching pending samples.'));
//     }
// }

// /**
//  * Get tests by category with optional date filtering
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @returns Promise with tests by category
//  */
// export const getTestsByCategory = async (
//     startDate?: string,
//     endDate?: string
// ): Promise<{
//     summary: {
//         totalTests: number;
//         totalRevenue: number;
//         totalPaid: number;
//         totalDue: number;
//     };
//     categories: Array<{
//         category: string;
//         testCount: number;
//         revenue: number;
//         discount: number;
//         paidRevenue: number;
//         dueRevenue: number;
//         cashRevenue: number;
//         upiRevenue: number;
//         cardRevenue: number;
//     }>;
// }> => {
//     const baseUrl = `/tests-by-category`;
//     const url = buildUrlWithDates(baseUrl, startDate, endDate);

//     try {
//         const response = await statsApi.get<{
//             data: {
//                 summary: {
//                     totalTests: number;
//                     totalRevenue: number;
//                     totalPaid: number;
//                     totalDue: number;
//                 };
//                 categories: Array<{
//                     category: string;
//                     testCount: number;
//                     revenue: number;
//                     discount: number;
//                     paidRevenue: number;
//                     dueRevenue: number;
//                     cashRevenue: number;
//                     upiRevenue: number;
//                     cardRevenue: number;
//                 }>;
//             };
//             message: string;
//             status: string
//         }>(url);
//         return response.data.data;
//     } catch (error: unknown) {
//         throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching tests by category.'));
//     }
// }

// /**
//  * Get revenue trend with date filtering
//  * @param startDate - Start date (YYYY-MM-DD) - Required
//  * @param endDate - End date (YYYY-MM-DD) - Required
//  * @returns Promise with revenue trend data
//  */
// export const getRevenueTrend = async (
//     startDate: string,
//     endDate: string
// ): Promise<{ totalRevenue: number; trend: Array<{ date: string; revenue: number }> }> => {
//     const baseUrl = `/revenue-trend`;
//     const url = buildUrlWithDates(baseUrl, startDate, endDate);

//     try {
//         const response = await statsApi.get<{
//             data: { totalRevenue: number; trend: Array<{ date: string; revenue: number }> };
//             message: string;
//             status: string
//         }>(url);
//         return response.data.data;
//     } catch (error: unknown) {
//         throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching revenue trend.'));
//     }
// }

// /**
//  * Get revenue by lab with optional date filtering
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @returns Promise with revenue by lab
//  */
// export const getRevenueByLab = async (
//     startDate?: string,
//     endDate?: string
// ): Promise<Array<{ labId: number; labName: string; revenue: number }>> => {
//     const baseUrl = `/revenue-by-lab`;
//     const url = buildUrlWithDates(baseUrl, startDate, endDate);

//     try {
//         const response = await statsApi.get<{
//             data: Array<{ labId: number; labName: string; revenue: number }>;
//             message: string;
//             status: string
//         }>(url);
//         return response.data.data;
//     } catch (error: unknown) {
//         throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching revenue by lab.'));
//     }
// }

// /**
//  * Get lab performance summary with optional date filtering
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @param limit - Number of labs to return (default: 10)
//  * @returns Promise with lab performance summary
//  */
// export const getLabPerformance = async (
//     startDate?: string,
//     endDate?: string,
//     limit: number = 10
// ): Promise<Array<{
//     rank: number;
//     labId: number;
//     labName: string;
//     revenue: number;
//     tests: number;
//     patients: number;
//     pendingSamples: number;
//     avgTatHours: number;
//     reportsGenerated: number;
//     growthPct: number | null;
// }>> => {
//     const baseUrl = `/lab-performance`;
//     const params = new URLSearchParams();
//     if (startDate) params.append('startDate', startDate);
//     if (endDate) params.append('endDate', endDate);
//     params.append('limit', limit.toString());

//     const queryString = params.toString();
//     const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

//     try {
//         const response = await statsApi.get<{
//             data: Array<{
//                 rank: number;
//                 labId: number;
//                 labName: string;
//                 revenue: number;
//                 tests: number;
//                 patients: number;
//                 pendingSamples: number;
//                 avgTatHours: number;
//                 reportsGenerated: number;
//                 growthPct: number | null;
//             }>;
//             message: string;
//             status: string
//         }>(url);
//         return response.data.data;
//     } catch (error: unknown) {
//         throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching lab performance.'));
//     }
// }

// /**
//  * Get top referring doctors with optional date filtering
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @param limit - Number of doctors to return (default: 10)
//  * @returns Promise with top referring doctors
//  */
// export const getTopReferringDoctors = async (
//     startDate?: string,
//     endDate?: string,
//     limit: number = 10
// ): Promise<Array<{
//     doctorId: number;
//     doctorName: string;
//     referralCount: number;
//     revenue: number;
// }>> => {
//     const baseUrl = `/top-referring-doctors`;
//     const params = new URLSearchParams();
//     if (startDate) params.append('startDate', startDate);
//     if (endDate) params.append('endDate', endDate);
//     params.append('limit', limit.toString());

//     const queryString = params.toString();
//     const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

//     try {
//         const response = await statsApi.get<{
//             data: Array<{
//                 doctorId: number;
//                 doctorName: string;
//                 referralCount: number;
//                 revenue: number;
//             }>;
//             message: string;
//             status: string
//         }>(url);
//         return response.data.data;
//     } catch (error: unknown) {
//         throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching top referring doctors.'));
//     }
// }

// /**
//  * Get packages summary with optional date filtering
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @returns Promise with packages summary
//  */
// export const getPackagesSummary = async (
//   startDate?: string,
//   endDate?: string
// ): Promise<{
//   summary: {
//     totalPackages: number;
//     totalVisits: number;
//     totalRevenue: number;
//     totalDiscount: number;
//     totalPaid: number;
//     totalDue: number;
//     totalCash: number;
//     totalUpi: number;
//     totalCard: number;
//   };
//   packages: Array<{
//     packageId: number;
//     packageName: string;
//     packageCode: string;
//     revenue: number;
//     discount: number;
//     visitCount: number;
//     paidRevenue: number;
//     dueRevenue: number;
//     cashRevenue: number;
//     upiRevenue: number;
//     cardRevenue: number;
//   }>;
// }> => {
//   // Ensure dates are properly formatted and validated
//   const params = new URLSearchParams();
  
//   if (startDate) {
//     // Validate date format and ensure it's a valid date
//     const parsedStart = new Date(startDate);
//     if (!isNaN(parsedStart.getTime())) {
//       params.append('startDate', startDate);
//     }
//   }
  
//   if (endDate) {
//     const parsedEnd = new Date(endDate);
//     if (!isNaN(parsedEnd.getTime())) {
//       params.append('endDate', endDate);
//     }
//   }

//   const queryString = params.toString();
//   const url = `/packages-summary${queryString ? `?${queryString}` : ''}`;

//   try {
//     const response = await statsApi.get<{
//       data: {
//         summary: {
//           totalPackages: number;
//           totalVisits: number;
//           totalRevenue: number;
//           totalDiscount: number;
//           totalPaid: number;
//           totalDue: number;
//           totalCash: number;
//           totalUpi: number;
//           totalCard: number;
//         };
//         packages: Array<{
//           packageId: number;
//           packageName: string;
//           packageCode: string;
//           revenue: number;
//           discount: number;
//           visitCount: number;
//           paidRevenue: number;
//           dueRevenue: number;
//           cashRevenue: number;
//           upiRevenue: number;
//           cardRevenue: number;
//         }>;
//       };
//       message: string;
//       status: string;
//     }>(url);
    
//     return response.data.data;
//   } catch (error: unknown) {
//     throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching packages summary.'));
//   }
// };

// /**
//  * Get earnings by category with optional date filtering
//  * @param startDate - Optional start date (YYYY-MM-DD)
//  * @param endDate - Optional end date (YYYY-MM-DD)
//  * @returns Promise with earnings by category data
//  */
// export const getEarningsByCategory = async (
//   startDate?: string,
//   endDate?: string
// ): Promise<{
//   summary: {
//     totalCategories: number;
//     totalTests: number;
//     totalEarnings: number;
//     totalPaid: number;
//     totalDue: number;
//   };
//   categories: Array<{
//     category: string;
//     totalTests: number;
//     totalEarnings: number;
//     paidAmount: number;
//     dueAmount: number;
//     tests: Array<{
//       testId: number;
//       testName: string;
//       testCode: string;
//       price: number;
//       orderedCount: number;
//       totalEarnings: number;
//       paidAmount: number;
//       dueAmount: number;
//     }>;
//   }>;
// }> => {
//   const baseUrl = `/earnings-by-category`;
//   const url = buildUrlWithDates(baseUrl, startDate, endDate);

//   try {
//     const response = await statsApi.get<{
//       data: {
//         summary: {
//           totalCategories: number;
//           totalTests: number;
//           totalEarnings: number;
//           totalPaid: number;
//           totalDue: number;
//         };
//         categories: Array<{
//           category: string;
//           totalTests: number;
//           totalEarnings: number;
//           paidAmount: number;
//           dueAmount: number;
//           tests: Array<{
//             testId: number;
//             testName: string;
//             testCode: string;
//             price: number;
//             orderedCount: number;
//             totalEarnings: number;
//             paidAmount: number;
//             dueAmount: number;
//           }>;
//         }>;
//       };
//       message: string;
//       status: string;
//     }>(url);
//     return response.data.data;
//   } catch (error: unknown) {
//     throw new Error(extractErrorMessage(url, error, 'An error occurred while fetching earnings by category.'));
//   }
// };