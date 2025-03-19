'use client'
import React, { useState } from 'react';
import SubTabComponent from '@/app/(admin)/component/common/SubTabComponent';
import { FiUsers, FiUserPlus } from 'react-icons/fi';
import ListOfActiveMemberOfLab from './ListOfActiveMemberOfLab';
import ListOfDeActiveMemberOfLab from './ListOfDeActiveMemberOfLab';

const ListOfMemberOfLab = () => {
    const [selectedTab, setSelectedTab] = useState('active-member');

    // Define tabs
    const tabs = [
        { id: 'active-member', label: 'Active Members', icon: <FiUsers /> },
        { id: 'deactive-member', label: 'Deactive Member', icon: <FiUserPlus /> },
    ];

    return (
        <div className="">
            <SubTabComponent
                tabs={tabs}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
            >
                {/* Tab Content */}
                {selectedTab === 'active-member' && <ListOfActiveMemberOfLab />}
                {selectedTab === 'deactive-member' && <ListOfDeActiveMemberOfLab />}
            </SubTabComponent>
        </div>
    );
};

export default ListOfMemberOfLab;
