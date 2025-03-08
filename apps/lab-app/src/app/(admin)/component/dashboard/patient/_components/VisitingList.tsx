import { getAllVisits } from '@/../services/patientServices';
import { useLabs } from '@/context/LabContext';
import { Patient } from '@/types/patient/patient';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { CiFilter } from "react-icons/ci";
import { FaEye } from 'react-icons/fa';
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
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, visitTypeFilter, startDateFilter, endDateFilter]);

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

  const filteredPatients = patientList.filter((visit) => {
    let isValid = true;
    if (statusFilter && visit.visit.visitStatus.toUpperCase() !== statusFilter.toUpperCase()) {
      isValid = false;
    }
    if (visitTypeFilter && visit.visit.visitType !== visitTypeFilter) {
      isValid = false;
    }
    if (startDateFilter && new Date(visit.visit.visitDate) < new Date(startDateFilter)) {
      isValid = false;
    }
    if (endDateFilter && new Date(visit.visit.visitDate) > new Date(endDateFilter)) {
      isValid = false;
    }
    return isValid;
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => new Date(b.visit.visitDate).getTime() - new Date(a.visit.visitDate).getTime());
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = sortedPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleView = (visit: Patient) => () => {
    setPatientDetails(visit);
    router.push('/dashboard/patients');
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setVisitTypeFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const columns = [
    { header: 'Visit ID', accessor: (row: Patient) => row.visit.visitId },
    { header: 'Name', accessor: (row: Patient) => `${row.firstName} ${row.lastName}` },
    { header: 'Visit Date', accessor: (row: Patient) => row.visit.visitDate },
    { header: 'Visit Type', accessor: (row: Patient) => row.visit.visitType },
    { header: 'Sample Status', accessor: (row: Patient) => row.visit.visitStatus },
    { header: 'Total Amount', accessor: (row: Patient) => row.visit.billing.totalAmount },
    {
      header: 'Actions',
      accessor: (row: Patient) => (
        <button className="px-2 py-1 text-white bg-primary rounded hover:bg-primary-light" onClick={handleView(row)}>
          <FaEye />
        </button>
      ),
    },
  ];

  return (
    <div className="text-xs p-4">
      {/* Filter UI */}
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
          <label className="text-xs font-semibold mb-1">Start Date:</label>
          <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className="border px-2 py-1 rounded text-xs" />
        </div>

        <div className="flex flex-col w-40">
          <label className="text-xs font-semibold mb-1">End Date:</label>
          <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className="border px-2 py-1 rounded text-xs" />
        </div>

        <button onClick={handleClearFilters} className="px-4 py-2 bg-red-600 text-white rounded flex items-center">
          <CiFilter className="mr-1 text-white" /> Clear Filters
        </button>
      </div>

      {/* Table Component */}
      <TableComponent columns={columns} data={paginatedPatients} />

      {/* Pagination Component */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default VisitingList;
