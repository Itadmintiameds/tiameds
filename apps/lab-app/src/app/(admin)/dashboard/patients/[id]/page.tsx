// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useLabs } from '@/context/LabContext';
// import { getVisitsByPatientId, getPatientById } from '@/../services/patientServices'; // Update to include patient info
// import { toast } from 'react-toastify';
// import { AiOutlineMail, AiOutlinePhone, AiOutlineHome, AiOutlineCalendar } from 'react-icons/ai';
// import { FaTransgenderAlt } from 'react-icons/fa'; // For gender icon
// import { AiOutlineHeart } from 'react-icons/ai'; // For blood group icon
// import { FaPrint } from 'react-icons/fa'; // Importing print icon
// import { ArrowLeftIcon } from '@heroicons/react/20/solid';
// import Pagination from '@/app/(admin)/component/common/Pagination';

// interface IParams {
//   id: string;
// }

// interface IPatient {
//   id: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   address: string;
//   city: string;
//   state: string;
//   zip: string;
//   dateOfBirth: string;
//   gender: string;
//   bloodGroup: string;
// }

// interface IVisit {
//   visitId: number;
//   visitDate: string;
//   visitType: string;
//   visitStatus: string;
//   visitDescription: string;
//   billing: {
//     totalAmount: number;
//     paymentStatus: string;
//     paymentMethod: string;
//     paymentDate: string;
//   };
// }

// const Page = ({ params }: { params: IParams }) => {
//   const [patient, setPatient] = useState<IPatient | null>(null);
//   const [visits, setVisits] = useState<IVisit[]>([]);
//   const { currentLab } = useLabs();

//   const fetchPatientAndVisits = async () => {
//     if (currentLab?.id) {
//       try {
//         const patientData = await getPatientById(currentLab.id, parseInt(params.id)); // Fetch patient info
//         const visitsData = await getVisitsByPatientId(currentLab.id, parseInt(params.id)); // Fetch visits
//         setPatient(patientData.data);
//         setVisits(visitsData);
//       } catch (error) {
//         if (error instanceof Error) {
//           toast.error(error.message || 'Failed to fetch data', { autoClose: 2000 });
//         } else {
//           toast.error('Failed to fetch data', { autoClose: 2000 });
//         }
//       }
//     }
//   };

//   useEffect(() => {
//     fetchPatientAndVisits();
//   }, [currentLab?.id, params.id]);

//   // Print function to trigger the browser's print dialog
//   const handlePrint = () => {
//     window.print();
//   };


//   console.log(patient, 'patient');

//   return (
//     <div>
//       <div className="flex justify-end items-center sticky top-0 z-10">
//         <ArrowLeftIcon
//           className="h-5 w-5 text-textwhite font-bold animate-bounce text-xl cursor-pointer bg-primary rounded-full p-1"
//           onClick={() => window.history.back()}
//         />
//       </div>

//       {/* Patient Info Section */}
//       {patient && (
//         <section className="mb-8  p-6 rounded-lg shadow-lg">
//         <h2 className="text-2xl font-semibold text-gray-700 mb-6">Patient Information</h2>
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//             <div>
//               <h1 className="text-3xl font-semibold text-gray-800 mb-2">{patient.firstName} {patient.lastName}</h1>
//               <div className="text-sm text-gray-500">
//                 <div className="flex items-center mb-2">
//                   <AiOutlineMail className="mr-2 text-blue-500" />
//                   <p>{patient.email}</p>
//                 </div>
//                 <div className="flex items-center mb-2">
//                   <AiOutlinePhone className="mr-2 text-green-500" />
//                   <p>{patient.phone}</p>
//                 </div>
//                 <div className="flex items-center">
//                   <AiOutlineHome className="mr-2 text-yellow-500" />
//                   <p>{patient.address}, {patient.city}, {patient.state} - {patient.zip}</p>
//                 </div>
//               </div>
//             </div>
//             <div className="md:ml-6 mt-4 md:mt-0">
//               {/* Additional Patient Information with Icons */}
//               {patient.bloodGroup && (
//                 <div className="flex items-center text-xs text-gray-500 mb-2">
//                   <AiOutlineHeart className="mr-2 text-red-500" />
//                   <p>{`Blood Group: ${patient.bloodGroup}`}</p>
//                 </div>
//               )}
//               {patient.dateOfBirth && (
//                 <div className="flex items-center text-xs text-gray-500 mb-2">
//                   <AiOutlineCalendar className="mr-2 text-blue-500" />
//                   <p>{`Date of Birth: ${new Date(patient.dateOfBirth).toLocaleDateString()}`}</p>
//                 </div>
//               )}
//               {patient.gender && (
//                 <div className="flex items-center text-xs text-gray-500 mb-2">
//                   <FaTransgenderAlt className="mr-2 text-purple-500" />
//                   <p>{`Gender: ${patient.gender}`}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//       </section>

