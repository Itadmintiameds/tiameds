
export interface LabFormData {
    name: string;
    address: string;
    city: string;
    state: string;
    description: string;
}



export interface LabFormDataNew {
  name: string;
  labType: string;
  description: string;
  address: string;
  city: string;
  state: string;
  labZip: string;
  labCountry: string;
  labLogo?: string;
  labPhone: string;
  labEmail: string;
  directorName: string;
  directorEmail: string;
  directorPhone: string;
  directorGovtId: string;
  licenseNumber: string;
  labBusinessRegistration: string;
  labLicense: string;
  taxId: string;
  labCertificate: string;
  labAccreditation: string;
  certificationBody: string;
  dataPrivacyAgreement: boolean;
  isActive: boolean;
}