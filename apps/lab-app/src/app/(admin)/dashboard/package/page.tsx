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

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Package from '@/app/(admin)/component/package/Pakage';
import PackageList from '../../component/package/PackageList';
import Unauthorised from '../../component/Unauthorised';
import useAuthStore from '@/context/userStore';

const PackageContent = () => {
  const searchParams = useSearchParams();

  const tab = searchParams.get('tab') || 'packageList';

  switch (tab) {
    case 'package':
      return <Package />;

    case 'packageList':
      return <PackageList />;

    default:
      return <PackageList />;
  }
};

const Page = () => {
  const { user: loginedUser } = useAuthStore();

  const roles = loginedUser?.roles || [];
  const isAdmin = roles.includes('ADMIN');
  const isSuperAdmin = roles.includes('SUPERADMIN');

  return (
    <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
      {isAdmin || isSuperAdmin ? (
        <Suspense fallback={<div>Loading...</div>}>
          <PackageContent />
        </Suspense>
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