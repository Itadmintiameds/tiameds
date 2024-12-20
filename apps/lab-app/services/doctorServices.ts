import api from '@/utils/api';
import { Doctor } from '@/types/doctor/doctor';

// Create Doctor
export const createDoctor = async (labId: number, DoctorData: Doctor) => {
    try {
        const response = await api.post(`/admin/lab/${labId}/doctors`, DoctorData);
        return response.data;
    } catch (error: unknown) {
        console.error('Error creating doctor:', error);
        if (error instanceof Error) {
            throw new Error(`Error creating doctor: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while creating doctor.');
        }
    }
}

// Get Doctors
export const getDoctor = async (labId: number) => {
    try {
        const response = await api.get(`/admin/lab/${labId}/doctors`);
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching doctors:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching doctors: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching doctors.');
        }
    }
};

// Update Doctor
export const updateDoctor = async (labId: number, doctorId: number, doctorData: Doctor) => {
    try {
        const response = await api.put(`/admin/lab/${labId}/doctors/${doctorId}`, doctorData);
        return response.data;
    } catch (error: unknown) {
        console.error('Error updating doctor:', error);
        if (error instanceof Error) {
            throw new Error(`Error updating doctor: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while updating doctor.');
        }
    }
};

// Delete Doctor
export const doctorDelete = async (labId: number, doctorId: number) => {
    try {
        const response = await api.delete(`/admin/lab/${labId}/doctors/${doctorId}`);
        return response.data;
    } catch (error: unknown) {
        console.error('Error deleting doctor:', error);
        if (error instanceof Error) {
            throw new Error(`Error deleting doctor: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while deleting doctor.');
        }
    }
}

// Get Doctor by ID
export const doctorGetById = async (labId: number, doctorId: number) => {
    try {
        const response = await api.get(`/admin/lab/${labId}/doctors/${doctorId}`);
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching doctor by ID:', error);
        if (error instanceof Error) {
            throw new Error(`Error fetching doctor by ID: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching doctor by ID.');
        }
    }
}
