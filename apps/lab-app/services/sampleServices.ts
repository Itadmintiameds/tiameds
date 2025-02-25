import api from '@/utils/api';
import { SampleList ,Sample} from '@/types/sample/sample'; 
import { VisitSampleList } from '@/types/sample/sample';

interface ApiResponse<T> {
    data: T;
    message: string;
    status: string;
}

// Fetch all samples
export const getSamples = async (): Promise<SampleList[]> => {
    try {
        const response = await api.get<ApiResponse<SampleList[]>>('/lab/sample-list');
        return response.data.data;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An error occurred while fetching samples.');
    }
};

export const createSample = async (sampleData: Partial<SampleList>): Promise<SampleList> => {
    try {
        const response = await api.post<ApiResponse<SampleList>>('/lab/sample', sampleData);
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


// Update an existing sample
export const updateSample = async (sampleId: number, sampleData: Partial<SampleList>): Promise<SampleList> => {
    try {
        const response = await api.put<ApiResponse<SampleList>>(`/lab/sample/${sampleId}`, sampleData);
        return response.data.data;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An error occurred while updating the sample.');
    }
};

// Delete a sample
export const deleteSample = async (sampleId: number): Promise<void> => {
    try {
        await api.delete<ApiResponse<null>>(`/lab/sample/${sampleId}`);
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


export const getAllVisitssamples = async (labId: number): Promise<VisitSampleList[]> => {
    try {
        const response = await api.get<ApiResponse<VisitSampleList[]>>(`/lab/${labId}/get-visit-samples`);
        return response.data.data;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An error occurred while fetching samples.');
    }
};


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
