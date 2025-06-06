// import Loader from "@/app/(admin)/component/common/Loader";
// import { useLabs } from "@/context/LabContext";
// import { PatientData } from "@/types/sample/sample";
// import { Button } from "@headlessui/react";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import { useEffect, useRef, useState } from "react";
// import { FaCalendarAlt, FaEnvelope, FaPhone, FaUser, FaVenusMars } from "react-icons/fa";
// import { getReportData } from "../../../../../../../services/reportServices";
// import { FaCloudDownloadAlt } from "react-icons/fa";
// import { CiMail } from "react-icons/ci";
// import Loder from "@/app/(admin)/component/common/Loader";
// import {toast} from 'react-toastify';


// interface Report {
//     reportId: number;
//     visitId: number;
//     testName: string;
//     testCategory: string;
//     labId: number;
//     referenceDescription: string;
//     referenceRange: string;
//     referenceDataAge: string;
//     enteredValue: string;
//     unit: string;
//     createdBy: number;
//     updatedBy: number;
//     createdAt: string;
//     updatedAt: string;
// }

// const LabReport = ({ viewPatient }: { viewPatient: PatientData | null }) => {
//     const { currentLab } = useLabs();
//     const [report, setReport] = useState<Report[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const reportRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         if (!currentLab?.id || !viewPatient?.visitId) return;

//         const fetchData = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 const response = await getReportData(currentLab.id.toString(), viewPatient.visitId.toString());
//                 console.log("Fetched report data:", response);
//                 if (Array.isArray(response)) {
//                     setReport(response);
//                 } else {
//                     setError("Invalid response format from server.");
//                 }
//             } catch (err) {
//                 setError("Failed to load report data.");
//                 console.error("Failed to load report data:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [currentLab, viewPatient]);

//     const generatePDF = () => {
//         const input = reportRef.current;
//         if (!input) return;

//         html2canvas(input).then(canvas => {
//             const imgData = canvas.toDataURL("image/png");
//             const pdf = new jsPDF("p", "mm", "a4");
//             const imgWidth = 210;
//             const imgHeight = (canvas.height * imgWidth) / canvas.width;
//             pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
//             pdf.save(`${viewPatient?.patientname || "Lab_Report"}.pdf`);
//         });
//     };

//     const groupedReports = report.reduce((acc: { [key: string]: Report[] }, test) => {
//         if (!acc[test.testName]) {
//             acc[test.testName] = [];
//         }
//         acc[test.testName].push(test);
//         return acc;
//     }, {});

//     if (loading) return <Loader />;

//     const labInfo = {
//         name: currentLab?.name || "Apollo Diagnostics",
//         address: currentLab?.address ? `${currentLab.address}, ${currentLab.city}, ${currentLab.state}` : "123 Health Street, Bengaluru, India",
//         contact: "+91 98765 43210",
//         email: "contact@lab.com",
//         logo: "https://via.placeholder.com/150",
//     };

//     return (
//         <>
//             <div className="flex justify-end my-2">
//                 <Button
//                     onClick={generatePDF}
//                     className="bg-green-600 text-white p-1 text-sm rounded-lg hover:bg-green-800 transition duration-200 ease-in-out flex items-center gap-3"
//                 >
//                     < FaCloudDownloadAlt className="text-lg" /> Download Report
//                 </Button>
//                 <Button
//                     onClick={() => window.print()}
//                     className="bg-blue-600 text-white p-1 text-sm rounded-lg hover:bg-blue-800 transition duration-200 ease-in-out flex items-center gap-3"
//                 >
//                     < CiMail className="text-lg" /> Mail Report
//                 </Button>
//             </div>
//             <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg border rounded-md max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible" ref={reportRef}>
//                 <div className="flex justify-between items-center border-b pb-4">
//                     <div>
//                         <h1 className="text-2xl font-bold text-blue-600">{labInfo.name}</h1>
//                         <p className="text-sm text-gray-600">{labInfo.address}</p>
//                         <p className="text-sm text-gray-600">Contact: {labInfo.contact} | {labInfo.email}</p>
//                     </div>
//                     <img src={labInfo.logo} alt="Lab Logo" className="w-20 h-20 rounded-md" />
//                 </div>

