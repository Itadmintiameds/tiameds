'use client';

import React from 'react';
import BeataComponent from '../../component/common/BeataComponent';

const Page = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-semibold text-gray-900">Lab Inventory Summary</h1>
        <p className="text-lg text-gray-600 mt-2">
          This module provides a centralized summary of laboratory inventory across your diagnostic center, 
          including medical supplies, testing kits, reagents, and diagnostic equipment. 
          Monitor stock levels, usage trends, and ensure timely restocking of critical items.
        </p>
      </div>

      {/* Beta Notice */}
      <BeataComponent />
    </div>
  );
};

export default Page;
