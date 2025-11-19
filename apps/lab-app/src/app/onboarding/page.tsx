'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  FaUser, FaLock, FaPhone, FaMapMarkerAlt, FaBuilding,
  FaUserTie, FaCheckCircle, FaArrowRight, FaArrowLeft,
  FaSpinner, FaFlask, FaShieldAlt, FaTimes, FaClipboardCheck
} from 'react-icons/fa';
import { completeOnboarding } from '@/../services/onboardingService';
import { OnboardingRequestDTO } from '@/types/onboarding/onboarding';
import Link from 'next/link';

const OnboardingContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [formData, setFormData] = useState<OnboardingRequestDTO>({
    token: '',
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    lab: {
      name: '',
      address: '',
      city: '',
      state: '',
      description: '',
      licenseNumber: '',
      labType: '',
      labZip: '',
      labCountry: '',
      labPhone: '',
      labEmail: '',
      directorName: '',
      directorEmail: '',
      directorPhone: '',
      certificationBody: '',
      labCertificate: '',
      directorGovtId: '',
      labBusinessRegistration: '',
      labLicense: '',
      taxId: '',
      labAccreditation: '',
      dataPrivacyAgreement: false,
    },
  });

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (token && email) {
      setFormData(prev => ({ ...prev, token, email }));
    } else if (!token && !email) {
      // No token/email - redirect to request page
      router.push('/onboarding/request');
    } else {
      // Missing one of token or email
      toast.error('Invalid onboarding link. Please request a new verification email.', {
        autoClose: 5000,
      });
      router.push('/onboarding/request');
    }
  }, [searchParams, router]);

  // Validation helper functions
  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) return 'Phone number is required';
    // Remove spaces, dashes, and plus signs for validation
    const cleaned = phone.replace(/[\s\-+]/g, '');
    if (!/^\d+$/.test(cleaned)) return 'Phone number must contain only digits';
    if (cleaned.length !== 10) return 'Phone number must be exactly 10 digits';
    return null;
  };

  const validateZip = (zip: string): string | null => {
    if (!zip.trim()) return 'ZIP code is required';
    if (!/^\d+$/.test(zip)) return 'ZIP code must contain only numbers';
    if (zip.length > 6) return 'ZIP code must not exceed 6 digits';
    if (zip.length < 4) return 'ZIP code must be at least 4 digits';
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validateUsername = (username: string): string | null => {
    if (!username.trim()) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 30) return 'Username must not exceed 30 characters';
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return 'Username can only contain letters and numbers (no spaces or special characters)';
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password.length > 50) return 'Password must not exceed 50 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return null;
  };

  const validateName = (name: string, fieldName: string): string | null => {
    if (!name.trim()) return `${fieldName} is required`;
    if (name.length < 2) return `${fieldName} must be at least 2 characters`;
    if (name.length > 50) return `${fieldName} must not exceed 50 characters`;
    if (!/^[a-zA-Z\s'-]+$/.test(name)) return `${fieldName} can only contain alphabetic characters, spaces, hyphens, and apostrophes (no numbers)`;
    return null;
  };

  const validateLicenseNumber = (license: string): string | null => {
    if (!license.trim()) return 'License number is required';
    if (license.length < 5) return 'License number must be at least 5 characters';
    if (license.length > 20) return 'License number must not exceed 20 characters';
    if (!/^[a-zA-Z]+$/.test(license)) return 'License number can only contain alphabetic characters (letters only, no numbers or special characters)';
    return null;
  };

  const validateAlphaNumericField = (
    value: string,
    fieldName: string,
    minLength = 3,
    maxLength = 50
  ): string | null => {
    if (!value.trim()) return `${fieldName} is required`;
    if (value.length < minLength) return `${fieldName} must be at least ${minLength} characters`;
    if (value.length > maxLength) return `${fieldName} must not exceed ${maxLength} characters`;
    if (!/^[a-zA-Z0-9-]+$/.test(value)) {
      return `${fieldName} can only contain alphabetic characters, numbers, or hyphens`;
    }
    return null;
  };

  const validateNumericField = (
    value: string,
    fieldName: string,
    minLength = 4,
    maxLength = 15
  ): string | null => {
    if (!value.trim()) return `${fieldName} is required`;
    if (!/^\d+$/.test(value)) return `${fieldName} must contain only digits`;
    if (value.length < minLength) return `${fieldName} must be at least ${minLength} digits`;
    if (value.length > maxLength) return `${fieldName} must not exceed ${maxLength} digits`;
    return null;
  };

  // Get field names for a specific step (used for clearing errors)
  const getStepFields = (step: number): string[] => {
    if (step === 1) {
      return ['username', 'password', 'firstName', 'lastName', 'phone'];
    }
    if (step === 2) {
      return ['address', 'city', 'state', 'zip', 'country'];
    }
    if (step === 3) {
      return [
        'lab.name',
        'lab.address',
        'lab.city',
        'lab.state',
        'lab.licenseNumber',
        'lab.labType',
        'lab.labZip',
        'lab.labCountry',
        'lab.labPhone',
        'lab.labEmail',
        'lab.directorName',
        'lab.directorEmail',
        'lab.directorPhone',
        'lab.certificationBody',
        'lab.labCertificate',
        'lab.directorGovtId',
        'lab.labBusinessRegistration',
        'lab.labLicense',
        'lab.taxId',
        'lab.labAccreditation',
        'lab.dataPrivacyAgreement',
      ];
    }
    return [];
  };

  // Clear errors for a specific step
  const clearStepErrors = (step: number) => {
    const stepFields = getStepFields(step);
    setErrors(prev => {
      const newErrors = { ...prev };
      stepFields.forEach(field => {
        delete newErrors[field];
      });
      return newErrors;
    });
  };

  // Validate a specific step and set errors only for that step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = { ...errors }; // Keep existing errors from other steps

    // Clear errors for the step being validated
    const stepFields = getStepFields(step);
    stepFields.forEach(field => {
      delete newErrors[field];
    });

    // Validate step 1 fields
    if (step === 1) {
      const usernameError = validateUsername(formData.username);
      if (usernameError) newErrors.username = usernameError;

      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;

      const firstNameError = validateName(formData.firstName, 'First name');
      if (firstNameError) newErrors.firstName = firstNameError;

      const lastNameError = validateName(formData.lastName, 'Last name');
      if (lastNameError) newErrors.lastName = lastNameError;

      const phoneError = validatePhone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    // Validate step 2 fields
    if (step === 2) {
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      } else if (formData.address.length < 5) {
        newErrors.address = 'Address must be at least 5 characters';
      } else if (formData.address.length > 200) {
        newErrors.address = 'Address must not exceed 200 characters';
      }

      const cityError = validateName(formData.city, 'City');
      if (cityError) newErrors.city = cityError;

      const stateError = validateName(formData.state, 'State');
      if (stateError) newErrors.state = stateError;

      const zipError = validateZip(formData.zip);
      if (zipError) newErrors.zip = zipError;

      if (!formData.country.trim()) {
        newErrors.country = 'Country is required';
      } else if (formData.country.length < 2) {
        newErrors.country = 'Country must be at least 2 characters';
      } else if (formData.country.length > 50) {
        newErrors.country = 'Country must not exceed 50 characters';
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.country)) {
        newErrors.country = 'Country can only contain alphabetic characters, spaces, hyphens, and apostrophes (no numbers)';
      }
    }

    // Validate step 3 fields
    if (step === 3) {
      // Lab name
      if (!formData.lab.name.trim()) {
        newErrors['lab.name'] = 'Lab name is required';
      } else if (formData.lab.name.length < 3) {
        newErrors['lab.name'] = 'Lab name must be at least 3 characters';
      } else if (formData.lab.name.length > 100) {
        newErrors['lab.name'] = 'Lab name must not exceed 100 characters';
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lab.name)) {
        newErrors['lab.name'] = 'Lab name can only contain alphabetic characters, spaces, hyphens, and apostrophes (no numbers)';
      }

      // Lab address
      if (!formData.lab.address.trim()) {
        newErrors['lab.address'] = 'Lab address is required';
      } else if (formData.lab.address.length < 5) {
        newErrors['lab.address'] = 'Lab address must be at least 5 characters';
      } else if (formData.lab.address.length > 200) {
        newErrors['lab.address'] = 'Lab address must not exceed 200 characters';
      }

      // Lab city
      const labCityError = validateName(formData.lab.city, 'Lab city');
      if (labCityError) newErrors['lab.city'] = labCityError;

      // Lab state
      const labStateError = validateName(formData.lab.state, 'Lab state');
      if (labStateError) newErrors['lab.state'] = labStateError;

      // Lab ZIP
      const labZipError = validateZip(formData.lab.labZip);
      if (labZipError) newErrors['lab.labZip'] = labZipError;

      // Lab country
      if (!formData.lab.labCountry.trim()) {
        newErrors['lab.labCountry'] = 'Lab country is required';
      } else if (formData.lab.labCountry.length < 2) {
        newErrors['lab.labCountry'] = 'Lab country must be at least 2 characters';
      } else if (formData.lab.labCountry.length > 50) {
        newErrors['lab.labCountry'] = 'Lab country must not exceed 50 characters';
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lab.labCountry)) {
        newErrors['lab.labCountry'] = 'Lab country can only contain alphabetic characters, spaces, hyphens, and apostrophes (no numbers)';
      }

      // License number
      const licenseError = validateLicenseNumber(formData.lab.licenseNumber);
      if (licenseError) newErrors['lab.licenseNumber'] = licenseError;

      // Lab type
      if (!formData.lab.labType.trim()) {
        newErrors['lab.labType'] = 'Lab type is required';
      }

      // Certification body
      const certificationBodyError = validateName(formData.lab.certificationBody, 'Certification body');
      if (certificationBodyError) newErrors['lab.certificationBody'] = certificationBodyError;

      // Lab certificate
      const labCertificateError = validateAlphaNumericField(formData.lab.labCertificate, 'Lab certificate ID', 3, 50);
      if (labCertificateError) newErrors['lab.labCertificate'] = labCertificateError;

      // Lab license ID
      const labLicenseIdError = validateAlphaNumericField(formData.lab.labLicense, 'Lab license ID', 3, 50);
      if (labLicenseIdError) newErrors['lab.labLicense'] = labLicenseIdError;

      // Lab accreditation
      const labAccreditationError = validateName(formData.lab.labAccreditation, 'Lab accreditation');
      if (labAccreditationError) newErrors['lab.labAccreditation'] = labAccreditationError;

      // Business registration
      const businessRegistrationError = validateAlphaNumericField(formData.lab.labBusinessRegistration, 'Business registration ID', 3, 50);
      if (businessRegistrationError) newErrors['lab.labBusinessRegistration'] = businessRegistrationError;

      // Tax ID
      const taxIdError = validateNumericField(formData.lab.taxId, 'Tax ID', 9, 15);
      if (taxIdError) newErrors['lab.taxId'] = taxIdError;

      // Director Govt ID
      const directorGovtIdError = validateAlphaNumericField(formData.lab.directorGovtId, 'Director government ID', 5, 50);
      if (directorGovtIdError) newErrors['lab.directorGovtId'] = directorGovtIdError;

      // Lab phone
      const labPhoneError = validatePhone(formData.lab.labPhone);
      if (labPhoneError) newErrors['lab.labPhone'] = labPhoneError;

      // Lab email
      const labEmailError = validateEmail(formData.lab.labEmail);
      if (labEmailError) newErrors['lab.labEmail'] = labEmailError;

      // Director name
      const directorNameError = validateName(formData.lab.directorName, 'Director name');
      if (directorNameError) newErrors['lab.directorName'] = directorNameError;

      // Director email
      const directorEmailError = validateEmail(formData.lab.directorEmail);
      if (directorEmailError) newErrors['lab.directorEmail'] = directorEmailError;

      // Director phone
      const directorPhoneError = validatePhone(formData.lab.directorPhone);
      if (directorPhoneError) newErrors['lab.directorPhone'] = directorPhoneError;

      // Data privacy agreement
      if (!formData.lab.dataPrivacyAgreement) {
        newErrors['lab.dataPrivacyAgreement'] = 'You must agree to the data privacy terms';
      }
    }

    setErrors(newErrors);
    // Check if there are any errors for the current step
    const hasStepErrors = stepFields.some(field => newErrors[field]);
    return !hasStepErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Handle phone number input - only allow digits, max 10 digits
    if (name === 'phone' || name === 'lab.labPhone' || name === 'lab.directorPhone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      if (name.startsWith('lab.')) {
        const field = name.replace('lab.', '') as keyof typeof formData.lab;
        setFormData(prev => ({
          ...prev,
          lab: {
            ...prev.lab,
            [field]: digitsOnly,
          },
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: digitsOnly,
        }));
      }
    }
    // Handle ZIP code input - only allow digits, max 6 digits
    else if (name === 'zip' || name === 'lab.labZip') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      if (name.startsWith('lab.')) {
        const field = name.replace('lab.', '') as keyof typeof formData.lab;
        setFormData(prev => ({
          ...prev,
          lab: {
            ...prev.lab,
            [field]: digitsOnly,
          },
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: digitsOnly,
        }));
      }
    }
    // Handle license number - alphabetic only, max 20 characters
    else if (name === 'lab.licenseNumber') {
      const alphabeticOnly = value.replace(/[^a-zA-Z]/g, '').slice(0, 20);
      const field = name.replace('lab.', '') as keyof typeof formData.lab;
      setFormData(prev => ({
        ...prev,
        lab: {
          ...prev.lab,
          [field]: alphabeticOnly,
        },
      }));
    }
    // Handle alphanumeric compliance fields with hyphen support
    else if (
      name === 'lab.labCertificate' ||
      name === 'lab.directorGovtId' ||
      name === 'lab.labBusinessRegistration' ||
      name === 'lab.labLicense'
    ) {
      const alphanumericValue = value.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 50);
      const field = name.replace('lab.', '') as keyof typeof formData.lab;
      setFormData(prev => ({
        ...prev,
        lab: {
          ...prev.lab,
          [field]: alphanumericValue,
        },
      }));
    }
    // Handle tax ID - digits only up to 15
    else if (name === 'lab.taxId') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 15);
      const field = name.replace('lab.', '') as keyof typeof formData.lab;
      setFormData(prev => ({
        ...prev,
        lab: {
          ...prev.lab,
          [field]: digitsOnly,
        },
      }));
    }
    // Handle username - alphabetic only, max 30 characters
    else if (name === 'username') {
      const usernameValue = value.replace(/[^a-zA-Z]/g, '').slice(0, 30);
      setFormData(prev => ({
        ...prev,
        [name]: usernameValue,
      }));
    }
    // Handle name fields - alphabetic only (firstName, lastName, city, state, country, lab.name, lab.city, lab.state, lab.labCountry, lab.directorName)
    else if (name === 'firstName' || name === 'lastName' || name === 'city' || name === 'state' || name === 'country' ||
             name === 'lab.name' || name === 'lab.city' || name === 'lab.state' || name === 'lab.labCountry' || name === 'lab.directorName' ||
             name === 'lab.certificationBody' || name === 'lab.labAccreditation') {
      // Allow letters, spaces, hyphens, and apostrophes only (no numbers)
      const alphabeticValue = value.replace(/[^a-zA-Z\s'-]/g, '');
      if (name.startsWith('lab.')) {
        const field = name.replace('lab.', '') as keyof typeof formData.lab;
        setFormData(prev => ({
          ...prev,
          lab: {
            ...prev.lab,
            [field]: alphabeticValue,
          },
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: alphabeticValue,
        }));
      }
    }
    // Handle other fields normally
    else {
    if (name.startsWith('lab.')) {
      const field = name.replace('lab.', '') as keyof typeof formData.lab;
      setFormData(prev => ({
        ...prev,
        lab: {
          ...prev.lab,
          [field]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
      }
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Navigate to next step - validates current step first
  const nextStep = (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent any form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Validate current step before proceeding
    if (validateStep(currentStep)) {
      const nextStepNum = Math.min(currentStep + 1, 4);
      // Clear errors for the step we're navigating to
      if (nextStepNum < 4) {
        clearStepErrors(nextStepNum);
      }
      setCurrentStep(nextStepNum);
    }
  };

  // Navigate to previous step - no validation, just clear errors for that step
  const prevStep = () => {
    const prevStepNum = Math.max(currentStep - 1, 1);
    // Clear errors for the step we're navigating to
    clearStepErrors(prevStepNum);
    setCurrentStep(prevStepNum);
  };

  // Final submission - validates all steps and submits
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow submission on step 4 (Review)
    if (currentStep !== 4) {
      return;
    }
    
    // Validate all steps before submitting
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);
    
    if (!step1Valid || !step2Valid || !step3Valid) {
      toast.error('Please fix all errors before submitting', { autoClose: 3000 });
      // Navigate to the first step with errors
      if (!step1Valid) setCurrentStep(1);
      else if (!step2Valid) setCurrentStep(2);
      else if (!step3Valid) setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await completeOnboarding(formData);
      if (response.status === 'success') {
        toast.success('Onboarding completed successfully! Redirecting to login...', {
          autoClose: 3000,
          position: 'top-center',
        });
        setTimeout(() => {
          router.push('/user-login');
        }, 2000);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to complete onboarding. Please try again.';
      toast.error(message, {
        autoClose: 5000,
        position: 'top-center',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: FaUser },
    { number: 2, title: 'Address', icon: FaMapMarkerAlt },
    { number: 3, title: 'Lab Details', icon: FaFlask },
    { number: 4, title: 'Review', icon: FaClipboardCheck },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <FaFlask className="text-3xl text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Registration</h1>
          <p className="text-gray-600">Fill in your details to set up your lab account</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                      currentStep >= step.number
                        ? 'bg-primary border-primary text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <FaCheckCircle className="text-xl" />
                    ) : (
                      <step.icon className="text-xl" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className={`text-sm font-medium ${currentStep >= step.number ? 'text-gray-800' : 'text-gray-400'}`}>
                      Step {step.number}
                    </div>
                    <div className={`text-xs ${currentStep >= step.number ? 'text-gray-600' : 'text-gray-400'}`}>
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-all ${
                      currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaUser className="text-primary" />
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      maxLength={30}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="johndoe (3-30 characters)"
                    />
                    {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="At least 8 characters"
                      />
                      <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={10}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter 10 digit phone number"
                      />
                      <FaPhone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      maxLength={50}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      maxLength={50}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary" />
                  Address Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      maxLength={200}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123 Main Street"
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        maxLength={50}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter city"
                      />
                      {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        maxLength={50}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter state"
                      />
                      {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        maxLength={6}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.zip ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter ZIP code (4-6 digits)"
                      />
                      {errors.zip && <p className="mt-1 text-sm text-red-600">{errors.zip}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        maxLength={50}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.country ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter country"
                      />
                      {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Lab Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaBuilding className="text-primary" />
                  Lab Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lab Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lab.name"
                      value={formData.lab.name}
                      onChange={handleChange}
                      maxLength={100}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors['lab.name'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="ABC Medical Laboratory"
                    />
                    {errors['lab.name'] && <p className="mt-1 text-sm text-red-600">{errors['lab.name']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lab Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lab.address"
                      value={formData.lab.address}
                      onChange={handleChange}
                      maxLength={200}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors['lab.address'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter lab address"
                    />
                    {errors['lab.address'] && <p className="mt-1 text-sm text-red-600">{errors['lab.address']}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lab.city"
                        value={formData.lab.city}
                        onChange={handleChange}
                        maxLength={50}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.city'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter lab city"
                      />
                      {errors['lab.city'] && <p className="mt-1 text-sm text-red-600">{errors['lab.city']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lab.state"
                        value={formData.lab.state}
                        onChange={handleChange}
                        maxLength={50}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.state'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter lab state"
                      />
                      {errors['lab.state'] && <p className="mt-1 text-sm text-red-600">{errors['lab.state']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab ZIP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lab.labZip"
                        value={formData.lab.labZip}
                        onChange={handleChange}
                        maxLength={6}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.labZip'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter ZIP code (4-6 digits)"
                      />
                      {errors['lab.labZip'] && <p className="mt-1 text-sm text-red-600">{errors['lab.labZip']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lab.labCountry"
                        value={formData.lab.labCountry}
                        onChange={handleChange}
                        maxLength={50}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.labCountry'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter lab country"
                      />
                      {errors['lab.labCountry'] && <p className="mt-1 text-sm text-red-600">{errors['lab.labCountry']}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lab.licenseNumber"
                        value={formData.lab.licenseNumber}
                        onChange={handleChange}
                        maxLength={20}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.licenseNumber'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter license number"
                      />
                      {errors['lab.licenseNumber'] && <p className="mt-1 text-sm text-red-600">{errors['lab.licenseNumber']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="lab.labType"
                        value={formData.lab.labType}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.labType'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select lab type</option>
                        <option value="Clinical">Clinical</option>
                        <option value="Research">Research</option>
                        <option value="Diagnostic">Diagnostic</option>
                        <option value="Pathology">Pathology</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors['lab.labType'] && <p className="mt-1 text-sm text-red-600">{errors['lab.labType']}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certification Body <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lab.certificationBody"
                        value={formData.lab.certificationBody}
                        onChange={handleChange}
                        maxLength={100}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.certificationBody'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., CAP, CLIA"
                      />
                      {errors['lab.certificationBody'] && <p className="mt-1 text-sm text-red-600">{errors['lab.certificationBody']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab Certificate ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lab.labCertificate"
                        value={formData.lab.labCertificate}
                        onChange={handleChange}
                        maxLength={50}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.labCertificate'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter certificate ID"
                      />
                      {errors['lab.labCertificate'] && <p className="mt-1 text-sm text-red-600">{errors['lab.labCertificate']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab License ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lab.labLicense"
                        value={formData.lab.labLicense}
                        onChange={handleChange}
                        maxLength={50}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.labLicense'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter lab license"
                      />
                      {errors['lab.labLicense'] && <p className="mt-1 text-sm text-red-600">{errors['lab.labLicense']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab Accreditation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lab.labAccreditation"
                        value={formData.lab.labAccreditation}
                        onChange={handleChange}
                        maxLength={100}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.labAccreditation'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., ISO 15189"
                      />
                      {errors['lab.labAccreditation'] && <p className="mt-1 text-sm text-red-600">{errors['lab.labAccreditation']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Registration <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lab.labBusinessRegistration"
                        value={formData.lab.labBusinessRegistration}
                        onChange={handleChange}
                        maxLength={50}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.labBusinessRegistration'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter registration ID"
                      />
                      {errors['lab.labBusinessRegistration'] && <p className="mt-1 text-sm text-red-600">{errors['lab.labBusinessRegistration']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lab.taxId"
                        value={formData.lab.taxId}
                        onChange={handleChange}
                        maxLength={15}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.taxId'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter tax ID"
                      />
                      {errors['lab.taxId'] && <p className="mt-1 text-sm text-red-600">{errors['lab.taxId']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Director Government ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lab.directorGovtId"
                        value={formData.lab.directorGovtId}
                        onChange={handleChange}
                        maxLength={50}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.directorGovtId'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter government ID"
                      />
                      {errors['lab.directorGovtId'] && <p className="mt-1 text-sm text-red-600">{errors['lab.directorGovtId']}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="lab.labPhone"
                        value={formData.lab.labPhone}
                        onChange={handleChange}
                        maxLength={10}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.labPhone'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter 10 digit phone number"
                      />
                      {errors['lab.labPhone'] && <p className="mt-1 text-sm text-red-600">{errors['lab.labPhone']}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="lab.labEmail"
                        value={formData.lab.labEmail}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.labEmail'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter lab email"
                      />
                      {errors['lab.labEmail'] && <p className="mt-1 text-sm text-red-600">{errors['lab.labEmail']}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="lab.description"
                      value={formData.lab.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Brief description of your lab"
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaUserTie className="text-primary" />
                      Lab Director Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Director Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lab.directorName"
                          value={formData.lab.directorName}
                          onChange={handleChange}
                          maxLength={50}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors['lab.directorName'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Dr. John Doe"
                        />
                        {errors['lab.directorName'] && <p className="mt-1 text-sm text-red-600">{errors['lab.directorName']}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Director Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="lab.directorEmail"
                          value={formData.lab.directorEmail}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors['lab.directorEmail'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="director@lab.com"
                        />
                        {errors['lab.directorEmail'] && <p className="mt-1 text-sm text-red-600">{errors['lab.directorEmail']}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Director Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="lab.directorPhone"
                          value={formData.lab.directorPhone}
                          onChange={handleChange}
                          maxLength={10}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors['lab.directorPhone'] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter 10 digit phone number"
                        />
                        {errors['lab.directorPhone'] && <p className="mt-1 text-sm text-red-600">{errors['lab.directorPhone']}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="lab.dataPrivacyAgreement"
                        id="dataPrivacyAgreement"
                        checked={formData.lab.dataPrivacyAgreement}
                        onChange={handleChange}
                        className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="dataPrivacyAgreement" className="text-sm text-gray-700 flex items-start gap-2">
                        <FaShieldAlt className="text-primary mt-0.5" />
                        <span>
                          I agree to the{' '}
                          <button
                            type="button"
                            onClick={() => setShowPrivacyModal(true)}
                            className="text-primary hover:text-primarylight underline font-medium"
                          >
                            data privacy terms and conditions
                          </button>
                          {' '}<span className="text-red-500">*</span>
                        </span>
                      </label>
                    </div>
                    {errors['lab.dataPrivacyAgreement'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['lab.dataPrivacyAgreement']}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaClipboardCheck className="text-primary" />
                  Review Your Information
                </h2>
                <p className="text-gray-600 mb-6">Please review all your information before submitting. You can go back to edit any section if needed.</p>
                
                <div className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaUser className="text-primary" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Username</p>
                        <p className="text-base font-medium text-gray-800">{formData.username || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="text-base font-medium text-gray-800">{formData.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">First Name</p>
                        <p className="text-base font-medium text-gray-800">{formData.firstName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Last Name</p>
                        <p className="text-base font-medium text-gray-800">{formData.lastName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Phone</p>
                        <p className="text-base font-medium text-gray-800">{formData.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Password</p>
                        <p className="text-base font-medium text-gray-800">••••••••</p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information Section */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-primary" />
                      Address Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Address</p>
                        <p className="text-base font-medium text-gray-800">{formData.address || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">City</p>
                        <p className="text-base font-medium text-gray-800">{formData.city || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">State</p>
                        <p className="text-base font-medium text-gray-800">{formData.state || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">ZIP Code</p>
                        <p className="text-base font-medium text-gray-800">{formData.zip || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Country</p>
                        <p className="text-base font-medium text-gray-800">{formData.country || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Lab Information Section */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaBuilding className="text-primary" />
                      Lab Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Lab Name</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.name || 'N/A'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Lab Address</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.address || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Lab City</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.city || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Lab State</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.state || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Lab ZIP</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.labZip || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Lab Country</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.labCountry || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">License Number</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.licenseNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Lab Type</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.labType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Lab Phone</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.labPhone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Lab Email</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.labEmail || 'N/A'}</p>
                      </div>
                      {formData.lab.description && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600 mb-1">Description</p>
                          <p className="text-base font-medium text-gray-800">{formData.lab.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Compliance Information Section */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaShieldAlt className="text-primary" />
                      Regulatory & Compliance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Certification Body</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.certificationBody || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Lab Certificate ID</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.labCertificate || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Lab License ID</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.labLicense || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Lab Accreditation</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.labAccreditation || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Business Registration</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.labBusinessRegistration || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tax ID</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.taxId || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Director Government ID</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.directorGovtId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Lab Director Information Section */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaUserTie className="text-primary" />
                      Lab Director Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Director Name</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.directorName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Director Email</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.directorEmail || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Director Phone</p>
                        <p className="text-base font-medium text-gray-800">{formData.lab.directorPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Data Privacy Agreement */}
                  <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <FaShieldAlt className="text-primary mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 mb-1">Data Privacy Agreement</p>
                        <p className="text-sm text-gray-600">
                          {formData.lab.dataPrivacyAgreement ? (
                            <span className="text-green-600 font-medium">✓ Agreed to data privacy terms and conditions</span>
                          ) : (
                            <span className="text-red-600 font-medium">✗ Not agreed</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FaArrowLeft />
                {currentStep === 4 ? 'Back to Edit' : 'Previous'}
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={(e) => nextStep(e)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primarylight text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Next
                  <FaArrowRight />
                </button>
              ) : currentStep === 3 ? (
                <button
                  type="button"
                  onClick={(e) => nextStep(e)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primarylight text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Review
                  <FaArrowRight />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primarylight text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <FaCheckCircle />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/user-login" className="text-primary hover:text-primarylight font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Data Privacy Agreement Modal */}
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FaShieldAlt className="text-2xl text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Data Privacy Agreement</h2>
                    <p className="text-sm text-gray-600">Hospital Information Management System (HIMS)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="prose max-w-none">
                  <section>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">1. Introduction</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      This Data Privacy Agreement (&quot;Agreement&quot;) governs the collection, use, storage, and protection 
                      of personal and health information within the Hospital Information Management System (HIMS) 
                      provided by TiaMeds. By using this system, you agree to comply with all applicable data 
                      protection laws and regulations, including but not limited to HIPAA, GDPR, and local 
                      healthcare data protection standards.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">2. Information We Collect</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      The HIMS system collects and processes the following types of information:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Patient demographic information (name, date of birth, contact details)</li>
                      <li>Medical records, test results, and diagnostic reports</li>
                      <li>Laboratory and clinical data</li>
                      <li>Healthcare provider information</li>
                      <li>System usage logs and audit trails</li>
                      <li>Billing and financial information</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">3. How We Use Your Information</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      We use the collected information for the following purposes:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Providing healthcare services and managing patient care</li>
                      <li>Processing laboratory tests and generating reports</li>
                      <li>Managing appointments and scheduling</li>
                      <li>Billing and payment processing</li>
                      <li>Compliance with legal and regulatory requirements</li>
                      <li>Improving system functionality and user experience</li>
                      <li>Conducting research and analytics (with appropriate anonymization)</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">4. Data Security Measures</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      We implement comprehensive security measures to protect your data:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>End-to-end encryption for data transmission</li>
                      <li>Secure data storage with access controls</li>
                      <li>Regular security audits and vulnerability assessments</li>
                      <li>Role-based access control (RBAC) for system users</li>
                      <li>Multi-factor authentication (MFA) for sensitive operations</li>
                      <li>Regular data backups and disaster recovery procedures</li>
                      <li>Compliance with industry security standards (ISO 27001, SOC 2)</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">5. Data Sharing and Disclosure</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We do not sell, rent, or trade your personal information. We may share information only in 
                      the following circumstances:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>With authorized healthcare providers involved in patient care</li>
                      <li>When required by law or legal process</li>
                      <li>To protect the rights, property, or safety of patients and staff</li>
                      <li>With business partners who provide essential services (under strict confidentiality agreements)</li>
                      <li>With patient consent for specific purposes</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">6. Patient Rights</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      You have the following rights regarding your personal information:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Right to access your medical records and personal data</li>
                      <li>Right to request corrections to inaccurate information</li>
                      <li>Right to request deletion of your data (subject to legal requirements)</li>
                      <li>Right to data portability</li>
                      <li>Right to object to certain processing activities</li>
                      <li>Right to withdraw consent (where applicable)</li>
                      <li>Right to file a complaint with relevant data protection authorities</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">7. Data Retention</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      We retain personal and health information in accordance with applicable laws and regulations. 
                      Medical records are typically retained for a minimum period as required by law (usually 7-10 years 
                      for adults, longer for minors). After the retention period, data is securely deleted or anonymized.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">8. Compliance and Regulations</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      Our HIMS system complies with:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Health Insurance Portability and Accountability Act (HIPAA) - USA</li>
                      <li>General Data Protection Regulation (GDPR) - EU</li>
                      <li>Health Information Technology for Economic and Clinical Health (HITECH) Act</li>
                      <li>Local healthcare data protection laws and regulations</li>
                      <li>Clinical Laboratory Improvement Amendments (CLIA) requirements</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">9. Breach Notification</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      In the event of a data breach that may compromise your personal information, we will notify 
                      affected individuals and relevant authorities as required by law, typically within 72 hours 
                      of discovery. We will provide information about the nature of the breach, the data involved, 
                      and steps being taken to address the situation.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">10. Contact Information</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      For questions, concerns, or to exercise your rights regarding data privacy, please contact:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">
                        <strong>Data Protection Officer</strong><br />
                        TiaMeds Diagnostics<br />
                        Email: privacy@tiameds.com<br />
                        Phone: +1 (555) 123-4567<br />
                        Address: [Your Company Address]
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">11. Agreement Acceptance</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      By checking the agreement box and proceeding with registration, you acknowledge that you have 
                      read, understood, and agree to be bound by this Data Privacy Agreement. You understand that 
                      your use of the HIMS system is subject to compliance with these terms and applicable laws.
                    </p>
                  </section>

                  <section className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <p className="text-sm text-gray-700">
                      <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      This agreement may be updated periodically. Continued use of the system after updates 
                      constitutes acceptance of the revised terms.
                    </p>
                  </section>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-6 py-2.5 bg-primary hover:bg-primarylight text-white rounded-lg transition-colors font-medium"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OnboardingPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center">
          <FaSpinner className="text-5xl text-primary animate-spin" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
};

export default OnboardingPage;
