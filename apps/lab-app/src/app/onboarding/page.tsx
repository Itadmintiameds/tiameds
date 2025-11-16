'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  FaUser, FaLock, FaPhone, FaMapMarkerAlt, FaBuilding,
  FaEnvelope, FaUserTie, FaCheckCircle, FaArrowRight, FaArrowLeft,
  FaSpinner, FaFlask, FaShieldAlt, FaTimes
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
  const [step3Validated, setStep3Validated] = useState(false);

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

  // Automatically validate step 3 when reached
  useEffect(() => {
    if (currentStep === 3 && !step3Validated) {
      validateStep(3);
      setStep3Validated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.password || formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    }

    if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.zip.trim()) newErrors.zip = 'ZIP code is required';
      if (!formData.country.trim()) newErrors.country = 'Country is required';
    }

    if (step === 3) {
      if (!formData.lab.name.trim()) newErrors['lab.name'] = 'Lab name is required';
      if (!formData.lab.address.trim()) newErrors['lab.address'] = 'Lab address is required';
      if (!formData.lab.city.trim()) newErrors['lab.city'] = 'Lab city is required';
      if (!formData.lab.state.trim()) newErrors['lab.state'] = 'Lab state is required';
      if (!formData.lab.licenseNumber.trim()) newErrors['lab.licenseNumber'] = 'License number is required';
      if (!formData.lab.labType.trim()) newErrors['lab.labType'] = 'Lab type is required';
      if (!formData.lab.labZip.trim()) newErrors['lab.labZip'] = 'Lab ZIP code is required';
      if (!formData.lab.labCountry.trim()) newErrors['lab.labCountry'] = 'Lab country is required';
      if (!formData.lab.labPhone.trim()) newErrors['lab.labPhone'] = 'Lab phone is required';
      if (!formData.lab.labEmail.trim()) newErrors['lab.labEmail'] = 'Lab email is required';
      if (!formData.lab.directorName.trim()) newErrors['lab.directorName'] = 'Director name is required';
      if (!formData.lab.directorEmail.trim()) newErrors['lab.directorEmail'] = 'Director email is required';
      if (!formData.lab.directorPhone.trim()) newErrors['lab.directorPhone'] = 'Director phone is required';
      if (!formData.lab.dataPrivacyAgreement) {
        newErrors['lab.dataPrivacyAgreement'] = 'You must agree to the data privacy terms';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

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
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const nextStepNum = Math.min(currentStep + 1, 3);
      setCurrentStep(nextStepNum);
      
      // Automatically validate step 3 when reached
      if (nextStepNum === 3 && !step3Validated) {
        // Trigger validation on all step 3 fields
        validateStep(3);
        setStep3Validated(true);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      toast.error('Please fix all errors before submitting', { autoClose: 3000 });
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete onboarding. Please try again.', {
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.username ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="johndoe"
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
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+1234567890"
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.zip ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.country ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors['lab.address'] ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.city'] ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.state'] ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.labZip'] ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.labCountry'] ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.licenseNumber'] ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                        Lab Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="lab.labPhone"
                        value={formData.lab.labPhone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors['lab.labPhone'] ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors['lab.directorPhone'] ? 'border-red-500' : 'border-gray-300'
                          }`}
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

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FaArrowLeft />
                Previous
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primarylight text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Next
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
                      This Data Privacy Agreement ("Agreement") governs the collection, use, storage, and protection 
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
