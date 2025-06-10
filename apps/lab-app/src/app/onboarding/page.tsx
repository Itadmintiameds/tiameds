// // 'use client';
// // import { DockIcon } from 'lucide-react';
// // import React, { useState } from 'react';
// // import { FaArrowLeft, FaArrowRight, FaCheck, FaCheckCircle, FaFileAlt, FaFlask, FaImage, FaMapMarkerAlt, FaPhoneAlt, FaUserCircle } from 'react-icons/fa';

// // import InputField from '../components/InputField';
// // import { RegisterData } from '@/types/onboarding/RegisterData';
// // import { LabRegisterData } from '@/types/onboarding/LabRegisterData';

// // const Onboarding = () => {
// //     const [step, setStep] = useState(1);
// //     const [formData, setFormData] = useState<RegisterData>({
// //         username: '',
// //         password: '',
// //         email: '',
// //         firstName: '',
// //         lastName: '',
// //         phone: '',
// //         address: '',
// //         city: '',
// //         state: '',
// //         zip: '',
// //         country: '',
// //         modules: [1],
// //         verified: false,
// //         profileImage: '',
// //         idProof: '',
// //         addressProof: '',
// //     });

// //     const [labData, setLabData] = useState<LabRegisterData>({
// //         labName: '', // Name of the laboratory (e.g., "ABC Diagnostic Laboratory")
// //         labType: '', // Type of the laboratory (e.g., "Diagnostic", "Research")
// //         licenseNumber: '', // License number of the laboratory (e.g., "12345-XYZ")

// //         labAddress: '', // Full address of the laboratory (e.g., "123 Main St, Springfield")
// //         labCity: '', // City where the laboratory is located (e.g., "Springfield")
// //         labState: '', // State or Province where the laboratory is based (e.g., "Illinois")
// //         labZip: '', // ZIP code of the laboratory (e.g., "62701")
// //         labCountry: '', // Country where the laboratory is located (e.g., "USA")

// //         labPhone: '', // Contact phone number for the laboratory (e.g., "+1 123-456-7890")
// //         labEmail: '', // Official email address for the laboratory (e.g., "info@abcdlab.com")

// //         directorName: '', // Name of the director of the laboratory (e.g., "Dr. John Doe")
// //         directorEmail: '', // Email of the laboratory director (e.g., "director@abcdlab.com")
// //         directorPhone: '', // Contact phone number for the laboratory director (e.g., "+1 123-456-7891")

// //         certificationBody: '', // Name of the certification body accrediting the laboratory (e.g., "ISO 9001")
// //         labCertificate: '', // Path to the laboratory’s accreditation document (e.g., "lab_certificate.pdf")

// //         dataPrivacyAgreement: false, // Boolean flag indicating whether the laboratory agrees to the data privacy terms

// //         directorGovtId: '', // Path to the director’s government-issued ID for verification (e.g., passport, national ID)
// //         labBusinessRegistration: '', // Path to the laboratory’s business registration document (e.g., Certificate of Incorporation)
// //         labLicense: '', // Path to the laboratory's operational license (e.g., medical testing license)
// //         taxId: '', // Path to the laboratory's Tax Identification Number (TIN) or Employer Identification Number (EIN) document
// //         labAccreditation: '' // Path to the accreditation document for the laboratory (e.g., NABL, ISO 9001)
// //     });

// //     const nextStep = () => setStep(step + 1);
// //     const prevStep = () => setStep(step - 1);

// //     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //         const { name, value } = e.target;
// //         setFormData({ ...formData, [name]: value });

// //     };

// //     const handleSubmitOnboarding = (e: React.FormEvent) => {
// //         e.preventDefault();
// //         console.log('Form submitted:', formData);
// //         setLabData({
// //             labName: formData.firstName,
// //             labType: formData.lastName,
// //             licenseNumber: formData.phone,
// //             labAddress: formData.address,
// //             labCity: formData.city,
// //             labState: formData.state,
// //             labZip: formData.zip,
// //             labCountry: formData.country,
// //             labPhone: formData.phone,
// //             labEmail: formData.email,
// //             directorName: formData.firstName,
// //             directorEmail: formData.email,
// //             directorPhone: formData.phone,
// //             certificationBody: 'ISO 9001',
// //             labCertificate: 'lab_certificate.pdf',
// //             dataPrivacyAgreement: true,
// //             directorGovtId: 'director_id.pdf',
// //             labBusinessRegistration: 'business_registration.pdf',
// //             labLicense: 'lab_license.pdf',
// //             taxId: 'tax_id.pdf',
// //             labAccreditation: 'lab_accreditation.pdf'
// //         })
// //     };

// //     const steps = [
// //         { icon: <FaUserCircle />, label: 'Basic Info (User)' }, // Step 1 for user (Basic Info)
// //         { icon: <FaMapMarkerAlt />, label: 'Address (User)' }, // Step 2 for user (Address Info)
// //         { icon: <FaImage />, label: 'Profile & Verification' }, // Step 3 for user (Profile Verification)
// //         { icon: <FaFlask />, label: 'Lab Details' }, // Step 1 for lab (Lab Details)
// //         { icon: <FaMapMarkerAlt />, label: 'Lab Address' }, // Step 2 for lab (Address Info)
// //         { icon: <FaPhoneAlt />, label: 'Lab Contact' }, // Step 3 for lab (Contact Info)
// //         { icon: <FaFileAlt />, label: 'Lab Certification' }, // Step 4 for lab (Certification)
// //         { icon: <FaCheckCircle />, label: 'Review & Submit' }, // Final Review step
// //     ];

// //     const renderStep = () => {
// //         switch (step) {
// //             case 1:
// //                 return (
// //                     <div className="p-6 rounded-lg shadow-lg max-w-full mx-auto">
// //                         <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
// //                             <FaUserCircle className="text-primary text-2xl" /> Basic Information
// //                         </h2>
// //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                             <InputField
// //                                 label="First Name"
// //                                 type="text"
// //                                 name="firstName"
// //                                 value={formData.firstName}
// //                                 onChange={handleInputChange}
// //                                 placeholder="First Name"
// //                             />
// //                             <InputField
// //                                 label="Last Name"
// //                                 type="text"
// //                                 name="lastName"
// //                                 value={formData.lastName}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Last Name"
// //                             />
// //                             <InputField
// //                                 label="Email"
// //                                 type="email"
// //                                 name="email"
// //                                 value={formData.email}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Email Address"
// //                             />
// //                             <InputField
// //                                 label="Phone"
// //                                 type="tel"
// //                                 name="phone"
// //                                 value={formData.phone}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Phone Number"
// //                             />
// //                             <InputField
// //                                 label="Username"
// //                                 type="text"
// //                                 name="username"
// //                                 value={formData.username}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Username"
// //                             />
// //                             <InputField
// //                                 label="Password"
// //                                 type="password"
// //                                 name="password"
// //                                 value={formData.password}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Password"
// //                             />
// //                         </div>
// //                     </div>

// //                 );
// //             case 2:
// //                 return (
// //                     <div className="p-6 rounded-lg shadow-lg max-w-full mx-auto">
// //                         <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
// //                             <FaMapMarkerAlt className="text-primary text-2xl" /> Address Information
// //                         </h2>
// //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                             <InputField
// //                                 label="Address"
// //                                 type="text"
// //                                 name="address"
// //                                 value={formData.address}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Address"
// //                             />
// //                             <InputField
// //                                 label="City"
// //                                 type="text"
// //                                 name="city"
// //                                 value={formData.city}
// //                                 onChange={handleInputChange}
// //                                 placeholder="City"
// //                             />
// //                             <InputField
// //                                 label="State"
// //                                 type="text"
// //                                 name="state"
// //                                 value={formData.state}
// //                                 onChange={handleInputChange}
// //                                 placeholder="State"
// //                             />
// //                             <InputField
// //                                 label="ZIP Code"
// //                                 type="text"
// //                                 name="zip"
// //                                 value={formData.zip}
// //                                 onChange={handleInputChange}
// //                                 placeholder="ZIP Code"
// //                             />
// //                             <InputField
// //                                 label="Country"
// //                                 type="text"
// //                                 name="country"
// //                                 value={formData.country}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Country"
// //                             />
// //                         </div>
// //                     </div>

// //                 );
// //             case 3:
// //                 return (
// //                     <div className="p-6 rounded-lg shadow-lg max-w-full mx-auto">
// //                         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
// //                             <FaFlask className="text-primary" /> Profile & Verification
// //                         </h2>
// //                         <div className="grid gap-4">
// //                             <InputField
// //                                 label="Profile Image"
// //                                 type="file"
// //                                 name="profileImage"
// //                                 value={formData.profileImage}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Profile Image"
// //                             />
// //                             <InputField
// //                                 label="ID Proof"
// //                                 type="file"
// //                                 name="idProof"
// //                                 value={formData.idProof}
// //                                 onChange={handleInputChange}
// //                                 placeholder="ID Proof"
// //                             />
// //                             <InputField
// //                                 label="Address Proof"
// //                                 type="file"
// //                                 name="addressProof"
// //                                 value={formData.addressProof}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Address Proof"
// //                             />
// //                             {/* <InputField
// //                                 label="Verified"
// //                                 type="checkbox"
// //                                 name="verified"
// //                                 value={formData.verified}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Verified"
// //                             /> */}

