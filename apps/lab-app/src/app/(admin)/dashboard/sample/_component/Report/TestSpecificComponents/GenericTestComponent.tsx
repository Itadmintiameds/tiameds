import React, { useState } from 'react';
import { TestReferancePoint } from '@/types/test/testlist';
import { TbClipboardText, TbNumbers, TbChartLine, TbRuler, TbEdit } from 'react-icons/tb';

interface GenericTestComponentProps {
  referencePoints: TestReferancePoint[];
  inputValues: Record<string, Record<string | number, string>>;
  testName: string;
  onInputChange: (testName: string, index: number | string, value: string) => void;
  getValueStatus: (value: string, minRef: number | null, maxRef: number | null) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const GenericTestComponent: React.FC<GenericTestComponentProps> = ({
  referencePoints,
  inputValues,
  testName,
  onInputChange,
  getValueStatus,
  getStatusColor,
  getStatusIcon
}) => {
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Function to determine if titles should be hidden for certain input types
  const shouldHideTitles = (testDescription: string) => {
    return [
      'DESCRIPTION',
      'DROPDOWN',
      'DROPDOWN-POSITIVE/NEGATIVE',
      'DROPDOWN-PRESENT/ABSENT',
      'DROPDOWN-REACTIVE/NONREACTIVE',
      'DROPDOWN-PERCENTAGE',
      'DROPDOWN-COMPATIBLE/INCOMPATIBLE',
      'DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE',
      'DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT'
    ].includes(testDescription);
  };

  // Function to render different input types based on testDescription
  const renderInputField = (point: TestReferancePoint, index: number, currentValue: string) => {
    const testDescription = point.testDescription || '';
    
    switch (testDescription) {
      case 'DESCRIPTION':
        return (
          <textarea
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300 min-h-[80px] resize-none"
            placeholder="Enter description"
            value={currentValue}
            onChange={(e) => onInputChange(testName, index, e.target.value)}
            required
          />
        );

      case 'DROPDOWN-POSITIVE/NEGATIVE':
        return (
          <select
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
            value={currentValue}
            onChange={(e) => onInputChange(testName, index, e.target.value)}
            required
          >
            <option value="">Select option</option>
            <option value="POSITIVE">POSITIVE</option>
            <option value="NEGATIVE">NEGATIVE</option>
          </select>
        );

      case 'DROPDOWN-PRESENT/ABSENT':
        return (
          <select
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
            value={currentValue}
            onChange={(e) => onInputChange(testName, index, e.target.value)}
            required
          >
            <option value="">Select option</option>
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
          </select>
        );

      case 'DROPDOWN-REACTIVE/NONREACTIVE':
        return (
          <select
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
            value={currentValue}
            onChange={(e) => onInputChange(testName, index, e.target.value)}
            required
          >
            <option value="">Select option</option>
            <option value="REACTIVE">REACTIVE</option>
            <option value="NONREACTIVE">NONREACTIVE</option>
          </select>
        );

      case 'DROPDOWN-COMPATIBLE/INCOMPATIBLE':
        return (
          <select
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
            value={currentValue}
            onChange={(e) => onInputChange(testName, index, e.target.value)}
            required
          >
            <option value="">Select option</option>
            <option value="COMPATIBLE">COMPATIBLE</option>
            <option value="INCOMPATIBLE">INCOMPATIBLE</option>
          </select>
        );

      case 'DROPDOWN-PERCENTAGE':
        return (
          <div className="relative w-full">
            <input
              type="text"
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
              placeholder="Type percentage (0-100%) or select from dropdown"
              value={currentValue}
              onChange={(e) => {
                const value = e.target.value;
                // Allow typing numbers and % symbol
                if (value === '' || /^\d*%?$/.test(value)) {
                  onInputChange(testName, index, value);
                }
              }}
              onFocus={() => {
                setOpenDropdowns(prev => ({ ...prev, [`${testName}-${index}`]: true }));
              }}
              onBlur={() => {
                // Delay hiding to allow click on dropdown items
                setTimeout(() => {
                  setOpenDropdowns(prev => ({ ...prev, [`${testName}-${index}`]: false }));
                }, 150);
              }}
              required
            />
            {openDropdowns[`${testName}-${index}`] && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {Array.from({ length: 11 }, (_, i) => i * 10).map((percentage) => (
                  <div
                    key={percentage}
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      onInputChange(testName, index, `${percentage}%`);
                      setOpenDropdowns(prev => ({ ...prev, [`${testName}-${index}`]: false }));
                    }}
                  >
                    {percentage}%
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'DROPDOWN WITH DESCRIPTION-REACTIVE/NONREACTIVE':
      case 'DROPDOWN WITH DESCRIPTION-PRESENT/ABSENT':
        return (
          <div className="w-full space-y-2">
            <select
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
              value={currentValue}
              onChange={(e) => onInputChange(testName, index, e.target.value)}
              required
            >
              <option value="">Select option</option>
              {testDescription.includes('REACTIVE') ? (
                <>
                  <option value="REACTIVE">REACTIVE</option>
                  <option value="NONREACTIVE">NONREACTIVE</option>
                </>
              ) : (
                <>
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                </>
              )}
            </select>
                         <div className="flex items-center w-full">
               <TbEdit className="text-gray-500 mr-2" size={16} />
               <textarea
                 className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300 resize-none"
                 placeholder="Additional description"
                 value={inputValues[testName]?.[`${index}_description`] || ''}
                 onChange={(e) => onInputChange(testName, `${index}_description`, e.target.value)}
                 rows={3}
               />
             </div>
          </div>
        );

      case 'DROPDOWN':
        return (
          <select
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
            value={currentValue}
            onChange={(e) => onInputChange(testName, index, e.target.value)}
            required
          >
            <option value="">Select option</option>
            <option value="YES">YES</option>
            <option value="NO">NO</option>
          </select>
        );

      default:
        return (
          <input
            type="text"
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
            placeholder="Enter value"
            value={currentValue}
            onChange={(e) => onInputChange(testName, index, e.target.value)}
            required
          />
        );
    }
  };

  return (
    <>
      {referencePoints.map((point, index) => {
        const currentValue = inputValues[testName]?.[index] || '';
        const status = getValueStatus(currentValue, point.minReferenceRange, point.maxReferenceRange);

        return (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-all relative ${getStatusColor(status)}`}
          >
            <div className={`grid grid-cols-1 md:${shouldHideTitles(point.testDescription) ? 'grid-cols-2' : 'grid-cols-3'} gap-4 text-sm`}>
              <div className="flex items-start">
                <TbClipboardText className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-600">Test Parameter</p>
                  <p className="text-gray-800">
                    {(() => {
                      // For dropdown fields, extract the actual test parameter name
                      if (point.testDescription && point.testDescription.includes('DROPDOWN')) {
                        if (point.testDescription.includes('DROPDOWN WITH DESCRIPTION-')) {
                          const prefix = 'DROPDOWN WITH DESCRIPTION-';
                          if (point.testDescription.startsWith(prefix)) {
                            return point.testDescription.substring(prefix.length).replace(/-/g, ' ');
                          }
                        } else if (point.testDescription.startsWith('DROPDOWN-')) {
                          const prefix = 'DROPDOWN-';
                          if (point.testDescription.startsWith(prefix)) {
                            return point.testDescription.substring(prefix.length).replace(/-/g, ' ');
                          }
                        }
                        return 'Test Parameter';
                      }
                      
                      // For other fields, show the actual test parameter name
                      return point.testDescription || 'Test Parameter';
                    })()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-1">
                  {!shouldHideTitles(point.testDescription) && (
                    <div className="flex items-center mb-1">
                      <TbNumbers className="text-gray-500 mr-2" size={18} />
                      <p className="font-medium text-gray-600">Enter Value</p>
                    </div>
                  )}
                  <div className="flex items-center">
                    {!shouldHideTitles(point.testDescription) && getStatusIcon(status)}
                    {renderInputField(point, index, currentValue)}
                  </div>
                </div>
              </div>
              
              {!shouldHideTitles(point.testDescription) && (
                <div className="flex items-start ml-10">
                  <TbChartLine className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-600">Reference Range</p>
                    <p className="text-gray-800">
                      {point.minReferenceRange ?? 'N/A'} - {point.maxReferenceRange ?? 'N/A'} {point.units && (
                        <span className="text-gray-500 flex items-center">
                          <span className="ml-1">{point.units}</span>
                          <TbRuler className="ml-1" size={14} />
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default GenericTestComponent;
