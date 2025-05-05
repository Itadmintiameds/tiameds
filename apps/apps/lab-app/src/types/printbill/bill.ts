export interface Test {
    name: string;
    category: string;
    price: number;
}

export interface HealthPackage {
    packageName: string;
    price: number;
    discount: number;
    netPrice: number;
    tests: Test[];
}

export interface LabDetails {
    logo: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    gstn: string;
    invoiceId: string;
}

export interface PatientDetails {
    name: string;
    age: number;
    email: string;
    phone: string;
    address: string;
    bloodGroup: string;
    patientId: string;
    Gender: string;
}
export interface Bill {
    lab: LabDetails;
    totalAmount: number;
    discount: number;
    gstRate: number;
    gstAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    netAmount: number;
    paymentStatus: string;
    paymentMethod: string;
    paymentDate: string;
    tests: Test[];
    healthPackages: HealthPackage[] | undefined;
    patient: PatientDetails;
}
