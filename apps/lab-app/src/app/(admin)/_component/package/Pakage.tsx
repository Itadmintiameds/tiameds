'use client';
import { getTests } from '@/../../services/testService';
import { createPackage } from '@/../services/packageServices';
import { useLabs } from '@/context/LabContext';
import { packageDataSchema } from '@/schema/packageDataSchema';
import { TestList } from '@/types/test/testlist';
import { useEffect, useState } from 'react';
import { FiCheck, FiDollarSign, FiPlusCircle, FiSearch, FiTag, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

import { LuTestTube } from "react-icons/lu";


interface Package {
  packageName: string;
  price: number;
  discount: number;
  testIds: number[];
}

const PackageCreation = () => {
  const [packageData, setPackageData] = useState<Package>({
    packageName: '',
    price: 0,
    discount: 0,
    testIds: [],
  });
  const [tests, setTests] = useState<TestList[]>([]);
  const [filteredTests, setFilteredTests] = useState<TestList[]>([]);
  const [selectedTests, setSelectedTests] = useState<TestList[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [discount, setDiscount] = useState(0); // Discount in percentage
  const { currentLab } = useLabs();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const testsData = await getTests(currentLab?.id?.toString() || '');
        setTests(testsData);
        setFilteredTests(testsData);

        const uniqueCategories = Array.from(new Set(testsData.map((test) => test.category)));
        setCategories(['All', ...uniqueCategories]);
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    };

    fetchTests();
  }, [currentLab]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowerCaseQuery = query.toLowerCase();
    filterTests(lowerCaseQuery, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterTests(searchQuery, category);
  };

  const filterTests = (query: string, category: string) => {
    const lowerCaseQuery = query.toLowerCase();
    let filtered = tests;

    if (category !== 'All') {
      filtered = filtered.filter((test) => test.category === category);
    }

    filtered = filtered.filter(
      (test) =>
        test.name.toLowerCase().includes(lowerCaseQuery) ||
        test.category.toLowerCase().includes(lowerCaseQuery)
    );

    setFilteredTests(filtered);
  };

  const handleAddTest = (test: TestList) => {
    if (!selectedTests.find((t) => t.id === test.id)) {
      setSelectedTests([...selectedTests, test]);
      setPackageData({ ...packageData, testIds: [...packageData.testIds, test.id] });
    }
  };

  const handleRemoveTest = (testId: number) => {
    setSelectedTests(selectedTests.filter((test) => test.id !== testId));
    setPackageData({
      ...packageData,
      testIds: packageData.testIds.filter((id) => id !== testId),
    });
  };

  const calculateTotal = () => {
    return selectedTests.reduce((total, test) => total + test.price, 0);
  };

  const calculateFinalPrice = () => {
    const total = calculateTotal();
    return total - (total * discount) / 100;
  };



  const handleSubmit = async () => {
    try {
      // Prepare only the required fields for submission
      const cleanPackageData = {
        id: Date.now(), // Generate a temporary ID
        packageName: packageData.packageName,
        testIds: packageData.testIds,
        price: calculateFinalPrice(),
        discount: discount,
      };

      // Validate the package data against the schema
      packageDataSchema.parse(cleanPackageData);

      if (currentLab) {
        await createPackage(currentLab.id, cleanPackageData); // Send clean data
        toast.success('Package created successfully!', { autoClose: 2000, position: 'top-right' });

        // Reset the form after success
        setPackageData({ packageName: '', price: 0, testIds: [], discount: 0 });
        setSelectedTests([]);
        setDiscount(0);
      } else {
        toast.error('Current lab is not available.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create package. Please check the inputs.');
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded shadow">
      <h1 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-700">
        <FiTag /> Create Package
      </h1>

      {/* Package Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-600">Package Name</label>
          <div className="relative">
            <input
              type="text"
              value={packageData.packageName}
              onChange={(e) => setPackageData({ ...packageData, packageName: e.target.value })}
              placeholder="Enter package name"
              className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-400"
            />
            <FiTag className="absolute top-1/2 transform -translate-y-1/2 right-2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-600">Discount (%)</label>
          <div className="relative">
            <input
              type="number"
              value={discount}
              onChange={(e) => {
                const input = Math.max(0, +e.target.value); // Ensure the discount is non-negative
                setDiscount(input);
              }}
              placeholder="Enter discount percentage"
              className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-400"
            />
            <FiDollarSign className="absolute top-1/2 transform -translate-y-1/2 right-2 text-gray-400" />
          </div>
        </div>
      </div>


      {/* Categorization Tabs */}
      <div className="flex flex-wrap gap-2 mt-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-2 py-1 rounded-full text-xs ${selectedCategory === category
              ? 'bg-indigo-900 text-white'
              : 'bg-gray-200 text-gray-700'
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Test Search and List */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-gray-700">Select Tests</h2>
        <div className="relative w-full mt-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search tests"
            className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-400"
          />
          <FiSearch className="absolute top-1/2 transform -translate-y-1/2 right-2 text-gray-400" />
        </div>

        <div className="mt-4 border rounded bg-white p-3 max-h-40 overflow-y-auto">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="flex justify-between items-center py-1 border-b last:border-none text-sm"
            >
              <span className='flex items-center gap-2'>
                <LuTestTube className="text-base text-indigo-900" />
                {test.name} ({test.category}) - ₹{test.price}
              </span>
              <button
                onClick={() => handleAddTest(test)}
                className="text-blue-500 hover:text-blue-700"
              >
                <FiPlusCircle className="text-base" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Tests */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-gray-700">Selected Tests</h2>
        <div className="mt-2 border rounded bg-white p-3 max-h-40 overflow-y-auto">
          {selectedTests.map((test) => (
            <div
              key={test.id}
              className="flex justify-between items-center py-1 border-b last:border-none text-sm"
            >
              <span>
                {test.name} - ₹{test.price}
              </span>
              <button
                onClick={() => handleRemoveTest(test.id)}
                className="text-red-500 hover:text-red-700"
              >
                <FiTrash2 className="text-base" />
              </button>
            </div>
          ))}
          {selectedTests.length === 0 && <p className="text-xs text-gray-500">No tests selected.</p>}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700">Summary</h3>
        <p className="text-sm mt-2">
          Total Price: <strong>₹{calculateTotal()}</strong>
        </p>
        <p className="text-sm">
          Final Price (after discount): <strong>₹{calculateFinalPrice()}</strong>
        </p>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-900 text-white px-4 py-2 rounded text-sm shadow hover:bg-green-600 flex items-center justify-center gap-1"
        >
          <FiCheck className="text-base" /> Add Package
        </button>
      </div>
    </div>
  );
};

export default PackageCreation;

