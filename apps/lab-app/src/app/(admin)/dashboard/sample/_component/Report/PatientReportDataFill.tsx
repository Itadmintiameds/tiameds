// // import { getHealthPackageById } from '@/../services/packageServices';
// // import { createReport } from '@/../services/reportServices';
// // import { getTestById, getTestReferanceRangeByTestName } from '@/../services/testService';
// // import Loader from '@/app/(admin)/component/common/Loader';
// // import { useLabs } from '@/context/LabContext';
// // import { PatientData } from '@/types/sample/sample';
// // import { TestList, TestReferancePoint } from '@/types/test/testlist';
// // import React, { useEffect, useState } from 'react';
// // import { toast } from 'react-toastify';
// // import PatientBasicInfo from './PatientBasicInfo';
// // import ReportHeader from './ReportHeader';
// // import { TbReportMedical } from "react-icons/tb";

// // interface ReportData {
// //   visit_id: string;
// //   testName: string;
// //   testCategory: string;
// //   patientName: string;
// //   referenceDescription: string;
// //   referenceRange: string;
// //   referenceAgeRange: string;
// //   enteredValue: string;
// //   unit: string;
// // }

// // interface PatientReportDataFillProps {
// //   patientList: PatientData[];
// //   updateCollectionTable: boolean;
// //   setShowModal: (value: React.SetStateAction<boolean>) => void;
// //   setUpdateCollectionTable: (value: React.SetStateAction<boolean>) => void;
// // }
// // const PatientReportDataFill: React.FC<PatientReportDataFillProps> = ({ patientList, setUpdateCollectionTable, setShowModal }) => {
// //   const { currentLab } = useLabs();
// //   const [loading, setLoading] = useState(false);
// //   const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
// //   const [inputValues, setInputValues] = useState<Record<string, Record<number, string>>>({});
// //   const [allTests, setAllTests] = useState<TestList[]>([]);

// //   const fetchTestDataAndPackage = async () => {
// //     try {
// //       if (!currentLab?.id) return;
// //       setLoading(true);
// //       const uniqueTestIds = Array.from(new Set(patientList.flatMap((visit) => visit.testIds)));
// //       const fetchedTests = await Promise.all(
// //         uniqueTestIds.map((testId) => getTestById(currentLab.id.toString(), testId))
// //       );
// //       const uniquePackageIds = Array.from(new Set(patientList.flatMap((visit) => visit.packageIds)));
// //       const fetchedPackages = await Promise.all(
// //         uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId))
// //       );
// //       const formattedPackages = fetchedPackages.map((pkg) => pkg.data);
// //       const packageTests = formattedPackages.flatMap((pkg) => pkg.tests);
// //       const combinedTests = [...fetchedTests, ...packageTests.filter(
// //         (pkgTest) => !fetchedTests.some((test) => test.id === pkgTest.id)
// //       )];
// //       setAllTests(combinedTests);
// //       const allTestNames = combinedTests.map((test) => test.name);
// //       const referenceData: Record<string, TestReferancePoint[]> = {};
// //       await Promise.all(
// //         allTestNames.map(async (testName) => {
// //           const refPoints = await getTestReferanceRangeByTestName(currentLab.id.toString(), testName);
// //           referenceData[testName] = Array.isArray(refPoints) ? refPoints : [refPoints];
// //         })
// //       );

// //       const filteredReferenceData: Record<string, TestReferancePoint[]> = {};
// //       Object.keys(referenceData).forEach((testName) => {
// //         filteredReferenceData[testName] = referenceData[testName].filter((point) =>
// //           patientList.some((patient) => {
// //             const patientGender = patient.gender.toLowerCase();
// //             const referenceGender = point.gender === 'M' ? 'male' : point.gender === 'F' ? 'female' : 'U';
// //             return referenceGender === patientGender || referenceGender === 'U';
// //           })
// //         );
// //       });

// //       setReferencePoints(filteredReferenceData);
// //     } catch (error) {
// //       console.error(error);
// //       toast.error("Failed to load test and package data");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchTestDataAndPackage();
// //   }, [patientList]);

