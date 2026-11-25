import api from '@/utils/api';

// Client for the backend's WhatsApp report endpoints (read-only contract, see WhatsAppReportController):
//   POST /lab/{labId}/visits/{visitId}/whatsapp-report   multipart, part "file" = the report PDF
//   GET  /lab/{labId}/visits/{visitId}/whatsapp-report   delivery history, newest first

export type WhatsAppSendStatus = 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED' | 'READ';

export interface WhatsAppReportLogEntry {
    id: number;
    visitId: number;
    status: WhatsAppSendStatus;
    /** Masked by the backend, e.g. +91******3210 */
    phoneNumber: string;
    whatsappMessageId?: string | null;
    errorMessage?: string | null;
    sentBy?: string | null;
    createdAt?: string;
    sentAt?: string | null;
    deliveredAt?: string | null;
}

export type WhatsAppSendOutcome =
    | { ok: true; entry?: WhatsAppReportLogEntry }
    | { ok: false; status: number; message: string; entry?: WhatsAppReportLogEntry };

interface ApiEnvelope<T> {
    data?: T;
    message?: string;
}

const errorShape = (error: unknown) =>
    error as {
        response?: { status?: number; data?: (ApiEnvelope<WhatsAppReportLogEntry> & { error?: string }) | undefined };
        message?: string;
    };

/**
 * Uploads the report PDF and asks the backend to send it to the patient. Never throws: the caller
 * decides what each HTTP status means (429 = duplicate guard, 403 = role not allowed, 503 = feature off,
 * 502 = WhatsApp/AWS refused it -- the log entry with the reason then comes back in `entry`).
 */
export const sendVisitReportOnWhatsApp = async (
    labId: number,
    visitId: number,
    pdf: Blob,
    fileName = 'Lab-Report.pdf'
): Promise<WhatsAppSendOutcome> => {
    const form = new FormData();
    form.append('file', pdf, fileName);
    try {
        const response = await api.post(`/lab/${labId}/visits/${visitId}/whatsapp-report`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000,
        });
        return { ok: true, entry: (response.data as ApiEnvelope<WhatsAppReportLogEntry>)?.data };
    } catch (error: unknown) {
        const { response, message } = errorShape(error);
        return {
            ok: false,
            status: response?.status ?? 0,
            message: response?.data?.message || response?.data?.error || message || 'Could not send the report on WhatsApp',
            entry: response?.data?.data,
        };
    }
};

export const getWhatsAppReportHistory = async (labId: number, visitId: number): Promise<WhatsAppReportLogEntry[]> => {
    try {
        const response = await api.get(`/lab/${labId}/visits/${visitId}/whatsapp-report`);
        const rows = (response.data as ApiEnvelope<WhatsAppReportLogEntry[]>)?.data;
        return Array.isArray(rows) ? rows : [];
    } catch {
        throw new Error('An error occurred while fetching WhatsApp history.');
    }
};
