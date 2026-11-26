"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useLabs } from "@/context/LabContext";
import CommonReportViewWrapper from "@/app/(admin)/component/patientDashboard/Report/CommonReportViewWrapper";
import PatientDetailsViewComponent from "@/app/(admin)/component/patientDashboard/PatientDetailsViewComponent";
import { getReportData } from "../../services/reportServices";
import { getPatientByVisitIdAndVisitDetails } from "../../services/patientServices";
import { sendVisitReportOnWhatsApp } from "../../services/whatsappReportServices";
import {
    subscribeToWhatsAppReportRequests,
    type ReportPdfExporter,
    type WhatsAppDocument,
    type WhatsAppReportRequest,
} from "@/lib/whatsapp/whatsappReportBus";
import { evaluatePaymentGate, toReportPatientData, unwrapVisitPatient } from "@/lib/whatsapp/whatsappReportGate";
import type { Patient } from "@/types/patient/patient";
import type { PatientData } from "@/types/sample/sample";

// The backend refuses a second send for the same visit within 60 s (HTTP 429) -- and it does not tell a
// report from a bill, so a report followed by a bill (or the reverse) collides too. We therefore remember
// when we last sent for a visit and hold the next one back until the window has passed, and if the
// backend still answers 429 the latest request is retried once, just after the window. Either way the
// newest document ends up on the patient's phone.
const DUPLICATE_WINDOW_MS = 60_000;
const DUPLICATE_WINDOW_RETRY_MS = 62_000;
// The report view loads its AI / health-snapshot parts asynchronously. Give it a moment to start them
// before trusting `isReady`, then cap the wait so a stuck request can't block the queue forever.
const MIN_SETTLE_MS = 1_500;
const MAX_WAIT_MS = 90_000;
const POLL_MS = 250;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const LABEL: Record<WhatsAppDocument, string> = { report: "report", bill: "bill" };
const keyOf = (request: Pick<WhatsAppReportRequest, "document" | "visitId">) => `${request.document}:${request.visitId}`;

type RenderJob =
    | { kind: "report"; visitId: number; patientData: PatientData }
    | { kind: "bill"; visitId: number; patient: Patient };

/**
 * Sends a visit's report PDF (whenever a report is saved/edited or a bill is settled) and its bill PDF
 * (when the visit is registered fully paid, or a due payment completes) to the patient on WhatsApp --
 * but only while the visit's bill is fully paid. Mounted once, in the root layout. It renders the
 * document off-screen purely to capture the PDF; nothing is shown to the user except result toasts.
 */
const WhatsAppReportDispatcher = () => {
    const { currentLab } = useLabs();
    const labId = currentLab?.id;
    const labIdRef = useRef<number | undefined>(labId);
    labIdRef.current = labId;

    const [job, setJob] = useState<RenderJob | null>(null);
    const exporterRef = useRef<ReportPdfExporter | null>(null);

    // One pending request per document+visit (a newer one replaces an older one) and a single worker, so
    // two quick saves never race each other into the backend's duplicate guard.
    const pending = useRef<Map<string, WhatsAppReportRequest>>(new Map());
    const working = useRef(false);
    const retryTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    // visitId -> when WhatsApp last accepted (or reported a recent) send for it
    const lastSentAt = useRef<Map<number, number>>(new Map());
    const mounted = useRef(true);

    const renderPdf = useCallback(async (renderJob: RenderJob): Promise<Blob> => {
        exporterRef.current = null;
        setJob(renderJob);
        try {
            const startedAt = Date.now();
            // The ref is written by the hidden view, not here, so read it fresh every time.
            const current = () => exporterRef.current as ReportPdfExporter | null;
            // wait for the hidden view to mount and hand over its exporter
            while (!current()) {
                if (Date.now() - startedAt > MAX_WAIT_MS) throw new Error(`${renderJob.kind} did not render`);
                await sleep(POLL_MS);
            }
            await sleep(MIN_SETTLE_MS);
            while (!current()?.isReady()) {
                if (Date.now() - startedAt > MAX_WAIT_MS) break; // build with whatever has loaded
                await sleep(POLL_MS);
            }
            const exporter = current();
            if (!exporter) throw new Error(`${renderJob.kind} view unmounted`);
            return await exporter.build();
        } finally {
            setJob(null);
            exporterRef.current = null;
        }
    }, []);

    const scheduleRetry = useCallback((request: WhatsAppReportRequest, delayMs: number) => {
        const key = keyOf(request);
        const existing = retryTimers.current.get(key);
        if (existing) clearTimeout(existing);
        retryTimers.current.set(
            key,
            setTimeout(() => {
                retryTimers.current.delete(key);
                if (mounted.current) enqueue(request);
            }, delayMs)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const process = useCallback(
        async (request: WhatsAppReportRequest) => {
            const lab = labIdRef.current;
            const { visitId, trigger, document } = request;
            if (!lab) return;
            const label = LABEL[document];
            // Only a report save/edit is something the user is waiting on feedback for. Bills go out as a
            // side effect of taking payment, so an unpaid / unsendable bill is silent.
            const fromSave = document === "report" && trigger !== "payment-completed";

            // 0. Sent something for this visit moments ago -> the backend would refuse. Come back later
            //    instead of building a PDF that can't go out yet.
            const sinceLast = Date.now() - (lastSentAt.current.get(visitId) ?? 0);
            if (sinceLast < DUPLICATE_WINDOW_MS) {
                scheduleRetry(request, DUPLICATE_WINDOW_RETRY_MS - sinceLast);
                toast.info(`The ${label} will be sent to the patient on WhatsApp in about a minute.`);
                return;
            }

            // 1. Fresh bill + visit, fetched now. Never trust what a screen loaded earlier: the
            //    payment may have changed since, and the test results certainly have.
            let patient;
            try {
                patient = unwrapVisitPatient(await getPatientByVisitIdAndVisitDetails(lab, visitId));
            } catch {
                patient = null;
            }
            if (!patient) {
                // Fail closed: if the bill can't be verified, nothing is sent.
                if (fromSave) toast.error("Could not verify the bill, so the report was not sent on WhatsApp.");
                return;
            }

            if ((patient.visit?.visitStatus ?? "").toString().toUpperCase() === "CANCELLED") return;

            // 2. Payment gate -- the whole bill must be settled. Applies to the report and the bill alike.
            const gate = evaluatePaymentGate(patient.visit?.billing);
            if (!gate.paid) {
                if (fromSave) {
                    toast.info(
                        gate.due > 0
                            ? `Report saved. Not sent on WhatsApp: ₹${gate.due.toFixed(2)} is still due on this bill. It will be sent once payment is complete.`
                            : "Report saved. Not sent on WhatsApp: the bill is not fully paid yet. It will be sent once payment is complete."
                    );
                }
                return;
            }

            // 3. Reports only: nothing to send until at least one report exists (e.g. payment taken at registration).
            if (document === "report") {
                try {
                    const reports = await getReportData(lab.toString(), visitId.toString());
                    if (!Array.isArray(reports) || reports.length === 0) return;
                } catch {
                    return;
                }
            }

            // 4. Same PDF the Print button produces (the report: all reports of the visit; the bill: the invoice).
            let pdf: Blob;
            try {
                pdf = await renderPdf(
                    document === "report"
                        ? { kind: "report", visitId, patientData: toReportPatientData(patient) }
                        : { kind: "bill", visitId, patient }
                );
            } catch (error) {
                console.error(`[whatsapp-${label}] PDF build failed`, error);
                toast.error(`Could not prepare the ${label} PDF for WhatsApp.`);
                return;
            }

            // 5. Send.
            const reference = patient.visit?.visitCode || `VISIT-${visitId}`;
            const prefix = document === "report" ? "Lab-Report" : "Lab-Bill";
            const outcome = await sendVisitReportOnWhatsApp(
                lab,
                visitId,
                pdf,
                `${prefix}-${reference.replace(/[^a-zA-Z0-9._-]/g, "_")}.pdf`
            );

            if (outcome.ok) {
                lastSentAt.current.set(visitId, Date.now());
                toast.success(`${document === "report" ? "Report" : "Bill"} sent to the patient on WhatsApp.`);
                return;
            }
            switch (outcome.status) {
                case 429: {
                    // duplicate guard (another tab / user sent for this visit) -- try again once the window has passed
                    lastSentAt.current.set(visitId, Date.now());
                    scheduleRetry(request, DUPLICATE_WINDOW_RETRY_MS);
                    toast.info(`A WhatsApp message was just sent for this visit. The ${label} will be sent in about a minute.`);
                    return;
                }
                case 403:
                    // role not allowed to send on WhatsApp (backend: admin / technician / super-admin only)
                    console.info("[whatsapp-report] this role may not send documents on WhatsApp");
                    return;
                case 503:
                    // WhatsApp delivery not enabled/configured on the server -- not the user's problem
                    console.info("[whatsapp-report] WhatsApp delivery is not enabled on the server");
                    return;
                default:
                    toast.error(outcome.entry?.errorMessage || outcome.message || `Could not send the ${label} on WhatsApp.`);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [renderPdf, scheduleRetry]
    );

    const drain = useCallback(async () => {
        if (working.current) return;
        working.current = true;
        try {
            while (mounted.current && pending.current.size > 0) {
                const [key, request] = pending.current.entries().next().value as [string, WhatsAppReportRequest];
                pending.current.delete(key);
                try {
                    await process(request);
                } catch (error) {
                    console.error("[whatsapp-report] unexpected failure", error);
                }
            }
        } finally {
            working.current = false;
        }
    }, [process]);

    const enqueue = useCallback(
        (request: WhatsAppReportRequest) => {
            const key = keyOf(request);
            // a fresh request supersedes any retry still waiting for this document+visit
            const waiting = retryTimers.current.get(key);
            if (waiting) {
                clearTimeout(waiting);
                retryTimers.current.delete(key);
            }
            pending.current.set(key, request);
            void drain();
        },
        [drain]
    );

    useEffect(() => {
        mounted.current = true;
        const unsubscribe = subscribeToWhatsAppReportRequests(enqueue);
        const timers = retryTimers.current;
        return () => {
            mounted.current = false;
            unsubscribe();
            timers.forEach((timer) => clearTimeout(timer));
            timers.clear();
        };
    }, [enqueue]);

    if (!job) return null;

    return (
        <div
            aria-hidden="true"
            style={{ position: "fixed", left: -10000, top: 0, width: 1100, pointerEvents: "none", opacity: 0 }}
        >
            {job.kind === "report" ? (
                <CommonReportViewWrapper
                    visitId={job.visitId}
                    patientData={job.patientData}
                    doctorName={job.patientData.doctorName}
                    hidePrintButton
                    pdfExportRef={exporterRef}
                />
            ) : (
                <PatientDetailsViewComponent patient={job.patient} pdfExportRef={exporterRef} />
            )}
        </div>
    );
};

export default WhatsAppReportDispatcher;
