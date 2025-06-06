import { getHealthPackageById } from '@/../services/packageServices';
import { getReportData } from '@/../services/reportServices';
import { getTestById, getTestReferanceRangeByTestName } from '@/../services/testService';
import Loader from '@/app/(admin)/component/common/Loader';
import { useLabs } from '@/context/LabContext';
import { TestList, TestReferancePoint } from '@/types/test/testlist';
import React, { useEffect, useState } from 'react';
import {
  TbArrowDownCircle,
  TbArrowUpCircle,
  TbCalendarTime,
  TbCategory,
  TbChartLine,
  TbClipboardText,
  TbGenderAgender,
  TbGenderFemale,
  TbGenderMale,
  TbInfoCircle,
  TbNumbers,
  TbReportMedical,
  TbRuler,
  TbSquareRoundedCheck,
  TbTestPipe
} from "react-icons/tb";
import { toast } from 'react-toastify';
import PatientBasicInfo from './PatientBasicInfo';
import ReportHeader from './ReportHeader';

interface Patient {
    visitId: number;
    patientname: string;
    visitDate: string;
    visitStatus: string;
    sampleNames: string[];
    testIds: number[];
    packageIds: number[];
    contactNumber?: string;
    gender?: string;
    email?: string;
    dateOfBirth?: string;
    id?: string;

}

interface ReportData {
  id?: string;
  visit_id: string;
  testName: string;
  testCategory: string;
  patientName: string;
  referenceDescription: string;
  referenceRange: string;
  referenceAgeRange: string;
  enteredValue: string;
  unit: string;
}

interface PatientReportDataEditProps {
  editPatient:Patient ;
  setShowModal: (value: React.SetStateAction<boolean>) => void;
  refreshReports: () => void;
}