// //                         </div>
// //                     </div>
// //                 );
// //             case 4:
// //                 return (
// //                     <div className="p-6 rounded-lg shadow-lg max-w-full mx-auto">
// //                         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
// //                             <DockIcon className="text-primary" /> Lab Details
// //                         </h2>
// //                         <div className="grid gap-4">
// //                             <InputField
// //                                 label="Lab Name"
// //                                 type="text"
// //                                 name="labName"
// //                                 value={labData.labName}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Lab Name"
// //                             />
// //                             <InputField
// //                                 label="Lab Type"
// //                                 type="text"
// //                                 name="labType"
// //                                 value={labData.labType}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Lab Type"
// //                             />
// //                             <InputField
// //                                 label="License Number"
// //                                 type="text"
// //                                 name="licenseNumber"
// //                                 value={labData.licenseNumber}
// //                                 onChange={handleInputChange}
// //                                 placeholder="License Number"
// //                             />
// //                         </div>
// //                     </div>
// //                 );
// //             case 5:
// //                 return (
// //                     <div className="p-6 rounded-lg shadow-lg max-w-full mx-auto">
// //                         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
// //                             <DockIcon className="text-primary" /> Lab Address
// //                         </h2>
// //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                             <InputField
// //                                 label="Lab Address"
// //                                 type="text"
// //                                 name="labAddress"
// //                                 value={labData.labAddress}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Lab Address"
// //                             />
// //                             <InputField
// //                                 label="Lab City"
// //                                 type="text"
// //                                 name="labCity"
// //                                 value={labData.labCity}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Lab City"
// //                             />
// //                             <InputField
// //                                 label="Lab State"
// //                                 type="text"
// //                                 name="labState"
// //                                 value={labData.labState}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Lab State"
// //                             />
// //                             <InputField
// //                                 label="Lab ZIP"
// //                                 type="text"
// //                                 name="labZip"
// //                                 value={labData.labZip}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Lab ZIP"
// //                             />
// //                             <InputField
// //                                 label="Lab Country"
// //                                 type="text"
// //                                 name="labCountry"
// //                                 value={labData.labCountry}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Lab Country"
// //                             />
// //                         </div>
// //                     </div>
// //                 );
// //             case 6:
// //                 return (
// //                     <div className="p-6 rounded-lg shadow-lg max-w-full mx-auto">
// //                         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
// //                             <DockIcon className="text-primary" /> Lab Contact
// //                         </h2>
// //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                             <InputField
// //                                 label="Lab Phone"
// //                                 type="text"
// //                                 name="labPhone"
// //                                 value={labData.labPhone}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Lab Phone"
// //                             />
// //                             <InputField
// //                                 label="Lab Email"
// //                                 type="text"
// //                                 name="labEmail"
// //                                 value={labData.labEmail}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Lab Email"
// //                             />
// //                             <InputField
// //                                 label="Director Name"
// //                                 type="text"
// //                                 name="directorName"
// //                                 value={labData.directorName}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Director Name"
// //                             />
// //                             <InputField
// //                                 label="Director Email"
// //                                 type="text"
// //                                 name="directorEmail"
// //                                 value={labData.directorEmail}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Director Email"
// //                             />
// //                             <InputField
// //                                 label="Director Phone"
// //                                 type="text"
// //                                 name="directorPhone"
// //                                 value={labData.directorPhone}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Director Phone"
// //                             />
// //                         </div>
// //                     </div>

// //                 );
// //             // Case 7: Lab Certification
// //             // certificationBody
// //             // labCertificate
// //             // dataPrivacyAgreement
// //             // directorGovtId
// //             // labBusinessRegistration
// //             // labLicense
// //             // taxId

// //             case 7:
// //                 return (
// //                     <div className="p-6 rounded-lg shadow-lg max-w-full mx-auto">
// //                         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
// //                             <DockIcon className="text-primary" /> Lab Certification
// //                         </h2>
// //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                             <InputField
// //                                 label="Certification Body"
// //                                 type="file"
// //                                 name="certificationBody"
// //                                 value={labData.certificationBody}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Certification Body"
// //                             />
// //                             <InputField
// //                                 label="Lab Certificate"
// //                                 type="file"
// //                                 name="labCertificate"
// //                                 value={labData.labCertificate}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Lab Certificate"
// //                             />
// //                             {/* <InputField
// //                                 label="Data Privacy Agreement"
// //                                 type="checkbox"
// //                                 name="dataPrivacyAgreement"
// //                                 value={labData.dataPrivacyAgreement}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Data Privacy Agreement"
// //                             /> */}
// //                             <InputField
// //                                 label="Director Govt ID"
// //                                 type="file"
// //                                 name="directorGovtId"
// //                                 value={labData.directorGovtId}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Director Govt ID"
// //                             />
// //                             <InputField
// //                                 label="Lab Business Registration"
// //                                 type="file"
// //                                 name="labBusinessRegistration"
// //                                 value={labData.labBusinessRegistration}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Lab Business Registration"
// //                             />
// //                             <InputField
// //                                 label="Lab License"
// //                                 type="file"
// //                                 name="labLicense"
// //                                 value={labData.labLicense}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Lab License"
// //                             />
// //                             <InputField
// //                                 label="Tax ID"
// //                                 type="file"
// //                                 name="taxId"
// //                                 value={labData.taxId}
// //                                 onChange={handleInputChange}
// //                                 placeholder="Tax ID"
// //                             />
// //                         </div>
// //                     </div>
// //                 );
// //             // Default case: Review & Submit
// //             default:
// //                 return (
// //                     <div>
// //                         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
// //                             <FaFileAlt className="text-primary" /> Review & Submit
// //                         </h2>
// //                         <p>Review your details and click Submit.</p>
// //                     </div>
// //                 );
// //         }
// //     };

