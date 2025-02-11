import { getAllVisits } from '@/../services/patientServices';
import { useLabs } from '@/context/LabContext';
import { Patient } from '@/types/patient/patient';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Pagination from '@/app/(admin)/component/common/Pagination';
import TableComponent from '@/app/(admin)/component/common/TableComponent';
import Button from '@/app/(admin)/component/common/Button';
import Modal from '@/app/(admin)/component/common/Model';
import PatientReportDataFill from './Report/PatientReportDataFill';
import { TbReport } from "react-icons/tb";

const CollectionTable: React.FC = () => {
  const { currentLab, setPatientDetails } = useLabs();
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        if (currentLab?.id) {
          const response = await getAllVisits(currentLab.id);
          const visits = response?.data || [];

          // Filter visits where visitStatus is "Collected"
          const pendingVisits = visits.filter((visit: Patient) => visit.visit.visitStatus === "Collected");

          setPatientList(pendingVisits);
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
    { header: 'Visit ID', accessor: (row: Patient) => row.visit.visitId },
    { header: 'Name', accessor: (row: Patient) => `${row.firstName} ${row.lastName}` },
    { header: 'Visit Date', accessor: (row: Patient) => row.visit.visitDate },
    { header: 'Visit Type', accessor: (row: Patient) => row.visit.visitType },
    {
      header: 'Visit Status',
      accessor: (row: Patient) => (
        <span
          className={`
            px-2 py-1 rounded text-white text-xs 
            ${row.visit.visitStatus === 'Collected' ? 'bg-green-500' : ''}
          `}
        >
          {row.visit.visitStatus}
        </span>
      )
    },
    { header: 'Total Amount', accessor: (row: Patient) => row.visit.billing.totalAmount },
  ];

  return (
    <div className="text-xs p-4">
      <TableComponent
        data={paginatedPatients}
        columns={columns}
        actions={(row: Patient) => (
          <>
            <Button
              text=""
              className="px-1 py-0.5 text-white bg-green-500 rounded text-xs hover:bg-primary-light"
              onClick={handleView(row)}
            >
              <FaEye className="text-sm" />
            </Button>
            <Button
              text="Report"
              onClick={() => setShowModal(true)}
              className="flex items-center px-1 py-0.5 text-white bg-primary rounded text-xs hover:bg-primary-light flex justify-around"
            >
              <TbReport className="text-sm mr-1" /> {/* Adding margin-right for spacing */}
            </Button>
          </>
        )}
      />
      {
        showModal && (
          <Modal
            isOpen={showModal}
            title="Collect Sample"
            onClose={() => setShowModal(false)}
            modalClassName='max-w-xl'
          >
            <PatientReportDataFill />
          </Modal>
        )
      }
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default CollectionTable;



