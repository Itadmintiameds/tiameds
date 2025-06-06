// import { TestReferancePoint } from "@/types/test/testlist";
// import { TrashIcon } from "@heroicons/react/24/outline";
// import { PlusIcon } from "lucide-react";
// import React from "react";
// import Button from "../common/Button";
// import { useLabs } from "@/context/LabContext";
// import { useEffect, useState } from "react";
// import { getTests } from "../../../../../services/testService";
// import { toast } from "react-toastify";
// import { TestList } from "@/types/test/testlist";

// interface TestAddReferanceProps {
//     handleAddNewReferanceRecord: (e: React.FormEvent) => void;
//     handleChangeRef: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
//     newReferanceRecord: TestReferancePoint;
//     setNewReferanceRecord: React.Dispatch<React.SetStateAction<TestReferancePoint>>;
// }

// const AddTestReferanceNew = ({
//     handleAddNewReferanceRecord,
//     handleChangeRef,
//     newReferanceRecord,
//     setNewReferanceRecord,
// }: TestAddReferanceProps) => {


//     const { currentLab } = useLabs();
//     const [tests, setTests] = useState<TestList[]>([]);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         if (currentLab) {
//             setIsLoading(true);
//             getTests(currentLab.id.toString())
//                 .then((tests) => {
//                     setTests(tests);
//                 })
//                 .catch((error) => {
//                     toast.error(error.message || 'Failed to load tests');
//                 })
//                 .finally(() => {
//                     setIsLoading(false);
//                 });
//         }
//     }, [currentLab]);


//     console.log(tests,'test');

//     return (
//         <div className="p-4">
//             <h2 className="text-lg font-semibold mb-4 text-center">Add Test Reference</h2>

//             <form onSubmit={handleAddNewReferanceRecord} className="grid grid-cols-2 gap-3 text-sm">
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
//                             // value={(newReferanceRecord as Record<string, any>)[name] || ""}
//                             value={newReferanceRecord[name as keyof TestReferancePoint] || ""}
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
//                         value={newReferanceRecord.gender}
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
//                             // value={(newReferanceRecord)[name] || ""}
//                             value={newReferanceRecord[name as keyof TestReferancePoint] || ""}
//                             onChange={handleChangeRef}
//                             placeholder={placeholder}
//                             className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
//                         />
//                     </div>
//                 ))}

//                 {/* Action Buttons */}
//                 <div className="col-span-2 flex justify-end space-x-2 mt-4">
//                     <Button
//                         text="Cancel"
//                         type="button"
//                         onClick={() => setNewReferanceRecord({} as TestReferancePoint)}
//                         className="bg-delete text-white px-4 py-2 rounded hover:bg-deletehover transition hover:deletehover"
//                     >
//                         <TrashIcon className="h-5 w-5" />
//                     </Button>
//                     <Button
//                         text="Add"
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

// export default AddTestReferanceNew;




// import { TestReferancePoint } from "@/types/test/testlist";
// import { TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import { PlusIcon } from "lucide-react";
// import React from "react";
// import Button from "../common/Button";
// import { useLabs } from "@/context/LabContext";
// import { useEffect, useState } from "react";
// import { getTests } from "../../../../../services/testService";
// import { toast } from "react-toastify";
// import { TestList } from "@/types/test/testlist";

// interface TestAddReferanceProps {
//     handleAddNewReferanceRecord: (e: React.FormEvent) => void;
//     handleChangeRef: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
//     newReferanceRecord: TestReferancePoint;
//     setNewReferanceRecord: React.Dispatch<React.SetStateAction<TestReferancePoint>>;
// }

// const AddTestReferanceNew = ({
//     handleAddNewReferanceRecord,
//     handleChangeRef,
//     newReferanceRecord,
//     setNewReferanceRecord,
// }: TestAddReferanceProps) => {
//     const { currentLab } = useLabs();
//     const [tests, setTests] = useState<TestList[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedCategory, setSelectedCategory] = useState("");

//     useEffect(() => {
//         if (currentLab) {
//             setIsLoading(true);
//             getTests(currentLab.id.toString())
//                 .then((tests) => {
//                     setTests(tests);
//                 })
//                 .catch((error) => {
//                     toast.error(error.message || 'Failed to load tests');
//                 })
//                 .finally(() => {
//                     setIsLoading(false);
//                 });
//         }
//     }, [currentLab]);

//     // Get unique categories
//     const categories = Array.from(new Set(tests.map(test => test.category)));

//     // Filter tests based on search term and selected category
//     const filteredTests = tests.filter(test => {
//         const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesCategory = selectedCategory ? test.category === selectedCategory : true;
//         return matchesSearch && matchesCategory;
//     });

//     const handleTestSelect = (test: TestList) => {
//         setNewReferanceRecord(prev => ({
//             ...prev,
//             testName: test.name,
//             category: test.category
//         }));
//     };

//     return (
//         <div className="p-4 bg-white rounded-lg shadow-sm">
//             <h2 className="text-lg font-semibold mb-4 text-center">Add Test Reference</h2>

//             {/* Search and Filter Section */}
//             <div className="mb-4 space-y-3">
//                 <div className="relative">
//                     <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <input
//                         type="text"
//                         placeholder="Search tests..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
//                     />
//                 </div>

//                 <div className="flex space-x-2 overflow-x-auto pb-2">
//                     <button
//                         onClick={() => setSelectedCategory("")}
//                         className={`px-3 py-1 text-sm rounded-full ${!selectedCategory ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
//                     >
//                         All
//                     </button>
//                     {categories.map(category => (
//                         <button
//                             key={category}
//                             onClick={() => setSelectedCategory(category)}
//                             className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${selectedCategory === category ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
//                         >
//                             {category}
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             {/* Test Selection */}
//             {filteredTests.length > 0 && (
//                 <div className="mb-4 max-h-40 overflow-y-auto border rounded-md">
//                     {filteredTests.map(test => (
//                         <div
//                             key={test.id}
//                             onClick={() => handleTestSelect(test)}
//                             className={`p-2 hover:bg-blue-50 cursor-pointer ${newReferanceRecord.testName === test.name ? 'bg-blue-100' : ''}`}
//                         >
//                             <div className="font-medium">{test.name}</div>
//                             <div className="text-xs text-gray-500">{test.category}</div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Form Section */}
//             <form onSubmit={handleAddNewReferanceRecord} className="grid grid-cols-2 gap-3 text-sm">
//                 <div className="flex flex-col col-span-2">
//                     <label className="text-gray-600 font-medium">Test Name</label>
//                     <input
//                         type="text"
//                         name="testName"
//                         value={newReferanceRecord.testName || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Select test from above or enter manually"
//                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
//                     />
//                 </div>

//                 <div className="flex flex-col">
//                     <label className="text-gray-600 font-medium">Category</label>
//                     <input
//                         type="text"
//                         name="category"
//                         value={newReferanceRecord.category || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Category"
//                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
//                     />
//                 </div>

//                 <div className="flex flex-col">
//                     <label className="text-gray-600 font-medium">Gender</label>
//                     <select
//                         name="gender"
//                         value={newReferanceRecord.gender}
//                         onChange={handleChangeRef}
//                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
//                     >
//                         <option value="" disabled>Select Gender</option>
//                         <option value="M">M</option>
//                         <option value="F">F</option>
//                         <option value="U">U</option>
//                     </select>
//                 </div>

//                 <div className="flex flex-col col-span-2">
//                     <label className="text-gray-600 font-medium">Description</label>
//                     <input
//                         type="text"
//                         name="testDescription"
//                         value={newReferanceRecord.testDescription || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Enter description"
//                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
//                     />
//                 </div>

//                 <div className="flex flex-col">
//                     <label className="text-gray-600 font-medium">Units</label>
//                     <input
//                         type="text"
//                         name="units"
//                         value={newReferanceRecord.units || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Enter units (e.g., mg/dL)"
//                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
//                     />
//                 </div>

//                 <div className="flex flex-col">
//                     <label className="text-gray-600 font-medium">Min Age</label>
//                     <input
//                         type="number"
//                         name="ageMin"
//                         value={newReferanceRecord.ageMin || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Min Age"
//                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
//                     />
//                 </div>

//                 <div className="flex flex-col">
//                     <label className="text-gray-600 font-medium">Max Age</label>
//                     <input
//                         type="number"
//                         name="ageMax"
//                         value={newReferanceRecord.ageMax || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Max Age"
//                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
//                     />
//                 </div>

//                 <div className="flex flex-col">
//                     <label className="text-gray-600 font-medium">Min Range</label>
//                     <input
//                         type="number"
//                         name="minReferenceRange"
//                         value={newReferanceRecord.minReferenceRange || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Min Value"
//                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
//                     />
//                 </div>

//                 <div className="flex flex-col">
//                     <label className="text-gray-600 font-medium">Max Range</label>
//                     <input
//                         type="number"
//                         name="maxReferenceRange"
//                         value={newReferanceRecord.maxReferenceRange || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Max Value"
//                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
//                     />
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="col-span-2 flex justify-end space-x-2 mt-4">
//                     <Button
//                         text="Cancel"
//                         type="button"
//                         onClick={() => setNewReferanceRecord({} as TestReferancePoint)}
//                         className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
//                     >
//                         <TrashIcon className="h-5 w-5" />
//                     </Button>
//                     <Button
//                         text="Add"
//                         onClick={() => { }}
//                         type="submit"
//                         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
//                         <PlusIcon className="h-5 w-5" />
//                     </Button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AddTestReferanceNew;










// import { TestReferancePoint } from "@/types/test/testlist";
// import { TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import { PlusIcon } from "lucide-react";
// import React from "react";
// import Button from "../common/Button";
// import { useLabs } from "@/context/LabContext";
// import { useEffect, useState } from "react";
// import { getTests } from "../../../../../services/testService";
// import { toast } from "react-toastify";
// import { TestList } from "@/types/test/testlist";

// interface TestAddReferanceProps {
//     handleAddNewReferanceRecord: (e: React.FormEvent) => void;
//     handleChangeRef: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
//     newReferanceRecord: TestReferancePoint;
//     setNewReferanceRecord: React.Dispatch<React.SetStateAction<TestReferancePoint>>;
// }

// const AddTestReferanceNew = ({
//     handleAddNewReferanceRecord,
//     handleChangeRef,
//     newReferanceRecord,
//     setNewReferanceRecord,
// }: TestAddReferanceProps) => {
//     const { currentLab } = useLabs();
//     const [tests, setTests] = useState<TestList[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedCategory, setSelectedCategory] = useState("");

//     useEffect(() => {
//         if (currentLab) {
//             setIsLoading(true);
//             getTests(currentLab.id.toString())
//                 .then((tests) => {
//                     setTests(tests);
//                 })
//                 .catch((error) => {
//                     toast.error(error.message || 'Failed to load tests');
//                 })
//                 .finally(() => {
//                     setIsLoading(false);
//                 });
//         }
//     }, [currentLab]);

//     // Get unique categories
//     const categories = Array.from(new Set(tests.map(test => test.category)));

//     // Filter tests based on search term and selected category
//     const filteredTests = tests.filter(test => {
//         const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesCategory = selectedCategory ? test.category === selectedCategory : true;
//         return matchesSearch && matchesCategory;
//     });

//     const handleTestSelect = (test: TestList) => {
//         setNewReferanceRecord(prev => ({
//             ...prev,
//             testName: test.name,
//             category: test.category
//         }));
//     };

//     return (
//         <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
//             <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Add Test Reference</h2>

//             {/* Search and Filter Section */}
//             <div className="mb-6 space-y-4">
//                 <div className="relative">
//                     <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     <input
//                         type="text"
//                         placeholder="Search tests..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                     />
//                 </div>

//                 <div className="flex space-x-2 overflow-x-auto pb-2">
//                     <button
//                         onClick={() => setSelectedCategory("")}
//                         className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${!selectedCategory ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                     >
//                         All Categories
//                     </button>
//                     {categories.map(category => (
//                         <button
//                             key={category}
//                             onClick={() => setSelectedCategory(category)}
//                             className={`px-4 py-1.5 text-sm rounded-lg font-medium whitespace-nowrap transition-all ${selectedCategory === category ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                         >
//                             {category}
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             {/* Test Selection */}
//             {filteredTests.length > 0 && (
//                 <div className="mb-6 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
//                     {filteredTests.map(test => (
//                         <div
//                             key={test.id}
//                             onClick={() => handleTestSelect(test)}
//                             className={`p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${newReferanceRecord.testName === test.name ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''}`}
//                         >
//                             <div className="font-medium text-gray-800">{test.name}</div>
//                             <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mt-1">
//                                 {test.category}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Selected Test Preview */}
//             {newReferanceRecord.testName && (
//                 <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
//                     <div className="flex items-center space-x-3">
//                         <div className="flex-1">
//                             <h3 className="font-semibold text-gray-800">Selected Test</h3>
//                             <p className="text-gray-700">{newReferanceRecord.testName}</p>
//                         </div>
//                         <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
//                             {newReferanceRecord.category}
//                         </span>
//                     </div>
//                 </div>
//             )}

//             {/* Form Section */}
//             <form onSubmit={handleAddNewReferanceRecord} className="grid grid-cols-2 gap-4 text-sm">
//                 <div className="flex flex-col col-span-2">
//                     <label className="text-gray-700 font-medium mb-1">Test Name</label>
//                     <input
//                         type="text"
//                         name="testName"
//                         value={newReferanceRecord.testName || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Select test from above or enter manually"
//                         className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                     />
//                 </div>

//                 <div className="flex flex-col">
//                     <label className="text-gray-700 font-medium mb-1">Category</label>
//                     <input
//                         type="text"
//                         name="category"
//                         value={newReferanceRecord.category || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Category"
//                         className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                     />
//                 </div>

//                 <div className="flex flex-col">
//                     <label className="text-gray-700 font-medium mb-1">Gender</label>
//                     <select
//                         name="gender"
//                         value={newReferanceRecord.gender}
//                         onChange={handleChangeRef}
//                         className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                     >
//                         <option value="" disabled>Select Gender</option>
//                         <option value="M">Male</option>
//                         <option value="F">Female</option>
//                         <option value="U">Unspecified</option>
//                     </select>
//                 </div>

//                 <div className="flex flex-col col-span-2">
//                     <label className="text-gray-700 font-medium mb-1">Description</label>
//                     <input
//                         type="text"
//                         name="testDescription"
//                         value={newReferanceRecord.testDescription || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Enter description"
//                         className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                     />
//                 </div>

//                 <div className="flex flex-col">
//                     <label className="text-gray-700 font-medium mb-1">Units</label>
//                     <input
//                         type="text"
//                         name="units"
//                         value={newReferanceRecord.units || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Enter units (e.g., mg/dL)"
//                         className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                     />
//                 </div>

//                 <div className="flex flex-col">
//                     <label className="text-gray-700 font-medium mb-1">Min Age</label>
//                     <input
//                         type="number"
//                         name="ageMin"
//                         value={newReferanceRecord.ageMin || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Min Age"
//                         className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                     />
//                 </div>

//                 <div className="flex flex-col">
//                     <label className="text-gray-700 font-medium mb-1">Max Age</label>
//                     <input
//                         type="number"
//                         name="ageMax"
//                         value={newReferanceRecord.ageMax || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Max Age"
//                         className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                     />
//                 </div>

//                 <div className="flex flex-col">
//                     <label className="text-gray-700 font-medium mb-1">Min Range</label>
//                     <input
//                         type="number"
//                         name="minReferenceRange"
//                         value={newReferanceRecord.minReferenceRange || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Min Value"
//                         className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                     />
//                 </div>

//                 <div className="flex flex-col">
//                     <label className="text-gray-700 font-medium mb-1">Max Range</label>
//                     <input
//                         type="number"
//                         name="maxReferenceRange"
//                         value={newReferanceRecord.maxReferenceRange || ""}
//                         onChange={handleChangeRef}
//                         placeholder="Max Value"
//                         className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                     />
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="col-span-2 flex justify-end space-x-3 mt-6">
//                     <Button
//                         text="Cancel"
//                         type="button"
//                         onClick={() => setNewReferanceRecord({} as TestReferancePoint)}
//                         className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-200 transition border border-gray-300 font-medium"
//                     >
//                         <TrashIcon className="h-5 w-5 mr-2" />
//                         Clear
//                     </Button>
//                     <Button
//                         text="Add Reference"
//                         onClick={() => { }}
//                         type="submit"
//                         className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
//                     >
//                         <PlusIcon className="h-5 w-5 mr-2" />
//                         Add Reference
//                     </Button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AddTestReferanceNew;











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
            category: test.category
        }));
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
                    {categories.map(category => (
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
            {filteredTests.length > 0 && (
                <div className="mb-4 max-h-48 overflow-y-auto border border-gray-200 rounded-md text-sm">
                    {filteredTests.map(test => (
                        <div
                            key={test.id}
                            onClick={() => handleTestSelect(test)}
                            className={`p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${newReferanceRecord.testName === test.name ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}
                        >
                            <div className="font-medium">{test.name}</div>
                            <div className="text-xs text-blue-600">{test.category}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Selected Test Preview */}
            {newReferanceRecord.testName && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-100 text-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="font-medium">{newReferanceRecord.testName}</div>
                            <div className="text-xs text-blue-600">{newReferanceRecord.category}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Section */}
            <form onSubmit={handleAddNewReferanceRecord} className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col col-span-2">
                    <label className="text-gray-700 mb-1">Test Name</label>
                    <input
                        type="text"
                        name="testName"
                        value={newReferanceRecord.testName || ""}
                        onChange={handleChangeRef}
                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Category</label>
                    <input
                        type="text"
                        name="category"
                        value={newReferanceRecord.category || ""}
                        onChange={handleChangeRef}
                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Gender</label>
                    <select
                        name="gender"
                        value={newReferanceRecord.gender}
                        onChange={handleChangeRef}
                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="" disabled>Select</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="U">Unspecified</option>
                    </select>
                </div>

                <div className="flex flex-col col-span-2">
                    <label className="text-gray-700 mb-1">Description</label>
                    <input
                        type="text"
                        name="testDescription"
                        value={newReferanceRecord.testDescription || ""}
                        onChange={handleChangeRef}
                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Units</label>
                    <input
                        type="text"
                        name="units"
                        value={newReferanceRecord.units || ""}
                        onChange={handleChangeRef}
                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Min Age</label>
                    <input
                        type="number"
                        name="ageMin"
                        value={newReferanceRecord.ageMin || ""}
                        onChange={handleChangeRef}
                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Max Age</label>
                    <input
                        type="number"
                        name="ageMax"
                        value={newReferanceRecord.ageMax || ""}
                        onChange={handleChangeRef}
                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Min Range</label>
                    <input
                        type="number"
                        name="minReferenceRange"
                        value={newReferanceRecord.minReferenceRange || ""}
                        onChange={handleChangeRef}
                        className="w-full border border-gray-300 p-1 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 mb-1">Max Range</label>
                    <input
                        type="number"
                        name="maxReferenceRange"
                        value={newReferanceRecord.maxReferenceRange || ""}
                        onChange={handleChangeRef}
                        className="w-full border border-gray-300 p-1 rounded-md focus:ring-1 focus:ring-blue-500"
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
                    // icon={<PlusIcon className="h-4 w-4 mr-1" />}
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Reference
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddTestReferanceNew;