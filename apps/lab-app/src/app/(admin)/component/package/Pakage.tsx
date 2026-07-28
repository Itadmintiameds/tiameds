'use client';
import { getTests } from '@/../../services/testService';
import { createPackage } from '@/../services/packageServices';
import Loader from '@/app/(admin)/component/common/Loader';
import { useLabs } from '@/context/LabContext';
import { packageDataSchema } from '@/schema/packageDataSchema';
import { TestList } from '@/types/test/testlist';
import { useEffect, useState } from 'react';
import { Plus, Search, X, AlertTriangle, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import NewCommonTable, { Column } from '@/app/(admin)/dashboard/newcommoncomponent/NewCommonTable';

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

  const testColumns: Column<TestList>[] = [
    {
      header: 'Code',
      accessor: 'testCode',
      render: (row) => (
        <p className="text-p3 font-medium text-pneutral-700">{row.testCode || '—'}</p>
      ),
    },
    {
      header: 'Test Name',
      accessor: 'name',
      render: (row) => <p className="text-p3 text-pneutral-900">{row.name}</p>,
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-info-50 px-2.5 py-1 text-p2 font-medium text-info-700">
          {row.category}
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (row) => (
        <p className="text-p3 text-pneutral-700">₹{Number(row.price).toFixed(2)}</p>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) =>
        isSelected(row.id) ? (
          <button
            onClick={() => handleRemoveTest(row.id)}
            className="flex items-center gap-1.5 rounded-full border border-warning-500 px-3 py-1 text-p2 font-semibold text-warning-500 hover:bg-warning-50 transition-colors"
          >
            <X size={12} /> Remove
          </button>
        ) : (
          <button
            onClick={() => handleAddTest(row)}
            className="flex items-center gap-1.5 rounded-full border border-success-600 px-3 py-1 text-p2 font-semibold text-success-700 hover:bg-success-50 transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        ),
    },
  ];

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-semibold text-pneutral-900">Create New Package</h1>
          <p className="mt-1 text-p3 text-pneutral-500">
            Combine multiple tests into a single discounted package
          </p>
        </div>
        {closeModal && (
          <button
            onClick={closeModal}
            className="p-2 text-pneutral-500 hover:text-pneutral-700 hover:bg-pneutral-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-danger-100 border border-danger-300 px-4 py-3 text-warning-800">
        <AlertTriangle className="mt-0.5 shrink-0" size={16} />
        <p className="text-p3">
          Packages cannot be deleted once created. Please review the package name, tests, and pricing carefully before submitting.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Column */}
        <div className="flex-1 w-full bg-info-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-p3 font-medium text-pneutral-900 mb-1.5">
                Package name <span className="text-warning-500">*</span>
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
                className="w-full rounded-lg border border-pneutral-200 px-4 py-2 text-p3 bg-white focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
              />
            </div>

            <div>
              <label className="block text-p3 font-medium text-pneutral-900 mb-1.5">
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
                  className="w-full rounded-lg border border-pneutral-200 px-4 py-2 pr-8 text-p3 bg-white focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-pneutral-400 text-p3">%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-p3 font-medium text-pneutral-900 mb-1.5">
              Available Tests
            </label>
            <div className="relative mb-3">
              <Search className="absolute top-1/2 -translate-y-1/2 left-3 text-pneutral-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search test by name or category..."
                className="w-full rounded-lg border border-pneutral-200 pl-9 pr-4 py-2 text-p3 bg-white focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-pneutral-200 bg-white">
                <Loader type="progress" fullScreen={false} text=" Loading tests..." />
                <p className="mt-4 text-p3 text-pneutral-500">Please wait while we load the available tests.</p>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-pneutral-200 bg-white py-16">
                <p className="text-p3 font-medium text-pneutral-500">
                  {searchQuery ? 'No tests match your search' : 'No tests available'}
                </p>
              </div>
            ) : (
              <NewCommonTable
                columns={testColumns}
                data={filteredTests}
                pageSize={10}
                showPagination={true}
                resetPageKey={searchQuery}
              />
            )}
          </div>
        </div>

        {/* Right Column - Summary Sidebar */}
        <div className="w-full lg:w-[320px] lg:sticky lg:top-0 bg-danger-100 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-warning-800 text-p3">Package Summary</h3>

          <div
            className={`space-y-3 pr-1 ${selectedTests.length > 4
              ? 'max-h-56 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-pneutral-300 [&::-webkit-scrollbar-thumb]:rounded-full'
              : ''
              }`}
          >
            {selectedTests.length > 0 ? (
              selectedTests.map((test) => (
                <div key={test.id} className="flex justify-between items-start bg-white rounded-lg px-3 py-2">
                  <div>
                    <p className="text-p3 font-medium text-pneutral-900">{test.name}</p>
                    {test.testCode && (
                      <p className="text-p2 text-pneutral-400">{test.testCode}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-p3 text-pneutral-700">₹{Number(test.price).toFixed(0)}</span>
                    <button
                      onClick={() => handleRemoveTest(test.id)}
                      className="text-pneutral-400 hover:text-warning-500 transition-colors"
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-p3 text-pneutral-500">No tests selected yet. Search and add tests to build your package.</p>
            )}
          </div>

          <div className="border-t border-danger-300 pt-3 space-y-2">
            <div className="flex justify-between text-p3">
              <span className="text-pneutral-600">Subtotal ({selectedTests.length} tests)</span>
              <span className="text-pneutral-900">₹{calculateTotal()}</span>
            </div>
            <div className="flex justify-between text-p3">
              <span className="text-pneutral-600">Discount</span>
              <span className="text-warning-600">-₹{((calculateTotal() * (parseFloat(discount) || 0)) / 100).toFixed(2)}</span>
            </div>
            <div className="border-t border-danger-300 pt-2 flex justify-between items-center">
              <span className="text-p1 font-bold text-pneutral-900">Total</span>
              <span className="text-p1 font-bold text-pneutral-900">₹{calculateFinalPrice().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!packageData.packageName.trim() || selectedTests.length === 0 || loading}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-secondary-700 px-6 py-2.5 text-p3 font-medium text-pneutral-50 disabled:bg-pneutral-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span>Creating...</span>
            ) : (
              <>
                <Check size={16} />
                <span>Create Package</span>
              </>
            )}
          </button>

          {closeModal && (
            <button
              onClick={closeModal}
              className="w-full flex items-center justify-center gap-2 rounded-full border border-pneutral-400 bg-pneutral-50 px-6 py-2 text-p3 font-medium text-pneutral-700 transition-colors"
            >
              <X size={14} />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageCreation;
