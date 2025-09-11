import { TestReferancePoint } from "@/types/test/testlist";
import { PlusIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "lucide-react";
import React from "react";
import Button from "../common/Button";

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
    if (!editRecord) return null;

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
        }
    };
    
    return (
        <div className="p-4 bg-white rounded-lg">
            {/* Header with subtle accent */}
            <div className="mb-4 pb-3 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
                    {formData.testName}
                </h2>
                <p className="text-xs text-gray-500 mt-1 pl-4.5">
                    Category: {formData.category}
                </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Description */}
                    <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
                        <input
                            type="text"
                            name="testDescription"
                            list="editTestDescriptionOptions"
                            value={formData.testDescription.toLocaleUpperCase()}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                            placeholder="Type or select test description"
                        />
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
                        </datalist>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                        >
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            {/* <option value="O">Unisex</option> */}
                        </select>
                    </div>

                    {/* Units */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">Units</label>
                        <input
                            type="text"
                            name="units"
                            value={formData.units}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                            placeholder="Measurement units"
                        />
                    </div>

                    {/* Min Age with Unit */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">Min Age</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                name="ageMin"
                                value={formData.ageMin}
                                onChange={handleAgeChange}
                                className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                                min={0}
                                max={100}
                            />
                            <select
                                name="minAgeUnit"
                                value={formData.minAgeUnit || "YEARS"}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                            >
                                <option value="YEARS">Years</option>
                                <option value="MONTHS">Months</option>
                                <option value="WEEKS">Weeks</option>
                                <option value="DAYS">Days</option>
                            </select>
                        </div>
                    </div>

                    {/* Max Age with Unit */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">Max Age</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                name="ageMax"
                                min={0}
                                max={100}
                                value={formData.ageMax}
                                onChange={handleAgeChange}
                                className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                            />
                            <select
                                name="maxAgeUnit"
                                value={formData.maxAgeUnit || "YEARS"}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                            >
                                <option value="YEARS">Years</option>
                                <option value="MONTHS">Months</option>
                                <option value="WEEKS">Weeks</option>
                                <option value="DAYS">Days</option>
                            </select>
                        </div>
                    </div>

                    {/* Reference Range */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">Min Range</label>
                            <input
                                type="number"
                                name="minReferenceRange"
                                min={0}
                                // max={100}
                                value={formData.minReferenceRange}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">Max Range</label>
                            <input
                                type="number"
                                name="maxReferenceRange"
                                min={0}
                                value={formData.maxReferenceRange}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Compact */}
                <div className="flex justify-end gap-2 pt-3">
                    <Button
                        text="Cancel"
                        onClick={() => setEditRecord(null)}
                        className="text-xs px-3 py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center"
                    >
                        <TrashIcon className="w-3.5 h-3.5 mr-1.5" />
                    </Button>
                    <Button
                        text="Save"
                        onClick={() => {}}
                        type="submit"
                        className="text-xs px-3 py-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors flex items-center"
                    >
                        <PlusIcon className="w-3.5 h-3.5 mr-1.5" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default TestEditReferance;