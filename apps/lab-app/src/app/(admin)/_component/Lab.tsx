'use client';

import React, { useState } from 'react';
import {
    FaFlask,
    FaMapMarkerAlt,
    FaCity,
    FaRegFileAlt,
    FaGlobe,
    FaPaperPlane,
} from 'react-icons/fa';
import { LabFormData } from '@/types/LabFormData';
import { labFormDataSchema } from '@/schema/labFromDataSchema';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { createLab } from '@/../services/labServices';

const Lab = () => {

    
    const [formData, setFormData] = useState<LabFormData>({
        name: '',
        address: '',
        city: '',
        state: '',
        description: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof LabFormData, string>>>({});

    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' })); // Clear errors for the field
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Validate formData using Zod schema
            labFormDataSchema.parse(formData);
            console.log('Validated Lab Data:', formData);

            // Call API to create lab
            await createLab(formData);

            // Success message (move this here to avoid redundancy)
            toast.success('Lab created successfully', { position: 'top-right', autoClose: 3000 });
            
            

        } catch (error) {
            // Handle Zod validation errors
            if (error instanceof z.ZodError) {
                const fieldErrors = error.errors.reduce(
                    (acc, curr) => ({ ...acc, [curr.path[0] as keyof LabFormData]: curr.message }),
                    {}
                );
                setErrors(fieldErrors);
            }
            // Handle other errors (e.g., API errors)
            else {
                toast.error('An unexpected error occurred');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-indigo-800 flex items-center justify-center px-4">
            <div className="bg-white shadow-lg rounded-lg w-full max-w-md">
                {/* Header */}
                <div className="bg-indigo-950 text-white rounded-t-lg py-4 px-6">
                    <h1 className="text-xl font-semibold flex items-center">
                        <FaFlask className="text-white mr-2" /> Create New Lab
                    </h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {[
                        { id: 'name', label: 'Lab Name', icon: FaFlask, placeholder: 'Enter the lab name' },
                        { id: 'address', label: 'Address', icon: FaMapMarkerAlt, placeholder: 'Enter the lab address' },
                        { id: 'city', label: 'City', icon: FaCity, placeholder: 'Enter the city' },
                        { id: 'state', label: 'State', icon: FaGlobe, placeholder: 'Enter the state' },
                    ].map(({ id, label, icon: Icon, placeholder }) => (
                        <div key={id} className="w-full">
                            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                                {label}
                            </label>
                            <div className="relative">
                                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    type="text"
                                    id={id}
                                    name={id}
                                    value={formData[id as keyof LabFormData]}
                                    onChange={handleInputChange}
                                    className={`block w-full pl-10 pr-3 py-2 text-sm border ${errors[id as keyof LabFormData]
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                        } rounded-md shadow-sm text-gray-800`}
                                    placeholder={placeholder}
                                />
                                {errors[id as keyof LabFormData] && (
                                    <p className="text-red-500 text-xs mt-1">{errors[id as keyof LabFormData]}</p>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Description Field */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <div className="relative">
                            <FaRegFileAlt className="absolute left-3 top-3 text-gray-400 text-sm" />
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className={`block w-full pl-10 pr-3 py-2 text-sm border ${errors.description
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                    } rounded-md shadow-sm text-gray-800`}
                                placeholder="Provide a brief description"
                                rows={3}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center bg-indigo-950 text-white font-medium py-2 rounded-md shadow hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <FaPaperPlane className="mr-2 text-white text-sm" /> Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Lab;
