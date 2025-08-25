import { useRef, useState, useEffect } from "react";
import { useLabs } from "@/context/LabContext";
import { PatientData } from "@/types/sample/sample";
import { calculateAgeObject } from "@/utils/ageUtils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getReportData } from "../../../../../../services/reportServices";
import { TbInfoCircle, TbAlertTriangle } from "react-icons/tb";
import { toast } from "react-toastify";
import { Doctor } from '@/types/doctor/doctor';
import { doctorGetById } from "../../../../../../services/doctorServices";

interface Report {
    reportId: number;
    testName: string;
    referenceDescription: string;
    referenceRange: string;
    enteredValue: string;
    unit: string;
}

interface CommonReportViewProps {
    visitId: number;
    patientData: PatientData;
    doctorName?: string;
}

const A4_WIDTH = 210; // mm

const CommonReportView = ({ visitId, patientData, doctorName }: CommonReportViewProps) => {
    const { currentLab } = useLabs();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const reportRef = useRef<HTMLDivElement>(null);
    const [doctor, setDoctor] = useState<Doctor>();

    useEffect(() => {
        if (!currentLab?.id || !visitId) return;

        const fetchData = async () => {
            try {
                const response = await getReportData(currentLab.id.toString(), visitId.toString());
                
                // Fetch doctor details if doctorId is present and no doctorName provided
                if (!doctorName && patientData?.doctorId && currentLab.id) {
                    try {
                        const doctorResult = await doctorGetById(currentLab.id.toString(), Number(patientData.doctorId));
                        setDoctor(doctorResult?.data);
                    } catch (error) {
                        console.error("Error fetching doctor data:", error);
                    }
                }
                
                if (Array.isArray(response)) {
                    setReports(response);
                } else {
                    setReports([]);
                }
            } catch (error) {
                console.error("Error fetching report data:", error);
                setReports([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentLab, visitId, patientData, doctorName]);

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
            toast.error("Failed to generate PDF");
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

    // Determine doctor name to display
    const displayDoctorName = doctorName || doctor?.name || 'N/A';

    return (
        <div className="max-w-4xl mx-auto">
            {/* Print Button */}
            <div className="flex justify-between items-center mb-4 print:hidden">
                <div className="text-sm text-gray-600">
                    {reports.length > 0 ? `${Object.keys(groupedReports).length} tests found` : 'No test data available'}
                </div>
                <button
                    onClick={printReport}
                    disabled={loading || reports.length === 0}
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
                {/* Show message if no reports available */}
                {reports.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-20">
                        <TbInfoCircle className="text-blue-500 text-5xl mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No Test Results Available</h3>
                        <p className="text-gray-600 text-center max-w-md">
                            The report data for this visit is not available. This could be because:
                        </p>
                        <ul className="list-disc text-gray-600 mt-2 pl-5 text-left max-w-md">
                            <li>The tests are still being processed</li>
                            <li>Results are provided as hard copies</li>
                            <li>No tests were performed during this visit</li>
                        </ul>
                        <p className="text-gray-600 mt-4 text-center max-w-md">
                            Please check with the lab staff for more information.
                        </p>
                    </div>
                )}

                {/* Only show report content if there are reports */}
                {reports.length > 0 && (
                    <>
                        {/* Header Section */}
                        <div className="flex justify-between items-start mb-6 border-b pb-4">
                            <div className="flex items-center">
                                <div>
                                    <img src="/tiamed1.svg" alt="Lab Logo" className="h-14 mr-4" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-800">MEDICAL DIAGNOSTIC REPORT</h1>
                                    <p className="text-sm text-gray-600">{currentLab?.name || 'DIAGNOSTIC LABORATORY'}</p>
                                </div>
                            </div>
                            <div className="text-right bg-blue-50 p-3 rounded">
                                <p className="text-sm font-medium">Report No: <span className="font-bold">{patientData?.visitId || 'N/A'}</span></p>
                                

                            </div>
                        </div>

                        {/* Header */}
                        <div className="border border-gray-300 p-4 mb-6">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Left Column - Patient Information */}
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <span className="text-xs font-medium text-gray-700 w-24">NAME:</span>
                                        <span className="text-xs font-bold text-gray-900">{patientData?.patientname || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-xs font-medium text-gray-700 w-24">AGE/SEX:</span>
                                        <span className="text-xs font-bold text-gray-900">{patientData?.dateOfBirth ? `${calculateAgeObject(patientData.dateOfBirth).years} Yrs` : 'N/A'} / {patientData?.gender ? patientData.gender.slice(0, 1).toUpperCase() : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-xs font-medium text-gray-700 w-24">REFERRED BY:</span>
                                        <span className="text-xs font-bold text-gray-900">{displayDoctorName}</span>
                                    </div>
                                </div>

                                {/* Right Column - Report Information */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-end">
                                        <span className="text-xs font-medium text-gray-700 w-28 text-right">DATE OF REPORT:</span>
                                        <span className="text-xs font-bold text-gray-900 ml-2">{new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <span className="text-xs font-medium text-gray-700 w-28 text-right">LAB NO.:</span>
                                        <span className="text-xs font-bold text-gray-900 ml-2">{currentLab?.id || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <span className="text-xs font-medium text-gray-700 w-28 text-right">BILL NO.:</span>
                                        <span className="text-xs font-bold text-gray-900 ml-2">{patientData?.visitId || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <span className="text-xs font-medium text-gray-700 w-28 text-right">OPD/IPD:</span>
                                        <span className="text-xs font-bold text-gray-900 ml-2">{patientData?.visitType || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Test Results Tables - Separate for each test */}
                        <div className="mb-6">
                            {Object.entries(groupedReports).map(([testName, testResults], testIndex) => (
                                <div key={testIndex} className="mb-8">
                                    {/* Test Name Heading */}
                                    <div className="mb-2">
                                        <h3 className="text-xs font-bold text-left text-gray-800">{testName.toUpperCase()}</h3>
                                    </div>

                                    {/* Test Results Table */}
                                    <table className="w-full text-xs border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="text-left p-1 font-bold border border-gray-300 text-xs">TEST PARAMETER</th>
                                                <th className="text-center p-1 font-bold border border-gray-300 text-xs">RESULT</th>
                                                <th className="text-right p-1 font-bold border border-gray-300 text-xs">NORMAL RANGE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {testResults.map((param, idx) => {
                                                const hasNoDescription = !param.referenceDescription ||
                                                    param.referenceDescription === "No reference description available";

                                                const isOutOfRange = false; // Replace with actual range check

                                                return (
                                                    <tr key={idx} className="border-b border-gray-300">
                                                        <td className="p-1 border-r border-gray-300 font-medium text-xs">
                                                            {hasNoDescription ? (
                                                                <div className="flex items-center text-yellow-700">
                                                                    <TbAlertTriangle className="mr-1" />
                                                                    <span>Parameter not specified</span>
                                                                </div>
                                                            ) : (
                                                                param.referenceDescription
                                                            )}
                                                        </td>
                                                        <td className={`p-1 text-center border-r border-gray-300 text-xs ${isOutOfRange ? 'font-bold' : ''}`}>
                                                            {param.enteredValue}
                                                        </td>
                                                        <td className="p-1 text-right text-xs">
                                                            {param.referenceRange || ''}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>

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
                    </>
                )}
            </div>
        </div>
    );
};

export default CommonReportView;
