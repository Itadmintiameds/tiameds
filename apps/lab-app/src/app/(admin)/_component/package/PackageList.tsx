
'use client';

import { getPackage, packageDelete, updatePackage } from '@/../services/packageServices';
import Modal from '@/app/(admin)/_component/Modal ';
import { useLabs } from '@/context/LabContext';
import { useEffect, useState } from 'react';
import { FaBoxOpen, FaChevronDown, FaChevronUp, FaEdit, FaSearch, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../Loader';
import UpdatePackage from './UpdatePackage';
import { TestList } from '@/types/test/testlist';  

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
  const itemsPerPage = 5;

  const { currentLab } = useLabs();

  const fetchPackages = async () => {
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
  };

  useEffect(() => {
    fetchPackages();
  }, [currentLab]);

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

  const handleDeletePackage = (pkgId: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this package?');
    if (confirmDelete) {
      setPackages(packages.filter(pkg => pkg.id !== pkgId));
      setFilteredPackages(filteredPackages.filter(pkg => pkg.id !== pkgId));
      if (currentLab) {
        packageDelete(currentLab.id, pkgId);
      } else {
        setError('No lab selected');
      }
      toast.success('Package deleted successfully', { autoClose: 2000 });
    }
  };

  const handleEditPackage = (pkgId: number) => {
    const pkgToEdit = packages.find(pkg => pkg.id === pkgId);
    if (pkgToEdit) {
      setEditingPackage(pkgToEdit);
    }
  };

  const handleUpdatePackage = async (updatedPackageData:updatePackage ) => {
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
      toast.success('Package updated successfully', { autoClose: 2000 });

      await fetchPackages();
    } catch (error) {
      toast.error('Failed to update package');
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center mb-4">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search for packages or tests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-md text-sm focus:outline-none"
        />
      </div>

      {paginatedPackages.length > 0 ? (
        paginatedPackages.map((pkg) => (
          <div key={pkg.id} className="flex flex-col bg-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-3 flex items-center justify-between border-b">
              <div className="flex items-center space-x-2">
                <FaBoxOpen className="text-blue-600 text-xl" />
                <h2 className="text-sm font-semibold text-gray-800">{pkg.packageName}</h2>
              </div>
              <p className="text-xs text-gray-600">₹{pkg.price} | {pkg.discount}% Off</p>

              <div className="flex space-x-2">
                <button onClick={() => handleEditPackage(pkg.id)} className="text-blue-600 hover:text-blue-800">
                  <FaEdit className="text-sm" />
                </button>
                <button onClick={() => handleDeletePackage(pkg.id)} className="text-red-600 hover:text-red-800">
                  <FaTrash className="text-sm" />
                </button>
              </div>
            </div>

            {expandedPackage === pkg.id && (
              <div className="p-3 space-y-3 border-t">
                <h3 className="text-sm font-semibold text-gray-700">Tests Included:</h3>
                {pkg.tests.map((test: TestList) => (
                  <div key={test.id} className="flex justify-between items-center p-2 border-b rounded-md hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <FaChevronDown className="text-green-500" />
                      <span className="text-sm text-gray-700 font-medium">{test.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">₹{test.price}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => togglePackageDetails(pkg.id)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 focus:outline-none self-center"
            >
              {expandedPackage === pkg.id ? (
                <div className="flex items-center space-x-1">
                  <FaChevronUp className="text-sm" />
                  <span>Collapse</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <FaChevronDown className="text-sm" />
                  <span>View Details</span>
                </div>
              )}
            </button>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500">No packages available.</div>
      )}

      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 bg-gray-200 rounded-md text-sm text-gray-600 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 bg-gray-200 rounded-md text-sm text-gray-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {editingPackage && (
        <Modal
          isOpen={!!editingPackage}
          onClose={() => setEditingPackage(null)}
          title="Update Package"
          modalClassName="max-w-7xl"
        >
          <UpdatePackage
            packageData={editingPackage}
            onClose={() => setEditingPackage(null)}
            handleUpdatePackage={handleUpdatePackage}
          />
        </Modal>
      )}
    </div>
  );
};

export default PackageList;



































