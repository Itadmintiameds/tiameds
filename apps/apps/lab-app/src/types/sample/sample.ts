
export interface SampleList {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface Sample {
    visitId: number;
    sampleNames: string[];
}

export interface VisitSampleList {
    visitId: number;
    patientname: string;
    visitDate: string;
    visitStatus: string;
    sampleNames: string[];
    testIds: number[];
    packageIds: number[];
}

export interface PatientData {
    visitId: number;
    patientname: string;
    gender: string;
    contactNumber: string;
    email: string;
    visitDate: string;
    visitStatus: string;
    sampleNames: string[];
    testIds: number[];
    packageIds: number[];
    dateOfBirth: string;
  }
  
export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}