import { TestList } from '@/types/test/testlist';
import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { FaBoxOpen, FaFlask, FaSearch, FaTimes } from 'react-icons/fa';
import { Package as PackageType } from '@/types/package/package';

interface PatientTestPackageProps {
  categories: string[];
  tests: TestList[];
  packages: PackageType[];
  selectedTests: TestList[];
  selectedPackages: PackageType[];
  setSelectedTests: React.Dispatch<React.SetStateAction<TestList[]>>;
  setSelectedPackages: React.Dispatch<React.SetStateAction<PackageType[]>>;
  selectedCategory: string;
  handleCategoryChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  searchTestTerm: string;
  handleTestSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filteredTests: TestList[];
  handleTestSelection: (test: TestList) => void;
  handlePackageSelection: (pkg: PackageType) => void;
  removeTest: (testId: string) => void;
  removePackage: (packageId: string) => void;
  handleTestDiscountChange: (testId: number, field: 'percent' | 'amount', value: number) => void;
}

const PatientTestPackage: React.FC<PatientTestPackageProps> = ({
  categories,
  packages,
  selectedTests,
  selectedPackages,
  // setSelectedTests,
  selectedCategory,
  handleCategoryChange,
  searchTestTerm,
  handleTestSearch,
  filteredTests,
  handleTestSelection,
  handlePackageSelection,
  removeTest,
  removePackage,
  // handleTestDiscountChange,
}) => {
  // State management
  const [, setShowTestList] = useState(true);
  const [, setShowPackageList] = useState(true);
  const [searchPackageTerm, setSearchPackageTerm] = useState('');
  const [hoveredPackage, setHoveredPackage] = useState<PackageType | null>(null);
  const [highlightedTestIndex, setHighlightedTestIndex] = useState(-1);
  const [highlightedPackageIndex, setHighlightedPackageIndex] = useState(-1);

  // Refs
  const testListRef = useRef<HTMLDivElement>(null);
  const packageListRef = useRef<HTMLDivElement>(null);
  const testSearchRef = useRef<HTMLInputElement>(null);
  const packageSearchRef = useRef<HTMLInputElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter packages based on search term - only show packages that start with the typed characters
  const filteredPackages = searchPackageTerm
    ? packages.filter(pkg =>
      pkg.packageName.toLowerCase().startsWith(searchPackageTerm.toLowerCase()))
    : packages;

  // Handle package search input
  const handlePackageSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchPackageTerm(event.target.value);
    if (event.target.value) {
      setShowPackageList(true);
    } else {
      setShowPackageList(false);
    }
  };

  // Scroll to keep highlighted item visible (keyboard nav only)
  const scrollToItem = (index: number, ref: React.RefObject<HTMLDivElement>, offset = 0) => {
    if (ref.current) {
      const container = ref.current;
      const items = container.querySelectorAll('[data-item]');
      if (items[index]) {
        const item = items[index] as HTMLElement;
        const itemTop = item.offsetTop;
        const itemHeight = item.offsetHeight;
        const containerHeight = container.offsetHeight;
        const scrollTop = container.scrollTop;

        if (itemTop < scrollTop || itemTop + itemHeight > scrollTop + containerHeight) {
          container.scrollTo({
            top: itemTop - container.offsetTop - offset,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  // Test selection with search clear
  const handleTestSelectionWithClear = (test: TestList) => {
    handleTestSelection(test);
    handleTestSearch({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    setHighlightedTestIndex(-1);
    // Keep the list open for multiple selections
    // setShowTestList(false);
    testSearchRef.current?.focus();
  };

  // Package selection with search clear
  const handlePackageSelectionWithClear = (pkg: PackageType) => {
    handlePackageSelection(pkg);
    setSearchPackageTerm('');
    setHighlightedPackageIndex(-1);
    // Keep the list open for multiple selections
    // setShowPackageList(false);
    packageSearchRef.current?.focus();
  };

  // Keyboard navigation for test search
  const handleTestSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (filteredTests.length === 0) return;
    const lastIndex = filteredTests.length - 1;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
    }

    if (e.key === 'Enter') {
      if (highlightedTestIndex >= 0 && highlightedTestIndex <= lastIndex) {
        handleTestSelectionWithClear(filteredTests[highlightedTestIndex]);
      } else if (filteredTests.length > 0) {
        handleTestSelectionWithClear(filteredTests[0]);
      }
    } else if (e.key === 'ArrowDown') {
      const newIndex = highlightedTestIndex >= lastIndex ? 0 : highlightedTestIndex + 1;
      setHighlightedTestIndex(newIndex);
      scrollToItem(newIndex, testListRef, 48);
    } else if (e.key === 'ArrowUp') {
      const newIndex = highlightedTestIndex <= 0 ? lastIndex : highlightedTestIndex - 1;
      setHighlightedTestIndex(newIndex);
      scrollToItem(newIndex, testListRef, 48);
    } else if (e.key === 'Escape') {
      setHighlightedTestIndex(-1);
      setShowTestList(false);
    } else if (e.key === 'Tab' && !e.shiftKey && highlightedTestIndex >= 0) {
      handleTestSelectionWithClear(filteredTests[highlightedTestIndex]);
    }
  };

  // Keyboard navigation for package search
  const handlePackageSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (filteredPackages.length === 0) return;
    const lastIndex = filteredPackages.length - 1;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
    }

    if (e.key === 'Enter') {
      if (highlightedPackageIndex >= 0 && highlightedPackageIndex <= lastIndex) {
        handlePackageSelectionWithClear(filteredPackages[highlightedPackageIndex]);
      } else if (filteredPackages.length > 0) {
        handlePackageSelectionWithClear(filteredPackages[0]);
      }
    } else if (e.key === 'ArrowDown') {
      const newIndex = highlightedPackageIndex >= lastIndex ? 0 : highlightedPackageIndex + 1;
      setHighlightedPackageIndex(newIndex);
      scrollToItem(newIndex, packageListRef, 48);
    } else if (e.key === 'ArrowUp') {
      const newIndex = highlightedPackageIndex <= 0 ? lastIndex : highlightedPackageIndex - 1;
      setHighlightedPackageIndex(newIndex);
      scrollToItem(newIndex, packageListRef, 48);
    } else if (e.key === 'Escape') {
      setHighlightedPackageIndex(-1);
      setShowPackageList(false);
    } else if (e.key === 'Tab' && !e.shiftKey && highlightedPackageIndex >= 0) {
      handlePackageSelectionWithClear(filteredPackages[highlightedPackageIndex]);
    }
  };

  // Package hover with delay
  const handlePackageHover = (pkg: PackageType) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredPackage(pkg);
    }, 200);
  };

  const handlePackageLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredPackage(null);
  };

  // Effects for managing highlighted items
  useEffect(() => {
    if (searchTestTerm && filteredTests.length > 0) {
      setShowTestList(true);
      setHighlightedTestIndex(0);
    } else {
      setHighlightedTestIndex(-1);
    }
  }, [filteredTests, searchTestTerm, setShowTestList, setHighlightedTestIndex]);

  useEffect(() => {
    if (searchPackageTerm && filteredPackages.length > 0) {
      setShowPackageList(true);
      setHighlightedPackageIndex(0);
    } else {
      setHighlightedPackageIndex(-1);
    }
  }, [filteredPackages, searchPackageTerm, setShowPackageList, setHighlightedPackageIndex]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);



  return (
    <div className="space-y-4 my-2">

      {/* ── Individual Tests ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FaFlask className="text-purple-500" />
            Individual Tests
          </h3>
          <div className="flex items-center gap-2">
            <select
              className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-600"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                ref={testSearchRef}
                type="text"
                className="border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 w-44"
                placeholder="Search tests..."
                value={searchTestTerm}
                onChange={handleTestSearch}
                onKeyDown={handleTestSearchKeyDown}
                onFocus={() => { if (searchTestTerm && filteredTests.length > 0) setHighlightedTestIndex(0); }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-80" ref={testListRef}>
          {filteredTests.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Test Name</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTests.map((test, index) => {
                  const isSelected = selectedTests.some(t => t.id === test.id);
                  const isHighlighted = index === highlightedTestIndex;
                  return (
                    <tr
                      key={test.id}
                      data-item
                      onClick={() => handleTestSelectionWithClear(test)}
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-purple-50' : isHighlighted ? 'bg-purple-50/50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs font-mono text-gray-400">{test.testCode || `T${String(test.id).padStart(3, '0')}`}</td>
                      <td className="px-3 py-3 text-sm font-medium text-gray-800">{test.name}</td>
                      <td className="px-3 py-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {test.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold text-right text-gray-800">
                        ₹{isNaN(Number(test.price)) ? 'N/A' : Number(test.price).toFixed(0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <FaFlask className="text-2xl mb-2" />
              <p className="text-sm">
                {searchTestTerm ? `No tests found for "${searchTestTerm}"` : 'No tests available'}
              </p>
              {searchTestTerm && (
                <button
                  onClick={() => handleTestSearch({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
                  className="text-purple-600 text-xs mt-2 hover:underline flex items-center gap-1"
                >
                  <FaTimes className="text-xs" /> Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Health Packages ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FaBoxOpen className="text-purple-500" />
              Health Packages
            </h3>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                ref={packageSearchRef}
                type="text"
                className="border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 w-44"
                placeholder="Search packages..."
                value={searchPackageTerm}
                onChange={handlePackageSearch}
                onKeyDown={handlePackageSearchKeyDown}
                onFocus={() => { if (searchPackageTerm && filteredPackages.length > 0) setHighlightedPackageIndex(0); }}
              />
            </div>
          </div>

          {filteredPackages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" ref={packageListRef}>
              {filteredPackages.map((pkg, index) => {
                const isSelected = selectedPackages.some(p => p.id === pkg.id);
                const isHighlighted = index === highlightedPackageIndex;
                return (
                  <div
                    key={pkg.id}
                    data-item
                    onClick={() => handlePackageSelectionWithClear(pkg)}
                    onMouseEnter={() => handlePackageHover(pkg)}
                    onMouseLeave={handlePackageLeave}
                    className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${isSelected ? 'border-purple-500 bg-purple-50' : isHighlighted ? 'border-purple-300 bg-purple-50/40' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">PKG-{String(pkg.id).padStart(2, '0')}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 leading-tight mb-1">{pkg.packageName}</h4>
                    <p className="text-xs text-gray-500 mb-2">{pkg.tests?.length || 0} tests included</p>
                    <p className="text-base font-bold text-purple-600">₹{isNaN(Number(pkg.price)) ? 'N/A' : Number(pkg.price).toFixed(0)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-gray-400">
              <FaBoxOpen className="text-2xl mb-2" />
              <p className="text-sm">{searchPackageTerm ? `No packages found for "${searchPackageTerm}"` : 'No packages available'}</p>
            </div>
          )}
      </div>

      {/* ── Selected Items Summary ── */}
      {(selectedTests.length > 0 || selectedPackages.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Selected ({selectedTests.length + selectedPackages.length})
          </h3>
          <div className="space-y-1.5">
            {selectedTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium text-gray-800 truncate">{test.name}</p>
                  <p className="text-xs text-gray-400">{test.testCode || `T${String(test.id).padStart(3,'0')}`} · {test.category}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {test.discountAmount ? (
                    <div className="text-right">
                      <p className="text-xs line-through text-gray-400">₹{Number(test.price).toFixed(0)}</p>
                      <p className="text-sm font-semibold text-green-600">₹{typeof test.discountedPrice === 'number' ? test.discountedPrice.toFixed(0) : '0'}</p>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">₹{Number(test.price).toFixed(0)}</p>
                  )}
                  <button
                    onClick={() => removeTest(test.id.toString())}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Remove"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ))}
            {selectedPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-purple-50"
                onMouseEnter={() => handlePackageHover(pkg)}
                onMouseLeave={handlePackageLeave}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium text-gray-800 truncate">{pkg.packageName}</p>
                  <p className="text-xs text-gray-400">{pkg.tests?.length || 0} tests included</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-sm font-semibold text-purple-700">₹{Number(pkg.price).toFixed(0)}</p>
                  <button
                    onClick={() => removePackage(pkg.id.toString())}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Remove"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Package hover tooltip */}
      {hoveredPackage && (
        <div
          className="absolute z-20 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          style={{ top: '50%', left: '60%', transform: 'translateY(-50%)' }}
          onMouseEnter={() => setHoveredPackage(hoveredPackage)}
          onMouseLeave={handlePackageLeave}
        >
          <div className="p-3 bg-purple-50 border-b border-purple-100">
            <h3 className="text-sm font-semibold text-purple-700 truncate">{hoveredPackage.packageName}</h3>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-600">{hoveredPackage.tests?.length || 0} tests included</span>
              <span className="text-sm font-bold text-purple-700">₹{isNaN(Number(hoveredPackage.price)) ? 'N/A' : Number(hoveredPackage.price).toFixed(0)}</span>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
            {hoveredPackage.tests?.map((test) => (
              <div key={test.id} className="px-3 py-2 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800">{test.name}</p>
                  <p className="text-xs text-gray-400">{test.category}</p>
                </div>
                <p className="text-sm font-medium text-gray-700">₹{Number(test.price).toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientTestPackage;