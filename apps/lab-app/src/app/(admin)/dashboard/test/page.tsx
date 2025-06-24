// 'use client';
// import Tabs from '@/app/(admin)/component/common/TabComponent';
// import TestLists from '@/app/(admin)/component/test/TestList';
// import TestUpload from '@/app/(admin)/component/test/TestUpload';
// import { PackageTabItem } from '@/types/package/package';
// import React from 'react';
// import { MdOutlineCloudUpload } from "react-icons/md";
// import { RiTestTubeLine } from "react-icons/ri";
// import { VscReferences } from "react-icons/vsc";
// import Loader from '../../component/common/Loader';
// import TestReferancePoints from '../../component/test/TestReferancePoints';
// import UploadTestReference from '../../component/test/UploadTestReference';
// import Unauthorised from '../../component/unauthorised';
// import { useLabs } from '@/context/LabContext';

// const tabs: PackageTabItem[] = [
//   { id: 'test', label: 'Test', icon: <RiTestTubeLine className="text-xl" /> },
//   { id:'test-referance-point', label: 'Test Referance range', icon: <VscReferences className="text-xl" />},
//   { id: 'upload', label: 'Upload', icon: <MdOutlineCloudUpload className="text-xl" /> },
//   { id: 'upload-referance', label: 'Upload Referance', icon: <MdOutlineCloudUpload className="text-xl" /> },
// ];

// const Page = () => {
//   const [selectedTab, setSelectedTab] = React.useState<string>('test'); 
//   const [loading, setLoading] = React.useState<boolean>(false); 
//    const { loginedUser } = useLabs();

//   const handleTabChange = (tabId: string) => {
//     setLoading(true); // Show loader
//     setSelectedTab(tabId);
//     setLoading(false);
//   };

//   return (
//     <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
//       {/* <Tabs
//         tabs={tabs}
//         selectedTab={selectedTab}
//         onTabChange={handleTabChange}
//       >
//         {loading ? (
//           <Loader />
//         ) : (
//           <>
//             {selectedTab === 'test' && <TestLists />}
//             {selectedTab === 'upload' && <TestUpload />}
//             {selectedTab === 'test-referance-point' && <TestReferancePoints />}
//             {selectedTab === 'upload-referance' && <UploadTestReference />}
//           </>
//         )}
//       </Tabs> */}
//       // send role only role will be multiple
//       <Unauthorised 
//         allowedRoles={['admin', 'super-admin', 'lab-manager']}
//         notallowedRoles={loginedUser?.roles || []}
//       />
//     </div>
//   );
// };
// export default Page;






'use client';

import React, { useEffect } from 'react';
import Tabs from '@/app/(admin)/component/common/TabComponent';
import TestLists from '@/app/(admin)/component/test/TestList';
import TestUpload from '@/app/(admin)/component/test/TestUpload';
import TestReferancePoints from '../../component/test/TestReferancePoints';
import UploadTestReference from '../../component/test/UploadTestReference';
import Loader from '../../component/common/Loader';
import Unauthorised from '../../component/Unauthorised';
import { useLabs } from '@/context/LabContext';
import { MdOutlineCloudUpload } from "react-icons/md";
import { RiTestTubeLine } from "react-icons/ri";
import { VscReferences } from "react-icons/vsc";
import { PackageTabItem } from '@/types/package/package';

const allTabs: PackageTabItem[] = [
  { id: 'test', label: 'Test', icon: <RiTestTubeLine className="text-xl" /> },
  { id: 'test-referance-point', label: 'Test Reference range', icon: <VscReferences className="text-xl" /> },
  { id: 'upload', label: 'Upload', icon: <MdOutlineCloudUpload className="text-xl" /> },
  { id: 'upload-referance', label: 'Upload Reference', icon: <MdOutlineCloudUpload className="text-xl" /> },
];

const Page = () => {
  const [selectedTab, setSelectedTab] = React.useState<string>('test');
  const [loading, setLoading] = React.useState<boolean>(false);
  const { loginedUser } = useLabs();

  const roles = loginedUser?.roles || [];
  const isAdmin = roles.includes('ADMIN');
  const isTechnician = roles.includes('TECHNICIAN');
  // const isDeskRole = roles.includes('DESKROLE');

  const filteredTabs = allTabs.filter(tab => {
    if (isAdmin) return true;
    if (isTechnician) return tab.id === 'test' || tab.id === 'test-referance-point';
    return false;
  });

  // Set default tab if selected is not allowed
  useEffect(() => {
    if (filteredTabs.length > 0 && !filteredTabs.some(tab => tab.id === selectedTab)) {
      setSelectedTab(filteredTabs[0].id);
    }
  }, [filteredTabs, selectedTab]);

  const handleTabChange = (tabId: string) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedTab(tabId);
      setLoading(false);
    }, 300); // Optional simulated delay
  };

  const isAuthorized = isAdmin || isTechnician;

  return (
    <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
      {!isAuthorized ? (
        <Unauthorised
          username={loginedUser?.username || ''}
          currentRoles={roles}
          notallowedRoles={['DESKROLE']}
          allowedRoles={['TECHNICIAN', 'ADMIN']}
        />
      ) : (
        <>
          <Tabs
            tabs={filteredTabs}
            selectedTab={selectedTab}
            onTabChange={handleTabChange}
          >
            {loading ? (
              <Loader />
            ) : (
              <>
                {selectedTab === 'test' && <TestLists />}
                {selectedTab === 'test-referance-point' && <TestReferancePoints />}
                {selectedTab === 'upload' && isAdmin && <TestUpload />}
                {selectedTab === 'upload-referance' && isAdmin && <UploadTestReference />}
              </>
            )}
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Page;
