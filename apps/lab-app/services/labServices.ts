import api from '@/utils/api';

import { LabResponse ,LabNewResponse} from '@/types/Lab';
import { LabFormDataNew } from '@/types/LabFormData';
import { toast } from 'react-toastify';

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
    // const response = await api.get<{ data: LabResponse[]; message: string; status: string }>('lab-for-all/get-user-labs');
    return response.data.data; // Extract the labs array from the response
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred while fetching labs.';
    toast.error(message);
    throw new Error(message);
  }
}

export const createLab = async (formData: LabFormDataNew): Promise<LabResponse> => {
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

export const getLabList = async (): Promise<LabResponse[]> => {
  try {
    const response = await api.get<{ data: LabResponse[]; message: string; status: string }>('lab/admin/get-labs');
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred while fetching labs.';
    toast.error(message);
    throw new Error(message);
  }
}


export const getLabById = async (labId: string): Promise<LabNewResponse> => {
  try {
    // const response = await api.get<{ data: LabResponse; message: string; status: string }>(`lab/admin/get-lab/${labId}`);4
    const response = await api.get<{ data: LabNewResponse; message: string; status: string }>(`lab/admin/get-lab/${labId}`);
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred while fetching the lab.';
    toast.error(message);
    throw new Error(message);
  }
}

export const updateLabById = async (labId: number | string, payload: Partial<LabNewResponse>): Promise<LabNewResponse> => {
  try {
    const response = await api.put<{ data: LabNewResponse; message: string; status: string }>(
      `lab/admin/update-lab-by-id/${labId}`,
      payload
    );
    toast.success(response.data.message);
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred while updating the lab.';
    toast.error(message);
    throw new Error(message);
  }
}

export const getLabLogoUploadUrl = async (
  labId: number | string,
  fileName: string,
  fileType: string
): Promise<{ uploadUrl: string; fileUrl: string }> => {
  try {
    const response = await api.post<{ data: { uploadUrl: string; fileUrl: string }; message: string; status: string }>(
      `lab/admin/lab-logo/upload-url`,
      { labId, fileName, fileType }
    );
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred while generating upload URL.';
    toast.error(message);
    throw new Error(message);
  }
}

