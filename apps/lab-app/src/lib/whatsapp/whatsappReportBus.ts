// Tiny publish/subscribe channel between the places that change a report or a bill and the single
// <WhatsAppReportDispatcher /> mounted in the root layout. Callers only say "this visit changed";
// the dispatcher decides whether anything is actually sent (payment gate, reports present, ...).

// 'visit-registered' = the visit was created with the bill already settled (nothing was due at the counter).
export type WhatsAppReportTrigger = 'report-saved' | 'report-edited' | 'payment-completed' | 'visit-registered';

// What goes to the patient: the lab report PDF, or the bill (invoice) PDF.
export type WhatsAppDocument = 'report' | 'bill';

export interface WhatsAppReportRequest {
    visitId: number;
    trigger: WhatsAppReportTrigger;
    document: WhatsAppDocument;
}

/**
 * What a mounted report (or invoice) view exposes so the dispatcher can get the same PDF the Print
 * button makes, without opening it. `isReady` is false while the view is still loading its data
 * (AI/health-snapshot parts for a report, tests/packages/doctor for an invoice).
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
export const requestWhatsAppReport = (visitId: number | undefined | null, trigger: WhatsAppReportTrigger): void =>
    publish(visitId, trigger, 'report');

/**
 * Ask for the visit's bill to be sent on WhatsApp. Same contract as `requestWhatsAppReport`: the
 * dispatcher only sends it when the bill is fully paid, so call it whenever a bill may have just
 * been settled and let the dispatcher decide.
 */
export const requestWhatsAppBill = (visitId: number | undefined | null, trigger: WhatsAppReportTrigger): void =>
    publish(visitId, trigger, 'bill');

function publish(visitId: number | undefined | null, trigger: WhatsAppReportTrigger, document: WhatsAppDocument): void {
    if (!visitId || !Number.isFinite(Number(visitId))) return;
    listeners.forEach((listener) => {
        try {
            listener({ visitId: Number(visitId), trigger, document });
        } catch (error) {
            console.error('[whatsapp-report] listener failed', error);
        }
    });
}
