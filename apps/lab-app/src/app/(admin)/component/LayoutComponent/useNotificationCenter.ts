import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiNotification,
  getLabNotifications,
  getMyRequests,
} from "../../../../../services/notificationServices";
import {
  AppNotification,
  NOTIFICATION_POLL_MS,
  NOTIFICATION_RETENTION_DAYS,
  REVIEWER_ROLES,
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
  const [seen, setSeen] = useState<Set<number>>(new Set());

  const email = user?.email ?? "";
  const roleKey = (user?.roles ?? []).join(",");
  const isReviewer = useMemo(
    () => roleKey.split(",").some((r) => REVIEWER_ROLES.includes(r.toUpperCase())),
    [roleKey]
  );

  const refresh = useCallback(async () => {
    if (!labId || !email) return;
    try {
      const data = isReviewer ? await getLabNotifications(labId) : await getMyRequests(labId);
      setItems(data);
    } catch {
      // Keep whatever we already have; the next poll will try again.
    }
  }, [labId, email, isReviewer]);

  // Load on mount / when the lab or user changes, then poll.
  useEffect(() => {
    setItems([]);
    if (!labId || !email) return;
    setSeen(loadSeen(seenKey(email, labId)));
    refresh();
    const timer = setInterval(refresh, NOTIFICATION_POLL_MS);
    return () => clearInterval(timer);
  }, [labId, email, refresh]);

  const notifications: AppNotification[] = useMemo(() => {
    const cutoff = Date.now() - NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    return items
      .filter((n) => new Date(effectiveDate(n)).getTime() >= cutoff)
      .map((n): AppNotification => {
        const decided = n.status !== "PENDING";
        const read = isReviewer ? decided : !decided || seen.has(n.id);

        let message: string;
        if (n.status === "PENDING") {
          message = isReviewer ? n.message ?? "" : "Waiting for admin approval.";
        } else if (n.status === "APPROVED") {
          message = `Approved by ${n.reviewedByUsername ?? "an admin"}${
            n.approvalReason ? `. Comment: ${n.approvalReason}` : "."
          }`;
        } else {
          message = `Rejected by ${n.reviewedByUsername ?? "an admin"}${
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
  }, [items, seen, isReviewer]);

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
    // Reviewers' unread items are pending requests: they only clear once someone decides.
    if (isReviewer) return;
    markSeen(items.filter((n) => n.status !== "PENDING").map((n) => n.id));
  }, [isReviewer, items, markSeen]);

  return {
    notifications,
    isReviewer,
    refresh,
    markSeen,
    markAllRead,
  };
};
