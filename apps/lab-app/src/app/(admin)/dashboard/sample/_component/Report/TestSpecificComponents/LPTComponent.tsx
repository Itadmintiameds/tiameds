import React, { useState, useEffect, useMemo } from 'react';
import { TestReferancePoint } from '@/types/test/testlist';
import { TbClipboardText, TbNumbers, TbChartLine, TbRuler, TbCalculator } from 'react-icons/tb';

interface LPTComponentProps {
  referencePoints: TestReferancePoint[];
  inputValues: Record<string, Record<string | number, string>>;
  testName: string;
  onInputChange: (testName: string, index: number | string, value: string) => void;
  getValueStatus: (value: string, minRef: number | null, maxRef: number | null) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const LPTComponent: React.FC<LPTComponentProps> = ({
  referencePoints,
  inputValues,
  testName,
  onInputChange,
  getValueStatus,
  getStatusColor,
  getStatusIcon
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateTimeoutRef, setUpdateTimeoutRef] = useState<NodeJS.Timeout | null>(null);

  // Helper function to find index by description
  const findIndexByDescription = (description: string) => {
    return referencePoints.findIndex(p => 
      p.testDescription?.toUpperCase().includes(description.toUpperCase())
    );
  };

  // Calculate derived values
  const calculateDerivedValues = () => {
    const totalCholesterolIndex = findIndexByDescription('TOTAL CHOLESTEROL');
    const triglyceridesIndex = findIndexByDescription('TRIGLYCERIDES');
    const hdlCholesterolIndex = findIndexByDescription('HDL CHOLESTEROL - DIRECT');
    const ldlCholesterolIndex = findIndexByDescription('LDL CHOLESTEROL - DIRECT');
    const vldlCholesterolIndex = findIndexByDescription('VLDL CHOLESTEROL');

    const totalCholesterol = parseFloat(inputValues[testName]?.[totalCholesterolIndex] || '0') || 0;
    const triglycerides = parseFloat(inputValues[testName]?.[triglyceridesIndex] || '0') || 0;
    const hdlCholesterol = parseFloat(inputValues[testName]?.[hdlCholesterolIndex] || '0') || 0;

    // Calculate HDL Cholesterol: (TOTAL CHOLESTEROL * 2) / 5
    const calculatedHDL = totalCholesterol > 0 ? (totalCholesterol * 2) / 5 : 0;

    // Calculate LDL Cholesterol: TOTAL CHOLESTEROL - HDL CHOLESTEROL - DIRECT
    const calculatedLDL = totalCholesterol > 0 ? totalCholesterol - hdlCholesterol : 0;

    // Calculate VLDL Cholesterol: TRIGLYCERIDES / 5
    const calculatedVLDL = triglycerides > 0 ? triglycerides / 5 : 0;

    return {
      totalCholesterolIndex,
      triglyceridesIndex,
      hdlCholesterolIndex,
      ldlCholesterolIndex,
      vldlCholesterolIndex,
      totalCholesterol,
      triglycerides,
      hdlCholesterol,
      calculatedHDL,
      calculatedLDL,
      calculatedVLDL
    };
  };

  const derivedValues = useMemo(() => calculateDerivedValues(), [
    referencePoints,
    testName,
    inputValues[testName]?.[findIndexByDescription('TOTAL CHOLESTEROL')],
    inputValues[testName]?.[findIndexByDescription('TRIGLYCERIDES')],
    inputValues[testName]?.[findIndexByDescription('HDL CHOLESTEROL - DIRECT')]
  ]);

  // Update calculated fields when input values change
  useEffect(() => {
    if (isUpdating) return;

    const updateCalculatedFields = () => {
      if (derivedValues.totalCholesterol > 0) {
        // Update HDL Cholesterol
        if (derivedValues.hdlCholesterolIndex >= 0) {
          onInputChange(testName, derivedValues.hdlCholesterolIndex, derivedValues.calculatedHDL.toFixed(2));
        }
        
        // Update LDL Cholesterol
        if (derivedValues.ldlCholesterolIndex >= 0) {
          onInputChange(testName, derivedValues.ldlCholesterolIndex, Math.max(0, derivedValues.calculatedLDL).toFixed(2));
        }
      }

      if (derivedValues.triglycerides > 0) {
        // Update VLDL Cholesterol
        if (derivedValues.vldlCholesterolIndex >= 0) {
          onInputChange(testName, derivedValues.vldlCholesterolIndex, derivedValues.calculatedVLDL.toFixed(2));
        }
      }
    };

    if (updateTimeoutRef) {
      clearTimeout(updateTimeoutRef);
    }

    const timeoutId = setTimeout(() => {
      setIsUpdating(true);
      updateCalculatedFields();
      setTimeout(() => setIsUpdating(false), 100);
    }, 500);

    setUpdateTimeoutRef(timeoutId);

    return () => {
      if (updateTimeoutRef) {
        clearTimeout(updateTimeoutRef);
      }
    };
  }, [derivedValues.totalCholesterol, derivedValues.triglycerides, derivedValues.hdlCholesterol, testName, onInputChange, isUpdating]);

  return (
    <>
      {referencePoints.map((point, index) => {
        const currentValue = inputValues[testName]?.[index] || '';
        const status = getValueStatus(currentValue, point.minReferenceRange, point.maxReferenceRange);
        
        // Check if this is an auto-calculated field
        const isAutoField = point.testDescription?.toUpperCase().includes('HDL CHOLESTEROL - DIRECT') ||
                           point.testDescription?.toUpperCase().includes('LDL CHOLESTEROL - DIRECT') ||
                           point.testDescription?.toUpperCase().includes('VLDL CHOLESTEROL');

        // Get display value for auto-calculated fields
        let displayValue = currentValue;
        if (isAutoField) {
          if (point.testDescription?.toUpperCase().includes('HDL CHOLESTEROL - DIRECT')) {
            displayValue = derivedValues.calculatedHDL > 0 ? derivedValues.calculatedHDL.toFixed(2) : 'Auto-calculated';
          } else if (point.testDescription?.toUpperCase().includes('LDL CHOLESTEROL - DIRECT')) {
            displayValue = derivedValues.calculatedLDL > 0 ? Math.max(0, derivedValues.calculatedLDL).toFixed(2) : 'Auto-calculated';
          } else if (point.testDescription?.toUpperCase().includes('VLDL CHOLESTEROL')) {
            displayValue = derivedValues.calculatedVLDL > 0 ? derivedValues.calculatedVLDL.toFixed(2) : 'Auto-calculated';
          }
        }

        return (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-all relative ${isAutoField ? 'ml-4 border-l-4 border-l-green-400' : ''} ${getStatusColor(status)}`}
          >
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
                    <p className="font-medium text-gray-600">{isAutoField ? 'Calculated Value' : 'Enter Value'}</p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(status)}
                    <input
                      type="text"
                      className={`w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${isAutoField ? 'bg-gray-100 text-gray-600 cursor-not-allowed border-gray-300' : 'border-gray-300'}`}
                      placeholder={isAutoField ? 'Auto-calculated' : 'Enter value'}
                      value={isAutoField ? displayValue : currentValue}
                      disabled={isAutoField}
                      aria-readonly={isAutoField}
                      onChange={(e) => {
                        if (!isAutoField) {
                          const value = e.target.value;
                          if (value.startsWith('-')) {
                            return; // Don't allow negative values
                          }
                          onInputChange(testName, index, value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (!isAutoField && e.key === '-') {
                          e.preventDefault();
                        }
                      }}
                      readOnly={isAutoField}
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

export default LPTComponent;
