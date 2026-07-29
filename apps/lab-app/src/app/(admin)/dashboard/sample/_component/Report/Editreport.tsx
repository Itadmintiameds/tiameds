/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getReportDataById, updateReportById } from '@/../services/reportServices';
import { getTestReferanceRangeByTestName } from '@/../services/testService';
import Loader from '@/app/(admin)/component/common/Loader';
import { useLabs } from '@/context/LabContext';
// import { PatientData } from '@/types/sample/sample';
import { TestList, TestReferancePoint } from '@/types/test/testlist';
import { calculateAgeObject } from '@/utils/ageUtils';
import { hasValidDropdown, parseDropdownField, DropdownItem } from '@/utils/dropdownParser';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TbReportMedical, TbChevronLeft,} from "react-icons/tb";
import { toast } from 'react-toastify';
import AutoCalculation from './AutoCalculation';
import DetailedReportEditor from './DetailedReportEditor';
import NewModal from "../../../newcommoncomponent/NewModal";
import { FaChevronDown } from "react-icons/fa";
import { createPortal } from "react-dom";

export interface Patient {
  visitId: number;
  patientname: string;
  gender?: string;
  contactNumber?: string;
  email?: string;
  visitDate: string;
  visitStatus: string;
  sampleNames: string[];
  testIds?: number[];
  packageIds: number[];
  dateOfBirth?: string;
  doctorName?: string;
  visitType?: string;
}

interface ReportData {
  report_id?: string;
  visit_id: string;
  testName: string;
  testCategory: string;
  patientName: string;
  referenceDescription: string;
  referenceRange: string;
  referenceAgeRange: string;
  enteredValue: string;
  unit: string;
  description?: string;
  referenceRanges?: string;
  reportJson?: string;
}

interface PatientReportDataEditProps {
  editPatient: Patient;
  selectedTest: TestList;
  reportId: number;
  setShowModal: (value: React.SetStateAction<boolean>) => void;
  refreshReports: () => void;
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

// Get dynamic step for number input
const getDynamicStep = (value: string) => {
  if (!value || !value.includes(".")) {
    return 1;
  }

  const decimalPart = value.split(".")[1];

  return Math.pow(10, -decimalPart.length);
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

// Combobox Component for Percentage Input with Dropdown
const PercentageCombobox = ({
  value,
  onChange,
  placeholder = "",
  disabled = false,
  className = ""
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate percentage options from 0% to 100% in increments of 10
  const percentageOptions = Array.from({ length: 11 }, (_, i) => ({
    label: `${i * 10}%`,
    value: String(i * 10)
  }));

  // Update input value when prop changes - FIXED: Now properly updates when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Update dropdown position when open
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 120),
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleOptionSelect = (selectedValue: string) => {
    setInputValue(selectedValue);
    onChange(selectedValue);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const toggleDropdown = () => {
    const newState = !isOpen;
    setIsOpen(newState);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <div className="relative">
        <input
          type="number"
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled}
          className={`h-9 w-32 rounded-full border border-info-500 bg-white pl-3 pr-3 text-p3 outline-none transition focus:border-secondary-700 disabled:opacity-60 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className}`}
          step={getDynamicStep(inputValue)}
          min="0"
          max="100"
        />
        {/* % symbol positioned to the right of the input but before the spinner buttons */}
        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-p3 text-pneutral-600 pointer-events-none select-none">
          %
        </span>
        {/* Dropdown toggle button */}
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-pneutral-400 hover:text-pneutral-600 focus:outline-none p-1"
        >
          <FaChevronDown size={12} />
        </button>
      </div>

      {/* Dropdown rendered via portal */}
      {isOpen && !disabled && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: dropdownStyle.top,
            left: dropdownStyle.left,
            width: dropdownStyle.width,
            zIndex: 999999,
          }}
          className="max-h-52 overflow-y-auto rounded-lg border border-pneutral-200 bg-white shadow-xl"
        >
          <div className="py-1">
            {percentageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full px-4 py-2 text-left text-p3 hover:bg-info-50 transition-colors ${
                  inputValue === option.value
                    ? "bg-info-100 text-secondary-700"
                    : "text-pneutral-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
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

const normalizeKey = (value?: string) => (value || '').trim().toUpperCase();

const PatientReportDataEdit: React.FC<PatientReportDataEditProps> = ({
  editPatient,
  selectedTest,
  reportId,
  setShowModal,
  refreshReports,
}) => {
  const { currentLab } = useLabs();
  const [loading, setLoading] = useState(false);
  const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
  const [inputValues, setInputValues] = useState<Record<string, Record<string | number, string>>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [existingReportData, setExistingReportData] = useState<ReportData[]>([]);
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
        const patientGender = editPatient.gender?.toUpperCase() || '';

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

      const ageObj = editPatient.dateOfBirth ? calculateAgeObject(editPatient.dateOfBirth) : { years: 0, months: 0, days: 0 };
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
        }
        return patientAgeMonths >= minMonths && patientAgeMonths < maxMonths;
      });

      filteredData[testName] = ageFilteredPoints.length > 0 ? ageFilteredPoints : genderFilteredPoints;
    });

