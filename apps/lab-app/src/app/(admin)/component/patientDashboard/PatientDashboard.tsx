import React from 'react'
import PatientVisitListTable from './PatientVisitListTable'

const PatientDashboard = () => {
  return (
    <div className='flex flex-col gap-4'>
      <h1 className='text-2xl font-bold'>Patient Dashboard</h1>
      <div className='overflow-x-auto'>
        <PatientVisitListTable />
      </div>
    </div>
  )
}
export default PatientDashboard