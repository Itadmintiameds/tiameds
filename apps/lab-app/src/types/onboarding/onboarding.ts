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

export interface LabDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  description?: string;
  licenseNumber: string;
  labType: string;
  labZip: string;
  labCountry: string;
  labPhone: string;
  labEmail: string;
  directorName: string;
  directorEmail: string;
  directorPhone: string;
  dataPrivacyAgreement: boolean;
}

export interface OnboardingRequestDTO {
  token: string;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  lab: LabDetails;
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

