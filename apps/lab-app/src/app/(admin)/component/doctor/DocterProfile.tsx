import React from 'react';
import { FaEnvelope, FaStethoscope,  FaMapMarkerAlt } from 'react-icons/fa';
import { Doctor } from '@/types/doctor/doctor';

const DoctorProfile = ({ selectedDoctor }: { selectedDoctor: Doctor }) => {
  // Get the first letter of the doctor's name for the avatar
  const avatarLetter = selectedDoctor.name.charAt(0).toUpperCase();

  return (
    <div className="space-y-4 text-sm">
      {/* Header Section */}
      <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
        {/* Avatar with the first letter */}
        <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-semibold">
          {avatarLetter}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h2>
      </div>

      {/* Personal Information Section */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          <FaEnvelope className="mr-2 text-blue-500" size={16} />
          Personal Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-medium text-gray-600">Email:</span>
            <span className="ml-2 text-gray-900">{selectedDoctor.email || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Phone:</span>
            <span className="ml-2 text-gray-900">{selectedDoctor.phone || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Professional Information Section */}
      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
        <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
          <FaStethoscope className="mr-2 text-purple-500" size={16} />
          Professional Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-medium text-gray-600">Speciality:</span>
            <span className="ml-2 text-gray-900">{selectedDoctor.speciality || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Qualification:</span>
            <span className="ml-2 text-gray-900">{selectedDoctor.qualification || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Hospital Affiliation:</span>
            <span className="ml-2 text-gray-900">{selectedDoctor.hospitalAffiliation || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">License Number:</span>
            <span className="ml-2 text-gray-900">{selectedDoctor.licenseNumber || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Address Information Section */}
      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
        <h4 className="font-semibold text-green-800 mb-2 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-green-500" size={16} />
          Address Information
        </h4>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div>
            <span className="font-medium text-gray-600">Address:</span>
            <span className="ml-2 text-gray-900">
              {selectedDoctor.address ? 
                `${selectedDoctor.address}, ${selectedDoctor.city || ''}, ${selectedDoctor.state || ''}, ${selectedDoctor.country || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '') 
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;














// import React from 'react';
// import { Doctor } from '@/types/doctor/doctor';

// interface DoctorProfileProps {
//   selectedDoctor: Doctor;
// }

// const DoctorProfile: React.FC<DoctorProfileProps> = ({ selectedDoctor }) => {
//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-4">{selectedDoctor.name}</h2>
//       <p><strong>Specialty:</strong> {selectedDoctor.speciality}</p>
//       <p><strong>Email:</strong> {selectedDoctor.email}</p>
//       <p><strong>Phone:</strong> {selectedDoctor.phone}</p>
//       {/* Add more details as required */}
//     </div>
//   );
// };

// export default DoctorProfile;
