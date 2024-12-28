import SubTabComponent from '../../common/SubTabComponent';
import PatientList from './PatientList';
import AddPatient from './AddPatient';
import React, { useState } from 'react';
import { Home } from 'lucide-react';
import { IoIosMan } from 'react-icons/io';

const tabs = [
  { id: 'AddPatient', icon: <IoIosMan size={16} />, label: 'Add Patient', content: <AddPatient /> },
  { id: 'patients', icon: <Home size={16} />, label: 'Patients', content: <PatientList /> },
];

const Patient = () => {
  const [activeTab, setActiveTab] = useState<string>('patients');

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <SubTabComponent tabs={tabs} selectedTab={activeTab} onTabChange={handleTabChange}>
      {/* Display the content for the selected tab */}
      {tabs.find((tab) => tab.id === activeTab)?.content}
    </SubTabComponent>
  );
};

export default Patient;
