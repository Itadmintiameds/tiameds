// import { getAllVisits } from '@/../services/patientServices';
// import { useLabs } from '@/context/LabContext';
// import { Patient } from '@/types/patient/patient';
// import { PlusIcon } from 'lucide-react';
// import React, { useEffect, useState } from 'react';
// import { FaEdit } from "react-icons/fa";
// import { FaFilterCircleXmark } from "react-icons/fa6";
// import { LiaFileInvoiceSolid } from "react-icons/lia";
// import { toast } from 'react-toastify';
// import Button from '../common/Button';
// import Modal from '../common/Model';
// import Pagination from '../common/Pagination';
// import TableComponent from '../common/TableComponent';
// import AddPatientComponent from './AddPatientComponent';
// import PatientDetailsViewComponent from './PatientDetailsViewComponent';
// import EditPatientDetails from './EditPatientDetails';
// import { MdOutlineDeleteSweep } from "react-icons/md";

// enum VisitStatus {
//   PENDING = 'Pending',
//   COMPLETED = 'Completed',
//   CANCELLED = 'Cancelled',
//   COLLECTED = 'Collected',
// }

// enum VisitType {
//   IN_PATIENT = 'In-Patient',
//   OUT_PATIENT = 'Out-Patient',
// }

// const PatientVisitListTable: React.FC = () => {
//   const { currentLab, setPatientDetails } = useLabs();
//   const [patientList, setPatientList] = useState<Patient[]>([]);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [itemsPerPage] = useState<number>(10);
//   const [statusFilter, setStatusFilter] = useState<string>('');
//   const [visitTypeFilter, setVisitTypeFilter] = useState<string>('');
//   const [dateRangeFilter, setDateRangeFilter] = useState<string>('last24hours');
//   const [customStartDate, setCustomStartDate] = useState<string>('');
//   const [customEndDate, setCustomEndDate] = useState<string>('');
//   const [addPatientModal, setAddPatientModal] = useState<boolean>(false);
//   const [viewPatientModal, setViewPatientModal] = useState<boolean>(false);
//   const [editPatientDetailsModal, setEditPatientDetailsModal] = useState<boolean>(false);
//   const [editPatientDetails, setEditPatientDetails] = useState<Patient | null>(null);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [statusFilter, visitTypeFilter, dateRangeFilter, customStartDate, customEndDate]);

//   useEffect(() => {
//     const fetchVisits = async () => {
//       try {
//         if (currentLab?.id) {
//           const response = await getAllVisits(currentLab.id);
//           setPatientList(response?.data || []);
//         }
//       } catch (error: unknown) {
//         toast.error((error as Error).message || 'An error occurred while fetching visits', { autoClose: 2000 });
//       }
//     };
//     fetchVisits();
//   }, [currentLab ,addPatientModal]);

//   const now = new Date();
//   let startDate: Date | null = null;
//   let endDate: Date | null = now;

//   switch (dateRangeFilter) {
//     case 'today':
//       startDate = new Date(now.setHours(0, 0, 0, 0));
//       endDate = new Date();
//       break;
//     case 'yesterday':
//       startDate = new Date();
//       startDate.setDate(startDate.getDate() - 1);
//       startDate.setHours(0, 0, 0, 0);
//       endDate = new Date();
//       endDate.setDate(endDate.getDate() - 1);
//       endDate.setHours(23, 59, 59, 999);
//       break;
//     case 'last7days':
//       startDate = new Date();
//       startDate.setDate(now.getDate() - 7);
//       break;
//     case 'thismonth':
//       startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//       break;
//     case 'thisyear':
//       startDate = new Date(now.getFullYear(), 0, 1);
//       break;
//     case 'custom':
//       if (customStartDate) startDate = new Date(customStartDate);
//       if (customEndDate) endDate = new Date(customEndDate);
//       break;
//     case 'last24hours':
//     default:
//       startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Set to 24 hours ago
//       break;
//   }

//   const filteredPatients = patientList.filter((visit) => {
//     let isValid = true;
//     const visitDate = new Date(visit?.visit?.visitDate);

//     if (statusFilter && visit?.visit?.visitStatus.toUpperCase() !== statusFilter.toUpperCase()) {
//       isValid = false;
//     }

//     if (visitTypeFilter && visit.visit.visitType !== visitTypeFilter) {
//       isValid = false;
//     }

//     if (startDate && visitDate < startDate) {
//       isValid = false;
//     }

//     if (endDate && visitDate > endDate) {
//       isValid = false;
//     }

//     return isValid;
//   });

//   const sortedPatients = [...filteredPatients].sort((a, b) => new Date(b?.visit?.visitDate).getTime() - new Date(a?.visit?.visitDate).getTime());
//   const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
//   const paginatedPatients = sortedPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   const handleView = (visit: Patient) => () => {
//     setPatientDetails(visit);
//     // router.push('/dashboard/patients');
//     setViewPatientModal(true);
//   };

// const handleEditpatientDetails = (visit: Patient) => () => {
//     setEditPatientDetails(visit);
//     setEditPatientDetailsModal(true);
//   };

//   const handleAddPatient = () => {
//     setAddPatientModal(true);
//   };

//   const handleClearFilters = () => {
//     setStatusFilter('');
//     setVisitTypeFilter('');
//     setDateRangeFilter('last24hours');
//     setCustomStartDate('');
//     setCustomEndDate('');
//   };

//   const columns = [
//     { header: 'Visit ID', accessor: (row: Patient) => row?.visit?.visitId },
//     { header: 'Name', accessor: (row: Patient) => `${row?.firstName} ${row?.lastName}` },
//     { header: 'Visit Date', accessor: (row: Patient) => row?.visit?.visitDate },
//     { header: 'Visit Type', accessor: (row: Patient) => row?.visit?.visitType },
//     {
//       header: 'Sample Status',
//       accessor: (row: Patient) => (
//         <span className={`p-1 rounded ${row?.visit?.visitStatus === 'Pending' ? 'bg-pending  text-white' : 'bg-success text-white'}`}>
//           {row?.visit?.visitStatus}
//         </span>
//       )
//     },
//     { header: 'Total Amount', accessor: (row: Patient) => row?.visit?.billing?.totalAmount },
//     {
//       header: 'Actions',
//       accessor: (row: Patient) => (
//         <div className='flex gap-2'>
//           <Button
//             text=""
//             className="px-2 py-1 text-white bg-view rounded hover:bg-viewhover" onClick={handleView(row)}>
//             <LiaFileInvoiceSolid />
//           </Button>
//           <Button
//             text=""
//             className="px-2 py-1 text-white 
//           bg-red-600 rounded
//            hover:bg-viewhover" onClick={handleEditpatientDetails(row)}>
//             <FaEdit />
//           </Button>
//          {
//             row?.visit?.visitStatus == 'Pending' && (
//               <Button
//                 text=""
//                 className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700"
//                 onClick={() => {
//                   // Handle delete action here
//                   toast.error('Delete action is not implemented yet', { autoClose: 2000 });
//                 }}
//               >
//                 <MdOutlineDeleteSweep />
//               </Button>
//             )
//          }
//         </div>
//       ),
//     },
//   ];

//   return (
//     <>
//       <div className="text-xs p-2">
//         <div className="flex justify-between items-start mb-2">
//           <div className="flex flex-wrap gap-2 items-center">
//             {/* Status Filter */}
//             <div className="flex items-center gap-1">
//               <label className="text-xs font-semibold whitespace-nowrap">Status:</label>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="border px-1.5 py-1 rounded text-xs w-32"
//               >
//                 <option value="">All</option>
//                 {Object.values(VisitStatus).map((status) => (
//                   <option key={status} value={status}>{status}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Visit Type Filter */}
//             <div className="flex items-center gap-1">
//               <label className="text-xs font-semibold whitespace-nowrap">Type:</label>
//               <select
//                 value={visitTypeFilter}
//                 onChange={(e) => setVisitTypeFilter(e.target.value)}
//                 className="border px-1.5 py-1 rounded text-xs w-32"
//               >
//                 <option value="">All</option>
//                 {Object.values(VisitType).map((type) => (
//                   <option key={type} value={type}>{type}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Date Range Filter */}
//             <div className="flex items-center gap-1">
//               <label className="text-xs font-semibold whitespace-nowrap">Date:</label>
//               <select
//                 value={dateRangeFilter}
//                 onChange={(e) => setDateRangeFilter(e.target.value)}
//                 className="border px-1.5 py-1 rounded text-xs w-32"
//               >
//                 <option value="today">Today</option>
//                 <option value="yesterday">Yesterday</option>
//                 <option value="last7days">Last 7 Days</option>
//                 <option value="thismonth">This Month</option>
//                 <option value="thisyear">This Year</option>
//                 <option value="custom">Custom</option>
//               </select>
//             </div>

