
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
}

interface ReportPayload {
  testData: ReportData[];
  testResult: {
    testId: number;
    isFilled: boolean;
  };
}

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

  const formatAgeDisplay = (age: { years: number; months: number; days: number }) => {
    if (age.years > 0) {
      return `${age.years} year${age.years > 1 ? 's' : ''} ${age.months > 0 ? `${age.months} month${age.months > 1 ? 's' : ''}` : ''}`;
    } else if (age.months > 0) {
      return `${age.months} month${age.months > 1 ? 's' : ''} ${age.days > 0 ? `${age.days} day${age.days > 1 ? 's' : ''}` : ''}`;
    } else {
      return `${age.days} day${age.days !== 1 ? 's' : ''}`;
    }
  };

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

  const filterReferenceData = (referenceData: Record<string, TestReferancePoint[]>) => {
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
        return u === 'MONTHS' ? value : value * 12;
      };

      const ageFilteredPoints = genderFilteredPoints.filter((point) => {
        const minMonths = toMonths(point.ageMin, point.minAgeUnit);
        // If max is missing, allow large range
        const maxMonths = point.ageMax === null || point.ageMax === undefined
          ? Number.MAX_SAFE_INTEGER
          : toMonths(point.ageMax, point.maxAgeUnit);

        return patientAgeMonths >= minMonths && patientAgeMonths <= maxMonths;
      });

      // If age filtering yields results, use them; otherwise fall back to gender-only
      filteredData[testName] = ageFilteredPoints.length > 0 ? ageFilteredPoints : genderFilteredPoints;
    });

    return filteredData;
  };

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
      console.error('Error fetching reference data:', error);
      toast.error('Failed to fetch test reference data');
    } finally {
      setLoading(false);
    }
  }, [selectedTest, currentLab, selectedPatient.gender]);

  useEffect(() => {
    if (selectedTest) {
      setAllTests([selectedTest]);
      fetchReferenceData();
    }
  }, [selectedTest, fetchReferenceData]);

  const handleInputChange = (testName: string, index: number | string, value: string) => {
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
      const testInputs = inputValues[test.name] || {};
      const referenceData = referencePoints[test.name] || [];

      referenceData.forEach((point, index) => {
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
          } else {
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
            description: description
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
      console.log('Submitting report with payload:', reportPreview);
      const response = await createReportWithTestResult(currentLab?.id.toString() || '', reportPreview);
      console.log('API Response:', response);
      
      // Check if response exists and is valid
      // The API returns ReportData[] which can be empty array on success
      if (response !== undefined && response !== null) {
        console.log('Report submitted successfully, response:', response);
        toast.success('Report submitted successfully!');
        setShowConfirmation(false);
        setUpdateCollectionTable(prev => !prev);
        setShowModal(false); // Close the main modal
      } else {
        console.log('Report submission failed, response:', response);
        toast.error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader type="progress" fullScreen={false} text="Loading report data..." />
        <p className="mt-4 text-sm text-gray-500">Fetching test and reference data...</p>
      </div>
    );
  }

  const patientAge = selectedPatient.dateOfBirth ? calculateAgeObject(selectedPatient.dateOfBirth) : { years: 0, months: 0, days: 0 };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden h-[500px] overflow-y-auto p-5">
      <PatientBasicInfo patient={selectedPatient} />

      {/* Highlighted Banner for Reference Range Selection */}
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 mb-6 shadow-md">
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
      </div>

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
        {allTests.map((test) => (
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
        ))}
      </div>

      {/* Generate Report Button */}
      <div className="mt-8 text-center">
        <button
          onClick={prepareReportPreview}
          className="w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center"
        >
          <TbReportMedical className="mr-2" size={18} />
          Generate Report
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <TbInfoCircle className="text-blue-500 mr-2" size={24} />
                {hasMissingDescriptions ? "Important Note About Test References" : "Confirm Report Submission"}
              </h3>

              {hasMissingDescriptions ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <TbInfoCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 font-medium mb-2">
                        Note about tests without reference descriptions:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700">
                        <li>Some tests ({reportPreview.testData.filter(item => !item.referenceDescription || item.referenceDescription === "No reference description available").length}) don&lsquo;t have digital references available</li>
                        <li>These tests might be machine-generated or have hard copy references</li>
                        <li>The results will be provided separately at the reception</li>
                        <li>Please inform the patient to collect all results from the reception desk</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <TbInfoCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        All test references have complete descriptions. Please review the data before submitting.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {reportPreview.testData.length > 0 ? (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Report Preview:</h4>
                  
                  {/* Group tests by test name */}
                  {(() => {
                    const groupedByTest = reportPreview.testData.reduce((acc, item) => {
                      if (!acc[item.testName]) {
                        acc[item.testName] = [];
                      }
                      acc[item.testName].push(item);
                      return acc;
                    }, {} as Record<string, typeof reportPreview.testData>);

                    return Object.entries(groupedByTest).map(([testName, testItems], testIndex) => (
                      <div key={testIndex} className="mb-6">
                        {/* Test Name Heading */}
                        <div className="mb-2">
                          <h5 className="text-sm font-bold text-left text-gray-800">{testName.toUpperCase()}</h5>
                        </div>
                        
                        <div className="border rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TEST PARAMETER</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">RESULT</th>
                                {/* Show DESCRIPTION column for tests with DROPDOWN WITH DESCRIPTION fields */}
                                {testItems.some(item => {
                                  const fieldType = item.referenceDescription?.toUpperCase() || '';
                                  return fieldType.includes('DROPDOWN WITH DESCRIPTION');
                                }) && (
                                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">DESCRIPTION</th>
                                )}
                                {/* Conditionally show REFERENCE RANGE column */}
                                {testItems.some(item => {
                                  const fieldType = item.referenceDescription?.toUpperCase() || '';
                                  return !fieldType.includes('DROPDOWN') && !fieldType.includes('DESCRIPTION');
                                }) && (
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">REFERENCE RANGE</th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {testItems.map((item, idx) => {
                                const fieldType = item.referenceDescription?.toUpperCase() || '';
                                const isDropdownWithDescription = fieldType.includes('DROPDOWN WITH DESCRIPTION');
                                const hasReferenceRange = !fieldType.includes('DROPDOWN') && !fieldType.includes('DESCRIPTION');
                                
                                return (
                                  <tr key={idx} className={!item.referenceDescription || item.referenceDescription === "No reference description available" ? "bg-yellow-50" : ""}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {(() => {
                                        // For DESCRIPTION fields, show "Description"
                                        if (fieldType === 'DESCRIPTION') {
                                          return 'Description';
                                        }
                                        
                                        // For DROPDOWN fields, show meaningful test parameter names
                                        if (fieldType.includes('DROPDOWN')) {
                                          if (fieldType.includes('DROPDOWN WITH DESCRIPTION')) {
                                            // Remove "DROPDOWN WITH DESCRIPTION-" prefix
                                            const prefix = 'DROPDOWN WITH DESCRIPTION-';
                                            if (fieldType.startsWith(prefix)) {
                                              return fieldType.substring(prefix.length).replace(/-/g, ' ');
                                            }
                                          } else if (fieldType.startsWith('DROPDOWN-')) {
                                            // Remove "DROPDOWN-" prefix to get actual test name
                                            const prefix = 'DROPDOWN-';
                                            return fieldType.substring(prefix.length).replace(/-/g, ' ');
                                          }
                                          return 'Test Parameter';
                                        }
                                        
                                        // For other fields, show as is
                                        return item.referenceDescription || 'Test Parameter';
                                      })()}
                                    </td>
                                    <td className="px-4 py-2 text-center text-sm text-gray-500">
                                      {(() => {
                                        // For DESCRIPTION fields, show the description text
                                        if (fieldType === 'DESCRIPTION') {
                                          return item.description || 'N/A';
                                        }
                                        
                                        // For DROPDOWN fields, show only the entered value (no unit)
                                        if (fieldType.includes('DROPDOWN')) {
                                          return item.enteredValue || 'N/A';
                                        }
                                        
                                        // For other fields (numeric), show value with unit
                                        return `${item.enteredValue} ${item.unit}`;
                                      })()}
                                    </td>
                                    {/* Show DESCRIPTION column for DROPDOWN WITH DESCRIPTION fields */}
                                    {isDropdownWithDescription && (
                                      <td className="px-4 py-2 text-center text-sm text-gray-500">
                                        {item.description !== "N/A" ? item.description : "-"}
                                      </td>
                                    )}
                                    {/* Show REFERENCE RANGE column for numeric fields */}
                                    {hasReferenceRange && (
                                      <td className="px-4 py-2 text-right text-sm text-gray-500">
                                        {item.referenceRange || 'N/A'}
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <TbInfoCircle className="text-blue-500 mr-3" size={24} />
                    <div>
                      <h4 className="font-medium text-blue-800">No test values entered</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        This report will be marked as completed without any test data.
                        The results might be provided separately as hard copies at the reception.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReport}
                  disabled={isSubmitting}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none ${
                    isSubmitting 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Confirm Submission'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientReportDataFill;