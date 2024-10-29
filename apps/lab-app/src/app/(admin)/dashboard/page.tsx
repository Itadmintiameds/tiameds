'use client';

import { FilePlus, ShoppingBag } from 'lucide-react'; // Import the icons you want to use
import { useState } from 'react';
import Table from '../_component/PatientTable';

const Page = () => {
  const [activeTab, setActiveTab] = useState('purchases'); // Default active tab

  return (
    <div className="container mx-auto p-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-300 mb-4 text-sm font-thin">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`flex items-center pb-2 transition-colors duration-300 border-b-2 font-semibold ${
              activeTab === 'purchases'
                ? 'border-purple-800 text-purple-800'
                : 'border-transparent text-zinc-900 hover:text-purple-600'
            }`}
          >
            <ShoppingBag className="mr-1" />
            Purchases
          </button>
          <button
            onClick={() => setActiveTab('newBill')}
            className={`flex items-center pb-2 transition-colors duration-300 border-b-2 font-semibold ${
              activeTab === 'newBill'
                ? 'border-purple-800 text-purple-800'
                : 'border-transparent text-zinc-900 hover:text-purple-600'
            }`}
          >
            <FilePlus className="mr-1" /> {/* Add icon for New Bill */}
            New Bill
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-sm rounded-md">
        {activeTab === 'purchases' && (
          <div>
            <Table />
          </div>
        )}
        {activeTab === 'newBill' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-600">New Bill</h2>
            {/* Add your new bill or test content here */}
            <p className="text-gray-700">Create a new bill or perform a test here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
