import SubTabComponent from '../../common/SubTabComponent';
import PatientList from './PatientList';
import AddPatient from './AddPatient';
import React, { useState } from 'react';

import { Home } from 'lucide-react';
import { PiFinnTheHuman } from 'react-icons/pi';

const tabs = [
  { key: 'AddPatient', icon: <PiFinnTheHuman size={16} />, label: 'Add Patient', content: <AddPatient /> },
  { key: 'patients', icon: <Home size={16} />, label: 'Patients', content: <PatientList /> },
];

const Patient = () => {
  const [activeTab, setActiveTab] = useState<string>('patients');
  
  return <SubTabComponent initialTab={activeTab} tabs={tabs} />;
};

export default Patient;
