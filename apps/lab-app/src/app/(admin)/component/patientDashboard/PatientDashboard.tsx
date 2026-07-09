import React from 'react'
import PatientVisitListTable from './PatientVisitListTable'

interface PatientDashboardProps {
  onAddPatientFormChange?: (isOpen: boolean) => void;
}

const PatientDashboard = ({ onAddPatientFormChange }: PatientDashboardProps) => {
  return (
    <PatientVisitListTable onAddPatientFormChange={onAddPatientFormChange} />
  )
}
export default PatientDashboard
