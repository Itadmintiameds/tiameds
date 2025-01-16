import React from 'react';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import { downloadTestCsv } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { toast } from 'react-toastify';

const TestDownload = () => {
  const { currentLab } = useLabs();

  const handleDownload = async () => {
    try {
      if (currentLab?.id) {
        await downloadTestCsv(currentLab.id.toString());
        toast.success('Test file downloaded successfully!', { autoClose: 2000 });
      } else {
        toast.error('Current lab is not selected.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while downloading the file.');
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-50 h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center -mt-40">
        {/* Download Icon */}
        <div className="text-blue-500 mb-4">
          <FaCloudDownloadAlt size={48} className='bg-primary text-slate-100 p-2' />
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-700 mb-2">
          Download Your Test File
        </h1>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-6">
          Click the button below to download the test data in <span className="font-medium">.csv</span> format.
        </p>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="cursor-pointer inline-block 
          bg-gradient-to-r from-primary to-primary-light
           text-white 
          py-2 px-6 rounded-md 
          hover:from-primary-dark hover:to-primary
          focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium"
        >
          <FaCloudDownloadAlt className="inline-block mr-2" />
          Download File
        </button>
      </div>
    </div>
  );
};

export default TestDownload;
