'use client';

import Tabs from '@/app/(admin)/_component/common/TabComponent';

import { useState } from 'react';
import { FaPerson } from "react-icons/fa6";
import PatientList from '../_component/dashboard/patient/PatientList';
import { PatientTabItem } from '@/types/patient/patient';


const tabs: PatientTabItem[] = [
    { id: 'patient', label: 'Patient', icon: <FaPerson className="text-xl" /> },
];



const Page = () => {
    const [selectedTab, setSelectedTab] = useState<string>('patient');
    
    return (
        <Tabs
            tabs={tabs}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab} // Pass tab change handler
        >
            {/* Render tab-specific content */}
            {selectedTab === 'patient' && <PatientList />}
          
            

        </Tabs>
    );
};

export default Page;
