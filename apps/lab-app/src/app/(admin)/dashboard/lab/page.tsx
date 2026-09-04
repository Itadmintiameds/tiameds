'use client';

import React, { useEffect } from 'react';
import Unauthorised from '../../component/Unauthorised';
import useAuthStore from '@/context/userStore';
import { FaFlask } from "react-icons/fa6";
import { GrDocumentTest } from "react-icons/gr";
import { FaDownload } from "react-icons/fa";
import { MdLibraryBooks } from "react-icons/md";
import { MdSync } from "react-icons/md";
import Lab from '../../component/lab/Lab';
import LabList from '../../component/lab/LabList';
import TestPriceList from '../../component/lab/TestPriceList';
import TestReferanceList from '../../component/lab/TestReferanceList';
import CategoryRollupBackfill from '../../component/lab/CategoryRollupBackfill';

interface LabTab {
  id: string;
  label: string;
  icon: JSX.Element;
}

const allTabs: LabTab[] = [
  {
    id: 'Lab Create',
    label: 'Create New Lab',
    icon: <FaFlask className="text-xl" />,
  },
  {
    id: 'Lab List',
    label: 'Lab List',
    icon: <GrDocumentTest className="text-xl" />,
  },
  {
    id: 'Download Test',
    label: 'Test Price List',
    icon: <FaDownload className="text-xl" />,
  },
  {
    id: 'Test Reference Parameters',
    label: 'Test Reference',
    icon: <MdLibraryBooks className="text-xl" />,
  },
  {
    id: 'Category Rollup',
    label: 'Category Rollup',
    icon: <MdSync className="text-xl" />,
  },
];

