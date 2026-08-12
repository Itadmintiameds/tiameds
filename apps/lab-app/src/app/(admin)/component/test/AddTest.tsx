"use client";

import React, { ChangeEvent, useState } from "react";
import {
  ArrowRight,
  X,
  CheckCircle2,
} from "lucide-react";
import Result, { ResultType } from "./Result";
import LivePreview from "./LivePreview";
import ApplicableCriteria from "./ApplicableCriteria";
import TestRNR from "./TestRNR";
import ReportDisplay from "./ReportDisplay";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";

interface TestForm {
  category: string;
  testName: string;
  price: string;
}

interface AddTestProps {
  closeModal: () => void;
  updateList: boolean;
  setUpdateList: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddTest = ({
  closeModal,
  setUpdateList,
}: AddTestProps) => {
  const [formData, setFormData] = useState<TestForm>({
    category: "",
    testName: "",
    price: "",
  });

  const [showResult, setShowResult] = useState(false);
  const [selectedResultType, setSelectedResultType] =
    useState<ResultType | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "price") {
      // Allow only numbers and up to 2 decimal places
      const decimalRegex = /^\d*\.?\d{0,2}$/;
      if (decimalRegex.test(value) || value === "") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContinue = () => {
    setShowResult(true);
  };

 const handleCancel = () => {
  setFormData({
    category: "",
    testName: "",
    price: "",
  });

  setShowResult(false);

  closeModal();
};

const handleSave = () => {
  console.log("Saving test:", formData);

  // Refresh TestList
  setUpdateList((prev) => !prev);

  // Close AddTest page
  closeModal();

  alert("Test saved successfully!");
};

  const isValid =
    formData.category &&
    formData.testName &&
    formData.price;

  return (
    <div className="flex gap-6 w-full">
      {/* Left Column - 3/4 width */}
      <div className="w-2/3 space-y-6">
        {/* Add Test Section */}
        <div className="w-full">
          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-h6 font-semibold text-pneutral-900">
              Add New Test
            </h1>
            <p className="mt-1 text-p3 text-pneutral-400">
              Create a new laboratory test with reference ranges
              and report configuration
            </p>
          </div>

          {/* Card */}
          <div className="overflow-hidden rounded-xl border border-pneutral-200 bg-white shadow-sm">
            {/* Card Header */}
            <div className="flex items-start border-b border-pneutral-200 px-6 py-3">
              <div className="flex h-10 w-10 items-center justify-center">
                <HiOutlineClipboardDocumentList
                  size={20}
                  className="text-secondary-700"
                />
              </div>
              <div>
                <h2 className="text-p4 font-semibold text-pneutral-900">
                  Basic Test Information
                </h2>
                <p className="text-p2 text-pneutral-500">
                  Core test identifiers and metadata
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Category - Changed to input */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Test Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Enter test category"
                    disabled={showResult}
                    className={`h-12 w-full rounded-full border border-gray-300 px-5 outline-none transition focus:border-violet-500 ${
                      showResult ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                </div>

                {/* Test Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Test Name
                  </label>
                  <input
                    type="text"
                    name="testName"
                    value={formData.testName}
                    onChange={handleChange}
                    placeholder="Enter test name"
                    disabled={showResult}
                    className={`h-12 w-full rounded-full border border-gray-300 px-5 outline-none transition focus:border-violet-500 ${
                      showResult ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Test Price (₹)
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter price"
                    disabled={showResult}
                    className={`h-12 w-full rounded-full border border-gray-300 px-5 outline-none transition focus:border-violet-500 ${
                      showResult ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                </div>

                {/* Continue */}
                <div className="flex items-end">
                  <button
                    onClick={handleContinue}
                    disabled={!isValid || showResult}
                    className={`flex h-12 w-full items-center justify-center gap-2 rounded-full border text-base font-semibold transition
                    ${
                      isValid && !showResult
                        ? "border-secondary-600 bg-secondary-50 text-secondary-700"
                        : "cursor-not-allowed border-secondary-600 bg-secondary-50 text-secondary-700 opacity-50"
                    }`}
                  >
                    Continue
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Result Component */}
        {showResult && (
          <Result
            selectedResultType={selectedResultType}
            onSelectResultType={setSelectedResultType}
          />
        )}

        {/* Applicable Criteria Component */}
        {showResult && <ApplicableCriteria />}

        {/* Test RNR Component */}
        {showResult && <TestRNR />}

        {/* Report Display Component */}
        {showResult && <ReportDisplay />}

        {/* Cancel and Save Buttons */}
        {showResult && (
          <div className="flex items-center border rounded-xl bg-white border-pneutral-200 justify-between gap-4 p-4">
            <button
              onClick={handleCancel}
              className="flex h-9 items-center justify-center gap-2 rounded-full border border-pneutral-300 px-4 text-label-l3 font-semibold text-pneutral-600"
            >
              <X size={16} />
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex h-9 items-center justify-center gap-2 rounded-full bg-secondary-700 px-8 text-base font-semibold text-pneutral-50 shadow-lg"
            >
              <CheckCircle2 size={16} />
              Save Test
            </button>
          </div>
        )}
      </div>

      {/* Right Column - 1/4 width */}
      {showResult && (
        <div className="w-1/3">
          <LivePreview resultType={selectedResultType} />
        </div>
      )}
    </div>
  );
}

export default AddTest;




























// code written by abhishek ............  do not delete this code..............

// import { addTest } from '@/../services/testService';
// import { useLabs } from '@/context/LabContext';
// import { testFormDataSchema } from '@/schema/testFormDataSchema';
// import React, { useState } from 'react';
// import { FaClipboardList, FaRupeeSign, FaTag, FaVial, FaTimes } from 'react-icons/fa';
// import { toast } from 'react-toastify';
// import { z } from 'zod';
// // import Button from '../common/Button';
// import { Plus } from 'lucide-react';
// import Loader from '../common/Loader';

// interface AddTestProps {
//   closeModal: () => void;
//   updateList: boolean;
//   setUpdateList: React.Dispatch<React.SetStateAction<boolean>>;
// }

// // interface TestForm {
// //   category: string;
// //   name: string;
// //   price?: number; // Changed from number to optional

// // }


// const AddTest = ({ closeModal, updateList, setUpdateList }: AddTestProps) => {
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [formData, setFormData] = useState({
//     category: '',
//     name: '',
//     price: undefined as string | undefined,
//   });
//   const { currentLab } = useLabs();

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
    
//     if (name === 'price') {
//       // Only allow numbers with max 2 digits after decimal
//       if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
//         setFormData((prev) => ({
//           ...prev,
//           [name]: value === '' ? undefined : value
//         }));
//       }
//     } else if (name === 'category') {
//       // Category: Only allow letters, spaces, and hyphens (no numbers)
//       if (/^[a-zA-Z\s\-]*$/.test(value)) {
//         setFormData((prev) => ({
//           ...prev,
//           [name]: value.toUpperCase()
//         }));
//       }
//     } else if (name === 'name') {
//       // Test Name: Allow alphanumeric (letters and numbers), spaces, and hyphens
//       if (/^[a-zA-Z0-9\s\-]*$/.test(value)) {
//         setFormData((prev) => ({
//           ...prev,
//           [name]: value.toUpperCase()
//         }));
//       }
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Clean up and validate input
//     const cleanedCategory = formData.category.trim().replace(/\s+/g, ' '); // Remove extra spaces
//     const cleanedName = formData.name.trim().replace(/\s+/g, ' '); // Remove extra spaces
    
//     if (!cleanedCategory) {
//       toast.error('Category is required');
//       return;
//     }
//     if (!cleanedName) {
//       toast.error('Test name is required');
//       return;
//     }
//     if (formData.price === undefined || Number(formData.price) < 0) {
//       toast.error('Price must be a valid positive number');
//       return;
//     }
    
//     try {
//       // Convert price to number for schema validation
//       const dataForValidation = {
//         ...formData,
//         price: Number(formData.price) || 0
//       };
//       testFormDataSchema.parse(dataForValidation);
//       const testListData = {
//         category: cleanedCategory,
//         name: cleanedName,
//         price: Number(formData.price) || 0, // Ensure price is 0 if undefined when submitting
//         id: 0,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       };
//       if (currentLab) {
//         setIsLoading(true);
//         await addTest(currentLab.id.toString(), testListData);
//         setUpdateList(!updateList);
//         setIsLoading(false);
//         toast.success('Test added successfully!', { autoClose: 2000 });
//         setFormData({ category: '', name: '', price: undefined });
//         closeModal();
//       } else {
//         toast.error('Current lab is not selected.');
//       }
//     } catch (err) {
//       if (err instanceof z.ZodError) {
//         toast.error(err.errors[0].message);
//       } else {
//         toast.error((err as Error).message);
//       }
//     }
//   }

//   return (
//     <div className="w-full">
//       <form onSubmit={handleSubmit} className="space-y-4">
//         {/* Test Information Section */}
//         <div className="bg-green-50 p-3 rounded-lg border border-green-100 space-y-3">
//           <h4 className="font-semibold text-green-800 mb-2 flex items-center">
//             <FaVial className="mr-2 text-green-600" /> Test Information
//           </h4>
          
//           {/* Category Input */}
//           <div className="relative">
//             <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">
//               Category
//             </label>
//             <div className="relative">
//               <FaTag className="absolute top-2.5 left-3 text-gray-400" />
//               <input
//                 id="category"
//                 type="text"
//                 name="category"
//                 value={formData.category}
//                 onChange={handleInputChange}
//                 className="border border-green-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none bg-white text-sm"
//                 placeholder="Enter category"
//               />
//             </div>
//           </div>

//           {/* Name Input */}
//           <div className="relative">
//             <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
//               Test Name
//             </label>
//             <div className="relative">
//               <FaClipboardList className="absolute top-2.5 left-3 text-gray-400" />
//               <input
//                 id="name"
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleInputChange}
//                 className="border border-green-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none bg-white text-sm"
//                 placeholder="Enter test name"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Pricing Information Section */}
//         <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 space-y-3">
//           <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
//             <FaRupeeSign className="mr-2 text-yellow-600" /> Pricing Information
//           </h4>
          
//           {/* Price Input */}
//           <div className="relative">
//             <label htmlFor="price" className="block text-sm font-medium text-gray-600 mb-1">
//               Price
//             </label>
//             <div className="relative">
//               <FaRupeeSign className="absolute top-2.5 left-3 text-gray-400" />
//               <input
//                 id="price"
//                 type="text"
//                 inputMode="decimal"
//                 name="price"
//                 value={formData.price ?? ''}
//                 onChange={handleInputChange}
//                 onKeyDown={(e) => {
//                   if (!/[0-9.]|\b/.test(e.key)) {
//                     e.preventDefault();
//                   }
//                   // Prevent multiple dots
//                   if (e.key === '.' && e.currentTarget.value.includes('.')) {
//                     e.preventDefault();
//                   }
//                 }}
//                 onBlur={(e) => {
//                   const val = e.target.value;
//                   if (val && !/^\d+(\.\d{1,2})?$/.test(val)) {
//                     e.target.value = '';
//                     setFormData((prev) => ({ ...prev, price: undefined }));
//                   }
//                 }}
//                 pattern="^\d+(\.\d{0,2})?$"
//                 className="border border-yellow-300 rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-yellow-500 focus:outline-none bg-white text-sm"
//                 placeholder="Enter price"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         {isLoading ? (
//           <div className="flex justify-center items-center py-4">
//             <Loader />
//           </div>
//         ) : (
//           <div className="flex justify-end space-x-3">
//             <button
//               type="button"
//               onClick={closeModal}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 flex items-center gap-2"
//             >
//               <FaTimes className="h-4 w-4" />
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
//               style={{
//                 background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
//               }}
//             >
//               <Plus className="h-4 w-4" />
//               Add Test
//             </button>
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default AddTest;
