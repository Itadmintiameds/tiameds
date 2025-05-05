import { getHealthPackageById } from '@/../services/packageServices';
import { getTestById } from '@/../services/testService';
import Button from '@/app/(admin)/component/common/Button';
import Loader from '@/app/(admin)/component/common/Loader';
import Modal from '@/app/(admin)/component/common/Model';
import Pagination from '@/app/(admin)/component/common/Pagination';
import TableComponent from '@/app/(admin)/component/common/TableComponent';
import { useLabs } from '@/context/LabContext';
import { PatientData } from '@/types/sample/sample';
import { TestList } from '@/types/test/testlist';
import React, { useEffect, useState } from 'react';
import { TbEdit, TbReport } from 'react-icons/tb';
import { toast } from 'react-toastify';
import { getAllVisitssamples } from '../../../../../../services/sampleServices';
import Editreport from './Report/Editreport';
import ViewReport from './Report/ViewReport';


interface Patient extends PatientData {
    visitId: number;
    patientname: string;
    visitDate: string;
    visitStatus: string;
    sampleNames: string[];
    testIds: number[];
    packageIds: number[];
}

interface HealthPackage {
    id: number;
    packageName: string;
}

const CompletedTable: React.FC = () => {
    const { currentLab } = useLabs();
    const [patientList, setPatientList] = useState<Patient[]>([]);
    const [tests, setTests] = useState<TestList[]>([]);
    const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [ViewModel, setViewModel] = useState(false);
    const [editModel, setEditModel] = useState(false);
    const itemsPerPage = 8;
    const [editPatient, setEditPatient] = useState<Patient | null>(null);
    const [viewPatient, setViewPatient] = useState<Patient | null>(null);


    const fetchVisits = async () => {
        try {
          if (currentLab?.id) {
            const response: Patient[] = await getAllVisitssamples(currentLab.id);
            const collectedVisits = response
              .filter((visit) => visit.visitStatus === 'Completed')
              .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()); // Sorting in descending order
      
            setPatientList(collectedVisits);
      
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
          }
        } catch (error) {
          toast.error((error as Error).message || 'Error fetching visits', { autoClose: 2000 });
        }
      };
      

    useEffect(() => {
        fetchVisits();
    }, [currentLab]);

    const totalPages = Math.ceil(patientList.length / itemsPerPage);
    const paginatedPatients = patientList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleOpenReportModal = (patient: Patient) => {
        // Handle report view logic
        setViewModel(true);
        setViewPatient(patient);
    };

    // const handleDownloadReport = (patient: Patient) => {
    //     // Handle report download logic
    // };

    const handleEditReport = (patient: Patient) => {
        // Handle report editing logic
        setEditModel(true);
        setEditPatient(patient);
        console.log(editPatient);

    };

    const columns = [
        { header: 'ID', accessor: (row: Patient) => row.visitId },
        { header: 'Name', accessor: (row: Patient) => row.patientname },
        { header: 'Date', accessor: (row: Patient) => <span>{new Date(row.visitDate).toLocaleDateString()}</span> },
        { header: 'Status', accessor: (row: Patient) => <span className="bg-success text-white p-1 rounded">{row.visitStatus}</span> },
        {
            header: 'Tests',
            accessor: (row: Patient) => (
                <div className="flex flex-wrap gap-2">
                    {row.testIds.map((testId) => {
                        const test = tests.find((t) => t.id === testId);
                        return test ? (
                            <span key={test.id} className="bg-info text-textwhite shadow-xl p-0.5 rounded text-sm">
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
                <div className="flex flex-wrap gap-2">
                    {row.packageIds.map((packageId) => {
                        const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
                        return packageDetails ? (
                            <span key={packageDetails.id} className="bg-blue-100 text-textdark shadow-xl p-0.5 rounded text-textsize">
                                {packageDetails.packageName}
                            </span>
                        ) : (
                            <span key={packageId} className="bg-gray-300 text-black px-2 py-1 rounded">Package Not Found</span>
                        );
                    }).filter(Boolean)}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: (row: Patient) => (
                <div className="flex gap-2">
                    {/* View Report */}
                    <Button
                        text="View"
                        onClick={() => handleOpenReportModal(row)}
                        className="flex items-center px-2 py-1 text-white bg-view rounded text-xs hover:bg-viewhover"
                    >
                        <TbReport className="text-sm mr-1" />
                    </Button>

                    {/* Download Report */}
                    {/* <Button
                        text="Download"
                        // onClick={() => handleDownloadReport(row)}
                        onClick={() => toast.error('Download feature not available yet')}
                        className="flex items-center px-2 py-1 text-white bg-blue-500 rounded text-xs hover:bg-blue-600"
                    >
                        <TbDownload className="text-sm mr-1" />
                    </Button> */}

                    {/* Edit Report */}
                    <Button
                        text="Edit"
                        onClick={() => handleEditReport(row)}
                        className="flex items-center px-2 py-1 text-white bg-edit rounded text-xs hover:bg-edithover"
                    >
                        <TbEdit className="text-sm mr-1" />
                    </Button>
                </div>
            ),
        }
    ];

    if (!patientList.length) return <Loader />;
   

    return (
        <div className="text-xs p-4">
            <TableComponent data={paginatedPatients} columns={columns} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            {
                ViewModel && (
                    <Modal
                        title='View Report'
                        isOpen={ViewModel}
                        onClose={() => setViewModel(false)}
                        modalClassName='max-w-3xl'
                    >
                        <ViewReport
                            viewPatient={viewPatient}

                        />
                    </Modal>
                )
            }
            {
                editModel && (
                    <Modal
                        title='Edit Report'
                        isOpen={editModel}
                        onClose={() => setEditModel(false)}
                        modalClassName='max-w-3xl'
                    >
                        {/* Edit Report Component */}
                        <Editreport />
                    </Modal>
                )
            }
        </div>
    );
};

export default CompletedTable;
