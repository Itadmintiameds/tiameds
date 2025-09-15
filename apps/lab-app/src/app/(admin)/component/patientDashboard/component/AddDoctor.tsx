import React from 'react';
import { Doctor } from '@/types/doctor/doctor';
import { Plus } from 'lucide-react';
import {
    FaPhoneAlt,
    FaStethoscope,
    FaUser
} from 'react-icons/fa';
import Button from '../../common/Button';

interface AddDoctorProps {
    handleAddDoctor: (doctor: Doctor) => void;
    doctor?: Doctor;
    setDoctor: React.Dispatch<React.SetStateAction<Doctor>>;
    errors: Record<string, string>;
    isDoctorAddedLoading: boolean;
}

const DoctorSpeciality = [
    'Physician',
    'Surgeon',
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
    'Immunology',
    'Nephrology',
    'Hematology',
    'Gastroenterology',
    'Endocrinology',
    'Pulmonology',
    'Rheumatology',
    'Anesthesiology',
    'Radiology',
    'Pathology',
    'Emergency Medicine',
    'Sports Medicine',
    'Plastic Surgery',
    'Rehabilitation Medicine',
    'Infectious Disease',
    'Occupational Medicine',
    'Allergy and Immunology',
    'Critical Care',
    'Geriatrics',
    'Palliative Care',
    'Nuclear Medicine',
    'Sleep Medicine',
    'Pain Management',
    'Clinical Pharmacology',
    'Andrology',
    'Genetics',
    'Others',
];

