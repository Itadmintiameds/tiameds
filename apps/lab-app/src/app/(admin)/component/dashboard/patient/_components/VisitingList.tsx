// import { getAllVisits } from '@/../services/patientServices';
// import { useLabs } from '@/context/LabContext';
// import { Patient } from '@/types/patient/patient';
// import { useRouter } from 'next/navigation';
// import React, { useEffect, useState } from 'react';
// import { CiFilter } from "react-icons/ci";
// import { FaEye } from 'react-icons/fa';
// import { toast } from 'react-toastify';
// import Pagination from '../../../common/Pagination';
// import TableComponent from '../../../common/TableComponent';
// import Button from '../../../common/Button';

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

// const VisitingList: React.FC = () => {
//   const { currentLab, setPatientDetails } = useLabs();
//   const [patientList, setPatientList] = useState<Patient[]>([]);
//   const router = useRouter();
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [itemsPerPage] = useState<number>(10);
//   const [statusFilter, setStatusFilter] = useState<string>('');
//   const [visitTypeFilter, setVisitTypeFilter] = useState<string>('');
//   const [startDateFilter, setStartDateFilter] = useState<string>('');
//   const [endDateFilter, setEndDateFilter] = useState<string>('');

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [statusFilter, visitTypeFilter, startDateFilter, endDateFilter]);

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
//   }, [currentLab]);

//   const filteredPatients = patientList.filter((visit) => {
//     let isValid = true;
//     if (statusFilter && visit.visit.visitStatus.toUpperCase() !== statusFilter.toUpperCase()) {
//       isValid = false;
//     }
//     if (visitTypeFilter && visit.visit.visitType !== visitTypeFilter) {
//       isValid = false;
//     }
//     if (startDateFilter && new Date(visit.visit.visitDate) < new Date(startDateFilter)) {
//       isValid = false;
//     }
//     if (endDateFilter && new Date(visit.visit.visitDate) > new Date(endDateFilter)) {
//       isValid = false;
//     }
//     return isValid;
//   });

//   const sortedPatients = [...filteredPatients].sort((a, b) => new Date(b.visit.visitDate).getTime() - new Date(a.visit.visitDate).getTime());
//   const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
//   const paginatedPatients = sortedPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   const handleView = (visit: Patient) => () => {
//     setPatientDetails(visit);
//     router.push('/dashboard/patients');
//   };

//   const handleClearFilters = () => {
//     setStatusFilter('');
//     setVisitTypeFilter('');
//     setStartDateFilter('');
//     setEndDateFilter('');
//   };

//   const columns = [
//     { header: 'Visit ID', accessor: (row: Patient) => row.visit.visitId },
//     { header: 'Name', accessor: (row: Patient) => `${row.firstName} ${row.lastName}` },
//     { header: 'Visit Date', accessor: (row: Patient) => row.visit.visitDate },
//     { header: 'Visit Type', accessor: (row: Patient) => row.visit.visitType },
//     {
//       header: 'Sample Status',
//       accessor: (row: Patient) => (
//         <span className={`p-1 rounded ${row.visit.visitStatus === 'Pending' ? 'bg-pending  text-white' : 'bg-success text-white'}`}>
//           {row.visit.visitStatus}
//         </span>
//       )
//     },
//     { header: 'Total Amount', accessor: (row: Patient) => row.visit.billing.totalAmount },
//     {
//       header: 'Actions',
//       accessor: (row: Patient) => (
//         <button className="px-2 py-1 text-white bg-view rounded hover:bg-viewhover" onClick={handleView(row)}>
//           <FaEye />
//         </button>
//       ),
//     },
//   ];

//   return (
//     <div className="text-xs p-4">
//       <div className="flex flex-wrap gap-4 items-end mb-4">
//         <div className="flex flex-col w-40">
//           <label className="text-xs font-semibold mb-1">Status:</label>
//           <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border px-2 py-1 rounded text-xs">
//             <option value="">All</option>
//             {Object.values(VisitStatus).map((status) => (
//               <option key={status} value={status}>{status}</option>
//             ))}
//           </select>
//         </div>

//         <div className="flex flex-col w-40">
//           <label className="text-xs font-semibold mb-1">Visit Type:</label>
//           <select value={visitTypeFilter} onChange={(e) => setVisitTypeFilter(e.target.value)} className="border px-2 py-1 rounded text-xs">
//             <option value="">All</option>
//             {Object.values(VisitType).map((type) => (
//               <option key={type} value={type}>{type}</option>
//             ))}
//           </select>
//         </div>

//         <div className="flex flex-col w-40">
//           <label className="text-xs font-semibold mb-1">Start Date:</label>
//           <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className="border px-2 py-1 rounded text-xs" />
//         </div>

