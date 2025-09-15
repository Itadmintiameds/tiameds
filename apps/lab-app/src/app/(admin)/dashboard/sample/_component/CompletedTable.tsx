import { getHealthPackageById } from '@/../services/packageServices';
import { getTestById } from '@/../services/testService';
import Loader from '@/app/(admin)/component/common/Loader';
import Modal from '@/app/(admin)/component/common/Model';
import Pagination from '@/app/(admin)/component/common/Pagination';
import TableComponent from '@/app/(admin)/component/common/TableComponent';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import { DATE_FILTER_OPTIONS, DateFilterOption, formatDateForAPI, formatDisplayDate, getDateRange } from '@/utils/dateUtils';
import React, { useEffect, useMemo, useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import {  TbReport } from 'react-icons/tb';
import { toast } from 'react-toastify';
import { getCollectedCompleted } from '../../../../../../services/sampleServices';
import ViewReport from './Report/ViewReport';
// import Editreport from './Report/Editreport';

interface Patient {
    visitId: number;
    patientname: string;
    visitDate: string;
    visitStatus: string;
    sampleNames: string[];
    testIds: number[];
    packageIds: number[];
    contactNumber?: string;
    gender?: string;
    email?: string;
    dateOfBirth?: string;
    testResult?: TestResult[];
    doctorName?: string;
    visitType?: string;
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



const CompletedTable = () => {
    const { currentLab } = useLabs();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [patientList, setPatientList] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [tests, setTests] = useState<TestList[]>([]);
    const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ViewModel, setViewModel] = useState(false);
    // const [editModel, setEditModel] = useState(false);
    const itemsPerPage = 8;
    // const [editPatient, setEditPatient] = useState<Patient | null>(null);
    const [viewPatient, setViewPatient] = useState<Patient | null>(null);
    const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
    const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
    const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // State for expanded rows
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const handleFilterChange = (filter: DateFilterOption) => {
        setDateFilter(filter);
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

    const fetchVisits = async () => {
        try {
            if (!currentLab?.id) return;

            setIsLoading(true);
            const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);

            if (!startDate || !endDate) return;

            const formattedStart = formatDateForAPI(startDate);
            const formattedEnd = formatDateForAPI(endDate);

            const response = await getCollectedCompleted(
                currentLab.id,
                formattedStart,
                formattedEnd,
            );

            // Filter to show visits where ANY test has reportStatus "Completed"
            const completedVisits = response.filter(visit => {
                if (!visit.testResult || visit.testResult.length === 0) {
                    return false; // Skip visits without test results
                }

                // Check if ANY test has reportStatus "Completed"
                const hasAnyCompletedTest = visit.testResult.some(tr => tr.reportStatus === 'Completed');
                return hasAnyCompletedTest; // Show visits where at least one test is completed
            });

            const sortedVisits = completedVisits.sort((a, b) =>
                new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
            );

            setPatientList(sortedVisits);
            setFilteredPatients(sortedVisits);

            const uniqueTestIds = Array.from(new Set(sortedVisits.flatMap((visit) => visit.testIds)));
            const uniquePackageIds = Array.from(new Set(sortedVisits.flatMap((visit) => visit.packageIds)));

            const [fetchedTests, fetchedPackages] = await Promise.all([
                Promise.all(
                    uniqueTestIds.map((testId) =>
                        getTestById(currentLab.id.toString(), testId)
                            .catch(() => null)
                    )
                ),
                Promise.all(
                    uniquePackageIds.map((packageId) =>
                        getHealthPackageById(currentLab.id, packageId)
                            .catch(() => ({ data: null }))
                    )
                )
            ]);
            setTests(fetchedTests.filter(Boolean) as TestList[]);
            setHealthPackages(fetchedPackages.map(pkg => pkg?.data).filter(Boolean) as HealthPackage[]);
        } catch (error) {
            toast.error((error as Error).message || 'Error fetching visits', { autoClose: 2000 });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        localStorage.setItem('completedTestsDateFilter', dateFilter);
        fetchVisits();
    }, [currentLab, dateFilter, customStartDate, customEndDate]);

    const totalPages = useMemo(() => Math.ceil(filteredPatients.length / itemsPerPage), [filteredPatients.length]);
    const paginatedPatients = useMemo(() => {
        return filteredPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredPatients, currentPage]);

    const handleOpenReportModal = (patient: Patient) => {
        setViewModel(true);
        setViewPatient(patient);
    };

    // const handleEditReport = (patient: Patient) => {
    //     setEditModel(true);
    //     setEditPatient(patient);
    // };

    const columns = [
            {
        header: 'ID',
        accessor: (row: Patient) => row.visitId
    },
    {
        header: 'Patient',
        accessor: (row: Patient) => (
            <div className="flex flex-col gap-1">
                <span className="font-medium text-gray-900">{row.patientname}</span>
                <div className="flex items-center gap-1 text-gray-500 bg-blue-50 px-2 py-1 rounded-full w-fit">
                    <FiCalendar className="w-3 h-3 opacity-70" />
                    <span className="text-xs font-medium">{formatDisplayDate(row.visitDate)}</span>
                </div>
            </div>
        )
    },
        {
            header: 'Status',
            accessor: (row: Patient) => {
                if (!row.testResult || row.testResult.length === 0) {
                    return (
                        <span className={'bg-gray-100 text-gray-800 rounded-full text-xs truncate'}>
                            <span className="px-2 py-1 rounded-full text-xs font-semibold">No Results</span>
                        </span>
                    );
                }

                const totalTests = row.testResult.length;
                const completedTests = row.testResult.filter(tr => tr.reportStatus === 'Completed').length;

                if (completedTests === totalTests) {
                    // If there's only 1 test and it's completed, show "Completed"
                    // If there are multiple tests and all are completed, show "All Completed"
                    const statusText = totalTests === 1 ? 'Completed' : 'All Completed';
                    return (
                        <span className={'bg-green-100 text-green-800 rounded-full text-xs truncate'}>
                            <span className="px-2 py-1 rounded-full text-xs font-semibold">{statusText}</span>
                        </span>
                    );
                } else {
                    return (
                        <span className={'bg-blue-100 text-blue-800 rounded-full text-xs truncate'}>
                            <span className="px-2 py-1 rounded-full text-xs font-semibold">{completedTests}/{totalTests} Completed</span>
                        </span>
                    );
                }
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
                
                // Count completed tests for display
                const completedTestCount = individualTestIds.filter(testId => {
                    const testResult = row.testResult?.find(tr => tr.testId === testId);
                    return testResult && testResult.isFilled && testResult.reportStatus === 'Completed';
                }).length;

                return (
                    <div className="flex flex-col gap-1 min-w-[250px] max-w-[350px]">
                        {displayTests.map((testId) => {
                            const test = tests.find((t) => t.id === testId);
                            const testResult = row.testResult?.find(tr => tr.testId === testId);

                            if (!test) return null;

                            // Only show tests that have progress (completed or in progress), skip pending ones
                            if (!testResult || (!testResult.isFilled && testResult.reportStatus === 'Pending')) {
                                return null;
                            }

                            // Determine test status
                            let statusColor = 'bg-blue-100 text-blue-800';
                            let statusText = 'In Progress';

                            if (testResult.reportStatus === 'Completed') {
                                statusColor = 'bg-green-100 text-green-800';
                                statusText = 'Completed';
                            }

                            return (
                                <div key={test.id} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-b-0">
                                    <span className={`${statusColor} px-2 py-0.5 rounded-full text-xs inline-block w-fit`}>
                                        {test.name}
                                    </span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor.replace('100', '200')}`}>
                                        {statusText}
                                    </span>
                                    {/* Show checkmark for completed tests */}
                                    {testResult.reportStatus === 'Completed' && (
                                        <span
                                            className="text-xs px-1 py-0.5 rounded cursor-help bg-green-100 text-green-700 border border-green-200"
                                            title={`Test completed - ${testResult.reportStatus}`}
                                        >
                                            ✓
                                        </span>
                                    )}
                                </div>
                            );
                        }).filter(Boolean)}
                        
                        {hasMoreTests && (
                            <button
                                onClick={() => toggleRowExpansion(row.visitId, 'tests')}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 w-fit"
                            >
                                {isExpanded ? 'Show Less' : `View All (${completedTestCount})`}
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
                
                // Count completed tests for display
                const completedPackageTestCount = row.packageIds.reduce((total, packageId) => {
                    const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
                    if (!packageDetails) return total;
                    
                    return total + packageDetails.tests.filter(test => {
                        const testResult = row.testResult?.find(tr => tr.testId === test.id);
                        return testResult && testResult.isFilled && testResult.reportStatus === 'Completed';
                    }).length;
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
                                        {(isExpanded ? packageDetails.tests : (displayTests || packageDetails.tests.slice(0, 3))).map((test, index) => {
                                            // Use the test ID directly from the package test data
                                            const testId = test.id;
                                            if (!testId) return null;

                                            const testResult = row.testResult?.find(tr => tr.testId === testId);

                                            // Only show tests that have progress (completed or in progress), skip pending ones
                                            if (!testResult || (!testResult.isFilled && testResult.reportStatus === 'Pending')) {
                                                return null;
                                            }

                                            // Determine test status
                                            let statusColor = 'bg-purple-100 text-purple-800';
                                            let statusText = 'In Progress';

                                            if (testResult.reportStatus === 'Completed') {
                                                statusColor = 'bg-green-100 text-green-800';
                                                statusText = 'Completed';
                                            }

                                            return (
                                                <div key={`${packageDetails.id}-${index}`} className="flex items-center gap-1 py-1 border-b border-gray-100 last:border-b-0">
                                                    <span className={`${statusColor} px-2 py-0.5 rounded-full text-xs inline-block w-fit`}>
                                                        {test.name}
                                                    </span>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded ${statusColor.replace('100', '200')}`}>
                                                        {statusText}
                                                    </span>
                                                    {/* Show checkmark for completed tests */}
                                                    {testResult.reportStatus === 'Completed' && (
                                                        <span
                                                            className="text-xs px-1 py-0.5 rounded cursor-help bg-green-100 text-green-700 border border-green-200"
                                                            title={`Test completed - ${testResult.reportStatus}`}
                                                        >
                                                            ✓
                                                        </span>
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
                                {isExpanded ? 'Show Less' : `View All (${completedPackageTestCount})`}
                            </button>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Actions',
            accessor: (row: Patient) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleOpenReportModal(row)}
                        className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                        aria-label={`View report for ${row.patientname}`}
                    >
                        <TbReport className="w-3 h-3" />
                        <span>View</span>
                    </button>
                    {/* Edit button temporarily disabled
                    <button
                        onClick={() => handleEditReport(row)}
                        className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                        aria-label={`Edit report for ${row.patientname}`}
                    >
                        <TbEdit className="w-3 h-3" />
                        <span>Edit</span>
                    </button>
                    */}
                </div>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader type="progress" fullScreen={false} text="Loading Completed Samples..." />
                <p className="mt-4 text-sm text-gray-500">Fetching the latest Completed  samples...</p>
            </div>
        );
    }
    return (
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Completed Tests</h2>
                    <p className="text-xs text-gray-500">View and manage completed test reports</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex flex-col w-40">
                        <label className="text-xs font-semibold mb-1 text-gray-600">Date Range:</label>
                        <select
                            value={dateFilter}
                            onChange={(e) => handleFilterChange(e.target.value as DateFilterOption)}
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
                        Showing <span className="font-bold">{filteredPatients.length}</span> completed test{filteredPatients.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {filteredPatients.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="mx-auto w-16 h-16 mb-3 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-md font-medium text-gray-700">No completed tests</h3>
                    <p className="text-gray-500 text-xs mt-1">No tests found for the selected criteria</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <TableComponent
                            data={paginatedPatients}
                            columns={columns}
                        />
                    </div>

                    {ViewModel && viewPatient && (
                        <Modal
                            title='View Report'
                            isOpen={ViewModel}
                            onClose={() => setViewModel(false)}
                            modalClassName='max-w-4xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden'
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
                                hidePrintButton={true}
                            />
                        </Modal>
                    )}

                    {/* Edit modal temporarily disabled
                    {editModel && editPatient && (
                        <Modal
                            title='Edit Report'
                            isOpen={editModel}
                            onClose={() => setEditModel(false)}
                            modalClassName='max-w-5xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden'
                        >
                            <Editreport
                                editPatient={editPatient}
                                setShowModal={setEditModel}
                                refreshReports={fetchVisits}
                            />

                        </Modal>
                    )}
                    */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex justify-center">
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

export default CompletedTable;