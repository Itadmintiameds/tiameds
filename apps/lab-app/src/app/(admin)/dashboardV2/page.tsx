'use client';

import { Clipboard, FilePlus, ShoppingBag, Users } from 'lucide-react';
import { useState } from 'react';
import Table from '../_component/PatientTable';
import ResultsTable from '../_component/ResultsTable';
import TestTable from '../_component/TestTable';

// Define a type for the status items to improve type safety
interface Status {
  status: 'success' | 'warning' | 'info';
  icon: JSX.Element;
  count: number;
  context: string;
  tooltip: string;
}

const Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'purchases' | 'newBill' | 'patients' | 'tests' | 'results'>('purchases');

  // Define the statuses with explicit types
  const statuses: Record<string, Status> = {
    purchases: {
      status: 'info',
      icon: <ShoppingBag size={16} />,
      count: 0,
      context: 'Orders',
      tooltip: 'View and manage orders',
    },
    newBill: {
      status: 'success',
      icon: <FilePlus size={16} />,
      count: 5,
      context: 'Bills',
      tooltip: 'Create and manage new bills',
    },
    patients: {
      status: 'success',
      icon: <Users size={16} />,
      count: 10,
      context: 'Patients',
      tooltip: 'Manage patient information',
    },
    tests: {
      status: 'info',
      icon: <Clipboard size={16} />,
      count: 2,
      context: 'Tests',
      tooltip: 'View and manage lab tests',
    },
    results: {
      status: 'warning',
      icon: <Clipboard size={16} />,
      count: 1,
      context: 'Results',
      tooltip: 'View test results',
    },
  };

  // Function to get status classes based on the status type
  // const getStatusClass = (status: 'success' | 'warning' | 'info'): string => {
  //   switch (status) {
  //     case 'success':
  //       return 'bg-green-100 text-green-600';
  //     case 'warning':
  //       return 'bg-yellow-100 text-yellow-600';
  //     case 'info':
  //       return 'bg-blue-100 text-blue-600';
  //     default:
  //       return '';
  //   }
  // };

  return (
    <div className="container mx-auto p-4">
      {/* Status Section */}
      {/* <div className="flex space-x-4 mb-4">
        {Object.keys(statuses).map((key) => (
          <div
            key={key}
            className={`relative flex flex-col items-center justify-center w-20 h-20 p-2 rounded-md shadow-md transition duration-200 hover:bg-gray-100 ${getStatusClass(statuses[key].status)}`}
            role="status"
            aria-label={`${statuses[key].context} status`}
            title={statuses[key].tooltip}
          >
            <div className="flex items-center justify-center mb-2 text-xl">
              {statuses[key].icon}
            </div>
            <span className="font-medium text-gray-800">
              {statuses[key].count.toLocaleString()}
            </span>
            <span className="text-sm text-gray-600">{statuses[key].context}</span>
          </div>
        ))}
      </div> */}

      {/* Tab Navigation */}
      <div className="border-b border-indigo-900 mb-4 text-sm font-semibold">
        <div className="flex space-x-4">
          {Object.keys(statuses).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'purchases' | 'newBill' | 'patients' | 'tests' | 'results')}
              className={`flex items-center pb-2 transition-colors duration-300 border-b-2 ${activeTab === tab
                ? 'border-indigo-900 text-indigo-900'
                : 'border-transparent text-gray-600 hover:text-indigo-600'
                }`}
              aria-selected={activeTab === tab} // Indicate the currently selected tab
            >
              {statuses[tab].icon}
              <span className="ml-1">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-sm rounded-md">
        {activeTab === 'purchases' && (
          <div>
            {/* <h2 className="text-2xl font-bold mb-4 text-indigo-900">Purchases</h2> */}
            <Table />
          </div>
        )}
        {activeTab === 'newBill' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-900">New Bill</h2>
            <p className="text-gray-700">Create a new bill or perform a test here.</p>
          </div>
        )}
        {activeTab === 'patients' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-900">Patients</h2>
            <Table />
          </div>
        )}
        {activeTab === 'tests' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-900">Lab Tests</h2>
            <TestTable />
          </div>
        )}
        {activeTab === 'results' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-indigo-900">Test Results</h2>
            <ResultsTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
