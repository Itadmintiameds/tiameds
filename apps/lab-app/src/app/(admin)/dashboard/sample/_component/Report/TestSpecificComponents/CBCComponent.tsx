import React, { useState, useEffect } from 'react';
import { TestReferancePoint } from '@/types/test/testlist';
import { TbChartLine, TbX, TbSquareRoundedCheck, TbNumbers, TbRuler } from 'react-icons/tb';

interface CBCComponentProps {
  referencePoints: TestReferancePoint[];
  inputValues: Record<string, Record<string | number, string>>;
  testName: string;
  onInputChange: (testName: string, index: number | string, value: string) => void;
  getValueStatus: (value: string, minRef: number | null, maxRef: number | null) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const CBCComponent: React.FC<CBCComponentProps> = ({
  referencePoints,
  inputValues,
  testName,
  onInputChange,
  getValueStatus,
  getStatusColor,
  getStatusIcon
}) => {
  const [showDifferentialModal, setShowDifferentialModal] = useState(false);
  const [differentialResult, setDifferentialResult] = useState<{ total: number; type: string; message: string } | null>(null);
  const [lastDifferentialValues, setLastDifferentialValues] = useState<string>('');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // CBC field ordering
  const cbcOrder = [
    'HAEMOGLOBIN',
    'TOTAL COUNT/ W.B.C',
    'NEUTROPHILS',
    'LYMPHOCYTES',
    'EOSINOPHILS',
    'MONOCYTES',
    'BASOPHILS',
    'PLATELET COUNT',
    'R.B.C',
    'P.C.V',
    'M.C.V',
    'M.C.H',
    'M.C.H.C'
  ];

  // Sort CBC fields in correct order
  const sortCBCFields = (referenceData: TestReferancePoint[]) => {
    return referenceData.sort((a, b) => {
      const aIndex = cbcOrder.findIndex(item =>
        a.testDescription?.toUpperCase().includes(item) ||
        a.testDescription?.toUpperCase() === item
      );
      const bIndex = cbcOrder.findIndex(item =>
        b.testDescription?.toUpperCase().includes(item) ||
        b.testDescription?.toUpperCase() === item
      );

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return 0;
    });
  };

  // Validate differential count
  const validateDifferentialCount = () => {
    const differentialFields = ['NEUTROPHILS', 'LYMPHOCYTES', 'EOSINOPHILS', 'MONOCYTES', 'BASOPHILS'];
    let total = 0;
    let hasValues = false;
    const fieldValues: { [key: string]: number } = {};

    referencePoints.forEach((point, index) => {
      const pointDescription = point.testDescription?.toUpperCase() || '';
      const matchingField = differentialFields.find(field =>
        pointDescription.includes(field)
      );

      if (matchingField) {
        const fieldValue = inputValues[testName]?.[index] || '';
        if (fieldValue && !isNaN(Number(fieldValue))) {
          const numValue = Number(fieldValue);
          total += numValue;
          fieldValues[matchingField] = numValue;
          hasValues = true;
        }
      }
    });

    if (!hasValues) return null;

    const filledFieldsCount = Object.keys(fieldValues).length;
    const totalFields = 5;

    if (filledFieldsCount < totalFields) return null;

    const calculationString = Object.values(fieldValues).join('+');

    if (total > 100) {
      return {
        type: 'error',
        message: `Differential count: ${calculationString} = ${total} (greater than 100)`,
        total,
        calculation: calculationString
      };
    } else if (total === 100) {
      return {
        type: 'success',
        message: `Differential count: ${calculationString} = ${total} (perfect)`,
        total,
        calculation: calculationString
      };
    } else {
      return {
        type: 'error',
        message: `Differential count: ${calculationString} = ${total} (less than 100)`,
        total,
        calculation: calculationString
      };
    }
  };

  // Check if field is differential count field
  const isDifferentialField = (point: TestReferancePoint) => {
    const differentialFields = ['NEUTROPHILS', 'LYMPHOCYTES', 'EOSINOPHILS', 'MONOCYTES', 'BASOPHILS'];
    return differentialFields.some(field =>
      point.testDescription?.toUpperCase().includes(field)
    );
  };

  // Check if this is the first differential field
  const isFirstDifferentialField = (point: TestReferancePoint) => {
    return isDifferentialField(point) && 
           point.testDescription?.toUpperCase().includes('NEUTROPHILS');
  };

  // Trigger validation when input values change with debouncing
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set a new debounced timer
    const timer = setTimeout(() => {
      const validation = validateDifferentialCount();
      if (validation) {
        const currentValues = Object.values(validation).join('|');
        if (currentValues !== lastDifferentialValues) {
          setDifferentialResult(validation);
          setShowDifferentialModal(true);
          setLastDifferentialValues(currentValues);
        }
      }
    }, 1000); // 1 second delay

    setDebounceTimer(timer);

    // Cleanup function
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [inputValues, referencePoints, lastDifferentialValues]);

