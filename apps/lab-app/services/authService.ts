import api from '@/utils/api';
import { LoginRequest, LoginResponse ,ErrorResponse,RegisterResponse, LoginResponseData, OtpLoginResponse, VerifyOtpRequest, VerifyOtpResponse, ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest, ResetPasswordResponse } from '@/types/auth';
import {RegisterData } from '@/types/Register';     



export const login = async (data: LoginRequest): Promise<OtpLoginResponse> => {
  try {
    const response = await api.post<OtpLoginResponse>('/auth/login', data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred during login.';
    throw new Error(message);
  }
};

export const verifyOtp = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  try {
    const response = await api.post<VerifyOtpResponse>('/auth/verify-otp', data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred during OTP verification.';
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

export const getCurrentUser = async (): Promise<LoginResponseData> => {
  try {
    const response = await api.get<{ status: string; message: string; data: LoginResponseData }>('lab/admin/me');
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch current user.';
    throw new Error(message);
  }
};

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred while requesting password reset.';
    throw new Error(message);
  }
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  try {
    const response = await api.post<ResetPasswordResponse>('/auth/reset-password', data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred while resetting password.';
    throw new Error(message);
  }
};






