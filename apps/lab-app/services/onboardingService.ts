import api from '@/utils/api';
import {
  EmailRequestDTO,
  EmailRequestResponse,
  VerificationResponseDTO,
  VerificationErrorResponse,
  OnboardingRequestDTO,
  OnboardingResponseDTO,
} from '@/types/onboarding/onboarding';

// Request verification email
export const requestVerificationEmail = async (
  data: EmailRequestDTO
): Promise<EmailRequestResponse> => {
  try {
    const response = await api.post<EmailRequestResponse>(
      '/public/onboarding/request-verification',
      data
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred while requesting verification email.';
    throw new Error(message);
  }
};

// Resend verification email
export const resendVerificationEmail = async (
  data: EmailRequestDTO
): Promise<EmailRequestResponse> => {
  try {
    const response = await api.post<EmailRequestResponse>(
      '/public/onboarding/resend-verification',
      data
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred while resending verification email.';
    throw new Error(message);
  }
};

// Verify email token
export const verifyEmailToken = async (
  token: string
): Promise<VerificationResponseDTO> => {
  try {
    const response = await api.get<VerificationResponseDTO>(
      `/public/onboarding/verify-email?token=${encodeURIComponent(token)}`
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Invalid or expired verification token.';
    throw new Error(message);
  }
};

// Complete onboarding
export const completeOnboarding = async (
  data: OnboardingRequestDTO
): Promise<OnboardingResponseDTO> => {
  try {
    const response = await api.post<OnboardingResponseDTO>(
      '/public/onboarding/complete',
      data
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred while completing onboarding.';
    throw new Error(message);
  }
};

