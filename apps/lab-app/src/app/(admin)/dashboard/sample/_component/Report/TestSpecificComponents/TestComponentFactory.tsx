import React from 'react';
import { TestList, TestReferancePoint } from '@/types/test/testlist';
import { TbTestPipe, TbCategory } from 'react-icons/tb';
import CBCComponent from './CBCComponent';
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
      
      // Add more test-specific components here as needed
      // case 'LIVER FUNCTION TEST (LFT)':
      //   return <LFTComponent {...props} />;
      
      // case 'KIDNEY FUNCTION TEST (KFT)':
      //   return <KFTComponent {...props} />;
      
      default:
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
