"use client";

import { useEffect, useState } from "react";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import {
  ApiNotification,
  NotificationStatus,
  approveNotification,
  getNotificationDetail,
  rejectNotification,
} from "../../../../../services/notificationServices";
import NewModal from "../../dashboard/newcommoncomponent/NewModal";

interface ApprovalReviewModalProps {
  labId: number;
  requestId: number;
  /** True when the current user is an admin who may approve / reject. */
  isReviewer: boolean;
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
};

interface ChangeRow {
  field: string;
  current: string;
  requested: string;
}

const clean = (v: string) => {
  const t = v.trim().replace(/^'(.*)'$/, "$1");
  return t === "" || t === "(empty)" ? "—" : t;
};

/**
 * The backend describes every change as text in `message`:
 *   "<user> requested changes: First name: 'A' → 'B'; Billing - Total amount: 100 → 120; Tests added: CBC"
 * (see PatientChangeDescriber). It does not send them as structured data, so we split that text
 * back into Field / Current / Requested rows.
 */
const parseChanges = (message?: string): ChangeRow[] => {
  if (!message) return [];
  const marker = "requested changes: ";
  const at = message.indexOf(marker);
  const body = at >= 0 ? message.slice(at + marker.length) : message;

  const rows: ChangeRow[] = [];
  for (const segment of body.split("; ").map((s) => s.trim()).filter(Boolean)) {
    // "Discount on CBC: amount 0 → 10, percent 0 → 5": one row per part
    const discount = segment.match(/^(Discount on .+?): (.+)$/);
    if (discount) {
      for (const part of discount[2].split(", ")) {
        const m = part.match(/^(.+?) (\S+) → (\S+)$/);
        rows.push(
          m
            ? { field: `${discount[1]} (${m[1]})`, current: clean(m[2]), requested: clean(m[3]) }
            : { field: discount[1], current: "—", requested: part }
        );
      }
      continue;
    }
    // "First name: 'A' → 'B'", "Billing - Total amount: 100 → 120"
    const arrow = segment.match(/^(.+?): (.*?) → (.*)$/);
    if (arrow) {
      rows.push({ field: arrow[1], current: clean(arrow[2]), requested: clean(arrow[3]) });
      continue;
    }
    if (segment.startsWith("Tests added: ")) {
      rows.push({ field: "Tests added", current: "—", requested: segment.slice("Tests added: ".length) });
      continue;
    }
    if (segment.startsWith("Tests removed: ")) {
      rows.push({ field: "Tests removed", current: segment.slice("Tests removed: ".length), requested: "—" });
      continue;
    }
    // "Doctor changed", "Insurance changed", "New visit added with tests: …"
    rows.push({ field: segment, current: "—", requested: "Updated" });
  }
  return rows;
};

interface DetailRow {
  label: string;
  value: string;
}

/** Backend dates are "yyyy-MM-dd"; show them as dd/mm/yyyy (string split, no timezone shift). */
const formatDmy = (iso?: string | null) => {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso || "—";
};

const chunkPairs = (rows: DetailRow[]): [DetailRow, DetailRow | undefined][] => {
  const out: [DetailRow, DetailRow | undefined][] = [];
  for (let i = 0; i < rows.length; i += 2) out.push([rows[i], rows[i + 1]]);
  return out;
};

// ---- small layout helpers so every section looks the same ----

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <h3 className="mb-2 font-heading text-label-l3 font-semibold text-pneutral-800">{title}</h3>
    {children}
  </section>
);

const Box: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="overflow-hidden rounded-md border border-pneutral-200">{children}</div>
);

const Th: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <th scope="row" className={`bg-pneutral-50 px-3 py-2 text-left align-top font-semibold text-pneutral-700 ${className}`}>
    {children}
  </th>
);

const Td: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <td className={`px-3 py-2 text-left align-top text-pneutral-900 break-words ${className}`}>{children}</td>
);

const ApprovalReviewModal: React.FC<ApprovalReviewModalProps> = ({
  labId,
  requestId,
  isReviewer,
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
    getNotificationDetail(labId, requestId)
      .then((d) => !cancelled && setDetail(d))
      .catch((e: Error) => !cancelled && setLoadError(e.message));
    return () => {
      cancelled = true;
    };
  }, [labId, requestId]);

  const canDecide = isReviewer && detail?.status === "PENDING";

  const decide = async (decision: "approve" | "reject") => {
    if (!detail) return;
    // A comment is required for both approving and rejecting.
    if (!reason.trim()) {
      setError(`A comment is required to ${decision} this request.`);
      return;
    }
    setSubmitting(true);
    try {
      if (decision === "approve") {
        await approveNotification(labId, detail.id, reason.trim());
        toast.success("Request approved and patient updated");
      } else {
        await rejectNotification(labId, detail.id, reason.trim());
        toast.success("Request rejected");
      }
      onDecided();
      onClose(); // pop-up closes once the decision is made
    } catch (e) {
      // e.g. someone else already decided it: show why and refresh the list behind us
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
  const patient = detail?.currentPatient;
  const changes = parseChanges(detail?.message);
  const visit = patient?.visit;
  const patientRows: DetailRow[] = [
    { label: "Name", value: [patient?.firstName, patient?.lastName].filter(Boolean).join(" ") || "—" },
    { label: "Visit code", value: detail?.visitCode || visit?.visitCode || "—" },
    { label: "Visit date", value: formatDmy(visit?.visitDate) },
    { label: "Visit type", value: visit?.visitType || "—" },
    { label: "Age", value: patient?.age || "—" },
    { label: "Gender", value: patient?.gender || "—" },
    { label: "Date of birth", value: formatDmy(patient?.dateOfBirth) },
    { label: "Phone", value: patient?.phone || "—" },
  ];

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
          {/* 1. Request */}
          <Section title="Request">
            <Box>
              <table className="w-full table-fixed text-p3">
                <tbody className="divide-y divide-pneutral-100">
                  <tr>
                    <Th className="w-1/3">Requested by</Th>
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
                  {detail.status !== "PENDING" && (
                    <tr>
                      <Th>{detail.status === "APPROVED" ? "Approved by" : "Rejected by"}</Th>
                      <Td>
                        {detail.reviewedByUsername ?? "—"}
                        {detail.reviewedAt && (
                          <span className="block text-p2 text-pneutral-500">{formatDate(detail.reviewedAt)}</span>
                        )}
                      </Td>
                    </tr>
                  )}
                  {detail.status !== "PENDING" && (
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
                  )}
                </tbody>
              </table>
            </Box>
          </Section>

          {/* 2. Patient details (read-only context), two columns */}
          <Section title="Patient details">
            <Box>
              <table className="w-full table-fixed text-p3">
                <tbody className="divide-y divide-pneutral-100">
                  {chunkPairs(patientRows).map(([a, b]) => (
                    <tr key={a.label}>
                      <Th className="w-[17%]">{a.label}</Th>
                      <Td className="w-[33%]">{a.value}</Td>
                      <Th className="w-[17%]">{b?.label}</Th>
                      <Td className="w-[33%]">{b?.value}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
            {detail.status === "APPROVED" && (
              <p className="mt-1 text-p2 text-pneutral-500">Shows the patient as updated by this request.</p>
            )}
          </Section>

          {/* 3. Only what the requester wants changed */}
          <Section title="Requested changes">
            <Box>
              <table className="w-full table-fixed text-p3">
                <thead>
                  <tr className="bg-pneutral-50">
                    <th className="w-1/3 px-3 py-2 text-left font-semibold text-pneutral-700">Field</th>
                    <th className="px-3 py-2 text-left font-semibold text-pneutral-700">Current</th>
                    <th className="px-3 py-2 text-left font-semibold text-pneutral-700">Requested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pneutral-100">
                  {changes.map((c, i) => (
                    <tr key={`${c.field}-${i}`}>
                      <Th className="bg-transparent">{c.field}</Th>
                      <Td className="text-warning-500">{c.current}</Td>
                      <Td className="font-semibold text-success-600">{c.requested}</Td>
                    </tr>
                  ))}
                  {changes.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-3 py-3 text-left text-pneutral-500">
                        No field-level changes are available for this request.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Box>
          </Section>

          {canDecide && (
            <Section title="Reasons for changes">
              <label htmlFor="approval-comment" className="block text-p2 text-pneutral-600 mb-1">
                Comment section <span className="text-warning-500">*</span>
              </label>
              <textarea
                id="approval-comment"
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
            </Section>
          )}
          {error && (
            <p role="alert" className="text-p2 text-warning-600">
              {error}
            </p>
          )}
          {!isReviewer && detail.status === "PENDING" && (
            <p className="text-p2 text-pneutral-500">Waiting for an admin to review this request.</p>
          )}
        </div>
      )}
    </NewModal>
  );
};

export default ApprovalReviewModal;
