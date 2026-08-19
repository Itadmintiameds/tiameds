import { useEffect, useMemo, useState } from "react";
import { useLabs } from "@/context/LabContext";
import { getAiClinicalObservation, getReportData } from "../../../../../../services/reportServices";
import { getPatientByVisitIdAndVisitDetails } from "../../../../../../services/patientServices";
import { PatientData } from "@/types/sample/sample";
import type { AiClinicalObservation } from "@/types/aiInsights";
import CommonReportView from "./CommonReportView";
import CommonReportView2, { areAllTestsCompleted } from "./CommonReportView2";
import type { ConsolidatedReport } from "./CommonReportView2";
import { TbInfoCircle } from "react-icons/tb";

interface CommonReportViewWrapperProps {
    visitId: number;
    patientData: PatientData;
    doctorName?: string;
    hidePrintButton?: boolean;
}

interface ApiReport {
    reportId: number;
    testRows?: unknown;
    reportCode?: string;
    patientCode?: string;
    visitCode?: string;
}

// The Health Snapshot is patient-scoped (/lab/{labId}/patient/{patientId}/health-snapshot),
// but Sample Management's visit feeds (/patients/collected-completed, /get-visit-samples)
// carry no patientId -- the field is declared optional on VisitSampleList and comes back
// undefined. That is why a report opened from Completed Tests rendered without trends
// while the same report opened from the Patient Dashboard (which knows the patient) had
// them. Rather than make every call site find a patient id, the view resolves it from the
// visit it was already given, so it behaves identically wherever it is mounted.
// If the backend later includes patientId on those feeds, this lookup simply stops firing.
const patientIdByVisit = new Map<number, number>();

