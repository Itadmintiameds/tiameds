import { TestReferancePoint } from "@/types/test/testlist";
import { PlusIcon } from "@heroicons/react/24/outline";
import React, { useState, useEffect, useCallback } from "react";
import DetailedReportTiptapEditor from "@/components/ui/detailed-report-tiptap-editor";
import { formatMedicalReportToHTML } from "@/utils/reportFormatter";
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

interface ReportSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'table' | 'list';
  order: number;
}

interface ReportData {
  title: string;
  description: string;
  sections: ReportSection[];
  metadata?: {
    author?: string;
    date?: string;
    version?: string;
  };
}

interface TestEditReferanceProps {
    editRecord: TestReferancePoint | null;
    setEditRecord: React.Dispatch<React.SetStateAction<TestReferancePoint | null>>;
    setEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleUpdate: (e: React.FormEvent) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    formData: TestReferancePoint;
    setFormData: React.Dispatch<React.SetStateAction<TestReferancePoint>>;
}

const TestEditReferance = ({ editRecord, setEditRecord, handleUpdate, handleChange, formData, setFormData }: TestEditReferanceProps) => {
    const hasEditRecord = Boolean(editRecord);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // List of testDescription values that require special handling
    const specialTestDescriptions = [
        "DESCRIPTION",
        "DROPDOWN",
        "DROPDOWN-POSITIVE/NEGATIVE",
        "DROPDOWN-PRESENT/ABSENT",
        "DROPDOWN-REACTIVE/NONREACTIVE",
        "DROPDOWN-PERCENTAGE",
        "DROPDOWN-COMPATIBLE/INCOMPATIBLE",
        "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE",
        "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT",
        "DETAILED REPORT"
    ];

    // Helper function to check if testDescription requires special handling
    const isSpecialTestDescription = (testDescription?: string): boolean => {
        if (!testDescription) return false;
        return specialTestDescriptions.includes(testDescription.toUpperCase().trim());
    };

    // Check if current formData has special testDescription
    const hasSpecialTestDescription = isSpecialTestDescription(formData.testDescription);
    const isDetailedReport = formData.testDescription?.toUpperCase().trim() === "DETAILED REPORT";

    // Custom validation function
    const validateForm = (recordToValidate?: TestReferancePoint) => {
        const record = recordToValidate || formData;
        const errors: Record<string, string> = {};
        const isSpecial = isSpecialTestDescription(record.testDescription);

        // Required fields validation
        if (!record.testDescription?.trim()) {
            errors.testDescription = "Test description is required";
        }
        // Units field is optional for special test descriptions
        if (!isSpecial && !record.units?.trim()) {
            errors.units = "Units are required";
        }
        if (!record.gender) {
            errors.gender = "Gender selection is required";
        }
        // Allow ageMin to be 0, only check for undefined/null
        if (record.ageMin === undefined || record.ageMin === null) {
            errors.ageMin = "Minimum age is required";
        }
        // Reference ranges are optional for all test descriptions

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

        // Range validation - convert to numbers for proper comparison (only for non-special test descriptions)
        if (!isSpecial) {
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
                // Check if max is greater than min
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
            ...formData,
            minAgeUnit: formData.minAgeUnit || "YEARS",
            maxAgeUnit: formData.maxAgeUnit || "YEARS",
        };
        
        // Update state with defaults
        setFormData(recordWithDefaults);
        
        // Validate with the record that has defaults
        const isValid = validateForm(recordWithDefaults);
        
        if (isValid) {
            // Ensure defaults are set before calling parent handler
            handleUpdate(e);
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

    // Custom handler for age fields to prevent negative values and values > 100
    const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = parseFloat(value);
        
        // Prevent negative values and values greater than 100
        if (value === "" || (numericValue >= 0 && numericValue <= 100)) {
            setFormData(prev => ({
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

    // Wrapper for handleChange to clear validation errors
    const handleChangeWithValidation = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        handleChange(e);
        
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


    // Dropdown editor state
    const [isDropdownEditorOpen, setIsDropdownEditorOpen] = useState(false);

    // Reference Ranges editor state
    const [isReferenceRangesEditorOpen, setIsReferenceRangesEditorOpen] = useState(false);
    const [modalRangesRows, setModalRangesRows] = useState<RangeRow[]>([]);
    const [modalRangesTab, setModalRangesTab] = useState<"structured" | "raw">("structured");

    // Parse dropdown JSON or return empty array
    const getDropdownData = (): DropdownItem[] => {
        try {
            const dropdownValue = (formData as TestReferancePoint & { dropdown?: string }).dropdown;
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
        setFormData(prev => ({
            ...prev,
            dropdown: jsonString
        } as TestReferancePoint & { dropdown?: string }));
    };

    // Handler to open reference ranges editor and load existing data
    const handleOpenReferenceRangesEditor = () => {
        if (formData.referenceRanges) {
            try {
                const parsed = JSON.parse(formData.referenceRanges as string);
                if (Array.isArray(parsed)) {
                    const normalized = parsed.map((row: unknown) =>
                        normalizeRangeRow(
                            typeof row === "object" && row !== null ? (row as Partial<RangeRow>) : {}
                        )
                    );
                    setModalRangesRows(normalized.length > 0 ? normalized : [getInitialRangeRow()]);
                    setModalRangesTab('structured');
                } else {
                    setModalRangesRows([getInitialRangeRow()]);
                    setModalRangesTab('raw');
                }
            } catch {
                setModalRangesRows([getInitialRangeRow()]);
                setModalRangesTab('raw');
            }
        } else {
            setModalRangesRows([getInitialRangeRow()]);
            setModalRangesTab('structured');
        }
        setIsReferenceRangesEditorOpen(true);
    };

    // Get current reference ranges for preview
    const getCurrentReferenceRanges = (): RangeRow[] => {
        if (!formData.referenceRanges) return [];
        try {
            const parsed = JSON.parse(formData.referenceRanges as string);
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
    
    // Structured report editor state
    const [reportData, setReportData] = useState<ReportData>({
        title: '',
        description: '',
        sections: [],
        metadata: {
            author: '',
            date: new Date().toISOString().split('T')[0],
            version: '1.0'
        }
    });
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [editingSection, setEditingSection] = useState<ReportSection | null>(null);
    const [isNewSection, setIsNewSection] = useState<boolean>(false);

    // Initialize report data from JSON
    useEffect(() => {
        if (formData.reportJson) {
            try {
                const parsed = JSON.parse(formData.reportJson);
                // Check if it's already a structured report or raw data
                if (parsed.title && parsed.sections) {
                    setReportData(parsed);
                } else {
                    // Convert raw data to structured format using the formatter
                    const formattedContent = formatMedicalReportToHTML(formData.reportJson);
                    setReportData({
                        title: formData.testName || 'Test Report',
                        description: parsed.description || '',
                        sections: [{
                            id: '1',
                            title: 'Formatted Report',
                            content: formattedContent || '<p>No report data available. Please add content using the editor.</p>',
                            type: 'text',
                            order: 1
                        }],
                        metadata: {
                            author: '',
                            date: new Date().toISOString().split('T')[0],
                            version: '1.0'
                        }
                    });
                }
            } catch (error) {
                // Initialize with default structure
                setReportData({
                    title: formData.testName || 'Test Report',
                    description: '',
                    sections: [],
                    metadata: {
                        author: '',
                        date: new Date().toISOString().split('T')[0],
                        version: '1.0'
                    }
                });
            }
        } else {
            // Initialize with default structure
            setReportData({
                title: formData.testName || 'Test Report',
                description: '',
                sections: [],
                metadata: {
                    author: '',
                    date: new Date().toISOString().split('T')[0],
                    version: '1.0'
                }
            });
        }
    }, [formData.reportJson, formData.testName]);

    const handleReportDataChange = (updatedData: ReportData) => {
        setReportData(updatedData);
        const jsonString = JSON.stringify(updatedData, null, 2);
        setFormData(prev => ({ ...prev, reportJson: jsonString } as TestReferancePoint));
    };

    const startInlineEdit = (section: ReportSection) => {
        setEditingSectionId(section.id);
        setEditingSection(section);
    };

    const cancelInlineEdit = () => {
        setEditingSectionId(null);
        setEditingSection(null);
        setIsNewSection(false);
    };

    const saveInlineEdit = () => {
        if (editingSection) {
            if (isNewSection) {
                // Add new section
                const updatedData = {
                    ...reportData,
                    sections: [...reportData.sections, editingSection]
                };
                handleReportDataChange(updatedData);
                setIsNewSection(false);
            } else {
                // Update existing section
                const updatedSections = reportData.sections.map(s =>
                    s.id === editingSection.id ? editingSection : s
                );
                const updatedData = { ...reportData, sections: updatedSections };
                handleReportDataChange(updatedData);
            }
        }
        setEditingSectionId(null);
        setEditingSection(null);
    };

    const removeSection = (sectionId: string) => {
        const updatedSections = reportData.sections
            .filter(section => section.id !== sectionId)
            .map((section, index) => ({ ...section, order: index + 1 }));
        const updatedData = { ...reportData, sections: updatedSections };
        handleReportDataChange(updatedData);
    };

    const moveSection = (sectionId: string, direction: 'up' | 'down') => {
        const sections = [...reportData.sections];
        const currentIndex = sections.findIndex(s => s.id === sectionId);

        if (direction === 'up' && currentIndex > 0) {
            [sections[currentIndex], sections[currentIndex - 1]] = [sections[currentIndex - 1], sections[currentIndex]];
        } else if (direction === 'down' && currentIndex < sections.length - 1) {
            [sections[currentIndex], sections[currentIndex + 1]] = [sections[currentIndex + 1], sections[currentIndex]];
        }

        // Update order numbers
        const updatedSections = sections.map((section, index) => ({ ...section, order: index + 1 }));
        const updatedData = { ...reportData, sections: updatedSections };
        handleReportDataChange(updatedData);
    };

    // Structured report editor replaces the old JSON editor

    const normalizeRangeValue = (value: unknown): number | "" => {
        if (value === "" || value === null || value === undefined) return "";
        const numeric = Number(value);
        return Number.isNaN(numeric) ? "" : numeric;
    };

    const isAgeUnit = useCallback((unit: unknown): unit is AgeUnit =>
        unit === "YEARS" || unit === "MONTHS" || unit === "WEEKS" || unit === "DAYS", []);

    const isGenderOption = useCallback((gender: unknown): gender is GenderOption | "M/F" =>
        gender === "M" || gender === "F" || gender === "MF" || gender === "M/F", []);

    const normalizeRangeRow = useCallback((row: Partial<RangeRow>): RangeRow => {
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
    }, [isAgeUnit, isGenderOption]);

    const getInitialRangeRow = useCallback((): RangeRow => normalizeRangeRow({
        Gender: "MF",
        AgeMin: "",
        AgeMinUnit: "YEARS",
        AgeMax: "",
        AgeMaxUnit: "YEARS",
        ReferenceRange: "",
    }), [normalizeRangeRow]);


    // Set default values for age units if they are undefined (only once)
    useEffect(() => {
        const needsUpdate = 
            (formData.minAgeUnit === undefined || formData.minAgeUnit === null || formData.minAgeUnit === "") ||
            (formData.maxAgeUnit === undefined || formData.maxAgeUnit === null || formData.maxAgeUnit === "");
        
        if (needsUpdate) {
            setFormData(prev => ({
                ...prev,
                minAgeUnit: prev.minAgeUnit || "YEARS",
                maxAgeUnit: prev.maxAgeUnit || "YEARS"
            }));
        }
    }, [formData.minAgeUnit, formData.maxAgeUnit, setFormData]); // Set defaults when age units are undefined

    if (!hasEditRecord) {
        return null;
    }
    
    return (
        <div className="p-4 bg-white rounded-lg">
            {/* Header with subtle accent */}
            <div className="mb-4 pb-3 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-blue-700 flex items-center">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
                    {formData.testName}
                </h2>
                <p className="text-xs text-gray-500 mt-1 pl-4.5">
                    Category: {formData.category}
                </p>
            </div>

            {/* Validation Errors Summary */}
            {Object.keys(validationErrors).length > 0 && Object.values(validationErrors).some(msg => msg) && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-red-800 mb-2">
                                Please fix the following {Object.values(validationErrors).filter(msg => msg).length} error(s):
                            </h3>
                            <ul className="space-y-1">
                                {Object.entries(validationErrors)
                                    .filter(([, message]) => message)
                                    .map(([field, message]) => {
                                        const fieldName = field
                                            .replace(/([A-Z])/g, ' $1')
                                            .replace(/^./, str => str.toUpperCase())
                                            .trim();
                                        return (
                                            <li key={field} className="text-sm text-red-700 flex items-start gap-2">
                                                <span className="text-red-500 mt-1">•</span>
                                                <span>
                                                    <strong className="font-medium">{fieldName}:</strong> {message}
                                                </span>
                                            </li>
                                        );
                                    })}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Test Information Section - Green */}
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <h4 className="font-semibold text-green-800 mb-2">Test Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
                            <input
                                type="text"
                                name="testDescription"
                                list="editTestDescriptionOptions"
                                value={formData.testDescription.toLocaleUpperCase()}
                                onChange={handleChangeWithValidation}
                                className={`w-full px-2.5 py-2 text-xs bg-white border rounded-md focus:ring-1 focus:ring-green-300 transition-all ${validationErrors.testDescription ? 'border-red-300 focus:ring-red-300' : 'border-gray-300'}`}
                                placeholder="Type or select test description"
                            />
                            {validationErrors.testDescription && (
                                <p className="text-xs text-red-500 mt-1">{validationErrors.testDescription}</p>
                            )}
                            <datalist id="editTestDescriptionOptions">
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
                        </div>
                    </div>
                </div>

                {/* Reference Range Information Section - Blue */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-800 mb-2">Reference Range Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Gender */}
                        <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender === "MF" ? "B" : formData.gender}
                                onChange={handleGenderChange}
                                className={`w-full px-2.5 py-2 text-xs bg-white border rounded-md focus:ring-1 focus:ring-blue-300 transition-all ${validationErrors.gender ? 'border-red-300 focus:ring-red-300' : 'border-gray-300'}`}
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="B">Both</option>
                            </select>
                            {validationErrors.gender && (
                                <p className="text-xs text-red-500 mt-1">{validationErrors.gender}</p>
                            )}
                        </div>

                        {/* Units */}
                        <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Units</label>
                            <input
                                type="text"
                                name="units"
                                value={formData.units}
                                onChange={handleChangeWithValidation}
                                className={`w-full px-2.5 py-2 text-xs bg-white border rounded-md focus:ring-1 focus:ring-blue-300 transition-all ${validationErrors.units ? 'border-red-300 focus:ring-red-300' : 'border-gray-300'}`}
                                placeholder="Measurement units"
                            />
                            {validationErrors.units && (
                                <p className="text-xs text-red-500 mt-1">{validationErrors.units}</p>
                            )}
                        </div>

                        {/* Min Age with Unit */}
                        <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Min Age</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="ageMin"
                                    value={formData.ageMin}
                                    onChange={handleAgeChange}
                                    className={`w-full px-2.5 py-2 text-xs bg-white border rounded-md focus:ring-1 focus:ring-blue-300 transition-all ${validationErrors.ageMin ? 'border-red-300 focus:ring-red-300' : 'border-gray-300'}`}
                                    min={0}
                                    max={100}
                                />
                                <select
                                    name="minAgeUnit"
                                    value={formData.minAgeUnit || "YEARS"}
                                    onChange={handleChangeWithValidation}
                                    className="w-full px-2.5 py-2 text-xs bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300 transition-all"
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

                        {/* Max Age with Unit */}
                        <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">Max Age</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="ageMax"
                                    min={0}
                                    max={100}
                                    value={formData.ageMax}
                                    onChange={handleAgeChange}
                                    className={`w-full px-2.5 py-2 text-xs bg-white border rounded-md focus:ring-1 focus:ring-blue-300 transition-all ${validationErrors.ageMax ? 'border-red-300 focus:ring-red-300' : 'border-gray-300'}`}
                                />
                                <select
                                    name="maxAgeUnit"
                                    value={formData.maxAgeUnit || "YEARS"}
                                    onChange={handleChangeWithValidation}
                                    className="w-full px-2.5 py-2 text-xs bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300 transition-all"
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

                        {/* Reference Range - Hidden for special test descriptions */}
                        {!hasSpecialTestDescription && (
                            <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">Min Range</label>
                                    <input
                                        type="number"
                                        name="minReferenceRange"
                                        min={0}
                                        value={formData.minReferenceRange}
                                        onChange={handleChangeWithValidation}
                                        className={`w-full px-2.5 py-2 text-xs bg-white border rounded-md focus:ring-1 focus:ring-blue-300 transition-all ${validationErrors.minReferenceRange ? 'border-red-300 focus:ring-red-300' : 'border-gray-300'}`}
                                        step="0.01"
                                    />
                                    {validationErrors.minReferenceRange && (
                                        <p className="text-xs text-red-500 mt-1">{validationErrors.minReferenceRange}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">Max Range</label>
                                    <input
                                        type="number"
                                        name="maxReferenceRange"
                                        min={0}
                                        value={formData.maxReferenceRange}
                                        onChange={handleChangeWithValidation}
                                        className={`w-full px-2.5 py-2 text-xs bg-white border rounded-md focus:ring-1 focus:ring-blue-300 transition-all ${validationErrors.maxReferenceRange ? 'border-red-300 focus:ring-red-300' : 'border-gray-300'}`}
                                        step="0.01"
                                    />
                                    {validationErrors.maxReferenceRange && (
                                        <p className="text-xs text-red-500 mt-1">{validationErrors.maxReferenceRange}</p>
                                    )}
                                </div>
                            </div>
                        )}
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

                {/* Report Content Section - Purple (Show only for DETAILED REPORT) */}
                {isDetailedReport && (
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                        <h4 className="font-semibold text-purple-800 mb-2">Report Content</h4>
                        <div className="bg-white w-full rounded-lg border border-gray-200">
                            <div className="p-2 w-full">
                            <div className="space-y-4 w-full">
                                {/* Report Sections */}
                                <div className="space-y-4 w-full">

                                    {reportData.sections.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm">No sections added yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {reportData.sections
                                                .sort((a, b) => a.order - b.order)
                                                .map((section, index) => (
                                                    <div key={section.id} className="border border-gray-200 rounded-lg bg-white shadow-sm w-full">
                                                        {/* Section Header */}
                                                        <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg w-full">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded border">
                                                                    {section.order}
                                                                </span>
                                                                <h4 className="text-lg font-semibold text-gray-900">{section.title}</h4>
                                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                                    {section.type}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {editingSectionId === section.id ? (
                                                                    <>
                                                                        <button
                                                                            onClick={saveInlineEdit}
                                                                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                                                                            title="Save changes"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        </button>
                                                                        <button
                                                                            onClick={cancelInlineEdit}
                                                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                                                            title="Cancel editing"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => startInlineEdit(section)}
                                                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                                                        title="Edit section"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => moveSection(section.id, 'up')}
                                                                    disabled={index === 0}
                                                                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 transition-colors"
                                                                    title="Move up"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => moveSection(section.id, 'down')}
                                                                    disabled={index === reportData.sections.length - 1}
                                                                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 transition-colors"
                                                                    title="Move down"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => removeSection(section.id)}
                                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                    title="Delete section"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Section Content */}
                                                        <div className="p-2 w-full">
                                                            {editingSectionId === section.id ? (
                                                                <div className="w-full">
                                                                    <DetailedReportTiptapEditor
                                                                        value={editingSection?.content || ''}
                                                                        onChange={(value) => setEditingSection(prev => prev ? { ...prev, content: value } : null)}
                                                                        height="300px"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {section.content && section.content.trim() && !section.content.includes('Click here to start editing') ? (
                                                                        <div
                                                                            className="report-html prose prose-sm max-w-none w-full prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700"
                                                                            dangerouslySetInnerHTML={{ __html: section.content }}
                                                                        />
                                                                    ) : (
                                                                        <div className="text-gray-400 italic text-sm bg-gray-50 p-4 rounded border-2 border-dashed border-gray-200">
                                                                            <div className="flex items-center gap-2">
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                </svg>
                                                                                No content added yet. Click edit to add content.
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                )}

                {/* Reference Ranges Section - Orange (Hidden for special test descriptions) */}
                {!hasSpecialTestDescription && (
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
                        type="button"
                        onClick={() => setEditRecord(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 border border-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center"
                        style={{ background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)` }}
                    >
                        <PlusIcon className="w-4 h-4 mr-1.5" />
                        Save
                    </button>
                </div>
            </form>

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
                        if (tab === 'raw' && formData.referenceRanges) {
                            // Keep the raw JSON when switching to raw tab
                        } else if (tab === 'structured') {
                            // When switching to structured, parse and update rows
                            if (formData.referenceRanges) {
                                try {
                                    const parsed = JSON.parse(formData.referenceRanges as string);
                                    if (Array.isArray(parsed)) {
                                        const normalized = parsed.map((row: unknown) =>
                                            normalizeRangeRow(
                                                typeof row === "object" && row !== null ? (row as Partial<RangeRow>) : {}
                                            )
                                        );
                                        setModalRangesRows(normalized.length > 0 ? normalized : [getInitialRangeRow()]);
                                    }
                                } catch {
                                    setModalRangesRows([getInitialRangeRow()]);
                                }
                            }
                        }
                    }}
                    onReferenceRangesChange={(jsonString) => {
                        setFormData(prev => ({ ...prev, referenceRanges: jsonString } as TestReferancePoint));
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
                                    setModalRangesRows(normalized.length > 0 ? normalized : [getInitialRangeRow()]);
                                }
                            } catch {}
                        }
                    }}
                    referenceRangesJson={formData.referenceRanges}
                    onClose={() => setIsReferenceRangesEditorOpen(false)}
                />
            )}
        </div>
    );
};

export default TestEditReferance;