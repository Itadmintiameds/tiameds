// import React,{useState,useEffect, use} from 'react'
// import { useLabs } from '@/context/LabContext';
// import {getAllVisits} from '@/../services/patientServices';
// import {toast} from 'react-toastify';
// import TableComponent from '../../../common/TableComponent';
// import { Patient } from '@/types/patient/patient';
// import Pagination from '../../../common/Pagination';



// const VisitingList = () => {
//     const [visits, setVisits] = useState<Patient[]>([])
//     const { currentLab } = useLabs();
//     useEffect(() => {
//         const labs = currentLab;
        
//         const fetchVisits = async () => {
//             try {
//                 if (labs?.id !== undefined) {
//                     const response = await getAllVisits(labs.id);
//                     setVisits(response?.data);
//                 }
//             } catch (error) {
//                 console.log(error)
//             }
//         }
//         fetchVisits()
//     }, [currentLab])

//     const columns = [
//         { header: 'Visit ID', accessor: 'visitId' },
//         { header: 'First Name', accessor: 'firstName' },
//         { header: 'Last Name', accessor: 'lastName' },
//         { header: 'Email', accessor: 'email' },
//         { header: 'Phone', accessor: 'phone' },
//         { header: 'Visit Date', accessor: 'visitDate' },
//         { header: 'Visit Type', accessor: 'visitType' },
//         { header: 'Visit Status', accessor: 'visitStatus' },
//         { header: 'Doctor ID', accessor: 'doctorId' },
//         { header: 'Billing ID', accessor: 'billingId' },
//         { header: 'Total Amount', accessor: 'totalAmount' },
//         { header: 'Payment Status', accessor: 'paymentStatus' },
//         { header: 'Payment Method', accessor: 'paymentMethod' },
//     ];

    

    

    



        
   
   
//     console.log(visits)


//   return (
//     <div>

        
//     </div>
//   )
// }
// export default VisitingList









import React, { useState, useEffect } from 'react';
import { useLabs } from '@/context/LabContext';
import { getAllVisits, deleteVisit } from '@/../services/patientServices';
import { toast } from 'react-toastify';
import TableComponent from '../../../common/TableComponent';
import Pagination from '../../../common/Pagination';

const VisitingList: React.FC = () => {
  const [visits, setVisits] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredVisits, setFilteredVisits] = useState<any[]>([]);
  const { currentLab } = useLabs();

  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);

  // Fetch Visits Data
  useEffect(() => {
    const fetchVisits = async () => {
      try {
        if (currentLab?.id) {
          const response = await getAllVisits(currentLab.id);
          if (response?.status === 'success') {
            setVisits(response.data || []);
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
    toast.info(`Viewing details for Visit ID: ${visit.visitId}`, { autoClose: 2000 });
    // Navigate to a detailed view page or display a modal (implementation depends on your app)
  };

  const handleUpdate = (visit: any) => {
    toast.info(`Editing Visit ID: ${visit.visitId}`, { autoClose: 2000 });
    // Navigate to an edit page or open a modal for updating
  };

  const handleDelete = async (visitId: string) => {
    if (confirm('Are you sure you want to delete this visit?')) {
      try {
        const response = await deleteVisit(visitId);
        if (response?.status === 'success') {
          toast.success('Visit deleted successfully', { autoClose: 2000 });
          setVisits((prevVisits) => prevVisits.filter((v) => v.visitId !== visitId));
        } else {
          toast.error(response?.message || 'Failed to delete visit', { autoClose: 2000 });
        }
      } catch (error: any) {
        toast.error(error.message || 'An error occurred while deleting visit', { autoClose: 2000 });
      }
    }
  };

  const columns = [
    { header: 'Visit ID', accessor: 'visitId' },
    { header: 'First Name', accessor: 'firstName' },
    { header: 'Last Name', accessor: 'lastName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Visit Date', accessor: 'visitDate' },
    { header: 'Visit Type', accessor: 'visitType' },
    { header: 'Visit Status', accessor: 'visitStatus' },
    { header: 'Doctor ID', accessor: 'doctorId' },
    { header: 'Billing ID', accessor: 'billingId' },
    { header: 'Total Amount', accessor: 'totalAmount' },
    { header: 'Payment Status', accessor: 'paymentStatus' },
    { header: 'Payment Method', accessor: 'paymentMethod' },
    {
      header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }: any) => (
        <div className="flex gap-2">
          <button
            className="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
            onClick={() => handleView(row.original)}
          >
            View
          </button>
          <button
            className="px-2 py-1 text-white bg-green-500 rounded hover:bg-green-600"
            onClick={() => handleUpdate(row.original)}
          >
            Update
          </button>
          <button
            className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
            onClick={() => handleDelete(row.original.visitId)}
          >
            Delete
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
        className="w-full p-2 border border-gray-300 rounded-md mb-4"
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
    </div>
  );
};

export default VisitingList;
