'use client';
import { useState } from 'react';
import Tabs from '@/app/(admin)/component/common/TabComponent';
import { FaDatabase, FaDownload, FaFlask } from "react-icons/fa6";
import { MdDataset, MdLibraryBooks } from "react-icons/md";
import Lab from '../../component/lab/Lab';
import { GrDocumentTest } from "react-icons/gr";
import LabList from '../../component/lab/LabList';

interface Lab {
  id: string;
  label: string;
  icon: JSX.Element;
}
const tabs: Lab[] = [
  { id: 'Lab Create', label: 'Create New Lab', icon: <FaFlask className="text-xl" /> },
  { id: 'Lab List', label: 'Lab List', icon: <GrDocumentTest className="text-xl" /> },
  { id: 'Download Test', label: 'Download Test', icon: <FaDownload className="text-xl" /> },
  { id: 'Test Reference Parameters', label: 'Test Reference Parameters', icon: <MdLibraryBooks className="text-xl" /> },
  { id: 'Dump Test On Lab', label: 'Dump Test On Lab', icon: <MdDataset className="text-xl" /> },
  { id: 'Dump Test Reference On Lab', label: 'Dump Test Reference On Lab', icon: <FaDatabase className="text-xl" /> }
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
        {selectedTab === 'Download Test' && "Download Test Content"}
        {selectedTab === 'Test Reference Parameters' && "Test Reference Parameters Content"}
        {selectedTab === 'Dump Test On Lab' && "Dump Test On Lab Content"}
        {selectedTab === 'Dump Test Reference On Lab' && "Dump Test Reference On Lab Content"}
      </Tabs>
    </>
  );
};

export default Page;
