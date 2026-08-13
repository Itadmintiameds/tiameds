import { getAllPatientVisitsByDateRangeoflab } from '@/../services/patientServices';
import { useLabs } from '@/context/LabContext';
import { Patient, VisitType } from '@/types/patient/patient';
import { DATE_FILTER_OPTIONS, DateFilterOption, formatDateForAPI, getDateRange } from '@/utils/dateUtils';
import { Edit, Plus, Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { FaFilterCircleXmark } from "react-icons/fa6";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { HiOutlineTrash } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import Loader from '../common/Loader';
import NewCommonTable, { Column } from '@/app/(admin)/dashboard/newcommoncomponent/NewCommonTable';
import NewModal from '@/app/(admin)/dashboard/newcommoncomponent/NewModal';
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

enum BillStatus {
  PAID = 'PAID',
  DUE = 'DUE',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  CANCELLED = 'CANCELLED',
}

const BILL_STATUS_LABELS: Record<BillStatus, string> = {
  [BillStatus.PAID]: 'Paid',
  [BillStatus.DUE]: 'Due',
  [BillStatus.PARTIALLY_PAID]: 'Partially Paid',
  [BillStatus.CANCELLED]: 'Cancelled',
};

const getBillStatus = (visit: Patient): BillStatus => {
  if (visit?.visit?.visitStatus?.toUpperCase() === 'CANCELLED') {
    return BillStatus.CANCELLED;
  }

  const paymentStatus = visit?.visit?.billing?.paymentStatus?.toUpperCase();

  switch (paymentStatus) {
    case 'PAID':
      return BillStatus.PAID;
    case 'PARTIALLY_PAID':
      return BillStatus.PARTIALLY_PAID;
    case 'DUE':
    case 'UNPAID':
      return BillStatus.DUE;
    default: {
      const dueAmount = Number(visit?.visit?.billing?.due_amount || 0);
      const receivedAmount = Number(visit?.visit?.billing?.received_amount || 0);

      if (dueAmount <= 0) {
        return BillStatus.PAID;
      }

      return receivedAmount > 0 ? BillStatus.PARTIALLY_PAID : BillStatus.DUE;
    }
  }
};


interface PatientVisitListTableProps {
  onAddPatientFormChange?: (isOpen: boolean) => void;
}

const PatientVisitListTable: React.FC<PatientVisitListTableProps> = ({ onAddPatientFormChange }) => {
  const { currentLab, setPatientDetails, patientDetails } = useLabs();
  const { user: loginedUser } = useAuthStore();

  // Check user roles for filter access
  const roles = loginedUser?.roles || [];
  const isAdmin = roles.includes('ADMIN');
  const isSuperAdmin = roles.includes('SUPERADMIN');
  const isDeskRole = roles.includes('DESKROLE');
  const canAccessCancelledFilter = isAdmin || isSuperAdmin;

  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [billStatusFilter, setBillStatusFilter] = useState<string>('');
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

  // Notify parent when the add patient form opens/closes so it can hide surrounding navigation
  useEffect(() => {
    onAddPatientFormChange?.(showAddPatientForm);
    return () => {
      onAddPatientFormChange?.(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddPatientForm]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLab, updatePatientListVist, addUpdatePatientListVist, dateRangeFilter, customStartDate, customEndDate]);

  const { startDate, endDate } = getDateRange(dateRangeFilter, customStartDate, customEndDate);

  const filteredPatients = (patientList || []).filter((visit) => {
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

    if (billStatusFilter && getBillStatus(visit) !== billStatusFilter) {
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
  });

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

  // Use useMemo to create a reset key based on filter changes so NewCommonTable resets to page 1
  const resetPageKey = useMemo(
    () => JSON.stringify({ statusFilter, billStatusFilter, visitTypeFilter, dateRangeFilter, customStartDate, customEndDate, searchQuery }),
    [statusFilter, billStatusFilter, visitTypeFilter, dateRangeFilter, customStartDate, customEndDate, searchQuery]
  );

  const dueVisitsCount = useMemo(
    () => (patientList || []).filter(
      (v) => v?.visit?.visitStatus?.toUpperCase() !== 'CANCELLED' && Number(v?.visit?.billing?.due_amount || 0) > 0
    ).length,
    [patientList]
  );
  const cancelledVisitsCount = useMemo(
    () => (patientList || []).filter((v) => v?.visit?.visitStatus?.toUpperCase() === 'CANCELLED').length,
    [patientList]
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

  const handleClearFilters = () => {
    setStatusFilter('');
    setBillStatusFilter('');
    setVisitTypeFilter('');
    setDateRangeFilter('today');
    setCustomStartDate(null);
    setCustomEndDate(null);
    setSearchQuery('');
    setHasCustomDateInteraction(false);
  };

  function validateCustomDates() {
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
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns: Column<Patient>[] = [
    {
      header: 'Visit Code',
      accessor: 'visitCode',
      render: (row: Patient) => (
        <span className="font-mono text-p3 text-pneutral-700">
          {row?.visit?.visitCode || row?.visit?.visitId}
        </span>
      ),
    },
    {
      header: 'Patient Name',
      accessor: 'patientName',
      render: (row: Patient) => (
        <div className="flex flex-col min-w-[120px]">
          <span className="font-semibold text-p3 text-pneutral-900 truncate">{`${row?.firstName} ${row?.lastName}`}</span>
          <span className="text-p2 text-pneutral-500">{row?.phone}</span>
        </div>
      ),
    },
    {
      header: 'Visit Date',
      accessor: 'visitDate',
      render: (row: Patient) => (
        <span className="text-p3 text-pneutral-700 whitespace-nowrap">
          {formatDate(row?.visit?.visitDate)}
        </span>
      ),
    },
    {
      header: 'Visit Type',
      accessor: 'visitType',
      render: (row: Patient) => {
        const visitType = row?.visit?.visitType;
        let pillClass = 'bg-pneutral-100 text-pneutral-700';

        switch (visitType) {
          case VisitType.IN_PATIENT:
            pillClass = 'bg-danger-100 text-warning-800';
            break;
          case VisitType.OUT_PATIENT:
            pillClass = 'bg-info-50 text-info-700';
            break;
          case VisitType.DAYCARE:
            pillClass = 'bg-success-50 text-success-700';
            break;
          case VisitType.WAKING:
            pillClass = 'bg-warning-50 text-warning-700';
            break;
          default:
            pillClass = 'bg-pneutral-100 text-pneutral-700';
        }

        return (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-p2 font-medium ${pillClass}`}>
            {visitType}
          </span>
        );
      },
    },
    {
      header: 'Report Status',
      accessor: 'reportStatus',
      render: (row: Patient) => {
        const visitStatus = row?.visit?.visitStatus;

        // If visit is cancelled, show cancelled status
        if (visitStatus?.toUpperCase() === 'CANCELLED') {
          return (
            <div className="flex flex-col gap-1">
              <span className="inline-flex items-center rounded-full bg-warning-50 px-3 py-1 text-p2 font-medium text-warning-700 w-fit">
                Cancelled
              </span>
              <button
                onClick={() => {
                  setPatientDetails(row);
                  setCancellationDetailsModal(true);
                }}
                className="text-p2 text-warning-600 hover:text-warning-800 hover:underline text-left"
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
            <span className="inline-flex items-center rounded-full bg-pneutral-100 px-3 py-1 text-p2 font-medium text-pneutral-700">
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
              <span className="inline-flex items-center rounded-full bg-success-50 px-3 py-1 text-p2 font-medium text-success-700 w-fit">
                {statusText}
              </span>
              <button
                onClick={handleViewViewReport(row)}
                className="text-p2 text-success-600 hover:text-success-800 hover:underline text-left"
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
              <span className="inline-flex items-center rounded-full bg-info-50 px-3 py-1 text-p2 font-medium text-info-700 w-fit">
                {completedTests}/{totalTests} Completed
              </span>
              <button
                onClick={handleViewViewReport(row)}
                className="text-p2 text-info-600 hover:text-info-800 hover:underline text-left"
                title="View report"
              >
                View Report
              </button>
            </div>
          );
        } else {
          // No tests completed yet
          return (
            <span className="inline-flex items-center rounded-full bg-pneutral-100 px-3 py-1 text-p2 font-medium text-pneutral-700">
              Pending
            </span>
          );
        }
      },
    },
    {
      header: 'Payment Status',
      accessor: 'paymentStatus',
      render: (row: Patient) => {
        const dueAmount = Number(row?.visit?.billing?.due_amount || 0);
        const isPaid = dueAmount === 0;
        const isCancelled = row?.visit?.visitStatus?.toUpperCase() === 'CANCELLED';

        const badgeClass = isPaid
          ? 'bg-success-50 text-success-700'
          : 'bg-warning-50 text-warning-700';

        return (
          <div className="flex flex-col">
            <span className={`inline-flex items-center w-fit rounded-full px-3 py-1 text-p2 font-medium ${badgeClass}`}>
              {isPaid ? 'PAID' : `DUE (₹${dueAmount.toFixed(2)})`}
            </span>
            {!isPaid && dueAmount > 0 && (
              isCancelled ? (
                <span
                  className="mt-1 text-p2 text-pneutral-400 cursor-not-allowed"
                  title="Cannot collect payment: visit is cancelled"
                >
                  Collect Due
                </span>
              ) : (
                <button
                  onClick={() => {
                    setPatientDetails(row);
                    setDuePaymentModal(true);
                  }}
                  className="mt-1 text-p2 text-info-600 hover:text-info-800 hover:underline text-left"
                >
                  Collect Due
                </button>
              )
            )}
          </div>
        );
      },
    },
    {
      header: 'Net Amount',
      accessor: 'netAmount',
      render: (row: Patient) => (
        <span className="font-semibold text-p3 text-success-900 whitespace-nowrap">
          ₹{row?.visit?.billing?.netAmount?.toFixed(2) || '0.00'}
        </span>
      ),
    },
    {
      header: 'Bill Invoice',
      accessor: 'billInvoice',
      render: (row: Patient) => {
        const isCancelled = row?.visit?.visitStatus?.toUpperCase() === 'CANCELLED';

        if (isCancelled) {
          return (
            <span className="text-p3 font-medium text-warning-600">
              Invoice Cancelled
            </span>
          );
        }

        return (
          <button
            onClick={handleView(row)}
            className="flex h-[28px] w-[28px] items-center border border-secondary-500 justify-center rounded-full text-secondary-600 hover:bg-secondary-50 transition-colors"
            title="View Bill Invoice"
          >
            <LiaFileInvoiceSolid size={13} />
          </button>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row: Patient) => {
        const isCancelled = row?.visit?.visitStatus?.toUpperCase() === 'CANCELLED';
        const hasTestResults = row?.visit?.testResult && row.visit.testResult.length > 0;
        const isReportPending = !hasTestResults || (row?.visit?.testResult && row.visit.testResult.every(tr => tr.reportStatus === 'Pending'));

        return (
          <div className="flex items-center gap-2">
            {!isCancelled && isReportPending && (
              <>
                <button
                  onClick={handleEditpatientDetails(row)}
                  className="flex h-[28px] w-[28px] items-center border border-info-700 justify-center rounded-full text-info-700 hover:bg-info-50 transition-colors"
                  title="Edit Visit"
                >
                  <Edit size={12} />
                </button>
                <button
                  onClick={() => {
                    setDeletePatientModal(true);
                    setPatientDetails(row);
                  }}
                  className="flex h-[28px] w-[28px] items-center justify-center border border-warning-500 rounded-full text-warning-500 hover:bg-warning-50 transition-colors"
                  title="Cancel Visit"
                >
                  <HiOutlineTrash size={12} />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full">
      {/* Header Section - hidden while registering a new patient */}
      {!showAddPatientForm && (
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-h3 font-semibold text-pneutral-900">
                Patient Management
              </h1>
              <p className="mt-1 text-p3 text-pneutral-500">
                Manage patient visits, reports, and billing
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddPatient}
                className="flex items-center gap-2 rounded-full bg-secondary-700 px-4 py-2 text-label-l3 font-medium text-pneutral-50"
              >
                <Plus className="h-4 w-4" />
                <span>New Patient</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Section */}
      {!showAddPatientForm && (
        <div className="mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-pneutral-100 bg-white p-5 text-left">
              <h3 className="text-sm font-medium text-pneutral-900">Total Visits</h3>
              <p className="mt-4 text-3xl font-semibold text-pneutral-900">{patientList?.length || 0}</p>
            </div>

            <div className="rounded-xl border border-pneutral-100 bg-white p-5 text-left">
              <h3 className="text-sm font-medium text-pneutral-900">Due Payments</h3>
              <p className="mt-4 text-3xl font-semibold text-info-500">{dueVisitsCount}</p>
            </div>

            <div className="rounded-xl border border-pneutral-100 bg-white p-5 text-left">
              <h3 className="text-sm font-medium text-pneutral-900">Cancelled Visits</h3>
              <p className="mt-4 text-3xl font-semibold text-danger-600">{cancelledVisitsCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section - Only shown when not in add patient mode */}
      {!showAddPatientForm && (
        <div className="mb-6 rounded-xl bg-white border border-pneutral-200 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
            <div className="relative flex-1 min-w-[220px] max-w-xl">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sneutral-700"
              />
              <input
                type="text"
                placeholder="Search patients by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-pneutral-200 pl-10 pr-4 text-sm outline-none focus:border-pneutral-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-p3 text-pneutral-500">Bill Status:</span>
                <select
                  value={billStatusFilter}
                  onChange={(e) => setBillStatusFilter(e.target.value)}
                  className="h-10 rounded-md border border-pneutral-200 px-3 text-p3 focus:border-pneutral-500"
                >
                  <option value="">All Bill</option>
                  {Object.values(BillStatus).map((bs) => (
                    (bs === BillStatus.CANCELLED && !canAccessCancelledFilter) ? null : (
                      <option key={bs} value={bs}>{BILL_STATUS_LABELS[bs]}</option>
                    )
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-p3 text-pneutral-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-md border border-pneutral-200 px-3 text-p3 focus:border-pneutral-500"
                >
                  <option value="">All Status</option>
                  {Object.values(VisitStatus).map((status) => (
                    (status === VisitStatus.CANCELLED && !canAccessCancelledFilter) ? null : (
                      <option key={status} value={status}>{status}</option>
                    )
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-p3 text-pneutral-500">Visit Type:</span>
                <select
                  value={visitTypeFilter}
                  onChange={(e) => setVisitTypeFilter(e.target.value)}
                  className="h-10 rounded-md border border-pneutral-200 px-3 text-p3 focus:border-pneutral-500"
                >
                  <option value="">All Types</option>
                  {Object.values(VisitType).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-p3 text-pneutral-500">Date Range:</span>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value as DateFilterOption)}
                  className="h-10 rounded-md border border-pneutral-200 px-3 text-p3 focus:border-pneutral-500"
                >
                  {DATE_FILTER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {dateRangeFilter === 'custom' && (
                <>
                  <input
                    type="date"
                    value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      setHasCustomDateInteraction(true);
                      setCustomStartDate(e.target.value ? new Date(e.target.value) : null);
                    }}
                    max={new Date().toISOString().split('T')[0]}
                    className="h-10 rounded-md border border-pneutral-200 px-3 text-p3 focus:border-pneutral-500"
                  />
                  <input
                    type="date"
                    value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      setHasCustomDateInteraction(true);
                      setCustomEndDate(e.target.value ? new Date(e.target.value) : null);
                    }}
                    min={customStartDate ? customStartDate.toISOString().split('T')[0] : undefined}
                    max={new Date().toISOString().split('T')[0]}
                    className="h-10 rounded-md border border-pneutral-200 px-3 text-p3 focus:border-pneutral-500"
                  />
                </>
              )}

              {(statusFilter || billStatusFilter || visitTypeFilter || dateRangeFilter !== 'today' || searchQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 rounded-full border border-warning-500 px-4 py-2 text-label-l3 font-medium text-warning-600 hover:bg-warning-50 transition-colors"
                  title="Clear all filters"
                >
                  <FaFilterCircleXmark size={14} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader type="progress" fullScreen={false} text="Loading patient visits..." />
        </div>
      ) : showAddPatientForm ? (
        <AddPatientComponent
          setAddPatientModal={setShowAddPatientForm}
          setAddUpdatePatientListVist={setAddUpdatePatientListVist}
          addUpdatePatientListVist={addUpdatePatientListVist}
        />
      ) : (
        <div className="relative">
          {filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-pneutral-200 bg-white py-16">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-pneutral-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-4 text-sm font-medium text-pneutral-500">
                {searchQuery || statusFilter || billStatusFilter || visitTypeFilter ? 'No results found' : 'No patient visits available'}
              </p>
              {(searchQuery || statusFilter || billStatusFilter || visitTypeFilter) && (
                <p className="mt-1 text-xs text-pneutral-400">
                  Try adjusting your search or filter criteria
                </p>
              )}
            </div>
          ) : (
            <NewCommonTable
              columns={columns}
              data={sortedPatients}
              pageSize={10}
              showPagination={true}
              resetPageKey={resetPageKey}
            />
          )}
        </div>
      )}

      {/* Modals */}
      <NewModal
        isOpen={viewPatientModal}
        onClose={() => setViewPatientModal(false)}
        title="Invoice Details"
        modalClassName="max-w-4xl"
      >
        {patientDetails && <PatientDetailsViewComponent patient={patientDetails} />}
      </NewModal>

      <NewModal
        isOpen={editPatientDetailsModal}
        onClose={() => setEditPatientDetailsModal(false)}
        title="Edit Patient Details"
        modalClassName="w-full max-w-6xl"
      >
        <EditPatientDetails
          setEditPatientDetailsModal={setEditPatientDetailsModal}
          editPatientDetails={editPatientDetails}
          setUpdatePatientListVist={setUpdatePatientListVist}
          updatePatientListVist={updatePatientListVist}
        />
      </NewModal>

      <NewModal
        isOpen={viewReportModal}
        onClose={() => setViewReportModal(false)}
        title="Report"
        modalClassName="max-w-4xl"
      >
        {viewReportDetails && (
          <ReportView
            viewPatient={{
              visitId: viewReportDetails.visit?.visitId ?? 0,
              patientId: viewReportDetails.id,
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
              // Same array this table renders "N/M Completed" from -- the report view
              // needs it to decide whether the order is finished enough for AI
              // observations (it is reachable here on partially completed visits too).
              testResult: viewReportDetails.visit?.testResult ?? [],
            }}
            doctorName={
              ((viewReportDetails as unknown) as { doctorName?: string }).doctorName ||
              ((viewReportDetails.visit as unknown) as { doctorName?: string })?.doctorName
            }
          />
        )}
      </NewModal>


      <CancelPatient
        isOpen={deletePatientModal}
        onClose={() => setDeletePatientModal(false)}
        onPatientCancelled={fetchVisits}
      />

      {/* Cancellation Details Modal */}
      <CancellationDetailsModal
        isOpen={cancellationDetailsModal}
        onClose={() => setCancellationDetailsModal(false)}
        patientDetails={patientDetails!}
      />

      <NewModal
        isOpen={duePaymentModal}
        onClose={() => setDuePaymentModal(false)}
        title="Due Payment"
        modalClassName="max-w-4xl"
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
      </NewModal>
    </div>
  );
};

export default PatientVisitListTable;



























// code without filter of the bill status..................

// import { getAllPatientVisitsByDateRangeoflab } from '@/../services/patientServices';
// import { useLabs } from '@/context/LabContext';
// import { Patient, VisitType } from '@/types/patient/patient';
// import { DATE_FILTER_OPTIONS, DateFilterOption, formatDateForAPI, getDateRange } from '@/utils/dateUtils';
// import { Edit, Plus, Search } from 'lucide-react';
// import React, { useEffect, useMemo, useState } from 'react';

// import { FaFilterCircleXmark } from "react-icons/fa6";
// import { LiaFileInvoiceSolid } from "react-icons/lia";
// import { HiOutlineTrash } from 'react-icons/hi2';
// import { toast } from 'react-toastify';
// import Loader from '../common/Loader';
// import NewCommonTable, { Column } from '@/app/(admin)/dashboard/newcommoncomponent/NewCommonTable';
// import NewModal from '@/app/(admin)/dashboard/newcommoncomponent/NewModal';
// import AddPatientComponent from './AddPatientComponent';
// import EditPatientDetails from './EditPatientDetails';
// import PatientDetailsViewComponent from './PatientDetailsViewComponent';
// import ReportView from './Report/ReportView';
// import CancelPatient from './CancelPatient';
// import DuePayment from './DuePayment';
// import CancellationDetailsModal from './CancellationDetailsModal';
// import useAuthStore from '@/context/userStore';

// enum VisitStatus {
//   PENDING = 'Pending',
//   COMPLETED = 'Completed',
//   CANCELLED = 'Cancelled',
// }


// interface PatientVisitListTableProps {
//   onAddPatientFormChange?: (isOpen: boolean) => void;
// }

// const PatientVisitListTable: React.FC<PatientVisitListTableProps> = ({ onAddPatientFormChange }) => {
//   const { currentLab, setPatientDetails, patientDetails } = useLabs();
//   const { user: loginedUser } = useAuthStore();

//   // Check user roles for filter access
//   const roles = loginedUser?.roles || [];
//   const isAdmin = roles.includes('ADMIN');
//   const isSuperAdmin = roles.includes('SUPERADMIN');
//   const isDeskRole = roles.includes('DESKROLE');
//   const canAccessCancelledFilter = isAdmin || isSuperAdmin;

//   const [patientList, setPatientList] = useState<Patient[]>([]);
//   const [statusFilter, setStatusFilter] = useState<string>('');
//   const [visitTypeFilter, setVisitTypeFilter] = useState<string>('');
//   const [dateRangeFilter, setDateRangeFilter] = useState<DateFilterOption>('today');
//   const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
//   const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
//   const [showAddPatientForm, setShowAddPatientForm] = useState<boolean>(false);
//   const [viewPatientModal, setViewPatientModal] = useState<boolean>(false);
//   const [editPatientDetailsModal, setEditPatientDetailsModal] = useState<boolean>(false);
//   const [editPatientDetails, setEditPatientDetails] = useState<Patient | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [updatePatientListVist, setUpdatePatientListVist] = useState<boolean>(false);
//   const [addUpdatePatientListVist, setAddUpdatePatientListVist] = useState<boolean>(false);
//   const [viewReportModal, setViewReportModal] = useState<boolean>(false);
//   const [viewReportDetails, setViewReportDetails] = useState<Patient | null>(null);
//   const [searchQuery, setSearchQuery] = useState<string>('');
//   const [deletePatientModal, setDeletePatientModal] = useState<boolean>(false);
//   const [duePaymentModal, setDuePaymentModal] = useState<boolean>(false);
//   const [cancellationDetailsModal, setCancellationDetailsModal] = useState<boolean>(false);
//   const [hasCustomDateInteraction, setHasCustomDateInteraction] = useState<boolean>(false);

//   // Notify parent when the add patient form opens/closes so it can hide surrounding navigation
//   useEffect(() => {
//     onAddPatientFormChange?.(showAddPatientForm);
//     return () => {
//       onAddPatientFormChange?.(false);
//     };
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [showAddPatientForm]);

//   const fetchVisits = async () => {
//     try {
//       setIsLoading(true);
//       if (currentLab?.id) {
//         // Validate custom dates before proceeding
//         if (!validateCustomDates()) {
//           setIsLoading(false);
//           return;
//         }

//         const { startDate, endDate } = getDateRange(dateRangeFilter, customStartDate, customEndDate);

//         if (!startDate || !endDate) return;

//         const formattedStartDate = formatDateForAPI(startDate);
//         const formattedEndDate = formatDateForAPI(endDate);



//         const response = await getAllPatientVisitsByDateRangeoflab(
//           currentLab.id,
//           formattedStartDate,
//           formattedEndDate
//         );
//         setPatientList(response || []);
//       }
//     } catch (error: unknown) {
//       toast.error((error as Error).message || 'An error occurred while fetching visits', {
//         autoClose: 2000,
//         className: 'bg-red-50 text-red-800'
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchVisits();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentLab, updatePatientListVist, addUpdatePatientListVist, dateRangeFilter, customStartDate, customEndDate]);

//   const { startDate, endDate } = getDateRange(dateRangeFilter, customStartDate, customEndDate);

//   const filteredPatients = (patientList || []).filter((visit) => {
//     if (!visit) return false;
//     let isValid = true;

//     if (!visit?.visit) return false;

//     const visitDate = new Date(visit?.visit?.visitDate);

//     // Hide cancelled data for deskrole users
//     if (isDeskRole && visit?.visit?.visitStatus?.toUpperCase() === 'CANCELLED') {
//       return false;
//     }

//     if (statusFilter && visit?.visit?.visitStatus?.toUpperCase() !== statusFilter.toUpperCase()) {
//       isValid = false;
//     }

//     if (visitTypeFilter && visit?.visit?.visitType !== visitTypeFilter) {
//       isValid = false;
//     }

//     if (startDate && visitDate < startDate) {
//       isValid = false;
//     }

//     if (endDate && visitDate > endDate) {
//       isValid = false;
//     }

//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       const nameMatch = `${visit?.firstName || ''} ${visit?.lastName || ''}`.toLowerCase().includes(query);
//       const phoneMatch = visit?.phone?.toLowerCase().includes(query);
//       if (!nameMatch && !phoneMatch) {
//         isValid = false;
//       }
//     }

//     return isValid;
//   });

//   // Sort patients by visit date (latest first) and then by visit ID (latest first) as fallback
//   const sortedPatients = [...filteredPatients].sort((a, b) => {
//     const dateA = new Date(a?.visit?.visitDate || 0);
//     const dateB = new Date(b?.visit?.visitDate || 0);

//     // First sort by visit date (latest first)
//     const dateComparison = dateB.getTime() - dateA.getTime();

//     // If dates are equal, sort by visit ID (latest first)
//     if (dateComparison === 0) {
//       return (b?.visit?.visitId || 0) - (a?.visit?.visitId || 0);
//     }

//     return dateComparison;
//   });

//   // Use useMemo to create a reset key based on filter changes so NewCommonTable resets to page 1
//   const resetPageKey = useMemo(
//     () => JSON.stringify({ statusFilter, visitTypeFilter, dateRangeFilter, customStartDate, customEndDate, searchQuery }),
//     [statusFilter, visitTypeFilter, dateRangeFilter, customStartDate, customEndDate, searchQuery]
//   );

//   const dueVisitsCount = useMemo(
//     () => (patientList || []).filter(
//       (v) => v?.visit?.visitStatus?.toUpperCase() !== 'CANCELLED' && Number(v?.visit?.billing?.due_amount || 0) > 0
//     ).length,
//     [patientList]
//   );
//   const cancelledVisitsCount = useMemo(
//     () => (patientList || []).filter((v) => v?.visit?.visitStatus?.toUpperCase() === 'CANCELLED').length,
//     [patientList]
//   );

//   const handleView = (visit: Patient) => () => {
//     setPatientDetails(visit);
//     setViewPatientModal(true);
//   };

//   const handleViewViewReport = (visit: Patient) => () => {
//     setViewReportDetails(visit);
//     setViewReportModal(true);
//   };

//   const handleEditpatientDetails = (visit: Patient) => () => {
//     setEditPatientDetails(visit);
//     setEditPatientDetailsModal(true);
//   };

//   const handleAddPatient = () => {
//     setShowAddPatientForm(true);
//   };

//   const handleClearFilters = () => {
//     setStatusFilter('');
//     setVisitTypeFilter('');
//     setDateRangeFilter('today');
//     setCustomStartDate(null);
//     setCustomEndDate(null);
//     setSearchQuery('');
//     setHasCustomDateInteraction(false);
//   };

//   function validateCustomDates() {
//     if (dateRangeFilter === 'custom') {
//       // Only show validation errors if user has actually interacted with the date fields
//       if (!hasCustomDateInteraction) {
//         return false; // Don't show errors until user interacts
//       }

//       if (!customStartDate && !customEndDate) {
//         toast.warning('Please select both start and end dates');
//         return false;
//       }

//       if (!customStartDate) {
//         toast.warning('Please select a start date');
//         return false;
//       }

//       if (!customEndDate) {
//         toast.warning('Please select an end date');
//         return false;
//       }

//       const today = new Date();
//       today.setHours(23, 59, 59, 999);

//       if (customStartDate > today) {
//         toast.warning('Start date cannot be in the future');
//         return false;
//       }

//       if (customEndDate > today) {
//         toast.warning('End date cannot be in the future');
//         return false;
//       }

//       if (customStartDate > customEndDate) {
//         toast.warning('Start date cannot be after end date');
//         return false;
//       }
//     }
//     return true;
//   }

//   const formatDate = (dateString: string) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   const columns: Column<Patient>[] = [
//     {
//       header: 'Visit Code',
//       accessor: 'visitCode',
//       render: (row: Patient) => (
//         <span className="font-mono text-p3 text-pneutral-700">
//           {row?.visit?.visitCode || row?.visit?.visitId}
//         </span>
//       ),
//     },
//     {
//       header: 'Patient Name',
//       accessor: 'patientName',
//       render: (row: Patient) => (
//         <div className="flex flex-col min-w-[120px]">
//           <span className="font-semibold text-p3 text-pneutral-900 truncate">{`${row?.firstName} ${row?.lastName}`}</span>
//           <span className="text-p2 text-pneutral-500">{row?.phone}</span>
//         </div>
//       ),
//     },
//     {
//       header: 'Visit Date',
//       accessor: 'visitDate',
//       render: (row: Patient) => (
//         <span className="text-p3 text-pneutral-700 whitespace-nowrap">
//           {formatDate(row?.visit?.visitDate)}
//         </span>
//       ),
//     },
//     {
//       header: 'Visit Type',
//       accessor: 'visitType',
//       render: (row: Patient) => {
//         const visitType = row?.visit?.visitType;
//         let pillClass = 'bg-pneutral-100 text-pneutral-700';

//         switch (visitType) {
//           case VisitType.IN_PATIENT:
//             pillClass = 'bg-danger-100 text-warning-800';
//             break;
//           case VisitType.OUT_PATIENT:
//             pillClass = 'bg-info-50 text-info-700';
//             break;
//           case VisitType.DAYCARE:
//             pillClass = 'bg-success-50 text-success-700';
//             break;
//           case VisitType.WAKING:
//             pillClass = 'bg-warning-50 text-warning-700';
//             break;
//           default:
//             pillClass = 'bg-pneutral-100 text-pneutral-700';
//         }

//         return (
//           <span className={`inline-flex items-center rounded-full px-3 py-1 text-p2 font-medium ${pillClass}`}>
//             {visitType}
//           </span>
//         );
//       },
//     },
//     {
//       header: 'Report Status',
//       accessor: 'reportStatus',
//       render: (row: Patient) => {
//         const visitStatus = row?.visit?.visitStatus;

//         // If visit is cancelled, show cancelled status
//         if (visitStatus?.toUpperCase() === 'CANCELLED') {
//           return (
//             <div className="flex flex-col gap-1">
//               <span className="inline-flex items-center rounded-full bg-warning-50 px-3 py-1 text-p2 font-medium text-warning-700 w-fit">
//                 Cancelled
//               </span>
//               <button
//                 onClick={() => {
//                   setPatientDetails(row);
//                   setCancellationDetailsModal(true);
//                 }}
//                 className="text-p2 text-warning-600 hover:text-warning-800 hover:underline text-left"
//                 title="View cancellation details"
//               >
//                 View Details
//               </button>
//             </div>
//           );
//         }

//         // Check if the patient has test results (similar to CompletedTable logic)
//         if (!row?.visit?.testResult || row.visit.testResult.length === 0) {
//           return (
//             <span className="inline-flex items-center rounded-full bg-pneutral-100 px-3 py-1 text-p2 font-medium text-pneutral-700">
//               No Results
//             </span>
//           );
//         }

//         const totalTests = row.visit.testResult.length;
//         const completedTests = row.visit.testResult.filter(tr => tr.reportStatus === 'Completed').length;

//         if (completedTests === totalTests) {
//           // If there's only 1 test and it's completed, show "Completed"
//           // If there are multiple tests and all are completed, show "All Completed"
//           const statusText = totalTests === 1 ? 'Completed' : 'All Completed';
//           return (
//             <div className="flex flex-col gap-1">
//               <span className="inline-flex items-center rounded-full bg-success-50 px-3 py-1 text-p2 font-medium text-success-700 w-fit">
//                 {statusText}
//               </span>
//               <button
//                 onClick={handleViewViewReport(row)}
//                 className="text-p2 text-success-600 hover:text-success-800 hover:underline text-left"
//                 title="View report"
//               >
//                 View Report
//               </button>
//             </div>
//           );
//         } else if (completedTests > 0) {
//           // Show partial completion
//           return (
//             <div className="flex flex-col gap-1">
//               <span className="inline-flex items-center rounded-full bg-info-50 px-3 py-1 text-p2 font-medium text-info-700 w-fit">
//                 {completedTests}/{totalTests} Completed
//               </span>
//               <button
//                 onClick={handleViewViewReport(row)}
//                 className="text-p2 text-info-600 hover:text-info-800 hover:underline text-left"
//                 title="View report"
//               >
//                 View Report
//               </button>
//             </div>
//           );
//         } else {
//           // No tests completed yet
//           return (
//             <span className="inline-flex items-center rounded-full bg-pneutral-100 px-3 py-1 text-p2 font-medium text-pneutral-700">
//               Pending
//             </span>
//           );
//         }
//       },
//     },
//     {
//       header: 'Payment Status',
//       accessor: 'paymentStatus',
//       render: (row: Patient) => {
//         const dueAmount = Number(row?.visit?.billing?.due_amount || 0);
//         const isPaid = dueAmount === 0;
//         const isCancelled = row?.visit?.visitStatus?.toUpperCase() === 'CANCELLED';

//         const badgeClass = isPaid
//           ? 'bg-success-50 text-success-700'
//           : 'bg-warning-50 text-warning-700';

//         return (
//           <div className="flex flex-col">
//             <span className={`inline-flex items-center w-fit rounded-full px-3 py-1 text-p2 font-medium ${badgeClass}`}>
//               {isPaid ? 'PAID' : `DUE (₹${dueAmount.toFixed(2)})`}
//             </span>
//             {!isPaid && dueAmount > 0 && (
//               isCancelled ? (
//                 <span
//                   className="mt-1 text-p2 text-pneutral-400 cursor-not-allowed"
//                   title="Cannot collect payment: visit is cancelled"
//                 >
//                   Collect Due
//                 </span>
//               ) : (
//                 <button
//                   onClick={() => {
//                     setPatientDetails(row);
//                     setDuePaymentModal(true);
//                   }}
//                   className="mt-1 text-p2 text-info-600 hover:text-info-800 hover:underline text-left"
//                 >
//                   Collect Due
//                 </button>
//               )
//             )}
//           </div>
//         );
//       },
//     },
//     {
//       header: 'Net Amount',
//       accessor: 'netAmount',
//       render: (row: Patient) => (
//         <span className="font-semibold text-p3 text-success-900 whitespace-nowrap">
//           ₹{row?.visit?.billing?.netAmount?.toFixed(2) || '0.00'}
//         </span>
//       ),
//     },
//     {
//       header: 'Bill Invoice',
//       accessor: 'billInvoice',
//       render: (row: Patient) => {
//         const isCancelled = row?.visit?.visitStatus?.toUpperCase() === 'CANCELLED';

//         if (isCancelled) {
//           return (
//             <span className="text-p3 font-medium text-warning-600">
//               Invoice Cancelled
//             </span>
//           );
//         }

//         return (
//           <button
//             onClick={handleView(row)}
//             className="flex h-[28px] w-[28px] items-center border border-secondary-500 justify-center rounded-full text-secondary-600 hover:bg-secondary-50 transition-colors"
//             title="View Bill Invoice"
//           >
//             <LiaFileInvoiceSolid size={13} />
//           </button>
//         );
//       },
//     },
//     {
//       header: 'Actions',
//       accessor: 'actions',
//       render: (row: Patient) => {
//         const isCancelled = row?.visit?.visitStatus?.toUpperCase() === 'CANCELLED';
//         const hasTestResults = row?.visit?.testResult && row.visit.testResult.length > 0;
//         const isReportPending = !hasTestResults || (row?.visit?.testResult && row.visit.testResult.every(tr => tr.reportStatus === 'Pending'));

//         return (
//           <div className="flex items-center gap-2">
//             {!isCancelled && isReportPending && (
//               <>
//                 <button
//                   onClick={handleEditpatientDetails(row)}
//                   className="flex h-[28px] w-[28px] items-center border border-info-700 justify-center rounded-full text-info-700 hover:bg-info-50 transition-colors"
//                   title="Edit Visit"
//                 >
//                   <Edit size={12} />
//                 </button>
//                 <button
//                   onClick={() => {
//                     setDeletePatientModal(true);
//                     setPatientDetails(row);
//                   }}
//                   className="flex h-[28px] w-[28px] items-center justify-center border border-warning-500 rounded-full text-warning-500 hover:bg-warning-50 transition-colors"
//                   title="Cancel Visit"
//                 >
//                   <HiOutlineTrash size={12} />
//                 </button>
//               </>
//             )}
//           </div>
//         );
//       },
//     },
//   ];

//   return (
//     <div className="w-full">
//       {/* Header Section - hidden while registering a new patient */}
//       {!showAddPatientForm && (
//         <div className="mb-6">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//             <div>
//               <h1 className="text-h3 font-semibold text-pneutral-900">
//                 Patient Management
//               </h1>
//               <p className="mt-1 text-p3 text-pneutral-500">
//                 Manage patient visits, reports, and billing
//               </p>
//             </div>

//             <div className="flex items-center gap-3">
//               <button
//                 onClick={handleAddPatient}
//                 className="flex items-center gap-2 rounded-full bg-secondary-700 px-4 py-2 text-label-l3 font-medium text-pneutral-50"
//               >
//                 <Plus className="h-4 w-4" />
//                 <span>New Patient</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* KPI Section */}
//       {!showAddPatientForm && (
//         <div className="mb-6">
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
//             <div className="rounded-xl border border-pneutral-100 bg-white p-5 text-left">
//               <h3 className="text-sm font-medium text-pneutral-900">Total Visits</h3>
//               <p className="mt-4 text-3xl font-semibold text-pneutral-900">{patientList?.length || 0}</p>
//             </div>

//             <div className="rounded-xl border border-pneutral-100 bg-white p-5 text-left">
//               <h3 className="text-sm font-medium text-pneutral-900">Due Payments</h3>
//               <p className="mt-4 text-3xl font-semibold text-info-500">{dueVisitsCount}</p>
//             </div>

//             <div className="rounded-xl border border-pneutral-100 bg-white p-5 text-left">
//               <h3 className="text-sm font-medium text-pneutral-900">Cancelled Visits</h3>
//               <p className="mt-4 text-3xl font-semibold text-danger-600">{cancelledVisitsCount}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Filters Section - Only shown when not in add patient mode */}
//       {!showAddPatientForm && (
//         <div className="mb-6 rounded-xl bg-white border border-pneutral-200 p-4">
//           <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
//             <div className="relative flex-1 min-w-[220px] max-w-xl">
//               <Search
//                 size={18}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-sneutral-700"
//               />
//               <input
//                 type="text"
//                 placeholder="Search patients by name or phone..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="h-10 w-full rounded-lg border border-pneutral-200 pl-10 pr-4 text-sm outline-none focus:border-pneutral-500"
//               />
//             </div>

//             <div className="flex flex-wrap items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <span className="text-p3 text-pneutral-500">Status:</span>
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="h-10 rounded-md border border-pneutral-200 px-3 text-p3 focus:border-pneutral-500"
//                 >
//                   <option value="">All Status</option>
//                   {Object.values(VisitStatus).map((status) => (
//                     (status === VisitStatus.CANCELLED && !canAccessCancelledFilter) ? null : (
//                       <option key={status} value={status}>{status}</option>
//                     )
//                   ))}
//                 </select>
//               </div>

//               <div className="flex items-center gap-2">
//                 <span className="text-p3 text-pneutral-500">Visit Type:</span>
//                 <select
//                   value={visitTypeFilter}
//                   onChange={(e) => setVisitTypeFilter(e.target.value)}
//                   className="h-10 rounded-md border border-pneutral-200 px-3 text-p3 focus:border-pneutral-500"
//                 >
//                   <option value="">All Types</option>
//                   {Object.values(VisitType).map((type) => (
//                     <option key={type} value={type}>{type}</option>
//                   ))}
//                 </select>
//               </div>

//               <div className="flex items-center gap-2">
//                 <span className="text-p3 text-pneutral-500">Date Range:</span>
//                 <select
//                   value={dateRangeFilter}
//                   onChange={(e) => setDateRangeFilter(e.target.value as DateFilterOption)}
//                   className="h-10 rounded-md border border-pneutral-200 px-3 text-p3 focus:border-pneutral-500"
//                 >
//                   {DATE_FILTER_OPTIONS.map(option => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {dateRangeFilter === 'custom' && (
//                 <>
//                   <input
//                     type="date"
//                     value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
//                     onChange={(e) => {
//                       setHasCustomDateInteraction(true);
//                       setCustomStartDate(e.target.value ? new Date(e.target.value) : null);
//                     }}
//                     max={new Date().toISOString().split('T')[0]}
//                     className="h-10 rounded-md border border-pneutral-200 px-3 text-p3 focus:border-pneutral-500"
//                   />
//                   <input
//                     type="date"
//                     value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
//                     onChange={(e) => {
//                       setHasCustomDateInteraction(true);
//                       setCustomEndDate(e.target.value ? new Date(e.target.value) : null);
//                     }}
//                     min={customStartDate ? customStartDate.toISOString().split('T')[0] : undefined}
//                     max={new Date().toISOString().split('T')[0]}
//                     className="h-10 rounded-md border border-pneutral-200 px-3 text-p3 focus:border-pneutral-500"
//                   />
//                 </>
//               )}

//               {(statusFilter || visitTypeFilter || dateRangeFilter !== 'today' || searchQuery) && (
//                 <button
//                   onClick={handleClearFilters}
//                   className="flex items-center gap-2 rounded-full border border-warning-500 px-4 py-2 text-label-l3 font-medium text-warning-600 hover:bg-warning-50 transition-colors"
//                   title="Clear all filters"
//                 >
//                   <FaFilterCircleXmark size={14} />
//                   <span>Reset</span>
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Content Area */}
//       {isLoading ? (
//         <div className="flex flex-col items-center justify-center h-64">
//           <Loader type="progress" fullScreen={false} text="Loading patient visits..." />
//         </div>
//       ) : showAddPatientForm ? (
//         <AddPatientComponent
//           setAddPatientModal={setShowAddPatientForm}
//           setAddUpdatePatientListVist={setAddUpdatePatientListVist}
//           addUpdatePatientListVist={addUpdatePatientListVist}
//         />
//       ) : (
//         <div className="relative">
//           {filteredPatients.length === 0 ? (
//             <div className="flex flex-col items-center justify-center rounded-xl border border-pneutral-200 bg-white py-16">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-16 w-16 text-pneutral-300"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={1}
//                   d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//               <p className="mt-4 text-sm font-medium text-pneutral-500">
//                 {searchQuery || statusFilter || visitTypeFilter ? 'No results found' : 'No patient visits available'}
//               </p>
//               {(searchQuery || statusFilter || visitTypeFilter) && (
//                 <p className="mt-1 text-xs text-pneutral-400">
//                   Try adjusting your search or filter criteria
//                 </p>
//               )}
//             </div>
//           ) : (
//             <NewCommonTable
//               columns={columns}
//               data={sortedPatients}
//               pageSize={10}
//               showPagination={true}
//               resetPageKey={resetPageKey}
//             />
//           )}
//         </div>
//       )}

//       {/* Modals */}
//       <NewModal
//         isOpen={viewPatientModal}
//         onClose={() => setViewPatientModal(false)}
//         title="Invoice Details"
//         modalClassName="max-w-4xl"
//       >
//         {patientDetails && <PatientDetailsViewComponent patient={patientDetails} />}
//       </NewModal>

//       <NewModal
//         isOpen={editPatientDetailsModal}
//         onClose={() => setEditPatientDetailsModal(false)}
//         title="Edit Patient Details"
//         modalClassName="w-full max-w-6xl"
//       >
//         <EditPatientDetails
//           setEditPatientDetailsModal={setEditPatientDetailsModal}
//           editPatientDetails={editPatientDetails}
//           setUpdatePatientListVist={setUpdatePatientListVist}
//           updatePatientListVist={updatePatientListVist}
//         />
//       </NewModal>

//       <NewModal
//         isOpen={viewReportModal}
//         onClose={() => setViewReportModal(false)}
//         title="Report"
//         modalClassName="max-w-4xl"
//       >
//         {viewReportDetails && (
//           <ReportView
//             viewReportDetailsbyId={viewReportDetails.visit?.visitId ?? 0}
//             viewPatient={{
//               visitId: viewReportDetails.visit?.visitId ?? 0,
//               patientId: viewReportDetails.id,
//               patientname: `${viewReportDetails.firstName} ${viewReportDetails.lastName}`.trim(),
//               contactNumber: viewReportDetails.phone,
//               visitDate: viewReportDetails.visit?.visitDate ?? '',
//               visitStatus: viewReportDetails.visit?.visitStatus ?? VisitStatus.PENDING,
//               gender: viewReportDetails.gender ?? '',
//               email: viewReportDetails.email ?? '',
//               sampleNames: [],
//               testIds: viewReportDetails.visit?.testIds ?? [],
//               packageIds: viewReportDetails.visit?.packageIds ?? [],
//               dateOfBirth: viewReportDetails.dateOfBirth ?? '',
//               visitType: viewReportDetails.visit?.visitType ?? VisitType.OUT_PATIENT,
//               doctorId: viewReportDetails.visit?.doctorId !== undefined && viewReportDetails.visit?.doctorId !== null
//                 ? Number(viewReportDetails.visit?.doctorId)
//                 : 0,
//             }}
//             doctorName={
//               ((viewReportDetails as unknown) as { doctorName?: string }).doctorName ||
//               ((viewReportDetails.visit as unknown) as { doctorName?: string })?.doctorName
//             }
//           />
//         )}
//       </NewModal>


//       <CancelPatient
//         isOpen={deletePatientModal}
//         onClose={() => setDeletePatientModal(false)}
//         onPatientCancelled={fetchVisits}
//       />

//       {/* Cancellation Details Modal */}
//       <CancellationDetailsModal
//         isOpen={cancellationDetailsModal}
//         onClose={() => setCancellationDetailsModal(false)}
//         patientDetails={patientDetails!}
//       />

//       <NewModal
//         isOpen={duePaymentModal}
//         onClose={() => setDuePaymentModal(false)}
//         title="Due Payment"
//         modalClassName="max-w-4xl"
//       >
//         {patientDetails && (
//           <DuePayment
//             patient={patientDetails!}
//             onClose={() => setDuePaymentModal(false)}
//             onPaymentSuccess={() => {
//               // Refresh the patient list to get updated data
//               fetchVisits();
//               // Close the modal
//               setDuePaymentModal(false);
//               // Show success message
//               toast.success('Payment processed successfully!', {
//                 autoClose: 3000,
//                 className: 'bg-green-50 text-green-800'
//               });
//             }}
//             currentUser={{ username: loginedUser?.username || 'current_user' }}
//           />
//         )}
//       </NewModal>
//     </div>
//   );
// };

// export default PatientVisitListTable;
