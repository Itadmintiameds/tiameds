// Onboarding Types based on backend API

export interface EmailRequestDTO {
  email: string;
}

export interface EmailRequestResponse {
  status: string;
  message: string;
  data: null;
}

export interface VerificationResponseDTO {
  valid: boolean;
  email: string;
  message: string;
  redirectUrl: string;
}

export interface VerificationErrorResponse {
  status: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Form state (what the 5-step wizard edits)
// ---------------------------------------------------------------------------

export interface AddressFields {
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  district: string;
  city: string;
  pinCode: string;
}

export interface SuperAdminForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface OrganizationForm extends AddressFields {
  name: string;
  type: string;
  email: string;
  phone: string;
  pan: string;
  gstin: string;
}

export interface LaboratoryForm extends AddressFields {
  name: string;
  type: string;
  services: string[];
  sameAsOrganizationAddress: boolean;
  phone: string;
  email: string;
}

export interface ComplianceForm {
  establishmentRegistrationNumber: string;
  issuingAuthority: string;
  issuingDate: string;
  expiryDate: string;
  establishmentCertificate: File | null;
  panSameAsOrganization: boolean;
  pan: string;
  gstinSameAsOrganization: boolean;
  gstin: string;
  gstinCertificate: File | null;
  biomedicalWasteGenerated: '' | 'YES' | 'NO';
  biomedicalWasteAuthorizationNumber: string;
  biomedicalWasteCertificate: File | null;
  nablAccreditationNumber: string;
  nablCertificate: File | null;
}

export interface ConsentForm {
  authorizedToRegister: boolean;
  termsAccepted: boolean;
}

export interface OnboardingFormState {
  token: string;
  superAdmin: SuperAdminForm;
  organization: OrganizationForm;
  laboratory: LaboratoryForm;
  compliance: ComplianceForm;
  consent: ConsentForm;
}

// ---------------------------------------------------------------------------
// Request / response payloads
// ---------------------------------------------------------------------------

/**
 * JSON part of the registration request. Certificates are sent as separate
 * multipart file parts (see `OnboardingFiles`).
 */
export interface OnboardingRequestDTO {
  token: string;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;

  organization: {
    name: string;
    type: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    country: string;
    state: string;
    district: string;
    city: string;
    pinCode: string;
    pan?: string;
    gstin?: string;
  };

  lab: {
    name: string;
    labType: string;
    services: string[];
    addressLine1: string;
    addressLine2?: string;
    country: string;
    state: string;
    district: string;
    city: string;
    pinCode: string;
    labPhone: string;
    labEmail: string;
    // Legacy keys still populated from the super admin / compliance data
    directorName: string;
    directorEmail: string;
    directorPhone: string;
    labAccreditation: string;
  };

  compliance: {
    establishmentRegistrationNumber: string;
    issuingAuthority: string;
    issuingDate: string;
    expiryDate: string;
    pan?: string;
    gstin?: string;
    biomedicalWasteGenerated: boolean;
    biomedicalWasteAuthorizationNumber?: string;
    nablAccreditationNumber: string;
  };

  consent: {
    authorizedToRegister: boolean;
    termsAccepted: boolean;
    termsVersion: string;
    termsAcceptedAt: string;
  };
}

export interface OnboardingFiles {
  establishmentCertificate: File;
  gstinCertificate: File;
  biomedicalWasteCertificate?: File;
  nablCertificate?: File;
}

export interface OnboardingResponseDTO {
  status: string;
  message: string;
  data: {
    userId: number;
    username: string;
    email: string;
    labId: number;
    labName: string;
    accountActive: boolean;
  };
}
