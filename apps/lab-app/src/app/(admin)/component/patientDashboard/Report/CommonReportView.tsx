import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useLabs } from "@/context/LabContext";
import { PatientData } from "@/types/sample/sample";
import { formatAgeForDisplay } from "@/utils/ageUtils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getReportData } from "../../../../../../services/reportServices";
import { TbInfoCircle, TbAlertTriangle } from "react-icons/tb";
import { toast } from "react-toastify";
import { Doctor } from '@/types/doctor/doctor';
import { doctorGetById } from "../../../../../../services/doctorServices";
import { formatMedicalReportToHTML } from "@/utils/reportFormatter";

interface Report {
    reportId: number;
    testName: string;
    referenceDescription: string;
    referenceRange: string;
    enteredValue: string;
    unit: string;
    description?: string;
    reportJson?: string; // detailed report html/json string
    referenceRanges?: string; // json array string with ranges
}

interface DetailedReportSection {
    order?: number;
    title?: string;
    content?: string;
}

interface DetailedReport {
    title?: string;
    description?: string;
    sections?: DetailedReportSection[];
}

const DEFAULT_FONT_FAMILY = '"Inter", "Helvetica Neue", Arial, sans-serif';
const BASE_TEXT_COLOR = '#0f172a';
type Html2CanvasBaseOptions = NonNullable<Parameters<typeof html2canvas>[1]>;
type Html2CanvasEnhancedOptions = Html2CanvasBaseOptions & {
    scale?: number;
    windowWidth?: number;
    windowHeight?: number;
};

interface ReferenceRangeEntry {
    Gender: string;
    AgeMin: string;
    AgeMinUnit: string;
    AgeMax: string;
    AgeMaxUnit: string;
    ReferenceRange: string;
}

const EXCLUDED_FIELD_TYPES = new Set([
    'DROPDOWN',
    'DESCRIPTION',
    'DROPDOWN-COMPATIBLE/INCOMPATIBLE',
    'DROPDOWN-POSITIVE/NEGATIVE',
    'DROPDOWN-PRESENT/ABSENT',
    'DROPDOWN-REACTIVE/NONREACTIVE',
    'DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE',
    'DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT'
]);

const QUALITATIVE_DESCRIPTION_FIELD_TYPES = new Set([
    'DESCRIPTION',
    'DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE',
    'DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT'
]);

const isExcludedQualitativeField = (referenceDescription?: string) => {
    const normalized = (referenceDescription || '').toUpperCase();
    return EXCLUDED_FIELD_TYPES.has(normalized);
};

const shouldShowQualitativeDescription = (referenceDescription?: string) => {
    const normalized = (referenceDescription || '').toUpperCase();
    return QUALITATIVE_DESCRIPTION_FIELD_TYPES.has(normalized);
};

// type PatientDataWithLab = PatientData & { labName?: string };

interface CommonReportViewProps {
    visitId: number;
    patientData: PatientData;
    doctorName?: string;
    hidePrintButton?: boolean;
}

const CommonReportView = ({ visitId, patientData, doctorName, hidePrintButton = false }: CommonReportViewProps) => {
    const { currentLab } = useLabs();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const reportRef = useRef<HTMLDivElement>(null);
    const [doctor, setDoctor] = useState<Doctor>();
    const [selectedTests, setSelectedTests] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!currentLab?.id || !visitId) return;

        const fetchData = async () => {
            try {
                const response = await getReportData(currentLab.id.toString(), visitId.toString());
                console.log(response);
                
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

        const printableTestNames = Object.entries(selectedTests)
            .filter(([, isSelected]) => isSelected)
            .map(([name]) => name);

        if (printableTestNames.length === 0) {
            toast.error('Please select at least one report to print');
            return;
        }

        setLoading(true);

        try {
            const printableTestSet = new Set(printableTestNames);
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
                compress: true,
            });
            const pageWidth = 190; // A4 width minus margins
            const margin = 10;
            const topMargin = 15; // Additional top margin for header
            const sections = Array.from(reportRef.current.querySelectorAll('[data-test-section]'));
            const filteredSections = sections.filter((section) => {
                const testName = section.getAttribute('data-test-name') || '';
                return printableTestSet.has(testName);
            });
            const targetSections = filteredSections;

            if (targetSections.length === 0) {
                toast.error('Selected reports are unavailable for printing');
                return;
            }
            const nativeDpi = window.devicePixelRatio || 1;
            const renderScale = Math.max(2, Math.min(nativeDpi * 1.5, 3));

            const prepareElementForPrint = (element: HTMLElement) => {
                element.style.width = '210mm';
                element.style.minHeight = '297mm';
                element.style.maxWidth = '210mm';
                element.style.margin = '0 auto';
                element.style.boxSizing = 'border-box';
                element.style.backgroundColor = '#ffffff';
                element.style.fontSize = '12px';
                element.style.lineHeight = '1.4';
                element.style.padding = '0';
                element.style.fontFamily = DEFAULT_FONT_FAMILY;
                element.style.color = BASE_TEXT_COLOR;

                const allElements = element.querySelectorAll<HTMLElement>('*');
            allElements.forEach((el) => {
                el.style.backgroundColor = el.style.backgroundColor || 'transparent';
                el.style.color = el.style.color || BASE_TEXT_COLOR;
                el.style.boxSizing = 'border-box';
                el.style.fontFamily = DEFAULT_FONT_FAMILY;
                el.style.fontSize = el.style.fontSize || '12px';
                el.style.lineHeight = el.style.lineHeight || '1.4';
                el.style.textRendering = 'optimizeLegibility';
                el.style.setProperty('-webkit-font-smoothing', 'antialiased');
                el.style.setProperty('moz-osx-font-smoothing', 'grayscale');
            });

                const imageElements = element.querySelectorAll<HTMLImageElement>('img');
                imageElements.forEach((img) => {
                    const src = img.getAttribute('src') || '';
                    if (src.startsWith('/')) {
                        img.setAttribute('src', `${window.location.origin}${src}`);
                    }
                    img.setAttribute('crossorigin', 'anonymous');
                    img.style.objectFit = img.style.objectFit || 'contain';
                });

                const blueDivider = element.querySelector('.h-1.w-full.bg-blue-600');
            if (blueDivider) {
                (blueDivider as HTMLElement).style.backgroundColor = '#2563eb';
                (blueDivider as HTMLElement).style.height = '4px';
                (blueDivider as HTMLElement).style.width = '100%';
                (blueDivider as HTMLElement).style.display = 'block';
            }
            };

            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            tempContainer.style.width = '210mm';
            tempContainer.style.padding = '0';
            tempContainer.style.margin = '0';
            tempContainer.style.backgroundColor = '#ffffff';
            tempContainer.style.fontFamily = DEFAULT_FONT_FAMILY;
            tempContainer.style.color = BASE_TEXT_COLOR;
            document.body.appendChild(tempContainer);

            for (let index = 0; index < targetSections.length; index++) {
                const section = targetSections[index];
                const sectionClone = section.cloneNode(true) as HTMLElement;
                prepareElementForPrint(sectionClone);
                tempContainer.appendChild(sectionClone);

                const canvasOptions: Html2CanvasEnhancedOptions = {
                    useCORS: true,
                    allowTaint: true,
                    background: '#ffffff',
                    scale: renderScale,
                    windowWidth: sectionClone.scrollWidth,
                    windowHeight: sectionClone.scrollHeight,
                    logging: false
                };
                const canvas = await html2canvas(sectionClone, canvasOptions);
                const context = canvas.getContext('2d');
                if (context) {
                    context.imageSmoothingEnabled = true;
                    (context as CanvasRenderingContext2D & { imageSmoothingQuality?: 'low' | 'medium' | 'high' }).imageSmoothingQuality = 'high';
                }

            const imgData = canvas.toDataURL('image/jpeg', 1);
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
                if (index > 0) {
                    pdf.addPage();
                }

            pdf.addImage(imgData, 'JPEG', margin, topMargin, imgWidth, imgHeight, undefined, 'FAST');
                tempContainer.removeChild(sectionClone);
            }

            document.body.removeChild(tempContainer);

            // Save the PDF
            const pdfBlob = pdf.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');

        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error("Failed to generate PDF");
        } finally {
            setLoading(false);
        }
    };

    const groupedReports = reports.reduce((acc: Record<string, Report[]>, report) => {
        if (!acc[report.testName]) {
            acc[report.testName] = [];
        }
        acc[report.testName].push(report);
        return acc;
    }, {});

    useEffect(() => {
        if (reports.length === 0) {
            setSelectedTests({});
            return;
        }
        setSelectedTests((prev) => {
            const next: Record<string, boolean> = {};
            Object.keys(groupedReports).forEach((name) => {
                next[name] = prev[name] ?? true;
            });
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reports]);

    const selectedTestNames = Object.entries(selectedTests)
        .filter(([, isSelected]) => isSelected)
        .map(([name]) => name);
    const totalTests = Object.keys(groupedReports).length;
    const selectedCount = selectedTestNames.length;
    const isAllSelected = totalTests > 0 && selectedCount === totalTests;

    const handleToggleTestSelection = (testName: string, checked: boolean) => {
        setSelectedTests((prev) => ({
            ...prev,
            [testName]: checked,
        }));
    };

    const handleToggleAllSelections = (checked: boolean) => {
        setSelectedTests(() => {
            const next: Record<string, boolean> = {};
            Object.keys(groupedReports).forEach((name) => {
                next[name] = checked;
            });
            return next;
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-lg font-medium text-gray-700">Loading report..</p>
            </div>
        </div>
    );
    // Determine doctor name to display
    const displayDoctorName = doctorName || doctor?.name || 'N/A';
    // const patientLabName = (patientData as PatientDataWithLab).labName;

    // Helpers for rendering detailed report and reference ranges
    const buildDetailedReportHTML = (reportJson?: string, fallbackTitle?: string) => {
        if (!reportJson) return '';
        try {
            const parsed = JSON.parse(reportJson) as DetailedReport;
            if (parsed && parsed.title && Array.isArray(parsed.sections)) {
                const sectionsHtml = parsed.sections
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((section) => {
                        // Ensure readable spacing before bold labels like "Limitations:" when missing spaces
                        const cleanedContent = String(section.content ?? '')
                          .replace(/([^\s>])<strong>/g, '$1 <strong>')
                          .replace(/<ul>/g, '<ul class=\\"list-disc pl-5\\" >')
                          .replace(/<ol>/g, '<ol class=\\"list-decimal pl-5\\" >')
                          // strip background styles that cause gray fill in print
                          .replace(/background(?:-color)?:[^;"']*;?/gi, '')
                          .replace(/style=\\"\\s*\\"/gi, '');
                        return `
                        <div class=\"mb-3\">
                            <h4 class=\"text-sm font-semibold text-gray-800\">${section.title || ''}</h4>
                            <div>${cleanedContent}</div>
                        </div>
                        `;
                    })
                    .join('');
                return `
                    <div class=\"mb-6\">
                        <h3 class=\"text-base font-bold text-gray-900\">${parsed.title || fallbackTitle || ''}</h3>
                        ${parsed.description ? `<p class=\"text-sm text-gray-700 mb-2\">${parsed.description}</p>` : ''}
                        ${sectionsHtml}
                    </div>
                `;
            }
            // Fallback to formatter if structure is not as expected
            return `<div>${formatMedicalReportToHTML(reportJson) || ''}</div>`;
        } catch {
            return `<div>${formatMedicalReportToHTML(reportJson) || ''}</div>`;
        }
    };

    const renderReferenceRanges = (rangesStr?: string) => {
        if (!rangesStr) return null;
        let ranges: ReferenceRangeEntry[] = [];
        try {
            const parsed = JSON.parse(rangesStr) as ReferenceRangeEntry[];
            ranges = Array.isArray(parsed) ? parsed : [];
        } catch {
            ranges = [];
        }
        if (ranges.length === 0) return null;
        const formatGender = (g: string) => {
            const up = (g || '').toUpperCase();
            if (up === 'M') return 'Male';
            if (up === 'F') return 'Female';
            if (up === 'MF') return 'Male/Female';
            return g;
        };
        const formatAge = (r: ReferenceRangeEntry) => {
            const min = `${r.AgeMin} ${r.AgeMinUnit}`;
            const max = `${r.AgeMax} ${r.AgeMaxUnit}`;
            return `${min} - ${max}`;
        };
        return (
            <div className="mt-4">
               
                <p className="text-xs text-gray-600 mb-3 italic">
                    The following table shows reference ranges that vary by age and gender. These ranges are provided for informational purposes and may differ based on the laboratory methodology used. Please consult with a qualified healthcare professional for proper interpretation of your results in relation to these reference ranges.
                </p>
                <table className="w-full text-xs border border-gray-300">
                    <thead>
                        <tr className="bg-white">
                            <th className="p-2 font-bold border border-gray-300 text-left">GENDER</th>
                            <th className="p-2 font-bold border border-gray-300 text-left">AGE RANGE</th>
                            <th className="p-2 font-bold border border-gray-300 text-left">REFERENCE RANGE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranges.map((r, i) => (
                            <tr key={i} className="border-b border-gray-200">
                                <td className="p-2 border-r border-gray-200">{formatGender(r.Gender)}</td>
                                <td className="p-2 border-r border-gray-200">{formatAge(r)}</td>
                                <td className="p-2">{r.ReferenceRange}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto text-slate-900 font-sans" style={{ fontFamily: DEFAULT_FONT_FAMILY }}>
            {/* Print Button - conditionally rendered */}
            {!hidePrintButton && (
                <div className="print:hidden mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-900">
                            {reports.length > 0 ? `${Object.keys(groupedReports).length} tests found` : 'No test data available'}
                        </p>
                        {reports.length > 0 && (
                            <p className="text-xs text-slate-600">{selectedCount} selected</p>
                        )}
                    </div>
                    <button
                        onClick={printReport}
                        disabled={loading || reports.length === 0 || selectedCount === 0}
                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 105 7.75l-1.5-.87A6 6 0 114 12z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            <>
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print Selected
                            </>
                        )}
                    </button>
                </div>
            )}

            {totalTests > 0 && (
                <div className="print:hidden mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Select reports to print</p>
                            <p className="text-xs text-slate-600">{selectedCount} of {totalTests} selected</p>
                        </div>
                        <label className="inline-flex items-center text-xs font-medium text-slate-700 cursor-pointer">
                            <input
                                type="checkbox"
                                className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                checked={isAllSelected}
                                onChange={(e) => handleToggleAllSelections(e.target.checked)}
                            />
                            Select all
                        </label>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {Object.keys(groupedReports).map((name) => (
                            <label
                                key={name}
                                className={`flex items-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                                    selectedTests[name]
                                        ? 'border-blue-200 bg-white text-slate-900 shadow-sm'
                                        : 'border-slate-200 text-slate-500'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    checked={!!selectedTests[name]}
                                    onChange={(e) => handleToggleTestSelection(name, e.target.checked)}
                                />
                                <span className="truncate">{name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Report Container */}
            <div
                ref={reportRef}
                className="bg-white p-8 mb-6"
                style={{
                    width: '210mm',
                    minHeight: '297mm',
                    maxWidth: '210mm',
                    margin: '0 auto',
                    boxSizing: 'border-box',
                    paddingTop: '20px'
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
                    <div className="mb-6">
                            {Object.entries(groupedReports).map(([testName, testResults], testIndex) => {
                                const isCBCTest = testName.toUpperCase().includes('CBC') || testName.toUpperCase().includes('COMPLETE BLOOD COUNT');
                                const detailedEntry = testResults.find(r => (r.referenceDescription || '').toUpperCase() === 'DETAILED REPORT');
                                const rangeSourceEntry = testResults.find(r => r.referenceRanges);
                                const excludedResults = testResults.filter(param => isExcludedQualitativeField(param.referenceDescription));
                                const filteredTestResults = testResults.filter(param => !isExcludedQualitativeField(param.referenceDescription));
                                const hasRadioTests = filteredTestResults.some(p => p.referenceDescription?.toUpperCase() === 'RADIOLOGY_TEST');
                                const hasDropdownWithDescription = filteredTestResults.some(p => (p.referenceDescription?.toUpperCase() || '').includes('DROPDOWN WITH DESCRIPTION'));
                                const hasReferenceRangeColumn = filteredTestResults.some(p => {
                                    const fieldType = p.referenceDescription?.toUpperCase() || '';
                                    if (fieldType === 'RADIOLOGY_TEST') return false;
                                    return !fieldType.includes('DROPDOWN') && !fieldType.includes('DESCRIPTION');
                                });

                            return (
                                <div
                                    key={testIndex}
                                    data-test-section
                                    data-detailed={!!detailedEntry}
                                    data-test-name={testName}
                                    className="mb-8"
                                    style={{
                                        pageBreakAfter: 'always',
                                        breakAfter: 'page',
                                        pageBreakInside: 'avoid',
                                        breakInside: 'avoid',
                                        minHeight: '297mm'
                                    }}
                                >
                                    <div>
                                        <div data-header-section className="mb-6 bg-white pt-1">
                            {/* Logo and Report Title */}
                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex flex-col gap-y-1">
                                                    <Image src="/CUREPLUS HOSPITALS (1).png"
                                                        alt="Lab Logo" width={90} height={56}
                                                        className="h-14 w-14 mr-4" priority loading="eager"
                                                        unoptimized crossOrigin="anonymous" data-print-logo="true"
                                                        quality={100}
                                                    />

                                        <h1 className="text-xl font-bold text-black">{currentLab?.name}</h1>
                                                    <p className="text-xs text-gray-600">{currentLab?.address}</p>
                                </div>
                                <div className="text-right">
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
                                        {/* Left Column */}
                                        <div className="space-y-1">
                                            <div className="flex items-center">
                                                <span className="font-medium text-black w-20 text-left">NAME:</span>
                                                <span className="font-bold text-black ml-2">{patientData?.patientname || 'N/A'}</span>
                            </div>
                                        <div className="flex items-center">
                                                <span className="font-medium text-black w-20 text-left">REFERRED BY:</span>
                                                <span className="font-bold text-black ml-2">{displayDoctorName}</span>
                                        </div>
                                        <div className="flex items-center">
                                                <span className="font-medium text-black w-20 text-left">LAB NO:</span>
                                                <span className="font-bold text-black ml-2">{currentLab?.id || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center">
                                                <span className="font-medium text-black w-20 text-left">OPD/IPD:</span>
                                                <span className="font-bold text-black ml-2">{patientData?.visitType || 'N/A'}</span>
                                        </div>
                                    </div>

                                        {/* Right Column */}
                                        <div className="space-y-1">
                                            <div className="flex items-center">
                                                <span className="font-medium text-black w-20 text-left">AGE/SEX:</span>
                                                <span className="font-bold text-black ml-2">{formatAgeForDisplay(patientData?.dateOfBirth || '')} / {patientData?.gender ? patientData.gender.slice(0, 1).toUpperCase() : 'N/A'}</span>
                                        </div>
                                            <div className="flex items-center">
                                                <span className="font-medium text-black w-20 text-left">DATE OF REPORT:</span>
                                                <span className="font-bold text-black ml-2">{new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                        </div>
                                            <div className="flex items-center">
                                                <span className="font-medium text-black w-20 text-left">BILL NO:</span>
                                                <span className="font-bold text-black ml-2">{patientData?.visitId || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                            {/* Blue separator bar */}
                            <div className="h-1 w-full bg-blue-600 rounded mb-4" style={{ backgroundColor: '#2563eb', height: '4px', width: '100%' }}></div>
                                        </div>
                        </div>

                                    <div>
                                    {/* Test Name Heading (hidden for detailed reports since title comes from JSON) */}
                                    {!detailedEntry && (
                                    <div className="mb-2">
                                        <h3 className="text-xs font-bold text-left text-gray-800">{testName.toUpperCase()}</h3>
                                    </div>
                                    )}

                                        {/* If DETAILED REPORT -> render reportJson content and optional reference ranges, skip table */}
                                        {detailedEntry && (
                                            <div className="w-full">
                                                {/* Detailed Report Section */}
                                                <div className="mb-4">
                                                    <h3 className="text-xs font-bold text-black text-center mb-3">DETAILED REPORT</h3>
                                                    <div className="p-4 bg-white">
                                                        <div
                                                            className="prose prose-sm max-w-none prose-headings:text-black prose-p:text-black prose-strong:text-black"
                                                            style={{ background: '#ffffff' }}
                                                            dangerouslySetInnerHTML={{ __html: buildDetailedReportHTML(detailedEntry.reportJson, testName) }}
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {/* Reference Ranges Table */}
                                                {renderReferenceRanges(detailedEntry.referenceRanges)}
                                            </div>
                                        )}

                                        {/* If not detailed report, render the classic table */}
                                        {!detailedEntry && filteredTestResults.length > 0 && (
                                            <>

                                                                         {/* Test Results Table */}
                                     <table className="w-full text-xs border border-blue-200">
                                         <thead>
                                             <tr className="bg-white">
                                                            <th className={`p-2 font-bold border border-blue-200 text-xs ${hasRadioTests ? 'w-2/3 text-left' : 'text-left'}`}>TEST PARAMETER</th>
                                                            <th className={`p-2 font-bold border border-blue-200 text-xs ${hasRadioTests ? 'w-1/3 text-center' : 'text-center'}`}>RESULT</th>
                                                {/* Show DESCRIPTION column for tests with DROPDOWN WITH DESCRIPTION fields */}
                                                            {hasDropdownWithDescription && (
                                                    <th className="text-center p-2 font-bold border border-blue-200 text-xs">DESCRIPTION</th>
                                                )}
                                                                                                 {/* Conditionally show REFERENCE RANGE column - hide for radiology tests */}
                                                            {hasReferenceRangeColumn && (
                                                    <th className="text-center p-2 font-bold border border-blue-200 text-xs">REFERENCE RANGE</th>
                                                 )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                                        {filteredTestResults.map((param, idx) => {
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
                                                <div className={`${isOutOfRange ? 'font-black text-black' : 'font-medium'}`}>
                                                    {param.enteredValue || 'N/A'}
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    if (isDropdownField) {
                                        return (
                                            <div className="text-center">
                                                <div className={`${isOutOfRange ? 'font-black text-black' : 'font-medium'}`}>
                                                    {param.enteredValue || 'N/A'}
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    // For numeric/other fields
                                    return (
                                        <div className="text-center">
                                            <span className={`${isOutOfRange ? 'font-black text-black' : 'font-medium'}`}>
                                                {param.enteredValue || 'N/A'}
                                                {param.enteredValue && param.unit && param.unit.trim() !== '' && (
                                                    <span className="text-gray-600 ml-1">{param.unit}</span>
                                                )}
                                            </span>
                                        </div>
                                    );
                                };

                                // Determine if result is out of range (for numeric fields only)
                                const isOutOfRange = (() => {
                                    if (isDescriptionField || isDropdownField || fieldType === 'RADIOLOGY_TEST') return false;
                                    
                                    const value = parseFloat(param.enteredValue);
                                    if (isNaN(value)) return false;
                                    
                                    const range = param.referenceRange;
                                    if (!range || range === 'N/A') return false;
                                    
                                    // Enhanced range check to handle various formats
                                    // Format 1: "4.0 - 10.0" or "4.0-10.0"
                                    const rangeMatch = range.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
                                    if (rangeMatch) {
                                        const min = parseFloat(rangeMatch[1]);
                                        const max = parseFloat(rangeMatch[2]);
                                        return value < min || value > max;
                                    }
                                    
                                    // Format 2: "< 5.0" or "> 10.0"
                                    const lessThanMatch = range.match(/<\s*(\d+(?:\.\d+)?)/);
                                    if (lessThanMatch) {
                                        const threshold = parseFloat(lessThanMatch[1]);
                                        return value >= threshold;
                                    }
                                    
                                    const greaterThanMatch = range.match(/>\s*(\d+(?:\.\d+)?)/);
                                    if (greaterThanMatch) {
                                        const threshold = parseFloat(greaterThanMatch[1]);
                                        return value <= threshold;
                                    }
                                    
                                    // Format 3: "Normal" or other non-numeric ranges
                                    if (range.toLowerCase().includes('normal') || 
                                        range.toLowerCase().includes('negative') ||
                                        range.toLowerCase().includes('positive')) {
                                        return false; // Don't mark as out of range for qualitative results
                                    }
                                    
                                    return false;
                                })();

                                                            const colSpanTotal = 2 + (hasDropdownWithDescription ? 1 : 0) + (hasReferenceRangeColumn ? 1 : 0);
                                const shouldInsertDiffHeading = isCBCTest && (((param.referenceDescription?.toUpperCase() || '').includes('TOTAL W.B.C')) || idx === 1);

                                                return (
                                    <>
                                        <tr key={`row-${idx}`} className="border-b border-blue-200">
                                                                        <td className={`p-2 border-r border-blue-200 font-medium text-xs ${hasRadioTests ? 'w-2/3' : ''}`}>
                                                             {hasNoDescription ? (
                                                                 <div className="flex items-center text-yellow-700">
                                                                     <TbAlertTriangle className="mr-1" />
                                                                     <span>Parameter not specified</span>
                                                                 </div>
                                                             ) : (
                                                     getTestParameterName()
                                                             )}
                                                         </td>
                                                                        <td className={`p-2 text-center text-xs ${hasRadioTests ? 'w-1/3' : ''}`}>
                                                 {formatResult()}
                                             </td>
                                                                        {hasDropdownWithDescription && (
                                                <td className="p-2 text-center text-xs border-l border-blue-200">
                                                    {isDropdownWithDescription ? (param.description || 'N/A') : 'N/A'}
                                                </td>
                                            )}
                                                                        {hasReferenceRangeColumn && (
                                                <td className="p-2 text-center text-xs border-l border-blue-200">
                                                     <div>
                                                         {param.referenceRange || 'N/A'}
                                                         {param.referenceRange && param.unit && param.unit.trim() !== '' && (
                                                            <span className="ml-1">{param.unit}</span>
                                                         )}
                                                     </div>
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
                                            </>
                                        )}
                                        {!detailedEntry && excludedResults.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-xs font-bold text-black mb-2">Qualitative Results</h4>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    The following tests are reported as final qualitative outcomes. Please refer to the treating physician for clinical correlation.
                                                </p>
                                                <div className="space-y-3">
                                                    {excludedResults.map((param, idx) => {
                                                        const resultValue = param.enteredValue || 'N/A';
                                                        const normalizedResult = (resultValue || '').toString().trim().toLowerCase();
                                                        const normalizedDescription = (param.description || '').toString().trim().toLowerCase();
                                                        const showDescription = shouldShowQualitativeDescription(param.referenceDescription) &&
                                                            !!param.description &&
                                                            normalizedDescription !== normalizedResult;
                                                        return (
                                                            <div key={`qual-result-${idx}`} className="text-xs">
                                                                <p className="text-gray-800 font-semibold">
                                                                    {resultValue}
                                                                </p>
                                                                {showDescription && (
                                                                    <p className="text-gray-600 mt-1">
                                                                        {param.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                </div>
                                        )}
                                        {!detailedEntry && rangeSourceEntry?.referenceRanges && renderReferenceRanges(rangeSourceEntry.referenceRanges)}
                                        <h4 className="text-xs font-bold text-black mt-4 mb-1 text-left">Disclaimer</h4>
                                        <p className="text-xs text-gray-600 italic text-left">
                                            *This laboratory report is intended for clinical correlation only. Results should be interpreted by a qualified medical professional. Laboratory values may vary based on methodology and biological variance. The diagnostic center is not responsible for misinterpretation or misuse of results.*
                                        </p>
                        </div>

                                    <div data-footer-section className="mt-8 pt-6  border-gray-200">
                                        <div className="grid grid-cols-2 gap-4 border-gray-200 pt-4">
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

                            {/* Bottom divider with logo and generation info */}
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center">
                                    <Image
                                        src="/tiamed1.svg"
                                        alt="Tiamed Logo"
                                        width={60}
                                        height={24}
                                        className="h-6 w-auto mr-2 opacity-80"
                                                    unoptimized
                                                    crossOrigin="anonymous"
                                    />
                                    <span className="text-xs font-medium text-gray-600">Powered by Tiameds Technologies Pvt.Ltd</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};


export default CommonReportView;
