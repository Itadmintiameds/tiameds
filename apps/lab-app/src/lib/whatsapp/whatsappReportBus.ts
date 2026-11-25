// Tiny publish/subscribe channel between the places that change a report or a bill and the single
// <WhatsAppReportDispatcher /> mounted in the root layout. Callers only say "this visit changed";
// the dispatcher decides whether anything is actually sent (payment gate, reports present, ...).

export type WhatsAppReportTrigger = 'report-saved' | 'report-edited' | 'payment-completed';

export interface WhatsAppReportRequest {
    visitId: number;
    trigger: WhatsAppReportTrigger;
}

/**
 * What a mounted report view exposes so the dispatcher can get the same PDF the Print button makes,
 * without opening it. `isReady` is false while the view is still loading its AI/health-snapshot parts.
 */
export interface ReportPdfExporter {
    build: () => Promise<Blob>;
    isReady: () => boolean;
}

type Listener =(request: WhatsAppReportRequest) => void;

const listeners = new Set<Listener>();

export const subscribeToWhatsAppReportRequests = (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

/**
 * Ask for the visit's report to be sent on WhatsApp. Fire-and-forget and safe to call from any save
 * handler: it never throws and never blocks the caller's own flow.
 */
export const requestWhatsAppReport = (visitId: number | undefined | null, trigger: WhatsAppReportTrigger): void => {
    if (!visitId || !Number.isFinite(Number(visitId))) return;
    listeners.forEach((listener) => {
        try {
            listener({ visitId: Number(visitId), trigger });
        } catch (error) {
            console.error('[whatsapp-report] listener failed', error);
        }
    });
};
