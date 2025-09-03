import React from 'react';
import { Printer } from 'lucide-react';

interface RadiologyComponentProps {
  testName: string;
}

const RadiologyComponent: React.FC<RadiologyComponentProps> = ({
  testName,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      {/* Test Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{testName}</h3>
      </div>

      {/* Radiology Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-blue-800 mb-2">
          <Printer className="h-5 w-5" />
          <span className="font-medium">Imaging Test</span>
        </div>
        
        <p className="text-blue-700 text-sm">
          No laboratory values required. Results will be provided separately.
        </p>
      </div>

      {/* Additional Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          <strong>Note:</strong> Processed separately
        </p>
      </div>
    </div>
  );
};

export default RadiologyComponent;
