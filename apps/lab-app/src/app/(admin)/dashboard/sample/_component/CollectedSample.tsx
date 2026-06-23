"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  Edit,
} from "lucide-react";
import NewCommonTable from "../../newcommoncomponent/NewCommonTable";
import { getHealthPackageById } from '@/../services/packageServices';
import { useLabs } from '@/context/LabContext';
// import { Patient } from '@/types/pendingTable/PendingTatbleDataType';
import { DATE_FILTER_OPTIONS, DateFilterOption, formatDateForAPI, getDateRange } from '@/utils/dateUtils';
import { calculateAgeInYears } from '@/utils/ageUtils';
import { toast } from 'react-toastify';
import Loader from '@/app/(admin)/component/common/Loader';
import NewModal from "../../newcommoncomponent/NewModal";
import { getCollectedCompleted } from '../../../../../../services/sampleServices';
import UpdateSample from "./UpdateSample";
import { TestResult } from '@/types/sample/sample';

interface HealthPackage {
  id: number;
  packageName: string;
  tests: Array<{
    id: number;
    name: string;
    price: number;
    category?: string;
  }>;
}

interface CollectedPatient {
  visitId: number;
  patientname: string;
  gender: string;
  contactNumber: string;
  email: string;
  visitDate: string;
  visitStatus: string;
  sampleNames: string[];
  visitCode?: string;
  testIds: number[];
  tests?: Array<{
    id: number;
    name: string;
  }>;
  packageIds: number[];
  dateOfBirth?: string;
  testResult?: TestResult[];
}

type SortOption = 'patientName' | 'patientId';

