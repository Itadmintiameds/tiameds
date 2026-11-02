// Mirrors LabProfileController (GET /lab/admin/profile, PUT /lab/admin/me)

export interface ProfileUser {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    country?: string | null;
    roles: string[];
    createdAt?: string | null;
    updatedAt?: string | null;
}

// Only these fields are accepted by PUT /lab/admin/me (unknown fields are rejected with 400)
export interface ProfileUpdatePayload {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
}

export interface OrganizationDetails {
    name?: string | null;
    type?: string | null;
    email?: string | null;
    phone?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    country?: string | null;
    state?: string | null;
    district?: string | null;
    city?: string | null;
    pinCode?: string | null;
    pan?: string | null;
    gstin?: string | null;
}

export interface LabDetails {
    name?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    description?: string | null;
    licenseNumber?: string | null;
    labType?: string | null;
    labZip?: string | null;
    labCountry?: string | null;
    labPhone?: string | null;
    labEmail?: string | null;
    directorName?: string | null;
    directorEmail?: string | null;
    directorPhone?: string | null;
    labAccreditation?: string | null;
    certificationBody?: string | null;
    labCertificate?: string | null;
    directorGovtId?: string | null;
    labBusinessRegistration?: string | null;
    labLicense?: string | null;
    taxId?: string | null;
    labServices?: string[] | null;
    labAddressLine2?: string | null;
    labDistrict?: string | null;
    establishmentRegistrationNumber?: string | null;
    issuingAuthority?: string | null;
    issuingDate?: string | null;
    expiryDate?: string | null;
    labPan?: string | null;
    labGstin?: string | null;
    biomedicalWasteGenerated?: boolean | null;
    biomedicalWasteAuthorizationNumber?: string | null;
}

export type CertificateRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LabCertificateRequest {
    id: number;
    labId: number;
    labName?: string | null;
    documentType: string;
    requestedBy?: string | null;
    newFileUrl?: string | null;
    previousFileUrl?: string | null;
    issuingDate?: string | null;
    expiryDate?: string | null;
    status: CertificateRequestStatus;
    rejectionReason?: string | null;
    requestedAt?: string | null;
    reviewedAt?: string | null;
}

export interface ProfileLabSection {
    labId: number;
    labName: string;
    isActive?: boolean | null;
    approvalStatus?: string | null;
    details?: { organization?: OrganizationDetails | null; lab?: LabDetails | null } | null;
    // keyed by document type (labLogo, nablAccreditationCertificate, ...); value is a URL or null
    documents?: Record<string, string | null> | null;
    certificateRequests?: LabCertificateRequest[] | null;
}

export interface ProfileData {
    user: ProfileUser;
    labs: ProfileLabSection[];
}

export interface LabDetailsResponse {
    organization?: OrganizationDetails | null;
    lab?: LabDetails | null;
}

// Body of PUT /lab/admin/{labId}/onboarding-details. Missing field = unchanged; optional fields can be cleared with "".
export interface LabDetailsUpdatePayload {
    organization?: OrganizationDetails;
    lab?: LabDetails;
}

// Certificate types that go through approval (labLogo is not one of them)
export const CERTIFICATE_TYPES = [
    'establishmentRegistrationCertificate',
    'nablAccreditationCertificate',
    'gstinCertificate',
    'organizationGstinCertificate',
    'biomedicalWasteAuthorizationCertificate',
] as const;

// GET /lab/admin/lab-requests: the user's add-lab requests (the lab exists only once a platform admin approves)
export type LabRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LabRequestSummary {
    labName: string;
    labType?: string | null;
    labEmail?: string | null;
    labPhone?: string | null;
    city?: string | null;
    state?: string | null;
    approvalStatus: LabRequestStatus;
    requestType?: string | null;
    approvalRequestedAt?: string | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
}

export interface LabRequestSubmitResult {
    message: string;
    requestId?: number | null;
    approvalStatus?: LabRequestStatus | null;
    labName?: string | null;
}
