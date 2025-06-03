'use client';
import Tabs from '@/app/(admin)/component/common/TabComponent';
import TestLists from '@/app/(admin)/component/test/TestList';
import TestUpload from '@/app/(admin)/component/test/TestUpload';
import { PackageTabItem } from '@/types/package/package';
import React from 'react';
import { MdOutlineCloudUpload } from "react-icons/md";
import { RiTestTubeLine } from "react-icons/ri";
import { VscReferences } from "react-icons/vsc";
import Loader from '../../component/common/Loader';
import TestReferancePoints from '../../component/test/TestReferancePoints';
import UploadTestReference from '../../component/test/UploadTestReference';

const tabs: PackageTabItem[] = [
  { id: 'test', label: 'Test', icon: <RiTestTubeLine className="text-xl" /> },
  // { id: 'download', label: 'Download', icon: <FaFileDownload className="text-xl" /> },
  { id:'test-referance-point', label: 'Test Referance range', icon: <VscReferences className="text-xl" />},
  { id: 'upload', label: 'Upload', icon: <MdOutlineCloudUpload className="text-xl" /> },
  { id: 'upload-referance', label: 'Upload Referance', icon: <MdOutlineCloudUpload className="text-xl" /> },
  // { id: 'download-referance', label: 'Download Referance', icon: <FaFileDownload className="text-xl" /> },
];

const Page = () => {
  const [selectedTab, setSelectedTab] = React.useState<string>('test'); 
  const [loading, setLoading] = React.useState<boolean>(false); 

  const handleTabChange = (tabId: string) => {
    setLoading(true); // Show loader
    setSelectedTab(tabId);
    setLoading(false);
  };

  return (
    <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
      <Tabs
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
      >
        {loading ? (
          <Loader />
        ) : (
          <>
            {selectedTab === 'test' && <TestLists />}
            {selectedTab === 'upload' && <TestUpload />}
            {/* {selectedTab === 'download' && <TestDownload />} */}
            {selectedTab === 'test-referance-point' && <TestReferancePoints />}
            {selectedTab === 'upload-referance' && <UploadTestReference />}
            {/* {selectedTab === 'download-referance' && <DownloadReferanceRangeExcel />} */}
          </>
        )}
      </Tabs>
    </div>
  );
};
export default Page;
