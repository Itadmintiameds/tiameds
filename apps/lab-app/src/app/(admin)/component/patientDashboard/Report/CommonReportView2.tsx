import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { TbInfoCircle } from "react-icons/tb";
import { toast } from "react-toastify";
import { useLabs } from "@/context/LabContext";
import { formatAgeForDisplay } from "@/utils/ageUtils";
import type { PatientData } from "@/types/sample/sample";
import { formatMedicalReportToHTML } from "@/utils/reportFormatter";

type Html2CanvasBaseOptions = NonNullable<Parameters<typeof html2canvas>[1]>;
type Html2CanvasEnhancedOptions = Html2CanvasBaseOptions & {
    scale?: number;
    windowWidth?: number;
    windowHeight?: number;
};

const DEFAULT_FONT_FAMILY = '"Inter", "Helvetica Neue", Arial, sans-serif';
const BASE_TEXT_COLOR = "#0f172a";
const RADIOLOGY_PATTERNS = [
    /\bRADIOLOGY\b/i,
    /\bX[\s-]?RAY\b/i,
    /\bUSG\b/i,
    /\bULTRASOUND\b/i,
    /\bCT\b/i,
    /\bMRI\b/i,
    /\bPET\b/i,
    /\bMAMMO(?:GRAPHY)?\b/i,
    /\bDOPPLER\b/i,
];
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
const BOTTOM_MARGIN_MM = 8;
// Extra buffer to avoid edge clipping when html2canvas output is placed into jsPDF.
const CONTENT_SAFETY_MM = 2;
const BLOCK_GAP_MM = 6;
const USABLE_HEIGHT_MM = PAGE_HEIGHT_MM - TOP_MARGIN_MM - BOTTOM_MARGIN_MM;

const normalizeFieldKey = (value?: string) =>
    (value || "")
        .toUpperCase()
        .replace(/–/g, "-")
        .replace(/\s+/g, "")
        .trim();

const isDescriptionRow = (row?: { referenceDescription?: string; testParameter?: string }) =>
    normalizeFieldKey(row?.referenceDescription) === "DESCRIPTION" ||
    normalizeFieldKey(row?.testParameter) === "DESCRIPTION";

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

// const buildDetailedReportHTML = (reportJson?: string | null) => {
//     if (!reportJson) return '';
//     try {
//         const parsed = JSON.parse(reportJson) as DetailedReport;

//         // Check if this is a structured report with tables, sections, or impression
//         const hasStructuredData =
//             (parsed.tables && Array.isArray(parsed.tables) && parsed.tables.length > 0) ||
//             (parsed.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0) ||
//             (parsed.impression && Array.isArray(parsed.impression) && parsed.impression.length > 0);

//         if (parsed && hasStructuredData) {
//             const htmlParts: string[] = [];

//             // Add description if present
//             if (parsed.description) {
//                 htmlParts.push(`<p style="margin: 4px 0; font-size: 11px; line-height: 1.4; color: #000;">${parsed.description}</p>`);
//             }

//             // Render Impression (array of strings)
//             if (parsed.impression && Array.isArray(parsed.impression) && parsed.impression.length > 0) {
//                 htmlParts.push(`<p style="margin: 4px 0; font-size: 11px; line-height: 1.4;"><strong>Impression:</strong> ${parsed.impression.join(', ')}</p>`);
//             }

//             // Render Tables
//             if (parsed.tables && Array.isArray(parsed.tables) && parsed.tables.length > 0) {
//                 parsed.tables.forEach((table) => {
//                     if (table.title) {
//                         htmlParts.push(`<h4 style="font-size: 11px; font-weight: 600; margin: 8px 0 4px 0; color: #000;">${table.title}</h4>`);
//                     }
//                     if (table.headers && Array.isArray(table.headers) && table.rows && Array.isArray(table.rows)) {
//                         let tableHtml = '<table style="border-collapse: collapse; width: 100%; margin: 4px 0; font-size: 13px; border: 1px solid #000;">';
//                         // Header row
//                         tableHtml += '<thead><tr>';
//                         table.headers.forEach((header: string) => {
//                             tableHtml += `<th style="border: 1px solid #000; padding: 6px 8px; text-align: left; background-color: #f2f2f2; font-size: 11px; font-weight: bold; color: #000;">${header}</th>`;
//                         });
//                         tableHtml += '</tr></thead>';
//                         // Data rows
//                         tableHtml += '<tbody>';
//                         table.rows.forEach((row: (string | number | boolean | null)[]) => {
//                             tableHtml += '<tr>';
//                             row.forEach((cell: string | number | boolean | null) => {
//                                 tableHtml += `<td style="border: 1px solid #000; padding: 6px 8px; font-size: 11px; color: #000;">${String(cell)}</td>`;
//                             });
//                             tableHtml += '</tr>';
//                         });
//                         tableHtml += '</tbody></table>';
//                         htmlParts.push(tableHtml);
//                     }
//                 });
//             }

