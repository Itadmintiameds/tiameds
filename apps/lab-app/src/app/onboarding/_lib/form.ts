import {
  AddressFields,
  OnboardingFiles,
  OnboardingFormState,
  OnboardingRequestDTO,
} from '@/types/onboarding/onboarding';
import { MAX_FILE_SIZE, STATE_CODES, TERMS_VERSION } from './constants';

export type FormErrors = Record<string, string>;

export const STEP_COUNT = 5;
export const REVIEW_STEP = 5;

export const initialFormState: OnboardingFormState = {
  token: '',
  superAdmin: {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  },
  organization: {
    name: '',
    type: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    country: 'India',
    state: '',
    district: '',
    city: '',
    pinCode: '',
    pan: '',
    gstin: '',
  },
  laboratory: {
    name: '',
    type: '',
    services: [],
    sameAsOrganizationAddress: false,
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    country: 'India',
    state: '',
    district: '',
    city: '',
    pinCode: '',
  },
  compliance: {
    establishmentRegistrationNumber: '',
    issuingAuthority: '',
    issuingDate: '',
    expiryDate: '',
    establishmentCertificate: null,
    panSameAsOrganization: false,
    pan: '',
    gstinSameAsOrganization: false,
    gstin: '',
    gstinCertificate: null,
    biomedicalWasteGenerated: '',
    biomedicalWasteAuthorizationNumber: '',
    biomedicalWasteCertificate: null,
    nablAccreditationNumber: '',
    nablCertificate: null,
  },
  consent: {
    authorizedToRegister: false,
    termsAccepted: false,
  },
};

// ---------------------------------------------------------------------------
// Derived values
// ---------------------------------------------------------------------------

const ADDRESS_KEYS: (keyof AddressFields)[] = [
  'addressLine1',
  'addressLine2',
  'country',
  'state',
  'district',
  'city',
  'pinCode',
];

/** Lab address with the "same as organization" checkbox applied. */
export const effectiveLabAddress = (form: OnboardingFormState): AddressFields => {
  const source = form.laboratory.sameAsOrganizationAddress ? form.organization : form.laboratory;
  return ADDRESS_KEYS.reduce((acc, key) => ({ ...acc, [key]: source[key] }), {} as AddressFields);
};

export const effectivePan = (form: OnboardingFormState): string =>
  form.compliance.panSameAsOrganization ? form.organization.pan : form.compliance.pan;

