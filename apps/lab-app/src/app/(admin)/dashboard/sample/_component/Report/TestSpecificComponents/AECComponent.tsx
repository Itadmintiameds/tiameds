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
    'ABSOLUTE EOSINOPHIL COUNT',
    'TOTAL COUNT',
    'AEC',
  ];

  const sortAECFields = (referenceData: TestReferancePoint[]) => {
    return referenceData.sort((a, b) => {
      const aIndex = aecOrder.findIndex((item) => a.testDescription?.toUpperCase().includes(item));
      const bIndex = aecOrder.findIndex((item) => b.testDescription?.toUpperCase().includes(item));
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });
  };

  const findIndexByDescription = (searchTerm: string) => {
    return referencePoints.findIndex((p) => (p.testDescription?.toUpperCase() || '').includes(searchTerm.toUpperCase()));
  };

  const calculateDerivedValues = () => {
    const absEosIndex = findIndexByDescription('ABSOLUTE EOSINOPHIL COUNT');
    const totalCountIndex = findIndexByDescription('TOTAL COUNT');
    const aecIndex = findIndexByDescription('AEC');

    const absEosVal = parseFloat(inputValues[testName]?.[absEosIndex] || '0');
    const totalCountVal = parseFloat(inputValues[testName]?.[totalCountIndex] || '0');

    // AEC = (TOTAL COUNT * ABSOLUTE EOSINOPHIL COUNT) / 100
    const calculatedAEC = absEosVal > 0 && totalCountVal > 0 ? (totalCountVal * absEosVal) / 100 : 0;

    return { absEosIndex, totalCountIndex, aecIndex, calculatedAEC };
  };

  const sortedPoints = sortAECFields(referencePoints);

  const derivedValues = useMemo(() => calculateDerivedValues(), [
    referencePoints,
    inputValues[testName],
    testName,
  ]);

  // Keep AEC updated and read-only
  useEffect(() => {
    if (derivedValues.aecIndex === -1) return;
    if (!isNaN(derivedValues.calculatedAEC) && derivedValues.calculatedAEC > 0) {
      const newValue = derivedValues.calculatedAEC.toFixed(0);
      const currentValue = (inputValues[testName]?.[derivedValues.aecIndex] || '').trim();
      if (parseFloat(currentValue) !== parseFloat(newValue)) {
        onInputChange(testName, derivedValues.aecIndex, newValue);
      }
    } else {
      const currentValue = (inputValues[testName]?.[derivedValues.aecIndex] || '').trim();
      if (currentValue !== '') {
        onInputChange(testName, derivedValues.aecIndex, '');
      }
    }
  }, [derivedValues, inputValues, onInputChange, testName]);

  return (
    <>
      {sortedPoints.map((point) => {
        const unsortedIndex = referencePoints.findIndex((p) => p.id === point.id);
        const currentValue = inputValues[testName]?.[unsortedIndex] || '';
        const isAutoField = (point.testDescription?.toUpperCase() || '').includes('AEC') && !(point.testDescription?.toUpperCase() || '').includes('TOTAL COUNT') && !(point.testDescription?.toUpperCase() || '').includes('ABSOLUTE EOSINOPHIL COUNT');
        const status = getValueStatus(currentValue, point.minReferenceRange, point.maxReferenceRange);

        let displayValue = currentValue;
        let isReadOnly = false;
        if (isAutoField) {
          displayValue = derivedValues.calculatedAEC > 0 ? derivedValues.calculatedAEC.toFixed(0) : '';
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
                  <p className="font-medium text-gray-600">Description</p>
                  <p className="text-gray-800">{point.testDescription}</p>
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


