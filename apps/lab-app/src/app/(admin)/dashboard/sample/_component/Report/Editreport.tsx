// import React, { useEffect, useState } from 'react';
// import {
//   TbArrowDownCircle, TbArrowUpCircle, TbCalendarTime, TbCategory,
//   TbChartLine, TbClipboardText, TbGenderAgender, TbGenderFemale,
//   TbGenderMale, TbInfoCircle, TbNumbers, TbReportMedical,
//   TbRuler, TbSquareRoundedCheck, TbTestPipe
// } from "react-icons/tb";
// import { toast } from 'react-toastify';
// import Loader from '@/app/(admin)/component/common/Loader';
// import { useLabs } from '@/context/LabContext';
// import { getHealthPackageById } from '@/../services/packageServices';
// import { getReportData, updateReports } from '@/../services/reportServices';
// import { getTestById, getTestReferanceRangeByTestName } from '@/../services/testService';
// import PatientBasicInfo from './PatientBasicInfo';
// import ReportHeader from './ReportHeader';

// interface Patient {
//   visitId: number;
//   patientname: string;
//   visitDate: string;
//   visitStatus: string;
//   sampleNames: string[];
//   testIds: number[];
//   packageIds: number[];
//   contactNumber?: string;
//   gender?: string;
//   email?: string;
//   dateOfBirth?: string;
//   id?: string;
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
// }

// interface TestReferancePoint {
//   testDescription: string;
//   minReferenceRange: number | null;
//   maxReferenceRange: number | null;
//   ageMin: number | null;
//   ageMax: number | null;
//   gender: string;
//   units: string;
// }

// interface TestList {
//   id: number;
//   name: string;
//   category: string;
// }

// interface PatientReportDataEditProps {
//   editPatient: Patient;
//   setShowModal: (value: React.SetStateAction<boolean>) => void;
//   refreshReports: () => void;
// }

// const PatientReportDataEdit: React.FC<PatientReportDataEditProps> = ({
//   editPatient,
//   setShowModal,
//   refreshReports
// }) => {
//   const { currentLab } = useLabs();
//   const [loading, setLoading] = useState(false);
//   const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
//   const [inputValues, setInputValues] = useState<Record<string, Record<number, string>>>({});
//   const [allTests, setAllTests] = useState<TestList[]>([]);
//   const [existingReportData, setExistingReportData] = useState<ReportData[]>([]);

//   const RangeIndicatorLegend = () => (
//     <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
//       <div className="flex items-center text-sm">
//         <TbSquareRoundedCheck className="text-green-500 mr-2" size={18} />
//         <span>Normal Range</span>
//       </div>
//       <div className="flex items-center text-sm">
//         <TbArrowDownCircle className="text-yellow-500 mr-2" size={18} />
//         <span>Below Normal</span>
//       </div>
//       <div className="flex items-center text-sm">
//         <TbArrowUpCircle className="text-red-500 mr-2" size={18} />
//         <>Above Normal</>
//       </div>
//       <div className="flex items-center text-sm">
//         <TbInfoCircle className="text-blue-500 mr-2" size={18} />
//         <span>No Reference</span>
//       </div>
//     </div>
//   );

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
//       case 'below': return 'bg-yellow-50 border-yellow-200';
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

//   const getGenderIcon = (gender: string) => {
//     switch (gender) {
//       case 'M': return <TbGenderMale className="text-blue-500 mr-1" size={18} />;
//       case 'F': return <TbGenderFemale className="text-pink-500 mr-1" size={18} />;
//       default: return <TbGenderAgender className="text-gray-500 mr-1" size={18} />;
//     }
//   };


//   const fetchTestDataAndReport = async () => {
//     try {
//       if (!currentLab?.id) return;
//       setLoading(true);

//       // 1. First fetch the existing report data
//       const existingReport = await getReportData(currentLab.id.toString(), editPatient.visitId.toString());
//       const mappedReportData: ReportData[] = existingReport.map((item) => ({
//         report_id: item.reportId !== undefined && item.reportId !== null ? String(item.reportId) : '',
//         visit_id: item.visit_id ?? item.visitId?.toString() ?? editPatient.visitId.toString(),
//         testName: item.testName,
//         testCategory: item.testCategory ?? '',
//         patientName: item.patientName ?? editPatient.patientname,
//         referenceDescription: item.referenceDescription ?? '',
//         referenceRange: item.referenceRange ?? '',
//         referenceAgeRange: item.referenceAgeRange ?? '',
//         enteredValue: item.enteredValue ?? '',
//         unit: item.unit ?? '',
//       }));
//       setExistingReportData(mappedReportData);

//       // 2. Fetch test data
//       const uniqueTestIds = Array.from(new Set(editPatient.testIds));
//       const fetchedTests = await Promise.all(
//         uniqueTestIds.map(testId => getTestById(currentLab.id.toString(), testId))
//       );

//       // 3. Fetch package data if any
//       const uniquePackageIds = Array.from(new Set(editPatient.packageIds));
//       const fetchedPackages = await Promise.all(
//         uniquePackageIds.map(packageId => getHealthPackageById(currentLab.id, packageId))
//       );

//       const packageTests = fetchedPackages.flatMap(pkg => pkg.data.tests);
//       const combinedTests = [...fetchedTests, ...packageTests.filter(
//         pkgTest => !fetchedTests.some(test => test.id === pkgTest.id)
//       )];
//       setAllTests(combinedTests);

//       // 4. Get reference ranges for all tests
//       const allTestNames = combinedTests.map(test => test.name);
//       const referenceData: Record<string, TestReferancePoint[]> = {};

//       await Promise.all(
//         allTestNames.map(async testName => {
//           const refPoints = await getTestReferanceRangeByTestName(currentLab.id.toString(), testName);
//           referenceData[testName] = Array.isArray(refPoints) ? refPoints : [refPoints];
//         })
//       );

//       // 5. Filter reference data based on patient gender
//       const filteredReferenceData: Record<string, TestReferancePoint[]> = {};
//       Object.keys(referenceData).forEach(testName => {
//         filteredReferenceData[testName] = referenceData[testName].filter(point => {
//           const patientGender = (editPatient.gender ?? 'U').toLowerCase();
//           const referenceGender = point.gender === 'M' ? 'male' : point.gender === 'F' ? 'female' : 'U';
//           return referenceGender === patientGender || referenceGender === 'U';
//         });
//       });
//       setReferencePoints(filteredReferenceData);

//       // 6. Now that we have all data, initialize the input values
//       const initialInputValues: Record<string, Record<number, string>> = {};

//       mappedReportData.forEach(reportItem => {
//         const refPoints = filteredReferenceData[reportItem.testName] || [];
//         const pointIndex = refPoints.findIndex(
//           point => point.testDescription === reportItem.referenceDescription
//         );

//         if (pointIndex >= 0) {
//           if (!initialInputValues[reportItem.testName]) {
//             initialInputValues[reportItem.testName] = {};
//           }
//           initialInputValues[reportItem.testName][pointIndex] = reportItem.enteredValue;
//         }
//       });

//       setInputValues(initialInputValues);
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to load test and report data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTestDataAndReport();
//   }, [editPatient]);

//   const handleInputChange = (testName: string, index: number, value: string) => {
//     setInputValues(prev => ({
//       ...prev,
//       [testName]: {
//         ...prev[testName],
//         [index]: value
//       }
//     }));
//   };

//   const handleUpdateData = async () => {
//     if (!Object.keys(inputValues).length) {
//       toast.warn("Please enter values before submitting");
//       return;
//     }

//     setLoading(true);
//     try {
//       const updatedReportData: ReportData[] = [];

//       allTests.forEach(test => {
//         const testInputs = inputValues[test.name] || {};
//         const referenceData = referencePoints[test.name] || [];

//         referenceData.forEach((point, index) => {
//           const enteredValue = testInputs[index];
//           if (!enteredValue) return;

//           // Find existing report item to get its ID
//           const existingItem = existingReportData.find(
//             item => item.testName === test.name &&
//               item.referenceDescription === point.testDescription
//           );

//           updatedReportData.push({
//             report_id: existingItem?.report_id || '', // Required for updates
//             visit_id: editPatient.visitId.toString(),
//             testName: test.name,
//             testCategory: test.category,
//             patientName: editPatient.patientname,
//             referenceDescription: point.testDescription || "N/A",
//             referenceRange: `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`,
//             referenceAgeRange: `${point.ageMin ?? "N/A"} - ${point.ageMax ?? "N/A"}`,
//             enteredValue: enteredValue,
//             unit: point.units || "N/A",
//           });
//         });
//       });

//       if (!currentLab?.id) {
//         throw new Error("Lab ID is undefined");
//       }

//       // Send all updates in a single batch
//       await updateReports(currentLab.id, updatedReportData);

//       refreshReports();
//       setShowModal(false);
//       toast.success("Report updated successfully");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to update report");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Loader />;

//   return (
//     <div className="bg-white shadow-lg rounded-xl overflow-hidden h-[500px] overflow-y-auto p-5">
//       <ReportHeader />
//       <PatientBasicInfo
//         patient={{
//           ...editPatient,
//           gender: editPatient.gender ?? '',
//           contactNumber: editPatient.contactNumber ?? '',
//           email: editPatient.email ?? '',
//           dateOfBirth: editPatient.dateOfBirth ?? ''
//         }}
//       />
//       <RangeIndicatorLegend />
//       <div className="space-y-5 mt-6">
//         {allTests.map(test => (
//           <div key={test.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
//             <div className="flex items-center mb-4">
//               <TbTestPipe className="text-blue-500 mr-2" size={20} />
//               <h3 className="text-lg font-semibold text-gray-800 flex items-center">
//                 <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3 flex items-center">
//                   <TbCategory className="mr-1" size={14} />
//                   {test.category}
//                 </span>
//                 {test.name}
//               </h3>
//             </div>

//             <div className="space-y-3">
//               {referencePoints[test.name]?.map((point, index) => {
//                 const currentValue = inputValues[test.name]?.[index] || '';
//                 const status = getValueStatus(
//                   currentValue,
//                   point.minReferenceRange,
//                   point.maxReferenceRange
//                 );

//                 return (
//                   <div
//                     key={index}
//                     className={`p-4 rounded-lg border ${getStatusColor(status)} transition-all`}
//                   >
//                     <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
//                       <div className="flex items-start">
//                         <TbClipboardText className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                         <div>
//                           <p className="font-medium text-gray-600">Description</p>
//                           <p className="text-gray-800">{point.testDescription}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-start">
//                         <TbChartLine className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                         <div>
//                           <p className="font-medium text-gray-600">Reference Range</p>
//                           <p className="text-gray-800">
//                             {point.minReferenceRange ?? 'N/A'} - {point.maxReferenceRange ?? 'N/A'} {point.units && (
//                               <span className="text-gray-500 flex items-center">
//                                 <TbRuler className="ml-1" size={14} />
//                               </span>
//                             )}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-start">
//                         <TbCalendarTime className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                         <div>
//                           <p className="font-medium text-gray-600">Age Range</p>
//                           <p className="text-gray-800">
//                             {point.ageMin ?? 'N/A'} - {point.ageMax ?? 'N/A'} years
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-start">
//                         {getGenderIcon(point.gender)}
//                         <div>
//                           <p className="font-medium text-gray-600">Gender</p>
//                           <p className="text-gray-800">
//                             {point.gender === 'M' ? 'Male' : point.gender === 'F' ? 'Female' : 'Unisex'}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center">
//                         <div className="flex-1">
//                           <div className="flex items-center mb-1">
//                             <TbNumbers className="text-gray-500 mr-2" size={18} />
//                             <p className="font-medium text-gray-600">Enter Value</p>
//                           </div>
//                           <div className="flex items-center">
//                             {getStatusIcon(status)}
//                             <input
//                               type="text"
//                               className={`w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300`}
//                               placeholder="Enter value"
//                               value={currentValue}
//                               onChange={(e) => handleInputChange(test.name, index, e.target.value)}
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 mt-6">
//         <button
//           onClick={handleUpdateData}
//           className="w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center"
//           disabled={loading}
//         >
//           {loading ? (
//             <div className="flex flex-col items-center justify-center h-64">
//               <Loader type="progress" fullScreen={false} text= "Updating Report..." />
//               <p className="mt-2 text-sm text-gray-500">Please wait while we update the report.</p>
              
//             </div>
//           ) : (
//             <>
//               <TbReportMedical className="mr-2" size={18} />
//               Update Report
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PatientReportDataEdit;



//================================


// import React, { useEffect, useState } from 'react';
// import {
//   TbArrowDownCircle, TbArrowUpCircle, TbCalendarTime, TbCategory,
//   TbChartLine, TbClipboardText, TbGenderAgender, TbGenderFemale,
//   TbGenderMale, TbInfoCircle, TbNumbers, TbReportMedical,
//   TbRuler, TbSquareRoundedCheck, TbTestPipe
// } from "react-icons/tb";
// import { toast } from 'react-toastify';
// import Loader from '@/app/(admin)/component/common/Loader';
// import { useLabs } from '@/context/LabContext';
// import { getHealthPackageById } from '@/../services/packageServices';
// import { getReportData, updateReports } from '@/../services/reportServices';
// import { getTestById, getTestReferanceRangeByTestName } from '@/../services/testService';
// import PatientBasicInfo from './PatientBasicInfo';
// import ReportHeader from './ReportHeader';

// interface Patient {
//   visitId: number;
//   patientname: string;
//   visitDate: string;
//   visitStatus: string;
//   sampleNames: string[];
//   testIds: number[];
//   packageIds: number[];
//   contactNumber?: string;
//   gender?: string;
//   email?: string;
//   dateOfBirth?: string;
//   id?: string;
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
// }

// interface TestReferancePoint {
//   testDescription: string;
//   minReferenceRange: number | null;
//   maxReferenceRange: number | null;
//   ageMin: number | null;
//   ageMax: number | null;
//   gender: string;
//   units: string;
// }

// interface TestList {
//   id: number;
//   name: string;
//   category: string;
// }

// interface PatientReportDataEditProps {
//   editPatient: Patient;
//   setShowModal: (value: React.SetStateAction<boolean>) => void;
//   refreshReports: () => void;
// }

// const PatientReportDataEdit: React.FC<PatientReportDataEditProps> = ({
//   editPatient,
//   setShowModal,
//   refreshReports
// }) => {
//   const { currentLab } = useLabs();
//   const [loading, setLoading] = useState(false);
//   const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
//   const [inputValues, setInputValues] = useState<Record<string, Record<number, string>>>({});
//   const [allTests, setAllTests] = useState<TestList[]>([]);
//   const [existingReportData, setExistingReportData] = useState<ReportData[]>([]);

//   const RangeIndicatorLegend = () => (
//     <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
//       <div className="flex items-center text-sm">
//         <TbSquareRoundedCheck className="text-green-500 mr-2" size={18} />
//         <span>Normal Range</span>
//       </div>
//       <div className="flex items-center text-sm">
//         <TbArrowDownCircle className="text-yellow-500 mr-2" size={18} />
//         <span>Below Normal</span>
//       </div>
//       <div className="flex items-center text-sm">
//         <TbArrowUpCircle className="text-red-500 mr-2" size={18} />
//         <>Above Normal</>
//       </div>
//       <div className="flex items-center text-sm">
//         <TbInfoCircle className="text-blue-500 mr-2" size={18} />
//         <span>No Reference</span>
//       </div>
//     </div>
//   );

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
//       case 'below': return 'bg-yellow-50 border-yellow-200';
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

