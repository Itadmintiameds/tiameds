import React from 'react'
import { useLabs } from '@/context/LabContext';
import { FaMapMarkerAlt } from 'react-icons/fa';

const ReportHeader = () => {
    const { currentLab } = useLabs()
    return (
        <div className="flex items-center justify-between  bg-gradient-to-r from-blue-50 to-blue-100 shadow-md rounded-lg p-4">
            <div className="w-20 h-20 bg-gray-300 flex items-center justify-center rounded-md">
                <span className="text-sm text-gray-600">Lab Logo</span>
            </div>
            <div className="text-end flex-1">
                <h2 className="text-2xl font-bold uppercase">{currentLab?.name || 'Lab Name'}</h2>
                <p className="text-sm text-gray-700"><FaMapMarkerAlt className="inline-block mr-2" />{currentLab?.address || 'Lab Address'}</p>
                <p className="text-sm text-gray-700">{currentLab?.city}, {currentLab?.state}</p>
            </div>
        </div> 
    )
}
export default ReportHeader