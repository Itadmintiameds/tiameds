import { Doctor } from '@/types/doctor/doctor';
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddDoctorProps {
    handleAddDoctor: (doctor: Doctor) => void;
}

const DOCTOR_SPECIALITIES = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Gynecology',
    'Oncology',
    'Ophthalmology',
    'ENT',
    'Psychiatry',
    'Urology',
    'Dentistry',
    'General Medicine',
    'General Surgery',
    'Physiotherapy',
    'Homeopathy',
    'Ayurveda',
    'Unani',
    'Naturopathy',
    'Siddha',
    'Others',
];

const DOCTOR_QUALIFICATIONS = [
    'MBBS',
    'MD',
    'DNB',
    'MS',
    'DM',
    'MCh',
    'BDS',
    'MDS',
    'BAMS',
    'BHMS',
    'BUMS',
    'BNYS',
    'BSMS',
    'Others',
];

const AddDoctor = ({ handleAddDoctor }: AddDoctorProps) => {
    const [doctor, setDoctor] = useState<Doctor>({
        id: undefined,
        name: '',
        email: '',
        speciality: '',
        qualification: '',
        hospitalAffiliation: '',
        licenseNumber: '',
        phone: undefined,
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
                if (value === undefined || value === null || value === '') return 'Phone is required';
                if (typeof value === 'number') {
                    if (value.toString().length !== 10) return 'Phone number must be exactly 10 digits';
                    return '';
                } else if (typeof value === 'string') {
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

            default:
                return '';
        }
    };

    // Handle Input/Select Change with Validation
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                [name]: numericValue ? parseInt(numericValue, 10) : undefined,
            }));
        } else if (name === 'email') {
            // Prevent leading spaces for email
            const emailValue = value.replace(/^\s+/, '');
            setDoctor((prevState) => ({
                ...prevState,
                [name]: emailValue,
            }));
        } else if (name === 'name' || name === 'hospitalAffiliation' || name === 'city' || name === 'state' || name === 'country') {
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
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const inputClass = (name: string) =>
        `w-full border rounded-full border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 ${errors[name] && touched[name] ? 'border-red-400' : ''
        }`;

    const labelClass = 'text-sm font-medium text-gray-600 mb-1.5 block';

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-3 text-sm">
            {/* Personal Information Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
                    Personal Information
                </p>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className={labelClass}>
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter Doctor Name"
                                value={doctor.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('name')}
                            />
                            {errors.name && touched.name && (
                                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="email" className={labelClass}>
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter Doctor Email"
                                value={doctor.email || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('email')}
                            />
                            {errors.email && touched.email && (
                                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="phone" className={labelClass}>
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                placeholder="Enter Doctor Phone Number"
                                value={doctor.phone?.toString() || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={10}
                                onKeyPress={(e) => {
                                    if (!/[0-9]/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                className={inputClass('phone')}
                            />
                            {errors.phone && touched.phone && (
                                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Professional Information Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
                    Professional Information
                </p>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="speciality" className={labelClass}>
                                Speciality
                            </label>
                            <div className="relative">
                                <select
                                    id="speciality"
                                    name="speciality"
                                    value={doctor.speciality || ''}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`${inputClass('speciality')} bg-white appearance-none`}
                                >
                                    <option value="">Select Speciality</option>
                                    {DOCTOR_SPECIALITIES.map((speciality) => (
                                        <option key={speciality} value={speciality}>
                                            {speciality}
                                        </option>
                                    ))}
                                </select>
                                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {errors.speciality && touched.speciality && (
                                <p className="text-xs text-red-500 mt-1">{errors.speciality}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="qualification" className={labelClass}>
                                Qualification
                            </label>
                            <div className="relative">
                                <select
                                    id="qualification"
                                    name="qualification"
                                    value={doctor.qualification || ''}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`${inputClass('qualification')} bg-white appearance-none`}
                                >
                                    <option value="">Select Qualification</option>
                                    {DOCTOR_QUALIFICATIONS.map((qualification) => (
                                        <option key={qualification} value={qualification}>
                                            {qualification}
                                        </option>
                                    ))}
                                </select>
                                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {errors.qualification && touched.qualification && (
                                <p className="text-xs text-red-500 mt-1">{errors.qualification}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="hospitalAffiliation" className={labelClass}>
                                Hospital Affiliation <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="hospitalAffiliation"
                                name="hospitalAffiliation"
                                placeholder="Enter Hospital Affiliation"
                                value={doctor.hospitalAffiliation || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('hospitalAffiliation')}
                            />
                            {errors.hospitalAffiliation && touched.hospitalAffiliation && (
                                <p className="text-xs text-red-500 mt-1">{errors.hospitalAffiliation}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="licenseNumber" className={labelClass}>
                                License Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="licenseNumber"
                                name="licenseNumber"
                                placeholder="Enter License Number"
                                value={doctor.licenseNumber || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('licenseNumber')}
                            />
                            {errors.licenseNumber && touched.licenseNumber && (
                                <p className="text-xs text-red-500 mt-1">{errors.licenseNumber}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Information Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
                    Address Information
                </p>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="address" className={labelClass}>
                                Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                placeholder="Enter Doctor Address"
                                value={doctor.address || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('address')}
                            />
                            {errors.address && touched.address && (
                                <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="city" className={labelClass}>
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                placeholder="Enter Doctor City"
                                value={doctor.city || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('city')}
                            />
                            {errors.city && touched.city && (
                                <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="state" className={labelClass}>
                                State <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                placeholder="Enter Doctor State"
                                value={doctor.state || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('state')}
                            />
                            {errors.state && touched.state && (
                                <p className="text-xs text-red-500 mt-1">{errors.state}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="country" className={labelClass}>
                                Country <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                placeholder="Enter Doctor Country"
                                value={doctor.country || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('country')}
                            />
                            {errors.country && touched.country && (
                                <p className="text-xs text-red-500 mt-1">{errors.country}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-400 text-right">
                <span className="text-red-500">*</span> indicates required fields
            </p>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-medium text-white rounded-full transition-all duration-200 flex items-center"
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