const PatientReportDataEdit: React.FC<PatientReportDataEditProps> = ({ 
  editPatient, 
  setShowModal, 
  refreshReports 
}) => {
  const { currentLab } = useLabs();
  const [loading, setLoading] = useState(false);
  const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
  const [inputValues, setInputValues] = useState<Record<string, Record<number, string>>>({});
  const [allTests, setAllTests] = useState<TestList[]>([]);
  const [existingReportData, setExistingReportData] = useState<ReportData[]>([]);

  const RangeIndicatorLegend = () => (
    <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
      <div className="flex items-center text-sm">
        <TbSquareRoundedCheck className="text-green-500 mr-2" size={18} />
        <span>Normal Range</span>
      </div>
      <div className="flex items-center text-sm">
        <TbArrowDownCircle className="text-yellow-500 mr-2" size={18} />
        <span>Below Normal</span>
      </div>
      <div className="flex items-center text-sm">
        <TbArrowUpCircle className="text-red-500 mr-2" size={18} />
        <>Above Normal</>
      </div>
      <div className="flex items-center text-sm">
        <TbInfoCircle className="text-blue-500 mr-2" size={18} />
        <span>No Reference</span>
      </div>
    </div>
  );

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
      case 'below': return 'bg-yellow-50 border-yellow-200';
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

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'M': return <TbGenderMale className="text-blue-500 mr-1" size={18} />;
      case 'F': return <TbGenderFemale className="text-pink-500 mr-1" size={18} />;
      default: return <TbGenderAgender className="text-gray-500 mr-1" size={18} />;
    }
  };

  const fetchTestDataAndReport = async () => {
    try {
      if (!currentLab?.id) return;
      setLoading(true);
      
      // Fetch existing report data first
      const existingReport = await getReportData (currentLab.id.toString(), editPatient.visitId.toString());
      // Map to ReportData type
      const mappedReportData: ReportData[] = (existingReport).map((item) => ({
        id: item.id,
        visit_id: item.visit_id ?? editPatient.visitId.toString(),
        testName: item.testName,
        testCategory: item.testCategory ?? '',
        patientName: item.patientName ?? editPatient.patientname,
        referenceDescription: item.referenceDescription ?? '',
        referenceRange: item.referenceRange ?? '',
        referenceAgeRange: item.referenceAgeRange ?? '',
        enteredValue: item.enteredValue ?? '',
        unit: item.unit ?? '',
      }));
      setExistingReportData(mappedReportData);

      // Fetch test data
      const uniqueTestIds = Array.from(new Set(editPatient.testIds));
      const fetchedTests = await Promise.all(
        uniqueTestIds.map((testId) => getTestById(currentLab.id.toString(), testId))
      );
      
      // Fetch package data if any
      const uniquePackageIds = Array.from(new Set(editPatient.packageIds));
      const fetchedPackages = await Promise.all(
        uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId))
      );
      
      const formattedPackages = fetchedPackages.map((pkg) => pkg.data);
      const packageTests = formattedPackages.flatMap((pkg) => pkg.tests);
      const combinedTests = [...fetchedTests, ...packageTests.filter(
        (pkgTest) => !fetchedTests.some((test) => test.id === pkgTest.id)
      )];
      
      setAllTests(combinedTests);
      
      // Get reference ranges for all tests
      const allTestNames = combinedTests.map((test) => test.name);
      const referenceData: Record<string, TestReferancePoint[]> = {};
      
      await Promise.all(
        allTestNames.map(async (testName) => {
          const refPoints = await getTestReferanceRangeByTestName(currentLab.id.toString(), testName);
          referenceData[testName] = Array.isArray(refPoints) ? refPoints : [refPoints];
        })
      );

      // Filter reference data based on patient gender
      const filteredReferenceData: Record<string, TestReferancePoint[]> = {};
      Object.keys(referenceData).forEach((testName) => {
        filteredReferenceData[testName] = referenceData[testName].filter((point) => {
          const patientGender = (editPatient.gender ?? 'U').toLowerCase();
          const referenceGender = point.gender === 'M' ? 'male' : point.gender === 'F' ? 'female' : 'U';
          return referenceGender === patientGender || referenceGender === 'U';
        });
      });

      setReferencePoints(filteredReferenceData);

      // Initialize input values with existing report data
      const initialInputValues: Record<string, Record<number, string>> = {};
      
      interface ExistingReportItem {
        testName: string;
        referenceDescription: string;
        enteredValue: string;
      }

      const existingReportDataArray: ExistingReportItem[] = existingReport as ExistingReportItem[] ?? [];

      existingReportDataArray.forEach((reportItem: ExistingReportItem) => {
        const testName: string = reportItem.testName;
        const refPoints: TestReferancePoint[] = filteredReferenceData[testName] || [];
        
        refPoints.forEach((point: TestReferancePoint, index: number) => {
          if (point.testDescription === reportItem.referenceDescription) {
            if (!initialInputValues[testName]) {
              initialInputValues[testName] = {};
            }
            initialInputValues[testName][index] = reportItem.enteredValue;
          }
        });
      });

      setInputValues(initialInputValues);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load test and report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestDataAndReport();
  }, [editPatient]);

  const handleInputChange = (testName: string, index: number, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [testName]: {
        ...prev[testName],
        [index]: value
      }
    }));
  };

  const handleUpdateData = async () => {
    if (!Object.keys(inputValues).length) {
      toast.warn("Please enter values before submitting");
      return;
    }

    setLoading(true);
    try {
      const updatedReportData: ReportData[] = [];

      allTests.forEach((test) => {
        const testInputs = inputValues[test.name] || {};
        const referenceData = referencePoints[test.name] || [];

        referenceData.forEach((point, index) => {
          const enteredValue = testInputs[index];
          if (!enteredValue) return;

          // Find existing report item to get its ID
          const existingItem = existingReportData.find(
            item => 
              item.testName === test.name && 
              item.referenceDescription === point.testDescription
          );

          updatedReportData.push({
            id: existingItem?.id, // Include ID for updates
            visit_id: editPatient.visitId.toString(),
            testName: test.name,
            testCategory: test.category,
            patientName: editPatient.patientname,
            referenceDescription: point.testDescription || "N/A",
            referenceRange: `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`,
            referenceAgeRange: `${point.ageMin ?? "N/A"} - ${point.ageMax ?? "N/A"}`,
            enteredValue: enteredValue,
            unit: point.units || "N/A",
          });
        });
      });

      // await updateReport(currentLab?.id.toString() || '', updatedReportData);
      refreshReports();
      setShowModal(false);
      toast.success("Report updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update report");
    } finally {
      setLoading(false);
    }
  };



  if (loading) return <Loader />;

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden h-[500px] overflow-y-auto p-5">
      <ReportHeader />
      <PatientBasicInfo
        patient={{
          ...editPatient,
          gender: editPatient.gender ?? '',
          contactNumber: editPatient.contactNumber ?? '',
          email: editPatient.email ?? '',
          dateOfBirth: editPatient.dateOfBirth ?? ''
        }}
      />
      <RangeIndicatorLegend />    
      <div className="space-y-5 mt-6">
        {allTests.map((test) => (
          <div key={test.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <TbTestPipe className="text-blue-500 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3 flex items-center">
                  <TbCategory className="mr-1" size={14} />
                  {test.category}
                </span>
                {test.name}
              </h3>
            </div>
            
            <div className="space-y-3">
              {referencePoints[test.name]?.map((point, index) => {
                const currentValue = inputValues[test.name]?.[index] || '';
                const status = getValueStatus(
                  currentValue,
                  point.minReferenceRange,
                  point.maxReferenceRange
                );
                
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${getStatusColor(status)} transition-all`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                      <div className="flex items-start">
                        <TbClipboardText className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-600">Description</p>
                          <p className="text-gray-800">{point.testDescription}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <TbChartLine className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-600">Reference Range</p>
                          <p className="text-gray-800">
                            {point.minReferenceRange ?? 'N/A'} - {point.maxReferenceRange ?? 'N/A'} {point.units && (
                              <span className="text-gray-500 flex items-center">
                                <TbRuler className="ml-1" size={14} />
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <TbCalendarTime className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-600">Age Range</p>
                          <p className="text-gray-800">
                            {point.ageMin ?? 'N/A'} - {point.ageMax ?? 'N/A'} years
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        {getGenderIcon(point.gender)}
                        <div>
                          <p className="font-medium text-gray-600">Gender</p>
                          <p className="text-gray-800">
                            {point.gender === 'M' ? 'Male' : point.gender === 'F' ? 'Female' : 'Unisex'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <TbNumbers className="text-gray-500 mr-2" size={18} />
                            <p className="font-medium text-gray-600">Enter Value</p>
                          </div>
                          <div className="flex items-center">
                            {getStatusIcon(status)}
                            <input
                              type="text"
                              className={`w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300`}
                              placeholder="Enter value"
                              value={currentValue}
                              onChange={(e) => handleInputChange(test.name, index, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 mt-6">
        <button
          onClick={handleUpdateData}
          className="w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center"
        >
          <TbReportMedical className="mr-2" size={18} />
          Update Report
        </button>
      </div>
    </div>
  );
};

export default PatientReportDataEdit;