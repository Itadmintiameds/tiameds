'use client';

import React, { useState } from 'react';
import PendingTable from './_component/PendingTable';
import CollectionTable from './_component/CollectionTable';
import RecivedTable from './_component/RecivedTable';
import RejectedTable from './_component/RejectedTable';



const Page = () => {
  const [activeTab, setActiveTab] = useState('Pending'); 

  return (
    <div className="container mx-auto p-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-300 mb-4 text-sm font-thin">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('Pending')}
            className={`pb-2 transition-colors duration-300 border-b-2 font-semibold ${
              activeTab === 'Pending'
                ? 'border-purple-800 text-purple-800'
                : 'border-transparent text-zinc-900 hover:text-purple-600'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('Collected')}
            className={`pb-2 transition-colors duration-300 border-b-2 font-semibold ${
              activeTab === 'Collected'
                ? 'border-purple-800 text-purple-800'
                : 'border-transparent text-zinc-900 hover:text-purple-600'
            }`}
          >
            Collected
          </button>
          {/* Recived   and Rejected */}
            <button
                onClick={() => setActiveTab('Recived')}
                className={`pb-2 transition-colors duration-300 border-b-2 font-semibold ${
                activeTab === 'Recived'
                    ? 'border-purple-800 text-purple-800'
                    : 'border-transparent text-zinc-900 hover:text-purple-600'
                }`}
            >
                Recived
            </button>
            <button
                onClick={() => setActiveTab('Rejected')}
                className={`pb-2 transition-colors duration-300 border-b-2 font-semibold ${
                activeTab === 'Rejected'
                    ? 'border-purple-800 text-purple-800'
                    : 'border-transparent text-zinc-900 hover:text-purple-600'
                }`}
            >
                Rejected
            </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-sm rounded-md">
        {activeTab === 'Pending' && (
          <div>
            <PendingTable />
          </div>
        )}
    
        {activeTab === 'Collected' && (
          <div>
            <CollectionTable />
          </div>
        )}
        {activeTab === 'Recived' && (
          <div>
            <RecivedTable />
          </div>
        )}
        {activeTab === 'Rejected' && (
          <div>
            <RejectedTable />   
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Page;
