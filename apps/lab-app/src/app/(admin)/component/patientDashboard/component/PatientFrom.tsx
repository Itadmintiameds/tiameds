// import { Patient, Gender } from '@/types/patient/patient';
// import React, { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';

// interface PatientFormProps {
//   newPatient: Patient;
//   handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
//   searchTerm: string;
//   handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
//   filteredPatients: Patient[];
//   handlePatientSelect: (patient: Patient) => void;
// }

// enum Prefix {
//   Mr = 'Mr.',
//   Mrs = 'Mrs.',
//   Ms = 'Ms.',
//   MS = 'M/S'
// }

// const PatientForm: React.FC<PatientFormProps> = ({
//   newPatient,
//   handleChange,
//   searchTerm,
//   handleSearchChange,
//   filteredPatients,
//   handlePatientSelect,
// }) => {
//   const [currentPrefix, currentFirstName] = extractPrefixAndName(newPatient.firstName || '');
//   const [ageDetails, setAgeDetails] = useState({
//     years: '',
//     months: '',
//     days: ''
//   });
//   const [dobInput, setDobInput] = useState('');
//   const [ageInputMode, setAgeInputMode] = useState<'manual' | 'dob'>('dob');
//   const [lastChanged, setLastChanged] = useState<'age' | 'dob'>('dob');
//   const [validationErrors, setValidationErrors] = useState({
//     phone: '',
//     prefix: '',
//     firstName: '',
//     city: '',
//     years: '',
//     months: '',
//     days: '',
//     dob: ''
//   });
//   const [touchedFields, setTouchedFields] = useState({
//     phone: false,
//     firstName: false,
//     city: false,
//     dob: false
//   });

//   // Helper function to format age string
//   const formatAgeString = (ageString: string): string => {
//     if (!ageString) return '';
    
//     const parts = ageString.split(' ');
//     const formattedParts = [];
    
//     for (let i = 0; i < parts.length; i += 2) {
//       const value = parts[i];
//       const unit = parts[i+1];
      
//       if (unit === 'yr') formattedParts.push(`${value} year${value !== '1' ? 's' : ''}`);
//       else if (unit === 'mo') formattedParts.push(`${value} month${value !== '1' ? 's' : ''}`);
//       else if (unit === 'day') formattedParts.push(`${value} day${value !== '1' ? 's' : ''}`);
//     }
    
//     // Join with 'and' before the last part if there are multiple parts
//     if (formattedParts.length > 1) {
//       const lastPart = formattedParts.pop();
//       return `${formattedParts.join(' ')} and ${lastPart}`;
//     }
    
//     return formattedParts.join(' ');
//   };

//   // Helper function to calculate age from date of birth
//   const calculateAge = (dob: string): string => {
//     if (!dob) return '';
    
//     const birthDate = new Date(dob);
//     const today = new Date();
    
//     let years = today.getFullYear() - birthDate.getFullYear();
//     let months = today.getMonth() - birthDate.getMonth();
//     let days = today.getDate() - birthDate.getDate();

//     // Adjust for negative days
//     if (days < 0) {
//       months--;
//       const lastDayOfMonth = new Date(
//         today.getFullYear(),
//         today.getMonth(),
//         0
//       ).getDate();
//       days += lastDayOfMonth;
//     }

//     // Adjust for negative months
//     if (months < 0) {
//       years--;
//       months += 12;
//     }

//     // Format the age string with abbreviations
//     let ageParts = [];
//     if (years > 0) ageParts.push(`${years} year`);
//     if (months > 0) ageParts.push(`${months} month`);
//     if (days > 0) ageParts.push(`${days} day`);

//     return ageParts.join(' ');
//   };

//   // Parse age string into years, months, days
//   const parseAgeString = (ageString: string) => {
//     const parts = ageString.split(' ');
//     const result = { years: '', months: '', days: '' };

//     for (let i = 0; i < parts.length; i += 2) {
//       const value = parts[i];
//       const unit = parts[i+1];

//       if (unit === 'yr') result.years = value;
//       else if (unit === 'mo') result.months = value;
//       else if (unit === 'day') result.days = value;
//     }

//     return result;
//   };

//   // Validate phone number
//   const validatePhone = (phone: string) => {
//     if (!phone) return 'Phone number is required';
//     if (!/^\d{10}$/.test(phone)) return 'Phone number must be 10 digits';
//     return '';
//   };

//   // Validate name
//   const validateName = (name: string) => {
//     if (!name) return 'Patient name is required';
//     if (!/^[a-zA-Z\s.'-]+$/.test(name)) return 'Name contains invalid characters';
//     if (name.length < 2) return 'Name is too short';
//     return '';
//   };

//   // Validate city
//   const validateCity = (city: string) => {
//     if (!city) return 'City is required';
//     if (!/^[a-zA-Z\s.'-]+$/.test(city)) return 'City contains invalid characters';
//     return '';
//   };

//   // Validate prefix
//   const validatePrefix = (prefix: string) => {
//     if (!prefix && currentFirstName) return 'Prefix is required when name is provided';
//     return '';
//   };

//   // Validate date of birth
//   const validateDOB = (dob: string) => {
//     if (!dob) return 'Date of birth is required';

//     const date = parseDateInput(dobInput);
//     if (!date) return 'Invalid date format (DD/MM/YYYY)';

//     const today = new Date();
//     today.setHours(12, 0, 0, 0);
//     if (date > today) return 'Date cannot be in the future';

