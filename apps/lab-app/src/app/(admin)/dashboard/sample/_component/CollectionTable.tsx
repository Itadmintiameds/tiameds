import { getHealthPackageById } from '@/../services/packageServices';
import { getTestById } from '@/../services/testService';
import Loader from '@/app/(admin)/component/common/Loader';
import Modal from '@/app/(admin)/component/common/Model';
import Pagination from '@/app/(admin)/component/common/Pagination';
import TableComponent from '@/app/(admin)/component/common/TableComponent';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import html2canvas from 'html2canvas';
import { CalendarDays, ChevronDown, Download, Edit, PlusIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Barcode from 'react-barcode';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MdCancelPresentation } from 'react-icons/md';
import { toast } from 'react-toastify';
import { deleteVisitSample, getAllVisitssamples } from '../../../../../../services/sampleServices';
import PatientReportDataFill from './Report/PatientReportDataFill';
import UpdateSample from './UpdateSample';

export interface Patient {
  visitId: number;
  patientname: string;
  gender: string;
  contactNumber: string;
  email: string;
  visitDate: string;
  visitStatus: string;
  sampleNames: string[];
  testIds: number[];
  packageIds: number[];
  dateOfBirth?: string;
}

interface HealthPackage {
  id: number;
  packageName: string;
}

interface UpdateSample {
  visitId: number;
  sampleNames: string[];
}
type DateFilterOption = 'today' | 'yesterday' | 'last7days' | 'thisMonth' | 'thisYear' | 'custom';



