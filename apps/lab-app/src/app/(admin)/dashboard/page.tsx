'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPerson } from "react-icons/fa6";
import { MdOutlineDashboard } from "react-icons/md";
import { IoMdAnalytics } from "react-icons/io";
import Statistics from '../component/dashboard/statistics/Statistics';
import PatientDashboard from '../component/patientDashboard/PatientDashboard';
import Patient from '@/app/(admin)/component/dashboard/patient/patient';

const tabs = [
  { 
    id: 'patient', 
    label: 'Patient Management', 
    icon: <FaPerson className="text-lg" />,
    activeColor: 'text-purple-600',
    borderColor: 'bg-purple-600',
    bgColor: 'bg-purple-100'
  },
  { 
    id: 'dashboard', 
    label: 'Analytics Dashboard', 
    icon: <MdOutlineDashboard className="text-lg" />,
    activeColor: 'text-teal-600',
    borderColor: 'bg-teal-600',
    bgColor: 'bg-teal-100'
  },
  // { 
  //   id: 'patientNewdashboard', 
  //   label: 'Patient Management New', 
  //   icon: <IoMdAnalytics className="text-lg" />,
  //   activeColor: 'text-teal-600',
  //   borderColor: 'bg-teal-600',
  //   bgColor: 'bg-teal-100'
  // },
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
  const [selectedTab, setSelectedTab] = useState<string>('patientNewdashboard');
  
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
              {/* {selectedTab === 'patient' && <Patient />} */}
              {selectedTab === 'patient' &&  <PatientDashboard />}
              {selectedTab === 'dashboard' && <Statistics />}
              {/* {selectedTab === 'patientNewdashboard' && <PatientDashboard />} */}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Page;