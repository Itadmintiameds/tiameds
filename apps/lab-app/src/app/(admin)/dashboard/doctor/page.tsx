'use client';

import Tabs from '@/app/(admin)/component/common/TabComponent';
import React from 'react';
import { FaUserDoctor } from "react-icons/fa6";
import DoctorList from '@/app/(admin)/component/doctor/DoctorList';
import Loader from '@/app/(admin)/component/common/Loader';

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
    <div className="p-6">
      <Tabs
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={handleTabChange} // Pass tab change handler
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-6">
            <Loader type="progress" fullScreen={false} text="Loading..." />
            <p className="mt-4 text-sm text-gray-600">Please wait while we load the data...</p>
          </div>
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
