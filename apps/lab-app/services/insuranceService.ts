import api from '@/utils/api';

import { Insurance } from '@/types/insurance/insurance';

export const getInsurance = async (labId: number) => {
    try {
        const response = await api.get<{ status: string, message: string, data: Insurance[] }>(`/lab/admin/insurance/${labId}`);
        return response.data; // returning the whole object, which contains status, message, and data
    } catch (error: any) {
        const message = error.response?.data?.message || 'An error occurred while fetching insurance.';
        throw new Error(message);
    }
};

export const createInsurance = async (labId: number, insuranceData: Insurance) => {
    try {
        const response = await api.post(`/lab/admin/insurance/${labId}`, insuranceData);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'An error occurred while creating insurance.';
        throw new Error(message);
    }
};


export const updateInsurance = async (labId: number, insuranceId: number, insuranceData: Insurance) => {
    try {
        // lab/admin/insurance/1/insurance/2
        const response = await api.put(`/lab/admin/insurance/${labId}/insurance/${insuranceId}`, insuranceData);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'An error occurred while updating insurance.';
        throw new Error(message);
    }
};


export const deleteInsurance = async (labId: number, insuranceId: number) => {
    try {
        const response = await api.delete(`/lab/admin/insurance/${labId}/insurance/${insuranceId}`);    
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'An error occurred while deleting insurance.';
        throw new Error(message);
    }
};


export const getInsuranceById = async (labId: number, insuranceId: number) => {
    try {
        const response = await api.get<Insurance>(`/lab/admin/insurance/${labId}/insurance/${insuranceId}`);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || 'An error occurred while fetching insurance.';
        throw new Error(message);
    }
};