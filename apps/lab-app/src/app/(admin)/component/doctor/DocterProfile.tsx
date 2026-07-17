import React from 'react';
import { Doctor } from '@/types/doctor/doctor';

const DoctorProfile = ({ selectedDoctor }: { selectedDoctor: Doctor }) => {
  // Get the first letter of the doctor's name for the avatar
  const avatarLetter = selectedDoctor.name.charAt(0).toUpperCase();

  const fullAddress = selectedDoctor.address
    ? `${selectedDoctor.address}, ${selectedDoctor.city || ''}, ${selectedDoctor.state || ''}, ${selectedDoctor.country || ''}`
        .replace(/,\s*,/g, ',')
        .replace(/^,\s*|,\s*$/g, '')
    : 'N/A';

  return (
    <div className="space-y-3 text-sm">
      {/* Header Section */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-semibold shrink-0">
          {avatarLetter}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{selectedDoctor.name}</h2>
          {selectedDoctor.speciality && (
            <p className="text-sm text-purple-600 font-medium">{selectedDoctor.speciality}</p>
          )}
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Personal Information
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="text-sm font-medium text-gray-800">{selectedDoctor.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Phone</p>
            <p className="text-sm font-medium text-gray-800">{selectedDoctor.phone || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Professional Information Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Professional Information
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Speciality</p>
            <p className="text-sm font-medium text-gray-800">{selectedDoctor.speciality || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Qualification</p>
            <p className="text-sm font-medium text-gray-800">{selectedDoctor.qualification || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Hospital Affiliation</p>
            <p className="text-sm font-medium text-gray-800">{selectedDoctor.hospitalAffiliation || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">License Number</p>
            <p className="text-sm font-medium text-gray-800">{selectedDoctor.licenseNumber || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Address Information Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Address Information
        </p>
        <p className="text-sm font-medium text-gray-800">{fullAddress}</p>
      </div>
    </div>
  );
};

export default DoctorProfile;
