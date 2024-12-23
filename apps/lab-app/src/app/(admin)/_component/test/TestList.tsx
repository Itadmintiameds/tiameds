'use client';
import { deleteTest, getTests } from '@/../../services/testService';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import { useEffect, useState } from 'react';
import { FaPlus, FaSortAmountDown, FaSortAmountUp, FaTimes } from 'react-icons/fa';
import { FaTrashCan } from "react-icons/fa6";
import { MdModeEditOutline } from "react-icons/md";
import { toast } from 'react-toastify';
import Modal from '../common/Model';
import AddTest from './AddTest';
import Loader from "@/app/(admin)/_component/common/Loader";
import Button from "@/app/(admin)/_component/common/Button";
import { Plus } from 'lucide-react';
import Pagination from '@/app/(admin)/_component/common/Pagination';

export const TestLists = () => {
  const [tests, setTests] = useState<TestList[]>([]); // All fetched tests
  const [filteredTests, setFilteredTests] = useState<TestList[]>([]); // Tests after filters
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortOrder, setSortOrder] = useState<'low' | 'high' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Updated to 20 per page

  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  const closeModal = () => setModalOpen(false);
  const openModal = () => setModalOpen(true);

  const { currentLab } = useLabs();

  useEffect(() => {
    if (currentLab) {
      setLoading(true); // Set loading to true when data is being fetched
      getTests(currentLab.id.toString())
        .then((tests) => {
          setTests(tests);
          setFilteredTests(tests);
        })
        .catch((error) => console.error(error))
        .finally(() => setLoading(false)); // Set loading to false after data fetch
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
        {/* <button
          onClick={openModal}
          className="flex items-center gap-2 bg-indigo-800 text-white px-4 py-2 rounded-md text-xs">
          <FaPlus className="text-xs" /> Add Test
        </button> */}

        <Button
          text="Add Test"
          onClick={openModal}
          className="px-4 py-1 text-xs bg-button-tertiary text-white rounded-md hover:bg-button-secondary focus:outline-none rounded"
        >
          <Plus className="h-4 w-4" />
        </Button>

      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        footer={null}
        modalClassName="max-w-sm"
      >
        <AddTest closeModal={closeModal} />
      </Modal>

      {/* Show Loader if loading */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader />
        </div>
      ) : (
        <>
          {/* Small Filter Section */}
          <div className="flex gap-4 mb-4 items-center">
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
                      <FaTrashCan
                        className="text-red-500 text-xl"
                        onClick={() => {
                          if (currentLab) {
                            deleteTest(test.id.toString(), currentLab.id.toString())
                              .then(() => {
                                setTests((prev) => prev.filter((t) => t.id !== test.id));
                                toast.success('Test deleted successfully', {
                                  position: "top-right",
                                  autoClose: 2000,
                                  hideProgressBar: true,
                                  closeOnClick: true,
                                  pauseOnHover: true,
                                  draggable: true,
                                  progress: undefined,
                                });
                              })
                              .catch((error) => console.error(error));
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
          {/* <div className="flex justify-center items-center mt-4">
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
          </div> */}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default TestLists;
