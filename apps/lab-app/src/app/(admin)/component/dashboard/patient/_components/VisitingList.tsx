import { getAllVisits } from '@/../services/patientServices';
import { useLabs } from '@/context/LabContext';
import { Patient } from '@/types/patient/patient';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { CiFilter } from "react-icons/ci";
import { FaCloudDownloadAlt, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Button from '../../../common/Button';
import Pagination from '../../../common/Pagination';

enum VisitStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  IN_PROGRESS = 'In-Progress',
}



enum VisitType {
  IN_PATIENT = 'In-Patient',
  OUT_PATIENT = 'Out-Patient',
}

const VisitingList: React.FC = () => {
  const { currentLab, setPatientDetails } = useLabs();
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const router = useRouter();

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [visitTypeFilter, setVisitTypeFilter] = useState<string>('');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  // Pagination Logic
  const totalPages = Math.ceil(patientList.length / itemsPerPage);

  // Apply filters to patient list
  const filteredPatients = patientList.filter((visit) => {
    let isValid = true;

    // Status Filter
    if (statusFilter && visit.visit.visitStatus.toUpperCase() !== statusFilter.toUpperCase()) {
      isValid = false;
    }

    // Visit Type Filter (Inpatient/Outpatient)
    if (visitTypeFilter && visit.visit.visitType !== visitTypeFilter) {
      isValid = false;
    }

    // Date Range Filter
    if (startDateFilter && new Date(visit.visit.visitDate) < new Date(startDateFilter)) {
      isValid = false;
    }
    if (endDateFilter && new Date(visit.visit.visitDate) > new Date(endDateFilter)) {
      isValid = false;
    }

    return isValid;
  });

  // Paginate filtered visits (slice the list based on the current page)
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const handleView = (visit: Patient) => () => {
    setPatientDetails(visit);
    router.push('/dashboard/patients');
  };

  const handleUpdate = (visit: Patient) => toast.info(`Updating visit ID: ${visit.visit.visitId}`);

  const columns = [
    { header: 'Visit ID', accessor: (row: Patient) => row.visit.visitId },
    { header: 'Name', accessor: (row: Patient) => `${row.firstName} ${row.lastName}` },
    { header: 'Visit Date', accessor: (row: Patient) => row.visit.visitDate },
    { header: 'Visit Type', accessor: (row: Patient) => row.visit.visitType },
    {
      header: 'Visit Status',
      accessor: (row: Patient) => (
        <span className={`px-2 py-1 rounded ${getStatusBgColor(row.visit.visitStatus)}`}>
          {row.visit.visitStatus}
        </span>
      ),
    },
    { header: 'Total Amount', accessor: (row: Patient) => row.visit.billing.totalAmount },
    {
      header: 'Actions',
      accessor: (row: Patient) => (
        <div className="flex gap-2">
          <button className="px-2 py-1 text-white bg-primary rounded hover:bg-primary-light" onClick={handleView(row)}>
            <FaEye />
          </button>
          <button className="px-2 py-1 text-white bg-green-500 rounded hover:bg-primary-light" onClick={() => handleUpdate(row)}>
            <FaCloudDownloadAlt />
          </button>
        </div>
      ),
    },
  ];

  // Function to get background color based on visit status
  const getStatusBgColor = (status: string): string => {
    switch (status) {
      case VisitStatus.PENDING:
        return 'bg-yellow-500'; // Yellow background for pending status
      case VisitStatus.COMPLETED:
        return 'bg-green-500'; // Green background for completed status
      case VisitStatus.CANCELLED:
        return 'bg-red-500'; // Red background for cancelled status
      case VisitStatus.IN_PROGRESS:
        return 'bg-blue-500'; // Blue background for active status
      default:
        return 'bg-gray-500'; // Default color for other cases
    }
  };

  // Function to clear all filters
  const clearFilters = () => {
    setStatusFilter('');
    setVisitTypeFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  return (
    <div className="text-xs p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-1 py-1 rounded text-xs"
          >
            <option value="">All</option>
            {Object.values(VisitStatus).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1">Visit Type:</label>
          <select
            value={visitTypeFilter}
            onChange={(e) => setVisitTypeFilter(e.target.value)}
            className="border px-1 py-1 rounded text-xs"
          >
            <option value="">All</option>
            {Object.values(VisitType).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1">Date Range:</label>
          <div className="flex gap-1">
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="border px-1 py-1 rounded text-xs"
            />
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="border px-1 py-1 rounded text-xs"
            />
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <Button
            text='Clear'
            className="px-2 flex items-center py-1 text-xs text-white bg-gray-500 rounded hover:bg-gray-600"
            onClick={clearFilters}
          >
            <CiFilter className="mr-1" />
            {/* Clear */}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-primary text-white">
              {columns.map((col, index) => (
                <th key={index} className="px-4 py-2 border border-gray-300 text-left">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedPatients.length > 0 ? (
              paginatedPatients.map((visit, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 border border-gray-300">{col.accessor(visit)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-2 text-center">No visits available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default VisitingList;
