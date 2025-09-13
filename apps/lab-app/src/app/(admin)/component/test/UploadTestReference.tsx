import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaCheckCircle, FaLock } from 'react-icons/fa';
import { uploadTestReferanceRangeCsv, getTestReferanceRange } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { toast } from 'react-toastify';
import { TestReferancePoint } from '@/types/test/testlist';
import Loader from '@/app/(admin)/component/common/Loader';

const UploadTestReference = () => {
  const { currentLab } = useLabs();
  const [loading, setLoading] = useState(false);
  const [referencePoints, setReferencePoints] = useState<TestReferancePoint[]>([]);

  useEffect(() => {
    if (currentLab) {
      setLoading(true);
      getTestReferanceRange(currentLab.id.toString())
        .then((data) => {
          setReferencePoints(data);
        })
        .catch((error) => toast.error((error as Error).message))
        .finally(() => setLoading(false));
    }
  }, [currentLab]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (referencePoints.length > 0) {
      toast.info('Reference ranges already exist. Please delete existing references before uploading new ones.');
      return;
    }

    try {
      if (currentLab?.id) {
        await uploadTestReferanceRangeCsv(currentLab.id.toString(), file);
        toast.success('Test reference file uploaded successfully!', { autoClose: 2000 });
        // Refresh the reference points after upload
        const updatedPoints = await getTestReferanceRange(currentLab.id.toString());
        setReferencePoints(updatedPoints);
      } else {
        toast.error('Current lab is not selected.');
      }
    } catch (error) {
      // Handle file upload error
      toast.error('An error occurred while uploading the file.');
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
        {referencePoints.length > 0 ? (
          <>
            <div className="text-green-500 mb-4">
              <FaCheckCircle size={48} className="mx-auto" />
            </div>
            <h1 className="text-xl font-semibold text-gray-700 mb-2">
              Reference Ranges Already Uploaded!
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              You have reference ranges configured for {referencePoints.length} test(s).
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
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
            >
              <FaCloudUploadAlt className="inline-block text-textzinc mr-2" />
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

export default UploadTestReference;