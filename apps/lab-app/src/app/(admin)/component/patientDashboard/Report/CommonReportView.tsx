import { useRef, useState, useEffect } from "react";
import { useLabs } from "@/context/LabContext";
import { PatientData } from "@/types/sample/sample";
import {  formatAgeForDisplay } from "@/utils/ageUtils";
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
    description?: string;
}

interface CommonReportViewProps {
    visitId: number;
    patientData: PatientData;
    doctorName?: string;
    hidePrintButton?: boolean;
}

const A4_WIDTH = 210; // mm

const CommonReportView = ({ visitId, patientData, doctorName, hidePrintButton = false }: CommonReportViewProps) => {
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
                        // Handle doctor data fetch error
                    }
                }
                
                if (Array.isArray(response)) {
                    setReports(response);
                } else {
                    setReports([]);
                }
            } catch (error) {
                // Handle report data fetch error
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
            // Handle PDF generation error
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
            {/* Print Button - conditionally rendered */}
            {!hidePrintButton && (
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
            )}

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
                                        <span className="text-xs font-bold text-gray-900">{formatAgeForDisplay(patientData?.dateOfBirth || '')} / {patientData?.gender ? patientData.gender.slice(0, 1).toUpperCase() : 'N/A'}</span>
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
                            {Object.entries(groupedReports).map(([testName, testResults], testIndex) => {
                                const isCBCTest = testName.toUpperCase().includes('CBC') || testName.toUpperCase().includes('COMPLETE BLOOD COUNT');
                                
                                return (
                                <div key={testIndex} className="mb-8">
                                    {/* Test Name Heading */}
                                    <div className="mb-2">
                                        <h3 className="text-xs font-bold text-left text-gray-800">{testName.toUpperCase()}</h3>
                                    </div>

                                        {/* CBC Differential Count Section removed as per requirement */}

                                                                         {/* Test Results Table */}
                                     <table className="w-full text-xs border border-gray-300">
                                         <thead>
                                             <tr className="bg-gray-100">
                                                 <th className={`p-2 font-bold border border-gray-300 text-xs ${testResults.some(p => p.referenceDescription?.toUpperCase() === 'RADIOLOGY_TEST') ? 'w-2/3 text-left' : 'text-left'}`}>TEST PARAMETER</th>
                                                 <th className={`p-2 font-bold border border-gray-300 text-xs ${testResults.some(p => p.referenceDescription?.toUpperCase() === 'RADIOLOGY_TEST') ? 'w-1/3 text-center' : 'text-center'}`}>RESULT</th>
                                                {/* Show DESCRIPTION column for tests with DROPDOWN WITH DESCRIPTION fields */}
                                                {testResults.some(param => {
                                                    const fieldType = param.referenceDescription?.toUpperCase() || '';
                                                    return fieldType.includes('DROPDOWN WITH DESCRIPTION');
                                                }) && (
                                                    <th className="text-center p-2 font-bold border border-gray-300 text-xs">DESCRIPTION</th>
                                                )}
                                                                                                 {/* Conditionally show REFERENCE RANGE column - hide for radiology tests */}
                                                 {testResults.some(param => {
                                                     const fieldType = param.referenceDescription?.toUpperCase() || '';
                                                     // Don't show REFERENCE RANGE for radiology tests
                                                     if (fieldType === 'RADIOLOGY_TEST') return false;
                                                     return !fieldType.includes('DROPDOWN') && !fieldType.includes('DESCRIPTION');
                                                 }) && (
                                                     <th className="text-center p-2 font-bold border border-gray-300 text-xs">REFERENCE RANGE</th>
                                                 )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {testResults.map((param, idx) => {
                                                const hasNoDescription = !param.referenceDescription ||
                                                    param.referenceDescription === "No reference description available";

                                                // Determine field type based on referenceDescription
                                                const fieldType = param.referenceDescription?.toUpperCase() || '';
                                                const isDescriptionField = fieldType === 'DESCRIPTION';
                                                const isDropdownField = fieldType.includes('DROPDOWN');
                                                const isDropdownWithDescription = fieldType.includes('DROPDOWN WITH DESCRIPTION');

                                                                                                 // Get the actual test parameter name (remove field type prefixes)
                                                 const getTestParameterName = () => {
                                                     // For radiology tests, show the test name itself
                                                     if (fieldType === 'RADIOLOGY_TEST') {
                                                         return param.testName;
                                                     }

                                                    if (isDescriptionField) {
                                                        return param.referenceDescription || 'Description';
                                                    }
                                                    
                                                    if (isDropdownWithDescription) {
                                                        // Remove "DROPDOWN WITH DESCRIPTION-" prefix to get actual test name
                                                        const prefix = 'DROPDOWN WITH DESCRIPTION-';
                                                        if (fieldType.startsWith(prefix)) {
                                                            return fieldType.substring(prefix.length).replace(/-/g, ' ');
                                                        }
                                                        return param.referenceDescription || 'Test Parameter';
                                                    }
                                                    
                                    if (isDropdownField) {
                                        // Remove "DROPDOWN-" prefix to get actual test name
                                        const prefix = 'DROPDOWN-';
                                        if (fieldType.startsWith(prefix)) {
                                            return fieldType.substring(prefix.length).replace(/-/g, ' ');
                                        }
                                        return param.referenceDescription || 'Test Parameter';
                                    }
                                    
                                    // For other fields, show as is
                                    return param.referenceDescription || 'Test Parameter';
                                };

                                // Format the result based on field type
                                const formatResult = () => {
                                    // For radiology tests, show clean result
                                    if (fieldType === 'RADIOLOGY_TEST') {
                                        return (
                                            <div className="text-center">
                                                <div className="font-medium">Hard copy will be provided</div>
                                            </div>
                                        );
                                    }

                                    if (isDescriptionField) {
                                        return (
                                            <div className="text-center">
                                                <div className="font-medium">{param.description || 'N/A'}</div>
                                            </div>
                                        );
                                    }
                                    
                                    if (isDropdownWithDescription) {
                                        return (
                                            <div className="text-center">
                                                <div className="font-medium">{param.enteredValue || 'N/A'}</div>
                                            </div>
                                        );
                                    }
                                    
                                    if (isDropdownField) {
                                        return (
                                            <div className="text-center">
                                                <div className="font-medium">{param.enteredValue || 'N/A'}</div>
                                            </div>
                                        );
                                    }
                                    
                                    // For numeric/other fields
                                    return (
                                        <div className="text-center">
                                            <span className="font-medium">{param.enteredValue || 'N/A'}</span>
                                        </div>
                                    );
                                };

                                // Determine if result is out of range (for numeric fields only)
                                // const isOutOfRange = (() => {
                                //     if (isDescriptionField || isDropdownField) return false;
                                    
                                //     const value = parseFloat(param.enteredValue);
                                //     if (isNaN(value)) return false;
                                    
                                //     const range = param.referenceRange;
                                //     if (!range) return false;
                                    
                                //     // Simple range check
                                //     const rangeMatch = range.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
                                //     if (rangeMatch) {
                                //         const min = parseFloat(rangeMatch[1]);
                                //         const max = parseFloat(rangeMatch[2]);
                                //         return value < min || value > max;
                                //     }
                                    
                                //     return false;
                                // })();

                                const hasDescriptionAny = testResults.some(p => (p.referenceDescription?.toUpperCase() || '').includes('DROPDOWN WITH DESCRIPTION'));
                                const hasReferenceRangeAny = testResults.some(p => {
                                    const ft = p.referenceDescription?.toUpperCase() || '';
                                    // Don't count radiology tests for reference range column
                                    if (ft === 'RADIOLOGY_TEST') return false;
                                    return !ft.includes('DROPDOWN') && !ft.includes('DESCRIPTION');
                                });
                                const colSpanTotal = 2 + (hasDescriptionAny ? 1 : 0) + (hasReferenceRangeAny ? 1 : 0);
                                const shouldInsertDiffHeading = isCBCTest && (((param.referenceDescription?.toUpperCase() || '').includes('TOTAL W.B.C')) || idx === 1);

                                                return (
                                    <>
                                        <tr key={`row-${idx}`} className="border-b border-gray-300">
                                                                                         <td className={`p-2 border-r border-gray-300 font-medium text-xs ${testResults.some(p => p.referenceDescription?.toUpperCase() === 'RADIOLOGY_TEST') ? 'w-2/3' : ''}`}>
                                                             {hasNoDescription ? (
                                                                 <div className="flex items-center text-yellow-700">
                                                                     <TbAlertTriangle className="mr-1" />
                                                                     <span>Parameter not specified</span>
                                                                 </div>
                                                             ) : (
                                                     getTestParameterName()
                                                             )}
                                                         </td>
                                             <td className={`p-2 text-center text-xs ${testResults.some(p => p.referenceDescription?.toUpperCase() === 'RADIOLOGY_TEST') ? 'w-1/3' : ''}`}>
                                                 {formatResult()}
                                             </td>
                                            {testResults.some(param => {
                                                const fieldType = param.referenceDescription?.toUpperCase() || '';
                                                return fieldType.includes('DROPDOWN WITH DESCRIPTION');
                                            }) && (
                                                <td className="p-2 text-center text-xs border-l border-gray-300">
                                                    {isDropdownWithDescription ? (param.description || 'N/A') : 'N/A'}
                                                </td>
                                            )}
                                                                                         {testResults.some(param => {
                                                 const fieldType = param.referenceDescription?.toUpperCase() || '';
                                                 // Don't show REFERENCE RANGE for radiology tests
                                                 if (fieldType === 'RADIOLOGY_TEST') return false;
                                                 return !fieldType.includes('DROPDOWN') && !fieldType.includes('DESCRIPTION');
                                             }) && (
                                                 <td className="p-2 text-center text-xs border-l border-gray-300">
                                                     {param.referenceRange || 'N/A'}
                                                         </td>
                                             )}
                                        </tr>
                                        {shouldInsertDiffHeading && (
                                            <tr key={`diff-heading-${idx}`}>
                                                <td colSpan={colSpanTotal} className="p-2 text-left text-xs font-bold text-blue-800 bg-blue-50 border-t border-b border-blue-200">
                                                    DIFFERENTIAL COUNT
                                                        </td>
                                                    </tr>
                                        )}
                                    </>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )})}
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
                                {/* <p className="text-xs text-gray-600">For queries: help@nextjen.com | +91 98765 43210 | www.nextjendl.com</p> */}
                                <p className="text-xs font-medium text-blue-600 mt-2">Thank you for choosing {currentLab?.name || 'Our Lab'}</p>
                            </div>
                        </div>

                        {/* divider */}
                        <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center">
                                <img src="/tiamed1.svg" alt="Tiamed Logo" className="h-6 mr-2 opacity-80" />
                                <span className="text-xs font-medium text-gray-600">Powered by Tiameds Technologies Pvt.Ltd</span>
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
