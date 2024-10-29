'use client';

import { CheckCircle, ClipboardList, HandCoinsIcon, XCircle } from 'lucide-react'; // Importing icons from lucide-react
import { useState } from 'react';
import CollectionTable from './_component/CollectionTable';
import PendingTable from './_component/PendingTable';
import RecivedTable from './_component/RecivedTable';
import RejectedTable from './_component/RejectedTable';

const Page = () => {
  const [activeTab, setActiveTab] = useState('Pending'); 

  return (
    <div className="container mx-auto p-4 ">
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
            <ClipboardList className="inline-block mr-1" /> {/* Icon for Pending */}
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
            <CheckCircle className="inline-block mr-1" /> {/* Icon for Collected */}
            Collected
          </button>
          {/* Received and Rejected */}
          <button
            onClick={() => setActiveTab('Recived')}
            className={`pb-2 transition-colors duration-300 border-b-2 font-semibold ${
              activeTab === 'Recived'
                ? 'border-purple-800 text-purple-800'
                : 'border-transparent text-zinc-900 hover:text-purple-600'
            }`}
          >
            <HandCoinsIcon className="inline-block mr-1" /> {/* Icon for Recived */}  
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
            <XCircle className="inline-block mr-1" /> {/* Icon for Rejected */}
            Rejected
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-sm rounded-md">
        {activeTab === 'Pending' && <PendingTable />}
        {activeTab === 'Collected' && <CollectionTable />}
        {activeTab === 'Recived' && <RecivedTable />}
        {activeTab === 'Rejected' && <RejectedTable />}        
      </div>
    </div>
  );
};

export default Page;
