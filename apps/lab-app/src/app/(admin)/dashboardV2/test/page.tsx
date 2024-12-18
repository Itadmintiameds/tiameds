'use client'

import React,{useState} from 'react';
import { FaFileDownload } from 'react-icons/fa';
import { MdOutlineCloudUpload } from "react-icons/md";
import { RiTestTubeLine } from "react-icons/ri";


import TabComponent from '@/app/(admin)/_component/TabComponent';
import TestDownload from '@/app/(admin)/_component/test/TestDownload';
import TestLists from '@/app/(admin)/_component/test/TestList';
import TestUpload from '@/app/(admin)/_component/test/TestUpload';


// Define a type for Tab items


interface PackageTabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const tabs: PackageTabItem[] = [
  { id: 'test', label: 'Test', icon: <RiTestTubeLine className="text-xl" /> },
  // { id: 'create-test', label: 'Test', icon: <FaPlus className="text-xl" /> },
  { id: 'upload', label: 'upload', icon: <MdOutlineCloudUpload className="text-xl" /> },
  { id: 'download', label: 'download', icon: <FaFileDownload className="text-xl" /> },
];



const Page = () => {
  const [selectedTab, setSelectedTab] = useState<string>('test'); // Default selected

  return (
    <TabComponent
      tabs={tabs}
      selectedTab={selectedTab}
      onTabChange={setSelectedTab} // Pass tab change handler
    >
      <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
        {selectedTab === 'test' && <TestLists />}
        {/* {selectedTab === 'create-test' && <AddTest />} */}
        {selectedTab === 'upload' && <TestUpload />}
        {selectedTab === 'download' && <TestDownload />}
      </div>
    </TabComponent>
  );
}

export default Page;

