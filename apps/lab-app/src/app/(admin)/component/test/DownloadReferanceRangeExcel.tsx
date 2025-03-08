import React from 'react';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import { fetchTestReferenceRangeCsv } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

const DownloadReferenceRange = () => {
    const { currentLab } = useLabs();

    // Download CSV
    const handleDownloadCsv = async () => {
        try {
            if (!currentLab?.id) {
                toast.error('Current lab is not selected.');
                return;
            }

            const csvText = await fetchTestReferenceRangeCsv(currentLab.id.toString());

            // Convert CSV text into a downloadable Blob
            const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'test_reference_range.csv');

            toast.success('CSV file downloaded successfully!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to download CSV.');
        }
    };

    // Download Excel
    const handleDownloadExcel = async () => {
        try {
            if (!currentLab?.id) {
                toast.error('Current lab is not selected.');
                return;
            }

            const csvText = await fetchTestReferenceRangeCsv(currentLab.id.toString());

            // Parse CSV to JSON
            const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });

            if (!data.length) {
                toast.error('No data found to export.');
                return;
            }

            // Convert JSON to Excel
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Reference Range');

            // Save as Excel file
            XLSX.writeFile(workbook, 'test_reference_range.xlsx');

            toast.success('Excel file downloaded successfully!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to download Excel.');
        }
    };

    return (
        <div className="flex justify-center items-center bg-gray-50 h-screen">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center -mt-40">
                <div className="text-blue-500 mb-4">
                    <FaCloudDownloadAlt size={48} className="bg-primary text-slate-100 p-2" />
                </div>
                <h1 className="text-xl font-semibold text-gray-700 mb-2">
                    Download Test Reference Range
                </h1>
                <p className="text-gray-500 text-sm mb-6">
                    Click a button below to download in <span className="font-medium">CSV</span> or <span className="font-medium">Excel</span> format.
                </p>
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

export default DownloadReferenceRange;
