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
import { FaEdit, FaTrash, FaPlus, FaSearch, FaDownload, FaFileExcel, FaFilter, FaChevronDown, FaChevronUp, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import Modal from "../common/Model";
import TestEditReferance from "./TestEditReferance";
import { toast } from "react-toastify";
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
    z.number().min(0, "Minimum age must be 0 or greater").max(100, "Minimum age must be 100 or less"),
    z.string().min(1, "Minimum age is required")
      .transform(val => parseFloat(val))
      .refine(val => !isNaN(val), "Must be a valid number")
      .refine(val => val >= 0, "Minimum age must be 0 or greater")
      .refine(val => val <= 100, "Minimum age must be 100 or less")
  ]),
  ageMax: z.union([
    z.number().min(0, "Maximum age must be 0 or greater").max(100, "Maximum age must be 100 or less"),
    z.string().min(1)
      .transform(val => parseFloat(val))
      .refine(val => !isNaN(val), "Must be a valid number")
      .refine(val => val >= 0, "Maximum age must be 0 or greater")
      .refine(val => val <= 100, "Maximum age must be 100 or less")
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
    ageMin: 0,
  } as TestReferancePoint);
  const [existingModalOpen, setExistingModalOpen] = useState(false);
  const [existingTestReferanceRecord, setExistingTestReferanceRecord] = useState<TestReferancePoint>({} as TestReferancePoint);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { currentLab } = useLabs();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
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

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleAllRows = (expand: boolean) => {
    const newExpandedRows: Record<number, boolean> = {};
    referencePoints.forEach(test => {
      if (test.id) {
        newExpandedRows[test.id] = expand;
      }
    });
    setExpandedRows(newExpandedRows);
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
      // Handle update error
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
      setNewReferanceRecord({ ageMin: 0 } as TestReferancePoint);
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
    <div className="w-full bg-gray-50 p-4 rounded-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <div>
          <h2 className="text-xl font-bold text-blue-700">Test Reference Ranges</h2>
          <p className="text-gray-600 text-sm">Manage laboratory test reference values</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <div className="relative">
                <button
                  className="h-full px-2 flex items-center text-gray-500 hover:text-blue-600"
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
              className="pl-10 pr-20 py-2 w-full bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm"
            >
              <FaPlus />
            </Button>
            <Button
              text="Excel"
              onClick={handleDownloadExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm"
            >
              <FaFileExcel />
            </Button>
            <Button
              text="CSV"
              onClick={handleDownloadCsv}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm"
            >
              <FaDownload />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Tests Reference</h3>
          <p className="text-xl font-bold text-blue-700">{stats.totalTests}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Categories</h3>
          <p className="text-xl font-bold text-blue-700">{stats.totalCategories}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-600 text-sm font-medium mb-1">Showing Tests Reference</h3>
          <p className="text-xl font-bold text-blue-700">
            {stats.filteredTests} {searchTerm ? "results" : "tests"}
          </p>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === "all" ? "text-blue-700 border-b-2 border-blue-700" : "text-gray-600 hover:text-gray-800"}`}
          onClick={() => setActiveTab("all")}
        >
          All Tests
        </button>
      </div>

      {Object.keys(filteredGroupedData).length > 0 ? (
        <>
          {Object.entries(filteredGroupedData).map(([category, tests]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex justify-between items-center p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-blue-700">{category}</h3>
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {Object.keys(tests).length} tests
                  </span>
                </div>
                {expandedCategories[category] ? (
                  <FaChevronUp className="text-gray-500" />
                ) : (
                  <FaChevronDown className="text-gray-500" />
                )}
              </button>

              {expandedCategories[category] && (
                <div className="p-3">
                  {Object.entries(tests).map(([testName, records]) => (
                    <div key={testName} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mb-2">
                        <h4 className="font-medium text-blue-700 text-sm">{testName}</h4>
                        <div className="flex gap-1">
                          <Button
                            text="Expand All"
                            onClick={() => toggleAllRows(true)}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                          >
                            <FaChevronDown className="mr-1" />
                          </Button>
                          <Button
                            text="Collapse All"
                            onClick={() => toggleAllRows(false)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                          >
                            <FaChevronUp className="mr-1" />
                          </Button>
                        <Button
                          text="Add Reference"
                          onClick={() => {
                            setExistingModalOpen(true);
                            setExistingTestReferanceRecord(prev => ({ ...prev, testName, category }));
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          <FaPlus className="mr-1" />
                        </Button>
                        </div>
                      </div>

                      {/* Table Header */}
                      <div className="bg-gray-100 p-3 rounded-lg mb-2">
                        <div className="grid grid-cols-12 gap-3 items-center font-medium text-gray-700 text-sm">
                          <div className="col-span-2">Test Name</div>
                          <div className="col-span-2">Description</div>
                          <div className="col-span-1 text-center">Gender</div>
                          <div className="col-span-2 text-center">Age Range</div>
                          <div className="col-span-2">Reference Range</div>
                          <div className="col-span-2">Report JSON</div>
                          <div className="col-span-1 text-center">Actions</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {records.map((test) => (
                          <div key={test.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            {/* Main Row */}
                            <div className="p-3">
                              <div className="grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-2">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => test.id && toggleRow(test.id)}
                                      className="p-1 hover:bg-gray-100 rounded"
                                    >
                                      {expandedRows[test.id || 0] ? (
                                        <FaChevronDown className="text-gray-500" size={12} />
                                      ) : (
                                        <FaChevronRight className="text-gray-500" size={12} />
                                      )}
                                    </button>
                                    <span className="font-medium text-gray-800 text-sm">{test.testName}</span>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-xs text-gray-600">{test.testDescription || "N/A"}</span>
                                </div>
                                <div className="col-span-1 text-center">
                                  <span className="text-xs font-medium">{test.gender}</span>
                                </div>
                                <div className="col-span-2 text-center">
                                  <span className="text-xs text-gray-600">
                                    {test.ageMin || "0"} {test.minAgeUnit || "Years"} - {test.ageMax || "∞"} {test.maxAgeUnit || "Years"}
                                  </span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-xs font-medium">
                                    {test.minReferenceRange} - {test.maxReferenceRange} {test.units && <span className="text-gray-500">{test.units}</span>}
                                  </span>
                                </div>
                                <div className="col-span-2">
                                  {test.reportJson ? (
                                    <div className="text-xs text-gray-500">
                                      {(() => {
                                        try {
                                          const parsed = JSON.parse(test.reportJson);
                                          return parsed.testName || parsed.note || "Report Available";
                                        } catch {
                                          return "Invalid JSON";
                                        }
                                      })()}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-xs">N/A</span>
                                  )}
                                </div>
                                <div className="col-span-1">
                                  <div className="flex gap-1 justify-end">
                            <FaEdit
                              onClick={() => test?.id && handleEditRecord(test)}
                              className="text-blue-500 cursor-pointer hover:text-blue-700"
                              title="Edit"
                                      size={14}
                            />
                            <FaTrash
                              onClick={() => test?.id && handleDelete(test.id)}
                              className="text-red-500 cursor-pointer hover:text-red-700"
                              title="Delete"
                                      size={14}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Row - Full Data View */}
                            {expandedRows[test.id || 0] && (
                              <div className="border-t border-gray-100 bg-gray-50 p-3">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {/* Report JSON Details */}
                                  <div>
                                    <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2 text-sm">
                                      <FaChevronDown className="text-blue-500" size={12} />
                                      Medical Report Details
                                    </h4>
                                    {test.reportJson ? (
                                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                                        {(() => {
                                          try {
                                            const parsed = JSON.parse(test.reportJson);
                                            return (
                                              <div className="space-y-3">
                                                {/* Test Name */}
                                                {parsed.testName && (
                                                  <div>
                                                    <h5 className="font-semibold text-blue-700 text-xs mb-1">Test Name</h5>
                                                    <p className="text-gray-700 bg-blue-50 p-2 rounded text-sm">{parsed.testName}</p>
                                                  </div>
                                                )}

                                                {/* Note */}
                                                {parsed.note && (
                                                  <div>
                                                    <h5 className="font-semibold text-gray-800 text-sm mb-2">Note</h5>
                                                    <p className="text-gray-700 bg-yellow-50 p-2 rounded italic">{parsed.note}</p>
                                                  </div>
                                                )}

                                                {/* Impression */}
                                                {parsed.impression && (
                                                  <div>
                                                    <h5 className="font-semibold text-gray-800 text-sm mb-2">Impression</h5>
                                                    <p className="text-gray-700 bg-green-50 p-2 rounded">{parsed.impression}</p>
                                                  </div>
                                                )}

                                                {/* Interpretation */}
                                                {parsed.interpretation && (
                                                  <div>
                                                    <h5 className="font-semibold text-gray-800 text-sm mb-2">Interpretation</h5>
                                                    <p className="text-gray-700 bg-green-50 p-2 rounded">{parsed.interpretation}</p>
                                                  </div>
                                                )}

                                                {/* Limitations */}
                                                {parsed.limitations && Array.isArray(parsed.limitations) && parsed.limitations.length > 0 && (
                                                  <div>
                                                    <h5 className="font-semibold text-gray-800 text-sm mb-2">Limitations</h5>
                                                    <ul className="list-disc list-inside space-y-1">
                                                      {parsed.limitations.map((limitation: string, idx: number) => (
                                                        <li key={idx} className="text-gray-700 text-sm bg-orange-50 p-2 rounded">{limitation}</li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                )}

                                                {/* Organ Review */}
                                                {parsed.organReview && Array.isArray(parsed.organReview) && parsed.organReview.length > 0 && (
                                                  <div>
                                                    <h5 className="font-semibold text-gray-800 text-sm mb-2">Organ Review</h5>
                                                    <ul className="list-disc list-inside space-y-1">
                                                      {parsed.organReview.map((organ: string, idx: number) => (
                                                        <li key={idx} className="text-gray-700 text-sm bg-blue-50 p-2 rounded">{organ}</li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                )}

                                                {/* Observations */}
                                                {parsed.observations && Array.isArray(parsed.observations) && parsed.observations.length > 0 && (
                                                  <div>
                                                    <h5 className="font-semibold text-gray-800 text-sm mb-2">Observations</h5>
                                                    <ul className="list-disc list-inside space-y-1">
                                                      {parsed.observations.map((observation: string, idx: number) => (
                                                        <li key={idx} className="text-gray-700 text-sm bg-purple-50 p-2 rounded">{observation}</li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                )}

                                                {/* Fetal Parameters */}
                                                {parsed.fetalParameters && (
                                                  <div>
                                                    <h5 className="font-semibold text-gray-800 text-sm mb-2">Fetal Parameters</h5>
                                                    <div className="space-y-3">
                                                      {Object.entries(parsed.fetalParameters).map(([fetus, params]: [string, any]) => (
                                                        <div key={fetus} className="bg-gray-50 p-3 rounded">
                                                          <h6 className="font-medium text-gray-800 mb-2">{fetus}</h6>
                                                          <div className="grid grid-cols-2 gap-2">
                                                            {Object.entries(params).map(([key, value]: [string, any]) => (
                                                              <div key={key} className="text-sm">
                                                                <span className="font-medium text-gray-600">{key}:</span>
                                                                <span className="ml-2 text-gray-800">{value}</span>
                                                              </div>
                                                            ))}
                                                          </div>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Parameters (for lab tests) */}
                                                {parsed.parameters && (
                                                  <div>
                                                    <h5 className="font-semibold text-gray-800 text-sm mb-2">Test Parameters</h5>
                                                    <div className="space-y-2">
                                                      {Object.entries(parsed.parameters).map(([param, data]: [string, any]) => (
                                                        <div key={param} className="bg-gray-50 p-3 rounded">
                                                          <h6 className="font-medium text-gray-800 mb-1 capitalize">{param.replace(/_/g, ' ')}</h6>
                                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                                            {Object.entries(data).map(([key, value]: [string, any]) => (
                                                              <div key={key}>
                                                                <span className="font-medium text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                                                                <span className="ml-2 text-gray-800">{value}</span>
                                                              </div>
                                                            ))}
                                                          </div>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Sections (for radiology reports) */}
                                                {parsed.sections && (
                                                  <div>
                                                    <h5 className="font-semibold text-gray-800 text-sm mb-2">Report Sections</h5>
                                                    <div className="space-y-2">
                                                      {Object.entries(parsed.sections).map(([section, description]: [string, any]) => (
                                                        <div key={section} className="bg-gray-50 p-3 rounded">
                                                          <h6 className="font-medium text-gray-800 mb-1">{section}</h6>
                                                          <p className="text-gray-700 text-sm">{description}</p>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}

                                                {/* Calculation */}
                                                {parsed.calculation && (
                                                  <div>
                                                    <h5 className="font-semibold text-gray-800 text-sm mb-2">Calculation</h5>
                                                    <p className="text-gray-700 bg-blue-50 p-2 rounded font-mono">{parsed.calculation}</p>
                                                  </div>
                                                )}

                                                {/* Significance */}
                                                {parsed.significance && (
                                                  <div>
                                                    <h5 className="font-semibold text-gray-800 text-sm mb-2">Significance</h5>
                                                    <p className="text-gray-700 bg-green-50 p-2 rounded">{parsed.significance}</p>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          } catch {
                                            return (
                                              <div className="text-gray-400 text-sm">
                                                <p>Unable to parse report data</p>
                                                <details className="mt-2">
                                                  <summary className="cursor-pointer text-blue-600">View Raw Data</summary>
                                                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                                    {test.reportJson}
                                                  </pre>
                                                </details>
                                              </div>
                                            );
                                          }
                                        })()}
                                      </div>
                                    ) : (
                                      <div className="text-gray-400 text-sm">No report data available</div>
                                    )}
                                  </div>

                                  {/* Reference Ranges Details */}
                                  <div>
                                    <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2 text-sm">
                                      <FaChevronDown className="text-green-500" size={12} />
                                      Reference Ranges
                                    </h4>
                                    {test.referenceRanges ? (
                                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                                        {(() => {
                                          try {
                                            const parsed = JSON.parse(test.referenceRanges);
                                            return (
                                              <div className="space-y-2">
                                                {Array.isArray(parsed) ? (
                                                  parsed.map((range: any, idx: number) => (
                                                    <div key={idx} className="bg-green-50 p-3 rounded-lg border border-green-200">
                                                      <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                          <span className="font-semibold text-green-800">
                                                            {range.Gender === 'M' ? 'Male' : range.Gender === 'F' ? 'Female' : range.Gender}
                                                          </span>
                                                          <span className="text-green-600 text-sm">
                                                            {range.AgeMin} - {range.AgeMax} {range.AgeMinUnit}
                                                          </span>
                                                        </div>
                                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                                          {range.ReferenceRange}
                                                        </span>
                                                      </div>
                                                      <div className="text-sm text-gray-600">
                                                        Age Range: {range.AgeMin} - {range.AgeMax} {range.AgeMinUnit}
                                                        {range.AgeMaxUnit && range.AgeMaxUnit !== range.AgeMinUnit && ` - ${range.AgeMaxUnit}`}
                                                      </div>
                                                    </div>
                                                  ))
                                                ) : (
                                                  <div className="text-gray-600 text-sm">
                                                    <p>Reference Range: {parsed.ReferenceRange || 'N/A'}</p>
                                                    {parsed.Gender && <p>Gender: {parsed.Gender}</p>}
                                                    {parsed.AgeMin && parsed.AgeMax && (
                                                      <p>Age: {parsed.AgeMin} - {parsed.AgeMax} {parsed.AgeMinUnit || 'Years'}</p>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          } catch {
                                            return (
                                              <div className="text-gray-400 text-sm">
                                                <p>Unable to parse reference ranges data</p>
                                                <details className="mt-2">
                                                  <summary className="cursor-pointer text-green-600">View Raw Data</summary>
                                                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                                    {test.referenceRanges}
                                                  </pre>
                                                </details>
                                              </div>
                                            );
                                          }
                                        })()}
                                      </div>
                                    ) : (
                                      <div className="text-gray-400 text-sm">No reference ranges data available</div>
                                    )}
                                  </div>
                                </div>

                                {/* Additional Test Information */}
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <h4 className="font-semibold text-blue-700 mb-2 text-sm">Additional Information</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <div>
                                      <span className="font-medium text-gray-600">Created By:</span>
                                      <p className="text-gray-800">{test.createdBy || "N/A"}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600">Updated By:</span>
                                      <p className="text-gray-800">{test.updatedBy || "N/A"}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600">Created At:</span>
                                      <p className="text-gray-800">{test.createdAt ? new Date(test.createdAt).toLocaleString() : "N/A"}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600">Updated At:</span>
                                      <p className="text-gray-800">{test.updatedAt ? new Date(test.updatedAt).toLocaleString() : "N/A"}</p>
                                    </div>
                                  </div>
                                </div>
                          </div>
                        )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="mt-3">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalCategories / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <FaSearch className="mx-auto text-3xl text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-blue-700 mb-2">
            {searchTerm ? "No matching results found" : "No test reference data available"}
          </h3>
          <p className="text-gray-600 text-sm">
            {searchTerm ? "Try adjusting your search query" : "Add test references to get started"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm"
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
          modalClassName="max-w-5xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
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
          modalClassName="max-w-5xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
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
          modalClassName="max-w-5xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
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