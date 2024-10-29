import { X } from 'lucide-react';
import React, { useState } from 'react';

// Sample patient data with rejection details
const TableData = [
  {
    patinetname: "Jane Cooper",
    gender: "Male",
    age: "25",
    contact: "1234567890",
    lab_name: "Dr. Arjun",
    tests: "Differential Blood Count",
    sample: "EDTA Whole Body",
    collection_center: "Center A",
    collection_time: "10:00 AM",
    rejected_by: "Dr. Smith",
    rejected_time: "12:00 PM",
    rejected_reason: "Sample contamination",
  },
  {
    patinetname: "John Doe",
    gender: "Male",
    age: "30",
    contact: "0987654321",
    lab_name: "Dr. Smith",
    tests: "Lipid Profile",
    sample: "Serum",
    collection_center: "Center B",
    collection_time: "11:30 AM",
    rejected_by: "Dr. Brown",
    rejected_time: "1:00 PM",
    rejected_reason: "Insufficient sample",
  },
  // Add more data as needed
];

const RejectionTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search and filter logic
  const filteredData = TableData.filter((patient) => {
    const searchMatch = patient.patinetname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contact.includes(searchTerm);
    const genderMatch = genderFilter === 'all' || patient.gender === genderFilter;
    return searchMatch && genderMatch;
  });

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="px-1 sm:px-2 lg:px-4">
      {/* Header with Search and Filters */}
      <div className="sm:flex sm:items-center justify-between mb-4">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Rejection Table</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the rejected collections, including name, tests, rejection details, and reasons.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex space-x-4 items-center mt-4 sm:mt-0">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by name or contact"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-xs focus:ring-indigo-600 focus:outline-none"
          />

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="p-2 px-6 border border-gray-300 rounded-md text-xs focus:ring-purple-600 focus:outline-none"
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-purple-950">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-slate-50 sm:pl-6">Name</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-50">Gender</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-50">Age</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-50">Contact</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-50">Lab Name</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-50">Tests</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-50">Sample</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-50">Collection Center</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-50">Rejected By</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-50">Rejected Time</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-50">Rejected Reason</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-50">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedData.map((patient, index) => (
              <tr key={index}>
                <td className="py-4 pl-4 pr-3 text-xs font-medium text-gray-900 sm:pl-6">{patient.patinetname}</td>
                <td className="px-3 py-4 text-xs text-gray-500">{patient.gender}</td>
                <td className="px-3 py-4 text-xs text-gray-500">{patient.age}</td>
                <td className="px-3 py-4 text-xs text-gray-500">{patient.contact}</td>
                <td className="px-3 py-4 text-xs text-gray-500">{patient.lab_name}</td>
                <td className="px-3 py-4 text-xs text-gray-500">{patient.tests}</td>
                <td className="px-3 py-4 text-xs text-gray-500">{patient.sample}</td>
                <td className="px-3 py-4 text-xs text-gray-500">{patient.collection_center}</td>
                <td className="px-3 py-4 text-xs text-gray-500">{patient.rejected_by}</td>
                <td className="px-3 py-4 text-xs text-gray-500">{patient.rejected_time}</td>
                <td className="px-3 py-4 text-xs text-gray-500">{patient.rejected_reason}</td>
                <td className="px-3 py-4 text-xs">
                  <button
                    type="button"
                    className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
                  >
                    Redraw
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <p className="text-xs text-gray-500">Showing {currentPage} of {totalPages} pages</p>
          <div className="flex space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className={`px-2 py-1 text-xs ${currentPage === 1 ? 'text-gray-400' : 'text-indigo-600'} rounded-md`}
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className={`px-2 py-1 text-xs ${currentPage === totalPages ? 'text-gray-400' : 'text-indigo-600'} rounded-md`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectionTable;