const Page = () => {
  const [selectedTab, setSelectedTab] = React.useState<string>('Lab Create');
  const { user: loginedUser } = useAuthStore();

  const roles = loginedUser?.roles || [];
  const isSuperAdmin = roles.includes('SUPERADMIN');
  const isAdmin = roles.includes('ADMIN');

  // Filter tabs based on user role
  const filteredTabs = allTabs.filter(tab => {
    if (isSuperAdmin) return true;
    if (isAdmin)
      return ['Download Test', 'Test Reference Parameters', 'Category Rollup'].includes(tab.id);
    return false;
  });

  // Set default tab if selected is not allowed
  useEffect(() => {
    if (
      filteredTabs.length > 0 &&
      !filteredTabs.some(tab => tab.id === selectedTab)
    ) {
      setSelectedTab(filteredTabs[0].id);
    }
  }, [filteredTabs, selectedTab]);

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId);
  };

  // Authorization logic - Only SUPERADMIN and ADMIN allowed
  if (!isSuperAdmin && !isAdmin) {
    return (
      <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
        <Unauthorised
          username={loginedUser?.username || ''}
          currentRoles={roles}
          notallowedRoles={['TECHNICIAN', 'DESKROLE']}
          allowedRoles={['SUPERADMIN', 'ADMIN']}
        />
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-secondary-50">
      <div className="w-full">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6">
          {filteredTabs.map((tab) => {
            const isActive = selectedTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center gap-2.5 px-4 py-1 rounded-full h-10
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-secondary-600 text-pneutral-50'
                      : 'bg-base-white text-pneutral-900'
                  }
                `}
              >
                {/* Icon */}
                <span
                  className={`text-xl transition-colors duration-200 ${
                    isActive
                      ? 'text-pneutral-50'
                      : 'text-pneutral-500'
                  }`}
                >
                  {tab.icon}
                </span>

                {/* Label */}
                <span className="font-heading text-p3">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {selectedTab === 'Lab Create' && isSuperAdmin && (
            <Lab />
          )}

          {selectedTab === 'Lab List' && isSuperAdmin && (
            <LabList />
          )}

          {selectedTab === 'Download Test' &&
            (isSuperAdmin || isAdmin) && (
              <TestPriceList />
            )}

          {selectedTab === 'Test Reference Parameters' &&
            (isSuperAdmin || isAdmin) && (
              <TestReferanceList />
            )}

          {selectedTab === 'Category Rollup' &&
            (isSuperAdmin || isAdmin) && (
              <CategoryRollupBackfill />
            )}
        </div>
      </div>
    </div>
  );
};

export default Page;



















// code by abhishek ..........do not delete this ................

// 'use client';

// import React, { useEffect } from 'react';
// import Tabs from '@/app/(admin)/component/common/TabComponent';
// import Loader from '../../component/common/Loader';
// import Unauthorised from '../../component/Unauthorised';
// // import { useLabs } from '@/context/LabContext';
// import useAuthStore from '@/context/userStore';
// import { FaFlask } from "react-icons/fa6";
// import { GrDocumentTest } from "react-icons/gr";
// import { FaDownload } from "react-icons/fa";
// import { MdLibraryBooks } from "react-icons/md";
// import Lab from '../../component/lab/Lab';
// import LabList from '../../component/lab/LabList';
// import TestPriceList from '../../component/lab/TestPriceList';
// import TestReferanceList from '../../component/lab/TestReferanceList';

// interface LabTab {
//   id: string;
//   label: string;
//   icon: JSX.Element;
//   color: string;
// }

// const allTabs: LabTab[] = [
//   {
//     id: 'Lab Create',
//     label: 'Create New Lab',
//     icon: <FaFlask className="text-xl" />,
//     color: 'text-blue-500 hover:text-blue-600',
//   },
//   {
//     id: 'Lab List',
//     label: 'Lab List',
//     icon: <GrDocumentTest className="text-xl" />,
//     color: 'text-green-500 hover:text-green-600',
//   },
//   {
//     id: 'Download Test',
//     label: 'Test Price List',
//     icon: <FaDownload className="text-xl" />,
//     color: 'text-purple-500 hover:text-purple-600',
//   },
//   {
//     id: 'Test Reference Parameters',
//     label: 'Test Reference',
//     icon: <MdLibraryBooks className="text-xl" />,
//     color: 'text-orange-500 hover:text-orange-600',
//   },
// ];

// const Page = () => {
//   const [selectedTab, setSelectedTab] = React.useState<string>('Lab Create');
//   const [loading, setLoading] = React.useState<boolean>(false);
//   const { user: loginedUser } = useAuthStore();

//   const roles = loginedUser?.roles || [];
//   const isSuperAdmin = roles.includes('SUPERADMIN');
//   const isAdmin = roles.includes('ADMIN');
//   // const isTechnician = roles.includes('TECHNICIAN');
//   // const isDeskRole = roles.includes('DESKROLE');

//   // Filter tabs based on user role
//   const filteredTabs = allTabs.filter(tab => {
//     if (isSuperAdmin) return true; // Super admin sees all tabs
//     if (isAdmin) return ['Download Test', 'Test Reference Parameters'].includes(tab.id); // Admin sees only last two tabs
//     return false; // Others see nothing
//   });

//   // Set default tab if selected is not allowed
//   useEffect(() => {
//     if (filteredTabs.length > 0 && !filteredTabs.some(tab => tab.id === selectedTab)) {
//       setSelectedTab(filteredTabs[0].id);
//     }
//   }, [filteredTabs, selectedTab]);

//   const handleTabChange = (tabId: string) => {
//     setLoading(true);
//     setTimeout(() => {
//       setSelectedTab(tabId);
//       setLoading(false);
//     }, 300);
//   };

//   // Authorization logic - Only SUPERADMIN and ADMIN allowed
//   if (!isSuperAdmin && !isAdmin) {
//     return (
//       <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
//         <Unauthorised
//           username={loginedUser?.username || ''}
//           currentRoles={roles}
//           notallowedRoles={['TECHNICIAN', 'DESKROLE']}
//           allowedRoles={['SUPERADMIN', 'ADMIN']}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
//       <Tabs
//         tabs={filteredTabs}
//         selectedTab={selectedTab}
//         onTabChange={handleTabChange}
//       >
//         {loading ? (
//           <Loader />
//         ) : (
//           <>
//             {selectedTab === 'Lab Create' && isSuperAdmin && <Lab />}
//             {selectedTab === 'Lab List' && isSuperAdmin && <LabList />}
//             {selectedTab === 'Download Test' && (isSuperAdmin || isAdmin) && <TestPriceList />}
//             {selectedTab === 'Test Reference Parameters' && (isSuperAdmin || isAdmin) && <TestReferanceList />}
//           </>
//         )}
//       </Tabs>
//     </div>
//   );
// };

// export default Page;