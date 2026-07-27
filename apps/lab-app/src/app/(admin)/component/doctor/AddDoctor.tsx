import { Doctor } from '@/types/doctor/doctor';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import {
    FaCity,
    FaEnvelope,
    FaFlag,
    FaGraduationCap,
    FaHospital,
    FaIdCard,
    FaMapMarkerAlt,
    FaPhone,
    FaStethoscope,
    FaTimes,
    FaUser,
} from 'react-icons/fa';

interface AddDoctorProps {
    handleAddDoctor: (doctor: Doctor) => void;
    closeModal?: () => void;
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

const AddDoctor = ({ handleAddDoctor, closeModal }: AddDoctorProps) => {
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
                if (value.startsWith(' ')) return 'Name should not start with a space';
                if (/\s{2,}/.test(value)) return 'Name should not contain multiple consecutive spaces';
                return '';

            case 'email':
                if (typeof value !== 'string') return 'Email must be a valid value';
                if (!value || value.trim() === '') return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
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
                if (value.startsWith(' ')) return 'Hospital affiliation should not start with a space';
                if (/\s{2,}/.test(value)) return 'Hospital affiliation should not contain multiple consecutive spaces';
                return '';

            case 'address':
                if (typeof value !== 'string') return 'Address must be a valid value';
                if (!value || value.trim() === '') return 'Address is required';
                if (value.length < 5) return 'Address must be at least 5 characters long';
                if (value.startsWith(' ')) return 'Address should not start with a space';
                return '';

            case 'city':
                if (typeof value !== 'string') return 'City must be a valid value';
                if (!value || value.trim() === '') return 'City is required';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'City should contain only alphabets and spaces';
                if (value.startsWith(' ')) return 'City should not start with a space';
                if (/\s{2,}/.test(value)) return 'City should not contain multiple consecutive spaces';
                return '';

            case 'state':
                if (typeof value !== 'string') return 'State must be a valid value';
                if (!value || value.trim() === '') return 'State is required';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'State should contain only alphabets and spaces';
                if (value.startsWith(' ')) return 'State should not start with a space';
                if (/\s{2,}/.test(value)) return 'State should not contain multiple consecutive spaces';
                return '';

            case 'country':
                if (typeof value !== 'string') return 'Country must be a valid value';
                if (!value || value.trim() === '') return 'Country is required';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'Country should contain only alphabets and spaces';
                if (value.startsWith(' ')) return 'Country should not start with a space';
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
        `w-full rounded-lg border border-pneutral-200 pl-9 pr-4 py-2 text-p3 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 bg-white ${errors[name] && touched[name] ? 'border-warning-500' : ''
        }`;

    const labelClass = 'block text-p3 font-medium text-pneutral-900 mb-1.5';

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Personal Information Section */}
            <div className="bg-info-50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-info-700 text-p3 flex items-center gap-2">
                    <FaUser className="text-info-600" size={16} />
                    Personal Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className={labelClass}>
                            Name <span className="text-warning-500">*</span>
                        </label>
                        <div className="relative">
                            <FaUser className="absolute top-1/2 -translate-y-1/2 left-3 text-pneutral-400" size={14} />
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter doctor name"
                                value={doctor.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('name')}
                            />
                        </div>
                        {errors.name && touched.name && (
                            <p className="text-xs text-warning-500 mt-1">{errors.name}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="email" className={labelClass}>
                            Email <span className="text-warning-500">*</span>
                        </label>
                        <div className="relative">
                            <FaEnvelope className="absolute top-1/2 -translate-y-1/2 left-3 text-pneutral-400" size={14} />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter doctor email"
                                value={doctor.email || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('email')}
                            />
                        </div>
                        {errors.email && touched.email && (
                            <p className="text-xs text-warning-500 mt-1">{errors.email}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="phone" className={labelClass}>
                        Phone <span className="text-warning-500">*</span>
                    </label>
                    <div className="relative">
                        <FaPhone className="absolute top-1/2 -translate-y-1/2 left-3 text-pneutral-400" size={14} />
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="Enter doctor phone number"
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
                    </div>
                    {errors.phone && touched.phone && (
                        <p className="text-xs text-warning-500 mt-1">{errors.phone}</p>
                    )}
                </div>
            </div>

            {/* Professional Information Section */}
            <div className="bg-danger-100 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-warning-800 text-p3 flex items-center gap-2">
                    <FaStethoscope className="text-success-800" size={16} />
                    Professional Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="speciality" className={labelClass}>
                            Speciality
                        </label>
                        <div className="relative">
                            <FaStethoscope className="absolute top-1/2 -translate-y-1/2 left-3 text-pneutral-400 z-10" size={14} />
                            <select
                                id="speciality"
                                name="speciality"
                                value={doctor.speciality || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`${inputClass('speciality')} appearance-none`}
                            >
                                <option value="">Select speciality</option>
                                {DOCTOR_SPECIALITIES.map((speciality) => (
                                    <option key={speciality} value={speciality}>
                                        {speciality}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.speciality && touched.speciality && (
                            <p className="text-xs text-warning-500 mt-1">{errors.speciality}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="qualification" className={labelClass}>
                            Qualification
                        </label>
                        <div className="relative">
                            <FaGraduationCap className="absolute top-1/2 -translate-y-1/2 left-3 text-pneutral-400 z-10" size={14} />
                            <select
                                id="qualification"
                                name="qualification"
                                value={doctor.qualification || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`${inputClass('qualification')} appearance-none`}
                            >
                                <option value="">Select qualification</option>
                                {DOCTOR_QUALIFICATIONS.map((qualification) => (
                                    <option key={qualification} value={qualification}>
                                        {qualification}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.qualification && touched.qualification && (
                            <p className="text-xs text-warning-500 mt-1">{errors.qualification}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="hospitalAffiliation" className={labelClass}>
                            Hospital Affiliation <span className="text-warning-500">*</span>
                        </label>
                        <div className="relative">
                            <FaHospital className="absolute top-1/2 -translate-y-1/2 left-3 text-pneutral-400" size={14} />
                            <input
                                type="text"
                                id="hospitalAffiliation"
                                name="hospitalAffiliation"
                                placeholder="Enter hospital affiliation"
                                value={doctor.hospitalAffiliation || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('hospitalAffiliation')}
                            />
                        </div>
                        {errors.hospitalAffiliation && touched.hospitalAffiliation && (
                            <p className="text-xs text-warning-500 mt-1">{errors.hospitalAffiliation}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="licenseNumber" className={labelClass}>
                            License Number <span className="text-warning-500">*</span>
                        </label>
                        <div className="relative">
                            <FaIdCard className="absolute top-1/2 -translate-y-1/2 left-3 text-pneutral-400" size={14} />
                            <input
                                type="text"
                                id="licenseNumber"
                                name="licenseNumber"
                                placeholder="Enter license number"
                                value={doctor.licenseNumber || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('licenseNumber')}
                            />
                        </div>
                        {errors.licenseNumber && touched.licenseNumber && (
                            <p className="text-xs text-warning-500 mt-1">{errors.licenseNumber}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Address Information Section */}
            <div className="bg-success-50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-success-800 text-p3 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-success-700" size={16} />
                    Address Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="address" className={labelClass}>
                            Address <span className="text-warning-500">*</span>
                        </label>
                        <div className="relative">
                            <FaMapMarkerAlt className="absolute top-1/2 -translate-y-1/2 left-3 text-pneutral-400" size={14} />
                            <input
                                type="text"
                                id="address"
                                name="address"
                                placeholder="Enter doctor address"
                                value={doctor.address || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('address')}
                            />
                        </div>
                        {errors.address && touched.address && (
                            <p className="text-xs text-warning-500 mt-1">{errors.address}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="city" className={labelClass}>
                            City <span className="text-warning-500">*</span>
                        </label>
                        <div className="relative">
                            <FaCity className="absolute top-1/2 -translate-y-1/2 left-3 text-pneutral-400" size={14} />
                            <input
                                type="text"
                                id="city"
                                name="city"
                                placeholder="Enter doctor city"
                                value={doctor.city || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('city')}
                            />
                        </div>
                        {errors.city && touched.city && (
                            <p className="text-xs text-warning-500 mt-1">{errors.city}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="state" className={labelClass}>
                            State <span className="text-warning-500">*</span>
                        </label>
                        <div className="relative">
                            <FaMapMarkerAlt className="absolute top-1/2 -translate-y-1/2 left-3 text-pneutral-400" size={14} />
                            <input
                                type="text"
                                id="state"
                                name="state"
                                placeholder="Enter doctor state"
                                value={doctor.state || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('state')}
                            />
                        </div>
                        {errors.state && touched.state && (
                            <p className="text-xs text-warning-500 mt-1">{errors.state}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="country" className={labelClass}>
                            Country <span className="text-warning-500">*</span>
                        </label>
                        <div className="relative">
                            <FaFlag className="absolute top-1/2 -translate-y-1/2 left-3 text-pneutral-400" size={14} />
                            <input
                                type="text"
                                id="country"
                                name="country"
                                placeholder="Enter doctor country"
                                value={doctor.country || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={inputClass('country')}
                            />
                        </div>
                        {errors.country && touched.country && (
                            <p className="text-xs text-warning-500 mt-1">{errors.country}</p>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-xs text-pneutral-400 text-right">
                <span className="text-warning-500">*</span> indicates required fields
            </p>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2 border-t border-pneutral-200">
                {closeModal && (
                    <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-p3 border border-pneutral-400 font-medium text-pneutral-700 bg-pneutral-50 rounded-full flex items-center gap-1"
                    >
                        <FaTimes size={16} />
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="px-4 py-2 text-p3 font-medium text-pneutral-50 bg-secondary-700 rounded-full flex items-center gap-1"
                >
                    <Plus size={16} />
                    Add Doctor
                </button>
            </div>
        </form>
    );
};

export default AddDoctor;
