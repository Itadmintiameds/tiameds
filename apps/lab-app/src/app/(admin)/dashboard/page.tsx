'use client';
import { useLabs } from '@/context/LabContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaPerson } from "react-icons/fa6";
import { MdOutlineDashboard } from "react-icons/md";
import Statistics from '../component/dashboard/statistics/Statistics';
import PatientDashboard from '../component/patientDashboard/PatientDashboard';
import Technacian from './sample/_component/technican/Technacian';

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
  {
    id: 'technician',
    label: 'Sample Management',
    icon: <FaPerson className="text-lg" />,
    activeColor: 'text-blue-600',
    borderColor: 'bg-blue-600',
    bgColor: 'bg-blue-100'
  }
];

const TabButton = ({ tab, isActive, onClick }: { tab: typeof tabs[0], isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-3 flex items-center space-x-2 transition-all duration-300 ${isActive ? tab.activeColor : 'text-gray-500 hover:text-gray-700'
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
  const [selectedTab, setSelectedTab] = useState<string>('patient');
  const { loginedUser,setLoginedUser } = useLabs();

  useEffect(() => {
    const loggedUser = localStorage.getItem('logedUser');
    console.log("Logged User:", loggedUser);
    if (loggedUser) {
      try {
        setLoginedUser(JSON.parse(loggedUser));
      } catch (e) {
        console.error("Failed to parse loggedUser:", e);
      }
    }
  }, [setLoginedUser]);

  // Check user roles
  const isSuperAdmin = loginedUser?.roles?.includes('SUPERADMIN');
  const isAdmin = loginedUser?.roles?.includes('ADMIN');
  const isTechnician = loginedUser?.roles?.includes('TECHNICIAN');
  const isDeskRole = loginedUser?.roles?.includes('DESKROLE');
  

  // Filter tabs based on user role
  const filteredTabs = tabs.filter(tab => {
    if (isAdmin || isSuperAdmin) return true; // ADMIN and SUPERADMIN see all tabs
    if (isTechnician) return tab.id === 'technician'; // TECHNICIAN only gets technician tab
    if (isDeskRole) return tab.id === 'patient'; // DESKROLE only gets patient tab
    return false;
  });

  useEffect(() => {
    
    if (filteredTabs.length > 0 && !filteredTabs.some(tab => tab.id === selectedTab)) {
      setSelectedTab(filteredTabs[0].id);
    }
  }, [filteredTabs, selectedTab]);

  // Render only the component the role should see
  const renderContent = () => {
    if (isAdmin || isSuperAdmin) {
      switch (selectedTab) {
        case 'patient': return <PatientDashboard />;
        case 'dashboard': return <Statistics />;
        case 'technician': return <Technacian />;
        default: return <PatientDashboard />;
      }
    }
    if (isTechnician) return <Technacian />;
    if (isDeskRole) return <PatientDashboard />;
    return null;
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Show tabs only if user is ADMIN */}
        {isAdmin || isSuperAdmin ? (
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
        ) : null}

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
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Page;