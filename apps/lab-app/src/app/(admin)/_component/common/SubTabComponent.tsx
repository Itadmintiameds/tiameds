'use client';

import { useState } from 'react';

// Custom hook to manage tab state
function useTabManager(initialTab: string, tabs: Tab[]) {
  const [activeTab, setActiveTab] = useState<string>(
    tabs.some((tab) => tab.key === initialTab) ? initialTab : tabs[0].key
  );

  const changeTab = (tab: string) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  return { activeTab, changeTab };
}

// Interface to define tab structure for props
interface Tab {
  key: string;
  icon: React.ReactNode;
  label: string;
  content: React.ReactNode;
}

interface SubTabComponentProps {
  initialTab: string;
  tabs: Tab[];
}

const SubTabComponent: React.FC<SubTabComponentProps> = ({ initialTab, tabs }) => {
  const { activeTab, changeTab } = useTabManager(initialTab, tabs);

  return (
    <div>
      {/* Tab Navigation (aligned to the left) */}
      <div className="flex flex-wrap justify-start gap-4 mb-6">
        {tabs.map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => changeTab(key)}
            className={`group relative flex flex-col items-center justify-center p-2 w-16 h-16 rounded-lg shadow-md transition-all duration-200
              ${activeTab === key ? 'bg-indigo-800 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:shadow-md'}`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300
                ${activeTab === key ? 'bg-white text-indigo-500' : 'bg-indigo-100 text-indigo-700 group-hover:scale-110'}`}
            >
              {icon}
            </div>
            <span className="mt-1 text-xs font-semibold">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="text-gray-800 text-base">
          {tabs.map(
            ({ key, content }) =>
              activeTab === key && <div key={key}>{content}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubTabComponent;
