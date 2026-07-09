"use client";

import React, { useEffect, useState} from "react";
import {
  Search,
  Edit,
  Eye,
  Package,
  ChevronDown,
  ChevronUp,
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
import { getCollectedCompleted } from '../../../../../../services/sampleServices';
import ViewReport from './Report/ViewReport';
import Editreport from '@/app/(admin)/dashboard/sample/_component/Report/Editreport';

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
  visitCode?: string;
  patientId?: number;
  patientname: string;
  visitDate: string;
  visitStatus: string;
  sampleNames: string[];
  tests?: Array<{
    id: number;
    name: string;
  }>;
  packageIds: number[];
  contactNumber?: string;
  gender?: string;
  email?: string;
  dateOfBirth?: string;
  testResult?: TestResult[];
  doctorName?: string;
  visitType?: string;
}

interface TestResult {
  id: number;
  testId: number;
  isFilled: boolean;
  reportStatus: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  reportId?: number;
}

type SortOption = 'patientName' | 'patientId';

interface CompletedTableProps {
  closeModal?: () => void;
  onDataUpdate?: (count: number) => void;
  onDateFilterChange?: (filter: DateFilterOption, startDate?: Date | null, endDate?: Date | null) => void;
  refreshTrigger?: number;
  onReportEdited?: () => void;
}