    return filteredData;
  }, [editPatient.dateOfBirth, editPatient.gender]);

  const fetchReferenceData = useCallback(async () => {
    if (!selectedTest || !currentLab) return;

    setLoading(true);
    try {
      const existingReport = await getReportDataById(currentLab.id.toString(), reportId.toString());
      const reportItems: any[] = (Array.isArray(existingReport) ? existingReport : [existingReport]) as any[];
      
      const mappedReportData: ReportData[] = reportItems
        .flatMap((item) => {
          const reportIdValue = item.reportId ?? item.reportid ?? item.report_id;
          const baseItem = {
            report_id: reportIdValue !== undefined && reportIdValue !== null ? String(reportIdValue) : '',
            visit_id: item.visit_id ?? item.visitId?.toString() ?? editPatient.visitId.toString(),
            testName: item.testName ?? selectedTest.name,
            testCategory: item.testCategory ?? '',
            patientName: item.patientName ?? editPatient.patientname,
            referenceAgeRange: item.referenceAgeRange ?? '',
            reportJson: item.reportJson,
            referenceRanges: item.referenceRanges,
          };

          const rows = Array.isArray(item.testRows) ? item.testRows : [];
          if (rows.length === 0) {
            return [{
              ...baseItem,
              referenceDescription: item.referenceDescription ?? '',
              referenceRange: item.referenceRange ?? '',
              enteredValue: item.enteredValue ?? '',
              unit: item.unit ?? '',
              description: item.description,
            }];
          }

          return rows.map((row: any) => ({
            ...baseItem,
            referenceDescription: row.testParameter ?? row.referenceDescription ?? '',
            referenceRange: row.normalRange ?? row.referenceRange ?? '',
            enteredValue: row.enteredValue ?? '',
            unit: row.unit ?? '',
            description: row.description,
          }));
        })
        .filter(item => normalizeKey(item.testName) === normalizeKey(selectedTest.name));

      setExistingReportData(mappedReportData);

      const response = await getTestReferanceRangeByTestName(currentLab.id.toString(), selectedTest.name);
      const refPointsRaw = Array.isArray(response) ? response : [response];
      const filteredData = filterReferenceData({ [selectedTest.name]: refPointsRaw });
      if ((filteredData[selectedTest.name] || []).length === 0) {
        filteredData[selectedTest.name] = refPointsRaw;
      }

      const detailedPointIndex = filteredData[selectedTest.name]?.findIndex(
        point => (point.testDescription || '').toUpperCase() === 'DETAILED REPORT'
      );
      const existingDetailed = mappedReportData.find(item => (item.referenceDescription || '').toUpperCase() === 'DETAILED REPORT');
      if (detailedPointIndex !== undefined && detailedPointIndex >= 0 && existingDetailed?.reportJson) {
        const nextPoints = [...(filteredData[selectedTest.name] || [])];
        nextPoints[detailedPointIndex] = { ...nextPoints[detailedPointIndex], reportJson: existingDetailed.reportJson };
        filteredData[selectedTest.name] = nextPoints;
      }

      setReferencePoints(filteredData);

      const initialInputValues: Record<string, Record<string | number, string>> = {};
      const refPoints = filteredData[selectedTest.name] || [];

      // In the fetchReferenceData function, when setting initial input values:
mappedReportData.forEach((reportItem) => {
  const reportKey = normalizeKey(reportItem.referenceDescription);
  const pointIndex = refPoints.findIndex(
    point => normalizeKey(point.testDescription) === reportKey
  );

  if (pointIndex >= 0) {
    if (!initialInputValues[selectedTest.name]) {
      initialInputValues[selectedTest.name] = {};
    }

    const descriptionKey = `${pointIndex}_description`;
    const descriptionUpper = normalizeKey(refPoints[pointIndex]?.testDescription);
    
    // Check if this is a percentage test
    const isRandomUrineSugar = selectedTest.name?.toUpperCase().includes('RANDOM URINE SUGAR') || 
                              selectedTest.name?.toUpperCase().includes('RUS');
    const isPercentageTest = isRandomUrineSugar && 
      (refPoints[pointIndex]?.testDescription?.toUpperCase().includes('DROPDOWN-PERCENTAGE') || 
       refPoints[pointIndex]?.testDescription?.toUpperCase().includes('PERCENTAGE'));

    if (descriptionUpper === 'DESCRIPTION') {
      initialInputValues[selectedTest.name][pointIndex] = reportItem.description || reportItem.enteredValue || '';
    } else if (
      descriptionUpper === 'DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE' ||
      descriptionUpper === 'DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT'
    ) {
      initialInputValues[selectedTest.name][pointIndex] = reportItem.enteredValue || '';
      if (reportItem.description) {
        initialInputValues[selectedTest.name][descriptionKey] = reportItem.description;
      }
    } else if (isPercentageTest) {
      // For percentage tests, extract just the number without the % symbol
      const enteredValue = reportItem.enteredValue || '';
      // Remove % symbol if present
      const numericValue = enteredValue.replace('%', '').trim();
      initialInputValues[selectedTest.name][pointIndex] = numericValue || '';
    } else {
      initialInputValues[selectedTest.name][pointIndex] = reportItem.enteredValue || '';
    }
  }
});

      setInputValues(initialInputValues);
      setValidationErrors({});
    } catch (error) {
      toast.error('Failed to load test and report data');
    } finally {
      setLoading(false);
    }
  }, [selectedTest, currentLab, editPatient, filterReferenceData]);

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

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
      const updated = {
        ...prev,
        [testName]: {
          ...prev[testName],
          [index]: value
        }
      };

      // Trigger auto-calculation for the specific test
      const refData = referencePoints[testName] || [];
      if (refData.length > 0) {
        const point = refData[typeof index === 'number' ? index : 0];
        const isDropdownField = point?.testDescription?.toUpperCase().includes('DROPDOWN') || 
                                point?.testDescription?.toUpperCase().includes('DROPDOWN WITH DESCRIPTION');
        
        if (!isDropdownField) {
          const result = AutoCalculation.calculate(testName, updated[testName], refData);
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

    if (selectedTest.category === 'RADIOLOGY') {
      setValidationErrors({});
      return true;
    }

    const testInputs = inputValues[selectedTest.name] || {};
    const referenceData = referencePoints[selectedTest.name] || [];

    referenceData.forEach((point, index) => {
      const descriptionUpper = (point.testDescription || '').toUpperCase();
      if (descriptionUpper === 'DETAILED REPORT') {
        return;
      }

      // Pass test name to isAutoCalculatedField
      if (AutoCalculation.isAutoCalculatedField(point.testDescription || '', selectedTest.name)) {
        return;
      }

      if (!testInputs[index] || testInputs[index].trim() === '') {
        errors[`${selectedTest.name}-${index}`] = true;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!currentLab?.id) {
        throw new Error('Lab ID is undefined');
      }

      // Prepare the report data
      const generatedReportData: ReportData[] = [];
      const missingReportIds: string[] = [];
      const refPoints = referencePoints[selectedTest.name] || [];
      const testInputs = inputValues[selectedTest.name] || {};

      if (selectedTest.category === 'RADIOLOGY') {
        const existingItem = existingReportData[0];
        if (!existingItem?.report_id) {
          toast.error('Report ID missing for radiology test. Cannot update.');
          return;
        }
        generatedReportData.push({
          report_id: existingItem.report_id,
          visit_id: editPatient.visitId.toString(),
          testName: selectedTest.name,
          testCategory: selectedTest.category,
          patientName: editPatient.patientname,
          referenceDescription: 'RADIOLOGY_TEST',
          referenceRange: 'N/A',
          enteredValue: 'Hard copy will be provided',
          referenceAgeRange: 'N/A',
          unit: 'N/A',
          description: 'Imaging test - Results provided separately',
        });
      } else {
        refPoints.forEach((point, index) => {
          const descriptionUpper = (point.testDescription || '').toUpperCase();
          if (descriptionUpper === 'DETAILED REPORT') {
            const existingItem = existingReportData.find(
              item => normalizeKey(item.referenceDescription) === normalizeKey(point.testDescription)
            );
            if (!existingItem?.report_id) {
              missingReportIds.push(point.testDescription || 'DETAILED REPORT');
              return;
            }
            generatedReportData.push({
              report_id: existingItem.report_id,
              visit_id: editPatient.visitId.toString(),
              testName: selectedTest.name,
              testCategory: selectedTest.category,
              patientName: editPatient.patientname,
              referenceDescription: point.testDescription || 'DETAILED REPORT',
              referenceRange: 'N/A',
              enteredValue: 'Hard copy will be provided',
              referenceAgeRange: 'N/A',
              unit: 'N/A',
              description: 'Imaging test - Results provided separately',
              reportJson: point.reportJson,
              referenceRanges: point.referenceRanges,
            });
            return;
          }

          if (testInputs[index] || (point.testDescription && point.testDescription !== "No reference available for this test")) {
            const descriptionKey = `${index}_description`;
            const hasDescription = testInputs[descriptionKey] && testInputs[descriptionKey].trim();
            const hasApiDropdown = hasValidDropdown(point.dropdown);
            const resolvedReferenceRange =
              point.minReferenceRange !== null && point.minReferenceRange !== undefined ||
              point.maxReferenceRange !== null && point.maxReferenceRange !== undefined
                ? `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`
                : "N/A";

            let finalValue = testInputs[index] || "N/A";
            let description = "N/A";
            let unit = "N/A";
            let referenceRange = "N/A";

            // Check if this is Random Urine Sugar test
            const isRandomUrineSugarTest = selectedTest.name?.toUpperCase().includes('RANDOM URINE SUGAR') || 
                                          selectedTest.name?.toUpperCase().includes('RUS');

            const isPercentageTest = isRandomUrineSugarTest && 
              (point.testDescription?.toUpperCase().includes('DROPDOWN-PERCENTAGE') || 
               point.testDescription?.toUpperCase().includes('PERCENTAGE'));

            if (
              descriptionUpper === "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE" ||
              descriptionUpper === "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT"
            ) {
              unit = point.units || "N/A";
              description = hasDescription ? testInputs[descriptionKey] : "N/A";
              finalValue = testInputs[index] || "N/A";
              referenceRange = resolvedReferenceRange;
            } else if (isPercentageTest) {
              // For Random Urine Sugar percentage test, append % to the value
              unit = " ";
              description = "N/A";
              finalValue = testInputs[index] ? `${testInputs[index]}%` : "N/A";
              referenceRange = resolvedReferenceRange;
            } else if (
              hasApiDropdown ||
              ["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
                "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"].includes(descriptionUpper)
            ) {
              unit = point.units || "N/A";
              description = "N/A";
              finalValue = testInputs[index] || "N/A";
              referenceRange = resolvedReferenceRange;
            } else if (descriptionUpper === "DESCRIPTION") {
              unit = "N/A";
              description = testInputs[index] || "N/A";
              finalValue = testInputs[index] || "N/A";
              referenceRange = "N/A";
            } else {
              unit = point.units || "N/A";
              description = "N/A";
              finalValue = testInputs[index] || "N/A";
              referenceRange = resolvedReferenceRange;
            }

            const existingItem = existingReportData.find(
              item => normalizeKey(item.referenceDescription) === normalizeKey(point.testDescription)
            );
            if (!existingItem?.report_id) {
              missingReportIds.push(point.testDescription || 'Unknown');
              return;
            }

            generatedReportData.push({
              report_id: existingItem.report_id,
              visit_id: editPatient.visitId.toString(),
              testName: selectedTest.name,
              testCategory: selectedTest.category,
              patientName: editPatient.patientname,
              referenceDescription: point.testDescription || "No reference description available",
              referenceRange: referenceRange,
              enteredValue: finalValue,
              referenceAgeRange: `${point.ageMin ?? "N/A"} ${point.minAgeUnit ?? "YEARS"} - ${point.ageMax ?? "N/A"} ${point.maxAgeUnit ?? "YEARS"}`,
              unit: unit,
              description: description,
              referenceRanges: point.referenceRanges,
              reportJson: point.reportJson,
            });
          }
        });
      }

      if (missingReportIds.length > 0) {
        toast.error('Some report items are missing IDs. Please refresh and try again.');
        return;
      }

      await updateReportById(currentLab.id, reportId.toString(), generatedReportData);
      refreshReports();
      setShowModal(false);
      toast.success('Report updated successfully');
    } catch (error) {
      toast.error('Failed to update report');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the reference data for the current test
  const currentTestRefs = referencePoints[selectedTest?.name] || [];
  const detailedReportPoint = currentTestRefs.find(point => point.testDescription === "DETAILED REPORT");
  const hasNonDetailedReportParams = currentTestRefs.some(point => point.testDescription !== "DETAILED REPORT");

  // If no reference data is available, show a message
  if (!loading && currentTestRefs.length === 0 && selectedTest) {
    return (
      <div className="p-6 text-center">
        <div className="bg-white rounded-xl p-6">
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-[300px]">
        <Loader type="progress" fullScreen={false} text="Loading report data..." />
        <p className="mt-4 text-sm text-gray-600">Fetching test and reference data...</p>
      </div>
    );
  }

  return (
    <div className="w-full">

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
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h6 font-semibold text-[#101828]">
            Edit Test Result Data
          </h1>
          <p className="mt-1 text-p3 font-medium text-[#99A1AF]">
            {editPatient.visitDate ? new Date(editPatient.visitDate).toLocaleDateString() : 'N/A'} • {selectedTest?.name || 'Test'}
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setShowModal(false)}
            className="flex items-center gap-2 rounded-full border border-pneutral-600 px-3 py-2 text-label-l3 font-medium text-pneutral-600 hover:bg-pneutral-50 transition-colors"
          >
            <TbChevronLeft className="h-4 w-4" />
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-label-l3 font-medium text-pneutral-50 ${
              isSubmitting ? 'bg-pneutral-400 cursor-not-allowed' : 'bg-secondary-700 hover:bg-secondary-800'
            } transition-colors`}
          >
            <TbReportMedical className="h-5 w-5" />
            {isSubmitting ? 'Saving...' : 'Save & Update'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px]">
        {/* Left Side - Test Table */}
        <div className="space-y-4">
          {/* Test Header Card */}
          <div className="rounded-xl border border-pneutral-200 bg-white px-4 py-3">
            <h3 className="text-label-l4 font-medium text-pneutral-900">
              {selectedTest?.name} — {selectedTest?.category || 'Test'}
            </h3>
          </div>

          {/* Test Table Card */}
          {hasNonDetailedReportParams && (
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

                    // Check if this is RANDOM URINE SUGAR test
                    const isRandomUrineSugar = selectedTest?.name?.toUpperCase().includes('RANDOM URINE SUGAR') ||
                                              selectedTest?.name?.toUpperCase().includes('RUS');

                    // For RANDOM URINE SUGAR with DROPDOWN-PERCENTAGE, use combobox with dropdown
                    const isPercentageTest = isRandomUrineSugar &&
                      (point.testDescription?.toUpperCase().includes('DROPDOWN-PERCENTAGE') ||
                       point.testDescription?.toUpperCase().includes('PERCENTAGE'));

                    // WIDAL test results are titre ratios (e.g. "1:80"), not plain numbers
                    const isWidalTest = selectedTest?.name?.toUpperCase().includes('WIDAL');

                    // Override isDropdown for percentage tests
                    const isDropdown = !isPercentageTest && (hasApiDropdown || 
                      ["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
                       "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"]
                      .includes(point.testDescription || ''));

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

                    // Check if this is a DESCRIPTION field
                    const isDescriptionField = point.testDescription === "DESCRIPTION";

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
                            <textarea
                              value={currentValue}
                              placeholder="Enter description"
                              onChange={(e) =>
                                handleInputChange(selectedTest?.name, index, e.target.value)
                              }
                              className="w-full min-w-[200px] rounded-lg border border-info-500 bg-white px-3 py-2 text-p3 outline-none transition focus:border-secondary-700 resize-y"
                              rows={4}
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
                          ) : isPercentageTest ? (
                            // For Random Urine Sugar: Use Combobox with inline % and dropdown
                            <PercentageCombobox
                              value={currentValue}
                              onChange={(value) =>
                                handleInputChange(selectedTest?.name, index, value)
                              }
                              placeholder=""
                            />
                          ) : isWidalTest ? (
                            // WIDAL titres are ratios like "1:80" — needs a text input so ":" can be typed
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={currentValue}
                                placeholder="e.g. 1:80"
                                onChange={(e) =>
                                  handleInputChange(selectedTest?.name, index, e.target.value)
                                }
                                className={`h-9 w-32 rounded-full border bg-white px-3 text-p3 outline-none transition ${getInputBorderColor(status)}`}
                                disabled={isAutoCalculated}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={currentValue}
                                placeholder="Enter value"
                                onChange={(e) =>
                                  handleInputChange(selectedTest?.name, index, e.target.value)
                                }
                                className={`h-9 w-32 rounded-full border bg-white px-3 text-p3 outline-none transition ${getInputBorderColor(status)}`}
                                disabled={isAutoCalculated}
                                step={getDynamicStep(currentValue)}
                                min={isAutoCalculated ? undefined : 0}
                              />
                            </div>
                          )}
                        </td>

                        {/* Hide Unit, Ref. Range, and Status columns for DESCRIPTION field */}
                        {isDescriptionField ? (
                          <>
                            <td className="px-4 py-3 text-p3 text-pneutral-900">-</td>
                            <td className="px-4 py-3 text-p3 text-sneutral-500">-</td>
                            <td className="px-4 py-3 text-p3 font-medium text-pneutral-400">-</td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-p3 text-pneutral-900">
                              {isDescription || isDropdown || isDropdownWithDescription ? '-' : (isPercentageTest ? '%' : (point.units || 'N/A'))}
                            </td>
                            <td className="px-4 py-3 text-p3 text-sneutral-500">
                              {isDescription || isDropdown || isDropdownWithDescription ? '-' : (
                                point.minReferenceRange !== null && point.maxReferenceRange !== null
                                  ? `${point.minReferenceRange} - ${point.maxReferenceRange}`
                                  : 'N/A'
                              )}
                            </td>
                            <td className={`px-4 py-3 text-p3 font-medium ${getStatusTextColor(status)}`}>
                              {isDescription || isDropdown || isDropdownWithDescription ? '-' : (getStatusLabel(status) || '-')}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* Detailed Report Editor (table-based report sections, e.g. Complete Urine Analysis) */}
          {detailedReportPoint && (
            <div className="rounded-xl border border-pneutral-200 bg-white p-4">
              <DetailedReportEditor
                point={detailedReportPoint}
                onReportJsonChange={(reportJson) => {
                  setReferencePoints(prev => ({
                    ...prev,
                    [selectedTest.name]: (prev[selectedTest.name] || []).map(p =>
                      p.testDescription === "DETAILED REPORT" ? { ...p, reportJson } : p
                    )
                  }));
                }}
              />
            </div>
          )}
        </div>

        {/* Right Sidebar - Patient Details */}
        <aside>
          <div className="rounded-2xl border border-white bg-white p-4">
            <h3 className="mb-4 text-p3 font-semibold text-pneutral-900">
              {editPatient.patientname || 'Patient Name'}
            </h3>

            <div className="space-y-3">
              <InfoRow
                label="Patient ID"
                value={`PAT-${String(editPatient.visitId).padStart(5, '0')}`}
              />
              <InfoRow
                label="Age / Gender"
                value={`${editPatient.dateOfBirth ? `${calculateAgeObject(editPatient.dateOfBirth).years} Yrs, ` : ''}${editPatient.gender || 'N/A'}`}
              />
              <InfoRow
                label="Doctor"
                value={editPatient.doctorName || 'N/A'}
              />
              <InfoRow 
                label="Visit Type" 
                value={editPatient.visitType || 'N/A'} 
              />
              <InfoRow
                label="Contact"
                value={editPatient.contactNumber || 'N/A'}
              />
              <InfoRow
                label="Tests Ordered"
                value={selectedTest?.name || 'N/A'}
              />
            </div>

            <div className="mt-4 rounded-xl border border-info-200 bg-info-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-p2 font-semibold text-pneutral-900">
                  Visit Information
                </h4>
                <span className="text-p2 text-pneutral-500">
                  {editPatient.visitDate ? new Date(editPatient.visitDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <InfoRow
                label="Status"
                value={editPatient.visitStatus?.replace('_', ' ') || 'Completed'}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PatientReportDataEdit;


















// code dated 29.07.2026......without column{:} in data field..........

// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { getReportDataById, updateReportById } from '@/../services/reportServices';
// import { getTestReferanceRangeByTestName } from '@/../services/testService';
// import Loader from '@/app/(admin)/component/common/Loader';
// import { useLabs } from '@/context/LabContext';
// // import { PatientData } from '@/types/sample/sample';
// import { TestList, TestReferancePoint } from '@/types/test/testlist';
// import { calculateAgeObject } from '@/utils/ageUtils';
// import { hasValidDropdown, parseDropdownField, DropdownItem } from '@/utils/dropdownParser';
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import { TbReportMedical, TbChevronLeft,} from "react-icons/tb";
// import { toast } from 'react-toastify';
// import AutoCalculation from './AutoCalculation';
// import DetailedReportEditor from './DetailedReportEditor';
// import NewModal from "../../../newcommoncomponent/NewModal";
// import { FaChevronDown } from "react-icons/fa";
// import { createPortal } from "react-dom";

// export interface Patient {
//   visitId: number;
//   patientname: string;
//   gender?: string;
//   contactNumber?: string;
//   email?: string;
//   visitDate: string;
//   visitStatus: string;
//   sampleNames: string[];
//   testIds?: number[];
//   packageIds: number[];
//   dateOfBirth?: string;
//   doctorName?: string;
//   visitType?: string;
// }

// interface ReportData {
//   report_id?: string;
//   visit_id: string;
//   testName: string;
//   testCategory: string;
//   patientName: string;
//   referenceDescription: string;
//   referenceRange: string;
//   referenceAgeRange: string;
//   enteredValue: string;
//   unit: string;
//   description?: string;
//   referenceRanges?: string;
//   reportJson?: string;
// }

// interface PatientReportDataEditProps {
//   editPatient: Patient;
//   selectedTest: TestList;
//   reportId: number;
//   setShowModal: (value: React.SetStateAction<boolean>) => void;
//   refreshReports: () => void;
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

// // Get dynamic step for number input
// const getDynamicStep = (value: string) => {
//   if (!value || !value.includes(".")) {
//     return 1;
//   }

//   const decimalPart = value.split(".")[1];

//   return Math.pow(10, -decimalPart.length);
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

// // Combobox Component for Percentage Input with Dropdown
// // Combobox Component for Percentage Input with Dropdown
// const PercentageCombobox = ({
//   value,
//   onChange,
//   placeholder = "",
//   disabled = false,
//   className = ""
// }: {
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
//   disabled?: boolean;
//   className?: string;
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [inputValue, setInputValue] = useState(value);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [dropdownStyle, setDropdownStyle] = useState({
//     top: 0,
//     left: 0,
//     width: 0,
//   });
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   // Generate percentage options from 0% to 100% in increments of 10
//   const percentageOptions = Array.from({ length: 11 }, (_, i) => ({
//     label: `${i * 10}%`,
//     value: String(i * 10)
//   }));

//   // Update input value when prop changes - FIXED: Now properly updates when value prop changes
//   useEffect(() => {
//     setInputValue(value);
//   }, [value]);

//   // Update dropdown position when open
//   useEffect(() => {
//     if (isOpen && containerRef.current) {
//       const rect = containerRef.current.getBoundingClientRect();
//       setDropdownStyle({
//         top: rect.bottom + window.scrollY + 4,
//         left: rect.left + window.scrollX,
//         width: Math.max(rect.width, 120),
//       });
//     }
//   }, [isOpen]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as Node;

//       if (
//         containerRef.current?.contains(target) ||
//         dropdownRef.current?.contains(target)
//       ) {
//         return;
//       }

//       setIsOpen(false);
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     return () =>
//       document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value;
//     setInputValue(newValue);
//     onChange(newValue);
//   };

//   const handleOptionSelect = (selectedValue: string) => {
//     setInputValue(selectedValue);
//     onChange(selectedValue);
//     setIsOpen(false);
//   };

//   const handleInputFocus = () => {
//     setIsOpen(true);
//   };

//   const toggleDropdown = () => {
//     const newState = !isOpen;
//     setIsOpen(newState);
//   };

//   return (
//     <div ref={containerRef} className="relative inline-block">
//       <div className="relative">
//         <input
//           type="number"
//           value={inputValue}
//           placeholder={placeholder}
//           onChange={handleInputChange}
//           onFocus={handleInputFocus}
//           disabled={disabled}
//           className={`h-9 w-32 rounded-full border border-info-500 bg-white pl-3 pr-3 text-p3 outline-none transition focus:border-secondary-700 disabled:opacity-60 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className}`}
//           step={getDynamicStep(inputValue)}
//           min="0"
//           max="100"
//         />
//         {/* % symbol positioned to the right of the input but before the spinner buttons */}
//         <span className="absolute right-8 top-1/2 -translate-y-1/2 text-p3 text-pneutral-600 pointer-events-none select-none">
//           %
//         </span>
//         {/* Dropdown toggle button */}
//         <button
//           type="button"
//           onClick={toggleDropdown}
//           disabled={disabled}
//           className="absolute right-2 top-1/2 -translate-y-1/2 text-pneutral-400 hover:text-pneutral-600 focus:outline-none p-1"
//         >
//           <FaChevronDown size={12} />
//         </button>
//       </div>

//       {/* Dropdown rendered via portal */}
//       {isOpen && !disabled && createPortal(
//         <div
//           ref={dropdownRef}
//           style={{
//             position: "absolute",
//             top: dropdownStyle.top,
//             left: dropdownStyle.left,
//             width: dropdownStyle.width,
//             zIndex: 999999,
//           }}
//           className="max-h-52 overflow-y-auto rounded-lg border border-pneutral-200 bg-white shadow-xl"
//         >
//           <div className="py-1">
//             {percentageOptions.map((option) => (
//               <button
//                 key={option.value}
//                 type="button"
//                 onClick={() => handleOptionSelect(option.value)}
//                 className={`w-full px-4 py-2 text-left text-p3 hover:bg-info-50 transition-colors ${
//                   inputValue === option.value
//                     ? "bg-info-100 text-secondary-700"
//                     : "text-pneutral-900"
//                 }`}
//               >
//                 {option.label}
//               </button>
//             ))}
//           </div>
//         </div>,
//         document.body
//       )}
//     </div>
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

// const normalizeKey = (value?: string) => (value || '').trim().toUpperCase();

// const PatientReportDataEdit: React.FC<PatientReportDataEditProps> = ({
//   editPatient,
//   selectedTest,
//   reportId,
//   setShowModal,
//   refreshReports,
// }) => {
//   const { currentLab } = useLabs();
//   const [loading, setLoading] = useState(false);
//   const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
//   const [inputValues, setInputValues] = useState<Record<string, Record<string | number, string>>>({});
//   const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
//   const [existingReportData, setExistingReportData] = useState<ReportData[]>([]);
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

//   // const patientForInfo: PatientData = useMemo(() => ({
//   //   ...(editPatient as PatientData),
//   //   gender: editPatient.gender ?? '',
//   //   contactNumber: editPatient.contactNumber ?? '',
//   //   email: editPatient.email ?? '',
//   // }), [editPatient]);

//   const filterReferenceData = useCallback((referenceData: Record<string, TestReferancePoint[]>) => {
//     const filteredData: Record<string, TestReferancePoint[]> = {};

//     Object.keys(referenceData).forEach((testName) => {
//       const testPoints = referenceData[testName];

//       const genderFilteredPoints = testPoints.filter((point) => {
//         const pointGender = point.gender?.toUpperCase() || '';
//         const patientGender = editPatient.gender?.toUpperCase() || '';

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

//       const ageObj = editPatient.dateOfBirth ? calculateAgeObject(editPatient.dateOfBirth) : { years: 0, months: 0, days: 0 };
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
//         }
//         return patientAgeMonths >= minMonths && patientAgeMonths < maxMonths;
//       });

//       filteredData[testName] = ageFilteredPoints.length > 0 ? ageFilteredPoints : genderFilteredPoints;
//     });

//     return filteredData;
//   }, [editPatient.dateOfBirth, editPatient.gender]);

//   const fetchReferenceData = useCallback(async () => {
//     if (!selectedTest || !currentLab) return;

//     setLoading(true);
//     try {
//       const existingReport = await getReportDataById(currentLab.id.toString(), reportId.toString());
//       const reportItems: any[] = (Array.isArray(existingReport) ? existingReport : [existingReport]) as any[];
      
//       const mappedReportData: ReportData[] = reportItems
//         .flatMap((item) => {
//           const reportIdValue = item.reportId ?? item.reportid ?? item.report_id;
//           const baseItem = {
//             report_id: reportIdValue !== undefined && reportIdValue !== null ? String(reportIdValue) : '',
//             visit_id: item.visit_id ?? item.visitId?.toString() ?? editPatient.visitId.toString(),
//             testName: item.testName ?? selectedTest.name,
//             testCategory: item.testCategory ?? '',
//             patientName: item.patientName ?? editPatient.patientname,
//             referenceAgeRange: item.referenceAgeRange ?? '',
//             reportJson: item.reportJson,
//             referenceRanges: item.referenceRanges,
//           };

//           const rows = Array.isArray(item.testRows) ? item.testRows : [];
//           if (rows.length === 0) {
//             return [{
//               ...baseItem,
//               referenceDescription: item.referenceDescription ?? '',
//               referenceRange: item.referenceRange ?? '',
//               enteredValue: item.enteredValue ?? '',
//               unit: item.unit ?? '',
//               description: item.description,
//             }];
//           }

//           return rows.map((row: any) => ({
//             ...baseItem,
//             referenceDescription: row.testParameter ?? row.referenceDescription ?? '',
//             referenceRange: row.normalRange ?? row.referenceRange ?? '',
//             enteredValue: row.enteredValue ?? '',
//             unit: row.unit ?? '',
//             description: row.description,
//           }));
//         })
//         .filter(item => normalizeKey(item.testName) === normalizeKey(selectedTest.name));

//       setExistingReportData(mappedReportData);

//       const response = await getTestReferanceRangeByTestName(currentLab.id.toString(), selectedTest.name);
//       const refPointsRaw = Array.isArray(response) ? response : [response];
//       const filteredData = filterReferenceData({ [selectedTest.name]: refPointsRaw });
//       if ((filteredData[selectedTest.name] || []).length === 0) {
//         filteredData[selectedTest.name] = refPointsRaw;
//       }

//       const detailedPointIndex = filteredData[selectedTest.name]?.findIndex(
//         point => (point.testDescription || '').toUpperCase() === 'DETAILED REPORT'
//       );
//       const existingDetailed = mappedReportData.find(item => (item.referenceDescription || '').toUpperCase() === 'DETAILED REPORT');
//       if (detailedPointIndex !== undefined && detailedPointIndex >= 0 && existingDetailed?.reportJson) {
//         const nextPoints = [...(filteredData[selectedTest.name] || [])];
//         nextPoints[detailedPointIndex] = { ...nextPoints[detailedPointIndex], reportJson: existingDetailed.reportJson };
//         filteredData[selectedTest.name] = nextPoints;
//       }

//       setReferencePoints(filteredData);

//       const initialInputValues: Record<string, Record<string | number, string>> = {};
//       const refPoints = filteredData[selectedTest.name] || [];

//       // In the fetchReferenceData function, when setting initial input values:
// mappedReportData.forEach((reportItem) => {
//   const reportKey = normalizeKey(reportItem.referenceDescription);
//   const pointIndex = refPoints.findIndex(
//     point => normalizeKey(point.testDescription) === reportKey
//   );

//   if (pointIndex >= 0) {
//     if (!initialInputValues[selectedTest.name]) {
//       initialInputValues[selectedTest.name] = {};
//     }

//     const descriptionKey = `${pointIndex}_description`;
//     const descriptionUpper = normalizeKey(refPoints[pointIndex]?.testDescription);
    
//     // Check if this is a percentage test
//     const isRandomUrineSugar = selectedTest.name?.toUpperCase().includes('RANDOM URINE SUGAR') || 
//                               selectedTest.name?.toUpperCase().includes('RUS');
//     const isPercentageTest = isRandomUrineSugar && 
//       (refPoints[pointIndex]?.testDescription?.toUpperCase().includes('DROPDOWN-PERCENTAGE') || 
//        refPoints[pointIndex]?.testDescription?.toUpperCase().includes('PERCENTAGE'));

//     if (descriptionUpper === 'DESCRIPTION') {
//       initialInputValues[selectedTest.name][pointIndex] = reportItem.description || reportItem.enteredValue || '';
//     } else if (
//       descriptionUpper === 'DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE' ||
//       descriptionUpper === 'DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT'
//     ) {
//       initialInputValues[selectedTest.name][pointIndex] = reportItem.enteredValue || '';
//       if (reportItem.description) {
//         initialInputValues[selectedTest.name][descriptionKey] = reportItem.description;
//       }
//     } else if (isPercentageTest) {
//       // For percentage tests, extract just the number without the % symbol
//       const enteredValue = reportItem.enteredValue || '';
//       // Remove % symbol if present
//       const numericValue = enteredValue.replace('%', '').trim();
//       initialInputValues[selectedTest.name][pointIndex] = numericValue || '';
//     } else {
//       initialInputValues[selectedTest.name][pointIndex] = reportItem.enteredValue || '';
//     }
//   }
// });

//       // mappedReportData.forEach((reportItem) => {
//       //   const reportKey = normalizeKey(reportItem.referenceDescription);
//       //   const pointIndex = refPoints.findIndex(
//       //     point => normalizeKey(point.testDescription) === reportKey
//       //   );

//       //   if (pointIndex >= 0) {
//       //     if (!initialInputValues[selectedTest.name]) {
//       //       initialInputValues[selectedTest.name] = {};
//       //     }

//       //     const descriptionKey = `${pointIndex}_description`;
//       //     const descriptionUpper = normalizeKey(refPoints[pointIndex]?.testDescription);
//       //     if (descriptionUpper === 'DESCRIPTION') {
//       //       initialInputValues[selectedTest.name][pointIndex] = reportItem.description || reportItem.enteredValue || '';
//       //     } else if (
//       //       descriptionUpper === 'DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE' ||
//       //       descriptionUpper === 'DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT'
//       //     ) {
//       //       initialInputValues[selectedTest.name][pointIndex] = reportItem.enteredValue || '';
//       //       if (reportItem.description) {
//       //         initialInputValues[selectedTest.name][descriptionKey] = reportItem.description;
//       //       }
//       //     } else {
//       //       initialInputValues[selectedTest.name][pointIndex] = reportItem.enteredValue || '';
//       //     }
//       //   }
//       // });

//       setInputValues(initialInputValues);
//       setValidationErrors({});
//     } catch (error) {
//       toast.error('Failed to load test and report data');
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedTest, currentLab, editPatient, filterReferenceData]);

//   useEffect(() => {
//     fetchReferenceData();
//   }, [fetchReferenceData]);

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
      
//       // Pass testName to isAutoCalculatedField
//       if (point && !AutoCalculation.isAutoCalculatedField(point.testDescription || '', testName)) {
//         toast.error('Negative values are not allowed');
//         return;
//       }
//     }

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
//         const point = refData[typeof index === 'number' ? index : 0];
//         const isDropdownField = point?.testDescription?.toUpperCase().includes('DROPDOWN') || 
//                                 point?.testDescription?.toUpperCase().includes('DROPDOWN WITH DESCRIPTION');
        
//         if (!isDropdownField) {
//           const result = AutoCalculation.calculate(testName, updated[testName], refData);
//           updated[testName] = result.updatedInputs;
          
//           if (result.differentialValidation) {
//             setDifferentialValidation(result.differentialValidation);
//           }
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

//     if (selectedTest.category === 'RADIOLOGY') {
//       setValidationErrors({});
//       return true;
//     }

//     const testInputs = inputValues[selectedTest.name] || {};
//     const referenceData = referencePoints[selectedTest.name] || [];

//     referenceData.forEach((point, index) => {
//       const descriptionUpper = (point.testDescription || '').toUpperCase();
//       if (descriptionUpper === 'DETAILED REPORT') {
//         return;
//       }

//       // Pass test name to isAutoCalculatedField
//       if (AutoCalculation.isAutoCalculatedField(point.testDescription || '', selectedTest.name)) {
//         return;
//       }

//       if (!testInputs[index] || testInputs[index].trim() === '') {
//         errors[`${selectedTest.name}-${index}`] = true;
//         isValid = false;
//       }
//     });

//     setValidationErrors(errors);
//     return isValid;
//   };

//   const handleUpdate = async () => {
//     if (!validateForm()) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       if (!currentLab?.id) {
//         throw new Error('Lab ID is undefined');
//       }

//       // Prepare the report data
//       const generatedReportData: ReportData[] = [];
//       const missingReportIds: string[] = [];
//       const refPoints = referencePoints[selectedTest.name] || [];
//       const testInputs = inputValues[selectedTest.name] || {};

//       if (selectedTest.category === 'RADIOLOGY') {
//         const existingItem = existingReportData[0];
//         if (!existingItem?.report_id) {
//           toast.error('Report ID missing for radiology test. Cannot update.');
//           return;
//         }
//         generatedReportData.push({
//           report_id: existingItem.report_id,
//           visit_id: editPatient.visitId.toString(),
//           testName: selectedTest.name,
//           testCategory: selectedTest.category,
//           patientName: editPatient.patientname,
//           referenceDescription: 'RADIOLOGY_TEST',
//           referenceRange: 'N/A',
//           enteredValue: 'Hard copy will be provided',
//           referenceAgeRange: 'N/A',
//           unit: 'N/A',
//           description: 'Imaging test - Results provided separately',
//         });
//       } else {
//         refPoints.forEach((point, index) => {
//           const descriptionUpper = (point.testDescription || '').toUpperCase();
//           if (descriptionUpper === 'DETAILED REPORT') {
//             const existingItem = existingReportData.find(
//               item => normalizeKey(item.referenceDescription) === normalizeKey(point.testDescription)
//             );
//             if (!existingItem?.report_id) {
//               missingReportIds.push(point.testDescription || 'DETAILED REPORT');
//               return;
//             }
//             generatedReportData.push({
//               report_id: existingItem.report_id,
//               visit_id: editPatient.visitId.toString(),
//               testName: selectedTest.name,
//               testCategory: selectedTest.category,
//               patientName: editPatient.patientname,
//               referenceDescription: point.testDescription || 'DETAILED REPORT',
//               referenceRange: 'N/A',
//               enteredValue: 'Hard copy will be provided',
//               referenceAgeRange: 'N/A',
//               unit: 'N/A',
//               description: 'Imaging test - Results provided separately',
//               reportJson: point.reportJson,
//               referenceRanges: point.referenceRanges,
//             });
//             return;
//           }

//           if (testInputs[index] || (point.testDescription && point.testDescription !== "No reference available for this test")) {
//             const descriptionKey = `${index}_description`;
//             const hasDescription = testInputs[descriptionKey] && testInputs[descriptionKey].trim();
//             const hasApiDropdown = hasValidDropdown(point.dropdown);
//             const resolvedReferenceRange =
//               point.minReferenceRange !== null && point.minReferenceRange !== undefined ||
//               point.maxReferenceRange !== null && point.maxReferenceRange !== undefined
//                 ? `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`
//                 : "N/A";

//             let finalValue = testInputs[index] || "N/A";
//             let description = "N/A";
//             let unit = "N/A";
//             let referenceRange = "N/A";

//             // Check if this is Random Urine Sugar test
//             const isRandomUrineSugarTest = selectedTest.name?.toUpperCase().includes('RANDOM URINE SUGAR') || 
//                                           selectedTest.name?.toUpperCase().includes('RUS');

//             const isPercentageTest = isRandomUrineSugarTest && 
//               (point.testDescription?.toUpperCase().includes('DROPDOWN-PERCENTAGE') || 
//                point.testDescription?.toUpperCase().includes('PERCENTAGE'));

//             if (
//               descriptionUpper === "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE" ||
//               descriptionUpper === "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT"
//             ) {
//               unit = point.units || "N/A";
//               description = hasDescription ? testInputs[descriptionKey] : "N/A";
//               finalValue = testInputs[index] || "N/A";
//               referenceRange = resolvedReferenceRange;
//             } else if (isPercentageTest) {
//               // For Random Urine Sugar percentage test, append % to the value
//               unit = " ";
//               description = "N/A";
//               finalValue = testInputs[index] ? `${testInputs[index]}%` : "N/A";
//               referenceRange = resolvedReferenceRange;
//             } else if (
//               hasApiDropdown ||
//               ["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
//                 "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"].includes(descriptionUpper)
//             ) {
//               unit = point.units || "N/A";
//               description = "N/A";
//               finalValue = testInputs[index] || "N/A";
//               referenceRange = resolvedReferenceRange;
//             } else if (descriptionUpper === "DESCRIPTION") {
//               unit = "N/A";
//               description = testInputs[index] || "N/A";
//               finalValue = testInputs[index] || "N/A";
//               referenceRange = "N/A";
//             } else {
//               unit = point.units || "N/A";
//               description = "N/A";
//               finalValue = testInputs[index] || "N/A";
//               referenceRange = resolvedReferenceRange;
//             }

//             const existingItem = existingReportData.find(
//               item => normalizeKey(item.referenceDescription) === normalizeKey(point.testDescription)
//             );
//             if (!existingItem?.report_id) {
//               missingReportIds.push(point.testDescription || 'Unknown');
//               return;
//             }

//             generatedReportData.push({
//               report_id: existingItem.report_id,
//               visit_id: editPatient.visitId.toString(),
//               testName: selectedTest.name,
//               testCategory: selectedTest.category,
//               patientName: editPatient.patientname,
//               referenceDescription: point.testDescription || "No reference description available",
//               referenceRange: referenceRange,
//               enteredValue: finalValue,
//               referenceAgeRange: `${point.ageMin ?? "N/A"} ${point.minAgeUnit ?? "YEARS"} - ${point.ageMax ?? "N/A"} ${point.maxAgeUnit ?? "YEARS"}`,
//               unit: unit,
//               description: description,
//               referenceRanges: point.referenceRanges,
//               reportJson: point.reportJson,
//             });
//           }
//         });
//       }

//       if (missingReportIds.length > 0) {
//         toast.error('Some report items are missing IDs. Please refresh and try again.');
//         return;
//       }

//       await updateReportById(currentLab.id, reportId.toString(), generatedReportData);
//       refreshReports();
//       setShowModal(false);
//       toast.success('Report updated successfully');
//     } catch (error) {
//       toast.error('Failed to update report');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Get the reference data for the current test
//   const currentTestRefs = referencePoints[selectedTest?.name] || [];
//   const detailedReportPoint = currentTestRefs.find(point => point.testDescription === "DETAILED REPORT");
//   const hasNonDetailedReportParams = currentTestRefs.some(point => point.testDescription !== "DETAILED REPORT");

//   // If no reference data is available, show a message
//   if (!loading && currentTestRefs.length === 0 && selectedTest) {
//     return (
//       <div className="p-6 text-center">
//         <div className="bg-white rounded-xl p-6">
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

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center p-6 min-h-[300px]">
//         <Loader type="progress" fullScreen={false} text="Loading report data..." />
//         <p className="mt-4 text-sm text-gray-600">Fetching test and reference data...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full">
//       {/* Differential Count Validation Alert - Only for CBC */}
//       {/* {differentialValidation && (
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
//       )} */}

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
//       <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-h6 font-semibold text-[#101828]">
//             Edit Test Result Data
//           </h1>
//           <p className="mt-1 text-p3 font-medium text-[#99A1AF]">
//             {editPatient.visitDate ? new Date(editPatient.visitDate).toLocaleDateString() : 'N/A'} • {selectedTest?.name || 'Test'}
//           </p>
//         </div>

//         <div className="flex gap-3">
//           <button 
//             onClick={() => setShowModal(false)}
//             className="flex items-center gap-2 rounded-full border border-pneutral-600 px-3 py-2 text-label-l3 font-medium text-pneutral-600 hover:bg-pneutral-50 transition-colors"
//           >
//             <TbChevronLeft className="h-4 w-4" />
//             Cancel
//           </button>

//           <button
//             onClick={handleUpdate}
//             disabled={isSubmitting}
//             className={`flex items-center gap-2 rounded-full px-3 py-2 text-label-l3 font-medium text-pneutral-50 ${
//               isSubmitting ? 'bg-pneutral-400 cursor-not-allowed' : 'bg-secondary-700 hover:bg-secondary-800'
//             } transition-colors`}
//           >
//             <TbReportMedical className="h-5 w-5" />
//             {isSubmitting ? 'Saving...' : 'Save & Update'}
//           </button>
//         </div>
//       </div>

//       <div className="grid gap-4 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px]">
//         {/* Left Side - Test Table */}
//         <div className="space-y-4">
//           {/* Test Header Card */}
//           <div className="rounded-xl border border-pneutral-200 bg-white px-4 py-3">
//             <h3 className="text-label-l4 font-medium text-pneutral-900">
//               {selectedTest?.name} — {selectedTest?.category || 'Test'}
//             </h3>
//           </div>

//           {/* Test Table Card */}
//           {hasNonDetailedReportParams && (
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

//                     // Check if this is RANDOM URINE SUGAR test
//                     const isRandomUrineSugar = selectedTest?.name?.toUpperCase().includes('RANDOM URINE SUGAR') || 
//                                               selectedTest?.name?.toUpperCase().includes('RUS');

//                     // For RANDOM URINE SUGAR with DROPDOWN-PERCENTAGE, use combobox with dropdown
//                     const isPercentageTest = isRandomUrineSugar && 
//                       (point.testDescription?.toUpperCase().includes('DROPDOWN-PERCENTAGE') || 
//                        point.testDescription?.toUpperCase().includes('PERCENTAGE'));

//                     // Override isDropdown for percentage tests
//                     const isDropdown = !isPercentageTest && (hasApiDropdown || 
//                       ["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
//                        "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"]
//                       .includes(point.testDescription || ''));

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

//                     const isAutoCalculated = AutoCalculation.isAutoCalculatedField(
//                       point.testDescription || '', 
//                       selectedTest?.name || ''
//                     );

//                     // Check if this is a DESCRIPTION field
//                     const isDescriptionField = point.testDescription === "DESCRIPTION";

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
//                             <textarea
//                               value={currentValue}
//                               placeholder="Enter description"
//                               onChange={(e) =>
//                                 handleInputChange(selectedTest?.name, index, e.target.value)
//                               }
//                               className="w-full min-w-[200px] rounded-lg border border-info-500 bg-white px-3 py-2 text-p3 outline-none transition focus:border-secondary-700 resize-y"
//                               rows={4}
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
//                           ) : isPercentageTest ? (
//                             // For Random Urine Sugar: Use Combobox with inline % and dropdown
//                             <PercentageCombobox
//                               value={currentValue}
//                               onChange={(value) =>
//                                 handleInputChange(selectedTest?.name, index, value)
//                               }
//                               placeholder=""
//                             />
//                           ) : (
//                             <div className="flex items-center gap-2">
//                               <input
//                                 type="number"
//                                 value={currentValue}
//                                 placeholder="Enter value"
//                                 onChange={(e) =>
//                                   handleInputChange(selectedTest?.name, index, e.target.value)
//                                 }
//                                 className={`h-9 w-32 rounded-full border bg-white px-3 text-p3 outline-none transition ${getInputBorderColor(status)}`}
//                                 disabled={isAutoCalculated}
//                                 step={getDynamicStep(currentValue)}
//                                 min={isAutoCalculated ? undefined : 0}
//                               />
//                             </div>
//                           )}
//                         </td>

//                         {/* Hide Unit, Ref. Range, and Status columns for DESCRIPTION field */}
//                         {isDescriptionField ? (
//                           <>
//                             <td className="px-4 py-3 text-p3 text-pneutral-900">-</td>
//                             <td className="px-4 py-3 text-p3 text-sneutral-500">-</td>
//                             <td className="px-4 py-3 text-p3 font-medium text-pneutral-400">-</td>
//                           </>
//                         ) : (
//                           <>
//                             <td className="px-4 py-3 text-p3 text-pneutral-900">
//                               {isDescription || isDropdown || isDropdownWithDescription ? '-' : (isPercentageTest ? '%' : (point.units || 'N/A'))}
//                             </td>
//                             <td className="px-4 py-3 text-p3 text-sneutral-500">
//                               {isDescription || isDropdown || isDropdownWithDescription ? '-' : (
//                                 point.minReferenceRange !== null && point.maxReferenceRange !== null
//                                   ? `${point.minReferenceRange} - ${point.maxReferenceRange}`
//                                   : 'N/A'
//                               )}
//                             </td>
//                             <td className={`px-4 py-3 text-p3 font-medium ${getStatusTextColor(status)}`}>
//                               {isDescription || isDropdown || isDropdownWithDescription ? '-' : (getStatusLabel(status) || '-')}
//                             </td>
//                           </>
//                         )}
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//           )}

//           {/* Detailed Report Editor (table-based report sections, e.g. Complete Urine Analysis) */}
//           {detailedReportPoint && (
//             <div className="rounded-xl border border-pneutral-200 bg-white p-4">
//               <DetailedReportEditor
//                 point={detailedReportPoint}
//                 onReportJsonChange={(reportJson) => {
//                   setReferencePoints(prev => ({
//                     ...prev,
//                     [selectedTest.name]: (prev[selectedTest.name] || []).map(p =>
//                       p.testDescription === "DETAILED REPORT" ? { ...p, reportJson } : p
//                     )
//                   }));
//                 }}
//               />
//             </div>
//           )}
//         </div>

//         {/* Right Sidebar - Patient Details */}
//         <aside>
//           <div className="rounded-2xl border border-white bg-white p-4">
//             <h3 className="mb-4 text-p3 font-semibold text-pneutral-900">
//               {editPatient.patientname || 'Patient Name'}
//             </h3>

//             <div className="space-y-3">
//               <InfoRow
//                 label="Patient ID"
//                 value={`PAT-${String(editPatient.visitId).padStart(5, '0')}`}
//               />
//               <InfoRow
//                 label="Age / Gender"
//                 value={`${editPatient.dateOfBirth ? `${calculateAgeObject(editPatient.dateOfBirth).years} Yrs, ` : ''}${editPatient.gender || 'N/A'}`}
//               />
//               <InfoRow
//                 label="Doctor"
//                 value={editPatient.doctorName || 'N/A'}
//               />
//               <InfoRow 
//                 label="Visit Type" 
//                 value={editPatient.visitType || 'N/A'} 
//               />
//               <InfoRow
//                 label="Contact"
//                 value={editPatient.contactNumber || 'N/A'}
//               />
//               <InfoRow
//                 label="Tests Ordered"
//                 value={selectedTest?.name || 'N/A'}
//               />
//             </div>

//             <div className="mt-4 rounded-xl border border-info-200 bg-info-50 p-4">
//               <div className="mb-3 flex items-center justify-between">
//                 <h4 className="text-p2 font-semibold text-pneutral-900">
//                   Visit Information
//                 </h4>
//                 <span className="text-p2 text-pneutral-500">
//                   {editPatient.visitDate ? new Date(editPatient.visitDate).toLocaleDateString() : 'N/A'}
//                 </span>
//               </div>

//               <InfoRow
//                 label="Status"
//                 value={editPatient.visitStatus?.replace('_', ' ') || 'Completed'}
//               />
//             </div>
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// };

// export default PatientReportDataEdit;






















// code written by abhishek ,.............. do not change this code.....................

// import { getReportDataById, updateReportById } from '@/../services/reportServices';
// import { getTestReferanceRangeByTestName } from '@/../services/testService';
// import Loader from '@/app/(admin)/component/common/Loader';
// import ConfirmationDialog from '@/app/(admin)/component/common/ConfirmationDialog';
// import { useLabs } from '@/context/LabContext';
// import { PatientData } from '@/types/sample/sample';
// import { TestList, TestReferancePoint } from '@/types/test/testlist';
// import { calculateAgeObject } from '@/utils/ageUtils';
// import { hasValidDropdown } from '@/utils/dropdownParser';
// import { formatMedicalReportToHTML } from '@/utils/reportFormatter';
// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import { TbInfoCircle, TbReportMedical, TbArrowDownCircle, TbArrowUpCircle, TbSquareRoundedCheck } from "react-icons/tb";
// import { toast } from 'react-toastify';
// import PatientBasicInfo from './PatientBasicInfo';
// import TestComponentFactory from './TestSpecificComponents/TestComponentFactory';
// import DetailedReportEditor from './DetailedReportEditor';

// export interface Patient {
//   visitId: number;
//   patientname: string;
//   gender?: string;
//   contactNumber?: string;
//   email?: string;
//   visitDate: string;
//   visitStatus: string;
//   sampleNames: string[];
//   testIds?: number[];
//   packageIds: number[];
//   dateOfBirth?: string;
// }

// interface ReportData {
//   report_id?: string;
//   visit_id: string;
//   testName: string;
//   testCategory: string;
//   patientName: string;
//   referenceDescription: string;
//   referenceRange: string;
//   referenceAgeRange: string;
//   enteredValue: string;
//   unit: string;
//   description?: string;
//   referenceRanges?: string;
//   reportJson?: string;
// }

// interface ReportRow {
//   testParameter?: string;
//   referenceDescription?: string;
//   normalRange?: string;
//   referenceRange?: string;
//   enteredValue?: string;
//   unit?: string;
//   description?: string;
// }

// interface ReportApiItem {
//   reportId?: number | string;
//   reportid?: number | string;
//   report_id?: string;
//   visit_id?: string;
//   visitId?: number;
//   testName?: string;
//   testCategory?: string;
//   patientName?: string;
//   referenceDescription?: string;
//   referenceRange?: string;
//   referenceAgeRange?: string;
//   enteredValue?: string;
//   unit?: string;
//   description?: string;
//   reportJson?: string;
//   referenceRanges?: string;
//   testRows?: ReportRow[];
// }

// interface StructuredReportSection {
//   title?: string;
//   content?: string;
//   order?: number;
// }

// interface StructuredReport {
//   title?: string;
//   description?: string;
//   sections?: StructuredReportSection[] | Record<string, unknown>;
//   impression?: string[];
// }

// interface PatientReportDataEditProps {
//   editPatient: Patient;
//   selectedTest: TestList;
//   reportId: number;
//   setShowModal: (value: React.SetStateAction<boolean>) => void;
//   refreshReports: () => void;
// }

// const normalizeKey = (value?: string) => (value || '').trim().toUpperCase();

// const escapeHtmlWithBreaks = (text: string) =>
//   text
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/ /g, '&nbsp;')
//     .replace(/\r?\n/g, '<br/>');

// const isPlainObject = (value: unknown): value is Record<string, unknown> =>
//   typeof value === 'object' && value !== null && !Array.isArray(value);

// const PatientReportDataEdit: React.FC<PatientReportDataEditProps> = ({
//   editPatient,
//   selectedTest,
//   reportId,
//   setShowModal,
//   refreshReports,
// }) => {
//   const { currentLab } = useLabs();
//   const [loading, setLoading] = useState(false);
//   const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
//   const [inputValues, setInputValues] = useState<Record<string, Record<string | number, string>>>({});
//   const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
//   const [existingReportData, setExistingReportData] = useState<ReportData[]>([]);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [reportPreview, setReportPreview] = useState<ReportData[]>([]);
//   const [hasMissingDescriptions, setHasMissingDescriptions] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const patientForInfo: PatientData = useMemo(() => ({
//     ...(editPatient as PatientData),
//     gender: editPatient.gender ?? '',
//     contactNumber: editPatient.contactNumber ?? '',
//     email: editPatient.email ?? '',
//   }), [editPatient]);

//   const getValueStatus = (value: string, minRef: number | null, maxRef: number | null) => {
//     if (!value || isNaN(Number(value))) return 'no-reference';
//     const numValue = parseFloat(value);

//     if (minRef === null || maxRef === null) return 'no-reference';
//     if (numValue < minRef) return 'below';
//     if (numValue > maxRef) return 'above';
//     return 'normal';
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'below': return 'bg-red-50 border-red-200';
//       case 'above': return 'bg-red-50 border-red-200';
//       case 'normal': return 'bg-green-50 border-green-200';
//       default: return 'bg-blue-50 border-blue-200';
//     }
//   };

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

//       const genderFilteredPoints = testPoints.filter((point) => {
//         const pointGender = point.gender?.toUpperCase() || '';
//         const patientGender = editPatient.gender?.toUpperCase() || '';

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

//       const ageObj = editPatient.dateOfBirth ? calculateAgeObject(editPatient.dateOfBirth) : { years: 0, months: 0, days: 0 };
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
//         }
//         return patientAgeMonths >= minMonths && patientAgeMonths < maxMonths;
//       });

//       filteredData[testName] = ageFilteredPoints.length > 0 ? ageFilteredPoints : genderFilteredPoints;
//     });

//     return filteredData;
//   }, [editPatient.dateOfBirth, editPatient.gender]);

//   const fetchReferenceData = useCallback(async () => {
//     if (!selectedTest || !currentLab) return;

//     setLoading(true);
//     try {
//       const existingReport = await getReportDataById(currentLab.id.toString(), reportId.toString());
//       const reportItems: ReportApiItem[] = (Array.isArray(existingReport) ? existingReport : [existingReport]) as ReportApiItem[];
//       const mappedReportData: ReportData[] = reportItems
//         .flatMap((item) => {
//           const reportIdValue = item.reportId ?? item.reportid ?? item.report_id;
//           const baseItem = {
//             report_id: reportIdValue !== undefined && reportIdValue !== null ? String(reportIdValue) : '',
//             visit_id: item.visit_id ?? item.visitId?.toString() ?? editPatient.visitId.toString(),
//             testName: item.testName ?? selectedTest.name,
//             testCategory: item.testCategory ?? '',
//             patientName: item.patientName ?? editPatient.patientname,
//             referenceAgeRange: item.referenceAgeRange ?? '',
//             reportJson: item.reportJson,
//             referenceRanges: item.referenceRanges,
//           };

//           const rows = Array.isArray(item.testRows) ? item.testRows : [];
//           if (rows.length === 0) {
//             return [{
//               ...baseItem,
//               referenceDescription: item.referenceDescription ?? '',
//               referenceRange: item.referenceRange ?? '',
//               enteredValue: item.enteredValue ?? '',
//               unit: item.unit ?? '',
//               description: item.description,
//             }];
//           }

//           return rows.map((row) => ({
//             ...baseItem,
//             referenceDescription: row.testParameter ?? row.referenceDescription ?? '',
//             referenceRange: row.normalRange ?? row.referenceRange ?? '',
//             enteredValue: row.enteredValue ?? '',
//             unit: row.unit ?? '',
//             description: row.description,
//           }));
//         })
//         .filter(item => normalizeKey(item.testName) === normalizeKey(selectedTest.name));

//       setExistingReportData(mappedReportData);
//       const missingIds = mappedReportData.filter(item => !item.report_id);
//       if (missingIds.length > 0) {
//         toast.warn('Some report items are missing IDs and cannot be edited. Please contact support.');
//       }

//       const response = await getTestReferanceRangeByTestName(currentLab.id.toString(), selectedTest.name);
//       const refPointsRaw = Array.isArray(response) ? response : [response];
//       const filteredData = filterReferenceData({ [selectedTest.name]: refPointsRaw });
//       if ((filteredData[selectedTest.name] || []).length === 0) {
//         filteredData[selectedTest.name] = refPointsRaw;
//       }

//       const detailedPointIndex = filteredData[selectedTest.name]?.findIndex(
//         point => (point.testDescription || '').toUpperCase() === 'DETAILED REPORT'
//       );
//       const existingDetailed = mappedReportData.find(item => (item.referenceDescription || '').toUpperCase() === 'DETAILED REPORT');
//       if (detailedPointIndex !== undefined && detailedPointIndex >= 0 && existingDetailed?.reportJson) {
//         const nextPoints = [...(filteredData[selectedTest.name] || [])];
//         nextPoints[detailedPointIndex] = { ...nextPoints[detailedPointIndex], reportJson: existingDetailed.reportJson };
//         filteredData[selectedTest.name] = nextPoints;
//       }

//       setReferencePoints(filteredData);

//       const initialInputValues: Record<string, Record<string | number, string>> = {};
//       const refPoints = filteredData[selectedTest.name] || [];

//       mappedReportData.forEach((reportItem) => {
//         const reportKey = normalizeKey(reportItem.referenceDescription);
//         const pointIndex = refPoints.findIndex(
//           point => normalizeKey(point.testDescription) === reportKey
//         );

//         if (pointIndex >= 0) {
//           if (!initialInputValues[selectedTest.name]) {
//             initialInputValues[selectedTest.name] = {};
//           }

//           const descriptionKey = `${pointIndex}_description`;
//           const descriptionUpper = normalizeKey(refPoints[pointIndex]?.testDescription);
//           if (descriptionUpper === 'DESCRIPTION') {
//             initialInputValues[selectedTest.name][pointIndex] = reportItem.description || reportItem.enteredValue || '';
//           } else if (
//             descriptionUpper === 'DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE' ||
//             descriptionUpper === 'DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT'
//           ) {
//             initialInputValues[selectedTest.name][pointIndex] = reportItem.enteredValue || '';
//             if (reportItem.description) {
//               initialInputValues[selectedTest.name][descriptionKey] = reportItem.description;
//             }
//           } else {
//             initialInputValues[selectedTest.name][pointIndex] = reportItem.enteredValue || '';
//           }
//         }
//       });

//       setInputValues(initialInputValues);
//       setValidationErrors({});
//     } catch (error) {
//       toast.error('Failed to load test and report data');
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedTest, currentLab, editPatient, filterReferenceData]);

//   useEffect(() => {
//     fetchReferenceData();
//   }, [fetchReferenceData]);

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
//         point?.testDescription?.toUpperCase().includes('VLDL CHOLESTEROL');

//       if (!isAutoCalculatedField) {
//         toast.error('Negative values are not allowed');
//         return;
//       }
//     }

//     setInputValues(prev => ({
//       ...prev,
//       [testName]: {
//         ...prev[testName],
//         [index]: value
//       }
//     }));

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

//     if (selectedTest.category === 'RADIOLOGY') {
//       setValidationErrors({});
//       return true;
//     }

//     const testInputs = inputValues[selectedTest.name] || {};
//     const referenceData = referencePoints[selectedTest.name] || [];

//     referenceData.forEach((point, index) => {
//       const descriptionUpper = (point.testDescription || '').toUpperCase();
//       if (descriptionUpper === 'DETAILED REPORT') {
//         return;
//       }

//       if (!testInputs[index] || testInputs[index].trim() === '') {
//         errors[`${selectedTest.name}-${index}`] = true;
//         isValid = false;
//       }
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
//     const missingReportIds: string[] = [];
//     const refPoints = referencePoints[selectedTest.name] || [];
//     const testInputs = inputValues[selectedTest.name] || {};

//     if (selectedTest.category === 'RADIOLOGY') {
//       const detailedReportPoint = refPoints.find(point => (point.testDescription || '').toUpperCase() === 'DETAILED REPORT');
//       const existingItem = existingReportData.find(item => {
//         const refKey = normalizeKey(item.referenceDescription);
//         return refKey === 'RADIOLOGY_TEST' || refKey === 'DETAILED REPORT';
//       }) || existingReportData[0];
//       if (!existingItem?.report_id) {
//         toast.error('Report ID missing for radiology test. Cannot update.');
//         return;
//       }
//       generatedReportData.push({
//         report_id: existingItem.report_id,
//         visit_id: editPatient.visitId.toString(),
//         testName: selectedTest.name,
//         testCategory: selectedTest.category,
//         patientName: editPatient.patientname,
//         referenceDescription: 'RADIOLOGY_TEST',
//         referenceRange: 'N/A',
//         enteredValue: 'Hard copy will be provided',
//         referenceAgeRange: 'N/A',
//         unit: 'N/A',
//         description: 'Imaging test - Results provided separately',
//         referenceRanges: detailedReportPoint?.referenceRanges,
//         reportJson: detailedReportPoint?.reportJson,
//       });
//     } else {
//       refPoints.forEach((point, index) => {
//         const descriptionUpper = (point.testDescription || '').toUpperCase();
//         if (descriptionUpper === 'DETAILED REPORT') {
//           const existingItem = existingReportData.find(
//             item => normalizeKey(item.referenceDescription) === normalizeKey(point.testDescription)
//           );
//           if (!existingItem?.report_id) {
//             missingReportIds.push(point.testDescription || 'DETAILED REPORT');
//             return;
//           }
//           generatedReportData.push({
//             report_id: existingItem.report_id,
//             visit_id: editPatient.visitId.toString(),
//             testName: selectedTest.name,
//             testCategory: selectedTest.category,
//             patientName: editPatient.patientname,
//             referenceDescription: point.testDescription || 'DETAILED REPORT',
//             referenceRange: 'N/A',
//             enteredValue: 'Hard copy will be provided',
//             referenceAgeRange: 'N/A',
//             unit: 'N/A',
//             description: 'Imaging test - Results provided separately',
//             reportJson: point.reportJson,
//             referenceRanges: point.referenceRanges,
//           });
//           return;
//         }

