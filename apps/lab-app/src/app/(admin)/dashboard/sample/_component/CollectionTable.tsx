"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  // Package,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Trash2,
  PlusIcon,
} from "lucide-react";
import NewCommonTable from "../../newcommoncomponent/NewCommonTable";
import { getHealthPackageById } from '@/../services/packageServices';
import { useLabs } from '@/context/LabContext';
import { useAuth } from '@/hooks/useAuth';
import { TestList } from '@/types/test/testlist';
import { DATE_FILTER_OPTIONS, DateFilterOption, formatDateForAPI, getDateRange } from '@/utils/dateUtils';
import { calculateAgeInYears } from '@/utils/ageUtils';
import { toast } from 'react-toastify';
import Loader from '@/app/(admin)/component/common/Loader';
import NewModal from "../../newcommoncomponent/NewModal";
import { deleteVisitSample, getCollectedCompleted } from '../../../../../../services/sampleServices';
import UpdateSample from "./UpdateSample";
import { TestResult } from '@/types/sample/sample';
import PatientReportDataFill from './Report/PatientReportDataFill';
import ViewReport from './Report/ViewReport';

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

interface Patient {
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
  doctorName?: string;
   visitType?: string;
}

type SortOption = 'patientName' | 'patientId';

interface CollectionTableProps {
  closeModal?: () => void;
  onDataUpdate?: (count: number) => void;
  onHideKPI?: () => void;
  onShowKPI?: () => void;
}

