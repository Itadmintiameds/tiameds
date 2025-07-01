import { useState, useEffect, useMemo } from "react";
import {
  getTestReferanceRange,
  updateTestReferanceRange,
  deleteTestReferanceRange,
  addTestReferanceRange
} from "../../../../../services/testService";
import { TestReferancePoint } from "@/types/test/testlist";
import Loader from "../../component/common/Loader";
import { useLabs } from "@/context/LabContext";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaDownload, FaFileExcel, FaFilter, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Modal from "../common/Model";
import TestEditReferance from "./TestEditReferance";
import { toast } from "react-toastify";
import TableComponent from "../common/TableComponent";
import AddTestReferanceNew from "./AddTestReferanceNew";
import Button from "../common/Button";
import AddExistingTestReferance from "./AddExistingTestReferance";
import Pagination from "../common/Pagination";
import * as XLSX from 'xlsx';
import { saveAs } from "file-saver";
import { fetchTestReferenceRangeCsv } from '@/../services/testService';
import Papa from 'papaparse';
import { z } from "zod";

export const TestReferancePointSchema = z.object({
  id: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  testName: z.string().min(1, "Test name is required"),
  testDescription: z.string().min(1, "Test description is required"),
  units: z.string().min(1, "Units are required"),
  gender: z.enum(["M", "F", "B"], {
    errorMap: () => ({ message: "Gender must be M (Male), F (Female), or B (Both)" })
  }),
  minReferenceRange: z.union([
    z.number().min(0, "Minimum reference range must be 0 or greater"),
    z.string().min(1, "Minimum reference range is required")
      .transform(val => parseFloat(val))
      .refine(val => !isNaN(val), "Must be a valid number")
  ]),
  maxReferenceRange: z.union([
    z.number().min(0, "Maximum reference range must be 0 or greater"),
    z.string().min(1, "Maximum reference range is required")
      .transform(val => parseFloat(val))
      .refine(val => !isNaN(val), "Must be a valid number")
  ]).optional(),
  ageMin: z.union([
    z.number().min(0, "Minimum age must be 0 or greater"),
    z.string().min(1, "Minimum age is required")
      .transform(val => parseFloat(val))
      .refine(val => !isNaN(val), "Must be a valid number")
  ]),
  ageMax: z.union([
    z.number().min(0, "Maximum age must be 0 or greater"),
    z.string().min(1)
      .transform(val => parseFloat(val))
      .refine(val => !isNaN(val), "Must be a valid number")
  ]).optional(),
  minAgeUnit: z.enum(["YEARS", "MONTHS", "WEEKS", "DAYS"], {
    errorMap: () => ({ message: "Must be YEARS, MONTHS, WEEKS, or DAYS" })
  }),
  maxAgeUnit: z.enum(["YEARS", "MONTHS", "WEEKS", "DAYS"], {
    errorMap: () => ({ message: "Must be YEARS, MONTHS, WEEKS, or DAYS" })
  }).optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
}).refine(data => {
  if (data.ageMax !== undefined && data.ageMin !== undefined) {
    return data.ageMax > data.ageMin;
  }
  return true;
}, {
  message: "Maximum age must be greater than minimum age",
  path: ["ageMax"]
}).refine(data => {
  if (data.maxReferenceRange !== undefined && data.minReferenceRange !== undefined) {
    return data.maxReferenceRange > data.minReferenceRange;
  }
  return true;
}, {
  message: "Maximum reference range must be greater than minimum reference range",
  path: ["maxReferenceRange"]
});

const ITEMS_PER_PAGE = 5;

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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { currentLab } = useLabs();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<"all" | "category" | "test" | "description">("all");
  const [activeTab, setActiveTab] = useState<"all" | "common" | "special">("all");

  const fetchReferencePoints = async () => {
    if (currentLab?.id) {
      setLoading(true);
      try {
        const data = await getTestReferanceRange(currentLab.id.toString());
        setReferencePoints(data);
        if (data.length > 0) {
          const firstCategory = data[0].category;
          setExpandedCategories({ [firstCategory]: true });
        }
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchReferencePoints();
  }, [currentLab]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const { filteredGroupedData, totalCategories, stats } = useMemo(() => {
    let filtered = referencePoints;
    if (activeTab === "common") {
      filtered = filtered.filter(test => test.category.toLowerCase().includes("common"));
    } else if (activeTab === "special") {
      filtered = filtered.filter(test => !test.category.toLowerCase().includes("common"));
    }

    filtered = filtered.filter(test => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      if (activeFilter === "category") {
        return test.category.toLowerCase().includes(lowerSearchTerm);
      } else if (activeFilter === "test") {
        return test.testName.toLowerCase().includes(lowerSearchTerm);
      } else if (activeFilter === "description") {
        return test.testDescription?.toLowerCase().includes(lowerSearchTerm);
      }
      return (
        test?.category.toLowerCase().includes(lowerSearchTerm) ||
        test?.testName.toLowerCase().includes(lowerSearchTerm) ||
        test?.testDescription?.toLowerCase().includes(lowerSearchTerm)
      );
    });

    const stats = {
      totalTests: referencePoints.length,
      totalCategories: new Set(referencePoints.map(t => t?.category)).size,
      filteredTests: filtered.length,
      filteredCategories: new Set(filtered.map(t => t?.category)).size
    };

    const grouped = filtered.reduce((acc, test) => {
      if (!acc[test?.category]) acc[test?.category] = {};
      if (!acc[test?.category][test.testName]) acc[test.category][test.testName] = [];
      acc[test?.category][test?.testName].push(test);
      return acc;
    }, {} as Record<string, Record<string, TestReferancePoint[]>>);

    const categories = Object.keys(grouped);
    const paginatedCategories = categories.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

    const paginatedGroupedData: Record<string, Record<string, TestReferancePoint[]>> = {};
    paginatedCategories?.forEach(category => {
      paginatedGroupedData[category] = grouped[category];
    });

    return {
      filteredGroupedData: paginatedGroupedData,
      totalCategories: categories.length,
      stats
    };
  }, [referencePoints, searchTerm, currentPage, activeFilter, activeTab]);

  const columns = [
    {
      header: "Description",
      accessor: (test: TestReferancePoint) => test.testDescription || "N/A",
      className: "min-w-[200px]"
    },
    {
      header: "Gender",
      accessor: (test: TestReferancePoint) => test.gender,
      className: "text-center"
    },
    {
      header: "Age Range",
      accessor: (test: TestReferancePoint) => (
        <>
          {test.ageMin || "0"}{" "}
          <span className="text-gray-500 text-xs px-2 font-semibold">
            {test.minAgeUnit || "Years"}
          </span>{" "}
          - {test.ageMax || "∞"}{" "}
          <span className="text-gray-500 text-xs px-2 font-semibold">
            {test.maxAgeUnit || "Years"}
          </span>
        </>
      ),
      className: "text-center text-gray-600"
    },
    {
      header: "Reference Range",
      accessor: (test: TestReferancePoint) => (
        <span className="font-medium">
          {test.minReferenceRange} - {test.maxReferenceRange} {test.units && <span className="text-gray-500">{test.units}</span>}
        </span>
      ),
      className: "min-w-[180px]"
    },
  ];

  const handleDownloadCsv = async () => {
    try {
      if (!currentLab?.id) {
        toast.error('Current lab is not selected.');
        return;
      }
      const csvText = await fetchTestReferenceRangeCsv(currentLab.id.toString());
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentLab?.id) {
      toast.error("No lab selected.");
      return;
    }

    if (!editRecord?.id) {
      toast.error("No record selected for editing.");
      return;
    }

    if (!formData || !Object.keys(formData).length) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      
      const dataToUpdate = {
        ...formData,
        minReferenceRange: typeof formData.minReferenceRange === 'string' 
          ? parseFloat(formData.minReferenceRange) 
          : formData.minReferenceRange,
        maxReferenceRange: typeof formData.maxReferenceRange === 'string' 
          ? parseFloat(formData.maxReferenceRange) 
          : formData.maxReferenceRange,
        ageMin: typeof formData.ageMin === 'string' 
          ? parseFloat(formData.ageMin) 
          : formData.ageMin,
        ageMax: typeof formData.ageMax === 'string' 
          ? parseFloat(formData.ageMax) 
          : formData.ageMax,
      };

      await updateTestReferanceRange(
        currentLab.id.toString(), 
        editRecord.id.toString(), 
        dataToUpdate
      );
      
      await fetchReferencePoints(); // Refresh data after update
      
      toast.success("Test reference range updated successfully.");
      setEditModalOpen(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error((error as Error).message || "Failed to update test reference range");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecord = (test: TestReferancePoint) => {
    if (!test?.id) {
      toast.error("Invalid test record");
      return;
    }
    setEditRecord(test);
    setFormData(test);
    setEditModalOpen(true);
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) {
      toast.error("Invalid test reference range ID.", { autoClose: 2000 });
      console.error("Invalid test reference range ID:", id);
      return;
    }

    if (!window.confirm("Are you sure you want to delete this test reference range?")) return;

    if (!currentLab?.id) {
      toast.error("No lab selected.", { autoClose: 2000 });
      return;
    }

    try {
      setLoading(true);
      await deleteTestReferanceRange(currentLab?.id, id);
      await fetchReferencePoints(); // Refresh data after delete
      toast.success("Test reference range deleted successfully.", { autoClose: 2000 });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred while deleting the test reference range.";
      toast.error(message, { autoClose: 2000 });
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewReferanceRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLab?.id) {
      toast.error("No lab selected.");
      return;
    }

    try {
      setLoading(true);
      try {
        TestReferancePointSchema.parse(newReferanceRecord);
      } catch (validationError) {
        toast.error("Validation error: " + (validationError as Error).message);
        return;
      }

      await addTestReferanceRange(currentLab.id.toString(), newReferanceRecord);
      await fetchReferencePoints(); // Refresh data after adding
      
      toast.success("Test reference range added successfully.", { autoClose: 2000 });
      setAddModalOpen(false);
      setNewReferanceRecord({ gender: "F", ageMin: 0 } as TestReferancePoint);
    } catch (error) {
      toast.error((error as Error).message, { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExistingReferanceRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLab?.id) {
      toast.error("No lab selected.");
      return;
    }

    try {
      setLoading(true);
      try {
        TestReferancePointSchema.parse(existingTestReferanceRecord);
      } catch (validationError) {
        toast.error("Validation error: " + (validationError as Error).message);
        return;
      }

      await addTestReferanceRange(currentLab.id.toString(), existingTestReferanceRecord);
      await fetchReferencePoints(); // Refresh data after adding
      
      toast.success("Test reference range added successfully.", { autoClose: 2000 });
      setExistingModalOpen(false);
      setExistingTestReferanceRecord({ gender: "F" } as TestReferancePoint);
    } catch (error) {
      toast.error((error as Error).message, { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader type="progress" text="Loading test reference ranges..." />
        <p className="mt-4 text-sm text-gray-500">Please wait while we fetch the data.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 p-6 rounded-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Test Reference Ranges</h2>
          <p className="text-gray-500">Manage laboratory test reference values</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <div className="relative">
                <button
                  className="h-full px-3 flex items-center text-gray-500 hover:text-blue-600"
                  onClick={() => setActiveFilter(prev => prev === "all" ? "category" : prev === "category" ? "test" : prev === "test" ? "description" : "all")}
                >
                  <FaFilter className="mr-1" />
                  <span className="text-xs capitalize">{activeFilter}</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              placeholder={`Search by ${activeFilter}...`}
              className="pl-10 pr-24 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex gap-2">
            <Button
              text="Add New"
              onClick={() => setAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2"
            >
              <FaPlus />
            </Button>
            <Button
              text="Excel"
              onClick={handleDownloadExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2"
            >
              <FaFileExcel />
            </Button>
            <Button
              text="CSV"
              onClick={handleDownloadCsv}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2"
            >
              <FaDownload />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Tests Referance</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalTests}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Categories</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalCategories}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Showing Tests Referance</h3>
          <p className="text-2xl font-bold text-gray-800">
            {stats.filteredTests} {searchTerm ? "results" : "tests"}
          </p>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === "all" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("all")}
        >
          All Tests
        </button>
      </div>

      {Object.keys(filteredGroupedData).length > 0 ? (
        <>
          {Object.entries(filteredGroupedData).map(([category, tests]) => (
            <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {Object.keys(tests).length} tests
                  </span>
                </div>
                {expandedCategories[category] ? (
                  <FaChevronUp className="text-gray-400" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>

              {expandedCategories[category] && (
                <div className="p-4">
                  {Object.entries(tests).map(([testName, records]) => (
                    <div key={testName} className="mb-6 last:mb-0">
                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-3">
                        <h4 className="font-medium text-gray-700">{testName}</h4>
                        <Button
                          text="Add Reference"
                          onClick={() => {
                            setExistingModalOpen(true);
                            setExistingTestReferanceRecord(prev => ({ ...prev, testName, category }));
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm"
                        >
                          <FaPlus className="mr-1" />
                        </Button>
                      </div>

                      <TableComponent
                        data={records}
                        columns={columns}
                        actions={(test) => (
                          <div className="flex gap-3">
                            <FaEdit
                              onClick={() => test?.id && handleEditRecord(test)}
                              className="text-blue-500 cursor-pointer hover:text-blue-700"
                              title="Edit"
                              size={18}
                            />
                            <FaTrash
                              onClick={() => test?.id && handleDelete(test.id)}
                              className="text-red-500 cursor-pointer hover:text-red-700"
                              title="Delete"
                              size={18}
                            />
                          </div>
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalCategories / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <FaSearch className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {searchTerm ? "No matching results found" : "No test reference data available"}
          </h3>
          <p className="text-gray-500">
            {searchTerm ? "Try adjusting your search query" : "Add test references to get started"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          title="Edit Reference Range"
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
          title="Add New Reference Range"
          onClose={() => setAddModalOpen(false)}
          modalClassName="max-w-3xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
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
          title="Add Existing Test Reference"
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
    </div>
  );
};

export default TestReferancePoints;