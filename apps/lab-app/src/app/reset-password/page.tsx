"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  FaArrowLeft, FaFlask, FaMicroscope, FaLock, 
  FaCheckCircle, FaExclamationTriangle, FaEye, FaEyeSlash
} from 'react-icons/fa'
import { FiLoader } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { resetPassword } from '../../../services/authService'
import { AxiosError } from 'axios'

const ResetPasswordContent: React.FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)

  // Check if token exists on mount
  useEffect(() => {
    if (!token) {
      setTokenError('Invalid or missing reset token. Please request a new password reset link.')
    }
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    if (password.length > 128) {
      errors.push('Password must be no more than 128 characters long')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one digit')
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})

    if (!token) {
      setTokenError('Invalid or missing reset token. Please request a new password reset link.')
      return
    }

    // Validate passwords
    if (!formData.newPassword.trim()) {
      setValidationErrors((prev) => ({ ...prev, newPassword: 'New password is required' }))
      return
    }

    if (!formData.confirmPassword.trim()) {
      setValidationErrors((prev) => ({ ...prev, confirmPassword: 'Please confirm your password' }))
      return
    }

    // Check password match
    if (formData.newPassword !== formData.confirmPassword) {
      setValidationErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }))
      return
    }

    // Validate password strength
    const passwordValidation = validatePassword(formData.newPassword)
    if (!passwordValidation.isValid) {
      setValidationErrors((prev) => ({ 
        ...prev, 
        newPassword: passwordValidation.errors[0] // Show first error
      }))
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword({
        token: token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })
      
      setIsSuccess(true)
      toast.success('Password has been reset successfully', { autoClose: 3000 })
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/user-login')
      }, 3000)
    } catch (err: unknown) {
      setIsSubmitting(false)
      
      if (err instanceof AxiosError) {
        const status = err.response?.status
        const responseData = err.response?.data
        const message = responseData?.message || err.message || 'Failed to reset password. Please try again.'

        // Handle invalid/expired token
        if (status === 400 && (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('expired'))) {
          setTokenError(message)
          toast.error(message, { autoClose: 5000 })
        } else if (status === 400 && message.toLowerCase().includes('password')) {
          // Password validation errors
          if (message.toLowerCase().includes('match')) {
            setValidationErrors((prev) => ({ ...prev, confirmPassword: message }))
          } else {
            setValidationErrors((prev) => ({ ...prev, newPassword: message }))
          }
          toast.error(message, { autoClose: 3000 })
        } else {
          toast.error(message, { autoClose: 3000 })
        }
      } else if (err instanceof Error) {
        const message = err.message
        if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('expired')) {
          setTokenError(message)
          toast.error(message, { autoClose: 5000 })
        } else {
          toast.error(message || 'Failed to reset password. Please try again.', { autoClose: 3000 })
        }
      } else {
        toast.error('Failed to reset password. Please try again.', { autoClose: 3000 })
      }
    }
  }

  // If no token or token error, show error state
  if (!token || tokenError) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-white to-purple-50">
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
          </div>
        </div>

        <div className="w-full md:w-3/5 flex items-center justify-center p-6 md:p-12 bg-white shadow-xl rounded-tl-3xl md:rounded-tl-none rounded-bl-none md:rounded-bl-3xl">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl text-red-600">
                <FaExclamationTriangle className="text-lg" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h2>
                <p className="text-gray-600">The password reset link is invalid or has expired</p>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex items-start">
                <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Link Expired or Invalid</p>
                  <p className="mt-1 text-sm text-red-700">
                    {tokenError || 'This password reset link is invalid or has expired. Password reset links expire after 15 minutes.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/forgot-password" passHref>
                <button className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
                  Request New Reset Link
                </button>
              </Link>

              <Link href="/user-login" passHref>
                <button className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-md font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
                  <FaArrowLeft className="mr-2" />
                  Back to Login
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-white to-purple-50">
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
          </div>
        </div>

        <div className="w-full md:w-3/5 flex items-center justify-center p-6 md:p-12 bg-white shadow-xl rounded-tl-3xl md:rounded-tl-none rounded-bl-none md:rounded-bl-3xl">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full text-green-600">
                <FaCheckCircle className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Password Reset Successful</h2>
                <p className="text-gray-600">Your password has been reset successfully</p>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
              <div className="flex items-start">
                <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Password Updated</p>
                  <p className="mt-1 text-sm text-green-700">
                    Your password has been reset successfully. You can now log in with your new password.
                  </p>
                  <p className="mt-2 text-sm text-green-700">
                    Redirecting to login page...
                  </p>
                </div>
              </div>
            </div>

            <Link href="/user-login" passHref>
              <button className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Main reset password form
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
              Reset Your Password
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Create a new secure password for your account
            </p>
          </div>
        </div>
      </div>

      {/* Reset Password Panel */}
      <div className="w-full md:w-3/5 flex items-center justify-center p-6 md:p-12 bg-white shadow-xl rounded-tl-3xl md:rounded-tl-none rounded-bl-none md:rounded-bl-3xl">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl text-purple-600">
              <FaLock className="text-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">New Password</h2>
              <p className="text-purple-600">Enter your new password below</p>
            </div>
          </div>

          <form 
            onSubmit={handleSubmit} 
            method="POST"
            action="#"
            className="space-y-5"
            noValidate
          >
            <div className="space-y-1">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaLock />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {validationErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.newPassword}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FaLock />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
              <div className="flex items-start">
                <FaLock className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800">Password Requirements</p>
                  <ul className="mt-1 text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>At least 8 characters long</li>
                    <li>One uppercase letter (A-Z)</li>
                    <li>One lowercase letter (a-z)</li>
                    <li>One digit (0-9)</li>
                    <li>One special character (!@#$%^&*...)</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <FiLoader className="animate-spin mr-2" />
                  Resetting Password...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>

            <div className="text-center">
              <Link href="/user-login" className="flex items-center justify-center text-purple-600 hover:text-purple-500 transition-colors">
                <FaArrowLeft className="mr-2" />
                Back to Login
              </Link>
            </div>
          </form>

          <div className="text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Tiamed Diagnostics. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ResetPasswordPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-purple-50">
        <div className="text-center">
          <FiLoader className="animate-spin text-purple-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

export default ResetPasswordPage