//     const hundredYearsAgo = new Date();
//     hundredYearsAgo.setHours(12, 0, 0, 0);
//     hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
//     if (date < hundredYearsAgo) return 'Date cannot be more than 100 years ago';

//     return '';
//   };

//   // Format date to DD/MM/YYYY
//   const formatDate = (dateString: string) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return '';

//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   // Parse DD/MM/YYYY to Date object (local time, no timezone conversion)
//   const parseDateInput = (input: string) => {
//     const parts = input.split('/');
//     if (parts.length === 3) {
//       const day = parseInt(parts[0], 10);
//       const month = parseInt(parts[1], 10) - 1;
//       const year = parseInt(parts[2], 10);

//       if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
//         // Create date in local time to avoid timezone issues
//         const date = new Date(year, month, day, 12, 0, 0); // Noon to avoid timezone issues
//         // Check if the date is valid (e.g., not Feb 30)
//         if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
//           return date;
//         }
//       }
//     }
//     return null;
//   };

//   // Format date to YYYY-MM-DD (local date, no timezone conversion)
//   const formatToISODate = (date: Date) => {
//     const year = date.getFullYear();
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const day = date.getDate().toString().padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };

//   // Initialize dobInput and ageDetails when component mounts or newPatient changes
//   useEffect(() => {
//     if (newPatient.dateOfBirth) {
//       setDobInput(formatDate(newPatient.dateOfBirth));
//       setAgeInputMode('dob');
      
//       // Initialize age details from age string if it exists
//       if (newPatient.age) {
//         const parsed = parseAgeString(newPatient.age);
//         setAgeDetails({
//           years: parsed.years,
//           months: parsed.months,
//           days: parsed.days
//         });
//       }
//     } else {
//       setDobInput('');
//       if (newPatient.age) {
//         const parsed = parseAgeString(newPatient.age);
//         setAgeDetails({
//           years: parsed.years,
//           months: parsed.months,
//           days: parsed.days
//         });
//       } else {
//         setAgeDetails({
//           years: '',
//           months: '',
//           days: ''
//         });
//       }
//     }
//   }, [newPatient.dateOfBirth, newPatient.age]);

//   // Validate all fields when they change
//   useEffect(() => {
//     setValidationErrors({
//       phone: validatePhone(newPatient.phone),
//       prefix: validatePrefix(currentPrefix),
//       firstName: validateName(currentFirstName),
//       city: validateCity(newPatient.city),
//       years: validationErrors.years,
//       months: validationErrors.months,
//       days: validationErrors.days,
//       dob: validateDOB(dobInput)
//     });
//   }, [newPatient.phone, currentPrefix, currentFirstName, newPatient.city, dobInput]);

//   // Handle field blur events
//   const handleBlur = (field: keyof typeof touchedFields) => {
//     setTouchedFields(prev => ({ ...prev, [field]: true }));
//   };

//   // Handle manual date input changes
//   const handleDobInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;

//     // Allow only numbers and slashes
//     const cleanedValue = value.replace(/[^0-9/]/g, '');

//     // Auto-format the date as user types
//     let formattedValue = cleanedValue;
//     if (cleanedValue.length > 2 && cleanedValue.indexOf('/') === -1) {
//       formattedValue = `${cleanedValue.substring(0, 2)}/${cleanedValue.substring(2)}`;
//     }
//     if (formattedValue.length > 5 && formattedValue.lastIndexOf('/') === 2) {
//       formattedValue = `${formattedValue.substring(0, 5)}/${formattedValue.substring(5)}`;
//     }

//     // Limit to 10 characters (DD/MM/YYYY)
//     if (formattedValue.length <= 10) {
//       setDobInput(formattedValue);
//       setAgeInputMode('dob');
//       setLastChanged('dob');
//       setTouchedFields(prev => ({ ...prev, dob: true }));

//       // Parse the date when we have a complete date
//       if (formattedValue.length === 10) {
//         const date = parseDateInput(formattedValue);
//         if (date && !isNaN(date.getTime())) {
//           const today = new Date();
//           today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

//           // Validate date is not in future and not more than 100 years ago
//           if (date > today) {
//             toast.error('Date of birth cannot be in the future', { autoClose: 1000, position: "top-center" });
//             return;
//           }

//           const hundredYearsAgo = new Date();
//           hundredYearsAgo.setHours(12, 0, 0, 0);
//           hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
//           if (date < hundredYearsAgo) {
//             toast.error('Date of birth cannot be more than 100 years ago', { autoClose: 1000, position: "top-center" });
//             return;
//           }

//           const dobEvent = {
//             target: {
//               name: 'dateOfBirth',
//               value: formatToISODate(date)
//             }
//           } as React.ChangeEvent<HTMLInputElement>;
//           handleChange(dobEvent);

//           // Set the age when date of birth is valid
//           const ageString = calculateAge(formatToISODate(date));
//           const ageEvent = {
//             target: {
//               name: 'age',
//               value: ageString
//             }
//           } as React.ChangeEvent<HTMLInputElement>;
//           handleChange(ageEvent);
          
//           return;
//         }
//       }

//       // If date is incomplete or invalid, clear the DOB and age
//       const dobEvent = {
//         target: {
//           name: 'dateOfBirth',
//           value: ''
//         }
//       } as React.ChangeEvent<HTMLInputElement>;
//       handleChange(dobEvent);

//       const ageEvent = {
//         target: {
//           name: 'age',
//           value: ''
//         }
//       } as React.ChangeEvent<HTMLInputElement>;
//       handleChange(ageEvent);
//     }
//   };

