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
    <div className="p-4">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-md shadow-sm mb-6 flex items-start gap-4">
        <div className="text-yellow-600 text-xl mt-1">
          🔒
        </div>
        <div className="flex-1">
          <h3 className="text-yellow-800 font-semibold text-lg mb-1">Access Restricted</h3>
          <p className="text-sm text-yellow-700 mb-2">
            This action is only permitted for users with elevated privileges.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-yellow-200 text-yellow-900 text-xs font-semibold px-2 py-1 rounded-full">
              👑 Super Admin
            </span>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full border border-yellow-300">
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
      </div>

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