//         if (testInputs[index] || (point.testDescription && point.testDescription !== "No reference available for this test")) {
//           if (!point.testDescription || point.testDescription === "No reference description available") {
//             hasMissingDesc = true;
//           }

//           const descriptionKey = `${index}_description`;
//           const hasDescription = testInputs[descriptionKey] && testInputs[descriptionKey].trim();
//           const hasApiDropdown = hasValidDropdown(point.dropdown);
//           const resolvedReferenceRange =
//             point.minReferenceRange !== null && point.minReferenceRange !== undefined ||
//             point.maxReferenceRange !== null && point.maxReferenceRange !== undefined
//               ? `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`
//               : "N/A";

//           let finalValue = testInputs[index] || "N/A";
//           let description = "N/A";
//           let unit = "N/A";
//           let referenceRange = "N/A";

//           if (
//             descriptionUpper === "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE" ||
//             descriptionUpper === "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT"
//           ) {
//             unit = point.units || "N/A";
//             description = hasDescription ? testInputs[descriptionKey] : "N/A";
//             finalValue = testInputs[index] || "N/A";
//             referenceRange = resolvedReferenceRange;
//           } else if (
//             hasApiDropdown ||
//             ["DROPDOWN", "DROPDOWN-POSITIVE/NEGATIVE", "DROPDOWN-PRESENT/ABSENT",
//               "DROPDOWN-REACTIVE/NONREACTIVE", "DROPDOWN-PERCENTAGE", "DROPDOWN-COMPATIBLE/INCOMPATIBLE"].includes(descriptionUpper)
//           ) {
//             unit = point.units || "N/A";
//             description = "N/A";
//             finalValue = testInputs[index] || "N/A";
//             referenceRange = resolvedReferenceRange;
//           } else if (descriptionUpper === "DESCRIPTION") {
//             unit = "N/A";
//             description = testInputs[index] || "N/A";
//             finalValue = testInputs[index] || "N/A";
//             referenceRange = "N/A";
//           } else {
//             unit = point.units || "N/A";
//             description = "N/A";
//             finalValue = testInputs[index] || "N/A";
//             referenceRange = resolvedReferenceRange;
//           }

