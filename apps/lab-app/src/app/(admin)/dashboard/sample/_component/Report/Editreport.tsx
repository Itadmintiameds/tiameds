import { getReportDataById, updateReportById } from '@/../services/reportServices';
import { getTestReferanceRangeByTestName } from '@/../services/testService';
import Loader from '@/app/(admin)/component/common/Loader';
import ConfirmationDialog from '@/app/(admin)/component/common/ConfirmationDialog';
import { useLabs } from '@/context/LabContext';
import { PatientData } from '@/types/sample/sample';
import { TestList, TestReferancePoint } from '@/types/test/testlist';
import { calculateAgeObject } from '@/utils/ageUtils';
import { hasValidDropdown } from '@/utils/dropdownParser';
import { formatMedicalReportToHTML } from '@/utils/reportFormatter';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TbInfoCircle, TbReportMedical, TbArrowDownCircle, TbArrowUpCircle, TbSquareRoundedCheck } from "react-icons/tb";
import { toast } from 'react-toastify';
import PatientBasicInfo from './PatientBasicInfo';
import TestComponentFactory from './TestSpecificComponents/TestComponentFactory';
import DetailedReportEditor from './DetailedReportEditor';

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

interface ReportRow {
  testParameter?: string;
  referenceDescription?: string;
  normalRange?: string;
  referenceRange?: string;
  enteredValue?: string;
  unit?: string;
  description?: string;
}

interface ReportApiItem {
  reportId?: number | string;
  reportid?: number | string;
  report_id?: string;
  visit_id?: string;
  visitId?: number;
  testName?: string;
  testCategory?: string;
  patientName?: string;
  referenceDescription?: string;
  referenceRange?: string;
  referenceAgeRange?: string;
  enteredValue?: string;
  unit?: string;
  description?: string;
  reportJson?: string;
  referenceRanges?: string;
  testRows?: ReportRow[];
}

interface StructuredReportSection {
  title?: string;
  content?: string;
  order?: number;
}

interface StructuredReport {
  title?: string;
  description?: string;
  sections?: StructuredReportSection[] | Record<string, unknown>;
  impression?: string[];
}

interface PatientReportDataEditProps {
  editPatient: Patient;
  selectedTest: TestList;
  reportId: number;
  setShowModal: (value: React.SetStateAction<boolean>) => void;
  refreshReports: () => void;
}

const normalizeKey = (value?: string) => (value || '').trim().toUpperCase();

