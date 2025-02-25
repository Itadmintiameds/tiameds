import React, { useEffect, useState, useRef } from 'react';
import { getHealthPackageById } from '@/../services/packageServices';
import { getTestById } from '@/../services/testService';
import Button from '@/app/(admin)/component/common/Button';
import Loader from '@/app/(admin)/component/common/Loader';
import Modal from '@/app/(admin)/component/common/Model';
import Pagination from '@/app/(admin)/component/common/Pagination';
import TableComponent from '@/app/(admin)/component/common/TableComponent';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import { Edit } from 'lucide-react';
import { MdCancelPresentation } from 'react-icons/md';
import { TbReport } from 'react-icons/tb';
import { toast } from 'react-toastify';
import { deleteVisitSample, getAllVisitssamples } from '../../../../../../services/sampleServices';
import PatientReportDataFill from './Report/PatientReportDataFill';
import UpdateSample from './UpdateSample';
import Barcode from 'react-barcode';
import html2canvas from 'html2canvas'; 

interface Patient {
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

interface UpdateSample {
  visitId: number;
  sampleNames: string[];
}

const CollectionTable: React.FC = () => {
  const { currentLab } = useLabs();
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [tests, setTests] = useState<TestList[]>([]);
  const [healthPackages, setHealthPackages] = useState<HealthPackage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [updatedPopUp, setUpdatedPopUp] = useState(false);
  const [updateSample, setUpdateSample] = useState<UpdateSample | null>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);


  const fetchVisits = async () => {
    try {
      if (currentLab?.id) {
        const response: Patient[] = await getAllVisitssamples(currentLab.id);
        const collectedVisits = response.filter((visit) => visit.visitStatus === 'Collected');
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
  }, [currentLab, updatedPopUp]);

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

  const handleDownloadBarcode = async (id: number) => {
    if (barcodeRef.current) {
      const canvas = await html2canvas(barcodeRef.current);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `barcode-${id}.png`;
      link.click();
    }
  };

  const columns = [
    { header: 'ID', accessor: (row: Patient) => row.visitId },
    { header: 'Name', accessor: (row: Patient) => row.patientname },
    { header: 'Date', accessor: (row: Patient) => <span>{new Date(row.visitDate).toLocaleDateString()}</span> },
    { header: 'Status', accessor: (row: Patient) => <span className="bg-blue-300 p-1 rounded">{row.visitStatus}</span> },

    {
      header: 'Tests',
      accessor: (row: Patient) => (
        <div className="flex flex-wrap gap-2">
          {row.testIds.map((testId) => {
            const test = tests.find((t) => t.id === testId);
            return test ? (
              <span key={test.id} className="bg-indigo-300 text-textdark shadow-xl p-0.5 rounded text-sm">
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
      header: 'Samples',
      accessor: (row: Patient) => (
        <div className="flex gap-2 text-xs">
          <Edit className="text-green-500 cursor-pointer" onClick={() => handleUpdate(row.visitId, row.sampleNames)} />
          {row.sampleNames.map((sample, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="bg-purple-200 p-1 rounded">{sample}</span>
              <MdCancelPresentation
                className="text-red-500 cursor-pointer"
                onClick={() => deleteSample(row.visitId, [sample])}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      header: 'Barcode',
      accessor: (row: Patient) => (
        <div className="flex flex-col items-center gap-2">
          <div ref={barcodeRef}>
            <Barcode value={String(row.visitId)} format="CODE128" width={1.5} height={50} displayValue={false} />
          </div>
          <Button
            text="Download Barcode"
            onClick={() => handleDownloadBarcode(row.visitId)}
            className="bg-green-500 text-white py-1 px-2 rounded text-xs"
          />
        </div>
      ),
    },
  ];

  if (!patientList.length) return <Loader />;

  return (
    <div className="text-xs p-4">
      <TableComponent
        data={paginatedPatients}
        columns={columns}
        actions={( ) => (
          <Button
            text="Report"
            onClick={() => setShowModal(true)}
            className="flex items-center px-1 py-0.5 text-white bg-primary rounded text-xs hover:bg-primary-light"
          >
            <TbReport className="text-sm mr-1" />
          </Button>
        )}
      />
      {showModal && (
        <Modal isOpen={showModal} title="Collect Sample" onClose={() => setShowModal(false)} modalClassName="max-w-xl">
          <PatientReportDataFill />
        </Modal>
      )}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {updatedPopUp && (
        <Modal isOpen={updatedPopUp} title="Update Sample" onClose={() => setUpdatedPopUp(false)} modalClassName="max-w-xl">
          <UpdateSample
            visitId={updateSample?.visitId ?? 0}
            sampleNames={updateSample?.sampleNames ?? []}
            onClose={() => setUpdatedPopUp(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default CollectionTable;