'use client';

import React, { useState } from 'react';
import {
  FaBuilding,
  FaFileAlt,
  FaFlask,
  FaInfoCircle,
  FaLock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRegBuilding,
  FaRegEnvelope,
  FaRegFileAlt,
  FaRegTrashAlt,
  FaRegUserCircle,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import { AddressFields, OnboardingFormState } from '@/types/onboarding/onboarding';
import {
  ALL_SERVICES,
  COUNTRIES,
  LAB_SERVICES,
  LAB_TYPES,
  ORGANIZATION_TYPES,
  STATES,
} from '../_lib/constants';
import { FormErrors, effectivePan, effectiveGstin } from '../_lib/form';
import { CheckboxField, Field, FileField, Grid, MultiSelectField, SelectField, TextField } from './fields';
import { Card } from './Layout';

export type Section = 'superAdmin' | 'organization' | 'laboratory' | 'compliance' | 'consent';

export interface StepProps {
  form: OnboardingFormState;
  errors: FormErrors;
  update: <S extends Section>(section: S, patch: Partial<OnboardingFormState[S]>) => void;
}

const digits = (value: string, max: number) => value.replace(/\D/g, '').slice(0, max);
const alnumUpper = (value: string, max: number) => value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, max);

// ---------------------------------------------------------------------------
// Step 1 - Super admin
// ---------------------------------------------------------------------------