// //   const handleInputChange = (testName: string, index: number, value: string) => {
// //     setInputValues((prev) => ({
// //       ...prev,
// //       [testName]: {
// //         ...prev[testName],
// //         [index]: value
// //       }
// //     }));
// //   };

// //   const handleCreateData = async () => {
// //     if (!Object.keys(inputValues).length) {
// //       toast.warn("Please enter values before submitting");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const generatedReportData: ReportData[] = [];

// //       patientList.forEach((patient) => {
// //         allTests.forEach((test) => {
// //           const testInputs = inputValues[test.name] || {};
// //           const referenceData = referencePoints[test.name] || [];

// //           referenceData.forEach((point, index) => {
// //             const enteredValue = testInputs[index];
// //             if (!enteredValue) return;

// //             generatedReportData.push({
// //               visit_id: patient.visitId.toString(),
// //               testName: test.name,
// //               testCategory: test.category,
// //               patientName: patient.patientname,
// //               referenceDescription: point.testDescription || "N/A",
// //               referenceRange: `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`,
// //               referenceAgeRange: `${point.ageMin ?? "N/A"} - ${point.ageMax ?? "N/A"}`,
// //               enteredValue: enteredValue,
// //               unit: point.units || "N/A",
// //             });
// //           });
// //         });
// //       });
// //       setUpdateCollectionTable(true);
// //       await createReport(currentLab?.id.toString() || '', generatedReportData);
// //       setUpdateCollectionTable(false);
// //       setShowModal(false);
// //       toast.success("Report created successfully");
// //     } catch (error) {
// //       console.error(error);
// //       toast.error("Failed to create report");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (loading) return <Loader />;

// //   return (
// //     <div className="bg-white shadow-xl rounded-2xl overflow-hidden h-[500px] overflow-y-auto p-6">
      
// //       <ReportHeader />
// //       <PatientBasicInfo patientList={patientList} />
// //       <div>
// //         {allTests.map((test) => (
// //           <div
// //             key={test.id}
// //             className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-md border">
// //             <h3 className="text-sm font-semibold text-blue-900 bg-blue-200 px-4 py-2 rounded-lg inline-block shadow">
// //               {test.name}
// //             </h3>
// //             <div className="mt-4 space-y-3">
// //               {referencePoints[test.name]?.map((point, index) => (
// //                 <div
// //                   key={index}
// //                   className={`flex flex-wrap items-center p-4 rounded-lg border shadow-sm transition-all 
// //                           ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
// //                   <div className="w-1/3 px-3 text-sm">

// //                     {/* <strong className="text-red-700">Description:</strong> {point.id}  */}
// //                     <strong className="text-gray-700">Description:</strong> {point.testDescription}
// //                   </div>
// //                   <div className="w-1/6 px-3 text-sm">
// //                     <strong className="text-gray-700">Gender:</strong> {point.gender === 'M' ? 'Male' : 'Female'}
// //                   </div>
// //                   <div className="w-1/6 px-3 text-sm">
// //                     <strong className="text-gray-700">Min:</strong> <span className="text-green-600">{point.minReferenceRange}</span>
// //                   </div>
// //                   <div className="w-1/6 px-3 text-sm">
// //                     <strong className="text-gray-700">Max:</strong> <span className="text-red-600">{point.maxReferenceRange}</span>
// //                   </div>
// //                   <div className="w-1/6 px-3 text-sm">
// //                     <strong className="text-gray-700">Units:</strong> {point.units}
// //                   </div>
// //                   <div className="w-1/4 px-3 text-sm">
// //                     <strong className="text-gray-700">Age:</strong> {point.ageMin} - {point.ageMax} years
// //                   </div>
// //                   <input
// //                     type="text"
// //                     className="border border-gray-300 rounded-md p-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto shadow-sm"
// //                     placeholder="Enter value"
// //                     value={inputValues[test.name]?.[index] || ''}
// //                     onChange={(e) => handleInputChange(test.name, index, e.target.value)}
// //                   />
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //       <div className="flex justify-center">
// //         <button
// //           onClick={handleCreateData}
// //           className="bg-blue-500 text-white px-6 py-2 rounded-lg  shadow-md hover:bg-blue-700 right-4">
// //           <TbReportMedical className='inline-block mr-2' />
// //           Report
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default PatientReportDataFill;