//   const getGenderIcon = (gender: string) => {
//     switch (gender) {
//       case 'M': return <TbGenderMale className="text-blue-500 mr-1" size={18} />;
//       case 'F': return <TbGenderFemale className="text-pink-500 mr-1" size={18} />;
//       default: return <TbGenderAgender className="text-gray-500 mr-1" size={18} />;
//     }
//   };


//   const fetchTestDataAndReport = async () => {
//     try {
//       if (!currentLab?.id) return;
//       setLoading(true);

//       // 1. First fetch the existing report data
//       const existingReport = await getReportData(currentLab.id.toString(), editPatient.visitId.toString());
//       const mappedReportData: ReportData[] = existingReport.map((item) => ({
//         report_id: item.reportId !== undefined && item.reportId !== null ? String(item.reportId) : '',
//         visit_id: item.visit_id ?? item.visitId?.toString() ?? editPatient.visitId.toString(),
//         testName: item.testName,
//         testCategory: item.testCategory ?? '',
//         patientName: item.patientName ?? editPatient.patientname,
//         referenceDescription: item.referenceDescription ?? '',
//         referenceRange: item.referenceRange ?? '',
//         referenceAgeRange: item.referenceAgeRange ?? '',
//         enteredValue: item.enteredValue ?? '',
//         unit: item.unit ?? '',
//       }));
//       setExistingReportData(mappedReportData);

//       // 2. Fetch test data
//       const uniqueTestIds = Array.from(new Set(editPatient.testIds));
//       const fetchedTests = await Promise.all(
//         uniqueTestIds.map(testId => getTestById(currentLab.id.toString(), testId))
//       );

//       // 3. Fetch package data if any
//       const uniquePackageIds = Array.from(new Set(editPatient.packageIds));
//       const fetchedPackages = await Promise.all(
//         uniquePackageIds.map(packageId => getHealthPackageById(currentLab.id, packageId))
//       );

//       const packageTests = fetchedPackages.flatMap(pkg => pkg.data.tests);
//       const combinedTests = [...fetchedTests, ...packageTests.filter(
//         pkgTest => !fetchedTests.some(test => test.id === pkgTest.id)
//       )];
//       setAllTests(combinedTests);

//       // 4. Get reference ranges for all tests
//       const allTestNames = combinedTests.map(test => test.name);
//       const referenceData: Record<string, TestReferancePoint[]> = {};

//       await Promise.all(
//         allTestNames.map(async testName => {
//           const refPoints = await getTestReferanceRangeByTestName(currentLab.id.toString(), testName);
//           referenceData[testName] = Array.isArray(refPoints) ? refPoints : [refPoints];
//         })
//       );

//       // 5. Filter reference data based on patient gender
//       const filteredReferenceData: Record<string, TestReferancePoint[]> = {};
//       Object.keys(referenceData).forEach(testName => {
//         filteredReferenceData[testName] = referenceData[testName].filter(point => {
//           const patientGender = (editPatient.gender ?? 'U').toLowerCase();
//           const referenceGender = point.gender === 'M' ? 'male' : point.gender === 'F' ? 'female' : 'U';
//           return referenceGender === patientGender || referenceGender === 'U';
//         });
//       });
//       setReferencePoints(filteredReferenceData);

//       // 6. Now that we have all data, initialize the input values
//       const initialInputValues: Record<string, Record<number, string>> = {};

//       mappedReportData.forEach(reportItem => {
//         const refPoints = filteredReferenceData[reportItem.testName] || [];
//         const pointIndex = refPoints.findIndex(
//           point => point.testDescription === reportItem.referenceDescription
//         );

//         if (pointIndex >= 0) {
//           if (!initialInputValues[reportItem.testName]) {
//             initialInputValues[reportItem.testName] = {};
//           }
//           initialInputValues[reportItem.testName][pointIndex] = reportItem.enteredValue;
//         }
//       });

//       setInputValues(initialInputValues);
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to load test and report data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTestDataAndReport();
//   }, [editPatient]);

//   const handleInputChange = (testName: string, index: number, value: string) => {
//     setInputValues(prev => ({
//       ...prev,
//       [testName]: {
//         ...prev[testName],
//         [index]: value
//       }
//     }));
//   };

//   const handleUpdateData = async () => {
//     if (!Object.keys(inputValues).length) {
//       toast.warn("Please enter values before submitting");
//       return;
//     }

//     setLoading(true);
//     try {
//       const updatedReportData: ReportData[] = [];

//       allTests.forEach(test => {
//         const testInputs = inputValues[test.name] || {};
//         const referenceData = referencePoints[test.name] || [];

//         referenceData.forEach((point, index) => {
//           const enteredValue = testInputs[index];
//           if (!enteredValue) return;

//           // Find existing report item to get its ID
//           const existingItem = existingReportData.find(
//             item => item.testName === test.name &&
//               item.referenceDescription === point.testDescription
//           );

//           updatedReportData.push({
//             report_id: existingItem?.report_id || '', // Required for updates
//             visit_id: editPatient.visitId.toString(),
//             testName: test.name,
//             testCategory: test.category,
//             patientName: editPatient.patientname,
//             referenceDescription: point.testDescription || "N/A",
//             referenceRange: `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`,
//             referenceAgeRange: `${point.ageMin ?? "N/A"} - ${point.ageMax ?? "N/A"}`,
//             enteredValue: enteredValue,
//             unit: point.units || "N/A",
//           });
//         });
//       });

//       if (!currentLab?.id) {
//         throw new Error("Lab ID is undefined");
//       }

//       // Send all updates in a single batch
//       await updateReports(currentLab.id, updatedReportData);

//       refreshReports();
//       setShowModal(false);
//       toast.success("Report updated successfully");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to update report");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Loader />;

//   return (
//     <div className="bg-white shadow-lg rounded-xl overflow-hidden h-[500px] overflow-y-auto p-5">
//       <ReportHeader />
//       <PatientBasicInfo
//         patient={{
//           ...editPatient,
//           gender: editPatient.gender ?? '',
//           contactNumber: editPatient.contactNumber ?? '',
//           email: editPatient.email ?? '',
//           dateOfBirth: editPatient.dateOfBirth ?? ''
//         }}
//       />
//       <RangeIndicatorLegend />
//       <div className="space-y-5 mt-6">
//         {allTests.map(test => (
//           <div key={test.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
//             <div className="flex items-center mb-4">
//               <TbTestPipe className="text-blue-500 mr-2" size={20} />
//               <h3 className="text-lg font-semibold text-gray-800 flex items-center">
//                 <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3 flex items-center">
//                   <TbCategory className="mr-1" size={14} />
//                   {test.category}
//                 </span>
//                 {test.name}
//               </h3>
//             </div>

//             <div className="space-y-3">
//               {referencePoints[test.name]?.map((point, index) => {
//                 const currentValue = inputValues[test.name]?.[index] || '';
//                 const status = getValueStatus(
//                   currentValue,
//                   point.minReferenceRange,
//                   point.maxReferenceRange
//                 );

