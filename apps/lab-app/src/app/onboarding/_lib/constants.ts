export const ORGANIZATION_TYPES = [
  'Proprietorship',
  'Partnership',
  'LLP',
  'Private Limited Company',
  'Public Limited Company',
  'Trust',
  'Society',
  'Government Institution',
  'Other',
];

export const LAB_TYPES = ['Clinical', 'Research', 'Diagnostic', 'Pathology', 'Other'];

export const ALL_SERVICES = 'All';

export const LAB_SERVICES = [
  'Clinical Pathology',
  'Biochemistry',
  'Haematology',
  'Microbiology',
  'Histopathology',
  'Cytopathology',
  'Serology',
  'Immunology',
  'Molecular Diagnostics',
  'Genetic Testing',
  'Ultrasound',
  'X-ray',
  'CT Scan',
  'MRI',
  'Blood Banking',
  'Sample Collection',
];

export const COUNTRIES = ['India'];

// GST state / UT codes -> name (also used to cross-check the GSTIN prefix)
export const STATE_CODES: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
};

export const STATES = Object.values(STATE_CODES).sort();

export const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
export const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png';

export const TERMS_VERSION = '1.0';
// Set this to the real effective date (DD/MM/YYYY) before release.
export const TERMS_EFFECTIVE_DATE = '[DD/MM/YYYY]';

export interface TermsSection {
  title: string;
  clauses: { id: string; text: string }[];
}

export const TERMS_INTRO =
  'By registering an organization and laboratory, the registering user acknowledges and agrees to the following terms.';

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: '1. Organization and Laboratory Registration',
    clauses: [
      { id: '1.1', text: 'The registering user confirms that they are authorized to register the organization and its laboratory on TiaMeds LMS.' },
      { id: '1.2', text: 'The information provided during registration must be accurate, complete and up to date.' },
      { id: '1.3', text: 'The registering user shall be designated as the Organization Super Admin, subject to successful registration approval.' },
      { id: '1.4', text: 'An organization may manage multiple laboratories through TiaMeds LMS. Each laboratory must be registered in the system.' },
      { id: '1.5', text: 'Submission of a registration request does not guarantee approval or immediate access to laboratory operations.' },
    ],
  },
  {
    title: '2. Registration Verification and Approval',
    clauses: [
      { id: '2.1', text: 'All new organization and laboratory registrations are subject to verification and approval by TiaMeds Admin.' },
      { id: '2.2', text: 'TiaMeds may request additional information, clarification or supporting documents during registration verification.' },
      { id: '2.3', text: 'TiaMeds may approve, reject or request corrections to a registration based on its eligibility requirements, verification findings and applicable law.' },
      { id: '2.4', text: 'Laboratory operational access shall not be provided before registration approval.' },
    ],
  },
  {
    title: '3. Regulatory Compliance',
    clauses: [
      { id: '3.1', text: 'The organization and laboratory are responsible for obtaining and maintaining all statutory registrations, licenses, permissions and authorizations applicable to their location and services.' },
      { id: '3.2', text: 'The laboratory must comply with applicable Indian central, state and local laws, including relevant clinical establishment, biomedical waste management and service-specific regulatory requirements.' },
      { id: '3.3', text: 'The laboratory must provide accurate regulatory information and genuine supporting documents when requested.' },
      { id: '3.4', text: 'The laboratory must not represent itself as NABL-accredited unless it holds valid accreditation covering the relevant activities.' },
      { id: '3.5', text: 'The laboratory is responsible for maintaining the validity of its statutory licenses and notifying TiaMeds of material changes affecting its eligibility to operate.' },
      { id: '3.6', text: 'Approval to use TiaMeds LMS does not constitute government registration, statutory licensing, regulatory accreditation or certification of the laboratory.' },
    ],
  },
  {
    title: '4. Organization Super Admin Responsibilities',
    clauses: [
      { id: '4.1', text: 'The Organization Super Admin is responsible for managing authorized users and access permissions within the organization.' },
      { id: '4.2', text: 'Login credentials must be kept secure and must not be shared with unauthorized individuals.' },
      { id: '4.3', text: 'The organization is responsible for ensuring that personnel using TiaMeds LMS have appropriate qualifications, authorizations and access permissions for their assigned activities.' },
      { id: '4.4', text: 'The organization must promptly notify TiaMeds of suspected unauthorized account access or security incidents affecting its use of the software.' },
    ],
  },
  {
    title: '5. Use of TiaMeds LMS',
    clauses: [
      { id: '5.1', text: 'TiaMeds LMS is intended to support authorized laboratory management activities, including patient registration, test management, sample tracking and report generation.' },
      { id: '5.2', text: 'The laboratory shall use the software only for lawful and authorized purposes.' },
      { id: '5.3', text: 'The laboratory is responsible for the accuracy of patient information, test results, medical interpretations and laboratory reports entered or approved by its personnel.' },
      { id: '5.4', text: 'The laboratory must ensure that reports are reviewed and authorized by appropriately qualified personnel as required by applicable law.' },
      { id: '5.5', text: 'TiaMeds LMS does not replace the professional judgement or regulatory responsibilities of laboratory personnel.' },
    ],
  },
  {
    title: '6. Data Protection and Confidentiality',
    clauses: [
      { id: '6.1', text: 'The organization must collect, use and disclose patient and laboratory information in accordance with applicable data protection and confidentiality requirements.' },
      { id: '6.2', text: 'TiaMeds will process information in accordance with its Privacy Notice, applicable law and any relevant contractual data-processing terms.' },
      { id: '6.3', text: 'The organization must ensure that access to patient information is restricted to authorized personnel.' },
      { id: '6.4', text: 'The parties shall implement appropriate safeguards to protect confidential and sensitive information, consistent with their respective legal and contractual responsibilities.' },
    ],
  },
  {
    title: '7. Changes to Registration Information',
    clauses: [
      { id: '7.1', text: 'The organization must maintain accurate laboratory profile and contact information.' },
      { id: '7.2', text: 'Material changes to laboratory ownership, location, services, licenses or regulatory status must be updated through the available TiaMeds workflows or communicated to TiaMeds where required.' },
      { id: '7.3', text: 'Certain changes may require additional verification before affected services can continue.' },
    ],
  },
  {
    title: '8. Suspension and Termination',
    clauses: [
      { id: '8.1', text: 'TiaMeds may restrict, suspend or terminate access where permitted by the applicable agreement or law, including in cases of material misrepresentation, serious security concerns or unlawful use.' },
      { id: '8.2', text: 'Where reasonably practicable and legally permissible, TiaMeds will provide notice of such action and an opportunity to address the concern.' },
      { id: '8.3', text: 'Suspension or termination shall not remove applicable legal obligations concerning patient information, confidentiality, record retention or regulatory compliance.' },
    ],
  },
  {
    title: '9. Software Availability and Responsibility',
    clauses: [
      { id: '9.1', text: 'TiaMeds will provide the software in accordance with the applicable subscription agreement and service commitments.' },
      { id: '9.2', text: 'Specific service availability, support, warranties, liability limitations and commercial terms shall be governed by the applicable agreement.' },
      { id: '9.3', text: 'The organization remains responsible for its clinical and laboratory operations and for complying with applicable professional and statutory requirements.' },
    ],
  },
  {
    title: '10. Acceptance of Terms',
    clauses: [
      { id: '10.1', text: 'By selecting the Terms & Conditions acceptance checkbox and submitting the registration, the registering user confirms that they have read and agreed to these Terms & Conditions on behalf of the organization they are authorized to represent.' },
      { id: '10.2', text: 'The system may retain an electronic record of acceptance, including the applicable terms version and acceptance timestamp.' },
      { id: '10.3', text: 'Material updates to these Terms & Conditions will be communicated and, where required, presented for renewed acceptance.' },
    ],
  },
];
