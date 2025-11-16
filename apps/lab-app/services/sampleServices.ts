import api from '@/utils/api';
import { SampleList ,Sample} from '@/types/sample/sample'; 
import { VisitSampleList ,PatientData} from '@/types/sample/sample';

interface ApiResponse<T> {
    data: T;
    message: string;
    status: string;
}

// Fetch all samples for a lab
export const getSamples = async (labId: number): Promise<SampleList[]> => {
    try {
        const response = await api.get<ApiResponse<SampleList[]>>(`/lab/${labId}/sample-list`);
        return response.data.data;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An error occurred while fetching samples.');
    }
};

// Create a new sample for a lab
export const createSample = async (labId: number, sampleData: Partial<SampleList>): Promise<SampleList> => {
    try {
        const response = await api.post<ApiResponse<SampleList>>(`/lab/${labId}/sample`, sampleData);
        return response.data.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            // Check if the error has a response with data
            const axiosError = error as { response?: { data?: { status?: string; message?: string } } };
            if (axiosError.response?.data?.status === 'error' && axiosError.response?.data?.message) {
                throw new Error(axiosError.response.data.message);
            }
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred while creating the sample.');
    }
};

// Update an existing sample for a lab
export const updateSample = async (labId: number, sampleId: number, sampleData: Partial<SampleList>): Promise<SampleList> => {
    try {
        const response = await api.put<ApiResponse<SampleList>>(`/lab/${labId}/sample/${sampleId}`, sampleData);
        return response.data.data;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An error occurred while updating the sample.');
    }
};

// Delete a sample from a lab
export const deleteSample = async (labId: number, sampleId: number): Promise<void> => {
    try {
        await api.delete<ApiResponse<null>>(`/lab/${labId}/sample/${sampleId}`);
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An error occurred while deleting the sample.');
    }
};



//==============================================================================



// /add-samples
export const addSampleToVisit = async (visitId: number, sampleNames: string[]): Promise<void> => {
    try {
        await api.post<ApiResponse<null>>(`/lab/add-samples`, {
            visitId,
            sampleNames,
        });
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An error occurred while adding sample to visit.');
    }
};


// export const getAllVisitssamples = async (labId: number): Promise<PatientData[]> => {
//     try {
//         const response = await api.get<ApiResponse<PatientData[]>>(`/lab/${labId}/get-visit-samples`);
//         return response.data.data;
//     } catch (error) {
//         throw new Error(error instanceof Error ? error.message : 'An error occurred while fetching samples.');
//     }
// };

// /lab/2/get-visit-samples?startDate=2025-04-01&endDate=2025-06-03&visitStatus=Collected

export const getAllVisitssamples = async (labId: number, startDate?: string, endDate?: string, visitStatus?: string): Promise<VisitSampleList[]> => {
    try {
        const params: { [key: string]: string | undefined } = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (visitStatus) params.visitStatus = visitStatus;

        const response = await api.get<ApiResponse<VisitSampleList[]>>(`/lab/${labId}/get-visit-samples`, { params });
        return response.data.data;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An error occurred while fetching visit samples.');
    }
}

/*  NEW API for collected completed samples */
export const getCollectedCompleted = async (labId: number, startDate: string, endDate: string): Promise<VisitSampleList[]> => {

    try {
        const params: { [key: string]: string | undefined } = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get<ApiResponse<VisitSampleList[]>>(`/lab/${labId}/patients/collected-completed`, { params });
        return response.data.data;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An error occurred while fetching collected completed samples.');
    }
}


// http://localhost:8080/api/v1/lab/1/patients/collected-completed?startDate=2025-08-22&endDate=2025-08-22



export const updateVisitSample = async (visitId: number, sampleNames: string[]): Promise<void> => {
    try {
        await api.put<ApiResponse<null>>(`/lab/update-samples`, {
            visitId,
            sampleNames,
        });
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An error occurred while updating visit samples.');
    }
}


// delete-samples
export const deleteVisitSample = async (visitId: number, sampleNames: string[]): Promise<void> => {
    try {
        await api.delete<ApiResponse<null>>(`/lab/delete-samples`, {
            data: {
                visitId,
                sampleNames,
            },
        });
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An error occurred while deleting visit samples.');
    }
}
