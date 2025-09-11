import React, { useState } from 'react';
import { Patient } from '@/types/patient/patient';
import {
    FaUser, FaEnvelope, FaPhone, FaMapMarkedAlt, FaCity,
    FaMapPin, FaTint, FaBirthdayCake
} from 'react-icons/fa';
import Button from '../../common/Button';

interface PatientProps {
    handleUpdate: (updatedPatient: Patient) => Promise<void>;
    patient: Patient;
}



const UpdatePatient: React.FC<PatientProps> = ({ handleUpdate, patient }) => {
    const [formData, setFormData] = useState<Patient>(patient);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Validate individual field
    const validateField = (name: string, value: unknown): string => {
        // Type guard to ensure value is a string
        if (typeof value !== 'string') {
            return `${name} must be a valid value`;
        }

        switch (name) {
            case 'firstName':
                if (!value || value.trim() === '') return 'First name is required';
                if (value.length < 2) return 'First name must be at least 2 characters long';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'First name should contain only alphabets and spaces';
                return '';
            
            case 'lastName':
                if (!value || value.trim() === '') return 'Last name is required';
                if (value.length < 2) return 'Last name must be at least 2 characters long';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'Last name should contain only alphabets and spaces';
                return '';
            
            case 'email':
                if (!value || value.trim() === '') return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
                return '';
            
            case 'phone':
                if (!value || value.trim() === '') return 'Phone number is required';
                if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) return 'Phone number must be exactly 10 digits';
                return '';
            
            case 'gender':
                if (!value || value.trim() === '') return 'Gender is required';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'Gender should contain only alphabets and spaces';
                return '';
            
            case 'city':
                if (!value || value.trim() === '') return 'City is required';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'City should contain only alphabets and spaces';
                return '';
            
            case 'state':
                if (!value || value.trim() === '') return 'State is required';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'State should contain only alphabets and spaces';
                return '';
            
            case 'zip':
                if (!value || value.trim() === '') return 'ZIP code is required';
                if (!/^\d{6}$/.test(value.replace(/\D/g, ''))) return 'ZIP code must be exactly 6 digits';
                return '';
            
            case 'bloodGroup':
                if (!value || value.trim() === '') return 'Blood group is required';
                if (!/^[a-zA-Z\s+-]+$/.test(value)) return 'Blood group should contain only letters, spaces, + and -';
                return '';
            
            case 'dateOfBirth':
                if (!value || value.trim() === '') return 'Date of birth is required';
                const birthDate = new Date(value);
                const today = new Date();
                if (birthDate > today) return 'Date of birth cannot be in the future';
                if (today.getFullYear() - birthDate.getFullYear() > 100) return 'Date of birth cannot be more than 100 years ago';
                return '';
            
            case 'address':
                if (!value || value.trim() === '') return 'Address is required';
                if (value.length < 5) return 'Address must be at least 5 characters long';
                return '';
            
            default:
                return '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        if (name === 'phone') {
            // Only allow numeric input for phone (10 digits max)
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData((prevState) => ({
                ...prevState,
                [name]: numericValue,
            }));
        } else if (name === 'zip') {
            // Only allow numeric input for ZIP (6 digits max)
            const numericValue = value.replace(/\D/g, '').slice(0, 6);
            setFormData((prevState) => ({
                ...prevState,
                [name]: numericValue,
            }));
        } else if (name === 'firstName' || name === 'lastName' || name === 'gender' || 
                   name === 'city' || name === 'state' || name === 'bloodGroup') {
            // Only allow alphabets and spaces for name fields
            const alphabeticValue = value.replace(/[^a-zA-Z\s+-]/g, '');
            setFormData((prevState) => ({
                ...prevState,
                [name]: alphabeticValue,
            }));
        } else if (name === 'address') {
            // Allow alphanumeric, spaces, and common address characters
            const addressValue = value.replace(/[^a-zA-Z0-9\s.,#-]/g, '');
            setFormData((prevState) => ({
                ...prevState,
                [name]: addressValue,
            }));
        } else {
            setFormData((prevState) => ({
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

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        const allFields = [
            'firstName', 'lastName', 'email', 'phone', 'gender', 
            'address', 'city', 'state', 'zip', 'bloodGroup', 'dateOfBirth'
        ];

        // Validate all fields
        allFields.forEach(field => {
            const value = formData[field as keyof Patient];
            const error = validateField(field, value);
            if (error) {
                newErrors[field] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await handleUpdate(formData);
        } catch (error) {
            setErrors({ global: 'Failed to update patient. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-gradient-to-r from-white via-gray-100 to-gray-200 p-6 rounded-md"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { label: 'First Name', name: 'firstName', icon: FaUser, type: 'text' },
                    { label: 'Last Name', name: 'lastName', icon: FaUser, type: 'text' },
                    { label: 'gender', name: 'gender', icon: FaUser, type: 'text' },
                    { label: 'Email', name: 'email', icon: FaEnvelope, type: 'email' },
                    { label: 'Phone', name: 'phone', icon: FaPhone, type: 'text' },
                    { label: 'Address', name: 'address', icon: FaMapMarkedAlt, type: 'text' },
                    { label: 'City', name: 'city', icon: FaCity, type: 'text' },
                    { label: 'State', name: 'state', icon: FaMapPin, type: 'text' },
                    { label: 'Zip', name: 'zip', icon: FaMapPin, type: 'text' },
                    { label: 'Blood Group', name: 'bloodGroup', icon: FaTint, type: 'text' },
                    { label: 'Date of Birth', name: 'dateOfBirth', icon: FaBirthdayCake, type: 'date' },
                ].map(({ label, name, icon: Icon, type }) => (
                    <div key={name} className="mb-2">
                        <label htmlFor={name} className="text-xs font-medium text-gray-700 flex items-center">
                            <Icon className="mr-2" /> {label}
                        </label>
                        <input
                            type={type}
                            id={name}
                            name={name}
                            value={formData[name as keyof Patient]?.toString() || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`mt-1 block w-full p-2 text-xs border ${errors[name] && touched[name] ? 'border-red-500' : 'border-gray-300'
                                } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            {...(name === 'phone' && {
                                inputMode: 'numeric',
                                pattern: '[0-9]*',
                                maxLength: 10,
                                onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }
                            })}
                            {...(name === 'zip' && {
                                inputMode: 'numeric',
                                pattern: '[0-9]*',
                                maxLength: 6,
                                onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => {
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

            {errors.global && (
                <p className="text-xs text-red-500 text-center">{errors.global}</p>
            )}

            <Button
                text={isSubmitting ? 'Updating...' : 'Update Patient'}
                type="submit"
                onClick={() => null}
                className="w-full px-4 py-2 text-xs bg-button-tertiary text-white rounded-md hover:bg-button-tertiary-dark focus:outline-none flex items-center justify-center space-x-2"
                disabled={isSubmitting}
            />
        </form>
    );
};

export default UpdatePatient;
