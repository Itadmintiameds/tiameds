
'use client';

import { FaTimes, FaTrash } from 'react-icons/fa';

interface DeletePackageProps {
  packageName: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeletePackage = ({ packageName, isDeleting, onClose, onConfirm }: DeletePackageProps) => {
  return (
    <div className="bg-white rounded-2xl p-2">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50 text-red-500">
          <FaTrash className="text-lg" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete this package?</h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-800">{packageName}</span>? This action cannot be undone.
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-semibold text-gray-500 bg-white rounded-full border border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
        >
          <FaTimes className="h-4 w-4" />
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="px-6 py-2.5 text-sm font-semibold text-white rounded-full transition-all duration-200 flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50"
        >
          <FaTrash className="h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default DeletePackage;
