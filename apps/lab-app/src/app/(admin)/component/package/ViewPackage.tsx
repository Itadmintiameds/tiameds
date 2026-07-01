
'use client';

import { TestList } from '@/types/test/testlist';
import { FaTimes } from 'react-icons/fa';

interface PackageData {
  id: number;
  packageName: string;
  discount: number;
  price: number;
  tests: TestList[];
}

interface ViewPackageProps {
  packageData: PackageData;
  onClose: () => void;
}

const ViewPackage = ({ packageData, onClose }: ViewPackageProps) => {
  const subtotal = packageData.tests.reduce((sum, test) => sum + Number(test.price), 0);
  const discountAmount = (subtotal * packageData.discount) / 100;

  return (
    <div className="bg-white rounded-2xl p-2">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Package Details</h2>

      {/* Package Name / Discount Percentage */}
      <div className="space-y-3 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Package Name:</span>
          <span className="text-base font-semibold text-gray-900">{packageData.packageName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Discount Percentage:</span>
          <span className="text-base font-semibold text-gray-900">{packageData.discount}%</span>
        </div>
      </div>

      {/* Included Tests */}
      <div className="bg-indigo-50 rounded-2xl p-5 mb-5">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Included Tests ({packageData.tests.length})
        </h3>

        <div className="divide-y divide-indigo-100">
          {packageData.tests.length > 0 ? (
            packageData.tests.map(test => (
              <div key={test.id} className="flex justify-between items-center py-3">
                <span className="text-base font-medium text-indigo-600">{test.name}</span>
                <span className="text-base text-gray-900">₹{Number(test.price).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4 text-sm">No tests in this package</p>
          )}
        </div>
      </div>

      {/* Package Summary */}
      <div className="mb-5">
        <h3 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-200 mb-3">
          Package Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal ({packageData.tests.length} tests)</span>
            <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Discount ({packageData.discount}%):</span>
            <span className="text-red-500 font-medium">-₹{discountAmount.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">₹{Number(packageData.price).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-semibold text-gray-500 bg-white rounded-full border border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
        >
          <FaTimes className="h-4 w-4" />
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewPackage;