//           const existingItem = existingReportData.find(
//             item => normalizeKey(item.referenceDescription) === normalizeKey(point.testDescription)
//           );
//           if (!existingItem?.report_id) {
//             missingReportIds.push(point.testDescription || 'Unknown');
//             return;
//           }

//           generatedReportData.push({
//             report_id: existingItem.report_id,
//             visit_id: editPatient.visitId.toString(),
//             testName: selectedTest.name,
//             testCategory: selectedTest.category,
//             patientName: editPatient.patientname,
//             referenceDescription: point.testDescription || "No reference description available",
//             referenceRange: referenceRange,
//             enteredValue: finalValue,
//             referenceAgeRange: `${point.ageMin ?? "N/A"} ${point.minAgeUnit ?? "YEARS"} - ${point.ageMax ?? "N/A"} ${point.maxAgeUnit ?? "YEARS"}`,
//             unit: unit,
//             description: description,
//             referenceRanges: point.referenceRanges,
//             reportJson: point.reportJson,
//           });
//         }
//       });
//     }

//     if (missingReportIds.length > 0) {
//       toast.error('Some report items are missing IDs. Please refresh and try again.');
//       return;
//     }

//     setReportPreview(generatedReportData);
//     setHasMissingDescriptions(hasMissingDesc);
//     setShowConfirmation(true);
//   };

