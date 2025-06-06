// 'use client';

// import { CheckCircle, ClipboardList, HandCoinsIcon } from 'lucide-react';
// import { useState } from 'react';
// import CollectionTable from './_component/CollectionTable';
// import PendingTable from './_component/PendingTable';
// import Button from '../../component/common/Button';
// import CompletedTable from './_component/CompletedTable';

// const collectionTab = [
//   { name: 'Pending', icon: ClipboardList },
//   { name: 'Collected', icon: CheckCircle },
//   { name: 'Received', icon: HandCoinsIcon },
// ];

// const Page = () => {
//   const [activeTab, setActiveTab] = useState('Pending');

//   return (
//     <div className="container mx-auto p-4">
//       <div className="border-b border-gray-300 mb-4 text-sm font-medium">
//         <div className="flex space-x-4">
//           {collectionTab.map((tab) => (
//             <Button
//               key={tab.name}
//               text={''}
//               onClick={() => setActiveTab(tab.name)}
//               className={`pb-2 px-4 transition-all duration-300 border-b-2 font-semibold flex items-center gap-1
//                 ${activeTab === tab.name
//                   ? 'border-primary text-primary' // Active tab styles
//                   : 'border-transparent text-gray-500 hover:text-primary hover:border-primarylight' // Inactive tab styles
//                 }
//               `}
//             >
//               <tab.icon
//                 className={`w-4 h-4 ${activeTab === tab.name ? 'text-textzinc' : 'text-gray-400'}`} // Adjusting icon color to match text color
//               />
//               <span className={`${activeTab === tab.name ? 'text-textzinc' : 'text-gray-500'}`}>{tab.name}</span> {/* Ensure text color updates */}
//             </Button>
//           ))}
//         </div>
//       </div>
//       <div className="bg-white shadow-sm ">
//         {activeTab === 'Pending' && <PendingTable />}
//         {activeTab === 'Collected' && <CollectionTable />}
//         {activeTab === 'Received' && <CompletedTable />}
//       </div>
//     </div>
//   );
// };

// export default Page;






'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, CheckCircle, HandCoins } from 'lucide-react';
import PendingTable from './_component/PendingTable';
import CollectionTable from './_component/CollectionTable';
import CompletedTable from './_component/CompletedTable';

const tabs = [
  { 
    id: 'Pending',
    label: 'Pending', 
    icon: <ClipboardList className="text-lg" />,
    activeColor: 'text-blue-600',
    borderColor: 'bg-blue-600',
    bgColor: 'bg-blue-100'
  },
  { 
    id: 'Collected', 
    label: 'Collected', 
    icon: <CheckCircle className="text-lg" />,
    activeColor: 'text-green-600',
    borderColor: 'bg-green-600',
    bgColor: 'bg-green-100'
  },
  { 
    id: 'Received', 
    label: 'Received', 
    icon: <HandCoins className="text-lg" />,
    activeColor: 'text-purple-600',
    borderColor: 'bg-purple-600',
    bgColor: 'bg-purple-100'
  },
];

const TabButton = ({ tab, isActive, onClick }: { tab: typeof tabs[0], isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-3 flex items-center space-x-2 transition-all duration-300 ${
      isActive ? tab.activeColor : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    <span className={`p-1.5 rounded-md ${isActive ? `${tab.bgColor} ${tab.activeColor}` : 'bg-gray-100 text-gray-500'} transition-colors`}>
      {tab.icon}
    </span>
    <span className="font-medium">{tab.label}</span>
    {isActive && (
      <motion.div 
        layoutId="activeTab"
        className={`absolute bottom-0 left-0 right-0 h-1 ${tab.borderColor} rounded-t-full`}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />
    )}
  </button>
);

const Page = () => {
  const [selectedTab, setSelectedTab] = useState<string>('Pending');
  
  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Enhanced Tab Bar */}
        <div className="flex border-b border-gray-200 px-4">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={selectedTab === tab.id}
              onClick={() => setSelectedTab(tab.id)}
            />
          ))}
        </div>
        
        {/* Tab Content with Smooth Transition */}
        <div className="px-2 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {selectedTab === 'Pending' && <PendingTable />}
              {selectedTab === 'Collected' && <CollectionTable />}
              {selectedTab === 'Received' && <CompletedTable />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Page;