//                 <div className="p-4 rounded-lg bg-gray-50 mt-2">
//                     <div className="grid grid-cols-2 gap-1 text-xs">
//                         <div className="flex items-center">
//                             <FaUser className="text-gray-600 mr-2" />
//                             <span className="font-semibold"></span> {viewPatient?.patientname || "N/A"}
//                         </div>
//                         <div className="flex items-center">
//                             <FaCalendarAlt className="text-gray-600 mr-2" />
//                             <span className="font-semibold">DOB</span> {viewPatient?.dateOfBirth || "N/A"}
//                         </div>
//                         <div className="flex items-center">
//                             <FaEnvelope className="text-gray-600 mr-2" />
//                             <span className="font-semibold"></span> {viewPatient?.email || "N/A"}
//                         </div>
//                         <div className="flex items-center">
//                             <FaVenusMars className="text-gray-600 mr-2" />
//                             <span className="font-semibold"></span> {viewPatient?.gender || "N/A"}
//                         </div>
//                         <div className="flex items-center">
//                             <FaPhone className="text-gray-600 mr-2" />
//                             <span className="font-semibold"></span> {viewPatient?.contactNumber || "N/A"}
//                         </div>
//                     </div>
//                 </div>

//                 {/* test report  */}
//                 <div>
//                     {Object.keys(groupedReports).length > 0 ? (
//                         <div className="mt-6">
//                             <h3 className="text-lg font-semibold bg-blue-50 p-2 rounded-md">Test Reports</h3>
//                             {Object.entries(groupedReports).map(([testName, parameters], index) => (
//                                 <div key={index} className="mt-4">
//                                     <h4 className="text-xs font-bold text-blue-600 border-b pb-2">{testName}</h4>
//                                     <table className="w-full border mt-2 text-xs">
//                                         <thead>
//                                             <tr className="bg-gray-200">
//                                                 <th className="border px-4 py-2 text-left">Parameter</th>
//                                                 <th className="border px-4 py-2 text-left">Result</th>
//                                                 <th className="border px-4 py-2 text-left">Unit</th>
//                                                 <th className="border px-4 py-2 text-left">Reference Range</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {parameters.map((param, idx) => (
//                                                 <tr key={idx} className="hover:bg-gray-100">
//                                                     <td className="border px-4 py-2">{param.referenceDescription}</td>
//                                                     <td className="border px-4 py-2 font-semibold">{param.enteredValue}</td>
//                                                     <td className="border px-4 py-2">{param.unit}</td>
//                                                     <td className="border px-4 py-2">{param.referenceRange}</td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         <p className="text-center text-gray-500 mt-6">No test reports available.</p>
//                     )}
//                 </div>
//             </div>
//         </>
//     );
// };

// export default LabReport;



// =======================================================================================

// import Loader from "@/app/(admin)/component/common/Loader";
// import { useLabs } from "@/context/LabContext";
// import { PatientData } from "@/types/sample/sample";
// import { Button } from "@headlessui/react";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import { useEffect, useRef, useState } from "react";
// import { CiMail } from "react-icons/ci";
// import { FaCalendarAlt, FaCloudDownloadAlt, FaEnvelope, FaSpinner, FaUser, FaWhatsapp } from "react-icons/fa";
// import { toast } from "react-toastify";
// import { getReportData } from "../../../../../../../services/reportServices";


// interface Report {
//     reportId: number;
//     visitId: number;
//     testName: string;
//     testCategory: string;
//     labId: number;
//     referenceDescription: string;
//     referenceRange: string;
//     referenceDataAge: string;
//     enteredValue: string;
//     unit: string;
//     createdBy: number;
//     updatedBy: number;
//     createdAt: string;
//     updatedAt: string;
// }

// const LabReport = ({ viewPatient }: { viewPatient: PatientData | null }) => {
//     const { currentLab } = useLabs();
//     const [report, setReport] = useState<Report[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const reportRef = useRef<HTMLDivElement>(null);
//     const [sendReportByEmail, setSendReportByEmail] = useState(false);

//     useEffect(() => {
//         if (!currentLab?.id || !viewPatient?.visitId) return;
//         const fetchData = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 const response = await getReportData(currentLab.id.toString(), viewPatient.visitId.toString());
//                 console.log("Fetched report data:", response);
//                 if (Array.isArray(response)) {
//                     setReport(response);
//                 } else {
//                     setError("Invalid response format from server.");
//                 }
//             } catch (err) {
//                 setError("Failed to load report data.");
//                 console.error("Failed to load report data:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [currentLab, viewPatient]);

//     const generatePDF = async () => {
//         const input = reportRef.current;
//         if (!input) return;

//         const canvas = await html2canvas(input);
//         const imgData = canvas.toDataURL("image/png");
//         const pdf = new jsPDF("p", "mm", "a4");
//         const imgWidth = 210;
//         const imgHeight = (canvas.height * imgWidth) / canvas.width;
//         pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
//         pdf.save(`${viewPatient?.patientname || "Lab_Report"}.pdf`);
//     };

//     const sendEmailReport = async () => {
//         setSendReportByEmail(true);
//         if (!viewPatient?.email) {
//             toast.error("Patient email not available.");
//             return;
//         }
//         const input = reportRef.current;
//         if (!input) return;

//         try {
//             const canvas = await html2canvas(input);
//             const imgData = canvas.toDataURL("image/png");

//             const pdf = new jsPDF("p", "mm", "a4");
//             const imgWidth = 210;
//             const imgHeight = (canvas.height * imgWidth) / canvas.width;
//             pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

//             const pdfBlob = new Blob([pdf.output("arraybuffer")], { type: "application/pdf" });

//             const formData = new FormData();
//             formData.append("file", pdfBlob, `${viewPatient.patientname || "Lab_Report"}.pdf`);
//             formData.append("email", viewPatient.email);

//             const response = await fetch("/api/sendReport", {
//                 method: "POST",
//                 body: formData,
//             });

//             if (response.ok) {
//                 toast.success("Report emailed successfully!");
//                 setSendReportByEmail(false);
//             } else {
//                 throw new Error("Failed to send email");
//             }
//         } catch (error) {
//             console.error("Error sending email:", error);
//             toast.error("Failed to send report via email.");
//         }
//     };

//     const groupedReports = report.reduce((acc: { [key: string]: Report[] }, test) => {
//         if (!acc[test.testName]) {
//             acc[test.testName] = [];
//         }
//         acc[test.testName].push(test);
//         return acc;
//     }, {});

//     if (loading) return <Loader />;

//     const labInfo = {
//         name: currentLab?.name || "Apollo Diagnostics",
//         address: currentLab?.address ? `${currentLab.address}, ${currentLab.city}, ${currentLab.state}` : "123 Health Street, Bengaluru, India",
//         contact: "+91 98765 43210",
//         email: "contact@lab.com",
//         logo: "https://via.placeholder.com/150",
//     };

//     return (
//         <>
//             <div className="flex gap-2 justify-end my-2">
//                 <Button
//                     onClick={generatePDF}
//                     className="bg-green-600 text-white p-1 text-sm rounded-lg hover:bg-green-800 transition duration-200 ease-in-out flex items-center gap-3"
//                 >
//                     <FaCloudDownloadAlt className="text-lg" />
//                 </Button>
//                 {
//                     sendReportByEmail ? (
//                         <FaSpinner className="animate-spin text-xs text-primary" />
//                     ) : (
//                         <Button
//                             onClick={sendEmailReport}
//                             className="bg-blue-600 text-white p-1 text-sm rounded-lg hover:bg-blue-800 transition duration-200 ease-in-out flex items-center gap-3"
//                         >
//                             <CiMail className="text-lg" />
//                         </Button>
//                     )
//                 }

