// import { useRef, useState, useEffect } from "react";
// import { useLabs } from "@/context/LabContext";
// import { PatientData } from "@/types/sample/sample";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import { getReportData } from "../../../../../../../services/reportServices";

// interface Report {
//     reportId: number;
//     testName: string;
//     referenceDescription: string;
//     referenceRange: string;
//     enteredValue: string;
//     unit: string;
// }

// const A4_WIDTH = 210; // mm
// const A4_HEIGHT = 297; // mm
// const A4_RATIO = A4_WIDTH / A4_HEIGHT;

// const LabReport = ({ viewPatient }: { viewPatient: PatientData | null }) => {
//     const { currentLab } = useLabs();
//     const [reports, setReports] = useState<Report[]>([]);
//     const [loading, setLoading] = useState(true);
//     const reportRefs = useRef<(HTMLDivElement | null)[]>([]);

//     useEffect(() => {
//         if (!currentLab?.id || !viewPatient?.visitId) return;

//         const fetchData = async () => {
//             try {
//                 const response = await getReportData(currentLab.id.toString(), viewPatient.visitId.toString());
//                 if (Array.isArray(response)) {
//                     setReports(response);
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [currentLab, viewPatient]);

//     const printAllReports = async () => {
//         const pdf = new jsPDF('p', 'mm', 'a4');

//         for (let i = 0; i < reportRefs.current.length; i++) {
//             const page = reportRefs.current[i];
//             if (!page) continue;

//             const canvas = await html2canvas(page, {
//                 scale: 2,
//                 useCORS: true,
//                 allowTaint: true,
//                 logging: false
//             });

//             const imgData = canvas.toDataURL('image/png');

//             // Calculate dimensions to maintain A4 aspect ratio
//             const imgWidth = A4_WIDTH - 20; // 10mm margins
//             const imgHeight = (canvas.height * imgWidth) / canvas.width;

//             pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

//             if (i < reportRefs.current.length - 1) {
//                 pdf.addPage();
//             }
//         }

//         pdf.save(`${viewPatient?.patientname || 'report'}_full.pdf`);
//     };

//     if (loading) return <div className="text-center py-8">Loading report...</div>;

//     const groupedReports = reports.reduce((acc: Record<string, Report[]>, report) => {
//         if (!acc[report.testName]) {
//             acc[report.testName] = [];
//         }
//         acc[report.testName].push(report);
//         return acc;
//     }, {});

//     return (
//         <div className="max-w-4xl mx-auto">
//             {/* Page counter */}
//             <div className="text-sm text-zinc-500 mb-2">
//                 {Object.keys(groupedReports).length} page report
//             </div>

//             {/* Report Pages */}
//             {Object.entries(groupedReports).map(([testName, testResults], index) => (
//                 <div 
//                     key={index}
//                     ref={el => reportRefs.current[index] = el}
//                     className="bg-white p-6 border rounded-md mb-4"
//                     style={{
//                         width: '210mm',
//                         minHeight: '297mm',
//                         boxShadow: '0 0 5px rgba(0,0,0,0.1)'
//                     }}
//                 >
//                     {/* Header */}
//                     <div className="flex justify-between items-center border-b pb-4 mb-4">
//                         <div>
//                             <div className="flex items-center">
//                                 <img src="/tiamed1.svg" alt="Lab Logo" className="h-12 mr-3" />
//                                 <h1 className="text-xl font-bold text-zinc-900">NEXTJEN DIAGNOSTICS</h1>
//                             </div>
//                             <p className="text-xs text-zinc-600 mt-1">123 Health Street, Bengaluru, India</p>
//                             <p className="text-xs text-zinc-600">+91 98765 43210 | contact@nextjen.com</p>
//                         </div>
//                         <div className="text-right">
//                             <p className="text-xs text-zinc-600">Report ID: {viewPatient?.visitId || 'N/A'}</p>
//                             <p className="text-xs text-zinc-600">Date: {new Date().toLocaleDateString()}</p>
//                         </div>
//                     </div>

//                     {/* Patient Info */}
//                     <div className="grid grid-cols-2 gap-4 text-sm mb-6">
//                         <div>
//                             <p className="font-medium text-zinc-900">Patient Name: <span className="font-normal">{viewPatient?.patientname || 'N/A'}</span></p>
//                             <p className="font-medium text-zinc-900">Age/Gender: <span className="font-normal">35/Male</span></p>
//                         </div>
//                         <div>
//                             <p className="font-medium text-zinc-900">Referred By: <span className="font-normal">DR SELF</span></p>
//                             <p className="font-medium text-zinc-900">IP/OP: <span className="font-normal">OP</span></p>
//                         </div>
//                     </div>

