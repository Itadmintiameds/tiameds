'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaClipboardCheck, FaFlask, FaShieldAlt, FaSpinner } from 'react-icons/fa';
import { getProfile } from '@/../services/profileService';
import { OnboardingFormState, UploadedDocument } from '@/types/onboarding/onboarding';
import { ALL_SERVICES } from '@/app/onboarding/_lib/constants';
import {
  FormErrors,
  buildPayload,
  effectiveGstin,
  effectiveLabAddress,
  effectivePan,
  initialFormState,
  validateStep,
} from '@/app/onboarding/_lib/form';
import { ComplianceStep, LaboratoryStep, Section } from '@/app/onboarding/_components/Steps';
import { Card, SidePanel } from '@/app/onboarding/_components/Layout';
import { CheckboxField } from '@/app/onboarding/_components/fields';
import { TermsModal } from '@/app/onboarding/_components/TermsModal';

// Same look and form pieces as the Super Admin onboarding, limited to the lab-specific steps
// (the Super Admin and organization already exist). Steps map onto onboarding validation steps 3, 4 and 5.
const FLOW_STEPS = [
  {
    number: 1,
    validationStep: 3,
    title: 'Laboratory Information',
    tip: 'Select every service your laboratory offers. You can reuse the organization address.',
    listTitle: 'Have these ready',
    list: [
      'Laboratory name and type.',
      'The services your laboratory offers.',
      'Laboratory address, or reuse the organization address.',
      'Laboratory contact number and email.',
    ],
  },
  {
    number: 2,
    validationStep: 4,
    title: 'Laboratory Compliance Details',
    tip: 'Keep each file under 1 MB so your documents upload smoothly.',
    listTitle: 'Documents to upload',
    list: [
      'Establishment Registration Certificate (maximum 1 MB).',
      'GSTIN Certificate.',
      'Biomedical Waste Authorization Certificate, if applicable.',
      'NABL Accreditation Certificate, if applicable.',
    ],
  },
  {
    number: 3,
    validationStep: 5,
    title: 'Review & Submit',
    tip: 'Take a moment to double-check names, numbers and certificates before submitting.',
    listTitle: 'Before you submit',
    list: [
      'Review each section and use Edit to correct anything.',
      'Confirm your authorization and accept the Terms & Conditions.',
    ],
  },
] as const;

const REVIEW = FLOW_STEPS.length;

interface Props {
  onClose: () => void;
  /** Sends the lab request to the backend (flat add-lab payload). Resolve to close the flow; throw to keep it open. */
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
}

const Row = ({ label, value, file }: { label: string; value?: string | null; file?: boolean }) => (
  <div className="min-w-0">
    <dt className="text-[11px] text-gray-500">{label}</dt>
    <dd className={`mt-0.5 wrap-break-word text-xs font-medium ${file && value?.trim() ? 'text-secondary-700' : 'text-gray-900'}`}>
      {value?.trim() ? value : '-'}
    </dd>
  </div>
);

const formatDate = (iso: string) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

