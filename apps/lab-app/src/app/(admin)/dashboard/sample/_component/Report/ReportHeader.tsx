import React from 'react'
import { useLabs } from '@/context/LabContext';
import { FaMapMarkerAlt } from 'react-icons/fa';

const ReportHeader = () => {
    const { currentLab } = useLabs()
    return (
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="w-24 h-24 bg-white flex items-center justify-center rounded-lg border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-blue-50/50 flex items-center justify-center rounded-md border border-blue-100/50">
                    <span className="text-xs font-semibold text-blue-600/80 tracking-wider">LAB LOGO</span>
                </div>
            </div>
            
            <div className="text-end flex-1 space-y-1.5">
                <h2 className="text-2xl font-semibold text-slate-800 uppercase tracking-tight">
                    {currentLab?.name || 'Lab Name'}
                </h2>
                <div className="flex items-center justify-end gap-x-2">
                    <FaMapMarkerAlt className="text-blue-500/90 text-sm flex-shrink-0" />
                    <p className="text-sm text-slate-600 font-medium">
                        {currentLab?.address || 'Lab Address'}
                    </p>
                </div>
                <p className="text-sm text-slate-500 font-regular">
                    {currentLab?.city}, {currentLab?.state}
                </p>
            </div>
        </div> 
    )
}

export default ReportHeader