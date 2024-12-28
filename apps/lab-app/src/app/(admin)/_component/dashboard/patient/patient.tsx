import React, { useState } from 'react';
import SubTabComponent from '../../common/SubTabComponent';
import PatientList from './PatientList';
import AddPatient from './AddPatient';
import VisitingList from './_components/VisitingList';
import BillingList from './_components/BillingList';

import { Home } from 'lucide-react';
import { IoIosMan } from 'react-icons/io';

const tabs = [
  { id: 'AddPatient', icon: <IoIosMan size={16} />, label: 'Add Patient', content: <AddPatient /> },
  { id: 'patients', icon: <Home size={16} />, label: 'Patients', content: <PatientList /> },
  { id: 'visits', icon: <Home size={16} />, label: 'Visits', content: <VisitingList /> },
  { id: 'billing', icon: <Home size={16} />, label: 'Billing', content: <BillingList /> },
  { id: 'reports', icon: <Home size={16} />, label: 'Reports', content: <div>Reports</div> },

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
