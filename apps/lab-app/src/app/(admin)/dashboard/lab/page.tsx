'use client';
import Tabs from '@/app/(admin)/component/common/TabComponent';
import { useState } from 'react';
import { FaFlask } from "react-icons/fa6";
import { GrDocumentTest } from "react-icons/gr";
import Lab from '../../component/lab/Lab';
import LabList from '../../component/lab/LabList';
import { FaDownload } from "react-icons/fa";
import { MdLibraryBooks } from "react-icons/md";
import TestPriceList from '../../component/lab/TestPriceList';
import TestReferanceList from '../../component/lab/TestReferanceList';

interface Lab {
  id: string;
  label: string;
  icon: JSX.Element;
}
const tabs: Lab[] = [
  { id: 'Lab Create', label: 'Create New Lab', icon: <FaFlask className="text-xl" /> },
  { id: 'Lab List', label: 'Lab List', icon: <GrDocumentTest className="text-xl" /> },
  { id: 'Download Test', label: 'Test Price List', icon: <FaDownload className="text-xl" /> },
  { id: 'Test Reference Parameters', label: 'Test Reference Parameters', icon: <MdLibraryBooks className="text-xl" /> },
];

const Page = () => {
  const [selectedTab, setSelectedTab] = useState<string>('Lab Create');

  return (
    <>
      <Tabs
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      >
        {selectedTab === 'Lab Create' && <Lab />}
        {selectedTab === 'Lab List' && <LabList />}
        {selectedTab === 'Download Test' && <TestPriceList />}
        {selectedTab === 'Test Reference Parameters' && <TestReferanceList />}
      </Tabs>
    </>
  );
};

export default Page;
