

'use client';

import { getPackage, updatePackage } from '@/../services/packageServices';
// import { packageDelete } from '@/../services/packageServices'; // Deletion disabled — see note near confirmDeletePackage below
import Modal from '@/app/(admin)/component/common/Model';
import { useLabs } from '@/context/LabContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { FaEdit, FaEye, FaSearch, FaTimes, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../common/Loader';
import UpdatePackage from './UpdatePackage';
import ViewPackage from './ViewPackage';
// import DeletePackage from './DeletePackage'; // Deletion disabled — see note near confirmDeletePackage below
import { TestList } from '@/types/test/testlist';
import Pagination from '../common/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage } from 'react-icons/fi';

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

interface PackageListProps {
  closeModal?: () => void;
}

const PackageList = ({ closeModal }: PackageListProps = {}) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [sortOrder, setSortOrder] = useState<'new' | 'old'>('new');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editingPackage, setEditingPackage] = useState<editingPackage | null>(null);
  const [viewingPackage, setViewingPackage] = useState<Package | null>(null);
  // Package deletion is disabled — once created, a package cannot be deleted
  // (backend silently fails to remove packages linked to orders/reports).
  // const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  // const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const itemsPerPage = 5;

  const { currentLab } = useLabs();

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
    return ['All Categories', ...Array.from(unique)];
  }, [packages]);

  const filteredPackages = useMemo(() => {
    let result = [...packages];

    if (searchQuery) {
      result = result.filter((pkg) =>
        pkg.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(pkg.tests) &&
          pkg.tests.some((test) => test.name.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    if (selectedCategory !== 'All Categories') {
      result = result.filter((pkg) =>
        Array.isArray(pkg.tests) && pkg.tests.some((test) => test.category === selectedCategory)
      );
    }

    result.sort((a, b) => (sortOrder === 'new' ? b.id - a.id : a.id - b.id));

    return result;
  }, [packages, searchQuery, selectedCategory, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortOrder]);

  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const paginatedPackages = filteredPackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Package deletion is disabled — once created, a package cannot be deleted.
  // Backend deletes on packages linked to orders/reports silently no-op
  // (returns success without removing the row), so the feature is turned
  // off here rather than showing users a false success/failure state.
  // Users are warned about this at creation time instead (see Pakage.tsx).
  //
  // const handleDeletePackage = (pkgId: number) => {
  //   const pkgToDelete = packages.find(pkg => pkg.id === pkgId);
  //   if (pkgToDelete) {
  //     setDeletingPackage(pkgToDelete);
  //   }
  // };
  //
  // const confirmDeletePackage = async () => {
  //   if (!deletingPackage) return;
  //   const pkgId = deletingPackage.id;
  //
  //   setIsDeleting(pkgId);
  //   try {
  //     if (currentLab) {
  //       const response = await packageDelete(currentLab.id, pkgId);
  //       if (response && response.status && response.status !== 'success') {
  //         throw new Error(response.message || 'Failed to delete package');
  //       }
  //       setPackages(prev => prev.filter(pkg => pkg.id !== pkgId));
  //       toast.success('Package deleted successfully', {
  //         autoClose: 2000,
  //         className: 'bg-success text-white'
  //       });
  //     } else {
  //       setError('No lab selected');
  //     }
  //   } catch (error) {
  //     const message = (error as { message?: string })?.message || 'Failed to delete package';
  //     toast.error(message, {
  //       className: 'bg-error text-white'
  //     });
  //   } finally {
  //     setIsDeleting(null);
  //     setDeletingPackage(null);
  //   }
  // };

  const handleEditPackage = (pkgId: number) => {
    const pkgToEdit = packages.find(pkg => pkg.id === pkgId);
    if (pkgToEdit) {
      setEditingPackage(pkgToEdit);
    }
  };

  const handleViewPackage = (pkgId: number) => {
    const pkgToView = packages.find(pkg => pkg.id === pkgId);
    if (pkgToView) {
      setViewingPackage(pkgToView);
    }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Loader type="progress" fullScreen={false} text="Loading packages..." />
        <p className="mt-4 text-sm text-gray-600">Please wait while we load the available packages.</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-6 bg-red-50 rounded-xl border border-red-100"
      >
        <div className="text-red-600 font-semibold text-lg mb-2">
          {error}
        </div>
        <button
          onClick={fetchPackages}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  return (
    <div className="p-6 space-y-4 bg-gray-50 rounded-xl shadow-lg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-2"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Package Management</h1>
          <p className="text-sm text-gray-500">View and manage all your test packages</p>
        </div>
        <div className="flex items-center gap-2">
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
      </motion.div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Package List</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-gray-50"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-full text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none uppercase"
            >
              {categories.map((category) => (
                <option key={category} value={category} className="normal-case">
                  {category}
                </option>
              ))}
            </select>

            <button
              onClick={() => setSortOrder(prev => (prev === 'new' ? 'old' : 'new'))}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-full text-sm bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {sortOrder === 'new' ? <FaSortAmountDown className="text-gray-500" /> : <FaSortAmountUp className="text-gray-500" />}
              {sortOrder === 'new' ? 'New to Old' : 'Old to New'}
            </button>
          </div>
        </div>

        {/* Table */}
        {paginatedPackages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Package Name</th>
                  <th className="px-6 py-3 font-medium">No. of Test</th>
                  <th className="px-6 py-3 font-medium">Discount %</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginatedPackages.map((pkg) => (
                    <motion.tr
                      key={pkg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-50 overflow-hidden shrink-0">
                            <Image src="/package.png" alt="" width={20} height={20} />
                          </div>
                          <span className="text-sm font-medium text-gray-800">{pkg.packageName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                          {pkg.tests.length} Test
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{pkg.discount}%</td>
                      <td className="px-6 py-4 text-sm text-gray-700">₹{Number(pkg.price).toFixed(0)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditPackage(pkg.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-blue-300 text-blue-500 hover:bg-blue-50 transition-colors"
                            title="Edit package"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleViewPackage(pkg.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
                            title="View package"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          {/* Delete disabled — packages cannot be deleted once created */}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8"
          >
            <FiPackage className="mx-auto text-4xl text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800">No packages found</h3>
            <p className="text-sm text-gray-600 mt-1">
              {searchQuery ? 'Try a different search term' : 'Create your first package to get started'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
                }}
              >
                Clear search
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {filteredPackages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </motion.div>
      )}

      {/* Edit Package Modal */}
      <AnimatePresence>
        {editingPackage && (
          <Modal
            isOpen={!!editingPackage}
            onClose={() => setEditingPackage(null)}
            title="Update Package"
            modalClassName="max-w-2xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
          >
            <UpdatePackage
              packageData={editingPackage}
              onClose={() => setEditingPackage(null)}
              handleUpdatePackage={handleUpdatePackage}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* View Package Modal */}
      <AnimatePresence>
        {viewingPackage && (
          <Modal
            isOpen={!!viewingPackage}
            onClose={() => setViewingPackage(null)}
            title="View Package"
            modalClassName="max-w-2xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
          >
            <ViewPackage
              packageData={viewingPackage}
              onClose={() => setViewingPackage(null)}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Package Confirmation Modal — disabled, packages cannot be deleted once created */}
      {/* <AnimatePresence>
        {deletingPackage && (
          <Modal
            isOpen={!!deletingPackage}
            onClose={() => setDeletingPackage(null)}
            title="Delete Package"
            modalClassName="max-w-2xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
          >
            <DeletePackage
              packageName={deletingPackage.packageName}
              isDeleting={isDeleting === deletingPackage.id}
              onClose={() => setDeletingPackage(null)}
              onConfirm={confirmDeletePackage}
            />
          </Modal>
        )}
      </AnimatePresence> */}
    </div>
  );
};

export default PackageList;
