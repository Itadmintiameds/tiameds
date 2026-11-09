"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
  ApiNotification,
  acknowledgeAsSuperAdmin,
  acknowledgeNotification,
} from "../../../../../services/notificationServices";
import NewModal from "../../dashboard/newcommoncomponent/NewModal";

interface ChangeAlertModalProps {
  alert: ApiNotification;
  /** Name of the lab the change was made in (the alert only carries its id). */
  labName?: string;
  /** True when the signed-in user is a super admin (acknowledges through the super-admin endpoint). */
  isSuperAdmin: boolean;
  /** Called after the alert was acknowledged so the bell can refresh. */
  onAcknowledged: () => void;
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

const KIND: Record<string, string> = {
  TEST_CHANGED: "Test (price list)",
  TEST_REFERENCE_CHANGED: "Test reference",
};

/**
 * Backend text (NotificationService.raiseChangeAlert):
 *   "<user> [(admin) ]<action>[: <name> (<code>)]"
 * e.g. "ravi (admin) updated test: CBC (T001)". Split it so the pop-up can show each part on its own row.
 */
const parseMessage = (message?: string, by?: string) => {
  let rest = message ?? "";
  if (by && rest.startsWith(by)) rest = rest.slice(by.length).trim();
  rest = rest.replace(/^\(admin\)\s*/, "");
  const colon = rest.indexOf(": ");
  return colon >= 0
    ? { action: rest.slice(0, colon).trim(), subject: rest.slice(colon + 2).trim() }
    : { action: rest.trim(), subject: "" };
};

const ChangeAlertModal: React.FC<ChangeAlertModalProps> = ({
  alert,
  labName,
  isSuperAdmin,
  onAcknowledged,
  onClose,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const pending = alert.status === "PENDING";
  const { action, subject } = parseMessage(alert.message, alert.requestedByUsername);

  const rows: { label: string; value: string }[] = [
    { label: "Lab", value: labName || `Lab #${alert.labId}` },
    { label: "Type", value: KIND[alert.type] ?? alert.type },
    { label: "Change", value: action ? action.charAt(0).toUpperCase() + action.slice(1) : alert.title },
    { label: "Test", value: subject || "—" },
    { label: "Changed by", value: alert.requestedByUsername || "—" },
    { label: "Changed on", value: formatDate(alert.createdAt) || "—" },
  ];

  const acknowledge = async () => {
    setSubmitting(true);
    try {
      if (isSuperAdmin && alert.targetRole === "SUPERADMIN") {
        await acknowledgeAsSuperAdmin(alert.id);
      } else {
        await acknowledgeNotification(alert.labId, alert.id);
      }
      toast.success("Alert acknowledged");
      onAcknowledged();
      onClose();
    } catch (e) {
      setError((e as Error).message);
      onAcknowledged(); // e.g. already acknowledged elsewhere: refresh the list behind us
      setSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-md text-p3 font-semibold text-pneutral-700 border border-pneutral-200 hover:bg-pneutral-50 transition-colors"
      >
        Close
      </button>
      {pending && (
        <button
          type="button"
          disabled={submitting}
          onClick={acknowledge}
          className="px-4 py-2 rounded-md text-p3 font-semibold text-base-white bg-primary-700 hover:bg-primary-800 transition-colors disabled:opacity-50"
        >
          {submitting ? "Please wait…" : "Acknowledge"}
        </button>
      )}
    </div>
  );

  return (
    <NewModal
      isOpen
      onClose={onClose}
      title={alert.title}
      footer={footer}
      modalClassName="max-w-lg"
      bodyClassName="overflow-x-hidden"
    >
      <div className="space-y-4 text-p3">
        <div className="overflow-hidden rounded-md border border-pneutral-200">
          <table className="w-full table-fixed text-p3">
            <tbody className="divide-y divide-pneutral-100">
              {rows.map((r) => (
                <tr key={r.label}>
                  <th
                    scope="row"
                    className="w-1/3 bg-pneutral-50 px-3 py-2 text-left align-top font-semibold text-pneutral-700"
                  >
                    {r.label}
                  </th>
                  <td className="px-3 py-2 text-left align-top text-pneutral-900 break-words">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-p2 text-pneutral-500">
          This change has already been applied. Acknowledging only marks the alert as seen.
        </p>
        {error && (
          <p role="alert" className="text-p2 text-warning-600">
            {error}
          </p>
        )}
      </div>
    </NewModal>
  );
};

export default ChangeAlertModal;