export const SuperAdminStep = ({ form, errors, update }: StepProps) => {
  const s = form.superAdmin;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const err = (key: string) => errors[`superAdmin.${key}`];

  const toggle = (shown: boolean, set: (v: boolean) => void) => (
    <button
      type="button"
      onClick={() => set(!shown)}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className="text-gray-600 hover:text-secondary-700"
    >
      {shown ? <FaEyeSlash /> : <FaEye />}
    </button>
  );

  return (
    <>
      <Card icon={<FaRegUserCircle />} title="Account Details" description="Your details as the registering Super Admin.">
        <div className="mb-5 flex items-start gap-2.5 rounded-md bg-info-50 px-3.5 py-3 text-xs text-info-900">
          <FaInfoCircle className="mt-0.5 shrink-0" />
          <p>
            The registering user shall be designated as the Organization Super Admin, subject to successful registration
            approval.
          </p>
        </div>
        <Grid>
          <TextField
            label="First Name"
            required
            icon={<FaRegUserCircle />}
            value={s.firstName}
            maxLength={50}
            placeholder="Enter first name"
            error={err('firstName')}
            onChange={(v) => update('superAdmin', { firstName: v.replace(/[^a-zA-Z\s'.-]/g, '') })}
          />
          <TextField
            label="Last Name"
            required
            icon={<FaRegUserCircle />}
            value={s.lastName}
            maxLength={50}
            placeholder="Enter last name"
            error={err('lastName')}
            onChange={(v) => update('superAdmin', { lastName: v.replace(/[^a-zA-Z\s'.-]/g, '') })}
          />
          <TextField
            label="Username"
            required
            icon={<FaRegUserCircle />}
            value={s.username}
            maxLength={30}
            autoComplete="username"
            placeholder="Enter username"
            error={err('username')}
            onChange={(v) => update('superAdmin', { username: v.replace(/[^a-zA-Z0-9]/g, '') })}
          />
          <TextField
            label="Email Address"
            required
            type="email"
            icon={<FaRegEnvelope />}
            value={s.email}
            disabled
            placeholder="Enter email address"
            error={err('email')}
            onChange={() => undefined}
          />
          <TextField
            label="Mobile Number"
            required
            type="tel"
            icon={<FaPhoneAlt />}
            inputMode="numeric"
            value={s.phone}
            maxLength={10}
            placeholder="Enter mobile number"
            error={err('phone')}
            onChange={(v) => update('superAdmin', { phone: digits(v, 10) })}
          />
        </Grid>
      </Card>

      <Card icon={<FaLock />} title="Security" description="Choose a password to protect your account.">
        <Grid>
          <TextField
            label="Password"
            required
            icon={<FaLock />}
            type={showPassword ? 'text' : 'password'}
            value={s.password}
            maxLength={50}
            autoComplete="new-password"
            placeholder="Enter password"
            error={err('password')}
            trailing={toggle(showPassword, setShowPassword)}
            onChange={(v) => update('superAdmin', { password: v })}
          />
          <TextField
            label="Confirm Password"
            required
            icon={<FaLock />}
            type={showConfirm ? 'text' : 'password'}
            value={s.confirmPassword}
            maxLength={50}
            autoComplete="new-password"
            placeholder="Re-enter password"
            error={err('confirmPassword')}
            trailing={toggle(showConfirm, setShowConfirm)}
            onChange={(v) => update('superAdmin', { confirmPassword: v })}
          />
        </Grid>
      </Card>
    </>
  );
};

// ---------------------------------------------------------------------------
// Address block (shared by organization and laboratory)
// ---------------------------------------------------------------------------

interface AddressBlockProps {
  prefix: 'organization' | 'laboratory';
  value: AddressFields;
  errors: FormErrors;
  disabled?: boolean;
  onChange: (patch: Partial<AddressFields>) => void;
}

const AddressBlock = ({ prefix, value, errors, disabled, onChange }: AddressBlockProps) => {
  const err = (key: string) => (disabled ? undefined : errors[`${prefix}.${key}`]);
  const pin = <FaMapMarkerAlt />;
  return (
    <Grid>
      <TextField
        label="Address Line 1"
        required
        icon={pin}
        value={value.addressLine1}
        maxLength={100}
        disabled={disabled}
        placeholder="Enter address line 1"
        hint="Maximum 100 characters"
        error={err('addressLine1')}
        onChange={(v) => onChange({ addressLine1: v })}
      />
      <TextField
        label="Address Line 2"
        optional
        icon={pin}
        value={value.addressLine2}
        maxLength={100}
        disabled={disabled}
        placeholder="Enter address line 2"
        hint="Maximum 100 characters"
        error={err('addressLine2')}
        onChange={(v) => onChange({ addressLine2: v })}
      />
      <SelectField
        label="Country"
        required
        value={value.country}
        options={COUNTRIES}
        placeholder="Select country"
        disabled={disabled}
        error={err('country')}
        onChange={(v) => onChange({ country: v })}
      />
      <SelectField
        label="State / Union Territory"
        required
        value={value.state}
        options={STATES}
        placeholder="Select state / union territory"
        disabled={disabled}
        error={err('state')}
        onChange={(v) => onChange({ state: v })}
      />
      <TextField
        label="District"
        required
        value={value.district}
        maxLength={50}
        disabled={disabled}
        placeholder="Enter district"
        error={err('district')}
        onChange={(v) => onChange({ district: v })}
      />
      <TextField
        label="City / Town"
        required
        icon={pin}
        value={value.city}
        maxLength={50}
        disabled={disabled}
        placeholder="Enter city / town"
        hint="Maximum 50 characters"
        error={err('city')}
        onChange={(v) => onChange({ city: v })}
      />
      <TextField
        label="PIN Code"
        required
        icon={pin}
        inputMode="numeric"
        value={value.pinCode}
        maxLength={6}
        disabled={disabled}
        placeholder="Enter PIN code"
        error={err('pinCode')}
        onChange={(v) => onChange({ pinCode: digits(v, 6) })}
      />
    </Grid>
  );
};

// ---------------------------------------------------------------------------
// Step 2 - Organization
// ---------------------------------------------------------------------------

export const OrganizationStep = ({ form, errors, update }: StepProps) => {
  const o = form.organization;
  const err = (key: string) => errors[`organization.${key}`];

  return (
    <>
      <Card icon={<FaBuilding />} title="Organization Details" description="Basic details about your organization.">
        <Grid>
          <TextField
            label="Organization Name"
            required
            className="md:col-span-2"
            icon={<FaRegBuilding />}
            value={o.name}
            maxLength={100}
            placeholder="Enter organization name"
            hint="Maximum 100 characters"
            error={err('name')}
            onChange={(v) => update('organization', { name: v })}
          />
          <SelectField
            label="Organization Type"
            required
            icon={<FaRegBuilding />}
            value={o.type}
            options={ORGANIZATION_TYPES}
            placeholder="Select organization type"
            error={err('type')}
            onChange={(v) => update('organization', { type: v })}
          />
          <TextField
            label="Organization Email"
            required
            type="email"
            icon={<FaRegEnvelope />}
            value={o.email}
            placeholder="Enter organization email"
            error={err('email')}
            onChange={(v) => update('organization', { email: v.toLowerCase().trim() })}
          />
          <TextField
            label="Organization Mobile / Contact Number"
            required
            type="tel"
            icon={<FaPhoneAlt />}
            inputMode="numeric"
            value={o.phone}
            maxLength={10}
            placeholder="Enter mobile or contact number"
            error={err('phone')}
            onChange={(v) => update('organization', { phone: digits(v, 10) })}
          />
        </Grid>
      </Card>

      <Card icon={<FaMapMarkerAlt />} title="Registered Address" description="Where your organization is registered.">
        <AddressBlock prefix="organization" value={o} errors={errors} onChange={(patch) => update('organization', patch)} />
      </Card>

      <Card icon={<FaRegFileAlt />} title="Tax Details" description="Tax registration details of your organization.">
        <Grid>
          <TextField
            label="PAN"
            optional
            icon={<FaRegFileAlt />}
            value={o.pan}
            maxLength={10}
            placeholder="Enter PAN"
            error={err('pan')}
            onChange={(v) => update('organization', { pan: alnumUpper(v, 10) })}
          />
          <TextField
            label="GSTIN"
            required
            icon={<FaRegFileAlt />}
            value={o.gstin}
            maxLength={15}
            placeholder="Enter GSTIN"
            error={err('gstin')}
            onChange={(v) => update('organization', { gstin: alnumUpper(v, 15) })}
          />
          <FileField
            label="Organization GSTIN Certificate"
            required
            docType="organizationGstinCertificate"
            value={o.gstinCertificate}
            error={err('gstinCertificate')}
            onChange={(doc) => update('organization', { gstinCertificate: doc })}
          />
        </Grid>
      </Card>
    </>
  );
};

// ---------------------------------------------------------------------------
// Step 3 - First laboratory
// ---------------------------------------------------------------------------

export const LaboratoryStep = ({ form, errors, update }: StepProps) => {
  const l = form.laboratory;
  const err = (key: string) => errors[`laboratory.${key}`];

  const toggleService = (service: string) => {
    if (service === ALL_SERVICES) {
      const allSelected = l.services.includes(ALL_SERVICES);
      update('laboratory', { services: allSelected ? [] : [ALL_SERVICES, ...LAB_SERVICES] });
      return;
    }
    const next = l.services.includes(service)
      ? l.services.filter((s) => s !== service && s !== ALL_SERVICES)
      : [...l.services.filter((s) => s !== ALL_SERVICES), service];
    const everyIndividualSelected = LAB_SERVICES.every((s) => next.includes(s));
    update('laboratory', { services: everyIndividualSelected ? [ALL_SERVICES, ...LAB_SERVICES] : next });
  };

  return (
    <>
      <Card icon={<FaFlask />} title="Laboratory Details" description="Basic details about your first laboratory.">
        <Grid>
          <TextField
            label="Laboratory Name"
            required
            icon={<FaFlask />}
            value={l.name}
            maxLength={100}
            placeholder="Enter laboratory name"
            error={err('name')}
            onChange={(v) => update('laboratory', { name: v })}
          />
          <SelectField
            label="Laboratory Type"
            required
            icon={<FaFlask />}
            value={l.type}
            options={LAB_TYPES}
            placeholder="Select laboratory type"
            error={err('type')}
            onChange={(v) => update('laboratory', { type: v })}
          />
          <MultiSelectField
            label="Laboratory Services"
            required
            className="md:col-span-2"
            icon={<FaFlask />}
            selected={l.services}
            options={[ALL_SERVICES, ...LAB_SERVICES]}
            allOption={ALL_SERVICES}
            placeholder="Select laboratory services"
            error={err('services')}
            onToggle={toggleService}
          />
        </Grid>
      </Card>

      <Card icon={<FaMapMarkerAlt />} title="Laboratory Address" description="Where your laboratory is located.">
        <div className="mb-4">
          <CheckboxField
            checked={l.sameAsOrganizationAddress}
            onChange={(checked) => update('laboratory', { sameAsOrganizationAddress: checked })}
          >
            Same as Organization Address
          </CheckboxField>
        </div>
        <AddressBlock
          prefix="laboratory"
          value={l.sameAsOrganizationAddress ? form.organization : l}
          errors={errors}
          disabled={l.sameAsOrganizationAddress}
          onChange={(patch) => update('laboratory', patch)}
        />
      </Card>

      <Card
        icon={<FaPhoneAlt />}
        title="Laboratory Contact"
        description="How patients and TiaMeds can reach your laboratory."
      >
        <Grid>
          <TextField
            label="Laboratory Contact Number"
            required
            type="tel"
            icon={<FaPhoneAlt />}
            inputMode="numeric"
            value={l.phone}
            maxLength={10}
            placeholder="Enter contact number"
            error={err('phone')}
            onChange={(v) => update('laboratory', { phone: digits(v, 10) })}
          />
          <TextField
            label="Laboratory Email"
            required
            type="email"
            icon={<FaRegEnvelope />}
            value={l.email}
            placeholder="Enter laboratory email"
            error={err('email')}
            onChange={(v) => update('laboratory', { email: v.toLowerCase().trim() })}
          />
        </Grid>
      </Card>
    </>
  );
};

// ---------------------------------------------------------------------------
// Step 4 - Compliance
// ---------------------------------------------------------------------------

export const ComplianceStep = ({ form, errors, update }: StepProps) => {
  const c = form.compliance;
  const err = (key: string) => errors[`compliance.${key}`];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <Card
        icon={<FaShieldAlt />}
        title="Establishment Registration"
        description="Registration details and certificate for your laboratory."
      >
        <Grid>
          <TextField
            label="Establishment Registration Number"
            required
            icon={<FaRegFileAlt />}
            value={c.establishmentRegistrationNumber}
            maxLength={50}
            placeholder="Enter registration number"
            hint="Maximum 50 characters"
            error={err('establishmentRegistrationNumber')}
            onChange={(v) => update('compliance', { establishmentRegistrationNumber: v })}
          />
          <TextField
            label="Issuing Authority"
            required
            icon={<FaRegBuilding />}
            value={c.issuingAuthority}
            maxLength={25}
            placeholder="Enter issuing authority"
            hint="Maximum 25 characters"
            error={err('issuingAuthority')}
            onChange={(v) => update('compliance', { issuingAuthority: v })}
          />
          <TextField
            label="Issuing Date"
            required
            type="date"
            max={today}
            value={c.issuingDate}
            error={err('issuingDate')}
            onChange={(v) => update('compliance', { issuingDate: v })}
          />
          <TextField
            label="Expiry Date"
            required
            type="date"
            min={c.issuingDate || undefined}
            value={c.expiryDate}
            error={err('expiryDate')}
            onChange={(v) => update('compliance', { expiryDate: v })}
          />
          <FileField
            label="Establishment Registration Certificate"
            required
            docType="establishmentRegistrationCertificate"
            value={c.establishmentCertificate}
            error={err('establishmentCertificate')}
            onChange={(doc) => update('compliance', { establishmentCertificate: doc })}
          />
        </Grid>
      </Card>

      <Card icon={<FaFileAlt />} title="Tax Details" description="Reuse your organization details or enter new ones.">
        <Grid>
          <TextField
            label="PAN"
            optional
            icon={<FaRegFileAlt />}
            value={effectivePan(form)}
            maxLength={10}
            disabled={c.panSameAsOrganization}
            placeholder="Enter PAN"
            error={err('pan')}
            onChange={(v) => update('compliance', { pan: alnumUpper(v, 10) })}
            action={
              <CheckboxField
                checked={c.panSameAsOrganization}
                onChange={(checked) => update('compliance', { panSameAsOrganization: checked })}
              >
                Same as Organization
              </CheckboxField>
            }
          />
          <TextField
            label="GSTIN"
            required
            icon={<FaRegFileAlt />}
            value={effectiveGstin(form)}
            maxLength={15}
            disabled={c.gstinSameAsOrganization}
            placeholder="Enter GSTIN"
            error={err('gstin')}
            onChange={(v) => update('compliance', { gstin: alnumUpper(v, 15) })}
            action={
              <CheckboxField
                checked={c.gstinSameAsOrganization}
                onChange={(checked) => update('compliance', { gstinSameAsOrganization: checked })}
              >
                Same as Organization
              </CheckboxField>
            }
          />
          <FileField
            label="Upload Laboratory GSTIN Certificate"
            required
            docType="gstinCertificate"
            value={c.gstinCertificate}
            error={err('gstinCertificate')}
            onChange={(doc) => update('compliance', { gstinCertificate: doc })}
          />
        </Grid>
      </Card>

      <Card
        icon={<FaRegTrashAlt />}
        title="Biomedical Waste"
        description="Authorization details if your laboratory generates biomedical waste."
      >
        <div className="space-y-4">
          <Field label="Biomedical Waste Generated" required error={err('biomedicalWasteGenerated')}>
            <div className="flex gap-6" role="radiogroup" aria-label="Biomedical waste generated">
              {(['YES', 'NO'] as const).map((option) => (
                <label key={option} className="flex cursor-pointer items-center gap-2 text-[13px] text-gray-800">
                  <input
                    type="radio"
                    name="biomedicalWasteGenerated"
                    checked={c.biomedicalWasteGenerated === option}
                    onChange={() => update('compliance', { biomedicalWasteGenerated: option })}
                    className="h-4 w-4 cursor-pointer accent-secondary-700"
                  />
                  {option === 'YES' ? 'Yes' : 'No'}
                </label>
              ))}
            </div>
          </Field>
          {c.biomedicalWasteGenerated === 'YES' && (
            <Grid>
              <TextField
                label="Biomedical Waste Authorization Number"
                required
                icon={<FaRegFileAlt />}
                value={c.biomedicalWasteAuthorizationNumber}
                maxLength={25}
                placeholder="Enter authorization number"
                hint="Maximum 25 characters"
                error={err('biomedicalWasteAuthorizationNumber')}
                onChange={(v) => update('compliance', { biomedicalWasteAuthorizationNumber: v })}
              />
              <FileField
                label="Biomedical Waste Authorization Certificate"
                required
                docType="biomedicalWasteAuthorizationCertificate"
                value={c.biomedicalWasteCertificate}
                error={err('biomedicalWasteCertificate')}
                onChange={(doc) => update('compliance', { biomedicalWasteCertificate: doc })}
              />
            </Grid>
          )}
        </div>
      </Card>

      <Card icon={<FaShieldAlt />} title="NABL Accreditation" description="Accreditation details for your laboratory.">
        <Grid>
          <TextField
            label="NABL Accreditation Number"
            required
            icon={<FaRegFileAlt />}
            value={c.nablAccreditationNumber}
            maxLength={25}
            placeholder="Enter accreditation number"
            hint="Maximum 25 characters"
            error={err('nablAccreditationNumber')}
            onChange={(v) => update('compliance', { nablAccreditationNumber: v })}
          />
          <FileField
            label="NABL Accreditation Certificate"
            required
            docType="nablAccreditationCertificate"
            value={c.nablCertificate}
            error={err('nablCertificate')}
            onChange={(doc) => update('compliance', { nablCertificate: doc })}
          />
        </Grid>
      </Card>
    </>
  );
};
