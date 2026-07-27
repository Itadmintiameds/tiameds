

'use client';

import { getPackage, updatePackage } from '@/../services/packageServices';
import { useLabs } from '@/context/LabContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Eye, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import Loader from '../common/Loader';
import UpdatePackage from './UpdatePackage';
import ViewPackage from './ViewPackage';
import { TestList } from '@/types/test/testlist';
import NewCommonTable from '@/app/(admin)/dashboard/newcommoncomponent/NewCommonTable';
import NewModal from '@/app/(admin)/dashboard/newcommoncomponent/NewModal';

interface editingPackage {
  id: number
  packageName: string;
  price: number;
  discount: number;
  tests: TestList[];
}

interface Package {
  id: number;
  packageName: string;
  price: number;
  discount: number;
  tests: TestList[];
}

interface updatePackage {
  id: number;
  packageName: string;
  discount: number;
  price: number;
  tests: TestList[];
}

const PackageList = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'new' | 'old'>('new');
  const [editingPackage, setEditingPackage] = useState<editingPackage | null>(null);
  const [viewingPackage, setViewingPackage] = useState<Package | null>(null);
  // Package deletion is disabled — once created, a package cannot be deleted
  // (backend silently fails to remove packages linked to orders/reports).

  const { currentLab } = useLabs();
  const router = useRouter();

  const fetchPackages = useCallback(async () => {
    if (!currentLab) {
      setError('No lab selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getPackage(currentLab.id);
      if (response && response.status === 'success' && response.data) {
        setPackages(response.data);
      } else {
        setError('No packages found or failed to fetch data.');
      }
    } catch (err) {
      setError('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  }, [currentLab]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    packages.forEach(pkg => {
      pkg.tests?.forEach(test => unique.add(test.category));
    });
    return Array.from(unique);
  }, [packages]);

  const averagePrice = useMemo(() => {
    if (packages.length === 0) return 0;
    return packages.reduce((sum, pkg) => sum + Number(pkg.price || 0), 0) / packages.length;
  }, [packages]);

  // Use useMemo to create a reset key based on filter changes so NewCommonTable resets to page 1
  const resetPageKey = useMemo(
    () => JSON.stringify({ searchQuery, categoryFilter, sortOrder }),
    [searchQuery, categoryFilter, sortOrder]
  );

  const filteredPackages = useMemo(() => {
    let result = [...packages];

    if (searchQuery) {
      result = result.filter((pkg) =>
        pkg.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(pkg.tests) &&
          pkg.tests.some((test) => test.name.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    if (categoryFilter) {
      result = result.filter((pkg) =>
        Array.isArray(pkg.tests) && pkg.tests.some((test) => test.category === categoryFilter)
      );
    }

    result.sort((a, b) => (sortOrder === 'new' ? b.id - a.id : a.id - b.id));

    return result;
  }, [packages, searchQuery, categoryFilter, sortOrder]);

  // Package deletion is disabled — once created, a package cannot be deleted.
  // Backend deletes on packages linked to orders/reports silently no-op
  // (returns success without removing the row), so the feature is turned
  // off here rather than showing users a false success/failure state.
  // Users are warned about this at creation time instead (see Pakage.tsx).

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
  };

  const handleViewPackage = (pkg: Package) => {
    setViewingPackage(pkg);
  };

  const handleUpdatePackage = async (updatedPackageData: updatePackage) => {
    if (!editingPackage || !updatedPackageData || !currentLab) return;

    const { packageName, price, discount, tests } = updatedPackageData;

    const testIds = tests.map((test: { id: number }) => test.id);

    const updatedData = {
      id: updatedPackageData.id,
      packageName,
      price,
      discount,
      testIds,
    };

    try {
      await updatePackage(currentLab.id, updatedPackageData.id, updatedData);
      toast.success('Package updated successfully', {
        autoClose: 2000,
        className: 'bg-success text-white'
      });

      await fetchPackages();
    } catch (error) {
      toast.error('Failed to update package', {
        className: 'bg-error text-white'
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
  };

  const columns = [
    {
      header: 'Package Name',
      accessor: 'packageName',
      render: (row: Package) => (
        <p className="font-semibold text-p3 text-pneutral-900">{row.packageName}</p>
      ),
    },
    {
      header: 'No. of Tests',
      accessor: 'tests',
      render: (row: Package) => (
        <span className="inline-flex items-center rounded-full bg-info-50 px-3 py-1 text-p2 font-medium text-info-700">
          {row.tests?.length || 0} Test{row.tests?.length === 1 ? '' : 's'}
        </span>
      ),
    },
    {
      header: 'Discount %',
      accessor: 'discount',
      render: (row: Package) => (
        <p className="text-p3 text-pneutral-700">{row.discount}%</p>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (row: Package) => (
        <p className="text-p3 font-medium text-success-900">₹{Number(row.price).toFixed(0)}</p>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row: Package) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditPackage(row)}
            className="flex h-[28px] w-[28px] items-center border border-info-700 justify-center rounded-full text-info-700 hover:bg-info-50 transition-colors"
            title="Edit Package"
          >
            <Edit size={12} />
          </button>
          <button
            onClick={() => handleViewPackage(row)}
            className="flex h-[28px] w-[28px] items-center border border-secondary-500 justify-center rounded-full text-secondary-600 hover:bg-secondary-50 transition-colors"
            title="View Package"
          >
            <Eye size={12} />
          </button>
          {/* Delete disabled — packages cannot be deleted once created */}
        </div>
      ),
    },
  ];

  if (loading && packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader type="progress" fullScreen={false} text="Loading packages..." />
        <p className="mt-4 text-sm text-gray-500">Please wait while we load the available packages.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100">
        <div className="text-red-600 font-semibold text-lg mb-2">{error}</div>
        <button
          onClick={fetchPackages}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-h3 font-semibold text-pneutral-900">
              Package Management
            </h1>
            <p className="mt-1 text-p3 text-pneutral-500">
              View and manage all your test packages
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/package?tab=package')}
              className="flex items-center gap-2 rounded-full bg-secondary-700 px-4 py-2 text-label-l3 font-medium text-pneutral-50"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Package</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-pneutral-100 bg-white p-5 text-left">
            <h3 className="text-sm font-medium text-pneutral-900">Total Packages</h3>
            <p className="mt-4 text-3xl font-semibold text-pneutral-900">{packages.length}</p>
          </div>

          <div className="rounded-xl border border-pneutral-100 bg-white p-5 text-left">
            <h3 className="text-sm font-medium text-pneutral-900">Categories</h3>
            <p className="mt-4 text-3xl font-semibold text-info-500">{categories.length}</p>
          </div>

          <div className="rounded-xl border border-pneutral-100 bg-white p-5 text-left">
            <h3 className="text-sm font-medium text-pneutral-900">Avg. Package Price</h3>
            <p className="mt-4 text-3xl font-semibold text-danger-600">₹{averagePrice.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 rounded-xl bg-white border border-pneutral-200 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sneutral-700"
            />
            <input
              type="text"
              placeholder="Search packages or tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-pneutral-200 pl-10 pr-4 text-sm outline-none focus:border-pneutral-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-p3 text-pneutral-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 rounded-md border border-pneutral-200 px-3 text-p3 focus:border-pneutral-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-pneutral-500">Sort by:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'new' | 'old')}
                className="h-10 rounded-md border border-pneutral-200 px-3 text-sm focus:border-pneutral-500"
              >
                <option value="new">Newest First</option>
                <option value="old">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section - NewCommonTable handles pagination internally */}
      <div className="relative">
        {filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-pneutral-200 bg-white py-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-pneutral-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
            <p className="mt-4 text-sm font-medium text-pneutral-500">
              {searchQuery || categoryFilter
                ? 'No results found'
                : 'No packages available'}
            </p>
            {(searchQuery || categoryFilter) && (
              <>
                <p className="mt-1 text-xs text-pneutral-400">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 flex items-center gap-2 rounded-full bg-secondary-700 px-4 py-2 text-label-l3 font-medium text-pneutral-50"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <NewCommonTable
            columns={columns}
            data={filteredPackages}
            pageSize={10}
            showPagination={true}
            resetPageKey={resetPageKey}
          />
        )}
      </div>

      {/* Edit Package Modal */}
      {editingPackage && (
        <NewModal
          isOpen={!!editingPackage}
          onClose={() => setEditingPackage(null)}
          title="Update Package"
          modalClassName="max-w-3xl"
        >
          <UpdatePackage
            packageData={editingPackage}
            onClose={() => setEditingPackage(null)}
            handleUpdatePackage={handleUpdatePackage}
          />
        </NewModal>
      )}

      {/* View Package Modal */}
      {viewingPackage && (
        <NewModal
          isOpen={!!viewingPackage}
          onClose={() => setViewingPackage(null)}
          title="View Package"
          modalClassName="max-w-2xl"
        >
          <ViewPackage packageData={viewingPackage} />
        </NewModal>
      )}
    </div>
  );
};

export default PackageList;
