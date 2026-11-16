"use client";

import { useEffect, useRef, useState } from "react";
import {
  ApiNotification,
  acknowledgeNotification,
} from "../../../../../services/notificationServices";
import { getPatientByVisitIdAndVisitDetails } from "../../../../../services/patientServices";
import NewModal from "../../dashboard/newcommoncomponent/NewModal";

interface VisitCancelledModalProps {
  labId: number;
  alert: ApiNotification;
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

/**
 * The backend sends the alert as text (see NotificationService.raiseVisitCancelledAlert):
 *   "<user> cancelled the visit of <patient>. Reason: <reason>"
 * There is no structured patient / reason field, so split that text back apart.
 */
const parseMessage = (message?: string) => {
  const reasonMarker = ". Reason: ";
  const reasonAt = message?.indexOf(reasonMarker) ?? -1;
  const reason = message && reasonAt >= 0 ? message.slice(reasonAt + reasonMarker.length).trim() : "";
  const head = message && reasonAt >= 0 ? message.slice(0, reasonAt) : message ?? "";
  const patientMatch = head.match(/ cancelled the visit of (.+)$/);
  return { patient: patientMatch?.[1]?.trim() ?? "", reason };
};

const VisitCancelledModal: React.FC<VisitCancelledModalProps> = ({
  labId,
  alert,
  onAcknowledged,
  onClose,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [details, setDetails] = useState<any>(null);

  const pending = alert.status === "PENDING";
  const { patient, reason } = parseMessage(alert.message);

  // Phone / age / gender are not part of the alert: load the patient of the visit (existing endpoint).
  const visitId = alert.visitId ?? alert.entityId;
  useEffect(() => {
    if (visitId === undefined) return;
    let cancelled = false;
    getPatientByVisitIdAndVisitDetails(labId, visitId)
      .then((d) => !cancelled && setDetails(d))
      .catch(() => {}); // the pop-up still works without them
    return () => {
      cancelled = true;
    };
  }, [labId, visitId]);

  const fullName = [details?.firstName, details?.lastName].filter(Boolean).join(" ");
  const rows: { label: string; value: string }[] = [
    { label: "Patient", value: fullName || patient || "—" },
    { label: "Mobile number", value: details?.phone ? String(details.phone) : "—" },
    { label: "Age", value: details?.age ? String(details.age) : "—" },
    { label: "Gender", value: details?.gender ? String(details.gender) : "—" },
    { label: "Visit code", value: alert.visitCode || "—" },
    { label: "Cancelled by", value: alert.requestedByUsername || "—" },
    { label: "Cancelled on", value: formatDate(alert.createdAt) || "—" },
  ];

  // Opening the alert acknowledges it (no button): mark it seen once, then refresh the bell.
  const sent = useRef(false);
  useEffect(() => {
    if (!pending || sent.current) return;
    sent.current = true;
    acknowledgeNotification(labId, alert.id).catch(() => {}).finally(onAcknowledged);
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
      title="Visit cancelled"
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
              <tr>
                <th
                  scope="row"
                  className="bg-pneutral-50 px-3 py-2 text-left align-top font-semibold text-pneutral-700"
                >
                  Reason
                </th>
                <td className="px-3 py-2 text-left align-top font-semibold text-warning-600 break-words">
                  {reason || "No reason given"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </NewModal>
  );
};

export default VisitCancelledModal;
