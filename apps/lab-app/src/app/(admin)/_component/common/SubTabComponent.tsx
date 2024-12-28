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

const SubTabComponent: React.FC<TabsProps> = ({ tabs, selectedTab, onTabChange, children }) => {
    return (
        <div className="flex flex-col items-start p-4 bg-gray-50 shadow-md rounded-lg">
            {/* Scrollable Tab Buttons */}
            <div className="flex overflow-x-auto space-x-2 mb-4 w-full pb-2 border-b border-gray-200 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`flex items-center justify-center min-w-[80px] px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 
                            ${selectedTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <div className="flex items-center space-x-1">
                            <span>{tab.icon}</span>
                            <span className="truncate">{tab.label}</span>
                        </div>
                    </button>
                ))}
            </div>
            {/* Tab Content */}
            <div className="w-full bg-white p-4 rounded-md shadow-sm">
                {children}
            </div>
        </div>
    );
};

export default SubTabComponent;
