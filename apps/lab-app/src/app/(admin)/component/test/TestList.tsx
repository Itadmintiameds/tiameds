'use client';
import { deleteTest, getTests } from '@/../../services/testService';
import Button from "@/app/(admin)/component/common/Button";
import Loader from "@/app/(admin)/component/common/Loader";
import Pagination from '@/app/(admin)/component/common/Pagination';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FaTrashCan } from "react-icons/fa6";
import { MdModeEditOutline } from "react-icons/md";
import { toast } from 'react-toastify';
import Modal from '../common/Model';
import AddTest from './AddTest';
import TableComponent from '../common/TableComponent';
import TestEditComponent from './TestEditComponent';

export const TestLists = () => {
  const [tests, setTests] = useState<TestList[]>([]);
  const [filteredTests, setFilteredTests] = useState<TestList[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortOrder, setSortOrder] = useState<'low' | 'high' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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
          setFilteredTests(tests);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [currentLab, updateList]);

  useEffect(() => {
    let updatedTests = [...tests];
    updatedTests.sort((a, b) => b.id - a.id);
    if (category) updatedTests = updatedTests.filter((test) => test.category === category);
    if (searchTerm) updatedTests = updatedTests.filter((test) => test.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (sortOrder === 'low') updatedTests.sort((a, b) => a.price - b.price);
    if (sortOrder === 'high') updatedTests.sort((a, b) => b.price - a.price);
    setFilteredTests(updatedTests);
    setCurrentPage(1);
  }, [tests, searchTerm, category, sortOrder, updateList]);

  const currentTests = filteredTests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setSortOrder('');
    setFilteredTests(tests);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Tests</h1>
        <Button text="Add Test" onClick={() => setModalOpen(true)}
          className='px-4 py-1 text-xs bg-primary text-textzinc rounded-md hover:bg-primarylight focus:outline-none rounded'
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}
        modalClassName='max-w-sm'
      >
        <AddTest
          updateList={updateList}
          setUpdateList={setUpdateList}
          closeModal={() => setModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={editPopup}
        onClose={() => setEditPopup(false)}
        modalClassName='max-w-sm'
      >
        <TestEditComponent
          updateList={updateList}
          setUpdateList={setUpdateList}
          closeModal={() => setEditPopup(false)}
          test={updateTest}
        />
      </Modal>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader />
        </div>
      ) : (
        <>
          <div className="flex gap-4 mb-4 items-center">
            <input type="text" placeholder="Search By Name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-1/4 text-xs border border-gray-300 p-2 rounded-md" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-1/4 text-xs border border-gray-300 p-2 rounded-md">
              <option value="">All Categories</option>
              {Array.from(new Set(tests.map((test) => test.category))).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'low' | 'high')} className="w-1/4 text-xs border border-gray-300 p-2 rounded-md">
              <option value="">Sort by Price</option>
              <option value="low">Low to High</option>
              <option value="high">High to Low</option>
            </select>
            <button onClick={clearFilters} className="text-xs text-red-500 flex items-center gap-1">
              <FaTimes className="text-xs" /> Clear Filters
            </button>
          </div>

          <TableComponent
            data={currentTests}
            columns={[
              { header: "#", accessor: (test) => test.id },
              { header: "Name", accessor: (test) => test.name },
              { header: "Category", accessor: (test) => test.category },
              { header: "Price (₹)", accessor: (test) => `₹${test.price}` },
              // { header: "Created At", accessor: (test) => test.createdAt },
              // { header: "Updated At", accessor: (test) => test.updatedAt },
              {
                header: "Actions",
                accessor: (test) => (
                  <div className="flex justify-around">
                    <FaTrashCan className="text-delete text-xl cursor-pointer hover:deletehover" onClick={() => {
                      if (currentLab) {
                        deleteTest(test.id.toString(), currentLab.id.toString()).then(() => {
                          setTests(prev => prev.filter(t => t.id !== test.id));
                          toast.success('Test deleted successfully');
                        }).catch(
                          (err) => {
                            toast.error(err.message);
                          }
                        );
                      }
                    }} />

                    <MdModeEditOutline
                      onClick={() => {
                        setEditPopup(true);
                        setUpdateTest(test);
                      }}
                      className="text-updatebutton text-xl cursor-pointer hover:text-updatehover" />
                  </div>
                ),
              },
            ]}
          />
          <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredTests.length / itemsPerPage)} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
};

export default TestLists;
