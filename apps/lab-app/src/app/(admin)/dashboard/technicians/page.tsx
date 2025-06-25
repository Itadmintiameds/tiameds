// 'use client';
// import Tabs from '@/app/(admin)/component/common/TabComponent';
// import { useState } from 'react';
// import { FaPersonChalkboard, FaPersonCirclePlus } from "react-icons/fa6";
// import  ListOfMemberOfLab  from './_component/ListOfMemberOfLab';
// import AddMemberOnLab from './_component/AddMemberOnLab';

// interface TechnicianTab {
//     id: string;
//     label: string;
//     icon: JSX.Element;
// }

// const tabs: TechnicianTab[] = [
//     { id: 'Add Technician', label: 'Add Member', icon: <FaPersonCirclePlus className="text-xl" /> },
//     { id: 'Manage Technicians', label: 'Manage Member', icon: <FaPersonChalkboard className="text-xl" /> },

// ];

// const Page = () => {
//     const [selectedTab, setSelectedTab] = useState<string>('Add Technician');
//     return (
//         <>
//         <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-4 border border-yellow-300">
//         ⚠️ You are an <strong>Admin</strong> but not the <strong>creator</strong> of this lab. You can view the content, but certain actions may be restricted.
//       </div>
//             <Tabs
//                 tabs={tabs}
//                 selectedTab={selectedTab}
//                 onTabChange={setSelectedTab}
//             >
//                 {selectedTab === 'Add Technician' && <AddMemberOnLab />}
//                 {selectedTab === 'Manage Technicians' && <ListOfMemberOfLab />}

//             </Tabs>
//         </>
//     );
// };

// export default Page;



'use client';
import Tabs from '@/app/(admin)/component/common/TabComponent';
import { useState } from 'react';
import { FaPersonChalkboard, FaPersonCirclePlus } from 'react-icons/fa6';
import ListOfMemberOfLab from './_component/ListOfMemberOfLab';
import AddMemberOnLab from './_component/AddMemberOnLab';
import Unauthorised from '@/app/(admin)/component/Unauthorised';
import { useLabs } from '@/context/LabContext';

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
  const { loginedUser } = useLabs();

  const roles = loginedUser?.roles || [];
  const isAllowed = ['ADMIN', 'SUPERADMIN'].some(role => roles.includes(role));
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
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-4 border border-yellow-300">
        🔒 <strong>Access Restricted:</strong> This operation can only be performed by a <strong>Super Admin</strong>. Other roles, including Admins, Technicians, and Desk users, do not have the necessary permissions.
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
