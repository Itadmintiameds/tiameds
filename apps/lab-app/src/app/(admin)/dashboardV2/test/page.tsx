'use client'

import { FC, ReactNode, useState } from 'react';
import { FaFileDownload, FaPlus } from 'react-icons/fa';
import { MdOutlineCloudUpload } from "react-icons/md";
import { RiTestTubeLine } from "react-icons/ri";


import TestLists from '@/app/(admin)/_component/test/TestList';
import AddTest from '../../_component/test/AddTest';
import TestDownload from '../../_component/test/TestDownload';
import TestUpload from '../../_component/test/TestUpload';


// Define a type for Tab items
type TabItem = {
  id: string;
  label: string;
  icon: ReactNode;
};

// Tabs Component
const Tabs: FC = () => {
  // State to track the selected tab
  const [selectedTab, setSelectedTab] = useState<string>('test');

  // Tab data
  const tabs: TabItem[] = [
    { id: 'test', label: 'Test', icon: <RiTestTubeLine className="text-xl" /> },
    // { id: 'create-test', label: 'Test', icon: <FaPlus className="text-xl" /> },
    { id: 'upload', label: 'upload', icon: <MdOutlineCloudUpload className="text-xl" /> },
    { id: 'download', label: 'download', icon: <FaFileDownload className="text-xl" /> },
  ];

  return (
    <div className="flex flex-col items-start p-4">
      {/* Tab buttons - Shifted to left */}
      <div className="flex space-x-6 mb-4 justify-start">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center px-4 py-2 rounded-lg text-xs transition-all duration-300 focus:outline-none ${selectedTab === tab.id
              ? 'bg-indigo-800 text-white scale-105'
              : 'bg-gray-300 text-gray-600 hover:bg-indigo-200'
              }`}
            onClick={() => setSelectedTab(tab.id)}
          >
            <span className="mr-2">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
        {selectedTab === 'test' && <TestLists />}
        {/* {selectedTab === 'create-test' && <AddTest />} */}
        {selectedTab === 'upload' && <TestUpload />}
        {selectedTab === 'download' && <TestDownload />}
      </div>
    </div>
  );
};

export default Tabs;