// //     return (
// //         <div className="relative py-16">
// //             <div
// //                 aria-hidden="true"
// //                 className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
// //             >
// //                 <div
// //                     style={{
// //                         clipPath:
// //                             'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
// //                     }}
// //                     className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
// //                 />
// //             </div>
// //             {/* <Header navigation={navigation} /> */}
// //             <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">

// //                 <div className="p-6 flex flex-col items-center gap-4 ">
// //                     <div className="text-center w-full  border-dashed border-2 border-primary p-6 rounded-lg">
// //                         {/* <div className="mb-5">
// //                             <Image src="/tiamed1.svg" alt="Lab Management System" width={40} height={40} className="mx-auto rounded-full" />
// //                         </div> */}
// //                         <h1 className="text-2xl font-semibold">Welcome! Let’s Get Started</h1>

// //                         <div className="relative flex justify-between items-center gap-6 mt-6">
// //                             {steps.map((item, index) => (
// //                                 <div key={index} className="flex items-center w-full">
// //                                     <div className="flex flex-col items-center text-center relative">
// //                                         <span
// //                                             className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step > index + 1 ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-primary border-gray-300'}`}
// //                                         >
// //                                             {item.icon}
// //                                         </span>
// //                                         <span className="text-xs font-medium mt-2 text-gray-700">{item.label}</span>
// //                                     </div>
// //                                     {index !== steps.length - 1 && (
// //                                         <div
// //                                             className={`flex-grow h-0 border-t-2 border-dotted -mt-4 ${step > index + 1 ? 'border-primary' : 'border-gray-300'}`}
// //                                         ></div>
// //                                     )}
// //                                 </div>
// //                             ))}
// //                         </div>
// //                     </div>


// //                     <div className="w-full  gap-4 border-dashed border-2 border-primary  rounded-lg">

// //                         {renderStep()}

// //                     </div>

// //                     <div className="flex justify-between w-full">
// //                         {step > 1 && (
// //                             <button
// //                                 onClick={prevStep}
// //                                 className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-primarylight"
// //                             >
// //                                 <FaArrowLeft /> Back
// //                             </button>
// //                         )}
// //                         <button
// //                             onClick={step < steps.length ? nextStep : () => alert('Form submitted!')}
// //                             className={`${step < steps.length ? 'bg-primary' : 'bg-success'
// //                                 } text-white px-4 py-2 rounded-lg flex items-center gap-1`}
// //                         >
// //                             {step < steps.length ? (
// //                                 <>
// //                                     Next <FaArrowRight />
// //                                 </>
// //                             ) : (
// //                                 <>
// //                                     <button onClick={handleSubmitOnboarding}
// //                                     type="submit" className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-primarylight">
// //                                         <FaCheck /> Submit
// //                                     </button>
// //                                 </>
// //                             )}
// //                         </button>
// //                     </div>

// //                 </div>

// //             </div>
// //         </div>
// //     );
// // };
// // export default Onboarding;





// 'use client';
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import {z} from 'zod';
// import { 
//   FaUser, 
//   FaLock, 
//   FaEnvelope, 
//   FaPhone, 
//   FaMapMarkerAlt, 
//   FaCity, 
//   FaGlobeAmericas, 
//   FaBuilding, 
//   FaIdCard, 
//   FaCertificate,
//   FaFileSignature,
//   FaShieldAlt
// } from 'react-icons/fa';
// import { MdDescription, MdPrivacyTip } from 'react-icons/md';
// import { Resolver } from 'react-hook-form';

// const LabOnboardingPage = () => {
//   // Form validation schema
//   const schema = z.object({
//     // User Information
//     username: z.string().nonempty('Username is required'),
//     password: z.string().min(8, 'Password must be at least 8 characters').nonempty('Password is required'),
//     email: z.string().email('Invalid email').nonempty('Email is required'),
//     firstName: z.string().nonempty('First name is required'),
//     lastName: z.string().nonempty('Last name is required'),
//     phone: z.string().regex(/^\+?[0-9. ()-]{7,25}$/, 'Invalid phone number').nonempty('Phone is required'),
    
