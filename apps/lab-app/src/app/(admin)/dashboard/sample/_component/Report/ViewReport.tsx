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
// // const A4_HEIGHT = 297; // mm

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

//         // Open PDF in new tab instead of downloading
//         pdf.output('dataurlnewwindow');
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
//                     Prin Reports
//                 </button>
//             </div>

//             {/* Report Pages */}
//             {Object.entries(groupedReports).map(([testName, testResults], index) => (
//                 <div
//                     key={index}
//                     ref={el => { reportRefs.current[index] = el; }}
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
// // const A4_HEIGHT = 297; // mm

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

//         // Open PDF in new tab instead of downloading
//         pdf.output('dataurlnewwindow');
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
//                     Prin Reports
//                 </button>
//             </div>

//             {/* Report Pages */}
//             {Object.entries(groupedReports).map(([testName, testResults], index) => (
//                 <div
//                     key={index}
//                     ref={el => { reportRefs.current[index] = el; }}
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
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {testResults.map((param, idx) => {
//                                     // You should implement your actual range checking logic here
//                                     const isOutOfRange = false; // Replace with actual range check
//                                     return (
//                                         <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
//                                             <td className="p-3 border-b border-gray-100 font-medium">{param.referenceDescription}</td>
//                                             <td className={`p-3 border-b border-gray-100 ${isOutOfRange ? 'font-bold text-red-600' : ''}`}>
//                                                 {param.enteredValue}
//                                             </td>
//                                             <td className="p-3 border-b border-gray-100">{param.unit}</td>
//                                             <td className="p-3 border-b border-gray-100">{param.referenceRange}</td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Footer */}
//                     <div className="mt-auto pt-6 border-t border-gray-200">
//                         <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
//                             <div className="text-center">
//                                 <p className="text-xs font-medium text-gray-700 mb-2">Lab Technician</p>
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
//     const reportRef = useRef<HTMLDivElement>(null);

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

//     const printReport = async () => {
//         if (!reportRef.current) return;

//         // Show loading state
//         setLoading(true);
        
//         try {
//             // Create a clone of the report element for printing
//             const printElement = reportRef.current.cloneNode(true) as HTMLDivElement;
//             printElement.style.position = 'absolute';
//             printElement.style.left = '-9999px';
//             document.body.appendChild(printElement);

//             const canvas = await html2canvas(printElement, {
//                 scale: 2, // Higher quality
//                 logging: false,
//                 useCORS: true,
//                 allowTaint: true,
//                 scrollX: 0,
//                 scrollY: 0,
//                 windowWidth: printElement.scrollWidth,
//                 windowHeight: printElement.scrollHeight
//             });

//             document.body.removeChild(printElement);

//             const imgData = canvas.toDataURL('image/png');
//             const pdf = new jsPDF('p', 'mm', 'a4');
            
//             // Calculate dimensions to fit the page
//             const imgWidth = A4_WIDTH - 20;
//             const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
//             // Add image to PDF
//             pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            
//             // Open PDF in new tab
//             const pdfBlob = pdf.output('blob');
//             const pdfUrl = URL.createObjectURL(pdfBlob);
//             window.open(pdfUrl, '_blank');
            
//         } catch (error) {
//             console.error('Error generating PDF:', error);
//         } finally {
//             setLoading(false);
//         }
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
//                     {Object.keys(groupedReports).length} tests found
//                 </div>
//                 <button
//                     onClick={printReport}
//                     disabled={loading}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
//                 >
//                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
//                     </svg>
//                     {loading ? 'Generating PDF...' : 'Print Report'}
//                 </button>
//             </div>

//             {/* Report Container */}
//             <div
//                 ref={reportRef}
//                 className="bg-white p-8 border border-gray-200 rounded-lg mb-6 shadow-sm"
//                 style={{
//                     width: '210mm',
//                     minHeight: '297mm',
//                 }}
//             >
//                 {/* Watermark Background */}
//                 <div className="absolute inset-0 opacity-5 pointer-events-none">
//                     <div className="h-full w-full bg-[url('/tiamed1.svg')] bg-center bg-no-repeat bg-contain"></div>
//                 </div>

//                 {/* Header */}
//                 <div className="flex justify-between items-start border-b border-blue-100 pb-6 mb-6">
//                     <div className="flex items-center">
//                         <img src="/tiamed1.svg" alt="Lab Logo" className="h-14 mr-4" />
//                         <div>
//                             <h1 className="text-2xl font-bold text-blue-800">NEXTJEN DIAGNOSTICS</h1>
//                             <p className="text-xs text-gray-600 mt-1">Accredited by NABL | ISO 15189:2012 Certified</p>
//                         </div>
//                     </div>
//                     <div className="text-right bg-blue-50 p-3 rounded-lg">
//                         <p className="text-xs font-medium text-blue-700">Report ID: <span className="font-bold">{viewPatient?.visitId || 'N/A'}</span></p>
//                         <p className="text-xs font-medium text-blue-700">Date: <span className="font-bold">{new Date().toLocaleDateString()}</span></p>
//                     </div>
//                 </div>

//                 {/* Patient Info */}
//                 <div className="grid grid-cols-3 gap-4 mb-8 bg-blue-50 p-4 rounded-lg">
//                     <div>
//                         <p className="text-sm font-medium text-blue-800">Patient Name</p>
//                         <p className="text-lg font-semibold text-gray-900">{viewPatient?.patientname || 'N/A'}</p>
//                     </div>
//                     <div>
//                         <p className="text-sm font-medium text-blue-800">Age/Gender</p>
//                         <p className="text-lg font-semibold text-gray-900">35 / Male</p>
//                     </div>
//                     <div>
//                         <p className="text-sm font-medium text-blue-800">Referred By</p>
//                         <p className="text-lg font-semibold text-gray-900">DR. SELF</p>
//                     </div>
//                 </div>

//                 {/* All Test Results */}
//                 {Object.entries(groupedReports).map(([testName, testResults], index) => (
//                     <div key={index} className="mb-8">
//                         {/* Test Header */}
//                         <div className="mb-4">
//                             <h2 className="text-xl font-bold text-blue-800 mb-2">{testName}</h2>
//                             <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-100 rounded-full"></div>
//                         </div>

//                         {/* Test Results Table */}
//                         <table className="w-full text-sm mb-6">
//                             <thead>
//                                 <tr className="bg-blue-600 text-white">
//                                     <th className="text-left p-3 font-medium">Parameter</th>
//                                     <th className="text-left p-3 font-medium">Value</th>
//                                     <th className="text-left p-3 font-medium">Unit</th>
//                                     <th className="text-left p-3 font-medium">Reference Range</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {testResults.map((param, idx) => {
//                                     // Implement your actual range checking logic here
//                                     const isOutOfRange = false; // Replace with actual range check
//                                     return (
//                                         <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
//                                             <td className="p-3 border-b border-gray-100 font-medium">{param.referenceDescription}</td>
//                                             <td className={`p-3 border-b border-gray-100 ${isOutOfRange ? 'font-bold text-red-600' : ''}`}>
//                                                 {param.enteredValue}
//                                             </td>
//                                             <td className="p-3 border-b border-gray-100">{param.unit}</td>
//                                             <td className="p-3 border-b border-gray-100">{param.referenceRange}</td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>
//                 ))}

//                 {/* Footer */}
//                 <div className="mt-auto pt-6 border-t border-gray-200">
//                     <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
//                         <div className="text-center">
//                             <p className="text-xs font-medium text-gray-700 mb-2">Lab Technician</p>
//                             <div className="h-12 border-t border-gray-300 flex items-center justify-center">
//                                 <span className="text-xs text-gray-500">Signature/Stamp</span>
//                             </div>
//                         </div>
//                         <div className="text-center">
//                             <p className="text-xs font-medium text-gray-700 mb-2">Authorized Pathologist</p>
//                             <div className="h-12 border-t border-gray-300 flex items-center justify-center">
//                                 <span className="text-xs text-gray-500">Dr. Signature/Stamp</span>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="mt-4 text-center">
//                         <p className="text-xs text-gray-600 mb-1">This is an electronically generated report. No physical signature required.</p>
//                         <p className="text-xs text-gray-600">For queries: help@nextjen.com | +91 98765 43210 | www.nextjendl.com</p>
//                         <p className="text-xs font-medium text-blue-600 mt-2">Thank you for choosing NEXTJEN DIAGNOSTICS</p>
//                     </div>
//                 </div>

//                 {/* divider */}
//                 <div className="flex justify-between items-center mt-4">
//                     <div className="flex items-center">
//                         <img src="/tiamed1.svg" alt="Tiamed Logo" className="h-6 mr-2 opacity-80" />
//                         <span className="text-xs font-medium text-gray-600">Powered by Tiameds Technology</span>
//                     </div>
//                     <div className="text-right">
//                         <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleString()}</p>
//                     </div>
//                 </div>
//             </div>
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
    const reportRef = useRef<HTMLDivElement>(null);

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

    const printReport = async () => {
        if (!reportRef.current) return;

        // Show loading state
        setLoading(true);
        
        try {
            // Create a clone of the report element for printing
            const printElement = reportRef.current.cloneNode(true) as HTMLDivElement;
            printElement.style.position = 'absolute';
            printElement.style.left = '-9999px';
            document.body.appendChild(printElement);

            const canvas = await html2canvas(printElement, {
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            document.body.removeChild(printElement);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Calculate dimensions to fit the page
            const imgWidth = A4_WIDTH - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Add image to PDF
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            
            // Open PDF in new tab
            const pdfBlob = pdf.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setLoading(false);
        }
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
                    {Object.keys(groupedReports).length} tests found
                </div>
                <button
                    onClick={printReport}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    {loading ? 'Generating PDF...' : 'Print Report'}
                </button>
            </div>

            {/* Report Container */}
            <div
                ref={reportRef}
                className="bg-white p-8 border border-gray-200 rounded-lg mb-6 shadow-sm"
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

                {/* All Test Results */}
                {Object.entries(groupedReports).map(([testName, testResults], index) => (
                    <div key={index} className="mb-8">
                        {/* Test Header */}
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-blue-800 mb-2">{testName}</h2>
                            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-100 rounded-full"></div>
                        </div>

                        {/* Test Results Table */}
                        <table className="w-full text-sm mb-6">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="text-left p-3 font-medium">Parameter</th>
                                    <th className="text-left p-3 font-medium">Value</th>
                                    <th className="text-left p-3 font-medium">Unit</th>
                                    <th className="text-left p-3 font-medium">Reference Range</th>
                                </tr>
                            </thead>
                            <tbody>
                                {testResults.map((param, idx) => {
                                    // Implement your actual range checking logic here
                                    const isOutOfRange = false; // Replace with actual range check
                                    return (
                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                                            <td className="p-3 border-b border-gray-100 font-medium">{param.referenceDescription}</td>
                                            <td className={`p-3 border-b border-gray-100 ${isOutOfRange ? 'font-bold text-red-600' : ''}`}>
                                                {param.enteredValue}
                                            </td>
                                            <td className="p-3 border-b border-gray-100">{param.unit}</td>
                                            <td className="p-3 border-b border-gray-100">{param.referenceRange}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}

                {/* Footer */}
                <div className="mt-auto pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                        <div className="text-center">
                            <p className="text-xs font-medium text-gray-700 mb-2">Lab Technician</p>
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
        </div>
    );
};

export default LabReport;