import api from '@/utils/api';

// Mirrors the backend NotificationDTO (tiameds.notification.dto.NotificationDTO).
export type NotificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Latest visit of the patient (backend VisitDTO; visitCode is only present if the backend sends it). */
export interface VisitSnapshot {
  visitId?: number;
  visitCode?: string | null;
  visitDate?: string | null;
  visitType?: string | null;
}

export interface PatientSnapshot {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  bloodGroup?: string | null;
  dateOfBirth?: string | null;
  age?: string | null;
  gender?: string | null;
  visit?: VisitSnapshot | null;
}

export interface ApiNotification {
  id: number;
  labId: number;
  type: 'PATIENT_EDIT_REQUEST';
  entityType?: string;
  entityId?: number;
  visitId?: number;
  visitCode?: string;
  title: string;
  message?: string;
  status: NotificationStatus;
  requestedByUserId?: number;
  requestedByUsername?: string;
  reviewedByUserId?: number;
  reviewedByUsername?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  approvalReason?: string;
  createdAt: string;
  // Detail endpoint only
  currentPatient?: PatientSnapshot;
  proposedPatient?: PatientSnapshot;
  changedFields?: string[];
}

interface ApiEnvelope<T> {
  status: string;
  message: string;
  data: T;
}

const errorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || fallback;

/** Admin: every request of the lab, newest first. */
export const getLabNotifications = async (
  labId: number,
  status?: NotificationStatus
): Promise<ApiNotification[]> => {
  try {
    const response = await api.get<ApiEnvelope<ApiNotification[]>>(`notifications/lab/${labId}`, {
      params: status ? { status } : undefined,
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(errorMessage(error, 'Failed to fetch notifications.'));
  }
};

/** Any lab member: the requests they raised themselves (with status and rejection reason). */
export const getMyRequests = async (labId: number): Promise<ApiNotification[]> => {
  try {
    const response = await api.get<ApiEnvelope<ApiNotification[]>>(
      `notifications/lab/${labId}/my-requests`
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(errorMessage(error, 'Failed to fetch your requests.'));
  }
};

/** Detail with the current and the proposed patient values. Admins or the requester. */
export const getNotificationDetail = async (
  labId: number,
  notificationId: number
): Promise<ApiNotification> => {
  try {
    const response = await api.get<ApiEnvelope<ApiNotification>>(
      `notifications/lab/${labId}/${notificationId}`
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(errorMessage(error, 'Failed to load the request.'));
  }
};

/** Admin: applies the proposed patient changes and marks the request APPROVED. A reason is required. */
export const approveNotification = async (
  labId: number,
  notificationId: number,
  reason: string
): Promise<ApiNotification> => {
  try {
    const response = await api.put<ApiEnvelope<ApiNotification>>(
      `notifications/lab/${labId}/${notificationId}/approve`,
      { reason }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(errorMessage(error, 'Failed to approve the request.'));
  }
};

/** Admin: leaves the patient unchanged. The backend requires a reason. */
export const rejectNotification = async (
  labId: number,
  notificationId: number,
  reason: string
): Promise<ApiNotification> => {
  try {
    const response = await api.put<ApiEnvelope<ApiNotification>>(
      `notifications/lab/${labId}/${notificationId}/reject`,
      { reason }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(errorMessage(error, 'Failed to reject the request.'));
  }
};

/**
 * Non-admin patient edits are not applied: the backend answers 202 with the PENDING notification
 * as `data` (instead of the updated patient). Callers use this to tell the two cases apart.
 */
export const isPendingApproval = (response: any): boolean =>
  response?.data?.type === 'PATIENT_EDIT_REQUEST' && response?.data?.status === 'PENDING';