//     // Lab Information
//     labName: z.string().nonempty('Lab name is required'),
//     labDescription: z.string(),
//     labAddress: z.string().nonempty('Lab address is required'),
//     labCity: z.string().nonempty('Lab city is required'),
//     labState: z.string().nonempty('Lab state is required'),
//     labZip: z.string().regex(/^[0-9]{5}(?:-[0-9]{4})?$/, 'Invalid ZIP code').nonempty('ZIP code is required'),
//     labCountry: z.string().nonempty('Country is required'),
//     labPhone: z.string().regex(/^\+?[0-9. ()-]{7,25}$/, 'Invalid phone number').nonempty('Lab phone is required'),
//     labEmail: z.string().email('Invalid email').nonempty('Lab email is required'),
    
//     // Director Information
//     directorName: z.string().nonempty('Director name is required'),
//     directorEmail: z.string().email('Invalid email').nonempty('Director email is required'),
//     directorPhone: z.string().regex(/^\+?[0-9. ()-]{7,25}$/, 'Invalid phone number').nonempty('Director phone is required'),
    
//     // Legal Information
//     licenseNumber: z.string().nonempty('License number is required'),
//     labType: z.string().nonempty('Lab type is required'),
//     certificationBody: z.string(),
//     taxId: z.string(),
    
//     // Agreements
//     dataPrivacyAgreement: z.boolean().refine(val => val === true, { message: 'You must accept the data privacy agreement' }),
//     termsAgreement: z.boolean().refine(val => val === true, { message: 'You must accept the terms and conditions' }),
//   });

//   const { register, handleSubmit, formState: { errors }, watch } = useForm({
//     resolver: zResolver(schema)
//   });

//   const [currentStep, setCurrentStep] = useState(1);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitSuccess, setSubmitSuccess] = useState(false);

//   const onSubmit = async (data: any) => {
//     setIsSubmitting(true);
//     try {
//       // Here you would typically send the data to your API
//       console.log('Form data:', data);
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1500));
//       setSubmitSuccess(true);
//     } catch (error) {
//       console.error('Submission error:', error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const nextStep = () => {
//     setCurrentStep(currentStep + 1);
//     window.scrollTo(0, 0);
//   };

//   const prevStep = () => {
//     setCurrentStep(currentStep - 1);
//     window.scrollTo(0, 0);
//   };

//   if (submitSuccess) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full text-center">
//           <div className="text-green-500 text-6xl mb-4">✓</div>
//           <h1 className="text-3xl font-bold text-gray-800 mb-4">Registration Successful!</h1>
//           <p className="text-gray-600 mb-6">
//             Thank you for registering your lab with our management system. Your account is being reviewed and you'll receive a confirmation email shortly.
//           </p>
//           <div className="bg-blue-50 p-4 rounded-lg text-left">
//             <h2 className="font-semibold text-blue-800 mb-2">Next Steps:</h2>
//             <ul className="list-disc list-inside text-blue-700 space-y-1">
//               <li>Check your email for verification</li>
//               <li>Complete your lab profile setup</li>
//               <li>Add your team members</li>
//               <li>Configure your lab settings</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-extrabold text-gray-900">Lab Management System Onboarding</h1>
//           <p className="mt-2 text-lg text-gray-600">
//             Complete the following steps to register your lab and create your administrator account
//           </p>
//         </div>

