// 'use client';
// import React, { useState } from 'react';
// import {  EllipsisVerticalIcon, BackspaceIcon } from '@heroicons/react/24/outline';
// import { patients, Patient } from './patientsData'; // Adjust the path as needed
// import { PlusIcon } from 'lucide-react';
// import Link from 'next/link';

// const Table = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [paymentFilter, setPaymentFilter] = useState('all');
//   const [typeFilter, setTypeFilter] = useState('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 10; // Set the number of rows per page

//   // Filter patients based on the search term, payment status, and type
//   const filteredPatients = patients.filter((patient: Patient) => {
//     const matchesSearchTerm =
//       patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       patient.patient_contact.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesPaymentFilter =
//       paymentFilter === 'all' ||
//       (paymentFilter === 'paid' && patient.payment_status === 'Paid') ||
//       (paymentFilter === 'notPaid' && patient.payment_status !== 'Paid');

//     const matchesTypeFilter =
//       typeFilter === 'all' ||
//       (typeFilter === 'ip' && patient.patient_type === 'IP') ||
//       (typeFilter === 'op' && patient.patient_type === 'OP');

//     return matchesSearchTerm && matchesPaymentFilter && matchesTypeFilter;
//   });

//   // Handle pagination
//   const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const currentPatients = filteredPatients.slice(startIndex, startIndex + rowsPerPage);

//   const handlePageChange = (pageNumber: number) => {
//     setCurrentPage(pageNumber);
//   };

//   return (
//     <div className="p-4 bg-white rounded-lg shadow-lg">
//       <div className="my-2">
//         <h1 className="text-sm font-bold text-purple-800">List of Patients</h1>
//       </div>

//       {/* Search and Filter Section */}
//       <div className="flex flex-col sm:flex-row justify-between items-center mb-2 space-y-4 sm:space-y-0">
//         {/* Left Section: Search and Filters */}
//         <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">

//           {/* Search Input */}
//           <div className="flex flex-col">
//             <label htmlFor="search" className="text-xs font-medium text-gray-700 mb-1">Search</label>
//             <input
//               id="search"
//               type="text"
//               placeholder="Search by name or contact"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-64 p-2 rounded-md border border-gray-300 text-xs focus:ring focus:ring-indigo-600 focus:outline-none"
//             />
//           </div>

//           {/* Payment Filter Dropdown */}
//           <div className="flex flex-col">
//             <label htmlFor="paymentFilter" className="text-xs font-medium text-gray-700 mb-1">Payment Status</label>
//             <select
//               id="paymentFilter"
//               value={paymentFilter}
//               onChange={(e) => setPaymentFilter(e.target.value)}
//               className="appearance-none w-40 p-2 rounded-md border border-gray-300 text-xs focus:ring focus:ring-indigo-600 focus:outline-none"
//             >
//               <option value="all">All Patients</option>
//               <option value="paid">Paid</option>
//               <option value="notPaid">Not Paid</option>
//             </select>
//           </div>

//           {/* IP/OP Filter Dropdown */}
//           <div className="flex flex-col">
//             <label htmlFor="typeFilter" className="text-xs font-medium text-gray-700 mb-1">Patient Type</label>
//             <select
//               id="typeFilter"
//               value={typeFilter}
//               onChange={(e) => setTypeFilter(e.target.value)}
//               className="appearance-none w-40 p-2 rounded-md border border-gray-300 text-xs focus:ring focus:ring-indigo-600 focus:outline-none"
//             >
//               <option value="all">All Patients</option>
//               <option value="ip">IP Patients</option>
//               <option value="op">OP Patients</option>
//             </select>
//           </div>

//           {/* Clear Filters Button */}
//           <div className="flex flex-col">
//             <label className="text-xs font-medium text-gray-700 mb-1 invisible">Clear Filters</label>
//             <button
//               onClick={() => {
//                 setSearchTerm('');
//                 setPaymentFilter('all');
//                 setTypeFilter('all');
//                 setCurrentPage(1);
//               }}
//               className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-500 focus:ring focus:ring-indigo-600 focus:outline-none"
//             >
//               <BackspaceIcon className="w-5 h-5 mr-2" />  
//               Clear
//             </button>
//           </div>
//         </div>

