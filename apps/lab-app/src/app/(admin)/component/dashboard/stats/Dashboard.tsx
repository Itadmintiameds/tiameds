// 'use client';

// import { Home, BarChart, Bell, Settings, MessageSquare } from 'lucide-react';
// import { useState } from 'react';

// function useTabManager(initialTab: string) {
//   const [activeTab, setActiveTab] = useState<string>(initialTab);

//   const changeTab = (tab: string) => {
//     if (tab !== activeTab) {
//       setActiveTab(tab);
//     }
//   };

//   return { activeTab, changeTab };
// }

// const DashboardTabPage: React.FC = () => {
//   const { activeTab, changeTab } = useTabManager('overview');

//   const tabs = [
//     { key: 'overview', icon: <Home size={12} />, label: 'Overview' },
//     { key: 'statistics', icon: <BarChart size={12} />, label: 'Statistics' },
//     { key: 'notifications', icon: <Bell size={12} />, label: 'Notifications' },
//     { key: 'settings', icon: <Settings size={12} />, label: 'Settings' },
//     { key: 'messages', icon: <MessageSquare size={12} />, label: 'Messages' },
//   ];

//   return (
//     <div className="container mx-auto p-6">
//       {/* Tab Navigation */}
//       <div className="flex flex-wrap justify-center gap-4 mb-6">
//         {tabs.map(({ key, icon, label }) => (
//           <button
//             key={key}
//             onClick={() => changeTab(key)}
//             className={`group relative flex flex-col items-center justify-center p-3 w-20 h-20 rounded-lg shadow-md transition-all duration-200
//               ${activeTab === key ? 'bg-indigo-800 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:shadow-md'}`}
//           >
//             <div
//               className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
//                 ${activeTab === key ? 'bg-white text-indigo-500' : 'bg-indigo-100 text-indigo-700 group-hover:scale-110'}`}
//             >
//               {icon}
//             </div>
//             <span className="mt-2 text-xs font-semibold">{label}</span>
//           </button>
//         ))}
//       </div>

//       {/* Tab Content */}
//       <div className="bg-white shadow rounded-lg p-6">
//         <div className="text-gray-800 text-base">
//           {activeTab === 'overview' && <p>Here's a quick summary of your dashboard overview.</p>}
//           {activeTab === 'statistics' && <p>Detailed statistics and data insights are displayed here.</p>}
//           {activeTab === 'notifications' && <p>Your latest notifications can be seen here.</p>}
//           {activeTab === 'settings' && <p>Update your settings and preferences in this section.</p>}
//           {activeTab === 'messages' && <p>Read and manage your messages in this tab.</p>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardTabPage;
