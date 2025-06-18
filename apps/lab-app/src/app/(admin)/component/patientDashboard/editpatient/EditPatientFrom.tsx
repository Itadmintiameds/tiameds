import { Patient } from '@/types/patient/patient';
import React from 'react';

interface PatientFormProps {
  newPatient: Patient;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  searchTerm: string;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filteredPatients: Patient[];
  handlePatientSelect: (patient: Patient) => void;
   isEditMode?: boolean; // Optional prop to indicate if it's in edit mode
}

enum Gender {
  Male = 'male',
  Female = 'female',
  // Other = 'other',
}

const EditPatientFrom : React.FC<PatientFormProps> = ({
  newPatient,
  handleChange,
  searchTerm,
  handleSearchChange,
  filteredPatients,
  handlePatientSelect,
    // isEditMode = false, // Default to false if not provided
}) => {
  return (
    <section className="flex flex-col space-y-3 w-full max-w-3xl mx-auto p-3 border rounded-lg border-gray-200 shadow-xs bg-white">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
            Phone <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              required
              value={searchTerm || newPatient.phone}
              onChange={(event) => {
                handleSearchChange(event);
                handleChange(event);
              }}
              className="border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter phone number"
            />
            {filteredPatients.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-xs max-h-60 overflow-y-auto">
                {filteredPatients.map((patientItem, index) => (
                  <div
                    key={index}
                    className="p-1.5 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    onClick={() => handlePatientSelect(patientItem)}
                  >
                    <p className="text-xs font-medium text-gray-800">{patientItem.firstName} {patientItem.lastName}</p>
                    <p className="text-[0.65rem] text-gray-500">{patientItem.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
            Patient Name <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            required
            value={newPatient.firstName}
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="First name"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
            Gender <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select
            name="gender"
            required
            value={newPatient.gender}
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(Gender).map((gender) => (
              <option key={gender} value={gender}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={newPatient.city}
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="City"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
            Date of Birth <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="date"
            name="dateOfBirth"
            
            value={newPatient.dateOfBirth}
            onChange={handleChange}
            className="border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="text-right mt-1">
        <p className="text-[0.65rem] text-gray-500">
          <span className="text-red-500">*</span> indicates required fields
        </p>
      </div>
    </section>
  );
};

export default EditPatientFrom ;





