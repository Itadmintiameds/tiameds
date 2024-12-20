'use client';

import React,{useState} from 'react'
import InsuranceList from '@/app/(admin)/_component/insurance/InsuranceList'    
import Loader from '@/app/(admin)/_component/Loader'
import Tabs from '@/app/(admin)/_component/TabComponent';
import { AiOutlineSafetyCertificate } from "react-icons/ai";


interface InsuranceTabItem {
    id: string;
    label: string;
    icon: React.ReactNode;
  }
  
  const tabs: InsuranceTabItem[] = [
    { id: 'insurance', label: 'Insurance', icon: <AiOutlineSafetyCertificate className="text-xl" /> },
  ];
  
  const Page = () => {
    const [selectedTab, setSelectedTab] = React.useState<string>('insurance');
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
              {selectedTab === 'insurance' && <InsuranceList />}
              
            </>
          )}
        </Tabs>
      </div>
    );
  };
  
  export default Page;
  