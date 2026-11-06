import { useCallback, useMemo, useState } from "react";
import { getMockApprovals, getMockNotifications } from "./mockNotifications";
import {
  APPROVER_ROLE,
  AppNotification,
  ApprovalDetail,
  ApprovalRequest,
  NOTIFICATION_RETENTION_DAYS,
  UserRole,
} from "./notificationTypes";

interface CenterUser {
  firstName: string;
  lastName: string;
  roles: string[];
}

/**
 * UI-only notification + approval state (mock data, nothing is persisted).
 * Replace the useState initialisers and the mutators with API calls once the backend is ready.
 */
export const useNotificationCenter = (user: CenterUser | null) => {
  const [allNotifications, setAllNotifications] = useState(getMockNotifications);
  const [approvals, setApprovals] = useState(getMockApprovals);

  const roleKey = (user?.roles ?? []).join(",");
  const roles = useMemo(() => (roleKey ? (roleKey.split(",") as UserRole[]) : []), [roleKey]);
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  // Each user only sees notifications targeted at one of their roles from the last
  // NOTIFICATION_RETENTION_DAYS days. Unread ones come first, newest on top.
  const notifications = useMemo(() => {
    const cutoff = Date.now() - NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    return allNotifications
      .filter(
        (n) =>
          new Date(n.createdAt).getTime() >= cutoff &&
          n.recipientRoles.some((r) => roles.includes(r))
      )
      .sort(
        (a, b) =>
          // Unread first, then newest first within each group.
          Number(a.read) - Number(b.read) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [allNotifications, roles]);

  const markRead = useCallback((id: AppNotification["id"]) => {
    setAllNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setAllNotifications((prev) =>
      prev.map((n) => (n.recipientRoles.some((r) => roles.includes(r)) ? { ...n, read: true } : n))
    );
  }, [roles]);

  const getApproval = useCallback(
    (id: string | undefined) => approvals.find((a) => a.id === id) ?? null,
    [approvals]
  );

  /** True when the current user is the one who has to review this request. */
  const canReview = useCallback(
    (a: ApprovalRequest) => a.status === "pending" && roles.includes(a.approverRole),
    [roles]
  );

  /** Approve / reject a request; the requester's role gets a notification with the outcome. */
  const decideApproval = useCallback(
    (id: string, decision: "approved" | "rejected", comment: string) => {
      const target = approvals.find((a) => a.id === id);
      if (!target || target.status !== "pending") return;

      const now = new Date().toISOString();
      const trimmed = comment.trim();

      setApprovals((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: decision, decidedAt: now, decidedBy: fullName, decisionComment: trimmed }
            : a
        )
      );

      setAllNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: decision === "approved" ? "Request approved" : "Request rejected",
          message:
            `Your request "${target.title}" was ${decision} by ${fullName}.` +
            (trimmed ? ` Reason: ${trimmed}` : ""),
          type: decision,
          createdAt: now,
          read: false,
          recipientRoles: [target.requestedBy.role],
          approvalId: id,
        },
        // The request notification is handled, so clear its unread state.
        ...prev.map((n) =>
          n.approvalId === id && n.type === "approval" ? { ...n, read: true } : n
        ),
      ]);
    },
    [approvals, fullName]
  );

  /**
   * Send a new approval request up the chain (Desk/Technician -> Admin, Admin -> Super Admin).
   * Returns null when the user has nobody above them (e.g. Super Admin).
   */
  const submitApprovalRequest = useCallback(
    (title: string, details: ApprovalDetail[]) => {
      const requesterRole = (["ADMIN", "TECHNICIAN", "DESKROLE"] as UserRole[]).find((r) =>
        roles.includes(r)
      );
      const approverRole = requesterRole && APPROVER_ROLE[requesterRole];
      if (!requesterRole || !approverRole) return null;

      const now = new Date().toISOString();
      const id = `ap-${Date.now()}`;
      const request: ApprovalRequest = {
        id,
        title,
        details,
        requestedBy: { name: fullName, role: requesterRole },
        approverRole,
        status: "pending",
        requestedAt: now,
      };
      setApprovals((prev) => [request, ...prev]);
      setAllNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: "Approval requested",
          message: `${fullName} is asking approval: ${title}.`,
          type: "approval",
          createdAt: now,
          read: false,
          recipientRoles: [approverRole],
          approvalId: id,
        },
        ...prev,
      ]);
      return request;
    },
    [roles, fullName]
  );

  return {
    notifications,
    markRead,
    markAllRead,
    getApproval,
    canReview,
    decideApproval,
    submitApprovalRequest,
  };
};
