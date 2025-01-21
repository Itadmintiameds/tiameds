// 'use client';
// import React, { useState } from 'react';
// import { FaArrowLeft, FaArrowRight, FaCheck, FaUserCircle, FaMapMarkerAlt, FaFlask, FaFileAlt } from 'react-icons/fa';
// import Header from '../components/Header';



// type RegisterData = {
//   username: string;
//   password: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   phone: string;
//   address: string;
//   city: string;
//   state: string;
//   zip: string;
//   country: string;
//   modules: number[];
//   verified: boolean;
// };

// const navigation = [{ name: '', href: '#' }];

// const Onboarding = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState<RegisterData>({
//     username: '',
//     password: '',
//     email: '',
//     firstName: '',
//     lastName: '',
//     phone: '',
//     address: '',
//     city: '',
//     state: '',
//     zip: '',
//     country: '',
//     modules: [1],
//     verified: false,
//   });

//   const nextStep = () => setStep(step + 1);
//   const prevStep = () => setStep(step - 1);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const renderStep = () => {
//     switch (step) {
//       case 1:
//         return (
//           <div>
//             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <FaUserCircle className="text-blue-500" /> Basic Information
//             </h2>
//             <div className="grid gap-4">
//               <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="input-field" />
//               <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="input-field" />
//               <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="input-field" />
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div>
//             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <FaMapMarkerAlt className="text-green-500" /> Address Information
//             </h2>
//             <div className="grid gap-4">
//               <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} className="input-field" />
//               <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className="input-field" />
//               <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleInputChange} className="input-field" />
//             </div>
//           </div>
//         );
//       case 3:
//         return (
//           <div>
//             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <FaFlask className="text-purple-500" /> Lab Information
//             </h2>
//             <div className="grid gap-4">
//               <input type="text" name="labName" placeholder="Lab Name" className="input-field" />
//               <input type="text" name="labType" placeholder="Lab Type" className="input-field" />
//             </div>
//           </div>
//         );
//       default:
//         return (
//           <div>
//             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <FaFileAlt className="text-yellow-500" /> Review & Submit
//             </h2>
//             <p>Review your details and click Submit.</p>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="relative bg-white py-24 sm:py-32">
//       <div
//         aria-hidden="true"
//         className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 animate-gradient-flow"
//       >
//         <div
//           style={{
//             clipPath:
//               'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//           }}
//           className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
//         />
//       </div>
//       <Header navigation={navigation} />
//       <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8">
//         <div className="bg-white p-8 shadow-lg rounded-lg">
//           <div className="mb-8 text-center">
//             <h1 className="text-3xl font-bold">Welcome! Let's get started</h1>
//             <div className="flex justify-center gap-4 mt-6">
//               {[1, 2, 3, 4].map((num) => (
//                 <span
//                   key={num}
//                   className={`w-8 h-8 rounded-full flex items-center justify-center border ${
//                     step >= num ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
//                   }`}
//                 >
//                   {num === step ? <FaCheck /> : num}
//                 </span>
//               ))}
//             </div>
//           </div>
//           {renderStep()}
//           <div className="flex justify-between mt-6">
//             {step > 1 && (
//               <button onClick={prevStep} className="btn btn-secondary flex items-center gap-2">
//                 <FaArrowLeft /> Previous
//               </button>
//             )}
//             {step < 4 ? (
//               <button onClick={nextStep} className="btn btn-primary flex items-center gap-2">
//                 Next <FaArrowRight />
//               </button>
//             ) : (
//               <button onClick={() => alert('Form submitted!')} className="btn btn-success flex items-center gap-2">
//                 <FaCheck /> Submit
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Onboarding;












// 'use client';
// import React, { useState } from 'react';
// import { FaArrowLeft, FaArrowRight, FaCheck, FaUserCircle, FaMapMarkerAlt, FaFlask, FaFileAlt } from 'react-icons/fa';
// import Header from '../components/Header';

// type RegisterData = {
//   username: string;
//   password: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   phone: string;
//   address: string;
//   city: string;
//   state: string;
//   zip: string;
//   country: string;
//   modules: number[];
//   verified: boolean;
// };

// const navigation = [{ name: '', href: '#' }];

// const Onboarding = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState<RegisterData>({
//     username: '',
//     password: '',
//     email: '',
//     firstName: '',
//     lastName: '',
//     phone: '',
//     address: '',
//     city: '',
//     state: '',
//     zip: '',
//     country: '',
//     modules: [1],
//     verified: false,
//   });

//   const nextStep = () => setStep(step + 1);
//   const prevStep = () => setStep(step - 1);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const steps = [
//     { icon: <FaUserCircle />, label: 'Basic Info' },
//     { icon: <FaMapMarkerAlt />, label: 'Address' },
//     { icon: <FaFlask />, label: 'Lab Info' },
//     { icon: <FaFileAlt />, label: 'Review' },
//   ];

