// 'use client';
// import { DockIcon } from 'lucide-react';
// import React, { useState } from 'react';
// import { FaArrowLeft, FaArrowRight, FaCheck, FaCheckCircle, FaFileAlt, FaFlask, FaImage, FaMapMarkerAlt, FaPhoneAlt, FaUserCircle } from 'react-icons/fa';

// import InputField from '../components/InputField';
// import { RegisterData } from '@/types/onboarding/RegisterData';
// import { LabRegisterData } from '@/types/onboarding/LabRegisterData';

// const Onboarding = () => {
//     const [step, setStep] = useState(1);
//     const [formData, setFormData] = useState<RegisterData>({
//         username: '',
//         password: '',
//         email: '',
//         firstName: '',
//         lastName: '',
//         phone: '',
//         address: '',
//         city: '',
//         state: '',
//         zip: '',
//         country: '',
//         modules: [1],
//         verified: false,
//         profileImage: '',
//         idProof: '',
//         addressProof: '',
//     });

//     const [labData, setLabData] = useState<LabRegisterData>({
//         labName: '', // Name of the laboratory (e.g., "ABC Diagnostic Laboratory")
//         labType: '', // Type of the laboratory (e.g., "Diagnostic", "Research")
//         licenseNumber: '', // License number of the laboratory (e.g., "12345-XYZ")

//         labAddress: '', // Full address of the laboratory (e.g., "123 Main St, Springfield")
//         labCity: '', // City where the laboratory is located (e.g., "Springfield")
//         labState: '', // State or Province where the laboratory is based (e.g., "Illinois")
//         labZip: '', // ZIP code of the laboratory (e.g., "62701")
//         labCountry: '', // Country where the laboratory is located (e.g., "USA")

//         labPhone: '', // Contact phone number for the laboratory (e.g., "+1 123-456-7890")
//         labEmail: '', // Official email address for the laboratory (e.g., "info@abcdlab.com")

//         directorName: '', // Name of the director of the laboratory (e.g., "Dr. John Doe")
//         directorEmail: '', // Email of the laboratory director (e.g., "director@abcdlab.com")
//         directorPhone: '', // Contact phone number for the laboratory director (e.g., "+1 123-456-7891")

//         certificationBody: '', // Name of the certification body accrediting the laboratory (e.g., "ISO 9001")
//         labCertificate: '', // Path to the laboratory’s accreditation document (e.g., "lab_certificate.pdf")

//         dataPrivacyAgreement: false, // Boolean flag indicating whether the laboratory agrees to the data privacy terms

//         directorGovtId: '', // Path to the director’s government-issued ID for verification (e.g., passport, national ID)
//         labBusinessRegistration: '', // Path to the laboratory’s business registration document (e.g., Certificate of Incorporation)
//         labLicense: '', // Path to the laboratory's operational license (e.g., medical testing license)
//         taxId: '', // Path to the laboratory's Tax Identification Number (TIN) or Employer Identification Number (EIN) document
//         labAccreditation: '' // Path to the accreditation document for the laboratory (e.g., NABL, ISO 9001)
//     });

//     const nextStep = () => setStep(step + 1);
//     const prevStep = () => setStep(step - 1);

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });

//     };

//     const handleSubmitOnboarding = (e: React.FormEvent) => {
//         e.preventDefault();
//         console.log('Form submitted:', formData);
//         setLabData({
//             labName: formData.firstName,
//             labType: formData.lastName,
//             licenseNumber: formData.phone,
//             labAddress: formData.address,
//             labCity: formData.city,
//             labState: formData.state,
//             labZip: formData.zip,
//             labCountry: formData.country,
//             labPhone: formData.phone,
//             labEmail: formData.email,
//             directorName: formData.firstName,
//             directorEmail: formData.email,
//             directorPhone: formData.phone,
//             certificationBody: 'ISO 9001',
//             labCertificate: 'lab_certificate.pdf',
//             dataPrivacyAgreement: true,
//             directorGovtId: 'director_id.pdf',
//             labBusinessRegistration: 'business_registration.pdf',
//             labLicense: 'lab_license.pdf',
//             taxId: 'tax_id.pdf',
//             labAccreditation: 'lab_accreditation.pdf'
//         })
//     };