//         <div className="flex flex-col w-40">
//           <label className="text-xs font-semibold mb-1">End Date:</label>
//           <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className="border px-2 py-1 rounded text-xs" />
//         </div>

//         <Button
//            text = ""
//           onClick={handleClearFilters}
//           className="px-4 py-2 bg-clear text-white rounded flex items-center hover:bg-clearhover"
//           >
//           <CiFilter className="mr-1 text-white" /> Clear
//         </Button>
//       </div>
//       <TableComponent columns={columns} data={paginatedPatients} />
//       <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
//     </div>
//   );
// };

// export default VisitingList;










// =========================================

import { getAllVisits } from '@/../services/patientServices';
import { useLabs } from '@/context/LabContext';
import { Patient } from '@/types/patient/patient';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { FaFilterCircleXmark } from "react-icons/fa6";
import { toast } from 'react-toastify';
import Pagination from '../../../common/Pagination';
import TableComponent from '../../../common/TableComponent';

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

const VisitingList: React.FC = () => {
  const { currentLab, setPatientDetails } = useLabs();
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [visitTypeFilter, setVisitTypeFilter] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('last24hours');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, visitTypeFilter, dateRangeFilter, customStartDate, customEndDate]);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        if (currentLab?.id) {
          const response = await getAllVisits(currentLab.id);
          setPatientList(response?.data || []);
        }
      } catch (error: unknown) {
        toast.error((error as Error).message || 'An error occurred while fetching visits', { autoClose: 2000 });
      }
    };
    fetchVisits();
  }, [currentLab]);

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
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Set to 24 hours ago
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

  const sortedPatients = [...filteredPatients].sort((a, b) => new Date(b?.visit?.visitDate).getTime() - new Date(a?.visit?.visitDate).getTime());
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = sortedPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleView = (visit: Patient) => () => {
    setPatientDetails(visit);
    router.push('/dashboard/patients');
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setVisitTypeFilter('');
    setDateRangeFilter('last24hours');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const columns = [
    { header: 'Visit ID', accessor: (row: Patient) => row?.visit?.visitId },
    { header: 'Name', accessor: (row: Patient) => `${row?.firstName} ${row.lastName}` },
    { header: 'Visit Date', accessor: (row: Patient) => row?.visit?.visitDate },
    { header: 'Visit Type', accessor: (row: Patient) => row?.visit?.visitType },
    {
      header: 'Sample Status',
      accessor: (row: Patient) => (
        <span className={`p-1 rounded ${row?.visit?.visitStatus === 'Pending' ? 'bg-pending  text-white' : 'bg-success text-white'}`}>
          {row.visit.visitStatus}
        </span>
      )
    },
    { header: 'Total Amount', accessor: (row: Patient) => row?.visit?.billing?.totalAmount },
    {
      header: 'Actions',
      accessor: (row: Patient) => (
        <button className="px-2 py-1 text-white bg-view rounded hover:bg-viewhover" onClick={handleView(row)}>
          <FaEye />
        </button>
      ),
    },
  ];

  return (
    <div className="text-xs p-4">
      <div className="flex flex-wrap gap-4 items-end mb-4">
        <div className="flex flex-col w-40">
          <label className="text-xs font-semibold mb-1">Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border px-2 py-1 rounded text-xs">
            <option value="">All</option>
            {Object.values(VisitStatus).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-40">
          <label className="text-xs font-semibold mb-1">Visit Type:</label>
          <select value={visitTypeFilter} onChange={(e) => setVisitTypeFilter(e.target.value)} className="border px-2 py-1 rounded text-xs">
            <option value="">All</option>
            {Object.values(VisitType).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-40">
          <label className="text-xs font-semibold mb-1">Date Range:</label>
          <select value={dateRangeFilter} onChange={(e) => setDateRangeFilter(e.target.value)} className="border px-2 py-1 rounded text-xs">
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="thismonth">This Month</option>
            <option value="thisyear">This Year</option>
            <option value="custom">Custom Range</option>
            {/* Removed the "Last 24 Hours" option */}
          </select>
        </div>

        {dateRangeFilter === 'custom' && (
          <>
            <div className="flex flex-col w-40">
              <label className="text-xs font-semibold mb-1">Start Date:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border px-2 py-1 rounded text-xs"
              />
            </div>

            <div className="flex flex-col w-40">
              <label className="text-xs font-semibold mb-1">End Date:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border px-2 py-1 rounded text-xs"
              />
            </div>
          </>
        )}
        <div>
          {
            filteredPatients.length > 0 && (
              <div className="flex flex-col w-40">
            <label className="text-xs font-semibold mb-1">Clear Filters:</label>
            <FaFilterCircleXmark
              onClick={handleClearFilters}
              className="text-lg text-red-600" />
          </div>
            )
          }
        </div>
      </div>
      <TableComponent columns={columns} data={paginatedPatients} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default VisitingList;
