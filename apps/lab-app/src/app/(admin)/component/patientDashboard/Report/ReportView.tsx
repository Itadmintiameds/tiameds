
import Loader from "@/app/(admin)/component/common/Loader";
import { useLabs } from "@/context/LabContext";
import { PatientData } from "@/types/sample/sample";
import { Button } from "@headlessui/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { CiMail, CiCalendar } from "react-icons/ci";
import { FaCloudDownloadAlt, FaSpinner, FaUser, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import { getReportData } from "../../../../../../services/reportServices";

interface Report {
  reportId: number;
  id?: string; // Optional if sometimes present
  visitId: number;
  visit_id?: string; // Alternative to visitId
  testName: string;
  testCategory: string;
  labId: number;
  patientName?: string;
  referenceDescription: string;
  referenceRange: string;
  referenceAgeRange?: string;
  referenceDataAge?: string; // Alternative to referenceAgeRange
  enteredValue: string;
  unit: string;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
}

interface ReportViewProps {
    viewReportDetailsbyId: number;
    viewPatient: PatientData; // Add this line
}

const ReportView = ({ viewReportDetailsbyId, viewPatient }: ReportViewProps) => {
    const { currentLab } = useLabs();
    const [report, setReport] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    // const [error, setError] = useState<string | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const [sendReportByEmail, setSendReportByEmail] = useState(false);

    useEffect(() => {
        if (!currentLab?.id || !viewReportDetailsbyId) return;
        
        const fetchData = async () => {
            setLoading(true);
            // setError(null);
            try {
                const response = await getReportData(currentLab.id.toString(), viewReportDetailsbyId.toString());
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

export default ReportView;


