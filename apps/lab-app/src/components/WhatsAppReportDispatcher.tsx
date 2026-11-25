"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useLabs } from "@/context/LabContext";
import CommonReportViewWrapper from "@/app/(admin)/component/patientDashboard/Report/CommonReportViewWrapper";
import { getReportData } from "../../services/reportServices";
import { getPatientByVisitIdAndVisitDetails } from "../../services/patientServices";
import { sendVisitReportOnWhatsApp } from "../../services/whatsappReportServices";
import {
    subscribeToWhatsAppReportRequests,
    type ReportPdfExporter,
    type WhatsAppReportRequest,
} from "@/lib/whatsapp/whatsappReportBus";
import { evaluatePaymentGate, toReportPatientData, unwrapVisitPatient } from "@/lib/whatsapp/whatsappReportGate";
import type { PatientData } from "@/types/sample/sample";

// The backend refuses a second send for the same visit within 60 s (HTTP 429). When that happens the
// latest request is retried once, just after the window, so quick consecutive saves still end with the
// newest report on the patient's phone.
const DUPLICATE_WINDOW_RETRY_MS = 62_000;
// The report view loads its AI / health-snapshot parts asynchronously. Give it a moment to start them
// before trusting `isReady`, then cap the wait so a stuck request can't block the queue forever.
const MIN_SETTLE_MS = 1_500;
const MAX_WAIT_MS = 90_000;
const POLL_MS = 250;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface RenderJob {
    visitId: number;
    patientData: PatientData;
}

/**
 * Sends a visit's report PDF to the patient on WhatsApp whenever a report is saved/edited or a bill is
 * settled -- but only while the visit's bill is fully paid. Mounted once, in the root layout. It renders
 * the report off-screen purely to capture the PDF; nothing is shown to the user except result toasts.
 */
const WhatsAppReportDispatcher = () => {
    const { currentLab } = useLabs();
    const labId = currentLab?.id;
    const labIdRef = useRef<number | undefined>(labId);
    labIdRef.current = labId;

    const [job, setJob] = useState<RenderJob | null>(null);
    const exporterRef = useRef<ReportPdfExporter | null>(null);

    // One pending request per visit (a newer one replaces an older one) and a single worker, so two
    // quick saves never race each other into the backend's duplicate guard.
    const pending = useRef<Map<number, WhatsAppReportRequest>>(new Map());
    const working = useRef(false);
    const retryTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
    const mounted = useRef(true);

    const renderPdf = useCallback(async (visitId: number, patientData: PatientData): Promise<Blob> => {
        exporterRef.current = null;
        setJob({ visitId, patientData });
        try {
            const startedAt = Date.now();
            // The ref is written by the hidden report view, not here, so read it fresh every time.
            const current = () => exporterRef.current as ReportPdfExporter | null;
            // wait for the hidden report to mount and hand over its exporter
            while (!current()) {
                if (Date.now() - startedAt > MAX_WAIT_MS) throw new Error("report did not render");
                await sleep(POLL_MS);
            }
            await sleep(MIN_SETTLE_MS);
            while (!current()?.isReady()) {
                if (Date.now() - startedAt > MAX_WAIT_MS) break; // build with whatever has loaded
                await sleep(POLL_MS);
            }
            const exporter = current();
            if (!exporter) throw new Error("report view unmounted");
            return await exporter.build();
        } finally {
            setJob(null);
            exporterRef.current = null;
        }
    }, []);

    const process = useCallback(
        async (request: WhatsAppReportRequest) => {
            const lab = labIdRef.current;
            const { visitId, trigger } = request;
            if (!lab) return;
            const fromSave = trigger !== "payment-completed";

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

            // 2. Payment gate -- the whole bill must be settled.
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

            // 3. Nothing to send until at least one report exists (e.g. payment taken at registration).
            try {
                const reports = await getReportData(lab.toString(), visitId.toString());
                if (!Array.isArray(reports) || reports.length === 0) return;
            } catch {
                return;
            }

            // 4. Same PDF the Print button produces (all reports of the visit, fresh from the server).
            let pdf: Blob;
            try {
                pdf = await renderPdf(visitId, toReportPatientData(patient));
            } catch (error) {
                console.error("[whatsapp-report] PDF build failed", error);
                toast.error("Could not prepare the report PDF for WhatsApp.");
                return;
            }

            // 5. Send.
            const reportRef = patient.visit?.visitCode || `VISIT-${visitId}`;
            const outcome = await sendVisitReportOnWhatsApp(
                lab,
                visitId,
                pdf,
                `Lab-Report-${reportRef.replace(/[^a-zA-Z0-9._-]/g, "_")}.pdf`
            );

            if (outcome.ok) {
                toast.success("Report sent to the patient on WhatsApp.");
                return;
            }
            switch (outcome.status) {
                case 429: {
                    // duplicate guard -- try again once the window has passed
                    const existing = retryTimers.current.get(visitId);
                    if (existing) clearTimeout(existing);
                    retryTimers.current.set(
                        visitId,
                        setTimeout(() => {
                            retryTimers.current.delete(visitId);
                            if (mounted.current) enqueue({ visitId, trigger: "report-edited" });
                        }, DUPLICATE_WINDOW_RETRY_MS)
                    );
                    toast.info("A WhatsApp report was just sent for this visit. The latest version will be sent in about a minute.");
                    return;
                }
                case 403:
                    // role not allowed to send reports (backend: admin / technician / super-admin only)
                    console.info("[whatsapp-report] this role may not send reports on WhatsApp");
                    return;
                case 503:
                    // WhatsApp delivery not enabled/configured on the server -- not the user's problem
                    console.info("[whatsapp-report] WhatsApp report delivery is not enabled on the server");
                    return;
                default:
                    toast.error(outcome.entry?.errorMessage || outcome.message || "Could not send the report on WhatsApp.");
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [renderPdf]
    );

    const drain = useCallback(async () => {
        if (working.current) return;
        working.current = true;
        try {
            while (mounted.current && pending.current.size > 0) {
                const [visitId, request] = pending.current.entries().next().value as [number, WhatsAppReportRequest];
                pending.current.delete(visitId);
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
            pending.current.set(request.visitId, request);
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
            <CommonReportViewWrapper
                visitId={job.visitId}
                patientData={job.patientData}
                doctorName={job.patientData.doctorName}
                hidePrintButton
                pdfExportRef={exporterRef}
            />
        </div>
    );
};

export default WhatsAppReportDispatcher;
