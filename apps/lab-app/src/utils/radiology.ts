import { TestReferancePoint } from '@/types/test/testlist';

// Name patterns for radiology/imaging tests (not used by isRadiologyTest, which is category-only).
export const RADIOLOGY_PATTERNS = [
  /\bRADIOLOGY\b/i,
  /\bX[\s-]?RAY\b/i,
  /\bUSG\b/i,
  /\bULTRASOUND\b/i,
  /\bCT\b/i,
  /\bMRI\b/i,
  /\bPET\b/i,
  /\bMAMMO(?:GRAPHY)?\b/i,
  /\bDOPPLER\b/i,
  // ultrasound naming used by the lab's USG formats
  /\bHRUS\b/i,
  /\bSONO(?:GRAPHY|MAMMOGRAPHY)?\b/i,
  /\bTRUS\b/i,
  /\bTVS\b/i,
  /\bTIFFA\b/i,
  /\bSCAN\b/i,
];

// Only the category decides: a name like "CT" also exists in Hematology (clotting time), so
// name matching would show radiology formats for lab tests.
export const isRadiologyTest = (_testName?: string, testCategory?: string) =>
  (testCategory || '').trim().toUpperCase() === 'RADIOLOGY';

// Placeholder DETAILED REPORT reference row for radiology tests that have no report template
// configured, so the report editor (and its format library) can still be used for them.
export const createRadiologyReportPoint = (testName: string, category?: string): TestReferancePoint => ({
  id: -1,
  category: category || 'RADIOLOGY',
  testName,
  testDescription: 'DETAILED REPORT',
  units: '',
  gender: 'MF',
  minReferenceRange: 0,
  maxReferenceRange: 0,
  ageMin: 0,
  ageMax: 100,
  minAgeUnit: 'YEARS',
  maxAgeUnit: 'YEARS',
  reportJson: '',
});

export const hasDetailedReportPoint = (points: TestReferancePoint[]) =>
  points.some(point => (point.testDescription || '').toUpperCase() === 'DETAILED REPORT');
