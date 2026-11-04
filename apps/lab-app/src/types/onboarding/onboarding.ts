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

/** A document already uploaded to /public/onboarding/documents; only its URL is sent on submit. */
export interface UploadedDocument {
  name: string;
  url: string;
}

/** Multipart part names accepted by /public/onboarding/documents. */
export type OnboardingDocumentType =
  | 'organizationGstinCertificate'
  | 'gstinCertificate'
  | 'establishmentRegistrationCertificate'
  | 'biomedicalWasteAuthorizationCertificate'
  | 'nablAccreditationCertificate';

export interface OrganizationForm extends AddressFields {
  name: string;
  type: string;
  email: string;
  phone: string;
  pan: string;
  gstin: string;
  gstinCertificate: UploadedDocument | null;
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
  establishmentCertificate: UploadedDocument | null;
  panSameAsOrganization: boolean;
  pan: string;
  gstinSameAsOrganization: boolean;
  gstin: string;
  gstinCertificate: UploadedDocument | null;
  biomedicalWasteGenerated: '' | 'YES' | 'NO';
  biomedicalWasteAuthorizationNumber: string;
  biomedicalWasteCertificate: UploadedDocument | null;
  nablAccreditationNumber: string;
  nablCertificate: UploadedDocument | null;
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
 * JSON body for POST /public/onboarding/complete (mirrors the backend
 * OnboardingRequestDTO). Certificates are uploaded beforehand; their URLs go in the *Certificate fields.
 */
export interface OnboardingRequestDTO {
  token: string;

  // Super admin (user account). The address is required by the backend.
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;

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
    gstinCertificate?: string;
  };

  lab: {
    name: string;
    labType: string;
    description: string;
    address: string;
    city: string;
    state: string;
    labZip: string;
    labCountry: string;
    labPhone: string;
    labEmail: string;
    directorName: string;
    directorEmail: string;
    directorPhone: string;
    dataPrivacyAgreement: boolean;

    labServices: string[];
    sameAsOrganizationAddress: boolean;
    labAddressLine2?: string;
    labDistrict?: string;

    licenseNumber: string;
    establishmentRegistrationNumber: string;
    issuingAuthority: string;
    issuingDate: string;
    expiryDate: string;
    establishmentRegistrationCertificate?: string;

    labPan?: string;
    labPanSameAsOrganization: boolean;
    labGstin?: string;
    labGstinSameAsOrganization: boolean;
    gstinCertificate?: string;

    biomedicalWasteGenerated: boolean;
    biomedicalWasteAuthorizationNumber?: string;
    biomedicalWasteAuthorizationCertificate?: string;
    labAccreditation: string;
    nablAccreditationCertificate?: string;
  };

  registrationAuthorizationAccepted: boolean;
  termsAccepted: boolean;
  termsVersion: string;
}

/** Response of POST /public/onboarding/documents: uploaded part name -> file URL. */
export interface DocumentUploadResponse {
  status: string;
  message: string;
  data: Partial<Record<OnboardingDocumentType, string>> | null;
}

export interface OnboardingResponseDTO {
  status: string;
  message: string;
  data: {
    message: string;
    userId: number;
    username: string;
    email: string;
    labId: number;
    labName: string;
    accountActive: boolean;
    labApprovalStatus: string;
  };
}
