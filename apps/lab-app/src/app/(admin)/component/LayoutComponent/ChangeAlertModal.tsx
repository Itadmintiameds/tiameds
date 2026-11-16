"use client";

import { useEffect, useRef } from "react";
import {
  ApiNotification,
  acknowledgeAsDesk,
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
  REPORT_UPDATED: "Report",
  REPORT_COMPLETED: "Report",
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
  const pending = alert.status === "PENDING";
  const { action, subject } = parseMessage(alert.message, alert.requestedByUsername);

  const isReportCompleted = alert.type === "REPORT_COMPLETED";
  const isReportUpdated = alert.type === "REPORT_UPDATED";

  const rows: { label: string; value: string }[] = isReportCompleted
    ? [
        // Backend text: "Report of <patient> (visit <code>) is completed. Please take the print."
        { label: "Lab", value: labName || `Lab #${alert.labId}` },
        { label: "Visit code", value: alert.visitCode || "—" },
        { label: "Details", value: alert.message || alert.title },
        { label: "Results saved by", value: alert.requestedByUsername || "—" },
        { label: "Completed on", value: formatDate(alert.createdAt) || "—" },
      ]
    : isReportUpdated
    ? [
        // Backend text: "<user> updated report <reportId>"
        { label: "Lab", value: alert.labName || labName || `Lab #${alert.labId}` },
        { label: "Patient", value: alert.patientName || "—" },
        { label: "Visit code", value: alert.visitCode || "—" },
        { label: "Report ID", value: alert.reportId ? String(alert.reportId) : "—" },
        { label: "Updated by", value: alert.requestedByUsername || "—" },
        { label: "Updated on", value: formatDate(alert.createdAt) || "—" },
      ]
    : [
        { label: "Lab", value: labName || `Lab #${alert.labId}` },
        { label: "Type", value: KIND[alert.type] ?? alert.type },
        { label: "Change", value: action ? action.charAt(0).toUpperCase() + action.slice(1) : alert.title },
        { label: "Test", value: subject || "—" },
        { label: "Changed by", value: alert.requestedByUsername || "—" },
        { label: "Changed on", value: formatDate(alert.createdAt) || "—" },
      ];

  // Opening the alert is what acknowledges it (no button): mark it seen once, then refresh the bell.
  const sent = useRef(false);
  useEffect(() => {
    if (!pending || sent.current) return;
    sent.current = true;
    const call = isReportCompleted
      ? acknowledgeAsDesk(alert.labId, alert.id)
      : isSuperAdmin && alert.targetRole === "SUPERADMIN"
      ? acknowledgeAsSuperAdmin(alert.id)
      : acknowledgeNotification(alert.labId, alert.id);
    call.catch(() => {}).finally(onAcknowledged); // e.g. already acknowledged elsewhere: just refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const footer = (
    <div className="flex justify-end gap-2">
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
          {isReportCompleted
            ? "The report is ready. Please take the print."
            : isReportUpdated
            ? "The report has already been updated."
            : "This change has already been applied."}
        </p>
      </div>
    </NewModal>
  );
};

export default ChangeAlertModal;