//   const handleUpdateData = async () => {
//     setIsSubmitting(true);
//     try {
//       if (!currentLab?.id) {
//         throw new Error('Lab ID is undefined');
//       }
//       await updateReportById(currentLab.id, reportId.toString(), reportPreview);
//       refreshReports();
//       setShowModal(false);
//       toast.success('Report updated successfully');
//     } catch (error) {
//       toast.error('Failed to update report');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const buildReadablePreviewHTML = () => {
//     const htmlParts: string[] = [];

//     const detailedPoint = (referencePoints[selectedTest.name] || []).find(
//       p => (p.testDescription || '').toUpperCase() === 'DETAILED REPORT'
//     );
//     if (detailedPoint?.reportJson) {
//       try {
//         const parsed = JSON.parse(detailedPoint.reportJson) as StructuredReport;
//         const parsedSections: (StructuredReportSection & { title?: string; content?: string })[] = Array.isArray(parsed.sections)
//           ? parsed.sections
//           : isPlainObject(parsed.sections)
//             ? Object.entries(parsed.sections as Record<string, unknown>).map(([title, content]) => ({
//               title,
//               content: String(content ?? ''),
//             }))
//             : [];
//         if (parsed && parsed.title && parsedSections.length > 0) {
//           const sectionsHtml = [...parsedSections]
//             .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
//             .map((section) => `
//               <div class="mb-3">
//                 <h4 class="text-sm font-semibold text-gray-800">${section.title || ''}</h4>
//                 <div>${section.content || ''}</div>
//         </div>
//             `)
//             .join('');
//           htmlParts.push(`
//             <div class="mb-6">
//               <h3 class="text-base font-bold text-gray-900">${parsed.title || selectedTest.name}</h3>
//               ${parsed.description ? `<p class="text-sm text-gray-700 mb-2">${parsed.description}</p>` : ''}
//               ${sectionsHtml}
//       </div>
//           `);
//         } else {
//           const formatted = formatMedicalReportToHTML(detailedPoint.reportJson) || '';
//           htmlParts.push(`
//             <div class="mb-6">
//               <h3 class="text-base font-bold text-gray-900">${selectedTest.name}</h3>
//               <div>${formatted}</div>
//             </div>
//           `);
//         }
//       } catch (_) {
//         const formatted = formatMedicalReportToHTML(detailedPoint.reportJson) || '';
//         htmlParts.push(`
//           <div class="mb-6">
//             <h3 class="text-base font-bold text-gray-900">${selectedTest.name}</h3>
//             <div>${formatted}</div>
//           </div>
//         `);
//       }
//     }

