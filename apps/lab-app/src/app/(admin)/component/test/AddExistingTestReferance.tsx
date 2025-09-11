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
//         <div className="p-4 bg-white rounded-lg">
//             {/* Header with subtle accent */}
//             <div className="mb-4 pb-3 border-b border-gray-100">
//                 <h2 className="text-lg font-semibold text-gray-800 flex items-center">
//                     <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
//                     Add Existing Test Reference
//                 </h2>
//             </div>

//             <form onSubmit={handleAddExistingReferanceRecord} className="space-y-4">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {/* Non-editable Test Name and Category */}
//                     <div>
//                         <label className="text-xs font-medium text-gray-500 block mb-1">Test Name</label>
//                         <div className="w-full px-3 py-2 text-sm bg-gray-50 rounded">
//                             {existingTestReferanceRecord.testName || "-"}
//                         </div>
//                     </div>
//                     <div>
//                         <label className="text-xs font-medium text-gray-500 block mb-1">Category</label>
//                         <div className="w-full px-3 py-2 text-sm bg-gray-50 rounded">
//                             {existingTestReferanceRecord.category || "-"}
//                         </div>
//                     </div>

//                     {/* Editable fields */}
//                     <div className="sm:col-span-2">
//                         <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
//                         <input
//                             type="text"
//                             name="testDescription"
//                             value={existingTestReferanceRecord.testDescription|| ""}
//                             onChange={handleChangeRef}
//                             className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
//                             placeholder="Enter description"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label className="text-xs font-medium text-gray-500 block mb-1">Units</label>
//                         <input
//                             type="text"
//                             name="units"
//                             value={existingTestReferanceRecord.units || ""}
//                             onChange={handleChangeRef}
//                             className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
//                             placeholder="Enter units (e.g., mg/dL)"
//                         />
//                     </div>

//                     {/* Gender Select */}
//                     <div>
//                         <label className="text-xs font-medium text-gray-500 block mb-1">Gender</label>
//                         <select
//                             name="gender"
//                             value={existingTestReferanceRecord.gender || ""}
//                             onChange={handleChangeRef}
//                             className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
//                         >
//                             <option value="" disabled>Select Gender</option>
//                             <option value="M">Male</option>
//                             <option value="F">Female</option>
//                             <option value="U">Unisex</option>
//                         </select>
//                     </div>

//                     {/* Min Age with Unit */}
//                     <div>
//                         <label className="text-xs font-medium text-gray-500 block mb-1">Min Age</label>
//                         <div className="flex gap-2">
//                             <input
//                                 type="number"
//                                 name="ageMin"
//                                 min={0}
//                                 value={existingTestReferanceRecord.ageMin || ""}
//                                 onChange={handleChangeRef}
//                                 className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
//                                 placeholder="Min Age"
//                             />
//                             <select
//                                 name="minAgeUnit"
//                                 value={existingTestReferanceRecord.minAgeUnit || ""}
//                                 onChange={handleChangeRef}
//                                 className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
//                             >
//                                 <option value="" disabled>Unit</option>
//                                 <option value="YEARS">Years</option>
//                                 <option value="MONTHS">Months</option>
//                                 <option value="WEEKS">Weeks</option>
//                                 <option value="DAYS">Days</option>
//                             </select>
//                         </div>
//                     </div>

//                     {/* Max Age with Unit */}
//                     <div>
//                         <label className="text-xs font-medium text-gray-500 block mb-1">Max Age</label>
//                         <div className="flex gap-2">
//                             <input
//                                 type="number"
//                                 name="ageMax"
//                                  min={0}
//                                 value={existingTestReferanceRecord.ageMax || ""}
//                                 onChange={handleChangeRef}
//                                 className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
//                                 placeholder="Max Age"
//                             />
//                             <select
//                                 name="maxAgeUnit"
//                                 value={existingTestReferanceRecord.maxAgeUnit || ""}
//                                 onChange={handleChangeRef}
//                                 className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
//                             >
//                                 <option value="" disabled>Unit</option>
//                                 <option value="YEARS">Years</option>
//                                 <option value="MONTHS">Months</option>
//                                 <option value="WEEKS">Weeks</option>
//                                 <option value="DAYS">Days</option>
//                             </select>
//                         </div>
//                     </div>

//                     {/* Min/Max Range Inputs */}
//                     {[
//                         { label: "Min Range", name: "minReferenceRange" },
//                         { label: "Max Range", name: "maxReferenceRange" },
//                     ].map(({ label, name }) => (
//                         <div key={name}>
//                             <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
//                             <input
//                                 type="number"
//                                 name={name}
//                                  min={0}
//                                 value={existingTestReferanceRecord[name as keyof TestReferancePoint] || ""}
//                                 onChange={handleChangeRef}
//                                 className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
//                                 placeholder={label}
//                             />
//                         </div>
//                     ))}
//                 </div>

//                 {/* Action Buttons - Compact */}
//                 <div className="flex justify-end gap-2 pt-3">
//                     <Button
//                         text="Cancel"
//                         onClick={() => setExistingTestReferanceRecord({} as TestReferancePoint)}
//                         className="text-xs px-3 py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center"
//                     >
//                         <TrashIcon className="w-3.5 h-3.5 mr-1.5" />
//                     </Button>
//                     <Button
//                         text="Add"
//                         onClick={() => {}}
//                         type="submit"
//                         className="text-xs px-3 py-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors flex items-center"
//                     >
//                         <PlusIcon className="w-3.5 h-3.5 mr-1.5" />
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
    // Custom handler for description field to ensure uppercase
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setExistingTestReferanceRecord(prev => ({
            ...prev,
            [name]: value.toUpperCase()
        }));
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
                            list="existingTestDescriptionOptions"
                            value={existingTestReferanceRecord.testDescription || ""}
                            onChange={handleDescriptionChange} // Using custom handler
                            className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all uppercase-input"
                            placeholder="Type or select test description (will be capitalized)"
                            required
                        />
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
                            {/* <option value="U">Unisex</option> */}
                        </select>
                    </div>

                    {/* Min Age with Unit */}
                    <div>
                        <label className="text-xs font-medium text-gray-500 block mb-1">Min Age</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                name="ageMin"
                                min={0}
                                max={100}
                                value={existingTestReferanceRecord.ageMin || ""}
                                onChange={handleAgeChange}
                                className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                                placeholder="Min Age"
                            />
                            <select
                                name="minAgeUnit"
                                value={existingTestReferanceRecord.minAgeUnit || "YEARS"}
                                onChange={handleChangeRef}
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
                                value={existingTestReferanceRecord.ageMax || ""}
                                onChange={handleAgeChange}
                                className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                                placeholder="Max Age"
                            />
                            <select
                                name="maxAgeUnit"
                                value={existingTestReferanceRecord.maxAgeUnit || "YEARS"}
                                onChange={handleChangeRef}
                                className="w-full px-3 py-2 text-sm bg-gray-50 rounded focus:ring-1 focus:ring-blue-300 focus:bg-white transition-all"
                            >
                                <option value="YEARS">Years</option>
                                <option value="MONTHS">Months</option>
                                <option value="WEEKS">Weeks</option>
                                <option value="DAYS">Days</option>
                            </select>
                        </div>
                    </div>

                    {/* Min/Max Range Inputs */}
                    {[
                        { label: "Min Range", name: "minReferenceRange" },
                        { label: "Max Range", name: "maxReferenceRange" },
                    ].map(({ label, name }) => (
                        <div key={name}>
                            <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
                            <input
                                type="number"
                                name={name}
                                 min={0}
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