'use client';

import Tabs from '@/app/(admin)/_component/common/TabComponent';

import Patient from '@/app/(admin)/_component/dashboard/patient/patient';
import { PatientTabItem } from '@/types/patient/patient';
import { useState } from 'react';
import { FaPerson } from "react-icons/fa6";


const tabs: PatientTabItem[] = [
    { id: 'patient', label: 'Patients', icon: <FaPerson className="text-xl" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <FaPerson className="text-xl" /> },
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
            {selectedTab === 'patient' && <Patient />}

        </Tabs>
    );
};

export default Page;
