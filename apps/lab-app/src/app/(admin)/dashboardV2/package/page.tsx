'use client';

import Package from '@/app/(admin)/_component/package/Pakage';
import Tabs from '@/app/(admin)/_component/TabComponent';
import { PackageTabItem } from '@/types/package/package';
import React from 'react';
import { CiViewList } from 'react-icons/ci';
import { RiTestTubeLine } from "react-icons/ri";
import PackageList from '../../_component/package/PackageList';

const tabs: PackageTabItem[] = [
    { id: 'package', label: 'Package', icon: <RiTestTubeLine className="text-xl" /> },
    { id: 'packageList', label: 'Package List', icon: <CiViewList className="text-xl" /> },
];

const Page = () => {
    const [selectedTab, setSelectedTab] = React.useState<string>('package');
    
    return (
        <Tabs
            tabs={tabs}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab} // Pass tab change handler
        >
            {/* Render tab-specific content */}
            {selectedTab === 'package' && <Package />}
            {selectedTab === 'packageList' && <PackageList />}

        </Tabs>
    );
};

export default Page;
