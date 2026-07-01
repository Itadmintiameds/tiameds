
'use client';

import { getTests } from '@/../services/testService';
import Loader from '@/app/(admin)/component/common/Loader';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import { PlusIcon } from 'lucide-react';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { FaTimes, FaMinus, FaPlus, FaSearch, FaChevronDown } from 'react-icons/fa';
import { debounce } from '@/utils/debounce';

interface PackageData {
  id: number;
  packageName: string;
  discount: number;
  price: number;
  tests: TestList[];
}

interface UpdatePackageProps {
  packageData: PackageData;
  onClose: () => void;
  handleUpdatePackage: (data: PackageData) => void;
}

const UpdatePackage = ({
  packageData,
  onClose,
  handleUpdatePackage
}: UpdatePackageProps) => {
  const [packageDetails, setPackageDetails] = useState<PackageData>(packageData);
  const [allTests, setAllTests] = useState<TestList[]>([]);
  const [filteredTests, setFilteredTests] = useState<TestList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showAddTest, setShowAddTest] = useState<boolean>(false);
  const { currentLab } = useLabs();
  const [subtotal, setSubtotal] = useState<number>(0);

  // Create debounced search function using the utility
  const debouncedSearch = useRef(
    debounce((searchValue: string) => {
      setDebouncedSearchTerm(searchValue);
      setIsSearching(false);
    }, 300)
  ).current;

  const fetchAvailableTests = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTests = await getTests(currentLab?.id.toString() || '');
      setAllTests(fetchedTests);
    } catch (error) {
      // Handle tests fetch error
    } finally {
      setIsLoading(false);
    }
  }, [currentLab]);

  useEffect(() => {
    setPackageDetails(packageData);
    fetchAvailableTests();
  }, [packageData, currentLab, fetchAvailableTests]);

  // Handle search term changes with debouncing
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearchTerm, debouncedSearch]);

  const applyFilters = useCallback(() => {
    const alreadyIncluded = new Set(packageDetails.tests.map(t => t.id));
    let results = allTests.filter(test => !alreadyIncluded.has(test.id));

    if (debouncedSearchTerm) {
      results = results.filter(test =>
        test.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    setFilteredTests(results);
  }, [allTests, debouncedSearchTerm, packageDetails.tests]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    const calculatePricing = () => {
      const basePrice = packageDetails.tests.reduce((sum, test) => sum + test.price, 0);
      setSubtotal(basePrice);

      const discountedPrice = basePrice - (basePrice * packageDetails.discount) / 100;
      setPackageDetails(prev => ({
        ...prev,
        price: parseFloat(discountedPrice.toFixed(2))
      }));
    };

    calculatePricing();
  }, [packageDetails.tests, packageDetails.discount]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'packageName') {
      // Allow letters, numbers and spaces, remove leading spaces
      let filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
      filteredValue = filteredValue.replace(/^\s+/, '');
      setPackageDetails(prev => ({
        ...prev,
        [name]: filteredValue
      }));
    } else {
      setPackageDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      setPackageDetails(prev => ({
        ...prev,
        discount: 0
      }));
      return;
    }

    // Allow numbers and one decimal point
    let numericValue = value.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      numericValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      numericValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Validate range (0-100)
    const numValue = parseFloat(numericValue);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setPackageDetails(prev => ({
        ...prev,
        discount: numValue
      }));
    } else if (numValue > 100) {
      setPackageDetails(prev => ({
        ...prev,
        discount: 100
      }));
    } else if (numValue < 0) {
      setPackageDetails(prev => ({
        ...prev,
        discount: 0
      }));
    }
  };

  const addTestToPackage = (test: TestList) => {
    if (!packageDetails.tests.some(t => t.id === test.id)) {
      setPackageDetails(prev => ({
        ...prev,
        tests: [...prev.tests, test]
      }));
    }
    setSearchTerm('');
  };

  const removeTestFromPackage = (testId: number) => {
    setPackageDetails(prev => ({
      ...prev,
      tests: prev.tests.filter(test => test.id !== testId)
    }));
  };

  const submitPackageUpdate = () => {
    // Validate package name
    if (!packageDetails.packageName.trim()) {
      alert('Package name is required.');
      return;
    }

    if (packageDetails.packageName.trim().length < 3) {
      alert('Package name must be at least 3 characters long.');
      return;
    }

    // Validate package name format - letters, numbers and spaces only
    const packageNameRegex = /^[a-zA-Z0-9\s]+$/;
    if (!packageNameRegex.test(packageDetails.packageName.trim())) {
      alert('Package name can only contain letters, numbers, and spaces.');
      return;
    }

    // Check if package name contains at least one alphanumeric character
    const hasAlphanumeric = /[a-zA-Z0-9]/.test(packageDetails.packageName.trim());
    if (!hasAlphanumeric) {
      alert('Package name must contain at least one letter or number.');
      return;
    }

    handleUpdatePackage(packageDetails);
    onClose();
  };

  return (
    <div className="bg-white rounded-2xl p-2">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Package Details</h2>

      {/* Package Name / Discount Percentage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Package name
          </label>
          <input
            type="text"
            name="packageName"
            value={packageDetails.packageName}
            onChange={handleFieldChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-full bg-gray-50 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            placeholder="Health Master Package"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Discount Percentage:
          </label>
          <div className="relative">
            <input
              type="number"
              name="discount"
              value={packageDetails.discount || ''}
              onChange={handleDiscountChange}
              className="w-full px-4 py-3 pr-8 border border-gray-200 rounded-full bg-gray-50 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
              min="0"
              max="100"
              step="0.01"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
          </div>
        </div>
      </div>

      {/* Included Tests */}
      <div className="bg-indigo-50 rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">
            Included Tests ({packageDetails.tests.length})
          </h3>
          <button
            onClick={() => setShowAddTest(prev => !prev)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 transition-colors"
            title={showAddTest ? 'Close' : 'Add test'}
          >
            {showAddTest ? <FaTimes className="text-sm" /> : <FaPlus className="text-sm" />}
          </button>
        </div>

        {showAddTest && (
          <div className="relative mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search test by name..."
                className="w-full pl-10 pr-10 py-3 rounded-full border border-gray-200 bg-white text-sm text-gray-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <FaChevronDown className="text-gray-400 text-sm" />
              </div>
            </div>

            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg divide-y divide-gray-100">
              {isLoading || isSearching ? (
                <div className="p-4 text-center text-sm text-gray-500">Loading tests...</div>
              ) : filteredTests.length > 0 ? (
                filteredTests.map(test => (
                  <button
                    key={test.id}
                    onClick={() => addTestToPackage(test)}
                    className="w-full flex justify-between items-center px-4 py-2.5 text-left hover:bg-indigo-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-800">{test.name}</span>
                    <span className="text-sm text-gray-600">₹{Number(test.price).toFixed(2)}</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">No matching tests found</div>
              )}
            </div>
          </div>
        )}

        <div className="divide-y divide-indigo-100">
          {packageDetails.tests.length > 0 ? (
            packageDetails.tests.map(test => (
              <div
                key={test.id}
                className="flex justify-between items-center py-3"
              >
                <span className="text-base font-medium text-indigo-600">{test.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-base text-gray-900">₹{Number(test.price).toFixed(2)}</span>
                  <button
                    onClick={() => removeTestFromPackage(test.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-full border border-red-400 text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Remove test"
                  >
                    <FaMinus className="text-[10px]" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4 text-sm">No tests selected yet</p>
          )}
        </div>
      </div>

      {/* Package Summary */}
      <div className="mb-5">
        <h3 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-200 mb-3">
          Package Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal ({packageDetails.tests.length} tests)</span>
            <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Discount ({packageDetails.discount}%):</span>
            <span className="text-red-500 font-medium">
              -₹{(subtotal * packageDetails.discount / 100).toFixed(2)}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">
              ₹{packageDetails.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-semibold text-gray-500 bg-white rounded-full border border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
        >
          <FaTimes className="h-4 w-4" />
          Cancel
        </button>
        <button
          onClick={submitPackageUpdate}
          className="px-6 py-2.5 text-sm font-semibold text-white rounded-full transition-all duration-200 flex items-center gap-2"
          style={{
            background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
          }}
        >
          <PlusIcon className="h-4 w-4" />
          Update Package
        </button>
      </div>

      {isLoading && allTests.length === 0 && (
        <div className="flex justify-center py-2">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default UpdatePackage;
