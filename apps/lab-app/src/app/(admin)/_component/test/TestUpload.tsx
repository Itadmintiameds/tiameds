import React from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { uploadTestCsv } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { toast } from 'react-toastify';

const TestUpload = () => {
  const { currentLab } = useLabs();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (currentLab?.id) {
          await uploadTestCsv(currentLab.id.toString(), file);
          toast.success('Test file uploaded successfully!', { autoClose: 2000 });
        } else {
          toast.error('Current lab is not selected.');
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while uploading the file.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-50 h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center -mt-40">
        {/* Upload Icon */}
        <div className="text-blue-500 mb-4">
          <FaCloudUploadAlt size={48} className='bg-primary text-slate-100 p-2' />
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-700 mb-2">
          Upload Your Test File
        </h1>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-6">
          Select a file to upload and start your test process. Accepted formats: <span className="font-medium">.csv</span>
        </p>

        {/* Upload Button */}
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-block bg-gradient-to-r from-primary to-primary-light text-white py-2 px-6 rounded-md
           hover:from-primary-dark hover:to-primary
           focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
        >
          <FaCloudUploadAlt className="inline-block mr-2" />
          Choose File
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>
    </div>
  );
};

export default TestUpload;
