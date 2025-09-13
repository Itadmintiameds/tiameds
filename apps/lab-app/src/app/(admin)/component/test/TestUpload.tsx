import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaCheckCircle, FaListAlt, FaLock } from 'react-icons/fa';
import { uploadTestCsv, getTests } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { toast } from 'react-toastify';
import { TestList } from '@/types/test/testlist';
import Loader from '@/app/(admin)/component/common/Loader';

const TestUpload = () => {
  const { currentLab } = useLabs();
  const [tests, setTests] = useState<TestList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleUploadClick = () => {
    if (tests.length > 0) {
      toast.info('Tests already exist for this lab. Please delete existing tests before uploading new ones.');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (tests.length > 0) {
      toast.info('Tests already exist for this lab. Please delete existing tests before uploading new ones.');
      return;
    }

    try {
      if (currentLab?.id) {
        await uploadTestCsv(currentLab.id.toString(), file);
        toast.success('Test file uploaded successfully!', { autoClose: 2000 });
        const updatedTests = await getTests(currentLab.id.toString());
        setTests(updatedTests);
      } else {
        toast.error('Please select a lab first');
      }
    } catch (error) {
      // Handle file upload error
      toast.error('An error occurred while uploading the file.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader type="progress" text="Loading tests..." fullScreen={false} />
        <p className="mt-4 text-sm text-gray-500"> Please wait while we load the tests.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center bg-gray-50 h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center -mt-40 transition-all duration-300 hover:shadow-xl">
        {tests.length > 0 ? (
          <>
            <div className="text-green-500 mb-4">
              <FaCheckCircle size={48} className="mx-auto" />
            </div>
            <h1 className="text-xl font-semibold text-gray-700 mb-2">
              Tests Already Uploaded!
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              You have {tests.length} test(s) available for this lab.
            </p>
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <div className="flex items-center justify-center">
                <FaListAlt className="text-blue-500 mr-2" />
                <span className="text-blue-600 font-medium">Test List Exists</span>
              </div>
            </div>

            {/* Disabled upload option with message */}
            <div
              className="cursor-not-allowed inline-block bg-gray-300 text-gray-500 py-2 px-6 rounded-md text-sm font-medium"
              onClick={handleUploadClick}
            >
              <FaLock className="inline-block mr-2" />
              Upload Disabled
            </div>

            <p className="text-gray-400 text-xs mt-4">
              To upload new tests, please delete the existing ones first.
            </p>
          </>
        ) : (
          <>
            <div className="text-blue-500 mb-4 animate-bounce">
              <FaCloudUploadAlt size={48} className="mx-auto" />
            </div>
            <h1 className="text-xl font-semibold text-gray-700 mb-2">
              Upload Your Test File
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Select a CSV file to upload and start your test process.
            </p>

            {/* Active upload button */}
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-6 rounded-md 
                hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                text-sm font-medium transition-all duration-200"
            >
              <FaCloudUploadAlt className="inline-block mr-2" />
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