import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import {
  FaFlask,
  FaMapMarkerAlt,
  FaCity,
  FaRegFileAlt,
  FaGlobe,
  FaPaperPlane,
  FaPhone,
  FaEnvelope,
  FaUserTie,
  FaCertificate,
  FaFileSignature,
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronRight,
  FaChevronLeft,
  FaUpload,
  FaImage
} from 'react-icons/fa';
import { MdMedicalServices } from 'react-icons/md';
import { LabFormDataNew } from '@/types/LabFormData';
import { labFormDataSchema } from '@/schema/labFromDataSchema';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { FaDatabase } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { createLab } from '../../../../../services/labServices';
import { useLabs } from '@/context/LabContext';
import Image from 'next/image';

type LabFormField = keyof LabFormDataNew;

interface FormFieldConfig {
  id: LabFormField;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
}

interface FormFieldConfigWithSelect extends FormFieldConfig {
  isSelect?: boolean;
  options?: string[];
}

const Lab = () => {
  const [errors, setErrors] = useState<Partial<Record<LabFormField, string>>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'legal'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<LabFormDataNew>({
    name: '',
    labType: '',
    description: '',
    address: '',
    city: '',
    state: '',
    labZip: '',
    labCountry: '',
    labLogo: '',
    labPhone: '',
    labEmail: '',
    directorName: '',
    directorEmail: '',
    directorPhone: '',
    directorGovtId: '',
    licenseNumber: '',
    labBusinessRegistration: '',
    labLicense: '',
    taxId: '',
    labCertificate: '',
    labAccreditation: '',
    certificationBody: '',
    dataPrivacyAgreement: false,
    isActive: false
  });
  const {refreshlab,setRefreshLab} = useLabs(); // Assuming you have a context or hook to manage labs
  

  // refreshlab, setRefreshLab

  const router = useRouter();

  // Validation helper functions (same as onboarding)
  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) return 'Phone number is required';
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

  useEffect(() => {
    const validateForm = async () => {
      try {
        await labFormDataSchema.parseAsync(formData);
        setIsFormValid(true);
        setErrors({});
      } catch (err) {
        setIsFormValid(false);
      }
    };
    validateForm();
  }, [formData]);

  const validateTab = (tab: 'basic' | 'contact' | 'legal'): boolean => {
    const newErrors: Partial<Record<LabFormField, string>> = { ...errors };

    if (tab === 'basic') {
      // Lab name
      if (!formData.name.trim()) {
        newErrors.name = 'Lab name is required';
      } else if (formData.name.length < 3) {
        newErrors.name = 'Lab name must be at least 3 characters';
      } else if (formData.name.length > 100) {
        newErrors.name = 'Lab name must not exceed 100 characters';
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.name)) {
        newErrors.name = 'Lab name can only contain alphabetic characters, spaces, hyphens, and apostrophes (no numbers)';
      } else {
        delete newErrors.name;
      }

      // Lab type
      if (!formData.labType.trim()) {
        newErrors.labType = 'Lab type is required';
      } else {
        delete newErrors.labType;
      }

      // Address
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      } else if (formData.address.length < 5) {
        newErrors.address = 'Address must be at least 5 characters';
      } else if (formData.address.length > 200) {
        newErrors.address = 'Address must not exceed 200 characters';
      } else {
        delete newErrors.address;
      }

      // City
      const cityError = validateName(formData.city, 'City');
      if (cityError) newErrors.city = cityError;
      else delete newErrors.city;

      // State
      const stateError = validateName(formData.state, 'State');
      if (stateError) newErrors.state = stateError;
      else delete newErrors.state;

      // ZIP
      const zipError = validateZip(formData.labZip);
      if (zipError) newErrors.labZip = zipError;
      else delete newErrors.labZip;

      // Country
      if (!formData.labCountry.trim()) {
        newErrors.labCountry = 'Country is required';
      } else if (formData.labCountry.length < 2) {
        newErrors.labCountry = 'Country must be at least 2 characters';
      } else if (formData.labCountry.length > 50) {
        newErrors.labCountry = 'Country must not exceed 50 characters';
      } else if (!/^[a-zA-Z\s'-]+$/.test(formData.labCountry)) {
        newErrors.labCountry = 'Country can only contain alphabetic characters, spaces, hyphens, and apostrophes (no numbers)';
      } else {
        delete newErrors.labCountry;
      }
    }

    if (tab === 'contact') {
      // Lab phone
      const labPhoneError = validatePhone(formData.labPhone);
      if (labPhoneError) newErrors.labPhone = labPhoneError;
      else delete newErrors.labPhone;

      // Lab email
      const labEmailError = validateEmail(formData.labEmail);
      if (labEmailError) newErrors.labEmail = labEmailError;
      else delete newErrors.labEmail;

      // Director name
      const directorNameError = validateName(formData.directorName, 'Director name');
      if (directorNameError) newErrors.directorName = directorNameError;
      else delete newErrors.directorName;

      // Director email
      const directorEmailError = validateEmail(formData.directorEmail);
      if (directorEmailError) newErrors.directorEmail = directorEmailError;
      else delete newErrors.directorEmail;

      // Director phone
      const directorPhoneError = validatePhone(formData.directorPhone);
      if (directorPhoneError) newErrors.directorPhone = directorPhoneError;
      else delete newErrors.directorPhone;

      // Director Govt ID
      const directorGovtIdError = validateAlphaNumericField(formData.directorGovtId, 'Director government ID', 5, 50);
      if (directorGovtIdError) newErrors.directorGovtId = directorGovtIdError;
      else delete newErrors.directorGovtId;
    }

    if (tab === 'legal') {
      // License number
      const licenseError = validateLicenseNumber(formData.licenseNumber);
      if (licenseError) newErrors.licenseNumber = licenseError;
      else delete newErrors.licenseNumber;

      // Business registration
      const businessRegistrationError = validateAlphaNumericField(formData.labBusinessRegistration, 'Business registration ID', 3, 50);
      if (businessRegistrationError) newErrors.labBusinessRegistration = businessRegistrationError;
      else delete newErrors.labBusinessRegistration;

      // Lab license
      const labLicenseError = validateAlphaNumericField(formData.labLicense, 'Lab license ID', 3, 50);
      if (labLicenseError) newErrors.labLicense = labLicenseError;
      else delete newErrors.labLicense;

      // Tax ID
      const taxIdError = validateNumericField(formData.taxId, 'Tax ID', 9, 15);
      if (taxIdError) newErrors.taxId = taxIdError;
      else delete newErrors.taxId;

      // Lab certificate
      const labCertificateError = validateAlphaNumericField(formData.labCertificate, 'Lab certificate ID', 3, 50);
      if (labCertificateError) newErrors.labCertificate = labCertificateError;
      else delete newErrors.labCertificate;

      // Lab accreditation
      const labAccreditationError = validateAlphaNumericField(formData.labAccreditation, 'Lab accreditation', 3, 50);
      if (labAccreditationError) newErrors.labAccreditation = labAccreditationError;
      else delete newErrors.labAccreditation;

      // Certification body
      const certificationBodyError = validateAlphaNumericField(formData.certificationBody, 'Certification body', 3, 50);
      if (certificationBodyError) newErrors.certificationBody = certificationBodyError;
      else delete newErrors.certificationBody;

      // Data privacy agreement
      if (!formData.dataPrivacyAgreement) {
        newErrors.dataPrivacyAgreement = 'You must agree to the data privacy terms';
      } else {
        delete newErrors.dataPrivacyAgreement;
      }
    }

    setErrors(newErrors);
    const tabFields: LabFormField[] = tab === 'basic' 
      ? ['name', 'labType', 'address', 'city', 'state', 'labZip', 'labCountry']
      : tab === 'contact'
      ? ['labPhone', 'labEmail', 'directorName', 'directorEmail', 'directorPhone', 'directorGovtId']
      : ['licenseNumber', 'labBusinessRegistration', 'labLicense', 'taxId', 'labCertificate', 'labAccreditation', 'certificationBody', 'dataPrivacyAgreement'];
    
    return !tabFields.some(field => newErrors[field]);
  };

  // const isTabComplete = (tab: 'basic' | 'contact' | 'legal'): boolean => {
  //   return validateTab(tab);
  // };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (name in formData) {
      const fieldName = name as LabFormField;
      
      // Real-time input filtering (same as onboarding)
      let processedValue = value;
      
      // Handle phone numbers - only digits, max 10
      if (name === 'labPhone' || name === 'directorPhone') {
        processedValue = value.replace(/\D/g, '').slice(0, 10);
      }
      // Handle ZIP code - only digits, max 6
      else if (name === 'labZip') {
        processedValue = value.replace(/\D/g, '').slice(0, 6);
      }
      // Handle license number - alphabetic only, max 20, uppercase
      else if (name === 'licenseNumber') {
        processedValue = value.replace(/[^a-zA-Z]/g, '').slice(0, 20).toUpperCase();
      }
      // Handle alphanumeric compliance fields with hyphen support - uppercase
      else if (
        name === 'certificationBody' ||
        name === 'labCertificate' ||
        name === 'directorGovtId' ||
        name === 'labBusinessRegistration' ||
        name === 'labLicense' ||
        name === 'labAccreditation'
      ) {
        processedValue = value.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 50).toUpperCase();
      }
      // Handle tax ID - digits only, max 15
      else if (name === 'taxId') {
        processedValue = value.replace(/\D/g, '').slice(0, 15);
      }
      // Handle email fields - keep in lowercase
      else if (name === 'labEmail' || name === 'directorEmail') {
        processedValue = value.toLowerCase();
      }
      // Handle name fields - alphabetic with spaces, hyphens, apostrophes, uppercase
      else if (name === 'name' || name === 'city' || name === 'state' || name === 'labCountry' || name === 'directorName') {
        processedValue = value.replace(/[^a-zA-Z\s'-]/g, '').toUpperCase();
      }
      // Handle address - convert to uppercase
      else if (name === 'address') {
        processedValue = value.toUpperCase();
      }
      
      setFormData(prev => ({
        ...prev,
        [fieldName]: type === 'checkbox' ? checked : processedValue
      }));
      
      // Clear error for this field
      if (errors[fieldName]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    }
  };

  // Handle field blur (when user leaves the field) - validate and set errors
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const fieldName = name as LabFormField;
    let error: string | null = null;

    // Validate based on field type
    if (name === 'labPhone' || name === 'directorPhone') {
      error = validatePhone(value);
    } else if (name === 'labZip') {
      error = validateZip(value);
    } else if (name === 'labEmail' || name === 'directorEmail') {
      error = validateEmail(value);
    } else if (name === 'name') {
      if (!value.trim()) {
        error = 'Lab name is required';
      } else if (value.length < 3) {
        error = 'Lab name must be at least 3 characters';
      } else if (value.length > 100) {
        error = 'Lab name must not exceed 100 characters';
      } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        error = 'Lab name can only contain alphabetic characters, spaces, hyphens, and apostrophes (no numbers)';
      }
    } else if (name === 'city' || name === 'state' || name === 'directorName') {
      error = validateName(value, name === 'city' ? 'City' : name === 'state' ? 'State' : 'Director name');
    } else if (name === 'labCountry') {
      if (!value.trim()) {
        error = 'Country is required';
      } else if (value.length < 2) {
        error = 'Country must be at least 2 characters';
      } else if (value.length > 50) {
        error = 'Country must not exceed 50 characters';
      } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        error = 'Country can only contain alphabetic characters, spaces, hyphens, and apostrophes (no numbers)';
      }
    } else if (name === 'address') {
      if (!value.trim()) {
        error = 'Address is required';
      } else if (value.length < 5) {
        error = 'Address must be at least 5 characters';
      } else if (value.length > 200) {
        error = 'Address must not exceed 200 characters';
      }
    } else if (name === 'licenseNumber') {
      error = validateLicenseNumber(value);
    } else if (name === 'directorGovtId') {
      error = validateAlphaNumericField(value, 'Director government ID', 5, 50);
    } else if (name === 'certificationBody') {
      error = validateAlphaNumericField(value, 'Certification body', 3, 50);
    } else if (name === 'labCertificate') {
      error = validateAlphaNumericField(value, 'Lab certificate ID', 3, 50);
    } else if (name === 'labLicense') {
      error = validateAlphaNumericField(value, 'Lab license ID', 3, 50);
    } else if (name === 'labAccreditation') {
      error = validateAlphaNumericField(value, 'Lab accreditation', 3, 50);
    } else if (name === 'labBusinessRegistration') {
      error = validateAlphaNumericField(value, 'Business registration ID', 3, 50);
    } else if (name === 'taxId') {
      error = validateNumericField(value, 'Tax ID', 9, 15);
    } else if (name === 'labType') {
      if (!value.trim()) {
        error = 'Lab type is required';
      }
    }

    // Set or clear error
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error! }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match('image.*')) {
        toast.error('Please upload an image file', { position: 'top-right' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({
            ...prev,
            labLogo: event.target?.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!validateTab(activeTab)) {
      const tabName = activeTab === 'basic' ? 'basic information' : activeTab === 'contact' ? 'contact information' : 'legal information';
      toast.error(`Please fix all errors in ${tabName} before proceeding`, {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }

    setActiveTab(activeTab === 'basic' ? 'contact' : 'legal');
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate all tabs before submitting
      const basicValid = validateTab('basic');
      const contactValid = validateTab('contact');
      const legalValid = validateTab('legal');

      if (!basicValid || !contactValid || !legalValid) {
        toast.error('Please fix all validation errors before submitting', {
          position: 'top-right',
          autoClose: 5000,
        });
        setIsSubmitting(false);
        // Navigate to first tab with errors
        if (!basicValid) setActiveTab('basic');
        else if (!contactValid) setActiveTab('contact');
        else if (!legalValid) setActiveTab('legal');
        return;
      }

      await labFormDataSchema.parseAsync(formData);
      const labData: LabFormDataNew = {
        ...formData,
        isActive: true
      };
      await createLab(labData);
      setFormData({
        name: '',
        labType: '',
        description: '',
        address: '',
        city: '',
        state: '',
        labZip: '',
        labCountry: '',
        labLogo: '',
        labPhone: '',
        labEmail: '',
        directorName: '',
        directorEmail: '',
        directorPhone: '',
        directorGovtId: '',
        licenseNumber: '',
        labBusinessRegistration: '',
        labLicense: '',
        taxId: '',
        labCertificate: '',
        labAccreditation: '',
        certificationBody: '',
        dataPrivacyAgreement: false,
        isActive: false
      });

      setErrors({});
      setRefreshLab(!refreshlab);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

      toast.success('Lab created successfully', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.reduce(
          (acc, curr) => ({ ...acc, [curr.path[0] as LabFormField]: curr.message }),
          {} as Partial<Record<LabFormField, string>>
        );
        setErrors(fieldErrors);
        toast.error('Please fix the validation errors', {
          position: 'top-right',
          autoClose: 5000,
        });
      } else {
        toast.error('An unexpected error occurred', {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBasicInfoTab = () => {
    const basicFields: FormFieldConfigWithSelect[] = [
      { id: 'name', label: 'Lab Name', icon: FaBuilding, placeholder: 'Enter Lab Name' },
      {
        id: 'labType',
        label: 'Lab Type',
        icon: MdMedicalServices,
        placeholder: 'Enter Lab Type',
        isSelect: true,
        options: ['Diagnostic', 'Research', 'Clinical', 'Pathology']
      },
    ];

    const addressFields: FormFieldConfig[] = [
      { id: 'address', label: 'Address', icon: FaMapMarkerAlt, placeholder: 'Enter Address' },
      { id: 'city', label: 'City', icon: FaCity, placeholder: 'Enter City' },
      { id: 'state', label: 'State', icon: FaGlobe, placeholder: 'Enter State' },
      { id: 'labZip', label: 'ZIP Code', icon: FaMapMarkerAlt, placeholder: 'Enter ZIP Code' },
      { id: 'labCountry', label: 'Country', icon: FaGlobe, placeholder: 'Enter Country' },
    ];

    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center mb-4">
          <div
            onClick={triggerFileInput}
            className="w-24 h-24 bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 relative overflow-hidden shadow-md"
          >
            {formData.labLogo ? (
              <Image
                src={formData.labLogo}
                alt="Lab Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <FaImage className="text-purple-400 text-3xl mb-2" />
                <span className="text-xs text-purple-600 text-center px-2 font-medium">Upload Logo</span>
              </>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={triggerFileInput}
            className="mt-2 inline-flex items-center px-3 py-1.5 text-xs font-medium text-white transition-all duration-200"
            style={{ background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)` }}
          >
            <FaUpload className="mr-1.5 text-xs" />
            {formData.labLogo ? 'Change Logo' : 'Upload Logo'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {basicFields.map(({ id, label, icon: Icon, placeholder, isSelect, options }) => (
            <div key={id} className="w-full">
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
              </label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                {isSelect ? (
                  <select
                    id={id}
                    name={id}
                    value={formData[id] as string}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`block w-full pl-10 pr-3 py-2 text-sm ${errors[id] ? 'border border-red-500' : ''
                      } shadow-sm focus:ring-purple-500 focus:border-purple-500 text-gray-800`}
                  >
                    <option value="" disabled>Select Lab Type</option>
                    {options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id={id}
                    name={id}
                    value={formData[id] as string}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`block w-full pl-10 pr-3 py-2 text-sm ${errors[id] ? 'border border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'focus:ring-purple-500 focus:border-purple-500'
                      } shadow-sm text-gray-800`}
                    placeholder={placeholder}
                  />
                )}
                {errors[id] && (
                  <p className="text-red-500 text-xs mt-0.5">{errors[id]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <div className="relative">
            <FaRegFileAlt className="absolute left-3 top-2.5 text-gray-400 text-sm" />
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleBlur}
                    className={`block w-full pl-10 pr-3 py-2 text-sm ${errors.description ? 'border border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'focus:ring-purple-500 focus:border-purple-500'
                } shadow-sm text-gray-800`}
              placeholder="Enter Description"
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-0.5">{errors.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addressFields.map(({ id, label, icon: Icon, placeholder }) => (
            <div key={id} className="w-full">
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
              </label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  id={id}
                  name={id}
                  value={formData[id] as string}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-2 text-sm border ${errors[id] ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                    } rounded-md shadow-sm text-gray-800`}
                  placeholder={placeholder}
                />
                {errors[id] && (
                  <p className="text-red-500 text-xs mt-0.5">{errors[id]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContactInfoTab = () => {
    const labContactFields: FormFieldConfig[] = [
      { id: 'labPhone', label: 'Lab Phone', icon: FaPhone, placeholder: '+91-9876543250' },
      { id: 'labEmail', label: 'Lab Email', icon: FaEnvelope, placeholder: 'support@primecare.com' },
    ];

    const directorFields: FormFieldConfig[] = [
      { id: 'directorName', label: 'Director Name', icon: FiUser, placeholder: 'Dr. Michael Wilson' },
      { id: 'directorEmail', label: 'Director Email', icon: FiMail, placeholder: 'michaelwilson@primecare.com' },
      { id: 'directorPhone', label: 'Director Phone', icon: FiPhone, placeholder: '+91-9876543251' },
      { id: 'directorGovtId', label: 'Director Govt ID', icon: FaFileSignature, placeholder: 'E4455667' },
    ];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {labContactFields.map(({ id, label, icon: Icon, placeholder }) => (
            <div key={id} className="w-full">
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
              </label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  id={id}
                  name={id}
                  value={formData[id] as string}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-2 text-sm border ${errors[id] ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                    } rounded-md shadow-sm text-gray-800`}
                  placeholder={placeholder}
                />
                {errors[id] && (
                  <p className="text-red-500 text-xs mt-0.5">{errors[id]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center">
            <FaUserTie className="text-purple-600 mr-2" /> Director Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {directorFields.map(({ id, label, icon: Icon, placeholder }) => (
            <div key={id} className="w-full">
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
              </label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  id={id}
                  name={id}
                  value={formData[id] as string}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-2 text-sm border ${errors[id] ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                    } rounded-md shadow-sm text-gray-800`}
                  placeholder={placeholder}
                />
                {errors[id] && (
                  <p className="text-red-500 text-xs mt-0.5">{errors[id]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLegalInfoTab = () => {
    const legalFields: FormFieldConfig[] = [
      { id: 'licenseNumber', label: 'License Number', icon: FaCertificate, placeholder: 'LIC445566' },
      { id: 'labBusinessRegistration', label: 'Business Registration', icon: FaFileSignature, placeholder: 'BR345678' },
      { id: 'labLicense', label: 'Lab License', icon: FaFileSignature, placeholder: 'LLC-345678' },
      { id: 'taxId', label: 'Tax ID', icon: FaFileSignature, placeholder: 'TAX-44556' },
      { id: 'labCertificate', label: 'Certificate Number', icon: FaCertificate, placeholder: 'CERT-55678' },
      { id: 'labAccreditation', label: 'Accreditation', icon: FaCheckCircle, placeholder: 'ISO 14001' },
      { id: 'certificationBody', label: 'Certification Body', icon: FaCertificate, placeholder: 'ISO' },
    ];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {legalFields.map(({ id, label, icon: Icon, placeholder }) => (
            <div key={id} className="w-full">
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
              </label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  id={id}
                  name={id}
                  value={formData[id] as string}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-2 text-sm border ${errors[id] ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                    } rounded-md shadow-sm text-gray-800`}
                  placeholder={placeholder}
                />
                {errors[id] && (
                  <p className="text-red-500 text-xs mt-0.5">{errors[id]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="dataPrivacyAgreement"
              name="dataPrivacyAgreement"
              checked={formData.dataPrivacyAgreement}
              onChange={handleInputChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="dataPrivacyAgreement" className="ml-2 block text-sm text-gray-700">
              I agree to the data privacy agreement
            </label>
          </div>
          {errors.dataPrivacyAgreement && (
            <p className="text-red-500 text-xs mt-1">{errors.dataPrivacyAgreement}</p>
          )}
        </div>
      </div>
    );
  };

  const renderPreview = () => (
    <div className={`bg-white h-full flex flex-col transition-all duration-300 ${isPreviewCollapsed ? 'w-16' : 'w-1/2'}`}>
      <div 
        className="px-4 py-3 flex justify-between items-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
      >
        {!isPreviewCollapsed && (
          <h3 className="text-lg font-semibold text-white flex items-center">
            <div className="bg-white/20 p-2 mr-3">
              <FaFlask className="text-white text-sm" />
            </div>
            Live Preview
          </h3>
        )}
        <button
          onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
          className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10"
        >
          {isPreviewCollapsed ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      {!isPreviewCollapsed && (
        <div className="p-4 overflow-y-auto flex-1">
          <div className="space-y-3">
            {/* Lab Header Card */}
            <div 
              className="p-4 shadow-sm"
              style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white shadow-lg flex items-center justify-center mb-3">
                  {formData.labLogo ? (
                    <Image src={formData.labLogo} alt="Lab Logo" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                      <FaFlask className="text-purple-500 text-4xl" />
                    </div>
                  )}
                </div>
                <h4 className="text-xl font-bold text-white">{formData.name || "Lab Name"}</h4>
                <p className="text-sm text-white font-medium bg-white/20 px-3 py-1 mt-1">
                  {formData.labType || "Lab Type"}
                </p>
              </div>
            </div>

            {/* Basic Information - Blue */}
            <div className="bg-blue-50 p-3">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-blue-600" />
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-gray-600">Address:</span>
                  <span className="ml-2 text-gray-900">{formData.address || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">City:</span>
                  <span className="ml-2 text-gray-900">{formData.city || "Not provided"}</span>
              </div>
                <div>
                  <span className="font-medium text-gray-600">State:</span>
                  <span className="ml-2 text-gray-900">{formData.state || "Not provided"}</span>
            </div>
              <div>
                  <span className="font-medium text-gray-600">ZIP Code:</span>
                  <span className="ml-2 text-gray-900">{formData.labZip || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Country:</span>
                  <span className="ml-2 text-gray-900">{formData.labCountry || "Not provided"}</span>
                </div>
              </div>
            </div>

            {/* Description - White */}
            {formData.description && (
              <div className="bg-white p-3">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <FaRegFileAlt className="mr-2 text-gray-600" />
                  Description
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {formData.description}
                </p>
              </div>
            )}

            {/* Contact Information - Purple */}
            <div className="bg-purple-50 p-3">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                <FaPhone className="mr-2 text-purple-600" />
                Contact Information
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-gray-600">Lab Phone:</span>
                  <span className="ml-2 text-gray-900">{formData.labPhone || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Lab Email:</span>
                  <span className="ml-2 text-gray-900">{formData.labEmail || "Not provided"}</span>
                </div>
              </div>
            </div>

            {/* Director Information - Blue */}
            <div className="bg-blue-50 p-3">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <FaUserTie className="mr-2 text-blue-600" />
                    Director Information
                  </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="ml-2 text-gray-900">{formData.directorName || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="ml-2 text-gray-900">{formData.directorEmail || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Phone:</span>
                  <span className="ml-2 text-gray-900">{formData.directorPhone || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Govt ID:</span>
                  <span className="ml-2 text-gray-900">{formData.directorGovtId || "Not provided"}</span>
                </div>
                  </div>
                </div>

            {/* Legal Information - Green */}
            <div className="bg-green-50 p-3">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <FaCertificate className="mr-2 text-green-600" />
                    Legal Information
                  </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-gray-600">License Number:</span>
                  <span className="ml-2 text-gray-900">{formData.licenseNumber || "Not provided"}</span>
                  </div>
                <div>
                  <span className="font-medium text-gray-600">Business Registration:</span>
                  <span className="ml-2 text-gray-900">{formData.labBusinessRegistration || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Lab License:</span>
                  <span className="ml-2 text-gray-900">{formData.labLicense || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Tax ID:</span>
                  <span className="ml-2 text-gray-900">{formData.taxId || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Certificate Number:</span>
                  <span className="ml-2 text-gray-900">{formData.labCertificate || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Accreditation:</span>
                  <span className="ml-2 text-gray-900">{formData.labAccreditation || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Certification Body:</span>
                  <span className="ml-2 text-gray-900">{formData.certificationBody || "Not provided"}</span>
                </div>
                </div>
              </div>

            {/* Status & Compliance - Yellow */}
            <div className="bg-yellow-50 p-3">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                <FaDatabase className="mr-2 text-yellow-600" />
                  Status & Compliance
                </h4>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium ${formData.dataPrivacyAgreement ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {formData.dataPrivacyAgreement ? (
                      <>
                      <FaCheckCircle className="mr-1.5 text-green-600" /> Privacy Agreement Signed
                      </>
                    ) : (
                      <>
                      <FaTimesCircle className="mr-1.5 text-yellow-600" /> Privacy Agreement Pending
                      </>
                    )}
                  </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-full">
        {/* Main Form Area */}
        <div className={`flex-1 transition-all duration-300 ${isPreviewCollapsed ? 'w-full' : 'w-1/2'}`}>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow-xl overflow-hidden">
              {/* Header */}
              <div 
                className="px-6 py-3 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, #E1C4F8 0%, #d1a8f5 100%)` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white/20 p-2 mr-3">
                      <FaFlask className="text-white text-lg" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {formData.name || "New Laboratory Profile"}
                      </h2>
                      <p className="text-sm text-white/90 mt-1">
                        {formData.labType || "Complete the form to create a new lab profile"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium ${formData.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {formData.isActive ? (
                        <>
                          <FaCheckCircle className="mr-1.5 text-green-600" /> Active
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="mr-1.5 text-gray-500" /> Inactive
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="px-6 pt-4">
                <div className="flex items-center justify-between">
                  {['basic', 'contact', 'legal'].map((tab, index) => (
                    <React.Fragment key={tab}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(tab as 'basic' | 'contact' | 'legal')}
                        className={`flex flex-col items-center transition-all duration-200 ${activeTab === tab ? 'text-purple-600' : 'text-gray-500'}`}
                      >
                        <div className={`w-8 h-8 flex items-center justify-center mb-1 transition-all duration-200 ${activeTab === tab ? 'bg-purple-100 text-purple-600 shadow-sm' : 'bg-gray-100 text-gray-500'
                          }`}>
                          {index + 1}
                        </div>
                        <span className="text-xs font-medium capitalize">
                          {tab === 'basic' && 'Basic'}
                          {tab === 'contact' && 'Contact'}
                          {tab === 'legal' && 'Legal'}
                        </span>
                      </button>
                      {index < 2 && (
                        <div className={`flex-1 h-0.5 mx-2 transition-all duration-200 ${activeTab === tab || (index === 0 && activeTab === 'legal') ? 'bg-purple-200' : 'bg-gray-200'}`}></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {activeTab === 'basic' && renderBasicInfoTab()}
                {activeTab === 'contact' && renderContactInfoTab()}
                {activeTab === 'legal' && renderLegalInfoTab()}

                <div className="flex justify-between pt-4">
                  <div className="flex justify-between w-full">
                  {activeTab !== 'basic' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab(activeTab === 'legal' ? 'contact' : 'basic')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
                    >
                      Previous
                    </button>
                  )}

                  {activeTab !== 'legal' ? (
                    <button
                      type="button"
                      onClick={handleNextClick}
                        className="ml-auto px-4 py-2 text-sm font-medium text-white transition-all duration-200 flex items-center"
                        style={{ background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)` }}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || !isFormValid}
                        className={`ml-auto px-4 py-2 text-sm font-medium text-white transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${isSubmitting || !isFormValid
                          ? 'bg-gray-400'
                          : ''
                          }`}
                        style={!isSubmitting && isFormValid ? { background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)` } : {}}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="mr-2 text-white text-sm" />
                          Submit Laboratory
                        </>
                      )}
                    </button>
                  )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {renderPreview()}
      </div>
    </div>
  );
};

export default Lab;