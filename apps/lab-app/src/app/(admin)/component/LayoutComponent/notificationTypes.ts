export type NotificationType =
  | "info"
  | "warning"
  | "alert"
  | "approval" // a request waiting for an admin
  | "approved" // a request that was approved
  | "rejected"; // a request that was rejected

/** What the bell renders. Built from the backend notifications by useNotificationCenter. */
export interface AppNotification {
  id: string | number;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string; // ISO date string
  read: boolean;
  /** Backend notification id; set for patient-edit requests, opens the review pop-up. */
  requestId?: number;
  /** Backend notification id of an information-only alert (e.g. visit cancelled); clicking acknowledges it. */
  alertId?: number;
}

/** Notifications older than this many days are not shown. */
export const NOTIFICATION_RETENTION_DAYS = 30;

/** How often the bell re-checks the backend. */
export const NOTIFICATION_POLL_MS = 60_000;

/**
 * Only the lab ADMIN receives approval requests and cancel alerts (and can approve / reject / acknowledge).
 * SUPERADMIN and TECHNICIAN don't see other people's notifications; everyone else only sees
 * the requests they raised themselves.
 */
export const REVIEWER_ROLES = ["ADMIN"];

/** Roles that receive alerts about changes made by an ADMIN (tests / test references), across all labs. */
export const SUPER_ADMIN_ROLES = ["SUPERADMIN"];
