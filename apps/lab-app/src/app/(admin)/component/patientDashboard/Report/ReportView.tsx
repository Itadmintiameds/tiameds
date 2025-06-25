// import Loader from "@/app/(admin)/component/common/Loader";
// import { useLabs } from "@/context/LabContext";
// import { PatientData } from "@/types/sample/sample";
// import { Button } from "@headlessui/react";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import { useEffect, useRef, useState } from "react";
// import { FaPrint } from "react-icons/fa";
// import { getReportData } from "../../../../../../services/reportServices";

// interface Report {
//     reportId: number;
//     id?: string;
//     visitId: number;
//     visit_id?: string;
//     testName: string;
//     testCategory: string;
//     labId: number;
//     patientName?: string;
//     referenceDescription: string;
//     referenceRange: string;
//     referenceAgeRange?: string;
//     referenceDataAge?: string;
//     enteredValue: string;
//     unit: string;
//     createdBy: number;
//     updatedBy: number;
//     createdAt: string;
//     updatedAt: string;
// }

// interface ReportViewProps {
//     viewReportDetailsbyId: number;
//     viewPatient: PatientData;
// }

// const A4_WIDTH = 210; // mm
// // const A4_HEIGHT = 297; // mm

// const ReportView = ({ viewReportDetailsbyId, viewPatient }: ReportViewProps) => {
//     const { currentLab } = useLabs();
//     const [reports, setReports] = useState<Report[]>([]);
//     const [loading, setLoading] = useState(false);
//     const reportRefs = useRef<(HTMLDivElement | null)[]>([]);
//     // const [sendReportByEmail, setSendReportByEmail] = useState(false);

//     console.log("viewPatient", viewPatient);

//     useEffect(() => {
//         if (!currentLab?.id || !viewReportDetailsbyId) return;

//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const response = await getReportData(currentLab.id.toString(), viewReportDetailsbyId.toString());
//                 console.log("Fetched report data:", response);
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

//         pdf.output('dataurlnewwindow');
//     };

//     if (loading) return <Loader type="progress" fullScreen={false} text="Loading report data..." />;

//     const groupedReports = reports.reduce((acc: Record<string, Report[]>, report) => {
//         if (!acc[report.testName]) {
//             acc[report.testName] = [];
//         }
//         acc[report.testName].push(report);
//         return acc;
//     }, {});


//     function calculateAge(dateOfBirth: string): string {
//         const dob = new Date(dateOfBirth);
//         const today = new Date();
//         let age = today.getFullYear() - dob.getFullYear();
//         const monthDiff = today.getMonth() - dob.getMonth();
//         if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
//             age--;
//         }
//         return age.toString();
//     }


//     return (
//         <div className="">
//             {/* Action Buttons */}
//             <div className="flex justify-between items-center mb-4 print:hidden">
//                 <div className="text-sm text-gray-600">
//                     {Object.keys(groupedReports).length} page report
//                 </div>
//                 <div className="flex gap-2">
//                     <Button
//                         onClick={printAllReports}
//                         className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 "
//                     >
//                         <FaPrint className="text-lg" />
//                         Print All
//                     </Button>

//                 </div>
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
//                                 <h1 className="text-2xl font-bold text-blue-800">{currentLab?.name || ''}</h1>
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
//                     <div className="grid grid-cols-4 gap-4 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
//                         {/* Patient Name & Contact */}
//                         <div className="space-y-1">
//                             <p className="font-medium text-blue-700">Patient Name</p>
//                             <p className="font-semibold text-gray-800">{viewPatient?.patientname || 'N/A'}</p>
//                             <p className="font-semibold text-gray-800 text-xs">{viewPatient?.contactNumber || 'N/A'}</p>
//                         </div>

//                         {/* Demographics - Compact */}
//                         <div className="space-y-1">
//                             <p className="font-medium text-blue-700">Age /Gender</p>
//                             <div className="flex gap-2">
//                                 <p className="font-semibold text-gray-800">{calculateAge(viewPatient?.dateOfBirth ?? '') || 'N/A'}</p>
//                                 <span className="text-gray-400">|</span>
//                                 <p className="font-semibold text-gray-800">{viewPatient?.gender || 'N/A'}</p>
//                             </div>
//                         </div>

//                         {/* Physician Info */}
//                         <div className="space-y-1">
//                             <p className="font-medium text-blue-700">Referred By</p>
//                             <p className="font-semibold text-gray-800">DR. SELF</p>

//                         </div>

//                         {/* Status & Visit Info */}
//                         <div className="space-y-1">
//                             <div>
//                                 <p className="font-medium text-blue-700">Status</p>
//                                  <p className="font-semibold text-gray-800 text-xs">Visit ID: {viewPatient?.visitId || 'N/A'}</p>
//                                 <p className="font-semibold text-gray-800 text-xs">Visit Status: {viewPatient?.visitStatus || 'N/A'}</p>
//                                 <p className="font-semibold text-gray-800 text-xs">Visit Type: {viewPatient?.visitType || 'N/A'}</p>
//                                 <p className="font-semibold text-gray-800 text-xs">Visit Date: {viewPatient?.visitDate|| 'N/A'}</p>
//                             </div>

