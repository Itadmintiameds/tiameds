"use client";

import { useEffect, useState } from "react";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  ApiNotification,
  NotificationStatus,
  approveAsSuperAdmin,
  approveNotification,
  getNotificationDetail,
  getSuperAdminNotificationDetail,
  rejectAsSuperAdmin,
  rejectNotification,
} from "../../../../../services/notificationServices";
import NewModal from "../../dashboard/newcommoncomponent/NewModal";

interface CatalogChangeReviewModalProps {
  labId: number;
  labName?: string;
  requestId: number;
  /** True when this request is decided through the super-admin endpoints (an ADMIN's change). */
  asSuperAdmin: boolean;
  /** True when the signed-in user may approve / reject (otherwise the pop-up is read-only). */
  canDecide: boolean;
  /** Called after an approve / reject so the bell can refresh. */
  onDecided: () => void;
  onClose: () => void;
}

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

const statusStyle: Record<NotificationStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", cls: "bg-danger-50 text-danger-800", icon: <FiClock className="h-3.5 w-3.5" /> },
  APPROVED: { label: "Approved", cls: "bg-success-50 text-success-800", icon: <FiCheckCircle className="h-3.5 w-3.5" /> },
  REJECTED: { label: "Rejected", cls: "bg-warning-50 text-warning-700", icon: <FiXCircle className="h-3.5 w-3.5" /> },
  ACKNOWLEDGED: { label: "Acknowledged", cls: "bg-success-50 text-success-800", icon: <FiCheckCircle className="h-3.5 w-3.5" /> },
};

const OPERATION: Record<string, string> = {
  ADD: "Add",
  UPDATE: "Update",
  DELETE: "Disable",
  ACTIVATE: "Enable",
  DELETE_ALL: "Delete all",
};

/** Fields that are bookkeeping, not something a reviewer needs to judge. */
const HIDDEN_FIELDS = new Set(["id", "labId", "createdAt", "updatedAt", "createdBy", "updatedBy"]);

const humanize = (key: string) => {
  const words = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const show = (key: string, value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") {
    return /active|enabled|enable/i.test(key) ? (value ? "Enabled" : "Disabled") : value ? "Yes" : "No";
  }
  if (Array.isArray(value)) return value.length ? value.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v))).join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

interface Row {
  field: string;
  current: string;
  requested: string;
}

/**
 * Field-by-field view of what was asked for:
 *  - UPDATE of a test: only fields that differ from the current test (backend sends currentValue).
 *  - ADD / UPDATE without a known current value: every field that was sent.
 *  - DELETE of a test: the current values being removed.
 */
const buildRows = (d: ApiNotification): Row[] => {
  const change = d.proposedChange;
  if (!change) return [];
  const body = (change.body ?? {}) as Record<string, unknown>;
  const current = (d.currentValue ?? null) as Record<string, unknown> | null;
  const keys = (obj: Record<string, unknown>) => Object.keys(obj).filter((k) => !HIDDEN_FIELDS.has(k));

  // Disabling / enabling a test: the status flips, the rest is shown for context.
  if ((change.operation === "DELETE" || change.operation === "ACTIVATE") && current) {
    const enabling = change.operation === "ACTIVATE";
    const rest = keys(current)
      .filter((k) => !/^(active|isActive|enabled)$/i.test(k) && show(k, current[k]) !== "—")
      .map((k) => ({ field: humanize(k), current: show(k, current[k]), requested: show(k, current[k]) }));
    return [
      { field: "Status", current: enabling ? "Disabled" : "Enabled", requested: enabling ? "Enabled" : "Disabled" },
      ...rest,
    ];
  }
  if (current) {
    return keys(body)
      .filter((k) => show(k, body[k]) !== show(k, current[k]))
      .map((k) => ({ field: humanize(k), current: show(k, current[k]), requested: show(k, body[k]) }));
  }
  return keys(body)
    .filter((k) => show(k, body[k]) !== "—")
    .map((k) => ({ field: humanize(k), current: "—", requested: show(k, body[k]) }));
};

const Th: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <th scope="row" className={`bg-pneutral-50 px-3 py-2 text-left align-top font-semibold text-pneutral-700 ${className}`}>
    {children}
  </th>
);

