import React, { useState, useEffect } from 'react';
import { useLabs } from '@/context/LabContext';
import { getAllVisits,getPatientByVisitIdAndVisitDetails} from '@/../services/patientServices';
import { toast } from 'react-toastify';
import TableComponent from '../../../common/TableComponent';
import Pagination from '../../../common/Pagination';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import PatientVisitDetails from './PatientVisitDetails';
import Modal from '../../../common/Model';
import { Patient } from '@/types/patient/patient';

const VisitingList: React.FC = () => {
  const [visits, setVisits] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredVisits, setFilteredVisits] = useState<any[]>([]);
  const { currentLab } = useLabs();
  const [patinetVisitDetails ,setPatientVisitDetails] = useState<Patient>();
  const [showVisitDetails, setShowVisitDetails] = useState<boolean>(false);

  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);

  // Transform visit data
  const transformVisits = (data: any[]) =>
    data.map((item) => ({

      visitId: item.visit.visitId,
      Name: item.firstName,
      visitDate: item.visit.visitDate,
      visitType: item.visit.visitType,
      visitStatus: item.visit.visitStatus,
      totalAmount: item.visit.billing.totalAmount,
    }));

  // Fetch Visits Data
  useEffect(() => {
    const fetchVisits = async () => {
      try {
        if (currentLab?.id) {
          const response = await getAllVisits(currentLab.id);
          console.log('response', response);
          if (response?.status === 'success') {
            const transformedData = transformVisits(response.data || []);
            setVisits(transformedData);
          } else {
            toast.error(response?.message || 'Failed to fetch visits', { autoClose: 2000 });
          }
        }
      } catch (error: any) {
        toast.error(error.message || 'An error occurred while fetching visits', { autoClose: 2000 });
      }
    };
    fetchVisits();
  }, [currentLab]);

  // Filter Visits by Search Query
  useEffect(() => {
    const results = visits.filter((visit) =>
      Object.values(visit)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredVisits(results);
    setCurrentPage(1); // Reset to the first page on new search
  }, [searchQuery, visits]);

  // Pagination Logic
  const paginatedVisits = filteredVisits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Action Handlers
  const handleView = (visit: any) => {
    // toast.info(`Viewing details for Visit ID: ${visit.visitId}`, { autoClose: 2000 });
    setShowVisitDetails(true);
    console.log('visit', visit);
    if (currentLab?.id !== undefined) {
      getPatientByVisitIdAndVisitDetails(currentLab.id, visit).then((response) => {
      console.log('response', response);
      setPatientVisitDetails(response);
      });
    }
  };

  const handleUpdate = (visit: any) => {
    toast.info(`Editing Visit ID: ${visit.visitId}`, { autoClose: 2000 });
  };

  const handleDelete = async (visitId: string) => {
    if (confirm('Are you sure you want to delete this visit?')) {
      // try {
      //   const response = await deleteVisit(visitId);
      //   if (response?.status === 'success') {
      //     toast.success('Visit deleted successfully', { autoClose: 2000 });
      //     setVisits((prevVisits) => prevVisits.filter((v) => v.visitId !== visitId));
      //   } else {
      //     toast.error(response?.message || 'Failed to delete visit', { autoClose: 2000 });
      //   }
      // } catch (error: any) {
      //   toast.error(error.message || 'An error occurred while deleting visit', { autoClose: 2000 });
      // }
    }
  };


  // console.log('patinetVisitDetails',patinetVisitDetails);

  const columns = [
    { header: 'Visit ID', accessor: 'visitId' },
    { header: 'Name', accessor: 'Name' },
    { header: 'Visit Date', accessor: 'visitDate' },
    { header: 'Visit Type', accessor: 'visitType' },
    { header: 'Visit Status', accessor: 'visitStatus' },
    { header: 'Total Amount', accessor: 'totalAmount' },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex gap-2">
          <button
            className="px-2 py-1 text-white bg-primary-light rounded hover:bg-blue-600"
            onClick={() => handleView(row.visitId)}
          >
            <FaEye />
          </button>
          <button
            className="px-2 py-1 text-white bg-green-500 rounded hover:bg-green-600"
            onClick={() => handleUpdate(row)}
          >
            <FaEdit />
          </button>
          <button
            className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
            onClick={() => handleDelete(row.visitId)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <input
        type="text"
        placeholder="Search Visits"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-1 border border-gray-300 rounded-md mb-4 text-sm"
      />
      <TableComponent
        data={paginatedVisits}
        columns={columns}
        noDataMessage="No visits found"
        
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {
        showVisitDetails && patinetVisitDetails && 
        <Modal
        title="Visit Details"
        isOpen={showVisitDetails}
        onClose={() => setShowVisitDetails(false)}
        modalClassName=' max-w-6xl h-[40rem] overflow-y-scroll'   
        >
          <PatientVisitDetails 
          patinetVisitDetails={patinetVisitDetails}
          />
        </Modal>
      }
    </div>
  );
};

export default VisitingList;
