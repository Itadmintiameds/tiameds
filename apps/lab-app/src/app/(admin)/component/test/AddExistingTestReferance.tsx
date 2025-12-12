import React, { useState, useEffect, useCallback } from "react";
import { TestReferancePoint } from "@/types/test/testlist";
import Button from "../common/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import RichTextEditor from "@/components/ui/rich-text-editor";

interface TestAddReferanceProps {
    handleAddExistingReferanceRecord: (e: React.FormEvent) => void;
    handleChangeRef: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    existingTestReferanceRecord: TestReferancePoint;
    setExistingTestReferanceRecord: React.Dispatch<React.SetStateAction<TestReferancePoint>>;
}

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

const AddExistingTestReferance = ({
    handleAddExistingReferanceRecord,
    handleChangeRef,
    existingTestReferanceRecord,
    setExistingTestReferanceRecord,
}: TestAddReferanceProps) => {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Custom validation function
    const validateForm = (recordToValidate?: TestReferancePoint) => {
        const record = recordToValidate || existingTestReferanceRecord;
        const errors: Record<string, string> = {};

        // Required fields validation
        if (!record.testDescription?.trim()) {
            errors.testDescription = "Test description is required";
        }
        if (!record.units?.trim()) {
            errors.units = "Units are required";
        }
        if (!record.gender) {
            errors.gender = "Gender selection is required";
        }
        // Allow ageMin to be 0, only check for undefined/null
        if (record.ageMin === undefined || record.ageMin === null) {
            errors.ageMin = "Minimum age is required";
        }
        // Allow minReferenceRange to be 0, only check for undefined/null
        if (record.minReferenceRange === undefined || record.minReferenceRange === null) {
            errors.minReferenceRange = "Minimum reference range is required";
        }
        if (record.maxReferenceRange === undefined || record.maxReferenceRange === null) {
            errors.maxReferenceRange = "Maximum reference range is required";
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
        setExistingTestReferanceRecord(prev => ({
            ...prev,
            [name]: value.toUpperCase()
        }));
        
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

    // Removed raw JSON textarea handler; structured builder and rich editor are used instead

    const [rangesRows, setRangesRows] = useState<RangeRow[]>([DEFAULT_RANGE_ROW()]);

    // Helpers: Reference ranges builder
    const addRangeRow = () => setRangesRows(prev => [...prev, DEFAULT_RANGE_ROW()]);
    const removeRangeRow = (idx: number) => setRangesRows(prev => prev.filter((_, i) => i !== idx));
    const updateRangeRow = <K extends keyof RangeRow>(idx: number, field: K, value: RangeRow[K]) =>
        setRangesRows(prev =>
            prev.map((r, i) => (i === idx ? ({ ...r, [field]: value } as RangeRow) : r))
        );

    const loadRangesFromJson = useCallback(() => {
        if (!existingTestReferanceRecord.referenceRanges) return;
        try {
            const parsed = JSON.parse(existingTestReferanceRecord.referenceRanges as string);
            if (Array.isArray(parsed)) {
                const normalized = parsed.map((row: unknown) =>
                    normalizeRangeRow(
                        typeof row === "object" && row !== null ? (row as Partial<RangeRow>) : {}
                    )
                );
                setRangesRows(normalized.length ? normalized : [DEFAULT_RANGE_ROW()]);
            }
        } catch {}
    }, [existingTestReferanceRecord.referenceRanges]);

    useEffect(() => {
        if (existingTestReferanceRecord.referenceRanges) {
            loadRangesFromJson();
        }
    }, [existingTestReferanceRecord.referenceRanges, loadRangesFromJson]);

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
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-blue-700">Add Existing Test Reference</h2>

            {/* Selected Test Preview */}
            {existingTestReferanceRecord?.testName && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100 text-sm">
                    <div className="flex justify-between items-center">
                    <div>
                            <div className="font-medium">{existingTestReferanceRecord?.testName}</div>
                            <div className="text-xs text-blue-600">{existingTestReferanceRecord?.category}</div>
                        </div>
                    </div>
                        </div>
            )}

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

            {/* Form Section */}
            <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col col-span-2">
                    <label className="text-gray-700 mb-1">Test Reference Description</label>
                        <input
                            type="text"
                            name="testDescription"
                            list="existingTestDescriptionOptions"
                        placeholder="Type or select test description (will be converted to uppercase)"
                            value={existingTestReferanceRecord.testDescription || ""}
                        onChange={handleDescriptionChange}
                        className={`w-full bg-white border px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500 uppercase-input ${validationErrors.testDescription ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                        />
                        {validationErrors.testDescription && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.testDescription}</p>
                        )}
                        <datalist id="existingTestDescriptionOptions">
                            <option value="DESCRIPTION">Description</option>
                            <option value="DROPDOWN">Dropdown</option>
                            <option value="DETAILED REPORT">DETAILED REPORT</option>
                            <option value="DROPDOWN-POSITIVE/NEGATIVE">Dropdown - Positive/Negative</option>
                            <option value="DROPDOWN-PRESENT/ABSENT">Dropdown - Present/Absent</option>
                            <option value="DROPDOWN-REACTIVE/NONREACTIVE">Dropdown - Reactive/Nonreactive</option>
                            <option value="DROPDOWN-PERCENTAGE">Dropdown - Percentage</option>
                            <option value="DROPDOWN-COMPATIBLE/INCOMPATIBLE">Dropdown - Compatible/Incompatible</option>
                            <option value="DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE">Dropdown with Description - Reactive/Nonreactive</option>
                            <option value="DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT">Dropdown with Description - Present/Absent</option>
                        </datalist>
                    <p className="text-xs text-gray-500 mt-1">Type custom description or select from suggestions</p>
                    </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Gender</label>
                        <select
                            name="gender"
                            value={existingTestReferanceRecord.gender === "MF" ? "B" : (existingTestReferanceRecord.gender || "")}
                            onChange={handleGenderChange}
                        className={`w-full bg-white border px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500 ${validationErrors.gender ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                        >
                        <option value="" disabled selected>Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="B">Both</option>
                        </select>
                        {validationErrors.gender && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.gender}</p>
                        )}
                    </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Units</label>
                    <input
                        type="text"
                        name="units"
                        placeholder="Units"
                        value={existingTestReferanceRecord.units || ""}
                        onChange={handleChangeWithValidation}
                        className={`w-full bg-white border px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500 ${validationErrors.units ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                    />
                    {validationErrors.units && (
                        <p className="text-xs text-red-500 mt-1">{validationErrors.units}</p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Min Age</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                name="ageMin"
                                min={0}
                                max={100}
                            placeholder="Minimum Age"
                                value={existingTestReferanceRecord.ageMin || ""}
                                onChange={handleAgeChange}
                            className={`w-full bg-white border px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500 ${validationErrors.ageMin ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                            />
                            <select
                                name="minAgeUnit"
                                value={existingTestReferanceRecord.minAgeUnit || "YEARS"}
                                onChange={handleChangeWithValidation}
                            className="w-full bg-white border px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500"
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
                    <label className="text-gray-700 mb-1">Max Age</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                name="ageMax"
                                min={0}
                                max={100}
                            placeholder="Maximum Age"
                                value={existingTestReferanceRecord.ageMax || ""}
                                onChange={handleAgeChange}
                            className={`w-full bg-white border px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500 ${validationErrors.ageMax ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                            />
                            <select
                                name="maxAgeUnit"
                                value={existingTestReferanceRecord.maxAgeUnit || "YEARS"}
                                onChange={handleChangeWithValidation}
                            className="w-full bg-white border px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500"
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

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Min Range</label>
                    <input
                        type="number"
                        name="minReferenceRange"
                        placeholder="Minimum Range"
                        min={0}
                        value={existingTestReferanceRecord.minReferenceRange || ""}
                        onChange={handleChangeWithValidation}
                        className={`w-full bg-white border px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500 ${validationErrors.minReferenceRange ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                    />
                    {validationErrors.minReferenceRange && (
                        <p className="text-xs text-red-500 mt-1">{validationErrors.minReferenceRange}</p>
                    )}
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Max Range</label>
                            <input
                                type="number"
                        name="maxReferenceRange"
                        placeholder="Maximum Range"
                                 min={0}
                        value={existingTestReferanceRecord.maxReferenceRange || ""}
                                onChange={handleChangeWithValidation}
                        className={`w-full bg-white border px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500 ${validationErrors.maxReferenceRange ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                    />
                    {validationErrors.maxReferenceRange && (
                        <p className="text-xs text-red-500 mt-1">{validationErrors.maxReferenceRange}</p>
                    )}
                </div>

                {/* Report Content Editor */}
                <div className="flex flex-col col-span-2 mb-3">
                    <label className="text-gray-700 mb-1">Report Content (Optional)</label>
                                                                    <RichTextEditor
                            value={existingTestReferanceRecord.reportJson || ''}
                            onChange={(value) => {
                                setExistingTestReferanceRecord(prev => ({ ...prev, reportJson: value }));
                            }}
                            placeholder="Test Name: ULTRASOUND WHOLE ABDOMEN

Note: Fasting for at least 6 hours prior to scan.

Impression:
Mild fatty infiltration of liver. No focal hepatic lesions. Other abdominal organs appear normal.

Findings:

Liver:
- Size: Normal
- Echotexture: Mildly increased (Grade I fatty change)
- Intrahepatic biliary radicals: Not dilated
- No focal lesions seen

Gall Bladder:
- Normal in size and wall thickness
- No calculi or sludge
- Common bile duct: Normal caliber (4 mm)

Pancreas:
- Normal size and echotexture
- No focal mass or ductal dilatation

Spleen:
- Normal in size (10.5 cm)
- Homogeneous echotexture

Kidneys:
Right kidney: 10.8 cm, normal cortical echotexture, no hydronephrosis
Left kidney: 10.6 cm, normal cortical echotexture, no hydronephrosis

Urinary Bladder:
- Well distended, normal wall thickness
- No intraluminal mass or calculus

Prostate (in males):
- Normal size and echotexture (Volume: 18 cc)

Uterus & Ovaries (in females):
- Uterus anteverted, normal size and myometrial echotexture
- Endometrial thickness: 8 mm
- Ovaries normal in size and follicular pattern

Additional Observations:
- No free fluid in abdomen or pelvis
- Bowel loops appear normal

Impression Summary:
Mild fatty liver. Rest of the abdominal organs appear within normal limits."
                            height="280px"
                        />
                    <p className="text-xs text-gray-600 mt-1">
                        Use the rich text editor to format your report content with headings, lists, and other formatting options.
                    </p>
                </div>

                {/* Reference Ranges Field */}
                <div className="flex flex-col col-span-2 mt-1">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-gray-700">Reference Ranges JSON (Optional)</label>
                    </div>

                    {
                        <div className="space-y-2 border border-gray-200 rounded-md p-3">
                            <div className="flex items-center justify-between">
                                <h5 className="text-sm font-semibold text-blue-700">Reference Ranges Builder</h5>
                                <span className="text-[11px] text-gray-500">Use rows per age/gender</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Ranges</span>
                                <div className="flex gap-2">
                                    <Button type="button" text="Add Row" onClick={addRangeRow} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-200 border border-gray-300 text-xs" />
                                    {/* <Button type="button" text="Load from JSON" onClick={loadRangesFromJson} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-200 border border-gray-300 text-xs" />
                                    <Button type="button" text="Apply to JSON" onClick={applyRangesToJson} className="bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 text-xs" /> */}
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
                                                <select className="border border-gray-300 rounded p-2 text-xs" value={row.AgeMinUnit} onChange={(e) => updateRangeRow(idx, "AgeMinUnit", e.target.value as AgeUnit)}>
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
                                                <select className="border border-gray-300 rounded p-2 text-xs" value={row.AgeMaxUnit} onChange={(e) => updateRangeRow(idx, "AgeMaxUnit", e.target.value as AgeUnit)}>
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
                            <div className="border-t border-gray-200 pt-3">
                                <h6 className="text-xs font-semibold text-blue-700 mb-2">Live Preview</h6>
                                {rangesRows.filter(r => r.ReferenceRange).length === 0 ? (
                                    <p className="text-[11px] text-gray-500">No ranges added yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {rangesRows.filter(r => r.ReferenceRange).map((r, i) => (
                                            <div key={i} className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-green-800 font-medium">{r.Gender === 'M' ? 'Male' : r.Gender === 'F' ? 'Female' : 'Both'}</div>
                                                    <div className="text-green-900 font-semibold">{r.ReferenceRange}</div>
                                                </div>
                                                <div className="text-[12px] text-gray-700 mt-1">Age: {String(r.AgeMin)} {r.AgeMinUnit} {r.AgeMax !== '' && <>- {String(r.AgeMax)} {r.AgeMaxUnit}</>}</div>
                        </div>
                    ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                </div>

                {/* Action Buttons */}
                <div className="col-span-2 flex justify-end gap-2 mt-4">
                    {/* <Button
                        text="Clear"
                        type="button"
                        onClick={() => setExistingTestReferanceRecord({} as TestReferancePoint)}
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 border border-gray-300 text-sm"
                    >
                        <TrashIcon />
                    </Button> */}
                    <Button
                        text="Add Reference"
                        type="submit"
                        onClick={() => { }}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddExistingTestReferance;