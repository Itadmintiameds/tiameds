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

const TestEditReferance = ({ editRecord, setEditRecord, handleUpdate, handleChange, formData }: TestEditReferanceProps) => {
    if (!editRecord) return null;
    
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
                            value={formData.testDescription}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                            placeholder="Test description"
                        />
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
                            <option value="O">Unisex</option>
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
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                                min={0}
                            />
                            <select
                                name="minAgeUnit"
                                value={formData.minAgeUnit || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                            >
                                <option value="" disabled>Unit</option>
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
                                min="0"
                                // max={formData.ageMin || 100} // Ensure max age is not less than min age
                                max={100} // Assuming a max age limit of 100 for simplicity
                                value={formData.ageMax}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                            />
                            <select
                                name="maxAgeUnit"
                                value={formData.maxAgeUnit || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                            >
                                <option value="" disabled>Unit</option>
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
                                max={100}
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