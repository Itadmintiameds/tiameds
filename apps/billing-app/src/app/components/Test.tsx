// "use client";

// import { useState } from "react";
// // import { searchPatient } from "../api";

// interface Patient {
//   patientName: string;
//   patientMobile: string;
//   patientNumber: string;
//   patientAddress: string;
// }

// const PatientSearch = () => {
//   const [patientName, setPatientName] = useState("");
//   const [patientMobile, setPatientMobile] = useState("");
//   const [result, setResult] = useState<Patient | null>(null);
//   const [error, setError] = useState("");

//   const handleSearch = async () => {
//     try {
//       const data = await searchPatient(patientName, patientMobile);
//       setResult(data);
//       setError(""); // Clear previous errors
//     } catch (err) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("An unknown error occurred.");
//       }
//       setResult(null); // Clear previous results
//     }
//   };

//   return (
//     <div className="flex flex-col space-y-4">
//       <div className="flex flex-col space-y-2">
//         <label htmlFor="patientName">Patient Name</label>
//         <input
//           type="text"
//           id="patientName"
//           className="procurement_input"
//           value={patientName}
//           onChange={(e) => setPatientName(e.target.value)}
//         />
//       </div>
//       <div className="flex flex-col space-y-2">
//         <label htmlFor="patientMobile">Mobile Number</label>
//         <input
//           type="text"
//           id="patientMobile"
//           className="procurement_input"
//           value={patientMobile}
//           onChange={(e) => setPatientMobile(e.target.value)}
//         />
//       </div>
//       <button onClick={handleSearch} className="btn btn-primary">
//         Search
//       </button>

//       {error && <p className="text-red-500">{error}</p>}
//       {result && (
//         <div className="mt-4">
//           <p><strong>Name:</strong> {result.patientName}</p>
//           <p><strong>Mobile:</strong> {result.patientMobile}</p>
//           <p><strong>Patient Number:</strong> {result.patientNumber}</p>
//           <p><strong>Address:</strong> {result.patientAddress}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PatientSearch;



import React from 'react'

const Test = () => {
  return (
    <div>Test</div>
  )
}

export default Test