//   // Calculate date of birth from age details (respects exact inputs)
//   const calculateDOB = (years: string, months: string, days: string) => {
//     const y = parseInt(years) || 0;
//     const m = parseInt(months) || 0;
//     const d = parseInt(days) || 0;

//     if (y === 0 && m === 0 && d === 0) return '';

//     const today = new Date();
//     today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

//     // Validate age is not more than 100 years
//     if (y > 100) {
//       toast.error('Age cannot be more than 100 years');
//       return '';
//     }

//     // Calculate DOB based on exactly what was provided
//     const dob = new Date(today);

//     if (years !== '') {
//       dob.setFullYear(dob.getFullYear() - y);
//     }

//     if (months !== '') {
//       dob.setMonth(dob.getMonth() - m);
//     }

//     if (days !== '') {
//       dob.setDate(dob.getDate() - d);
//     }

//     // Ensure we don't end up with a future date
//     if (dob > today) {
//       return formatToISODate(today);
//     }

//     return formatToISODate(dob);
//   };

//   // Update age details when DOB changes (only in dob mode)
//   useEffect(() => {
//     if (lastChanged === 'dob' && newPatient.dateOfBirth) {
//       const dob = new Date(newPatient.dateOfBirth);
//       dob.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
//       const today = new Date();
//       today.setHours(12, 0, 0, 0);

//       let years = today.getFullYear() - dob.getFullYear();
//       let months = today.getMonth() - dob.getMonth();
//       let days = today.getDate() - dob.getDate();

//       // Adjust for negative days
//       if (days < 0) {
//         months--;
//         const lastDayOfMonth = new Date(
//           today.getFullYear(),
//           today.getMonth(),
//           0
//         ).getDate();
//         days += lastDayOfMonth;
//       }

//       // Adjust for negative months
//       if (months < 0) {
//         years--;
//         months += 12;
//       }

//       setAgeDetails({
//         years: years > 0 ? years.toString() : '',
//         months: months > 0 ? months.toString() : '',
//         days: days > 0 ? days.toString() : ''
//       });

//       // Update the age field with the formatted string
//       const ageString = calculateAge(newPatient.dateOfBirth);
//       if (newPatient.age !== ageString) {
//         const ageEvent = {
//           target: {
//             name: 'age',
//             value: ageString
//           }
//         } as React.ChangeEvent<HTMLInputElement>;
//         handleChange(ageEvent);
//       }
//     }
//   }, [newPatient.dateOfBirth, lastChanged]);

//   const handleAgeDetailChange = (field: 'years' | 'months' | 'days') =>
//     (event: React.ChangeEvent<HTMLInputElement>) => {
//       let value = event.target.value.replace(/\D/g, '');
//       let error = '';

//       // Apply field-specific validations
//       if (field === 'years' && value) {
//         const years = parseInt(value, 10);
//         if (years > 100) {
//           value = '100';
//           error = 'Age cannot be more than 100 years';
//         }
//       } else if (field === 'months' && value) {
//         const months = parseInt(value, 10);
//         if (months > 12) {
//           value = '12';
//           error = 'Months cannot be more than 12';
//         } else if (months < 0) {
//           value = '0';
//           error = 'Months cannot be negative';
//         }
//       } else if (field === 'days' && value) {
//         const days = parseInt(value, 10);
//         if (days > 31) {
//           value = '31';
//           error = 'Days cannot be more than 31';
//         } else if (days < 0) {
//           value = '0';
//           error = 'Days cannot be negative';
//         }
//       }

//       // Update validation errors
//       setValidationErrors(prev => ({
//         ...prev,
//         [field]: error
//       }));

//       if (error) {
//         toast.error(error, { autoClose: 1000, position: "top-center" });
//       }

//       // Create new age details object with the updated field
//       const newAgeDetails = {
//         ...ageDetails,
//         [field]: value
//       };

//       // When changing years or months, clear days if it wasn't explicitly set
//       if (field !== 'days' && ageDetails.days === '') {
//         newAgeDetails.days = '';
//       }

//       // Update the state with the new age details
//       setAgeDetails(newAgeDetails);
//       setAgeInputMode('manual');
//       setLastChanged('age');

//       // Only calculate DOB if at least one field has a value
//       if (newAgeDetails.years || newAgeDetails.months || newAgeDetails.days) {
//         const dob = calculateDOB(newAgeDetails.years, newAgeDetails.months, newAgeDetails.days);
//         if (dob) {
//           const dobEvent = {
//             target: {
//               name: 'dateOfBirth',
//               value: dob
//             }
//           } as React.ChangeEvent<HTMLInputElement>;
//           handleChange(dobEvent);
//           setDobInput(formatDate(dob));

//           // Create the age string based on what's provided
//           let ageParts = [];
//           if (newAgeDetails.years) ageParts.push(`${newAgeDetails.years} yr`);
//           if (newAgeDetails.months) ageParts.push(`${newAgeDetails.months} mo`);
//           if (newAgeDetails.days) ageParts.push(`${newAgeDetails.days} day`);

//           const ageString = ageParts.join(' ');

//           // Set the age field
//           const ageEvent = {
//             target: {
//               name: 'age',
//               value: ageString
//             }
//           } as React.ChangeEvent<HTMLInputElement>;
//           handleChange(ageEvent);
//         }
//       } else {
//         // If all fields are empty, clear the DOB and age
//         const dobEvent = {
//           target: {
//             name: 'dateOfBirth',
//             value: ''
//           }
//         } as React.ChangeEvent<HTMLInputElement>;
//         handleChange(dobEvent);

