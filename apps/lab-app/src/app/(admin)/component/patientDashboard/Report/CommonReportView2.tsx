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
import type { HealthSnapshot, HealthSnapshotTest, HealthSnapshotTestResult } from "@/types/patient/healthSnapshot";
import type { AiReportInsights } from "@/types/aiInsights";
import type { AiHistoryPoint, AiTestFinding } from "@/lib/ai/labReportPrompt";
import { buildAiReportCacheKey, readAiReportCache, writeAiReportCache } from "@/lib/ai/aiReportCache";

type Html2CanvasBaseOptions = NonNullable<Parameters<typeof html2canvas>[1]>;
type Html2CanvasEnhancedOptions = Html2CanvasBaseOptions & {
    scale?: number;
    windowWidth?: number;
    windowHeight?: number;
};

const DEFAULT_FONT_FAMILY = 'var(--font-inter), "Inter", "Helvetica Neue", Arial, sans-serif';
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

// The snapshot API can return the same measurement more than once: a report
// saved/regenerated twice inside one visit, or (seen on the deployed backend)
// duplicate visit rows for a single booking where each copy carries its own
// visitId/reportId -- both made a first-visit patient show a 2-point trend line.
// Collapse to one result per real measurement before any trend logic runs,
// oldest visit first: most-recent save wins within a visit, then identical
// same-day values collapse even when their visit ids differ.
const dedupeSnapshotResults = (results: HealthSnapshotTestResult[]) => {
    const stampOf = (r: HealthSnapshotTestResult) => new Date(r.createdAt || r.visitDate).getTime();
    const dayOf = (r: HealthSnapshotTestResult) => {
        const parsed = new Date(r.visitDate || r.createdAt);
        return isNaN(parsed.getTime())
            ? String(r.visitDate || r.createdAt || "")
            : parsed.toISOString().slice(0, 10);
    };
    const collapse = (
        list: HealthSnapshotTestResult[],
        keyOf: (r: HealthSnapshotTestResult, idx: number) => string
    ) => {
        const byKey = new Map<string, HealthSnapshotTestResult>();
        list.forEach((result, idx) => {
            const key = keyOf(result, idx);
            const existing = byKey.get(key);
            if (!existing || !(stampOf(result) < stampOf(existing))) {
                byKey.set(key, result);
            }
        });
        return Array.from(byKey.values());
    };
    // Pass 1: one result per visit (re-saved reports). A missing visitId must not
    // merge unrelated results, so fall back to reportId/index as a unique key.
    let deduped = collapse(results || [], (r, idx) =>
        r.visitId != null ? `visit:${r.visitId}` : `report:${r.reportId ?? `idx-${idx}`}`
    );
    // Pass 2: duplicate visit rows -- same calendar day, same value, different ids.
    deduped = collapse(deduped, (r) => `day:${dayOf(r)}|value:${(r.enteredValue || "").trim()}`);
    return deduped.sort(
        (a, b) =>
            new Date(a.visitDate || a.createdAt).getTime() - new Date(b.visitDate || b.createdAt).getTime()
    );
};

// Health Snapshot trend lines always lay dots on a fixed grid of the last N visits.
const SPARKLINE_MAX_VISITS = 4;

// ---------------------------------------------------------------------------
// Summary region layout planner
// ---------------------------------------------------------------------------
// The four summary cards (Clinical Alert Summary, Key Findings, AI Clinical
// Observations, Health Snapshot) have wildly different intrinsic heights from one
// patient to the next: one finding or twenty, a two-line AI note or fifteen lines of
// it. A hard-coded "alerts | findings" then "ai | snapshot" grid can therefore only
// ever be balanced for one particular patient, and the row's `items-stretch` inflated
// the short card's border box to match the tall one -- that stretched, mostly empty
// box is what printed as the dead white area under Clinical Alert Summary.
//
// So: estimate each card's height from its own content, then pick the arrangement
// that wastes the least space. The estimates only have to *rank* candidate
// arrangements against each other, so they are deliberately coarse -- a mis-estimate
// costs a slightly uneven layout, never a broken one. Nothing here writes a height to
// the DOM; every card stays intrinsically sized.
//
// The `imbalance` term in the cost function is load-bearing, not cosmetic: whatever
// column imbalance survives is absorbed as bottom padding by the short column's last
// card (see the SUMMARY REGION comment), so keeping it minimal is what keeps that card
// from looking hollow.

type SummaryCardId = "alerts" | "findings" | "ai" | "snapshot";
type SummaryCard = { id: SummaryCardId; columnHeight: number; bandHeight: number };
interface SummaryLayout {
    /** Cards spanning the full content width, stacked in order, above the columns. */
    bands: SummaryCardId[];
    left: SummaryCardId[];
    right: SummaryCardId[];
}

// Reading order. The alert tiles are the report's headline and always come first.
const SUMMARY_CARD_ORDER: SummaryCardId[] = ["alerts", "findings", "ai", "snapshot"];

// Coarse content metrics in CSS px, at the report's 210mm print width. These track the
// cards' actual typography (11px/1.25 body, 9px/1.25 sub-text, p-2.5 card padding); they
// only need to be close enough to rank arrangements, so keep them roughly in step with
// the card CSS rather than exact.
const SUMMARY_CARD_CHROME_PX = 52; // card padding + title row
const ALERT_TILES_PX = 92; // the four stat tiles: one row at any width
const FINDING_ROW_PX = 30; // one two-line finding entry + its row gap
const SNAPSHOT_ROW_PX = 30; // one test name + sparkline
const AI_FIELD_LABEL_PX = 13;
const AI_LINE_PX = 14;
const AI_FOOTNOTE_PX = 16;
// ~11px text: characters that fit on one line in a half-width column vs a full-width band.
const AI_CHARS_PER_COLUMN_LINE = 52;
const AI_CHARS_PER_BAND_LINE = 110;

// Greedy longest-first 2-partition: drop the tallest remaining card into whichever
// column is currently shorter. This keeps the two columns within roughly one card's
// height of each other for any content mix, so neither column trails a long blank
// tail. Cards are then restored to reading order within their column.
const packSummaryColumns = (cards: SummaryCard[]) => {
    const left: SummaryCard[] = [];
    const right: SummaryCard[] = [];
    let leftHeight = 0;
    let rightHeight = 0;

    [...cards]
        .sort((a, b) => b.columnHeight - a.columnHeight)
        .forEach((card) => {
            if (leftHeight <= rightHeight) {
                left.push(card);
                leftHeight += card.columnHeight;
            } else {
                right.push(card);
                rightHeight += card.columnHeight;
            }
        });

    const byReadingOrder = (a: SummaryCard, b: SummaryCard) =>
        SUMMARY_CARD_ORDER.indexOf(a.id) - SUMMARY_CARD_ORDER.indexOf(b.id);
    left.sort(byReadingOrder);
    right.sort(byReadingOrder);

    // Whichever column the packer happened to give the alert tiles becomes the left
    // column, so the report always reads Clinical Alert Summary first.
    const alertsOnRight = right.some((card) => card.id === "alerts");
    return {
        left: (alertsOnRight ? right : left).map((card) => card.id),
        right: (alertsOnRight ? left : right).map((card) => card.id),
        height: Math.max(leftHeight, rightHeight),
        imbalance: Math.abs(leftHeight - rightHeight),
    };
};

