import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiNotification,
  getLabNotifications,
  getMyRequests,
  getSuperAdminNotifications,
  isAlertType,
} from "../../../../../services/notificationServices";
import {
  AppNotification,
  NOTIFICATION_POLL_MS,
  NOTIFICATION_RETENTION_DAYS,
  REVIEWER_ROLES,
  SUPER_ADMIN_ROLES,
} from "./notificationTypes";

interface CenterUser {
  email: string;
  roles: string[];
}

const seenKey = (email: string, labId: number) => `notification-seen:${email}:${labId}`;

const loadSeen = (key: string): Set<number> => {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
};

const saveSeen = (key: string, seen: Set<number>) => {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(seen)));
  } catch {
    /* storage unavailable: unread state just won't survive a refresh */
  }
};

/** The moment that matters for a request: when it was decided, else when it was raised. */
const effectiveDate = (n: ApiNotification) => n.reviewedAt ?? n.createdAt;

/**
 * Notifications from the backend.
 *  - ADMIN / SUPERADMIN: every request of the lab. PENDING ones are unread (they need a decision).
 *  - Everyone else: the requests they raised. Once decided (approved / rejected) a request is unread
 *    until they open it. The backend has no read flag, so "seen" is kept in localStorage.
 * Only the last NOTIFICATION_RETENTION_DAYS days are shown; unread first, newest on top.
 */
export const useNotificationCenter = (user: CenterUser | null, labId: number | undefined) => {
  const [items, setItems] = useState<ApiNotification[]>([]);
  // Ids of the requests this user raised themselves (they see the decision on those).
  const [mineIds, setMineIds] = useState<Set<number>>(new Set());
  const [seen, setSeen] = useState<Set<number>>(new Set());

  const email = user?.email ?? "";
  const roleKey = (user?.roles ?? []).join(",");
  const isReviewer = useMemo(
    () => roleKey.split(",").some((r) => REVIEWER_ROLES.includes(r.toUpperCase())),
    [roleKey]
  );

  const isSuperAdmin = useMemo(
    () => roleKey.split(",").some((r) => SUPER_ADMIN_ROLES.includes(r.toUpperCase())),
    [roleKey]
  );

  const refresh = useCallback(async () => {
    if (!email) return;
    try {
      const byId = new Map<number, ApiNotification>();
      const mine = new Set<number>();
      const add = (list: ApiNotification[]) => list.forEach((n) => byId.set(n.id, n));
      // Super admins get requests / alerts across every lab, so they don't depend on the selected lab.
      if (isSuperAdmin) add(await getSuperAdminNotifications());
      if (labId) {
        if (isReviewer) add(await getLabNotifications(labId));
        // Everyone (admins too, for their own test changes) sees the decision on what they raised.
        if (!isSuperAdmin || isReviewer) {
          const own = await getMyRequests(labId);
          own.forEach((n) => mine.add(n.id));
          add(own);
        }
      }
      setItems(Array.from(byId.values()));
      setMineIds(mine);
    } catch {
      // Keep whatever we already have; the next poll will try again.
    }
  }, [labId, email, isReviewer, isSuperAdmin]);

  // Load on mount / when the lab or user changes, then poll.
  useEffect(() => {
    setItems([]);
    if (!email || (!labId && !isSuperAdmin)) return;
    if (labId) setSeen(loadSeen(seenKey(email, labId)));
    refresh();
    const timer = setInterval(refresh, NOTIFICATION_POLL_MS);
    return () => clearInterval(timer);
  }, [labId, email, isSuperAdmin, refresh]);

  /**
   * Can this user approve / reject the request?
   *  - requests meant for super admins (an ADMIN's test / test reference change): SUPERADMIN
   *  - everything else (technician / desk requests, patient edits): the lab's ADMIN
   * Patient edit requests never go to a super admin who isn't also an admin.
   */
  const canReview = useCallback(
    (n: ApiNotification) =>
      n.targetRole === "SUPERADMIN" ? isSuperAdmin && !isAlertType(n.type) : isReviewer && !isAlertType(n.type),
    [isReviewer, isSuperAdmin]
  );

  const notifications: AppNotification[] = useMemo(() => {
    const cutoff = Date.now() - NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    return items
      .filter((n) => new Date(effectiveDate(n)).getTime() >= cutoff)
      .filter((n) => {
        // Alerts (visit cancelled, test changed, ...): admins get those meant for them, super admins
        // the ones about an ADMIN's changes. The user who made the change doesn't get one.
        if (isAlertType(n.type)) {
          return n.targetRole === "SUPERADMIN" ? isSuperAdmin : isReviewer || isSuperAdmin;
        }
        return canReview(n) || mineIds.has(n.id);
      })
      .map((n): AppNotification => {
        if (isAlertType(n.type)) {
          return {
            id: n.id,
            title: n.title,
            message: n.message ?? n.title,
            type: "alert",
            createdAt: n.createdAt,
            read: n.status !== "PENDING",
            alertId: n.id,
          };
        }
        // A request I can decide: pending ones are unread. Otherwise it's my own request.
        const reviewing = canReview(n);
        const decided = n.status !== "PENDING";
        const read = reviewing ? decided : !decided || seen.has(n.id);

        let message: string;
        if (n.status === "PENDING") {
          message = reviewing ? n.message ?? "" : "Waiting for approval.";
        } else if (n.status === "APPROVED") {
          message = `Approved by ${n.reviewedByUsername ?? "a reviewer"}${
            n.approvalReason ? `. Comment: ${n.approvalReason}` : "."
          }`;
        } else {
          message = `Rejected by ${n.reviewedByUsername ?? "a reviewer"}${
            n.rejectionReason ? `. Comment: ${n.rejectionReason}` : "."
          }`;
        }

        return {
          id: n.id,
          title: n.title,
          message,
          type: n.status === "PENDING" ? "approval" : n.status === "APPROVED" ? "approved" : "rejected",
          createdAt: effectiveDate(n),
          read,
          requestId: n.id,
        };
      })
      .sort(
        (a, b) =>
          // Unread first, then newest first within each group.
          Number(a.read) - Number(b.read) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [items, seen, mineIds, canReview, isReviewer, isSuperAdmin]);

  /** Remember that the requester has looked at a decided request. */
  const markSeen = useCallback(
    (ids: number[]) => {
      if (!labId || !email || ids.length === 0) return;
      setSeen((prev) => {
        if (ids.every((id) => prev.has(id))) return prev;
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        saveSeen(seenKey(email, labId), next);
        return next;
      });
    },
    [labId, email]
  );

  const markAllRead = useCallback(() => {
    // Requests I can decide stay unread until someone decides; only decisions on my own requests clear here.
    markSeen(items.filter((n) => mineIds.has(n.id) && !canReview(n) && n.status !== "PENDING").map((n) => n.id));
  }, [items, mineIds, canReview, markSeen]);

  return {
    notifications,
    isReviewer,
    items,
    isSuperAdmin,
    canReview,
    refresh,
    markSeen,
    markAllRead,
  };
};
