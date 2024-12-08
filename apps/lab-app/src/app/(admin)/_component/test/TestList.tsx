'use client';
import { deleteTest, getTests } from '@/../../services/testService';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import { useEffect, useState } from 'react';
import { FaPlus, FaSortAmountDown, FaSortAmountUp, FaTimes } from 'react-icons/fa'; // Import React Icons
import { FaTrashCan } from "react-icons/fa6";
import { MdModeEditOutline } from "react-icons/md";
import { toast } from 'react-toastify';
import Modal from '../Modal ';
import AddTest from './AddTest';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'



export const TestLists = () => {
  const [tests, setTests] = useState<TestList[]>([]); // All fetched tests
  const [filteredTests, setFilteredTests] = useState<TestList[]>([]); // Tests after filters
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortOrder, setSortOrder] = useState<'low' | 'high' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Updated to 20 per page

  const [isModalOpen, setModalOpen] = useState(false)

  const closeModal = () => setModalOpen(false)
  const openModal = () => setModalOpen(true)


  const { currentLab } = useLabs();

  useEffect(() => {
    if (currentLab) {
      getTests(currentLab.id.toString())
        .then((tests) => {
          setTests(tests);
          setFilteredTests(tests);
        })
        .catch((error) => console.error(error));
    }
  }, [currentLab]);

  // Apply filters and search
  useEffect(() => {
    let updatedTests = tests;

    // Filter by category
    if (category) {
      updatedTests = updatedTests.filter((test) => test.category === category);
    }

    // Search by name
    if (searchTerm) {
      updatedTests = updatedTests.filter((test) =>
        test.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by price
    if (sortOrder === 'low') {
      updatedTests = updatedTests.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'high') {
      updatedTests = updatedTests.sort((a, b) => b.price - a.price);
    }

    setFilteredTests(updatedTests);
    setCurrentPage(1); // Reset to first page when filters change
  }, [tests, searchTerm, category, sortOrder]);

  // Paginate data
  const totalItems = filteredTests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentTests = filteredTests.slice(startIdx, startIdx + itemsPerPage);


  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setSortOrder('');
    setFilteredTests(tests); // Reset filters
  };

  return (
    <div className="container mx-auto p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Tests</h1>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-indigo-800 text-white px-4 py-2 rounded-md text-xs">
          <FaPlus className="text-xs" /> Add Test
        </button>
      </div>


      {/* ------------------------------------ */}
        <Modal
         isOpen={isModalOpen} 
         onClose={closeModal}
          // title=""
          footer={null}
         >
            <AddTest 
              closeModal={closeModal}
             />
        </Modal>
      {/* ------------------------------------ */}


      {/* Small Filter Section */}
      <div className="flex gap-4 mb-4 items-center">

        {/* <FaSearch className="text-gray-500" /> */}
        <input
          type="text"
          placeholder="Search By Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/4 text-xs focus:outline-none rounded-md border border-gray-300 p-2"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-1/4 text-xs"
        >
          <option value="">All Categories</option>
          {Array.from(new Set(tests.map((test) => test.category))).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'low' | 'high')}
          className="border border-gray-300 rounded-md p-2 w-1/4 text-xs"
        >
          <option value="">Sort by Price</option>
          <option value="low">Low to High</option>
          <option value="high">High to Low</option>
        </select>
        <button
          onClick={clearFilters}
          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
        >
          <FaTimes className="text-xs" /> Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">#</th>
              <th className="border border-gray-300 p-2 text-left">Name</th>
              <th className="border border-gray-300 p-2 text-left">Category</th>
              <th className="border border-gray-300 p-2 text-left">Price (₹)</th>
              <th className="border border-gray-300 p-2 text-left">Created At</th>
              <th className="border border-gray-300 p-2 text-left">Updated At</th>
              <th className="border border-gray-300 p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTests.map((test, index) => (
              <tr key={test.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{index + 1}</td>
                <td className="border border-gray-300 p-2">{test.name}</td>
                <td className="border border-gray-300 p-2">{test.category}</td>
                <td className="border border-gray-300 p-2">₹{test.price}</td>
                <td className="border border-gray-300 p-2">{test.createdAt}</td>
                <td className="border border-gray-300 p-2">{test.updatedAt}</td>
                <td className="border border-gray-300 p-2 flex justify-around">
                  <FaTrashCan className="text-red-500 text-xl"
                    onClick={() => {
                      if (currentLab) {
                        deleteTest(test.id.toString(), currentLab.id.toString())
                          .then(() => {
                            setTests((prev) => prev.filter((t) => t.id !== test.id));
                          })
                          .catch((error) => console.error(error));
                        toast.success('Test deleted successfully', { position: "top-right", autoClose: 2000, hideProgressBar: true, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });
                      }
                    }}
                  />
                  <MdModeEditOutline className="text-indigo-500 text-xl" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 text-xs flex items-center gap-2"
        >
          <FaSortAmountDown className="text-gray-600" /> Previous
        </button>
        <span className="mx-4 text-xs">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 text-xs flex items-center gap-2"
        >
          Next <FaSortAmountUp className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default TestLists;
