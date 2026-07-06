import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
//import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { TbInfoCircle } from "react-icons/tb";
import { toast } from "react-toastify";
import { useLabs } from "@/context/LabContext";
import { formatAgeForDisplay } from "@/utils/ageUtils";
import type { PatientData } from "@/types/sample/sample";
import { formatMedicalReportToHTML } from "@/utils/reportFormatter";
import { getPatientHealthSnapshot } from "../../../../../../services/patientServices";
import type { HealthSnapshot } from "@/types/patient/healthSnapshot";
import type { AiReportInsights } from "@/types/aiInsights";
import type { AiHistoryPoint, AiTestFinding } from "@/lib/ai/labReportPrompt";

type Html2CanvasBaseOptions = NonNullable<Parameters<typeof html2canvas>[1]>;
type Html2CanvasEnhancedOptions = Html2CanvasBaseOptions & {
    scale?: number;
    windowWidth?: number;
    windowHeight?: number;
};

const DEFAULT_FONT_FAMILY = '"Inter", "Helvetica Neue", Arial, sans-serif';
const BASE_TEXT_COLOR = "#0f172a";

// Plain hex values (not Tailwind color-* classes) on purpose: Tailwind v4 generates
// its color palette via oklch()/color-mix(), which html2canvas cannot parse and will
// throw on mid-PDF-capture. Inline hex keeps the report visually matching the Figma
// palette while staying safe for the PDF export pipeline.
const REPORT_COLORS = {
    neutral900: "#101828",
    neutral800: "#1D2939",
    neutral600: "#475467",
    neutral100: "#F2F4F7",
    secondary50: "#F8F6FD",
    secondary100: "#F1EDFB",
    secondary200: "#E4DEF7",
    secondary700: "#6941C6",
    secondary800: "#53389E",
    warning500: "#F79009",
    warning600: "#DC6803",
    danger500: "#F04438",
    danger600: "#D92D20",
    success600: "#079455",
    success700: "#067647",
    success900: "#074D31",
    white: "#FFFFFF",
};
// const PAGE_WIDTH_MM = 190;
// const PAGE_HEIGHT_MM = 297;
// const MARGIN_X_MM = 10;
// const TOP_MARGIN_MM = 15;
// const BOTTOM_MARGIN_MM = 10;
// const BLOCK_GAP_MM = 2;


const PAGE_WIDTH_MM = 190;
const PAGE_HEIGHT_MM = 297;
const MARGIN_X_MM = 10;
const TOP_MARGIN_MM = 2;
const BOTTOM_MARGIN_MM = 4;
// Extra buffer to avoid edge clipping when html2canvas output is placed into jsPDF.
const CONTENT_SAFETY_MM = 1;
const BLOCK_GAP_MM = 2;
const USABLE_HEIGHT_MM = PAGE_HEIGHT_MM - TOP_MARGIN_MM - BOTTOM_MARGIN_MM;

const normalizeFieldKey = (value?: string) =>
    (value || "")
        .toUpperCase()
        .replace(/–/g, "-")
        .replace(/\s+/g, "")
        .trim();

const EXCLUDED_FIELD_TYPES = new Set(
    [
        "DROPDOWN",
        "DESCRIPTION",
        "DROPDOWN-COMPATIBLE/INCOMPATIBLE",
        "DROPDOWN-POSITIVE/NEGATIVE",
        "DROPDOWN-PRESENT/ABSENT",
        "DROPDOWN-REACTIVE/NONREACTIVE",
        "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE",
        "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT",
    ].map((value) => normalizeFieldKey(value))
);

const QUALITATIVE_DESCRIPTION_FIELD_TYPES = new Set(
    [
        "DESCRIPTION",
        "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE",
        "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT",
    ].map((value) => normalizeFieldKey(value))
);

const doesRowMatchFieldType = (
    row: { referenceDescription?: string; testParameter?: string } | undefined,
    fieldTypes: Set<string>
) => {
    const targets = [
        normalizeFieldKey(row?.referenceDescription),
        normalizeFieldKey(row?.testParameter),
    ].filter(Boolean) as string[];

    return targets.some((value) => fieldTypes.has(value));
};

const isExcludedQualitativeRow = (row?: { referenceDescription?: string; testParameter?: string }) =>
    doesRowMatchFieldType(row, EXCLUDED_FIELD_TYPES);

const shouldShowQualitativeDescriptionRow = (row?: { referenceDescription?: string; testParameter?: string }) =>
    doesRowMatchFieldType(row, QUALITATIVE_DESCRIPTION_FIELD_TYPES);

