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
import { addSampleToVisit } from "../../../../../../services/sampleServices";

interface Test {
  name: string;
  category: string;
  price: number;
}

interface HealthPackage {
  id: number;
  packageName: string;
  price: number;
  discount: number;
  netPrice: number;
  tests: Test[];
}

const PendingTable: React.FC = () => {
  const { currentLab, setPatientDetails } = useLabs();
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null); // Store the selected visitId
  const [tests, setTests] = useState<TestList[]>([]);
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);

  const [samples, setSamples] = useState<string[]>([]); 
  const [loading, setLoading] = useState<boolean>(false);
  // const [isTableVisible, setIsTableVisible] = useState(true); // Manage visibility of the table

  const router = useRouter();

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        if (currentLab?.id) {
          const response = await getAllVisits(currentLab.id);
          const visits = response?.data || [];
          const pendingVisits = visits.filter((visit: Patient) => visit.visit.visitStatus === 'Pending');
    
          pendingVisits.sort((a: Patient, b: Patient) => 
            new Date(b.visit.visitDate).getTime() - new Date(a.visit.visitDate).getTime()
          );
          setPatientList(pendingVisits);
          const testIds = pendingVisits.flatMap((visit: Patient) => visit.visit.testIds);
          const uniqueTestIds = Array.from(new Set(testIds));
          const fetchedTests = await Promise.all(
            uniqueTestIds.map((testId) => getTestById(currentLab.id.toString(), testId as number))
          );
          setTests(fetchedTests);
          const packageIds = pendingVisits.flatMap((visit: Patient) => visit.visit.packageIds);
          const uniquePackageIds = Array.from(new Set(packageIds));
          const fetchedPackages = await Promise.all(
            uniquePackageIds.map((packageId) => getHealthPackageById(currentLab.id, packageId as number))
          );
    
          setHealthPackages(fetchedPackages.map((pkg) => pkg.data));
        }
      } catch (error: unknown) {
        toast.error((error as Error).message || 'An error occurred while fetching visits', { autoClose: 2000 });
      }
    };
    
    
    fetchVisits();
  }, [currentLab, loading]);

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

  const handleSampleCollect = (visitId: number) => {
    setSelectedVisitId(visitId); // Set selected visitId when button is clicked
    setShowModal(true);
  };

  const handleVititSample = async () => {
    try {
        if (samples.length === 0) {
            return toast.error("Please add samples to the visit.");
        }
        setLoading(true);
        if (selectedVisitId !== null) {
          await addSampleToVisit(selectedVisitId, samples); // Use selectedVisitId and samples array
        } else {
          toast.error("Visit ID is not available.");
        }

        toast.success("Samples added to the visit successfully.");
        setSamples([]); 
        setLoading(false);
        setShowModal(false);

    } catch (error) {
        console.error("Error adding samples to visit:", error);
        setLoading(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: (row: Patient) => row.visit.visitId },
    { header: 'Name', accessor: (row: Patient) => `${row.firstName} ${row.lastName}` },
    {
      header: 'Date', accessor: (row: Patient) =>
        <span>{new Date(row.visit.visitDate).toLocaleDateString()}</span>
    },
    {
      header: 'Status', accessor: (row: Patient) =>
        <span className='bg-pending  text-white p-1 rounded'>{row.visit.visitStatus}</span>
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
                  <span key={test.id} className="bg-info text-white text-textdark shadow-xl p-0.5 rounded text-sm">
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
      header: 'Package',
      accessor: (row: Patient) => {
        return (
          <div className="flex flex-wrap gap-2">
            {row.visit.packageIds
              .map((packageId) => {
                const packageDetails = healthPackages.find((pkg) => pkg.id === packageId);

                if (packageDetails) {
                  return (
                    <span key={packageDetails.id} className="bg-info text-white text-textdark shadow-xl p-0.5 rounded text-sm">
                      {packageDetails.packageName}
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
              text="View"
              className="p-x-1 py-0.5 text-white bg-view rounded text-xs hover:bg-viewhover flex items-center justify-center"
              onClick={handleView(row)}
            >
              <FaEye className="text-sm mr-2" />
            </Button>
            <Button
              text="Sample"
              onClick={() => row.visit.visitId !== undefined && handleSampleCollect(row.visit.visitId)} // Pass visitId to the function
              className="flex items-center px-2 py-1 text-white bg-edit rounded text-xs hover:bg-edithover"
            >
              <PiTestTubeFill className="text-sm mr-2" />
            </Button>
          </>
          )}
        />
      {showModal && selectedVisitId && (  // Ensure that visitId is available
        <Modal
          isOpen={showModal}
          title="Collect Sample"
          onClose={() => setShowModal(false)}
          modalClassName="max-w-xl"
        >
          <SampleCollect
            visitId={selectedVisitId}
            samples={samples}
            setSamples={setSamples}
            handleVititSample={handleVititSample}
            loading={loading}
          />
        </Modal>
      )}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default PendingTable;


