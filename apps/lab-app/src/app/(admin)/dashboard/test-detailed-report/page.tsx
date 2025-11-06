'use client';

import React from 'react';
import DetailedReportEditor from '../sample/_component/Report/DetailedReportEditor';
import { TestReferancePoint } from '@/types/test/testlist';

const TestDetailedReportPage = () => {
 
  const handleReportJsonChange = (reportJson: string) => {
    console.log('Report JSON changed:', reportJson);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Detailed Report Editor Test</h1>
          <p className="mt-2 text-gray-600">
            This page demonstrates the DetailedReportEditor component with sample API data.
          </p>
        </div>
        
        {/* <DetailedReportEditor 
          point={sampleData} 
          onReportJsonChange={handleReportJsonChange}
        /> */}
      </div>
    </div>
  );
};

export default TestDetailedReportPage;

