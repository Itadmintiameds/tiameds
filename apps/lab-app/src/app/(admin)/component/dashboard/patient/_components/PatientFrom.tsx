import { Patient } from '@/types/patient/patient';
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import Button from '../../../common/Button';

interface PatientFormProps {
  newPatient: Patient;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  searchTerm: string;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filteredPatients: Patient[];
  handlePatientSelect: (patient: Patient) => void;
  handleClearPatient: () => void;
}

enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

const PatientForm: React.FC<PatientFormProps> = ({
  newPatient,
  handleChange,
  searchTerm,
  handleSearchChange,
  filteredPatients,
  handlePatientSelect,
  handleClearPatient,
}) => {
  return (
    <section className="flex flex-col space-y-6 w-full max-w-4xl mx-auto p-4 border rounded-md border-gray-300 shadow-sm">
      {/* Search Phone Number */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={searchTerm || newPatient.phone} // Allow input from both searchTerm and newPatient.phone
            onChange={(event) => {
              handleSearchChange(event); // Update search term
              handleChange(event); // Update new patient phone number
            }}
            className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            placeholder="Enter phone number"
          />

          {filteredPatients.length > 0 && (
            <div className="mt-2 bg-white border border-gray-300 rounded-md shadow-sm">
              {filteredPatients.map((patientItem, index) => (
                <div
                  key={index}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handlePatientSelect(patientItem)} // When patient is selected
                >
                  <p className="text-sm text-gray-700">{patientItem.firstName} {patientItem.lastName}</p>
                  <p className="text-xs text-gray-500">{patientItem.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1">
          <Button
            type="button"
            text=""
            onClick={handleClearPatient} // Clear patient selection or search input
            className="bg-clear mt-6 text-white px-4 py-2 rounded-md hover:bg-clearhover transition"
          >
            <FaTimes />
          </Button>
        </div>
      </div>

      {/* Patient Details Form */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={newPatient.firstName} // Bind to newPatient state for form
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter first name"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={newPatient.lastName} // Bind to newPatient state for form
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
          <select
            name="bloodGroup"
            value={newPatient.bloodGroup ?? BloodGroup.O_POSITIVE} // Ensure a default value
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(BloodGroup).map((bloodGroup) => (
              <option key={bloodGroup} value={bloodGroup}>{bloodGroup}</option>
            ))}
          </select>

        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">Gender</label>
          <select
            name="gender"
            value={newPatient.gender} // Bind to newPatient state for form
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(Gender).map((gender) => (
              <option key={gender} value={gender}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={newPatient.email} // Bind to newPatient state for form
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={newPatient.address} // Bind to newPatient state for form
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter address"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">City</label>
          <input
            type="text"
            name="city"
            value={newPatient.city} // Bind to newPatient state for form
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter city"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">State</label>
          <input
            type="text"
            name="state"
            value={newPatient.state} // Bind to newPatient state for form
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter state"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">Zip</label>
          <input
            type="text"
            name="zip"
            value={newPatient.zip} // Bind to newPatient state for form
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter zip"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">Date Of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={newPatient.dateOfBirth} // Bind to newPatient state for form
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </section>
  );
};

export default PatientForm;