// Only a real, positive id counts -- 0 and "" are the shapes a missing id arrives in here,
// and passing either to the snapshot endpoint would be a pointless failing request.
const toPatientId = (value: unknown): number | undefined => {
    const parsed = typeof value === "string" ? Number(value.trim()) : value;
    return typeof parsed === "number" && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const readId = (source: unknown, keys: string[]): number | undefined => {
    if (!source || typeof source !== "object") return undefined;
    const record = source as Record<string, unknown>;
    for (const key of keys) {
        const id = toPatientId(record[key]);
        if (id !== undefined) return id;
    }
    return undefined;
};

// A wrong id here would pull another patient's history onto a medical report, so this only
// accepts a value that is unambiguously a patient id: an explicit `patientId`, an id nested
// under `patient`, or a bare `id` on a payload that is recognisably a patient record (and
// never one that is just the visit id echoed back). Anything unrecognised yields undefined,
// which leaves the snapshot hidden exactly as it is today -- no guessing.
const extractPatientId = (response: unknown, visitId: number): number | undefined => {
    // Services here return the raw axios body and the backend wraps payloads in
    // {status, message, data}, so the visit may be at the root or one level down.
    const roots = [response, (response as { data?: unknown } | undefined)?.data];
    for (const root of roots) {
        const explicit = readId(root, ["patientId"]);
        if (explicit !== undefined) return explicit;

        const nested = readId((root as { patient?: unknown } | undefined)?.patient, ["patientId", "id"]);
        if (nested !== undefined) return nested;

        const record = root as Record<string, unknown> | undefined;
        const looksLikePatient =
            !!record && ("firstName" in record || "lastName" in record || "patientCode" in record);
        if (looksLikePatient) {
            const bare = readId(record, ["id"]);
            if (bare !== undefined && bare !== visitId) return bare;
        }
    }
    return undefined;
};

const lookupPatientId = async (labId: number, visitId: number): Promise<number | undefined> => {
    const cached = patientIdByVisit.get(visitId);
    if (cached !== undefined) return cached;

    try {
        const response = await getPatientByVisitIdAndVisitDetails(labId, visitId);
        const patientId = extractPatientId(response, visitId);
        if (patientId !== undefined) {
            patientIdByVisit.set(visitId, patientId);
        } else {
            // The endpoint answered in a shape this doesn't recognise. Says so out loud
            // rather than silently dropping the Health Snapshot, since a missing trend
            // section is otherwise indistinguishable from a patient with no history.
            console.warn(
                `[report] could not resolve a patientId for visit ${visitId}; Health Snapshot will be hidden.`,
                response
            );
        }
        return patientId;
    } catch {
        // The snapshot is supporting context, not the report itself -- a failed lookup
        // means no trend lines, never a broken report.
        return undefined;
    }
};

const CommonReportViewWrapper = (props: CommonReportViewWrapperProps) => {
    const { visitId, patientData, ...restProps } = props;
    const { currentLab } = useLabs();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [reports, setReports] = useState<ConsolidatedReport[] | null>(null);
    const [resolvedPatientId, setResolvedPatientId] = useState<number>();
    const [storedObservation, setStoredObservation] = useState<AiClinicalObservation | null>();

    const callerPatientId = toPatientId(patientData?.patientId);

    // AI Clinical Observations only exist for a finished order, so there is nothing to look
    // up for a part-completed visit -- same condition the report view uses to decide whether
    // to show the section at all.
    const orderComplete = areAllTestsCompleted(patientData);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentLab?.id || !visitId) return;
            setLoading(true);
            setError(undefined);

            // Runs alongside the report fetch rather than after it: the wrapper already
            // shows a loader until reports arrive, so resolving the patient in parallel
            // costs no extra wait before the report paints.
            const patientLookup =
                callerPatientId !== undefined
                    ? Promise.resolve(callerPatientId)
                    : lookupPatientId(currentLab.id, visitId);

            // Same reasoning, and the reason a reopened report has no AI wait at all: by the
            // time the view mounts, the visit's saved observation is already in hand, so it
            // renders on the first frame instead of after a round trip of its own.
            const observationLookup = orderComplete
                ? getAiClinicalObservation(currentLab.id, visitId)
                : Promise.resolve(null);

            const [reportResult, patientResult, observationResult] = await Promise.allSettled([
                getReportData(currentLab.id.toString(), visitId.toString()),
                patientLookup,
                observationLookup,
            ]);

            // A failed lookup only costs the Health Snapshot, so it must never take the
            // report down with it -- the results are settled independently for that reason.
            setResolvedPatientId(
                patientResult.status === "fulfilled" ? patientResult.value : undefined
            );

            // A failed read is treated as "nothing saved": the view then generates and
            // writes, which is the correct recovery either way. Says so out loud, though --
            // a read that fails on every open looks exactly like a visit that has never been
            // generated, so the only visible symptom is the AI regenerating forever and the
            // real cause (a 500 from the endpoint) staying hidden.
            if (observationResult.status === "rejected") {
                console.warn(
                    `[report] could not read saved AI observations for visit ${visitId}; they will be regenerated.`,
                    observationResult.reason
                );
            }
            setStoredObservation(
                observationResult.status === "fulfilled" ? observationResult.value : null
            );

            if (reportResult.status === "fulfilled") {
                const response = reportResult.value;
                setReports(Array.isArray(response) ? (response as unknown as ConsolidatedReport[]) : null);
            } else {
                setError("Failed to load report data");
                setReports(null);
                console.error(reportResult.reason);
            }

            setLoading(false);
        };

        fetchData();
    }, [currentLab?.id, visitId, callerPatientId, orderComplete]);

    // What the report view actually renders against: the caller's patient data, with the
    // patient id filled in when the caller had none.
    const effectivePatientData = useMemo<PatientData>(
        () => (callerPatientId !== undefined ? patientData : { ...patientData, patientId: resolvedPatientId }),
        [patientData, callerPatientId, resolvedPatientId]
    );

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className="mt-4 text-lg font-medium text-gray-700">Loading report..</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <TbInfoCircle className="mb-4 text-5xl text-red-500" />
                <h3 className="mb-2 text-xl font-bold text-gray-700">Unable to load report</h3>
                <p className="max-w-md text-gray-600">{error}</p>
            </div>
        );
    }

    // Check if any report has testRows with more than 1 item (new consolidated format)
    // OR if reports have the new format fields (reportCode, patientCode, visitCode) with testRows array
    const isNewFormat = (() => {
        if (!Array.isArray(reports) || reports.length === 0) return false;
        
        // Check if ANY report has testRows with length > 1
        const hasMultiRowReport = reports.some((report) => {
            const testRows = (report as ApiReport).testRows;
            return Array.isArray(testRows) && (testRows as unknown[]).length > 1;
        });
        
        if (hasMultiRowReport) return true;
        
        // Check if reports have new format fields (reportCode, patientCode, visitCode) and testRows array exists
        const hasNewFormatFields = reports.some((report) => {
            const apiReport = report as ApiReport;
            return (
                Array.isArray(apiReport.testRows) &&
                (apiReport.reportCode || apiReport.patientCode || apiReport.visitCode)
            );
        });
        
        return hasNewFormatFields;
    })();

    if (isNewFormat && Array.isArray(reports)) {
        return (
            <CommonReportView2
                {...restProps}
                patientData={effectivePatientData}
                reportsData={reports}
                storedObservation={storedObservation}
            />
        );
    }

    return <CommonReportView visitId={visitId} {...restProps} patientData={effectivePatientData} />;
};

export default CommonReportViewWrapper;

