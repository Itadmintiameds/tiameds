"use client"
import React, { useState, useEffect } from 'react'
import { 
  FaArrowLeft, FaEnvelope, FaFlask, 
  FaMicroscope, FaLock, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa'
import { FiLoader } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { forgotPassword } from '../../../services/authService'
import { AxiosError } from 'axios'

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null)
  const [blockMessage, setBlockMessage] = useState<string>('')

  // Check for existing block on mount
  useEffect(() => {
    const storedBlock = localStorage.getItem('forgot_password_block_until')
    if (storedBlock) {
      const blockTime = parseInt(storedBlock, 10)
      if (blockTime > Date.now()) {
        setBlockedUntil(blockTime)
        const minutes = Math.ceil((blockTime - Date.now()) / 60000)
        setBlockMessage(`Too many password reset requests. Please try again after ${minutes} minute${minutes !== 1 ? 's' : ''}.`)
      } else {
        localStorage.removeItem('forgot_password_block_until')
      }
    }
  }, [])

  // Block countdown timer
  useEffect(() => {
    if (blockedUntil && blockedUntil > Date.now()) {
      const timer = setInterval(() => {
        const remaining = blockedUntil - Date.now()
        if (remaining <= 0) {
          setBlockedUntil(null)
          setBlockMessage('')
          localStorage.removeItem('forgot_password_block_until')
        } else {
          const minutes = Math.ceil(remaining / 60000)
          setBlockMessage(`Too many password reset requests. Please try again after ${minutes} minute${minutes !== 1 ? 's' : ''}.`)
        }
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [blockedUntil])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setValidationErrors((prev) => ({ ...prev, email: '' }))
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})

    // Validate email
    if (!email.trim()) {
      setValidationErrors((prev) => ({ ...prev, email: 'Email is required' }))
      return
    }

    if (!validateEmail(email)) {
      setValidationErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }))
      return
    }

    setIsSubmitting(true)

    try {
      await forgotPassword({ email: email.trim() })
      setIsSuccess(true)
      toast.success('If an account exists with this email, a password reset link has been sent.', {
        autoClose: 5000,
      })
    } catch (err: unknown) {
      setIsSubmitting(false)
      
      if (err instanceof AxiosError) {
        const status = err.response?.status
        const responseData = err.response?.data
        const message = responseData?.message || err.message || 'Failed to send password reset link. Please try again.'

        // Handle rate limiting (429)
        if (status === 429 || message.toLowerCase().includes('too many')) {
          // Extract time from message if available, default to 1 minute
          const timeMatch = message.match(/(\d+)\s+minutes?/i)
          const minutes = timeMatch ? parseInt(timeMatch[1], 10) : 1
          const blockUntil = Date.now() + (minutes * 60 * 1000)
          
          setBlockedUntil(blockUntil)
          setBlockMessage(message)
          localStorage.setItem('forgot_password_block_until', blockUntil.toString())
          
          toast.error(message, { autoClose: 5000 })
        } else {
          toast.error(message, { autoClose: 3000 })
        }
      } else if (err instanceof Error) {
        const message = err.message
        if (message.toLowerCase().includes('too many')) {
          const timeMatch = message.match(/(\d+)\s+minutes?/i)
          const minutes = timeMatch ? parseInt(timeMatch[1], 10) : 1
          const blockUntil = Date.now() + (minutes * 60 * 1000)
          
          setBlockedUntil(blockUntil)
          setBlockMessage(message)
          localStorage.setItem('forgot_password_block_until', blockUntil.toString())
          
          toast.error(message, { autoClose: 5000 })
        } else {
          toast.error('Failed to send password reset link. Please try again.', { autoClose: 3000 })
        }
      } else {
        toast.error('Failed to send password reset link. Please try again.', { autoClose: 3000 })
      }
    }
  }

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
              Password Recovery
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Secure password reset for your laboratory account
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

      {/* Forgot Password Panel */}
      <div className="w-full md:w-3/5 flex items-center justify-center p-6 md:p-12 bg-white shadow-xl rounded-tl-3xl md:rounded-tl-none rounded-bl-none md:rounded-bl-3xl">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl text-purple-600">
              <FaLock className="text-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isSuccess ? 'Check Your Email' : 'Forgot Password'}
              </h2>
              <p className="text-purple-600">
                {isSuccess ? 'Reset link sent successfully' : 'Enter your email to reset your password'}
              </p>
            </div>
          </div>

          {isSuccess ? (
            <div className="space-y-6">
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800">Reset Link Sent</p>
                    <p className="mt-1 text-sm text-green-700">
                      If an account exists with <span className="font-semibold">{email}</span>, a password reset link has been sent to your email address.
                    </p>
                    <p className="mt-2 text-sm text-green-700">
                      The link will expire in 15 minutes. If you don&apos;t see the email, please check your spam folder.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/user-login" passHref>
                  <button className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
                    <FaArrowLeft className="mr-2" />
                    Back to Login
                  </button>
                </Link>

                <button
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail('')
                    setValidationErrors({})
                  }}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-md font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                >
                  Request Another Link
                </button>
              </div>
            </div>
          ) : (
            <form 
              onSubmit={handleSubmit} 
              method="POST"
              action="#"
              className="space-y-5"
              noValidate
            >
              {blockedUntil && blockedUntil > Date.now() && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-red-800">
                        Too Many Requests
                      </p>
                      <p className="mt-1 text-sm text-red-700">
                        {blockMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaEnvelope />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    disabled={blockedUntil !== null && blockedUntil > Date.now()}
                    autoComplete="email"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="your@email.com"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <FaEnvelope className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">Security Notice</p>
                    <p className="mt-1 text-sm text-blue-700">
                      For security reasons, we&apos;ll send a password reset link only if an account exists with this email address.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (blockedUntil !== null && blockedUntil > Date.now())}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <FiLoader className="animate-spin mr-2" />
                    Sending Reset Link...
                  </span>
                ) : blockedUntil && blockedUntil > Date.now() ? (
                  'Account Temporarily Blocked'
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center">
                <Link href="/user-login" className="flex items-center justify-center text-purple-600 hover:text-purple-500 transition-colors">
                  <FaArrowLeft className="mr-2" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Tiamed Diagnostics. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
