'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useLabs } from '@/context/LabContext';
import { FaTrash, FaInfoCircle, FaCalendarAlt, FaClock, FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa';

import Loader from '../common/Loader';
import NewModal from '@/app/(admin)/dashboard/newcommoncomponent/NewModal';
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
        <h3 className="text-p3 font-semibold text-pneutral-900 mb-3">Tests & Packages</h3>

        {/* Tests Section */}
        {tests.length > 0 && (
          <div className="mb-6">
            <h4 className="text-p3 font-medium text-pneutral-700 mb-2">Individual Tests</h4>
            <div className="bg-pneutral-50 rounded-lg p-4 border border-pneutral-200">
              <ul className="divide-y divide-pneutral-200">
                {tests.map((test, index) => (
                  <li key={`test-${index}`} className="py-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-p3 text-pneutral-900">{test.name}</span>
                      <span className="text-p3 text-pneutral-600">{test.category || 'General Test'}</span>
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
            <h4 className="text-p3 font-medium text-pneutral-700 mb-2">Health Packages</h4>
            <div className="space-y-4">
              {healthPackage.map((pkg, pkgIndex) => (
                <div key={`pkg-${pkgIndex}`} className="bg-pneutral-50 rounded-lg p-4 border border-pneutral-200">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-p3 text-pneutral-900">{pkg.packageName}</span>
                    <span className="text-p3 text-info-600">Package</span>
                  </div>

                  {pkg.tests?.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-info-200">
                      <p className="text-p2 text-pneutral-500 mb-2">Includes:</p>
                      <ul className="space-y-2">
                        {pkg.tests.map((test, testIndex) => (
                          <li key={`pkg-${pkgIndex}-test-${testIndex}`} className="text-p3">
                            <span className="text-pneutral-700">{test.name}</span>
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
          <p className="text-p3 text-pneutral-500 italic">No tests or packages selected</p>
        )}
      </div>
    );
  };

  return (
    <NewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Patient Visit"
      modalClassName="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Warning Section */}
        <div className="bg-warning-50 border-l-4 border-warning-500 p-4 rounded-r">
          <div className="flex items-start">
            <FaInfoCircle className="text-warning-500 mr-3 mt-1 flex-shrink-0 text-lg" />
            <div>
              <h3 className="text-p3 font-semibold text-warning-800 mb-2">Warning: Visit Cancellation</h3>
              <p className="text-p3 text-warning-700 mb-2">
                This action will cancel the patient visit and mark it as cancelled in the system.
              </p>
              <ul className="text-p3 text-warning-700 list-disc list-inside space-y-1">
                <li>Visit status will be changed to &quot;Cancelled&quot;</li>
                <li>Patient data will be preserved for record keeping</li>
                <li>Cancellation reason and timestamp will be recorded</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Patient Summary */}
        {patientDetails && (
          <div className="bg-info-50 rounded-lg p-4 space-y-4">
            <h3 className="text-p3 font-semibold text-info-700">Patient Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-p3">
              <div>
                <p className="text-pneutral-500">Patient Name</p>
                <p className="font-medium text-pneutral-900">{patientDetails.firstName || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-pneutral-500">Patient ID</p>
                <p className="font-medium text-pneutral-900">{patientDetails.id || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-pneutral-500">Date of Birth</p>
                <p className="font-medium text-pneutral-900">
                  {patientDetails.dateOfBirth ? format(new Date(patientDetails.dateOfBirth), 'MMM dd, yyyy') : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-pneutral-500">Gender</p>
                <p className="font-medium text-pneutral-900">{patientDetails.gender || 'Not specified'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Visit Cancellation Section */}
        {patientDetails?.visit?.visitId && (
          <div className="bg-danger-100 rounded-lg p-4 space-y-4">
            <h3 className="text-p3 font-semibold text-warning-800">Visit Cancellation Details</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-p3 font-medium text-pneutral-900 mb-1.5">
                  Cancellation Reason <span className="text-warning-500">*</span>
                </label>

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                    className="w-full flex justify-between items-center rounded-lg border border-pneutral-200 px-4 py-2 text-p3 text-left bg-white hover:border-pneutral-400 focus:outline-none focus:ring-1 focus:ring-secondary-500"
                  >
                    <span className="truncate">
                      {selectedPredefinedReason || "Select a reason..."}
                    </span>
                    <FaChevronDown
                      className={`ml-2 transition-transform duration-200 ${showReasonDropdown ? 'transform rotate-180' : ''}`}
                    />
                  </button>

                  {showReasonDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-pneutral-200 rounded-lg shadow-lg max-h-72 overflow-hidden">
                      <div className="sticky top-0 bg-white p-2 border-b border-pneutral-200">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-3 text-pneutral-400" />
                          <input
                            type="text"
                            placeholder="Search reasons..."
                            className="w-full pl-10 pr-3 py-2 text-p3 border border-pneutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary-500"
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
                            className={`w-full text-left p-3 hover:bg-pneutral-100 cursor-pointer text-p3 ${selectedPredefinedReason === reason ? 'bg-info-50 text-info-800 font-medium' : ''}`}
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
                    <label className="block text-p3 font-medium text-pneutral-900 mb-1.5">
                      Please specify the reason <span className="text-warning-500">*</span>
                    </label>
                    <textarea
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      className="w-full rounded-lg border border-pneutral-200 px-4 py-2 text-p3 focus:outline-none focus:ring-1 focus:ring-secondary-500"
                      rows={4}
                      placeholder="Provide detailed cancellation reason (minimum 3 characters)..."
                      required
                      minLength={3}
                    />
                    <p className={`mt-1 text-p2 ${cancellationReason.length >= 3 ? 'text-success-600' : 'text-warning-600'
                      }`}>
                      {cancellationReason.length < 3
                        ? `${3 - cancellationReason.length} more characters required`
                        : "✓ Reason meets minimum length"}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-white rounded-lg border border-pneutral-200">
                  <FaCalendarAlt className="text-pneutral-500 mr-3 text-lg" />
                  <div>
                    <p className="text-p2 text-pneutral-500">Cancellation Date</p>
                    <p className="font-medium text-p3 text-pneutral-900">
                      {format(new Date(), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg border border-pneutral-200">
                  <FaClock className="text-pneutral-500 mr-3 text-lg" />
                  <div>
                    <p className="text-p2 text-pneutral-500">Cancellation Time</p>
                    <p className="font-medium text-p3 text-pneutral-900">
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
        <div className="p-4 bg-warning-50 border-l-4 border-warning-400 rounded-r">
          <div className="flex items-start">
            <FaInfoCircle className="text-warning-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-p3 font-medium text-warning-800">
                Please confirm you want to cancel this patient visit.
              </p>
              <p className="text-p3 text-warning-700 mt-1">
                This action will mark the visit as cancelled. Patient data will be preserved.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-warning-50 border-l-4 border-warning-500 rounded-r text-p3 text-warning-700">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-pneutral-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-p3 border border-pneutral-400 font-medium text-pneutral-700 bg-pneutral-50 rounded-full flex items-center gap-1"
          >
            <FaTimes size={16} />
            Go Back
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isCancelling}
            className="px-4 py-2 text-p3 font-medium text-pneutral-50 bg-warning-500 rounded-full flex items-center gap-1 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isCancelling ? (
              <>
                <Loader type="spinner" />
                Cancelling...
              </>
            ) : (
              <>
                <FaTrash size={16} />
                Confirm Cancellation
              </>
            )}
          </button>
        </div>
      </div>
    </NewModal>
  );
};

export default CancelPatientModal;
