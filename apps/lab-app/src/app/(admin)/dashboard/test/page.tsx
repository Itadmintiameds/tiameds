'use client';

import React, { useEffect, useState } from 'react';
import useAuthStore from '@/context/userStore';
import Unauthorised from '@/app/(admin)/component/Unauthorised';
import TestLists from '@/app/(admin)/component/test/TestList';
import AddTest from '@/app/(admin)/component/test/AddTest';
import TestUpload from '@/app/(admin)/component/test/TestUpload';
import TestReferancePoints from '../../component/test/TestReferancePoints';
import UploadTestReference from '../../component/test/UploadTestReference';
import Loader from '../../component/common/Loader';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { RiTestTubeLine } from 'react-icons/ri';
import { VscReferences } from 'react-icons/vsc';
import { PackageTabItem } from '@/types/package/package';

const allTabs: PackageTabItem[] = [
  { id: 'test', label: 'Test', icon: <RiTestTubeLine className="text-xl" /> },
  { id: 'test-referance-point', label: 'Test Reference range', icon: <VscReferences className="text-xl" /> },
  { id: 'upload', label: 'Upload', icon: <MdOutlineCloudUpload className="text-xl" /> },
  { id: 'upload-referance', label: 'Upload Reference', icon: <MdOutlineCloudUpload className="text-xl" /> },
];

const Page = () => {
  const { user: loginedUser } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<string>('test');
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddTest, setShowAddTest] = useState(false);
  const [updateList, setUpdateList] = useState(false);

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
    setShowAddTest(false);
    setLoading(true);
    setTimeout(() => {
      setSelectedTab(tabId);
      setLoading(false);
    }, 300);
  };

  // Authorization for Desk Role (unless they also hold a higher role)
  if (isDeskRole && !isAdmin && !isTechnician && !isSuperAdmin) {
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
                  flex items-center gap-2.5 px-4 py-1 rounded-full h-10 transition-all duration-200
                  ${isActive
                    ? 'bg-secondary-600 text-pneutral-50'
                    : 'bg-base-white text-pneutral-900'
                  }
                `}
              >
                <span className={`text-xl transition-colors duration-200 ${
                  isActive ? 'text-pneutral-50' : 'text-pneutral-900'
                }`}>
                  {tab.icon}
                </span>
                <span className="font-heading text-p3">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {loading ? (
            <Loader />
          ) : (
            <>
              {selectedTab === 'test' && (
                showAddTest ? (
                  <AddTest
                    closeModal={() => setShowAddTest(false)}
                    updateList={updateList}
                    setUpdateList={setUpdateList}
                  />
                ) : (
                  <TestLists
                    onAddTest={() => setShowAddTest(true)}
                    updateList={updateList}
                    setUpdateList={setUpdateList}
                  />
                )
              )}
              {selectedTab === 'test-referance-point' && <TestReferancePoints />}
              {selectedTab === 'upload' && (isAdmin || isSuperAdmin) && <TestUpload />}
              {selectedTab === 'upload-referance' && (isAdmin || isSuperAdmin) && <UploadTestReference />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
