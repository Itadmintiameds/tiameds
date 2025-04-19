'use client';

import React from 'react';
import PatientList from '@/app/(admin)/component/dashboard/patient/PatientList';

const Page = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-semibold text-gray-900">Patient Management</h1>
        <p className="text-lg text-gray-600 mt-2">
          View and manage all patient records in one place. Use the table below to search, filter, and update patient information efficiently.
        </p>
      </div>

      {/* Patient List Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <PatientList />
      </div>
    </div>
  );
};

export default Page;
