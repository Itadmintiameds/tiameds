
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
  visit: Visit;
};

export type Visit = {
  visitId?: number;
  visitDate: string;
  visitType: VisitType;
  visitStatus: VisitStatus;
  visitDescription: string;
  doctorId: number;
  testIds: number[];
  packageIds: number[];
  insuranceIds: number[];
  billing: Billing;
  listofeachtestdiscount?: listofDiscounts[];
};

export type Billing = {
  billingId?: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  discount: number;
  gstRate: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  netAmount: number;
  discountReason : string;
  discountPercentage: number;
};


interface listofDiscounts {
  id: number;
  discountAmount: number;
  discountPercent: number;
  finalPrice: number;
}

// Enum for Payment Statuses
export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',// Represents an unknown payment status
}

// Enum for Payment Methods
export enum PaymentMethod {
  CASH = 'Cash',
  CARD = 'Card',
  PHONEPE = 'PhonePe',
  UPI = 'UPI',
  OTHER = 'Other',
  // Represents an unknown payment method
}

// Enum for Visit Types
export enum VisitType {
  IN_PATIENT = 'In-Patient',
  OUT_PATIENT = 'Out-Patient',
}

// Enum for Visit Statuses
export enum VisitStatus {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
  Collected = 'Collected',
}

// Enum for Blood Groups
export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  UNKNOWN = 'UNKNOWN', // Represents an unknown blood group
}
