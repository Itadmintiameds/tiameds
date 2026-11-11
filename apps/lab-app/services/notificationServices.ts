import api from '@/utils/api';

// Mirrors the backend NotificationDTO (tiameds.notification.dto.NotificationDTO).
export type NotificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACKNOWLEDGED';
export type ApiNotificationType =
  | 'PATIENT_EDIT_REQUEST'
  | 'VISIT_CANCELLED'
  | 'TEST_CHANGED'
  | 'TEST_REFERENCE_CHANGED'
  | 'TEST_CHANGE_REQUEST'
  | 'TEST_REFERENCE_CHANGE_REQUEST'
  | 'USER_ADD_REQUEST'
  | 'USER_UPDATE_REQUEST';

/** User create / add-member / update requests an ADMIN raised; a super admin decides them. */
export const isUserRequestType = (type?: string): boolean =>
  type === 'USER_ADD_REQUEST' || type === 'USER_UPDATE_REQUEST';

/**
 * Test / test reference / user changes held for approval (nothing is applied until someone approves).
 * They share one review pop-up because the backend sends them all as a CatalogChange payload.
 */
export const isCatalogRequestType = (type?: string): boolean =>
  type === 'TEST_CHANGE_REQUEST' || type === 'TEST_REFERENCE_CHANGE_REQUEST' || isUserRequestType(type);

/** What a held test / test reference change contains (backend CatalogChangePayload). */
export interface CatalogChange {
  /** ADD, UPDATE, DELETE, DELETE_ALL; for users CREATE_USER, ADD_MEMBER or UPDATE_USER */
  operation: 'ADD' | 'UPDATE' | 'DELETE' | 'DELETE_ALL' | 'CREATE_USER' | 'ADD_MEMBER' | 'UPDATE_USER' | string;
  entityId?: number | null;
  /** The request body: a TestDTO or a TestReferenceDTO (absent for DELETE / DELETE_ALL). */
  body?: Record<string, unknown> | null;
}

/** Information-only alerts: nothing to approve, they are just acknowledged. */
export const isAlertType = (type?: string): boolean =>
  type === 'VISIT_CANCELLED' || type === 'TEST_CHANGED' || type === 'TEST_REFERENCE_CHANGED';

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
  type: ApiNotificationType;
  entityType?: string;
  entityId?: number;
  visitId?: number;
  visitCode?: string;
  title: string;
  message?: string;
  /** 'SUPERADMIN' when the alert is reserved for super admins (an ADMIN changed something). */
  targetRole?: string;
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
  // Detail endpoint only, for TEST_CHANGE_REQUEST / TEST_REFERENCE_CHANGE_REQUEST
  proposedChange?: CatalogChange;
  currentValue?: Record<string, unknown> | null;
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

/** Super admin: alerts raised because an ADMIN changed tests / test references, across all labs. */
export const getSuperAdminNotifications = async (): Promise<ApiNotification[]> => {
  try {
    const response = await api.get<ApiEnvelope<ApiNotification[]>>('notifications/super-admin');
    return response.data.data;
  } catch (error: any) {
    throw new Error(errorMessage(error, 'Failed to fetch notifications.'));
  }
};

/** Super admin: detail of a request of any lab. */
export const getSuperAdminNotificationDetail = async (
  notificationId: number
): Promise<ApiNotification> => {
  try {
    const response = await api.get<ApiEnvelope<ApiNotification>>(
      `notifications/super-admin/${notificationId}`
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(errorMessage(error, 'Failed to load the request.'));
  }
};

/** Super admin: applies the held change and marks it APPROVED. A reason is required. */
export const approveAsSuperAdmin = async (
  notificationId: number,
  reason: string
): Promise<ApiNotification> => {
  try {
    const response = await api.put<ApiEnvelope<ApiNotification>>(
      `notifications/super-admin/${notificationId}/approve`,
      { reason }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(errorMessage(error, 'Failed to approve the request.'));
  }
};

/** Super admin: nothing is applied; the reason is shown to the requester. */
export const rejectAsSuperAdmin = async (
  notificationId: number,
  reason: string
): Promise<ApiNotification> => {
  try {
    const response = await api.put<ApiEnvelope<ApiNotification>>(
      `notifications/super-admin/${notificationId}/reject`,
      { reason }
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(errorMessage(error, 'Failed to reject the request.'));
  }
};

/** Super admin: acknowledge an alert of any lab. */
export const acknowledgeAsSuperAdmin = async (notificationId: number): Promise<ApiNotification> => {
  try {
    const response = await api.put<ApiEnvelope<ApiNotification>>(
      `notifications/super-admin/${notificationId}/acknowledge`
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(errorMessage(error, 'Failed to acknowledge the alert.'));
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

/** Admin: marks an information-only alert (e.g. VISIT_CANCELLED) as seen. */
export const acknowledgeNotification = async (
  labId: number,
  notificationId: number
): Promise<ApiNotification> => {
  try {
    const response = await api.put<ApiEnvelope<ApiNotification>>(
      `notifications/lab/${labId}/${notificationId}/acknowledge`
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(errorMessage(error, 'Failed to acknowledge the alert.'));
  }
};

/**
 * Non-admin patient edits are not applied: the backend answers 202 with the PENDING notification
 * as `data` (instead of the updated patient). Callers use this to tell the two cases apart.
 */
export const isPendingApproval = (response: any): boolean =>
  response?.data?.type === 'PATIENT_EDIT_REQUEST' && response?.data?.status === 'PENDING';


/**
 * An ADMIN's user create / update / add-member call is not applied: the backend answers 202 with the
 * PENDING request as `data` (instead of the user). Callers use this to tell the two cases apart.
 */
export const isUserRequestPending = (response: any): boolean =>
  isUserRequestType(response?.data?.type) && response?.data?.status === 'PENDING';
