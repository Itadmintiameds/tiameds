// 'use client';
// import Tabs from '@/app/(admin)/component/common/TabComponent';
// import { useState } from 'react';
// import { FaFlask } from "react-icons/fa6";
// import { GrDocumentTest } from "react-icons/gr";
// import Lab from '../../component/lab/Lab';
// import LabList from '../../component/lab/LabList';
// import { FaDownload } from "react-icons/fa";
// import { MdLibraryBooks } from "react-icons/md";
// import TestPriceList from '../../component/lab/TestPriceList';
// import TestReferanceList from '../../component/lab/TestReferanceList';

// interface Lab {
//   id: string;
//   label: string;
//   icon: JSX.Element;
// }
// const tabs: Lab[] = [
//   { id: 'Lab Create', label: 'Create New Lab', icon: <FaFlask className="text-xl" /> },
//   { id: 'Lab List', label: 'Lab List', icon: <GrDocumentTest className="text-xl" /> },
//   { id: 'Download Test', label: 'Test Price List', icon: <FaDownload className="text-xl" /> },
//   { id: 'Test Reference Parameters', label: 'Test Reference Parameters', icon: <MdLibraryBooks className="text-xl" /> },
// ];

// const Page = () => {
//   const [selectedTab, setSelectedTab] = useState<string>('Lab Create');

//   return (
//     <>
//       <Tabs
//         tabs={tabs}
//         selectedTab={selectedTab}
//         onTabChange={setSelectedTab}
//       >
//         {selectedTab === 'Lab Create' && <Lab />}
//         {selectedTab === 'Lab List' && <LabList />}
//         {selectedTab === 'Download Test' && <TestPriceList />}
//         {selectedTab === 'Test Reference Parameters' && <TestReferanceList />}
//       </Tabs>
//     </>
//   );
// };

// export default Page;


// 'use client';

// import { useState } from 'react';
// import { FaFlask, FaDownload } from "react-icons/fa";
// import { GrDocumentTest } from "react-icons/gr";
// import { MdLibraryBooks } from "react-icons/md";
// import { RiTestTubeFill } from "react-icons/ri";
// import { motion } from 'framer-motion';

// import Lab from '../../component/lab/Lab';
// import LabList from '../../component/lab/LabList';
// import TestPriceList from '../../component/lab/TestPriceList';
// import TestReferanceList from '../../component/lab/TestReferanceList';
// import Unauthorised from '@/app/(admin)/component/Unauthorised';
// import { useLabs } from '@/context/LabContext';

// interface LabTab {
//   id: string;
//   label: string;
//   icon: JSX.Element;
//   color: string;
// }

// const allTabs: LabTab[] = [
//   { id: 'Lab Create', label: 'Create New Lab', icon: <FaFlask className="text-xl" />, color: 'text-blue-500 hover:text-blue-600' },
//   { id: 'Lab List', label: 'Lab List', icon: <GrDocumentTest className="text-xl" />, color: 'text-green-500 hover:text-green-600' },
//   { id: 'Download Test', label: 'Test Price List', icon: <FaDownload className="text-xl" />, color: 'text-purple-500 hover:text-purple-600' },
//   { id: 'Test Reference Parameters', label: 'Test Reference', icon: <MdLibraryBooks className="text-xl" />, color: 'text-orange-500 hover:text-orange-600' },
// ];

// const Page = () => {
//   const { loginedUser } = useLabs();
//   const roles = loginedUser?.roles || [];

//   const isAdmin = roles.includes('ADMIN');
//   const isTechnician = roles.includes('TECHNICIAN');
//   // const isDesk = roles.includes('DESKROLE');

//   // Show Unauthorised for DeskRole or any unknown roles
//   if (!isAdmin && !isTechnician) {
//     return (
//       <Unauthorised
//         username={loginedUser?.username || ''}
//         currentRoles={roles}
//         notallowedRoles={['DESKROLE']}
//         allowedRoles={['ADMIN', 'TECHNICIAN']}
//       />
//     );
//   }

//   // Tabs to display based on role
//   const tabsToShow = isAdmin
//     ? allTabs
//     : isTechnician
//     ? allTabs.filter(tab =>
//         ['Download Test', 'Test Reference Parameters'].includes(tab.id)
//       )
//     : [];

//   // const [selectedTab, setSelectedTab] = useState<string>(tabsToShow[0]?.id || '');
//   const [selectedTab, setSelectedTab] = useState<string>(tabsToShow[0]?.id || '');
//   const [hoveredTab, setHoveredTab] = useState<string | null>(null);

//   return (
//     <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
//       <div className="mb-6 flex items-center gap-3">
//         <RiTestTubeFill className="text-3xl text-indigo-600" />
//         <h1 className="text-2xl font-bold text-gray-800">Laboratory Settings</h1>
//       </div>

