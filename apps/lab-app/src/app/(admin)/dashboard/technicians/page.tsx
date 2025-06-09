'use client';
import Tabs from '@/app/(admin)/component/common/TabComponent';
import { useState } from 'react';
import { FaPersonChalkboard, FaPersonCirclePlus } from "react-icons/fa6";
import  ListOfMemberOfLab  from './_component/ListOfMemberOfLab';
import AddMemberOnLab from './_component/AddMemberOnLab';

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
    const [selectedTab, setSelectedTab] = useState<string>('Add Technician');
    return (
        <>
            <Tabs
                tabs={tabs}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
            >
                {selectedTab === 'Add Technician' && <AddMemberOnLab />}
                {selectedTab === 'Manage Technicians' && <ListOfMemberOfLab />}

            </Tabs>
        </>
    );
};

export default Page;
