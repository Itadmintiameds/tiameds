'use client';

import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
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
import { CheckboxField, Field, FileField, FormSection, Grid, MultiSelectField, SelectField, TextField } from './fields';

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
      className="text-gray-400 hover:text-primary-700"
    >
      {shown ? <FaEyeSlash /> : <FaEye />}
    </button>
  );

  return (
    <FormSection title="Super Admin Details" description="This person becomes the Organization Super Admin once the registration is approved.">
      <Grid>
        <TextField
          label="Username"
          required
          value={s.username}
          maxLength={30}
          autoComplete="username"
          placeholder="3-30 letters or numbers"
          error={err('username')}
          onChange={(v) => update('superAdmin', { username: v.replace(/[^a-zA-Z0-9]/g, '') })}
        />
        <TextField
          label="Email Address"
          required
          type="email"
          value={s.email}
          disabled
          hint="Verified email from your registration link"
          error={err('email')}
          onChange={() => undefined}
        />
        <TextField
          label="First Name"
          required
          value={s.firstName}
          maxLength={50}
          placeholder="Enter first name"
          error={err('firstName')}
          onChange={(v) => update('superAdmin', { firstName: v.replace(/[^a-zA-Z\s'.-]/g, '') })}
        />
        <TextField
          label="Last Name"
          required
          value={s.lastName}
          maxLength={50}
          placeholder="Enter last name"
          error={err('lastName')}
          onChange={(v) => update('superAdmin', { lastName: v.replace(/[^a-zA-Z\s'.-]/g, '') })}
        />
        <TextField
          label="Mobile Number"
          required
          type="tel"
          inputMode="numeric"
          value={s.phone}
          maxLength={10}
          placeholder="10 digit mobile number"
          error={err('phone')}
          onChange={(v) => update('superAdmin', { phone: digits(v, 10) })}
        />
        <div className="hidden md:block" />
        <TextField
          label="Password"
          required
          type={showPassword ? 'text' : 'password'}
          value={s.password}
          maxLength={50}
          autoComplete="new-password"
          placeholder="Min 8 chars, upper, lower & number"
          error={err('password')}
          trailing={toggle(showPassword, setShowPassword)}
          onChange={(v) => update('superAdmin', { password: v })}
        />
        <TextField
          label="Confirm Password"
          required
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
    </FormSection>
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
  return (
    <Grid>
      <TextField
        label="Address Line 1"
        required
        className="md:col-span-2"
        value={value.addressLine1}
        maxLength={100}
        disabled={disabled}
        placeholder="Building, street"
        error={err('addressLine1')}
        onChange={(v) => onChange({ addressLine1: v })}
      />
      <TextField
        label="Address Line 2"
        optional
        className="md:col-span-2"
        value={value.addressLine2}
        maxLength={100}
        disabled={disabled}
        placeholder="Landmark, area"
        error={err('addressLine2')}
        onChange={(v) => onChange({ addressLine2: v })}
      />
      <SelectField
        label="Country"
        required
        value={value.country}
        options={COUNTRIES}
        disabled={disabled}
        error={err('country')}
        onChange={(v) => onChange({ country: v })}
      />
      <SelectField
        label="State / Union Territory"
        required
        value={value.state}
        options={STATES}
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
        value={value.city}
        maxLength={50}
        disabled={disabled}
        placeholder="Enter city or town"
        error={err('city')}
        onChange={(v) => onChange({ city: v })}
      />
      <TextField
        label="PIN Code"
        required
        inputMode="numeric"
        value={value.pinCode}
        maxLength={6}
        disabled={disabled}
        placeholder="6 digit PIN code"
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
    <div className="space-y-8">
      <FormSection title="Organization Information">
        <Grid>
          <TextField
            label="Organization Name"
            required
            className="md:col-span-2"
            value={o.name}
            maxLength={100}
            placeholder="Registered name of the organization"
            error={err('name')}
            onChange={(v) => update('organization', { name: v })}
          />
          <SelectField
            label="Organization Type"
            required
            value={o.type}
            options={ORGANIZATION_TYPES}
            placeholder="Select organization type"
            error={err('type')}
            onChange={(v) => update('organization', { type: v })}
          />
          <TextField
            label="Organization Mobile / Contact Number"
            required
            type="tel"
            inputMode="numeric"
            value={o.phone}
            maxLength={10}
            placeholder="10 digit contact number"
            error={err('phone')}
            onChange={(v) => update('organization', { phone: digits(v, 10) })}
          />
          <TextField
            label="Organization Email"
            required
            type="email"
            className="md:col-span-2"
            value={o.email}
            placeholder="accounts@organization.com"
            error={err('email')}
            onChange={(v) => update('organization', { email: v.toLowerCase().trim() })}
          />
        </Grid>
      </FormSection>

      <FormSection title="Organization Address">
        <AddressBlock
          prefix="organization"
          value={o}
          errors={errors}
          onChange={(patch) => update('organization', patch)}
        />
      </FormSection>

      <FormSection title="Tax Details" description="Optional, but recommended for invoicing.">
        <Grid>
          <TextField
            label="PAN"
            optional
            value={o.pan}
            maxLength={10}
            placeholder="ABCDE1234F"
            error={err('pan')}
            onChange={(v) => update('organization', { pan: alnumUpper(v, 10) })}
          />
          <TextField
            label="GSTIN"
            optional
            value={o.gstin}
            maxLength={15}
            placeholder="22ABCDE1234F1Z5"
            error={err('gstin')}
            onChange={(v) => update('organization', { gstin: alnumUpper(v, 15) })}
          />
        </Grid>
      </FormSection>
    </div>
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
    <div className="space-y-8">
      <FormSection title="Laboratory Information">
        <Grid>
          <TextField
            label="Laboratory Name"
            required
            value={l.name}
            maxLength={100}
            placeholder="Name of your first laboratory"
            error={err('name')}
            onChange={(v) => update('laboratory', { name: v })}
          />
          <SelectField
            label="Laboratory Type"
            required
            value={l.type}
            options={LAB_TYPES}
            placeholder="Select laboratory type"
            error={err('type')}
            onChange={(v) => update('laboratory', { type: v })}
          />
          <TextField
            label="Laboratory Contact Number"
            required
            type="tel"
            inputMode="numeric"
            value={l.phone}
            maxLength={10}
            placeholder="10 digit contact number"
            error={err('phone')}
            onChange={(v) => update('laboratory', { phone: digits(v, 10) })}
          />
          <TextField
            label="Laboratory Email"
            required
            type="email"
            value={l.email}
            placeholder="lab@organization.com"
            error={err('email')}
            onChange={(v) => update('laboratory', { email: v.toLowerCase().trim() })}
          />
          <MultiSelectField
            label="Laboratory Services"
            required
            selected={l.services}
            options={[ALL_SERVICES, ...LAB_SERVICES]}
            allOption={ALL_SERVICES}
            placeholder="Select laboratory services"
            error={err('services')}
            onToggle={toggleService}
          />
        </Grid>
      </FormSection>

      <FormSection title="Laboratory Address">
        <CheckboxField
          checked={l.sameAsOrganizationAddress}
          onChange={(checked) => update('laboratory', { sameAsOrganizationAddress: checked })}
        >
          Same as organization address
        </CheckboxField>
        <AddressBlock
          prefix="laboratory"
          value={l.sameAsOrganizationAddress ? form.organization : l}
          errors={errors}
          disabled={l.sameAsOrganizationAddress}
          onChange={(patch) => update('laboratory', patch)}
        />
      </FormSection>
    </div>
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
    <FormSection title="Compliance and Documents">
      <Grid>
        <TextField
          label="Establishment Registration Number"
          required
          value={c.establishmentRegistrationNumber}
          maxLength={50}
          error={err('establishmentRegistrationNumber')}
          onChange={(v) => update('compliance', { establishmentRegistrationNumber: v })}
        />
        <FileField
          label="Establishment Registration Certificate"
          required
          file={c.establishmentCertificate}
          error={err('establishmentCertificate')}
          onChange={(file) => update('compliance', { establishmentCertificate: file })}
        />
        <TextField
          label="Issuing Authority"
          required
          value={c.issuingAuthority}
          maxLength={25}
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
        <TextField
          label="PAN"
          optional
          value={effectivePan(form)}
          maxLength={10}
          disabled={c.panSameAsOrganization}
          placeholder="ABCDE1234F"
          error={err('pan')}
          onChange={(v) => update('compliance', { pan: alnumUpper(v, 10) })}
          action={
            <CheckboxField
              checked={c.panSameAsOrganization}
              onChange={(checked) => update('compliance', { panSameAsOrganization: checked })}
            >
              <span className="text-xs">Same as organization</span>
            </CheckboxField>
          }
        />
        <TextField
          label="GSTIN"
          optional
          value={effectiveGstin(form)}
          maxLength={15}
          disabled={c.gstinSameAsOrganization}
          placeholder="22ABCDE1234F1Z5"
          error={err('gstin')}
          onChange={(v) => update('compliance', { gstin: alnumUpper(v, 15) })}
          action={
            <CheckboxField
              checked={c.gstinSameAsOrganization}
              onChange={(checked) => update('compliance', { gstinSameAsOrganization: checked })}
            >
              <span className="text-xs">Same as organization</span>
            </CheckboxField>
          }
        />
        <FileField
          label="GSTIN Certificate"
          required
          file={c.gstinCertificate}
          error={err('gstinCertificate')}
          onChange={(file) => update('compliance', { gstinCertificate: file })}
        />

        <Field
          label="Biomedical Waste Generated"
          required
          error={err('biomedicalWasteGenerated')}
        >
          <div className="flex gap-3" role="radiogroup" aria-label="Biomedical waste generated">
            {(['YES', 'NO'] as const).map((option) => {
              const active = c.biomedicalWasteGenerated === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => update('compliance', { biomedicalWasteGenerated: option })}
                  className={`min-w-24 rounded-lg border px-5 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'border-primary-700 bg-primary-700 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-100/60'
                  }`}
                >
                  {option === 'YES' ? 'Yes' : 'No'}
                </button>
              );
            })}
          </div>
        </Field>
        {c.biomedicalWasteGenerated === 'YES' && (
          <>
            <TextField
              label="Biomedical Waste Authorization Number"
              required
              value={c.biomedicalWasteAuthorizationNumber}
              maxLength={25}
              error={err('biomedicalWasteAuthorizationNumber')}
              onChange={(v) => update('compliance', { biomedicalWasteAuthorizationNumber: v })}
            />
            <FileField
              label="Biomedical Waste Authorization Certificate"
              required
              file={c.biomedicalWasteCertificate}
              error={err('biomedicalWasteCertificate')}
              onChange={(file) => update('compliance', { biomedicalWasteCertificate: file })}
            />
          </>
        )}

        <TextField
          label="NABL Accreditation Number"
          required
          value={c.nablAccreditationNumber}
          maxLength={25}
          error={err('nablAccreditationNumber')}
          onChange={(v) => update('compliance', { nablAccreditationNumber: v })}
        />
        <FileField
          label="NABL Accreditation Certificate"
          required
          file={c.nablCertificate}
          error={err('nablCertificate')}
          onChange={(file) => update('compliance', { nablCertificate: file })}
        />
      </Grid>
    </FormSection>
  );
};