const Td: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <td className={`px-3 py-2 text-left align-top text-pneutral-900 break-words ${className}`}>{children}</td>
);

const CatalogChangeReviewModal: React.FC<CatalogChangeReviewModalProps> = ({
  labId,
  labName,
  requestId,
  asSuperAdmin,
  canDecide: mayDecide,
  onDecided,
  onClose,
}) => {
  const [detail, setDetail] = useState<ApiNotification | null>(null);
  const [loadError, setLoadError] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (asSuperAdmin ? getSuperAdminNotificationDetail(requestId) : getNotificationDetail(labId, requestId))
      .then((d) => !cancelled && setDetail(d))
      .catch((e: Error) => !cancelled && setLoadError(e.message));
    return () => {
      cancelled = true;
    };
  }, [asSuperAdmin, labId, requestId]);

  const canDecide = mayDecide && detail?.status === "PENDING";

  const decide = async (decision: "approve" | "reject") => {
    if (!detail) return;
    if (!reason.trim()) {
      setError(`A comment is required to ${decision} this request.`);
      return;
    }
    setSubmitting(true);
    try {
      if (decision === "approve") {
        await (asSuperAdmin
          ? approveAsSuperAdmin(detail.id, reason.trim())
          : approveNotification(labId, detail.id, reason.trim()));
        toast.success("Request approved and applied");
      } else {
        await (asSuperAdmin
          ? rejectAsSuperAdmin(detail.id, reason.trim())
          : rejectNotification(labId, detail.id, reason.trim()));
        toast.success("Request rejected");
      }
      onDecided();
      onClose();
    } catch (e) {
      // e.g. someone else already decided it, or applying the change failed: show why and refresh
      setError((e as Error).message);
      onDecided();
      setSubmitting(false);
    }
  };

  const footer = canDecide ? (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        disabled={submitting}
        onClick={() => decide("reject")}
        className="px-4 py-2 rounded-md text-p3 font-semibold text-warning-600 border border-warning-200 hover:bg-warning-50 transition-colors disabled:opacity-50"
      >
        Reject
      </button>
      <button
        type="button"
        disabled={submitting}
        onClick={() => decide("approve")}
        className="px-4 py-2 rounded-md text-p3 font-semibold text-base-white bg-success-700 hover:bg-success-800 transition-colors disabled:opacity-50"
      >
        {submitting ? "Please wait…" : "Approve"}
      </button>
    </div>
  ) : (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-md text-p3 font-semibold text-pneutral-700 border border-pneutral-200 hover:bg-pneutral-50 transition-colors"
      >
        Close
      </button>
    </div>
  );

  const status = detail ? statusStyle[detail.status] : null;
  const change = detail?.proposedChange;
  const rows = detail ? buildRows(detail) : [];
  const isTest = detail?.type === "TEST_CHANGE_REQUEST";
  const target = detail?.proposedChange?.body as Record<string, unknown> | undefined;
  const currentName = (detail?.currentValue as Record<string, unknown> | null | undefined)?.name;
  const subject =
    (typeof currentName === "string" && currentName) ||
    (typeof target?.name === "string" && target.name) ||
    (typeof target?.testName === "string" && target.testName) ||
    (typeof target?.testReferenceCode === "string" && target.testReferenceCode) ||
    "";

  return (
    <NewModal
      isOpen
      onClose={onClose}
      title="Approval request"
      footer={footer}
      modalClassName="max-w-2xl"
      bodyClassName="overflow-x-hidden"
    >
      {loadError ? (
        <p role="alert" className="text-p3 text-warning-600">
          {loadError}
        </p>
      ) : !detail ? (
        <p className="text-p3 text-pneutral-500">Loading request…</p>
      ) : (
        <div className="space-y-5 text-p3">
          <section>
            <h3 className="mb-2 font-heading text-label-l3 font-semibold text-pneutral-800">Request</h3>
            <div className="overflow-hidden rounded-md border border-pneutral-200">
              <table className="w-full table-fixed text-p3">
                <tbody className="divide-y divide-pneutral-100">
                  <tr>
                    <Th className="w-1/3">Lab</Th>
                    <Td>{labName || `Lab #${detail.labId}`}</Td>
                  </tr>
                  <tr>
                    <Th>What</Th>
                    <Td>
                      <span className="font-semibold">
                        {OPERATION[change?.operation ?? ""] ?? change?.operation ?? "Change"}{" "}
                        {isTest ? "test" : "test reference"}
                      </span>
                      {subject && <span className="block text-pneutral-700">{subject}</span>}
                    </Td>
                  </tr>
                  <tr>
                    <Th>Requested by</Th>
                    <Td>{detail.requestedByUsername ?? "—"}</Td>
                  </tr>
                  <tr>
                    <Th>Requested on</Th>
                    <Td>{formatDate(detail.createdAt)}</Td>
                  </tr>
                  <tr>
                    <Th>Status</Th>
                    <Td>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-p2 font-semibold ${status!.cls}`}
                      >
                        {status!.icon}
                        {status!.label}
                      </span>
                    </Td>
                  </tr>
                  {(detail.status === "APPROVED" || detail.status === "REJECTED") && (
                    <>
                      <tr>
                        <Th>{detail.status === "APPROVED" ? "Approved by" : "Rejected by"}</Th>
                        <Td>
                          {detail.reviewedByUsername ?? "—"}
                          {detail.reviewedAt && (
                            <span className="block text-p2 text-pneutral-500">{formatDate(detail.reviewedAt)}</span>
                          )}
                        </Td>
                      </tr>
                      <tr>
                        <Th>Comment</Th>
                        <Td>
                          <span
                            className={`font-semibold ${
                              detail.status === "APPROVED" ? "text-success-600" : "text-warning-500"
                            }`}
                          >
                            {(detail.status === "APPROVED" ? detail.approvalReason : detail.rejectionReason) || "—"}
                          </span>
                        </Td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-2 font-heading text-label-l3 font-semibold text-pneutral-800">
              Requested changes
            </h3>
            <div className="overflow-hidden rounded-md border border-pneutral-200">
              {change?.operation === "DELETE_ALL" ? (
                <p className="px-3 py-3 text-warning-600 font-semibold">
                  Deletes ALL test references of this lab.
                </p>
              ) : (
                <table className="w-full table-fixed text-p3">
                  <thead>
                    <tr className="bg-pneutral-50">
                      <th className="w-1/3 px-3 py-2 text-left font-semibold text-pneutral-700">Field</th>
                      <th className="px-3 py-2 text-left font-semibold text-pneutral-700">Current</th>
                      <th className="px-3 py-2 text-left font-semibold text-pneutral-700">Requested</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pneutral-100">
                    {rows.map((r) => (
                      <tr key={r.field}>
                        <Th className="bg-transparent">{r.field}</Th>
                        <Td className="text-warning-500">{r.current}</Td>
                        <Td className="font-semibold text-success-600">{r.requested}</Td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-3 text-left text-pneutral-500">
                          No field-level details are available for this request.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            {detail.status === "PENDING" && (
              <p className="mt-1 text-p2 text-pneutral-500">Nothing is changed until this request is approved.</p>
            )}
          </section>

          {canDecide && (
            <section>
              <h3 className="mb-2 font-heading text-label-l3 font-semibold text-pneutral-800">
                Reasons for decision
              </h3>
              <label htmlFor="catalog-comment" className="block text-p2 text-pneutral-600 mb-1">
                Comment section <span className="text-warning-500">*</span>
              </label>
              <textarea
                id="catalog-comment"
                rows={3}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Add a comment for the requester…"
                aria-invalid={!!error}
                className={`w-full text-p3 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  error
                    ? "border-warning-400 focus:ring-warning-200"
                    : "border-pneutral-200 focus:ring-primary-300 focus:border-primary-400"
                }`}
              />
            </section>
          )}
          {error && (
            <p role="alert" className="text-p2 text-warning-600">
              {error}
            </p>
          )}
          {!canDecide && detail.status === "PENDING" && (
            <p className="text-p2 text-pneutral-500">Waiting for approval.</p>
          )}
        </div>
      )}
    </NewModal>
  );
};

export default CatalogChangeReviewModal;
