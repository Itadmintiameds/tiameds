
'use client'
import { register } from '@/../services/authService';
import { z } from 'zod';
import { RegisterData } from '@/types/Register';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import {
  FaArrowRight,
  FaChevronRight,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaFlask,
  FaGlobeAmericas,
  FaHome,
  FaIdCard,
  FaLock,
  FaMapMarkerAlt,
  FaMicroscope,
  FaPhoneAlt,
  FaRegBuilding,
  FaUser,
  FaUserTie
} from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Define validation schema
const registerDataSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  email: z.string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be at most 50 characters")
    .regex(/^[a-zA-Z]+(\s[a-zA-Z]+)*$/, "First name can only contain letters and single spaces between words")
    .refine(val => val.trim().length >= 2, "First name must be at least 2 characters"),
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters")
    .regex(/^[a-zA-Z]+(\s[a-zA-Z]+)*$/, "Last name can only contain letters and single spaces between words")
    .refine(val => val.trim().length >= 2, "Last name must be at least 2 characters"),
  phone: z.string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^[0-9]{10}$/, "Phone number must contain exactly 10 digits"),
  address: z.string()
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must be at most 100 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Address can only contain letters and numbers")
    .refine(val => val.trim().length >= 5, "Address must be at least 5 characters"),
  city: z.string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be at most 50 characters")
    .regex(/^[a-zA-Z]+$/, "City can only contain letters")
    .refine(val => val.trim().length >= 2, "City must be at least 2 characters"),
  state: z.string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must be at most 50 characters")
    .regex(/^[a-zA-Z]+$/, "State can only contain letters")
    .refine(val => val.trim().length >= 2, "State must be at least 2 characters"),
  zip: z.string()
    .min(5, "ZIP code must be at least 5 characters")
    .max(6, "ZIP code must be at most 6 characters")
    .regex(/^[0-9]+$/, "ZIP code can only contain digits"),
  country: z.string()
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country must be at most 50 characters")
    .regex(/^[a-zA-Z]+$/, "Country can only contain letters")
    .refine(val => val.trim().length >= 2, "Country must be at least 2 characters"),
  verified: z.boolean().default(false)
});

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
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
    verified: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // Apply input restrictions based on field type
    if (name === 'firstName' || name === 'lastName') {
      // Only allow letters and spaces for names
      filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
      // Prevent leading spaces and multiple consecutive spaces
      filteredValue = filteredValue.replace(/^\s+/, ''); // Remove leading spaces
      filteredValue = filteredValue.replace(/\s+/g, ' '); // Replace multiple spaces with single space
    } else if (name === 'phone') {
      // Only allow digits and limit to 10 characters
      filteredValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    } else if (name === 'city' || name === 'state' || name === 'country') {
      // Only allow letters for city, state, and country
      filteredValue = value.replace(/[^a-zA-Z]/g, '');
    } else if (name === 'zip') {
      // Only allow digits for ZIP code and limit to 6 characters
      filteredValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    } else if (name === 'address') {
      // Only allow letters and numbers for address
      filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: filteredValue,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    try {
      // Validate only the fields in the current step
      const stepFields = fieldGroups[step - 1].fields.map(f => f.name);
      const stepData = Object.fromEntries(
        Object.entries(formData).filter(([key]) => stepFields.includes(key))
      );
      
      // Create a partial schema for the current step
      const stepSchema = registerDataSchema.pick(
        stepFields.reduce((acc, field) => {
          acc[field as keyof RegisterData] = true;
          return acc;
        }, {} as Record<keyof RegisterData, true>)
      );
      
      stepSchema.parse(stepData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path[0];
          if (path) {
            newErrors[path] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    try {
      registerDataSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path[0];
          if (path) {
            newErrors[path] = err.message;
          }
        });
        setErrors(newErrors);
        // Jump to the first step with errors
        for (let i = 0; i < fieldGroups.length; i++) {
          if (fieldGroups[i].fields.some(field => newErrors[field.name])) {
            setCurrentStep(i + 1);
            break;
          }
        }
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const response = await register(formData);

      if (response.status === 'success') {
        toast.success('Registration successful! Please check your email to verify your account.', { 
          autoClose: 3000,
          position: "top-center",
          onClose: () => {
            setFormData({
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
              verified: false,
            });
            setCurrentStep(1);
            window.location.href = '/user-login';
          }
        });
      } else {
        toast.error(response.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'An error occurred during registration.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const fieldGroups = [
    {
      title: "Account Information",
      fields: [
        { id: 'username', name: 'username', type: 'text', placeholder: 'Choose a username', icon: <FaUser /> },
        { id: 'email', name: 'email', type: 'email', placeholder: 'Your email address', icon: <FaEnvelope /> },
        { id: 'password', name: 'password', type: 'password', placeholder: 'Create a password', icon: <FaLock /> }
      ]
    },
    {
      title: "Personal Details",
      fields: [
        { id: 'firstName', name: 'firstName', type: 'text', placeholder: 'First name (letters only)', icon: <FaUserTie /> },
        { id: 'lastName', name: 'lastName', type: 'text', placeholder: 'Last name (letters only)', icon: <FaUserTie /> },
        { id: 'phone', name: 'phone', type: 'tel', placeholder: 'Phone number (10 digits)', icon: <FaPhoneAlt /> }
      ]
    },
    {
      title: "Address Information",
      fields: [
        { id: 'address', name: 'address', type: 'text', placeholder: 'Street address (letters & numbers only)', icon: <FaHome /> },
        { id: 'city', name: 'city', type: 'text', placeholder: 'City (letters only)', icon: <FaMapMarkerAlt /> },
        { id: 'state', name: 'state', type: 'text', placeholder: 'State (letters only)', icon: <FaRegBuilding /> },
        { id: 'zip', name: 'zip', type: 'text', placeholder: 'ZIP code (digits only)', icon: <FaIdCard /> },
        { id: 'country', name: 'country', type: 'text', placeholder: 'Country (letters only)', icon: <FaGlobeAmericas /> }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <Image 
                  src="/LOGO.svg" 
                  alt="Diagnostics" 
                  width={120} 
                  height={40} 
                  className="mr-2 transition-transform group-hover:scale-105"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-purple-600 flex items-center transition-colors duration-200 group">
                <span className="hidden sm:inline mr-1 group-hover:-translate-x-0.5 transition-transform">Home</span>
                <FaHome className="text-lg" />
              </Link>
              <Link href="/user-login" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-sm hover:shadow-md">
                <span>Login</span>
                <FaChevronRight className="text-sm" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        {/* Left Side - Compact Branding and Information */}
        <div className="lg:w-1/2 p-6 lg:p-8 text-white flex flex-col gap-8 bg-gradient-to-br from-purple-600 to-purple-800">
          <div className="">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-xl font-bold tracking-tight text-purple-100">Diagnostics Platform</h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold leading-tight text-white">
                Professional Healthcare Network
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-purple-100 text-sm">
                  <FaFlask className="text-lg text-purple-200" />
                  <span>Advanced Lab Tools</span>
                </div>
                <div className="flex items-center space-x-3 text-purple-100 text-sm">
                  <FaMicroscope className="text-lg text-purple-200" />
                  <span>Precision Diagnostics</span>
                </div>
              </div>
              
              <div className="bg-purple-700/30 p-3 rounded-lg border border-purple-500/20 text-sm">
                <h3 className="font-medium mb-2 text-white">Why register with us?</h3>
                <ul className="space-y-2 text-purple-100">
                  <li className="flex items-start">
                    <span className="text-purple-200 mr-2">✓</span>
                    <span>Role based access control</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-200 mr-2">✓</span>
                    <span>Real-time diagnostic results</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-200 mr-2">✓</span>
                    <span>Integrated patient management</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4"
          >
            {[1, 2, 3].map((step) => (
              <motion.div 
                key={step} 
                whileHover={{ scale: 1.01 }}
                className={`flex items-start space-x-3 p-2 rounded-lg transition-all duration-300 ${currentStep === step ? 'bg-purple-700/40' : 'bg-purple-800/20 hover:bg-purple-800/30'}`}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep === step ? 'bg-white text-purple-700' : 'bg-purple-500/70 text-white'}`}>
                    {step}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-white">{fieldGroups[step-1].title}</h4>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="lg:w-2/3 bg-white p-8 sm:p-12 lg:p-16 overflow-y-auto">
          <div className="max-w-md mx-auto">
            <div className="lg:hidden mb-8">
              <div className="flex items-center justify-center">
                <h1 className="text-2xl font-bold text-purple-700">Diagnostics Platform</h1>
              </div>
            </div>
            
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-10"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Create Your Account</h2>
              <p className="text-gray-600">
                Already registered?{' '}
                <Link href="/user-login" className="text-purple-600 font-medium hover:text-purple-700 transition-colors underline underline-offset-4">
                  Sign in to your account
                </Link>
              </p>
            </motion.div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step Indicator */}
              <div className="flex justify-between mb-8 px-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex flex-col items-center relative">
                    {step > 1 && (
                      <div className="absolute h-0.5 bg-gray-200 w-full top-5 -left-1/2 -z-10">
                        <div 
                          className={`h-full ${currentStep >= step ? 'bg-purple-600' : 'bg-gray-200'} transition-all duration-300`}
                          style={{ width: currentStep >= step ? '100%' : '0%' }}
                        ></div>
                      </div>
                    )}
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep === step ? 'bg-purple-600 text-white shadow-md' : currentStep > step ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}
                    >
                      {step}
                    </div>
                    <span className="text-xs mt-2 text-gray-500 font-medium">
                      {fieldGroups[step-1].title.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Current Step Content */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
                    {currentStep}
                  </span>
                  {fieldGroups[currentStep-1].title}
                </h3>
                
                <div className="space-y-4">
                  {fieldGroups[currentStep-1].fields.map((field) => (
                    <motion.div 
                      key={field.id} 
                      whileHover={{ scale: 1.005 }}
                      className="space-y-1"
                    >
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          {field.icon}
                        </div>
                        <input
                          id={field.id}
                          name={field.name}
                          type={field.name === 'password' ? (showPassword ? 'text' : 'password') : field.type}
                          required
                          placeholder={field.placeholder}
                          value={formData[field.name as keyof RegisterData] as string}
                          onChange={handleInputChange}
                          {...(field.name === 'phone' && { maxLength: 10 })}
                          {...(field.name === 'phone' && { pattern: '[0-9]{10}' })}
                          {...((field.name === 'firstName' || field.name === 'lastName') && { pattern: '[a-zA-Z]+(\\s[a-zA-Z]+)*' })}
                          {...(field.name === 'zip' && { maxLength: 6 })}
                          {...(field.name === 'zip' && { pattern: '[0-9]+' })}
                          {...((field.name === 'city' || field.name === 'state' || field.name === 'country') && { pattern: '[a-zA-Z]+' })}
                          {...(field.name === 'address' && { pattern: '[a-zA-Z0-9]+' })}
                          className={`block w-full rounded-lg ${errors[field.name] ? 'border-red-500' : 'border-gray-300'} ${field.name === 'password' ? 'pr-12' : 'pr-4'} pl-10 py-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:shadow-sm border`}
                        />
                        {field.name === 'password' && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          >
                            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                          </button>
                        )}
                      </div>
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1 pl-2">{errors[field.name]}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {currentStep > 1 ? (
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ x: -2 }}
                    className="px-6 py-3 text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center border border-gray-200 hover:border-purple-200"
                  >
                    <FaArrowRight className="transform rotate-180 mr-2" />
                    Back
                  </motion.button>
                ) : (
                  <div></div>
                )}
                
                {currentStep < 3 ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                  >
                    Continue
                    <FaArrowRight className="ml-2" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    className="px-3 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <FiLoader className="animate-spin mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </motion.button>
                )}
              </div>
            </form>
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-xs text-gray-500 text-center">
                By registering, you agree to our{' '}
                <Link href="/terms" className="text-purple-600 hover:underline font-medium">Terms of Service</Link> and{' '}
                <Link href="/privacy" className="text-purple-600 hover:underline font-medium">Privacy Policy</Link>.
                <br/>Your data is protected with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;