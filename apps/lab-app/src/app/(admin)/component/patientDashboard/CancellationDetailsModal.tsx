'use client';
import React from 'react';
import { FaUser, FaCalendarAlt, FaClock, FaInfoCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import { Patient } from '@/types/patient/patient';
import NewModal from '@/app/(admin)/dashboard/newcommoncomponent/NewModal';

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
    if (!patientDetails) return null;

    const visit = patientDetails.visit;
    const cancellationDate = visit?.visitCancellationDate;
    const cancellationTime = visit?.visitCancellationTime;
    const cancellationBy = visit?.visitCancellationBy;
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
        <NewModal
            isOpen={isOpen}
            onClose={onClose}
            title="Cancellation Details"
            modalClassName="max-w-4xl"
        >
            <div className="space-y-5">
                {/* Patient Info */}
                <div className="bg-info-50 rounded-lg p-4 space-y-3">
                    <h3 className="text-p3 font-semibold text-info-700">Patient Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-p3">
                        <div>
                            <span className="text-pneutral-500">Patient Name:</span>
                            <span className="ml-2 font-medium text-pneutral-900">{patientDetails.firstName || 'Not specified'}</span>
                        </div>
                        <div>
                            <span className="text-pneutral-500">Patient ID:</span>
                            <span className="ml-2 font-medium text-pneutral-900">{patientDetails.id || 'Not specified'}</span>
                        </div>
                        <div>
                            <span className="text-pneutral-500">Visit ID:</span>
                            <span className="ml-2 font-medium text-pneutral-900">{visit?.visitId || 'Not specified'}</span>
                        </div>
                        <div>
                            <span className="text-pneutral-500">Phone:</span>
                            <span className="ml-2 font-medium text-pneutral-900">{patientDetails.phone || 'Not specified'}</span>
                        </div>
                    </div>
                </div>

                {/* Cancellation Details */}
                <div className="bg-danger-100 rounded-lg p-4 space-y-3">
                    <h3 className="text-p3 font-semibold text-warning-800">Cancellation Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Cancelled By */}
                        <div className="flex items-center p-3 bg-white rounded-lg border border-pneutral-200">
                            <FaUser className="text-warning-500 mr-3 text-lg" />
                            <div>
                                <p className="text-p2 text-warning-600 font-medium">Cancelled By</p>
                                <p className="font-medium text-p3 text-pneutral-900">
                                    {cancellationBy || 'Not specified'}
                                </p>
                            </div>
                        </div>

                        {/* Cancellation Date */}
                        <div className="flex items-center p-3 bg-white rounded-lg border border-pneutral-200">
                            <FaCalendarAlt className="text-info-500 mr-3 text-lg" />
                            <div>
                                <p className="text-p2 text-info-600 font-medium">Cancellation Date</p>
                                <p className="font-medium text-p3 text-pneutral-900">
                                    {cancellationDate ? formatDateTime(cancellationDate) : 'Not specified'}
                                </p>
                            </div>
                        </div>

                        {/* Cancellation Time */}
                        <div className="flex items-center p-3 bg-white rounded-lg border border-pneutral-200">
                            <FaClock className="text-success-600 mr-3 text-lg" />
                            <div>
                                <p className="text-p2 text-success-700 font-medium">Cancellation Time</p>
                                <p className="font-medium text-p3 text-pneutral-900">
                                    {(cancellationDate && cancellationTime)
                                        ? formatDateTime(cancellationDate, cancellationTime)
                                        : 'Not specified'}
                                </p>
                            </div>
                        </div>

                        {/* Cancellation Reason */}
                        <div className="p-3 bg-white rounded-lg border border-pneutral-200">
                            <div className="flex items-start">
                                <FaInfoCircle className="text-warning-500 mr-3 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-p2 text-warning-600 font-medium mb-1">Cancellation Reason</p>
                                    <p className="text-p3 text-pneutral-800 leading-relaxed">
                                        {cancellationReason || 'No reason provided'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visit Summary */}
                <div className="bg-success-50 rounded-lg p-4 space-y-3">
                    <h3 className="text-p3 font-semibold text-success-800">Visit Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-p3">
                        <div>
                            <span className="text-pneutral-500">Visit Date:</span>
                            <span className="ml-2 font-medium text-pneutral-900">
                                {visit?.visitDate ? formatDateTime(visit.visitDate) : 'Not specified'}
                            </span>
                        </div>
                        <div>
                            <span className="text-pneutral-500">Visit Type:</span>
                            <span className="ml-2 font-medium text-pneutral-900">{visit?.visitType || 'Not specified'}</span>
                        </div>
                        <div>
                            <span className="text-pneutral-500">Payment Status:</span>
                            <span className="ml-2 font-medium text-pneutral-900">{visit?.billing?.paymentStatus || 'Not specified'}</span>
                        </div>
                        <div>
                            <span className="text-pneutral-500">Total Amount:</span>
                            <span className="ml-2 font-medium text-pneutral-900">
                                ₹{visit?.billing?.netAmount?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-2 border-t border-pneutral-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-p3 border border-pneutral-400 font-medium text-pneutral-700 bg-pneutral-50 rounded-full"
                    >
                        Close
                    </button>
                </div>
            </div>
        </NewModal>
    );
};

export default CancellationDetailsModal;