//         const ageEvent = {
//           target: {
//             name: 'age',
//             value: ''
//           }
//         } as React.ChangeEvent<HTMLInputElement>;
//         handleChange(ageEvent);
        
//         setDobInput('');
//       }
//     };

//   const handlePrefixChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     const prefix = event.target.value as Prefix;
//     const newFullName = prefix ? `${prefix} ${currentFirstName}` : currentFirstName;

//     const nameEvent = {
//       target: {
//         name: 'firstName',
//         value: newFullName.trim()
//       }
//     } as React.ChangeEvent<HTMLInputElement>;

//     const genderEvent = {
//       target: {
//         name: 'gender',
//         value: getGenderFromPrefix(prefix)
//       }
//     } as React.ChangeEvent<HTMLSelectElement>;

//     handleChange(nameEvent);
//     handleChange(genderEvent);
//   };

//   const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const firstName = event.target.value;
//     const newFullName = currentPrefix ? `${currentPrefix} ${firstName}` : firstName;

//     const nameEvent = {
//       target: {
//         name: 'firstName',
//         value: newFullName.trim()
//       }
//     } as React.ChangeEvent<HTMLInputElement>;

//     handleChange(nameEvent);
//     setTouchedFields(prev => ({ ...prev, firstName: true }));
//   };

//   const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     handleSearchChange(event);
//     handleChange(event);
//     setTouchedFields(prev => ({ ...prev, phone: true }));
//   };

//   const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     handleChange(event);
//     setTouchedFields(prev => ({ ...prev, city: true }));
//   };

//   return (
//     <section className="flex flex-col space-y-3 w-full max-w-3xl mx-auto p-3 border rounded-lg border-gray-200 shadow-xs bg-gray-50">
//       <div className="flex items-end gap-2">
//         <div className="flex-1">
//           <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//             Phone <span className="text-red-500 ml-0.5">*</span>
//           </label>
//           <div className="relative">
//             <input
//               type="tel"
//               name="phone"
//               required
//               value={searchTerm || newPatient.phone}
//               onChange={handlePhoneChange}
//               onBlur={() => handleBlur('phone')}
//               className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touchedFields.phone && validationErrors.phone ? 'border-red-500' : ''
//                 }`}
//               placeholder="Enter phone number"
//               maxLength={10}
//             />
//             {touchedFields.phone && validationErrors.phone && (
//               <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.phone}</p>
//             )}
//             {filteredPatients?.length > 0 && (
//               <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-xs max-h-60 overflow-y-auto">
//                 {filteredPatients.map((patientItem, index) => (
//                   <div
//                     key={index}
//                     className="p-1.5 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
//                     onClick={() => handlePatientSelect(patientItem)}
//                   >
//                     <p className="text-xs font-medium text-gray-800">{patientItem.firstName} {patientItem.lastName}</p>
//                     <p className="text-[0.65rem] text-gray-500">{patientItem.phone}</p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//         <div>
//           <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//             Patient Name <span className="text-red-500 ml-0.5">*</span>
//           </label>
//           <div className="flex">
//             <select
//               name="prefix"
//               value={currentPrefix}
//               onChange={handlePrefixChange}
//               className={`border rounded-l-md border-gray-300 p-1.5 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.prefix ? 'border-red-500' : ''
//                 }`}
//             >
//               <option value="">-</option>
//               {Object.values(Prefix).map((prefix) => (
//                 <option key={prefix} value={prefix}>
//                   {prefix}
//                 </option>
//               ))}
//             </select>
//             <input
//               type="text"
//               name="firstName"
//               required
//               value={currentFirstName}
//               onChange={handleFirstNameChange}
//               onBlur={() => handleBlur('firstName')}
//               className={`border rounded-r-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touchedFields.firstName && validationErrors.firstName ? 'border-red-500' : ''
//                 }`}
//               placeholder="First name"
//             />
//           </div>
//           {touchedFields.firstName && validationErrors.firstName && (
//             <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.firstName}</p>
//           )}
//           {validationErrors.prefix && (
//             <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.prefix}</p>
//           )}
//         </div>
//         <div>
//           <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//             Gender <span className="text-red-500 ml-0.5">*</span>
//           </label>
//           <select
//             name="gender"
//             required
//             value={newPatient.gender}
//             onChange={handleChange}
//             className="border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//           >
//             {Object.values(Gender).map((gender) => (
//               <option key={gender} value={gender}>
//                 {gender.charAt(0).toUpperCase() + gender.slice(1)}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="text-xs font-medium text-gray-600 mb-1">
//             City <span className="text-red-500 ml-0.5">*</span>
//           </label>
//           <input
//             type="text"
//             name="city"
//             value={newPatient.city}
//             onChange={handleCityChange}
//             onBlur={() => handleBlur('city')}
//             className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touchedFields.city && validationErrors.city ? 'border-red-500' : ''
//               }`}
//             placeholder="City"
//           />
//           {touchedFields.city && validationErrors.city && (
//             <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.city}</p>
//           )}
//         </div>

//         <div>
//           <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
//             Date of Birth <span className="text-red-500 ml-0.5">*</span>
//           </label>
//           <input
//             type="text"
//             name="dobInput"
//             value={dobInput}
//             onChange={handleDobInputChange}
//             onBlur={() => handleBlur('dob')}
//             placeholder="DD/MM/YYYY"
//             className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touchedFields.dob && validationErrors.dob ? 'border-red-500' : ''
//               }`}
//           />
//           {touchedFields.dob && validationErrors.dob && (
//             <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.dob}</p>
//           )}
//           {ageInputMode === 'dob' && newPatient.dateOfBirth && !validationErrors.dob && (
//             <p className="text-[0.65rem] mt-1 text-gray-500">
//               {formatAgeString(newPatient?.age)}
//             </p>
//           )}
//         </div>