// import { getHealthPackageById } from '@/../services/packageServices';
// import { createReport } from '@/../services/reportServices';
// import { getTestById, getTestReferanceRangeByTestName } from '@/../services/testService';
// import Loader from '@/app/(admin)/component/common/Loader';
// import { useLabs } from '@/context/LabContext';
// import { PatientData } from '@/types/sample/sample';
// import { TestList, TestReferancePoint } from '@/types/test/testlist';
// import React, { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
// import PatientBasicInfo from './PatientBasicInfo';
// import ReportHeader from './ReportHeader';
// import { TbReportMedical } from "react-icons/tb";

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
// }

// interface PatientReportDataFillProps {
//   patientList: PatientData[];
//   updateCollectionTable: boolean;
//   setShowModal: (value: React.SetStateAction<boolean>) => void;
//   setUpdateCollectionTable: (value: React.SetStateAction<boolean>) => void;
// }

// const PatientReportDataFill: React.FC<PatientReportDataFillProps> = ({ patientList, setUpdateCollectionTable, setShowModal }) => {
//   const { currentLab } = useLabs();
//   const [loading, setLoading] = useState(false);
//   const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
//   const [inputValues, setInputValues] = useState<Record<string, Record<number, string>>>({});
//   const [allTests, setAllTests] = useState<TestList[]>([]);

//   // Color coding explanation
//   const RangeIndicatorLegend = () => (
//     <div className="flex flex-wrap items-center justify-center gap-4 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
//       <div className="flex items-center text-sm">
//         <div className="w-3 h-3 rounded-full bg-green-100 border border-green-400 mr-2"></div>
//         <span>Normal Range</span>
//       </div>
//       <div className="flex items-center text-sm">
//         <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-400 mr-2"></div>
//         <span>Below Normal</span>
//       </div>
//       <div className="flex items-center text-sm">
//         <div className="w-3 h-3 rounded-full bg-red-100 border border-red-400 mr-2"></div>
//         <span>Above Normal</span>
//       </div>
//       <div className="flex items-center text-sm">
//         <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-400 mr-2"></div>
//         <span>No Reference Available</span>
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

//   const getStatusTextColor = (status: string) => {
//     switch (status) {
//       case 'below': return 'text-yellow-700';
//       case 'above': return 'text-red-700';
//       case 'normal': return 'text-green-700';
//       default: return 'text-blue-700';
//     }
//   };

//   const fetchTestDataAndPackage = async () => {
//     try {
//       if (!currentLab?.id) return;
//       setLoading(true);
//       const uniqueTestIds = Array.from(new Set(patientList.flatMap((visit) => visit.testIds)));
//       const fetchedTests = await Promise.all(
//         uniqueTestIds.map((testId) => getTestById(currentLab.id.toString(), testId))
//       );
//       const uniquePackageIds = Array.from(new Set(patientList.flatMap((visit) => visit.packageIds)));
//       const fetchedPackages = await Promise.all(
//         uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId))
//       );
//       const formattedPackages = fetchedPackages.map((pkg) => pkg.data);
//       const packageTests = formattedPackages.flatMap((pkg) => pkg.tests);
//       const combinedTests = [...fetchedTests, ...packageTests.filter(
//         (pkgTest) => !fetchedTests.some((test) => test.id === pkgTest.id)
//       )];
//       setAllTests(combinedTests);
//       const allTestNames = combinedTests.map((test) => test.name);
//       const referenceData: Record<string, TestReferancePoint[]> = {};
//       await Promise.all(
//         allTestNames.map(async (testName) => {
//           const refPoints = await getTestReferanceRangeByTestName(currentLab.id.toString(), testName);
//           referenceData[testName] = Array.isArray(refPoints) ? refPoints : [refPoints];
//         })
//       );

//       const filteredReferenceData: Record<string, TestReferancePoint[]> = {};
//       Object.keys(referenceData).forEach((testName) => {
//         filteredReferenceData[testName] = referenceData[testName].filter((point) =>
//           patientList.some((patient) => {
//             const patientGender = patient.gender.toLowerCase();
//             const referenceGender = point.gender === 'M' ? 'male' : point.gender === 'F' ? 'female' : 'U';
//             return referenceGender === patientGender || referenceGender === 'U';
//           })
//         );
//       });

