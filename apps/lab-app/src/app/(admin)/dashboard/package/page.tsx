// 'use client';

// import Package from '@/app/(admin)/component/package/Pakage';
// import Tabs from '@/app/(admin)/component/common/TabComponent';
// import { PackageTabItem } from '@/types/package/package';
// import React from 'react';
// import { CiViewList } from 'react-icons/ci';
// import { RiTestTubeLine } from "react-icons/ri";
// import PackageList from '../../component/package/PackageList';
// import Unauthorised from '../../component/Unauthorised';


// const tabs: PackageTabItem[] = [
//     { id: 'package', label: 'Package', icon: <RiTestTubeLine className="text-xl" /> },
//     { id: 'packageList', label: 'Package List', icon: <CiViewList className="text-xl" /> },
//     // { id: 'dashboard', label: 'Dashboard', icon: <CiViewList className="text-xl" /> },      
// ];

// const Page = () => {
//     const [selectedTab, setSelectedTab] = React.useState<string>('package');
    
//     return (
//         <Tabs
//             tabs={tabs}
//             selectedTab={selectedTab}
//             onTabChange={setSelectedTab} // Pass tab change handler
//         >
//             {/* Render tab-specific content */}
//             {selectedTab === 'package' && <Package />}
//             {selectedTab === 'packageList' && <PackageList />}
        

//         </Tabs>
//     );
// };

// export default Page;












'use client';

import React, { useEffect } from 'react';
import Package from '@/app/(admin)/component/package/Pakage';
import Tabs from '@/app/(admin)/component/common/TabComponent';
import { PackageTabItem } from '@/types/package/package';
import { CiViewList } from 'react-icons/ci';
import { RiTestTubeLine } from 'react-icons/ri';
import PackageList from '../../component/package/PackageList';
import Unauthorised from '../../component/Unauthorised';
import { useLabs } from '@/context/LabContext';

const allTabs: PackageTabItem[] = [
  { id: 'package', label: 'Package', icon: <RiTestTubeLine className="text-xl" /> },
  { id: 'packageList', label: 'Package List', icon: <CiViewList className="text-xl" /> },
];

const Page = () => {
  const [selectedTab, setSelectedTab] = React.useState<string>('package');
  const { loginedUser } = useLabs();

  const roles = loginedUser?.roles || [];
  const isAdmin = roles.includes('ADMIN');

  useEffect(() => {
    // Ensure selectedTab is valid in case role changes
    if (!isAdmin && selectedTab !== '') {
      setSelectedTab('');
    }
  }, [isAdmin]);

  return (
    <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
      {isAdmin ? (
        <Tabs
          tabs={allTabs}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        >
          {selectedTab === 'package' && <Package />}
          {selectedTab === 'packageList' && <PackageList />}
        </Tabs>
      ) : (
        <Unauthorised
          username={loginedUser?.username || ''}
          currentRoles={roles}
          notallowedRoles={['TECHNICIAN', 'DESKROLE']}
          allowedRoles={['ADMIN']}
        />
      )}
    </div>
  );
};

export default Page;
