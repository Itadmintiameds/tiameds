'use client';

import Tabs from '@/app/(admin)/_component/TabComponent';
import React from 'react';
import { FaUserDoctor } from "react-icons/fa6";
import DoctorList from '@/app/(admin)/_component/doctor/DoctorList';
import Loader from '@/app/(admin)/_component/Loader';

interface DoctorTabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: DoctorTabItem[] = [
  { id: 'doctor', label: 'Doctor', icon: <FaUserDoctor className="text-xl" /> },
];

const Page = () => {
  const [selectedTab, setSelectedTab] = React.useState<string>('doctor');
  const [loading, setLoading] = React.useState<boolean>(false);

  // Update the tab change logic to only set state
  const handleTabChange = (tabId: string) => {
    setLoading(true);
    setSelectedTab(tabId);
    setLoading(false); // Disable loading once the tab is changed
  };

  return (
    <div>
      <Tabs
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={handleTabChange} // Pass tab change handler
      >
        {loading ? (
          <Loader />
        ) : (
          <>
            {selectedTab === 'doctor' && <DoctorList />}
            
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Page;