//     if (reportPreview.length > 0) {
//       const groupedByTest = reportPreview
//         .filter(item => (item.referenceDescription || '').toUpperCase() !== 'RADIOLOGY_TEST')
//         .reduce((acc, item) => {
//           const testName = item.testName.toUpperCase();
//           if (!acc[testName]) {
//             acc[testName] = [];
//           }
//           acc[testName].push(item);
//           return acc;
//         }, {} as Record<string, ReportData[]>);

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
//           ${escapeHtmlWithBreaks(item.description || item.enteredValue || 'N/A')}
//             </div>
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
//           if (typeof value === 'string' && value.includes('<li')) {
//             return value;
//           }
//           return `<li class="mb-1 text-sm text-gray-700 ml-4">
//             <span class="text-gray-800">${label}: ${value}</span>
//             ${ref ? `<span class="text-gray-500"> (Ref: ${ref})</span>` : ''}
//           </li>`;
//         }).join('');

//         return `
//           <div class="mb-4">
//             <h3 class="text-sm font-bold text-gray-900 mb-2">${testName}</h3>
//             <ul class="list-disc pl-5">${parameters}</ul>
//                     </div>
//         `;
//       }).join('');

//       if (testGroups) {
//         htmlParts.push(`
//           <div class="mt-4">
//             <h2 class="text-sm font-bold text-gray-900 mb-3">Updated Results</h2>
//             ${testGroups}
//                   </div>
//         `);
//       }
//     }