const CollectedSample = () => {
  const { currentLab } = useLabs();
  
  // State management
  const [patientList, setPatientList] = useState<CollectedPatient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<CollectedPatient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('patientId');
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [selectedSampleNames, setSelectedSampleNames] = useState<string[]>([]);
  const [updateCollectionTable, setUpdateCollectionTable] = useState(false);
  
  // Expanded row state for dropdown
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Fetch collected visits data
  const fetchVisits = async () => {
    if (!currentLab?.id) return;

    try {
      setIsFetching(true);
      const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);

      if (!startDate || !endDate) return;

      const response = await getCollectedCompleted(
        currentLab.id,
        formatDateForAPI(startDate),
        formatDateForAPI(endDate),
      );

      // Filter out visits where all tests are completed
      const collectedVisits = response
        .filter(visit => {
          if (!visit.testResult || visit.testResult.length === 0) {
            return true;
          }
          const allTestsCompleted = visit.testResult.every(tr => tr.reportStatus === 'Completed');
          return !allTestsCompleted;
        })
        .sort((a, b) => b.visitId - a.visitId);

      const normalizedVisits: CollectedPatient[] = collectedVisits.map((visit) => {
        const visitTests = visit.tests ?? [];
        return {
          visitId: visit.visitId,
          patientname: visit.patientname,
          gender: visit.gender ?? '',
          contactNumber: visit.contactNumber ?? '',
          email: visit.email ?? '',
          visitDate: visit.visitDate,
          visitStatus: visit.visitStatus,
          sampleNames: visit.sampleNames,
          visitCode: visit.visitCode, // Keep the original visitCode
          testIds: visit.testIds ?? visitTests.map((test) => test.id),
          tests: visitTests,
          packageIds: visit.packageIds,
          dateOfBirth: visit.dateOfBirth,
          testResult: visit.testResult as TestResult[] | undefined,
        };
      });

      setPatientList(normalizedVisits);

      // Fetch health packages
      const uniquePackageIds = Array.from(new Set(normalizedVisits.flatMap((visit) => visit.packageIds)));
      if (uniquePackageIds.length > 0) {
        const fetchedPackages = await Promise.all(
          uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId))
        );
        setHealthPackages(fetchedPackages.map((pkg) => pkg.data));
      }
      
    } catch (error: unknown) {
      toast.error((error as Error).message || 'An error occurred while fetching collected samples', { autoClose: 2000 });
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
        patient.visitCode?.toLowerCase().includes(searchLower) ||
        patient.patientname?.toLowerCase().includes(searchLower) ||
        patient.visitId.toString().includes(searchTerm)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'patientName') {
        const nameA = a.patientname?.toLowerCase() || '';
        const nameB = b.patientname?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      } else {
        return a.visitId - b.visitId;
      }
    });

    setFilteredPatients(filtered);
  }, [patientList, searchTerm, sortBy]);

  // Get test items for a patient
  const getPatientTestItems = (patient: CollectedPatient) => {
    const packageTestIds = new Set<number>();
    patient.packageIds.forEach(packageId => {
      const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
      if (packageDetails) {
        packageDetails.tests.forEach(test => {
          packageTestIds.add(test.id);
        });
      }
    });

    const visitTests = patient.tests || [];
    const individualTests = visitTests.filter(test => !packageTestIds.has(test.id));
    
    return {
      tests: individualTests,
      hasPackages: patient.packageIds.length > 0,
      totalTestCount: individualTests.length + patient.packageIds.reduce((total, packageId) => {
        const pkg = healthPackages.find((p) => p.id === packageId);
        return total + (pkg?.tests?.length || 0);
      }, 0),
      packageNames: patient.packageIds.map(id => 
        healthPackages.find(pkg => pkg.id === id)?.packageName
      ).filter(Boolean)
    };
  };

  // Handle edit sample
  const handleEditSample = (visitId: number, sampleNames: string[]) => {
    setSelectedVisitId(visitId);
    setSelectedSampleNames(sampleNames);
    setShowEditModal(true);
  };

  // Effects
  useEffect(() => {
    fetchVisits();
  }, [currentLab, dateFilter, customStartDate, customEndDate, updateCollectionTable]);

  // Table columns definition (matching PendingTable structure)
  const columns = [
    {
      header: "Patient ID",
      accessor: "id",
      render: (row: CollectedPatient) => (
        <div>
          <p className="font-semibold text-p3 text-pneutral-900">
            {row.visitCode || `#${row.visitId}`}
          </p>
          <p className="text-[12px] leading-[16px] font-normal text-pneutral-500">
            {row.visitDate ? new Date(row.visitDate).toLocaleDateString('en-IN') : ''}
          </p>
        </div>
      ),
    },
    {
      header: "Patient Details",
      accessor: "name",
      render: (row: CollectedPatient) => (
        <div>
          <p className="font-semibold text-p3 text-pneutral-900">
            {row.patientname}
          </p>
          <p className="text-p2 leading-[16px] font-normal text-pneutral-500">
            {row.dateOfBirth ? calculateAgeInYears(row.dateOfBirth) : 'N/A'} | {row.gender}
          </p>
        </div>
      ),
    },
    {
      header: "Report Status",
      accessor: "status",
      render: () => (
        <span className="inline-flex rounded-full bg-info-400 px-5 py-1 text-p2 font-medium text-info-50">
          Sample Collected
        </span>
      ),
    },
    {
      header: "Tests/Package",
      accessor: "title",
      render: (row: CollectedPatient) => {
        const { tests, hasPackages, totalTestCount, packageNames } = getPatientTestItems(row);
        
        // Get all test names
        const allTestNames = [
          ...tests.map(t => t.name),
          ...healthPackages
            .filter(pkg => row.packageIds.includes(pkg.id))
            .flatMap(pkg => pkg.tests.map(test => test.name))
        ];
        
        const isSingleTest = allTestNames.length === 1;
        const isOpen = expandedRow === row.visitId.toString();

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
              onClick={() => setExpandedRow(isOpen ? null : row.visitId.toString())}
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
                  {row.packageIds.map((packageId) => {
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
      render: (row: CollectedPatient) => (
        <button 
          onClick={() => handleEditSample(row.visitId, row.sampleNames)}
          className="flex items-center gap-1 rounded-lg border border-success-900 px-4 py-1 text-label-l2 font-medium text-success-900"
        >
          <Edit size={12} strokeWidth={2} />
          <span>Edit Sample</span>
        </button>
      ),
    },
  ];

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader type="progress" fullScreen={false} text="Loading collected samples..." />
        <p className="mt-4 text-sm text-gray-500">Fetching the latest collected samples...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-pneutral-900">
          Collected Samples
        </h1>
        <p className="mt-1 text-sm text-pneutral-500">
          Manage and track collected patient samples
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

      {/* Table */}
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
              {searchTerm ? `No results found for "${searchTerm}"` : "No collected samples found"}
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

      {/* Edit Sample Modal */}
      {showEditModal && selectedVisitId && (
        <NewModal
          isOpen={showEditModal}
          title="Edit Sample"
          onClose={() => {
            setShowEditModal(false);
            setSelectedVisitId(null);
            setSelectedSampleNames([]);
          }}
          modalClassName="max-w-xl"
        >
          <UpdateSample
            visitId={selectedVisitId}
            sampleNames={selectedSampleNames}
            onClose={() => {
              setShowEditModal(false);
              setSelectedVisitId(null);
              setSelectedSampleNames([]);
              setUpdateCollectionTable(prev => !prev);
              fetchVisits();
            }}
          />
        </NewModal>
      )}
    </div>
  );
};

export default CollectedSample;











// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   Search,
//   Package,
//   ChevronDown,
//   ChevronUp,
//   Edit,
// } from "lucide-react";
// import NewCommonTable from "../../newcommoncomponent/NewCommonTable";
// import { getHealthPackageById } from '@/../services/packageServices';
// import { useLabs } from '@/context/LabContext';
// import { Patient } from '@/types/pendingTable/PendingTatbleDataType';
// import { DATE_FILTER_OPTIONS, DateFilterOption, formatDateForAPI, getDateRange } from '@/utils/dateUtils';
// import { calculateAgeInYears } from '@/utils/ageUtils';
// import { toast } from 'react-toastify';
// import Loader from '@/app/(admin)/component/common/Loader';
// import NewModal from "../../newcommoncomponent/NewModal";
// import { getCollectedCompleted } from '../../../../../../services/sampleServices';
// import UpdateSample from "./UpdateSample";


// interface HealthPackage {
//   id: number;
//   packageName: string;
//   tests: Array<{
//     id: number;
//     name: string;
//     price: number;
//     category?: string;
//   }>;
// }

// interface TestResult {
//   id: number;
//   testId: number;
//   isFilled: boolean;
//   reportStatus: string;
//   createdBy: string;
//   updatedBy: string;
//   createdAt: string;
//   updatedAt: string;
//   reportId: number | null;
// }

// interface CollectedPatient extends Patient {
//   visitId: number;
//   patientname: string;
//   gender: string;
//   contactNumber: string;
//   email: string;
//   visitDate: string;
//   visitStatus: string;
//   sampleNames: string[];
//   visitCode?: string;
//   testIds: number[];
//   tests?: Array<{
//     id: number;
//     name: string;
//   }>;
//   packageIds: number[];
//   dateOfBirth?: string;
//   testResult?: TestResult[];
// }

// type SortOption = 'patientName' | 'patientId';

// const CollectedSample = () => {
//   const { currentLab } = useLabs();
  
//   // State management
//   const [patientList, setPatientList] = useState<CollectedPatient[]>([]);
//   const [filteredPatients, setFilteredPatients] = useState<CollectedPatient[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
//   const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
//   const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
//   const [isFetching, setIsFetching] = useState(false);
//   const [sortBy, setSortBy] = useState<SortOption>('patientId');
//   const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
  
//   // Modal states
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
//   const [selectedSampleNames, setSelectedSampleNames] = useState<string[]>([]);
//   const [updateCollectionTable, setUpdateCollectionTable] = useState(false);
  
//   // Expanded row state for dropdown
//   const [expandedRow, setExpandedRow] = useState<string | null>(null);

//   // Fetch collected visits data
//   const fetchVisits = async () => {
//     if (!currentLab?.id) return;

//     try {
//       setIsFetching(true);
//       const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);

//       if (!startDate || !endDate) return;

//       const response = await getCollectedCompleted(
//         currentLab.id,
//         formatDateForAPI(startDate),
//         formatDateForAPI(endDate),
//       );

//       // Filter out visits where all tests are completed
//       const collectedVisits = response
//         .filter(visit => {
//           if (!visit.testResult || visit.testResult.length === 0) {
//             return true;
//           }
//           const allTestsCompleted = visit.testResult.every(tr => tr.reportStatus === 'Completed');
//           return !allTestsCompleted;
//         })
//         .sort((a, b) => b.visitId - a.visitId);

//       const normalizedVisits = collectedVisits.map((visit) => {
//         const visitTests = visit.tests ?? [];
//         return {
//           ...visit,
//           visitId: visit.visitId,
//           patientname: visit.patientname,
//           gender: visit.gender ?? '',
//           contactNumber: visit.contactNumber ?? '',
//           email: visit.email ?? '',
//           visitDate: visit.visitDate,
//           visitStatus: visit.visitStatus,
//           sampleNames: visit.sampleNames,
//           testIds: visit.testIds ?? visitTests.map((test) => test.id),
//           tests: visitTests,
//           packageIds: visit.packageIds,
//           dateOfBirth: visit.dateOfBirth ?? undefined,
//           testResult: visit.testResult ?? undefined,
//         };
//       });

//       setPatientList(normalizedVisits);

//       // Fetch health packages
//       const uniquePackageIds = Array.from(new Set(normalizedVisits.flatMap((visit) => visit.packageIds)));
//       if (uniquePackageIds.length > 0) {
//         const fetchedPackages = await Promise.all(
//           uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId))
//         );
//         setHealthPackages(fetchedPackages.map((pkg) => pkg.data));
//       }
      
//     } catch (error: unknown) {
//       toast.error((error as Error).message || 'An error occurred while fetching collected samples', { autoClose: 2000 });
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   // Handle search and filter
//   useEffect(() => {
//     let filtered = patientList;

//     // Apply search filter
//     if (searchTerm.trim()) {
//       const searchLower = searchTerm.toLowerCase();
//       filtered = patientList.filter(patient => 
//         patient.visitCode?.toLowerCase().includes(searchLower) ||
//         patient.patientname?.toLowerCase().includes(searchLower) ||
//         patient.visitId.toString().includes(searchTerm)
//       );
//     }

//     // Apply sorting
//     filtered = [...filtered].sort((a, b) => {
//       if (sortBy === 'patientName') {
//         const nameA = a.patientname?.toLowerCase() || '';
//         const nameB = b.patientname?.toLowerCase() || '';
//         return nameA.localeCompare(nameB);
//       } else {
//         return a.visitId - b.visitId;
//       }
//     });

//     setFilteredPatients(filtered);
//   }, [patientList, searchTerm, sortBy]);

//   // Get test items for a patient
//   const getPatientTestItems = (patient: CollectedPatient) => {
//     const packageTestIds = new Set<number>();
//     patient.packageIds.forEach(packageId => {
//       const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//       if (packageDetails) {
//         packageDetails.tests.forEach(test => {
//           packageTestIds.add(test.id);
//         });
//       }
//     });

//     const visitTests = patient.tests || [];
//     const individualTests = visitTests.filter(test => !packageTestIds.has(test.id));
    
//     return {
//       tests: individualTests,
//       hasPackages: patient.packageIds.length > 0,
//       totalTestCount: individualTests.length + patient.packageIds.reduce((total, packageId) => {
//         const pkg = healthPackages.find((p) => p.id === packageId);
//         return total + (pkg?.tests?.length || 0);
//       }, 0),
//       packageNames: patient.packageIds.map(id => 
//         healthPackages.find(pkg => pkg.id === id)?.packageName
//       ).filter(Boolean)
//     };
//   };

//   // Handle edit sample
//   const handleEditSample = (visitId: number, sampleNames: string[]) => {
//     setSelectedVisitId(visitId);
//     setSelectedSampleNames(sampleNames);
//     setShowEditModal(true);
//   };

//   // Effects
//   useEffect(() => {
//     fetchVisits();
//   }, [currentLab, dateFilter, customStartDate, customEndDate, updateCollectionTable]);

//   // Table columns definition (matching PendingTable structure)
//   const columns = [
//     {
//       header: "Patient ID",
//       accessor: "id",
//       render: (row: CollectedPatient) => (
//         <div>
//           <p className="font-semibold text-p3 text-pneutral-900">
//             {row.visitCode || `#${row.visitId}`}
//           </p>
//           <p className="text-[12px] leading-[16px] font-normal text-pneutral-500">
//             {row.visitDate ? new Date(row.visitDate).toLocaleDateString('en-IN') : ''}
//           </p>
//         </div>
//       ),
//     },
//     {
//       header: "Patient Details",
//       accessor: "name",
//       render: (row: CollectedPatient) => (
//         <div>
//           <p className="font-semibold text-p3 text-pneutral-900">
//             {row.patientname}
//           </p>
//           <p className="text-p2 leading-[16px] font-normal text-pneutral-500">
//             {calculateAgeInYears(row.dateOfBirth)} | {row.gender}
//           </p>
//         </div>
//       ),
//     },
//     {
//       header: "Report Status",
//       accessor: "status",
//       render: (row: CollectedPatient) => (
//         <span className="inline-flex rounded-full bg-info-400 px-5 py-1 text-p2 font-medium text-info-50">
//           Sample Collected
//         </span>
//       ),
//     },
//     {
//       header: "Tests/Package",
//       accessor: "title",
//       render: (row: CollectedPatient) => {
//         const { tests, hasPackages, totalTestCount, packageNames } = getPatientTestItems(row);
        
//         // Get all test names
//         const allTestNames = [
//           ...tests.map(t => t.name),
//           ...healthPackages
//             .filter(pkg => row.packageIds.includes(pkg.id))
//             .flatMap(pkg => pkg.tests.map(test => test.name))
//         ];
        
//         const isSingleTest = allTestNames.length === 1;
//         const isOpen = expandedRow === row.visitId.toString();

//         if (isSingleTest) {
//           return (
//             <span className="rounded-full bg-secondary-50 px-3 py-1 text-xs font-medium text-secondary-700">
//               {allTestNames[0]}
//             </span>
//           );
//         }

//         return (
//           <div className="w-[274px]">
//             <button
//               onClick={() => setExpandedRow(isOpen ? null : row.visitId.toString())}
//               className={`flex w-full items-center justify-between rounded-xl border px-3 py-3
//               ${isOpen
//                   ? "border-secondary-300 bg-secondary-50 rounded-b-none border-b-0"
//                   : "border-secondary-200 bg-secondary-50"
//                 }`}
//             >
//               <div className="flex items-center gap-2">
//                 {hasPackages && <Package size={18} />}
//                 <span className="font-medium text-label-l4">
//                   {hasPackages && packageNames.length > 0
//                     ? packageNames.join(', ')
//                     : `${totalTestCount} Tests`
//                   }
//                 </span>
//               </div>

//               {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//             </button>

//             {isOpen && (
//               <div className="w-full rounded-xl rounded-t-none border border-t-0 border-secondary-300 bg-pneutral-50 p-4">
//                 <div className="space-y-4">
//                   {/* Show packages and their tests */}
//                   {row.packageIds.map((packageId) => {
//                     const pkg = healthPackages.find(p => p.id === packageId);
//                     if (!pkg) return null;
//                     return (
//                       <div key={packageId}>
//                         <p className="text-sm font-semibold text-secondary-700 mb-1">
//                           📦 {pkg.packageName}
//                         </p>
//                         {pkg.tests.map((test, index) => (
//                           <p key={index} className="text-sm font-medium text-secondary-700 ml-4">
//                             {test.name}
//                           </p>
//                         ))}
//                       </div>
//                     );
//                   })}
                  
//                   {/* Show individual tests */}
//                   {tests.length > 0 && (
//                     <div>
//                       {tests.map((test, index) => (
//                         <p key={index} className="text-sm font-medium text-secondary-700 ml-4">
//                           {test.name}
//                         </p>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         );
//       },
//     },
//     {
//       header: "Actions",
//       accessor: "actions",
//       render: (row: CollectedPatient) => (
//         <button 
//           onClick={() => handleEditSample(row.visitId, row.sampleNames)}
//           className="flex items-center gap-1 rounded-lg border border-success-900 px-4 py-1 text-label-l2 font-medium text-success-900"
//         >
//           <Edit size={12} strokeWidth={2} />
//           <span>Edit Sample</span>
//         </button>
//       ),
//     },
//   ];

//   if (isFetching) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64">
//         <Loader type="progress" fullScreen={false} text="Loading collected samples..." />
//         <p className="mt-4 text-sm text-gray-500">Fetching the latest collected samples...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full">
//       {/* Header */}
//       <div className="mb-5">
//         <h1 className="text-2xl font-semibold text-pneutral-900">
//           Collected Samples
//         </h1>
//         <p className="mt-1 text-sm text-pneutral-500">
//           Manage and track collected patient samples
//         </p>
//       </div>

//       {/* Filters */}
//       <div className="mt-5 rounded-xl border border-pneutral-200 bg-white p-4">
//         <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//           <div className="relative flex-1 max-w-xl">
//             <Search
//               size={18}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-sneutral-700"
//             />
//             <input
//               type="text"
//               placeholder="Search by ID or Name"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="h-10 w-full rounded-lg border border-pneutral-200 pl-10 pr-4 text-sm outline-none focus:border-pneutral-500"
//             />
//           </div>
//           <div className="flex flex-wrap items-center gap-4">
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-500">Date Range:</span>
//               <select
//                 value={dateFilter}
//                 onChange={(e) => setDateFilter(e.target.value as DateFilterOption)}
//                 className="h-10 rounded-md border border-pneutral-200 px-3 text-sm focus:border-pneutral-500"
//               >
//                 {DATE_FILTER_OPTIONS.map(option => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
            
//             {dateFilter === 'custom' && (
//               <>
//                 <input
//                   type="date"
//                   value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
//                   onChange={(e) => setCustomStartDate(e.target.value ? new Date(e.target.value) : null)}
//                   className="h-10 rounded-md border border-pneutral-200 px-3 text-sm focus:border-pneutral-500"
//                   placeholder="Start Date"
//                 />
//                 <input
//                   type="date"
//                   value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
//                   onChange={(e) => setCustomEndDate(e.target.value ? new Date(e.target.value) : null)}
//                   className="h-10 rounded-md border border-pneutral-200 px-3 text-sm focus:border-pneutral-500"
//                   placeholder="End Date"
//                 />
//               </>
//             )}

//             <div className="flex items-center gap-2">
//               <span className="text-sm text-pneutral-500">Sort by:</span>
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value as SortOption)}
//                 className="h-10 rounded-md border border-pneutral-200 px-3 text-sm focus:border-pneutral-500"
//               >
//                 <option value="patientId">Patient ID</option>
//                 <option value="patientName">Patient Name</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="mt-5 relative">
//         {filteredPatients.length === 0 ? (
//           <div className="flex flex-col items-center justify-center rounded-xl border border-pneutral-200 bg-white py-16">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-16 w-16 text-pneutral-300"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={1}
//                 d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//             <p className="mt-4 text-sm font-medium text-pneutral-500">
//               {searchTerm ? `No results found for "${searchTerm}"` : "No collected samples found"}
//             </p>
//             {searchTerm && (
//               <p className="mt-1 text-xs text-pneutral-400">
//                 Try adjusting your search or filter criteria
//               </p>
//             )}
//           </div>
//         ) : (
//           <NewCommonTable 
//             columns={columns} 
//             data={filteredPatients} 
//             pageSize={10}
//             showPagination={true}
//           />
//         )}
//       </div>

//       {/* Edit Sample Modal */}
//       {showEditModal && selectedVisitId && (
//         <NewModal
//           isOpen={showEditModal}
//           title="Edit Sample"
//           onClose={() => {
//             setShowEditModal(false);
//             setSelectedVisitId(null);
//             setSelectedSampleNames([]);
//           }}
//           modalClassName="max-w-xl"
//         >
//           <UpdateSample
//             visitId={selectedVisitId}
//             sampleNames={selectedSampleNames}
//             onClose={() => {
//               setShowEditModal(false);
//               setSelectedVisitId(null);
//               setSelectedSampleNames([]);
//               setUpdateCollectionTable(prev => !prev);
//               fetchVisits();
//             }}
//           />
//         </NewModal>
//       )}
//     </div>
//   );
// };

// export default CollectedSample;