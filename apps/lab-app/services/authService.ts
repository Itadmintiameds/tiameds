import api from '@/utils/api';
import { LoginRequest, LoginResponse ,ErrorResponse,RegisterResponse } from '@/types/auth';
import {RegisterData } from '@/types/Register';     



export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/public/login', data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred during login.';
    throw new Error(message);
  }
};


export const register = async (data: RegisterData): Promise<RegisterResponse> => {      
  try {
    const response = await api.post<RegisterResponse>('/public/register', data);
    return response.data; 
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred during registration.';
    throw new Error(message);
  }
}

export const logout = async (): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred during logout.';
    throw new Error(message);
  }
}






