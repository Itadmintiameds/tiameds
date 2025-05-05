'use client';

import React from 'react';
import BeataComponent from '../../component/common/BeataComponent';

const Page = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold text-gray-900">Lab Detailed Reports</h1>
        <p className="text-lg text-gray-600 mt-2">
          This section provides in-depth reports generated from lab tests and diagnostics. 
          We are currently refining this feature to offer more accurate and comprehensive insights.
        </p>
      </div>
      <BeataComponent />
    </div>
  );
};

export default Page;
