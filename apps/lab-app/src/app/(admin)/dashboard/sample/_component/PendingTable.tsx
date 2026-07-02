"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import NewCommonTable from "../../newcommoncomponent/NewCommonTable";
import { getHealthPackageById } from '@/../services/packageServices';
import { getVisitsByDate } from '@/../services/patientServices';
import { addSampleToVisit } from "../../../../../../services/sampleServices";
import { useLabs } from '@/context/LabContext';
import { HealthPackage, Patient } from '@/types/pendingTable/PendingTatbleDataType';
import { DATE_FILTER_OPTIONS, DateFilterOption, formatDateForAPI, getDateRange } from '@/utils/dateUtils';
import { calculateAgeInYears } from '@/utils/ageUtils';
import { toast } from 'react-toastify';
import Loader from '@/app/(admin)/component/common/Loader';
import SampleCollect from './SampleCollect';
import NewModal from "../../newcommoncomponent/NewModal";

type SortOption = 'patientName' | 'patientId';
interface PendingTableProps {
  onDataUpdate?: (count: number) => void;
  refreshTick?: number;
  onMutated?: () => void;
}

const PendingTable = ({ onDataUpdate, refreshTick, onMutated }: PendingTableProps) => {
  const { currentLab } = useLabs();
  
  // State management
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('patientId');
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [samples, setSamples] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Expanded row state for dropdown
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate(filteredPatients.length);
    }
  }, [filteredPatients, onDataUpdate]);

  // Fetch visits data
  const fetchVisits = async () => {
    if (!currentLab?.id) return;

    try {
      setIsFetching(true);
      const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);

      if (!startDate || !endDate) return;

      const response = await getVisitsByDate(
        currentLab.id,
        formatDateForAPI(startDate),
        formatDateForAPI(endDate)
      );

      const visits = response?.data || [];
      const pendingVisits = visits.filter((visit: Patient) => visit.visitDetailDto.visitStatus === 'Pending');
      
      const normalizedVisits = pendingVisits.map((visit: Patient) => ({
        ...visit,
        visitDetailDto: {
          ...visit.visitDetailDto,
          testIds: visit.visitDetailDto.testIds ?? [],
          tests: visit.visitDetailDto.tests ?? [],
        },
      }));

      setPatientList(normalizedVisits);

      // Fetch health packages
      const packageIds = pendingVisits.flatMap((visit: Patient) => visit.visitDetailDto.packageIds);
      const uniquePackageIds = Array.from(new Set(packageIds));
      
      if (uniquePackageIds.length > 0) {
        const fetchedPackages = await Promise.all(
          uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId as number))
        );
        setHealthPackages(fetchedPackages.map((pkg) => pkg.data));
      }
      
    } catch (error: unknown) {
      toast.error((error as Error).message || 'An error occurred while fetching visits', { autoClose: 2000 });
    } finally {
      setIsFetching(false);
    }
  };

  // Handle search and filter
  useEffect(() => {
    let filtered = patientList;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = patientList.filter(patient => 
        patient.visitDetailDto.visitCode?.toLowerCase().includes(searchLower) ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchLower) ||
        patient.id.toString().includes(searchTerm)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'patientName') {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      } else {
        // Sort by patient ID
        return a.id - b.id;
      }
    });

    setFilteredPatients(filtered);
  }, [patientList, searchTerm, sortBy]);

  // Get test items for a patient
  const getPatientTestItems = (patient: Patient) => {
    const packageTestIds = new Set<number>();
    patient.visitDetailDto.packageIds.forEach(packageId => {
      const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
      if (packageDetails) {
        packageDetails.tests.forEach(test => {
          packageTestIds.add(test.id);
        });
      }
    });

    const visitTests = patient.visitDetailDto.tests || [];
    const individualTests = visitTests.filter(test => !packageTestIds.has(test.id));
    
    return {
      tests: individualTests,
      hasPackages: patient.visitDetailDto.packageIds.length > 0,
      totalTestCount: individualTests.length + patient.visitDetailDto.packageIds.reduce((total, packageId) => {
        const pkg = healthPackages.find((p) => p.id === packageId);
        return total + (pkg?.tests?.length || 0);
      }, 0),
      packageNames: patient.visitDetailDto.packageIds.map(id => 
        healthPackages.find(pkg => pkg.id === id)?.packageName
      ).filter(Boolean)
    };
  };

  // Handle sample collection
  const handleSampleCollect = (visitId: number) => {
    setSelectedVisitId(visitId);
    setShowModal(true);
  };

  const handleVisitSample = async () => {
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
      // Refresh the list
      fetchVisits();
      // Let sibling tables (e.g. "Samples Collected") know a sample just
      // moved out of pending, so they refetch instantly instead of waiting.
      onMutated?.();
    } catch (error) {
      setLoading(false);
      toast.error("Failed to add samples");
    }
  };

  // Effects
  useEffect(() => {
    fetchVisits();
  }, [currentLab, dateFilter, customStartDate, customEndDate, refreshTick]);

  // Table columns definition
  const columns = [
    {
      header: "Patient ID",
      accessor: "id",
      render: (row: Patient) => (
        <div>
          <p className="font-semibold text-p3 text-pneutral-900">
            {row.visitDetailDto.visitCode || `#${row.id}`}
          </p>
          <p className="text-[12px] leading-[16px] font-normal text-pneutral-500">
            {row.visitDetailDto.visitDate ? new Date(row.visitDetailDto.visitDate).toLocaleDateString('en-IN') : ''}
          </p>
        </div>
      ),
    },
    {
      header: "Patient Details",
      accessor: "name",
      render: (row: Patient) => (
        <div>
          <p className="font-semibold text-p3 text-pneutral-900">
            {`${row.firstName} ${row.lastName}`}
          </p>
          <p className="text-p2 leading-[16px] font-normal text-pneutral-500">
            {calculateAgeInYears(row.dateOfBirth)} | {row.gender}
          </p>
        </div>
      ),
    },
    {
      header: "Report Status",
      accessor: "status",
      render: (row: Patient) => (
        <span className="inline-flex rounded-full bg-danger-100 px-5 py-1 text-p2 font-medium text-warning-800">
          {row.visitDetailDto.visitStatus}
        </span>
      ),
    },
    {
      header: "Tests/Package",
      accessor: "title",
      render: (row: Patient) => {
        const { tests, hasPackages, totalTestCount, packageNames } = getPatientTestItems(row);
        const allTestNames = [
          ...tests.map(t => t.name),
          ...healthPackages
            .filter(pkg => row.visitDetailDto.packageIds.includes(pkg.id))
            .flatMap(pkg => pkg.tests.map(test => test.name))
        ];
        
        const isSingleTest = allTestNames.length === 1;
        const isOpen = expandedRow === row.id.toString();

        if (isSingleTest) {
          return (
            <span className="rounded-full bg-secondary-50 px-3 py-1 text-xs font-medium text-secondary-700">
              {allTestNames[0]}
            </span>
          );
        }


        return (
          <div className="w-[274px]">
            <button
              onClick={() => setExpandedRow(isOpen ? null : row.id.toString())}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-3
              ${isOpen
                  ? "border-secondary-300 bg-secondary-50 rounded-b-none border-b-0"
                  : "border-secondary-200 bg-secondary-50"
                }`}
            >
              <div className="flex items-center gap-2">
                {hasPackages && <Package size={18} />}
                <span className="font-medium text-label-l4">
                  {hasPackages && packageNames.length > 0
                    ? packageNames.join(', ')
                    : `${totalTestCount} Tests`
                  }
                </span>
              </div>

              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {isOpen && (
              <div className="w-full rounded-xl rounded-t-none border border-t-0 border-secondary-300 bg-pneutral-50 p-4">
                <div className="space-y-4">
                  {/* Show packages and their tests */}
                  {row.visitDetailDto.packageIds.map((packageId) => {
                    const pkg = healthPackages.find(p => p.id === packageId);
                    if (!pkg) return null;
                    return (
                      <div key={packageId}>
                        <p className="text-sm font-semibold text-secondary-700 mb-1">
                          📦 {pkg.packageName}
                        </p>
                        {pkg.tests.map((test, index) => (
                          <p key={index} className="text-sm font-medium text-secondary-700 ml-4">
                            {test.name}
                          </p>
                        ))}
                      </div>
                    );
                  })}
                  
                  {/* Show individual tests */}
                  {tests.length > 0 && (
                    <div>
                      {tests.map((test, index) => (
                        <p key={index} className="text-sm font-medium text-secondary-700 ml-4">
                          {test.name}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: Patient) => (
        <button 
          onClick={() => row.visitDetailDto.visitId && handleSampleCollect(row.visitDetailDto.visitId)}
          className="flex items-center gap-1 rounded-lg border border-success-900 px-4 py-1 text-label-l2 font-medium text-success-900"
        >
          <Plus size={12} strokeWidth={4} />
          <span>Add Sample</span>
        </button>
      ),
    },
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
    <div className="w-full h-screen">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-pneutral-900">
          Pending Samples Status
        </h1>
        <p className="mt-1 text-sm text-pneutral-500">
          Manage and track pending patient Samples
        </p>
      </div>

      {/* Filters */}
      <div className="mt-5 rounded-xl border border-pneutral-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sneutral-700"
            />
            <input
              type="text"
              placeholder="Search by ID or Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-pneutral-200 pl-10 pr-4 text-sm outline-none focus:border-pneutral-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Date Range:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilterOption)}
                className="h-10 rounded-md border border-pneutral-200 px-3 text-sm focus:border-pneutral-500"
              >
                {DATE_FILTER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {dateFilter === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setCustomStartDate(e.target.value ? new Date(e.target.value) : null)}
                  className="h-10 rounded-md border border-pneutral-200 px-3 text-sm focus:border-pneutral-500"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setCustomEndDate(e.target.value ? new Date(e.target.value) : null)}
                  className="h-10 rounded-md border border-pneutral-200 px-3 text-sm focus:border-pneutral-500"
                  placeholder="End Date"
                />
              </>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-pneutral-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 rounded-md border border-pneutral-200 px-3 text-sm focus:border-pneutral-500"
              >
                <option value="patientId">Patient ID</option>
                <option value="patientName">Patient Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table - NewCommonTable handles pagination internally */}
<div className="mt-5 relative">
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
        {searchTerm ? `No results found for "${searchTerm}"` : "No pending samples found"}
      </p>
      {searchTerm && (
        <p className="mt-1 text-xs text-pneutral-400">
          Try adjusting your search or filter criteria
        </p>
      )}
    </div>
  ) : (
    <NewCommonTable 
      columns={columns} 
      data={filteredPatients} 
      pageSize={10}
      showPagination={true}
    />
  )}
</div>
      {/* <div className="mt-5 relative">
        <NewCommonTable 
          columns={columns} 
          data={filteredPatients} 
          pageSize={10}
          showPagination={true}
        />
      </div> */}

      {/* Sample Collection Modal */}
      {showModal && selectedVisitId && (
        <NewModal
          isOpen={showModal}
          title="Collect Sample"
          onClose={() => setShowModal(false)}
          modalClassName="max-w-xl"
        >
          <SampleCollect
            visitId={selectedVisitId}
            samples={samples}
            setSamples={setSamples}
            handleVititSample={handleVisitSample}
            loading={loading}
            setShowModal={setShowModal}
            onClose={() => setShowModal(false)}
          />
        </NewModal>
      )}
    </div>
  );
};

export default PendingTable;





























// code done by abhishek.......................(do not change)...............


// import { getHealthPackageById } from '@/../services/packageServices';
// import { getVisitsByDate } from '@/../services/patientServices';
// import Loader from '@/app/(admin)/component/common/Loader';
// import Modal from '@/app/(admin)/component/common/Model';
// import Pagination from '@/app/(admin)/component/common/Pagination';
// import TableComponent from '@/app/(admin)/component/common/TableComponent';
// import PatientInvoice from '@/app/(admin)/component/patientDashboard/invoice/PatientInvoice';
// import { useLabs } from '@/context/LabContext';
// import { HealthPackage, Patient } from '@/types/pendingTable/PendingTatbleDataType';
// import { calculateAgeInYears } from '@/utils/ageUtils';
// import { DATE_FILTER_OPTIONS, DateFilterOption, formatDateForAPI, formatDisplayDateWithWeekday, getDateRange } from '@/utils/dateUtils';
// import React, { useEffect, useState } from 'react';
// import { FaCalendarAlt } from 'react-icons/fa';
// import { PiTestTubeFill } from 'react-icons/pi';
// import { toast } from 'react-toastify';
// import { addSampleToVisit } from "../../../../../../services/sampleServices";
// import SampleCollect from './SampleCollect';

// const PendingTable: React.FC = () => {
//   const { currentLab } = useLabs();
//   const [patientList, setPatientList] = useState<Patient[]>([]);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
//   const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
//   const [samples, setSamples] = useState<string[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
//   const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
//   const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
//   const [isFetching, setIsFetching] = useState(false);
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [viewPatientDetails, setViewPatientDetails] = useState<Patient | null>(null);
//   const [isViewingDetails, setIsViewingDetails] = useState(false);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [itemsPerPage] = useState<number>(8);
  
//   // State for expanded rows
//   const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());





//   const fetchVisits = async () => {
//     if (!currentLab?.id) return;

//     try {
//       setIsFetching(true);
//       const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);

//       if (!startDate || !endDate) return;

//       const response = await getVisitsByDate(
//         currentLab.id,
//         formatDateForAPI(startDate),
//         formatDateForAPI(endDate)
//       );

//       const visits = response?.data || [];
//       const pendingVisits = visits.filter((visit: Patient) => visit.visitDetailDto.visitStatus === 'Pending');
//       const normalizedVisits = pendingVisits.map((visit: Patient) => ({
//         ...visit,
//         visitDetailDto: {
//           ...visit.visitDetailDto,
//           testIds: visit.visitDetailDto.testIds ?? [],
//           tests: visit.visitDetailDto.tests ?? [],
//         },
//       }));

//       normalizedVisits.sort((a: Patient, b: Patient) =>
//         new Date(b.visitDetailDto.visitDate).getTime() - new Date(a.visitDetailDto.visitDate).getTime()
//       );

//       setPatientList(normalizedVisits);

//       const packageIds = pendingVisits.flatMap((visit: Patient) => visit.visitDetailDto.packageIds);
//       const uniquePackageIds = Array.from(new Set(packageIds));
//       const fetchedPackages = await Promise.all(
//         uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId as number))
//       );

//       setHealthPackages(fetchedPackages.map((pkg) => pkg.data));
//     } catch (error: unknown) {
//       toast.error((error as Error).message || 'An error occurred while fetching visits', { autoClose: 2000 });
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   useEffect(() => {
//     fetchVisits();
//   }, [currentLab, dateFilter, customStartDate, customEndDate, loading]);



//   const handleDateFilterChange = (filter: DateFilterOption) => {
//     setDateFilter(filter);
//   };

//   const totalPages = Math.ceil(patientList.length / itemsPerPage);
//   const paginatedPatients = patientList.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   // const handleView = (visit: Patient) => () => {
//   //   setIsViewingDetails(true);
//   //   setViewPatientDetails(visit);
//   // };

//   const handleSampleCollect = (visitId: number) => {
//     setSelectedVisitId(visitId);
//     setShowModal(true);
//   };

//   const handleVititSample = async () => {
//     try {
//       if (samples.length === 0) {
//         return toast.error("Please add samples to the visit.");
//       }
//       setLoading(true);
//       if (selectedVisitId !== null) {
//         await addSampleToVisit(selectedVisitId, samples);
//       } else {
//         toast.error("Visit ID is not available.");
//       }

//       toast.success("Samples added to the visit successfully.");
//       setSamples([]);
//       setLoading(false);
//       setShowModal(false);
//     } catch (error) {
//       // Handle samples add error
//       setLoading(false);
//     }
//   };

//   // Toggle row expansion
//   const toggleRowExpansion = (visitId: number, columnType: 'tests' | 'packages') => {
//     const key = `${visitId}-${columnType}`;
    
//     setExpandedRows(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(key)) {
//         newSet.delete(key);
//       } else {
//         newSet.add(key);
//       }
//       return newSet;
//     });
//   };

//   const columns = [
//     {
//       header: 'ID',
//       accessor: (row: Patient) => row.visitDetailDto.visitCode || row.visitDetailDto.visitId,
//       cell: (value: number | string) => <span className="font-semibold text-primary">#{value}</span>
//     },
//     {
//       header: 'Patient',
//       accessor: (row: Patient) => (
//         <div className="flex flex-col gap-1">
//           <span className="font-medium text-gray-900">{`${row.firstName} ${row.lastName}`}</span>
//                      <span className="text-xs text-gray-500">{row.gender}, {calculateAgeInYears(row.dateOfBirth)}</span>
//           <div className="flex items-center gap-1 text-gray-500 bg-blue-50 px-2 py-1 rounded-full w-fit">
//             <FaCalendarAlt className="w-3 h-3 opacity-70" />
//             <span className="text-xs font-medium">{formatDisplayDateWithWeekday(row.visitDetailDto.visitDate)}</span>
//           </div>
//         </div>
//       ),
//     },
//     {
//       header: 'Status',
//       accessor: (row: Patient) => (
//         <div className="flex flex-col items-start">
//           <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.visitDetailDto.visitStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
//               row.visitDetailDto.visitStatus === 'Completed' ? 'bg-green-100 text-green-800' :
//                 'bg-gray-100 text-gray-800'
//             }`}>
//             {row.visitDetailDto.visitStatus}
//           </span>
//         </div>
//       ),
//     },
//     {
//       header: 'Tests',
//       accessor: (row: Patient) => {
//         // Get all test IDs that belong to packages
//         const packageTestIds = new Set<number>();
//         row.visitDetailDto.packageIds.forEach(packageId => {
//           const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//           if (packageDetails) {
//             // Add all test IDs from this package to the set
//             packageDetails.tests.forEach(test => {
//               packageTestIds.add(test.id);
//             });
//           }
//         });

//         const visitTests = row.visitDetailDto.tests || [];
//         // Filter out tests that belong to packages
//         const individualTests = visitTests.filter(test => !packageTestIds.has(test.id));

//         if (individualTests.length === 0) {
//           return (
//             <div className="text-gray-400 text-xs italic">No tests</div>
//           );
//         }

//         const isExpanded = expandedRows.has(`${row.visitDetailDto.visitId}-tests`);
//         const displayTests = isExpanded ? individualTests : individualTests.slice(0, 3);
//         const hasMoreTests = individualTests.length > 3;

//         return (
//           <div className="flex flex-col gap-1">
//             {displayTests.map((test) => (
//               <span key={test.id} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs inline-block w-fit">
//                 {test.name}
//               </span>
//             ))}
            
//             {hasMoreTests && (
//               <button
//                 onClick={() => toggleRowExpansion(row.visitDetailDto.visitId!, 'tests')}
//                 className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
//               >
//                 {isExpanded ? 'Show Less' : `View All (${individualTests.length})`}
//               </button>
//             )}
//           </div>
//         );
//       },
//     },
//     {
//       header: 'Package',
//       accessor: (row: Patient) => {
//         if (row.visitDetailDto.packageIds.length === 0) {
//           return (
//             <div className="text-gray-400 text-xs italic">No packages</div>
//           );
//         }

//         const isExpanded = expandedRows.has(`${row.visitDetailDto.visitId}-packages`);
        
//         // Calculate total tests across all packages
//         const totalTests = row.visitDetailDto.packageIds.reduce((total, packageId) => {
//           const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//           return total + (packageDetails?.tests?.length || 0);
//         }, 0);
        
//         // Show expandable logic if there are more than 3 total tests (even with 1 package)
//         const hasMoreContent = totalTests > 3;
        
//         // If expanded, show all packages. If not expanded, show first package with limited tests
//         let displayPackages: number[];
//         let displayTests: Array<{
//           id: number;
//           name: string;
//           price: number;
//           category?: string;
//         }> | null = null;
        
//         if (isExpanded) {
//           // Show all packages and all tests
//           displayPackages = row.visitDetailDto.packageIds;
//         } else {
//           // Show first package with limited tests
//           displayPackages = row.visitDetailDto.packageIds.slice(0, 1);
//           const firstPackage = healthPackages.find((pkg) => pkg.id === row.visitDetailDto.packageIds[0]);
//           if (firstPackage) {
//             displayTests = firstPackage.tests.slice(0, 3).map(test => ({
//               id: test.id,
//               name: test.name,
//               price: test.price,
//               category: test.category
//             })); // Show only first 3 tests
//           }
//         }


//         return (
//           <div className="flex flex-col gap-2">
//             {displayPackages.map((packageId) => {
//               const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//               if (!packageDetails) return null;

//               return (
//                 <div key={packageDetails.id} className="flex flex-col gap-1">
//                   <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
//                     📦 {packageDetails.packageName}
//                   </span>
//                   <div className="flex flex-col gap-1 ml-2">
//                     {(isExpanded ? packageDetails.tests : (displayTests || packageDetails.tests.slice(0, 3))).map((test: { id: number; name: string; price: number; category?: string }, index: number) => (
//                       <span key={`${packageDetails.id}-${index}`} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs inline-block w-fit">
//                         {test.name}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               );
//             }).filter(Boolean)}
            
//             {hasMoreContent && (
//               <button
//                 onClick={() => toggleRowExpansion(row.visitDetailDto.visitId!, 'packages')}
//                 className="text-xs text-purple-600 hover:text-purple-800 font-medium mt-1 w-fit"
//               >
//                 {isExpanded ? 'Show Less' : `View All (${totalTests} tests)`}
//               </button>
//             )}
//           </div>
//         );
//       },
//     },
//     {
//       header: 'Actions',
//       accessor: (row: Patient) => (
//         <div className="flex gap-2">
//           {/* <button
//             onClick={handleView(row)}
//             className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
//             title="View Details"
//           >
//             <FaEye className="text-sm" />
//           </button> */}
//           <button
//             onClick={() => row.visitDetailDto.visitId !== undefined && handleSampleCollect(row.visitDetailDto.visitId)}
//             className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
//             title="Collect Sample"
//           >
//             <PiTestTubeFill className="text-sm" />
//           </button>
//         </div>
//       ),
//     },
//   ];



//   if (isFetching) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64">
//         <Loader type="progress" fullScreen={false} text="Loading pending Samples..." />
//         <p className="mt-4 text-sm text-gray-500">Fetching the latest pending samples...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Pending Samples</h2>
//           <p className="text-sm text-gray-500">Manage and track pending patient Samples</p>
//         </div>

//         <div className="flex flex-col sm:flex-row gap-3">
//           <div className="flex flex-col w-40">
//             <label className="text-xs font-semibold mb-1 text-gray-600">Date Range:</label>
//             <select
//               value={dateFilter}
//               onChange={(e) => handleDateFilterChange(e.target.value as DateFilterOption)}
//               className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
//             >
//               {DATE_FILTER_OPTIONS.map(option => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {dateFilter === 'custom' && (
//             <>
//               <div className="flex flex-col w-40">
//                 <label className="text-xs font-semibold mb-1 text-gray-600">Start Date:</label>
//                 <input
//                   type="date"
//                   value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
//                   onChange={(e) => setCustomStartDate(e.target.value ? new Date(e.target.value) : null)}
//                   className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
//                 />
//               </div>

//               <div className="flex flex-col w-40">
//                 <label className="text-xs font-semibold mb-1 text-gray-600">End Date:</label>
//                 <input
//                   type="date"
//                   value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
//                   onChange={(e) => setCustomEndDate(e.target.value ? new Date(e.target.value) : null)}
//                   className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
//                 />
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       <div className="mb-4 flex justify-between items-center">
//         <div className="bg-blue-50 px-3 py-1 rounded-full">
//           <p className="text-xs font-medium text-blue-700">
//             Showing <span className="font-bold">{patientList.length}</span> pending visit{patientList.length !== 1 ? 's' : ''}
//           </p>
//         </div>
//       </div>

//       {patientList.length === 0 ? (
//         <div className="text-center py-12 bg-gray-50 rounded-lg">
//           <div className="mx-auto w-24 h-24 mb-4 text-gray-300">
//             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//           <h3 className="text-lg font-medium text-gray-700">No pending visits</h3>
//           <p className="text-gray-500 mt-1">No pending visits found for the selected date range</p>
//         </div>
//       ) : (
//         <>
//           <div className="overflow-x-auto rounded-lg border border-gray-200">
//             <TableComponent
//               data={paginatedPatients}
//               columns={columns}

//             />
//           </div>

//           {showModal && selectedVisitId && (
//             <Modal
//               isOpen={showModal}
//               title="Collect Sample"
//               onClose={() => setShowModal(false)}
//               modalClassName="max-w-xl"
//             >
//               <SampleCollect
//                 visitId={selectedVisitId}
//                 samples={samples}
//                 setSamples={setSamples}
//                 handleVititSample={handleVititSample}
//                 loading={loading}
//                 setShowModal={setShowModal}
//                 onClose={() => setShowModal(false)}
//               />
//             </Modal>
//           )}

//           {isViewingDetails && viewPatientDetails && (
//             <Modal
//               isOpen={isViewingDetails}
//               title="Patient Details"
//               onClose={() => setIsViewingDetails(false)}
//               modalClassName="max-w-5xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
//             >
//               <PatientInvoice viewPatientDetails={viewPatientDetails} />
//             </Modal>
//           )}

//           {totalPages > 1 && (
//             <div className="mt-6 flex justify-center">
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={setCurrentPage}
//               />
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default PendingTable;