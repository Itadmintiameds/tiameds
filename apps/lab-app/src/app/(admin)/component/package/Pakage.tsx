

'use client';
import { getTests } from '@/../../services/testService';
import { createPackage } from '@/../services/packageServices';
import Loader from '@/app/(admin)/component/common/Loader';
import { useLabs } from '@/context/LabContext';
import { packageDataSchema } from '@/schema/packageDataSchema';
import { TestList } from '@/types/test/testlist';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BsCurrencyRupee, BsPercent } from "react-icons/bs";
import { FiCheck, FiPlusCircle, FiSearch, FiTag, FiTrash2 } from 'react-icons/fi';
import { LuTestTube } from "react-icons/lu";
import { toast } from 'react-toastify';

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
  const [discount, setDiscount] = useState(0);
  const { currentLab } = useLabs();
  const [loading, setLoading] = useState(false);
  // const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const testsData = await getTests(currentLab?.id?.toString() || '');
        setTests(testsData);
        setFilteredTests(testsData);

        const uniqueCategories = Array.from(new Set(testsData.map((test) => test.category)));
        setCategories(['All', ...uniqueCategories]);
      } catch (error) {
        // Handle tests fetch error
        toast.error('Failed to load tests. Please try again.');
      } finally {
        setLoading(false);
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
      toast.success(`${test.name} added to package`, {
        position: 'bottom-right',
        autoClose: 1500,
        hideProgressBar: true
      });
    }
  };

  const handleRemoveTest = (testId: number) => {
    const testToRemove = selectedTests.find(test => test.id === testId);
    setSelectedTests(selectedTests.filter((test) => test.id !== testId));
    setPackageData({
      ...packageData,
      testIds: packageData.testIds.filter((id) => id !== testId),
    });

    if (testToRemove) {
      toast.info(`${testToRemove.name} removed from package`, {
        position: 'bottom-right',
        autoClose: 1500,
        hideProgressBar: true
      });
    }
  };

  const calculateTotal = () => {
    return selectedTests.reduce((total, test) => total + test.price, 0);
  };

  const calculateFinalPrice = () => {
    const total = calculateTotal();
    const finalPrice = total - (total * discount) / 100;
  
    return finalPrice;
  };

  const animatePriceChange = async () => {
    // setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    // setIsCalculating(false);
  };

  useEffect(() => {
    if (selectedTests.length > 0 || discount > 0) {
      animatePriceChange();
    }
  }, [selectedTests, discount]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validation checks before creating the package
      if (!packageData.packageName.trim()) {
        toast.error('Package name is required.', {
          className: 'bg-error text-white'
        });
        return;
      }

      if (packageData.packageName.trim().length < 3) {
        toast.error('Package name must be at least 3 characters long.', {
          className: 'bg-error text-white'
        });
        return;
      }

      if (selectedTests.length === 0) {
        toast.error('Please select at least one test for the package.', {
          className: 'bg-error text-white'
        });
        return;
      }

      const finalPrice = calculateFinalPrice();
      if (finalPrice <= 0) {
        toast.error('Package price must be greater than 0.', {
          className: 'bg-error text-white'
        });
        return;
      }

      const cleanPackageData = {
        id: Date.now(),
        packageName: packageData.packageName.trim(),
        testIds: packageData.testIds,
        price: finalPrice,
        discount: discount,
      };

    

      // Validate with schema
      const validationResult = packageDataSchema.safeParse(cleanPackageData);
      if (!validationResult.success) {
        // Handle validation errors
        const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
        toast.error(`Validation failed: ${errorMessages}`, {
          className: 'bg-error text-white'
        });
        return;
      }

      if (currentLab) {
        await createPackage(currentLab.id, cleanPackageData);
       
        toast.success('Package created successfully!', {
          autoClose: 2000,
          position: 'top-right',
          className: 'bg-success text-white'
        });

        setPackageData({ packageName: '', price: 0, testIds: [], discount: 0 });
        setSelectedTests([]);
        setDiscount(0);
      } else {
        toast.error('Current lab is not available.');
      }
    } catch (error) {
      // Handle package creation error
      if (error && typeof error === 'object' && 'message' in error) {
        toast.error((error as { message: string }).message || 'Failed to create package. Please check the inputs.', {
          className: 'bg-error text-white'
        });
      } else {
        toast.error('Failed to create package. Please check the inputs.', {
          className: 'bg-error text-white'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md max-w-full mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="p-3 bg-indigo-100 rounded-full">
          <FiTag className="text-indigo-600 text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Package</h1>
          <p className="text-sm text-gray-500">Combine multiple tests into a single discounted package</p>
        </div>
      </motion.div>

      {/* Package Details */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <label className="block text-sm font-medium mb-2 text-gray-600 flex items-center gap-1">
            <FiTag className="text-indigo-500" /> Package Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={packageData.packageName}
              onChange={(e) => setPackageData({ ...packageData, packageName: e.target.value })}
              placeholder="e.g., Complete Health Checkup"
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <label className="block text-sm font-medium mb-2 text-gray-600 flex items-center gap-1">
            <BsPercent className="text-indigo-500" /> Discount (%)
          </label>
          <div className="relative">
            <input
              type="number"
              value={discount}
              onChange={(e) => {
                const input = Math.max(0, Math.min(100, +e.target.value));
                setDiscount(input);
              }}
              placeholder="0-100%"
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
            />
            <div className="absolute right-3 top-3 text-gray-400 text-sm">%</div>
          </div>
        </div>
      </motion.div>

      {/* Categorization Tabs */}
      <motion.div
        className="flex flex-wrap gap-2 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCategoryChange(category)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === category
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {category}
          </motion.button>
        ))}
      </motion.div>

      {/* Test Search and List */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <LuTestTube className="text-indigo-600" /> Available Tests
          </h2>
          <div className="text-xs text-gray-500">
            Showing {filteredTests.length} of {tests.length} tests
          </div>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search tests by name or category..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
          />
        </div>

        <div className="border border-gray-200 rounded-lg bg-white p-3 max-h-60 overflow-y-auto shadow-inner">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader type="progress" fullScreen={false} text=" Loading tests..." />
              <p className="mt-4 text-sm text-gray-500">Please wait while we load the available tests. This may take a moment.</p>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              {searchQuery ? 'No tests match your search' : 'No tests available in this category'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredTests.map((test) => (
                <motion.li
                  key={test.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="py-3 flex justify-between items-center group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <LuTestTube className="text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{test.name}</div>
                      <div className="text-xs text-gray-500 flex gap-2">
                        <span>{test.category}</span>
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                                                     <BsCurrencyRupee className="text-xs" /> {Number(test.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAddTest(test)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-indigo-100 rounded-full text-indigo-600 hover:bg-indigo-200"
                    title="Add to package"
                  >
                    <FiPlusCircle className="text-lg" />
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>

      {/* Selected Tests */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FiCheck className="text-green-500" /> Selected Tests ({selectedTests.length})
          </h2>
          {selectedTests.length > 0 && (
            <div className="text-xs text-gray-500">
              Total: <span className="font-medium">₹{calculateTotal()}</span>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedTests.length > 0 ? (
            <motion.div
              className="border border-gray-200 rounded-lg bg-white p-3 max-h-60 overflow-y-auto shadow-inner"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ul className="divide-y divide-gray-100">
                <AnimatePresence>
                  {selectedTests.map((test) => (
                    <motion.li
                      key={test.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="py-3 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <LuTestTube className="text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{test.name}</div>
                          <div className="text-xs text-gray-500">{test.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                                                 <span className="text-sm font-medium text-gray-700">₹{Number(test.price).toFixed(2)}</span>
                        <button
                          onClick={() => handleRemoveTest(test.id)}
                          className="p-1.5 bg-red-50 rounded-full text-red-500 hover:bg-red-100 transition-colors"
                          title="Remove from package"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </motion.div>
          ) : (
            <motion.div
              className="border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 p-6 text-center h-20  "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FiPlusCircle className="mx-auto text-3xl text-gray-300 mb-2 -mt-8" />
              <p className="text-sm text-gray-500">No tests selected yet. Search and add tests above.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Summary */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <BsCurrencyRupee className="text-indigo-500" /> Package Summary
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Subtotal ({selectedTests.length} tests):</span>
            <span className="text-sm font-medium">₹{calculateTotal()}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Discount ({discount}%):</span>
            <span className="text-sm font-medium text-red-500">-₹{(calculateTotal() * discount / 100).toFixed(2)}</span>
          </div>

          <div className="border-t border-gray-200 my-2"></div>

          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-gray-800">Final Price:</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={calculateFinalPrice()}
                initial={{ scale: 1.2, color: '#4f46e5' }}
                animate={{ scale: 1, color: '#111827' }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500 }}
                className="text-lg font-bold"
              >
                ₹{calculateFinalPrice().toFixed(2)}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={handleSubmit}
          disabled={!packageData.packageName.trim() || selectedTests.length === 0 || loading}
          className={`w-full px-6 py-3 rounded-lg text-white font-medium shadow-md transition-all flex items-center justify-center gap-2
            ${(!packageData.packageName.trim() || selectedTests.length === 0)
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg'
            }`}
        >
          {loading ? (
            <>
              <Loader type="progress" fullScreen={false} text="Creating package..." />
              <span className="ml-2">Creating...</span>
            </>
          ) : (
            <>
              <FiCheck className="text-lg" />
              <span>Create Package</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default PackageCreation;