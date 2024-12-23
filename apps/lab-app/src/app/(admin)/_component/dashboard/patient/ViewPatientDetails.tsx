import React from "react";
import { Patient } from "@/types/patient/patient";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaTint,
} from "react-icons/fa";

interface PatientProps {
  patient: Patient;
}

const ViewPatientDetails = ({ patient }: PatientProps) => {
  const getAvatarInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Name and Avatar Row */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex justify-center items-center w-16 h-16 bg-blue-500 text-white text-2xl font-bold rounded-full shadow-lg">
          {getAvatarInitials(patient.firstName, patient.lastName)}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {patient.firstName} {patient.lastName}
          </h2>
          <p className="text-gray-500">Patient Details</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1 */}
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center space-x-2">
            <FaEnvelope className="text-blue-500" />
            <span className="font-medium text-gray-600">Email:</span>
            <span className="text-gray-800">{patient.email}</span>
          </div>

          {/* Phone */}
          <div className="flex items-center space-x-2">
            <FaPhoneAlt className="text-green-500" />
            <span className="font-medium text-gray-600">Phone:</span>
            <span className="text-gray-800">{patient.phone}</span>
          </div>

          {/* Blood Group */}
          <div className="flex items-center space-x-2">
            <FaTint className="text-red-600" />
            <span className="font-medium text-gray-600">Blood Group:</span>
            <span className="text-gray-800">{patient.bloodGroup}</span>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          {/* Address */}
          <div className="flex items-center space-x-2">
            <FaMapMarkerAlt className="text-red-500" />
            <span className="font-medium text-gray-600">Address:</span>
            <span className="text-gray-800">
              {/* {`${patient.address}, ${patient.city}, ${patient.state}, ${patient.zip}`} */}
              {`${patient.address}, ${patient.city}, ${patient.state}`}
            </span>
          </div>

          {/* Date of Birth */}
          <div className="flex items-center space-x-2">
            <FaBirthdayCake className="text-yellow-500" />
            <span className="font-medium text-gray-600">Date of Birth:</span>
            <span className="text-gray-800">
              {new Date(patient.dateOfBirth).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPatientDetails;
