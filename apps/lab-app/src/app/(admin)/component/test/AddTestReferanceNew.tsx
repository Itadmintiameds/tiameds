import { z } from "zod";

// Schema for validating the JSON structure used for DETAILED REPORT.
// All fields are optional so users can add/remove as needed, but the overall
// shape (types of each field) is enforced.
const detailedReportJsonSchema = z
  .object({
    reportType: z.string().optional(),
    indication: z.string().optional(),
    method: z.string().optional(),
    sections: z
      .array(
        z.object({
          title: z.string().optional(),
          // Can be a single paragraph string or a list of bullet strings
          content: z.union([z.string(), z.array(z.string())]).optional(),
          contentType: z.enum(["text", "list"]).optional(),
        })
      )
      .optional(),
    tables: z
      .array(
        z.object({
          title: z.string().optional(),
          headers: z.array(z.string()).optional(),
          rows: z.array(z.array(z.string())).optional(),
        })
      )
      .optional(),
    impression: z.array(z.string()).optional(),
    followUp: z.string().optional(),
  })
  // Allow extra keys so the structure can be extended
  .passthrough();

// Default JSON template for DETAILED REPORT
const DETAILED_REPORT_JSON_TEMPLATE = {
  reportType: "Report Type Placeholder",
  indication: "Indication Placeholder",
  method: "Method/Technique Placeholder",
  sections: [
    {
      title: "Section Title 1",
      content: "Paragraph-style text placeholder.",
      contentType: "text",
    },
    {
      title: "Section Title 2",
      content: [
        "Bullet point 1 placeholder",
        "Bullet point 2 placeholder",
        "Bullet point 3 placeholder",
      ],
      contentType: "list",
    },
    {
      title: "Section Title 3",
      content: "Additional notes or observations placeholder.",
      contentType: "text",
    },
  ],
  tables: [
    {
      title: "Table Title Placeholder",
      headers: ["Header 1", "Header 2", "Header 3"],
      rows: [
        ["Row 1 Cell 1", "Row 1 Cell 2", "Row 1 Cell 3"],
        ["Row 2 Cell 1", "Row 2 Cell 2", "Row 2 Cell 3"],
      ],
    },
  ],
  impression: [
    "Impression statement 1 placeholder",
    "Impression statement 2 placeholder",
  ],
  followUp: "Follow-up instructions placeholder",
} as const;

// Schema for validating test reference points.
// Special handling:
// - For most descriptions, min/max reference ranges are required and must be >= 0.
// - For "DETAILED REPORT" and all DROPDOWN types, min/max reference ranges are optional and not validated.
export const testReferancePointSchema = z
  .object({
  id: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  testName: z.string().min(1, "Test name is required"),
  testDescription: z.string().min(1, "Test description is required"),
    units: z.string().nullish(),
  gender: z.string().min(1, "Gender is required"),
    // Make these optional at the base level so we can conditionally validate them
    minReferenceRange: z.number().min(0, "Minimum reference range must be 0 or greater").nullish(),
    maxReferenceRange: z.number().min(0, "Maximum reference range must be 0 or greater").nullish(),
  ageMin: z.number().min(0, "Minimum age must be 0 or greater").max(100, "Minimum age must be 100 or less"),
    ageMax: z
      .number()
      .min(0, "Maximum age must be 0 or greater")
      .max(100, "Maximum age must be 100 or less")
      .optional(),
  minAgeUnit: z.string().default("YEARS").optional(),
  maxAgeUnit: z.string().default("YEARS").optional(),
  reportJson: z.string().optional(),
  referenceRanges: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const desc = (data.testDescription || "").toUpperCase();

    // For DETAILED REPORT, enforce JSON presence and structure,
    // but keep min/max ranges, units, and referenceRanges completely optional/ignored.
    if (desc === "DETAILED REPORT") {
      if (!data.reportJson || !data.reportJson.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reportJson"],
          message: "Report JSON is required for DETAILED REPORT.",
        });
        return;
      }

      try {
        const parsed = JSON.parse(data.reportJson);
        detailedReportJsonSchema.parse(parsed);
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reportJson"],
          message:
            "Report JSON must be valid JSON following the detailed report structure (see template).",
        });
      }

      // Skip any range-related and units validation for detailed reports
      // These fields are completely optional for DETAILED REPORT
      return;
    }

    // For all DROPDOWN types, we skip min/max range validation entirely
    if (desc.startsWith("DROPDOWN")) {
      return;
    }

    // For all other descriptions, enforce that min and max reference ranges are present
    if (data.minReferenceRange === undefined || data.minReferenceRange === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minReferenceRange"],
        message: "Minimum reference range is required",
      });
    }

    if (data.maxReferenceRange === undefined || data.maxReferenceRange === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxReferenceRange"],
        message: "Maximum reference range is required",
      });
    }
});

import { TestReferancePoint } from "@/types/test/testlist";
import { TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PlusIcon, X } from "lucide-react";
import React from "react";
import { useLabs } from "@/context/LabContext";
import { useEffect, useState, useCallback } from "react";
import { getTests } from "../../../../../services/testService";
import { toast } from "react-toastify";
import { TestList } from "@/types/test/testlist";
import Loader from "../common/Loader";

