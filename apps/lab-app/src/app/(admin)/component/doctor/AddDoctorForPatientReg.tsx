import { Doctor } from '@/types/doctor/doctor';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import {
    FaPhone,
    FaStethoscope,
    FaTimes,
    FaUser,
} from 'react-icons/fa';

interface AddDoctorForPatientRegProps {
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

const AddDoctorForPatientReg = ({ handleAddDoctor, closeModal }: AddDoctorForPatientRegProps) => {
    const [doctor, setDoctor] = useState<Doctor>({
        id: undefined,
        name: '',
        speciality: '',
        phone: undefined,
        // Not shown in this quick-add form, but the backend expects these keys to be
        // present on create (same shape as the full AddDoctor form sends) — kept blank.
        email: '',
        qualification: '',
        hospitalAffiliation: '',
        licenseNumber: '',
        address: '',
        city: '',
        state: '',
        country: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

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

            case 'phone':
                if (value === undefined || value === null || value === '') return 'Phone number is required';
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

            default:
                return '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setDoctor((prevState) => ({
                ...prevState,
                [name]: numericValue ? parseInt(numericValue, 10) : undefined,
            }));
        } else if (name === 'name') {
            const alphabeticValue = value.replace(/[^a-zA-Z\s]/g, '').replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
            setDoctor((prevState) => ({
                ...prevState,
                [name]: alphabeticValue,
            }));
        } else {
            setDoctor((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const allFields = ['name', 'phone'];

        const allTouched: Record<string, boolean> = {};
        allFields.forEach(field => {
            allTouched[field] = true;
        });
        setTouched(allTouched);

        const newErrors: Record<string, string> = {};
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

        // Store/display the name with the "Dr." prefix the form shows but doesn't let
        // the user edit or delete.
        handleAddDoctor({ ...doctor, name: `Dr. ${doctor.name.trim()}` });
    };

    const inputClass = (name: string) =>
        `w-full rounded-lg border border-pneutral-200 pl-9 pr-4 py-2 text-p3 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 bg-white ${errors[name] && touched[name] ? 'border-warning-500' : ''
        }`;

    const labelClass = 'block text-p3 font-medium text-pneutral-900 mb-1.5';

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="bg-info-50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-info-700 text-p3 flex items-center gap-2">
                    <FaUser className="text-info-600" size={16} />
                    Doctor Details
                </h4>

                <div>
                    <label htmlFor="name" className={labelClass}>
                        Name <span className="text-warning-500">*</span>
                    </label>
                    <div className={`flex items-stretch rounded-lg border border-pneutral-200 bg-white overflow-hidden focus-within:border-secondary-500 focus-within:ring-1 focus-within:ring-secondary-500 ${errors.name && touched.name ? 'border-warning-500' : ''}`}>
                        <span className="flex items-center gap-1.5 pl-3 pr-2 text-p3 font-medium text-pneutral-500 bg-pneutral-50 border-r border-pneutral-200">
                            <FaUser className="text-pneutral-400" size={12} />
                            Dr.
                        </span>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Enter doctor name"
                            value={doctor.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className="flex-1 px-3 py-2 text-p3 focus:outline-none bg-white"
                        />
                    </div>
                    {errors.name && touched.name && (
                        <p className="text-xs text-warning-500 mt-1">{errors.name}</p>
                    )}
                </div>

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
                    </div>
                    <div>
                        <label htmlFor="phone" className={labelClass}>
                            Phone Number <span className="text-warning-500">*</span>
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
            </div>

            <p className="text-xs text-pneutral-400 text-right">
                <span className="text-warning-500">*</span> indicates required fields
            </p>

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

export default AddDoctorForPatientReg;
