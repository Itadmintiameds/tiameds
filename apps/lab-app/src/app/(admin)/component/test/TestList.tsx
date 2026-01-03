
'use client';
import { deleteTest, getTestsPaginated, PaginatedTestResponse } from '@/../../services/testService';
import { downloadTestCsv, downloadTestCsvExcel } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import { Plus } from 'lucide-react';
import Papa from 'papaparse';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { FaDownload, FaFileExcel, FaFilter, FaSearch, FaTimes, FaTrash, FaVial } from 'react-icons/fa';
import { MdModeEditOutline } from "react-icons/md";
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

// Components
// import Button from "@/app/(admin)/component/common/Button";
import Loader from "@/app/(admin)/component/common/Loader";
import Pagination from '@/app/(admin)/component/common/Pagination';
import Modal from '../common/Model';
import TableComponent from '../common/TableComponent';
import AddTest from './AddTest';
import TestEditComponent from './TestEditComponent';

const ITEMS_PER_PAGE = 500;

const TestLists = () => {
  const [tests, setTests] = useState<TestList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortOrder, setSortOrder] = useState<'low' | 'high' | ''>('');
  const [currentPage, setCurrentPage] = useState(0); // API uses 0-based indexing
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'name' | 'category' | 'all'>('all');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editPopup, setEditPopup] = useState(false);
  const { currentLab } = useLabs();
  const [updateList, setUpdateList] = useState(false);
  const [updateTest, setUpdateTest] = useState<TestList>();

  const fetchTests = useCallback(async (page: number = 0, size: number = ITEMS_PER_PAGE) => {
    if (currentLab?.id) {
      setLoading(true);
      try {
        const response: PaginatedTestResponse = await getTestsPaginated(currentLab.id, page, size);
        
        // Safety checks for response structure
        const content = Array.isArray(response?.content) ? response.content : [];
        const totalPages = response?.totalPages ?? 0;
        const totalElements = response?.totalElements ?? 0;
        
        setTests(content);
        setTotalPages(totalPages);
        setTotalElements(totalElements);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching tests.';
        toast.error(errorMessage);
        // Reset to empty state on error
        setTests([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    }
  }, [currentLab?.id]);

  useEffect(() => {
    fetchTests(currentPage, ITEMS_PER_PAGE);
  }, [fetchTests, currentPage, updateList]);

  // Filter and sort tests (client-side filtering on current page)
  const filteredTests = useMemo(() => {
    // Ensure tests is always an array
    const safeTests = Array.isArray(tests) ? tests : [];
    let results = [...safeTests];
    
    // Apply search filter based on active filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (activeFilter === 'name') {
        results = results.filter(test => test?.name?.toLowerCase().includes(term));
      } else if (activeFilter === 'category') {
        results = results.filter(test => test?.category?.toLowerCase().includes(term));
      } else {
        results = results.filter(test => 
          test?.name?.toLowerCase().includes(term) || 
          test?.category?.toLowerCase().includes(term)
        );
      }
    }

    // Apply category filter
    if (category) {
      results = results.filter(test => test?.category === category);
    }

    // Apply sorting
    if (sortOrder === 'low') {
      results.sort((a, b) => (a?.price ?? 0) - (b?.price ?? 0));
    } else if (sortOrder === 'high') {
      results.sort((a, b) => (b?.price ?? 0) - (a?.price ?? 0));
    }

    return results;
  }, [tests, searchTerm, category, sortOrder, activeFilter]);

  // No need for client-side pagination since API handles pagination
  const paginatedTests = filteredTests;

  const categories = useMemo(() => {
    const safeTests = Array.isArray(tests) ? tests : [];
    return Array.from(new Set(safeTests.map(test => test?.category).filter(Boolean)));
  }, [tests]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setSortOrder('');
    setActiveFilter('all');
  };

  const handleDownloadCsv = async () => {
    try {
      if (!currentLab?.id) {
        toast.error('Current lab is not selected.');
        return;
      }
      await downloadTestCsv(currentLab.id.toString());
      toast.success('CSV downloaded successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download CSV');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      if (!currentLab?.id) {
        toast.error('Current lab is not selected.');
        return;
      }
      const csvText = await downloadTestCsvExcel(currentLab.id.toString());
      const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      
      if (!data.length) {
        toast.error('No data found to export');
        return;
      }
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Test List');
      XLSX.writeFile(workbook, 'test_list.xlsx');
      toast.success('Excel exported successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export Excel');
    }
  };

  const columns = [
    { 
      header: "Test Code", 
      accessor: (test: TestList) => (
        <span className="text-sm font-semibold text-blue-600">{test.testCode || `#${test.id}`}</span>
      ),
      className: "w-32 text-center"
    },
    { 
      header: "Test Name", 
      accessor: (test: TestList) => (
        <span className="text-sm font-medium text-gray-900">{test.name}</span>
      ),
      className: "min-w-[200px]"
    },
    { 
      header: "Category", 
      accessor: (test: TestList) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {test.category}
        </span>
      ),
      className: "min-w-[120px]"
    },
    { 
      header: "Price", 
      accessor: (test: TestList) => (
        <span className="text-sm font-semibold text-emerald-700">
          ₹{test.price.toFixed(2)}
        </span>
      ),
      className: "w-24 text-right"
    },
    {
      header: "Actions",
      accessor: (test: TestList) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => {
              setEditPopup(true);
              setUpdateTest(test);
            }}
            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors"
            title="Edit test"
          >
            <MdModeEditOutline className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (currentLab) {
                deleteTest(test.id.toString(), currentLab.id.toString())
                  .then(() => {
                    // Refresh current page after delete
                    fetchTests(currentPage, ITEMS_PER_PAGE);
                    toast.success('Test deleted successfully');
                  })
                  .catch((err) => {
                    toast.error(err.message);
                  });
              }
            }}
            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            title="Delete test"
          >
            <FaTrash className="h-4 w-4" />
          </button>
        </div>
      ),
      className: "w-24 text-center"
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Loader type="progress" fullScreen={false} text="Loading tests..." />
        <p className="mt-4 text-sm text-gray-600">Please wait while we fetch the test data.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 p-6 rounded-xl shadow-lg">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">Test List</h2>
          <p className="text-sm text-gray-600">Browse and manage laboratory tests</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Test</span>
          </button>
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <FaFileExcel className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <FaDownload className="h-4 w-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-green-50 p-3 rounded-lg border border-green-100 mb-4">
        <h4 className="font-semibold text-green-800 mb-2 flex items-center">
          <FaVial className="mr-2 text-green-600" /> Test Statistics
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <h3 className="text-gray-600 text-xs font-medium uppercase tracking-wide mb-1">Total Tests</h3>
            <p className="text-xl font-bold text-gray-900">{totalElements}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <h3 className="text-gray-600 text-xs font-medium uppercase tracking-wide mb-1">Categories</h3>
            <p className="text-xl font-bold text-gray-900">{categories.length}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <h3 className="text-gray-600 text-xs font-medium uppercase tracking-wide mb-1">Showing</h3>
            <p className="text-xl font-bold text-gray-900">
              {filteredTests.length} {searchTerm ? "results" : "tests"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 space-y-3">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          <FaSearch className="mr-2 text-blue-600" /> Filter Tests
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search with filter */}
          <div className="relative col-span-1 md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 h-4 w-4" />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button 
                className="h-full px-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                onClick={() => setActiveFilter(prev => 
                  prev === 'all' ? 'name' : prev === 'name' ? 'category' : 'all'
                )}
              >
                <FaFilter className="mr-1 h-3 w-3" />
                <span className="text-xs font-medium capitalize">{activeFilter}</span>
              </button>
            </div>
            <input
              type="text"
              placeholder={`Search by ${activeFilter === 'all' ? 'name or category' : activeFilter}...`}
              className="pl-10 pr-20 py-2 w-full border border-blue-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0); // Reset to first page when searching
              }}
            />
          </div>

          {/* Category filter */}
          <select 
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(0); // Reset to first page when filtering
            }}
            className="border border-blue-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat: string) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Price sort */}
          <select 
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as 'low' | 'high');
              setCurrentPage(0); // Reset to first page when sorting
            }}
            className="border border-blue-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          >
            <option value="">Sort by Price</option>
            <option value="low">Low to High</option>
            <option value="high">High to Low</option>
          </select>
        </div>

        {(searchTerm || category || sortOrder) && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium transition-colors"
            >
              <FaTimes className="h-3 w-3" /> Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} modalClassName='max-w-sm'>
        <AddTest
          updateList={updateList}
          setUpdateList={setUpdateList}
          closeModal={() => setModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={editPopup} onClose={() => setEditPopup(false)} modalClassName='max-w-sm'>
        <TestEditComponent
          updateList={updateList}
          setUpdateList={setUpdateList}
          closeModal={() => setEditPopup(false)}
          test={updateTest}
        />
      </Modal>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {paginatedTests.length > 0 ? (
            <>
              <TableComponent
                data={paginatedTests}
                columns={columns}
              />
              
              <div className="p-3 border-t border-gray-200 flex justify-center">
                <Pagination 
                  currentPage={currentPage + 1} // Convert 0-based to 1-based for display
                  totalPages={totalPages} 
                  onPageChange={(page) => setCurrentPage(page - 1)} // Convert back to 0-based
                />
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-3">
                <FaSearch className="mx-auto text-3xl" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                {searchTerm ? "No matching tests found" : "No test data available"}
              </h3>
              <p className="text-sm text-gray-600">
                {searchTerm ? "Try adjusting your search or filters" : "Please check back later or contact support"}
              </p>
              {searchTerm && (
                <button
                  onClick={clearFilters}
                  className="mt-3 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
                  }}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
    </div>
  );
};

export default TestLists;




