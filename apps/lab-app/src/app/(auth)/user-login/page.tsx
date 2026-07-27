
"use client"
import React, { useState, useEffect } from 'react'
import { 
  FaArrowLeft, FaSignInAlt,FaFlask, 
  FaMicroscope, FaLock, FaUser, FaEye, FaEyeSlash, FaEnvelope
} from 'react-icons/fa'
// import {FaUserPlus} from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { login, verifyOtp } from '../../../../services/authService'
import { loginDataSchema } from '@/schema/loginDataSchema'
import { LoginData } from '@/types/Login'
import { AxiosError } from 'axios'
import { ZodError } from 'zod'
import useAuthStore from '@/context/userStore';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    username: '',
    password: '',
  })
  const [otp, setOtp] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null)
  const [blockMessage, setBlockMessage] = useState<string>('')
  const { login: authLogin } = useAuthStore();

  // Check for existing block on mount
  useEffect(() => {
    const storedBlock = localStorage.getItem('login_block_until');
    if (storedBlock) {
      const blockTime = parseInt(storedBlock, 10);
      if (blockTime > Date.now()) {
        setBlockedUntil(blockTime);
        const minutes = Math.ceil((blockTime - Date.now()) / 60000);
        setBlockMessage(`Too many login attempts. Please try again after ${minutes} minutes.`);
      } else {
        localStorage.removeItem('login_block_until');
      }
    }
  }, []);

  // Block countdown timer
  useEffect(() => {
    if (blockedUntil && blockedUntil > Date.now()) {
      const timer = setInterval(() => {
        const remaining = blockedUntil - Date.now();
        if (remaining <= 0) {
          setBlockedUntil(null);
          setBlockMessage('');
          localStorage.removeItem('login_block_until');
        } else {
          const minutes = Math.ceil(remaining / 60000);
          setBlockMessage(`Too many login attempts. Please try again after ${minutes} minute${minutes !== 1 ? 's' : ''}.`);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [blockedUntil]);

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setOtp(value);
    setValidationErrors((prev) => ({ ...prev, otp: '' }));
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setIsSubmitting(true);
  
    try {
      loginDataSchema.parse(formData);
    } catch (err) {
      const error = err as ZodError;
      const field = error.errors[0]?.path[0];
      const message = error.errors[0]?.message;
      setValidationErrors((prev) => ({ ...prev, [field]: message }));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await login(formData);
      setUserEmail(response.data.email);
      setIsSubmitting(false); // Reset loading state before changing step
      setStep('otp');
      setOtpTimer(300); // 5 minutes in seconds
      toast.success('OTP sent to your registered email', { autoClose: 2000 });
    } catch (err: unknown) {
      setIsSubmitting(false);
      
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        const responseData = err.response?.data;
        const message = responseData?.message || err.message || 'Login failed. Please try again.';
        
        // Handle rate limiting (429) - check both status code and message
        if (status === 429 || message.toLowerCase().includes('too many login attempts')) {
          // Extract time from message (e.g., "after 10 minutes" or "after 5 minutes")
          const timeMatch = message.match(/(\d+)\s+minutes?/i);
          const minutes = timeMatch ? parseInt(timeMatch[1], 10) : 10;
          const blockUntil = Date.now() + (minutes * 60 * 1000);
          
          setBlockedUntil(blockUntil);
          setBlockMessage(message);
          localStorage.setItem('login_block_until', blockUntil.toString());
          
          toast.error(message, { autoClose: 5000 });
        } else {
          toast.error(message, { autoClose: 2000 });
        }
      } else if (err instanceof Error) {
        // Handle case where message contains rate limit info
        const message = err.message;
        if (message.toLowerCase().includes('too many login attempts')) {
          const timeMatch = message.match(/(\d+)\s+minutes?/i);
          const minutes = timeMatch ? parseInt(timeMatch[1], 10) : 10;
          const blockUntil = Date.now() + (minutes * 60 * 1000);
          
          setBlockedUntil(blockUntil);
          setBlockMessage(message);
          localStorage.setItem('login_block_until', blockUntil.toString());
          
          toast.error(message, { autoClose: 5000 });
        } else {
          toast.error('Login failed. Please try again.', { autoClose: 2000 });
        }
      } else {
        toast.error('Login failed. Please try again.', { autoClose: 2000 });
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!otp || otp.length !== 4) {
      setValidationErrors((prev) => ({ ...prev, otp: 'Please enter a valid 4-digit OTP' }));
      return;
    }

    if (!userEmail) {
      toast.error('Email not found. Please start over.', { autoClose: 2000 });
      setStep('credentials');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Calling verifyOtp with:', { email: userEmail, otp });
      const response = await verifyOtp({ email: userEmail, otp });
      console.log('verifyOtp response:', response);
      
      // Update auth state (tokens are set as HttpOnly cookies by backend)
      authLogin(response.data);
      
      // Use window.location.href for full page reload to ensure cookies are available to middleware
      // This is the standard pattern for authentication redirects as it ensures:
      // 1. Set-Cookie headers are fully processed by the browser
      // 2. Middleware runs on a fresh request with cookies available
      // 3. No client-side navigation timing issues
      toast.success('Logged in successfully! Redirecting...', { autoClose: 1000 });
      
      // Use requestAnimationFrame to ensure response processing completes before redirect
      requestAnimationFrame(() => {
        window.location.href = '/dashboard';
      });
    } catch (err: unknown) {
      console.error('OTP verification error:', err);
      if (err instanceof AxiosError) {
        const message = err?.response?.data?.message || err?.message || 'OTP verification failed. Please try again.';
        console.error('Error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message
        });
        toast.error(message, { autoClose: 2000 });
      } else if (err instanceof Error) {
        console.error('Error message:', err.message);
        toast.error(err.message || 'OTP verification failed. Please try again.', { autoClose: 2000 });
      } else {
        toast.error('OTP verification failed. Please try again.', { autoClose: 2000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) {
      toast.warning(`Please wait ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')} before requesting a new OTP`, { autoClose: 2000 });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(formData);
      setOtpTimer(300);
      setOtp('');
      toast.success('New OTP sent to your registered email', { autoClose: 2000 });
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        toast.error(err?.response?.data?.message || 'Failed to resend OTP. Please try again.', { autoClose: 2000 });
      } else {
        toast.error('Failed to resend OTP. Please try again.', { autoClose: 2000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setOtp('');
    setOtpTimer(0);
    setValidationErrors({});
  };


   

  const inputClass = "block w-full pl-10 pr-3 py-3 bg-purple-50 border border-purple-100 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"

  return (
    <div className="bg-gradient-to-br from-white to-purple-50" style={{ minHeight: '100vh', display: 'flex' }}>

      {/* Left branding panel — hidden on mobile */}
      <div
        className="hidden lg:flex flex-col justify-center items-center"
        style={{ width: '40%', flexShrink: 0, padding: '48px' }}
      >
        <div className="flex flex-col items-center w-full max-w-sm space-y-8">
          <Image
            src="/LOGO.svg"
            alt="Tiamed Logo"
            width={500}
            height={250}
            className="transition-transform duration-300 hover:scale-105"
            priority
          />
          <div className="flex space-x-4 text-purple-600/80">
            <FaFlask className="text-3xl" />
            <FaMicroscope className="text-3xl" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Precision Laboratory Management
            </h1>
            <p className="text-gray-600">
              Advanced diagnostic solutions for modern healthcare
            </p>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-500 transition-colors">
            <FaArrowLeft />
            Return to Homepage
          </Link>
        </div>
      </div>

      {/* Right form panel */}
      <div
        className="bg-white lg:shadow-2xl"
        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 32px', minHeight: '100vh' }}
      >
        <div className="space-y-6" style={{ width: '100%', maxWidth: '440px' }}>

          {/* Mobile: logo + back link */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-500">
              <FaArrowLeft />
              Back to Home
            </Link>
            <Image src="/LOGO.svg" alt="Tiamed Logo" width={110} height={55} priority />
          </div>

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl text-purple-600">
              <FaSignInAlt className="text-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Laboratory Portal</h2>
              <p className="text-purple-600 mt-1">Access your diagnostic dashboard</p>
            </div>
          </div>

          {/* ── Credentials step ── */}
          {step === 'credentials' ? (
            <form
              onSubmit={handleCredentialsSubmit}
              method="POST"
              action="#"
              className="space-y-5"
              noValidate
            >
              {blockedUntil && blockedUntil > Date.now() && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-start gap-3">
                  <svg className="h-5 w-5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">Account Temporarily Blocked</p>
                    <p className="mt-1 text-sm text-red-700">{blockMessage}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaUser />
                  </span>
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={blockedUntil !== null && blockedUntil > Date.now()}
                    autoComplete="username"
                    placeholder="Enter your username"
                    className={inputClass}
                  />
                </div>
                {validationErrors.username && (
                  <p className="text-sm text-red-600">{validationErrors.username}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaLock />
                  </span>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={blockedUntil !== null && blockedUntil > Date.now()}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-500">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (blockedUntil !== null && blockedUntil > Date.now())}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <><FiLoader className="animate-spin" /> Sending OTP...</>
                  : blockedUntil && blockedUntil > Date.now() ? 'Account Blocked'
                  : 'Continue'}
              </button>
            </form>

          ) : (
            /* ── OTP step ── */
            <form
              onSubmit={handleOtpSubmit}
              method="POST"
              action="#"
              className="space-y-5"
              noValidate
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full text-purple-600 mb-1">
                  <FaEnvelope className="text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Enter OTP</h3>
                <p className="text-sm text-gray-600">
                  We&apos;ve sent a 4-digit OTP to{' '}
                  <span className="font-medium text-purple-600 break-all">{userEmail}</span>
                </p>
                {otpTimer > 0 && (
                  <p className="text-xs text-gray-500">
                    OTP expires in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">OTP Code</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaLock />
                  </span>
                  <input
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    className={`${inputClass} text-center text-2xl tracking-widest font-mono`}
                    placeholder="0000"
                    maxLength={4}
                  />
                </div>
                {validationErrors.otp && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.otp}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={handleBackToCredentials}
                  className="text-purple-600 hover:text-purple-500 flex items-center gap-1"
                >
                  <FaArrowLeft /> Back to login
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpTimer > 0 || isSubmitting}
                  className="text-purple-600 hover:text-purple-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otp.length !== 4}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? <><FiLoader className="animate-spin" /> Verifying...</> : 'Verify OTP'}
              </button>
            </form>
          )}

          {/* Divider */}
          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-sm text-gray-500">New to our platform?</span>
            </div>
          </div> */}

          {/* <Link href="/onboarding/request" passHref>
            <button className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
              <FaUserPlus className="text-purple-600" />
              Register Laboratory
            </button>
          </Link> */}

          <p className="text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Tiamed Diagnostics. All rights reserved.
          </p>

        </div>
      </div>
    </div>
  )
}

export default LoginPage