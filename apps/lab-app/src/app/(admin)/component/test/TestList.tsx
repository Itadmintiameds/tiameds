// 'use client';
// import { deleteTest, getTests } from '@/../../services/testService';
// import Button from "@/app/(admin)/component/common/Button";
// import Loader from "@/app/(admin)/component/common/Loader";
// import Pagination from '@/app/(admin)/component/common/Pagination';
// import { useLabs } from '@/context/LabContext';
// import { TestList } from '@/types/test/testlist';
// import { Plus } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { FaTimes } from 'react-icons/fa';
// import { FaTrashCan } from "react-icons/fa6";
// import { MdModeEditOutline } from "react-icons/md";
// import { toast } from 'react-toastify';
// import Modal from '../common/Model';
// import AddTest from './AddTest';
// import TableComponent from '../common/TableComponent';
// import TestEditComponent from './TestEditComponent';
// import { FaCloudDownloadAlt } from 'react-icons/fa';
// import { downloadTestCsv, downloadTestCsvExcel } from '@/../services/testService';
// import * as XLSX from 'xlsx';
// import Papa from 'papaparse';

// export const TestLists = () => {
//   const [tests, setTests] = useState<TestList[]>([]);
//   const [filteredTests, setFilteredTests] = useState<TestList[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [category, setCategory] = useState('');
//   const [sortOrder, setSortOrder] = useState<'low' | 'high' | ''>('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 20;
//   const [isModalOpen, setModalOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [editPopup, setEditPopup] = useState(false);
//   const { currentLab } = useLabs();
//   const [updateList, setUpdateList] = useState(false);
//   const [updateTest, setUpdateTest] = useState<TestList>();

//   useEffect(() => {
//     if (currentLab) {
//       setLoading(true);
//       getTests(currentLab.id.toString())
//         .then((tests) => {
//           setTests(tests);
//           setFilteredTests(tests);
//         })
//         .catch(console.error)
//         .finally(() => setLoading(false));
//     }
//   }, [currentLab, updateList]);

//   useEffect(() => {
//     let updatedTests = [...tests];
//     updatedTests.sort((a, b) => b.id - a.id);
//     if (category) updatedTests = updatedTests.filter((test) => test.category === category);
//     if (searchTerm) updatedTests = updatedTests.filter((test) => test.name.toLowerCase().includes(searchTerm.toLowerCase()));
//     if (sortOrder === 'low') updatedTests.sort((a, b) => a.price - b.price);
//     if (sortOrder === 'high') updatedTests.sort((a, b) => b.price - a.price);
//     setFilteredTests(updatedTests);
//     setCurrentPage(1);
//   }, [tests, searchTerm, category, sortOrder, updateList]);

//   const currentTests = filteredTests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   const clearFilters = () => {
//     setSearchTerm('');
//     setCategory('');
//     setSortOrder('');
//     setFilteredTests(tests);
//   };


//    // Download CSV
//     const handleDownloadCsv = async () => {
//       try {
//         if (!currentLab?.id) {
//           toast.error('Current lab is not selected.');
//           return;
//         }
  
//         await downloadTestCsv(currentLab.id.toString());
//         toast.success('CSV file downloaded successfully!');
//       } catch (error) {
//         console.error(error);
//         toast.error('An error occurred while downloading the CSV file.');
//       }
//     };
  
//     // Download Excel
//     const handleDownloadExcel = async () => {
//       try {
//         if (!currentLab?.id) {
//           toast.error('Current lab is not selected.');
//           return;
//         }
  
//         // Fetch the CSV content as text
//         const csvText = await downloadTestCsvExcel(currentLab.id.toString());
  
//         // Parse CSV to JSON
//         const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  
//         if (!data.length) {
//           toast.error('No data found to export.');
//           return;
//         }
  
//         // Convert JSON to Excel
//         const worksheet = XLSX.utils.json_to_sheet(data);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Data');
  
//         // Save as Excel file
//         XLSX.writeFile(workbook, 'test_data.xlsx');
  
//         toast.success('Excel file downloaded successfully!');
//       } catch (error) {
//         console.error(error);
//         toast.error('An error occurred while downloading the Excel file.');
//       }
//     };

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="text-xl font-bold">Tests</h1>
//         <Button text="Add Test" onClick={() => setModalOpen(true)}
//           className='px-4 py-1 text-xs bg-primary text-textzinc rounded-md hover:bg-primarylight focus:outline-none rounded'
//         >
//           <Plus className="h-4 w-4" />
//         </Button>
//       </div>