//             {/* Custom Date Range */}
//             {dateRangeFilter === 'custom' && (
//               <>
//                 <div className="flex items-center gap-1">
//                   <label className="text-xs font-semibold whitespace-nowrap">From:</label>
//                   <input
//                     type="date"
//                     value={customStartDate}
//                     onChange={(e) => setCustomStartDate(e.target.value)}
//                     className="border px-1.5 py-1 rounded text-xs w-32"
//                   />
//                 </div>

//                 <div className="flex items-center gap-1">
//                   <label className="text-xs font-semibold whitespace-nowrap">To:</label>
//                   <input
//                     type="date"
//                     value={customEndDate}
//                     onChange={(e) => setCustomEndDate(e.target.value)}
//                     className="border px-1.5 py-1 rounded text-xs w-32"
//                   />
//                 </div>
//               </>
//             )}

//             {/* Clear Filters */}
//             {filteredPatients?.length > 0 && (
//               <button
//                 onClick={handleClearFilters}
//                 className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-800"
//                 title="Clear filters"
//               >
//                 <FaFilterCircleXmark className="text-sm" />
//                 <span className="text-xs">Clear</span>
//               </button>
//             )}
//           </div>

//           {/* Add Patient Button - Moved to corner */}
//           <Button
//             text="Patient"
//             onClick={handleAddPatient}
//             className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-primary text-zinc-900 hover:bg-primarydark shadow-sm"
//           >
//             <PlusIcon size={12} />
//           </Button>
//         </div>

//         <TableComponent columns={columns} data={paginatedPatients} />
//         <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
//       </div>
//       {
//         addPatientModal && (
//           <Modal
//             isOpen={addPatientModal}
//             onClose={() => setAddPatientModal(false)}
//             title="Add Patient"
//             modalClassName="max-w-5xl max-h-[90vh] overflow-y-auto"
//           >
//             <AddPatientComponent 
//             setAddPatientModal={setAddPatientModal}
//             />
//           </Modal>
//         )}
//       {
//         viewPatientModal && (
//           <Modal
//             isOpen={viewPatientModal}
//             onClose={() => setViewPatientModal(false)}
//             title="View Patient Details"
//             modalClassName="max-w-5xl max-h-[90vh] overflow-y-auto bg-zinc-20"
//           >
//             <PatientDetailsViewComponent />
//           </Modal>
//         )
//       }
//       {
//         editPatientDetailsModal && (
//           <Modal
//             isOpen={editPatientDetailsModal}
//             onClose={() => setEditPatientDetailsModal(false)}
//             title="Edit Patient Details"
//             modalClassName="max-w-5xl max-h-[90vh] overflow-y-auto bg-zinc-20"
//           >
//             <EditPatientDetails 
//             setEditPatientDetailsModal={setEditPatientDetailsModal}
//             editPatientDetails={editPatientDetails}
            
//             />
//           </Modal>
//         )
//       }
//     </>
//   );
// };

// export default PatientVisitListTable;



















import { getAllVisits } from '@/../services/patientServices';
import { useLabs } from '@/context/LabContext';
import { Patient } from '@/types/patient/patient';
import { PlusIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { FaFilterCircleXmark } from "react-icons/fa6";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { toast } from 'react-toastify';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Modal from '../common/Model';
import Pagination from '../common/Pagination';
import TableComponent from '../common/TableComponent';
import AddPatientComponent from './AddPatientComponent';
import EditPatientDetails from './EditPatientDetails';
import PatientDetailsViewComponent from './PatientDetailsViewComponent';

enum VisitStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  COLLECTED = 'Collected',
}

enum VisitType {
  IN_PATIENT = 'In-Patient',
  OUT_PATIENT = 'Out-Patient',
}

