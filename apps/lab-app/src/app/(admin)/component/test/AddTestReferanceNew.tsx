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
import { useEffect, useState } from "react";
import { getTests } from "../../../../../services/testService";
import { toast } from "react-toastify";
import { TestList } from "@/types/test/testlist";
import Loader from "../common/Loader";

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
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Add Test Reference</h2>

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
            <form onSubmit={handleAddNewReferanceRecord} className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col col-span-2">
                    <label className="text-gray-700 mb-1">Test Reference Description</label>
                    <input
                        type="text"
                        name="testDescription"
                        list="testDescriptionOptions"
                        placeholder="Type or select test description (will be converted to uppercase)"
                        value={newReferanceRecord?.testDescription || ""}
                        onChange={handleDescriptionChange}
                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500 uppercase-input"
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
                        value={newReferanceRecord?.gender || ""}
                        onChange={handleChangeRef}
                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="" disabled selected>Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        {/* <option value="U">Unspecified</option> */}
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
                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
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
                            className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
                        />
                        <select
                            name="minAgeUnit"
                            value={newReferanceRecord.minAgeUnit || "YEARS"}
                            onChange={handleAgeUnitChange}
                            className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
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
                            className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
                        />
                        <select
                            name="maxAgeUnit"
                            value={newReferanceRecord.maxAgeUnit || "YEARS"}
                            onChange={handleAgeUnitChange}
                            className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
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
                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
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
                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                {/* Action Buttons */}
                <div className="col-span-2 flex justify-end gap-2 mt-4">
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