//     if (htmlParts.length === 0) {
//       htmlParts.push('<p class="text-sm text-gray-600">No data available to preview.</p>');
//     }

//     return htmlParts.join('\n');
//   };

//   const detailedPoint = useMemo(
//     () => referencePoints[selectedTest.name]?.find(point => point.testDescription === "DETAILED REPORT"),
//     [referencePoints, selectedTest.name]
//   );

//   if (loading) {
//                     return (
//       <div className="flex flex-col items-center justify-center p-6">
//         <Loader type="progress" fullScreen={false} text="Loading report data..." />
//         <p className="mt-4 text-sm text-gray-600">Fetching test and reference data...</p>
//                         </div>
//     );
//   }

//   return (
//     <div className="bg-white shadow-lg rounded-xl overflow-hidden h-[500px] overflow-y-auto p-6">
//       <PatientBasicInfo patient={patientForInfo} />

//       <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
//         <div className="flex items-center text-sm text-gray-700">
//           <TbSquareRoundedCheck className="text-green-500 mr-2" size={18} />
//           <span className="font-medium">Normal Range</span>
//                               </div>
//         <div className="flex items-center text-sm text-gray-700">
//           <TbArrowDownCircle className="text-red-500 mr-2" size={18} />
//           <span className="font-medium">Below Normal</span>
//                               </div>
//         <div className="flex items-center text-sm text-gray-700">
//           <TbArrowUpCircle className="text-red-500 mr-2" size={18} />
//           <span className="font-medium">Above Normal</span>
//                             </div>
//         <div className="flex items-center text-sm text-gray-700">
//           <TbInfoCircle className="text-blue-500 mr-2" size={18} />
//           <span className="font-medium">No Reference</span>
//                           </div>
//                         </div>

//       <div className="space-y-4 mt-6">
//         {detailedPoint ? (
//           <DetailedReportEditor
//             point={detailedPoint}
//             onReportJsonChange={(reportJson) => {
//               const updatedPoints = referencePoints[selectedTest.name]?.map(point =>
//                 point.testDescription === "DETAILED REPORT"
//                   ? { ...point, reportJson }
//                   : point
//               ) || [];
//               setReferencePoints(prev => ({
//                 ...prev,
//                 [selectedTest.name]: updatedPoints
//               }));
//             }}
//           />
//         ) : (
//           <TestComponentFactory
//             test={selectedTest}
//             referencePoints={referencePoints[selectedTest.name] || []}
//             inputValues={inputValues}
//             onInputChange={handleInputChange}
//             getValueStatus={getValueStatus}
//             getStatusColor={getStatusColor}
//             getStatusIcon={getStatusIcon}
//           />
//         )}
//                             </div>

//       <div className="mt-8 text-center">
//                         <button
//           onClick={prepareReportPreview}
//           className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
//           style={{
//             background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
//           }}
//         >
//           <TbReportMedical className="mr-2" size={18} />
//           Confirm
//                         </button>
//                       </div>

//       <ConfirmationDialog
//         isOpen={showConfirmation}
//         onClose={() => setShowConfirmation(false)}
//         onConfirm={handleUpdateData}
//         title={hasMissingDescriptions ? "Important Note About Test References" : "Confirm Report Update"}
//         message={hasMissingDescriptions
//           ? "Some tests don't have digital references available. Please review the details below before submitting."
//           : "All test references have complete descriptions. Please review the data before submitting."}
//         confirmText="Confirm Update"
//         cancelText="Cancel"
//         isLoading={isSubmitting}
//       >
//         <div className="space-y-4 text-sm">
//           <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
//             <h4 className="font-semibold text-blue-800 mb-2">Patient Information</h4>
//             <div className="grid grid-cols-2 gap-2 text-xs">
//                           <div>
//                 <span className="font-medium text-gray-600">Name:</span>
//                 <span className="ml-2 text-gray-900">{editPatient.patientname || 'N/A'}</span>
//                           </div>
//               <div>
//                 <span className="font-medium text-gray-600">Phone:</span>
//                 <span className="ml-2 text-gray-900">{editPatient.contactNumber || 'N/A'}</span>
//                         </div>
//                           <div>
//                 <span className="font-medium text-gray-600">Email:</span>
//                 <span className="ml-2 text-gray-900">{editPatient.email || 'N/A'}</span>
//                           </div>
//               <div>
//                 <span className="font-medium text-gray-600">Gender:</span>
//                 <span className="ml-2 text-gray-900 capitalize">{editPatient.gender || 'N/A'}</span>
//                         </div>
//                           <div>
//                 <span className="font-medium text-gray-600">Date of Birth:</span>
//                 <span className="ml-2 text-gray-900">{editPatient.dateOfBirth ? new Date(editPatient.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
//                           </div>
//               <div>
//                 <span className="font-medium text-gray-600">Visit Date:</span>
//                 <span className="ml-2 text-gray-900">{editPatient.visitDate ? new Date(editPatient.visitDate).toLocaleDateString() : 'N/A'}</span>
//                         </div>
//                           <div>
//                 <span className="font-medium text-gray-600">Visit Status:</span>
//                 <span className="ml-2 text-gray-900 capitalize">{editPatient.visitStatus?.toLowerCase().replace('_', ' ') || 'N/A'}</span>
//                           </div>
//               <div>
//                 <span className="font-medium text-gray-600">Visit ID:</span>
//                 <span className="ml-2 text-gray-900">{editPatient.visitId || 'N/A'}</span>
//                         </div>
//                             </div>
//                             </div>

//           <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
//             <h4 className="font-semibold text-purple-800 mb-2">Test Information</h4>
//             <div className="grid grid-cols-2 gap-2 text-xs">
//               <div>
//                 <span className="font-medium text-gray-600">Test Name:</span>
//                 <span className="ml-2 text-gray-900">{selectedTest.name || 'N/A'}</span>
//                           </div>
//               <div>
//                 <span className="font-medium text-gray-600">Category:</span>
//                 <span className="ml-2 text-gray-900">{selectedTest.category || 'N/A'}</span>
//                         </div>
//               <div className="col-span-2">
//                 <span className="font-medium text-gray-600">Total Test Points:</span>
//                 <span className="ml-2 text-gray-900">{reportPreview.length}</span>
//                       </div>
//                     </div>
//       </div>

//           {hasMissingDescriptions && (
//             <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
//               <h4 className="font-semibold text-yellow-800 mb-2">Important Note</h4>
//               <ul className="list-disc pl-5 space-y-1 text-xs text-yellow-700">
//                         <li>Some tests ({reportPreview.filter(item => !item.referenceDescription || item.referenceDescription === "No reference description available").length}) don&lsquo;t have digital references available</li>
//                         <li>These tests might be machine-generated or have hard copy references</li>
//                         <li>The results will be provided separately at the reception</li>
//                         <li>Please inform the patient to collect all results from the reception desk</li>
//                       </ul>
//                 </div>
//               )}

//           <div className="bg-white p-3 rounded-lg border border-gray-200">
//             <h4 className="font-semibold text-gray-800 mb-2">Report Preview</h4>
//             <div className="border rounded-lg overflow-hidden bg-white">
//               <div className="p-4">
//                 <div
//                   className="report-html prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700"
//                   dangerouslySetInnerHTML={{ __html: buildReadablePreviewHTML() }}
//                 />
//                   </div>
//                 </div>
//                     </div>
//                   </div>
//       </ConfirmationDialog>
//     </div>
//   );
// };

// export default PatientReportDataEdit;
