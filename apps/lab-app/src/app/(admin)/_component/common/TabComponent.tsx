'use client';

import React from 'react';

interface TabItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface TabsProps {
    tabs: TabItem[];
    selectedTab: string;
    onTabChange: (tabId: string) => void;
    children: React.ReactNode;
}

const TabComponent: React.FC<TabsProps> = ({ tabs, selectedTab, onTabChange, children }) => {
    return (
        <div className="flex flex-col items-start p-4">
            {/* Tab Buttons */}
            <div className="flex space-x-6 mb-4 justify-start">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`flex items-center px-4 py-2 rounded-lg text-xs transition-all duration-300 focus:outline-none ${selectedTab === tab.id
                            ? 'bg-indigo-800 text-white scale-105'
                            : 'bg-gray-300 text-gray-600 hover:bg-indigo-200'
                            }`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            {/* Tab Content */}
            <div className="w-full ">
                {children}
            </div>
        </div>
    );
};

export default TabComponent;