//       )}

//       {/* Visits Table */}
//       <section>
//         <h2 className="text-xl font-semibold mb-4">Patient Visits</h2>
//         <table className="table-auto w-full border-collapse border border-gray-200 text-xs">
//           <thead>
//             <tr>
//               <th className="border px-4 py-2">Visit ID</th>
//               <th className="border px-4 py-2">Visit Date</th>
//               <th className="border px-4 py-2">Visit Type</th>
//               <th className="border px-4 py-2">Visit Status</th>
//               <th className="border px-4 py-2">Visit Description</th>
//               <th className="border px-4 py-2">Total Amount</th>
//               <th className="border px-4 py-2">Payment Status</th>
//               <th className="border px-4 py-2">Payment Method</th>
//               <th className="border px-4 py-2">Payment Date</th>
//               <th className="border px-4 py-2">Actions</th> {/* Added Actions column */}
//             </tr>
//           </thead>
//           <tbody>
//             {visits.map((visit) => (
//               <tr key={visit.visit.visitId}>
//                 <td className="border px-4 py-2">{visit.visit.visitId}</td>
//                 <td className="border px-4 py-2">{visit.visit.visitDate}</td>
//                 <td className="border px-4 py-2">{visit.visit.visitType}</td>
//                 <td className="border px-4 py-2">{visit.visit.visitStatus}</td>
//                 <td className="border px-4 py-2">{visit.visit.visitDescription}</td>
//                 <td className="border px-4 py-2">{visit.visit.billing.totalAmount}</td>
//                 <td className="border px-4 py-2">{visit.visit.billing.paymentStatus}</td>
//                 <td className="border px-4 py-2">{visit.visit.billing.paymentMethod}</td>
//                 <td className="border px-4 py-2">{visit.visit.billing.paymentDate}</td>
//                 <td className="border px-4 py-2">
//                   {/* Print Button for each row */}
//                   <button
//                     onClick={handlePrint}
//                     className="px-2 py-1 text-white bg-blue-500 rounded-md flex items-center justify-center"
//                   >
//                     <FaPrint className="mr-1" />
//                     Print
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </section>
//     </div>
//   );
// };

// export default Page;
















'use client';

import React, { useState, useEffect } from 'react';
import { useLabs } from '@/context/LabContext';
import { getVisitsByPatientId, getPatientById } from '@/../services/patientServices'; // Update to include patient info
import { toast } from 'react-toastify';
import { AiOutlineMail, AiOutlinePhone, AiOutlineHome, AiOutlineCalendar } from 'react-icons/ai';
import { FaTransgenderAlt } from 'react-icons/fa'; // For gender icon
import { AiOutlineHeart } from 'react-icons/ai'; // For blood group icon
import { FaPrint } from 'react-icons/fa'; // Importing print icon
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
// import Pagination from '@/app/(admin)/component/common/Pagination';

interface IParams {
  id: string;
}

interface IPatient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
}

interface IVisit {
  visitId: number;
  visitDate: string;
  visitType: string;
  visitStatus: string;
  visitDescription: string;
  billing: {
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
    paymentDate: string;
  };
}