//       setReferencePoints(filteredReferenceData);
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to load test and package data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTestDataAndPackage();
//   }, [patientList]);

//   const handleInputChange = (testName: string, index: number, value: string) => {
//     setInputValues((prev) => ({
//       ...prev,
//       [testName]: {
//         ...prev[testName],
//         [index]: value
//       }
//     }));
//   };

//   const handleCreateData = async () => {
//     if (!Object.keys(inputValues).length) {
//       toast.warn("Please enter values before submitting");
//       return;
//     }

//     setLoading(true);
//     try {
//       const generatedReportData: ReportData[] = [];

//       patientList.forEach((patient) => {
//         allTests.forEach((test) => {
//           const testInputs = inputValues[test.name] || {};
//           const referenceData = referencePoints[test.name] || [];

//           referenceData.forEach((point, index) => {
//             const enteredValue = testInputs[index];
//             if (!enteredValue) return;

//             generatedReportData.push({
//               visit_id: patient.visitId.toString(),
//               testName: test.name,
//               testCategory: test.category,
//               patientName: patient.patientname,
//               referenceDescription: point.testDescription || "N/A",
//               referenceRange: `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`,
//               referenceAgeRange: `${point.ageMin ?? "N/A"} - ${point.ageMax ?? "N/A"}`,
//               enteredValue: enteredValue,
//               unit: point.units || "N/A",
//             });
//           });
//         });
//       });
//       setUpdateCollectionTable(true);
//       await createReport(currentLab?.id.toString() || '', generatedReportData);
//       setUpdateCollectionTable(false);
//       setShowModal(false);
//       toast.success("Report created successfully");
//     } catch (error) {
//       console.error(error);
//       toast.error("Failed to create report");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Loader />;

//   return (
//     <div className="bg-white shadow-lg rounded-xl overflow-hidden h-[500px] overflow-y-auto p-5">
//       <ReportHeader />
//       <RangeIndicatorLegend />
//       <PatientBasicInfo patientList={patientList} />
      
//       <div className="space-y-5 mt-6">
//         {allTests.map((test) => (
//           <div key={test.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3">
//                 {test.category}
//               </span>
//               {test.name}
//             </h3>
            
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
//                       <div>
//                         <p className="font-medium text-gray-600">Description</p>
//                         <p className="text-gray-800">{point.testDescription}</p>
//                       </div>
//                       <div>
//                         <p className="font-medium text-gray-600">Reference Range</p>
//                         <p className="text-gray-800">
//                           {point.minReferenceRange ?? 'N/A'} - {point.maxReferenceRange ?? 'N/A'} {point.units}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="font-medium text-gray-600">Age Range</p>
//                         <p className="text-gray-800">
//                           {point.ageMin ?? 'N/A'} - {point.ageMax ?? 'N/A'} years
//                         </p>
//                       </div>
//                       <div>
//                         <p className="font-medium text-gray-600">Gender</p>
//                         <p className="text-gray-800">
//                           {point.gender === 'M' ? 'Male' : point.gender === 'F' ? 'Female' : 'Unisex'}
//                         </p>
//                       </div>
//                       <div className="flex items-center">
//                         <div className="flex-1">
//                           <p className="font-medium text-gray-600">Enter Value</p>
//                           <input
//                             type="text"
//                             className={`w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 ${getStatusTextColor(status)} border-current`}
//                             placeholder="Enter value"
//                             value={currentValue}
//                             onChange={(e) => handleInputChange(test.name, index, e.target.value)}
//                           />
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
//           onClick={handleCreateData}
//           className="w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center"
//         >
//           <TbReportMedical className="mr-2" />
//           Generate Report
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PatientReportDataFill;









import { getHealthPackageById } from '@/../services/packageServices';
import { createReport } from '@/../services/reportServices';
import { getTestById, getTestReferanceRangeByTestName } from '@/../services/testService';
import Loader from '@/app/(admin)/component/common/Loader';
import { useLabs } from '@/context/LabContext';
import { PatientData } from '@/types/sample/sample';
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
}

