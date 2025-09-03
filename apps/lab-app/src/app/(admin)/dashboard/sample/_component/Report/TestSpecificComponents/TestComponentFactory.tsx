import React from 'react';
import { TestList, TestReferancePoint } from '@/types/test/testlist';
import { TbTestPipe, TbCategory } from 'react-icons/tb';
import CBCComponent from './CBCComponent';
import LFTComponent from './LFTComponent';
import LPTComponent from './LPTComponent';
import HbA1cComponent from './HbA1cComponent';
import AECComponent from './AECComponent';
import RadiologyComponent from './RadiologyComponent';
import GenericTestComponent from './GenericTestComponent';

interface TestComponentFactoryProps {
  test: TestList;
  referencePoints: TestReferancePoint[];
  inputValues: Record<string, Record<string | number, string>>;
  onInputChange: (testName: string, index: number | string, value: string) => void;
  getValueStatus: (value: string, minRef: number | null, maxRef: number | null) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const TestComponentFactory: React.FC<TestComponentFactoryProps> = ({
  test,
  referencePoints,
  inputValues,
  onInputChange,
  getValueStatus,
  getStatusColor,
  getStatusIcon
}) => {
  // Determine which component to render based on test name
  const renderTestComponent = () => {
    switch (test.name.toUpperCase()) {
      case 'COMPLETE BLOOD COUNT (CBC)':
        return (
          <CBCComponent
            referencePoints={referencePoints}
            inputValues={inputValues}
            testName={test.name}
            onInputChange={onInputChange}
            getValueStatus={getValueStatus}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        );
      
      case 'LIVER FUNCTION TEST (LFT)':
        return (
          <LFTComponent
            referencePoints={referencePoints}
            inputValues={inputValues}
            testName={test.name}
            onInputChange={onInputChange}
            getValueStatus={getValueStatus}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        );
      
      case 'LIPID PROFILE TEST (LPT)':
        return (
          <LPTComponent
            referencePoints={referencePoints}
            inputValues={inputValues}
            testName={test.name}
            onInputChange={onInputChange}
            getValueStatus={getValueStatus}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        );
      
      case 'HB A1 C (GLYCOSYLATED HB)':
        return (
          <HbA1cComponent
            referencePoints={referencePoints}
            inputValues={inputValues}
            testName={test.name}
            onInputChange={onInputChange}
            getValueStatus={getValueStatus}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        );

      case 'AEC':
        return (
          <AECComponent
            referencePoints={referencePoints}
            inputValues={inputValues}
            testName={test.name}
            onInputChange={onInputChange}
            getValueStatus={getValueStatus}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        );

      // Add more test-specific components here as needed
      
      default:
        // Check if it's a radiology test by category
        if (test.category === 'RADIOLOGY') {
          return (
            <RadiologyComponent
              testName={test.name}
            />
          );
        }
        return (
          <GenericTestComponent
            referencePoints={referencePoints}
            inputValues={inputValues}
            testName={test.name}
            onInputChange={onInputChange}
            getValueStatus={getValueStatus}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        );
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center mb-4">
        <TbTestPipe className="text-blue-500 mr-2" size={20} />
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3 flex items-center">
            <TbCategory className="mr-1" size={14} />
            {test.category}
          </span>
          {test.name}
        </h3>
      </div>

      <div className="space-y-3">
        {renderTestComponent()}
      </div>
    </div>
  ); 
};

export default TestComponentFactory;
