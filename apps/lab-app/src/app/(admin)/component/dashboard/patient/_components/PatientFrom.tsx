// import React from 'react'
// import Button from '../../../common/Button'
// import { FaTimes } from 'react-icons/fa'
// import { Patient } from '@/types/patient/patient'

// interface PatientFormProps {
//   newPatient: Patient
//   handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
//   searchTerm: string
//   handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
//   filteredPatients: Patient[]
//   handlePatientSelect: (patient: Patient) => void
//   handleClearPatient: () => void
// }

// enum BloodGroup {
//   A_POSITIVE = 'A+',
//   A_NEGATIVE = 'A-',
//   B_POSITIVE = 'B+',
//   B_NEGATIVE = 'B-',
//   AB_POSITIVE = 'AB+',
//   AB_NEGATIVE = 'AB-',
//   O_POSITIVE = 'O+',
//   O_NEGATIVE = 'O-',
// }


// const PatientForm = ({
//   newPatient,
//   handleChange,
//   searchTerm,
//   handleSearchChange,
//   filteredPatients,
//   handlePatientSelect,
//   handleClearPatient,
// }: PatientFormProps) => {
//   return (
//     <section className="flex space-x-6 w-1/2">
//       <div className="w-full p-4 border rounded-md border-gray-300 shadow-md">
//         <h2 className="text-xs font-bold mb-2 text-gray-800">Patient Details</h2>
//         <div className="flex gap-4 items-center">
//           <div className="grid grid-cols-1 gap-4 w-full">
//             {/* Search Patient Section */}
//             <div className="flex flex-col">
//               <label className="text-xs font-medium mb-1 text-gray-700">Search Patient (Name, Email, Phone)</label>
//               <input
//                 type="text"
//                 name="search"
//                 value={searchTerm}
//                 onChange={handleSearchChange}
//                 className="border w-full rounded-md border-gray-300 p-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Search by name, email, or phone"
//               />
//               {filteredPatients.length > 0 && (
//                 <div className="mt-2 bg-white border border-gray-300 rounded-md shadow-sm">
//                   {filteredPatients.map((patientItem, index) => (
//                     <div
//                       key={index}
//                       className="p-2 cursor-pointer hover:bg-gray-100"
//                       onClick={() => handlePatientSelect(patientItem)}
//                     >
//                       <p className="text-xs font-medium text-gray-700">{patientItem.firstName} {patientItem.lastName}</p>
//                       <p className="text-xs text-gray-500">{patientItem.phone}</p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Clear Patient Button */}
//           <div className="flex items-center">
//             <Button
//               text="Clear"
//               onClick={handleClearPatient}
//               className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md px-2 mt-4 "
//             >
//               <FaTimes className="mr-1" />
//             </Button>
//           </div>
//         </div>

//         {/* Patient Form */}
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <div className="flex flex-col">
//             <label className="text-xs font-semibold mb-1 text-gray-700">First Name</label>
//             <input
//               type="text"
//               name="firstName"
//               value={newPatient?.firstName}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter first name"
//             />
//           </div>
//           <div className="flex flex-col">
//             <label className="text-xs font-semibold mb-1 text-gray-700">Last Name</label>
//             <input
//               type="text"
//               name="lastName"
//               value={newPatient.lastName}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter last name"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-4 my-2">
//           <div className="flex flex-col">
//             <label className="text-xs font-semibold mb-1 text-gray-700">Email</label>
//             <input
//               type="email"
//               name="email"
//               value={newPatient.email}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter email"
//             />
//           </div>
//           <div className="flex flex-col">
//             <label className="text-xs font-semibold mb-1 text-gray-700">Phone</label>
//             <input
//               type="tel"
//               name="phone"
//               value={newPatient.phone}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter phone number"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-4 my-2">
//           <div className="flex flex-col">
//             <label className="text-xs font-semibold mb-1 text-gray-700">Address</label>
//             <input
//               type="text"
//               name="address"
//               value={newPatient.address}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter address"
//             />
//           </div>
//           <div className="flex flex-col">
//             <label className="text-xs font-semibold mb-1 text-gray-700">City</label>
//             <input
//               type="text"
//               name="city"
//               value={newPatient.city}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter city"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-4 my-2">
//           <div className="flex flex-col">
//             <label className="text-xs font-semibold mb-1 text-gray-700">State</label>
//             <input
//               type="text"
//               name="state"
//               value={newPatient.state}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter state"
//             />
//           </div>
//           <div className="flex flex-col">
//             <label className="text-xs font-semibold mb-1 text-gray-700">Zip</label>
//             <input
//               type="text"
//               name="zip"
//               value={newPatient.zip}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter zip code"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-4 my-2">
//           <div className="flex flex-col">
//             <label className="text-xs font-semibold mb-1 text-gray-700">Blood Group</label>
//             <select
//               name="bloodGroup"
//               value={newPatient.bloodGroup}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               {Object.values(BloodGroup).map((bloodGroup) => (
//                 <option key={bloodGroup} value={bloodGroup}>
//                   {bloodGroup}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="flex flex-col">
//             <label className="text-xs font-semibold mb-1 text-gray-700">Date of Birth</label>
//             <input
//               type="date"
//               name="dateOfBirth"
//               value={newPatient.dateOfBirth}
//               onChange={handleChange}
//               className="border rounded-md border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           {/* gender */}
//           <div className="flex flex-col">
//             <label className="text-xs font-semibold mb-1 text-gray-700">Gender</label>
//             <select className="px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
//               <option value="">Select Gender</option>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//               <option value="other">Other</option>
//             </select>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// export default PatientForm








import { Patient } from '@/types/patient/patient'
import React from 'react'
import { FaTimes } from 'react-icons/fa'
import Button from '../../../common/Button'

interface PatientFormProps {
  newPatient: Patient
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  searchTerm: string
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  filteredPatients: Patient[]
  handlePatientSelect: (patient: Patient) => void
  handleClearPatient: () => void
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

const PatientForm = ({
  newPatient,
  handleChange,
  searchTerm,
  handleSearchChange,
  filteredPatients,
  handlePatientSelect,
  handleClearPatient,
}: PatientFormProps) => {
  return (
    <section className="flex space-x-6 w-full max-w-4xl mx-auto ">
      <div className="w-full p-4 border rounded-md border-gray-300 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Patient Details</h2>

        {/* Search Patient Section */}
        <div className="flex flex-col mb-4">
          <label className="text-xs font-medium text-gray-700 mb-1">Search Patient (Email, Phone)</label>
          <input
            type="text"
            name="search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="border w-full rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by email or phone"
          />
          {filteredPatients.length > 0 && (
            <div className="mt-2 bg-white border border-gray-300 rounded-md shadow-sm">
              {filteredPatients.map((patientItem, index) => (
                <div
                  key={index}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handlePatientSelect(patientItem)}
                >
                  <p className="text-sm text-gray-700">{patientItem.firstName} {patientItem.lastName}</p>
                  <p className="text-xs text-gray-500">{patientItem.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear Patient Button */}
        <div className="flex justify-end">
          <Button
            text="Clear"
            onClick={handleClearPatient}
            className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md px-3 py-1"
          >
            <FaTimes className="mr-1 text-xs" />
          </Button>
        </div>

        {/* Patient Form */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={newPatient?.firstName}
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
              value={newPatient.lastName}
              onChange={handleChange}
              className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={newPatient.email}
              onChange={handleChange}
              className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={newPatient.phone}
              onChange={handleChange}
              className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={newPatient.address}
              onChange={handleChange}
              className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter address"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              value={newPatient.city}
              onChange={handleChange}
              className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter city"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1">State</label>
            <input
              type="text"
              name="state"
              value={newPatient.state}
              onChange={handleChange}
              className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter state"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1">Zip</label>
            <input
              type="text"
              name="zip"
              value={newPatient.zip}
              onChange={handleChange}
              className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter zip code"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
            <select
              name="bloodGroup"
              value={newPatient.bloodGroup}
              onChange={handleChange}
              className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(BloodGroup).map((bloodGroup) => (
                <option key={bloodGroup} value={bloodGroup}>
                  {bloodGroup}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={newPatient.dateOfBirth}
              onChange={handleChange}
              className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gender Dropdown */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={newPatient.gender}
              onChange={handleChange}
              className="border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

        </div>
      </div>
    </section>
  )
}

export default PatientForm
