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
  const rowsPerPage = 10;

  // Filter patients based on the search term, payment status, and type
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

    return matchesSearchTerm && matchesPaymentFilter && matchesTypeFilter;
  });

  // Handle pagination
  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
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
              className="p-2 rounded-md border border-gray-300 text-xs focus:ring focus:ring-blue-400 focus:outline-none transition duration-200 ease-in-out"
            />
          </div>

          {/* Payment Filter Dropdown */}
          <div className="flex flex-col">
            <label htmlFor="paymentFilter" className="text-xs font-medium text-gray-700">Payment Status</label>
            <select
              id="paymentFilter"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="p-2 w-32 rounded-md border border-gray-300 text-xs focus:ring focus:ring-blue-400 focus:outline-none transition duration-200 ease-in-out"
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
              className="p-2 w-32 rounded-md border border-gray-300 text-xs focus:ring focus:ring-blue-400 focus:outline-none transition duration-200 ease-in-out"
            >
              <option value="all">All Patients</option>
              <option value="ip">IP Patients</option>
              <option value="op">OP Patients</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-center">
            <button
              onClick={() => {
                setSearchTerm('');
                setPaymentFilter('all');
                setTypeFilter('all');
                setCurrentPage(1);
              }}
              className="flex items-center justify-center mt-3 px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition duration-200 ease-in-out focus:ring focus:ring-red-400 focus:outline-none"
            >
              <BackspaceIcon className="w-4 h-4 mr-2" />
              Clear
            </button>
          </div>
        </div>

        {/* New Test Bill Button */}
        <div className='mt-8'>
          <Link href="dashboard/bill"
            className=" sm:mt-0 inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition duration-200 ease-in-out focus:ring focus:ring-indigo-400 focus:outline-none"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Test
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg bg-white shadow-md">
        <table className="min-w-full">
          <thead className="bg-gray-200 text-gray-800 text-xs font-semibold uppercase tracking-wider">
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
                <tr key={patient.patient_no} className="border-t hover:bg-gray-100 transition-colors duration-200">
                  <td className="px-4 py-3 whitespace-nowrap">{patient.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{patient.patient_no}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{patient.patient_contact}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{patient.patient_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{patient.doctor_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{patient.bill_amount}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-md ${patient.payment_status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {patient.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-3 text-center text-gray-500">No patients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      <div className="flex justify-between items-center mt-4">
  <button
    onClick={() => handlePageChange(currentPage - 1)}
    disabled={currentPage === 1}
    className={`px-4 py-2 rounded-md ${
      currentPage > 1 ? 'bg-gray-500 text-white hover:bg-gray-600' : 'bg-gray-300 text-gray-700 cursor-not-allowed'
    } transition duration-200 ease-in-out`}
  >
    Previous
  </button>
  <span className="text-sm text-gray-600">
    Page {currentPage} of {totalPages}
  </span>
  <button
    onClick={() => handlePageChange(currentPage + 1)}
    disabled={currentPage === totalPages}
    className={`px-4 py-2 rounded-md ${
      currentPage < totalPages ? 'bg-gray-500 text-white hover:bg-gray-600' : 'bg-gray-300 text-gray-700 cursor-not-allowed'
    } transition duration-200 ease-in-out`}
  >
    Next
  </button>
</div>

     
    </div>
  );
};

export default Table;

