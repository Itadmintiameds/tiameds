import React, { useEffect, useMemo } from 'react';
import { TestReferancePoint } from '@/types/test/testlist';
import { TbChartLine, TbClipboardText, TbNumbers, TbRuler, TbCalculator } from 'react-icons/tb';

interface HbA1cComponentProps {
  referencePoints: TestReferancePoint[];
  inputValues: Record<string, Record<string | number, string>>;
  testName: string;
  onInputChange: (testName: string, index: number | string, value: string) => void;
  getValueStatus: (value: string, minRef: number | null, maxRef: number | null) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const HbA1cComponent: React.FC<HbA1cComponentProps> = ({
  referencePoints,
  inputValues,
  testName,
  onInputChange,
  getValueStatus,
  getStatusColor,
  getStatusIcon
}) => {
  // HbA1c field ordering
  const hba1cOrder = [
    'HbA1c (GLYCOSYLATED Hb)',
    'MEAN BLOOD GLUCOSE'
  ];

  // Sort HbA1c fields in correct order
  const sortHbA1cFields = (referenceData: TestReferancePoint[]) => {
    return referenceData.sort((a, b) => {
      const aIndex = hba1cOrder.findIndex(item =>
        a.testDescription?.toUpperCase().includes(item) ||
        a.testDescription?.toUpperCase() === item
      );
      const bIndex = hba1cOrder.findIndex(item =>
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

  // Create a helper function to find index by exact or partial match
  const findIndexByDescription = (searchTerm: string) => {
    return referencePoints.findIndex(point => {
      const description = point.testDescription?.toUpperCase() || '';
      return description.includes(searchTerm.toUpperCase());
    });
  };

  // Auto-calculate MEAN BLOOD GLUCOSE
  const calculateDerivedValues = () => {
    // Find the indices for the required fields using the helper function
    const hba1cIndex = findIndexByDescription('HbA1c (GLYCOSYLATED Hb)');
    const meanBloodGlucoseIndex = findIndexByDescription('MEAN BLOOD GLUCOSE');

    const hba1c = parseFloat(inputValues[testName]?.[hba1cIndex] || '0');

    // Calculate MEAN BLOOD GLUCOSE: (HbA1c × 28.7) - 42.7
    const calculatedMeanBloodGlucose = hba1c > 0 ? (hba1c * 28.7) - 42.7 : 0;

    return {
      hba1cIndex,
      meanBloodGlucoseIndex,
      hba1c,
      calculatedMeanBloodGlucose
    };
  };

  // Check if field is auto-calculated
  const isAutoCalculatedField = (point: TestReferancePoint) => {
    return point.testDescription?.toUpperCase().includes('MEAN BLOOD GLUCOSE');
  };

  // Check if this is the first HbA1c field
  const isFirstHbA1cField = (point: TestReferancePoint) => {
    return point.testDescription?.toUpperCase().includes('HbA1c (GLYCOSYLATED Hb)');
  };

  const sortedPoints = sortHbA1cFields(referencePoints);

  // Memoize calculations to prevent infinite loops
  const derivedValues = useMemo(() => calculateDerivedValues(), [
    referencePoints,
    inputValues[testName],
    testName
  ]);

  useEffect(() => {
    if (!derivedValues || derivedValues.meanBloodGlucoseIndex === -1) return;

    // Update MEAN BLOOD GLUCOSE
    if (!isNaN(derivedValues.calculatedMeanBloodGlucose) && derivedValues.calculatedMeanBloodGlucose > 0) {
      const newValue = derivedValues.calculatedMeanBloodGlucose.toFixed(1);
      const currentValue = (inputValues[testName]?.[derivedValues.meanBloodGlucoseIndex] || '').trim();
      
      // Only update if the calculated value is different from the current value
      if (parseFloat(currentValue) !== parseFloat(newValue)) {
        onInputChange(testName, derivedValues.meanBloodGlucoseIndex, newValue);
      }
    } else if (derivedValues.calculatedMeanBloodGlucose === 0) {
      // Clear the field if HbA1c is 0 or empty
      const currentValue = (inputValues[testName]?.[derivedValues.meanBloodGlucoseIndex] || '').trim();
      if (currentValue !== '') {
        onInputChange(testName, derivedValues.meanBloodGlucoseIndex, '');
      }
    }
  }, [derivedValues, inputValues, testName, onInputChange]);

  return (
    <>
      {/* HbA1c Fields */}
      {sortedPoints.map((point) => {
        // Find the original index in the unsorted array
        const unsortedIndex = referencePoints.findIndex(p => p.id === point.id);
        const currentValue = inputValues[testName]?.[unsortedIndex] || '';
        const isAutoField = isAutoCalculatedField(point);
        const isFirstHbA1c = isFirstHbA1cField(point);
        const status = getValueStatus(currentValue, point.minReferenceRange, point.maxReferenceRange);

        // Determine the actual value to display
        let displayValue = currentValue;
        let isReadOnly = false;

        if (isAutoField) {
          displayValue = derivedValues.calculatedMeanBloodGlucose > 0 ? derivedValues.calculatedMeanBloodGlucose.toFixed(1) : '';
          isReadOnly = true;
        }

        return (
          <div
            key={point.id}
            className={`p-4 rounded-lg border transition-all relative ${isAutoField ? 'ml-4 border-l-4 border-l-green-400 bg-green-50' : ''
              } ${getStatusColor(status)}`}
          >
            {/* HbA1c Heading */}
            {isFirstHbA1c && (
              <div className="mb-3 pb-2 border-b border-blue-200">
                <h4 className="text-sm font-semibold text-blue-700 flex items-center">
                  <TbChartLine className="mr-2" size={16} />
                  Hb A1c (GLYCOSYLATED Hb):
                </h4>
              </div>
            )}

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
                    <p className="font-medium text-gray-600">
                      {isReadOnly ? 'Calculated Value' : 'Enter Value'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(status)}
                    <input
                      type="text"
                      className={`w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${isReadOnly
                        ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                        : 'border-gray-300'
                        }`}
                      placeholder={isReadOnly ? 'Auto-calculated' : 'Enter value'}
                      value={displayValue}
                      disabled={isReadOnly}
                      aria-readonly={isReadOnly}
                      onChange={(e) => {
                        if (!isReadOnly) {
                          const value = e.target.value;
                          // Prevent negative values for non-auto-populated fields
                          if (!isAutoField && value.startsWith('-')) {
                            return; // Don't allow negative values
                          }
                          onInputChange(testName, unsortedIndex, value);
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent typing minus sign for non-auto-populated fields
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

export default HbA1cComponent;