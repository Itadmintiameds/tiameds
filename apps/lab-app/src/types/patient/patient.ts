export interface Patient {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    bloodGroup: string;
    dateOfBirth: string;  // Keeping as string because the data is a string in your example
    visit?: Visit;
}

export interface Visit {
    visitDate: string;  // Keeping as string to match the provided data format
    visitType: string;
    visitStatus: string;
    visitDescription: string;
    doctorId: number;
    testIds: number[];
    packageIds: number[];
    insuranceIds: number[];
    billing: Billing;
}

export interface Billing {
    totalAmount: number;
    paymentStatus?: string;  // Optional if payment details are not always present
    paymentMethod?: string;  // Optional if payment method is not always provided
    paymentDate?: string;  // Keeping as string to match the provided data format
    discount: number;
    gstRate: number;
    gstAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    netAmount: number;
}
export interface PatientTabItem {
    id: string;
    label: string;
    icon: JSX.Element;
}







