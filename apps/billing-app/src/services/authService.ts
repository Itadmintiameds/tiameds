import api from '../utils/api'
import { LoginRequest, LoginResponse,RegisterResponse } from '../types/auth';
import {RegisterData } from '../types/Register';     
import { AxiosError } from 'axios';

// Define the expected structure of the error response
interface ErrorResponse {
  message: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/public/login', data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>; // Type the error response to ErrorResponse

    // Safely access the message, with a fallback if it's not available
    const message = axiosError.response?.data?.message || 'An error occurred during login.';
    throw new Error(message);
  }
};


export const register = async (data: RegisterData): Promise<RegisterResponse> => {      
  try {
    const response = await api.post<RegisterResponse>('/public/register', data);
    return response.data; 
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>; // Type the error response to ErrorResponse

    const message = axiosError.response?.data?.message || 'An error occurred during registration.';
    throw new Error(message);
  }
}
