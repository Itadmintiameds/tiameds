import api from '@/utils/api';

import { Patient } from '@/types/patient/patient';
import { debounce } from '@/utils/debounce';

interface ApiResponse {
    data: Patient[];
    message: string;
    status: string;
}


interface cancellationData {
    visitCancellationReason: string;
    visitCancellationDate: string;
    visitCancellationTime: string;
}

export const getAllPatientVisitsByDateRange = async (labId: number, startDate: string, endDate: string): Promise<Patient[]> => {
    try {
        const response = await api.get<ApiResponse>(`/lab/${labId}/datewise-lab-visits`, {
            params: {
                startDate,
                endDate
            }
        });
        return response.data.data || [];
    } catch (error: unknown) {
        throw new Error('An error occurred while fetching visits by date range.');
    }
}

export const getPatient = async (labId: number) => {
    try {
        const response = await api.get(`/lab/${labId}/patients`);
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while fetching patients.');
    }
}

// services/patientServices.ts
export const searchPatientByPhone = debounce(async (labId: number, phone: string) => {
    try {
        if (!phone || phone.length < 2) return []; // Don't search for very short inputs

        const response = await api.get(`/lab/${labId}/search-patient`, {
            params: { phone }
        });
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while searching for patient by phone.');
    }
}, 300); // 300ms delay

export const updatePatient = async (labId: number, patientId: number, patient: Patient) => {
    try {
        const response = await api.put(`/lab/${labId}/update-patient/${patientId}`, patient);
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while updating patient.');
    }
}

export const deletePatient = async (labId: number, patientId: number) => {
    try {
        const response = await api.delete(`/lab/${labId}/delete-patient/${patientId}`);
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while deleting patient.');
    }
}

export const getAllVisits = async (labId: number) => {
    try {
        const response = await api.get(`/lab/${labId}/visits`);
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while fetching visits.');
    }
}

// get all patient visits by  data range
// export const getAllPatientVisitsByDateRangeoflab = async (labId: number, startDate: string, endDate: string) => {
//     try {
//         const response = await api.get(`/lab/${labId}/datewise-lab-visits`, {
//             params: {
//                 startDate,
//                 endDate
//             }
//         });
//         // Ensure we always return an array, even if data is missing
//         return Array.isArray(response.data?.data) ? response.data.data : [];
//     } catch (error: unknown) {
//         throw new Error('An error occurred while fetching visits by date range.');
//     }
// }
export const getAllPatientVisitsByDateRangeoflab = async (labId: number, startDate: string, endDate: string) => {
    try {
        const response = await api.get(`/lab/${labId}/datewise-patient-visits`, {
            params: {
                startDate,
                endDate
            }
        });
        // Ensure we always return an array, even if data is missing
        return Array.isArray(response.data?.data) ? response.data.data : [];
    } catch (error: unknown) {
        throw new Error('An error occurred while fetching visits by date range.');
    }
}

export const addPatient = async (labId: number, patient: Patient) => {

    try {
        const response = await api.post(`/lab/${labId}/add-patient`, patient);
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while adding patient.');
    }
}

export const updatePatientDetails = async (labId: number, patient: Patient) => {
    try {
        const response = await api.put(`/lab/${labId}/update-patient-details/${patient.id}`, patient);
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while adding patient.');
    }
}

//get patient details by visit id
export const getPatientByVisitIdAndVisitDetails = async (labId: number, visitId: number) => {
    try {
        const response = await api.get(`/lab/${labId}/visit/${visitId}`);
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while fetching patient details.');
    }
}

export const getVisitsByPatientId = async (labId: number, patientId: number) => {
    try {
        const response = await api.get(`/lab/${labId}/patient/${patientId}/visit`);
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while fetching patient visits.');
    }
}

// getPatientById 
export const getPatientById = async (labId: number, patientId: number) => {
    try {
        const response = await api.get(`/lab/${labId}/patient/${patientId}`);
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while fetching patient details.');
    }
}

export const getVisitsByDate = async (labId: number, startDate: string, endDate: string) => {
    try {
        const response = await api.get(`/lab/${labId}/visitsdatewise`, {
            params: {
                startDate,
                endDate
            }
        });
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while fetching visits by date.');
    }
}


export const updateVisitCancellation = async (labId: number, visitId: number, cancellationData: cancellationData) => {
    try {
        const response = await api.put(`/lab/${labId}/visit/${visitId}/cancel`, cancellationData);
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while canceling patient visit.');
    }
}

// @PostMapping("/{billingId}/partial-payment")
export const makePartialPayment = async (labId: number, billingId: number, paymentData: any) => {
    try {
        const response = await api.post(`/lab/${labId}/billing/${billingId}/partial-payment`, paymentData);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            // Use backend error message if available
            const errorMessage = error.response.data.message || 
                               error.response.data.error || 
                               'Payment failed';
            throw new Error(errorMessage);
        }
        throw new Error('Network error. Please check your connection.');
    }
}

// New API endpoint for datewise transaction details
export const getDatewiseTransactionDetails = async (labId: number, startDate: string, endDate: string) => {
    try {
        
        const response = await api.get(`/lab/statistics/${labId}/datewise-transactionsdetails`, {
            params: {
                startDate,
                endDate
            }
        });
     
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching datewise transaction details:', error);
        throw new Error('An error occurred while fetching datewise transaction details.');
    }
}