import { getAllPatientVisitsByDateRangeoflab  } from '@/../services/patientServices';
import { useLabs } from '@/context/LabContext';
import { Patient } from '@/types/patient/patient';
import { PlusIcon, SearchIcon } from 'lucide-react';
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
import ReportView from './Report/ReportView';

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
  // const [patientList, setPatientList] = useState<Patient[]>([]);
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
  const [updatePatientListVist, setUpdatePatientListVist] = useState<boolean>(false);
  const [addUpdatePatientListVist, setAddUpdatePatientListVist] = useState<boolean>(false);
  const [viewReportModal, setViewReportModal] = useState<boolean>(false);
  const [viewReportDetails, setViewReportDetails] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, visitTypeFilter, dateRangeFilter, customStartDate, customEndDate, searchQuery]);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setIsLoading(true);
        if (currentLab?.id) {
          // Calculate date range based on filters
          const now = new Date();
          let startDate: string = '';
          let endDate: string = '';

          switch (dateRangeFilter) {
            case 'today':
              startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString().split('T')[0];
              endDate = new Date().toISOString().split('T')[0];
              break;
            case 'yesterday':
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              startDate = yesterday.toISOString().split('T')[0];
              endDate = yesterday.toISOString().split('T')[0];
              break;
            case 'last7days':
              const lastWeek = new Date();
              lastWeek.setDate(now.getDate() - 7);
              startDate = lastWeek.toISOString().split('T')[0];
              endDate = new Date().toISOString().split('T')[0];
              break;
            case 'thismonth':
              startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
              endDate = new Date().toISOString().split('T')[0];
              break;
            case 'thisyear':
              startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
              endDate = new Date().toISOString().split('T')[0];
              break;
            case 'custom':
              startDate = customStartDate;
              endDate = customEndDate;
              break;
            case 'last24hours':
            default:
              const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
              startDate = last24Hours.toISOString().split('T')[0];
              endDate = new Date().toISOString().split('T')[0];
              break;
          }

          const response = await getAllPatientVisitsByDateRangeoflab (
            currentLab.id,
            startDate,
            endDate
          );
          console.log('Fetched visits:', response);
          setPatientList(response || []); // response is now the array
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
  }, [currentLab, updatePatientListVist, addUpdatePatientListVist, dateRangeFilter, customStartDate, customEndDate]);

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

  // check the patientList is not null or undefined before filtering
  if (!patientList) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader type="progress" fullScreen={false} text="No patient visits found." />
      </div>
    );
  }

  const filteredPatients = patientList?.filter((visit) => {
      if (!visit) return false;
    let isValid = true;

    // Add null checks
    if (!visit?.visit) return false;

    const visitDate = new Date(visit?.visit?.visitDate);

    if (statusFilter && visit?.visit?.visitStatus?.toUpperCase() !== statusFilter.toUpperCase()) {
      isValid = false;
    }

    if (visitTypeFilter && visit?.visit?.visitType !== visitTypeFilter) {
      isValid = false;
    }

    if (startDate && visitDate < startDate) {
      isValid = false;
    }

    if (endDate && visitDate > endDate) {
      isValid = false;
    }

    // Search filter with null checks
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = `${visit?.firstName || ''} ${visit?.lastName || ''}`.toLowerCase().includes(query);
      const phoneMatch = visit?.phone?.toLowerCase().includes(query);
      if (!nameMatch && !phoneMatch) {
        isValid = false;
      }
    }

    return isValid;
  }) || [];
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

  const handleViewViewReport = (visit: Patient) => () => {
    setViewReportDetails(visit);
    setViewReportModal(true);
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
    setSearchQuery('');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns = [
    {
      header: 'ID',
      accessor: (row: Patient) => (
        <span className="font-mono text-sm text-gray-700">
          {row?.visit?.visitId}
        </span>
      ),
      className: 'whitespace-nowrap'
    },
    {
      header: 'Patient Name',
      accessor: (row: Patient) => (
        <div className="flex flex-col min-w-[120px]">
          <span className="font-medium text-gray-900 truncate">{`${row?.firstName} ${row?.lastName}`}</span>
          <span className="text-xs text-gray-500">{row?.phone}</span>
        </div>
      ),
      className: 'min-w-[120px]'
    },
    {
      header: 'Visit Date',
      accessor: (row: Patient) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700 whitespace-nowrap">
            {formatDate(row?.visit?.visitDate)}
          </span>
        </div>
      ),
      className: 'whitespace-nowrap'
    },
    {
      header: 'Visit Type',
      accessor: (row: Patient) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row?.visit?.visitType === VisitType.IN_PATIENT
          ? 'bg-purple-100 text-purple-800'
          : 'bg-indigo-100 text-indigo-800'
          }`}>
          {row?.visit?.visitType}
        </span>
      ),
      className: 'whitespace-nowrap'
    },
    {
      header: 'Status',
      accessor: (row: Patient) => {
        const status = row?.visit?.visitStatus as string;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorMap[status as keyof typeof statusColorMap] || 'bg-gray-100 text-gray-800'
            }`}>
            {status}
          </span>
        );
      },
      className: 'whitespace-nowrap'
    },
    {
      header: 'Net Amount',
      accessor: (row: Patient) => (
        <span className="font-medium text-gray-900 whitespace-nowrap">
          ₹{row?.visit?.billing?.netAmount?.toFixed(2) || '0.00'}
        </span>
      ),
      className: 'whitespace-nowrap'
    },
    {
      header: 'Invoice',
      accessor: (row: Patient) => (
        <Button
          text=""
          className="px-2 py-1 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors duration-200"
          onClick={handleView(row)}
        >
          <LiaFileInvoiceSolid size={14} />
        </Button>
      ),
      className: 'whitespace-nowrap'
    },
    {
      header: 'Reports',
      accessor: (row: Patient) => (
        <div className="whitespace-nowrap">
          {row?.visit?.visitStatus === 'Completed' ? (
            <Button
              text=""
              className="px-2 py-1 text-white bg-green-600 rounded hover:bg-green-700 transition-colors duration-200"
              onClick={handleViewViewReport(row)}
            >
              <LiaFileInvoiceSolid size={14} />
            </Button>
          ) : (
            <span className="text-xs text-gray-500">Not Available</span>
          )}
        </div>
      ),
      className: 'whitespace-nowrap'
    },
    {
      header: 'Actions',
      accessor: (row: Patient) => (
        <div className="flex gap-2 whitespace-nowrap">
          {row?.visit?.visitStatus === 'Pending' && (
            <>
              <Button
                text=""
                className="px-2 py-1 text-white bg-amber-600 rounded hover:bg-amber-700 transition-colors duration-200"
                onClick={handleEditpatientDetails(row)}
              >
                <FaEdit size={14} />
              </Button>
              <Button
                text=""
                className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700 transition-colors duration-200"
                onClick={() => toast.error('Delete action is not implemented yet', {
                  autoClose: 2000,
                  className: 'bg-red-50 text-red-800'
                })}
              >
                <MdOutlineDeleteSweep size={14} />
              </Button>
            </>
          )}
        </div>
      ),
      className: 'whitespace-nowrap'
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              {/* Search Field */}
              <div className="flex flex-col min-w-[240px]">
                <label className="text-xs font-medium text-gray-600 mb-1">Search by Name/Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border border-gray-300 px-3 py-2 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col min-w-[160px]">
                <label className="text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="">All Statuses</option>
                  {Object.values(VisitStatus).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Visit Type Filter */}
              <div className="flex flex-col min-w-[160px]">
                <label className="text-xs font-medium text-gray-600 mb-1">Visit Type</label>
                <select
                  value={visitTypeFilter}
                  onChange={(e) => setVisitTypeFilter(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="">All Types</option>
                  {Object.values(VisitType).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="flex flex-col min-w-[160px]">
                <label className="text-xs font-medium text-gray-600 mb-1">Date Range</label>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
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
                  <div className="flex flex-col min-w-[160px]">
                    <label className="text-xs font-medium text-gray-600 mb-1">From Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="border border-gray-300 px-3 py-2 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    />
                  </div>

                  <div className="flex flex-col min-w-[160px]">
                    <label className="text-xs font-medium text-gray-600 mb-1">To Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="border border-gray-300 px-3 py-2 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    />
                  </div>
                </>
              )}

              {/* Clear Filters */}
              {(statusFilter || visitTypeFilter || dateRangeFilter !== 'last24hours' || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 px-3 py-2 mt-5 text-sm text-red-600 hover:text-red-800 transition-colors duration-200 bg-white border border-gray-300 rounded-md shadow-sm"
                  title="Clear all filters"
                >
                  <FaFilterCircleXmark className="text-base" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>
          <Button
            text=''
            onClick={handleAddPatient}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
          >
            <PlusIcon size={16} />
            <span>New Patient</span>
          </Button>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader type="progress" fullScreen={false} text="Loading patient visits..." />
            <p className="mt-4 text-sm text-gray-500">Fetching the latest visit data...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <TableComponent
                columns={columns}
                data={paginatedPatients}
              />
            </div>

            {filteredPatients.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredPatients.length)}</span> of{' '}
                  <span className="font-medium">{filteredPatients.length}</span> visits
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

      <Modal
        isOpen={addPatientModal}
        onClose={() => setAddPatientModal(false)}
        title="Register New Patient"
        modalClassName="max-w-5xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
      >
        <AddPatientComponent
          setAddPatientModal={setAddPatientModal}
          setAddUpdatePatientListVist={setAddUpdatePatientListVist}
          addUpdatePatientListVist={addUpdatePatientListVist}
        />
      </Modal>

      <Modal
        isOpen={viewPatientModal}
        onClose={() => setViewPatientModal(false)}
        title="Invoice Details"
        modalClassName="max-w-4xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
      >
        <PatientDetailsViewComponent />
      </Modal>

      <Modal
        isOpen={editPatientDetailsModal}
        onClose={() => setEditPatientDetailsModal(false)}
        title="Edit Patient Details"
        modalClassName="max-w-5xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
      >
        <EditPatientDetails
          setEditPatientDetailsModal={setEditPatientDetailsModal}
          editPatientDetails={editPatientDetails}
          setUpdatePatientListVist={setUpdatePatientListVist}
          updatePatientListVist={updatePatientListVist}
        />
      </Modal>

      <Modal
        isOpen={viewReportModal}
        onClose={() => setViewReportModal(false)}
        title="Report"
        modalClassName="max-w-4xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
      >
        {viewReportDetails && (
          <ReportView
            viewReportDetailsbyId={viewReportDetails.visit?.visitId ?? 0}
            viewPatient={{
              visitId: viewReportDetails.visit?.visitId ?? 0,
              patientname: `${viewReportDetails.firstName} ${viewReportDetails.lastName}`,
              contactNumber: viewReportDetails.phone,
              visitDate: viewReportDetails.visit?.visitDate ?? '',
              visitStatus: viewReportDetails.visit?.visitStatus ?? VisitStatus.PENDING,
              gender: viewReportDetails.gender ?? '',
              email: viewReportDetails.email ?? '',
              sampleNames: [],
              testIds: viewReportDetails.visit?.testIds ?? [],
              packageIds: viewReportDetails.visit?.packageIds ?? [],
              dateOfBirth: viewReportDetails.dateOfBirth ?? '',
              visitType: viewReportDetails.visit?.visitType ?? VisitType.OUT_PATIENT,
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default PatientVisitListTable;