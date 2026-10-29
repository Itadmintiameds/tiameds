import api from '@/utils/api';
import {
  EmailRequestDTO,
  EmailRequestResponse,
  VerificationResponseDTO,
  VerificationErrorResponse,
  OnboardingRequestDTO,
  OnboardingResponseDTO,
  OnboardingDocumentType,
  DocumentUploadResponse,
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

// Upload one certificate before onboarding is submitted. The lab does not exist yet, so the
// backend stores the file and returns its URL, which is sent later in /complete.
export const uploadOnboardingDocument = async (
  type: OnboardingDocumentType,
  file: File
): Promise<string> => {
  try {
    const body = new FormData();
    body.append(type, file);
    const response = await api.post<DocumentUploadResponse>('/public/onboarding/documents', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const url = response.data.data?.[type];
    if (!url) throw new Error('Upload did not return a file link. Please try again.');
    return url;
  } catch (error: any) {
    if (error.response?.status === 429) {
      throw new Error('Too many uploads. Please try again later.');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload document.');
  }
};

// Complete onboarding (JSON). Certificates are referenced by the URLs from uploadOnboardingDocument.
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

