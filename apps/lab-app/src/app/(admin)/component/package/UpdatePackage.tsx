
'use client';

import { getTests } from '@/../services/testService';
// import Button from '@/app/(admin)/component/common/Button';
import Loader from '@/app/(admin)/component/common/Loader';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import { PlusIcon, SearchIcon } from 'lucide-react';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { FaPlus, FaTimes, FaBox, FaVial, FaDollarSign } from 'react-icons/fa';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { currentLab } = useLabs();
  const [categories, setCategories] = useState<string[]>([]);
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
      
      const uniqueCategories = ['All', ...Array.from(new Set(fetchedTests.map(test => test.category)))];
      setCategories(uniqueCategories);
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
    let results = [...allTests];
    
    if (selectedCategory !== 'All') {
      results = results.filter(test => test.category === selectedCategory);
    }
    
    if (debouncedSearchTerm) {
      results = results.filter(test =>
        test.name.toLowerCase().startsWith(debouncedSearchTerm.toLowerCase())
      );
    }
    
    setFilteredTests(results);
  }, [allTests, selectedCategory, debouncedSearchTerm]);

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
      // Only allow letters and spaces, remove leading spaces
      let filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
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

    // Validate package name format - only alpha characters and spaces
    const packageNameRegex = /^[a-zA-Z\s]+$/;
    if (!packageNameRegex.test(packageDetails.packageName.trim())) {
      alert('Package name can only contain letters and spaces.');
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
    <div className="flex flex-col md:flex-row gap-6 p-2">
      {/* Package Editor Card */}
      <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6 border-b pb-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Package Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Package Information Section */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 space-y-3">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <FaBox className="mr-2 text-blue-600" /> Package Information
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Package Name
              </label>
              <input
                type="text"
                name="packageName"
                value={packageDetails.packageName}
                onChange={handleFieldChange}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-sm"
                placeholder="Health Master Package"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Discount Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discount"
                  value={packageDetails.discount || ''}
                  onChange={handleDiscountChange}
                  className="w-full px-4 py-2 pr-8 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
              </div>
            </div>
          </div>
          
          {/* Selected Tests Section */}
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
              <FaVial className="mr-2 text-green-600" /> Included Tests ({packageDetails.tests.length})
            </h4>
            <div className="max-h-48 overflow-y-auto border border-green-200 rounded-lg p-2 bg-white">
              {packageDetails.tests.length > 0 ? (
                packageDetails.tests.map(test => (
                  <div 
                    key={test.id} 
                    className="flex justify-between items-center p-3 mb-2 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{test.name}</p>
                      <p className="text-xs text-gray-600">₹{test.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeTestFromPackage(test.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      aria-label="Remove test"
                    >
                      <FaTimes className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">No tests selected yet</p>
              )}
            </div>
          </div>
          
          {/* Pricing Summary Section */}
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <FaDollarSign className="mr-2 text-yellow-600" /> Package Summary
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Subtotal:</span>
                <span className="text-gray-900 font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Discount ({packageDetails.discount}%):</span>
                <span className="text-red-600 font-semibold">
                  -₹{(subtotal * packageDetails.discount / 100).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-yellow-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Final Price:</span>
                  <span className="text-base font-bold text-gray-900">
                    ₹{packageDetails.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 border border-gray-200 flex items-center gap-2"
            >
              <FaTimes className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={submitPackageUpdate}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center gap-2"
              style={{
                background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
              }}
            >
              <PlusIcon className="h-4 w-4" />
              Update Package
            </button>
          </div>
        </div>
      </div>
      
      {/* Test Explorer Card */}
      <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2">
          Test Explorer
        </h2>
        
        <div className="mb-6">
          {/* Search Section */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-3">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <SearchIcon className="mr-2 h-4 w-4 text-blue-600" /> Search Tests
            </h4>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-sm"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <label className="block text-sm font-semibold text-blue-800 mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center">
            <FaVial className="mr-2 text-green-600" /> Available Tests
          </h4>
          <div className="test-list max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader />
              </div>
            ) : filteredTests.length > 0 ? (
              filteredTests.map(test => (
                <div 
                  key={test.id} 
                  className="flex justify-between items-center p-3 mb-2 bg-white rounded-lg border border-green-200 hover:bg-green-50 transition-colors"
                >
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">{test.name}</h4>
                    <div className="flex items-center mt-1 space-x-3">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {test.category}
                      </span>
                      <span className="text-sm text-gray-600">
                        ₹{test.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => addTestToPackage(test)}
                    className="text-green-600 hover:text-green-700 transition-colors p-2 hover:bg-green-100 rounded-lg"
                    aria-label="Add test"
                  >
                    <FaPlus className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 text-sm">No tests found matching your criteria</p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
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
      </div>
    </div>
  );
};

export default UpdatePackage;