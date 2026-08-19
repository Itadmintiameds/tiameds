'use client';

import { enablePackage, getDisabledPackages } from '@/../services/packageServices';
import { useLabs } from '@/context/LabContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Power, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import Loader from '../common/Loader';
import ViewPackage from './ViewPackage';
import { TestList } from '@/types/test/testlist';
import NewCommonTable from '@/app/(admin)/dashboard/newcommoncomponent/NewCommonTable';
import NewModal from '@/app/(admin)/dashboard/newcommoncomponent/NewModal';

interface Package {
  id: number;
  packageName: string;
  price: number;
  discount: number;
  tests: TestList[];
}

const DeactivePackageList = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewingPackage, setViewingPackage] = useState<Package | null>(null);
  const [packageToActivate, setPackageToActivate] = useState<Package | null>(null);
  const [isActivating, setIsActivating] = useState<boolean>(false);

  const { currentLab } = useLabs();

  const fetchDisabledPackages = useCallback(async () => {
    if (!currentLab) {
      setError('No lab selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getDisabledPackages(currentLab.id);
      if (response && response.status === 'success' && response.data) {
        setPackages(response.data);
      } else {
        setError('No deactivated packages found or failed to fetch data.');
      }
    } catch (err) {
      setError('Failed to fetch deactivated packages');
    } finally {
      setLoading(false);
    }
  }, [currentLab]);

  useEffect(() => {
    fetchDisabledPackages();
  }, [fetchDisabledPackages]);

  const resetPageKey = useMemo(() => JSON.stringify({ searchQuery }), [searchQuery]);

  const filteredPackages = useMemo(() => {
    if (!searchQuery) return packages;
    return packages.filter((pkg) =>
      pkg.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(pkg.tests) &&
        pkg.tests.some((test) => test.name.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [packages, searchQuery]);

  const handleViewPackage = (pkg: Package) => {
    setViewingPackage(pkg);
  };

  const handleActivateClick = (pkg: Package) => {
    setPackageToActivate(pkg);
  };

  const handleCancelActivate = () => {
    if (isActivating) return;
    setPackageToActivate(null);
  };

  const handleConfirmActivate = async () => {
    if (!currentLab || !packageToActivate) return;

    setIsActivating(true);
    try {
      await enablePackage(currentLab.id, packageToActivate.id);
      setPackages(prev => prev.filter(pkg => pkg.id !== packageToActivate.id));
      toast.success('Package activated successfully', {
        autoClose: 2000,
        className: 'bg-success text-white'
      });
      setPackageToActivate(null);
    } catch (error) {
      toast.error('Failed to activate package', {
        className: 'bg-error text-white'
      });
    } finally {
      setIsActivating(false);
    }
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
      header: 'Status',
      accessor: 'status',
      render: (row: Package) => (
        <button
          type="button"
          onClick={() => handleActivateClick(row)}
          className="inline-flex items-center gap-1.5 rounded-full border border-warning-200 bg-warning-50 px-3 py-1 text-p2 font-medium text-warning-700 transition-colors hover:bg-warning-600 hover:text-white"
          title="Click to activate"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-warning-600" />
          Inactive
        </button>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row: Package) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewPackage(row)}
            className="flex h-[28px] w-[28px] items-center border border-secondary-500 justify-center rounded-full text-secondary-600 hover:bg-secondary-50 transition-colors"
            title="View Package"
          >
            <Eye size={12} />
          </button>
        </div>
      ),
    },
  ];

  if (loading && packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader type="progress" fullScreen={false} text="Loading deactivated packages..." />
        <p className="mt-4 text-sm text-gray-500">Please wait while we load the deactivated packages.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100">
        <div className="text-red-600 font-semibold text-lg mb-2">{error}</div>
        <button
          onClick={fetchDisabledPackages}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Filters Section */}
      <div className="mb-6 rounded-xl bg-white border border-pneutral-200 p-4">
        <div className="relative flex-1 max-w-xl">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sneutral-700"
          />
          <input
            type="text"
            placeholder="Search deactivated packages or tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-pneutral-200 pl-10 pr-4 text-sm outline-none focus:border-pneutral-500"
          />
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
              {searchQuery ? 'No results found' : 'No deactivated packages'}
            </p>
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

      {/* Activate Confirmation Modal */}
      <NewModal
        isOpen={!!packageToActivate}
        onClose={handleCancelActivate}
        title="Activate Package"
        modalClassName="max-w-md"
      >
        <div className="text-center py-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 mb-4">
            <Power className="h-6 w-6 text-success-700" />
          </div>
          <h3 className="text-lg font-semibold text-pneutral-900 mb-2">
            Are you sure you want to activate &quot;{packageToActivate?.packageName}&quot;?
          </h3>
         
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleCancelActivate}
              disabled={isActivating}
              className="px-4 py-2 text-sm font-medium text-pneutral-700 bg-pneutral-100 rounded-lg hover:bg-pneutral-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmActivate}
              disabled={isActivating}
              className="px-4 py-2 text-sm font-medium text-white bg-success-600 rounded-lg hover:bg-success-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isActivating ? 'Activating...' : 'Activate'}
            </button>
          </div>
        </div>
      </NewModal>
    </div>
  );
};

export default DeactivePackageList;
