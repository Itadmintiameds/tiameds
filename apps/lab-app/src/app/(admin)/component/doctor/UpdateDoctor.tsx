import React, { useState, useEffect } from 'react';
import { Doctor } from '@/types/doctor/doctor';
import { FaHospital, FaIdCard, FaMapMarkerAlt, FaPhoneAlt, FaGraduationCap, FaUserMd, FaEnvelope, FaHeart } from 'react-icons/fa';

interface UpdateDoctorProps {
  editDoctor: Doctor;
  handleUpdate: (doctor: Doctor) => void;
}

const UpdateDoctor = ({ editDoctor, handleUpdate }: UpdateDoctorProps) => {
  const [updatedDoctor, setUpdatedDoctor] = useState<Doctor>(editDoctor);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setUpdatedDoctor(editDoctor);
  }, [editDoctor]);

  // Validate individual field
  const validateField = (name: string, value: unknown): string => {
    switch (name) {
      case 'name':
        if (typeof value !== 'string') return 'Name must be a valid value';
        if (!value || value.trim() === '') return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters long';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name should contain only alphabets and spaces';
        return '';
      
      case 'email':
        if (typeof value !== 'string') return 'Email must be a valid value';
        if (!value || value.trim() === '') return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
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
        return '';
      
      case 'address':
        if (typeof value !== 'string') return 'Address must be a valid value';
        if (!value || value.trim() === '') return 'Address is required';
        if (value.length < 5) return 'Address must be at least 5 characters long';
        return '';
      
      case 'city':
        if (typeof value !== 'string') return 'City must be a valid value';
        if (!value || value.trim() === '') return 'City is required';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'City should contain only alphabets and spaces';
        return '';
      
      case 'state':
        if (typeof value !== 'string') return 'State must be a valid value';
        if (!value || value.trim() === '') return 'State is required';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'State should contain only alphabets and spaces';
        return '';
      
      case 'country':
        if (typeof value !== 'string') return 'Country must be a valid value';
        if (!value || value.trim() === '') return 'Country is required';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Country should contain only alphabets and spaces';
        return '';
      
      case 'speciality':
        if (typeof value !== 'string') return 'Speciality must be a valid value';
        if (value && !/^[a-zA-Z\s]+$/.test(value)) return 'Speciality should contain only alphabets and spaces';
        return '';
      
      case 'qualification':
        if (typeof value !== 'string') return 'Qualification must be a valid value';
        if (value && !/^[a-zA-Z\s]+$/.test(value)) return 'Qualification should contain only alphabets and spaces';
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
      setUpdatedDoctor((prevState) => ({
        ...prevState,
        [name]: numericValue ? parseInt(numericValue) : '',
      }));
    } else if (name === 'name' || name === 'speciality' || name === 'qualification' || 
               name === 'hospitalAffiliation' || name === 'city' || name === 'state' || name === 'country') {
      // Only allow alphabets and spaces for name fields
      const alphabeticValue = value.replace(/[^a-zA-Z\s]/g, '');
      setUpdatedDoctor((prevState) => ({
        ...prevState,
        [name]: alphabeticValue,
      }));
    } else if (name === 'licenseNumber') {
      // Allow alphanumeric for license number
      const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, '');
      setUpdatedDoctor((prevState) => ({
        ...prevState,
        [name]: alphanumericValue,
      }));
    } else if (name === 'address') {
      // Allow alphanumeric, spaces, and common address characters
      const addressValue = value.replace(/[^a-zA-Z0-9\s.,#-]/g, '');
      setUpdatedDoctor((prevState) => ({
        ...prevState,
        [name]: addressValue,
      }));
    } else {
      setUpdatedDoctor((prevState) => ({
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
      const value = updatedDoctor[field as keyof Doctor];
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
    handleUpdate(updatedDoctor);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      {/* Personal Information Section */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          <FaUserMd className="mr-2 text-blue-500" size={16} />
          Personal Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="name" className="text-xs font-medium text-gray-600 flex items-center mb-1">
              <FaUserMd className="mr-2 text-blue-500" size={14} /> Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={updatedDoctor.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-3 py-2 text-xs border ${errors.name && touched.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white`}
            />
            {errors.name && touched.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="text-xs font-medium text-gray-600 flex items-center mb-1">
              <FaEnvelope className="mr-2 text-blue-500" size={14} /> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={updatedDoctor.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-3 py-2 text-xs border ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white`}
            />
            {errors.email && touched.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="text-xs font-medium text-gray-600 flex items-center mb-1">
              <FaPhoneAlt className="mr-2 text-blue-500" size={14} /> Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={updatedDoctor.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-3 py-2 text-xs border ${errors.phone && touched.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white`}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              onKeyPress={(e) => {
                // Prevent non-numeric characters
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            {errors.phone && touched.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Professional Information Section */}
      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
        <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
          <FaHeart className="mr-2 text-purple-500" size={16} />
          Professional Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="speciality" className="text-xs font-medium text-gray-600 flex items-center mb-1">
              <FaHeart className="mr-2 text-purple-500" size={14} /> Speciality
            </label>
            <input
              type="text"
              id="speciality"
              name="speciality"
              value={updatedDoctor.speciality}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-3 py-2 text-xs border ${errors.speciality && touched.speciality ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white`}
            />
            {errors.speciality && touched.speciality && (
              <p className="text-xs text-red-500 mt-1">{errors.speciality}</p>
            )}
          </div>

          <div>
            <label htmlFor="qualification" className="text-xs font-medium text-gray-600 flex items-center mb-1">
              <FaGraduationCap className="mr-2 text-purple-500" size={14} /> Qualification
            </label>
            <input
              type="text"
              id="qualification"
              name="qualification"
              value={updatedDoctor.qualification}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-3 py-2 text-xs border ${errors.qualification && touched.qualification ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white`}
            />
            {errors.qualification && touched.qualification && (
              <p className="text-xs text-red-500 mt-1">{errors.qualification}</p>
            )}
          </div>

          <div>
            <label htmlFor="hospitalAffiliation" className="text-xs font-medium text-gray-600 flex items-center mb-1">
              <FaHospital className="mr-2 text-purple-500" size={14} /> Hospital Affiliation
            </label>
            <input
              type="text"
              id="hospitalAffiliation"
              name="hospitalAffiliation"
              value={updatedDoctor.hospitalAffiliation}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-3 py-2 text-xs border ${errors.hospitalAffiliation && touched.hospitalAffiliation ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white`}
            />
            {errors.hospitalAffiliation && touched.hospitalAffiliation && (
              <p className="text-xs text-red-500 mt-1">{errors.hospitalAffiliation}</p>
            )}
          </div>

          <div>
            <label htmlFor="licenseNumber" className="text-xs font-medium text-gray-600 flex items-center mb-1">
              <FaIdCard className="mr-2 text-purple-500" size={14} /> License Number
            </label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              value={updatedDoctor.licenseNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-3 py-2 text-xs border ${errors.licenseNumber && touched.licenseNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white`}
            />
            {errors.licenseNumber && touched.licenseNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.licenseNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address Information Section */}
      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
        <h4 className="font-semibold text-green-800 mb-2 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-green-500" size={16} />
          Address Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="address" className="text-xs font-medium text-gray-600 flex items-center mb-1">
              <FaMapMarkerAlt className="mr-2 text-green-500" size={14} /> Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={updatedDoctor.address}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-3 py-2 text-xs border ${errors.address && touched.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white`}
            />
            {errors.address && touched.address && (
              <p className="text-xs text-red-500 mt-1">{errors.address}</p>
            )}
          </div>

          <div>
            <label htmlFor="city" className="text-xs font-medium text-gray-600 flex items-center mb-1">
              <FaMapMarkerAlt className="mr-2 text-green-500" size={14} /> City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={updatedDoctor.city}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-3 py-2 text-xs border ${errors.city && touched.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white`}
            />
            {errors.city && touched.city && (
              <p className="text-xs text-red-500 mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="text-xs font-medium text-gray-600 flex items-center mb-1">
              <FaMapMarkerAlt className="mr-2 text-green-500" size={14} /> State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={updatedDoctor.state}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-3 py-2 text-xs border ${errors.state && touched.state ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white`}
            />
            {errors.state && touched.state && (
              <p className="text-xs text-red-500 mt-1">{errors.state}</p>
            )}
          </div>

          <div>
            <label htmlFor="country" className="text-xs font-medium text-gray-600 flex items-center mb-1">
              <FaMapMarkerAlt className="mr-2 text-green-500" size={14} /> Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={updatedDoctor.country}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-3 py-2 text-xs border ${errors.country && touched.country ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white`}
            />
            {errors.country && touched.country && (
              <p className="text-xs text-red-500 mt-1">{errors.country}</p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`
          }}
        >
          Update Doctor
        </button>
      </div>
    </form>
  );
};

export default UpdateDoctor;
