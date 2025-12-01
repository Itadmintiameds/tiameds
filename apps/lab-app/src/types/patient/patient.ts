
export interface PatientTabItem {
  id: string;
  label: string;
  icon: JSX.Element;
}


export type Patient = {
  id?: number;
  /** New: backend patient code e.g. PAT1-00001 */
  patientCode?: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  bloodGroup: string;
  dateOfBirth: string;
  age: string;
  visit: Visit;
};

export type Visit = {
  visitId?: number;
  /** New: backend visit code e.g. VIS1-00001 */
  visitCode?: string;
  visitDate: string;
  visitType: VisitType;
  visitStatus: VisitStatus;
  visitCancellationReason?: string; // Optional field for cancellation reason
  visitCancellationDate?: string; // Optional field for cancellation date
  visitCancellationBy?: string; // Optional field for who cancelled the visit
  visitCancellationTime?: string; // Optional field for cancellation time
  visitTime?: string; // Optional field for visit time
  visitDescription: string;
  doctorId: number | string | null;
  testIds: number[];
  packageIds: number[];
  insuranceIds: number[];
  billing: Billing;
  listofeachtestdiscount?: listofDiscounts[];
  testResult?: TestResult[]; // Added test result array for individual test statuses
};

// Test result interface for individual test results
export interface TestResult {
  id?: number; // Optional for creation, required when returned from backend
  testId: number;
  isFilled: boolean;
  reportStatus: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type Billing = {
  billingId?: number;
  /** New: backend billing code e.g. BIL1-00001 */
  billingCode?: string;
  totalAmount: number | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  discount: number | null;
  netAmount: number | null;
  discountReason: string;
  discountPercentage: number | null;
  upi_id?: string;
  received_amount?: number | null;
  refund_amount?: number | null;
  upi_amount?: number | null;
  card_amount?: number | null;
  cash_amount?: number | null;
  due_amount?: number | null;
  transactions?: BillingTransaction[];
  gstRate?: number | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  billingTime?: string;
  billingDate?: string;
};


interface listofDiscounts {
  id: number;
  discountAmount: number;
  discountPercent: number;
  finalPrice: number;
}

// Enum for Payment Statuses
export enum PaymentStatus {
  DUE = 'DUE',// Represents an unknown payment status
  PAID = 'PAID',
}

// Enum for Payment Methods
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  UPI = 'UPI',
  UPI_CASH = 'UPI+CASH',
  CARD_CASH = 'CARD+CASH',
}

// Enum for Visit Types
export enum VisitType {
  IN_PATIENT = 'In-Patient',
  OUT_PATIENT = 'Out-Patient',
  DAYCARE = 'Day-Care',
  WAKING = 'Walk-In',
}

// Enum for Visit Statuses
export enum VisitStatus {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
  Collected = 'Collected',
}

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}
export enum DiscountReason {
  None = 'None',
  SeniorCitizen = 'Senior Citizen',
  Student = 'Student',
  HealthcareWorker = 'Healthcare Worker',
  CorporateTieUp = 'Corporate Tie-up',
  Referral = 'Referral',
  PreventiveCheckupCamp = 'Preventive Checkup Camp',
  Loyalty = 'Loyalty',
  DisabilitySupport = 'Disability Support',
  BelowPovertyLine = 'Below Poverty Line (BPL)',
  FestiveOffer = 'Festive or Seasonal Offer',
  PackageDiscount = 'Package Discount + Additional Test Discount',
}

export type BillingTransaction = {
  id?: number;
  /** New: backend transaction code e.g. TXN1-00001 */
  transactionCode?: string;
  billing_id?: number;
  payment_method: PaymentMethod | 'REFUND';
  upi_id?: string | null;
  upi_amount?: number | null;
  card_amount?: number | null;
  cash_amount?: number | null;
  received_amount: number;
  refund_amount?: number | null;
  due_amount: number;
  payment_date?: string;
  created_at?: string;
  createdBy?: string;
  remarks?: string;
};