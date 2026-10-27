'use client';

import React from 'react';
import { FaPen } from 'react-icons/fa';
import { ALL_SERVICES } from '../_lib/constants';
import { effectiveGstin, effectiveLabAddress, effectivePan } from '../_lib/form';
import { CheckboxField } from './fields';
import { StepProps } from './Steps';

interface ReviewStepProps extends StepProps {
  termsRead: boolean;
  onEdit: (step: number) => void;
  onOpenTerms: () => void;
}

const Row = ({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) => (
  <div className={wide ? 'md:col-span-2' : undefined}>
    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
    <dd className="mt-0.5 break-words text-sm font-medium text-gray-900">{value?.trim() ? value : '—'}</dd>
  </div>
);

const ReviewCard = ({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-gray-200 bg-white">
    <header className="flex items-center justify-between gap-3 rounded-t-xl border-b border-gray-200 bg-primary-100/50 px-5 py-3">
      <h3 className="text-sm font-semibold text-primary-900">{title}</h3>
      <button
        type="button"
        onClick={() => onEdit(step)}
        aria-label={`Edit ${title}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary-300 bg-white px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-700 hover:text-white"
      >
        <FaPen className="text-[10px]" />
        Edit
      </button>
    </header>
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 px-5 py-4 md:grid-cols-2">{children}</dl>
  </section>
);

const formatAddress = (a: {
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pinCode: string;
}) =>
  [a.addressLine1, a.addressLine2, a.city, a.district, `${a.state} - ${a.pinCode}`, a.country]
    .filter((part) => part && part.trim() && !part.startsWith(' -'))
    .join(', ');

const formatDate = (iso: string) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

export const ReviewStep = ({ form, errors, update, termsRead, onEdit, onOpenTerms }: ReviewStepProps) => {
  const { superAdmin: s, organization: o, laboratory: l, compliance: c, consent } = form;
  const labAddress = effectiveLabAddress(form);
  const services = l.services.includes(ALL_SERVICES) ? 'All services' : l.services.join(', ');
  const wasteYes = c.biomedicalWasteGenerated === 'YES';
  const file = (f: File | null) => f?.name ?? '';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-primary-900">Review &amp; Submit</h2>
        <p className="text-sm text-gray-500">
          Check every section carefully. Use <span className="font-medium text-primary-700">Edit</span> on a section to
          change it — you will come straight back here afterwards.
        </p>
      </div>

      <ReviewCard title="Super Admin Information" step={1} onEdit={onEdit}>
        <Row label="Username" value={s.username} />
        <Row label="Email Address" value={s.email} />
        <Row label="First Name" value={s.firstName} />
        <Row label="Last Name" value={s.lastName} />
        <Row label="Mobile Number" value={s.phone} />
        <Row label="Password" value="••••••••" />
      </ReviewCard>

      <ReviewCard title="Organization Information" step={2} onEdit={onEdit}>
        <Row label="Organization Name" value={o.name} wide />
        <Row label="Organization Type" value={o.type} />
        <Row label="Contact Number" value={o.phone} />
        <Row label="Organization Email" value={o.email} wide />
        <Row label="Address" value={formatAddress(o)} wide />
        <Row label="PAN" value={o.pan} />
        <Row label="GSTIN" value={o.gstin} />
      </ReviewCard>

      <ReviewCard title="First Laboratory Information" step={3} onEdit={onEdit}>
        <Row label="Laboratory Name" value={l.name} wide />
        <Row label="Laboratory Type" value={l.type} />
        <Row label="Contact Number" value={l.phone} />
        <Row label="Laboratory Email" value={l.email} wide />
        <Row label="Services" value={services} wide />
        <Row
          label={l.sameAsOrganizationAddress ? 'Address (same as organization)' : 'Address'}
          value={formatAddress(labAddress)}
          wide
        />
      </ReviewCard>

      <ReviewCard title="Compliance Details" step={4} onEdit={onEdit}>
        <Row label="Establishment Registration No." value={c.establishmentRegistrationNumber} />
        <Row label="Issuing Authority" value={c.issuingAuthority} />
        <Row label="Issuing Date" value={formatDate(c.issuingDate)} />
        <Row label="Expiry Date" value={formatDate(c.expiryDate)} />
        <Row label="Registration Certificate" value={file(c.establishmentCertificate)} wide />
        <Row label="PAN" value={effectivePan(form)} />
        <Row label="GSTIN" value={effectiveGstin(form)} />
        <Row label="GSTIN Certificate" value={file(c.gstinCertificate)} wide />
        <Row label="Biomedical Waste Generated" value={wasteYes ? 'Yes' : c.biomedicalWasteGenerated ? 'No' : ''} />
        {wasteYes && (
          <>
            <Row label="Waste Authorization No." value={c.biomedicalWasteAuthorizationNumber} />
            <Row label="Waste Authorization Certificate" value={file(c.biomedicalWasteCertificate)} wide />
          </>
        )}
        <Row label="NABL Accreditation No." value={c.nablAccreditationNumber} />
        <Row label="NABL Certificate" value={file(c.nablCertificate)} />
      </ReviewCard>

      <section className="space-y-4 rounded-xl border border-primary-200 bg-primary-100/40 p-5">
        <CheckboxField
          checked={consent.authorizedToRegister}
          onChange={(checked) => update('consent', { authorizedToRegister: checked })}
          error={errors['consent.authorizedToRegister']}
        >
          I confirm that I am authorized to register this organization and laboratory.
        </CheckboxField>

        <div className="space-y-2">
          <CheckboxField
            checked={consent.termsAccepted}
            disabled={!termsRead}
            onChange={(checked) => update('consent', { termsAccepted: checked })}
            error={errors['consent.termsAccepted']}
          >
            I have read and agree to the TiaMeds{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onOpenTerms();
              }}
              className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-900"
            >
              Terms &amp; Conditions
            </button>{' '}
            and acknowledge the Privacy Notice.
          </CheckboxField>
          {!termsRead && (
            <p className="pl-7 text-xs text-gray-500">
              Open and read the Terms &amp; Conditions to enable this checkbox.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
