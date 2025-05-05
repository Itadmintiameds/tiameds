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



// interface PatientReportDataFillProps {
//   patientList: PatientData[];
//   updateCollectionTable: boolean;
//   setShowModal: (value: React.SetStateAction<boolean>) => void;
//   setUpdateCollectionTable: (value: React.SetStateAction<boolean>) => void;
// }
// const PatientReportDataFill: React.FC<PatientReportDataFillProps> = ({ patientList, setUpdateCollectionTable, setShowModal }) => {
//   const { currentLab } = useLabs();
//   // const [tests, setTests] = useState<TestList[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [referencePoints, setReferencePoints] = useState<Record<string, TestReferancePoint[]>>({});
//   const [inputValues, setInputValues] = useState<Record<string, Record<number, string>>>({});
//   // const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
//   const [allTests, setAllTests] = useState<TestList[]>([]);

//   const fetchTestDataAndPackage = async () => {
//     try {
//       if (!currentLab?.id) return;
//       setLoading(true);

//       const uniqueTestIds = Array.from(new Set(patientList.flatMap((visit) => visit.testIds)));
//       const fetchedTests = await Promise.all(
//         uniqueTestIds.map((testId) => getTestById(currentLab.id.toString(), testId))
//       );
//       // setTests(fetchedTests);
//       const uniquePackageIds = Array.from(new Set(patientList.flatMap((visit) => visit.packageIds)));
//       const fetchedPackages = await Promise.all(
//         uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId))
//       );
//       const formattedPackages = fetchedPackages.map((pkg) => pkg.data);
//       // setHealthPackages(formattedPackages);
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
//       const generatedReportData: any[] = [];

//       patientList.forEach((patient) => {
//         allTests.forEach((test) => {
//           const testInputs = inputValues[test.name] || {};
//           const referenceData = referencePoints[test.name] || [];

//           referenceData.forEach((point, index) => {
//             const enteredValue = testInputs[index];
//             if (!enteredValue) return;

//             generatedReportData.push({
//               visit_id: patient.visitId,
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
//     <div className="bg-white shadow-xl rounded-2xl overflow-hidden h-[500px] overflow-y-auto p-6">
//       <ReportHeader />
//       <PatientBasicInfo patientList={patientList} />
//       <div>
//         {allTests.map((test) => (
//           <div
//             key={test.id}
//             className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-md border">
//             <h3 className="text-sm font-semibold text-blue-900 bg-blue-200 px-4 py-2 rounded-lg inline-block shadow">
//               {test.name}
//             </h3>
//             <div className="mt-4 space-y-3">
//               {referencePoints[test.name]?.map((point, index) => (
//                 <div
//                   key={index}
//                   className={`flex flex-wrap items-center p-4 rounded-lg border shadow-sm transition-all 
//                           ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
//                   <div className="w-1/3 px-3 text-sm">

//                     {/* <strong className="text-red-700">Description:</strong> {point.id}  */}
//                     <strong className="text-gray-700">Description:</strong> {point.testDescription}
//                   </div>
//                   <div className="w-1/6 px-3 text-sm">
//                     <strong className="text-gray-700">Gender:</strong> {point.gender === 'M' ? 'Male' : 'Female'}
//                   </div>
//                   <div className="w-1/6 px-3 text-sm">
//                     <strong className="text-gray-700">Min:</strong> <span className="text-green-600">{point.minReferenceRange}</span>
//                   </div>
//                   <div className="w-1/6 px-3 text-sm">
//                     <strong className="text-gray-700">Max:</strong> <span className="text-red-600">{point.maxReferenceRange}</span>
//                   </div>
//                   <div className="w-1/6 px-3 text-sm">
//                     <strong className="text-gray-700">Units:</strong> {point.units}
//                   </div>
//                   <div className="w-1/4 px-3 text-sm">
//                     <strong className="text-gray-700">Age:</strong> {point.ageMin} - {point.ageMax} years
//                   </div>
//                   <input
//                     type="text"
//                     className="border border-gray-300 rounded-md p-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto shadow-sm"
//                     placeholder="Enter value"
//                     value={inputValues[test.name]?.[index] || ''}
//                     onChange={(e) => handleInputChange(test.name, index, e.target.value)}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="flex justify-center">
//         <button
//           onClick={handleCreateData}
//           className="bg-blue-500 text-white px-6 py-2 rounded-lg  shadow-md hover:bg-blue-700 right-4">
//           <TbReportMedical className='inline-block mr-2' />
//           Report
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
import { toast } from 'react-toastify';
import PatientBasicInfo from './PatientBasicInfo';
import ReportHeader from './ReportHeader';
import { TbReportMedical } from "react-icons/tb";


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
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden h-[500px] overflow-y-auto p-6">
      <ReportHeader />
      <PatientBasicInfo patientList={patientList} />
      <div>
        {allTests.map((test) => (
          <div
            key={test.id}
            className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-md border">
            <h3 className="text-sm font-semibold text-blue-900 bg-blue-200 px-4 py-2 rounded-lg inline-block shadow">
              {test.name}
            </h3>
            <div className="mt-4 space-y-3">
              {referencePoints[test.name]?.map((point, index) => (
                <div
                  key={index}
                  className={`flex flex-wrap items-center p-4 rounded-lg border shadow-sm transition-all 
                          ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <div className="w-1/3 px-3 text-sm">

                    {/* <strong className="text-red-700">Description:</strong> {point.id}  */}
                    <strong className="text-gray-700">Description:</strong> {point.testDescription}
                  </div>
                  <div className="w-1/6 px-3 text-sm">
                    <strong className="text-gray-700">Gender:</strong> {point.gender === 'M' ? 'Male' : 'Female'}
                  </div>
                  <div className="w-1/6 px-3 text-sm">
                    <strong className="text-gray-700">Min:</strong> <span className="text-green-600">{point.minReferenceRange}</span>
                  </div>
                  <div className="w-1/6 px-3 text-sm">
                    <strong className="text-gray-700">Max:</strong> <span className="text-red-600">{point.maxReferenceRange}</span>
                  </div>
                  <div className="w-1/6 px-3 text-sm">
                    <strong className="text-gray-700">Units:</strong> {point.units}
                  </div>
                  <div className="w-1/4 px-3 text-sm">
                    <strong className="text-gray-700">Age:</strong> {point.ageMin} - {point.ageMax} years
                  </div>
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md p-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto shadow-sm"
                    placeholder="Enter value"
                    value={inputValues[test.name]?.[index] || ''}
                    onChange={(e) => handleInputChange(test.name, index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleCreateData}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg  shadow-md hover:bg-blue-700 right-4">
          <TbReportMedical className='inline-block mr-2' />
          Report
        </button>
      </div>
    </div>
  );
};

export default PatientReportDataFill;