// Detailed Report Form Editor Component
interface ReportSectionType {
    title?: string;
    content?: string | string[] | readonly string[];
    contentType?: "text" | "list";
}

interface ReportTableType {
    title?: string;
    headers?: string[] | readonly string[];
    rows?: string[][] | readonly (readonly string[])[];
}

interface DetailedReportDataType {
    reportType?: string;
    indication?: string;
    method?: string;
    sections?: ReportSectionType[];
    tables?: ReportTableType[];
    impression?: string[];
    followUp?: string;
}

interface DetailedReportFormEditorProps {
    reportData: DetailedReportDataType | null | undefined;
    onUpdate: (updates: Partial<typeof DETAILED_REPORT_JSON_TEMPLATE>) => void;
}

const DetailedReportFormEditor: React.FC<DetailedReportFormEditorProps> = ({ reportData, onUpdate }) => {
    const data = reportData || { ...DETAILED_REPORT_JSON_TEMPLATE };

    const updateField = (field: string, value: string | string[] | ReportSectionType[] | ReportTableType[] | undefined) => {
        onUpdate({ [field]: value });
    };

    const addSection = () => {
        const sections = data.sections || [];
        updateField("sections", [
            ...sections,
            { title: "", content: "", contentType: "text" }
        ]);
    };

    const updateSection = (index: number, field: string, value: string | string[] | "text" | "list") => {
        const sections = [...(data.sections || [])];
        sections[index] = { ...sections[index], [field]: value };
        updateField("sections", sections);
    };

    const removeSection = (index: number) => {
        const sections = [...(data.sections || [])];
        sections.splice(index, 1);
        updateField("sections", sections);
    };

    const addTable = () => {
        const tables = data.tables || [];
        updateField("tables", [
            ...tables,
            { title: "", headers: ["Header 1"], rows: [[""]] }
        ]);
    };

    const updateTable = (index: number, field: string, value: string | string[] | string[][]) => {
        const tables = [...(data.tables || [])];
        tables[index] = { ...tables[index], [field]: value };
        updateField("tables", tables);
    };

    const addTableRow = (tableIndex: number) => {
        const tables = [...(data.tables || [])];
        const table = { ...tables[tableIndex] };
        const headersCount = Array.isArray(table.headers) ? table.headers.length : (table.headers as readonly string[])?.length || 1;
        const newRow = Array(headersCount).fill("") as string[];
        const currentRows = Array.isArray(table.rows) ? table.rows : (table.rows ? [...(table.rows as readonly (readonly string[])[])] : []);
        table.rows = [...currentRows, newRow];
        tables[tableIndex] = table;
        updateField("tables", tables);
    };

    const updateTableRow = (tableIndex: number, rowIndex: number, cellIndex: number, value: string) => {
        const tables = [...(data.tables || [])];
        const table = { ...tables[tableIndex] };
        const currentRows = Array.isArray(table.rows) ? table.rows : (table.rows ? [...(table.rows as readonly (readonly string[])[])] : []);
        const rows = [...currentRows];
        const rowToUpdate = Array.isArray(rows[rowIndex]) ? [...rows[rowIndex] as string[]] : [...(rows[rowIndex] as readonly string[])];
        rowToUpdate[cellIndex] = value;
        rows[rowIndex] = rowToUpdate;
        table.rows = rows;
        tables[tableIndex] = table;
        updateField("tables", tables);
    };

    const addTableHeader = (tableIndex: number) => {
        const tables = [...(data.tables || [])];
        const table = { ...tables[tableIndex] };
        const currentHeaders = Array.isArray(table.headers) ? table.headers : (table.headers ? [...(table.headers as readonly string[])] : []);
        const headers = [...currentHeaders, ""];
        const currentRows = Array.isArray(table.rows) ? table.rows : (table.rows ? [...(table.rows as readonly (readonly string[])[])] : []);
        const rows = currentRows.map((row: string[] | readonly string[]) => {
            const rowArray = Array.isArray(row) ? [...row] : [...(row as readonly string[])];
            return [...rowArray, ""];
        });
        table.headers = headers;
        table.rows = rows;
        tables[tableIndex] = table;
        updateField("tables", tables);
    };

    const removeTableHeader = (tableIndex: number, headerIndex: number) => {
        const tables = [...(data.tables || [])];
        const table = { ...tables[tableIndex] };
        const currentHeaders = Array.isArray(table.headers) ? table.headers : (table.headers ? [...(table.headers as readonly string[])] : []);
        const headers = [...currentHeaders];
        headers.splice(headerIndex, 1);
        const currentRows = Array.isArray(table.rows) ? table.rows : (table.rows ? [...(table.rows as readonly (readonly string[])[])] : []);
        const rows = currentRows.map((row: string[] | readonly string[]) => {
            const newRow = Array.isArray(row) ? [...row] : [...(row as readonly string[])];
            newRow.splice(headerIndex, 1);
            return newRow;
        });
        table.headers = headers;
        table.rows = rows;
        tables[tableIndex] = table;
        updateField("tables", tables);
    };

    const removeTableRow = (tableIndex: number, rowIndex: number) => {
        const tables = [...(data.tables || [])];
        const table = { ...tables[tableIndex] };
        const currentRows = Array.isArray(table.rows) ? table.rows : (table.rows ? [...(table.rows as readonly (readonly string[])[])] : []);
        const rows = [...currentRows];
        rows.splice(rowIndex, 1);
        table.rows = rows;
        tables[tableIndex] = table;
        updateField("tables", tables);
    };

    const removeTable = (index: number) => {
        const tables = [...(data.tables || [])];
        tables.splice(index, 1);
        updateField("tables", tables);
    };

    const addImpression = () => {
        const impression = data.impression || [];
        updateField("impression", [...impression, ""]);
    };

    const updateImpression = (index: number, value: string) => {
        const impression = [...(data.impression || [])];
        impression[index] = value;
        updateField("impression", impression);
    };

    const removeImpression = (index: number) => {
        const impression = [...(data.impression || [])];
        impression.splice(index, 1);
        updateField("impression", impression);
    };

    return (
        <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
                <label className="text-gray-700 font-semibold text-base">Detailed Report Structure</label>
                <p className="text-xs text-gray-500">Add, edit, or remove any fields as needed</p>
            </div>

            {/* Basic Fields */}
            <div className="space-y-3 bg-white p-4 rounded-md border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 gap-3">
                    <div>
                        <label className="text-xs text-gray-600 mb-1 block">Report Type</label>
                        <input
                            type="text"
                            value={data.reportType || ""}
                            onChange={(e) => updateField("reportType", e.target.value)}
                            placeholder="e.g., Ultrasound, X-Ray, CT Scan"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-600 mb-1 block">Indication</label>
                        <input
                            type="text"
                            value={data.indication || ""}
                            onChange={(e) => updateField("indication", e.target.value)}
                            placeholder="Clinical indication for the test"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-600 mb-1 block">Method/Technique</label>
                        <input
                            type="text"
                            value={data.method || ""}
                            onChange={(e) => updateField("method", e.target.value)}
                            placeholder="Method or technique used"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="bg-white p-4 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Sections</h3>
                    <button
                        type="button"
                        onClick={addSection}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <PlusIcon className="h-3 w-3" />
                        Add Section
                    </button>
                </div>
                <div className="space-y-4">
                    {(data.sections || []).map((section: ReportSectionType, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                                <input
                                    type="text"
                                    value={section.title || ""}
                                    onChange={(e) => updateSection(index, "title", e.target.value)}
                                    placeholder="Section Title"
                                    className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm mr-2 focus:ring-1 focus:ring-blue-500"
                                />
                                <select
                                    value={section.contentType || "text"}
                                    onChange={(e) => {
                                        const contentType = e.target.value as "text" | "list";
                                        updateSection(index, "contentType", contentType);
                                        if (contentType === "list" && typeof section.content === "string") {
                                            updateSection(index, "content", []);
                                        } else if (contentType === "text" && Array.isArray(section.content)) {
                                            updateSection(index, "content", "");
                                        }
                                    }}
                                    className="border border-gray-300 rounded-md px-2 py-1 text-xs mr-2 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="text">Text</option>
                                    <option value="list">List</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => removeSection(index)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            {section.contentType === "list" ? (
                                <div className="space-y-2">
                                    {(() => {
                                        const contentArray = Array.isArray(section.content) 
                                            ? (Array.isArray(section.content as string[]) ? section.content as string[] : [...(section.content as readonly string[])])
                                            : [];
                                        return contentArray.map((item: string, itemIndex: number) => (
                                            <div key={itemIndex} className="flex items-center gap-2">
                                                <span className="text-gray-500 text-xs">•</span>
                                                <input
                                                    type="text"
                                                    value={item}
                                                    onChange={(e) => {
                                                        const currentContent = Array.isArray(section.content) 
                                                            ? (Array.isArray(section.content as string[]) ? [...(section.content as string[])] : [...(section.content as readonly string[])])
                                                            : [];
                                                        const content = [...currentContent];
                                                        content[itemIndex] = e.target.value;
                                                        updateSection(index, "content", content);
                                                    }}
                                                    placeholder="Bullet point"
                                                    className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const currentContent = Array.isArray(section.content) 
                                                            ? (Array.isArray(section.content as string[]) ? [...(section.content as string[])] : [...(section.content as readonly string[])])
                                                            : [];
                                                        const content = [...currentContent];
                                                        content.splice(itemIndex, 1);
                                                        updateSection(index, "content", content);
                                                    }}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ));
                                    })()}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const currentContent = Array.isArray(section.content) 
                                                ? (Array.isArray(section.content as string[]) ? [...(section.content as string[])] : [...(section.content as readonly string[])])
                                                : [];
                                            const content = [...currentContent];
                                            content.push("");
                                            updateSection(index, "content", content);
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        <PlusIcon className="h-3 w-3" />
                                        Add bullet point
                                    </button>
                                </div>
                            ) : (
                                <textarea
                                    value={typeof section.content === "string" ? section.content : ""}
                                    onChange={(e) => updateSection(index, "content", e.target.value)}
                                    placeholder="Section content (paragraph text)"
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Tables */}
            <div className="bg-white p-4 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Tables</h3>
                    <button
                        type="button"
                        onClick={addTable}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <PlusIcon className="h-3 w-3" />
                        Add Table
                    </button>
                </div>
                <div className="space-y-4">
                    {(data.tables || []).map((table: ReportTableType, tableIndex: number) => (
                        <div key={tableIndex} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                                <input
                                    type="text"
                                    value={table.title || ""}
                                    onChange={(e) => updateTable(tableIndex, "title", e.target.value)}
                                    placeholder="Table Title"
                                    className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm mr-2 focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeTable(tableIndex)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-300 rounded-md">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            {(table.headers || []).map((header: string, headerIndex: number) => (
                                                <th key={headerIndex} className="border border-gray-300 px-2 py-1">
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            value={header}
                                                            onChange={(e) => {
                                                                const headers = [...(table.headers || [])];
                                                                headers[headerIndex] = e.target.value;
                                                                updateTable(tableIndex, "headers", headers);
                                                            }}
                                                            placeholder="Header"
                                                            className="flex-1 text-xs border-0 bg-transparent focus:ring-1 focus:ring-blue-500"
                                                        />
                                                        {(table.headers || []).length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTableHeader(tableIndex, headerIndex)}
                                                                className="p-0.5 text-red-600 hover:bg-red-100 rounded"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="border border-gray-300 px-2 py-1">
                                                <button
                                                    type="button"
                                                    onClick={() => addTableHeader(tableIndex)}
                                                    className="text-blue-600 hover:text-blue-700 text-xs"
                                                >
                                                    <PlusIcon className="h-3 w-3" />
                                                </button>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const rows = Array.isArray(table.rows) 
                                                ? (Array.isArray(table.rows as string[][]) ? table.rows as string[][] : [...(table.rows as readonly (readonly string[])[])])
                                                : [];
                                            return rows.map((row: string[] | readonly string[], rowIndex: number) => {
                                                const rowArray = Array.isArray(row) ? row : [...(row as readonly string[])];
                                                return (
                                                    <tr key={rowIndex}>
                                                        {rowArray.map((cell: string, cellIndex: number) => (
                                                    <td key={cellIndex} className="border border-gray-300 px-2 py-1">
                                                        <input
                                                            type="text"
                                                            value={cell}
                                                            onChange={(e) => updateTableRow(tableIndex, rowIndex, cellIndex, e.target.value)}
                                                            placeholder="Cell"
                                                            className="w-full text-xs border-0 bg-transparent focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                ))}
                                                        <td className="border border-gray-300 px-2 py-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTableRow(tableIndex, rowIndex)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        })()}
                                    </tbody>
                                </table>
                                <button
                                    type="button"
                                    onClick={() => addTableRow(tableIndex)}
                                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    <PlusIcon className="h-3 w-3" />
                                    Add Row
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Impression */}
            <div className="bg-white p-4 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Impression</h3>
                    <button
                        type="button"
                        onClick={addImpression}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <PlusIcon className="h-3 w-3" />
                        Add Statement
                    </button>
                </div>
                <div className="space-y-2">
                    {(data.impression || []).map((item: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs">{index + 1}.</span>
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => updateImpression(index, e.target.value)}
                                placeholder="Impression statement"
                                className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => removeImpression(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Follow-up */}
            <div className="bg-white p-4 rounded-md border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Follow-up Instructions</h3>
                <textarea
                    value={data.followUp || ""}
                    onChange={(e) => updateField("followUp", e.target.value)}
                    placeholder="Follow-up instructions or recommendations"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
    );
};

interface TestAddReferanceProps {
    handleAddNewReferanceRecord: (e: React.FormEvent) => void;
    handleChangeRef: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    newReferanceRecord: TestReferancePoint;
    setNewReferanceRecord: React.Dispatch<React.SetStateAction<TestReferancePoint>>;
}

const AddTestReferanceNew = ({
    handleAddNewReferanceRecord,
    handleChangeRef,
    newReferanceRecord,
    setNewReferanceRecord,
}: TestAddReferanceProps) => {
    const { currentLab } = useLabs();
    const [tests, setTests] = useState<TestList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    useEffect(() => {
        if (currentLab) {
            setIsLoading(true);
            getTests(currentLab.id.toString())
                .then((tests) => {
                    setTests(tests);
                })
                .catch((error) => {
                    toast.error(error.message || 'Failed to load tests');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [currentLab]);

    const categories = Array.from(new Set(tests.map(test => test.category)));
    const filteredTests = tests.filter(test => {
        const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? test.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    const handleTestSelect = (test: TestList) => {
        setNewReferanceRecord(prev => ({
            ...prev,
            testName: test.name,
            category: test.category,
            minAgeUnit: prev.minAgeUnit || "YEARS",
            maxAgeUnit: prev.maxAgeUnit || "YEARS"
        }));
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Convert to uppercase while allowing numbers and maintaining cursor position
        const uppercaseValue = value.toUpperCase();
        setNewReferanceRecord(prev => {
            const updates: Partial<TestReferancePoint> = {
            ...prev,
                [name]: uppercaseValue,
            };
            
            // Handle reportJson based on test description
            if (name === "testDescription") {
                if (uppercaseValue === "DETAILED REPORT") {
                    // When switching to DETAILED REPORT and no JSON is present yet,
                    // pre-fill with the standard template so users can edit/remove as needed.
                    if (!prev.reportJson || prev.reportJson.trim() === "") {
                        updates.reportJson = JSON.stringify(DETAILED_REPORT_JSON_TEMPLATE, null, 2);
                    }
                } else {
                    // When switching away from DETAILED REPORT, clear reportJson
                    updates.reportJson = undefined;
                }
            }
            
            return updates as TestReferancePoint;
        });
    };

    const handleAgeUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewReferanceRecord(prev => ({
            ...prev,
            [name]: value || "YEARS" // Default to YEARS if empty
        }));
    };

    const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = parseFloat(value);
        
        // Prevent negative values and values greater than 100
        if (value === "" || (numericValue >= 0 && numericValue <= 100)) {
            setNewReferanceRecord(prev => ({
                ...prev,
                [name]: value === "" ? "" : numericValue
            }));
        }
    };

    // Custom handler for gender to convert "B" to "MF"
    const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value === "B" ? "MF" : e.target.value;
        setNewReferanceRecord(prev => ({
            ...prev,
            gender: value
        }));
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewReferanceRecord(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateJson = (jsonString: string): boolean => {
        if (!jsonString.trim()) return true; // Empty is valid (optional field)
        try {
            JSON.parse(jsonString);
            return true;
        } catch {
            return false;
        }
    };

  // Reference ranges state
  const [rangesTab, setRangesTab] = useState<"structured" | "raw">("structured");

  type AgeUnit = "YEARS" | "MONTHS" | "WEEKS" | "DAYS";
  type GenderOption = "M" | "F" | "MF";

  interface RangeRow {
      Gender: GenderOption;
      AgeMin: number | "";
      AgeMinUnit: AgeUnit;
      AgeMax: number | "";
      AgeMaxUnit: AgeUnit;
      ReferenceRange: string;
  }

  const DEFAULT_RANGE_ROW = (): RangeRow => ({
      Gender: "MF",
      AgeMin: 0,
      AgeMinUnit: "YEARS",
      AgeMax: "",
      AgeMaxUnit: "YEARS",
      ReferenceRange: "",
  });

  const normalizeRangeValue = (value: unknown): number | "" => {
      if (value === "" || value === null || value === undefined) return "";
      const numeric = Number(value);
      return Number.isNaN(numeric) ? "" : numeric;
  };

  const isAgeUnit = (unit: unknown): unit is AgeUnit =>
      unit === "YEARS" || unit === "MONTHS" || unit === "WEEKS" || unit === "DAYS";

  const isGenderOption = (gender: unknown): gender is GenderOption =>
      gender === "M" || gender === "F" || gender === "MF";

  const normalizeRangeRow = (row: Partial<RangeRow>): RangeRow => ({
      Gender: isGenderOption(row.Gender) ? row.Gender : "MF",
      AgeMin: normalizeRangeValue(row.AgeMin),
      AgeMinUnit: isAgeUnit(row.AgeMinUnit) ? row.AgeMinUnit : "YEARS",
      AgeMax: normalizeRangeValue(row.AgeMax),
      AgeMaxUnit: isAgeUnit(row.AgeMaxUnit) ? row.AgeMaxUnit : "YEARS",
      ReferenceRange: row.ReferenceRange ?? "",
  });

  const [rangesRows, setRangesRows] = useState<RangeRow[]>([DEFAULT_RANGE_ROW()]);


  // Helpers: Reference ranges builder
  const addRangeRow = () => setRangesRows(prev => [...prev, DEFAULT_RANGE_ROW()]);
  const removeRangeRow = (idx: number) => setRangesRows(prev => prev.filter((_, i) => i !== idx));
  const updateRangeRow = <K extends keyof RangeRow>(idx: number, field: K, value: RangeRow[K]) =>
      setRangesRows(prev =>
          prev.map((r, i) => (i === idx ? ({ ...r, [field]: value } as RangeRow) : r))
      );

  const applyRangesToJson = () => {
      const rows = rangesRows.filter(r => r.ReferenceRange);
      setNewReferanceRecord(prev => ({ ...prev, referenceRanges: JSON.stringify(rows) }));
  };

  const loadRangesFromJson = useCallback(() => {
      if (!newReferanceRecord.referenceRanges) return;
      try {
          const parsed = JSON.parse(newReferanceRecord.referenceRanges as string);
          if (Array.isArray(parsed)) {
              const normalized = parsed.map((row: unknown) =>
                  normalizeRangeRow(
                      typeof row === "object" && row !== null ? (row as Partial<RangeRow>) : {}
                  )
              );
              setRangesRows(normalized.length ? normalized : [DEFAULT_RANGE_ROW()]);
          }
      } catch {}
  }, [newReferanceRecord.referenceRanges, DEFAULT_RANGE_ROW, normalizeRangeRow]);

  useEffect(() => {
      if (newReferanceRecord.referenceRanges) {
          loadRangesFromJson();
      }
  }, [newReferanceRecord.referenceRanges, loadRangesFromJson]);

  // Helper function to check if min/max ranges should be hidden
  // Hides ranges for all DROPDOWN types and DETAILED REPORT
  const shouldHideRanges = (testDescription: string | undefined): boolean => {
      if (!testDescription) return false;
      const desc = testDescription.toUpperCase();
      return desc === "DETAILED REPORT" || desc.startsWith("DROPDOWN");
  };

  // Parse detailed report JSON or return template
  const getDetailedReportData = () => {
      try {
          if (newReferanceRecord.reportJson && newReferanceRecord.reportJson.trim()) {
              const parsed = JSON.parse(newReferanceRecord.reportJson);
              return parsed;
          }
      } catch (e) {
          // If invalid JSON, return template
      }
      return { ...DETAILED_REPORT_JSON_TEMPLATE };
  };

  // Update detailed report JSON
  const updateDetailedReportJson = (updates: Partial<typeof DETAILED_REPORT_JSON_TEMPLATE>) => {
      const current = getDetailedReportData();
      const updated = { ...current, ...updates };
      setNewReferanceRecord(prev => ({
          ...prev,
          reportJson: JSON.stringify(updated, null, 2)
      }));
  };

  if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader type="progress" fullScreen={false} text="Loading tests..." />
                <p className="mt-4 text-sm text-gray-500">Fetching test data, please wait...</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg">
            {/* Content */}
            <div className="p-6">
                {/* Search and Filter Section */}
                <div className="mb-6 space-y-3">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    />
                </div>

                <div className="flex flex-wrap gap-1.5">
                    <button
                        onClick={() => setSelectedCategory("")}
                            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${!selectedCategory ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        All
                    </button>
                    {categories?.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${selectedCategory === category ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Test Selection */}
            {filteredTests?.length > 0 && (
                    <div className="mb-6 max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                    {filteredTests.map(test => (
                        <div
                            key={test.id}
                            onClick={() => handleTestSelect(test)}
                                className={`p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${newReferanceRecord.testName === test.name ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''}`}
                        >
                                <div className="font-medium text-gray-900">{test?.name}</div>
                                <div className="text-xs text-purple-600 mt-1">{test?.category}</div>
                        </div>
                    ))}
                </div>
            )}

                {/* Selected Test Preview - Green section */}
            {newReferanceRecord?.testName && (
                    <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-100">
                        <h4 className="font-semibold text-green-800 mb-2">Selected Test</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                                <span className="font-medium text-gray-600">Test Name:</span>
                                <span className="ml-2 text-gray-900">{newReferanceRecord?.testName}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">Category:</span>
                                <span className="ml-2 text-gray-900">{newReferanceRecord?.category}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Section */}
            <form onSubmit={handleAddNewReferanceRecord} className="space-y-6">
                {/* Test Reference Description Section - Purple */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h4 className="font-semibold text-purple-800 mb-3">Test Reference Description</h4>
                    <div className="flex flex-col">
                    <input
                        type="text"
                        name="testDescription"
                        list="testDescriptionOptions"
                        placeholder="Type or select test description (will be converted to uppercase)"
                        value={newReferanceRecord?.testDescription || ""}
                        onChange={handleDescriptionChange}
                            className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 uppercase-input"
                    />
                    <datalist id="testDescriptionOptions">
                        <option value="DESCRIPTION">Description</option>
                        <option value="DROPDOWN">Dropdown</option>
                        <option value="DROPDOWN-POSITIVE/NEGATIVE">Dropdown - Positive/Negative</option>
                        <option value="DROPDOWN-PRESENT/ABSENT">Dropdown - Present/Absent</option>
                        <option value="DROPDOWN-REACTIVE/NONREACTIVE">Dropdown - Reactive/Nonreactive</option>
                        <option value="DROPDOWN-PERCENTAGE">Dropdown - Percentage</option>
                        <option value="DROPDOWN-COMPATIBLE/INCOMPATIBLE">Dropdown - Compatible/Incompatible</option>
                        <option value="DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE">Dropdown with Description - Reactive/Nonreactive</option>
                        <option value="DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT">Dropdown with Description - Present/Absent</option>
                            <option value="DETAILED REPORT">Detailed Report</option>
                    </datalist>
                        <p className="text-xs text-gray-500 mt-2">Type custom description or select from suggestions</p>
                </div>
                </div>

                {/* Basic Information Section - Blue */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-800 mb-3">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                            <label className="text-gray-700 mb-1 text-sm font-medium">Gender</label>
                    <select
                        name="gender"
                        value={newReferanceRecord?.gender === "MF" ? "B" : (newReferanceRecord?.gender || "")}
                        onChange={handleGenderChange}
                                className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="" disabled selected>Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="B">Both</option>
                    </select>
                </div>

                <div className="flex flex-col">
                            <label className="text-gray-700 mb-1 text-sm font-medium">Units</label>
                    <input
                        type="text"
                        name="units"
                        placeholder="Units"
                        value={newReferanceRecord.units || ""}
                        onChange={handleChangeRef}
                                className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                        </div>
                    </div>
                </div>

                {/* Age Information Section - Orange */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <h4 className="font-semibold text-orange-800 mb-3">Age Range</h4>
                    <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                            <label className="text-gray-700 mb-1 text-sm font-medium">Min Age</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            name="ageMin"
                            min={0}
                            max={100}
                            placeholder="Minimum Age"
                            value={newReferanceRecord.ageMin || ""}
                            onChange={handleAgeChange}
                                    className="flex-1 bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <select
                            name="minAgeUnit"
                            value={newReferanceRecord.minAgeUnit || "YEARS"}
                            onChange={handleAgeUnitChange}
                                    className="w-32 bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="YEARS">Years</option>
                            <option value="MONTHS">Months</option>
                            <option value="WEEKS">Weeks</option>
                            <option value="DAYS">Days</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col">
                            <label className="text-gray-700 mb-1 text-sm font-medium">Max Age</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            name="ageMax"
                            min={0}
                            max={100}
                            placeholder="Maximum Age"
                            value={newReferanceRecord.ageMax || ""}
                            onChange={handleAgeChange}
                                    className="flex-1 bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <select
                            name="maxAgeUnit"
                            value={newReferanceRecord.maxAgeUnit || "YEARS"}
                            onChange={handleAgeUnitChange}
                                    className="w-32 bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="YEARS">Years</option>
                            <option value="MONTHS">Months</option>
                            <option value="WEEKS">Weeks</option>
                            <option value="DAYS">Days</option>
                        </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reference Range Section - Green */}
                {!shouldHideRanges(newReferanceRecord.testDescription) && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <h4 className="font-semibold text-green-800 mb-3">Reference Range</h4>
                        <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                                <label className="text-gray-700 mb-1 text-sm font-medium">Min Range</label>
                    <input
                        type="number"
                        name="minReferenceRange"
                        placeholder="Minimum Range"
                        min={0}
                        value={newReferanceRecord.minReferenceRange || ""}
                        onChange={handleChangeRef}
                                    className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                <div className="flex flex-col">
                                <label className="text-gray-700 mb-1 text-sm font-medium">Max Range</label>
                    <input
                        type="number"
                        name="maxReferenceRange"
                        placeholder="Maximum Range"
                         min={0}
                        value={newReferanceRecord.maxReferenceRange || ""}
                        onChange={handleChangeRef}
                                    className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                </div>
                        </div>
                    </div>
                )}

                {/* Report Content Editor / Report JSON - Only for DETAILED REPORT */}
                {newReferanceRecord.testDescription === "DETAILED REPORT" && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3">Detailed Report Configuration</h4>
                        <DetailedReportFormEditor
                            reportData={getDetailedReportData()}
                            onUpdate={updateDetailedReportJson}
                        />
                </div>
                )}

                {/* Reference Ranges Field - Structured/Raw (hidden for DETAILED REPORT and all DROPDOWN types) */}
                {!shouldHideRanges(newReferanceRecord.testDescription) && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-yellow-800">Reference Ranges JSON (Optional)</h4>
                            <div className="inline-flex rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                <button 
                                    type="button" 
                                    className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 ${rangesTab === 'structured' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} 
                                    onClick={() => setRangesTab('structured')}
                                >
                                    Structured
                                </button>
                                <button 
                                    type="button" 
                                    className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 ${rangesTab === 'raw' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} 
                                    onClick={() => setRangesTab('raw')}
                                >
                                    Raw
                                </button>
                        </div>
                    </div>

                    {rangesTab === 'structured' ? (
                            <div className="space-y-3 bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                    <h5 className="text-sm font-semibold text-gray-800">Reference Ranges Builder</h5>
                                    <span className="text-xs text-gray-500">Use rows per age/gender</span>
                            </div>
                            <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600 font-medium">Ranges</span>
                                <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={addRangeRow} 
                                            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 transition-all duration-200"
                                        >
                                            Add Row
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={loadRangesFromJson} 
                                            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 transition-all duration-200"
                                        >
                                            Load from JSON
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={applyRangesToJson} 
                                            className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-200"
                                            style={{ background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)` }}
                                        >
                                            Apply to JSON
                                        </button>
                                </div>
                            </div>

                            <div className="overflow-auto">
                                <div className="min-w-[720px]">
                                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 mb-2">
                                        <div className="col-span-1">Gender</div>
                                        <div className="col-span-2">Age Min</div>
                                        <div className="col-span-2">Age Max</div>
                                        <div className="col-span-6">Reference Range</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    {rangesRows.map((row, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                            <select
                                                className="col-span-1 border border-gray-300 rounded p-2 text-xs"
                                                value={row.Gender}
                                                onChange={(e) => updateRangeRow(idx, "Gender", e.target.value as GenderOption)}
                                            >
                                                <option value="M">Male</option>
                                                <option value="F">Female</option>
                                                <option value="MF">Both</option>
                                            </select>
                                            <div className="col-span-2 grid grid-cols-2 gap-2">
                                                <input
                                                    className="border border-gray-300 rounded p-2 text-xs"
                                                    type="number"
                                                    min={0}
                                                    value={row.AgeMin === "" ? "" : row.AgeMin}
                                                    onChange={(e) =>
                                                        updateRangeRow(
                                                            idx,
                                                            "AgeMin",
                                                            e.target.value === "" ? "" : Number(e.target.value)
                                                        )
                                                    }
                                                    placeholder="0"
                                                />
                                                <select
                                                    className="border border-gray-300 rounded p-2 text-xs"
                                                    value={row.AgeMinUnit}
                                                    onChange={(e) => updateRangeRow(idx, "AgeMinUnit", e.target.value as AgeUnit)}
                                                >
                                                    <option value="YEARS">YEARS</option>
                                                    <option value="MONTHS">MONTHS</option>
                                                    <option value="WEEKS">WEEKS</option>
                                                    <option value="DAYS">DAYS</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 grid grid-cols-2 gap-2">
                                                <input
                                                    className="border border-gray-300 rounded p-2 text-xs"
                                                    type="number"
                                                    min={0}
                                                    value={row.AgeMax === "" ? "" : row.AgeMax}
                                                    onChange={(e) =>
                                                        updateRangeRow(
                                                            idx,
                                                            "AgeMax",
                                                            e.target.value === "" ? "" : Number(e.target.value)
                                                        )
                                                    }
                                                    placeholder=""
                                                />
                                                <select
                                                    className="border border-gray-300 rounded p-2 text-xs"
                                                    value={row.AgeMaxUnit}
                                                    onChange={(e) => updateRangeRow(idx, "AgeMaxUnit", e.target.value as AgeUnit)}
                                                >
                                                    <option value="YEARS">YEARS</option>
                                                    <option value="MONTHS">MONTHS</option>
                                                    <option value="WEEKS">WEEKS</option>
                                                    <option value="DAYS">DAYS</option>
                                                </select>
                                            </div>
                                            <input className="col-span-6 border border-gray-300 rounded p-2 text-xs" placeholder="e.g., 12.0 - 16.0 g/dL / 4.5 - 11.0 x 10³/μL" value={row.ReferenceRange} onChange={(e) => updateRangeRow(idx, 'ReferenceRange', e.target.value)} />
                                            <button type="button" className="col-span-1 text-xs text-red-600" onClick={() => removeRangeRow(idx)}>Remove</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Live Preview */}
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <h6 className="text-xs font-semibold text-gray-800 mb-2">Live Preview</h6>
                                {rangesRows.filter(r => r.ReferenceRange).length === 0 ? (
                                        <p className="text-xs text-gray-500">No ranges added yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {rangesRows.filter(r => r.ReferenceRange).map((r, i) => (
                                                <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-green-800 font-medium">{r.Gender === 'M' ? 'Male' : r.Gender === 'F' ? 'Female' : 'Both'}</div>
                                                    <div className="text-green-900 font-semibold">{r.ReferenceRange}</div>
                                                </div>
                                                    <div className="text-xs text-gray-700 mt-1">Age: {String(r.AgeMin)} {r.AgeMinUnit} {r.AgeMax !== '' && <>- {String(r.AgeMax)} {r.AgeMaxUnit}</>}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <textarea
                                name="referenceRanges"
                                placeholder="Enter reference ranges JSON data (e.g., age-specific ranges, gender-specific ranges)"
                                value={newReferanceRecord.referenceRanges || ""}
                                onChange={handleJsonChange}
                                rows={8}
                                    className={`w-full border p-3 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm font-mono ${
                                    newReferanceRecord.referenceRanges && !validateJson(newReferanceRecord.referenceRanges) 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300'
                                }`}
                            />
                            {newReferanceRecord.referenceRanges && !validateJson(newReferanceRecord.referenceRanges) && (
                                    <p className="text-xs text-red-500 mt-2">Invalid JSON format. Please check your syntax.</p>
                            )}
                            </div>
                    )}
                </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => setNewReferanceRecord({} as TestReferancePoint)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 border border-gray-200 flex items-center gap-2"
                    >
                        <TrashIcon className="h-4 w-4" />
                        Clear
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                        style={{ background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)` }}
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Reference
                    </button>
                </div>
            </form>
            </div>
        </div>
    );
};

export default AddTestReferanceNew;