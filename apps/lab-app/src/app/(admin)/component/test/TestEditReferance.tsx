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
        <div className="p-4 border rounded shadow-lg bg-white">
            {/* Test Name & Category Display */}
            <div className="mb-4 p-3 bg-gray-100 rounded">
                <h2 className="text-lg font-semibold">{formData.testName}</h2>
                <p className="text-sm text-gray-600">Category: {formData.category}</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <input
                        type="text"
                        name="testDescription"
                        value={formData.testDescription}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Unisex">Unisex</option>
                    </select>
                </div>

                <div className="flex space-x-2">
                    <div className="w-1/2">
                        <label className="block text-sm font-medium">Min Age</label>
                        <input
                            type="number"
                            name="ageMin"
                            value={formData.ageMin}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-sm font-medium">Max Age</label>
                        <input
                            type="number"
                            name="ageMax"
                            value={formData.ageMax}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                </div>

                <div className="flex space-x-2">
                    <div className="w-1/2">
                        <label className="block text-sm font-medium">Min Range</label>
                        <input
                            type="number"
                            name="minReferenceRange"
                            value={formData.minReferenceRange}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-sm font-medium">Max Range</label>
                        <input
                            type="number"
                            name="maxReferenceRange"
                            value={formData.maxReferenceRange}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium">Units</label>
                    <input
                        type="text"
                        name="units"
                        value={formData.units}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-4">
                    <Button
                        text="Cancel"
                        onClick={() => setEditRecord(null)}
                        className="bg-delete text-white px-4 py-2 rounded hover:bg-deletehover transition hover:deletehover"
                    >
                        <TrashIcon className="w-6 h-6" />
                    </Button>
                    <Button
                        text="Save"
                        onClick={() => {}}
                        type="submit"
                        className="bg-savebutton text-white px-4 py-2 rounded hover:bg-savehover transition">
                        <PlusIcon className="h-5 w-5" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default TestEditReferance;
