'use client';
import Tabs from '@/app/(admin)/component/common/TabComponent';
import { useState } from 'react';
import { FaPersonChalkboard, FaPersonCirclePlus } from 'react-icons/fa6';
import ListOfMemberOfLab from './_component/ListOfMemberOfLab';
import AddMemberOnLab from './_component/AddMemberOnLab';
import Unauthorised from '@/app/(admin)/component/Unauthorised';
// import { useLabs } from '@/context/LabContext';
import useAuthStore from '@/context/userStore';

interface TechnicianTab {
  id: string;
  label: string;
  icon: JSX.Element;
}

const tabs: TechnicianTab[] = [
  { id: 'Add Technician', label: 'Add Member', icon: <FaPersonCirclePlus className="text-xl" /> },
  { id: 'Manage Technicians', label: 'Manage Member', icon: <FaPersonChalkboard className="text-xl" /> },
];

const Page = () => {
  const [selectedTab, setSelectedTab] = useState<string>('Add Technician');
  const { user: loginedUser } = useAuthStore();

  const roles = loginedUser?.roles || [];
  const isAllowed = ['ADMIN', 'SUPERADMIN'].some(role => roles?.includes(role));
  const notallowedRoles = ['TECHNICIAN', 'DESKROLE'];

  if (!isAllowed) {
    return (
      <Unauthorised
        username={loginedUser?.username || ''}
        currentRoles={roles}
        notallowedRoles={notallowedRoles}
        allowedRoles={['ADMIN', 'SUPERADMIN']}
      />
    );
  }

  return (
    <div className="w-full bg-gray-50 p-4 rounded-lg">
      {/* <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg shadow-sm mb-4 flex items-start gap-3">
        <div className="text-amber-600 text-lg mt-0.5">
          🔒
        </div>
        <div className="flex-1">
          <h3 className="text-amber-800 font-semibold text-base mb-1">Access Restricted</h3>
          <p className="text-sm text-amber-700 mb-2">
            This action is only permitted for users with elevated privileges.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="bg-amber-200 text-amber-900 text-xs font-medium px-2 py-1 rounded-full">
              👑 Super Admin
            </span>
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full border border-amber-300">
              🛡️ Admin
            </span>
            <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-1 rounded-full border border-gray-200 line-through">
              🛠️ Technician
            </span>
            <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-1 rounded-full border border-gray-200 line-through">
              💼 Desk User
            </span>
          </div>
        </div>
      </div> */}

      <Tabs
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      >
        {selectedTab === 'Add Technician' && <AddMemberOnLab />}
        {selectedTab === 'Manage Technicians' && <ListOfMemberOfLab />}
      </Tabs>
    </div>
  );
};

export default Page;
