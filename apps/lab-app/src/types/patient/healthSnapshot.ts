export interface HealthSnapshotTestResult {
  reportId: number;
  reportCode: string;
  visitId: number;
  visitCode: string;
  visitDate: string;
  enteredValue: string;
  unit: string;
  referenceRange: string;
  referenceAgeRange: string;
  testRows: Array<{
    testParameter: string;
    normalRange: string;
    enteredValue: string;
    unit: string;
    referenceAgeRange: string;
  }>;
  createdAt: string;
}

export interface HealthSnapshotTest {
  testName: string;
  testCategory: string;
  totalVisits: number;
  results: HealthSnapshotTestResult[];
}

export interface HealthSnapshot {
  patient: {
    patientId: number;
    patientCode: string;
    firstName: string;
    lastName: string;
    age: string;
    gender: string;
    bloodGroup: string;
  };
  totalTests: number;
  tests: HealthSnapshotTest[];
}
