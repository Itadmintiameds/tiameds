
"use client"
import React, { useState } from 'react'
import { 
  FaArrowLeft, FaSignInAlt, FaUserPlus, FaFlask, 
  FaMicroscope, FaLock, FaUser, FaEye, FaEyeSlash 
} from 'react-icons/fa'
import { FiLoader } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { login } from '../../../../services/authService'
import { loginDataSchema } from '@/schema/loginDataSchema'
import { LoginData } from '@/types/Login'
import { AxiosError } from 'axios'
import { ZodError } from 'zod'
import { useLabs } from '@/context/LabContext';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    username: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const {setLoginedUser} = useLabs();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationErrors((prev) => ({ ...prev, [name]: '' }))
  }

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setValidationErrors({});
      setIsSubmitting(true);
  
      try {
        loginDataSchema.parse(formData);
      } catch (err) {
        const error = err as ZodError; // Type assertion to ZodError
        const field = error.errors[0]?.path[0];
        const message = error.errors[0]?.message;
        setValidationErrors((prev) => ({ ...prev, [field]: message }));
        setIsSubmitting(false);
        return;
      }
      // API call
      try {
        const response = await login(formData);
        console.log(response.data);
        setLoginedUser({
          username: response.data.username,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          roles: response.data.roles,
          modules: null,
          phone: response.data.phone,
          address: response.data.address,
          city: response.data.city,
          state: response.data.state,
          zip: response.data.zip,
          country: response.data.country,
          enabled: response.data.enabled,
          is_verified: response.data.is_verified,
        });
        // Store token in cookies
        // document.cookie = `token=${response.token}; path=/; Secure; HttpOnly`;  // Add Secure and HttpOnly for better security
  
        document.cookie = `token=${response.token}; path=/;`;
        // console.log('Current Cookies:', document.cookie);
  
        localStorage.setItem('user', JSON.stringify(response?.data)); // Store user in localStorage
        router.push('/dashboard');
        toast.success('Logged in successfully!', { autoClose: 1000 });
      
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          toast.error(err?.response?.data?.message || 'Login failed. Please try again.', { autoClose: 1000 });
        } else {
          toast.error('Login failed. Please try again.', { autoClose: 1000 });
        }
      } finally {
        setIsSubmitting(false);
      }
    };


   

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-white to-purple-50">
      {/* Branding Panel */}
      <div className="w-full md:w-2/5 flex flex-col justify-center items-center p-8 md:p-12">
        <div className="flex flex-col items-center w-full max-w-md space-y-8">
          <div className="flex flex-col items-center group">
            <Image 
              src="/LOGO.svg" 
              alt="Tiamed Logo" 
              width={180} 
              height={90} 
              className="transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>

          <div className="flex space-x-4 text-purple-600/80">
            <FaFlask className="text-3xl" />
            <FaMicroscope className="text-3xl" />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Precision Laboratory Management
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Advanced diagnostic solutions for modern healthcare
            </p>
          </div>

          <Link href="/" passHref>
            <button className="flex items-center text-sm text-purple-700 hover:text-purple-600 transition-all">
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Return to Homepage
            </button>
          </Link>
        </div>
      </div>

      {/* Login Panel */}
      <div className="w-full md:w-3/5 flex items-center justify-center p-6 md:p-12 bg-white shadow-xl rounded-tl-3xl md:rounded-tl-none rounded-bl-none md:rounded-bl-3xl">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl text-purple-600">
              <FaSignInAlt className="text-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Laboratory Portal</h2>
              <p className="text-purple-600">Access your diagnostic dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaUser />
                </div>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="username"
                />
                {validationErrors.username && (
                  <p className="text-sm text-red-600">{validationErrors.username}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaLock />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {validationErrors.password && (
                  <p className="text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              {/* <label className="flex items-center space-x-2 text-gray-600">
                <input
                  type="checkbox"
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Remember me</span>
              </label> */}
              <Link href="/forgot-password" className="text-purple-600 hover:text-purple-500">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <FiLoader className="animate-spin mr-2" />
                  Authenticating...
                </span>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-white text-sm text-gray-500">New to our platform?</span>
            </div>
          </div>

          <Link href="/register-user" passHref>
            <button className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-md font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
              <FaUserPlus className="mr-2 text-purple-600" />
              Register Laboratory
            </button>
          </Link>

          <div className="text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Tiamed Diagnostics. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage