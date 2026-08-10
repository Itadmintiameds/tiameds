
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
    reportId?: number;
}

// Per-test completion status, narrowed to the fields the sample API and the patient-visit
// API agree on -- their full TestResult shapes differ (patient/patient.ts makes `id`
// optional, this file requires it), so a consumer that only cares about completion takes
// this instead and both are assignable to it.
export interface VisitTestStatus {
    testId: number;
    reportStatus: string;
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
    visitCode?: string;
    patientId?: number;
    patientname: string;
    gender: string;
    contactNumber: string;
    email: string;
    visitDate: string;
    visitStatus: string;
    sampleNames: string[];
    testIds?: number[];
    tests?: Array<{
        id: number;
        name: string;
    }>;
    packageIds: number[];
    dateOfBirth?: string;
    testResult?: TestResult[]; // Add testResult array
    doctorName?: string;
    visitType?: string;
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
  patientId?: number; // Needed to fetch patient-scoped data (e.g. health snapshot)
  patientname: string;
  gender: string;
  contactNumber: string;
  email: string;
  visitDate: string;
  visitStatus: string;
  sampleNames: string[];
  testIds?: number[];
  tests?: Array<{
    id: number;
    name: string;
  }>;
  packageIds: number[];
  dateOfBirth?: string;
  visitType?: string; // Optional field for visit type
  doctorId?: number; // Optional field for doctor ID
  doctorName?: string; // Optional field for doctor name
  visitCode?: string;
  // Per-test completion state for this visit. The shared report view uses it to decide
  // whether every ordered test is done -- AI Clinical Observations are only generated
  // for a 100% complete order (see CommonReportView2).
  testResult?: VisitTestStatus[];
}
  
export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}