//       <div className="relative">
//         <div className="flex space-x-1 border-b border-gray-200">
//           {tabsToShow.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setSelectedTab(tab.id)}
//               onMouseEnter={() => setHoveredTab(tab.id)}
//               onMouseLeave={() => setHoveredTab(null)}
//               className={`relative px-4 py-2.5 flex items-center gap-2 text-sm font-medium transition-all duration-200 ${selectedTab === tab.id ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'} ${tab.color}`}
//             >
//               <span className="z-10 flex items-center gap-2">
//                 {tab.icon}
//                 {tab.label}
//               </span>
//               {selectedTab === tab.id && (
//                 <motion.div 
//                   layoutId="activeTab"
//                   className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
//                   transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
//                 />
//               )}
//               {hoveredTab === tab.id && selectedTab !== tab.id && (
//                 <motion.div 
//                   className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                 />
//               )}
//             </button>
//           ))}
//         </div>
//       </div>

//       <motion.div
//         key={selectedTab}
//         initial={{ opacity: 0, y: 10 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -10 }}
//         transition={{ duration: 0.2 }}
//         className="mt-6"
//       >
//         {selectedTab === 'Lab Create' && <Lab />}
//         {selectedTab === 'Lab List' && <LabList />}
//         {selectedTab === 'Download Test' && <TestPriceList />}
//         {selectedTab === 'Test Reference Parameters' && <TestReferanceList />}
//       </motion.div>
//     </div>
//   );
// };

// export default Page;









'use client';

import { useState } from 'react';
import { FaFlask, FaDownload } from "react-icons/fa";
import { GrDocumentTest } from "react-icons/gr";
import { MdLibraryBooks } from "react-icons/md";
import { RiTestTubeFill } from "react-icons/ri";
import { motion } from 'framer-motion';

import Lab from '../../component/lab/Lab';
import LabList from '../../component/lab/LabList';
import TestPriceList from '../../component/lab/TestPriceList';
import TestReferanceList from '../../component/lab/TestReferanceList';
import Unauthorised from '@/app/(admin)/component/Unauthorised';
import { useLabs } from '@/context/LabContext';

interface LabTab {
  id: string;
  label: string;
  icon: JSX.Element;
  color: string;
}

const allTabs: LabTab[] = [
  { id: 'Lab Create', label: 'Create New Lab', icon: <FaFlask className="text-xl" />, color: 'text-blue-500 hover:text-blue-600' },
  { id: 'Lab List', label: 'Lab List', icon: <GrDocumentTest className="text-xl" />, color: 'text-green-500 hover:text-green-600' },
  { id: 'Download Test', label: 'Test Price List', icon: <FaDownload className="text-xl" />, color: 'text-purple-500 hover:text-purple-600' },
  { id: 'Test Reference Parameters', label: 'Test Reference', icon: <MdLibraryBooks className="text-xl" />, color: 'text-orange-500 hover:text-orange-600' },
];

const Page = () => {
  const { loginedUser } = useLabs();
  const roles = loginedUser?.roles || [];

  const isAdmin = roles.includes('ADMIN');
  const isTechnician = roles.includes('TECHNICIAN');

  const tabsToShow = isAdmin
    ? allTabs
    : isTechnician
    ? allTabs.filter(tab =>
        ['Download Test', 'Test Reference Parameters'].includes(tab.id)
      )
    : [];

  const [selectedTab, setSelectedTab] = useState<string>(tabsToShow[0]?.id || '');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  if (!isAdmin && !isTechnician) {
    return (
      <Unauthorised
        username={loginedUser?.username || ''}
        currentRoles={roles}
        notallowedRoles={['DESKROLE']}
        allowedRoles={['ADMIN', 'TECHNICIAN']}
      />
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <RiTestTubeFill className="text-3xl text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-800">Laboratory Settings</h1>
      </div>

      <div className="relative">
        <div className="flex space-x-1 border-b border-gray-200">
          {tabsToShow.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className={`relative px-4 py-2.5 flex items-center gap-2 text-sm font-medium transition-all duration-200 ${selectedTab === tab.id ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'} ${tab.color}`}
            >
              <span className="z-10 flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
              {selectedTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              {hoveredTab === tab.id && selectedTab !== tab.id && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={selectedTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="mt-6"
      >
        {selectedTab === 'Lab Create' && <Lab />}
        {selectedTab === 'Lab List' && <LabList />}
        {selectedTab === 'Download Test' && <TestPriceList />}
        {selectedTab === 'Test Reference Parameters' && <TestReferanceList />}
      </motion.div>
    </div>
  );
};

export default Page;