//         {/* Progress Steps */}
//         <div className="mb-8">
//           <div className="flex justify-between">
//             {[1, 2, 3, 4].map((step) => (
//               <div key={step} className="flex flex-col items-center">
//                 <div
//                   className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold 
//                     ${currentStep > step ? 'bg-green-500' : 
//                      currentStep === step ? 'bg-blue-600' : 'bg-gray-300'}`}
//                 >
//                   {currentStep > step ? '✓' : step}
//                 </div>
//                 <span className="mt-2 text-sm font-medium text-gray-600">
//                   {step === 1 && 'User Info'}
//                   {step === 2 && 'Lab Info'}
//                   {step === 3 && 'Legal Info'}
//                   {step === 4 && 'Review'}
//                 </span>
//               </div>
//             ))}
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
//             <div 
//               className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
//               style={{ width: `${(currentStep - 1) * 33.33}%` }}
//             ></div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-xl rounded-lg p-6 sm:p-8">
//           {/* Step 1: User Information */}
//           {currentStep === 1 && (
//             <div className="space-y-6">
//               <h2 className="text-2xl font-bold text-gray-800 flex items-center">
//                 <FaUser className="mr-2 text-blue-600" />
//                 User Information
//               </h2>
//               <p className="text-gray-600">Create your administrator account for the lab management system.</p>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
//                     First Name
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaUser className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="firstName"
//                       type="text"
//                       {...register('firstName')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.firstName?.message && typeof errors.firstName.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
//                     Last Name
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaUser className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="lastName"
//                       type="text"
//                       {...register('lastName')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.lastName?.message && typeof errors.lastName.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label htmlFor="username" className="block text-sm font-medium text-gray-700">
//                     Username
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaUser className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="username"
//                       type="text"
//                       {...register('username')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.username ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.username && typeof errors.username.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                     Email
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaEnvelope className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="email"
//                       type="email"
//                       {...register('email')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.email && typeof errors.email.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                     Password
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaLock className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="password"
//                       type="password"
//                       {...register('password')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.password && typeof errors.password.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
//                     Phone Number
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaPhone className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="phone"
//                       type="tel"
//                       {...register('phone')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.phone && typeof errors.phone.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
//                   )}
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <button
//                   type="button"
//                   onClick={nextStep}
//                   className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   Next: Lab Information
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Step 2: Lab Information */}
//           {currentStep === 2 && (
//             <div className="space-y-6">
//               <h2 className="text-2xl font-bold text-gray-800 flex items-center">
//                 <FaBuilding className="mr-2 text-blue-600" />
//                 Lab Information
//               </h2>
//               <p className="text-gray-600">Provide details about your laboratory facility.</p>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="md:col-span-2">
//                   <label htmlFor="labName" className="block text-sm font-medium text-gray-700">
//                     Lab Name
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaBuilding className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="labName"
//                       type="text"
//                       {...register('labName')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.labName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.labName && typeof errors.labName.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.labName.message}</p>
//                   )}
//                 </div>

//                 <div className="md:col-span-2">
//                   <label htmlFor="labDescription" className="block text-sm font-medium text-gray-700">
//                     Lab Description
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
//                       <MdDescription className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <textarea
//                       id="labDescription"
//                       rows={3}
//                       {...register('labDescription')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.labDescription ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.labDescription && typeof errors.labDescription.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.labDescription.message}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label htmlFor="labAddress" className="block text-sm font-medium text-gray-700">
//                     Lab Address
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="labAddress"
//                       type="text"
//                       {...register('labAddress')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.labAddress ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.labAddress && typeof errors.labAddress.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.labAddress.message}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label htmlFor="labCity" className="block text-sm font-medium text-gray-700">
//                     City
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaCity className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="labCity"
//                       type="text"
//                       {...register('labCity')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.labCity ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.labCity && typeof errors.labCity.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.labCity.message}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label htmlFor="labState" className="block text-sm font-medium text-gray-700">
//                     State/Province
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="labState"
//                       type="text"
//                       {...register('labState')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.labState ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.labState && typeof errors.labState.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.labState.message}</p>
//                   )}

//                 </div>

//                 <div>
//                   <label htmlFor="labZip" className="block text-sm font-medium text-gray-700">
//                     ZIP/Postal Code
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="labZip"
//                       type="text"
//                       {...register('labZip')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.labZip ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.labZip && typeof errors.labZip.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.labZip.message}</p>
//                   )}

//                 </div>

//                 <div>
//                   <label htmlFor="labCountry" className="block text-sm font-medium text-gray-700">
//                     Country
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaGlobeAmericas className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="labCountry"
//                       type="text"
//                       {...register('labCountry')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.labCountry ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.labCountry && typeof errors.labCountry.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.labCountry.message}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label htmlFor="labPhone" className="block text-sm font-medium text-gray-700">
//                     Lab Phone
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaPhone className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="labPhone"
//                       type="tel"
//                       {...register('labPhone')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.labPhone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.labPhone && typeof errors.labPhone.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.labPhone.message}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label htmlFor="labEmail" className="block text-sm font-medium text-gray-700">
//                     Lab Email
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaEnvelope className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="labEmail"
//                       type="email"
//                       {...register('labEmail')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.labEmail ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {errors.labEmail && typeof errors.labEmail.message === 'string' && (
//                     <p className="mt-1 text-sm text-red-600">{errors.labEmail.message}</p>
//                   )}
//                 </div>
//               </div>

//               <div className="flex justify-between">
//                 <button
//                   type="button"
//                   onClick={prevStep}
//                   className="inline-flex justify-center py-2 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   Back
//                 </button>
//                 <button
//                   type="button"
//                   onClick={nextStep}
//                   className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   Next: Legal Information
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Step 3: Legal Information */}
//           {currentStep === 3 && (
//             <div className="space-y-6">
//               <h2 className="text-2xl font-bold text-gray-800 flex items-center">
//                 <FaIdCard className="mr-2 text-blue-600" />
//                 Legal Information
//               </h2>
//               <p className="text-gray-600">Provide legal and regulatory details about your laboratory.</p>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label htmlFor="directorName" className="block text-sm font-medium text-gray-700">
//                     Director Name
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaUser className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="directorName"
//                       type="text"
//                       {...register('directorName')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.directorName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {/* {errors.directorName && (
//                     <p className="mt-1 text-sm text-red-600">{errors.directorName.message}</p>
//                   )} */}
//                 </div>

