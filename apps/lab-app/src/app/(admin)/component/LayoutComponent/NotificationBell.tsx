"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiClipboard,
  FiInfo,
  FiXCircle,
} from "react-icons/fi";
import type { AppNotification, NotificationType } from "./notificationTypes";

export type { AppNotification, NotificationType };

interface NotificationBellProps {
  notifications?: AppNotification[];
  /** Called when a notification is clicked (e.g. to open the approval pop-up). */
  onSelect?: (notification: AppNotification) => void;
  onMarkAllRead?: () => void;
}

// Colors come from the global theme tokens in globals.css.
// Note: in this palette `warning-*` is red and `danger-*` is yellow.
const typeStyles: Record<NotificationType, { icon: React.ReactNode; bg: string }> = {
  info: { icon: <FiInfo className="h-4 w-4 text-info-500" />, bg: "bg-info-50" },
  warning: { icon: <FiAlertTriangle className="h-4 w-4 text-danger-700" />, bg: "bg-danger-50" },
  alert: { icon: <FiXCircle className="h-4 w-4 text-warning-600" />, bg: "bg-warning-50" },
  approval: { icon: <FiClipboard className="h-4 w-4 text-primary-700" />, bg: "bg-primary-100" },
  approved: { icon: <FiCheckCircle className="h-4 w-4 text-success-700" />, bg: "bg-success-50" },
  rejected: { icon: <FiXCircle className="h-4 w-4 text-warning-600" />, bg: "bg-warning-50" },
};

const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (isNaN(diff) || diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications = [],
  onSelect,
  onMarkAllRead,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-md text-pneutral-700 hover:bg-pneutral-100 transition-colors"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <FiBell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-warning-500 text-base-white font-heading font-semibold text-p1">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-modal absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-base-white rounded-md shadow-lg border border-pneutral-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-pneutral-100">
            <h2 className="font-heading text-label-l3 font-semibold text-pneutral-900">
              Notifications
            </h2>
            {unread > 0 && onMarkAllRead && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="flex items-center gap-1 text-p2 text-primary-700 hover:text-primary-900"
              >
                <FiCheck className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-p3 text-pneutral-500">
                You&apos;re all caught up
              </div>
            ) : (
              <ul className="divide-y divide-pneutral-100">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect?.(n);
                        // Approval items open a pop-up, so get the dropdown out of the way.
                        if (n.approvalId) setOpen(false);
                      }}
                      className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-pneutral-50 transition-colors ${
                        n.read ? "" : "bg-primary-100/40"
                      }`}
                    >
                      <span
                        className={`mt-0.5 h-8 w-8 shrink-0 flex items-center justify-center rounded-full ${typeStyles[n.type].bg}`}
                      >
                        {typeStyles[n.type].icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span
                            className={`text-p3 truncate ${
                              n.read
                                ? "text-pneutral-700"
                                : "font-semibold text-pneutral-900"
                            }`}
                          >
                            {n.title}
                          </span>
                          {!n.read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-primary-600" />
                          )}
                        </span>
                        <span className="block text-p2 text-pneutral-600 mt-0.5 line-clamp-2">
                          {n.message}
                        </span>
                        <span className="block text-p2 text-pneutral-400 mt-1">
                          {timeAgo(n.createdAt)}
                          {n.type === "approval" && !n.read && (
                            <span className="ml-2 font-semibold text-primary-700">
                              Tap to review
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