const AddDoctor = ({ handleAddDoctor, doctor, setDoctor, errors, isDoctorAddedLoading }: AddDoctorProps) => {
    const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: Record<string, string> = {};
        
        // Validation checks
        if (!doctor?.name || doctor.name.toString().trim() === '') {
            newErrors.name = 'Doctor name is required';
        } else {
            // Additional validation: ensure name contains only letters after Dr. prefix
            const nameWithoutPrefix = doctor.name.toString().replace(/^Dr\.\s*/, '').trim();
            if (!nameWithoutPrefix || !/^[a-zA-Z]+$/.test(nameWithoutPrefix)) {
                newErrors.name = 'Doctor name must contain only letters (no numbers, spaces, or special characters)';
            } else if (nameWithoutPrefix.length < 2) {
                newErrors.name = 'Doctor name must be at least 2 characters long';
            }
        }
        
        if (!doctor?.speciality || doctor.speciality.toString().trim() === '') {
            newErrors.speciality = 'Doctor speciality is required';
        } else if (!/^[a-zA-Z]+$/.test(doctor.speciality.toString().trim())) {
            newErrors.speciality = 'Speciality must contain only letters (no numbers, spaces, or special characters)';
        } else if (doctor.speciality.toString().trim().length < 2) {
            newErrors.speciality = 'Speciality must be at least 2 characters long';
        }
        
        // Phone validation: required and must be exactly 10 digits
        if (!doctor?.phone || doctor.phone.toString().trim() === '') {
            newErrors.phone = 'Phone number is required';
        } else if (doctor.phone.toString().length !== 10) {
            newErrors.phone = 'Phone number must be exactly 10 digits';
        }
        
        // Set validation errors
        setValidationErrors(newErrors);
        
        // If there are errors, don't submit
        if (Object.keys(newErrors).length > 0) {
            return;
        }
        
        // Clear any previous errors
        setValidationErrors({});
        
        // Ensure name has Dr. prefix before submitting
        if (doctor?.name) {
            const nameWithPrefix = doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`;
            handleAddDoctor({...doctor, name: nameWithPrefix});
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        // Remove any existing Dr. prefix to avoid duplication
        if (value.startsWith('Dr.')) {
            value = value.substring(3).trim();
        }
        
        // Only allow letters (no numbers, special characters, or spaces)
        value = value.replace(/[^a-zA-Z]/g, '');
        
        // Add Dr. prefix automatically
        value = `Dr. ${value}`;
        
        setDoctor((prevDoctor) => ({
            ...prevDoctor,
            name: value,
        }));
        
        // Clear validation error when user starts typing
        if (validationErrors.name) {
            setValidationErrors(prev => ({ ...prev, name: '' }));
        }
    };

    const handleSpecialityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // Only allow letters (no numbers, spaces, or special characters)
        const cleanValue = value.replace(/[^a-zA-Z]/g, '');
        
        setDoctor((prevDoctor) => ({
            ...prevDoctor,
            speciality: cleanValue,
        }));
        
        // Clear validation error when user starts typing
        if (validationErrors.speciality) {
            setValidationErrors(prev => ({ ...prev, speciality: '' }));
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        
        // Only allow numbers and limit to 10 digits
        const numericValue = value.replace(/\D/g, '').slice(0, 10);
        
        setDoctor((prevDoctor) => ({
            ...prevDoctor,
            phone: numericValue,
        }));
        
        // Clear validation error when user starts typing
        if (validationErrors.phone) {
            setValidationErrors(prev => ({ ...prev, phone: '' }));
        }
    };

    return (
        <form className="space-y-4 p-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                {[
                    { label: 'Name', name: 'name', icon: FaUser, type: 'text', placeholder: 'Enter Doctor Name', required: true },
                    { label: 'Speciality', name: 'speciality', icon: FaStethoscope, type: 'text', placeholder: 'Enter Doctor Speciality', required: true },
                    { label: 'Phone', name: 'phone', icon: FaPhoneAlt, type: 'tel', placeholder: 'Enter Doctor Phone Number', required: true },
                ].map(({ label, name, icon: Icon, type, placeholder, required }) => (
                    <div key={name} className="mb-2">
                        <label htmlFor={name} className="text-xs font-medium text-gray-700 flex items-center">
                            <Icon className="mr-2 text-gray-500" /> {label}
                            {required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {label === 'Speciality' ? (
                            <>
                                <input
                                    list="speciality-options"
                                    type={type}
                                    id={name}
                                    name={name}
                                    placeholder={placeholder}
                                    value={doctor?.[name as keyof Doctor]?.toString() || ''}
                                    onChange={handleSpecialityChange}
                                    required={required}
                                    className={`mt-1 block w-full p-2 text-xs border ${errors[name] || validationErrors[name] ? 'border-red-500' : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                                />
                                <datalist id="speciality-options">
                                    {DoctorSpeciality.map((speciality) => (
                                        <option key={speciality} value={speciality} />
                                    ))}
                                </datalist>
                                {(errors[name] || validationErrors[name]) && (
                                    <p className="text-xs text-red-500 mt-1">{errors[name] || validationErrors[name]}</p>
                                )}
                            </>
                        ) : label === 'Name' ? (
                            <>
                                <input
                                    type={type}
                                    id={name}
                                    name={name}
                                    placeholder={placeholder}
                                    value={doctor?.[name as keyof Doctor]?.toString() || ''}
                                    onChange={handleNameChange}
                                    required={required}
                                    className={`mt-1 block w-full p-2 text-xs border ${errors[name] || validationErrors[name] ? 'border-red-500' : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                                />
                                {(errors[name] || validationErrors[name]) && (
                                    <p className="text-xs text-red-500 mt-1">{errors[name] || validationErrors[name]}</p>
                                )}
                            </>
                                                 ) : (
                             <>
                                 <input
                                     type={type}
                                     id={name}
                                     name={name}
                                     placeholder={placeholder}
                                     value={doctor?.[name as keyof Doctor]?.toString() || ''}
                                     onChange={handlePhoneChange}
                                     maxLength={10}
                                     required={required}
                                     className={`mt-1 block w-full p-2 text-xs border ${errors[name] || validationErrors[name] ? 'border-red-500' : 'border-gray-300'
                                         } rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                                 />
                                 {(errors[name] || validationErrors[name]) && (
                                     <p className="text-xs text-red-500 mt-1">{errors[name] || validationErrors[name]}</p>
                                 )}
                             </>
                         )}
                    </div>
                ))}
            </div>
            {
                isDoctorAddedLoading ? (
                    <Button
                        text='Adding Doctor...'
                        type="submit"
                        onClick={() => {}}
                        className="w-full px-4 py-2 text-xs bg-primary text-textzinc rounded-md hover:bg-primarylight focus:outline-none flex items-center justify-center space-x-2"
                        disabled
                    >
                        <Plus size={20} />
                    </Button>
                ) : (
                    <Button
                        text='Add Doctor'
                        type="submit"
                        onClick={() => {}}
                        className="w-full px-4 py-2 text-xs bg-primary text-textzinc rounded-md hover:bg-primarylight focus:outline-none flex items-center justify-center space-x-2"
                    >
                        <Plus size={20} />
                    </Button>
                )
            }
        </form>
    );
};

export default AddDoctor;