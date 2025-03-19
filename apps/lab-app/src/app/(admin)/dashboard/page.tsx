'use client';
import Tabs from '@/app/(admin)/component/common/TabComponent';
import Patient from '@/app/(admin)/component/dashboard/patient/patient';
import { PatientTabItem } from '@/types/patient/patient';
import { useState } from 'react';
import { FaPerson } from "react-icons/fa6";
import { MdOutlineDashboard } from "react-icons/md";
import Statistics from '../component/dashboard/statistics/Statistics';

const tabs: PatientTabItem[] = [
    { id: 'patient', label: 'Patients', icon: <FaPerson className="text-xl" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <MdOutlineDashboard className="text-xl" /> }
];

const Page = () => {
    const [selectedTab, setSelectedTab] = useState<string>('patient');
    return (
       <>
        <Tabs
            tabs={tabs}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
        >
            {selectedTab === 'patient' && <Patient />}
            {selectedTab === 'dashboard' && <Statistics />}
        </Tabs>
       </>
    );
};

export default Page;