const statusColorMap: Record<VisitStatus, string> = {
  [VisitStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [VisitStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [VisitStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [VisitStatus.COLLECTED]: 'bg-blue-100 text-blue-800',
};

const PatientVisitListTable: React.FC = () => {
  const { currentLab, setPatientDetails } = useLabs();
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [visitTypeFilter, setVisitTypeFilter] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('last24hours');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [addPatientModal, setAddPatientModal] = useState<boolean>(false);
  const [viewPatientModal, setViewPatientModal] = useState<boolean>(false);
  const [editPatientDetailsModal, setEditPatientDetailsModal] = useState<boolean>(false);
  const [editPatientDetails, setEditPatientDetails] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updatePatientListVist , setUpdatePatientListVist] = useState<boolean>(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, visitTypeFilter, dateRangeFilter, customStartDate, customEndDate]);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setIsLoading(true);
        if (currentLab?.id) {
          const response = await getAllVisits(currentLab.id);
          setPatientList(response?.data || []);
        }
      } catch (error: unknown) {
        toast.error((error as Error).message || 'An error occurred while fetching visits', { 
          autoClose: 2000,
          className: 'bg-red-50 text-red-800'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchVisits();
  }, [currentLab,updatePatientListVist ]);

  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = now;

  switch (dateRangeFilter) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date();
      break;
    case 'yesterday':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'last7days':
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
      break;
    case 'thismonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'thisyear':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      if (customStartDate) startDate = new Date(customStartDate);
      if (customEndDate) endDate = new Date(customEndDate);
      break;
    case 'last24hours':
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
  }

  const filteredPatients = patientList.filter((visit) => {
    let isValid = true;
    const visitDate = new Date(visit?.visit?.visitDate);

    if (statusFilter && visit?.visit?.visitStatus.toUpperCase() !== statusFilter.toUpperCase()) {
      isValid = false;
    }

    if (visitTypeFilter && visit.visit.visitType !== visitTypeFilter) {
      isValid = false;
    }

    if (startDate && visitDate < startDate) {
      isValid = false;
    }

    if (endDate && visitDate > endDate) {
      isValid = false;
    }

    return isValid;
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => 
    new Date(b?.visit?.visitDate).getTime() - new Date(a?.visit?.visitDate).getTime()
  );
  
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = sortedPatients.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handleView = (visit: Patient) => () => {
    setPatientDetails(visit);
    setViewPatientModal(true);
  };

  const handleEditpatientDetails = (visit: Patient) => () => {
    setEditPatientDetails(visit);
    setEditPatientDetailsModal(true);
  };

  const handleAddPatient = () => {
    setAddPatientModal(true);
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setVisitTypeFilter('');
    setDateRangeFilter('last24hours');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    { 
      header: 'Visit ID', 
      accessor: (row: Patient) => (
        <span className="font-mono text-sm text-gray-700">
          {row?.visit?.visitId}
        </span>
      ) 
    },
    { 
      header: 'Patient Name', 
      accessor: (row: Patient) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{`${row?.firstName} ${row?.lastName}`}</span>
          {/* <span className="text-xs text-gray-500">{row?.id}</span> */}
        </div>
      ) 
    },
    { 
      header: 'Patient Contact', 
      accessor: (row: Patient) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{`${row?.phone}`}</span>
          {/* <span className="text-xs text-gray-500">{row?.id}</span> */}
        </div>
      ) 
    },
    { 
      header: 'Visit Date', 
      accessor: (row: Patient) => (
        <span className="text-sm text-gray-700">
          {formatDate(row?.visit?.visitDate)}
        </span>
      ) 
    },
    { 
      header: 'Visit Type', 
      accessor: (row: Patient) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row?.visit?.visitType === VisitType.IN_PATIENT 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-indigo-100 text-indigo-800'
        }`}>
          {row?.visit?.visitType}
        </span>
      ) 
    },
    {
      header: 'Visit Status',
      accessor: (row: Patient) => {
        const status = row?.visit?.visitStatus as string;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColorMap[status as keyof typeof statusColorMap] || 'bg-gray-100 text-gray-800'
          }`}>
            {status}
          </span>
        );
      }
    },
    { 
      header: 'Net Amount', 
      accessor: (row: Patient) => (
        <span className="font-medium text-gray-900">
           ₹{row?.visit?.billing?.netAmount?.toFixed(2) || '0.00'}
        </span>
      ) 
    },
    {
      header: 'Actions',
      accessor: (row: Patient) => (
        <div className="flex gap-2">
          <Button
            text=""
            className="px-2 py-1 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors duration-200"
            onClick={handleView(row)}
            // tooltip="View Details"
          >
            <LiaFileInvoiceSolid size={14} />
          </Button>
         {
          row?.visit?.visitStatus == 'Pending' && (
            <Button
              text=""
              className="px-2 py-1 text-white bg-amber-600 rounded hover:bg-amber-700 transition-colors duration-200"
              onClick={handleEditpatientDetails(row)}
              // tooltip="Edit Visit Details"
            >
              <FaEdit size={14} />
            </Button>
          )

         }
          {row?.visit?.visitStatus === 'Pending' && (
            <Button
              text=""
              className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700 transition-colors duration-200"
              onClick={() => toast.error('Delete action is not implemented yet', { 
                autoClose: 2000,
                className: 'bg-red-50 text-red-800'
              })}
              // tooltip="Delete Visit"
            >
              <MdOutlineDeleteSweep size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Patient Visits</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">All Statuses</option>
                {Object.values(VisitStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Visit Type Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">Type</label>
              <select
                value={visitTypeFilter}
                onChange={(e) => setVisitTypeFilter(e.target.value)}
                className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">All Types</option>
                {Object.values(VisitType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">Date Range</label>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="last24hours">Last 24 Hours</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="thismonth">This Month</option>
                <option value="thisyear">This Year</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {dateRangeFilter === 'custom' && (
              <>
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-600 mb-1">From</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-600 mb-1">To</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </>
            )}

            {/* Clear Filters */}
            {(statusFilter || visitTypeFilter || dateRangeFilter !== 'last24hours') && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-3 py-1.5 mt-6 text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
                title="Clear all filters"
              >
                <FaFilterCircleXmark className="text-base" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Add Patient Button */}
          <Button
            text="Add Patient"
            onClick={handleAddPatient}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            <PlusIcon size={14} />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center  h-64">
           <Loader type="progress" fullScreen text="loading patient visits..." />
          </div>
        ) : (
          <>
            <TableComponent 
              columns={columns} 
              data={paginatedPatients} 
              // emptyMessage="No patient visits found matching your criteria"
            />
            {filteredPatients.length > 0 && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPatients.length)} of {filteredPatients.length} visits
                </div>
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentPage} 
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={addPatientModal}
        onClose={() => setAddPatientModal(false)}
        title="Register New Patient"
        modalClassName="max-w-5xl max-h-[90vh] rounded-lg  overflow-y-auto overflow-hidden"
        // headerClassName="bg-blue-600 text-white"
      >
        <AddPatientComponent 
          setAddPatientModal={setAddPatientModal}
           setUpdatePatientListVist={setUpdatePatientListVist}
          updatePatientListVist={updatePatientListVist}
        />
      </Modal>

      <Modal
        isOpen={viewPatientModal}
        onClose={() => setViewPatientModal(false)}
        title="Patient Visit Details"
        modalClassName="max-w-5xl max-h-[90vh] rounded-lg  overflow-y-auto overflow-hidden"
        // headerClassName="bg-blue-600 text-white"
      >
        <PatientDetailsViewComponent />
      </Modal>

      <Modal
        isOpen={editPatientDetailsModal}
        onClose={() => setEditPatientDetailsModal(false)}
        title="Edit Patient Details"
        modalClassName="max-w-5xl max-h-[90vh] rounded-lg  overflow-y-auto overflow-hidden"
        // headerClassName="bg-amber-600 text-white"
      >
        <EditPatientDetails 
          setEditPatientDetailsModal={setEditPatientDetailsModal}
          editPatientDetails={editPatientDetails}
          setUpdatePatientListVist={setUpdatePatientListVist}
          updatePatientListVist={updatePatientListVist}

        />
      </Modal>
    </div>
  );
};

export default PatientVisitListTable;





























