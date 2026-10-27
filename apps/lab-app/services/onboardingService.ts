import api from '@/utils/api';
import {
  EmailRequestDTO,
  EmailRequestResponse,
  VerificationResponseDTO,
  VerificationErrorResponse,
  OnboardingRequestDTO,
  OnboardingFiles,
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

// Complete onboarding.
// Sent as multipart/form-data: the JSON payload goes in the `data` part and each
// certificate is its own file part (the backend must accept this shape).
export const completeOnboarding = async (
  data: OnboardingRequestDTO,
  files: OnboardingFiles
): Promise<OnboardingResponseDTO> => {
  try {
    const body = new FormData();
    body.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    Object.entries(files).forEach(([key, file]) => {
      if (file) body.append(key, file);
    });

    const response = await api.post<OnboardingResponseDTO>(
      '/public/onboarding/complete',
      body,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred while completing onboarding.';
    throw new Error(message);
  }
};

