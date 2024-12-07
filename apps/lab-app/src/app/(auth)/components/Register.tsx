import { FormData } from '@/types/FormData';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { FaEnvelope, FaGlobeAsia, FaHome, FaLock, FaMapMarkerAlt, FaPhoneAlt, FaRegBuilding, FaUser } from 'react-icons/fa';

const Register: React.FC = () => {

  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    modules: [1], 
    verified: false,
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Registration successful!');
      } else {
        alert('Failed to register. Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex h-screen flex-1 flex-col justify-center px-6 py-4 lg:px-8 h-screen">
      <div className="flex justify-center ">
          <Image src = "/tiamed1.svg" alt="Lab Management System" width={80} height={80} />
        </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-6xl">
        <form onSubmit={handleSubmit} className="space-y-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Username */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                required
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-zinc-900 pl-10 focus:ring-indigo-500 mt-6"
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="phone"
                name="phone"
                type="text"
                required
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="address"
                name="address"
                type="text"
                required
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaHome className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* City */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="city"
                name="city"
                type="text"
                required
                placeholder="Enter your city"
                value={formData.city}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* State */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="state"
                name="state"
                type="text"
                required
                placeholder="Enter your state"
                value={formData.state}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaRegBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Zip */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="zip"
                name="zip"
                type="text"
                required
                placeholder="Enter your ZIP code"
                value={formData.zip}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <div className="relative">
              <input
                id="country"
                name="country"
                type="text"
                required
                placeholder="Enter your country"
                value={formData.country}
                onChange={handleInputChange}
                className="block w-full rounded-md border bg-white/5 py-2 px-4 text-indigo-800 pl-10 focus:ring-indigo-500"
              />
              <FaGlobeAsia className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-800" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="col-span-3 text-center">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Register
            </button>
          </div>

          <div className="col-span-3 text-center">
            <p className="text-sm text-indigo-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;


