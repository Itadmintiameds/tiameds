import api from '@/utils/api';

import { Patient } from '@/types/patient/patient';


export const billing = async (labId: number) => {
    try {
        const response = await api.get(`/lab/${labId}/billing`);
        return response.data;
    } catch (error: unknown) {
        throw new Error('An error occurred while fetching billing.');
    }
}