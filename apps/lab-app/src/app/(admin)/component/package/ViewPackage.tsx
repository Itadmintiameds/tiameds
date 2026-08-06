
'use client';

import { TestList } from '@/types/test/testlist';
import { PiPackageFill } from 'react-icons/pi';

interface PackageData {
  id: number;
  packageName: string;
  discount: number;
  price: number;
  tests: TestList[];
}

interface ViewPackageProps {
  packageData: PackageData;
}

const ViewPackage = ({ packageData }: ViewPackageProps) => {
  const subtotal = packageData.tests.reduce((sum, test) => sum + Number(test.price), 0);
  const discountAmount = (subtotal * packageData.discount) / 100;

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="flex items-center gap-4 pb-4 border-b border-pneutral-200">
        <div className="w-16 h-16 rounded-full bg-secondary-700 text-pneutral-50 flex items-center justify-center shrink-0">
          <PiPackageFill size={28} />
        </div>
        <div>
          <h2 className="text-h5 font-semibold text-pneutral-900">{packageData.packageName}</h2>
          <span className="mt-1 inline-flex items-center rounded-full bg-info-50 px-3 py-1 text-p2 font-medium text-info-700">
            {packageData.tests.length} Test{packageData.tests.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Included Tests */}
      <div className="bg-danger-100 rounded-lg p-4 space-y-2">
        <h4 className="font-semibold text-warning-800 text-p3">
          Included Tests ({packageData.tests.length})
        </h4>

        <div className="divide-y divide-danger-300">
          {packageData.tests.length > 0 ? (
            packageData.tests.map(test => (
              <div key={test.id} className="flex justify-between items-center py-2.5">
                <span className="text-p3 font-medium text-pneutral-900">{test.name}</span>
                <span className="text-p3 text-pneutral-700">₹{Number(test.price).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-p3 text-pneutral-500 py-4">No tests in this package</p>
          )}
        </div>
      </div>

      {/* Package Summary */}
      <div className="bg-info-50 rounded-lg p-4">
        <h4 className="font-semibold text-info-700 text-p3 pb-2 border-b border-info-200 mb-3">
          Package Summary
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-p3">
            <span className="text-pneutral-500">Subtotal ({packageData.tests.length} tests)</span>
            <span className="text-pneutral-900">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-p3">
            <span className="text-pneutral-500">Discount ({packageData.discount}%):</span>
            <span className="text-warning-600 font-medium">-₹{discountAmount.toFixed(2)}</span>
          </div>
          <div className="border-t border-info-200 pt-2 mt-2 flex justify-between">
            <span className="text-p3 font-bold text-pneutral-900">Total</span>
            <span className="text-p3 font-bold text-pneutral-900">₹{Number(packageData.price).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPackage;
