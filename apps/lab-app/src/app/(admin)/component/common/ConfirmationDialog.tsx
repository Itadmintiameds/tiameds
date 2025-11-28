import React from 'react';
import { FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header with gradient background */}
        <div 
          className="px-6 py-4 border-b border-gray-200 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <FaExclamationTriangle className="text-white text-lg" />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-white/80 hover:text-white transition-colors disabled:opacity-50 p-1 rounded-lg hover:bg-white/10"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0 mr-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <FaCheckCircle className="text-purple-500 text-xl" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-700 leading-relaxed mb-4">{message}</p>
              {children && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  {children}
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              style={{
                background: isLoading 
                  ? '#9CA3AF' 
                  : `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
              }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaCheckCircle className="mr-2" />
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
