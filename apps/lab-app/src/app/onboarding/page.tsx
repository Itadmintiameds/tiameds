'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaFlask, FaSpinner } from 'react-icons/fa';
import { completeOnboarding } from '@/../services/onboardingService';
import { OnboardingFormState, OnboardingResponseDTO } from '@/types/onboarding/onboarding';
import { FormErrors, REVIEW_STEP, STEP_COUNT, buildPayload, initialFormState, validateStep } from './_lib/form';
import { ComplianceStep, LaboratoryStep, OrganizationStep, Section, SuperAdminStep } from './_components/Steps';
import { ReviewStep } from './_components/ReviewStep';
import { Stepper, STEPS } from './_components/Stepper';
import { TermsModal } from './_components/TermsModal';

const OnboardingContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<OnboardingFormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState(1);
  const [furthest, setFurthest] = useState(1);
  const [completed, setCompleted] = useState<number[]>([]);
  // True while a single step is being edited from the review page: "Save" returns to review.
  const [editingFromReview, setEditingFromReview] = useState(false);
  const [termsRead, setTermsRead] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [errorScrollTick, setErrorScrollTick] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<OnboardingResponseDTO['data'] | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (token && email) {
      setForm((prev) => ({
        ...prev,
        token,
        superAdmin: { ...prev.superAdmin, email: email.toLowerCase() },
      }));
    } else if (!token && !email) {
      router.push('/onboarding/request');
    } else {
      toast.error('Invalid onboarding link. Please request a new verification email.', { autoClose: 5000 });
      router.push('/onboarding/request');
    }
  }, [searchParams, router]);

  const goTo = useCallback((next: number) => {
    setStep(next);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const update = useCallback(
    <S extends Section>(section: S, patch: Partial<OnboardingFormState[S]>) => {
      setForm((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));
      setErrors((prev) => {
        const keys = Object.keys(patch).map((key) => `${section}.${key}`);
        // Changing a value can also invalidate dependent fields (dates, same-as-org copies)
        if (!keys.some((key) => key in prev)) return prev;
        const next = { ...prev };
        keys.forEach((key) => delete next[key]);
        return next;
      });
    },
    []
  );

  // Show inline errors and scroll the first one into view once it has rendered.
  const showErrors = (stepErrors: FormErrors) => {
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    setErrorScrollTick((tick) => tick + 1);
  };

  useEffect(() => {
    if (!errorScrollTick) return;
    document.querySelector('[data-field-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [errorScrollTick]);

  const markCompleted =(n: number) => setCompleted((prev) => (prev.includes(n) ? prev : [...prev, n]));

  const handleNext = () => {
    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length) {
      showErrors(stepErrors);
      return;
    }
    markCompleted(step);
    if (editingFromReview) {
      setEditingFromReview(false);
      goTo(REVIEW_STEP);
      return;
    }
    const next = Math.min(step + 1, STEP_COUNT);
    setFurthest((prev) => Math.max(prev, next));
    goTo(next);
  };

  const handleBack = () => goTo(Math.max(step - 1, 1));

  // Jump to a section from the review page (or via the stepper once the review was reached).
  const handleEdit = (target: number) => {
    setEditingFromReview(furthest >= REVIEW_STEP);
    goTo(target);
  };

  const handleSubmit = async () => {
    if (!termsRead || !form.consent.termsAccepted || !form.consent.authorizedToRegister) {
      showErrors(validateStep(REVIEW_STEP, form));
      return;
    }

    // Re-validate everything; send the user to the first broken section.
    for (let n = 1; n <= 4; n++) {
      const stepErrors = validateStep(n, form);
      if (Object.keys(stepErrors).length) {
        setCompleted((prev) => prev.filter((c) => c !== n));
        setEditingFromReview(true);
        goTo(n);
        showErrors(stepErrors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const { data, files } = buildPayload(form);
      const response = await completeOnboarding(data, files);
      if (response.status === 'success') {
        setSubmitted(response.data);
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to complete onboarding. Please try again.';
      toast.error(message, { autoClose: 5000, position: 'top-center' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepProps = { form, errors, update };
  const canSubmit = form.consent.authorizedToRegister && form.consent.termsAccepted && termsRead;

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-white to-primary-100/60 px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl">
          <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-4xl text-success-700">
            <FaCheckCircle />
          </span>
          <h1 className="mb-2 text-2xl font-bold text-primary-900">Registration Submitted</h1>
          <p className="mb-1 text-gray-600">
            <strong>{submitted.labName}</strong> has been registered for verification.
          </p>
          <p className="mb-6 text-sm text-gray-500">
            TiaMeds Admin will review your details and documents. Laboratory access is enabled only after approval, and
            we may contact you for additional information.
          </p>
          <Link
            href="/user-login"
            className="inline-flex items-center justify-center rounded-lg bg-primary-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const isLast = step === REVIEW_STEP;
  const nextLabel = editingFromReview ? 'Save & Return to Review' : step === REVIEW_STEP - 1 ? 'Review' : 'Next';

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-primary-100/30 to-secondary-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div ref={topRef} className="mb-6 flex items-center gap-4 scroll-mt-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-700 text-xl text-white shadow-md">
            <FaFlask />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">Register your Laboratory</h1>
            <p className="text-sm text-gray-600">
              Step {step} of {STEP_COUNT} · {STEPS[step - 1].title}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-primary-200/60">
          <div className="border-b border-gray-100 bg-gray-50/60 px-4 py-5 sm:px-8">
            <Stepper current={step} furthest={furthest} completed={completed} onNavigate={handleEdit} />
          </div>

          {editingFromReview && (
            <div className="border-b border-primary-200 bg-primary-100/60 px-4 py-2.5 text-sm text-primary-900 sm:px-8">
              Editing <strong>{STEPS[step - 1].title}</strong> — save to go back to the review page.
            </div>
          )}

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (isLast) handleSubmit();
              else handleNext();
            }}
            className="px-4 py-6 sm:px-8 sm:py-8"
          >
            {step === 1 && <SuperAdminStep {...stepProps} />}
            {step === 2 && <OrganizationStep {...stepProps} />}
            {step === 3 && <LaboratoryStep {...stepProps} />}
            {step === 4 && <ComplianceStep {...stepProps} />}
            {step === 5 && (
              <ReviewStep {...stepProps} termsRead={termsRead} onEdit={handleEdit} onOpenTerms={() => setShowTerms(true)} />
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 pt-6">
              {!editingFromReview && step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <FaArrowLeft /> Previous
                </button>
              ) : (
                <span />
              )}

              {isLast ? (
                <button
                  type="submit"
                  disabled={isSubmitting || !canSubmit}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      Submit Registration <FaCheckCircle />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-800"
                >
                  {nextLabel} <FaArrowRight />
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/user-login" className="font-medium text-primary-700 hover:text-primary-900">
            Sign in
          </Link>
        </p>
      </div>

      {showTerms && (
        <TermsModal
          alreadyRead={termsRead}
          onClose={() => setShowTerms(false)}
          onAccept={() => {
            setTermsRead(true);
            update('consent', { termsAccepted: true });
            setShowTerms(false);
          }}
        />
      )}
    </div>
  );
};

const OnboardingPage = () => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-white to-primary-100/60">
        <FaSpinner className="animate-spin text-5xl text-primary-700" />
      </div>
    }
  >
    <OnboardingContent />
  </Suspense>
);

export default OnboardingPage;
