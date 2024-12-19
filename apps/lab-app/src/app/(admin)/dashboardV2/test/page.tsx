'use client';

import TestDownload from '@/app/(admin)/_component/test/TestDownload';
import TestUpload from '@/app/(admin)/_component/test/TestUpload';
import TestLists from '@/app/(admin)/_component/test/TestList';
import Tabs from '@/app/(admin)/_component/TabComponent';
import { PackageTabItem } from '@/types/package/package';
import React from 'react';
import { RiTestTubeLine } from "react-icons/ri";
import { FaFileDownload } from 'react-icons/fa';
import { MdOutlineCloudUpload } from "react-icons/md";
import Loader from '../../_component/Loader';

const tabs: PackageTabItem[] = [
  { id: 'test', label: 'Test', icon: <RiTestTubeLine className="text-xl" /> },
  { id: 'upload', label: 'Upload', icon: <MdOutlineCloudUpload className="text-xl" /> },
  { id: 'download', label: 'Download', icon: <FaFileDownload className="text-xl" /> },
];

const Page = () => {
  const [selectedTab, setSelectedTab] = React.useState<string>('test'); // Default selected tab
  const [loading, setLoading] = React.useState<boolean>(false); // State for loader

  const handleTabChange = (tabId: string) => {
    setLoading(true); // Show loader
    setSelectedTab(tabId);

    // Immediately hide loader after updating tab
    setLoading(false);
  };

  return (
    <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
      <Tabs
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={handleTabChange} // Pass tab change handler
      >
        {loading ? (
          <Loader />
        ) : (
          <>
            {selectedTab === 'test' && <TestLists />}
            {selectedTab === 'upload' && <TestUpload />}
            {selectedTab === 'download' && <TestDownload />}
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Page;
