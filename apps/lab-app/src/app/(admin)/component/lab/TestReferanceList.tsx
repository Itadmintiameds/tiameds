import { useState, useEffect, useMemo } from "react";
import { getMasterTestReferanceRange, downloadMasterTestReferanceRangeCsv } from "../../../../../services/testService";
import { TestReferancePoint } from "@/types/test/testlist";
import Loader from "../../component/common/Loader";
import { useLabs } from "@/context/LabContext";
import { toast } from "react-toastify";
import TableComponent from "../common/TableComponent";
import Button from "../common/Button";
import { FaDownload, FaFileExcel, FaSearch, FaFilter, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Pagination from "../common/Pagination";
import * as XLSX from 'xlsx';
import { saveAs } from "file-saver";
import Papa from 'papaparse';
import { FaInfoCircle } from "react-icons/fa";

const ITEMS_PER_PAGE = 8;

const TestReferanceList = () => {
  const [referencePoints, setReferencePoints] = useState<TestReferancePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentLab } = useLabs();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<"all" | "category" | "test" | "description">("all");

  useEffect(() => {
    setLoading(true);
    getMasterTestReferanceRange()
      .then((data) => {
        setReferencePoints(data);
        // Expand first category by default
        if (data.length > 0) {
          setExpandedCategories({ [data[0].category]: true });
        }
      })
      .catch((error) => toast.error((error as Error).message))
      .finally(() => setLoading(false));
  }, [currentLab]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Filter data based on search term and active filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return referencePoints;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return referencePoints.filter(item => {
      if (activeFilter === "category") {
        return item.category.toLowerCase().includes(lowerSearchTerm);
      } else if (activeFilter === "test") {
        return item.testName.toLowerCase().includes(lowerSearchTerm);
      } else if (activeFilter === "description") {
        return item.testDescription?.toLowerCase().includes(lowerSearchTerm);
      }
      return (
        item.category.toLowerCase().includes(lowerSearchTerm) ||
        item.testName.toLowerCase().includes(lowerSearchTerm) ||
        item.testDescription?.toLowerCase().includes(lowerSearchTerm) ||
        item.units?.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [referencePoints, searchTerm, activeFilter]);

  // Group filtered data by category and test name
  const groupedData = useMemo(() => {
    return filteredData.reduce((acc, test) => {
      if (!acc[test.category]) acc[test.category] = {};
      if (!acc[test.category][test.testName]) acc[test.category][test.testName] = [];
      acc[test.category][test.testName].push(test);
      return acc;
    }, {} as Record<string, Record<string, TestReferancePoint[]>>);
  }, [filteredData]);

  // Get categories for pagination
  const categories = Object.keys(groupedData);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

  const handleDownloadCsv = async () => {
    try {
      const csvText = await downloadMasterTestReferanceRangeCsv();
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'test_reference_range.csv');
      toast.success('CSV downloaded successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download CSV.');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const csvText = await downloadMasterTestReferanceRangeCsv();
      const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });

      if (!data.length) {
        toast.error('No data found to export.');
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Reference Range');
      XLSX.writeFile(workbook, 'test_reference_range.xlsx');
      toast.success('Excel exported successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export Excel.');
    }
  };

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
      accessor: (test: TestReferancePoint) => `${test.ageMin || "0"} - ${test.ageMax || "∞"} years`,
      className: "text-center"
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

  return (
    <div className="w-full bg-gray-50 p-6 rounded-xl">
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
        <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-blue-800">Master Data Access</h3>
          <p className="text-sm text-blue-700">
            This table displays master data records. Modifications require Super Admin privileges.
            For any changes, please contact Tiamed Technology administration.
          </p>
        </div>
      </div>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Test Reference Ranges</h2>
          <p className="text-gray-500">Browse and manage laboratory test reference values</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search with filter dropdown */}
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

          {/* Export buttons */}
          <div className="flex gap-2">
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Tests</h3>
          <p className="text-2xl font-bold text-gray-800">{referencePoints.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Categories</h3>
          <p className="text-2xl font-bold text-gray-800">{Object.keys(groupedData).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Showing</h3>
          <p className="text-2xl font-bold text-gray-800">
            {filteredData.length} {searchTerm ? "results" : "tests"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
       <div className="flex flex-col items-center justify-center h-64">
          <Loader type="progress" fullScreen={false} text="Loading tests reference data..." />
          <h3 className="text-lg font-semibold text-gray-800">Loading Test Reference Data</h3 >
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {paginatedCategories.length > 0 ? (
            <>
              {paginatedCategories.map((category) => (
                <div key={category} className="border-b border-gray-100 last:border-b-0">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {Object.keys(groupedData[category]).length} tests
                      </span>
                    </div>
                    {expandedCategories[category] ? (
                      <FaChevronUp className="text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-400" />
                    )}
                  </button>

                  {expandedCategories[category] && (
                    <div className="px-4 pb-4">
                      {Object.entries(groupedData[category]).map(([testName, records]) => (
                        <div key={testName} className="mb-6 last:mb-0">
                          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-2">
                            <h4 className="font-medium text-gray-700">{testName}</h4>
                            <span className="text-sm text-gray-500">
                              {records.length} reference {records.length === 1 ? "range" : "ranges"}
                            </span>
                          </div>
                          <TableComponent
                            data={records}
                            columns={columns}
                          // rowClass Name="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

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
                {searchTerm ? "No matching results found" : "No test reference data available"}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? "Try adjusting your search or filter" : "Please check back later or contact support"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setActiveFilter("all");
                  }}
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

export default TestReferanceList;