//   const renderStep = () => {
//     switch (step) {
//       case 1:
//         return (
//           <div>
//             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <FaUserCircle className="text-primary" /> Basic Information
//             </h2>
//             <div className="grid gap-4">
//               <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="input-field" />
//               <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="input-field" />
//               <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="input-field" />
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div>
//             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <FaMapMarkerAlt className="text-primary" /> Address Information
//             </h2>
//             <div className="grid gap-4">
//               <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} className="input-field" />
//               <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className="input-field" />
//               <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleInputChange} className="input-field" />
//             </div>
//           </div>
//         );
//       case 3:
//         return (
//           <div>
//             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <FaFlask className="text-primary" /> Lab Information
//             </h2>
//             <div className="grid gap-4">
//               <input type="text" name="labName" placeholder="Lab Name" className="input-field" />
//               <input type="text" name="labType" placeholder="Lab Type" className="input-field" />
//             </div>
//           </div>
//         );
//       default:
//         return (
//           <div>
//             <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <FaFileAlt className="text-primary" /> Review & Submit
//             </h2>
//             <p>Review your details and click Submit.</p>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="relative py-16 sm:py-24">
//       <div
//         aria-hidden="true"
//         className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
//       >
//         <div
//           style={{
//             clipPath:
//               'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//           }}
//           className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
//         />
//       </div>
//       <Header navigation={navigation} />
//       <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8">
//         <div className="bg-white p-8 shadow-md rounded-md">
//           <div className="mb-6 text-center">
//             <h1 className="text-3xl font-bold">Welcome! Let’s Get Started</h1>
//             <div className="flex justify-center gap-3 mt-6">
//               {steps.map((item, index) => (
//                 <span
//                   key={index}
//                   className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
//                     step > index + 1 ? 'bg-primary text-white' : 'bg-gray-200 text-primary'
//                   }`}
//                 >
//                   {item.icon}
//                 </span>
//               ))}
//             </div>
//           </div>
//           {renderStep()}
//           <div className="flex justify-between mt-6">
//             {step > 1 && (
//               <button onClick={prevStep} className="btn btn-secondary flex items-center gap-2">
//                 <FaArrowLeft /> Back
//               </button>
//             )}
//             {step < steps.length ? (
//               <button onClick={nextStep} className="btn btn-primary flex items-center gap-2">
//                 Next <FaArrowRight />
//               </button>
//             ) : (
//               <button onClick={() => alert('Form submitted!')} className="btn btn-success flex items-center gap-2">
//                 <FaCheck /> Submit
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Onboarding;




'use client';
import React, { useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaCheck, FaUserCircle, FaMapMarkerAlt, FaFlask, FaFileAlt } from 'react-icons/fa';
import Header from '../components/Header';
import Image from 'next/image';

type RegisterData = {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  modules: number[];
  verified: boolean;
};

const navigation = [{ name: '', href: '#' }];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    modules: [1],
    verified: false,
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const steps = [
    { icon: <FaUserCircle />, label: 'Basic Info' },
    { icon: <FaMapMarkerAlt />, label: 'Address' },
    { icon: <FaFlask />, label: 'Lab Info' },
    { icon: <FaFileAlt />, label: 'Review' },
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaUserCircle className="text-primary" /> Basic Information
            </h2>
            <div className="grid gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  id="firstName"
                />
                <FaUserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <label htmlFor="firstName" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-600">First Name</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  id="lastName"
                />
                <FaUserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <label htmlFor="lastName" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-600">Last Name</label>
              </div>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  id="email"
                />
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <label htmlFor="email" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-600">Email</label>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-primary" /> Address Information
            </h2>
            <div className="grid gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  id="address"
                />
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <label htmlFor="address" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-600">Address</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  id="city"
                />
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <label htmlFor="city" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-600">City</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  id="state"
                />
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <label htmlFor="state" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-600">State</label>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaFlask className="text-primary" /> Lab Information
            </h2>
            <div className="grid gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="labName"
                  className="input-field pl-10"
                  id="labName"
                />
                <FaFlask className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <label htmlFor="labName" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-600">Lab Name</label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="labType"
                  className="input-field pl-10"
                  id="labType"
                />
                <FaFlask className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <label htmlFor="labType" className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-600">Lab Type</label>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaFileAlt className="text-primary" /> Review & Submit
            </h2>
            <p>Review your details and click Submit.</p>
          </div>
        );
    }
  };

  return (
    <div className="relative py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>
      <Header navigation={navigation} />
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8">
        <div className="bg-white p-8 shadow-md rounded-md flex flex-col items-center">
          <div className="mb-6 text-center w-full flex justify-center items-center flex-col">
            <div className="mb-4">
              <div className="w-24 h-24 rounded-full  flex items-center justify-center">
                <Image src="/tiamed1.svg" alt="Lab Management System" width={80} height={80} />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Welcome! Let’s Get Started</h1>
            <div className="flex justify-center gap-3 mt-6 w-full">
              {steps.map((item, index) => (
                <span
                  key={index}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step > index + 1 ? 'bg-primary text-white' : 'bg-gray-200 text-primary'
                  }`}
                >
                  {item.icon}
                </span>
              ))}
            </div>
            <div className="w-full mt-4 border-t border-dotted border-gray-400"></div>
          </div>

          {renderStep()}

          <div className="flex justify-between mt-6 w-full">
            {step > 1 && (
              <button onClick={prevStep} className="btn btn-secondary flex items-center gap-2">
                <FaArrowLeft /> Back
              </button>
            )}
            {step < steps.length ? (
              <button onClick={nextStep} className="text-primary flex items-center gap-2">
                Next <FaArrowRight className="text-primary" />
              </button>
            ) : (
              <button onClick={() => alert('Form submitted!')} className="btn btn-success flex items-center gap-2">
                <FaCheck /> Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
