
'use client';

import React, { useEffect } from 'react';
import Tabs from '@/app/(admin)/component/common/TabComponent';
import TestLists from '@/app/(admin)/component/test/TestList';
import TestUpload from '@/app/(admin)/component/test/TestUpload';
import TestReferancePoints from '../../component/test/TestReferancePoints';
import UploadTestReference from '../../component/test/UploadTestReference';
import Loader from '../../component/common/Loader';
import Unauthorised from '../../component/Unauthorised';
// import { useLabs } from '@/context/LabContext'; 
import useAuthStore from '@/context/userStore';
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
  const { user: loginedUser } = useAuthStore();

  const roles = loginedUser?.roles || [];
  const isSuperAdmin = roles.includes('SUPERADMIN');
  const isAdmin = roles.includes('ADMIN');
  const isTechnician = roles.includes('TECHNICIAN');
  const isDeskRole = roles.includes('DESKROLE');

  // Filter tabs based on user role
  const filteredTabs = allTabs.filter(tab => {
    if (isSuperAdmin || isAdmin) return true; // Admins see all tabs
    if (isTechnician) return tab.id === 'test' || tab.id === 'test-referance-point';
    return false; // Desk role and others see no tabs
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
    }, 300);
  };

  // Authorization logic
  if (isDeskRole) {
    return (
      <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
        <Unauthorised
          username={loginedUser?.username || ''}
          currentRoles={roles}
          notallowedRoles={['DESKROLE']}
          allowedRoles={['TECHNICIAN', 'ADMIN', 'SUPERADMIN']}
        />
      </div>
    );
  }

  // Check if user has at least one authorized role
  const isAuthorized = isAdmin || isTechnician || isSuperAdmin;
  if (!isAuthorized) {
    return (
      <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
        <Unauthorised
          username={loginedUser?.username || ''}
          currentRoles={roles}
          notallowedRoles={roles}
          allowedRoles={['TECHNICIAN', 'ADMIN', 'SUPER_ADMIN']}
        />
      </div>
    );
  }

  return (
    <div className="w-full p-6 mt-4 border-2 border-gray-300 rounded-lg">
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
            {selectedTab === 'upload' && (isAdmin || isSuperAdmin) && <TestUpload />}
            {selectedTab === 'upload-referance' && (isAdmin || isSuperAdmin) && <UploadTestReference />}
          </>
        )}
        
      </Tabs>
    </div>
  );
};

export default Page;