const escapeHtmlWithBreaks = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/ /g, '&nbsp;')
    .replace(/\r?\n/g, '<br/>');

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reportPreview, setReportPreview] = useState<ReportData[]>([]);
  const [hasMissingDescriptions, setHasMissingDescriptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const patientForInfo: PatientData = useMemo(() => ({
    ...(editPatient as PatientData),
    gender: editPatient.gender ?? '',
    contactNumber: editPatient.contactNumber ?? '',
    email: editPatient.email ?? '',
  }), [editPatient]);

  const getValueStatus = (value: string, minRef: number | null, maxRef: number | null) => {
    if (!value || isNaN(Number(value))) return 'no-reference';
    const numValue = parseFloat(value);

    if (minRef === null || maxRef === null) return 'no-reference';
    if (numValue < minRef) return 'below';
    if (numValue > maxRef) return 'above';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'below': return 'bg-red-50 border-red-200';
      case 'above': return 'bg-red-50 border-red-200';
      case 'normal': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

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
      const reportItems: ReportApiItem[] = (Array.isArray(existingReport) ? existingReport : [existingReport]) as ReportApiItem[];
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

          return rows.map((row) => ({
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
      const missingIds = mappedReportData.filter(item => !item.report_id);
      if (missingIds.length > 0) {
        toast.warn('Some report items are missing IDs and cannot be edited. Please contact support.');
      }

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
        point?.testDescription?.toUpperCase().includes('VLDL CHOLESTEROL');

      if (!isAutoCalculatedField) {
        toast.error('Negative values are not allowed');
        return;
      }
    }

    setInputValues(prev => ({
      ...prev,
      [testName]: {
        ...prev[testName],
        [index]: value
      }
    }));

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

      if (!testInputs[index] || testInputs[index].trim() === '') {
        errors[`${selectedTest.name}-${index}`] = true;
        isValid = false;
      }
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
    const missingReportIds: string[] = [];
    const refPoints = referencePoints[selectedTest.name] || [];
    const testInputs = inputValues[selectedTest.name] || {};

    if (selectedTest.category === 'RADIOLOGY') {
      const detailedReportPoint = refPoints.find(point => (point.testDescription || '').toUpperCase() === 'DETAILED REPORT');
      const existingItem = existingReportData.find(item => {
        const refKey = normalizeKey(item.referenceDescription);
        return refKey === 'RADIOLOGY_TEST' || refKey === 'DETAILED REPORT';
      }) || existingReportData[0];
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
        referenceRanges: detailedReportPoint?.referenceRanges,
        reportJson: detailedReportPoint?.reportJson,
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
          if (!point.testDescription || point.testDescription === "No reference description available") {
            hasMissingDesc = true;
          }

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

          if (
            descriptionUpper === "DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE" ||
            descriptionUpper === "DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT"
          ) {
            unit = point.units || "N/A";
            description = hasDescription ? testInputs[descriptionKey] : "N/A";
            finalValue = testInputs[index] || "N/A";
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

    setReportPreview(generatedReportData);
    setHasMissingDescriptions(hasMissingDesc);
    setShowConfirmation(true);
  };

  const handleUpdateData = async () => {
    setIsSubmitting(true);
    try {
      if (!currentLab?.id) {
        throw new Error('Lab ID is undefined');
      }
      await updateReportById(currentLab.id, reportId.toString(), reportPreview);
      refreshReports();
      setShowModal(false);
      toast.success('Report updated successfully');
    } catch (error) {
      toast.error('Failed to update report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildReadablePreviewHTML = () => {
    let htmlParts: string[] = [];

    const detailedPoint = (referencePoints[selectedTest.name] || []).find(
      p => (p.testDescription || '').toUpperCase() === 'DETAILED REPORT'
    );
    if (detailedPoint?.reportJson) {
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
          htmlParts.push(`
            <div class="mb-6">
              <h3 class="text-base font-bold text-gray-900">${parsed.title || selectedTest.name}</h3>
              ${parsed.description ? `<p class="text-sm text-gray-700 mb-2">${parsed.description}</p>` : ''}
              ${sectionsHtml}
      </div>
          `);
        } else {
          const formatted = formatMedicalReportToHTML(detailedPoint.reportJson) || '';
          htmlParts.push(`
            <div class="mb-6">
              <h3 class="text-base font-bold text-gray-900">${selectedTest.name}</h3>
              <div>${formatted}</div>
            </div>
          `);
        }
      } catch (_) {
        const formatted = formatMedicalReportToHTML(detailedPoint.reportJson) || '';
        htmlParts.push(`
          <div class="mb-6">
            <h3 class="text-base font-bold text-gray-900">${selectedTest.name}</h3>
            <div>${formatted}</div>
          </div>
        `);
      }
    }

    if (reportPreview.length > 0) {
      const groupedByTest = reportPreview
        .filter(item => (item.referenceDescription || '').toUpperCase() !== 'RADIOLOGY_TEST')
        .reduce((acc, item) => {
          const testName = item.testName.toUpperCase();
          if (!acc[testName]) {
            acc[testName] = [];
          }
          acc[testName].push(item);
          return acc;
        }, {} as Record<string, ReportData[]>);

      const testGroups = Object.entries(groupedByTest).map(([testName, items]) => {
        const parameters = items.map(item => {
          const label = (item.referenceDescription || 'Test Parameter');
          const value = (() => {
            const t = (item.referenceDescription || '').toUpperCase();
            if (t === 'DESCRIPTION') {
              return `
      <li class="mb-1 text-sm text-gray-700 ml-4">
        <div style="
          padding-left: 100px;
          text-indent: -100px;
          white-space: normal;
          word-break: break-word;
        ">
          <strong>${label}:</strong>
          ${escapeHtmlWithBreaks(item.description || item.enteredValue || 'N/A')}
            </div>
      </li>
    `;
            }
            if (t.includes('DROPDOWN')) return item.enteredValue || 'N/A';
            return `${item.enteredValue} ${item.unit}`.trim();
          })();
          const ref = (() => {
            const t = (item.referenceDescription || '').toUpperCase();
            if (t.includes('DROPDOWN') || t === 'DESCRIPTION') return '';
            return `${item.referenceRange || 'N/A'} ${item.unit || ''}`.trim();
          })();
          if (typeof value === 'string' && value.includes('<li')) {
            return value;
          }
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
            <h2 class="text-sm font-bold text-gray-900 mb-3">Updated Results</h2>
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

  const detailedPoint = useMemo(
    () => referencePoints[selectedTest.name]?.find(point => point.testDescription === "DETAILED REPORT"),
    [referencePoints, selectedTest.name]
  );

  if (loading) {
                    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Loader type="progress" fullScreen={false} text="Loading report data..." />
        <p className="mt-4 text-sm text-gray-600">Fetching test and reference data...</p>
                        </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden h-[500px] overflow-y-auto p-6">
      <PatientBasicInfo patient={patientForInfo} />

      <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center text-sm text-gray-700">
          <TbSquareRoundedCheck className="text-green-500 mr-2" size={18} />
          <span className="font-medium">Normal Range</span>
                              </div>
        <div className="flex items-center text-sm text-gray-700">
          <TbArrowDownCircle className="text-red-500 mr-2" size={18} />
          <span className="font-medium">Below Normal</span>
                              </div>
        <div className="flex items-center text-sm text-gray-700">
          <TbArrowUpCircle className="text-red-500 mr-2" size={18} />
          <span className="font-medium">Above Normal</span>
                            </div>
        <div className="flex items-center text-sm text-gray-700">
          <TbInfoCircle className="text-blue-500 mr-2" size={18} />
          <span className="font-medium">No Reference</span>
                          </div>
                        </div>

      <div className="space-y-4 mt-6">
        {detailedPoint ? (
          <DetailedReportEditor
            point={detailedPoint}
            onReportJsonChange={(reportJson) => {
              const updatedPoints = referencePoints[selectedTest.name]?.map(point =>
                point.testDescription === "DETAILED REPORT"
                  ? { ...point, reportJson }
                  : point
              ) || [];
              setReferencePoints(prev => ({
                ...prev,
                [selectedTest.name]: updatedPoints
              }));
            }}
          />
        ) : (
          <TestComponentFactory
            test={selectedTest}
            referencePoints={referencePoints[selectedTest.name] || []}
            inputValues={inputValues}
            onInputChange={handleInputChange}
            getValueStatus={getValueStatus}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        )}
                            </div>

      <div className="mt-8 text-center">
                        <button
          onClick={prepareReportPreview}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
          style={{
            background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
          }}
        >
          <TbReportMedical className="mr-2" size={18} />
          Confirm
                        </button>
                      </div>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleUpdateData}
        title={hasMissingDescriptions ? "Important Note About Test References" : "Confirm Report Update"}
        message={hasMissingDescriptions
          ? "Some tests don't have digital references available. Please review the details below before submitting."
          : "All test references have complete descriptions. Please review the data before submitting."}
        confirmText="Confirm Update"
        cancelText="Cancel"
        isLoading={isSubmitting}
      >
        <div className="space-y-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <h4 className="font-semibold text-blue-800 mb-2">Patient Information</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                <span className="font-medium text-gray-600">Name:</span>
                <span className="ml-2 text-gray-900">{editPatient.patientname || 'N/A'}</span>
                          </div>
              <div>
                <span className="font-medium text-gray-600">Phone:</span>
                <span className="ml-2 text-gray-900">{editPatient.contactNumber || 'N/A'}</span>
                        </div>
                          <div>
                <span className="font-medium text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">{editPatient.email || 'N/A'}</span>
                          </div>
              <div>
                <span className="font-medium text-gray-600">Gender:</span>
                <span className="ml-2 text-gray-900 capitalize">{editPatient.gender || 'N/A'}</span>
                        </div>
                          <div>
                <span className="font-medium text-gray-600">Date of Birth:</span>
                <span className="ml-2 text-gray-900">{editPatient.dateOfBirth ? new Date(editPatient.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                          </div>
              <div>
                <span className="font-medium text-gray-600">Visit Date:</span>
                <span className="ml-2 text-gray-900">{editPatient.visitDate ? new Date(editPatient.visitDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                          <div>
                <span className="font-medium text-gray-600">Visit Status:</span>
                <span className="ml-2 text-gray-900 capitalize">{editPatient.visitStatus?.toLowerCase().replace('_', ' ') || 'N/A'}</span>
                          </div>
              <div>
                <span className="font-medium text-gray-600">Visit ID:</span>
                <span className="ml-2 text-gray-900">{editPatient.visitId || 'N/A'}</span>
                        </div>
                            </div>
                            </div>

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
                <span className="ml-2 text-gray-900">{reportPreview.length}</span>
                      </div>
                    </div>
      </div>

          {hasMissingDescriptions && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Note</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-yellow-700">
                        <li>Some tests ({reportPreview.filter(item => !item.referenceDescription || item.referenceDescription === "No reference description available").length}) don&lsquo;t have digital references available</li>
                        <li>These tests might be machine-generated or have hard copy references</li>
                        <li>The results will be provided separately at the reception</li>
                        <li>Please inform the patient to collect all results from the reception desk</li>
                      </ul>
                </div>
              )}

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">Report Preview</h4>
            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="p-4">
                <div
                  className="report-html prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700"
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

export default PatientReportDataEdit;