//                 return (
//                   <div
//                     key={index}
//                     className={`p-4 rounded-lg border ${getStatusColor(status)} transition-all`}
//                   >
//                     <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
//                       <div className="flex items-start">
//                         <TbClipboardText className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                         <div>
//                           <p className="font-medium text-gray-600">Description</p>
//                           <p className="text-gray-800">{point.testDescription}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-start">
//                         <TbChartLine className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                         <div>
//                           <p className="font-medium text-gray-600">Reference Range</p>
//                           <p className="text-gray-800">
//                             {point.minReferenceRange ?? 'N/A'} - {point.maxReferenceRange ?? 'N/A'} {point.units && (
//                               <span className="text-gray-500 flex items-center">
//                                 <TbRuler className="ml-1" size={14} />
//                               </span>
//                             )}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-start">
//                         <TbCalendarTime className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                         <div>
//                           <p className="font-medium text-gray-600">Age Range</p>
//                           <p className="text-gray-800">
//                             {point.ageMin ?? 'N/A'} - {point.ageMax ?? 'N/A'} years
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-start">
//                         {getGenderIcon(point.gender)}
//                         <div>
//                           <p className="font-medium text-gray-600">Gender</p>
//                           <p className="text-gray-800">
//                             {point.gender === 'M' ? 'Male' : point.gender === 'F' ? 'Female' : 'Unisex'}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center">
//                         <div className="flex-1">
//                           <div className="flex items-center mb-1">
//                             <TbNumbers className="text-gray-500 mr-2" size={18} />
//                             <p className="font-medium text-gray-600">Enter Value</p>
//                           </div>
//                           <div className="flex items-center">
//                             {getStatusIcon(status)}
//                             <input
//                               type="text"
//                               className={`w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300`}
//                               placeholder="Enter value"
//                               value={currentValue}
//                               onChange={(e) => handleInputChange(test.name, index, e.target.value)}
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 mt-6">
//         <button
//           onClick={handleUpdateData}
//           className="w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center"
//           disabled={loading}
//         >
//           {loading ? (
//             <div className="flex flex-col items-center justify-center h-64">
//               <Loader type="progress" fullScreen={false} text= "Updating Report..." />
//               <p className="mt-2 text-sm text-gray-500">Please wait while we update the report.</p>
              
//             </div>
//           ) : (
//             <>
//               <TbReportMedical className="mr-2" size={18} />
//               Update Report
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PatientReportDataEdit; 




// import React, { useEffect, useState } from 'react';
// import {
//   TbArrowDownCircle, TbArrowUpCircle, TbCalendarTime, TbCategory,
//   TbChartLine, TbClipboardText, TbGenderAgender, TbGenderFemale,
//   TbGenderMale, TbInfoCircle, TbNumbers, TbReportMedical,
//   TbRuler, TbSquareRoundedCheck, TbTestPipe, TbX
// } from "react-icons/tb";
// import { toast } from 'react-toastify';
// import Loader from '@/app/(admin)/component/common/Loader';
// import { useLabs } from '@/context/LabContext';
// import { getHealthPackageById } from '@/../services/packageServices';
// import { getReportData, updateReports } from '@/../services/reportServices';
// import { getTestById, getTestReferanceRangeByTestName } from '@/../services/testService';
// import PatientBasicInfo from './PatientBasicInfo';
// import ReportHeader from './ReportHeader';

// interface Patient {
//   visitId: number;
//   patientname: string;
//   visitDate: string;
//   visitStatus: string;
//   sampleNames: string[];
//   testIds: number[];
//   packageIds: number[];
//   contactNumber?: string;
//   gender?: string;
//   email?: string;
//   dateOfBirth?: string;
//   id?: string;
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
// }

// interface TestReferancePoint {
//   testDescription: string;
//   minReferenceRange: number | null;
//   maxReferenceRange: number | null;
//   ageMin: number | null;
//   ageMax: number | null;
//   minAgeUnit?: string;
//   maxAgeUnit?: string;
//   gender: string;
//   units: string;
// }

// interface TestList {
//   id: number;
//   name: string;
//   category: string;
// }

// interface PatientReportDataEditProps {
//   editPatient: Patient;
//   setShowModal: (value: React.SetStateAction<boolean>) => void;
//   refreshReports: () => void;
// }

// const PatientReportDataEdit: React.FC<PatientReportDataEditProps> = ({
//   editPatient,
//   setShowModal,
//   refreshReports
// }) => {
//   const { currentLab } = useLabs();
//   const [loading, setLoading] = useState(false);
//   const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
//   const [inputValues, setInputValues] = useState<Record<string, Record<number, string>>>({});
//   const [allTests, setAllTests] = useState<TestList[]>([]);
//   const [existingReportData, setExistingReportData] = useState<ReportData[]>([]);
//   const [removedReferences, setRemovedReferences] = useState<Record<string, number[]>>({});
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [reportPreview, setReportPreview] = useState<ReportData[]>([]);
//   const [hasMissingDescriptions, setHasMissingDescriptions] = useState(false);

//   const calculateAge = (dob: string) => {
//     if (!dob) return { years: 0, months: 0, days: 0 };
//     const birthDate = new Date(dob);
//     const now = new Date();
//     let years = now.getFullYear() - birthDate.getFullYear();
//     let months = now.getMonth() - birthDate.getMonth();
//     let days = now.getDate() - birthDate.getDate();

//     if (days < 0) {
//       months--;
//       const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
//       days += lastMonth.getDate();
//     }

//     if (months < 0) {
//       years--;
//       months += 12;
//     }

//     return { years, months, days };
//   };

//   const formatAgeDisplay = (age: { years: number; months: number; days: number }) => {
//     if (age.years > 0) {
//       return `${age.years} year${age.years > 1 ? 's' : ''} ${age.months > 0 ? `${age.months} month${age.months > 1 ? 's' : ''}` : ''}`;
//     } else if (age.months > 0) {
//       return `${age.months} month${age.months > 1 ? 's' : ''} ${age.days > 0 ? `${age.days} day${age.days > 1 ? 's' : ''}` : ''}`;
//     } else {
//       return `${age.days} day${age.days !== 1 ? 's' : ''}`;
//     }
//   };

//   const RangeIndicatorLegend = () => (
//     <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
//       <div className="flex items-center text-sm">
//         <TbSquareRoundedCheck className="text-green-500 mr-2" size={18} />
//         <span>Normal Range</span>
//       </div>
//       <div className="flex items-center text-sm">
//         <TbArrowDownCircle className="text-yellow-500 mr-2" size={18} />
//         <span>Below Normal</span>
//       </div>
//       <div className="flex items-center text-sm">
//         <TbArrowUpCircle className="text-red-500 mr-2" size={18} />
//         <span>Above Normal</span>
//       </div>
//       <div className="flex items-center text-sm">
//         <TbInfoCircle className="text-blue-500 mr-2" size={18} />
//         <span>No Reference</span>
//       </div>
//     </div>
//   );

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
//       case 'below': return 'bg-yellow-50 border-yellow-200';
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

//   const getGenderIcon = (gender: string) => {
//     switch (gender) {
//       case 'M': return <TbGenderMale className="text-blue-500 mr-1" size={18} />;
//       case 'F': return <TbGenderFemale className="text-pink-500 mr-1" size={18} />;
//       default: return <TbGenderAgender className="text-gray-500 mr-1" size={18} />;
//     }
//   };

//   const removeReference = (testName: string, index: number) => {
//     setRemovedReferences(prev => ({
//       ...prev,
//       [testName]: [...(prev[testName] || []), index]
//     }));
//   };

//   const restoreReference = (testName: string, index: number) => {
//     setRemovedReferences(prev => ({
//       ...prev,
//       [testName]: (prev[testName] || []).filter(i => i !== index)
//     }));
//   };

//   const isReferenceRemoved = (testName: string, index: number) => {
//     return (removedReferences[testName] || []).includes(index);
//   };

//   const fetchTestDataAndReport = async () => {
//     try {
//       if (!currentLab?.id) return;
//       setLoading(true);

//       // 1. First fetch the existing report data
//       const existingReport = await getReportData(currentLab.id.toString(), editPatient.visitId.toString());
//       const mappedReportData: ReportData[] = existingReport.map((item) => ({
//         report_id: item.reportId !== undefined && item.reportId !== null ? String(item.reportId) : '',
//         visit_id: item.visit_id ?? item.visitId?.toString() ?? editPatient.visitId.toString(),
//         testName: item.testName,
//         testCategory: item.testCategory ?? '',
//         patientName: item.patientName ?? editPatient.patientname,
//         referenceDescription: item.referenceDescription ?? '',
//         referenceRange: item.referenceRange ?? '',
//         referenceAgeRange: item.referenceAgeRange ?? '',
//         enteredValue: item.enteredValue ?? '',
//         unit: item.unit ?? '',
//       }));
//       setExistingReportData(mappedReportData);

//       // 2. Fetch test data
//       const uniqueTestIds = Array.from(new Set(editPatient.testIds));
//       const fetchedTests = await Promise.all(
//         uniqueTestIds.map(testId => getTestById(currentLab.id.toString(), testId))
//       );

//       // 3. Fetch package data if any
//       const uniquePackageIds = Array.from(new Set(editPatient.packageIds));
//       const fetchedPackages = await Promise.all(
//         uniquePackageIds.map(packageId => getHealthPackageById(currentLab.id, packageId))
//       );

//       const packageTests = fetchedPackages.flatMap(pkg => pkg.data.tests);
//       const combinedTests = [...fetchedTests, ...packageTests.filter(
//         pkgTest => !fetchedTests.some(test => test.id === pkgTest.id)
//       )];
//       setAllTests(combinedTests);

//       // 4. Get reference ranges for all tests
//       const allTestNames = combinedTests.map(test => test.name);
//       const referenceData: Record<string, TestReferancePoint[]> = {};

//       await Promise.all(
//         allTestNames.map(async testName => {
//           const refPoints = await getTestReferanceRangeByTestName(currentLab.id.toString(), testName);
//           referenceData[testName] = Array.isArray(refPoints) ? refPoints : [refPoints];
//         })
//       );

//       // 5. Filter reference data based on patient gender
//       const filteredReferenceData: Record<string, TestReferancePoint[]> = {};
//       Object.keys(referenceData).forEach(testName => {
//         filteredReferenceData[testName] = referenceData[testName].filter(point => {
//           const patientGender = (editPatient.gender ?? 'U').toLowerCase();
//           const referenceGender = point.gender === 'M' ? 'male' : point.gender === 'F' ? 'female' : 'U';
//           return referenceGender === patientGender || referenceGender === 'U';
//         });
//       });
//       setReferencePoints(filteredReferenceData);

//       // 6. Now that we have all data, initialize the input values
//       const initialInputValues: Record<string, Record<number, string>> = {};

//       mappedReportData.forEach(reportItem => {
//         const refPoints = filteredReferenceData[reportItem.testName] || [];
//         const pointIndex = refPoints.findIndex(
//           point => point.testDescription === reportItem.referenceDescription
//         );

//         if (pointIndex >= 0) {
//           if (!initialInputValues[reportItem.testName]) {
//             initialInputValues[reportItem.testName] = {};
//           }
//           initialInputValues[reportItem.testName][pointIndex] = reportItem.enteredValue;
//         }
//       });

//       setInputValues(initialInputValues);
//       setRemovedReferences({});
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to load test and report data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTestDataAndReport();
//   }, [editPatient]);

//   const handleInputChange = (testName: string, index: number, value: string) => {
//     setInputValues(prev => ({
//       ...prev,
//       [testName]: {
//         ...prev[testName],
//         [index]: value
//       }
//     }));
//   };

//   const prepareReportPreview = () => {
//     const generatedReportData: ReportData[] = [];
//     let hasMissingDesc = false;

//     allTests.forEach((test) => {
//       const testInputs = inputValues[test.name] || {};
//       const referenceData = referencePoints[test.name] || [];

//       referenceData.forEach((point, index) => {
//         if (isReferenceRemoved(test.name, index)) return;

//         if (testInputs[index] || (point.testDescription && point.testDescription !== "No reference available for this test")) {
//           if (!point.testDescription || point.testDescription === "No reference available for this test") {
//             hasMissingDesc = true;
//           }

//           // Find existing report item to get its ID
//           const existingItem = existingReportData.find(
//             item => item.testName === test.name &&
//               item.referenceDescription === point.testDescription
//           );

//           generatedReportData.push({
//             report_id: existingItem?.report_id || '',
//             visit_id: editPatient.visitId.toString(),
//             testName: test.name,
//             testCategory: test.category,
//             patientName: editPatient.patientname,
//             referenceDescription: point.testDescription || "No reference description available",
//             referenceRange: `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`,
//             referenceAgeRange: `${point.ageMin ?? "N/A"} ${point.minAgeUnit ?? "YEARS"} - ${point.ageMax ?? "N/A"} ${point.maxAgeUnit ?? "YEARS"}`,
//             enteredValue: testInputs[index] || "N/A",
//             unit: point.units || "N/A",
//           });
//         }
//       });
//     });

//     setReportPreview(generatedReportData);
//     setHasMissingDescriptions(hasMissingDesc);
//     setShowConfirmation(true);
//   };

//   const handleUpdateData = async () => {
//     setLoading(true);
//     try {
//       if (!currentLab?.id) {
//         throw new Error("Lab ID is undefined");
//       }

//       await updateReports(currentLab.id, reportPreview);

//       refreshReports();
//       setShowModal(false);
//       toast.success("Report updated successfully");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to update report");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return (
//     <div className="flex flex-col items-center justify-center h-64">
//       <Loader type="progress" fullScreen={false} text="Loading report data..." />
//       <p className="mt-4 text-sm text-gray-500">Fetching test and reference data...</p>
//     </div>
//   );

//   const patientAge = editPatient.dateOfBirth ? calculateAge(editPatient.dateOfBirth) : { years: 0, months: 0, days: 0 };

//   return (
//     <div className="bg-white shadow-lg rounded-xl overflow-hidden h-[500px] overflow-y-auto p-5">
//       <ReportHeader />
//       <PatientBasicInfo patient={{
//         ...editPatient,
//         gender: editPatient.gender || '',
//         contactNumber: editPatient.contactNumber || '',
//         email: editPatient.email || '',
//         dateOfBirth: editPatient.dateOfBirth || ''
//       }} />

//       {/* Highlighted Banner for Reference Range Selection */}
//       <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 mb-6 shadow-md">
//         <div className="text-white">
//           <h3 className="text-lg font-bold mb-1 flex items-center">
//             <TbInfoCircle className="mr-2" size={20} />
//             Edit Report Data
//           </h3>
//           <p className="text-sm opacity-90">
//             Update the test values as needed. You can remove reference ranges that aren&lsquo;t relevant.
//           </p>
//           {editPatient.dateOfBirth && (
//             <p className="text-xs mt-2 bg-white/20 inline-block px-2 py-1 rounded">
//               Patient Age: <span className="font-semibold">{formatAgeDisplay(patientAge)}</span>
//             </p>
//           )}
//         </div>
//       </div>

//       <RangeIndicatorLegend />

//       <div className="space-y-5 mt-6">
//         {allTests.map((test) => (
//           <div key={test.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
//             <div className="flex items-center mb-4">
//               <TbTestPipe className="text-blue-500 mr-2" size={20} />
//               <h3 className="text-lg font-semibold text-gray-800 flex items-center">
//                 <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3 flex items-center">
//                   <TbCategory className="mr-1" size={14} />
//                   {test.category}
//                 </span>
//                 {test.name}
//               </h3>
//             </div>

//             <div className="space-y-3">
//               {referencePoints[test.name]?.length === 0 ? (
//                 <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200">
//                   <div className="flex items-center text-yellow-800">
//                     <TbInfoCircle className="mr-2" size={18} />
//                     <div>
//                       <p className="font-medium">No reference ranges found for this patient&lsquo;s gender</p>
//                       <p className="text-sm">Please check the test configuration or contact support</p>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 referencePoints[test.name]?.map((point, index) => {
//                   if (isReferenceRemoved(test.name, index)) {
//                     return (
//                       <div key={index} className="p-4 rounded-lg border bg-gray-100 border-gray-300 relative">
//                         <div className="absolute top-2 right-2">
//                           <button
//                             onClick={() => restoreReference(test.name, index)}
//                             className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
//                             title="Restore this reference"
//                           >
//                             <TbX className="rotate-45" size={18} />
//                           </button>
//                         </div>
//                         <div className="flex items-center text-gray-500">
//                           <TbClipboardText className="mr-2" size={18} />
//                           <p className="italic">Reference range removed</p>
//                         </div>
//                       </div>
//                     );
//                   }

