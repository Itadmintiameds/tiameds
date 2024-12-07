import api from '@/utils/api';
import { LoginRequest, LoginResponse ,ErrorResponse } from '@/types/auth';

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/public/login', data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred during login.';
    throw new Error(message);
  }
};