const CreateLabFlow = ({ onClose, onSubmit }: Props) => {
  const topRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<OnboardingFormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState(1);
  const [furthest, setFurthest] = useState(1);
  const [completed, setCompleted] = useState<number[]>([]);
  const [editingFromReview, setEditingFromReview] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // The organization already exists: load it so "Same as Organization" (address, PAN, GSTIN) keeps working.
  useEffect(() => {
    getProfile()
      .then((profile) => {
        const u = profile.user;
        const org = profile.labs[0]?.details?.organization;
        setForm((prev) => ({
          ...prev,
          // The director of the new lab is the logged-in Super Admin
          superAdmin: {
            ...prev.superAdmin,
            firstName: u.firstName ?? '',
            lastName: u.lastName ?? '',
            email: u.email ?? '',
            phone: u.phone ?? '',
          },
          organization: !org ? prev.organization : {
            ...prev.organization,
            name: org.name ?? '',
            type: org.type ?? '',
            email: org.email ?? '',
            phone: org.phone ?? '',
            addressLine1: org.addressLine1 ?? '',
            addressLine2: org.addressLine2 ?? '',
            country: org.country ?? prev.organization.country,
            state: org.state ?? '',
            district: org.district ?? '',
            city: org.city ?? '',
            pinCode: org.pinCode ?? '',
            pan: org.pan ?? '',
            gstin: org.gstin ?? '',
          },
        }));
      })
      .catch(() => undefined);
  }, []);

  const goTo = useCallback((next: number) => {
    setStep(next);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const update = useCallback(<S extends Section>(section: S, patch: Partial<OnboardingFormState[S]>) => {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));
    setErrors((prev) => {
      const keys = Object.keys(patch).map((key) => `${section}.${key}`);
      if (!keys.some((key) => key in prev)) return prev;
      const next = { ...prev };
      keys.forEach((key) => delete next[key]);
      return next;
    });
  }, []);

  const showErrors = (stepErrors: FormErrors) => {
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    setTimeout(() => document.querySelector('[data-field-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const stepErrorsFor = (n: number) => validateStep(FLOW_STEPS[n - 1].validationStep, form);

  const handleNext = () => {
    const stepErrors = stepErrorsFor(step);
    if (Object.keys(stepErrors).length) {
      showErrors(stepErrors);
      return;
    }
    setCompleted((prev) => (prev.includes(step) ? prev : [...prev, step]));
    if (editingFromReview) {
      setEditingFromReview(false);
      goTo(REVIEW);
      return;
    }
    const next = Math.min(step + 1, REVIEW);
    setFurthest((prev) => Math.max(prev, next));
    goTo(next);
  };

  const handleEdit = (target: number) => {
    setEditingFromReview(furthest >= REVIEW);
    goTo(target);
  };

  const handleSubmit = async () => {
    if (!form.consent.termsAccepted || !form.consent.authorizedToRegister) {
      showErrors(stepErrorsFor(REVIEW));
      return;
    }
    for (let n = 1; n < REVIEW; n++) {
      const stepErrors = stepErrorsFor(n);
      if (Object.keys(stepErrors).length) {
        setCompleted((prev) => prev.filter((c) => c !== n));
        setEditingFromReview(true);
        goTo(n);
        showErrors(stepErrors);
        return;
      }
    }
    setSubmitting(true);
    try {
      const full = buildPayload(form);
      // add-lab takes one flat object: the lab fields, the organization block and the terms acceptance.
      // The organization certificate is not sent (add-lab accepts only freshly uploaded files).
      const { gstinCertificate: _orgCertificate, ...organization } = full.organization;
      void _orgCertificate;
      await onSubmit({
        ...full.lab,
        organization,
        registrationAuthorizationAccepted: full.registrationAuthorizationAccepted,
        termsAccepted: full.termsAccepted,
        termsVersion: full.termsVersion,
      });
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create lab. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const meta = FLOW_STEPS[step - 1];
  const isLast = step === REVIEW;
  const stepProps = { form, errors, update };

  const { laboratory: l, compliance: c, consent } = form;
  const a = effectiveLabAddress(form);
  const wasteYes = c.biomedicalWasteGenerated === 'YES';
  const file = (f: UploadedDocument | null) => f?.name ?? '';

  return (
    <div className="space-y-4">
      <div ref={topRef} className="scroll-mt-4">
        {/* Stepper (same visual as onboarding) */}
        <nav aria-label="New lab progress" className="rounded-2xl bg-white px-2 py-4 shadow-sm ring-1 ring-secondary-100 sm:px-4">
          <ol className="flex items-start">
            {FLOW_STEPS.map((s, index) => {
              const active = s.number === step;
              const done = !active && completed.includes(s.number);
              const reachable = !active && s.number <= furthest;
              const line = (on: boolean) => `h-0.5 flex-1 transition-colors ${on ? 'bg-success-700' : 'bg-gray-200'}`;
              return (
                <li key={s.number} className="flex-1">
                  <button
                    type="button"
                    disabled={!reachable}
                    onClick={() => handleEdit(s.number)}
                    aria-current={active ? 'step' : undefined}
                    className="flex w-full flex-col items-center gap-2 disabled:cursor-default"
                  >
                    <span className="flex w-full items-center">
                      {index > 0 ? <span aria-hidden className={line(completed.includes(s.number - 1))} /> : <span className="flex-1" />}
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                          done
                            ? 'border-success-700 bg-success-50 text-success-800'
                            : active
                              ? 'border-secondary-700 bg-secondary-700 text-white'
                              : 'border-gray-300 bg-white text-gray-500'
                        }`}
                      >
                        {done ? <FaCheck className="text-[10px]" /> : s.number}
                      </span>
                      {index < FLOW_STEPS.length - 1 ? (
                        <span aria-hidden className={line(done || completed.includes(s.number))} />
                      ) : (
                        <span className="flex-1" />
                      )}
                    </span>
                    <span
                      className={`hidden px-1 text-center font-heading text-[11px] font-semibold leading-tight sm:block ${
                        active || done ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {s.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {editingFromReview && (
        <div className="rounded-md bg-secondary-100 px-4 py-2.5 text-xs text-secondary-900">
          Editing <strong>{meta.title}</strong> — continue to go back to the review page.
        </div>
      )}

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
          {step === 1 && <LaboratoryStep {...stepProps} />}
          {step === 2 && <ComplianceStep {...stepProps} />}
          {step === 3 && (
            <>
              <Card
                icon={<FaFlask />}
                title="Laboratory Information"
                action={
                  <button type="button" onClick={() => handleEdit(1)} className="text-xs font-medium text-secondary-700 hover:underline">
                    Edit
                  </button>
                }
              >
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <Row label="Laboratory Name" value={l.name} />
                  <Row label="Laboratory Type" value={l.type} />
                  <Row label="Laboratory Services" value={l.services.includes(ALL_SERVICES) ? 'All services' : l.services.join(', ')} />
                  <Row label="Address Line 1" value={a.addressLine1} />
                  <Row label="Address Line 2" value={a.addressLine2} />
                  <Row label="Country" value={a.country} />
                  <Row label="State / Union Territory" value={a.state} />
                  <Row label="District" value={a.district} />
                  <Row label="City / Town" value={a.city} />
                  <Row label="PIN Code" value={a.pinCode} />
                  <Row label="Laboratory Contact Number" value={l.phone} />
                  <Row label="Laboratory Email" value={l.email} />
                </dl>
              </Card>

              <Card
                icon={<FaShieldAlt />}
                title="All Compliance Details"
                action={
                  <button type="button" onClick={() => handleEdit(2)} className="text-xs font-medium text-secondary-700 hover:underline">
                    Edit
                  </button>
                }
              >
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <Row label="Establishment Registration Number" value={c.establishmentRegistrationNumber} />
                  <Row label="Issuing Authority" value={c.issuingAuthority} />
                  <Row label="Issuing Date" value={formatDate(c.issuingDate)} />
                  <Row label="Expiry Date" value={formatDate(c.expiryDate)} />
                  <Row label="Establishment Registration Certificate" value={file(c.establishmentCertificate)} file />
                  <Row label="PAN" value={effectivePan(form)} />
                  <Row label="GSTIN" value={effectiveGstin(form)} />
                  <Row label="Laboratory GSTIN Certificate" value={file(c.gstinCertificate)} file />
                  <Row label="Biomedical Waste Generated" value={wasteYes ? 'Yes' : c.biomedicalWasteGenerated ? 'No' : ''} />
                  {wasteYes && (
                    <>
                      <Row label="Biomedical Waste Authorization Number" value={c.biomedicalWasteAuthorizationNumber} />
                      <Row label="Biomedical Waste Authorization Certificate" value={file(c.biomedicalWasteCertificate)} file />
                    </>
                  )}
                  <Row label="NABL Accreditation Number" value={c.nablAccreditationNumber} />
                  <Row label="NABL Accreditation Certificate" value={file(c.nablCertificate)} file />
                </dl>
              </Card>

              <Card icon={<FaClipboardCheck />} title="Authorization & Terms" description="Both confirmations are required to create the laboratory.">
                <div className="space-y-3 rounded-md bg-secondary-50 p-4">
                  <CheckboxField
                    checked={consent.authorizedToRegister}
                    onChange={(checked) => update('consent', { authorizedToRegister: checked })}
                    error={errors['consent.authorizedToRegister']}
                  >
                    I confirm that I am authorized to register this laboratory.
                  </CheckboxField>
                  <CheckboxField
                    checked={consent.termsAccepted}
                    onChange={(checked) => update('consent', { termsAccepted: checked })}
                    error={errors['consent.termsAccepted']}
                  >
                    I have read and agree to the TiaMeds{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTerms(true);
                      }}
                      className="font-medium text-secondary-700 hover:underline"
                    >
                      Terms &amp; Conditions
                    </button>
                    .
                  </CheckboxField>
                </div>
              </Card>
            </>
          )}

          <div className="flex items-center justify-between gap-3 pb-2 pt-2">
            {!editingFromReview && step > 1 ? (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="rounded-md border border-secondary-700 bg-white px-6 py-2 text-xs font-semibold text-secondary-700 transition-colors hover:bg-secondary-50"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-6 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isLast && (submitting || !(consent.authorizedToRegister && consent.termsAccepted))}
              className="inline-flex items-center gap-2 rounded-md bg-primary-800 px-6 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-900 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isLast ? (
                submitting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Creating...
                  </>
                ) : (
                  'Create Laboratory'
                )
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </form>

        <SidePanel tip={meta.tip} listTitle={meta.listTitle} items={[...meta.list]} />
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
};

export default CreateLabFlow;