//                   if (point.testDescription === "No reference available for this test") {
//                     const currentValue = inputValues[test.name]?.[index] || '';
//                     const status = getValueStatus(
//                       currentValue,
//                       point.minReferenceRange,
//                       point.maxReferenceRange
//                     );

//                     return (
//                       <div
//                         key={index}
//                         className={`p-4 rounded-lg border ${getStatusColor(status)} transition-all relative`}
//                       >
//                         <div className="absolute top-2 right-2">
//                           <button
//                             onClick={() => removeReference(test.name, index)}
//                             className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-gray-100"
//                             title="Remove this reference"
//                           >
//                             <TbX size={18} />
//                           </button>
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
//                           <div className="flex items-start">
//                             <TbClipboardText className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                             <div>
//                               <p className="font-medium text-gray-600">Description</p>
//                               <p className="text-gray-800 italic">This test doesn&lsquo;t have digital references. Results will be provided separately.</p>
//                             </div>
//                           </div>
//                           <div className="flex items-start">
//                             <TbChartLine className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                             <div>
//                               <p className="font-medium text-gray-600">Reference Range</p>
//                               <p className="text-gray-800">
//                                 {point.minReferenceRange ?? 'N/A'} - {point.maxReferenceRange ?? 'N/A'} {point.units && (
//                                   <span className="text-gray-500 flex items-center">
//                                     <TbRuler className="ml-1" size={14} />
//                                   </span>
//                                 )}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="flex items-start">
//                             <TbCalendarTime className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                             <div>
//                               <p className="font-medium text-gray-600">Age Range</p>
//                               <p className="text-gray-800">
//                                 {point.ageMin ?? 'N/A'} {point.minAgeUnit ?? 'YEARS'} - {point.ageMax ?? 'N/A'} {point.maxAgeUnit ?? 'YEARS'}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="flex items-start">
//                             {getGenderIcon(point.gender)}
//                             <div>
//                               <p className="font-medium text-gray-600">Gender</p>
//                               <p className="text-gray-800">
//                                 {point.gender === 'M' ? 'Male' : point.gender === 'F' ? 'Female' : 'Unisex'}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="flex items-center">
//                             <div className="flex-1">
//                               <div className="flex items-center mb-1">
//                                 <TbNumbers className="text-gray-500 mr-2" size={18} />
//                                 <p className="font-medium text-gray-600">Enter Value</p>
//                               </div>
//                               <div className="flex items-center">
//                                 {getStatusIcon(status)}
//                                 <input
//                                   type="text"
//                                   className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
//                                   placeholder="Enter value"
//                                   value={currentValue}
//                                   onChange={(e) => handleInputChange(test.name, index, e.target.value)}
//                                 />
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   }

//                   if (!point.testDescription || point.testDescription.trim() === '') {
//                     return (
//                       <div key={index} className="p-4 rounded-lg border bg-gray-50 border-gray-200">
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
//                           <div className="flex items-start">
//                             <TbClipboardText className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                             <div>
//                               <p className="font-medium text-gray-600">Description</p>
//                               <p className="text-gray-800 italic">No description available</p>
//                             </div>
//                           </div>
//                           <div className="flex items-start">
//                             <TbChartLine className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                             <div>
//                               <p className="font-medium text-gray-600">Reference Range</p>
//                               <p className="text-gray-800">
//                                 {point.minReferenceRange ?? 'N/A'} - {point.maxReferenceRange ?? 'N/A'} {point.units && (
//                                   <span className="text-gray-500 flex items-center">
//                                     <TbRuler className="ml-1" size={14} />
//                                   </span>
//                                 )}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="flex items-start">
//                             <TbCalendarTime className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                             <div>
//                               <p className="font-medium text-gray-600">Age Range</p>
//                               <p className="text-gray-800">
//                                 {point.ageMin ?? 'N/A'} {point.minAgeUnit ?? 'YEARS'} - {point.ageMax ?? 'N/A'} {point.maxAgeUnit ?? 'YEARS'}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="flex items-start">
//                             {getGenderIcon(point.gender)}
//                             <div>
//                               <p className="font-medium text-gray-600">Gender</p>
//                               <p className="text-gray-800">
//                                 {point.gender === 'M' ? 'Male' : point.gender === 'F' ? 'Female' : 'Unisex'}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="mt-3 text-sm text-gray-600">
//                           <p>This test has no reference description. You can:</p>
//                           <ul className="list-disc pl-5 mt-1 space-y-1">
//                             <li>Add the reference manually in the system</li>
//                             <li>This test might be machine-generated with results provided separately</li>
//                             <li>Check with the lab for the reference sheet or hard copy</li>
//                           </ul>
//                         </div>
//                       </div>
//                     );
//                   }

//                   const currentValue = inputValues[test.name]?.[index] || '';
//                   const status = getValueStatus(
//                     currentValue,
//                     point.minReferenceRange,
//                     point.maxReferenceRange
//                   );

//                   return (
//                     <div
//                       key={index}
//                       className={`p-4 rounded-lg border ${getStatusColor(status)} transition-all relative`}
//                     >
//                       <div className="absolute top-2 right-2">
//                         <button
//                           onClick={() => removeReference(test.name, index)}
//                           className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-gray-100"
//                           title="Remove this reference"
//                         >
//                           <TbX size={18} />
//                         </button>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
//                         <div className="flex items-start">
//                           <TbClipboardText className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                           <div>
//                             <p className="font-medium text-gray-600">Description</p>
//                             <p className="text-gray-800">{point.testDescription}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-start">
//                           <TbChartLine className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                           <div>
//                             <p className="font-medium text-gray-600">Reference Range</p>
//                             <p className="text-gray-800">
//                               {point.minReferenceRange ?? 'N/A'} - {point.maxReferenceRange ?? 'N/A'} {point.units && (
//                                 <span className="text-gray-500 flex items-center">
//                                   <TbRuler className="ml-1" size={14} />
//                                 </span>
//                               )}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex items-start">
//                           <TbCalendarTime className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
//                           <div>
//                             <p className="font-medium text-gray-600">Age Range</p>
//                             <p className="text-gray-800">
//                               {point.ageMin ?? 'N/A'} {point.minAgeUnit ?? 'YEARS'} - {point.ageMax ?? 'N/A'} {point.maxAgeUnit ?? 'YEARS'}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex items-start">
//                           {getGenderIcon(point.gender)}
//                           <div>
//                             <p className="font-medium text-gray-600">Gender</p>
//                             <p className="text-gray-800">
//                               {point.gender === 'M' ? 'Male' : point.gender === 'F' ? 'Female' : 'Unisex'}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="flex items-center">
//                           <div className="flex-1">
//                             <div className="flex items-center mb-1">
//                               <TbNumbers className="text-gray-500 mr-2" size={18} />
//                               <p className="font-medium text-gray-600">Enter Value</p>
//                             </div>
//                             <div className="flex items-center">
//                               {getStatusIcon(status)}
//                               <input
//                                 type="text"
//                                 className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
//                                 placeholder="Enter value"
//                                 value={currentValue}
//                                 onChange={(e) => handleInputChange(test.name, index, e.target.value)}
//                               />
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 mt-6">
//         <button
//           onClick={prepareReportPreview}
//           className="w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center"
//         >
//           <TbReportMedical className="mr-2" size={18} />
//           Preview Report Updates
//         </button>
//       </div>

//       {/* Confirmation Modal */}
//       {showConfirmation && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
//             <div className="p-6">
//               <h3 className="text-xl font-bold mb-4 flex items-center">
//                 <TbInfoCircle className="text-blue-500 mr-2" size={24} />
//                 {hasMissingDescriptions ? "Important Note About Test References" : "Confirm Report Updates"}
//               </h3>