export const effectiveGstin = (form: OnboardingFormState): string =>
  form.compliance.gstinSameAsOrganization ? form.organization.gstin : form.compliance.gstin;

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PIN_RE = /^[1-9][0-9]{5}$/;
const NAME_RE = /^[a-zA-Z\s'.-]+$/;

const required = (value: string, label: string): string | null =>
  value.trim() ? null : `${label} is required`;

const maxLen = (value: string, label: string, max: number): string | null =>
  value.length > max ? `${label} must not exceed ${max} characters` : null;

const text = (value: string, label: string, max: number): string | null =>
  required(value, label) ?? maxLen(value, label, max);

const validatePersonName = (value: string, label: string): string | null =>
  required(value, label) ??
  (value.trim().length < 2 ? `${label} must be at least 2 characters` : null) ??
  maxLen(value, label, 50) ??
  (NAME_RE.test(value) ? null : `${label} can only contain letters, spaces, hyphens, apostrophes and periods`);

const validatePhone = (value: string, label: string): string | null =>
  required(value, label) ?? (/^\d{10}$/.test(value) ? null : `${label} must be exactly 10 digits`);

const validateEmail = (value: string, label: string): string | null =>
  required(value, label) ?? (EMAIL_RE.test(value) ? null : 'Please enter a valid email address');

const validatePassword = (value: string): string | null => {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (value.length > 50) return 'Password must not exceed 50 characters';
  if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
  if (!/\d/.test(value)) return 'Password must contain at least one number';
  return null;
};

const validateUsername = (value: string): string | null =>
  required(value, 'Username') ??
  (value.length < 3 ? 'Username must be at least 3 characters' : null) ??
  maxLen(value, 'Username', 30) ??
  (/^[a-zA-Z0-9]+$/.test(value) ? null : 'Username can only contain letters and numbers');

const validatePan = (value: string): string | null =>
  value && !PAN_RE.test(value) ? 'Enter a valid PAN (e.g. ABCDE1234F)' : null;

const validateGstin = (value: string, pan: string): string | null => {
  if (!value) return null;
  if (!GSTIN_RE.test(value)) return 'Enter a valid 15-character GSTIN (e.g. 22ABCDE1234F1Z5)';
  if (!STATE_CODES[value.slice(0, 2)]) return 'GSTIN has an invalid state code';
  if (pan && value.slice(2, 12) !== pan) return 'GSTIN does not match the PAN provided';
  return null;
};

const validatePin = (value: string): string | null =>
  required(value, 'PIN code') ?? (PIN_RE.test(value) ? null : 'PIN code must be 6 digits and cannot start with 0');

const validateFile = (file: File | null, label: string, isRequired: boolean): string | null => {
  if (!file) return isRequired ? `${label} is required` : null;
  if (file.size > MAX_FILE_SIZE) return `${label} must be smaller than 1 MB`;
  if (!/\.(pdf|jpe?g|png)$/i.test(file.name)) return `${label} must be a PDF, JPG or PNG file`;
  return null;
};

const validateAddress = (prefix: string, a: AddressFields, errors: FormErrors) => {
  const checks: [string, string | null][] = [
    ['addressLine1', text(a.addressLine1, 'Address line 1', 100)],
    ['addressLine2', maxLen(a.addressLine2, 'Address line 2', 100)],
    ['country', required(a.country, 'Country')],
    ['state', required(a.state, 'State / Union Territory')],
    ['district', required(a.district, 'District')],
    ['city', text(a.city, 'City / Town', 50)],
    ['pinCode', validatePin(a.pinCode)],
  ];
  checks.forEach(([key, error]) => {
    if (error) errors[`${prefix}.${key}`] = error;
  });
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export const validateStep = (step: number, form: OnboardingFormState): FormErrors => {
  const errors: FormErrors = {};
  const set = (key: string, error: string | null) => {
    if (error) errors[key] = error;
  };

  if (step === 1) {
    const s = form.superAdmin;
    set('superAdmin.firstName', validatePersonName(s.firstName, 'First name'));
    set('superAdmin.lastName', validatePersonName(s.lastName, 'Last name'));
    set('superAdmin.username', validateUsername(s.username));
    set('superAdmin.email', validateEmail(s.email, 'Email address'));
    set('superAdmin.phone', validatePhone(s.phone, 'Mobile number'));
    set('superAdmin.password', validatePassword(s.password));
    set(
      'superAdmin.confirmPassword',
      !s.confirmPassword
        ? 'Please confirm your password'
        : s.confirmPassword !== s.password
          ? 'Passwords do not match'
          : null
    );
  }

  if (step === 2) {
    const o = form.organization;
    set('organization.name', text(o.name, 'Organization name', 100));
    set('organization.type', required(o.type, 'Organization type'));
    set('organization.email', validateEmail(o.email, 'Organization email'));
    set('organization.phone', validatePhone(o.phone, 'Organization contact number'));
    validateAddress('organization', o, errors);
    set('organization.pan', validatePan(o.pan));
    set('organization.gstin', validateGstin(o.gstin, PAN_RE.test(o.pan) ? o.pan : ''));
  }

  if (step === 3) {
    const l = form.laboratory;
    set('laboratory.name', text(l.name, 'Laboratory name', 100));
    set('laboratory.type', required(l.type, 'Laboratory type'));
    set('laboratory.services', l.services.length ? null : 'Select at least one laboratory service');
    set('laboratory.phone', validatePhone(l.phone, 'Laboratory contact number'));
    set('laboratory.email', validateEmail(l.email, 'Laboratory email'));
    if (!l.sameAsOrganizationAddress) validateAddress('laboratory', l, errors);
  }

  if (step === 4) {
    const c = form.compliance;
    const pan = effectivePan(form);
    const today = todayIso();

    set('compliance.establishmentRegistrationNumber', text(c.establishmentRegistrationNumber, 'Registration number', 50));
    set('compliance.issuingAuthority', text(c.issuingAuthority, 'Issuing authority', 25));

    set(
      'compliance.issuingDate',
      !c.issuingDate ? 'Issuing date is required' : c.issuingDate > today ? 'Issuing date cannot be in the future' : null
    );
    set(
      'compliance.expiryDate',
      !c.expiryDate
        ? 'Expiry date is required'
        : c.issuingDate && c.expiryDate <= c.issuingDate
          ? 'Expiry date must be after the issuing date'
          : c.expiryDate < today
            ? 'The registration certificate has expired'
            : null
    );
    set('compliance.establishmentCertificate', validateFile(c.establishmentCertificate, 'Registration certificate', true));

    if (!c.panSameAsOrganization) set('compliance.pan', validatePan(c.pan));
    if (!c.gstinSameAsOrganization) set('compliance.gstin', validateGstin(c.gstin, PAN_RE.test(pan) ? pan : ''));
    // Spec lists the GSTIN certificate as mandatory even though GSTIN is optional.
    set('compliance.gstinCertificate', validateFile(c.gstinCertificate, 'GSTIN certificate', true));

    set('compliance.biomedicalWasteGenerated', c.biomedicalWasteGenerated ? null : 'Select Yes or No');
    if (c.biomedicalWasteGenerated === 'YES') {
      set(
        'compliance.biomedicalWasteAuthorizationNumber',
        text(c.biomedicalWasteAuthorizationNumber, 'Authorization number', 25)
      );
      set(
        'compliance.biomedicalWasteCertificate',
        validateFile(c.biomedicalWasteCertificate, 'Authorization certificate', true)
      );
    }

    set('compliance.nablAccreditationNumber', text(c.nablAccreditationNumber, 'NABL accreditation number', 25));
    set('compliance.nablCertificate', validateFile(c.nablCertificate, 'NABL certificate', true));
  }

  if (step === REVIEW_STEP) {
    if (!form.consent.authorizedToRegister) {
      errors['consent.authorizedToRegister'] = 'You must confirm you are authorized to register';
    }
    if (!form.consent.termsAccepted) {
      errors['consent.termsAccepted'] = 'You must read and accept the Terms & Conditions';
    }
  }

  return errors;
};

// ---------------------------------------------------------------------------
// Payload
// ---------------------------------------------------------------------------

const optional = (value: string): string | undefined => (value.trim() ? value.trim() : undefined);

export const buildPayload = (
  form: OnboardingFormState
): { data: OnboardingRequestDTO; files: OnboardingFiles } => {
  const { superAdmin: s, organization: o, laboratory: l, compliance: c, consent } = form;
  const labAddress = effectiveLabAddress(form);

  const data: OnboardingRequestDTO = {
    token: form.token,
    email: s.email,
    username: s.username,
    password: s.password,
    firstName: s.firstName.trim(),
    lastName: s.lastName.trim(),
    phone: s.phone,
    organization: {
      name: o.name.trim(),
      type: o.type,
      email: o.email,
      phone: o.phone,
      addressLine1: o.addressLine1.trim(),
      addressLine2: optional(o.addressLine2),
      country: o.country,
      state: o.state,
      district: o.district.trim(),
      city: o.city.trim(),
      pinCode: o.pinCode,
      pan: optional(o.pan),
      gstin: optional(o.gstin),
    },
    lab: {
      name: l.name.trim(),
      labType: l.type,
      services: l.services,
      addressLine1: labAddress.addressLine1.trim(),
      addressLine2: optional(labAddress.addressLine2),
      country: labAddress.country,
      state: labAddress.state,
      district: labAddress.district.trim(),
      city: labAddress.city.trim(),
      pinCode: labAddress.pinCode,
      labPhone: l.phone,
      labEmail: l.email,
      directorName: `${s.firstName} ${s.lastName}`.trim(),
      directorEmail: s.email,
      directorPhone: s.phone,
      labAccreditation: c.nablAccreditationNumber,
    },
    compliance: {
      establishmentRegistrationNumber: c.establishmentRegistrationNumber.trim(),
      issuingAuthority: c.issuingAuthority.trim(),
      issuingDate: c.issuingDate,
      expiryDate: c.expiryDate,
      pan: optional(effectivePan(form)),
      gstin: optional(effectiveGstin(form)),
      biomedicalWasteGenerated: c.biomedicalWasteGenerated === 'YES',
      biomedicalWasteAuthorizationNumber:
        c.biomedicalWasteGenerated === 'YES' ? optional(c.biomedicalWasteAuthorizationNumber) : undefined,
      nablAccreditationNumber: c.nablAccreditationNumber.trim(),
    },
    consent: {
      authorizedToRegister: consent.authorizedToRegister,
      termsAccepted: consent.termsAccepted,
      termsVersion: TERMS_VERSION,
      termsAcceptedAt: new Date().toISOString(),
    },
  };

  const files: OnboardingFiles = {
    establishmentCertificate: c.establishmentCertificate as File,
    gstinCertificate: c.gstinCertificate as File,
    nablCertificate: c.nablCertificate ?? undefined,
    biomedicalWasteCertificate:
      c.biomedicalWasteGenerated === 'YES' ? (c.biomedicalWasteCertificate ?? undefined) : undefined,
  };

  return { data, files };
};
