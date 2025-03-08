import { useState, useEffect } from "react";
import { getTestReferanceRange, updateTestReferanceRange, deleteTestReferanceRange, addTestReferanceRange} from "../../../../../services/testService";
import { TestReferancePoint } from "@/types/test/testlist";
import Loader from "../../component/common/Loader";
import { useLabs } from "@/context/LabContext";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Modal from "../common/Model";
import TestEditReferance from "./TestEditReferance";
import { toast } from "react-toastify";
import TableComponent from "../common/TableComponent";
import AddTestReferanceNew from "./AddTestReferanceNew";
import Button from "../common/Button";
import { FaDownload, FaFileExcel } from "react-icons/fa";
import AddExistingTestReferance from "./AddExistingTestReferance";
import Pagination from "../common/Pagination";
import * as XLSX from 'xlsx';
import { saveAs } from "file-saver";
import { fetchTestReferenceRangeCsv } from '@/../services/testService';
import Papa from 'papaparse';

const TestReferancePoints = () => {
  const [referencePoints, setReferencePoints] = useState<TestReferancePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<TestReferancePoint | null>(null);
  const [formData, setFormData] = useState<TestReferancePoint>({} as TestReferancePoint);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newReferanceRecord, setNewReferanceRecord] = useState<TestReferancePoint>({
    gender: "F",
    ageMin: 0,
  } as TestReferancePoint);

  const [existingModalOpen, setExistingModalOpen] = useState(false);
  const [existingTestReferanceRecord, setExistingTestReferanceRecord] = useState<TestReferancePoint>({ gender: "F" } as TestReferancePoint);
  const { currentLab } = useLabs();

  useEffect(() => {
    if (currentLab) {
      setLoading(true);
      getTestReferanceRange(currentLab.id.toString())
        .then((data) => setReferencePoints(data))
        .catch((error) => toast.error((error as Error).message))
        .finally(() => setLoading(false));
    }
  }, [currentLab]);

  if (loading) return <Loader />;

  const groupedData = referencePoints.reduce((acc, test) => {
    if (!acc[test.category]) acc[test.category] = {};
    if (!acc[test.category][test.testName]) acc[test.category][test.testName] = [];
    acc[test.category][test.testName].push(test);
    return acc;
  }, {} as Record<string, Record<string, TestReferancePoint[]>>);

  const handleEditRecord = (test: TestReferancePoint) => {
    setEditRecord(test);
    setFormData(test);
    setEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLab || !editRecord) return;

    try {
      setLoading(true);
      await updateTestReferanceRange(currentLab.id.toString(), editRecord.id.toString(), formData);

      setReferencePoints(prevPoints =>
        prevPoints.map((item) =>
          item.id === editRecord.id ? { ...item, ...formData } : item
        )
      );

      toast.success("Test reference range updated successfully.");
      setEditModalOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentLab) return;

    try {
      setLoading(true);
      await deleteTestReferanceRange(currentLab.id.toString(), id);
      setReferencePoints((prev) => prev.filter((item) => item.id.toString() !== id));
      toast.success("Test reference range deleted successfully.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewReferanceRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLab || !newReferanceRecord) return;

    try {
      setLoading(true);
      await addTestReferanceRange(currentLab.id.toString(), newReferanceRecord);
      setReferencePoints((prev) => [...prev, newReferanceRecord]);
      toast.success("Test reference range added successfully.", { autoClose: 2000 });
      setAddModalOpen(false);
      setNewReferanceRecord({} as TestReferancePoint);
    } catch (error) {
      toast.error((error as Error).message, { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExistingReferanceRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLab || !existingTestReferanceRecord) return;

    try {
      setLoading(true);
      await addTestReferanceRange(currentLab.id.toString(), existingTestReferanceRecord);
      setReferencePoints((prev) => [...prev, existingTestReferanceRecord]);
      toast.success("Test reference range added successfully.", { autoClose: 2000 });
      setExistingModalOpen(false);
      setExistingTestReferanceRecord({} as TestReferancePoint);
    } catch (error) {
      toast.error((error as Error).message, { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      if (!currentLab?.id) {
        toast.error('Current lab is not selected.');
        return;
      }

      const csvText = await fetchTestReferenceRangeCsv(currentLab.id.toString());

      // Convert CSV text into a downloadable Blob
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'test_reference_range.csv');

      toast.success('CSV file downloaded successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download CSV.');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      if (!currentLab?.id) {
        toast.error('Current lab is not selected.');
        return;
      }
      const csvText = await fetchTestReferenceRangeCsv(currentLab.id.toString());
      const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      if (!data.length) {
        toast.error('No data found to export.');
        return;
      }
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Reference Range');
      XLSX.writeFile(workbook, 'test_reference_range.xlsx');
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download Excel.');
    }
  };
  const columns = [
    { header: "Description", accessor: (test: TestReferancePoint) => test.testDescription },
    { header: "Gender", accessor: (test: TestReferancePoint) => test.gender },
    {
      header: "Age",
      accessor: (test: TestReferancePoint) => `${test.ageMin} - ${test.ageMax}`
    },
    {
      header: "Range",
      accessor: (test: TestReferancePoint) => `${test.minReferenceRange} - ${test.maxReferenceRange} ${test.units}`
    },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 my-4">
        <h2 className="text-lg font-semibold text-blue-600">Test Reference Range</h2>
        <div className="flex space-x-2">
          <Button
            text="Add Test Reference"
            onClick={() => setAddModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition flex items-center text-sm"
          >
            <FaPlus className="mr-1" />
          </Button>
         
          <Button
            text="Download CSV"
            onClick={() => { handleDownloadCsv() }}
            className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition flex items-center text-sm"
          >
            <FaDownload className="mr-1" />
          </Button>
          <Button
            text="Download Excel"
            onClick={() => { handleDownloadExcel() }}
            className="bg-indigo-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-600 transition flex items-center text-sm"
          >
            <FaFileExcel className="mr-1" />
          </Button>
        </div>
      </div>
      {Object.entries(groupedData).map(([category, tests]) => (
        <div key={category} className="rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-3">{category}</h3>
          {Object.entries(tests).map(([testName, records]) => (
            <div key={testName} className="mb-4">
              <div className="flex justify-between items-center bg-cardbackground p-3 rounded-md shadow-md mb-4">
                <h4 className="text-primary font-medium">{testName}</h4>
                <Button
                  text=""
                  onClick={() => {
                    setExistingModalOpen(true);
                    setExistingTestReferanceRecord((prev) => ({ ...prev, testName, category }));
                  }}
                  className="bg-green-500 text-white px-3 py-2 rounded-lg shadow hover:bg-green-600 transition flex items-center text-xs"
                >
                  <FaPlus className="mr-1" />
                  Add Test Reference for {testName}
                </Button>
              </div>

              {/* Table Component */}
              <TableComponent
                data={records}
                columns={columns}
                actions={(test) => (
                  <>
                    <FaEdit
                      onClick={() => handleEditRecord(test)}
                      className="text-blue-500 cursor-pointer hover:scale-110 transition"
                      title="Edit"
                    />
                    <FaTrash
                      onClick={() => handleDelete(test.id.toString())}
                      title="Delete"
                      className="text-red-500 cursor-pointer hover:scale-110 transition"
                    />
                  </>
                )}
              />
            </div>
          ))}
        </div>
      ))}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          title="Edit Test Reference Point"
          onClose={() => setEditModalOpen(false)}
          modalClassName="max-w-2xl"
        >
          <TestEditReferance
            editRecord={editRecord}
            setEditRecord={setEditRecord}
            setEditModalOpen={setEditModalOpen}
            handleUpdate={handleUpdate}
            handleChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
            formData={formData}
            setFormData={setFormData}
          />
        </Modal>
      )}
      {addModalOpen && (
        <Modal
          isOpen={addModalOpen}
          title=""
          onClose={() => setAddModalOpen(false)}
          modalClassName="max-w-2xl"
        >
          <AddTestReferanceNew
            handleAddNewReferanceRecord={handleAddNewReferanceRecord}
            handleChangeRef={(e) => setNewReferanceRecord({ ...newReferanceRecord, [e.target.name]: e.target.value })}
            newReferanceRecord={newReferanceRecord}
            setNewReferanceRecord={setNewReferanceRecord}
          />
        </Modal>
      )}
      {existingModalOpen && (
        <Modal
          isOpen={existingModalOpen}
          title=""
          onClose={() => setExistingModalOpen(false)}
          modalClassName="max-w-2xl"
        >
          <AddExistingTestReferance
            handleAddExistingReferanceRecord={handleAddExistingReferanceRecord}
            handleChangeRef={(e) => setExistingTestReferanceRecord({ ...existingTestReferanceRecord, [e.target.name]: e.target.value })}
            existingTestReferanceRecord={existingTestReferanceRecord}
            setExistingTestReferanceRecord={setExistingTestReferanceRecord}
          />
        </Modal>
      )}

      <Pagination currentPage={1} totalPages={1} onPageChange={() => { }} />

    </div>
  );
};

export default TestReferancePoints;


