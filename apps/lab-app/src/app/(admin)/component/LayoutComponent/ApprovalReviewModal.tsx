"use client";

import { useState } from "react";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import NewModal from "../../dashboard/newcommoncomponent/NewModal";
import { ApprovalRequest, ROLE_LABEL } from "./notificationTypes";

interface ApprovalReviewModalProps {
  approval: ApprovalRequest;
  /** True when the current user is the approver and the request is still pending. */
  canDecide: boolean;
  onDecide: (id: string, decision: "approved" | "rejected", comment: string) => void;
  onClose: () => void;
}

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

const statusStyle = {
  pending: { label: "Pending", cls: "bg-danger-50 text-danger-800", icon: <FiClock className="h-3.5 w-3.5" /> },
  approved: { label: "Approved", cls: "bg-success-50 text-success-800", icon: <FiCheckCircle className="h-3.5 w-3.5" /> },
  rejected: { label: "Rejected", cls: "bg-warning-50 text-warning-700", icon: <FiXCircle className="h-3.5 w-3.5" /> },
};

const ApprovalReviewModal: React.FC<ApprovalReviewModalProps> = ({
  approval,
  canDecide,
  onDecide,
  onClose,
}) => {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const submit = (decision: "approved" | "rejected") => {
    // Both approving and rejecting need a comment.
    if (!comment.trim()) {
      setError(
        `Reason is required to ${decision === "approved" ? "approve" : "reject"} this request.`
      );
      return;
    }
    onDecide(approval.id, decision, comment);
    onClose(); // pop-up closes once the decision is made
  };

  const status = statusStyle[approval.status];

  const footer = canDecide ? (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={() => submit("rejected")}
        className="px-4 py-2 rounded-md text-p3 font-semibold text-warning-600 border border-warning-200 hover:bg-warning-50 transition-colors"
      >
        Reject
      </button>
      <button
        type="button"
        onClick={() => submit("approved")}
        className="px-4 py-2 rounded-md text-p3 font-semibold text-base-white bg-success-700 hover:bg-success-800 transition-colors"
      >
        Approve
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

  return (
    <NewModal
      isOpen
      onClose={onClose}
      title={`Approval request: ${approval.title}`}
      footer={footer}
      modalClassName="max-w-lg"
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-md border border-pneutral-200">
          <table className="w-full text-p3">
            <tbody className="divide-y divide-pneutral-100">
              <tr>
                <th scope="row" className="w-2/5 bg-pneutral-50 px-3 py-2 text-left font-semibold text-pneutral-700 align-top">
                  Requested by
                </th>
                <td className="px-3 py-2 text-pneutral-900">{approval.requestedBy.name}</td>
              </tr>
              <tr>
                <th scope="row" className="bg-pneutral-50 px-3 py-2 text-left font-semibold text-pneutral-700 align-top">
                  Role
                </th>
                <td className="px-3 py-2 text-pneutral-900">{ROLE_LABEL[approval.requestedBy.role]}</td>
              </tr>
              <tr>
                <th scope="row" className="bg-pneutral-50 px-3 py-2 text-left font-semibold text-pneutral-700 align-top">
                  Requested on
                </th>
                <td className="px-3 py-2 text-pneutral-900">{formatDate(approval.requestedAt)}</td>
              </tr>
              <tr>
                <th scope="row" className="bg-pneutral-50 px-3 py-2 text-left font-semibold text-pneutral-700 align-top">
                  Status
                </th>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-p2 font-semibold ${status.cls}`}
                  >
                    {status.icon}
                    {status.label}
                  </span>
                </td>
              </tr>
              {approval.details.map((d) => (
                <tr key={d.label}>
                  <th scope="row" className="bg-pneutral-50 px-3 py-2 text-left font-semibold text-pneutral-700 align-top">
                    {d.label}
                  </th>
                  <td className="px-3 py-2 text-pneutral-900 break-words">{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {canDecide ? (
          <div>
            <label
              htmlFor="approval-comment"
              className="block text-label-l2 font-heading font-semibold text-pneutral-800 mb-1"
            >
              Comment / reason
              <span className="text-warning-500"> *</span>
            </label>
            <textarea
              id="approval-comment"
              rows={3}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError("");
              }}
              placeholder="Add a note for the requester…"
              aria-invalid={!!error}
              className={`w-full text-p3 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                error
                  ? "border-warning-400 focus:ring-warning-200"
                  : "border-pneutral-200 focus:ring-primary-300 focus:border-primary-400"
              }`}
            />
            {error && (
              <p role="alert" className="mt-1 text-p2 text-warning-600">
                {error}
              </p>
            )}
          </div>
        ) : approval.status !== "pending" ? (
          <div className="text-p3 border border-pneutral-100 rounded-md p-3">
            <p className="text-p2 text-pneutral-500 mb-1">
              {status.label} by {approval.decidedBy} · {formatDate(approval.decidedAt)}
            </p>
            <p className="text-pneutral-800">{approval.decisionComment || "No comment was added."}</p>
          </div>
        ) : (
          <p className="text-p2 text-pneutral-500">
            Waiting for a {ROLE_LABEL[approval.approverRole]} to review this request.
          </p>
        )}
      </div>
    </NewModal>
  );
};

export default ApprovalReviewModal;
