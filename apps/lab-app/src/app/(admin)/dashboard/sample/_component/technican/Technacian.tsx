"use client";

import React, { useCallback, useState } from 'react';
import KPISection from '../KPISection';
import PendingTable from '../PendingTable';
import CompletedTable from '../CompletedTable';
import CollectionTable from '../CollectionTable';
import CollectedSample from '../CollectedSample';

type ViewType = 'pending' | 'collected' | 'partial' | 'completed';

const Technician = () => {
  const [currentView, setCurrentView] = useState<ViewType>('pending');
  const [hideKPI, setHideKPI] = useState(false);
  
  // Add refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State to hold KPI data from child components
  const [kpiData, setKpiData] = useState({
    pending: 0,
    collected: 0,
    partial: 0,
    completed: 0
  });

  // Handler to update KPI data from child components
  const updateKPIData = useCallback((type: ViewType, count: number) => {
    setKpiData(prev => (prev[type] === count ? prev : { ...prev, [type]: count }));
  }, []);

  // Function to trigger refresh of all tables
  const refreshAllTables = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handlePendingUpdate = useCallback((count: number) => updateKPIData('pending', count), [updateKPIData]);
  const handleCollectedUpdate = useCallback((count: number) => updateKPIData('collected', count), [updateKPIData]);
  const handlePartialUpdate = useCallback((count: number) => updateKPIData('partial', count), [updateKPIData]);
  const handleCompletedUpdate = useCallback((count: number) => updateKPIData('completed', count), [updateKPIData]);
  const handleHideKPI = useCallback(() => setHideKPI(true), []);
  const handleShowKPI = useCallback(() => setHideKPI(false), []);

  // Stats for KPISection
  const stats = [
    {
      title: "Samples Pending",
      value: kpiData.pending.toString(),
      count: kpiData.pending
    },
    {
      title: "Samples Collected",
      value: kpiData.collected.toString(),
      count: kpiData.collected
    },
    {
      title: "Pending Test Results",
      value: kpiData.partial.toString(),
      count: kpiData.partial
    },
    {
      title: "Completed Test",
      value: kpiData.completed.toString(),
      count: kpiData.completed
    },
  ];

  // Handle KPI card click
  const handleCardChange = (index: number) => {
    const views: ViewType[] = ['pending', 'collected', 'partial', 'completed'];
    setCurrentView(views[index]);
    setHideKPI(false);
  };

  const renderContent = () => {
    return (
      <>
        <div className={currentView === 'pending' ? '' : 'hidden'}>
          <PendingTable 
            onDataUpdate={handlePendingUpdate} 
            refreshTrigger={refreshTrigger}
            onSampleAdded={refreshAllTables}
          />
        </div>
        <div className={currentView === 'collected' ? '' : 'hidden'}>
          <CollectedSample 
            onDataUpdate={handleCollectedUpdate}
            refreshTrigger={refreshTrigger}
            onSampleEdited={refreshAllTables}
          />
        </div>
        <div className={currentView === 'partial' ? '' : 'hidden'}>
          <CollectionTable
            onDataUpdate={handlePartialUpdate}
            onHideKPI={handleHideKPI}
            onShowKPI={handleShowKPI}
            refreshTrigger={refreshTrigger}
            onResultAdded={refreshAllTables}
          />
        </div>
        <div className={currentView === 'completed' ? '' : 'hidden'}>
          <CompletedTable 
            onDataUpdate={handleCompletedUpdate}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-pneutral-900">
          Samples Status
        </h1>
        <p className="mt-1 text-sm text-pneutral-500">
          Manage and track pending patient Samples
        </p>
      </div>

      {/* KPI Section - Hide when on result entry screen */}
      {!hideKPI && (
        <KPISection
          data={stats}
          onCardChange={handleCardChange}
          selectedIndex={['pending', 'collected', 'partial', 'completed'].indexOf(currentView)}
        />
      )}

      {/* Dynamic Content */}
      <div className={`mt-5 ${hideKPI ? 'mt-0' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Technician;





// working code but without refresh of the data .....................

// "use client";

// import React, { useCallback, useState } from 'react';
// import KPISection from '../KPISection';

// // import { useLabs } from '@/context/LabContext';
// import PendingTable from '../PendingTable';
// import CompletedTable from '../CompletedTable';
// import CollectionTable from '../CollectionTable';
// import CollectedSample from '../CollectedSample';

// type ViewType = 'pending' | 'collected' | 'partial' | 'completed';

// const Technician = () => {
//   // const { currentLab } = useLabs();
//   const [currentView, setCurrentView] = useState<ViewType>('pending');
//   const [hideKPI, setHideKPI] = useState(false); // Add this state

//   // State to hold KPI data from child components
//   const [kpiData, setKpiData] = useState({
//     pending: 0,
//     collected: 0,
//     partial: 0,
//     completed: 0
//   });

//   // Handler to update KPI data from child components
//   const updateKPIData = useCallback((type: ViewType, count: number) => {
//     setKpiData(prev => (prev[type] === count ? prev : { ...prev, [type]: count }));
//   }, []);

//   const handlePendingUpdate = useCallback((count: number) => updateKPIData('pending', count), [updateKPIData]);
//   const handleCollectedUpdate = useCallback((count: number) => updateKPIData('collected', count), [updateKPIData]);
//   const handlePartialUpdate = useCallback((count: number) => updateKPIData('partial', count), [updateKPIData]);
//   const handleCompletedUpdate = useCallback((count: number) => updateKPIData('completed', count), [updateKPIData]);
//   const handleHideKPI = useCallback(() => setHideKPI(true), []);
//   const handleShowKPI = useCallback(() => setHideKPI(false), []);

//   // Stats for KPISection
//   const stats = [
//     {
//       title: "Samples Pending",
//       value: kpiData.pending.toString(),
//       count: kpiData.pending
//     },
//     {
//       title: "Samples Collected",
//       value: kpiData.collected.toString(),
//       count: kpiData.collected
//     },
//     {
//       title: "Pending Test Results",
//       value: kpiData.partial.toString(),
//       count: kpiData.partial
//     },
//     {
//       title: "Completed Test",
//       value: kpiData.completed.toString(),
//       count: kpiData.completed
//     },
//   ];

//   // Handle KPI card click
//   const handleCardChange = (index: number) => {
//     const views: ViewType[] = ['pending', 'collected', 'partial', 'completed'];
//     setCurrentView(views[index]);
//     setHideKPI(false); // Show KPI when changing views
//   };

//   // All four tables stay mounted at all times (hidden via CSS instead of
//   // unmounted) so each one fetches its data and reports its KPI count as
//   // soon as the screen opens, instead of only after its tab is clicked.
//   const renderContent = () => {
//     return (
//       <>
//         <div className={currentView === 'pending' ? '' : 'hidden'}>
//           <PendingTable onDataUpdate={handlePendingUpdate} />
//         </div>
//         <div className={currentView === 'collected' ? '' : 'hidden'}>
//           <CollectedSample onDataUpdate={handleCollectedUpdate} />
//         </div>
//         <div className={currentView === 'partial' ? '' : 'hidden'}>
//           <CollectionTable
//             onDataUpdate={handlePartialUpdate}
//             onHideKPI={handleHideKPI}
//             onShowKPI={handleShowKPI}
//           />
//         </div>
//         <div className={currentView === 'completed' ? '' : 'hidden'}>
//           <CompletedTable onDataUpdate={handleCompletedUpdate} />
//         </div>
//       </>
//     );
//   };

//   return (
//     <div className="w-full">
//       {/* Header */}
//       <div className="mb-5">
//         <h1 className="text-2xl font-semibold text-pneutral-900">
//           Samples Status
//         </h1>
//         <p className="mt-1 text-sm text-pneutral-500">
//           Manage and track pending patient Samples
//         </p>
//       </div>

//       {/* KPI Section - Hide when on result entry screen */}
//       {!hideKPI && (
//         <KPISection
//           data={stats}
//           onCardChange={handleCardChange}
//           selectedIndex={['pending', 'collected', 'partial', 'completed'].indexOf(currentView)}
//         />
//       )}

//       {/* Dynamic Content */}
//       <div className={`mt-5 ${hideKPI ? 'mt-0' : ''}`}>
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default Technician;





























// code by abhishek........................do not chnage......................

// 'use client';
// import { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ClipboardList, CheckCircle, HandCoins } from 'lucide-react';
// import PendingTable from '../PendingTable';
// import CollectionTable from '../CollectionTable';
// import CompletedTable from '../CompletedTable';

// const tabs = [
//   { 
//     id: 'Pending',
//     label: 'Pending', 
//     icon: <ClipboardList className="text-lg" />,
//     activeColor: 'text-blue-600',
//     borderColor: 'bg-blue-600',
//     bgColor: 'bg-blue-100'
//   },
//   { 
//     id: 'Collected', 
//     label: 'Collected', 
//     icon: <CheckCircle className="text-lg" />,
//     activeColor: 'text-green-600',
//     borderColor: 'bg-green-600',
//     bgColor: 'bg-green-100'
//   },
//   { 
//     id: 'Received', 
//     label: 'Received', 
//     icon: <HandCoins className="text-lg" />,
//     activeColor: 'text-purple-600',
//     borderColor: 'bg-purple-600',
//     bgColor: 'bg-purple-100'
//   },
// ];

// const TabButton = ({ tab, isActive, onClick }: { tab: typeof tabs[0], isActive: boolean, onClick: () => void }) => (
//   <button
//     onClick={onClick}
//     className={`relative px-4 py-3 flex items-center space-x-2 transition-all duration-300 ${
//       isActive ? tab.activeColor : 'text-gray-500 hover:text-gray-700'
//     }`}
//   >
//     <span className={`p-1.5 rounded-md ${isActive ? `${tab.bgColor} ${tab.activeColor}` : 'bg-gray-100 text-gray-500'} transition-colors`}>
//       {tab.icon}
//     </span>
//     <span className="font-medium">{tab.label}</span>
//     {isActive && (
//       <motion.div 
//         layoutId="activeTab"
//         className={`absolute bottom-0 left-0 right-0 h-1 ${tab.borderColor} rounded-t-full`}
//         transition={{ type: 'spring', stiffness: 300, damping: 25 }}
//       />
//     )}
//   </button>
// );

// const Technacian = () => {
//   const [selectedTab, setSelectedTab] = useState<string>('Pending');
  
//   return (
//     <div className="p-4">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         {/* Enhanced Tab Bar */}
//         <div className="flex border-b border-gray-200 px-4">
//           {tabs.map((tab) => (
//             <TabButton
//               key={tab.id}
//               tab={tab}
//               isActive={selectedTab === tab.id}
//               onClick={() => setSelectedTab(tab.id)}
//             />
//           ))}
//         </div>
        
//         {/* Tab Content with Smooth Transition */}
//         <div className="px-2 py-4">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={selectedTab}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.25 }}
//             >
//               {selectedTab === 'Pending' && <PendingTable />}
//               {selectedTab === 'Collected' && <CollectionTable />}
//               {selectedTab === 'Received' && <CompletedTable />}
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Technacian;