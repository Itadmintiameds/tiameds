import { Doctor } from '@/types/doctor/doctor';
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
    FaEnvelope,
    FaHospital,
    FaIdCard,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaStethoscope,
    FaUniversity,
    FaUser
} from 'react-icons/fa';
// import Button from '../common/Button';

interface AddDoctorProps {
    handleAddDoctor: (doctor: Doctor) => void;
}

const AddDoctor = ({ handleAddDoctor }: AddDoctorProps) => {
    const [doctor, setDoctor] = useState<Doctor>({
        id: undefined,
        name: '',
        email: '',
        speciality: '',
        qualification: '',
        hospitalAffiliation: '',
        licenseNumber: '',
        phone: 0,
        address: '',
        city: '',
        state: '',
        country: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Validate individual field
    const validateField = (name: string, value: unknown): string => {
        switch (name) {
            case 'name':
                if (typeof value !== 'string') return 'Name must be a valid value';
                if (!value || value.trim() === '') return 'Name is required';
                if (value.length < 2) return 'Name must be at least 2 characters long';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name should contain only alphabets and spaces';
                // Check for leading spaces
                if (value.startsWith(' ')) return 'Name should not start with a space';
                // Check for multiple consecutive spaces
                if (/\s{2,}/.test(value)) return 'Name should not contain multiple consecutive spaces';
                return '';
            
            case 'email':
                if (typeof value !== 'string') return 'Email must be a valid value';
                if (!value || value.trim() === '') return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
                // Check for leading spaces
                if (value.startsWith(' ')) return 'Email should not start with a space';
                return '';
            
            case 'phone':
                if (typeof value === 'number') {
                    if (!value || value.toString().length !== 10) return 'Phone number must be exactly 10 digits';
                    return '';
                } else if (typeof value === 'string') {
                    if (!value || value.trim() === '') return 'Phone is required';
                    if (value.length !== 10) return 'Phone number must be exactly 10 digits';
                    if (!/^\d+$/.test(value)) return 'Phone number must contain only digits';
                    return '';
                } else {
                    return 'Phone must be a valid value';
                }
            
            case 'licenseNumber':
                if (typeof value !== 'string') return 'License number must be a valid value';
                if (!value || value.trim() === '') return 'License number is required';
                if (value.length < 3) return 'License number must be at least 3 characters long';
                if (!/^[a-zA-Z0-9]+$/.test(value)) return 'License number should contain only letters and numbers';
                return '';
            
            case 'hospitalAffiliation':
                if (typeof value !== 'string') return 'Hospital affiliation must be a valid value';
                if (!value || value.trim() === '') return 'Hospital affiliation is required';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'Hospital affiliation should contain only alphabets and spaces';
                // Check for leading spaces
                if (value.startsWith(' ')) return 'Hospital affiliation should not start with a space';
                // Check for multiple consecutive spaces
                if (/\s{2,}/.test(value)) return 'Hospital affiliation should not contain multiple consecutive spaces';
                return '';
            
            case 'address':
                if (typeof value !== 'string') return 'Address must be a valid value';
                if (!value || value.trim() === '') return 'Address is required';
                if (value.length < 5) return 'Address must be at least 5 characters long';
                // Check for leading spaces
                if (value.startsWith(' ')) return 'Address should not start with a space';
                return '';
            
            case 'city':
                if (typeof value !== 'string') return 'City must be a valid value';
                if (!value || value.trim() === '') return 'City is required';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'City should contain only alphabets and spaces';
                // Check for leading spaces
                if (value.startsWith(' ')) return 'City should not start with a space';
                // Check for multiple consecutive spaces
                if (/\s{2,}/.test(value)) return 'City should not contain multiple consecutive spaces';
                return '';
            
            case 'state':
                if (typeof value !== 'string') return 'State must be a valid value';
                if (!value || value.trim() === '') return 'State is required';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'State should contain only alphabets and spaces';
                // Check for leading spaces
                if (value.startsWith(' ')) return 'State should not start with a space';
                // Check for multiple consecutive spaces
                if (/\s{2,}/.test(value)) return 'State should not contain multiple consecutive spaces';
                return '';
            
            case 'country':
                if (typeof value !== 'string') return 'Country must be a valid value';
                if (!value || value.trim() === '') return 'Country is required';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'Country should contain only alphabets and spaces';
                // Check for leading spaces
                if (value.startsWith(' ')) return 'Country should not start with a space';
                // Check for multiple consecutive spaces
                if (/\s{2,}/.test(value)) return 'Country should not contain multiple consecutive spaces';
                return '';
            
            case 'speciality':
                if (typeof value !== 'string') return 'Speciality must be a valid value';
                if (value && !/^[a-zA-Z\s]+$/.test(value)) return 'Speciality should contain only alphabets and spaces';
                // Check for leading spaces
                if (value && value.startsWith(' ')) return 'Speciality should not start with a space';
                // Check for multiple consecutive spaces
                if (value && /\s{2,}/.test(value)) return 'Speciality should not contain multiple consecutive spaces';
                return '';
            
            case 'qualification':
                if (typeof value !== 'string') return 'Qualification must be a valid value';
                if (value && !/^[a-zA-Z\s]+$/.test(value)) return 'Qualification should contain only alphabets and spaces';
                // Check for leading spaces
                if (value && value.startsWith(' ')) return 'Qualification should not start with a space';
                // Check for multiple consecutive spaces
                if (value && /\s{2,}/.test(value)) return 'Qualification should not contain multiple consecutive spaces';
                return '';
            
            default:
                return '';
        }
    };

    // Handle Input Change with Validation
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        if (name === 'phone') {
            // Only allow numeric input for phone (10 digits max)
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setDoctor((prevState) => ({
                ...prevState,
                [name]: numericValue ? parseInt(numericValue) : '',
            }));
        } else if (name === 'email') {
            // Prevent leading spaces for email
            const emailValue = value.replace(/^\s+/, '');
            setDoctor((prevState) => ({
                ...prevState,
                [name]: emailValue,
            }));
        } else if (name === 'name' || name === 'speciality' || name === 'qualification' || 
                   name === 'hospitalAffiliation' || name === 'city' || name === 'state' || name === 'country') {
            // Only allow alphabets and spaces for name fields, prevent leading spaces and multiple consecutive spaces
            const alphabeticValue = value.replace(/[^a-zA-Z\s]/g, '').replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
            setDoctor((prevState) => ({
                ...prevState,
                [name]: alphabeticValue,
            }));
        } else if (name === 'licenseNumber') {
            // Allow alphanumeric for license number
            const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, '');
            setDoctor((prevState) => ({
                ...prevState,
                [name]: alphanumericValue,
            }));
        } else if (name === 'address') {
            // Allow alphanumeric, spaces, and common address characters, prevent leading spaces
            const addressValue = value.replace(/[^a-zA-Z0-9\s.,#-]/g, '').replace(/^\s+/, '');
            setDoctor((prevState) => ({
                ...prevState,
                [name]: addressValue,
            }));
        } else {
            setDoctor((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    // Handle field blur (when user leaves the field)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        
        // Validate the field when user leaves it
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // Form Submission with Validation
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        const allFields = [
            'name', 'email', 'speciality', 'qualification', 'hospitalAffiliation',
            'licenseNumber', 'phone', 'address', 'city', 'state', 'country'
        ];

        // Mark all fields as touched so errors will show
        const allTouched: Record<string, boolean> = {};
        allFields.forEach(field => {
            allTouched[field] = true;
        });
        setTouched(allTouched);

        // Validate all fields
        allFields.forEach(field => {
            const value = doctor[field as keyof Doctor];
            const error = validateField(field, value);
            if (error) {
                newErrors[field] = error;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        handleAddDoctor(doctor);
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-sm">
            {/* Personal Information Section */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <FaUser className="mr-2 text-blue-500" size={16} />
                    Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { label: 'Name', name: 'name', icon: FaUser, type: 'text', placeholder: 'Enter Doctor Name', required: true },
                        { label: 'Email', name: 'email', icon: FaEnvelope, type: 'email', placeholder: 'Enter Doctor Email', required: true },
                        { label: 'Phone', name: 'phone', icon: FaPhoneAlt, type: 'tel', placeholder: 'Enter Doctor Phone Number', required: true },
                    ].map(({ label, name, icon: Icon, type, placeholder, required }) => (
                        <div key={name}>
                            <label htmlFor={name} className="text-xs font-medium text-gray-600 flex items-center mb-1">
                                <Icon className="mr-2 text-blue-500" size={14} /> {label}
                            </label>
                            <input
                                type={type}
                                id={name}
                                name={name}
                                placeholder={placeholder}
                                value={doctor[name as keyof Doctor]?.toString() || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required={required}
                                className={`block w-full px-3 py-2 text-xs border ${errors[name] && touched[name] ? 'border-red-500' : 'border-gray-300'
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white`}
                                {...(name === 'phone' && {
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                    maxLength: 10,
                                    onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                        // Prevent non-numeric characters
                                        if (!/[0-9]/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }
                                })}
                            />
                            {errors[name] && touched[name] && (
                                <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Professional Information Section */}
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                    <FaStethoscope className="mr-2 text-purple-500" size={16} />
                    Professional Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { label: 'Speciality', name: 'speciality', icon: FaStethoscope, type: 'text', placeholder: 'Enter Doctor Speciality', required: false },
                        { label: 'Qualification', name: 'qualification', icon: FaUniversity, type: 'text', placeholder: 'Enter Doctor Qualification', required: false },
                        { label: 'Hospital Affiliation', name: 'hospitalAffiliation', icon: FaHospital, type: 'text', placeholder: 'Enter Hospital Affiliation', required: true },
                        { label: 'License Number', name: 'licenseNumber', icon: FaIdCard, type: 'text', placeholder: 'Enter License Number', required: true },
                    ].map(({ label, name, icon: Icon, type, placeholder, required }) => (
                        <div key={name}>
                            <label htmlFor={name} className="text-xs font-medium text-gray-600 flex items-center mb-1">
                                <Icon className="mr-2 text-purple-500" size={14} /> {label}
                            </label>
                            <input
                                type={type}
                                id={name}
                                name={name}
                                placeholder={placeholder}
                                value={doctor[name as keyof Doctor]?.toString() || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required={required}
                                className={`block w-full px-3 py-2 text-xs border ${errors[name] && touched[name] ? 'border-red-500' : 'border-gray-300'
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white`}
                            />
                            {errors[name] && touched[name] && (
                                <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Address Information Section */}
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-green-500" size={16} />
                    Address Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { label: 'Address', name: 'address', icon: FaMapMarkerAlt, type: 'text', placeholder: 'Enter Doctor Address', required: true },
                        { label: 'City', name: 'city', icon: FaMapMarkerAlt, type: 'text', placeholder: 'Enter Doctor City', required: true },
                        { label: 'State', name: 'state', icon: FaMapMarkerAlt, type: 'text', placeholder: 'Enter Doctor State', required: true },
                        { label: 'Country', name: 'country', icon: FaMapMarkerAlt, type: 'text', placeholder: 'Enter Doctor Country', required: true },
                    ].map(({ label, name, icon: Icon, type, placeholder, required }) => (
                        <div key={name}>
                            <label htmlFor={name} className="text-xs font-medium text-gray-600 flex items-center mb-1">
                                <Icon className="mr-2 text-green-500" size={14} /> {label}
                            </label>
                            <input
                                type={type}
                                id={name}
                                name={name}
                                placeholder={placeholder}
                                value={doctor[name as keyof Doctor]?.toString() || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required={required}
                                className={`block w-full px-3 py-2 text-xs border ${errors[name] && touched[name] ? 'border-red-500' : 'border-gray-300'
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white`}
                            />
                            {errors[name] && touched[name] && (
                                <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center"
                    style={{
                        background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
                    }}
                >
                    <Plus size={18} className="mr-2" />
                    Add Doctor
                </button>
            </div>
        </form>
    );
};

export default AddDoctor;
