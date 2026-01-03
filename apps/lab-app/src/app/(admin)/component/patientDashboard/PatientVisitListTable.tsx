import { getAllPatientVisitsByDateRangeoflab } from '@/../services/patientServices';
import { useLabs } from '@/context/LabContext';
import { Patient, VisitType } from '@/types/patient/patient';
import { DATE_FILTER_OPTIONS, DateFilterOption, formatDateForAPI, getDateRange } from '@/utils/dateUtils';
import { PlusIcon, SearchIcon, XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { FaFilterCircleXmark } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
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
import CancelPatient from './CancelPatient';
import DuePayment from './DuePayment';
import CancellationDetailsModal from './CancellationDetailsModal';
import useAuthStore from '@/context/userStore';

enum VisitStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}


const PatientVisitListTable: React.FC = () => {
  const { currentLab, setPatientDetails, patientDetails } = useLabs();
  const { user: loginedUser } = useAuthStore();

  // Check user roles for filter access
  const roles = loginedUser?.roles || [];
  const isAdmin = roles.includes('ADMIN');
  const isSuperAdmin = roles.includes('SUPERADMIN');
  const isDeskRole = roles.includes('DESKROLE');
  const canAccessCancelledFilter = isAdmin || isSuperAdmin;

  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [visitTypeFilter, setVisitTypeFilter] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateFilterOption>('today');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [showAddPatientForm, setShowAddPatientForm] = useState<boolean>(false);
  const [viewPatientModal, setViewPatientModal] = useState<boolean>(false);
  const [editPatientDetailsModal, setEditPatientDetailsModal] = useState<boolean>(false);
  const [editPatientDetails, setEditPatientDetails] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updatePatientListVist, setUpdatePatientListVist] = useState<boolean>(false);
  const [addUpdatePatientListVist, setAddUpdatePatientListVist] = useState<boolean>(false);
  const [viewReportModal, setViewReportModal] = useState<boolean>(false);
  const [viewReportDetails, setViewReportDetails] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deletePatientModal, setDeletePatientModal] = useState<boolean>(false);
  const [duePaymentModal, setDuePaymentModal] = useState<boolean>(false);
  const [cancellationDetailsModal, setCancellationDetailsModal] = useState<boolean>(false);
  const [hasCustomDateInteraction, setHasCustomDateInteraction] = useState<boolean>(false);
  // Removed unused state variable

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, visitTypeFilter, dateRangeFilter, customStartDate, customEndDate, searchQuery]);

  const fetchVisits = async () => {
    try {
      setIsLoading(true);
      if (currentLab?.id) {
        // Validate custom dates before proceeding
        if (!validateCustomDates()) {
          setIsLoading(false);
          return;
        }

        const { startDate, endDate } = getDateRange(dateRangeFilter, customStartDate, customEndDate);

        if (!startDate || !endDate) return;

        const formattedStartDate = formatDateForAPI(startDate);
        const formattedEndDate = formatDateForAPI(endDate);



        const response = await getAllPatientVisitsByDateRangeoflab(
          currentLab.id,
          formattedStartDate,
          formattedEndDate
        );
        setPatientList(response || []);
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

  useEffect(() => {
    fetchVisits();
  }, [currentLab, updatePatientListVist, addUpdatePatientListVist, dateRangeFilter, customStartDate, customEndDate]);

  const { startDate, endDate } = getDateRange(dateRangeFilter, customStartDate, customEndDate);

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

    if (!visit?.visit) return false;

    const visitDate = new Date(visit?.visit?.visitDate);

    // Hide cancelled data for deskrole users
    if (isDeskRole && visit?.visit?.visitStatus?.toUpperCase() === 'CANCELLED') {
      return false;
    }

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

  // Sort patients by visit date (latest first) and then by visit ID (latest first) as fallback
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const dateA = new Date(a?.visit?.visitDate || 0);
    const dateB = new Date(b?.visit?.visitDate || 0);

    // First sort by visit date (latest first)
    const dateComparison = dateB.getTime() - dateA.getTime();

    // If dates are equal, sort by visit ID (latest first)
    if (dateComparison === 0) {
      return (b?.visit?.visitId || 0) - (a?.visit?.visitId || 0);
    }

    return dateComparison;
  });

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
    setShowAddPatientForm(true);
  };

  const handleCancelAddPatient = () => {
    setShowAddPatientForm(false);
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setVisitTypeFilter('');
    setDateRangeFilter('today');
    setCustomStartDate(null);
    setCustomEndDate(null);
    setSearchQuery('');
    setHasCustomDateInteraction(false);
  };

  const validateCustomDates = () => {
    if (dateRangeFilter === 'custom') {
      // Only show validation errors if user has actually interacted with the date fields
      if (!hasCustomDateInteraction) {
        return false; // Don't show errors until user interacts
      }

      if (!customStartDate && !customEndDate) {
        toast.warning('Please select both start and end dates');
        return false;
      }

      if (!customStartDate) {
        toast.warning('Please select a start date');
        return false;
      }

      if (!customEndDate) {
        toast.warning('Please select an end date');
        return false;
      }

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (customStartDate > today) {
        toast.warning('Start date cannot be in the future');
        return false;
      }

      if (customEndDate > today) {
        toast.warning('End date cannot be in the future');
        return false;
      }

      if (customStartDate > customEndDate) {
        toast.warning('Start date cannot be after end date');
        return false;
      }
    }
    return true;
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
      header: 'Visit Code',
      accessor: (row: Patient) => (
        <span className="font-mono text-sm text-gray-700">
          {row?.visit?.visitCode || row?.visit?.visitId}
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
      accessor: (row: Patient) => {
        const visitType = row?.visit?.visitType;
        let bgColor = 'bg-gray-100 text-gray-800';

        switch (visitType) {
          case VisitType.IN_PATIENT:
            bgColor = 'bg-purple-100 text-purple-800';
            break;
          case VisitType.OUT_PATIENT:
            bgColor = 'bg-indigo-100 text-indigo-800';
            break;
          case VisitType.DAYCARE:
            bgColor = 'bg-green-100 text-green-800';
            break;
          case VisitType.WAKING:
            bgColor = 'bg-orange-100 text-orange-800';
            break;
          default:
            bgColor = 'bg-gray-100 text-gray-800';
        }

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
            {visitType}
          </span>
        );
      },
      className: 'whitespace-nowrap'
    },
    {
      header: 'Report Status',
      accessor: (row: Patient) => {
        const visitStatus = row?.visit?.visitStatus;

        // If visit is cancelled, show cancelled status
        if (visitStatus?.toUpperCase() === 'CANCELLED') {
          return (
            <div className="flex flex-col gap-1">
              <span className="bg-red-100 text-red-800 rounded-full text-xs px-2 py-1 font-semibold">
                Cancelled
              </span>
              <button
                onClick={() => {
                  setPatientDetails(row);
                  setCancellationDetailsModal(true);
                }}
                className="text-xs text-red-600 hover:text-red-800 hover:underline"
                title="View cancellation details"
              >
                View Details
              </button>
            </div>
          );
        }

        // Check if the patient has test results (similar to CompletedTable logic)
        if (!row?.visit?.testResult || row.visit.testResult.length === 0) {
          return (
            <span className="bg-gray-100 text-gray-800 rounded-full text-xs px-2 py-1 font-semibold">
              No Results
            </span>
          );
        }

        const totalTests = row.visit.testResult.length;
        const completedTests = row.visit.testResult.filter(tr => tr.reportStatus === 'Completed').length;

        if (completedTests === totalTests) {
          // If there's only 1 test and it's completed, show "Completed"
          // If there are multiple tests and all are completed, show "All Completed"
          const statusText = totalTests === 1 ? 'Completed' : 'All Completed';
          return (
            <div className="flex flex-col gap-1">
              <span className="bg-green-100 text-green-800 rounded-full text-xs px-2 py-1 font-semibold">
                {statusText}
              </span>
              <button
                onClick={handleViewViewReport(row)}
                className="text-xs text-green-600 hover:text-green-800 hover:underline"
                title="View report"
              >
                View Report
              </button>
            </div>
          );
        } else if (completedTests > 0) {
          // Show partial completion
          return (
            <div className="flex flex-col gap-1">
              <span className="bg-blue-100 text-blue-800 rounded-full text-xs px-2 py-1 font-semibold">
                {completedTests}/{totalTests} Completed
              </span>
              <button
                onClick={handleViewViewReport(row)}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                title="View report"
              >
                View Report 
              </button>
            </div>
          );
        } else {
          // No tests completed yet
          return (
            <span className="bg-yellow-100 text-yellow-800 rounded-full text-xs px-2 py-1 font-semibold">
              Pending
            </span>
          );
        }
      },
      className: 'whitespace-nowrap'
    },
    {
      header: 'Payment Status',
      accessor: (row: Patient) => {
        const dueAmount = Number(row?.visit?.billing?.due_amount || 0);
        const isPaid = dueAmount === 0;

        const badgeClass = isPaid
          ? 'bg-green-100 text-green-800'
          : 'bg-amber-100 text-amber-800';

        return (
          <div className="flex flex-col">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
              {isPaid ? 'PAID' : `DUE (₹${dueAmount.toFixed(2)})`}
            </span>
            {!isPaid && dueAmount > 0 && (
              <button
                onClick={() => {
                  setPatientDetails(row);
                  setDuePaymentModal(true);
                }}
                className="mt-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                Collect Due
              </button>
            )}
          </div>
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
      header: 'Bill Invoice',
      accessor: (row: Patient) => {
        // Check if visit is cancelled
        const isCancelled = row?.visit?.visitStatus?.toUpperCase() === 'CANCELLED';

        if (isCancelled) {
          return (
            <span className="text-red-600 text-sm font-medium">
              Invoice Cancelled
            </span>
          );
        }

        return (
          <div title="View Bill Invoice">
            <Button
              text=""
              className="px-2 py-1 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors duration-200"
              onClick={handleView(row)}
            >
              <LiaFileInvoiceSolid size={14} />
            </Button>
          </div>
        );
      },
      className: 'whitespace-nowrap'
    },

    {
      header: 'Actions',
      accessor: (row: Patient) => {
        // Check if visit is cancelled
        const isCancelled = row?.visit?.visitStatus?.toUpperCase() === 'CANCELLED';

        // Check if report status is pending (no test results or all tests are pending)
        const hasTestResults = row?.visit?.testResult && row.visit.testResult.length > 0;
        const isReportPending = !hasTestResults || (row?.visit?.testResult && row.visit.testResult.every(tr => tr.reportStatus === 'Pending'));

        return (
          <div className="flex gap-2 whitespace-nowrap">
            {!isCancelled && isReportPending && (
              <>
                {/* Edit Button - Only visible for SUPERADMIN role */}
                {isSuperAdmin || isAdmin|| isDeskRole && (
                  <Button 
                    text=""
                    className="px-2 py-1 text-white bg-amber-600 rounded hover:bg-amber-700 transition-colors duration-200"
                    onClick={handleEditpatientDetails(row)}
                  >
                    <FaEdit size={14} />
                  </Button>
                )}
                <Button
                  text=""
                  className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700 transition-colors duration-200"
                  onClick={() => {
                    setDeletePatientModal(true);
                    setPatientDetails(row);
                  }}
                >
                  <MdOutlineDeleteSweep size={14} />
                </Button>
              </>
            )}
          </div>
        );
      },
      className: 'whitespace-nowrap'
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Compact Header */}
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">{
          showAddPatientForm ? 'Register New Patient' : 'Patient Visits'
        }</h2>
        {showAddPatientForm ? (
          <Button
            text=""
            onClick={handleCancelAddPatient}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 rounded-md"
          >
            <XIcon size={16} />
            <span>Close</span>
          </Button>
        ) : (
          <Button
            text=""
            onClick={handleAddPatient}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 rounded-md"
          >
            <PlusIcon size={16} />
            <span>New Patient</span>
          </Button>
        )}
      </div>

      {/* Filters Section - Only shown when not in add patient mode */}
      {!showAddPatientForm && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Field */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="min-w-[150px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">All Status</option>
                {Object.values(VisitStatus).map((status) => (
                  // Hide "Cancelled" option for non-admin users
                  (status === VisitStatus.CANCELLED && !canAccessCancelledFilter) ? null : (
                    <option key={status} value={status}>{status}</option>
                  )
                ))}
              </select>
            </div>

            {/* Visit Type Filter */}
            <div className="min-w-[150px]">
              <select
                value={visitTypeFilter}
                onChange={(e) => setVisitTypeFilter(e.target.value)}
                className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">All Types</option>
                {Object.values(VisitType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="min-w-[150px]">
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value as DateFilterOption)}
                className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                {DATE_FILTER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Date Range */}
            {dateRangeFilter === 'custom' && (
              <>
                <div className="min-w-[150px]">
                  <input
                    type="date"
                    value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      setHasCustomDateInteraction(true);
                      setCustomStartDate(e.target.value ? new Date(e.target.value) : null);
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  />
                </div>

                <div className="min-w-[150px]">
                  <input
                    type="date"
                    value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      setHasCustomDateInteraction(true);
                      setCustomEndDate(e.target.value ? new Date(e.target.value) : null);
                    }}
                    min={customStartDate ? customStartDate.toISOString().split('T')[0] : undefined}
                    max={new Date().toISOString().split('T')[0]}
                    className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  />
                </div>
              </>
            )}

            {/* Clear Filters */}
            {(statusFilter || visitTypeFilter || dateRangeFilter !== 'today' || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 transition-colors duration-200 bg-white border border-gray-300 rounded-md shadow-sm"
                title="Clear all filters"
              >
                <FaFilterCircleXmark className="text-base" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader type="progress" fullScreen={false} text="Loading patient visits..." />
          </div>
        ) : (
          <>
            {showAddPatientForm ? (
              <AddPatientComponent
                setAddPatientModal={setShowAddPatientForm}
                setAddUpdatePatientListVist={setAddUpdatePatientListVist}
                addUpdatePatientListVist={addUpdatePatientListVist}
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <TableComponent
                    columns={columns}
                    data={paginatedPatients}
                  />
                </div>

                {filteredPatients.length > 0 && (
                  <div className="mt-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-sm text-gray-600">
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
          </>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={viewPatientModal}
        onClose={() => setViewPatientModal(false)}
        title="Invoice Details"
        modalClassName="max-w-4xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
      >
        {patientDetails && <PatientDetailsViewComponent patient={patientDetails} />}
      </Modal>

      <Modal
        isOpen={editPatientDetailsModal}
        onClose={() => setEditPatientDetailsModal(false)}
        title="Edit Patient Details"
        modalClassName="max-w-7xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
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
              patientname: `${viewReportDetails.firstName} ${viewReportDetails.lastName}`.trim(),
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
              doctorId: viewReportDetails.visit?.doctorId !== undefined && viewReportDetails.visit?.doctorId !== null
                ? Number(viewReportDetails.visit?.doctorId)
                : 0,
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={deletePatientModal}
        onClose={() => setDeletePatientModal(false)}
        title="Cancel Patient Visit"
        modalClassName="max-w-md rounded-lg overflow-hidden"
      >
        <CancelPatient
          isOpen={deletePatientModal}
          onClose={() => setDeletePatientModal(false)}
          onPatientCancelled={fetchVisits}
        />
      </Modal>

      {/* Cancellation Details Modal */}
      <CancellationDetailsModal
        isOpen={cancellationDetailsModal}
        onClose={() => setCancellationDetailsModal(false)}
        patientDetails={patientDetails!}
      />

      <Modal
        isOpen={duePaymentModal}
        onClose={() => setDuePaymentModal(false)}
        title="Due Payment"
        modalClassName="max-w-4xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
      >
        {patientDetails && (
          <DuePayment
            patient={patientDetails!}
            onClose={() => setDuePaymentModal(false)}
            onPaymentSuccess={() => {
              // Refresh the patient list to get updated data
              fetchVisits();
              // Close the modal
              setDuePaymentModal(false);
              // Show success message
              toast.success('Payment processed successfully!', {
                autoClose: 3000,
                className: 'bg-green-50 text-green-800'
              });
            }}
            currentUser={{ username: loginedUser?.username || 'current_user' }}
          />
        )}
      </Modal>
    </div>
  );
};

export default PatientVisitListTable;