const CompletedTable: React.FC<CompletedTableProps> = ({ 
  onDataUpdate, 
  onDateFilterChange,
  refreshTrigger,
  onReportEdited 
}) => {
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
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('patientId');
  
  // Modal states
  const [viewModel, setViewModel] = useState(false);
  const [editModel, setEditModel] = useState(false);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [editTest, setEditTest] = useState<TestList | null>(null);
  const [editReportId, setEditReportId] = useState<number | null>(null);
  
  // Expanded row state for individual tests
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Expanded sections state for package dropdowns
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});
  
  useEffect(() => {
    if (onDataUpdate) {
      // Count individual completed tests across all patients
      const totalCompletedTests = filteredPatients.reduce((total, patient) => {
        if (!patient.testResult) return total;
        
        // Count all tests with reportStatus === 'Completed'
        const completedTests = patient.testResult.filter(
          tr => tr.reportStatus === 'Completed'
        ).length;
        
        return total + completedTests;
      }, 0);
      
      onDataUpdate(totalCompletedTests);
    }
  }, [filteredPatients, onDataUpdate]);

  useEffect(() => {
    if (onDateFilterChange) {
      onDateFilterChange(dateFilter, customStartDate, customEndDate);
    }
  }, [dateFilter, customStartDate, customEndDate, onDateFilterChange]);

  // Listen for refresh trigger from parent
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchVisits();
    }
  }, [refreshTrigger]);

  // Fetch visits data
  const fetchVisits = async () => {
    if (!currentLab?.id) return;

    try {
      setIsLoading(true);
      const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);

      if (!startDate || !endDate) return;

      const response = await getCollectedCompleted(
        currentLab.id,
        formatDateForAPI(startDate),
        formatDateForAPI(endDate),
      );

      // Filter to show visits where AT LEAST ONE test is completed
      const completedVisits = response.filter(visit => {
        if (!visit.testResult || visit.testResult.length === 0) {
          return false;
        }
        const hasCompletedTest = visit.testResult.some(tr => tr.reportStatus === 'Completed');
        return hasCompletedTest;
      });

      const sortedVisits = completedVisits.sort((a, b) => {
        const aLatestCompletion = a.testResult?.reduce((latest, tr) => {
          if (tr.reportStatus === 'Completed' && tr.updatedAt) {
            const updatedAt = new Date(tr.updatedAt).getTime();
            return updatedAt > latest ? updatedAt : latest;
          }
          return latest;
        }, 0) || 0;
        
        const bLatestCompletion = b.testResult?.reduce((latest, tr) => {
          if (tr.reportStatus === 'Completed' && tr.updatedAt) {
            const updatedAt = new Date(tr.updatedAt).getTime();
            return updatedAt > latest ? updatedAt : latest;
          }
          return latest;
        }, 0) || 0;
        
        if (aLatestCompletion > 0 && bLatestCompletion > 0) {
          return bLatestCompletion - aLatestCompletion;
        }
        if (aLatestCompletion > 0 && bLatestCompletion === 0) {
          return -1;
        }
        if (bLatestCompletion > 0 && aLatestCompletion === 0) {
          return 1;
        }
        return new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime();
      });

      const normalizedVisits = sortedVisits.map(visit => ({
        ...visit,
        doctorName: visit.doctorName ?? '',
        visitType: visit.visitType ?? '',
      }));

      setPatientList(normalizedVisits);
      setFilteredPatients(normalizedVisits);

      // Fetch health packages
      const uniquePackageIds = Array.from(new Set(sortedVisits.flatMap((visit) => visit.packageIds)));
      if (uniquePackageIds.length > 0) {
        const fetchedPackages = await Promise.all(
          uniquePackageIds.map((packageId) =>
            getHealthPackageById(currentLab.id, packageId)
              .catch(() => ({ data: null }))
          )
        );
        setHealthPackages(fetchedPackages.map(pkg => pkg?.data).filter(Boolean) as HealthPackage[]);
      }
    } catch (error) {
      toast.error((error as Error).message || 'Error fetching visits', { autoClose: 2000 });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search and filter
  useEffect(() => {
    let filtered = patientList;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = patientList.filter(patient => 
        patient.visitCode?.toLowerCase().includes(searchLower) ||
        patient.patientname?.toLowerCase().includes(searchLower) ||
        patient.visitId.toString().includes(searchTerm)
      );
    }

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
  }, [currentLab, dateFilter, customStartDate, customEndDate]);

  // Get test items for a patient - FILTER ONLY COMPLETED TESTS
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
    
    // Filter to only include completed tests
    const completedIndividualTests = individualTests.filter(test => {
      const testResult = patient.testResult?.find(tr => tr.testId === test.id);
      return testResult?.reportStatus === 'Completed';
    });
    
    // Get completed test IDs from packages
    const completedPackageTestIds = new Set<number>();
    patient.packageIds.forEach(packageId => {
      const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
      if (packageDetails) {
        packageDetails.tests.forEach(test => {
          const testResult = patient.testResult?.find(tr => tr.testId === test.id);
          if (testResult?.reportStatus === 'Completed') {
            completedPackageTestIds.add(test.id);
          }
        });
      }
    });
    
    return {
      tests: completedIndividualTests,
      hasPackages: patient.packageIds.length > 0,
      completedPackageTestIds: completedPackageTestIds,
    };
  };

  // Handle view report
  const handleViewReport = (patient: Patient) => {
    setViewPatient(patient);
    setViewModel(true);
  };

  // Handle edit report
  const handleEditReport = (patient: Patient, testId: number) => {
    const visitTest = patient.tests?.find((t) => t.id === testId);
    let test: TestList | null = visitTest
      ? {
          id: visitTest.id,
          name: visitTest.name,
          price: 0,
          category: '',
        }
      : null;
    
    if (!test) {
      for (const packageId of patient.packageIds) {
        const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
        if (packageDetails) {
          const packageTest = packageDetails.tests.find((t) => t.id === testId);
          if (packageTest) {
            test = {
              id: packageTest.id,
              name: packageTest.name,
              price: packageTest.price,
              category: packageTest.category || '',
            };
            break;
          }
        }
      }
    }

    if (!test) return;

    const testResult = patient.testResult?.find(tr => tr.testId === testId);
    if (!testResult || !testResult.reportId) {
      toast.error('Report ID missing for this test.');
      return;
    }

    setEditPatient(patient);
    setEditTest(test);
    setEditReportId(testResult.reportId);
    setEditModel(true);
  };

  // Check if user has permission for actions
  const canEdit = isAdmin || isSuperAdmin;
  const canView = true;

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
      render: () => (
        <span className="inline-flex rounded-full bg-success-50 px-3 py-1 text-p2 font-medium text-success-900 border border-success-900">
          Completed
        </span>
      ),
    },
    {
      header: "Tests/Package",
      accessor: "title",
      render: (row: Patient) => {
        const { tests, hasPackages, completedPackageTestIds } = getPatientTestItems(row);
        
        const isExpanded = expandedRow === row.visitId.toString();
        const displayTests = isExpanded ? tests : tests.slice(0, 3);
        const hasMoreTests = tests.length > 3;

        const toggleSection = (key: string) => {
          setExpandedSections(prev => ({
            ...prev,
            [key]: !prev[key]
          }));
        };

        // If only individual tests (no packages)
        if (!hasPackages) {
          return (
            <div className="flex flex-col gap-1 min-w-[250px] max-w-[350px]">
              {displayTests.map((test) => (
                <div key={test.id} className="flex items-center gap-1 py-1">
                  <span className="bg-success-50 text-success-900 px-2 py-1 rounded-full text-p2 inline-block w-fit">
                    {test.name}
                  </span>
                  {/* Only show Edit button if user has permission */}
                  {canEdit && (
                    <button
                      onClick={() => handleEditReport(row, test.id)}
                      className="text-blue-600"
                    >
                      <Edit size={20} />
                    </button>
                  )}
                </div>
              ))}
              
              {hasMoreTests && (
                <button
                  onClick={() => setExpandedRow(isExpanded ? null : row.visitId.toString())}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
                >
                  {isExpanded ? 'Show Less' : `View All (${tests.length})`}
                </button>
              )}
            </div>
          );
        }

        // If there are packages
        return (
          <div className="flex flex-col gap-2 min-w-[250px] max-w-[350px]">
            {/* Individual tests section */}
            {tests.length > 0 && (
              <div className="flex flex-col gap-1">
                {displayTests.map((test) => (
                  <div key={test.id} className="flex items-center gap-1 py-1">
                    <span className="bg-success-50 text-success-900 px-2 py-1 rounded-full text-p2 inline-block w-fit">
                      {test.name}
                    </span>
                    {/* Only show Edit button if user has permission */}
                    {canEdit && (
                      <button
                        onClick={() => handleEditReport(row, test.id)}
                        className="text-blue-600"
                      >
                        <Edit size={20} />
                      </button>
                    )}
                  </div>
                ))}
                
                {hasMoreTests && (
                  <button
                    onClick={() => setExpandedRow(isExpanded ? null : row.visitId.toString())}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
                  >
                    {isExpanded ? 'Show Less' : `View All (${tests.length})`}
                  </button>
                )}
              </div>
            )}

            {/* Divider when both sections exist */}
            {tests.length > 0 && hasPackages && (
              <div className="border-t border-white"></div>
            )}

            {/* Packages section - only show packages that have completed tests */}
            {hasPackages && (
              <div className="flex flex-col gap-2">
                {row.packageIds.map((packageId) => {
                  const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
                  if (!packageDetails) return null;

                  // Filter to only show completed tests in this package
                  const completedTestsInPackage = packageDetails.tests.filter(test => 
                    completedPackageTestIds.has(test.id)
                  );

                  // Skip this package if it has no completed tests
                  if (completedTestsInPackage.length === 0) return null;

                  const isPackageExpanded = expandedSections[`package-${row.visitId}-${packageId}`] || false;

                  return (
                    <div key={packageDetails.id} className="flex flex-col">
                      {/* Package dropdown button */}
                      <button
                        onClick={() => toggleSection(`package-${row.visitId}-${packageId}`)}
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2
                        ${isPackageExpanded
                            ? "border-secondary-300 bg-secondary-50 rounded-b-none border-b-0"
                            : "border-secondary-200 bg-secondary-50"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Package size={16} />
                          <span className="font-medium text-label-l4 text-pneutral-900">
                            {packageDetails.packageName}
                          </span>
                          <span className="text-xs text-success-700">
                            ({completedTestsInPackage.length}/{packageDetails.tests.length})
                          </span>
                        </div>
                        {isPackageExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {/* Package tests - shown when expanded */}
                      {isPackageExpanded && (
                        <div className="w-full rounded-xl rounded-t-none border border-t-0 border-secondary-300 bg-pneutral-50 p-3">
                          <div className="flex flex-col gap-1.5">
                            {completedTestsInPackage.map((test, index) => (
                              <div key={index} className="flex items-center gap-1 py-1">
                                <span className="bg-success-50 text-success-900 px-2 py-1 rounded-full text-p2 inline-block w-fit">
                                  {test.name}
                                </span>
                                {/* Only show Edit button if user has permission */}
                                {canEdit && (
                                  <button
                                    onClick={() => handleEditReport(row, test.id)}
                                    className="text-blue-600"
                                  >
                                    <Edit size={20} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }).filter(Boolean)}
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
        <div className="flex items-center gap-2">
          {canView && (
            <button
              onClick={() => handleViewReport(row)}
              className="p-1.5 text-info-500 hover:text-info-700 transition-colors rounded hover:bg-info-50"
              title="View Report"
            >
              <Eye size={20} />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader type="progress" fullScreen={false} text="Loading completed tests..." />
        <p className="mt-4 text-sm text-gray-500">Fetching the latest completed tests...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-pneutral-900">
          Completed Tests
        </h1>
        <p className="mt-1 text-sm text-pneutral-500">
          View and manage completed test reports
        </p>
      </div>

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
              {searchTerm ? `No results found for "${searchTerm}"` : "No completed tests found"}
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

      {viewModel && viewPatient && (
        <NewModal
          isOpen={viewModel}
          title="View Report"
          onClose={() => {
            setViewModel(false);
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
            showAiInsights={false}
          />
        </NewModal>
      )}

      {editModel && editPatient && editTest && editReportId !== null && (
        <NewModal
          isOpen={editModel}
          title={`Edit Report - ${editTest.name}`}
          onClose={() => {
            setEditModel(false);
            setEditPatient(null);
            setEditTest(null);
            setEditReportId(null);
          }}
          modalClassName="max-w-6xl max-h-[90vh] rounded-lg overflow-y-auto overflow-y-auto"
        >
          <Editreport
            editPatient={editPatient}
            selectedTest={editTest}
            reportId={editReportId}
            setShowModal={(value) => {
              setEditModel((prev) => {
                const next = typeof value === 'function' ? value(prev) : value;
                if (!next) {
                  setEditPatient(null);
                  setEditTest(null);
                  setEditReportId(null);

                  // 🔥 NOTIFY PARENT TO REFRESH OTHER TABLES
                  if (onReportEdited) {
                    onReportEdited();
                  }
                }
                return next;
              });
            }}
            refreshReports={fetchVisits}
          />
        </NewModal>
      )}
    </div>
  );
};

export default CompletedTable;







// working code but without refresh datat dated 02.07.2026............

// "use client";

// import React, { useEffect, useState} from "react";
// import {
//   Search,
//   Edit,
//   Eye,
//   Package,
//   ChevronDown,
//   ChevronUp,
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
// import { getCollectedCompleted } from '../../../../../../services/sampleServices';
// import ViewReport from './Report/ViewReport';
// import Editreport from '@/app/(admin)/dashboard/sample/_component/Report/Editreport';

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
//   visitCode?: string;
//   patientname: string;
//   visitDate: string;
//   visitStatus: string;
//   sampleNames: string[];
//   tests?: Array<{
//     id: number;
//     name: string;
//   }>;
//   packageIds: number[];
//   contactNumber?: string;
//   gender?: string;
//   email?: string;
//   dateOfBirth?: string;
//   testResult?: TestResult[];
//   doctorName?: string;
//   visitType?: string;
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
//   reportId?: number;
// }

// type SortOption = 'patientName' | 'patientId';

// interface CompletedTableProps {
//   closeModal?: () => void;
//   onDataUpdate?: (count: number) => void;
//   onDateFilterChange?: (filter: DateFilterOption, startDate?: Date | null, endDate?: Date | null) => void;
// }

// const CompletedTable: React.FC<CompletedTableProps> = ({ onDataUpdate, onDateFilterChange }) => {
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
//   const [isLoading, setIsLoading] = useState(false);
//   const [sortBy, setSortBy] = useState<SortOption>('patientId');
  
//   // Modal states
//   const [viewModel, setViewModel] = useState(false);
//   const [editModel, setEditModel] = useState(false);
//   const [viewPatient, setViewPatient] = useState<Patient | null>(null);
//   const [editPatient, setEditPatient] = useState<Patient | null>(null);
//   const [editTest, setEditTest] = useState<TestList | null>(null);
//   const [editReportId, setEditReportId] = useState<number | null>(null);
  
//   // Expanded row state for individual tests
//   const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
//   // Expanded sections state for package dropdowns
//   const [expandedSections, setExpandedSections] = useState<{
//     [key: string]: boolean;
//   }>({});
  
// useEffect(() => {
//   if (onDataUpdate) {
//     // Count individual completed tests across all patients
//     const totalCompletedTests = filteredPatients.reduce((total, patient) => {
//       if (!patient.testResult) return total;
      
//       // Count all tests with reportStatus === 'Completed'
//       const completedTests = patient.testResult.filter(
//         tr => tr.reportStatus === 'Completed'
//       ).length;
      
//       return total + completedTests;
//     }, 0);
    
//     onDataUpdate(totalCompletedTests);
//   }
// }, [filteredPatients, onDataUpdate]);

//    useEffect(() => {
//     if (onDateFilterChange) {
//       onDateFilterChange(dateFilter, customStartDate, customEndDate);
//     }
//   }, [dateFilter, customStartDate, customEndDate, onDateFilterChange]);

//   // Fetch visits data
//   const fetchVisits = async () => {
//     if (!currentLab?.id) return;

//     try {
//       setIsLoading(true);
//       const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);

//       if (!startDate || !endDate) return;

//       const response = await getCollectedCompleted(
//         currentLab.id,
//         formatDateForAPI(startDate),
//         formatDateForAPI(endDate),
//       );

//       // Filter to show visits where AT LEAST ONE test is completed
//       const completedVisits = response.filter(visit => {
//         if (!visit.testResult || visit.testResult.length === 0) {
//           return false;
//         }
//         const hasCompletedTest = visit.testResult.some(tr => tr.reportStatus === 'Completed');
//         return hasCompletedTest;
//       });

//       const sortedVisits = completedVisits.sort((a, b) => {
//         const aLatestCompletion = a.testResult?.reduce((latest, tr) => {
//           if (tr.reportStatus === 'Completed' && tr.updatedAt) {
//             const updatedAt = new Date(tr.updatedAt).getTime();
//             return updatedAt > latest ? updatedAt : latest;
//           }
//           return latest;
//         }, 0) || 0;
        
//         const bLatestCompletion = b.testResult?.reduce((latest, tr) => {
//           if (tr.reportStatus === 'Completed' && tr.updatedAt) {
//             const updatedAt = new Date(tr.updatedAt).getTime();
//             return updatedAt > latest ? updatedAt : latest;
//           }
//           return latest;
//         }, 0) || 0;
        
//         if (aLatestCompletion > 0 && bLatestCompletion > 0) {
//           return bLatestCompletion - aLatestCompletion;
//         }
//         if (aLatestCompletion > 0 && bLatestCompletion === 0) {
//           return -1;
//         }
//         if (bLatestCompletion > 0 && aLatestCompletion === 0) {
//           return 1;
//         }
//         return new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime();
//       });

//       const normalizedVisits = sortedVisits.map(visit => ({
//         ...visit,
//         doctorName: visit.doctorName ?? '',
//         visitType: visit.visitType ?? '',
//       }));

//       setPatientList(normalizedVisits);
//       setFilteredPatients(normalizedVisits);

//       // Fetch health packages
//       const uniquePackageIds = Array.from(new Set(sortedVisits.flatMap((visit) => visit.packageIds)));
//       if (uniquePackageIds.length > 0) {
//         const fetchedPackages = await Promise.all(
//           uniquePackageIds.map((packageId) =>
//             getHealthPackageById(currentLab.id, packageId)
//               .catch(() => ({ data: null }))
//           )
//         );
//         setHealthPackages(fetchedPackages.map(pkg => pkg?.data).filter(Boolean) as HealthPackage[]);
//       }
//     } catch (error) {
//       toast.error((error as Error).message || 'Error fetching visits', { autoClose: 2000 });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle search and filter
//   useEffect(() => {
//     let filtered = patientList;

//     if (searchTerm.trim()) {
//       const searchLower = searchTerm.toLowerCase();
//       filtered = patientList.filter(patient => 
//         patient.visitCode?.toLowerCase().includes(searchLower) ||
//         patient.patientname?.toLowerCase().includes(searchLower) ||
//         patient.visitId.toString().includes(searchTerm)
//       );
//     }

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
//   }, [currentLab, dateFilter, customStartDate, customEndDate]);

//   // Get test items for a patient - FILTER ONLY COMPLETED TESTS
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
    
//     // Filter to only include completed tests
//     const completedIndividualTests = individualTests.filter(test => {
//       const testResult = patient.testResult?.find(tr => tr.testId === test.id);
//       return testResult?.reportStatus === 'Completed';
//     });
    
//     // Get completed test IDs from packages
//     const completedPackageTestIds = new Set<number>();
//     patient.packageIds.forEach(packageId => {
//       const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//       if (packageDetails) {
//         packageDetails.tests.forEach(test => {
//           const testResult = patient.testResult?.find(tr => tr.testId === test.id);
//           if (testResult?.reportStatus === 'Completed') {
//             completedPackageTestIds.add(test.id);
//           }
//         });
//       }
//     });
    
//     return {
//       tests: completedIndividualTests,
//       hasPackages: patient.packageIds.length > 0,
//       completedPackageTestIds: completedPackageTestIds,
//     };
//   };

//   // Handle view report
//   const handleViewReport = (patient: Patient) => {
//     setViewPatient(patient);
//     setViewModel(true);
//   };

//   // Handle edit report
//   const handleEditReport = (patient: Patient, testId: number) => {
//     const visitTest = patient.tests?.find((t) => t.id === testId);
//     let test: TestList | null = visitTest
//       ? {
//           id: visitTest.id,
//           name: visitTest.name,
//           price: 0,
//           category: '',
//         }
//       : null;
    
//     if (!test) {
//       for (const packageId of patient.packageIds) {
//         const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//         if (packageDetails) {
//           const packageTest = packageDetails.tests.find((t) => t.id === testId);
//           if (packageTest) {
//             test = {
//               id: packageTest.id,
//               name: packageTest.name,
//               price: packageTest.price,
//               category: packageTest.category || '',
//             };
//             break;
//           }
//         }
//       }
//     }

//     if (!test) return;

//     const testResult = patient.testResult?.find(tr => tr.testId === testId);
//     if (!testResult || !testResult.reportId) {
//       toast.error('Report ID missing for this test.');
//       return;
//     }

//     setEditPatient(patient);
//     setEditTest(test);
//     setEditReportId(testResult.reportId);
//     setEditModel(true);
//   };

//   // Check if user has permission for actions
//   const canEdit = isAdmin || isSuperAdmin;
//   const canView = true;

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
//       header: "Status",
//       accessor: "status",
//       render: () => (
//         <span className="inline-flex rounded-full bg-success-50 px-3 py-1 text-p2 font-medium text-success-900 border border-success-900">
//           Completed
//         </span>
//       ),
//     },
//     {
//   header: "Tests/Package",
//   accessor: "title",
//   render: (row: Patient) => {
//     const { tests, hasPackages, completedPackageTestIds } = getPatientTestItems(row);
    
//     const isExpanded = expandedRow === row.visitId.toString();
//     const displayTests = isExpanded ? tests : tests.slice(0, 3);
//     const hasMoreTests = tests.length > 3;

//     const toggleSection = (key: string) => {
//       setExpandedSections(prev => ({
//         ...prev,
//         [key]: !prev[key]
//       }));
//     };

//     // If only individual tests (no packages)
//     if (!hasPackages) {
//       return (
//         <div className="flex flex-col gap-1 min-w-[250px] max-w-[350px]">
//           {displayTests.map((test) => (
//             <div key={test.id} className="flex items-center gap-1 py-1">
//               <span className="bg-success-50 text-success-900 px-2 py-1 rounded-full text-p2 inline-block w-fit">
//                 {test.name}
//               </span>
//               {/* Only show Edit button if user has permission */}
//               {canEdit && (
//                 <button
//                   onClick={() => handleEditReport(row, test.id)}
//                   className="text-blue-600"
//                 >
//                   <Edit size={20} />
//                 </button>
//               )}
//             </div>
//           ))}
          
//           {hasMoreTests && (
//             <button
//               onClick={() => setExpandedRow(isExpanded ? null : row.visitId.toString())}
//               className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
//             >
//               {isExpanded ? 'Show Less' : `View All (${tests.length})`}
//             </button>
//           )}
//         </div>
//       );
//     }

//     // If there are packages
//     return (
//       <div className="flex flex-col gap-2 min-w-[250px] max-w-[350px]">
//         {/* Individual tests section */}
//         {tests.length > 0 && (
//           <div className="flex flex-col gap-1">
//             {displayTests.map((test) => (
//               <div key={test.id} className="flex items-center gap-1 py-1">
//                 <span className="bg-success-50 text-success-900 px-2 py-1 rounded-full text-p2 inline-block w-fit">
//                   {test.name}
//                 </span>
//                 {/* Only show Edit button if user has permission */}
//                 {canEdit && (
//                   <button
//                     onClick={() => handleEditReport(row, test.id)}
//                     className="text-blue-600"
//                   >
//                     <Edit size={20} />
//                   </button>
//                 )}
//               </div>
//             ))}
            
//             {hasMoreTests && (
//               <button
//                 onClick={() => setExpandedRow(isExpanded ? null : row.visitId.toString())}
//                 className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
//               >
//                 {isExpanded ? 'Show Less' : `View All (${tests.length})`}
//               </button>
//             )}
//           </div>
//         )}

//         {/* Divider when both sections exist */}
//         {tests.length > 0 && hasPackages && (
//           <div className="border-t border-white"></div>
//         )}

//         {/* Packages section - only show packages that have completed tests */}
//         {hasPackages && (
//           <div className="flex flex-col gap-2">
//             {row.packageIds.map((packageId) => {
//               const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//               if (!packageDetails) return null;

//               // Filter to only show completed tests in this package
//               const completedTestsInPackage = packageDetails.tests.filter(test => 
//                 completedPackageTestIds.has(test.id)
//               );

//               // Skip this package if it has no completed tests
//               if (completedTestsInPackage.length === 0) return null;

//               const isPackageExpanded = expandedSections[`package-${row.visitId}-${packageId}`] || false;

//               return (
//                 <div key={packageDetails.id} className="flex flex-col">
//                   {/* Package dropdown button */}
//                   <button
//                     onClick={() => toggleSection(`package-${row.visitId}-${packageId}`)}
//                     className={`flex w-full items-center justify-between rounded-xl border px-3 py-2
//                     ${isPackageExpanded
//                         ? "border-secondary-300 bg-secondary-50 rounded-b-none border-b-0"
//                         : "border-secondary-200 bg-secondary-50"
//                       }`}
//                   >
//                     <div className="flex items-center gap-2">
//                       <Package size={16} />
//                       <span className="font-medium text-label-l4 text-pneutral-900">
//                         {packageDetails.packageName}
//                       </span>
//                       <span className="text-xs text-success-700">
//                         ({completedTestsInPackage.length}/{packageDetails.tests.length})
//                       </span>
//                     </div>
//                     {isPackageExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//                   </button>

//                   {/* Package tests - shown when expanded */}
//                   {isPackageExpanded && (
//                     <div className="w-full rounded-xl rounded-t-none border border-t-0 border-secondary-300 bg-pneutral-50 p-3">
//                       <div className="flex flex-col gap-1.5">
//                         {completedTestsInPackage.map((test, index) => (
//                           <div key={index} className="flex items-center gap-1 py-1">
//                             <span className="bg-success-50 text-success-900 px-2 py-1 rounded-full text-p2 inline-block w-fit">
//                               {test.name}
//                             </span>
//                             {/* Only show Edit button if user has permission */}
//                             {canEdit && (
//                               <button
//                                 onClick={() => handleEditReport(row, test.id)}
//                                 className="text-blue-600"
//                               >
//                                 <Edit size={20} />
//                               </button>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             }).filter(Boolean)}
//           </div>
//         )}
//       </div>
//     );
//   },
// },
//     {
//       header: "Actions",
//       accessor: "actions",
//       render: (row: Patient) => (
//         <div className="flex items-center gap-2">
//           {/* {canEdit && (
//             <button
//               onClick={() => {
//                 const completedTest = row.testResult?.find(tr => tr.reportStatus === 'Completed');
//                 if (completedTest) {
//                   handleEditReport(row, completedTest.testId);
//                 }
//               }}
//               className="p-1.5 text-blue-600 hover:text-blue-800 transition-colors rounded hover:bg-blue-50"
//               title="Edit Report"
//             >
//               <Edit size={16} />
//             </button>
//           )} */}
//           {canView && (
//             <button
//               onClick={() => handleViewReport(row)}
//               className="p-1.5 text-info-500 hover:text-info-700 transition-colors rounded hover:bg-info-50"
//               title="View Report"
//             >
//               <Eye size={20} />
//             </button>
//           )}
//         </div>
//       ),
//     },
//   ];

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64">
//         <Loader type="progress" fullScreen={false} text="Loading completed tests..." />
//         <p className="mt-4 text-sm text-gray-500">Fetching the latest completed tests...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full">
//       <div className="mb-5">
//         <h1 className="text-2xl font-semibold text-pneutral-900">
//           Completed Tests
//         </h1>
//         <p className="mt-1 text-sm text-pneutral-500">
//           View and manage completed test reports
//         </p>
//       </div>

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
//               {searchTerm ? `No results found for "${searchTerm}"` : "No completed tests found"}
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

//       {viewModel && viewPatient && (
//         <NewModal
//           isOpen={viewModel}
//           title="View Report"
//           onClose={() => {
//             setViewModel(false);
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

//       {editModel && editPatient && editTest && editReportId !== null && (
//         <NewModal
//           isOpen={editModel}
//           title={`Edit Report - ${editTest.name}`}
//           onClose={() => {
//             setEditModel(false);
//             setEditPatient(null);
//             setEditTest(null);
//             setEditReportId(null);
//           }}
//           modalClassName="max-w-6xl max-h-[90vh] rounded-lg overflow-y-auto overflow-y-auto"
//         >
//           <Editreport
//             editPatient={editPatient}
//             selectedTest={editTest}
//             reportId={editReportId}
//             setShowModal={(value) => {
//               setEditModel((prev) => {
//                 const next = typeof value === 'function' ? value(prev) : value;
//                 if (!next) {
//                   setEditPatient(null);
//                   setEditTest(null);
//                   setEditReportId(null);
//                 }
//                 return next;
//               });
//             }}
//             refreshReports={fetchVisits}
//           />
//         </NewModal>
//       )}
//     </div>
//   );
// };

// export default CompletedTable;





















// code done by abhishek.......................(do not change)...............

// import { getHealthPackageById } from '@/../services/packageServices';
// import Loader from '@/app/(admin)/component/common/Loader';
// import Modal from '@/app/(admin)/component/common/Model';
// import Pagination from '@/app/(admin)/component/common/Pagination';
// import TableComponent from '@/app/(admin)/component/common/TableComponent';
// import { useLabs } from '@/context/LabContext';
// import { useAuth } from '@/hooks/useAuth';
// import { TestList } from '@/types/test/testlist';
// import { DATE_FILTER_OPTIONS, DateFilterOption, formatDateForAPI, formatDisplayDate, getDateRange } from '@/utils/dateUtils';
// import React, { useEffect, useMemo, useState } from 'react';
// import { FiCalendar } from 'react-icons/fi';
// import { TbEdit, TbReport } from 'react-icons/tb';
// import { FaTimes, FaVial } from 'react-icons/fa';
// import { toast } from 'react-toastify';
// import { getCollectedCompleted } from '../../../../../../services/sampleServices';
// import ViewReport from './Report/ViewReport';
// import Editreport from '@/app/(admin)/dashboard/sample/_component/Report/Editreport';

// interface Patient {
//     visitId: number;
//     visitCode?: string;
//     patientname: string;
//     visitDate: string;
//     visitStatus: string;
//     sampleNames: string[];
//     tests?: Array<{
//         id: number;
//         name: string;
//     }>;
//     packageIds: number[];
//     contactNumber?: string;
//     gender?: string;
//     email?: string;
//     dateOfBirth?: string;
//     testResult?: TestResult[];
//     doctorName?: string;
//     visitType?: string;
// }

// // Test result interface for individual test results
// interface TestResult {
//     id: number;
//     testId: number;
//     isFilled: boolean;
//     reportStatus: string;
//     createdBy: string;
//     updatedBy: string;
//     createdAt: string;
//     updatedAt: string;
//     reportId?: number;
// }
// interface HealthPackage {
//     id: number;
//     packageName: string;
//     tests: Array<{
//         id: number;
//         name: string;
//         price: number;
//         category?: string;
//     }>;
// }



// interface CompletedTableProps {
//     closeModal?: () => void;
// }

// const CompletedTable: React.FC<CompletedTableProps> = ({ closeModal }) => {
//     const { currentLab } = useLabs();
//     const { isAdmin, isSuperAdmin } = useAuth();
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const [patientList, setPatientList] = useState<Patient[]>([]);
//     const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
//     const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [ViewModel, setViewModel] = useState(false);
//     const [editModel, setEditModel] = useState(false);
//     const itemsPerPage = 8;
//     const [editPatient, setEditPatient] = useState<Patient | null>(null);
//     const [editTest, setEditTest] = useState<TestList | null>(null);
//     const [editReportId, setEditReportId] = useState<number | null>(null);
//     const [viewPatient, setViewPatient] = useState<Patient | null>(null);
//     const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
//     const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
//     const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
//     const [isLoading, setIsLoading] = useState(false);
    
//     // State for expanded rows
//     const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

//     const handleFilterChange = (filter: DateFilterOption) => {
//         setDateFilter(filter);
//     };

//     // Toggle row expansion
//     const toggleRowExpansion = (visitId: number, columnType: 'tests' | 'packages') => {
//         const key = `${visitId}-${columnType}`;
        
//         setExpandedRows(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(key)) {
//                 newSet.delete(key);
//             } else {
//                 newSet.add(key);
//             }
//             return newSet;
//         });
//     };

//     const fetchVisits = async () => {
//         try {
//             if (!currentLab?.id) return;

//             setIsLoading(true);
//             const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);

//             if (!startDate || !endDate) return;

//             const formattedStart = formatDateForAPI(startDate);
//             const formattedEnd = formatDateForAPI(endDate);

//             const response = await getCollectedCompleted(
//                 currentLab.id,
//                 formattedStart,
//                 formattedEnd,
//             );

//             // Filter to show visits where ANY test has reportStatus "Completed"
//             const completedVisits = response.filter(visit => {
//                 if (!visit.testResult || visit.testResult.length === 0) {
//                     return false; // Skip visits without test results
//                 }

//                 // Check if ANY test has reportStatus "Completed"
//                 const hasAnyCompletedTest = visit.testResult.some(tr => tr.reportStatus === 'Completed');
//                 return hasAnyCompletedTest; // Show visits where at least one test is completed
//             });

//             const sortedVisits = completedVisits.sort((a, b) => {
//                 // First sort by the most recent test completion date
//                 const aLatestCompletion = a.testResult?.reduce((latest, tr) => {
//                     if (tr.reportStatus === 'Completed' && tr.updatedAt) {
//                         const updatedAt = new Date(tr.updatedAt).getTime();
//                         return updatedAt > latest ? updatedAt : latest;
//                     }
//                     return latest;
//                 }, 0) || 0;
                
//                 const bLatestCompletion = b.testResult?.reduce((latest, tr) => {
//                     if (tr.reportStatus === 'Completed' && tr.updatedAt) {
//                         const updatedAt = new Date(tr.updatedAt).getTime();
//                         return updatedAt > latest ? updatedAt : latest;
//                     }
//                     return latest;
//                 }, 0) || 0;
                
//                 // If both have completion dates, sort by most recent completion
//                 if (aLatestCompletion > 0 && bLatestCompletion > 0) {
//                     return bLatestCompletion - aLatestCompletion;
//                 }
                
//                 // If only one has completion date, prioritize it
//                 if (aLatestCompletion > 0 && bLatestCompletion === 0) {
//                     return -1;
//                 }
//                 if (bLatestCompletion > 0 && aLatestCompletion === 0) {
//                     return 1;
//                 }
                
//                 // Fallback to visit date sorting
//                 return new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime();
//             });

//             setPatientList(sortedVisits);
//             setFilteredPatients(sortedVisits);

//             const uniquePackageIds = Array.from(new Set(sortedVisits.flatMap((visit) => visit.packageIds)));

//             const fetchedPackages = await Promise.all(
//                 uniquePackageIds.map((packageId) =>
//                     getHealthPackageById(currentLab.id, packageId)
//                         .catch(() => ({ data: null }))
//                 )
//             );
//             setHealthPackages(fetchedPackages.map(pkg => pkg?.data).filter(Boolean) as HealthPackage[]);
//         } catch (error) {
//             toast.error((error as Error).message || 'Error fetching visits', { autoClose: 2000 });
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         localStorage.setItem('completedTestsDateFilter', dateFilter);
//         fetchVisits();
//     }, [currentLab, dateFilter, customStartDate, customEndDate]);

//     const totalPages = useMemo(() => Math.ceil(filteredPatients.length / itemsPerPage), [filteredPatients.length]);
//     const paginatedPatients = useMemo(() => {
//         return filteredPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
//     }, [filteredPatients, currentPage]);

//     const handleOpenReportModal = (patient: Patient) => {
//         setViewModel(true);
//         setViewPatient(patient);
//     };

//     const resolveTestForPatient = (patient: Patient, testId: number): TestList | null => {
//         const visitTest = patient.tests?.find((t) => t.id === testId);
//         if (visitTest) {
//             return {
//                 id: visitTest.id,
//                 name: visitTest.name,
//                 price: 0,
//                 category: '',
//             };
//         }

//         for (const packageId of patient.packageIds) {
//             const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//             if (!packageDetails) continue;
//             const packageTest = packageDetails.tests.find((t) => t.id === testId);
//             if (packageTest) {
//                 return {
//                     id: packageTest.id,
//                     name: packageTest.name,
//                     price: packageTest.price,
//                     category: packageTest.category || '',
//                 };
//             }
//         }

//         return null;
//     };

//     const handleEditReport = (patient: Patient, testId: number) => {
//         const test = resolveTestForPatient(patient, testId);
//         if (!test) return;
//         const testResult = patient.testResult?.find(tr => tr.testId === testId);
//         if (!testResult || !testResult.reportId) {
//             toast.error('Report ID missing for this test.');
//             return;
//         }

//         setEditModel(true);
//         setEditPatient(patient);
//         setEditTest(test);
//         setEditReportId(testResult.reportId);
//     };

//     const columns = [
//     {
//         header: 'ID',
//         accessor: (row: Patient) => row.visitCode || row.visitId
//     },
//     {
//         header: 'Patient',
//         accessor: (row: Patient) => (
//             <div className="flex flex-col gap-1">
//                 <span className="font-medium text-gray-900">{row.patientname}</span>
//                 <div className="flex items-center gap-1 text-gray-500 bg-blue-50 px-2 py-1 rounded-full w-fit">
//                     <FiCalendar className="w-3 h-3 opacity-70" />
//                     <span className="text-xs font-medium">{formatDisplayDate(row.visitDate)}</span>
//                 </div>
//             </div>
//         )
//     },
//         {
//             header: 'Status',
//             accessor: (row: Patient) => {
//                 if (!row.testResult || row.testResult.length === 0) {
//                     return (
//                         <span className={'bg-gray-100 text-gray-800 rounded-full text-xs truncate'}>
//                             <span className="px-2 py-1 rounded-full text-xs font-semibold">No Results</span>
//                         </span>
//                     );
//                 }

//                 const totalTests = row.testResult.length;
//                 const completedTests = row.testResult.filter(tr => tr.reportStatus === 'Completed').length;

//                 if (completedTests === totalTests) {
//                     // If there's only 1 test and it's completed, show "Completed"
//                     // If there are multiple tests and all are completed, show "All Completed"
//                     const statusText = totalTests === 1 ? 'Completed' : 'All Completed';
//                     return (
//                         <span className={'bg-green-100 text-green-800 rounded-full text-xs truncate'}>
//                             <span className="px-2 py-1 rounded-full text-xs font-semibold">{statusText}</span>
//                         </span>
//                     );
//                 } else {
//                     return (
//                         <span className={'bg-blue-100 text-blue-800 rounded-full text-xs truncate'}>
//                             <span className="px-2 py-1 rounded-full text-xs font-semibold">{completedTests}/{totalTests} Completed</span>
//                         </span>
//                     );
//                 }
//             }
//         },
//         {
//             header: 'Tests',
//             accessor: (row: Patient) => {
//                 // Get all test IDs that belong to packages
//                 const packageTestIds = new Set<number>();
//                 row.packageIds.forEach(packageId => {
//                     const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//                     if (packageDetails) {
//                         packageDetails.tests.forEach(test => {
//                             packageTestIds.add(test.id);
//                         });
//                     }
//                 });

//                 const visitTests = row.tests || [];
//                 // Filter out tests that belong to packages from individual tests
//                 const individualTests = visitTests.filter(test =>
//                     !packageTestIds.has(test.id)
//                 );

//                 const isExpanded = expandedRows.has(`${row.visitId}-tests`);
//                 const displayTests = isExpanded ? individualTests : individualTests.slice(0, 3);
//                 const hasMoreTests = individualTests.length > 3;
                
//                 // Count completed tests for display
//                 const completedTestCount = individualTests.filter(test => {
//                     const testResult = row.testResult?.find(tr => tr.testId === test.id);
//                     return testResult && testResult.isFilled && testResult.reportStatus === 'Completed';
//                 }).length;

//                 return (
//                     <div className="flex flex-col gap-1 min-w-[250px] max-w-[350px]">
//                         {displayTests.map((test) => {
//                             const testResult = row.testResult?.find(tr => tr.testId === test.id);

//                             // Only show tests that have progress (completed or in progress), skip pending ones
//                             if (!testResult || (!testResult.isFilled && testResult.reportStatus === 'Pending')) {
//                                 return null;
//                             }

//                             // Determine test status
//                             let statusColor = 'bg-blue-100 text-blue-800';
//                             let statusText = 'In Progress';

//                             if (testResult.reportStatus === 'Completed') {
//                                 statusColor = 'bg-green-100 text-green-800';
//                                 statusText = 'Completed';
//                             }

//                             return (
//                                 <div key={test.id} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-b-0">
//                                     <span className={`${statusColor} px-2 py-0.5 rounded-full text-xs inline-block w-fit`}>
//                                         {test.name}
//                                     </span>
//                                     <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor.replace('100', '200')}`}>
//                                         {statusText}
//                                     </span>
//                                     {/* Show checkmark for completed tests */}
//                                     {testResult.reportStatus === 'Completed' && (
//                                         <span
//                                             className="text-xs px-1 py-0.5 rounded cursor-help bg-green-100 text-green-700 border border-green-200"
//                                             title={`Test completed - ${testResult.reportStatus}`}
//                                         >
//                                             ✓
//                                         </span>
//                                     )}
//                                     {testResult.reportStatus === 'Completed' && (isAdmin || isSuperAdmin) && (
//                                         <button
//                                             onClick={() => handleEditReport(row, test.id)}
//                                             className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
//                                             title={`Edit report for ${test.name}`}
//                                         >
//                                             <TbEdit className="h-3 w-3" />
//                                             Edit
//                                         </button>
//                                     )}
//                                 </div>
//                             );
//                         }).filter(Boolean)}
                        
//                         {hasMoreTests && (
//                             <button
//                                 onClick={() => toggleRowExpansion(row.visitId, 'tests')}
//                                 className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
//                             >
//                                 {isExpanded ? 'Show Less' : `View All (${completedTestCount})`}
//                             </button>
//                         )}
//                     </div>
//                 );
//             }
//         },
//         {
//             header: 'Package',
//             accessor: (row: Patient) => {
//                 if (row.packageIds.length === 0) {
//                     return (
//                         <div className="text-gray-400 text-xs italic">No packages</div>
//                     );
//                 }

//                 const isExpanded = expandedRows.has(`${row.visitId}-packages`);
                
//                 // Calculate total tests and completed tests across all packages
//                 const totalTests = row.packageIds.reduce((total, packageId) => {
//                     const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//                     return total + (packageDetails?.tests?.length || 0);
//                 }, 0);
                
//                 // Count completed tests for display
//                 const completedPackageTestCount = row.packageIds.reduce((total, packageId) => {
//                     const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//                     if (!packageDetails) return total;
                    
//                     return total + packageDetails.tests.filter(test => {
//                         const testResult = row.testResult?.find(tr => tr.testId === test.id);
//                         return testResult && testResult.isFilled && testResult.reportStatus === 'Completed';
//                     }).length;
//                 }, 0);
                
//                 // Show expandable logic if there are more than 3 total tests (even with 1 package)
//                 const hasMoreContent = totalTests > 3;
                
//                 // If expanded, show all packages. If not expanded, show first package with limited tests
//                 let displayPackages: number[];
//                 let displayTests: Array<{
//                     id: number;
//                     name: string;
//                     price: number;
//                     category?: string;
//                 }> | null = null;
                
//                 if (isExpanded) {
//                     // Show all packages and all tests
//                     displayPackages = row.packageIds;
//                 } else {
//                     // Show first package with limited tests
//                     displayPackages = row.packageIds.slice(0, 1);
//                     const firstPackage = healthPackages.find((pkg) => pkg.id === row.packageIds[0]);
//                     if (firstPackage) {
//                         displayTests = firstPackage.tests.slice(0, 3); // Show only first 3 tests
//                     }
//                 }

//                 return (
//                     <div className="flex flex-col gap-2 min-w-[250px] max-w-[350px]">
//                         {displayPackages.map((packageId) => {
//                             const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
//                             if (!packageDetails) return null;

//                             return (
//                                 <div key={packageDetails.id} className="flex flex-col gap-1">
//                                     {/* Package name with icon */}
//                                     <div className="flex items-center gap-1">
//                                         <span className="text-xs">📦</span>
//                                         <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
//                                             {packageDetails.packageName}
//                                         </span>
//                                     </div>

//                                     {/* Package tests */}
//                                     <div className="flex flex-col gap-1 ml-2">
//                                         {(isExpanded ? packageDetails.tests : (displayTests || packageDetails.tests.slice(0, 3))).map((test, index) => {
//                                             // Use the test ID directly from the package test data
//                                             const testId = test.id;
//                                             if (!testId) return null;

//                                             const testResult = row.testResult?.find(tr => tr.testId === testId);

//                                             // Only show tests that have progress (completed or in progress), skip pending ones
//                                             if (!testResult || (!testResult.isFilled && testResult.reportStatus === 'Pending')) {
//                                                 return null;
//                                             }

//                                             // Determine test status
//                                             let statusColor = 'bg-purple-100 text-purple-800';
//                                             let statusText = 'In Progress';

//                                             if (testResult.reportStatus === 'Completed') {
//                                                 statusColor = 'bg-green-100 text-green-800';
//                                                 statusText = 'Completed';
//                                             }

//                                             return (
//                                                 <div key={`${packageDetails.id}-${index}`} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-b-0">
//                                                     <span className={`${statusColor} px-2 py-0.5 rounded-full text-xs inline-block w-fit`}>
//                                                         {test.name}
//                                                     </span>
//                                                     <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor.replace('100', '200')}`}>
//                                                         {statusText}
//                                                     </span>
//                                                     {/* Show checkmark for completed tests */}
//                                                     {testResult.reportStatus === 'Completed' && (
//                                                         <span
//                                                             className="text-xs px-1 py-0.5 rounded cursor-help bg-green-100 text-green-700 border border-green-200"
//                                                             title={`Test completed - ${testResult.reportStatus}`}
//                                                         >
//                                                             ✓
//                                                         </span>
//                                                     )}
//                                                 </div>
//                                             );
//                                         })}
//                                     </div>
//                                 </div>
//                             );
//                         }).filter(Boolean)}
                        
//                         {hasMoreContent && (
//                             <button
//                                 onClick={() => toggleRowExpansion(row.visitId, 'packages')}
//                                 className="text-xs text-purple-600 hover:text-purple-800 font-medium mt-1 w-fit"
//                             >
//                                 {isExpanded ? 'Show Less' : `View All (${completedPackageTestCount})`}
//                             </button>
//                         )}
//                     </div>
//                 );
//             }
//         },
//         {
//             header: 'Actions',
//             accessor: (row: Patient) => (
//                 <div className="flex gap-2">
//                     <button
//                         onClick={() => handleOpenReportModal(row)}
//                         className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
//                         aria-label={`View report for ${row.patientname}`}
//                     >
//                         <TbReport className="w-3 h-3" />
//                         <span>View</span>
//                     </button>
//                 </div>
//             )
//         }
//     ];

//     if (isLoading) {
//         return (
//             <div className="flex flex-col items-center justify-center p-6">
//                 <Loader type="progress" fullScreen={false} text="Loading Completed Samples..." />
//                 <p className="mt-4 text-sm text-gray-600">Fetching the latest Completed  samples...</p>
//             </div>
//         );
//     }
//     return (
//         <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
//                 <div className="flex-1">
//                     <h2 className="text-xl font-semibold text-gray-900">Completed Tests</h2>
//                     <p className="text-xs text-gray-600">View and manage completed test reports</p>
//                 </div>

//                 <div className="flex items-center gap-3">
//                     <div className="flex flex-col sm:flex-row gap-3">
//                         <div className="flex flex-col w-40">
//                             <label className="text-xs font-semibold mb-1 text-gray-600">Date Range:</label>
//                             <select
//                                 value={dateFilter}
//                                 onChange={(e) => handleFilterChange(e.target.value as DateFilterOption)}
//                                 className="border border-blue-300 px-3 py-1.5 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
//                             >
//                                 {DATE_FILTER_OPTIONS.map(option => (
//                                     <option key={option.value} value={option.value}>
//                                         {option.label}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         {dateFilter === 'custom' && (
//                             <>
//                                 <div className="flex flex-col w-40">
//                                     <label className="text-xs font-semibold mb-1 text-gray-600">Start Date:</label>
//                                     <input
//                                         type="date"
//                                         value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
//                                         onChange={(e) => setCustomStartDate(e.target.value ? new Date(e.target.value) : null)}
//                                         className="border border-blue-300 px-3 py-1.5 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
//                                     />
//                                 </div>

//                                 <div className="flex flex-col w-40">
//                                     <label className="text-xs font-semibold mb-1 text-gray-600">End Date:</label>
//                                     <input
//                                         type="date"
//                                         value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
//                                         onChange={(e) => setCustomEndDate(e.target.value ? new Date(e.target.value) : null)}
//                                         className="border border-blue-300 px-3 py-1.5 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
//                                     />
//                                 </div>
//                             </>
//                         )}
//                     </div>
//                     {closeModal && (
//                         <button
//                             onClick={closeModal}
//                             className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//                             title="Close"
//                         >
//                             <FaTimes className="h-5 w-5" />
//                         </button>
//                     )}
//                 </div>
//             </div>

//             <div className="mb-3">
//                 <div className="bg-green-50 p-3 rounded-lg border border-green-100">
//                     <h4 className="font-semibold text-green-800 mb-1 flex items-center">
//                         <FaVial className="mr-2 text-green-600" /> Statistics
//                     </h4>
//                     <p className="text-xs font-medium text-gray-600">
//                         Showing <span className="font-bold text-gray-900">{filteredPatients.length}</span> completed test{filteredPatients.length !== 1 ? 's' : ''}
//                     </p>
//                 </div>
//             </div>

//             {filteredPatients.length === 0 ? (
//                 <div className="text-center py-8 bg-gray-50 rounded-xl shadow-lg border border-gray-200">
//                     <div className="mx-auto w-16 h-16 mb-3 text-gray-300">
//                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                     </div>
//                     <h3 className="text-md font-semibold text-gray-800">No completed tests</h3>
//                     <p className="text-gray-600 text-xs mt-1">No tests found for the selected criteria</p>
//                 </div>
//             ) : (
//                 <>
//                     <div className="overflow-x-auto rounded-xl border border-gray-200">
//                         <TableComponent
//                             data={paginatedPatients}
//                             columns={columns}
//                         />
//                     </div>

//                     {ViewModel && viewPatient && (
//                         <Modal
//                             title='View Report'
//                             isOpen={ViewModel}
//                             onClose={() => setViewModel(false)}
//                             modalClassName='max-w-4xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden'
//                         >
//                             <ViewReport 
//                                 viewPatient={{
//                                     ...viewPatient,
//                                     gender: viewPatient.gender ?? '',
//                                     contactNumber: viewPatient.contactNumber ?? '',
//                                     email: viewPatient.email ?? '',
//                                     doctorName: viewPatient.doctorName ?? '',
//                                     visitType: viewPatient.visitType ?? '',
//                                     visitStatus: viewPatient.visitStatus ?? ''
//                                 }}
//                                 hidePrintButton={false}
//                             />
//                         </Modal>
//                     )}

//                     {editModel && editPatient && editTest && editReportId !== null && (
//                         <Modal
//                             title={`Edit Report - ${editTest.name}`}
//                             isOpen={editModel}
//                             onClose={() => {
//                                 setEditModel(false);
//                                 setEditPatient(null);
//                                 setEditTest(null);
//                                 setEditReportId(null);
//                             }}
//                             modalClassName='max-w-5xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden'
//                         >
//                             <Editreport
//                                 editPatient={editPatient}
//                                 selectedTest={editTest}
//                                 reportId={editReportId}
//                                 setShowModal={(value) => {
//                                     setEditModel((prev) => {
//                                         const next = typeof value === 'function' ? value(prev) : value;
//                                         if (!next) {
//                                             setEditPatient(null);
//                                             setEditTest(null);
//                                             setEditReportId(null);
//                                         }
//                                         return next;
//                                     });
//                                 }}
//                                 refreshReports={fetchVisits}
//                             />

//                         </Modal>
//                     )}
//                     {totalPages > 1 && (
//                         <div className="mt-4 flex justify-center">
//                             <Pagination
//                                 currentPage={currentPage}
//                                 totalPages={totalPages}
//                                 onPageChange={setCurrentPage}
//                             />
//                         </div>
//                     )}
//                 </>
//             )}
//         </div>
//     );
// };

// export default CompletedTable;