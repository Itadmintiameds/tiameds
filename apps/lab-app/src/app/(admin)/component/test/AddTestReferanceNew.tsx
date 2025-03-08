import React from "react";
import { TestReferancePoint } from "@/types/test/testlist";

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
    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-center">Add Test Reference</h2>

            <form onSubmit={handleAddNewReferanceRecord} className="grid grid-cols-2 gap-3 text-sm">
                {[
                    { label: "Test Name", name: "testName", type: "text", placeholder: "Enter test name" },
                    { label: "Category", name: "category", type: "text", placeholder: "Enter category" },
                    { label: "Description", name: "testDescription", type: "text", placeholder: "Enter description" },
                    { label: "Units", name: "units", type: "text", placeholder: "Enter units (e.g., mg/dL)" },
                ].map(({ label, name, type, placeholder }) => (
                    <div key={name} className="flex flex-col">
                        <label className="text-gray-600 font-medium">{label}</label>
                        <input
                            type={type}
                            name={name}
                            // value={(newReferanceRecord as Record<string, any>)[name] || ""}
                            value={newReferanceRecord[name as keyof TestReferancePoint] || ""}
                            onChange={handleChangeRef}
                            placeholder={placeholder}
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                ))}

                <div className="flex flex-col">
                    <label className="text-gray-600 font-medium">Gender</label>
                    <select
                        name="gender"
                        value={newReferanceRecord.gender}
                        onChange={handleChangeRef}
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="" disabled>Select Gender</option>
                        <option value="M">M</option>
                        <option value="F">F</option>
                        <option value="U">U</option>
                    </select>
                </div>

                {[
                    { label: "Min Age", name: "ageMin", placeholder: "Min Age" },
                    { label: "Max Age", name: "ageMax", placeholder: "Max Age" },
                    { label: "Min Range", name: "minReferenceRange", placeholder: "Min Value" },
                    { label: "Max Range", name: "maxReferenceRange", placeholder: "Max Value" },
                ].map(({ label, name, placeholder }) => (
                    <div key={name} className="flex flex-col">
                        <label className="text-gray-600 font-medium">{label}</label>
                        <input
                            type="number"
                            name={name}
                            // value={(newReferanceRecord)[name] || ""}
                            value={newReferanceRecord[name as keyof TestReferancePoint] || ""}
                            onChange={handleChangeRef}
                            placeholder={placeholder}
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                ))}

                {/* Action Buttons */}
                <div className="col-span-2 flex justify-end space-x-2 mt-4">
                    <button
                        type="button"
                        onClick={() => setNewReferanceRecord({} as TestReferancePoint)}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTestReferanceNew;
