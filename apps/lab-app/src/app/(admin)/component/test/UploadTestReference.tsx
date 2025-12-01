import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaCheckCircle, FaLock } from 'react-icons/fa';
import { uploadTestReferanceRangeCsv, getTestReferences, PaginatedResponse } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { toast } from 'react-toastify';
import Loader from '@/app/(admin)/component/common/Loader';

const UploadTestReference = () => {
  const { currentLab } = useLabs();
  const [loading, setLoading] = useState(false);
  const [totalReferences, setTotalReferences] = useState(0);

  useEffect(() => {
    if (currentLab?.id) {
      setLoading(true);
      // Use paginated API to check if references exist
      // Fetch first page with size=1 just to check totalElements
      getTestReferences(currentLab.id, 0, 1)
        .then((response: PaginatedResponse) => {
          // Check if references exist using totalElements
          const totalElements = response?.totalElements ?? 0;
          
          setTotalReferences(totalElements);
        })
        .catch((error) => {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load reference points.';
          toast.error(errorMessage);
          // Reset to zero on error to allow upload
          setTotalReferences(0);
        })
        .finally(() => setLoading(false));
    } else {
      // Reset when no lab is selected
      setTotalReferences(0);
    }
  }, [currentLab]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Block upload if references already exist
    if (totalReferences > 0) {
      toast.info('Reference ranges already exist. Please delete existing references before uploading new ones.');
      // Reset file input to prevent any upload attempt
      e.target.value = '';
      return;
    }

    // Additional safety check - prevent upload if no lab selected
    if (!currentLab?.id) {
      toast.error('Current lab is not selected.');
      e.target.value = '';
      return;
    }

    try {
      setLoading(true);
      await uploadTestReferanceRangeCsv(currentLab.id.toString(), file);
      toast.success('Test reference file uploaded successfully!', { autoClose: 2000 });
      
      // Refresh the reference count after upload using paginated API
      const response: PaginatedResponse = await getTestReferences(currentLab.id, 0, 1);
      const totalElements = response?.totalElements ?? 0;
      
      setTotalReferences(totalElements);
      
      // Reset file input after successful upload
      e.target.value = '';
    } catch (error) {
      // Handle file upload error with detailed message
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while uploading the file.';
      toast.error(errorMessage, { autoClose: 3000 });
      // Reset file input on error
      e.target.value = '';
    } finally {
      setLoading(false);
    }
  };

  const handleDisabledClick = () => {
    toast.info('Reference ranges already exist. Please delete existing references before uploading new ones.');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader type="progress" text="Loading tests reference points..." fullScreen={false} />
        <p className="mt-4 text-sm text-gray-500">Please wait while we load the reference points.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center bg-gray-50 h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center -mt-40">
        {totalReferences > 0 ? (
          <>
            <div className="text-green-500 mb-4">
              <FaCheckCircle size={48} className="mx-auto" />
            </div>
            <h1 className="text-xl font-semibold text-gray-700 mb-2">
              Reference Ranges Already Uploaded!
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              You have reference ranges configured for {totalReferences} test(s).
            </p>
            
            <div 
              className="cursor-not-allowed inline-block bg-gray-200 text-gray-600 py-2 px-6 rounded-md
                text-sm font-medium"
              onClick={handleDisabledClick}
            >
              <FaLock className="inline-block mr-2" />
              Upload Disabled
            </div>
            
            <p className="text-gray-400 text-xs mt-4">
              To upload new reference ranges, please delete the existing ones first.
            </p>
          </>
        ) : (
          <>
            <div className="text-blue-500 mb-4">
              <FaCloudUploadAlt size={48} className="mx-auto bg-primary text-textzinc p-2" />
            </div>
            <h1 className="text-xl font-semibold text-gray-700 mb-2">
              Upload Your Test Reference CSV File
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Select a file to upload and start your test process. Accepted formats: <span className="font-medium">.csv</span>
            </p>
            
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-block bg-gradient-to-r from-primary to-primarylight text-textzinc py-2 px-6 rounded-md
                hover:from-primary hover:to-secondary
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCloudUploadAlt className="inline-block text-textzinc mr-2" />
              Choose File
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleUpload}
                disabled={loading || totalReferences > 0}
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadTestReference;