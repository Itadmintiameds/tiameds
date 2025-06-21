import React from 'react';
import { FaTools, FaClock, FaEnvelope, FaLock, FaRocket, FaArrowLeft, FaHome } from 'react-icons/fa';
import { GiProgression } from 'react-icons/gi';
import Link from 'next/link';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center animate-pulse">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <FaLock className="text-indigo-600 text-5xl" />
            <FaTools className="text-yellow-500 text-xl absolute -top-2 -right-2 animate-spin" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Password Reset</h1>
        <p className="text-gray-600 mb-6">We&apos;re building something secure and amazing!</p>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
          <div className="flex items-start">
            <FaClock className="text-yellow-500 mt-1 mr-3" />
            <div>
              <p className="font-medium text-yellow-800">Feature in Development</p>
              <p className="text-yellow-700 text-sm">Our password reset functionality will be available soon.</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-2 mb-8">
          <GiProgression className="text-indigo-400 animate-bounce" />
          <span className="text-sm text-gray-500">Coming in next release</span>
          <FaRocket className="text-pink-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center mb-3">
            <FaEnvelope className="text-gray-400 mr-2" />
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              disabled
            />
          </div>
          <button 
            className="w-full bg-gray-300 text-gray-600 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
            disabled
          >
            Reset Password
          </button>
        </div>
        
        <div className="flex justify-between mt-6">
          <Link href="/user-login" className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to Login
          </Link>
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
            <FaHome className="mr-2" />
            Go Home
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          In the meantime, please contact support if you need immediate assistance.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;














// 'use client'
// import { FaLock, FaEnvelope, FaCheckCircle, FaArrowLeft, FaTools, FaRocket } from 'react-icons/fa';
// import { GiProgression } from 'react-icons/gi';
// import Link from 'next/link';
// import Image from 'next/image';
// import { useState } from 'react';
// import { toast } from 'react-toastify';

// const ForgotPasswordPage = () => {
//   const [email, setEmail] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     // Simulate API call
//     try {
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       // In a real app, you would call your password reset API here
//       // await resetPassword(email);
      
//       setIsSuccess(true);
//       toast.success('Password reset link sent to your email!', {
//         position: "top-center",
//         icon: <FaCheckCircle className="text-green-500" />
//       });
//     } catch (error) {
//       toast.error('Failed to send reset link. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
//         <div className="grid grid-cols-1 lg:grid-cols-2">
//           {/* Left Side - Visual Branding */}
//           <div className="hidden lg:block bg-indigo-600 p-12 text-white">
//             <div className="flex flex-col h-full justify-between">
//               <div>
//                 <Image 
//                   src="/tiamed1.svg" 
//                   alt="Lab Management System" 
//                   width={120} 
//                   height={120} 
//                   className="mb-8"
//                 />
//                 <h1 className="text-3xl font-bold mb-4">Secure Password Recovery</h1>
//                 <p className="text-indigo-100 text-lg mb-8">
//                   Regain access to your laboratory management account with our secure password reset process.
//                 </p>
//               </div>
              
//               <div className="space-y-4">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-indigo-500 rounded-full">
//                     <FaLock className="text-white" />
//                   </div>
//                   <span>End-to-end encrypted</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-indigo-500 rounded-full">
//                     <FaCheckCircle className="text-white" />
//                   </div>
//                   <span>HIPAA compliant process</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-indigo-500 rounded-full">
//                     <FaCheckCircle className="text-white" />
//                   </div>
//                   <span>Instant email delivery</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Side - Password Reset Form */}
//           <div className="p-8 md:p-12">
//             <div className="lg:hidden mb-8 flex justify-center">
//               <Image 
//                 src="/tiamed1.svg" 
//                 alt="Lab Management System" 
//                 width={80} 
//                 height={80} 
//               />
//             </div>
            
//             <div className="flex items-center justify-center mb-6">
//               <div className="relative">
//                 <FaLock className="text-indigo-600 text-5xl" />
//                 <FaTools className="text-yellow-500 text-xl absolute -top-2 -right-2 animate-spin" />
//               </div>
//             </div>

//             <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
//               {isSuccess ? 'Check Your Email' : 'Reset Your Password'}
//             </h2>
            
//             {isSuccess ? (
//               <div className="text-center">
//                 <p className="text-gray-600 mb-6">
//                   We've sent a password reset link to <span className="font-semibold">{email}</span>. 
//                   Please check your inbox and follow the instructions.
//                 </p>
                
//                 <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-left">
//                   <div className="flex items-start">
//                     <FaCheckCircle className="text-blue-500 mt-1 mr-3" />
//                     <div>
//                       <p className="font-medium text-blue-800">Reset Link Sent</p>
//                       <p className="text-blue-700 text-sm">
//                         The link will expire in 24 hours. If you don't see the email, check your spam folder.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="mt-8">
//                   <Link 
//                     href="/login" 
//                     className="w-full flex justify-center items-center py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-300"
//                   >
//                     Back to Login
//                   </Link>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <p className="text-gray-600 text-center mb-8">
//                   Enter your email address and we'll send you a link to reset your password.
//                 </p>
                
//                 <form onSubmit={handleSubmit} className="max-w-md mx-auto">
//                   <div className="mb-6">
//                     <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                       Email Address
//                     </label>
//                     <div className="relative">
//                       <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                       <input
//                         id="email"
//                         name="email"
//                         type="email"
//                         required
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         className="pl-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
//                         placeholder="your@email.com"
//                       />
//                     </div>
//                   </div>
                  
//                   <button
//                     type="submit"
//                     disabled={isSubmitting}
//                     className="w-full flex justify-center items-center py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-300 disabled:opacity-70"
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         Sending...
//                       </>
//                     ) : (
//                       'Send Reset Link'
//                     )}
//                   </button>
//                 </form>
                
//                 <div className="flex items-center justify-center space-x-2 mt-8">
//                   <GiProgression className="text-indigo-400 animate-bounce" />
//                   <span className="text-sm text-gray-500">Secure password recovery</span>
//                   <FaRocket className="text-pink-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
//                 </div>
                
//                 <div className="mt-6 text-center">
//                   <Link 
//                     href="/login" 
//                     className="flex items-center justify-center text-indigo-600 hover:text-indigo-800 transition-colors"
//                   >
//                     <FaArrowLeft className="mr-2" />
//                     Back to Login
//                   </Link>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPasswordPage;