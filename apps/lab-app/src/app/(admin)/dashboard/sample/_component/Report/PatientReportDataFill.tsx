"use client";

import React, { useState, useCallback, useEffect } from "react";
import { CiCircleCheck } from "react-icons/ci";
import { IoArrowBack } from "react-icons/io5";
import { toast } from 'react-toastify';
import Loader from '@/app/(admin)/component/common/Loader';
import { useLabs } from '@/context/LabContext';
import { TestList, TestReferancePoint } from '@/types/test/testlist';
import { getTestReferanceRangeByTestName } from '@/../services/testService';
import { createReportWithTestResult } from '@/../services/reportServices';
import { calculateAgeObject } from '@/utils/ageUtils';
import { hasValidDropdown, parseDropdownField, DropdownItem } from '@/utils/dropdownParser';
import AutoCalculation from './AutoCalculation';
import { TbSquareRoundedCheck, TbX } from "react-icons/tb";
import NewModal from "../../../newcommoncomponent/NewModal";

// Interfaces
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
  referenceRanges?: string;
  reportJson?: string;
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
  setUpdateCollectionTable: (value: React.SetStateAction<boolean>) => void;
  setShowModal: (value: React.SetStateAction<boolean>) => void;
}

// InfoRow Component for Sidebar
const InfoRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-start justify-between text-p3 gap-4">
      <span className="text-pneutral-500">{label}</span>
      <span className="text-right font-medium text-pneutral-900">
        {value}
      </span>
    </div>
  );
};

// Dropdown Component with NEW UI styling
const DropdownInput = ({ 
  value, 
  onChange, 
  options,
  placeholder = "Select value",
  disabled = false
}: { 
  value: string; 
  onChange: (value: string) => void; 
  options: DropdownItem[];
  placeholder?: string;
  disabled?: boolean;
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="h-9 w-32 rounded-full border border-info-500 bg-white px-3 text-p3 outline-none transition focus:border-secondary-700 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Status helper functions
const getValueStatus = (value: string, minRef: number | null, maxRef: number | null) => {
  if (!value || isNaN(Number(value))) return 'no-reference';
  const numValue = parseFloat(value);

  if (minRef === null || maxRef === null) return 'no-reference';
  if (numValue < minRef) return 'below';
  if (numValue > maxRef) return 'above';
  return 'normal';
};

const getStatusTextColor = (status: string) => {
  switch (status) {
    case 'above':
      return 'text-warning-500';
    case 'below':
      return 'text-danger-600';
    case 'normal':
      return 'text-success-900';
    default:
      return 'text-pneutral-400';
  }
};

const getInputBorderColor = (status: string) => {
  switch (status) {
    case 'above':
      return 'border-warning-500';
    case 'below':
      return 'border-danger-600';
    case 'normal':
      return 'border-info-500';
    default:
      return 'border-info-500';
  }
};

const getRowBackground = (status: string) => {
  switch (status) {
    case 'above':
      return 'bg-warning-50';
    case 'below':
      return 'bg-danger-50';
    default:
      return '';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'above': return 'High';
    case 'below': return 'Low';
    case 'normal': return 'Normal';
    default: return '';
  }
};

const PatientReportDataFill: React.FC<PatientReportDataFillProps> = ({
  selectedPatient,
  selectedTest,
  setUpdateCollectionTable,
  setShowModal
}) => {
  const { currentLab } = useLabs();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
  const [inputValues, setInputValues] = useState<Record<string, Record<string | number, string>>>({});
  const [allTests, setAllTests] = useState<TestList[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [differentialValidation, setDifferentialValidation] = useState<{
    total: number;
    type: string;
    message: string;
    calculation: string;
  } | null>(null);

  // Modal states for differential count validation
  const [showDifferentialModal, setShowDifferentialModal] = useState(false);
  const [differentialResult, setDifferentialResult] = useState<{
    total: number;
    type: string;
    message: string;
    calculation: string;
  } | null>(null);
  const [lastDifferentialValues, setLastDifferentialValues] = useState<string>('');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const isModalManuallyClosed = React.useRef(false);

  const filterReferenceData = useCallback((referenceData: Record<string, TestReferancePoint[]>) => {
    const filteredData: Record<string, TestReferancePoint[]> = {};

    Object.keys(referenceData).forEach((testName) => {
      const testPoints = referenceData[testName];

      const genderFilteredPoints = testPoints.filter((point) => {
        const pointGender = point.gender?.toUpperCase() || '';
        const patientGender = selectedPatient.gender?.toUpperCase() || '';

        let mappedPatientGender = '';
        if (patientGender === 'MALE') {
          mappedPatientGender = 'M';
        } else if (patientGender === 'FEMALE') {
          mappedPatientGender = 'F';
        }

        return pointGender === 'MF' ||
          pointGender === mappedPatientGender ||
          !pointGender ||
          pointGender === '';
      });

      const ageObj = selectedPatient.dateOfBirth ? calculateAgeObject(selectedPatient.dateOfBirth) : { years: 0, months: 0, days: 0 };
      const patientAgeMonths = (ageObj.years || 0) * 12 + (ageObj.months || 0);

      const toMonths = (value: number | null | undefined, unit: string | null | undefined): number => {
        if (value === null || value === undefined) return 0;
        const u = (unit || 'YEARS').toUpperCase();

        if (u === 'MONTHS' && value === 1) {
          return 12;
        }

        return u === 'MONTHS' ? value : value * 12;
      };

      const ageFilteredPoints = genderFilteredPoints.filter((point) => {
        const minMonths = toMonths(point.ageMin, point.minAgeUnit);
        const maxMonths = point.ageMax === null || point.ageMax === undefined
          ? Number.MAX_SAFE_INTEGER
          : toMonths(point.ageMax, point.maxAgeUnit);

        const isLastRange = maxMonths === Number.MAX_SAFE_INTEGER || maxMonths >= 1200;

        if (isLastRange) {
          return patientAgeMonths >= minMonths && patientAgeMonths <= maxMonths;
        } else {
          return patientAgeMonths >= minMonths && patientAgeMonths < maxMonths;
        }
      });

      filteredData[testName] = ageFilteredPoints.length > 0 ? ageFilteredPoints : genderFilteredPoints;
    });

    return filteredData;
  }, [selectedPatient.dateOfBirth, selectedPatient.gender]);

  const fetchReferenceData = useCallback(async () => {
    if (!selectedTest || !currentLab) {
      return;
    }

    setLoading(true);
    try {
      const response = await getTestReferanceRangeByTestName(currentLab.id.toString(), selectedTest.name);

      if (response) {
        const responseArray = Array.isArray(response) ? response : [response];
        
        const filteredData = filterReferenceData({ [selectedTest.name]: responseArray });
        setReferencePoints(filteredData);

        const testInputs: Record<string | number, string> = {};
        responseArray.forEach((_, index) => {
          testInputs[index] = '';
          const descriptionKey = `${index}_description`;
          testInputs[descriptionKey] = '';
        });

        setInputValues(prev => ({
          ...prev,
          [selectedTest.name]: testInputs
        }));
      }
    } catch (error) {
      let errorMessage = 'Failed to fetch test reference data';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
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

  // Reset modal state when test changes
  useEffect(() => {
    setShowDifferentialModal(false);
    setDifferentialResult(null);
    setLastDifferentialValues('');
    isModalManuallyClosed.current = false;
  }, [selectedTest]);

  // Monitor differential validation changes and show modal
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set a new debounced timer
    const timer = setTimeout(() => {
      // Check if we have differential validation from AutoCalculation
      if (differentialValidation) {
        const currentValues = JSON.stringify(differentialValidation);
        // Only show modal if values have changed, modal is not already showing, 
        // and not manually closed recently
        if (currentValues !== lastDifferentialValues && 
            !showDifferentialModal && 
            !isModalManuallyClosed.current) {
          setDifferentialResult(differentialValidation);
          setShowDifferentialModal(true);
          setLastDifferentialValues(currentValues);
        }
      }
    }, 1000);

    setDebounceTimer(timer);

    // Cleanup function
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
    // IMPORTANT: Remove showDifferentialModal from dependencies to prevent re-trigger on modal close
  }, [differentialValidation, lastDifferentialValues]);

  const handleInputChange = (testName: string, index: number | string, value: string) => {
    const numericValue = parseFloat(value);

    // Prevent negative values for non-auto-calculated fields
    if (value !== '' && !isNaN(numericValue) && numericValue < 0) {
        const referenceData = referencePoints[testName] || [];
        const point = referenceData[typeof index === 'number' ? index : 0];
        
        // Pass testName to isAutoCalculatedField
        if (point && !AutoCalculation.isAutoCalculatedField(point.testDescription || '', testName)) {
            toast.error('Negative values are not allowed');
            return;
        }
    }

    setInputValues(prev => {
        const currentTestInputs = prev[testName] || {};
        const updated = {
            ...prev,
            [testName]: {
                ...currentTestInputs,
                [index]: value
            }
        };

        const updatedInputs = updated[testName];
        const refData = referencePoints[testName] || [];

        if (refData.length > 0) {
            const point = refData[typeof index === 'number' ? index : 0];
            const isDropdownField = point?.testDescription?.toUpperCase().includes('DROPDOWN') || 
                                    point?.testDescription?.toUpperCase().includes('DROPDOWN WITH DESCRIPTION');
            
            if (!isDropdownField) {
                const result = AutoCalculation.calculate(testName, updatedInputs, refData);
                updated[testName] = result.updatedInputs;
                
                if (result.differentialValidation) {
                    setDifferentialValidation(result.differentialValidation);
                }
            }
        }

        return updated;
    });

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
        if (test.category === 'RADIOLOGY') {
            return;
        }

        const testInputs = inputValues[test.name] || {};
        const referenceData = referencePoints[test.name] || [];

        referenceData.forEach((point, index) => {
            const descriptionUpper = (point.testDescription || '').toUpperCase();
            if (descriptionUpper === 'DETAILED REPORT') {
                return;
            }

            // Pass test name to isAutoCalculatedField
            if (AutoCalculation.isAutoCalculatedField(point.testDescription || '', test.name)) {
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

  const handleSaveAndGenerate = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedReportData: ReportData[] = [];

      allTests.forEach((test) => {
        if (test.category === 'RADIOLOGY') {
          const formattedTestName = test.name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

          const formattedCategory = test.category
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

          const detailedReportPoint = referencePoints[test.name]?.find(point => point.testDescription === "DETAILED REPORT");
          generatedReportData.push({
            visit_id: selectedPatient.visitId.toString(),
            testName: formattedTestName,
            testCategory: formattedCategory,
            patientName: selectedPatient.patientname,
            referenceDescription: detailedReportPoint?.testDescription || "RADIOLOGY_TEST",
            referenceRange: "N/A",
            enteredValue: "Hard copy will be provided",
            referenceAgeRange: "N/A",
            unit: "N/A",
            description: "Imaging test - Results provided separately",
            referenceRanges: detailedReportPoint?.referenceRanges || undefined,
            reportJson: detailedReportPoint?.reportJson || undefined
          });

          return;
        }

        const testInputs = inputValues[test.name] || {};
        const referenceData = referencePoints[test.name] || [];

        referenceData.forEach((point, index) => {
          if (testInputs[index] || (point.testDescription && point.testDescription !== "No reference available for this test")) {
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
            const hasReferenceRange =
              point.minReferenceRange !== null &&
              point.minReferenceRange !== undefined ||
              point.maxReferenceRange !== null &&
              point.maxReferenceRange !== undefined;
            const resolvedReferenceRange = hasReferenceRange
              ? `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`
              : "N/A";

            const descriptionKey = `${index}_description`;
            const hasDescription = testInputs[descriptionKey] && testInputs[descriptionKey].trim();

            const hasApiDropdown = hasValidDropdown(point.dropdown);

            if (point.testDescription === "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE" ||
              point.testDescription === "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT") {
              unit = point.units || "N/A";
              description = hasDescription ? testInputs[descriptionKey] : "N/A";
              finalValue = testInputs[index] || "N/A";
              referenceRange = resolvedReferenceRange;
            } else if (hasApiDropdown || ["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
              "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"].includes(point.testDescription)) {
              unit = point.units || "N/A";
              description = "N/A";
              finalValue = testInputs[index] || "N/A";
              referenceRange = resolvedReferenceRange;
            } else if (point.testDescription === "DESCRIPTION") {
              unit = "N/A";
              description = testInputs[index] || "N/A";
              finalValue = testInputs[index] || "N/A";
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

      const response = await createReportWithTestResult(currentLab?.id.toString() || '', completePayload);

      if (response !== undefined && response !== null) {
        toast.success('Report submitted successfully!');
        setUpdateCollectionTable(prev => !prev);
        setShowModal(false);
      } else {
        toast.error('Failed to submit report');
      }
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Loader type="progress" fullScreen={false} text="Loading report data..." />
        <p className="mt-4 text-sm text-gray-600">Fetching test and reference data...</p>
      </div>
    );
  }

  // Get the reference data for the current test
  const currentTestRefs = referencePoints[selectedTest?.name] || [];

  // If no reference data is available, show a message
  if (!loading && currentTestRefs.length === 0 && selectedTest) {
    return (
      <div className="min-h-screen bg-info-50 p-6">
        <div className="bg-white rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reference Data Available</h3>
          <p className="text-gray-600">No reference ranges found for {selectedTest.name}</p>
          <button
            onClick={() => setShowModal(false)}
            className="mt-4 px-4 py-2 bg-secondary-700 text-white rounded-full"
          >
            Back to Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-info-50">
      {/* Differential Count Validation Alert - Only for CBC */}
      {differentialValidation && (
        <div className={`mb-4 rounded-2xl border p-4 ${
          differentialValidation.type === 'error' 
            ? 'bg-red-50 border-red-300' 
            : 'bg-green-50 border-green-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {differentialValidation.type === 'error' ? (
                <TbX className="text-red-500 mr-3" size={24} />
              ) : (
                <TbSquareRoundedCheck className="text-green-500 mr-3" size={24} />
              )}
              <div>
                <span className={`text-base font-semibold ${
                  differentialValidation.type === 'error' ? 'text-red-800' : 'text-green-800'
                }`}>
                  {differentialValidation.message}
                </span>
                <p className={`text-sm mt-1 ${
                  differentialValidation.type === 'error' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {differentialValidation.type === 'error' ? 
                    'Please check your differential count values' :
                    'Differential count is correctly balanced'
                  }
                </p>
              </div>
            </div>
            <div className={`text-lg font-bold ${
              differentialValidation.type === 'error' ? 'text-red-600' : 'text-green-600'
            }`}>
              Total: {differentialValidation.total}
            </div>
          </div>
        </div>
      )}

      {/* Differential Count Validation Modal */}
      {differentialResult && (
        <NewModal
          isOpen={showDifferentialModal}
          onClose={() => {
            setShowDifferentialModal(false);
            isModalManuallyClosed.current = true;
            setTimeout(() => {
              isModalManuallyClosed.current = false;
            }, 2000);
          }}
          title="Differential Count Validation"
          modalClassName="max-w-xl"
        >
          <div className={`text-center p-6 rounded-lg border-2 ${
            differentialResult.type === 'success'
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}>
            <div className={`text-4xl font-bold mb-2 ${
              differentialResult.type === 'success'
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {differentialResult.total}
            </div>
            <div className={`text-lg font-semibold ${
              differentialResult.type === 'success'
                ? 'text-green-800'
                : 'text-red-800'
            }`}>
              Differential Count
            </div>
            <div className={`text-sm mt-2 ${
              differentialResult.type === 'success'
                ? 'text-green-700'
                : 'text-red-700'
            }`}>
              {differentialResult.type === 'success'
                ? 'Perfect! All values are balanced.'
                : 'Please review your differential count values.'}
            </div>
            <div className={`text-p3 mt-3 text-pneutral-900`}>
              Calculation: {differentialResult.calculation} = {differentialResult.total}
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setShowDifferentialModal(false);
                isModalManuallyClosed.current = true;
                setTimeout(() => {
                  isModalManuallyClosed.current = false;
                }, 2000);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </NewModal>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-h6 font-semibold text-[#101828]">
            Enter Test Result Data
          </h1>

          <p className="mt-1 text-p3 font-medium text-[#99A1AF]">
            {selectedPatient.visitDate ? new Date(selectedPatient.visitDate).toLocaleDateString() : 'N/A'} • {selectedTest?.name || 'Test'}
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setShowModal(false)}
            className="flex items-center gap-2 rounded-full border border-pneutral-600 px-3 py-2 text-label-l3 font-medium text-pneutral-600"
          >
            <IoArrowBack className="h-4 w-4 text-pneutral-600" />
            Back to Queue
          </button>

          <button
            onClick={handleSaveAndGenerate}
            disabled={isSubmitting}
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-label-l3 font-medium text-pneutral-50 ${
              isSubmitting ? 'bg-pneutral-400 cursor-not-allowed' : 'bg-secondary-700'
            }`}
          >
            <CiCircleCheck className="h-5 w-5" />
            {isSubmitting ? 'Saving...' : 'Save & Generate Report'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left Side - Test Table */}
        <div className="space-y-6">
          {/* Test Header Card */}
          <div className="rounded-xl border border-pneutral-200 bg-white px-4 py-3">
            <h3 className="text-label-l4 font-medium text-pneutral-900">
              {selectedTest?.name} — {selectedTest?.category || 'Test'}
            </h3>
          </div>

          {/* Test Table Card */}
          <div className="overflow-hidden rounded-xl border border-pneutral-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-pneutral-200 bg-white text-left text-label-l3 text-pneutral-900">
                    <th className="px-4 py-3">Parameter</th>
                    <th className="px-4 py-3">Result</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Ref. Range</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {currentTestRefs.map((point, index) => {
                    const currentValue = inputValues[selectedTest?.name]?.[index] || "";
                    const descriptionValue = inputValues[selectedTest?.name]?.[`${index}_description`] || "";
                    
                    const dropdownResult = parseDropdownField(point.dropdown);
                    const hasApiDropdown = dropdownResult.isValid;
                    const dropdownItems = dropdownResult.data;

                    const isDropdown = hasApiDropdown || 
                      ["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
                       "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"]
                      .includes(point.testDescription || '');

                    const isDropdownWithDescription = 
                      point.testDescription === "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE" ||
                      point.testDescription === "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT";

                    const isDescription = point.testDescription === "DESCRIPTION";
                    const isDetailedReport = point.testDescription === "DETAILED REPORT";

                    let dropdownOptions: DropdownItem[] = [];
                    
                    if (hasApiDropdown && dropdownItems && dropdownItems.length > 0) {
                      dropdownOptions = dropdownItems;
                    } else if (isDropdown) {
                      const desc = point.testDescription?.toUpperCase() || '';
                      const name = selectedTest?.name?.toUpperCase() || '';
                      
                      if (name.includes('BLOOD GROUP') || name.includes('BLOOD TYPE') || desc.includes('BLOOD GROUP') || desc.includes('BLOOD TYPE')) {
                        dropdownOptions = [
                          { label: 'A+', value: 'A+' },
                          { label: 'A-', value: 'A-' },
                          { label: 'B+', value: 'B+' },
                          { label: 'B-', value: 'B-' },
                          { label: 'AB+', value: 'AB+' },
                          { label: 'AB-', value: 'AB-' },
                          { label: 'O+', value: 'O+' },
                          { label: 'O-', value: 'O-' }
                        ];
                      } else if (desc.includes('POSITIVE/NEGATIVE') || name.includes('POSITIVE/NEGATIVE')) {
                        dropdownOptions = [{ label: 'Positive', value: 'Positive' }, { label: 'Negative', value: 'Negative' }];
                      } else if (desc.includes('PRESENT/ABSENT') || name.includes('PRESENT/ABSENT')) {
                        dropdownOptions = [{ label: 'Present', value: 'Present' }, { label: 'Absent', value: 'Absent' }];
                      } else if (desc.includes('REACTIVE/NONREACTIVE') || name.includes('REACTIVE/NONREACTIVE')) {
                        dropdownOptions = [{ label: 'Reactive', value: 'Reactive' }, { label: 'Non-Reactive', value: 'Non-Reactive' }];
                      } else if (desc.includes('COMPATIBLE/INCOMPATIBLE') || name.includes('COMPATIBLE/INCOMPATIBLE')) {
                        dropdownOptions = [{ label: 'Compatible', value: 'Compatible' }, { label: 'Incompatible', value: 'Incompatible' }];
                      } else {
                        dropdownOptions = [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }];
                      }
                    }

                    let status = 'no-reference';
                    const minRef = point.minReferenceRange;
                    const maxRef = point.maxReferenceRange;
                    
                    if (!isDropdown && !isDescription && !isDropdownWithDescription && currentValue && !isNaN(Number(currentValue))) {
                      status = getValueStatus(currentValue, minRef, maxRef);
                    }

                    if (isDetailedReport) {
                      return null;
                    }

                   const isAutoCalculated = AutoCalculation.isAutoCalculatedField(
    point.testDescription || '', 
    selectedTest?.name || ''
);

                    return (
                      <tr
                        key={index}
                        className={`border-b border-pneutral-200 last:border-0 ${getRowBackground(status)}`}
                      >
                        <td className="px-4 py-3 text-p3 text-pneutral-900">
                          {point.testDescription || `Parameter ${index + 1}`}
                          {isAutoCalculated && (
                            <span className="ml-2 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                              Auto-calc
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-p3">
                          {isDropdownWithDescription ? (
                            <div className="flex flex-col gap-1">
                              <DropdownInput
                                value={currentValue}
                                onChange={(value) =>
                                  handleInputChange(selectedTest?.name, index, value)
                                }
                                options={dropdownOptions}
                                placeholder="Select value"
                              />
                              <input
                                type="text"
                                value={descriptionValue}
                                placeholder="Enter description"
                                onChange={(e) =>
                                  handleInputChange(selectedTest?.name, `${index}_description`, e.target.value)
                                }
                                className="h-9 w-48 rounded-full border border-info-500 bg-white px-3 text-p3 outline-none transition focus:border-secondary-700 text-sm"
                              />
                            </div>
                          ) : isDescription ? (
                            <input
                              type="text"
                              value={currentValue}
                              placeholder="Enter description"
                              onChange={(e) =>
                                handleInputChange(selectedTest?.name, index, e.target.value)
                              }
                              className="h-9 w-48 rounded-full border border-info-500 bg-white px-3 text-p3 outline-none transition focus:border-secondary-700"
                            />
                          ) : isDropdown ? (
                            <DropdownInput
                              value={currentValue}
                              onChange={(value) =>
                                handleInputChange(selectedTest?.name, index, value)
                              }
                              options={dropdownOptions}
                              placeholder="Select value"
                            />
                          ) : (
                            <input
                              type="number"
                              value={currentValue}
                              placeholder="Enter value"
                              onChange={(e) =>
                                handleInputChange(selectedTest?.name, index, e.target.value)
                              }
                              className={`h-9 w-32 rounded-full border bg-white px-3 text-p3 outline-none transition ${getInputBorderColor(status)}`}
                              disabled={isAutoCalculated}
                              step="any"
                            />
                          )}
                        </td>

                        <td className="px-4 py-3 text-p3 text-pneutral-900">
                          {isDescription || isDropdown || isDropdownWithDescription ? '-' : (point.units || 'N/A')}
                        </td>

                        <td className="px-4 py-3 text-p3 text-sneutral-500">
                          {isDescription || isDropdown || isDropdownWithDescription ? '-' : (
                            point.minReferenceRange !== null && point.maxReferenceRange !== null
                              ? `${point.minReferenceRange} - ${point.maxReferenceRange}`
                              : 'N/A'
                          )}
                        </td>

                        <td
                          className={`px-4 py-3 text-p3 font-medium ${getStatusTextColor(status)}`}
                        >
                          {isDescription || isDropdown || isDropdownWithDescription ? '-' : (getStatusLabel(status) || '-')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Patient Details */}
        <aside>
          <div className="rounded-2xl border border-white bg-white p-4">
            <h3 className="mb-5 text-p3 font-semibold text-pneutral-900">
              {selectedPatient.patientname || 'Patient Name'}
            </h3>

            <div className="space-y-3">
              <InfoRow
                label="Patient ID"
                value={`PAT-${String(selectedPatient.visitId).padStart(5, '0')}`}
              />
              <InfoRow
                label="Age / Gender"
                value={`${selectedPatient.dateOfBirth ? `${calculateAgeObject(selectedPatient.dateOfBirth).years} Yrs, ` : ''}${selectedPatient.gender || 'N/A'}`}
              />
              <InfoRow
                label="Doctor"
                value="Dr. R. Mehta"
              />
              <InfoRow label="Visit Type" value="OPD" />
              <InfoRow
                label="Contact"
                value={selectedPatient.contactNumber || 'N/A'}
              />
              <InfoRow
                label="Tests Ordered"
                value={selectedTest?.name || 'N/A'}
              />
            </div>

            <div className="mt-6 rounded-xl border border-info-200 bg-info-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-p2 font-semibold text-pneutral-900">
                  Visit Information
                </h4>

                <span className="text-p2 text-pneutral-500">
                  {selectedPatient.visitDate ? new Date(selectedPatient.visitDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <InfoRow
                label="Status"
                value={selectedPatient.visitStatus?.replace('_', ' ') || 'Completed'}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PatientReportDataFill;










// code with pop up modal cbc test..............dated 02.07.2026

// "use client";

// import React, { useState, useCallback, useEffect } from "react";
// import { CiCircleCheck } from "react-icons/ci";
// import { IoArrowBack } from "react-icons/io5";
// import { toast } from 'react-toastify';
// import Loader from '@/app/(admin)/component/common/Loader';
// import { useLabs } from '@/context/LabContext';
// import { TestList, TestReferancePoint } from '@/types/test/testlist';
// import { getTestReferanceRangeByTestName } from '@/../services/testService';
// import { createReportWithTestResult } from '@/../services/reportServices';
// import { calculateAgeObject } from '@/utils/ageUtils';
// import { hasValidDropdown, parseDropdownField, DropdownItem } from '@/utils/dropdownParser';
// import AutoCalculation from './AutoCalculation';
// import { TbSquareRoundedCheck, TbX } from "react-icons/tb";
// import NewModal from "../../../newcommoncomponent/NewModal";

// // Interfaces
// export interface Patient {
//   visitId: number;
//   patientname: string;
//   gender: string;
//   contactNumber: string;
//   email: string;
//   visitDate: string;
//   visitStatus: string;
//   sampleNames: string[];
//   testIds: number[];
//   packageIds: number[];
//   dateOfBirth?: string;
// }

// interface ReportData {
//   visit_id: string;
//   testName: string;
//   testCategory: string;
//   patientName: string;
//   referenceDescription: string;
//   referenceRange: string;
//   referenceAgeRange: string;
//   enteredValue: string;
//   unit: string;
//   description: string;
//   referenceRanges?: string;
//   reportJson?: string;
// }

// interface ReportPayload {
//   testData: ReportData[];
//   testResult: {
//     testId: number;
//     isFilled: boolean;
//   };
// }

// interface PatientReportDataFillProps {
//   selectedPatient: Patient;
//   selectedTest: TestList;
//   updateCollectionTable: boolean;
//   setUpdateCollectionTable: (value: React.SetStateAction<boolean>) => void;
//   setShowModal: (value: React.SetStateAction<boolean>) => void;
// }

// // InfoRow Component for Sidebar
// const InfoRow = ({ label, value }: { label: string; value: string }) => {
//   return (
//     <div className="flex items-start justify-between text-p3 gap-4">
//       <span className="text-pneutral-500">{label}</span>
//       <span className="text-right font-medium text-pneutral-900">
//         {value}
//       </span>
//     </div>
//   );
// };

// // Dropdown Component with NEW UI styling
// const DropdownInput = ({ 
//   value, 
//   onChange, 
//   options,
//   placeholder = "Select value",
//   disabled = false
// }: { 
//   value: string; 
//   onChange: (value: string) => void; 
//   options: DropdownItem[];
//   placeholder?: string;
//   disabled?: boolean;
// }) => {
//   return (
//     <select
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       disabled={disabled}
//       className="h-9 w-32 rounded-full border border-info-500 bg-white px-3 text-p3 outline-none transition focus:border-secondary-700 disabled:opacity-60 disabled:cursor-not-allowed"
//     >
//       <option value="">{placeholder}</option>
//       {options.map((option) => (
//         <option key={option.value} value={option.value}>
//           {option.label}
//         </option>
//       ))}
//     </select>
//   );
// };

// // Status helper functions
// const getValueStatus = (value: string, minRef: number | null, maxRef: number | null) => {
//   if (!value || isNaN(Number(value))) return 'no-reference';
//   const numValue = parseFloat(value);

//   if (minRef === null || maxRef === null) return 'no-reference';
//   if (numValue < minRef) return 'below';
//   if (numValue > maxRef) return 'above';
//   return 'normal';
// };

// const getStatusTextColor = (status: string) => {
//   switch (status) {
//     case 'above':
//       return 'text-warning-500';
//     case 'below':
//       return 'text-danger-600';
//     case 'normal':
//       return 'text-success-900';
//     default:
//       return 'text-pneutral-400';
//   }
// };

// const getInputBorderColor = (status: string) => {
//   switch (status) {
//     case 'above':
//       return 'border-warning-500';
//     case 'below':
//       return 'border-danger-600';
//     case 'normal':
//       return 'border-info-500';
//     default:
//       return 'border-info-500';
//   }
// };

// const getRowBackground = (status: string) => {
//   switch (status) {
//     case 'above':
//       return 'bg-warning-50';
//     case 'below':
//       return 'bg-danger-50';
//     default:
//       return '';
//   }
// };

// const getStatusLabel = (status: string) => {
//   switch (status) {
//     case 'above': return 'High';
//     case 'below': return 'Low';
//     case 'normal': return 'Normal';
//     default: return '';
//   }
// };

// const PatientReportDataFill: React.FC<PatientReportDataFillProps> = ({
//   selectedPatient,
//   selectedTest,
//   setUpdateCollectionTable,
//   setShowModal
// }) => {
//   const { currentLab } = useLabs();
  
//   // State management
//   const [loading, setLoading] = useState(false);
//   const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
//   const [inputValues, setInputValues] = useState<Record<string, Record<string | number, string>>>({});
//   const [allTests, setAllTests] = useState<TestList[]>([]);
//   const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [differentialValidation, setDifferentialValidation] = useState<{
//     total: number;
//     type: string;
//     message: string;
//     calculation: string;
//   } | null>(null);

//   // Modal states for differential count validation
//   const [showDifferentialModal, setShowDifferentialModal] = useState(false);
//   const [differentialResult, setDifferentialResult] = useState<{
//     total: number;
//     type: string;
//     message: string;
//     calculation: string;
//   } | null>(null);
//   const [lastDifferentialValues, setLastDifferentialValues] = useState<string>('');
//   const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
//   const isModalManuallyClosed = React.useRef(false);

//   const filterReferenceData = useCallback((referenceData: Record<string, TestReferancePoint[]>) => {
//     const filteredData: Record<string, TestReferancePoint[]> = {};

//     Object.keys(referenceData).forEach((testName) => {
//       const testPoints = referenceData[testName];

//       const genderFilteredPoints = testPoints.filter((point) => {
//         const pointGender = point.gender?.toUpperCase() || '';
//         const patientGender = selectedPatient.gender?.toUpperCase() || '';

//         let mappedPatientGender = '';
//         if (patientGender === 'MALE') {
//           mappedPatientGender = 'M';
//         } else if (patientGender === 'FEMALE') {
//           mappedPatientGender = 'F';
//         }

//         return pointGender === 'MF' ||
//           pointGender === mappedPatientGender ||
//           !pointGender ||
//           pointGender === '';
//       });

//       const ageObj = selectedPatient.dateOfBirth ? calculateAgeObject(selectedPatient.dateOfBirth) : { years: 0, months: 0, days: 0 };
//       const patientAgeMonths = (ageObj.years || 0) * 12 + (ageObj.months || 0);

//       const toMonths = (value: number | null | undefined, unit: string | null | undefined): number => {
//         if (value === null || value === undefined) return 0;
//         const u = (unit || 'YEARS').toUpperCase();

//         if (u === 'MONTHS' && value === 1) {
//           return 12;
//         }

//         return u === 'MONTHS' ? value : value * 12;
//       };

//       const ageFilteredPoints = genderFilteredPoints.filter((point) => {
//         const minMonths = toMonths(point.ageMin, point.minAgeUnit);
//         const maxMonths = point.ageMax === null || point.ageMax === undefined
//           ? Number.MAX_SAFE_INTEGER
//           : toMonths(point.ageMax, point.maxAgeUnit);

//         const isLastRange = maxMonths === Number.MAX_SAFE_INTEGER || maxMonths >= 1200;

//         if (isLastRange) {
//           return patientAgeMonths >= minMonths && patientAgeMonths <= maxMonths;
//         } else {
//           return patientAgeMonths >= minMonths && patientAgeMonths < maxMonths;
//         }
//       });

//       filteredData[testName] = ageFilteredPoints.length > 0 ? ageFilteredPoints : genderFilteredPoints;
//     });

//     return filteredData;
//   }, [selectedPatient.dateOfBirth, selectedPatient.gender]);

//   const fetchReferenceData = useCallback(async () => {
//     if (!selectedTest || !currentLab) {
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await getTestReferanceRangeByTestName(currentLab.id.toString(), selectedTest.name);

//       if (response) {
//         const responseArray = Array.isArray(response) ? response : [response];
        
//         const filteredData = filterReferenceData({ [selectedTest.name]: responseArray });
//         setReferencePoints(filteredData);

//         const testInputs: Record<string | number, string> = {};
//         responseArray.forEach((_, index) => {
//           testInputs[index] = '';
//           const descriptionKey = `${index}_description`;
//           testInputs[descriptionKey] = '';
//         });

//         setInputValues(prev => ({
//           ...prev,
//           [selectedTest.name]: testInputs
//         }));
//       }
//     } catch (error) {
//       let errorMessage = 'Failed to fetch test reference data';
//       if (error instanceof Error) {
//         errorMessage = error.message;
//       }
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedTest, currentLab, filterReferenceData]);

//   useEffect(() => {
//     if (selectedTest) {
//       setAllTests([selectedTest]);
//       fetchReferenceData();
//     }
//   }, [selectedTest, fetchReferenceData]);

//   // Reset modal state when test changes
//   useEffect(() => {
//     setShowDifferentialModal(false);
//     setDifferentialResult(null);
//     setLastDifferentialValues('');
//     isModalManuallyClosed.current = false;
//   }, [selectedTest]);

//   // Monitor differential validation changes and show modal
//   useEffect(() => {
//     // Clear any existing timer
//     if (debounceTimer) {
//       clearTimeout(debounceTimer);
//     }

//     // Set a new debounced timer
//     const timer = setTimeout(() => {
//       // Check if we have differential validation from AutoCalculation
//       if (differentialValidation) {
//         const currentValues = JSON.stringify(differentialValidation);
//         // Only show modal if values have changed, modal is not already showing, 
//         // and not manually closed recently
//         if (currentValues !== lastDifferentialValues && 
//             !showDifferentialModal && 
//             !isModalManuallyClosed.current) {
//           setDifferentialResult(differentialValidation);
//           setShowDifferentialModal(true);
//           setLastDifferentialValues(currentValues);
//         }
//       }
//     }, 1000);

//     setDebounceTimer(timer);

//     // Cleanup function
//     return () => {
//       if (timer) {
//         clearTimeout(timer);
//       }
//     };
//     // IMPORTANT: Remove showDifferentialModal from dependencies to prevent re-trigger on modal close
//   }, [differentialValidation, lastDifferentialValues]);

//   const handleInputChange = (testName: string, index: number | string, value: string) => {
//     const numericValue = parseFloat(value);

//     // Prevent negative values for non-auto-calculated fields
//     if (value !== '' && !isNaN(numericValue) && numericValue < 0) {
//       const referenceData = referencePoints[testName] || [];
//       const point = referenceData[typeof index === 'number' ? index : 0];
      
//       if (point && !AutoCalculation.isAutoCalculatedField(testName, point.testDescription || '')) {
//         toast.error('Negative values are not allowed');
//         return;
//       }
//     }

//     setInputValues(prev => {
//       // First update the input
//       const currentTestInputs = prev[testName] || {};
//       const updated = {
//         ...prev,
//         [testName]: {
//           ...currentTestInputs,
//           [index]: value
//         }
//       };

//       // Get the updated inputs for this test
//       const updatedInputs = updated[testName];
//       const refData = referencePoints[testName] || [];

//       // Trigger auto-calculation if we have reference data
//       if (refData.length > 0) {
//         // Skip auto-calculation for dropdown fields to avoid conflicts
//         const point = refData[typeof index === 'number' ? index : 0];
//         const isDropdownField = point?.testDescription?.toUpperCase().includes('DROPDOWN') || 
//                                 point?.testDescription?.toUpperCase().includes('DROPDOWN WITH DESCRIPTION');
        
//         // Only run auto-calculation for non-dropdown fields or when the change is from a non-dropdown field
//         if (!isDropdownField) {
//           console.log('Triggering auto-calculation for:', testName);
//           console.log('Current inputs:', updatedInputs);
          
//           const result = AutoCalculation.calculate(testName, updatedInputs, refData);
//           updated[testName] = result.updatedInputs;
          
//           // Update differential validation for CBC
//           if (result.differentialValidation) {
//             setDifferentialValidation(result.differentialValidation);
//           }
          
//           console.log('After auto-calculation:', updated[testName]);
//         }
//       }

//       return updated;
//     });

//     if (validationErrors[`${testName}-${index}`]) {
//       setValidationErrors(prev => ({
//         ...prev,
//         [`${testName}-${index}`]: false
//       }));
//     }
//   };

//   const validateForm = () => {
//     const errors: Record<string, boolean> = {};
//     let isValid = true;

//     allTests.forEach(test => {
//       if (test.category === 'RADIOLOGY') {
//         return;
//       }

//       const testInputs = inputValues[test.name] || {};
//       const referenceData = referencePoints[test.name] || [];

//       referenceData.forEach((point, index) => {
//         const descriptionUpper = (point.testDescription || '').toUpperCase();
//         if (descriptionUpper === 'DETAILED REPORT') {
//           return;
//         }

//         // Skip validation for auto-calculated fields
//         if (AutoCalculation.isAutoCalculatedField(point.testDescription || '')) {
//           return;
//         }

//         if (!testInputs[index] || testInputs[index].trim() === '') {
//           errors[`${test.name}-${index}`] = true;
//           isValid = false;
//         }
//       });
//     });

//     setValidationErrors(errors);
//     return isValid;
//   };

//   const handleSaveAndGenerate = async () => {
//     if (!validateForm()) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const generatedReportData: ReportData[] = [];

//       allTests.forEach((test) => {
//         if (test.category === 'RADIOLOGY') {
//           const formattedTestName = test.name
//             .split(' ')
//             .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//             .join(' ');

//           const formattedCategory = test.category
//             .split(' ')
//             .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//             .join(' ');

//           const detailedReportPoint = referencePoints[test.name]?.find(point => point.testDescription === "DETAILED REPORT");
//           generatedReportData.push({
//             visit_id: selectedPatient.visitId.toString(),
//             testName: formattedTestName,
//             testCategory: formattedCategory,
//             patientName: selectedPatient.patientname,
//             referenceDescription: detailedReportPoint?.testDescription || "RADIOLOGY_TEST",
//             referenceRange: "N/A",
//             enteredValue: "Hard copy will be provided",
//             referenceAgeRange: "N/A",
//             unit: "N/A",
//             description: "Imaging test - Results provided separately",
//             referenceRanges: detailedReportPoint?.referenceRanges || undefined,
//             reportJson: detailedReportPoint?.reportJson || undefined
//           });

//           return;
//         }

//         const testInputs = inputValues[test.name] || {};
//         const referenceData = referencePoints[test.name] || [];

//         referenceData.forEach((point, index) => {
//           if (testInputs[index] || (point.testDescription && point.testDescription !== "No reference available for this test")) {
//             const formattedTestName = test.name
//               .split(' ')
//               .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//               .join(' ');

//             const formattedCategory = test.category
//               .split(' ')
//               .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//               .join(' ');

//             let finalValue = testInputs[index] || "N/A";
//             let description = "N/A";
//             let unit = "N/A";
//             let referenceRange = "N/A";
//             const hasReferenceRange =
//               point.minReferenceRange !== null &&
//               point.minReferenceRange !== undefined ||
//               point.maxReferenceRange !== null &&
//               point.maxReferenceRange !== undefined;
//             const resolvedReferenceRange = hasReferenceRange
//               ? `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`
//               : "N/A";

//             const descriptionKey = `${index}_description`;
//             const hasDescription = testInputs[descriptionKey] && testInputs[descriptionKey].trim();

//             const hasApiDropdown = hasValidDropdown(point.dropdown);

//             if (point.testDescription === "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE" ||
//               point.testDescription === "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT") {
//               unit = point.units || "N/A";
//               description = hasDescription ? testInputs[descriptionKey] : "N/A";
//               finalValue = testInputs[index] || "N/A";
//               referenceRange = resolvedReferenceRange;
//             } else if (hasApiDropdown || ["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
//               "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"].includes(point.testDescription)) {
//               unit = point.units || "N/A";
//               description = "N/A";
//               finalValue = testInputs[index] || "N/A";
//               referenceRange = resolvedReferenceRange;
//             } else if (point.testDescription === "DESCRIPTION") {
//               unit = "N/A";
//               description = testInputs[index] || "N/A";
//               finalValue = testInputs[index] || "N/A";
//               referenceRange = "N/A";
//             }
//             else if (point.testDescription === "DETAILED REPORT") {
//               unit = "N/A";
//               description = "Imaging test - Results provided separately";
//               finalValue = "Hard copy will be provided";
//               referenceRange = "N/A";
//             }
//             else {
//               unit = point.units || "N/A";
//               description = "N/A";
//               finalValue = testInputs[index] || "N/A";
//               referenceRange = `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`;
//             }

//             generatedReportData.push({
//               visit_id: selectedPatient.visitId.toString(),
//               testName: formattedTestName,
//               testCategory: formattedCategory,
//               patientName: selectedPatient.patientname,
//               referenceDescription: point.testDescription || "No reference description available",
//               referenceRange: referenceRange,
//               enteredValue: finalValue,
//               referenceAgeRange: `${point.ageMin ?? "N/A"} ${point.minAgeUnit ?? "YEARS"} - ${point.ageMax ?? "N/A"} ${point.maxAgeUnit ?? "YEARS"}`,
//               unit: unit,
//               description: description,
//               referenceRanges: point.referenceRanges || undefined,
//               reportJson: point.reportJson || undefined
//             });
//           }
//         });
//       });

//       const completePayload: ReportPayload = {
//         testData: generatedReportData,
//         testResult: {
//           testId: selectedTest.id,
//           isFilled: true
//         }
//       };

//       const response = await createReportWithTestResult(currentLab?.id.toString() || '', completePayload);

//       if (response !== undefined && response !== null) {
//         toast.success('Report submitted successfully!');
//         setUpdateCollectionTable(prev => !prev);
//         setShowModal(false);
//       } else {
//         toast.error('Failed to submit report');
//       }
//     } catch (error) {
//       toast.error('Failed to submit report');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center p-6">
//         <Loader type="progress" fullScreen={false} text="Loading report data..." />
//         <p className="mt-4 text-sm text-gray-600">Fetching test and reference data...</p>
//       </div>
//     );
//   }

//   // Get the reference data for the current test
//   const currentTestRefs = referencePoints[selectedTest?.name] || [];

//   // If no reference data is available, show a message
//   if (!loading && currentTestRefs.length === 0 && selectedTest) {
//     return (
//       <div className="min-h-screen bg-info-50 p-6">
//         <div className="bg-white rounded-xl p-6 text-center">
//           <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reference Data Available</h3>
//           <p className="text-gray-600">No reference ranges found for {selectedTest.name}</p>
//           <button
//             onClick={() => setShowModal(false)}
//             className="mt-4 px-4 py-2 bg-secondary-700 text-white rounded-full"
//           >
//             Back to Queue
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-info-50">
//       {/* Differential Count Validation Alert - Only for CBC */}
//       {differentialValidation && (
//         <div className={`mb-4 rounded-2xl border p-4 ${
//           differentialValidation.type === 'error' 
//             ? 'bg-red-50 border-red-300' 
//             : 'bg-green-50 border-green-300'
//         }`}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               {differentialValidation.type === 'error' ? (
//                 <TbX className="text-red-500 mr-3" size={24} />
//               ) : (
//                 <TbSquareRoundedCheck className="text-green-500 mr-3" size={24} />
//               )}
//               <div>
//                 <span className={`text-base font-semibold ${
//                   differentialValidation.type === 'error' ? 'text-red-800' : 'text-green-800'
//                 }`}>
//                   {differentialValidation.message}
//                 </span>
//                 <p className={`text-sm mt-1 ${
//                   differentialValidation.type === 'error' ? 'text-red-600' : 'text-green-600'
//                 }`}>
//                   {differentialValidation.type === 'error' ? 
//                     'Please check your differential count values' :
//                     'Differential count is correctly balanced'
//                   }
//                 </p>
//               </div>
//             </div>
//             <div className={`text-lg font-bold ${
//               differentialValidation.type === 'error' ? 'text-red-600' : 'text-green-600'
//             }`}>
//               Total: {differentialValidation.total}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Differential Count Validation Modal */}
//       {differentialResult && (
//         <NewModal
//           isOpen={showDifferentialModal}
//           onClose={() => {
//             setShowDifferentialModal(false);
//             isModalManuallyClosed.current = true;
//             setTimeout(() => {
//               isModalManuallyClosed.current = false;
//             }, 2000);
//           }}
//           title="Differential Count Validation"
//           modalClassName="max-w-xl"
//         >
//           <div className={`text-center p-6 rounded-lg border-2 ${
//             differentialResult.type === 'success'
//               ? 'bg-green-50 border-green-300'
//               : 'bg-red-50 border-red-300'
//           }`}>
//             <div className={`text-4xl font-bold mb-2 ${
//               differentialResult.type === 'success'
//                 ? 'text-green-600'
//                 : 'text-red-600'
//             }`}>
//               {differentialResult.total}
//             </div>
//             <div className={`text-lg font-semibold ${
//               differentialResult.type === 'success'
//                 ? 'text-green-800'
//                 : 'text-red-800'
//             }`}>
//               Differential Count
//             </div>
//             <div className={`text-sm mt-2 ${
//               differentialResult.type === 'success'
//                 ? 'text-green-700'
//                 : 'text-red-700'
//             }`}>
//               {differentialResult.type === 'success'
//                 ? 'Perfect! All values are balanced.'
//                 : 'Please review your differential count values.'}
//             </div>
//             <div className={`text-p3 mt-3 text-pneutral-900`}>
//               Calculation: {differentialResult.calculation} = {differentialResult.total}
//             </div>
//           </div>

//           <div className="mt-4 text-center">
//             <button
//               onClick={() => {
//                 setShowDifferentialModal(false);
//                 isModalManuallyClosed.current = true;
//                 setTimeout(() => {
//                   isModalManuallyClosed.current = false;
//                 }, 2000);
//               }}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </NewModal>
//       )}

//       {/* Header */}
//       <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//         <div>
//           <h1 className="text-h6 font-semibold text-[#101828]">
//             Enter Test Result Data
//           </h1>

//           <p className="mt-1 text-p3 font-medium text-[#99A1AF]">
//             {selectedPatient.visitDate ? new Date(selectedPatient.visitDate).toLocaleDateString() : 'N/A'} • {selectedTest?.name || 'Test'}
//           </p>
//         </div>

//         <div className="flex gap-3">
//           <button 
//             onClick={() => setShowModal(false)}
//             className="flex items-center gap-2 rounded-full border border-pneutral-600 px-3 py-2 text-label-l3 font-medium text-pneutral-600"
//           >
//             <IoArrowBack className="h-4 w-4 text-pneutral-600" />
//             Back to Queue
//           </button>

//           <button
//             onClick={handleSaveAndGenerate}
//             disabled={isSubmitting}
//             className={`flex items-center gap-2 rounded-full px-3 py-2 text-label-l3 font-medium text-pneutral-50 ${
//               isSubmitting ? 'bg-pneutral-400 cursor-not-allowed' : 'bg-secondary-700'
//             }`}
//           >
//             <CiCircleCheck className="h-5 w-5" />
//             {isSubmitting ? 'Saving...' : 'Save & Generate Report'}
//           </button>
//         </div>
//       </div>

//       <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
//         {/* Left Side - Test Table */}
//         <div className="space-y-6">
//           {/* Test Header Card */}
//           <div className="rounded-xl border border-pneutral-200 bg-white px-4 py-3">
//             <h3 className="text-label-l4 font-medium text-pneutral-900">
//               {selectedTest?.name} — {selectedTest?.category || 'Test'}
//             </h3>
//           </div>

//           {/* Test Table Card */}
//           <div className="overflow-hidden rounded-xl border border-pneutral-200 bg-white">
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[750px]">
//                 <thead>
//                   <tr className="border-b border-pneutral-200 bg-white text-left text-label-l3 text-pneutral-900">
//                     <th className="px-4 py-3">Parameter</th>
//                     <th className="px-4 py-3">Result</th>
//                     <th className="px-4 py-3">Unit</th>
//                     <th className="px-4 py-3">Ref. Range</th>
//                     <th className="px-4 py-3">Status</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {currentTestRefs.map((point, index) => {
//                     const currentValue = inputValues[selectedTest?.name]?.[index] || "";
//                     const descriptionValue = inputValues[selectedTest?.name]?.[`${index}_description`] || "";
                    
//                     const dropdownResult = parseDropdownField(point.dropdown);
//                     const hasApiDropdown = dropdownResult.isValid;
//                     const dropdownItems = dropdownResult.data;

//                     const isDropdown = hasApiDropdown || 
//                       ["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
//                        "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"]
//                       .includes(point.testDescription || '');

//                     const isDropdownWithDescription = 
//                       point.testDescription === "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE" ||
//                       point.testDescription === "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT";

//                     const isDescription = point.testDescription === "DESCRIPTION";
//                     const isDetailedReport = point.testDescription === "DETAILED REPORT";

//                     let dropdownOptions: DropdownItem[] = [];
                    
//                     if (hasApiDropdown && dropdownItems && dropdownItems.length > 0) {
//                       dropdownOptions = dropdownItems;
//                     } else if (isDropdown) {
//                       const desc = point.testDescription?.toUpperCase() || '';
//                       const name = selectedTest?.name?.toUpperCase() || '';
                      
//                       if (name.includes('BLOOD GROUP') || name.includes('BLOOD TYPE') || desc.includes('BLOOD GROUP') || desc.includes('BLOOD TYPE')) {
//                         dropdownOptions = [
//                           { label: 'A+', value: 'A+' },
//                           { label: 'A-', value: 'A-' },
//                           { label: 'B+', value: 'B+' },
//                           { label: 'B-', value: 'B-' },
//                           { label: 'AB+', value: 'AB+' },
//                           { label: 'AB-', value: 'AB-' },
//                           { label: 'O+', value: 'O+' },
//                           { label: 'O-', value: 'O-' }
//                         ];
//                       } else if (desc.includes('POSITIVE/NEGATIVE') || name.includes('POSITIVE/NEGATIVE')) {
//                         dropdownOptions = [{ label: 'Positive', value: 'Positive' }, { label: 'Negative', value: 'Negative' }];
//                       } else if (desc.includes('PRESENT/ABSENT') || name.includes('PRESENT/ABSENT')) {
//                         dropdownOptions = [{ label: 'Present', value: 'Present' }, { label: 'Absent', value: 'Absent' }];
//                       } else if (desc.includes('REACTIVE/NONREACTIVE') || name.includes('REACTIVE/NONREACTIVE')) {
//                         dropdownOptions = [{ label: 'Reactive', value: 'Reactive' }, { label: 'Non-Reactive', value: 'Non-Reactive' }];
//                       } else if (desc.includes('COMPATIBLE/INCOMPATIBLE') || name.includes('COMPATIBLE/INCOMPATIBLE')) {
//                         dropdownOptions = [{ label: 'Compatible', value: 'Compatible' }, { label: 'Incompatible', value: 'Incompatible' }];
//                       } else {
//                         dropdownOptions = [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }];
//                       }
//                     }

//                     let status = 'no-reference';
//                     const minRef = point.minReferenceRange;
//                     const maxRef = point.maxReferenceRange;
                    
//                     if (!isDropdown && !isDescription && !isDropdownWithDescription && currentValue && !isNaN(Number(currentValue))) {
//                       status = getValueStatus(currentValue, minRef, maxRef);
//                     }

//                     if (isDetailedReport) {
//                       return null;
//                     }

//                     const isAutoCalculated = AutoCalculation.isAutoCalculatedField(point.testDescription || '');

//                     return (
//                       <tr
//                         key={index}
//                         className={`border-b border-pneutral-200 last:border-0 ${getRowBackground(status)}`}
//                       >
//                         <td className="px-4 py-3 text-p3 text-pneutral-900">
//                           {point.testDescription || `Parameter ${index + 1}`}
//                           {isAutoCalculated && (
//                             <span className="ml-2 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
//                               Auto-calc
//                             </span>
//                           )}
//                         </td>

//                         <td className="px-4 py-3 text-p3">
//                           {isDropdownWithDescription ? (
//                             <div className="flex flex-col gap-1">
//                               <DropdownInput
//                                 value={currentValue}
//                                 onChange={(value) =>
//                                   handleInputChange(selectedTest?.name, index, value)
//                                 }
//                                 options={dropdownOptions}
//                                 placeholder="Select value"
//                               />
//                               <input
//                                 type="text"
//                                 value={descriptionValue}
//                                 placeholder="Enter description"
//                                 onChange={(e) =>
//                                   handleInputChange(selectedTest?.name, `${index}_description`, e.target.value)
//                                 }
//                                 className="h-9 w-48 rounded-full border border-info-500 bg-white px-3 text-p3 outline-none transition focus:border-secondary-700 text-sm"
//                               />
//                             </div>
//                           ) : isDescription ? (
//                             <input
//                               type="text"
//                               value={currentValue}
//                               placeholder="Enter description"
//                               onChange={(e) =>
//                                 handleInputChange(selectedTest?.name, index, e.target.value)
//                               }
//                               className="h-9 w-48 rounded-full border border-info-500 bg-white px-3 text-p3 outline-none transition focus:border-secondary-700"
//                             />
//                           ) : isDropdown ? (
//                             <DropdownInput
//                               value={currentValue}
//                               onChange={(value) =>
//                                 handleInputChange(selectedTest?.name, index, value)
//                               }
//                               options={dropdownOptions}
//                               placeholder="Select value"
//                             />
//                           ) : (
//                             <input
//                               type="number"
//                               value={currentValue}
//                               placeholder="Enter value"
//                               onChange={(e) =>
//                                 handleInputChange(selectedTest?.name, index, e.target.value)
//                               }
//                               className={`h-9 w-32 rounded-full border bg-white px-3 text-p3 outline-none transition ${getInputBorderColor(status)}`}
//                               disabled={isAutoCalculated}
//                               step="any"
//                             />
//                           )}
//                         </td>

//                         <td className="px-4 py-3 text-p3 text-pneutral-900">
//                           {isDescription || isDropdown || isDropdownWithDescription ? '-' : (point.units || 'N/A')}
//                         </td>

//                         <td className="px-4 py-3 text-p3 text-sneutral-500">
//                           {isDescription || isDropdown || isDropdownWithDescription ? '-' : (
//                             point.minReferenceRange !== null && point.maxReferenceRange !== null
//                               ? `${point.minReferenceRange} - ${point.maxReferenceRange}`
//                               : 'N/A'
//                           )}
//                         </td>

//                         <td
//                           className={`px-4 py-3 text-p3 font-medium ${getStatusTextColor(status)}`}
//                         >
//                           {isDescription || isDropdown || isDropdownWithDescription ? '-' : (getStatusLabel(status) || '-')}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* Right Sidebar - Patient Details */}
//         <aside>
//           <div className="rounded-2xl border border-white bg-white p-4">
//             <h3 className="mb-5 text-p3 font-semibold text-pneutral-900">
//               {selectedPatient.patientname || 'Patient Name'}
//             </h3>

//             <div className="space-y-3">
//               <InfoRow
//                 label="Patient ID"
//                 value={`PAT-${String(selectedPatient.visitId).padStart(5, '0')}`}
//               />
//               <InfoRow
//                 label="Age / Gender"
//                 value={`${selectedPatient.dateOfBirth ? `${calculateAgeObject(selectedPatient.dateOfBirth).years} Yrs, ` : ''}${selectedPatient.gender || 'N/A'}`}
//               />
//               <InfoRow
//                 label="Doctor"
//                 value="Dr. R. Mehta"
//               />
//               <InfoRow label="Visit Type" value="OPD" />
//               <InfoRow
//                 label="Contact"
//                 value={selectedPatient.contactNumber || 'N/A'}
//               />
//               <InfoRow
//                 label="Tests Ordered"
//                 value={selectedTest?.name || 'N/A'}
//               />
//             </div>

//             <div className="mt-6 rounded-xl border border-info-200 bg-info-50 p-4">
//               <div className="mb-4 flex items-center justify-between">
//                 <h4 className="text-p2 font-semibold text-pneutral-900">
//                   Visit Information
//                 </h4>

//                 <span className="text-p2 text-pneutral-500">
//                   {selectedPatient.visitDate ? new Date(selectedPatient.visitDate).toLocaleDateString() : 'N/A'}
//                 </span>
//               </div>

//               <InfoRow
//                 label="Status"
//                 value={selectedPatient.visitStatus?.replace('_', ' ') || 'Completed'}
//               />
//             </div>
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// };

// export default PatientReportDataFill;















//code dated 02.07.2026.................

// "use client";

// import React, { useState, useCallback, useEffect } from "react";
// import { CiCircleCheck } from "react-icons/ci";
// import { IoArrowBack } from "react-icons/io5";
// import { toast } from 'react-toastify';
// import Loader from '@/app/(admin)/component/common/Loader';
// import { useLabs } from '@/context/LabContext';
// import { TestList, TestReferancePoint } from '@/types/test/testlist';
// import { getTestReferanceRangeByTestName } from '@/../services/testService';
// import { createReportWithTestResult } from '@/../services/reportServices';
// import { calculateAgeObject } from '@/utils/ageUtils';
// import { hasValidDropdown, parseDropdownField, DropdownItem } from '@/utils/dropdownParser';
// import AutoCalculation from './AutoCalculation';

// // Interfaces
// export interface Patient {
//   visitId: number;
//   patientname: string;
//   gender: string;
//   contactNumber: string;
//   email: string;
//   visitDate: string;
//   visitStatus: string;
//   sampleNames: string[];
//   testIds: number[];
//   packageIds: number[];
//   dateOfBirth?: string;
// }

// interface ReportData {
//   visit_id: string;
//   testName: string;
//   testCategory: string;
//   patientName: string;
//   referenceDescription: string;
//   referenceRange: string;
//   referenceAgeRange: string;
//   enteredValue: string;
//   unit: string;
//   description: string;
//   referenceRanges?: string;
//   reportJson?: string;
// }

// interface ReportPayload {
//   testData: ReportData[];
//   testResult: {
//     testId: number;
//     isFilled: boolean;
//   };
// }

// interface PatientReportDataFillProps {
//   selectedPatient: Patient;
//   selectedTest: TestList;
//   updateCollectionTable: boolean;
//   setUpdateCollectionTable: (value: React.SetStateAction<boolean>) => void;
//   setShowModal: (value: React.SetStateAction<boolean>) => void;
// }

// // InfoRow Component for Sidebar
// const InfoRow = ({ label, value }: { label: string; value: string }) => {
//   return (
//     <div className="flex items-start justify-between text-p3 gap-4">
//       <span className="text-pneutral-500">{label}</span>
//       <span className="text-right font-medium text-pneutral-900">
//         {value}
//       </span>
//     </div>
//   );
// };

// // Dropdown Component with NEW UI styling
// const DropdownInput = ({ 
//   value, 
//   onChange, 
//   options,
//   placeholder = "Select value",
//   disabled = false
// }: { 
//   value: string; 
//   onChange: (value: string) => void; 
//   options: DropdownItem[];
//   placeholder?: string;
//   disabled?: boolean;
// }) => {
//   return (
//     <select
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       disabled={disabled}
//       className="h-9 w-32 rounded-full border border-info-500 bg-white px-3 text-p3 outline-none transition focus:border-secondary-700 disabled:opacity-60 disabled:cursor-not-allowed"
//     >
//       <option value="">{placeholder}</option>
//       {options.map((option) => (
//         <option key={option.value} value={option.value}>
//           {option.label}
//         </option>
//       ))}
//     </select>
//   );
// };

// // Status helper functions
// const getValueStatus = (value: string, minRef: number | null, maxRef: number | null) => {
//   if (!value || isNaN(Number(value))) return 'no-reference';
//   const numValue = parseFloat(value);

//   if (minRef === null || maxRef === null) return 'no-reference';
//   if (numValue < minRef) return 'below';
//   if (numValue > maxRef) return 'above';
//   return 'normal';
// };

// const getStatusTextColor = (status: string) => {
//   switch (status) {
//     case 'above':
//       return 'text-warning-500';
//     case 'below':
//       return 'text-danger-600';
//     case 'normal':
//       return 'text-success-900';
//     default:
//       return 'text-pneutral-400';
//   }
// };

// const getInputBorderColor = (status: string) => {
//   switch (status) {
//     case 'above':
//       return 'border-warning-500';
//     case 'below':
//       return 'border-danger-600';
//     case 'normal':
//       return 'border-info-500';
//     default:
//       return 'border-info-500';
//   }
// };

// const getRowBackground = (status: string) => {
//   switch (status) {
//     case 'above':
//       return 'bg-warning-50';
//     case 'below':
//       return 'bg-danger-50';
//     default:
//       return '';
//   }
// };

// const getStatusLabel = (status: string) => {
//   switch (status) {
//     case 'above': return 'High';
//     case 'below': return 'Low';
//     case 'normal': return 'Normal';
//     default: return '';
//   }
// };

// const PatientReportDataFill: React.FC<PatientReportDataFillProps> = ({
//   selectedPatient,
//   selectedTest,
//   setUpdateCollectionTable,
//   setShowModal
// }) => {
//   const { currentLab } = useLabs();
  
//   // State management
//   const [loading, setLoading] = useState(false);
//   const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
//   const [inputValues, setInputValues] = useState<Record<string, Record<string | number, string>>>({});
//   const [allTests, setAllTests] = useState<TestList[]>([]);
//   const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [differentialValidation, setDifferentialValidation] = useState<{
//     total: number;
//     type: string;
//     message: string;
//     calculation: string;
//   } | null>(null);


//   const filterReferenceData = useCallback((referenceData: Record<string, TestReferancePoint[]>) => {
//     const filteredData: Record<string, TestReferancePoint[]> = {};

//     Object.keys(referenceData).forEach((testName) => {
//       const testPoints = referenceData[testName];

//       const genderFilteredPoints = testPoints.filter((point) => {
//         const pointGender = point.gender?.toUpperCase() || '';
//         const patientGender = selectedPatient.gender?.toUpperCase() || '';

//         let mappedPatientGender = '';
//         if (patientGender === 'MALE') {
//           mappedPatientGender = 'M';
//         } else if (patientGender === 'FEMALE') {
//           mappedPatientGender = 'F';
//         }

//         return pointGender === 'MF' ||
//           pointGender === mappedPatientGender ||
//           !pointGender ||
//           pointGender === '';
//       });

//       const ageObj = selectedPatient.dateOfBirth ? calculateAgeObject(selectedPatient.dateOfBirth) : { years: 0, months: 0, days: 0 };
//       const patientAgeMonths = (ageObj.years || 0) * 12 + (ageObj.months || 0);

//       const toMonths = (value: number | null | undefined, unit: string | null | undefined): number => {
//         if (value === null || value === undefined) return 0;
//         const u = (unit || 'YEARS').toUpperCase();

//         if (u === 'MONTHS' && value === 1) {
//           return 12;
//         }

//         return u === 'MONTHS' ? value : value * 12;
//       };

//       const ageFilteredPoints = genderFilteredPoints.filter((point) => {
//         const minMonths = toMonths(point.ageMin, point.minAgeUnit);
//         const maxMonths = point.ageMax === null || point.ageMax === undefined
//           ? Number.MAX_SAFE_INTEGER
//           : toMonths(point.ageMax, point.maxAgeUnit);

//         const isLastRange = maxMonths === Number.MAX_SAFE_INTEGER || maxMonths >= 1200;

//         if (isLastRange) {
//           return patientAgeMonths >= minMonths && patientAgeMonths <= maxMonths;
//         } else {
//           return patientAgeMonths >= minMonths && patientAgeMonths < maxMonths;
//         }
//       });

//       filteredData[testName] = ageFilteredPoints.length > 0 ? ageFilteredPoints : genderFilteredPoints;
//     });

//     return filteredData;
//   }, [selectedPatient.dateOfBirth, selectedPatient.gender]);

//   const fetchReferenceData = useCallback(async () => {
//     if (!selectedTest || !currentLab) {
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await getTestReferanceRangeByTestName(currentLab.id.toString(), selectedTest.name);

//       if (response) {
//         const responseArray = Array.isArray(response) ? response : [response];
        
//         const filteredData = filterReferenceData({ [selectedTest.name]: responseArray });
//         setReferencePoints(filteredData);

//         const testInputs: Record<string | number, string> = {};
//         responseArray.forEach((_, index) => {
//           testInputs[index] = '';
//           const descriptionKey = `${index}_description`;
//           testInputs[descriptionKey] = '';
//         });

//         setInputValues(prev => ({
//           ...prev,
//           [selectedTest.name]: testInputs
//         }));
//       }
//     } catch (error) {
//       let errorMessage = 'Failed to fetch test reference data';
//       if (error instanceof Error) {
//         errorMessage = error.message;
//       }
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedTest, currentLab, filterReferenceData]);

//   useEffect(() => {
//     if (selectedTest) {
//       setAllTests([selectedTest]);
//       fetchReferenceData();
//     }
//   }, [selectedTest, fetchReferenceData]);

//   const handleInputChange = (testName: string, index: number | string, value: string) => {
//   const numericValue = parseFloat(value);

//   // Prevent negative values for non-auto-calculated fields
//   if (value !== '' && !isNaN(numericValue) && numericValue < 0) {
//     const referenceData = referencePoints[testName] || [];
//     const point = referenceData[typeof index === 'number' ? index : 0];
    
//     if (point && !AutoCalculation.isAutoCalculatedField(point.testDescription || '')) {
//       toast.error('Negative values are not allowed');
//       return;
//     }
//   }

//   setInputValues(prev => {
//     // First update the input
//     const currentTestInputs = prev[testName] || {};
//     const updated = {
//       ...prev,
//       [testName]: {
//         ...currentTestInputs,
//         [index]: value
//       }
//     };

//     // Get the updated inputs for this test
//     const updatedInputs = updated[testName];
//     const refData = referencePoints[testName] || [];

//     // Trigger auto-calculation if we have reference data
//     if (refData.length > 0) {
//       // Skip auto-calculation for dropdown fields to avoid conflicts
//       const point = refData[typeof index === 'number' ? index : 0];
//       const isDropdownField = point?.testDescription?.toUpperCase().includes('DROPDOWN') || 
//                               point?.testDescription?.toUpperCase().includes('DROPDOWN WITH DESCRIPTION');
      
//       // Only run auto-calculation for non-dropdown fields or when the change is from a non-dropdown field
//       if (!isDropdownField) {
//         console.log('Triggering auto-calculation for:', testName);
//         console.log('Current inputs:', updatedInputs);
        
//         const result = AutoCalculation.calculate(testName, updatedInputs, refData);
//         updated[testName] = result.updatedInputs;
        
//         // Update differential validation for CBC
//         if (result.differentialValidation) {
//           setDifferentialValidation(result.differentialValidation);
//         }
        
//         console.log('After auto-calculation:', updated[testName]);
//       }
//     }

//     return updated;
//   });

//   if (validationErrors[`${testName}-${index}`]) {
//     setValidationErrors(prev => ({
//       ...prev,
//       [`${testName}-${index}`]: false
//     }));
//   }
// };

//   const validateForm = () => {
//     const errors: Record<string, boolean> = {};
//     let isValid = true;

//     allTests.forEach(test => {
//       if (test.category === 'RADIOLOGY') {
//         return;
//       }

//       const testInputs = inputValues[test.name] || {};
//       const referenceData = referencePoints[test.name] || [];

//       referenceData.forEach((point, index) => {
//         const descriptionUpper = (point.testDescription || '').toUpperCase();
//         if (descriptionUpper === 'DETAILED REPORT') {
//           return;
//         }

//         // Skip validation for auto-calculated fields
//         if (AutoCalculation.isAutoCalculatedField(point.testDescription || '')) {
//           return;
//         }

//         if (!testInputs[index] || testInputs[index].trim() === '') {
//           errors[`${test.name}-${index}`] = true;
//           isValid = false;
//         }
//       });
//     });

//     setValidationErrors(errors);
//     return isValid;
//   };

//   const handleSaveAndGenerate = async () => {
//     if (!validateForm()) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const generatedReportData: ReportData[] = [];

//       allTests.forEach((test) => {
//         if (test.category === 'RADIOLOGY') {
//           const formattedTestName = test.name
//             .split(' ')
//             .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//             .join(' ');

//           const formattedCategory = test.category
//             .split(' ')
//             .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//             .join(' ');

//           const detailedReportPoint = referencePoints[test.name]?.find(point => point.testDescription === "DETAILED REPORT");
//           generatedReportData.push({
//             visit_id: selectedPatient.visitId.toString(),
//             testName: formattedTestName,
//             testCategory: formattedCategory,
//             patientName: selectedPatient.patientname,
//             referenceDescription: detailedReportPoint?.testDescription || "RADIOLOGY_TEST",
//             referenceRange: "N/A",
//             enteredValue: "Hard copy will be provided",
//             referenceAgeRange: "N/A",
//             unit: "N/A",
//             description: "Imaging test - Results provided separately",
//             referenceRanges: detailedReportPoint?.referenceRanges || undefined,
//             reportJson: detailedReportPoint?.reportJson || undefined
//           });

//           return;
//         }

//         const testInputs = inputValues[test.name] || {};
//         const referenceData = referencePoints[test.name] || [];

//         referenceData.forEach((point, index) => {
//           if (testInputs[index] || (point.testDescription && point.testDescription !== "No reference available for this test")) {
//             const formattedTestName = test.name
//               .split(' ')
//               .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//               .join(' ');

//             const formattedCategory = test.category
//               .split(' ')
//               .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//               .join(' ');

//             let finalValue = testInputs[index] || "N/A";
//             let description = "N/A";
//             let unit = "N/A";
//             let referenceRange = "N/A";
//             const hasReferenceRange =
//               point.minReferenceRange !== null &&
//               point.minReferenceRange !== undefined ||
//               point.maxReferenceRange !== null &&
//               point.maxReferenceRange !== undefined;
//             const resolvedReferenceRange = hasReferenceRange
//               ? `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`
//               : "N/A";

//             const descriptionKey = `${index}_description`;
//             const hasDescription = testInputs[descriptionKey] && testInputs[descriptionKey].trim();

//             const hasApiDropdown = hasValidDropdown(point.dropdown);

//             if (point.testDescription === "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE" ||
//               point.testDescription === "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT") {
//               unit = point.units || "N/A";
//               description = hasDescription ? testInputs[descriptionKey] : "N/A";
//               finalValue = testInputs[index] || "N/A";
//               referenceRange = resolvedReferenceRange;
//             } else if (hasApiDropdown || ["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
//               "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"].includes(point.testDescription)) {
//               unit = point.units || "N/A";
//               description = "N/A";
//               finalValue = testInputs[index] || "N/A";
//               referenceRange = resolvedReferenceRange;
//             } else if (point.testDescription === "DESCRIPTION") {
//               unit = "N/A";
//               description = testInputs[index] || "N/A";
//               finalValue = testInputs[index] || "N/A";
//               referenceRange = "N/A";
//             }
//             else if (point.testDescription === "DETAILED REPORT") {
//               unit = "N/A";
//               description = "Imaging test - Results provided separately";
//               finalValue = "Hard copy will be provided";
//               referenceRange = "N/A";
//             }
//             else {
//               unit = point.units || "N/A";
//               description = "N/A";
//               finalValue = testInputs[index] || "N/A";
//               referenceRange = `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`;
//             }

//             generatedReportData.push({
//               visit_id: selectedPatient.visitId.toString(),
//               testName: formattedTestName,
//               testCategory: formattedCategory,
//               patientName: selectedPatient.patientname,
//               referenceDescription: point.testDescription || "No reference description available",
//               referenceRange: referenceRange,
//               enteredValue: finalValue,
//               referenceAgeRange: `${point.ageMin ?? "N/A"} ${point.minAgeUnit ?? "YEARS"} - ${point.ageMax ?? "N/A"} ${point.maxAgeUnit ?? "YEARS"}`,
//               unit: unit,
//               description: description,
//               referenceRanges: point.referenceRanges || undefined,
//               reportJson: point.reportJson || undefined
//             });
//           }
//         });
//       });

//       const completePayload: ReportPayload = {
//         testData: generatedReportData,
//         testResult: {
//           testId: selectedTest.id,
//           isFilled: true
//         }
//       };

//       const response = await createReportWithTestResult(currentLab?.id.toString() || '', completePayload);

//       if (response !== undefined && response !== null) {
//         toast.success('Report submitted successfully!');
//         setUpdateCollectionTable(prev => !prev);
//         setShowModal(false);
//       } else {
//         toast.error('Failed to submit report');
//       }
//     } catch (error) {
//       toast.error('Failed to submit report');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center p-6">
//         <Loader type="progress" fullScreen={false} text="Loading report data..." />
//         <p className="mt-4 text-sm text-gray-600">Fetching test and reference data...</p>
//       </div>
//     );
//   }

//   // Get the reference data for the current test
//   const currentTestRefs = referencePoints[selectedTest?.name] || [];

//   // If no reference data is available, show a message
//   if (!loading && currentTestRefs.length === 0 && selectedTest) {
//     return (
//       <div className="min-h-screen bg-info-50 p-6">
//         <div className="bg-white rounded-xl p-6 text-center">
//           <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reference Data Available</h3>
//           <p className="text-gray-600">No reference ranges found for {selectedTest.name}</p>
//           <button
//             onClick={() => setShowModal(false)}
//             className="mt-4 px-4 py-2 bg-secondary-700 text-white rounded-full"
//           >
//             Back to Queue
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-info-50">
//       {/* Differential Count Validation Alert - Only for CBC */}
//       {differentialValidation && (
//         <div className="mb-4 rounded-2xl border p-4 bg-red-50 border-red-300">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <div className={`text-lg font-bold ${differentialValidation.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
//                 Total: {differentialValidation.total}
//               </div>
//               <span className={`ml-3 text-sm font-medium ${differentialValidation.type === 'error' ? 'text-red-800' : 'text-green-800'}`}>
//                 {differentialValidation.message}
//               </span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//         <div>
//           <h1 className="text-h6 font-semibold text-[#101828]">
//             Enter Test Result Data
//           </h1>

//           <p className="mt-1 text-p3 font-medium text-[#99A1AF]">
//             {selectedPatient.visitDate ? new Date(selectedPatient.visitDate).toLocaleDateString() : 'N/A'} • {selectedTest?.name || 'Test'}
//           </p>
//         </div>

//         <div className="flex gap-3">
//           <button 
//             onClick={() => setShowModal(false)}
//             className="flex items-center gap-2 rounded-full border border-pneutral-600 px-3 py-2 text-label-l3 font-medium text-pneutral-600"
//           >
//             <IoArrowBack className="h-4 w-4 text-pneutral-600" />
//             Back to Queue
//           </button>

//           <button
//             onClick={handleSaveAndGenerate}
//             disabled={isSubmitting}
//             className={`flex items-center gap-2 rounded-full px-3 py-2 text-label-l3 font-medium text-pneutral-50 ${
//               isSubmitting ? 'bg-pneutral-400 cursor-not-allowed' : 'bg-secondary-700'
//             }`}
//           >
//             <CiCircleCheck className="h-5 w-5" />
//             {isSubmitting ? 'Saving...' : 'Save & Generate Report'}
//           </button>
//         </div>
//       </div>

//       <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
//         {/* Left Side - Test Table */}
//         <div className="space-y-6">
//           {/* Test Header Card */}
//           <div className="rounded-xl border border-pneutral-200 bg-white px-4 py-3">
//             <h3 className="text-label-l4 font-medium text-pneutral-900">
//               {selectedTest?.name} — {selectedTest?.category || 'Test'}
//             </h3>
//           </div>

//           {/* Test Table Card */}
//           <div className="overflow-hidden rounded-xl border border-pneutral-200 bg-white">
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[750px]">
//                 <thead>
//                   <tr className="border-b border-pneutral-200 bg-white text-left text-label-l3 text-pneutral-900">
//                     <th className="px-4 py-3">Parameter</th>
//                     <th className="px-4 py-3">Result</th>
//                     <th className="px-4 py-3">Unit</th>
//                     <th className="px-4 py-3">Ref. Range</th>
//                     <th className="px-4 py-3">Status</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {currentTestRefs.map((point, index) => {
//                     const currentValue = inputValues[selectedTest?.name]?.[index] || "";
//                     const descriptionValue = inputValues[selectedTest?.name]?.[`${index}_description`] || "";
                    
//                     const dropdownResult = parseDropdownField(point.dropdown);
//                     const hasApiDropdown = dropdownResult.isValid;
//                     const dropdownItems = dropdownResult.data;

//                     const isDropdown = hasApiDropdown || 
//                       ["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
//                        "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"]
//                       .includes(point.testDescription || '');

//                     const isDropdownWithDescription = 
//                       point.testDescription === "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE" ||
//                       point.testDescription === "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT";

//                     const isDescription = point.testDescription === "DESCRIPTION";
//                     const isDetailedReport = point.testDescription === "DETAILED REPORT";

//                     let dropdownOptions: DropdownItem[] = [];
                    
//                     if (hasApiDropdown && dropdownItems && dropdownItems.length > 0) {
//                       dropdownOptions = dropdownItems;
//                     } else if (isDropdown) {
//                       const desc = point.testDescription?.toUpperCase() || '';
//                       const name = selectedTest?.name?.toUpperCase() || '';
                      
//                       if (name.includes('BLOOD GROUP') || name.includes('BLOOD TYPE') || desc.includes('BLOOD GROUP') || desc.includes('BLOOD TYPE')) {
//                         dropdownOptions = [
//                           { label: 'A+', value: 'A+' },
//                           { label: 'A-', value: 'A-' },
//                           { label: 'B+', value: 'B+' },
//                           { label: 'B-', value: 'B-' },
//                           { label: 'AB+', value: 'AB+' },
//                           { label: 'AB-', value: 'AB-' },
//                           { label: 'O+', value: 'O+' },
//                           { label: 'O-', value: 'O-' }
//                         ];
//                       } else if (desc.includes('POSITIVE/NEGATIVE') || name.includes('POSITIVE/NEGATIVE')) {
//                         dropdownOptions = [{ label: 'Positive', value: 'Positive' }, { label: 'Negative', value: 'Negative' }];
//                       } else if (desc.includes('PRESENT/ABSENT') || name.includes('PRESENT/ABSENT')) {
//                         dropdownOptions = [{ label: 'Present', value: 'Present' }, { label: 'Absent', value: 'Absent' }];
//                       } else if (desc.includes('REACTIVE/NONREACTIVE') || name.includes('REACTIVE/NONREACTIVE')) {
//                         dropdownOptions = [{ label: 'Reactive', value: 'Reactive' }, { label: 'Non-Reactive', value: 'Non-Reactive' }];
//                       } else if (desc.includes('COMPATIBLE/INCOMPATIBLE') || name.includes('COMPATIBLE/INCOMPATIBLE')) {
//                         dropdownOptions = [{ label: 'Compatible', value: 'Compatible' }, { label: 'Incompatible', value: 'Incompatible' }];
//                       } else {
//                         dropdownOptions = [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }];
//                       }
//                     }

//                     let status = 'no-reference';
//                     const minRef = point.minReferenceRange;
//                     const maxRef = point.maxReferenceRange;
                    
//                     if (!isDropdown && !isDescription && !isDropdownWithDescription && currentValue && !isNaN(Number(currentValue))) {
//                       status = getValueStatus(currentValue, minRef, maxRef);
//                     }

//                     if (isDetailedReport) {
//                       return null;
//                     }

//                     const isAutoCalculated = AutoCalculation.isAutoCalculatedField(point.testDescription || '');

//                     return (
//                       <tr
//                         key={index}
//                         className={`border-b border-pneutral-200 last:border-0 ${getRowBackground(status)}`}
//                       >
//                         <td className="px-4 py-3 text-p3 text-pneutral-900">
//                           {point.testDescription || `Parameter ${index + 1}`}
//                           {isAutoCalculated && (
//                             <span className="ml-2 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
//                               Auto-calc
//                             </span>
//                           )}
//                         </td>

//                         <td className="px-4 py-3 text-p3">
//                           {isDropdownWithDescription ? (
//                             <div className="flex flex-col gap-1">
//                               <DropdownInput
//                                 value={currentValue}
//                                 onChange={(value) =>
//                                   handleInputChange(selectedTest?.name, index, value)
//                                 }
//                                 options={dropdownOptions}
//                                 placeholder="Select value"
//                               />
//                               <input
//                                 type="text"
//                                 value={descriptionValue}
//                                 placeholder="Enter description"
//                                 onChange={(e) =>
//                                   handleInputChange(selectedTest?.name, `${index}_description`, e.target.value)
//                                 }
//                                 className="h-9 w-48 rounded-full border border-info-500 bg-white px-3 text-p3 outline-none transition focus:border-secondary-700 text-sm"
//                               />
//                             </div>
//                           ) : isDescription ? (
//                             <input
//                               type="text"
//                               value={currentValue}
//                               placeholder="Enter description"
//                               onChange={(e) =>
//                                 handleInputChange(selectedTest?.name, index, e.target.value)
//                               }
//                               className="h-9 w-48 rounded-full border border-info-500 bg-white px-3 text-p3 outline-none transition focus:border-secondary-700"
//                             />
//                           ) : isDropdown ? (
//                             <DropdownInput
//                               value={currentValue}
//                               onChange={(value) =>
//                                 handleInputChange(selectedTest?.name, index, value)
//                               }
//                               options={dropdownOptions}
//                               placeholder="Select value"
//                             />
//                           ) : (
//                             <input
//                               type="number"
//                               value={currentValue}
//                               placeholder="Enter value"
//                               onChange={(e) =>
//                                 handleInputChange(selectedTest?.name, index, e.target.value)
//                               }
//                               className={`h-9 w-32 rounded-full border bg-white px-3 text-p3 outline-none transition ${getInputBorderColor(status)}`}
//                               disabled={isAutoCalculated}
//                               step="any"
//                             />
//                           )}
//                         </td>

//                         <td className="px-4 py-3 text-p3 text-pneutral-900">
//                           {isDescription || isDropdown || isDropdownWithDescription ? '-' : (point.units || 'N/A')}
//                         </td>

//                         <td className="px-4 py-3 text-p3 text-sneutral-500">
//                           {isDescription || isDropdown || isDropdownWithDescription ? '-' : (
//                             point.minReferenceRange !== null && point.maxReferenceRange !== null
//                               ? `${point.minReferenceRange} - ${point.maxReferenceRange}`
//                               : 'N/A'
//                           )}
//                         </td>

//                         <td
//                           className={`px-4 py-3 text-p3 font-medium ${getStatusTextColor(status)}`}
//                         >
//                           {isDescription || isDropdown || isDropdownWithDescription ? '-' : (getStatusLabel(status) || '-')}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* Right Sidebar - Patient Details */}
//         <aside>
//           <div className="rounded-2xl border border-white bg-white p-4">
//             <h3 className="mb-5 text-p3 font-semibold text-pneutral-900">
//               {selectedPatient.patientname || 'Patient Name'}
//             </h3>

//             <div className="space-y-3">
//               <InfoRow
//                 label="Patient ID"
//                 value={`PAT-${String(selectedPatient.visitId).padStart(5, '0')}`}
//               />
//               <InfoRow
//                 label="Age / Gender"
//                 value={`${selectedPatient.dateOfBirth ? `${calculateAgeObject(selectedPatient.dateOfBirth).years} Yrs, ` : ''}${selectedPatient.gender || 'N/A'}`}
//               />
//               <InfoRow
//                 label="Doctor"
//                 value="Dr. R. Mehta"
//               />
//               <InfoRow label="Visit Type" value="OPD" />
//               <InfoRow
//                 label="Contact"
//                 value={selectedPatient.contactNumber || 'N/A'}
//               />
//               <InfoRow
//                 label="Tests Ordered"
//                 value={selectedTest?.name || 'N/A'}
//               />
//             </div>

//             <div className="mt-6 rounded-xl border border-info-200 bg-info-50 p-4">
//               <div className="mb-4 flex items-center justify-between">
//                 <h4 className="text-p2 font-semibold text-pneutral-900">
//                   Visit Information
//                 </h4>

//                 <span className="text-p2 text-pneutral-500">
//                   {selectedPatient.visitDate ? new Date(selectedPatient.visitDate).toLocaleDateString() : 'N/A'}
//                 </span>
//               </div>

//               <InfoRow
//                 label="Status"
//                 value={selectedPatient.visitStatus?.replace('_', ' ') || 'Completed'}
//               />
//             </div>
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// };

// export default PatientReportDataFill; 




















// code written by abhishek .........do not chnage........

// import { createReportWithTestResult } from '@/../services/reportServices';
// import { getTestReferanceRangeByTestName } from '@/../services/testService';
// import Loader from '@/app/(admin)/component/common/Loader';
// import { useLabs } from '@/context/LabContext';
// import { TestList, TestReferancePoint } from '@/types/test/testlist';
// import { calculateAgeObject } from '@/utils/ageUtils';
// import React, { useCallback, useEffect, useState } from 'react';
// import { TbInfoCircle, TbReportMedical, TbArrowDownCircle, TbArrowUpCircle, TbSquareRoundedCheck } from "react-icons/tb";
// import { toast } from 'react-toastify';
// import PatientBasicInfo from './PatientBasicInfo';
// import TestComponentFactory from './TestSpecificComponents/TestComponentFactory';
// import DetailedReportEditor from './DetailedReportEditor';
// import { formatMedicalReportToHTML } from '@/utils/reportFormatter';
// import ConfirmationDialog from '@/app/(admin)/component/common/ConfirmationDialog';
// import { hasValidDropdown } from '@/utils/dropdownParser';

// export interface Patient {
//   visitId: number;
//   patientname: string;
//   gender: string;
//   contactNumber: string;
//   email: string;
//   visitDate: string;
//   visitStatus: string;
//   sampleNames: string[];
//   testIds: number[];
//   packageIds: number[];
//   dateOfBirth?: string;
// }

// interface ReportData {
//   visit_id: string;
//   testName: string;
//   testCategory: string;
//   patientName: string;
//   referenceDescription: string;
//   referenceRange: string;
//   referenceAgeRange: string;
//   enteredValue: string;
//   unit: string;
//   description: string;
//   referenceRanges?: string; // raw reference ranges JSON/string from API point
//   reportJson?: string; // detailed report JSON (if any) for this test/point
// }

// interface ReportPayload {
//   testData: ReportData[];
//   testResult: {
//     testId: number;
//     isFilled: boolean;
//   };
// }

// interface StructuredReportSection {
//   title?: string;
//   content?: string;
//   order?: number;
// }

// interface StructuredReport {
//   title?: string;
//   description?: string;
//   sections?: StructuredReportSection[];
//   note?: string;
//   impression?: string;
//   interpretation?: string;
//   limitations?: unknown;
//   organReview?: unknown;
//   observations?: unknown;
//   fetalParameters?: Record<string, unknown>;
//   parameters?: Record<string, unknown>;
//   calculation?: string;
//   significance?: string;
// }


// const escapeHtmlWithBreaks = (text: string) =>
//   text
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     // preserve spaces (CRITICAL)
//     .replace(/ /g, '&nbsp;')
//     .replace(/\r?\n/g, '<br/>');

// const isPlainObject = (value: unknown): value is Record<string, unknown> =>
//   typeof value === 'object' && value !== null && !Array.isArray(value);

// interface PatientReportDataFillProps {
//   selectedPatient: Patient;
//   selectedTest: TestList;
//   updateCollectionTable: boolean;
//   setShowModal: (value: React.SetStateAction<boolean>) => void;
//   setUpdateCollectionTable: (value: React.SetStateAction<boolean>) => void;
// }

// const PatientReportDataFill: React.FC<PatientReportDataFillProps> = ({
//   selectedPatient,
//   selectedTest,
//   setUpdateCollectionTable,
//   setShowModal
// }) => {
//   const { currentLab } = useLabs();
//   const [loading, setLoading] = useState(false);
//   const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
//   const [inputValues, setInputValues] = useState<Record<string, Record<string | number, string>>>({});
//   const [allTests, setAllTests] = useState<TestList[]>([]);
//   const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [reportPreview, setReportPreview] = useState<ReportPayload>({
//     testData: [],
//     testResult: { testId: 0, isFilled: false }
//   });
//   const [hasMissingDescriptions, setHasMissingDescriptions] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);



//   // Function to determine value status based on reference range
//   const getValueStatus = (value: string, minRef: number | null, maxRef: number | null) => {
//     if (!value || isNaN(Number(value))) return 'no-reference';
//     const numValue = parseFloat(value);

//     if (minRef === null || maxRef === null) return 'no-reference';
//     if (numValue < minRef) return 'below';
//     if (numValue > maxRef) return 'above';
//     return 'normal';
//   };

//   // Function to get status color for styling
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'below': return 'bg-red-50 border-red-200';
//       case 'above': return 'bg-red-50 border-red-200';
//       case 'normal': return 'bg-green-50 border-green-200';
//       default: return 'bg-blue-50 border-blue-200';
//     }
//   };

//   // Function to get status icon
//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'below': return <TbArrowDownCircle className="text-yellow-500 mr-1" size={18} />;
//       case 'above': return <TbArrowUpCircle className="text-red-500 mr-1" size={18} />;
//       case 'normal': return <TbSquareRoundedCheck className="text-green-500 mr-1" size={18} />;
//       default: return <TbInfoCircle className="text-blue-500 mr-1" size={18} />;
//     }
//   };

//   const filterReferenceData = useCallback((referenceData: Record<string, TestReferancePoint[]>) => {
//     const filteredData: Record<string, TestReferancePoint[]> = {};

//     Object.keys(referenceData).forEach((testName) => {
//       const testPoints = referenceData[testName];

//       // Global gender filtering for all tests
//       const genderFilteredPoints = testPoints.filter((point) => {
//         const pointGender = point.gender?.toUpperCase() || '';
//         const patientGender = selectedPatient.gender?.toUpperCase() || '';

//         // Map patient gender to test gender format
//         let mappedPatientGender = '';
//         if (patientGender === 'MALE') {
//           mappedPatientGender = 'M';
//         } else if (patientGender === 'FEMALE') {
//           mappedPatientGender = 'F';
//         }

//         // Show field if:
//         // 1. Gender is "MF" (Male/Female) - show for both
//         // 2. Gender matches mapped patient gender (M for male, F for female)
//         // 3. No gender specified (show for all)
//         return pointGender === 'MF' ||
//           pointGender === mappedPatientGender ||
//           !pointGender ||
//           pointGender === '';
//       });

//       // Age-based filtering (convert both patient age and ref ranges to months)
//       const ageObj = selectedPatient.dateOfBirth ? calculateAgeObject(selectedPatient.dateOfBirth) : { years: 0, months: 0, days: 0 };
//       const patientAgeMonths = (ageObj.years || 0) * 12 + (ageObj.months || 0);

//       const toMonths = (value: number | null | undefined, unit: string | null | undefined): number => {
//         if (value === null || value === undefined) return 0;
//         const u = (unit || 'YEARS').toUpperCase();

//         // Special case: if unit is "MONTHS" but value is 1, treat it as 1 year (12 months)
//         // This handles the case where 0-1 means 0 to 1 year (0-12 months)
//         if (u === 'MONTHS' && value === 1) {
//           return 12; // 1 month = 1 year = 12 months
//         }

//         // Normal conversion: MONTHS = months, YEARS = years * 12
//         return u === 'MONTHS' ? value : value * 12;
//       };

//       const ageFilteredPoints = genderFilteredPoints.filter((point) => {
//         const minMonths = toMonths(point.ageMin, point.minAgeUnit);
//         // If max is missing, allow large range
//         const maxMonths = point.ageMax === null || point.ageMax === undefined
//           ? Number.MAX_SAFE_INTEGER
//           : toMonths(point.ageMax, point.maxAgeUnit);

//         // Make ranges non-overlapping by using exclusive upper bound for most ranges
//         // Only the last range (highest age) uses inclusive upper bound
//         const isLastRange = maxMonths === Number.MAX_SAFE_INTEGER || maxMonths >= 1200; // 100+ years

//         if (isLastRange) {
//           // For the highest age range, use inclusive upper bound
//           return patientAgeMonths >= minMonths && patientAgeMonths <= maxMonths;
//         } else {
//           // For all other ranges, use exclusive upper bound to prevent overlap
//           return patientAgeMonths >= minMonths && patientAgeMonths < maxMonths;
//         }
//       });

//       // If age filtering yields results, use them; otherwise fall back to gender-only
//       filteredData[testName] = ageFilteredPoints.length > 0 ? ageFilteredPoints : genderFilteredPoints;
//     });

//     return filteredData;
//   }, [selectedPatient.dateOfBirth, selectedPatient.gender]);

//   const fetchReferenceData = useCallback(async () => {
//     if (!selectedTest || !currentLab) return;

//     setLoading(true);
//     try {
//       const response = await getTestReferanceRangeByTestName(currentLab.id.toString(), selectedTest.name);

//       if (response && Array.isArray(response)) {
//         const filteredData = filterReferenceData({ [selectedTest.name]: response });
//         setReferencePoints(filteredData);

//         // Initialize input values for this test
//         const testInputs: Record<string | number, string> = {};
//         response.forEach((_, index) => {
//           testInputs[index] = '';
//         });

//         setInputValues(prev => ({
//           ...prev,
//           [selectedTest.name]: testInputs
//         }));
//       }
//     } catch (error) {

//       toast.error('Failed to fetch test reference data');
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedTest, currentLab, filterReferenceData]);

//   useEffect(() => {
//     if (selectedTest) {
//       setAllTests([selectedTest]);
//       fetchReferenceData();
//     }
//   }, [selectedTest, fetchReferenceData]);

//   const handleInputChange = (testName: string, index: number | string, value: string) => {
//     // Check if the value is negative for numeric inputs
//     const numericValue = parseFloat(value);

//     // Only show error for negative values if it's not an auto-calculated field
//     // Auto-calculated fields are identified by checking if the field is read-only
//     // We'll allow negative values to pass through and let the individual components handle validation
//     // if (value !== '' && !isNaN(numericValue) && numericValue < 0) {
//     if (value !== '' && !isNaN(numericValue) && numericValue < 0) {
//       // Check if this might be an auto-calculated field by looking at the reference data
//       const referenceData = referencePoints[testName] || [];
//       const point = referenceData[typeof index === 'number' ? index : 0];

//       // If it's a known auto-calculated field type, allow negative values
//       const isAutoCalculatedField = point?.testDescription?.toUpperCase().includes('GLOBULIN') ||
//         point?.testDescription?.toUpperCase().includes('INDIRECT BILIRUBIN') ||
//         point?.testDescription?.toUpperCase().includes('A/G RATIO') ||
//         point?.testDescription?.toUpperCase().includes('MEAN BLOOD GLUCOSE') ||
//         point?.testDescription?.toUpperCase().includes('ABSOLUTE EOSINOPHIL COUNT') ||
//         point?.testDescription?.toUpperCase().includes('HDL CHOLESTEROL - DIRECT') ||
//         point?.testDescription?.toUpperCase().includes('LDL CHOLESTEROL - DIRECT') ||
//         point?.testDescription?.toUpperCase().includes('VLDL CHOLESTEROL');

//       if (!isAutoCalculatedField) {
//         toast.error('Negative values are not allowed');
//         return; // Don't update the state with negative values
//       }
//     }

//     setInputValues(prev => ({
//       ...prev,
//       [testName]: {
//         ...prev[testName],
//         [index]: value
//       }
//     }));

//     // Clear validation error when user starts typing
//     if (validationErrors[`${testName}-${index}`]) {
//       setValidationErrors(prev => ({
//         ...prev,
//         [`${testName}-${index}`]: false
//       }));
//     }
//   };

//   const validateForm = () => {
//     const errors: Record<string, boolean> = {};
//     let isValid = true;

//     allTests.forEach(test => {
//       // Skip validation for radiology tests
//       if (test.category === 'RADIOLOGY') {
//         return; // Skip validation for this test
//       }

//       const testInputs = inputValues[test.name] || {};
//       const referenceData = referencePoints[test.name] || [];

//       referenceData.forEach((point, index) => {
//         // Skip validation for detailed report fields which don't require user input
//         const descriptionUpper = (point.testDescription || '').toUpperCase();
//         if (descriptionUpper === 'DETAILED REPORT') {
//           return;
//         }

//         if (!testInputs[index] || testInputs[index].trim() === '') {
//           errors[`${test.name}-${index}`] = true;
//           isValid = false;
//         }
//       });
//     });

//     setValidationErrors(errors);
//     return isValid;
//   };

//   const prepareReportPreview = () => {
//     if (!validateForm()) {
//       return;
//     }

//     const generatedReportData: ReportData[] = [];
//     let hasMissingDesc = false;

//     allTests.forEach((test) => {
//       // Handle radiology tests differently - create minimal report data
//       if (test.category === 'RADIOLOGY') {


//         const formattedTestName = test.name
//           .split(' ')
//           .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//           .join(' ');

//         const formattedCategory = test.category
//           .split(' ')
//           .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//           .join(' ');

//         // Create minimal report data for radiology tests
//         // This ensures the test is recorded in the system
//         const detailedReportPoint = referencePoints[test.name]?.find(point => point.testDescription === "DETAILED REPORT");
//         generatedReportData.push({
//           visit_id: selectedPatient.visitId.toString(),
//           testName: formattedTestName,
//           testCategory: formattedCategory,
//           patientName: selectedPatient.patientname,
//           referenceDescription: detailedReportPoint?.testDescription || "RADIOLOGY_TEST",
//           referenceRange: "N/A",
//           enteredValue: "Hard copy will be provided",
//           referenceAgeRange: "N/A",
//           unit: "N/A",
//           description: "Imaging test - Results provided separately",
//           referenceRanges: detailedReportPoint?.referenceRanges || undefined,
//           reportJson: detailedReportPoint?.reportJson || undefined
//         });

//         return; // Skip the regular reference data processing
//       }

//       const testInputs = inputValues[test.name] || {};
//       const referenceData = referencePoints[test.name] || [];

//       referenceData.forEach((point, index) => {
//         if (testInputs[index] || (point.testDescription && point.testDescription !== "No reference available for this test")) {
//           if (!point.testDescription || point.testDescription === "No reference description available") {
//             hasMissingDesc = true;
//           }

//           const formattedTestName = test.name
//             .split(' ')
//             .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//             .join(' ');

//           const formattedCategory = test.category
//             .split(' ')
//             .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//             .join(' ');

//           let finalValue = testInputs[index] || "N/A";
//           let description = "N/A";
//           let unit = "N/A";
//           let referenceRange = "N/A";
//           const hasReferenceRange =
//             point.minReferenceRange !== null &&
//             point.minReferenceRange !== undefined ||
//             point.maxReferenceRange !== null &&
//             point.maxReferenceRange !== undefined;
//           const resolvedReferenceRange = hasReferenceRange
//             ? `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`
//             : "N/A";

//           const descriptionKey = `${index}_description`;
//           const hasDescription = testInputs[descriptionKey] && testInputs[descriptionKey].trim();

//           // Check if point has valid dropdown field (API-driven) - takes priority over testDescription
//           const hasApiDropdown = hasValidDropdown(point.dropdown);

//           if (point.testDescription === "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE" ||
//             point.testDescription === "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT") {
//             unit = point.units || "N/A";
//             description = hasDescription ? testInputs[descriptionKey] : "N/A";
//             finalValue = testInputs[index] || "N/A";
//             referenceRange = resolvedReferenceRange;
//           } else if (hasApiDropdown || ["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
//             "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"].includes(point.testDescription)) {
//             // Handle both API-driven dropdowns and hardcoded dropdown types
//             unit = point.units || "N/A";
//             description = "N/A";
//             finalValue = testInputs[index] || "N/A";
//             referenceRange = resolvedReferenceRange;
//           } else if (point.testDescription === "DESCRIPTION") {
//             unit = "N/A";
//             description = testInputs[index] || "N/A";  // Save the actual description text here
//             finalValue = testInputs[index] || "N/A";  // Also save it in enteredValue for consistency
//             referenceRange = "N/A";
//           }
//           else if (point.testDescription === "DETAILED REPORT") {
//             unit = "N/A";
//             description = "Imaging test - Results provided separately";
//             finalValue = "Hard copy will be provided";
//             referenceRange = "N/A";
//           }
//           else {
//             unit = point.units || "N/A";
//             description = "N/A";
//             finalValue = testInputs[index] || "N/A";
//             referenceRange = `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`;
//           }

//           generatedReportData.push({
//             visit_id: selectedPatient.visitId.toString(),
//             testName: formattedTestName,
//             testCategory: formattedCategory,
//             patientName: selectedPatient.patientname,
//             referenceDescription: point.testDescription || "No reference description available",
//             referenceRange: referenceRange,
//             enteredValue: finalValue,
//             referenceAgeRange: `${point.ageMin ?? "N/A"} ${point.minAgeUnit ?? "YEARS"} - ${point.ageMax ?? "N/A"} ${point.maxAgeUnit ?? "YEARS"}`,
//             unit: unit,
//             description: description,
//             referenceRanges: point.referenceRanges || undefined,
//             reportJson: point.reportJson || undefined
//           });
//         }
//       });
//     });

//     const completePayload: ReportPayload = {
//       testData: generatedReportData,
//       testResult: {
//         testId: selectedTest.id,
//         isFilled: true
//       }
//     };

//     setReportPreview(completePayload);
//     setHasMissingDescriptions(hasMissingDesc);
//     setShowConfirmation(true);
//   };

//   const submitReport = async () => {
//     try {
//       setIsSubmitting(true);

//       const response = await createReportWithTestResult(currentLab?.id.toString() || '', reportPreview);


//       // Check if response exists and is valid
//       // The API returns ReportData[] which can be empty array on success
//       if (response !== undefined && response !== null) {

//         toast.success('Report submitted successfully!');
//         setShowConfirmation(false);
//         setUpdateCollectionTable(prev => !prev);
//         setShowModal(false); // Close the main modal
//       } else {

//         toast.error('Failed to submit report');
//       }
//     } catch (error) {

//       toast.error('Failed to submit report');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Build human-readable HTML preview combining detailed reports and entered values
//   const buildReadablePreviewHTML = () => {
//     let htmlParts: string[] = [];

//     // Detailed Reports section (if any)
//     const detailedReports = allTests
//       .map((test) => {
//         const detailedPoint = (referencePoints[test.name] || []).find(p => (p.testDescription || '').toUpperCase() === 'DETAILED REPORT');
//         if (!detailedPoint || !detailedPoint.reportJson) return null;

//         try {
//           const parsed = JSON.parse(detailedPoint.reportJson) as StructuredReport;
//           const parsedSections: (StructuredReportSection & { title?: string; content?: string })[] = Array.isArray(parsed.sections)
//             ? parsed.sections
//             : isPlainObject(parsed.sections)
//               ? Object.entries(parsed.sections as Record<string, unknown>).map(([title, content]) => ({
//                 title,
//                 content: String(content ?? ''),
//               }))
//               : [];
//           if (parsed && parsed.title && parsedSections.length > 0) {
//             const sectionsHtml = [...parsedSections]
//               .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
//               .map((section) => `
//                 <div class="mb-3">
//                   <h4 class="text-sm font-semibold text-gray-800">${section.title || ''}</h4>
//                   <div>${section.content || ''}</div>
//                 </div>
//               `)
//               .join('');
//             return `
//               <div class="mb-6">
//                 <h3 class="text-base font-bold text-gray-900">${parsed.title || test.name}</h3>
//                 ${parsed.description ? `<p class="text-sm text-gray-700 mb-2">${parsed.description}</p>` : ''}
//                 ${sectionsHtml}
//               </div>
//             `;
//           }

//           // Fallback: format raw content to HTML
//           const formatted = formatMedicalReportToHTML(detailedPoint.reportJson) || '';
//           return `
//             <div class="mb-6">
//               <h3 class="text-base font-bold text-gray-900">${test.name}</h3>
//               <div>${formatted}</div>
//             </div>
//           `;
//         } catch (_) {
//           const formatted = formatMedicalReportToHTML(detailedPoint.reportJson) || '';
//           return `
//             <div class="mb-6">
//               <h3 class="text-base font-bold text-gray-900">${test.name}</h3>
//               <div>${formatted}</div>
//             </div>
//           `;
//         }
//       })
//       .filter(Boolean) as string[];

//     if (detailedReports.length > 0) {
//       htmlParts.push(`<div class="mb-4"><h2 class="text-sm font-bold text-gray-900">Detailed Reports</h2></div>`);
//       htmlParts = htmlParts.concat(detailedReports);
//     }

//     // Entered Results section (non-detailed)
//     if (reportPreview.testData.length > 0) {
//       // Group items by test name
//       const groupedByTest = reportPreview.testData
//         .filter(item => {
//           const key = (item.referenceDescription || '').toUpperCase();
//           return key !== 'RADIOLOGY_TEST' && key !== 'DETAILED REPORT';
//         })
//         .reduce((acc, item) => {
//           const testName = item.testName.toUpperCase();
//           if (!acc[testName]) {
//             acc[testName] = [];
//           }
//           acc[testName].push(item);
//           return acc;
//         }, {} as Record<string, typeof reportPreview.testData>);

//       // Build HTML for each test group
//       const testGroups = Object.entries(groupedByTest).map(([testName, items]) => {
//         const parameters = items.map(item => {
//           const label = (item.referenceDescription || 'Test Parameter');
//           const value = (() => {
//             const t = (item.referenceDescription || '').toUpperCase();
//             // if (t === 'DESCRIPTION') return item.description || 'N/A';
//             if (t === 'DESCRIPTION') {
//               return `
//       <li class="mb-1 text-sm text-gray-700 ml-4">
//         <div style="
//           padding-left: 100px;
//           text-indent: -100px;
//           white-space: normal;
//           word-break: break-word;
//         ">
//           <strong>${label}:</strong>
//           ${escapeHtmlWithBreaks(item.description || 'N/A')}
//         </div>
//       </li>
//     `;
//             }

//             if (t.includes('DROPDOWN')) return item.enteredValue || 'N/A';
//             return `${item.enteredValue} ${item.unit}`.trim();
//           })();
//           const ref = (() => {
//             const t = (item.referenceDescription || '').toUpperCase();
//             if (t.includes('DROPDOWN') || t === 'DESCRIPTION') return '';
//             return `${item.referenceRange || 'N/A'} ${item.unit || ''}`.trim();
//           })();
//           return `<li class="mb-1 text-sm text-gray-700 ml-4">
//             <span class="text-gray-800">${label}: ${value}</span>
//             ${ref ? `<span class="text-gray-500"> (Ref: ${ref})</span>` : ''}
//           </li>`;
//         }).join('');

//         return `
//           <div class="mb-4">
//             <h3 class="text-sm font-bold text-gray-900 mb-2">${testName}</h3>
//             <ul class="list-disc pl-5">${parameters}</ul>
//           </div>
//         `;
//       }).join('');

//       if (testGroups) {
//         htmlParts.push(`
//           <div class="mt-4">
//             <h2 class="text-sm font-bold text-gray-900 mb-3">Entered Results</h2>
//             ${testGroups}
//           </div>
//         `);
//       }
//     }

//     if (htmlParts.length === 0) {
//       htmlParts.push('<p class="text-sm text-gray-600">No data available to preview.</p>');
//     }

//     return htmlParts.join('\n');
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center p-6">
//         <Loader type="progress" fullScreen={false} text="Loading report data..." />
//         <p className="mt-4 text-sm text-gray-600">Fetching test and reference data...</p>
//       </div>
//     );
//   }

//   // const patientAge = selectedPatient.dateOfBirth ? calculateAgeObject(selectedPatient.dateOfBirth) : { years: 0, months: 0, days: 0 };

//   return (
//     <div className="bg-white shadow-lg rounded-xl overflow-hidden h-[500px] overflow-y-auto p-6">
//       <PatientBasicInfo patient={selectedPatient} />

//       {/* Range Indicator Legend */}
//       <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
//         <div className="flex items-center text-sm text-gray-700">
//           <TbSquareRoundedCheck className="text-green-500 mr-2" size={18} />
//           <span className="font-medium">Normal Range</span>
//         </div>
//         <div className="flex items-center text-sm text-gray-700">
//           <TbArrowDownCircle className="text-red-500 mr-2" size={18} />
//           <span className="font-medium">Below Normal</span>
//         </div>
//         <div className="flex items-center text-sm text-gray-700">
//           <TbArrowUpCircle className="text-red-500 mr-2" size={18} />
//           <span className="font-medium">Above Normal</span>
//         </div>
//         <div className="flex items-center text-sm text-gray-700">
//           <TbInfoCircle className="text-blue-500 mr-2" size={18} />
//           <span className="font-medium">No Reference</span>
//         </div>
//       </div>

//       <div className="space-y-4 mt-6">
//         {allTests.map((test) => {
//           // Check if any reference point has DETAILED REPORT description
//           const hasDetailedReport = referencePoints[test.name]?.some(point => point.testDescription === "DETAILED REPORT");

//           if (hasDetailedReport) {
//             // Find the reference point with DETAILED REPORT
//             const detailedReportPoint = referencePoints[test.name]?.find(point => point.testDescription === "DETAILED REPORT");

//             if (detailedReportPoint) {
//               return (
//                 <DetailedReportEditor
//                   key={test.id}
//                   point={detailedReportPoint}
//                   onReportJsonChange={(reportJson) => {
//                     // Update the reference point with new reportJson
//                     const updatedPoints = referencePoints[test.name]?.map(point =>
//                       point.id === detailedReportPoint.id
//                         ? { ...point, reportJson }
//                         : point
//                     ) || [];

//                     setReferencePoints(prev => ({
//                       ...prev,
//                       [test.name]: updatedPoints
//                     }));
//                   }}
//                 />
//               );
//             }
//           }

//           // Default rendering for other test types
//           return (
//             <TestComponentFactory
//               key={test.id}
//               test={test}
//               referencePoints={referencePoints[test.name] || []}
//               inputValues={inputValues}
//               onInputChange={handleInputChange}
//               getValueStatus={getValueStatus}
//               getStatusColor={getStatusColor}
//               getStatusIcon={getStatusIcon}
//             />
//           );
//         })}
//       </div>

//       {/* Generate Report Button */}
//       <div className="mt-8 text-center">
//         <button
//           onClick={prepareReportPreview}
//           className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
//           style={{
//             background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
//           }}
//         >
//           <TbReportMedical className="mr-2" size={18} />
//           Confirm
//         </button>
//       </div>

//       {/* Confirmation Dialog */}
//       <ConfirmationDialog
//         isOpen={showConfirmation}
//         onClose={() => setShowConfirmation(false)}
//         onConfirm={submitReport}
//         title={hasMissingDescriptions ? "Important Note About Test References" : "Confirm Report Submission"}
//         message={hasMissingDescriptions
//           ? "Some tests don't have digital references available. Please review the details below before submitting."
//           : "All test references have complete descriptions. Please review the data before submitting."}
//         confirmText="Confirm Submission"
//         cancelText="Cancel"
//         isLoading={isSubmitting}
//       >
//         <div className="space-y-4 text-sm">
//           {/* Patient Information */}
//           <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
//             <h4 className="font-semibold text-blue-800 mb-2">Patient Information</h4>
//             <div className="grid grid-cols-2 gap-2 text-xs">
//               <div>
//                 <span className="font-medium text-gray-600">Name:</span>
//                 <span className="ml-2 text-gray-900">{selectedPatient.patientname || 'N/A'}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-600">Phone:</span>
//                 <span className="ml-2 text-gray-900">{selectedPatient.contactNumber || 'N/A'}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-600">Email:</span>
//                 <span className="ml-2 text-gray-900">{selectedPatient.email || 'N/A'}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-600">Gender:</span>
//                 <span className="ml-2 text-gray-900 capitalize">{selectedPatient.gender || 'N/A'}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-600">Date of Birth:</span>
//                 <span className="ml-2 text-gray-900">{selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-600">Visit Date:</span>
//                 <span className="ml-2 text-gray-900">{selectedPatient.visitDate ? new Date(selectedPatient.visitDate).toLocaleDateString() : 'N/A'}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-600">Visit Status:</span>
//                 <span className="ml-2 text-gray-900 capitalize">{selectedPatient.visitStatus?.toLowerCase().replace('_', ' ') || 'N/A'}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-600">Visit ID:</span>
//                 <span className="ml-2 text-gray-900">{selectedPatient.visitId || 'N/A'}</span>
//               </div>
//             </div>
//           </div>

//           {/* Test Information */}
//           <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
//             <h4 className="font-semibold text-purple-800 mb-2">Test Information</h4>
//             <div className="grid grid-cols-2 gap-2 text-xs">
//               <div>
//                 <span className="font-medium text-gray-600">Test Name:</span>
//                 <span className="ml-2 text-gray-900">{selectedTest.name || 'N/A'}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-600">Category:</span>
//                 <span className="ml-2 text-gray-900">{selectedTest.category || 'N/A'}</span>
//               </div>
//               <div className="col-span-2">
//                 <span className="font-medium text-gray-600">Total Test Points:</span>
//                 <span className="ml-2 text-gray-900">{reportPreview.testData.length}</span>
//               </div>
//             </div>
//           </div>

//           {/* Missing Descriptions Warning */}
//           {hasMissingDescriptions && (
//             <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
//               <h4 className="font-semibold text-yellow-800 mb-2">Important Note</h4>
//               <ul className="list-disc pl-5 space-y-1 text-xs text-yellow-700">
//                 <li>Some tests ({reportPreview.testData.filter(item => !item.referenceDescription || item.referenceDescription === "No reference description available").length}) don&lsquo;t have digital references available</li>
//                 <li>These tests might be machine-generated or have hard copy references</li>
//                 <li>The results will be provided separately at the reception</li>
//                 <li>Please inform the patient to collect all results from the reception desk</li>
//               </ul>
//             </div>
//           )}

//           {/* Report Preview */}
//           <div className="bg-white p-3 rounded-lg border border-gray-200">
//             <h4 className="font-semibold text-gray-800 mb-2">Report Preview</h4>
//             <div className="border rounded-lg overflow-hidden bg-white">
//               <div className="p-4">
//                 <div
//                   className="report-html prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700"
//                   dangerouslySetInnerHTML={{ __html: buildReadablePreviewHTML() }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </ConfirmationDialog>
//     </div>
//   );
// };

// export default PatientReportDataFill;