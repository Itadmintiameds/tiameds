export interface BillingDetails {
  billingId: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
  discount: number;
  netAmount: number;
  discountReason: string;
  discountPercentage: number;
}

export interface VisitDetailDto {
  visitId: number;
  visitDate: string;
  visitType: string;
  visitStatus: string;
  doctorId: number | null;
  testIds: number[];
  packageIds: number[];
  bellingDetailsDto: BillingDetails;
  listofeachtestdiscount: string[];
}



export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  dateOfBirth: string;
  gender: string;
  visitDetailDto: VisitDetailDto;
  email?: string;
  phone?: string;
  address?: string;
  bloodGroup?: string;
  patientStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Test {
  id: number;
  name: string;
  category: string;
  price: number;
}

export interface HealthPackage {
  id: number;
  packageName: string;
  price: number;
  discount: number;
  netPrice: number;
  tests: Test[];
}



export interface DropdownOption {
  options: { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  buttonClassName: string;
  menuClassName: string;
  icon: React.ReactNode;
}


export type DateFilterOption = 'today' | 'yesterday' | 'last7days' | 'thisMonth' | 'thisYear' | 'custom';