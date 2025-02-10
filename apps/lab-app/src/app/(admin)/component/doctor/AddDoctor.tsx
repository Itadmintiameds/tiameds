import { Doctor } from '@/types/doctor/doctor';
import React, { useState } from 'react';

import { Plus } from 'lucide-react';
import {
    FaEnvelope,
    FaHospital, FaIdCard,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaStethoscope, FaUniversity,
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
    const [errors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDoctor((prevState) => ({
            ...prevState,
            [name]: name === 'phone' ? parseInt(value) || '' : value,
        }));
    };

    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault();

    //     // Validate using Zod schema
    //     const validation = doctorSchema.safeParse(doctor);

    //     if (!validation.success) {
    //         const fieldErrors = validation.error.errors.reduce((acc, error) => {
    //             if (error.path[0]) {
    //                 acc[error.path[0] as string] = error.message;
    //             }
    //             return acc;
    //         }, {} as Record<string, string>);
    //         setErrors(fieldErrors);
    //     } else {
    //         setErrors({});
    //         handleAddDoctor(doctor);
    //     }
    // };

    return (
        <form  className="space-y-4 bg-gradient-to-r from-white via-gray-100 to-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { label: 'Name', name: 'name', icon: FaUser, type: 'text' ,placeholder:'Enter Doctor Name'},
                    { label: 'Email', name: 'email', icon: FaEnvelope, type: 'email' ,placeholder:'Enter Doctor Email'},
                    { label: 'Speciality', name: 'speciality', icon: FaStethoscope, type: 'text' ,placeholder:'Enter Doctor Speciality'},
                    { label: 'Qualification', name: 'qualification', icon: FaUniversity, type: 'text',placeholder:'Enter Doctor Qualification' },
                    { label: 'Hospital Affiliation', name: 'hospitalAffiliation', icon: FaHospital, type: 'text' ,placeholder:'Enter Hospital Affiliation'},
                    { label: 'License Number', name: 'licenseNumber', icon: FaIdCard, type: 'text' ,placeholder:'Enter License Number'},
                    { label: 'Phone', name: 'phone', icon: FaPhoneAlt, type: 'number' ,placeholder:'Enter Doctor Phone Number'},
                    { label: 'Address', name: 'address', icon: FaMapMarkerAlt, type: 'text' ,placeholder:'Enter Doctor Address'},
                    { label: 'City', name: 'city', icon: FaMapMarkerAlt, type: 'text' ,placeholder:'Enter Doctor City'},
                    { label: 'State', name: 'state', icon: FaMapMarkerAlt, type: 'text' ,placeholder:'Enter Doctor State'},
                    { label: 'Country', name: 'country', icon: FaMapMarkerAlt, type: 'text' ,placeholder:'Enter Doctor Country'},
                ].map(({ label, name, icon: Icon, type }) => (
                    <div key={name} className="mb-2">
                        <label htmlFor={name} className="text-xs font-medium text-gray-700 flex items-center">
                            <Icon className="mr-2" /> {label}
                        </label>
                        <input
                            type={type}
                            id={name}
                            name={name}
                            placeholder={label}
                            value={doctor[name as keyof Doctor]?.toString() || ''}
                            onChange={handleChange}
                            className={`mt-1 block w-full p-2 text-xs border ${errors[name] ? 'border-red-500' : 'border-gray-300'
                                } rounded-md`}
                        />
                        {errors[name] && (
                            <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
                        )}
                    </div>
                ))}
            </div>

            <Button
                text=""
                type="submit"
                onClick={() => handleAddDoctor(doctor)}
                className="w-full px-4 py-1 text-xs bg-primary text-white rounded-md hover:bg-button-tertiary focus:outline-none flex items-center justify-center space-x-2"
            >
                <Plus size={20} />
                <span>Add Doctor</span>
            </Button>

        </form>
    );
};

export default AddDoctor;