//         <div className="col-span-2">
//           <label className="text-xs font-medium text-gray-600 mb-1">
//             Age Details (Manual Input)
//           </label>
//           <p className="text-xs text-gray-500 mb-1">
//             Enter age details manually if you prefer not to use date of birth.
//           </p>
//           <div className="grid grid-cols-3 gap-3">
//             <div>
//               <label className="text-xs font-medium text-gray-600 mb-1 block">
//                 Years
//               </label>
//               <input
//                 type="text"
//                 name="ageYears"
//                 value={ageDetails.years}
//                 onChange={handleAgeDetailChange('years')}
//                 className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.years ? 'border-red-500' : ''
//                   }`}
//                 placeholder="Enter years (0-100)"
//                 maxLength={3}
//               />
//               {validationErrors.years && (
//                 <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.years}</p>
//               )}
//             </div>
//             <div>
//               <label className="text-xs font-medium text-gray-600 mb-1 block">
//                 Months
//               </label>
//               <input
//                 type="text"
//                 name="ageMonths"
//                 value={ageDetails.months}
//                 onChange={handleAgeDetailChange('months')}
//                 className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.months ? 'border-red-500' : ''
//                   }`}
//                 placeholder="Enter months (0-12)"
//                 maxLength={2}
//               />
//               {validationErrors.months && (
//                 <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.months}</p>
//               )}
//             </div>
//             <div>
//               <label className="text-xs font-medium text-gray-600 mb-1 block">
//                 Days
//               </label>
//               <input
//                 type="text"
//                 name="ageDays"
//                 value={ageDetails.days}
//                 onChange={handleAgeDetailChange('days')}
//                 className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.days ? 'border-red-500' : ''
//                   }`}
//                 placeholder="Enter days (0-31)"
//                 maxLength={2}
//               />
//               {validationErrors.days && (
//                 <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.days}</p>
//               )}
//             </div>
//           </div>
//           {ageInputMode === 'manual' && newPatient.age && (
//             <p className="text-[0.65rem] mt-1 text-gray-500">
//               Age: {formatAgeString(newPatient.age)}
//             </p>
//           )}
//         </div>
//       </div>
//       <div className="text-right mt-1">
//         <p className="text-[0.65rem] text-gray-500">
//           <span className="text-red-500">*</span> indicates required fields
//         </p>
//       </div>
//     </section>
//   );
// };

// function extractPrefixAndName(fullName: string): [Prefix | '', string] {
//   if (!fullName) return ['', ''];

//   const prefixValues = Object.values(Prefix);
//   for (const prefix of prefixValues) {
//     if (fullName.startsWith(prefix)) {
//       const name = fullName.substring(prefix.length).trim();
//       return [prefix, name];
//     }
//   }
//   return ['', fullName];
// }

// function getGenderFromPrefix(prefix: Prefix | ''): Gender {
//   switch (prefix) {
//     case Prefix.Mr:
//       return Gender.Male;
//     case Prefix.Mrs:
//     case Prefix.Ms:
//       return Gender.Female;
//     case Prefix.MS:
//       return Gender.Other;
//     default:
//       return Gender.Other;
//   }
// }

// export default PatientForm;















import { Patient, Gender } from '@/types/patient/patient';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface PatientFormProps {
  newPatient: Patient;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  searchTerm: string;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  filteredPatients: Patient[];
  handlePatientSelect: (patient: Patient) => void;
}

enum Prefix {
  Mr = 'Mr.',
  Mrs = 'Mrs.',
  Ms = 'Ms.',
  MS = 'M/S'
}

