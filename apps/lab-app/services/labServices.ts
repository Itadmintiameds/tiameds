import api from '@/utils/api';

import { LabResponse} from '@/types/Lab';
import { LabFormData } from '@/types/LabFormData';
import {toast} from 'react-toastify';




export const getLabs = async (): Promise<LabResponse[]> => {
  try {
    const response = await api.get<{ data: LabResponse[]; message: string; status: string }>('lab/admin/get-labs');
    return response.data.data; // Extract the labs array from the response
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred while fetching labs.';
    toast.error(message);
    throw new Error(message);
  }
};


export const getUsersLab = async (): Promise<LabResponse[]> => {
  try {
    const response = await api.get<{ data: LabResponse[]; message: string; status: string }>('lab/admin/get-user-labs');
    return response.data.data; // Extract the labs array from the response
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred while fetching labs.';
    toast.error(message);
    throw new Error(message);
  }
}


export const createLab = async (formData: LabFormData): Promise<LabResponse> => {
  try {
    const response = await api.post<{ data: LabResponse; message: string; status: string }>('lab/admin/add-lab', formData);
    toast.success(response.data.message);
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred while creating the lab.';
    toast.error(message);
    throw new Error(message);
  }
}