//                 {/* whatsapp button */}
//                 <Button
//                     onClick={() => window.print()}
//                     className="bg-green-600 text-white p-1 text-sm rounded-lg hover:bg-green-800 transition duration-200 ease-in-out flex items-center gap-3"
//                 >
//                     <FaWhatsapp className="text-lg" />
//                 </Button>
//             </div>
//             <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg border rounded-md max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible" ref={reportRef}>
//                 <div className="flex justify-between items-center border-b pb-4">
//                     <div>
//                         <h1 className="text-2xl font-bold text-blue-600">{labInfo.name}</h1>
//                         <p className="text-sm text-gray-600">{labInfo.address}</p>
//                         <p className="text-sm text-gray-600">Contact: {labInfo.contact} | {labInfo.email}</p>
//                     </div>
//                     <img src={labInfo.logo} alt="Lab Logo" className="w-20 h-20 rounded-md" />
//                 </div>

//                 <div className="p-4 rounded-lg bg-gray-50 mt-2">
//                     <div className="grid grid-cols-2 gap-1 text-xs">
//                         <div className="flex items-center">
//                             <FaUser className="text-gray-600 mr-2" />
//                             <span className="font-semibold">{viewPatient?.patientname || "N/A"}</span>
//                         </div>
//                         <div className="flex items-center">
//                             <FaCalendarAlt className="text-gray-600 mr-2" />
//                             <span className="font-semibold">DOB</span> {viewPatient?.dateOfBirth || "N/A"}
//                         </div>
//                         <div className="flex items-center">
//                             <FaEnvelope className="text-gray-600 mr-2" />
//                             <span className="font-semibold">{viewPatient?.email || "N/A"}</span>
//                         </div>
//                     </div>
//                 </div>

//                 <div>
//                     {Object.keys(groupedReports).length > 0 ? (
//                         <div className="mt-6">
//                             <h3 className="text-lg font-semibold bg-blue-50 p-2 rounded-md">Test Reports</h3>
//                             {Object.entries(groupedReports).map(([testName, parameters], index) => (
//                                 <div key={index} className="mt-4">
//                                     <h4 className="text-xs font-bold text-blue-600 border-b pb-2">{testName}</h4>
//                                     <table className="w-full border mt-2 text-xs">
//                                         <tbody>
//                                             {parameters.map((param, idx) => (
//                                                 <tr key={idx} className="hover:bg-gray-100">
//                                                     <td className="border px-4 py-2">{param.referenceDescription}</td>
//                                                     <td className="border px-4 py-2 font-semibold">{param.enteredValue}</td>
//                                                     <td className="border px-4 py-2">{param.unit}</td>
//                                                     <td className="border px-4 py-2">{param.referenceRange}</td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             ))}
//                         </div>
//                     ) : <p>No test reports available.</p>}
//                 </div>
//             </div>
//         </>
//     );
// };

// export default LabReport;




