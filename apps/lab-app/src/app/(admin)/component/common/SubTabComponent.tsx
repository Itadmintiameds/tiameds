'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

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
    closeModal?: () => void;
}

const SubTabComponent: React.FC<TabsProps> = ({ tabs, selectedTab, onTabChange, children, closeModal }) => {
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
        <div className="flex flex-col items-start p-6 bg-white shadow-lg rounded-xl border border-gray-200">
            {/* Tab Header with Close Button */}
            <div className="flex items-center justify-between w-full mb-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex-1">
                    <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
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
                                            ? 'text-white shadow-md hover:shadow-lg'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-blue-200'
                                        }`}
                                    onClick={() => onTabChange(tab.id)}
                                    style={isActive ? {
                                        background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
                                    } : {}}
                                >
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeTabIndicator"
                                            className="absolute inset-0 rounded-lg"
                                            style={{
                                                background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
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
                </div>
                {closeModal && (
                    <button
                        onClick={closeModal}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-3"
                        title="Close"
                    >
                        <FaTimes className="h-5 w-5" />
                    </button>
                )}
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