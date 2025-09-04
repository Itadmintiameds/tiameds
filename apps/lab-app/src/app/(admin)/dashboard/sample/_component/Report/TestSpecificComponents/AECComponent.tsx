import React, { useEffect, useMemo } from 'react';
import { TestReferancePoint } from '@/types/test/testlist';
import { TbClipboardText, TbNumbers, TbChartLine, TbRuler, TbCalculator } from 'react-icons/tb';

interface AECComponentProps {
  referencePoints: TestReferancePoint[];
  inputValues: Record<string, Record<string | number, string>>;
  testName: string;
  onInputChange: (testName: string, index: number | string, value: string) => void;
  getValueStatus: (value: string, minRef: number | null, maxRef: number | null) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const AECComponent: React.FC<AECComponentProps> = ({
  referencePoints,
  inputValues,
  testName,
  onInputChange,
  getValueStatus,
  getStatusColor,
  getStatusIcon,
}) => {
  // Field ordering
  const aecOrder = [
    'EOSINOPHIL COUNT',
    'TOTAL COUNT',
    'ABSOLUTE EOSINOPHIL COUNT',
  ];
  

  const sortAECFields = (referenceData: TestReferancePoint[]) => {
    return referenceData.sort((a, b) => {
      // Get exact match index for each field
      const aIndex = aecOrder.findIndex((item) => a.testDescription?.toUpperCase() === item.toUpperCase());
      const bIndex = aecOrder.findIndex((item) => b.testDescription?.toUpperCase() === item.toUpperCase());
      
      // If both fields are found in our order array, sort by their position
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      
      // If only 'a' is found, it comes first
      if (aIndex !== -1) return -1;
      
      // If only 'b' is found, it comes first
      if (bIndex !== -1) return 1;
      
      // If neither is found, maintain original order
      return 0;
    });
  };

  const findIndexByDescription = (searchTerm: string) => {
    return referencePoints.findIndex((p) => (p.testDescription?.toUpperCase() || '').includes(searchTerm.toUpperCase()));
  };

  const calculateDerivedValues = () => {
    const eosinophilCountIndex = findIndexByDescription('EOSINOPHIL COUNT');
    const totalCountIndex = findIndexByDescription('TOTAL COUNT');
    const absEosIndex = findIndexByDescription('ABSOLUTE EOSINOPHIL COUNT');

    const eosinophilCountVal = parseFloat(inputValues[testName]?.[eosinophilCountIndex] || '0');
    const totalCountVal = parseFloat(inputValues[testName]?.[totalCountIndex] || '0');

    // ABSOLUTE EOSINOPHIL COUNT = (TOTAL COUNT * EOSINOPHIL COUNT) / 100
    const calculatedAbsEos = eosinophilCountVal > 0 && totalCountVal > 0 ? (totalCountVal * eosinophilCountVal) / 100 : 0;

    return { eosinophilCountIndex, totalCountIndex, absEosIndex, calculatedAbsEos };
  };

  const sortedPoints = sortAECFields(referencePoints);

  const derivedValues = useMemo(() => calculateDerivedValues(), [
    referencePoints,
    inputValues[testName],
    testName,
  ]);

  // Keep ABSOLUTE EOSINOPHIL COUNT updated and read-only
  useEffect(() => {
    if (derivedValues.absEosIndex === -1) return;
    if (!isNaN(derivedValues.calculatedAbsEos) && derivedValues.calculatedAbsEos > 0) {
      const newValue = derivedValues.calculatedAbsEos.toFixed(0);
      const currentValue = (inputValues[testName]?.[derivedValues.absEosIndex] || '').trim();
      if (parseFloat(currentValue) !== parseFloat(newValue)) {
        onInputChange(testName, derivedValues.absEosIndex, newValue);
      }
    } else {
      const currentValue = (inputValues[testName]?.[derivedValues.absEosIndex] || '').trim();
      if (currentValue !== '') {
        onInputChange(testName, derivedValues.absEosIndex, '');
      }
    }
  }, [derivedValues, inputValues, onInputChange, testName]);

  return (
    <>
      {sortedPoints.map((point) => {
        const unsortedIndex = referencePoints.findIndex((p) => p.id === point.id);
        const currentValue = inputValues[testName]?.[unsortedIndex] || '';
        const isAutoField = (point.testDescription?.toUpperCase() || '').includes('ABSOLUTE EOSINOPHIL COUNT');
        const status = getValueStatus(currentValue, point.minReferenceRange, point.maxReferenceRange);

        let displayValue = currentValue;
        let isReadOnly = false;
        if (isAutoField) {
          displayValue = derivedValues.calculatedAbsEos > 0 ? derivedValues.calculatedAbsEos.toFixed(0) : '';
          isReadOnly = true;
        }

        return (
          <div key={point.id} className={`p-4 rounded-lg border transition-all relative ${isAutoField ? 'ml-4 border-l-4 border-l-green-400' : ''} ${getStatusColor(status)}`}>
            {/* Auto-calculated field indicator */}
            {isAutoField && (
              <div className="mb-2 flex items-center">
                <TbCalculator className="text-green-500 mr-2" size={16} />
                <span className="text-xs text-green-600 font-medium">Auto-calculated field</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                  <div className="flex items-center mb-1">
                    <TbNumbers className="text-gray-500 mr-2" size={18} />
                    <p className="font-medium text-gray-600">{isReadOnly ? 'Calculated Value' : 'Enter Value'}</p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(status)}
                    <input
                      type="text"
                      className={`w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${isReadOnly ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'border-gray-300'}`}
                      placeholder={isReadOnly ? 'Auto-calculated' : 'Enter value'}
                      value={displayValue}
                      disabled={isReadOnly}
                      aria-readonly={isReadOnly}
                      onChange={(e) => {
                        if (!isReadOnly) {
                          const value = e.target.value;
                          if (!isAutoField && value.startsWith('-')) {
                            return;
                          }
                          onInputChange(testName, unsortedIndex, value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (!isReadOnly && !isAutoField && e.key === '-') {
                          e.preventDefault();
                        }
                      }}
                      readOnly={isReadOnly}
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
                    {point.minReferenceRange ?? 'N/A'} - {point.maxReferenceRange ?? 'N/A'} {point.units && (
                      <span className="text-gray-500 flex items-center">
                        <TbRuler className="ml-1" size={14} />
                        {point.units}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

          
          </div>
        );
      })}
    </>
  );
};

export default AECComponent;


