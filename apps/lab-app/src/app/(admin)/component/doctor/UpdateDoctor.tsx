import React, { useState, useEffect } from 'react';
import { Doctor } from '@/types/doctor/doctor';
import { FaHospital, FaIdCard, FaMapMarkerAlt, FaPhoneAlt, FaGraduationCap, FaUserMd, FaEnvelope, FaHeart } from 'react-icons/fa';

interface UpdateDoctorProps {
  editDoctor: Doctor;
  handleUpdate: (doctor: Doctor) => void;
}

const UpdateDoctor = ({ editDoctor, handleUpdate }: UpdateDoctorProps) => {
  const [updatedDoctor, setUpdatedDoctor] = useState<Doctor>(editDoctor);

  useEffect(() => {
    setUpdatedDoctor(editDoctor);
  }, [editDoctor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedDoctor((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdate(updatedDoctor);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gradient-to-r from-white via-gray-100 to-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="mb-2">
          <label htmlFor="name" className="text-xs font-medium text-gray-700 flex items-center">
            <FaUserMd className="mr-2" /> Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={updatedDoctor.name}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-2">
          <label htmlFor="speciality" className="text-xs font-medium text-gray-700 flex items-center">
            <FaHeart className="mr-2" /> Speciality
          </label>
          <input
            type="text"
            id="speciality"
            name="speciality"
            value={updatedDoctor.speciality}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-2">
          <label htmlFor="email" className="text-xs font-medium text-gray-700 flex items-center">
            <FaEnvelope className="mr-2" /> Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={updatedDoctor.email}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-2">
          <label htmlFor="phone" className="text-xs font-medium text-gray-700 flex items-center">
            <FaPhoneAlt className="mr-2" /> Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={updatedDoctor.phone}
            onChange={(event) => {
              // Only allow numeric input
              const numericValue = event.target.value.replace(/\D/g, '');
              const numericEvent = {
                ...event,
                target: {
                  ...event.target,
                  value: numericValue
                }
              };
              handleChange(numericEvent);
            }}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            onKeyPress={(e) => {
              // Prevent non-numeric characters
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
          />
        </div>

        {/* Right Column */}
        <div className="mb-2">
          <label htmlFor="qualification" className="text-xs font-medium text-gray-700 flex items-center">
            <FaGraduationCap className="mr-2" /> Qualification
          </label>
          <input
            type="text"
            id="qualification"
            name="qualification"
            value={updatedDoctor.qualification}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-2">
          <label htmlFor="hospitalAffiliation" className="text-xs font-medium text-gray-700 flex items-center">
            <FaHospital className="mr-2" /> Hospital Affiliation
          </label>
          <input
            type="text"
            id="hospitalAffiliation"
            name="hospitalAffiliation"
            value={updatedDoctor.hospitalAffiliation}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-2">
          <label htmlFor="licenseNumber" className="text-xs font-medium text-gray-700 flex items-center">
            <FaIdCard className="mr-2" /> License Number
          </label>
          <input
            type="text"
            id="licenseNumber"
            name="licenseNumber"
            value={updatedDoctor.licenseNumber}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-2">
          <label htmlFor="address" className="text-xs font-medium text-gray-700 flex items-center">
            <FaMapMarkerAlt className="mr-2" /> Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={updatedDoctor.address}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left Column (continued) */}
        <div className="mb-2">
          <label htmlFor="city" className="text-xs font-medium text-gray-700 flex items-center">
            <FaMapMarkerAlt className="mr-2" /> City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={updatedDoctor.city}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-2">
          <label htmlFor="state" className="text-xs font-medium text-gray-700 flex items-center">
            <FaMapMarkerAlt className="mr-2" /> State
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={updatedDoctor.state}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>

        {/* Right Column (continued) */}
        <div className="mb-2">
          <label htmlFor="country" className="text-xs font-medium text-gray-700 flex items-center">
            <FaMapMarkerAlt className="mr-2" /> Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={updatedDoctor.country}
            onChange={handleChange}
            className="mt-1 block w-full p-2 text-xs border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 w-full"
      >
        Update Doctor
      </button>
    </form>
  );
};

export default UpdateDoctor;