const CollectionTable: React.FC<CollectionTableProps> = ({ onDataUpdate, onHideKPI, onShowKPI  }) => {
  const { currentLab } = useLabs();
  const { isAdmin, isSuperAdmin } = useAuth();
  
  // State management
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('patientId');
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [selectedSampleNames, setSelectedSampleNames] = useState<string[]>([]);
  // const [showResultModal, setShowResultModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestList | null>(null);
  const [showViewReportModal, setShowViewReportModal] = useState(false);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [updateCollectionTable, setUpdateCollectionTable] = useState(false);
  const [showPatientReportScreen, setShowPatientReportScreen] = useState(false);
  
  // Expanded row state for dropdown
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate(filteredPatients.length);
    }
  }, [filteredPatients, onDataUpdate]);

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

      const normalizedVisits: Patient[] = collectedVisits.map((visit) => {
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
          visitCode: visit.visitCode,
          testIds: visit.testIds ?? visitTests.map((test) => test.id),
          tests: visitTests,
          packageIds: visit.packageIds,
          dateOfBirth: visit.dateOfBirth,
          testResult: visit.testResult as TestResult[] | undefined,
          doctorName: visit.doctorName ?? '',
    visitType: visit.visitType ?? '',
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

  // Effects
  useEffect(() => {
    fetchVisits();
  }, [currentLab, dateFilter, customStartDate, customEndDate, updateCollectionTable]);

  // Get test items for a patient
  const getPatientTestItems = (patient: Patient) => {
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

  // Handle delete sample
  const handleDeleteSample = async (visitId: number) => {
    if (!window.confirm('Are you sure you want to delete this sample?')) return;
    
    try {
      await deleteVisitSample(visitId, []);
      toast.success('Sample deleted successfully');
      fetchVisits();
    } catch (error) {
      toast.error((error as Error).message || 'Error deleting sample');
    }
  };

  // Handle view report
  const handleViewReport = (patient: Patient) => {
    setViewPatient(patient);
    setShowViewReportModal(true);
  };

  // Handle open result modal
  const handleOpenResultModal = (patient: Patient, testId: number) => {
    // Find the test
    const visitTest = patient.tests?.find((t) => t.id === testId);
    let selected: TestList | null = visitTest
      ? {
          id: visitTest.id,
          name: visitTest.name,
          price: 0,
          category: '',
        }
      : null;
    
    // If not found in individual tests, search in package tests
    if (!selected) {
      for (const packageId of patient.packageIds) {
        const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
        if (packageDetails) {
          const packageTest = packageDetails.tests.find((t) => t.id === testId);
          if (packageTest) {
            selected = {
              id: packageTest.id,
              name: packageTest.name,
              price: packageTest.price,
              category: packageTest.category || ''
            };
            break;
          }
        }
      }
    }

    if (!selected) return;

   setSelectedPatient(patient);
setSelectedTest(selected);
setShowPatientReportScreen(true);
if (onHideKPI) {
      onHideKPI();
    }
  };
   // When closing the result entry screen, show KPI
  const handleCloseResultScreen = () => {
    setShowPatientReportScreen(false);
    setSelectedPatient(null);
    setSelectedTest(null);
    
    // Show KPI when exiting result screen
    if (onShowKPI) {
      onShowKPI();
    }
  };

  // Update the return statement for PatientReportDataFill
  if (
    showPatientReportScreen &&
    selectedPatient &&
    selectedTest
  ) {
    return (
      <PatientReportDataFill
        selectedPatient={selectedPatient}
        selectedTest={selectedTest}
        updateCollectionTable={updateCollectionTable}
        setUpdateCollectionTable={setUpdateCollectionTable}
        setShowModal={handleCloseResultScreen} 
      />
    );
  }

  // Check if user has permission for actions
  const canEdit = isAdmin || isSuperAdmin;
  const canDelete = isAdmin || isSuperAdmin;
  const canView = true; // All users can view

  // Table columns definition
  const columns = [
    {
      header: "Patient ID",
      accessor: "id",
      render: (row: Patient) => (
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
      render: (row: Patient) => (
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
  header: "Status",
  accessor: "status",
  render: (row: Patient) => {
    if (!row.testResult || row.testResult.length === 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-danger-100 px-3 py-1 text-p2 font-medium text-warning-800">
          Pending
        </span>
      );
    }

    const totalTests = row.testResult.length;
    const completedTests = row.testResult.filter(tr => tr.isFilled && tr.reportStatus === 'Completed').length;
    const allTestsCompleted = completedTests === totalTests;
    const someTestsCompleted = completedTests > 0 && completedTests < totalTests;

    if (allTestsCompleted) {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
          Completed
        </span>
      );
    } else if (someTestsCompleted) {
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="inline-flex items-center rounded-full bg-info-50 px-3 py-1 text-p2 font-medium text-info-600">
            {completedTests}/{totalTests} Completed
          </span>
          <button
            onClick={() => handleViewReport(row)}
            className="text-label-l2 text-info-700 hover:text-info-700 font-medium"
          >
            View Report
          </button>
        </div>
      );
    } else {
      return (
        <span className="inline-flex items-center rounded-full bg-danger-100 px-3 py-1 text-p2 font-medium text-warning-800">
          Pending
        </span>
      );
    }
  },
},

{
      header: "Tests/Package",
      accessor: "title",
      render: (row: Patient) => {
        const {  hasPackages } = getPatientTestItems(row);
        
        // Get all test IDs that belong to packages
        const packageTestIds = new Set<number>();
        row.packageIds.forEach(packageId => {
          const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
          if (packageDetails) {
            packageDetails.tests.forEach(test => {
              packageTestIds.add(test.id);
            });
          }
        });

        // Filter out tests that belong to packages from individual tests
        const individualTests = (row.tests || []).filter(test => 
          !packageTestIds.has(test.id)
        );

        const isExpanded = expandedRow === row.visitId.toString();
        const displayTests = isExpanded ? individualTests : individualTests.slice(0, 3);
        const hasMoreTests = individualTests.length > 3;

        // If there are only individual tests (no packages)
        if (!hasPackages) {
          return (
            <div className="flex flex-col gap-1 min-w-[250px] max-w-[350px]">
              {displayTests.map((test) => {
                const testResult = row.testResult?.find(tr => tr.testId === test.id);
                
                // Determine test status color
                let statusColor = 'bg-warning-50 text-warning-600';
                
                if (testResult) {
                  if (testResult.isFilled && testResult.reportStatus === 'Completed') {
                    statusColor = 'bg-success-50 text-success-900';
                  } else if (testResult.isFilled) {
                    statusColor = 'bg-warning-50 text-warning-600';
                  }
                }
                
                return (
                  <div key={test.id} className="flex items-center gap-1 py-1">
                    <span className={`${statusColor} px-2 py-1 rounded-full text-p2 inline-block w-fit`}>
                      {test.name}
                    </span>
                    {/* Only show result button if test is not completed */}
                    {(!testResult || !testResult.isFilled || testResult.reportStatus !== 'Completed') && (
                      <button
                        onClick={() => handleOpenResultModal(row, test.id)}
                        className="flex items-center gap-1 bg-warning-500 text-pneutral-50 px-3 py-1 rounded-full text-xs transition-colors whitespace-nowrap"
                      >
                        <PlusIcon className="w-3 h-3 text-pneutral-50" strokeWidth={3} />
                        <span className='text-pneutral-50 text-label-l2'>Result</span>
                      </button>
                    )}
                  </div>
                );
              }).filter(Boolean)}
              
              {hasMoreTests && (
                <button
                  onClick={() => setExpandedRow(isExpanded ? null : row.visitId.toString())}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
                >
                  {isExpanded ? 'Show Less' : `View All (${individualTests.length})`}
                </button>
              )}
            </div>
          );
        }

        // If there are packages
        return (
          <div className="flex flex-col gap-2 min-w-[250px] max-w-[350px]">
            {row.packageIds.map((packageId) => {
              const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
              if (!packageDetails) return null;

              const isPackageExpanded = expandedRow === `package-${row.visitId}-${packageId}`;

              return (
                <div key={packageDetails.id} className="flex flex-col gap-1">
                  {/* Package name with dropdown toggle */}
                  <button
                    onClick={() => setExpandedRow(isPackageExpanded ? null : `package-${row.visitId}-${packageId}`)}
                    className="flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs">📦</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        {packageDetails.packageName}
                      </span>
                    </div>
                    {isPackageExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  
                  {/* Package tests - shown when expanded */}
                  {isPackageExpanded && (
                    <div className="flex flex-col gap-1 ml-2">
                      {packageDetails.tests.map((test, index) => {
                        const testResult = row.testResult?.find(tr => tr.testId === test.id);
                        
                        // Determine test status color
                        let statusColor = 'bg-warning-50 text-warning-600';
                        
                        if (testResult) {
                          if (testResult.isFilled && testResult.reportStatus === 'Completed') {
                            statusColor = 'bg-success-50 text-success-900';
                          } else if (testResult.isFilled) {
                            statusColor = 'bg-warning-50 text-warning-600';
                          }
                        }
                        
                        return (
                          <div key={`${packageDetails.id}-${index}`} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-b-0">
                            <span className={`${statusColor} px-2 py-0.5 rounded-full text-xs inline-block w-fit`}>
                              {test.name}
                            </span>
                            {/* Only show result button if test is not completed */}
                            {(!testResult || !testResult.isFilled || testResult.reportStatus !== 'Completed') && (
                              <button
                                onClick={() => handleOpenResultModal(row, test.id)}
                                className="flex items-center gap-1 bg-purple-500 text-white px-1.5 py-0.5 rounded text-xs hover:bg-purple-600 transition-colors whitespace-nowrap"
                              >
                                <PlusIcon className="w-2.5 h-2.5 text-white" />
                                <span className='text-white text-xs'>Result</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }).filter(Boolean)}
          </div>
        );
      },
    },




//     {
//   header: "Tests/Package",
//   accessor: "title",
//   render: (row: Patient) => {
//     const { tests, hasPackages, totalTestCount, packageNames } = getPatientTestItems(row);
    
//     // Get all test IDs that belong to packages
//     const packageTestIds = new Set<number>();
//     row.packageIds.forEach(packageId => {
//       const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//       if (packageDetails) {
//         packageDetails.tests.forEach(test => {
//           packageTestIds.add(test.id);
//         });
//       }
//     });

//     // Filter out tests that belong to packages from individual tests
//     const individualTests = (row.tests || []).filter(test => 
//       !packageTestIds.has(test.id)
//     );

//     const isExpanded = expandedRow === row.visitId.toString();
//     const displayTests = isExpanded ? individualTests : individualTests.slice(0, 3);
//     const hasMoreTests = individualTests.length > 3;

//     // If there are only individual tests (no packages)
//     if (!hasPackages) {
//       return (
//         <div className="flex flex-col gap-1 min-w-[250px] max-w-[350px]">
//           {displayTests.map((test) => {
//             const testResult = row.testResult?.find(tr => tr.testId === test.id);
            
//             // Determine test status color
//             let statusColor = 'bg-warning-50 text-warning-600';
            
//             if (testResult) {
//               if (testResult.isFilled && testResult.reportStatus === 'Completed') {
//                 statusColor = 'bg-success-50 text-success-900';
//               } else if (testResult.isFilled) {
//                 statusColor = 'bg-warning-50 text-warning-600';
//               }
//             }
            
//             return (
//               <div key={test.id} className="flex items-center gap-1 py-1">
//                 <span className={`${statusColor} px-2 py-1 rounded-full text-p2 inline-block w-fit`}>
//                   {test.name}
//                 </span>
//                 {/* Only show result button if test is not completed */}
//                 {(!testResult || !testResult.isFilled || testResult.reportStatus !== 'Completed') && (
//                   <button
//                     onClick={() => handleOpenResultModal(row, test.id)}
//                     className="flex items-center gap-1 bg-warning-500 text-pneutral-50 px-3 py-1 rounded-full text-xs transition-colors whitespace-nowrap"
//                   >
//                     <PlusIcon className="w-3 h-3 text-pneutral-50" strokeWidth={3} />
//                     <span className='text-pneutral-50 text-label-l2'>Result</span>
//                   </button>
//                 )}
//               </div>
//             );
//           }).filter(Boolean)}
          
//           {hasMoreTests && (
//             <button
//               onClick={() => setExpandedRow(isExpanded ? null : row.visitId.toString())}
//               className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
//             >
//               {isExpanded ? 'Show Less' : `View All (${individualTests.length})`}
//             </button>
//           )}
//         </div>
//       );
//     }

//     // If there are packages
//     return (
//       <div className="flex flex-col gap-2 min-w-[250px] max-w-[350px]">
//         {row.packageIds.map((packageId) => {
//           const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//           if (!packageDetails) return null;

//           const isPackageExpanded = expandedRow === `package-${row.visitId}-${packageId}`;

//           return (
//             <div key={packageDetails.id} className="flex flex-col gap-1">
//               {/* Package name with dropdown toggle */}
//               <button
//                 onClick={() => setExpandedRow(isPackageExpanded ? null : `package-${row.visitId}-${packageId}`)}
//                 className="flex items-center justify-between w-full"
//               >
//                 <div className="flex items-center gap-1">
//                   <span className="text-xs">📦</span>
//                   <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
//                     {packageDetails.packageName}
//                   </span>
//                 </div>
//                 {isPackageExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//               </button>
              
//               {/* Package tests - shown when expanded */}
//               {isPackageExpanded && (
//                 <div className="flex flex-col gap-1 ml-2">
//                   {packageDetails.tests.map((test, index) => {
//                     const testResult = row.testResult?.find(tr => tr.testId === test.id);
                    
//                     // Determine test status color
//                     let statusColor = 'bg-warning-50 text-warning-600';
                    
//                     if (testResult) {
//                       if (testResult.isFilled && testResult.reportStatus === 'Completed') {
//                         statusColor = 'bg-success-50 text-success-900';
//                       } else if (testResult.isFilled) {
//                         statusColor = 'bg-warning-50 text-warning-600';
//                       }
//                     }
                    
//                     return (
//                       <div key={`${packageDetails.id}-${index}`} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-b-0">
//                         <span className={`${statusColor} px-2 py-0.5 rounded-full text-xs inline-block w-fit`}>
//                           {test.name}
//                         </span>
//                         {/* Only show result button if test is not completed */}
//                         {(!testResult || !testResult.isFilled || testResult.reportStatus !== 'Completed') && (
//                           <button
//                             onClick={() => handleOpenResultModal(row, test.id)}
//                             className="flex items-center gap-1 bg-purple-500 text-white px-1.5 py-0.5 rounded text-xs hover:bg-purple-600 transition-colors whitespace-nowrap"
//                           >
//                             <PlusIcon className="w-2.5 h-2.5 text-white" />
//                             <span className='text-white text-xs'>Result</span>
//                           </button>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         }).filter(Boolean)}
//       </div>
//     );
//   },
// },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: Patient) => (
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => handleEditSample(row.visitId, row.sampleNames)}
              className="p-1.5 text-blue-600 hover:text-blue-800 transition-colors rounded hover:bg-blue-50"
              title="Edit Sample"
            >
              <Edit size={16} />
            </button>
          )}
          {canView && (
            <button
              onClick={() => handleViewReport(row)}
              className="p-1.5 text-info-700 hover:text-info-700 transition-colors rounded hover:bg-info-50"
              title="View Report"
            >
              <Eye size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDeleteSample(row.visitId)}
              className="p-1.5 text-red-500 hover:text-red-700 transition-colors rounded hover:bg-red-50"
              title="Delete Sample"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
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

  if (
    showPatientReportScreen &&
    selectedPatient &&
    selectedTest
  ) {
    return (
      <PatientReportDataFill
        selectedPatient={selectedPatient}
        selectedTest={selectedTest}
        updateCollectionTable={updateCollectionTable}
        setUpdateCollectionTable={setUpdateCollectionTable}
        setShowModal={setShowPatientReportScreen}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-pneutral-900">
          Partially Completed Test
        </h1>
        <p className="mt-1 text-sm text-pneutral-500">
          Manage and track Partially Completed Test Results
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

      {/* Result Entry Modal */}
      {/* {showResultModal && selectedPatient && selectedTest && (
        <NewModal
          isOpen={showResultModal}
          title={`Enter Result Data - ${selectedTest.name}`}
          onClose={() => {
            setShowResultModal(false);
            setSelectedPatient(null);
            setSelectedTest(null);
          }}
          modalClassName="max-w-5xl"
        >
          <PatientReportDataFill
            selectedPatient={selectedPatient}
            selectedTest={selectedTest}
            updateCollectionTable={updateCollectionTable}
            setUpdateCollectionTable={setUpdateCollectionTable}
            setShowModal={setShowResultModal}
          />
        </NewModal>
      )} */}

      {/* View Report Modal */}
      {showViewReportModal && viewPatient && (
        <NewModal
          isOpen={showViewReportModal}
          title="View Report"
          onClose={() => {
            setShowViewReportModal(false);
            setViewPatient(null);
          }}
          modalClassName="max-w-4xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
        >
          <ViewReport 
            viewPatient={{
              ...viewPatient,
              gender: viewPatient.gender ?? '',
              contactNumber: viewPatient.contactNumber ?? '',
              email: viewPatient.email ?? '',
              doctorName: viewPatient.doctorName ?? '',
              visitType: viewPatient.visitType ?? '',
              visitStatus: viewPatient.visitStatus ?? ''
            }}
            hidePrintButton={false}
          />
        </NewModal>
      )}
    </div>
  );
};

export default CollectionTable;













// new working UI.................................

// "use client";

// import React, { useEffect, useState, useMemo } from "react";
// import {
//   Search,
//   Package,
//   ChevronDown,
//   ChevronUp,
//   Edit,
//   Eye,
//   Trash2,
//   PlusIcon,
// } from "lucide-react";
// import NewCommonTable from "../../newcommoncomponent/NewCommonTable";
// import { getHealthPackageById } from '@/../services/packageServices';
// import { useLabs } from '@/context/LabContext';
// import { useAuth } from '@/hooks/useAuth';
// import { TestList } from '@/types/test/testlist';
// import { DATE_FILTER_OPTIONS, DateFilterOption, formatDateForAPI, getDateRange } from '@/utils/dateUtils';
// import { calculateAgeInYears } from '@/utils/ageUtils';
// import { toast } from 'react-toastify';
// import Loader from '@/app/(admin)/component/common/Loader';
// import NewModal from "../../newcommoncomponent/NewModal";
// import { deleteVisitSample, getCollectedCompleted } from '../../../../../../services/sampleServices';
// import UpdateSample from "./UpdateSample";
// import { TestResult } from '@/types/sample/sample';
// import PatientReportDataFill from './Report/PatientReportDataFill';
// import ViewReport from './Report/ViewReport';

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

// interface Patient {
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

// interface CollectionTableProps {
//   closeModal?: () => void;
// }

// const CollectionTable: React.FC<CollectionTableProps> = ({ closeModal }) => {
//   const { currentLab } = useLabs();
//   const { isAdmin, isSuperAdmin } = useAuth();
  
//   // State management
//   const [patientList, setPatientList] = useState<Patient[]>([]);
//   const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
//   const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
//   const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
//   const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
//   const [isFetching, setIsFetching] = useState(false);
//   const [sortBy, setSortBy] = useState<SortOption>('patientId');
  
//   // Modal states
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
//   const [selectedSampleNames, setSelectedSampleNames] = useState<string[]>([]);
//   const [showResultModal, setShowResultModal] = useState(false);
//   const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
//   const [selectedTest, setSelectedTest] = useState<TestList | null>(null);
//   const [showViewReportModal, setShowViewReportModal] = useState(false);
//   const [viewPatient, setViewPatient] = useState<Patient | null>(null);
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

//       const normalizedVisits: Patient[] = collectedVisits.map((visit) => {
//         const visitTests = visit.tests ?? [];
//         return {
//           visitId: visit.visitId,
//           patientname: visit.patientname,
//           gender: visit.gender ?? '',
//           contactNumber: visit.contactNumber ?? '',
//           email: visit.email ?? '',
//           visitDate: visit.visitDate,
//           visitStatus: visit.visitStatus,
//           sampleNames: visit.sampleNames,
//           visitCode: visit.visitCode,
//           testIds: visit.testIds ?? visitTests.map((test) => test.id),
//           tests: visitTests,
//           packageIds: visit.packageIds,
//           dateOfBirth: visit.dateOfBirth,
//           testResult: visit.testResult as TestResult[] | undefined,
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

//   // Effects
//   useEffect(() => {
//     fetchVisits();
//   }, [currentLab, dateFilter, customStartDate, customEndDate, updateCollectionTable]);

//   // Get test items for a patient
//   const getPatientTestItems = (patient: Patient) => {
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

//   // Handle delete sample
//   const handleDeleteSample = async (visitId: number) => {
//     if (!window.confirm('Are you sure you want to delete this sample?')) return;
    
//     try {
//       await deleteVisitSample(visitId, []);
//       toast.success('Sample deleted successfully');
//       fetchVisits();
//     } catch (error) {
//       toast.error((error as Error).message || 'Error deleting sample');
//     }
//   };

//   // Handle view report
//   const handleViewReport = (patient: Patient) => {
//     setViewPatient(patient);
//     setShowViewReportModal(true);
//   };

//   // Handle open result modal
//   const handleOpenResultModal = (patient: Patient, testId: number) => {
//     // Find the test
//     const visitTest = patient.tests?.find((t) => t.id === testId);
//     let selected: TestList | null = visitTest
//       ? {
//           id: visitTest.id,
//           name: visitTest.name,
//           price: 0,
//           category: '',
//         }
//       : null;
    
//     // If not found in individual tests, search in package tests
//     if (!selected) {
//       for (const packageId of patient.packageIds) {
//         const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//         if (packageDetails) {
//           const packageTest = packageDetails.tests.find((t) => t.id === testId);
//           if (packageTest) {
//             selected = {
//               id: packageTest.id,
//               name: packageTest.name,
//               price: packageTest.price,
//               category: packageTest.category || ''
//             };
//             break;
//           }
//         }
//       }
//     }

//     if (!selected) return;

//     setSelectedPatient(patient);
//     setSelectedTest(selected);
//     setShowResultModal(true);
//   };

//   // Check if user has permission for actions
//   const canEdit = isAdmin || isSuperAdmin;
//   const canDelete = isAdmin || isSuperAdmin;
//   const canView = true; // All users can view

//   // Table columns definition
//   const columns = [
//     {
//       header: "Patient ID",
//       accessor: "id",
//       render: (row: Patient) => (
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
//       render: (row: Patient) => (
//         <div>
//           <p className="font-semibold text-p3 text-pneutral-900">
//             {row.patientname}
//           </p>
//           <p className="text-p2 leading-[16px] font-normal text-pneutral-500">
//             {row.dateOfBirth ? calculateAgeInYears(row.dateOfBirth) : 'N/A'} | {row.gender}
//           </p>
//         </div>
//       ),
//     },


//     {
//   header: "Status",
//   accessor: "status",
//   render: (row: Patient) => {
//     if (!row.testResult || row.testResult.length === 0) {
//       return (
//         <span className="inline-flex items-center rounded-full bg-danger-100 px-3 py-1 text-p2 font-medium text-warning-800">
//           Pending
//         </span>
//       );
//     }

//     const totalTests = row.testResult.length;
//     const completedTests = row.testResult.filter(tr => tr.isFilled && tr.reportStatus === 'Completed').length;
//     const allTestsCompleted = completedTests === totalTests;
//     const someTestsCompleted = completedTests > 0 && completedTests < totalTests;

//     if (allTestsCompleted) {
//       return (
//         <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
//           Completed
//         </span>
//       );
//     } else if (someTestsCompleted) {
//       return (
//         <div className="flex flex-col items-start gap-1">
//           <span className="inline-flex items-center rounded-full bg-info-50 px-3 py-1 text-p2 font-medium text-info-600">
//             {completedTests}/{totalTests} Completed
//           </span>
//           <button
//             onClick={() => handleViewReport(row)}
//             className="text-label-l2 text-info-700 hover:text-info-700 font-medium"
//           >
//             View Report
//           </button>
//         </div>
//       );
//     } else {
//       return (
//         <span className="inline-flex items-center rounded-full bg-danger-100 px-3 py-1 text-p2 font-medium text-warning-800">
//           Pending
//         </span>
//       );
//     }
//   },
// },
//     // {
//     //   header: "Status",
//     //   accessor: "status",
//     //   render: (row: Patient) => {
//     //     if (!row.testResult || row.testResult.length === 0) {
//     //       return (
//     //         <div className="flex flex-col gap-1">
//     //           <span className="inline-flex items-center rounded-full bg-danger-100 px-3 py-1 text-p2 font-medium text-warning-800">
//     //             Pending
//     //           </span>
//     //         </div>
//     //       );
//     //     }

//     //     const totalTests = row.testResult.length;
//     //     const completedTests = row.testResult.filter(tr => tr.isFilled && tr.reportStatus === 'Completed').length;
//     //     const allTestsCompleted = completedTests === totalTests;
//     //     const someTestsCompleted = completedTests > 0 && completedTests < totalTests;

//     //     if (allTestsCompleted) {
//     //       return (
//     //         <div className="flex flex-col gap-1">
//     //           <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
//     //             Completed
//     //           </span>
//     //         </div>
//     //       );
//     //     } else if (someTestsCompleted) {
//     //       return (
//     //         <div className="flex flex-col gap-1">
//     //           <span className="inline-flex items-center rounded-full bg-info-50 px-3 py-1 text-p2 font-medium text-info-600">
//     //             {completedTests}/{totalTests} Completed
//     //           </span>
//     //           {/* View Report button for partially completed */}
//     //           <button
//     //             onClick={() => handleViewReport(row)}
//     //             className="text-label-l2 text-info-700 hover:text-info-700 font-medium w-fit"
//     //           >
//     //             View Report
//     //           </button>
//     //         </div>
//     //       );
//     //     } else {
//     //       return (
//     //         <div className="flex flex-col gap-1">
//     //           <span className="inline-flex items-center rounded-full bg-danger-100 px-3 py-1 text-p2 font-medium text-warning-800">
//     //             Pending
//     //           </span>
//     //         </div>
//     //       );
//     //     }
//     //   },
//     // },
//     {
//   header: "Tests/Package",
//   accessor: "title",
//   render: (row: Patient) => {
//     const { tests, hasPackages, totalTestCount, packageNames } = getPatientTestItems(row);
    
//     // Get all test IDs that belong to packages
//     const packageTestIds = new Set<number>();
//     row.packageIds.forEach(packageId => {
//       const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//       if (packageDetails) {
//         packageDetails.tests.forEach(test => {
//           packageTestIds.add(test.id);
//         });
//       }
//     });

//     // Filter out tests that belong to packages from individual tests
//     const individualTests = (row.tests || []).filter(test => 
//       !packageTestIds.has(test.id)
//     );

//     const isExpanded = expandedRow === row.visitId.toString();
//     const displayTests = isExpanded ? individualTests : individualTests.slice(0, 3);
//     const hasMoreTests = individualTests.length > 3;

//     // If there are only individual tests (no packages)
//     if (!hasPackages) {
//       return (
//         <div className="flex flex-col gap-1 min-w-[250px] max-w-[350px]">
//           {displayTests.map((test) => {
//             const testResult = row.testResult?.find(tr => tr.testId === test.id);
            
//             // Determine test status color
//             let statusColor = 'bg-warning-50 text-warning-600';
            
//             if (testResult) {
//               if (testResult.isFilled && testResult.reportStatus === 'Completed') {
//                 statusColor = 'bg-success-50 text-success-900';
//               } else if (testResult.isFilled) {
//                 statusColor = 'bg-warning-50 text-warning-600';
//               }
//             }
            
//             return (
//               <div key={test.id} className="flex items-center gap-1 py-1">
//                 <span className={`${statusColor} px-2 py-1 rounded-full text-p2 inline-block w-fit`}>
//                   {test.name}
//                 </span>
//                 {/* Only show result button if test is not completed */}
//                 {(!testResult || !testResult.isFilled || testResult.reportStatus !== 'Completed') && (
//                   <button
//                     onClick={() => handleOpenResultModal(row, test.id)}
//                     className="flex items-center gap-1 bg-warning-500 text-pneutral-50 px-3 py-1 rounded-full text-xs transition-colors whitespace-nowrap"
//                   >
//                     <PlusIcon className="w-3 h-3 text-pneutral-50" strokeWidth={3} />
//                     <span className='text-pneutral-50 text-label-l2'>Result</span>
//                   </button>
//                 )}
//               </div>
//             );
//           }).filter(Boolean)}
          
//           {hasMoreTests && (
//             <button
//               onClick={() => setExpandedRow(isExpanded ? null : row.visitId.toString())}
//               className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
//             >
//               {isExpanded ? 'Show Less' : `View All (${individualTests.length})`}
//             </button>
//           )}
//         </div>
//       );
//     }

//     // If there are packages
//     return (
//       <div className="flex flex-col gap-2 min-w-[250px] max-w-[350px]">
//         {row.packageIds.map((packageId) => {
//           const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//           if (!packageDetails) return null;

//           const isPackageExpanded = expandedRow === `package-${row.visitId}-${packageId}`;

//           return (
//             <div key={packageDetails.id} className="flex flex-col gap-1">
//               {/* Package name with dropdown toggle */}
//               <button
//                 onClick={() => setExpandedRow(isPackageExpanded ? null : `package-${row.visitId}-${packageId}`)}
//                 className="flex items-center justify-between w-full"
//               >
//                 <div className="flex items-center gap-1">
//                   <span className="text-xs">📦</span>
//                   <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
//                     {packageDetails.packageName}
//                   </span>
//                 </div>
//                 {isPackageExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//               </button>
              
//               {/* Package tests - shown when expanded */}
//               {isPackageExpanded && (
//                 <div className="flex flex-col gap-1 ml-2">
//                   {packageDetails.tests.map((test, index) => {
//                     const testResult = row.testResult?.find(tr => tr.testId === test.id);
                    
//                     // Determine test status color
//                     let statusColor = 'bg-warning-50 text-warning-600';
                    
//                     if (testResult) {
//                       if (testResult.isFilled && testResult.reportStatus === 'Completed') {
//                         statusColor = 'bg-success-50 text-success-900';
//                       } else if (testResult.isFilled) {
//                         statusColor = 'bg-warning-50 text-warning-600';
//                       }
//                     }
                    
//                     return (
//                       <div key={`${packageDetails.id}-${index}`} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-b-0">
//                         <span className={`${statusColor} px-2 py-0.5 rounded-full text-xs inline-block w-fit`}>
//                           {test.name}
//                         </span>
//                         {/* Only show result button if test is not completed */}
//                         {(!testResult || !testResult.isFilled || testResult.reportStatus !== 'Completed') && (
//                           <button
//                             onClick={() => handleOpenResultModal(row, test.id)}
//                             className="flex items-center gap-1 bg-purple-500 text-white px-1.5 py-0.5 rounded text-xs hover:bg-purple-600 transition-colors whitespace-nowrap"
//                           >
//                             <PlusIcon className="w-2.5 h-2.5 text-white" />
//                             <span className='text-white text-xs'>Result</span>
//                           </button>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         }).filter(Boolean)}
//       </div>
//     );
//   },
// },
//     {
//       header: "Actions",
//       accessor: "actions",
//       render: (row: Patient) => (
//         <div className="flex items-center gap-2">
//           {canEdit && (
//             <button
//               onClick={() => handleEditSample(row.visitId, row.sampleNames)}
//               className="p-1.5 text-blue-600 hover:text-blue-800 transition-colors rounded hover:bg-blue-50"
//               title="Edit Sample"
//             >
//               <Edit size={16} />
//             </button>
//           )}
//           {canView && (
//             <button
//               onClick={() => handleViewReport(row)}
//               className="p-1.5 text-info-700 hover:text-info-700 transition-colors rounded hover:bg-info-50"
//               title="View Report"
//             >
//               <Eye size={16} />
//             </button>
//           )}
//           {canDelete && (
//             <button
//               onClick={() => handleDeleteSample(row.visitId)}
//               className="p-1.5 text-red-500 hover:text-red-700 transition-colors rounded hover:bg-red-50"
//               title="Delete Sample"
//             >
//               <Trash2 size={16} />
//             </button>
//           )}
//         </div>
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
//           Partially Completed Test
//         </h1>
//         <p className="mt-1 text-sm text-pneutral-500">
//           Manage and track Partially Completed Test Results
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

//       {/* Result Entry Modal */}
//       {showResultModal && selectedPatient && selectedTest && (
//         <NewModal
//           isOpen={showResultModal}
//           title={`Enter Result Data - ${selectedTest.name}`}
//           onClose={() => {
//             setShowResultModal(false);
//             setSelectedPatient(null);
//             setSelectedTest(null);
//           }}
//           modalClassName="max-w-5xl"
//         >
//           <PatientReportDataFill
//             selectedPatient={selectedPatient}
//             selectedTest={selectedTest}
//             updateCollectionTable={updateCollectionTable}
//             setUpdateCollectionTable={setUpdateCollectionTable}
//             setShowModal={setShowResultModal}
//           />
//         </NewModal>
//       )}

//       {/* View Report Modal */}
//       {showViewReportModal && viewPatient && (
//         <NewModal
//           isOpen={showViewReportModal}
//           title="View Report"
//           onClose={() => {
//             setShowViewReportModal(false);
//             setViewPatient(null);
//           }}
//           modalClassName="max-w-4xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
//         >
//           <ViewReport 
//             viewPatient={{
//               ...viewPatient,
//               gender: viewPatient.gender ?? '',
//               contactNumber: viewPatient.contactNumber ?? '',
//               email: viewPatient.email ?? '',
//               doctorName: viewPatient.doctorName ?? '',
//               visitType: viewPatient.visitType ?? '',
//               visitStatus: viewPatient.visitStatus ?? ''
//             }}
//             hidePrintButton={false}
//           />
//         </NewModal>
//       )}
//     </div>
//   );
// };

// export default CollectionTable;

















// import { getHealthPackageById } from '@/../services/packageServices';
// import Loader from '@/app/(admin)/component/common/Loader';
// import Modal from '@/app/(admin)/component/common/Model';
// import Pagination from '@/app/(admin)/component/common/Pagination';
// import TableComponent from '@/app/(admin)/component/common/TableComponent';
// import { useLabs } from '@/context/LabContext';
// import { TestList } from '@/types/test/testlist';
// import { calculateAge } from '@/utils/ageUtils';
// import { DATE_FILTER_OPTIONS, DateFilterOption, formatDateForAPI, formatDisplayDate, getDateRange } from '@/utils/dateUtils';
// import html2canvas from 'html2canvas';
// import { CalendarDays, Edit, PlusIcon, Download } from 'lucide-react';
// import React, { useEffect, useState } from 'react';
// import { FaTimes, FaVial } from 'react-icons/fa';
// import { createRoot } from 'react-dom/client';
// import Barcode from 'react-barcode';
// import { MdCancelPresentation } from 'react-icons/md';
// import { toast } from 'react-toastify';
// import { deleteVisitSample, getCollectedCompleted } from '../../../../../../services/sampleServices';
// import PatientReportDataFill from './Report/PatientReportDataFill';
// import UpdateSample from './UpdateSample';

// export interface Patient {
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
//   testResult?: TestResult[]; // Add testResult array
// }

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

// interface UpdateSample {
//   visitId: number;
//   sampleNames: string[];
// }

// // Test result interface for individual test results
// interface TestResult {
//   id: number;
//   testId: number;
//   isFilled: boolean;
//   reportStatus: string;
//   createdBy: string;
//   updatedBy: string;
//   createdAt: string;
//   updatedAt: string;
// }


// interface CollectionTableProps {
//   closeModal?: () => void;
// }

// const CollectionTable: React.FC<CollectionTableProps> = ({ closeModal }) => {
//   const { currentLab } = useLabs();
//   const [patientList, setPatientList] = useState<Patient[]>([]);
//   const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 8;
//   const [updatedPopUp, setUpdatedPopUp] = useState(false);
//   const [updateSample, setUpdateSample] = useState<UpdateSample | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
//   const [selectedTest, setSelectedTest] = useState<TestList | null>(null);
//   const [updateCollectionTable, setUpdateCollectionTable] = useState(false);
//   const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
//   const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
//   const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
//   const [isFetching, setIsFetching] = useState(false);
  
//   // State for expanded rows
//   const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());




//   const fetchVisits = async () => {
//     try {
//       if (!currentLab?.id) return;

//       setIsFetching(true);
//       const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);

//       if (!startDate || !endDate) return;

//       const response = await getCollectedCompleted(
//         currentLab.id,
//         formatDateForAPI(startDate),
//         formatDateForAPI(endDate),
//       );

//              const collectedVisits = response
//          .filter(visit => {
//            // Filter out visits where all tests are completed
//            if (!visit.testResult || visit.testResult.length === 0) {
//              return true; // Keep visits without test results
//            }
           
//            // Check if all tests have reportStatus "Completed"
//            const allTestsCompleted = visit.testResult.every(tr => tr.reportStatus === 'Completed');
//            return !allTestsCompleted; // Only show visits where not all tests are completed
//          })
//          .sort((a, b) => {
//            // Sort by visit ID (highest first) to show most recently added samples at top
//            // This ensures newly added samples appear first regardless of visit date
//            return b.visitId - a.visitId;
//          });

//       setPatientList(
//         collectedVisits.map((visit) => {
//           const visitTests = visit.tests ?? [];
//           return {
//             visitId: visit.visitId,
//             visitCode: visit.visitCode,
//             patientname: visit.patientname,
//             gender: visit.gender ?? '',
//             contactNumber: visit.contactNumber ?? '',
//             email: visit.email ?? '',
//             visitDate: visit.visitDate,
//             visitStatus: visit.visitStatus,
//             sampleNames: visit.sampleNames,
//             testIds: visit.testIds ?? visitTests.map((test) => test.id),
//             tests: visitTests,
//             packageIds: visit.packageIds,
//             dateOfBirth: visit.dateOfBirth ?? undefined,
//             testResult: visit.testResult ?? undefined, // Add testResult to the patient object
//           };
//         })
//       );

//       const uniquePackageIds = Array.from(new Set(collectedVisits.flatMap((visit) => visit.packageIds)));
//       const fetchedPackages = await Promise.all(
//         uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId))
//       );
//       setHealthPackages(fetchedPackages.map((pkg) => pkg.data));
//     } catch (error) {
//       toast.error((error as Error).message || 'Error fetching visits', { autoClose: 2000 });
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   useEffect(() => {
//     fetchVisits();
//   }, [currentLab, updatedPopUp, updateCollectionTable, dateFilter, customStartDate, customEndDate]);



//   const handleDateFilterChange = (filter: DateFilterOption) => {
//     setDateFilter(filter);
//   };

//   const totalPages = Math.ceil(patientList.length / itemsPerPage);
//   const paginatedPatients = patientList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   const deleteSample = async (visitId: number, sampleNames: string[]) => {
//     try {
//       await deleteVisitSample(visitId, sampleNames);
//       toast.success('Sample deleted successfully');
//       fetchVisits();
//     } catch (error) {
//       toast.error((error as Error).message || 'Error deleting sample');
//     }
//   };

//   const handleUpdate = (visitId: number, sampleNames: string[]) => {
//     setUpdatedPopUp(true);
//     setUpdateSample({ visitId, sampleNames });
//   };

//   const handleDownloadBarcode = async (row: Patient) => {
//     const age = row.dateOfBirth ? calculateAge(row.dateOfBirth) : 'N/A';
//     const barcodeValue = 
//       "Patient ID: " + row.visitId +
//       " Name: " + row.patientname +
//       " Age: " + age +
//       " Gender: " + (row.gender || '');

//     // Create a temporary container for the barcode
//     const tempContainer = document.createElement('div');
//     tempContainer.style.position = 'absolute';
//     tempContainer.style.left = '-9999px';
//     tempContainer.style.top = '0';
//     document.body.appendChild(tempContainer);

//     // Create a temporary div to render the barcode
//     const barcodeDiv = document.createElement('div');
//     tempContainer.appendChild(barcodeDiv);

//     // Render the barcode using React
//     const root = createRoot(barcodeDiv);
//     root.render(
//       React.createElement(Barcode, {
//         value: barcodeValue,
//         format: "CODE128",
//         width: 0.5,
//         height: 40,
//         displayValue: true,
//         fontSize: 10
//       })
//     );

//     // Wait for the barcode to render
//     await new Promise(resolve => setTimeout(resolve, 100));

//     // Capture the barcode as canvas
//     const canvas = await html2canvas(barcodeDiv);
//     const link = document.createElement('a');
//     link.href = canvas.toDataURL('image/png');
//     link.download = `barcode-${row.visitId}.png`;
//     link.click();

//     // Clean up
//     root.unmount();
//     document.body.removeChild(tempContainer);
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

//   const handleOpenReportModal = (patient: Patient, testId: number) => {
//     if (!patient || !testId) return;

//     // First try to find the test in individual tests
//     const visitTest = patient.tests?.find((t) => t.id === testId);
//     let selected: TestList | null = visitTest
//       ? {
//           id: visitTest.id,
//           name: visitTest.name,
//           price: 0,
//           category: '',
//         }
//       : null;
    
//     // If not found in individual tests, search in package tests
//     if (!selected) {
//       for (const packageId of patient.packageIds) {
//         const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//         if (packageDetails) {
//           const packageTest = packageDetails.tests.find((t) => t.id === testId);
//           if (packageTest) {
//             // Create a test object that matches the TestList interface
//             selected = {
//               id: packageTest.id,
//               name: packageTest.name,
//               price: packageTest.price,
//               category: packageTest.category || ''
//             };
//             break;
//           }
//         }
//       }
//     }

//     if (!selected) return;

//     setSelectedPatient(patient);
//     setSelectedTest(selected);
//     setShowModal(true);
//   };





//   const columns = [
//     {
//       header: 'ID',
//       accessor: (row: Patient) => row.visitCode || row.visitId,
//       cell: (value: number | string) => <span className="font-semibold text-primary">#{value}</span>
//     },
//     {
//       header: 'Patient',
//       accessor: (row: Patient) => (
//         <div className="flex flex-col gap-1">
//           <span className="font-medium text-gray-900">{row.patientname}</span>
//           <div className="flex items-center gap-1 text-gray-500 bg-blue-50 px-2 py-1 rounded-full w-fit">
//             <CalendarDays className="w-3 h-3 opacity-70" />
//             <span className="text-xs font-medium">{formatDisplayDate(row.visitDate)}</span>
//           </div>
//         </div>
//       )
//     },
//           {
//         header: 'Status',
//         accessor: (row: Patient) => {
//           // Check if we have test results
//           if (!row.testResult || row.testResult.length === 0) {
//             return (
//               <div className="flex flex-col items-center gap-1">
//                 <span className={'bg-yellow-100 text-yellow-800 rounded-full text-sm truncate'}>
//                   <span className="px-2 py-1 rounded-full text-xs font-semibold">Pending</span>
//                 </span>
//                 <div className="w-16 bg-gray-200 rounded-full h-1">
//                   <div className="bg-yellow-500 h-1 rounded-full" style={{ width: '0%' }}></div>
//                 </div>
//               </div>
//             );
//           }

//           // Calculate completion percentage
//           const totalTests = row.testResult.length;
//           const completedTests = row.testResult.filter(tr => tr.isFilled && tr.reportStatus === 'Completed').length;
//           const completionPercentage = (completedTests / totalTests) * 100;

//           // Check if all tests are completed
//           const allTestsCompleted = completedTests === totalTests;
//           const someTestsCompleted = completedTests > 0 && completedTests < totalTests;
//           const allTestsPending = completedTests === 0;

//           let statusColor = 'bg-yellow-100 text-yellow-800';
//           let statusText = 'Pending';
//           let progressColor = 'bg-yellow-500';

//           if (allTestsCompleted) {
//             statusColor = 'bg-green-100 text-green-800';
//             statusText = 'Completed';
//             progressColor = 'bg-green-500';
//           } else if (someTestsCompleted) {
//             statusColor = 'bg-blue-100 text-blue-800';
//             statusText = 'Partially Completed';
//             progressColor = 'bg-blue-500';
//           } else if (allTestsPending) {
//             statusColor = 'bg-yellow-100 text-yellow-800';
//             statusText = 'Pending';
//             progressColor = 'bg-yellow-500';
//           } else {
//             statusColor = 'bg-orange-100 text-orange-800';
//             statusText = 'In Progress';
//             progressColor = 'bg-orange-500';
//           }

//           return (
//             <div className="flex flex-col items-center gap-1">
//               <span className={`${statusColor} rounded-full text-sm truncate`}>
//                 <span className="px-2 py-1 rounded-full text-xs font-semibold">{statusText}</span>
//               </span>
//               <div className="w-16 bg-gray-200 rounded-full h-1">
//                 <div 
//                   className={`${progressColor} h-1 rounded-full transition-all duration-300`} 
//                   style={{ width: `${completionPercentage}%` }}
//                 ></div>
//               </div>
//               <span className="text-xs text-gray-500">{completedTests}/{totalTests}</span>
//             </div>
//           );
//         }
//       },
//     {
//       header: 'Tests',
//       accessor: (row: Patient) => {
//         // Get all test IDs that belong to packages
//         const packageTestIds = new Set<number>();
//         row.packageIds.forEach(packageId => {
//           const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//           if (packageDetails) {
//             // Add all test IDs from this package to the set
//             packageDetails.tests.forEach(test => {
//               packageTestIds.add(test.id);
//             });
//           }
//         });

//         // Filter out tests that belong to packages from individual tests
//         const individualTests = (row.tests || []).filter(test => 
//           !packageTestIds.has(test.id)
//         );

//                  const isExpanded = expandedRows.has(`${row.visitId}-tests`);
//          const displayTests = isExpanded ? individualTests : individualTests.slice(0, 3);
//          const hasMoreTests = individualTests.length > 3;
         
//          // For CollectionTable, show total test count (not just completed)
//          const totalTestCount = individualTests.length;

//         return (
//           <div className="flex flex-col gap-1 min-w-[250px] max-w-[350px]">
//             {displayTests.map((test) => {
//               const testResult = row.testResult?.find(tr => tr.testId === test.id);
              
//               // Determine test status
//               let statusColor = 'bg-blue-100 text-blue-800';
//               let statusText = 'Pending';
              
//               if (testResult) {
//                 if (testResult.isFilled && testResult.reportStatus === 'Completed') {
//                   statusColor = 'bg-green-100 text-green-800';
//                   statusText = 'Completed';
//                 } else if (testResult.isFilled) {
//                   statusColor = 'bg-orange-100 text-orange-800';
//                   statusText = 'In Progress';
//                 }
//               }
              
//               return (
//                 <div key={test.id} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-b-0">
//                   <span className={`${statusColor} px-2 py-0.5 rounded-full text-xs inline-block w-fit`}>
//                     {test.name}
//                   </span>
//                   {/* Only show status text if not pending */}
//                   {statusText !== 'Pending' && (
//                     <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor.replace('100', '200')}`}>
//                       {statusText}
//                     </span>
//                   )}
//                   {/* Only show status icon if test is completed */}
//                   {testResult && testResult.isFilled && (
//                     <span 
//                       className="text-xs px-1 py-0.5 rounded cursor-help bg-green-100 text-green-700 border border-green-200"
//                       title={`Test completed - ${testResult.reportStatus}`}
//                     >
//                       ✓
//                     </span>
//                   )}
//                   {/* Only show result button if test is not completed */}
//                   {(!testResult || !testResult.isFilled || testResult.reportStatus !== 'Completed') && (
//                     <button
//                       onClick={() => handleOpenReportModal(row, test.id)}
//                       className="flex items-center gap-1 bg-blue-500 text-white px-1.5 py-0.5 rounded text-xs hover:bg-blue-600 transition-colors whitespace-nowrap"
//                       title={`View result for ${test.name}`}
//                     >
//                       <PlusIcon className="w-2.5 h-2.5 text-white" />
//                       <span className='text-white text-xs'>Result</span>
//                     </button>
//                   )}
//                 </div>
//               );
//             }).filter(Boolean)}
            
//                          {hasMoreTests && (
//                <button
//                  onClick={() => toggleRowExpansion(row.visitId, 'tests')}
//                  className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
//                >
//                  {isExpanded ? 'Show Less' : `View All (${totalTestCount})`}
//                </button>
//              )}
//           </div>
//         );
//       }
//     },
//     {
//       header: 'Package',
//       accessor: (row: Patient) => {
//         if (row.packageIds.length === 0) {
//           return (
//             <div className="text-gray-400 text-xs italic">No packages</div>
//           );
//         }

//         const isExpanded = expandedRows.has(`${row.visitId}-packages`);
        
//                  // Calculate total tests and completed tests across all packages
//          const totalTests = row.packageIds.reduce((total, packageId) => {
//            const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//            return total + (packageDetails?.tests?.length || 0);
//          }, 0);
         
//          // For CollectionTable, show total test count (not just completed)
//          const totalPackageTestCount = row.packageIds.reduce((total, packageId) => {
//            const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//            if (!packageDetails) return total;
           
//            return total + packageDetails.tests.length;
//          }, 0);
         
//          // Show expandable logic if there are more than 3 total tests (even with 1 package)
//          const hasMoreContent = totalTests > 3;
         
//          // If expanded, show all packages. If not expanded, show first package with limited tests
//          let displayPackages: number[];
//          let displayTests: Array<{
//            id: number;
//            name: string;
//            price: number;
//            category?: string;
//          }> | null = null;
         
//          if (isExpanded) {
//            // Show all packages and all tests
//            displayPackages = row.packageIds;
//          } else {
//            // Show first package with limited tests
//            displayPackages = row.packageIds.slice(0, 1);
//            const firstPackage = healthPackages.find((pkg) => pkg.id === row.packageIds[0]);
//            if (firstPackage) {
//              displayTests = firstPackage.tests.slice(0, 3); // Show only first 3 tests
//            }
//          }

//         return (
//           <div className="flex flex-col gap-2 min-w-[250px] max-w-[350px]">
//             {displayPackages.map((packageId) => {
//               const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//               if (!packageDetails) return null;

//               return (
//                 <div key={packageDetails.id} className="flex flex-col gap-1">
//                   {/* Package name with icon */}
//                   <div className="flex items-center gap-1">
//                     <span className="text-xs">📦</span>
//                     <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
//                       {packageDetails.packageName}
//                     </span>
//                   </div>
                  
//                   {/* Package tests */}
//                   <div className="flex flex-col gap-1 ml-2">
//                     {(isExpanded ? packageDetails.tests : (displayTests || packageDetails.tests.slice(0, 3))).map((test: { id: number; name: string; price: number; category?: string }, index: number) => {
//                       // Use the test ID directly from the package test data
//                       const testId = test.id;
//                       if (!testId) return null;

//                       const testResult = row.testResult?.find(tr => tr.testId === testId);
                      
//                       // Determine test status
//                       let statusColor = 'bg-purple-100 text-purple-800';
//                       let statusText = 'Pending';
                      
//                       if (testResult) {
//                         if (testResult.isFilled && testResult.reportStatus === 'Completed') {
//                           statusColor = 'bg-green-100 text-green-800';
//                           statusText = 'Completed';
//                         } else if (testResult.isFilled) {
//                           statusColor = 'bg-orange-100 text-orange-800';
//                           statusText = 'In Progress';
//                         }
//                       }
                      
//                       return (
//                         <div key={`${packageDetails.id}-${index}`} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-b-0">
//                           <span className={`${statusColor} px-2 py-0.5 rounded-full text-xs inline-block w-fit`}>
//                             {test.name}
//                           </span>
//                           {/* Only show status text if not pending */}
//                           {statusText !== 'Pending' && (
//                             <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor.replace('100', '200')}`}>
//                               {statusText}
//                             </span>
//                           )}
//                           {/* Only show status icon if test is completed */}
//                           {testResult && testResult.isFilled && (
//                             <span 
//                               className="text-xs px-1 py-0.5 rounded cursor-help bg-green-100 text-green-700 border border-green-200"
//                               title={`Test completed - ${testResult.reportStatus}`}
//                             >
//                               ✓
//                             </span>
//                           )}
//                           {/* Only show result button if test is not completed */}
//                           {(!testResult || !testResult.isFilled || testResult.reportStatus !== 'Completed') && (
//                             <button
//                               onClick={() => handleOpenReportModal(row, testId)}
//                               className="flex items-center gap-1 bg-purple-500 text-white px-1.5 py-0.5 rounded text-xs hover:bg-purple-600 transition-colors whitespace-nowrap"
//                               title={`View result for ${test.name}`}
//                             >
//                               <PlusIcon className="w-2.5 h-2.5 text-white" />
//                               <span className='text-white text-xs'>Result</span>
//                             </button>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               );
//             }).filter(Boolean)}
            
//                          {hasMoreContent && (
//                <button
//                  onClick={() => toggleRowExpansion(row.visitId, 'packages')}
//                  className="text-xs text-purple-600 hover:text-purple-800 font-medium mt-1 w-fit"
//                >
//                  {isExpanded ? 'Show Less' : `View All (${totalPackageTestCount})`}
//                </button>
//              )}
//           </div>
//         );
//       }
//     },
//     {
//       header: 'Samples',
//       accessor: (row: Patient) => (
//         <div className="flex items-center gap-1">
//           <button
//             onClick={() => handleUpdate(row.visitId, row.sampleNames)}
//             className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
//             title="Edit samples"
//           >
//             <Edit className="w-4 h-4" />
//           </button>
//                      <div className="flex flex-wrap gap-1 max-w-[150px]">
//             {row.sampleNames.map((sample, index) => (
//               <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
//                 <span className="text-xs">{sample}</span>
//                 <button
//                   onClick={() => deleteSample(row.visitId, [sample])}
//                   className="text-red-500 hover:text-red-700 transition-colors"
//                   title="Delete sample"
//                 >
//                   <MdCancelPresentation className="w-3 h-3" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )
//     },
//     {
//       header: 'Barcode',
//       accessor: (row: Patient) => {
//         return (
//           <div className="flex items-center justify-center">
//             <button
//               onClick={() => handleDownloadBarcode(row)}
//               className="flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
//               title="Download Barcode"
//             >
//               <Download className="w-3 h-3" />
//               <span>Download</span>
//             </button>
//           </div>
//         )
//       }
//     },

//   ];

//   if (isFetching) {
//     return (
//       <div className="flex flex-col items-center justify-center p-6">
//         <Loader type="progress" fullScreen={false} text="Loading collected samples..." />
//         <p className="mt-4 text-sm text-gray-600">Fetching collected samples, please wait...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
//         <div className="flex-1">
//           <h2 className="text-xl font-semibold text-gray-900">Collected Samples</h2>
//           <p className="text-xs text-gray-600">Manage collected patient samples</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="flex flex-col w-40">
//               <label className="text-xs font-semibold mb-1 text-gray-600">Date Range:</label>
//               <select
//                 value={dateFilter}
//                 onChange={(e) => handleDateFilterChange(e.target.value as DateFilterOption)}
//                 className="border border-blue-300 px-3 py-1.5 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
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
//                 <div className="flex flex-col w-40">
//                   <label className="text-xs font-semibold mb-1 text-gray-600">Start Date:</label>
//                   <input
//                     type="date"
//                     value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
//                     onChange={(e) => setCustomStartDate(e.target.value ? new Date(e.target.value) : null)}
//                     className="border border-blue-300 px-3 py-1.5 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
//                   />
//                 </div>

//                 <div className="flex flex-col w-40">
//                   <label className="text-xs font-semibold mb-1 text-gray-600">End Date:</label>
//                   <input
//                     type="date"
//                     value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
//                     onChange={(e) => setCustomEndDate(e.target.value ? new Date(e.target.value) : null)}
//                     className="border border-blue-300 px-3 py-1.5 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
//                   />
//                 </div>
//               </>
//             )}
//           </div>
//           {closeModal && (
//             <button
//               onClick={closeModal}
//               className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//               title="Close"
//             >
//               <FaTimes className="h-5 w-5" />
//             </button>
//           )}
//         </div>
//       </div>
      

//       <div className="mb-3">
//         <div className="bg-green-50 p-3 rounded-lg border border-green-100">
//           <h4 className="font-semibold text-green-800 mb-1 flex items-center">
//             <FaVial className="mr-2 text-green-600" /> Statistics
//           </h4>
//           <p className="text-xs font-medium text-gray-600">
//             Showing <span className="font-bold text-gray-900">{patientList.length}</span> collected sample{patientList.length !== 1 ? 's' : ''}
//           </p>
//         </div>
//       </div>

//       {patientList.length === 0 ? (
//         <div className="text-center py-8 bg-gray-50 rounded-xl shadow-lg border border-gray-200">
//           <div className="mx-auto w-16 h-16 mb-3 text-gray-300">
//             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//           <h3 className="text-md font-semibold text-gray-800">No collected samples</h3>
//           <p className="text-gray-600 text-xs mt-1">No samples found for the selected date range</p>
//         </div>
//       ) : (
//         <>
//           <div className="overflow-x-auto rounded-xl border border-gray-200">
//             <TableComponent
//               data={paginatedPatients}
//               columns={columns}
//             />
//           </div>

//           {showModal && selectedPatient && selectedTest && (
//             <Modal isOpen={showModal} title={`Enter Result Data - ${selectedTest.name}`} onClose={() => {
//               setShowModal(false);
//               setSelectedPatient(null);
//               setSelectedTest(null);
//             }} modalClassName="max-w-5xl">
//               <PatientReportDataFill
//                 selectedPatient={selectedPatient}
//                 selectedTest={selectedTest}
//                 updateCollectionTable={updateCollectionTable}
//                 setUpdateCollectionTable={setUpdateCollectionTable}
//                 setShowModal={setShowModal}
//               />
//             </Modal>
//           )}

//           {totalPages > 1 && (
//             <div className="mt-4 flex justify-center">
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={setCurrentPage}
//               />
//             </div>
//           )}

//           {updatedPopUp && (
//             <Modal isOpen={updatedPopUp} title="Update Sample" onClose={() => setUpdatedPopUp(false)} modalClassName="max-w-2xl">
//               <UpdateSample
//                 visitId={updateSample?.visitId ?? 0}
//                 sampleNames={updateSample?.sampleNames ?? []}
//                 onClose={() => {
//                   setUpdatedPopUp(false);
//                   // Refresh the table data after sample update
//                   fetchVisits();
//                 }}
//               />
//             </Modal>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default CollectionTable;




































// code done by abhishek.......................(do not change)...............

// import { getHealthPackageById } from '@/../services/packageServices';
// import Loader from '@/app/(admin)/component/common/Loader';
// import Modal from '@/app/(admin)/component/common/Model';
// import Pagination from '@/app/(admin)/component/common/Pagination';
// import TableComponent from '@/app/(admin)/component/common/TableComponent';
// import { useLabs } from '@/context/LabContext';
// import { TestList } from '@/types/test/testlist';
// import { calculateAge } from '@/utils/ageUtils';
// import { DATE_FILTER_OPTIONS, DateFilterOption, formatDateForAPI, formatDisplayDate, getDateRange } from '@/utils/dateUtils';
// import html2canvas from 'html2canvas';
// import { CalendarDays, Edit, PlusIcon, Download } from 'lucide-react';
// import React, { useEffect, useState } from 'react';
// import { FaTimes, FaVial } from 'react-icons/fa';
// import { createRoot } from 'react-dom/client';
// import Barcode from 'react-barcode';
// import { MdCancelPresentation } from 'react-icons/md';
// import { toast } from 'react-toastify';
// import { deleteVisitSample, getCollectedCompleted } from '../../../../../../services/sampleServices';
// import PatientReportDataFill from './Report/PatientReportDataFill';
// import UpdateSample from './UpdateSample';

// export interface Patient {
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
//   testResult?: TestResult[]; // Add testResult array
// }

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

// interface UpdateSample {
//   visitId: number;
//   sampleNames: string[];
// }

// // Test result interface for individual test results
// interface TestResult {
//   id: number;
//   testId: number;
//   isFilled: boolean;
//   reportStatus: string;
//   createdBy: string;
//   updatedBy: string;
//   createdAt: string;
//   updatedAt: string;
// }


// interface CollectionTableProps {
//   closeModal?: () => void;
// }

// const CollectionTable: React.FC<CollectionTableProps> = ({ closeModal }) => {
//   const { currentLab } = useLabs();
//   const [patientList, setPatientList] = useState<Patient[]>([]);
//   const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 8;
//   const [updatedPopUp, setUpdatedPopUp] = useState(false);
//   const [updateSample, setUpdateSample] = useState<UpdateSample | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
//   const [selectedTest, setSelectedTest] = useState<TestList | null>(null);
//   const [updateCollectionTable, setUpdateCollectionTable] = useState(false);
//   const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
//   const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
//   const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
//   const [isFetching, setIsFetching] = useState(false);
  
//   // State for expanded rows
//   const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());




//   const fetchVisits = async () => {
//     try {
//       if (!currentLab?.id) return;

//       setIsFetching(true);
//       const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);

//       if (!startDate || !endDate) return;

//       const response = await getCollectedCompleted(
//         currentLab.id,
//         formatDateForAPI(startDate),
//         formatDateForAPI(endDate),
//       );

//              const collectedVisits = response
//          .filter(visit => {
//            // Filter out visits where all tests are completed
//            if (!visit.testResult || visit.testResult.length === 0) {
//              return true; // Keep visits without test results
//            }
           
//            // Check if all tests have reportStatus "Completed"
//            const allTestsCompleted = visit.testResult.every(tr => tr.reportStatus === 'Completed');
//            return !allTestsCompleted; // Only show visits where not all tests are completed
//          })
//          .sort((a, b) => {
//            // Sort by visit ID (highest first) to show most recently added samples at top
//            // This ensures newly added samples appear first regardless of visit date
//            return b.visitId - a.visitId;
//          });

//       setPatientList(
//         collectedVisits.map((visit) => {
//           const visitTests = visit.tests ?? [];
//           return {
//             visitId: visit.visitId,
//             visitCode: visit.visitCode,
//             patientname: visit.patientname,
//             gender: visit.gender ?? '',
//             contactNumber: visit.contactNumber ?? '',
//             email: visit.email ?? '',
//             visitDate: visit.visitDate,
//             visitStatus: visit.visitStatus,
//             sampleNames: visit.sampleNames,
//             testIds: visit.testIds ?? visitTests.map((test) => test.id),
//             tests: visitTests,
//             packageIds: visit.packageIds,
//             dateOfBirth: visit.dateOfBirth ?? undefined,
//             testResult: visit.testResult ?? undefined, // Add testResult to the patient object
//           };
//         })
//       );

//       const uniquePackageIds = Array.from(new Set(collectedVisits.flatMap((visit) => visit.packageIds)));
//       const fetchedPackages = await Promise.all(
//         uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId))
//       );
//       setHealthPackages(fetchedPackages.map((pkg) => pkg.data));
//     } catch (error) {
//       toast.error((error as Error).message || 'Error fetching visits', { autoClose: 2000 });
//     } finally {
//       setIsFetching(false);
//     }
//   };

//   useEffect(() => {
//     fetchVisits();
//   }, [currentLab, updatedPopUp, updateCollectionTable, dateFilter, customStartDate, customEndDate]);



//   const handleDateFilterChange = (filter: DateFilterOption) => {
//     setDateFilter(filter);
//   };

//   const totalPages = Math.ceil(patientList.length / itemsPerPage);
//   const paginatedPatients = patientList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   const deleteSample = async (visitId: number, sampleNames: string[]) => {
//     try {
//       await deleteVisitSample(visitId, sampleNames);
//       toast.success('Sample deleted successfully');
//       fetchVisits();
//     } catch (error) {
//       toast.error((error as Error).message || 'Error deleting sample');
//     }
//   };

//   const handleUpdate = (visitId: number, sampleNames: string[]) => {
//     setUpdatedPopUp(true);
//     setUpdateSample({ visitId, sampleNames });
//   };

//   const handleDownloadBarcode = async (row: Patient) => {
//     const age = row.dateOfBirth ? calculateAge(row.dateOfBirth) : 'N/A';
//     const barcodeValue = 
//       "Patient ID: " + row.visitId +
//       " Name: " + row.patientname +
//       " Age: " + age +
//       " Gender: " + (row.gender || '');

//     // Create a temporary container for the barcode
//     const tempContainer = document.createElement('div');
//     tempContainer.style.position = 'absolute';
//     tempContainer.style.left = '-9999px';
//     tempContainer.style.top = '0';
//     document.body.appendChild(tempContainer);

//     // Create a temporary div to render the barcode
//     const barcodeDiv = document.createElement('div');
//     tempContainer.appendChild(barcodeDiv);

//     // Render the barcode using React
//     const root = createRoot(barcodeDiv);
//     root.render(
//       React.createElement(Barcode, {
//         value: barcodeValue,
//         format: "CODE128",
//         width: 0.5,
//         height: 40,
//         displayValue: true,
//         fontSize: 10
//       })
//     );

//     // Wait for the barcode to render
//     await new Promise(resolve => setTimeout(resolve, 100));

//     // Capture the barcode as canvas
//     const canvas = await html2canvas(barcodeDiv);
//     const link = document.createElement('a');
//     link.href = canvas.toDataURL('image/png');
//     link.download = `barcode-${row.visitId}.png`;
//     link.click();

//     // Clean up
//     root.unmount();
//     document.body.removeChild(tempContainer);
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

//   const handleOpenReportModal = (patient: Patient, testId: number) => {
//     if (!patient || !testId) return;

//     // First try to find the test in individual tests
//     const visitTest = patient.tests?.find((t) => t.id === testId);
//     let selected: TestList | null = visitTest
//       ? {
//           id: visitTest.id,
//           name: visitTest.name,
//           price: 0,
//           category: '',
//         }
//       : null;
    
//     // If not found in individual tests, search in package tests
//     if (!selected) {
//       for (const packageId of patient.packageIds) {
//         const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//         if (packageDetails) {
//           const packageTest = packageDetails.tests.find((t) => t.id === testId);
//           if (packageTest) {
//             // Create a test object that matches the TestList interface
//             selected = {
//               id: packageTest.id,
//               name: packageTest.name,
//               price: packageTest.price,
//               category: packageTest.category || ''
//             };
//             break;
//           }
//         }
//       }
//     }

//     if (!selected) return;

//     setSelectedPatient(patient);
//     setSelectedTest(selected);
//     setShowModal(true);
//   };





//   const columns = [
//     {
//       header: 'ID',
//       accessor: (row: Patient) => row.visitCode || row.visitId,
//       cell: (value: number | string) => <span className="font-semibold text-primary">#{value}</span>
//     },
//     {
//       header: 'Patient',
//       accessor: (row: Patient) => (
//         <div className="flex flex-col gap-1">
//           <span className="font-medium text-gray-900">{row.patientname}</span>
//           <div className="flex items-center gap-1 text-gray-500 bg-blue-50 px-2 py-1 rounded-full w-fit">
//             <CalendarDays className="w-3 h-3 opacity-70" />
//             <span className="text-xs font-medium">{formatDisplayDate(row.visitDate)}</span>
//           </div>
//         </div>
//       )
//     },
//           {
//         header: 'Status',
//         accessor: (row: Patient) => {
//           // Check if we have test results
//           if (!row.testResult || row.testResult.length === 0) {
//             return (
//               <div className="flex flex-col items-center gap-1">
//                 <span className={'bg-yellow-100 text-yellow-800 rounded-full text-sm truncate'}>
//                   <span className="px-2 py-1 rounded-full text-xs font-semibold">Pending</span>
//                 </span>
//                 <div className="w-16 bg-gray-200 rounded-full h-1">
//                   <div className="bg-yellow-500 h-1 rounded-full" style={{ width: '0%' }}></div>
//                 </div>
//               </div>
//             );
//           }

//           // Calculate completion percentage
//           const totalTests = row.testResult.length;
//           const completedTests = row.testResult.filter(tr => tr.isFilled && tr.reportStatus === 'Completed').length;
//           const completionPercentage = (completedTests / totalTests) * 100;

//           // Check if all tests are completed
//           const allTestsCompleted = completedTests === totalTests;
//           const someTestsCompleted = completedTests > 0 && completedTests < totalTests;
//           const allTestsPending = completedTests === 0;

//           let statusColor = 'bg-yellow-100 text-yellow-800';
//           let statusText = 'Pending';
//           let progressColor = 'bg-yellow-500';

//           if (allTestsCompleted) {
//             statusColor = 'bg-green-100 text-green-800';
//             statusText = 'Completed';
//             progressColor = 'bg-green-500';
//           } else if (someTestsCompleted) {
//             statusColor = 'bg-blue-100 text-blue-800';
//             statusText = 'Partially Completed';
//             progressColor = 'bg-blue-500';
//           } else if (allTestsPending) {
//             statusColor = 'bg-yellow-100 text-yellow-800';
//             statusText = 'Pending';
//             progressColor = 'bg-yellow-500';
//           } else {
//             statusColor = 'bg-orange-100 text-orange-800';
//             statusText = 'In Progress';
//             progressColor = 'bg-orange-500';
//           }

//           return (
//             <div className="flex flex-col items-center gap-1">
//               <span className={`${statusColor} rounded-full text-sm truncate`}>
//                 <span className="px-2 py-1 rounded-full text-xs font-semibold">{statusText}</span>
//               </span>
//               <div className="w-16 bg-gray-200 rounded-full h-1">
//                 <div 
//                   className={`${progressColor} h-1 rounded-full transition-all duration-300`} 
//                   style={{ width: `${completionPercentage}%` }}
//                 ></div>
//               </div>
//               <span className="text-xs text-gray-500">{completedTests}/{totalTests}</span>
//             </div>
//           );
//         }
//       },
//     {
//       header: 'Tests',
//       accessor: (row: Patient) => {
//         // Get all test IDs that belong to packages
//         const packageTestIds = new Set<number>();
//         row.packageIds.forEach(packageId => {
//           const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//           if (packageDetails) {
//             // Add all test IDs from this package to the set
//             packageDetails.tests.forEach(test => {
//               packageTestIds.add(test.id);
//             });
//           }
//         });

//         // Filter out tests that belong to packages from individual tests
//         const individualTests = (row.tests || []).filter(test => 
//           !packageTestIds.has(test.id)
//         );

//                  const isExpanded = expandedRows.has(`${row.visitId}-tests`);
//          const displayTests = isExpanded ? individualTests : individualTests.slice(0, 3);
//          const hasMoreTests = individualTests.length > 3;
         
//          // For CollectionTable, show total test count (not just completed)
//          const totalTestCount = individualTests.length;

//         return (
//           <div className="flex flex-col gap-1 min-w-[250px] max-w-[350px]">
//             {displayTests.map((test) => {
//               const testResult = row.testResult?.find(tr => tr.testId === test.id);
              
//               // Determine test status
//               let statusColor = 'bg-blue-100 text-blue-800';
//               let statusText = 'Pending';
              
//               if (testResult) {
//                 if (testResult.isFilled && testResult.reportStatus === 'Completed') {
//                   statusColor = 'bg-green-100 text-green-800';
//                   statusText = 'Completed';
//                 } else if (testResult.isFilled) {
//                   statusColor = 'bg-orange-100 text-orange-800';
//                   statusText = 'In Progress';
//                 }
//               }
              
//               return (
//                 <div key={test.id} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-b-0">
//                   <span className={`${statusColor} px-2 py-0.5 rounded-full text-xs inline-block w-fit`}>
//                     {test.name}
//                   </span>
//                   {/* Only show status text if not pending */}
//                   {statusText !== 'Pending' && (
//                     <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor.replace('100', '200')}`}>
//                       {statusText}
//                     </span>
//                   )}
//                   {/* Only show status icon if test is completed */}
//                   {testResult && testResult.isFilled && (
//                     <span 
//                       className="text-xs px-1 py-0.5 rounded cursor-help bg-green-100 text-green-700 border border-green-200"
//                       title={`Test completed - ${testResult.reportStatus}`}
//                     >
//                       ✓
//                     </span>
//                   )}
//                   {/* Only show result button if test is not completed */}
//                   {(!testResult || !testResult.isFilled || testResult.reportStatus !== 'Completed') && (
//                     <button
//                       onClick={() => handleOpenReportModal(row, test.id)}
//                       className="flex items-center gap-1 bg-blue-500 text-white px-1.5 py-0.5 rounded text-xs hover:bg-blue-600 transition-colors whitespace-nowrap"
//                       title={`View result for ${test.name}`}
//                     >
//                       <PlusIcon className="w-2.5 h-2.5 text-white" />
//                       <span className='text-white text-xs'>Result</span>
//                     </button>
//                   )}
//                 </div>
//               );
//             }).filter(Boolean)}
            
//                          {hasMoreTests && (
//                <button
//                  onClick={() => toggleRowExpansion(row.visitId, 'tests')}
//                  className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
//                >
//                  {isExpanded ? 'Show Less' : `View All (${totalTestCount})`}
//                </button>
//              )}
//           </div>
//         );
//       }
//     },
//     {
//       header: 'Package',
//       accessor: (row: Patient) => {
//         if (row.packageIds.length === 0) {
//           return (
//             <div className="text-gray-400 text-xs italic">No packages</div>
//           );
//         }

//         const isExpanded = expandedRows.has(`${row.visitId}-packages`);
        
//                  // Calculate total tests and completed tests across all packages
//          const totalTests = row.packageIds.reduce((total, packageId) => {
//            const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//            return total + (packageDetails?.tests?.length || 0);
//          }, 0);
         
//          // For CollectionTable, show total test count (not just completed)
//          const totalPackageTestCount = row.packageIds.reduce((total, packageId) => {
//            const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//            if (!packageDetails) return total;
           
//            return total + packageDetails.tests.length;
//          }, 0);
         
//          // Show expandable logic if there are more than 3 total tests (even with 1 package)
//          const hasMoreContent = totalTests > 3;
         
//          // If expanded, show all packages. If not expanded, show first package with limited tests
//          let displayPackages: number[];
//          let displayTests: Array<{
//            id: number;
//            name: string;
//            price: number;
//            category?: string;
//          }> | null = null;
         
//          if (isExpanded) {
//            // Show all packages and all tests
//            displayPackages = row.packageIds;
//          } else {
//            // Show first package with limited tests
//            displayPackages = row.packageIds.slice(0, 1);
//            const firstPackage = healthPackages.find((pkg) => pkg.id === row.packageIds[0]);
//            if (firstPackage) {
//              displayTests = firstPackage.tests.slice(0, 3); // Show only first 3 tests
//            }
//          }

//         return (
//           <div className="flex flex-col gap-2 min-w-[250px] max-w-[350px]">
//             {displayPackages.map((packageId) => {
//               const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//               if (!packageDetails) return null;

//               return (
//                 <div key={packageDetails.id} className="flex flex-col gap-1">
//                   {/* Package name with icon */}
//                   <div className="flex items-center gap-1">
//                     <span className="text-xs">📦</span>
//                     <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
//                       {packageDetails.packageName}
//                     </span>
//                   </div>
                  
//                   {/* Package tests */}
//                   <div className="flex flex-col gap-1 ml-2">
//                     {(isExpanded ? packageDetails.tests : (displayTests || packageDetails.tests.slice(0, 3))).map((test: { id: number; name: string; price: number; category?: string }, index: number) => {
//                       // Use the test ID directly from the package test data
//                       const testId = test.id;
//                       if (!testId) return null;

//                       const testResult = row.testResult?.find(tr => tr.testId === testId);
                      
//                       // Determine test status
//                       let statusColor = 'bg-purple-100 text-purple-800';
//                       let statusText = 'Pending';
                      
//                       if (testResult) {
//                         if (testResult.isFilled && testResult.reportStatus === 'Completed') {
//                           statusColor = 'bg-green-100 text-green-800';
//                           statusText = 'Completed';
//                         } else if (testResult.isFilled) {
//                           statusColor = 'bg-orange-100 text-orange-800';
//                           statusText = 'In Progress';
//                         }
//                       }
                      
//                       return (
//                         <div key={`${packageDetails.id}-${index}`} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-b-0">
//                           <span className={`${statusColor} px-2 py-0.5 rounded-full text-xs inline-block w-fit`}>
//                             {test.name}
//                           </span>
//                           {/* Only show status text if not pending */}
//                           {statusText !== 'Pending' && (
//                             <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor.replace('100', '200')}`}>
//                               {statusText}
//                             </span>
//                           )}
//                           {/* Only show status icon if test is completed */}
//                           {testResult && testResult.isFilled && (
//                             <span 
//                               className="text-xs px-1 py-0.5 rounded cursor-help bg-green-100 text-green-700 border border-green-200"
//                               title={`Test completed - ${testResult.reportStatus}`}
//                             >
//                               ✓
//                             </span>
//                           )}
//                           {/* Only show result button if test is not completed */}
//                           {(!testResult || !testResult.isFilled || testResult.reportStatus !== 'Completed') && (
//                             <button
//                               onClick={() => handleOpenReportModal(row, testId)}
//                               className="flex items-center gap-1 bg-purple-500 text-white px-1.5 py-0.5 rounded text-xs hover:bg-purple-600 transition-colors whitespace-nowrap"
//                               title={`View result for ${test.name}`}
//                             >
//                               <PlusIcon className="w-2.5 h-2.5 text-white" />
//                               <span className='text-white text-xs'>Result</span>
//                             </button>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               );
//             }).filter(Boolean)}
            
//                          {hasMoreContent && (
//                <button
//                  onClick={() => toggleRowExpansion(row.visitId, 'packages')}
//                  className="text-xs text-purple-600 hover:text-purple-800 font-medium mt-1 w-fit"
//                >
//                  {isExpanded ? 'Show Less' : `View All (${totalPackageTestCount})`}
//                </button>
//              )}
//           </div>
//         );
//       }
//     },
//     {
//       header: 'Samples',
//       accessor: (row: Patient) => (
//         <div className="flex items-center gap-1">
//           <button
//             onClick={() => handleUpdate(row.visitId, row.sampleNames)}
//             className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
//             title="Edit samples"
//           >
//             <Edit className="w-4 h-4" />
//           </button>
//                      <div className="flex flex-wrap gap-1 max-w-[150px]">
//             {row.sampleNames.map((sample, index) => (
//               <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
//                 <span className="text-xs">{sample}</span>
//                 <button
//                   onClick={() => deleteSample(row.visitId, [sample])}
//                   className="text-red-500 hover:text-red-700 transition-colors"
//                   title="Delete sample"
//                 >
//                   <MdCancelPresentation className="w-3 h-3" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )
//     },
//     {
//       header: 'Barcode',
//       accessor: (row: Patient) => {
//         return (
//           <div className="flex items-center justify-center">
//             <button
//               onClick={() => handleDownloadBarcode(row)}
//               className="flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
//               title="Download Barcode"
//             >
//               <Download className="w-3 h-3" />
//               <span>Download</span>
//             </button>
//           </div>
//         )
//       }
//     },

//   ];

//   if (isFetching) {
//     return (
//       <div className="flex flex-col items-center justify-center p-6">
//         <Loader type="progress" fullScreen={false} text="Loading collected samples..." />
//         <p className="mt-4 text-sm text-gray-600">Fetching collected samples, please wait...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
//         <div className="flex-1">
//           <h2 className="text-xl font-semibold text-gray-900">Collected Samples</h2>
//           <p className="text-xs text-gray-600">Manage collected patient samples</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="flex flex-col w-40">
//               <label className="text-xs font-semibold mb-1 text-gray-600">Date Range:</label>
//               <select
//                 value={dateFilter}
//                 onChange={(e) => handleDateFilterChange(e.target.value as DateFilterOption)}
//                 className="border border-blue-300 px-3 py-1.5 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
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
//                 <div className="flex flex-col w-40">
//                   <label className="text-xs font-semibold mb-1 text-gray-600">Start Date:</label>
//                   <input
//                     type="date"
//                     value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
//                     onChange={(e) => setCustomStartDate(e.target.value ? new Date(e.target.value) : null)}
//                     className="border border-blue-300 px-3 py-1.5 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
//                   />
//                 </div>

//                 <div className="flex flex-col w-40">
//                   <label className="text-xs font-semibold mb-1 text-gray-600">End Date:</label>
//                   <input
//                     type="date"
//                     value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
//                     onChange={(e) => setCustomEndDate(e.target.value ? new Date(e.target.value) : null)}
//                     className="border border-blue-300 px-3 py-1.5 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
//                   />
//                 </div>
//               </>
//             )}
//           </div>
//           {closeModal && (
//             <button
//               onClick={closeModal}
//               className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//               title="Close"
//             >
//               <FaTimes className="h-5 w-5" />
//             </button>
//           )}
//         </div>
//       </div>
      

//       <div className="mb-3">
//         <div className="bg-green-50 p-3 rounded-lg border border-green-100">
//           <h4 className="font-semibold text-green-800 mb-1 flex items-center">
//             <FaVial className="mr-2 text-green-600" /> Statistics
//           </h4>
//           <p className="text-xs font-medium text-gray-600">
//             Showing <span className="font-bold text-gray-900">{patientList.length}</span> collected sample{patientList.length !== 1 ? 's' : ''}
//           </p>
//         </div>
//       </div>

//       {patientList.length === 0 ? (
//         <div className="text-center py-8 bg-gray-50 rounded-xl shadow-lg border border-gray-200">
//           <div className="mx-auto w-16 h-16 mb-3 text-gray-300">
//             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//           <h3 className="text-md font-semibold text-gray-800">No collected samples</h3>
//           <p className="text-gray-600 text-xs mt-1">No samples found for the selected date range</p>
//         </div>
//       ) : (
//         <>
//           <div className="overflow-x-auto rounded-xl border border-gray-200">
//             <TableComponent
//               data={paginatedPatients}
//               columns={columns}
//             />
//           </div>

//           {showModal && selectedPatient && selectedTest && (
//             <Modal isOpen={showModal} title={`Enter Result Data - ${selectedTest.name}`} onClose={() => {
//               setShowModal(false);
//               setSelectedPatient(null);
//               setSelectedTest(null);
//             }} modalClassName="max-w-5xl">
//               <PatientReportDataFill
//                 selectedPatient={selectedPatient}
//                 selectedTest={selectedTest}
//                 updateCollectionTable={updateCollectionTable}
//                 setUpdateCollectionTable={setUpdateCollectionTable}
//                 setShowModal={setShowModal}
//               />
//             </Modal>
//           )}

//           {totalPages > 1 && (
//             <div className="mt-4 flex justify-center">
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={setCurrentPage}
//               />
//             </div>
//           )}

//           {updatedPopUp && (
//             <Modal isOpen={updatedPopUp} title="Update Sample" onClose={() => setUpdatedPopUp(false)} modalClassName="max-w-2xl">
//               <UpdateSample
//                 visitId={updateSample?.visitId ?? 0}
//                 sampleNames={updateSample?.sampleNames ?? []}
//                 onClose={() => {
//                   setUpdatedPopUp(false);
//                   // Refresh the table data after sample update
//                   fetchVisits();
//                 }}
//               />
//             </Modal>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default CollectionTable;