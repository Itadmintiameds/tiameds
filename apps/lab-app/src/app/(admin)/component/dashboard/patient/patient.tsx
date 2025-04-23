import { useCallback, useEffect, useState } from 'react';
import SubTabComponent from '../../common/SubTabComponent';
import AddPatient from './AddPatient';
import VisitingList from './_components/VisitingList';
import { Home } from 'lucide-react';
import { IoIosMan } from 'react-icons/io';
import BeataComponent from '../../common/BeataComponent';
import Loader from '../../common/Loader';
import LabReport from './LabReport';

const tabs = [
  { id: 'AddPatient', icon: <IoIosMan size={16} />, label: 'Add Patient', content: <AddPatient /> },
  // { id: 'patients', icon: <Home size={16} />, label: 'Patients', content: <PatientList /> },
  { id: 'visits', icon: <Home size={16} />, label: 'Patients Visits', content: <VisitingList /> },
  // { id: 'billing', icon: <Home size={16} />, label: 'Billing', content: <BillingList /> },
  { id: 'billing', icon: <Home size={16} />, label: 'Billing', content: <BeataComponent /> },
  { id: 'reports', icon: <Home size={16} />, label: 'Reports', content: <LabReport /> }
];

const Patient = () => {
  const [activeTab, setActiveTab] = useState<string | null>('visits');

  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      setActiveTab(savedTab); 
    } else {
      setActiveTab('patients'); 
    }
  }, []);

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab]);


  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  if (activeTab === null) {
    return <Loader />;  
  }
  
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;
  return (
    <SubTabComponent tabs={tabs} selectedTab={activeTab} onTabChange={handleTabChange}>
      {activeTabContent || <div>No content available</div>}
    </SubTabComponent>
  );
};

export default Patient;