const PatientForm: React.FC<PatientFormProps> = ({
  newPatient,
  handleChange,
  searchTerm,
  handleSearchChange,
  filteredPatients,
  handlePatientSelect,
}) => {
  const [currentPrefix, currentFirstName] = extractPrefixAndName(newPatient.firstName || '');
  const [ageDetails, setAgeDetails] = useState({
    years: '',
    months: '',
    days: ''
  });
  const [dobInput, setDobInput] = useState('');
  const [ageInputMode, setAgeInputMode] = useState<'manual' | 'dob'>('dob');
  const [lastChanged, setLastChanged] = useState<'age' | 'dob'>('dob');
  const [validationErrors, setValidationErrors] = useState({
    phone: '',
    prefix: '',
    firstName: '',
    city: '',
    years: '',
    months: '',
    days: '',
    dob: ''
  });
  const [touchedFields, setTouchedFields] = useState({
    phone: false,
    firstName: false,
    city: false,
    dob: false
  });

  // Helper function to format age string with full words and proper pluralization
  const formatAgeString = (ageString: string): string => {
    if (!ageString) return '';
    
    // First normalize any existing abbreviations to full words
    const normalized = ageString
      .replace(/\byr\b/g, 'year')
      .replace(/\bmo\b/g, 'month')
      .replace(/\bday\b/g, 'day');
    
    // Then handle pluralization
    return normalized.replace(/(\d+) (year|month|day)s?/g, (match, num, unit) => {
      return `${num} ${unit}${parseInt(num) !== 1 ? 's' : ''}`;
    });
  };

  // Calculate age from date of birth (returns formatted string with full words)
  const calculateAge = (dob: string): string => {
    if (!dob) return '';
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      ).getDate();
      days += lastDayOfMonth;
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    // Format the age string with full words and proper pluralization
    let ageParts = [];
    if (years > 0) ageParts.push(`${years} year${years !== 1 ? 's' : ''}`);
    if (months > 0) ageParts.push(`${months} month${months !== 1 ? 's' : ''}`);
    if (days > 0) ageParts.push(`${days} day${days !== 1 ? 's' : ''}`);

    // Join with 'and' before the last part if there are multiple parts
    if (ageParts.length > 1) {
      const lastPart = ageParts.pop();
      return `${ageParts.join(' ')} and ${lastPart}`;
    }
    
    return ageParts.join(' ');
  };

  // Parse age string into years, months, days (handles both full and abbreviated formats)
  const parseAgeString = (ageString: string) => {
    const parts = ageString.split(' ');
    const result = { years: '', months: '', days: '' };

    for (let i = 0; i < parts.length; i += 2) {
      const value = parts[i];
      const unit = parts[i+1]?.toLowerCase();

      if (unit?.startsWith('year') || unit === 'yr') result.years = value;
      else if (unit?.startsWith('month') || unit === 'mo') result.months = value;
      else if (unit?.startsWith('day')) result.days = value;
    }

    return result;
  };

  // Validate phone number
  const validatePhone = (phone: string) => {
    if (!phone) return 'Phone number is required';
    if (!/^\d{10}$/.test(phone)) return 'Phone number must be 10 digits';
    return '';
  };

  // Validate name
  const validateName = (name: string) => {
    if (!name) return 'Patient name is required';
    if (!/^[a-zA-Z\s.'-]+$/.test(name)) return 'Name contains invalid characters';
    if (name.length < 2) return 'Name is too short';
    return '';
  };

  // Validate city
  const validateCity = (city: string) => {
    if (!city) return 'City is required';
    if (!/^[a-zA-Z\s.'-]+$/.test(city)) return 'City contains invalid characters';
    return '';
  };

  // Validate prefix
  const validatePrefix = (prefix: string) => {
    if (!prefix && currentFirstName) return 'Prefix is required when name is provided';
    return '';
  };

  // Validate date of birth
  const validateDOB = (dob: string) => {
    if (!dob) return 'Date of birth is required';

    const date = parseDateInput(dobInput);
    if (!date) return 'Invalid date format (DD/MM/YYYY)';

    const today = new Date();
    today.setHours(12, 0, 0, 0);
    if (date > today) return 'Date cannot be in the future';

    const hundredYearsAgo = new Date();
    hundredYearsAgo.setHours(12, 0, 0, 0);
    hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
    if (date < hundredYearsAgo) return 'Date cannot be more than 100 years ago';

    return '';
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Parse DD/MM/YYYY to Date object (local time, no timezone conversion)
  const parseDateInput = (input: string) => {
    const parts = input.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);

      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        // Create date in local time to avoid timezone issues
        const date = new Date(year, month, day, 12, 0, 0);
        // Check if the date is valid
        if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
          return date;
        }
      }
    }
    return null;
  };

  // Format date to YYYY-MM-DD (local date, no timezone conversion)
  const formatToISODate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize dobInput and ageDetails when component mounts or newPatient changes
  useEffect(() => {
    if (newPatient.dateOfBirth) {
      setDobInput(formatDate(newPatient.dateOfBirth));
      setAgeInputMode('dob');
      
      if (newPatient.age) {
        const parsed = parseAgeString(newPatient.age);
        setAgeDetails({
          years: parsed.years,
          months: parsed.months,
          days: parsed.days
        });
      }
    } else {
      setDobInput('');
      if (newPatient.age) {
        const parsed = parseAgeString(newPatient.age);
        setAgeDetails({
          years: parsed.years,
          months: parsed.months,
          days: parsed.days
        });
      } else {
        setAgeDetails({
          years: '',
          months: '',
          days: ''
        });
      }
    }
  }, [newPatient.dateOfBirth, newPatient.age]);

  // Validate all fields when they change
  useEffect(() => {
    setValidationErrors({
      phone: validatePhone(newPatient.phone),
      prefix: validatePrefix(currentPrefix),
      firstName: validateName(currentFirstName),
      city: validateCity(newPatient.city),
      years: validationErrors.years,
      months: validationErrors.months,
      days: validationErrors.days,
      dob: validateDOB(dobInput)
    });
  }, [newPatient.phone, currentPrefix, currentFirstName, newPatient.city, dobInput]);

  // Handle field blur events
  const handleBlur = (field: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  // Handle manual date input changes
  const handleDobInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanedValue = value.replace(/[^0-9/]/g, '');

    let formattedValue = cleanedValue;
    if (cleanedValue.length > 2 && cleanedValue.indexOf('/') === -1) {
      formattedValue = `${cleanedValue.substring(0, 2)}/${cleanedValue.substring(2)}`;
    }
    if (formattedValue.length > 5 && formattedValue.lastIndexOf('/') === 2) {
      formattedValue = `${formattedValue.substring(0, 5)}/${formattedValue.substring(5)}`;
    }

    if (formattedValue.length <= 10) {
      setDobInput(formattedValue);
      setAgeInputMode('dob');
      setLastChanged('dob');
      setTouchedFields(prev => ({ ...prev, dob: true }));

      if (formattedValue.length === 10) {
        const date = parseDateInput(formattedValue);
        if (date && !isNaN(date.getTime())) {
          const today = new Date();
          today.setHours(12, 0, 0, 0);

          if (date > today) {
            toast.error('Date of birth cannot be in the future', { autoClose: 1000, position: "top-center" });
            return;
          }

          const hundredYearsAgo = new Date();
          hundredYearsAgo.setHours(12, 0, 0, 0);
          hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
          if (date < hundredYearsAgo) {
            toast.error('Date of birth cannot be more than 100 years ago', { autoClose: 1000, position: "top-center" });
            return;
          }

          const dobEvent = {
            target: {
              name: 'dateOfBirth',
              value: formatToISODate(date)
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleChange(dobEvent);

          const ageString = calculateAge(formatToISODate(date));
          const ageEvent = {
            target: {
              name: 'age',
              value: ageString
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleChange(ageEvent);
          
          return;
        }
      }

      const dobEvent = {
        target: {
          name: 'dateOfBirth',
          value: ''
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(dobEvent);

      const ageEvent = {
        target: {
          name: 'age',
          value: ''
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(ageEvent);
    }
  };

  // Calculate date of birth from age details
  const calculateDOB = (years: string, months: string, days: string) => {
    const y = parseInt(years) || 0;
    const m = parseInt(months) || 0;
    const d = parseInt(days) || 0;

    if (y === 0 && m === 0 && d === 0) return '';

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    if (y > 100) {
      toast.error('Age cannot be more than 100 years');
      return '';
    }

    const dob = new Date(today);

    if (years !== '') {
      dob.setFullYear(dob.getFullYear() - y);
    }

    if (months !== '') {
      dob.setMonth(dob.getMonth() - m);
    }

    if (days !== '') {
      dob.setDate(dob.getDate() - d);
    }

    if (dob > today) {
      return formatToISODate(today);
    }

    return formatToISODate(dob);
  };

  // Update age details when DOB changes
  useEffect(() => {
    if (lastChanged === 'dob' && newPatient.dateOfBirth) {
      const dob = new Date(newPatient.dateOfBirth);
      dob.setHours(12, 0, 0, 0);
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      let years = today.getFullYear() - dob.getFullYear();
      let months = today.getMonth() - dob.getMonth();
      let days = today.getDate() - dob.getDate();

      if (days < 0) {
        months--;
        const lastDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        ).getDate();
        days += lastDayOfMonth;
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      setAgeDetails({
        years: years > 0 ? years.toString() : '',
        months: months > 0 ? months.toString() : '',
        days: days > 0 ? days.toString() : ''
      });

      const ageString = calculateAge(newPatient.dateOfBirth);
      if (newPatient.age !== ageString) {
        const ageEvent = {
          target: {
            name: 'age',
            value: ageString
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(ageEvent);
      }
    }
  }, [newPatient.dateOfBirth, lastChanged]);

  const handleAgeDetailChange = (field: 'years' | 'months' | 'days') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value.replace(/\D/g, '');
      let error = '';

      if (field === 'years' && value) {
        const years = parseInt(value, 10);
        if (years > 100) {
          value = '100';
          error = 'Age cannot be more than 100 years';
        }
      } else if (field === 'months' && value) {
        const months = parseInt(value, 10);
        if (months > 12) {
          value = '12';
          error = 'Months cannot be more than 12';
        } else if (months < 0) {
          value = '0';
          error = 'Months cannot be negative';
        }
      } else if (field === 'days' && value) {
        const days = parseInt(value, 10);
        if (days > 31) {
          value = '31';
          error = 'Days cannot be more than 31';
        } else if (days < 0) {
          value = '0';
          error = 'Days cannot be negative';
        }
      }

      setValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));

      if (error) {
        toast.error(error, { autoClose: 1000, position: "top-center" });
      }

      const newAgeDetails = {
        ...ageDetails,
        [field]: value
      };

      if (field !== 'days' && ageDetails.days === '') {
        newAgeDetails.days = '';
      }

      setAgeDetails(newAgeDetails);
      setAgeInputMode('manual');
      setLastChanged('age');

      if (newAgeDetails.years || newAgeDetails.months || newAgeDetails.days) {
        const dob = calculateDOB(newAgeDetails.years, newAgeDetails.months, newAgeDetails.days);
        if (dob) {
          const dobEvent = {
            target: {
              name: 'dateOfBirth',
              value: dob
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleChange(dobEvent);
          setDobInput(formatDate(dob));

          let ageParts = [];
          if (newAgeDetails.years) ageParts.push(`${newAgeDetails.years} year${newAgeDetails.years !== '1' ? 's' : ''}`);
          if (newAgeDetails.months) ageParts.push(`${newAgeDetails.months} month${newAgeDetails.months !== '1' ? 's' : ''}`);
          if (newAgeDetails.days) ageParts.push(`${newAgeDetails.days} day${newAgeDetails.days !== '1' ? 's' : ''}`);

          const ageString = ageParts.join(' ');
          const ageEvent = {
            target: {
              name: 'age',
              value: ageString
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleChange(ageEvent);
        }
      } else {
        const dobEvent = {
          target: {
            name: 'dateOfBirth',
            value: ''
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(dobEvent);

        const ageEvent = {
          target: {
            name: 'age',
            value: ''
          }
        } as React.ChangeEvent<HTMLInputElement>;
        handleChange(ageEvent);
        
        setDobInput('');
      }
    };

  const handlePrefixChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const prefix = event.target.value as Prefix;
    const newFullName = prefix ? `${prefix} ${currentFirstName}` : currentFirstName;

    const nameEvent = {
      target: {
        name: 'firstName',
        value: newFullName.trim()
      }
    } as React.ChangeEvent<HTMLInputElement>;

    const genderEvent = {
      target: {
        name: 'gender',
        value: getGenderFromPrefix(prefix)
      }
    } as React.ChangeEvent<HTMLSelectElement>;

    handleChange(nameEvent);
    handleChange(genderEvent);
  };

  const handleFirstNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const firstName = event.target.value;
    const newFullName = currentPrefix ? `${currentPrefix} ${firstName}` : firstName;

    const nameEvent = {
      target: {
        name: 'firstName',
        value: newFullName.trim()
      }
    } as React.ChangeEvent<HTMLInputElement>;

    handleChange(nameEvent);
    setTouchedFields(prev => ({ ...prev, firstName: true }));
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(event);
    handleChange(event);
    setTouchedFields(prev => ({ ...prev, phone: true }));
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event);
    setTouchedFields(prev => ({ ...prev, city: true }));
  };

  return (
    <section className="flex flex-col space-y-3 w-full max-w-3xl mx-auto p-3 border rounded-lg border-gray-200 shadow-xs bg-gray-50">
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
              onChange={handlePhoneChange}
              onBlur={() => handleBlur('phone')}
              className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touchedFields.phone && validationErrors.phone ? 'border-red-500' : ''
                }`}
              placeholder="Enter phone number"
              maxLength={10}
            />
            {touchedFields.phone && validationErrors.phone && (
              <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.phone}</p>
            )}
            {filteredPatients?.length > 0 && (
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
          <div className="flex">
            <select
              name="prefix"
              value={currentPrefix}
              onChange={handlePrefixChange}
              className={`border rounded-l-md border-gray-300 p-1.5 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.prefix ? 'border-red-500' : ''
                }`}
            >
              <option value="">-</option>
              {Object.values(Prefix).map((prefix) => (
                <option key={prefix} value={prefix}>
                  {prefix}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="firstName"
              required
              value={currentFirstName}
              onChange={handleFirstNameChange}
              onBlur={() => handleBlur('firstName')}
              className={`border rounded-r-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touchedFields.firstName && validationErrors.firstName ? 'border-red-500' : ''
                }`}
              placeholder="First name"
            />
          </div>
          {touchedFields.firstName && validationErrors.firstName && (
            <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.firstName}</p>
          )}
          {validationErrors.prefix && (
            <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.prefix}</p>
          )}
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
            City <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={newPatient.city}
            onChange={handleCityChange}
            onBlur={() => handleBlur('city')}
            className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touchedFields.city && validationErrors.city ? 'border-red-500' : ''
              }`}
            placeholder="City"
          />
          {touchedFields.city && validationErrors.city && (
            <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.city}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 flex items-center">
            Date of Birth <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            name="dobInput"
            value={dobInput}
            onChange={handleDobInputChange}
            onBlur={() => handleBlur('dob')}
            placeholder="DD/MM/YYYY"
            className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${touchedFields.dob && validationErrors.dob ? 'border-red-500' : ''
              }`}
          />
          {touchedFields.dob && validationErrors.dob && (
            <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.dob}</p>
          )}
          {ageInputMode === 'dob' && newPatient.dateOfBirth && !validationErrors.dob && (
            <p className="text-[0.65rem] mt-1 text-gray-500">
              {formatAgeString(newPatient.age)}
            </p>
          )}
        </div>

        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1">
            Age Details (Manual Input)
          </label>
          <p className="text-xs text-gray-500 mb-1">
            Enter age details manually if you prefer not to use date of birth.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Years
              </label>
              <input
                type="text"
                name="ageYears"
                value={ageDetails.years}
                onChange={handleAgeDetailChange('years')}
                className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.years ? 'border-red-500' : ''
                  }`}
                placeholder="Enter years (0-100)"
                maxLength={3}
              />
              {validationErrors.years && (
                <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.years}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Months
              </label>
              <input
                type="text"
                name="ageMonths"
                value={ageDetails.months}
                onChange={handleAgeDetailChange('months')}
                className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.months ? 'border-red-500' : ''
                  }`}
                placeholder="Enter months (0-12)"
                maxLength={2}
              />
              {validationErrors.months && (
                <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.months}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                Days
              </label>
              <input
                type="text"
                name="ageDays"
                value={ageDetails.days}
                onChange={handleAgeDetailChange('days')}
                className={`border rounded-md border-gray-300 p-1.5 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.days ? 'border-red-500' : ''
                  }`}
                placeholder="Enter days (0-31)"
                maxLength={2}
              />
              {validationErrors.days && (
                <p className="text-[0.65rem] text-red-500 mt-1">{validationErrors.days}</p>
              )}
            </div>
          </div>
          {ageInputMode === 'manual' && newPatient.age && (
            <p className="text-[0.65rem] mt-1 text-gray-500">
              Age: {formatAgeString(newPatient.age)}
            </p>
          )}
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

function extractPrefixAndName(fullName: string): [Prefix | '', string] {
  if (!fullName) return ['', ''];

  const prefixValues = Object.values(Prefix);
  for (const prefix of prefixValues) {
    if (fullName.startsWith(prefix)) {
      const name = fullName.substring(prefix.length).trim();
      return [prefix, name];
    }
  }
  return ['', fullName];
}

function getGenderFromPrefix(prefix: Prefix | ''): Gender {
  switch (prefix) {
    case Prefix.Mr:
      return Gender.Male;
    case Prefix.Mrs:
    case Prefix.Ms:
      return Gender.Female;
    case Prefix.MS:
      return Gender.Other;
    default:
      return Gender.Other;
  }
}

export default PatientForm;