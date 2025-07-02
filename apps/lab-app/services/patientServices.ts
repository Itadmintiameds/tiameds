import api from '@/utils/api';

import { Patient } from '@/types/patient/patient';

interface ApiResponse {
    data: Patient[];
    message: string;
    status: string;
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
        console.log(response.data, 'response.data');
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while fetching patients.');
    }
}

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
export const getAllPatientVisitsByDateRangeoflab = async (labId: number, startDate: string, endDate: string) => {
    try {
        const response = await api.get(`/lab/${labId}/datewise-lab-visits`, {
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
// /lab/2/add-patient
export const addPatient = async (labId: number, patient: Patient) => {
    console.log(patient, 'patient in addPatient');
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



// date wise getting patient visits details

// Example: http://localhost:8080/api/v1/lab/2/visitsdatewise?startDate=2025-05-31&endDate=2025-05-31

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