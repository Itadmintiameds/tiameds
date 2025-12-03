import { z } from "zod";

export const testReferancePointSchema = z.object({
  id: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  testName: z.string().min(1, "Test name is required"),
  testDescription: z.string().min(1, "Test description is required"),
  units: z.string().min(1, "Units are required"),
  gender: z.string().min(1, "Gender is required"),
  minReferenceRange: z.number().min(0, "Minimum reference range must be 0 or greater"),
  maxReferenceRange: z.number().min(0, "Maximum reference range must be 0 or greater"),
  ageMin: z.number().min(0, "Minimum age must be 0 or greater").max(100, "Minimum age must be 100 or less"),
  ageMax: z.number().min(0, "Maximum age must be 0 or greater").max(100, "Maximum age must be 100 or less").optional(),
  minAgeUnit: z.string().default("YEARS").optional(),
  maxAgeUnit: z.string().default("YEARS").optional(),
  reportJson: z.string().optional(),
  referenceRanges: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

import { TestReferancePoint } from "@/types/test/testlist";
import { TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "lucide-react";
import React from "react";
import Button from "../common/Button";
import { useLabs } from "@/context/LabContext";
import { useEffect, useState, useCallback } from "react";
import { getTests } from "../../../../../services/testService";
import { toast } from "react-toastify";
import { TestList } from "@/types/test/testlist";
import Loader from "../common/Loader";
import RichTextEditor from "@/components/ui/rich-text-editor";

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
        setNewReferanceRecord(prev => ({
            ...prev,
            [name]: uppercaseValue
        }));
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
  }, [newReferanceRecord.referenceRanges]);

  useEffect(() => {
      if (newReferanceRecord.referenceRanges) {
          loadRangesFromJson();
      }
  }, [newReferanceRecord.referenceRanges, loadRangesFromJson]);

  if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader type="progress" fullScreen={false} text="Loading tests..." />
                <p className="mt-4 text-sm text-gray-500">Fetching test data, please wait...</p>
            </div>
        )
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-blue-700">Add Test Reference</h2>

            {/* Search and Filter */}
            <div className="mb-4 space-y-2">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>

                <div className="flex flex-wrap gap-1.5">
                    <button
                        onClick={() => setSelectedCategory("")}
                        className={`px-3 py-1 text-xs rounded-md font-medium ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        All
                    </button>
                    {categories?.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1 text-xs rounded-md font-medium whitespace-nowrap ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Test Selection */}
            {filteredTests?.length > 0 && (
                <div className="mb-4 max-h-48 overflow-y-auto border border-gray-200 rounded-md text-sm">
                    {filteredTests.map(test => (
                        <div
                            key={test.id}
                            onClick={() => handleTestSelect(test)}
                            className={`p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${newReferanceRecord.testName === test.name ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}
                        >
                            <div className="font-medium">{test?.name}</div>
                            <div className="text-xs text-blue-600">{test?.category}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Selected Test Preview */}
            {newReferanceRecord?.testName && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100 text-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="font-medium">{newReferanceRecord?.testName}</div>
                            <div className="text-xs text-blue-600">{newReferanceRecord?.category}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Section */}
            <form onSubmit={handleAddNewReferanceRecord} className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col col-span-2">
                    <label className="text-gray-700 mb-1">Test Reference Description</label>
                    <input
                        type="text"
                        name="testDescription"
                        list="testDescriptionOptions"
                        placeholder="Type or select test description (will be converted to uppercase)"
                        value={newReferanceRecord?.testDescription || ""}
                        onChange={handleDescriptionChange}
                        className="w-full bg-white border border-gray-300 px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500 uppercase-input"
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
                    </datalist>
                    <p className="text-xs text-gray-500 mt-1">Type custom description or select from suggestions</p>
                </div>
                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Gender</label>
                    <select
                        name="gender"
                        value={newReferanceRecord?.gender === "MF" ? "B" : (newReferanceRecord?.gender || "")}
                        onChange={handleGenderChange}
                        className="w-full bg-white border border-gray-300 px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="" disabled selected>Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="B">Both</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Units</label>
                    <input
                        type="text"
                        name="units"
                        placeholder="Units"
                        value={newReferanceRecord.units || ""}
                        onChange={handleChangeRef}
                        className="w-full bg-white border border-gray-300 px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
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
                            value={newReferanceRecord.ageMin || ""}
                            onChange={handleAgeChange}
                            className="w-full bg-white border border-gray-300 px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500"
                        />
                        <select
                            name="minAgeUnit"
                            value={newReferanceRecord.minAgeUnit || "YEARS"}
                            onChange={handleAgeUnitChange}
                            className="w-full bg-white border border-gray-300 px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="YEARS">Years</option>
                            <option value="MONTHS">Months</option>
                            <option value="WEEKS">Weeks</option>
                            <option value="DAYS">Days</option>
                        </select>
                    </div>
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
                            value={newReferanceRecord.ageMax || ""}
                            onChange={handleAgeChange}
                            className="w-full bg-white border border-gray-300 px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500"
                        />
                        <select
                            name="maxAgeUnit"
                            value={newReferanceRecord.maxAgeUnit || "YEARS"}
                            onChange={handleAgeUnitChange}
                            className="w-full bg-white border border-gray-300 px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="YEARS">Years</option>
                            <option value="MONTHS">Months</option>
                            <option value="WEEKS">Weeks</option>
                            <option value="DAYS">Days</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Min Range</label>
                    <input
                        type="number"
                        name="minReferenceRange"
                        placeholder="Minimum Range"
                        min={0}
                        value={newReferanceRecord.minReferenceRange || ""}
                        onChange={handleChangeRef}
                        className="w-full bg-white border border-gray-300 px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Max Range</label>
                    <input
                        type="number"
                        name="maxReferenceRange"
                        placeholder="Maximum Range"
                         min={0}
                        value={newReferanceRecord.maxReferenceRange || ""}
                        onChange={handleChangeRef}
                        className="w-full bg-white border border-gray-300 px-2.5 py-2 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                {/* Report Content Editor */}
                <div className="flex flex-col col-span-2 mb-3">
                    <label className="text-gray-700 mb-1">Report Content (Optional)</label>
                    <RichTextEditor
                        value={newReferanceRecord.reportJson || ''}
                        onChange={(value) => {
                            setNewReferanceRecord(prev => ({ ...prev, reportJson: value }));
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

                {/* Reference Ranges Field - Structured/Raw */}
                <div className="flex flex-col col-span-2 mt-1">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-gray-700">Reference Ranges JSON (Optional)</label>
                        <div className="inline-flex rounded-md overflow-hidden border border-gray-200">
                            <button type="button" className={`px-3 py-1 text-xs ${rangesTab === 'structured' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`} onClick={() => setRangesTab('structured')}>Structured</button>
                            <button type="button" className={`px-3 py-1 text-xs ${rangesTab === 'raw' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`} onClick={() => setRangesTab('raw')}>Raw</button>
                        </div>
                    </div>

                    {rangesTab === 'structured' ? (
                        <div className="space-y-2 border border-gray-200 rounded-md p-3">
                            <div className="flex items-center justify-between">
                                <h5 className="text-sm font-semibold text-blue-700">Reference Ranges Builder</h5>
                                <span className="text-[11px] text-gray-500">Use rows per age/gender</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Ranges</span>
                                <div className="flex gap-2">
                                    <Button type="button" text="Add Row" onClick={addRangeRow} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-200 border border-gray-300 text-xs" />
                                    <Button type="button" text="Load from JSON" onClick={loadRangesFromJson} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-200 border border-gray-300 text-xs" />
                                    <Button type="button" text="Apply to JSON" onClick={applyRangesToJson} className="bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 text-xs" />
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
                    ) : (
                        <>
                            <textarea
                                name="referenceRanges"
                                placeholder="Enter reference ranges JSON data (e.g., age-specific ranges, gender-specific ranges)"
                                value={newReferanceRecord.referenceRanges || ""}
                                onChange={handleJsonChange}
                                rows={8}
                                className={`w-full border p-2 rounded-md focus:ring-1 focus:ring-blue-500 text-sm font-mono ${
                                    newReferanceRecord.referenceRanges && !validateJson(newReferanceRecord.referenceRanges) 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-gray-300'
                                }`}
                            />
                            {newReferanceRecord.referenceRanges && !validateJson(newReferanceRecord.referenceRanges) && (
                                <p className="text-xs text-red-500 mt-1">Invalid JSON format. Please check your syntax.</p>
                            )}
                        </>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="col-span-2 flex justify-end gap-2 mt-3">
                    <Button
                        text="Clear"
                        type="button"
                        onClick={() => setNewReferanceRecord({} as TestReferancePoint)}
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 border border-gray-300 text-sm"
                    >
                        <TrashIcon />
                    </Button>
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

export default AddTestReferanceNew;