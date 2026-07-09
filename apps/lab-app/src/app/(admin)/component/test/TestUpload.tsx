import React, { useState, useEffect, useCallback } from 'react';
import { FaCloudUploadAlt, FaCheckCircle, FaListAlt, FaLock } from 'react-icons/fa';
import { uploadTestCsv, getTestsPaginated, PaginatedTestResponse } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { toast } from 'react-toastify';
import Loader from '@/app/(admin)/component/common/Loader';

const TestUpload = () => {
  const { currentLab } = useLabs();
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTestsCount = useCallback(async () => {
    if (currentLab?.id) {
      setIsLoading(true);
      try {
        // Fetch just first page with size 1 to check if tests exist
        const response: PaginatedTestResponse = await getTestsPaginated(currentLab.id, 0, 1);
        const totalElements = response?.totalElements ?? 0;
        setTotalElements(totalElements);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load tests';
        toast.error(errorMessage);
        setTotalElements(0);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentLab?.id]);

  useEffect(() => {
    fetchTestsCount();
  }, [fetchTestsCount]);

  const handleUploadClick = () => {
    if (totalElements > 0) {
      toast.info('Tests already exist for this lab. Please delete existing tests before uploading new ones.');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (totalElements > 0) {
      toast.info('Tests already exist for this lab. Please delete existing tests before uploading new ones.');
      return;
    }

    try {
      if (currentLab?.id) {
        await uploadTestCsv(currentLab.id.toString(), file);
        toast.success('Test file uploaded successfully!', { autoClose: 2000 });
        // Refresh the count after upload
        await fetchTestsCount();
      } else {
        toast.error('Please select a lab first');
      }
    } catch (error) {
      // Handle file upload error
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while uploading the file.';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader type="progress" text="Loading tests..." fullScreen={false} />
        <p className="mt-4 text-sm text-gray-500">Please wait while we load the tests.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[500px]">
      <div className="bg-white rounded-xl border border-pneutral-200 p-8 w-full max-w-md text-center shadow-sm">
        {totalElements > 0 ? (
          <>
            <div className="mb-4">
              <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto">
                <FaCheckCircle size={32} className="text-success-600" />
              </div>
            </div>
            <h1 className="text-h4 font-semibold text-secondary-700 mb-2">
              Tests Already Uploaded!
            </h1>
            <p className="text-p3 text-pneutral-700 mb-4">
              You have <span className="font-semibold text-pneutral-900">{totalElements}</span> test(s) available for this lab.
            </p>
            <div className="bg-info-50 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-center gap-2">
                <FaListAlt className="text-info-600" size={18} />
                <span className="text-p4 font-medium text-info-700">Test List Exists</span>
              </div>
            </div>

            {/* Disabled upload option with message */}
            <div className="space-y-3">
              <div
                className="cursor-not-allowed inline-block bg-pneutral-200 text-pneutral-500 py-2.5 px-6 rounded-lg text-p3 font-medium"
                onClick={handleUploadClick}
              >
                <FaLock className="inline-block mr-2" size={14} />
                Upload Disabled
              </div>
              <p className="text-p2 text-pneutral-400">
                To upload new tests, please delete the existing ones first.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <div className="w-16 h-16 rounded-full bg-secondary-50 flex items-center justify-center mx-auto">
                <FaCloudUploadAlt size={32} className="text-secondary-600" />
              </div>
            </div>
            <h1 className="text-h4 font-semibold text-pneutral-900 mb-2">
              Upload Your Test File
            </h1>
            <p className="text-p3 text-pneutral-500 mb-6">
              Select a CSV file to upload and start your test process.
            </p>

            {/* Active upload button */}
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-block bg-secondary-700 text-pneutral-50 py-2.5 px-6 rounded-lg text-p3 font-medium hover:bg-secondary-800 transition-colors duration-200"
            >
              <FaCloudUploadAlt className="inline-block mr-2" size={16} />
              Choose File
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleUpload}
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
};

export default TestUpload;












// code written by Abhishek , ..................do not delete the code below ....................

// import React, { useState, useEffect, useCallback } from 'react';
// import { FaCloudUploadAlt, FaCheckCircle, FaListAlt, FaLock } from 'react-icons/fa';
// import { uploadTestCsv, getTestsPaginated, PaginatedTestResponse } from '@/../services/testService';
// import { useLabs } from '@/context/LabContext';
// import { toast } from 'react-toastify';
// import Loader from '@/app/(admin)/component/common/Loader';

// const TestUpload = () => {
//   const { currentLab } = useLabs();
//   const [totalElements, setTotalElements] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);

//   const fetchTestsCount = useCallback(async () => {
//     if (currentLab?.id) {
//       setIsLoading(true);
//       try {
//         // Fetch just first page with size 1 to check if tests exist
//         const response: PaginatedTestResponse = await getTestsPaginated(currentLab.id, 0, 1);
//         const totalElements = response?.totalElements ?? 0;
//         setTotalElements(totalElements);
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Failed to load tests';
//         toast.error(errorMessage);
//         setTotalElements(0);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   }, [currentLab?.id]);

//   useEffect(() => {
//     fetchTestsCount();
//   }, [fetchTestsCount]);

//   const handleUploadClick = () => {
//     if (totalElements > 0) {
//       toast.info('Tests already exist for this lab. Please delete existing tests before uploading new ones.');
//     }
//   };

//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (totalElements > 0) {
//       toast.info('Tests already exist for this lab. Please delete existing tests before uploading new ones.');
//       return;
//     }

//     try {
//       if (currentLab?.id) {
//         await uploadTestCsv(currentLab.id.toString(), file);
//         toast.success('Test file uploaded successfully!', { autoClose: 2000 });
//         // Refresh the count after upload
//         await fetchTestsCount();
//       } else {
//         toast.error('Please select a lab first');
//       }
//     } catch (error) {
//       // Handle file upload error
//       const errorMessage = error instanceof Error ? error.message : 'An error occurred while uploading the file.';
//       toast.error(errorMessage);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64">
//         <Loader type="progress" text="Loading tests..." fullScreen={false} />
//         <p className="mt-4 text-sm text-gray-500"> Please wait while we load the tests.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex justify-center items-center bg-gray-50 h-screen">
//       <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center -mt-40 transition-all duration-300 hover:shadow-xl">
//         {totalElements > 0 ? (
//           <>
//             <div className="text-green-500 mb-4">
//               <FaCheckCircle size={48} className="mx-auto" />
//             </div>
//             <h1 className="text-xl font-semibold text-gray-700 mb-2">
//               Tests Already Uploaded!
//             </h1>
//             <p className="text-gray-500 text-sm mb-6">
//               You have {totalElements} test(s) available for this lab.
//             </p>
//             <div className="bg-blue-50 p-4 rounded-md mb-6">
//               <div className="flex items-center justify-center">
//                 <FaListAlt className="text-blue-500 mr-2" />
//                 <span className="text-blue-600 font-medium">Test List Exists</span>
//               </div>
//             </div>

//             {/* Disabled upload option with message */}
//             <div
//               className="cursor-not-allowed inline-block bg-gray-300 text-gray-500 py-2 px-6 rounded-md text-sm font-medium"
//               onClick={handleUploadClick}
//             >
//               <FaLock className="inline-block mr-2" />
//               Upload Disabled
//             </div>

//             <p className="text-gray-400 text-xs mt-4">
//               To upload new tests, please delete the existing ones first.
//             </p>
//           </>
//         ) : (
//           <>
//             <div className="text-blue-500 mb-4 animate-bounce">
//               <FaCloudUploadAlt size={48} className="mx-auto" />
//             </div>
//             <h1 className="text-xl font-semibold text-gray-700 mb-2">
//               Upload Your Test File
//             </h1>
//             <p className="text-gray-500 text-sm mb-6">
//               Select a CSV file to upload and start your test process.
//             </p>

//             {/* Active upload button */}
//             <label
//               htmlFor="file-upload"
//               className="cursor-pointer inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-6 rounded-md 
//                 hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
//                 text-sm font-medium transition-all duration-200"
//             >
//               <FaCloudUploadAlt className="inline-block mr-2" />
//               Choose File
//               <input
//                 id="file-upload"
//                 type="file"
//                 accept=".csv"
//                 className="hidden"
//                 onChange={handleUpload}
//               />
//             </label>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TestUpload;