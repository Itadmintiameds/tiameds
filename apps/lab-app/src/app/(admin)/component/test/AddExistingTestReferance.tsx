import React, { useState, useEffect, useCallback } from "react";
import { TestReferancePoint } from "@/types/test/testlist";
import Button from "../common/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "lucide-react";
import { toast } from "react-toastify";
import RichTextEditor from "@/components/ui/rich-text-editor";

interface TestAddReferanceProps {
    handleAddExistingReferanceRecord: (e: React.FormEvent) => void;
    handleChangeRef: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    existingTestReferanceRecord: TestReferancePoint;
    setExistingTestReferanceRecord: React.Dispatch<React.SetStateAction<TestReferancePoint>>;
}

const AddExistingTestReferance = ({
    handleAddExistingReferanceRecord,
    handleChangeRef,
    existingTestReferanceRecord,
    setExistingTestReferanceRecord,
}: TestAddReferanceProps) => {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Custom validation function
    const validateForm = () => {
        const errors: Record<string, string> = {};

        // Required fields validation
        if (!existingTestReferanceRecord.testDescription?.trim()) {
            errors.testDescription = "Test description is required";
        }
        if (!existingTestReferanceRecord.units?.trim()) {
            errors.units = "Units are required";
        }
        if (!existingTestReferanceRecord.gender) {
            errors.gender = "Gender selection is required";
        }
        if (existingTestReferanceRecord.ageMin === undefined || existingTestReferanceRecord.ageMin === null) {
            errors.ageMin = "Minimum age is required";
        }
        if (existingTestReferanceRecord.minReferenceRange === undefined || existingTestReferanceRecord.minReferenceRange === null) {
            errors.minReferenceRange = "Minimum reference range is required";
        }
        if (existingTestReferanceRecord.maxReferenceRange === undefined || existingTestReferanceRecord.maxReferenceRange === null) {
            errors.maxReferenceRange = "Maximum reference range is required";
        }

        // Age validation
        if (existingTestReferanceRecord.ageMin !== undefined && existingTestReferanceRecord.ageMin < 0) {
            errors.ageMin = "Minimum age cannot be negative";
        }
        if (existingTestReferanceRecord.ageMax !== undefined && existingTestReferanceRecord.ageMax < 0) {
            errors.ageMax = "Maximum age cannot be negative";
        }
        if (existingTestReferanceRecord.ageMin !== undefined && existingTestReferanceRecord.ageMax !== undefined && 
            existingTestReferanceRecord.ageMin > existingTestReferanceRecord.ageMax) {
            errors.ageMax = "Maximum age must be greater than minimum age";
        }

        // Range validation
        if (existingTestReferanceRecord.minReferenceRange !== undefined && existingTestReferanceRecord.maxReferenceRange !== undefined && 
            existingTestReferanceRecord.minReferenceRange > existingTestReferanceRecord.maxReferenceRange) {
            errors.maxReferenceRange = "Maximum range must be greater than minimum range";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Custom form submission handler
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateForm()) {
            handleAddExistingReferanceRecord(e);
        } else {
            toast.error("Please fix the validation errors before submitting");
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
        }
    };

    // Removed raw JSON textarea handler; structured builder and rich editor are used instead

    // JSON validation function
    const validateJson = (jsonString: string): boolean => {
        if (!jsonString.trim()) return true; // Empty is valid (optional field)
        try {
            JSON.parse(jsonString);
            return true;
        } catch {
            return false;
        }
    };

    // Single mode: structured builder only (raw toggle removed)

    type KeyValue = { key: string; value: string };
    type ParameterRow = { key: string; unit?: string; value?: string; normal_range?: string };

    const [rangesRows, setRangesRows] = useState<Array<{
        Gender: string;
        AgeMin: number | string;
        AgeMinUnit: string;
        AgeMax: number | string;
        AgeMaxUnit: string;
        ReferenceRange: string;
    }>>([
        { Gender: "MF", AgeMin: 0, AgeMinUnit: "YEARS", AgeMax: "", AgeMaxUnit: "YEARS", ReferenceRange: "" }
    ]);


    useEffect(() => {
        if (existingTestReferanceRecord.referenceRanges) {
            loadRangesFromJson();
        }
    }, [existingTestReferanceRecord.referenceRanges]);


    // Helpers: Reference ranges builder
    const addRangeRow = () => setRangesRows(prev => [...prev, { Gender: "MF", AgeMin: 0, AgeMinUnit: "YEARS", AgeMax: "", AgeMaxUnit: "YEARS", ReferenceRange: "" }]);
    const removeRangeRow = (idx: number) => setRangesRows(prev => prev.filter((_, i) => i !== idx));
    const updateRangeRow = (idx: number, field: string, value: string) => setRangesRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));

    const applyRangesToJson = () => {
        const rows = rangesRows.filter(r => r.ReferenceRange);
        setExistingTestReferanceRecord(prev => ({ ...prev, referenceRanges: JSON.stringify(rows) }));
    };

    const loadRangesFromJson = useCallback(() => {
        if (!existingTestReferanceRecord.referenceRanges) return;
        try {
            const parsed = JSON.parse(existingTestReferanceRecord.referenceRanges as string);
            if (Array.isArray(parsed)) setRangesRows(parsed);
        } catch {}
    }, [existingTestReferanceRecord.referenceRanges]);

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
                            value={existingTestReferanceRecord.gender || ""}
                            onChange={handleChangeRef}
                        className={`w-full bg-white border px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500 ${validationErrors.gender ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                        >
                        <option value="" disabled selected>Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
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
                        onChange={handleChangeRef}
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
                                onChange={handleChangeRef}
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
                                onChange={handleChangeRef}
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
                        onChange={handleChangeRef}
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
                                onChange={handleChangeRef}
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
                                            <select className="col-span-1 border border-gray-300 rounded p-2 text-xs" value={row.Gender} onChange={(e) => updateRangeRow(idx, 'Gender', e.target.value)}>
                                                <option value="M">Male</option>
                                                <option value="F">Female</option>
                                                <option value="MF">Both</option>
                                            </select>
                                            <div className="col-span-2 grid grid-cols-2 gap-2">
                                                <input className="border border-gray-300 rounded p-2 text-xs" type="number" min={0} value={row.AgeMin as any} onChange={(e) => updateRangeRow(idx, 'AgeMin', e.target.value)} placeholder="0" />
                                                <select className="border border-gray-300 rounded p-2 text-xs" value={row.AgeMinUnit} onChange={(e) => updateRangeRow(idx, 'AgeMinUnit', e.target.value)}>
                                                    <option value="YEARS">YEARS</option>
                                                    <option value="MONTHS">MONTHS</option>
                                                    <option value="WEEKS">WEEKS</option>
                                                    <option value="DAYS">DAYS</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 grid grid-cols-2 gap-2">
                                                <input className="border border-gray-300 rounded p-2 text-xs" type="number" min={0} value={row.AgeMax as any} onChange={(e) => updateRangeRow(idx, 'AgeMax', e.target.value)} placeholder="" />
                                                <select className="border border-gray-300 rounded p-2 text-xs" value={row.AgeMaxUnit} onChange={(e) => updateRangeRow(idx, 'AgeMaxUnit', e.target.value)}>
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