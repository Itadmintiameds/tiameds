'use client';

import React,{useState} from 'react'
import InsuranceList from '@/app/(admin)/component/insurance/InsuranceList'    
import Loader from '@/app/(admin)/component/common/Loader'
import Tabs from '@/app/(admin)/component/common/TabComponent';
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
    const [selectedTab, setSelectedTab] = useState<string>('insurance');
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
  