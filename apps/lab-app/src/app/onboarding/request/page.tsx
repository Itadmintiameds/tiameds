// 'use client';

// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import { FaEnvelope, FaArrowRight, FaCheckCircle, FaSpinner } from 'react-icons/fa';
// import { requestVerificationEmail, resendVerificationEmail } from '@/../services/onboardingService';
// import Link from 'next/link';

// const RequestVerificationPage = () => {
//   const [email, setEmail] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [validationError, setValidationError] = useState('');
//   const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
//   const [blockMessage, setBlockMessage] = useState('');

//   // Check for rate limit block
//   useEffect(() => {
//     const storedBlock = localStorage.getItem('onboarding_block_until');
//     if (storedBlock) {
//       const blockTime = parseInt(storedBlock, 10);
//       if (blockTime > Date.now()) {
//         setBlockedUntil(blockTime);
//         const minutes = Math.ceil((blockTime - Date.now()) / 60000);
//         setBlockMessage(`Too many verification emails sent. Please try again after ${minutes} minutes.`);
//       } else {
//         localStorage.removeItem('onboarding_block_until');
//       }
//     }
//   }, []);

//   // Countdown timer for rate limit
//   useEffect(() => {
//     if (blockedUntil) {
//       const interval = setInterval(() => {
//         const remaining = blockedUntil - Date.now();
//         if (remaining <= 0) {
//           setBlockedUntil(null);
//           setBlockMessage('');
//           localStorage.removeItem('onboarding_block_until');
//         } else {
//           const minutes = Math.ceil(remaining / 60000);
//           setBlockMessage(`Too many verification emails sent. Please try again after ${minutes} minutes.`);
//         }
//       }, 1000);
//       return () => clearInterval(interval);
//     }
//   }, [blockedUntil]);

//   const validateEmail = (email: string): boolean => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setValidationError('');

//     if (!email.trim()) {
//       setValidationError('Email is required');
//       return;
//     }

//     if (!validateEmail(email)) {
//       setValidationError('Please enter a valid email address');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const response = await requestVerificationEmail({ email });
//       if (response.status === 'success') {
//         setIsSuccess(true);
//         toast.success('Verification email sent! Please check your inbox.', {
//           autoClose: 5000,
//           position: 'top-center',
//         });
//       }
//     } catch (error: unknown) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to send verification email';
//       const axiosError = error as { response?: { status?: number } };
      
//       // Handle rate limiting (429)
//       if (axiosError.response?.status === 429) {
//         const message = errorMessage;
//         const waitTimeMatch = message.match(/after (\d+) minutes?/i);
//         if (waitTimeMatch) {
//           const waitMinutes = parseInt(waitTimeMatch[1], 10);
//           const blockTime = Date.now() + waitMinutes * 60 * 1000;
//           setBlockedUntil(blockTime);
//           localStorage.setItem('onboarding_block_until', blockTime.toString());
//         }
//         setBlockMessage(errorMessage);
//         toast.error(errorMessage, { autoClose: 8000, position: 'top-center' });
//       } else {
//         toast.error(errorMessage, { autoClose: 5000, position: 'top-center' });
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleResend = async () => {
//     if (!email.trim() || !validateEmail(email)) {
//       setValidationError('Please enter a valid email address');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const response = await resendVerificationEmail({ email });
//       if (response.status === 'success') {
//         toast.success('Verification email resent! Please check your inbox.', {
//           autoClose: 5000,
//           position: 'top-center',
//         });
//       }
//     } catch (error: unknown) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification email';
//       const axiosError = error as { response?: { status?: number } };
      
//       if (axiosError.response?.status === 429) {
//         const message = errorMessage;
//         const waitTimeMatch = message.match(/after (\d+) minutes?/i);
//         if (waitTimeMatch) {
//           const waitMinutes = parseInt(waitTimeMatch[1], 10);
//           const blockTime = Date.now() + waitMinutes * 60 * 1000;
//           setBlockedUntil(blockTime);
//           localStorage.setItem('onboarding_block_until', blockTime.toString());
//         }
//         setBlockMessage(errorMessage);
//         toast.error(errorMessage, { autoClose: 8000, position: 'top-center' });
//       } else {
//         toast.error(errorMessage, { autoClose: 5000, position: 'top-center' });
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (isSuccess) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center px-4 py-12">
//         <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
//           <div className="mb-6 flex justify-center">
//             <div className="p-4 bg-green-100 rounded-full">
//               <FaCheckCircle className="text-5xl text-green-600" />
//             </div>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-3">Check Your Email!</h2>
//           <p className="text-gray-600 mb-2">
//             We&apos;ve sent a verification link to <strong>{email}</strong>
//           </p>
//           <p className="text-sm text-gray-500 mb-6">
//             Click the link in the email to continue with your lab registration. The link will expire in 15 minutes.
//           </p>
//           <div className="space-y-3">
//             <button
//               onClick={handleResend}
//               disabled={isSubmitting || !!blockedUntil}
//               className="w-full py-2.5 px-4 text-sm text-primary hover:text-primarylight font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {isSubmitting ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <FaSpinner className="animate-spin" /> Sending...
//                 </span>
//               ) : (
//                 'Resend Email'
//               )}
//             </button>
//             <Link
//               href="/user-login"
//               className="block w-full py-2.5 px-4 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
//             >
//               Back to Login
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center px-4 py-12">
//       <div className="max-w-md w-full">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
//             <FaEnvelope className="text-3xl text-primary" />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">Get Started</h1>
//           <p className="text-gray-600">
//             Enter your email to receive a verification link and start your lab registration
//           </p>
//         </div>

//         {/* Form Card */}
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FaEnvelope className="text-gray-400" />
//                 </div>
//                 <input
//                   type="email"
//                   id="email"
//                   value={email}
//                   onChange={(e) => {
//                     setEmail(e.target.value);
//                     setValidationError('');
//                   }}
//                   className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
//                     validationError ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   placeholder="your.email@example.com"
//                   disabled={isSubmitting || !!blockedUntil}
//                   autoFocus
//                 />
//               </div>
//               {validationError && (
//                 <p className="mt-1 text-sm text-red-600">{validationError}</p>
//               )}
//               {blockMessage && (
//                 <p className="mt-1 text-sm text-orange-600">{blockMessage}</p>
//               )}
//             </div>

//             <button
//               type="submit"
//               disabled={isSubmitting || !!blockedUntil || !email.trim()}
//               className="w-full bg-primary hover:bg-primarylight text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
//             >
//               {isSubmitting ? (
//                 <>
//                   <FaSpinner className="animate-spin" />
//                   Sending...
//                 </>
//               ) : (
//                 <>
//                   Continue
//                   <FaArrowRight />
//                 </>
//               )}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{' '}
//               <Link href="/user-login" className="text-primary hover:text-primarylight font-medium">
//                 Sign in
//               </Link>
//             </p>
//           </div>
//         </div>

//         {/* Info Box */}
//         <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <p className="text-sm text-blue-800">
//             <strong>Note:</strong> You can request up to 3 verification emails per hour. 
//             The verification link expires in 15 minutes.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RequestVerificationPage;



import React from 'rea

const page = () => {
  return (
    <div>page</div>
  )
}

export default page