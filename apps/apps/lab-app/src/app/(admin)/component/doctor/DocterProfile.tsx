import React from 'react';
import { FaEnvelope, FaStethoscope, FaGraduationCap, FaHospital, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { Doctor } from '@/types/doctor/doctor';

const DoctorProfile = ({ selectedDoctor }: { selectedDoctor: Doctor }) => {
  // Get the first letter of the doctor's name for the avatar
  const avatarLetter = selectedDoctor.name.charAt(0).toUpperCase();

  return (
    <div className=" bg-gradient-to-r from-white via-gray-100 to-gray-200">

      <div className="flex items-center space-x-4">
        {/* Avatar with the first letter */}
        <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-semibold">
          {avatarLetter}
        </div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-wide">{selectedDoctor.name}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
        {/* Left column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm">
            <FaEnvelope className="text-xl text-blue-500" />
            <p className="text-gray-800 font-medium"><strong>Email:</strong> {selectedDoctor.email}</p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <FaStethoscope className="text-xl text-purple-600" />
            <p className="text-gray-800 font-medium"><strong>Specialty:</strong> {selectedDoctor.speciality}</p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <FaGraduationCap className="text-xl text-orange-500" />
            <p className="text-gray-800 font-medium"><strong>Qualification:</strong> {selectedDoctor.qualification}</p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <FaHospital className="text-xl text-teal-600" />
            <p className="text-gray-800 font-medium"><strong>Hospital Affiliation:</strong> {selectedDoctor.hospitalAffiliation}</p>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm">
            <FaPhoneAlt className="text-xl text-yellow-500" />
            <p className="text-gray-800 font-medium"><strong>Phone:</strong> {selectedDoctor.phone}</p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <FaMapMarkerAlt className="text-xl text-red-500" />
            <p className="text-gray-800 font-medium"><strong>Address:</strong> {selectedDoctor.address}, {selectedDoctor.city}, {selectedDoctor.state}, {selectedDoctor.country}</p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <p className="text-gray-800 font-medium"><strong>License Number:</strong> {selectedDoctor.licenseNumber}</p>
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
