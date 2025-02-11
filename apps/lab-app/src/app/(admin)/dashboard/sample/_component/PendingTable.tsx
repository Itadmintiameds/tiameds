import { getHealthPackageById } from '@/../services/packageServices';
import { getAllVisits } from '@/../services/patientServices';
import { getTestById } from '@/../services/testService';
import Button from '@/app/(admin)/component/common/Button';
import Loader from '@/app/(admin)/component/common/Loader';
import Modal from '@/app/(admin)/component/common/Model';
import Pagination from '@/app/(admin)/component/common/Pagination';
import TableComponent from '@/app/(admin)/component/common/TableComponent';
import { useLabs } from '@/context/LabContext';
import { Patient } from '@/types/patient/patient';
import { TestList } from '@/types/test/testlist';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { PiTestTubeFill } from 'react-icons/pi';
import { toast } from 'react-toastify';
import SampleCollect from './SampleCollect';

interface Test {
  name: string;
  category: string;
  price: number;
}

interface HealthPackage {
  id : number;
  packageName: string;
  price: number;
  discount: number;
  netPrice: number;
  tests: Test[];
}

const PendingTable: React.FC = () => {
  const { currentLab, setPatientDetails } = useLabs();
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [tests, setTests] = useState<TestList[]>([]);
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        if (currentLab?.id) {
          const response = await getAllVisits(currentLab.id);
          const visits = response?.data || [];

          // Filter visits where visitStatus is "Pending"
          const pendingVisits = visits.filter((visit: Patient) => visit.visit.visitStatus === 'Pending');
          setPatientList(pendingVisits);

          // Fetch test details for the visit
          const testIds = pendingVisits.flatMap((visit: Patient) => visit.visit.testIds);
          const uniqueTestIds = Array.from(new Set(testIds)); // Removing duplicates
          const fetchedTests = await Promise.all(
            uniqueTestIds.map((testId) => getTestById(currentLab.id.toString(), testId as number))
          );
          setTests(fetchedTests);

          // Fetch health package details for the visit
          const packageIds = pendingVisits.flatMap((visit: Patient) => visit.visit.packageIds);
          const uniquePackageIds = Array.from(new Set(packageIds)); // Removing duplicates
          const fetchedPackages = await Promise.all(
            uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId as number))
          );

          // Set the health packages state to fetched data
          setHealthPackages(fetchedPackages.map((pkg) => pkg.data));  // Extract 'data' from each response
        }
      } catch (error: unknown) {
        toast.error((error as Error).message || 'An error occurred while fetching visits', { autoClose: 2000 });
      }
    };
    fetchVisits();
  }, [currentLab]);

  // Pagination Logic
  const totalPages = Math.ceil(patientList.length / itemsPerPage);
  const paginatedPatients = patientList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleView = (visit: Patient) => () => {
    setPatientDetails(visit);
    router.push('/dashboard/patients');
  };

  const columns = [
    { header: 'ID', accessor: (row: Patient) => row.visit.visitId },
    { header: 'Name', accessor: (row: Patient) => `${row.firstName} ${row.lastName}` },
    { header: 'Date', accessor: (row: Patient) => 
      <span>{new Date(row.visit.visitDate).toLocaleDateString()}</span>
    },
    {
      header: 'Status', accessor: (row: Patient) =>
         <span className='bg-yellow-300 p-1 rounded'>{row.visit.visitStatus}</span>
    },
    {
      header: 'Tests',
      accessor: (row: Patient) => {
        return (
          <div className="flex flex-wrap gap-2">
            {row.visit.testIds
              .map((testId) => {
                const test = tests.find((t) => t.id === testId);
                return test ? (
                  <span key={test.id} className="bg-indigo-300 text-textdark shadow-xl p-0.5 rounded text-sm">
                    {test.name}
                  </span>
                ) : null;
              })
              .filter(Boolean)}
          </div>
        );
      },
    },
    
    {
      header: 'Package',  // Updated header to "Health Package Name"
      accessor: (row: Patient) => {
        return (
          <div className="flex flex-wrap gap-2">
            {row.visit.packageIds
              .map((packageId) => {
                const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);
    
                // Render package name if found, otherwise show fallback message
                if (packageDetails) {
                  return (
                    <span key={packageDetails.id} className="bg-blue-100 text-textdark shadow-xl p-0.5 rounded text-textsize">
                      {packageDetails.packageName}  {/* Display package name */}
                    </span>
                  );
                } else {
                  return (
                    <span key={packageId} className="bg-gray-300 text-black px-2 py-1 rounded">
                      Package Not Found
                    </span>
                  );
                }
              })
              .filter(Boolean)}
          </div>
        );
      },
    },
    
  ];

  if (!patientList.length) {
    return <Loader />;
  }

  return (
    <div className="text-xs p-4">
      <TableComponent
        data={paginatedPatients}
        columns={columns}
        actions={(row: Patient) => (
          <>
            <Button
              text=""
              className="p-1 text-white bg-green-500 rounded text-xs hover:bg-primary-light flex items-center justify-center"
              onClick={handleView(row)}
            >
              <FaEye className="text-sm" />
            </Button>
            <Button
              text="sample"
              onClick={() => setShowModal(true)}
              className="flex items-center px-2 py-1 text-white bg-primary rounded text-xs hover:bg-primary-light"
            >
              <PiTestTubeFill className="text-sm mr-2" />
            </Button>
          </>
        )}
      />
      {showModal && (
        <Modal
          isOpen={showModal}
          title="Collect Sample"
          onClose={() => setShowModal(false)}
          modalClassName="max-w-xl"
        >
          <SampleCollect />
        </Modal>
      )}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default PendingTable;
