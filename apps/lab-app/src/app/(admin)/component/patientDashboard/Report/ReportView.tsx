import Loader from "@/app/(admin)/component/common/Loader";
import { useLabs } from "@/context/LabContext";
import { PatientData } from "@/types/sample/sample";
import { Button } from "@headlessui/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { FaPrint, FaExclamationTriangle } from "react-icons/fa";
import { TbInfoCircle } from "react-icons/tb";
import { getReportData } from "../../../../../../services/reportServices";
import { createRoot } from "react-dom/client";
import { Doctor } from '@/types/doctor/doctor';
import { doctorGetById } from "../../../../../../services/doctorServices";
import Image from 'next/image';

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
    doctorId?: number;
}

interface ReportViewProps {
    viewReportDetailsbyId: number;
    viewPatient: PatientData;
}

interface PageParams{
    testName?: string;
    isTestHeader?: boolean;
    isTableHeader?: boolean;
    referenceDescription?: string;
    enteredValue?: string;
    unit?: string;
    referenceRange?: string;
}

const A4_WIDTH = 210; // mm
const A4_HEIGHT = 297; // mm
const PARAMS_PER_PAGE = 12; // Number of parameters per page

const ReportView = ({ viewReportDetailsbyId, viewPatient }: ReportViewProps) => {
    const { currentLab } = useLabs();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const [doctor, setDoctor] = useState<Doctor>();

    useEffect(() => {
        if (!currentLab?.id || !viewReportDetailsbyId) return;


        const fetchData = async () => {
            setLoading(true);
            setHasError(false);
            try {
                const response = await getReportData(currentLab.id.toString(), viewReportDetailsbyId.toString());
                // Fetch doctor details if doctorId is present
                if (viewPatient?.doctorId && currentLab.id) {
                    const doctorResult = await doctorGetById(currentLab.id.toString(), Number(viewPatient.doctorId));
                    setDoctor(doctorResult?.data);
                }
                if (Array.isArray(response)) {
                    setReports(response);
                } else {
                    setReports([]);
                }
            } catch (error) {
                console.error('Error fetching report data:', error);
                setHasError(true);
                setReports([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentLab, viewPatient, viewReportDetailsbyId]);

    const calculateAge = (dateOfBirth?: string): string => {
        if (!dateOfBirth) return 'N/A';
        try {
            const dob = new Date(dateOfBirth);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            return age.toString();
        } catch (e) {
            return 'N/A';
        }
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'N/A';
        }
    };

    const groupReports = () => {
        return reports.reduce((acc: Record<string, Report[]>, report) => {
            if (!acc[report.testName]) {
                acc[report.testName] = [];
            }
            acc[report.testName].push(report);
            return acc;
        }, {});
    };

    const generateReportPages = () => {
        const groupedReports = groupReports();
        const testGroups = Object.entries(groupedReports);
        const pages = [];
        let currentPage = [];
        let currentTest = '';
        let paramsOnCurrentPage = 0;

        for (const [testName, params] of testGroups) {
            // Add test header to current page
            currentPage.push({ testName, isTestHeader: true });
            currentTest = testName;

            // Add table header to current page
            currentPage.push({ isTableHeader: true, testName: currentTest });

            for (const param of params) {
                // If current page is full, push to pages and start new page
                if (paramsOnCurrentPage >= PARAMS_PER_PAGE) {
                    pages.push(currentPage);
                    currentPage = [];
                    paramsOnCurrentPage = 0;

                    // Add test header and table header again for the new page
                    currentPage.push({ testName: currentTest, isTestHeader: true });
                    currentPage.push({ isTableHeader: true, testName: currentTest });
                }

                currentPage.push({ ...param, isTestHeader: false });
                paramsOnCurrentPage++;
            }
        }

        // Add the last page if it has content
        if (currentPage.length > 0) {
            pages.push(currentPage);
        }

        if (pages.length === 0) pages.push([]);
        return pages;
    };


    const renderReportPage = (pageParams: PageParams[], pageNumber: number, totalPages: number) => {
        let currentTest = '';

        return (
            <div
                key={`page-${pageNumber}`}
                className="bg-white p-8 border border-gray-200 rounded-lg mb-6 shadow-sm relative"
                style={{
                    width: `${A4_WIDTH}mm`,
                    minHeight: `${A4_HEIGHT}mm`,
                    pageBreakAfter: pageNumber < totalPages ? 'always' : 'auto'
                }}
            >
                {/* Watermark Background */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="h-full w-full bg-[url('/tiamed1.svg')] bg-center bg-no-repeat bg-contain"></div>
                </div>

                {/* Lab Header - On EVERY page */}
                <div className="flex justify-between items-start border-b border-blue-100 pb-6 mb-6">
                    <div className="flex items-center">
                        <Image src="/tiamed1.svg" alt="Lab Logo" width={56} height={56} className="mr-4" />
                        <div>
                            <h1 className="text-2xl font-bold text-blue-800">{currentLab?.name || 'DIAGNOSTIC LAB'}</h1>
                            <p className="text-xs text-gray-600 mt-1">Accredited by NABL | ISO 15189:2012 Certified</p>
                        </div>
                    </div>
                    <div className="text-right bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-blue-700">Patient ID: <span className="font-bold">{viewPatient?.visitId || 'N/A'}</span></p>
                        <p className="text-xs font-medium text-blue-700">Date: <span className="font-bold">{new Date().toLocaleDateString()}</span></p>
                    </div>
                </div>

                {/* Patient Info - Only on first page */}
                {pageNumber === 1 && (
                    <div className="grid grid-cols-4 gap-4 mb-8 bg-blue-50 p-4 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-blue-800">Patient Name</p>
                            <p className="font-semibold text-gray-900">{viewPatient?.patientname || 'N/A'}</p>
                            <p className="text-xs text-gray-600 mt-1">{viewPatient?.contactNumber || 'Contact not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-800">Age/Gender</p>
                            <p className="font-semibold text-gray-900">
                                {calculateAge(viewPatient?.dateOfBirth)} / {viewPatient?.gender || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-800">Referred By</p>
                            <p className="font-semibold text-gray-900">
                                {doctor?.name || 'DR. SELF'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                {doctor?.phone || 'Contact not provided'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-800">Visit Date</p>
                            <p className="font-semibold text-gray-900">{formatDate(viewPatient?.visitDate)}</p>
                        </div>
                    </div>
                )}

                {/* Test Results */}
                {pageParams.map((item, idx) => {
                    if (item.isTestHeader) {
                        currentTest = item.testName ?? '';
                        return (
                            <div key={`test-${idx}`} className="mb-4">
                                <h2 className="text-xl font-bold text-blue-800 mb-2">{currentTest}</h2>
                                <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-100 rounded-full"></div>
                            </div>
                        );
                    }

                    if (item.isTableHeader) {
                        return (
                            <table key={`table-header-${idx}`} className="w-full text-sm mb-2">
                                <thead>
                                    <tr className="bg-blue-600 text-white">
                                        <th className="text-left p-3 font-medium">Parameter</th>
                                        <th className="text-left p-3 font-medium">Value</th>
                                        <th className="text-left p-3 font-medium">Unit</th>
                                        <th className="text-left p-3 font-medium">Reference Range</th>
                                    </tr>
                                </thead>
                            </table>
                        );
                    }

                    const param = item as Report;
                    const hasNoDescription = !param.referenceDescription ||
                        param.referenceDescription === "No reference description available";
                    const hasNoUnit = !param.unit || param.unit === "N/A";
                    const hasNoReference = !param.referenceRange ||
                        param.referenceRange === "N/A - N/A";

                    return (
                        <table key={`param-${idx}`} className="w-full text-sm mb-2">
                            <tbody>
                                <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                                    <td className="p-3 border-b border-gray-100 font-medium w-1/3">
                                        {hasNoDescription ? (
                                            <div className="flex items-center text-yellow-700">
                                                <FaExclamationTriangle className="mr-2 text-sm" />
                                                <span>Parameter not specified</span>
                                            </div>
                                        ) : (
                                            param.referenceDescription
                                        )}
                                    </td>
                                    <td className="p-3 border-b border-gray-100 font-bold w-1/6">
                                        {param.enteredValue || 'N/A'}
                                    </td>
                                    <td className="p-3 border-b border-gray-100 w-1/6">
                                        {hasNoUnit ? (
                                            <span className="text-gray-500 italic">Not specified</span>
                                        ) : (
                                            param.unit
                                        )}
                                    </td>
                                    <td className="p-3 border-b border-gray-100 w-1/3">
                                        {hasNoReference ? (
                                            <span className="text-gray-500 italic">Not available</span>
                                        ) : (
                                            param.referenceRange
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    );
                })}



                {/* Footer - Only on last page */}
                {pageNumber === totalPages && (
                    <>
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
                                <p className="text-xs text-gray-600">
                                    For queries: {currentLab?.name || 'help@lab.com'} | {currentLab?.address || '+91 XXXXX XXXXX'}
                                </p>
                                <p className="text-xs font-medium text-blue-600 mt-2">
                                    Thank you for choosing {currentLab?.name || 'OUR LABORATORY'}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center">
                                <Image src="/tiamed1.svg" alt="Tiamed Logo" width={24} height={24} className="mr-2 opacity-80" />
                                <span className="text-xs font-medium text-gray-600">Powered by Powered by TiaMeds Technologies Pvt. Ltd</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Page number at the bottom */}
                <div className="mt-4 text-center text-sm text-gray-500">
                    Page {pageNumber} of {totalPages}
                </div>
            </div>
        );
    };

    const renderReportPreview = () => {
        const pages = generateReportPages();
        return pages.map((pageParams, index) =>
            renderReportPage(pageParams, index + 1, pages.length)
        );
    };

    const generatePDF = async (action: 'print' | 'download') => {
        if (!reports.length) return;

        setIsGeneratingPDF(true);
        setError(null);

        try {
            const pages = generateReportPages();
            const pdf = new jsPDF('p', 'mm', 'a4');

            for (let i = 0; i < pages.length; i++) {
                if (i > 0) pdf.addPage();

                const tempDiv = document.createElement('div');
                tempDiv.style.position = 'absolute';
                tempDiv.style.left = '-9999px';
                tempDiv.style.width = '210mm';
                document.body.appendChild(tempDiv);

                await new Promise<void>((resolve) => {
                    const pageElement = renderReportPage(pages[i], i + 1, pages.length);
                    const root = createRoot(tempDiv);
                    root.render(pageElement);

                    setTimeout(async () => {
                        try {
                            const canvas = await html2canvas(tempDiv.firstChild as HTMLElement, {
                                logging: false,
                                useCORS: true,
                                allowTaint: true
                            });

                            const imgData = canvas.toDataURL('image/png');
                            const imgWidth = A4_WIDTH - 20;
                            const imgHeight = (canvas.height * imgWidth) / canvas.width;

                            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
                            document.body.removeChild(tempDiv);
                            resolve();
                        } catch (err) {
                            console.error('Error generating page:', err);
                            document.body.removeChild(tempDiv);
                            resolve();
                        }
                    }, 500);
                });
            }

            if (action === 'print') {
                const pdfBlob = pdf.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);
                const printWindow = window.open(pdfUrl);
                if (printWindow) {
                    printWindow.onload = () => {
                        printWindow.print();
                    };
                }
            } else {
                pdf.save(`report_${viewPatient?.patientname || 'patient'}.pdf`);
            }
        } catch (err) {
            console.error('PDF generation failed:', err);
            setError('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handlePrint = async () => {
        await generatePDF('print');
    };

    // const handleDownloadPDF = async () => {
    //     await generatePDF('download');
    // };

    console.log('Doctor:', doctor); 

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader type="progress" fullScreen={false} text="Loading report data..." />
                <p className="mt-4 text-sm text-gray-500">Please wait while we fetch the report details</p>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 p-6 text-center bg-red-50 rounded-md border border-red-200 shadow-sm">
                <TbInfoCircle className="text-red-500 text-4xl mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Test Results Available</h3>
                <p className="text-gray-600 mb-2 max-w-md">
                    The report data for this patient is not available. This could be because:
                </p>
                <ul className="text-gray-600 text-sm mb-4 list-disc list-inside max-w-md text-left">
                    <li>The tests are still being processed</li>
                    <li>Results are provided as hard copies</li>
                    <li>No tests were performed during this visit</li>
                </ul>
                <p className="text-gray-600 text-sm">
                    Please check with the lab staff for more information.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            Action Buttons
            <div className="flex justify-between items-center mb-4 print:hidden">
                <div className="text-sm text-gray-600">
                    {reports.length > 0 ? `${reports.length} parameters found` : 'No test data available'}
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handlePrint}
                        disabled={loading || !reports.length || isGeneratingPDF}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <FaPrint className="text-lg" />
                        {isGeneratingPDF ? 'Generating...' : 'Print Report'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            {/* Report Container */}
            <div ref={reportRef}>
                {!reports.length ? (
                    <div className="flex flex-col items-center justify-center h-full py-20">
                        <TbInfoCircle className="text-blue-500 text-5xl mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No Test Results Available</h3>
                        <p className="text-gray-600 text-center max-w-md mb-4">
                            The report data for this visit is not available. This could be because:
                        </p>
                        <ul className="list-disc text-gray-600 text-left max-w-md space-y-1 pl-5">
                            <li>The tests are still being processed</li>
                            <li>Results are provided as hard copies</li>
                            <li>No tests were performed during this visit</li>
                        </ul>
                        <p className="text-gray-600 mt-6 text-center max-w-md">
                            Please check with the lab staff for more information.
                        </p>
                    </div>
                ) : (
                    renderReportPreview()
                )}
            </div>
        </div>
     
    );
};
export default ReportView;