const CollectionTable: React.FC = () => {
  const { currentLab } = useLabs();
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [tests, setTests] = useState<TestList[]>([]);
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [updatedPopUp, setUpdatedPopUp] = useState(false);
  const [updateSample, setUpdateSample] = useState<UpdateSample | null>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [updateCollectionTable, setUpdateCollectionTable] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

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
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const fetchVisits = async () => {
    try {
      if (!currentLab?.id) return;

      setIsFetching(true);
      const { startDate, endDate } = getDateRange(dateFilter);

      if (!startDate || !endDate) return;

      const response = await getAllVisitssamples(
        currentLab.id,
        formatDateForAPI(startDate),
        formatDateForAPI(endDate),
        'Collected'
      );

      const collectedVisits = response
        .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

      setPatientList(
        collectedVisits.map((visit) => ({
          visitId: visit.visitId,
          patientname: visit.patientname,
          gender: visit.gender ?? '',
          contactNumber: visit.contactNumber ?? '',
          email: visit.email ?? '',
          visitDate: visit.visitDate,
          visitStatus: visit.visitStatus,
          sampleNames: visit.sampleNames,
          testIds: visit.testIds,
          packageIds: visit.packageIds,
          dateOfBirth: visit.dateOfBirth ?? undefined,
        }))
      );

      const uniqueTestIds = Array.from(new Set(collectedVisits.flatMap((visit) => visit.testIds)));
      const fetchedTests = await Promise.all(
        uniqueTestIds.map((testId) => getTestById(currentLab.id.toString(), testId))
      );
      setTests(fetchedTests);

      const uniquePackageIds = Array.from(new Set(collectedVisits.flatMap((visit) => visit.packageIds)));
      const fetchedPackages = await Promise.all(
        uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId))
      );
      setHealthPackages(fetchedPackages.map((pkg) => pkg.data));
    } catch (error) {
      toast.error((error as Error).message || 'Error fetching visits', { autoClose: 2000 });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [currentLab, updatedPopUp, updateCollectionTable, dateFilter, customStartDate, customEndDate]);

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
  const paginatedPatients = patientList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const deleteSample = async (visitId: number, sampleNames: string[]) => {
    try {
      await deleteVisitSample(visitId, sampleNames);
      toast.success('Sample deleted successfully');
      fetchVisits();
    } catch (error) {
      toast.error((error as Error).message || 'Error deleting sample');
    }
  };

  const handleUpdate = (visitId: number, sampleNames: string[]) => {
    setUpdatedPopUp(true);
    setUpdateSample({ visitId, sampleNames });
  };

  const handleDownloadBarcode = async (id: number) => {
    if (barcodeRef.current) {
      const canvas = await html2canvas(barcodeRef.current);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `barcode-${id}.png`;
      link.click();
    }
  };
  const handleOpenReportModal = (patient: Patient) => {
    if (!patient) return; // Add this guard clause
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const filterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const columns = [
    {
      header: 'ID',
      accessor: (row: Patient) => row.visitId,
      cell: (value: number) => <span className="font-semibold text-primary">#{value}</span>
    },
    {
      header: 'Patient',
      accessor: (row: Patient) => row.patientname,
      cell: (value: string) => <span className="font-medium">{value}</span>
    },
    {
      header: 'Visit Date',
      accessor: (row: Patient) => row.visitDate,
      cell: (value: string) => (
        <div className="flex items-center gap-1 text-gray-600 bg-blue-50 px-2 py-1 rounded-full -ml-24">
          <CalendarDays className="w-3 h-3 opacity-70" />
          <span className="text-xs font-medium">{formatDisplayDate(value)}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row: Patient) => (
        <span className={'bg-green-100 text-green-800 rounded-full text-sm truncate'}>
          <span className="px-2 py-1 rounded-full text-xs font-semibold">{row.visitStatus}</span>
        </span>
      )
    },
    {
      header: 'Tests',
      accessor: (row: Patient) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.testIds.map((testId) => {
            const test = tests.find((t) => t.id === testId);
            return test ? (
              <span key={test.id} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs truncate">
                {test.name}
              </span>
            ) : null;
          }).filter(Boolean)}
        </div>
      )
    },
    {
      header: 'Package',
      accessor: (row: Patient) => (
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {row.packageIds.map((packageId) => {
            const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
            return packageDetails ? (
              <span key={packageDetails.id} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs truncate">
                {packageDetails.packageName}
              </span>
            ) : null;
          }).filter(Boolean)}
        </div>
      )
    },
    {
      header: 'Samples',
      accessor: (row: Patient) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleUpdate(row.visitId, row.sampleNames)}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="Edit samples"
          >
            <Edit className="w-4 h-4" />
          </button>
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {row.sampleNames.map((sample, index) => (
              <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                <span className="text-xs">{sample}</span>
                <button
                  onClick={() => deleteSample(row.visitId, [sample])}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Delete sample"
                >
                  <MdCancelPresentation className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      header: 'Barcode',
      accessor: (row: Patient) => (
        <div className="flex flex-col items-center gap-1">
          <div ref={barcodeRef} className="mb-1">
            <Barcode value={String(row.visitId)} format="CODE128" width={1.2} height={30} displayValue={false} />
          </div>
          <button
            onClick={() => handleDownloadBarcode(row.visitId)}
            className="flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </button>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (row: Patient) => (
        <button
          onClick={() => handleOpenReportModal(row)}
          className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors whitespace-nowrap"
        >
          <PlusIcon className="w-3 h-3" />
          <span>Reference</span>
        </button>
      )
    }
  ];

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader type="progress" fullScreen={false} text="Loading collected samples..." />
        <p className="mt-4 text-sm text-gray-500">Fetching collected samples, please wait...</p>
      </div>
    );
  }
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Collected Samples</h2>
          <p className="text-xs text-gray-500">Manage collected patient samples</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <button
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
            >
              <CalendarDays className="w-3 h-3 text-gray-500" />
              <span>{filterOptions.find(opt => opt.value === dateFilter)?.label || 'Filter'}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>

            {showCustomDatePicker && (
              <div className="absolute z-10 mt-1 right-0 bg-white p-3 rounded-lg shadow-lg border border-gray-200 w-64">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Date Range</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => handleDateFilterChange(e.target.value as DateFilterOption)}
                      className="w-full p-1.5 border border-gray-300 rounded-md text-xs"
                    >
                      {filterOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {dateFilter === 'custom' && (
                    <div className="space-y-1">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                        <DatePicker
                          selected={customStartDate}
                          onChange={(date) => setCustomStartDate(date)}
                          selectsStart
                          startDate={customStartDate}
                          endDate={customEndDate}
                          className="w-full p-1.5 border border-gray-300 rounded-md text-xs"
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
                          className="w-full p-1.5 border border-gray-300 rounded-md text-xs"
                          placeholderText="Select end date"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={dateFilter === 'custom' ? handleCustomDateApply : () => setShowCustomDatePicker(false)}
                    className="w-full bg-blue-600 text-white py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mb-3 flex justify-between items-center">
        <div className="bg-blue-50 px-2 py-0.5 rounded-full">
          <p className="text-xs font-medium text-blue-700">
            Showing <span className="font-bold">{patientList.length}</span> collected sample{patientList.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {patientList.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="mx-auto w-16 h-16 mb-3 text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-md font-medium text-gray-700">No collected samples</h3>
          <p className="text-gray-500 text-xs mt-1">No samples found for the selected date range</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <TableComponent
              data={paginatedPatients}
              columns={columns}

            />
          </div>

          {showModal && selectedPatient && (
            <Modal isOpen={showModal} title="Enter Report Data" onClose={() => setShowModal(false)} modalClassName="max-w-5xl">
              <PatientReportDataFill
                selectedPatient={selectedPatient}
                updateCollectionTable={updateCollectionTable}
                setUpdateCollectionTable={setUpdateCollectionTable}
                setShowModal={setShowModal}
              />
            </Modal>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {updatedPopUp && (
            <Modal isOpen={updatedPopUp} title="Update Sample" onClose={() => setUpdatedPopUp(false)} modalClassName="max-w-xl">
              <UpdateSample
                visitId={updateSample?.visitId ?? 0}
                sampleNames={updateSample?.sampleNames ?? []}
                onClose={() => setUpdatedPopUp(false)}
              />
            </Modal>
          )}
        </>
      )}
    </div>
  );
};

export default CollectionTable;