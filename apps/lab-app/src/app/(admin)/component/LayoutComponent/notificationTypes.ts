export type UserRole = "SUPERADMIN" | "ADMIN" | "TECHNICIAN" | "DESKROLE";

export type NotificationType =
  | "info"
  | "warning"
  | "alert"
  | "approval" // an approval request waiting for the recipient
  | "approved" // result sent back to the requester
  | "rejected"; // result sent back to the requester

export interface AppNotification {
  id: string | number;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string; // ISO date string
  read: boolean;
  /** Roles that should see this notification. */
  recipientRoles: UserRole[];
  /** Set for everything related to an approval request (request + result). */
  approvalId?: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalDetail {
  label: string;
  value: string;
}

/** Notifications older than this many days are not shown. */
export const NOTIFICATION_RETENTION_DAYS = 30;

export interface ApprovalRequest {
  id: string;
  title: string;
  /** Request details, shown as a two-column table in the review pop-up. */
  details: ApprovalDetail[];
  requestedBy: { name: string; role: UserRole };
  /** Role that has to review this request. */
  approverRole: UserRole;
  status: ApprovalStatus;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  /** Comment / reason entered by the approver. */
  decisionComment?: string;
}

/** Who approves whose requests. SUPERADMIN has nobody above them. */
export const APPROVER_ROLE: Partial<Record<UserRole, UserRole>> = {
  DESKROLE: "ADMIN",
  TECHNICIAN: "ADMIN",
  ADMIN: "SUPERADMIN",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Admin",
  TECHNICIAN: "Technician",
  DESKROLE: "Desk",
};
