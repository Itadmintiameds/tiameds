import { getHealthPackageById } from '@/../services/packageServices';
import { getVisitsByDate } from '@/../services/patientServices';
import { getTestById } from '@/../services/testService';
import Loader from '@/app/(admin)/component/common/Loader';
import Modal from '@/app/(admin)/component/common/Model';
import Pagination from '@/app/(admin)/component/common/Pagination';
import TableComponent from '@/app/(admin)/component/common/TableComponent';
import PatientInvoice from '@/app/(admin)/component/patientDashboard/invoice/PatientInvoice';
import { useLabs } from '@/context/LabContext';
import { DateFilterOption, HealthPackage, Patient } from '@/types/pendingTable/PendingTatbleDataType';
import { TestList } from '@/types/test/testlist';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaChevronDown, FaEye, FaFilter } from 'react-icons/fa';
import { PiTestTubeFill } from 'react-icons/pi';
import { toast } from 'react-toastify';
import { addSampleToVisit } from "../../../../../../services/sampleServices";
import SampleCollect from './SampleCollect';

const PendingTable: React.FC = () => {
  const { currentLab } = useLabs();
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [tests, setTests] = useState<TestList[]>([]);
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
  const [samples, setSamples] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [viewPatientDetails, setViewPatientDetails] = useState<Patient | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);

  const getDateRange = (filter: DateFilterOption) => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (filter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        startDate.setDate(endDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) {
          toast.warning("Please select both start and end dates");
          return { startDate: null, endDate: null };
        }
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        break;
    }

    return { startDate, endDate };
  };

  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const fetchVisits = async () => {
    if (!currentLab?.id) return;

    try {
      setIsFetching(true);
      const { startDate, endDate } = getDateRange(dateFilter);

      if (!startDate || !endDate) return;

      const response = await getVisitsByDate(
        currentLab.id,
        formatDateForAPI(startDate),
        formatDateForAPI(endDate)
      );

      const visits = response?.data || [];
      const pendingVisits = visits.filter((visit: Patient) => visit.visitDetailDto.visitStatus === 'Pending');

      pendingVisits.sort((a: Patient, b: Patient) =>
        new Date(b.visitDetailDto.visitDate).getTime() - new Date(a.visitDetailDto.visitDate).getTime()
      );

      setPatientList(pendingVisits);

      const testIds = pendingVisits.flatMap((visit: Patient) => visit.visitDetailDto.testIds);
      const uniqueTestIds = Array.from(new Set(testIds));
      const fetchedTests = await Promise.all(
        uniqueTestIds.map((testId) => getTestById(currentLab.id.toString(), testId as number))
      );
      setTests(fetchedTests);

      const packageIds = pendingVisits.flatMap((visit: Patient) => visit.visitDetailDto.packageIds);
      const uniquePackageIds = Array.from(new Set(packageIds));
      const fetchedPackages = await Promise.all(
        uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId as number))
      );

      setHealthPackages(fetchedPackages.map((pkg) => pkg.data));
    } catch (error: unknown) {
      toast.error((error as Error).message || 'An error occurred while fetching visits', { autoClose: 2000 });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [currentLab, dateFilter, customStartDate, customEndDate, loading]);



  const handleDateFilterChange = (filter: DateFilterOption) => {
    setDateFilter(filter);
    if (filter !== 'custom') {
      setShowCustomDatePicker(false);
    } else {
      setShowCustomDatePicker(true);
    }
  };

  const handleCustomDateApply = () => {
    if (!customStartDate || !customEndDate) {
      toast.warning("Please select both start and end dates");
      return;
    }
    if (customStartDate > customEndDate) {
      toast.warning("Start date cannot be after end date");
      return;
    }
    setDateFilter('custom');
    setShowCustomDatePicker(false);
  };

  const totalPages = Math.ceil(patientList.length / itemsPerPage);
  const paginatedPatients = patientList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleView = (visit: Patient) => () => {
    setIsViewingDetails(true);
    setViewPatientDetails(visit);
  };

  const handleSampleCollect = (visitId: number) => {
    setSelectedVisitId(visitId);
    setShowModal(true);
  };

  const handleVititSample = async () => {
    try {
      if (samples.length === 0) {
        return toast.error("Please add samples to the visit.");
      }
      setLoading(true);
      if (selectedVisitId !== null) {
        await addSampleToVisit(selectedVisitId, samples);
      } else {
        toast.error("Visit ID is not available.");
      }

      toast.success("Samples added to the visit successfully.");
      setSamples([]);
      setLoading(false);
      setShowModal(false);
    } catch (error) {
      console.error("Error adding samples to visit:", error);
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: (row: Patient) => row.visitDetailDto.visitId,
      cell: (value: number) => <span className="font-semibold text-primary">#{value}</span>
    },
    {
      header: 'Patient',
      accessor: (row: Patient) => (
        <div className="flex flex-col">
          <span className="font-medium">{`${row.firstName} ${row.lastName}`}</span>
          <span className="text-xs text-gray-500">{row.gender}, {calculateAge(row.dateOfBirth)}y</span>
        </div>
      ),
    },
    {
      header: 'Visit Date',
      accessor: (row: Patient) => (
        <div className="flex items-center gap-1 text-gray-600 -ml-8">
          <FaCalendarAlt className="text-xs opacity-70" />
          <span>{formatDisplayDate(row.visitDetailDto.visitDate)}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Patient) => (
        <div className="flex flex-col items-start">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.visitDetailDto.visitStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
              row.visitDetailDto.visitStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
            }`}>
            {row.visitDetailDto.visitStatus}
          </span>
        </div>
      ),
    },
    {
      header: 'Tests',
      accessor: (row: Patient) => (
        <div className="flex flex-col gap-1">
          {row.visitDetailDto.testIds
            .map((testId) => {
              const test = tests.find((t) => t.id === testId);
              return test ? (
                <span key={test.id} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                  {test.name}
                </span>
              ) : null;
            })
            .filter(Boolean)}
        </div>
      ),
    },
    {
      header: 'Package',
      accessor: (row: Patient) => (
        <div className="flex flex-wrap gap-1">
          {row.visitDetailDto.packageIds
            .map((packageId) => {
              const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
              return packageDetails ? (
                <span key={packageDetails.id} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                  {packageDetails.packageName}
                </span>
              ) : null;
            })
            .filter(Boolean)}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Patient) => (
        <div className="flex gap-2">
          <button
            onClick={handleView(row)}
            className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            title="View Details"
          >
            <FaEye className="text-sm" />
          </button>
          <button
            onClick={() => row.visitDetailDto.visitId !== undefined && handleSampleCollect(row.visitDetailDto.visitId)}
            className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
            title="Collect Sample"
          >
            <PiTestTubeFill className="text-sm" />
          </button>
        </div>
      ),
    },
  ];

  const filterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader type="progress" fullScreen={false} text="Loading pending Samples..." />
        <p className="mt-4 text-sm text-gray-500">Fetching the latest pending samples...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pending Samples</h2>
          <p className="text-sm text-gray-500">Manage and track pending patient Samples</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div 
            className="relative"
            onBlur={(e) => {
              // Close dropdown when clicking outside
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setShowCustomDatePicker(false);
              }
            }}
            tabIndex={-1}
          >
            <button
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
            >
              <FaFilter className="text-gray-500" />
              <span>{filterOptions.find(opt => opt.value === dateFilter)?.label || 'Filter'}</span>
              <FaChevronDown className="text-xs text-gray-500" />
            </button>

            {showCustomDatePicker && (
              <div className="absolute z-10 mt-1 right-0 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-72">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Date Range</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => handleDateFilterChange(e.target.value as DateFilterOption)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      {filterOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {dateFilter === 'custom' && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                        <DatePicker
                          selected={customStartDate}
                          onChange={(date) => setCustomStartDate(date)}
                          selectsStart
                          startDate={customStartDate}
                          endDate={customEndDate}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          maxDate={new Date()}
                          placeholderText="Select start date"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                        <DatePicker
                          selected={customEndDate}
                          onChange={(date) => setCustomEndDate(date)}
                          selectsEnd
                          startDate={customStartDate}
                          endDate={customEndDate}
                          minDate={customStartDate ?? undefined}
                          maxDate={new Date()}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          placeholderText="Select end date"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={dateFilter === 'custom' ? handleCustomDateApply : () => setShowCustomDatePicker(false)}
                    className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="bg-blue-50 px-3 py-1 rounded-full">
          <p className="text-xs font-medium text-blue-700">
            Showing <span className="font-bold">{patientList.length}</span> pending visit{patientList.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {patientList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mx-auto w-24 h-24 mb-4 text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700">No pending visits</h3>
          <p className="text-gray-500 mt-1">No pending visits found for the selected date range</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <TableComponent
              data={paginatedPatients}
              columns={columns}

            />
          </div>

          {showModal && selectedVisitId && (
            <Modal
              isOpen={showModal}
              title="Collect Sample"
              onClose={() => setShowModal(false)}
              modalClassName="max-w-xl"
            >
              <SampleCollect
                visitId={selectedVisitId}
                samples={samples}
                setSamples={setSamples}
                handleVititSample={handleVititSample}
                loading={loading}
                setShowModal={setShowModal}
              />
            </Modal>
          )}

          {isViewingDetails && viewPatientDetails && (
            <Modal
              isOpen={isViewingDetails}
              title="Patient Details"
              onClose={() => setIsViewingDetails(false)}
              modalClassName="max-w-5xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
            >
              <PatientInvoice viewPatientDetails={viewPatientDetails} />
            </Modal>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
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
  );
};

export default PendingTable;