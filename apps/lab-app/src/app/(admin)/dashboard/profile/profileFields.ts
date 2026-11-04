import { 
    // LabDetails, 
    OrganizationDetails } from '@/types/profile';

export interface FieldDef<T> {
    key: keyof T & string;
    label: string;
    required?: boolean;
    options?: string[];
}

// Mirrors LabOnboardingDetailsService: mandatory fields can be changed but never blanked,
// optional ones can be cleared. Issuing / expiry dates are not here: they change via an approved certificate request.
export const ORGANIZATION_TYPES = [
    'Proprietorship', 'Partnership', 'LLP', 'Private Limited Company', 'Public Limited Company',
    'Trust', 'Society', 'Government Institution', 'Other',
];

export const ORG_FIELDS: FieldDef<OrganizationDetails>[] = [
    { key: 'name', label: 'Organization Name' },
    { key: 'type', label: 'Organization Type', options: ORGANIZATION_TYPES },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'addressLine1', label: 'Address Line 1' },
    { key: 'addressLine2', label: 'Address Line 2' },
    { key: 'country', label: 'Country' },
    { key: 'state', label: 'State' },
    { key: 'district', label: 'District' },
    { key: 'city', label: 'City' },
    { key: 'pinCode', label: 'PIN Code' },
    { key: 'pan', label: 'PAN' },
    { key: 'gstin', label: 'GSTIN' },
];

export const inputClass =
    'h-10 px-3 rounded-sm border border-pneutral-200 bg-base-white text-p3 text-pneutral-900 outline-none focus:border-secondary-600';


export const asText = (v: unknown) => (v === null || v === undefined ? '' : String(v));