const Page = ({ params }: { params: IParams }) => {
  const [patient, setPatient] = useState<IPatient | null>(null);
  const [visits, setVisits] = useState<IVisit[]>([]);
  const { currentLab } = useLabs();

  const fetchPatientAndVisits = async () => {
    if (currentLab?.id) {
      try {
        const patientData = await getPatientById(currentLab.id, parseInt(params.id)); // Fetch patient info
        const visitsData = await getVisitsByPatientId(currentLab.id, parseInt(params.id)); // Fetch visits
        setPatient(patientData.data);
        setVisits(visitsData);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message || 'Failed to fetch data', { autoClose: 2000 });
        } else {
          toast.error('Failed to fetch data', { autoClose: 2000 });
        }
      }
    }
  };

  useEffect(() => {
    fetchPatientAndVisits();
  }, [currentLab?.id, params.id]);

  // Print function to trigger the browser's print dialog
  const handlePrint = () => {
    window.print();
  };


  console.log(patient, 'patient');

  return (
    <div>
      <div className="flex justify-end items-center sticky top-0 z-10">
        <ArrowLeftIcon
          className="h-5 w-5 text-textwhite font-bold animate-bounce text-xl cursor-pointer bg-primary rounded-full p-1"
          onClick={() => window.history.back()}
        />
      </div>

      {/* Patient Info Section */}
      {patient && (
        <section className="mb-8  p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Patient Information</h2>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">{patient.firstName} {patient.lastName}</h1>
              <div className="text-sm text-gray-500">
                <div className="flex items-center mb-2">
                  <AiOutlineMail className="mr-2 text-blue-500" />
                  <p>{patient.email}</p>
                </div>
                <div className="flex items-center mb-2">
                  <AiOutlinePhone className="mr-2 text-green-500" />
                  <p>{patient.phone}</p>
                </div>
                <div className="flex items-center">
                  <AiOutlineHome className="mr-2 text-yellow-500" />
                  <p>{patient.address}, {patient.city}, {patient.state} - {patient.zip}</p>
                </div>
              </div>
            </div>
            <div className="md:ml-6 mt-4 md:mt-0">
              {/* Additional Patient Information with Icons */}
              {patient.bloodGroup && (
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <AiOutlineHeart className="mr-2 text-red-500" />
                  <p>{`Blood Group: ${patient.bloodGroup}`}</p>
                </div>
              )}
              {patient.dateOfBirth && (
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <AiOutlineCalendar className="mr-2 text-blue-500" />
                  <p>{`Date of Birth: ${new Date(patient.dateOfBirth).toLocaleDateString()}`}</p>
                </div>
              )}
              {patient.gender && (
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <FaTransgenderAlt className="mr-2 text-purple-500" />
                  <p>{`Gender: ${patient.gender}`}</p>
                </div>
              )}
            </div>
          </div>
      </section>

      )}

      {/* Visits Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Patient Visits</h2>
        <table className="table-auto w-full border-collapse border border-gray-200 text-xs">
          <thead>
            <tr>
              <th className="border px-4 py-2">Visit ID</th>
              <th className="border px-4 py-2">Visit Date</th>
              <th className="border px-4 py-2">Visit Type</th>
              <th className="border px-4 py-2">Visit Status</th>
              <th className="border px-4 py-2">Visit Description</th>
              <th className="border px-4 py-2">Total Amount</th>
              <th className="border px-4 py-2">Payment Status</th>
              <th className="border px-4 py-2">Payment Method</th>
              <th className="border px-4 py-2">Payment Date</th>
              <th className="border px-4 py-2">Actions</th> {/* Added Actions column */}
            </tr>
          </thead>
          <tbody>
            {visits.map((visit:IVisit) => (
              <tr key={visit.visitId}>
                <td className="border px-4 py-2">{visit.visitId}</td>
                <td className="border px-4 py-2">{visit.visitDate}</td>
                <td className="border px-4 py-2">{visit.visitType}</td>
                <td className="border px-4 py-2">{visit.visitStatus}</td>
                <td className="border px-4 py-2">{visit.visitDescription}</td>
                <td className="border px-4 py-2">{visit.billing?.totalAmount}</td>
                <td className="border px-4 py-2">{visit.billing?.paymentStatus}</td>
                <td className="border px-4 py-2">{visit.billing?.paymentMethod}</td>
                <td className="border px-4 py-2">{visit.billing?.paymentDate}</td>
                <td className="border px-4 py-2">
                  {/* Print Button for each row */}
                  <button
                    onClick={handlePrint}
                    className="px-2 py-1 text-white bg-blue-500 rounded-md flex items-center justify-center"
                  >
                    <FaPrint className="mr-1" />
                    Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Page;


