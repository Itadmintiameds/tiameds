import { loginDataSchema } from '@/schema/loginDataSchema';
import { LoginData } from '@/types/Login';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { FaLock, FaUser, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ZodError } from 'zod';
import { login, verifyOtp } from '../../../../services/authService';
import useAuthStore from '@/context/userStore';

const Login = () => {
  const [formData, setFormData] = useState<LoginData>({
    username: '',
    password: '',
  });
  const [otp, setOtp] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [blockMessage, setBlockMessage] = useState<string>('');
  const router = useRouter();
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setOtp(value);
    setValidationErrors((prev) => ({ ...prev, otp: '' }));
  };

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
      setOtpTimer(300);
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
      
      authLogin(response.data);
      router.push('/dashboard');
      toast.success('Logged in successfully!', { autoClose: 1000 });
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
      const response = await login(formData);
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

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md px-6 py-8 rounded-lg -mt-32 ">
        <div className="flex justify-center mb-6">
          {/* <Image src="/tiamed1.svg" alt="Lab Management System" width={80} height={80} /> */}
        </div>

        <h2 className="text-center text-2xl font-bold text-purple-800">Welcome Back!</h2>
        <p className="mt-2 text-center text-sm text-purple-800">
          Sign in to your Lab Management Softwere account
        </p>

        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="mt-8 space-y-6">
            {blockedUntil && blockedUntil > Date.now() && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-red-800">
                      Account Temporarily Blocked
                    </p>
                    <p className="mt-1 text-sm text-red-700">
                      {blockMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-purple-800">
                Username
              </label>
              <div className="relative mt-1">
                <FaUser className="absolute top-1/2 left-3 -translate-y-1/2 text-purple-800" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={blockedUntil !== null && blockedUntil > Date.now()}
                  className="block w-full pl-10 rounded-md border border-gray-300 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
                {validationErrors.username && (
                  <div className="text-red-500 text-sm mt-1">{validationErrors.username}</div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-purple-800">
                Password
              </label>
              <div className="relative mt-1">
                <FaLock className="absolute top-1/2 left-3 -translate-y-1/2 text-purple-800" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={blockedUntil !== null && blockedUntil > Date.now()}
                  className="block w-full pl-10 rounded-md border border-gray-300 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                {validationErrors.password && (
                  <div className="text-red-500 text-sm mt-1">{validationErrors.password}</div>
                )}
              </div>
            </div>

            <div className=''>
              <button
                type="submit"
                disabled={isSubmitting || (blockedUntil !== null && blockedUntil > Date.now())}
                className={`w-full rounded-md bg-gradient-to-r from-purple-800 to-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gradient-to-r hover:from-secondary hover:to-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${isSubmitting || (blockedUntil !== null && blockedUntil > Date.now()) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Sending OTP...' : blockedUntil && blockedUntil > Date.now() ? 'Account Blocked' : 'Continue'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6">
            <div className="text-center space-y-2 mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full text-purple-600 mb-2 mx-auto">
                <FaEnvelope className="text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-purple-800">Enter OTP</h3>
              <p className="text-sm text-purple-700">
                We've sent a 4-digit OTP to <span className="font-medium">{userEmail}</span>
              </p>
              {otpTimer > 0 && (
                <p className="text-xs text-gray-500">
                  OTP expires in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-purple-800">
                OTP Code
              </label>
              <div className="relative mt-1">
                <FaLock className="absolute top-1/2 left-3 -translate-y-1/2 text-purple-800" />
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  className="block w-full pl-10 rounded-md border border-gray-300 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-center text-2xl tracking-widest font-mono"
                  placeholder="0000"
                  maxLength={4}
                />
                {validationErrors.otp && (
                  <div className="text-red-500 text-sm mt-1">{validationErrors.otp}</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleBackToCredentials}
                className="text-purple-800 hover:text-purple-600 flex items-center"
              >
                <FaArrowLeft className="mr-1" />
                Back to login
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpTimer > 0 || isSubmitting}
                className="text-purple-800 hover:text-purple-600 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Resend OTP
              </button>
            </div>

            <div className=''>
              <button
                type="submit"
                disabled={isSubmitting || otp.length !== 4}
                className={`w-full rounded-md bg-gradient-to-r from-purple-800 to-secondary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gradient-to-r hover:from-secondary hover:to-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${isSubmitting || otp.length !== 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-purple-800">
          Forgot your password?{' '}
          <Link href="#" className="font-medium text-purple-800 hover:text-indigo-500">
            Reset here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
