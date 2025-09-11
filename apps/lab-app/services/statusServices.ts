
import api from '@/utils/api';
import { LabStats } from '@/types/labStatus';

export const getLabStatsData = async (labId: string, startDate: string, endDate: string): Promise<LabStats> => {
    try {
        const response = await api.get<{ data: LabStats; message: string; status: string }>(`lab/statistics/${labId}?startDate=${startDate}&endDate=${endDate}`);
        return response.data.data; // Extract the array of reports from the response
    } catch (error: unknown) {
        let errorMessage = 'An error occurred while fetching report details.';

        if (error instanceof Error) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            if (axiosError.response?.data?.message) {
                errorMessage = axiosError.response.data.message;
            } else {
                errorMessage = error.message;
            }
        }
        throw new Error(errorMessage);
    }
}

