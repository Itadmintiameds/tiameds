'use client';

import { Clipboard, FilePlus, ShoppingBag, Users } from 'lucide-react';
import { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { motion } from 'framer-motion';
import Table from '../_component/PatientTable';
import ResultsTable from '../_component/ResultsTable';
import TestTable from '../_component/TestTable';

// Define a custom hook for tab management
function useTabManager(initialTab: string) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isLoading, setIsLoading] = useState(false);

  const changeTab = (tab: string) => {
    if (tab !== activeTab) {
      setIsLoading(true);
      setActiveTab(tab);
      setTimeout(() => setIsLoading(false), 500); // Simulate loading time
    }
  };

  return { activeTab, isLoading, changeTab };
}

interface Status {
  status: 'success' | 'warning' | 'info';
  icon: JSX.Element;
  count: number;
  context: string;
  tooltip: string;
  bgColor: string; // Background color for the status card
  textColor: string; // Text color for the status card
  iconBgColor?: string; // Background color for the icon
}

const Page: React.FC = () => {
  const { activeTab, isLoading, changeTab } = useTabManager('purchases');

  const statuses: Record<string, Status> = {
    purchases: {
      status: 'info',
      icon: <ShoppingBag size={20} />,
      count: 0,
      context: 'Orders',
      tooltip: 'View and manage orders',
      bgColor: 'bg-blue-500', // Background color
      textColor: 'text-white', // Text color
    },
    newBill: {
      status: 'success',
      icon: <FilePlus size={20} />,
      count: 5,
      context: 'Bills',
      tooltip: 'Create and manage new bills',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
    },
    patients: {
      status: 'success',
      icon: <Users size={20} />,
      count: 10,
      context: 'Patients',
      tooltip: 'Manage patient information',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
    },
    tests: {
      status: 'info',
      icon: <Clipboard size={20} />,
      count: 2,
      context: 'Tests',
      tooltip: 'View and manage lab tests',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
    },
    results: {
      status: 'warning',
      icon: <Clipboard size={20} />,
      count: 1,
      context: 'Results',
      tooltip: 'View test results',
      bgColor: 'bg-yellow-500',
      textColor: 'text-black',
    },
  };

  return (
    <div className="container mx-auto p-4">
      {/* Status Section with Animation */}

      <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {Object.keys(statuses).map((key) => (
          <motion.div
            key={key}
            className={`flex flex-col items-center justify-center p-3 rounded-md shadow-sm transition-transform transform hover:scale-105 cursor-pointer 
        ${statuses[key].bgColor} ${activeTab === key ? 'border-2 border-indigo-600' : 'border-transparent'} transition duration-300 border border-gray-200`}
            data-tooltip-id="tooltip"
            data-tooltip-content={statuses[key].tooltip}
            whileHover={{ scale: 1.05 }}
            onClick={() => changeTab(key)}
          >
            <div className={`flex items-center text-white justify-center mb-2 p-1 rounded-full ${statuses[key].iconBgColor}`}>
              {statuses[key].icon}
            </div>
            <span className={`font-semibold text-base text-white ${statuses[key].textColor}`}>
              {statuses[key].count.toLocaleString()}
            </span>
            <span className={`text-xs text-white`}>{statuses[key].context}</span>
          </motion.div>
        ))}
      </motion.div>





      {/* Tooltip */}
      <Tooltip id="tooltip" place="top" />

      {/* Tab Navigation */}
      <motion.div className="relative border-b mb-4 text-sm font-semibold">
        <div className="flex space-x-4 overflow-x-auto">
          {Object.keys(statuses).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => changeTab(tab)}
              className={`flex items-center pb-2 transition-colors duration-300 border-b-2 
                ${activeTab === tab ? 'border-indigo-900 text-indigo-900' : 'border-transparent text-gray-600 hover:text-indigo-600'}`}
              aria-selected={activeTab === tab}
              whileTap={{ scale: 0.95 }}
            >
              {statuses[tab].icon}
              <span className="ml-1">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content with Loading Spinner */}
      <div className="bg-white shadow-md rounded-xl ">
        {isLoading ? (
          <motion.div
            className="flex items-center justify-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-900"></div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {activeTab === 'purchases' && <Table />}
            {activeTab === 'newBill' && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-indigo-900">New Bill</h2>
                <p className="text-gray-700">Create a new bill or perform a test here.</p>
              </div>
            )}
            {activeTab === 'patients' && <Table />}
            {activeTab === 'tests' && <TestTable />}
            {activeTab === 'results' && <ResultsTable />}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Page;
