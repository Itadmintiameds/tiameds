
export interface PatientTabItem {
  id: string;
  label: string;
  icon: JSX.Element;
}


export type Patient = {
  id?: number;
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
  visitDate: string;
  visitType: VisitType;
  visitStatus: VisitStatus;
  visitCancellationReason?: string; // Optional field for cancellation reason
  visitCancellationDate?: string; // Optional field for cancellation date
  vistCancellationBy?: string; // Optional field for who cancelled the visit
  visitCancellationTime?: string; // Optional field for cancellation time
  visitTime?: string; // Optional field for visit time
  visitDescription: string;
  doctorId: number | string | null;
  testIds: number[];
  packageIds: number[];
  insuranceIds: number[];
  billing: Billing;
  listofeachtestdiscount?: listofDiscounts[];
};

export type Billing = {
  billingId?: number;
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
  WAKING = 'Waking',
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
  billing_id?: number;
  payment_method: PaymentMethod;
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
};