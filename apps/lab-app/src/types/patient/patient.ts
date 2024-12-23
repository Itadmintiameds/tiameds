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
    dateOfBirth: string;
    visit?: Visit;
}


export interface Visit {
    visitDate: string;
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
    paymentStatus: string;
    paymentMethod: string;
    paymentDate: string;
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
