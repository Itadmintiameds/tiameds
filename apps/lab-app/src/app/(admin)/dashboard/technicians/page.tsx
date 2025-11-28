'use client';
import Tabs from '@/app/(admin)/component/common/TabComponent';
import { useState } from 'react';
import { FaPersonChalkboard, FaPersonCirclePlus } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';
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

interface PageProps {
  closeModal?: () => void;
}

const Page = ({ closeModal }: PageProps = {}) => {
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
    <div className="w-full bg-gray-50 p-6 rounded-xl shadow-lg">
      {closeModal && (
        <div className="flex justify-end mb-4">
          <button
            onClick={closeModal}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
      )}

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
