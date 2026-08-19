import React from 'react';
import { Doctor } from '@/types/doctor/doctor';
import { FaHospital, FaIdCard, FaMapMarkerAlt, FaStethoscope, FaUser } from 'react-icons/fa';

const DoctorProfile = ({ selectedDoctor }: { selectedDoctor: Doctor }) => {
  // Get the first letter of the doctor's name for the avatar
  const avatarLetter = selectedDoctor.name.charAt(0).toUpperCase();

  const fullAddress = selectedDoctor.address
    ? `${selectedDoctor.address}, ${selectedDoctor.city || ''}, ${selectedDoctor.state || ''}, ${selectedDoctor.country || ''}`
        .replace(/,\s*,/g, ',')
        .replace(/^,\s*|,\s*$/g, '')
    : 'N/A';

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="flex items-center gap-4 pb-4 border-b border-pneutral-200">
        <div className="w-16 h-16 rounded-full bg-secondary-700 text-pneutral-50 flex items-center justify-center text-2xl font-semibold shrink-0">
          {avatarLetter}
        </div>
        <div>
          <h2 className="text-h5 font-semibold text-pneutral-900">{selectedDoctor.name}</h2>
          {selectedDoctor.speciality && (
            <span className="mt-1 inline-flex items-center rounded-full bg-info-50 px-3 py-1 text-p2 font-medium text-info-700">
              {selectedDoctor.speciality}
            </span>
          )}
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-info-50 rounded-lg p-4 space-y-4">
        <h4 className="font-semibold text-info-700 text-p3 flex items-center gap-2">
          <FaUser className="text-info-600" size={16} />
          Personal Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-p2 text-pneutral-500 mb-1">Email</p>
            <p className="text-p3 font-medium text-pneutral-900">{selectedDoctor.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-p2 text-pneutral-500 mb-1">Phone</p>
            <p className="text-p3 font-medium text-pneutral-900">{selectedDoctor.phone || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Professional Information Section */}
      <div className="bg-danger-100 rounded-lg p-4 space-y-4">
        <h4 className="font-semibold text-warning-800 text-p3 flex items-center gap-2">
          <FaStethoscope className="text-success-800" size={16} />
          Professional Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-p2 text-pneutral-500 mb-1">Speciality</p>
            <p className="text-p3 font-medium text-pneutral-900">{selectedDoctor.speciality || 'N/A'}</p>
          </div>
          <div>
            <p className="text-p2 text-pneutral-500 mb-1">Qualification</p>
            <p className="text-p3 font-medium text-pneutral-900">{selectedDoctor.qualification || 'N/A'}</p>
          </div>
          <div>
            <p className="text-p2 text-pneutral-500 mb-1 flex items-center gap-1">
              <FaHospital size={11} /> Hospital Affiliation
            </p>
            <p className="text-p3 font-medium text-pneutral-900">{selectedDoctor.hospitalAffiliation || 'N/A'}</p>
          </div>
          <div>
            <p className="text-p2 text-pneutral-500 mb-1 flex items-center gap-1">
              <FaIdCard size={11} /> License Number
            </p>
            <p className="text-p3 font-medium text-pneutral-900">{selectedDoctor.licenseNumber || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Address Information Section */}
      <div className="bg-success-50 rounded-lg p-4 space-y-2">
        <h4 className="font-semibold text-success-800 text-p3 flex items-center gap-2">
          <FaMapMarkerAlt className="text-success-700" size={16} />
          Address Information
        </h4>
        <p className="text-p3 font-medium text-pneutral-900">{fullAddress}</p>
      </div>
    </div>
  );
};

export default DoctorProfile;
