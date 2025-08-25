
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

// Test result interface for individual test results
export interface TestResult {
    id: number;
    testId: number;
    isFilled: boolean;
    reportStatus: string;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

// export interface VisitSampleList {
//     visitId: number;
//     patientname: string;
//     visitDate: string;
//     visitStatus: string;
//     sampleNames: string[];
//     testIds: number[];
//     packageIds: number[];
// }

export interface VisitSampleList {
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
    dateOfBirth?: string;
    testResult?: TestResult[]; // Add testResult array
}

// export interface PatientData {
//     visitId: number;
//     patientname: string;
//     gender: string;
//     contactNumber: string;
//     email: string;
//     visitDate: string;
//     visitStatus: string;
//     sampleNames: string[];
//     testIds: number[];
//     packageIds: number[];
//     dateOfBirth?: string;
//   }

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
  dateOfBirth?: string;
  visitType?: string; // Optional field for visit type
  doctorId?: number; // Optional field for doctor ID
  doctorName?: string; // Optional field for doctor name
}
  
export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}