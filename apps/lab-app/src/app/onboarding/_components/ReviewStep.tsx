'use client';

import React from 'react';
import { FaBuilding, FaClipboardCheck, FaFlask, FaShieldAlt, FaUserCircle } from 'react-icons/fa';
import { UploadedDocument } from '@/types/onboarding/onboarding';
import { ALL_SERVICES } from '../_lib/constants';
import { effectiveGstin, effectiveLabAddress, effectivePan } from '../_lib/form';
import { CheckboxField } from './fields';
import { Card } from './Layout';
import { StepProps } from './Steps';

interface ReviewStepProps extends StepProps {
  onEdit: (step: number) => void;
  onOpenTerms: () => void;
}

const Row = ({ label, value, file }: { label: string; value?: string | null; file?: boolean }) => (
  <div className="min-w-0">
    <dt className="text-[11px] text-gray-500">{label}</dt>
    <dd
      className={`mt-0.5 wrap-break-word text-xs font-medium ${file && value?.trim() ? 'text-secondary-700' : 'text-gray-900'}`}
    >
      {value?.trim() ? value : '-'}
    </dd>
  </div>
);

const ReviewCard = ({
  icon,
  title,
  step,
  onEdit,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) => (
  <Card
    icon={icon}
    title={title}
    action={
      <button
        type="button"
        onClick={() => onEdit(step)}
        aria-label={`Edit ${title}`}
        className="text-xs font-medium text-secondary-700 hover:text-secondary-900 hover:underline"
      >
        Edit
      </button>
    }
  >
    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">{children}</dl>
  </Card>
);

const formatDate = (iso: string) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

export const ReviewStep = ({ form, errors, update, onEdit, onOpenTerms }: ReviewStepProps) => {
  const { superAdmin: s, organization: o, laboratory: l, compliance: c, consent } = form;
  const a = effectiveLabAddress(form);
  const services = l.services.includes(ALL_SERVICES) ? 'All services' : l.services.join(', ');
  const wasteYes = c.biomedicalWasteGenerated === 'YES';
  const file = (f: UploadedDocument | null) => f?.name ?? '';

  return (
    <>
      <ReviewCard icon={<FaUserCircle />} title="Super Admin Information" step={1} onEdit={onEdit}>
        <Row label="First Name" value={s.firstName} />
        <Row label="Last Name" value={s.lastName} />
        <Row label="Username" value={s.username} />
        <Row label="Email Address" value={s.email} />
        <Row label="Mobile Number" value={s.phone} />
        <Row label="Password" value="••••••••" />
      </ReviewCard>

      <ReviewCard icon={<FaBuilding />} title="Organization Information" step={2} onEdit={onEdit}>
        <Row label="Organization Name" value={o.name} />
        <Row label="Organization Type" value={o.type} />
        <Row label="Organization Email" value={o.email} />
        <Row label="Organization Mobile / Contact Number" value={o.phone} />
        <Row label="Address Line 1" value={o.addressLine1} />
        <Row label="Address Line 2" value={o.addressLine2} />
        <Row label="Country" value={o.country} />
        <Row label="State / Union Territory" value={o.state} />
        <Row label="District" value={o.district} />
        <Row label="City / Town" value={o.city} />
        <Row label="PIN Code" value={o.pinCode} />
        <Row label="PAN" value={o.pan} />
        <Row label="GSTIN" value={o.gstin} />
        <Row label="Organization GSTIN Certificate" value={file(o.gstinCertificate)} file />
      </ReviewCard>

      <ReviewCard icon={<FaFlask />} title="First Laboratory Information" step={3} onEdit={onEdit}>
        <Row label="Laboratory Name" value={l.name} />
        <Row label="Laboratory Type" value={l.type} />
        <Row label="Laboratory Services" value={services} />
        <Row label="Address Line 1" value={a.addressLine1} />
        <Row label="Address Line 2" value={a.addressLine2} />
        <Row label="Country" value={a.country} />
        <Row label="State / Union Territory" value={a.state} />
        <Row label="District" value={a.district} />
        <Row label="City / Town" value={a.city} />
        <Row label="PIN Code" value={a.pinCode} />
        <Row label="Laboratory Contact Number" value={l.phone} />
        <Row label="Laboratory Email" value={l.email} />
      </ReviewCard>

      <ReviewCard icon={<FaShieldAlt />} title="All Compliance Details" step={4} onEdit={onEdit}>
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
      </ReviewCard>

      <Card
        icon={<FaClipboardCheck />}
        title="Authorization & Terms"
        description="Both confirmations are required to submit your registration."
      >
        <div className="space-y-3 rounded-md bg-secondary-50 p-4">
          <CheckboxField
            checked={consent.authorizedToRegister}
            onChange={(checked) => update('consent', { authorizedToRegister: checked })}
            error={errors['consent.authorizedToRegister']}
          >
            I confirm that I am authorized to register this organization and laboratory.
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
                onOpenTerms();
              }}
              className="font-medium text-secondary-700 hover:underline"
            >
              Terms &amp; Conditions
            </button>{' '}
            and acknowledge the{' '}
            <span className="font-medium text-secondary-700">Privacy Notice</span>.
          </CheckboxField>
        </div>
      </Card>
    </>
  );
};