//                 <div>
//                   <label htmlFor="directorEmail" className="block text-sm font-medium text-gray-700">
//                     Director Email
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaEnvelope className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="directorEmail"
//                       type="email"
//                       {...register('directorEmail')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.directorEmail ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {/* {errors.directorEmail &&  (
//                     <p className="mt-1 text-sm text-red-600">{errors.directorEmail.message}</p>
//                   )} */}
//                 </div>

//                 <div>
//                   <label htmlFor="directorPhone" className="block text-sm font-medium text-gray-700">
//                     Director Phone
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaPhone className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="directorPhone"
//                       type="tel"
//                       {...register('directorPhone')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.directorPhone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {/* {errors.directorPhone && (
//                     <p className="mt-1 text-sm text-red-600">{errors.directorPhone.message}</p>
//                   )} */}
//                 </div>

//                 <div>
//                   <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
//                     License Number
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaFileSignature className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="licenseNumber"
//                       type="text"
//                       {...register('licenseNumber')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.licenseNumber ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {/* {errors.licenseNumber && (
//                     <p className="mt-1 text-sm text-red-600">{errors.licenseNumber.message}</p>
//                   )} */}
//                 </div>

//                 <div>
//                   <label htmlFor="labType" className="block text-sm font-medium text-gray-700">
//                     Lab Type
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaBuilding className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <select
//                       id="labType"
//                       {...register('labType')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.labType ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     >
//                       <option value="">Select lab type</option>
//                       <option value="Clinical">Clinical</option>
//                       <option value="Research">Research</option>
//                       <option value="Pathology">Pathology</option>
//                       <option value="Environmental">Environmental</option>
//                       <option value="Forensic">Forensic</option>
//                       <option value="Other">Other</option>
//                     </select>
//                   </div>
//                   {/* {errors.labType && (
//                     <p className="mt-1 text-sm text-red-600">{errors.labType.message}</p>
//                   )} */}
//                 </div>

//                 <div>
//                   <label htmlFor="certificationBody" className="block text-sm font-medium text-gray-700">
//                     Certification Body
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaCertificate className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="certificationBody"
//                       type="text"
//                       {...register('certificationBody')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.certificationBody ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {/* {errors.certificationBody && (
//                     <p className="mt-1 text-sm text-red-600">{errors.certificationBody.message}</p>
//                   )} */}
//                 </div>

//                 <div>
//                   <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
//                     Tax ID
//                   </label>
//                   <div className="mt-1 relative rounded-md shadow-sm">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <FaIdCard className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="taxId"
//                       type="text"
//                       {...register('taxId')}
//                       className={`block w-full pl-10 pr-3 py-2 border ${errors.taxId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
//                     />
//                   </div>
//                   {/* {errors.taxId && (
//                     <p className="mt-1 text-sm text-red-600">{errors.taxId.message}</p>
//                   )} */}
//                 </div>
//               </div>

//               <div className="pt-4 border-t border-gray-200">
//                 <div className="flex items-start">
//                   <div className="flex items-center h-5">
//                     <input
//                       id="dataPrivacyAgreement"
//                       type="checkbox"
//                       {...register('dataPrivacyAgreement')}
//                       className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
//                     />
//                   </div>
//                   <div className="ml-3 text-sm">
//                     <label htmlFor="dataPrivacyAgreement" className="font-medium text-gray-700">
//                       Data Privacy Agreement
//                     </label>
//                     <p className="text-gray-500">
//                       I agree to the processing of personal data in accordance with the data privacy policy.
//                     </p>
//                     {/* {errors.dataPrivacyAgreement && (
//                       <p className="mt-1 text-sm text-red-600">{errors.dataPrivacyAgreement.message}</p>
//                     )} */}
//                   </div>
//                 </div>