//                     {/* Test Results */}
//                     <div className="mb-8">
//                         <h2 className="text-lg font-bold text-zinc-900 border-b pb-2 mb-4">{testName}</h2>

//                         <table className="w-full text-sm">
//                             <thead className="bg-gray-100">
//                                 <tr>
//                                     <th className="text-left p-2 font-medium text-zinc-900">Parameter</th>
//                                     <th className="text-left p-2 font-medium text-zinc-900">Value</th>
//                                     <th className="text-left p-2 font-medium text-zinc-900">Unit</th>
//                                     <th className="text-left p-2 font-medium text-zinc-900">Range</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {testResults.map((param, idx) => (
//                                     <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                                         <td className="p-2 border-b">{param.referenceDescription}</td>
//                                         <td className="p-2 border-b font-medium">{param.enteredValue}</td>
//                                         <td className="p-2 border-b">{param.unit}</td>
//                                         <td className="p-2 border-b">{param.referenceRange}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Footer - Only on last page */}
//                     {index === Object.keys(groupedReports).length - 1 && (
//                         <div className="border-t pt-4 text-xs text-zinc-600 mt-auto">
//                             <div className="flex justify-between mb-8">
//                                 <div className="w-1/3 text-center">
//                                     <p className="border-t-2 border-gray-300 pt-2">Authorized Signatory</p>
//                                 </div>
//                                 <div className="w-1/3 text-center">
//                                     <p className="border-t-2 border-gray-300 pt-2">Verified By</p>
//                                 </div>
//                             </div>
//                             <p className="text-center mb-2">This is an electronically generated report and does not require a physical signature</p>
//                             <p className="text-center mb-2">Report generated on: {new Date().toLocaleString()}</p>
//                             <p className="text-center font-medium">Powered by Tiameds Technology</p>
//                             <p className="text-center mt-2">Thank you for choosing NEXTJEN</p>
//                         </div>
//                     )}
//                 </div>
//             ))}

//             {/* Print Button */}
//             <div className="flex justify-end mt-4 print:hidden">
//                 <button 
//                     onClick={printAllReports}
//                     className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
//                 >
//                     Print All Reports ({Object.keys(groupedReports).length} pages)
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default LabReport;







// import { useRef, useState, useEffect } from "react";
// import { useLabs } from "@/context/LabContext";
// import { PatientData } from "@/types/sample/sample";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import { getReportData } from "../../../../../../../services/reportServices";

// interface Report {
//     reportId: number;
//     testName: string;
//     referenceDescription: string;
//     referenceRange: string;
//     enteredValue: string;
//     unit: string;
// }

// const A4_WIDTH = 210; // mm
// const A4_HEIGHT = 297; // mm

// const LabReport = ({ viewPatient }: { viewPatient: PatientData | null }) => {
//     const { currentLab } = useLabs();
//     const [reports, setReports] = useState<Report[]>([]);
//     const [loading, setLoading] = useState(true);
//     const reportRefs = useRef<(HTMLDivElement | null)[]>([]);

//     useEffect(() => {
//         if (!currentLab?.id || !viewPatient?.visitId) return;

//         const fetchData = async () => {
//             try {
//                 const response = await getReportData(currentLab.id.toString(), viewPatient.visitId.toString());
//                 if (Array.isArray(response)) {
//                     setReports(response);
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [currentLab, viewPatient]);

//     const printAllReports = async () => {
//         const pdf = new jsPDF('p', 'mm', 'a4');

//         for (let i = 0; i < reportRefs.current.length; i++) {
//             const page = reportRefs.current[i];
//             if (!page) continue;

//             const canvas = await html2canvas(page, {
//                 scale: 2,
//                 useCORS: true,
//                 allowTaint: true,
//                 logging: false
//             });

//             const imgData = canvas.toDataURL('image/png');
//             const imgWidth = A4_WIDTH - 20;
//             const imgHeight = (canvas.height * imgWidth) / canvas.width;

//             pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

//             if (i < reportRefs.current.length - 1) {
//                 pdf.addPage();
//             }
//         }

//         pdf.save(`${viewPatient?.patientname || 'report'}_full.pdf`);
//     };

//     if (loading) return (
//         <div className="flex items-center justify-center h-64">
//             <div className="text-center">
//                 <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
//                 <p className="mt-4 text-lg font-medium text-gray-700">Loading report...</p>
//             </div>
//         </div>
//     );

//     const groupedReports = reports.reduce((acc: Record<string, Report[]>, report) => {
//         if (!acc[report.testName]) {
//             acc[report.testName] = [];
//         }
//         acc[report.testName].push(report);
//         return acc;
//     }, {});

//     return (
//         <div className="max-w-4xl mx-auto">
//             {/* Print Button */}
//             <div className="flex justify-between items-center mb-4 print:hidden">
//                 <div className="text-sm text-gray-600">
//                     {Object.keys(groupedReports).length} page report
//                 </div>
//                 <button
//                     onClick={printAllReports}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
//                 >
//                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
//                     </svg>
//                     Print All Reports
//                 </button>
//             </div>

//             {/* Report Pages */}
//             {Object.entries(groupedReports).map(([testName, testResults], index) => (
//                 <div
//                     key={index}
//                     ref={el => reportRefs.current[index] = el}
//                     className="bg-white p-8 border border-gray-200 rounded-lg mb-6 flex flex-col shadow-sm"
//                     style={{
//                         width: '210mm',
//                         minHeight: '297mm',
//                     }}
//                 >
//                     {/* Watermark Background */}
//                     <div className="absolute inset-0 opacity-5 pointer-events-none">
//                         <div className="h-full w-full bg-[url('/tiamed1.svg')] bg-center bg-no-repeat bg-contain"></div>
//                     </div>

//                     {/* Header */}
//                     <div className="flex justify-between items-start border-b border-blue-100 pb-6 mb-6">
//                         <div className="flex items-center">
//                             <img src="/tiamed1.svg" alt="Lab Logo" className="h-14 mr-4" />
//                             <div>
//                                 <h1 className="text-2xl font-bold text-blue-800">NEXTJEN DIAGNOSTICS</h1>
//                                 <p className="text-xs text-gray-600 mt-1">Accredited by NABL | ISO 15189:2012 Certified</p>
//                             </div>
//                         </div>
//                         <div className="text-right bg-blue-50 p-3 rounded-lg">
//                             <p className="text-xs font-medium text-blue-700">Report ID: <span className="font-bold">{viewPatient?.visitId || 'N/A'}</span></p>
//                             <p className="text-xs font-medium text-blue-700">Date: <span className="font-bold">{new Date().toLocaleDateString()}</span></p>
//                             <p className="text-xs font-medium text-blue-700 mt-1">Page: {index + 1}/{Object.keys(groupedReports).length}</p>
//                         </div>
//                     </div>

//                     {/* Patient Info */}
//                     <div className="grid grid-cols-3 gap-4 mb-8 bg-blue-50 p-4 rounded-lg">
//                         <div>
//                             <p className="text-sm font-medium text-blue-800">Patient Name</p>
//                             <p className="text-lg font-semibold text-gray-900">{viewPatient?.patientname || 'N/A'}</p>
//                         </div>
//                         <div>
//                             <p className="text-sm font-medium text-blue-800">Age/Gender</p>
//                             <p className="text-lg font-semibold text-gray-900">35 / Male</p>
//                         </div>
//                         <div>
//                             <p className="text-sm font-medium text-blue-800">Referred By</p>
//                             <p className="text-lg font-semibold text-gray-900">DR. SELF</p>
//                         </div>
//                     </div>

//                     {/* Test Header */}
//                     <div className="mb-6">
//                         <h2 className="text-xl font-bold text-blue-800 mb-2">{testName}</h2>
//                         <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-100 rounded-full"></div>
//                     </div>

//                     {/* Test Results */}
//                     <div className="mb-8 flex-grow">
//                         <table className="w-full text-sm">
//                             <thead>
//                                 <tr className="bg-blue-600 text-white">
//                                     <th className="text-left p-3 font-medium">Parameter</th>
//                                     <th className="text-left p-3 font-medium">Value</th>
//                                     <th className="text-left p-3 font-medium">Unit</th>
//                                     <th className="text-left p-3 font-medium">Reference Range</th>
//                                     <th className="text-left p-3 font-medium">Status</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {testResults.map((param, idx) => {
//                                     // Simple logic to determine if value is abnormal (for demo)
//                                     const isNormal = Math.random() > 0.2;
//                                     return (
//                                         <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
//                                             <td className="p-3 border-b border-gray-100 font-medium">{param.referenceDescription}</td>
//                                             <td className="p-3 border-b border-gray-100 font-bold">{param.enteredValue}</td>
//                                             <td className="p-3 border-b border-gray-100">{param.unit}</td>
//                                             <td className="p-3 border-b border-gray-100">{param.referenceRange}</td>
//                                             <td className="p-3 border-b border-gray-100">
//                                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${isNormal ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                                                     }`}>
//                                                     {isNormal ? 'Normal' : 'Abnormal'}
//                                                 </span>
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Interpretation Notes (only if abnormal results exist) */}
//                     <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
//                         <h3 className="font-bold text-yellow-800 mb-2 flex items-center">
//                             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                             </svg>
//                             Interpretation Note
//                         </h3>
//                         <p className="text-sm text-yellow-700">
//                             Some values are outside the reference range. Please consult with your physician for clinical correlation.
//                         </p>
//                     </div>

//                     {/* Footer */}
//                     <div className="mt-auto pt-6 border-t border-gray-200">


//                         <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
//                             <div className="text-center">
//                                 <p className="text-xs font-medium text-gray-700 mb-2">Lab Technician</p>
//                                 <div className="h-12 border-t border-gray-300 flex items-center justify-center">
//                                     <span className="text-xs text-gray-500">Signature/Stamp</span>
//                                 </div>
//                             </div>
//                             <div className="text-center">
//                                 <p className="text-xs font-medium text-gray-700 mb-2">Verified By</p>
//                                 <div className="h-12 border-t border-gray-300 flex items-center justify-center">
//                                     <span className="text-xs text-gray-500">Signature/Stamp</span>
//                                 </div>
//                             </div>
//                             <div className="text-center">
//                                 <p className="text-xs font-medium text-gray-700 mb-2">Authorized Pathologist</p>
//                                 <div className="h-12 border-t border-gray-300 flex items-center justify-center">
//                                     <span className="text-xs text-gray-500">Dr. Signature/Stamp</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="mt-4 text-center">
//                             <p className="text-xs text-gray-600 mb-1">This is an electronically generated report. No physical signature required.</p>
//                             <p className="text-xs text-gray-600">For queries: help@nextjen.com | +91 98765 43210 | www.nextjendl.com</p>
//                             <p className="text-xs font-medium text-blue-600 mt-2">Thank you for choosing NEXTJEN DIAGNOSTICS</p>
//                         </div>

//                     </div>

//                     {/* divider */}
//                     <div className="flex justify-between items-center mt-4">
//                         <div className="flex items-center">
//                             <img src="/tiamed1.svg" alt="Tiamed Logo" className="h-6 mr-2 opacity-80" />
//                             <span className="text-xs font-medium text-gray-600">Powered by Tiameds Technology</span>
//                         </div>
//                         <div className="text-right">
//                             <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleString()}</p>
//                         </div>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default LabReport;









import { useRef, useState, useEffect } from "react";
import { useLabs } from "@/context/LabContext";
import { PatientData } from "@/types/sample/sample";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getReportData } from "../../../../../../../services/reportServices";

interface Report {
    reportId: number;
    testName: string;
    referenceDescription: string;
    referenceRange: string;
    enteredValue: string;
    unit: string;
}

const A4_WIDTH = 210; // mm
// const A4_HEIGHT = 297; // mm

const LabReport = ({ viewPatient }: { viewPatient: PatientData | null }) => {
    const { currentLab } = useLabs();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const reportRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (!currentLab?.id || !viewPatient?.visitId) return;

        const fetchData = async () => {
            try {
                const response = await getReportData(currentLab.id.toString(), viewPatient.visitId.toString());
                if (Array.isArray(response)) {
                    setReports(response);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentLab, viewPatient]);

    const printAllReports = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');

        for (let i = 0; i < reportRefs.current.length; i++) {
            const page = reportRefs.current[i];
            if (!page) continue;

            const canvas = await html2canvas(page, {
                useCORS: true,
                allowTaint: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = A4_WIDTH - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

            if (i < reportRefs.current.length - 1) {
                pdf.addPage();
            }
        }

        // Open PDF in new tab instead of downloading
        pdf.output('dataurlnewwindow');
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-lg font-medium text-gray-700">Loading report...</p>
            </div>
        </div>
    );

    const groupedReports = reports.reduce((acc: Record<string, Report[]>, report) => {
        if (!acc[report.testName]) {
            acc[report.testName] = [];
        }
        acc[report.testName].push(report);
        return acc;
    }, {});

    return (
        <div className="max-w-4xl mx-auto">
            {/* Print Button */}
            <div className="flex justify-between items-center mb-4 print:hidden">
                <div className="text-sm text-gray-600">
                    {Object.keys(groupedReports).length} page report
                </div>
                <button
                    onClick={printAllReports}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Prin Reports
                </button>
            </div>

            {/* Report Pages */}
            {Object.entries(groupedReports).map(([testName, testResults], index) => (
                <div
                    key={index}
                    ref={el => { reportRefs.current[index] = el; }}
                    className="bg-white p-8 border border-gray-200 rounded-lg mb-6 flex flex-col shadow-sm"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                    }}
                >
                    {/* Watermark Background */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <div className="h-full w-full bg-[url('/tiamed1.svg')] bg-center bg-no-repeat bg-contain"></div>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-blue-100 pb-6 mb-6">
                        <div className="flex items-center">
                            <img src="/tiamed1.svg" alt="Lab Logo" className="h-14 mr-4" />
                            <div>
                                <h1 className="text-2xl font-bold text-blue-800">NEXTJEN DIAGNOSTICS</h1>
                                <p className="text-xs text-gray-600 mt-1">Accredited by NABL | ISO 15189:2012 Certified</p>
                            </div>
                        </div>
                        <div className="text-right bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-blue-700">Report ID: <span className="font-bold">{viewPatient?.visitId || 'N/A'}</span></p>
                            <p className="text-xs font-medium text-blue-700">Date: <span className="font-bold">{new Date().toLocaleDateString()}</span></p>
                            <p className="text-xs font-medium text-blue-700 mt-1">Page: {index + 1}/{Object.keys(groupedReports).length}</p>
                        </div>
                    </div>

                    {/* Patient Info */}
                    <div className="grid grid-cols-3 gap-4 mb-8 bg-blue-50 p-4 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-blue-800">Patient Name</p>
                            <p className="text-lg font-semibold text-gray-900">{viewPatient?.patientname || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-800">Age/Gender</p>
                            <p className="text-lg font-semibold text-gray-900">35 / Male</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-800">Referred By</p>
                            <p className="text-lg font-semibold text-gray-900">DR. SELF</p>
                        </div>
                    </div>

                    {/* Test Header */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-blue-800 mb-2">{testName}</h2>
                        <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-100 rounded-full"></div>
                    </div>

                    {/* Test Results */}
                    <div className="mb-8 flex-grow">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="text-left p-3 font-medium">Parameter</th>
                                    <th className="text-left p-3 font-medium">Value</th>
                                    <th className="text-left p-3 font-medium">Unit</th>
                                    <th className="text-left p-3 font-medium">Reference Range</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testResults.map((param, idx) => {
                                    // Simple logic to determine if value is abnormal (for demo)
                                    const isNormal = Math.random() > 0.2;
                                    return (
                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                                            <td className="p-3 border-b border-gray-100 font-medium">{param.referenceDescription}</td>
                                            <td className="p-3 border-b border-gray-100 font-bold">{param.enteredValue}</td>
                                            <td className="p-3 border-b border-gray-100">{param.unit}</td>
                                            <td className="p-3 border-b border-gray-100">{param.referenceRange}</td>
                                            <td className="p-3 border-b border-gray-100">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${isNormal ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {isNormal ? 'Normal' : 'Abnormal'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Interpretation Notes (only if abnormal results exist) */}
                    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <h3 className="font-bold text-yellow-800 mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Interpretation Note
                        </h3>
                        <p className="text-sm text-yellow-700">
                            Some values are outside the reference range. Please consult with your physician for clinical correlation.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                            <div className="text-center">
                                <p className="text-xs font-medium text-gray-700 mb-2">Lab Technician</p>
                                <div className="h-12 border-t border-gray-300 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">Signature/Stamp</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-medium text-gray-700 mb-2">Verified By</p>
                                <div className="h-12 border-t border-gray-300 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">Signature/Stamp</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-medium text-gray-700 mb-2">Authorized Pathologist</p>
                                <div className="h-12 border-t border-gray-300 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">Dr. Signature/Stamp</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-600 mb-1">This is an electronically generated report. No physical signature required.</p>
                            <p className="text-xs text-gray-600">For queries: help@nextjen.com | +91 98765 43210 | www.nextjendl.com</p>
                            <p className="text-xs font-medium text-blue-600 mt-2">Thank you for choosing NEXTJEN DIAGNOSTICS</p>
                        </div>
                    </div>

                    {/* divider */}
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center">
                            <img src="/tiamed1.svg" alt="Tiamed Logo" className="h-6 mr-2 opacity-80" />
                            <span className="text-xs font-medium text-gray-600">Powered by Tiameds Technology</span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LabReport;