import React, { useState, useEffect } from "react";
import { TestReferancePoint } from "@/types/test/testlist";
import { PlusIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { X } from "lucide-react";

// Dropdown Editor Component
interface DropdownItem {
    value: string;
    label: string;
}

interface DropdownEditorProps {
    dropdownData: DropdownItem[];
    onUpdate: (items: DropdownItem[]) => void;
    onClose: () => void;
}

const DropdownEditor: React.FC<DropdownEditorProps> = ({ dropdownData, onUpdate, onClose }) => {
    const [items, setItems] = useState<DropdownItem[]>(dropdownData.length > 0 ? dropdownData : [{ value: "", label: "" }]);

    const addItem = () => {
        setItems([...items, { value: "", label: "" }]);
    };

    const updateItem = (index: number, field: "value" | "label", value: string) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        setItems(updated);
    };

    const removeItem = (index: number) => {
        const updated = items.filter((_, i) => i !== index);
        setItems(updated.length > 0 ? updated : [{ value: "", label: "" }]);
    };

    const handleSave = () => {
        const validItems = items.filter(item => item.value.trim() !== "" || item.label.trim() !== "");
        onUpdate(validItems);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div 
                    className="px-6 py-4 border-b border-gray-200"
                    style={{ background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)` }}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Configure Dropdown Values</h3>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                        Add dropdown options. Each option requires a value and label. Value is used internally, label is displayed to users.
                    </p>
                    
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-2 items-start p-3 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Value</label>
                                        <input
                                            type="text"
                                            value={item.value}
                                            onChange={(e) => updateItem(index, "value", e.target.value)}
                                            placeholder="e.g., A+"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Label</label>
                                        <input
                                            type="text"
                                            value={item.label}
                                            onChange={(e) => updateItem(index, "label", e.target.value)}
                                            placeholder="e.g., A Positive"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="mt-6 p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 transition-all duration-200"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Option
                    </button>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200"
                            style={{ background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)` }}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Types for Reference Ranges
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

// Reference Ranges Editor Component
interface ReferenceRangesEditorProps {
    rangesRows: RangeRow[];
    rangesTab: "structured" | "raw";
    onRangesRowsChange: (rows: RangeRow[]) => void;
    onRangesTabChange: (tab: "structured" | "raw") => void;
    onReferenceRangesChange: (jsonString: string | undefined) => void;
    referenceRangesJson: string | undefined;
    onClose: () => void;
}

const ReferenceRangesEditor: React.FC<ReferenceRangesEditorProps> = ({
    rangesRows,
    rangesTab,
    onRangesRowsChange,
    onRangesTabChange,
    onReferenceRangesChange,
    referenceRangesJson,
    onClose
}) => {
    const addRangeRow = () => {
        const newRow: RangeRow = {
            Gender: "MF",
            AgeMin: "",
            AgeMinUnit: "YEARS",
            AgeMax: "",
            AgeMaxUnit: "YEARS",
            ReferenceRange: "",
        };
        onRangesRowsChange([...rangesRows, newRow]);
    };

    const removeRangeRow = (idx: number) => {
        onRangesRowsChange(rangesRows.filter((_, i) => i !== idx));
    };

    const updateRangeRow = <K extends keyof RangeRow>(idx: number, field: K, value: RangeRow[K]) => {
        const updated = rangesRows.map((r, i) => (i === idx ? ({ ...r, [field]: value } as RangeRow) : r));
        onRangesRowsChange(updated);
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onReferenceRangesChange(e.target.value || undefined);
    };

    const validateJson = (jsonString?: string): boolean => {
        if (!jsonString || !jsonString.trim()) return true;
        try { JSON.parse(jsonString); return true; } catch { return false; }
    };

    const handleSave = () => {
        if (rangesTab === 'structured') {
            const filteredRows = rangesRows.filter(r => r.ReferenceRange);
            onReferenceRangesChange(filteredRows.length > 0 ? JSON.stringify(filteredRows) : undefined);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div 
                    className="px-6 py-4 border-b border-gray-200"
                    style={{ background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)` }}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Configure Reference Ranges</h3>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-600">
                            Configure reference ranges for different age groups and genders.
                        </p>
                        <div className="inline-flex rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <button 
                                type="button" 
                                className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 ${rangesTab === 'structured' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} 
                                onClick={() => onRangesTabChange('structured')}
                            >
                                Structured
                            </button>
                            <button 
                                type="button" 
                                className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 ${rangesTab === 'raw' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} 
                                onClick={() => onRangesTabChange('raw')}
                            >
                                Raw
                            </button>
                        </div>
                    </div>

                    {rangesTab === 'structured' ? (
                        <div className="space-y-3">
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
                                                    onChange={(e) => updateRangeRow(idx, "AgeMin", e.target.value === "" ? "" : Number(e.target.value))}
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
                                                    onChange={(e) => updateRangeRow(idx, "AgeMax", e.target.value === "" ? "" : Number(e.target.value))}
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
                                            <input
                                                className="col-span-6 border border-gray-300 rounded p-2 text-xs"
                                                placeholder="e.g., 12.0 - 16.0 g/dL / 4.5 - 11.0 x 10³/μL"
                                                value={row.ReferenceRange}
                                                onChange={(e) => updateRangeRow(idx, "ReferenceRange", e.target.value)}
                                            />
                                            <button type="button" className="col-span-1 text-xs text-red-600 hover:text-red-700" onClick={() => removeRangeRow(idx)}>Remove</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                        <div>
                            <textarea
                                name="referenceRanges"
                                value={referenceRangesJson || ""}
                                onChange={handleJsonChange}
                                rows={8}
                                className={`w-full border p-3 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm font-mono ${
                                    referenceRangesJson && !validateJson(referenceRangesJson) 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300'
                                }`}
                                placeholder="Enter reference ranges JSON data (e.g., age-specific ranges, gender-specific ranges)"
                            />
                            {referenceRangesJson && !validateJson(referenceRangesJson) && (
                                <p className="text-xs text-red-500 mt-2">Invalid JSON format. Please check your syntax.</p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200"
                            style={{ background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)` }}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Import DetailedReportFormEditor and template from AddTestReferanceNew
// We'll need to define these here or import them
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

interface TestAddReferanceProps {
    handleAddExistingReferanceRecord: (e: React.FormEvent) => void;
    handleChangeRef: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    existingTestReferanceRecord: TestReferancePoint;
    setExistingTestReferanceRecord: React.Dispatch<React.SetStateAction<TestReferancePoint>>;
}

const DEFAULT_RANGE_ROW = (): RangeRow => ({
    Gender: "MF",
    AgeMin: "",
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

const isGenderOption = (gender: unknown): gender is GenderOption | "M/F" =>
    gender === "M" || gender === "F" || gender === "MF" || gender === "M/F";

const normalizeRangeRow = (row: Partial<RangeRow>): RangeRow => {
    let gender: GenderOption = "MF";
    const rawGender = row.Gender as unknown;
    if (isGenderOption(rawGender)) {
        gender = (rawGender === "M/F" || rawGender === "MF") ? "MF" : rawGender as GenderOption;
    }
    return {
        Gender: gender,
        AgeMin: normalizeRangeValue(row.AgeMin),
        AgeMinUnit: isAgeUnit(row.AgeMinUnit) ? row.AgeMinUnit : "YEARS",
        AgeMax: normalizeRangeValue(row.AgeMax),
        AgeMaxUnit: isAgeUnit(row.AgeMaxUnit) ? row.AgeMaxUnit : "YEARS",
        ReferenceRange: row.ReferenceRange ?? "",
    };
};

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

const AddExistingTestReferance = ({
    handleAddExistingReferanceRecord,
    handleChangeRef,
    existingTestReferanceRecord,
    setExistingTestReferanceRecord,
}: TestAddReferanceProps) => {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
            if (existingTestReferanceRecord.reportJson && existingTestReferanceRecord.reportJson.trim()) {
                const parsed = JSON.parse(existingTestReferanceRecord.reportJson);
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
        setExistingTestReferanceRecord(prev => ({
            ...prev,
            reportJson: JSON.stringify(updated, null, 2)
        }));
    };

    // Dropdown editor state
    const [isDropdownEditorOpen, setIsDropdownEditorOpen] = useState(false);

    // Reference Ranges editor state
    const [isReferenceRangesEditorOpen, setIsReferenceRangesEditorOpen] = useState(false);
    const [modalRangesRows, setModalRangesRows] = useState<RangeRow[]>([]);
    const [modalRangesTab, setModalRangesTab] = useState<"structured" | "raw">("structured");

    // Parse dropdown JSON or return empty array
    const getDropdownData = (): DropdownItem[] => {
        try {
            const dropdownValue = (existingTestReferanceRecord as TestReferancePoint & { dropdown?: string }).dropdown;
            if (dropdownValue && typeof dropdownValue === 'string' && dropdownValue.trim()) {
                const parsed = JSON.parse(dropdownValue);
                if (Array.isArray(parsed)) {
                    return parsed.filter((item: unknown): item is DropdownItem => 
                        typeof item === 'object' && item !== null && ('value' in item || 'label' in item)
                    );
                }
            }
        } catch (e) {
            // If invalid JSON, return empty array
        }
        return [];
    };

    // Update dropdown JSON
    const updateDropdownJson = (items: DropdownItem[]) => {
        const jsonString = items.length > 0 ? JSON.stringify(items) : undefined;
        setExistingTestReferanceRecord(prev => ({
            ...prev,
            dropdown: jsonString
        } as TestReferancePoint & { dropdown?: string }));
    };

    // Handler to open reference ranges editor and load existing data
    const handleOpenReferenceRangesEditor = () => {
        if (existingTestReferanceRecord.referenceRanges) {
            try {
                const parsed = JSON.parse(existingTestReferanceRecord.referenceRanges as string);
                if (Array.isArray(parsed)) {
                    const normalized = parsed.map((row: unknown) =>
                        normalizeRangeRow(
                            typeof row === "object" && row !== null ? (row as Partial<RangeRow>) : {}
                        )
                    );
                    setModalRangesRows(normalized.length > 0 ? normalized : [DEFAULT_RANGE_ROW()]);
                    setModalRangesTab('structured');
                } else {
                    setModalRangesRows([DEFAULT_RANGE_ROW()]);
                    setModalRangesTab('raw');
                }
            } catch {
                setModalRangesRows([DEFAULT_RANGE_ROW()]);
                setModalRangesTab('raw');
            }
        } else {
            setModalRangesRows([DEFAULT_RANGE_ROW()]);
            setModalRangesTab('structured');
        }
        setIsReferenceRangesEditorOpen(true);
    };

    // Get current reference ranges for preview
    const getCurrentReferenceRanges = (): RangeRow[] => {
        if (!existingTestReferanceRecord.referenceRanges) return [];
        try {
            const parsed = JSON.parse(existingTestReferanceRecord.referenceRanges as string);
            if (Array.isArray(parsed)) {
                return parsed.map((row: unknown) =>
                    normalizeRangeRow(
                        typeof row === "object" && row !== null ? (row as Partial<RangeRow>) : {}
                    )
                ).filter(r => r.ReferenceRange);
            }
        } catch {}
        return [];
    };

    // Custom validation function
    const validateForm = (recordToValidate?: TestReferancePoint) => {
        const record = recordToValidate || existingTestReferanceRecord;
        const errors: Record<string, string> = {};
        const desc = (record.testDescription || "").toUpperCase();

        // Required fields validation
        if (!record.testDescription?.trim()) {
            errors.testDescription = "Test description is required";
        }
        if (!record.gender) {
            errors.gender = "Gender selection is required";
        }
        // Allow ageMin to be 0, only check for undefined/null
        if (record.ageMin === undefined || record.ageMin === null) {
            errors.ageMin = "Minimum age is required";
        }

        // Skip units and range validation for DETAILED REPORT and DROPDOWN types
        if (desc !== "DETAILED REPORT" && !desc.startsWith("DROPDOWN")) {
            if (!record.units?.trim()) {
                errors.units = "Units are required";
            }
            // Allow minReferenceRange to be 0, only check for undefined/null
            if (record.minReferenceRange === undefined || record.minReferenceRange === null) {
                errors.minReferenceRange = "Minimum reference range is required";
            }
            if (record.maxReferenceRange === undefined || record.maxReferenceRange === null) {
                errors.maxReferenceRange = "Maximum reference range is required";
            }
        }

        // For DETAILED REPORT, validate reportJson is present
        if (desc === "DETAILED REPORT") {
            if (!record.reportJson || !record.reportJson.trim()) {
                errors.reportJson = "Report JSON is required for DETAILED REPORT";
            } else {
                try {
                    JSON.parse(record.reportJson);
                } catch (e) {
                    errors.reportJson = "Report JSON must be valid JSON";
                }
            }
        }

        // Age validation - allow 0 as valid value
        if (record.ageMin !== undefined && record.ageMin !== null && record.ageMin < 0) {
            errors.ageMin = "Minimum age cannot be negative";
        }
        if (record.ageMax !== undefined && record.ageMax !== null && record.ageMax < 0) {
            errors.ageMax = "Maximum age cannot be negative";
        }
        // Convert to numbers for proper comparison
        const ageMinNum = typeof record.ageMin === 'string' 
            ? parseFloat(record.ageMin) 
            : record.ageMin;
        const ageMaxNum = typeof record.ageMax === 'string' 
            ? parseFloat(record.ageMax) 
            : record.ageMax;
        if (ageMinNum !== undefined && ageMinNum !== null && ageMaxNum !== undefined && ageMaxNum !== null && 
            !isNaN(ageMinNum) && !isNaN(ageMaxNum) && ageMinNum >= ageMaxNum) {
            errors.ageMax = "Maximum age must be greater than minimum age";
        }

        // Range validation - convert to numbers for proper comparison
        // Skip range validation for DETAILED REPORT and DROPDOWN types
        if (desc !== "DETAILED REPORT" && !desc.startsWith("DROPDOWN")) {
            const minRangeNum = typeof record.minReferenceRange === 'string' 
                ? parseFloat(record.minReferenceRange) 
                : record.minReferenceRange;
            const maxRangeNum = typeof record.maxReferenceRange === 'string' 
                ? parseFloat(record.maxReferenceRange) 
                : record.maxReferenceRange;
            
            if (minRangeNum !== undefined && minRangeNum !== null && maxRangeNum !== undefined && maxRangeNum !== null && 
                !isNaN(minRangeNum) && !isNaN(maxRangeNum)) {
                if (minRangeNum < 0) {
                    errors.minReferenceRange = "Minimum reference range cannot be negative";
                }
                if (maxRangeNum < 0) {
                    errors.maxReferenceRange = "Maximum reference range cannot be negative";
                }
                // Check if max is greater than min (allowing equal values might be needed, but typically max should be > min)
                if (maxRangeNum <= minRangeNum) {
                    errors.maxReferenceRange = "Maximum range must be greater than minimum range";
                }
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Custom form submission handler
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Set default values for age units if they are undefined
        const recordWithDefaults = {
            ...existingTestReferanceRecord,
            minAgeUnit: existingTestReferanceRecord.minAgeUnit || "YEARS",
            maxAgeUnit: existingTestReferanceRecord.maxAgeUnit || "YEARS",
        };
        
        // Update state with defaults
        setExistingTestReferanceRecord(recordWithDefaults);
        
        // Validate with the record that has defaults
        const isValid = validateForm(recordWithDefaults);
        
        if (isValid) {
            // Ensure defaults are set before calling parent handler
            handleAddExistingReferanceRecord(e);
        } else {
            // Show detailed validation errors
            const errorMessages = Object.entries(validationErrors)
                .filter(([, message]) => message)
                .map(([field, message]) => {
                    // Convert field name to readable format
                    const fieldName = field
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .trim();
                    return `${fieldName}: ${message}`;
                });
            
            if (errorMessages.length > 0) {
                // Show first error in toast, and all errors in console
                toast.error(`Validation Error: ${errorMessages[0]}`, {
                    autoClose: 5000,
                });
                
                // If multiple errors, show additional toast after a delay
                if (errorMessages.length > 1) {
                    setTimeout(() => {
                        toast.warning(`${errorMessages.length - 1} more error(s). Please check all fields.`, {
                            autoClose: 4000,
                        });
                    }, 500);
                }
                
                // Log all errors to console for debugging
                console.error('Validation Errors:', validationErrors);
            } else {
                toast.error("Please fix the validation errors before submitting");
            }
            
            // Scroll to first error field
            const firstErrorField = Object.keys(validationErrors)[0];
            if (firstErrorField) {
                const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    (errorElement as HTMLElement).focus();
                }
            }
        }
    };

    // Custom handler for description field to ensure uppercase
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const uppercaseValue = value.toUpperCase();
        setExistingTestReferanceRecord(prev => {
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
        
        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Custom handler for age fields to prevent negative values and values > 100
    const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = parseFloat(value);
        
        // Prevent negative values and values greater than 100
        if (value === "" || (numericValue >= 0 && numericValue <= 100)) {
            setExistingTestReferanceRecord(prev => ({
                ...prev,
                [name]: value === "" ? "" : numericValue
            }));
            
            // Clear validation error when user starts typing
            if (validationErrors[name]) {
                setValidationErrors(prev => ({
                    ...prev,
                    [name]: ""
                }));
            }
        }
    };

    // Wrapper for handleChangeRef to clear validation errors
    const handleChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        handleChangeRef(e);
        
        // Clear validation error when user starts typing
        const fieldName = e.target.name;
        if (validationErrors[fieldName]) {
            setValidationErrors(prev => ({
                ...prev,
                [fieldName]: ""
            }));
        }
    };

    // Custom handler for gender to convert "B" to "MF"
    const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value === "B" ? "MF" : e.target.value;
        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                name: e.target.name,
                value: value
            }
        } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
        handleChangeWithValidation(syntheticEvent);
    };


    // Set default values for age units if they are undefined (only once)
    useEffect(() => {
        const needsUpdate = 
            (existingTestReferanceRecord.minAgeUnit === undefined || existingTestReferanceRecord.minAgeUnit === null || existingTestReferanceRecord.minAgeUnit === "") ||
            (existingTestReferanceRecord.maxAgeUnit === undefined || existingTestReferanceRecord.maxAgeUnit === null || existingTestReferanceRecord.maxAgeUnit === "");
        
        if (needsUpdate) {
            setExistingTestReferanceRecord(prev => ({
                ...prev,
                minAgeUnit: prev.minAgeUnit || "YEARS",
                maxAgeUnit: prev.maxAgeUnit || "YEARS"
            }));
        }
    }, [existingTestReferanceRecord.minAgeUnit, existingTestReferanceRecord.maxAgeUnit, setExistingTestReferanceRecord]); // Set defaults when age units are undefined

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-6 text-gray-900">Add Existing Test Reference</h2>

            <div className="space-y-4">
                {/* Selected Test Preview - Test Information (Green) */}
                {existingTestReferanceRecord?.testName && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <h4 className="font-semibold text-green-800 mb-2">Test Information</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="font-medium text-gray-600">Test Name:</span>
                                <span className="ml-2 text-gray-900">{existingTestReferanceRecord?.testName}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">Category:</span>
                                <span className="ml-2 text-gray-900">{existingTestReferanceRecord?.category}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Validation Errors Summary - Warning (Yellow) */}
                {Object.keys(validationErrors).length > 0 && Object.values(validationErrors).some(msg => msg) && (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                            Please fix the following {Object.values(validationErrors).filter(msg => msg).length} error(s):
                        </h4>
                        <ul className="space-y-1">
                            {Object.entries(validationErrors)
                                .filter(([, message]) => message)
                                .map(([field, message]) => {
                                    const fieldName = field
                                        .replace(/([A-Z])/g, ' $1')
                                        .replace(/^./, str => str.toUpperCase())
                                        .trim();
                                    return (
                                        <li key={field} className="text-xs text-gray-700 flex items-start gap-2">
                                            <span className="text-yellow-600 mt-1">•</span>
                                            <span>
                                                <strong className="font-medium text-gray-900">{fieldName}:</strong> {message}
                                            </span>
                                        </li>
                                    );
                                })}
                        </ul>
                    </div>
                )}

                {/* Form Section */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    {/* Test Reference Description Section - Purple */}
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                        <h4 className="font-semibold text-purple-800 mb-2">Test Reference Description</h4>
                        <div className="flex flex-col">
                            <input
                                type="text"
                                name="testDescription"
                                list="existingTestDescriptionOptions"
                                placeholder="Type or select test description (will be converted to uppercase)"
                                value={existingTestReferanceRecord.testDescription || ""}
                                onChange={handleDescriptionChange}
                                className={`w-full bg-white border px-3 py-2 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm ${validationErrors.testDescription ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                            />
                            {validationErrors.testDescription && (
                                <p className="text-xs text-red-500 mt-1">{validationErrors.testDescription}</p>
                            )}
                            <datalist id="existingTestDescriptionOptions">
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
                            <p className="text-xs text-gray-500 mt-1">Type custom description or select from suggestions</p>
                        </div>
                    </div>

                    {/* Basic Information Section - Blue */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <h4 className="font-semibold text-blue-800 mb-2">Basic Information</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col">
                                <label className="font-medium text-gray-600 mb-1 text-sm">Gender</label>
                                <select
                                    name="gender"
                                    value={existingTestReferanceRecord.gender === "MF" ? "B" : (existingTestReferanceRecord.gender || "")}
                                    onChange={handleGenderChange}
                                    className={`w-full bg-white border px-3 py-2 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${validationErrors.gender ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="" disabled>Select Gender</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="B">Both</option>
                                </select>
                                {validationErrors.gender && (
                                    <p className="text-xs text-red-500 mt-1">{validationErrors.gender}</p>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label className="font-medium text-gray-600 mb-1 text-sm">Units</label>
                                <input
                                    type="text"
                                    name="units"
                                    placeholder="Units"
                                    value={existingTestReferanceRecord.units || ""}
                                    onChange={handleChangeWithValidation}
                                    className={`w-full bg-white border px-3 py-2 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${validationErrors.units ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                                />
                                {validationErrors.units && (
                                    <p className="text-xs text-red-500 mt-1">{validationErrors.units}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dropdown Configuration Section - Optional */}
                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h4 className="font-semibold text-indigo-800">Dropdown Options (Optional)</h4>
                                <p className="text-xs text-gray-600 mt-1">Configure dropdown values for this test reference</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDropdownEditorOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200"
                                style={{ background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)` }}
                            >
                                <PlusIcon className="h-4 w-4" />
                                {getDropdownData().length > 0 ? 'Edit Options' : 'Add Options'}
                            </button>
                        </div>
                        {getDropdownData().length > 0 && (
                            <div className="mt-3 bg-white rounded-lg border border-gray-200 p-3">
                                <div className="text-xs text-gray-600 mb-2 font-medium">Current Options:</div>
                                <div className="flex flex-wrap gap-2">
                                    {getDropdownData().map((item, index) => (
                                        <div
                                            key={index}
                                            className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs font-medium"
                                        >
                                            {item.label || item.value}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Age Range Section - Orange */}
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                        <h4 className="font-semibold text-orange-800 mb-2">Age Range</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col">
                                <label className="font-medium text-gray-600 mb-1 text-sm">Min Age</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        name="ageMin"
                                        min={0}
                                        max={100}
                                        placeholder="Minimum Age"
                                        value={existingTestReferanceRecord.ageMin || ""}
                                        onChange={handleAgeChange}
                                        className={`flex-1 bg-white border px-3 py-2 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm ${validationErrors.ageMin ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                                    />
                                    <select
                                        name="minAgeUnit"
                                        value={existingTestReferanceRecord.minAgeUnit || "YEARS"}
                                        onChange={handleChangeWithValidation}
                                        className="w-32 bg-white border border-gray-300 px-3 py-2 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                    >
                                        <option value="YEARS">Years</option>
                                        <option value="MONTHS">Months</option>
                                        <option value="WEEKS">Weeks</option>
                                        <option value="DAYS">Days</option>
                                    </select>
                                </div>
                                {validationErrors.ageMin && (
                                    <p className="text-xs text-red-500 mt-1">{validationErrors.ageMin}</p>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label className="font-medium text-gray-600 mb-1 text-sm">Max Age</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        name="ageMax"
                                        min={0}
                                        max={100}
                                        placeholder="Maximum Age"
                                        value={existingTestReferanceRecord.ageMax || ""}
                                        onChange={handleAgeChange}
                                        className={`flex-1 bg-white border px-3 py-2 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm ${validationErrors.ageMax ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                                    />
                                    <select
                                        name="maxAgeUnit"
                                        value={existingTestReferanceRecord.maxAgeUnit || "YEARS"}
                                        onChange={handleChangeWithValidation}
                                        className="w-32 bg-white border border-gray-300 px-3 py-2 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                    >
                                        <option value="YEARS">Years</option>
                                        <option value="MONTHS">Months</option>
                                        <option value="WEEKS">Weeks</option>
                                        <option value="DAYS">Days</option>
                                    </select>
                                </div>
                                {validationErrors.ageMax && (
                                    <p className="text-xs text-red-500 mt-1">{validationErrors.ageMax}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reference Range Section - Green (Hidden for special types) */}
                    {!shouldHideRanges(existingTestReferanceRecord.testDescription) && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                            <h4 className="font-semibold text-green-800 mb-2">Reference Range</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col">
                                    <label className="font-medium text-gray-600 mb-1 text-sm">Min Range</label>
                                    <input
                                        type="number"
                                        name="minReferenceRange"
                                        placeholder="Minimum Range"
                                        min={0}
                                        value={existingTestReferanceRecord.minReferenceRange || ""}
                                        onChange={handleChangeWithValidation}
                                        className={`w-full bg-white border px-3 py-2 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm ${validationErrors.minReferenceRange ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                                    />
                                    {validationErrors.minReferenceRange && (
                                        <p className="text-xs text-red-500 mt-1">{validationErrors.minReferenceRange}</p>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="font-medium text-gray-600 mb-1 text-sm">Max Range</label>
                                    <input
                                        type="number"
                                        name="maxReferenceRange"
                                        placeholder="Maximum Range"
                                        min={0}
                                        value={existingTestReferanceRecord.maxReferenceRange || ""}
                                        onChange={handleChangeWithValidation}
                                        className={`w-full bg-white border px-3 py-2 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm ${validationErrors.maxReferenceRange ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                                    />
                                    {validationErrors.maxReferenceRange && (
                                        <p className="text-xs text-red-500 mt-1">{validationErrors.maxReferenceRange}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Report Content Editor / Report JSON - Only for DETAILED REPORT */}
                    {existingTestReferanceRecord.testDescription === "DETAILED REPORT" && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-2">Detailed Report Configuration</h4>
                            <DetailedReportFormEditor
                                reportData={getDetailedReportData()}
                                onUpdate={updateDetailedReportJson}
                            />
                            {validationErrors.reportJson && (
                                <p className="text-xs text-red-500 mt-1">{validationErrors.reportJson}</p>
                            )}
                        </div>
                    )}

                    {/* Reference Ranges Section - Orange (hidden for DETAILED REPORT and all DROPDOWN types) */}
                    {!shouldHideRanges(existingTestReferanceRecord.testDescription) && (
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold text-orange-800">Reference Ranges (Optional)</h4>
                                    <p className="text-xs text-gray-600 mt-1">Configure reference ranges for this test reference</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleOpenReferenceRangesEditor}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200"
                                    style={{ background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)` }}
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    {getCurrentReferenceRanges().length > 0 ? 'Edit Ranges' : 'Add Ranges'}
                                </button>
                            </div>
                            {getCurrentReferenceRanges().length > 0 && (
                                <div className="mt-3 bg-white rounded-lg border border-gray-200 p-3">
                                    <div className="text-xs text-gray-600 mb-2 font-medium">Current Ranges:</div>
                                    <div className="space-y-2">
                                        {getCurrentReferenceRanges().map((r, i) => (
                                            <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-green-800 font-medium">{r.Gender === 'M' ? 'Male' : r.Gender === 'F' ? 'Female' : 'Both'}</div>
                                                    <div className="text-green-900 font-semibold">{r.ReferenceRange}</div>
                                                </div>
                                                <div className="text-xs text-gray-700 mt-1">Age: {String(r.AgeMin)} {r.AgeMinUnit} {r.AgeMax !== '' && <>- {String(r.AgeMax)} {r.AgeMaxUnit}</>}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            style={{ background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)` }}
                        >
                            <PlusIcon className="h-4 w-4 mr-1.5" />
                            <span>Add Reference</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Dropdown Editor Modal */}
            {isDropdownEditorOpen && (
                <DropdownEditor
                    dropdownData={getDropdownData()}
                    onUpdate={updateDropdownJson}
                    onClose={() => setIsDropdownEditorOpen(false)}
                />
            )}

            {/* Reference Ranges Editor Modal */}
            {isReferenceRangesEditorOpen && (
                <ReferenceRangesEditor
                    rangesRows={modalRangesRows}
                    rangesTab={modalRangesTab}
                    onRangesRowsChange={(rows) => {
                        setModalRangesRows(rows);
                    }}
                    onRangesTabChange={(tab) => {
                        setModalRangesTab(tab);
                        if (tab === 'raw' && existingTestReferanceRecord.referenceRanges) {
                            // Keep the raw JSON when switching to raw tab
                        } else if (tab === 'structured') {
                            // When switching to structured, parse and update rows
                            if (existingTestReferanceRecord.referenceRanges) {
                                try {
                                    const parsed = JSON.parse(existingTestReferanceRecord.referenceRanges as string);
                                    if (Array.isArray(parsed)) {
                                        const normalized = parsed.map((row: unknown) =>
                                            normalizeRangeRow(
                                                typeof row === "object" && row !== null ? (row as Partial<RangeRow>) : {}
                                            )
                                        );
                                        setModalRangesRows(normalized.length > 0 ? normalized : [DEFAULT_RANGE_ROW()]);
                                    }
                                } catch {
                                    setModalRangesRows([DEFAULT_RANGE_ROW()]);
                                }
                            }
                        }
                    }}
                    onReferenceRangesChange={(jsonString) => {
                        setExistingTestReferanceRecord(prev => ({ ...prev, referenceRanges: jsonString } as TestReferancePoint));
                        if (jsonString && modalRangesTab === 'raw') {
                            // When raw JSON is updated, try to parse and update rows
                            try {
                                const parsed = JSON.parse(jsonString);
                                if (Array.isArray(parsed)) {
                                    const normalized = parsed.map((row: unknown) =>
                                        normalizeRangeRow(
                                            typeof row === "object" && row !== null ? (row as Partial<RangeRow>) : {}
                                        )
                                    );
                                    setModalRangesRows(normalized.length > 0 ? normalized : [DEFAULT_RANGE_ROW()]);
                                }
                            } catch {}
                        }
                    }}
                    referenceRangesJson={existingTestReferanceRecord.referenceRanges}
                    onClose={() => setIsReferenceRangesEditorOpen(false)}
                />
            )}
        </div>
    );
};

export default AddExistingTestReferance;