//     const steps = [
//         { icon: <FaUserCircle />, label: 'Basic Info (User)' }, // Step 1 for user (Basic Info)
//         { icon: <FaMapMarkerAlt />, label: 'Address (User)' }, // Step 2 for user (Address Info)
//         { icon: <FaImage />, label: 'Profile & Verification' }, // Step 3 for user (Profile Verification)
//         { icon: <FaFlask />, label: 'Lab Details' }, // Step 1 for lab (Lab Details)
//         { icon: <FaMapMarkerAlt />, label: 'Lab Address' }, // Step 2 for lab (Address Info)
//         { icon: <FaPhoneAlt />, label: 'Lab Contact' }, // Step 3 for lab (Contact Info)
//         { icon: <FaFileAlt />, label: 'Lab Certification' }, // Step 4 for lab (Certification)
//         { icon: <FaCheckCircle />, label: 'Review & Submit' }, // Final Review step
//     ];

//     const renderStep = () => {
//         switch (step) {
//             case 1:
//                 return (
//                     <div className="p-6 rounded-lg shadow-lg max-w-full mx-auto">
//                         <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
//                             <FaUserCircle className="text-primary text-2xl" /> Basic Information
//                         </h2>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <InputField
//                                 label="First Name"
//                                 type="text"
//                                 name="firstName"
//                                 value={formData.firstName}
//                                 onChange={handleInputChange}
//                                 placeholder="First Name"
//                             />
//                             <InputField
//                                 label="Last Name"
//                                 type="text"
//                                 name="lastName"
//                                 value={formData.lastName}
//                                 onChange={handleInputChange}
//                                 placeholder="Last Name"
//                             />
//                             <InputField
//                                 label="Email"
//                                 type="email"
//                                 name="email"
//                                 value={formData.email}
//                                 onChange={handleInputChange}
//                                 placeholder="Email Address"
//                             />
//                             <InputField
//                                 label="Phone"
//                                 type="tel"
//                                 name="phone"
//                                 value={formData.phone}
//                                 onChange={handleInputChange}
//                                 placeholder="Phone Number"
//                             />
//                             <InputField
//                                 label="Username"
//                                 type="text"
//                                 name="username"
//                                 value={formData.username}
//                                 onChange={handleInputChange}
//                                 placeholder="Username"
//                             />
//                             <InputField
//                                 label="Password"
//                                 type="password"
//                                 name="password"
//                                 value={formData.password}
//                                 onChange={handleInputChange}
//                                 placeholder="Password"
//                             />
//                         </div>
//                     </div>

//                 );
//             case 2:
//                 return (
//                     <div className="p-6 rounded-lg shadow-lg max-w-full mx-auto">
//                         <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
//                             <FaMapMarkerAlt className="text-primary text-2xl" /> Address Information
//                         </h2>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <InputField
//                                 label="Address"
//                                 type="text"
//                                 name="address"
//                                 value={formData.address}
//                                 onChange={handleInputChange}
//                                 placeholder="Address"
//                             />
//                             <InputField
//                                 label="City"
//                                 type="text"
//                                 name="city"
//                                 value={formData.city}
//                                 onChange={handleInputChange}
//                                 placeholder="City"
//                             />
//                             <InputField
//                                 label="State"
//                                 type="text"
//                                 name="state"
//                                 value={formData.state}
//                                 onChange={handleInputChange}
//                                 placeholder="State"
//                             />
//                             <InputField
//                                 label="ZIP Code"
//                                 type="text"
//                                 name="zip"
//                                 value={formData.zip}
//                                 onChange={handleInputChange}
//                                 placeholder="ZIP Code"
//                             />
//                             <InputField
//                                 label="Country"
//                                 type="text"
//                                 name="country"
//                                 value={formData.country}
//                                 onChange={handleInputChange}
//                                 placeholder="Country"
//                             />
//                         </div>
//                     </div>

//                 );
//             case 3:
//                 return (
//                     <div className="p-6 rounded-lg shadow-lg max-w-full mx-auto">
//                         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//                             <FaFlask className="text-primary" /> Profile & Verification
//                         </h2>
//                         <div className="grid gap-4">
//                             <InputField
//                                 label="Profile Image"
//                                 type="file"
//                                 name="profileImage"
//                                 value={formData.profileImage}
//                                 onChange={handleInputChange}
//                                 placeholder="Profile Image"
//                             />
//                             <InputField
//                                 label="ID Proof"
//                                 type="file"
//                                 name="idProof"
//                                 value={formData.idProof}
//                                 onChange={handleInputChange}
//                                 placeholder="ID Proof"
//                             />
//                             <InputField
//                                 label="Address Proof"
//                                 type="file"
//                                 name="addressProof"
//                                 value={formData.addressProof}
//                                 onChange={handleInputChange}
//                                 placeholder="Address Proof"
//                             />
//                             {/* <InputField
//                                 label="Verified"
//                                 type="checkbox"
//                                 name="verified"
//                                 value={formData.verified}
//                                 onChange={handleInputChange}
//                                 placeholder="Verified"
//                             /> */}

//                         </div>
//                     </div>
//                 );
//             case 4:
//                 return (
//                     <div className="p-6 rounded-lg shadow-lg max-w-full mx-auto">
//                         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//                             <DockIcon className="text-primary" /> Lab Details
//                         </h2>
//                         <div className="grid gap-4">
//                             <InputField
//                                 label="Lab Name"
//                                 type="text"
//                                 name="labName"
//                                 value={labData.labName}
//                                 onChange={handleInputChange}
//                                 placeholder="Lab Name"
//                             />
//                             <InputField
//                                 label="Lab Type"
//                                 type="text"
//                                 name="labType"
//                                 value={labData.labType}
//                                 onChange={handleInputChange}
//                                 placeholder="Lab Type"
//                             />
//                             <InputField
//                                 label="License Number"
//                                 type="text"
//                                 name="licenseNumber"
//                                 value={labData.licenseNumber}
//                                 onChange={handleInputChange}
//                                 placeholder="License Number"
//                             />
//                         </div>
//                     </div>
//                 );
//             case 5:
//                 return (
//                     <div className="p-6 rounded-lg shadow-lg max-w-full mx-auto">
//                         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//                             <DockIcon className="text-primary" /> Lab Address
//                         </h2>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <InputField
//                                 label="Lab Address"
//                                 type="text"
//                                 name="labAddress"
//                                 value={labData.labAddress}
//                                 onChange={handleInputChange}
//                                 placeholder="Lab Address"
//                             />
//                             <InputField
//                                 label="Lab City"
//                                 type="text"
//                                 name="labCity"
//                                 value={labData.labCity}
//                                 onChange={handleInputChange}
//                                 placeholder="Lab City"
//                             />
//                             <InputField
//                                 label="Lab State"
//                                 type="text"
//                                 name="labState"
//                                 value={labData.labState}
//                                 onChange={handleInputChange}
//                                 placeholder="Lab State"
//                             />
//                             <InputField
//                                 label="Lab ZIP"
//                                 type="text"
//                                 name="labZip"
//                                 value={labData.labZip}
//                                 onChange={handleInputChange}
//                                 placeholder="Lab ZIP"
//                             />
//                             <InputField
//                                 label="Lab Country"
//                                 type="text"
//                                 name="labCountry"
//                                 value={labData.labCountry}
//                                 onChange={handleInputChange}
//                                 placeholder="Lab Country"
//                             />
//                         </div>
//                     </div>
//                 );
//             case 6:
//                 return (
//                     <div className="p-6 rounded-lg shadow-lg max-w-full mx-auto">
//                         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//                             <DockIcon className="text-primary" /> Lab Contact
//                         </h2>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <InputField
//                                 label="Lab Phone"
//                                 type="text"
//                                 name="labPhone"
//                                 value={labData.labPhone}
//                                 onChange={handleInputChange}
//                                 placeholder="Lab Phone"
//                             />
//                             <InputField
//                                 label="Lab Email"
//                                 type="text"
//                                 name="labEmail"
//                                 value={labData.labEmail}
//                                 onChange={handleInputChange}
//                                 placeholder="Lab Email"
//                             />
//                             <InputField
//                                 label="Director Name"
//                                 type="text"
//                                 name="directorName"
//                                 value={labData.directorName}
//                                 onChange={handleInputChange}
//                                 placeholder="Director Name"
//                             />
//                             <InputField
//                                 label="Director Email"
//                                 type="text"
//                                 name="directorEmail"
//                                 value={labData.directorEmail}
//                                 onChange={handleInputChange}
//                                 placeholder="Director Email"
//                             />
//                             <InputField
//                                 label="Director Phone"
//                                 type="text"
//                                 name="directorPhone"
//                                 value={labData.directorPhone}
//                                 onChange={handleInputChange}
//                                 placeholder="Director Phone"
//                             />
//                         </div>
//                     </div>

//                 );
//             // Case 7: Lab Certification
//             // certificationBody
//             // labCertificate
//             // dataPrivacyAgreement
//             // directorGovtId
//             // labBusinessRegistration
//             // labLicense
//             // taxId

//             case 7:
//                 return (
//                     <div className="p-6 rounded-lg shadow-lg max-w-full mx-auto">
//                         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//                             <DockIcon className="text-primary" /> Lab Certification
//                         </h2>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <InputField
//                                 label="Certification Body"
//                                 type="file"
//                                 name="certificationBody"
//                                 value={labData.certificationBody}
//                                 onChange={handleInputChange}
//                                 placeholder="Certification Body"
//                             />
//                             <InputField
//                                 label="Lab Certificate"
//                                 type="file"
//                                 name="labCertificate"
//                                 value={labData.labCertificate}
//                                 onChange={handleInputChange}
//                                 placeholder="Lab Certificate"
//                             />
//                             {/* <InputField
//                                 label="Data Privacy Agreement"
//                                 type="checkbox"
//                                 name="dataPrivacyAgreement"
//                                 value={labData.dataPrivacyAgreement}
//                                 onChange={handleInputChange}
//                                 placeholder="Data Privacy Agreement"
//                             /> */}
//                             <InputField
//                                 label="Director Govt ID"
//                                 type="file"
//                                 name="directorGovtId"
//                                 value={labData.directorGovtId}
//                                 onChange={handleInputChange}
//                                 placeholder="Director Govt ID"
//                             />
//                             <InputField
//                                 label="Lab Business Registration"
//                                 type="file"
//                                 name="labBusinessRegistration"
//                                 value={labData.labBusinessRegistration}
//                                 onChange={handleInputChange}
//                                 placeholder="Lab Business Registration"
//                             />
//                             <InputField
//                                 label="Lab License"
//                                 type="file"
//                                 name="labLicense"
//                                 value={labData.labLicense}
//                                 onChange={handleInputChange}
//                                 placeholder="Lab License"
//                             />
//                             <InputField
//                                 label="Tax ID"
//                                 type="file"
//                                 name="taxId"
//                                 value={labData.taxId}
//                                 onChange={handleInputChange}
//                                 placeholder="Tax ID"
//                             />
//                         </div>
//                     </div>
//                 );
//             // Default case: Review & Submit
//             default:
//                 return (
//                     <div>
//                         <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//                             <FaFileAlt className="text-primary" /> Review & Submit
//                         </h2>
//                         <p>Review your details and click Submit.</p>
//                     </div>
//                 );
//         }
//     };

//     return (
//         <div className="relative py-16">
//             <div
//                 aria-hidden="true"
//                 className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
//             >
//                 <div
//                     style={{
//                         clipPath:
//                             'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//                     }}
//                     className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
//                 />
//             </div>
//             {/* <Header navigation={navigation} /> */}
//             <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">

//                 <div className="p-6 flex flex-col items-center gap-4 ">
//                     <div className="text-center w-full  border-dashed border-2 border-primary p-6 rounded-lg">
//                         {/* <div className="mb-5">
//                             <Image src="/tiamed1.svg" alt="Lab Management System" width={40} height={40} className="mx-auto rounded-full" />
//                         </div> */}
//                         <h1 className="text-2xl font-semibold">Welcome! Let’s Get Started</h1>

//                         <div className="relative flex justify-between items-center gap-6 mt-6">
//                             {steps.map((item, index) => (
//                                 <div key={index} className="flex items-center w-full">
//                                     <div className="flex flex-col items-center text-center relative">
//                                         <span
//                                             className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step > index + 1 ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-primary border-gray-300'}`}
//                                         >
//                                             {item.icon}
//                                         </span>
//                                         <span className="text-xs font-medium mt-2 text-gray-700">{item.label}</span>
//                                     </div>
//                                     {index !== steps.length - 1 && (
//                                         <div
//                                             className={`flex-grow h-0 border-t-2 border-dotted -mt-4 ${step > index + 1 ? 'border-primary' : 'border-gray-300'}`}
//                                         ></div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>


//                     <div className="w-full  gap-4 border-dashed border-2 border-primary  rounded-lg">

//                         {renderStep()}

//                     </div>

//                     <div className="flex justify-between w-full">
//                         {step > 1 && (
//                             <button
//                                 onClick={prevStep}
//                                 className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-primarylight"
//                             >
//                                 <FaArrowLeft /> Back
//                             </button>
//                         )}
//                         <button
//                             onClick={step < steps.length ? nextStep : () => alert('Form submitted!')}
//                             className={`${step < steps.length ? 'bg-primary' : 'bg-success'
//                                 } text-white px-4 py-2 rounded-lg flex items-center gap-1`}
//                         >
//                             {step < steps.length ? (
//                                 <>
//                                     Next <FaArrowRight />
//                                 </>
//                             ) : (
//                                 <>
//                                     <button onClick={handleSubmitOnboarding}
//                                     type="submit" className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-primarylight">
//                                         <FaCheck /> Submit
//                                     </button>
//                                 </>
//                             )}
//                         </button>
//                     </div>

//                 </div>

//             </div>
//         </div>
//     );
// };
// export default Onboarding;



















import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page