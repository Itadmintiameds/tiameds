'use client';
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLabs } from '@/context/LabContext';
import { FaTrash, FaUser, FaInfoCircle, FaCalendarAlt, FaClock, FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa';

import Loader from '../common/Loader';
import { format } from 'date-fns';
import { getTestById } from '@/../services/testService';
import { getHealthPackageById } from '@/../services/packageServices';
import { updateVisitCancellation } from '@/../services/patientServices';
import { toast } from 'react-toastify';



const PREDEFINED_REASONS = [
  "Patient requested cancellation",
  "Doctor unavailable",
  "Lab technical issues",
  "Duplicate appointment",
  "Insurance issues",
  "Patient no longer needs test",
  "Other (please specify)",
];

interface TestList {
  id: number;
  name: string;
  category: string;
  price: number;
}

interface Packages {
  id: number;
  packageName: string;
  price: number;
  discount: number;
  tests: TestList[];
}

interface CancelPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCancelled?: () => void; // Add callback for refreshing data
}



const CancelPatientModal: React.FC<CancelPatientModalProps> = ({ isOpen, onClose, onPatientCancelled }) => {
  const { currentLab, patientDetails, setRefreshLab } = useLabs();
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [selectedPredefinedReason, setSelectedPredefinedReason] = useState('');
  const [isManualReason, setIsManualReason] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tests, setTests] = useState<TestList[]>([]);
  const [healthPackage, setHealthPackage] = useState<Packages[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCancellationReason('');
      setSelectedPredefinedReason('');
      setIsManualReason(false);
      setSearchTerm('');
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowReasonDropdown(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientDetails || !currentLab) return;

      setIsLoadingData(true);
      try {
        // Fetch tests
        if (patientDetails?.visit?.testIds?.length) {
          const testPromises = patientDetails.visit.testIds.map(id =>
            id !== undefined ? getTestById(currentLab.id.toString(), id) : Promise.resolve(null)
          );
          const testResults = await Promise.all(testPromises);
          setTests(testResults.filter(test => test !== null) as TestList[]);
        }

        // Fetch packages
        if (patientDetails?.visit?.packageIds?.length) {
          const packagePromises = patientDetails.visit.packageIds.map(id =>
            id !== undefined ? getHealthPackageById(currentLab.id, id) : Promise.resolve(null)
          );
          const packageResults = await Promise.all(packagePromises);
          const validPackages = packageResults
            .filter(pkg => pkg !== null)
            .map(pkg => pkg.data);
          setHealthPackage(validPackages as Packages[]);
        }
      } catch (error) {
        // Handle test/package data fetch error
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [patientDetails, currentLab, isOpen]);

  const filteredReasons = PREDEFINED_REASONS.filter(reason =>
    reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReasonSelect = (reason: string) => {
    if (reason === "Other (please specify)") {
      setIsManualReason(true);
      setSelectedPredefinedReason(reason);
      setCancellationReason('');
    } else {
      setIsManualReason(false);
      setCancellationReason(reason);
      setSelectedPredefinedReason(reason);
    }
    setSearchTerm('');
    setShowReasonDropdown(false);
  };

  const handleCancel = async () => {
    if (patientDetails?.visit?.visitId) {
      if (!cancellationReason) {
        setError("Please provide a cancellation reason");
        return;
      }
      if (isManualReason && cancellationReason.length < 3) {
        setError("Please provide at least 3 characters for the cancellation reason");
        return;
      }
    }

    setIsCancelling(true);
    setError(null);

    try {
      // Prepare cancellation data
      const cancellationData = {
        visitCancellationReason: cancellationReason,
        visitCancellationDate: format(new Date(), 'yyyy-MM-dd'),
        visitCancellationTime: format(new Date(), 'HH:mm:ss')
      };

   

      // In a real app, you would call your API here:
      if (!currentLab) {
        setError("Lab information is missing. Cannot proceed with cancellation.");
        setIsCancelling(false);
        return;
      }
      if (!patientDetails || !patientDetails.visit || patientDetails.visit.visitId === undefined) {
        setError("Patient visit information is missing. Cannot proceed with cancellation.");
        setIsCancelling(false);
        return;
      }
      await updateVisitCancellation(
        currentLab.id,
        patientDetails.visit.visitId!,
        cancellationData
      );

      

      // Trigger refresh of patient data
      setRefreshLab(prev => !prev);
      
      // Call the callback to refresh parent component data
      if (onPatientCancelled) {
        onPatientCancelled();
      }

      // Show success message
      toast.success('Patient visit cancelled successfully!', {
        autoClose: 3000,
        className: 'bg-green-50 text-green-800'
      });

      onClose();
    } catch (err) {
      // Handle cancellation error
      setError(err instanceof Error ? err.message : "Failed to cancel patient visit");
    } finally {
      setIsCancelling(false);
    }
  };

  const renderTestsAndPackages = () => {
    if (isLoadingData) {
      return <Loader type="progress" fullScreen={false} text="Loading test details..." />;
    }

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Tests & Packages</h3>

        {/* Tests Section */}
        {tests.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-2">Individual Tests</h4>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <ul className="divide-y divide-gray-200">
                {tests.map((test, index) => (
                  <li key={`test-${index}`} className="py-3">
                    <div className="flex justify-between">
                      <span className="font-medium">{test.name}</span>
                      <span className="text-gray-600">{test.category || 'General Test'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Packages Section */}
        {healthPackage.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Health Packages</h4>
            <div className="space-y-4">
              {healthPackage.map((pkg, pkgIndex) => (
                <div key={`pkg-${pkgIndex}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{pkg.packageName}</span>
                    <span className="text-blue-600">Package</span>
                  </div>

                  {pkg.tests?.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-blue-200">
                      <p className="text-sm text-gray-500 mb-2">Includes:</p>
                      <ul className="space-y-2">
                        {pkg.tests.map((test, testIndex) => (
                          <li key={`pkg-${pkgIndex}-test-${testIndex}`} className="text-sm">
                            <span className="text-gray-700">{test.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tests.length === 0 && healthPackage.length === 0 && (
          <p className="text-gray-500 italic">No tests or packages selected</p>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 p-4"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-2xl"
            style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '90vh' }}
          >
        {/* Modal Header */}
        <div
          className="px-6 py-4"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0, borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaUser className="text-orange-600 mr-3 text-xl" />
            <h2 className="text-lg font-semibold text-orange-900">Cancel Patient Visit</h2>
          </div>
          <button
            onClick={onClose}
            className="text-orange-700/70 hover:text-orange-900 transition-colors p-1 rounded-lg hover:bg-orange-100 focus:outline-none"
            aria-label="Close modal"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body — only this scrolls */}
        <div className="p-6" style={{ flex: '1 1 0%', overflowY: 'auto', minHeight: 0 }}>
          {/* Warning Section */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r">
            <div className="flex items-start">
              <FaInfoCircle className="text-orange-500 mr-3 mt-1 flex-shrink-0 text-lg" />
              <div>
                <h3 className="text-lg font-semibold text-orange-800 mb-2">Warning: Visit Cancellation</h3>
                <p className="text-sm text-orange-700 mb-2">
                  This action will cancel the patient visit and mark it as cancelled in the system.
                </p>
                <ul className="text-sm text-orange-700 list-disc list-inside space-y-1">
                  <li>Visit status will be changed to &quot;Cancelled&quot;</li>
                  <li>Patient data will be preserved for record keeping</li>
                  <li>Cancellation reason and timestamp will be recorded</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Patient Summary */}
          {patientDetails && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Patient Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Patient Name</p>
                  <p className="font-medium">{patientDetails.firstName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Patient ID</p>
                  <p className="font-medium">{patientDetails.id || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date of Birth</p>
                  <p className="font-medium">
                    {patientDetails.dateOfBirth ? format(new Date(patientDetails.dateOfBirth), 'MMM dd, yyyy') : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Gender</p>
                  <p className="font-medium">{patientDetails.gender || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Visit Cancellation Section */}
          {patientDetails?.visit?.visitId && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Visit Cancellation Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cancellation Reason *
                  </label>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                      className="w-full flex justify-between items-center p-3 border border-gray-300 rounded-lg text-left bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span className="truncate">
                        {selectedPredefinedReason || "Select a reason..."}
                      </span>
                      <FaChevronDown
                        className={`ml-2 transition-transform duration-200 ${showReasonDropdown ? 'transform rotate-180' : ''}`}
                      />
                    </button>

                    {showReasonDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-hidden">
                        <div className="sticky top-0 bg-white p-2 border-b">
                          <div className="relative">
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search reasons..."
                              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              autoFocus
                            />
                          </div>
                        </div>

                        <div className="overflow-y-auto max-h-60">
                          {filteredReasons.map((reason) => (
                            <button
                              key={reason}
                              type="button"
                              className={`w-full text-left p-3 hover:bg-gray-100 cursor-pointer text-sm ${selectedPredefinedReason === reason ? 'bg-blue-50 text-blue-800 font-medium' : ''}`}
                              onClick={() => handleReasonSelect(reason)}
                            >
                              {reason}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {isManualReason && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Please specify the reason *
                      </label>
                      <textarea
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Provide detailed cancellation reason (minimum 3 characters)..."
                        required
                        minLength={3}
                      />
                      <p className={`mt-1 text-sm ${cancellationReason.length >= 3 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {cancellationReason.length < 3
                          ? `${3 - cancellationReason.length} more characters required`
                          : "✓ Reason meets minimum length"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaCalendarAlt className="text-gray-500 mr-3 text-lg" />
                    <div>
                      <p className="text-xs text-gray-500">Cancellation Date</p>
                      <p className="font-medium">
                        {format(new Date(), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FaClock className="text-gray-500 mr-3 text-lg" />
                    <div>
                      <p className="text-xs text-gray-500">Cancellation Time</p>
                      <p className="font-medium">
                        {format(new Date(), 'hh:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tests & Packages Section */}
          {renderTestsAndPackages()}

          {/* Confirmation Check */}
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
            <div className="flex items-start">
              <FaInfoCircle className="text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Please confirm you want to cancel this patient visit.
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  This action will mark the visit as cancelled. Patient data will be preserved.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 rounded-r text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="px-6 py-4 bg-gray-50"
          style={{ flexShrink: 0, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isCancelling ? (
              <>
                <Loader type="spinner" />
                Cancelling...
              </>
            ) : (
              <>
                <FaTrash className="mr-2" />
                Confirm Cancellation
              </>
            )}
          </button>
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CancelPatientModal;
