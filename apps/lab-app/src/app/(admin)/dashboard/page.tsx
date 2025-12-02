'use client';

import { useAuth } from '@/hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
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

// Component that uses useSearchParams - needs to be wrapped in Suspense
const DashboardContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tabParam = searchParams.get('tab');
  const [selectedTab, setSelectedTab] = useState<string>('patient');
  const [hasMounted, setHasMounted] = useState(false);
  const { isAdmin, isSuperAdmin, isTechnician, isDeskRole } = useAuth();

  useEffect(() => {
    setHasMounted(true);
  }, []);


  // Filter tabs based on user role
  const filteredTabs = tabs.filter(tab => {
    if (isAdmin || isSuperAdmin) return true; // ADMIN and SUPERADMIN see all tabs
    // If user has both DESKROLE and TECHNICIAN roles, show both tabs
    if (isDeskRole && isTechnician) {
      return tab.id === 'patient' || tab.id === 'technician';
    }
    if (isTechnician) return tab.id === 'technician'; // TECHNICIAN only gets technician tab
    if (isDeskRole) return tab.id === 'patient'; // DESKROLE only gets patient tab
    return false;
  });

  // Handle tab change with URL update
  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId);
    // Update URL without page reload
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    // Handle URL parameter for tab selection
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      setSelectedTab(tabParam);
    } else if (filteredTabs.length > 0 && !filteredTabs.some(tab => tab.id === selectedTab)) {
      setSelectedTab(filteredTabs[0].id);
    }
  }, [filteredTabs, selectedTab, tabParam]);

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
    // If user has both DESKROLE and TECHNICIAN roles, allow switching between tabs
    if (isDeskRole && isTechnician) {
      switch (selectedTab) {
        case 'patient': return <PatientDashboard />;
        case 'technician': return <Technacian />;
        default: return <PatientDashboard />;
      }
    }
    if (isTechnician) return <Technacian />;
    if (isDeskRole) return <PatientDashboard />;
    return null;
  };

  if (!hasMounted) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200 px-4">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className="relative px-4 py-3 flex items-center space-x-2 text-gray-300"
              >
                <span className="p-1.5 rounded-md bg-gray-100 animate-pulse h-8 w-8" />
                <span className="h-4 w-32 bg-gray-100 animate-pulse rounded" />
              </div>
            ))}
          </div>
          <div className="py-8 px-6">
            <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Show tabs if user is ADMIN/SUPERADMIN or has both DESKROLE and TECHNICIAN roles */}
        {(isAdmin || isSuperAdmin || (isDeskRole && isTechnician)) ? (
          <div className="flex border-b border-gray-200 px-4">
            {filteredTabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={selectedTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
              />
            ))}
          </div>
        ) : null}
        {/* Tab Content with Smooth Transition */}
        <div className="py-4 px-2">
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

// Main Page component with Suspense boundary
const Page = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
};

export default Page;