const normalizeCBCKey = (value?: string) => (value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

type CBCStructureEntry =
    | { type: "row"; label: string }
    | { type: "header"; label: string };

const CBC_STRUCTURE: CBCStructureEntry[] = [
    { type: "row", label: "HAEMOGLOBIN" },
    { type: "row", label: "TOTAL COUNT/ W.B.C" },
    { type: "header", label: "DIFFERENTIAL COUNT" },
    { type: "row", label: "NEUTROPHILS" },
    { type: "row", label: "LYMPHOCYTES" },
    { type: "row", label: "EOSINOPHILS" },
    { type: "row", label: "MONOCYTES" },
    { type: "row", label: "BASOPHILS" },
    { type: "row", label: "PLATELET COUNT" },
    { type: "row", label: "R.B.C" },
    { type: "row", label: "P.C.V" },
    { type: "row", label: "M.C.V" },
    { type: "row", label: "M.C.H" },
    { type: "row", label: "M.C.H.C" },
];

const DIFFERENTIAL_KEYS = new Set(
    ["NEUTROPHILS", "LYMPHOCYTES", "EOSINOPHILS", "MONOCYTES", "BASOPHILS"].map(normalizeCBCKey)
);

type RenderRowEntry = { type: "row"; row: TestRow } | { type: "header"; key: string };

const buildOrderedCBCRows = (rows: TestRow[]): RenderRowEntry[] => {
    const usedRows = new Set<TestRow>();
    const orderedEntries: RenderRowEntry[] = [];
    const hasDifferentialRows = rows.some((row) =>
        DIFFERENTIAL_KEYS.has(normalizeCBCKey(row.testParameter || row.referenceDescription))
    );

    CBC_STRUCTURE.forEach((entry) => {
        if (entry.type === "header") {
            if (entry.label === "DIFFERENTIAL COUNT" && hasDifferentialRows) {
                orderedEntries.push({ type: "header", key: entry.label });
            }
            return;
        }

        const normalizedLabel = normalizeCBCKey(entry.label);
        const matchedRow = rows.find(
            (row) =>
                !usedRows.has(row) &&
                normalizeCBCKey(row.testParameter || row.referenceDescription) === normalizedLabel
        );

        if (matchedRow) {
            usedRows.add(matchedRow);
            orderedEntries.push({ type: "row", row: matchedRow });
        }
    });

    rows.forEach((row) => {
        if (!usedRows.has(row)) {
            orderedEntries.push({ type: "row", row });
        }
    });

    return orderedEntries;
};

interface TestRow {
    testParameter: string;
    normalRange?: string;
    enteredValue?: string;
    unit?: string;
    referenceAgeRange?: string;
    referenceDescription?: string;
    description?: string;
}

type RowScore =
    | { kind: "normal" }
    | { kind: "unscored" }
    | { kind: "critical" | "borderline"; direction: "high" | "low" };

interface ClinicalFinding {
    report: ConsolidatedReport;
    row: TestRow;
    kind: "critical" | "borderline";
    direction: "high" | "low";
}

interface ReferenceRangeEntry {
    Gender: string;
    AgeMin: string;
    AgeMinUnit: string;
    AgeMax: string;
    AgeMaxUnit: string;
    ReferenceRange: string;
}

const renderReferenceRanges = (rangesStr?: string | null, testName?: string | null) => {
    if (!rangesStr) return null;
    let ranges: ReferenceRangeEntry[] = [];
    try {
        const parsed = JSON.parse(rangesStr) as ReferenceRangeEntry[];
        ranges = Array.isArray(parsed) ? parsed : [];
    } catch {
        ranges = [];
    }
    if (ranges.length === 0) return null;
    const formatGender = (gender: string) => {
        const normalized = (gender || "").toUpperCase();
        if (normalized === "M") return "Male";
        if (normalized === "F") return "Female";
        if (normalized === "MF") return "Male/Female";
        return gender;
    };
    const formatAge = (range: ReferenceRangeEntry) => {
        const min = `${range.AgeMin} ${range.AgeMinUnit}`;
        const max = `${range.AgeMax} ${range.AgeMaxUnit}`;
        return `${min} - ${max}`;
    };
    return (
        <div className="mt-4" data-print-block data-print-table="true">
            {/* test name */}
            <p className="text-xs font-semibold text-black mb-1">
                Reference Ranges for{" "}
                <span className="font-bold" >
                    {(testName || "Test").toUpperCase()}
                </span>{" "}
                Across Different Age and Gender Groups
            </p>
            <p className="text-[9px] text-black mb-3 italic -mt-1 leading-tight">
                The following table shows reference ranges that vary by age and gender. These ranges may differ based on the
                methodology used. Please consult a qualified healthcare professional for proper interpretation. asda
            </p>
            <table className="w-full text-[13px] border border-black">
                <thead>
                    {/* test name */}

                    <tr className="bg-white">
                        <th className="p-2 font-bold border border-black text-left">GENDER</th>
                        <th className="p-2 font-bold border border-black text-left">AGE RANGE</th>
                        <th className="p-2 font-bold border border-black text-left">REFERENCE RANGE</th>
                    </tr>
                </thead>
                <tbody>
                    {ranges.map((range, idx) => (
                        <tr key={`reference-range-${idx}`} className="border-b border-black">
                            <td className="p-2 border-r border-black">{formatGender(range.Gender)}</td>
                            <td className="p-2 border-r border-black">{formatAge(range)}</td>
                            <td className="p-2">{range.ReferenceRange}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

interface DetailedReportSection {
    order?: number;
    title?: string;
    content?: string;
}

interface DetailedReportTable {
    title?: string;
    headers?: string[];
    rows?: (string | number | boolean | null)[][];
}

interface DetailedReport {
    title?: string;
    description?: string;
    sections?: DetailedReportSection[];
    tables?: DetailedReportTable[];
    impression?: string[];
}


const buildDetailedReportHTML = (reportJson?: string | null) => {
    if (!reportJson) return '';
    try {
        const parsed = JSON.parse(reportJson) as DetailedReport;

        const hasStructuredData =
            (parsed.tables && Array.isArray(parsed.tables) && parsed.tables.length > 0) ||
            (parsed.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0) ||
            (parsed.impression && Array.isArray(parsed.impression) && parsed.impression.length > 0);

        if (parsed && hasStructuredData) {
            const htmlParts: string[] = [];

            if (parsed.description) {
                htmlParts.push(`<p style="margin: 4px 0; font-size: 11px; line-height: 1.4; color: #000000; padding-bottom: 1px;">${parsed.description}</p>`);
            }

            if (parsed.impression && Array.isArray(parsed.impression) && parsed.impression.length > 0) {
                htmlParts.push(`<p style="margin: 4px 0; font-size: 11px; line-height: 1.4; color: #000000;"><strong style="color: #000000;">Impression:</strong> ${parsed.impression.join(', ')}</p>`);
            }

            if (parsed.tables && Array.isArray(parsed.tables) && parsed.tables.length > 0) {
                parsed.tables.forEach((table) => {
                    if (table.title) {
                        htmlParts.push(`<h4 style="font-size: 11px; font-weight: 600; margin: 8px 0 4px 0; color: #000000;">${table.title}</h4>`);
                    }
                    if (table.headers && Array.isArray(table.headers) && table.rows && Array.isArray(table.rows)) {
                        let tableHtml = '<table style="border-collapse: collapse; width: 100%; margin: 4px 0; font-size: 11px; border: 1px solid #000000;">';
                        tableHtml += '<thead><tr style="vertical-align: middle;">';
                        table.headers.forEach((header: string) => {
                            tableHtml += `<th style="border: 1px solid #000000; padding: 5px 8px; text-align: left; background-color: #ffffff; font-size: 11px; font-weight: bold; color: #000000; line-height: 1.4; vertical-align: middle;">${header}</th>`;
                        });
                        tableHtml += '</tr></thead>';
                        tableHtml += '<tbody>';
                        table.rows.forEach((row: (string | number | boolean | null)[]) => {
                            tableHtml += '<tr style="vertical-align: middle;">';
                            row.forEach((cell: string | number | boolean | null) => {
                                tableHtml += `<td style="border: 1px solid #000000; padding: 5px 8px; font-size: 11px; color: #000000; line-height: 1.4; vertical-align: middle;">${String(cell)}</td>`;
                            });
                            tableHtml += '</tr>';
                        });
                        tableHtml += '</tbody></table>';
                        htmlParts.push(tableHtml);
                    }
                });
            }

            if (parsed.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
                const sectionsHtml = parsed.sections
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((section) => {
                        const cleanedContent = String(section.content ?? '')
                            // ✅ STEP 1: Strip unwanted label paragraphs first
                            .replace(/<p>\s*<strong>\s*Tables:\s*<\/strong>\s*<\/p>/gi, '')
                            .replace(/<p>\s*<strong>\s*Sections:\s*<\/strong>\s*<\/p>/gi, '')
                            // ✅ STEP 2: Strip original background colors BEFORE injecting our styles
                            .replace(/background(?:-color)?:[^;"']*;?/gi, '')
                            // ✅ STEP 3: Remove colgroup
                            .replace(/<colgroup>[\s\S]*?<\/colgroup>/gi, '')
                            // ✅ STEP 4: Now inject clean table styles
                            .replace(/<table[^>]*>/gi, '<table style="border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 11px; border: 1px solid #000000;">')
                            .replace(/<tr[^>]*>/gi, '<tr style="vertical-align: middle;">')
                            .replace(/<th[^>]*>/gi, '<th style="border: 1px solid #000000; padding: 5px 8px; text-align: left; background-color: #ffffff; font-weight: bold; color: #000000; line-height: 1.4; vertical-align: middle;">')
                            .replace(/<td[^>]*>/gi, '<td style="border: 1px solid #000000; padding: 5px 8px; color: #000000; line-height: 1.4; vertical-align: middle;">')
                            // ✅ STEP 5: Strip <p> and <br> tags inside table cells
                            .replace(/(<t[dh][^>]*>)\s*(<p[^>]*>)?\s*/gi, '$1')
                            .replace(/\s*(<\/p>)?\s*(<\/t[dh]>)/gi, '$2')
                            .replace(/<br\s*\/?>\s*(<\/t[dh]>)/gi, '$1')
                            // ✅ STEP 6: Fix strong tags
                            .replace(/([^\s>])<strong>/g, '$1 <strong>')
                            .replace(/<strong>/g, '<strong style="color: #000000; font-weight: 700;">')
                            .replace(/<strong style="(?!color)/g, '<strong style="color: #000000; font-weight: 700; ')
                            // ✅ STEP 7: Fix list and paragraph styles
                            .replace(/<ul>/g, '<ul style="margin: 2px 0; padding-left: 16px; font-size: 11px; line-height: 1.4; color: #000000;">')
                            .replace(/<ol>/g, '<ol style="margin: 2px 0; padding-left: 16px; font-size: 11px; line-height: 1.4; color: #000000;">')
                            .replace(/<li>/g, '<li style="margin: 2px 0; color: #000000;">')
                            .replace(/<p>/g, '<p style="margin: 4px 0; font-size: 11px; line-height: 1.4; color: #000000; padding-bottom: 1px;">')
                            // ✅ STEP 8: Clean up empty style attributes
                            .replace(/style="\s*"/gi, '');

                        return `
                            <div style="margin-bottom: 8px; color: #000000; padding-bottom: 4px;">
                                ${section.title && section.title !== 'Formatted Report'
                                ? `<h4 style="font-size: 11px; font-weight: 700; margin: 6px 0 2px 0; color: #000000;">${section.title}</h4>`
                                : ''
                            }
                                <div style="font-size: 11px; line-height: 1.4; color: #000000; padding-bottom: 4px;">${cleanedContent}</div>
                            </div>
                        `;
                    })
                    .join('');
                htmlParts.push(sectionsHtml);
            }

            return `<div style="color: #000000; font-size: 11px; padding-bottom: 4px;">${htmlParts.join('')}</div>`;
        }

        return `<div style="color: #000000;">${formatMedicalReportToHTML(reportJson) || ''}</div>`;
    } catch {
        return `<div style="color: #000000;">${formatMedicalReportToHTML(reportJson) || ''}</div>`;
    }
};

export interface ConsolidatedReport {
    reportId: number;
    visitId: number;
    testName: string;
    testCategory?: string;
    testRows: TestRow[];
    reportJson?: string | null;
    referenceRanges?: string | null;
    createdDateTime?: string;
    referenceDescription?: string;
    referenceRange?: string;
    referenceAgeRange?: string;
    enteredValue?: string;
    unit?: string;
    reportCode?: string;
    patientCode?: string;
    visitCode?: string;
}

const getRowCountForOrdering = (report: ConsolidatedReport) => {
    if (Array.isArray(report.testRows) && report.testRows.length > 0) {
        return report.testRows.length;
    }
    return 1;
};

interface CommonReportView2Props {
    patientData: PatientData;
    doctorName?: string;
    hidePrintButton?: boolean;
    reportsData: ConsolidatedReport[];
}

const CommonReportView2 = ({
    patientData,
    doctorName,
    hidePrintButton = false,
    reportsData,
}: CommonReportView2Props) => {
    const { currentLab } = useLabs();
    const reportRef = useRef<HTMLDivElement>(null);
    const [printing, setPrinting] = useState(false);
    const [selectedReports, setSelectedReports] = useState<Record<number, boolean>>({});
    const [healthSnapshot, setHealthSnapshot] = useState<HealthSnapshot | null>(null);
    const [healthSnapshotLoading, setHealthSnapshotLoading] = useState(false);
    const [aiInsights, setAiInsights] = useState<AiReportInsights | null>(null);
    const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
    const [aiInsightsError, setAiInsightsError] = useState<string | null>(null);
    const [healthSnapshotFetched, setHealthSnapshotFetched] = useState(false);
    const sortedReports = useMemo(() => {
        const copy = [...reportsData];
        copy.sort((a, b) => {
            const diff = getRowCountForOrdering(a) - getRowCountForOrdering(b);
            if (diff !== 0) return diff;
            const nameA = (a.testName || "").trim().toLowerCase();
            const nameB = (b.testName || "").trim().toLowerCase();
            return nameA.localeCompare(nameB);
        });
        return copy;
    }, [reportsData]);

    useEffect(() => {
        if (!Array.isArray(reportsData)) {
            setSelectedReports({});
            return;
        }
        // Debug: Log report codes to verify data
        reportsData.forEach((report) => {
            console.log(`Report ${report.reportId} (${report.testName}):`, {
                reportCode: report.reportCode,
                patientCode: report.patientCode,
                visitCode: report.visitCode,
            });
        });
        setSelectedReports((prev) => {
            const next: Record<number, boolean> = {};
            reportsData.forEach((report) => {
                next[report.reportId] = prev[report.reportId] ?? true;
            });
            return next;
        });
    }, [reportsData]);

    const selectedReportIds = useMemo(
        () => Object.entries(selectedReports).filter(([, value]) => value).map(([key]) => Number(key)),
        [selectedReports]
    );

    // Lab systems typically carry a separate "critical" threshold band beyond the plain
    // reference range, but this data model only stores a single min-max range. We
    // approximate that band as a percentage of the range's own width: a result just past
    // the boundary reads as borderline, one far past it reads as critical.
    const BORDERLINE_RANGE_RATIO = 0.15;

    const scoreValue = (enteredValue?: string, normalRange?: string): RowScore => {
        if (!enteredValue || !normalRange || enteredValue === "N/A" || normalRange === "N/A") {
            return { kind: "unscored" };
        }

        const value = parseFloat(enteredValue);
        if (isNaN(value)) {
            return { kind: "unscored" };
        }

        const range = normalRange.trim();
        const bucket = (overshoot: number, direction: "high" | "low"): RowScore => ({
            kind: overshoot > BORDERLINE_RANGE_RATIO ? "critical" : "borderline",
            direction,
        });

        // Format 1: "1000 - 4800" or "1000-4800" (min-max range)
        const rangeMatch = range.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
        if (rangeMatch) {
            const min = parseFloat(rangeMatch[1]);
            const max = parseFloat(rangeMatch[2]);
            const width = Math.max(max - min, Number.EPSILON);
            if (value < min) return bucket((min - value) / width, "low");
            if (value > max) return bucket((value - max) / width, "high");
            return { kind: "normal" };
        }

        // Format 2: "< 5.0" or "<5.0" (less than threshold)
        const lessThanMatch = range.match(/<\s*(\d+(?:\.\d+)?)/);
        if (lessThanMatch) {
            const threshold = parseFloat(lessThanMatch[1]);
            if (value >= threshold) return bucket(threshold > 0 ? (value - threshold) / threshold : 1, "high");
            return { kind: "normal" };
        }

        // Format 3: "> 10.0" or ">10.0" (greater than threshold)
        const greaterThanMatch = range.match(/>\s*(\d+(?:\.\d+)?)/);
        if (greaterThanMatch) {
            const threshold = parseFloat(greaterThanMatch[1]);
            if (value <= threshold) return bucket(threshold > 0 ? (threshold - value) / threshold : 1, "low");
            return { kind: "normal" };
        }

        // Format 4: Qualitative ranges (Normal, Negative, Positive, etc.) can't be scored numerically
        return { kind: "unscored" };
    };

    // Drives the Clinical Alert Summary counts, Key Findings list, Overall Risk Score,
    // and Clinical Attention Required section from the same row data already rendered in
    // Detailed Lab Results -- no separate AI/analytics backend involved.
    const clinicalSummary = useMemo(() => {
        let critical = 0;
        let borderline = 0;
        let normal = 0;
        const findings: ClinicalFinding[] = [];
        const normalReportNames: string[] = [];

        sortedReports.forEach((report) => {
            const rows =
                report.testRows && report.testRows.length > 0
                    ? report.testRows
                    : [
                        {
                            testParameter: report.referenceDescription || report.testName,
                            normalRange: report.referenceRange,
                            enteredValue: report.enteredValue,
                            unit: report.unit,
                        },
                    ];

            let reportHasScoredRow = false;
            let reportHasAbnormality = false;

            rows.forEach((row) => {
                if (isExcludedQualitativeRow(row)) return;
                const score = scoreValue(row.enteredValue, row.normalRange);
                if (score.kind === "unscored") return;

                reportHasScoredRow = true;
                if (score.kind === "normal") {
                    normal += 1;
                    return;
                }

                reportHasAbnormality = true;
                if (score.kind === "critical") critical += 1;
                else borderline += 1;
                findings.push({ report, row, kind: score.kind, direction: score.direction });
            });

            if (reportHasScoredRow && !reportHasAbnormality) {
                normalReportNames.push(report.testName);
            }
        });

        const severityRank: Record<ClinicalFinding["kind"], number> = { critical: 0, borderline: 1 };
        findings.sort((a, b) => severityRank[a.kind] - severityRank[b.kind]);

        const totalScored = critical + borderline + normal;
        const overallRisk: "HIGH" | "MODERATE" | "LOW" | null =
            totalScored === 0 ? null : critical > 0 ? "HIGH" : borderline > 0 ? "MODERATE" : "LOW";

        return { critical, borderline, normal, findings, normalReportNames, overallRisk };
    }, [sortedReports]);

    // Full (not just abnormal) row-level view of the current report, shaped for the AI prompt --
    // reuses the same row extraction/scoring as clinicalSummary above.
    const aiTestFindings = useMemo<AiTestFinding[]>(() => {
        const results: AiTestFinding[] = [];
        sortedReports.forEach((report) => {
            const rows =
                report.testRows && report.testRows.length > 0
                    ? report.testRows
                    : [
                        {
                            testParameter: report.referenceDescription || report.testName,
                            normalRange: report.referenceRange,
                            enteredValue: report.enteredValue,
                            unit: report.unit,
                        },
                    ];

            rows.forEach((row) => {
                if (isExcludedQualitativeRow(row)) return;
                const score = scoreValue(row.enteredValue, row.normalRange);
                results.push({
                    testName: report.testName,
                    parameter: row.testParameter || report.testName,
                    value: row.enteredValue || "N/A",
                    unit: row.unit,
                    normalRange: row.normalRange,
                    status: score.kind,
                    direction: score.kind === "critical" || score.kind === "borderline" ? score.direction : undefined,
                });
            });
        });
        return results;
    }, [sortedReports]);

    // Flattens the patient's Health Snapshot (test-by-test visit history) into the
    // shape the AI prompt expects, so it can reason about trends vs. the current report.
    const aiHistoryPoints = useMemo<AiHistoryPoint[]>(() => {
        if (!healthSnapshot) return [];
        const points: AiHistoryPoint[] = [];
        healthSnapshot.tests.forEach((test) => {
            test.results.forEach((result) => {
                points.push({
                    testName: test.testName,
                    visitDate: result.visitDate,
                    value: result.enteredValue,
                    unit: result.unit,
                    normalRange: result.referenceRange,
                });
            });
        });
        return points;
    }, [healthSnapshot]);

    // Fetch the patient's Health Snapshot (test history across visits) whenever the report is viewed.
    useEffect(() => {
        if (!currentLab?.id || !patientData?.patientId) {
            setHealthSnapshot(null);
            setHealthSnapshotFetched(true);
            return;
        }

        let cancelled = false;
        setHealthSnapshotLoading(true);
        getPatientHealthSnapshot(currentLab.id, patientData.patientId)
            .then((snapshot) => {
                if (!cancelled) setHealthSnapshot(snapshot);
            })
            .catch(() => {
                if (!cancelled) setHealthSnapshot(null);
            })
            .finally(() => {
                if (!cancelled) {
                    setHealthSnapshotLoading(false);
                    setHealthSnapshotFetched(true);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [currentLab?.id, patientData?.patientId]);

    // Auto-generate AI Clinical Observations once the report data (and, if available, the
    // Health Snapshot history) are ready. Cached only in this component's state for the
    // session -- reopening the report later regenerates it.
    useEffect(() => {
        if (!healthSnapshotFetched || aiTestFindings.length === 0) {
            return;
        }

        let cancelled = false;
        setAiInsightsLoading(true);
        setAiInsightsError(null);
        fetch("/api/ai-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                patient: {
                    name: patientData?.patientname,
                    age: formatAgeForDisplay(patientData?.dateOfBirth || ""),
                    gender: patientData?.gender,
                },
                testFindings: aiTestFindings,
                history: aiHistoryPoints,
            }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    const body = await response.json().catch(() => null);
                    throw new Error(body?.message || "Failed to generate AI insights");
                }
                return response.json() as Promise<AiReportInsights>;
            })
            .then((data) => {
                if (!cancelled) setAiInsights(data);
            })
            .catch((err) => {
                if (!cancelled) setAiInsightsError(err instanceof Error ? err.message : "Failed to generate AI insights");
            })
            .finally(() => {
                if (!cancelled) setAiInsightsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [healthSnapshotFetched, aiTestFindings, aiHistoryPoints, patientData?.patientname, patientData?.dateOfBirth, patientData?.gender]);

    const getFindingBadge = (finding: ClinicalFinding) => {
        const directionLabel = finding.direction === "high" ? "HIGH" : "LOW";
        return {
            label: finding.kind === "borderline" ? `BORDERLINE ${directionLabel}` : directionLabel,
            color: finding.kind === "critical" ? REPORT_COLORS.warning500 : REPORT_COLORS.danger500,
        };
    };

    const totalReports = reportsData.length;
    const selectedCount = selectedReportIds.length;
    const isAllSelected = totalReports > 0 && selectedCount === totalReports;

    const handleToggleReport = (reportId: number, checked: boolean) => {
        setSelectedReports((prev) => ({
            ...prev,
            [reportId]: checked,
        }));
    };

    const handleToggleAll = (checked: boolean) => {
        setSelectedReports(
            reportsData.reduce<Record<number, boolean>>((acc, report) => {
                acc[report.reportId] = checked;
                return acc;
            }, {})
        );
    };

    const renderNodeToCanvas = async (node: HTMLElement, scale: number) => {
        const canvasOptions: Html2CanvasEnhancedOptions = {
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            scale,
            windowWidth: node.scrollWidth,
            windowHeight: node.scrollHeight,
            logging: false,
        };
        const canvas = await html2canvas(node, canvasOptions);
        const context = canvas.getContext("2d");
        if (context) {
            context.imageSmoothingEnabled = true;
            (context as CanvasRenderingContext2D & { imageSmoothingQuality?: "low" | "medium" | "high" }).imageSmoothingQuality = "high";
        }
        return canvas;
    };

    // Blocks carry their own on-screen mt-4/mt-6 spacing via Tailwind classes, which gets baked into
    // each block's captured canvas. BLOCK_GAP_MM already adds spacing between blocks programmatically,
    // so leaving the CSS margin in place doubles the gap. Zero it out on the clone before capture.
    const stripBlockMargins = (el: HTMLElement) => {
        el.style.marginTop = "0";
        el.style.marginBottom = "0";
    };

    const canvasToMm = (canvas: HTMLCanvasElement, widthMm: number) => {
        const heightMm = (canvas.height * widthMm) / canvas.width;
        return { widthMm, heightMm };
    };

    const addCanvasAtCursor = (pdf: jsPDF, canvas: HTMLCanvasElement, xMm: number, yMm: number, widthMm: number, heightMm: number) => {
        // PNG (lossless) instead of JPEG: JPEG's chroma subsampling blurs/ghosts small bold text
        // (patient names, values) even at quality 1, and jsPDF's "FAST" compression compounds it.
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", xMm, yMm, widthMm, heightMm, undefined, "NONE");
    };

    const sliceCanvasByHeight = (canvas: HTMLCanvasElement, maxSliceHeightPx: number) => {
        const slices: HTMLCanvasElement[] = [];
        let offsetY = 0;
        const safeSliceHeight = Math.max(1, maxSliceHeightPx);

        while (offsetY < canvas.height) {
            const sliceHeight = Math.min(safeSliceHeight, canvas.height - offsetY);
            const slice = document.createElement("canvas");
            slice.width = canvas.width;
            slice.height = sliceHeight;
            const sliceContext = slice.getContext("2d");
            if (sliceContext) {
                sliceContext.drawImage(canvas, 0, offsetY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
            }
            slices.push(slice);
            offsetY += sliceHeight;
        }

        return slices;
    };

    const chunkTableElementByRows = (tableWrapper: HTMLElement, maxChunkHeightPx: number) => {
        const sourceTable = tableWrapper.querySelector("table");
        if (!sourceTable) {
            return [tableWrapper.cloneNode(true) as HTMLElement];
        }

        const sourceThead = sourceTable.querySelector("thead");
        const sourceRows = Array.from(sourceTable.querySelectorAll("tbody tr"));
        if (sourceRows.length === 0) {
            return [tableWrapper.cloneNode(true) as HTMLElement];
        }

        const measurementHost = document.createElement("div");
        measurementHost.style.position = "absolute";
        measurementHost.style.left = "-9999px";
        measurementHost.style.top = "0";
        measurementHost.style.width = "210mm";
        measurementHost.style.visibility = "hidden";
        measurementHost.style.pointerEvents = "none";
        document.body.appendChild(measurementHost);

        const chunks: HTMLElement[] = [];

        const createChunk = () => {
            const wrapperClone = tableWrapper.cloneNode(false) as HTMLElement;
            const tableClone = sourceTable.cloneNode(false) as HTMLTableElement;

            if (sourceThead) {
                tableClone.appendChild(sourceThead.cloneNode(true));
            }

            const tbody = document.createElement("tbody");
            tableClone.appendChild(tbody);
            wrapperClone.appendChild(tableClone);
            return { wrapperClone, tbody };
        };

        let currentChunk = createChunk();
        measurementHost.appendChild(currentChunk.wrapperClone);

        sourceRows.forEach((row) => {
            const candidateRow = row.cloneNode(true) as HTMLTableRowElement;
            currentChunk.tbody.appendChild(candidateRow);

            const hasMultipleRows = currentChunk.tbody.children.length > 1;
            if (currentChunk.wrapperClone.offsetHeight > maxChunkHeightPx && hasMultipleRows) {
                currentChunk.tbody.removeChild(candidateRow);
                chunks.push(currentChunk.wrapperClone.cloneNode(true) as HTMLElement);
                measurementHost.removeChild(currentChunk.wrapperClone);

                currentChunk = createChunk();
                measurementHost.appendChild(currentChunk.wrapperClone);
                currentChunk.tbody.appendChild(row.cloneNode(true));
            }
        });

        if (currentChunk.tbody.children.length > 0) {
            chunks.push(currentChunk.wrapperClone.cloneNode(true) as HTMLElement);
        }

        document.body.removeChild(measurementHost);
        return chunks.length > 0 ? chunks : [tableWrapper.cloneNode(true) as HTMLElement];
    };

    const printReports = async () => {
        if (!reportRef.current || selectedReportIds.length === 0) {
            toast.error("Select at least one report to print");
            return;
        }

        setPrinting(true);
        let tempContainer: HTMLDivElement | null = null;
        try {
            const pdf = new jsPDF({
                orientation: "p",
                unit: "mm",
                format: "a4",
                compress: true,
            });
            const selectedSet = new Set(selectedReportIds);
            const shell = reportRef.current.querySelector("[data-report-shell]") as HTMLElement | null;
            const sections = shell ? [shell] : [];

            if (sections.length === 0) {
                toast.error("Selected reports are unavailable for printing");
                return;
            }

            const renderScale = Math.max(2, Math.min((window.devicePixelRatio || 1) * 1.5, 3));
            tempContainer = document.createElement("div");
            tempContainer.style.position = "absolute";
            tempContainer.style.left = "-9999px";
            tempContainer.style.top = "0";
            tempContainer.style.width = "210mm";
            tempContainer.style.padding = "0";
            tempContainer.style.margin = "0";
            tempContainer.style.backgroundColor = "#ffffff";
            tempContainer.style.fontFamily = DEFAULT_FONT_FAMILY;
            tempContainer.style.color = BASE_TEXT_COLOR;
            document.body.appendChild(tempContainer);

            let headerCanvas: HTMLCanvasElement | null = null;
            let signatureCanvas: HTMLCanvasElement | null = null;
            let footerCanvas: HTMLCanvasElement | null = null;
            let headerHeightMm = 0;
            let signatureHeightMm = 0;
            let footerHeightMm = 0;
            const pageTemplateSection = sections[0].cloneNode(true) as HTMLElement;
            pageTemplateSection.style.width = "210mm";
            pageTemplateSection.style.maxWidth = "210mm";
            pageTemplateSection.style.margin = "0 auto";
            pageTemplateSection.style.boxSizing = "border-box";
            pageTemplateSection.style.backgroundColor = "#ffffff";
            pageTemplateSection.style.fontFamily = DEFAULT_FONT_FAMILY;
            pageTemplateSection.style.color = BASE_TEXT_COLOR;
            tempContainer.appendChild(pageTemplateSection);

            const headerTemplate = pageTemplateSection.querySelector('[data-print-role="header"]') as HTMLElement | null;
            const signatureTemplate = pageTemplateSection.querySelector('[data-print-role="signature"]') as HTMLElement | null;
            const footerTemplate = pageTemplateSection.querySelector('[data-print-role="footer"]') as HTMLElement | null;

            if (headerTemplate) {
                stripBlockMargins(headerTemplate);
                headerCanvas = await renderNodeToCanvas(headerTemplate, renderScale);
                headerHeightMm = canvasToMm(headerCanvas, PAGE_WIDTH_MM).heightMm;
            }
            if (signatureTemplate) {
                stripBlockMargins(signatureTemplate);
                signatureCanvas = await renderNodeToCanvas(signatureTemplate, renderScale);
                signatureHeightMm = canvasToMm(signatureCanvas, PAGE_WIDTH_MM).heightMm;
            }
            if (footerTemplate) {
                stripBlockMargins(footerTemplate);
                footerCanvas = await renderNodeToCanvas(footerTemplate, renderScale);
                footerHeightMm = canvasToMm(footerCanvas, PAGE_WIDTH_MM).heightMm;
            }
            tempContainer.removeChild(pageTemplateSection);

            const contentTopMm = TOP_MARGIN_MM + (headerHeightMm > 0 ? headerHeightMm + BLOCK_GAP_MM : 0);
            // Signature/footer are no longer reserved on every page -- they're appended to the
            // normal content flow after the last block, so a report that fits on one page (the
            // Figma target) actually stays on one page instead of leaving a permanent blank gap
            // sized for a footer that only ever gets drawn on the final page.
            const contentBottomMm = PAGE_HEIGHT_MM - BOTTOM_MARGIN_MM - CONTENT_SAFETY_MM;
            const usableContentHeightMm = contentBottomMm - contentTopMm > 0 ? contentBottomMm - contentTopMm : USABLE_HEIGHT_MM;

            let currentPageNumber = 1;
            const contentPages = new Set<number>();
            let currentY = contentTopMm;
            let hasContentOnPage = false;

            const startNewPage = () => {
                pdf.addPage();
                currentPageNumber += 1;
                currentY = contentTopMm;
                hasContentOnPage = false;
            };

            const placeCanvasWithPagination = (canvas: HTMLCanvasElement) => {
                const { widthMm, heightMm } = canvasToMm(canvas, PAGE_WIDTH_MM);
                const remainingMm = contentBottomMm - currentY;

                if (heightMm <= remainingMm) {
                    addCanvasAtCursor(pdf, canvas, MARGIN_X_MM, currentY, widthMm, heightMm);
                    currentY += heightMm + BLOCK_GAP_MM;
                    hasContentOnPage = true;
                    contentPages.add(currentPageNumber);
                    return;
                }

                if (heightMm <= usableContentHeightMm) {
                    if (hasContentOnPage) {
                        startNewPage();
                    }
                    addCanvasAtCursor(pdf, canvas, MARGIN_X_MM, currentY, widthMm, heightMm);
                    currentY += heightMm + BLOCK_GAP_MM;
                    hasContentOnPage = true;
                    contentPages.add(currentPageNumber);
                    return;
                }

                const pxPerMm = canvas.height / heightMm;
                const maxSliceHeightPx = Math.max(1, Math.floor(usableContentHeightMm * pxPerMm));
                const slices = sliceCanvasByHeight(canvas, maxSliceHeightPx);

                slices.forEach((slice, sliceIndex) => {
                    if (sliceIndex > 0 || hasContentOnPage) {
                        startNewPage();
                    }
                    const sliceDims = canvasToMm(slice, PAGE_WIDTH_MM);
                    addCanvasAtCursor(pdf, slice, MARGIN_X_MM, currentY, sliceDims.widthMm, sliceDims.heightMm);
                    currentY += sliceDims.heightMm + BLOCK_GAP_MM;
                    hasContentOnPage = true;
                    contentPages.add(currentPageNumber);
                });
            };

            for (const section of sections) {
                const sectionClone = section.cloneNode(true) as HTMLElement;
                sectionClone.style.width = "210mm";
                sectionClone.style.maxWidth = "210mm";
                sectionClone.style.margin = "0 auto";
                sectionClone.style.boxSizing = "border-box";
                sectionClone.style.backgroundColor = "#ffffff";
                sectionClone.style.fontFamily = DEFAULT_FONT_FAMILY;
                sectionClone.style.color = BASE_TEXT_COLOR;
                sectionClone.style.pageBreakAfter = "auto";

                const sectionBody = sectionClone.firstElementChild as HTMLElement | null;
                if (sectionBody) {
                    sectionBody.style.minHeight = "auto";
                    sectionBody.style.height = "auto";
                }

                tempContainer.appendChild(sectionClone);

                const gridCards = Array.from(sectionClone.querySelectorAll("[data-report-id]")) as HTMLElement[];
                gridCards.forEach((card) => {
                    const cardId = Number(card.getAttribute("data-report-id"));
                    if (!selectedSet.has(cardId)) {
                        card.remove();
                    }
                });

                // A merged multi-report table with every one of its <tbody> groups
                // deselected would otherwise leave a floating header row with no data.
                const mergedTables = Array.from(sectionClone.querySelectorAll('[data-print-table="true"] table')) as HTMLTableElement[];
                mergedTables.forEach((table) => {
                    if (table.querySelectorAll("tbody").length === 0) {
                        table.closest('[data-print-table="true"]')?.remove();
                    }
                });

                // Keep the on-screen 2-column grid intact for capture so the PDF matches the
                // preview exactly instead of flattening into a single stacked column.
                const resultsGrid = sectionClone.querySelector("[data-results-grid]") as HTMLElement | null;
                if (resultsGrid) {
                    // Deselecting every test in a balanced column would otherwise leave an empty
                    // bordered box in the export -- drop columns that ended up with nothing in them.
                    Array.from(resultsGrid.children).forEach((column) => {
                        if (!column.querySelector("[data-report-id]")) {
                            column.remove();
                        }
                    });
                }
                const detailedResultsList = sectionClone.querySelector("[data-detailed-results]") as HTMLElement | null;
                if (detailedResultsList) {
                    Array.from(detailedResultsList.children).forEach((entry) => {
                        if (!entry.querySelector("[data-report-id]")) {
                            entry.remove();
                        }
                    });
                }

                const blocks = Array.from(sectionClone.querySelectorAll("[data-print-block]")) as HTMLElement[];
                const topLevelBlocks = blocks.filter((block) => !block.parentElement?.closest("[data-print-block]"));
                const contentBlocks = topLevelBlocks.filter((block) => {
                    const role = block.getAttribute("data-print-role");
                    return role !== "header" && role !== "signature" && role !== "footer";
                });
                const nodesToRender = contentBlocks.length > 0 ? contentBlocks : [sectionClone];
                nodesToRender.forEach(stripBlockMargins);

                for (const node of nodesToRender) {
                    const isTableBlock = node.getAttribute("data-print-table") === "true";

                    if (!isTableBlock) {
                        const canvas = await renderNodeToCanvas(node, renderScale);
                        placeCanvasWithPagination(canvas);
                        continue;
                    }

                    const fullCanvas = await renderNodeToCanvas(node, renderScale);
                    const fullDims = canvasToMm(fullCanvas, PAGE_WIDTH_MM);
                    const remainingMm = contentBottomMm - currentY;

                    if (fullDims.heightMm <= remainingMm) {
                        addCanvasAtCursor(pdf, fullCanvas, MARGIN_X_MM, currentY, fullDims.widthMm, fullDims.heightMm);
                        currentY += fullDims.heightMm + BLOCK_GAP_MM;
                        hasContentOnPage = true;
                        contentPages.add(currentPageNumber);
                        continue;
                    }

                    if (fullDims.heightMm <= usableContentHeightMm) {
                        if (hasContentOnPage) {
                            startNewPage();
                        }
                        addCanvasAtCursor(pdf, fullCanvas, MARGIN_X_MM, currentY, fullDims.widthMm, fullDims.heightMm);
                        currentY += fullDims.heightMm + BLOCK_GAP_MM;
                        hasContentOnPage = true;
                        contentPages.add(currentPageNumber);
                        continue;
                    }

                    const pxPerMm = fullCanvas.height / fullDims.heightMm;
                    const maxChunkHeightPx = Math.max(1, Math.floor(usableContentHeightMm * pxPerMm));
                    const chunkNodes = chunkTableElementByRows(node, maxChunkHeightPx);

                    for (const chunkNode of chunkNodes) {
                        tempContainer.appendChild(chunkNode);
                        const chunkCanvas = await renderNodeToCanvas(chunkNode, renderScale);
                        tempContainer.removeChild(chunkNode);

                        const chunkDims = canvasToMm(chunkCanvas, PAGE_WIDTH_MM);
                        const chunkRemainingMm = contentBottomMm - currentY;
                        if (chunkDims.heightMm > chunkRemainingMm && hasContentOnPage) {
                            startNewPage();
                        }

                        if (chunkDims.heightMm <= usableContentHeightMm) {
                            addCanvasAtCursor(pdf, chunkCanvas, MARGIN_X_MM, currentY, chunkDims.widthMm, chunkDims.heightMm);
                            currentY += chunkDims.heightMm + BLOCK_GAP_MM;
                            hasContentOnPage = true;
                            contentPages.add(currentPageNumber);
                            continue;
                        }

                        const chunkPxPerMm = chunkCanvas.height / chunkDims.heightMm;
                        const maxSliceHeightPx = Math.max(1, Math.floor(usableContentHeightMm * chunkPxPerMm));
                        const chunkSlices = sliceCanvasByHeight(chunkCanvas, maxSliceHeightPx);
                        chunkSlices.forEach((slice, sliceIndex) => {
                            if (sliceIndex > 0 || hasContentOnPage) {
                                startNewPage();
                            }
                            const sliceDims = canvasToMm(slice, PAGE_WIDTH_MM);
                            addCanvasAtCursor(pdf, slice, MARGIN_X_MM, currentY, sliceDims.widthMm, sliceDims.heightMm);
                            currentY += sliceDims.heightMm + BLOCK_GAP_MM;
                            hasContentOnPage = true;
                            contentPages.add(currentPageNumber);
                        });
                    }
                }

                tempContainer.removeChild(sectionClone);
            }

            // Signature and footer are just the last two blocks in the flow: they land right after
            // the content on the same page when there's room (the Figma single-page case), and only
            // push to a new page if they genuinely don't fit.
            if (signatureCanvas && signatureHeightMm > 0) {
                placeCanvasWithPagination(signatureCanvas);
            }
            if (footerCanvas && footerHeightMm > 0) {
                placeCanvasWithPagination(footerCanvas);
            }

            const pagesToStamp = Array.from(contentPages).sort((a, b) => a - b);
            pagesToStamp.forEach((pageNo) => {
                pdf.setPage(pageNo);
                if (headerCanvas && headerHeightMm > 0) {
                    addCanvasAtCursor(pdf, headerCanvas, MARGIN_X_MM, TOP_MARGIN_MM, PAGE_WIDTH_MM, headerHeightMm);
                }
            });

            const pdfBlob = pdf.output("blob");
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, "_blank");
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("Failed to generate PDF");
        } finally {
            if (tempContainer && document.body.contains(tempContainer)) {
                document.body.removeChild(tempContainer);
            }
            setPrinting(false);
        }
    };

    if (!Array.isArray(reportsData) || reportsData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <TbInfoCircle className="mb-4 text-5xl text-black" />
                <h3 className="mb-2 text-xl font-bold text-black">No Test Results Available</h3>
                <p className="max-w-md text-black">
                    The report data for this visit is not available. Please check with the lab staff for more information.
                </p>
            </div>
        );
    }

    const displayDoctorName = doctorName || "N/A";
    const primaryReport = sortedReports[0];
    const latestReportDateTime = sortedReports.reduce<string | undefined>((latest, r) => {
        if (!r.createdDateTime) return latest;
        if (!latest) return r.createdDateTime;
        return new Date(r.createdDateTime) > new Date(latest) ? r.createdDateTime : latest;
    }, undefined);

    const formatReportDateTime = (
        dateTimeString?: string
    ): { date: string; time: string } => {
        if (!dateTimeString) {
            return { date: '--/--/----', time: '--:--' };
        }

        // Check if dateTimeString already has a timezone (Z, +HH:MM, +HHMM, -HH:MM, -HHMM)
        const hasTimezone = /[Z+-]\d{2}:?\d{2}$|[Z+-]\d{4}$/.test(dateTimeString);

        // Only append +05:30 if no timezone exists
        const dateStrWithTimezone = hasTimezone ? dateTimeString : `${dateTimeString}+05:30`;

        const dateObj = new Date(dateStrWithTimezone);

        if (isNaN(dateObj.getTime())) {
            return { date: '--/--/----', time: '--:--' };
        }

        const date = dateObj.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'Asia/Kolkata'
        });

        const time = dateObj.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });

        return { date, time };
    };

    const isDetailedReportEntry = (report: ConsolidatedReport) => {
        if (report.reportJson) return true;
        const rows = report.testRows && report.testRows.length > 0 ? report.testRows : [];
        return rows.some((row) => (row.referenceDescription || '').toUpperCase() === 'DETAILED REPORT');
    };

    const estimateReportWeight = (report: ConsolidatedReport) => {
        const rowCount = report.testRows && report.testRows.length > 0 ? report.testRows.length : 1;
        const isCBC = (report.testName || '').toUpperCase().includes('CBC');
        return 1 + rowCount + (isCBC ? 1 : 0);
    };

    // Status icon uses the pre-colored assets in public/report: green tick for
    // in-range results, amber triangle for borderline, red/yellow directional arrow
    // for critical values (elevated vs. reduced).
    const getStatusIndicator = (enteredValue?: string, normalRange?: string) => {
        const score = scoreValue(enteredValue, normalRange);
        if (score.kind === "normal" || score.kind === "unscored") {
            return { src: "/report/check-circle.png", alt: "Normal" };
        }
        if (score.kind === "borderline") {
            return { src: "/report/exclamation-triangle/outline.png", alt: "Borderline" };
        }
        return score.direction === "low"
            ? { src: "/report/arrow-down-circle.png", alt: "Below range" }
            : { src: "/report/arrow-up-circle.png", alt: "Above range" };
    };

    // Explicit pixel widths (not just Tailwind width classes) so the numeric columns
    // reserve real space and never get squeezed into the wrapped parameter text.
    const RESULT_COL_WIDTHS = { parameter: undefined, result: 50, reference: 90, units: 70, status: 34 } as const;
    const RESULT_TABLE_ROW_BORDER = `1px solid ${REPORT_COLORS.secondary100}`;
    const RESULT_CELL_VALIGN: CSSProperties = { verticalAlign: "top" };

    const renderResultTableHeaderRow = () => (
        <tr style={{ backgroundColor: REPORT_COLORS.secondary200 }}>
            <th className="px-3 py-3 text-left text-[10px] font-bold" style={{ color: REPORT_COLORS.neutral800, ...RESULT_CELL_VALIGN }}>Test Parameter</th>
            <th className="px-1 py-3 text-center text-[10px] font-bold" style={{ color: REPORT_COLORS.neutral800, width: RESULT_COL_WIDTHS.result, ...RESULT_CELL_VALIGN }}>Result</th>
            <th className="px-1 py-3 text-center text-[10px] font-bold" style={{ color: REPORT_COLORS.neutral800, width: RESULT_COL_WIDTHS.reference, ...RESULT_CELL_VALIGN }}>Reference Range</th>
            <th className="px-1 py-3 text-center text-[10px] font-bold" style={{ color: REPORT_COLORS.neutral800, width: RESULT_COL_WIDTHS.units, ...RESULT_CELL_VALIGN }}>Units</th>
            <th className="px-1 py-3 text-center text-[10px] font-bold" style={{ color: REPORT_COLORS.neutral800, width: RESULT_COL_WIDTHS.status, ...RESULT_CELL_VALIGN }}>Status</th>
        </tr>
    );

    const renderSectionTitleRow = (key: string | number, label: string) => (
        <tr key={`section-${key}`}>
            <td
                colSpan={5}
                className="px-3 py-1.5 text-[10px] font-bold uppercase"
                style={{ backgroundColor: REPORT_COLORS.secondary50, color: REPORT_COLORS.neutral800 }}
            >
                {label}
            </td>
        </tr>
    );

    // Non-tabular content (a full JSON detailed report, or a qualitative-only
    // Test Name/Result table) can't use a table row for its title band.
    const renderSectionTitleBand = (label: string) => (
        <div
            className="px-3 py-1.5 text-[10px] font-bold uppercase"
            style={{ backgroundColor: REPORT_COLORS.secondary50, color: REPORT_COLORS.neutral800 }}
        >
            {label}
        </div>
    );

    // Shared row-builder used both by standalone report cards and by the merged
    // multi-report table (Figma groups several "pure quantitative" tests under one
    // continuous table with a single header instead of repeating it per test).
    const buildResultTableRows = (
        reportId: number,
        rows: TestRow[],
        isCBCTest: boolean,
        emptyMessage: string = "No quantitative results available."
    ): JSX.Element[] => {
        if (rows.length === 0) {
            return [
                <tr key={`no-quant-${reportId}`}>
                    <td colSpan={5} className="px-3 py-3 text-center text-xs" style={{ color: REPORT_COLORS.neutral600, borderBottom: RESULT_TABLE_ROW_BORDER }}>
                        {emptyMessage}
                    </td>
                </tr>,
            ];
        }

        const entries: RenderRowEntry[] = isCBCTest ? buildOrderedCBCRows(rows) : rows.map((row) => ({ type: "row", row }));
        const elements: JSX.Element[] = [];

        entries.forEach((entry, idx) => {
            if (entry.type === "header") {
                elements.push(renderSectionTitleRow(`${reportId}-${entry.key}-${idx}`, entry.key));
                return;
            }

            const row = entry.row;
            const parameterLabel = isCBCTest ? (row.testParameter || "").toUpperCase() : row.testParameter;
            const status = getStatusIndicator(row.enteredValue, row.normalRange);

            elements.push(
                <tr key={`${reportId}-${idx}`}>
                    <td
                        className="px-3 py-2 text-xs font-normal"
                        style={{
                            color: REPORT_COLORS.neutral900,
                            borderBottom: RESULT_TABLE_ROW_BORDER,
                            wordBreak: "break-word",
                            ...RESULT_CELL_VALIGN,
                        }}
                    >
                        {parameterLabel}
                    </td>
                    <td
                        className="px-1 py-2 text-center text-xs font-semibold"
                        style={{ color: REPORT_COLORS.neutral900, borderBottom: RESULT_TABLE_ROW_BORDER, width: RESULT_COL_WIDTHS.result, whiteSpace: "nowrap", ...RESULT_CELL_VALIGN }}
                    >
                        {row.enteredValue || "N/A"}
                    </td>
                    <td
                        className="px-1 py-2 text-center text-xs font-normal"
                        style={{ color: REPORT_COLORS.neutral600, borderBottom: RESULT_TABLE_ROW_BORDER, width: RESULT_COL_WIDTHS.reference, whiteSpace: "nowrap", ...RESULT_CELL_VALIGN }}
                    >
                        {row.normalRange || "N/A"}
                    </td>
                    <td
                        className="px-1 py-2 text-center text-xs font-normal"
                        style={{ color: REPORT_COLORS.neutral600, borderBottom: RESULT_TABLE_ROW_BORDER, width: RESULT_COL_WIDTHS.units, whiteSpace: "nowrap", ...RESULT_CELL_VALIGN }}
                    >
                        {row.unit || "N/A"}
                    </td>
                    <td
                        className="px-1 py-2 text-center"
                        style={{ borderBottom: RESULT_TABLE_ROW_BORDER, width: RESULT_COL_WIDTHS.status, ...RESULT_CELL_VALIGN }}
                    >
                        <img
                            src={status.src}
                            alt={status.alt}
                            title={status.alt}
                            className="inline-block w-3.5 h-3.5"
                            crossOrigin="anonymous"
                        />
                    </td>
                </tr>
            );
        });

        return elements;
    };

    // A report can be folded into the shared multi-test table only if every row is a
    // plain numeric/qualitative-range result -- reports with free-text qualitative rows
    // or a full JSON "detailed report" keep their own standalone card instead.
    const isPureQuantitativeReport = (report: ConsolidatedReport) => {
        if (isDetailedReportEntry(report)) return false;
        const rows =
            report.testRows && report.testRows.length > 0
                ? report.testRows
                : [
                    {
                        testParameter: report.referenceDescription || report.testName,
                        normalRange: report.referenceRange || "N/A",
                        enteredValue: report.enteredValue || "N/A",
                        unit: report.unit || "N/A",
                    },
                ];
        return !rows.some((row) => isExcludedQualitativeRow(row));
    };

    const renderTestCardBody = (report: ConsolidatedReport, index: number) => {
        const rows =
            report.testRows && report.testRows.length > 0
                ? report.testRows
                : [
                    {
                        testParameter: report.referenceDescription || report.testName,
                        normalRange: report.referenceRange || "N/A",
                        enteredValue: report.enteredValue || "N/A",
                        unit: report.unit || "N/A",
                        referenceAgeRange: report.referenceAgeRange || "N/A",
                        referenceDescription: report.referenceDescription,
                        description: report.referenceDescription,
                    },
                ];
        const qualitativeRows = rows.filter((row) => isExcludedQualitativeRow(row));
        const quantitativeRows = rows.filter((row) => !isExcludedQualitativeRow(row));
        const isCBCTest = (report.testName || "").toUpperCase().includes("CBC");
        const firstRow = rows[0];
        const shouldHideResultTable = rows.length > 0 && isExcludedQualitativeRow(firstRow);

        const hasDetailedReportRow = rows.some(row => (row.referenceDescription || '').toUpperCase() === 'DETAILED REPORT');
        const detailedEntry = (report.reportJson || hasDetailedReportRow)
            ? { reportJson: report.reportJson, referenceRanges: report.referenceRanges }
            : null;

        const referenceRangesContent = renderReferenceRanges(report.referenceRanges, report.testName);
        const resultRows = !shouldHideResultTable
            ? buildResultTableRows(
                report.reportId,
                quantitativeRows,
                isCBCTest,
                qualitativeRows.length > 0 ? "Qualitative results for this report are listed below." : "No quantitative results available."
            )
            : [];

        return (
            <div key={report.reportId} data-report-id={report.reportId} data-print-block data-print-table="true" className="mb-3">
                {!detailedEntry && !shouldHideResultTable && (
                    <table className="w-full table-fixed text-[12px] border-collapse">
                        <thead>{renderResultTableHeaderRow()}</thead>
                        <tbody>
                            {renderSectionTitleRow(report.reportId, `${index}. ${report.testName}`)}
                            {resultRows}
                        </tbody>
                    </table>
                )}

                {(detailedEntry || shouldHideResultTable) && renderSectionTitleBand(`${index}. ${report.testName}`)}

                <div className={detailedEntry || shouldHideResultTable ? "p-2" : ""}>
                    {detailedEntry && detailedEntry.reportJson && (
                        <div className="w-full">
                            <div
                                className="report-html"
                                style={{
                                    background: '#ffffff',
                                    fontSize: '11px',
                                    lineHeight: '1.4'
                                }}
                                dangerouslySetInnerHTML={{ __html: buildDetailedReportHTML(detailedEntry.reportJson) }}
                            />
                            {renderReferenceRanges(detailedEntry.referenceRanges, report.testName)}
                        </div>
                    )}

                    {!detailedEntry && !shouldHideResultTable && referenceRangesContent}

                    {!detailedEntry && qualitativeRows.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {(() => {
                                const getQualitativeDisplayName = (row: TestRow) => {
                                    const candidate = row.testParameter || row.referenceDescription || "";
                                    if (!candidate) return report.testName || "Test";
                                    return doesRowMatchFieldType(row, EXCLUDED_FIELD_TYPES)
                                        ? (report.testName || candidate)
                                        : candidate;
                                };
                                const descriptionRows = qualitativeRows.filter((row) =>
                                    shouldShowQualitativeDescriptionRow(row)
                                );
                                const otherQualitativeRows = qualitativeRows.filter(
                                    (row) => !shouldShowQualitativeDescriptionRow(row)
                                );

                                return (
                                    <>
                                        {otherQualitativeRows.length > 0 && (
                                            <table className="w-full text-[12px] border-collapse table-fixed">
                                                <thead>
                                                    <tr>
                                                        <th className="p-2 text-left font-semibold text-black w-2/3">Test Name</th>
                                                        <th className="p-2 text-center font-semibold text-black w-1/3">Result</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {otherQualitativeRows.map((row, idx) => (
                                                        <tr key={`qual-row-${report.reportId}-${idx}`} className="border-t border-black">
                                                            <td className="p-2 text-black w-2/3">
                                                                {getQualitativeDisplayName(row)}
                                                            </td>
                                                            <td className="p-2 text-black font-semibold text-center w-1/3">
                                                                {row.enteredValue || "N/A"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}

                                        {descriptionRows.length > 0 && (
                                            <div className="space-y-2">
                                                {descriptionRows.map((row, idx) => {
                                                    const resultValue = row.enteredValue || "N/A";
                                                    const normalizedResult = resultValue.toString().trim().toLowerCase();
                                                    const normalizedDescription = (row.description || "").toString().trim().toLowerCase();
                                                    const showDescription =
                                                        !!row.description && normalizedDescription !== normalizedResult;

                                                    return (
                                                        <div key={`qual-desc-${report.reportId}-${idx}`} className="text-xs">
                                                            <p className="text-black leading-normal font-semibold whitespace-pre-wrap">{resultValue}</p>
                                                            {showDescription && (
                                                                <p className="text-black mb-1">{row.description}</p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const highPriorityFindings = clinicalSummary.findings.filter((f) => f.kind === "critical");
    const moderatePriorityFindings = clinicalSummary.findings.filter((f) => f.kind === "borderline");
    const moderatePriorityNames = Array.from(
        new Set(moderatePriorityFindings.map((f) => f.row.testParameter || f.report.testName))
    );

    return (
        <div className="max-w-4xl mx-auto text-black font-sans" style={{ fontFamily: DEFAULT_FONT_FAMILY }}>
            {!hidePrintButton && (
                <div className="print:hidden mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-black">{totalReports} tests found</p>
                        <p className="text-xs text-black">{selectedCount} selected</p>
                    </div>
                    <button
                        onClick={printReports}
                        disabled={printing || selectedCount === 0}
                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {printing ? (
                            <>
                                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 105 7.75l-1.5-.87A6 6 0 114 12z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            <>
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print Selected
                            </>
                        )}
                    </button>
                </div>
            )}

            {totalReports > 0 && (
                <div className="print:hidden mb-6 rounded-2xl border border-black bg-slate-50 p-4 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-black">Select reports to print</p>
                            <p className="text-xs text-black">
                                {selectedCount} of {totalReports} selected
                            </p>
                        </div>
                        <label className="inline-flex items-center text-xs font-medium text-black cursor-pointer">
                            <input
                                type="checkbox"
                                className="mr-2 h-4 w-4 rounded border-black text-black focus:ring-blue-500"
                                checked={isAllSelected}
                                onChange={(e) => handleToggleAll(e.target.checked)}
                            />
                            Select all
                        </label>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {sortedReports.map((report) => (
                            <label
                                key={report.reportId}
                                className={`flex items-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${selectedReports[report.reportId]
                                    ? "border-black bg-white text-black shadow-sm"
                                    : "border-black text-black"
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    className="mr-2 h-4 w-4 rounded border-black text-black focus:ring-blue-500"
                                    checked={!!selectedReports[report.reportId]}
                                    onChange={(e) => handleToggleReport(report.reportId, e.target.checked)}
                                />
                                <span className="truncate">{report.testName}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div
                ref={reportRef}
                className="bg-white p-8"
                style={{
                    width: "210mm",
                    margin: "0 auto",
                    boxSizing: "border-box",
                }}
            >
                <section data-report-shell className="flex flex-col">
                    {/* ================= HEADER ================= */}
                    <div className="bg-white" data-print-block data-print-role="header">
                        <div className="flex flex-row items-center justify-between gap-4 mb-4">
                            <div className="flex flex-row items-center gap-3">
                                <img
                                    src="/report/image%201.png"
                                    alt="Lab Logo"
                                    className="w-28 h-16 object-contain"
                                    crossOrigin="anonymous"
                                    data-print-logo="true"
                                />
                                <div
                                    className="flex flex-col justify-center gap-0.5 pl-4"
                                    style={{ borderLeft: `1px solid ${REPORT_COLORS.neutral100}` }}
                                >
                                    <h1 className="text-base font-bold leading-tight" style={{ color: REPORT_COLORS.neutral900 }}>{currentLab?.name}</h1>
                                    <p className="text-[9px] leading-tight w-44" style={{ color: REPORT_COLORS.neutral600 }}>
                                        {[currentLab?.address, currentLab?.city, currentLab?.state].filter(Boolean).join(', ')}
                                        {currentLab?.labPhone && ` PHONE: ${currentLab.labPhone}`}
                                    </p>
                                </div>
                            </div>
                            <img
                                src="/report/Logo.png"
                                alt="Tiamed Logo"
                                className="w-44 h-14 object-contain flex-shrink-0"
                                crossOrigin="anonymous"
                            />
                        </div>

                        {/* Patient Details Card */}
                        {/*
                            No Tailwind `gap-*` and no `truncate`/overflow-hidden here on purpose:
                            html2canvas (the PDF capture engine) has long-standing bugs rendering
                            flex `gap` and text-overflow clipping, which was chopping the bottom off
                            patient name/age-sex/patient-no in the exported PDF even though it looked
                            fine on screen. Spacing below is done with explicit margins instead, and
                            values are allowed to wrap rather than being clipped.
                        */}
                        <div
                            className="w-full rounded-xl p-3"
                            style={{ border: `1px solid ${REPORT_COLORS.secondary200}` }}
                        >
                            {[
                                [
                                    { icon: "/report/user.png", label: "Patient Name", value: patientData?.patientname || 'N/A', noWrap: false },
                                    { icon: "/report/users.png", label: "Age / Sex", value: `${formatAgeForDisplay(patientData?.dateOfBirth || '')} / ${patientData?.gender ? patientData.gender.slice(0, 1).toUpperCase() : 'N/A'}`, noWrap: true },
                                    {
                                        icon: "/report/calendar.png", label: "Date & Time", value: (() => {
                                            const { date, time } = formatReportDateTime(primaryReport?.createdDateTime);
                                            return `${date} ${time}`;
                                        })(), noWrap: true
                                    },
                                    { icon: "/report/id-card.png", label: "Patient No.", value: primaryReport?.patientCode || "N/A", noWrap: true },
                                ],
                                [
                                    { icon: "/report/stethoscope.png", label: "Referred By", value: displayDoctorName, noWrap: false },
                                    { icon: "/report/file-text.png", label: "Lab No.", value: currentLab?.id || 'N/A', noWrap: true },
                                    { icon: "/report/clipboard.png", label: "Report No.", value: primaryReport?.reportCode || "N/A", noWrap: true },
                                    { icon: "/report/map-pin.png", label: "Visit No.", value: primaryReport?.visitCode || "N/A", noWrap: true },
                                ],
                            ].map((row, rowIdx) => (
                                <div key={rowIdx} className="flex items-start" style={{ marginTop: rowIdx > 0 ? "0.4rem" : 0 }}>
                                    {row.map((field, fieldIdx) => (
                                        <div
                                            key={field.label}
                                            className="flex-1 flex items-center"
                                            style={{ marginLeft: fieldIdx > 0 ? "0.75rem" : 0, minWidth: 0 }}
                                        >
                                            <div
                                                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: REPORT_COLORS.secondary100, marginRight: "0.5rem" }}
                                            >
                                                <img src={field.icon} alt="" className="w-3 h-3" crossOrigin="anonymous" />
                                            </div>
                                            <div className="flex-1" style={{ minWidth: 0 }}>
                                                <div
                                                    className="text-[8px] font-semibold uppercase"
                                                    style={{ color: REPORT_COLORS.neutral600, lineHeight: 1.3 }}
                                                >
                                                    {field.label}
                                                </div>
                                                <div
                                                    className="text-[11px] font-bold"
                                                    style={{
                                                        color: REPORT_COLORS.neutral900,
                                                        lineHeight: 1.35,
                                                        marginTop: "1px",
                                                        overflow: "visible",
                                                        whiteSpace: field.noWrap ? "nowrap" : "normal",
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {field.value}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ================= CLINICAL ALERT SUMMARY + KEY FINDINGS ================= */}
                    <div className="mt-3 flex items-stretch gap-4" data-print-block>
                        <div
                            className="w-[46%] rounded-xl p-2.5 flex flex-col gap-2"
                            style={{ border: `1px solid ${REPORT_COLORS.secondary200}` }}
                        >
                            <h3 className="text-xs font-bold uppercase" style={{ color: REPORT_COLORS.secondary800 }}>Clinical Alert Summary</h3>
                            <div className="flex items-stretch gap-2">
                                {[
                                    { label: "Critical", sub: "Abnormality", icon: "/report/exclamation-triangle/red.jpg", color: REPORT_COLORS.danger600, value: clinicalSummary.critical },
                                    { label: "Borderline", sub: "Abnormalities", icon: "/report/exclamation-triangle/outline.png", color: REPORT_COLORS.warning500, value: clinicalSummary.borderline },
                                    { label: "Normal", sub: "Parameters", icon: "/report/check-circle/solid.png", color: REPORT_COLORS.success600, value: clinicalSummary.normal },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex-1 p-2 rounded-lg flex flex-col items-center gap-0.5 text-center"
                                        style={{ border: `1px solid ${item.color}` }}
                                    >
                                        <img src={item.icon} alt="" className="w-5 h-5" crossOrigin="anonymous" />
                                        <p className="text-xl font-extrabold" style={{ color: REPORT_COLORS.neutral900 }}>{item.value}</p>
                                        <p className="text-[9px] font-bold uppercase" style={{ color: item.color }}>{item.label}</p>
                                        <p className="text-[9px]" style={{ color: REPORT_COLORS.neutral600 }}>{item.sub}</p>
                                    </div>
                                ))}
                                <div
                                    className="flex-1 p-2 rounded-lg flex flex-col items-center gap-0.5 text-center"
                                    style={{ border: `1px solid ${REPORT_COLORS.secondary200}` }}
                                >
                                    <img src="/report/Purpose.png" alt="" className="w-5 h-5" crossOrigin="anonymous" />
                                    <p className="text-base font-extrabold whitespace-nowrap" style={{ color: REPORT_COLORS.secondary800 }}>{clinicalSummary.overallRisk || "—"}</p>
                                    <p className="text-[9px]" style={{ color: REPORT_COLORS.neutral600 }}>Overall Risk Score</p>
                                </div>
                            </div>
                        </div>
                        <div
                            className="flex-1 rounded-xl p-2.5 flex flex-col gap-1.5"
                            style={{ border: `1px solid ${REPORT_COLORS.secondary200}` }}
                        >
                            <h3 className="text-xs font-bold uppercase px-1" style={{ color: REPORT_COLORS.secondary800 }}>Key Findings for Doctor</h3>
                            <div className="p-1.5 flex flex-col gap-1.5">
                                {clinicalSummary.findings.length === 0 ? (
                                    <p className="text-[10px] italic" style={{ color: REPORT_COLORS.neutral600 }}>No abnormal findings to flag.</p>
                                ) : (
                                    <>
                                        {clinicalSummary.findings.slice(0, 6).map((finding, idx) => {
                                            const badge = getFindingBadge(finding);
                                            const paramLabel = finding.row.testParameter || finding.report.testName;
                                            const valueLabel = `${finding.row.enteredValue || "N/A"}${finding.row.unit ? ` ${finding.row.unit}` : ""}`;
                                            return (
                                                <div key={`${finding.report.reportId}-${idx}`} className="flex items-start justify-between gap-2">
                                                    <div className="flex items-start gap-2">
                                                        <span className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: badge.color }} />
                                                        <div>
                                                            <p className="text-xs" style={{ color: REPORT_COLORS.neutral900 }}>
                                                                <span className="font-bold">{paramLabel} : </span>
                                                                <span className="font-extrabold">{valueLabel}</span>
                                                            </p>
                                                            <p className="text-[10px]" style={{ color: REPORT_COLORS.neutral600 }}>Reference : {finding.row.normalRange || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    <span
                                                        className="px-2 py-1 rounded text-[9px] font-extrabold flex-shrink-0"
                                                        style={{ backgroundColor: badge.color, color: REPORT_COLORS.white }}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        {clinicalSummary.findings.length > 6 && (
                                            <p className="text-[10px] italic" style={{ color: REPORT_COLORS.neutral600 }}>
                                                +{clinicalSummary.findings.length - 6} more abnormal result{clinicalSummary.findings.length - 6 === 1 ? "" : "s"} in Detailed Lab Results below.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex items-stretch gap-3" data-print-block>
                        <div className="flex-1 flex flex-col gap-3">
                            <div
                                className="rounded-xl p-2.5 flex flex-col gap-1.5"
                                style={{ border: `1px solid ${REPORT_COLORS.secondary200}` }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: REPORT_COLORS.secondary100 }}>
                                        <img src="/report/reddit.png" alt="" className="w-4 h-4" crossOrigin="anonymous" />
                                    </span>
                                    <h3 className="text-xs font-bold uppercase" style={{ color: REPORT_COLORS.neutral800 }}>AI Clinical Observations</h3>
                                </div>
                                {aiInsightsLoading ? (
                                    <p className="text-[11px] italic px-1" style={{ color: REPORT_COLORS.neutral600 }}>Generating AI observations...</p>
                                ) : aiInsightsError ? (
                                    <p className="text-[11px] italic px-1" style={{ color: REPORT_COLORS.neutral600 }}>AI observations unavailable for this report.</p>
                                ) : aiInsights ? (
                                    <div className="flex flex-col gap-1.5 px-1">
                                        {[
                                            { label: "Provisional Diagnosis", value: aiInsights.provisionalDiagnosis },
                                            { label: "Patient Interpretation", value: aiInsights.patientInterpretation },
                                            { label: "Clinical Interpretation", value: aiInsights.clinicalInterpretation },
                                            { label: "Tips", value: aiInsights.tips },
                                            { label: "Doctor to Visit", value: aiInsights.doctorToVisit },
                                        ].filter((field) => field.value).map((field) => (
                                            <div key={field.label}>
                                                <p className="text-[10px] font-extrabold uppercase" style={{ color: REPORT_COLORS.secondary700 }}>{field.label}</p>
                                                <p className="text-[11px] leading-tight" style={{ color: REPORT_COLORS.neutral800 }}>{field.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] italic px-1" style={{ color: REPORT_COLORS.neutral600 }}>No AI observations available yet.</p>
                                )}
                            </div>
                            <div
                                className="rounded-xl p-2.5 flex flex-col gap-1.5"
                                style={{ border: `1px solid ${REPORT_COLORS.secondary200}` }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: REPORT_COLORS.secondary100 }}>
                                        <img src="/report/Purpose.png" alt="" className="w-4 h-4" crossOrigin="anonymous" />
                                    </span>
                                    <h3 className="text-xs font-bold uppercase" style={{ color: REPORT_COLORS.neutral800 }}>Clinical Attention Required</h3>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-[11px] font-extrabold" style={{ color: REPORT_COLORS.warning500 }}>HIGH PRIORITY</p>
                                        {highPriorityFindings.length === 0 ? (
                                            <p className="text-[11px] italic" style={{ color: REPORT_COLORS.neutral600 }}>No critical abnormalities detected.</p>
                                        ) : (
                                            <div className="flex flex-col gap-0.5">
                                                {highPriorityFindings.slice(0, 2).map((finding, idx) => (
                                                    <p key={idx} className="text-[11px] leading-tight" style={{ color: REPORT_COLORS.neutral800 }}>
                                                        {(finding.row.testParameter || finding.report.testName)} {finding.direction === "high" ? "elevated" : "reduced"} ({finding.row.enteredValue}). Requires clinical correlation.
                                                    </p>
                                                ))}
                                                {highPriorityFindings.length > 2 && (
                                                    <p className="text-[10px] italic" style={{ color: REPORT_COLORS.neutral600 }}>
                                                        +{highPriorityFindings.length - 2} more critical result{highPriorityFindings.length - 2 === 1 ? "" : "s"}.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-0.5" style={{ borderTop: `1px solid ${REPORT_COLORS.neutral100}`, paddingTop: "0.25rem" }}>
                                        <p className="text-[11px] font-extrabold" style={{ color: REPORT_COLORS.danger500 }}>MODERATE PRIORITY</p>
                                        {moderatePriorityNames.length === 0 ? (
                                            <p className="text-[11px] italic" style={{ color: REPORT_COLORS.neutral600 }}>No borderline deviations noted.</p>
                                        ) : (
                                            <p className="text-[11px] leading-tight" style={{ color: REPORT_COLORS.neutral800 }}>
                                                {moderatePriorityNames.slice(0, 3).join(", ")}
                                                {moderatePriorityNames.length > 3 ? ` +${moderatePriorityNames.length - 3} more` : ""} show borderline deviations. Review if clinically indicated.
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-0.5" style={{ borderTop: `1px solid ${REPORT_COLORS.neutral100}`, paddingTop: "0.25rem" }}>
                                        <p className="text-[11px] font-extrabold" style={{ color: REPORT_COLORS.success700 }}>LOW PRIORITY</p>
                                        {clinicalSummary.normalReportNames.length === 0 ? (
                                            <p className="text-[11px] italic" style={{ color: REPORT_COLORS.neutral600 }}>No data available.</p>
                                        ) : (
                                            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                                {clinicalSummary.normalReportNames.map((name) => (
                                                    <p key={name} className="text-[11px]" style={{ color: REPORT_COLORS.neutral800 }}>{name} normal.</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="w-64 rounded-xl p-2.5 flex flex-col gap-1.5"
                            style={{ border: `1px solid ${REPORT_COLORS.secondary200}` }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: REPORT_COLORS.secondary100 }}>
                                    <img src="/report/chart-bar/solid.png" alt="" className="w-4 h-4" crossOrigin="anonymous" />
                                </span>
                                <h3 className="text-xs font-bold uppercase" style={{ color: REPORT_COLORS.neutral800 }}>Health Snapshot</h3>
                            </div>
                            {healthSnapshotLoading ? (
                                <p className="text-[11px] italic px-1" style={{ color: REPORT_COLORS.neutral600 }}>Loading history...</p>
                            ) : (() => {
                                const trendTests = (healthSnapshot?.tests || []).filter((t) => t.totalVisits > 1);
                                if (trendTests.length === 0) {
                                    return (
                                        <p className="text-[11px] italic px-1" style={{ color: REPORT_COLORS.neutral600 }}>
                                            {healthSnapshot ? "No prior visit history for these tests yet." : "Trend data will appear here once available."}
                                        </p>
                                    );
                                }
                                return (
                                    <div className="flex flex-col gap-1.5 px-1">
                                        {trendTests.slice(0, 4).map((test) => {
                                            const lastTwo = test.results.slice(-2);
                                            return (
                                                <div key={test.testName}>
                                                    <p className="text-[10px] font-extrabold" style={{ color: REPORT_COLORS.neutral800 }}>{test.testName}</p>
                                                    <p className="text-[10px]" style={{ color: REPORT_COLORS.neutral600 }}>
                                                        {lastTwo.map((r) => `${r.enteredValue}${r.unit ? ` ${r.unit}` : ""} (${r.visitDate})`).join(" -> ")}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                        {trendTests.length > 4 && (
                                            <p className="text-[10px] italic" style={{ color: REPORT_COLORS.neutral600 }}>+{trendTests.length - 4} more tests with history.</p>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* ================= DETAILED LAB RESULTS ================= */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-3" data-print-block>
                            <div className="flex items-center gap-2">
                                <img src="/report/microscope.png" alt="" className="w-4 h-4" crossOrigin="anonymous" />
                                <h2 className="text-sm font-extrabold uppercase" style={{ color: REPORT_COLORS.secondary700 }}>Detailed Lab Results</h2>
                            </div>
                            <div className="flex items-center gap-3 text-[10px]" style={{ color: REPORT_COLORS.neutral600 }}>
                                <span className="font-semibold" style={{ color: REPORT_COLORS.neutral800 }}>LEGEND:</span>
                                <span className="inline-flex items-center gap-1">
                                    <img src="/report/Ellipse.png" alt="" className="w-2 h-2" crossOrigin="anonymous" /> Normal
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <img src="/report/Ellipse-2.png" alt="" className="w-2 h-2" crossOrigin="anonymous" /> Borderline
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <img src="/report/Ellipse-1.png" alt="" className="w-2 h-2" crossOrigin="anonymous" /> High
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <img src="/report/Ellipse-6.png" alt="" className="w-2 h-2" crossOrigin="anonymous" /> Critical
                                </span>
                            </div>
                        </div>
                        {(() => {
                            const numberByReportId = new Map(sortedReports.map((r, i) => [r.reportId, i + 1]));
                            const detailedReports = sortedReports.filter(isDetailedReportEntry);
                            const simpleReports = sortedReports.filter((r) => !isDetailedReportEntry(r));

                            // Balance tests across two columns by estimated content weight (header + row
                            // count), assigning each test to whichever column is currently shorter. This
                            // keeps the layout looking like the Figma masonry regardless of how many tests
                            // are selected -- including a single test, which simply fills one full-width column.
                            const columns: ConsolidatedReport[][] = [[], []];
                            const columnWeights = [0, 0];
                            simpleReports.forEach((report) => {
                                const col = columnWeights[0] <= columnWeights[1] ? 0 : 1;
                                columns[col].push(report);
                                columnWeights[col] += estimateReportWeight(report);
                            });
                            const nonEmptyColumns = columns.filter((col) => col.length > 0);

                            // Figma groups consecutive plain-numeric tests under one continuous table with
                            // a single shared header instead of repeating the header per test -- only
                            // reports with qualitative rows or a full JSON detailed report break the run.
                            const renderColumnBlocks = (col: ConsolidatedReport[]) => {
                                const blocks: JSX.Element[] = [];
                                let run: ConsolidatedReport[] = [];

                                const flushRun = () => {
                                    if (run.length === 0) return;
                                    const runItems = run;
                                    blocks.push(
                                        <div
                                            key={`table-${runItems[0].reportId}`}
                                            className="mb-3"
                                            data-print-block
                                            data-print-table="true"
                                        >
                                            <table className="w-full table-fixed text-[12px] border-collapse">
                                                <thead>{renderResultTableHeaderRow()}</thead>
                                                {runItems.map((r) => {
                                                    const rows =
                                                        r.testRows && r.testRows.length > 0
                                                            ? r.testRows
                                                            : [
                                                                {
                                                                    testParameter: r.referenceDescription || r.testName,
                                                                    normalRange: r.referenceRange || "N/A",
                                                                    enteredValue: r.enteredValue || "N/A",
                                                                    unit: r.unit || "N/A",
                                                                },
                                                            ];
                                                    const isCBCTest = (r.testName || "").toUpperCase().includes("CBC");
                                                    return (
                                                        <tbody key={r.reportId} data-report-id={r.reportId}>
                                                            {renderSectionTitleRow(r.reportId, `${numberByReportId.get(r.reportId)}. ${r.testName}`)}
                                                            {buildResultTableRows(r.reportId, rows, isCBCTest)}
                                                        </tbody>
                                                    );
                                                })}
                                            </table>
                                        </div>
                                    );
                                    run = [];
                                };

                                col.forEach((report) => {
                                    if (isPureQuantitativeReport(report)) {
                                        run.push(report);
                                    } else {
                                        flushRun();
                                        blocks.push(
                                            <div key={report.reportId}>
                                                {renderTestCardBody(report, numberByReportId.get(report.reportId)!)}
                                            </div>
                                        );
                                    }
                                });
                                flushRun();
                                return blocks;
                            };

                            return (
                                <>
                                    {detailedReports.length > 0 && (
                                        <div className="flex flex-col gap-3 mb-3" data-detailed-results>
                                            {detailedReports.map((report) => (
                                                <div key={report.reportId}>
                                                    {renderTestCardBody(report, numberByReportId.get(report.reportId)!)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {nonEmptyColumns.length > 0 && (
                                        <div className="flex items-start gap-6" data-results-grid data-print-block>
                                            {nonEmptyColumns.map((col, colIdx) => (
                                                <div key={colIdx} className="flex-1">
                                                    {renderColumnBlocks(col)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {/* ================= DOCTOR REVIEW / NOTES / APPROVAL ================= */}
                    <div className="mt-3 grid grid-cols-3 gap-3" data-print-block data-print-role="signature">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <img src="/report/clipboard-check.png" alt="" className="w-4 h-4" crossOrigin="anonymous" />
                                <h3 className="text-xs font-bold uppercase" style={{ color: REPORT_COLORS.secondary800 }}>Doctor Review Checklist</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px]" style={{ color: REPORT_COLORS.neutral800 }}>
                                {[
                                    "Reviewed Critical Parameters",
                                    "Follow-up Recommended",
                                    "Clinical Correlation Done",
                                    "Medication Prescribed",
                                    "Additional Investigations Needed",
                                    "Patient Counseled",
                                ].map((label) => (
                                    <div key={label} className="flex items-center gap-1.5">
                                        <span className="inline-block w-3 h-3 flex-shrink-0 rounded-sm" style={{ border: `1px solid ${REPORT_COLORS.neutral600}` }} />
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <img src="/report/edit.png" alt="" className="w-4 h-4" crossOrigin="anonymous" />
                                <h3 className="text-xs font-bold uppercase" style={{ color: REPORT_COLORS.secondary800 }}>Doctor Notes</h3>
                            </div>
                            <div className="space-y-4 mt-3">
                                <div className="h-2" style={{ borderBottom: `1px solid ${REPORT_COLORS.neutral100}` }} />
                                <div className="h-2" style={{ borderBottom: `1px solid ${REPORT_COLORS.neutral100}` }} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold uppercase mb-1.5" style={{ color: REPORT_COLORS.secondary800 }}>Lab Approval</h3>
                            <img
                                src="/signature.png"
                                alt="Authorized Pathologist Signature"
                                className="h-10 w-auto object-contain"
                                crossOrigin="anonymous"
                            />
                            <div className="mt-0.5 text-[10px] leading-tight" style={{ color: REPORT_COLORS.neutral800 }}>
                                <p className="font-semibold">Dr. Sini Arjun</p>
                                <p style={{ color: REPORT_COLORS.neutral600 }}>MBBS, MD (Pathology)</p>
                                <p style={{ color: REPORT_COLORS.neutral600 }}>Consultant Pathologist</p>
                            </div>
                            <div className="mt-2 text-[9px]" style={{ color: REPORT_COLORS.neutral600 }}>Lab Technician</div>
                        </div>
                    </div>

                    {/* ================= FOOTER ================= */}
                    <div data-print-block data-print-role="footer">
                        <div
                            className="mt-3 rounded-xl p-3 flex items-center"
                            style={{ border: `1px solid ${REPORT_COLORS.secondary200}` }}
                        >
                            <div className="flex-[1.4] pr-3">
                                <h4 className="text-[10px] font-bold mb-0.5" style={{ color: REPORT_COLORS.danger600 }}>Disclaimer</h4>
                                <p className="text-[9px] leading-tight" style={{ color: REPORT_COLORS.neutral600 }}>
                                    *This laboratory report is intended for clinical correlation only. Results should be interpreted by a qualified medical professional. Laboratory values may vary based on methodology and biological variance. The diagnostic center is not responsible for misinterpretation or misuse of results. This is an electronically generated report. No physical signature required.
                                </p>
                            </div>

                            <div className="self-stretch flex-shrink-0" style={{ borderLeft: `1px solid ${REPORT_COLORS.secondary200}` }} />

                            <div className="flex-1 flex items-center gap-2 px-3">
                                <img
                                    src="/report/Rectangle.png"
                                    alt="QR Code"
                                    className="h-10 w-10 object-contain flex-shrink-0"
                                    crossOrigin="anonymous"
                                />
                                <div>
                                    <p className="text-xs font-bold text-black">
                                        Thank you for choosing {currentLab?.name || "Our Lab"}
                                    </p>
                                    <div className="flex items-center mt-0.5">
                                        <img
                                            src="/tiamed1.svg"
                                            alt="Tiamed Logo"
                                            className="max-h-3.5 w-auto mr-1 opacity-80 object-contain"
                                            crossOrigin="anonymous"
                                        />
                                        <span className="text-[9px]" style={{ color: REPORT_COLORS.neutral600 }}>
                                            Powered by Tiameds Technologies Pvt.Ltd
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="self-stretch flex-shrink-0" style={{ borderLeft: `1px solid ${REPORT_COLORS.secondary200}` }} />

                            <div className="flex-shrink-0 pl-3 text-right">
                                <p className="text-[10px]" style={{ color: REPORT_COLORS.neutral600 }}>Generated on:</p>
                                <p className="text-xs font-bold text-black">{(() => {
                                    const { date, time } = formatReportDateTime(latestReportDateTime);
                                    return `${date} at ${time}`;
                                })()}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CommonReportView2;