//               {hasMissingDescriptions ? (
//                 <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
//                   <div className="flex">
//                     <div className="flex-shrink-0">
//                       <TbInfoCircle className="h-5 w-5 text-yellow-400" />
//                     </div>
//                     <div className="ml-3">
//                       <p className="text-sm text-yellow-700 font-medium mb-2">
//                         Note about tests without reference descriptions:
//                       </p>
//                       <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700">
//                         <li>Some tests ({reportPreview.filter(item => !item.referenceDescription || item.referenceDescription === "No reference description available").length}) don&lsquo;t have digital references available</li>
//                         <li>These tests might be machine-generated or have hard copy references</li>
//                         <li>The results will be provided separately at the reception</li>
//                         <li>Please inform the patient to collect all results from the reception desk</li>
//                       </ul>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
//                   <div className="flex">
//                     <div className="flex-shrink-0">
//                       <TbSquareRoundedCheck className="h-5 w-5 text-green-400" />
//                     </div>
//                     <div className="ml-3">
//                       <p className="text-sm text-green-700">
//                         All test references have complete descriptions. Please review the updates before submitting.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {reportPreview.length > 0 ? (
//                 <div className="mb-6">
//                   <h4 className="font-medium mb-2">Report Updates Preview:</h4>
//                   <div className="border rounded-lg overflow-hidden">
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
//                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
//                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {reportPreview.map((item, idx) => (
//                           <tr key={idx} className={!item.referenceDescription || item.referenceDescription === "No reference description available" ? "bg-yellow-50" : ""}>
//                             <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.testName}</td>
//                             <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
//                               {item.referenceDescription || "Reference details not available - will be provided separately"}
//                             </td>
//                             <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.enteredValue} {item.unit}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//                   <div className="flex items-center">
//                     <TbInfoCircle className="text-blue-500 mr-3" size={24} />
//                     <div>
//                       <h4 className="font-medium text-blue-800">No test values entered</h4>
//                       <p className="text-sm text-blue-700 mt-1">
//                         This report will be updated without any test data changes. 
//                         The results might be provided separately as hard copies at the reception.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowConfirmation(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleUpdateData}
//                   className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
//                 >
//                   Confirm Updates
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PatientReportDataEdit;









//------------------------------------------------------



import React, { useEffect, useState } from 'react';
import {
  TbArrowDownCircle, TbArrowUpCircle, TbCalendarTime, TbCategory,
  TbChartLine, TbClipboardText, TbGenderAgender, TbGenderFemale,
  TbGenderMale, TbInfoCircle, TbNumbers, TbReportMedical,
  TbRuler, TbSquareRoundedCheck, TbTestPipe, TbX
} from "react-icons/tb";
import { toast } from 'react-toastify';
import Loader from '@/app/(admin)/component/common/Loader';
import { useLabs } from '@/context/LabContext';
import { getHealthPackageById } from '@/../services/packageServices';
import { getReportData, updateReports } from '@/../services/reportServices';
import { getTestById, getTestReferanceRangeByTestName } from '@/../services/testService';
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
}

interface TestReferancePoint {
  testDescription: string;
  minReferenceRange: number | null;
  maxReferenceRange: number | null;
  ageMin: number | null;
  ageMax: number | null;
  minAgeUnit?: string;
  maxAgeUnit?: string;
  gender: string;
  units: string;
}

interface TestList {
  id: number;
  name: string;
  category: string;
}

