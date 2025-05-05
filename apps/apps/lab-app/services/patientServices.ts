import api from '@/utils/api';

import { Patient } from '@/types/patient/patient';

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


// /lab/2/add-patient
export const addPatient = async (labId: number, patient: Patient) => {
    try {
        const response = await api.post(`/lab/${labId}/add-patient`, patient);
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