interface PatientReportDataFillProps {
  patientList: PatientData[];
  updateCollectionTable: boolean;
  setShowModal: (value: React.SetStateAction<boolean>) => void;
  setUpdateCollectionTable: (value: React.SetStateAction<boolean>) => void;
}

const PatientReportDataFill: React.FC<PatientReportDataFillProps> = ({ patientList, setUpdateCollectionTable, setShowModal }) => {
  const { currentLab } = useLabs();
  const [loading, setLoading] = useState(false);
  const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
  const [inputValues, setInputValues] = useState<Record<string, Record<number, string>>>({});
  const [allTests, setAllTests] = useState<TestList[]>([]);

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

  const fetchTestDataAndPackage = async () => {
    try {
      if (!currentLab?.id) return;
      setLoading(true);
      const uniqueTestIds = Array.from(new Set(patientList.flatMap((visit) => visit.testIds)));
      const fetchedTests = await Promise.all(
        uniqueTestIds.map((testId) => getTestById(currentLab.id.toString(), testId))
      );
      const uniquePackageIds = Array.from(new Set(patientList.flatMap((visit) => visit.packageIds)));
      const fetchedPackages = await Promise.all(
        uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId))
      );
      const formattedPackages = fetchedPackages.map((pkg) => pkg.data);
      const packageTests = formattedPackages.flatMap((pkg) => pkg.tests);
      const combinedTests = [...fetchedTests, ...packageTests.filter(
        (pkgTest) => !fetchedTests.some((test) => test.id === pkgTest.id)
      )];
      setAllTests(combinedTests);
      const allTestNames = combinedTests.map((test) => test.name);
      const referenceData: Record<string, TestReferancePoint[]> = {};
      await Promise.all(
        allTestNames.map(async (testName) => {
          const refPoints = await getTestReferanceRangeByTestName(currentLab.id.toString(), testName);
          referenceData[testName] = Array.isArray(refPoints) ? refPoints : [refPoints];
        })
      );

      const filteredReferenceData: Record<string, TestReferancePoint[]> = {};
      Object.keys(referenceData).forEach((testName) => {
        filteredReferenceData[testName] = referenceData[testName].filter((point) =>
          patientList.some((patient) => {
            const patientGender = patient.gender.toLowerCase();
            const referenceGender = point.gender === 'M' ? 'male' : point.gender === 'F' ? 'female' : 'U';
            return referenceGender === patientGender || referenceGender === 'U';
          })
        );
      });

      setReferencePoints(filteredReferenceData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load test and package data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestDataAndPackage();
  }, [patientList]);

  const handleInputChange = (testName: string, index: number, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [testName]: {
        ...prev[testName],
        [index]: value
      }
    }));
  };

  const handleCreateData = async () => {
    if (!Object.keys(inputValues).length) {
      toast.warn("Please enter values before submitting");
      return;
    }

    setLoading(true);
    try {
      const generatedReportData: ReportData[] = [];

      patientList.forEach((patient) => {
        allTests.forEach((test) => {
          const testInputs = inputValues[test.name] || {};
          const referenceData = referencePoints[test.name] || [];

          referenceData.forEach((point, index) => {
            const enteredValue = testInputs[index];
            if (!enteredValue) return;

            generatedReportData.push({
              visit_id: patient.visitId.toString(),
              testName: test.name,
              testCategory: test.category,
              patientName: patient.patientname,
              referenceDescription: point.testDescription || "N/A",
              referenceRange: `${point.minReferenceRange ?? "N/A"} - ${point.maxReferenceRange ?? "N/A"}`,
              referenceAgeRange: `${point.ageMin ?? "N/A"} - ${point.ageMax ?? "N/A"}`,
              enteredValue: enteredValue,
              unit: point.units || "N/A",
            });
          });
        });
      });
      setUpdateCollectionTable(true);
      await createReport(currentLab?.id.toString() || '', generatedReportData);
      setUpdateCollectionTable(false);
      setShowModal(false);
      toast.success("Report created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden h-[500px] overflow-y-auto p-5">
      <ReportHeader />
      <PatientBasicInfo patientList={patientList} />
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
          onClick={handleCreateData}
          className="w-full max-w-xs mx-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center"
        >
          <TbReportMedical className="mr-2" size={18} />
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default PatientReportDataFill;