//                             {viewPatient?.sampleNames?.length > 0 && (
//                                 <div>
//                                     <p className="font-medium text-gray-600">Samples:</p>
//                                     <div className="flex flex-wrap gap-1 mt-1">
//                                         {viewPatient.sampleNames.map((name, idx) => (
//                                             <span
//                                                 key={idx}
//                                                 className="bg-white px-1.5 py-0.5 rounded-full border border-gray-200 text-gray-800 text-xs"
//                                             >
//                                                 {name}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}
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
//                                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${isNormal ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                                                     {isNormal ? 'Normal' : 'Abnormal'}
//                                                 </span>
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Interpretation Notes */}
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

// export default ReportView







import Loader from "@/app/(admin)/component/common/Loader";
import { useLabs } from "@/context/LabContext";
import { PatientData } from "@/types/sample/sample";
import { Button } from "@headlessui/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { FaPrint } from "react-icons/fa";
import { getReportData } from "../../../../../../services/reportServices";

interface Report {
    reportId: number;
    id?: string;
    visitId: number;
    visit_id?: string;
    testName: string;
    testCategory: string;
    labId: number;
    patientName?: string;
    referenceDescription: string;
    referenceRange: string;
    referenceAgeRange?: string;
    referenceDataAge?: string;
    enteredValue: string;
    unit: string;
    createdBy: number;
    updatedBy: number;
    createdAt: string;
    updatedAt: string;
}

interface ReportViewProps {
    viewReportDetailsbyId: number;
    viewPatient: PatientData;
}

const A4_WIDTH = 210; // mm
const A4_HEIGHT = 297; // mm

const ReportView = ({ viewReportDetailsbyId, viewPatient }: ReportViewProps) => {
    const { currentLab } = useLabs();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!currentLab?.id || !viewReportDetailsbyId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getReportData(currentLab.id.toString(), viewReportDetailsbyId.toString());
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

        setLoading(true);

        try {
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

            const imgWidth = A4_WIDTH - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

            const pdfBlob = pdf.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');

        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader type="progress" fullScreen={false} text="Loading report data..." />;

    const groupedReports = reports.reduce((acc: Record<string, Report[]>, report) => {
        if (!acc[report.testName]) {
            acc[report.testName] = [];
        }
        acc[report.testName].push(report);
        return acc;
    }, {});

    function calculateAge(dateOfBirth: string): string {
        if (!dateOfBirth) return 'N/A';
        const dob = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age.toString();
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-4 print:hidden">
                <div className="text-sm text-gray-600">
                    {Object.keys(groupedReports).length} tests found
                </div>
                <Button
                    onClick={printReport}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <FaPrint className="text-lg" />
                    {loading ? 'Generating PDF...' : 'Print Report'}
                </Button>
            </div>

            {/* Report Container */}
            <div
                ref={reportRef}
                className="bg-white p-8 border border-gray-200 rounded-lg mb-6 shadow-sm"
                style={{
                    width: `${A4_WIDTH}mm`,
                    minHeight: `${A4_HEIGHT}mm`,
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
                            <h1 className="text-2xl font-bold text-blue-800">{currentLab?.name || 'DIAGNOSTIC LAB'}</h1>
                            <p className="text-xs text-gray-600 mt-1">Accredited by NABL | ISO 15189:2012 Certified</p>
                        </div>
                    </div>
                    <div className="text-right bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-blue-700">Patient ID: <span className="font-bold">{viewPatient?.visitId || 'N/A'}</span></p>
                        <p className="text-xs font-medium text-blue-700">Date: <span className="font-bold">{new Date().toLocaleDateString()}</span></p>
                        <p className="text-xs font-medium text-blue-700">Type: <span className="font-bold">{viewPatient?.visitType}</span></p>
                        <p className="text-xs font-medium text-blue-700">Statu: <span className="font-bold">{viewPatient?.visitStatus}</span></p>
                    </div>
                </div>

                {/* Patient Info */}
                <div className="grid grid-cols-4 gap-4 mb-8 bg-blue-50 p-4 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-blue-800">Patient Name</p>
                        <p className="font-semibold text-gray-900">{viewPatient?.patientname || 'N/A'}</p>
                        <p className="text-xs text-gray-600 mt-1">{viewPatient?.contactNumber || ''}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-blue-800">Age/Gender</p>
                        <p className="font-semibold text-gray-900">
                            {calculateAge(viewPatient?.dateOfBirth || '')} / {viewPatient?.gender || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-blue-800">Referred By</p>
                        <p className="font-semibold text-gray-900">DR. SELF</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-blue-800">Visit Date</p>
                        <p className="font-semibold text-gray-900">{viewPatient?.visitDate || 'N/A'}</p>
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
                                {testResults.map((param, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                                        <td className="p-3 border-b border-gray-100 font-medium">{param.referenceDescription}</td>
                                        <td className="p-3 border-b border-gray-100 font-bold">{param.enteredValue}</td>
                                        <td className="p-3 border-b border-gray-100">{param.unit}</td>
                                        <td className="p-3 border-b border-gray-100">{param.referenceRange}</td>
                                    </tr>
                                ))}
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
                        <p className="text-xs font-medium text-blue-600 mt-2">Thank you for choosing {currentLab?.name || 'OUR LAB'}</p>
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

export default ReportView;