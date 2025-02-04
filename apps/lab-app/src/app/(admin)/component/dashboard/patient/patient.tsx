import React, { useState, useEffect, useCallback } from 'react';
import SubTabComponent from '../../common/SubTabComponent';
import PatientList from './PatientList';
import AddPatient from './AddPatient';
import VisitingList from './_components/VisitingList';
import BillingList from './_components/BillingList';
import { Home } from 'lucide-react';
import { IoIosMan } from 'react-icons/io';
import Loader from '../../common/Loader';

// Memoized tab content to avoid unnecessary re-renders
const tabs = [
  { id: 'AddPatient', icon: <IoIosMan size={16} />, label: 'Add Patient', content: <AddPatient /> },
  { id: 'patients', icon: <Home size={16} />, label: 'Patients', content: <PatientList /> },
  { id: 'visits', icon: <Home size={16} />, label: 'Visits', content: <VisitingList /> },
  { id: 'billing', icon: <Home size={16} />, label: 'Billing', content: <BillingList /> },
  { id: 'reports', icon: <Home size={16} />, label: 'Reports', content: <div>Reports</div> },
];

const Patient = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null); // Initial state set to null

  // Loading saved tab from localStorage (this will run immediately after the component mounts)
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      setActiveTab(savedTab);  // Set the saved tab if available
    } else {
      setActiveTab('patients');  // Default tab if none is saved
    }
  }, []);

  // Saving activeTab to localStorage whenever it changes
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab]);

  // Optimized tab change handler using useCallback
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  // Ensure we only render content when activeTab has been initialized
  if (activeTab === null) {
    return <Loader />;  
  }

  // Finding the content of the active tab
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <SubTabComponent tabs={tabs} selectedTab={activeTab} onTabChange={handleTabChange}>
      {activeTabContent || <div>No content available</div>}
    </SubTabComponent>
  );
};

export default Patient;