//       <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}
//         modalClassName='max-w-sm'
//       >
//         <AddTest
//           updateList={updateList}
//           setUpdateList={setUpdateList}
//           closeModal={() => setModalOpen(false)} />
//       </Modal>
//       <div className="flex justify-end mb-4"></div>
//         <Button 
//         text="Download CSV"
//          onClick={handleDownloadCsv}
//           className="mr-2">
//           <FaCloudDownloadAlt className="inline mr-1" />
//         </Button>
//         <Button
//           text="Download Excel"
//           onClick={handleDownloadExcel}
//           className="mr-2">
//           <FaCloudDownloadAlt className="inline mr-1" />
//         </Button>

//       <Modal
//         isOpen={editPopup}
//         onClose={() => setEditPopup(false)}
//         modalClassName='max-w-sm'
//       >
//         <TestEditComponent
//           updateList={updateList}
//           setUpdateList={setUpdateList}
//           closeModal={() => setEditPopup(false)}
//           test={updateTest}
//         />
//       </Modal>

//       {loading ? (
//         <div className="flex justify-center items-center h-48">
//           <Loader />
//         </div>
//       ) : (
//         <>
//           <div className="flex gap-4 mb-4 items-center">
//             <input type="text" placeholder="Search By Name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-1/4 text-xs border border-gray-300 p-2 rounded-md" />
//             <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-1/4 text-xs border border-gray-300 p-2 rounded-md">
//               <option value="">All Categories</option>
//               {Array.from(new Set(tests.map((test) => test.category))).map((cat) => (
//                 <option key={cat} value={cat}>{cat}</option>
//               ))}
//             </select>
//             <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'low' | 'high')} className="w-1/4 text-xs border border-gray-300 p-2 rounded-md">
//               <option value="">Sort by Price</option>
//               <option value="low">Low to High</option>
//               <option value="high">High to Low</option>
//             </select>
//             <button onClick={clearFilters} className="text-xs text-red-500 flex items-center gap-1">
//               <FaTimes className="text-xs" /> Clear Filters
//             </button>
//           </div>

//           <TableComponent
//             data={currentTests}
//             columns={[
//               { header: "#", accessor: (test) => test.id },
//               { header: "Name", accessor: (test) => test.name },
//               { header: "Category", accessor: (test) => test.category },
//               { header: "Price (₹)", accessor: (test) => `₹${test.price}` },
//               // { header: "Created At", accessor: (test) => test.createdAt },
//               // { header: "Updated At", accessor: (test) => test.updatedAt },
//               {
//                 header: "Actions",
//                 accessor: (test) => (
//                   <div className="flex justify-around">
//                     <FaTrashCan className="text-delete text-xl cursor-pointer hover:deletehover" onClick={() => {
//                       if (currentLab) {
//                         deleteTest(test.id.toString(), currentLab.id.toString()).then(() => {
//                           setTests(prev => prev.filter(t => t.id !== test.id));
//                           toast.success('Test deleted successfully');
//                         }).catch(
//                           (err) => {
//                             toast.error(err.message);
//                           }
//                         );
//                       }
//                     }} />

//                     <MdModeEditOutline
//                       onClick={() => {
//                         setEditPopup(true);
//                         setUpdateTest(test);
//                       }}
//                       className="text-updatebutton text-xl cursor-pointer hover:text-updatehover" />
//                   </div>
//                 ),
//               },
//             ]}
//           />
//           <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredTests.length / itemsPerPage)} onPageChange={setCurrentPage} />
//         </>
//       )}
//     </div>
//   );
// };

// export default TestLists;









'use client';
import { deleteTest, getTests } from '@/../../services/testService';
import { downloadTestCsv, downloadTestCsvExcel } from '@/../services/testService';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import { Plus } from 'lucide-react';
import Papa from 'papaparse';
import { useEffect, useMemo, useState } from 'react';
import { FaDownload, FaFileExcel, FaFilter, FaSearch, FaTimes, FaTrash } from 'react-icons/fa';
import { MdModeEditOutline } from "react-icons/md";
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

// Components
import Button from "@/app/(admin)/component/common/Button";
import Loader from "@/app/(admin)/component/common/Loader";
import Pagination from '@/app/(admin)/component/common/Pagination';
import Modal from '../common/Model';
import TableComponent from '../common/TableComponent';
import AddTest from './AddTest';
import TestEditComponent from './TestEditComponent';

const ITEMS_PER_PAGE = 10;

export const TestLists = () => {
  const [tests, setTests] = useState<TestList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortOrder, setSortOrder] = useState<'low' | 'high' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<'name' | 'category' | 'all'>('all');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editPopup, setEditPopup] = useState(false);
  const { currentLab } = useLabs();
  const [updateList, setUpdateList] = useState(false);
  const [updateTest, setUpdateTest] = useState<TestList>();

  useEffect(() => {
    if (currentLab) {
      setLoading(true);
      getTests(currentLab.id.toString())
        .then((tests) => {
          setTests(tests);
        })
        .catch((error) => {
          toast.error(error.message || 'Failed to load tests');
        })
        .finally(() => setLoading(false));
    }
  }, [currentLab, updateList]);

  // Filter and sort tests
  const filteredTests = useMemo(() => {
    let results = [...tests];
    
    // Apply search filter based on active filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (activeFilter === 'name') {
        results = results.filter(test => test.name.toLowerCase().includes(term));
      } else if (activeFilter === 'category') {
        results = results.filter(test => test.category.toLowerCase().includes(term));
      } else {
        results = results.filter(test => 
          test.name.toLowerCase().includes(term) || 
          test.category.toLowerCase().includes(term)
        );
      }
    }

    // Apply category filter
    if (category) {
      results = results.filter(test => test.category === category);
    }

    // Apply sorting
    if (sortOrder === 'low') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'high') {
      results.sort((a, b) => b.price - a.price);
    }

    return results;
  }, [tests, searchTerm, category, sortOrder, activeFilter, updateList]);

  // Pagination
  const paginatedTests = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTests, currentPage]);

  const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE);
  const categories = useMemo(() => Array.from(new Set(tests.map(test => test.category))), [tests]);

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
      header: "Test ID", 
      accessor: (test: TestList) => test.id,
      className: "w-24 text-center"
    },
    { 
      header: "Test Name", 
      accessor: (test: TestList) => test.name,
      className: "min-w-[200px]"
    },
    { 
      header: "Category", 
      accessor: (test: TestList) => test.category,
      className: "min-w-[150px]"
    },
    { 
      header: "Price", 
      accessor: (test: TestList) => (
        <span className="font-medium text-green-700">
          ₹{test.price.toFixed(2)}
        </span>
      ),
      className: "w-32 text-right"
    },
    {
      header: "Actions",
      accessor: (test: TestList) => (
        <div className="flex justify-center gap-4">
          <MdModeEditOutline
            onClick={() => {
              setEditPopup(true);
              setUpdateTest(test);
            }}
            className="text-updatebutton text-xl cursor-pointer hover:text-updatehover" />
          <FaTrash 
            className="text-delete text-xl cursor-pointer hover:deletehover" 
            onClick={() => {
              if (currentLab) {
                deleteTest(test.id.toString(), currentLab.id.toString())
                  .then(() => {
                    setUpdateList(prev => !prev);
                    toast.success('Test deleted successfully');
                  })
                  .catch((err) => {
                    toast.error(err.message);
                  });
              }
            }} 
          />
        </div>
      ),
      className: "w-32 text-center"
    },
  ];

  return (
    <div className="w-full bg-gray-50 p-6 rounded-xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Test List</h2>
          <p className="text-gray-500">Browse and manage laboratory tests</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            text=""
            onClick={() => setModalOpen(true)}
            className="bg-primary hover:bg-primarylight text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Test</span>
          </Button>
          <Button
            text=""
            onClick={handleDownloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaFileExcel />
            <span className="hidden sm:inline">Excel</span>
          </Button>
          <Button
            text=""
            onClick={handleDownloadCsv}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaDownload />
            <span className="hidden sm:inline">CSV</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Tests</h3>
          <p className="text-2xl font-bold text-gray-800">{tests.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Categories</h3>
          <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Showing</h3>
          <p className="text-2xl font-bold text-gray-800">
            {filteredTests.length} {searchTerm ? "results" : "tests"}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search with filter */}
          <div className="relative col-span-1 md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button 
                className="h-full px-3 flex items-center text-gray-500 hover:text-blue-600"
                onClick={() => setActiveFilter(prev => 
                  prev === 'all' ? 'name' : prev === 'name' ? 'category' : 'all'
                )}
              >
                <FaFilter className="mr-1 text-sm" />
                <span className="text-xs capitalize">{activeFilter}</span>
              </button>
            </div>
            <input
              type="text"
              placeholder={`Search by ${activeFilter === 'all' ? 'name or category' : activeFilter}...`}
              className="pl-10 pr-24 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Category filter */}
          <select 
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sort by Price</option>
            <option value="low">Low to High</option>
            <option value="high">High to Low</option>
          </select>
        </div>

        {(searchTerm || category || sortOrder) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <FaTimes className="text-xs" /> Clear all filters
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

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
          <Loader />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {paginatedTests.length > 0 ? (
            <>
              <TableComponent
                data={paginatedTests}
                columns={columns}
              />
              
              <div className="p-4 border-t border-gray-100">
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <FaSearch className="mx-auto text-4xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                {searchTerm ? "No matching tests found" : "No test data available"}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? "Try adjusting your search or filters" : "Please check back later or contact support"}
              </p>
              {searchTerm && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestLists;




