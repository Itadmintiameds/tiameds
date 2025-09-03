import React, { useEffect } from 'react';
import { TestReferancePoint } from '@/types/test/testlist';
import { TbChartLine, TbClipboardText, TbNumbers, TbRuler, TbCalculator } from 'react-icons/tb';

interface LFTComponentProps {
  referencePoints: TestReferancePoint[];
  inputValues: Record<string, Record<string | number, string>>;
  testName: string;
  onInputChange: (testName: string, index: number | string, value: string) => void;
  getValueStatus: (value: string, minRef: number | null, maxRef: number | null) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const LFTComponent: React.FC<LFTComponentProps> = ({
  referencePoints,
  inputValues,
  testName,
  onInputChange,
  getValueStatus,
  getStatusColor,
  getStatusIcon
}) => {
  // LFT field ordering
  const lftOrder = [
    'TOTAL PROTEIN',
    'S.ALBUMIN',
    'S.GLOBULIN',
    'A/G RATIO',
    'TOTAL BILIRUBIN',
    'DIRECT BILIRUBIN',
    'INDIRECT BILIRUBIN'
  ];

  // Sort LFT fields in correct order
  const sortLTFFields = (referenceData: TestReferancePoint[]) => {
    return referenceData.sort((a, b) => {
      const aIndex = lftOrder.findIndex(item =>
        a.testDescription?.toUpperCase().includes(item) ||
        a.testDescription?.toUpperCase() === item
      );
      const bIndex = lftOrder.findIndex(item =>
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
  const findIndexByDescription = (searchTerm: string, exactMatch = false) => {
    return referencePoints.findIndex(point => {
      const description = point.testDescription?.toUpperCase() || '';
      return exactMatch
        ? description === searchTerm
        : description.includes(searchTerm);
    });
  };

  // Auto-calculate S.GLOBULIN and INDIRECT BILIRUBIN
  const calculateDerivedValues = () => {
    // Find the indices for the required fields using the helper function
    const totalProteinIndex = findIndexByDescription('TOTAL PROTEIN');
    const sAlbuminIndex = findIndexByDescription('S.ALBUMIN') || findIndexByDescription('ALBUMIN');
    const totalBilirubinIndex = findIndexByDescription('TOTAL BILIRUBIN');
    const directBilirubinIndex = findIndexByDescription('DIRECT BILIRUBIN');

    const totalProteinRaw = (inputValues[testName]?.[totalProteinIndex] || '').trim();
    const sAlbuminRaw = (inputValues[testName]?.[sAlbuminIndex] || '').trim();
    const totalBilirubinRaw = (inputValues[testName]?.[totalBilirubinIndex] || '').trim();
    const directBilirubinRaw = (inputValues[testName]?.[directBilirubinIndex] || '').trim();

    const totalProtein = parseFloat(totalProteinRaw || '0');
    const sAlbumin = parseFloat(sAlbuminRaw || '0');
    const totalBilirubin = parseFloat(totalBilirubinRaw || '0');
    const directBilirubin = parseFloat(directBilirubinRaw || '0');

    // Calculate S.GLOBULIN = TOTAL PROTEIN - S.ALBUMIN
    const sGlobulin = totalProtein - sAlbumin;

    // Calculate INDIRECT BILIRUBIN = TOTAL BILIRUBIN - DIRECT BILIRUBIN
    // Only calculate if BOTH fields are filled and valid
    const hasBothBiliInputs = totalBilirubinRaw !== '' && directBilirubinRaw !== '';
    let indirectBilirubin = NaN;
    if (hasBothBiliInputs && totalBilirubin >= 0 && directBilirubin >= 0 && totalBilirubin >= directBilirubin) {
      indirectBilirubin = totalBilirubin - directBilirubin;
    }


    return {
      sGlobulin: isNaN(sGlobulin) ? 0 : sGlobulin,
      indirectBilirubin,
      totalProteinRaw,
      sAlbuminRaw,
      totalBilirubinRaw,
      directBilirubinRaw,
      totalProteinIndex,
      sAlbuminIndex,
      totalBilirubinIndex,
      directBilirubinIndex
    };
  };

  // Check if field is auto-calculated
  const isAutoCalculatedField = (point: TestReferancePoint) => {
    const autoFields = ['S.GLOBULIN', 'INDIRECT BILIRUBIN', 'A/G RATIO'];
    return autoFields.some(field =>
      point.testDescription?.toUpperCase().includes(field)
    );
  };

  // Check if this is the first LFT field
  const isFirstLTFField = (point: TestReferancePoint) => {
    return point.testDescription?.toUpperCase().includes('TOTAL PROTEIN');
  };

  // Check if this is the A/G RATIO field
  const isAGRatioField = (point: TestReferancePoint) => {
    return point.testDescription?.toUpperCase().includes('A/G RATIO');
  };

  // Calculate A/G RATIO when both TOTAL PROTEIN and S.ALBUMIN are available
  const calculateAGRatio = () => {
    const { totalProteinIndex, sAlbuminIndex } = calculateDerivedValues();

    if (totalProteinIndex !== -1 && sAlbuminIndex !== -1) {
      const totalProtein = parseFloat(inputValues[testName]?.[totalProteinIndex] || '0');
      const sAlbumin = parseFloat(inputValues[testName]?.[sAlbuminIndex] || '0');

      if (totalProtein > 0 && sAlbumin > 0) {
        const sGlobulin = totalProtein - sAlbumin;
        if (sGlobulin > 0) {
          return (sAlbumin / sGlobulin).toFixed(2);
        }
      }
    }
    return '';
  };

  const sortedPoints = sortLTFFields(referencePoints);

  // Memoize calculations to prevent infinite loops
  const derivedValues = React.useMemo(() => calculateDerivedValues(), [
    referencePoints,
    testName,
    // Only depend on the specific input values we need, not the entire inputValues object
    inputValues[testName]?.[referencePoints.findIndex(p => p.testDescription?.toUpperCase().includes('TOTAL PROTEIN'))],
    inputValues[testName]?.[referencePoints.findIndex(p => p.testDescription?.toUpperCase().includes('S.ALBUMIN'))],
    inputValues[testName]?.[referencePoints.findIndex(p => p.testDescription?.toUpperCase().includes('TOTAL BILIRUBIN'))],
    inputValues[testName]?.[referencePoints.findIndex(p => p.testDescription?.toUpperCase().includes('DIRECT BILIRUBIN'))]
  ]);

  const agRatio = React.useMemo(() => calculateAGRatio(), [
    derivedValues.totalProteinIndex,
    derivedValues.sAlbuminIndex,
    inputValues[testName]?.[derivedValues.totalProteinIndex],
    inputValues[testName]?.[derivedValues.sAlbuminIndex]
  ]);

  useEffect(() => {
    if (!derivedValues) return;

    const sGlobulinIndex = referencePoints.findIndex(point =>
      point.testDescription?.toUpperCase().includes('S.GLOBULIN')
    );
    const indirectBilirubinIndex = referencePoints.findIndex(point =>
      point.testDescription?.toUpperCase().includes('INDIRECT BILIRUBIN')
    );
    const agRatioIndex = referencePoints.findIndex(point =>
      point.testDescription?.toUpperCase().includes('A/G RATIO')
    );

    // Update S.GLOBULIN
    if (!isNaN(derivedValues.sGlobulin) && sGlobulinIndex !== -1) {
      const newValue = derivedValues.sGlobulin.toFixed(2);
      const currentValue = (inputValues[testName]?.[sGlobulinIndex] || '').trim();
      if (parseFloat(currentValue) !== parseFloat(newValue)) {
        onInputChange(testName, sGlobulinIndex, newValue);
      }
    }

    // Update INDIRECT BILIRUBIN only when BOTH inputs are filled; otherwise clear
    if (indirectBilirubinIndex !== -1) {
      const currentValue = (inputValues[testName]?.[indirectBilirubinIndex] || '').trim();
      const hasBothBiliInputs = derivedValues.totalBilirubinRaw !== '' && derivedValues.directBilirubinRaw !== '';
      if (hasBothBiliInputs && !isNaN(derivedValues.indirectBilirubin)) {
        const newValue = derivedValues.indirectBilirubin.toFixed(2);
        if (parseFloat(currentValue) !== parseFloat(newValue)) {
          onInputChange(testName, indirectBilirubinIndex, newValue);
        }
      } else if (currentValue !== '') {
        onInputChange(testName, indirectBilirubinIndex, '');
      }
    }

    // Update A/G RATIO only when both TOTAL PROTEIN and S.ALBUMIN are filled; otherwise clear
    if (agRatioIndex !== -1) {
      const currentValue = (inputValues[testName]?.[agRatioIndex] || '').trim();
      const hasBothAlbuminInputs = derivedValues.totalProteinRaw !== '' && derivedValues.sAlbuminRaw !== '';
      if (hasBothAlbuminInputs && agRatio) {
        const newValue = parseFloat(agRatio).toFixed(2);
        if (parseFloat(currentValue) !== parseFloat(newValue)) {
          onInputChange(testName, agRatioIndex, newValue);
        }
      } else if (currentValue !== '') {
        onInputChange(testName, agRatioIndex, '');
      }
    }
  }, [derivedValues.sGlobulin, derivedValues.indirectBilirubin, agRatio, referencePoints, testName, onInputChange]);



  return (
    <>


      {/* LFT Fields */}
      {sortedPoints.map((point, index) => {
        const currentValue = inputValues[testName]?.[index] || '';
        const isAutoField = isAutoCalculatedField(point);
        const isFirstLFT = isFirstLTFField(point);
        const isAGRatio = isAGRatioField(point);
        const status = getValueStatus(currentValue, point.minReferenceRange, point.maxReferenceRange);

        // Determine the actual value to display
        let displayValue = currentValue;
        let isReadOnly = false;

        if (point.testDescription?.toUpperCase().includes('S.GLOBULIN')) {
          displayValue = (derivedValues.totalProteinRaw !== '' && derivedValues.sAlbuminRaw !== '' && derivedValues.sGlobulin > 0)
            ? derivedValues.sGlobulin.toFixed(2)
            : '';
          isReadOnly = true;
        } else if (point.testDescription?.toUpperCase().includes('INDIRECT BILIRUBIN')) {
          const canShowIB = derivedValues.totalBilirubinRaw !== '' && derivedValues.directBilirubinRaw !== '' && !isNaN(derivedValues.indirectBilirubin);
          displayValue = canShowIB ? derivedValues.indirectBilirubin.toFixed(2) : '';
          isReadOnly = true;
        } else if (isAGRatio) {
          const canShowAG = derivedValues.totalProteinRaw !== '' && derivedValues.sAlbuminRaw !== '' && agRatio;
          displayValue = canShowAG ? agRatio : '';
          isReadOnly = true;
        }

        return (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-all relative ${isAutoField ? 'ml-4 border-l-4 border-l-green-400 bg-green-50' : ''
              } ${getStatusColor(status)}`}
          >
            {/* LFT Heading */}
            {isFirstLFT && (
              <div className="mb-3 pb-2 border-b border-blue-200">
                <h4 className="text-sm font-semibold text-blue-700 flex items-center">
                  <TbChartLine className="mr-2" size={16} />
                  Liver Function Test (LFT):
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
                      onChange={(e) => {
                        if (!isReadOnly) {
                          const value = e.target.value;
                          // Prevent negative values for non-auto-populated fields
                          if (!isAutoField && value.startsWith('-')) {
                            return; // Don't allow negative values
                          }
                          onInputChange(testName, index, value);
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent typing minus sign for non-auto-populated fields
                        if (!isReadOnly && !isAutoField && e.key === '-') {
                          e.preventDefault();
                        }
                      }}
                      readOnly={isReadOnly}
                      disabled={isReadOnly}
                      aria-readonly={isReadOnly}
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

export default LFTComponent;