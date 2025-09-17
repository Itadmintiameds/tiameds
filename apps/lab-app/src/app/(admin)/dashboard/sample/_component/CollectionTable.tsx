import { getHealthPackageById } from '@/../services/packageServices';
import { getTestById } from '@/../services/testService';
import Loader from '@/app/(admin)/component/common/Loader';
import Modal from '@/app/(admin)/component/common/Model';
import Pagination from '@/app/(admin)/component/common/Pagination';
import TableComponent from '@/app/(admin)/component/common/TableComponent';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import { calculateAge } from '@/utils/ageUtils';
import { DATE_FILTER_OPTIONS, DateFilterOption, formatDateForAPI, formatDisplayDate, getDateRange } from '@/utils/dateUtils';
import html2canvas from 'html2canvas';
import { CalendarDays, Edit, PlusIcon, Download } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import Barcode from 'react-barcode';
import { MdCancelPresentation } from 'react-icons/md';
import { toast } from 'react-toastify';
import { deleteVisitSample, getCollectedCompleted } from '../../../../../../services/sampleServices';
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
  testResult?: TestResult[]; // Add testResult array
}

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

interface UpdateSample {
  visitId: number;
  sampleNames: string[];
}

// Test result interface for individual test results
interface TestResult {
  id: number;
  testId: number;
  isFilled: boolean;
  reportStatus: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}


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
  const [selectedTest, setSelectedTest] = useState<TestList | null>(null);
  const [updateCollectionTable, setUpdateCollectionTable] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  
  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());




  const fetchVisits = async () => {
    try {
      if (!currentLab?.id) return;

      setIsFetching(true);
      const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);

      if (!startDate || !endDate) return;

      const response = await getCollectedCompleted(
        currentLab.id,
        formatDateForAPI(startDate),
        formatDateForAPI(endDate),
      );

             const collectedVisits = response
         .filter(visit => {
           // Filter out visits where all tests are completed
           if (!visit.testResult || visit.testResult.length === 0) {
             return true; // Keep visits without test results
           }
           
           // Check if all tests have reportStatus "Completed"
           const allTestsCompleted = visit.testResult.every(tr => tr.reportStatus === 'Completed');
           return !allTestsCompleted; // Only show visits where not all tests are completed
         })
         .sort((a, b) => {
           // First sort by visit date (latest first)
           const dateComparison = new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime();
           if (dateComparison !== 0) return dateComparison;
           
           // If dates are the same, sort by visit ID (highest first for latest)
           return b.visitId - a.visitId;
         });

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
          testResult: visit.testResult ?? undefined, // Add testResult to the patient object
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

  const handleDownloadBarcode = async (row: Patient) => {
    if (barcodeRef.current) {
      const canvas = await html2canvas(barcodeRef.current);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `barcode-${row.visitId}.png`;
      link.click();
    }
  };

  // Toggle row expansion
  const toggleRowExpansion = (visitId: number, columnType: 'tests' | 'packages') => {
    const key = `${visitId}-${columnType}`;
    
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleOpenReportModal = (patient: Patient, testId: number) => {
    if (!patient || !testId) return;

    // First try to find the test in individual tests
    let test = tests.find((t) => t.id === testId);
    
    // If not found in individual tests, search in package tests
    if (!test) {
      for (const packageId of patient.packageIds) {
        const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
        if (packageDetails) {
          const packageTest = packageDetails.tests.find((t) => t.id === testId);
          if (packageTest) {
            // Create a test object that matches the TestList interface
            test = {
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

    if (!test) return;

    setSelectedPatient(patient);
    setSelectedTest(test);
    setShowModal(true);
  };





  const columns = [
    {
      header: 'ID',
      accessor: (row: Patient) => row.visitId,
      cell: (value: number) => <span className="font-semibold text-primary">#{value}</span>
    },
    {
      header: 'Patient',
      accessor: (row: Patient) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-gray-900">{row.patientname}</span>
          <div className="flex items-center gap-1 text-gray-500 bg-blue-50 px-2 py-1 rounded-full w-fit">
            <CalendarDays className="w-3 h-3 opacity-70" />
            <span className="text-xs font-medium">{formatDisplayDate(row.visitDate)}</span>
          </div>
        </div>
      )
    },
          {
        header: 'Status',
        accessor: (row: Patient) => {
          // Check if we have test results
          if (!row.testResult || row.testResult.length === 0) {
            return (
              <div className="flex flex-col items-center gap-1">
                <span className={'bg-yellow-100 text-yellow-800 rounded-full text-sm truncate'}>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold">Pending</span>
                </span>
                <div className="w-16 bg-gray-200 rounded-full h-1">
                  <div className="bg-yellow-500 h-1 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            );
          }

          // Calculate completion percentage
          const totalTests = row.testResult.length;
          const completedTests = row.testResult.filter(tr => tr.isFilled && tr.reportStatus === 'Completed').length;
          const completionPercentage = (completedTests / totalTests) * 100;

          // Check if all tests are completed
          const allTestsCompleted = completedTests === totalTests;
          const someTestsCompleted = completedTests > 0 && completedTests < totalTests;
          const allTestsPending = completedTests === 0;

          let statusColor = 'bg-yellow-100 text-yellow-800';
          let statusText = 'Pending';
          let progressColor = 'bg-yellow-500';

          if (allTestsCompleted) {
            statusColor = 'bg-green-100 text-green-800';
            statusText = 'Completed';
            progressColor = 'bg-green-500';
          } else if (someTestsCompleted) {
            statusColor = 'bg-blue-100 text-blue-800';
            statusText = 'Partially Completed';
            progressColor = 'bg-blue-500';
          } else if (allTestsPending) {
            statusColor = 'bg-yellow-100 text-yellow-800';
            statusText = 'Pending';
            progressColor = 'bg-yellow-500';
          } else {
            statusColor = 'bg-orange-100 text-orange-800';
            statusText = 'In Progress';
            progressColor = 'bg-orange-500';
          }

          return (
            <div className="flex flex-col items-center gap-1">
              <span className={`${statusColor} rounded-full text-sm truncate`}>
                <span className="px-2 py-1 rounded-full text-xs font-semibold">{statusText}</span>
              </span>
              <div className="w-16 bg-gray-200 rounded-full h-1">
                <div 
                  className={`${progressColor} h-1 rounded-full transition-all duration-300`} 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">{completedTests}/{totalTests}</span>
            </div>
          );
        }
      },
    {
      header: 'Tests',
      accessor: (row: Patient) => {
        // Get all test IDs that belong to packages
        const packageTestIds = new Set<number>();
        row.packageIds.forEach(packageId => {
          const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
          if (packageDetails) {
            // Add all test IDs from this package to the set
            packageDetails.tests.forEach(test => {
              // Since the Test interface doesn't have an id, we need to find the test by name
              const matchingTest = tests.find(t => t.name === test.name);
              if (matchingTest) {
                packageTestIds.add(matchingTest.id);
              }
            });
          }
        });

        // Filter out tests that belong to packages from individual tests
        const individualTestIds = row.testIds.filter(testId => 
          !packageTestIds.has(testId)
        );

                 const isExpanded = expandedRows.has(`${row.visitId}-tests`);
         const displayTests = isExpanded ? individualTestIds : individualTestIds.slice(0, 3);
         const hasMoreTests = individualTestIds.length > 3;
         
         // For CollectionTable, show total test count (not just completed)
         const totalTestCount = individualTestIds.length;

        return (
          <div className="flex flex-col gap-1 min-w-[250px] max-w-[350px]">
            {displayTests.map((testId) => {
              const test = tests.find((t) => t.id === testId);
              const testResult = row.testResult?.find(tr => tr.testId === testId);
              
              if (!test) return null;
              
              // Determine test status
              let statusColor = 'bg-blue-100 text-blue-800';
              let statusText = 'Pending';
              
              if (testResult) {
                if (testResult.isFilled && testResult.reportStatus === 'Completed') {
                  statusColor = 'bg-green-100 text-green-800';
                  statusText = 'Completed';
                } else if (testResult.isFilled) {
                  statusColor = 'bg-orange-100 text-orange-800';
                  statusText = 'In Progress';
                }
              }
              
              return (
                <div key={test.id} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-b-0">
                  <span className={`${statusColor} px-2 py-0.5 rounded-full text-xs inline-block w-fit`}>
                    {test.name}
                  </span>
                  {/* Only show status text if not pending */}
                  {statusText !== 'Pending' && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor.replace('100', '200')}`}>
                      {statusText}
                    </span>
                  )}
                  {/* Only show status icon if test is completed */}
                  {testResult && testResult.isFilled && (
                    <span 
                      className="text-xs px-1 py-0.5 rounded cursor-help bg-green-100 text-green-700 border border-green-200"
                      title={`Test completed - ${testResult.reportStatus}`}
                    >
                      ✓
                    </span>
                  )}
                  {/* Only show result button if test is not completed */}
                  {(!testResult || !testResult.isFilled || testResult.reportStatus !== 'Completed') && (
                    <button
                      onClick={() => handleOpenReportModal(row, testId)}
                      className="flex items-center gap-1 bg-blue-500 text-white px-1.5 py-0.5 rounded text-xs hover:bg-blue-600 transition-colors whitespace-nowrap"
                      title={`View result for ${test.name}`}
                    >
                      <PlusIcon className="w-2.5 h-2.5 text-white" />
                      <span className='text-white text-xs'>Result</span>
                    </button>
                  )}
                </div>
              );
            }).filter(Boolean)}
            
                         {hasMoreTests && (
               <button
                 onClick={() => toggleRowExpansion(row.visitId, 'tests')}
                 className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
               >
                 {isExpanded ? 'Show Less' : `View All (${totalTestCount})`}
               </button>
             )}
          </div>
        );
      }
    },
    {
      header: 'Package',
      accessor: (row: Patient) => {
        if (row.packageIds.length === 0) {
          return (
            <div className="text-gray-400 text-xs italic">No packages</div>
          );
        }

        const isExpanded = expandedRows.has(`${row.visitId}-packages`);
        
                 // Calculate total tests and completed tests across all packages
         const totalTests = row.packageIds.reduce((total, packageId) => {
           const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
           return total + (packageDetails?.tests?.length || 0);
         }, 0);
         
         // For CollectionTable, show total test count (not just completed)
         const totalPackageTestCount = row.packageIds.reduce((total, packageId) => {
           const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
           if (!packageDetails) return total;
           
           return total + packageDetails.tests.length;
         }, 0);
         
         // Show expandable logic if there are more than 3 total tests (even with 1 package)
         const hasMoreContent = totalTests > 3;
         
         // If expanded, show all packages. If not expanded, show first package with limited tests
         let displayPackages: number[];
         let displayTests: Array<{
           id: number;
           name: string;
           price: number;
           category?: string;
         }> | null = null;
         
         if (isExpanded) {
           // Show all packages and all tests
           displayPackages = row.packageIds;
         } else {
           // Show first package with limited tests
           displayPackages = row.packageIds.slice(0, 1);
           const firstPackage = healthPackages.find((pkg) => pkg.id === row.packageIds[0]);
           if (firstPackage) {
             displayTests = firstPackage.tests.slice(0, 3); // Show only first 3 tests
           }
         }

        return (
          <div className="flex flex-col gap-2 min-w-[250px] max-w-[350px]">
            {displayPackages.map((packageId) => {
              const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
              if (!packageDetails) return null;

              return (
                <div key={packageDetails.id} className="flex flex-col gap-1">
                  {/* Package name with icon */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs">📦</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                      {packageDetails.packageName}
                    </span>
                  </div>
                  
                  {/* Package tests */}
                  <div className="flex flex-col gap-1 ml-2">
                    {(isExpanded ? packageDetails.tests : (displayTests || packageDetails.tests.slice(0, 3))).map((test: { id: number; name: string; price: number; category?: string }, index: number) => {
                      // Use the test ID directly from the package test data
                      const testId = test.id;
                      if (!testId) return null;

                      const testResult = row.testResult?.find(tr => tr.testId === testId);
                      
                      // Determine test status
                      let statusColor = 'bg-purple-100 text-purple-800';
                      let statusText = 'Pending';
                      
                      if (testResult) {
                        if (testResult.isFilled && testResult.reportStatus === 'Completed') {
                          statusColor = 'bg-green-100 text-green-800';
                          statusText = 'Completed';
                        } else if (testResult.isFilled) {
                          statusColor = 'bg-orange-100 text-orange-800';
                          statusText = 'In Progress';
                        }
                      }
                      
                      return (
                        <div key={`${packageDetails.id}-${index}`} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-b-0">
                          <span className={`${statusColor} px-2 py-0.5 rounded-full text-xs inline-block w-fit`}>
                            {test.name}
                          </span>
                          {/* Only show status text if not pending */}
                          {statusText !== 'Pending' && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor.replace('100', '200')}`}>
                              {statusText}
                            </span>
                          )}
                          {/* Only show status icon if test is completed */}
                          {testResult && testResult.isFilled && (
                            <span 
                              className="text-xs px-1 py-0.5 rounded cursor-help bg-green-100 text-green-700 border border-green-200"
                              title={`Test completed - ${testResult.reportStatus}`}
                            >
                              ✓
                            </span>
                          )}
                          {/* Only show result button if test is not completed */}
                          {(!testResult || !testResult.isFilled || testResult.reportStatus !== 'Completed') && (
                            <button
                              onClick={() => handleOpenReportModal(row, testId)}
                              className="flex items-center gap-1 bg-purple-500 text-white px-1.5 py-0.5 rounded text-xs hover:bg-purple-600 transition-colors whitespace-nowrap"
                              title={`View result for ${test.name}`}
                            >
                              <PlusIcon className="w-2.5 h-2.5 text-white" />
                              <span className='text-white text-xs'>Result</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }).filter(Boolean)}
            
                         {hasMoreContent && (
               <button
                 onClick={() => toggleRowExpansion(row.visitId, 'packages')}
                 className="text-xs text-purple-600 hover:text-purple-800 font-medium mt-1 w-fit"
               >
                 {isExpanded ? 'Show Less' : `View All (${totalPackageTestCount})`}
               </button>
             )}
          </div>
        );
      }
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
      accessor: (row: Patient) => {
        const age = row.dateOfBirth ? calculateAge(row.dateOfBirth) : 'N/A';
        // const dobFormatted = row.dateOfBirth ? formatDisplayDate(row.dateOfBirth) : 'N/A';

        return (
          <div className="flex items-center justify-center">
            <div ref={barcodeRef} style={{ position: 'absolute', left: '-9999px' }}>
              {/* Hidden barcode for download functionality */}
              <Barcode
                value={
                  "Patient ID: " + row.visitId +
                  " Name: " + row.patientname +
                  " Age: " + age +
                  " Gender: " + (row.gender || '')
                }
                format="CODE128"
                width={.5}
                height={40}
                displayValue={true}
                fontSize={10}
              />
            </div>
            <button
              onClick={() => handleDownloadBarcode(row)}
              className="flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
              title="Download Barcode"
            >
              <Download className="w-3 h-3" />
              <span>Download</span>
            </button>
          </div>
        )
      }
    },

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
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col w-40">
            <label className="text-xs font-semibold mb-1 text-gray-600">Date Range:</label>
            <select
              value={dateFilter}
              onChange={(e) => handleDateFilterChange(e.target.value as DateFilterOption)}
              className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
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
              <div className="flex flex-col w-40">
                <label className="text-xs font-semibold mb-1 text-gray-600">Start Date:</label>
                <input
                  type="date"
                  value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setCustomStartDate(e.target.value ? new Date(e.target.value) : null)}
                  className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                />
              </div>

              <div className="flex flex-col w-40">
                <label className="text-xs font-semibold mb-1 text-gray-600">End Date:</label>
                <input
                  type="date"
                  value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setCustomEndDate(e.target.value ? new Date(e.target.value) : null)}
                  className="border border-gray-300 px-3 py-1.5 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                />
              </div>
            </>
          )}
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

          {showModal && selectedPatient && selectedTest && (
            <Modal isOpen={showModal} title={`Enter Result Data - ${selectedTest.name}`} onClose={() => {
              setShowModal(false);
              setSelectedPatient(null);
              setSelectedTest(null);
            }} modalClassName="max-w-5xl">
              <PatientReportDataFill
                selectedPatient={selectedPatient}
                selectedTest={selectedTest}
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
            <Modal isOpen={updatedPopUp} title="Update Sample" onClose={() => setUpdatedPopUp(false)} modalClassName="max-w-2xl">
              <UpdateSample
                visitId={updateSample?.visitId ?? 0}
                sampleNames={updateSample?.sampleNames ?? []}
                onClose={() => {
                  setUpdatedPopUp(false);
                  // Refresh the table data after sample update
                  fetchVisits();
                }}
              />
            </Modal>
          )}
        </>
      )}
    </div>
  );
};

export default CollectionTable;


