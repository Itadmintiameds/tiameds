'use client';

import { CheckCircle, ClipboardList, HandCoinsIcon } from 'lucide-react';
import { useState } from 'react';
import CollectionTable from './_component/CollectionTable';
import PendingTable from './_component/PendingTable';
import Button from '../../component/common/Button';
import CompletedTable from './_component/CompletedTable';

const collectionTab = [
  { name: 'Pending', icon: ClipboardList },
  { name: 'Collected', icon: CheckCircle },
  { name: 'Received', icon: HandCoinsIcon },
];

const Page = () => {
  const [activeTab, setActiveTab] = useState('Pending');

  return (
    <div className="container mx-auto p-4">
      <div className="border-b border-gray-300 mb-4 text-sm font-medium">
        <div className="flex space-x-4">
          {collectionTab.map((tab) => (
            <Button
              key={tab.name}
              text={''}
              onClick={() => setActiveTab(tab.name)}
              className={`pb-2 px-4 transition-all duration-300 border-b-2 font-semibold flex items-center gap-1
                ${activeTab === tab.name
                  ? 'border-primary text-primary' // Active tab styles
                  : 'border-transparent text-gray-500 hover:text-primary hover:border-primarylight' // Inactive tab styles
                }
              `}
            >
              <tab.icon
                className={`w-4 h-4 ${activeTab === tab.name ? 'text-textzinc' : 'text-gray-400'}`} // Adjusting icon color to match text color
              />
              <span className={`${activeTab === tab.name ? 'text-textzinc' : 'text-gray-500'}`}>{tab.name}</span> {/* Ensure text color updates */}
            </Button>
          ))}
        </div>
      </div>
      <div className="bg-white shadow-sm ">
        {activeTab === 'Pending' && <PendingTable />}
        {activeTab === 'Collected' && <CollectionTable />}
        {activeTab === 'Received' && <CompletedTable />}
      </div>
    </div>
  );
};

export default Page;