import Loader from "@/app/(admin)/component/common/Loader";
import { useLabs } from "@/context/LabContext";
// import { PatientData } from "@/types/sample/sample";
import { Button } from "@headlessui/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { CiMail, CiCalendar } from "react-icons/ci";
import { FaCloudDownloadAlt, FaSpinner, FaUser, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import { getReportData } from "../../../../../../../services/reportServices";

interface PatientData  {
    visitId: number;
    patientname: string;
    visitDate: string;
    visitStatus: string;
    sampleNames: string[];
    testIds: number[];
    packageIds: number[];
    contactNumber?: string;
    gender?: string;
    email?: string;
    dateOfBirth?: string;

}

interface Report {
    reportId: number;
    visitId: number;
    testName: string;
    testCategory: string;
    labId: number;
    referenceDescription: string;
    referenceRange: string;
    referenceDataAge?: string;
    enteredValue: string;
    unit: string;
    createdBy: number;
    updatedBy: number;
    createdAt: string;
    updatedAt: string;
}

const LabReport = ({ viewPatient }: { viewPatient: PatientData | null }) => {
    console.log("View Patient:", viewPatient);
    const { currentLab } = useLabs();
    const [report, setReport] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    // const [error, setError] = useState<string | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const [sendReportByEmail, setSendReportByEmail] = useState(false);

    useEffect(() => {
        if (!currentLab?.id || !viewPatient?.visitId) return;
        
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getReportData(currentLab.id.toString(), viewPatient.visitId.toString());
                if (Array.isArray(response)) {
                    setReport(response);
                } else {
                    // setError("Invalid response format");
                }
            } catch (err) {
                // setError("Failed to load report data");
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentLab, viewPatient]);

    const generatePDF = async () => {
        if (!reportRef.current) return;
        
        const canvas = await html2canvas(reportRef.current);
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, (canvas.height * 210) / canvas.width);
        pdf.save(`${viewPatient?.patientname || "Lab_Report"}.pdf`);
    };

    const sendEmailReport = async () => {
        if (!viewPatient?.email) {
            toast.error("Patient email not available");
            return;
        }

        setSendReportByEmail(true);
        try {
            const canvas = await html2canvas(reportRef.current!);
            const pdf = new jsPDF("p", "mm", "a4");
            pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, (canvas.height * 210) / canvas.width);
            
            const response = await fetch("/api/sendReport", {
                method: "POST",
                body: JSON.stringify({
                    email: viewPatient.email,
                    pdf: pdf.output("datauristring"),
                    patientName: viewPatient.patientname
                }),
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) toast.success("Report sent!");
            else throw new Error("Failed to send");
        } catch (error) {
            toast.error("Failed to send email");
            console.error(error);
        } finally {
            setSendReportByEmail(false);
        }
    };

    const groupedReports = report.reduce((acc: Record<string, Report[]>, test) => {
        (acc[test.testName] = acc[test.testName] || []).push(test);
        return acc;
    }, {});

    if (loading) return <Loader />;

    return (
        <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
                <Button
                    onClick={generatePDF}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Download PDF"
                >
                    <FaCloudDownloadAlt className="text-lg" />
                </Button>
                
                <Button
                    onClick={sendEmailReport}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Email Report"
                    disabled={sendReportByEmail}
                >
                    {sendReportByEmail ? <FaSpinner className="animate-spin" /> : <CiMail className="text-lg" />}
                </Button>
                
                <Button
                    onClick={() => window.print()}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Print"
                >
                    <FaWhatsapp className="text-lg" />
                </Button>
            </div>

            {/* Report Content */}
            <div 
                ref={reportRef}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="flex justify-between items-start pb-4 border-b">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{currentLab?.name || "Diagnostic Lab"}</h1>
                        <p className="text-xs text-gray-500">
                            {currentLab?.address}, {currentLab?.city}, {currentLab?.state}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-medium">Report Date: {new Date().toLocaleDateString()}</p>
                        <p className="text-xs">ID: {viewPatient?.visitId || "N/A"}</p>
                    </div>
                </div>

                {/* Patient Info */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span>{viewPatient?.patientname || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CiCalendar className="text-gray-400" />
                        <span>DOB: {viewPatient?.dateOfBirth || "N/A"}</span>
                    </div>
                </div>

                {/* Test Results */}
                <div className="mt-6">
                    {Object.keys(groupedReports).length > 0 ? (
                        Object.entries(groupedReports).map(([testName, parameters], i) => (
                            <div key={i} className="mb-6">
                                <h3 className="font-semibold text-gray-700 border-b pb-1 mb-2">{testName}</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Parameter</th>
                                                <th className="px-3 py-2 text-left">Value</th>
                                                <th className="px-3 py-2 text-left">Unit</th>
                                                <th className="px-3 py-2 text-left">Reference</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parameters.map((param, j) => (
                                                <tr key={j} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="px-3 py-2">{param.referenceDescription}</td>
                                                    <td className="px-3 py-2 font-medium">{param.enteredValue}</td>
                                                    <td className="px-3 py-2">{param.unit}</td>
                                                    <td className="px-3 py-2 text-xs">{param.referenceRange}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">No test results available</p>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t text-xs text-gray-500 text-center">
                    <p>This is an electronically generated report - Signature not required</p>
                    {/* <p className="mt-1">For queries contact: {currentLab?.phone || "N/A"}</p> */}
                </div>
            </div>
        </div>
    );
};

export default LabReport;