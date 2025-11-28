

'use client';

import { getPackage, packageDelete, updatePackage } from '@/../services/packageServices';
import Modal from '@/app/(admin)/component/common/Model';
import { useLabs } from '@/context/LabContext';
import { useCallback, useEffect, useState } from 'react';
import { FaBoxOpen, FaChevronDown, FaChevronUp, FaEdit, FaSearch, FaTrash, FaTimes, FaBox } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../common/Loader';
import UpdatePackage from './UpdatePackage';
import { TestList } from '@/types/test/testlist';
import Button from '@/app/(admin)/component/common/Button';
import Pagination from '../common/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCurrencyRupee, BsPercent } from 'react-icons/bs';
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
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPackage, setExpandedPackage] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editingPackage, setEditingPackage] = useState<editingPackage | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
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
        setFilteredPackages(response.data);
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

  useEffect(() => {
    if (searchQuery) {
      const filtered = packages.filter((pkg) =>
        pkg.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(pkg.tests) &&
          pkg.tests.some((test) => test.name.toLowerCase().includes(searchQuery.toLowerCase())))
      );
      setFilteredPackages(filtered);
    } else {
      setFilteredPackages(packages);
    }
    setCurrentPage(1);
  }, [searchQuery, packages]);

  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const paginatedPackages = filteredPackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const togglePackageDetails = (pkgId: number) => {
    setExpandedPackage(expandedPackage === pkgId ? null : pkgId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeletePackage = async (pkgId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this package?');
    if (confirmDelete) {
      setIsDeleting(pkgId);
      try {
        if (currentLab) {
          await packageDelete(currentLab.id, pkgId);
          setPackages(packages.filter(pkg => pkg.id !== pkgId));
          setFilteredPackages(filteredPackages.filter(pkg => pkg.id !== pkgId));
          toast.success('Package deleted successfully', {
            autoClose: 2000,
            className: 'bg-success text-white'
          });
        } else {
          setError('No lab selected');
        }
      } catch (error) {
        toast.error('Failed to delete package', {
          className: 'bg-error text-white'
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleEditPackage = (pkgId: number) => {
    const pkgToEdit = packages.find(pkg => pkg.id === pkgId);
    if (pkgToEdit) {
      setEditingPackage(pkgToEdit);
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
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-full">
            <FiPackage className="text-indigo-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Package Management</h1>
            <p className="text-sm text-gray-600">View and manage all your test packages</p>
          </div>
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
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-blue-50 p-3 rounded-lg border border-blue-100"
      >
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          <FaSearch className="mr-2 text-blue-600" /> Search Packages
        </h4>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search packages or tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all"
          />
        </div>
      </motion.div>

      {/* Package List */}
      <div className="space-y-4">
        {paginatedPackages.length > 0 ? (
          <AnimatePresence>
            {paginatedPackages.map((pkg) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow"
              >
                {/* Package Header */}
                <div className="p-4 flex items-center justify-between border-b">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaBoxOpen className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">{pkg.packageName}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                                                 <span className="flex items-center gap-1">
                           <BsCurrencyRupee className="text-xs" /> {Number(pkg.price).toFixed(2)}
                         </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <BsPercent className="text-xs" /> {pkg.discount}% off
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          {pkg.tests.length} tests
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditPackage(pkg.id)}
                      className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                      title="Edit package"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      disabled={isDeleting === pkg.id}
                      className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors disabled:opacity-50"
                      title="Delete package"
                    >
                      {isDeleting === pkg.id ? (
                        <Loader type="progress" fullScreen={false} text="Deleting..." />
                      ) : (
                        <FaTrash className="text-sm" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Package Details */}
                <AnimatePresence>
                  {expandedPackage === pkg.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 border-t bg-green-50">
                        <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <FaBox className="text-green-600" />
                          Included Tests
                        </h3>
                        <div className="space-y-2">
                          {pkg.tests.map((test: TestList) => (
                            <motion.div
                              key={test.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex justify-between items-center p-3 bg-white rounded-lg border border-green-200 hover:bg-green-50 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="p-1.5 bg-green-100 rounded-full">
                                  <FaChevronDown className="text-green-600 text-xs" />
                                </div>
                                <span className="text-sm font-medium text-gray-800">{test.name}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-700 flex items-center">
                                <BsCurrencyRupee className="text-xs mr-1" /> {Number(test.price).toFixed(2)}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Toggle Button */}
                <div className="p-2 border-t bg-gray-50 flex justify-center">
                  <button
                    onClick={() => togglePackageDetails(pkg.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    {expandedPackage === pkg.id ? (
                      <>
                        <FaChevronUp className="text-sm" />
                        <span>Hide Details</span>
                      </>
                    ) : (
                      <>
                        <FaChevronDown className="text-sm" />
                        <span>View Details</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-200"
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
            modalClassName="max-w-5xl max-h-[90vh] rounded-lg overflow-y-auto overflow-hidden"
          >
            <UpdatePackage
              packageData={editingPackage}
              onClose={() => setEditingPackage(null)}
              handleUpdatePackage={handleUpdatePackage}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PackageList;






























