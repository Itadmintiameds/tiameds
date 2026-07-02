

'use client';
import { getTests } from '@/../../services/testService';
import { createPackage } from '@/../services/packageServices';
import Loader from '@/app/(admin)/component/common/Loader';
import { useLabs } from '@/context/LabContext';
import { packageDataSchema } from '@/schema/packageDataSchema';
import { TestList } from '@/types/test/testlist';
import { useEffect, useState } from 'react';
import { FiCheck, FiSearch, FiAlertTriangle } from 'react-icons/fi';
import { FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface PackageFormData {
  packageName: string;
  price: number;
  discount: number;
  testIds: number[];
}

interface PackageCreationProps {
  closeModal?: () => void;
}

const PackageCreation = ({ closeModal }: PackageCreationProps = {}) => {
  const [packageData, setPackageData] = useState<PackageFormData>({
    packageName: '',
    price: 0,
    discount: 0,
    testIds: [],
  });
  const [tests, setTests] = useState<TestList[]>([]);
  const [filteredTests, setFilteredTests] = useState<TestList[]>([]);
  const [selectedTests, setSelectedTests] = useState<TestList[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [discount, setDiscount] = useState<string>("0");
  const { currentLab } = useLabs();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const testsData = await getTests(currentLab?.id?.toString() || '');
        setTests(testsData);
        setFilteredTests(testsData);
      } catch (error) {
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
    const filtered = tests.filter(
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
    const discountValue = parseFloat(discount) || 0;
    const finalPrice = total - (total * discountValue) / 100;

    return finalPrice;
  };

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

      // Validate package name format - alphanumeric characters and spaces
      const packageNameRegex = /^[a-zA-Z0-9\s]+$/;
      if (!packageNameRegex.test(packageData.packageName.trim())) {
        toast.error('Package name can only contain letters, numbers, and spaces.', {
          className: 'bg-error text-white'
        });
        return;
      }

      // Check if package name contains at least one alphanumeric character
      const hasAlphanumeric = /[a-zA-Z0-9]/.test(packageData.packageName.trim());
      if (!hasAlphanumeric) {
        toast.error('Package name must contain at least one letter or number.', {
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
        discount: parseFloat(discount) || 0,
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
        setDiscount("0");
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

  const isSelected = (testId: number) => selectedTests.some((t) => t.id === testId);

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Package</h1>
          <p className="text-sm text-gray-500">Combine multiple tests into a single discounted package</p>
        </div>
        {closeModal && (
          <button
            onClick={closeModal}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex items-start gap-2 mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
        <FiAlertTriangle className="text-base mt-0.5 shrink-0" />
        <p className="text-sm">
          Packages cannot be deleted once created. Please review the package name, tests, and pricing carefully before submitting.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column */}
        <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Package name
              </label>
              <input
                type="text"
                value={packageData.packageName}
                onChange={(e) => {
                  const value = e.target.value;
                  let filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
                  filteredValue = filteredValue.replace(/^\s+/, '');
                  setPackageData({ ...packageData, packageName: filteredValue });
                }}
                placeholder="Enter the package name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Discount Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setDiscount("0");
                    } else {
                      let numericValue = value.replace(/[^0-9.]/g, '');
                      const parts = numericValue.split('.');
                      if (parts.length > 2) {
                        numericValue = parts[0] + '.' + parts.slice(1).join('');
                      }
                      if (parts.length === 2 && parts[1].length > 2) {
                        numericValue = parts[0] + '.' + parts[1].substring(0, 2);
                      }
                      const numValue = parseFloat(numericValue);
                      if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                        setDiscount(numericValue);
                      } else if (numValue > 100) {
                        setDiscount("100.00");
                      } else if (numValue < 0) {
                        setDiscount("0");
                      }
                    }
                  }}
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    let value = input.value;
                    if (value.length > 1 && value.startsWith('0') && !value.startsWith('0.')) {
                      value = value.replace(/^0+/, '');
                      if (value === '') {
                        value = '0';
                      }
                      input.value = value;
                      setDiscount(value);
                    }
                  }}
                  placeholder="%"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-8 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-gray-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Available Tests
            </label>
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search test by name or category..."
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-gray-50"
              />
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader type="progress" fullScreen={false} text=" Loading tests..." />
                  <p className="mt-4 text-sm text-gray-500">Please wait while we load the available tests.</p>
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-indigo-50">
                      <tr className="text-sm text-gray-600">
                        <th className="px-4 py-3 font-semibold">Code</th>
                        <th className="px-4 py-3 font-semibold">Test Name</th>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Price</th>
                        <th className="px-4 py-3 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTests.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500 text-sm">
                            {searchQuery ? 'No tests match your search' : 'No tests available'}
                          </td>
                        </tr>
                      ) : (
                        filteredTests.map((test) => (
                          <tr key={test.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">{test.testCode || '—'}</td>
                            <td className="px-4 py-3 text-sm text-gray-800">{test.name}</td>
                            <td className="px-4 py-3">
                              <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                                {test.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">₹{Number(test.price).toFixed(2)}</td>
                            <td className="px-4 py-3">
                              {isSelected(test.id) ? (
                                <button
                                  onClick={() => handleRemoveTest(test.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-400 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors"
                                >
                                  <FaMinus className="text-[10px]" /> Remove
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAddTest(test)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-400 text-green-600 text-xs font-semibold hover:bg-green-50 transition-colors"
                                >
                                  <FaPlus className="text-[10px]" /> Add
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Summary Sidebar */}
        <div className="w-full lg:w-[340px] lg:sticky lg:top-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Package Summary</h3>

          <div
            className={`space-y-3 pr-1 ${selectedTests.length > 4
              ? 'max-h-64 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full'
              : ''
              }`}
          >
            {selectedTests.length > 0 ? (
              selectedTests.map((test) => (
                <div key={test.id} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{test.name}</p>
                    {test.testCode && (
                      <p className="text-xs text-gray-400">{test.testCode}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">₹{Number(test.price).toFixed(0)}</span>
                    <button
                      onClick={() => handleRemoveTest(test.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No tests selected yet. Search and add tests to build your package.</p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal ({selectedTests.length} tests)</span>
              <span className="text-gray-800">₹{calculateTotal()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount</span>
              <span className="text-red-500">-₹{((calculateTotal() * (parseFloat(discount) || 0)) / 100).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-base font-bold text-gray-900">₹{calculateFinalPrice().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!packageData.packageName.trim() || selectedTests.length === 0 || loading}
            className={`w-full px-6 py-3 rounded-full text-white font-semibold shadow-md transition-all flex items-center justify-center gap-2
              ${(!packageData.packageName.trim() || selectedTests.length === 0)
                ? 'bg-gray-300 cursor-not-allowed'
                : ''
              }`}
            style={(!packageData.packageName.trim() || selectedTests.length === 0) ? {} : {
              background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
            }}
          >
            {loading ? (
              <span>Creating...</span>
            ) : (
              <>
                <FiCheck className="text-lg" />
                <span>Create Package</span>
              </>
            )}
          </button>

          {closeModal && (
            <button
              onClick={closeModal}
              className="w-full px-6 py-2.5 text-sm font-semibold text-gray-500 bg-white rounded-full border border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FaTimes className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageCreation;
