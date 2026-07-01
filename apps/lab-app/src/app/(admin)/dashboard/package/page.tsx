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
import { RiTestTubeLine } from 'react-icons/ri';
import PackageList from '../../component/package/PackageList';
import Unauthorised from '../../component/Unauthorised';
// import { useLabs } from '@/context/LabContext';
import useAuthStore from '@/context/userStore';

const navItems = [
  { id: 'packageList', label: 'Package List' },
  { id: 'package', label: 'Add Package' },
];

const Page = () => {
  const [selectedTab, setSelectedTab] = React.useState<string>('package');
  const { user: loginedUser } = useAuthStore();

  const roles = loginedUser?.roles || [];
  const isAdmin = roles.includes('ADMIN');
  const isSuperAdmin = roles.includes('SUPERADMIN');

  useEffect(() => {
    // Ensure selectedTab is valid in case role changes
    if (isAdmin && isSuperAdmin) {
      setSelectedTab('package'); // Default to package tab for admins
    }
  }, []);

  return (
    <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
      {isAdmin || isSuperAdmin ? (
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <aside className="w-full md:w-60 shrink-0 space-y-2">
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}
            >
              <RiTestTubeLine className="text-lg" />
              Package Management
            </div>
            <nav className="space-y-1 pl-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedTab(item.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${selectedTab === item.id
                    ? 'border border-gray-300 font-medium text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 w-full min-w-0">
            {selectedTab === 'package' && <Package />}
            {selectedTab === 'packageList' && <PackageList />}
          </div>
        </div>
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