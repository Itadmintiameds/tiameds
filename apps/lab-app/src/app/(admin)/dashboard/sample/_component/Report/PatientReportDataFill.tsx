
import { createReportWithTestResult } from '@/../services/reportServices';
import { getTestReferanceRangeByTestName } from '@/../services/testService';
import Loader from '@/app/(admin)/component/common/Loader';
import { useLabs } from '@/context/LabContext';
import { TestList, TestReferancePoint } from '@/types/test/testlist';
import { calculateAgeObject } from '@/utils/ageUtils';
import React, { useCallback, useEffect, useState } from 'react';
import { TbInfoCircle, TbReportMedical, TbArrowDownCircle, TbArrowUpCircle, TbSquareRoundedCheck } from "react-icons/tb";
import { toast } from 'react-toastify';
import PatientBasicInfo from './PatientBasicInfo';
import TestComponentFactory from './TestSpecificComponents/TestComponentFactory';
import DetailedReportEditor from './DetailedReportEditor';
import { formatMedicalReportToHTML } from '@/utils/reportFormatter';
import ConfirmationDialog from '@/app/(admin)/component/common/ConfirmationDialog';

export interface Patient {
  visitId: number;
  patientname: string;
  gender: string;
  contactNumber: string;
  email: string;
  visitDate: string;
  visitStatus: string;
  sampleNames: string[];
  testIds: number[];
  packageIds: number[];
  dateOfBirth?: string;
}

interface ReportData {
  visit_id: string;
  testName: string;
  testCategory: string;
  patientName: string;
  referenceDescription: string;
  referenceRange: string;
  referenceAgeRange: string;
  enteredValue: string;
  unit: string;
  description: string;
  referenceRanges?: string; // raw reference ranges JSON/string from API point
  reportJson?: string; // detailed report JSON (if any) for this test/point
}

interface ReportPayload {
  testData: ReportData[];
  testResult: {
    testId: number;
    isFilled: boolean;
  };
}

interface StructuredReportSection {
  title?: string;
  content?: string;
  order?: number;
}

interface StructuredReport {
  title?: string;
  description?: string;
  sections?: StructuredReportSection[];
  note?: string;
  impression?: string;
  interpretation?: string;
  limitations?: unknown;
  organReview?: unknown;
  observations?: unknown;
  fetalParameters?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  calculation?: string;
  significance?: string;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

interface PatientReportDataFillProps {
  selectedPatient: Patient;
  selectedTest: TestList;
  updateCollectionTable: boolean;
  setShowModal: (value: React.SetStateAction<boolean>) => void;
  setUpdateCollectionTable: (value: React.SetStateAction<boolean>) => void;
}

const PatientReportDataFill: React.FC<PatientReportDataFillProps> = ({
  selectedPatient,
  selectedTest,
  setUpdateCollectionTable,
  setShowModal
}) => {
  const { currentLab } = useLabs();
  const [loading, setLoading] = useState(false);
  const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
  const [inputValues, setInputValues] = useState<Record<string, Record<string | number, string>>>({});
  const [allTests, setAllTests] = useState<TestList[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reportPreview, setReportPreview] = useState<ReportPayload>({
    testData: [],
    testResult: { testId: 0, isFilled: false }
  });
  const [hasMissingDescriptions, setHasMissingDescriptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

 

  // Function to determine value status based on reference range
  const getValueStatus = (value: string, minRef: number | null, maxRef: number | null) => {
    if (!value || isNaN(Number(value))) return 'no-reference';
    const numValue = parseFloat(value);

    if (minRef === null || maxRef === null) return 'no-reference';
    if (numValue < minRef) return 'below';
    if (numValue > maxRef) return 'above';
    return 'normal';
  };

  // Function to get status color for styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'below': return 'bg-red-50 border-red-200';
      case 'above': return 'bg-red-50 border-red-200';
      case 'normal': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'below': return <TbArrowDownCircle className="text-yellow-500 mr-1" size={18} />;
      case 'above': return <TbArrowUpCircle className="text-red-500 mr-1" size={18} />;
      case 'normal': return <TbSquareRoundedCheck className="text-green-500 mr-1" size={18} />;
      default: return <TbInfoCircle className="text-blue-500 mr-1" size={18} />;
    }
  };

  const filterReferenceData = useCallback((referenceData: Record<string, TestReferancePoint[]>) => {
    const filteredData: Record<string, TestReferancePoint[]> = {};

    Object.keys(referenceData).forEach((testName) => {
      const testPoints = referenceData[testName];

      // Global gender filtering for all tests
      const genderFilteredPoints = testPoints.filter((point) => {
        const pointGender = point.gender?.toUpperCase() || '';
        const patientGender = selectedPatient.gender?.toUpperCase() || '';

        // Map patient gender to test gender format
        let mappedPatientGender = '';
        if (patientGender === 'MALE') {
          mappedPatientGender = 'M';
        } else if (patientGender === 'FEMALE') {
          mappedPatientGender = 'F';
        }

        // Show field if:
        // 1. Gender is "MF" (Male/Female) - show for both
        // 2. Gender matches mapped patient gender (M for male, F for female)
        // 3. No gender specified (show for all)
        return pointGender === 'MF' ||
          pointGender === mappedPatientGender ||
          !pointGender ||
          pointGender === '';
      });

      // Age-based filtering (convert both patient age and ref ranges to months)
      const ageObj = selectedPatient.dateOfBirth ? calculateAgeObject(selectedPatient.dateOfBirth) : { years: 0, months: 0, days: 0 };
      const patientAgeMonths = (ageObj.years || 0) * 12 + (ageObj.months || 0);

      const toMonths = (value: number | null | undefined, unit: string | null | undefined): number => {
        if (value === null || value === undefined) return 0;
        const u = (unit || 'YEARS').toUpperCase();
        
        // Special case: if unit is "MONTHS" but value is 1, treat it as 1 year (12 months)
        // This handles the case where 0-1 means 0 to 1 year (0-12 months)
        if (u === 'MONTHS' && value === 1) {
          return 12; // 1 month = 1 year = 12 months
        }
        
        // Normal conversion: MONTHS = months, YEARS = years * 12
        return u === 'MONTHS' ? value : value * 12;
      };

      const ageFilteredPoints = genderFilteredPoints.filter((point) => {
        const minMonths = toMonths(point.ageMin, point.minAgeUnit);
        // If max is missing, allow large range
        const maxMonths = point.ageMax === null || point.ageMax === undefined
          ? Number.MAX_SAFE_INTEGER
          : toMonths(point.ageMax, point.maxAgeUnit);

        // Make ranges non-overlapping by using exclusive upper bound for most ranges
        // Only the last range (highest age) uses inclusive upper bound
        const isLastRange = maxMonths === Number.MAX_SAFE_INTEGER || maxMonths >= 1200; // 100+ years
        
        if (isLastRange) {
          // For the highest age range, use inclusive upper bound
          return patientAgeMonths >= minMonths && patientAgeMonths <= maxMonths;
        } else {
          // For all other ranges, use exclusive upper bound to prevent overlap
          return patientAgeMonths >= minMonths && patientAgeMonths < maxMonths;
        }
      });

      // If age filtering yields results, use them; otherwise fall back to gender-only
      filteredData[testName] = ageFilteredPoints.length > 0 ? ageFilteredPoints : genderFilteredPoints;
    });

    return filteredData;
  }, [selectedPatient.dateOfBirth, selectedPatient.gender]);

  const fetchReferenceData = useCallback(async () => {
    if (!selectedTest || !currentLab) return;

    setLoading(true);
    try {
      const response = await getTestReferanceRangeByTestName(currentLab.id.toString(), selectedTest.name);

      if (response && Array.isArray(response)) {
        const filteredData = filterReferenceData({ [selectedTest.name]: response });
        setReferencePoints(filteredData);

        // Initialize input values for this test
        const testInputs: Record<string | number, string> = {};
        response.forEach((_, index) => {
          testInputs[index] = '';
        });

        setInputValues(prev => ({
          ...prev,
          [selectedTest.name]: testInputs
        }));
      }
    } catch (error) {
  
      toast.error('Failed to fetch test reference data');
    } finally {
      setLoading(false);
    }
  }, [selectedTest, currentLab, filterReferenceData]);

  useEffect(() => {
    if (selectedTest) {
      setAllTests([selectedTest]);
      fetchReferenceData();
    }
  }, [selectedTest, fetchReferenceData]);

  const handleInputChange = (testName: string, index: number | string, value: string) => {
    // Check if the value is negative for numeric inputs
    const numericValue = parseFloat(value);
    
    // Only show error for negative values if it's not an auto-calculated field
    // Auto-calculated fields are identified by checking if the field is read-only
    // We'll allow negative values to pass through and let the individual components handle validation
    if (value !== '' && !isNaN(numericValue) && numericValue < 0) {
      // Check if this might be an auto-calculated field by looking at the reference data
      const referenceData = referencePoints[testName] || [];
      const point = referenceData[typeof index === 'number' ? index : 0];
      
      // If it's a known auto-calculated field type, allow negative values
      const isAutoCalculatedField = point?.testDescription?.toUpperCase().includes('GLOBULIN') ||
                                   point?.testDescription?.toUpperCase().includes('INDIRECT BILIRUBIN') ||
                                   point?.testDescription?.toUpperCase().includes('A/G RATIO') ||
                                   point?.testDescription?.toUpperCase().includes('MEAN BLOOD GLUCOSE') ||
                                   point?.testDescription?.toUpperCase().includes('ABSOLUTE EOSINOPHIL COUNT') ||
                                   point?.testDescription?.toUpperCase().includes('HDL CHOLESTEROL - DIRECT') ||
                                   point?.testDescription?.toUpperCase().includes('LDL CHOLESTEROL - DIRECT') ||
                                   point?.testDescription?.toUpperCase().includes('VLDL CHOLESTEROL');
      
      if (!isAutoCalculatedField) {
        toast.error('Negative values are not allowed');
        return; // Don't update the state with negative values
      }
    }

    setInputValues(prev => ({
      ...prev,
      [testName]: {
        ...prev[testName],
        [index]: value
      }
    }));

    // Clear validation error when user starts typing
    if (validationErrors[`${testName}-${index}`]) {
      setValidationErrors(prev => ({
        ...prev,
        [`${testName}-${index}`]: false
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, boolean> = {};
    let isValid = true;

    allTests.forEach(test => {
      // Skip validation for radiology tests
      if (test.category === 'RADIOLOGY') {
        return; // Skip validation for this test
      }

      const testInputs = inputValues[test.name] || {};
      const referenceData = referencePoints[test.name] || [];

      referenceData.forEach((point, index) => {
        // Skip validation for detailed report fields which don't require user input
        const descriptionUpper = (point.testDescription || '').toUpperCase();
        if (descriptionUpper === 'DETAILED REPORT') {
          return;
        }

        if (!testInputs[index] || testInputs[index].trim() === '') {
          errors[`${test.name}-${index}`] = true;
          isValid = false;
        }
      });
    });

    setValidationErrors(errors);
    return isValid;
  };

  const prepareReportPreview = () => {
    if (!validateForm()) {
      return;
    }

    const generatedReportData: ReportData[] = [];
    let hasMissingDesc = false;

    allTests.forEach((test) => {
      // Handle radiology tests differently - create minimal report data
      if (test.category === 'RADIOLOGY') {
     
        
        const formattedTestName = test.name
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        const formattedCategory = test.category
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');

        // Create minimal report data for radiology tests
        // This ensures the test is recorded in the system
        generatedReportData.push({
          visit_id: selectedPatient.visitId.toString(),
          testName: formattedTestName,
          testCategory: formattedCategory,
          patientName: selectedPatient.patientname,
          referenceDescription: "RADIOLOGY_TEST",
          referenceRange: "N/A",
          enteredValue: "Hard copy will be provided",
          referenceAgeRange: "N/A",
          unit: "N/A",
          description: "Imaging test - Results provided separately"
        });
        
        return; // Skip the regular reference data processing
      }

      const testInputs = inputValues[test.name] || {};
      const referenceData = referencePoints[test.name] || [];

      referenceData.forEach((point, index) => {
        if (testInputs[index] || (point.testDescription && point.testDescription !== "No reference available for this test")) {
          if (!point.testDescription || point.testDescription === "No reference description available") {
            hasMissingDesc = true;
          }

          const formattedTestName = test.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

          const formattedCategory = test.category
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

          let finalValue = testInputs[index] || "N/A";
          let description = "N/A";
          let unit = "N/A";
          let referenceRange = "N/A";

          const descriptionKey = `${index}_description`;
          const hasDescription = testInputs[descriptionKey] && testInputs[descriptionKey].trim();

          if (point.testDescription === "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE" ||
            point.testDescription === "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT") {
            unit = "N/A";
            description = hasDescription ? testInputs[descriptionKey] : "N/A";
            finalValue = testInputs[index] || "N/A";
            referenceRange = "N/A";
          } else if (["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
            "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"].includes(point.testDescription)) {
            unit = "N/A";
            description = "N/A";
            finalValue = testInputs[index] || "N/A";
            referenceRange = "N/A";
          } else if (point.testDescription === "DESCRIPTION") {
            unit = "N/A";
            description = testInputs[index] || "N/A";  // Save the actual description text here
            finalValue = testInputs[index] || "N/A";  // Also save it in enteredValue for consistency
            referenceRange = "N/A";
          }
           else if (point.testDescription === "DETAILED REPORT") {
            unit = "N/A";
            description = "Imaging test - Results provided separately";
            finalValue = "Hard copy will be provided";
            referenceRange = "N/A";
          } 
          else {
            unit = point.units || "N/A";
            description = "N/A";
            finalValue = testInputs[index] || "N/A";
            referenceRange = `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`;
          }

          generatedReportData.push({
            visit_id: selectedPatient.visitId.toString(),
            testName: formattedTestName,
            testCategory: formattedCategory,
            patientName: selectedPatient.patientname,
            referenceDescription: point.testDescription || "No reference description available",
            referenceRange: referenceRange,
            enteredValue: finalValue,
            referenceAgeRange: `${point.ageMin ?? "N/A"} ${point.minAgeUnit ?? "YEARS"} - ${point.ageMax ?? "N/A"} ${point.maxAgeUnit ?? "YEARS"}`,
            unit: unit,
            description: description,
            referenceRanges: point.referenceRanges || undefined,
            reportJson: point.reportJson || undefined
          });
        }
      });
    });

    const completePayload: ReportPayload = {
      testData: generatedReportData,
      testResult: {
        testId: selectedTest.id,
        isFilled: true
      }
    };

    setReportPreview(completePayload);
    setHasMissingDescriptions(hasMissingDesc);
    setShowConfirmation(true);
  };

  const submitReport = async () => {
    try {
      setIsSubmitting(true);
     
      const response = await createReportWithTestResult(currentLab?.id.toString() || '', reportPreview);
     

      // Check if response exists and is valid
      // The API returns ReportData[] which can be empty array on success
      if (response !== undefined && response !== null) {
       
        toast.success('Report submitted successfully!');
        setShowConfirmation(false);
        setUpdateCollectionTable(prev => !prev);
        setShowModal(false); // Close the main modal
      } else {
       
        toast.error('Failed to submit report');
      }
    } catch (error) {
     
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build human-readable HTML preview combining detailed reports and entered values
  const buildReadablePreviewHTML = () => {
    let htmlParts: string[] = [];

    // Detailed Reports section (if any)
    const detailedReports = allTests
      .map((test) => {
        const detailedPoint = (referencePoints[test.name] || []).find(p => (p.testDescription || '').toUpperCase() === 'DETAILED REPORT');
        if (!detailedPoint || !detailedPoint.reportJson) return null;

        try {
          const parsed = JSON.parse(detailedPoint.reportJson) as StructuredReport;
          const parsedSections: (StructuredReportSection & { title?: string; content?: string })[] = Array.isArray(parsed.sections)
            ? parsed.sections
            : isPlainObject(parsed.sections)
              ? Object.entries(parsed.sections as Record<string, unknown>).map(([title, content]) => ({
                  title,
                  content: String(content ?? ''),
                }))
              : [];
          if (parsed && parsed.title && parsedSections.length > 0) {
            const sectionsHtml = [...parsedSections]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((section) => `
                <div class="mb-3">
                  <h4 class="text-sm font-semibold text-gray-800">${section.title || ''}</h4>
                  <div>${section.content || ''}</div>
                </div>
              `)
              .join('');
            return `
              <div class="mb-6">
                <h3 class="text-base font-bold text-gray-900">${parsed.title || test.name}</h3>
                ${parsed.description ? `<p class="text-sm text-gray-700 mb-2">${parsed.description}</p>` : ''}
                ${sectionsHtml}
              </div>
            `;
          }

          // Fallback: format raw content to HTML
          const formatted = formatMedicalReportToHTML(detailedPoint.reportJson) || '';
          return `
            <div class="mb-6">
              <h3 class="text-base font-bold text-gray-900">${test.name}</h3>
              <div>${formatted}</div>
            </div>
          `;
        } catch (_) {
          const formatted = formatMedicalReportToHTML(detailedPoint.reportJson) || '';
          return `
            <div class="mb-6">
              <h3 class="text-base font-bold text-gray-900">${test.name}</h3>
              <div>${formatted}</div>
            </div>
          `;
        }
      })
      .filter(Boolean) as string[];

    if (detailedReports.length > 0) {
      htmlParts.push(`<div class="mb-4"><h2 class="text-sm font-bold text-gray-900">Detailed Reports</h2></div>`);
      htmlParts = htmlParts.concat(detailedReports);
    }

    // Entered Results section (non-detailed)
    if (reportPreview.testData.length > 0) {
      // Group items by test name
      const groupedByTest = reportPreview.testData
        .filter(item => (item.referenceDescription || '').toUpperCase() !== 'RADIOLOGY_TEST')
        .reduce((acc, item) => {
          const testName = item.testName.toUpperCase();
          if (!acc[testName]) {
            acc[testName] = [];
          }
          acc[testName].push(item);
          return acc;
        }, {} as Record<string, typeof reportPreview.testData>);

      // Build HTML for each test group
      const testGroups = Object.entries(groupedByTest).map(([testName, items]) => {
        const parameters = items.map(item => {
          const label = (item.referenceDescription || 'Test Parameter');
          const value = (() => {
            const t = (item.referenceDescription || '').toUpperCase();
            if (t === 'DESCRIPTION') return item.description || 'N/A';
            if (t.includes('DROPDOWN')) return item.enteredValue || 'N/A';
            return `${item.enteredValue} ${item.unit}`.trim();
          })();
          const ref = (() => {
            const t = (item.referenceDescription || '').toUpperCase();
            if (t.includes('DROPDOWN') || t === 'DESCRIPTION') return '';
            return `${item.referenceRange || 'N/A'} ${item.unit || ''}`.trim();
          })();
          return `<li class="mb-1 text-sm text-gray-700 ml-4">
            <span class="text-gray-800">${label}: ${value}</span>
            ${ref ? `<span class="text-gray-500"> (Ref: ${ref})</span>` : ''}
          </li>`;
        }).join('');

        return `
          <div class="mb-4">
            <h3 class="text-sm font-bold text-gray-900 mb-2">${testName}</h3>
            <ul class="list-disc pl-5">${parameters}</ul>
          </div>
        `;
      }).join('');

      if (testGroups) {
        htmlParts.push(`
          <div class="mt-4">
            <h2 class="text-sm font-bold text-gray-900 mb-3">Entered Results</h2>
            ${testGroups}
          </div>
        `);
      }
    }

    if (htmlParts.length === 0) {
      htmlParts.push('<p class="text-sm text-gray-600">No data available to preview.</p>');
    }

    return htmlParts.join('\n');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader type="progress" fullScreen={false} text="Loading report data..." />
        <p className="mt-4 text-sm text-gray-500">Fetching test and reference data...</p>
      </div>
    );
  }

  // const patientAge = selectedPatient.dateOfBirth ? calculateAgeObject(selectedPatient.dateOfBirth) : { years: 0, months: 0, days: 0 };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden h-[500px] overflow-y-auto p-5">
      <PatientBasicInfo patient={selectedPatient} />

      {/* Highlighted Banner for Reference Range Selection */}
      {/* <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 mb-6 shadow-md">
        <div className="text-white">
          <h3 className="text-lg font-bold mb-1 flex items-center">
            <TbInfoCircle className="mr-2" size={20} />
            Reference Range Selection
          </h3>
          <p className="text-sm opacity-90">
            Select appropriate reference ranges for this patient. You can remove ranges that aren&lsquo;t relevant.
          </p>
          {selectedPatient.dateOfBirth && (
            <p className="text-xs mt-2 bg-white/20 inline-block px-2 py-1 rounded">
              Patient Age: <span className="font-semibold">{formatAgeDisplay(patientAge)}</span>
            </p>
          )}
        </div>
      </div> */}

      {/* Range Indicator Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center text-sm">
          <TbSquareRoundedCheck className="text-green-500 mr-2" size={18} />
          <span>Normal Range</span>
        </div>
        <div className="flex items-center text-sm">
          <TbArrowDownCircle className="text-red-500 mr-2" size={18} />
          <span>Below Normal</span>
        </div>
        <div className="flex items-center text-sm">
          <TbArrowUpCircle className="text-red-500 mr-2" size={18} />
          <span>Above Normal</span>
        </div>
        <div className="flex items-center text-sm">
          <TbInfoCircle className="text-blue-500 mr-2" size={18} />
          <span>No Reference</span>
        </div>
      </div>

      <div className="space-y-5 mt-6">
        {allTests.map((test) => {
          // Check if any reference point has DETAILED REPORT description
          const hasDetailedReport = referencePoints[test.name]?.some(point => point.testDescription === "DETAILED REPORT");
          
          if (hasDetailedReport) {
            // Find the reference point with DETAILED REPORT
            const detailedReportPoint = referencePoints[test.name]?.find(point => point.testDescription === "DETAILED REPORT");
            
            if (detailedReportPoint) {
              return (
                <DetailedReportEditor
                  key={test.id}
                  point={detailedReportPoint}
                  onReportJsonChange={(reportJson) => {
                    // Update the reference point with new reportJson
                    const updatedPoints = referencePoints[test.name]?.map(point => 
                      point.id === detailedReportPoint.id 
                        ? { ...point, reportJson }
                        : point
                    ) || [];
                    
                    setReferencePoints(prev => ({
                      ...prev,
                      [test.name]: updatedPoints
                    }));
                  }}
                />
              );
            }
          }
          
          // Default rendering for other test types
          return (
            <TestComponentFactory
              key={test.id}
              test={test}
              referencePoints={referencePoints[test.name] || []}
              inputValues={inputValues}
              onInputChange={handleInputChange}
              getValueStatus={getValueStatus}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          );
        })}
      </div>

      {/* Generate Report Button */}
      <div className="mt-8 text-center">
        <button
          onClick={prepareReportPreview}
          className="w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center"
        >
          <TbReportMedical className="mr-2" size={18} />
          Confirm
        </button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={submitReport}
        title={hasMissingDescriptions ? "Important Note About Test References" : "Confirm Report Submission"}
        message={hasMissingDescriptions 
          ? "Some tests don't have digital references available. Please review the details below before submitting."
          : "All test references have complete descriptions. Please review the data before submitting."}
        confirmText="Confirm Submission"
        cancelText="Cancel"
        isLoading={isSubmitting}
      >
        <div className="space-y-4 text-sm">
          {/* Patient Information */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <h4 className="font-semibold text-blue-800 mb-2">Patient Information</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium text-gray-600">Name:</span>
                <span className="ml-2 text-gray-900">{selectedPatient.patientname || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phone:</span>
                <span className="ml-2 text-gray-900">{selectedPatient.contactNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">{selectedPatient.email || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Gender:</span>
                <span className="ml-2 text-gray-900 capitalize">{selectedPatient.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Date of Birth:</span>
                <span className="ml-2 text-gray-900">{selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Visit Date:</span>
                <span className="ml-2 text-gray-900">{selectedPatient.visitDate ? new Date(selectedPatient.visitDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Visit Status:</span>
                <span className="ml-2 text-gray-900 capitalize">{selectedPatient.visitStatus?.toLowerCase().replace('_', ' ') || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Visit ID:</span>
                <span className="ml-2 text-gray-900">{selectedPatient.visitId || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Test Information */}
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <h4 className="font-semibold text-purple-800 mb-2">Test Information</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium text-gray-600">Test Name:</span>
                <span className="ml-2 text-gray-900">{selectedTest.name || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Category:</span>
                <span className="ml-2 text-gray-900">{selectedTest.category || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-gray-600">Total Test Points:</span>
                <span className="ml-2 text-gray-900">{reportPreview.testData.length}</span>
              </div>
            </div>
          </div>

          {/* Missing Descriptions Warning */}
          {hasMissingDescriptions && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Note</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-yellow-700">
                <li>Some tests ({reportPreview.testData.filter(item => !item.referenceDescription || item.referenceDescription === "No reference description available").length}) don&lsquo;t have digital references available</li>
                <li>These tests might be machine-generated or have hard copy references</li>
                <li>The results will be provided separately at the reception</li>
                <li>Please inform the patient to collect all results from the reception desk</li>
              </ul>
            </div>
          )}

          {/* Report Preview */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">Report Preview</h4>
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="p-4">
                <div
                  className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: buildReadablePreviewHTML() }}
                />
              </div>
            </div>
          </div>
        </div>
      </ConfirmationDialog>
    </div>
  );
};

export default PatientReportDataFill;