//         {/* Right Section: New Test Bill Button */}
//         <div className="sm:ml-6">
//           <Link href="dashboard/bill" 
//             className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-purple-950 text-white text-xs font-medium hover:bg-purple-800 focus:ring focus:ring-indigo-600 focus:outline-none"
//           >
//             <PlusIcon className="w-5 h-5 mr-2" />
//             Create New Test Bill
//           </Link>
//         </div>
//       </div>


//       {/* Table Section */}
//       <div className="overflow-x-auto rounded-lg shadow-lg text-xs">
//         <table className="min-w-full bg-white">
//           <thead className="bg-purple-950 text-white text-left text-xs font-semibold">
//             <tr>
//               <th className="px-2 py-3">Name</th>
//               <th className="px-2 py-3">Patient No</th>
//               <th className="px-2 py-3">Contact</th>
//               <th className="px-2 py-3">Patient Type</th>
//               <th className="px-2 py-3">Doctor</th>
//               <th className="px-2 py-3">Bill No</th>
//               <th className="px-2 py-3">Bill Date</th>
//               <th className="px-2 py-3">Bill Amount</th>
//               <th className="px-2 py-3">Total Amount</th>
//               <th className="px-2 py-3">Payment Status</th>
//               <th className="px-2 py-3">Payment Date</th>
//               <th className="px-2 py-3">Payment Mode</th>
//               <th className="px-2 py-3">Payment Receipt</th>
//               <th className="px-2 py-3">Test Status</th>
//               <th className="px-2 py-3">
//                 <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
//               </th>
//             </tr>
//           </thead>
//           <tbody className="text-gray-700">
//             {currentPatients.length > 0 ? (
//               currentPatients.map((patient: Patient) => (
//                 <tr key={patient.patient_no} className="border-t">
//                   <td className="px-4 py-2 whitespace-nowrap">{patient.name}</td>
//                   <td className="px-4 py-2 whitespace-nowrap">{patient.patient_no}</td>
//                   <td className="px-4 py-2 whitespace-nowrap">{patient.patient_contact}</td>
//                   <td className="px-4 py-2 whitespace-nowrap">{patient.patient_type}</td>
//                   <td className="px-4 py-2 whitespace-nowrap">{patient.doctor_name}</td>
//                   <td className="px-4 py-2 whitespace-nowrap">{patient.bill_no}</td>
//                   <td className="px-4 py-2 whitespace-nowrap">{patient.bill_date}</td>
//                   <td className="px-4 py-2 whitespace-nowrap">{patient.bill_amount}</td>
//                   <td className="px-4 py-2 whitespace-nowrap">{patient.total_amount}</td>
//                   <td className={`px-6 py-2 whitespace-nowrap ${patient.payment_status === 'Paid' ? 'text-green-600' : 'text-red-400'}`}>
//                     {patient.payment_status}
//                   </td>
//                   <td className="px-4 py-2 whitespace-nowrap">{patient.payment_date}</td>
//                   <td className="px-4 py-2 whitespace-nowrap">{patient.payment_mode}</td>
//                   <td className="px-4 py-2 whitespace-nowrap">{patient.payment_receipt}</td>
//                   <td className={`px-4 py-2 whitespace-nowrap ${patient.test_status === 'Pending' ? 'text-red-400' : 'text-green-600'}`}>
//                     {patient.test_status}
//                   </td>
//                   <td className="px-4 py-2 whitespace-nowrap">
//                     <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={15} className="text-center py-4">No patients found.</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination Section */}
//       <nav
//         aria-label="Pagination"
//         className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4"
//       >
//         <div className="hidden sm:block">
//           <p className="text-sm text-gray-700">
//             Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + rowsPerPage, filteredPatients.length)}</span> of{' '}
//             <span className="font-medium">{filteredPatients.length}</span> results
//           </p>
//         </div>
//         <div className="flex flex-1 justify-between sm:justify-end">
//           <button
//             className={`relative inline-flex items-center text-xs rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
//             disabled={currentPage === 1}
//             onClick={() => handlePageChange(currentPage - 1)}
//           >
//             Previous
//           </button>
//           <button
//             className={`relative inline-flex ml-2 text-xs items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
//             disabled={currentPage === totalPages}
//             onClick={() => handlePageChange(currentPage + 1)}
//           >
//             Next
//           </button>
//         </div>
//       </nav>
//     </div>
//   );
// };

// export default Table;




// ========================================
'use client';
import { BackspaceIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Patient, patients } from './patientsData'; // Adjust the path as needed

const Table = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const rowsPerPage = 10; // Set the number of rows per page

  // Filter patients based on the search term, payment status, type, and date range
  const filteredPatients = patients.filter((patient: Patient) => {
    const matchesSearchTerm =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_contact.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPaymentFilter =
      paymentFilter === 'all' ||
      (paymentFilter === 'paid' && patient.payment_status === 'Paid') ||
      (paymentFilter === 'notPaid' && patient.payment_status !== 'Paid');

    const matchesTypeFilter =
      typeFilter === 'all' ||
      (typeFilter === 'ip' && patient.patient_type === 'IP') ||
      (typeFilter === 'op' && patient.patient_type === 'OP');

    const matchesDateRange = (!startDate && !endDate) ||
      (new Date(patient.bill_date) >= new Date(startDate) && new Date(patient.bill_date) <= new Date(endDate));

    return matchesSearchTerm && matchesPaymentFilter && matchesTypeFilter && matchesDateRange;
  });

  // Handle pagination
  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">

          {/* Search Input */}
          <div className="flex flex-col">
            <label htmlFor="search" className="text-xs font-medium text-gray-700">Search</label>
            <input
              id="search"
              type="text"
              placeholder="Search by name or contact"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-1 rounded-md border border-gray-300 text-xs  focus:ring focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          {/* Payment Filter Dropdown */}
          <div className="flex flex-col">
            <label htmlFor="paymentFilter" className="text-xs font-medium text-gray-700">Payment Status</label>
            <select
              id="paymentFilter"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="p-1 w-24 rounded-md border border-gray-300 text-xs  focus:ring focus:ring-indigo-400 focus:outline-none"
            >
              <option value="all">All Patients</option>
              <option value="paid">Paid</option>
              <option value="notPaid">Not Paid</option>
            </select>
          </div>

          {/* Patient Type Dropdown */}
          <div className="flex flex-col">
            <label htmlFor="typeFilter" className="text-xs font-medium text-gray-700">Patient Type</label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-1  w-24 rounded-md border border-gray-300 text-xs focus:ring focus:ring-indigo-400 focus:outline-none"
            >
              <option value="all">All Patients</option>
              <option value="ip">IP Patients</option>
              <option value="op">OP Patients</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex space-x-4">
            <div className="flex flex-col">
              <label htmlFor="startDate" className="text-xs font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-1 rounded-md text-xs border border-gray-300 text-sm focus:ring focus:ring-indigo-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="endDate" className="text-xs font-medium text-gray-700">End Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-1 rounded-md border border-gray-300 text-xs focus:ring focus:ring-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-center">
            <button
              onClick={() => {
                setSearchTerm('');
                setPaymentFilter('all');
                setTypeFilter('all');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="inline-flex items-center justify-center mt-3 px-4 py-1 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-500 focus:ring focus:ring-red-400 focus:outline-none"
            >
              <BackspaceIcon className="w-4 h-4 mr-2" />
              Clear
            </button>
          </div>
        </div>

        {/* New Test Bill Button */}
        <Link href="dashboard/bill"
          className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-950 text-white text-sm font-medium hover:bg-indigo-500 focus:ring focus:ring-indigo-400 focus:outline-none"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Test
        </Link>
      </div>


      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full">
          <thead className="bg-indigo-950 text-white text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Patient No</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Patient Type</th>
              <th className="px-4 py-3 text-left">Doctor</th>
              <th className="px-4 py-3 text-left">Bill Amount</th>
              <th className="px-4 py-3 text-left">Payment Status</th>
              <th className="px-4 py-3 text-center"><EllipsisVerticalIcon className="w-5 h-5 text-gray-400" /></th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {currentPatients.length > 0 ? (
              currentPatients.map((patient: Patient) => (
                <tr key={patient.patient_no} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">{patient.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{patient.patient_no}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{patient.patient_contact}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{patient.patient_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{patient.doctor_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{patient.bill_amount}</td>
                  <td className={`px-4 py-3 whitespace-nowrap ${patient.payment_status === 'Paid' ? 'text-green-600' : 'text-red-500'}`}>
                    {patient.payment_status}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <EllipsisVerticalIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-4">No patients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-700">Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredPatients.length)} of {filteredPatients.length} results</span>
        <div className="flex space-x-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === index + 1 ? 'bg-indigo-950 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Table;
