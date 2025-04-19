'use client';

import React from 'react';
import BeataComponent from '../../component/common/BeataComponent';

const Page = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-semibold text-gray-900">Lab Billing Summary</h1>
        <p className="text-lg text-gray-600 mt-2">
          Review a comprehensive breakdown of all lab-related charges and billing information. 
          This section helps you track patient invoices, payment statuses, and service-wise costs.
        </p>
      </div>

      {/* Beta Notice */}
      <BeataComponent />
    </div>
  );
};

export default Page;