interface PatientReportDataEditProps {
  editPatient: Patient;
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
  const [removedReferences, setRemovedReferences] = useState<Record<string, number[]>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reportPreview, setReportPreview] = useState<ReportData[]>([]);
  const [hasMissingDescriptions, setHasMissingDescriptions] = useState(false);

  const calculateAge = (dob: string) => {
    if (!dob) return { years: 0, months: 0, days: 0 };
    const birthDate = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  };

  const formatAgeDisplay = (age: { years: number; months: number; days: number }) => {
    if (age.years > 0) {
      return `${age.years} year${age.years > 1 ? 's' : ''} ${age.months > 0 ? `${age.months} month${age.months > 1 ? 's' : ''}` : ''}`;
    } else if (age.months > 0) {
      return `${age.months} month${age.months > 1 ? 's' : ''} ${age.days > 0 ? `${age.days} day${age.days > 1 ? 's' : ''}` : ''}`;
    } else {
      return `${age.days} day${age.days !== 1 ? 's' : ''}`;
    }
  };

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
        <span>Above Normal</span>
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

  const removeReference = (testName: string, index: number) => {
    setRemovedReferences(prev => ({
      ...prev,
      [testName]: [...(prev[testName] || []), index]
    }));
  };

  const restoreReference = (testName: string, index: number) => {
    setRemovedReferences(prev => ({
      ...prev,
      [testName]: (prev[testName] || []).filter(i => i !== index)
    }));
  };

  const isReferenceRemoved = (testName: string, index: number) => {
    return (removedReferences[testName] || []).includes(index);
  };

  const fetchTestDataAndReport = async () => {
    try {
      if (!currentLab?.id) return;
      setLoading(true);

      // 1. First fetch the existing report data
      const existingReport = await getReportData(currentLab.id.toString(), editPatient.visitId.toString());
      const mappedReportData: ReportData[] = existingReport.map((item) => ({
        report_id: item.reportId !== undefined && item.reportId !== null ? String(item.reportId) : '',
        visit_id: item.visit_id ?? item.visitId?.toString() ?? editPatient.visitId.toString(),
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

      // 2. Fetch test data
      const uniqueTestIds = Array.from(new Set(editPatient.testIds));
      const fetchedTests = await Promise.all(
        uniqueTestIds.map(testId => getTestById(currentLab.id.toString(), testId))
      );

      // 3. Fetch package data if any
      const uniquePackageIds = Array.from(new Set(editPatient.packageIds));
      const fetchedPackages = await Promise.all(
        uniquePackageIds.map(packageId => getHealthPackageById(currentLab.id, packageId))
      );

      const packageTests = fetchedPackages.flatMap(pkg => pkg.data.tests);
      const combinedTests = [...fetchedTests, ...packageTests.filter(
        pkgTest => !fetchedTests.some(test => test.id === pkgTest.id)
      )];
      setAllTests(combinedTests);

      // 4. Get reference ranges for all tests
      const allTestNames = combinedTests.map(test => test.name);
      const referenceData: Record<string, TestReferancePoint[]> = {};

      await Promise.all(
        allTestNames.map(async testName => {
          const refPointsRaw = await getTestReferanceRangeByTestName(currentLab.id.toString(), testName);
          const refPointsArr = Array.isArray(refPointsRaw) ? refPointsRaw : [refPointsRaw];
          // Normalize all properties to match TestReferancePoint type
          referenceData[testName] = refPointsArr.map((point) => ({
            ...point,
            ageMin: point.ageMin === undefined ? null : point.ageMin,
            ageMax: point.ageMax === undefined ? null : point.ageMax,
            minReferenceRange: point.minReferenceRange === undefined ? null : point.minReferenceRange,
            maxReferenceRange: point.maxReferenceRange === undefined ? null : point.maxReferenceRange,
          }));
        })
      );

      // 5. Filter reference data based on patient gender
      const filteredReferenceData: Record<string, TestReferancePoint[]> = {};
      Object.keys(referenceData).forEach(testName => {
        filteredReferenceData[testName] = referenceData[testName].filter(point => {
          const patientGender = (editPatient.gender ?? 'U').toLowerCase();
          const referenceGender = point.gender === 'M' ? 'male' : point.gender === 'F' ? 'female' : 'U';
          return referenceGender === patientGender || referenceGender === 'U';
        });
      });
      setReferencePoints(filteredReferenceData);

      // 6. Now that we have all data, initialize the input values
      const initialInputValues: Record<string, Record<number, string>> = {};

      mappedReportData.forEach(reportItem => {
        const refPoints = filteredReferenceData[reportItem.testName] || [];
        const pointIndex = refPoints.findIndex(
          point => point.testDescription === reportItem.referenceDescription
        );

        if (pointIndex >= 0) {
          if (!initialInputValues[reportItem.testName]) {
            initialInputValues[reportItem.testName] = {};
          }
          initialInputValues[reportItem.testName][pointIndex] = reportItem.enteredValue;
        }
      });

      setInputValues(initialInputValues);
      setRemovedReferences({});
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
    setInputValues(prev => ({
      ...prev,
      [testName]: {
        ...prev[testName],
        [index]: value
      }
    }));
  };

  const prepareReportPreview = () => {
    const generatedReportData: ReportData[] = [];
    let hasMissingDesc = false;

    allTests.forEach((test) => {
      const testInputs = inputValues[test.name] || {};
      const referenceData = referencePoints[test.name] || [];

      referenceData.forEach((point, index) => {
        if (isReferenceRemoved(test.name, index)) return;

        if (testInputs[index] || (point.testDescription && point.testDescription !== "No reference available for this test")) {
          if (!point.testDescription || point.testDescription === "No reference available for this test") {
            hasMissingDesc = true;
          }

          // Find existing report item to get its ID
          const existingItem = existingReportData.find(
            item => item.testName === test.name &&
              item.referenceDescription === point.testDescription
          );

          generatedReportData.push({
            report_id: existingItem?.report_id || '',
            visit_id: editPatient.visitId.toString(),
            testName: test.name,
            testCategory: test.category,
            patientName: editPatient.patientname,
            referenceDescription: point.testDescription || "No reference description available",
            referenceRange: `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`,
            referenceAgeRange: `${point.ageMin ?? "N/A"} ${point.minAgeUnit ?? "YEARS"} - ${point.ageMax ?? "N/A"} ${point.maxAgeUnit ?? "YEARS"}`,
            enteredValue: testInputs[index] || "N/A",
            unit: point.units || "N/A",
          });
        }
      });
    });

    setReportPreview(generatedReportData);
    setHasMissingDescriptions(hasMissingDesc);
    setShowConfirmation(true);
  };

  const handleUpdateData = async () => {
    setLoading(true);
    try {
      if (!currentLab?.id) {
        throw new Error("Lab ID is undefined");
      }

      await updateReports(currentLab.id, reportPreview);

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader type="progress" fullScreen={false} text="Loading report data..." />
      <p className="mt-4 text-sm text-gray-500">Fetching test and reference data...</p>
    </div>
  );

  const patientAge = editPatient.dateOfBirth ? calculateAge(editPatient.dateOfBirth) : { years: 0, months: 0, days: 0 };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden h-[500px] overflow-y-auto p-5">
      <ReportHeader />
      <PatientBasicInfo patient={{
        ...editPatient,
        gender: editPatient.gender || '',
        contactNumber: editPatient.contactNumber || '',
        email: editPatient.email || '',
        dateOfBirth: editPatient.dateOfBirth || ''
      }} />

      {/* Highlighted Banner for Reference Range Selection */}
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 mb-6 shadow-md">
        <div className="text-white">
          <h3 className="text-lg font-bold mb-1 flex items-center">
            <TbInfoCircle className="mr-2" size={20} />
            Edit Report Data
          </h3>
          <p className="text-sm opacity-90">
            Update the test values as needed. You can remove reference ranges that aren&lsquo;t relevant.
          </p>
          {editPatient.dateOfBirth && (
            <p className="text-xs mt-2 bg-white/20 inline-block px-2 py-1 rounded">
              Patient Age: <span className="font-semibold">{formatAgeDisplay(patientAge)}</span>
            </p>
          )}
        </div>
      </div>

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
              {referencePoints[test.name]?.length === 0 ? (
                <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200">
                  <div className="flex items-center text-yellow-800">
                    <TbInfoCircle className="mr-2" size={18} />
                    <div>
                      <p className="font-medium">No reference ranges found for this patient&lsquo;s gender</p>
                      <p className="text-sm">Please check the test configuration or contact support</p>
                    </div>
                  </div>
                </div>
              ) : (
                referencePoints[test.name]?.map((point, index) => {
                  if (isReferenceRemoved(test.name, index)) {
                    return (
                      <div key={index} className="p-4 rounded-lg border bg-gray-100 border-gray-300 relative">
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => restoreReference(test.name, index)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                            title="Restore this reference"
                          >
                            <TbX className="rotate-45" size={18} />
                          </button>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <TbClipboardText className="mr-2" size={18} />
                          <p className="italic">Reference range removed</p>
                        </div>
                      </div>
                    );
                  }

                  if (point.testDescription === "No reference available for this test") {
                    const currentValue = inputValues[test.name]?.[index] || '';
                    const status = getValueStatus(
                      currentValue,
                      point.minReferenceRange,
                      point.maxReferenceRange
                    );

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getStatusColor(status)} transition-all relative`}
                      >
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => removeReference(test.name, index)}
                            className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-gray-100"
                            title="Remove this reference"
                          >
                            <TbX size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                          <div className="flex items-start">
                            <TbClipboardText className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-600">Description</p>
                              <p className="text-gray-800 italic">This test doesn&lsquo;t have digital references. Results will be provided separately.</p>
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
                                {point.ageMin ?? 'N/A'} {point.minAgeUnit ?? 'YEARS'} - {point.ageMax ?? 'N/A'} {point.maxAgeUnit ?? 'YEARS'}
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
                                  className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
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
                  }

                  if (!point.testDescription || point.testDescription.trim() === '') {
                    return (
                      <div key={index} className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-start">
                            <TbClipboardText className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-600">Description</p>
                              <p className="text-gray-800 italic">No description available</p>
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
                                {point.ageMin ?? 'N/A'} {point.minAgeUnit ?? 'YEARS'} - {point.ageMax ?? 'N/A'} {point.maxAgeUnit ?? 'YEARS'}
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
                        </div>
                        <div className="mt-3 text-sm text-gray-600">
                          <p>This test has no reference description. You can:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>Add the reference manually in the system</li>
                            <li>This test might be machine-generated with results provided separately</li>
                            <li>Check with the lab for the reference sheet or hard copy</li>
                          </ul>
                        </div>
                      </div>
                    );
                  }

                  const currentValue = inputValues[test.name]?.[index] || '';
                  const status = getValueStatus(
                    currentValue,
                    point.minReferenceRange,
                    point.maxReferenceRange
                  );

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getStatusColor(status)} transition-all relative`}
                    >
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => removeReference(test.name, index)}
                          className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-gray-100"
                          title="Remove this reference"
                        >
                          <TbX size={18} />
                        </button>
                      </div>
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
                              {point.ageMin ?? 'N/A'} {point.minAgeUnit ?? 'YEARS'} - {point.ageMax ?? 'N/A'} {point.maxAgeUnit ?? 'YEARS'}
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
                                className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
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
                })
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 mt-6">
        <button
          onClick={prepareReportPreview}
          className="w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center"
        >
          <TbReportMedical className="mr-2" size={18} />
          Preview Report Updates
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <TbInfoCircle className="text-blue-500 mr-2" size={24} />
                {hasMissingDescriptions ? "Important Note About Test References" : "Confirm Report Updates"}
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
                        <li>Some tests ({reportPreview.filter(item => !item.referenceDescription || item.referenceDescription === "No reference description available").length}) don&lsquo;t have digital references available</li>
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
                      <TbSquareRoundedCheck className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        All test references have complete descriptions. Please review the updates before submitting.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {reportPreview.length > 0 ? (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Report Updates Preview:</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportPreview.map((item, idx) => (
                          <tr key={idx} className={!item.referenceDescription || item.referenceDescription === "No reference description available" ? "bg-yellow-50" : ""}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.testName}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {item.referenceDescription || "Reference details not available - will be provided separately"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.enteredValue} {item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <TbInfoCircle className="text-blue-500 mr-3" size={24} />
                    <div>
                      <h4 className="font-medium text-blue-800">No test values entered</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        This report will be updated without any test data changes. 
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
                  onClick={handleUpdateData}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Confirm Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientReportDataEdit;