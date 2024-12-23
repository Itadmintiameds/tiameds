'use client';

import Tabs from '@/app/(admin)/_component/common/TabComponent';

import { useState } from 'react';
import { FaPerson } from "react-icons/fa6";
import PatientList from '../_component/dashboard/patient/PatientList';
import AddPatient from '../_component/dashboard/patient/AddPatient';
import { PatientTabItem } from '@/types/patient/patient';
import Dashboard from '@/app/(admin)/_component/dashboard/stats/Dashboard';



const tabs: PatientTabItem[] = [
    // add patient tab
    { id: 'addPatient', label: 'Add Patient', icon: <FaPerson className="text-xl" /> },
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
            {selectedTab === 'dashboard' && <Dashboard />}
            {selectedTab === 'patient' && <PatientList />}
            {selectedTab === 'addPatient' && <AddPatient />}
            
           
        </Tabs>
    );
};

export default Page;
