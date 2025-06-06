// import React from "react";
// import { TestReferancePoint } from "@/types/test/testlist";
// import Button from "../common/Button";
// import { PlusIcon } from "@heroicons/react/24/outline";
// import { TrashIcon } from "lucide-react";

// interface TestAddReferanceProps {
//     handleAddExistingReferanceRecord: (e: React.FormEvent) => void;
//     handleChangeRef: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
//     existingTestReferanceRecord: TestReferancePoint;
//     setExistingTestReferanceRecord: React.Dispatch<React.SetStateAction<TestReferancePoint>>;
// }

// const AddExistingTestReferance = ({
//     handleAddExistingReferanceRecord,
//     handleChangeRef,
//     existingTestReferanceRecord,
//     setExistingTestReferanceRecord,
// }: TestAddReferanceProps) => {
//     return (
//         <div className="p-4">
//             <h2 className="text-lg font-semibold mb-4 text-center">Add Existing Test Reference</h2>
//             <form onSubmit={handleAddExistingReferanceRecord} className="grid grid-cols-2 gap-3 text-sm">
//                 {[
//                     { label: "Test Name", name: "testName", type: "text", placeholder: "Enter test name" },
//                     { label: "Category", name: "category", type: "text", placeholder: "Enter category" },
//                     { label: "Description", name: "testDescription", type: "text", placeholder: "Enter description" },
//                     { label: "Units", name: "units", type: "text", placeholder: "Enter units (e.g., mg/dL)" },
//                 ].map(({ label, name, type, placeholder }) => (
//                     <div key={name} className="flex flex-col">
//                         <label className="text-gray-600 font-medium">{label}</label>
//                         <input
//                             type={type}
//                             name={name}
//                             // value={(existingTestReferanceRecord as any)[name] || ""}
//                             value={existingTestReferanceRecord[name as keyof TestReferancePoint] || ""}
//                             onChange={handleChangeRef}
//                             placeholder={placeholder}
//                             className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
//                         />
//                     </div>
//                 ))}

//                 <div className="flex flex-col">
//                     <label className="text-gray-600 font-medium">Gender</label>
//                     <select
//                         name="gender"
//                         value={existingTestReferanceRecord.gender}
//                         onChange={handleChangeRef}
//                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
//                     >
//                         <option value="" disabled>Select Gender</option>
//                         <option value="M">M</option>
//                         <option value="F">F</option>
//                         <option value="U">U</option>
//                     </select>
//                 </div>

//                 {[
//                     { label: "Min Age", name: "ageMin", placeholder: "Min Age" },
//                     { label: "Max Age", name: "ageMax", placeholder: "Max Age" },
//                     { label: "Min Range", name: "minReferenceRange", placeholder: "Min Value" },
//                     { label: "Max Range", name: "maxReferenceRange", placeholder: "Max Value" },
//                 ].map(({ label, name, placeholder }) => (
//                     <div key={name} className="flex flex-col">
//                         <label className="text-gray-600 font-medium">{label}</label>
//                         <input
//                             type="number"
//                             name={name}
//                             // value={(existingTestReferanceRecord as any)[name] || ""}
//                             value={existingTestReferanceRecord[name as keyof TestReferancePoint] || ""}
//                             onChange={handleChangeRef}
//                             placeholder={placeholder}
//                             className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
//                         />
//                     </div>
//                 ))}

//                 {/* Action Buttons */}
//                 <div className="col-span-2 flex justify-end space-x-2 mt-4">
//                     <Button
//                         text='Cancel'
//                         type="button"
//                         onClick={() => setExistingTestReferanceRecord({} as TestReferancePoint)}
//                         className="bg-delete text-white px-4 py-2 rounded hover:bg-deletehover transition hover:deletehover"
//                         >
//                             <TrashIcon className="h-5 w-5" />
//                     </Button>
//                     <Button
//                         text='Add'
//                         onClick={() => { }}
//                         type="submit"
//                         className="bg-savebutton text-white px-4 py-2 rounded hover:bg-savehover transition">
//                         <PlusIcon className="h-5 w-5" />
//                     </Button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AddExistingTestReferance;





import React from "react";
import { TestReferancePoint } from "@/types/test/testlist";
import Button from "../common/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "lucide-react";

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
    return (
        <div className="p-4 bg-white rounded-lg">
            {/* Header with subtle accent */}
            <div className="mb-4 pb-3 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
                    Add Existing Test Reference
                </h2>
            </div>

            <form onSubmit={handleAddExistingReferanceRecord} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Non-editable Test Name and Category */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">Test Name</label>
                        <div className="w-full px-3 py-2 text-sm bg-gray-50 rounded">
                            {existingTestReferanceRecord.testName || "-"}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">Category</label>
                        <div className="w-full px-3 py-2 text-sm bg-gray-50 rounded">
                            {existingTestReferanceRecord.category || "-"}
                        </div>
                    </div>

                    {/* Editable fields */}
                    <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
                        <input
                            type="text"
                            name="testDescription"
                            value={existingTestReferanceRecord.testDescription || ""}
                            onChange={handleChangeRef}
                            className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                            placeholder="Enter description"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">Units</label>
                        <input
                            type="text"
                            name="units"
                            value={existingTestReferanceRecord.units || ""}
                            onChange={handleChangeRef}
                            className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                            placeholder="Enter units (e.g., mg/dL)"
                        />
                    </div>

                    {/* Gender Select */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">Gender</label>
                        <select
                            name="gender"
                            value={existingTestReferanceRecord.gender || ""}
                            onChange={handleChangeRef}
                            className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                        >
                            <option value="" disabled>Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="U">Unisex</option>
                        </select>
                    </div>

                    {/* Number Inputs */}
                    {[
                        { label: "Min Age", name: "ageMin" },
                        { label: "Max Age", name: "ageMax" },
                        { label: "Min Range", name: "minReferenceRange" },
                        { label: "Max Range", name: "maxReferenceRange" },
                    ].map(({ label, name }) => (
                        <div key={name}>
                            <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
                            <input
                                type="number"
                                name={name}
                                value={existingTestReferanceRecord[name as keyof TestReferancePoint] || ""}
                                onChange={handleChangeRef}
                                className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                                placeholder={label}
                            />
                        </div>
                    ))}
                </div>

                {/* Action Buttons - Compact */}
                <div className="flex justify-end gap-2 pt-3">
                    <Button
                        text="Cancel"
                        onClick={() => setExistingTestReferanceRecord({} as TestReferancePoint)}
                        className="text-xs px-3 py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center"
                    >
                        <TrashIcon className="w-3.5 h-3.5 mr-1.5" />
                    </Button>
                    <Button
                        text="Add"
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

export default AddExistingTestReferance;