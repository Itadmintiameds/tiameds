

'use client';

import { getPackage, packageDelete, updatePackage } from '@/../services/packageServices';
import Modal from '@/app/(admin)/component/common/Model';
import { useLabs } from '@/context/LabContext';
import { useCallback, useEffect, useState } from 'react';
import { FaBoxOpen, FaChevronDown, FaChevronUp, FaEdit, FaSearch, FaTrash } from 'react-icons/fa';
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

const PackageList = () => {
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
      <div className="flex justify-center items-center h-64">
        <Loader type="progress" fullScreen={false} text=" Loading packages..." />
        <p className="mt-4 text-sm text-gray-500">Please wait while we load the available packages.</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-6 bg-red-50 rounded-lg border border-red-100"
      >
        <div className="text-red-500 font-semibold text-lg mb-2">
          {error}
        </div>
        <Button
          text="Retry"
          onClick={fetchPackages}
          className="bg-red-500 hover:bg-red-600 text-white"
        />
      </motion.div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 rounded-lg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="p-3 bg-indigo-100 rounded-full">
          <FiPackage className="text-indigo-600 text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Package Management</h1>
          <p className="text-sm text-gray-500">View and manage all your test packages</p>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search packages or tests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
        />
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
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
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
                    <Button
                      text=""
                      onClick={() => handleEditPackage(pkg.id)}
                      className="p-2 bg-blue-50 hover:bg-blue-100 rounded-full text-blue-600 transition-colors"

                    >
                      <FaEdit className="text-sm" />
                    </Button>
                    <Button
                      text=""
                      onClick={() => handleDeletePackage(pkg.id)}
                      disabled={isDeleting === pkg.id}
                      className="p-2 bg-red-50 hover:bg-red-100 rounded-full text-red-600 transition-colors"
                    // tooltip="Delete package"
                    >
                      {isDeleting === pkg.id ? (
                        <Loader type="progress" fullScreen={false} text="Deleting..." />
                      ) : (
                        <FaTrash className="text-sm" />
                      )}
                    </Button>
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
                      <div className="p-4 border-t">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="bg-indigo-100 text-indigo-600 p-1 rounded-full">
                            <FaBoxOpen className="text-xs" />
                          </span>
                          Included Tests
                        </h3>
                        <div className="space-y-2">
                          {pkg.tests.map((test: TestList) => (
                            <motion.div
                              key={test.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="p-1.5 bg-green-100 rounded-full">
                                  <FaChevronDown className="text-green-500 text-xs" />
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
                <div className="p-2 border-t flex justify-center">
                  <Button
                    text=""
                    onClick={() => togglePackageDetails(pkg.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 focus:outline-none flex items-center gap-1"
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
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8 bg-white rounded-xl border-2 border-dashed border-gray-200"
          >
            <FiPackage className="mx-auto text-4xl text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-500">No packages found</h3>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery ? 'Try a different search term' : 'Create your first package to get started'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {filteredPackages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
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






























