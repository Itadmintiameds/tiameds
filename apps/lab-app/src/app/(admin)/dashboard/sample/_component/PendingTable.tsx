import { Plus } from 'lucide-react';
import React, { useState } from 'react';

// Sample patient data
const TableData = [
  {
    patinetname: "Jane Cooper",
    gender: "Male",
    age: "25",
    contact: "1234567890",
    lab_name: "Dr. Arjun",
    tests: "Differential Blood Count",
    sample: "EDTA Whole Body",
  },
  {
    patinetname: "John Doe",
    gender: "Male",
    age: "30",
    contact: "0987654321",
    lab_name: "Dr. Smith",
    tests: "Lipid Profile",
    sample: "Serum",
  },
  {
    patinetname: "Emily Clark",
    gender: "Female",
    age: "28",
    contact: "1122334455",
    lab_name: "Dr. Kumar",
    tests: "Complete Blood Count",
    sample: "EDTA Whole Blood",
  },
  {
    patinetname: "Michael Scott",
    gender: "Male",
    age: "40",
    contact: "2233445566",
    lab_name: "Dr. Ross",
    tests: "Liver Function Test",
    sample: "Serum",
  },
  {
    patinetname: "Sarah Parker",
    gender: "Female",
    age: "32",
    contact: "3344556677",
    lab_name: "Dr. Gupta",
    tests: "Thyroid Profile",
    sample: "Serum",
  },
  {
    patinetname: "David Lee",
    gender: "Male",
    age: "45",
    contact: "4455667788",
    lab_name: "Dr. Patel",
    tests: "Renal Function Test",
    sample: "Serum",
  },
  {
    patinetname: "Jessica Brown",
    gender: "Female",
    age: "35",
    contact: "5566778899",
    lab_name: "Dr. Kumar",
    tests: "Urine Culture",
    sample: "Urine",
  },
  {
    patinetname: "Andrew Wilson",
    gender: "Male",
    age: "50",
    contact: "6677889900",
    lab_name: "Dr. Singh",
    tests: "Blood Glucose",
    sample: "Plasma",
  },
  {
    patinetname: "Laura Johnson",
    gender: "Female",
    age: "29",
    contact: "7788990011",
    lab_name: "Dr. Arjun",
    tests: "Vitamin D",
    sample: "Serum",
  },
  {
    patinetname: "Chris Evans",
    gender: "Male",
    age: "35",
    contact: "8899001122",
    lab_name: "Dr. Smith",
    tests: "Electrolytes",
    sample: "Plasma",
  },
  {
    patinetname: "Sophia Miller",
    gender: "Female",
    age: "40",
    contact: "9900112233",
    lab_name: "Dr. Ross",
    tests: "Iron Profile",
    sample: "Serum",
  },
  {
    patinetname: "Daniel King",
    gender: "Male",
    age: "33",
    contact: "1011121314",
    lab_name: "Dr. Gupta",
    tests: "Hemoglobin A1c",
    sample: "EDTA Whole Blood",
  },
  {
    patinetname: "Isabella Moore",
    gender: "Female",
    age: "27",
    contact: "1213141516",
    lab_name: "Dr. Patel",
    tests: "Calcium Levels",
    sample: "Serum",
  },
  {
    patinetname: "James Anderson",
    gender: "Male",
    age: "36",
    contact: "1314151617",
    lab_name: "Dr. Singh",
    tests: "Liver Function Test",
    sample: "Serum",
  },
  {
    patinetname: "Olivia Harris",
    gender: "Female",
    age: "39",
    contact: "1415161718",
    lab_name: "Dr. Kumar",
    tests: "Thyroid Stimulating Hormone (TSH)",
    sample: "Serum",
  },
  {
    patinetname: "Henry Adams",
    gender: "Male",
    age: "42",
    contact: "1516171819",
    lab_name: "Dr. Gupta",
    tests: "C-Reactive Protein (CRP)",
    sample: "Serum",
  },
  {
    patinetname: "Mia Robinson",
    gender: "Female",
    age: "34",
    contact: "1617181920",
    lab_name: "Dr. Patel",
    tests: "Vitamin B12",
    sample: "Serum",
  },
  {
    patinetname: "William Martinez",
    gender: "Male",
    age: "31",
    contact: "1718192021",
    lab_name: "Dr. Ross",
    tests: "Hematocrit",
    sample: "EDTA Whole Blood",
  },
  {
    patinetname: "Amelia Scott",
    gender: "Female",
    age: "26",
    contact: "1819202122",
    lab_name: "Dr. Singh",
    tests: "Cholesterol",
    sample: "Serum",
  },
  {
    patinetname: "Benjamin Lewis",
    gender: "Male",
    age: "29",
    contact: "1920212223",
    lab_name: "Dr. Arjun",
    tests: "Glucose Tolerance Test",
    sample: "Plasma",
  },
];


const PendingTable = () => {
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
          <h1 className="text-base font-semibold leading-6 text-gray-900">Patients</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the patients, including their name, contact, tests, and gender.
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

          {/* Add Patient Button */}
          <button
            type="button"
            className="bg-purple-900 px-3 py-2 text-white text-xs font-semibold rounded-md hover:bg-purple-500"
          >
            <Plus size={16} className="inline-block mr-1 -mt-1" />
            New Collection Center
          </button>
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
                <td className="px-3 py-4 text-xs text-indigo-600 hover:text-indigo-900 cursor-pointer">
                  <button
                    type="button"
                    className="rounded bg-purple-900 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Collect
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

export default PendingTable;
