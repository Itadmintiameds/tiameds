
export type LabRegisterData = {
    labName: string;  // e.g., "ABC Diagnostic Laboratory"
    labType: string;  // e.g., "Diagnostic", "Research"
    licenseNumber: string;  // e.g., "12345-XYZ"

    labAddress: string;  // e.g., "123 Main St, Springfield"
    labCity: string;  // e.g., "Springfield"
    labState: string;  // e.g., "Illinois"
    labZip: string;  // e.g., "62701"
    labCountry: string;  // e.g., "USA"

    labPhone: string;  // e.g., "+1 123-456-7890"
    labEmail: string;  // e.g., "

    directorName: string;  // e.g., "Dr. John Doe"
    directorEmail: string;  // e.g., "
    directorPhone: string;  // e.g., "+1 123-456-7891"

    certificationBody: string;  // e.g., "ISO 9001"
    labCertificate: string;  // e.g., "lab_certificate.pdf"

    dataPrivacyAgreement: boolean;  // Boolean flag indicating whether the laboratory agrees to the data privacy terms

    directorGovtId: string;  // e.g., passport, national ID
    labBusinessRegistration: string;  // e.g., Certificate of Incorporation
    labLicense: string;  // e.g., medical testing license
    taxId: string;  // e.g., Tax Identification Number (TIN) or Employer Identification Number (EIN)
    labAccreditation: string;  // e.g., NABL, ISO 9001

};
