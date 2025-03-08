'use client';
import Tabs from '@/app/(admin)/component/common/TabComponent';
import { useState } from 'react';
import { FaPersonChalkboard, FaPersonCirclePlus } from "react-icons/fa6";


interface TechnicianTab {
    id: string;
    label: string;
    icon: JSX.Element;
}

const tabs: TechnicianTab[] = [
    { id: 'Add Technician', label: 'Add Technician', icon: <FaPersonCirclePlus className="text-xl" /> },
    { id: 'Manage Technicians', label: 'Manage Technicians', icon: <FaPersonChalkboard className="text-xl" /> },

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
                {selectedTab === 'Add Technician' && "Add Technician Content"}
                {selectedTab === 'Manage Technicians' && "Manage Technicians Content"}

            </Tabs>
        </>
    );
};

export default Page;
