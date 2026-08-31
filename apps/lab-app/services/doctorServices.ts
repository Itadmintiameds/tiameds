import { AxiosError } from 'axios';
import api from '@/utils/api';
import { Doctor } from '@/types/doctor/doctor';

// Shared, user-facing message for the "doctor still has patient referrals" case, so the
// client-side pre-check (DoctorList) and this server-error fallback read identically.
export const DOCTOR_REFERRAL_DELETE_MESSAGE =
    'Cannot delete doctor: this doctor is still referred to one or more patients. Please reassign those patients first.';

// Create Doctor
export const createDoctor = async (labId: number, DoctorData: Doctor) => {
    try {
        const response = await api.post(`/admin/lab/${labId}/doctors`, DoctorData);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || 'Error creating doctor');
        } else if (error instanceof Error) {
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
        const axiosError = error as AxiosError<{ message?: string; error?: string }>;
        const status = axiosError.response?.status;
        const backendMessage =
            axiosError.response?.data?.message || axiosError.response?.data?.error;

        // The backend rejects deleting a still-referenced doctor. Ideally it returns a
        // 400/409 with a clear message, but today it surfaces as a bare 500 from a DB
        // foreign-key violation. Detect either shape and surface the actionable referral
        // message instead of the raw "Request failed with status code 500".
        const looksLikeReferralConstraint =
            status === 409 ||
            (status === 500 &&
                /constraint|foreign key|referenced|referential|violat/i.test(
                    `${backendMessage ?? ''} ${axiosError.message ?? ''}`
                ));
        if (looksLikeReferralConstraint) {
            throw new Error(DOCTOR_REFERRAL_DELETE_MESSAGE);
        }

        // Otherwise prefer the backend's own message (e.g. a real 400) over the opaque
        // "status code N" that axios puts on error.message.
        if (backendMessage) {
            throw new Error(backendMessage);
        }
        if (error instanceof Error) {
            throw new Error(`Error deleting doctor: ${error.message}`);
        }
        throw new Error('An unknown error occurred while deleting doctor.');
    }
}

// Get Doctor by ID
export const doctorGetById = async (labId: string, doctorId: number) => {
    try {
        const response = await api.get(`/admin/lab/${labId}/doctors/${doctorId}`);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Error fetching doctor by ID: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching doctor by ID.');
        }
    }
}
