import { getHealthPackageById } from '@/../services/packageServices';
import { getTestById } from '@/../services/testService';
import Loader from '@/app/(admin)/component/common/Loader';
import Modal from '@/app/(admin)/component/common/Model';
import Pagination from '@/app/(admin)/component/common/Pagination';
import TableComponent from '@/app/(admin)/component/common/TableComponent';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import React, { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiCalendar, FiFilter } from 'react-icons/fi';
import { TbEdit, TbReport } from 'react-icons/tb';
import { toast } from 'react-toastify';
import { getAllVisitssamples } from '../../../../../../services/sampleServices';
import ViewReport from './Report/ViewReport';
import Editreport from './Report/Editreport';

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

}
interface HealthPackage {
    id: number;
    packageName: string;
}

const DATE_FILTER_OPTIONS = ['all', 'today', 'yesterday', 'last7days', 'thisMonth', 'thisYear', 'custom'] as const;
type DateFilterOption = typeof DATE_FILTER_OPTIONS[number];

const CompletedTable: React.FC = () => {
    const { currentLab } = useLabs();
    const [patientList, setPatientList] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [tests, setTests] = useState<TestList[]>([]);
    const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ViewModel, setViewModel] = useState(false);
    const [editModel, setEditModel] = useState(false);
    const itemsPerPage = 8;
    const [editPatient, setEditPatient] = useState<Patient | null>(null);
    const [viewPatient, setViewPatient] = useState<Patient | null>(null);
    const [dateFilter, setDateFilter] = useState<DateFilterOption>('today');
    const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
    const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
                if (!customStartDate || !customEndDate) return { startDate: null, endDate: null };
                startDate = new Date(customStartDate);
                endDate = new Date(customEndDate);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            default:
                return { startDate: null, endDate: null };
        }

        return { startDate, endDate };
    };

    const formatDateForDisplay = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const applyDateFilter = () => {
        if (dateFilter === 'all') {
            setFilteredPatients(patientList);
            return;
        }

        const { startDate, endDate } = getDateRange(dateFilter);

        if (!startDate || !endDate) {
            if (dateFilter === 'custom') {
                toast.warning("Please select valid date range");
            }
            return;
        }

        const filtered = patientList.filter(patient => {
            const visitDate = new Date(patient.visitDate);
            return visitDate >= startDate && visitDate <= endDate;
        });

        setFilteredPatients(filtered);
        setCurrentPage(1);
        setShowDateFilter(false);
    };

    const handleFilterChange = (filter: DateFilterOption) => {
        setDateFilter(filter);
        if (filter !== 'custom') {
            setShowDateFilter(false);
        }
    };

    const fetchVisits = async () => {
        try {
            if (!currentLab?.id) return;

            setIsLoading(true);
            const { startDate, endDate } = getDateRange(dateFilter);
            const formattedStart = startDate?.toISOString().split('T')[0];
            const formattedEnd = endDate?.toISOString().split('T')[0];

            const response = await getAllVisitssamples(
                currentLab.id,
                dateFilter !== 'all' ? formattedStart : undefined,
                dateFilter !== 'all' ? formattedEnd : undefined,
                'Completed'
            );

            const sortedVisits = response.sort((a, b) =>
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
    }, [currentLab, dateFilter]);

    useEffect(() => {
        if (dateFilter === 'custom' && (customStartDate || customEndDate)) {
            applyDateFilter();
        }
    }, [customStartDate, customEndDate]);

    const totalPages = useMemo(() => Math.ceil(filteredPatients.length / itemsPerPage), [filteredPatients.length]);
    const paginatedPatients = useMemo(() => {
        return filteredPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredPatients, currentPage]);

    const handleOpenReportModal = (patient: Patient) => {
        setViewModel(true);
        setViewPatient(patient);
    };

    const handleEditReport = (patient: Patient) => {
        setEditModel(true);
        setEditPatient(patient);
    };

    const columns = [
        {
            header: 'ID',
            accessor: (row: Patient) => row.visitId,
            cell: (value: number) => <span className="font-semibold text-blue-600">#{value}</span>
        },
        {
            header: 'Patient',
            accessor: (row: Patient) => row.patientname,
            cell: (value: string) => <span className="font-medium">{value}</span>
        },
        {
            header: 'Date',
            accessor: (row: Patient) => row.visitDate,
            cell: (value: string) => (
                <div className="flex items-center gap-1 text-gray-600 bg-blue-50 px-2 py-1 rounded-full">
                    <FiCalendar className="w-3 h-3 opacity-70" />
                    <span className="text-xs font-medium">{formatDateForDisplay(value)}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (row: Patient) => (
                <span className={'bg-green-100 text-green-800 rounded-full text-xs truncate'}>
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
                    <button
                        onClick={() => handleEditReport(row)}
                        className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                        aria-label={`Edit report for ${row.patientname}`}
                    >
                        <TbEdit className="w-3 h-3" />
                        <span>Edit</span>
                    </button>
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

                <div className="relative">
                    <button
                        onClick={() => setShowDateFilter(!showDateFilter)}
                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        aria-expanded={showDateFilter}
                        aria-haspopup="true"
                        aria-label="Filter by date"
                    >
                        <FiFilter className="w-3 h-3" />
                        <span>Filter by Date</span>
                    </button>

                    {showDateFilter && (
                        <div className="absolute z-10 mt-1 right-0 bg-white p-3 rounded-lg shadow-lg border border-gray-200 w-64">
                            <div className="space-y-2">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-600">Date Range</label>
                                    <select
                                        value={dateFilter}
                                        onChange={(e) => {
                                            const newFilter = e.target.value as DateFilterOption;
                                            handleFilterChange(newFilter);
                                        }}
                                        className="w-full p-1.5 border border-gray-300 rounded-md text-xs"
                                    >
                                        {DATE_FILTER_OPTIONS.map(option => (
                                            <option key={option} value={option}>
                                                {option.charAt(0).toUpperCase() + option.slice(1).replace(/([A-Z])/g, ' $1')}
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
                                        <button
                                            onClick={() => {
                                                applyDateFilter();
                                                setShowDateFilter(false);
                                            }}
                                            className="w-full bg-blue-600 text-white py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            Apply Custom Filter
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
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
                            modalClassName='max-w-3xl'
                        >
                            <ViewReport viewPatient={viewPatient} />
                        </Modal>
                    )}

                    {editModel && editPatient && (
                        <Modal
                            title='Edit Report'
                            isOpen={editModel}
                            onClose={() => setEditModel(false)}
                            modalClassName='max-w-3xl'
                        >
                            <Editreport
                                editPatient={editPatient}
                                setShowModal={setEditModel}
                                refreshReports={fetchVisits}
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
                </>
            )}
        </div>
    );
};

export default CompletedTable;