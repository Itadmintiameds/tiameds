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
import Button from '../common/Button';

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

    // Handle Input Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDoctor((prevState) => ({
            ...prevState,
            [name]: name === 'phone' ? parseInt(value) || '' : value,
        }));
    };

    // Form Submission with Validation
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        const requiredFields = [
            'name',
            'email',
            'hospitalAffiliation',
            'licenseNumber',
            'phone',
            'address',
            'city',
            'state',
            'country',
        ];

        requiredFields.forEach((field) => {
            if (!doctor[field as keyof Doctor]) {
                newErrors[field] = `${field.replace(/([A-Z])/g, ' $1')} is required`;
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
        <form onSubmit={handleSubmit} noValidate className="space-y-4 bg-gradient-to-r from-white via-gray-100 to-gray-200 p-4 ">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { label: 'Name', name: 'name', icon: FaUser, type: 'text', placeholder: 'Enter Doctor Name', required: true },
                    { label: 'Email', name: 'email', icon: FaEnvelope, type: 'email', placeholder: 'Enter Doctor Email', required: true },
                    { label: 'Speciality', name: 'speciality', icon: FaStethoscope, type: 'text', placeholder: 'Enter Doctor Speciality', required: false },
                    { label: 'Qualification', name: 'qualification', icon: FaUniversity, type: 'text', placeholder: 'Enter Doctor Qualification', required: false },
                    { label: 'Hospital Affiliation', name: 'hospitalAffiliation', icon: FaHospital, type: 'text', placeholder: 'Enter Hospital Affiliation', required: true },
                    { label: 'License Number', name: 'licenseNumber', icon: FaIdCard, type: 'text', placeholder: 'Enter License Number', required: true },
                    { label: 'Phone', name: 'phone', icon: FaPhoneAlt, type: 'number', placeholder: 'Enter Doctor Phone Number', required: true },
                    { label: 'Address', name: 'address', icon: FaMapMarkerAlt, type: 'text', placeholder: 'Enter Doctor Address', required: true },
                    { label: 'City', name: 'city', icon: FaMapMarkerAlt, type: 'text', placeholder: 'Enter Doctor City', required: true },
                    { label: 'State', name: 'state', icon: FaMapMarkerAlt, type: 'text', placeholder: 'Enter Doctor State', required: true },
                    { label: 'Country', name: 'country', icon: FaMapMarkerAlt, type: 'text', placeholder: 'Enter Doctor Country', required: true },
                ].map(({ label, name, icon: Icon, type, placeholder, required }) => (
                    <div key={name} className="mb-2">
                        <label htmlFor={name} className="text-xs font-medium text-gray-700 flex items-center">
                            <Icon className="mr-2 text-gray-500" /> {label}
                        </label>
                        <input
                            type={type}
                            id={name}
                            name={name}
                            placeholder={placeholder}
                            value={doctor[name as keyof Doctor]?.toString() || ''}
                            onChange={handleChange}
                            required={required} // Dynamically apply required attribute
                            className={`mt-1 block w-full p-2 text-xs border ${errors[name] ? 'border-red-500' : 'border-gray-300'
                                } rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
                        />
                        {errors[name] && (
                            <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <Button
                text='Add Doctor'
                onClick={() => { }}
                type="submit"
                className="w-full px-4 py-2 text-xs bg-primary text-textzinc rounded-md hover:bg-primarylight focus:outline-none flex items-center justify-center space-x-2"
            >
                <Plus size={20} />

            </Button>
        </form>
    );
};

export default AddDoctor;
