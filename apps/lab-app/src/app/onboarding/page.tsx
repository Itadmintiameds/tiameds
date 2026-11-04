'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaCheck, FaRegClock, FaSpinner } from 'react-icons/fa';
import { completeOnboarding } from '@/../services/onboardingService';
import { OnboardingFormState, OnboardingResponseDTO } from '@/types/onboarding/onboarding';
import { FormErrors, REVIEW_STEP, STEP_COUNT, buildPayload, initialFormState, validateStep } from './_lib/form';
import { ComplianceStep, LaboratoryStep, OrganizationStep, Section, SuperAdminStep } from './_components/Steps';
import { PageBanner, SidePanel } from './_components/Layout';
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
    if (!form.consent.termsAccepted || !form.consent.authorizedToRegister) {
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
      const response = await completeOnboarding(buildPayload(form));
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
  const canSubmit = form.consent.authorizedToRegister && form.consent.termsAccepted;

  if (submitted) {
    const allSteps = STEPS.map((s) => s.number);
    const next = [
      { title: 'Registration submitted', text: 'Your details have reached TiaMeds.', state: 'done' },
      { title: 'TiaMeds Admin review', text: 'Your registration is verified. Additional information may be requested.', state: 'active' },
      { title: 'Approval and access', text: 'Laboratory operational access is provided only after approval.', state: 'pending' },
    ] as const;

    return (
      <div className="min-h-screen bg-secondary-50 px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-4">
          <PageBanner
            icon={<FaCheck />}
            title="You're all set"
            description="Your registration is now with TiaMeds Admin for verification."
            pill={`${STEP_COUNT} of ${STEP_COUNT} complete`}
          />
          <Stepper current={0} furthest={STEP_COUNT} completed={allSteps} />

          <div className="rounded-2xl bg-white px-4 py-10 text-center shadow-sm sm:px-8">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary-50">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-50 text-2xl text-success-700">
                <FaCheck />
              </span>
            </span>
            <h2 className="mt-5 font-heading text-xl font-semibold text-gray-900">Registration Submitted</h2>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-gray-500">
              Your organization and first laboratory registration has been submitted. All new registrations are subject
              to verification and approval by TiaMeds Admin.
            </p>
            <span className="mt-4 inline-block rounded-full border border-danger-500 bg-danger-50 px-4 py-1 text-xs font-medium text-danger-700">
              Pending Approval
            </span>

            <div className="mt-8 rounded-xl bg-secondary-50 px-4 py-6">
              <h3 className="mb-5 font-heading text-sm font-semibold text-gray-900">What happens next</h3>
              <ol className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-0">
                {next.map((item, index) => (
                  <li key={item.title} className="flex flex-col items-center">
                    <span className="flex w-full items-center">
                      {index > 0 ? (
                        <span className={`h-0.5 flex-1 ${item.state === 'pending' ? 'bg-gray-200' : 'bg-success-700'}`} />
                      ) : (
                        <span className="flex-1" />
                      )}
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                          item.state === 'done'
                            ? 'border-success-700 bg-success-50 text-success-800'
                            : item.state === 'active'
                              ? 'border-secondary-700 bg-secondary-700 text-white'
                              : 'border-gray-300 bg-white text-gray-500'
                        }`}
                      >
                        {item.state === 'done' ? <FaCheck className="text-[10px]" /> : item.state === 'active' ? <FaRegClock className="text-[10px]" /> : index + 1}
                      </span>
                      {index < next.length - 1 ? (
                        <span className={`h-0.5 flex-1 ${item.state === 'done' ? 'bg-success-700' : 'bg-gray-200'}`} />
                      ) : (
                        <span className="flex-1" />
                      )}
                    </span>
                    <p
                      className={`mt-2 font-heading text-xs font-semibold ${item.state === 'pending' ? 'text-gray-500' : 'text-gray-900'}`}
                    >
                      {item.title}
                    </p>
                    <p className="mt-1 max-w-56 px-2 text-[11px] leading-snug text-gray-500">{item.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600">
            <Link href="/user-login" className="font-medium text-secondary-700 hover:underline">
              Go to Login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const isLast = step === REVIEW_STEP;
  const meta = STEPS[step - 1];
  const BannerIcon = meta.icon;

  return (
    <div className="min-h-screen bg-secondary-50 px-4 py-4 sm:py-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div ref={topRef} className="scroll-mt-4 space-y-4">
          <PageBanner
            icon={<BannerIcon />}
            title={meta.bannerTitle}
            description={meta.bannerText}
            pill={`Step ${step} of ${STEP_COUNT}`}
          />
          <Stepper current={step} furthest={furthest} completed={completed} onNavigate={handleEdit} />
        </div>

        {editingFromReview && (
          <div className="rounded-md bg-secondary-100 px-4 py-2.5 text-xs text-secondary-900">
            Editing <strong>{meta.title}</strong> — continue to go back to the review page.
          </div>
        )}

        <h2 className="pt-2 font-heading text-sm font-semibold text-gray-900">{meta.title}</h2>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_14.5rem]">
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (isLast) handleSubmit();
              else handleNext();
            }}
            className="space-y-4"
          >
            {step === 1 && <SuperAdminStep {...stepProps} />}
            {step === 2 && <OrganizationStep {...stepProps} />}
            {step === 3 && <LaboratoryStep {...stepProps} />}
            {step === 4 && <ComplianceStep {...stepProps} />}
            {step === 5 && <ReviewStep {...stepProps} onEdit={handleEdit} onOpenTerms={() => setShowTerms(true)} />}

            <div className="flex items-center justify-between gap-3 pb-6 pt-2">
              {isLast ? (
                <button
                  type="button"
                  onClick={() => handleEdit(1)}
                  className="rounded-md border border-secondary-700 bg-white px-5 py-2 text-xs font-semibold text-secondary-700 transition-colors hover:bg-secondary-50"
                >
                  Edit Information
                </button>
              ) : !editingFromReview && step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-md border border-secondary-700 bg-white px-6 py-2 text-xs font-semibold text-secondary-700 transition-colors hover:bg-secondary-50"
                >
                  Back
                </button>
              ) : (
                <span />
              )}

              <button
                type="submit"
                disabled={isLast && (isSubmitting || !canSubmit)}
                className="inline-flex items-center gap-2 rounded-md bg-primary-800 px-6 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-900 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isLast ? (
                  isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit Registration'
                  )
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </form>

          <SidePanel tip={meta.tip} listTitle={meta.listTitle} items={meta.list} />
        </div>
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
};

const OnboardingPage = () => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center bg-secondary-50">
        <FaSpinner className="animate-spin text-5xl text-secondary-700" />
      </div>
    }
  >
    <OnboardingContent />
  </Suspense>
);

export default OnboardingPage;