  const sortedPoints = sortCBCFields(referencePoints);

  return (
    <>
      {/* CBC Differential Count Validation Alert */}
      {(() => {
        const differentialValidation = validateDifferentialCount();
        if (differentialValidation) {
          return (
            <div className={`p-4 rounded-lg border-2 ${
              differentialValidation.type === 'error' ? 'bg-red-50 border-red-300' :
              'bg-green-50 border-green-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {differentialValidation.type === 'error' ? (
                    <TbX className="text-red-500 mr-3" size={24} />
                  ) : (
                    <TbSquareRoundedCheck className="text-green-500 mr-3" size={24} />
                  )}
                  <div>
                    <span className={`text-base font-semibold ${
                      differentialValidation.type === 'error' ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {differentialValidation.message}
                    </span>
                    <p className={`text-sm mt-1 ${
                      differentialValidation.type === 'error' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {differentialValidation.type === 'error' ? 
                        'Please check your differential count values' :
                        'Differential count is correctly balanced'
                      }
                    </p>
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  differentialValidation.type === 'error' ? 'text-red-600' : 'text-green-600'
                }`}>
                  Total: {differentialValidation.total}
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* CBC Fields */}
      {sortedPoints.map((point, index) => {
        const currentValue = inputValues[testName]?.[index] || '';
        const isDiffField = isDifferentialField(point);
        const isFirstDiff = isFirstDifferentialField(point);
        const status = getValueStatus(currentValue, point.minReferenceRange, point.maxReferenceRange);

        return (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-all relative ${
              isDiffField ? 'ml-4 border-l-4 border-l-blue-400' : ''
            } ${getStatusColor(status)}`}
          >
            {/* Differential Count Heading */}
            {isFirstDiff && (
              <div className="mb-3 pb-2 border-b border-blue-200">
                <h4 className="text-sm font-semibold text-blue-700 flex items-center">
                  <TbChartLine className="mr-2" size={16} />
                  Differential Count:
                </h4>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <div>
                  <p className="text-gray-800 font-medium">
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
                  <div className="flex items-center mb-1">
                    <TbNumbers className="text-gray-500 mr-2" size={18} />
                    <p className="font-medium text-gray-600">Enter Value</p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(status)}
                    <input
                      type="text"
                      className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border-gray-300"
                      placeholder="Enter value"
                      value={currentValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string, numbers, and decimal point
                        // Prevent negative values by not allowing minus sign
                        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                          onInputChange(testName, index, value);
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent typing minus sign
                        if (e.key === '-') {
                          e.preventDefault();
                        }
                      }}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-start ml-10">
                <TbChartLine className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-600">Reference Range</p>
                  <p className="text-gray-800">
                    {point.minReferenceRange ?? 'N/A'} - {point.maxReferenceRange ?? 'N/A'}  {point.units && (
                      <span className="text-gray-500 flex items-center">
                        <TbRuler className="ml-1" size={14} /> {point?.units}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Differential Count Validation Modal */}
      {showDifferentialModal && differentialResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center">
                  <TbChartLine className="mr-2 text-blue-500" size={20} />
                  Differential Count Validation
                </h3>
                <button
                  onClick={() => setShowDifferentialModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <TbX size={20} />
                </button>
              </div>
              
              <div className={`text-center p-6 rounded-lg border-2 ${
                differentialResult.type === 'success' 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className={`text-4xl font-bold mb-2 ${
                  differentialResult.type === 'success' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {differentialResult.total}
                </div>
                <div className={`text-lg font-semibold ${
                  differentialResult.type === 'success' 
                    ? 'text-green-800' 
                    : 'text-red-800'
                }`}>
                  Differential Count
                </div>
                <div className={`text-sm mt-2 ${
                  differentialResult.type === 'success' 
                    ? 'text-green-700' 
                    : 'text-red-700'
                }`}>
                  {differentialResult.type === 'success' 
                    ? 'Perfect! All values are balanced.' 
                    : 'Please review your differential count values.'}
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowDifferentialModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CBCComponent;
