'use client';
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
    FaImage,
    FaShieldAlt,
    FaMicroscope,
    FaSignOutAlt
} from 'react-icons/fa';
import { MdMedicalServices } from 'react-icons/md';
import { LabFormDataNew } from '@/types/LabFormData';
import { labFormDataSchema } from '@/schema/labFromDataSchema';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { FaDatabase } from 'react-icons/fa6';
import { createLab } from "@/../services/labServices";
import { useLabs } from '@/context/LabContext';
import { useRouter } from 'next/navigation';
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

const initialFormData: LabFormDataNew = {
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
};

const Lab = () => {
    const [errors, setErrors] = useState<Partial<Record<LabFormField, string>>>({});
    const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'legal'>('basic');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<LabFormDataNew>(initialFormData);
    const { setRefreshLab } = useLabs();
    const router = useRouter();

    useEffect(() => {
        if (shouldRedirect) {
            // Using multiple methods to ensure redirection works
            router.push('/dashboard');
            window.location.href = '/dashboard';
        }
    }, [shouldRedirect, router]);

    const handleLogout = () => {
        toast.success("Logged out successfully", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
        });
        localStorage.removeItem("user");
        localStorage.removeItem("logedUser");
        localStorage.removeItem("currentLab");
        localStorage.removeItem("userLabs");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.replace("/user-login");
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

    const isTabComplete = (tab: 'basic' | 'contact' | 'legal'): boolean => {
        const requiredFields: Record<'basic' | 'contact' | 'legal', LabFormField[]> = {
            basic: ['name', 'labType', 'description', 'address', 'city', 'state', 'labZip', 'labCountry'],
            contact: ['labPhone', 'labEmail', 'directorName', 'directorEmail', 'directorPhone', 'directorGovtId'],
            legal: ['licenseNumber', 'labBusinessRegistration', 'labLicense', 'taxId', 'labCertificate', 'labAccreditation', 'certificationBody', 'dataPrivacyAgreement']
        };

        return requiredFields[tab].every(field => {
            if (field === 'dataPrivacyAgreement') {
                return formData[field] === true;
            }
            return !!formData[field];
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

        if (name in formData) {
            const fieldName = name as LabFormField;
            setFormData(prev => ({
                ...prev,
                [fieldName]: type === 'checkbox' ? checked : value
            }));
            setErrors(prev => ({ ...prev, [fieldName]: '' }));
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

        if (activeTab === 'basic' && !isTabComplete('basic')) {
            toast.error('Please complete all basic information before proceeding', {
                position: 'top-right',
                autoClose: 5000,
            });
            return;
        }

        if (activeTab === 'contact' && !isTabComplete('contact')) {
            toast.error('Please complete all contact information before proceeding', {
                position: 'top-right',
                autoClose: 5000,
            });
            return;
        }

        setActiveTab(activeTab === 'basic' ? 'contact' : 'legal');
    };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setIsSubmitting(true);

    //     try {
    //         // Validate form data
    //         await labFormDataSchema.parseAsync(formData);

    //         // Prepare API payload
    //         const labData: LabFormDataNew = {
    //             ...formData,
    //             isActive: true,
    //         };

    //         // Call API
    //         const response = await createLab(labData);

    //         if (!response) {
    //             throw new Error("Failed to create lab");
    //         }
    //          window.location.href = '/dashboard';

    //         // Reset form
    //         setFormData(initialFormData);

    //         // Show success message
    //         toast.success("Lab created successfully!", {
    //             position: "top-right",
    //             autoClose: 2000,
    //             onClose: () => {
    //                 // Trigger redirection after toast closes
    //                 setShouldRedirect(true);
    //             }
    //         });

    //         // Refresh context
    //         setRefreshLab(!refreshlab);

    //     } catch (error) {
    //         console.error("Submission error:", error);

    //         if (error instanceof z.ZodError) {
    //             const fieldErrors = error.errors.reduce(
    //                 (acc, curr) => ({
    //                     ...acc,
    //                     [curr.path[0] as LabFormField]: curr.message
    //                 }),
    //                 {} as Partial<Record<LabFormField, string>>
    //             );
    //             setErrors(fieldErrors);
    //             toast.error("Please fix validation errors", {
    //                 position: "top-right",
    //             });
    //         } else {
    //             toast.error(
    //                 error instanceof Error
    //                     ? error.message
    //                     : "Failed to create lab. Please try again.",
    //                 {
    //                     position: "top-right",
    //                 }
    //             );
    //         }
    //     } finally {
    //         setIsSubmitting(false);
    //     } 
    // };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Validate form data
            await labFormDataSchema.parseAsync(formData);

            // 2. Prepare API payload
            const labData: LabFormDataNew = {
                ...formData,
                isActive: true,
            };

            // 3. Call API
            const response = await createLab(labData);

            if (!response) {
                throw new Error("Failed to create lab");
            }

            // 4. Force refresh of lab context data
            setRefreshLab(prev => !prev);

            // 5. Show success message
            toast.success("Lab created successfully! Redirecting...", {
                position: "top-right",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                onClose: () => {
                    // 6. Force full page reload to ensure all data is fresh
                    window.location.href = '/dashboard';
                }
            });
            // 7. Reset form
            setFormData(initialFormData);
            setShouldRedirect(true);

        } catch (error) {
            console.error("Submission error:", error);

            if (error instanceof z.ZodError) {
                const fieldErrors = error.errors.reduce(
                    (acc, curr) => ({
                        ...acc,
                        [curr.path[0] as LabFormField]: curr.message
                    }),
                    {} as Partial<Record<LabFormField, string>>
                );
                setErrors(fieldErrors);
                toast.error("Please fix validation errors", {
                    position: "top-right",
                });
            } else {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to create lab. Please try again.",
                    {
                        position: "top-right",
                    }
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    const renderBasicInfoTab = () => {
        const basicFields: FormFieldConfigWithSelect[] = [
            { id: 'name', label: 'Lab Name', icon: FaBuilding, placeholder: 'PrimeCare Diagnostics' },
            {
                id: 'labType',
                label: 'Lab Type',
                icon: MdMedicalServices,
                placeholder: 'Diagnostic',
                isSelect: true,
                options: ['Diagnostic', 'Research', 'Clinical', 'Pathology']
            },
        ];

        const addressFields: FormFieldConfig[] = [
            { id: 'address', label: 'Address', icon: FaMapMarkerAlt, placeholder: '555 Prime Lane' },
            { id: 'city', label: 'City', icon: FaCity, placeholder: 'MedCity' },
            { id: 'state', label: 'State', icon: FaGlobe, placeholder: 'VitalCare State' },
            { id: 'labZip', label: 'ZIP Code', icon: FaMapMarkerAlt, placeholder: '560005' },
            { id: 'labCountry', label: 'Country', icon: FaGlobe, placeholder: 'India' },
        ];

        return (
            <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                            <FaMicroscope className="text-blue-500 text-xl" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-blue-800">Welcome to Laboratory Registration</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Start by providing basic information about your laboratory. This will help us create your profile and connect you with potential clients.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div
                        onClick={triggerFileInput}
                        className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors relative overflow-hidden"
                    >
                        {formData.labLogo ? (
                            <img
                                src={formData.labLogo}
                                alt="Lab Logo"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <>
                                <FaImage className="text-gray-400 text-3xl mb-2" />
                                <span className="text-xs text-gray-500 text-center px-2">Upload Logo</span>
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
                        className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FaUpload className="mr-1.5 text-xs" />
                        {formData.labLogo ? 'Change Logo' : 'Upload Logo'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {basicFields.map(({ id, label, icon: Icon, placeholder, isSelect, options }) => (
                        <div key={id} className="w-full">
                            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
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
                                        className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${errors[id] ? 'border-red-500' : 'border-gray-300'
                                            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800`}
                                    >
                                        <option value="">Select lab type</option>
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
                                        className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${errors[id] ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                            } rounded-md shadow-sm text-gray-800`}
                                        placeholder={placeholder}
                                    />
                                )}
                                {errors[id] && (
                                    <p className="text-red-500 text-xs mt-1">{errors[id]}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <div className="relative">
                        <FaRegFileAlt className="absolute left-3 top-3 text-gray-400 text-sm" />
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${errors.description ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                } rounded-md shadow-sm text-gray-800`}
                            placeholder="Premium diagnostic services with state-of-the-art technology."
                            rows={4}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addressFields.map(({ id, label, icon: Icon, placeholder }) => (
                        <div key={id} className="w-full">
                            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
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
                                    className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${errors[id] ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        } rounded-md shadow-sm text-gray-800`}
                                    placeholder={placeholder}
                                />
                                {errors[id] && (
                                    <p className="text-red-500 text-xs mt-1">{errors[id]}</p>
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
            <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                            <FaPhone className="text-blue-500 text-xl" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-blue-800">Contact Information</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Provide contact details for your laboratory and the director. This information will be used for official communications.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {labContactFields.map(({ id, label, icon: Icon, placeholder }) => (
                        <div key={id} className="w-full">
                            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
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
                                    className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${errors[id] ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        } rounded-md shadow-sm text-gray-800`}
                                    placeholder={placeholder}
                                />
                                {errors[id] && (
                                    <p className="text-red-500 text-xs mt-1">{errors[id]}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-md font-medium text-gray-900 flex items-center">
                        <FaUserTie className="text-purple-600 mr-2" /> Director Information
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {directorFields.map(({ id, label, icon: Icon, placeholder }) => (
                        <div key={id} className="w-full">
                            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
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
                                    className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${errors[id] ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        } rounded-md shadow-sm text-gray-800`}
                                    placeholder={placeholder}
                                />
                                {errors[id] && (
                                    <p className="text-red-500 text-xs mt-1">{errors[id]}</p>
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
            <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                            <FaShieldAlt className="text-blue-500 text-xl" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-blue-800">Legal & Compliance</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Provide all required legal documentation to ensure compliance with regulatory requirements.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {legalFields.map(({ id, label, icon: Icon, placeholder }) => (
                        <div key={id} className="w-full">
                            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
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
                                    className={`block w-full pl-10 pr-3 py-2.5 text-sm border ${errors[id] ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        } rounded-md shadow-sm text-gray-800`}
                                    placeholder={placeholder}
                                />
                                {errors[id] && (
                                    <p className="text-red-500 text-xs mt-1">{errors[id]}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-4 pt-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="dataPrivacyAgreement"
                            name="dataPrivacyAgreement"
                            checked={formData.dataPrivacyAgreement}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
        <div className={`bg-white h-full flex flex-col transition-all duration-300 ${isPreviewCollapsed ? 'w-16' : 'w-1/2 border-l border-gray-200'}`}>
            <div className="bg-gray-50 py-4 px-6 border-b border-gray-200 flex justify-between items-center">
                {!isPreviewCollapsed && <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>}
                <button
                    onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    {isPreviewCollapsed ? <FaChevronLeft /> : <FaChevronRight />}
                </button>
            </div>

            {!isPreviewCollapsed && (
                <div className="p-8 overflow-y-auto flex-1">
                    <div className="flex flex-col gap-8">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-32 h-32 bg-white rounded-full shadow-md flex items-center justify-center mb-4 border-4 border-white">
                                    {formData.labLogo ? (
                                        <Image src={formData.labLogo} alt="Lab Logo" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                                            <FaFlask className="text-purple-400 text-4xl" />
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-xl font-bold text-gray-900">{formData.name || "Lab Name"}</h4>
                                <p className="text-sm text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-full mt-1">
                                    {formData.labType || "Lab Type"}
                                </p>

                                <div className="mt-6 text-left w-full space-y-3">
                                    <p className="text-sm flex items-start">
                                        <FaMapMarkerAlt className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{formData.address || "Address not provided"}</span>
                                    </p>
                                    <p className="text-sm flex items-start">
                                        <FaPhone className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{formData.labPhone || "Phone not provided"}</span>
                                    </p>
                                    <p className="text-sm flex items-start">
                                        <FaEnvelope className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{formData.labEmail || "Email not provided"}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                                    <FaRegFileAlt className="text-purple-500 mr-2" />
                                    Description
                                </h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                                    {formData.description || "No description provided"}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                                        <FaUserTie className="text-purple-500 mr-2" />
                                        Director Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Name:</span> {formData.directorName || "Not provided"}</p>
                                        <p><span className="font-medium">Email:</span> {formData.directorEmail || "Not provided"}</p>
                                        <p><span className="font-medium">Phone:</span> {formData.directorPhone || "Not provided"}</p>
                                        <p><span className="font-medium">Govt ID:</span> {formData.directorGovtId || "Not provided"}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                                        <FaCertificate className="text-purple-500 mr-2" />
                                        Legal Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">License:</span> {formData.licenseNumber || "Not provided"}</p>
                                        <p><span className="font-medium">Tax ID:</span> {formData.taxId || "Not provided"}</p>
                                        <p><span className="font-medium">Accreditation:</span> {formData.labAccreditation || "Not provided"}</p>
                                        <p><span className="font-medium">Certification:</span> {formData.certificationBody || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                                    <FaDatabase className="text-purple-500 mr-2" />
                                    Status & Compliance
                                </h4>
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${formData.dataPrivacyAgreement ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {formData.dataPrivacyAgreement ? (
                                            <>
                                                <FaCheckCircle className="mr-1.5 text-blue-500" /> Privacy Agreement Signed
                                            </>
                                        ) : (
                                            <>
                                                <FaTimesCircle className="mr-1.5 text-yellow-500" /> Privacy Agreement Pending
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex-1 mb-6 md:mb-0">
                            <h1 className="text-3xl font-bold">Laboratory Registration</h1>
                            <p className="mt-2 text-blue-100 max-w-2xl">
                                Register your laboratory to join our network of trusted healthcare providers and expand your reach.
                            </p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                            <div className="flex items-center">
                                <div className="bg-white/20 p-3 rounded-full mr-4">
                                    <FaFlask className="text-white text-2xl" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-200">Quick Setup</p>
                                    <p className="text-xs text-blue-100">Complete in just a few steps</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex h-full">
                {/* Main Form Area */}
                <div className={`flex-1 transition-all duration-300 ${isPreviewCollapsed ? 'w-full' : 'w-1/2'}`}>
                    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-6 px-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-white/20 p-2 rounded-lg mr-4">
                                            <FaFlask className="text-white text-xl" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">
                                                {formData.name || "New Laboratory Profile"}
                                            </h2>
                                            <p className="text-sm text-blue-100 mt-1">
                                                {formData.labType || "Complete the form to create a new lab profile"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${formData.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {formData.isActive ? (
                                                <>
                                                    <FaCheckCircle className="mr-1.5 text-green-500" /> Active
                                                </>
                                            ) : (
                                                <>
                                                    <FaTimesCircle className="mr-1.5 text-gray-500" /> Inactive
                                                </>
                                            )}
                                        </span>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center px-4 py-2 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                                        >
                                            <FaSignOutAlt className="mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Steps */}
                            <div className="px-8 pt-6">
                                <div className="flex items-center justify-between">
                                    {['basic', 'contact', 'legal'].map((tab, index) => (
                                        <React.Fragment key={tab}>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab(tab as 'basic' | 'contact' | 'legal')}
                                                className={`flex flex-col items-center ${activeTab === tab ? 'text-blue-600' : 'text-gray-500'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${activeTab === tab ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
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
                                                <div className={`flex-1 h-0.5 mx-2 ${activeTab === tab || (index === 0 && activeTab === 'legal') ? 'bg-blue-200' : 'bg-gray-200'}`}></div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {activeTab === 'basic' && renderBasicInfoTab()}
                                {activeTab === 'contact' && renderContactInfoTab()}
                                {activeTab === 'legal' && renderLegalInfoTab()}

                                <div className="flex justify-between pt-8 border-t border-gray-200">
                                    {activeTab !== 'basic' && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab(activeTab === 'legal' ? 'contact' : 'basic')}
                                            className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Previous
                                        </button>
                                    )}

                                    {activeTab !== 'legal' ? (
                                        <button
                                            type="button"
                                            onClick={handleNextClick}
                                            className="ml-auto inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Next
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !isFormValid}
                                            className={`ml-auto inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white ${isSubmitting || !isFormValid
                                                ? 'bg-blue-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
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