//             // Render Sections
//             if (parsed.sections && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
//                 const sectionsHtml = parsed.sections
//                     .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
//                     .map((section) => {
//                         // Ensure readable spacing before bold labels like "Limitations:" when missing spaces
//                         const cleanedContent = String(section.content ?? '')
//                             .replace(/([^\s>])<strong>/g, '$1 <strong>')
//                             .replace(/<ul>/g, '<ul style="margin: 2px 0; padding-left: 16px; font-size: 11px; line-height: 1.4;">')
//                             .replace(/<ol>/g, '<ol style="margin: 2px 0; padding-left: 16px; font-size: 11px; line-height: 1.4;">')
//                             .replace(/<li>/g, '<li style="margin: 2px 0;">')
//                             .replace(/<p>/g, '<p style="margin: 4px 0; font-size: 11px; line-height: 1.4;">')
//                             // strip background styles that cause gray fill in print
//                             .replace(/background(?:-color)?:[^;"']*;?/gi, '')
//                             .replace(/style="\s*"/gi, '');
//                         return `
//                             <div style="margin-bottom: 8px;">
//                                  ${section.title ? `<h4 style="font-size: 11px; font-weight: 600; margin: 4px 0; color: #000;"></h4>` : ''}
//                                 <div style="font-size: 11px; line-height: 1.4;">${cleanedContent}</div>
//                             </div>
//                         `;
//                     })
//                     .join('');
//                 htmlParts.push(sectionsHtml);
//             }

//             return `<div style="margin-bottom: 8px;">${htmlParts.join('')}</div>`;
//         }

//         // Fallback to formatter if structure is not as expected
//         return `<div>${formatMedicalReportToHTML(reportJson) || ''}</div>`;
//     } catch {
//         return `<div>${formatMedicalReportToHTML(reportJson) || ''}</div>`;
//     }
// };





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

    const isRadiologyReport = (testName?: string, testCategory?: string) => {
        const normalizedCategory = (testCategory || "").trim().toUpperCase();
        if (normalizedCategory === "RADIOLOGY") {
            return true;
        }

        const name = (testName || "").trim();
        if (!name) {
            return false;
        }

        return RADIOLOGY_PATTERNS.some((pattern) => pattern.test(name));
    };

    const renderNodeToCanvas = async (node: HTMLElement, scale: number) => {
        const canvasOptions: Html2CanvasEnhancedOptions = {
            useCORS: true,
            allowTaint: true,
            background: "#ffffff",
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

    const canvasToMm = (canvas: HTMLCanvasElement, widthMm: number) => {
        const heightMm = (canvas.height * widthMm) / canvas.width;
        return { widthMm, heightMm };
    };

    const addCanvasAtCursor = (pdf: jsPDF, canvas: HTMLCanvasElement, xMm: number, yMm: number, widthMm: number, heightMm: number) => {
        const imgData = canvas.toDataURL("image/jpeg", 1);
        pdf.addImage(imgData, "JPEG", xMm, yMm, widthMm, heightMm, undefined, "FAST");
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
            const sections = Array.from(reportRef.current.querySelectorAll("[data-report-id]")).filter((section) =>
                selectedSet.has(Number(section.getAttribute("data-report-id")))
            );

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
                headerCanvas = await renderNodeToCanvas(headerTemplate, renderScale);
                headerHeightMm = canvasToMm(headerCanvas, PAGE_WIDTH_MM).heightMm;
            }
            if (signatureTemplate) {
                signatureCanvas = await renderNodeToCanvas(signatureTemplate, renderScale);
                signatureHeightMm = canvasToMm(signatureCanvas, PAGE_WIDTH_MM).heightMm;
            }
            if (footerTemplate) {
                footerCanvas = await renderNodeToCanvas(footerTemplate, renderScale);
                footerHeightMm = canvasToMm(footerCanvas, PAGE_WIDTH_MM).heightMm;
            }
            tempContainer.removeChild(pageTemplateSection);

            const contentTopMm = TOP_MARGIN_MM + (headerHeightMm > 0 ? headerHeightMm + BLOCK_GAP_MM : 0);
            const reservedBottomMm =
                (signatureHeightMm > 0 ? signatureHeightMm + BLOCK_GAP_MM : 0) +
                (footerHeightMm > 0 ? footerHeightMm + BLOCK_GAP_MM : 0);
            const contentBottomMm = PAGE_HEIGHT_MM - BOTTOM_MARGIN_MM - reservedBottomMm - CONTENT_SAFETY_MM;
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

                const testName = (section as HTMLElement).getAttribute("data-test-name") || "";
                const testCategory = (section as HTMLElement).getAttribute("data-test-category") || "";
                if (isRadiologyReport(testName, testCategory) && hasContentOnPage) {
                    startNewPage();
                }

                const blocks = Array.from(sectionClone.querySelectorAll("[data-print-block]")) as HTMLElement[];
                const topLevelBlocks = blocks.filter((block) => !block.parentElement?.closest("[data-print-block]"));
                const contentBlocks = topLevelBlocks.filter((block) => {
                    const role = block.getAttribute("data-print-role");
                    return role !== "header" && role !== "signature" && role !== "footer";
                });
                const nodesToRender = contentBlocks.length > 0 ? contentBlocks : [sectionClone];

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

            const pagesToStamp = Array.from(contentPages).sort((a, b) => a - b);
            pagesToStamp.forEach((pageNo) => {
                pdf.setPage(pageNo);
                if (headerCanvas && headerHeightMm > 0) {
                    addCanvasAtCursor(pdf, headerCanvas, MARGIN_X_MM, TOP_MARGIN_MM, PAGE_WIDTH_MM, headerHeightMm);
                }
                if (signatureCanvas && signatureHeightMm > 0) {
                    const signatureY =
                        PAGE_HEIGHT_MM -
                        BOTTOM_MARGIN_MM -
                        (footerHeightMm > 0 ? footerHeightMm + BLOCK_GAP_MM : 0) -
                        signatureHeightMm;
                    addCanvasAtCursor(pdf, signatureCanvas, MARGIN_X_MM, signatureY, PAGE_WIDTH_MM, signatureHeightMm);
                }
                if (footerCanvas && footerHeightMm > 0) {
                    const footerY = PAGE_HEIGHT_MM - BOTTOM_MARGIN_MM - footerHeightMm;
                    addCanvasAtCursor(pdf, footerCanvas, MARGIN_X_MM, footerY, PAGE_WIDTH_MM, footerHeightMm);
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
                className="bg-white p-8 space-y-12"
                style={{
                    width: "210mm",
                    margin: "0 auto",
                    boxSizing: "border-box",
                }}
            >
                {sortedReports.map((report) => {
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
                    const hasDescriptionRow = rows.some(isDescriptionRow);
                    const shouldIsolateDescriptionReport = hasDescriptionRow && shouldHideResultTable;
                    const shouldHideTestNameHeading =
                        rows.length > 0 &&
                        isExcludedQualitativeRow(firstRow) &&
                        !shouldShowQualitativeDescriptionRow(firstRow);

                    // Check for detailed report - either reportJson exists on report or testRow has DETAILED REPORT
                    const hasDetailedReportRow = rows.some(row => (row.referenceDescription || '').toUpperCase() === 'DETAILED REPORT');
                    const detailedEntry = (report.reportJson || hasDetailedReportRow)
                        ? { reportJson: report.reportJson, referenceRanges: report.referenceRanges }
                        : null;

                    const renderedRows: JSX.Element[] = [];
                    const quantitativeRowEntries: RenderRowEntry[] = isCBCTest
                        ? buildOrderedCBCRows(quantitativeRows)
                        : quantitativeRows.map((row) => ({ type: "row", row }));
                    const referenceRangesContent = renderReferenceRanges(report.referenceRanges, report.testName);

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




                    const isValueOutOfRange = (enteredValue?: string, normalRange?: string): boolean => {
                        if (!enteredValue || !normalRange || enteredValue === "N/A" || normalRange === "N/A") {
                            return false;
                        }

                        const value = parseFloat(enteredValue);
                        if (isNaN(value)) {
                            return false;
                        }

                        const range = normalRange.trim();


                        // Format 1: "1000 - 4800" or "1000-4800" (min-max range)
                        const rangeMatch = range.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
                        if (rangeMatch) {
                            const min = parseFloat(rangeMatch[1]);
                            const max = parseFloat(rangeMatch[2]);
                            return value < min || value > max;
                        }

                        // Format 2: "< 5.0" or "<5.0" (less than threshold)
                        const lessThanMatch = range.match(/<\s*(\d+(?:\.\d+)?)/);
                        if (lessThanMatch) {
                            const threshold = parseFloat(lessThanMatch[1]);
                            return value >= threshold;
                        }

                        // Format 3: "> 10.0" or ">10.0" (greater than threshold)
                        const greaterThanMatch = range.match(/>\s*(\d+(?:\.\d+)?)/);
                        if (greaterThanMatch) {
                            const threshold = parseFloat(greaterThanMatch[1]);
                            return value <= threshold;
                        }

                        // Format 4: Qualitative ranges (Normal, Negative, Positive, etc.)
                        const lowerRange = range.toLowerCase();
                        if (lowerRange.includes('normal') ||
                            lowerRange.includes('negative') ||
                            lowerRange.includes('positive') ||
                            lowerRange.includes('reactive') ||
                            lowerRange.includes('non-reactive') ||
                            lowerRange.includes('present') ||
                            lowerRange.includes('absent')) {
                            return false;
                        }

                        return false;
                    };

                    const formatResultContent = (row: TestRow) => {
                        const value = row.enteredValue || "N/A";
                        const isOutOfRange = isValueOutOfRange(row.enteredValue, row.normalRange);
                        const boldClass = isOutOfRange ? "font-semibold" : "";

                        if (!isCBCTest) {
                            return isOutOfRange ? (
                                <span className={`${boldClass} text-black`}>{value}</span>
                            ) : value;
                        }
                        return (
                            <span className={`${boldClass} text-black`}>
                                {value}
                            </span>
                        );
                    };

                    const formatReferenceContent = (row: TestRow) => {
                        const rangeValue = row.normalRange || "N/A";
                        if (!isCBCTest) {
                            return rangeValue;
                        }
                        return (
                            <span className="text-black">
                                {rangeValue}
                            </span>
                        );
                    };

                    if (!shouldHideResultTable) {
                        if (quantitativeRows.length === 0) {
                            renderedRows.push(
                                <tr key={`no-quant-${report.reportId}`} className="border-t border-black">
                                    <td colSpan={4} className="p-4 text-center text-black">
                                        {qualitativeRows.length > 0
                                            ? "Qualitative results for this report are listed below."
                                            : "No quantitative results available."}
                                    </td>
                                </tr>
                            );
                        } else {
                            quantitativeRowEntries.forEach((entry, idx) => {
                                if (entry.type === "header") {
                                    renderedRows.push(
                                        <tr
                                            key={`cbc-header-${report.reportId}-${entry.key}-${idx}`}
                                            className=" text-left text-[13px] font-bold text-black border-t border-b border-black"
                                        >
                                            <td className="p-2" colSpan={4}>
                                                {entry.key}
                                            </td>
                                        </tr>
                                    );
                                    return;
                                }

                                const row = entry.row;
                                const parameterLabel = isCBCTest ? (row.testParameter || "").toUpperCase() : row.testParameter;

                                renderedRows.push(
                                    <tr key={`${report.reportId}-${idx}`} className="border-t border-black">
                                        <td className="p-2 font-medium text-black">
                                            {parameterLabel}
                                        </td>
                                        <td className="p-2 text-center text-black">
                                            {formatResultContent(row)}
                                        </td>
                                        <td className="p-2 text-black">{formatReferenceContent(row)}</td>
                                        <td className="p-2 text-black">{row.unit || "N/A"}</td>
                                    </tr>
                                );
                            });
                        }
                    }

                    const sectionClassName = `mb-16 page-break${shouldIsolateDescriptionReport ? " description-only-report" : ""}`;

                    return (
                        <section
                            key={report.reportId}
                            data-report-id={report.reportId}
                            data-test-name={report.testName}
                            data-test-category={report.testCategory || ""}
                            className={sectionClassName}
                        >
                            <div className="flex flex-col">
                                <div className=" bg-white   border-b-2 border-black" data-print-block data-print-role="header">
                                    {/* Top Section - Logo and Lab Info */}
                                    <div className="flex flex-row items-center gap-4 mb-4">
                                        {/* Logo - Larger height */}
                                        <div className="flex-shrink-0">
                                            <Image src="/CUREPLUS HOSPITALS (1).png"
                                                alt="Lab Logo" width={120} height={120}
                                                className="w-28 h-28 object-contain" priority loading="eager"
                                                unoptimized crossOrigin="anonymous" data-print-logo="true"
                                                quality={100}
                                            />
                                        </div>
                                        {/* Lab Name and Address - smaller text, uniform design */}
                                        <div className="flex flex-col justify-center gap-0.5 flex-1">
                                            <h1 className="text-base font-bold text-black leading-tight uppercase tracking-wide">{currentLab?.name}</h1>
                                            <p className="text-[10px] text-black leading-tight uppercase">{currentLab?.address}</p>
                                        </div>
                                    </div>

                                    {/* Patient Details Box - Single container, compact, no divider */}
                                    <div className="w-full border border-black bg-white">
                                        <div className="grid grid-cols-2">
                                            {/* Left Section */}

                                            <div className="p-3">
                                                <div className="space-y-1.5 text-xs">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-black font-normal">NAME:</span>
                                                        <span className="text-black font-normal text-left ml-3 flex-1">{patientData?.patientname || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-black font-normal">REFERRED BY:</span>
                                                        <span className="text-black font-normal text-left ml-3 flex-1">{displayDoctorName}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-black font-normal">LAB NO:</span>
                                                        <span className="text-black font-normal text-left ml-3 flex-1">{currentLab?.id || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-black font-normal">OPD/IPD:</span>
                                                        <span className="text-black font-normal text-left ml-3 flex-1">{patientData?.visitType || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Section */}
                                            <div className="p-3">
                                                <div className="space-y-1.5 text-xs">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-black font-normal">AGE/SEX:</span>
                                                        <span className="text-black font-normal text-left ml-3 flex-1">{formatAgeForDisplay(patientData?.dateOfBirth || '')} / {patientData?.gender ? patientData.gender.slice(0, 1).toUpperCase() : 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-black font-normal">DATE & TIME:</span>
                                                        <span className="text-black font-normal text-left ml-3 flex-1">
                                                            {(() => {
                                                                const { date, time } = formatReportDateTime(report.createdDateTime);
                                                                return `${date} ${time}`;
                                                            })()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-black font-normal">REPORT NO:</span>
                                                        <span className="text-black font-normal text-left ml-3 flex-1">{report.reportCode || "N/A"}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-black font-normal">PATIENT NO:</span>
                                                        <span className="text-black font-normal text-left ml-3 flex-1">{report.patientCode || "N/A"}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-black font-normal">VISIT NO:</span>
                                                        <span className="text-black font-normal text-left ml-3 flex-1">{report.visitCode || "N/A"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Test Name Heading */}
                                {/* {!shouldHideTestNameHeading && (
                                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-black text-center " data-print-block>{report.testName}</h3>
                                )} */}



                                {/* If DETAILED REPORT -> render reportJson content and optional reference ranges, skip table */}
                                {detailedEntry && detailedEntry.reportJson && (
                                    <div className="w-full">
                                        {/* Detailed Report Section */}
                                        <div className="mb-3" data-print-block>
                                            <div className="p-2 bg-white">
                                                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-black text-center " data-print-block>{report.testName}</h3>
                                                <div
                                                    className="report-html"
                                                    style={{
                                                        background: '#ffffff',
                                                        fontSize: '11px',
                                                        lineHeight: '1.4'
                                                    }}


                                                    dangerouslySetInnerHTML={{ __html: buildDetailedReportHTML(detailedEntry.reportJson) }}
                                                />
                                            </div>
                                        </div>


                                        {/* Reference Ranges Table */}
                                        {renderReferenceRanges(detailedEntry.referenceRanges, report.testName)}

                                        {/* Signature Block - appears right after detailed report content */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 mt-4" data-print-block data-print-role="signature">
                                            <div className="text-center">
                                                <div className="h-14 flex items-center justify-center"></div>
                                                <div className="mt-1 text-xs text-black font-medium">Lab Technician</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <Image
                                                        src="/signature.png"
                                                        alt="Authorized Pathologist Signature"
                                                        width={180}
                                                        height={70}
                                                        className="h-14 w-auto object-contain"
                                                        unoptimized
                                                        crossOrigin="anonymous"
                                                    />
                                                </div>
                                                <div className="mt-1 text-xs leading-tight text-black">
                                                    <p>Dr. Sini Arjun</p>
                                                    <p>MBBS, MD (Pathology)</p>
                                                    <p>Consultant Pathologist</p>
                                                </div>
                                                {/* <div className="mt-2 h-12 flex items-center justify-center">
                                                <span className="text-xs text-black font-medium">Authorized Pathologist</span>
                                            </div> */}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* If not detailed report, render the classic table */}
                                {!detailedEntry && !shouldHideResultTable && (

                                    <div className="overflow-hidden  border border-black " data-print-block data-print-table="true" style={{ marginTop: shouldHideTestNameHeading ? '0' : '1rem' }}>
                                        {/* report name */}
                                        {!shouldHideTestNameHeading && (
                                            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-black text-center my-1" data-print-block>{report.testName}</h3>
                                        )}
                                        <table className="w-full text-[13px] border-collapse rounded-lg" >
                                            <thead className=" ">
                                                <tr>
                                                    <th className="p-2 text-left font-semibold text-black">TEST PARAMETER</th>
                                                    <th className="p-2 text-center font-semibold text-black">RESULT</th>
                                                    <th className="p-2 text-left font-semibold text-black">REFERENCE RANGE</th>
                                                    <th className="p-2 text-left font-semibold text-black">UNITS</th>
                                                </tr>
                                            </thead>
                                            <tbody>{renderedRows}</tbody>
                                        </table>

                                    </div>
                                )}

                                {!detailedEntry && !shouldHideResultTable && referenceRangesContent}

                                {!detailedEntry && qualitativeRows.length > 0 && (
                                    <div className="mt-4">
                                        <div className="space-y-3">
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
                                                const shouldPageBreakBeforeDescription =
                                                    descriptionRows.length > 0 && !shouldHideResultTable;

                                                return (
                                                    <>
                                                        {/* {otherQualitativeRows.length > 0 && (
                                                            <div className="overflow-hidden border border-black" data-print-block data-print-table="true">
                                                                <table className="w-full text-[13px] border-collapse">
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="p-2 text-left font-semibold text-black">Test Name</th>
                                                                            <th className="p-2 text-right font-semibold text-black">Result</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {otherQualitativeRows.map((row, idx) => (
                                                                            <tr key={`qual-row-${report.reportId}-${idx}`} className="border-t border-black">
                                                                                <td className="p-2 text-black">
                                                                                    {getQualitativeDisplayName(row)}
                                                                                </td>
                                                                                <td className="p-2 text-black font-semibold text-right">
                                                                                    {row.enteredValue || "N/A"}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )} */}


                                                        {otherQualitativeRows.length > 0 && (
                                                            <div className="overflow-hidden border border-black" data-print-block data-print-table="true">
                                                                <table className="w-full text-[13px] border-collapse table-fixed">
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
                                                            </div>
                                                        )}


                                                        {descriptionRows.length > 0 && (
                                                            <div
                                                                className={`space-y-2 pb-4 ${shouldPageBreakBeforeDescription ? " description-print-block" : ""}`}
                                                                data-print-block
                                                            >
                                                                {/*  test name */}
                                                                {descriptionRows.some(row => getQualitativeDisplayName(row)) && (
                                                                    <h3 className="text-sm font-bold uppercase tracking-wide text-black text-center my-1" data-print-block>
                                                                        {report.testName}
                                                                    </h3>
                                                                )}
                                                                {descriptionRows.map((row, idx) => {
                                                                    const resultValue = row.enteredValue || "N/A";
                                                                    const normalizedResult = resultValue.toString().trim().toLowerCase();
                                                                    const normalizedDescription = (row.description || "").toString().trim().toLowerCase();
                                                                    const showDescription =
                                                                        !!row.description && normalizedDescription !== normalizedResult;

                                                                    return (
                                                                        <div key={`qual-desc-${report.reportId}-${idx}`} className="text-xs">
                                                                            <p className="text-black leading-0.5 font-semibold whitespace-pre-wrap">{resultValue}</p>
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
                                    </div>
                                )}

                                {/* Signature Block - appears right after report content (only for non-detailed reports) */}
                                {!detailedEntry && (
                                    <div className="grid grid-cols-2 gap-4 pt-4 mt-4" data-print-block data-print-role="signature">
                                        <div className="text-center">
                                            <div className="h-14 flex items-center justify-center"></div>
                                            <div className="mt-1 text-xs text-black font-medium">Lab Technician</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center">
                                                <Image
                                                    src="/signature.png"
                                                    alt="Authorized Pathologist Signature"
                                                    width={180}
                                                    height={70}
                                                    className="h-14 w-auto object-contain"
                                                    unoptimized
                                                    crossOrigin="anonymous"
                                                />
                                            </div>
                                            <div className="mt-1 text-xs leading-tight text-black my-1">
                                                <p>Dr. Sini Arjun</p>
                                                <p>MBBS, MD (Pathology)</p>
                                                <p>Consultant Pathologist</p>
                                            </div>
                                            {/* <div className="mt-2 h-12 flex items-center justify-center">
                                                <span className="text-xs text-black font-medium">Authorized Pathologist</span>
                                            </div> */}
                                        </div>
                                    </div>
                                )}

                                <div data-footer-section data-print-block data-print-role="footer" className="  border-black" style={{ marginTop: "auto" }}>

                                    <div className="mt-4 text-center">
                                        <h4 className="text-[9px] font-bold text-black mt-4 mb-1 text-left italic">Disclaimer</h4>
                                        <p className="text-[9px] text-black italic text-left mb-1">
                                            *This laboratory report is intended for clinical correlation only. Results should be interpreted by a qualified medical professional. Laboratory values may vary based on methodology and biological variance. The diagnostic center is not responsible for misinterpretation or misuse of results.*
                                        </p>
                                        <p className="text-[9px] text-black mb-1">
                                            This is an electronically generated report. No physical signature required.
                                        </p>
                                        <p className="text-[9px] font-medium text-black mt-1">
                                            Thank you for choosing {currentLab?.name || "Our Lab"}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center mt-4">
                                        <div className="flex items-center">
                                            <Image
                                                src="/tiamed1.svg"
                                                alt="Tiamed Logo"
                                                width={60}
                                                height={24}
                                                className="h-6 w-auto mr-2 opacity-80"
                                                unoptimized
                                                crossOrigin="anonymous"
                                            />
                                            <span className="text-xs font-medium text-black">
                                                Powered by Tiameds Technologies Pvt.Ltd
                                            </span>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs text-black">Generated on:  {(() => {
                                                const { date, time } = formatReportDateTime(report.createdDateTime);
                                                return `${date} at ${time}`;
                                            })()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>
            <style jsx global>{`
                @media print {
                    .page-break {
                        page-break-after: always;
                    }
                    .description-only-report {
                        page-break-before: always;
                        page-break-inside: avoid;

                    }
                    
                }
            `}</style>
        </div>
    );
};

export default CommonReportView2;




