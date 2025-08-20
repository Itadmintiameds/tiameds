'use client';
import React, { useRef, useEffect } from 'react';
import { FaTimes, FaUser, FaCalendarAlt, FaClock, FaInfoCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import { Patient } from '@/types/patient/patient';

interface CancellationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientDetails: Patient; 
}

const CancellationDetailsModal: React.FC<CancellationDetailsModalProps> = ({
    isOpen,
    onClose,
    patientDetails
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !patientDetails) return null;

    const visit = patientDetails.visit;
    const cancellationDate = visit?.visitCancellationDate;
    const cancellationTime = visit?.visitCancellationTime;
    const cancellationBy = visit?.vistCancellationBy;
    const cancellationReason = visit?.visitCancellationReason;

    const formatDateTime = (dateString: string, timeString?: string) => {
        try {
            if (timeString) {
                const dateTime = new Date(timeString);
                return format(dateTime, 'MMM dd, yyyy hh:mm a');
            } else if (dateString) {
                const date = new Date(dateString);
                return format(date, 'MMM dd, yyyy');
            }
            return 'Not specified';
        } catch (error) {
            return 'Invalid date';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] mx-auto overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <FaInfoCircle className="text-red-500 mr-3 text-xl" />
                        <h2 className="text-xl font-bold text-gray-800">Cancellation Details</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close modal"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    {/* Patient Info */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Patient Information</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Patient Name:</span>
                                    <span className="ml-2 font-medium">{patientDetails.firstName || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Patient ID:</span>
                                    <span className="ml-2 font-medium">{patientDetails.id || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Visit ID:</span>
                                    <span className="ml-2 font-medium">{visit?.visitId || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Phone:</span>
                                    <span className="ml-2 font-medium">{patientDetails.phone || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Cancellation Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Cancelled By */}
                            <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
                                <FaUser className="text-red-500 mr-3 text-lg" />
                                <div>
                                    <p className="text-xs text-red-600 font-medium">Cancelled By</p>
                                    <p className="font-medium text-gray-800">
                                        {cancellationBy || 'Not specified'}
                                    </p>
                                </div>
                            </div>

                            {/* Cancellation Date */}
                            <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <FaCalendarAlt className="text-blue-500 mr-3 text-lg" />
                                <div>
                                    <p className="text-xs text-blue-600 font-medium">Cancellation Date</p>
                                    <p className="font-medium text-gray-800">
                                        {cancellationDate ? formatDateTime(cancellationDate) : 'Not specified'}
                                    </p>
                                </div>
                            </div>

                            {/* Cancellation Time */}
                            <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                                <FaClock className="text-green-500 mr-3 text-lg" />
                                <div>
                                    <p className="text-xs text-green-600 font-medium">Cancellation Time</p>
                                    <p className="font-medium text-gray-800">
                                        {(cancellationDate && cancellationTime) 
                                            ? formatDateTime(cancellationDate, cancellationTime) 
                                            : 'Not specified'}
                                    </p>
                                </div>
                            </div>

                            {/* Cancellation Reason */}
                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="flex items-start">
                                    <FaInfoCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-xs text-yellow-600 font-medium mb-1">Cancellation Reason</p>
                                        <p className="text-sm text-gray-800 leading-relaxed">
                                            {cancellationReason || 'No reason provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visit Summary */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Visit Summary</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Visit Date:</span>
                                    <span className="ml-2 font-medium">
                                        {visit?.visitDate ? formatDateTime(visit.visitDate) : 'Not specified'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Visit Type:</span>
                                    <span className="ml-2 font-medium">{visit?.visitType || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Payment Status:</span>
                                    <span className="ml-2 font-medium">{visit?.billing?.paymentStatus || 'Not specified'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Total Amount:</span>
                                    <span className="ml-2 font-medium">
                                        ₹{visit?.billing?.netAmount?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancellationDetailsModal;
