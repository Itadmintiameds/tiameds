import React from 'react';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import { downloadTestCsv, downloadTestCsvExcel } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const TestDownload = () => {
  const { currentLab } = useLabs();

  // Download CSV
  const handleDownloadCsv = async () => {
    try {
      if (!currentLab?.id) {
        toast.error('Current lab is not selected.');
        return;
      }

      await downloadTestCsv(currentLab.id.toString());
      toast.success('CSV file downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while downloading the CSV file.');
    }
  };

  // Download Excel
  const handleDownloadExcel = async () => {
    try {
      if (!currentLab?.id) {
        toast.error('Current lab is not selected.');
        return;
      }

      // Fetch the CSV content as text
      const csvText = await downloadTestCsvExcel(currentLab.id.toString());

      // Parse CSV to JSON
      const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });

      if (!data.length) {
        toast.error('No data found to export.');
        return;
      }

      // Convert JSON to Excel
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Data');

      // Save as Excel file
      XLSX.writeFile(workbook, 'test_data.xlsx');

      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while downloading the Excel file.');
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-50 h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center -mt-40">
        {/* Download Icon */}
        <div className="text-blue-500 mb-4">
          <FaCloudDownloadAlt size={48} className="bg-primary text-slate-100 p-2" />
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-700 mb-2">
          Download Your Test File
        </h1>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-6">
          Click a button below to download the test data in <span className="font-medium">CSV</span> or <span className="font-medium">Excel</span> format.
        </p>

        {/* Download Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleDownloadCsv}
            className="cursor-pointer bg-gradient-to-r from-blue-500 to-blue-400 text-white py-2 px-6 rounded-md hover:from-blue-600 hover:to-blue-500 focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            <FaCloudDownloadAlt className="inline-block mr-2" />
            Download CSV
          </button>
          <button
            onClick={handleDownloadExcel}
            className="cursor-pointer bg-gradient-to-r from-green-500 to-green-400 text-white py-2 px-6 rounded-md hover:from-green-600 hover:to-green-500 focus:ring-2 focus:ring-green-500 text-sm font-medium"
          >
            <FaCloudDownloadAlt className="inline-block mr-2" />
            Download Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestDownload;
