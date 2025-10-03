import { TestList } from '@/types/test/testlist';
import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { FaBoxOpen, FaEye, FaEyeSlash, FaFlask, FaSearch, FaTimes, FaTrashAlt, FaListUl } from 'react-icons/fa';
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
  const [showTestList, setShowTestList] = useState(true);
  const [showPackageList, setShowPackageList] = useState(true);
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



  // Styling functions
  const getTestItemStyle = (test: TestList, index: number) => {
    const isSelected = selectedTests.some(t => t.id === test.id);
    const isHighlighted = index === highlightedTestIndex;

    if (isSelected) return 'bg-blue-50 border border-blue-200';
    if (isHighlighted) return 'bg-purple-100 border border-purple-300';
    return 'hover:bg-gray-50 border border-transparent';
  };

  const getPackageItemStyle = (pkg: PackageType, index: number) => {
    const isSelected = selectedPackages.some(p => p.id === pkg.id);
    const isHighlighted = index === highlightedPackageIndex;

    if (isSelected) return 'bg-green-50 border border-green-200';
    if (isHighlighted) return 'bg-teal-100 border border-teal-300';
    return 'hover:bg-gray-50 border border-transparent';
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-gray-200 shadow-sm my-2 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50">
        {/* Test Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <FaFlask className="mr-2 text-purple-600" />
                Available Tests
              </h3>
              <button
                onClick={() => setShowTestList(!showTestList)}
                className="ml-3 text-xs text-purple-600 hover:text-purple-800 flex items-center transition-colors"
              >
                {showTestList ? (
                  <>
                    <FaEyeSlash className="mr-1" /> Hide List
                  </>
                ) : (
                  <>
                    <FaEye className="mr-1" /> Show List
                  </>
                )}
              </button>
            </div>
            <div className="flex gap-2">
              <select
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <div className="relative">
                <input
                  ref={testSearchRef}
                  type="text"
                  className="border border-gray-300 rounded-md px-3 py-1.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-36"
                  placeholder="Search tests..."
                  value={searchTestTerm}
                  onChange={handleTestSearch}
                  onKeyDown={handleTestSearchKeyDown}
                  onFocus={() => {
                    if (searchTestTerm && filteredTests.length > 0) {
                      setHighlightedTestIndex(0);
                    }
                  }}
                  title="Type to search. Use arrow keys to navigate, Enter to select."
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
            {(filteredTests.length > 0 && (showTestList || searchTestTerm)) ? (
              <div className="overflow-y-auto max-h-64" ref={testListRef}>
                <div className="sticky top-0 bg-white z-10 p-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Select Test</span>
                    <span className="text-xs text-gray-500">{filteredTests.length} items</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredTests.map((test, index) => (
                    <div
                      key={test.id}
                      data-item
                      className={`px-3 py-2.5 cursor-pointer transition-colors ${getTestItemStyle(test, index)}`}
                      onClick={() => handleTestSelectionWithClear(test)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{test.name}</p>
                          <p className="text-xs text-gray-500 truncate">{test.category}</p>
                        </div>
                        <p className="text-sm font-medium whitespace-nowrap ml-2">₹{isNaN(Number(test.price)) ? 'N/A' : Number(test.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center">
                {searchTestTerm ? (
                  <div className="flex flex-col items-center">
                    <FaSearch className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No tests found for &quot;{searchTestTerm}&quot;</p>
                    <button
                      onClick={() => handleTestSearch({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
                      className="text-blue-500 text-xs mt-1 flex items-center hover:text-blue-700"
                    >
                      <FaTimes className="mr-1" /> Clear search
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FaFlask className="text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No tests available</p>
                    {!showTestList && (
                      <button
                        onClick={() => setShowTestList(true)}
                        className="text-purple-600 text-xs mt-1 flex items-center hover:text-purple-800"
                      >
                        <FaEye className="mr-1" /> Show List
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Package Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <FaBoxOpen className="mr-2 text-teal-600" />
                Available Packages
              </h3>
              <button
                onClick={() => setShowPackageList(!showPackageList)}
                className="ml-3 text-xs text-teal-600 hover:text-teal-800 flex items-center transition-colors"
              >
                {showPackageList ? (
                  <>
                    <FaEyeSlash className="mr-1" /> Hide List
                  </>
                ) : (
                  <>
                    <FaEye className="mr-1" /> Show List
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                ref={packageSearchRef}
                type="text"
                className="border border-gray-300 rounded-md px-3 py-1.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-36"
                placeholder="Search packages..."
                value={searchPackageTerm}
                onChange={handlePackageSearch}
                onKeyDown={handlePackageSearchKeyDown}
                onFocus={() => {
                  if (searchPackageTerm && filteredPackages.length > 0) {
                    setHighlightedPackageIndex(0);
                  }
                }}
                title="Type to search. Use arrow keys to navigate, Enter to select."
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
            {(filteredPackages.length > 0 && (showPackageList || searchPackageTerm)) ? (
              <div className="overflow-y-auto max-h-64" ref={packageListRef}>
                <div className="sticky top-0 bg-white z-10 p-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Select Package</span>
                    <span className="text-xs text-gray-500">{filteredPackages.length} items</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredPackages.map((pkg, index) => (
                    <div
                      key={pkg.id}
                      data-item
                      className={`px-3 py-2.5 cursor-pointer transition-colors ${getPackageItemStyle(pkg, index)}`}
                      onClick={() => handlePackageSelectionWithClear(pkg)}
                      onMouseEnter={() => handlePackageHover(pkg)}
                      onMouseLeave={handlePackageLeave}
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium truncate">{pkg.packageName}</p>
                        <div className="flex items-center space-x-2 whitespace-nowrap ml-2">
                          <p className="text-sm font-medium">₹{isNaN(Number(pkg.price)) ? 'N/A' : Number(pkg.price).toFixed(2)}</p>
                          {/* {(pkg.discount && pkg.discount > 0) && (
                            <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                              {pkg.discount}% Off
                            </span>
                          )} */}
                          <FaListUl className="text-gray-400 hover:text-blue-500 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center">
                {searchPackageTerm ? (
                  <div className="flex flex-col items-center">
                    <FaSearch className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No packages found for &quot;{searchPackageTerm}&quot;</p>
                    <button
                      onClick={() => setSearchPackageTerm('')}
                      className="text-blue-500 text-xs mt-1 flex items-center hover:text-blue-700"
                    >
                      <FaTimes className="mr-1" /> Clear search
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FaBoxOpen className="text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No packages available</p>
                    {!showPackageList && (
                      <button
                        onClick={() => setShowPackageList(true)}
                        className="text-teal-600 text-xs mt-1 flex items-center hover:text-teal-800"
                      >
                        <FaEye className="mr-1" /> Show List
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Tests */}
        {selectedTests.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Selected Tests ({selectedTests.length})</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
              <div className="overflow-y-auto max-h-64 divide-y divide-gray-100">
                {selectedTests.map((test) => (
                  <div key={test.id} className="p-3 hover:bg-blue-50 transition-colors">
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Test Name and Category - Flexible width, takes available space */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium break-words leading-tight pr-2">{test.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-1">{test.category}</p>
                      </div>

                      {/* Right side content - Fixed width, stays aligned */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Price Section */}
                        <div className="flex flex-col items-end justify-center min-w-[80px]">
                          {test.discountAmount ? (
                            <>
                              <p className="text-xs line-through text-gray-400">₹{isNaN(Number(test.price)) ? 'N/A' : Number(test.price).toFixed(2)}</p>
                              <p className="text-sm font-medium text-green-600">
                                ₹{typeof test.discountedPrice === 'number' ? test.discountedPrice.toFixed(2) : '0'}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-medium">₹{isNaN(Number(test.price)) ? 'N/A' : Number(test.price).toFixed(2)}</p>
                          )}
                        </div>

                        {/* Discount Fields and Remove Button */}
                        <div className="flex items-center gap-2">
                          {/* <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-1">%:</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="w-12 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500"
                              value={test.discountPercent || 0}
                              onChange={(e) => {
                                const value = e.target.value;
                                const numValue = value === '' ? 0 : parseFloat(value) || 0;
                                handleTestDiscountChange(test.id, 'percent', numValue);
                              }}
                              onInput={(e) => {
                                const input = e.target as HTMLInputElement;
                                let value = input.value;
                                
                                // Remove leading zeros immediately
                                if (value.length > 1 && value.startsWith('0')) {
                                  value = value.replace(/^0+/, '');
                                  // If all zeros were removed, set to 0
                                  if (value === '') {
                                    value = '0';
                                  }
                                  // Update the input value directly
                                  input.value = value;
                                }
                              }}
                            />
                          </div> */}
                          {/* <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-1">₹:</span>
                            <input
                              type="number"
                              min="0"
                              max={test.price}
                              className="w-16 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500"
                              value={test.discountAmount || 0}
                              onChange={(e) => {
                                const value = e.target.value;
                                const numValue = value === '' ? 0 : parseFloat(value) || 0;
                                handleTestDiscountChange(test.id, 'amount', numValue);
                              }}
                              onInput={(e) => {
                                const input = e.target as HTMLInputElement;
                                let value = input.value;
                                
                                // Remove leading zeros immediately
                                if (value.length > 1 && value.startsWith('0')) {
                                  value = value.replace(/^0+/, '');
                                  // If all zeros were removed, set to 0
                                  if (value === '') {
                                    value = '0';
                                  }
                                  // Update the input value directly
                                  input.value = value;
                                }
                              }}
                            />
                          </div> */}
                          <button
                            onClick={() => removeTest(test.id.toString())}
                            className="text-red-500 hover:text-red-700 p-1 focus:outline-none focus:ring-1 focus:ring-red-500 rounded"
                            title="Remove test"
                          >
                            <FaTrashAlt className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Packages */}
        {selectedPackages.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Selected Packages ({selectedPackages.length})</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
              <div className="overflow-y-auto max-h-64 divide-y divide-gray-100">
                {selectedPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-3 hover:bg-green-50 transition-colors"
                    onMouseEnter={() => handlePackageHover(pkg)}
                    onMouseLeave={handlePackageLeave}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium truncate">{pkg.packageName}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">₹{isNaN(Number(pkg.price)) ? 'N/A' : Number(pkg.price).toFixed(2)}</p>
                        <button
                          onClick={() => removePackage(pkg.id.toString())}
                          className="text-red-500 hover:text-red-700 p-1 focus:outline-none focus:ring-1 focus:ring-red-500 rounded"
                          title="Remove package"
                        >
                          <FaTrashAlt className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Package Details Tooltip */}
      {hoveredPackage && (
        <div
          className="absolute z-20 w-72 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          style={{
            top: '50%',
            left: '60%',
            transform: 'translateY(-50%)'
          }}
          onMouseEnter={() => setHoveredPackage(hoveredPackage)}
          onMouseLeave={handlePackageLeave}
        >
          <div className="p-3 bg-teal-50 border-b border-teal-100">
            <h3 className="text-sm font-semibold text-teal-700 truncate">{hoveredPackage.packageName}</h3>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-600">Includes {hoveredPackage.tests?.length || 0} tests</span>
              <span className="text-sm font-bold text-teal-700">₹{isNaN(Number(hoveredPackage.price)) ? 'N/A' : Number(hoveredPackage.price).toFixed(2)}</span>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {hoveredPackage.tests?.map((test) => (
              <div key={test.id} className="px-3 py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{test.name}</p>
                    <p className="text-xs text-gray-500">{test.category}</p>
                  </div>
                  <p className="text-sm font-medium">₹{isNaN(Number(test.price)) ? 'N/A' : Number(test.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
       
        </div>
      )}
    </div>
  );
};

export default PatientTestPackage;