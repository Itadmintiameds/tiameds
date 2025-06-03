// 'use client';
// import React from 'react';

// interface TabItem {
//     id: string;
//     label: string;
//     icon: React.ReactNode;
// }

// interface TabsProps {
//     tabs: TabItem[];
//     selectedTab: string;
//     onTabChange: (tabId: string) => void;
//     children: React.ReactNode;
// }

// const SubTabComponent: React.FC<TabsProps> = ({ tabs, selectedTab, onTabChange, children }) => {
//     return (
//         <div className="flex flex-col items-start p-4 bg-cardbackground shadow-md rounded-lg">
//             {/* Scrollable Tab Buttons */}
//             <div className="flex overflow-x-auto space-x-2 mb-4 w-full pb-2 border-b border-gray-200 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
//                 {tabs.map((tab) => (
//                     <button
//                         key={tab.id}
//                         className={`flex items-center justify-center min-w-[80px] px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 
//                             ${selectedTab === tab.id
//                                 ? 'bg-primary text-textzinc shadow-md hover:bg-primarylight'
//                                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                             }`}
//                         onClick={() => onTabChange(tab.id)}
//                     >
//                         <div className="flex items-center space-x-1">
//                             <span>{tab.icon}</span>
//                             <span className="truncate">{tab.label}</span>
//                         </div>
//                     </button>
//                 ))}
//             </div>
//             {/* Tab Content */}
//             <div className="w-full">
//                 {children}
//             </div>
//         </div>
//     );
// };

// export default SubTabComponent;



'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TabItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    color?: string; // Optional color for each tab
}

interface TabsProps {
    tabs: TabItem[];
    selectedTab: string;
    onTabChange: (tabId: string) => void;
    children: React.ReactNode;
}

const SubTabComponent: React.FC<TabsProps> = ({ tabs, selectedTab, onTabChange, children }) => {
    // Default colors if not provided
    const getTabColor = (tab: TabItem) => {
        return tab.color || [
            'bg-blue-500', 
            'bg-purple-500', 
            'bg-teal-500', 
            'bg-amber-500',
            'bg-rose-500'
        ][tabs.indexOf(tab) % 5];
    };

    return (
        <div className="flex flex-col items-start p-4 bg-white shadow-lg rounded-xl border border-gray-100">
            {/* Enhanced Scrollable Tab Buttons with Glow Effect */}
            <div className="flex overflow-x-auto space-x-2 mb-4 w-full pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {tabs.map((tab) => {
                    const isActive = selectedTab === tab.id;
                    const tabColor = getTabColor(tab);
                    
                    return (
                        <motion.button
                            key={tab.id}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative flex items-center justify-center min-w-[90px] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 
                                ${isActive
                                    ? `text-white ${tabColor} shadow-md hover:shadow-lg`
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            onClick={() => onTabChange(tab.id)}
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="activeTabIndicator"
                                    className="absolute inset-0 rounded-lg"
                                    style={{
                                        boxShadow: `0 0 12px ${tabColor.replace('bg-', '')}`
                                    }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                            )}
                            <div className="flex items-center space-x-2 relative z-10">
                                <motion.span
                                    animate={{ 
                                        scale: isActive ? 1.1 : 1,
                                        rotate: isActive ? 5 : 0
                                    }}
                                >
                                    {tab.icon}
                                </motion.span>
                                <motion.span 
                                    className="truncate"
                                    animate={{
                                        fontWeight: isActive ? 600 : 500
                                    }}
                                >
                                    {tab.label}
                                </motion.span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Animated Tab Content */}
            <div className="w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SubTabComponent;