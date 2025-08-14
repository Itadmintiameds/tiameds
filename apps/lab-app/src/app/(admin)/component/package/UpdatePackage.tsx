
'use client';

import { getTests } from '@/../services/testService';
import Button from '@/app/(admin)/component/common/Button';
import Loader from '@/app/(admin)/component/common/Loader';
import { useLabs } from '@/context/LabContext';
import { TestList } from '@/types/test/testlist';
import { PlusIcon, SearchIcon, TagIcon } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { currentLab } = useLabs();
  const [categories, setCategories] = useState<string[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);

  const fetchAvailableTests = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTests = await getTests(currentLab?.id.toString() || '');
      setAllTests(fetchedTests);
      
      const uniqueCategories = ['All', ...Array.from(new Set(fetchedTests.map(test => test.category)))];
      setCategories(uniqueCategories);
      
      // Apply filters directly here instead of calling applyFilters
      let results = [...fetchedTests];
      
      if (selectedCategory !== 'All') {
        results = results.filter(test => test.category === selectedCategory);
      }
      
      if (searchTerm) {
        results = results.filter(test =>
          test.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredTests(results);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentLab, selectedCategory, searchTerm]);

  useEffect(() => {
    setPackageDetails(packageData);
    fetchAvailableTests();
  }, [packageData, currentLab, fetchAvailableTests]);

  const applyFilters = useCallback(() => {
    let results = [...allTests];
    
    if (selectedCategory !== 'All') {
      results = results.filter(test => test.category === selectedCategory);
    }
    
    if (searchTerm) {
      results = results.filter(test =>
        test.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTests(results);
  }, [allTests, selectedCategory, searchTerm]);

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
    setPackageDetails(prev => ({
      ...prev,
      [name]: name === 'discount' ? parseFloat(value) : value
    }));
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
    handleUpdatePackage(packageDetails);
    onClose();
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-2">
      {/* Package Editor Card */}
      <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
          ✨ Package Details
        </h2>
        
        <div className="space-y-5">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package Name
            </label>
            <input
              type="text"
              name="packageName"
              value={packageDetails.packageName}
              onChange={handleFieldChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Health Master Package"
            />
          </div>
          
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                name="discount"
                value={packageDetails.discount}
                onChange={handleFieldChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              <span className="absolute right-3 top-2 text-gray-500">%</span>
            </div>
          </div>
          
          <div className="selected-tests-section">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <TagIcon className="mr-2 h-4 w-4" />
              Included Tests ({packageDetails.tests.length})
            </h3>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-2 bg-gray-50">
              {packageDetails.tests.length > 0 ? (
                packageDetails.tests.map(test => (
                  <div 
                    key={test.id} 
                    className="flex justify-between items-center p-3 mb-2 bg-white rounded-md shadow-xs hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{test.name}</p>
                      <p className="text-xs text-gray-500">₹{test.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeTestFromPackage(test.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      aria-label="Remove test"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No tests selected yet</p>
              )}
            </div>
          </div>
          
          <div className="pricing-summary bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Discount ({packageDetails.discount}%):</span>
              <span className="text-sm font-medium text-red-500">
                -₹{(subtotal * packageDetails.discount / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-100 mt-2">
              <span className="text-base font-bold text-gray-800">Final Price:</span>
              <span className="text-lg font-bold text-blue-600">
                ₹{packageDetails.price.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              text="Cancel"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            />
            <Button
              text="Update Package"
              onClick={submitPackageUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
                <PlusIcon className="h-4 w-4" />
              
            </Button>
          </div>
        </div>
      </div>
      
      {/* Test Explorer Card */}
      <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
          🔍 Test Explorer
        </h2>
        
        <div className="search-filters mb-6">
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="category-filter">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="test-list max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader />
            </div>
          ) : filteredTests.length > 0 ? (
            filteredTests.map(test => (
              <div 
                key={test.id} 
                className="flex justify-between items-center p-4 mb-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-800">{test.name}</h4>
                  <div className="flex items-center mt-1 space-x-3">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {test.category}
                    </span>
                    <span className="text-sm text-gray-600">
                      ₹{test.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => addTestToPackage(test)}
                  className="text-green-500 hover:text-green-700 transition-colors p-2"
                  aria-label="Add test"
                  text =''
                >
                    <FaPlus />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No tests found matching your criteria</p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-blue-500 text-sm mt-2 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatePackage;