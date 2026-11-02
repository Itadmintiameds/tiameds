import api from '@/utils/api';
import {
  LabCertificateRequest,
  LabDetailsResponse,
  LabDetailsUpdatePayload,
  LabRequestSubmitResult,
  LabRequestSummary,
  ProfileData,
  ProfileUpdatePayload,
  ProfileUser,
} from '@/types/profile';

// The shared api client defaults to JSON, which would serialise FormData; force multipart for uploads.
const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

interface ApiEnvelope<T> {
  data: T;
  message: string;
  status: string;
}

// Profile (user + every lab the user belongs to, or just labId when given)
export const getProfile = async (labId?: number): Promise<ProfileData> => {
  try {
    const response = await api.get<ApiEnvelope<ProfileData>>('lab/admin/profile', {
      params: labId ? { labId } : undefined,
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to load profile.');
  }
};

// Edit own personal details; only the fields sent are changed
export const updateMyDetails = async (payload: ProfileUpdatePayload): Promise<ProfileUser> => {
  try {
    const response = await api.put<ApiEnvelope<ProfileUser>>('lab/admin/me', payload);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update details.');
  }
};

// Edit organization / lab details. Applied immediately (no approval); only the fields sent change.
// Issuing / expiry dates are rejected here: they change through an approved certificate request.
export const updateLabDetails = async (labId: number, payload: LabDetailsUpdatePayload): Promise<LabDetailsResponse> => {
  try {
    const response = await api.put<ApiEnvelope<LabDetailsResponse>>(`lab/admin/${labId}/onboarding-details`, payload);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update lab details.');
  }
};

// Logo has no approval step: POST when none exists yet, PUT to replace the existing one.
export const saveLabLogo = async (labId: number, file: File, replace: boolean): Promise<Record<string, string | null>> => {
  const formData = new FormData();
  formData.append('labLogo', file);
  try {
    const response = replace
      ? await api.put<ApiEnvelope<Record<string, string | null>>>(`lab/admin/${labId}/documents`, formData, multipart)
      : await api.post<ApiEnvelope<Record<string, string | null>>>(`lab/admin/${labId}/documents`, formData, multipart);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to upload logo.');
  }
};

// Certificates go through platform-admin approval: this creates a PENDING request and the live certificate
// stays unchanged until it is approved. Dates apply to establishmentRegistrationCertificate only.
export const submitCertificateRequest = async (
  labId: number,
  data: { type: string; file: File; issuingDate?: string; expiryDate?: string },
): Promise<LabCertificateRequest> => {
  const formData = new FormData();
  formData.append('type', data.type);
  formData.append('file', data.file);
  if (data.issuingDate) formData.append('issuingDate', data.issuingDate);
  if (data.expiryDate) formData.append('expiryDate', data.expiryDate);
  try {
    const response = await api.post<ApiEnvelope<LabCertificateRequest>>(`lab/admin/${labId}/certificate-requests`, formData, multipart);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to submit certificate request.');
  }
};

// Request a new lab. Nothing is created yet: the backend stores it as PENDING and the lab (and its membership)
// are created only when a platform admin approves it.
export const submitLabRequest = async (payload: Record<string, unknown>): Promise<LabRequestSubmitResult> => {
  try {
    const response = await api.post<ApiEnvelope<LabRequestSubmitResult>>('lab/admin/add-lab', payload);
    return { ...response.data.data, message: response.data.message };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to submit the lab request.');
  }
};

// The current user's lab requests (pending, approved, rejected with reason), newest first
export const getMyLabRequests = async (): Promise<LabRequestSummary[]> => {
  try {
    const response = await api.get<ApiEnvelope<LabRequestSummary[]>>('lab/admin/lab-requests');
    return response.data.data ?? [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to load lab requests.');
  }
};
