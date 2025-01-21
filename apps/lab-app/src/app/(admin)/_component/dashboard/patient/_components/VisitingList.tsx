import { getAllVisits } from '@/../services/patientServices';
import { useLabs } from '@/context/LabContext';
import { Patient } from '@/types/patient/patient';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaCloudDownloadAlt, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Pagination from '../../../common/Pagination';

const VisitingList: React.FC = () => {
  const { currentLab, setPatientDetails } = useLabs();
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        if (currentLab?.id) {
          const response = await getAllVisits(currentLab.id);
          setPatientList(response?.data);
        }
      } catch (error: any) {
        toast.error(error.message || 'An error occurred while fetching visits', { autoClose: 2000 });
      }
    };
    fetchVisits();
  }, [currentLab]);

  const handleView = (visit: any) => () => {
    setPatientDetails(visit);
    router.push('/dashboard/patients');

  }
  const handleUpdate = (visit: any) => toast.info(`Updating visit ID: ${visit.visitId}`);
  const handleDelete = (visitId: number) => toast.info(`Deleting visit ID: ${visitId}`);

  const columns = [
    { header: 'Visit ID', accessor: (row: any) => row.visit.visitId },
    { header: 'Name', accessor: (row: any) => `${row.firstName} ${row.lastName}` },
    { header: 'Visit Date', accessor: (row: any) => row.visit.visitDate },
    { header: 'Visit Type', accessor: (row: any) => row.visit.visitType },
    { header: 'Visit Status', accessor: (row: any) => row.visit.visitStatus },
    { header: 'Total Amount', accessor: (row: any) => row.visit.billing.totalAmount },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2">
          <button
            className="px-2 py-1 text-white bg-primary rounded hover:bg-primary-light"
            onClick={handleView}
          >
            <FaEye />
          </button>
          <button
             className="px-2 py-1 text-white bg-green-500 rounded hover:bg-primary-light"
            onClick={() => handleUpdate(row)}
          >
            <FaCloudDownloadAlt  />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="text-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-primary text-white">
              {columns.map((col, index) => (
                <th key={index} className="px-4 py-2 border border-gray-300 text-left">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patientList.length > 0 ? (
              patientList.map((visit, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 border border-gray-300" onClick={handleView(visit)}>
                      {typeof col.accessor === 'function' ? col.accessor(visit) : visit[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-2 text-center">
                  No visits available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VisitingList;