//                 <div className="mt-4 flex items-start">
//                   <div className="flex items-center h-5">
//                     <input
//                       id="termsAgreement"
//                       type="checkbox"
//                       {...register('termsAgreement')}
//                       className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
//                     />
//                   </div>
//                   <div className="ml-3 text-sm">
//                     <label htmlFor="termsAgreement" className="font-medium text-gray-700">
//                       Terms and Conditions
//                     </label>
//                     <p className="text-gray-500">
//                       I agree to the terms and conditions of using the lab management system.
//                     </p>
//                     {/* {errors.termsAgreement && (
//                       <p className="mt-1 text-sm text-red-600">{errors.termsAgreement.message}</p>
//                     )} */}
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-between">
//                 <button
//                   type="button"
//                   onClick={prevStep}
//                   className="inline-flex justify-center py-2 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   Back
//                 </button>
//                 <button
//                   type="button"
//                   onClick={nextStep}
//                   className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   Next: Review Information
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Step 4: Review Information */}
//           {currentStep === 4 && (
//             <div className="space-y-6">
//               <h2 className="text-2xl font-bold text-gray-800 flex items-center">
//                 <FaShieldAlt className="mr-2 text-blue-600" />
//                 Review Information
//               </h2>
//               <p className="text-gray-600">Please review all the information before submitting.</p>
              
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h3 className="text-lg font-medium text-gray-900 mb-3">User Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Full Name</p>
//                     <p className="text-sm text-gray-900">{watch('firstName')} {watch('lastName')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Username</p>
//                     <p className="text-sm text-gray-900">{watch('username')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Email</p>
//                     <p className="text-sm text-gray-900">{watch('email')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Phone</p>
//                     <p className="text-sm text-gray-900">{watch('phone')}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-gray-50 p-4 rounded-lg mt-6">
//                 <h3 className="text-lg font-medium text-gray-900 mb-3">Lab Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Lab Name</p>
//                     <p className="text-sm text-gray-900">{watch('labName')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Lab Description</p>
//                     <p className="text-sm text-gray-900">{watch('labDescription')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Address</p>
//                     <p className="text-sm text-gray-900">{watch('labAddress')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">City</p>
//                     <p className="text-sm text-gray-900">{watch('labCity')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">State/Province</p>
//                     <p className="text-sm text-gray-900">{watch('labState')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">ZIP/Postal Code</p>
//                     <p className="text-sm text-gray-900">{watch('labZip')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Country</p>
//                     <p className="text-sm text-gray-900">{watch('labCountry')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Phone</p>
//                     <p className="text-sm text-gray-900">{watch('labPhone')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Email</p>
//                     <p className="text-sm text-gray-900">{watch('labEmail')}</p>
//                   </div>
//                 </div>


//               </div>

//               <div className="bg-gray-50 p-4 rounded-lg mt-6">
//                 <h3 className="text-lg font-medium text-gray-900 mb-3">Legal Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Director Name</p>
//                     <p className="text-sm text-gray-900">{watch('directorName')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Director Email</p>
//                     <p className="text-sm text-gray-900">{watch('directorEmail')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Director Phone</p>
//                     <p className="text-sm text-gray-900">{watch('directorPhone')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">License Number</p>
//                     <p className="text-sm text-gray-900">{watch('licenseNumber')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Lab Type</p>
//                     <p className="text-sm text-gray-900">{watch('labType')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Certification Body</p>
//                     <p className="text-sm text-gray-900">{watch('certificationBody')}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-gray-500">Tax ID</p>
//                     <p className="text-sm text-gray-900">{watch('taxId')}</p>
//                   </div>
//                 </div>

//                 <div className="mt-4">
//                   <h4 className="font-medium text-gray-700">Agreements</h4>
//                   <ul className="list-disc pl-5 mt-2 space-y-1">
//                     {watch('dataPrivacyAgreement') && (
//                       <li className="text-sm text-gray-600">Data Privacy Agreement: Agreed</li>
//                     )}
//                     {watch('termsAgreement') && (
//                       <li className="text-sm text-gray-600">Terms and Conditions: Agreed</li>
//                     )}

//                     {!watch('dataPrivacyAgreement') && (
//                       <li className="text-sm text-red-600">Data Privacy Agreement: Not Agreed</li>
//                     )}
//                     {!watch('termsAgreement') && (
//                       <li className="text-sm text-red-600">Terms and Conditions: Not Agreed</li>
//                     )}

//                   </ul>

//                 </div>


//               </div>

//               <div className="flex justify-between">
//                 <button
//                   type="button"
//                   onClick={prevStep}
//                   className="inline-flex justify-center py-2 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   Back
//                 </button>
//                 <button
//                   type="submit"
//                   className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   Submit Onboarding
//                 </button>

//               </div>

//             </div>

//           )}

//         </form>

//       </div>

//     </div>

//   );

// }













// function zResolver<T extends z.ZodTypeAny>(schema: T): Resolver<any> {
//   return async (values, context, options) => {
//     try {
//       const result = await schema.safeParseAsync(values);
//       if (result.success) {
//         return {
//           values: result.data,
//           errors: {},
//         };
//       } else {
//         const errors: Record<string, any> = {};
//         result.error.errors.forEach((err) => {
//           if (err.path && err.path.length > 0) {
//             const field = err.path[0] as string;
//             errors[field] = {
//               type: err.code,
//               message: err.message,
//             };
//           }
//         });
//         return {
//           values: {},
//           errors,
//         };
//       }
//     } catch (e) {
//       return {
//         values: {},
//         errors: {},
//       };
//     }
//   };
// }


import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page