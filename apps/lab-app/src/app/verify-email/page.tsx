'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowRight } from 'react-icons/fa';
import { verifyEmailToken } from '@/../services/onboardingService';
import Link from 'next/link';

const VerifyEmailContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token provided');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await verifyEmailToken(token);
        if (response.valid) {
          setStatus('success');
          setEmail(response.email);
          // Extract token from redirectUrl or use the one from URL
          const redirectUrl = new URL(response.redirectUrl);
          const onboardingToken = redirectUrl.searchParams.get('token') || token;
          
          // Redirect to onboarding form with token
          setTimeout(() => {
            router.push(`/onboarding?token=${encodeURIComponent(onboardingToken)}&email=${encodeURIComponent(response.email)}`);
          }, 2000);
        } else {
          setStatus('error');
          setErrorMessage(response.message || 'Invalid verification token');
        }
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.message || 'Failed to verify email');
      }
    };

    verifyToken();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6 flex justify-center">
            <FaSpinner className="text-5xl text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Verifying Email...</h2>
          <p className="text-gray-600">Please wait while we verify your email address</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-green-100 rounded-full">
              <FaCheckCircle className="text-5xl text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Email Verified!</h2>
          <p className="text-gray-600 mb-2">
            Your email <strong>{email}</strong> has been verified successfully.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting you to complete your registration...
          </p>
          <div className="flex items-center justify-center gap-2 text-primary">
            <FaSpinner className="animate-spin" />
            <span className="text-sm">Please wait</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-red-100 rounded-full">
            <FaTimesCircle className="text-5xl text-red-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Verification Failed</h2>
        <p className="text-gray-600 mb-6">{errorMessage}</p>
        <div className="space-y-3">
          <Link
            href="/onboarding/request"
            className="block w-full bg-primary hover:bg-primarylight text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            Request New Verification Email
            <FaArrowRight />
          </Link>
          <Link
            href="/user-login"
            className="block w-full py-2.5 px-4 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

const VerifyEmailPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center">
          <FaSpinner className="text-5xl text-primary animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmailPage;

