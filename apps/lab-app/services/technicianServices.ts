import api from '@/utils/api';
import { AxiosError } from 'axios';

export const getMembersOfLab = async (labId: number) => {
  try {
    const response = await api.get(`/lab/admin/get-members/${labId}`);
    return response.data;
  } catch (error) {
    return (error as AxiosError).response?.data;
  }
};