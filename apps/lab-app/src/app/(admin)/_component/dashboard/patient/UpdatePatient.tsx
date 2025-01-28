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
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Example validation logic
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.city) newErrors.city = 'City is required';

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
                    {label:'gender',name:'gender',icon:FaUser,type:'text'}, 
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
                            className={`mt-1 block w-full p-2 text-xs border ${
                                errors[name] ? 'border-red-500' : 'border-gray-300'
                            } rounded-md`}
                        />
                        {errors[name] && (
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
