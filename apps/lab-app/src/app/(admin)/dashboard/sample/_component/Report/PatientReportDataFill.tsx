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
// import { formatMedicalReportToHTML } from '@/utils/reportFormatter';

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

// Dropdown Component
const DropdownInput = ({ 
  value, 
  onChange, 
  options,
  placeholder = "Select value"
}: { 
  value: string; 
  onChange: (value: string) => void; 
  options: DropdownItem[];
  placeholder?: string;
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-32 rounded-full border border-info-500 bg-white px-3 text-p3 outline-none transition focus:border-secondary-700"
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

// Auto-calculation functions
const calculateAutoFields = (testName: string, inputs: Record<string | number, string>, referenceData: TestReferancePoint[]) => {
  const updatedInputs = { ...inputs };
  
  const getNumericValue = (index: number): number | null => {
    const val = inputs[index];
    if (!val || isNaN(Number(val))) return null;
    return parseFloat(val);
  };

  const setValue = (index: number, value: string) => {
    updatedInputs[index] = value;
  };

  const descriptions = referenceData.map(p => p.testDescription?.toUpperCase() || '');

  // CBC Auto-calculations
  if (testName.toUpperCase().includes('COMPLETE BLOOD COUNT') || testName.toUpperCase().includes('CBC')) {
    const hemoglobinIdx = descriptions.findIndex(d => d.includes('HEMOGLOBIN'));
    const hematocritIdx = descriptions.findIndex(d => d.includes('HEMATOCRIT'));
    const rbcIdx = descriptions.findIndex(d => d.includes('RBC COUNT') || d.includes('RED BLOOD CELL'));
    const mcvIdx = descriptions.findIndex(d => d.includes('MCV'));
    const mchIdx = descriptions.findIndex(d => d.includes('MCH'));
    const mchcIdx = descriptions.findIndex(d => d.includes('MCHC'));

    if (mcvIdx >= 0 && hematocritIdx >= 0 && rbcIdx >= 0) {
      const hematocrit = getNumericValue(hematocritIdx);
      const rbc = getNumericValue(rbcIdx);
      if (hematocrit !== null && rbc !== null && rbc > 0) {
        const mcv = (hematocrit / rbc) * 10;
        setValue(mcvIdx, mcv.toFixed(1));
      }
    }

    if (mchIdx >= 0 && hemoglobinIdx >= 0 && rbcIdx >= 0) {
      const hemoglobin = getNumericValue(hemoglobinIdx);
      const rbc = getNumericValue(rbcIdx);
      if (hemoglobin !== null && rbc !== null && rbc > 0) {
        const mch = (hemoglobin / rbc) * 10;
        setValue(mchIdx, mch.toFixed(1));
      }
    }

    if (mchcIdx >= 0 && hemoglobinIdx >= 0 && hematocritIdx >= 0) {
      const hemoglobin = getNumericValue(hemoglobinIdx);
      const hematocrit = getNumericValue(hematocritIdx);
      if (hemoglobin !== null && hematocrit !== null && hematocrit > 0) {
        const mchc = (hemoglobin / hematocrit) * 100;
        setValue(mchcIdx, mchc.toFixed(1));
      }
    }
  }

  // LFT Auto-calculations
  if (testName.toUpperCase().includes('LIVER FUNCTION TEST') || testName.toUpperCase().includes('LFT')) {
    const totalProteinIdx = descriptions.findIndex(d => d.includes('TOTAL PROTEIN'));
    const albuminIdx = descriptions.findIndex(d => d.includes('ALBUMIN'));
    const globulinIdx = descriptions.findIndex(d => d.includes('GLOBULIN'));
    const agRatioIdx = descriptions.findIndex(d => d.includes('A/G RATIO'));
    const totalBilirubinIdx = descriptions.findIndex(d => d.includes('TOTAL BILIRUBIN'));
    const directBilirubinIdx = descriptions.findIndex(d => d.includes('DIRECT BILIRUBIN'));
    const indirectBilirubinIdx = descriptions.findIndex(d => d.includes('INDIRECT BILIRUBIN'));

    if (globulinIdx >= 0 && totalProteinIdx >= 0 && albuminIdx >= 0) {
      const totalProtein = getNumericValue(totalProteinIdx);
      const albumin = getNumericValue(albuminIdx);
      if (totalProtein !== null && albumin !== null) {
        const globulin = totalProtein - albumin;
        setValue(globulinIdx, globulin.toFixed(1));
      }
    }

    if (agRatioIdx >= 0 && albuminIdx >= 0 && globulinIdx >= 0) {
      const albumin = getNumericValue(albuminIdx);
      const globulin = getNumericValue(globulinIdx);
      if (albumin !== null && globulin !== null && globulin > 0) {
        const agRatio = albumin / globulin;
        setValue(agRatioIdx, agRatio.toFixed(2));
      }
    }

    if (indirectBilirubinIdx >= 0 && totalBilirubinIdx >= 0 && directBilirubinIdx >= 0) {
      const totalBilirubin = getNumericValue(totalBilirubinIdx);
      const directBilirubin = getNumericValue(directBilirubinIdx);
      if (totalBilirubin !== null && directBilirubin !== null) {
        const indirectBilirubin = totalBilirubin - directBilirubin;
        setValue(indirectBilirubinIdx, indirectBilirubin.toFixed(1));
      }
    }
  }

  // LPT Auto-calculations
  if (testName.toUpperCase().includes('LIPID PROFILE') || testName.toUpperCase().includes('LPT')) {
    const vldlIdx = descriptions.findIndex(d => d.includes('VLDL'));
    const triglyceridesIdx = descriptions.findIndex(d => d.includes('TRIGLYCERIDES'));

    if (vldlIdx >= 0 && triglyceridesIdx >= 0) {
      const triglycerides = getNumericValue(triglyceridesIdx);
      if (triglycerides !== null) {
        const vldl = triglycerides / 5;
        setValue(vldlIdx, vldl.toFixed(2));
      }
    }
  }

  return updatedInputs;
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

  // Get status for value
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

  const handleInputChange = (testName: string, index: number | string, value: string) => {
    const numericValue = parseFloat(value);

    if (value !== '' && !isNaN(numericValue) && numericValue < 0) {
      const referenceData = referencePoints[testName] || [];
      const point = referenceData[typeof index === 'number' ? index : 0];

      const isAutoCalculatedField = point?.testDescription?.toUpperCase().includes('GLOBULIN') ||
        point?.testDescription?.toUpperCase().includes('INDIRECT BILIRUBIN') ||
        point?.testDescription?.toUpperCase().includes('A/G RATIO') ||
        point?.testDescription?.toUpperCase().includes('MEAN BLOOD GLUCOSE') ||
        point?.testDescription?.toUpperCase().includes('ABSOLUTE EOSINOPHIL COUNT') ||
        point?.testDescription?.toUpperCase().includes('HDL CHOLESTEROL - DIRECT') ||
        point?.testDescription?.toUpperCase().includes('LDL CHOLESTEROL - DIRECT') ||
        point?.testDescription?.toUpperCase().includes('VLDL CHOLESTEROL') ||
        point?.testDescription?.toUpperCase().includes('MCV') ||
        point?.testDescription?.toUpperCase().includes('MCH') ||
        point?.testDescription?.toUpperCase().includes('MCHC');

      if (!isAutoCalculatedField) {
        toast.error('Negative values are not allowed');
        return;
      }
    }

    setInputValues(prev => {
      const updated = {
        ...prev,
        [testName]: {
          ...prev[testName],
          [index]: value
        }
      };

      const refData = referencePoints[testName] || [];
      if (refData.length > 0) {
        const autoCalculated = calculateAutoFields(testName, updated[testName], refData);
        updated[testName] = autoCalculated;
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

      // Submit report directly
      const response = await createReportWithTestResult(currentLab?.id.toString() || '', completePayload);

      if (response !== undefined && response !== null) {
        toast.success('Report submitted successfully!');
        setUpdateCollectionTable(prev => !prev);
        // Immediately close the modal
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

                    const isAutoCalculated = point.testDescription?.toUpperCase().includes('GLOBULIN') ||
                      point.testDescription?.toUpperCase().includes('INDIRECT BILIRUBIN') ||
                      point.testDescription?.toUpperCase().includes('A/G RATIO') ||
                      point.testDescription?.toUpperCase().includes('MEAN BLOOD GLUCOSE') ||
                      point.testDescription?.toUpperCase().includes('ABSOLUTE EOSINOPHIL COUNT') ||
                      point.testDescription?.toUpperCase().includes('HDL CHOLESTEROL - DIRECT') ||
                      point.testDescription?.toUpperCase().includes('LDL CHOLESTEROL - DIRECT') ||
                      point.testDescription?.toUpperCase().includes('VLDL CHOLESTEROL') ||
                      point.testDescription?.toUpperCase().includes('MCV') ||
                      point.testDescription?.toUpperCase().includes('MCH') ||
                      point.testDescription?.toUpperCase().includes('MCHC');

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
                          {isDescription || isDropdown || isDropdownWithDescription || isAutoCalculated ? '-' : (getStatusLabel(status) || '-')}
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








// "use client";

// import React, { useState, useCallback, useEffect } from "react";
// import { CiCircleCheck } from "react-icons/ci";
// import { IoArrowBack } from "react-icons/io5";
// // import { TbInfoCircle, TbReportMedical, TbArrowDownCircle, TbArrowUpCircle, TbSquareRoundedCheck } from "react-icons/tb";
// import { toast } from 'react-toastify';
// import Loader from '@/app/(admin)/component/common/Loader';
// import { useLabs } from '@/context/LabContext';
// import { TestList, TestReferancePoint } from '@/types/test/testlist';
// import { getTestReferanceRangeByTestName } from '@/../services/testService';
// import { createReportWithTestResult } from '@/../services/reportServices';
// import { calculateAgeObject } from '@/utils/ageUtils';
// import { hasValidDropdown, parseDropdownField, DropdownItem } from '@/utils/dropdownParser';
// import { formatMedicalReportToHTML } from '@/utils/reportFormatter';
// import ConfirmationDialog from '@/app/(admin)/component/common/ConfirmationDialog';

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

// interface PatientReportDataFillProps {
//   selectedPatient: Patient;
//   selectedTest: TestList;
//   updateCollectionTable: boolean;
//   setShowModal: (value: React.SetStateAction<boolean>) => void;
//   setUpdateCollectionTable: (value: React.SetStateAction<boolean>) => void;
// }

// // Helper functions
// const escapeHtmlWithBreaks = (text: string) =>
//   text
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/ /g, '&nbsp;')
//     .replace(/\r?\n/g, '<br/>');

// const isPlainObject = (value: unknown): value is Record<string, unknown> =>
//   typeof value === 'object' && value !== null && !Array.isArray(value);

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
//   placeholder = "Select value"
// }: { 
//   value: string; 
//   onChange: (value: string) => void; 
//   options: DropdownItem[];
//   placeholder?: string;
// }) => {
//   return (
//     <select
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       className="h-9 w-32 rounded-full border border-info-500 bg-white px-3 text-p3 outline-none transition focus:border-secondary-700"
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

// // Auto-calculation functions
// const calculateAutoFields = (testName: string, inputs: Record<string | number, string>, referenceData: TestReferancePoint[]) => {
//   const updatedInputs = { ...inputs };
  
//   // Helper to get numeric value
//   const getNumericValue = (index: number): number | null => {
//     const val = inputs[index];
//     if (!val || isNaN(Number(val))) return null;
//     return parseFloat(val);
//   };

//   // Helper to set value
//   const setValue = (index: number, value: string) => {
//     updatedInputs[index] = value;
//   };

//   // Get the description of each point to identify auto-calculated fields
//   const descriptions = referenceData.map(p => p.testDescription?.toUpperCase() || '');

//   // CBC Auto-calculations
//   if (testName.toUpperCase().includes('COMPLETE BLOOD COUNT') || testName.toUpperCase().includes('CBC')) {
//     // Find indices for key parameters
//     const hemoglobinIdx = descriptions.findIndex(d => d.includes('HEMOGLOBIN'));
//     const hematocritIdx = descriptions.findIndex(d => d.includes('HEMATOCRIT'));
//     const rbcIdx = descriptions.findIndex(d => d.includes('RBC COUNT') || d.includes('RED BLOOD CELL'));
//     const mcvIdx = descriptions.findIndex(d => d.includes('MCV'));
//     const mchIdx = descriptions.findIndex(d => d.includes('MCH'));
//     const mchcIdx = descriptions.findIndex(d => d.includes('MCHC'));

//     // Calculate MCV = (Hematocrit / RBC) * 10
//     if (mcvIdx >= 0 && hematocritIdx >= 0 && rbcIdx >= 0) {
//       const hematocrit = getNumericValue(hematocritIdx);
//       const rbc = getNumericValue(rbcIdx);
//       if (hematocrit !== null && rbc !== null && rbc > 0) {
//         const mcv = (hematocrit / rbc) * 10;
//         setValue(mcvIdx, mcv.toFixed(1));
//       }
//     }

//     // Calculate MCH = (Hemoglobin / RBC) * 10
//     if (mchIdx >= 0 && hemoglobinIdx >= 0 && rbcIdx >= 0) {
//       const hemoglobin = getNumericValue(hemoglobinIdx);
//       const rbc = getNumericValue(rbcIdx);
//       if (hemoglobin !== null && rbc !== null && rbc > 0) {
//         const mch = (hemoglobin / rbc) * 10;
//         setValue(mchIdx, mch.toFixed(1));
//       }
//     }

//     // Calculate MCHC = (Hemoglobin / Hematocrit) * 100
//     if (mchcIdx >= 0 && hemoglobinIdx >= 0 && hematocritIdx >= 0) {
//       const hemoglobin = getNumericValue(hemoglobinIdx);
//       const hematocrit = getNumericValue(hematocritIdx);
//       if (hemoglobin !== null && hematocrit !== null && hematocrit > 0) {
//         const mchc = (hemoglobin / hematocrit) * 100;
//         setValue(mchcIdx, mchc.toFixed(1));
//       }
//     }
//   }

//   // LFT Auto-calculations
//   if (testName.toUpperCase().includes('LIVER FUNCTION TEST') || testName.toUpperCase().includes('LFT')) {
//     // Find indices for key parameters
//     const totalProteinIdx = descriptions.findIndex(d => d.includes('TOTAL PROTEIN'));
//     const albuminIdx = descriptions.findIndex(d => d.includes('ALBUMIN'));
//     const globulinIdx = descriptions.findIndex(d => d.includes('GLOBULIN'));
//     const agRatioIdx = descriptions.findIndex(d => d.includes('A/G RATIO'));
//     const totalBilirubinIdx = descriptions.findIndex(d => d.includes('TOTAL BILIRUBIN'));
//     const directBilirubinIdx = descriptions.findIndex(d => d.includes('DIRECT BILIRUBIN'));
//     const indirectBilirubinIdx = descriptions.findIndex(d => d.includes('INDIRECT BILIRUBIN'));

//     // Calculate Globulin = Total Protein - Albumin
//     if (globulinIdx >= 0 && totalProteinIdx >= 0 && albuminIdx >= 0) {
//       const totalProtein = getNumericValue(totalProteinIdx);
//       const albumin = getNumericValue(albuminIdx);
//       if (totalProtein !== null && albumin !== null) {
//         const globulin = totalProtein - albumin;
//         setValue(globulinIdx, globulin.toFixed(1));
//       }
//     }

//     // Calculate A/G Ratio = Albumin / Globulin
//     if (agRatioIdx >= 0 && albuminIdx >= 0 && globulinIdx >= 0) {
//       const albumin = getNumericValue(albuminIdx);
//       const globulin = getNumericValue(globulinIdx);
//       if (albumin !== null && globulin !== null && globulin > 0) {
//         const agRatio = albumin / globulin;
//         setValue(agRatioIdx, agRatio.toFixed(2));
//       }
//     }

//     // Calculate Indirect Bilirubin = Total Bilirubin - Direct Bilirubin
//     if (indirectBilirubinIdx >= 0 && totalBilirubinIdx >= 0 && directBilirubinIdx >= 0) {
//       const totalBilirubin = getNumericValue(totalBilirubinIdx);
//       const directBilirubin = getNumericValue(directBilirubinIdx);
//       if (totalBilirubin !== null && directBilirubin !== null) {
//         const indirectBilirubin = totalBilirubin - directBilirubin;
//         setValue(indirectBilirubinIdx, indirectBilirubin.toFixed(1));
//       }
//     }
//   }

//   // LPT Auto-calculations
//   if (testName.toUpperCase().includes('LIPID PROFILE') || testName.toUpperCase().includes('LPT')) {
//     const hdlIdx = descriptions.findIndex(d => d.includes('HDL'));
//     const ldlIdx = descriptions.findIndex(d => d.includes('LDL'));
//     const vldlIdx = descriptions.findIndex(d => d.includes('VLDL'));
//     const triglyceridesIdx = descriptions.findIndex(d => d.includes('TRIGLYCERIDES'));

//     // Calculate VLDL = Triglycerides / 5
//     if (vldlIdx >= 0 && triglyceridesIdx >= 0) {
//       const triglycerides = getNumericValue(triglyceridesIdx);
//       if (triglycerides !== null) {
//         const vldl = triglycerides / 5;
//         setValue(vldlIdx, vldl.toFixed(2));
//       }
//     }
//   }

//   return updatedInputs;
// };

// const PatientReportDataFill: React.FC<PatientReportDataFillProps> = ({
//   selectedPatient,
//   selectedTest,
//   setUpdateCollectionTable,
//   setShowModal
// }) => {
//   const { currentLab } = useLabs();
  
//   // State management
//   const [reportSaved, setReportSaved] = useState(false);
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

//   // Get status for value
//   const getValueStatus = (value: string, minRef: number | null, maxRef: number | null) => {
//     if (!value || isNaN(Number(value))) return 'no-reference';
//     const numValue = parseFloat(value);

//     if (minRef === null || maxRef === null) return 'no-reference';
//     if (numValue < minRef) return 'below';
//     if (numValue > maxRef) return 'above';
//     return 'normal';
//   };

//   const getStatusTextColor = (status: string) => {
//     switch (status) {
//       case 'above':
//         return 'text-warning-500';
//       case 'below':
//         return 'text-danger-600';
//       case 'normal':
//         return 'text-success-900';
//       default:
//         return 'text-pneutral-400';
//     }
//   };

//   const getInputBorderColor = (status: string) => {
//     switch (status) {
//       case 'above':
//         return 'border-warning-500';
//       case 'below':
//         return 'border-danger-600';
//       case 'normal':
//         return 'border-info-500';
//       default:
//         return 'border-info-500';
//     }
//   };

//   const getRowBackground = (status: string) => {
//     switch (status) {
//       case 'above':
//         return 'bg-warning-50';
//       case 'below':
//         return 'bg-danger-50';
//       default:
//         return '';
//     }
//   };

//   const getStatusLabel = (status: string) => {
//     switch (status) {
//       case 'above': return 'High';
//       case 'below': return 'Low';
//       case 'normal': return 'Normal';
//       default: return '';
//     }
//   };

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
//       console.log('Missing selectedTest or currentLab:', { selectedTest, currentLab });
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log('Fetching reference data for:', {
//         labId: currentLab.id,
//         testName: selectedTest.name
//       });

//       const response = await getTestReferanceRangeByTestName(currentLab.id.toString(), selectedTest.name);

//       console.log('Reference data response:', response);

//       if (response) {
//         // Handle both single object and array response
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
//       console.error('Error fetching reference data:', error);
//       // Try to get the error message
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
//     const numericValue = parseFloat(value);

//     if (value !== '' && !isNaN(numericValue) && numericValue < 0) {
//       const referenceData = referencePoints[testName] || [];
//       const point = referenceData[typeof index === 'number' ? index : 0];

//       const isAutoCalculatedField = point?.testDescription?.toUpperCase().includes('GLOBULIN') ||
//         point?.testDescription?.toUpperCase().includes('INDIRECT BILIRUBIN') ||
//         point?.testDescription?.toUpperCase().includes('A/G RATIO') ||
//         point?.testDescription?.toUpperCase().includes('MEAN BLOOD GLUCOSE') ||
//         point?.testDescription?.toUpperCase().includes('ABSOLUTE EOSINOPHIL COUNT') ||
//         point?.testDescription?.toUpperCase().includes('HDL CHOLESTEROL - DIRECT') ||
//         point?.testDescription?.toUpperCase().includes('LDL CHOLESTEROL - DIRECT') ||
//         point?.testDescription?.toUpperCase().includes('VLDL CHOLESTEROL') ||
//         point?.testDescription?.toUpperCase().includes('MCV') ||
//         point?.testDescription?.toUpperCase().includes('MCH') ||
//         point?.testDescription?.toUpperCase().includes('MCHC');

//       if (!isAutoCalculatedField) {
//         toast.error('Negative values are not allowed');
//         return;
//       }
//     }

//     // Update the input value
//     setInputValues(prev => {
//       const updated = {
//         ...prev,
//         [testName]: {
//           ...prev[testName],
//           [index]: value
//         }
//       };

//       // Trigger auto-calculation for the specific test
//       const refData = referencePoints[testName] || [];
//       if (refData.length > 0) {
//         const autoCalculated = calculateAutoFields(testName, updated[testName], refData);
//         updated[testName] = autoCalculated;
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
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     const generatedReportData: ReportData[] = [];
//     let hasMissingDesc = false;

//     allTests.forEach((test) => {
//       if (test.category === 'RADIOLOGY') {
//         const formattedTestName = test.name
//           .split(' ')
//           .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//           .join(' ');

//         const formattedCategory = test.category
//           .split(' ')
//           .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//           .join(' ');

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

//         return;
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

//           const hasApiDropdown = hasValidDropdown(point.dropdown);

//           // EXACT logic from old code
//           if (point.testDescription === "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE" ||
//             point.testDescription === "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT") {
//             unit = point.units || "N/A";
//             description = hasDescription ? testInputs[descriptionKey] : "N/A";
//             finalValue = testInputs[index] || "N/A";
//             referenceRange = resolvedReferenceRange;
//           } else if (hasApiDropdown || ["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
//             "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"].includes(point.testDescription)) {
//             unit = point.units || "N/A";
//             description = "N/A";
//             finalValue = testInputs[index] || "N/A";
//             referenceRange = resolvedReferenceRange;
//           } else if (point.testDescription === "DESCRIPTION") {
//             unit = "N/A";
//             description = testInputs[index] || "N/A";
//             finalValue = testInputs[index] || "N/A";
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

//       if (response !== undefined && response !== null) {
//         toast.success('Report submitted successfully!');
//         setShowConfirmation(false);
//         setReportSaved(true);
//         setUpdateCollectionTable(prev => !prev);
//         setTimeout(() => {
//           setShowModal(false);
//         }, 2000);
//       } else {
//         toast.error('Failed to submit report');
//       }
//     } catch (error) {
//       toast.error('Failed to submit report');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const buildReadablePreviewHTML = () => {
//     let htmlParts: string[] = [];

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

//     if (reportPreview.testData.length > 0) {
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

//       const testGroups = Object.entries(groupedByTest).map(([testName, items]) => {
//         const parameters = items.map(item => {
//           const label = (item.referenceDescription || 'Test Parameter');
//           const value = (() => {
//             const t = (item.referenceDescription || '').toUpperCase();
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
//       {/* Success Banner */}
//       {reportSaved && (
//         <div className="mb-6 rounded-2xl border border-success-900 bg-success-50 px-4 py-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <CiCircleCheck className="h-6 w-6 shrink-0 text-success-700" />
//               <p className="text-p3 font-medium text-[#006045]">
//                 Results saved. Report is ready for review.
//               </p>
//             </div>

//             <button 
//               onClick={() => setShowModal(false)}
//               className="rounded-full border border-pneutral-200 bg-pneutral-50 px-3 py-2 text-label-l2 font-medium text-pneutral-900"
//             >
//               Preview Report
//             </button>
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
//             onClick={prepareReportPreview}
//             className="flex items-center gap-2 rounded-full bg-secondary-700 px-3 py-2 text-label-l3 font-medium text-pneutral-50"
//           >
//             <CiCircleCheck className="h-5 w-5" />
//             Save & Generate Report
//           </button>
//         </div>
//       </div>

//       <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
//         {/* Left Side - Test Table with NEW UI */}
//         <div className="space-y-6">
//           {/* Test Header Card */}
//           <div className="rounded-xl border border-pneutral-200 bg-white px-4 py-3">
//             <h3 className="text-label-l4 font-medium text-pneutral-900">
//               {selectedTest?.name} — {selectedTest?.category || 'Test'}
//             </h3>
//           </div>

//           {/* Test Table Card with NEW UI styling */}
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
                    
//                     // Determine field type using proper dropdown parser
//                     const dropdownResult = parseDropdownField(point.dropdown);
//                     const hasApiDropdown = dropdownResult.isValid;
//                     const dropdownItems = dropdownResult.data;

//                     // Check if it's a dropdown field (either from API or hardcoded type)
//                     const isDropdown = hasApiDropdown || 
//                       ["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
//                        "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"]
//                       .includes(point.testDescription || '');

//                     const isDropdownWithDescription = 
//                       point.testDescription === "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE" ||
//                       point.testDescription === "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT";

//                     const isDescription = point.testDescription === "DESCRIPTION";
//                     const isDetailedReport = point.testDescription === "DETAILED REPORT";

//                     // Get dropdown options - Check test name as well
//                     let dropdownOptions: DropdownItem[] = [];
                    
//                     if (hasApiDropdown && dropdownItems && dropdownItems.length > 0) {
//                       // Use the dropdown items from API
//                       dropdownOptions = dropdownItems;
//                       console.log(`Dropdown options for ${point.testDescription}:`, dropdownOptions);
//                     } else if (isDropdown) {
//                       // Hardcoded fallback options based on test description OR test name
//                       const desc = point.testDescription?.toUpperCase() || '';
//                       const name = selectedTest?.name?.toUpperCase() || '';
                      
//                       // Check if it's a blood group test
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

//                     // Get status for numeric values only
//                     let status = 'no-reference';
//                     let minRef = point.minReferenceRange;
//                     let maxRef = point.maxReferenceRange;
                    
//                     if (!isDropdown && !isDescription && !isDropdownWithDescription && currentValue && !isNaN(Number(currentValue))) {
//                       status = getValueStatus(currentValue, minRef, maxRef);
//                     }

//                     // Skip rendering DETAILED REPORT in table
//                     if (isDetailedReport) {
//                       return null;
//                     }

//                     // Check if this is an auto-calculated field
//                     const isAutoCalculated = point.testDescription?.toUpperCase().includes('GLOBULIN') ||
//                       point.testDescription?.toUpperCase().includes('INDIRECT BILIRUBIN') ||
//                       point.testDescription?.toUpperCase().includes('A/G RATIO') ||
//                       point.testDescription?.toUpperCase().includes('MEAN BLOOD GLUCOSE') ||
//                       point.testDescription?.toUpperCase().includes('ABSOLUTE EOSINOPHIL COUNT') ||
//                       point.testDescription?.toUpperCase().includes('HDL CHOLESTEROL - DIRECT') ||
//                       point.testDescription?.toUpperCase().includes('LDL CHOLESTEROL - DIRECT') ||
//                       point.testDescription?.toUpperCase().includes('VLDL CHOLESTEROL') ||
//                       point.testDescription?.toUpperCase().includes('MCV') ||
//                       point.testDescription?.toUpperCase().includes('MCH') ||
//                       point.testDescription?.toUpperCase().includes('MCHC');

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
//                           {isDescription || isDropdown || isDropdownWithDescription || isAutoCalculated ? '-' : (getStatusLabel(status) || '-')}
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
//                 <span className="ml-2 text-gray-900">{selectedTest?.name || 'N/A'}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-600">Category:</span>
//                 <span className="ml-2 text-gray-900">{selectedTest?.category || 'N/A'}</span>
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










// new UI but API is not integrated...........

// "use client";

// import React, { useState } from "react";
// import { CiCircleCheck } from "react-icons/ci";
// import { IoArrowBack } from "react-icons/io5";

// type TestRow = {
//   parameter: string;
//   unit: string;
//   referenceRange: string;
// };

// const cbcData: TestRow[] = [
//   {
//     parameter: "Hemoglobin",
//     unit: "g/dL",
//     referenceRange: "13.0 - 17.0",
//   },
//   {
//     parameter: "WBC Count",
//     unit: "×10³/µL",
//     referenceRange: "4.0 - 11.0",
//   },
//   {
//     parameter: "Platelet Count",
//     unit: "×10³/µL",
//     referenceRange: "150 - 400",
//   },
//   {
//     parameter: "RBC Count",
//     unit: "×10⁶/µL",
//     referenceRange: "4.5 - 5.5",
//   },
//   {
//     parameter: "Hematocrit",
//     unit: "%",
//     referenceRange: "40 - 50",
//   },
//   {
//     parameter: "MCV",
//     unit: "fL",
//     referenceRange: "80 - 100",
//   },
//   {
//     parameter: "MCH",
//     unit: "pg",
//     referenceRange: "27 - 33",
//   },
//   {
//     parameter: "MCHC",
//     unit: "g/dL",
//     referenceRange: "32 - 36",
//   },
// ];

// const PatientReportDataFill = () => {
//   const [results, setResults] = useState<Record<string, string>>({});
//   const [reportSaved, setReportSaved] = useState(false);

//   const handleResultChange = (
//     parameter: string,
//     value: string
//   ) => {
//     setResults((prev) => ({
//       ...prev,
//       [parameter]: value,
//     }));
//   };

//   const getStatus = (
//     value: string,
//     referenceRange: string
//   ): "Normal" | "Low" | "High" | "" => {
//     if (!value) return "";

//     const numericValue = Number(value);

//     const [min, max] = referenceRange
//       .split("-")
//       .map((item) => Number(item.trim()));

//     if (numericValue < min) return "Low";
//     if (numericValue > max) return "High";

//     return "Normal";
//   };

//   const getStatusTextColor = (status: string) => {
//     switch (status) {
//       case "High":
//         return "text-warning-500";
//       case "Low":
//         return "text-danger-600";
//       case "Normal":
//         return "text-success-900";
//       default:
//         return "text-pneutral-400";
//     }
//   };

//   const getInputBorderColor = (status: string) => {
//     switch (status) {
//       case "High":
//         return "border-warning-500";
//       case "Low":
//         return "border-danger-600";
//       case "Normal":
//         return "border-info-500";
//       default:
//         return "border-info-500";
//     }
//   };

//   const getRowBackground = (status: string) => {
//     switch (status) {
//       case "High":
//         return "bg-warning-50";
//       case "Low":
//         return "bg-danger-50";
//       default:
//         return "";
//     }
//   };

//   return (
//     <div className="min-h-screen bg-info-50">
//       {/* Success Banner */}
//       {reportSaved && (
//         <div className="mb-6 rounded-2xl border border-success-900 bg-success-50 px-4 py-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <CiCircleCheck className="h-6 w-6 shrink-0 text-success-700" />
//               <p className="text-p3 font-medium text-[#006045]">
//                 Results saved. Report is ready for review.
//               </p>
//             </div>

//             <button className="rounded-full border border-pneutral-200 bg-pneutral-50 px-3 py-2 text-label-l2 font-medium text-pneutral-900">
//               Preview Report
//             </button>
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
//             15 June 2024 • 12 samples pending
//           </p>
//         </div>

//         <div className="flex gap-3">
//           <button className="flex items-center gap-2 rounded-full border border-pneutral-600 px-3 py-2 text-label-l3 font-medium text-pneutral-600">
//             <IoArrowBack className="h-4 w-4 text-pneutral-600" />
//             Back to Queue
//           </button>

//           <button
//             onClick={() => setReportSaved(true)}
//             className="flex items-center gap-2 rounded-full bg-secondary-700 px-3 py-2 text-label-l3 font-medium text-pneutral-50"
//           >
//             <CiCircleCheck className="h-5 w-5" />
//             Save & Generate Report
//           </button>
//         </div>
//       </div>

//       <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
//         {/* Left Side */}
//         <div className="space-y-6">
//           {[1, 2].map((section) => (

//             <div key={section} className="space-y-4">
//               {/* CBC Header Card */}
//               <div className="rounded-xl border border-pneutral-200 bg-white px-4 py-3">
//                 <h3 className="text-label-l4 font-medium text-pneutral-900">
//                   CBC — Complete Blood Count
//                 </h3>
//               </div>

//               {/* CBC Table Card */}
//               <div className="overflow-hidden rounded-xl border border-pneutral-200 bg-white">
//                 <div className="overflow-x-auto">
//                   <table className="w-full min-w-[750px]">
//                     <thead>
//                       <tr className="border-b border-pneutral-200 bg-white text-left text-label-l3 text-pneutral-900">
//                         <th className="px-4 py-3">Parameter</th>
//                         <th className="px-4 py-3">Result</th>
//                         <th className="px-4 py-3">Unit</th>
//                         <th className="px-4 py-3">Ref. Range</th>
//                         <th className="px-4 py-3">Status</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {cbcData.map((row) => {
//                         const currentValue =
//                           results[row.parameter] || "";

//                         const status = getStatus(
//                           currentValue,
//                           row.referenceRange
//                         );

//                         return (
//                           <tr
//                             key={`${section}-${row.parameter}`}
//                             className={`border-b border-pneutral-200 last:border-0 ${getRowBackground(
//                               status
//                             )}`}
//                           >
//                             <td className="px-4 py-3 text-p3 text-pneutral-900">
//                               {row.parameter}
//                             </td>

//                             <td className="px-4 py-3 text-p3">
//                               <input
//                                 type="number"
//                                 value={currentValue}
//                                 placeholder="Enter value"
//                                 onChange={(e) =>
//                                   handleResultChange(
//                                     row.parameter,
//                                     e.target.value
//                                   )
//                                 }
//                                 className={`h-9 w-32 rounded-full border bg-white px-3 text-p3 outline-none transition ${getInputBorderColor(
//                                   status
//                                 )}`}
//                               />
//                             </td>

//                             <td className="px-4 py-3 text-p3 text-pneutral-900">
//                               {row.unit}
//                             </td>

//                             <td className="px-4 py-3 text-p3 text-sneutral-500">
//                               {row.referenceRange}
//                             </td>

//                             <td
//                               className={`px-4 py-3 text-p3 font-medium ${getStatusTextColor(
//                                 status
//                               )}`}
//                             >
//                               {status || "-"}
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//             // <div
//             //   key={section}
//             //   className="overflow-hidden rounded-xl border border-gray-200 bg-white"
//             // >
//             //   <div className="border-b border-pneutral-200 bg-gray-50 px-4 py-3">
//             //     <h3 className="font-medium text-label-l4 text-pneutral-900">
//             //       CBC — Complete Blood Count
//             //     </h3>
//             //   </div>

//             //   <div className="overflow-x-auto">
//             //     <table className="w-full min-w-[750px]">
//             //       <thead>
//             //         <tr className="border-b border-pneutral-200 bg-white text-left text-label-l3 text-pneutral-900">
//             //           <th className="px-4 py-3">Parameter</th>
//             //           <th className="px-4 py-3">Result</th>
//             //           <th className="px-4 py-3">Unit</th>
//             //           <th className="px-4 py-3">Ref. Range</th>
//             //           <th className="px-4 py-3">Status</th>
//             //         </tr>
//             //       </thead>

//             //       <tbody>
//             //         {cbcData.map((row) => {
//             //           const currentValue =
//             //             results[row.parameter] || "";

//             //           const status = getStatus(
//             //             currentValue,
//             //             row.referenceRange
//             //           );

//             //           return (
//             //             <tr
//             //               key={`${section}-${row.parameter}`}
//             //               className={`border-b border-pneutral-200 last:border-0 ${getRowBackground(
//             //                 status
//             //               )}`}
//             //             >
//             //               <td className="px-4 py-3 text-p3 text-pneutral-900">
//             //                 {row.parameter}
//             //               </td>

//             //               <td className="px-4 py-3 text-p3">
//             //                 <input
//             //                   type="number"
//             //                   value={currentValue}
//             //                   placeholder="Enter value"
//             //                   onChange={(e) =>
//             //                     handleResultChange(
//             //                       row.parameter,
//             //                       e.target.value
//             //                     )
//             //                   }
//             //                   className={`h-9 w-32 rounded-full border bg-white px-3 text-p3 outline-none transition ${getInputBorderColor(
//             //                     status
//             //                   )}`}
//             //                 />
//             //               </td>

//             //               <td className="px-4 py-3 text-p3 text-pneutral-900">
//             //                 {row.unit}
//             //               </td>

//             //               <td className="px-4 py-3 text-p3 text-sneutral-500">
//             //                 {row.referenceRange}
//             //               </td>

//             //               <td
//             //                 className={`px-4 py-3 text-p3 font-medium ${getStatusTextColor(
//             //                   status
//             //                 )}`}
//             //               >
//             //                 {status || "-"}
//             //               </td>
//             //             </tr>
//             //           );
//             //         })}
//             //       </tbody>
//             //     </table>
//             //   </div>
//             // </div>
//           ))}
//         </div>

//         {/* Right Sidebar */}
//         <aside>
//           <div className="rounded-2xl border border-white bg-white p-4">
//             <h3 className="mb-5 text-p3 font-semibold text-pneutral-900">
//               Mrs. Lakshmi Iyer
//             </h3>

//             <div className="space-y-3 ">
//               <InfoRow
//                 label="Patient ID"
//                 value="PAT-00513"
//               />
//               <InfoRow
//                 label="Age / Gender"
//                 value="34 Yrs, Female"
//               />
//               <InfoRow
//                 label="Doctor"
//                 value="Dr. R. Mehta"
//               />
//               <InfoRow label="Visit Type" value="OPD" />
//               <InfoRow
//                 label="Contact"
//                 value="9454042494"
//               />
//               <InfoRow
//                 label="Tests Ordered"
//                 value="CBC, LFT, TFT"
//               />
//             </div>

//             <div className="mt-6 rounded-xl border border-info-200 bg-info-50 p-4">
//               <div className="mb-4 flex items-center justify-between">
//                 <h4 className="text-p2 font-semibold text-pneutral-900">
//                   Visit Information
//                 </h4>

//                 <span className="text-p2 text-pneutral-500">
//                   12 Apr 2024
//                 </span>
//               </div>

//               <InfoRow
//                 label="Status"
//                 value="Completed"
//               />
//             </div>
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// };

// const InfoRow = ({
//   label,
//   value,
// }: {
//   label: string;
//   value: string;
// }) => {
//   return (
//     <div className="flex items-start justify-between text-p3 gap-4">
//       <span className="text-pneutral-500 ">{label}</span>
//       <span className="text-right font-medium text-pneutral-900">
//         {value}
//       </span>
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