// Promoting a card to a full-width band lets its content flow *wider* instead of
// taller: the findings list goes two-up, the alert tiles spread out. That is what
// rescues the lopsided cases -- 20 findings with nothing tall enough to sit opposite
// them would otherwise strand half a column of white space.
const SUMMARY_BAND_CANDIDATES: SummaryCardId[][] = [
    [], // everything in two balanced columns
    ["alerts"], // alert tiles across the top, the rest in columns
    ["alerts", "findings"], // + findings flowing two-up across the full width
    ["alerts", "findings", "ai", "snapshot"], // fully stacked (very few / very lopsided cards)
];

const planSummaryLayout = (cards: SummaryCard[]): SummaryLayout | null => {
    if (cards.length === 0) return null;

    const byId = new Map(cards.map((card) => [card.id, card]));
    let best: SummaryLayout | null = null;
    let bestCost = Number.POSITIVE_INFINITY;

    SUMMARY_BAND_CANDIDATES.forEach((candidate) => {
        const bandCards = candidate
            .map((id) => byId.get(id))
            .filter((card): card is SummaryCard => Boolean(card));
        let columnCards = cards.filter((card) => !candidate.includes(card.id));

        // One leftover card would sit half-width beside a blank half. Band it instead.
        if (columnCards.length === 1) {
            bandCards.push(columnCards[0]);
            columnCards = [];
        }

        const bands = [...bandCards].sort(
            (a, b) => SUMMARY_CARD_ORDER.indexOf(a.id) - SUMMARY_CARD_ORDER.indexOf(b.id)
        );
        const bandsHeight = bands.reduce((sum, card) => sum + card.bandHeight, 0);
        const columns = packSummaryColumns(columnCards);

        // Wasted space is what makes a report look unprofessional, so imbalance is
        // scored as heavily as height itself: a taller-but-flush arrangement beats a
        // shorter one that strands a half-empty column.
        const cost = bandsHeight + columns.height + columns.imbalance;
        if (cost < bestCost) {
            bestCost = cost;
            best = { bands: bands.map((card) => card.id), left: columns.left, right: columns.right };
        }
    });

    return best;
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
    // Sample Management passes false: its report view skips the AI Clinical
    // Observations card (and the OpenAI call behind it). Dashboard views keep it.
    showAiInsights?: boolean;
}

const CommonReportView2 = ({
    patientData,
    doctorName,
    hidePrintButton = false,
    reportsData,
    showAiInsights = true,
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

    // Health Snapshot card shows trend as a small colored line chart instead of raw
    // numbers -- color reflects the latest reading's status (reuses the same
    // normal/borderline/critical scoring as Detailed Lab Results), shape reflects the
    // last few visits' relative movement.
    const buildTestSparkline = (test: HealthSnapshotTest) => {
        const parsedPoints = dedupeSnapshotResults(test.results)
            .map((r) => ({
                value: parseFloat(r.enteredValue),
                score: scoreValue(r.enteredValue, r.referenceRange),
            }))
            .filter((p) => Number.isFinite(p.value));

        if (parsedPoints.length < 2) return null;

        const usable = parsedPoints.slice(-SPARKLINE_MAX_VISITS);
        const values = usable.map((p) => p.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        const width = 200;
        const height = 28;
        const padX = 6;
        const padY = 5;
        // Fixed 4-visit slot grid: with fewer visits the dots occupy only the first
        // slots from the left instead of stretching across the full width.
        const stepX = (width - padX * 2) / (SPARKLINE_MAX_VISITS - 1);

        const points = usable.map((p, i) => ({
            x: padX + stepX * i,
            y: height - padY - ((p.value - min) / range) * (height - padY * 2),
        }));

        const latest = usable[usable.length - 1].score;
        const color =
            latest.kind === "critical"
                ? REPORT_COLORS.danger500
                : latest.kind === "borderline"
                    ? REPORT_COLORS.warning500
                    : latest.kind === "normal"
                        ? REPORT_COLORS.success600
                        : REPORT_COLORS.neutral600;

        return {
            width,
            height,
            color,
            points,
            pointsAttr: points.map((p) => `${p.x},${p.y}`).join(" "),
        };
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

    // A report must render identically every time it is opened. The snapshot API
    // always returns the patient's full history up to today, so re-opening an old
    // report after newer visits exist would suddenly grow trend lines that were
    // not on the report when it was issued. Clamp the snapshot to the visit being
    // viewed: keep only results from that visit or earlier ones.
    const visibleSnapshot = useMemo<HealthSnapshot | null>(() => {
        if (!healthSnapshot) return null;
        const visitIds = reportsData
            .map((r) => r.visitId)
            .filter((id): id is number => typeof id === "number" && Number.isFinite(id));
        const maxVisitId = visitIds.length > 0 ? Math.max(...visitIds) : null;
        // Fallback for snapshot rows missing a visitId: nothing belonging to this
        // report can have been recorded after the report itself was created.
        const reportTimes = reportsData
            .map((r) => new Date(r.createdDateTime || "").getTime())
            .filter((t) => Number.isFinite(t));
        const cutoffTime = reportTimes.length > 0 ? Math.max(...reportTimes) : null;

        const isVisible = (r: HealthSnapshotTestResult) => {
            if (maxVisitId != null && r.visitId != null) return r.visitId <= maxVisitId;
            if (cutoffTime == null) return true;
            const t = new Date(r.visitDate || r.createdAt).getTime();
            return !Number.isFinite(t) || t <= cutoffTime;
        };

        return {
            ...healthSnapshot,
            tests: healthSnapshot.tests
                .map((test) => ({ ...test, results: (test.results || []).filter(isVisible) }))
                .filter((test) => test.results.length > 0),
        };
    }, [healthSnapshot, reportsData]);

    // Flattens the patient's Health Snapshot (test-by-test visit history) into the
    // shape the AI prompt expects, so it can reason about trends vs. the current report.
    const aiHistoryPoints = useMemo<AiHistoryPoint[]>(() => {
        if (!visibleSnapshot) return [];
        const points: AiHistoryPoint[] = [];
        visibleSnapshot.tests.forEach((test) => {
            // Same dedupe as the sparklines, so the AI never reasons about duplicate
            // rows the deployed backend returns for a single visit.
            dedupeSnapshotResults(test.results).forEach((result) => {
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
    }, [visibleSnapshot]);

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
    // Health Snapshot history) are ready. Result is cached in localStorage keyed by the
    // report set + its content, so reopening the same report skips the OpenAI call entirely.
    useEffect(() => {
        if (!showAiInsights || !healthSnapshotFetched || aiTestFindings.length === 0) {
            return;
        }

        const cacheKey = buildAiReportCacheKey(
            sortedReports.map((r) => r.reportId),
            aiTestFindings,
            aiHistoryPoints
        );
        const cached = readAiReportCache(cacheKey);
        if (cached) {
            setAiInsights(cached);
            setAiInsightsError(null);
            setAiInsightsLoading(false);
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
                if (!cancelled) {
                    setAiInsights(data);
                    writeAiReportCache(cacheKey, data);
                }
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
    }, [showAiInsights, healthSnapshotFetched, aiTestFindings, aiHistoryPoints, sortedReports, patientData?.patientname, patientData?.dateOfBirth, patientData?.gender]);

    const getFindingBadge = (finding: ClinicalFinding) => {
        const directionLabel = finding.direction === "high" ? "HIGH" : "LOW";
        return {
            label: finding.kind === "borderline" ? `BORDERLINE ${directionLabel}` : directionLabel,
            color: finding.kind === "critical" ? REPORT_COLORS.warning500 : REPORT_COLORS.danger500,
        };
    };

    // Health Snapshot only appears once the patient has genuine history: at least one
    // test with results from 2+ distinct visits (after dedupe). First-time patients get
    // no card at all -- not even a placeholder message.
    const hasSnapshotTrends = useMemo(
        () => (visibleSnapshot?.tests || []).some((t) => dedupeSnapshotResults(t.results).length > 1),
        [visibleSnapshot]
    );

    // Which summary cards exist, and how they get arranged, is decided entirely by this
    // patient's content volume -- see planSummaryLayout. The cards themselves never know
    // where they land: each renders at w-full and the column/band container sizes it.
    const summaryLayout = useMemo(() => {
        const findingsCount = clinicalSummary.findings.length;
        const snapshotRows = (visibleSnapshot?.tests || []).filter(
            (test) => dedupeSnapshotResults(test.results).length > 1
        ).length;

        const aiFieldChars = aiInsights
            ? [
                aiInsights.provisionalDiagnosis,
                aiInsights.patientInterpretation,
                aiInsights.clinicalInterpretation,
                aiInsights.tips,
            ]
                .filter((lines): lines is string[] => Array.isArray(lines) && lines.length > 0)
                .map((lines) => lines.join(". ").length)
            : [];

        const aiHeightAt = (charsPerLine: number) => {
            // Loading / error / empty all render a single placeholder line.
            if (!aiInsights) return SUMMARY_CARD_CHROME_PX + AI_LINE_PX;
            const body = aiFieldChars.reduce(
                (sum, chars) =>
                    sum + AI_FIELD_LABEL_PX + Math.max(1, Math.ceil(chars / charsPerLine)) * AI_LINE_PX,
                0
            );
            const doctorToVisit = aiInsights.doctorToVisit ? AI_FIELD_LABEL_PX + AI_LINE_PX : 0;
            return SUMMARY_CARD_CHROME_PX + body + doctorToVisit + AI_FOOTNOTE_PX;
        };

        const cards: SummaryCard[] = [
            {
                id: "alerts",
                // The four stat tiles sit on one row whatever the width, so the alert card
                // is the one card whose height never varies.
                columnHeight: SUMMARY_CARD_CHROME_PX + ALERT_TILES_PX,
                bandHeight: SUMMARY_CARD_CHROME_PX + ALERT_TILES_PX,
            },
        ];
        if (findingsCount > 0) {
            cards.push({
                id: "findings",
                // Findings flow one-up in a half-width column, two-up across a full-width band.
                columnHeight: SUMMARY_CARD_CHROME_PX + findingsCount * FINDING_ROW_PX,
                bandHeight: SUMMARY_CARD_CHROME_PX + Math.ceil(findingsCount / 2) * FINDING_ROW_PX,
            });
        }
        if (showAiInsights) {
            cards.push({
                id: "ai",
                columnHeight: aiHeightAt(AI_CHARS_PER_COLUMN_LINE),
                bandHeight: aiHeightAt(AI_CHARS_PER_BAND_LINE),
            });
        }
        if (hasSnapshotTrends) {
            // Sparklines stretch horizontally, so a wider snapshot card is no shorter.
            const height = SUMMARY_CARD_CHROME_PX + Math.max(1, snapshotRows) * SNAPSHOT_ROW_PX;
            cards.push({ id: "snapshot", columnHeight: height, bandHeight: height });
        }

        return planSummaryLayout(cards);
    }, [clinicalSummary.findings.length, visibleSnapshot, aiInsights, showAiInsights, hasSnapshotTrends]);

    const renderClinicalAlertCard = () => (
        <div
            className="w-full rounded-xl p-2.5 flex flex-col gap-2"
            style={{ border: `1px solid ${REPORT_COLORS.secondary200}` }}
        >
            <h3 className="text-xs font-bold uppercase" style={{ color: REPORT_COLORS.secondary800 }}>
                Clinical Alert Summary
            </h3>
            {/* Tiles wrap rather than squeeze: flex-basis with a floor, no hardcoded widths. */}
            <div className="flex flex-wrap items-stretch gap-2">
                {[
                    { label: "Critical", sub: "Abnormality", icon: "/report/exclamation-triangle/red.jpg", color: REPORT_COLORS.danger600, value: clinicalSummary.critical },
                    { label: "Borderline", sub: "Abnormalities", icon: "/report/exclamation-triangle/outline.png", color: REPORT_COLORS.warning500, value: clinicalSummary.borderline },
                    { label: "Normal", sub: "Parameters", icon: "/report/check-circle/solid.png", color: REPORT_COLORS.success600, value: clinicalSummary.normal },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="flex-[1_1_70px] p-2 rounded-lg flex flex-col items-center gap-0.5 text-center"
                        style={{ border: `1px solid ${item.color}` }}
                    >
                        <img src={item.icon} alt="" className="w-5 h-5" crossOrigin="anonymous" />
                        <p className="text-xl font-extrabold" style={{ color: REPORT_COLORS.neutral900 }}>{item.value}</p>
                        <p className="text-[9px] font-bold uppercase" style={{ color: item.color }}>{item.label}</p>
                        <p className="text-[9px]" style={{ color: REPORT_COLORS.neutral600 }}>{item.sub}</p>
                    </div>
                ))}
                <div
                    className="flex-[1_1_70px] p-2 rounded-lg flex flex-col items-center gap-0.5 text-center"
                    style={{ border: `1px solid ${REPORT_COLORS.secondary200}` }}
                >
                    <img src="/report/Purpose.png" alt="" className="w-5 h-5" crossOrigin="anonymous" />
                    <p className="text-sm font-extrabold text-center" style={{ color: REPORT_COLORS.secondary800 }}>{clinicalSummary.overallRisk || "—"}</p>
                    <p className="text-[9px]" style={{ color: REPORT_COLORS.neutral600 }}>Overall Risk Score</p>
                </div>
            </div>
        </div>
    );

    const renderKeyFindingsCard = () => (
        <div
            className="w-full rounded-xl p-2.5 flex flex-col gap-1.5"
            style={{ border: `1px solid ${REPORT_COLORS.secondary200}` }}
        >
            <h3 className="text-xs font-bold uppercase px-1" style={{ color: REPORT_COLORS.secondary800 }}>
                Key Findings for Doctor
            </h3>
            {/* Every abnormal finding is listed (no "+N more" cutoff). The 300px basis with a
                280px floor is what makes the card self-adapting: one finding per row inside a
                half-width column, two per row when the planner promotes this card to a
                full-width band -- which halves its height without touching a media query. */}
            <div className="px-1 flex flex-wrap gap-x-3 gap-y-0.5">
                {clinicalSummary.findings.map((finding, idx) => {
                    const badge = getFindingBadge(finding);
                    const paramLabel = finding.row.testParameter || finding.report.testName;
                    const valueLabel = `${finding.row.enteredValue || "N/A"}${finding.row.unit ? ` ${finding.row.unit}` : ""}`;
                    return (
                        <div key={`${finding.report.reportId}-${idx}`} className="flex-[1_1_300px] min-w-[280px] flex items-start justify-between gap-2 py-0.5">
                            <div className="flex items-start gap-1.5">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: badge.color }} />
                                <div>
                                    <p className="text-[11px] leading-tight" style={{ color: REPORT_COLORS.neutral900 }}>
                                        <span className="font-bold">{paramLabel} : </span>
                                        <span className="font-extrabold">{valueLabel}</span>
                                    </p>
                                    <p className="text-[9px] leading-tight" style={{ color: REPORT_COLORS.neutral600 }}>Reference : {finding.row.normalRange || "N/A"}</p>
                                </div>
                            </div>
                            {/* Explicit inline-block + px line-height: html2canvas doesn't
                                blockify flex children, so an inline span with py padding paints
                                its pill background offset from the text baseline in the PDF,
                                clipping the label. Sizing via line-height keeps text centered
                                in both the browser and the capture clone. */}
                            <span
                                className="inline-block px-1.5 rounded text-[8px] leading-[14px] font-extrabold flex-shrink-0 whitespace-nowrap"
                                style={{ backgroundColor: badge.color, color: REPORT_COLORS.white }}
                            >
                                {badge.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderAiObservationsCard = () => (
        <div
            className="w-full rounded-xl p-2.5 flex flex-col gap-1.5"
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
                    ].filter((field) => field.value && field.value.length > 0).map((field) => (
                        <div key={field.label}>
                            <p className="text-[10px] font-extrabold uppercase" style={{ color: REPORT_COLORS.secondary700 }}>{field.label}</p>
                            {/* Run the points together as flowing sentences instead of
                                stacking bullets. */}
                            <p className="text-[11px] leading-tight" style={{ color: REPORT_COLORS.neutral800 }}>
                                {field.value!.map((line) => line.trim().replace(/[.;,]+$/, "")).join(". ")}.
                            </p>
                        </div>
                    ))}
                    {aiInsights.doctorToVisit && (
                        <div>
                            <p className="text-[10px] font-extrabold uppercase" style={{ color: REPORT_COLORS.secondary700 }}>Doctor to Visit</p>
                            <p className="text-[11px] leading-tight" style={{ color: REPORT_COLORS.neutral800 }}>{aiInsights.doctorToVisit}</p>
                        </div>
                    )}
                    <p className="text-[9px] mt-0.5" style={{ color: REPORT_COLORS.secondary800 }}>
                        <span className="font-semibold">Note: </span>
                        <span className="font-normal">This is an AI generated observation based on lab values only. Not a diagnosis.</span>
                    </p>
                </div>
            ) : (
                <p className="text-[11px] italic px-1" style={{ color: REPORT_COLORS.neutral600 }}>No AI observations available yet.</p>
            )}
        </div>
    );

    const renderHealthSnapshotCard = () => (
        <div
            className="w-full rounded-xl p-2.5 flex flex-col gap-2"
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
                // Count distinct visits ourselves (dedupeSnapshotResults) instead of trusting
                // the backend's totalVisits, which double-counts re-saved reports on the same
                // visit and made first-time patients show a trend line.
                const trendTests = (visibleSnapshot?.tests || []).filter(
                    (t) => dedupeSnapshotResults(t.results).length > 1
                );
                if (trendTests.length === 0) {
                    return (
                        <p className="text-[11px] italic px-1" style={{ color: REPORT_COLORS.neutral600 }}>
                            {visibleSnapshot ? "No prior visit history for these tests yet." : "Trend data will appear here once available."}
                        </p>
                    );
                }
                return (
                    <div className="flex flex-col gap-2 px-1">
                        {trendTests.map((test: HealthSnapshotTest) => {
                            const sparkline = buildTestSparkline(test);
                            return (
                                <div key={test.testName} className="flex items-center gap-2">
                                    <p className="text-[10px] font-medium uppercase leading-snug flex-[0_0_42%] min-w-0" style={{ color: REPORT_COLORS.neutral800 }}>{test.testName}</p>
                                    {sparkline ? (
                                        <svg className="flex-1 min-w-0" height="24" viewBox={`0 0 ${sparkline.width} ${sparkline.height}`} preserveAspectRatio="none">
                                            <polyline
                                                points={sparkline.pointsAttr}
                                                fill="none"
                                                stroke={sparkline.color}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            {sparkline.points.map((p, i) => (
                                                <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={sparkline.color} />
                                            ))}
                                        </svg>
                                    ) : (
                                        <span className="flex-1 flex justify-center">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: REPORT_COLORS.neutral600 }} />
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })()}
        </div>
    );

    const renderSummaryCard = (id: SummaryCardId) => {
        switch (id) {
            case "alerts":
                return renderClinicalAlertCard();
            case "findings":
                return renderKeyFindingsCard();
            case "ai":
                return renderAiObservationsCard();
            case "snapshot":
                return renderHealthSnapshotCard();
        }
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
            // html2canvas doesn't "blockify" flex/grid children the way browsers do: it keeps
            // <img> elements inline and sits them on the text baseline, so every icon/logo in
            // the PDF paints shifted upward relative to the on-screen layout. Forcing
            // display:block on the capture clone matches what the browser already computes
            // for flex children and removes the baseline offset. Icons that are the sole
            // child of a table cell relied on text-align:center, so re-center those with
            // auto margins once they become blocks.
            onclone: (clonedDoc, clonedElement) => {
                const scope: ParentNode = clonedElement ?? clonedDoc;
                scope.querySelectorAll("img").forEach((img) => {
                    const el = img as HTMLImageElement;
                    el.style.display = "block";
                    const parentTag = el.parentElement?.tagName;
                    if (parentTag === "TD" || parentTag === "TH") {
                        el.style.marginLeft = "auto";
                        el.style.marginRight = "auto";
                    }
                });
                // html2canvas clips glyph descenders when the line box is tighter than the
                // glyphs themselves (leading-none and sub-1.2 line-heights). Floor those in
                // the capture clone only; the on-screen layout is untouched.
                const win = clonedDoc.defaultView;
                if (win) {
                    scope.querySelectorAll<HTMLElement>("h1, h2, h3, h4, p, span, li, td, th").forEach((el) => {
                        const cs = win.getComputedStyle(el);
                        const fontSize = parseFloat(cs.fontSize);
                        const lineHeight = parseFloat(cs.lineHeight);
                        if (Number.isFinite(fontSize) && Number.isFinite(lineHeight) && lineHeight < fontSize * 1.2) {
                            el.style.lineHeight = "1.25";
                        }
                    });
                }
            },
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
        // html2canvas rounds the block's height down, which can shave the descenders
        // ("g", "y", "p") off the last text line of a block. A tiny padding buffer keeps
        // the bottom row of pixels clear of any text.
        el.style.paddingBottom = "3px";
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

    // The three chunk positions get different budgets, because the space available to them
    // genuinely differs:
    //   first  -- whatever is left of the current page, so a table can start mid-page
    //             (firstChunkMaxHeightPx)
    //   middle -- a whole page (maxChunkHeightPx)
    //   final  -- a whole page MINUS whatever has to be drawn under the table, i.e. the
    //             closing block (finalChunkLimitPx)
    // Only the final chunk owes the closing block any room. Charging that reserve to the
    // first chunk instead leaves a footer-sized band of white on the page where the table
    // starts, for a footer that is only drawn pages later.
    // finalChunkLimitPx is a callback rather than a number because the last chunk's budget
    // depends on how many chunks there turn out to be: a table that packs into one chunk is
    // still sitting on the current page, while any later chunk starts a page of its own.
    const chunkTableElementByRows = (
        tableWrapper: HTMLElement,
        maxChunkHeightPx: number,
        firstChunkMaxHeightPx?: number,
        finalChunkLimitPx?: (chunkCount: number) => number
    ) => {
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

        // Greedy row packing under a per-chunk budget. Reports the height each chunk settled
        // at, so the caller can re-pack if the chunk that ended up last is too tall for what
        // has to be drawn beneath it.
        const packRows = (limitAt: (chunkIndex: number) => number) => {
            const nodes: HTMLElement[] = [];
            const heights: number[] = [];
            let currentChunk = createChunk();
            measurementHost.appendChild(currentChunk.wrapperClone);

            const sealChunk = () => {
                nodes.push(currentChunk.wrapperClone.cloneNode(true) as HTMLElement);
                heights.push(currentChunk.wrapperClone.offsetHeight);
            };

            sourceRows.forEach((row) => {
                const candidateRow = row.cloneNode(true) as HTMLTableRowElement;
                currentChunk.tbody.appendChild(candidateRow);

                const hasMultipleRows = currentChunk.tbody.children.length > 1;
                if (currentChunk.wrapperClone.offsetHeight > limitAt(nodes.length) && hasMultipleRows) {
                    currentChunk.tbody.removeChild(candidateRow);

                    // A section-title band ("2. COMPLETE HAEMOGRAM", "DIFFERENTIAL COUNT", ...)
                    // must not be stranded as the last row of a page -- carry it into the next
                    // chunk so it starts the new page right above its data rows.
                    const carryRows: Element[] = [];
                    while (
                        currentChunk.tbody.children.length > 1 &&
                        currentChunk.tbody.lastElementChild?.getAttribute("data-section-title-row") === "true"
                    ) {
                        const titleRow = currentChunk.tbody.lastElementChild;
                        currentChunk.tbody.removeChild(titleRow);
                        carryRows.unshift(titleRow);
                    }

                    sealChunk();
                    measurementHost.removeChild(currentChunk.wrapperClone);

                    currentChunk = createChunk();
                    measurementHost.appendChild(currentChunk.wrapperClone);
                    carryRows.forEach((carried) => currentChunk.tbody.appendChild(carried));
                    currentChunk.tbody.appendChild(row.cloneNode(true));
                }
            });

            if (currentChunk.tbody.children.length > 0) {
                sealChunk();
            }
            measurementHost.removeChild(currentChunk.wrapperClone);
            return { nodes, heights };
        };

        // A budget is only ever tightened, never relaxed, so re-packing always pushes rows
        // forward and the chunk count can only grow -- which is what makes the loop below settle.
        const tightenedLimits = new Map<number, number>();
        const limitAt = (chunkIndex: number) => {
            const budget =
                chunkIndex === 0 && firstChunkMaxHeightPx !== undefined ? firstChunkMaxHeightPx : maxChunkHeightPx;
            const tightened = tightenedLimits.get(chunkIndex);
            return tightened === undefined ? budget : Math.max(1, Math.min(budget, tightened));
        };

        let packed = packRows(limitAt);

        // Now that the chunk count is known, check the chunk that actually ends the table: if
        // the closing block cannot fit under it, cap it and re-pack. Its tail rows spill into
        // one more chunk, which begins a fresh page with room to spare for the footer. In the
        // common case the final chunk is a short remainder that already fits, and this costs
        // one comparison and no re-pack.
        if (finalChunkLimitPx) {
            for (let pass = 0; pass < 3; pass += 1) {
                const finalIndex = packed.nodes.length - 1;
                if (finalIndex < 0) {
                    break;
                }
                const finalLimit = Math.max(1, finalChunkLimitPx(packed.nodes.length));
                if (packed.heights[finalIndex] <= finalLimit) {
                    break;
                }
                tightenedLimits.set(finalIndex, finalLimit);
                packed = packRows(limitAt);
            }
        }

        document.body.removeChild(measurementHost);
        return packed.nodes.length > 0 ? packed.nodes : [tableWrapper.cloneNode(true) as HTMLElement];
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
            let closingCanvas: HTMLCanvasElement | null = null;
            let headerHeightMm = 0;
            let closingHeightMm = 0;
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
            const closingTemplate = pageTemplateSection.querySelector('[data-print-role="closing"]') as HTMLElement | null;

            if (headerTemplate) {
                stripBlockMargins(headerTemplate);
                headerCanvas = await renderNodeToCanvas(headerTemplate, renderScale);
                headerHeightMm = canvasToMm(headerCanvas, PAGE_WIDTH_MM).heightMm;
            }
            if (closingTemplate) {
                stripBlockMargins(closingTemplate);
                closingCanvas = await renderNodeToCanvas(closingTemplate, renderScale);
                closingHeightMm = canvasToMm(closingCanvas, PAGE_WIDTH_MM).heightMm;
            }
            tempContainer.removeChild(pageTemplateSection);

            const contentTopMm = TOP_MARGIN_MM + (headerHeightMm > 0 ? headerHeightMm + BLOCK_GAP_MM : 0);
            // The closing block isn't reserved on every page -- it's appended to the normal
            // content flow after the last block, so a report that fits on one page actually
            // stays on one page instead of leaving a permanent blank gap sized for a footer
            // that only ever gets drawn on the final page.
            const contentBottomMm = PAGE_HEIGHT_MM - BOTTOM_MARGIN_MM - CONTENT_SAFETY_MM;
            const usableContentHeightMm = contentBottomMm - contentTopMm > 0 ? contentBottomMm - contentTopMm : USABLE_HEIGHT_MM;

            // Bottom limit that applies only to the *final* piece of content, so signature +
            // footer land on the same page as the content they close. Without this the last
            // table row could sit 5mm above the bottom margin and shunt the whole closing block
            // onto a page of its own. If the closing block is somehow taller than a whole page,
            // reserving for it is hopeless -- fall back to the normal limit.
            const closingReserveMm = closingHeightMm > 0 ? closingHeightMm + BLOCK_GAP_MM : 0;
            const closingFitsOnAPage = closingReserveMm > 0 && closingReserveMm < usableContentHeightMm;
            const finalContentBottomMm = closingFitsOnAPage ? contentBottomMm - closingReserveMm : contentBottomMm;
            // A heading (or any keep-with-next block) must be followed by at least this much of
            // the next block on the same page, otherwise it is an orphan and we break before it.
            const KEEP_WITH_NEXT_MIN_FOLLOW_MM = 24;

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

            // bottomLimitMm lets a caller shrink the page for one particular block -- used to
            // reserve room for the closing block under the last piece of content. reserveAfterMm
            // additionally demands that some of the *next* block fits too (keep-with-next).
            const placeCanvasWithPagination = (
                canvas: HTMLCanvasElement,
                bottomLimitMm: number = contentBottomMm,
                reserveAfterMm = 0
            ) => {
                const { widthMm, heightMm } = canvasToMm(canvas, PAGE_WIDTH_MM);
                const remainingMm = bottomLimitMm - currentY;

                if (heightMm + reserveAfterMm <= remainingMm) {
                    addCanvasAtCursor(pdf, canvas, MARGIN_X_MM, currentY, widthMm, heightMm);
                    currentY += heightMm + BLOCK_GAP_MM;
                    hasContentOnPage = true;
                    contentPages.add(currentPageNumber);
                    return;
                }

                // Doesn't fit here but fits on a page of its own: move the whole block rather
                // than splitting it. This is what "never split a card down the middle" means in
                // a canvas pipeline -- CSS break-inside has no effect on an html2canvas capture.
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

                // Last resort: a single block taller than a whole page (a very long AI note, a
                // huge findings list). Nothing can keep it intact, so slice the bitmap.
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
                    return role !== "header" && role !== "closing";
                });
                const nodesToRender = contentBlocks.length > 0 ? contentBlocks : [sectionClone];
                nodesToRender.forEach(stripBlockMargins);

                for (let nodeIndex = 0; nodeIndex < nodesToRender.length; nodeIndex += 1) {
                    const node = nodesToRender[nodeIndex];
                    const isTableBlock = node.getAttribute("data-print-table") === "true";
                    const isLastContentNode = nodeIndex === nodesToRender.length - 1;
                    // Only the final piece of content has to leave room for the closing block.
                    const nodeBottomMm = isLastContentNode ? finalContentBottomMm : contentBottomMm;
                    const keepWithNext =
                        node.getAttribute("data-print-keep-with-next") === "true" && !isLastContentNode;

                    if (!isTableBlock) {
                        const canvas = await renderNodeToCanvas(node, renderScale);
                        placeCanvasWithPagination(
                            canvas,
                            nodeBottomMm,
                            keepWithNext ? KEEP_WITH_NEXT_MIN_FOLLOW_MM : 0
                        );
                        continue;
                    }

                    const fullCanvas = await renderNodeToCanvas(node, renderScale);
                    const fullDims = canvasToMm(fullCanvas, PAGE_WIDTH_MM);
                    const remainingMm = nodeBottomMm - currentY;

                    if (fullDims.heightMm <= remainingMm) {
                        addCanvasAtCursor(pdf, fullCanvas, MARGIN_X_MM, currentY, fullDims.widthMm, fullDims.heightMm);
                        currentY += fullDims.heightMm + BLOCK_GAP_MM;
                        hasContentOnPage = true;
                        contentPages.add(currentPageNumber);
                        continue;
                    }

                    // The table doesn't fit in what's left of the page. Don't move it wholesale
                    // to a fresh page (that stranded a huge blank gap under the results heading)
                    // -- split it by rows so the first chunk fills the remaining space and the
                    // rest flows onto the following pages.
                    // The chunker measures offsetHeight in CSS pixels, so convert the print-mm
                    // budgets via the node's CSS width; the previous canvas-based ratio was
                    // inflated by renderScale, producing page-overflowing chunks that fell back
                    // to slicing the canvas mid-row.
                    const cssPxPerMm = node.offsetWidth > 0 ? node.offsetWidth / PAGE_WIDTH_MM : 96 / 25.4;
                    const maxChunkHeightPx = Math.max(1, Math.floor(usableContentHeightMm * cssPxPerMm));

                    // Chunks are budgeted against the real page bottom, NOT nodeBottomMm. The
                    // results table is the last content block, so nodeBottomMm carries the
                    // closing-block reserve -- and charging that reserve to the chunk the table
                    // STARTS on left a footer-sized band of white above the page break, on a page
                    // the footer is never drawn on. Only the chunk that ends the table owes the
                    // footer room, which is what finalChunkLimitPx settles below.
                    const pageRemainingMm = contentBottomMm - currentY;

                    // Too little room left even for the header row plus a few results: start the
                    // table on the next page instead of stranding a sliver.
                    const MIN_TABLE_START_MM = 30;
                    let firstChunkMm = pageRemainingMm;
                    if (pageRemainingMm < MIN_TABLE_START_MM) {
                        if (hasContentOnPage) {
                            startNewPage();
                        }
                        firstChunkMm = usableContentHeightMm;
                    }
                    // Shave 1mm off the budgets so rounding can't push a chunk past the measured
                    // space and onto a new page anyway.
                    const firstChunkHeightPx = Math.max(1, Math.floor((firstChunkMm - 1) * cssPxPerMm));

                    // Height the final chunk may take for the closing block to still land beneath
                    // it. A table that packs into a single chunk has not left the current page, so
                    // it measures down from currentY; any later chunk starts a fresh page at
                    // contentTopMm. Never squeeze that chunk below the minimum worth printing --
                    // a page whose leftovers are thinner than that keeps its rows and lets the
                    // footer take the next page rather than emitting a one-row chunk.
                    const finalChunkLimitPx =
                        isLastContentNode && closingFitsOnAPage
                            ? (chunkCount: number) => {
                                  const availableMm =
                                      chunkCount === 1
                                          ? finalContentBottomMm - currentY
                                          : usableContentHeightMm - closingReserveMm;
                                  return Math.floor((Math.max(availableMm, MIN_TABLE_START_MM) - 1) * cssPxPerMm);
                              }
                            : undefined;

                    const chunkNodes = chunkTableElementByRows(
                        node,
                        maxChunkHeightPx,
                        firstChunkHeightPx,
                        finalChunkLimitPx
                    );

                    for (let chunkIndex = 0; chunkIndex < chunkNodes.length; chunkIndex += 1) {
                        const chunkNode = chunkNodes[chunkIndex];
                        tempContainer.appendChild(chunkNode);
                        const chunkCanvas = await renderNodeToCanvas(chunkNode, renderScale);
                        tempContainer.removeChild(chunkNode);

                        const chunkDims = canvasToMm(chunkCanvas, PAGE_WIDTH_MM);
                        // The final chunk of the final block is the one the closing block has to
                        // follow, so it -- and only it -- honours the reserved bottom limit.
                        // Reserving on the intermediate chunks too would cost ~1 closing block of
                        // blank space on every page the table spans.
                        const isFinalChunk = isLastContentNode && chunkIndex === chunkNodes.length - 1;
                        const chunkBottomMm =
                            isFinalChunk && chunkDims.heightMm + closingReserveMm <= usableContentHeightMm
                                ? finalContentBottomMm
                                : contentBottomMm;
                        const chunkRemainingMm = chunkBottomMm - currentY;
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

            // Signature + footer are one atomic block at the end of the flow. The last content
            // block already reserved room for it (finalContentBottomMm), so in practice it lands
            // directly under the content rather than on a page of its own.
            if (closingCanvas && closingHeightMm > 0) {
                placeCanvasWithPagination(closingCanvas);
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
    // Fed the footer's "Generated on" block, which is currently commented out.
    // Restore this together with that block.
    // const latestReportDateTime = sortedReports.reduce<string | undefined>((latest, r) => {
    //     if (!r.createdDateTime) return latest;
    //     if (!latest) return r.createdDateTime;
    //     return new Date(r.createdDateTime) > new Date(latest) ? r.createdDateTime : latest;
    // }, undefined);

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
    const RESULT_COL_WIDTHS = { parameter: undefined, result: 62, reference: 102, units: 82, status: 46 } as const;
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
        // data-section-title-row lets the PDF row-chunker keep a title band attached to
        // the rows below it instead of stranding it as the last line of a page.
        <tr key={`section-${key}`} data-section-title-row="true">
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
            const rowScore = scoreValue(row.enteredValue, row.normalRange);
            const isOutOfRange = rowScore.kind === "borderline" || rowScore.kind === "critical";

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
                        className={`px-1 py-2 text-center text-xs ${isOutOfRange ? "font-bold" : "font-normal"}`}
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

    // Clinical Attention Required section is currently disabled -- kept for reference.
    // const highPriorityFindings = clinicalSummary.findings.filter((f) => f.kind === "critical");
    // const moderatePriorityFindings = clinicalSummary.findings.filter((f) => f.kind === "borderline");
    // const moderatePriorityNames = Array.from(
    //     new Set(moderatePriorityFindings.map((f) => f.row.testParameter || f.report.testName))
    // );

    // Block the whole report (including the print/PDF button) behind a loader until AI
    // insights have either arrived, failed, or aren't applicable -- otherwise a PDF could be
    // generated mid-generation with "Generating..." baked into it instead of real insights.
    const aiReady = healthSnapshotFetched && (!showAiInsights || aiTestFindings.length === 0 || aiInsights !== null || aiInsightsError !== null);
    if (!aiReady) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className="mt-4 text-lg font-medium text-gray-700">Generating AI insights...</p>
                </div>
            </div>
        );
    }

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

            {/* Fluid on screen (shrinks with the viewport); the PDF pipeline clones the
                shell into an off-screen 210mm container, so print output is unaffected. */}
            <div
                ref={reportRef}
                className="bg-white p-3 sm:p-6"
                style={{
                    width: "100%",
                    maxWidth: "210mm",
                    margin: "0 auto",
                    boxSizing: "border-box",
                }}
            >
                <section data-report-shell className="flex flex-col">
                    {/* ================= HEADER ================= */}
                    <div className="bg-white" data-print-block data-print-role="header">
                        <div className="flex flex-row items-center justify-between mb-4">
                            <div className="flex flex-row items-center">
                                <img
                                    src="/report/image%201.png"
                                    alt="Lab Logo"
                                    className="w-28 h-16 object-contain mr-3 flex-shrink-0"
                                    crossOrigin="anonymous"
                                    data-print-logo="true"
                                />
                                <div
                                    className="flex flex-col justify-center pl-4"
                                    style={{ borderLeft: `1px solid ${REPORT_COLORS.neutral100}` }}
                                >
                                    <h1 className="text-base font-bold leading-normal" style={{ color: REPORT_COLORS.neutral900 }}>{currentLab?.name}</h1>
                                    <p className="text-[9px] leading-tight w-44 mt-0.5" style={{ color: REPORT_COLORS.neutral600 }}>
                                        {[currentLab?.address, currentLab?.city, currentLab?.state].filter(Boolean).join(', ')}
                                        {currentLab?.labPhone && ` PHONE: ${currentLab.labPhone}`}
                                    </p>
                                </div>
                            </div>
                            {/* <img
                                src="/report/Logo.png"
                                alt="Tiamed Logo"
                                className="w-28 h-9 object-contain flex-shrink-0"
                                crossOrigin="anonymous"
                            /> */}
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
                                <div key={rowIdx} className="flex flex-wrap items-start" style={{ marginTop: rowIdx > 0 ? "0.4rem" : 0 }}>
                                    {row.map((field, fieldIdx) => (
                                        <div
                                            key={field.label}
                                            className="flex-1 flex items-center"
                                            style={{ marginLeft: fieldIdx > 0 ? "0.75rem" : 0, minWidth: "150px" }}
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

                    {/* ================= SUMMARY REGION =================
                        Which cards exist, which are promoted to full-width bands, and which
                        column each one lands in is decided per patient by planSummaryLayout
                        from the actual content volume -- not hardcoded.

                        The row is exactly as tall as its taller column. Cards are atomic, so the
                        two columns can never total the same height, and the shorter one's
                        leftover used to surface as a naked white notch between the last card and
                        the results table -- resized by every patient's content, which is why the
                        gap looked arbitrary. It cannot be deleted, only relocated: the columns
                        stretch to the row, and the trailing card of the short column takes the
                        slack as its own bottom padding (flex-1, content still top-aligned). The
                        region therefore always ends flush and the table follows at one BLOCK_GAP.
                        planSummaryLayout keeps that slack at its minimum by scoring imbalance,
                        so no card is ever inflated the way items-stretch used to inflate them.

                        Each band and the column row is its own print block, so pagination can
                        break between them instead of shunting the whole region to a new page. */}
                    {summaryLayout && (
                        <div className="mt-2 flex flex-col gap-3">
                            {summaryLayout.bands.map((id) => (
                                <div key={id} data-print-block>
                                    {renderSummaryCard(id)}
                                </div>
                            ))}
                            {(summaryLayout.left.length > 0 || summaryLayout.right.length > 0) && (
                                <div className="flex flex-wrap items-stretch gap-3" data-print-block>
                                    {[summaryLayout.left, summaryLayout.right]
                                        .filter((column) => column.length > 0)
                                        .map((column) => (
                                            <div key={column.join("-")} className="flex-1 min-w-[260px] flex flex-col gap-3">
                                                {column.map((id, index) => (
                                                    <div
                                                        key={id}
                                                        className={index === column.length - 1 ? "flex-1 flex" : undefined}
                                                    >
                                                        {renderSummaryCard(id)}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ================= DETAILED LAB RESULTS ================= */}
                    <div className="mt-3">
                        {/* keep-with-next: a heading stranded at the foot of a page with its
                            table overleaf is the classic orphan. The paginator will break
                            before this block unless a meaningful slice of the table follows it
                            on the same page. */}
                        <div
                            className="flex flex-wrap items-center justify-between gap-y-1 mb-2"
                            data-print-block
                            data-print-keep-with-next="true"
                        >
                            <div className="flex items-center">
                                <img src="/report/microscope.png" alt="" className="w-4 h-4 mr-2 flex-shrink-0" crossOrigin="anonymous" />
                                <h2 className="text-sm font-extrabold uppercase leading-normal pb-0.5" style={{ color: REPORT_COLORS.secondary700 }}>Detailed Lab Results</h2>
                            </div>
                            {/* ================= LEGEND (disabled) =================
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
                            */}
                        </div>
                        {(() => {
                            const numberByReportId = new Map(sortedReports.map((r, i) => [r.reportId, i + 1]));
                            const detailedReports = sortedReports.filter(isDetailedReportEntry);
                            const simpleReports = sortedReports.filter((r) => !isDetailedReportEntry(r));

                            // Figma groups consecutive plain-numeric tests under one continuous table with
                            // a single shared header instead of repeating the header per test -- only
                            // reports with qualitative rows or a full JSON detailed report break the run.
                            const renderReportBlocks = (col: ConsolidatedReport[]) => {
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
                                    {simpleReports.length > 0 && (
                                        // Single full-width flow (horizontal tables) instead of the old
                                        // two-vertical-column masonry. Each table run is its own print block
                                        // so pagination can chunk it row-by-row instead of slicing the canvas.
                                        <div data-results-grid>
                                            <div className="w-full">
                                                {renderReportBlocks(simpleReports)}
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {/* ================= CLOSING (SIGNATURE + FOOTER) =================
                        One atomic print block on purpose. As two separate blocks the paginator
                        could fit the signature at the foot of a page and spill the footer onto
                        a page of its own -- which is exactly how reports ended up with a final
                        page that was 90% white. Together they are placed or moved as a unit,
                        and the paginator reserves room for them so they land under the last
                        content instead of alone. */}
                    <div data-print-block data-print-role="closing">
                    <div
                        className="mt-4 pt-3 flex flex-wrap items-start gap-4"
                        style={{ borderTop: `1px solid ${REPORT_COLORS.neutral100}` }}
                    >
                        {/* <div className="w-96 max-w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <img src="/report/clipboard-check.png" alt="" className="w-4 h-4" crossOrigin="anonymous" />
                                <h3 className="text-xs font-bold uppercase" style={{ color: REPORT_COLORS.secondary800 }}>Doctor Review Checklist</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-[10px]" style={{ color: REPORT_COLORS.neutral900 }}>
                                {[
                                    "Reviewed Critical Parameters",
                                    "Follow-up Recommended",
                                    "Clinical Correlation Done",
                                    "Medication Prescribed",
                                    "Additional Investigations Needed",
                                    "Patient Counseled",
                                ].map((label) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <span className="inline-block w-3.5 h-3.5 flex-shrink-0 rounded-[3px]" style={{ border: `1px solid ${REPORT_COLORS.neutral100}` }} />
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div> */}

                        {/* <div className="flex-1 min-w-[160px]">
                            <div className="flex items-center gap-2 mb-2 whitespace-nowrap">
                                <img src="/report/edit.png" alt="" className="w-4 h-4" crossOrigin="anonymous" />
                                <h3 className="text-xs font-bold uppercase" style={{ color: REPORT_COLORS.secondary800 }}>Doctor Notes</h3>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="h-0" style={{ borderTop: `1px solid ${REPORT_COLORS.neutral100}` }} />
                                <div className="h-0" style={{ borderTop: `1px solid ${REPORT_COLORS.neutral100}` }} />
                                <div className="h-0" style={{ borderTop: `1px solid ${REPORT_COLORS.neutral100}` }} />
                            </div>
                        </div> */}

                        <div className="w-full flex items-end justify-around text-center pb-1">
                            <div className="flex flex-col items-center pb-7">
                                <div className="h-10" />
                                <p className="text-[10px] font-bold leading-normal" style={{ color: REPORT_COLORS.neutral900 }}>Lab Technician</p>
                            </div>

                            <div className="flex flex-col items-center">
                                {/* <h3 className="text-xs font-bold uppercase" style={{ color: REPORT_COLORS.secondary800 }}>Lab Approval</h3> */}
                                <img
                                    src="/signature.png"
                                    alt="Authorized Pathologist Signature"
                                    className="h-10 w-auto object-contain mb-1"
                                    crossOrigin="anonymous"
                                />
                                <p className="text-xs font-bold leading-normal" style={{ color: REPORT_COLORS.neutral900 }}>Dr. Sini Arjun</p>
                                <p className="text-[10px] leading-normal mt-0.5" style={{ color: REPORT_COLORS.neutral600 }}>MBBS, MD (Pathology)</p>
                                <p className="text-[10px] leading-normal mt-0.5 pb-0.5" style={{ color: REPORT_COLORS.neutral600 }}>Consultant Pathologist</p>
                            </div>
                        </div>
                    </div>

                    {/* ================= FOOTER ================= */}
                    <div>
                        <div
                            className="mt-3 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0"
                            style={{ border: `1px solid ${REPORT_COLORS.secondary200}` }}
                        >
                            <div className="flex-[1.4] sm:pr-3">
                                <h4 className="text-[10px] font-bold mb-0.5" style={{ color: REPORT_COLORS.danger600 }}>Disclaimer</h4>
                                <p className="text-[9px] leading-tight" style={{ color: REPORT_COLORS.neutral600 }}>
                                    *This laboratory report is intended for clinical correlation only. Results should be interpreted by a qualified medical professional. Laboratory values may vary based on methodology and biological variance. The diagnostic center is not responsible for misinterpretation or misuse of results. This is an electronically generated report. No physical signature required.
                                </p>
                            </div>

                            <div className="self-stretch flex-shrink-0 hidden sm:block" style={{ borderLeft: `1px solid ${REPORT_COLORS.secondary200}` }} />

                            <div className="flex-1 flex items-center gap-2 sm:px-3">
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
                                            className="h-3.5 w-auto mr-1 opacity-80 object-contain flex-shrink-0"
                                            crossOrigin="anonymous"
                                        />
                                        <span className="text-[9px] leading-normal" style={{ color: REPORT_COLORS.neutral600 }}>
                                            Powered by Tiameds Technologies Pvt.Ltd
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* <div className="self-stretch flex-shrink-0" style={{ borderLeft: `1px solid ${REPORT_COLORS.secondary200}` }} />

                            <div className="flex-shrink-0 pl-3 text-right">
                                <p className="text-[10px]" style={{ color: REPORT_COLORS.neutral600 }}>Generated on:</p>
                                <p className="text-xs font-bold text-black">{(() => {
                                    const { date, time } = formatReportDateTime(latestReportDateTime);
                                    return `${date} at ${time}`;
                                })()}</p>
                            </div> */}
                        </div>
                    </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CommonReportView2;




